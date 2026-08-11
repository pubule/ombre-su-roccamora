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

  // --- episodio -> modalita' tavolo -------------------------------------
  console.log('episodio 1, modalità tavolo');
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  await page.locator('.modo[data-modo="tavolo"]').click();
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
  ok((await page.locator('.lettera-testo').innerText()).length > 200, 'lettera con testo pieno');
  await page.locator('#in-strada').click();

  // --- stradario -----------------------------------------------------------
  console.log('stradario');
  await page.locator('.voce').first().waitFor();
  ok(await page.locator('.voce').count() > 8, 'stradario popolato');

  // rileggere la lettera dal bottone, poi tornare in strada
  await page.locator('#rileggi').click();
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
  await page.locator('.voce[data-voce="Taverna del Ponte Rotto"]').click();
  await page.locator('.banner-luogo').waitFor();
  ok(await page.locator('.dadi-overlay').count() === 0, 'entrando NON si tira nessun dado');
  ok(await page.locator('.scelta-box').count() === 0, 'e non si sceglie nessun eroe');
  ok(await page.getByText('indizi', { exact: false }).count() > 0, 'scheda luogo con indizi');

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

  // uscire al menu a meta' visita e riprendere: si torna DENTRO il luogo,
  // senza pagare un'altra ora
  const oraPrima = (await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')))).indagine.ora;
  await page.locator('#nav-esci').click();
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  await page.locator('#continua').click();
  await page.locator('#fine-visita').waitFor();
  const oraDopo = (await page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')))).indagine.ora;
  ok(oraDopo === oraPrima, `riprendere la visita non costa ore (${oraPrima} -> ${oraDopo})`);
  await page.locator('#fine-visita').click();

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
    await page.locator('.banner-luogo').waitFor();
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
