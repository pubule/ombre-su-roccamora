// Partite complete (Playwright): 6 giocate con party diversi sui 3 episodi,
// dall'ingresso in taverna fino alla busta e alla spedizione. Ogni giocata
// visita luoghi aperti e chiusi (chiave giusta), legge Approfondimenti coi
// vincoli veri delle cariche, controlla il conto delle ore, la chiusura per
// orario, la busta (risposte giuste E sbagliate) e il vantaggio.
//
// Uso:  node webapp/server.js   (in un altro terminale)
//       node webapp/test-partite.mjs [porta]
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.argv[2] || 8017;
const BASE = `http://localhost:${PORT}`;
const DIR = path.dirname(fileURLToPath(import.meta.url));
const json = (f) => JSON.parse(readFileSync(path.join(DIR, 'data', f), 'utf8'));
const DATI = { preludio: json('preludio.json'), ep1: json('ep1.json'), ep2: json('ep2.json') };

let errori = 0;
const ko = (msg) => { errori += 1; console.log('    KO', msg); };
const ok = (cond, msg) => { if (!cond) ko(msg); };

// party per cognome/nome sulla carta (data-nome = titolo carta Eroe)
const SCENARI = [
  { ep: 'preludio', party: ['Elena', 'Attilio'], giuste: true },
  { ep: 'preludio', party: ['Sibilla', 'Nino', 'Ottone', 'Carla', 'Lazzaro', 'Celso'], giuste: false },
  { ep: 'ep1', party: ['Elena', 'Ottavio', 'Carla', 'Sibilla'], giuste: true },
  { ep: 'ep1', party: ['Nino', 'Fulgenzio', 'Mora'], giuste: false },
  { ep: 'ep2', party: ['Elena', 'Attilio', 'Lazzaro', 'Celso', 'Ottone'], giuste: true },
  // 10 eroi = taglia massima consentita (il picker blocca l'11°)
  { ep: 'ep2', party: ['Elena', 'Attilio', 'Sibilla', 'Nino', 'Ottone', 'Carla',
                       'Lazzaro', 'Celso', 'Fulgenzio', 'Ottavio'], giuste: true },
];

const browser = await chromium.launch();

async function schermata(page) {
  // dove siamo? il primo selettore VISIBILE decide (l'overlay dei dadi resta
  // nel DOM ~350ms in dissolvenza: contare i nodi non basta)
  const sel = ['#dichiarazione', '.scelta-box button', '#dadi-lancia', '#fine-visita', '#ok-msg'];
  const inizio = Date.now();
  while (Date.now() - inizio < 8000) {
    for (const s of sel) {
      const el = page.locator(s).first();
      if (await el.count() && await el.isVisible()) return s;
    }
    await page.waitForTimeout(80);
  }
  return null;
}

async function tiraSeServe(page) {
  // overlay eroe -> tiro di dado -> scheda luogo
  let dove = await schermata(page);
  if (dove === '.scelta-box button') {
    const n = await page.locator('.scelta-box button:not(.annulla)').count();
    await page.locator('.scelta-box button:not(.annulla)').nth(Math.floor(Math.random() * n)).click();
    dove = await schermata(page);
  }
  if (dove === '#dadi-lancia') {
    await page.locator('#dadi-lancia').click();
    await page.locator('#dadi-chiudi').waitFor({ state: 'visible' });
    await page.locator('#dadi-chiudi').click();
    await page.locator('.dadi-overlay').waitFor({ state: 'detached' });
    dove = await schermata(page);
  }
  return dove;
}

async function stato(page, epId) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem('osr.partita.' + k)), epId);
}

