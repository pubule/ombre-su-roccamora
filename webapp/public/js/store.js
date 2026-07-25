// Stato di gioco: un salvataggio per episodio in localStorage.
// La partita e' un oggetto semplice, serializzabile, mutato SOLO via salva():
// niente framework, il dispositivo e' uno e lo stato e' locale (vedi piano).

const PREFISSO = 'osr.partita.';

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
  localStorage.setItem(PREFISSO + partita.episodio, JSON.stringify(partita));
}

export function carica(episodioId) {
  const raw = localStorage.getItem(PREFISSO + episodioId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function cancella(episodioId) {
  localStorage.removeItem(PREFISSO + episodioId);
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
