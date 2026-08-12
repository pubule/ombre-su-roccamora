// DIFFERENZIALE: gli orologi d'episodio estratti devono comportarsi
// esattamente come quelli che stavano dentro digitale.js.
//
// Qui il confronto e' doppio, perche' queste funzioni MUTANO lo stato: si
// guarda cosa restituiscono E come lasciano la partita. Una che tornasse gli
// annunci giusti sporcando `compiti` o `canto` in modo diverso passerebbe un
// confronto sul solo valore di ritorno, e sposterebbe il bilanciamento di sei
// episodi in silenzio.
//
// Oracolo: webapp/rigenera-oracolo.sh. Impalcatura, sparisce a fine Fase 1.
//
// node webapp/test-motore-obiettivi.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };

import { readFileSync } from 'fs';
import { _diff as vecchio, _motore } from './public/js/_oracolo.js';
import * as nuovo from './public/motore/obiettivi.js';
import { creaRng, interoFino } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const NEMICI = COMUNE.nemici.map((n) => n.nome);
const PARTY = ['ELENA FOSCO', 'OTTONE BRERA', 'NINO MORA'];

const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', N: 'T4' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T4', nome: 'Ufficio', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 3, 'scrivania'], [3, 0, 'b']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T4' }, arredi: [[1, 2, 'altare'], [2, 2, 'a'], [3, 3, 'cella']] },
];

// Un episodio che porta TUTTE e sei le meccaniche insieme, con i parametri
// mossi a caso. Nel gioco vero non convivono mai tutte, ma qui serve che ogni
// ramo venga percorso: un episodio per volta lascerebbe cinque orologi fermi.
function episodio(rng) {
  const bersaglio = NEMICI[interoFino(rng, NEMICI.length)];
  return {
    tessere: TESS, cartella: 'Episodio 1',
    compiti: [
      { id: 'tell', quante: 2 + interoFino(rng, 4), massimo: 5, tile: 'T2', etichetta: 'tell',
        cella: interoFino(rng, 2) ? 'casse' : null, per_round_max: interoFino(rng, 2) ? 1 : null },
      { id: 'capo', quante: 1, nemico: bersaglio, tile: interoFino(rng, 2) ? 'T6' : null,
        ridotto: !!interoFino(rng, 2),
        perso_se_abbattuto: interoFino(rng, 2) ? { esito: 'parziale', testo: 'Il filo è perso.' } : null,
        dopo: interoFino(rng, 3) === 0 ? 'tell' : null },
      { id: 'controcanto', tile: 'T6', quante: 10, fatto: 'Il Controcanto è compiuto.',
        ritmo: { tile: 'T6', base: 1, per_frammenti: 6, minimo: 1, oggetto: 'Mappa Acustica',
                 con_oggetto: 1, frammenti_default: 12, testo: 'canta' } },
    ],
    orologio: interoFino(rng, 2) ? {
      id: 'demolizione', nome: 'Demolizione', max: 4 + interoFino(rng, 10),
      ogni: 1 + interoFino(rng, 2), esito: interoFino(rng, 2) ? 'sconfitta' : 'parziale',
      testo: 'Il muro è caduto.',
      da_tessera: interoFino(rng, 2) ? 'T6' : null,
      frena_adiacente: interoFino(rng, 3) === 0 ? bersaglio : null,
      ferma_se_abbattuto: interoFino(rng, 3) === 0 ? bersaglio : null,
    } : null,
    rogo: interoFino(rng, 2) ? {
      scala: [['T2', 2 + interoFino(rng, 4)], ['T6', 5 + interoFino(rng, 6)]],
      danno: interoFino(rng, 2) ? 1 : 0, protetto: 'Cassetta Stagna',
      testo_scatta: 'Il Rogo divampa in {tile}.', testo_parziale: 'Anneriti.',
    } : null,
    cancellazione: interoFino(rng, 2) ? {
      compito: 'tell', da_tessera: 'T4', per_round: 1 + interoFino(rng, 2),
      finche_compito: 'capo', testo: 'Un tell sparisce.',
      esaurito: 'Non trovano nulla da cancellare.',
    } : null,
    pressione: interoFino(rng, 2) ? {
      tile: 'T6', per_round: 1, testo: 'Il Dormiente si desta',
      rito: { per_round: 1, testo: 'Il rito ha una voce',
              finche_manca_oggetto: interoFino(rng, 2) ? 'Candidata Salvata' : null },
      danno: interoFino(rng, 3) === 0 ? { 4: 1, 6: 2 } : null,
    } : null,
    canto_max: 8,
  };
}

function stato(rng, ep) {
  const rivelate = ['T1', 'T2', 'T4', 'T6'].slice(0, 1 + interoFino(rng, 4));
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  return {
    round: 1 + interoFino(rng, 12), canto: interoFino(rng, 9), fase: 'eroi',
    rivelate, grate: [], log: [], esito: null,
    nemici: Array.from({ length: interoFino(rng, 5) }, () => ({
      nome: interoFino(rng, 2) ? ep.compiti[1].nemico : NEMICI[interoFino(rng, NEMICI.length)],
      pos: cella(), ferite: interoFino(rng, 3), max: 2 + interoFino(rng, 2),
      abbattuto: interoFino(rng, 4) === 0,
    })),
    eroiPos: Object.fromEntries(PARTY.map((n) => [n, cella()])),
    vite: Object.fromEntries(PARTY.map((n) => [n, interoFino(rng, 5) ? 1 + interoFino(rng, 7) : 0])),
    compiti: { tell: interoFino(rng, 6), capo: interoFino(rng, 2), controcanto: interoFino(rng, 11) },
    scortati: [], azioni: {}, storditi: {}, eroiFatti: [],
    traccia: interoFino(rng, 5), rogoAcceso: {}, bersagliVisti: {},
    orologioVistoBersaglio: !!interoFino(rng, 2),
  };
}

