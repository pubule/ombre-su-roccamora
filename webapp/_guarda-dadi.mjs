// Guarda la pagina dei mockup del tiro: errori in console, tasti tutti della
// stessa larghezza, bersagli >= 44px, e uno scatto per ognuna delle tre
// direzioni a schermo intero (che e' l'unico modo di giudicarle).
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:8017/mockups/stile2/nebbia2-dadi.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
const guai = [];
p.on('console', (m) => { if (m.type() === 'error') guai.push(m.text()); });
p.on('pageerror', (e) => guai.push('pageerror: ' + e.message));
await p.goto(URL, { waitUntil: 'networkidle' });

const quante = await p.locator('.telaio').count();
console.log('telai:', quante, '(atteso 12)');
console.log('console:', guai.length ? guai : 'pulita');

for (const v of ['a', 'b', 'c']) {
  await p.click(`[data-schermo="${v}"]`);
  for (const m of ['scelta', 'conto', 'successo', 'fallita']) {
    await p.click(`[data-vai="${v}|${m}"]`);
    await p.waitForTimeout(120);
    // i tasti dei totali: tutti della stessa larghezza, e premibili al buio
    if (m === 'scelta') {
      const g = await p.$$eval('.dadi-overlay.schermo .dadi-grid .btn',
        (bs) => bs.map((x) => [Math.round(x.getBoundingClientRect().width),
                               Math.round(x.getBoundingClientRect().height)]));
      const larghezze = [...new Set(g.map((x) => x[0]))];
      const bassi = g.filter((x) => x[1] < 44);
      console.log(`  ${v}/tasti: ${g.length}, larghezze ${larghezze.join('/')}, sotto 44px: ${bassi.length}`);
    }
    // niente deve uscire dallo schermo
    const fuori = await p.evaluate(() => [...document.querySelectorAll('.dadi-overlay.schermo *')]
      .filter((e) => { const r = e.getBoundingClientRect();
        return r.width && (r.left < -1 || r.right > innerWidth + 1); })
      .map((e) => e.className + ' @' + Math.round(e.getBoundingClientRect().right)));
    if (fuori.length) console.log(`  ${v}/${m} FUORI:`, fuori);
    // la striscia del mockup non deve coprire i bottoni veri della finestra
    // SABOTAGGIO: la striscia si alza di 260px e deve mangiarsi i bottoni. Se
    // con questo la misura resta verde, la misura non guarda niente.
    if (process.env.SABOTA) await p.evaluate(() => { document.querySelector('.strisc').style.paddingTop = '260px'; });
    const coperti = await p.evaluate(() => {
      const s = document.querySelector('.strisc').getBoundingClientRect();
      // solo la finestra a schermo intero: i telai della pagina stanno sotto la
      // piega, e contarli renderebbe la misura sempre rossa (e quindi muta)
      return [...document.querySelectorAll('.dadi-overlay.schermo .btn')]
        .filter((e) => e.getBoundingClientRect().bottom > s.top).map((e) => e.className);
    });
    if (coperti.length) console.log(`  ${v}/${m} COPERTI:`, coperti);
    await p.screenshot({ path: `scatti/dadi-${v}-${m}.png` });
  }
  await p.click('[data-esci]');
}
await b.close();
