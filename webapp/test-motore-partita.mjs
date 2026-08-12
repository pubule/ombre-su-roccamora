// UNA SPEDIZIONE GIOCATA SENZA SCHERMO.
//
// È la prova che tutta la Fase 1 esisteva per ottenere: il motore basta a se'
// stesso. Qui non c'e' un browser, non c'e' un DOM, non c'e' `digitale.js` —
// c'e' `applica()` e basta, e una partita comincia, avanza e finisce.
//
// Se questo test passa, un Durable Object puo' fare l'arbitro: e' esattamente
// lo stesso ambiente (nessun DOM, ESM, dati passati come argomento).
//
// E c'e' la seconda proprieta', quella che rende misurabile il bilanciamento:
// due partite con lo STESSO SEME sono identiche mossa per mossa. Senza, ogni
// percentuale di vittoria e' una stima su rumore.
//
// node webapp/test-motore-partita.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { raggEroe } from './public/motore/stat.js';
import { adiacGlob } from './public/motore/griglia.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));

function nuovaPartita(epId, seme, party) {
  const ep = JSON.parse(readFileSync(`webapp/data/${epId}.json`, 'utf8'));
  const t0 = ep.tessere[0].id;
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => {
    const e = COMUNE.eroi.find((x) => x.nome === n);
    eroiPos[n] = { t: t0, x: i % 4, y: 0 };
    vite[n] = e.salute;
  });
  const stato = {
    v: 1, episodio: epId, modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: ep.oggetti_indagine || [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme, passo: 0 },
    spedizione: {
      round: 1, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: (ep.scortato || []).map((s) => ({ liberato: false, pos: null,
                                                  vite: s.salute || 0, mosso: false })),
      mazzo: null, pendenza: null, insidie: {}, abilita: {},
    },
  };
  return [stato, { ep, comune: COMUNE, carte: CARTE }];
}

// Un bot minimo: attacca chi ha accanto, altrimenti si muove il piu' lontano
// possibile, altrimenti chiude il turno. Non deve giocare BENE — deve solo
// dimostrare che il motore risponde e la partita avanza.
function giocaRound(stato, dati) {
  let s = stato; let mosse = 0;
  for (const nm of s.party) {
    for (let az = 0; az < 3; az++) {
      if (s.spedizione.esito) return { stato: s, mosse };
      if ((s.spedizione.vite[nm] ?? 0) <= 0) break;
      if ((s.spedizione.eroiFatti || []).includes(nm)) break;

      const g = { ...dati, sp: s.spedizione, partita: s, _layout: null };
      const pos = s.spedizione.eroiPos[nm];

      // c'e' qualcuno da colpire?
      const i = s.spedizione.nemici.findIndex((n) => n.pos && !n.abbattuto && adiacGlob(g, pos, n.pos));
      let out = null;
      if (i >= 0) out = applica(s, { tipo: 'attacca', eroe: nm, bersaglio: i }, dati);
      if (!out || out.rifiuto) {
        const celle = Object.values(raggEroe(g, nm));
        if (celle.length) {
          const dove = celle[celle.length - 1];
          out = applica(s, { tipo: 'muovi', eroe: nm, nodo: dove.node, rivela: dove.reveal || null }, dati);
        }
      }
      if (!out || out.rifiuto) break;
      s = out.stato; mosse++;

      // la pendenza si scioglie prendendo la prima opzione
      while (s.spedizione.pendenza) {
        const p = s.spedizione.pendenza;
        const r = applica(s, { tipo: 'rispondi', scelta: p.opzioni[0].id, a: p.a }, dati);
        if (r.rifiuto) break;
        s = r.stato; mosse++;
      }
    }
    if (!s.spedizione.esito && !(s.spedizione.eroiFatti || []).includes(nm)) {
      const f = applica(s, { tipo: 'finisci-eroe', eroe: nm }, dati);
      if (!f.rifiuto) s = f.stato;
    }
  }
  if (!s.spedizione.esito) {
    const n = applica(s, { tipo: 'fase-nemici' }, dati);
    if (!n.rifiuto) s = n.stato;
  }
  return { stato: s, mosse };
}

