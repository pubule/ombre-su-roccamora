// Le carte si guardano da vicino: un tocco le apre a tutto schermo.
//
// Al tavolo la carta stampata la si prende in mano e la si avvicina agli
// occhi; a schermo, alla misura in cui sta nel pannello (320 px, e 110 px in
// galleria) il testo di regola non si legge. Qui un solo ascoltatore delegato
// su `document` copre TUTTI i posti in cui compare una carta — la carta
// pescata (`.carta-grande`), l'inventario (`.galleria-carte`), i reperti
// (`.reperto-img`) — in Indagine, in Spedizione e nella plancia digitale.
// Delegato e non per-elemento: le viste si ridisegnano a ogni azione, e un
// ascoltatore per immagine si moltiplicherebbe a ogni render.
//
// Lo zoom del sistema (pizzico) resta: qui si porta l'immagine alla misura
// piena dello schermo, poi il dito fa il resto.
const DA_INGRANDIRE = '.carta-grande img, .galleria-carte img, img.reperto-img';

let aperto = null;

function chiudi() {
  if (!aperto) return;
  aperto.remove();
  aperto = null;
}

function apri(src) {
  chiudi();
  const o = document.createElement('div');
  o.className = 'zoom-overlay';
  o.setAttribute('role', 'dialog');
  o.setAttribute('aria-label', 'carta ingrandita');
  o.tabIndex = -1;
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  o.appendChild(img);
  // un tocco qualunque richiude: non serve cercare una crocetta al buio
  o.addEventListener('click', chiudi);
  document.body.appendChild(o);
  o.focus();
  aperto = o;
}

document.addEventListener('click', (e) => {
  const img = e.target.closest?.(DA_INGRANDIRE);
  if (!img || !img.src) return;
  e.preventDefault();
  apri(img.src);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chiudi();
});
