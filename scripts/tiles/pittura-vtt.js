// LA TESSERA VISTA DALL'ALTO, come la disegna un VTT.
//
// L'arte di oggi e' una VEDUTA IN PROSPETTIVA con l'orizzonte dentro: le pedine
// ci stanno sopra come figurine su una cartolina, e gli arredi sono
// illustrazioni isometriche ritagliate in una cornice d'oro — francobolli
// incollati su una stanza, non oggetti dentro una stanza.
//
// Qui si segue la grammatica che ogni VTT usa da vent'anni (Dungeondraft,
// Foundry, le mappe di 2-Minute Tabletop), e che la Spedizione ha gia' scelto
// per conto suo («la stanza e' il pezzo»):
//
//   1. PAVIMENTO PIASTRELLABILE visto dall'alto, non una veduta;
//   2. OGGETTI DALL'ALTO con la loro ombra, che li stacca dal pavimento;
//   3. LUCE: pozze di lanterna dove c'e' una fiamma, buio ai bordi.
//
// Il reticolo e le etichette delle porte NON si disegnano qui: l'app le
// ridisegna gia' in DOM sopra la tessera (`digitale.js`), e cuocerle nel PNG
// significava averle due volte — con quelle cotte illeggibili a schermo. Per la
// stampa servono, e per quello c'e' `--stampa`.
//
// Le materie prime sono texture CC0 di Poly Haven scaricate da
// scripts/scarica-texture.py in webapp/texture/ (con LICENZE.txt accanto).
// Nascono neutre: la palette di «notte e nebbia» gliela mette questo file —
// velatura fredda verso --tavolo #0c0e11, luce calda --nastro #e8c27a,
// saturazione bassa. Un pavimento generico diventa una banchina di Roccamora.

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const DIR_TEX = path.join(ROOT, 'webapp', 'texture');

// GLI ASSET DIPINTI VINCONO SULLE SAGOME. Se `webapp/vtt/` ha l'arredo o il
// pavimento dipinto (li porta dentro scripts/importa-vtt.py dai pacchetti
// 2-Minute Tabletop, CC BY-NC), si usa quello: e' il look dei riferimenti.
// Senza, restano la texture CC0 e la sagoma disegnata qui — cosi' una tessera
// esce comunque, e nessuna casella resta vuota all'occhio.
const DIR_VTT = path.join(ROOT, 'webapp', 'vtt');
const dipinto = (tipo, nome) => {
  const p = path.join(DIR_VTT, tipo, `${nome}.png`);
  return fs.existsSync(p) ? pathToFileURL(p).href : null;
};

const tex = (nome) => {
  const p = path.join(DIR_TEX, `${nome}.jpg`);
  if (!fs.existsSync(p)) {
    throw new Error(`manca la texture ${nome}.jpg — lancia: python scripts/scarica-texture.py`);
  }
  return pathToFileURL(p).href;
};

// IL PAVIMENTO LO DICE IL NOME DELLA STANZA. I dati non hanno un campo
// «ambiente» e non glielo si aggiunge per una scelta di pittura: il nome della
// tessera ce l'ha gia' dentro — «banchina», «deposito», «cripta» — ed e' lo
// stesso nome che il tavolo sente leggere ad alta voce.
// L'ORDINE E' UNA REGOLA, non un caso: «Sala delle Casse» e' un magazzino, e
// se la riga dei salotti venisse prima si ritroverebbe il parquet.
const PAVIMENTI = [
  [/molo|banchin|pontile|darsena|imbarcader|chiatta|barc/i, 'assi'],
  [/cript|catacomb|sacrest|chiesa|cappell|altare|ossari|tomb/i, 'pietra'],
  [/fonder|forgia|crogiol|officina|magazzin|deposit|quinta|carico|casse|scorie/i, 'mattoni'],
  [/cortile|giardino|orto|cantina|scavo|galler|cunicol|terrapien/i, 'terra'],
  [/ufficio|stanzino|studio|archivio|scrittoio|sala|salotto|tinello|camer|abbaino|gronda/i, 'mattonelle'],
];
// OGNI TEXTURE NASCE CON LA SUA LUCE. `dark_wooden_planks` e' quasi nera,
// `cobblestone_floor_08` ha le pietre minute: una taratura sola per tutte dava
// un molo nero e una cripta a mosaico. Qui ognuna dichiara quanto schiarirla e
// quanto ingrandirne la piastrella (in caselle).
const TARATURA = {
  assi:       { luce: 1.25, scala: 1.1 },
  lastricato: { luce: 1.0,  scala: 1.7 },
  pietra:     { luce: 1.05, scala: 1.5 },
  mattonelle: { luce: 1.15, scala: 0.9 },
  mattoni:    { luce: 1.05, scala: 1.3 },
  terra:      { luce: 1.1,  scala: 1.6 },
};

function pavimentoDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of PAVIMENTI) if (re.test(nome)) return quale;
  return 'lastricato';
}

// ---------------------------------------------------------------- gli arredi
//
// Ogni arredo e' una SAGOMA vista da sopra, riempita della sua materia e
// staccata dal pavimento dalla propria ombra. Niente cornice: l'oggetto occupa
// la casella che il dato gli assegna, e basta.
//
// Si disegnano qui e non si scaricano gia' fatti per tre ragioni pratiche:
// stanno esattamente nella casella dichiarata, seguono la palette senza
// ritocchi, e un arredo nuovo non aspetta che qualcuno generi un'illustrazione
// — oggi `armadio` e `toeletta` non hanno il PNG e le loro caselle sono
// INVISIBILI, bloccate dalle regole ma libere all'occhio.
//
// `w`/`h` sono frazioni della cella: un oggetto non riempie mai il quadrato
// fino al bordo, o la stanza diventa un mosaico di scatole.

const OMBRA = '0 18px 34px rgba(0,0,0,.62), 0 3px 8px rgba(0,0,0,.5)';

// assi di legno ripetute, per casse e mobili
const assi = (n = 4) =>
  `repeating-linear-gradient(90deg, rgba(0,0,0,.5) 0 4px, rgba(255,255,255,.08) 4px ${Math.round(100 / n)}%)`;

