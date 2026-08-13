// LA PARTITA VIVA: un Durable Object per tavolo.
//
// Fin qui il motore girava nel browser di chi arbitra, e i salvataggi su D1
// erano una copia che si allineava quando poteva. Con piu' dispositivi sulla
// stessa serata quel modello non regge: due scrittori sullo stesso blob, e
// vince chi salva per ultimo.
//
// Qui l'autorita' e' una sola. I comandi arrivano, il motore li applica, e lo
// stato nuovo viene spedito a ognuno POTATO PER IL SUO POSTO — l'arbitro vede
// tutto, il giocatore quel che al tavolo vedrebbe con gli occhi. Il filtro gira
// qui dentro, quindi non c'e' niente da aggirare coi devtools.
//
// Perche' un Durable Object e non un endpoint qualunque: le richieste per lo
// stesso tavolo finiscono tutte sullo stesso oggetto, in ordine, senza che due
// comandi si pestino. E' la stessa ragione per cui al tavolo il tabellone e'
// uno solo.
//
// LO STATO VIVE QUI, il salvataggio su D1 resta il backup: si scrive ai
// CHECKPOINT (fine round, fine partita, e comunque non piu' di una volta ogni
// tanto), nello stesso formato blob di prima — cosi' `store.js`, `sync.js` e la
// schermata «continua» continuano a funzionare per tutto cio' che non e' in
// corso.
import { DurableObject } from 'cloudflare:workers';
import { applica } from '../public/motore/comandi.js';
import { vista } from '../public/motore/proiezione.js';
import { episodioColBivio } from '../public/motore/bivi.js';

// Ogni quanto la partita viva scende su D1. Non a ogni comando: un round di
// spedizione ne fa decine, e il backup non e' la verita' — e' la rete per
// quando il Durable Object viene sfrattato.
const CHECKPOINT_MS = 20_000;

