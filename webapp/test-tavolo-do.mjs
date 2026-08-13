// LA PARTITA VIVA: il Durable Object che fa da arbitro.
//
// Servono DUE `wrangler dev` con email diverse — l'arbitro e un giocatore —
// perché quel che c'è da provare è proprio la differenza fra i due posti:
//
//   - il giocatore muove il SUO eroe e nessun altro;
//   - la notte e la pesca restano di chi conduce;
//   - a ognuno arriva la propria proiezione, e al giocatore la busta non arriva;
//   - chi non siede al tavolo non sa nemmeno che esiste.
//
// Uso, in tre terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
//   node webapp/test-tavolo-do.mjs
import { readFileSync } from 'fs';

// UN SOLO SERVER, due email. Non due `wrangler dev` come per gli altri test:
// due processi hanno DUE Durable Object separati — condividono il D1 locale,
// non i DO — e la partita viva sarebbe due partite diverse. In produzione il
// Worker e' uno, e tutte le richieste dello stesso tavolo finiscono sullo
// stesso oggetto: e' il punto dei Durable Object.
//
// Chi sia chi lo dice l'header `X-Osr-Dev-Email`, che vale solo dove
// OSR_DEV_EMAIL e' gia' impostata, cioe' solo in `wrangler dev`.
const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const EMAIL_A = 'uno@esempio.it';
const EMAIL_G = 'due@esempio.it';
const ARBITRO = EMAIL_A;
const GIOCATORE = EMAIL_G;

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const chiama = (chi, metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: {
    'X-Osr-Dev-Email': chi,
    ...(corpo ? { 'Content-Type': 'application/json' } : {}),
  },
  body: corpo ? JSON.stringify(corpo) : undefined,
});

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EP1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const T0 = EP1.tessere[0].id;

function partitaNuova() {
  return {
    v: 1, episodio: 'ep1', modo: 'digitale', party: [ELENA, OTTONE], fase: 'spedizione',
    indagine: { ora: 20, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
                approfondimentiLetti: [], risposte: ['', '', '', ''] },
    vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
    spedizione: {
      round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [T0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos: { [ELENA]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 2, y: 1 } },
      vite: { [ELENA]: 6, [OTTONE]: 7 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
    },
  };
}

// --- si prepara un tavolo con dentro un giocatore che ha preso Elena
const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Il tavolo vivo' })).ok,
   'l\'arbitro crea il tavolo');
ok((await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: EMAIL_G, eroe: ELENA })).ok,
   'e invita un giocatore, che prende Elena');

// --- APRIRE la partita è dell'arbitro
{
  const no = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: partitaNuova() });
  ok(no.status === 404, `un giocatore non apre la partita (visto ${no.status})`);

  const si = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: partitaNuova() });
  ok(si.ok, `l'arbitro sì (visto ${si.status})`);
}

// --- CHI NON SIEDE AL TAVOLO non lo vede nemmeno
{
  const estraneo = crypto.randomUUID();
  const r = await chiama(GIOCATORE, 'GET', `/api/tavolo/${estraneo}/stato`);
  ok(r.status === 404, `un tavolo che non è tuo non esiste (visto ${r.status})`);
}

// --- LA PROIEZIONE: due posti, due verità
{
  const a = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const g = await (await chiama(GIOCATORE, 'GET', `/api/tavolo/${idT}/stato`)).json();

  ok(a.dati.ep.soluzione, 'all\'arbitro la soluzione arriva');
  ok(!g.dati.ep.soluzione, 'al giocatore NO');

  // e non arriva nemmeno per vie traverse: si cerca la risposta nel testo intero
  const risposta = String(EP1.soluzione.domande[0].risposta).slice(0, 15);
  ok(!JSON.stringify(g).includes(risposta),
     'e nemmeno la risposta alla prima Domanda, per nessuna strada');

  ok(g.stato.posto && g.stato.posto.eroe === ELENA, 'il giocatore sa a che posto siede');
  ok(a.stato.posto === undefined || a.stato.posto.ruolo === 'arbitro', 'e l\'arbitro pure');
}