for (const sc of SCENARI) {
  const ep = DATI[sc.ep];
  console.log(`\n=== ${sc.ep} — party di ${sc.party.length}, risposte ${sc.giuste ? 'giuste' : 'sbagliate'} ===`);
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const jsErrors = [];
  page.on('pageerror', (e) => jsErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') jsErrors.push(m.text()); });
  page.on('dialog', (d) => d.accept());

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator(`.tessera-episodio[data-ep="${sc.ep}"]`).click();
    await page.locator('.modo[data-modo="tavolo"]').click();
    await page.locator('#avanti').click();
    await page.locator('.carta-eroe').first().waitFor();
    for (const nome of sc.party) {
      await page.locator(`.carta-eroe[data-nome*="${nome}" i]`).first().click();
    }
    await page.locator('#inizia').click();
    await page.locator('.voce').first().waitFor();

    // strategia: prima gli aperti, poi i chiusi con la loro chiave
    const daVisitare = [...ep.luoghi].sort((a, b) => (b.aperto ? 1 : 0) - (a.aperto ? 1 : 0));
    let oreSpese = 0;
    let oggettiAttesi = 0;
    for (const l of daVisitare) {
      const st = await stato(page, sc.ep);
      if (st.indagine.ora >= 24) break;
      // chiusura per orario: dichiarata comunque, deve costare zero
      if (l.chiude != null && st.indagine.ora >= l.chiude) {
        await page.locator(`.voce[data-voce="${l.voce_mappa}"]`).click();
        await page.locator('#ok-msg').waitFor();
        const testo = await page.locator('.pannello').innerText();
        ok(/troppo tardi/i.test(testo), `${l.voce_mappa}: manca il "troppo tardi" oltre l'orario`);
        await page.locator('#ok-msg').click();
        const dopo = await stato(page, sc.ep);
        ok(dopo.indagine.ora === st.indagine.ora, `${l.voce_mappa}: ora spesa su luogo chiuso per orario`);
        continue;
      }
      await page.locator(`.voce[data-voce="${l.voce_mappa}"]`).click();
      let dove = await schermata(page);
      if (dove === '#dichiarazione') {
        ok(!l.aperto, `${l.voce_mappa}: chiede la chiave ma è un luogo aperto`);
        await page.locator('#dichiarazione').fill(l.chiave[1]);
        await page.locator('#prova').click();
        await page.locator('#ok-msg').waitFor();
        const testo = await page.locator('.barra .titolo').innerText();
        ok(/la porta si apre/i.test(testo), `${l.voce_mappa}: chiave "${l.chiave[1]}" non apre`);
        await page.locator('#ok-msg').click();
      } else {
        ok(l.aperto, `${l.voce_mappa}: entra senza chiave ma è un luogo chiuso`);
      }
      oreSpese += 1;
      const doveScheda = await tiraSeServe(page);
      ok(doveScheda === '#fine-visita', `${l.voce_mappa}: la scheda luogo non arriva (${doveScheda})`);
      if (doveScheda !== '#fine-visita') break;

      // approfondimenti: prova ogni tipo davvero presente nel luogo
      const scenaOk = (await stato(page, sc.ep)).indagine['scena_' + l.n];
      const tipi = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
      if (scenaOk) {
        for (const tipo of tipi) {
          await page.locator(`[data-tipo="${tipo}"]`).click();
          const doveA = await schermata(page);
          if (doveA === '.scelta-box button') {
            await page.locator('.scelta-box button:not(.annulla)').first().click();
            await page.locator('#ok-msg').waitFor();
          }
          await page.locator('#ok-msg').click();
          await page.locator('#fine-visita').waitFor();
        }
      }
      // carte da prendere: ogni oggetto del luogo finisce nell'inventario
      for (const o of l.oggetti || []) {
        await page.locator(`[data-oggetto="${o}"]`).click();
        await page.locator('#ok-msg').waitFor();
        await page.locator('#ok-msg').click();
        await page.locator('#fine-visita').waitFor();
        oggettiAttesi += 1;
      }
      await page.locator('#fine-visita').click();
      await page.locator('.voce').first().waitFor();
    }

    // conto delle ore: ogni luogo davvero visitato è costato 1 ora
    const st = await stato(page, sc.ep);
    ok(st.indagine.ora === 18 + oreSpese,
       `conto ore sballato: ${st.indagine.ora} invece di ${18 + oreSpese}`);
    ok(st.indagine.oggetti.length === oggettiAttesi,
       `oggetti in inventario: ${st.indagine.oggetti.length} invece di ${oggettiAttesi}`);
    console.log(`    ${st.indagine.visitati.length} luoghi visitati, ` +
                `${st.indagine.approfondimentiLetti.length} approfondimenti, ` +
                `${st.indagine.oggetti.length} oggetti, ora ${st.indagine.ora}:00`);

    // taccuino: risposte e busta
    await page.locator('#chiudi-indagine').click();
    const risposte = ep.soluzione.domande.map((d) => sc.giuste ? d.risposta : 'nebbia fitta');
    for (let i = 0; i < risposte.length; i++) {
      await page.locator(`[data-risposta="${i}"]`).fill(risposte[i]);
    }
    await page.locator('#apri-busta').click();     // confirm() accettato dal handler
    await page.locator('#alla-spedizione').waitFor();
    const esatte = await page.locator('.ok-txt').count();
    const sbagliate = await page.locator('.ko-txt').count();
    if (sc.giuste) ok(esatte === ep.soluzione.domande.length, `risposte giuste bocciate (${esatte}/${ep.soluzione.domande.length})`);
    else ok(sbagliate === ep.soluzione.domande.length, `risposte a caso promosse (${sbagliate} bocciate attese ${ep.soluzione.domande.length})`);
    const bustaTxt = await page.locator('.pannello').innerText();
    ok(/vantaggio d’indagine/i.test(bustaTxt), 'riepilogo vantaggio assente');
    ok(bustaTxt.includes(`${24 - st.indagine.ora} ore avanzate`), 'ore avanzate nel riepilogo non tornano');

    // alla spedizione
    await page.locator('#alla-spedizione').click();
    await page.getByText('la spedizione').first().waitFor();
    const fin = await stato(page, sc.ep);
    ok(fin.fase === 'spedizione' && fin.indagine.chiusa, 'la partita non passa alla fase spedizione');
    console.log(`    busta: ${esatte} esatte, ${sbagliate} sbagliate — fase ${fin.fase}`);
  } catch (e) {
    ko(`giocata interrotta: ${e.message.split('\n')[0]}`);
  }
  ok(jsErrors.length === 0, `errori JS: ${jsErrors.slice(0, 3).join(' | ')}`);
  await page.close();
}

await browser.close();
console.log(errori ? `\n${errori} CHECK FALLITI` : '\nTUTTO OK');
process.exit(errori ? 1 : 0);
