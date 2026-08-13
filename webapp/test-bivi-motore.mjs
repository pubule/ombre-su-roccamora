// I BIVI APPLICATI: che le due strade portino davvero in due posti diversi.
//
// `test-bivi.mjs` prova la COPERTURA — che i venti Bivi siano tradotti e che
// nessun effetto si perda per strada. Qui si prova l'ALTRA meta': che quel che
// e' tradotto venga anche ESEGUITO, e che eseguirlo cambi lo stato iniziale
// nel verso che il fascicolo promette.
//
// Il modo in cui questo lavoro puo' fallire in silenzio e' preciso: la scelta
// si registra, la riga si legge ad alta voce, e sotto non cambia niente. Nessun
// errore, nessun rosso — solo una campagna in cui decidere non conta. Ogni
// controllo qui sotto confronta le DUE opzioni fra loro: se un ramo dimentica
// di applicarsi, i due stati coincidono e il test cade.
//
// node webapp/test-bivi-motore.mjs
import { readFileSync } from 'fs';
import { biviDi, applicaAllaPartita, biviVuoti, episodioColBivio } from './public/motore/bivi.js';
import { costruisciMazzo, sogliaCanto, luogoVisitabile } from './public/motore/regole.js';
import { usiDi } from './public/motore/abilita.js';
import { creaRng } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const dati = (k) => JSON.parse(readFileSync(`webapp/data/${k}.json`, 'utf8'));
const CARTE = dati('carte');
const COMUNE = dati('comune');

// una partita nuda: gli stessi campi che `store.nuovaPartita` mette, e nient'altro
const partita = () => ({
  party: ['DOTT. ATTILIO SEGRE', 'PADRE CELSO MARANI'],
  indagine: { ora: 18, approfondimentiLetti: [] },
  spedizione: { canto: 0 },
});

// lo stato iniziale che nasce da una scelta: e' la funzione che il gioco
// chiama davvero (main.comincia), messa qui in tre righe
function conScelta(epId, scelte) {
  const ep = dati(epId);
  const b = biviDi(ep, scelte);
  const p = applicaAllaPartita(partita(), b, ep);
  return { p, b, ep: episodioColBivio(ep, b) };
}

const mazzoDi = (epId, b, seme = 42) =>
  costruisciMazzo(creaRng(seme), CARTE, dati(epId), epId, b);

// --- SENZA SCELTE NON CAMBIA NIENTE
// E' il caso piu' importante di tutti: venti episodi si giocano anche senza
// aver mai risposto a un Bivio, e devono partire esattamente come prima.
{
  const { p, b } = conScelta('ep2', {});
  ok(p.indagine.ora === 18 && p.spedizione.canto === 0, 'nessuna scelta: la partita nasce com’era');
  ok(b.righe.length === 0, 'nessuna scelta: niente da leggere ad alta voce');
  const a = mazzoDi('ep2', b).pool.length;
  const n = mazzoDi('ep2', null).pool.length;
  ok(a === n, `nessuna scelta: il mazzo e' quello di sempre (${a} vs ${n})`);
}

// --- PRELUDIO -> EP.1: l'ora, e la porta della Gendarmeria
{
  const arch = conScelta('ep1', { preludio: 'archivio' });
  const gend = conScelta('ep1', { preludio: 'gendarmeria' });
  ok(arch.p.indagine.ora === 17,
     `tenendo la pagina, l’Ep.1 comincia un'ora prima (visto ${arch.p.indagine.ora})`);
  ok(gend.p.indagine.ora === 18, 'consegnandola, l’orologio e’ quello di sempre');

  // la Gendarmeria dell'Ep.1 e' gia' senza serratura: il prezzo di quel ramo e'
  // il fascicolo che si ottiene senza convincere il brigadiere, e quello e'
  // lavoro d'arbitro. Quel che il motore deve garantire e' che la riga arrivi
  // al tavolo su UN ramo solo — altrimenti la scelta non si vedrebbe.
  ok(gend.b.righe.some((r) => /brigadiere/i.test(r)), 'consegnandola, il brigadiere vi riconosce');
  ok(!arch.b.righe.some((r) => /brigadiere/i.test(r)), 'tenendola, quella porta non si apre');
}

