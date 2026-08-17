// Test UI (Playwright): una partita vera in modalita' Tavolo sull'Episodio 1
// contro il server locale — home, party, stradario, pista fredda, visita con
// tiro di dado, bussata sbagliata (la porta NON si sblocca), bussata giusta.
// Raccoglie errori console e richieste fallite (404 di asset compresi).
//
// Uso:  node webapp/server.js   (in un altro terminale)
//       node webapp/test-ui.mjs [porta]
import { chromium } from 'playwright';

const PORT = process.argv[2] || 8017;
const BASE = `http://localhost:${PORT}`;
let errori = 0;
const ko = (msg) => { errori += 1; console.log('  KO', msg); };
const ok = (cond, msg) => { if (!cond) ko(msg); else console.log('  ok', msg); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

const jsErrors = [];
const failed = [];
// Il 404 su /api/stato non e' un difetto: e' la sonda con cui l'app capisce se
// esiste un server dei salvataggi. Qui davanti c'e' webapp/server.js, che
// serve solo file, quindi la risposta giusta e' proprio 404 — e l'app entra
// come ha sempre fatto, senza chiedere nessun tavolo.
const attesa = (url) => url.includes('/api/');
page.on('pageerror', (e) => jsErrors.push(e.message));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (attesa(m.location()?.url || '')) return;   // per URL, non per testo: i 404
  jsErrors.push(m.text());                       // degli asset devono restare visibili
});
page.on('response', (r) => {
  if (r.status() >= 400 && !attesa(r.url())) failed.push(`${r.status()} ${r.url()}`);
});

