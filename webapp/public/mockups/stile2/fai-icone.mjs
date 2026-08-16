// Da SVG di game-icons.net a uno SPRITE inline.
//
// Gli originali arrivano con un quadrato nero di fondo e il disegno bianco: qui
// il fondo si butta e il tratto passa a `currentColor`, così l'icona prende il
// colore del testo che la circonda — che è l'unico modo perché funzioni in tre
// direzioni di stile diverse senza tre copie dei file.
//
//   node webapp/public/mockups/stile2/fai-icone.mjs
//
// Icone di Lorc e Delapouite, game-icons.net, CC BY 3.0. Se una direzione con
// le icone finisce nell'app, il credito va nel README prima di pubblicarle.
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const qui = dirname(fileURLToPath(import.meta.url));
const dir = join(qui, 'icone');

const simboli = readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => {
  const nome = f.replace(/\.svg$/, '');
  let s = readFileSync(join(dir, f), 'utf8');
  // il fondo nero: è sempre il rettangolo che copre tutta la viewBox
  s = s.replace(/<path d="M0 0h512v512H0z"\s*\/>/g, '');
  const dentro = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '');
  return `<symbol id="i-${nome}" viewBox="0 0 512 512">${
    dentro.replace(/fill="#fff"/g, 'fill="currentColor"')}</symbol>`;
});

const js = `/* SPRITE DELLE ICONE — generato da fai-icone.mjs, non si scrive a mano.
   Icone di Lorc e Delapouite (game-icons.net), CC BY 3.0: il tratto è passato a
   \`currentColor\` e il fondo nero è stato tolto, così l'icona prende il colore
   del testo. Si usa così:

     <svg class="ic" aria-hidden="true"><use href="#i-occhio"></use></svg> osservazione

   L'icona non parla mai da sola: accanto ci va sempre la parola. È il difetto
   che rimproverano a X-haven Assistant — icone piccole e mute, illeggibili
   anche su iPad. */
document.addEventListener('DOMContentLoaded', () => {
  const d = document.createElement('div');
  d.style.display = 'none';
  d.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg">${simboli.join('')}</svg>\`;
  document.body.prepend(d);
});
`;
writeFileSync(join(qui, 'icone.js'), js);
console.log(`${simboli.length} icone nello sprite`);
