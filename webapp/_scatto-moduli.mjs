// Lo scatto della pagina del mazzo, e il conto dei pezzi: cinquanta miniature
// piu' due dungeon: una che non carica e' un riquadro nero fra riquadri neri.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push('errore: ' + e.message));
p.on('response', (r) => { if (r.status() >= 400) guai.push(r.status() + ' ' + r.url().slice(-52)); });
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-moduli.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const conto = await p.evaluate(() => ({
  moduli: document.querySelectorAll('.mod').length,
  senzaSfondo: [...document.querySelectorAll('.mod')].filter((e) => !e.style.backgroundImage).length,
  dungeon: [...document.querySelectorAll('img.dung')].filter((i) => i.naturalWidth > 0).length,
}));
console.log(`moduli in pagina: ${conto.moduli} · senza sfondo: ${conto.senzaSfondo} · dungeon caricati: ${conto.dungeon}/2`);
console.log(guai.length ? guai.slice(0, 5).join(' | ') : 'nessun errore, nessun 404');
await p.screenshot({ path: '../scatti/moduli.png', fullPage: true });
await b.close();
