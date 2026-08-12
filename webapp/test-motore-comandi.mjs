// IL CONTRATTO: comando dentro, stato nuovo ed eventi fuori.
//
// Non si prova che le regole siano giuste — quello lo fanno i differenziali dei
// moduli. Si prova che la PORTA si comporti: che non muti l'ingresso, che
// rifiuti in chiaro invece di tacere, che la pendenza blocchi, che gli eventi
// siano spedibili su una rete, e che col seme la stessa serata si rigiochi.
//
// node webapp/test-motore-comandi.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const DATI = {
  ep: JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
};
const EROI = DATI.comune.eroi.map((e) => e.nome);
const ELENA = EROI.find((n) => n.includes('ELENA'));
const OTTONE = EROI.find((n) => n.includes('OTTONE'));
const SGH = DATI.comune.nemici[0].nome;
const T0 = DATI.ep.tessere[0].id;

// Uno stato di spedizione minimo ma vero: due eroi sulla prima tessera, la
// partita in corso. Si costruisce a mano perche' il comando `inizia` non esiste
// ancora — arrivera' quando anche l'avvio passera' dal contratto.
function partita(over = {}, party = [ELENA, OTTONE]) {
  return {
    v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' },
    rng: { seme: 4242, passo: 0 },
    spedizione: {
      round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [T0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos: { [ELENA]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 2, y: 1 } },
      vite: { [ELENA]: 6, [OTTONE]: 7 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: null, pendenza: null, insidie: {},
      ...over,
    },
  };
}
const conNemici = (nemici, over = {}) => partita({ nemici, ...over });
const sgherro = (x, y, ferite = 0) => ({ nome: SGH, num: 1, pos: { t: T0, x, y }, ferite, max: 2 });

// --- GARANZIA 1: applica() non muta lo stato che riceve
{
  const s = partita();
  const prima = JSON.stringify(s);
  applica(s, { tipo: 'muovi', eroe: ELENA, nodo: { t: T0, x: 1, y: 2 } }, DATI);
  ok(JSON.stringify(s) === prima, 'applica() non muta lo stato che riceve');
}

// --- GARANZIA 2: un comando illegale e' un rifiuto con la ragione in chiaro
{
  const s = partita();
  const casi = [
    [{ tipo: 'attacca', eroe: ELENA, bersaglio: 99 }, /non è più in campo/i, 'bersaglio inesistente'],
    [{ tipo: 'cerca', eroe: 'NESSUNO' }, /non è in questa squadra/i, 'eroe fuori dal party'],
    [{ tipo: 'ballare', eroe: ELENA }, /sconosciuto/i, 'comando inventato'],
    [{ tipo: 'rianima', eroe: ELENA }, /a terra/i, 'rianimare chi e\' in piedi'],
  ];
  for (const [cmd, atteso, che] of casi) {
    const out = applica(s, cmd, DATI);
    ok(out.rifiuto, `${che}: dev'essere un rifiuto`);
    ok(out.rifiuto && atteso.test(out.rifiuto.motivo),
       `${che}: la ragione dev'essere in chiaro (vista «${out.rifiuto && out.rifiuto.motivo}»)`);
    ok(out.stato === s, `${che}: e lo stato non si muove`);
    ok(out.eventi.length === 0, `${che}: e non produce eventi`);
  }
}

// --- GARANZIA 3: gli eventi sono serializzabili e tipizzati
{
  const s = conNemici([sgherro(1, 2)]);
  const out = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(out.eventi.length > 0, 'un attacco produce eventi');
  for (const ev of out.eventi) {
    ok(typeof ev.tipo === 'string' && ev.tipo, `ogni evento ha un tipo (${JSON.stringify(ev).slice(0, 60)})`);
    let giro = null;
    try { giro = JSON.parse(JSON.stringify(ev)); } catch { /* resta null */ }
    ok(giro !== null, 'ogni evento sopravvive a un giro di JSON: passera\' da un WebSocket');
  }
}

// --- il seme: la stessa serata si rigioca
{
  const uno = applica(partita(), { tipo: 'cerca', eroe: ELENA }, DATI);
  const due = applica(partita(), { tipo: 'cerca', eroe: ELENA }, DATI);
  ok(JSON.stringify(uno.eventi) === JSON.stringify(due.eventi),
     'stesso seme, stessa ricerca');
  const altro = applica(partita({}, [ELENA, OTTONE]), { tipo: 'cerca', eroe: ELENA }, DATI);
  ok(JSON.stringify(altro.eventi) === JSON.stringify(uno.eventi), 'e resta stabile');

  const s3 = partita(); s3.rng = { seme: 9, passo: 0 };
  const terzo = applica(s3, { tipo: 'cerca', eroe: ELENA }, DATI);
  ok(JSON.stringify(terzo.eventi) !== JSON.stringify(uno.eventi),
     'con un altro seme la serata e\' un\'altra');
}

// --- il passo del generatore avanza e si salva con la partita
{
  const s = partita();
  const out = applica(s, { tipo: 'cerca', eroe: ELENA }, DATI);
  ok(out.stato.rng.passo > 0, `il passo avanza (visto ${out.stato.rng.passo})`);
  ok(out.stato.rng.seme === 4242, 'e il seme resta quello della partita');
}

// --- i tiri del tavolo hanno la precedenza sul seme
{
  const s = conNemici([sgherro(1, 2)]);
  const alto = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  const basso = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[1, 1]] }, DATI);
  const tiroA = alto.eventi.find((e) => e.tipo === 'tiro');
  const tiroB = basso.eventi.find((e) => e.tipo === 'tiro');
  ok(tiroA && tiroA.d.join() === '6,6', 'il tiro dichiarato dal tavolo e\' quello che vale');
  ok(tiroB && tiroB.d.join() === '1,1', 'anche quando e\' basso');
  ok(tiroA.ok && !tiroB.ok, 'e decide l\'esito');
  ok(alto.stato.spedizione.nemici[0].ferite === 1, 'il 12 ferisce');
  ok(basso.stato.spedizione.nemici[0].ferite === 0, 'lo 2 no');
}

