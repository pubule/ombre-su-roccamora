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

// lo smorzamento e' sul tempo vero trascorso (dt), non sul numero di
// fotogrammi: un dt piu' grande deve chiudere piu' strada verso il bersaglio.
// Si finge il rAF (un solo fotogramma manuale con un now scelto a mano) cosi'
// si controlla il dt senza dipendere dal refresh vero dello schermo.
const dt = await pg.evaluate(async () => {
  const { creaLuce } = await import('/js/plancia/luce.js');
  async function corsa(msDt) {
    const vero = window.requestAnimationFrame; let cb = null;
    window.requestAnimationFrame = (f) => { cb = f; return 1; };
    const el = document.createElement('div'); el.style.cssText = 'position:relative;width:800px;height:800px';
    document.body.appendChild(el);
    const L = creaLuce(el); L.dimensiona(800, 800);
    let tx = 0;
    L.imposta(() => [{ id: 'e', x: tx, y: 0, tipo: 'torcia' }]);
    L.avvia();
    const t0 = performance.now();
    cb(t0);          // 1o fotogramma: la luce nasce sul bersaglio (0,0)
    tx = 400;         // il bersaglio scatta lontano
    cb(t0 + msDt);    // 2o fotogramma, dt = msDt: quanto si e' allontanata da (0,0)?
    const g = el.querySelector('canvas.buio').getContext('2d');
    const alfa = g.getImageData(0, 0, 1, 1).data[3];   // il buco lasciato all'origine si richiude piano piano
    window.requestAnimationFrame = vero; el.remove();
    return alfa;
  }
  return { vicino: await corsa(10), lontano: await corsa(40) };
});
if (!(dt.lontano > dt.vicino + 5)) { guai++; console.error('smorzamento non sembra scalare col dt (frame-based?)', dt); }

console.log(guai ? 'FAIL' : 'OK luce', JSON.stringify({ ...r, dt })); await b.close(); process.exit(guai ? 1 : 0);
