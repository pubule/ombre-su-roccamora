// LO SPAWN: chi entra in campo, dove, e quanti.
//
// I nemici evocati dai testi si ricavano dall'episodio (`pool` + boss), non da
// una lista cablata: ogni episodio nuovo funziona senza toccare il codice. E'
// la differenza con `spedizione.js`, che ha ancora otto nomi scritti a mano e
// per questo e' rimasto indietro.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`.
import { arrediSet, chiave, tileDi, layout, occupati } from './griglia.js';
import { nemStat, feriteMaxNem } from './stat.js';
import { sogliaCanto } from './regole.js';
import { specCompiti } from './obiettivi.js';

// Il diario della spedizione. E' stato, non presentazione: chi legge la partita
// piu' tardi deve ritrovarci cos'e' successo.
const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };

// Truppa: prima parola piena, senza la vocale finale («LO SGHERRO» → /sgherr/).
// Boss: nome intero, cosi' una citazione parziale non lo desta per sbaglio.
const SPAWN_OVERRIDE = {
  'CANE DEI MOLI': /(\d+)?\s*can[ei] dei moli/i,   // «can» da solo pescherebbe «canto»
};
const senzaArticolo = (n) => String(n).replace(/^(il|lo|la|i|gli|le|l’|l')\s*/i, '');
const tronca = (w) => w.replace(/[aeio]+$/i, '');
const NUM_PAROLA = { un: 1, due: 2, tre: 3 };

export function spawnRegex(g) {
  // IL BOSS NON SI PESCA DAL TESTO. Da quando le sue statistiche esistono, la
  // regola generica lo faceva apparire in qualunque tessera che lo nominasse di
  // sfuggita: nell'Ep.12 il Corriere spuntava nella prima stanza e la caccia
  // finiva al secondo round. Il boss compare dove dice `soluzione.boss_tile`,
  // e basta.
  const nomi = Object.keys(g.ep.pool || {});
  const boss = (g.ep.soluzione || {}).boss;
  return nomi.map((n) => {
    if (SPAWN_OVERRIDE[n]) return [n, SPAWN_OVERRIDE[n]];
    const parole = senzaArticolo(n).split(/\s+/);
    const corpo = n === boss
      ? [...parole.slice(0, -1), tronca(parole[parole.length - 1])].join('\\s+')
      : tronca(parole[0]);
    return [n, new RegExp(`(\\d+|un|due|tre)?\\s*${corpo}`, 'i')];
  });
}

export function spawnUno(g, nome, tileId) {
  const sp = g.sp; const st = nemStat(g, nome); if (!st) return false;
  const boss = st.boss;
  if (boss && sp.bossDestato) return false;   // un boss gia' destato/abbattuto non (ri)compare
  const inCampo = sp.nemici.filter((x) => x.nome === nome).length;
  const disp = boss ? 1 : (g.ep.pool || {})[nome] || 0;
  if (inCampo >= disp) return false;
  const tile = tileDi(g, tileId);
  const occ = new Set();
  occupati(g, null, false).forEach((k) => { const [t, x, y] = k.split(','); if (t === tileId) occ.add(`${x},${y}`); });
  // piazza lontano dagli eroi presenti nella tessera (se nessuno, dal centro)
  const eroiQui = Object.values(sp.eroiPos).filter((p) => p.t === tileId).map((p) => [p.x, p.y]);
  let best = null, bestD = -1;
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
    if (arrediSet(g, tile).has(chiave([x, y])) || occ.has(chiave([x, y]))) continue;
    const d = eroiQui.length ? Math.min(...eroiQui.map((p) => Math.abs(p[0] - x) + Math.abs(p[1] - y)))
                             : (Math.abs(x - 1.5) + Math.abs(y - 1.5));
    if (d > bestD) { bestD = d; best = [x, y]; }
  }
  if (!best) return false;
  let num = 1; while (sp.nemici.some((x) => x.nome === nome && x.num === num)) num += 1;
  sp.nemici.push({ nome, num, ferite: 0, max: feriteMaxNem(g, st), pos: { t: tileId, x: best[0], y: best[1] } });
  if (boss) sp.bossDestato = true;   // un boss abbattuto non torna, nemmeno a soglia
  return true;
}

// tessera rivelata piu' lontana dagli eroi (distanza sul grafo delle tessere)
export function tessLontana(g) {
  const sp = g.sp; const lay = layout(g);
  const heroT = [...new Set(Object.values(sp.eroiPos).map((p) => p.t))];
  let best = sp.rivelate[0], bd = -1;
  for (const id of sp.rivelate) {
    const [x, y] = lay[id];
    const d = heroT.length ? Math.min(...heroT.map((h) => { const [a, b] = lay[h]; return Math.abs(a - x) + Math.abs(b - y); })) : 0;
    if (d > bd) { bd = d; best = id; }
  }
  return best;
}

// al raggiungimento della soglia del Canto il boss si desta (tessera rivelata
// piu' lontana), se non e' gia' in campo o gia' stato abbattuto. Ritorna annunci.
export function destaBossSeSoglia(g) {
  const sp = g.sp; const boss = g.ep.soluzione.boss; const soglia = sogliaCanto(g.comune, g.ep);
  if (!boss || sp.canto < soglia) return [];
  if (sp.bossDestato || sp.nemici.some((x) => x.nome === boss)) return [];
  // Un boss che NON si muove non puo' destarsi «nella stanza piu' lontana»: la
  // Camera del Dormiente (Ep.20) ha mov 0 perche' E' la camera, cioe' la
  // tessera finale. Piazzata a caso al Canto 3, e poi bloccata da `bossDestato`
  // dal ricomparire dove le spetta, restava in un angolo del tabellone senza
  // toccare nessuno — sono i «4 eroi su 4 in piedi» misurati nel finale. Se la
  // sua tessera non e' ancora scoperta non si desta affatto: ci pensera'
  // `spawnDaTesto` quando il gruppo aprira' la camera.
  const st = nemStat(g, boss) || {};
  const suo = (g.ep.soluzione || {}).boss_tile
    || (g.ep.tessere[g.ep.tessere.length - 1] || {}).id;
  // Un boss che si aggancia SOLO in una stanza precisa e' un boss che ASPETTA
  // in quella stanza: il Primo Gatto «appare in cresta, piu' in alto, e vi
  // studia in silenzio» (Ep.14, T4), non scende a menare le mani. Svegliarlo
  // sulla tessera piu' lontana lo mandava addosso al gruppo, che non poteva
  // agganciarlo (regola giusta) e quindi combatteva e moriva senza avanzare:
  // 4 sconfitte su 4, l'Attico mai raggiunto. `compito.tile` dice gia' dov'e'
  // il suo posto — non serve un campo nuovo. L'Ep.12 non ne ha apposta: li' il
  // Corriere e' una preda in corsa e deve stare sul tabellone presto.
  const casa = (specCompiti(g).find((c) => c.nemico === boss && c.tile) || {}).tile;
  if (casa) {
    if (!sp.rivelate.includes(casa)) return [];
    if (!spawnUno(g, boss, casa)) return [];
    return [`${boss.toLowerCase()} vi aspetta in ${casa}.`];
  }
  if (!st.mov) {
    if (!sp.rivelate.includes(suo)) return [];
    if (!spawnUno(g, boss, suo)) return [];
    return [`${boss.toLowerCase()} si desta: è la stanza stessa (${suo}).`];
  }
  const tile = tessLontana(g);
  if (!spawnUno(g, boss, tile)) return [];
  return [`${boss.toLowerCase()} si desta nella stanza rivelata più lontana (${tile}).`];
}

export function spawnDaTesto(g, testo, tileId) {
  // IL BOSS E' UN DATO, non un incidente di lettura. Finora appariva solo se il
  // testo della tessera lo nominava in una forma che l'espressione regolare
  // riconosceva: nell'Ep.19 il testo dice «con l'Ispettore convinto alle
  // spalle» e Vidal non entrava MAI in partita — l'obiettivo «convincilo» era
  // irraggiungibile per una questione di prosa. `ep.soluzione.boss_tile` (di
  // norma l'ultima tessera della spina) lo fa comparire di sicuro.
  const bossNome = (g.ep.soluzione || {}).boss;
  const bossTile = (g.ep.soluzione || {}).boss_tile
    || (g.ep.tessere[g.ep.tessere.length - 1] || {}).id;
  if (bossNome && tileId === bossTile && !g.sp.nemici.some((n) => n.nome === bossNome)) {
    if (spawnUno(g, bossNome, tileId)) log(g, `Appare ${bossNome.toLowerCase()} in ${tileId}.`);
  }
  for (const [nome, re] of spawnRegex(g)) {
    const m = testo.match(re); if (!m) continue;
    let q = 1; if (m[1]) q = NUM_PAROLA[m[1].toLowerCase()] || Number(m[1]) || 1;
    for (let k = 0; k < q; k++) if (spawnUno(g, nome, tileId)) log(g, `Appare ${nome.toLowerCase()} in ${tileId}.`);
  }
}

// tessera con piu' eroi (per i rinforzi Minaccia)
export function tileAffollata(g) {
  const sp = g.sp; const conta = {};
  for (const p of Object.values(sp.eroiPos)) conta[p.t] = (conta[p.t] || 0) + 1;
  let best = sp.rivelate[0], bestN = -1;
  for (const [t, n] of Object.entries(conta)) if (n > bestN) { bestN = n; best = t; }
  return best;
}
