// La carta che si gira: la mappa file -> dorso, il markup senza `style=`
// (schermataCarta confronta l'html con app.innerHTML) e il volo che parte dal
// dorso e arriva sul fronte. Nessun server.
//
// Uso:  node webapp/test-carta3d.mjs
import fs from 'node:fs';
import { cartaGrande } from './public/js/engine.js';
import { keyframes } from './public/js/carta3d.js';

let errori = 0;
const ok = (c, m) => { if (c) console.log('  ok', m); else { errori += 1; console.log('  KO', m); } };

const TIPI = { Luoghi: 'luogo', Oggetti: 'oggetto', Minacce: 'minaccia', Nemici: 'nemico',
  Indizi: 'indizio', Referti: 'referto', Testimoni: 'testimone', Eroi: 'eroe' };
for (const [cartella, dorso] of Object.entries(TIPI)) {
  const h = cartaGrande(`Episodio 3/${cartella}/Una carta`, 'mt');
  ok(h.includes(`c3d-retro dorso-${dorso}"`) && h.includes('carta-grande carta3d mt'), `${cartella} -> dorso-${dorso}`);
  ok(!h.includes('style='), `${cartella}: niente style= nel markup`);
  // L'OMBRA VA PRIMA DELLA CARTA. Sono entrambe positioned con z-index auto, e a
  // parita' vince l'ordine nel DOM: dopo, l'ombra nera sfocata (opacity .55)
  // dipinge SOPRA la carta e la oscura tutta come una patina.
  ok(h.indexOf('c3d-ombra') < h.indexOf('class="c3d"'), `${cartella}: l'ombra sta prima della carta nel markup`);
}
ok(cartaGrande('Eroi/Elena Fosco').includes('dorso-eroe'), 'una carta comune (senza episodio) trova il dorso');
const piatta = cartaGrande('Preludio/La lettera');
ok(!piatta.includes('c3d') && piatta.includes('<img'), 'senza dorso (Preludio) esce piatta, come prima');

const css = fs.readFileSync(new URL('./public/app.css', import.meta.url), 'utf8');
for (const dorso of Object.values(TIPI)) {
  const m = new RegExp(String.raw`\.dorso-${dorso} \{ background-image: url\("?([^")]+)"?\)`).exec(css);
  ok(m, `app.css dichiara dorso-${dorso}`);
  const file = new URL('.' + decodeURI(m ? m[1] : '/x'), new URL('./', import.meta.url));
  ok(fs.existsSync(file) || !fs.existsSync(new URL('./assets/dorsi', import.meta.url)), `il file del dorso ${dorso} esiste (o assets non generati)`);
}

const kf = keyframes();
const volo = /@keyframes c3d-volo\{0\.00%\{[^}]*rotateY\((-?[\d.]+)deg\).*100\.00%\{[^}]*rotateY\((-?[\d.]+)deg\)/.exec(kf);
ok(volo && Number(volo[1]) === 180 && Number(volo[2]) === 0, 'il volo parte dal dorso (180°) e arriva sul fronte (0°)');
ok(/@keyframes c3d-ombra\{0\.00%\{[^}]*opacity:0\.55/.test(kf), "l'ombra parte dalla sua opacità di riposo");
console.log(errori ? `\ntest-carta3d: ${errori} KO` : '\ntest-carta3d: tutto a posto');
process.exit(errori ? 1 : 0);
