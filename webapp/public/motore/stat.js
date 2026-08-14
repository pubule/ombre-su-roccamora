// LE STATISTICHE DERIVATE: quanta Salute ha un eroe stanotte, quanto e' duro
// un nemico in questo episodio, quante azioni restano a chi ha gia' agito, e
// dove puo' arrivare chi deve ancora muovere.
//
// Niente qui e' un dato: sono tutti calcoli su `comune.json` (le statistiche
// stampate sulle carte, condivise fra episodi) piegati dalle regole
// dell'episodio in corso e dalla taglia del gruppo. E' il motivo per cui non
// possono stare nei dati: la stessa carta Eroe vale 6 di Salute in due e 8 in
// dieci, e la stessa carta Nemico e' piu' morbida in un episodio tarato.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`, come in griglia.js.

import { esploraMosse, occupati, adiacGlob } from './griglia.js';
import { eroeCresciuto, bonusDifesa, ha } from './migliorie.js';

// ------------------------------------------------------------- dati di gioco
// L'EROE COM'E' STANOTTE, non come e' stampato sulla carta: le Migliorie delle
// serate passate (Tempra, Fibra) e le Cicatrici sono gia' dentro. Passa da qui
// e basta — ogni chiamante di `saluteMax` prende l'oggetto da questa funzione,
// quindi la Fibra arriva alla Salute massima senza una seconda riga.
//
// `eroeCresciuto` restituisce una COPIA quando c'e' qualcosa da cambiare e
// l'originale quando non c'e': `comune.eroi` e' in cache e condiviso.
export const eroe = (g, nm) => eroeCresciuto(g, nm, g.comune.eroi.find((e) => e.nome === nm));

// LA DIFESA DI UN EROE, che fin qui era un numero stampato e basta. Esiste
// perche' SPALLE COPERTE la muove: chi sta accanto a un compagno che la porta
// para meglio. Due punti in nemici.js leggevano `e.difesa` dritto; ora leggono
// questa, e sono gli stessi due punti — il bonus non puo' applicarsi a meta'.
export function difesaDi(g, nm) {
  const e = eroe(g, nm);
  if (!e) return 8;
  const pos = g.sp && g.sp.eroiPos && g.sp.eroiPos[nm];
  if (!pos) return e.difesa;
  const vicini = (g.partita.party || []).filter((x) => x !== nm
    && (g.sp.vite[x] ?? 0) > 0 && g.sp.eroiPos[x] && adiacGlob(g, pos, g.sp.eroiPos[x]));
  return e.difesa + bonusDifesa(g, nm, vicini);
}

export const nemStat = (g, nome) => {
  const base = g.comune.nemici.find((n) => n.nome === nome);
  // TARATURA PER EPISODIO: `ep.nemici_mod` puo' ammorbidire (o indurire) i
  // nemici di quell'episodio senza toccare le loro statistiche stampate, che
  // sono condivise fra episodi. Es. `{ dan: -1 }` toglie 1 Danno a tutti; una
  // chiave col nome del nemico lo colpisce solo lui. Serve dove un episodio e'
  // troppo letale nel finale ma i nemici non si possono indebolire altrove.
  const mod = g.ep && g.ep.nemici_mod;
  if (!base || !mod) return base;
  const delta = mod[nome] || mod.tutti || null;
  if (!delta) return base;
  const out = { ...base };
  for (const k of ['dan', 'att', 'dif', 'fer']) if (delta[k]) out[k] = Math.max(0, (out[k] || 0) + delta[k]);
  return out;
};

// PASSO FELPATO aggiunge 3 caselle per il round in cui si accende. Sta qui e
// non in raggEroe perche' il movimento e' un numero solo: chi lo legge —
// l'esplorazione delle caselle, la plancia dell'arbitro, il telefono di chi
// gioca — deve leggerne uno.
export const movimento = (g, nm) => {
  const base = nm.includes('NINO') ? 4 : 3;
  const p = g.sp && g.sp.passo;
  return (p && p.chi === nm && p.round === g.sp.round) ? base + 3 : base;
};

