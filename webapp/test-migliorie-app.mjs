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

// ------------------------------------ CHI SPUNTA COSA: telefono contro arbitro
// La crescita e' una scheda, e la scheda e' di chi la gioca: dal telefono si
// spuntano le proprie caselle e le altre si leggono. Chi arbitra le spunta
// tutte, perche' tiene in mano gli eroi che nessuno ha reclamato — e perche'
// quando si gioca in due davanti a uno schermo solo la mano e' una.
//
// Si prova il MODULO dentro la pagina, e non l'epilogo guidato a mano, per una
// ragione precisa: un giocatore alla serata NON ci arriva dall'archivio. Il suo
// telefono aspetta che chi arbitra apra l'episodio ed entra dal tavolo vivo,
// che vuole un `wrangler dev` e un Durable Object — e' il mestiere di
// `test-eroe.mjs`. La domanda qui e' piu' stretta, «chi puo' toccare quali
// caselle», e vive tutta in `crescitaHtml`: localStorage ce l'ha, e il posto lo
// riceve come argomento.
async function chiPuo(permessi, crescita = {}) {
  return pg.evaluate(async ({ party, permessi: p, crescita: c }) => {
    localStorage.clear();
    localStorage.setItem('osr.crescita.', JSON.stringify(c));
    // una serata vinta = un punto a testa, o non ci sarebbe niente da offrire
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', party, spedizione: { esito: 'vittoria' },
    }));
    const m = await import('/js/crescita-scelta.js');
    const html = m.crescitaHtml(party, (nm) => p.includes(nm), null);
    const box = document.createElement('div');
    box.innerHTML = html;
    return {
      riquadro: !!box.querySelector('#riq-crescita'),
      eroi: [...new Set([...box.querySelectorAll('[data-cresce]')].map((x) => x.dataset.cresce))],
      testo: box.textContent,
    };
  }, { party: [ELENA, OTTONE], permessi, crescita });
}

{
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' });

  const tel = await chiPuo([ELENA]);
  ok(tel.riquadro, 'dal telefono la crescita si vede');
  ok(JSON.stringify(tel.eroi) === JSON.stringify([ELENA]),
     `e si spuntano solo le caselle del proprio eroe (${JSON.stringify(tel.eroi)})`);
  ok(/OTTONE/.test(tel.testo),
     'ma la compagnia si legge tutta: la crescita degli altri non è un segreto');
  ok(/Spuntate le vostre/i.test(tel.testo),
     'e lo dice, invece di lasciar credere che i bottoni manchino per un guasto');

  const arb = await chiPuo([ELENA, OTTONE]);
  ok(arb.eroi.length === 2, `chi arbitra le spunta tutte (${JSON.stringify(arb.eroi)})`);
  ok(!/Spuntate le vostre/i.test(arb.testo), 'e a lui quell’avviso non serve');

  const nessuno = await chiPuo([]);
  ok(nessuno.eroi.length === 0, 'chi non ha posto guarda e basta');

  // I PUNTI SONO A TESTA, non un salvadanaio comune: il Regolamento dice «una
  // casella A TESTA dopo ogni episodio riuscito». Con un punto per uno, se
  // ELENA lo spende OTTONE deve avere ancora il suo.
  const dopo = await chiPuo([ELENA, OTTONE], { [ELENA]: { voci: ['lanterna'], cicatrici: [] } });
  ok(dopo.eroi.includes(OTTONE), 'speso il punto di un eroe, quello del compagno resta suo');
  ok(!dopo.eroi.includes(ELENA), 'e chi l’ha speso non ne ha un altro');

  // E CHE LA VISTA GLIELO PASSI DAVVERO. Le prove qui sopra chiamano
  // `crescitaHtml` con un predicato scritto da loro: se domani l'epilogo tornasse
  // a passare `() => true`, ognuna resterebbe verde e ogni telefono avrebbe i
  // poteri di chi arbitra. Distinguere i due casi giocando vorrebbe dire un
  // tavolo vivo — `wrangler dev` e un Durable Object — perche' senza posto si
  // arbitra, e con l'arbitro i due argomenti si comportano uguale. Finche'
  // quella prova non c'e', si guarda la riga: e' un controllo debole, ed e'
  // dichiarato tale, ma prende esattamente la regressione che nessun altro
  // prende. Precedente: `test-motore-purezza` legge i sorgenti allo stesso modo.
  const sorg = fs.readFileSync('webapp/public/js/digitale.js', 'utf8');
  const chiamata = (sorg.match(/crescitaHtml\([^)]*\)/) || [''])[0];
  ok(/crescitaHtml\(\s*ctx\.partita\.party\s*,\s*posso\s*,/.test(chiamata),
     `l’epilogo passa il predicato del posto, non un booleano (${chiamata || 'chiamata non trovata'})`);
}


await b.close();
console.log(ko === 0 ? 'TUTTO OK (migliorie nell\'app)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
