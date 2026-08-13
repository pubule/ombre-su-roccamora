// I BIVI DI CAMPAGNA, applicati.
//
// A fine episodio il gruppo decide e sigilla la scelta; quella scelta cambia le
// REGOLE di uno o piu' episodi successivi — e non solo di quello dopo: il Bivio
// dell'Ep.8 si applica in Ep.13, 14 e 16, quello dell'Ep.11 arriva fino
// all'Ep.20, e l'Ep.18 raccoglie i conti di sei Bivi diversi.
//
// Gli effetti arrivano gia' tipizzati nei dati (`ep.bivi_qui`, costruito
// all'export da `src/bivi.py`): qui non si interpreta prosa, si esegue una
// tabella. Un tipo sconosciuto NON viene ignorato in silenzio — finirebbe in
// una campagna che si comporta come se quella scelta non fosse stata presa —
// ma esce come riga da leggere, cosi' chi arbitra puo' applicarlo a mano.
//
// DUE FAMIGLIE DI EFFETTO, e la differenza conta:
//
//   quelli che l'app SA FARE — Canto, soglia, ore, mazzo, cariche, pool nemici:
//     si applicano allo stato iniziale e nessuno deve ricordarsene;
//   quelli che l'app PUO' SOLO DIRE — «un testimone in meno», «la Vedova vi ha
//     segnati», «l'Ep.18 sara' un processo»: riguardano il tavolo, la fiction o
//     la struttura di una serata, e fingere di applicarli sarebbe peggio che
//     dirli. Escono come righe, in chiaro, e chi conduce ne tiene conto.
//
// La funzione e' PURA e non tocca il DOM: gira nel browser di chi arbitra, nel
// Durable Object e nei banchi di prova senza saperlo.

import { norm } from './regole.js';

// Cosa sa fare l'app da sola. Ogni voce riceve (b, e) — la borsa degli
// aggiustamenti e l'effetto — e la riempie.
const APPLICATORI = {
  'canto-iniziale': (b, e) => { b.canto = e.val; },
  'canto-iniziale-piu': (b, e) => { b.cantoPiu = (b.cantoPiu || 0) + (e.val || 1); },
  'soglia-canto': (b, e) => { b.soglia = e.val; },
  'ore': (b, e) => { b.ore = (b.ore || 0) + (e.val || 0); },
  'carica': (b, e) => { b.cariche[e.chi] = e.val; },
  'pool-nemici': (b, e) => { b.pool[e.chi] = (b.pool[e.chi] || 0) + (e.val || 1); },
  'boss-vicino': (b, e) => { b.bossVicino = (b.bossVicino || 0) + (e.val || 1); },
  'round-meno': (b, e) => { b.roundMeno = (b.roundMeno || 0) + (e.val || 1); },
  'ritirata-sicura': (b) => { b.ritirataSicura = true; },
  'niente-rialzo': (b) => { b.nienteRialzo = true; },
  'incrocio': (b, e) => { b.incroci = (b.incroci || 0) + (e.val || 0); },
  'conferma': (b, e) => { b.conferme.push(e.domanda); },
  'mazzo-aggiungi': (b, e) => b.mazzo.push({ verso: 'dentro', ...senzaEp(e) }),
  'mazzo-togli': (b, e) => b.mazzo.push({ verso: 'fuori', ...senzaEp(e) }),
  'approfondimento-togli': (b, e) => { if (e.carta) b.approfondimentiFuori.push(e.carta); },
  'luogo-aperto': (b, e) => { b.luoghiAperti.push(e.luogo); },
  'luogo-chiuso': (b, e) => { b.luoghiChiusi.push(e.luogo); },
  'luogo-rivelato': (b, e) => { b.luoghiRivelati.push(e.luogo); },
};

const senzaEp = (e) => {
  const { ep, da, opzione, nota, tipo, ...resto } = e;   // eslint-disable-line no-unused-vars
  return resto;
};

// La borsa vuota: esiste sempre, anche senza nessuna scelta registrata, cosi'
// chi la legge non deve difendersi da `undefined` a ogni riga.
export function biviVuoti() {
  return {
    canto: null, soglia: null, ore: 0, incroci: 0,
    cariche: {}, pool: {}, mazzo: [], conferme: [],
    approfondimentiFuori: [], luoghiAperti: [], luoghiChiusi: [], luoghiRivelati: [],
    righe: [], da: [],
  };
}

/**
 * Gli aggiustamenti che questo episodio si porta dietro dalle scelte passate.
 *
 * @param ep      i dati dell'episodio (con `bivi_qui`)
 * @param scelte  {bivio: idOpzione} — le decisioni gia' prese dal tavolo
 * @returns la borsa degli aggiustamenti, `righe` comprese
 */
