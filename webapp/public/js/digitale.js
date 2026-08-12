// Vista Spedizione (modalita' DIGITALE, «tutto a schermo»): l'INTERO dungeon
// vive sullo schermo. Le tessere rivelate sono disposte in tavola secondo il
// grafo delle uscite; ogni eroe/nemico ha una posizione globale (tessera +
// casella) e si muove a caselle attraversando le porte a piedi — niente
// «avanzata di gruppo». Pathfinding multi-tessera; IA nemici portata dal
// simulatore (bersaglio casuale, si avvicina col BFS, colpisce se adiacente).
//
// NB: la modalita' TAVOLO (spedizione.js) resta invariata: questo file e' un
// ramo separato, scelto in vistaPartita (main.js) su partita.modo.
import { salva, dati } from './store.js';
import { rendi, norm, costruisciMazzo, carteDaPescare, pesca, fineRound,
         cantoDaCarta, cerca, urlCarta, urlArt, cartaOggetto, tettoCanto,
         sogliaCanto } from './engine.js';
import { tiraProva } from './dadi.js';
import { abilitaSchede } from './scheda-eroe.js';
import { controBusta } from './engine.js';
import { conferma } from './chiedi.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ctx = null;   // { app, partita, ep, comune, carte, vaiA, layout }
const P = () => ctx.partita;
const SP = () => ctx.partita.spedizione;
const salvaP = () => salva(ctx.partita);

// LA PLANCIA A SCHERMO AL TAVOLO. Questa vista nasce per la modalita' digitale
// (tutto a schermo, l'app tira i dadi), ma serve anche a chi gioca AL TAVOLO
// senza aver stampato tessere e miniature: la plancia vive qui, tutto il resto
// resta del tavolo. Da qui due differenze, e solo queste:
//   - i dadi sono FISICI (`dadi.js` chiede il totale dei 2d6 e tiene comunque
//     il ripiego «niente dadi? tira l'app» per chi non li ha sottomano);
//   - il TESTO delle tessere non si stampa a schermo: lo legge ad alta voce chi
//     arbitra, dal fascicolo Spedizione. Se lo mostrasse l'app, i giocatori lo
//     leggerebbero prima che finisca la frase.
const alTavolo = () => P().modo === 'tavolo';
const modoDadi = () => (alTavolo() ? 'tavolo' : 'digitale');
// I tiri dei NEMICI si possono delegare all'app anche stando al tavolo: con il
// campo affollato, tirare a mano per ogni sgherro e' la contabilita' che la
// modalita' tavolo voleva togliere. L'interruttore vale per la partita, si
// accende dall'overlay del tiro (ripiegoSempre) e si spegne dalla plancia.
const tavoloTiraNemici = () => alTavolo() && !P().nemiciApp;
const RIPIEGO_NEMICI = { label: 'da qui i nemici li tira l’app' };
function accendiNemiciApp() { P().nemiciApp = true; salvaP(); }

// Un tiro d'attacco del nemico: lo chiede al tavolo, oppure lo tira l'app se
// l'interruttore e' acceso. Ritorna { tot, ok } comunque, cosi' chi chiama
// applica il danno allo stesso modo. L'interruttore puo' accendersi PROPRIO
// QUI (ripiegoSempre) e vale dal tiro successivo in poi.
async function tiroNemico(titolo, soglia, att) {
  if (!tavoloTiraNemici()) { const tot = r1() + r1() + att; return { tot, ok: tot >= soglia }; }
  const r = await tiraProva({ titolo, diffLabel: 'Difesa', soglia,
    bonus: [{ label: 'ATTACCO', val: att }], modo: 'tavolo', ripiegoSempre: RIPIEGO_NEMICI });
  if (r && r.sempre) accendiNemiciApp();
  return { tot: r ? r.tot : 0, ok: !!(r && r.ok) };
}

// board PNG: export-assets.py copia le tessere stampate in webapp/assets con il
// nome normalizzato «<TileId>.png» (a monte i file sono «T1 - Nome Tessera.png»,
// e il nome non coincide con quello del JSON — maiuscoletto, apostrofi diversi).
const urlBoard = (tileId) => `/assets/${encodeURI(ctx.ep.cartella)}/board/${tileId}.png`;

// ---------------------------------------------------------- motore a griglia
const dentro = ([x, y]) => x >= 0 && x < 4 && y >= 0 && y < 4;
const chiave = ([x, y]) => `${x},${y}`;
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
const dirExit = (raw) => (raw.match(/^\S+/) || [''])[0];   // "T5 (grata...)" -> "T5"
const OPP = { N: 'S', S: 'N', E: 'O', O: 'E' };
const DELTA = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] };

function arrediSet(tile) {
  const s = new Set((tile.arredi || []).map(([gx, gy]) => chiave([gx, gy])));
  // l'arredo sotto cui si e' trovata l'uscita segreta viene spostato: la sua
  // casella diventa percorribile ed e' li' che il PNG scortato esce
  const u = ctx && ctx.partita && SP() && SP().uscita;
  if (u && u.aperta && u.tile === tile.id) s.delete(chiave(u.cella));
  return s;
}
function vicini([x, y]) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(dentro);
}
// cella-porta di una direzione, replica pickDoorIndex di generate-tiles.js
function portaCella(tile, dir) {
  const occ = new Set((tile.arredi || []).map(([gx, gy]) => `${gx},${3 - gy}`));
  const pref = [1, 2, 0, 3]; let idx = 1;
  for (const i of pref) {
    const key = (dir === 'N' || dir === 'S') ? `${i},${dir === 'N' ? 0 : 3}` : `${dir === 'O' ? 0 : 3},${i}`;
    if (!occ.has(key)) { idx = i; break; }
  }
  if (dir === 'N') return [idx, 3];
  if (dir === 'S') return [idx, 0];
  if (dir === 'E') return [3, 3 - idx];
  return [0, 3 - idx]; // O
}
function dirVerso(tile, versoId) {
  for (const [dir, raw] of Object.entries(tile.exits || {})) if (dirExit(raw) === versoId) return dir;
  return null;
}
const tileDi = (id) => ctx.ep.tessere.find((t) => t.id === id);

// ------------------------------------------------- grafo globale (multi-tile)
// nodo = { t: tileId, x, y }. Disposizione tessere 2D dal grafo delle uscite.
const nk = (n) => `${n.t},${n.x},${n.y}`;
function layout() {
  if (ctx.layout) return ctx.layout;
  const pos = {}; const t0 = ctx.ep.tessere[0].id; pos[t0] = [0, 0];
  const coda = [t0];
  while (coda.length) {
    const id = coda.shift(); const tile = tileDi(id);
    for (const [dir, raw] of Object.entries(tile.exits || {})) {
      const dest = dirExit(raw); if (pos[dest]) continue;
      const [dx, dy] = DELTA[dir];
      pos[dest] = [pos[id][0] + dx, pos[id][1] + dy]; coda.push(dest);
    }
  }
  ctx.layout = pos; return pos;
}
// una grata chiusa blocca la porta
const grataChiusa = (tileId, dir, raw) => /grata/i.test(raw) && !SP().grate.includes(`${tileId}-${dir}`);
// vicini globali di un nodo: 4 caselle interne + attraversamenti di porta.
// allowReveal: le porte verso tessere coperte diventano bersagli "reveal".
function viciniGlob(n, allowReveal) {
  const tile = tileDi(n.t); const out = [];
  for (const [nx, ny] of vicini([n.x, n.y])) {
    if (arrediSet(tile).has(chiave([nx, ny]))) continue;
    out.push({ node: { t: n.t, x: nx, y: ny } });
  }
  for (const [dir, raw] of Object.entries(tile.exits || {})) {
    const dc = portaCella(tile, dir);
    if (dc[0] !== n.x || dc[1] !== n.y) continue;
    if (grataChiusa(n.t, dir, raw)) continue;
    const destId = dirExit(raw); const destTile = tileDi(destId); if (!destTile) continue;
    const back = dirVerso(destTile, n.t) || OPP[dir];
    const entry = portaCella(destTile, back);
    const rivelata = SP().rivelate.includes(destId);
    if (rivelata) out.push({ node: { t: destId, x: entry[0], y: entry[1] } });
    else if (allowReveal) out.push({ node: { t: destId, x: entry[0], y: entry[1] }, reveal: destId });
  }
  return out;
}
// BFS a budget: mappa nodeKey -> { node, dist, reveal, prev }. `blocco` = celle
// muro (nemici/PNG scortati); gli alleati NON bloccano il passaggio ma si passano i
// loro nodi (l'arrivo libero si filtra dopo). I bersagli reveal sono terminali.
function esploraMosse(start, budget, blocco) {
  const info = { [nk(start)]: { node: start, dist: 0 } }; let q = [start];
  while (q.length) {
    const nx = [];
    for (const n of q) {
      const d = info[nk(n)].dist; if (d >= budget) continue;
      for (const nb of viciniGlob(n, true)) {
        const k = nk(nb.node); if (info[k]) continue;
        if (blocco.has(k)) continue;
        info[k] = { node: nb.node, dist: d + 1, reveal: nb.reveal, prev: nk(n) };
        if (!nb.reveal) nx.push(nb.node);
      }
    }
    q = nx;
  }
  return info;
}
// cammino minimo verso goal (per l'IA nemici): niente reveal, muro = blocco
function camminoGlob(start, goal, blocco) {
  const gk = nk(goal);
  const prev = { [nk(start)]: null }; let q = [start];
  while (q.length) {
    const nx = [];
    for (const n of q) {
      for (const nb of viciniGlob(n, false)) {
        const k = nk(nb.node); if (k in prev) continue;
        if (blocco.has(k) && k !== gk) continue;
        prev[k] = nk(n);
        if (k === gk) {
          const path = []; let cur = k;
          while (cur && cur !== nk(start)) { const [t, x, y] = cur.split(','); path.unshift({ t, x: +x, y: +y }); cur = prev[cur]; }
          return path;
        }
        nx.push(nb.node);
      }
    }
    q = nx;
  }
  return [];
}
// celle libere adiacenti a un nodo (per far avvicinare i nemici senza impilarsi
// sull'eroe: si mira alla cella libera vicina, come muovi_verso del simulatore)
function celleAdiacLibere(node, blocco) {
  return viciniGlob(node, false).map((v) => v.node)
    .filter((nd) => !blocco.has(nk(nd)) && !arrediSet(tileDi(nd.t)).has(chiave([nd.x, nd.y])));
}
// adiacenza globale (mischia): stessa tessera Manhattan==1, o attraverso una porta aperta
function adiacGlob(a, b) {
  if (a.t === b.t) return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  const ta = tileDi(a.t);
  for (const [dir, raw] of Object.entries(ta.exits || {})) {
    if (dirExit(raw) !== b.t || grataChiusa(a.t, dir, raw)) continue;
    const dc = portaCella(ta, dir); if (dc[0] !== a.x || dc[1] !== a.y) continue;
    const tb = tileDi(b.t); const back = dirVerso(tb, a.t) || OPP[dir];
    const entry = portaCella(tb, back);
    if (entry[0] === b.x && entry[1] === b.y) return true;
  }
  return false;
}

// ------------------------------------------------------------- dati di gioco
const eroe = (nm) => ctx.comune.eroi.find((e) => e.nome === nm);
const nemStat = (nome) => {
  const base = ctx.comune.nemici.find((n) => n.nome === nome);
  // TARATURA PER EPISODIO: `ep.nemici_mod` puo' ammorbidire (o indurire) i
  // nemici di quell'episodio senza toccare le loro statistiche stampate, che
  // sono condivise fra episodi. Es. `{ dan: -1 }` toglie 1 Danno a tutti; una
  // chiave col nome del nemico lo colpisce solo lui. Serve dove un episodio e'
  // troppo letale nel finale ma i nemici non si possono indebolire altrove.
  const mod = ctx.ep && ctx.ep.nemici_mod;
  if (!base || !mod) return base;
  const delta = mod[nome] || mod.tutti || null;
  if (!delta) return base;
  const out = { ...base };
  for (const k of ['dan', 'att', 'dif', 'fer']) if (delta[k]) out[k] = Math.max(0, (out[k] || 0) + delta[k]);
  return out;
};
const movimento = (nm) => (nm.includes('NINO') ? 4 : 3);
function fascia(taglia) {
  if (taglia === 2 || taglia === 4) return 0;
  if (taglia === 3 || taglia === 5) return 1;
  if (taglia === 6) return 2;
  if (taglia <= 8) return 3;
  return 4;
}
const feriteMaxNem = (st) => st.ferite_per_fascia[fascia(P().party.length)];
function saluteMax(e) {
  const bonus = ctx.comune.regole.salute_bonus_per_taglia[String(P().party.length)] || 0;
  // IL VANTAGGIO D'INDAGINE (stessa formula del tavolo, spedizione.js:62): chi
  // e' arrivato in anticipo o preparato ha +1 Salute massima. Mancava, e la
  // modalita' digitale giocava con un punto in meno a testa rispetto alle
  // regole stampate — piu' dura del gioco vero, per tutti, sempre.
  const tier = (P().vantaggi || {}).tier;
  const bonusTier = (tier === 'slancio' || tier === 'preparati') ? 1 : 0;
  // BONUS SALUTE D'EPISODIO (`ep.salute_extra`): certi episodi concedono Salute
  // in piu' a testa — una regola dell'episodio, stampabile, che non tocca le
  // statistiche dei nemici (condivise). Serve dove la marcia lunga decima il
  // gruppo prima che arrivi in fondo (Atto I-II).
  const extra = ctx.ep.salute_extra || 0;
  return e.salute + bonus + bonusTier + extra;
}
// ------------------------------------------------------------ PNG scortati
// Dato per episodio (webapp/data/epN.json → `scortato`): pedina, prigione,
// tessera-vittoria, prova di liberazione. Regolamento: il PNG non e' un eroe,
// i nemici lo ignorano, si muove nel turno degli eroi (Mov 3) e non agisce.
const specScortati = () => (ctx.ep.scortato || []);
const specScort = (i) => specScortati()[i] || {};
const statoScortati = () => (SP().scortati || []);
const scortAttivo = () => { const v = SP().scortAttivo; return (v === 0 || v > 0) ? v : null; };

// nodi occupati (eroi + nemici + PNG scortati), tranne exclKey. `soloNemici`:
// escludi gli eroi (cammino eroi: gli alleati si attraversano). `senzaScortati`:
// escludi i PNG scortati — nei set di CAMMINO (eroi e nemici li attraversano: si
// passa attraverso, non ci si ferma sopra → l'arrivo usa senzaScortati=false).
function occupati(exclKey, soloNemici, senzaScortati) {
  const sp = SP(); const s = new Set();
  if (!soloNemici) for (const [nm, p] of Object.entries(sp.eroiPos)) { if (`E:${nm}` !== exclKey && p) s.add(nk(p)); }
  sp.nemici.forEach((n, i) => { if (`N:${i}` !== exclKey && n.pos) s.add(nk(n.pos)); });
  if (!senzaScortati) statoScortati().forEach((g, i) => { if (g.liberato && g.pos && exclKey !== `S:${i}`) s.add(nk(g.pos)); });
  return s;
}

// ---------------------------------------------------------------- ingresso
export async function vistaDigitale(app, partita, vaiA) {
  const [ep, comune, carte] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  ctx = { app, partita, ep, comune, carte, vaiA, layout: null };
  abilitaSchede((nm) => comune.eroi.find((x) => x.nome === nm));
  // al tavolo la plancia si guarda in tanti, da lontano e di sbieco: il glide
  // del token rallenta (vedi `.al-tavolo .tok-slot` in app.css) perche' la
  // notte si deve poter SEGUIRE, non indovinare a cose fatte
  app.classList.toggle('al-tavolo', alTavolo());
  // la preferenza «immersivo» sopravvive a un reload (il tablet che si
  // riaddormenta): si riapplica il LAYOUT, non il fullscreen — quello i browser
  // lo concedono solo su un gesto, e chiederlo qui verrebbe rifiutato
  // Il layout immersivo lo accende `render()`, cioe' solo dove c'e' una PLANCIA:
  // non scorre (height:100% e overflow:hidden), e sulla schermata d'ingresso o
  // sull'epilogo — che sono testo — taglierebbe le righe di sotto senza modo di
  // raggiungerle. Qui si spegne, che e' lo stato giusto per l'ingresso.
  app.classList.remove('immersivo');
  if (!partita.spedizione || !partita.spedizione.digitale) return setup();
  migraScortati(partita.spedizione);
  render();
}

// salvataggi precedenti al dato per episodio: il singolo `sp.ruggero` diventa
// la lista `sp.scortati` (una voce per PNG dichiarato in ep.scortato)
function migraScortati(sp) {
  if (sp.scortati) return;
  const vecchio = sp.ruggero;
  sp.scortati = specScortati().map((_, i) => (i === 0 && vecchio
    ? { liberato: !!vecchio.liberato, pos: vecchio.pos || null, mosso: !!vecchio.mosso }
    : { liberato: false, pos: null, mosso: false }));
  sp.scortAttivo = null;
  delete sp.ruggero; delete sp.ruggeroAttivo;
  salvaP();
}

function setup() {
  const { app, ep } = ctx;
  app.innerHTML = `
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">${esc(ep.titolo)}</div><span></span></div>
    <div class="pannello"><h2>tutto a schermo</h2>
      <p>Tutto il sotterraneo è qui: muovete gli eroi a caselle, attraversate le
      porte a piedi per esplorare le stanze, attaccate i nemici adiacenti. I dadi
      si tirano sullo schermo.</p>
      <p class="mt"><b>Obiettivo:</b> ${esc(ep.obiettivo || '')}</p></div>
    <div class="btn-riga"><button class="btn pieno" id="via">si scende →</button></div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  // «si scende» e' un gesto vero: qui lo schermo intero si puo' chiedere subito,
  // e la plancia nasce gia' a tabellone invece di aspettare il primo tocco.
  app.querySelector('#via').onclick = () => {
    if (immersivo()) chiediSchermoIntero(true);
    iniziaPartita();
  };
}

function iniziaPartita() {
  const { ep, partita } = ctx;
  const t0 = ep.tessere[0];
  const entrata = portaCella(t0, t0.start || 'S');
  const occ = new Set(); const celle = celleLibereTile(t0, entrata, partita.party.length, occ);
  const eroiPos = {};
  partita.party.forEach((nm, i) => { eroiPos[nm] = { t: t0.id, x: (celle[i] || entrata)[0], y: (celle[i] || entrata)[1] }; });
  partita.spedizione = {
    // Il Canto non riparte sempre da zero: tre Bivi di campagna (11, 18, 19)
    // promettono un finale che «parte col Dormiente piu' vicino a svegliarsi»,
    // e la Domanda 1 sbagliata dell'Ep.20 lo fa partire da 1. Qui si legge il
    // valore gia' nello stato invece di azzerarlo. Partita nuova = 0 (store.js),
    // e `#via` e' l'unico chiamante, quindi nessuna ripresa puo' ereditarlo.
    digitale: true, round: 1, fase: 'eroi', canto: partita.spedizione?.canto || 0,
    cantoBonus: false, esito: null,
    rivelate: [t0.id], eroiPos, nemici: [],
    // `parte_libero`: certi PNG non vanno liberati, partono col gruppo — il teste
    // dell'Ep.9 esce dalla sacrestia con voi e va portato al Molo. `salute`: e'
    // l'unico che i nemici possono colpire, ed e' li' che sta la tensione.
    scortati: specScortati().map((sc, k) => ({ liberato: !!sc.parte_libero, mosso: false,
      vite: sc.salute || null,
      // chi parte libero e' gia' sul tabellone, accanto al gruppo
      pos: sc.parte_libero ? (() => { const c = celleLibereTile(t0, entrata, partita.party.length + k + 1, new Set())
        .slice(-1)[0] || entrata; return { t: t0.id, x: c[0], y: c[1] }; })() : null })),
    scortAttivo: null, grate: [], uscita: null, uscitaTentati: [],
    vite: Object.fromEntries(partita.party.map((nm) => { const e = eroe(nm); return [nm, e ? saluteMax(e) : 6]; })),
    eroiFatti: [], eroiAttivo: null, azioni: {}, cercate: {}, insidie: {},
    abilita: {}, diversivoPronto: false, storditi: {},
    mazzo: costruisciMazzo(ctx.carte, ep, partita.episodio),
    log: ['Gli eroi sbarcano alla banchina.'],
  };
  salvaP(); render();
}
// n celle libere piu' vicine a start dentro una singola tessera (spawn/ingresso)
function celleLibereTile(tile, start, n, occ) {
  const muro = arrediSet(tile); const out = []; const visti = new Set(); let coda = [start];
  while (coda.length && out.length < n) {
    const next = [];
    for (const c of coda) {
      const k = chiave(c); if (visti.has(k)) continue; visti.add(k);
      if (!muro.has(k) && !occ.has(k)) { out.push(c); occ.add(k); if (out.length >= n) break; }
      next.push(...vicini(c));
    }
    coda = next;
  }
  return out;
}

