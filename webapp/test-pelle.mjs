// LA PELLE DELL'APP È IDENTICA AI MOCKUP?
//
// «Identico» detto a parole non vuol dire niente: due schermate si somigliano
// finché non le si mette una accanto all'altra, e allora saltano fuori il
// raggio da 10 invece di 12, la pillola che è un rettangolo, il vetro che è
// diventato opaco. Qui si misura: la stessa componente viene disegnata nel
// mockup e nell'app, e si confrontano gli stili CALCOLATI.
//
// La colonna di sinistra è il nome nel mockup, quella di destra il nome
// nell'app: è la mappa fra le due, e va tenuta qui perché è la sola cosa che
// dice «questa cosa lì è quella cosa qui».
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-pelle.mjs
import { chromium } from 'playwright';

const BASE = process.env.OSR_BASE || 'http://localhost:8017';
const MOCKUP = `${BASE}/mockups/stile2/nebbia2-indagine.html`;

let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

// Le componenti, e cosa di ciascuna deve coincidere. Non TUTTO: il colore del
// testo di una nota e il raggio di un bottone sì, la larghezza no — quella
// dipende da dove sta.
const PEZZI = [
  { nome: 'la lastra', mock: 'lastra', app: 'pannello',
    guarda: ['backgroundColor', 'borderTopLeftRadius', 'borderTopColor', 'backdropFilter', 'padding'] },
  { nome: 'il bottone', mock: 'btn', app: 'btn',
    guarda: ['backgroundColor', 'borderTopLeftRadius', 'borderTopColor', 'color', 'fontFamily',
      'fontSize', 'padding', 'minHeight', 'textTransform', 'letterSpacing'] },
  { nome: 'il bottone pieno', mock: 'btn pieno', app: 'btn pieno',
    guarda: ['backgroundColor', 'color', 'borderTopColor', 'borderTopLeftRadius'] },
  { nome: 'la voce dello stradario', mock: 'voce', app: 'voce',
    guarda: ['backgroundColor', 'borderTopLeftRadius', 'borderTopColor', 'color', 'fontSize', 'padding'] },
  { nome: 'la voce del menu', mock: 'menu-voce', app: 'menu-voce',
    guarda: ['backgroundColor', 'borderTopLeftRadius', 'borderTopColor', 'color', 'fontFamily',
      'padding', 'borderLeftWidth', 'marginBottom'] },
  // i pezzi DENTRO la voce: il titolo e il conto. È lì che si vede se una
  // componente è stata rifatta a occhio invece che copiata.
  { nome: 'il titolo di una voce', mock: 'menu-voce', app: 'menu-voce', dentro: 'tit',
    guarda: ['fontFamily', 'fontSize', 'color'] },
  { nome: 'il conto di una voce', mock: 'menu-voce', app: 'menu-voce', dentro: 'conto',
    guarda: ['fontFamily', 'fontSize', 'color', 'whiteSpace'] },
  { nome: 'il titolo del menu', mock: 'menu-titolo', app: 'menu-titolo',
    guarda: ['color', 'fontSize', 'letterSpacing', 'textTransform', 'fontFamily'] },
  { nome: 'il foglio del menu', mock: 'foglio', app: 'foglio',
    guarda: ['backgroundColor', 'borderTopLeftRadius', 'backdropFilter', 'padding', 'position'] },
  { nome: 'il capo', mock: 'capo', app: 'capo',
    guarda: ['position', 'backgroundImage', 'backdropFilter', 'padding', 'alignItems', 'justifyContent'] },
  { nome: 'il lume acceso', mock: 'lume-punto acceso', app: 'lume-punto acceso',
    guarda: ['backgroundColor', 'borderTopColor', 'width', 'height', 'borderRadius'] },
  { nome: 'la griglia delle azioni', mock: 'azioni', app: 'azioni',
    guarda: ['display', 'gridTemplateColumns', 'gridAutoRows', 'gap'] },
  { nome: 'la scena', mock: 'scena', app: 'scena',
    guarda: ['minHeight', 'display', 'alignItems', 'padding', 'position'] },
];

// il probe: pianta le componenti in una pagina e legge gli stili calcolati.
// Larghezza fissa, così le griglie danno lo stesso risultato nelle due pagine.
const MISURA = (pezzi) => {
  const culla = document.createElement('div');
  culla.id = 'culla-pelle';
  culla.style.cssText = 'position:fixed;left:0;top:0;width:390px;visibility:hidden;z-index:-1';
  document.body.appendChild(culla);
  const out = {};
  for (const p of pezzi) {
    const el = document.createElement('div');
    el.className = p.classe;
    el.textContent = 'testimonianza';
    if (p.classe.includes('azioni')) {
      for (let i = 0; i < 3; i += 1) {
        const b = document.createElement('button');
        b.className = 'btn'; b.textContent = 'osservazione';
        el.appendChild(b);
      }
      el.firstChild.textContent = 'osservazione';
    }
    if (p.dentro) {
      const figlio = document.createElement('span');
      figlio.className = p.dentro;
      figlio.textContent = 'la notte';
      el.textContent = '';
      el.appendChild(figlio);
    }
    culla.appendChild(el);
    const s = getComputedStyle(p.dentro ? el.firstChild : el);
    out[p.nome] = {};
    for (const k of p.guarda) out[p.nome][k] = s[k];
  }
  culla.remove();
  return out;
};

const browser = await chromium.launch();
const leggi = async (url, chiave) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const m = await page.evaluate(MISURA, PEZZI.map((p) => ({ nome: p.nome, classe: p[chiave], guarda: p.guarda, dentro: p.dentro })));
  await page.close();
  return m;
};

const nelMockup = await leggi(MOCKUP, 'mock');
const nellApp = await leggi(BASE, 'app');
await browser.close();

console.log(`mockup: ${MOCKUP}\napp:    ${BASE}\n`);
for (const p of PEZZI) {
  const a = nelMockup[p.nome] || {};
  const b = nellApp[p.nome] || {};
  const diverse = p.guarda.filter((k) => String(a[k]) !== String(b[k]));
  ok(diverse.length === 0, `${p.nome}: ${p.guarda.length - diverse.length}/${p.guarda.length} uguali`);
  for (const k of diverse) console.log(`        ${k}: mockup «${a[k]}» · app «${b[k]}»`);
}

console.log(ko === 0 ? '\ntest-pelle: l\'app è identica ai mockup' : `\n${ko} componenti diverse`);
process.exit(ko ? 1 : 0);
