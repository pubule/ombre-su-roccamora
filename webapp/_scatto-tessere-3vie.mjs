// Lo scatto della pagina di revisione, e il controllo che NESSUNA immagine manchi:
// in una griglia di 45 tessere un <img> rotto non si nota a occhio.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push('errore: ' + e.message));
p.on('response', (r) => { if (r.status() >= 400) guai.push(r.status() + ' ' + r.url().slice(-52)); });
await p.goto('http://127.0.0.1:8019/mockups/stile2/nebbia2-tessere-3vie.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
// i fondi sono in CSS, non <img>: la rete e' l'unico modo per accorgersene
const sfondi = await p.$$eval('.tess', (n) => n.length);
console.log(`tessere in pagina: ${sfondi}`);
console.log(guai.length ? guai.slice(0, 6).join(' | ') : 'nessun errore, nessun 404');
await p.screenshot({ path: '../scatti/tessere-3vie.png', fullPage: true });
await b.close();
