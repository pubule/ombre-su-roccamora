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

// board PNG per Ep.1 (i file usano il maiuscoletto con apostrofo tipografico,
// diverso dal nome JSON). ponytail: mappa per ep1; generalizzare per altri ep.
const BOARD_EP1 = {
  T1: 'Banchina d’Ingresso', T2: 'Sala delle Casse', T3: 'Corridoio delle Candele',
  T4: 'Ufficio del Custode', T5: 'Scala al Piano Interrato', T6: 'Cripta della Cera',
};
const urlBoard = (tileId) => {
  const nm = BOARD_EP1[tileId];
  return nm ? encodeURI(`/assets/${ctx.ep.cartella}/board/${tileId} - ${nm}.png`) : '';
};

// ---------------------------------------------------------- motore a griglia
const dentro = ([x, y]) => x >= 0 && x < 4 && y >= 0 && y < 4;
const chiave = ([x, y]) => `${x},${y}`;
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
const dirExit = (raw) => (raw.match(/^\S+/) || [''])[0];   // "T5 (grata...)" -> "T5"
const OPP = { N: 'S', S: 'N', E: 'O', O: 'E' };
const DELTA = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] };

function arrediSet(tile) {
  return new Set((tile.arredi || []).map(([gx, gy]) => chiave([gx, gy])));
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
// muro (nemici/Ruggero); gli alleati NON bloccano il passaggio ma si passano i
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
const nemStat = (nome) => ctx.comune.nemici.find((n) => n.nome === nome);
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
  return e.salute + bonus;
}
// nodi occupati (eroi + nemici + Ruggero), tranne exclKey. Se soloNemici, solo
// nemici+Ruggero (per il cammino eroi, che attraversa gli alleati).
function occupati(exclKey, soloNemici) {
  const sp = SP(); const s = new Set();
  if (!soloNemici) for (const [nm, p] of Object.entries(sp.eroiPos)) { if (`E:${nm}` !== exclKey && p) s.add(nk(p)); }
  sp.nemici.forEach((n, i) => { if (`N:${i}` !== exclKey && n.pos) s.add(nk(n.pos)); });
  if (sp.ruggero.liberato && sp.ruggero.pos && exclKey !== 'R') s.add(nk(sp.ruggero.pos));
  return s;
}

// ---------------------------------------------------------------- ingresso
export async function vistaDigitale(app, partita, vaiA) {
  const [ep, comune, carte] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  ctx = { app, partita, ep, comune, carte, vaiA, layout: null };
  if (!partita.spedizione || !partita.spedizione.digitale) return setup();
  render();
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
    ruggero: { liberato: false, pos: null, tile: 'T6' }, grate: [],
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
      ${sp.ruggero.liberato ? ' <span class="ok-txt">— Ruggero vi segue: riportatelo alla banchina (T1).</span>' : ''}</p>
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
    <div class="pannello"><h2>azioni di ${attivo ? esc(primo(attivo)) : '—'}</h2>${azioniHtml()}</div>
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
  const info = esploraMosse(start, movimento(nm), occupati(`E:${nm}`, true));  // solo nemici/Ruggero murano
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

  const ragg = attivo ? raggEroe(attivo) : {};

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

  // token
  const toks = [];
  const tok = (n, inner, extra) => { const p = scr(n); toks.push(`<div class="tok-slot" style="left:${p.l}px;top:${p.t}px;width:${cell}px;height:${cell}px">${inner}</div>`); };
  for (const [nm, p] of Object.entries(sp.eroiPos)) {
    const e = eroe(nm); const giu = (sp.vite[nm] ?? 0) <= 0;
    tok(p, `<span class="tok-board eroe${nm === attivo ? ' attivo' : ''}${giu ? ' giu' : ''}" data-eroe="${esc(nm)}" title="${esc(nm)}">
      ${e && e.art ? `<img src="${urlArt(e.art)}" alt="" loading="lazy">` : ''}</span>`);
  }
  sp.nemici.forEach((n, i) => {
    if (!n.pos) return; const st = nemStat(n.nome); const boss = st && st.boss ? ' boss' : '';
    tok(n.pos, `<span class="tok-board nemico${boss}" data-nemico="${i}" title="${esc(n.nome)} ${n.ferite}/${n.max}">
      ${st && st.art ? `<img src="${urlArt(st.art)}" alt="" loading="lazy">` : ''}</span>`);
  });
  if (sp.ruggero.liberato && sp.ruggero.pos) {
    tok(sp.ruggero.pos, `<span class="tok-board ruggero" title="Ruggero"><img src="${urlArt('Ruggero.png')}" alt=""></span>`);
  }

  return `<div class="board-digitale" style="width:${cols * cell}px;height:${rows * cell}px;zoom:${SP().zoom || 1}">
    ${tiles}${etichette}${raggHtml}${toks.join('')}</div>`;
}