// --- tiri insufficienti: rifiuto, non un tiro inventato di nascosto
{
  const s = conNemici([sgherro(1, 2, 1), sgherro(2, 2, 1)], {
    eroiPos: { [ELENA]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 2, y: 1 } },
  });
  const out = applica(s, { tipo: 'attacca', eroe: OTTONE, bersaglio: 1, tiri: [] }, DATI);
  ok(out.rifiuto && /non bastano/i.test(out.rifiuto.motivo),
     `un comando senza abbastanza tiri e' rifiutato (visto «${out.rifiuto && out.rifiuto.motivo}»)`);
}

// --- LA PENDENZA: il Colpo da macello di Ottone
{
  // TRE sgherri adiacenti a Ottone (che sta in 2,1), tutti a una ferita dalla
  // fine. Ne servono tre e non due: abbattuto il primo ne devono restare DUE,
  // perche' con un solo bersaglio il motore non chiede — risolve, com'era.
  const s = conNemici([sgherro(2, 2, 1), sgherro(3, 1, 1), sgherro(2, 0, 1)]);
  const uno = applica(s, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!uno.rifiuto, `attaccare un adiacente e' ammesso (${uno.rifiuto && uno.rifiuto.motivo})`);
  ok(uno.eventi.some((e) => e.tipo === 'abbattuto'), 'il nemico a una ferita dalla fine cade');
  ok(uno.pendenza && uno.pendenza.tipo === 'macello',
     `col secondo adiacente in piedi si apre il Colpo da macello (vista ${uno.pendenza && uno.pendenza.tipo})`);
  ok(uno.pendenza.a === OTTONE, 'e la scelta e\' di Ottone');
  ok(uno.stato.spedizione.pendenza, 'la pendenza sta NELLO STATO: chi ricarica la ritrova');

  // finche' e' aperta, tutto il resto e' rifiutato
  const bloccato = applica(uno.stato, { tipo: 'muovi', eroe: ELENA, nodo: { t: T0, x: 1, y: 2 } }, DATI);
  ok(bloccato.rifiuto && /sospeso|sospesa/i.test(bloccato.rifiuto.motivo),
     `con una pendenza aperta muovere e' rifiutato (visto «${bloccato.rifiuto && bloccato.rifiuto.motivo}»)`);

  // rinunciare la chiude e NON consuma il colpo
  const rinuncia = applica(uno.stato, { tipo: 'rispondi', scelta: null }, DATI);
  ok(!rinuncia.rifiuto && !rinuncia.stato.spedizione.pendenza, 'rinunciando la pendenza si chiude');
  ok(rinuncia.stato.spedizione.macello !== rinuncia.stato.spedizione.round,
     'e il Colpo da macello resta disponibile: chi rinuncia non lo spende');

  // rispondere lo fa partire
  const scelto = uno.pendenza.opzioni[0].id;
  const colpo = applica(uno.stato, { tipo: 'rispondi', scelta: scelto, tiri: [[6, 6]] }, DATI);
  ok(!colpo.rifiuto, `rispondere e' ammesso (${colpo.rifiuto && colpo.rifiuto.motivo})`);
  ok(!colpo.stato.spedizione.pendenza, 'e la pendenza si chiude');
  ok(colpo.stato.spedizione.macello === colpo.stato.spedizione.round,
     'il colpo si consuma quando parte');

  // un bersaglio non offerto e' rifiutato
  const furbo = applica(uno.stato, { tipo: 'rispondi', scelta: 99 }, DATI);
  ok(furbo.rifiuto, 'un bersaglio fuori dalle opzioni e\' rifiutato');
}

