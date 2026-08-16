// Da SVG di game-icons.net allo SPRITE inline dell'app.
//
// Gli originali arrivano col quadrato nero di fondo e il disegno bianco: qui il
// fondo si butta e il tratto passa a `currentColor`, così l'icona prende il
// colore del testo che la circonda. È lo stesso generatore dei mockup
// (public/mockups/stile2/fai-icone.mjs): due copie dello stesso sprite
// divergerebbero, quindi si rigenerano tutt'e due da qui.
//
//   node webapp/fai-icone.mjs
//
// Icone di Lorc e Delapouite, game-icons.net, CC BY 3.0 — il credito sta in
// deploy/README.md, che è dove si guarda prima di pubblicare.
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const qui = dirname(fileURLToPath(import.meta.url));
const dir = join(qui, 'public/icone');

const simboli = readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => {
  const nome = f.replace(/\.svg$/, '');
  let s = readFileSync(join(dir, f), 'utf8');
  s = s.replace(/<path d="M0 0h512v512H0z"\s*\/>/g, '');   // il fondo nero
  const dentro = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '');
  return `<symbol id="i-${nome}" viewBox="0 0 512 512">${
    dentro.replace(/fill="#fff"/g, 'fill="currentColor"')}</symbol>`;
});

const js = `/* SPRITE DELLE ICONE — generato da webapp/fai-icone.mjs, non si scrive a mano.
   Icone di Lorc e Delapouite (game-icons.net), CC BY 3.0: il fondo nero è tolto
   e il tratto passa a \`currentColor\`, così l'icona prende il colore del testo.

     <svg class="ic" aria-hidden="true"><use href="#i-occhio"></use></svg> osservazione

   L'ICONA NON PARLA MAI DA SOLA: accanto ci va sempre la parola, e non scende
   sotto i 22px. È il difetto che rimproverano a X-haven Assistant — icone
   piccole e mute, illeggibili anche su iPad. */
export function piantaIcone() {
  if (document.getElementById('sprite-icone')) return;
  const d = document.createElement('div');
  d.id = 'sprite-icone';
  d.setAttribute('aria-hidden', 'true');
  d.style.display = 'none';
  d.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg">${simboli.join('')}</svg>\`;
  document.body.prepend(d);
}
`;
writeFileSync(join(qui, 'public/js/icone.js'), js);
console.log(`${simboli.length} icone nello sprite dell'app`);