// --------------------------------------------------------------- rendering
function render() {
  const sp = SP();
  // la plancia c'e': si gioca a tabellone, salvo che il ⤢ non l'abbia spento
  ctx.app.classList.toggle('immersivo', immersivo());
  if (sp.esito) return epilogo();
  if (sp.fase === 'nemici') return faseNemiciAI();
  const { app, ep } = ctx;
  const attivo = eroiAttivoNome();
  const tpk = P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0);
  app.innerHTML = `
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">tutto a schermo</div>
      <span class="sc" style="color:var(--oro-chiaro)">round ${sp.round} · canto ${sp.canto}</span></div>
    <div class="pannello secondario"><p><b>Obiettivo:</b> ${esc(ep.obiettivo || '')}
      ${statoScortati().map((g, i) => (g.liberato && SP().esito == null
        ? ` <span class="ok-txt">— ${esc(specScort(i).nome)} vi segue: riportatelo in ${esc(specScort(i).meta || '')}.</span>` : '')).join('')}</p>
      ${tpk ? '<p class="ko-txt">Tutti gli eroi sono a terra: la notte vince.</p>' : ''}</div>
    <div class="mt"></div>
    <div class="board-area">
      <div class="board-wrap" id="board-wrap">${boardHtml()}</div>
      <div class="zoom-ctrl">
        <button class="zoom-btn" data-zoom="-">−</button>
        <button class="zoom-btn" data-zoom="0">⤢</button>
        <button class="zoom-btn" data-zoom="+">+</button>
      </div>
    </div>
    <p class="nota secondario" style="text-align:center">Trascina per spostare la mappa · +/− o Ctrl+rotella per lo zoom</p>
    <div class="mt"></div>
    <div class="lato">
      <div class="pannello giro"><h2>il giro degli eroi</h2>${giroEroiHtml()}</div>
      <div class="mt"></div>
      <div class="pannello"><h2>azioni di ${scortAttivo() != null ? esc((specScort(scortAttivo()).nome || '').toLowerCase()) : (attivo ? esc(primo(attivo)) : '—')}</h2>${azioniHtml()}</div>
      <div class="mt"></div>
      <div class="pannello"><h2>la salute degli eroi</h2>${saluteHtml()}</div>
    </div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>le abilità degli eroi</h2>${abilitaHtml()}
      <p class="nota mt">«usa» spende una carica (vale come un’azione dell’eroe attivo).</p></div>
    ${sp.nemici.length ? `<div class="mt"></div><div class="pannello secondario"><h2>nemici in campo</h2>${nemiciHtml()}</div>` : ''}
    <div class="mt"></div>
    <div class="pannello secondario"><h2>oggetti del gruppo</h2>${oggettiHtml()}</div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>diario</h2>${logHtml()}</div>
    <div class="btn-riga secondario"><button class="btn" id="sconfitta">gli eroi cadono</button></div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  app.querySelector('#sconfitta').onclick = () => finePartita('sconfitta');
  aggancia();
}

// celle di arrivo raggiungibili dall'eroe (alleati attraversabili, ci si ferma
// solo su celle libere; le porte verso stanze coperte sono bersagli reveal).
// {} se ha gia' mosso o non e' la fase eroi.
function raggEroe(nm) {
  const sp = SP();
  if (sp.fase !== 'eroi' || azioneSpesa(nm, 'muovere') || !azioniRestano(nm)) return {};
  const start = sp.eroiPos[nm];
  const info = esploraMosse(start, movimento(nm), occupati(`E:${nm}`, true, true));  // solo nemici murano (alleati e PNG scortati attraversabili)
  const tuttiOcc = occupati(`E:${nm}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || tuttiOcc.has(k)) continue; out[k] = v; }
  return out;
}

