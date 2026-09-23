// GLI EFFETTI DELLE DOMANDE, senza schermo.
//
// La busta d'Indagine promette un effetto per ogni Domanda («esatta: nel 1° round
// non si pesca nessuna carta Minaccia», «sbagliata: 1 Sgherro appare in T1»).
// L'audit del 21/09/2026 (AUDIT-VANTAGGI-INDAGINE.md) trovo' che la Spedizione
// non ne applicava quasi nessuno. Qui si prova che quelli che il motore sa
// applicare vengano applicati davvero — sui dati veri di ogni episodio — e che
// senza risposte (il pilota di misura) non cambi niente.
//
// node webapp/test-motore-domande.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import * as dom from './public/motore/domande.js';
import { nemStat } from './public/motore/stat.js';
import { pianoNemici } from './public/motore/nemici.js';
import { obiettivoFatto } from './public/motore/obiettivi.js';
import { provaDi } from './public/motore/azioni.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const leggi = (k) => JSON.parse(readFileSync(`webapp/data/${k}.json`, 'utf8'));
const COMUNE = leggi('comune');
const CARTE = leggi('carte');
const EROI = COMUNE.eroi.slice(0, 4).map((e) => e.nome);
const IDS = Array.from({ length: 20 }, (_, i) => `ep${i + 1}`);

