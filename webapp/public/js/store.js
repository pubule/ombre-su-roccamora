// Stato di gioco: un salvataggio per episodio E PER TAVOLO in localStorage,
// piu' una copia sul server (vedi DESIGN-ACCOUNT-E-SALVATAGGI.md).
// La partita e' un oggetto semplice, serializzabile, mutato SOLO via salva():
// niente framework, e localStorage resta la verita' durante la serata.
import { _coda } from './sync.js';

const PREFISSO = 'osr.partita.';
const CHIAVE_TAVOLO = 'osr.tavolo';

// Il tavolo sta nella chiave: e' la riga che impedisce al Gruppo del sabato di
// cancellare la serata del Gruppo del giovedi'.
//
// Senza tavolo si torna alla chiave piatta di prima. Non e' una gentilezza
// verso i vecchi salvataggi (quelli sono fuori scopo, vedi la spec): e' che i
// banchi di prova headless — misura-*.mjs, test-digitale-*.mjs, il pilota del
// bilanciamento — seminano `osr.partita.epN` e non passano da nessuna
// schermata di scelta. Sono lo strumento con cui si tara il gioco: devono
// continuare a funzionare identici.
const chiaveDi = (tavolo, episodio) =>
  tavolo ? `${PREFISSO}${tavolo}.${episodio}` : `${PREFISSO}${episodio}`;

export const tavoloCorrente = () => localStorage.getItem(CHIAVE_TAVOLO);
// Il nome si tiene accanto all'id solo per poterlo scrivere in testa alla home:
// senza, per sapere con chi stai giocando dovresti chiederlo al server.
export const nomeTavoloCorrente = () => localStorage.getItem(`${CHIAVE_TAVOLO}.nome`) || '';
export const impostaTavolo = (id, nome = '') => {
  localStorage.setItem(CHIAVE_TAVOLO, id);
  if (nome) localStorage.setItem(`${CHIAVE_TAVOLO}.nome`, nome);
};

// -------------------------------------------------------- I FRAMMENTI
// Un Frammento non e' un dato in piu': e' come e' finita la serata. Vittoria ->
// Frammento, vittoria PARZIALE -> Frammento incrinato (si conserva, si legge,
// ma non conta nel finale), sconfitta -> niente. Tenerne un elenco a parte
// vorrebbe dire due conti della stessa cosa, e due conti divergono.
//
// Serve all'Ep.20: quante righe di controcanto si cantano per round dipende da
// quanti Frammenti INTERI porta il gruppo, e fin qui il numero si dichiarava a
// mano perche' lo stato di campagna non esisteva.
export const EPISODI = ['preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8',
  'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17', 'ep18', 'ep19', 'ep20'];

// `tranne` esclude l'episodio che sta per cominciare: rigiocando l'Ep.20 dopo
// averlo vinto, il suo stesso Frammento si conterebbe fra quelli portati giu'.
export function frammentiConservati(tranne, tavolo = tavoloCorrente()) {
  let interi = 0; let incrinati = 0; let serate = 0;
  for (const k of EPISODI) {
    if (k === tranne) continue;
    const esito = (carica(k, tavolo) || {}).spedizione?.esito;
    if (!esito) continue;
    serate += 1;
    if (esito === 'vittoria') interi += 1;
    else if (esito === 'parziale') incrinati += 1;
  }
  // `serate` distingue «zero Frammenti» da «non lo sappiamo». Chi apre l'Ep.20
  // per provarlo — e i banchi di misura, che giocano un episodio alla volta —
  // non ha venti serate alle spalle: dire 0 lo renderebbe ingiocabile, e la
  // taratura misurerebbe un finale che nessun tavolo vero incontra. Senza
  // nessuna serata registrata il numero non si scrive, e vale il default dei
  // dati (12).
  return { interi, incrinati, serate };
}