// ESCA PREZIOSA di Carbone: le caselle dove il monile puo' arrivare — entro 3,
// libere, in stanze gia' rivelate. Stessa esplorazione del movimento, budget 3:
// un monile lanciato non passa i muri piu' di quanto ci passi un uomo.
function celleEsca(nm) {
  const sp = SP(); const start = sp.eroiPos[nm];
  if (!start) return {};
  const info = esploraMosse(start, 3, occupati(`E:${nm}`, true, true));
  const occ = occupati(`E:${nm}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || v.reveal || occ.has(k)) continue; out[k] = v; }
  return out;
}

// `senzaMosse`: la plancia disegnata mentre agisce la notte non accende le
// caselle dell'eroe. NON si puo' dedurre da `SP().fase`, e il test lo ha
// dimostrato: la fase nemici COMMITTA lo stato prima di animare, quindi
// mentre i token dei nemici scorrono la partita risulta gia' tornata agli
// eroi. Lo sa solo chi sta disegnando, e infatti glielo si chiede.
function boardHtml(senzaMosse) {
  const sp = SP(); const lay = layout(); const rev = sp.rivelate;
  // tessere di frontiera (coperte, vicine a una rivelata): si disegnano come
  // segnaposto scuro cosi' la porta e la sua cella-reveal cadono DENTRO il
  // board (altrimenti finirebbero fuori dai bounds, clippate e non cliccabili).
  const frontiera = new Set();
  for (const id of rev) { const tile = tileDi(id); for (const raw of Object.values(tile.exits || {})) { const d = dirExit(raw); if (!rev.includes(d) && lay[d]) frontiera.add(d); } }
  const mostrate = [...rev, ...frontiera];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const id of mostrate) { const [x, y] = lay[id]; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const cols = (maxX - minX + 1) * 4, rows = (maxY - minY + 1) * 4;
  const cell = 104;  // tessere grandi (come la board singola); si naviga con pan + zoom
  // `minX/maxY/cell` per centrare la finestra sulla tessera piu' affollata;
  // `w/h` sono l'ingombro del piano in pixel a zoom 1, e servono a `fitZoom()`
  // per calcolare quanto ingrandire perche' la plancia entri nello spazio.
  ctx._geo = { minX, maxY, cell, w: cols * cell, h: rows * cell };
  const scr = (n) => { const [TX, TY] = lay[n.t]; return { l: ((TX - minX) * 4 + n.x) * cell, t: ((maxY - TY) * 4 + (3 - n.y)) * cell }; };
  const attivo = eroiAttivoNome();

  // Mentre agisce la notte NON si accende niente: le caselle turchesi
  // dell'eroe attivo restavano accese durante il turno dei nemici, e sembrava
  // di poter giocare mentre invece si aspetta.
  const ragg = senzaMosse ? {}
    : sp.escaModo ? celleEsca(sp.escaModo)
    : attivo ? raggEroe(attivo) : (scortAttivo() != null ? raggScortato(scortAttivo()) : {});

  // blocchi tessera: rivelate (sfondo + griglia) e frontiera (coperte, scure)
  const tiles = mostrate.map((id) => {
    const [TX, TY] = lay[id]; const left = (TX - minX) * 4 * cell, top = (maxY - TY) * 4 * cell, size = 4 * cell;
    if (!rev.includes(id)) {
      return `<div class="tessera-b coperta" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px">
        <div class="tess-tag">${id} · ?</div></div>`;
    }
    const tile = tileDi(id); const arr = arrediSet(tile);
    let cells = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const gx = c, gy = 3 - r; const a = arr.has(chiave([gx, gy]));
      cells += `<div class="cella-b${a ? ' arredo' : ''}" style="left:${c * cell}px;top:${r * cell}px;width:${cell}px;height:${cell}px"></div>`;
    }
    const bg = urlBoard(id);
    return `<div class="tessera-b" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px;${bg ? `background-image:url('${bg}')` : ''}">
      ${cells}<div class="tess-tag">${id}</div></div>`;
  }).join('');

  // etichette DOM leggibili su porte e ingresso (il testo stampato nel PNG e'
  // troppo piccolo a schermo; queste scalano con la tessera). pointer-events:none.
  const fs = Math.round(cell * 0.16);
  const etichette = rev.map((id) => {
    const tile = tileDi(id); const out = [];
    for (const [dir, raw] of Object.entries(tile.exits || {})) {
      const dc = portaCella(tile, dir); const p = scr({ t: id, x: dc[0], y: dc[1] });
      const grata = /grata/i.test(raw);
      out.push(`<div class="porta-lbl" style="left:${p.l + cell / 2}px;top:${p.t + cell / 2}px;font-size:${fs}px">verso ${dirExit(raw)}${grata ? ' ⛓' : ''}</div>`);
    }
    if (tile.start) { const dc = portaCella(tile, tile.start); const p = scr({ t: id, x: dc[0], y: dc[1] }); out.push(`<div class="porta-lbl ingresso" style="left:${p.l + cell / 2}px;top:${p.t + cell / 2}px;font-size:${fs}px">ingresso</div>`); }
    return out.join('');
  }).join('');

  // celle raggiungibili (cliccabili) sopra le tessere
  const raggHtml = Object.values(ragg).map((v) => {
    const p = scr(v.node);
    return `<div class="cella-mossa${v.reveal ? ' reveal' : ''}" style="left:${p.l}px;top:${p.t}px;width:${cell}px;height:${cell}px"
      data-t="${v.node.t}" data-x="${v.node.x}" data-y="${v.node.y}"${v.reveal ? ` data-reveal="${v.reveal}"` : ''}></div>`;
  }).join('');

  // token — `data-tok` sul .tok-slot per indirizzarlo nell'animazione (N:i / E:nome / R)
  const toks = [];
  const tok = (n, inner, dataTok) => { const p = scr(n); toks.push(`<div class="tok-slot" data-tok="${dataTok}" style="left:${p.l}px;top:${p.t}px;width:${cell}px;height:${cell}px">${inner}</div>`); };
  for (const [nm, p] of Object.entries(sp.eroiPos)) {
    const e = eroe(nm); const giu = (viteVista(nm) ?? 0) <= 0;
    tok(p, `<span class="tok-board eroe${nm === attivo ? ' attivo' : ''}${giu ? ' giu' : ''}" data-eroe="${esc(nm)}" title="${esc(nm)}">
      ${e && e.art ? `<img src="${urlArt(e.art)}" alt="" loading="lazy">` : ''}</span>`, `E:${esc(nm)}`);
  }
  sp.nemici.forEach((n, i) => {
    if (!n.pos) return; const st = nemStat(n.nome); const boss = st && st.boss ? ' boss' : '';
    tok(n.pos, `<span class="tok-board nemico${boss}" data-nemico="${i}" title="${esc(n.nome)} ${n.ferite}/${n.max}">
      ${st && st.art ? `<img src="${urlArt(st.art)}" alt="" loading="lazy">` : ''}</span>`, `N:${i}`);
  });
  statoScortati().forEach((g, i) => {
    if (!g.liberato || !g.pos) return; const s = specScort(i);
    tok(g.pos, `<span class="tok-board scortato${scortAttivo() === i ? ' attivo' : ''}" data-scortato="${i}" title="${esc(s.nome || '')}">
      ${s.art ? `<img src="${urlArt(s.art)}" alt="">` : ''}</span>`, `S:${i}`);
  });
  if (sp.esca) tok(sp.esca, '<span class="tok-board esca" title="l’esca di Carbone">◆</span>', 'ESCA');

  return `<div class="board-digitale" style="width:${cols * cell}px;height:${rows * cell}px;zoom:${SP().zoom || 1}">
    ${tiles}${etichette}${raggHtml}${toks.join('')}</div>`;
}

function logHtml() {
  const sp = SP();
  return `<div class="diario">${sp.log.slice(-6).map((l) => `<p class="nota">${esc(l)}</p>`).join('')}</div>`;
}
// Salute MOSTRATA. Nella fase nemici lo stato e' gia' committato prima
// dell'animazione (cosi' un reload trova una fase eroi coerente): senza questo
// filtro il board disegnerebbe subito a terra chi cade a meta' animazione, e si
// vedrebbero i nemici accanirsi su un corpo. `ctx.viteVista` e' la fotografia a
// inizio fase, aggiornata colpo per colpo mentre l'animazione scorre.
const viteVista = (nm) => (ctx.viteVista ? ctx.viteVista[nm] : SP().vite[nm]);
function saluteHtml() {
  return P().party.map((nm) => {
    const e = eroe(nm); const max = saluteMax(e); const v = viteVista(nm) ?? max;
    return `<div class="nemico-riga"><span class="nemico-nome"><button class="lnk-eroe" data-scheda="${esc(nm)}"
      title="scheda di ${esc(nm.toLowerCase())}">${esc(primo(nm))}</button>${v <= 0 ? ' <b>a terra</b>' : ''}</span>
      <span class="nemico-pips">${Array.from({ length: max }, (_, k) => `<span class="pip-vita ${k < v ? 'piena' : ''}"></span>`).join('')}</span></div>`;
  }).join('');
}
function nemiciHtml() {
  const sp = SP();
  return sp.nemici.map((n) => {
    const st = nemStat(n.nome);
    return `<div class="nemico-riga"><span class="nemico-nome">${esc(n.nome.toLowerCase())}${n.num > 1 ? ' ' + n.num : ''}
      <span class="nota">${esc(n.pos ? n.pos.t : '?')} · Att +${st.att} · Dif ${st.dif} · Dan ${st.dan}</span></span>
      <span class="nemico-pips">${Array.from({ length: n.max }, (_, k) => `<span class="pip-ferita ${k < n.ferite ? 'piena' : ''}"></span>`).join('')}</span></div>`;
  }).join('');
}
const primo = (nome) => {
  const toks = String(nome).split(' ').filter(Boolean);
  const t = (toks[0] === 'DOTT.' || toks[0] === 'PADRE') ? (toks[1] || toks[0]) : toks[0];
  return t.replace(/["“”]/g, '').toLowerCase();
};
function eroiAttivoNome() {
  const sp = SP(); const fatti = sp.eroiFatti || [];
  if (scortAttivo() != null) return null;        // PNG scortato selezionato: nessun eroe attivo
  const vivi = P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (sp.eroiAttivo && vivi.includes(sp.eroiAttivo) && !fatti.includes(sp.eroiAttivo)) return sp.eroiAttivo;
  return vivi.find((nm) => !fatti.includes(nm)) || null;
}
function giroEroiHtml() {
  const sp = SP(); const fatti = sp.eroiFatti || []; const attivo = eroiAttivoNome();
  const chips = P().party.map((nm) => {
    const e = eroe(nm); const done = fatti.includes(nm); const giu = (sp.vite[nm] ?? 0) <= 0;
    // `eroe`: la striscia dei turni la usano anche i nemici, con le stesse
    // classi — senza questo il CSS non puo' dare all'eroe di turno un colore
    // diverso da quello del nemico di turno (vedi `.chip-turno.ritratto.eroe`)
    return `<button class="chip-turno ritratto eroe${nm === attivo ? ' attivo' : ''}${done || giu ? ' fatto' : ''}" data-turno="${esc(nm)}">
      <span class="rit"><img src="${e && e.art ? urlArt(e.art) : ''}" alt=""></span><span class="et">${done ? '✓ ' : ''}${esc(primo(nm))}</span></button>`;
  });
  // chip dei PNG scortati: unità mosse dal giocatore (Mov 3, non agiscono)
  statoScortati().forEach((g, i) => {
    if (!g.liberato) return; const s = specScort(i);
    chips.push(`<button class="chip-turno ritratto scortato${scortAttivo() === i ? ' attivo' : ''}${g.mosso ? ' fatto' : ''}" data-scortato-chip="${i}">
      <span class="rit"><img src="${s.art ? urlArt(s.art) : ''}" alt=""></span><span class="et">${g.mosso ? '✓ ' : ''}${esc((s.nome || '').toLowerCase())}</span></button>`);
  });
  return `<div class="giro-strip">${chips.join('')}</div>`;
}
// celle raggiungibili da un PNG scortato (Mov 3): passa per eroi/porte, blocca
// sui nemici, non rivela tessere, non si ferma su celle occupate
function raggScortato(i) {
  const g = statoScortati()[i];
  if (scortAttivo() !== i || !g || !g.liberato || !g.pos) return {};
  const info = esploraMosse(g.pos, specScort(i).mov || 3, occupati(`S:${i}`, true, true));  // solo nemici murano
  const tuttiOcc = occupati(`S:${i}`, false);
  const out = {};
  for (const [k, v] of Object.entries(info)) { if (v.dist === 0 || v.reveal || tuttiOcc.has(k)) continue; out[k] = v; }
  return out;
}

// ------------------------------------------------------------------ azioni
const tipiAzione = { muovere: 'Muovere', attaccare: 'Attaccare', cercare: 'Cercare', interagire: 'Interagire', rianimare: 'Rianimare', abilita: 'Abilità', oggetto: 'Oggetto' };
const azioniOf = (nm) => (SP().azioni[nm] || []);
const azioneSpesa = (nm, tipo) => azioniOf(nm).includes(tipo);
// un eroe stordito (insidia/fumi) ha 1 sola azione nel round indicato
const stordito = (nm) => (SP().storditi && SP().storditi[nm] === SP().round);
// SLANCIO: nel primo round ogni eroe ha 3 azioni invece di 2 (sempre di tipo
// diverso). Il tavolo lo annuncia da sempre (spedizione.js:236); il digitale
// non lo applicava, quindi il vantaggio piu' alto dell'Indagine valeva zero.
const azioniMax = (nm) => (stordito(nm) ? 1
  : (SP().round === 1 && (P().vantaggi || {}).tier === 'slancio') ? 3 : 2);
const azioniRestano = (nm) => azioniOf(nm).length < azioniMax(nm);

function azioniHtml() {
  const sp = SP();
  const iS = scortAttivo();
  if (iS != null) {
    const s = specScort(iS); const mov = s.mov || 3; const nome = s.nome || 'il PNG';
    const n = Object.keys(raggScortato(iS)).length;
    return `<p class="nota">Tocca a <b>${esc(nome)}</b> — si muove con voi (Mov ${mov}), <b>non compie azioni</b>.</p>
      <p class="nota mt">${n ? `▸ Tocca una <b class="verde">casella verde</b> per muovere ${esc(nome)} (fino a ${mov} caselle). Portalo in <b>${esc(s.meta || '')}</b> per vincere.` : `▸ ${esc(nome)} non ha caselle libere raggiungibili (nemici o arredi intorno).`}</p>
      <div class="btn-riga mt"><button class="btn pieno" id="rug-fine">${esc(nome)} ha finito →</button></div>`;
  }
  const attivo = eroiAttivoNome();
  if (!attivo) {
    // PNG scortati liberati e non ancora mossi: il loro turno va OFFERTO qui,
    // altrimenti non arriva mai (si muovono nel turno degli eroi, che e' finito)
    const daMuovere = statoScortati()
      .map((g, i) => ({ g, i })).filter(({ g }) => g.liberato && g.pos && !g.mosso);
    return `<p class="nota">Tutti gli eroi hanno agito.${daMuovere.length
      ? ` Prima che la notte reagisca, ${daMuovere.map(({ i }) => `<b>${esc(specScort(i).nome)}</b>`).join(' e ')} può ancora seguirvi.`
      : ' La notte reagisce.'}</p>
      <div class="btn-riga">
        ${daMuovere.map(({ i }) => `<button class="btn" data-scortato-chip="${i}">muovi ${esc((specScort(i).nome || '').toLowerCase())} →</button>`).join('')}
        <button class="btn${daMuovere.length ? '' : ' pieno'}" id="fase-minaccia">fase minaccia →</button>
      </div>`;
  }
  const fatte = azioniOf(attivo);
  const inter = interazioneDisponibile(attivo);
  const pos = sp.eroiPos[attivo];
  const giuVicino = P().party.some((nm) => nm !== attivo && (sp.vite[nm] ?? 1) <= 0 && adiacGlob(pos, sp.eroiPos[nm]));
  // riga movimento contestuale: gia' mosso / bloccato / caselle disponibili
  const mosseSpese = azioneSpesa(attivo, 'muovere');
  const nMosse = mosseSpese ? 0 : Object.keys(raggEroe(attivo)).length;
  const rigaMossa = mosseSpese
    ? `▸ <b>${esc(primo(attivo))}</b> ha già usato il movimento (1 per turno): ora può attaccare, cercare o passare.`
    : nMosse
      ? `▸ Tocca una <b class="verde">casella verde</b> per muovere ${esc(primo(attivo))} (fino a ${movimento(attivo)} caselle; le porte si attraversano a piedi, le caselle <b class="oro">dorate</b> rivelano una stanza nuova).`
      : `▸ Nessuna casella raggiungibile: ${esc(primo(attivo))} è <b>bloccato</b> (nemici o arredi tutt'intorno). Può attaccare un nemico adiacente, cercare o passare.`;
  return `
    <p class="nota">Tocca a <b>${esc(primo(attivo))}</b> — ${fatte.length}/${azioniMax(attivo)} azioni${fatte.length ? ' (' + fatte.map((t) => tipiAzione[t]).join(', ') + ')' : ''}${stordito(attivo) ? ' <b class="ko-txt">· stordito (1 azione)</b>' : ''}.</p>
    <p class="nota mt">${rigaMossa}<br>
    ▸ Tocca un <b>nemico adiacente</b> per attaccarlo.<br>
    ▸ Tocca un'altra <b>pedina</b> sul board per farla agire.</p>
    <div class="btn-riga mt">
      ${inter && azioniRestano(attivo) && !azioneSpesa(attivo, 'interagire') ? `<button class="btn" id="az-interagire">${esc(inter.label)}</button>` : ''}
      ${giuVicino && azioniRestano(attivo) && !azioneSpesa(attivo, 'rianimare') ? '<button class="btn" id="az-rianimare">Rianimare</button>' : ''}
      ${azioniRestano(attivo) && !azioneSpesa(attivo, 'cercare') ? '<button class="btn" id="az-cercare">Cercare</button>' : ''}
      ${azioniRestano(attivo) && (P().indagine.oggetti || []).length ? '<button class="btn" id="az-oggetto">Usa oggetto</button>' : ''}
      <button class="btn pieno" id="az-fine">«${esc(primo(attivo))}» ha finito →</button>
    </div>`;
}

// ------------------------------------------- abilità di spedizione (cariche)
const CARICHE_SPED = [
  { key: 'ATTILIO', ab: 'Pronto Soccorso', usi: 3, eff: 'cura', nota: 'Cura 2 Salute a sé o a un eroe adiacente.' },
  { key: 'SIBILLA', ab: 'Sesto Senso', usi: 3, eff: 'scruta', nota: 'Guarda le prossime 2 carte Minaccia e mettine una in fondo al mazzo.' },
  { key: 'SERRA', ab: 'Voce ferma', usi: 3, eff: 'voce', nota: 'Fino al tuo prossimo turno gli eroi adiacenti tirano NERVI con +2.' },
  { key: 'CARLA', ab: 'Flash!', usi: 2, eff: 'flash', nota: 'Un nemico entro 2 caselle salta la sua prossima attivazione.' },
  { key: 'CARBONE', ab: 'Esca preziosa', usi: 2, eff: 'esca', nota: 'I nemici entro 2 caselle dall’esca vanno verso di essa nel loro turno.' },
  { key: 'FANTI', ab: 'Diversivo', usi: 2, eff: 'diversivo', nota: 'La prossima Fase Minaccia pesca 1 carta in meno.' },
  { key: 'MARANI', ab: 'Litania', usi: 1, eff: 'litania', nota: 'Rimuove 1 segnalino Canto.' },
  { key: 'BRERA', ab: 'Vi conosco, Malacarne', usi: 1, eff: 'malacarne', nota: 'Rimuove un nemico di truppa (Malavita/Adepto/Cane) in campo.' },
  { key: 'OTTONE', ab: 'Colpo da macello', usi: null, nota: '1 per turno: se abbatte un nemico in mischia, attacca subito un altro adiacente.' },
];
const caricaDi = (nome) => CARICHE_SPED.find((c) => nome.includes(c.key));

function abilitaHtml() {
  const sp = SP(); const attivo = eroiAttivoNome();
  const righe = P().party.map((nm) => {
    const c = caricaDi(nm); if (!c) return '';
    const breve = primo(nm);
    if (c.usi === null) {
      return `<div class="nemico-riga"><span class="nemico-nome">${esc(breve)} · ${esc(c.ab.toLowerCase())}<br><span class="nota">${esc(c.nota)}</span></span>
        <span class="nota">automatica</span></div>`;
    }
    const usate = (sp.abilita && sp.abilita[nm]) || 0; const rest = c.usi - usate;
    const pips = Array.from({ length: c.usi }, (_, k) => `<span class="pip-vita ${k < rest ? 'piena' : ''}"></span>`).join('');
    const puo = nm === attivo && rest > 0 && azioniRestano(nm) && sp.fase === 'eroi';
    return `<div class="nemico-riga">
      <span class="nemico-nome">${esc(breve)} · ${esc(c.ab.toLowerCase())}<br><span class="nota">${esc(c.nota)}</span></span>
      <span class="nemico-comandi"><span class="nemico-pips">${pips}</span>
        ${puo ? `<button class="btn attacca" data-abil="${esc(nm)}">usa</button>` : ''}</span></div>`;
  }).join('');
  return righe || '<p class="nota">Nessun eroe con abilità a cariche in questo party.</p>';
}

// selezione bersaglio (overlay) — riusa lo stile .scelta-overlay del tavolo
function scegli(titolo, opzioni) {
  return new Promise((ris) => {
    const ov = document.createElement('div'); ov.className = 'scelta-overlay';
    ov.innerHTML = `<div class="scelta-box"><h3 class="sc">${esc(titolo)}</h3>
      ${opzioni.map((o) => `<button class="btn scelta-btn" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      <button class="btn scelta-btn annulla" data-id="">annulla</button></div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('button').forEach((b) => b.onclick = () => { ov.remove(); ris(b.dataset.id || null); });
  });
}

// distanza (in caselle-cammino) tra due nodi, ignorando i blocchi (per gittate/raggi)
function distGlob(a, b) { const p = camminoGlob(a, b, new Set()); return p.length; }

async function usaAbilita(nm) {
  const sp = SP(); const c = caricaDi(nm); if (!c || c.usi === null) return;
  const usate = (sp.abilita && sp.abilita[nm]) || 0; if (usate >= c.usi) return;
  if (!azioniRestano(nm)) { flash('Nessuna azione rimasta.'); return; }
  let fatto = true;
  if (c.eff === 'litania') { sp.canto = Math.max(0, sp.canto - 1); log(`${primo(nm)} intona la Litania: −1 Canto (${sp.canto}).`); }
  else if (c.eff === 'diversivo') { sp.diversivoPronto = true; log(`${primo(nm)}: la prossima Minaccia pesca 1 carta in meno.`); }
  else if (c.eff === 'cura') {
    const cand = [nm, ...P().party.filter((x) => x !== nm && (sp.vite[x] ?? 0) > 0 && adiacGlob(sp.eroiPos[nm], sp.eroiPos[x]))];
    const chi = await scegli('curare chi? (+2 Salute)', cand.map((x) => ({ id: x, label: `${primo(x)} (${sp.vite[x]})` })));
    if (!chi) return; const e = eroe(chi); sp.vite[chi] = Math.min(saluteMax(e), (sp.vite[chi] ?? 0) + 2);
    log(`${primo(nm)} cura ${primo(chi)} (+2 → ${sp.vite[chi]}).`);
  } else if (c.eff === 'flash') {
    const cand = sp.nemici.map((n, i) => ({ n, i })).filter(({ n }) => n.pos && distGlob(sp.eroiPos[nm], n.pos) <= 2 && distGlob(sp.eroiPos[nm], n.pos) > 0);
    if (!cand.length) { flash('Nessun nemico entro 2 caselle.'); return; }
    const idx = await scegli('Flash! su quale nemico?', cand.map(({ n, i }) => ({ id: String(i), label: `${n.nome.toLowerCase()} (${n.pos.t})` })));
    if (idx == null) return; sp.nemici[Number(idx)].flash = true; log(`${primo(nm)} acceca ${sp.nemici[Number(idx)].nome.toLowerCase()}: salta la prossima attivazione.`);
  } else if (c.eff === 'malacarne') {
    const truppa = sp.nemici.map((n, i) => ({ n, i })).filter(({ n }) => /malavita|cultista|cane/i.test(nemStat(n.nome).tipo || ''));
    if (!truppa.length) { flash('Nessun nemico di truppa in campo.'); return; }
    const idx = await scegli('Malacarne: chi allontani?', truppa.map(({ n, i }) => ({ id: String(i), label: `${n.nome.toLowerCase()} (${n.pos ? n.pos.t : '?'})` })));
    if (idx == null) return; const via = sp.nemici.splice(Number(idx), 1)[0]; log(`${primo(nm)} chiama per nome ${via.nome.toLowerCase()}: se ne va.`);
  } else if (c.eff === 'scruta') {
    const m = sp.mazzo; const rem = m.ordine.length - m.indice;
    if (rem <= 0) { flash('Mazzo Minaccia esaurito.'); return; }
    const t0 = m.pool[m.ordine[m.indice]];
    const t1 = rem >= 2 ? m.pool[m.ordine[m.indice + 1]] : null;
    const opz = [{ id: '0', label: `↓ in fondo: ${t0}` }];
    if (t1) opz.push({ id: '1', label: `↓ in fondo: ${t1}` });
    opz.push({ id: 'skip', label: 'lascia l’ordine com’è' });
    const scelta = await scegli('Sesto Senso — quale mandi in fondo?', opz);
    if (scelta == null) return;
    if (scelta === '0') { const [x] = m.ordine.splice(m.indice, 1); m.ordine.push(x); log(`Sibilla manda in fondo «${t0.toLowerCase()}».`); }
    else if (scelta === '1') { const [x] = m.ordine.splice(m.indice + 1, 1); m.ordine.push(x); log(`Sibilla manda in fondo «${t1.toLowerCase()}».`); }
    else log('Sibilla scruta il mazzo e lascia l’ordine.');
  } else if (c.eff === 'voce') {
    // «fino al suo prossimo turno»: copre il resto di questo round (Minaccia e
    // notte comprese) e l'inizio del prossimo finche' Serra non agisce.
    sp.voceFerma = { da: nm, round: sp.round };
    log(`${primo(nm)} tiene la voce ferma: gli eroi adiacenti tirano NERVI con +2 fino al suo prossimo turno.`);
  } else if (c.eff === 'esca') {
    // Il monile si lancia su una casella: il tabellone accende i bersagli
    // entro 3 e la carica si spende quando la casella e' scelta, non prima.
    sp.escaModo = nm; salvaP(); render();
    flash('Tocca la casella dove lanciare l’esca (entro 3).');
    return;
  } else {
    log(`${primo(nm)} usa ${c.ab.toLowerCase()} (${c.nota})`);
  }
  if (fatto) { sp.abilita = sp.abilita || {}; sp.abilita[nm] = usate + 1; salvaP(); segnaAzione(nm, 'abilita'); }
}

// VOCE FERMA di Serra: +2 alle prove NERVI degli eroi a lui adiacenti. Vale
// «fino al suo prossimo turno» — cioe' per tutto il round in cui la usa, e nel
// round dopo finche' Serra non ha ancora speso un'azione. L'adiacenza si
// guarda al momento del tiro, non a quello dell'abilita': e' la sua voce che
// arriva, e se ti allontani non ti arriva piu'.
function bonusVoce(nm, stat) {
  const sp = SP(); const v = sp.voceFerma;
  if (!v || String(stat).toLowerCase() !== 'nervi' || v.da === nm) return [];
  const ancora = sp.round === v.round
    || (sp.round === v.round + 1 && !(sp.azioni[v.da] || []).length);
  if (!ancora || (sp.vite[v.da] ?? 0) <= 0) return [];
  if (!sp.eroiPos[nm] || !sp.eroiPos[v.da] || !adiacGlob(sp.eroiPos[nm], sp.eroiPos[v.da])) return [];
  return [{ label: `Voce ferma di ${primo(v.da)}`, val: 2 }];
}

// una prova richiesta da un testo (oggetto/tessera/carta): "... NERVI (Media) ..."
function provaRichiesta(text) {
  const m = String(text || '').match(/(NERVI|ACUME|VIGORE)\s*\((Facile|Media|Difficile)\)/i);
  if (!m) return null;
  return { stat: m[1].toLowerCase(), diff: m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() };
}
// applica la conseguenza di una prova fallita in base al testo (danno e/o
// stordimento); ritorna le righe da mostrare. Il salvataggio lo fa il chiamante.
function applicaConseguenza(nm, testo) {
  const sp = SP(); const e = eroe(nm); const out = [];
  if (/danno/i.test(testo)) { sp.vite[nm] = Math.max(0, (sp.vite[nm] ?? saluteMax(e)) - 1); out.push(`${primo(nm)} subisce 1 danno.`); }
  if (/(1 sola azione|perdete 1 azione|perde 1 azione|azione al prossimo turno)/i.test(testo)) {
    sp.storditi = sp.storditi || {}; sp.storditi[nm] = sp.round + 1; out.push(`${primo(nm)} è stordito: 1 sola azione al prossimo turno.`);
  }
  if (!out.length) out.push(`${primo(nm)}: applica la conseguenza descritta.`);
  return out;
}
// eroe piu' avanzato = sulla tessera rivelata piu' lontana da T1 (origine layout)
function eroePiuAvanzato(vivi) {
  const lay = layout(); let best = vivi[0], bd = -1;
  for (const nm of vivi) { const [x, y] = lay[SP().eroiPos[nm].t] || [0, 0]; const d = Math.abs(x) + Math.abs(y); if (d > bd) { bd = d; best = nm; } }
  return best;
}
// chi subisce l'insidia di una carta Minaccia, dal testo
async function bersagliInsidia(rules) {
  const vivi = P().party.filter((nm) => (SP().vite[nm] ?? 0) > 0);
  if (!vivi.length) return [];
  if (/ogni eroe/i.test(rules)) return vivi;
  if (/pi(ù|u') avanzat/i.test(rules)) return [eroePiuAvanzato(vivi)];
  const chi = await scegli('Quale eroe affronta l’insidia?', vivi.map((nm) => ({ id: nm, label: primo(nm) })));
  return chi ? [chi] : [];
}
// carta Minaccia con eventuale prova d'insidia (nessun eroe attivo in questa fase)
function messaggioCarta(titolo, carta, annunci) {
  return new Promise((ok) => {
    const { app } = ctx; const req = provaRichiesta(carta.rules);
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">
        <div class="carta-grande"><img src="${urlCarta(carta.file)}" alt=""></div>
        <p class="mt">${rendi(carta.rules)}</p>
        ${annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join('')}
        <div id="ins-esito"></div>
      </div>
      ${req ? '<p class="nota mt"><b class="ko-txt">Insidia:</b> risolvete la prova prima di continuare.</p>' : ''}
      <div class="btn-riga">
        ${req ? '<button class="btn pieno" id="ins-risolvi">🎲 risolvi la prova richiesta</button>' : ''}
        <button class="btn pieno" id="ok-msg"${req ? ' style="display:none"' : ''}>continua</button>
      </div>`;
    app.querySelector('#ok-msg').onclick = ok;
    const rb = app.querySelector('#ins-risolvi');
    if (rb) rb.onclick = async () => {
      rb.disabled = true;
      const targets = await bersagliInsidia(carta.rules);
      if (!targets.length) { rb.disabled = false; return; }
      const esiti = [];
      for (const t of targets) {
        const e = eroe(t);
        const r = await tiraProva({ titolo: `${req.stat.toUpperCase()} — ${primo(t)}`, diffLabel: req.diff,
          soglia: ctx.comune.regole.diff[req.diff],
          bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }, ...bonusVoce(t, req.stat)], modo: modoDadi() });
        if (r == null) { rb.disabled = false; return; }
        if (r.ok) esiti.push(`${primo(t)}: prova superata.`);
        else esiti.push(...applicaConseguenza(t, carta.rules));
      }
      salvaP();
      app.querySelector('#ins-esito').innerHTML = esiti.map((x) => `<p class="nota mt">${esc(x)}</p>`).join('');
      rb.style.display = 'none';
      app.querySelector('#ok-msg').style.display = '';   // sblocca «continua» solo dopo la prova
    };
  });
}

// messaggio con eventuale prova CONTESTUALE: se provaText richiede una prova,
// compare il tiro; l'esito applica 1 danno se il testo lo prevede in caso di fallimento.
function messaggioProva(titolo, corpo, provaText, nm) {
  return new Promise((ok) => {
    const req = provaRichiesta(provaText); const { app } = ctx;
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">${corpo}<div id="prova-esito"></div></div>
      <div class="btn-riga">
        ${req && nm ? `<button class="btn" id="msg-prova">🎲 tira la prova (${req.stat.toUpperCase()} ${req.diff})</button>` : ''}
        <button class="btn pieno" id="ok-msg">continua</button>
      </div>`;
    app.querySelector('#ok-msg').onclick = ok;
    const pb = app.querySelector('#msg-prova');
    if (pb) pb.onclick = async () => {
      pb.disabled = true; const e = eroe(nm); const sp = SP();
      const r = await tiraProva({ titolo: `${req.stat.toUpperCase()} — ${primo(nm)}`, diffLabel: req.diff,
        soglia: ctx.comune.regole.diff[req.diff],
        bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }, ...bonusVoce(nm, req.stat)], modo: modoDadi() });
      if (r == null) { pb.disabled = false; return; }
      let out = r.ok ? '<p class="ok-txt mt">Prova superata.</p>' : '<p class="ko-txt mt">Prova fallita.</p>';
      if (!r.ok) { out += applicaConseguenza(nm, provaText).map((x) => `<p class="nota">${esc(x)}</p>`).join(''); salvaP(); }
      app.querySelector('#prova-esito').innerHTML = out;
    };
  });
}

// interazione a portata dell'eroe: grata da aprire, o PNG scortato da liberare
function interazioneDisponibile(nm) {
  const sp = SP(); const pos = sp.eroiPos[nm]; const tile = tileDi(pos.t);
  // grata: l'eroe e' sulla cella-porta con grata chiusa
  for (const [dir, raw] of Object.entries(tile.exits || {})) {
    if (grataChiusa(pos.t, dir, raw)) { const dc = portaCella(tile, dir); if (dc[0] === pos.x && dc[1] === pos.y) return { tipo: 'grata', dir, label: `Apri la grata → ${dirExit(raw)}` }; }
  }
  const i = scortLiberabile(pos);
  if (i != null) return { tipo: 'scortato', i, label: specScort(i).etichetta || `Libera ${specScort(i).nome} (Interagire)` };
  // uscita segreta: il PNG liberato la indica, ma dice solo la STANZA. Quale
  // arredo la nasconda lo sa solo chi tiene il fascicolo: frugare sotto quello
  // sbagliato costa comunque l'azione.
  const a = arredoUscita(pos);
  if (a) return { tipo: 'uscita', arredo: a, label: `Sposta ${String(a[2]).toLowerCase()} — l'uscita che indica ${nomeScortato()} (Interagire)` };
  // compito d'episodio: le canne da sfregiare, i movimenti da spegnere, le
  // casse da sequestrare — l'obiettivo vero di quindici episodi su ventuno
  const c = compitoDisponibile(pos);
  // il compito bloccato si MOSTRA lo stesso, con la ragione: un bottone che
  // sparisce senza spiegazioni e' il modo migliore per far credere che il
  // gioco sia rotto proprio quando invece sta applicando la regola stampata
  if (c && c.fuoriPosto) return { tipo: 'compito', c, bloccato: true,
    label: `${c.etichetta} — non qui: si fa in ${c.fuoriPosto}` };
  if (c && c.bloccato) return { tipo: 'compito', c, bloccato: true,
    label: `${c.etichetta} — prima a ${c.soglia} Ferite (${c.bloccato.ferite}/${c.bloccato.max})` };
  if (c) return { tipo: 'compito', c, label: `${c.etichetta} (${compitoFatte(c.id)}/${c.quante})` };
  return null;
}
const specUscita = () => (specScortati()[0] || {}).uscita || null;
const nomeScortato = () => (specScortati()[0] || {}).nome || 'il prigioniero';
// arredo adiacente sotto cui si puo' cercare l'uscita: serve il PNG gia' libero,
// l'uscita non ancora aperta, e non aver gia' provato sotto quell'arredo
function arredoUscita(pos) {
  const sp = SP(); const u = specUscita();
  if (!u || u.tile !== pos.t) return null;
  if (!statoScortati().some((g) => g.liberato)) return null;
  if (sp.uscita && sp.uscita.aperta) return null;
  const tile = tileDi(pos.t);
  return (tile.arredi || []).find((a) => String(a[2]).toUpperCase() !== 'CELLA'
    && !(sp.uscitaTentati || []).includes(chiave([a[0], a[1]]))
    && (adiacGlob(pos, { t: pos.t, x: a[0], y: a[1] }) || (pos.x === a[0] && pos.y === a[1]))) || null;
}
// indice del PNG scortato liberabile dalla posizione `pos`: dev'essere la sua
// tessera-prigione e, se l'episodio nomina un arredo (`cella`), esserne adiacenti
function scortLiberabile(pos) {
  const st = statoScortati();
  for (let i = 0; i < st.length; i++) {
    const s = specScort(i); if (st[i].liberato || pos.t !== s.tile) continue;
    if (!s.cella) return i;
    const c = (tileDi(pos.t).arredi || []).find((a) => String(a[2]).toUpperCase() === String(s.cella).toUpperCase());
    if (!c) return i;                       // arredo non stampato: basta la tessera
    if (adiacGlob(pos, { t: pos.t, x: c[0], y: c[1] }) || (pos.x === c[0] && pos.y === c[1])) return i;
  }
  return null;
}

function aggancia() {
  const { app } = ctx; const sp = SP(); const attivo = eroiAttivoNome();
  app.querySelectorAll('.cella-mossa').forEach((c) => c.onclick = async () => {
    if (scivolando) return;                     // gia' in cammino
    const node = { t: c.dataset.t, x: +c.dataset.x, y: +c.dataset.y };
    // l'esca si posa e basta: nessuno scivola, e la carica si spende ORA —
    // fino a qui il giocatore poteva ancora cambiare idea
    if (sp.escaModo) {
      const nm = sp.escaModo; const usate = (sp.abilita && sp.abilita[nm]) || 0;
      sp.esca = node; sp.escaModo = null;
      sp.abilita = sp.abilita || {}; sp.abilita[nm] = usate + 1;
      log(`${primo(nm)} lancia il monile in ${node.t}: i nemici entro 2 caselle andranno lì.`);
      salvaP(); segnaAzione(nm, 'abilita');
      return;
    }
    const scort = scortAttivo();
    if (scort == null && !attivo) return;
    scivolando = true;
    try {
      // prima il passo, poi lo stato: `muoviEroe` finisce con un ridisegno, e
      // se arrivasse per primo il token sarebbe gia' a destinazione. Anche la
      // prova d'ingresso di una tessera insidiosa deve partire a passo finito,
      // o il dado comparirebbe col token ancora per strada.
      await scivolaEroe(scort != null ? `S:${scort}` : `E:${attivo}`, node);
      if (scort != null) muoviScortato(scort, node);
      else await muoviEroe(attivo, node, c.dataset.reveal || null);
    } finally { scivolando = false; }
  });
  app.querySelectorAll('[data-nemico]').forEach((el) => el.onclick = () => { if (attivo) attaccaNemico(attivo, Number(el.dataset.nemico)); });
  app.querySelectorAll('[data-eroe]').forEach((el) => el.onclick = () => {
    const nm = el.dataset.eroe; if ((sp.vite[nm] ?? 0) <= 0) return;
    sp.scortAttivo = null;
    sp.escaModo = null;              // via d'uscita: chi ci ripensa tocca un eroe
    const i = sp.eroiFatti.indexOf(nm); if (i >= 0) sp.eroiFatti.splice(i, 1);
    sp.eroiAttivo = nm; salvaP(); render();
  });
  // selezione di un PNG scortato (pedina sul board o chip nel giro)
  const selScort = (el, attr) => el.onclick = () => {
    const i = Number(el.dataset[attr]);
    if (!(statoScortati()[i] || {}).liberato) return;
    sp.scortAttivo = i; salvaP(); render();
  };
  app.querySelectorAll('[data-scortato]').forEach((el) => selScort(el, 'scortato'));
  app.querySelectorAll('[data-scortato-chip]').forEach((el) => selScort(el, 'scortatoChip'));
  app.querySelector('#rug-fine') && (app.querySelector('#rug-fine').onclick = () => { sp.scortAttivo = null; salvaP(); render(); });
  app.querySelectorAll('[data-turno]').forEach((b) => b.onclick = () => {
    const nm = b.dataset.turno; if ((sp.vite[nm] ?? 0) <= 0) return;
    const i = sp.eroiFatti.indexOf(nm); if (i >= 0) sp.eroiFatti.splice(i, 1);
    sp.eroiAttivo = nm; salvaP(); render();
  });
  app.querySelectorAll('[data-obj]').forEach((b) => b.onclick = () => {
    const nm = (P().indagine.oggetti || [])[Number(b.dataset.obj)];
    const o = (ctx.ep.oggetti || []).find((x) => norm(x.nome) === norm(nm));
    const c = cartaOggetto(ctx.carte, P().episodio, nm);
    messaggio(nm.toLowerCase(), `${c ? `<div class="carta-grande"><img src="${urlCarta(c.file)}" alt=""></div>` : ''}
      ${o && o.effetto ? `<p class="mt">${rendi(o.effetto)}</p>` : ''}${o && o.flavor ? `<p class="nota mt"><i>${rendi(o.flavor)}</i></p>` : ''}`).then(render);
  });
  app.querySelectorAll('[data-abil]').forEach((btn) => btn.onclick = () => usaAbilita(btn.dataset.abil));
  app.querySelector('#az-cercare') && (app.querySelector('#az-cercare').onclick = () => azioneCercare(attivo));
  app.querySelector('#az-oggetto') && (app.querySelector('#az-oggetto').onclick = () => usaOggetto(attivo));
  app.querySelector('#az-interagire') && (app.querySelector('#az-interagire').onclick = () => azioneInteragire(attivo));
  app.querySelector('#az-rianimare') && (app.querySelector('#az-rianimare').onclick = () => azioneRianima(attivo));
  app.querySelector('#az-fine') && (app.querySelector('#az-fine').onclick = () => finisciEroe(attivo));
  app.querySelector('#fase-minaccia') && (app.querySelector('#fase-minaccia').onclick = faseMinaccia);
  agganciaMappa();
  centraSuAttivo();
  annunciaTurno();
}

// transizione di passaggio turno: un banner «tocca a <nome>» col ritratto, che
// compare e sfuma da solo quando l'eroe attivo cambia (non bloccante)
// banner riusabile di passaggio turno (ritratto/token + testo), compare e sfuma
function bannerTurno(imgUrl, testoHtml, variante) {
  document.querySelectorAll('.turno-banner').forEach((n) => n.remove());
  const el = document.createElement('div'); el.className = 'turno-banner' + (variante ? ' ' + variante : '');
  el.innerHTML = `<span class="rit"><img src="${imgUrl || ''}" alt=""></span><span class="tb-txt">${testoHtml}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 1600);
}
function annunciaTurno() {
  const attivo = eroiAttivoNome();
  if (ctx.ultimoAttivo === (attivo || null)) return;
  ctx.ultimoAttivo = attivo || null;
  if (!attivo || SP().fase !== 'eroi') return;
  const e = eroe(attivo);
  bannerTurno(e && e.art ? urlArt(e.art) : '', `tocca a<br><b>${esc(primo(attivo))}</b>`);
}

// centra la finestra su un nodo (casella) con scroll animato. `forza` ignora la
// cache (per ricentrare a ogni nemico anche se la chiave non cambia).
function centraSuNodo(node, key, forza) {
  const g = ctx._geo; const wrap = ctx.app.querySelector('#board-wrap'); if (!g || !wrap) return;
  if (!forza && ctx.ultimaCentrata === key) return;
  const z = SP().zoom || 1; const [TX, TY] = layout()[node.t] || [g.minX, g.maxY];
  const cx = ((TX - g.minX) * 4 + node.x + 0.5) * g.cell * z;
  const cy = ((g.maxY - TY) * 4 + (3 - node.y) + 0.5) * g.cell * z;
  wrap.scrollTo({ left: Math.max(0, cx - wrap.clientWidth / 2), top: Math.max(0, cy - wrap.clientHeight / 2), behavior: 'smooth' });
  ctx.ultimaCentrata = key;
}
// centra sull'eroe attivo (o sulla tessera piu' affollata in fase nemici).
// `forza`: ogni render() ricostruisce il board e azzera lo scroll, quindi va
// ricentrato SEMPRE (altrimenti dopo un attacco/ricerca — stessa posizione —
// il board resterebbe in alto a sinistra). Il pan manuale tra due azioni resta
// comunque: senza render lo scroll non si azzera.
function centraSuAttivo() {
  const sp = SP(); const attivo = eroiAttivoNome(); const iS = scortAttivo();
  if (iS != null && (statoScortati()[iS] || {}).pos) { const p = sp.scortati[iS].pos; centraSuNodo(p, `S${iS}@${nk(p)}`, true); }
  else if (attivo) { const p = sp.eroiPos[attivo]; centraSuNodo(p, `${attivo}@${nk(p)}`, true); }
  else { const t = tileAffollata(); centraSuNodo({ t, x: 1.5, y: 1.5 }, `_@${t}`, true); }
}

// zoom (pulsanti + Ctrl+rotella) e pan (trascinamento mouse/touch)
const clampZoom = (z) => Math.max(0.5, Math.min(2.6, z));
// Tetto separato per l'ADATTAMENTO automatico: `clampZoom` arriva a 2.6, ma con
// una sola tessera rivelata il fit ci arriverebbe davvero — bello sulla TV,
// esagerato su un portatile. E' la manopola da girare guardando lo schermo vero.
const MAX_FIT = 1.8;

// Lo zoom che fa entrare tutta la plancia nella finestra. Serve `ctx._geo.w/h`
// (l'ingombro del piano a zoom 1) e l'altezza VERA del contenitore: per questo
// `.board-wrap` ha `height` e non `max-height` — con `max-height` l'altezza del
// wrap e' quella del contenuto gia' zoomato, e il fit non ingrandirebbe mai.
function fitZoom() {
  const g = ctx._geo; const wrap = ctx.app.querySelector('#board-wrap');
  // guardia: senza misure meglio lo zoom corrente che un NaN, che JSON.stringify
  // salverebbe come null e riaprirebbe la partita senza zoom
  if (!g || !wrap || !g.w || !g.h || !wrap.clientWidth || !wrap.clientHeight) return SP().zoom || 1;
  return Math.min(MAX_FIT, clampZoom(Math.min((wrap.clientWidth - 4) / g.w, (wrap.clientHeight - 4) / g.h)));
}

// Applica lo zoom SENZA passare da render(). Non e' un'ottimizzazione: durante
// la fase nemici `render()` rilancia `faseNemiciAI()` (vedi :350), che non e'
// idempotente — ricostruisce il piano, rimuove le pedine e riapplica i danni.
// Prima di questo, toccare +/− mentre la notte si muoveva faceva giocare ai
// nemici un secondo turno. Qui si scrive solo lo stile, e il pan resta dov'era.
function applicaZoom(z) {
  const sp = SP(); const app = ctx.app;
  const wrap = app.querySelector('#board-wrap'); const board = app.querySelector('.board-digitale');
  const r = z / (sp.zoom || 1);
  sp.zoom = z; salvaP();
  if (board) board.style.zoom = z;
  // lo scroll si riscala attorno al centro visibile: lo zoom a bottoni resta
  // ancorato a quello che si sta guardando, non al vertice alto-sinistra
  if (wrap && isFinite(r) && r > 0) {
    wrap.scrollLeft = (wrap.scrollLeft + wrap.clientWidth / 2) * r - wrap.clientWidth / 2;
    wrap.scrollTop = (wrap.scrollTop + wrap.clientHeight / 2) * r - wrap.clientHeight / 2;
  }
}

// ------------------------------------------------------------ modo immersivo
// La plancia diventa il tabellone: schermo intero (dove il browser lo concede)
// e a schermo solo cio' che serve nel turno. Nasce per chi gioca su tablet con
// la TV che replica: da lontano le cornici e i pannelli di riferimento sono
// spazio rubato alla mappa.
//
// La preferenza sta in localStorage e NON dentro `partita`: e' una proprieta'
// dello schermo, non della partita — e soprattutto i piloti seminano
// `osr.partita.epN` da fixture, quindi un flag li' dentro renderebbe invisibili
// abilita', oggetti e resa, falsando in silenzio le misure di bilanciamento.
// Acceso di default: la Spedizione E' il tabellone, e chi entra qui vuole la
// mappa, non le cornici. Si spegne dal ⤢, e allora la scelta resta scritta —
// per questo il confronto e' con '0' e non con '1': l'assenza vale «acceso».
const CHIAVE_IMMERSIVO = 'osr.immersivo';
const immersivo = () => { try { return localStorage.getItem(CHIAVE_IMMERSIVO) !== '0'; } catch { return true; } };

// IL FULLSCREEN VA CHIESTO SU `document.documentElement`, MAI SU `#app`:
// `.turno-banner` e `.dadi-overlay` sono appesi a `document.body`, e con un
// sotto-elemento a schermo intero sparirebbero — compreso il pannello dei dadi,
// che al tavolo e' l'unico modo di dichiarare un tiro.
function chiediSchermoIntero(on) {
  const de = document.documentElement;
  try {
    if (on) { const f = de.requestFullscreen || de.webkitRequestFullscreen; f?.call(de, { navigationUI: 'hide' })?.catch?.(() => {}); }
    else { const u = document.exitFullscreen || document.webkitExitFullscreen; u?.call(document)?.catch?.(() => {}); }
  } catch { /* browser che non lo concede (iPhone): resta il layout, che e' il grosso */ }
}
const inSchermoIntero = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function impostaImmersivo(on) {
  // prima il layout, poi il fullscreen: dove l'API non c'e' il guadagno resta
  try { localStorage.setItem(CHIAVE_IMMERSIVO, on ? '1' : '0'); } catch { /* modalita' privata */ }
  ctx.app.classList.toggle('immersivo', on);
  chiediSchermoIntero(on);
  applicaZoom(fitZoom()); centraSuAttivo();
}

// uscendo verso il menu si spegne il layout ma NON si tocca la preferenza,
// altrimenti la si perderebbe ogni volta che si passa dal menu. Serve davvero:
// `.immersivo` ha `height:100%` e `overflow:hidden`, sopra il menu lo romperebbe.
function spegniImmersivo() {
  ctx.app.classList.remove('immersivo');
  if (inSchermoIntero()) chiediSchermoIntero(false);
}

function agganciaMappa() {
  const { app } = ctx; const sp = SP(); const wrap = app.querySelector('#board-wrap'); if (!wrap) return;
  // primo ingresso senza uno zoom salvato: si parte adattati, non a 1
  if (sp.zoom == null) applicaZoom(fitZoom());
  // Lo schermo intero i browser lo concedono solo su un gesto, e entrando non
  // ce n'e' uno (vedi vistaDigitale: li' si applica solo il layout). Il primo
  // tocco sulla mappa e' il gesto piu' vicino, e nel primo turno arriva sempre.
  // Il wrap e' un nodo nuovo a ogni render, quindi `once` non si accumula.
  if (immersivo() && !inSchermoIntero()) {
    wrap.addEventListener('pointerdown', () => chiediSchermoIntero(true), { once: true });
  }
  app.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
    const d = b.dataset.zoom;
    if (d === '0') return impostaImmersivo(!immersivo());   // ⤢ = schermo intero
    applicaZoom(clampZoom((sp.zoom || 1) * (d === '+' ? 1.25 : 0.8)));
  });
  wrap.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; e.preventDefault();
    applicaZoom(clampZoom((sp.zoom || 1) * (e.deltaY < 0 ? 1.1 : 0.9)));
  }, { passive: false });
  // Uscita dallo schermo intero decisa dal SISTEMA (ESC, gesto del browser): il
  // toggle deve restare sincronizzato, altrimenti il bottone mente. Assegnazione
  // a proprieta' e non addEventListener: `agganciaMappa` gira a ogni render e
  // accumulerebbe un listener per turno.
  const suCambioSchermo = () => {
    if (!inSchermoIntero() && immersivo()) { impostaImmersivo(false); return; }
    if (immersivo()) { applicaZoom(fitZoom()); centraSuAttivo(); }
  };
  document.onfullscreenchange = suCambioSchermo;
  document.onwebkitfullscreenchange = suCambioSchermo;
  // pan: trascina con il tasto sinistro o col dito
  let giu = false, sx = 0, sy = 0, sl = 0, st = 0, mosso = false;
  wrap.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    giu = true; mosso = false; sx = e.clientX; sy = e.clientY; sl = wrap.scrollLeft; st = wrap.scrollTop;
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!giu) return; const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) mosso = true;
    wrap.scrollLeft = sl - dx; wrap.scrollTop = st - dy;
  });
  const fine = () => { giu = false; };
  wrap.addEventListener('pointerup', fine); wrap.addEventListener('pointercancel', fine); wrap.addEventListener('pointerleave', fine);
  // se stavo trascinando, sopprimo il click accidentale su casella/pedina
  wrap.addEventListener('click', (e) => { if (mosso) { e.stopPropagation(); e.preventDefault(); mosso = false; } }, true);
}

