// COSA VEDE CHI SIEDE A QUESTO POSTO.
//
// Oggi il client scarica l'episodio INTERO — `webapp/data/epN.json`, soluzione
// compresa — e si fida di non guardarlo. Finche' lo schermo e' uno solo e lo
// tiene chi arbitra la cosa e' teorica; con quattro telefoni collegati smette
// di esserlo, e basta apire i devtools per sapere dov'e' il prigioniero.
//
// Qui si filtra PRIMA di spedire. Il filtro gira dove sta il motore — nel
// Durable Object — quindi non c'e' niente da aggirare: cio' che non passa non
// e' mai arrivato sul dispositivo.
//
//   vista(stato, dati, posto) -> { stato, dati }   gia' potati
//
// `posto` e' { ruolo: 'arbitro' } oppure { ruolo: 'giocatore', eroe }.
//
// LA REGOLA GENERALE: l'arbitro vede tutto, il giocatore vede quello che al
// tavolo vedrebbe con gli occhi. La salute dei compagni e' pubblica (si guarda
// la scheda), le tessere rivelate sono sul tabellone, i nemici in campo pure.
// Non lo sono: le carte non ancora pescate, il testo delle stanze non aperte,
// le insidie che non sono scattate, e la busta della soluzione.

export const eArbitro = (posto) => !posto || posto.ruolo === 'arbitro';

// I DATI D'EPISODIO potati. E' la meta' che pesa: la soluzione sta qui.
export function datiPerPosto(dati, stato, posto) {
  if (eArbitro(posto)) return dati;
  const sp = stato.spedizione || {};
  const rivelate = new Set(sp.rivelate || []);
  const visitati = new Set((stato.indagine || {}).visitati || []);
  const ep = dati.ep;

  return {
    ...dati,
    ep: {
      ...ep,
      // LA BUSTA NON SI APRE DAL TELEFONO.
      soluzione: undefined,
      // ...ma LE DOMANDE si': non sono un segreto — il Taccuino stampato le ha
      // tutte — e da quando il telefono E' il taccuino, senza di quelle chi
      // gioca non ha su cosa ragionare. Passano i soli TESTI, in un campo suo:
      // resuscitare `soluzione` con dentro meno roba renderebbe inutile la
      // regola «il campo soluzione non passa mai», che e' facile da controllare
      // proprio perche' non ha eccezioni.
      domande: (((ep.soluzione || {}).domande) || []).map((d) => ({ q: d.q,
                                                                    dopo_spedizione: d.dopo_spedizione })),
      // L'EPILOGO, IL FRAMMENTO E IL BIVIO SONO LA SOLUZIONE, in prosa: dicono
      // chi era, cosa c'era sotto e cosa avete trovato sull'altare. Mandarli a
      // meta' partita e' l'esatto contrario del gioco.
      //
      // Ma A SERATA FINITA sono la ricompensa, e la ricompensa e' di tutti: chi
      // ha giocato dal telefono deve poterli leggere sul suo schermo, non
      // sentirseli riassumere. Il cancello e' l'esito — lo stesso che apre
      // l'epilogo — quindi non c'e' un secondo stato da tenere allineato.
      ...(sp.esito ? {} : { epilogo: undefined, frammento: undefined, bivio: undefined }),
      // I LUOGHI non visitati sono nomi sulla mappa e basta. Il testo, la
      // chiave della porta, gli indizi e gli Approfondimenti arrivano quando
      // il gruppo ci e' entrato — cioe' quando li ha sentiti leggere.
      luoghi: (ep.luoghi || []).map((l) => (visitati.has(l.n) ? l : {
        n: l.n, nome: l.nome, voce_mappa: l.voce_mappa, art: l.art,
        aperto: l.aperto, apre: l.apre, chiude: l.chiude,
      })),
      // LE TESSERE non rivelate sono un rettangolo coperto. `testo` e `cerca`
      // sono quel che si scopre entrandoci; `arbitro` e' una nota di regia e
      // non esce mai da qui.
      tessere: (ep.tessere || []).map((t) => (rivelate.has(t.id) ? { ...t, arbitro: undefined } : {
        id: t.id, exits: t.exits, start: t.start,
      })),
    },
    // LE CARTE. Qui stava il buco piu' insidioso, e l'ha trovato il setaccio:
    // le carte-Approfondimento portano il loro TESTO, e in quel testo c'e' la
    // risposta a una delle Domande. Potare i luoghi non bastava — la stessa
    // frase arrivava per un'altra strada.
    //
    // Al giocatore servono la propria scheda e le carte delle cose che il
    // gruppo ha davvero in mano. Gli Approfondimenti non letti, i luoghi non
    // visitati e le carte Minaccia non pescate restano dall'altra parte.
    carte: cartePerPosto(dati.carte, stato, visitati),
    comune: comunePerPosto(dati.comune, sp),
  };
}