// --- UN LUOGO CHE IL BIVIO APRE O CHIUDE
// Nessun episodio della campagna incontra oggi una serratura che un Bivio
// toglie (la Gendarmeria dell'Ep.1 e' gia' aperta), ma la regola esiste ed e'
// scritta: si prova su un episodio finto, che e' l'unico modo di provarla.
{
  const finto = { luoghi: [{ n: 1, nome: 'LA GENDARMERIA', voce_mappa: 'la gendarmeria',
                             chiave: ['parola', 'DOGANA'], approfondimenti: [] }] };
  const b = biviVuoti();
  b.luoghiAperti.push('La Gendarmeria');
  ok(episodioColBivio(finto, b).luoghi[0].chiave === null, 'un Bivio toglie la serratura');
  ok(finto.luoghi[0].chiave !== null, 'e non tocca i dati originali');

  const c = biviVuoti();
  c.luoghiChiusi.push('La Gendarmeria');
  ok(luogoVisitabile(episodioColBivio(finto, c).luoghi[0], 18) === false,
     'e un Bivio puo' + String.fromCharCode(39) + ' anche chiuderla per la serata');
}

// --- EP.1 -> EP.2: il Canto di partenza e il mazzo Minaccia
{
  const bru = conScelta('ep2', { ep1: 'bruciarlo' });
  const con = conScelta('ep2', { ep1: 'conservarlo' });
  ok(bru.p.spedizione.canto === 0, 'bruciando lo spartito la spedizione parte col Canto a 0');
  ok(con.p.spedizione.canto === 1,
     `conservandolo lo spartito chiama: Canto a 1 (visto ${con.p.spedizione.canto})`);

  const base = mazzoDi('ep2', null).pool;
  const mb = mazzoDi('ep2', bru.b).pool;
  const mc = mazzoDi('ep2', con.b).pool;
  ok(mb.length === base.length + 1, `il rogo lascia polvere: 1 carta in piu' (${base.length} -> ${mb.length})`);
  ok(mb.filter((t) => /polvere di bronzo/i.test(t)).length === 2,
     'e la carta in piu\' e\' proprio «Polvere di Bronzo»');
  const segugi = mc.filter((t) => /segugi del coro/i.test(t)).length;
  ok(segugi === 2, `conservandolo, le 2 carte «Segugi del Coro» entrano nel mazzo (viste ${segugi})`);
  ok(base.filter((t) => /segugi del coro/i.test(t)).length === 0,
     'e senza la scelta restano fuori, com\'era');

  // l'altro prezzo del rogo: un testimone che ha smesso di parlare
  const facchino = (x) => x.ep.luoghi.some((l) =>
    (l.approfondimenti || []).some((a) => /facchino insonne/i.test(a.soggetto)));
  ok(!facchino(bru), 'bruciandolo, il facchino insonne ha ricevuto una smentita e tace');
  ok(facchino(con), 'conservandolo, il facchino parla ancora');
}

// --- EP.2 -> EP.3: la soglia del Canto, e la Litania di Marani
{
  const sto = conScelta('ep3', { ep2: 'stonarla' });
  const rif = conScelta('ep3', { ep2: 'rifondere' });
  // stonarla sposta la soglia; rifonderla paga in un altro modo — l'alleato di
  // bronzo che raddoppia la Litania, e uno strumento in piu' nel mazzo
  ok(sogliaCanto(COMUNE, dati('ep3'), sto.p.spedizione) === 4,
     'stonandola la soglia del Canto parte a 4');
  ok(sogliaCanto(COMUNE, dati('ep3'), rif.p.spedizione) === COMUNE.regole.soglia_canto,
     'rifondendola resta quella di sempre');

  const lit = { key: 'MARANI', ab: 'Litania', usi: 1 };
  ok(usiDi({ partita: rif.p }, lit) === 2, 'l’alleato di bronzo: la Litania vale 2 volte');
  ok(usiDi({ partita: sto.p }, lit) === 1, 'sull’altra strada vale 1, come sulla carta');

  const b = mazzoDi('ep3', rif.b).pool;
  const n = mazzoDi('ep3', null).pool;
  ok(b.length === n.length + 1, `rifondendola, uno strumento in piu' suona (${n.length} -> ${b.length})`);
}