export function fascia(g, taglia) {
  if (taglia === 2 || taglia === 4) return 0;
  if (taglia === 3 || taglia === 5) return 1;
  if (taglia === 6) return 2;
  if (taglia <= 8) return 3;
  return 4;
}

export const feriteMaxNem = (g, st) => st.ferite_per_fascia[fascia(g, g.partita.party.length)];

export function saluteMax(g, e) {
  const bonus = g.comune.regole.salute_bonus_per_taglia[String(g.partita.party.length)] || 0;
  // IL VANTAGGIO D'INDAGINE (stessa formula del tavolo, spedizione.js:62): chi
  // e' arrivato in anticipo o preparato ha +1 Salute massima. Mancava, e la
  // modalita' digitale giocava con un punto in meno a testa rispetto alle
  // regole stampate — piu' dura del gioco vero, per tutti, sempre.
  const tier = (g.partita.vantaggi || {}).tier;
  const bonusTier = (tier === 'slancio' || tier === 'preparati') ? 1 : 0;
  // BONUS SALUTE D'EPISODIO (`ep.salute_extra`): certi episodi concedono Salute
  // in piu' a testa — una regola dell'episodio, stampabile, che non tocca le
  // statistiche dei nemici (condivise). Serve dove la marcia lunga decima il
  // gruppo prima che arrivi in fondo (Atto I-II).
  const extra = g.ep.salute_extra || 0;
  return e.salute + bonus + bonusTier + extra;
}

// ------------------------------------------------------------ PNG scortati
// Dato per episodio (webapp/data/epN.json → `scortato`): pedina, prigione,
// tessera-vittoria, prova di liberazione. Regolamento: il PNG non e' un eroe,
// i nemici lo ignorano, si muove nel turno degli eroi (Mov 3) e non agisce.
export const specScortati = (g) => (g.ep.scortato || []);
export const specScort = (g, i) => specScortati(g)[i] || {};
export const statoScortati = (g) => (g.sp.scortati || []);
export const scortAttivo = (g) => { const v = g.sp.scortAttivo; return (v === 0 || v > 0) ? v : null; };

