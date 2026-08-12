// IL GENERATORE DELLA PARTITA. Non e' Math.random: lo stato ({seme, passo})
// vive dentro la partita e si salva con lei, quindi la stessa serata si rigioca
// identica.
//
// Perche' importa qui piu' che altrove: le percentuali di vittoria di tutti e
// ventuno gli episodi sono misurate facendo giocare un bot. Con Math.random
// ogni corsa e' irripetibile, quindi «l'Ep.6 e' sceso dal 60% al 40%» non si
// puo' distinguere dal rumore senza rifare centinaia di partite. Col seme, due
// corse sono confrontabili una a una.
//
// `passo` conta i numeri gia' estratti: riaprendo un salvataggio si riparte da
// li' e la sequenza continua dov'era. E' cio' che rende la riconnessione a
// meta' serata indistinguibile dal non essersi mai disconnessi.
//
// mulberry32: 32 bit di stato, veloce, distribuzione buona. Non e'
// crittografico e non deve esserlo — qui si tirano dadi, non si generano
// chiavi.

export const creaRng = (seme) => ({ seme: seme >>> 0, passo: 0 });

// Puro: (seme, passo) -> valore. Nessuno stato nascosto, quindi il numero
// n-esimo di una partita si puo' ricalcolare senza rigiocare i primi n-1.
function grezzo(seme, passo) {
  let a = (seme + Math.imul(0x6D2B79F5, passo + 1)) >>> 0;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

export function prossimo(rng) {
  const v = grezzo(rng.seme, rng.passo);
  rng.passo += 1;
  return v;
}

export const interoFino = (rng, n) => Math.floor(prossimo(rng) * n);

// Due dadi separati, non un totale fra 2 e 12: le facce servono
// all'animazione, e una regola che guardasse il doppio non potrebbe leggerle
// da una somma.
export function tira2d6(rng) {
  const d = [interoFino(rng, 6) + 1, interoFino(rng, 6) + 1];
  return { d, tot: d[0] + d[1] };
}

// Fisher-Yates, in place. Sostituisce i due rimescolamenti del mazzo Minaccia
// (engine.js:136-140 e :155-159), che erano gli unici altri Math.random del
// motore. L'indice va preso in [0, i], estremi compresi: prenderlo in [0, i)
// e' il baco classico che lascia un elemento fermo e rende il mazzo prevedibile.
export function mescola(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = interoFino(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
