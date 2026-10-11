// LE TESSERE DA STAMPARE, disegnate come la plancia dell'app: stessa
// `stanzaHtml()` (webapp/public/js/plancia/stanza.js), stessi pezzi Forgotten
// Adventures da /assets/vtt/, stesso app.css. Una fonte sola: se la scenografia
// di una stanza cambia, cambiano insieme lo schermo e il cartoncino.
//
// L'arte Midjourney T*-epN NON entra qui: serve alla pagina di descrizione
// della tessera e ai fascicoli.
//
// Sopra la stanza, solo cio' che sul tavolo non disegna nessuno: il reticolo,
// «verso Tn» accanto a ogni porta e «ingresso» sulla prima tessera. Niente
// buio e niente lanterne: la carta e' illuminata dalla lampada di chi gioca.
//
// La stanza si compone a 104 px per casella come in app, e il deviceScaleFactor
// la porta a 616 px (50 mm a 12,32 px/mm): ombre e filtri di app.css scalano
// coi pezzi invece di restare di 3 px su una tessera da 2464.
//
// Uso (serve il server locale, che serve /assets/vtt/ e /data/):
//   node webapp/server.js
//   node scripts/tiles/stampa-fa.mjs ep20 [ep7 ...]   (senza argomenti: ep1..ep20;
//   il Preludio stampa le T1/T2/T4 dell'Ep.1, vedi gen_preludio.py)
// Scrive in <Episodio N>/board/: se esiste gia' «<id> - <nome>.png» lo
// sovrascrive col suo nome (fogli di stampa e Preludio lo cercano cosi').
import { chromium } from 'playwright';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = process.env.OSR_BASE || 'http://localhost:8017';
const CELL = 104, PX_CASELLA = 616;

const sets = process.argv.slice(2).filter((a) => /^(ep\d{1,2}|preludio)$/.test(a));
const tutti = [...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)];

// la pagina vive sull'origine del server: i moduli e i pezzi si caricano da li'
const PAGINA = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/app.css">
<style>
  html,body{margin:0;background:#0c0e11}
  .tessera-stampa{position:relative;width:${4 * CELL}px;height:${4 * CELL}px;overflow:hidden}
  .tessera-stampa .stanza-fa{left:0;top:0;width:100%;height:100%}
  .reticolo{position:absolute;inset:0;pointer-events:none;
    background-image:repeating-linear-gradient(0deg,rgba(24,20,16,.55) 0 1px,transparent 1px ${CELL}px),
      repeating-linear-gradient(90deg,rgba(24,20,16,.55) 0 1px,transparent 1px ${CELL}px)}
  .etichetta{position:absolute;transform:translate(-50%,-50%);font:600 7px/1.1 'IM Fell English SC',serif;
    letter-spacing:.06em;color:#f3e3bd;background:rgba(12,14,17,.78);padding:1px 3px;border-radius:2px;
    white-space:nowrap;text-transform:uppercase}
  .etichetta.ingresso{color:#9fe0d6}
</style></head><body><div class="tessera-stampa" id="t"></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 4 * CELL, height: 4 * CELL },
                                     deviceScaleFactor: PX_CASELLA / CELL });
const errori = [];
page.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/assets/vtt/')) errori.push(`${r.status()} ${r.url()}`); });
page.on('pageerror', (e) => errori.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/app.css`);
await page.setContent(PAGINA, { waitUntil: 'networkidle' });

for (const set of sets.length ? sets : tutti) {
  const dir = path.join(ROOT, set === 'preludio' ? 'Preludio' : `Episodio ${set.slice(2)}`, 'board');
  mkdirSync(dir, { recursive: true });
  const ep = await page.evaluate((s) => fetch(`/data/${s}.json`).then((r) => r.json()), set);
  const esistenti = readdirSync(dir);
  for (const [i, tile] of (ep.tessere || []).entries()) {
    await page.evaluate(async ({ ep, tile, CELL, primo }) => {
      const { stanzaHtml } = await import('/js/plancia/stanza.js');
      const { portaCella, dirExit } = await import('/motore/griglia.js');
      const { html } = stanzaHtml(ep, tile, { cell: CELL, rivelata: () => false });
      // «verso Tn» un passo dentro la porta, sul lato da cui si esce
      const dentro = { N: [0, .3], S: [0, -.3], E: [-.3, 0], O: [.3, 0] };
      const lab = Object.entries(tile.exits || {}).map(([dir, raw]) => {
        const [x, y] = portaCella(tile, dir);
        const cx = { E: 4, O: 0 }[dir] ?? x + .5, cy = { N: 0, S: 4 }[dir] ?? 3 - y + .5;
        const [dx, dy] = dentro[dir];
        return `<div class="etichetta" style="left:${(cx + dx) * CELL}px;top:${(cy + dy) * CELL}px">verso ${dirExit(raw)}</div>`;
      }).join('') + (primo ? `<div class="etichetta ingresso" style="left:${2 * CELL}px;top:${3.85 * CELL}px">ingresso</div>` : '');
      document.getElementById('t').innerHTML =
        `<div class="stanza-fa" data-t="${tile.id}" style="--cell:${CELL}px">${html}</div><div class="reticolo"></div>${lab}`;
      await Promise.all([...document.querySelectorAll('.tessera-stampa [style*="background-image"]')].map((el) => {
        const u = /url\(['"]?([^'")]+)/.exec(el.style.backgroundImage)?.[1];
        return u ? new Promise((ok) => { const im = new Image(); im.onload = im.onerror = ok; im.src = u; }) : null;
      }));
      await document.fonts.ready;
    }, { ep, tile, CELL, primo: i === 0 });
    await page.waitForTimeout(100);
    const nome = esistenti.find((f) => f.startsWith(`${tile.id} - `)) || `${tile.id} - ${tile.nome}.png`;
    await page.locator('#t').screenshot({ path: path.join(dir, nome) });
    console.log('ok ->', path.join(dir, nome));
  }
}
await browser.close();
if (errori.length) { console.error(`${errori.length} ERRORI:\n  ${errori.join('\n  ')}`); process.exit(1); }
