// LE ABILITA' A CARICHE, dentro il contratto.
//
// Otto abilita' che in digitale.js chiedevano qualcosa con `await scegli()` in
// mezzo alla regola. Qui la domanda si fa prima (`candidati`) e il comando
// arriva completo. Si prova che:
//   - i candidati offerti siano quelli giusti, e nessun altro;
//   - una scelta fuori da quelle offerte sia rifiutata;
//   - la carica si spenda una volta sola, e solo se l'abilita' ha agito;
//   - l'effetto sullo stato sia quello stampato sulla carta.
//
// L'esca e la voce ferma hanno un controllo in piu': sono state per mesi
// «carica spesa, effetto narrato» — il bottone c'era, l'azione si consumava e
// il gioco non se ne accorgeva (AUDIT-CLASSI.md). Questi controlli esistono
// perche' non tornino prosa.
//
// node webapp/test-motore-abilita.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { candidati, caricaDi, CARICHE_SPED } from './public/motore/abilita.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const DATI = {
  ep: JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
};
const EROI = DATI.comune.eroi.map((e) => e.nome);
const chiHa = (k) => EROI.find((n) => n.includes(k));
const T0 = DATI.ep.tessere[0].id;
const SGH = DATI.comune.nemici[0].nome;

function partita(party, over = {}) {
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: T0, x: 1, y: i % 4 }; vite[n] = 5; });
  return {
    v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme: 7, passo: 0 },
    spedizione: {
      round: 2, canto: 3, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [T0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
      ...over,
    },
  };
}
const G = (s) => ({ ep: DATI.ep, comune: DATI.comune, carte: DATI.carte,
                    sp: s.spedizione, partita: s, _layout: null });

// --- ogni eroe con cariche ha una voce nella tabella, e i numeri sono quelli
{
  for (const c of CARICHE_SPED) {
    const nm = chiHa(c.key);
    ok(nm, `${c.key}: c'e' un eroe con questo nome`);
    if (nm) ok(caricaDi(nm) === c, `${c.key}: caricaDi lo trova`);
  }
  ok(CARICHE_SPED.filter((c) => c.usi === null).length === 1,
     'una sola abilita\' senza cariche (il Colpo da macello, che e\' automatico)');
}

