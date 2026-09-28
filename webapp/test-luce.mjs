// webapp/test-luce.mjs — il buio c'e' dove non c'e' luce, e si buca dove c'e'.
// Uso: node webapp/server.js (altrove) ; node webapp/test-luce.mjs
import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await b.newPage();
await pg.goto('http://localhost:8017/');
const r = await pg.evaluate(async () => {
  const { creaLuce } = await import('/js/plancia/luce.js');
  const el = document.createElement('div'); el.style.cssText = 'position:relative;width:800px;height:800px';
  document.body.appendChild(el);
  const L = creaLuce(el); L.dimensiona(800, 800);
  L.imposta(() => [{ id: 'e', x: 200, y: 200, tipo: 'lanterna' }], { canto: 0 }); L.avvia();
  await new Promise((ok) => setTimeout(ok, 200));
  const cv = el.querySelector('canvas.buio'); const g = cv.getContext('2d');
  const a = (x, y) => g.getImageData(x / 4, y / 4, 1, 1).data[3];
  const vivo = L.vivo(); L.ferma(); await new Promise((ok) => setTimeout(ok, 100));
  return { centro: a(200, 200), lontano: a(700, 700), vivo, fermo: !L.vivo() };
});
let guai = 0;
if (r.centro > 40) { guai++; console.error('sotto la lanterna e\' ancora buio', r.centro); }
if (r.lontano < 230) { guai++; console.error('lontano dalla luce non e\' buio', r.lontano); }
if (!r.vivo || !r.fermo) { guai++; console.error('ciclo non parte o non si ferma', r); }
console.log(guai ? 'FAIL' : 'OK luce', JSON.stringify(r)); await b.close(); process.exit(guai ? 1 : 0);
