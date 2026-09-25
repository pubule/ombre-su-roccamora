// webapp/test-scenografia.mjs — ogni scenografia scritta rispetta la guida
// (docs/scenografia.md): la parte che si puo' verificare a macchina. Il resto
// — il mood, il punto focale — si verifica guardando la foto.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { portaCella } from './public/motore/griglia.js';
import { alAperto } from './public/motore/ambiente.js';
const CAT = JSON.parse(readFileSync('webapp/vtt/decori/CATALOGO.json', 'utf8'));
const SUPERFICI = /scrivania|altare|toeletta/i;
const LIBERI_OGNI_EP = /^(ragnatela|candele-nere)/;
let guai = 0; const no = (m) => { guai++; console.error('  ' + m); };
const dir = 'src/scenografia'; const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
for (const f of files) {
  const epId = f.replace('.json', ''); const sc = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  const ep = JSON.parse(readFileSync(`webapp/data/${epId}.json`, 'utf8'));
  const usi = {};
  for (const [id, scena] of Object.entries(sc)) {
    const t = ep.tessere.find((x) => x.id === id); if (!t) { no(`${f}: ${id} non esiste`); continue; }
    if (!scena.perche || scena.perche.length < 40) no(`${f}:${id} manca il perche' (o e' troppo corto)`);
    const arr = {}; for (const [x, y, n] of t.arredi || []) arr[`${x},${3 - y}`] = n;
    const porte = new Set(Object.keys(t.exits || {}).map((d) => { const [x, y] = portaCella(t, d); return `${x},${3 - y}`; }));
    const aperto = alAperto(t) || /giardino|orto|serra|prato|cortile/i.test(t.nome);
    const n = scena.decori.length, luci = scena.decori.filter((d) => d.luce).length;
    // all'aperto anche zero: «quassu' non resta niente che non sia inchiodato» (Ep.11)
    if (aperto ? n > 5 : (n < 5 || n > 12)) no(`${f}:${id} ${n} decori (${aperto ? 'aperto: 0-5' : 'chiuso: 5-12'})`);
    if (luci > 4) no(`${f}:${id} ${luci} luci fra i decori (max 4)`);
    if (scena.decori.filter((d) => d.pezzo === 'sangue' || /sangue/.test(d.pezzo)).length > 1) no(`${f}:${id} piu' di una traccia di sangue`);
    for (const d of scena.decori) {
      if (!CAT[d.pezzo]) no(`${f}:${id} pezzo inesistente "${d.pezzo}"`);
      if (d.x < 0 || d.x > 4 || d.y < 0 || d.y > 4) no(`${f}:${id} ${d.pezzo} fuori stanza (${d.x},${d.y})`);
      const k = `${Math.floor(d.x)},${Math.floor(d.y)}`;
      if (porte.has(k)) no(`${f}:${id} ${d.pezzo} su una porta (${k})`);
      if (arr[k] && !(d.sopra && SUPERFICI.test(arr[k]) && CAT[d.pezzo] && CAT[d.pezzo].sopra)) no(`${f}:${id} ${d.pezzo} sull'arredo ${arr[k]} (${k})`);
      if (!LIBERI_OGNI_EP.test(d.pezzo)) (usi[d.pezzo] = usi[d.pezzo] || new Set()).add(id);
    }
    if (new Set(scena.decori.map((d) => d.rot)).size === 1 && n > 2) no(`${f}:${id} tutte le rotazioni uguali`);
  }
  for (const [pz, stanze] of Object.entries(usi)) if (stanze.size > 3) no(`${f}: "${pz}" in ${stanze.size} stanze (max 3)`);
}
console.log(guai ? `FAIL ${guai}` : `OK ${files.length} scenografie`);
process.exit(guai ? 1 : 0);