function segnaAzione(nm, tipo) {
  const sp = SP(); if (!sp.azioni[nm]) sp.azioni[nm] = [];
  // Chi ha iniziato il turno lo TIENE finche' non dichiara di aver finito.
  // Senza questa riga l'eroe attivo resta quello scelto dal fallback di
  // eroiAttivoNome() (l'ordine del party), ricalcolato a ogni render: rianimare
  // un compagno lo rimette fra i vivi e, se sta prima nell'ordine, si prende il
  // turno rubando al rianimatore la seconda azione.
  sp.eroiAttivo = nm;
  sp.azioni[nm].push(tipo);
  if (controllaVittoria()) return;
  if (sp.azioni[nm].length >= azioniMax(nm)) finisciEroe(nm); else { salvaP(); render(); }
}

// ------------------------------------------------------- obiettivi d'episodio
// Fino al 22/07/2026 la modalita' digitale si poteva vincere SOLO muovendo un
// PNG scortato: le due condizioni stavano dentro `muoviScortato`, e quindici
// episodi su ventuno non avevano alcun modo di finire bene — l'obiettivo era
// una stringa mostrata a schermo e nient'altro. Qui c'e' il meccanismo
// generico, guidato dai dati (`ep.compiti` e `ep.vittoria` in webapp/data).
//
//   compiti:  [{ id, tile, quante, etichetta, prova?, cella? }]
//             N azioni Interagire sulla stessa tessera (le canne da sfregiare,
//             i movimenti da spegnere, le casse da sequestrare, i tell da
//             documentare). `prova` le rende incerte, `cella` le lega a un arredo.
//   vittoria: { tessera?, boss?, testo }
//             a compiti finiti serve, se dichiarato, che gli eroi vivi siano
//             tutti su `tessera` (il rientro) e/o che il boss sia a terra.
const specCompiti = () => (ctx.ep.compiti || []);
const statoCompiti = () => { const sp = SP(); sp.compiti = sp.compiti || {}; return sp.compiti; };
const compitoFatte = (id) => statoCompiti()[id] || 0;
const compitiFiniti = () => specCompiti().every((c) => compitoFatte(c.id) >= c.quante);

// OBIETTIVO COMPLETATO: non resta che raggiungere la meta. Da qui il mazzo
// Minaccia non si pesca piu' (crescendo-relief: la pressione cala dopo il
// climax, come in Left 4 Dead/Zombicide; e ogni obiettivo tolto toglie minaccia,
// come in Pandemic). Colpisce la causa misurata dell'Atto I-II: il ritorno sotto
// pressione infinita che decimava il gruppo sfaldato. I nemici GIA' in campo
// premono ancora, e il Canto automatico di fine round continua a salire.
//   scorta:        tutti i PNG liberati (+ uscita aperta, se c'e' un'uscita segreta)
//   compiti:       tutti finiti
// Un episodio senza ne' scorta ne' compiti (raro) non ha «relief»: torna false.
function obiettivoFatto() {
  const sp = SP(); const sc = specScortati(); const co = specCompiti();
  if (!sc.length && !co.length) return false;
  if (co.length && !compitiFiniti()) return false;
  // PNG liberato = obiettivo sostanziale: da qui e' solo estrazione (aprire
  // l'uscita segreta O tornare alla meta). NON si richiede l'uscita gia' aperta:
  // era un circolo vizioso — non aprivano l'uscita perche' sotto pressione, e la
  // pressione non si fermava perche' non aprivano l'uscita (Ep.1 bloccato cosi').
  if (sc.length && !statoScortati().every((g) => g.liberato)) return false;
  return true;
}

