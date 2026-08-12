// Le regole comuni, coi dadi passati da fuori invece che pescati dall'ambiente.
//
// Qui il differenziale non serve: engine.js era gia' puro e la sua superficie
// non cambia, tranne le tre funzioni che usavano Math.random. Quelle si provano
// per la proprieta' nuova — la riproducibilita' — e il resto si prova sul
// comportamento, con i dati veri dei ventuno episodi.
//
// node webapp/test-motore-regole.mjs
import { readFileSync, readdirSync } from 'fs';
import * as r from './public/motore/regole.js';
import { creaRng } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const carte = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const comune = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const ep1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));

// --- il mazzo si rigioca col seme
{
  const a = r.costruisciMazzo(creaRng(77), carte, ep1, 'ep1');
  const b = r.costruisciMazzo(creaRng(77), carte, ep1, 'ep1');
  ok(a.ordine.join() === b.ordine.join(), 'stesso seme, stesso mazzo');

  const c = r.costruisciMazzo(creaRng(78), carte, ep1, 'ep1');
  ok(c.ordine.join() !== a.ordine.join(), 'semi diversi, mazzi diversi');

  ok(a.ordine.slice().sort((x, y) => x - y).join() === a.pool.map((_, i) => i).join(),
     'il mazzo contiene ogni carta una volta sola');
  ok(a.pool.length > 0, 'e non e\' vuoto');
  ok(a.indice === 0 && Array.isArray(a.scarti), 'il mazzo nasce da pescare');
}

// --- le carte Bivio restano fuori dal mazzo: entrano solo se il Bivio
// dell'episodio precedente lo dice (W-D, campagna).
// Si guarda DOVE ESISTONO — ep2..ep7 — e non l'Ep.1, che di Bivi non ne ha:
// controllarlo li' sarebbe un check che passa qualunque cosa faccia il codice.
{
  const conBivio = Object.entries(carte.minacce || {})
    .filter(([, lista]) => (lista || []).some((c) => c.title.startsWith('Bivio')))
    .map(([id]) => id);
  ok(conBivio.length > 0, `ci sono episodi con carte Bivio da escludere (visti ${conBivio.length})`);

  for (const id of conBivio) {
    const ep = JSON.parse(readFileSync(`webapp/data/${id}.json`, 'utf8'));
    const m = r.costruisciMazzo(creaRng(9), carte, ep, id);
    const dentro = m.pool.filter((t) => t.startsWith('Bivio'));
    ok(dentro.length === 0, `${id}: nessuna carta Bivio nel mazzo (viste ${dentro.join(', ')})`);
    // e non ha buttato via il resto insieme a loro
    const attese = carte.minacce[id].filter((c) => !c.title.startsWith('Bivio')).length;
    ok(m.pool.length === attese,
       `${id}: il mazzo tiene tutte le altre (${m.pool.length} invece di ${attese})`);
  }
}

// --- pescare l'intero mazzo, e il rimescolo, sono riproducibili
{
  const giro = (seme) => {
    const rng = creaRng(seme);
    const m = r.costruisciMazzo(rng, carte, ep1, 'ep1');
    const out = [];
    for (let i = 0; i < m.pool.length + 3; i++) out.push(r.pesca(rng, m, carte, 'ep1', ep1).title);
    return { out, m };
  };
  const uno = giro(5), due = giro(5);
  ok(uno.out.every(Boolean), 'ogni pesca restituisce una carta');
  ok(uno.m.rimescolato === 1, `finito il mazzo si rimescola (visto ${uno.m.rimescolato})`);
  ok(uno.out.join('|') === due.out.join('|'), 'la sequenza di pesca si rigioca identica');

  const tre = giro(6);
  ok(tre.out.join('|') !== uno.out.join('|'), 'con un altro seme la serata e\' un\'altra');
}

// --- dichiaraVoce non sceglie piu' la prosa
{
  const dentro = r.dichiaraVoce(ep1, comune, ep1.luoghi[0].voce_mappa);
  ok(dentro.tipo === 'visita' && dentro.luogo, 'una voce dell\'episodio e\' una visita');

  const fuori = r.dichiaraVoce(ep1, comune, 'IL PANIFICIO CHE NON ESISTE');
  ok(fuori.tipo === 'fredda', 'una voce estranea e\' una pista fredda');
  ok(!('frase' in fuori), 'il motore non sceglie piu\' la frase: la prosa e\' della vista');
}

// --- l'oracolo del Bussare: le stesse prove di test-digitale.mjs, che sono
// state scritte dopo un baco vero (un errore falso alla porta giusta)
{
  const porta = { chiave: ['parola', 'LA DOGANA VECCHIA'] };
  const apre = (d) => r.bussa(porta, d).entra;
  ok(apre('LA DOGANA VECCHIA'), 'la parola esatta apre');
  ok(apre('la dogana vecchia'), 'minuscolo apre');
  ok(apre('dogana vecchia'), 'senza articolo apre');
  ok(apre('LA DOGANA'), 'una parte significativa apre');
  ok(apre('  la   DOGANA,  vecchia '), 'spazi e punteggiatura non contano');
  ok(!apre('la cattedrale'), 'una parola sbagliata resta fuori');
  ok(!apre(''), 'il vuoto resta fuori');
  ok(!apre('la'), 'un articolo da solo resta fuori');

  const nuda = { chiave: ['parola', 'DOGANA'] };
  ok(r.bussa(nuda, 'LA DOGANA').entra, 'chiave nuda, dichiarazione con articolo: apre');
  ok(r.bussa(nuda, 'della dogana').entra, 'preposizione articolata: apre');
  ok(!r.bussa(nuda, 'la darsena').entra, 'e non apre a caso');

  ok(r.nocciolo('  Le  Mísure   che non Tornano ') === 'MISURE CHE NON TORNANO',
     'nocciolo toglie articolo, accenti, spazi e maiuscole');
}

