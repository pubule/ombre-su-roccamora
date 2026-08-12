// LA GEOMETRIA DELLA SPEDIZIONE: dove si puo' andare, cosa e' adiacente a cosa,
// quale casella e' occupata. Estratta da digitale.js, dove stava insieme alla
// vista e leggeva un `ctx` globale di modulo.
//
// Qui il contesto e' esplicito e si chiama `g`:
//   { ep, sp, partita, _layout }
// dove `ep` sono i dati dell'episodio, `sp` lo stato di spedizione, `partita`
// la partita intera (serve solo per il party), e `_layout` la memoizzazione
// della disposizione delle tessere. Nient'altro: se una funzione di qui avesse
// bisogno di `app` o delle carte, sarebbe nel posto sbagliato.
//
// Le tessere sono griglie 4x4 disposte in tavola secondo il grafo delle uscite;
// ogni pedina ha una posizione globale { t: tessera, x, y } e cammina a caselle
// attraversando le porte. Niente «avanzata di gruppo».

// ---------------------------------------------------------- primitive 4x4
export const dentro = ([x, y]) => x >= 0 && x < 4 && y >= 0 && y < 4;
export const chiave = ([x, y]) => `${x},${y}`;
export const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
export const dirExit = (raw) => (raw.match(/^\S+/) || [''])[0];   // "T5 (grata...)" -> "T5"
export const OPP = { N: 'S', S: 'N', E: 'O', O: 'E' };
export const DELTA = { N: [0, 1], S: [0, -1], E: [1, 0], O: [-1, 0] };

export function arrediSet(g, tile) {
  const s = new Set((tile.arredi || []).map(([gx, gy]) => chiave([gx, gy])));
  // l'arredo sotto cui si e' trovata l'uscita segreta viene spostato: la sua
  // casella diventa percorribile ed e' li' che il PNG scortato esce
  const u = g && g.sp && g.sp.uscita;
  if (u && u.aperta && u.tile === tile.id) s.delete(chiave(u.cella));
  return s;
}

export function vicini([x, y]) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(dentro);
}

