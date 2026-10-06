// IL LUCCHETTO DELLA BANCHINA (Ep.1, Domanda 3 sbagliata): «Va forzata: ACUME
// Difficile; ogni fallimento = pescate 1 carta Minaccia». Il piede di porco dà +1.
// node webapp/test-lucchetto.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { avviaEffetti } from './public/motore/domande.js';
import { interazioneDisponibile, provaInterazione } from './public/motore/interazioni.js';
import { scortaPuoVincere } from './public/motore/vittoria.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const [A] = party;

const nuova = ({ risposte, oggetti = [] }) => {
  const s = {
    v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti, caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati', ...(risposte ? { risposte } : {}) },
    spedizione: { round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, grate: [], compiti: {}, cercate: {}, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null, scortati: [], insidie: {}, abilita: {}, rivelate: ['T1'], nemici: [], log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 1, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } }, vite: {} },
  };
  const g = { ep: EP, comune: COMUNE, carte: CARTE, sp: s.spedizione, partita: s };
  avviaEffetti(g, 'T1');
  return g;
};
const dado = (tot) => ({ tira2d6: () => ({ d: [Math.floor(tot / 2), tot - Math.floor(tot / 2)], tot }) });
const interagisci = (g, tot) => applica(g, { tipo: 'interagisci', eroe: A }, dado(tot));

// Domanda 3 esatta (o nessuna risposta): la porta si apre senza prove
let g = nuova({ risposte: [true, true, true, true] });
ok(!interazioneDisponibile(g, A), 'D3 esatta: niente da forzare');
ok(scortaPuoVincere(g), 'D3 esatta: la scorta puo vincere');
g = nuova({});
ok(!interazioneDisponibile(g, A) && scortaPuoVincere(g), 'senza risposte (pilota): il lucchetto non esiste');

// D3 sbagliata: il lucchetto c'e
g = nuova({ risposte: [true, true, false, true] });
const disp = interazioneDisponibile(g, A);
ok(disp && disp.tipo === 'porta', 'D3 sbagliata: su T1 si puo forzare il lucchetto');
ok(!scortaPuoVincere(g), 'finche il lucchetto regge la scorta non vince');
let p = provaInterazione(g, A);
ok(p && p.stat === 'acume' && p.diff === 'Difficile' && p.soglia === COMUNE.regole.diff.Difficile, 'prova ACUME Difficile');
ok(p.bonus.length === 1, 'senza piede di porco: solo ACUME');
g = nuova({ risposte: [true, true, false, true], oggetti: ['UN PIEDE DI PORCO'] });
p = provaInterazione(g, A);
ok(p.bonus.length === 2 && p.bonus[1].val === 1, 'col piede di porco: +1');

// fallimento: azione spesa, lucchetto chiuso, una Minaccia in piu alla prossima fase
const manda = (g0, tiro) => applica(g0.partita, { tipo: 'interagisci', eroe: A, tiri: [tiro] }, { ep: EP, comune: COMUNE, carte: CARTE });
g = nuova({ risposte: [true, true, false, true] });
let o = manda(g, [1, 1]);
let sp = o.stato.spedizione;
ok(!o.rifiuto && !sp.portaForzata, 'prova fallita: il lucchetto regge');
ok(sp.minacciaPunita === 1, 'prova fallita: 1 carta Minaccia in piu');
ok((sp.azioni[A] || []).includes('interagire'), 'l azione e spesa');

// riuscita: il lucchetto cede, la scorta puo vincere
g = nuova({ risposte: [true, true, false, true] });
o = manda(g, [6, 6]);
sp = o.stato.spedizione;
ok(!o.rifiuto && sp.portaForzata === true, 'prova riuscita: il lucchetto cede');
ok(!(sp.minacciaPunita > 0), 'prova riuscita: nessuna Minaccia in piu');
const g2 = { ep: EP, comune: COMUNE, carte: CARTE, sp, partita: o.stato };
ok(scortaPuoVincere(g2) && !interazioneDisponibile(g2, A), 'aperto: la scorta puo vincere, niente piu da forzare');

// la Minaccia in piu si pesca davvero alla fase Minaccia
const TITOLO = CARTE.minacce.ep1[0].title;
const conMazzo = (gg) => { gg.sp.round = 3; gg.sp.mazzo = { pool: [TITOLO], ordine: [0, 0, 0, 0, 0, 0], indice: 0 }; return gg; };
g = conMazzo(nuova({ risposte: [true, true, false, true] })); g.sp.minacciaPunita = 1;
const base = conMazzo(nuova({ risposte: [true, true, false, true] }));
const fase = (gg) => applica(gg.partita, { tipo: 'fase-minaccia' }, { ep: EP, comune: COMUNE, carte: CARTE }).stato.spedizione;
const conPena = fase(g); const senza = fase(base);
ok(conPena.minacceTotali === senza.minacceTotali + 1, 'la fase Minaccia pesca 1 carta in piu (' + senza.minacceTotali + ' → ' + conPena.minacceTotali + ')');
ok(!conPena.minacciaPunita, 'la penalita si consuma');

console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
