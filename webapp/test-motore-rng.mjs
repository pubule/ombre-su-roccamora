// Il generatore seminato della partita.
//
// Perche' esiste: fino a oggi i dadi venivano da Math.random, sparso in tre
// file (digitale.js, engine.js, dadi.js). Una serata non si poteva rigiocare,
// quindi ogni misura di bilanciamento era una stima su rumore invece che un
// numero verificabile. Con {seme, passo} dentro la partita, la stessa serata
// si ripete identica — e una regressione si distingue dalla varianza.
//
// node webapp/test-motore-rng.mjs
import { creaRng, prossimo, interoFino, tira2d6, mescola } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// --- riproducibilita': stesso seme, stessa sequenza
{
  const a = creaRng(12345), b = creaRng(12345);
  const sa = Array.from({ length: 200 }, () => prossimo(a));
  const sb = Array.from({ length: 200 }, () => prossimo(b));
  ok(sa.join() === sb.join(), 'stesso seme, stessa sequenza');
  ok(a.passo === 200 && b.passo === 200, `il passo conta i tiri (visto ${a.passo})`);
}

// --- semi diversi divergono
{
  const a = creaRng(1), b = creaRng(2);
  const sa = Array.from({ length: 20 }, () => prossimo(a)).join();
  const sb = Array.from({ length: 20 }, () => prossimo(b)).join();
  ok(sa !== sb, 'semi diversi, sequenze diverse');
}

// --- ripresa da uno stato salvato. E' il caso della riconnessione: si riapre
// la partita a meta' serata e i dadi devono continuare dove erano, non
// ricominciare.
{
  const filato = creaRng(999);
  for (let i = 0; i < 37; i++) prossimo(filato);
  const attesi = Array.from({ length: 10 }, () => prossimo(filato));

  const ripreso = { seme: 999, passo: 37 };            // come uscirebbe da un salvataggio
  const ottenuti = Array.from({ length: 10 }, () => prossimo(ripreso));
  ok(attesi.join() === ottenuti.join(),
     'riprendendo da {seme,passo} la sequenza continua identica');
  ok(ripreso.passo === 47, `e il passo riparte da dove era (visto ${ripreso.passo})`);
}

// --- dominio
{
  const r = creaRng(7);
  let fuori = 0;
  for (let i = 0; i < 10000; i++) { const v = prossimo(r); if (!(v >= 0 && v < 1)) fuori++; }
  ok(fuori === 0, `prossimo() resta in [0,1) (fuori ${fuori})`);

  const r2 = creaRng(7);
  const conteggio = new Array(6).fill(0);
  for (let i = 0; i < 60000; i++) conteggio[interoFino(r2, 6)]++;
  ok(conteggio.every((c) => c > 9000 && c < 11000),
     `interoFino(6) uniforme (visto ${conteggio.join(',')})`);
  ok(conteggio.reduce((a, b) => a + b, 0) === 60000, 'e non perde tiri per strada');
}

// --- 2d6: due dadi veri, non un numero fra 2 e 12. La differenza si vede
// all'animazione (le facce) e in ogni regola che guardasse il doppio.
{
  const r = creaRng(42);
  const freq = {};
  let facceKo = 0, sommeKo = 0;
  for (let i = 0; i < 60000; i++) {
    const t = tira2d6(r);
    if (!(t.d.length === 2 && t.d.every((x) => x >= 1 && x <= 6))) facceKo++;
    if (t.tot !== t.d[0] + t.d[1]) sommeKo++;
    freq[t.tot] = (freq[t.tot] || 0) + 1;
  }
  ok(facceKo === 0, `i due dadi sono d6 (anomalie ${facceKo})`);
  ok(sommeKo === 0, `il totale e' la somma dei due dadi (anomalie ${sommeKo})`);
  ok(Object.keys(freq).length === 11, `2d6 copre 2..12 (visti ${Object.keys(freq).length} valori)`);
  ok(freq[7] > freq[2] * 4, `la campana ha il 7 al centro (7:${freq[7]} contro 2:${freq[2]})`);
  // un 2d6 consuma esattamente due numeri: serve a chi conta i passi per
  // riavvolgere una partita
  const r2 = creaRng(1); tira2d6(r2);
  ok(r2.passo === 2, `un 2d6 avanza il passo di 2 (visto ${r2.passo})`);
}

// --- mescola: permutazione vera, e riproducibile. Sostituisce i due
// rimescolamenti del mazzo Minaccia (engine.js:138 e :157).
{
  const base = Array.from({ length: 50 }, (_, i) => i);
  const a = mescola(creaRng(5), base.slice());
  const b = mescola(creaRng(5), base.slice());
  ok(a.join() === b.join(), 'mescola e\' riproducibile col seme');
  ok(a.slice().sort((x, y) => x - y).join() === base.join(),
     'mescola permuta senza perdere ne\' duplicare elementi');
  ok(a.join() !== base.join(), 'mescola cambia davvero l\'ordine');

  // ogni posizione deve poter finire ovunque: un Fisher-Yates scritto male
  // (indice sbagliato di uno) lascia il primo elemento fermo o esclude
  // l'ultima posizione, e il mazzo si ripete
  const r = creaRng(77);
  const dovePuoFinire = new Set();
  for (let i = 0; i < 2000; i++) dovePuoFinire.add(mescola(r, base.slice()).indexOf(0));
  ok(dovePuoFinire.size === 50,
     `il primo elemento puo' finire in ogni posizione (viste ${dovePuoFinire.size}/50)`);
}

// La purezza (niente document/window/Math.random nel motore) non si controlla
// qui: la sorveglia test-motore-purezza.mjs su TUTTA la cartella, cosi' vale
// anche per i file che verranno dopo senza doverselo ricordare.

console.log(ko === 0 ? 'TUTTO OK (rng)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
