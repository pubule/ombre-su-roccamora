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

const PORT = process.argv.slice(2).find((a) => /^\d+$/.test(a)) || 8017;
const BASE = `http://localhost:${PORT}`;
const DIR = path.dirname(fileURLToPath(import.meta.url));
const json = (f) => JSON.parse(readFileSync(path.join(DIR, 'data', f), 'utf8'));
const DATI = { preludio: json('preludio.json'), ep1: json('ep1.json'), ep2: json('ep2.json'), ep3: json('ep3.json'), ep4: json('ep4.json'), ep5: json('ep5.json'), ep6: json('ep6.json'), ep7: json('ep7.json'), ep8: json('ep8.json'), ep9: json('ep9.json'), ep10: json('ep10.json'), ep11: json('ep11.json'), ep12: json('ep12.json'), ep13: json('ep13.json'), ep14: json('ep14.json'), ep15: json('ep15.json'), ep16: json('ep16.json'), ep17: json('ep17.json') };

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
  { ep: 'ep3', party: ['Elena', 'Ottone', 'Carla', 'Sibilla'], giuste: true },
  { ep: 'ep3', party: ['Attilio', 'Lazzaro', 'Celso'], giuste: false },
  { ep: 'ep4', party: ['Elena', 'Ottavio', 'Ottone', 'Carla', 'Sibilla'], giuste: true },
  { ep: 'ep4', party: ['Nino', 'Fulgenzio', 'Mora', 'Attilio'], giuste: false },
  { ep: 'ep5', party: ['Elena', 'Celso', 'Ottone', 'Sibilla'], giuste: true },
  { ep: 'ep5', party: ['Carla', 'Ottavio', 'Lazzaro'], giuste: false },
  { ep: 'ep6', party: ['Elena', 'Attilio', 'Ottone', 'Sibilla'], giuste: true },
  { ep: 'ep6', party: ['Carla', 'Nino', 'Celso'], giuste: false },
  { ep: 'ep7', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep7', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep8', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep8', party: ['Nino', 'Carla', 'Celso'], giuste: false },
  { ep: 'ep9', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep9', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep10', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep10', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep11', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep11', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep12', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep12', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep13', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep13', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep14', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep14', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep15', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep15', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep16', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep16', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep17', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep17', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
];

const browser = await chromium.launch();
// filtro: node webapp/test-partite.mjs --solo=<indice scenario>
const soloArg = process.argv.find((a) => a.startsWith('--solo='));
const SCELTI = soloArg ? [SCENARI[Number(soloArg.split('=')[1])]] : SCENARI;

async function schermata(page) {
  // dove siamo? il primo selettore VISIBILE decide (l'overlay dei dadi resta
  // nel DOM ~350ms in dissolvenza: contare i nodi non basta)
  const sel = ['#dichiarazione', '.scelta-box button', '.dadi-grid', '#fine-visita', '#ok-msg'];
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
  // scioglie qualunque catena di overlay: scelte (eroe/armato/riprovate),
  // tiri di dado (totale inserito), finche' non resta una schermata vera
  let dove = await schermata(page);
  for (let guardia = 0; guardia < 10; guardia++) {
    if (dove === '.scelta-box button') {
      const accetta = page.locator('.scelta-box [data-id="accetta"]');
      if (await accetta.count()) await accetta.click();      // niente ritiri: si accetta
      else {
        const n = await page.locator('.scelta-box button:not(.annulla)').count();
        await page.locator('.scelta-box button:not(.annulla)').nth(Math.floor(Math.random() * n)).click();
      }
    } else if (dove === '.dadi-grid') {
      await page.locator(`[data-tot="${2 + Math.floor(Math.random() * 11)}"]`).click();
      await page.locator('#dadi-chiudi').waitFor({ state: 'visible' });
      await page.locator('#dadi-chiudi').click();
      await page.locator('.dadi-overlay').waitFor({ state: 'detached' });
    } else return dove;
    dove = await schermata(page);
  }
  return dove;
}

async function stato(page, epId) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem('osr.partita.' + k)), epId);
}

