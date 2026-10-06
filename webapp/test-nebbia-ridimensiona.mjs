// LA NEBBIA DI SFONDO copre sempre tutto lo schermo: se la finestra cambia mentre lo sfondo e'
// nascosto (si ruota il telefono, si ritira la barra di Safari) Vanta lo misura alto 0 e si ferma al
// minimo di 200px — al ritorno la nebbia copre solo la cima della pagina.
//
// Uso:  node webapp/server.js ; node webapp/test-nebbia-ridimensiona.mjs
import { chromium } from 'playwright';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.waitForSelector('#vanta-bg canvas');
const altezza = () => pg.evaluate(() => Math.round(document.querySelector('#vanta-bg canvas').getBoundingClientRect().height));
ok(await altezza() === 844, `all inizio la nebbia copre lo schermo (${await altezza()}px)`);

// lo sfondo sparisce, la finestra cambia, lo sfondo torna
await pg.evaluate(() => { document.querySelector('#vanta-bg').style.display = 'none'; });
await pg.setViewportSize({ width: 390, height: 700 });
await pg.waitForTimeout(300);
await pg.setViewportSize({ width: 390, height: 780 });
await pg.waitForTimeout(300);
await pg.evaluate(() => { document.querySelector('#vanta-bg').style.display = ''; });
await pg.waitForTimeout(600);
ok(await altezza() === 780, `tornato visibile la nebbia riprende l altezza dello schermo (${await altezza()}px, attesi 780)`);

// DEFINITIVO: anche se three.js lascia in linea una misura vecchia (canvas alto 256px), il CSS lo fa
// comunque coprire tutto lo sfondo, e la misura si riallinea da sola
await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(500);
await pg.evaluate(() => { const c = document.querySelector('#vanta-bg canvas'); c.style.height = '256px'; c.style.width = '390px'; });
await pg.waitForTimeout(100);
ok(await altezza() === 844, `con una misura vecchia nel canvas (256px) copre comunque lo schermo (${await altezza()}px)`);
await pg.evaluate(() => { const c = document.querySelector('#vanta-bg canvas'); c.style.removeProperty('height'); });

// scorrendo la pagina con il buffer di disegno di un'altra proporzione, la nebbia si rimisura
await pg.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<div id="alto" style="height:3000px"></div>'); });
await pg.setViewportSize({ width: 390, height: 600 });
await pg.evaluate(() => { window.scrollBy(0, 300); document.documentElement.scrollTop = 300; document.body.scrollTop = 300; window.dispatchEvent(new Event('scroll')); });
await pg.waitForTimeout(900);
const buf = await pg.evaluate(() => { const c = document.querySelector('#vanta-bg canvas'); return c.height / c.width; });
ok(Math.abs(buf - 600 / 390) / (600 / 390) < 0.08, `dopo un cambio di altezza e uno scorrimento il buffer ha la proporzione dello schermo (${buf.toFixed(2)} vs ${(600 / 390).toFixed(2)})`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
