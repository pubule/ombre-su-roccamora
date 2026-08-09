// La corsa del finale dell'Ep. 20, per intero: discesa + camera, e chi arriva
// prima fra il Controcanto (10 righe) e il Risveglio (Canto 8).
//
// Serve a rispondere a una domanda che le due misure precedenti non toccavano.
// `misura-discesa-ep20.mjs` pesa cio' che il Canto costa PRIMA della camera;
// `misura-cammino-ep20.mjs` dice che i dieci round della discesa sono geometria
// e non si accorciano. Restava fuori la leva piu' ovvia: **rallentare il Canto
// dentro la camera**, dove si spendono +2 per round su un budget di 8.
//
// Il modello replica cio' che muove i due contatori e nient'altro: pesca e
// Crescendo, tick di fine round, pressione della camera, ritmo del controcanto.
// Combattimento, ferite e movimento restano fuori — per quelli c'e' il pilota.
// Si valida sul pilota: coi valori di oggi deve dare ~0% di vittorie.
//
//   node webapp/misura-corsa-ep20.mjs [repliche]
import fs from 'fs';

const N = Number(process.argv[2]) || 4000;
const TAGLIA = 4;

const carte = JSON.parse(fs.readFileSync('webapp/data/carte.json', 'utf8'));
const comune = JSON.parse(fs.readFileSync('webapp/data/comune.json', 'utf8'));
const ep = JSON.parse(fs.readFileSync('webapp/data/ep20.json', 'utf8'));

const MAZZO = carte.minacce.ep20.filter((c) => !c.title.startsWith('Bivio'));
const CRES = MAZZO.map((c) => /aggiungete\s+1\s+segnalino/i.test(c.rules || ''));
const N_CRES = CRES.filter(Boolean).length;
// Sette carte su ventuno piazzano un impiegato del coro, e lo piazzano
// «sull'ingresso della tessera» o «sull'uscita piu' vicina»: se il gruppo e'
// nella camera, dentro la camera. L'ordine del round e' eroi -> Minaccia ->
// nemici -> controllo del ritmo, quindi il mazzo riempie DOPO che gli eroi
// hanno sgomberato e PRIMA che si conti chi c'e'.
const SPAWN = MAZZO.map((c) => /piazzate\s+\d*\s*sgherr/i.test(c.rules || ''));
// Lo Sgherro ha Dif 8 e 2 Ferite, e «si rompe a meta' Ferite»: un colpo a
// segno lo toglie di scena. 2d6+VIGORE 2 contro 8 = 72%.
const P_ROMPE = 0.72;
const OGNI = ep.canto_ogni || 4;
const SOGLIA = ep.soglia_canto != null ? ep.soglia_canto : comune.regole.soglia_canto;
const TETTO = ep.canto_max != null ? ep.canto_max : comune.regole.canto_max;
const [BASE, ALT] = comune.regole.pesca[String(TAGLIA)];
const RITMO = (ep.compiti.find((c) => c.ritmo) || {}).ritmo || {};
const RIGHE = 10;
const ARRIVO = 9;          // round d'ingresso nella camera: e' il pavimento geometrico

// una partita. `v` sono le varianti da provare.
function corsa(v) {
  const cres = MAZZO.map((_, i) => i < (v.crescendo != null ? v.crescendo : N_CRES));
  const ord = MAZZO.map((_, i) => i);
  for (let i = ord.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ord[i], ord[j]] = [ord[j], ord[i]];
  }
  let idx = 0; let canto = 0; let bonus = false; let righe = 0; let resto = 0;
  let coro = v.coro != null ? v.coro : 0;   // impiegati nella camera, dinamici
  const arrivo = v.tessere != null ? (v.tessere * 2 - 1) : ARRIVO;
  for (let round = 1; round <= 60; round += 1) {
    const inCamera = round >= arrivo;
    // fase eroi: il canto non costa azioni, quindi tutte e quattro vanno al coro
    if (inCamera && !v.coroFisso) {
      for (let e = 0; e < TAGLIA && coro > 0; e += 1) if (Math.random() < P_ROMPE) coro -= 1;
    }
    // pesca
    let q = BASE + ((ALT && round % 2 === 0) ? 1 : 0) + (bonus ? 1 : 0);
    while (q > 0) {
      if (idx >= ord.length) {
        for (let i = ord.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [ord[i], ord[j]] = [ord[j], ord[i]];
        }
        idx = 0;
      }
      if (cres[ord[idx]] && canto < TETTO) canto += 1;
      if (SPAWN[ord[idx]] && inCamera && !v.spawnFuori) coro += 1;
      idx += 1; q -= 1;
      if (canto >= SOGLIA) bonus = true;
    }
    // il canto degli eroi, che non costa azioni
    if (inCamera) {
      const grezzo = (RITMO.base || 1)
        + Math.floor((v.frammenti != null ? v.frammenti : RITMO.frammenti_default) / (RITMO.per_frammenti || 6))
        + (v.mappa === false ? 0 : (RITMO.con_oggetto || 0))
        - (v.impiegatoRallenta === false ? 0 : coro);
      righe += Math.max(RITMO.minimo != null ? RITMO.minimo : 1, grezzo);
      if (righe >= RIGHE) return { esito: 'vittoria', round, canto };
    }
    // tick di fine round
    if (round % OGNI === 0 && canto < TETTO) canto += 1;
    // pressione della camera: il Dormiente si desta, e il rito canta se ha voce
    if (inCamera) {
      const p = (v.pressione != null ? v.pressione : 1)
        + ((v.impiegatoDaVoce === false ? false : coro > 0) ? (v.rito != null ? v.rito : 1) : 0);
      // frazionaria: 0,5 = «si desta a round alterni». L'accumulatore evita di
      // arrotondare per difetto a zero e di regalare la meta' della pressione.
      resto += p;
      while (resto >= 1 && canto < TETTO) { canto += 1; resto -= 1; }
    }
    if (canto >= SOGLIA) bonus = true;
    if (canto >= TETTO) return { esito: 'risveglio', round, canto };
  }
  return { esito: 'risveglio', round: 60, canto };
}

