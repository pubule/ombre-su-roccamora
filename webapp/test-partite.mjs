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
const DATI = { preludio: json('preludio.json'), ep1: json('ep1.json'), ep2: json('ep2.json'), ep3: json('ep3.json'), ep4: json('ep4.json'), ep5: json('ep5.json'), ep6: json('ep6.json'), ep7: json('ep7.json'), ep8: json('ep8.json'), ep9: json('ep9.json'), ep10: json('ep10.json'), ep11: json('ep11.json'), ep12: json('ep12.json'), ep13: json('ep13.json'), ep14: json('ep14.json'), ep15: json('ep15.json'), ep16: json('ep16.json'), ep17: json('ep17.json'), ep18: json('ep18.json'), ep19: json('ep19.json'), ep20: json('ep20.json') };

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
  { ep: 'ep18', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep18', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep19', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep19', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
  { ep: 'ep20', party: ['Elena', 'Ottone', 'Attilio', 'Sibilla'], giuste: true },
  { ep: 'ep20', party: ['Nino', 'Carla', 'Lazzaro'], giuste: false },
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

// Le domande irreversibili — aprire la busta, dichiarare la vittoria — non
// passano piu' da `window.confirm`: dal commit «le domande irreversibili si
// chiedono dentro il gioco» sono un overlay in finzione (chiedi.js), col «si'»
// su `[data-si]`. Questo test aveva ancora il commento «confirm() accettato dal
// handler» e aspettava una finestra di sistema che non arriva piu': si piantava
// li', su tutti e quarantadue gli scenari.
async function premiSi(page) {
  const si = page.locator('.scelta-box.chiesta [data-si]');
  await si.waitFor({ state: 'visible', timeout: 5000 });
  await si.click();
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
    // dal 14/08/2026 non si sceglie piu' COME si gioca: si gioca al tavolo con
    // la plancia a schermo, e la sola scelta e' da dove si comincia
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

      // APPROFONDIMENTI: prova ogni tipo davvero presente nel luogo.
      //
      // La condizione guardava `scena_<n>`, una chiave di stato che il gioco non
      // scrive piu' da tempo: era sempre falsa, e questo pezzo non e' MAI stato
      // eseguito — 42 giocate che dicevano tutte «0 approfondimenti». Un ramo
      // vacuo dentro la rete piu' grande che abbiamo, e nessuno se n'e' accorto
      // perche' il verde c'era lo stesso. Ora guarda quel che il motore scrive
      // davvero: si tenta finche' il chiavistello non scatta.
      const scenaOk = !(await stato(page, sc.ep)).indagine.scenaChiusa;
      const tipi = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
      if (scenaOk) {
        for (const tipo of tipi) {
          // il bottone puo' non esserci piu': dopo una prova fallita il
          // chiavistello scatta e gli Approfondimenti spariscono da questa
          // visita — e' la regola, non un guasto.
          //
          // E puo' esserci SPENTO: dal 15/08 la scheda del luogo dice anche CHI
          // puo' leggere quel tipo, e se nessuno in squadra ce la fa il bottone
          // resta li' disabilitato invece di sparire — sparendo, il tavolo non
          // saprebbe che quella cosa esiste e che serve un altro eroe.
          const b = page.locator(`[data-tipo="${tipo}"]`);
          if (!(await b.count())) break;
          if (await b.isDisabled()) continue;
          await b.click();
          const doveA = await tiraSeServe(page);
          ok(doveA === '#ok-msg', `approfondire ${tipo}: esito non arriva (${doveA})`);
          if (doveA !== '#ok-msg') break;
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

    // taccuino: risposte e busta.
    //
    // Dal 15/08 il taccuino sta nel MENU: fuori resta la scena — lo stradario e
    // il luogo in cui siete — e tutto quel che non si guarda a ogni giro sta
    // dietro un tasto. Due tocchi invece di uno, ed è la stessa strada che fa
    // chi arbitra al tavolo.
    await page.locator('#apri-menu').click();
    await page.locator('#m-taccuino').click();
    // La CONTRO-BUSTA (Ep.15) non sta nel taccuino: e' una Domanda che il
    // fascicolo apre DOPO la spedizione, quindi a schermo il suo campo non
    // c'e'. Iterare su tutte le domande cercava un `[data-risposta]` che non
    // esiste, e la giocata moriva li'.
    const domande = ep.soluzione.domande.filter((d) => !d.dopo_spedizione);
    const risposte = domande.map((d) => sc.giuste ? d.risposta : 'nebbia fitta');
    for (let i = 0; i < risposte.length; i++) {
      await page.locator(`[data-risposta="${i}"]`).fill(risposte[i]);
    }
    await page.locator('#apri-busta').click();
    await premiSi(page);                          // la busta si apre dentro la finzione
    await page.locator('#alla-spedizione').waitFor();
    // `span.ko-txt` e non `.ko-txt`: l'esito di ogni Domanda e' uno <span>,
    // ma il riepilogo del vantaggio usa un <b class="ko-txt"> per «Partite in
    // ritardo» — e contandolo insieme alle risposte ne risultava sempre una
    // di troppo.
    const esatte = await page.locator('span.ok-txt').count();
    const sbagliate = await page.locator('span.ko-txt').count();
    if (sc.giuste) ok(esatte === domande.length, `risposte giuste bocciate (${esatte}/${domande.length})`);
    else ok(sbagliate === domande.length, `risposte a caso promosse (${sbagliate} bocciate attese ${domande.length})`);
    // LA BUSTA VA ANCHE SUGLI ALTRI SCHERMI: e' la resa dei conti della serata,
    // e chi gioca da telefono deve leggerla, non sentirsela riassumere. Si
    // guarda quel che finisce nello stato — la carta condivisa — perche' e'
    // quella che arriva a tutti.
    const cartaBusta = (await stato(page, sc.ep)).indagine.carta;
    ok(cartaBusta && /busta/i.test(cartaBusta.titolo || ''),
       `la busta non e' andata sugli altri schermi (${JSON.stringify(cartaBusta)})`);
    ok(cartaBusta && !/data-correggi/.test(cartaBusta.corpo || ''),
       'e ci va senza i bottoni di correzione: quella mano è di chi conduce');

    const bustaTxt = await page.locator('.pannello').innerText();
    ok(/vantaggio d’indagine/i.test(bustaTxt), 'riepilogo vantaggio assente');
    ok(bustaTxt.includes(`${24 - st.indagine.ora} ore avanzate`), 'ore avanzate nel riepilogo non tornano');

    // ---------------------------------------------------- alla spedizione
    //
    // LA SPEDIZIONE QUI E' UNA PROVA DI FUMO, e da oggi lo dichiara. Fino al
    // 14/08/2026 questa meta' guidava `spedizione.js` — la vista per chi aveva
    // stampato tessere e miniature — che non esiste piu': si gioca solo con la
    // plancia a schermo. Riscriverla per l'altra vista avrebbe rifatto, su 21
    // episodi, quel che `test-digitale-ui` e `test-digitale-regressioni` gia'
    // provano a fondo su uno.
    //
    // Quel che resta qui e' cio' che vale UNA VOLTA PER EPISODIO, ed e' guasto
    // di DATI, non di regole: che la spedizione si apra, che il mazzo Minaccia
    // dell'episodio non sia vuoto, che la plancia si disegni e che un giro di
    // round passi senza errori JS. Il resto — attacchi, pips, tick del Canto —
    // sta dove si prova per bene.
    await page.locator('#alla-spedizione').click();
    await page.waitForSelector('#via, #ok-msg, .board-digitale');
    if (await page.locator('#via').count()) await page.locator('#via').click();
    if (await page.locator('#ok-msg').count()) await page.locator('#ok-msg').click();
    await page.locator('.board-digitale').waitFor();

    const fin = await stato(page, sc.ep);
    ok(fin.fase === 'spedizione' && fin.indagine.chiusa, 'la partita non passa alla fase spedizione');
    ok(fin.spedizione.mazzo.pool.length > 0, 'mazzo Minaccia vuoto in spedizione');
    ok((await page.locator('.tok-board.eroe').count()) === sc.party.length,
       `token eroe sulla plancia: ${await page.locator('.tok-board.eroe').count()} invece di ${sc.party.length}`);

    // un giro di round, cliccando quel che c'e' — la stessa forma di
    // `test-digitale-ui`: se qualcosa esplode, lo dicono gli errori JS
    const cliccaSe = async (sel) => {
      if (!(await page.locator(sel).count())) return false;
      await page.locator(sel).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(120);
      return true;
    };
    for (let giro = 0; giro < 24; giro += 1) {
      if (await cliccaSe('#ok-msg')) continue;
      if (await cliccaSe('#dadi-chiudi')) continue;
      if (await cliccaSe('#salta-nemici')) { await page.waitForTimeout(400); continue; }
      if (await cliccaSe('#az-fine')) continue;
      if (await cliccaSe('#fase-minaccia')) continue;
      break;
    }
    const st3 = await stato(page, sc.ep);
    ok(st3.spedizione.round >= 1, `la spedizione non e' partita (round ${st3.spedizione.round})`);
    console.log(`    busta: ${esatte} esatte, ${sbagliate} sbagliate — spedizione: ` +
                `round ${st3.spedizione.round}, ${ep.marea ? 'marea' : 'canto'} ${st3.spedizione.canto}`);
  } catch (e) {
    ko(`giocata interrotta: ${e.message.split('\n')[0]}`);
    // LA DIAGNOSTICA E' SEMPRE ACCESA, e non dietro una variabile d'ambiente.
    // Questa caduta si presenta in una corsa su due, ogni volta in una giocata
    // diversa, e non si e' mai fatta cogliere quando la diagnostica era accesa
    // apposta: sperare che ricapiti al momento giusto e' il modo di non
    // capirla mai. Stampa solo quando qualcosa cade, quindi non costa niente.
    console.log('    [dove]', e.stack.split('\n').slice(1, 4).join(' | ').trim());
    try {
      console.log('    [schermo]', (await page.locator('#app').innerText()).slice(0, 300).replace(/\s+/g, ' '));
      console.log('    [sopra]', await page.evaluate(() =>
        [...document.querySelectorAll('.velo, .foglio, .scelta-overlay, .dadi-overlay')]
          .map((x) => x.className).join(', ') || 'niente'));
    } catch (e2) { console.log('    [schermo] illeggibile:', String(e2).slice(0, 80)); }
  }
  ok(jsErrors.length === 0, `errori JS: ${jsErrors.slice(0, 3).join(' | ')}`);
  await page.close();
}

await browser.close();
console.log(errori ? `\n${errori} CHECK FALLITI` : '\nTUTTO OK');
process.exit(errori ? 1 : 0);