// --- con UN solo adiacente il motore non chiede: risolve
{
  const s = conNemici([sgherro(2, 2, 1)]);
  const out = applica(s, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!out.pendenza, 'senza un secondo bersaglio non c\'e\' niente da chiedere');
}

// --- il Colpo da macello e' di Ottone e di nessun altro
{
  // Elena sta in (1,1): tre adiacenti a lei
  const s = conNemici([sgherro(1, 2, 1), sgherro(0, 1, 1), sgherro(1, 0, 1)]);
  const out = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!out.pendenza, 'il Colpo da macello non tocca agli altri eroi');
}

// --- l'economia del turno: due azioni, di tipo diverso
{
  let s = partita();
  const p = () => s.spedizione.eroiPos[ELENA];
  let out = applica(s, { tipo: 'muovi', eroe: ELENA, nodo: { t: T0, x: p().x, y: 2 } }, DATI);
  ok(!out.rifiuto, 'la prima mossa passa');
  ok((out.stato.spedizione.azioni[ELENA] || []).includes('muovere'), 'e l\'azione risulta spesa');
  s = out.stato;
  out = applica(s, { tipo: 'cerca', eroe: ELENA }, DATI);
  ok(!out.rifiuto, 'un\'azione di tipo diverso passa');
  s = out.stato;
  ok(s.spedizione.eroiFatti.includes(ELENA), 'due azioni e il turno dell\'eroe e\' finito');
  const terza = applica(s, { tipo: 'rianima', eroe: ELENA }, DATI);
  ok(terza.rifiuto, 'la terza azione e\' rifiutata');
}

// --- a partita chiusa non si gioca piu'
{
  const s = partita({ esito: 'vittoria' });
  ok(applica(s, { tipo: 'cerca', eroe: ELENA }, DATI).rifiuto, 'a spedizione chiusa ogni comando e\' rifiutato');
}