const ARREDI = {
  // il molo: bitte d'ormeggio e la cima avvolta. Vista da sopra una bitta e'
  // un cerchio di ferro, la cima e' una spirale.
  molo: ({ c }) => `
    <div class="og" style="width:${c * 0.5}px;height:${c * 0.5}px;border-radius:50%;
         background:conic-gradient(from 20deg, #6f5c3f, #4a3c28 35%, #7a664a 62%, #4a3c28 88%, #6f5c3f);
         box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.34}px;height:${c * 0.34}px;border-radius:50%;
         background:#0d0b09; box-shadow:inset 0 0 ${c * 0.04}px rgba(0,0,0,.9)"></div>
    <div class="og" style="width:${c * 0.26}px;height:${c * 0.26}px;border-radius:50%;
         background:radial-gradient(circle at 38% 32%, #6a6258, #241f19 72%);
         box-shadow:0 ${c * 0.02}px ${c * 0.05}px rgba(0,0,0,.7)"></div>
    <div class="og" style="width:${c * 0.62}px;height:${c * 0.4}px;border-radius:50%;
         transform:translate(-38%,-42%) rotate(-14deg);
         border:${Math.round(c * 0.03)}px solid #7d6947; opacity:.85;
         box-shadow:0 ${c * 0.015}px ${c * 0.04}px rgba(0,0,0,.6)"></div>`,

  // casse accatastate: quadrati di legno con le cantonate di ferro, ruotati
  // di poco l'uno rispetto all'altro — impilate a mano, non a squadra
  casse: ({ c }) => [0, 1, 2].map((i) => {
    const lato = c * (0.46 - i * 0.05);
    const dx = [-0.13, 0.14, 0.02][i] * c;
    const dy = [0.12, 0.06, -0.14][i] * c;
    const rot = [-6, 5, 2][i];
    return `<div class="og" style="width:${lato}px;height:${lato}px;
      transform:translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg);
      background-image:${assi(4)}, url('${tex('legno')}');
      background-size:auto, ${lato}px ${lato}px; border-radius:${c * 0.012}px;
      box-shadow:${OMBRA}, inset 0 0 0 ${Math.round(c * 0.018)}px rgba(38,28,18,.85)"></div>`;
  }).join(''),

  // candele: cera e fiamma. Sono anche una SORGENTE DI LUCE (vedi luciDi).
  candele: ({ c }) => [[-0.12, -0.08, 0.075], [0.1, 0.02, 0.06], [-0.02, 0.13, 0.05]]
    .map(([dx, dy, r]) => `
      <div class="og" style="width:${c * r}px;height:${c * r}px;border-radius:50%;
        transform:translate(calc(-50% + ${dx * c}px), calc(-50% + ${dy * c}px));
        background:radial-gradient(circle at 50% 50%, #fff3c4 0 22%, #e8c27a 30%, #6b5836 70%);
        box-shadow:0 0 ${c * 0.16}px ${c * 0.05}px rgba(232,194,122,.55), ${OMBRA}"></div>`).join(''),

  // scrivania: piano di legno, due fogli, il calamaio
  scrivania: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.78}px;height:${h * 0.56}px;
      background-image:${assi(6)}, url('${tex('legno')}'); background-size:auto, ${c * 0.5}px ${c * 0.5}px;
      border-radius:${c * 0.02}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.17}px;height:${c * 0.23}px;transform:translate(-70%,-40%) rotate(-7deg);
      background:#d9cfae; box-shadow:0 4px 10px rgba(0,0,0,.5)"></div>
    <div class="og" style="width:${c * 0.16}px;height:${c * 0.21}px;transform:translate(-20%,-55%) rotate(4deg);
      background:#cdc29d; box-shadow:0 4px 10px rgba(0,0,0,.5)"></div>
    <div class="og" style="width:${c * 0.07}px;height:${c * 0.07}px;border-radius:50%;
      transform:translate(120%,10%); background:radial-gradient(circle at 40% 35%, #2b3a3f, #0d1416);
      box-shadow:0 3px 8px rgba(0,0,0,.6)"></div>`,

  // branda: telaio, tela, la coperta ripiegata ai piedi
  branda: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.5}px;height:${h * 0.82}px;
      background-image:linear-gradient(rgba(30,28,24,.62), rgba(18,16,14,.72)), url('${tex('tela')}');
      background-size:auto, ${c * 0.6}px ${c * 0.6}px; border-radius:${c * 0.02}px;
      box-shadow:${OMBRA}, inset 0 0 0 ${Math.round(c * 0.012)}px rgba(40,32,24,.8)"></div>
    <div class="og" style="width:${w * 0.46}px;height:${h * 0.17}px;transform:translate(-50%,-190%);
      background:#8d8578; opacity:.75; border-radius:${c * 0.02}px"></div>
    <div class="og" style="width:${w * 0.48}px;height:${h * 0.22}px;transform:translate(-50%,120%);
      background:repeating-linear-gradient(90deg, #6b5744 0 ${Math.round(c*0.02)}px, #4a3b2c ${Math.round(c*0.02)}px ${Math.round(c*0.045)}px);
      border-radius:${c * 0.01}px;
      box-shadow:0 8px 16px rgba(0,0,0,.5)"></div>`,

  // scala: i gradini si leggono come bande, e la luce cala scendendo
  scala: ({ w, h }) => `
    <div class="og" style="width:${w * 0.86}px;height:${h * 0.86}px;
      background-image:repeating-linear-gradient(180deg, rgba(255,255,255,.07) 0 ${h * 0.055}px,
        rgba(0,0,0,.42) ${h * 0.055}px ${h * 0.115}px), url('${tex('muro')}');
      background-size:auto, ${w * 0.5}px ${w * 0.5}px;
      box-shadow:${OMBRA}, inset 0 -${h * 0.3}px ${h * 0.35}px rgba(0,0,0,.75)"></div>`,

  // altare: lastra di pietra, il cerchio inciso, due candele agli angoli
  altare: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.72}px;height:${h * 0.72}px;
      background-image:linear-gradient(rgba(30,28,26,.25), rgba(10,9,8,.45)), url('${tex('muro')}');
      background-size:auto, ${c * 0.7}px ${c * 0.7}px; border-radius:${c * 0.015}px;
      box-shadow:${OMBRA}, inset 0 0 ${c * 0.12}px rgba(0,0,0,.7)"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.4}px;height:${Math.min(w, h) * 0.4}px;border-radius:50%;
      border:${Math.round(c * 0.012)}px solid rgba(232,194,122,.5); box-shadow:0 0 ${c * 0.1}px rgba(232,194,122,.25)"></div>
    ${[[-0.26, -0.26], [0.26, -0.26]].map(([dx, dy]) => `
      <div class="og" style="width:${c * 0.07}px;height:${c * 0.07}px;border-radius:50%;
        transform:translate(calc(-50% + ${dx * w}px), calc(-50% + ${dy * h}px));
        background:radial-gradient(circle, #fff3c4 0 25%, #e8c27a 35%, #6b5836 75%);
        box-shadow:0 0 ${c * 0.14}px ${c * 0.04}px rgba(232,194,122,.5)"></div>`).join('')}`,

  // cella: le sbarre. Da sopra sono ferro che attraversa la casella.
  cella: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.92}px;height:${h * 0.92}px;
      background:linear-gradient(rgba(4,4,6,.55), rgba(4,4,6,.72));"></div>
    <div class="og" style="width:${w * 0.92}px;height:${h * 0.92}px;
      background-image:repeating-linear-gradient(90deg, rgba(120,120,128,.85) 0 ${c * 0.022}px,
        transparent ${c * 0.022}px ${c * 0.13}px), url('${tex('ferro')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; background-blend-mode:multiply;
      box-shadow:${OMBRA}"></div>`,

  // forma da cera: bacile tondo dentro un telaio quadro
  forma: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.66}px;height:${h * 0.66}px;
      background-image:linear-gradient(rgba(20,18,16,.4), rgba(10,9,8,.55)), url('${tex('legno')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.42}px;height:${Math.min(w, h) * 0.42}px;border-radius:50%;
      background:radial-gradient(circle at 42% 38%, #cbb383, #7a6540 60%, #3a2f1e);
      box-shadow:inset 0 0 ${c * 0.06}px rgba(0,0,0,.7), 0 6px 14px rgba(0,0,0,.5)"></div>`,

  // scorie: mucchi irregolari, ferro arrugginito e pietrisco
  scorie: ({ c, w, h }) => [[-0.16, 0.1, 0.34], [0.14, -0.08, 0.4], [0.04, 0.2, 0.26]]
    .map(([dx, dy, s]) => `
      <div class="og" style="width:${Math.min(w, h) * s}px;height:${Math.min(w, h) * s * 0.8}px;
        transform:translate(calc(-50% + ${dx * w}px), calc(-50% + ${dy * h}px)) rotate(${dx * 90}deg);
        border-radius:48% 52% 40% 60% / 55% 45% 55% 45%;
        background-image:linear-gradient(rgba(24,16,10,.35), rgba(10,7,5,.6)), url('${tex('ruggine')}');
        background-size:auto, ${c * 0.4}px ${c * 0.4}px; box-shadow:${OMBRA}"></div>`).join(''),

  // crogiolo: il bacile del metallo fuso — la sorgente di luce piu' forte
  crogiolo: ({ c, w, h }) => `
    <div class="og" style="width:${Math.min(w, h) * 0.62}px;height:${Math.min(w, h) * 0.62}px;border-radius:50%;
      background-image:linear-gradient(rgba(20,14,10,.4), rgba(10,7,5,.6)), url('${tex('ferro')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.4}px;height:${Math.min(w, h) * 0.4}px;border-radius:50%;
      background:radial-gradient(circle at 50% 45%, #ffe9b0 0 18%, #e8934a 45%, #7a2f14 85%);
      box-shadow:0 0 ${c * 0.3}px ${c * 0.1}px rgba(232,147,74,.55)"></div>`,

  // stufa: ghisa, e lo sportello acceso
  stufa: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.6}px;height:${h * 0.6}px;border-radius:${c * 0.06}px;
      background-image:linear-gradient(rgba(16,16,18,.45), rgba(8,8,10,.62)), url('${tex('ferro')}');
      background-size:auto, ${c * 0.45}px ${c * 0.45}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.14}px;height:${c * 0.1}px;border-radius:${c * 0.02}px;
      transform:translate(-50%, 60%); background:radial-gradient(ellipse at 50% 50%, #ffd08a, #b8501c);
      box-shadow:0 0 ${c * 0.22}px ${c * 0.07}px rgba(232,147,74,.5)"></div>`,

  // armadio: due ante e le maniglie (oggi INVISIBILE: manca il PNG)
  armadio: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.74}px;height:${h * 0.5}px;
      background-image:${assi(3)}, url('${tex('legno')}'); background-size:auto, ${c * 0.55}px ${c * 0.55}px;
      border-radius:${c * 0.012}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.round(c * 0.008)}px;height:${h * 0.5}px;background:rgba(0,0,0,.55)"></div>
    ${[-1, 1].map((s) => `<div class="og" style="width:${c * 0.03}px;height:${c * 0.03}px;border-radius:50%;
      transform:translate(calc(-50% + ${s * c * 0.045}px), -50%); background:#c9a86a"></div>`).join('')}`,

  // toeletta: il mobile e lo specchio ovale
  toeletta: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.7}px;height:${h * 0.42}px;
      background-image:${assi(5)}, url('${tex('legno')}'); background-size:auto, ${c * 0.5}px ${c * 0.5}px;
      border-radius:${c * 0.012}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${w * 0.34}px;height:${h * 0.22}px;border-radius:50%;
      transform:translate(-50%,-120%);
      background:linear-gradient(140deg, rgba(190,205,210,.75), rgba(60,70,78,.85));
      box-shadow:0 0 ${c * 0.1}px rgba(200,215,220,.25), ${OMBRA}"></div>`,
};

