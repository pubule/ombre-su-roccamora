import { readFileSync, readdirSync } from 'fs';
import { pavimentoDi, fuoriDi, alAperto, fuoriDichiarato } from './public/motore/ambiente.js';
const atteso = JSON.parse(readFileSync('webapp/test-ambiente.atteso.json', 'utf8'));
let guai = 0, n = 0;
for (const f of readdirSync('webapp/data').filter((f) => /^(ep\d+|preludio)\.json$/.test(f))) {
  for (const t of JSON.parse(readFileSync('webapp/data/' + f, 'utf8')).tessere) {
    n++; const a = atteso[`${f}:${t.id}`];
    const v = { pav: pavimentoDi(t), fuori: fuoriDi(t) };
    if (v.pav !== a.pav || v.fuori !== a.fuori) { guai++; console.error(`${f}:${t.id} ${t.nome}`, v, 'atteso', a); }
  }
}
if (n !== 127) { guai++; console.error('tessere contate', n, 'attese 127'); }

const no = (msg) => { guai++; console.error(msg); };
const ep1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')).tessere;
const ep11 = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8')).tessere;
const tile = (arr, id) => arr.find((t) => t.id === id);

const t1 = tile(ep1, 'T1');
if (fuoriDichiarato(t1) !== 'acqua') no(`fuoriDichiarato(ep1:T1) atteso 'acqua', ottenuto ${fuoriDichiarato(t1)}`);
for (const id of ['T2', 'T3', 'T4', 'T5', 'T6']) {
  const t = tile(ep1, id);
  if (fuoriDichiarato(t) !== null) no(`fuoriDichiarato(ep1:${id}) atteso null, ottenuto ${fuoriDichiarato(t)}`);
}
// Task 9: T1 «L'abbaino» e' il riparo CHIUSO (aperto=False in gen_ep11.py,
// fatto passare da export-data.py); T2-T6 restano sui tetti veri.
for (const id of ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']) {
  const t = tile(ep11, id);
  const atteso = id !== 'T1';
  if (alAperto(t) !== atteso) no(`alAperto(ep11:${id}) atteso ${atteso}, ottenuto ${alAperto(t)}`);
}
for (const id of ['T2', 'T6']) {
  const t = tile(ep1, id);
  if (alAperto(t) !== false) no(`alAperto(ep1:${id}) atteso false, ottenuto ${alAperto(t)}`);
}

// Fix Task 8/ep8 (29/09/2026): alAperto() testava la riga dei tetti isolata,
// ignorando che «tettoia» contiene «tetto» ma «chiatt» (acqua) vince prima
// nell'elenco ordinato — stessa logica di fuoriDichiarato(), ora condivisa.
// «La Tettoia delle Chiatte» e' coperta, con due uscite vere: non e' un tetto.
const ep8 = JSON.parse(readFileSync('webapp/data/ep8.json', 'utf8')).tessere;
const ep8t2 = tile(ep8, 'T2');
if (alAperto(ep8t2) !== false) no(`alAperto(ep8:T2 «La Tettoia delle Chiatte») atteso false, ottenuto ${alAperto(ep8t2)}`);
if (fuoriDichiarato(ep8t2) !== 'acqua') no(`fuoriDichiarato(ep8:T2) atteso 'acqua', ottenuto ${fuoriDichiarato(ep8t2)}`);

// ---- Task 9 (prova delle 21 spedizioni, 05/10/2026) ----------------------
// 1) il campo `aperto` della tessera vince sulla regola del nome, come
// `pavimento`. Il nome dice tetti ma la stanza e' chiusa (e viceversa).
const nome = (n, extra = {}) => ({ nome: n, id: 'T1', ...extra });
if (alAperto(nome('IL TETTO')) !== true) no('alAperto(«IL TETTO») atteso true');
if (alAperto(nome('IL TETTO', { aperto: false })) !== false) no('aperto=false deve forzare la stanza chiusa');
if (alAperto(nome('UNA CAMERA', { aperto: true })) !== true) no('aperto=true deve forzare la stanza aperta');
if (tile(ep11, 'T1').aperto !== false) no('ep11:T1 deve portare aperto=false fino ai dati (export-data.py)');
if (fuoriDichiarato(tile(ep11, 'T1')) !== 'tetti') no('ep11:T1 dichiara ancora «tetti» come fuori (solo i muri cambiano)');

// 2) «riva» come PAROLA, non come pezzo di «privato»: «Lo Studio Privato di
// M.» (ep18 T4, stanza di palazzo) usciva pavimento di assi e, peggio,
// fuoriDichiarato 'acqua' => il margine dell'INTERO episodio era un'onda.
const ep18 = JSON.parse(readFileSync('webapp/data/ep18.json', 'utf8')).tessere;
const ep18t4 = tile(ep18, 'T4');
if (fuoriDichiarato(ep18t4) !== null) no(`fuoriDichiarato(ep18:T4 «Studio Privato») atteso null, ottenuto ${fuoriDichiarato(ep18t4)}`);
if (pavimentoDi(ep18t4) !== 'tappeto') no(`pavimentoDi(ep18:T4) atteso 'tappeto', ottenuto ${pavimentoDi(ep18t4)}`);
if (fuoriDichiarato(nome('LA RIVA DEL FIUME')) !== 'acqua') no('«La riva» vera deve restare acqua');
if (pavimentoDi(nome('LA RIVA')) !== 'assi') no('«La riva» vera deve restare banchina di assi');

// 3) «Fondamenta STRETTA» (ep12 T3) e' un selciato, non una banchina di
// assi; «fondamenta» da sola (o «fondamenta» di un edificio) resta assi.
const ep12t3 = tile(JSON.parse(readFileSync('webapp/data/ep12.json', 'utf8')).tessere, 'T3');
if (pavimentoDi(ep12t3) !== 'lastricato') no(`pavimentoDi(ep12:T3 «Fondamenta stretta») atteso 'lastricato', ottenuto ${pavimentoDi(ep12t3)}`);
if (pavimentoDi(nome('LE FONDAMENTA DELLA TORRE')) !== 'assi') no('«Fondamenta» generica deve restare assi');
if (fuoriDi(ep12t3) !== 'acqua') no(`fuoriDi(ep12:T3) deve restare 'acqua', ottenuto ${fuoriDi(ep12t3)}`);

console.log(guai ? `FAIL ${guai}` : `OK ${n} tessere, pavimento e fuori invariati`);
process.exit(guai ? 1 : 0);
