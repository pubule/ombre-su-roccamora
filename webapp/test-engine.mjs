// Test di gameplay del motore arbitro: gioca coi DATI REALI dei tre episodi
// (bussare, stradario, orologi, mazzo, Canto, Cercare, busta) e verifica che
// ogni carta/arte referenziata esista davvero su disco (webapp/assets).
//
// Uso:  node webapp/test-engine.mjs        (exit 1 se un check fallisce)
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import * as E from './public/js/engine.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const json = (f) => JSON.parse(readFileSync(path.join(DIR, 'data', f), 'utf8'));
const comune = json('comune.json');
const carte = json('carte.json');
const EPISODI = { preludio: json('preludio.json'), ep1: json('ep1.json'), ep2: json('ep2.json'), ep3: json('ep3.json'), ep4: json('ep4.json'), ep5: json('ep5.json'), ep6: json('ep6.json'), ep7: json('ep7.json'), ep8: json('ep8.json'), ep9: json('ep9.json'), ep10: json('ep10.json'), ep11: json('ep11.json'), ep12: json('ep12.json'), ep13: json('ep13.json') };

let errori = 0;
const ko = (msg) => { errori += 1; console.log('  KO', msg); };
const ok = (cond, msg) => { if (!cond) ko(msg); };

// un URL /assets/... deve corrispondere a un file vero in webapp/assets
const assetEsiste = (url) => existsSync(path.join(DIR, decodeURIComponent(url.replace(/^\/assets\//, 'assets/'))));

for (const [epId, ep] of Object.entries(EPISODI)) {
  // Fase D non ancora fatta (niente arte, niente carte renderizzate): i jpg
  // si controllano solo se la cartella cards/ dell'episodio esiste.
  const carteRese = existsSync(path.join(DIR, 'assets', ep.cartella, 'cards'));
  if (!carteRese) console.log(`  AVVISO ${epId}: assets/${ep.cartella}/cards assente - check jpg saltati (Fase D)`);
  const okJpg = (cond, msg) => carteRese ? ok(cond, msg) : true;
  console.log(`\n=== ${epId} — ${ep.titolo} ===`);

  // --- stradario: ogni luogo ha la sua voce sulla mappa dell'episodio ----
  const voci = E.vociMappa(ep, comune).map((v) => E.norm(v.nome));
  for (const l of ep.luoghi) {
    ok(voci.includes(E.norm(l.voce_mappa)),
       `voce di mappa mancante per "${l.voce_mappa}" (L${l.n})`);
    const r = E.dichiaraVoce(ep, comune, l.voce_mappa);
    ok(r.tipo === 'visita' && r.luogo.n === l.n, `dichiaraVoce non trova L${l.n}`);
  }
  ok(E.dichiaraVoce(ep, comune, 'Vicolo Inesistente').tipo === 'fredda',
     'voce inventata non dà pista fredda');

  // --- bussare: chiave giusta apre, sbagliata no, aperti sempre ----------
  for (const l of ep.luoghi) {
    if (!l.chiave) {
      ok(E.bussa(l, 'qualunque').entra, `L${l.n} aperto ma bussa nega`);
      continue;
    }
    ok(E.bussa(l, l.chiave[1]).entra, `L${l.n} chiave esatta non apre`);
    ok(!E.bussa(l, 'parola sbagliata').entra, `L${l.n} si apre con parola sbagliata`);
    ok(!E.bussa(l, 'x').entra, `L${l.n} si apre con una lettera`);
  }

  // --- orologio: luoghi che chiudono -------------------------------------
  for (const l of ep.luoghi.filter((x) => x.chiude != null)) {
    ok(E.luogoVisitabile(l, l.chiude - 1), `L${l.n} chiuso prima dell'ora`);
    ok(!E.luogoVisitabile(l, l.chiude), `L${l.n} aperto oltre l'orario`);
  }

  // --- carte: ogni riferimento esiste (jpg della carta + arte del banner) -
  for (const l of ep.luoghi) {
    const cl = E.cartaLuogo(carte, epId, l.n);
    ok(cl, `carta Luogo mancante per L${l.n}`);
    if (cl) okJpg(assetEsiste(E.urlCarta(cl.file)), `jpg mancante: ${cl.file} (L${l.n})`);
    if (l.art) okJpg(assetEsiste(E.urlArt(l.art)), `arte mancante: ${l.art} (L${l.n})`);
    for (const a of l.approfondimenti || []) {
      const ca = E.cartaApprofondimento(carte, epId, a.soggetto);
      ok(ca, `carta Approfondimento mancante: "${a.soggetto}" (L${l.n})`);
      if (ca) okJpg(assetEsiste(E.urlCarta(ca.file)), `jpg mancante: ${ca.file}`);
    }
    for (const o of l.oggetti || []) {
      const co = E.cartaOggetto(carte, epId, o);
      ok(co, `carta Oggetto mancante: "${o}" (L${l.n})`);
    }
  }

  // --- cariche: ogni tipo di Approfondimento ha almeno uno sbloccatore ----
  const tipi = new Set(ep.luoghi.flatMap((l) => (l.approfondimenti || []).map((a) => a.tipo)));
  for (const tipo of tipi) {
    const partita = { party: comune.eroi.map((e) => e.nome), indagine: { caricheUsate: {} } };
    ok(E.idoneiPerTipo(comune, partita, tipo).length > 0,
       `nessun eroe può sbloccare il tipo "${tipo}"`);
  }

  // --- mazzo Minaccia: costruzione, pesca, riciclo scarti -----------------
  const mazzo = E.costruisciMazzo(carte, ep, epId);
  ok(mazzo.pool.length > 0, 'mazzo Minaccia vuoto');
  ok(!mazzo.pool.some((t) => t.startsWith('Bivio')), 'carta Bivio nel mazzo base');
  const viste = new Set();
  for (let i = 0; i < mazzo.pool.length * 2; i++) {
    const c = E.pesca(mazzo, carte, epId, ep);
    ok(c, `pesca ${i + 1} non trova la carta`);
    if (c) {
      viste.add(c.title);
      okJpg(assetEsiste(E.urlCarta(c.file)), `jpg minaccia mancante: ${c.file}`);
    }
  }
  ok(viste.size === mazzo.pool.length, 'il riciclo degli scarti perde carte');
  ok(mazzo.rimescolato >= 1, 'mazzo mai rimescolato dopo due giri');

  // --- pesca per taglia (tabella regole) ----------------------------------
  for (let taglia = 2; taglia <= 10; taglia++) {
    const n1 = E.carteDaPescare(comune, taglia, 1, false, epId);
    const n2 = E.carteDaPescare(comune, taglia, 2, false, epId);
    ok(n1 >= 1 && n2 >= n1, `pesca taglia ${taglia} incoerente (r1=${n1}, r2=${n2})`);
    // il bonus Canto esiste solo negli episodi veri: la Marea del Preludio
    // rallenta il movimento, non la pesca
    if (epId !== 'preludio') {
      ok(E.carteDaPescare(comune, taglia, 1, true, epId) === n1 + 1,
         `bonus Canto non aggiunge 1 (taglia ${taglia})`);
    }
  }

  // --- Canto/Marea: tick e soglia una volta sola ---------------------------
  const sped = { round: 0, canto: 0 };
  const ogni = ep.marea ? ep.marea.ogni : comune.regole.tick_canto_ogni;
  const soglia = ep.marea ? ep.marea.soglia : comune.regole.soglia_canto;
  let annunciSoglia = 0;
  const roundGiocati = ogni * soglia + 4;
  for (let r = 1; r <= roundGiocati; r++) {
    const a = E.fineRound(comune, ep, sped);
    if (r % ogni === 0) ok(a.length >= 1, `round ${r}: tick mancato`);
    else ok(a.length === 0, `round ${r}: tick fuori tempo`);
    if (a.length >= 2) annunciSoglia += 1;   // tick + annuncio soglia/boss
  }
  const attesi = Math.floor(roundGiocati / ogni);
  ok(sped.canto === attesi, `segnalini a fine giro: ${sped.canto} (attesi ${attesi})`);
  ok(annunciSoglia === 1, `annuncio soglia ripetuto o assente (${annunciSoglia})`);

  // --- Cercare: ogni tessera risponde, senza mai un buco -------------------
  for (const t of ep.tessere) {
    const r = E.cerca(ep, {}, t.id);
    ok(r && r.esito && r.esito.length > 10, `Cercare muto su ${t.id}`);
  }
  ok(E.cerca(ep, {}, 'T99') === null, 'Cercare risponde su tessera inesistente');

  // --- la busta: risposte esatte passano, spazzatura no --------------------
  const esatte = ep.soluzione.domande.map((d) => d.risposta);
  ok(E.verificaRisposte(ep, esatte).every((r) => r.ok), 'risposte esatte bocciate');
  const spazzatura = ep.soluzione.domande.map(() => 'boh non lo so');
  ok(!E.verificaRisposte(ep, spazzatura).every((r) => r.ok), 'risposte a caso promosse');
  ok(E.verificaRisposte(ep, ep.soluzione.domande.map(() => '')).every((r) => !r.ok),
     'risposte vuote promosse');

  // --- anti-softlock: ogni chiave è scopribile partendo dai luoghi aperti --
  // BFS: un luogo bloccato è raggiungibile se la sua chiave (parola o nome
  // dell'oggetto) compare nei testi di un luogo già raggiunto. Fixpoint.
  {
    const testi = (l) => [l.testo, ...(l.indizi || []),
      ...(l.approfondimenti || []).map((a) => a.testo),
      ...(l.oggetti || []), ...(l.reperti || [])].join(' · ');
    const raggiunti = new Map(ep.luoghi.filter((l) => l.aperto).map((l) => [l.n, 0]));
    let cambiato = true;
    while (cambiato) {
      cambiato = false;
      const corpus = [...raggiunti.keys()]
        .map((n) => testi(ep.luoghi.find((l) => l.n === n)));
      for (const l of ep.luoghi) {
        if (raggiunti.has(l.n) || !l.chiave) continue;
        const profonditaFonti = corpus
          .map((t, i) => E.norm(t).includes(E.norm(l.chiave[1])) ? [...raggiunti.values()][i] : null)
          .filter((x) => x != null);
        if (profonditaFonti.length) {
          raggiunti.set(l.n, Math.min(...profonditaFonti) + 1);
          cambiato = true;
        }
      }
    }
    for (const l of ep.luoghi) {
      ok(raggiunti.has(l.n),
         `SOFTLOCK: la chiave di L${l.n} (${l.chiave ? l.chiave.join(':') : '?'}) non è scopribile da nessun luogo raggiungibile`);
      // un luogo che chiude a un orario deve avere la chiave a profondità 1
      // (da un luogo APERTO), o l'orologio può renderlo irraggiungibile
      if (l.chiude != null && raggiunti.has(l.n)) {
        ok(raggiunti.get(l.n) <= 1,
           `L${l.n} chiude alle ${l.chiude} ma la sua chiave richiede una catena di ${raggiunti.get(l.n)} sblocchi`);
      }
    }
  }

  // --- vantaggio di fine indagine ------------------------------------------
  // Slancio = TUTTE le risposte esatte E le ore avanzate; chiudere subito a
  // caso non paga (il bug dello "Slancio gratis")
  const v = ep.vantaggio || {};
  const tutteOk = ep.soluzione.domande.map(() => true);
  const t1 = E.tierIndagine(ep, { ora: 24 - (v.slancio_ore ?? 3), visitati: [] }, tutteOk);
  ok(t1.tier === 'slancio', `slancio non scatta con ${v.slancio_ore ?? 3} ore avanzate e 4/4 esatte`);
  const t2 = E.tierIndagine(ep, { ora: 18, visitati: [] }, ep.soluzione.domande.map(() => false));
  ok(t2.tier !== 'slancio', 'slancio gratis: chiusura immediata con risposte sbagliate');
  const unaNo = ep.soluzione.domande.map((_, i) => i !== 0);
  ok(E.tierIndagine(ep, { ora: 18, visitati: [] }, unaNo).tier !== 'slancio',
     'slancio con una risposta sbagliata');
  ok(E.tierIndagine(ep, { ora: 24, visitati: [] }, tutteOk).dossier, 'dossier non scatta a ore finite');
}

// --- eroi: carta e ritratto per tutti ---------------------------------------
console.log('\n=== comune — eroi ===');
for (const c of carte.eroi_carte) {
  ok(assetEsiste(E.urlCarta(c.file)), `jpg eroe mancante: ${c.file}`);
}
ok(carte.eroi_carte.length === comune.eroi.length,
   `carte eroi (${carte.eroi_carte.length}) != dati eroi (${comune.eroi.length})`);

console.log(errori ? `\n${errori} CHECK FALLITI` : '\nTUTTO OK');
process.exit(errori ? 1 : 0);
