// Il tiro alla BG3: niente errori, niente fuori schermo, bersagli >= 44px, il
// registro completo solo quando il tiro e' finito, e la seconda occasione solo
// dopo il fallimento (e' il punto della lezione: prima non serve a niente).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') guai.push(m.text()); });
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-tiro.html', { waitUntil: 'networkidle' });
console.log('telai:', await p.locator('.telaio').count(), '(atteso 5)');
await p.click('[data-schermo]');
for (const m of ['scelta', 'tirato', 'conto', 'riuscita', 'fallita']) {
  await p.click(`[data-vai="${m}"]`);
  await p.waitForTimeout(150);
  const q = await p.evaluate(() => ({
    righe: document.querySelectorAll('.tiro.schermo .registro .riga').length,
    seconda: document.querySelectorAll('.tiro.schermo .seconda').length,
    soglia: document.querySelectorAll('.tiro.schermo .chi-tira .soglia').length,
    stampa: document.querySelectorAll('.tiro.schermo .stampa').length,
    fuori: [...document.querySelectorAll('.tiro.schermo *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width && (r.left < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1);
    }).map((e) => e.className).slice(0, 4),
    piccoli: [...document.querySelectorAll('.tiro.schermo .btn')]
      .filter((e) => e.getBoundingClientRect().height < 44).length,
    // I DADI SI DEVONO VEDERE. Le regole del materiale erano legate a
    // `.dadi-overlay`, che questa pagina non ha: le facce restavano senza
    // fondo, cioe' invisibili, e il banco diceva verde lo stesso perche'
    // contava righe e bottoni. Una faccia senza fondo e' un dado che non c'e'.
    facceNude: [...document.querySelectorAll('.tiro.schermo .dado-faccia')]
      .filter((f) => getComputedStyle(f).backgroundImage === 'none').length,
    // il verdetto sta SOPRA i dadi: coperto dai cubi si leggeva «c e»
    stampaCoperta: (() => {
      const s = document.querySelector('.tiro.schermo .stampa');
      if (!s) return 0;
      // il punto da guardare e' SOPRA UN DADO, non in mezzo ai due: fra un cubo
      // e l'altro non c'e' niente da coprire, e la misura sarebbe verde sempre
      // (col vecchio z-index sbagliato lo era).
      // La scritta non prende i tocchi (`pointer-events: none`): glieli si
      // ridanno per un istante per chiedere «chi c'e' sopra?».
      s.style.pointerEvents = 'auto';
      const d = document.querySelector('.tiro.schermo .dado-scena').getBoundingClientRect();
      const q = document.elementFromPoint(d.left + d.width / 2, d.top + d.height / 2);
      s.style.pointerEvents = '';
      return q && q.closest('.stampa') ? 0 : 1;
    })(),
  }));
  console.log(m, JSON.stringify(q));
  await p.screenshot({ path: `scatti/tiro-${m}.png` });
}
console.log('errori:', guai.length ? guai : 'nessuno');
await b.close();
