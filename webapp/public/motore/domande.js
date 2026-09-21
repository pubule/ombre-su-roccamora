// GLI EFFETTI DELLE DOMANDE d'Indagine, applicati nella Spedizione.
//
// Ogni Domanda della busta promette un effetto: «esatta: nel 1° round non si
// pesca nessuna carta Minaccia», «sbagliata: 1 Sgherro appare in T1». Fino al
// 21/09/2026 solo la penalita' di Canto era anche un dato che il motore leggeva:
// il resto la busta lo mostrava a chi arbitra e poi spariva, e chi rispondeva
// giusto non riceveva il premio (AUDIT-VANTAGGI-INDAGINE.md).
//
// Qui si legge `premio` (Domanda esatta) o `penalita` (sbagliata) dai dati
// d'episodio (`ep.soluzione.domande[i]`, vedi EFFETTI_DOMANDE in
// webapp/export-data.py) e si applica cio' che il motore sa applicare. Il resto
// resta prosa: `promemoria()` la riporta in Spedizione, cosi' non sparisce piu'.
//
// SENZA `partita.vantaggi.risposte` NON SI APPLICA NIENTE. Il pilota di misura
// semina il gradino (`tier`) e lascia le risposte fuori di proposito: cosi' la
// mappa dei win% non si ri-basa in silenzio (vedi misura-episodio.mjs). La busta
// le scrive sempre, e l'esito dichiarato a mano («solo la spedizione») pure.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`.
import { spawnUno } from './minaccia.js';

const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };

// Le Domande della busta con l'esito che ebbero: [{ i, d, esatta }]
function esiti(g) {
  const ris = (g.partita.vantaggi || {}).risposte;
  if (!Array.isArray(ris)) return [];
  const dom = ((g.ep.soluzione || {}).domande) || [];
  const out = [];
  dom.forEach((d, i) => { if (!d.dopo_spedizione && typeof ris[i] === 'boolean') out.push({ i, d, esatta: ris[i] }); });
  return out;
}

// L'insieme degli effetti in vigore: l'unione di `premio` (Domande esatte) e
// `penalita` (sbagliate). Le chiavi sono quelle di EFFETTI_DOMANDE.
export function effettiAttivi(g) {
  const e = { spawn_t1: {}, senza_spawn: {}, smascherato: [], boss_salta: null,
              boss_difesa: 0, nessuna_minaccia_r1: false, minaccia_extra_r1: 0,
              senza_prova: [], traccia_iniziale: 0 };
  for (const { d, esatta } of esiti(g)) {
    const x = (esatta ? d.premio : d.penalita) || {};
    if (x.nessuna_minaccia_r1) e.nessuna_minaccia_r1 = true;
    e.minaccia_extra_r1 += x.minaccia_extra_r1 || 0;
    for (const [n, q] of Object.entries(x.spawn_t1 || {})) e.spawn_t1[n] = (e.spawn_t1[n] || 0) + q;
    for (const [t, ns] of Object.entries(x.senza_spawn || {})) e.senza_spawn[t] = [...(e.senza_spawn[t] || []), ...ns];
    e.smascherato.push(...(x.smascherato || []));
    if (x.boss_salta) e.boss_salta = x.boss_salta;
    e.boss_difesa += x.boss_difesa || 0;
    e.senza_prova.push(...(x.senza_prova || []));
    e.traccia_iniziale += x.traccia_iniziale || 0;
  }
  return e;
}