// LE SCHEDE DEI NEMICI. Statistiche e nome passano sempre — servono a leggere
// il diario, e una miniatura in campo ha il nome scritto sopra. La `bio` no,
// finche' quel nemico non e' comparso: e' la prosa del bestiario, e per quattro
// episodi contiene la risposta a una Domanda. L'ha trovata il setaccio, non io:
// «Il Custode della Cera lo ferma il diapason d'argento» E' la risposta alla
// quarta Domanda dell'Ep.1.
function comunePerPosto(comune, sp) {
  if (!comune) return comune;
  const comparsi = new Set((sp.nemici || []).map((n) => n.nome));
  return {
    ...comune,
    nemici: (comune.nemici || []).map((n) => (comparsi.has(n.nome) ? n : { ...n, bio: undefined })),
  };
}

function cartePerPosto(carte, stato, visitati) {
  if (!carte) return carte;
  const inMano = new Set(((stato.indagine || {}).oggetti || []).map((o) => String(o).toUpperCase()));
  // `approfondimentiLetti` e' una lista di OGGETTI `{n, tipo, soggetto}`: con
  // `String(x)` diventavano tutti «[object Object]» e non combaciavano con
  // nessun titolo. Il risultato non era un errore — era una sezione «quel che
  // avete gia' sentito» perennemente vuota sul telefono, anche per gli
  // Approfondimenti letti ad alta voce davanti a tutti.
  const letti = new Set(((stato.indagine || {}).approfondimentiLetti || [])
    .map((x) => (x && typeof x === 'object' ? x.soggetto : x)).filter(Boolean));
  const perEp = (mappa, tieni) => Object.fromEntries(
    Object.entries(mappa || {}).map(([ep, lista]) => [ep, (lista || []).filter(tieni)]));

  return {
    // le schede degli eroi: pubbliche, sono in mano ai giocatori
    eroi_carte: carte.eroi_carte,
    // gli oggetti che il gruppo ha preso
    oggetti_carte: perEp(carte.oggetti_carte, (c) => inMano.has(String(c.title).toUpperCase())
      || [...inMano].some((o) => String(c.title).toUpperCase().includes(o))),
    // gli Approfondimenti gia' letti ad alta voce: quelli si sono sentiti
    approfondimenti_carte: perEp(carte.approfondimenti_carte,
      (c) => [...letti].some((x) => String(c.title).includes(x))),
    // i luoghi visitati
    luoghi_carte: perEp(carte.luoghi_carte,
      (c) => [...visitati].some((n) => String(c.title).startsWith(`${n} ·`))),
    // le carte Minaccia NON passano: il mazzo e' il segreto del round dopo
  };
}

// LO STATO potato.
export function statoPerPosto(stato, posto) {
  if (eArbitro(posto)) return stato;
  const sp = stato.spedizione || {};
  return {
    ...stato,
    indagine: {
      ...(stato.indagine || {}),
      // le risposte che il gruppo ha scritto restano; la verifica no
      risposteEsatte: undefined,
    },
    spedizione: {
      ...sp,
      // L'ORDINE DEL MAZZO e' il segreto piu' ghiotto: da li' si sa cosa
      // arriva. Passa solo QUANTE carte restano, che al tavolo si vede dallo
      // spessore del mazzo.
      mazzo: sp.mazzo ? { restano: Math.max(0, sp.mazzo.ordine.length - sp.mazzo.indice),
                          rimescolato: sp.mazzo.rimescolato || 0 } : null,
      // LE INSIDIE non ancora scattate sono trappole: dirle in anticipo le
      // annulla. Quelle scattate restano — il gruppo le ha viste.
      insidie: sp.insidie || {},
      // L'USCITA SEGRETA: si sa la STANZA (il prigioniero la indica), non
      // l'arredo. Finche' non e' aperta, la cella resta nascosta.
      uscita: sp.uscita && sp.uscita.aperta ? sp.uscita : null,
      // gli arredi gia' tentati sono pubblici: il gruppo li ha frugati insieme
      uscitaTentati: sp.uscitaTentati || [],
    },
    // il posto lo si porta con se': serve alla vista per sapere chi e'
    posto,
  };
}

export function vista(stato, dati, posto) {
  return { stato: statoPerPosto(stato, posto), dati: datiPerPosto(dati, stato, posto) };
}

// Un setaccio, per i test e per chi un giorno aggiungera' un campo: dice se in
// un oggetto e' rimasto qualcosa che somiglia a un segreto. Non e' una
// sicurezza — e' un allarme che suona quando la proiezione resta indietro
// rispetto ai dati.
export function cercaSegreti(oggetto, ep) {
  const testo = JSON.stringify(oggetto || {});
  const trovati = [];
  const risposte = ((ep.soluzione || {}).domande || []).map((d) => d.risposta).filter(Boolean);
  for (const r of risposte) {
    // si cerca un pezzo lungo della risposta: le parole singole capitano
    // dappertutto, una frase di quindici caratteri no
    const pezzo = String(r).slice(0, 15);
    if (pezzo.length >= 10 && testo.includes(pezzo)) trovati.push(`risposta «${pezzo}…»`);
  }
  // NB `"boss":` no: quel campo esiste anche su ogni nemico di comune.json
  // (dice se e' un boss), ed e' pubblico. Si cerca la BUSTA, non la parola.
  if (testo.includes('"soluzione"')) trovati.push('il campo soluzione');
  return trovati;
}
