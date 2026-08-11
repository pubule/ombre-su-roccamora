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

// `fase`: da dove comincia la serata. Le due meta' dell'episodio sono
// INDIPENDENTI — si puo' giocare la sola spedizione (l'indagine e' gia' stata
// fatta un'altra sera, o non la si vuole rifare). In quel caso l'indagine
// nasce gia' chiusa e l'esito che avrebbe prodotto (`vantaggi`) lo si dichiara
// a mano: e' l'unica cosa che l'indagine passa davvero alla spedizione.
export function nuovaPartita(episodioId, modo, party, fase = 'indagine') {
  const soloSpedizione = fase === 'spedizione';
  return {
    v: 1,
    episodio: episodioId,
    modo,                      // 'tavolo' | 'digitale'
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
      note: '',
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

export function salva(partita) {
  const tavolo = tavoloCorrente();
  partita.aggiornato = Date.now();
  localStorage.setItem(chiaveDi(tavolo, partita.episodio), JSON.stringify(partita));
  if (!tavolo) return;                 // banco di prova: non c'e' niente da sincronizzare
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
