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
         cantoDaCarta, cerca, urlCarta, urlArt, cartaOggetto } from './engine.js';
import { tiraProva } from './dadi.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ctx = null;   // { app, partita, ep, comune, carte, vaiA, layout }
const P = () => ctx.partita;
const SP = () => ctx.partita.spedizione;
const salvaP = () => salva(ctx.partita);

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
  return e.salute + bonus + bonusTier;
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
  app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
  app.querySelector('#via').onclick = iniziaPartita;
}

function iniziaPartita() {
  const { ep, partita } = ctx;
  const t0 = ep.tessere[0];
  const entrata = portaCella(t0, t0.start || 'S');
  const occ = new Set(); const celle = celleLibereTile(t0, entrata, partita.party.length, occ);
  const eroiPos = {};
  partita.party.forEach((nm, i) => { eroiPos[nm] = { t: t0.id, x: (celle[i] || entrata)[0], y: (celle[i] || entrata)[1] }; });
  partita.spedizione = {
    digitale: true, round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
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
  if (sp.esito) return epilogo();
  if (sp.fase === 'nemici') return faseNemiciAI();
  const { app, ep } = ctx;
  const attivo = eroiAttivoNome();
  const tpk = P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0);
  app.innerHTML = `
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">tutto a schermo</div>
      <span class="sc" style="color:var(--oro-chiaro)">round ${sp.round} · canto ${sp.canto}</span></div>
    <div class="pannello"><p><b>Obiettivo:</b> ${esc(ep.obiettivo || '')}
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
    <p class="nota" style="text-align:center">Trascina per spostare la mappa · +/− o Ctrl+rotella per lo zoom</p>
    <div class="mt"></div>
    <div class="pannello giro"><h2>il giro degli eroi</h2>${giroEroiHtml()}</div>
    <div class="mt"></div>
    <div class="pannello"><h2>azioni di ${scortAttivo() != null ? esc((specScort(scortAttivo()).nome || '').toLowerCase()) : (attivo ? esc(primo(attivo)) : '—')}</h2>${azioniHtml()}</div>
    <div class="mt"></div>
    <div class="pannello"><h2>la salute degli eroi</h2>${saluteHtml()}</div>
    <div class="mt"></div>
    <div class="pannello"><h2>le abilità degli eroi</h2>${abilitaHtml()}
      <p class="nota mt">«usa» spende una carica (vale come un’azione dell’eroe attivo).</p></div>
    ${sp.nemici.length ? `<div class="mt"></div><div class="pannello"><h2>nemici in campo</h2>${nemiciHtml()}</div>` : ''}
    <div class="mt"></div>
    <div class="pannello"><h2>oggetti del gruppo</h2>${oggettiHtml()}</div>
    <div class="mt"></div>
    <div class="pannello"><h2>diario</h2>${logHtml()}</div>
    <div class="btn-riga"><button class="btn" id="sconfitta">gli eroi cadono</button></div>`;
  app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
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

function boardHtml() {
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
  ctx._geo = { minX, maxY, cell };   // per centrare la finestra sulla tessera piu' affollata
  const scr = (n) => { const [TX, TY] = lay[n.t]; return { l: ((TX - minX) * 4 + n.x) * cell, t: ((maxY - TY) * 4 + (3 - n.y)) * cell }; };
  const attivo = eroiAttivoNome();

  const ragg = attivo ? raggEroe(attivo) : (scortAttivo() != null ? raggScortato(scortAttivo()) : {});

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
    return `<div class="nemico-riga"><span class="nemico-nome">${esc(primo(nm))}${v <= 0 ? ' <b>a terra</b>' : ''}</span>
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
    return `<button class="chip-turno ritratto${nm === attivo ? ' attivo' : ''}${done || giu ? ' fatto' : ''}" data-turno="${esc(nm)}">
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
  { key: 'SERRA', ab: 'Voce ferma', usi: 3, nota: 'Fino al tuo prossimo turno gli eroi adiacenti tirano NERVI con +2.' },
  { key: 'CARLA', ab: 'Flash!', usi: 2, eff: 'flash', nota: 'Un nemico entro 2 caselle salta la sua prossima attivazione.' },
  { key: 'CARBONE', ab: 'Esca preziosa', usi: 2, nota: 'I nemici entro 2 caselle dall’esca vanno verso di essa nel loro turno.' },
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
  } else {
    // Voce ferma / Esca preziosa: carica spesa, effetto narrato
    log(`${primo(nm)} usa ${c.ab.toLowerCase()} (${c.nota})`);
  }
  if (fatto) { sp.abilita = sp.abilita || {}; sp.abilita[nm] = usate + 1; salvaP(); segnaAzione(nm, 'abilita'); }
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
          soglia: ctx.comune.regole.diff[req.diff], bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }], modo: 'digitale' });
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
        soglia: ctx.comune.regole.diff[req.diff], bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }], modo: 'digitale' });
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
  app.querySelectorAll('.cella-mossa').forEach((c) => c.onclick = () => {
    const node = { t: c.dataset.t, x: +c.dataset.x, y: +c.dataset.y };
    if (scortAttivo() != null) return muoviScortato(scortAttivo(), node);
    if (!attivo) return;
    muoviEroe(attivo, node, c.dataset.reveal || null);
  });
  app.querySelectorAll('[data-nemico]').forEach((el) => el.onclick = () => { if (attivo) attaccaNemico(attivo, Number(el.dataset.nemico)); });
  app.querySelectorAll('[data-eroe]').forEach((el) => el.onclick = () => {
    const nm = el.dataset.eroe; if ((sp.vite[nm] ?? 0) <= 0) return;
    sp.scortAttivo = null;
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
function agganciaMappa() {
  const { app } = ctx; const sp = SP(); const wrap = app.querySelector('#board-wrap'); if (!wrap) return;
  app.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
    const d = b.dataset.zoom;
    sp.zoom = d === '0' ? 1 : clampZoom((sp.zoom || 1) * (d === '+' ? 1.25 : 0.8));
    salvaP(); render();
  });
  wrap.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; e.preventDefault();
    sp.zoom = clampZoom((sp.zoom || 1) * (e.deltaY < 0 ? 1.1 : 0.9)); salvaP(); render();
  }, { passive: false });
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

