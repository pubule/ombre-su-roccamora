// OSTACOLO: «muoversi costa il doppio» / «-1 al Movimento» valgono DAVVERO.
// Le carte si pescano dopo la fase Eroi: l'effetto vale per la fase Eroi del
// round dopo. node webapp/test-ostacolo.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { raggEroe, movimento } from './public/motore/stat.js';
import { ostacoloDaTesto } from './public/motore/minaccia.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const ep = JSON.parse(readFileSync('webapp/data/ep5.json', 'utf8'));
const dati = { ep, comune: COMUNE, carte: CARTE };
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);
const t0 = ep.tessere[0].id;

const nuova = (round, titolo) => {
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: t0, x: i % 4, y: 0 }; vite[n] = COMUNE.eroi.find((x) => x.nome === n).salute; });
  return {
    v: 1, episodio: 'ep5', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme: 7, passo: 0 },
    spedizione: {
      round, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], insidie: {}, abilita: {},
      mazzo: { pool: [titolo], ordine: [0], indice: 0 },
    },
  };
};
const gDi = (s) => ({ ...dati, sp: s.spedizione, partita: s });
const maxDist = (g, nm) => Math.max(0, ...Object.values(raggEroe(g, nm)).map((v) => v.dist));
const nCelle = (g, nm) => Object.keys(raggEroe(g, nm)).length;

// il testo di OGNI carta Ostacolo con quelle formule viene riconosciuto
const tutte = Object.values(CARTE.minacce).flat();
const doppie = tutte.filter((c) => /muoversi costa il doppio/i.test(c.rules));
ok(doppie.length >= 25 && doppie.every((c) => ostacoloDaTesto(c.rules.split('{divider}').pop()).doppio), `${doppie.length} carte «costa il doppio» riconosciute`);
const meno = tutte.filter((c) => /-1 al Movimento/i.test(c.rules));
ok(meno.length >= 1 && meno.every((c) => ostacoloDaTesto(c.rules).meno1), 'carta «-1 al Movimento» riconosciuta');

// 1. base: senza carta si arriva a 3
let s = nuova(3, 'Ostacolo — Le Impalcature');
const nm = party[0];
const base = maxDist(gDi(s), nm); const baseN = nCelle(gDi(s), nm);
ok(base === movimento(gDi(s), nm), `senza ostacolo il raggio e' il Movimento (${base})`);

// 2. si pesca nella fase Minaccia del round 3: NON vale subito...
let out = applica(s, { tipo: 'fase-minaccia' }, dati);
ok(!out.rifiuto && out.stato.spedizione.carta, 'la carta si pesca e resta aperta');
s = out.stato;
ok(s.spedizione.ostacoli && s.spedizione.ostacoli.round === 4 && s.spedizione.ostacoli.doppio, 'effetto fissato per il round 4');
s.spedizione.fase = 'eroi';
ok(maxDist(gDi(s), nm) === base, 'nel round in cui si pesca non cambia nulla (round 3)');

// 3. ...vale nella fase Eroi del round dopo
s.spedizione.round = 4; s.spedizione.fase = 'eroi'; s.spedizione.carta = null;
const g4 = gDi(s);
ok(nCelle(g4, nm) < baseN, `meno caselle col doppio (${nCelle(g4, nm)} < ${baseN})`);
ok(maxDist(g4, nm) === 2, 'con Movimento 3 ci si muove di 1 casella (costo 2)');
ok(Object.values(raggEroe(g4, nm)).every((v) => v.dist === 2), 'tutte le caselle raggiungibili costano 2');

// 4. dal round 5 e' finito
s.spedizione.round = 5;
ok(maxDist(gDi(s), nm) === base, 'dal round dopo l\'effetto e\' scaduto');

// 5. -1 Movimento
let s2 = nuova(3, 'Ostacolo — Corrente Gelida');
const cg = tutte.find((c) => /-1 al Movimento/.test(c.rules));
s2.spedizione.mazzo.pool = [cg.title];
const catalogo = { ...dati, carte: { ...CARTE, minacce: { ...CARTE.minacce, ep5: [...CARTE.minacce.ep5, cg] } } };
out = applica(s2, { tipo: 'fase-minaccia' }, catalogo);
s2 = out.stato; s2.spedizione.round = 4; s2.spedizione.carta = null;
const gm = { ...catalogo, sp: s2.spedizione, partita: s2 };
ok(s2.spedizione.ostacoli && s2.spedizione.ostacoli.meno1, 'Corrente Gelida fissa -1 Movimento');
ok(movimento(gm, nm) === movimento(gDi(nuova(3, 'x')), nm) - 1, '-1 al Movimento nel round dopo');

process.exit(ko ? 1 : 0);
