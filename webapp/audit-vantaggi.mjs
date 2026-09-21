// AUDIT: i vantaggi d'Indagine arrivano davvero nella Spedizione, in ogni episodio?
//
// Non si legge il codice e si dice «c'e'»: si GIOCA. Per ogni episodio (preludio
// + ep.1-20) e per ogni gradino del vantaggio si costruisce una notte
// d'Indagine vera, si apre la busta col MOTORE, si scende con l'INTERFACCIA
// vera (`#via` -> `iniziaPartita`) e si legge quel che la Spedizione ha
// davvero: Salute massima di ogni eroe, azioni del 1° round, Canto di partenza.
// Il confronto e' con le REGOLE STAMPATE (src/gen_docs.py, «Il vantaggio
// d'Indagine»), riscritte qui a mano e non importate dal motore: se le
// importassi, un errore del motore passerebbe l'audit da solo.
//
// Le regole stampate:
//   Slancio    TUTTE le Domande esatte E 3+ ore avanzate
//              -> 3 azioni (di tipo diverso) a testa nel 1° round, +1 Salute max
//   Preparati  1+ ore avanzate O 6+ luoghi visitati
//              -> +1 Salute max a testa
//   Nessuno    tutto il resto
//   Dossier    0 ore avanzate -> 1 gettone Intuizione (un ri-tiro in Spedizione)
//   Domande    ognuna ha un effetto suo in Spedizione (`esatta` / `sbagliata`);
//              quelle con `penalita.canto` partono con 1 Canto in piu'.
//
// Uso:  node webapp/server.js   (in un altro terminale)
//       node webapp/audit-vantaggi.mjs [porta] [--solo=ep3,ep7] [--json=risultati.json]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const PORT = process.argv.slice(2).find((a) => /^\d+$/.test(a)) || 8017;
const BASE = `http://localhost:${PORT}`;
const soloArg = process.argv.find((a) => a.startsWith('--solo='));
const IDS = ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)]
  .filter((id) => !soloArg || soloArg.slice(7).split(',').includes(id));

const leggi = (k) => JSON.parse(readFileSync(new URL(`./data/${k}.json`, import.meta.url), 'utf8'));
const COMUNE = leggi('comune');
const PARTY = COMUNE.eroi.slice(0, 4).map((e) => e.nome);          // quattro eroi: la taglia piu' comune
const BONUS_TAGLIA = COMUNE.regole.salute_bonus_per_taglia[String(PARTY.length)] || 0;

// I GRADINI: (ore avanzate, luoghi visitati, risposte tutte esatte?) -> cosa dice la regola stampata
const SCENARI = [
  { nome: 'slancio',            ore: 4, luoghi: 2, giuste: true,  tier: 'slancio',   dossier: false },
  { nome: 'preparati (ore)',    ore: 1, luoghi: 0, giuste: false, tier: 'preparati', dossier: false },
  { nome: 'preparati (luoghi)', ore: 0, luoghi: 6, giuste: false, tier: 'preparati', dossier: true  },
  { nome: 'nessuno + dossier',  ore: 0, luoghi: 2, giuste: false, tier: 'nessuno',   dossier: true  },
  // il caso che la regola vuole a gradino sotto: risposte tutte giuste ma 2 ore sole
  { nome: 'giuste ma poche ore', ore: 2, luoghi: 2, giuste: true, tier: 'preparati', dossier: false },
];
const regolaTier = (s) => (s.giuste && s.ore >= 3 ? 'slancio' : (s.ore >= 1 || s.luoghi >= 6) ? 'preparati' : 'nessuno');

const browser = await chromium.launch();
const risultati = [];      // { ep, scenario, controlli: [{ok, msg}], gap: [...] }
let ko = 0;

