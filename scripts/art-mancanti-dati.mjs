#!/usr/bin/env node
// LE ARTWORK MANCANTI VISTE DAI DATI, non dai prompt. `midjourney-artwork.mjs` elenca cosa manca fra
// i prompt scritti nei PROMPT-MIDJOURNEY*.md: se un'artwork serve al gioco ma nessun prompt la
// descrive (un oggetto nascosto in una tessera, una carta nuova), quello strumento non la vede mai.
// Questo guarda dall'altra parte: ogni `art`/`arte` dei dati della webapp (webapp/data/*.json) e ogni
// oggetto di tessera (`ep.oggetti`), e dice cosa non ha il PNG in artworks/, la carta, o un prompt.
//
//   node webapp/export-data.js ; python webapp/export-data.py     # dati aggiornati
//   node scripts/art-mancanti-dati.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATI = path.join(RADICE, 'webapp', 'data');
const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const png = new Set(readdirSync(path.join(RADICE, 'artworks')).map((f) => norm(f.replace(/\.png$/i, ''))));
const ha = (rel) => existsSync(path.join(RADICE, rel)) || png.has(norm(path.basename(rel).replace(/\.png$/i, '')));
const leggi = (f) => JSON.parse(readFileSync(path.join(DATI, f), 'utf8'));

// 1. ogni `art`/`arte` referenziato dai dati
const mancanti = new Map();
const cerca = (o, src) => {
  if (Array.isArray(o)) return o.forEach((x) => cerca(x, src));
  if (!o || typeof o !== 'object') return;
  for (const [k, v] of Object.entries(o)) {
    if ((k === 'art' || k === 'arte') && typeof v === 'string' && /\.(png|jpe?g|webp)$/i.test(v)) {
      if (!ha(v.startsWith('artworks/') ? v : `artworks/${v}`) && !ha(v)) {
        if (!mancanti.has(v)) mancanti.set(v, new Set());
        mancanti.get(v).add(`${src} · ${o.nome || o.title || o.id || ''}`);
      }
    } else cerca(v, src);
  }
};
for (const f of readdirSync(DATI).filter((x) => x.endsWith('.json'))) cerca(leggi(f), f);

// 2. gli oggetti nascosti nelle tessere: devono avere la carta e il prompt
const carte = leggi('carte.json').oggetti_carte;
const senzaCarta = [];
for (let n = 2; n <= 20; n++) {
  const f = `ep${n}.json`; if (!existsSync(path.join(DATI, f))) continue;
  const md = path.join(RADICE, `Episodio ${n}`, `PROMPT-MIDJOURNEY-Episodio-${n}.md`);
  const testo = existsSync(md) ? readFileSync(md, 'utf8').toLowerCase() : '';
  for (const o of leggi(f).oggetti || []) {
    const carta = [...(carte[`ep${n}`] || []), ...(carte.preludio || [])].find((c) => norm(c.title) === norm(o.nome));
    if (!carta) senzaCarta.push(`ep${n} ${o.ref} · ${o.nome}${testo.includes(o.nome.toLowerCase()) ? '' : '  (nemmeno un prompt)'}`);
  }
}

console.log(`Art referenziate dai dati e senza PNG in artworks/: ${mancanti.size}`);
for (const [k, v] of mancanti) console.log(`  ${k}  <-  ${[...v].slice(0, 2).join(' ; ')}`);
console.log(`\nOggetti di tessera (Ep.2-20) senza carta: ${senzaCarta.length}`);
for (const s of senzaCarta) console.log(`  ${s}`);
process.exit(mancanti.size || senzaCarta.length ? 1 : 0);
