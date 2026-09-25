// webapp/test-stanza.mjs — la stanza composta rispetta il gioco: i muri si
// aprono dove portaCella mette la porta, nessun decoro copre un arredo o una
// porta, e lo stesso input da' sempre lo stesso disegno.
import { readFileSync, readdirSync } from 'fs';
import { stanzaHtml, decoriDi } from './public/js/plancia/stanza.js';
import { portaCella, dirExit } from './public/motore/griglia.js';
import { alAperto } from './public/motore/ambiente.js';
let guai = 0; const no = (m) => { guai++; console.error('  ' + m); };
const eps = readdirSync('webapp/data').filter((f) => /^(ep\d+|preludio)\.json$/.test(f));
for (const f of eps) {
  const ep = JSON.parse(readFileSync('webapp/data/' + f, 'utf8'));
  for (const t of ep.tessere) {
    const opz = { cell: 100, rivelata: () => false };
    const a = stanzaHtml(ep, t, opz), b = stanzaHtml(ep, t, opz);
    if (a.html !== b.html) no(`${f}:${t.id} non deterministica`);
    // una porta chiusa per uscita, nella casella di portaCella (non sui tetti)
    for (const [dir, raw] of Object.entries(t.exits || {})) {
      const [gx, gy] = portaCella(t, dir);
      const c = a.html.includes(`data-porta="${dir}:${gx},${gy}"`);
      if (!alAperto(t) && !c) no(`${f}:${t.id} porta ${dir}→${dirExit(raw)} non in ${gx},${gy}`);
      if (alAperto(t) && c) no(`${f}:${t.id} porta disegnata sui tetti`);
    }
    // a stanze accanto gia' aperte, nessun battente (e' il passaggio libero)
    if ((stanzaHtml(ep, t, { cell: 100, rivelata: () => true }).html.match(/data-porta=/g) || []).length) no(`${f}:${t.id} battente disegnato verso una stanza aperta`);
    // muri: 16 tratti meno le porte al chiuso, nessuno sui tetti — con alAperto,
    // non con fuoriDi: fuoriDi da' 'vuoto' anche alla sala delle casse
    const muri = (a.html.match(/data-muro=/g) || []).length;
    const attesi = alAperto(t) ? 0 : 16 - Object.keys(t.exits || {}).length;
    if (muri !== attesi) no(`${f}:${t.id} muri ${muri}, attesi ${attesi}`);
    // decori mai su arredi o porte (eccezione: `sopra: true` su un arredo superficie)
    const arr = {}; for (const [x, y, n] of t.arredi || []) arr[`${x},${3 - y}`] = n;
    const occ = new Set(Object.keys(arr));
    for (const dir of Object.keys(t.exits || {})) { const [x, y] = portaCella(t, dir); occ.add(`${x},${3 - y}`); }
    const SUPERFICI = /scrivania|altare|toeletta/i;
    for (const d of decoriDi(ep, t)) {
      const k = `${Math.floor(d.x)},${Math.floor(d.y)}`;
      if (occ.has(k) && !(d.sopra && arr[k] && SUPERFICI.test(arr[k]))) no(`${f}:${t.id} decoro ${d.pezzo} su casella occupata ${k}`);
    }
  }
}
// porta NON alla seconda casella: una tessera con arredo in [1,3] e uscita N
{ const t = { id: 'TX', nome: 'SALA', exits: { N: 'TY' }, arredi: [[1, 3, 'casse']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  const [gx, gy] = portaCella(t, 'N');           // [2,3]
  if (gx !== 2 || !html.includes(`data-porta="N:2,3"`)) no('porta con arredo davanti: non spostata'); }
// scale non in quadrato: niente scalinata 2x2
{ const t = { id: 'TS', nome: 'SALA', exits: {}, arredi: [[0, 0, 'scala'], [2, 2, 'scala']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  if (html.includes('muri/scale.png')) no('scalinata 2x2 su scale sparse'); }
// coppia VERTICALE di altari: due sprite, non uno largo
{ const t = { id: 'TA', nome: 'CRIPTA', exits: {}, arredi: [[1, 1, 'altare'], [1, 2, 'altare']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  if ((html.match(/arredi\/altare/g) || []).length !== 2) no('coppia verticale fusa'); }

console.log(guai ? `FAIL ${guai}` : 'OK stanze composte su tutte le tessere');
process.exit(guai ? 1 : 0);