export function biviDi(ep, scelte) {
  const b = biviVuoti();
  const effetti = (ep && ep.bivi_qui) || [];
  for (const e of effetti) {
    // si applica SOLO il ramo davvero scelto: gli altri effetti dello stesso
    // Bivio descrivono la strada non presa
    if (!scelte || scelte[e.da] !== e.opzione) continue;
    if (!b.da.includes(e.da)) b.da.push(e.da);
    const f = APPLICATORI[e.tipo];
    if (f) f(b, e);
    // la riga si dice SEMPRE, anche per gli effetti che l'app applica da sola:
    // una regola che cambia in silenzio e' indistinguibile da un difetto
    const riga = e.nota || e.testo;
    if (riga && !b.righe.includes(riga)) b.righe.push(riga);
  }
  return b;
}

/**
 * Applica alla partita appena creata quel che l'app sa fare da sola.
 * Muta `partita` — e' lo stato iniziale, non c'e' ancora nessuno che lo guarda.
 */
export function applicaAllaPartita(partita, b, ep) {
  if (!partita || !b) return partita;
  // le ore: il Taccuino comincia alle 18 e si chiude a mezzanotte, quindi
  // «un'ora in piu'» vuol dire cominciare un'ora PRIMA
  if (b.ore) partita.indagine.ora = (partita.indagine.ora ?? 18) - b.ore;
  if (b.canto != null) partita.spedizione.canto = b.canto;
  if (b.cantoPiu) partita.spedizione.canto = (partita.spedizione.canto || 0) + b.cantoPiu;
  if (b.soglia != null) partita.spedizione.soglia = b.soglia;
  // «parte gia' rivelata»: la Testimonianza si segna come letta prima che la
  // serata cominci, che e' esattamente quel che il fascicolo dice
  for (const s of b.luoghiRivelati) {
    for (const l of (ep && ep.luoghi) || []) {
      for (const a of l.approfondimenti || []) {
        if (norm(a.soggetto) === norm(s)) {
          partita.indagine.approfondimentiLetti.push({ n: l.n, tipo: a.tipo, soggetto: a.soggetto });
        }
      }
    }
  }
  // gli aggiustamenti che servono piu' tardi (mazzo, cariche) restano attaccati
  // alla partita: li leggeranno quando toccheranno a loro
  partita.bivi = b;
  return partita;
}

/**
 * L'episodio come il Bivio l'ha lasciato: una COPIA, perche' i dati sono
 * condivisi (`store.dati()` li tiene in cache) e quel che vale per questo
 * tavolo non deve valere per la prossima partita aperta nella stessa scheda.
 *
 * Si copiano solo i luoghi toccati: il resto resta lo stesso oggetto, e sono
 * decine di migliaia di caratteri di prosa che nessuno guadagna a duplicare.
 */
export function episodioColBivio(ep, b) {
  if (!ep || !b) return ep;
  const fuori = b.approfondimentiFuori.map(norm);
  const aperti = b.luoghiAperti.map(norm);
  const chiusi = b.luoghiChiusi.map(norm);
  const pool = Object.keys(b.pool).length ? { ...(ep.pool || {}) } : null;
  // «i clan si consolidano: +1 Sgherro nel pool». Il pool e' il conto dei
  // segnalini in scatola, e la Fase Minaccia si ferma quando finiscono: uno in
  // piu' e' un nemico in piu' che puo' arrivare, per tutta la serata.
  if (pool) for (const [chi, n] of Object.entries(b.pool)) pool[chi] = (pool[chi] || 0) + n;
  if (!fuori.length && !aperti.length && !chiusi.length) return pool ? { ...ep, pool } : ep;
  const luoghi = (ep.luoghi || []).map((l) => {
    const chi = [norm(l.nome), norm(l.voce_mappa)];
    const app = (l.approfondimenti || []).filter((a) => !fuori.includes(norm(a.soggetto)));
    const apre = aperti.some((x) => chi.includes(x));
    const chiude = chiusi.some((x) => chi.includes(x));
    if (app.length === (l.approfondimenti || []).length && !apre && !chiude) return l;
    // `chiude: 0` e non un flag nuovo: l'orologio d'Indagine gia' rifiuta i
    // luoghi la cui ora di chiusura e' passata, e le 18 sono passate sempre
    return { ...l, approfondimenti: app, ...(apre ? { chiave: null, aperto: true } : {}),
             ...(chiude ? { chiude: 0 } : {}) };
  });
  return { ...ep, luoghi, ...(pool ? { pool } : {}) };
}
