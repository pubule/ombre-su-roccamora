// IL BUIO DELLA PLANCIA: due canvas a un quarto della risoluzione, allargati
// dal CSS. Sono sfumature: ingrandite non perdono niente e costano un
// sedicesimo dei pixel. La maschera SVG grande quanto la mappa, ridisegnata a
// ogni fotogramma, faceva scattare il telefono (mockup lanterne, 24/09/2026).
const Q = 4;
const RAGGIO = { torcia: 1.9, candela: 1.3, cera: .95 };        // in caselle
const TINTE = { lanterna: [255, 179, 92], torcia: [255, 170, 80], cera: [255, 207, 122], candela: [255, 207, 122] };

export function creaLuce(el, { cell = 104 } = {}) {
  const buio = document.createElement('canvas'); buio.className = 'buio';
  const calore = document.createElement('canvas'); calore.className = 'calore';
  el.append(calore, buio);
  const gB = buio.getContext('2d'), gC = calore.getContext('2d');
  let sorgenti = () => [], canto = 0, raf = 0, t0 = 0;
  const pos = {};                                   // id -> {x,y}: la luce insegue la sorgente
  function dimensiona(W, H) {
    for (const c of [buio, calore]) { c.width = Math.ceil(W / Q); c.height = Math.ceil(H / Q); c.style.width = W + 'px'; c.style.height = H + 'px'; }
  }
  function fotogramma(now) {
    // smorzamento sul tempo vero trascorso (mockup lanterne.js:179-182), non sui
    // fotogrammi: su un telefono che ne perde qualcuno la luce insegue comunque
    // alla stessa velocita' reale invece di scattare o strisciare
    const dt = Math.min(50, now - t0) / 1000; t0 = now;
    const k = Math.min(1, dt * 7);
    const w = buio.width, h = buio.height, base = cell * (2.8 - canto * .11);
    gB.globalCompositeOperation = 'source-over'; gB.fillStyle = 'rgba(2,3,4,.95)'; gB.fillRect(0, 0, w, h);
    gB.globalCompositeOperation = 'destination-out';
    gC.globalCompositeOperation = 'source-over'; gC.clearRect(0, 0, w, h); gC.globalCompositeOperation = 'lighter';
    for (const s of sorgenti()) {
      const p = pos[s.id] || (pos[s.id] = { x: s.x, y: s.y });
      p.x += (s.x - p.x) * k; p.y += (s.y - p.y) * k;
      const fl = 1 + Math.sin(now / 90 + s.id.length * 7) * .025 + Math.sin(now / 37 + s.x) * .02;
      const r = (RAGGIO[s.tipo] ? cell * RAGGIO[s.tipo] : base) * fl / Q, cx = p.x / Q, cy = p.y / Q;
      const g = gB.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.4, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      gB.fillStyle = g; gB.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      const [R, G, B] = TINTE[s.tipo] || TINTE.cera;
      const c = gC.createRadialGradient(cx, cy, 0, cx, cy, r * .9);
      c.addColorStop(0, `rgba(${R},${G},${B},.9)`); c.addColorStop(1, `rgba(${R},${G - 60},${B - 60},0)`);
      gC.fillStyle = c; gC.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    // si ferma da solo quando la plancia non e' piu' nella pagina
    raf = el.isConnected ? requestAnimationFrame(fotogramma) : 0;
  }
  return {
    dimensiona,
    imposta(f, o = {}) { sorgenti = f; if (o.canto != null) canto = o.canto; },
    avvia() { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(fotogramma); } },
    ferma() { cancelAnimationFrame(raf); raf = 0; },
    vivo: () => !!raf,
  };
}