// il compito a portata dell'eroe: giusta tessera, quante ne restano, e — se il
// dato nomina un arredo — esserne adiacenti
function compitoDisponibile(pos) {
  const sp = SP();
  for (const c of specCompiti()) {
    // `quante` e' quanti ne SERVONO; `massimo` quanti ne ESISTONO. Coincidono
    // ovunque tranne dove qualcosa li cancella (i tell dell'Ep.15: cinque alla
    // villa, quattro bastano). Senza il margine, una clessidra da 1/round e' un
    // muro: misurato 0/6 con pool 4, 50% senza clessidra.
    if (compitoFatte(c.id) >= (c.massimo || c.quante)) continue;
    if (c.ritmo) continue;   // avanza da solo a fine round, non e' un'azione
    if (c.per_round_max && sp.compitiRound && sp.compitiRound.round === sp.round
        && (sp.compitiRound[c.id] || 0) >= c.per_round_max) continue;
    // dipendenza: la Formula si legge solo a movimenti spenti (Ep.6)
    if (c.dopo && compitoFatte(c.dopo) < (specCompiti().find((x) => x.id === c.dopo) || {}).quante) continue;
    // compito su un NEMICO: agganciare il corriere, prendere vivo il Caposquadra,
    // catturare il Notaio — adiacenza a quella miniatura, non una stanza
    if (c.nemico) {
      const n = sp.nemici.find((x) => x.pos && x.nome === c.nemico && adiacGlob(pos, x.pos));
      if (!n) continue;
      // …e dove il fascicolo dice IN QUALE STANZA, quella conta. L'Ep.14 lo
      // scrive due volte: a T4 «il Primo Gatto appare (NON ANCORA
      // INGAGGIABILE)», a T6 «all'Attico, agganciate il Primo Gatto». Senza
      // questo il ramo `nemico` usciva prima del controllo su `tile` piu' sotto,
      // e il Gatto si agganciava dove capitava: 12 vittorie su 20 SENZA MAI
      // salire all'Attico, cioe' saltando la caccia sui tetti che e' l'episodio.
      // L'Ep.12 non porta `tile` apposta: li' il Corriere si intercetta dove
      // lo si trova, e se arriva a T6 e' una sconfitta.
      if (c.tile && c.tile !== pos.t) return { ...c, fuoriPosto: c.tile };
      // «va preso VIVO»: dove il fascicolo lo chiede (Ep.11 «ridotto a 1
      // Ferita», Ep.14 «ridotto all'ultima Ferita TRATTA», Ep.15
      // «ridotto/abbattuto», Ep.19 «si ferma all'ultima Ferita, poi
      // persuasione») il negoziato non si apre finche' il nemico e' in forze.
      // Senza questa guardia bastava un Interagire a salute piena. L'Ep.12
      // NON la vuole: li' il fascicolo dice «agganciarlo prima (adiacenza +
      // Interagire)», ed e' una corsa, non uno scontro.
      // …ma un oggetto puo' anticipare il momento in cui tratta: la Parola dei
      // Tetti dell'Ep.14 fa sedere il Primo Gatto gia' a 2 Ferite («mostrandogli
      // il segno dei Gatti tratta gia' a 2 Ferite e non tenta la fuga finale»),
      // stesso schema di `per_azione.oggetto` per la Macchina Fotografica.
      let soglia = n.max - 1;
      if (c.ridotto_oggetto && (P().indagine.oggetti || [])
          .some((o) => new RegExp(c.ridotto_oggetto, 'i').test(o))) {
        soglia = Math.min(soglia, c.ridotto_con_oggetto || soglia);
      }
      if (c.ridotto && !n.abbattuto && n.ferite < soglia) return { ...c, bloccato: n, soglia };
      return c;
    }
    if (c.tile !== pos.t) continue;
    if (c.cella) {
      const t = tileDi(pos.t);
      const a = (t.arredi || []).find((v) => String(v[2]).toUpperCase() === String(c.cella).toUpperCase());
      if (a && !adiacGlob(pos, { t: pos.t, x: a[0], y: a[1] }) && !(pos.x === a[0] && pos.y === a[1])) continue;
    }
    return c;
  }
  return null;
}

// L'OROLOGIO D'EPISODIO: la traccia che il fascicolo fa segnare all'arbitro —
// sigillo, arresto, FUGA, DEMOLIZIONE, risveglio. Sale di `ogni` a fine round e
// di `da_carta` per ogni carta crescendo; alla soglia l'episodio finisce come
// dice `esito` ('sconfitta' o 'parziale'). Senza questo quei sette episodi non
// avevano un tempo: si poteva girare per sempre.
const specOrologio = () => ctx.ep.orologio || null;
function avanzaOrologio(quanto, motivo) {
  const o = specOrologio(); const sp = SP(); if (!o || sp.esito) return [];
  // IL FRENO. Le Soluzioni non fanno salire queste tracce sempre: «alla fine di
  // ogni round in cui NESSUN eroe e' adiacente al Corriere, +1» (Ep.12), «ogni
  // turno del Muratore in cui NESSUN eroe gli e' adiacente vale +2; inchiodato,
  // attacca voi e non demolisce» (Ep.10). Tenere il nemico a contatto FERMA
  // l'orologio: e' lo scopo di quegli episodi, e senza il freno la traccia si
  // riempiva in sei round e la partita era persa per aritmetica.
  if (o.frena_adiacente) {
    const vicino = sp.nemici.some((n) => n.pos && n.nome === o.frena_adiacente
      && P().party.some((nm) => (sp.vite[nm] ?? 0) > 0 && adiacGlob(sp.eroiPos[nm], n.pos)));
    if (vicino) return [`${o.nome}: fermo — ${o.frena_adiacente.toLowerCase()} è inchiodato.`];
  }
  // LA SECONDA VIA. Inchiodare il nemico ferma l'orologio finche' lo tieni a
  // contatto; ABBATTERLO lo ferma per sempre — «abbattere il Muratore ferma del
  // tutto la demolizione: e' la seconda via» (Ep.10). Il digitale conosceva
  // solo il freno, e senza la seconda via l'Ep. 10 era matematicamente perso:
  // si entra nella camera al round 9 e la Demolizione chiude al 12, tre round
  // per un obiettivo da quattordici (N-114, misurato 0 vittorie su 20).
  // «Non c'e' in campo» e' vero anche PRIMA che compaia — il Muratore sta in
  // T6 — e fermerebbe l'orologio dal primo round. Ferma solo chi c'era ed e'
  // stato abbattuto, quindi si segna che e' comparso.
  if (o.ferma_se_abbattuto) {
    const inCampo = sp.nemici.some((n) => n.pos && n.nome === o.ferma_se_abbattuto);
    if (inCampo) sp.orologioVistoBersaglio = true;
    else if (sp.orologioVistoBersaglio) {
      return [`${o.nome}: ferma — ${o.ferma_se_abbattuto.toLowerCase()} è a terra.`];
    }
  }
  // «Ogni turno del MURATORE in cui nessun eroe gli e' adiacente, +2» — e il
  // Muratore sta in T6. La traccia partiva invece dal round 1 e correva per
  // nove round prima che il personaggio esistesse: la stanza si raggiungeva
  // al 9,5 e il muro cadeva al 12. Un orologio legato a qualcuno non gira
  // finche' quel qualcuno non e' in scena (N-114).
  if (o.da_tessera && !sp.rivelate.includes(o.da_tessera)) return [];
  sp.traccia = (sp.traccia || 0) + quanto;
  const ann = [`${o.nome}: ${Math.min(sp.traccia, o.max)}/${o.max}${motivo ? ' — ' + motivo : ''}.`];
  if (sp.traccia >= o.max) {
    sp.esito = o.esito === 'parziale' ? 'parziale' : 'sconfitta';
    ann.push(o.testo || `${o.nome} al massimo: la spedizione è persa.`);
    sp.log.push(ann[ann.length - 1]); salvaP();
  }
  return ann;
}

// IL ROGO (Ep.13): un doom-clock a ROUND, non agganciato al Canto — un incendio
// non si zittisce, quindi la Litania (che toglie Canto) non lo ritarda. Il Notaio
// dà fuoco al Molino a cadenza fissa: le tessere si incendiano ai round dichiarati
// in `ep.rogo.scala` ([tessera, round]). Chi vi termina il round subisce `danno`
// (il fuoco che morde). I registri presi mentre il TORCHIO (la tessera-obiettivo)
// brucia escono anneriti = vittoria PARZIALE — a meno che il gruppo porti dall'
// indagine l'oggetto `protetto` (la Cassetta Stagna), che li salva: PIENA comunque.
// È la posta che rende viva la corsa e fa CONTARE l'indagine sull'apertura d'Atto.
const specRogo = () => ctx.ep.rogo || null;
const rogoBrucia = (tileId) => {
  const r = specRogo(); if (!r) return false; const sp = SP();
  return (r.scala || []).some(([t, quando]) => t === tileId && sp.round >= quando);
};
const haProtezioneRogo = () => {
  const r = specRogo(); if (!r || !r.protetto) return false;
  return (P().indagine.oggetti || []).some((o) => new RegExp(r.protetto, 'i').test(o));
};
function avanzaRogo() {
  const r = specRogo(); const sp = SP(); if (!r || sp.esito) return [];
  const ann = []; sp.rogoAcceso = sp.rogoAcceso || {};
  for (const [t, quando] of (r.scala || [])) {
    if (sp.round >= quando && !sp.rogoAcceso[t]) {
      sp.rogoAcceso[t] = true;
      ann.push((r.testo_scatta || 'Il Rogo divampa in {tile}.').replace('{tile}', t));
    }
  }
  if (r.danno) for (const nm of P().party) {
    if ((sp.vite[nm] ?? 0) <= 0) continue;
    const pos = sp.eroiPos[nm];
    if (pos && rogoBrucia(pos.t)) {
      const e = eroe(nm);
      sp.vite[nm] = Math.max(0, (sp.vite[nm] ?? saluteMax(e)) - r.danno);
      ann.push(`${primo(nm)} è tra le fiamme: −${r.danno} (${sp.vite[nm]}).`);
      if (sp.vite[nm] <= 0) ann.push(`${primo(nm)} crolla nel fumo!`);
    }
  }
  return ann;
}

// --- la CANCELLAZIONE (Ep.15) ----------------------------------------------
// La meccanica che da' il nome all'episodio non esisteva in digitale: i tell
// erano quattro Interagire e non spariva niente, quindi la serata era una gara
// col Canto invece che con la squadra che cancella. Il pool si svuota — «da T4
// gli Apparecchiatori cancellano un tell per round finche' il Capo e' in
// piedi» — e questo e' il generico che lo esegue, guidato dai dati.
//   cancellazione: { compito, da_tessera, per_round, finche_compito, testo }
const specCancellazione = () => ctx.ep.cancellazione || null;

function avanzaCancellazione() {
  const k = specCancellazione(); const sp = SP();
  if (!k || sp.esito) return [];
  if (k.da_tessera && !sp.rivelate.includes(k.da_tessera)) return [];
  // finche' il Capo e' in piedi: il compito che lo prende non e' ancora chiuso
  if (k.finche_compito) {
    const c = specCompiti().find((x) => x.id === k.finche_compito);
    if (c && compitoFatte(c.id) >= c.quante) return [];
  }
  const st = statoCompiti(); const avuti = st[k.compito] || 0;
  if (avuti <= 0) return k.esaurito ? [k.esaurito] : [];
  const quanti = Math.min(k.per_round || 1, avuti);
  st[k.compito] = avuti - quanti;
  const spec = specCompiti().find((x) => x.id === k.compito);
  return [`${k.testo} (${st[k.compito]}/${spec ? spec.quante : '?'})`];
}

// --- il RITMO del controcanto (Ep.20) ---------------------------------------
// Il finale era due giochi diversi: al tavolo il controcanto e' un ritmo per
// round che dipende dai Frammenti di venti serate e dal coro in campo, qui era
// un compito da 10 con una prova di NERVI per azione, dove i Frammenti non
// pesavano nulla. Ora e' il ritmo stampato:
//
//   righe = base + 1 ogni `per_frammenti` Frammenti conservati e non incrinati
//                + `con_oggetto` se il gruppo ha la Mappa Acustica
//                − 1 per ogni nemico sulla tessera della camera
//   e comunque mai sotto `minimo` (il pavimento: per quanti siano nel coro,
//   una riga la cantate sempre).
//
// Non costa azioni, come al tavolo: gli eroi le spendono a spezzare il coro,
// che e' il punto della scena.
const specRitmo = () => specCompiti().find((c) => c.ritmo) || null;

// Quanti Frammenti porta il gruppo. La webapp gioca un episodio per volta e non
// ha lo stato di campagna: il valore si dichiara sulla partita (`frammenti`) e
// altrimenti vale il `default` dei dati. E' l'unico ingresso di campagna del
// finale, e va tenuto esplicito invece di essere dedotto dal tier d'Indagine —
// il tier dice com'e' andata stasera, non come sono andate venti serate.
const frammentiPortati = () => {
  const r = specRitmo(); const p = P();
  return p.frammenti != null ? p.frammenti : ((r && r.ritmo.frammenti_default) || 0);
};

function avanzaRitmo() {
  const c = specRitmo(); const sp = SP();
  if (!c || sp.esito) return [];
  const r = c.ritmo;
  if (r.tile && !sp.rivelate.includes(r.tile)) return [];      // non si canta prima della camera
  if (compitoFatte(c.id) >= c.quante) return [];
  const coro = r.tile ? sp.nemici.filter((n) => n.pos && n.pos.t === r.tile).length : 0;
  const oggetto = r.oggetto
    && ((P().indagine || {}).oggetti || []).some((o) => new RegExp(r.oggetto, 'i').test(o));
  const grezzo = (r.base || 1)
    + (r.per_frammenti ? Math.floor(frammentiPortati() / r.per_frammenti) : 0)
    + (oggetto ? (r.con_oggetto || 0) : 0)
    - coro;
  const righe = Math.max(r.minimo != null ? r.minimo : 1, grezzo);
  const st = statoCompiti();
  st[c.id] = Math.min(c.quante, (st[c.id] || 0) + righe);
  const ann = [`${r.testo || 'Cantate'} ${righe} ${righe === 1 ? 'riga' : 'righe'}`
    + `${coro ? ` (il coro ne toglie ${coro})` : ''}: ${st[c.id]}/${c.quante}.`];
  if (st[c.id] >= c.quante && c.fatto) ann.push(c.fatto);
  return ann;
}

// --- la PRESSIONE della camera (Ep.20) --------------------------------------
// L'altra meta' del finale stampato. Nella camera il Dormiente si desta a ogni
// round, e il rito accelera il risveglio finche' HA UNA VOCE: M. in piedi con
// la sua, oppure un impiegato del coro che canta al posto suo. Qui c'era solo
// il tick ogni 6 round: senza questa pressione il ritmo del controcanto corre
// senza avversario, e la corsa che regge tutto il finale non esiste.
// «Voce» = un nemico qualunque nella camera: e' cosi' che il digitale
// rappresenta il coro e M., che non ha una miniatura sua.
function avanzaPressione() {
  const p = ctx.ep.pressione; const sp = SP();
  if (!p || sp.esito) return [];
  if (p.tile && !sp.rivelate.includes(p.tile)) return [];
  const tetto = tettoCanto(ctx.comune, ctx.ep);
  const ann = [];
  const sale = (quanto, perche) => {
    for (let i = 0; i < quanto && sp.canto < tetto; i += 1) sp.canto += 1;
    if (sp.canto < tetto || quanto) ann.push(`${perche} (Canto ${sp.canto}).`);
  };
  if (p.per_round) sale(p.per_round, p.testo || 'Il Dormiente si desta');
  if (p.rito) {
    // La voce del rito NON e' il coro comprato (N-112). Un impiegato faceva due
    // mestieri opposti sui due contatori — toglieva una riga al controcanto e
    // dava +1 Canto al rito — e siccome sette carte su ventuno lo rimettono
    // dentro, e il ritmo si controlla DOPO la fase Minaccia, la sua presenza
    // era di fatto permanente e valeva l'intera partita. Ora la voce e' M., o
    // la Candidata ancora nelle sue mani: la si toglie salvandola, non
    // abbattendo lui (che e' la tesi della scena, ed e' come N-73 resta chiusa).
    const salva = p.rito.finche_manca_oggetto;
    const voce = !salva
      || !((P().indagine || {}).oggetti || []).some((o) => new RegExp(salva, 'i').test(o));
    if (voce) sale(p.rito.per_round || 1, p.rito.testo || 'Il rito ha una voce');
  }
  // «Le fasi ambientali della camera fanno danno inevitabile a soglie di Canto»
  // e' stampato sul fascicolo e non esisteva qui (N-113): la camera e' il boss
  // dell'episodio e in digitale non faceva un graffio. Inevitabile vuol dire
  // senza prova: non c'e' niente da colpire, e' la stanza.
  if (p.danno) {
    const soglie = Object.keys(p.danno).map(Number).filter((s) => sp.canto >= s);
    const dan = soglie.length ? Math.max(...soglie.map((s) => p.danno[s])) : 0;
    for (const nm of P().party) {
      if (!dan || (sp.vite[nm] ?? 0) <= 0) continue;
      sp.vite[nm] = Math.max(0, sp.vite[nm] - dan);
      ann.push(`La camera respira: ${primo(nm)} −${dan} (${sp.vite[nm]}).`);
      if (sp.vite[nm] <= 0) ann.push(`${primo(nm)} va a terra.`);
    }
  }
  return ann;
}

// --- il filo perso (Ep.11) --------------------------------------------------
// «Un colpo che lo porterebbe a 0 lo fa CADERE: filo perso — l'Atto III perde
// l'aggancio, la campagna prosegue depotenziata, non e' wipe.» E' stampato, e
// il digitale non lo applicava: se il Caposquadra moriva invece di essere preso
// vivo, il compito diventava impossibile e la partita non finiva piu'. Sul
// pilota, tre partite su venti arrivavano a round 20-23 e morivano in timeout,
// e l'Ep. 11 era l'unico episodio la cui percentuale non fosse credibile
// (N-115). Al tavolo la serata la chiude l'arbitro; qui non la chiudeva nessuno.
function controllaFiloPerso() {
  const sp = SP();
  if (sp.esito) return [];
  for (const c of specCompiti()) {
    if (!c.perso_se_abbattuto || !c.nemico) continue;
    if (compitoFatte(c.id) >= c.quante) continue;          // gia' preso: nessun filo perso
    const inCampo = sp.nemici.some((n) => n.pos && n.nome === c.nemico);
    sp.bersagliVisti = sp.bersagliVisti || {};
    if (inCampo) { sp.bersagliVisti[c.id] = true; continue; }
    if (!sp.bersagliVisti[c.id]) continue;                 // non e' ancora comparso
    sp.esito = c.perso_se_abbattuto.esito || 'parziale';
    const t = c.perso_se_abbattuto.testo || 'Il filo è perso: la spedizione si chiude a metà.';
    sp.log.push(t); salvaP();
    return [t];
  }
  return [];
}

function controllaVittoria() {
  const sp = SP(); const v = ctx.ep.vittoria;
  if (sp.esito || !v || !specCompiti().length || !compitiFiniti()) return false;
  const vivi = P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (v.tessera && !vivi.every((nm) => sp.eroiPos[nm] && sp.eroiPos[nm].t === v.tessera)) return false;
  // un boss gia' a terra in attesa d'essere preso non sbarra piu' la vittoria
  if (v.boss && sp.nemici.some((n) => n.nome === ctx.ep.soluzione.boss && n.pos && !n.abbattuto)) return false;
  // due modi di arrivare secondi: il ROGO (snapshot all'atto della presa) e
  // l'orologio dell'episodio superato (soglia-decano, soglia-arresto, sigillo)
  const declassa = !!sp.registriAnneriti || !!sp.declassato;
  sp.esito = declassa ? 'parziale' : 'vittoria';
  sp.log.push(sp.registriAnneriti
    ? (specRogo().testo_parziale || 'I registri escono anneriti dal rogo: vittoria parziale.')
    : declassa
      ? `${sp.declassato} L’obiettivo è compiuto lo stesso: vittoria parziale.`
      : (v.testo || 'L’obiettivo è compiuto: siete salvi.'));
  salvaP(); epilogo(); return true;
}
function finisciEroe(nm) {
  const sp = SP(); if (nm && !sp.eroiFatti.includes(nm)) sp.eroiFatti.push(nm);
  sp.eroiAttivo = null; salvaP(); render();
}

async function muoviEroe(nm, node, revealId) {
  const sp = SP();
  sp.eroiPos[nm] = node;
  if (revealId && !sp.rivelate.includes(revealId)) {
    sp.rivelate.push(revealId);
    const dest = tileDi(revealId);
    log(`${primo(nm)} apre la via verso ${revealId}: ${dest.nome.toLowerCase()}.`);
    if (/quando rivelate/i.test(dest.testo || '')) spawnDaTesto(dest.testo, revealId);
  } else {
    log(`${primo(nm)} si sposta in ${node.t}.`);
  }
  // insidia d'ingresso: la PRIMA volta che si entra in una tessera il cui testo
  // richiede una prova (es. T3 NERVI Media, T5 NERVI Facile), il tiro compare qui
  const tnow = tileDi(node.t);
  if (provaRichiesta(tnow.testo) && !(sp.insidie && sp.insidie[node.t])) {
    sp.insidie = sp.insidie || {}; sp.insidie[node.t] = true; salvaP();
    // al tavolo il testo lo legge chi arbitra dal fascicolo: qui resta la sola
    // prova da tirare, senza anticipare la scena ai giocatori
    const corpo = alTavolo()
      ? `<p class="nota">Chi arbitra legge <b>${esc(node.t)}</b> dal fascicolo Spedizione, poi si tira.</p>`
      : `<p><i>${rendi(tnow.testo)}</i></p>`;
    await messaggioProva(`${node.t} — ${tnow.nome.toLowerCase()}`, corpo, tnow.testo, nm);
  }
  segnaAzione(nm, 'muovere');
}