// --- LITANIA: −1 Canto, una carica, nessuna domanda
{
  const M = chiHa('MARANI'); const s = partita([M]);
  ok(candidati(G(s), M) === null, 'la Litania non chiede niente');
  const out = applica(s, { tipo: 'abilita', eroe: M }, DATI);
  ok(!out.rifiuto, `la Litania parte (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.stato.spedizione.canto === 2, `−1 Canto (3 → ${out.stato.spedizione.canto})`);
  ok(out.stato.spedizione.abilita[M] === 1, 'e spende una carica');
  // finite le cariche, non si usa piu'
  const finito = partita([M], { canto: 3, abilita: { [M]: 1 } });
  ok(applica(finito, { tipo: 'abilita', eroe: M }, DATI).rifiuto,
     'con la carica spesa la Litania e\' rifiutata');
}

// --- CURA: solo se stesso e gli adiacenti vivi, e non oltre la Salute massima
{
  const A = chiHa('ATTILIO'); const E = chiHa('ELENA'); const N = chiHa('NINO');
  const s = partita([A, E, N], {
    eroiPos: { [A]: { t: T0, x: 1, y: 1 }, [E]: { t: T0, x: 1, y: 2 }, [N]: { t: T0, x: 3, y: 3 } },
    vite: { [A]: 5, [E]: 2, [N]: 2 },
  });
  const c = candidati(G(s), A);
  const offerti = c.opzioni.map((o) => o.id);
  ok(offerti.includes(A) && offerti.includes(E), 'si cura se stesso e chi e\' adiacente');
  ok(!offerti.includes(N), 'ma non chi e\' lontano');

  const out = applica(s, { tipo: 'abilita', eroe: A, scelta: E }, DATI);
  ok(out.stato.spedizione.vite[E] === 4, `+2 Salute (2 → ${out.stato.spedizione.vite[E]})`);
  ok(applica(s, { tipo: 'abilita', eroe: A, scelta: N }, DATI).rifiuto,
     'curare un lontano e\' rifiutato');

  // non si cura oltre il massimo
  const pieno = partita([A], { vite: { [A]: 99 } });
  const o2 = applica(pieno, { tipo: 'abilita', eroe: A, scelta: A }, DATI);
  const e = DATI.comune.eroi.find((x) => x.nome === A);
  ok(o2.stato.spedizione.vite[A] <= e.salute + 4,
     `la cura non sfonda la Salute massima (vista ${o2.stato.spedizione.vite[A]})`);
}

// --- FLASH: solo entro 2 caselle, e il nemico salta davvero il turno
{
  const C = chiHa('CARLA'); const s = partita([C], {
    eroiPos: { [C]: { t: T0, x: 0, y: 0 } },
    nemici: [{ nome: SGH, num: 1, pos: { t: T0, x: 1, y: 0 }, ferite: 0, max: 2 },
             { nome: SGH, num: 2, pos: { t: T0, x: 3, y: 3 }, ferite: 0, max: 2 }],
  });
  const c = candidati(G(s), C);
  ok(c.opzioni.length === 1 && c.opzioni[0].id === '0',
     `solo il nemico vicino e' accecabile (offerti ${c.opzioni.length})`);
  const out = applica(s, { tipo: 'abilita', eroe: C, scelta: '0' }, DATI);
  ok(out.stato.spedizione.nemici[0].flash === true, 'il nemico e\' accecato');
  ok(applica(s, { tipo: 'abilita', eroe: C, scelta: '1' }, DATI).rifiuto,
     'accecare il lontano e\' rifiutato');

  const soli = partita([C], { nemici: [] });
  ok(candidati(G(soli), C).vuoto, 'senza nemici vicini l\'abilita\' lo dice invece di sprecarsi');
  ok(applica(soli, { tipo: 'abilita', eroe: C }, DATI).rifiuto, 'e il comando e\' rifiutato');
}

// --- VOCE FERMA: lascia un segno nello stato, non solo una riga di diario
{
  const S = chiHa('SERRA'); const s = partita([S]);
  ok(candidati(G(s), S) === null, 'la Voce ferma non chiede niente');
  const out = applica(s, { tipo: 'abilita', eroe: S }, DATI);
  ok(out.stato.spedizione.voceFerma, 'la Voce ferma lascia un segno nello stato');
  ok(out.stato.spedizione.voceFerma.da === S, 'e dice di chi e\'');
  ok(out.stato.spedizione.abilita[S] === 1, 'e consuma esattamente una carica');
}

// --- ESCA: la casella va dichiarata, dev'essere a portata, e il monile si posa
{
  const K = chiHa('CARBONE'); const s = partita([K], {
    eroiPos: { [K]: { t: T0, x: 0, y: 0 } },
    nemici: [{ nome: SGH, num: 1, pos: { t: T0, x: 2, y: 1 }, ferite: 0, max: 2 }],
  });
  const c = candidati(G(s), K);
  ok(c && c.celle && Object.keys(c.celle).length > 0, 'l\'esca offre delle caselle');
  ok(!c.opzioni, 'che non sono una lista: si toccano sulla plancia');

  ok(applica(s, { tipo: 'abilita', eroe: K }, DATI).rifiuto,
     'l\'Esca senza una casella dichiarata e\' un rifiuto, non un mezzo turno');

  const dove = Object.values(c.celle)[0].node;
  const out = applica(s, { tipo: 'abilita', eroe: K, cella: dove }, DATI);
  ok(!out.rifiuto, `con la casella l'Esca parte (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.stato.spedizione.esca, 'l\'Esca lascia il monile sul tabellone');
  ok(out.stato.spedizione.abilita[K] === 1, 'e spende la carica');
  ok(!('escaModo' in out.stato.spedizione),
     'e il modo a due tempi non serve piu\': niente mezzo gesto da salvare');

  const lontano = { t: T0, x: 3, y: 3 };
  const fuori = applica(s, { tipo: 'abilita', eroe: K, cella: lontano }, DATI);
  ok(fuori.rifiuto, 'una casella fuori gittata e\' rifiutata');
}

// --- MALACARNE: solo truppa, e il nemico esce dal campo
{
  const B = chiHa('BRERA'); const s = partita([B], {
    nemici: [{ nome: SGH, num: 1, pos: { t: T0, x: 3, y: 3 }, ferite: 0, max: 2 }],
  });
  const c = candidati(G(s), B);
  const tipo = (DATI.comune.nemici.find((n) => n.nome === SGH) || {}).tipo || '';
  if (/malavita|cultista|cane/i.test(tipo)) {
    ok(c.opzioni.length === 1, 'il nemico di truppa e\' allontanabile');
    const out = applica(s, { tipo: 'abilita', eroe: B, scelta: '0' }, DATI);
    ok(out.stato.spedizione.nemici.length === 0, 'e se ne va dal campo');
  } else {
    ok(c.vuoto, `${SGH} non e' truppa (${tipo}): l'abilita' lo dice`);
  }
}

// --- SESTO SENSO: manda in fondo una delle due carte in cima
{
  const S = chiHa('SIBILLA');
  const mazzo = { pool: ['a', 'b', 'c', 'd'], ordine: [0, 1, 2, 3], indice: 0, scarti: [] };
  const s = partita([S], { mazzo });
  const c = candidati(G(s), S);
  ok(c.opzioni.length === 3, `due carte piu' «lascia com'e'» (viste ${c.opzioni.length})`);
  const out = applica(s, { tipo: 'abilita', eroe: S, scelta: '0' }, DATI);
  ok(out.stato.spedizione.mazzo.ordine[3] === 0, 'la prima carta finisce in fondo');
  ok(out.stato.spedizione.mazzo.ordine.length === 4, 'e il mazzo non perde carte');

  const lascia = applica(s, { tipo: 'abilita', eroe: S, scelta: 'skip' }, DATI);
  ok(lascia.stato.spedizione.mazzo.ordine.join() === '0,1,2,3', '«lascia com\'e\'» non tocca l\'ordine');
  ok(lascia.stato.spedizione.abilita[S] === 1, 'ma la carica si spende lo stesso: e\' stata guardata');

  const vuoto = partita([S], { mazzo: { pool: [], ordine: [], indice: 0, scarti: [] } });
  ok(candidati(G(vuoto), S).vuoto, 'a mazzo esaurito lo dice');
}

// --- l'abilita' costa un'azione, e l'economia del turno vale anche per lei
{
  const M = chiHa('MARANI'); const s = partita([M], { azioni: { [M]: ['muovere', 'cercare'] } });
  ok(applica(s, { tipo: 'abilita', eroe: M }, DATI).rifiuto,
     'a azioni esaurite l\'abilita\' e\' rifiutata');
}

console.log(ko === 0 ? 'TUTTO OK (abilità a cariche)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