// una Spedizione appena cominciata per l'episodio `id`, con le risposte date
const gioco = (id, risposte, over = {}) => {
  const ep = leggi(id);
  const T0 = ep.tessere[0].id;
  const partita = {
    v: 1, episodio: id, modo: 'digitale', party: EROI, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati', dossier: false, ...(risposte ? { risposte } : {}) },
    rng: { seme: 5, passo: 0 },
    spedizione: {
      digitale: true, round: 1, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [T0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos: Object.fromEntries(EROI.map((n, i) => [n, { t: T0, x: i % 2, y: Math.floor(i / 2) }])),
      vite: Object.fromEntries(EROI.map((n) => [n, 7])), azioni: {}, storditi: {}, eroiFatti: [],
      eroiAttivo: null, scortati: [], pendenza: null, insidie: {},
      mazzo: { pool: [((CARTE.minacce[id] || [])[0] || {}).title], ordine: [0], indice: 0 },
      ...over,
    },
  };
  return { ep, comune: COMUNE, carte: CARTE, partita, sp: partita.spedizione, _layout: null, T0 };
};
const tutte = (ep, v) => ((ep.soluzione || {}).domande || []).map(() => v);

// --- I DATI: ogni effetto dichiarato punta a qualcosa che esiste ---------------
{
  let canto = 0; let effetti = 0;
  for (const id of IDS) {
    const ep = leggi(id);
    const pool = Object.keys(ep.pool || {});
    const tessere = ep.tessere.map((t) => t.id);
    for (const d of ep.soluzione.domande) {
      if ((d.penalita || {}).canto) canto += 1;
      for (const x of [d.premio, d.penalita]) {
        if (!x) continue;
        effetti += 1;
        for (const n of Object.keys(x.spawn_t1 || {})) ok(pool.includes(n), `${id}: spawn_t1 «${n}» e' nel pool`);
        for (const [t, ns] of Object.entries(x.senza_spawn || {})) {
          ok(tessere.includes(t), `${id}: senza_spawn su una tessera che esiste (${t})`);
          for (const n of ns) ok(pool.includes(n), `${id}: senza_spawn «${n}» e' nel pool`);
        }
        for (const n of (x.smascherato || [])) ok(pool.includes(n), `${id}: smascherato «${n}» e' nel pool`);
        if (x.boss_salta || x.boss_difesa) ok(!!ep.soluzione.boss, `${id}: un effetto sul boss, e il boss c'e'`);
      }
    }
  }
  ok(canto === 11, `le 11 penalita' di Canto ci sono ancora (${canto})`);
  ok(effetti >= 50, `gli effetti strutturati sono almeno 50 (${effetti})`);
}

// --- SENZA RISPOSTE NON SI APPLICA NIENTE (il pilota semina il gradino e basta)
{
  const g = gioco('ep4', null);
  ok(Object.values(dom.effettiAttivi(g)).every((v) => !v || (typeof v === 'object' && !Object.keys(v).length && !Array.isArray(v)) || (Array.isArray(v) && !v.length)),
     'senza risposte non c\'e\' nessun effetto in vigore');
  dom.avviaEffetti(g, g.T0);
  ok(g.sp.nemici.length === 0, 'senza risposte nessun nemico compare in T1');
  ok(dom.minacceRound(g, 2) === 2, 'senza risposte le carte Minaccia sono quelle di sempre');
}

// --- LA DOMANDA 1 ESATTA: nel 1° round non si pesca -------------------------
for (const id of IDS) {
  const g = gioco(id, null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  dom.avviaEffetti(g, g.T0);
  ok(dom.minacceRound(g, 3) === 0, `${id}: Domande esatte, 1° round: nessuna carta Minaccia`);
  g.sp.round = 2;
  ok(dom.minacceRound(g, 3) === 3, `${id}: dal 2° round si pesca come sempre`);
}
{
  // e dentro il motore vero, con il comando che pesca
  const g = gioco('ep3', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  dom.avviaEffetti(g, g.T0);
  const out = applica(g.partita, { tipo: 'fase-minaccia' }, { ep: g.ep, comune: COMUNE, carte: CARTE });
  ok(!out.rifiuto, 'la fase Minaccia parte');
  ok(!out.stato.spedizione.carta, 'Domanda 1 esatta: nessuna carta aperta nel 1° round');
  ok((out.eventi || []).some((e) => e.tipo === 'annuncio' && /nessuna carta Minaccia/i.test(e.testo)),
     'e lo si dice (un annuncio, non un silenzio)');
  const sba = gioco('ep3', null); sba.partita.vantaggi.risposte = tutte(sba.ep, false);
  dom.avviaEffetti(sba, sba.T0);
  const o2 = applica(sba.partita, { tipo: 'fase-minaccia' }, { ep: sba.ep, comune: COMUNE, carte: CARTE });
  ok(o2.stato.spedizione.carta || o2.stato.spedizione.minacceTotali > 0, 'Domanda 1 sbagliata: si pesca');
}

// --- LA DOMANDA 1 SBAGLIATA di ep.1: una carta Minaccia in piu' ------------------
{
  const g = gioco('ep1', null); g.partita.vantaggi.risposte = tutte(g.ep, false);
  dom.avviaEffetti(g, g.T0);
  ok(dom.minacceRound(g, 2) === 3, 'ep.1, Domanda 1 sbagliata: 1 Minaccia extra nel 1° round');
  g.sp.round = 2; ok(dom.minacceRound(g, 2) === 2, 'ma solo nel 1°');
}

// --- I NEMICI DI T1 -------------------------------------------------------------
for (const [id, nome, q] of [['ep4', 'LA CLAQUE', 1], ['ep5', 'IL CONFRATELLO', 1], ['ep7', 'LO SGHERRO', 1],
                             ['ep19', 'LO SGHERRO', 1], ['ep2', 'LO SGHERRO', 2], ['ep3', 'LA VOCE CAVA', 1]]) {
  const g = gioco(id, null); g.partita.vantaggi.risposte = tutte(g.ep, false);
  dom.avviaEffetti(g, g.T0);
  const n = g.sp.nemici.filter((x) => x.nome === nome).length;
  ok(n === q, `${id}: Domande sbagliate, ${q} ${nome} in T1 alla partenza (visti ${n})`);
  ok(g.sp.nemici.every((x) => x.pos && x.pos.t === g.T0), `${id}: e stanno in ${g.T0}`);
  const e = gioco(id, null); e.partita.vantaggi.risposte = tutte(e.ep, true);
  dom.avviaEffetti(e, e.T0);
  ok(e.sp.nemici.length === 0, `${id}: Domande esatte, T1 vuota`);
}

// --- IL BOSS -------------------------------------------------------------------
{
  const g = gioco('ep2', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  const dif0 = nemStat(g, 'LO SCORIATORE').dif;
  dom.avviaEffetti(g, g.T0);
  ok(nemStat(g, 'LO SCORIATORE').dif === dif0 - 3, `ep.2: lo Scoriatore stonato ha Difesa ${dif0}→${dif0 - 3}`);
  ok(nemStat(g, 'LO SGHERRO').dif === nemStat(gioco('ep2', null), 'LO SGHERRO').dif, 'e nessun altro nemico cambia');
  ok(dom.saltaBoss(g, 'LO SCORIATORE', 'attivazione') === true, 'la prima attivazione si salta');
  ok(dom.saltaBoss(g, 'LO SCORIATORE', 'attivazione') === false, 'una volta sola');
  const s = gioco('ep2', null); s.partita.vantaggi.risposte = tutte(s.ep, false);
  dom.avviaEffetti(s, s.T0);
  ok(nemStat(s, 'LO SCORIATORE').dif === dif0, 'Domande sbagliate: Difesa intera');
}
{
  // il salto dentro la fase nemici: il boss c'e', tocca a lui, e non attacca
  const g = gioco('ep13', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  dom.avviaEffetti(g, g.T0);
  const boss = g.ep.soluzione.boss;
  g.sp.nemici.push({ nome: boss, num: 1, pos: { t: g.T0, x: 3, y: 1 }, ferite: 0, max: nemStat(g, boss).fer || 3 });
  g.sp.eroiPos[EROI[0]] = { t: g.T0, x: 3, y: 0 };            // adiacente
  const caso = { scegli: () => 0, tira2d6: () => ({ tot: 12, d: [6, 6] }) };
  const v0 = g.sp.vite[EROI[0]];
  const p1 = pianoNemici(g, caso, false);
  ok(g.sp.vite[EROI[0]] === v0, 'ep.13, Domanda 2 esatta: il boss salta il primo attacco (nessun danno)');
  ok(p1.some((x) => x.nome === boss), 'ma si muove/e in piano');
  pianoNemici(g, caso, false);
  ok(g.sp.vite[EROI[0]] < v0, 'dal secondo giro attacca');
}
{
  const g = gioco('ep3', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  dom.avviaEffetti(g, g.T0);
  const boss = g.ep.soluzione.boss;
  g.sp.nemici.push({ nome: boss, num: 1, pos: { t: g.T0, x: 3, y: 1 }, ferite: 0, max: 3 });
  g.sp.eroiPos[EROI[0]] = { t: g.T0, x: 3, y: 0 };
  const caso = { scegli: () => 0, tira2d6: () => ({ tot: 12, d: [6, 6] }) };
  const v0 = g.sp.vite[EROI[0]];
  const piano = pianoNemici(g, caso, false);
  ok(g.sp.vite[EROI[0]] === v0 && piano.some((x) => x.nome === boss && x.flash),
     'ep.3, «il nome vero»: il boss salta tutta la PRIMA attivazione');
  pianoNemici(g, caso, false);
  ok(g.sp.vite[EROI[0]] < v0, 'e dalla seconda agisce');
}

// --- SMASCHERATO e la tessera senza nemico ------------------------------------------
{
  const g = gioco('ep1', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  dom.avviaEffetti(g, g.T0);
  ok(dom.smascherati(g, 'ADEPTO INCAPPUCCIATO') === true, 'ep.1: il primo Adepto non viene piazzato');
  ok(dom.smascherati(g, 'ADEPTO INCAPPUCCIATO') === false, 'il secondo si');
  ok(dom.smascherati(g, 'LO SGHERRO') === false, 'e gli altri nemici non c\'entrano');
  const s = gioco('ep4', null); s.partita.vantaggi.risposte = tutte(s.ep, true);
  dom.avviaEffetti(s, s.T0);
  ok(dom.nonAppare(s, 'LA CLAQUE', 'T6') === true, 'ep.4: la scorta di Claque in T6 non appare');
  ok(dom.nonAppare(s, 'LA CLAQUE', 'T2') === false, 'ma altrove si');
}

// --- ep.3.4: l'insidia d'ingresso di T3 non scatta; ep.10.3: la traccia parte da 2 ---
{
  const chiedi = (g) => provaDi(g, { tipo: 'muovi', eroe: EROI[0], nodo: { t: 'T3', x: 0, y: 0 } });
  const g = gioco('ep3', null); g.partita.vantaggi.risposte = tutte(g.ep, true);
  const g0 = gioco('ep3', null); g0.partita.vantaggi.risposte = tutte(g0.ep, false);
  dom.avviaEffetti(g, g.T0); dom.avviaEffetti(g0, g0.T0);
  ok(chiedi(g0) !== null, 'ep.3, senza il premio: entrare in T3 chiede la prova (il banco non è vacuo)');
  ok(chiedi(g) === null, 'ep.3, Domanda 4 esatta: in T3 nessuna prova');
  const o = gioco('ep10', null); o.partita.vantaggi.risposte = [true, true, false, true];
  dom.avviaEffetti(o, o.T0);
  ok(o.sp.traccia === 2, `ep.10, Domanda 3 sbagliata: la DEMOLIZIONE parte da 2 (${o.sp.traccia})`);
  const b = gioco('ep10', null); b.partita.vantaggi.risposte = tutte(b.ep, true);
  dom.avviaEffetti(b, b.T0);
  ok(!b.sp.traccia, 'ep.10, tutte giuste: parte da 0');
  const n = gioco('ep10', null); dom.avviaEffetti(n, n.T0);
  ok(!n.sp.traccia, 'senza risposte: parte da 0 (il pilota non si ri-basa)');
}

// --- IL GETTONE INTUIZIONE: un ri-tiro, subito dopo un tiro fallito, una volta sola ---
{
  const DATI = { ep: null, comune: COMUNE, carte: CARTE };
  const g = gioco('ep1', null); g.partita.vantaggi.dossier = true;
  DATI.ep = g.ep;
  dom.avviaEffetti(g, g.T0);
  ok(g.sp.intuizione === 1, 'dossier completo: 1 gettone Intuizione');
  const senza = gioco('ep1', null); dom.avviaEffetti(senza, senza.T0);
  ok(senza.sp.intuizione === 0, 'senza dossier: nessun gettone');
  const eroe = EROI[0];
  const sgh = COMUNE.nemici[0].nome;
  g.sp.eroiPos[eroe] = { t: g.T0, x: 1, y: 1 };
  g.sp.nemici.push({ nome: sgh, num: 1, pos: { t: g.T0, x: 1, y: 2 }, ferite: 0, max: 2 });
  let out = applica(g.partita, { tipo: 'intuizione', eroe }, DATI);
  ok(out.rifiuto && /subito dopo un tiro fallito/.test(out.rifiuto.motivo), 'prima di un tiro fallito: rifiutato');
  out = applica(g.partita, { tipo: 'attacca', eroe, bersaglio: 0, tiri: [[1, 1]] }, DATI);
  ok(!out.rifiuto, 'attacco eseguito');
  const tiro = out.eventi.find((e) => e.tipo === 'tiro');
  ok(tiro && tiro.ok === false, "l'attacco 1+1 fallisce (il banco non è vacuo)");
  const speso = (out.stato.spedizione.azioni[eroe] || []).length;
  ok(speso === 1, "il tiro fallito ha consumato un'azione");
  const altro = applica(out.stato, { tipo: 'intuizione', eroe: EROI[1] }, DATI);
  ok(altro.rifiuto && /tocca a lui/.test(altro.rifiuto.motivo), 'un altro eroe non spende il ri-tiro di chi ha fallito');
  const dopo = applica(out.stato, { tipo: 'intuizione', eroe }, DATI);
  ok(!dopo.rifiuto, `Intuizione accettata (${dopo.rifiuto && dopo.rifiuto.motivo})`);
  ok((dopo.stato.spedizione.azioni[eroe] || []).length === 0, "l'azione è restituita");
  ok(dopo.stato.spedizione.intuizione === 0, 'il gettone è speso');
  ok(dopo.stato.spedizione.eroiAttivo === eroe, 'chi ha fallito è di nuovo in scena');
  const ancora = applica(dopo.stato, { tipo: 'intuizione', eroe }, DATI);
  ok(ancora.rifiuto && /Non avete il gettone/.test(ancora.rifiuto.motivo), 'una volta sola');
}

// --- IL PROMEMORIA: cio' che il motore non applica non sparisce --------------------
{
  const g = gioco('ep10', null); g.partita.vantaggi.risposte = [true, true, false, true];
  const p = dom.promemoria(g);
  ok(p.length >= 3, `ep.10: le Domande con un effetto sono nel promemoria (${p.length})`);
  const q3 = p.find((x) => x.n === 3);
  ok(q3 && !q3.esatta && /DEMOLIZIONE/i.test(q3.testo), 'ep.10, Domanda 3 sbagliata: il castigo della DEMOLIZIONE e\' scritto');
  ok(q3 && q3.automatico === true, 'ed è segnato come automatico (la traccia parte da 2 da sola)');
  ok(!p.some((x) => /^Nessun effetto/i.test(x.testo)), 'i «nessun effetto» non fanno rumore');
  const g1 = gioco('ep4', null); g1.partita.vantaggi.risposte = tutte(g1.ep, true);
  ok(dom.promemoria(g1).find((x) => x.n === 1).automatico === true, 'la Domanda 1 esatta e\' segnata come automatica');
}

// --- EP.9: la scorta parte gia' con il teste, ma l'obiettivo non e' compiuto ------
{
  const g = gioco('ep9', null);
  g.sp.scortati = [{ liberato: true, mosso: false, vite: 3, pos: { t: g.T0, x: 2, y: 1 } }];
  ok(obiettivoFatto(g) === false, 'ep.9: Riva parte libero e l\'obiettivo NON e\' compiuto al round 1');
  const out = applica(g.partita, { tipo: 'fase-minaccia' }, { ep: g.ep, comune: COMUNE, carte: CARTE });
  ok(!(out.eventi || []).some((e) => e.tipo === 'annuncio' && /Obiettivo compiuto/.test(e.testo)),
     'ep.9: il mazzo Minaccia pesca (niente «Obiettivo compiuto» al round 1)');
  // e negli altri episodi a scorta con PNG da liberare il comportamento non cambia
  const e1 = gioco('ep1', null);
  e1.sp.scortati = [{ liberato: true, mosso: false, pos: null }];
  ok(obiettivoFatto(e1) === true, 'ep.1: liberato il PNG, l\'obiettivo e\' compiuto (invariato)');
  e1.sp.scortati = [{ liberato: false, mosso: false, pos: null }];
  ok(obiettivoFatto(e1) === false, 'ep.1: PNG ancora prigioniero: non compiuto');
}

console.log(ko ? `${ko} FALLITI` : 'test-motore-domande: gli effetti delle Domande sono applicati');
process.exit(ko ? 1 : 0);
