// DANNO: le carte «subisce 1 danno» colpiscono davvero. node webapp/test-danno.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { dannoDaTesto } from './public/motore/minaccia.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const ep = JSON.parse(readFileSync('webapp/data/ep10.json', 'utf8'));
const dati = { ep, comune: COMUNE, carte: CARTE };
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);
const t0 = ep.tessere[0].id;

const nuova = (titolo, seme = 7, vive = party) => {
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: t0, x: i % 4, y: 0 }; vite[n] = vive.includes(n) ? COMUNE.eroi.find((x) => x.nome === n).salute : 0; });
  return {
    v: 1, episodio: 'ep10', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme, passo: 0 },
    spedizione: {
      round: 3, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], insidie: {}, abilita: {},
      mazzo: { pool: [titolo], ordine: [0], indice: 0 },
    },
  };
};
const pesca = (s) => applica(s, { tipo: 'fase-minaccia' }, dati);
const perso = (s0, s1) => party.filter((n) => s1.spedizione.vite[n] < s0.spedizione.vite[n]);

const tutte = Object.entries(CARTE.minacce).flatMap(([e, l]) => l.map((c) => ({ ...c, e })));
const danni = tutte.filter((c) => /^Danno/.test(c.title));
ok(danni.length === 12 && danni.every((c) => dannoDaTesto(c.rules.split('{divider}').pop())), `${danni.length} carte Danno riconosciute`);
ok(tutte.filter((c) => !/^Danno/.test(c.title)).every((c) => !dannoDaTesto(c.rules.split('{divider}').pop())), 'nessun altra carta scambiata per Danno');

// a caso: colpisce UN eroe, 1 punto
const titoloCaso = danni.find((c) => c.e === 'ep10').title;
let s = nuova(titoloCaso);
let o = pesca(s);
const colpiti = perso(s, o.stato);
ok(!o.rifiuto && colpiti.length === 1 && o.stato.spedizione.vite[colpiti[0]] === s.spedizione.vite[colpiti[0]] - 1, 'a caso: un eroe perde 1 vita');
ok(o.stato.spedizione.carta.annunci.some((a) => /danno/i.test(a)), 'l\'annuncio dice il danno');

// il caso varia davvero
const visti = new Set();
for (let seme = 1; seme <= 60; seme++) { const x = nuova(titoloCaso, seme); visti.add(perso(x, pesca(x).stato)[0]); }
ok(visti.size >= 3, `con semi diversi colpisce eroi diversi (${visti.size})`);

// un solo vivo: colpisce lui; a terra non vengono colpiti
s = nuova(titoloCaso, 3, [party[2]]);
o = pesca(s);
ok(perso(s, o.stato).join() === party[2], 'un solo vivo: colpisce lui');

// vita 1 -> a terra
s = nuova(titoloCaso, 3, [party[1]]); s.spedizione.vite[party[1]] = 1;
o = pesca(s);
ok(o.stato.spedizione.vite[party[1]] === 0 && o.stato.spedizione.carta.annunci.some((a) => /a terra/.test(a)), 'eroe a 1 vita va a terra e lo dice');

// tutti a terra: nessun effetto, nessuna eccezione
s = nuova(titoloCaso, 3, []);
o = pesca(s);
ok(!o.rifiuto && perso(s, o.stato).length === 0, 'tutti a terra: nessun effetto');

// Ep7: il piu' avanzato
const ep7 = JSON.parse(readFileSync('webapp/data/ep7.json', 'utf8'));
const dati7 = { ep: ep7, comune: COMUNE, carte: CARTE };
const lontana = ep7.tessere[ep7.tessere.length - 1].id;
s = nuova(danni.find((c) => c.e === 'ep7').title); s.episodio = 'ep7';
s.spedizione.rivelate = ep7.tessere.map((t) => t.id);
party.forEach((n) => { s.spedizione.eroiPos[n] = { t: ep7.tessere[0].id, x: 0, y: 0 }; });
s.spedizione.eroiPos[party[3]] = { t: lontana, x: 0, y: 0 };
o = applica(s, { tipo: 'fase-minaccia' }, dati7);
ok(perso(s, o.stato).join() === party[3], 'Ep7: colpisce l\'eroe piu\' avanzato');

console.log(ko ? `\n${ko} KO` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
