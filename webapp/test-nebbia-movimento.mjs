// LA NEBBIA SI MUOVE ANCHE CON «RIDUCI MOVIMENTO»: piano, non ferma. Chi ha attivato l'impostazione
// di iOS ha chiesto MENO movimento, non nessuno — e a nebbia immobile sembrava che l'app fosse rotta.
//
// Uso:  node webapp/server.js ; node webapp/test-nebbia-movimento.mjs
import { chromium } from 'playwright';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();

async function nebbia(reducedMotion) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
  await pg.waitForSelector('#vanta-bg canvas');
  const leggi = () => pg.evaluate(() => { const f = window.nebbiaFx(); return { speed: f.options.speed, t: f.t }; });
  const a = await leggi();
  await pg.waitForTimeout(1500);
  const b = await leggi();
  await ctx.close();
  return { speed: a.speed, avanza: b.t > a.t };
}
const normale = await nebbia('no-preference');
ok(normale.avanza, 'la nebbia di sfondo avanza nel tempo');
ok(normale.speed >= 2, `a movimento normale scorre abbastanza da vedersi (velocita ${normale.speed})`);
const ridotta = await nebbia('reduce');
ok(ridotta.avanza && ridotta.speed > 0 && ridotta.speed < normale.speed, `con «riduci movimento» scorre piu piano ma non e ferma (velocita ${ridotta.speed})`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