function logHtml() {
  const sp = SP();
  return `<div class="diario">${sp.log.slice(-6).map((l) => `<p class="nota">${esc(l)}</p>`).join('')}</div>`;
}
function saluteHtml() {
  const sp = SP();
  return P().party.map((nm) => {
    const e = eroe(nm); const max = saluteMax(e); const v = sp.vite[nm] ?? max;
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
  const vivi = P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (sp.eroiAttivo && vivi.includes(sp.eroiAttivo) && !fatti.includes(sp.eroiAttivo)) return sp.eroiAttivo;
  return vivi.find((nm) => !fatti.includes(nm)) || null;
}
function giroEroiHtml() {
  const sp = SP(); const fatti = sp.eroiFatti || []; const attivo = eroiAttivoNome();
  return `<div class="giro-strip">${P().party.map((nm) => {
    const e = eroe(nm); const done = fatti.includes(nm); const giu = (sp.vite[nm] ?? 0) <= 0;
    return `<button class="chip-turno ritratto${nm === attivo ? ' attivo' : ''}${done || giu ? ' fatto' : ''}" data-turno="${esc(nm)}">
      <span class="rit"><img src="${e && e.art ? urlArt(e.art) : ''}" alt=""></span><span class="et">${done ? '✓ ' : ''}${esc(primo(nm))}</span></button>`;
  }).join('')}</div>`;
}

// ------------------------------------------------------------------ azioni
const tipiAzione = { muovere: 'Muovere', attaccare: 'Attaccare', cercare: 'Cercare', interagire: 'Interagire', rianimare: 'Rianimare', abilita: 'Abilità' };
const azioniOf = (nm) => (SP().azioni[nm] || []);
const azioneSpesa = (nm, tipo) => azioniOf(nm).includes(tipo);
// un eroe stordito (insidia/fumi) ha 1 sola azione nel round indicato
const stordito = (nm) => (SP().storditi && SP().storditi[nm] === SP().round);
const azioniMax = (nm) => (stordito(nm) ? 1 : 2);
const azioniRestano = (nm) => azioniOf(nm).length < azioniMax(nm);

function azioniHtml() {
  const sp = SP(); const attivo = eroiAttivoNome();
  if (!attivo) {
    return `<p class="nota">Tutti gli eroi hanno agito. La notte reagisce.</p>
      <div class="btn-riga"><button class="btn pieno" id="fase-minaccia">fase minaccia →</button></div>`;
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
      <div class="btn-riga">
        ${req ? '<button class="btn" id="ins-risolvi">🎲 risolvi la prova</button>' : ''}
        <button class="btn pieno" id="ok-msg">continua</button>
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

// interazione a portata dell'eroe: grata da aprire, o cella di Ruggero (T6)
function interazioneDisponibile(nm) {
  const sp = SP(); const pos = sp.eroiPos[nm]; const tile = tileDi(pos.t);
  // grata: l'eroe e' sulla cella-porta con grata chiusa
  for (const [dir, raw] of Object.entries(tile.exits || {})) {
    if (grataChiusa(pos.t, dir, raw)) { const dc = portaCella(tile, dir); if (dc[0] === pos.x && dc[1] === pos.y) return { tipo: 'grata', dir, label: `Apri la grata → ${dirExit(raw)}` }; }
  }
  // cella di Ruggero in T6
  if (pos.t === 'T6' && !sp.ruggero.liberato) {
    const cella = (tile.arredi || []).find((a) => String(a[2]).toUpperCase() === 'CELLA');
    if (cella && (adiacGlob(pos, { t: 'T6', x: cella[0], y: cella[1] }) || (pos.x === cella[0] && pos.y === cella[1]))) return { tipo: 'cella', label: 'Libera Ruggero (Interagire)' };
  }
  return null;
}

function aggancia() {
  const { app } = ctx; const sp = SP(); const attivo = eroiAttivoNome();
  app.querySelectorAll('.cella-mossa').forEach((c) => c.onclick = () => {
    if (!attivo) return;
    muoviEroe(attivo, { t: c.dataset.t, x: +c.dataset.x, y: +c.dataset.y }, c.dataset.reveal || null);
  });
  app.querySelectorAll('[data-nemico]').forEach((el) => el.onclick = () => { if (attivo) attaccaNemico(attivo, Number(el.dataset.nemico)); });
  app.querySelectorAll('[data-eroe]').forEach((el) => el.onclick = () => {
    const nm = el.dataset.eroe; if ((sp.vite[nm] ?? 0) <= 0) return;
    const i = sp.eroiFatti.indexOf(nm); if (i >= 0) sp.eroiFatti.splice(i, 1);
    sp.eroiAttivo = nm; salvaP(); render();
  });
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
function annunciaTurno() {
  const attivo = eroiAttivoNome();
  if (ctx.ultimoAttivo === (attivo || null)) return;
  ctx.ultimoAttivo = attivo || null;
  if (!attivo || SP().fase !== 'eroi') return;
  document.querySelectorAll('.turno-banner').forEach((n) => n.remove());
  const e = eroe(attivo);
  const el = document.createElement('div'); el.className = 'turno-banner';
  el.innerHTML = `<span class="rit"><img src="${e && e.art ? urlArt(e.art) : ''}" alt=""></span>
    <span class="tb-txt">tocca a<br><b>${esc(primo(attivo))}</b></span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 1300);
}

// centra la finestra sulla CASELLA dell'eroe attivo, con scroll animato: segue
// l'eroe a ogni spostamento e al cambio di eroe. Ricentra solo quando la sua
// posizione cambia (non a ogni render, per non combattere il pan). Senza attivo
// (fase minaccia) mira alla tessera piu' affollata.
function centraSuAttivo() {
  const g = ctx._geo; const wrap = ctx.app.querySelector('#board-wrap'); if (!g || !wrap) return;
  const attivo = eroiAttivoNome(); const z = SP().zoom || 1;
  let key, cx, cy;
  if (attivo) {
    const p = SP().eroiPos[attivo]; const [TX, TY] = layout()[p.t] || [g.minX, g.maxY];
    key = `${attivo}@${nk(p)}`;
    cx = ((TX - g.minX) * 4 + p.x + 0.5) * g.cell * z;
    cy = ((g.maxY - TY) * 4 + (3 - p.y) + 0.5) * g.cell * z;
  } else {
    const t = tileAffollata(); const [TX, TY] = layout()[t] || [g.minX, g.maxY];
    key = `_@${t}`;
    cx = ((TX - g.minX) * 4 + 2) * g.cell * z; cy = ((g.maxY - TY) * 4 + 2) * g.cell * z;
  }
  if (ctx.ultimaCentrata === key) return;
  const left = Math.max(0, cx - wrap.clientWidth / 2), top = Math.max(0, cy - wrap.clientHeight / 2);
  wrap.scrollTo({ left, top, behavior: 'smooth' });
  ctx.ultimaCentrata = key;
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
  sp.azioni[nm].push(tipo);
  if (sp.azioni[nm].length >= azioniMax(nm)) finisciEroe(nm); else { salvaP(); render(); }
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

async function attaccaNemico(nm, i) {
  const sp = SP(); const e = eroe(nm); const n = sp.nemici[i]; if (!n) return;
  if (azioneSpesa(nm, 'attaccare') || !azioniRestano(nm)) return;
  if (!adiacGlob(sp.eroiPos[nm], n.pos)) { flash('Nemico non adiacente: avvicinati prima.'); return; }
  const st = nemStat(n.nome);
  const r = await tiraProva({ titolo: `${primo(nm)} → ${n.nome.toLowerCase()}`, diffLabel: 'Difesa', soglia: st.dif,
    bonus: [{ label: 'VIGORE', val: e.vigore }, { label: 'arma', val: 1 }], modo: 'digitale' });
  if (r == null) return;
  if (r.ok) {
    n.ferite += 1; log(`${primo(nm)} colpisce ${n.nome.toLowerCase()} (${n.ferite}/${n.max}).`);
    if (n.ferite >= n.max) { log(`${n.nome.toLowerCase()} è abbattuto!`); sp.nemici.splice(i, 1); }
  } else log(`${primo(nm)} manca il colpo.`);
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
  if (disp.tipo === 'cella') {
    const e = eroe(nm);
    if ((P().indagine.oggetti || []).some((o) => /chiave della cella/i.test(o))) { liberaRuggero(nm); return; }
    const bonus = [{ label: 'ACUME', val: e.acume }];
    if ((P().indagine.oggetti || []).some((o) => /piede di porco/i.test(o))) bonus.push({ label: 'piede di porco', val: 1 });
    const r = await tiraProva({ titolo: `scassinare la cella — ${primo(nm)}`, diffLabel: 'Difficile', soglia: ctx.comune.regole.diff.Difficile, bonus, modo: 'digitale' });
    if (r == null) return;
    if (r.ok) liberaRuggero(nm); else { log(`${primo(nm)} non riesce ad aprire la cella.`); salvaP(); segnaAzione(nm, 'interagire'); }
  }
}
function liberaRuggero(nm) {
  const sp = SP(); const pos = sp.eroiPos[nm]; const tile = tileDi(pos.t);
  sp.ruggero.liberato = true;
  const occ = new Set(); occupati(null, false).forEach((k) => { const [t, x, y] = k.split(','); if (t === pos.t) occ.add(`${x},${y}`); });
  const cella = celleLibereTile(tile, [pos.x, pos.y], 1, occ)[0] || [pos.x, pos.y];
  sp.ruggero.pos = { t: pos.t, x: cella[0], y: cella[1] };
  log('Ruggero è libero! Riportatelo alla banchina (T1).');
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

// --------------------------------------------------------- spawn nemici
const SPAWN_REGEX = [
  ['IL CUSTODE DELLA CERA', /custode della cera/i],
  ['ADEPTO INCAPPUCCIATO', /(\d+|un|due|tre)?\s*adept/i],
  ['CANE DEI MOLI', /(\d+)?\s*can[ei] dei moli/i],
  ['IL FONDITORE', /(\d+)?\s*fonditor/i],
  ['LO SGHERRO', /(\d+)?\s*sgherr/i],
  ['IL SICARIO', /(\d+)?\s*sicari/i],
];
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
  for (const [nome, re] of SPAWN_REGEX) {
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
function faseNemiciAI() {
  const sp = SP();
  const vivi = () => P().party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  for (let i = 0; i < sp.nemici.length; i++) {
    const n = sp.nemici[i]; const st = nemStat(n.nome); if (!n.pos) continue;
    if (n.flash) { n.flash = false; log(`${n.nome.toLowerCase()} è accecato: salta il turno.`); continue; }  // Flash! di Carla
    const bersagli = vivi(); if (!bersagli.length) break;
    const scelto = bersagli[Math.floor(Math.random() * bersagli.length)];
    // avvicinamento: se non e' gia' a contatto con NESSUN eroe, punta la cella
    // LIBERA adiacente piu' vicina di un eroe qualsiasi (mai sulla sua casella;
    // cosi' non si impila e non resta bloccato se il bersaglio e' circondato).
    if (!bersagli.some((nm) => adiacGlob(n.pos, sp.eroiPos[nm]))) {
      const blocco = occupati(`N:${i}`, false);          // per l'IA tutti murano (come nel simulatore)
      let best = null, bestLen = Infinity;
      for (const nm of bersagli) for (const g of celleAdiacLibere(sp.eroiPos[nm], blocco)) {
        const p = camminoGlob(n.pos, g, blocco);
        if (p.length && p.length < bestLen) { bestLen = p.length; best = p; }
      }
      if (best) n.pos = best[Math.min(st.mov, best.length) - 1];
    }
    const adiacenti = bersagli.filter((nm) => adiacGlob(n.pos, sp.eroiPos[nm]));
    if (!adiacenti.length) continue;
    const vitt = adiacenti.includes(scelto) ? scelto : adiacenti[Math.floor(Math.random() * adiacenti.length)];
    const e = eroe(vitt);
    if (r1() + r1() + st.att >= e.difesa) {
      sp.vite[vitt] = Math.max(0, (sp.vite[vitt] ?? saluteMax(e)) - st.dan);
      log(`${n.nome.toLowerCase()} colpisce ${primo(vitt)} (−${st.dan}).`);
      if (sp.vite[vitt] <= 0) log(`${primo(vitt)} va a terra!`);
    } else log(`${n.nome.toLowerCase()} manca ${primo(vitt)}.`);
  }
  // Ruggero segue il gruppo (si avvicina all'eroe piu' vicino)
  if (sp.ruggero.liberato && sp.ruggero.pos) {
    const vivi2 = vivi(); if (vivi2.length) {
      let mira = null, best = 1e9;
      for (const nm of vivi2) { const path = camminoGlob(sp.ruggero.pos, sp.eroiPos[nm], occupati('R', false)); if (path.length && path.length < best) { best = path.length; mira = path; } }
      if (mira) sp.ruggero.pos = mira[Math.min(3, mira.length) - 1];
      if (sp.ruggero.pos.t === 'T1') { sp.ruggero.tile = 'T1'; sp.esito = 'vittoria'; sp.log.push('Ruggero è alla banchina: siete salvi.'); salvaP(); return epilogo(); }
    }
  }
  const annunci = fineRound(ctx.comune, ctx.ep, sp); annunci.forEach((a) => log(a));
  destaBossSeSoglia().forEach((a) => log(a));       // boss a soglia Canto (tessera piu' lontana)
  sp.fase = 'eroi'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {};
  salvaP();
  if (P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0)) { sp.esito = 'sconfitta'; salvaP(); return epilogo(); }
  render();
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
        ? `Ruggero è al sicuro. ${sp.round} round, canto ${sp.canto}. Leggete l’epilogo nel fascicolo Soluzione.`
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