const rng = creaRng(20260812);
let confronti = 0, divergenze = 0;

for (let i = 0; i < 1200 && divergenze < 6; i++) {
  const ep = episodio(rng);
  const sp = stato(rng, ep);
  const oggetti = [];
  if (interoFino(rng, 3) === 0) oggetti.push('La Cassetta Stagna');
  if (interoFino(rng, 3) === 0) oggetti.push('La Mappa Acustica Attiva');
  if (interoFino(rng, 3) === 0) oggetti.push('La Candidata Salvata');
  const frammenti = interoFino(rng, 4) ? interoFino(rng, 25) : null;
  const extra = { party: PARTY, comune: COMUNE, indagine: { oggetti }, frammenti };

  const pos = { t: sp.rivelate[interoFino(rng, sp.rivelate.length)],
                x: interoFino(rng, 4), y: interoFino(rng, 4) };
  const quanto = 1 + interoFino(rng, 3);

  // Ogni caso lavora su una COPIA propria dello stato, e si confronta il
  // ritorno insieme allo stato che lascia dietro.
  const casi = [
    ['specCompiti', (V) => V ? vecchio.specCompiti() : nuovo.specCompiti(G())],
    ['compitiFiniti', (V) => V ? vecchio.compitiFiniti() : nuovo.compitiFiniti(G())],
    ['obiettivoFatto', (V) => V ? vecchio.obiettivoFatto() : nuovo.obiettivoFatto(G())],
    ['compitoDisponibile', (V) => V ? vecchio.compitoDisponibile(pos) : nuovo.compitoDisponibile(G(), pos)],
    ['rogoBrucia T2', (V) => V ? vecchio.rogoBrucia('T2') : nuovo.rogoBrucia(G(), 'T2')],
    ['haProtezioneRogo', (V) => V ? vecchio.haProtezioneRogo() : nuovo.haProtezioneRogo(G())],
    ['frammentiPortati', (V) => V ? vecchio.frammentiPortati() : nuovo.frammentiPortati(G())],
    // --- questi mutano
    ['avanzaOrologio', (V) => V ? vecchio.avanzaOrologio(quanto, 'prova') : nuovo.avanzaOrologio(G(), quanto, 'prova')],
    ['avanzaRogo', (V) => V ? vecchio.avanzaRogo() : nuovo.avanzaRogo(G())],
    ['avanzaCancellazione', (V) => V ? vecchio.avanzaCancellazione() : nuovo.avanzaCancellazione(G())],
    ['avanzaRitmo', (V) => V ? vecchio.avanzaRitmo() : nuovo.avanzaRitmo(G())],
    ['avanzaPressione', (V) => V ? vecchio.avanzaPressione() : nuovo.avanzaPressione(G())],
    ['controllaFiloPerso', (V) => V ? vecchio.controllaFiloPerso() : nuovo.controllaFiloPerso(G())],
  ];

  let g;                                   // il contesto della versione nuova
  const G = () => g;

  for (const [nome, esegui] of casi) {
    const spV = JSON.parse(JSON.stringify(sp));
    const spN = JSON.parse(JSON.stringify(sp));

    _motore._setup(ep, spV, extra);
    let rV, rN;
    try { rV = JSON.stringify(esegui(true)); } catch (e) { rV = 'ERR:' + e.message; }

    g = { ep, comune: COMUNE, sp: spN,
          partita: { party: PARTY, indagine: { oggetti }, frammenti }, _layout: null };
    try { rN = JSON.stringify(esegui(false)); } catch (e) { rN = 'ERR:' + e.message; }

    confronti++;
    const statoV = JSON.stringify(spV), statoN = JSON.stringify(spN);
    if (rV !== rN || statoV !== statoN) {
      divergenze++;
      const che = rV !== rN ? 'il ritorno' : 'lo stato che lascia';
      ok(false, `${nome}: diverge ${che}, scenario #${i}`
        + `\n     round=${sp.round} canto=${sp.canto} rivelate=${sp.rivelate.join(',')} traccia=${sp.traccia}`
        + `\n     compiti=${JSON.stringify(sp.compiti)} oggetti=${JSON.stringify(oggetti)} frammenti=${frammenti}`
        + `\n     vecchio: ${(rV !== rN ? rV : statoV).slice(0, 240)}`
        + `\n     nuovo:   ${(rV !== rN ? rN : statoN).slice(0, 240)}`);
    }
  }
}

ok(confronti > 12000, `il differenziale deve fare molti confronti (fatti ${confronti})`);

console.log(ko === 0 ? `TUTTO OK (obiettivi, ${confronti} confronti)` : `${ko} FAIL su ${confronti} confronti`);
process.exit(ko ? 1 : 0);
