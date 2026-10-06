// UNA SPEDIZIONE GIA' COMINCIATA E' SPEDIZIONE, anche se la partita dice ancora «indagine».
// Visto sul tavolo vero (salvataggio del Preludio): fase «indagine», busta chiusa, plancia al round 1
// con la carta della prima tessera aperta. «Continua» andava all'Indagine e la carta non si chiudeva.
// node webapp/test-fase-spedizione.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = JSON.parse(readFileSync('webapp/data/preludio.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const dati = { ep: EP, comune: COMUNE, carte: CARTE };
const T1 = EP.tessere[0].id;
const base = (spedizione, indagine = {}) => ({
  v: 1, episodio: 'preludio', modo: 'digitale', party, fase: 'indagine', rng: { seme: 3, passo: 0 },
  indagine: { ora: 22, chiusa: true, visitati: [], oggetti: [], caricheUsate: {}, carta: null, ...indagine },
  spedizione,
});

// il caso del tavolo: plancia aperta, carta della tessera, fase rimasta «indagine»
const bloccato = base({ digitale: true, round: 1, fase: 'eroi', esito: null, canto: 0, rivelate: [T1], stanzeLette: [T1],
  eroiPos: { [party[0]]: { t: T1, x: 1, y: 1 }, [party[1]]: { t: T1, x: 2, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 },
  nemici: [], azioni: {}, eroiFatti: [], scortati: [], grate: [], compiti: {}, cercate: {}, insidie: {}, abilita: {}, storditi: {},
  mazzo: { pool: [], ordine: [], indice: 0 }, log: [],
  carta: { titolo: `${T1} · la banchina della dogana`, tessera: T1, testo: 'x', annunci: [] } });
let o = applica(bloccato, { tipo: 'carta-vista' }, dati);
ok(!o.rifiuto, 'il comando passa');
ok(o.stato.spedizione.carta === null, 'e chiude la carta della TESSERA (la Spedizione, non l\'Indagine)');

// la busta letta, Spedizione non ancora cominciata: carta-vista resta dell'Indagine
const allaBusta = base({ round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null }, { carta: { titolo: 'la busta è aperta', corpo: '' } });
o = applica(allaBusta, { tipo: 'carta-vista' }, dati);
ok(!o.rifiuto && o.stato.indagine.carta == null, 'prima di scendere, «continua» chiude ancora la carta della busta');

console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
