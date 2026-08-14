// LE MIGLIORIE SI VEDONO E SI TOCCANO, nell'app vera.
//
// `test-migliorie.mjs` prova il motore; questo prova la META' CHE MANCAVA. Il
// difetto storico di questo progetto non e' una regola sbagliata, e' una regola
// giusta che nessuna vista chiama mai: tre abilita' sono state per mesi
// «carica spesa, effetto narrato» (AUDIT-CLASSI.md §5), e nove oggetti
// personali sono ancora oggi stampati sulla scheda e inerti. Un motore che
// accetta `arma: 'revolver'` mentre nessun bottone lo manda e' esattamente
// quella cosa li'.
//
// Vuole il server: node webapp/server.js ; node webapp/test-migliorie-app.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.OSR_BASE || 'http://localhost:8017';
const EP = JSON.parse(fs.readFileSync('webapp/data/ep1.json', 'utf8'));
const COM = JSON.parse(fs.readFileSync('webapp/data/comune.json', 'utf8'));
const ELENA = COM.eroi.find((e) => e.nome.includes('ELENA')).nome;
const OTTONE = COM.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const CARTA = COM.eroi.find((e) => e.nome === ELENA);

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const b = await chromium.launch();
const pg = await b.newPage();
pg.on('pageerror', (e) => { console.error('FAIL: errore JS —', e.message); ko++; });

const CHIAVE = 'osr.partita.ep1';
const P = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k)), CHIAVE);

// scioglie gli overlay (testo della tessera, dadi): finche' c'e' quello, la
// plancia non si vede e ogni conteggio di bottoni misura la schermata sbagliata
// Scioglie quel che si mette davanti alla plancia: il testo della tessera, e i
// DADI. Al tavolo ogni tiro si dichiara o si fa tirare all'app (`#dadi-app`) —
// e' la modalita' unica dal 14/08/2026, quindi anche un colpo di Revolver
// passa di li'. Senza questo passaggio la sonda vedeva l'azione «non spesa» e
// dava la colpa al motore.
async function sciogli() {
  for (let i = 0; i < 10; i++) {
    const fatto = await pg.evaluate(() => {
      const app2 = document.querySelector('#dadi-app');
      if (app2 && app2.offsetParent !== null) { app2.click(); return true; }
      const lancia = document.querySelector('#dadi-lancia');
      if (lancia && lancia.offsetParent !== null) { lancia.click(); return true; }
      const chiudi = document.querySelector('#dadi-chiudi');
      if (chiudi && chiudi.offsetParent !== null) { chiudi.click(); return true; }
      const b2 = [...document.querySelectorAll('button')]
        .filter((x) => /^(continua|ho letto|chiudi)/i.test(x.textContent.trim()));
      b2.forEach((x) => x.click()); return b2.length > 0;
    });
    if (!fatto) break;
    await pg.waitForTimeout(450);
  }
  await pg.waitForTimeout(500);
}

async function entra() {
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
  await pg.getByText(EP.titolo).first().click().catch(() => {});
  for (const id of ['#continua', '#via']) await pg.locator(id).click({ timeout: 4000 }).catch(() => {});
  await sciogli();
}

async function apparecchia(mig, cic = {}) {
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(({ k, party, mig: m, cic: c, ogg }) => {
    localStorage.clear();
    localStorage.setItem(k, JSON.stringify({
      v: 1, episodio: 'ep1', plancia: 'schermo', party, creata: Date.now(), fase: 'spedizione',
      migliorie: m, cicatrici: c,
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
        oggetti: ogg, reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
        note: '', risposte: ['', '', '', ''], chiusa: true },
      vantaggi: { tier: 'preparati', dossier: false, risposte: [false, false, false, false] },
      spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null },
    }));
  }, { k: CHIAVE, party: [ELENA, OTTONE], mig, cic, ogg: EP.oggetti_indagine || [] });
  await entra();
}

// Un bersaglio a due caselle. Al round 1 il campo e' vuoto — i nemici arrivano
// con la Fase Minaccia — quindi si semina e si RIENTRA: ricaricare riporta alla
// home, e si finirebbe a contare i bottoni della schermata sbagliata.
async function conBersaglio() {
  await pg.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k));
    const nm = Object.keys(p.spedizione.eroiPos)[0];
    const q = p.spedizione.eroiPos[nm];
    p.spedizione.nemici.push({ nome: 'LO SGHERRO', pos: { t: q.t, x: q.x, y: (q.y + 2) % 4 },
                               ferite: 0, max: 2 });
    localStorage.setItem(k, JSON.stringify(p));
  }, CHIAVE);
  await entra();
}

const bottoni = () => pg.evaluate(() => [...document.querySelectorAll('button')]
  .map((x) => x.textContent.trim()).filter(Boolean));

// --------------------------------------------------------- FIBRA, a schermo
{
  await apparecchia({});
  const v0 = (await P()).spedizione.vite[ELENA];
  await apparecchia({ [ELENA]: ['fibra', 'fibra', 'fibra'] });
  const v1 = (await P()).spedizione.vite[ELENA];
  ok(v1 === v0 + 3, `tre Fibre valgono +3 Salute nella partita vera (${v0} → ${v1})`);
  ok(v0 === CARTA.salute + 2, `e senza migliorie e' quella stampata piu' i bonus di sempre (${v0})`);
}

