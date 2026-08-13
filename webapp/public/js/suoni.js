// L'ambiente sonoro: sceglie la traccia dallo STATO del gioco e ci passa in
// dissolvenza. I prompt e i nomi dei file stanno in suoni/PROMPT-SUNO.md.
//
// Perche' non e' decorazione: la bibbia fissa il tono in «l'orrore e' acustico
// e suggerito», e due dei quattro KPI della campagna sono ansia e immersione.
// Una traccia che cambia quando il Canto sale, o che TACE quando l'obiettivo
// e' compiuto, li serve meglio di qualunque testo.
//
// Tre principi, e sono tutti e tre difensivi:
//  1. NON PARTE DA SOLA. L'audio si accende a mano e la scelta resta scritta.
//     Al tavolo l'app fa da arbitro davanti a delle persone: partire da sola
//     con un drone sarebbe una prepotenza, e i browser lo vieterebbero
//     comunque senza un gesto.
//  2. UN FILE CHE MANCA NON E' UN ERRORE. Oggi in suoni/ non c'e' niente: si
//     resta muti e si va avanti. Chi genera le tracce le mette li' e l'app le
//     trova, senza toccare una riga.
//  3. STA SOTTO LA VOCE. Al tavolo qualcuno legge ad alta voce: il volume e'
//     basso di proposito, e la traccia dell'ultima ora si sovrappone ancora
//     piu' piano.
const BASE = '/suoni/';
const CHIAVE = 'osr.suoni';
const VOLUME = 0.30;          // sotto la voce di chi legge, non insieme
const VOLUME_SOPRA = 0.18;    // la traccia sovrapposta sta ancora piu' sotto
const DISSOLVENZA = 1200;     // ms: un ambiente non stacca, trasloca

// --- la scelta, che e' l'unica cosa che vale la pena provare --------------
// Una scala di priorita': vince sempre la cosa piu' specifica. L'ordine E' il
// significato — «obiettivo compiuto» batte «boss desto» perche' quando il
// mazzo tace la minaccia ha smesso di contare, ed e' proprio quello che il
// giocatore deve sentire.
export function traccia(st = {}) {
  if (st.esito === 'sconfitta') return 'non-si-esce';
  if (st.esito) return 'si-esce';                    // vittoria o parziale
  if (st.fase === 'spedizione') {
    if (st.obiettivoFatto) return 'mazzo-tace';
    if (st.bossDesto) return 'dormiente';
    if (st.nemiciVicini) return 'contatto';
    if (st.canto >= 1) return `canto-${Math.min(3, Math.ceil(st.canto / 2))}`;
    return 'spedizione';
  }
  return st.ambiente || null;                        // in Indagine: il luogo
}

// La seconda voce, che non sostituisce la prima ma ci si posa sopra: le sei
// ore dell'Indagine sono una clessidra che finora nessuno sentiva.
export function tracciaSopra(st = {}) {
  if (st.fase === 'spedizione' || st.esito) return null;
  return (st.ora >= 23) ? 'ultima-ora' : null;
}

// --- la resa ---------------------------------------------------------------
let acceso = leggiScelta();
let canali = null;            // { base: {a, b, attivo, ora}, sopra: {...} }

function leggiScelta() {
  try { return localStorage.getItem(CHIAVE) === '1'; } catch { return false; }
}
function scriviScelta(v) {
  try { localStorage.setItem(CHIAVE, v ? '1' : '0'); } catch { /* privato */ }
}

function nuovoCanale(volume) {
  const fai = () => { const a = new Audio(); a.loop = true; a.volume = 0; a.preload = 'none'; return a; };
  return { a: fai(), b: fai(), attivo: 'a', ora: null, volume };
}

// dissolvenza incrociata a mano: `Audio` non ce l'ha, e un cambio secco fra
// due droni si sente come uno strappo
function sfuma(el, da, a, ms, poi) {
  const t0 = performance.now();
  const passo = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    el.volume = Math.max(0, Math.min(1, da + (a - da) * k));
    if (k < 1) requestAnimationFrame(passo); else if (poi) poi();
  };
  requestAnimationFrame(passo);
}

function suona(canale, nome) {
  if (canale.ora === nome) return;
  const vecchio = canale[canale.attivo];
  const nuovo = canale[canale.attivo === 'a' ? 'b' : 'a'];
  canale.ora = nome;
  canale.attivo = canale.attivo === 'a' ? 'b' : 'a';
  if (vecchio.src) sfuma(vecchio, vecchio.volume, 0, DISSOLVENZA, () => vecchio.pause());
  if (!nome) return;
  nuovo.src = `${BASE}${nome}.mp3`;
  nuovo.volume = 0;
  // Il file puo' non esistere: oggi in suoni/ non c'e' niente. Si tace, non si
  // rompe — e non si scrive un errore in console a ogni cambio di stanza.
  nuovo.play().then(() => sfuma(nuovo, 0, canale.volume, DISSOLVENZA)).catch(() => {});
}

function spegniTutto() {
  if (!canali) return;
  for (const c of [canali.base, canali.sopra]) {
    for (const el of [c.a, c.b]) { el.pause(); el.src = ''; el.volume = 0; }
    c.ora = null;
  }
}

/** Chiamata a ogni render con lo stato corrente. Se l'audio e' spento non fa
 *  niente — e non costruisce nemmeno gli elementi. */
export function aggiorna(st) {
  if (!acceso) return;
  if (!canali) canali = { base: nuovoCanale(VOLUME), sopra: nuovoCanale(VOLUME_SOPRA) };
  suona(canali.base, traccia(st));
  suona(canali.sopra, tracciaSopra(st));
}

export function suoniAccesi() { return acceso; }

/** Il tasto lo preme una persona: e' anche il gesto che i browser pretendono
 *  prima di lasciar suonare qualcosa. */
export function alterna(st) {
  acceso = !acceso;
  scriviScelta(acceso);
  if (acceso) aggiorna(st); else spegniTutto();
  return acceso;
}

/** Il bottone, da mettere in una barra. Nessuno stile nuovo: usa `.btn`. */
export function bottoneHtml() {
  return `<button class="btn suoni-btn" id="suoni" title="ambiente sonoro"
    aria-pressed="${acceso}">${acceso ? '♪' : '♪̸'}</button>`;
}

/** Aggancia il bottone dopo un render. `leggiStato` serve perche' lo stato
 *  cambia a ogni azione: si chiede al momento del clic, non prima. */
export function agganciaBottone(app, leggiStato) {
  const b = app.querySelector('#suoni');
  if (!b) return;
  b.onclick = () => {
    const on = alterna(leggiStato());
    b.textContent = on ? '♪' : '♪̸';
    b.setAttribute('aria-pressed', String(on));
  };
}