// --- provaDi DICHIARA la stessa prova che il motore poi RISOLVE.
//
// E' il controllo che tiene in piedi la modalita' tavolo. Li' l'overlay chiede
// il dado PRIMA del comando, e per mostrare soglia e bonus li prende da
// provaDi(); se quella dichiarasse numeri diversi da quelli che poi decidono
// l'esito, al tavolo si vedrebbe «11 ≥ 9, riuscita» e il motore direbbe fallita.
// Non puo' succedere finche' i risolutori chiamano provaDi invece di
// ricalcolare — e questo test e' cio' che lo impedisce di tornare a succedere.
{
  const { provaDi } = await import('./public/motore/azioni.js');
  const G = (s) => ({ ep: DATI.ep, comune: DATI.comune, carte: DATI.carte,
                      sp: s.spedizione, partita: s, _layout: null });

  // cercare: Elena ha ACUME + Occhio Clinico, Ottone il solo ACUME
  for (const chi of [ELENA, OTTONE]) {
    const s = partita();
    const p = provaDi(G(s), { tipo: 'cerca', eroe: chi });
    ok(p && p.soglia > 0, `${chi}: provaDi dichiara una soglia`);
    const out = applica(s, { tipo: 'cerca', eroe: chi, tiri: [[3, 4]] }, DATI);
    const tiro = out.eventi.find((e) => e.tipo === 'tiro');
    ok(tiro.soglia === p.soglia,
       `${chi}: la soglia dichiarata e' quella applicata (${p.soglia} contro ${tiro.soglia})`);
    ok(JSON.stringify(tiro.bonus) === JSON.stringify(p.bonus),
       `${chi}: i bonus dichiarati sono quelli applicati`);
    // e il conto che il tavolo farebbe a mano torna
    const aMano = 7 + p.bonus.reduce((a, b) => a + b.val, 0);
    ok(tiro.somma === aMano, `${chi}: 3+4 piu' i bonus fa ${aMano} (visto ${tiro.somma})`);
    ok(tiro.ok === (aMano >= p.soglia), `${chi}: e l'esito segue il conto`);
  }
  ok(provaDi(G(partita()), { tipo: 'cerca', eroe: ELENA }).bonus.length
     > provaDi(G(partita()), { tipo: 'cerca', eroe: OTTONE }).bonus.length,
     'l\'Occhio Clinico di Elena si vede nella dichiarazione');

  // Il VALORE, non solo la presenza. I due controlli sopra provano che
  // dichiarazione e risoluzione concordano — ma concorderebbero anche se
  // l'Occhio Clinico valesse 5, perche' leggono la stessa riga. Quanto vale lo
  // dice la carta stampata, e questo e' il chiodo che lo tiene fermo.
  {
    const b = provaDi(G(partita()), { tipo: 'cerca', eroe: ELENA }).bonus;
    const occhio = b.find((x) => /occhio/i.test(x.label));
    ok(occhio && occhio.val === 2, `l'Occhio Clinico vale +2 (visto ${occhio && occhio.val})`);
    const acume = b.find((x) => x.label === 'ACUME');
    const e = DATI.comune.eroi.find((x) => x.nome === ELENA);
    ok(acume && acume.val === e.acume,
       `e l'ACUME e' quello della carta (${e.acume}, visto ${acume && acume.val})`);
    ok(provaDi(G(partita()), { tipo: 'cerca', eroe: ELENA }).soglia
       === DATI.comune.regole.diff.Media, 'la soglia Media viene da comune.json');
  }

  // attaccare: la soglia e' la Difesa del nemico, i bonus VIGORE + arma
  {
    const s = conNemici([sgherro(1, 2)]);
    const p = provaDi(G(s), { tipo: 'attacca', eroe: ELENA, bersaglio: 0 });
    const out = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[3, 4]] }, DATI);
    const tiro = out.eventi.find((e) => e.tipo === 'tiro');
    ok(tiro.soglia === p.soglia, 'attacco: la Difesa dichiarata e\' quella applicata');
    ok(JSON.stringify(tiro.bonus) === JSON.stringify(p.bonus), 'attacco: e i bonus pure');
  }

  // dove non si tira, provaDi tace: l'overlay non deve comparire
  ok(provaDi(G(partita()), { tipo: 'rianima', eroe: ELENA }) === null,
     'rianimare non chiede dadi');
  ok(provaDi(G(partita()), { tipo: 'finisci-eroe', eroe: ELENA }) === null,
     'finire il turno non chiede dadi');

  // muovere: solo se la tessera d'arrivo ha un'insidia non ancora scattata
  {
    const conInsidia = DATI.ep.tessere.find((t) => /(NERVI|ACUME|VIGORE)\s*\(/i.test(t.testo || ''));
    if (conInsidia) {
      const s = partita({ rivelate: [T0, conInsidia.id] });
      const dove = { t: conInsidia.id, x: 1, y: 1 };
      ok(provaDi(G(s), { tipo: 'muovi', eroe: ELENA, nodo: dove }),
         `entrare in ${conInsidia.id} la prima volta chiede una prova`);
      const s2 = partita({ rivelate: [T0, conInsidia.id], insidie: { [conInsidia.id]: true } });
      ok(provaDi(G(s2), { tipo: 'muovi', eroe: ELENA, nodo: dove }) === null,
         'ma la seconda volta no: l\'insidia e\' gia\' scattata');
    } else {
      console.log('  (nessuna tessera con insidia nell\'Ep.1: controllo saltato)');
    }
  }
}

console.log(ko === 0 ? 'TUTTO OK (contratto)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
