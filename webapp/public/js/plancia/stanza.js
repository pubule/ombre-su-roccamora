// LA STANZA COMPOSTA: pavimento, arredi, muri, porte, decori, torce. Coordinate
// locali alla tessera (0..4 caselle, riga 0 in alto); chi chiama mette l'HTML
// dentro un riquadro 4x4 gia' posizionato sulla plancia.
import { pavimentoDi, alAperto } from '../../motore/ambiente.js';
import { portaCella, dirExit } from '../../motore/griglia.js';
import { arredoDelPosto, decoriDi, torceDi } from './ambiente-fa.js';
export { decoriDi } from './ambiente-fa.js';

const V = (p) => `/assets/vtt/${p}.png`;
const ROT = { S: 0, N: 180, O: 90, E: -90 };

export function stanzaHtml(ep, tile, { cell, rivelata }) {
  const px = (v) => +(v * cell).toFixed(1); let h = ''; const luci = [];
  const vuoto = alAperto(tile);          // NON fuoriDi()==='vuoto': vedi Review Focus 3
  h += `<div class="pav-fa" style="width:${px(4)}px;height:${px(4)}px;background-image:url('${V('pavimenti/' + pavimentoDi(tile))}')"></div>`;

  // arredi: coppia ORIZZONTALE fusa, scalinata 2x2 solo su un quadrato vero
  const arr = {}; for (const [x, y, n] of tile.arredi || []) arr[`${x},${3 - y}`] = n;
  const fatti = new Set();
  const scale = Object.keys(arr).filter((k) => /scala/i.test(arr[k])).map((k) => k.split(',').map(Number));
  const q = scale.length === 4 && (() => { const c0 = Math.min(...scale.map((s) => s[0])), r0 = Math.min(...scale.map((s) => s[1]));
    return scale.every(([c, r]) => c - c0 <= 1 && r - r0 <= 1) ? [c0, r0] : null; })();
  if (q) {
    scale.forEach(([c, r]) => fatti.add(`${c},${r}`));
    h += `<div class="pezzo-fa ombra" style="left:${px(q[0])}px;top:${px(q[1])}px;width:${px(2)}px;height:${px(2)}px;background-image:url('${V('muri/scale')}')"></div>`;
  }
  for (const [k, nome] of Object.entries(arr)) {
    if (fatti.has(k)) continue;
    const [c, r] = k.split(',').map(Number);
    const largo = arr[`${c + 1},${r}`] === nome && !fatti.has(`${c + 1},${r}`);
    fatti.add(k); if (largo) fatti.add(`${c + 1},${r}`);
    // l'arredo del posto (docs/scenografia.md): sui tetti le «casse» sono
    // comignoli, nella loggia campane; la scenografia puo' forzarlo per casella
    const forzato = tile.scena && tile.scena.arredi && tile.scena.arredi[k];
    const chiave = forzato || arredoDelPosto(tile, nome); if (!chiave) continue;
    const v = (c * 7 + r * 13) % 3;
    const fuoco = /candele|crogiolo|stufa/.test(chiave);
    if (fuoco) luci.push({ x: c + (largo ? 1 : .5), y: r + .5, tipo: 'candela' });
    const src = chiave.startsWith('arredi/') ? chiave + (v ? '-' + (v + 1) : '') : chiave.includes('/') ? chiave : 'decori/' + chiave;
    h += `<div class="pezzo-fa ${fuoco ? 'fiamma' : 'ombra'}" style="left:${px(c + .06)}px;top:${px(r + .06)}px;width:${px((largo ? 2 : 1) - .12)}px;height:${px(.88)}px;background-image:url('${V(src)}')"></div>`;
  }

  // decori (e le loro luci)
  for (const d of decoriDi(ep, tile)) {
    if (d.luce) luci.push({ x: d.x, y: d.y, tipo: d.luce });
    h += `<div class="pezzo-fa ${d.luce ? 'fiamma' : 'decoro'}" style="left:${px(d.x - d.lato / 2)}px;top:${px(d.y - d.lato / 2)}px;width:${px(d.lato)}px;height:${px(d.lato)}px;transform:rotate(${d.rot}deg);background-image:url('${V('decori/' + d.pezzo)}')"></div>`;
  }

  // muri e porte: la porta sta dove la mette portaCella (NON sempre a indice 1)
  const porte = {};
  for (const [dir, raw] of Object.entries(tile.exits || {})) porte[`${dir}:${portaCella(tile, dir).join(',')}`] = { dir, verso: dirExit(raw), grata: /grata/i.test(raw) };
  const torce = new Set(torceDi(ep, tile).map(([l, i]) => `${l}${i}`));
  for (const lato of ['N', 'S', 'E', 'O']) for (let i = 0; i < 4; i++) {
    const g = { N: [i, 3], S: [i, 0], E: [3, 3 - i], O: [0, 3 - i] }[lato];     // coordinate di gioco (y in su)
    const [cx, cy] = { N: [i + .5, 0], S: [i + .5, 4], E: [4, i + .5], O: [0, i + .5] }[lato];   // bordo, schermo
    const p = porte[`${lato}:${g.join(',')}`];
    if (vuoto) continue;                                   // sui tetti niente muri e niente porte
    if (p) {
      // la porta verso una stanza gia' aperta e' il passaggio libero: il
      // battente si disegna solo chiuso, verso il buio. Ruotato «aperto»
      // attraversava la stanza come un'asse (prova del 25/09).
      if (!rivelata(p.verso))
        h += `<div class="pezzo-fa porta-fa" data-porta="${lato}:${g.join(',')}" style="left:${px(cx - .5)}px;top:${px(cy - .5)}px;width:${px(1)}px;height:${px(1)}px;transform:rotate(${ROT[lato]}deg) scale(1.45);background-image:url('${V(p.grata ? 'porte/grata' : 'porte/porta')}')"></div>`;
      continue;
    }
    h += `<div class="pezzo-fa" data-muro="${lato}${i}" style="left:${px(cx - .5)}px;top:${px(cy - 1)}px;width:${px(1)}px;height:${px(2)}px;transform:rotate(${ROT[lato]}deg);background-image:url('${V(i % 2 ? 'muri/muro-b' : 'muri/muro-a')}')"></div>`;
    if (torce.has(`${lato}${i}`)) {
      const [tx, ty] = { N: [cx, .22], S: [cx, 3.78], E: [3.78, cy], O: [.22, cy] }[lato];
      luci.push({ x: tx, y: ty, tipo: 'torcia' });
      h += `<div class="pezzo-fa fiamma" style="left:${px(tx - .4)}px;top:${px(ty - .4)}px;width:${px(.8)}px;height:${px(.8)}px;transform:rotate(${ROT[lato] + 180}deg);background-image:url('${V('decori/torcia')}')"></div>`;
    }
  }
  if (!vuoto) for (const [ax, ay] of [[0, 0], [4, 0], [0, 4], [4, 4]])
    h += `<div class="pezzo-fa" style="left:${px(ax - .32)}px;top:${px(ay - .32)}px;width:${px(.64)}px;height:${px(.64)}px;background-image:url('${V('muri/pilastro')}')"></div>`;
  return { html: h, luci };
}