const prova = (etichetta, v) => {
  const r = Array.from({ length: N }, () => corsa(v));
  const vinte = r.filter((x) => x.esito === 'vittoria').length;
  console.log(`  ${etichetta.padEnd(46)} ${String(Math.round(100 * vinte / N)).padStart(3)}%`);
};

console.log(`Corsa del finale — ${TAGLIA} eroi, ${N} repliche, ingresso in camera al round ${ARRIVO}`);
console.log(`  mazzo ${MAZZO.length} carte (${N_CRES} Crescendo) · tick ogni ${OGNI} · soglia ${SOGLIA} · tetto ${TETTO}`);
console.log(`  ritmo: ${RITMO.base}+1 ogni ${RITMO.per_frammenti} Frammenti, +${RITMO.con_oggetto} Mappa, −1 per impiegato, minimo ${RITMO.minimo}`);
console.log('');
console.log('COME E\' ADESSO');
prova('12 Frammenti, un impiegato in camera', {});
prova('18 Frammenti, un impiegato in camera', { frammenti: 18 });
prova('12 Frammenti, camera sgomberata', { coro: 0 });
console.log('');
console.log('RALLENTARE IL CANTO NELLA CAMERA (la leva non ancora provata)');
prova('il Dormiente si desta a round alterni (+0,5)', { pressione: 0.5 });
prova('il Dormiente non si desta: solo il rito (+1)', { pressione: 0 });
prova('il rito non accelera: solo il Dormiente (+1)', { rito: 0 });
console.log('');
console.log('RALLENTARE IL CANTO NELLA DISCESA');
prova('2 Crescendo invece di 4', { crescendo: 2 });
prova('3 Crescendo invece di 4', { crescendo: 3 });
console.log('');
console.log('ACCORCIARE LA DISCESA');
prova('3 tessere invece di 5 (camera al round 5)', { tessere: 3 });
prova('4 tessere invece di 5 (camera al round 7)', { tessere: 4 });
console.log('');
console.log('COMBINAZIONI');
prova('2 Crescendo + Dormiente a round alterni', { crescendo: 2, pressione: 0.5 });
prova('2 Crescendo + camera sgomberata', { crescendo: 2, coro: 0 });
prova('4 tessere + Dormiente a round alterni', { tessere: 4, pressione: 0.5 });
prova('solo: Dormiente a round alterni, 18 Frammenti', { pressione: 0.5, frammenti: 18 });
console.log('');
console.log('COL CORO CHE SI RIEMPIE DAVVERO (7 carte su 21 lo rimettono in camera)');
prova("come e' adesso, coro dinamico", { coroFisso: false });
prova('...con 18 Frammenti', { frammenti: 18 });
console.log('');
console.log('LA CORREZIONE PROPOSTA: un mestiere solo per impiegato');
prova("rallenta il canto, ma NON da' voce al rito", { impiegatoDaVoce: false });
prova("da' voce al rito, ma NON rallenta il canto", { impiegatoRallenta: false });
prova('...il primo, con 18 Frammenti', { impiegatoDaVoce: false, frammenti: 18 });
prova('...il primo, con 6 Frammenti', { impiegatoDaVoce: false, frammenti: 6 });
console.log('');
console.log('ALTERNATIVA: le carte non piazzano dentro la camera');
prova('gli impiegati arrivano, ma non nella camera', { spawnFuori: true });
