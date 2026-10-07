// I NEMICI NEL BUIO: fuori dalla luce di lanterne e torce un nemico e' solo due occhi (`.nel-buio`);
// alla luce e' la pedina piena. Quando un eroe gli si avvicina con la lanterna, torna visibile.
//
// Uso:  node webapp/server.js ; node webapp/test-nemici-buio-ui.mjs
import { chromium } from 'playwright';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1600, height: 780 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.evaluate(async () => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
  const partita = { v: 1, episodio: 'preludio', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 4, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1', 'T2', 'T4'],
      stanzeLette: ['T1', 'T2', 'T4'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T2', x: 1, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0], scortati: [{ liberato: false, pos: null, mosso: false }],
      mazzo: { ordine: [0], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, provaVento: { round: 4, chi: [] },
      nemici: [{ nome: 'LO SGHERRO', num: 1, ferite: 0, max: 2, pos: { t: 'T2', x: 2, y: 1 } },
               { nome: 'IL SICARIO', num: 1, ferite: 0, max: 1, pos: { t: 'T4', x: 0, y: 1 } }] } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
});
await pg.waitForSelector('.tok-board.nemico');
await pg.waitForTimeout(600);
const stato = () => pg.evaluate(() => Object.fromEntries([...document.querySelectorAll('.tok-board.nemico')]
  .map((e) => [e.title.split(' ')[1], e.classList.contains('nel-buio')])));
let s = await stato();
ok(s.SGHERRO === false, 'lo sgherro accanto ad Attilio e alla luce: pedina piena');
ok(s.SICARIO === true, 'il sicario lontano da lanterne e torce e nel buio: solo gli occhi');
ok(await pg.locator('.tok-board.nemico.nel-buio .occhi b').count() === 2, 'nel buio restano due occhi');

// Attilio porta la lanterna vicino al sicario
await pg.evaluate(async () => {
  window.__partita.spedizione.eroiPos['DOTT. ATTILIO MARN'] = { t: 'T4', x: 1, y: 1 };
  (await import('/js/digitale.js'))._motore.render();
});
await pg.waitForTimeout(600);
s = await stato();
ok(s.SICARIO === false, 'con la lanterna di Attilio accanto il sicario torna visibile');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