try {
  // --- home ------------------------------------------------------------
  console.log('home');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: 'networkidle' });
  ok(await page.locator('.tessera-episodio').count() === 21, '21 episodi in taverna');

  // I BOTTONI DELLA TESTATA su una riga sola. Stavano su due, con uno
  // spaziatore vuoto a fianco: sullo stretto cadevano uno di qua e uno di la'.
  // E la rubrica si raggiunge anche da qui — le persone si aggiungono quando ci
  // si ricorda, di solito prima di una serata e non passando dai tavoli.
  {
    const testi = await page.locator('.bottoni .btn').allInnerTexts();
    ok(testi.some((t) => /rubrica/i.test(t)), `la testata porta alla rubrica (${testi.join(', ')})`);
    ok(testi.some((t) => /taccuino/i.test(t)), 'e al taccuino di campagna');
    // stessa riga, distanziati uguale e centrati come gruppo: «stessa riga» da
    // solo non provava niente — dei bottoni in linea ci stanno comunque, ed e'
    // la spaziatura irregolare che si vedeva sullo schermo stretto
    const m = await page.locator('.bottoni').evaluate((riga) => {
      const b = [...riga.querySelectorAll('.btn')].map((x) => x.getBoundingClientRect());
      const c = riga.getBoundingClientRect();
      return {
        righe: new Set(b.map((x) => Math.round(x.top))).size,
        buchi: b.slice(1).map((x, i) => Math.round(x.left - b[i].right)),
        sinistra: Math.round(b[0].left - c.left),
        destra: Math.round(c.right - b[b.length - 1].right),
      };
    });
    ok(m.righe === 1, `e stanno tutti sulla stessa riga (viste ${m.righe})`);
    ok(m.buchi.every((x) => x >= 6 && x <= 24) && Math.max(...m.buchi) - Math.min(...m.buchi) <= 1,
       `distanziati uguale, ne appiccicati ne sparpagliati (buchi: ${m.buchi.join(', ')})`);
    ok(Math.abs(m.sinistra - m.destra) <= 2,
       `e centrati come gruppo (${m.sinistra} a sinistra, ${m.destra} a destra)`);
    await page.locator('#rubrica').click();
    await page.waitForTimeout(400);
    ok((await page.locator('.barra .titolo').first().innerText()).trim() === 'rubrica',
       'e il bottone apre davvero la rubrica');
    await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator('.tessera-episodio').first().waitFor();
  }

  // --- episodio -> si comincia ------------------------------------------
  console.log('episodio 1');
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  await page.locator('#avanti').click();

  // --- party: tile -> scheda personaggio -> arruola ------------------------
  console.log('party');
  await page.locator('.eroe-tile img').first().waitFor();
  ok(await page.locator('.eroe-tile').count() === 11, '11 ritratti eroe');
  const rotte = await page.$$eval('.eroe-tile img',
    (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  ok(rotte.length === 0, `ritratti eroe tutti caricati${rotte.length ? ' — rotti: ' + rotte.join(', ') : ''}`);
  // Elena (Osservazione) e Carla (Testimonianza): servono idonei veri, o alla
  // Taverna partirebbe l'«aiuto profano» invece del tiro dell'Approfondimento
  for (const n of [0, 5]) {
    await page.locator('.eroe-tile').nth(n).click();
    await page.locator('.eroe-dettaglio').waitFor();
    ok(await page.locator('.eroe-stats .stat').count() === 5, 'scheda con 5 statistiche');
    await page.locator('#arruola').click();
  }
  ok(await page.locator('.eroe-tile.scelto').count() === 2, 'due eroi arruolati');
  await page.locator('#inizia').click();

  // --- lettera d'incarico ----------------------------------------------------
  console.log('lettera');
  await page.locator('.lettera-testo').waitFor();
  const testoLettera = await page.locator('.lettera-testo').innerText();
  ok(testoLettera.length > 200, 'lettera con testo pieno');
  ok(!/<\w/.test(testoLettera), `nessun tag scritto a schermo nella lettera${/<\w/.test(testoLettera) ? ' — ' + testoLettera.match(/<\w[^>]*>/)[0] : ''}`);
  // la coda dell'arbitro va staccata nel font vecchio, non impastata a mano
  ok(await page.locator('.nota-arbitro').count() === 1, 'la coda è staccata in .nota-arbitro');
  ok((await page.locator('.nota-arbitro').innerText()).includes('Luoghi disponibili'),
    'e contiene i luoghi di partenza');
  await page.locator('#in-strada').click();

  // --- stradario -----------------------------------------------------------
  console.log('stradario');
  await page.locator('.voce').first().waitFor();
  ok(await page.locator('.voce').count() > 8, 'stradario popolato');

  // rileggere la lettera dal bottone, poi tornare in strada
  // la lettera sta nel menu, con tutto quel che non si guarda a ogni giro
  await page.locator('#apri-menu').click();
  await page.locator('#m-lettera').click();
  await page.locator('.lettera-testo').waitFor();
  await page.locator('#in-strada').click();
  await page.locator('.voce').first().waitFor();
  ok(true, 'lettera rileggibile dallo stradario');

  // --- pista fredda: voce vera della mappa ma fuori episodio ---------------
  const fredda = await page.$$eval('.voce', (els, luoghi) => {
    const testi = els.map((e) => e.dataset.voce);
    return testi.find((t) => !luoghi.includes(t.trim().toUpperCase()));
  }, (await (await fetch(`${BASE}/data/ep1.json`)).json()).luoghi.map((l) => l.voce_mappa.trim().toUpperCase()));
  if (fredda) {
    await page.locator(`.voce[data-voce="${fredda}"]`).click();
    ok(await page.getByText('pista fredda').count() > 0, `pista fredda su "${fredda}"`);
    await page.locator('#ok-msg').click();
  }

  // --- visita a un luogo aperto (Taverna): SENZA tiro ----------------------
  // Regola cambiata l'11/08/2026: entrando non si tira niente. Il dado esce
  // solo se il gruppo chiede un Approfondimento, e lo tira chi fruga.
  console.log('visita luogo aperto (nessun tiro entrando)');
  await page.locator('.voce[data-voce="Vicolo dei Fonditori"]').click();
  await page.locator('.scena').waitFor();
  ok(await page.locator('.dadi-overlay').count() === 0, 'entrando NON si tira nessun dado');
  ok(await page.locator('.scelta-box').count() === 0, 'e non si sceglie nessun eroe');
  ok(await page.getByText('indizi', { exact: false }).count() > 0, 'scheda luogo con indizi');

  // PRIMA QUEL CHE C'È DA PRENDERE, POI GLI APPROFONDIMENTI: al tavolo si
  // entra, si raccoglie quel che è in vista, e poi si guarda meglio. Con la
  // roba in fondo, sul telefono finiva sotto la piega.
  {
    // il luogo va scelto fra quelli che HANNO qualcosa da prendere: la Taverna
    // non ne ha, e il controllo passerebbe senza misurare niente
    const dove = await page.evaluate(() => {
      const roba = [...document.querySelectorAll('.pannello .nota')]
        .find((n) => /da prendere/i.test(n.textContent));
      const tipi = document.querySelector('.tipi');
      return { roba: roba ? roba.getBoundingClientRect().top : null,
        tipi: tipi ? tipi.getBoundingClientRect().top : null };
    });
    ok(dove.roba != null && dove.tipi != null,
       `il luogo di prova ha roba da prendere e Approfondimenti (${JSON.stringify(dove)})`);
    ok(dove.roba < dove.tipi,
       `«da prendere, qui» sta sopra gli Approfondimenti (${Math.round(dove.roba)} contro ${Math.round(dove.tipi)})`);
  }

  // --- l'Approfondimento: si tira li', e fallendo la carica resta ----------
  const cariche = () => page.evaluate(() =>
    JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem('osr.partita.ep1')).indagine.caricheUsate || {})));
  const primaDelTiro = await cariche();
  const tipoBtn = page.locator('[data-tipo="Testimonianza"]');
  if (await tipoBtn.count()) {
    await tipoBtn.click();
    const sceltaChi = page.locator('.scelta-box button').first();
    await sceltaChi.waitFor();
    ok(true, 'chiedendo un Approfondimento si sceglie chi prova');
    await sceltaChi.click();
    await page.locator('.dadi-overlay').waitFor({ state: 'visible' });
    ok(true, 'e allora si tira');
    await page.locator('[data-tot="2"]').click();          // fallimento certo
    await page.locator('#dadi-chiudi').waitFor({ state: 'visible' });
    await page.locator('#dadi-chiudi').click();
    // fallendo, il Regolamento offre il Secondo Fiato: qui si accetta il
    // fallimento, che e' proprio il caso da provare
    const accetta = page.getByText('accettate il fallimento');
    await accetta.waitFor();
    await accetta.click();
    await page.locator('#ok-msg').waitFor();
    await page.locator('#ok-msg').click();
    await page.locator('#fine-visita').waitFor();      // scheda luogo ridisegnata
    ok(JSON.stringify(await cariche()) === JSON.stringify(primaDelTiro),
      'fallendo la carica NON si spende');
    ok(await page.locator('[data-tipo]').count() === 0,
      'e in questa visita non si tenta piu: bisogna uscire e rientrare');
  }

  // CAMBIANDO SCHERMATA SI ATTERRA IN CIMA. Con la scena alta mezzo schermo,
  // aprendo una pagina nuova ci si ritrovava in fondo — sull'ultimo bottone,
  // senza vedere né il titolo né il luogo. Il ridisegno che arriva dal tavolo
  // invece non deve muovere il segno: quello si prova in test-indagine-eroe.
  {
    await page.evaluate(() => window.scrollTo(0, 3000));
    const prima = await page.evaluate(() => Math.round(window.scrollY));
    await page.locator('#apri-menu').click();
    await page.waitForTimeout(250);
    await page.locator('#m-stradario').click();
    await page.waitForTimeout(400);
    const dopo = await page.evaluate(() => Math.round(window.scrollY));
    ok(prima > 200, `la pagina si può scorrere davvero (${prima})`);
    ok(dopo === 0, `cambiando schermata si torna in cima (da ${prima} a ${dopo})`);
    await page.locator('#str-indietro').click();
    await page.waitForTimeout(400);
  }

  // uscire al menu a meta' visita e riprendere: si torna DENTRO il luogo,
  // senza pagare un'altra ora
  const oraPrima = (await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')))).indagine.ora;
  // l'uscita è nel menu: in cima ci stanno l'ora e il menu, e basta
  await page.locator('#apri-menu').click();
  await page.locator('#nav-esci').click();
  // IL VELO NON RESTA APPESO. Il foglio del menu vive sul `body`: uscendo
  // dall'Indagine col menu aperto, velo e foglio resterebbero sopra la
  // schermata nuova — un velo a tutto schermo si mangia ogni tocco, e l'app
  // sembra bloccata senza dire perché.
  await page.waitForTimeout(300);
  const appesi = await page.evaluate(() => [...document.querySelectorAll('.velo, .foglio')]
    .map((e) => `${e.tagName}.${e.className}#${e.id}`));
  ok(appesi.length === 0,
     `uscendo dal menu non resta nessun velo appeso (${appesi.join(', ')})`);
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  await page.locator('#continua').click();
  await page.locator('#fine-visita').waitFor();
  const oraDopo = (await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')))).indagine.ora;
  ok(oraDopo === oraPrima, `riprendere la visita non costa ore (${oraPrima} -> ${oraDopo})`);
  await page.locator('#fine-visita').click();

  // --- USCITI DA UN LUOGO, LA PISTA FREDDA RIPORTA IN STRADA ---------------
  //
  // Visto al tavolo: si esce da un luogo, si dichiara una pista fredda, si
  // preme «continuate» — e invece dello stradario torna la scheda del luogo di
  // prima. Il motore, uscendo, CANCELLA `luogoAperto`; il travaso nella vista
  // usava `Object.assign`, che copia le chiavi che ci sono e lascia in piedi
  // quelle sparite. Il numero restava scritto, e «tornate dove siete» ci
  // riportava dentro.
  if (fredda) {
    await page.locator('.voce').first().waitFor();
    await page.locator(`.voce[data-voce="${fredda}"]`).click();
    await page.locator('#ok-msg').waitFor();
    await page.locator('#ok-msg').click();
    await page.waitForTimeout(400);
    const dove = await page.locator('#app').innerText();
    ok(/dove andate/i.test(dove) && !/indizi/i.test(dove),
      `dopo una pista fredda si torna in strada, non nel luogo di prima (${
        dove.slice(0, 80).replace(/\s+/g, ' ')})`);
  }

  // --- bussata sbagliata: la porta NON deve sbloccarsi ----------------------
  console.log('bussata sbagliata alla Cattedrale');
  await page.locator('.voce[data-voce="La Cattedrale"]').click();
  await page.locator('#dichiarazione').fill('parola a caso');
  await page.locator('#prova').click();
  ok(await page.getByText('niente da fare').count() > 0, 'porta resta chiusa');
  await page.locator('#ok-msg').click();
  await page.locator('.voce[data-voce="La Cattedrale"]').click();
  const ancoraChiusa = await page.locator('#dichiarazione').count() === 1;
  ok(ancoraChiusa, 'seconda visita richiede ANCORA la chiave (bug bussata sbagliata)');

  // --- bussata giusta --------------------------------------------------------
  if (ancoraChiusa) {
    console.log('bussata giusta');
    await page.locator('#dichiarazione').fill('Tonio');
    await page.locator('#prova').click();
    ok(await page.getByText('la porta si apre').count() > 0, 'chiave giusta apre');
    await page.locator('#ok-msg').click();
    // entrando non si tira piu' niente: si e' subito dentro il luogo
    await page.locator('.scena').waitFor();
    ok(await page.locator('.dadi-overlay').count() === 0,
      'anche entrando con la chiave giusta non si tira nulla');
    await page.locator('#fine-visita').click();
  }

  // --- riprendere la partita salvata ------------------------------------------
  console.log('salvataggio');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  ok(await page.getByText('partita in corso').count() > 0, 'partita salvata riappare');
} catch (e) {
  ko(`flusso interrotto: ${e.message.split('\n')[0]}`);
}

const failVeri = failed.filter((f) => !f.includes('favicon'));
ok(jsErrors.length === 0, `zero errori JS${jsErrors.length ? ' — ' + jsErrors.slice(0, 3).join(' | ') : ''}`);
ok(failVeri.length === 0, `zero richieste fallite${failVeri.length ? ' — ' + failVeri.slice(0, 5).join(' | ') : ''}`);

await browser.close();
console.log(errori ? `\n${errori} CHECK FALLITI` : '\nTUTTO OK');
process.exit(errori ? 1 : 0);
