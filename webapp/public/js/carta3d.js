// LA CARTA CHE SI GIRA. Le carte grandi (Luogo, Approfondimento, Oggetto,
// Minaccia...) si rivelano alzandosi dal panno, girandosi nell'aria e posandosi:
// due facce vere (fronte e dorso), uno spessore, la faccia di taglio che si
// scurisce, l'ombra che si stringe e si sfuma mentre la carta sale. Prima era
// una rotateY di 65° sulla sola faccia davanti — una carta che si schiaccia e
// si riallarga (mockup «A» di webapp/public/mockups/carte3d.html, scelto
// dall'autore il 19/09/2026).
//
// Niente JS a ogni carta: qui si genera UNA volta, all'avvio, la curva del
// volo campionata in @keyframes; il resto e' CSS (app.css, `.carta3d`). Cosi'
// il DOM non si tocca mai dopo il render — `schermataCarta` confronta l'html
// con `app.innerHTML`, e un attributo scritto da uno script lo farebbe
// ridisegnare (il «refresh veloce» di cui e' gia' stato guarito).
//
// Le misure sono in larghezze-carta (`--cw`, definita in app.css).
const RAD = Math.PI / 180;
const PASSI = 28;

// dorso -> fronte. ry e' l'angolo, il resto il volo: z verso chi guarda, y su.
export const ARCO = [
  { ry: 180 },
  { ry: 128, z: .33, y: -.06, rx: 10, rz: -4 },
  { ry: 52, z: .34, y: -.05, rx: 6, rz: 2.5 },
  { ry: -7, z: .03, rx: -2 },
  { ry: 0 },
];

// Catmull-Rom sui fotogrammi: una curva sola, senza spigoli fra un tratto e l'altro
export function punto(u) {
  const n = ARCO.length - 1, p = u * n, i = Math.min(n - 1, Math.floor(p)), f = p - i, o = {};
  for (const k of ['y', 'z', 'rx', 'ry', 'rz']) {
    const v = (j) => ARCO[Math.max(0, Math.min(n, j))][k] ?? 0;
    const [a, b, c, d] = [v(i - 1), v(i), v(i + 1), v(i + 2)];
    o[k] = 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
  }
  return o;
}

export function keyframes() {
  const L = (w) => `calc(var(--cw) * ${w.toFixed(4)})`;
  let volo = '', luce = '', ombra = '';
  for (let s = 0; s <= PASSI; s++) {
    const u = s / PASSI, st = punto(u * u * (3 - 2 * u)), pc = `${(u * 100).toFixed(2)}%`;
    const cy = Math.cos(st.ry * RAD), cx = Math.cos(st.rx * RAD);
    volo += `${pc}{transform:translate3d(0,${L(st.y)},${L(st.z)}) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) rotateZ(${st.rz.toFixed(2)}deg)}`;
    luce += `${pc}{filter:brightness(${(1 - 0.55 * Math.pow(1 - Math.abs(cy * cx), 1.4)).toFixed(3)})}`;
    const alto = Math.max(0, st.z) + Math.abs(Math.sin(st.rx * RAD)) * 0.25;   // quanto e' staccata dal panno
    ombra += `${pc}{transform:translate(${L(alto * 0.22)},${L(st.y + alto * 0.38 + 0.02)}) scaleX(${Math.max(0.03, Math.abs(cy)).toFixed(3)}) scale(${(1 + alto * 0.3).toFixed(3)});opacity:${(0.55 / (1 + alto * 2.6)).toFixed(3)}}`;
  }
  return `@keyframes c3d-volo{${volo}}@keyframes c3d-luce{${luce}}@keyframes c3d-ombra{${ombra}}`;
}

if (typeof document !== 'undefined') {
  const st = document.createElement('style');
  st.textContent = keyframes();
  document.head.appendChild(st);
}