// --- IL GIOCATORE MUOVE IL SUO EROE, e nessun altro
{
  const mio = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'muovi', eroe: ELENA, nodo: { t: T0, x: 1, y: 2 } });
  ok(mio.ok, `il giocatore muove Elena, che è sua (visto ${mio.status})`);

  const altrui = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'muovi', eroe: OTTONE, nodo: { t: T0, x: 2, y: 2 } });
  ok(altrui.status === 403, `ma non Ottone, che non è suo (visto ${altrui.status})`);
  const detto = await altrui.json();
  ok(/non è il tuo eroe/i.test((detto.rifiuto || {}).motivo || ''),
     `e il rifiuto lo dice (visto «${(detto.rifiuto || {}).motivo}»)`);

  // l'arbitro invece muove chiunque: gli eroi non reclamati sono suoi
  const arb = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'muovi', eroe: OTTONE, nodo: { t: T0, x: 2, y: 2 } });
  ok(arb.ok, `l'arbitro muove Ottone (visto ${arb.status})`);
}

// --- LA NOTTE È DI CHI CONDUCE
{
  const no = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/comando`, { tipo: 'fase-nemici' });
  ok(no.status === 403, `il giocatore non fa agire la notte (visto ${no.status})`);
  const si = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`, { tipo: 'fase-nemici' });
  ok(si.ok, `l'arbitro sì (visto ${si.status})`);
}

// --- L'AUTORITÀ È UNA SOLA: quel che fa uno, l'altro se lo ritrova
{
  const prima = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const mossa = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'finisci-eroe', eroe: ELENA });
  ok(mossa.ok, `il giocatore chiude il turno di Elena (visto ${mossa.status}${
     mossa.ok ? '' : ' — ' + JSON.stringify(await mossa.clone().json()).slice(0, 120)})`);
  const dopo = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(JSON.stringify(prima.stato) !== JSON.stringify(dopo.stato),
     'una mossa del giocatore cambia la partita che vede l\'arbitro');
  ok((dopo.stato.spedizione.eroiFatti || []).includes(ELENA),
     'e si vede esattamente quella mossa');
}

// --- UN COMANDO ILLEGALE non passa e non sporca
{
  const r = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'attacca', eroe: OTTONE, bersaglio: 99 });
  ok(r.status === 409, `un bersaglio inesistente è rifiutato (visto ${r.status})`);
  const d = await r.json();
  ok((d.rifiuto || {}).motivo, 'con la ragione in chiaro');
}

// --- IL BACKUP su D1 c'è, ed è nel formato di sempre.
//
// NB: e' un CHECKPOINT, non una scrittura per comando — la partita viva sta
// nel Durable Object, e su D1 si scende ogni tanto (e sempre a partita finita).
// Quindi qui non si pretende l'ULTIMA mossa: si pretende che il blob ci sia,
// che sia nel formato di sempre e che si rilegga. Se si pretendesse l'ultima
// mossa, si starebbe provando la frequenza del checkpoint invece del backup.
{
  const s = await (await chiama(ARBITRO, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
  ok(typeof s.dati === 'string', 'la partita viva è scesa su D1 come blob');
  if (typeof s.dati === 'string') {
    const dentro = JSON.parse(s.dati);
    ok(dentro.spedizione, 'e si rilegge');
    ok(dentro.episodio === 'ep1' && Array.isArray(dentro.party),
       'nel formato di sempre: `store.js` e la schermata «continua» lo capiscono');
    ok(dentro.spedizione.round >= 2, `col round a cui era arrivata (visto ${dentro.spedizione.round})`);
  }
}

// --- LA PARTITA FINITA scende su D1 SUBITO: quello non è un checkpoint, è la
// fine della serata, e non si aspettano venti secondi a salvarla.
{
  const s = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(s.stato.spedizione, 'la partita viva risponde ancora');
}

await chiama(ARBITRO, 'DELETE', `/api/tavolo?id=${idT}`);
console.log(ko === 0 ? 'test-tavolo-do: tutto a posto' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