// ------------------------------------------------------------------ turno
export const primo = (nome) => {
  const toks = String(nome).split(' ').filter(Boolean);
  const t = (toks[0] === 'DOTT.' || toks[0] === 'PADRE') ? (toks[1] || toks[0]) : toks[0];
  return t.replace(/["“”]/g, '').toLowerCase();
};

export function eroiAttivoNome(g) {
  const sp = g.sp; const fatti = sp.eroiFatti || [];
  if (scortAttivo(g) != null) return null;        // PNG scortato selezionato: nessun eroe attivo
  const vivi = g.partita.party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (sp.eroiAttivo && vivi.includes(sp.eroiAttivo) && !fatti.includes(sp.eroiAttivo)) return sp.eroiAttivo;
  return vivi.find((nm) => !fatti.includes(nm)) || null;
}

// ------------------------------------------------------------------ azioni
export const azioniOf = (g, nm) => (g.sp.azioni[nm] || []);
export const azioneSpesa = (g, nm, tipo) => azioniOf(g, nm).includes(tipo);
// un eroe stordito (insidia/fumi) ha 1 sola azione nel round indicato
export const stordito = (g, nm) => (g.sp.storditi && g.sp.storditi[nm] === g.sp.round);
// SLANCIO: nel primo round ogni eroe ha 3 azioni invece di 2 (sempre di tipo
// diverso). Il tavolo lo annuncia da sempre (spedizione.js:236); il digitale
// non lo applicava, quindi il vantaggio piu' alto dell'Indagine valeva zero.
export const azioniMax = (g, nm) => (stordito(g, nm) ? 1
  : (g.sp.round === 1 && (g.partita.vantaggi || {}).tier === 'slancio') ? 3 : 2);
export const azioniRestano = (g, nm) => azioniOf(g, nm).length < azioniMax(g, nm);

// --------------------------------------------------------- raggiungibilita'
// Sta qui e non in griglia.js perche' non e' geometria: dipende da quante
// azioni restano e da quanto si muove chi le spende.

// celle di arrivo raggiungibili dall'eroe (alleati attraversabili, ci si ferma
// solo su celle libere; le porte verso stanze coperte sono bersagli reveal).
// {} se ha gia' mosso o non e' la fase eroi.
export function raggEroe(g, nm) {
  const sp = g.sp;
  if (sp.fase !== 'eroi' || azioneSpesa(g, nm, 'muovere') || !azioniRestano(g, nm)) return {};
  const start = sp.eroiPos[nm];
  const info = esploraMosse(g, start, movimento(g, nm), occupati(g, `E:${nm}`, true, true));  // solo nemici murano (alleati e PNG scortati attraversabili)
  const tuttiOcc = occupati(g, `E:${nm}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || tuttiOcc.has(k)) continue; out[k] = v; }
  return out;
}

// ESCA PREZIOSA di Carbone: le caselle dove il monile puo' arrivare — entro 3,
// libere, in stanze gia' rivelate. Stessa esplorazione del movimento, budget 3:
// un monile lanciato non passa i muri piu' di quanto ci passi un uomo.
export function celleEsca(g, nm) {
  const sp = g.sp; const start = sp.eroiPos[nm];
  if (!start) return {};
  const info = esploraMosse(g, start, 3, occupati(g, `E:${nm}`, true, true));
  const occ = occupati(g, `E:${nm}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || v.reveal || occ.has(k)) continue; out[k] = v; }
  return out;
}

// celle raggiungibili da un PNG scortato (Mov 3): passa per eroi/porte, blocca
// sui nemici, non rivela tessere, non si ferma su celle occupate
export function raggScortato(g, i) {
  const png = statoScortati(g)[i];
  if (scortAttivo(g) !== i || !png || !png.liberato || !png.pos) return {};
  const info = esploraMosse(g, png.pos, specScort(g, i).mov || 3, occupati(g, `S:${i}`, true, true));  // solo nemici murano
  const tuttiOcc = occupati(g, `S:${i}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || v.reveal || tuttiOcc.has(k)) continue; out[k] = v; }
  return out;
}

// VOCE FERMA di Serra: +2 alle prove NERVI degli eroi a lui adiacenti. Vale
// «fino al suo prossimo turno» — cioe' per tutto il round in cui la usa, e nel
// round dopo finche' Serra non ha ancora speso un'azione. L'adiacenza si
// guarda al momento del tiro, non a quello dell'abilita': e' la sua voce che
// arriva, e se ti allontani non ti arriva piu'.
export function bonusVoce(g, nm, stat) {
  const sp = g.sp; const v = sp.voceFerma;
  if (!v || String(stat).toLowerCase() !== 'nervi' || v.da === nm) return [];
  const ancora = sp.round === v.round
    || (sp.round === v.round + 1 && !(sp.azioni[v.da] || []).length);
  if (!ancora || (sp.vite[v.da] ?? 0) <= 0) return [];
  if (!sp.eroiPos[nm] || !sp.eroiPos[v.da] || !adiacGlob(g, sp.eroiPos[nm], sp.eroiPos[v.da])) return [];
  return [{ label: `Voce ferma di ${primo(v.da)}`, val: 2 }];
}

// MANO FERMA: +1 alle prove di NERVI «imposte dalle trappole e dall'ambiente,
// non ai combattimenti». Sta accanto a bonusVoce perche' e' la stessa specie di
// bonus e passa dalla stessa porta — `prova()` in azioni.js, che serve insidie
// d'ingresso, oggetti rischiosi e ricerche. Gli attacchi non passano di li'
// (si costruiscono la loro soglia in `provaDi`), quindi il «non ai
// combattimenti» non ha bisogno di essere scritto: e' dove sta la funzione.
export function bonusMano(g, nm, stat) {
  if (String(stat).toLowerCase() !== 'nervi' || !ha(g, nm, 'mano')) return [];
  return [{ label: 'Mano ferma', val: 1 }];
}
