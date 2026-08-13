// Genera in blocco tutte le carte in cards-data.js, un solo browser (reload tra
// una carta e l'altra per azzerare lo stato), download reale in cards/<title>.jpg.
//
// Uso:
//   node scripts/cardconjurer/generate-batch.js            (tutte)
//   node scripts/cardconjurer/generate-batch.js heroes      (solo eroi)
//   node scripts/cardconjurer/generate-batch.js nemici      (solo nemici)
//   node scripts/cardconjurer/generate-batch.js minacce     (solo minacce)
//   node scripts/cardconjurer/generate-batch.js luoghi      (solo luoghi)
//   node scripts/cardconjurer/generate-batch.js indizi      (solo indizi nascosti)
//   node scripts/cardconjurer/generate-batch.js testimoni   (solo carte Testimone)
//   node scripts/cardconjurer/generate-batch.js referti     (solo carte Referto)
//   node scripts/cardconjurer/generate-batch.js oggetti     (solo carte Oggetto)
//   node scripts/cardconjurer/generate-batch.js all --solo-mancanti  (salta le carte il cui .jpg esiste gia')

const { chromium } = require('playwright');
const { generateOne, cardOutputPath } = require('./lib');
const { startServer } = require('./serve');
const { HEROES, NEMICI, MINACCE, LUOGHI, INDIZI, TESTIMONI, REFERTI, OGGETTI, PRELUDIO, EP2, ALL } = require('./cards-data');
const fs = require('fs');
const path = require('path');

const GROUPS = { heroes: HEROES, nemici: NEMICI, minacce: MINACCE, luoghi: LUOGHI,
                 indizi: INDIZI, testimoni: TESTIMONI, referti: REFERTI, oggetti: OGGETTI,
                 preludio: PRELUDIO, ep2: EP2, all: ALL };

(async () => {
  const argv = process.argv.slice(2).filter((a) => a !== '--solo-mancanti');
  const soloMancanti = process.argv.includes('--solo-mancanti');
  const which = (argv[0] || 'all').toLowerCase();
  let cards = GROUPS[which];
  // filtro opzionale per titolo: node generate-batch.js ep2 'Camera dei Pesi'
  const filtro = argv[1];
  if (cards && filtro) cards = cards.filter((c) => c.title.toLowerCase().includes(filtro.toLowerCase()));
  if (!cards) {
    console.error(`Gruppo sconosciuto "${which}". Usa: heroes | nemici | minacce | all`);
    process.exit(1);
  }
  if (soloMancanti) {
    const prima = cards.length;
    cards = cards.filter((c) => !fs.existsSync(cardOutputPath(c)));
    console.log(`--solo-mancanti: ${cards.length}/${prima} carte da generare (le altre hanno gia' il .jpg)`);
  }

  // Senza la sua artwork la carta esce con un buco al posto del ritratto: un
  // .jpg che sembra fatto e non lo e', e che --solo-mancanti considera fatto
  // per sempre. Meglio saltarla e dirlo: torna da sola quando l'arte arriva.
  const senzArte = cards.filter((c) => !fs.existsSync(path.resolve(process.cwd(), c.art)));
  if (senzArte.length) {
    cards = cards.filter((c) => !senzArte.includes(c));
    console.log(`Saltate ${senzArte.length} carte: manca la loro artwork in artworks/.`);
    for (const c of senzArte) console.log(`  ${c.title}  <-  ${c.art}`);
  }

  const { url, close } = await startServer();
  const browser = await chromium.launch({ headless: false, slowMo: 10 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });

  let ok = 0;
  const failed = [];
  let first = true;
  for (const card of cards) {
    console.log(`--- ${card.title} ---`);
    try {
      if (!first) {
        // Il sito persiste lo stato della carta in localStorage: senza pulirlo,
        // ricaricare la pagina riporta la carta precedente invece di una vuota.
        await page.evaluate(() => localStorage.clear()).catch(() => {});
      }
      first = false;
      await page.goto(url + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      const outPath = await generateOne(page, card);
      console.log('  ok ->', outPath);
      ok++;
    } catch (e) {
      console.log('  ERRORE:', e.message);
      failed.push(card.title);
    }
  }

  console.log(`\nFatto: ${ok}/${cards.length} generate.`);
  if (failed.length) console.log('Fallite:', failed.join(', '));

  await browser.close();
  close();
})();
