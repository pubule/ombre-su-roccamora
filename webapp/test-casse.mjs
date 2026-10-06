// LE CASSE DI OSSA (Ep.5, T5): un Interagire ciascuna le mette in salvo; contano nell'epilogo e
// nel Bivio. Domanda 2 esatta: due sono gia' in salvo. Domanda 3 sbagliata: ogni cassa
// richiede prima ACUME Media, e se fallisce l'azione e' spesa su una cassa che non conta.
// node webapp/test-casse.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { avviaEffetti } from './public/motore/domande.js';
import { interazioneDisponibile, provaInterazione } from './public/motore/interazioni.js';
import { compitiFiniti, obiettivoFatto } from './public/motore/obiettivi.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = JSON.parse(readFileSync('webapp/data/ep5.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const [A] = party;
const N = (EP.secondari || [])[0] ? EP.secondari[0].quante : 0;

const nuova = ({ risposte, tile = 'T5' } = {}) => {
  const s = {
    v: 1, episodio: 'ep5', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati', ...(risposte ? { risposte } : {}) },
    spedizione: { round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, grate: [], compiti: {}, cercate: {}, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null, scortati: [], insidie: {}, abilita: {}, rivelate: ['T1', 'T5'], nemici: [], log: [],
      eroiPos: { [party[0]]: { t: tile, x: 1, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } }, vite: {} },
  };
  const g = { ep: EP, comune: COMUNE, carte: CARTE, sp: s.spedizione, partita: s };
  avviaEffetti(g, 'T1');
  return g;
};
const manda = (g0, tiro) => applica(g0.partita, { tipo: 'interagisci', eroe: A, tiri: tiro ? [tiro] : undefined }, { ep: EP, comune: COMUNE, carte: CARTE });
const salve = (sp) => ((sp.secondari || {}).casse) || 0;

ok(N > 0, 'ep5 dichiara le casse come obiettivo secondario');
let g = nuova();
let d = interazioneDisponibile(g, A);
ok(d && d.tipo === 'secondario', 'su T5 si puo mettere in salvo una cassa');
ok(!interazioneDisponibile(nuova({ tile: 'T1' }), A), 'altrove (T1) niente');
ok(provaInterazione(g, A) === null, 'senza penalita: nessuna prova');
ok(!compitiFiniti(g) && !obiettivoFatto(g), 'le casse non chiudono ne sbloccano l\'obiettivo: restano le canne');

// una azione = una cassa, senza prova
let o = manda(g);
ok(!o.rifiuto && salve(o.stato.spedizione) === 1, 'Interagire: 1 cassa in salvo');
ok((o.stato.spedizione.azioni[A] || []).includes('interagire'), 'l azione e spesa');

// finite le casse non c'e piu niente
g = nuova(); g.sp.secondari = { casse: N };
ok(!interazioneDisponibile(g, A), 'tutte salve: niente piu da fare in T5');

// Domanda 2 esatta: due gia' in salvo
g = nuova({ risposte: [true, true, true, true] });
ok(salve(g.sp) === 2, 'D2 esatta: 2 casse gia in salvo (' + salve(g.sp) + ')');
g = nuova({ risposte: [true, false, true, true] });
ok(salve(g.sp) === 0, 'D2 sbagliata: nessuna');

// Domanda 3 sbagliata: prima ACUME Media
g = nuova({ risposte: [true, false, false, true] });
const p = provaInterazione(g, A);
ok(p && p.stat === 'acume' && p.diff === 'Media' && p.soglia === COMUNE.regole.diff.Media, 'D3 sbagliata: prova ACUME Media');
o = manda(g, [1, 1]);
ok(!o.rifiuto && salve(o.stato.spedizione) === 0 && (o.stato.spedizione.azioni[A] || []).includes('interagire'), 'prova fallita: azione spesa, la cassa non conta');
o = manda(g, [6, 6]);
ok(salve(o.stato.spedizione) === 1, 'prova riuscita: la cassa e in salvo');
g = nuova({ risposte: [true, true, true, true] });
ok(provaInterazione(g, A) === null, 'D3 esatta: nessuna prova');

console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