// PNG scortato mosso dal giocatore (Mov 3, non agisce): sulla tessera-meta e'
// vittoria — ma solo quando TUTTI i PNG dell'episodio ci sono arrivati (Ep.4
// ne ha due, Gaspare e Rocco: vanno portati fuori entrambi).
function muoviScortato(i, node) {
  const sp = SP(); const g = sp.scortati[i]; const s = specScort(i);
  g.pos = node; g.mosso = true; sp.scortAttivo = null;
  log(`${s.nome} avanza in ${node.t}.`);
  // vittoria alternativa: l'uscita segreta aperta nella tessera della prigionia
  const u = sp.uscita;
  if (u && u.aperta && node.t === u.tile && node.x === u.cella[0] && node.y === u.cella[1]) {
    g.uscito = true; g.pos = null;             // sparisce dal board: libera il chiusino per l'altro
    // anche dal condotto devono passare TUTTI: con due prigionieri (Ep.4) il
    // primo che ci mette il piede non chiude la partita da solo
    if (sp.scortati.every((x) => x.uscito) && scortaPuoVincere()) {
      sp.esito = sp.declassato ? 'parziale' : 'vittoria';
      sp.log.push(s.vittoria || `${s.nome} è fuori: siete salvi.`);
      salvaP(); return epilogo();
    }
    log(sp.scortati.every((x) => x.uscito)
      ? `${s.nome} e' al sicuro, ma il lavoro non e' finito: ${specCompiti()[0].etichetta.toLowerCase()}.`
      : `${s.nome} sparisce nel passaggio: manca ancora qualcuno.`);
    salvaP(); return render();
  }
  // chi e' gia' passato dal condotto conta come arrivato: i due dell'Ep.4
  // possono uscire uno per la via segreta e uno dalla porta d'ingresso
  const arrivati = sp.scortati.every((x, k) => x.uscito || (x.liberato && x.pos && x.pos.t === specScort(k).meta));
  if (node.t === s.meta && arrivati && scortaPuoVincere()) {
    sp.esito = sp.declassato ? 'parziale' : 'vittoria';
    sp.log.push(s.vittoria || `${s.nome} è al sicuro: siete salvi.`);
    salvaP(); return epilogo();
  }
  salvaP(); render();
}

// «QUI L'USCITA NON BASTA» (Ep.4, T5): dove l'episodio ha ANCHE dei compiti, la
// scorta portata in salvo non chiude da sola. Il fascicolo lo dice due volte —
// «la spedizione e' VINTA solo se i TRE pannelli della Conchiglia sono gia'
// disaccordati. Se non lo sono, chi imbocca il vano si mette al sicuro (esce
// dal tabellone e non puo' piu' essere colpito) MA LA PARTITA CONTINUA». Prima
// il gruppo scappava e l'app dichiarava vittoria: meta' dell'obiettivo stampato
// non esisteva nei dati. Inerte negli altri episodi-scorta, che di compiti non
// ne hanno.
function scortaPuoVincere() {
  return !specCompiti().length || compitiFiniti();
}

async function attaccaNemico(nm, i, gratis) {
  const sp = SP(); const e = eroe(nm); const n = sp.nemici[i]; if (!n) return;
  if (!gratis && azioneSpesa(nm, 'attaccare')) { flash(`${primo(nm)} ha già attaccato: le 2 azioni sono di tipo diverso.`); return; }
  if (!gratis && !azioniRestano(nm)) { flash(`${primo(nm)} non ha più azioni.`); return; }
  if (!adiacGlob(sp.eroiPos[nm], n.pos)) { flash('Nemico non adiacente: avvicinati prima.'); return; }
  if (n.abbattuto) { flash(`${n.nome.toLowerCase()} è già a terra: ora va preso (Interagire).`); return; }
  const st = nemStat(n.nome);
  const r = await tiraProva({ titolo: `${primo(nm)} → ${n.nome.toLowerCase()}`, diffLabel: 'Difesa', soglia: n.difMod ?? st.dif,
    bonus: [{ label: 'VIGORE', val: e.vigore }, { label: 'arma', val: 1 }], modo: modoDadi() });
  if (r == null) return;
  const dif = n.difMod ?? st.dif;
  if (r.ok) {
    n.ferite += 1; log(`${primo(nm)} colpisce ${n.nome.toLowerCase()} (2d6+VIG ${r.tot} ≥ Dif ${dif} → ${n.ferite}/${n.max}).`);
    if (n.ferite >= n.max) {
      // Il bersaglio di un compito non si toglie dal campo: il fascicolo dice
      // «va ridotto/abbattuto E POI preso» (gen_ep15.py:658), ma il compito
      // esige il nemico adiacente — toglierlo lo rendeva impossibile per
      // sempre, e la partita restava appesa senza spiegazione. Resta a terra
      // finche' non lo si prende; a quel punto Interagire lo rimuove.
      const obiettivo = specCompiti().some((c) => c.nemico === n.nome)
        && !compitiFiniti();
      if (obiettivo) {
        n.abbattuto = true;
        log(`${n.nome.toLowerCase()} è a terra: ora si può prendere (Interagire).`);
      } else {
        log(`${n.nome.toLowerCase()} è abbattuto!`);
        sp.nemici.splice(i, 1);
        // COLPO DA MACELLO di Ottone: abbattuto un nemico in mischia, il
        // secondo colpo parte subito e non costa l'azione. Una volta per suo
        // turno — `sp.macello` tiene il round in cui l'ha gia' fatto.
        if (nm.includes('OTTONE') && sp.macello !== sp.round) {
          const vicini = sp.nemici.map((x, j) => ({ x, j }))
            .filter(({ x }) => x.pos && !x.abbattuto && adiacGlob(sp.eroiPos[nm], x.pos));
          if (vicini.length) {
            const j = vicini.length === 1 ? String(vicini[0].j)
              : await scegli('Colpo da macello: chi cade adesso?',
                  vicini.map(({ x, j }) => ({ id: String(j), label: `${x.nome.toLowerCase()} (${x.ferite}/${x.max})` })));
            // il colpo si consuma solo se parte: chi annulla la scelta lo tiene
            if (j != null) { sp.macello = sp.round; salvaP(); await attaccaNemico(nm, Number(j), true); }
          }
        }
      }
    }
  } else log(`${primo(nm)} manca ${n.nome.toLowerCase()} (${r.tot} < Dif ${dif}).`);
  if (gratis) { salvaP(); render(); return; }   // colpo gratuito: nessuna azione da segnare
  salvaP(); segnaAzione(nm, 'attaccare');
}

async function azioneCercare(nm) {
  const sp = SP(); const tile = tileDi(sp.eroiPos[nm].t);
  if (sp.cercate[tile.id]) { flash('Qui avete già cercato.'); return; }
  const e = eroe(nm); const bonus = [{ label: 'ACUME', val: e.acume }];
  if (nm === 'ELENA FOSCO') bonus.push({ label: 'Occhio Clinico', val: 2 });
  const r = await tiraProva({ titolo: `cercare — ${primo(nm)}`, diffLabel: 'Media', soglia: ctx.comune.regole.diff.Media, bonus, modo: modoDadi() });
  if (r == null) return;
  if (!r.ok) { log(`${primo(nm)} fruga invano.`); salvaP(); segnaAzione(nm, 'cercare'); return; }
  sp.cercate[tile.id] = true;
  const esito = cerca(ctx.ep, P(), tile.id);
  // registra l'oggetto della tessera (ep.oggetti con ref = id tessera) nell'inventario del gruppo
  let extra = '';
  const obj = (ctx.ep.oggetti || []).find((o) => o.ref === tile.id);
  if (obj) {
    P().indagine.oggetti = P().indagine.oggetti || [];
    if (!P().indagine.oggetti.some((nm2) => norm(nm2) === norm(obj.nome))) {
      P().indagine.oggetti.push(obj.nome);
      extra = `<hr class="divisore"><p class="mt"><b>Trovato:</b> ${esc(obj.nome.toLowerCase())} — nell'inventario del gruppo.</p>
        ${obj.effetto ? `<p class="nota mt">${rendi(obj.effetto)}</p>` : ''}`;
    }
  }
  // se il testo dell'oggetto richiede una prova (es. presa rischiosa NERVI), compare il tiro
  await messaggioProva(`${tile.id} — cercare`, `<p><i>${rendi(esito.esito)}</i></p>${extra}`, esito.esito, nm);
  segnaAzione(nm, 'cercare');
}

// pannello «oggetti del gruppo»: nomi tappabili per leggere carta ed effetto
function oggettiHtml() {
  const list = P().indagine.oggetti || [];
  if (!list.length) return '<p class="nota">Ancora niente. Cercate nelle stanze.</p>';
  return `<div class="btn-riga">${list.map((nm, i) =>
    `<button class="btn" data-obj="${i}">${esc(nm.toLowerCase())}</button>`).join('')}</div>`;
}

async function azioneInteragire(nm) {
  const sp = SP(); const disp = interazioneDisponibile(nm); if (!disp) return;
  if (disp.tipo === 'grata') { sp.grate.push(`${sp.eroiPos[nm].t}-${disp.dir}`); log('La grata è aperta.'); segnaAzione(nm, 'interagire'); return; }
  if (disp.tipo === 'compito') {
    const c = disp.c;
    if (disp.bloccato && c.fuoriPosto) {
      flash(`${c.nemico.toLowerCase()} non si lascia agganciare qui: vi aspetta in ${c.fuoriPosto}.`);
      return;                                   // nessuna azione spesa
    }
    if (disp.bloccato) {
      flash(`${c.nemico.toLowerCase()} non tratta finché è in forze: portatelo a ${c.soglia} Ferite (ora ${c.bloccato.ferite}/${c.bloccato.max}), poi Interagite.`);
      return;                                   // nessuna azione spesa
    }
    if (c.prova) {
      const e = eroe(nm);
      const r = await tiraProva({ titolo: `${c.prova.attr.toUpperCase()} — ${primo(nm)}`, diffLabel: c.prova.diff,
        soglia: ctx.comune.regole.diff[c.prova.diff],
        bonus: [{ label: c.prova.attr.toUpperCase(), val: e[c.prova.attr] || 0 }], modo: modoDadi() });
      if (r == null) return;                                  // prova annullata: nessuna azione spesa
      if (!r.ok) { log(`${primo(nm)}: ${c.fallita || 'non ci riesce'}.`); segnaAzione(nm, 'interagire'); return; }
    }
    // un'azione puo' valere PIU' di un punto: la documentazione dell'Ep.10 vale
    // +1, o +2 con la Macchina Fotografica in inventario (`c.per_azione` col
    // moltiplicatore condizionato a un oggetto). Cosi' la traccia si riempie al
    // ritmo che la Soluzione descrive, non un colpo alla volta.
    let passo = 1;
    if (c.per_azione) {
      passo = c.per_azione.base || 1;
      if (c.per_azione.oggetto && (P().indagine.oggetti || []).some((o) => new RegExp(c.per_azione.oggetto, 'i').test(o))) passo = c.per_azione.con_oggetto || passo;
      // scala col TIER d'indagine (Ep.20: il Controcanto va più veloce con più
      // Frammenti — astratti qui nell'esito d'indagine slancio/preparati/nessuno,
      // perché i 20 Frammenti campagna-wide non sono tracciati in digitale).
      if (c.per_azione.per_tier) passo = c.per_azione.per_tier[(P().vantaggi || {}).tier || 'nessuno'] || passo;
    }
    // «Fino a DUE eroi all'intercapedine possono Interagire per documentare»:
    // il fascicolo mette un tetto per round e il motore lasciava lavorare
    // tutti. Il conto per round si azzera da solo al cambio di round.
    const st = statoCompiti();
    if (c.per_round_max) {
      sp.compitiRound = (sp.compitiRound && sp.compitiRound.round === sp.round)
        ? sp.compitiRound : { round: sp.round };
      sp.compitiRound[c.id] = (sp.compitiRound[c.id] || 0) + 1;
    }
    st[c.id] = (st[c.id] || 0) + passo;
    // ROGO (Ep.13) — snapshot piena/parziale ALL'ATTO DELLA PRESA: se il torchio
    // brucia adesso e manca la Cassetta, i registri escono anneriti. Deciso qui e
    // non a fine fuga, altrimenti al ritorno in T1 tutto sarebbe gia' bruciato.
    if (specRogo() && st[c.id] >= c.quante && sp.registriAnneriti == null) {
      sp.registriAnneriti = rogoBrucia(c.tile) && !haProtezioneRogo();
      if (sp.registriAnneriti) log('Il torchio è in fiamme: i registri si anneriscono mentre li strappate.');
      // Il Molino è ora un inferno: sgherri e guardie NON restano a battersi tra
      // le fiamme, fuggono. La fuga è una corsa contro il FUOCO, non un grind
      // contro la truppa — così il rogo è la vera minaccia dell'estrazione.
      const fuggiti = sp.nemici.filter((n) => n.pos).length;
      if (fuggiti) { sp.nemici = sp.nemici.filter((n) => !n.pos); log(`Il Molino è in fiamme: ${fuggiti} tra sgherri e guardie fuggono. Ora siete voi contro il rogo.`); }
    }
    if (c.nemico) {                       // catturato: esce dal tavolo, non e' un morto
      const j = sp.nemici.findIndex((n) => n.pos && n.nome === c.nemico && adiacGlob(sp.eroiPos[nm], n.pos));
      if (j >= 0) sp.nemici.splice(j, 1);
    }
    log(`${primo(nm)}: ${c.etichetta.toLowerCase()} (${st[c.id]}/${c.quante}).`);
    if (st[c.id] >= c.quante && c.fatto) log(c.fatto);
    segnaAzione(nm, 'interagire'); return;
  }
  if (disp.tipo === 'uscita') {
    const u = specUscita(); const a = disp.arredo; const e = eroe(nm);
    const giusto = a[0] === u.arredo[0] && a[1] === u.arredo[1];
    const r = await tiraProva({ titolo: `spostare ${String(a[2]).toLowerCase()} — ${primo(nm)}`,
      diffLabel: u.diff || 'Media', soglia: ctx.comune.regole.diff[u.diff || 'Media'],
      bonus: [{ label: 'VIGORE', val: e.vigore }], modo: modoDadi() });
    if (r == null) return;
    if (!r.ok) { log(`${primo(nm)} non riesce a smuovere ${String(a[2]).toLowerCase()}.`); salvaP(); segnaAzione(nm, 'interagire'); return; }
    if (!giusto) {
      // arredo sbagliato: l'azione e' spesa, e quell'arredo non si ritenta piu'
      sp.uscitaTentati = (sp.uscitaTentati || []).concat(chiave([a[0], a[1]]));
      log(`Sotto ${String(a[2].toLowerCase())} non c'è nulla: solo pietra.`);
      salvaP(); segnaAzione(nm, 'interagire'); return;
    }
    sp.uscita = { aperta: true, tile: u.tile, cella: [u.arredo[0], u.arredo[1]] };
    log(`${u.testo || 'Sotto l’arredo si apre un passaggio.'} Portateci ${nomeScortato()}.`);
    ctx.layout = null; segnaAzione(nm, 'interagire'); return;
  }
  if (disp.tipo === 'scortato') {
    const i = disp.i; const s = specScort(i); const inv = P().indagine.oggetti || [];
    // la chiave dell'episodio apre senza prova; senza prova dichiarata basta Interagire
    if (s.chiave && inv.some((o) => new RegExp(s.chiave, 'i').test(o))) { liberaScortato(nm, i); return; }
    if (!s.prova) { liberaScortato(nm, i); return; }
    const e = eroe(nm); const attr = s.prova.attr || 'acume';
    const bonus = [{ label: attr.toUpperCase(), val: e[attr] || 0 }];
    for (const b of s.prova.bonus || []) { if (inv.some((o) => new RegExp(b, 'i').test(o))) bonus.push({ label: b, val: 1 }); }
    const r = await tiraProva({ titolo: `${s.prova.titolo || 'liberare ' + s.nome} — ${primo(nm)}`,
      diffLabel: s.prova.diff, soglia: ctx.comune.regole.diff[s.prova.diff], bonus, modo: modoDadi() });
    if (r == null) return;
    if (r.ok) liberaScortato(nm, i);
    else { log(`${primo(nm)} ${s.prova.fallita || 'non riesce a liberare ' + s.nome}.`); salvaP(); segnaAzione(nm, 'interagire'); }
  }
}
function liberaScortato(nm, i) {
  const sp = SP(); const pos = sp.eroiPos[nm]; const tile = tileDi(pos.t); const s = specScort(i);
  // Un'azione libera TUTTI i prigionieri tenuti nello stesso punto: e' quanto
  // dice il testo d'arbitro dell'Ep.4 («un'azione per entrambi»), dove Gaspare
  // e Rocco sono legati insieme nella stessa fossa.
  const insieme = specScortati()
    .map((x, k) => ({ x, k }))
    .filter(({ x, k }) => !sp.scortati[k].liberato && x.tile === s.tile && x.cella === s.cella);
  const occ = new Set(); occupati(null, false).forEach((k) => { const [t, x, y] = k.split(','); if (t === pos.t) occ.add(`${x},${y}`); });
  const libere = celleLibereTile(tile, [pos.x, pos.y], insieme.length, occ);
  insieme.forEach(({ x, k }, n) => {
    sp.scortati[k].liberato = true;
    const cella = libere[n] || [pos.x, pos.y];
    sp.scortati[k].pos = { t: pos.t, x: cella[0], y: cella[1] };
    log(`${x.nome} è libero! Riportatelo in ${x.meta}.`);
  });
  segnaAzione(nm, 'interagire');
}

function azioneRianima(nm) {
  const sp = SP(); const pos = sp.eroiPos[nm];
  const giu = P().party.find((x) => x !== nm && (sp.vite[x] ?? 1) <= 0 && adiacGlob(pos, sp.eroiPos[x]));
  if (!giu) return;
  sp.vite[giu] = nm.includes('ATTILIO') ? 3 : 2;
  log(`${primo(nm)} rianima ${primo(giu)} (${sp.vite[giu]} salute).`);
  segnaAzione(nm, 'rianimare');
}

// azione «Usare un oggetto»: sceglie dall'inventario e ne applica l'effetto di
// spedizione. Diapason: Ep.1, Custode Difesa 5 + salta attivazione. La chiave
// che libera il PNG scortato viene dal dato (ep.scortato[].chiave). Passivi e
// oggetti-quest: si leggono soltanto (nessuna azione spesa).
async function usaOggetto(nm) {
  const sp = SP(); const inv = P().indagine.oggetti || [];
  if (!inv.length) { flash('Inventario del gruppo vuoto.'); return; }
  if (!azioniRestano(nm)) { flash('Nessuna azione rimasta.'); return; }
  const scelto = await scegli('usa quale oggetto?', inv.map((o) => ({ id: o, label: o.toLowerCase() })));
  if (!scelto) return;
  const pos = sp.eroiPos[nm];
  if (/diapason/i.test(scelto)) {
    const boss = ctx.ep.soluzione.boss;
    const i = sp.nemici.findIndex((n) => n.nome === boss && n.pos && adiacGlob(pos, n.pos));
    if (i < 0) { flash(`Devi essere adiacente al ${boss.toLowerCase()}.`); return; }
    sp.nemici[i].difMod = 5; sp.nemici[i].flash = true;
    log(`${primo(nm)} fa vibrare il diapason: ${boss.toLowerCase()} Difesa 5 e salta la prossima attivazione.`);
    await messaggio('il diapason d’argento', `<p><i>La cera del Custode si incrina come ghiaccio: <b>Difesa 5</b> per il resto della partita, e <b>salta la prossima attivazione</b>.</i></p>`);
    segnaAzione(nm, 'oggetto'); return;
  }
  // chiave di liberazione dell'episodio (dato: ep.scortato[].chiave)
  const iChiave = specScortati().findIndex((s) => s.chiave && new RegExp(s.chiave, 'i').test(scelto));
  if (iChiave >= 0) {
    const s = specScort(iChiave);
    if (scortLiberabile(pos) === iChiave) { liberaScortato(nm, iChiave); return; }
    flash(`${scelto} apre la cella in ${s.tile} (vacci adiacente).`); return;
  }
  const o = (ctx.ep.oggetti || []).find((x) => norm(x.nome) === norm(scelto));
  await messaggio(scelto.toLowerCase(), `${o && o.effetto ? `<p>${rendi(o.effetto)}</p>` : '<p class="nota">Nessun effetto attivo qui.</p>'}
    <p class="nota mt">Effetto passivo o narrativo: nessuna azione spesa.</p>`);
  // `messaggio` sostituisce l'INTERA pagina, e qui non si spende un'azione:
  // senza questo render il tabellone non torna piu' e la partita sembra
  // morta. Succedeva con qualunque oggetto passivo — i Ramponi, la Macchina
  // Fotografica, la Parola dei Tetti — cioe' quasi tutti. Il ramo del
  // diapason non ne soffriva perche' `segnaAzione` ridisegna.
  render();
}