async function provaUno(page, id, s) {
  const dati = { ep: leggi(id) };
  const ep = dati.ep;
  const domande = (ep.soluzione || {}).domande || [];
  const inBusta = domande.filter((d) => !d.dopo_spedizione);
  const cantoAtteso = s.giuste ? 0 : inBusta.reduce((n, d) => n + ((d.penalita || {}).canto || 0), 0);
  const saluteExtra = ep.salute_extra || 0;
  const bonusTier = s.tier === 'nessuno' ? 0 : 1;

  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  // 1. LA NOTTE D'INDAGINE, aperta con il MOTORE vero
  const aperta = await page.evaluate(async ({ id, s, party }) => {
    const j = async (k) => (await fetch(`/data/${k}.json`)).json();
    const [comune, carte, ep] = await Promise.all([j('comune'), j('carte'), j(id)]);
    const { applica } = await import('/motore/comandi.js');
    const dom = (ep.soluzione || {}).domande || [];
    const risposte = dom.map((d) => (s.giuste ? String(d.risposta) : ''));
    const partita = {
      v: 1, episodio: id, modo: 'tavolo', party, fase: 'indagine', creata: 1, aggiornato: 1,
      rng: { seme: 11, passo: 0 },
      indagine: {
        ora: 24 - s.ore, lettaLettera: true,
        visitati: (ep.luoghi || []).slice(0, s.luoghi).map((l) => l.n),
        scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [], approfondimentiLetti: [],
        caricheUsate: {}, secondoFiato: {}, note: '', noteEroe: {}, risposte, chiusa: false,
      },
      spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
    };
    const out = applica(partita, { tipo: 'apri-busta' }, { ep, comune, carte });
    if (out.rifiuto) return { errore: out.rifiuto.motivo };
    const stato = out.stato;
    stato.fase = 'spedizione';                               // «alla spedizione»
    localStorage.setItem(`osr.partita.${id}`, JSON.stringify(stato));
    return { vantaggi: stato.vantaggi, cantoBusta: (stato.spedizione || {}).canto };
  }, { id, s, party: PARTY });
  if (aperta.errore) return { errore: `apri-busta rifiutata: ${aperta.errore}` };

  // 2. SI SCENDE con l'interfaccia vera
  await page.reload({ waitUntil: 'load' });
  await page.locator(`.stampa-caso[data-ep="${id}"]`).click();
  await page.locator('#apri-caso').click();
  await page.locator('#via').waitFor({ timeout: 15000 });
  await page.locator('#via').click();
  await page.waitForFunction((k) => {
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    return p.spedizione && p.spedizione.digitale === true;
  }, `osr.partita.${id}`, { timeout: 15000 });

  // 3. QUEL CHE LA SPEDIZIONE HA DAVVERO
  const reale = await page.evaluate(async ({ id, party }) => {
    const j = async (k) => (await fetch(`/data/${k}.json`)).json();
    const [comune, carte, ep] = await Promise.all([j('comune'), j('carte'), j(id)]);
    const stat = await import('/motore/stat.js');
    const { applica } = await import('/motore/comandi.js');
    const partita = JSON.parse(localStorage.getItem(`osr.partita.${id}`));
    const g = { ep, comune, carte, partita, sp: partita.spedizione, _layout: null };
    const azioni = Object.fromEntries(party.map((nm) => [nm, stat.azioniMax(g, nm)]));
    // il 1° round: quante carte Minaccia si pescano, con questo stato
    let minacce = null; let annuncio = null;
    try {
      const m = applica(partita, { tipo: 'fase-minaccia' }, { ep, comune, carte });
      minacce = (m.stato.spedizione || {}).minacceTotali ?? null;
      annuncio = ((m.eventi || []).find((e) => e.tipo === 'annuncio') || {}).testo || null;
    } catch (e) { minacce = `errore: ${e.message}`; }
    return {
      vantaggi: partita.vantaggi, round: partita.spedizione.round, canto: partita.spedizione.canto,
      vite: partita.spedizione.vite, azioni, minacce, annuncio,
      chiaviSp: Object.keys(partita.spedizione),
      nemici: (partita.spedizione.nemici || []).map((n) => n.nome + '@' + (n.pos || {}).t),
      effetti: partita.spedizione.effetti || null, intuizione: partita.spedizione.intuizione,
      modNemici: partita.spedizione.modNemici || null, saltaNemici: partita.spedizione.saltaNemici || null,
      promemoria: (partita.spedizione.promemoria || []).length,
      chiaviPartita: Object.keys(partita),
    };
  }, { id, party: PARTY });

  // 4. IL CONFRONTO con la regola stampata
  const c = [];
  const ok = (cond, msg) => c.push({ ok: !!cond, msg });
  const v = reale.vantaggi || {};
  ok(regolaTier(s) === s.tier, `(la scena e' coerente: ${s.nome} -> ${s.tier})`);
  ok(v.tier === s.tier, `gradino: la regola dice ${s.tier}, la busta ha dato ${v.tier}`);
  ok(!!v.dossier === s.dossier, `dossier: la regola dice ${s.dossier}, la busta ha dato ${!!v.dossier}`);
  ok(reale.canto === cantoAtteso, `Canto di partenza: atteso ${cantoAtteso}, la Spedizione parte da ${reale.canto}`);
  ok(reale.round === 1, `la Spedizione parte dal round 1 (visto ${reale.round})`);
  for (const nm of PARTY) {
    const base = COMUNE.eroi.find((e) => e.nome === nm).salute;
    const atteso = base + BONUS_TAGLIA + bonusTier + saluteExtra;
    ok(reale.vite[nm] === atteso,
       `Salute di ${nm.split(' ')[0]}: attesa ${atteso} (${base} base + ${BONUS_TAGLIA} taglia + ${bonusTier} vantaggio${saluteExtra ? ` + ${saluteExtra} episodio` : ''}), in gioco ${reale.vite[nm]}`);
  }
  const azAttese = s.tier === 'slancio' ? 3 : 2;
  ok(PARTY.every((nm) => reale.azioni[nm] === azAttese),
     `azioni nel 1° round: attese ${azAttese} a testa, in gioco ${PARTY.map((nm) => reale.azioni[nm]).join('/')}`);

  // GLI EFFETTI STRUTTURATI DELLE DOMANDE, letti dai dati e confrontati con lo stato in gioco
  const esito = (d) => (s.giuste ? d.premio : d.penalita) || {};
  const attesi = inBusta.map(esito);
  const spawnAtteso = {};
  for (const x of attesi) for (const [n, q] of Object.entries(x.spawn_t1 || {})) spawnAtteso[n] = (spawnAtteso[n] || 0) + q;
  const t0 = ep.tessere[0].id;
  for (const [n, q] of Object.entries(spawnAtteso)) {
    const visti = reale.nemici.filter((x) => x === `${n}@${t0}`).length;
    ok(visti === q, `nemici di ${t0} alla partenza: attesi ${q} ${n}, in gioco ${visti}`);
  }
  if (!Object.keys(spawnAtteso).length) {
    ok(!reale.nemici.length, `nessun nemico alla partenza (vista: ${reale.nemici.join(', ') || 'nessuno'})`);
  }
  const boss = (ep.soluzione || {}).boss;
  const saltaAtteso = attesi.map((x) => x.boss_salta).filter(Boolean)[0];
  if (saltaAtteso) {
    ok(((reale.saltaNemici || {})[boss] || {})[saltaAtteso] === 1, `${boss}: salta la prima ${saltaAtteso} (Domanda esatta)`);
  } else ok(!reale.saltaNemici, 'nessun salto del boss');
  const difAtteso = attesi.reduce((n, x) => n + (x.boss_difesa || 0), 0);
  ok((((reale.modNemici || {})[boss] || {}).dif || 0) === difAtteso, `${boss}: Difesa ${difAtteso >= 0 ? '+' : ''}${difAtteso} (Domanda esatta)`);
  ok(reale.intuizione === (s.dossier ? 1 : 0), `gettone Intuizione: atteso ${s.dossier ? 1 : 0}, in gioco ${reale.intuizione}`);
  ok(reale.promemoria >= 0 && Array.isArray(reale.chiaviSp), 'il promemoria delle Domande sta nello stato');
  const extraAtteso = attesi.reduce((n, x) => n + (x.minaccia_extra_r1 || 0), 0);
  ok(((reale.effetti || {}).minaccia_extra_r1 || 0) === extraAtteso, `Minaccia extra nel 1° round: attese ${extraAtteso}`);

  // LE COSE PROMESSE CHE LA SPEDIZIONE NON HA: si registrano come lacune, non come errori di calcolo
  const gap = [];
  const anomalie = [];
  // ANOMALIA: alla prima fase Minaccia il motore dice che l'obiettivo e' gia' compiuto e il mazzo non
  // pesca piu'. Vale per tutta la partita: nessuna pressione, e le Domande che la toccano non contano
  if (reale.annuncio && /Obiettivo compiuto/.test(reale.annuncio)) {
    anomalie.push(`al round 1 il motore dichiara l'obiettivo GIA' compiuto: «${reale.annuncio}» — il mazzo Minaccia non pesca mai`);
  }
  const q1 = inBusta[0] || {};
  const nessunaMinaccia = /1° round[^.]*non si pesca nessuna carta Minaccia|1° round della (spedizione|discesa|scorta)[^.]*non si pesca nessuna carta Minaccia/i
    .test(String(q1.esatta || ''));
  if (nessunaMinaccia && s.giuste) {
    if (reale.minacce !== 0 && !anomalie.length) {
      gap.push(`Domanda 1 esatta: «nel 1° round non si pesca nessuna carta Minaccia» — la Spedizione ne pesca ${reale.minacce}`);
    }
  }
  if (s.dossier && !(reale.chiaviSp.concat(reale.chiaviPartita)).some((k) => /intuizion/i.test(k))) {
    gap.push('Dossier completo: «1 gettone Intuizione» (un ri-tiro) — nessuno stato lo tiene, nessun comando lo spende');
  }
  return { controlli: c, gap: gap.filter(Boolean), anomalie, reale };
}

