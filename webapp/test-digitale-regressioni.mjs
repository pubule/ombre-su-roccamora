// Regressioni della modalita' DIGITALE (bug visti in playtest).
//   (B) a eroi finiti, il turno del PNG scortato dev'essere OFFERTO: si muove nel
//       turno degli eroi, e se il pannello propone solo «fase minaccia» non arriva mai.
//   (C) la fase nemici committa tutto lo stato PRIMA di animare (cosi' un reload
//       trova una fase eroi coerente): il board va pero' disegnato com'era a inizio
//       fase, altrimenti chi cade a meta' animazione risulta gia' a terra e si vedono
//       i nemici accanirsi su un corpo.
// Uso: node webapp/server.js (altrove) ; node webapp/test-digitale-regressioni.mjs
import { chromium } from 'playwright';
const BASE = 'http://localhost:8017';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => console.log('!! pageerror:', e.message));
await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
let ko = 0; const check = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };
// stesso troncamento di primo() in digitale.js: «DOTT. ATTILIO MARN» -> «attilio»
const primoNome = (n) => { const t = n.split(' ').filter(Boolean); return (t[0] === 'DOTT.' || t[0] === 'PADRE' ? t[1] : t[0]).toLowerCase(); };

const entra = async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  await page.getByText('Il Coro Sommerso').first().click();
  await page.waitForTimeout(250);
  if (await page.locator('#continua').count()) { await page.locator('#continua').click(); await page.waitForTimeout(200); }
  if (await page.locator('#via').count()) { await page.locator('#via').click(); await page.waitForTimeout(350); }
};
const patch = (fn) => page.evaluate(`(${fn})(JSON.parse(localStorage.getItem('osr.partita.ep1')))`);
const stato = () => page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')).spedizione);

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  localStorage.clear();
  return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
    const party = c.eroi.slice(0, 3).map((e) => e.nome);
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
        oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
        note: '', risposte: ['', '', '', ''], chiusa: true },
      spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null },
    }));
  });
});
await entra();

console.log('\n(D) i nemici non si fermano sulla casella del PNG scortato');
// Regolamento: alleati e PNG scortato si ATTRAVERSANO, non ci si ferma sopra —
// lo dichiara il commento di `occupati` in digitale.js. L'IA nemica usava lo
// stesso insieme per il cammino E per l'arrivo, quindi si fermava SOPRA la
// pedina del PNG (visto in diagnostica: «ADEPTO@3,1» con Ruggero a (3,1)).
// Scenario deterministico: il PNG occupa l'unica casella libera adiacente
// all'unico eroe vivo e il cammino corto del nemico ci passa sopra. Serve lo
// stato azzerato (round/canto), altrimenti le carte extra dei casi precedenti
// schierano altri nemici e lo scenario non e' piu' controllato.
{
  await patch(`(p) => { const sp = p.spedizione; const [a, b, c] = p.party;
    const T = sp.eroiPos[a].t;
    sp.eroiPos[a] = { t: T, x: 0, y: 0 };
    sp.eroiPos[b] = { t: T, x: 3, y: 3 }; sp.vite[b] = 0;
    sp.eroiPos[c] = { t: T, x: 2, y: 3 }; sp.vite[c] = 0;
    sp.scortati = [{ liberato: true, pos: { t: T, x: 1, y: 0 }, mosso: false }];
    sp.scortAttivo = null;
    sp.nemici = [{ nome: 'LO SGHERRO', num: 1, ferite: 0, max: 2, pos: { t: T, x: 3, y: 0 } }];
    sp.fase = 'eroi'; sp.eroiFatti = [...p.party]; sp.eroiAttivo = null; sp.azioni = {};
    localStorage.setItem('osr.partita.ep1', JSON.stringify(p)); }`);
  await entra();
  const pre = await stato();
  const png = pre.scortati[0].pos;
  check(pre.nemici.length === 1, `parte un solo nemico (trovati ${pre.nemici.length})`);
  const c1 = async (sel) => (await page.locator(sel).count()) > 0;
  if (await c1('#fase-minaccia')) { await page.locator('#fase-minaccia').click({ force: true }); await page.waitForTimeout(600); }
  for (let k = 0; k < 8; k++) {
    let fatto = false;
    for (const sel of ['.scelta-overlay .scelta-btn', '#dadi-lancia', '#dadi-chiudi', '#ins-risolvi', '#ok-msg']) {
      if (await c1(sel) && await page.locator(sel).first().isVisible().catch(() => false)) {
        await page.locator(sel).first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(400); fatto = true; break;
      }
    }
    if (!fatto) break;
  }
  if (await c1('#salta-nemici')) await page.locator('#salta-nemici').click({ force: true });
  await page.waitForTimeout(1800);
  const post = await stato();
  const dove = (post.nemici || []).map((n) => n.nome.split(' ')[0] + '@' + (n.pos ? n.pos.x + ',' + n.pos.y : '-'));
  // senza queste due, il caso passerebbe anche se la fase nemici non fosse mai
  // stata eseguita: la prova sarebbe vacua
  check(post.round > pre.round, `la fase nemici e' stata giocata (round ${pre.round} -> ${post.round})`);
  const mosso = (post.nemici || []).some((n) => n.pos && !(n.pos.x === 3 && n.pos.y === 0));
  check(mosso, `il nemico si e' mosso dalla partenza (3,0) — posizioni: ${JSON.stringify(dove)}`);
  const sopra = (post.nemici || []).filter((n) => n.pos && n.pos.t === png.t && n.pos.x === png.x && n.pos.y === png.y);
  check(sopra.length === 0, `nessun nemico sulla casella del PNG (${png.x},${png.y}) — posizioni: ${JSON.stringify(dove)}`);
}