// --- GLI ARCHI LUNGHI: la ragione per cui questo non e' «venti Bivi»
// Una scelta dell'Atto II si paga nel finale, e una prova a due episodi non lo
// vedrebbe mai.
{
  // Ep.8 -> Ep.13, Ep.14, Ep.16: sequestrare la merce spegne i clan per cinque
  // episodi, e la cosa si sente ancora tre serate dopo
  for (const k of ['ep13', 'ep14', 'ep16']) {
    const a = conScelta(k, { ep8: 'sequestrare' });
    const b = conScelta(k, { ep8: 'tracciare' });
    ok(a.b.righe.length > 0, `${k}: il Bivio dell’Ep.8 arriva fin qui`);
    ok(JSON.stringify(a.b.righe) !== JSON.stringify(b.b.righe),
       `${k}: le due strade dell’Ep.8 non lasciano lo stesso segno`);
  }
  // e l'altro ramo si paga prima, in nemici: +1 Sgherro nel pool per quattro
  // episodi di fila — un segnalino in piu' che puo' arrivare in campo
  for (const k of ['ep9', 'ep10', 'ep11', 'ep12']) {
    const tra = conScelta(k, { ep8: 'tracciare' });
    const seq = conScelta(k, { ep8: 'sequestrare' });
    const base = dati(k).pool['LO SGHERRO'];
    ok(tra.ep.pool['LO SGHERRO'] === base + 1,
       `${k}: tracciando i clan si consolidano (${base} -> ${tra.ep.pool['LO SGHERRO']})`);
    ok(seq.ep.pool['LO SGHERRO'] === base, `${k}: sequestrando il pool resta quello dell’episodio`);
    ok(dati(k).pool['LO SGHERRO'] === base, `${k}: e i dati dell’episodio non si sporcano`);
  }
  // Ep.11 -> Ep.20: nove episodi di distanza
  const pub = conScelta('ep20', { ep11: 'pubblicare' });
  const tac = conScelta('ep20', { ep11: 'infiltrare' });
  ok(pub.b.da.includes('ep11') || tac.b.da.includes('ep11'),
     'il Bivio dell’Ep.11 si applica ancora nel finale');
}

// --- EP.19 -> EP.20: il finale che il Bivio ha reso piu' duro
{
  const soli = conScelta('ep20', { ep19: 'soli' });
  const b = mazzoDi('ep20', soli.b).pool;
  const n = mazzoDi('ep20', null).pool;
  ok(b.length === n.length - 1, `andando soli: 1 carta in meno nel mazzo finale (${n.length} -> ${b.length})`);
}

// --- LA SOGLIA STA NELLO STATO, non nei dati
// Se finisse nei dati dell'episodio (che `dati()` tiene in cache e condivide),
// la scelta di un tavolo cadrebbe addosso alla partita successiva aperta nella
// stessa scheda — un baco che si vedrebbe solo giocando due serate di fila.
{
  const ep3 = dati('ep3');
  conScelta('ep3', { ep2: 'stonarla' });
  ok(sogliaCanto(COMUNE, ep3, null) === COMUNE.regole.soglia_canto,
     'applicare un Bivio non sporca i dati dell’episodio');
  ok(episodioColBivio(ep3, biviVuoti()) === ep3,
     'e senza effetti sui luoghi non si copia nemmeno l’episodio');
}

console.log(ko === 0 ? 'test-bivi-motore: le due strade portano in due posti diversi' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