function partitaIntera(epId, seme, party, maxRound = 30) {
  let [s, dati] = nuovaPartita(epId, seme, party);
  let mosseTot = 0;
  for (let r = 0; r < maxRound && !s.spedizione.esito; r++) {
    const out = giocaRound(s, dati);
    s = out.stato; mosseTot += out.mosse;
  }
  return { stato: s, mosse: mosseTot };
}

const PARTY = COMUNE.eroi.slice(0, 4).map((e) => e.nome);

// --- IL MOTORE BASTA A SE' STESSO: una partita gira senza DOM
{
  const { stato, mosse } = partitaIntera('ep1', 1234, PARTY);
  ok(mosse > 20, `la partita avanza davvero (${mosse} comandi applicati)`);
  ok(stato.spedizione.round > 3, `e i round passano (arrivata al ${stato.spedizione.round})`);
  ok(stato.spedizione.log.length > 10, `col suo diario (${stato.spedizione.log.length} righe)`);
  ok(stato.spedizione.rivelate.length > 1,
     `e la mappa si apre (${stato.spedizione.rivelate.length} tessere)`);
  ok(stato.rng.passo > 10, `il generatore ha tirato (${stato.rng.passo} numeri)`);
}

// --- LO STESSO SEME DA' LA STESSA PARTITA, mossa per mossa
{
  const a = partitaIntera('ep1', 777, PARTY);
  const b = partitaIntera('ep1', 777, PARTY);
  ok(JSON.stringify(a.stato) === JSON.stringify(b.stato),
     'due partite con lo stesso seme sono identiche fino all\'ultimo byte');
  ok(a.stato.spedizione.log.join('|') === b.stato.spedizione.log.join('|'),
     'compreso il diario, riga per riga');

  const c = partitaIntera('ep1', 778, PARTY);
  ok(JSON.stringify(c.stato) !== JSON.stringify(a.stato),
     'e con un altro seme la serata e\' un\'altra');
}

// --- LA RIPRESA A META' SERATA: si riparte da {seme, passo} e la partita
// continua identica. E' la riconnessione di un giocatore.
{
  let [s, dati] = nuovaPartita('ep1', 555, PARTY);
  for (let r = 0; r < 3; r++) s = giocaRound(s, dati).stato;

  // si salva, si ricarica da JSON (come farebbe D1), si prosegue
  const salvato = JSON.parse(JSON.stringify(s));
  let dritto = s, ripreso = salvato;
  for (let r = 0; r < 3; r++) {
    dritto = giocaRound(dritto, dati).stato;
    ripreso = giocaRound(ripreso, dati).stato;
  }
  ok(JSON.stringify(dritto) === JSON.stringify(ripreso),
     'ripresa da un salvataggio: la partita continua identica a chi non si e\' mai fermato');
}

// --- GIRA SU TUTTI E VENTUNO GLI EPISODI, non solo sul primo
{
  const id = ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)];
  let girati = 0, finiti = 0;
  const rotti = [];
  for (const epId of id) {
    try {
      const { stato, mosse } = partitaIntera(epId, 20260812, PARTY, 20);
      girati++;
      if (stato.spedizione.esito) finiti++;
      if (mosse < 5) rotti.push(`${epId} (solo ${mosse} comandi)`);
    } catch (e) {
      rotti.push(`${epId}: ${e.message}`);
    }
  }
  ok(girati === id.length, `tutti gli episodi girano headless (${girati}/${id.length})`);
  ok(rotti.length === 0, `nessuno si pianta: ${rotti.join('; ') || 'ok'}`);
  console.log(`  (${finiti}/${girati} episodi arrivano a un esito in 20 round col bot minimo)`);
}

// --- IL MOTORE NON HA MAI VISTO UN DOM: se qualcuno ne importasse uno, qui
// esploderebbe. Questo test gira in node nudo, ed e' la prova che serve al
// Durable Object.
ok(typeof globalThis.document === 'undefined',
   'nessuno ha dovuto inventare un document per far girare il motore');
ok(typeof globalThis.localStorage === 'undefined',
   'ne\' un localStorage');

console.log(ko === 0 ? 'TUTTO OK (una spedizione intera, senza schermo)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