// --------------------------------------------------------- spawn nemici
// I nemici evocati dai testi si ricavano dall'episodio (`pool` + boss), non da
// una lista cablata: ogni episodio nuovo funziona senza toccare il codice.
// Truppa: prima parola piena, senza la vocale finale («LO SGHERRO» → /sgherr/).
// Boss: nome intero, cosi' una citazione parziale non lo desta per sbaglio.
const SPAWN_OVERRIDE = {
  'CANE DEI MOLI': /(\d+)?\s*can[ei] dei moli/i,   // «can» da solo pescherebbe «canto»
};
const senzaArticolo = (n) => String(n).replace(/^(il|lo|la|i|gli|le|l’|l')\s*/i, '');
const tronca = (w) => w.replace(/[aeio]+$/i, '');
function spawnRegex() {
  // IL BOSS NON SI PESCA DAL TESTO. Da quando le sue statistiche esistono, la
  // regola generica lo faceva apparire in qualunque tessera che lo nominasse di
  // sfuggita: nell'Ep.12 il Corriere spuntava nella prima stanza e la caccia
  // finiva al secondo round. Il boss compare dove dice `soluzione.boss_tile`,
  // e basta.
  const nomi = Object.keys(ctx.ep.pool || {});
  const boss = (ctx.ep.soluzione || {}).boss;
  return nomi.map((n) => {
    if (SPAWN_OVERRIDE[n]) return [n, SPAWN_OVERRIDE[n]];
    const parole = senzaArticolo(n).split(/\s+/);
    const corpo = n === boss
      ? [...parole.slice(0, -1), tronca(parole[parole.length - 1])].join('\\s+')
      : tronca(parole[0]);
    return [n, new RegExp(`(\\d+|un|due|tre)?\\s*${corpo}`, 'i')];
  });
}
const NUM_PAROLA = { un: 1, due: 2, tre: 3 };
function spawnUno(nome, tileId) {
  const sp = SP(); const st = nemStat(nome); if (!st) return false;
  const boss = st.boss;
  if (boss && sp.bossDestato) return false;   // un boss gia' destato/abbattuto non (ri)compare
  const inCampo = sp.nemici.filter((x) => x.nome === nome).length;
  const disp = boss ? 1 : (ctx.ep.pool || {})[nome] || 0;
  if (inCampo >= disp) return false;
  const tile = tileDi(tileId);
  const occ = new Set(); occupati(null, false).forEach((k) => { const [t, x, y] = k.split(','); if (t === tileId) occ.add(`${x},${y}`); });
  // piazza lontano dagli eroi presenti nella tessera (se nessuno, dal centro)
  const eroiQui = Object.values(sp.eroiPos).filter((p) => p.t === tileId).map((p) => [p.x, p.y]);
  let best = null, bestD = -1;
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
    if (arrediSet(tile).has(chiave([x, y])) || occ.has(chiave([x, y]))) continue;
    const d = eroiQui.length ? Math.min(...eroiQui.map((p) => Math.abs(p[0] - x) + Math.abs(p[1] - y))) : (Math.abs(x - 1.5) + Math.abs(y - 1.5));
    if (d > bestD) { bestD = d; best = [x, y]; }
  }
  if (!best) return false;
  let num = 1; while (sp.nemici.some((x) => x.nome === nome && x.num === num)) num += 1;
  sp.nemici.push({ nome, num, ferite: 0, max: feriteMaxNem(st), pos: { t: tileId, x: best[0], y: best[1] } });
  if (boss) sp.bossDestato = true;   // un boss abbattuto non torna, nemmeno a soglia
  return true;
}

// tessera rivelata piu' lontana dagli eroi (distanza sul grafo delle tessere)
function tessLontana() {
  const sp = SP(); const lay = layout();
  const heroT = [...new Set(Object.values(sp.eroiPos).map((p) => p.t))];
  let best = sp.rivelate[0], bd = -1;
  for (const id of sp.rivelate) {
    const [x, y] = lay[id];
    const d = heroT.length ? Math.min(...heroT.map((h) => { const [a, b] = lay[h]; return Math.abs(a - x) + Math.abs(b - y); })) : 0;
    if (d > bd) { bd = d; best = id; }
  }
  return best;
}
// al raggiungimento della soglia del Canto il boss si desta (tessera rivelata
// piu' lontana), se non e' gia' in campo o gia' stato abbattuto. Ritorna annunci.
function destaBossSeSoglia() {
  const sp = SP(); const boss = ctx.ep.soluzione.boss; const soglia = sogliaCanto(ctx.comune, ctx.ep);
  if (!boss || sp.canto < soglia) return [];
  if (sp.bossDestato || sp.nemici.some((x) => x.nome === boss)) return [];
  // Un boss che NON si muove non puo' destarsi «nella stanza piu' lontana»: la
  // Camera del Dormiente (Ep.20) ha mov 0 perche' E' la camera, cioe' la
  // tessera finale. Piazzata a caso al Canto 3, e poi bloccata da `bossDestato`
  // dal ricomparire dove le spetta, restava in un angolo del tabellone senza
  // toccare nessuno — sono i «4 eroi su 4 in piedi» misurati nel finale. Se la
  // sua tessera non e' ancora scoperta non si desta affatto: ci pensera'
  // `spawnDaTesto` quando il gruppo aprira' la camera.
  const st = nemStat(boss) || {};
  const suo = (ctx.ep.soluzione || {}).boss_tile
    || (ctx.ep.tessere[ctx.ep.tessere.length - 1] || {}).id;
  // Un boss che si aggancia SOLO in una stanza precisa e' un boss che ASPETTA
  // in quella stanza: il Primo Gatto «appare in cresta, piu' in alto, e vi
  // studia in silenzio» (Ep.14, T4), non scende a menare le mani. Svegliarlo
  // sulla tessera piu' lontana lo mandava addosso al gruppo, che non poteva
  // agganciarlo (regola giusta) e quindi combatteva e moriva senza avanzare:
  // 4 sconfitte su 4, l'Attico mai raggiunto. `compito.tile` dice gia' dov'e'
  // il suo posto — non serve un campo nuovo. L'Ep.12 non ne ha apposta: li' il
  // Corriere e' una preda in corsa e deve stare sul tabellone presto.
  const casa = (specCompiti().find((c) => c.nemico === boss && c.tile) || {}).tile;
  if (casa) {
    if (!sp.rivelate.includes(casa)) return [];
    if (!spawnUno(boss, casa)) return [];
    return [`${boss.toLowerCase()} vi aspetta in ${casa}.`];
  }
  if (!st.mov) {
    if (!sp.rivelate.includes(suo)) return [];
    if (!spawnUno(boss, suo)) return [];
    return [`${boss.toLowerCase()} si desta: è la stanza stessa (${suo}).`];
  }
  const tile = tessLontana();
  if (!spawnUno(boss, tile)) return [];
  return [`${boss.toLowerCase()} si desta nella stanza rivelata più lontana (${tile}).`];
}
function spawnDaTesto(testo, tileId) {
  // IL BOSS E' UN DATO, non un incidente di lettura. Finora appariva solo se il
  // testo della tessera lo nominava in una forma che l'espressione regolare
  // riconosceva: nell'Ep.19 il testo dice «con l'Ispettore convinto alle
  // spalle» e Vidal non entrava MAI in partita — l'obiettivo «convincilo» era
  // irraggiungibile per una questione di prosa. `ep.soluzione.boss_tile` (di
  // norma l'ultima tessera della spina) lo fa comparire di sicuro.
  const bossNome = (ctx.ep.soluzione || {}).boss;
  const bossTile = (ctx.ep.soluzione || {}).boss_tile
    || (ctx.ep.tessere[ctx.ep.tessere.length - 1] || {}).id;
  if (bossNome && tileId === bossTile && !SP().nemici.some((n) => n.nome === bossNome)) {
    if (spawnUno(bossNome, tileId)) log(`Appare ${bossNome.toLowerCase()} in ${tileId}.`);
  }
  for (const [nome, re] of spawnRegex()) {
    const m = testo.match(re); if (!m) continue;
    let q = 1; if (m[1]) q = NUM_PAROLA[m[1].toLowerCase()] || Number(m[1]) || 1;
    for (let k = 0; k < q; k++) if (spawnUno(nome, tileId)) log(`Appare ${nome.toLowerCase()} in ${tileId}.`);
  }
}
// tessera con piu' eroi (per i rinforzi Minaccia)
function tileAffollata() {
  const sp = SP(); const conta = {};
  for (const p of Object.values(sp.eroiPos)) conta[p.t] = (conta[p.t] || 0) + 1;
  let best = sp.rivelate[0], bestN = -1;
  for (const [t, n] of Object.entries(conta)) if (n > bestN) { bestN = n; best = t; }
  return best;
}

// --------------------------------------------------------- fase minaccia
async function faseMinaccia() {
  const sp = SP();
  // un lancio d'esca lasciato a meta' non deve sopravvivere al turno: la
  // plancia resterebbe accesa sulle caselle sbagliate nel round dopo
  sp.escaModo = null;
  if (sp.fase === 'eroi') { sp.fase = 'nemici'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {}; salvaP(); }
  let n = carteDaPescare(ctx.comune, P().party.length, sp.round, sp.cantoBonus, P().episodio);
  // OBIETTIVO COMPLETATO: non si pesca piu' Minaccia. La pressione del mazzo
  // (spawn, insidie, crescendo) si ferma appena l'obiettivo e' fatto: resta
  // solo scappare da chi c'e' gia'. Toglie il ritorno sotto pressione infinita.
  if (obiettivoFatto()) {
    n = 0;
    faseNemiciAI();
    return;
  }
  if (sp.diversivoPronto) { n = Math.max(0, n - 1); sp.diversivoPronto = false; salvaP(); log('Diversivo di Fanti: 1 carta Minaccia in meno.'); }
  for (let i = 0; i < n; i++) {
    const carta = pesca(sp.mazzo, ctx.carte, P().episodio, ctx.ep);
    const crescendo = carta.title.startsWith('Crescendo'); let annunci = [];
    if (crescendo) {
      annunci = cantoDaCarta(ctx.comune, ctx.ep, sp); annunci.push(...destaBossSeSoglia());
      // la stessa carta che alza il Canto spinge anche l'orologio dell'episodio
      // («ogni carta crescendo: +1 FUGA», «la casa trema: +1 Demolizione»)
      if (annunci.length && specOrologio() && specOrologio().da_carta)
        annunci.push(...avanzaOrologio(specOrologio().da_carta, 'carta crescendo'));
      // Crescendo: se il boss e' gia' in gioco recupera 1 ferita — ma NON a 2-3 eroi
      const boss = sp.nemici.find((x) => x.nome === ctx.ep.soluzione.boss);
      if (boss && /cancellate 1 sua ferita/i.test(carta.rules)) {
        if (P().party.length >= 4) { if (boss.ferite > 0) { boss.ferite -= 1; annunci.push(`Il boss recupera 1 ferita (${boss.ferite}/${boss.max}).`); } }
        else annunci.push('A 2–3 eroi il boss non recupera ferite.');
      }
    }
    else {
      // AL CANTO MASSIMO NON ARRIVANO PIU' RINFORZI: il rituale e' al culmine,
      // il pericolo e' gia' tutto in campo. Senza questo, il mazzo continuava a
      // schierare truppa DIETRO il gruppo (a tileAffollata()) all'infinito nel
      // finale prolungato — 18 nemici dopo il round 14, misurato sull'Ep.1 —
      // finendo gli eroi a terra sparsi e rendendo il finale ingiocabile.
      const cantoMax = sp.canto >= tettoCanto(ctx.comune, ctx.ep);
      const eff = carta.rules.split('{divider}').pop(); const prima = sp.nemici.length;
      if (!cantoMax) { spawnDaTesto(eff, tileAffollata()); if (sp.nemici.length > prima) annunci.push('Rinforzi sul campo.'); }
      else annunci.push('Il Canto è al culmine: nessun nuovo rinforzo, ma quelli in campo premono.');
    }
    salvaP();
    await messaggioCarta(`minaccia ${i + 1} di ${n}`, carta, annunci);
  }
  faseNemiciAI();
}

// --------------------------------------------------------- fase nemici (IA)
const r1 = () => 1 + Math.floor(Math.random() * 6);
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const nemArt = (nome) => { const st = nemStat(nome); return st && st.art ? urlArt(st.art) : ''; };
const nemBreve = (nome) => esc(nome.toLowerCase());   // i nemici mostrano il nome intero (primo() darebbe l'articolo)
// coordinate (px, non zoomate) di un nodo sul board — come lo scr di boardHtml
function scrGeo(node) {
  const g = ctx._geo; const [TX, TY] = layout()[node.t] || [g.minX, g.maxY];
  return { l: ((TX - g.minX) * 4 + node.x) * g.cell, t: ((g.maxY - TY) * 4 + (3 - node.y)) * g.cell };
}
function setTokenPos(dataTok, node, istantaneo) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`); if (!el) return;
  const p = scrGeo(node);
  if (istantaneo) { el.style.transition = 'none'; el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; void el.offsetWidth; el.style.transition = ''; }
  else { el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; }
}
// Il RITMO della notte. Al tavolo tutto quello che riguarda i nemici va piu'
// lento: il glide del token dura 1s invece di .6s (app.css) e le attese qui si
// allungano in proporzione — se restassero corte, l'attesa scadrebbe a token
// ancora in movimento e il passo successivo lo taglierebbe a meta'.
const LENTO = 1.6;
const ritmo = (ms) => pausa(alTavolo() ? Math.round(ms * LENTO) : ms);
const muoviToken = async (dataTok, node) => { setTokenPos(dataTok, node); await ritmo(650); };

// Il passo di CHI GIOCA. I nemici scivolano lenti apposta — al tavolo serve
// vedere da dove arrivano — mentre la mossa dell'eroe l'ha appena decisa chi
// guarda: aspettare mezzo secondo il proprio token e' tempo morto. Qui il
// token si sposta con la sua transizione breve e si aspetta solo quella.
// Il chiavistello serve al doppio tocco: due clic durante lo scivolamento
// spenderebbero una azione sola per due spostamenti.
const PASSO_EROE = 340;
let scivolando = false;
async function scivolaEroe(dataTok, node) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`);
  const fermo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || fermo) return;
  el.classList.add('passo');
  setTokenPos(dataTok, node);
  await pausa(PASSO_EROE);
}

// striscia del giro dei nemici (read-only, come giroEroiHtml ma per i nemici)
function giroNemiciHtml(attivoIdx) {
  return `<div class="giro-strip">${SP().nemici.map((n, i) => {
    const boss = (nemStat(n.nome) || {}).boss ? ' boss' : '';
    return `<span class="chip-turno ritratto${boss}${i === attivoIdx ? ' attivo' : ''}">
      <span class="rit"><img src="${nemArt(n.nome)}" alt=""></span><span class="et">${nemBreve(n.nome)}${n.num > 1 ? ' ×' + n.num : ''}</span></span>`;
  }).join('')}</div>`;
}

// board della fase nemici (niente pannelli d'azione eroe) — la sequenza animata
// gira sopra questo DOM
function vistaNemici(piano) {
  const { app, ep } = ctx; const sp = SP();
  app.innerHTML = `
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">la notte reagisce</div>
      <span class="sc" style="color:var(--oro-chiaro)">round ${sp.round} · canto ${sp.canto}</span></div>
    <div class="pannello secondario"><p><b>Turno dei nemici.</b> ${esc(ep.obiettivo ? '' : '')}Ogni nemico si avvicina all’eroe più vicino e colpisce se adiacente.</p></div>
    <div class="mt"></div>
    <div class="board-area">
      <div class="board-wrap" id="board-wrap">${boardHtml(true)}</div>
      <div class="zoom-ctrl"><button class="zoom-btn" data-zoom="-">−</button><button class="zoom-btn" data-zoom="0">⤢</button><button class="zoom-btn" data-zoom="+">+</button></div>
    </div>
    <div class="lato">
      <div class="btn-riga"><button class="btn" id="salta-nemici">salta l’azione della notte →</button>${
        alTavolo() ? `<button class="btn" id="tog-nemici-app">dadi dei nemici: <b>${P().nemiciApp ? 'l’app' : 'vostri'}</b></button>` : ''}</div>
      <div class="mt"></div>
      <div class="pannello giro"><h2>il giro dei nemici</h2><div id="giro-nem">${giroNemiciHtml(-1)}</div></div>
      <div class="mt"></div>
      <div class="pannello"><h2>la salute degli eroi</h2><div id="salute-nem">${saluteHtml()}</div></div>
    </div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>diario</h2>${logHtml()}</div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  app.querySelector('#salta-nemici').onclick = () => { ctx.saltaNemici = true; };
  // si spegne (e si riaccende) anche a partita in corso: vale dal tiro dopo
  app.querySelector('#tog-nemici-app')?.addEventListener('click', (ev) => {
    P().nemiciApp = !P().nemiciApp; salvaP();
    ev.currentTarget.innerHTML = `dadi dei nemici: <b>${P().nemiciApp ? 'l’app' : 'vostri'}</b>`;
  });
  agganciaMappa();
  // porta subito (prima del paint) i token che si muovono alla posizione di PARTENZA:
  // lo stato e' gia' finale (pos1), ma l'animazione parte da pos0
  for (const s of piano) { if (s.pos0 && s.pos1 && nk(s.pos0) !== nk(s.pos1)) setTokenPos(`N:${s.i}`, s.pos0, true); }
}

// numero fluttuante «−N» sopra un token
function dmgPop(dataTok, testo) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`); if (!el) return;
  const d = document.createElement('div'); d.className = 'dmg-pop'; d.textContent = testo;
  el.appendChild(d); requestAnimationFrame(() => d.classList.add('on'));
  setTimeout(() => d.remove(), 1100);
}
function evidenziaColpito(vitt) {
  const el = ctx.app.querySelector(`[data-eroe="${vitt}"]`); if (!el) return;
  el.classList.add('colpito'); setTimeout(() => el.classList.remove('colpito'), 600);
}

// sequenza animata: centra su ogni nemico, ne mostra spostamento e azione
// chiusura della fase nemici: party-wipe e vittoria. Vive a parte perche' scatta
// in due momenti diversi — a schermo appena il piano e' pronto (i tiri li ha gia'
// fatti l'app), al tavolo solo dopo che il tavolo ha tirato per ogni nemico.
// La vittoria si valuta anche a FINE ROUND, non solo dopo un'azione: se l'ultimo
// eroe vivo raggiunge la tessera-meta e poi nessuno agisce piu', `segnaAzione`
// non la ricontrollerebbe mai e la partita resterebbe aperta a obiettivo fatto.
function chiudiFaseNemici() {
  const sp = SP();
  if (!sp.esito && P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0)) sp.esito = 'sconfitta';
  if (!sp.esito) controllaVittoria();
}

// I nemici che restano quando si salta l'animazione al tavolo: li tira l'app,
// stesse regole, senza chiedere un dado per uno. `da` e' il primo non risolto.
function risolviRestoNemici(piano, da) {
  const sp = SP();
  for (const s of piano.slice(piano.indexOf(da))) {
    if (s.attaccoPng) {
      const g = statoScortati()[s.attaccoPng.png]; const sc = specScort(s.attaccoPng.png);
      if (g && g.vite > 0) {
        const tot = r1() + r1() + s.attaccoPng.att;
        if (tot >= s.attaccoPng.dif) {
          g.vite = Math.max(0, g.vite - s.attaccoPng.dan);
          log(`${s.nome.toLowerCase()} colpisce ${sc.nome} (${tot}, −${s.attaccoPng.dan}: ${g.vite}/${sc.salute}).`);
          if (g.vite <= 0) { sp.esito = 'sconfitta'; sp.log.push(`${sc.nome} è caduto: la spedizione è fallita.`); }
        } else log(`${s.nome.toLowerCase()} manca ${sc.nome} (${tot}).`);
      }
    }
    const a = s.attacco;
    if (a && a.tot === undefined) {
      const e = eroe(a.vitt);
      a.tot = r1() + r1() + a.att;
      a.colpito = a.tot >= a.dif;
      if (a.colpito) {
        sp.vite[a.vitt] = Math.max(0, (sp.vite[a.vitt] ?? saluteMax(e)) - a.dan);
        log(`${s.nome.toLowerCase()} colpisce ${primo(a.vitt)} (2d6+att ${a.tot} ≥ ${a.dif}, −${a.dan}).`);
        if (sp.vite[a.vitt] <= 0) log(`${primo(a.vitt)} va a terra!`);
      } else log(`${s.nome.toLowerCase()} manca ${primo(a.vitt)} (${a.tot} < ${a.dif}).`);
    }
  }
}

