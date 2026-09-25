// I TESTI DELL'APP, non delle carte.
//
// `test-testi.mjs` guarda i dati (webapp/data): le carte, gli epiloghi, i Bivi.
// Le frasi scritte direttamente nel codice — schermate, messaggi del motore,
// doni, Migliorie — non passavano da nessuna sonda, e le stesse famiglie
// chiuse sui dati l'11/08 ci sono ricomparse (AUDIT-TESTI-APP.md, 24/09/2026).
//
// Si leggono SOLO le stringhe: i commenti e il codice dentro `${…}` restano
// fuori, perche' i commenti del repo scrivono apposta «e'» e «gia'» e non li
// vede nessun giocatore.
//
// node webapp/test-testi-app.mjs [cartella]   (default: webapp/public)
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const radice = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), 'public');
const file = ['js', 'motore'].flatMap((d) =>
  readdirSync(join(radice, d)).filter((f) => f.endsWith('.js')).map((f) => join(d, f)));

// Tokenizzatore minimo: codice, stringhe '…' "…", template `…${codice}…`,
// commenti, regex. Restituisce i pezzi di TESTO con la riga d'inizio.
function testi(src) {
  const out = [];
  let i = 0, riga = 1;
  const n = src.length;
  const avanza = () => { if (src[i] === '\n') riga++; i++; };
  const prevSignif = () => {
    for (let k = i - 1; k >= 0; k--) if (!/\s/.test(src[k])) return src[k];
    return '';
  };
  function codice(chiudi) {           // chiudi: '}' dentro ${…}, null a livello file
    let prof = 0;
    while (i < n) {
      const c = src[i], d = src[i + 1];
      if (chiudi && c === '}' && prof === 0) { i++; return; }
      if (c === '{') prof++;
      else if (c === '}') prof--;
      if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) avanza(); i += 2; continue; }
      if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]|^$/.test(prevSignif())) {   // regex
        i++; let classe = false;
        while (i < n) {
          const e = src[i];
          if (e === '\\') { i += 2; continue; }
          if (e === '[') classe = true; else if (e === ']') classe = false;
          else if (e === '/' && !classe) { i++; break; }
          else if (e === '\n') break;
          i++;
        }
        continue;
      }
      if (c === "'" || c === '"') { stringa(c); continue; }
      if (c === '`') { template(); continue; }
      avanza();
    }
  }
  function stringa(q) {
    const r0 = riga; let t = ''; i++;
    while (i < n && src[i] !== q) {
      if (src[i] === '\\') { t += src[i + 1] === "'" ? "'" : src[i + 1] === '"' ? '"' : ' '; i += 2; continue; }
      t += src[i]; avanza();
    }
    i++; out.push({ riga: r0, t });
  }
  function template() {
    let r0 = riga, t = ''; i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { t += src[i + 1] === "'" ? "'" : ' '; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        out.push({ riga: r0, t }); t = ' '; i += 2; codice('}'); r0 = riga; continue;
      }
      t += src[i]; avanza();
    }
    i++; out.push({ riga: r0, t });
  }
  codice(null);
  return out;
}

const SONDE = [
  ['accento scritto con l’apostrofo (è, già, più…)',
    /(^|[\s(«“>])(e|gia|piu|perche|puo|cosi|pero|finche|verra|sara|potra)'(?=[\s.,;:!?)»”<]|$)/i],
  ['«PNG» nel testo dei giocatori', /\bPNG\b/],
  ['apostrofo dritto fra due lettere (serve ’)', /[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]/],
];

let scattate = 0, esaminati = 0;
const trovati = SONDE.map(() => []);
for (const f of file) {
  for (const { riga, t: testo } of testi(readFileSync(join(radice, f), 'utf8'))) {
    const t = testo.replace(/<!--[\s\S]*?(-->|$)/g, ' ');           // i commenti HTML non si vedono
    if (!/[a-zà-ù]{2,}\s+[a-zà-ù]{2,}/i.test(t)) continue;       // solo prosa, non chiavi o selettori
    esaminati++;
    SONDE.forEach(([, re], k) => { if (re.test(t)) trovati[k].push(`${f}:${riga}: «${t.replace(/\s+/g, ' ').trim().slice(0, 90)}»`); });
  }
}
console.log(`testi esaminati: ${esaminati}\n`);
SONDE.forEach(([nome], k) => {
  if (!trovati[k].length) { console.log(`  ok ${nome}`); return; }
  scattate++;
  console.log(`  KO ${nome} — ${trovati[k].length}:`);
  trovati[k].slice(0, 8).forEach((x) => console.log(`      ${x}`));
});
if (scattate) { console.log(`\n${scattate} SONDE SCATTATE`); process.exit(1); }
console.log('\ntest-testi-app: i testi dell’app sono puliti');
