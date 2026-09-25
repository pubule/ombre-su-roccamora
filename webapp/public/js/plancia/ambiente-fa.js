// COSA RACCONTA UNA STANZA, per famiglia di pavimento. I pezzi sono quelli di
// webapp/vtt/decori (scripts/importa-fa-lanterne.py). Non si decorano 127
// stanze a mano: la famiglia sceglie COSA, il nome della tessera sceglie DOVE
// (un generatore con seme), cosi' la stessa stanza e' sempre uguale.
import { pavimentoDi, fuoriDi } from '../../motore/ambiente.js';
import { portaCella } from '../../motore/griglia.js';

const FAMIGLIE = {
  assi:      { pezzi: ['corda', 'barile', 'pozza', 'ragnatela'], torce: 2 },
  tavolato:  { pezzi: ['sacco', 'barile', 'corda', 'ragnatela'], torce: 1 },
  pietra:    { pezzi: ['ossa', 'catene', 'sangue', 'ragnatela', 'teschio'], torce: 0, candele: 2 },
  navata:    { pezzi: ['ragnatela', 'teschio'], torce: 0, candele: 3 },
  roccia:    { pezzi: ['pozza', 'ossa', 'ragnatela'], torce: 1 },
  melma:     { pezzi: ['pozza', 'ossa', 'sangue'], torce: 1 },
  mattoni:   { pezzi: ['barile', 'catene', 'sacco'], torce: 2 },
  metallo:   { pezzi: ['barile', 'catene', 'corda'], torce: 2 },
  paglia:    { pezzi: ['sacco', 'corda', 'barile'], torce: 1 },
  mattonelle:{ pezzi: ['ragnatela', 'sacco', 'teschio'], torce: 1 },
  tappeto:   { pezzi: ['ragnatela', 'teschio'], torce: 1, candele: 1 },
  mosaico:   { pezzi: ['ragnatela', 'sacco'], torce: 2 },
  // fuori: niente muri su cui appendere una torcia, poco da posare
  lastricato:{ pezzi: ['pozza', 'sacco', 'barile'], torce: 0 },
  terra:     { pezzi: ['pozza', 'sacco'], torce: 0 },
  ghiaia:    { pezzi: ['barile', 'sacco', 'pozza'], torce: 0 },
  erba:      { pezzi: ['pozza'], torce: 0 },
  tetti:     { pezzi: [], torce: 0 },
  lamiera:   { pezzi: ['barile', 'corda'], torce: 1 },
  acqua:     { pezzi: ['corda'], torce: 0 },
};
export const ARREDI_FA = ['casse', 'molo', 'candele', 'scrivania', 'branda', 'scala', 'altare', 'cella',
  'armadio', 'toeletta', 'scorie', 'forma', 'crogiolo', 'stufa'];
export const arredoFa = (nome) => ARREDI_FA.find((k) => new RegExp(k, 'i').test(nome)) || null;

// L'ARREDO DEL POSTO (docs/scenografia.md): i dati chiamano «casse» anche gli
// ostacoli di un tetto. Il gioco non cambia; il pezzo lo sceglie il posto.
// Restituisce un percorso relativo a /assets/vtt/ senza estensione.
export function arredoDelPosto(tile, nome) {
  if (/campan/i.test(tile.nome)) return /altare/i.test(nome) ? 'decori/campana-grande-2' : 'decori/campana-grande';
  if (/guglia/i.test(tile.nome)) return 'decori/statua-morte';
  if (/ESPOSTA/.test(tile.testo || '')) return /altare/i.test(nome) ? 'decori/statua-incappucciata' : 'decori/comignolo';
  const k = arredoFa(nome); return k ? 'arredi/' + k : null;
}

// un seme dalla tessera: mulberry32 su un hash del nome dell'episodio + id
function caso(seme) {
  let h = 2166136261; for (const c of seme) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h |= 0; h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// caselle libere, in coordinate SCHERMO (riga 0 in alto): niente arredi, niente porte
function libere(tile) {
  const occ = new Set((tile.arredi || []).map(([x, y]) => `${x},${3 - y}`));
  for (const dir of Object.keys(tile.exits || {})) { const [x, y] = portaCella(tile, dir); occ.add(`${x},${3 - y}`); }
  const out = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!occ.has(`${c},${r}`)) out.push([c, r]);
  return out;
}

export function decoriDi(ep, tile) {
  // LA SCENOGRAFIA SCRITTA VINCE: e' stata composta leggendo il testo della
  // stanza (docs/scenografia.md). La regola qui sotto e' solo il ripiego per
  // una stanza che nessuno ha ancora messo in scena.
  if (tile.scena && tile.scena.decori) return tile.scena.decori;
  const fam = FAMIGLIE[pavimentoDi(tile)] || FAMIGLIE.mattonelle;
  const rnd = caso(`${ep.id || ep.titolo || ''}:${tile.id}`);
  // prima i bordi (e' li' che la roba si accumula), poi il centro
  const celle = libere(tile).sort((a, b) => {
    const bordo = ([c, r]) => (c === 0 || c === 3 || r === 0 || r === 3 ? 0 : 1);
    return bordo(a) - bordo(b) || rnd() - .5;
  });
  const out = []; let i = 0;
  const posa = (pezzo, luce, lato) => {
    const cella = celle[i++]; if (!cella) return;
    const [c, r] = cella;
    out.push({ pezzo, luce, lato, rot: Math.round(rnd() * 360),
      x: c + .5 + (rnd() - .5) * .3, y: r + .5 + (rnd() - .5) * .3 });
  };
  const n = Math.min(fam.pezzi.length, 2 + Math.floor(rnd() * 2));
  for (let k = 0; k < n; k++) posa(fam.pezzi[(k + Math.floor(rnd() * 10)) % fam.pezzi.length], null, .7);
  for (let k = 0; k < (fam.candele || 0); k++) posa(['candele-nere', 'candele-nere-2', 'candele-nere-3'][k % 3], 'cera', .75);
  return out;
}

// le torce stanno SUL muro: [lato, indice del tratto] di tratti senza porta
export function torceDi(ep, tile) {
  if (tile.scena) return [];            // nella scena scritta le torce sono decori con luce: 'torcia'
  const fam = FAMIGLIE[pavimentoDi(tile)] || FAMIGLIE.mattonelle;
  if (!fam.torce || fuoriDi(tile) === 'vuoto') return [];
  const rnd = caso(`torce:${ep.id || ''}:${tile.id}`);
  const porte = new Set(Object.keys(tile.exits || {}).map((d) => `${d}:${portaCella(tile, d).join(',')}`));
  const tratti = [];
  for (const lato of ['N', 'S', 'E', 'O']) for (let i = 0; i < 4; i++) {
    const g = { N: [i, 3], S: [i, 0], E: [3, 3 - i], O: [0, 3 - i] }[lato];
    if (!porte.has(`${lato}:${g.join(',')}`)) tratti.push([lato, i]);
  }
  return tratti.sort(() => rnd() - .5).slice(0, fam.torce);
}