async function eseguiTurnoNemici(piano) {
  const sp = SP();
  for (const s of piano) {
    // «salta i nemici» interrompe l'ANIMAZIONE. A schermo i colpi erano gia'
    // risolti nel piano, quindi non si perde nulla; AL TAVOLO invece i tiri
    // mancano ancora, e saltarli vorrebbe dire che i nemici non attaccano
    // affatto. Li' saltare significa «tira tu il resto»: li risolve l'app.
    if (ctx.saltaNemici) { if (piano.differito) risolviRestoNemici(piano, s); break; }
    const tokel = ctx.app.querySelector(`.tok-slot[data-tok="N:${s.i}"] .tok-board`);
    centraSuNodo(s.pos0, `nem-${s.i}-a`, true);
    await ritmo(650);
    if (s.flash) { bannerTurno(nemArt(s.nome), `<b>${nemBreve(s.nome)}</b><br>accecato: salta`, 'nemico'); await ritmo(1100); continue; }
    bannerTurno(nemArt(s.nome), `agisce<br><b>${nemBreve(s.nome)}</b>`, 'nemico');
    if (tokel) tokel.classList.add('attivo-nem');
    if (nk(s.pos0) !== nk(s.pos1)) { await muoviToken(`N:${s.i}`, s.pos1); centraSuNodo(s.pos1, `nem-${s.i}-b`, true); await ritmo(300); }
    // AL TAVOLO i dadi del nemico li tira il tavolo, adesso: contro il PNG
    // scortato (che e' un bersaglio come gli eroi) e contro l'eroe.
    if (s.attaccoPng) {
      const g = statoScortati()[s.attaccoPng.png]; const sc = specScort(s.attaccoPng.png);
      if (g && g.vite > 0) {
        const r = await tiroNemico(`${nemBreve(s.nome)} → ${sc.nome.toLowerCase()}`,
          s.attaccoPng.dif, s.attaccoPng.att);
        if (r.ok) {
          g.vite = Math.max(0, g.vite - s.attaccoPng.dan);
          log(`${s.nome.toLowerCase()} colpisce ${sc.nome} (${r.tot}, −${s.attaccoPng.dan}: ${g.vite}/${sc.salute}).`);
          if (g.vite <= 0) { sp.esito = 'sconfitta'; sp.log.push(`${sc.nome} è caduto: la spedizione è fallita.`); }
        } else log(`${s.nome.toLowerCase()} manca ${sc.nome} (${r.tot}).`);
        const sn0 = ctx.app.querySelector('#salute-nem'); if (sn0) sn0.innerHTML = saluteHtml();
      }
    }
    if (s.attacco && s.attacco.tot === undefined) {
      const a = s.attacco; const e = eroe(a.vitt);
      const r = await tiroNemico(`${nemBreve(s.nome)} → ${primo(a.vitt)}`, a.dif, a.att);
      a.tot = r.tot;
      a.colpito = r.ok;
      if (a.colpito) {
        sp.vite[a.vitt] = Math.max(0, (sp.vite[a.vitt] ?? saluteMax(e)) - a.dan);
        log(`${s.nome.toLowerCase()} colpisce ${primo(a.vitt)} (2d6+att ${a.tot} ≥ ${a.dif}, −${a.dan}).`);
        if (sp.vite[a.vitt] <= 0) log(`${primo(a.vitt)} va a terra!`);
      } else log(`${s.nome.toLowerCase()} manca ${primo(a.vitt)} (${a.tot} < ${a.dif}).`);
    }
    if (s.attacco) {
      const a = s.attacco;
      if (tokel) { tokel.classList.add('attacca'); setTimeout(() => tokel && tokel.classList.remove('attacca'), 400); }
      await ritmo(450);
      if (a.colpito) {
        // il danno entra nella vista ADESSO: prima di questo istante l'eroe e'
        // ancora in piedi sul board, anche se lo stato salvato lo sa gia' a terra
        if (ctx.viteVista) ctx.viteVista[a.vitt] = Math.max(0, (ctx.viteVista[a.vitt] ?? 0) - a.dan);
        evidenziaColpito(a.vitt); dmgPop(`E:${a.vitt}`, `−${a.dan}`);
        if ((ctx.viteVista ? ctx.viteVista[a.vitt] : 1) <= 0) {
          const t = ctx.app.querySelector(`[data-eroe="${a.vitt}"]`); if (t) t.classList.add('giu');
        }
      }
      // tiro VISIBILE: 2d6 + Attacco vs Difesa dell'eroe (i nemici tirano i dadi, non colpiscono al 100%)
      const tiro = `<span class="tb-roll">🎲 ${a.tot} ${a.colpito ? '≥' : '<'} Dif ${a.dif}</span>`;
      bannerTurno(nemArt(s.nome), a.colpito
        ? `<b>${nemBreve(s.nome)}</b> colpisce ${esc(primo(a.vitt))} ${tiro} <b class="ko-txt">−${a.dan}</b>`
        : `<b>${nemBreve(s.nome)}</b> manca ${esc(primo(a.vitt))} ${tiro}`, 'nemico');
      const sn = ctx.app.querySelector('#salute-nem'); if (sn) sn.innerHTML = saluteHtml();
      await ritmo(1050);
    } else { await ritmo(650); }
    if (tokel) tokel.classList.remove('attivo-nem');
  }
  if (ctx.saltaNemici) { for (const s of piano) setTokenPos(`N:${s.i}`, s.pos1, true); }
  piano.annunci.forEach((a) => log(a));
  ctx.viteVista = null;          // da qui in poi si mostra lo stato reale
  ctx.saltaNemici = false; ctx.ultimaCentrata = null;
  if (piano.differito) chiudiFaseNemici();   // ora i colpi sono risolti davvero
  salvaP();
  if (sp.esito) return epilogo();
  render();
}

// entry: pianifica (logica IA invariata), applica lo stato, poi anima
function faseNemiciAI() {
  const sp = SP();
  const vivi = () => P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  const piano = []; piano.annunci = []; piano.vite0 = { ...sp.vite };
  // se i tiri dei nemici sono DIFFERITI al tavolo, il danno arriva durante
  // l'animazione: lo si ricorda qui perche' l'interruttore «li tira l'app» puo'
  // accendersi a meta' fase, e i controlli di chiusura devono restare coerenti
  piano.differito = tavoloTiraNemici();
  for (let i = 0; i < sp.nemici.length; i++) {
    const n = sp.nemici[i]; const st = nemStat(n.nome); if (!n.pos || n.abbattuto) continue;
    const pos0 = n.pos;
    if (n.flash) { n.flash = false; log(`${n.nome.toLowerCase()} è accecato: salta il turno.`); piano.push({ i, nome: n.nome, pos0, pos1: pos0, flash: true, attacco: null }); continue; }
    const bersagli = vivi(); if (!bersagli.length) break;
    // ESCA PREZIOSA: chi e' entro 2 caselle dal monile ci va, e per questa
    // attivazione non attacca nessuno. Vale una volta sola — l'esca si
    // consuma a fine fase, come dice la carta («la loro prossima attivazione»).
    if (sp.esca && distGlob(n.pos, sp.esca) <= 2) {
      const cam = camminoGlob(n.pos, sp.esca, occupati(`N:${i}`, false, true));
      if (cam.length) {
        const bloccoArrivo = occupati(`N:${i}`, false);
        let k = Math.min(st.mov, cam.length) - 1;
        while (k >= 0 && bloccoArrivo.has(nk(cam[k]))) k -= 1;
        if (k >= 0) n.pos = cam[k];
      }
      log(`${n.nome.toLowerCase()} segue il luccichio del monile.`);
      piano.push({ i, nome: n.nome, pos0, pos1: n.pos, flash: false, attacco: null });
      continue;
    }
    const scelto = bersagli[Math.floor(Math.random() * bersagli.length)];
    if (!bersagli.some((nm) => adiacGlob(n.pos, sp.eroiPos[nm]))) {
      // Due insiemi diversi, come per gli eroi: il PNG scortato si ATTRAVERSA
      // ma non ci si FERMA sopra (regolamento: gli alleati e il PNG si passano,
      // non si sostano). Usare il solo set di cammino anche per l'arrivo faceva
      // fermare i nemici sulla sua casella, sovrapposti alla pedina.
      const blocco = occupati(`N:${i}`, false, true);     // cammino: il PNG si attraversa
      const bloccoArrivo = occupati(`N:${i}`, false);     // arrivo: sul PNG non ci si ferma
      let best = null, bestLen = Infinity;
      for (const nm of bersagli) for (const g of celleAdiacLibere(sp.eroiPos[nm], bloccoArrivo)) {
        const p = camminoGlob(n.pos, g, blocco);
        if (p.length && p.length < bestLen) { bestLen = p.length; best = p; }
      }
      if (best) {
        let k = Math.min(st.mov, best.length) - 1;
        while (k >= 0 && bloccoArrivo.has(nk(best[k]))) k -= 1;   // arretra fino a una casella libera
        if (k >= 0) n.pos = best[k];                              // muta live: blocco del prossimo lo vede
      }
    }
    const pos1 = n.pos;
    let attacco = null;
    // il PNG vulnerabile e' un bersaglio come gli eroi (Ep.9: 3 Salute, non
    // combatte). Gli altri PNG scortati restano invisibili ai nemici, come dice
    // il Regolamento.
    const iPng = statoScortati().findIndex((g, k) => g.liberato && g.pos && g.vite > 0
      && specScort(k).salute && adiacGlob(n.pos, g.pos));
    const adiacenti = bersagli.filter((nm) => adiacGlob(n.pos, sp.eroiPos[nm]));
    if (iPng >= 0 && (!adiacenti.length || Math.random() < 0.5)) {
      const sc = specScort(iPng);
      // AL TAVOLO il tiro non si fa qui: il piano porta solo l'INTENZIONE, e i
      // dadi li tira il tavolo durante l'animazione (vedi eseguiTurnoNemici).
      if (tavoloTiraNemici()) {
        piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco: null,
                     attaccoPng: { png: iPng, dif: sc.difesa || 7, dan: st.dan, att: st.att } });
        continue;
      }
      const g = statoScortati()[iPng];
      const tot = r1() + r1() + st.att;
      if (tot >= (sc.difesa || 7)) {
        g.vite = Math.max(0, g.vite - st.dan);
        log(`${n.nome.toLowerCase()} colpisce ${sc.nome} (${tot}, −${st.dan}: ${g.vite}/${sc.salute}).`);
        if (g.vite <= 0) { sp.esito = 'sconfitta'; sp.log.push(`${sc.nome} è caduto: la spedizione è fallita.`); }
      } else log(`${n.nome.toLowerCase()} manca ${sc.nome} (${tot}).`);
      piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco: null });
      continue;
    }
    if (adiacenti.length) {
      const vitt = adiacenti.includes(scelto) ? scelto : adiacenti[Math.floor(Math.random() * adiacenti.length)];
      const e = eroe(vitt);
      if (tavoloTiraNemici()) {
        // intenzione senza tiro: `tot`/`colpito` mancano apposta ed e'
        // l'animazione a chiederli al tavolo, dado alla mano
        piano.push({ i, nome: n.nome, pos0, pos1, flash: false,
                     attacco: { vitt, dan: st.dan, att: st.att, dif: e.difesa } });
        continue;
      }
      const tot = r1() + r1() + st.att;      // 2d6 + Attacco (tiro visibile nel banner)
      const colpito = tot >= e.difesa;
      if (colpito) {
        sp.vite[vitt] = Math.max(0, (sp.vite[vitt] ?? saluteMax(e)) - st.dan);
        log(`${n.nome.toLowerCase()} colpisce ${primo(vitt)} (2d6+att ${tot} ≥ ${e.difesa}, −${st.dan}).`);
        if (sp.vite[vitt] <= 0) log(`${primo(vitt)} va a terra!`);
      } else log(`${n.nome.toLowerCase()} manca ${primo(vitt)} (${tot} < ${e.difesa}).`);
      attacco = { vitt, colpito, dan: st.dan, tot, dif: e.difesa };
    }
    piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco });
  }
  // NB: i PNG scortati NON si muovono nella notte — li muove il giocatore nel
  // turno eroi (regolamento: «si muove nel turno degli eroi, non compie azioni»).
  // fine round: tick canto, boss a soglia (annunci mostrati dopo l'animazione)
  piano.annunci.push(...fineRound(ctx.comune, ctx.ep, sp));
  if (specOrologio() && specOrologio().ogni) piano.annunci.push(...avanzaOrologio(specOrologio().ogni, 'fine round'));
  piano.annunci.push(...avanzaRogo());   // il doom-clock del Rogo (Ep.13): incendio a round + danno
  piano.annunci.push(...avanzaCancellazione());   // la clessidra dell'Ep.15: i tell si cancellano
  piano.annunci.push(...avanzaRitmo());           // il ritmo del controcanto (Ep.20)
  piano.annunci.push(...avanzaPressione());       // ...e cio' che gli corre contro
  piano.annunci.push(...controllaFiloPerso());    // il bersaglio da prendere vivo e' caduto?
  // Cinque episodi non hanno una traccia propria: la loro soglia E' IL CANTO —
  // «prima che il Canto raggiunga la soglia-FUGA» (Ep.14), soglia-sigillo,
  // soglia-decano, soglia-arresto, risveglio. Sono i numeri che le Soluzioni
  // dichiarano episodio per episodio, e qui diventano reali anche in digitale.
  const oc = specOrologio();
  // …e un OGGETTO puo' alzare quella soglia, dove il fascicolo lo dice: la
  // Parola dei Tetti «porta la soglia-fuga da 5 a 6» (Ep.14), il Salvacondotto
  // la soglia-decano «da 6 a 7» (Ep.17), l'Uscita di Servizio la soglia-arresto
  // «da 7 a 8» (Ep.18). Erano tre regole SOLO STAMPATE: l'orologio non aveva
  // alcun campo per leggerle, quindi chi si guadagnava l'oggetto non ne
  // ricavava nulla. Stesso schema di `compito.ridotto_oggetto`.
  const sogliaOrologio = oc && oc.su_canto != null
    ? (oc.su_canto_oggetto && (P().indagine.oggetti || [])
        .some((o) => new RegExp(oc.su_canto_oggetto, 'i').test(o))
        ? (oc.su_canto_con_oggetto || oc.su_canto) : oc.su_canto)
    : null;
  // …e NON declassa un lavoro gia' finito. Le Soluzioni legano la scadenza
  // all'OBIETTIVO, non alla fine della partita: «i tre pannelli disaccordati
  // PRIMA del 4o segnalino» (Ep.4), «prima del sigillo» (Ep.15), «il decano
  // lucido PRIMA della soglia» (Ep.17). Un Gatto gia' agganciato non scavalca
  // piu' la cresta. Senza questa condizione l'Ep.4 sabotava la Conchiglia al
  // round 8 e veniva declassato al 10 mentre riportava i prigionieri a casa:
  // 0 vittorie piene su 15, tutte per un lavoro fatto in tempo.
  const lavoroFatto = specCompiti().length > 0 && compitiFiniti();
  if (oc && sogliaOrologio && !sp.esito && !lavoroFatto && sp.canto >= sogliaOrologio) {
    const testo = oc.testo || `${oc.nome}: troppo tardi.`;
    if (oc.esito === 'parziale') {
      // DECLASSA, NON CHIUDE. I fascicoli dicono «peggiora e si continua»
      // (Ep.17: «il decano lo recuperate comunque, ma ferito»; Ep.18: «un
      // eroe per round rischia la cattura»), e il gruppo deve poter finire
      // il lavoro. Chiudendo qui la vittoria PIENA diventava irraggiungibile:
      // BILANCIAMENTO registrava Ep.17 e Ep.18 al 100% vinti e 0% piena.
      // Il flag lo legge controllaVittoria, come gia' fa per il ROGO.
      if (!sp.declassato) {
        sp.declassato = testo;
        sp.log.push(testo);
        piano.annunci.push(testo);
      }
    } else {
      sp.esito = 'sconfitta';
      sp.log.push(testo);
      piano.annunci.push(testo);
    }
  }
  piano.annunci.push(...destaBossSeSoglia());
  sp.esca = null;                    // il monile ha fatto il suo giro: si raccoglie
  sp.fase = 'eroi'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {};
  statoScortati().forEach((g) => { g.mosso = false; });   // possono muoversi nel nuovo turno eroi
  sp.scortAttivo = null;
  // AL TAVOLO questi due controlli NON possono stare qui: i nemici non hanno
  // ancora tirato (lo fanno i giocatori durante l'animazione), quindi `sp.vite`
  // e' ancora lo stato di inizio fase. Li rifa' eseguiTurnoNemici a colpi
  // risolti — vedi `chiudiFaseNemici`.
  if (!piano.differito) chiudiFaseNemici();
  salvaP();                                    // stato gia' finale: reload -> fase eroi coerente
  ctx.saltaNemici = false; ctx.ultimaCentrata = null;
  ctx.viteVista = { ...piano.vite0 };          // board come a inizio fase: nessuno ancora a terra
  vistaNemici(piano);                          // board a posizioni di partenza
  return eseguiTurnoNemici(piano);             // animazione (async)
}

// --------------------------------------------------------------- utilita'
function log(t) { const sp = SP(); sp.log = sp.log || []; sp.log.push(t); }
function flash(t) {
  const d = document.createElement('div'); d.className = 'flash-msg'; d.textContent = t;
  document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('on'));
  setTimeout(() => { d.classList.remove('on'); setTimeout(() => d.remove(), 300); }, 1600);
}
function messaggio(titolo, corpo) {
  return new Promise((ok) => {
    const { app } = ctx;
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">${corpo}</div>
      <div class="btn-riga"><button class="btn pieno" id="ok-msg">continua</button></div>`;
    app.querySelector('#ok-msg').onclick = ok;
  });
}
async function finePartita(esito) {
  if (!await conferma(esito === 'vittoria' ? 'Vittoria?' : 'Tutti gli eroi a terra?', {
    dettaglio: esito === 'vittoria' ? 'Si chiude qui.' : 'La notte vince.',
    si: 'sì, si chiude', no: 'non ancora',
  })) return;
  SP().esito = esito; salvaP(); epilogo();
}
function epilogo() {
  const { app, ep } = ctx; const sp = SP();
  app.classList.remove('immersivo');   // e' testo, e va letto tutto: deve scorrere
  app.innerHTML = `<div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">${esc(ep.titolo)}</div><span></span></div>
    <div class="pannello centrato">
      <h2>${sp.esito === 'vittoria' ? 'l’alba vi trova in piedi' : 'la notte ha vinto'}</h2>
      <p class="mt">${sp.esito === 'vittoria'
        ? `${specScortati().map((s) => s.nome).join(' e ') || 'Il gruppo'} è al sicuro. ${sp.round} round, canto ${sp.canto}. Leggete l’epilogo nel fascicolo Soluzione.`
        : 'Rialzatevi: la Soluzione dice cosa resta di questa notte.'}</p>
      ${(() => { const cb = controBusta(ep); return cb ? `
        <hr class="divisore">
        <div style="text-align:left">
          <p class="nota">— si apre ora, al ritorno —</p>
          <p><b>${esc(cb.q.replace(/^CONTRO-BUSTA — /, ''))}</b></p>
          <p class="nota">La verità: ${esc(cb.risposta)}</p>
          <p>${esc(cb.esatta)}</p>
        </div>` : ''; })()}
      <div class="btn-riga" style="justify-content:center"><button class="btn pieno" id="al-menu">alla taverna</button></div></div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  app.querySelector('#al-menu').onclick = () => ctx.vaiA('menu');
}

// export del motore per i test (node): _setup inietta un ctx finto (ep + sp)
export const _motore = {
  esploraMosse, camminoGlob, adiacGlob, viciniGlob, portaCella, arrediSet, layout, nk, tileDi,
  avanzaCancellazione, avanzaRitmo, avanzaPressione, controllaFiloPerso, avanzaOrologio,
  bonusVoce, celleEsca,
  _setup: (ep, sp, extra) => {
    const { comune, ...resto } = extra || {};
    ctx = { ep, comune: comune || { regole: {} },
            partita: { spedizione: sp, party: [], ...resto }, layout: null };
  },
};
