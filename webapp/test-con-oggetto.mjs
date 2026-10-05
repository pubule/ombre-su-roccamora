// «CON [OGGETTO]»: le clausole condizionali delle carte Minaccia valgono davvero,
// e le conseguenze «perde il movimento extra / non può registrare tell / controcanto
// in meno / tell in più» non sono più testo morto. node webapp/test-con-oggetto.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { movimento } from './public/motore/stat.js';
import { condizioni } from './public/motore/minaccia.js';
import { avanzaRitmo, avanzaCancellazione, statoCompiti } from './public/motore/obiettivi.js';
import { applicaConseguenza } from './public/motore/azioni.js';
import { interagisci } from './public/motore/interazioni.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = {}; const ep = (n) => (EP[n] = EP[n] || JSON.parse(readFileSync(`webapp/data/ep${n}.json`, 'utf8')));
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);

const nuova = (n, titolo, oggetti, rivelate) => {
  const E = ep(n); const t0 = E.tessere[0].id;
  const eroiPos = {}; const vite = {};
  party.forEach((nm, i) => { eroiPos[nm] = { t: t0, x: i % 4, y: 0 }; vite[nm] = COMUNE.eroi.find((x) => x.nome === nm).salute; });
  return {
    v: 1, episodio: `ep${n}`, modo: 'digitale', party, fase: 'spedizione',
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
const pesca = (n, s) => applica(s, { tipo: 'fase-minaccia' }, { ep: ep(n), comune: COMUNE, carte: CARTE });
const gDi = (n, s) => ({ ep: ep(n), comune: COMUNE, carte: CARTE, sp: s.spedizione, partita: s });

// ---- il parser: solo clausole a inizio frase, niente falsi positivi
const tutte = Object.entries(CARTE.minacce).flatMap(([e, l]) => l.map((c) => ({ ...c, e })));
const vuoto = { partita: { indagine: { oggetti: [] } } };
const conCon = tutte.filter((c) => condizioni(vuoto, c.rules.split('{divider}').pop()).length).map((c) => c.e + ':' + c.title);
ok(conCon.length === 8, `8 carte con clausola «Con/Senza» (${conCon.length})`);
ok(!conCon.some((x) => /Corriere|Sospetto|Maggiordomo/.test(x)), 'nessun falso positivo: «con la FUGA piena», «col -1 morale», «L\'eroe con meno Salute»');

// ---- Ep.11 Tegola: prova VIGORE Media; con la Corda nessuna prova
const tegola = 'Insidia — La Tegola che Scivola';
let o = pesca(11, nuova(11, tegola, []));
ok(o.stato.spedizione.carta.prova === undefined, 'Ep11 senza Corda: la prova resta quella stampata');
o = pesca(11, nuova(11, tegola, ['La Corda del Campanaro']));
ok(o.stato.spedizione.carta.prova === 'nessuna' && o.stato.spedizione.carta.annunci.some((a) => /nessuna prova/.test(a)), 'Ep11 con la Corda: nessuna prova');

// ---- Ep.13 Taccuino: a Facile; Ep.20 Acqua: a Facile
o = pesca(13, nuova(13, 'Insidia — La Corrente della Roggia', ['Il Taccuino del Capo-Catena']));
ok(o.stato.spedizione.carta.prova === 'Facile', 'Ep13 col Taccuino: prova a Facile');
o = pesca(20, nuova(20, 'Insidia — L’Acqua che Sale', []));
ok(o.stato.spedizione.carta.prova === undefined, 'Ep20 Acqua senza Mappa: prova invariata');
o = pesca(20, nuova(20, 'Insidia — L’Acqua che Sale', ['La Mappa Acustica Attiva']));
ok(o.stato.spedizione.carta.prova === 'Facile', 'Ep20 Acqua con la Mappa: prova a Facile');

// ---- Ep.19 Allarme: il segnalino Canto salta con la mappa dei sigilli
const allarme = 'Insidia — L’Allarme Silenzioso';
o = pesca(19, nuova(19, allarme, []));
const c0 = o.stato.spedizione.canto;
o = pesca(19, nuova(19, allarme, ['Indizio Nascosto — La mappa dei sigilli']));
ok(c0 >= 1 && o.stato.spedizione.canto === 0 && o.stato.spedizione.carta.annunci.some((a) => /nessun effetto/.test(a)), `Ep19 con la mappa: nessun Canto (senza: ${c0})`);

// ---- «Aggiungete 1 segnalino Canto» anche fuori dai Crescendo (Bivio Ep.3, Insidia Ep.19)
o = pesca(3, nuova(3, 'Bivio — La Campana Nuova', []));
ok(o.stato.spedizione.canto === 1, 'Bivio Ep3: il segnalino Canto sale');
o = pesca(19, nuova(19, 'Insidia — Il Fiuto dell’Ispettore', []));
ok(o.stato.spedizione.canto === 1, 'Insidia Ep19 (Fiuto): il segnalino Canto sale');

// ---- Ep.20 Buio della Gola: senza Mappa l'eroe perde il movimento extra (-1 nel round dopo)
const buio = 'Insidia — Il Buio della Gola';
o = pesca(20, nuova(20, buio, []));
let s = o.stato.spedizione; const colpito = Object.keys(s.vincoli || {});
ok(colpito.length === 1 && s.vincoli[colpito[0]].scatto && s.vincoli[colpito[0]].round === s.round + 1, 'Ep20 Buio senza Mappa: un eroe perde lo scatto nel round dopo');
const st = { ...o.stato, spedizione: { ...s, round: s.round + 1 } };
const g1 = gDi(20, st);
const base = movimento(g1, party.find((n) => n !== colpito[0]));
ok(movimento(g1, colpito[0]) === (colpito[0] === 'Nino' ? 4 : 3) - 1 && base >= 3, `il colpito ha -1 Movimento (${movimento(g1, colpito[0])} vs ${base})`);
ok(movimento({ ...g1, sp: { ...g1.sp, round: s.round + 2 } }, colpito[0]) >= 3, 'il round dopo ancora è scaduto');
o = pesca(20, nuova(20, buio, ['La Mappa Acustica Attiva']));
ok(!o.stato.spedizione.vincoli && o.stato.spedizione.carta.annunci.some((a) => /nessun effetto/.test(a)), 'Ep20 Buio con la Mappa: nessun effetto');

// ---- Ep.20 Eco: il controcanto di questo round avanza di 1 riga in meno
const eco = 'Insidia — L’Eco che Mente';
const camera = ep(20).tessere.map((t) => t.id);
const righe = (s0) => { const g = gDi(20, s0); const a = statoCompiti(g).controcanto || 0; avanzaRitmo(g); return (statoCompiti(g).controcanto || 0) - a; };
const rBase = righe(nuova(20, eco, [], camera));
o = pesca(20, nuova(20, eco, [], camera));
ok(o.stato.spedizione.ritmoMeno === 1, 'Ep20 Eco senza Mappa: segna -1 riga');
const rEco = righe(o.stato);
ok(rBase >= 2 && rEco === rBase - 1, `il ritmo di fine round perde 1 riga (${rBase} -> ${rEco})`);
ok(righe(o.stato) === rBase, 'e solo per quel round (consumato)');
o = pesca(20, nuova(20, eco, ['La Mappa Acustica Attiva'], camera));
ok(!o.stato.spedizione.ritmoMeno && o.stato.spedizione.carta.annunci.some((a) => /nessun effetto/.test(a)), 'Ep20 Eco con la Mappa: nessun effetto');

// ---- Ep.15 Prova che Svanisce: 1 tell in più cancellato, salvo il Manuale
const prova = 'Insidia — La Prova che Svanisce';
const cancella = (s0) => { const g = gDi(15, s0); statoCompiti(g).tell = 3; avanzaCancellazione(g); return 3 - statoCompiti(g).tell; };
const sCanc = nuova(15, prova, [], ep(15).tessere.map((t) => t.id));
const cBase = cancella(JSON.parse(JSON.stringify(sCanc)));
o = pesca(15, sCanc);
ok(o.stato.spedizione.cancExtra && o.stato.spedizione.cancExtra.n === 1, 'Ep15 senza Manuale: segna 1 tell in più');
ok(cancella(o.stato) === cBase + 1, `a fine round cancellano ${cBase + 1} tell invece di ${cBase}`);
ok(cancella(o.stato) === cBase, 'e solo per quel round (consumato)');
o = pesca(15, nuova(15, prova, ['Il Manuale Indiziario'], ep(15).tessere.map((t) => t.id)));
ok(!o.stato.spedizione.cancExtra && o.stato.spedizione.carta.annunci.some((a) => /nessun tell perso/.test(a)), 'Ep15 col Manuale: nessun tell extra');

// ---- conseguenze di una prova fallita
s = nuova(13, 'x', []);
let g = gDi(13, s);
applicaConseguenza(g, party[0], 'Se fallisce, cade in acqua — perde il turno a risalire.');
ok(s.spedizione.storditi[party[0]] === 4, '«perde il turno»: 1 sola azione nel round dopo');
applicaConseguenza(g, party[1], 'se fallisce, 1 danno e perde il movimento extra.');
ok(s.spedizione.vite[party[1]] < COMUNE.eroi.find((x) => x.nome === party[1]).salute && s.spedizione.vincoli[party[1]].scatto, 'danno + scatto perso insieme');

// ---- «non può registrare tell»: il compito di documentazione è rifiutato nel round dopo
const E15 = ep(15); const tell = E15.compiti.find((c) => c.id === 'tell');
s = nuova(15, 'x', [], E15.tessere.map((t) => t.id));
s.spedizione.eroiPos[party[0]] = { t: tell.tile || 'T4', x: 1, y: 1 };
applicaConseguenza(gDi(15, s), party[0], 'Se fallisce, questo round non può documentare tell (disorientato).');
ok(s.spedizione.vincoli[party[0]].senzaTell === true && s.spedizione.vincoli[party[0]].round === 4, '«non può registrare tell» registrato per il round dopo');

const sD = nuova(15, 'x', [], E15.tessere.map((t) => t.id));
sD.spedizione.eroiPos[party[0]] = { t: 'T2', x: 1, y: 1 };
const provaDoc = (st) => interagisci(gDi(15, st), { dado: 20 }, party[0]);
ok(!provaDoc(JSON.parse(JSON.stringify(sD))).rifiuto, 'senza vincolo: il tell si documenta (controllo non vacuo)');
applicaConseguenza(gDi(15, sD), party[0], 'Se fallisce, questo round non può documentare tell (disorientato).');
sD.spedizione.round = 4;
const rif = provaDoc(sD).rifiuto;
ok(rif && /non può registrare tell/.test(rif.motivo || rif), 'disorientato: Interagire sul tell è rifiutato nel round dopo');
sD.spedizione.round = 5;
ok(!provaDoc(sD).rifiuto, 'e il round ancora dopo torna a documentare');

// ---- colpi senza prova: Lama Educata (Ep9), Guardia (Ep17), Ispettore (Ep19), FUGA +1 (Ep12)
const vita = (st, nm) => st.spedizione.vite[nm];
const lama = 'Insidia — La Lama Educata';
const conRiva = (liberato, x) => {
  const st = nuova(9, lama, []); const t = ep(9).tessere[0].id;
  st.spedizione.scortati = [{ liberato, pos: { t, x, y: 3 } }];
  return st;
};
let sL = conRiva(true, 3);                                  // Riva in (3,3): adiacente solo a chi sta in (3,2)/(2,3)/..
sL.spedizione.eroiPos[party[1]] = { t: ep(9).tessere[0].id, x: 3, y: 2 };
o = pesca(9, sL);
ok(vita(o.stato, party[1]) === vita(sL, party[1]) - 1 && [0, 2, 3].every((i) => vita(o.stato, party[i]) === vita(sL, party[i])), 'Ep9 Lama Educata: perde 1 vita solo l’eroe adiacente a Riva');
o = pesca(9, conRiva(false, 3));
ok(party.every((n) => vita(o.stato, n) === COMUNE.eroi.find((x) => x.nome === n).salute), 'Ep9 Lama: Riva non ancora libero, nessun danno');
const nemicoIn = (st, nome, n) => { st.spedizione.nemici = [{ nome, pos: { t: ep(n).tessere[0].id, x: 0, y: 3 }, ferite: 0 }]; return st; };
let sG = nuova(17, 'Insidia — Lo Sguardo della Guardia', []); sG.spedizione.vite[party[2]] = 2;
o = pesca(17, nemicoIn(sG, 'La Guardia', 17));
ok(vita(o.stato, party[2]) === 1 && o.stato.spedizione.carta.annunci.some((a) => /Guardia colpisce/.test(a)), 'Ep17 Guardia in campo: colpisce l’eroe con meno Salute');
o = pesca(17, nuova(17, 'Insidia — Lo Sguardo della Guardia', []));
ok(party.every((n) => vita(o.stato, n) === COMUNE.eroi.find((x) => x.nome === n).salute), 'Ep17 senza Guardia in campo: nessun effetto');
let sI = nemicoIn(nuova(19, 'Insidia — Il Fiuto dell’Ispettore', []), 'L’Ispettore Vidal', 19);
o = pesca(19, sI);
ok(party.filter((n) => vita(o.stato, n) < vita(sI, n)).length === 1, 'Ep19 Ispettore in campo: colpisce un solo eroe');
o = pesca(12, nuova(12, 'Insidia — Lo Scambio di Barca', []));
ok((o.stato.spedizione.traccia || 0) === 1, 'Ep12 «FUGA +1»: la traccia sale');

console.log(ko ? `\n${ko} KO` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