console.log('\n(A) chi rianima tiene il turno (non se lo fa rubare dal rianimato)');
// condizione del playtest: nessun eroe «fissato» (sp.eroiAttivo nullo, com\'e\'
// dopo finisciEroe), quindi l\'attivo lo decide il fallback sull\'ordine del
// party. Elena ha gia\' agito, Attilio e\' a terra -> tocca a Sibilla; se
// rianimare rimette Attilio fra i vivi, lui sta PRIMA nell\'ordine e ruberebbe
// il turno a Sibilla con un\'azione ancora in mano.
await patch(`(p) => { const sp = p.spedizione; const [elena, att, sib] = p.party;
  for (const n of p.party) sp.vite[n] = 6;   // stato pulito: il caso (D) ne lascia due a terra
  sp.nemici = [];
  sp.vite[att] = 0;
  const s = sp.eroiPos[sib];
  sp.eroiPos[att] = { t: s.t, x: s.x + 1 <= 3 ? s.x + 1 : s.x - 1, y: s.y };
  sp.eroiAttivo = null; sp.eroiFatti = [elena]; sp.azioni = {};
  sp.scortati = []; sp.scortAttivo = null;
  localStorage.setItem('osr.partita.ep1', JSON.stringify(p)); }`);
await entra();
const party = await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')).party);
const [, ATT, SIB] = party;
const pannello = async () => (await page.locator('.pannello h2').allTextContents()).find((t) => t.startsWith('azioni di')) || '(nessuno)';
check(party.indexOf(ATT) < party.indexOf(SIB), `Attilio precede Sibilla nell'ordine del party: ${JSON.stringify(party)}`);
check((await pannello()).includes(primoNome(SIB)), `prima della rianimazione tocca a Sibilla — ${await pannello()}`);
check(await page.locator('#az-rianimare').count() > 0, 'il bottone Rianimare e\' disponibile');
await page.locator('#az-rianimare').click(); await page.waitForTimeout(400);
check((await pannello()).includes(primoNome(SIB)), `dopo la rianimazione tocca ANCORA a Sibilla — ${await pannello()}`);
const azA = (await stato()).azioni;
check(JSON.stringify(azA[SIB]) === '["rianimare"]', `Sibilla ha speso 1 azione su 2: ${JSON.stringify(azA)}`);