// ALLA PARTENZA. Una volta sola, quando la Spedizione si costruisce: scrive lo
// stato che il resto del motore consulta (`sp.effetti`, `sp.modNemici`,
// `sp.saltaNemici`) e fa apparire chi deve apparire in T1.
export function avviaEffetti(g, primaTessera) {
  const sp = g.sp;
  const e = effettiAttivi(g);
  sp.effetti = {
    nessuna_minaccia_r1: e.nessuna_minaccia_r1, minaccia_extra_r1: e.minaccia_extra_r1,
    senza_spawn: e.senza_spawn, smascherato: [...e.smascherato], senza_prova: e.senza_prova,
  };
  // «la DEMOLIZIONE parte da 2»: la traccia dell'episodio (motore/obiettivi.js) non
  // parte da zero. Solo dove l'episodio ha un orologio.
  if (e.traccia_iniziale && g.ep.orologio) {
    sp.traccia = (sp.traccia || 0) + e.traccia_iniziale;
    log(g, `${g.ep.orologio.nome}: parte da ${sp.traccia} (Domanda sbagliata).`);
  }
  // IL GETTONE INTUIZIONE: 0 ore avanzate a fine Indagine (`vantaggi.dossier`). Un
  // ri-tiro in tutta la Spedizione: si spende col comando `intuizione`.
  sp.intuizione = (g.partita.vantaggi || {}).dossier ? 1 : 0;
  // IL PROMEMORIA sta nello STATO: la proiezione taglia `ep.soluzione` per i
  // telefoni, ma questo lo leggono tutti — la busta l'ha gia' mostrato a tutti.
  sp.promemoria = promemoria(g);
  const boss = (g.ep.soluzione || {}).boss;
  if (boss && e.boss_difesa) sp.modNemici = { ...(sp.modNemici || {}), [boss]: { dif: e.boss_difesa } };
  if (boss && e.boss_salta) sp.saltaNemici = { ...(sp.saltaNemici || {}), [boss]: { [e.boss_salta]: 1 } };
  if (e.boss_salta === 'attivazione' && boss) log(g, `${boss.toLowerCase()}: la sua prima attivazione la saltate (Domanda esatta).`);
  if (e.boss_salta === 'attacco' && boss) log(g, `${boss.toLowerCase()}: il suo primo attacco lo saltate (Domanda esatta).`);
  if (e.boss_difesa && boss) log(g, `${boss.toLowerCase()} è stonato: Difesa ${e.boss_difesa} (Domanda esatta).`);
  // I nemici di T1: alla partenza, come «QUANDO RIVELATE QUESTA TESSERA» di ogni T1
  for (const [nome, q] of Object.entries(e.spawn_t1)) {
    for (let k = 0; k < q; k++) {
      if (spawnUno(g, nome, primaTessera)) log(g, `Appare ${nome.toLowerCase()} in ${primaTessera} (Domanda sbagliata).`);
    }
  }
}

// QUANTE CARTE MINACCIA. Il 1° round e' l'unico che le Domande toccano.
export function minacceRound(g, n) {
  const ef = g.sp.effetti || {};
  if (g.sp.round !== 1) return n;
  if (ef.nessuna_minaccia_r1) return 0;
  return n + (ef.minaccia_extra_r1 || 0);
}

// «SMASCHERATO»: la prima volta che quei nemici sarebbero piazzati, non lo sono.
export function smascherati(g, nome) {
  const lista = (g.sp.effetti || {}).smascherato || [];
  const k = lista.indexOf(nome);
  if (k < 0) return false;
  lista.splice(k, 1);
  log(g, `${nome.toLowerCase()}: smascherato, non viene piazzato (Domanda esatta).`);
  return true;
}

// L'insidia d'ingresso che una Domanda esatta toglie da una tessera.
export function senzaProva(g, tileId) {
  return (((g.sp.effetti || {}).senza_prova) || []).includes(tileId);
}

// I nemici che una Domanda esatta toglie da una tessera.
export function nonAppare(g, nome, tileId) {
  return ((((g.sp.effetti || {}).senza_spawn) || {})[tileId] || []).includes(nome);
}

// IL BOSS CHE SALTA. Consuma un salto del tipo dato, se c'e'.
export function saltaBoss(g, nome, tipo) {
  const s = (g.sp.saltaNemici || {})[nome];
  if (!s || !(s[tipo] > 0)) return false;
  s[tipo] -= 1;
  return true;
}

// IL PROMEMORIA. Le Domande con un effetto che il motore NON applica restano
// prosa: qui si elencano — `esatta` o `sbagliata` a seconda dell'esito — perche'
// la Spedizione le ricordi a chi arbitra, invece di lasciarle sulla schermata
// della busta. `automatico` dice se il motore l'ha gia' applicato.
export function promemoria(g) {
  const out = [];
  for (const { i, d, esatta } of esiti(g)) {
    const testo = esatta ? d.esatta : d.sbagliata;
    if (!testo || /^Nessun effetto\.?$/i.test(String(testo).trim())) continue;
    const eff = (esatta ? d.premio : d.penalita) || {};
    const automatico = Object.keys(eff).length > 0;
    out.push({ n: i + 1, q: d.q, esatta, testo, automatico });
  }
  return out;
}
