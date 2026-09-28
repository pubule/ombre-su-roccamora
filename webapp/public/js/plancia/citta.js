// LA CITTA' SOTTO I TETTI (Task 5, Step 4b, deciso col committente il
// 25/09/2026): il fondo delle tessere alAperto(). Porto fedele della funzione
// `citta(W, H, seme)` di webapp/public/mockups/tessere-alt/6-scenografia.html
// (righe 167-207), gia' verificata a occhio su Ep.1 e Ep.11 in quel mockup —
// non si tocca l'algoritmo, solo la forma del modulo.
//
// Una CITTA' vista dall'alto, non un cielo: puntini sparsi a caso si
// leggevano come stelle. Qui: canali scuri coi riflessi, isolati appena piu'
// chiari del nero, vie coi lampioni in fila, poche finestre accese a grappoli.
// Un canvas fermo — lo ridisegna solo chi chiama, quando la misura cambia
// (digitale.js, agganciaMappa()); costa niente vederlo sempre, anche sotto il
// buio (che pero' lo copre lo stesso: vedi la nota nel chiamante).
export function citta(W, H, seme) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'citta';
  const g = cv.getContext('2d'); let s = seme; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H);
  // isolati: tetti appena piu' chiari del nero, in blocchi storti
  for (let i = 0; i < W * H / 9000; i++) {
    const x = rnd() * W, y = rnd() * H, w = 18 + rnd() * 50, h = 14 + rnd() * 40;
    g.fillStyle = `rgba(${20 + rnd() * 12},${22 + rnd() * 10},${26 + rnd() * 10},.9)`;
    g.save(); g.translate(x, y); g.rotate((rnd() - .5) * .5); g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  }
  // canali: nastri verde-acqua scuro che serpeggiano
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = 'rgba(18,48,56,.85)'; g.lineWidth = 10 + rnd() * 10; g.beginPath();
    let x = rnd() * W, y = -20; g.moveTo(x, y);
    while (y < H + 20) { x += (rnd() - .5) * 140; y += 60 + rnd() * 60; g.lineTo(x, y); }
    g.stroke();
  }
  // vie: linee sottili, e lampioni in fila lungo ognuna
  for (let k = 0; k < 14; k++) {
    const x0 = rnd() * W, y0 = rnd() * H, a = rnd() * Math.PI, len = 150 + rnd() * 400;
    g.strokeStyle = 'rgba(40,36,30,.7)'; g.lineWidth = 2; g.beginPath();
    g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); g.stroke();
    for (let d = 0; d < len; d += 22 + rnd() * 16) {
      const lx = x0 + Math.cos(a) * d, ly = y0 + Math.sin(a) * d;
      const gr = g.createRadialGradient(lx, ly, 0, lx, ly, 7);
      gr.addColorStop(0, 'rgba(255,196,110,.55)'); gr.addColorStop(1, 'rgba(255,160,70,0)');
      g.fillStyle = gr; g.fillRect(lx - 7, ly - 7, 14, 14);
    }
  }
  // finestre accese: poche, a grappoli, come case dove qualcuno e' ancora sveglio
  for (let k = 0; k < W * H / 60000; k++) {
    const cx = rnd() * W, cy = rnd() * H, n = 2 + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) { g.fillStyle = `rgba(232,180,100,${.25 + rnd() * .45})`; g.fillRect(cx + (rnd() - .5) * 26, cy + (rnd() - .5) * 18, 2, 3); }
  }
  const n = g.createLinearGradient(0, 0, W, H); n.addColorStop(0, 'rgba(14,21,25,.55)'); n.addColorStop(.5, 'rgba(14,21,25,.15)'); n.addColorStop(1, 'rgba(14,21,25,.6)');
  g.fillStyle = n; g.fillRect(0, 0, W, H);
  return cv;
}