// il compito a portata dell'eroe: giusta tessera, quante ne restano, e — se il
// dato nomina un arredo — esserne adiacenti
function compitoDisponibile(pos) {
  const sp = SP();
  for (const c of specCompiti()) {
    if (compitoFatte(c.id) >= c.quante) continue;
    // dipendenza: la Formula si legge solo a movimenti spenti (Ep.6)
    if (c.dopo && compitoFatte(c.dopo) < (specCompiti().find((x) => x.id === c.dopo) || {}).quante) continue;
    // compito su un NEMICO: agganciare il corriere, prendere vivo il Caposquadra,
    // catturare il Notaio — adiacenza a quella miniatura, non una stanza
    if (c.nemico) {
      const q = sp.nemici.some((n) => n.pos && n.nome === c.nemico && adiacGlob(pos, n.pos));
      if (!q) continue;
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
  sp.traccia = (sp.traccia || 0) + quanto;
  const ann = [`${o.nome}: ${Math.min(sp.traccia, o.max)}/${o.max}${motivo ? ' — ' + motivo : ''}.`];
  if (sp.traccia >= o.max) {
    sp.esito = o.esito === 'parziale' ? 'parziale' : 'sconfitta';
    ann.push(o.testo || `${o.nome} al massimo: la spedizione è persa.`);
    sp.log.push(ann[ann.length - 1]); salvaP();
  }
  return ann;
}

function controllaVittoria() {
  const sp = SP(); const v = ctx.ep.vittoria;
  if (sp.esito || !v || !specCompiti().length || !compitiFiniti()) return false;
  const vivi = P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (v.tessera && !vivi.every((nm) => sp.eroiPos[nm] && sp.eroiPos[nm].t === v.tessera)) return false;
  if (v.boss && sp.nemici.some((n) => n.nome === ctx.ep.soluzione.boss && n.pos)) return false;
  sp.esito = 'vittoria';
  sp.log.push(v.testo || 'L’obiettivo è compiuto: siete salvi.');
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
    await messaggioProva(`${node.t} — ${tnow.nome.toLowerCase()}`, `<p><i>${rendi(tnow.testo)}</i></p>`, tnow.testo, nm);
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
    if (sp.scortati.every((x) => x.uscito)) {
      sp.esito = 'vittoria';
      sp.log.push(s.vittoria || `${s.nome} è fuori: siete salvi.`);
      salvaP(); return epilogo();
    }
    log(`${s.nome} sparisce nel passaggio: manca ancora qualcuno.`);
    salvaP(); return render();
  }
  // chi e' gia' passato dal condotto conta come arrivato: i due dell'Ep.4
  // possono uscire uno per la via segreta e uno dalla porta d'ingresso
  const arrivati = sp.scortati.every((x, k) => x.uscito || (x.liberato && x.pos && x.pos.t === specScort(k).meta));
  if (node.t === s.meta && arrivati) {
    sp.esito = 'vittoria';
    sp.log.push(s.vittoria || `${s.nome} è al sicuro: siete salvi.`);
    salvaP(); return epilogo();
  }
  salvaP(); render();
}

async function attaccaNemico(nm, i) {
  const sp = SP(); const e = eroe(nm); const n = sp.nemici[i]; if (!n) return;
  if (azioneSpesa(nm, 'attaccare')) { flash(`${primo(nm)} ha già attaccato: le 2 azioni sono di tipo diverso.`); return; }
  if (!azioniRestano(nm)) { flash(`${primo(nm)} non ha più azioni.`); return; }
  if (!adiacGlob(sp.eroiPos[nm], n.pos)) { flash('Nemico non adiacente: avvicinati prima.'); return; }
  const st = nemStat(n.nome);
  const r = await tiraProva({ titolo: `${primo(nm)} → ${n.nome.toLowerCase()}`, diffLabel: 'Difesa', soglia: n.difMod ?? st.dif,
    bonus: [{ label: 'VIGORE', val: e.vigore }, { label: 'arma', val: 1 }], modo: 'digitale' });
  if (r == null) return;
  const dif = n.difMod ?? st.dif;
  if (r.ok) {
    n.ferite += 1; log(`${primo(nm)} colpisce ${n.nome.toLowerCase()} (2d6+VIG ${r.tot} ≥ Dif ${dif} → ${n.ferite}/${n.max}).`);
    if (n.ferite >= n.max) { log(`${n.nome.toLowerCase()} è abbattuto!`); sp.nemici.splice(i, 1); }
  } else log(`${primo(nm)} manca ${n.nome.toLowerCase()} (${r.tot} < Dif ${dif}).`);
  salvaP(); segnaAzione(nm, 'attaccare');
}

async function azioneCercare(nm) {
  const sp = SP(); const tile = tileDi(sp.eroiPos[nm].t);
  if (sp.cercate[tile.id]) { flash('Qui avete già cercato.'); return; }
  const e = eroe(nm); const bonus = [{ label: 'ACUME', val: e.acume }];
  if (nm === 'ELENA FOSCO') bonus.push({ label: 'Occhio Clinico', val: 2 });
  const r = await tiraProva({ titolo: `cercare — ${primo(nm)}`, diffLabel: 'Media', soglia: ctx.comune.regole.diff.Media, bonus, modo: 'digitale' });
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
    if (c.prova) {
      const e = eroe(nm);
      const r = await tiraProva({ titolo: `${c.prova.attr.toUpperCase()} — ${primo(nm)}`, diffLabel: c.prova.diff,
        soglia: ctx.comune.regole.diff[c.prova.diff],
        bonus: [{ label: c.prova.attr.toUpperCase(), val: e[c.prova.attr] || 0 }], modo: 'digitale' });
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
    }
    const st = statoCompiti(); st[c.id] = (st[c.id] || 0) + passo;
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
      bonus: [{ label: 'VIGORE', val: e.vigore }], modo: 'digitale' });
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
      diffLabel: s.prova.diff, soglia: ctx.comune.regole.diff[s.prova.diff], bonus, modo: 'digitale' });
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
  const sp = SP(); const boss = ctx.ep.soluzione.boss; const soglia = ctx.comune.regole.soglia_canto;
  if (!boss || sp.canto < soglia) return [];
  if (sp.bossDestato || sp.nemici.some((x) => x.nome === boss)) return [];
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
  if (sp.fase === 'eroi') { sp.fase = 'nemici'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {}; salvaP(); }
  let n = carteDaPescare(ctx.comune, P().party.length, sp.round, sp.cantoBonus, P().episodio);
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
    else { const eff = carta.rules.split('{divider}').pop(); const prima = sp.nemici.length; spawnDaTesto(eff, tileAffollata()); if (sp.nemici.length > prima) annunci.push('Rinforzi sul campo.'); }
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
const muoviToken = async (dataTok, node) => { setTokenPos(dataTok, node); await pausa(650); };

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
    <div class="pannello"><p><b>Turno dei nemici.</b> ${esc(ep.obiettivo ? '' : '')}Ogni nemico si avvicina all’eroe più vicino e colpisce se adiacente.</p></div>
    <div class="mt"></div>
    <div class="board-area">
      <div class="board-wrap" id="board-wrap">${boardHtml()}</div>
      <div class="zoom-ctrl"><button class="zoom-btn" data-zoom="-">−</button><button class="zoom-btn" data-zoom="0">⤢</button><button class="zoom-btn" data-zoom="+">+</button></div>
    </div>
    <div class="btn-riga"><button class="btn" id="salta-nemici">salta l’azione della notte →</button></div>
    <div class="mt"></div>
    <div class="pannello giro"><h2>il giro dei nemici</h2><div id="giro-nem">${giroNemiciHtml(-1)}</div></div>
    <div class="mt"></div>
    <div class="pannello"><h2>la salute degli eroi</h2><div id="salute-nem">${saluteHtml()}</div></div>
    <div class="mt"></div>
    <div class="pannello"><h2>diario</h2>${logHtml()}</div>`;
  app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
  app.querySelector('#salta-nemici').onclick = () => { ctx.saltaNemici = true; };
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
async function eseguiTurnoNemici(piano) {
  const sp = SP();
  for (const s of piano) {
    if (ctx.saltaNemici) break;
    const tokel = ctx.app.querySelector(`.tok-slot[data-tok="N:${s.i}"] .tok-board`);
    centraSuNodo(s.pos0, `nem-${s.i}-a`, true);
    await pausa(650);
    if (s.flash) { bannerTurno(nemArt(s.nome), `<b>${nemBreve(s.nome)}</b><br>accecato: salta`, 'nemico'); await pausa(1100); continue; }
    bannerTurno(nemArt(s.nome), `agisce<br><b>${nemBreve(s.nome)}</b>`, 'nemico');
    if (tokel) tokel.classList.add('attivo-nem');
    if (nk(s.pos0) !== nk(s.pos1)) { await muoviToken(`N:${s.i}`, s.pos1); centraSuNodo(s.pos1, `nem-${s.i}-b`, true); await pausa(300); }
    if (s.attacco) {
      const a = s.attacco;
      if (tokel) { tokel.classList.add('attacca'); setTimeout(() => tokel && tokel.classList.remove('attacca'), 400); }
      await pausa(450);
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
      await pausa(1050);
    } else { await pausa(650); }
    if (tokel) tokel.classList.remove('attivo-nem');
  }
  if (ctx.saltaNemici) { for (const s of piano) setTokenPos(`N:${s.i}`, s.pos1, true); }
  piano.annunci.forEach((a) => log(a));
  ctx.viteVista = null;          // da qui in poi si mostra lo stato reale
  ctx.saltaNemici = false; ctx.ultimaCentrata = null;
  salvaP();
  if (sp.esito) return epilogo();
  render();
}

// entry: pianifica (logica IA invariata), applica lo stato, poi anima
function faseNemiciAI() {
  const sp = SP();
  const vivi = () => P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  const piano = []; piano.annunci = []; piano.vite0 = { ...sp.vite };
  for (let i = 0; i < sp.nemici.length; i++) {
    const n = sp.nemici[i]; const st = nemStat(n.nome); if (!n.pos) continue;
    const pos0 = n.pos;
    if (n.flash) { n.flash = false; log(`${n.nome.toLowerCase()} è accecato: salta il turno.`); piano.push({ i, nome: n.nome, pos0, pos1: pos0, flash: true, attacco: null }); continue; }
    const bersagli = vivi(); if (!bersagli.length) break;
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
      const g = statoScortati()[iPng]; const sc = specScort(iPng);
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
  // Cinque episodi non hanno una traccia propria: la loro soglia E' IL CANTO —
  // «prima che il Canto raggiunga la soglia-FUGA» (Ep.14), soglia-sigillo,
  // soglia-decano, soglia-arresto, risveglio. Sono i numeri che le Soluzioni
  // dichiarano episodio per episodio, e qui diventano reali anche in digitale.
  const oc = specOrologio();
  if (oc && oc.su_canto && !sp.esito && sp.canto >= oc.su_canto) {
    sp.esito = oc.esito === 'parziale' ? 'parziale' : 'sconfitta';
    sp.log.push(oc.testo || `${oc.nome}: troppo tardi.`);
    piano.annunci.push(oc.testo || `${oc.nome}: troppo tardi.`);
  }
  piano.annunci.push(...destaBossSeSoglia());
  sp.fase = 'eroi'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {};
  statoScortati().forEach((g) => { g.mosso = false; });   // possono muoversi nel nuovo turno eroi
  sp.scortAttivo = null;
  if (!sp.esito && P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0)) sp.esito = 'sconfitta';
  // vittoria valutata anche a FINE ROUND, non solo dopo un'azione: se l'ultimo
  // eroe vivo raggiunge la tessera-meta e poi nessuno agisce piu' (tutti fermi
  // all'obiettivo), `segnaAzione` non la ricontrollerebbe mai e la partita
  // restava aperta a canne fatte e gruppo gia' rientrato.
  if (!sp.esito) controllaVittoria();
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
function finePartita(esito) {
  if (!confirm(esito === 'vittoria' ? 'Vittoria?' : 'Tutti gli eroi a terra?')) return;
  SP().esito = esito; salvaP(); epilogo();
}
function epilogo() {
  const { app, ep } = ctx; const sp = SP();
  app.innerHTML = `<div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">${esc(ep.titolo)}</div><span></span></div>
    <div class="pannello centrato">
      <h2>${sp.esito === 'vittoria' ? 'l’alba vi trova in piedi' : 'la notte ha vinto'}</h2>
      <p class="mt">${sp.esito === 'vittoria'
        ? `${specScortati().map((s) => s.nome).join(' e ') || 'Il gruppo'} è al sicuro. ${sp.round} round, canto ${sp.canto}. Leggete l’epilogo nel fascicolo Soluzione.`
        : 'Rialzatevi: la Soluzione dice cosa resta di questa notte.'}</p>
      <div class="btn-riga" style="justify-content:center"><button class="btn pieno" id="al-menu">alla taverna</button></div></div>`;
  app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
  app.querySelector('#al-menu').onclick = () => ctx.vaiA('menu');
}

// export del motore per i test (node): _setup inietta un ctx finto (ep + sp)
export const _motore = {
  esploraMosse, camminoGlob, adiacGlob, viciniGlob, portaCella, arrediSet, layout, nk, tileDi,
  _setup: (ep, sp) => { ctx = { ep, partita: { spedizione: sp, party: [] }, layout: null }; },
};