// le fiamme accese: dove c'e' una di queste, la stanza ha una pozza di luce
const FUOCHI = { candele: '#e8c27a', crogiolo: '#e8934a', stufa: '#e8934a', altare: '#e8c27a' };

// ------------------------------------------------------------------ la pagina
//
// `gruppi` arriva gia' fuso da `groupArredi()` del generatore: un arredo che
// occupa piu' celle e' UN oggetto piu' grande, non lo stesso oggetto ripetuto.
function htmlVtt(tile, S, { gruppi, porte, stampa = false }) {
  const c = S / 4;
  const pav = pavimentoDi(tile);
  const tar = TARATURA[pav] || { luce: 1, scala: 1 };
  const pavDipinto = dipinto('pavimenti', pav);

  const arredi = gruppi.map((g) => {
    const chiave = String(g.label).toLowerCase();
    const disegna = ARREDI[chiave];
    // Una chiave senza disegno lascerebbe la casella LIBERA ALL'OCCHIO pur
    // essendo bloccata dalle regole: e' l'inganno del Preludio, e qui non si
    // ripete — si mette almeno un ingombro, e lo si dice in console.
    const w = g.cols * c, h = g.rows * c;
    const arte = dipinto('arredi', chiave);
    const dentro = arte
      ? `<div class="og dipinto" style="width:${w * 0.86}px;height:${h * 0.86}px;
           background-image:url('${arte}'); background-size:contain;
           background-repeat:no-repeat; filter:drop-shadow(0 ${Math.round(c * 0.03)}px
           ${Math.round(c * 0.05)}px rgba(0,0,0,.65))"></div>`
      : disegna
      ? disegna({ c, w, h })
      : `<div class="og" style="width:${w * 0.6}px;height:${h * 0.6}px;border-radius:${c * 0.02}px;
           background-image:linear-gradient(rgba(20,18,16,.5), rgba(8,7,6,.6)), url('${tex('legno')}');
           background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>`;
    if (!arte && !disegna) console.log(`arredo senza arte ne' sagoma, disegnato come ingombro: ${chiave}`);
    return `<div class="posto" style="left:${g.col * c}px; top:${g.row * c}px; width:${w}px; height:${h}px;">${dentro}</div>`;
  }).join('');

  // le pozze di luce: una per fiamma, piu' fredde sulle porte
  const luci = gruppi.filter((g) => FUOCHI[String(g.label).toLowerCase()]).map((g) => {
    const col = FUOCHI[String(g.label).toLowerCase()];
    const x = (g.col + g.cols / 2) * c, y = (g.row + g.rows / 2) * c;
    const r = c * 1.9;
    return `<div class="luce" style="left:${x - r}px; top:${y - r}px; width:${r * 2}px; height:${r * 2}px;
      background:radial-gradient(circle, ${col}44 0%, ${col}1c 38%, transparent 70%)"></div>`;
  }).join('') + porte.map(({ dir, idx }) => {
    const x = (dir === 'N' || dir === 'S') ? (idx + 0.5) * c : (dir === 'E' ? S : 0);
    const y = (dir === 'E' || dir === 'O') ? (idx + 0.5) * c : (dir === 'N' ? 0 : S);
    const r = c * 1.25;
    return `<div class="luce" style="left:${x - r}px; top:${y - r}px; width:${r * 2}px; height:${r * 2}px;
      background:radial-gradient(circle, rgba(150,190,200,.16) 0%, rgba(120,160,175,.07) 40%, transparent 70%)"></div>`;
  }).join('');

  // I MURI. Nei riferimenti (le battlemap dipinte) e' la prima cosa che si
  // vede: una fascia di pietra con SPESSORE attorno alla stanza, e l'ombra che
  // cade dentro. Senza, un pavimento e' una piastrella; con, e' una stanza.
  // Le porte sono varchi nel muro, non barre appiccicate sopra: si aprono
  // esattamente sulla cella che `pickDoorIndex` ha scelto.
  const sp = Math.round(c * 0.26);          // spessore del muro
  // UN VARCO NON SI DISEGNA SOPRA, SI LASCIA: il muro di quel lato si spezza
  // in due tratti e in mezzo resta la soglia. Un rettangolo trasparente sopra
  // la pietra non toglie la pietra — l'ho provato, e la porta restava murata.
  const tratti = (dir) => {
    const buchi = porte.filter((p) => p.dir === dir)
      .map((p) => [p.idx * c + c * 0.16, p.idx * c + c * 0.84])
      .sort((a, b) => a[0] - b[0]);
    const pezzi = []; let da = 0;
    for (const [a, b] of buchi) { if (a > da) pezzi.push([da, a]); da = b; }
    if (da < S) pezzi.push([da, S]);
    return pezzi;
  };
  const muri = ['N', 'S', 'E', 'O'].map((dir) => tratti(dir).map(([a, b]) => {
    const l = b - a;
    const q = { N: `left:${a}px; top:0; width:${l}px; height:${sp}px;`,
                S: `left:${a}px; top:${S - sp}px; width:${l}px; height:${sp}px;`,
                E: `left:${S - sp}px; top:${a}px; width:${sp}px; height:${l}px;`,
                O: `left:0; top:${a}px; width:${sp}px; height:${l}px;` }[dir];
    return `<div class="muro" style="${q}"></div>`;
  }).join('')).join('');

  // il reticolo e i cartellini stanno nel PNG SOLO per la stampa: a schermo li
  // disegna l'app, e cuocerli qui significa averli due volte
  const griglia = stampa
    ? Array.from({ length: 16 }, (_, i) => {
      const col = i % 4, row = (i / 4) | 0;
      return `<div class="cell" style="left:${col * c}px; top:${row * c}px; width:${c}px; height:${c}px;"></div>`;
    }).join('')
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:${S}px; height:${S}px; background:#0b0d10; }
    .stage { position:relative; width:${S}px; height:${S}px; overflow:hidden; }

    /* IL PAVIMENTO. La texture nasce neutra e viene portata in palette qui:
       velatura fredda verso il fondo dell'app, saturazione bassa. La piastrella
       e' mezza casella — a casella intera si legge il ripetersi, a un quarto
       diventa un tessuto. */
    .suolo { position:absolute; inset:0;
      background-image:url('${pavDipinto || tex(pav)}');
      background-size:${Math.round(c * tar.scala)}px ${Math.round(c * tar.scala)}px;
      /* almeno una piastrella per casella: piu' fitta di cosi' il pavimento
         diventa un tessuto e smette di leggersi come pavimento */
      ${pavDipinto
        /* un pavimento gia' dipinto ha la sua luce e la sua palette: toccarlo
           col filtro delle foto lo spegnerebbe due volte */
        ? 'filter:saturate(.85) brightness(.94);'
        : `filter:saturate(.5) brightness(${(0.86 * tar.luce).toFixed(2)}) contrast(1.06);`} }
    /* la velatura porta la texture nella palette senza spegnerla: il PNG non
       deve arrivare gia' nero, perche' e' l'app a metterci sopra i suoi filtri
       (e in stampa il nero non si recupera) */
    .tinta { position:absolute; inset:0; mix-blend-mode:multiply;
      background:linear-gradient(rgba(120,146,152,1), rgba(64,84,96,1)); }
    /* macchie larghe: senza, un pavimento piastrellato e' carta da parati */
    .macchie { position:absolute; inset:0; opacity:.55;
      background:
        radial-gradient(38% 30% at 22% 18%, rgba(0,0,0,.55), transparent 70%),
        radial-gradient(30% 26% at 78% 62%, rgba(0,0,0,.5), transparent 70%),
        radial-gradient(26% 22% at 55% 88%, rgba(10,20,22,.5), transparent 70%); }

    /* LA STANZA HA I MURI: senza il buio ai bordi, quattro tessere accostate
       sembrano un unico pavimento continuo e non si capisce dove finisce una
       stanza. E' la stessa vignettatura del mockup «la stanza e' il pezzo». */
    .muri { position:absolute; inset:0; pointer-events:none;
      box-shadow: inset 0 0 ${Math.round(c * 0.5)}px ${Math.round(c * 0.1)}px rgba(0,0,0,.55),
                  inset 0 0 0 ${Math.round(c * 0.018)}px rgba(0,0,0,.8); }

    .luce { position:absolute; pointer-events:none; mix-blend-mode:screen; }
    /* la luce che entra comunque nella stanza: senza, un ambiente senza fiamme
       e' una superficie uniforme, e uniforme al tavolo vuol dire scacchiera */
    .lanterna { position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen;
      background:radial-gradient(58% 52% at 46% 40%, rgba(232,194,122,.30), rgba(232,194,122,.08) 55%, transparent 78%); }

    /* un arredo sta DENTRO la sua casella: il posto e' la casella, l'oggetto e'
       centrato li' dentro e non la tocca mai ai bordi */
    .posto { position:absolute; }
    .posto .og { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      background-position:center; background-blend-mode:multiply;
      /* il legno di Poly Haven e' rossiccio: qui va nella palette, o le casse
         sembrano incollate sopra invece che appoggiate */
      filter:saturate(.4) brightness(1.12); }
    /* quel che e' gia' dipinto non si ritocca: ha la sua luce */
    .posto .og.dipinto { background-blend-mode:normal; box-shadow:none; }
    .posto .og.dipinto::after { content:none; }
    /* un filo di luce sul bordo alto: la lanterna sta in alto a sinistra, e
       senza questo riflesso un oggetto scuro su pavimento scuro e' una macchia */
    .posto .og { box-shadow:${OMBRA}; }
    .posto .og::after { content:''; position:absolute; inset:0; border-radius:inherit;
      pointer-events:none;
      background:linear-gradient(155deg, rgba(255,238,200,.18), rgba(255,238,200,0) 42%); }

    /* la pietra del muro, e l'ombra che getta dentro la stanza: e' l'ombra a
       dare lo spessore, non il bordo */
    .muro { position:absolute; background-image:linear-gradient(rgba(30,34,40,.5), rgba(12,14,18,.7)),
      url('${tex('muro')}'); background-size:auto, ${Math.round(c * 0.8)}px ${Math.round(c * 0.8)}px;
      background-blend-mode:multiply; filter:saturate(.35) brightness(.95);
      box-shadow:0 0 ${Math.round(c * 0.22)}px ${Math.round(c * 0.06)}px rgba(0,0,0,.85),
                 inset 0 0 ${Math.round(c * 0.1)}px rgba(0,0,0,.6); }
    .cell { position:absolute; border:2px solid rgba(230,195,120,0.35); }
  </style></head><body>
    <div class="stage">
      <div class="suolo"></div>
      <div class="tinta"></div>
      <div class="macchie"></div>
      <div class="lanterna"></div>
      ${luci}
      ${arredi}
      ${muri}
      <div class="muri"></div>
      ${griglia}
    </div>
  </body></html>`;
}

module.exports = { htmlVtt, pavimentoDi, ARREDI };