// cella-porta di una direzione, replica pickDoorIndex di generate-tiles.js
export function portaCella(tile, dir) {
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

export function dirVerso(tile, versoId) {
  for (const [dir, raw] of Object.entries(tile.exits || {})) if (dirExit(raw) === versoId) return dir;
  return null;
}

export const tileDi = (g, id) => g.ep.tessere.find((t) => t.id === id);

// ------------------------------------------------- grafo globale (multi-tile)
// nodo = { t: tileId, x, y }. Disposizione tessere 2D dal grafo delle uscite.
export const nk = (n) => `${n.t},${n.x},${n.y}`;

export function layout(g) {
  if (g._layout) return g._layout;
  const pos = {}; const t0 = g.ep.tessere[0].id; pos[t0] = [0, 0];
  const coda = [t0];
  while (coda.length) {
    const id = coda.shift(); const tile = tileDi(g, id);
    for (const [dir, raw] of Object.entries(tile.exits || {})) {
      const dest = dirExit(raw); if (pos[dest]) continue;
      const [dx, dy] = DELTA[dir];
      pos[dest] = [pos[id][0] + dx, pos[id][1] + dy]; coda.push(dest);
    }
  }
  g._layout = pos; return pos;
}

// una grata chiusa blocca la porta
export const grataChiusa = (g, tileId, dir, raw) =>
  /grata/i.test(raw) && !g.sp.grate.includes(`${tileId}-${dir}`);

// vicini globali di un nodo: 4 caselle interne + attraversamenti di porta.
// allowReveal: le porte verso tessere coperte diventano bersagli "reveal".
export function viciniGlob(g, n, allowReveal) {
  const tile = tileDi(g, n.t); const out = [];
  for (const [nx, ny] of vicini([n.x, n.y])) {
    if (arrediSet(g, tile).has(chiave([nx, ny]))) continue;
    out.push({ node: { t: n.t, x: nx, y: ny } });
  }
  for (const [dir, raw] of Object.entries(tile.exits || {})) {
    const dc = portaCella(tile, dir);
    if (dc[0] !== n.x || dc[1] !== n.y) continue;
    if (grataChiusa(g, n.t, dir, raw)) continue;
    const destId = dirExit(raw); const destTile = tileDi(g, destId); if (!destTile) continue;
    const back = dirVerso(destTile, n.t) || OPP[dir];
    const entry = portaCella(destTile, back);
    const rivelata = g.sp.rivelate.includes(destId);
    if (rivelata) out.push({ node: { t: destId, x: entry[0], y: entry[1] } });
    else if (allowReveal) out.push({ node: { t: destId, x: entry[0], y: entry[1] }, reveal: destId });
  }
  return out;
}

// BFS a budget: mappa nodeKey -> { node, dist, reveal, prev }. `blocco` = celle
// muro (nemici/PNG scortati); gli alleati NON bloccano il passaggio ma si passano i
// loro nodi (l'arrivo libero si filtra dopo). I bersagli reveal sono terminali.
export function esploraMosse(g, start, budget, blocco) {
  const info = { [nk(start)]: { node: start, dist: 0 } }; let q = [start];
  while (q.length) {
    const nx = [];
    for (const n of q) {
      const d = info[nk(n)].dist; if (d >= budget) continue;
      for (const nb of viciniGlob(g, n, true)) {
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
export function camminoGlob(g, start, goal, blocco) {
  const gk = nk(goal);
  const prev = { [nk(start)]: null }; let q = [start];
  while (q.length) {
    const nx = [];
    for (const n of q) {
      for (const nb of viciniGlob(g, n, false)) {
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
export function celleAdiacLibere(g, node, blocco) {
  return viciniGlob(g, node, false).map((v) => v.node)
    .filter((nd) => !blocco.has(nk(nd)) && !arrediSet(g, tileDi(g, nd.t)).has(chiave([nd.x, nd.y])));
}

// adiacenza globale (mischia): stessa tessera Manhattan==1, o attraverso una porta aperta
export function adiacGlob(g, a, b) {
  if (a.t === b.t) return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  const ta = tileDi(g, a.t);
  for (const [dir, raw] of Object.entries(ta.exits || {})) {
    if (dirExit(raw) !== b.t || grataChiusa(g, a.t, dir, raw)) continue;
    const dc = portaCella(ta, dir); if (dc[0] !== a.x || dc[1] !== a.y) continue;
    const tb = tileDi(g, b.t); const back = dirVerso(tb, a.t) || OPP[dir];
    const entry = portaCella(tb, back);
    if (entry[0] === b.x && entry[1] === b.y) return true;
  }
  return false;
}

// n celle libere piu' vicine a start dentro una singola tessera (spawn/ingresso)
export function celleLibereTile(g, tile, start, n, occ) {
  const muro = arrediSet(g, tile); const out = []; const visti = new Set(); let coda = [start];
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

// nodi occupati (eroi + nemici + PNG scortati), tranne exclKey. `soloNemici`:
// escludi gli eroi (cammino eroi: gli alleati si attraversano). `senzaScortati`:
// escludi i PNG scortati — nei set di CAMMINO (eroi e nemici li attraversano: si
// passa attraverso, non ci si ferma sopra → l'arrivo usa senzaScortati=false).
export function occupati(g, exclKey, soloNemici, senzaScortati) {
  const sp = g.sp; const s = new Set();
  if (!soloNemici) for (const [nm, p] of Object.entries(sp.eroiPos)) { if (`E:${nm}` !== exclKey && p) s.add(nk(p)); }
  sp.nemici.forEach((n, i) => { if (`N:${i}` !== exclKey && n.pos) s.add(nk(n.pos)); });
  if (!senzaScortati) (sp.scortati || []).forEach((gg, i) => { if (gg.liberato && gg.pos && exclKey !== `S:${i}`) s.add(nk(gg.pos)); });
  return s;
}

// distanza (in caselle-cammino) tra due nodi, ignorando i blocchi (per gittate/raggi)
export function distGlob(g, a, b) { return camminoGlob(g, a, b, new Set()).length; }
