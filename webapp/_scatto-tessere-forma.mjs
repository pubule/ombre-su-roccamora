// Lo scatto della pagina, e il conto delle caselle disegnate: una plancia in CSS
// puo' uscire con le tessere sovrapposte senza che nessun test se ne accorga,
// ma se una plancia esce VUOTA lo si vede solo contando.
import { chromium } from 'playwright';
const b = await chromium.launch();
const larga = Number(process.argv[2] || 900);
const p = await b.newPage({ viewport: { width: larga, height: 1200 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push('errore: ' + e.message));
p.on('response', (r) => { if (r.status() >= 400) guai.push(r.status() + ' ' + r.url().slice(-52)); });
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-tessere-forma.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
const conto = await p.$$eval('.plancia', (ps) => ps.map((n) => ({
  id: n.id, tessere: n.querySelectorAll('.tessera').length, caselle: n.querySelectorAll('.cel').length,
})));
console.log(conto.map((c) => `${c.id}: ${c.tessere} tessere · ${c.caselle} caselle`).join('\n'));
console.log(guai.length ? guai.slice(0, 6).join(' | ') : 'nessun errore, nessun 404');
await p.screenshot({ path: `../scatti/tessere-forma-${larga}.png`, fullPage: true });
await b.close();
