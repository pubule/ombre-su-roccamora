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

const { chromium } = require('playwright');
const { generateOne } = require('./lib');
const { startServer } = require('./serve');
const { HEROES, NEMICI, MINACCE, LUOGHI, INDIZI, TESTIMONI, REFERTI, OGGETTI, PRELUDIO, ALL } = require('./cards-data');

const GROUPS = { heroes: HEROES, nemici: NEMICI, minacce: MINACCE, luoghi: LUOGHI,
                 indizi: INDIZI, testimoni: TESTIMONI, referti: REFERTI, oggetti: OGGETTI,
                 preludio: PRELUDIO, all: ALL };

(async () => {
  const which = (process.argv[2] || 'all').toLowerCase();
  const cards = GROUPS[which];
  if (!cards) {
    console.error(`Gruppo sconosciuto "${which}". Usa: heroes | nemici | minacce | all`);
    process.exit(1);
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