export class Partita extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    // le sessioni WebSocket, con il posto attaccato: l'hibernation le
    // sopravvive, e il posto si rilegge dagli attachment
    this.sessioni = new Map();
  }

  // ------------------------------------------------------------- lo stato
  async leggi() {
    if (this.stato === undefined) this.stato = (await this.ctx.storage.get('partita')) || null;
    return this.stato;
  }

  async scrivi(stato, { subito } = {}) {
    this.stato = stato;
    await this.ctx.storage.put('partita', stato);
    const ora = Date.now();
    if (subito || !this.ultimoCheckpoint || ora - this.ultimoCheckpoint > CHECKPOINT_MS) {
      this.ultimoCheckpoint = ora;
      this.ctx.waitUntil(this.versoD1(stato));
    }
  }

  // Il backup su D1, nello stesso formato di sempre. Se fallisce non si perde
  // la partita — quella e' qui — quindi non si propaga l'errore a chi gioca.
  async versoD1(stato) {
    try {
      const tavolo = (await this.ctx.storage.get('tavolo')) || stato.tavolo;
      if (!tavolo || !this.env.DB) return;
      await this.env.DB.prepare(
        `INSERT INTO salvataggi (tavolo, episodio, aggiornato, dati) VALUES (?, ?, ?, ?)
         ON CONFLICT(tavolo, episodio) DO UPDATE
           SET aggiornato = excluded.aggiornato, dati = excluded.dati
           WHERE excluded.aggiornato > salvataggi.aggiornato`)
        .bind(tavolo, stato.episodio, Date.now(), JSON.stringify(stato)).run();
    } catch (e) {
      console.error('checkpoint su D1 fallito (la partita resta nel DO):', e.message);
    }
  }

  // --------------------------------------------------------------- l'ingresso
  async fetch(request) {
    const url = new URL(request.url);
    // il Worker ha gia' verificato Access E l'appartenenza al tavolo: qui il
    // posto si prende per buono, ma NON arriva mai dal client — il Worker lo
    // scrive negli header dopo averlo letto da `membri`
    const posto = {
      ruolo: request.headers.get('X-Osr-Ruolo') === 'arbitro' ? 'arbitro' : 'giocatore',
      eroe: request.headers.get('X-Osr-Eroe') || null,
      email: request.headers.get('X-Osr-Email') || null,
    };

    if (url.pathname.endsWith('/ws')) return this.apriWebSocket(request, posto);
    if (url.pathname.endsWith('/comando')) return this.comando(request, posto);
    if (url.pathname.endsWith('/stato')) return this.statoPerChi(posto);
    if (url.pathname.endsWith('/apri')) return this.apri(request, posto);
    return Response.json({ errore: 'endpoint sconosciuto nel tavolo' }, { status: 404 });
  }

  // Comincia (o riprende) una partita, E LA AGGIORNA.
  //
  // Nell'Indagine agisce una mano sola — quella di chi arbitra — quindi non
  // serve un vocabolario di comandi: serve che lo stato nuovo arrivi ai
  // telefoni POTATO PER IL LORO POSTO. Questa e' la via, ed e' per questo che
  // ora SPARGE: prima scriveva e taceva, e chi era collegato non vedeva
  // muoversi niente finche' non arrivava un comando di Spedizione.
  //
  // La SECONDA serratura sul ruolo. La prima e' nel Worker
  // (`tavolo.js`: `if (cosa === 'apri' && posto.ruolo !== 'arbitro')`, che
  // risponde 404 — a chi non siede al tavolo non si dice nemmeno che esiste).
  // Questa e' qui perche' `apri` non e' piu' l'apertura della plancia: e' la
  // via con cui la serata AVANZA, e un giro solo di guardia su una porta del
  // genere e' un giro solo da dimenticare il giorno che si aggiunge una
  // scorciatoia.
  async apri(request, posto) {
    if (posto && posto.ruolo !== 'arbitro') {
      return Response.json({ rifiuto: { motivo: 'La serata la apre chi arbitra.' } }, { status: 403 });
    }
    const { stato, tavolo } = await request.json();
    await this.ctx.storage.put('tavolo', tavolo);
    const esistente = await this.leggi();
    // NON SI SOVRASCRIVE UNA PARTITA IN CORSO CON UNA PIU' VECCHIA: chi si
    // ricollega manda quel che aveva, e quel che aveva puo' essere indietro.
    //
    // Ma il confronto vale SOLO FRA LO STESSO EPISODIO. Se chi arbitra apre
    // un'altra serata, quella e' la serata — anche se e' una vecchia che si
    // riprende, col suo timbro di settimane fa. Confrontando i timbri senza
    // guardare l'episodio, il tavolo sarebbe rimasto sulla serata di prima e i
    // telefoni con lei: chi conduce avrebbe cambiato episodio e nessuno lo
    // avrebbe seguito.
    //
    // E vale solo FRA LA STESSA PARTITA, non fra lo stesso episodio: `creata` e'
    // il momento in cui quella serata e' nata (`store.nuovaPartita`) e non
    // cambia mai. Ricominciare da capo fa una serata NUOVA, con un `creata`
    // nuovo, ed e' quella che conta anche se il timbro dicesse il contrario.
    //
    // Il timbro non puo' decidere da solo perche' NON VIENE DA UN OROLOGIO
    // SOLO: qui lo mette il server (`comando`), di la' il browser di chi
    // arbitra. In locale i due clock sono lo stesso e non si vede niente; in
    // produzione bastano pochi secondi di scarto e una serata ricominciata
    // veniva rifiutata in silenzio — chi arbitra ripartiva dall'Indagine e i
    // telefoni restavano nella Spedizione di prima.
    const stessaPartita = esistente
      && esistente.episodio === stato.episodio
      && (esistente.creata || 0) === (stato.creata || 0);
    if (stessaPartita && (esistente.aggiornato || 0) >= (stato.aggiornato || 0)) {
      return Response.json({ ok: true, ripresa: true });
    }
    await this.scrivi(stato, { subito: true });
    // niente `eventi`: qui non c'e' un copione da mettere in scena, c'e' uno
    // stato nuovo da guardare. Chi lo riceve ridisegna e basta.
    this.spargi({ stato, eventi: [] }, await this.dati(stato.episodio, stato.bivi), null);
    return Response.json({ ok: true, ripresa: false });
  }

  async statoPerChi(posto) {
    const stato = await this.leggi();
    if (!stato) return Response.json({ errore: 'nessuna partita aperta' }, { status: 404 });
    const dati = await this.dati(stato.episodio, stato.bivi);
    return Response.json(vista(stato, dati, posto));
  }

  async comando(request, posto) {
    const stato = await this.leggi();
    if (!stato) return Response.json({ errore: 'nessuna partita aperta' }, { status: 404 });
    const cmd = await request.json();

    // IL TIRO D'INDAGINE non passa da `comandi.applica`: l'Indagine non ha un
    // motore a comandi, e non le serve — agisce una mano sola. Qui arriva una
    // cosa sola, l'esito di una prova che il tavolo aspettava da un telefono, e
    // si scrive dove chi arbitra la sta guardando.
    //
    // Lo manda SOLO chi ha quell'eroe: e' il tiro del suo personaggio, e un
    // altro che lo mandasse tirerebbe al posto suo.
    if (cmd.tipo === 'prova-indagine') return this.provaIndagine(stato, cmd, posto);

    // CHI PUO' MUOVERE COSA. Un giocatore comanda il SUO eroe e nessun altro:
    // e' la regola che rende sensato dare a ognuno un dispositivo. L'arbitro
    // muove chiunque — e' lui che tiene in mano gli eroi non reclamati.
    if (posto.ruolo !== 'arbitro') {
      if (cmd.eroe && cmd.eroe !== posto.eroe) {
        return Response.json({ rifiuto: { motivo: `${cmd.eroe} non è il tuo eroe.` } }, { status: 403 });
      }
      if (COMANDI_DI_ARBITRO.has(cmd.tipo)) {
        return Response.json({ rifiuto: { motivo: 'Questo lo fa chi arbitra.' } }, { status: 403 });
      }
    }

    const dati = await this.dati(stato.episodio, stato.bivi);
    const out = applica(stato, cmd, dati);
    if (out.rifiuto) return Response.json({ rifiuto: out.rifiuto }, { status: 409 });

    out.stato.aggiornato = Date.now();
    await this.scrivi(out.stato, { subito: !!out.stato.spedizione.esito });
    this.spargi(out, dati, cmd.rif);
    return Response.json({ ...vista(out.stato, dati, posto), eventi: out.eventi, rif: cmd.rif });
  }

  async provaIndagine(stato, cmd, posto) {
    const pend = (stato.indagine || {}).pendenza;
    if (!pend || pend.id !== cmd.id) {
      // gia' risolta: chi arbitra ha tirato lui, o due tocchi sono partiti
      // insieme. Non e' un errore da mostrare — e' una corsa persa.
      return Response.json({ ok: true, tardi: true });
    }
    if (posto.ruolo !== 'arbitro' && pend.a !== posto.eroe) {
      return Response.json({ rifiuto: { motivo: `${pend.a} non è il tuo eroe.` } }, { status: 403 });
    }
    stato.indagine.pendenza = { ...pend, esito: cmd.esito };
    stato.aggiornato = Date.now();
    await this.scrivi(stato);
    this.spargi({ stato, eventi: [] }, await this.dati(stato.episodio, stato.bivi), null);
    return Response.json({ ok: true });
  }

  // Manda a ogni sessione la SUA vista. Non si spedisce lo stato intero e poi
  // si filtra sul client: quello sarebbe averlo gia' mandato.
  //
  // `rif` e' il contrassegno di chi ha mandato il comando, e torna indietro con
  // la spinta. Serve perche' chi comanda riceve la risposta DUE volte — una
  // come risposta e una come spinta — e riprodurre due volte gli eventi
  // farebbe tirare i dadi due volte a schermo. Si contrassegna il comando e non
  // la sessione perche' la stessa persona puo' avere due schede aperte: l'altra
  // deve aggiornarsi, e con un filtro per email non lo farebbe.
  spargi(out, dati, rif) {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        const posto = ws.deserializeAttachment() || { ruolo: 'giocatore' };
        ws.send(JSON.stringify({ ...vista(out.stato, dati, posto), eventi: out.eventi, rif }));
      } catch { /* una sessione morta non ferma le altre */ }
    }
  }

  async apriWebSocket(request, posto) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('serve un upgrade a websocket', { status: 426 });
    }
    const coppia = new WebSocketPair();
    const [client, server] = Object.values(coppia);
    // hibernation: il Durable Object puo' dormire fra un comando e l'altro
    // senza chiudere le connessioni, e al risveglio ritrova chi era chi
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(posto);
    const stato = await this.leggi();
    if (stato) {
      const dati = await this.dati(stato.episodio, stato.bivi);
      server.send(JSON.stringify(vista(stato, dati, posto)));
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  // I messaggi in arrivo dai client: gli stessi comandi dell'endpoint HTTP.
  async webSocketMessage(ws, messaggio) {
    const posto = ws.deserializeAttachment() || { ruolo: 'giocatore' };
    let cmd;
    try { cmd = JSON.parse(messaggio); } catch { return; }
    const finto = new Request('https://tavolo/comando', {
      method: 'POST',
      headers: {
        'X-Osr-Ruolo': posto.ruolo, 'X-Osr-Eroe': posto.eroe || '',
        'X-Osr-Email': posto.email || '',
      },
      body: JSON.stringify(cmd),
    });
    const r = await this.comando(finto, posto);
    // il rifiuto torna a chi l'ha chiesto e a nessun altro: sbagliare un
    // comando non e' una notizia per il tavolo
    if (r.status !== 200) ws.send(await r.text());
  }

  async webSocketClose(ws) { try { ws.close(); } catch { /* gia' chiusa */ } }

  // I dati dell'episodio, letti UNA volta e tenuti: sono immutabili per tutta
  // la serata, e sono la parte pesante.
  //
  // I BIVI SI APPLICANO ANCHE QUI, e non e' un di piu': la Fase Minaccia legge
  // `ep.pool` per sapere quanti Sgherri esistono, e un Bivio quel numero lo
  // sposta. Se il client li applicasse e il Durable Object no, i due
  // giocherebbero due episodi diversi senza dirselo — che e' esattamente il
  // modo in cui questa partita si e' gia' rotta tre volte.
  async dati(episodio, bivi) {
    if (!this._dati || this._dati.id !== episodio) {
      const prendi = async (n) => (await this.env.ASSETS.fetch(`https://tavolo/data/${n}.json`)).json();
      const [ep, comune, carte] = await Promise.all([prendi(episodio), prendi('comune'), prendi('carte')]);
      this._dati = { id: episodio, ep, comune, carte };
    }
    return { ep: episodioColBivio(this._dati.ep, bivi), comune: this._dati.comune, carte: this._dati.carte };
  }
}

// Cose che restano di chi conduce: la notte, la pesca, e chiudere la serata.
// Cose che restano di chi conduce: la notte, la pesca, chiudere la serata — e i
// PNG liberati, che non sono l'eroe di nessuno e non hanno un posto al tavolo.
const COMANDI_DI_ARBITRO = new Set(['fase-nemici', 'fase-minaccia', 'inizia', 'chiudi',
                                    'carta-vista', 'muovi-scortato']);