// ------------------------------------------------------- IL REVOLVER, a mano
{
  await apparecchia({});
  await conBersaglio();
  ok(!(await bottoni()).some((t) => /spara/i.test(t)),
     'senza Revolver non c\'e' + ' nessun bottone per sparare');

  await apparecchia({ [ELENA]: ['revolver'] });
  ok(!(await bottoni()).some((t) => /spara/i.test(t)),
     'e col Revolver ma senza bersagli in campo, nemmeno');

  await conBersaglio();
  ok((await bottoni()).some((t) => /spara/i.test(t)),
     'col Revolver e un bersaglio a due caselle, il bottone c\'e' + '');

  // e SPARA davvero: il colpo parte, spende l'azione, e il diario lo dice
  await pg.locator('#az-sparare').click();
  await pg.waitForTimeout(500);
  ok(await pg.locator('.scelta-overlay').count() > 0,
     'il Revolver chiede a chi sparare, invece di scegliere da solo');
  await pg.locator('.scelta-btn:not(.annulla)').first().click();
  await pg.waitForTimeout(1200);
  await sciogli();
  const p = await P();
  ok((p.spedizione.azioni[ELENA] || []).includes('attaccare'),
     'sparare spende l\'azione di attacco anche passando dalla vista');
  ok(p.spedizione.log.some((r) => /revolver/i.test(r)) || p.spedizione.log.some((r) => /elena/i.test(r)),
     'e il colpo finisce nel diario');
  ok(await pg.locator('#az-sparare').count() === 0,
     'e dopo aver sparato il bottone sparisce: non si spara due volte');
}

// --------------------------------------------- LE CARICHE: garze e passo
// Si guardano i BOTTONI e non il testo della pagina: la striscia delle cariche
// vive in un pannello che in modo immersivo sta ripiegato, e `innerText` non
// vede quel che e' ripiegato — una sonda sul testo direbbe «non c'e'» anche
// quando c'e', e peggio, direbbe «c'e'» il giorno che smette di funzionare.
{
  await apparecchia({ [ELENA]: ['garze', 'passo'] });
  await conBersaglio();
  const voci = await pg.evaluate(() => [...document.querySelectorAll('[data-mig]')]
    .map((x) => x.dataset.voce).sort());
  ok(JSON.stringify(voci) === '["garze","passo"]',
     `la Borsa e il Passo hanno il loro bottone (${JSON.stringify(voci)})`);

  await apparecchia({});
  await conBersaglio();
  ok(await pg.locator('[data-mig]').count() === 0, 'e chi non le ha non le vede');

  // E SI PREMONO. Un bottone che c'e' e non e' agganciato passa qualunque
  // controllo sulla sua presenza: e' precisamente il difetto che questo banco
  // esiste per prendere, quindi la Borsa va usata davvero.
  await apparecchia({ [ELENA]: ['garze'] });
  await pg.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k));
    const feriti = Object.keys(p.spedizione.vite);
    p.spedizione.vite[feriti[1]] = 2;            // il compagno adiacente, ferito
    localStorage.setItem(k, JSON.stringify(p));
  }, CHIAVE);
  await entra();
  // La striscia delle cariche sta nel pannello `.secondario`, che il modo
  // immersivo ripiega (`.immersivo .secondario {display:none}`): vale per TUTTE
  // le abilita', non solo per queste. Si spegne l'immersivo col ⤢, come fa chi
  // gioca — cliccare un elemento invisibile dal DOM proverebbe una cosa che al
  // tavolo non si puo' fare.
  await pg.evaluate(() => document.getElementById('app').classList.remove('immersivo'));
  const prima = (await P()).spedizione.vite[OTTONE];
  await pg.locator('[data-mig][data-voce="garze"]').first().click();
  await pg.waitForTimeout(500);
  await pg.locator('.scelta-btn:not(.annulla)').first().click().catch(() => {});
  await pg.waitForTimeout(900);
  await sciogli();
  const p2 = await P();
  ok(p2.spedizione.vite[OTTONE] === prima + 2,
     `le garze curano davvero premendo il bottone (${prima} → ${p2.spedizione.vite[OTTONE]})`);
  ok((p2.spedizione.migUsi || {})[ELENA]?.garze === 1, 'e la carica si spende');
}

// ------------------------------------------------ LA SCHEDA DELL'EROE cresciuto
{
  await apparecchia({ [ELENA]: ['tempra:vigore', 'tempra:vigore'] }, { [ELENA]: ['acume'] });
  await pg.locator(`[data-scheda="${ELENA}"]`).first().click();
  await pg.waitForTimeout(600);
  ok(await pg.locator('.eroe-stats').count() > 0, 'la scheda dell\'eroe si apre');
  const t = await pg.evaluate(() =>
    [...document.querySelectorAll('.eroe-stats .stat')].map((x) => x.innerText.replace(/\s+/g, ' ')).join(' | '));
  const vig = (t.match(/vigore (\d)/i) || [])[1];
  const acu = (t.match(/acume (\d)/i) || [])[1];
  ok(vig === String(CARTA.vigore + 2),
     `la scheda mostra il VIGORE cresciuto (${CARTA.vigore} + 2 = ${CARTA.vigore + 2}, letto ${vig})`);
  ok(acu === String(CARTA.acume - 1),
     `e l'ACUME segnato dalla cicatrice (${CARTA.acume} − 1 = ${CARTA.acume - 1}, letto ${acu})`);
}

await b.close();
console.log(ko === 0 ? 'TUTTO OK (migliorie nell\'app)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