for (const id of IDS) {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  const nLuoghi = (leggi(id).luoghi || []).length;
  for (const s of SCENARI) {
    // «6+ luoghi visitati» non si puo' provare dove i luoghi sono meno di sei (il preludio ne ha 4)
    if (s.luoghi > nLuoghi) { console.log(`${id.padEnd(9)} ${s.nome.padEnd(20)} n/a (l'episodio ha ${nLuoghi} luoghi)`); continue; }
    let r;
    try { r = await provaUno(page, id, s); }
    catch (e) { r = { errore: e.message.split('\n')[0] }; }
    risultati.push({ ep: id, scenario: s.nome, ...r });
    const falliti = (r.controlli || []).filter((x) => !x.ok);
    if (r.errore || falliti.length) ko += 1;
    console.log(`${id.padEnd(9)} ${s.nome.padEnd(20)} ${r.errore ? 'ERRORE ' + r.errore
      : falliti.length ? 'KO ' + falliti.map((x) => x.msg).join(' | ') : 'ok'}${
      (r.gap || []).length ? `  [lacune: ${r.gap.length}]` : ''}${
      (r.anomalie || []).length ? '  [ANOMALIA]' : ''}`);
  }
  if (errori.length) console.log(`   !! errori JS in ${id}: ${errori.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
await browser.close();
const jsonArg = process.argv.find((a) => a.startsWith('--json='));
if (jsonArg) writeFileSync(jsonArg.slice(7), JSON.stringify(risultati, null, 1));

// LA SINTESI: le lacune, raggruppate
const lacune = new Map();
for (const r of risultati) for (const g of (r.gap || [])) {
  const k = g.replace(/ — la Spedizione ne pesca \d+/, '');
  lacune.set(k, (lacune.get(k) || new Set()).add(r.ep));
}
console.log('\n=== LACUNE (promesso dalle regole, non applicato dalla Spedizione) ===');
for (const [k, eps] of lacune) console.log(`- ${k}\n    in: ${[...eps].join(', ')}`);
if (!lacune.size) console.log('nessuna');

const anom = new Map();
for (const r of risultati) for (const a of (r.anomalie || [])) anom.set(r.ep, a);
console.log('\n=== ANOMALIE (la Spedizione fa una cosa diversa dal gioco) ===');
for (const [ep, a] of anom) console.log(`- ${ep}: ${a}`);
if (!anom.size) console.log('nessuna');

// LE DOMANDE: ognuna promette un effetto in Spedizione. Quelli con un campo strutturato
// (`premio` / `penalita`, vedi EFFETTI_DOMANDE in export-data.py) li applica il motore
// (motore/domande.js); il resto e' prosa, e la Spedizione lo ripropone come promemoria.
const CATEGORIE = [
  ['nessuna Minaccia nel 1° round (esatta)', (d) => /non si pesca nessuna carta Minaccia/i.test(d.esatta)],
  ['nemico extra in T1 alla rivelazione (sbagliata)', (d) => /appar(e|ono)[^.]* in T1/i.test(d.sbagliata) || /Minaccia extra/i.test(d.sbagliata)],
  ['Canto di partenza (sbagliata)', (d) => /segnalin\w* Canto in pi/i.test(d.sbagliata)],
  ["il boss salta un'attivazione/attacco (esatta)", (d) => /salta (la sua |il suo )?(PRIMA|PRIMO|un|la prossima)[^.]*(attivazione|attacco|colpo)|non vengono piazzati/i.test(d.esatta)],
  ['effetto sulla traccia, sulle tessere o sulle prove', (d) => /traccia|tessera|T[1-9]\b|prova|Difesa|automatic|vittoria (piena|parziale|pulita|amara)/i.test(`${d.esatta} ${d.sbagliata}`)],
];
const conta = new Map(); let tot = 0; let strutturate = 0; let senzaEffetto = 0;
const mancantiCanto = [];
for (const id of IDS.filter((x) => x !== 'preludio')) {
  const d = ((leggi(id).soluzione || {}).domande || []).filter((x) => !x.dopo_spedizione);
  d.forEach((q, i) => {
    tot += 1;
    const cantoScritto = /segnalin\w* Canto in pi/i.test(q.sbagliata);
    const strutturata = !!Object.keys(q.premio || {}).length || !!Object.keys(q.penalita || {}).length;
    if (strutturata) strutturate += 1;
    else if (cantoScritto) mancantiCanto.push(`${id}.${i + 1}`);
    if (strutturata) return;                      // gia' applicata: non e' una lacuna
    const cat = CATEGORIE.find(([, f]) => f(q));
    if (!cat) { senzaEffetto += 1; return; }
    conta.set(cat[0], (conta.get(cat[0]) || 0) + 1);
  });
}
console.log(`\n=== LE ${tot} DOMANDE DI EP.1-20 ===`);
console.log(`con un effetto strutturato che il motore applica (premio o penalita): ${strutturate}`);
console.log('rimaste in prosa (promemoria in Spedizione, da giocare a mano), per tipo:');
if (mancantiCanto.length) console.log(`Canto scritto nel testo ma SENZA penalita.canto (il motore non lo applica): ${mancantiCanto.join(', ')}`);
for (const [k, n] of conta) console.log(`- ${k}: ${n}`);
console.log(`- senza effetto meccanico riconoscibile (narrativa, seme di campagna): ${senzaEffetto}`);
console.log(ko ? `\n${ko} scenari con errori di calcolo` : '\naudit: i numeri del vantaggio tornano in tutti gli scenari');
process.exit(ko ? 1 : 0);