// --- il tick del Canto: il cuore del bilanciamento, invariato.
// La cadenza si LEGGE, non si assume: non e' uguale per tutti gli episodi (una
// clessidra sola non puo' servirne uno da 7 round e uno da 34), e l'Ep.1 batte
// ogni 6, non ogni 4. Scriverci dentro un numero fisso vorrebbe dire provare
// l'aritmetica invece della regola.
{
  const ogni = r.cadenzaCanto(comune, ep1);
  ok(ogni >= 1, `la cadenza dell'Ep.1 e' un numero sensato (letta ${ogni})`);

  const sped = { round: ogni, canto: 0, cantoBonus: false };
  const ann = r.fineRound(comune, ep1, sped);
  ok(sped.canto === 1, `al ${ogni}o round scatta il segnalino (visto ${sped.canto})`);
  ok(sped.round === ogni + 1, 'e poi si avanza di round');
  ok(ann.length >= 1 && /segnalino/i.test(ann[0]), 'con l\'annuncio giusto');

  const sped2 = { round: ogni - 1, canto: 0, cantoBonus: false };
  r.fineRound(comune, ep1, sped2);
  ok(sped2.canto === 0, `al ${ogni - 1}o round non scatta niente`);
  ok(sped2.round === ogni, 'ma il round avanza lo stesso');

  // il segnalino scatta DOPO l'N-esimo round giocato, non prima: sfasarlo di
  // uno rende il tavolo piu' duro per tutti gli episodi insieme
  const conta = (fino) => {
    const s = { round: 1, canto: 0, cantoBonus: false };
    for (let i = 0; i < fino; i++) r.fineRound(comune, ep1, s);
    return s.canto;
  };
  ok(conta(ogni - 1) === 0, `in ${ogni - 1} round non e' ancora scattato niente`);
  ok(conta(ogni) === 1, `al ${ogni}o e' scattato una volta sola`);
  ok(conta(ogni * 2) === 2, `in ${ogni * 2} round scatta due volte, non tre`);

  // il tetto e' fisico: otto segnalini in scatola, non c'e' un nono pezzo
  const pieno = { round: ogni, canto: 99, cantoBonus: true };
  r.fineRound(comune, ep1, pieno);
  ok(pieno.canto === 99, 'oltre il tetto non si aggiungono segnalini che non esistono');
}

// --- la soglia e il tetto li dichiara l'episodio, non una costante
{
  ok(r.sogliaCanto(comune, { soglia_canto: 5 }) === 5, 'l\'episodio puo\' spostare la soglia');
  ok(r.sogliaCanto(comune, {}) === comune.regole.soglia_canto, 'chi non la dichiara usa quella comune');
  ok(r.tettoCanto(comune, { canto_max: 6 }) === 6, 'l\'episodio puo\' dichiarare un tetto suo');
  ok(r.cadenzaCanto(comune, { marea: { ogni: 2 } }) === 2, 'la marea ha la sua cadenza');
}

// --- il vantaggio d'Indagine: lo Slancio vuole TUTTE le risposte
{
  const ep = { vantaggio: { slancio_ore: 3, preparati_ore: 1, preparati_luoghi: 99 } };
  const ind = (ora, visitati = []) => ({ ora, visitati });
  ok(r.tierIndagine(ep, ind(20), [true, true, true, true]).tier === 'slancio',
     'tutte giuste e 4 ore avanzate: slancio');
  ok(r.tierIndagine(ep, ind(20), [true, true, true, false]).tier === 'preparati',
     'una sbagliata: niente slancio, restano i preparati');
  ok(r.tierIndagine(ep, ind(24), [true, true, true, true]).tier === 'nessuno',
     'tutte giuste ma zero ore avanzate: chiudere a caso non paga');
  ok(r.tierIndagine(ep, ind(24), []).dossier === true, 'a ore zero il dossier e\' esaurito');
}

// --- il mazzo si costruisce per tutti e ventuno gli episodi
{
  const id = readdirSync('webapp/data')
    .filter((f) => /^(ep\d+|preludio)\.json$/.test(f)).map((f) => f.replace('.json', ''));
  ok(id.length >= 20, `ci sono i dati di tutti gli episodi (visti ${id.length})`);
  let vuoti = 0;
  for (const x of id) {
    const ep = JSON.parse(readFileSync(`webapp/data/${x}.json`, 'utf8'));
    const m = r.costruisciMazzo(creaRng(1), carte, ep, x);
    if (!m.pool.length) { vuoti++; console.error(`   (${x}: mazzo Minaccia vuoto)`); }
  }
  ok(vuoti === 0, `nessun episodio resta senza mazzo Minaccia (vuoti ${vuoti})`);
}

console.log(ko === 0 ? 'TUTTO OK (regole)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