for (const sc of SCELTI) {
  const ep = DATI[sc.ep];
  console.log(`\n=== ${sc.ep} — party di ${sc.party.length}, risposte ${sc.giuste ? 'giuste' : 'sbagliate'} ===`);
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const jsErrors = [];
  page.on('pageerror', (e) => { jsErrors.push(e.message); console.log('    [JS]', e.message.split('\n')[0]); });
  // i 404 delle immagini (arte non ancora generata, Fase D) non sono errori
  // JS: la copertura dei jpg per episodio vive in test-engine (okJpg).
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) { jsErrors.push(m.text()); console.log('    [console]', m.text().split('\n')[0]); } });
  page.on('dialog', (d) => d.accept());

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator(`.tessera-episodio[data-ep="${sc.ep}"]`).click();
    await page.locator('.modo[data-modo="tavolo"]').click();
    await page.locator('#avanti').click();
    await page.locator('.eroe-tile').first().waitFor();
    for (const nome of sc.party) {
      await page.locator(`.eroe-tile[data-nome*="${nome}" i]`).first().click();
      await page.locator('#arruola').click();
    }
    await page.locator('#inizia').click();
    // lettera d'incarico, poi la città
    await page.locator('#in-strada').click();
    await page.locator('.voce').first().waitFor();

    // strategia: prima gli aperti, poi i chiusi con la loro chiave
    const daVisitare = [...ep.luoghi].sort((a, b) => (b.aperto ? 1 : 0) - (a.aperto ? 1 : 0));
    let oreSpese = 0;
    let oggettiAttesi = 0;
    let repertiAttesi = 0;
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
          const doveA = await tiraSeServe(page);
          ok(doveA === '#ok-msg', `approfondire ${tipo}: esito non arriva (${doveA})`);
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
      // reperti: si consegnano e l'immagine si apre
      for (const r of l.reperti || []) {
        await page.locator(`[data-reperto="${r}"]`).click();
        await page.locator('.reperto-img').waitFor();
        await page.locator('#ok-msg').click();
        await page.locator('#fine-visita').waitFor();
        repertiAttesi += 1;
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
    ok((st.indagine.reperti || []).length === repertiAttesi,
       `reperti consegnati: ${(st.indagine.reperti || []).length} invece di ${repertiAttesi}`);
    console.log(`    ${st.indagine.visitati.length} luoghi visitati, ` +
                `${st.indagine.approfondimentiLetti.length} approfondimenti, ` +
                `${st.indagine.oggetti.length} oggetti, ${(st.indagine.reperti || []).length} reperti, ` +
                `ora ${st.indagine.ora}:00`);

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

    // alla spedizione: setup coi vantaggi, poi si gioca
    await page.locator('#alla-spedizione').click();
    await page.locator('#inizia-spedizione').waitFor();
    await page.locator('#inizia-spedizione').click();
    // eventuale pannello d'arrivo (QUANDO RIVELATE della prima tessera)
    await page.waitForSelector('#fase-minaccia, #ok-msg');
    if (await page.locator('#ok-msg').count()) await page.locator('#ok-msg').click();
    await page.locator('#fase-minaccia').waitFor();
    const fin = await stato(page, sc.ep);
    ok(fin.fase === 'spedizione' && fin.indagine.chiusa, 'la partita non passa alla fase spedizione');
    ok(fin.spedizione.mazzo.pool.length > 0, 'mazzo Minaccia vuoto in spedizione');

    // rivelare la seconda tessera e usare l'oracolo di Cercare
    const t2 = ep.tessere[1].id;
    await page.locator(`[data-tessera="${t2}"]`).click();     // rivela
    await page.locator('#ok-msg').click();
    await page.locator(`[data-tessera="${t2}"]`).click();     // menu azioni arbitro
    await page.locator('.scelta-box [data-id="cercare"]').click();
    await page.locator('.scelta-box [data-id]:not(.annulla)').first().click();  // chi cerca
    await page.locator('[data-tot="12"]').click();            // prova riuscita di sicuro
    await page.locator('#dadi-chiudi').waitFor({ state: 'visible' });
    await page.locator('#dadi-chiudi').click();
    await page.locator('#ok-msg').waitFor();
    ok(/cercare/i.test(await page.locator('.barra').innerText()) ||
       (await page.locator('.pannello').innerText()).length > 20, 'oracolo Cercare muto');
    await page.locator('#ok-msg').click();
    ok((await stato(page, sc.ep)).spedizione.cercate[t2] === true, 'Cercare riuscito non segnato');
    await page.locator(`[data-tessera="${t2}"]`).click();     // interagire
    await page.locator('.scelta-box [data-id="interagire"]').click();
    ok((await page.locator('.pannello').innerText()).length > 30, 'Interagire muto');
    await page.locator('#ok-msg').click();

    // oggetti: registrare un oggetto trovato cercando
    const oggPrima = (await stato(page, sc.ep)).indagine.oggetti.length;
    await page.locator('#aggiungi-oggetto').click();
    if (await page.locator('.scelta-box [data-id]:not(.annulla)').count()) {
      await page.locator('.scelta-box [data-id]:not(.annulla)').first().click();
      await page.locator('#fase-minaccia').waitFor();
      ok((await stato(page, sc.ep)).indagine.oggetti.length === oggPrima + 1,
         'oggetto trovato non registrato');
    }

    // esame di Carbone (se Fulgenzio e' nel party e c'e' qualcosa da esaminare)
    if (await page.locator('#esame-carbone').count()) {
      await page.locator('#esame-carbone').click();
      await page.locator('.scelta-box [data-id]:not(.annulla)').first().click();
      await page.locator('#ok-msg').waitFor();
      ok((await page.locator('.pannello').innerText()).length > 40, 'esame di Carbone muto');
      await page.locator('#ok-msg').click();
      await page.locator('#fase-minaccia').waitFor();
    }

    // azione Attaccare guidata: eroe, arma, totale 12 = colpito di sicuro
    // (il registro puo' gia' contenere gli auto-spawn del QUANDO RIVELATE)
    const nemiciPrima = (await stato(page, sc.ep)).spedizione.nemici.length;
    await page.locator('[data-spawn]').first().click();
    if (await page.locator('#ok-msg').count()) await page.locator('#ok-msg').click();  // segnalini finiti
    const nemiciDopo = (await stato(page, sc.ep)).spedizione.nemici.length;
    ok(nemiciDopo >= nemiciPrima, 'spawn manuale ha perso nemici');
    if (!nemiciDopo) await page.locator('[data-spawn]').first().click();
    await page.locator('[data-attacca]').first().click();
    await page.locator('.scelta-box [data-id]:not(.annulla)').first().click();   // chi attacca
    await page.locator('.scelta-box [data-id="si"]').click();                    // armato
    await page.locator('[data-tot="12"]').click();
    await page.locator('#dadi-chiudi').waitFor({ state: 'visible' });
    await page.locator('#dadi-chiudi').click();
    await page.locator('#ok-msg').waitFor();                                     // colpito/abbattuto
    await page.locator('#ok-msg').click();
    const dopoAttacco = (await stato(page, sc.ep)).spedizione.nemici;
    ok(dopoAttacco.length < nemiciDopo || dopoAttacco.some((x) => x.ferite > 0),
       'attacco a segno senza ferita registrata');

    // ripulisci il registro coi pip (correzione a mano) fino a vuoto
    for (let i = 0; i < 40 && (await stato(page, sc.ep)).spedizione.nemici.length; i++) {
      await page.locator('.nemico-pips[data-idx]').first().click();
      await page.waitForTimeout(80);
    }
    ok((await stato(page, sc.ep)).spedizione.nemici.length === 0, 'registro mai svuotato dai pip');

    // sei round completi: fase minaccia (pesca), fase nemici, fine round (tick)
    for (let r = 0; r < 6; r++) {
      await page.locator('#fase-minaccia').click();
      while (await page.locator('#ok-msg').count()) {         // carte pescate
        await page.locator('#ok-msg').click();
        await page.waitForTimeout(120);
      }
      await page.locator('#fine-round').waitFor();            // fase nemici
      await page.locator('#fine-round').click();
      while (await page.locator('#ok-msg').count()) {         // annunci del tick
        await page.locator('#ok-msg').click();
        await page.waitForTimeout(120);
      }
      await page.locator('#fase-minaccia').waitFor();
    }
    const st3 = await stato(page, sc.ep);
    const ogni = ep.marea ? ep.marea.ogni : 4;
    ok(st3.spedizione.round === 7, `round dopo 6 fasi: ${st3.spedizione.round}`);
    // minimo: i tick dell'orologio; in piu' le carte Crescendo pescate (non deterministico)
    const tickMinimi = Math.floor(6 / ogni);
    ok(st3.spedizione.canto >= tickMinimi && st3.spedizione.canto <= tickMinimi + 6,
       `${ep.marea ? 'marea' : 'canto'} fuori misura (${st3.spedizione.canto}, tick minimi ${tickMinimi})`);

    // vittoria
    await page.locator('#vittoria').click();                  // confirm() accettato
    await page.getByText('alla taverna').waitFor();
    ok((await stato(page, sc.ep)).spedizione.esito === 'vittoria', 'esito non salvato');
    console.log(`    busta: ${esatte} esatte, ${sbagliate} sbagliate — spedizione: ` +
                `${st3.spedizione.round - 1} round giocati, ${ep.marea ? 'marea' : 'canto'} ${st3.spedizione.canto}, vittoria`);
  } catch (e) {
    ko(`giocata interrotta: ${e.message.split('\n')[0]}`);
  }
  ok(jsErrors.length === 0, `errori JS: ${jsErrors.slice(0, 3).join(' | ')}`);
  await page.close();
}

await browser.close();
console.log(errori ? `\n${errori} CHECK FALLITI` : '\nTUTTO OK');
process.exit(errori ? 1 : 0);