console.log('\n(B) tutti gli eroi hanno finito, Ruggero libero e non mosso');
await patch(`(p) => { const sp = p.spedizione; const s = sp.eroiPos[p.party[0]];
  sp.scortati = [{ liberato: true, pos: { t: s.t, x: s.x, y: (s.y + 1) % 4 }, mosso: false }];
  sp.scortAttivo = null; sp.fase = 'eroi'; sp.eroiFatti = [...p.party]; sp.eroiAttivo = null;
  localStorage.setItem('osr.partita.ep1', JSON.stringify(p)); }`);
await entra();
const testo = await page.locator('.pannello').filter({ has: page.locator('#fase-minaccia') }).first().innerText();
check(/ruggero/i.test(testo), 'il pannello nomina Ruggero: ' + JSON.stringify(testo.split('\n')[0].slice(0, 90)));
const btn = page.locator('[data-scortato-chip]').last();
check(await btn.count() > 0, 'c\'e\' il bottone «muovi ruggero»');
await btn.click({ force: true }); await page.waitForTimeout(300);
check((await stato()).scortAttivo === 0, 'il click apre il turno di Ruggero');
check(await page.locator('.cella-mossa').count() > 0, 'ci sono celle verdi per muoverlo');

console.log('\n(C) animazione nemici: chi cade non e\' gia\' a terra a inizio animazione');
// il colpo del nemico e' un tiro di dadi: si ripete finche' l'eroe cade davvero,
// altrimenti il campione non dice nulla
let campioni = [], caduto = false, eroeA = null;
for (let tentativo = 1; tentativo <= 8 && !caduto; tentativo++) {
await patch(`(p) => { const sp = p.spedizione; const [a, b, c] = p.party;
  const T = sp.eroiPos[a].t;
  sp.vite[a] = 1;                       // basta un colpo per farlo cadere
  sp.eroiPos[a] = { t: T, x: 1, y: 1 };
  sp.eroiPos[b] = { t: T, x: 3, y: 3 }; sp.eroiPos[c] = { t: T, x: 2, y: 3 };
  sp.nemici = [{ nome: 'ADEPTO INCAPPUCCIATO', num: 1, ferite: 0, max: 2, pos: { t: T, x: 1, y: 2 } }];
  sp.fase = 'eroi'; sp.eroiFatti = [...p.party]; sp.eroiAttivo = null; sp.round = 1;
  sp.scortati = []; sp.scortAttivo = null;
  localStorage.setItem('osr.partita.ep1', JSON.stringify(p)); }`);
await entra();
eroeA = (await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')).party))[0];
await page.locator('#fase-minaccia').click({ force: true });
// smaltisce le carte Minaccia (con eventuale insidia) finche' non ricompare il board
const leggi = () => page.evaluate((nm) => {
  const el = document.querySelector(`[data-eroe="${nm}"]`);
  return el ? (el.classList.contains('giu') ? 'giu' : 'in-piedi') : '-';
}, eroeA);
for (let i = 0; i < 40 && (await leggi()) === '-'; i++) {
  for (const sel of ['#ins-risolvi', '#dadi-lancia', '#dadi-ok', '#ok-msg']) {
    if (await page.locator(sel).count()) { await page.locator(sel).first().click({ force: true }).catch(() => {}); await page.waitForTimeout(200); }
  }
  await page.waitForTimeout(200);
}
// campiona la classe «giu» del token mentre l'animazione scorre
campioni = [];
for (let i = 0; i < 30; i++) { campioni.push(await leggi()); await page.waitForTimeout(150); }
caduto = ((await stato()).vite[eroeA] ?? 1) <= 0;
console.log(`   tentativo ${tentativo}: ${campioni.join(' ').replace(/(\S+)(?: \1)+/g, '$1×')}${caduto ? '  <- e\' caduto' : '  (non colpito, ritento)'}`);
}
if (!caduto) { console.log('   IMPOSSIBILE far cadere l\'eroe in 8 tentativi: prova non conclusiva'); ko++; }
else {
  check(campioni[0] === 'in-piedi', 'a inizio animazione l\'eroe e\' ancora in piedi (non gia\' a terra)');
  check(campioni.includes('giu'), 'diventa «a terra» durante l\'animazione, quando lo colpiscono');
  check(campioni[campioni.length - 1] === 'giu', 'a fine animazione il token riflette lo stato reale');
}

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTUTTO OK');
process.exit(ko ? 1 : 0);