// ----------------------------------------------------------- I BIVI
// Le scelte di campagna stanno sul server (`scelte_campagna`), perche' una
// scelta dell'Ep.8 pesa fino all'Ep.20 e deve sopravvivere al telefono che l'ha
// registrata. Qui se ne tiene una COPIA in localStorage per un motivo solo:
// preparare una partita e' sincrono — `nuovaPartita` non puo' aspettare la
// rete — e senza copia l'episodio partirebbe con le regole di nessuno.
//
// Chi arbitra la aggiorna quando sigilla; tutti gli altri quando entrano al
// tavolo. Se la rete manca si gioca con l'ultima nota, che e' esattamente cio'
// che si farebbe col Frammento in mano.
const CHIAVE_SCELTE = 'osr.scelte.';

export function scelteCampagna(tavolo = tavoloCorrente()) {
  try { return JSON.parse(localStorage.getItem(CHIAVE_SCELTE + (tavolo || '')) || '{}'); }
  catch { return {}; }
}

export const salvaScelte = (s, tavolo = tavoloCorrente()) =>
  localStorage.setItem(CHIAVE_SCELTE + (tavolo || ''), JSON.stringify(s));

// Rilegge dal server. Torna le scelte comunque: se la rete non c'e', quelle
// che avevamo — mai un oggetto vuoto, che sarebbe «nessuna scelta presa» e
// farebbe partire l'episodio con le regole sbagliate senza dirlo a nessuno.
export async function sincronizzaScelte(tavolo = tavoloCorrente()) {
  if (!tavolo) return {};
  try {
    const r = await fetch(`/api/scelte?tavolo=${encodeURIComponent(tavolo)}`);
    if (!r.ok) return scelteCampagna(tavolo);
    const { scelte } = await r.json();
    const m = Object.fromEntries((scelte || []).map((x) => [x.bivio, x.opzione]));
    salvaScelte(m, tavolo);
    return m;
  } catch { return scelteCampagna(tavolo); }
}

export async function registraScelta(bivio, opzione, tavolo = tavoloCorrente()) {
  const m = { ...scelteCampagna(tavolo), [bivio]: opzione };
  salvaScelte(m, tavolo);          // prima in locale: la serata non aspetta la rete
  if (!tavolo) return m;
  try {
    await fetch('/api/scelte', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ tavolo, bivio, opzione }) });
  } catch { /* la copia locale basta a giocare; si risincronizza al prossimo ingresso */ }
  return m;
}

// `fase`: da dove comincia la serata. Le due meta' dell'episodio sono
// INDIPENDENTI — si puo' giocare la sola spedizione (l'indagine e' gia' stata
// fatta un'altra sera, o non la si vuole rifare). In quel caso l'indagine
// nasce gia' chiusa e l'esito che avrebbe prodotto (`vantaggi`) lo si dichiara
// a mano: e' l'unica cosa che l'indagine passa davvero alla spedizione.
// UNA SOLA MODALITA': al tavolo, con la plancia a schermo. Le altre due —
// tessere e miniature vere, e tutto a schermo — sono state tolte il 14/08/2026:
// erano due viste che facevano quasi la stessa cosa, e ogni regola nuova andava
// scritta due volte. Resta una scelta sola, `fase`: l'episodio intero o la sola
// spedizione.
export function nuovaPartita(episodioId, party, fase = 'indagine') {
  const soloSpedizione = fase === 'spedizione';
  return {
    v: 1,
    episodio: episodioId,
    party,                     // [nomi eroi]
    creata: Date.now(),
    fase: soloSpedizione ? 'spedizione' : 'indagine',
    indagine: {
      ora: 18,                 // 18..24
      lettaLettera: false,     // la lettera d'incarico si legge una volta
      visitati: [],            // numeri luogo
      scoperti: [],            // luoghi coperti girati (bussate, anche fallite)
      sbloccati: [],           // luoghi la cui chiave e' stata detta (si rientra)
      parole: [],              // parole chiave sentite (per l'oracolo)
      oggetti: [],             // nomi carta Oggetto raccolti
      reperti: [],             // reperti stampabili consegnati
      approfondimentiLetti: [],// [{n, tipo, soggetto}]
      caricheUsate: {},        // {nomeEroe: {tipo: usate}}
      secondoFiato: {},        // {nomeEroe: true se ancora disponibile}
      note: '',              // la lavagna del gruppo, la tiene chi arbitra
      noteEroe: {},          // {nomeEroe: testo} — ognuno tiene i suoi, tutti li leggono
      risposte: ['', '', '', ''],
      chiusa: soloSpedizione,
    },
    spedizione: {
      round: 0,
      canto: 0,
      cantoBonus: false,
      ferite: [],              // registro: [{nome, copia, fer, max}]
      mazzo: null,             // ordine pescate (inizializzato in W-B)
      scarti: [],
      esito: null,
    },
  };
}

