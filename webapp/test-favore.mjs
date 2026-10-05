// FAVORE: «rivelate una tessera coperta adiacente» si fa davvero, scelta dai
// giocatori. node webapp/test-favore.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { favoreDaTesto } from './public/motore/minaccia.js';
import { statoCompiti } from './public/motore/obiettivi.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);
const carica = (id) => ({ ep: JSON.parse(readFileSync(`webapp/data/${id}.json`, 'utf8')), comune: COMUNE, carte: CARTE });
const nuova = (id, dati, titolo, rivelate, oggetti = []) => {
  const t0 = dati.ep.tessere[0].id; const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: t0, x: i % 4, y: 0 }; vite[n] = COMUNE.eroi.find((x) => x.nome === n).salute; });
  return {
    v: 1, episodio: id, modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti, caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme: 7, passo: 0 },
    spedizione: {
      round: 3, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: rivelate || [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], insidie: {}, abilita: {},
      mazzo: { pool: [titolo], ordine: [0], indice: 0 },
    },
  };
};
const tutte = Object.entries(CARTE.minacce).flatMap(([e, l]) => l.map((c) => ({ ...c, e })));
const favori = tutte.filter((c) => /^Favore/.test(c.title));
const std = favori.filter((c) => c.e !== 'ep20');
ok(std.length === 19 && std.every((c) => favoreDaTesto(c.rules.split('{divider}').pop())), `${std.length} carte Favore riconosciute`);
ok(tutte.filter((c) => !/^Favore/.test(c.title)).every((c) => !favoreDaTesto(c.rules.split('{divider}').pop())), 'nessun altra carta scambiata per Favore');

// ogni episodio: i candidati sono esattamente le porte coperte della tessera dove stanno gli eroi
for (const c of std) {
  const dati = carica(c.e); const s = nuova(c.e, dati, c.title);
  const o = applica(s, { tipo: 'fase-minaccia' }, dati);
  const t0 = dati.ep.tessere[0];
  const attesi = Object.values(t0.exits || {}).map((r) => r.match(/^\S+/)[0]).sort().join();
  const cand = ((o.stato.spedizione.carta || {}).favore || {}).candidati || [];
  if (cand.map((x) => x.dest).sort().join() !== attesi) ok(false, `${c.e}: candidati ${cand.map((x) => x.dest)} ≠ uscite ${attesi}`);
}
ok(ko === 0, 'candidati = uscite della tessera degli eroi, in tutti gli episodi');

// ep10: scelta e rivelazione
const dati = carica('ep10'); const c10 = std.find((c) => c.e === 'ep10');
let s = nuova('ep10', dati, c10.title);
let o = applica(s, { tipo: 'fase-minaccia' }, dati);
s = o.stato; const f = s.spedizione.carta.favore;
ok(f && f.candidati.length >= 1, 'la carta lascia i candidati');
ok(applica(s, { tipo: 'carta-vista' }, dati).rifiuto, 'non si va avanti senza scegliere');
const nonCand = dati.ep.tessere.map((t) => t.id).find((id) => !f.candidati.some((x) => x.dest === id) && id !== dati.ep.tessere[0].id);
ok(nonCand && applica(s, { tipo: 'favore', tessera: nonCand }, dati).rifiuto, 'una tessera non candidata e\' rifiutata');
const dest = f.candidati[0].dest;
o = applica(s, { tipo: 'favore', tessera: dest }, dati);
ok(!o.rifiuto && o.stato.spedizione.rivelate.includes(dest), 'la tessera scelta si rivela');
ok(o.eventi.some((e) => e.tipo === 'rivelata' && e.tessera === dest), 'evento rivelata');
const c1 = o.stato.spedizione.carta;
ok(!c1 || !c1.favore, 'la scelta e\' consumata');
ok(applica(o.stato, { tipo: 'favore', tessera: dest }, dati).rifiuto, 'non si usa due volte');
const tdest = dati.ep.tessere.find((t) => t.id === dest);
if (tdest.testo) ok(c1 && c1.tessera === dest && c1.testo === tdest.testo, 'il testo della tessera si legge');

// nessun candidato: tutto gia' rivelato
s = nuova('ep10', dati, c10.title, dati.ep.tessere.map((t) => t.id));
o = applica(s, { tipo: 'fase-minaccia' }, dati);
ok(!o.rifiuto && !o.stato.spedizione.carta.favore && o.stato.spedizione.carta.annunci.some((a) => /Nessuna tessera/.test(a)), 'nessun candidato: lo dice e non blocca');
ok(!applica(o.stato, { tipo: 'carta-vista' }, dati).rifiuto, '...e si va avanti');

// eroi a terra: non contano
s = nuova('ep10', dati, c10.title); party.forEach((n) => { s.spedizione.vite[n] = 0; });
o = applica(s, { tipo: 'fase-minaccia' }, dati);
ok(!o.stato.spedizione.carta.favore, 'eroi tutti a terra: nessun candidato');

// Ep20: controcanto
const d20 = carica('ep20'); const c20 = favori.find((c) => c.e === 'ep20');
const tutteT = d20.ep.tessere.map((t) => t.id);
const rit = d20.ep.compiti.find((x) => x.ritmo);
const prova = (rivelate, oggetti) => {
  const st = nuova('ep20', d20, c20.title, rivelate, oggetti);
  const out = applica(st, { tipo: 'fase-minaccia' }, d20);
  return { v: (out.stato.spedizione.compiti || {})[rit.id] || 0, ann: out.stato.spedizione.carta.annunci };
};
ok(prova(tutteT, ['Mappa Acustica']).v === 1, 'Ep20: con la Mappa Acustica il controcanto avanza di 1');
ok(prova(tutteT, []).v === 0, 'Ep20: senza Mappa Acustica non avanza (e lo dice)');
ok(prova([d20.ep.tessere[0].id], ['Mappa Acustica']).v === 0, 'Ep20: prima della camera non avanza');

console.log(ko ? `\n${ko} KO` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
