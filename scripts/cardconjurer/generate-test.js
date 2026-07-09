// Rigenera solo un sottoinsieme di carte per titolo, per revisione rapida prima del batch completo.
// Uso: node scripts/cardconjurer/generate-test.js "Sibilla Reve" "Adepto Incappucciato"
const { chromium } = require('playwright');
const { generateOne } = require('./lib');
const { ALL } = require('./cards-data');

(async () => {
  const wanted = process.argv.slice(2);
  const cards = ALL.filter((c) => wanted.includes(c.title));
  if (!cards.length) {
    console.error('Nessuna carta trovata per:', wanted.join(', '));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 10 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });

  let first = true;
  for (const card of cards) {
    console.log(`--- ${card.title} ---`);
    if (!first) await page.evaluate(() => localStorage.clear()).catch(() => {});
    first = false;
    await page.goto('https://cardconjurer.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const outPath = await generateOne(page, card);
    console.log('  ok ->', outPath);
  }

  await browser.close();
})();