// `timbra: false` — SI TIENE UNA COPIA, non si e' giocato.
//
// Il timbro dice «qui e' successo qualcosa, adesso». Metterlo quando si mette
// da parte uno stato ARRIVATO DA FUORI e' una bugia con una conseguenza
// precisa: il telefono che scarica una serata la fa diventare la piu' recente
// del tavolo, e siccome «la serata aperta e' il salvataggio piu' recente» ci
// tornava a ogni refresh — per sempre, e a prescindere da dove fosse chi
// arbitra. La copia non e' una mossa: non si timbra, e non si rimanda indietro.
export function salva(partita, { timbra = true } = {}) {
  const tavolo = tavoloCorrente();
  // SEMPRE PIU' AVANTI DI PRIMA, anche a parita' di millisecondo. Il Durable
  // Object rifiuta uno stato che non sia piu' recente di quello che ha (e' cosi'
  // che chi si ricollega non sovrascrive la serata con quel che aveva in tasca);
  // due `salvaP()` nello stesso millisecondo — nell'Indagine capita, una carica
  // spesa e subito l'esito — avrebbero lo stesso timbro, e il secondo sarebbe
  // scartato senza che nessuno se ne accorga.
  if (timbra) partita.aggiornato = Math.max(Date.now(), (partita.aggiornato || 0) + 1);
  localStorage.setItem(chiaveDi(tavolo, partita.episodio), JSON.stringify(partita));
  if (!tavolo || !timbra) return;      // banco di prova, o copia: niente da sincronizzare
  // Accoda e basta: `salva()` NON aspetta la rete. Se qui comparisse un
  // `await`, il tavolo aspetterebbe un router per poter giocare.
  _coda.accoda(`${tavolo}/${partita.episodio}`, {
    tavolo,
    episodio: partita.episodio,
    aggiornato: partita.aggiornato,
    dati: JSON.stringify(partita),
  });
}

// Toglie dal dispositivo ogni traccia di un tavolo: le partite, quello che era
// in coda per il server, e la scelta corrente se era lui. Il server lo cancella
// vistaTavoli con DELETE /api/tavolo — qui si ripulisce solo questo schermo,
// perche' un salvataggio orfano risorgerebbe alla prima sincronizzazione.
export function dimenticaTavolo(id) {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(`${PREFISSO}${id}.`)) localStorage.removeItem(k);
  }
  for (const { chiave } of _coda.leggi()) {
    if (chiave.startsWith(`${id}/`)) _coda.togli(chiave);
  }
  if (tavoloCorrente() === id) {
    localStorage.removeItem(CHIAVE_TAVOLO);
    localStorage.removeItem(`${CHIAVE_TAVOLO}.nome`);
  }
}

export function carica(episodioId, tavolo = tavoloCorrente()) {
  const raw = localStorage.getItem(chiaveDi(tavolo, episodioId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function cancella(episodioId, tavolo = tavoloCorrente()) {
  localStorage.removeItem(chiaveDi(tavolo, episodioId));
  if (!tavolo) return;
  _coda.togli(`${tavolo}/${episodioId}`);      // non rimandare cio' che si cancella
  fetch(`/api/salvataggio?tavolo=${tavolo}&episodio=${episodioId}`, { method: 'DELETE' })
    .catch(() => { /* senza rete si cancella solo qui: si ripulira' al prossimo giro */ });
}

// --- dati statici (JSON esportati dal repo) ---
const _cache = {};
export async function dati(nome) {
  if (!_cache[nome]) {
    const r = await fetch(`/data/${nome}.json`);
    if (!r.ok) throw new Error(`dati mancanti: ${nome} (lancia gli export in webapp/)`);
    _cache[nome] = await r.json();
  }
  return _cache[nome];
}
