// LE NOSTRE TESSERE, SCRITTE COME UN FILE DI DUNGEON SCRAWL.
//
// Dungeon Scrawl (dungeonscrawl.com) e' gratuito, gira nel browser e non chiede
// registrazione. Il suo file di salvataggio `.ds` e' uno ZIP con dentro una voce
// `map` che e' JSON in chiaro, NON compresso — e tutta la geometria di una
// stanza sta in una riga sola:
//
//   data.geometry[<uuid>].polygons = [ [ anello_esterno, buco, buco, ... ], ... ]
//
// con i punti in PIXEL e la casella che vale `cellDiameter`. Cioe' esattamente
// il contorno di un'unione di caselle: quel che il nostro generatore calcola
// gia' per sapere dove mettere i muri (`bordi` in pittura-vtt.js).
//
// PERCHE' PUO' SERVIRE. Il nostro pennello compone texture dipinte; Dungeon
// Scrawl disegna a inchiostro, che e' il tratto dei giochi da tavolo stampati.
// Scrivendo il `.ds` da qui, le 127 tessere si aprono nel suo editor gia' fatte
// — nessuno le ridisegna a mano, e restano quelle che i dati dichiarano: stessa
// sagoma, stesse porte, stesse coordinate. Chi vuole ritocca a mano e riesporta.
//
// QUEL CHE NON FA. Gli arredi no: qui c'e' la pianta, non il mobilio. E la
// versione gratuita non ha le texture di pavimento (sono PRO), quindi il
// pavimento e' a tinta piatta — che per un tratto a inchiostro e' giusto cosi'.

const CELLA = 36;          // px per casella, come li scrive Dungeon Scrawl

// ---------------------------------------------------------------- il contorno
//
// Da un insieme di caselle al suo profilo. Si prendono i lati di bordo — quelli
// dove la casella accanto non c'e' — orientati in modo che il pieno resti sempre
// dalla stessa parte, e si incatenano in anelli chiusi. Il buco in mezzo a un
// ballatoio viene fuori da solo, come anello a verso opposto: non e' un caso da
// trattare a parte, e' la stessa regola.
function anelli(celle) {
  const vive = new Set(celle.map(([x, y]) => `${x},${y}`));
  const viva = (x, y) => vive.has(`${x},${y}`);

  // DA UN VERTICE POSSONO PARTIRE DUE LATI, non uno.
  //
  // Dove due caselle si toccano solo per l'angolo — e succede eccome: il giro
  // del ballatoio, i gradini della guglia — il vertice in comune ha DUE lati
  // uscenti. Tenendone uno solo (una Map da punto a punto) i due anelli si
  // saldavano fra loro e usciva una diagonale che tagliava la stanza in mezzo.
  // Visto sulla pianta dell'Ep. 11, non sul collaudo: il quadrato e la ciambella
  // non hanno vertici pizzicati, e passavano lo stesso.
  const lati = new Map();          // "x,y" di partenza -> [punti d'arrivo]
  const metti = (a2, b2) => {
    const k = a2.join(',');
    if (!lati.has(k)) lati.set(k, []);
    lati.get(k).push(b2);
  };

  for (const [x, y] of celle) {
    if (!viva(x, y - 1)) metti([x, y], [x + 1, y]);            // sopra
    if (!viva(x + 1, y)) metti([x + 1, y], [x + 1, y + 1]);    // destra
    if (!viva(x, y + 1)) metti([x + 1, y + 1], [x, y + 1]);    // sotto
    if (!viva(x - 1, y)) metti([x, y + 1], [x, y]);            // sinistra
  }

  // fra due lati uscenti si sceglie quello che gira PIU' STRETTO nel verso del
  // pieno: e' la regola che tiene separati due anelli che si toccano
  const svolta = (dir, ndir) => {
    const cross = dir[0] * ndir[1] - dir[1] * ndir[0];
    const dot = dir[0] * ndir[0] + dir[1] * ndir[1];
    // il verso e' ORARIO con la y verso il basso — e' come nasce il giro di una
    // casella: sopra, destra, sotto, sinistra. La svolta piu' stretta che resta
    // nello stesso anello ha percio' cross POSITIVO. Col segno al contrario, al
    // vertice pizzicato si saltava nell altro anello e i due si saldavano.
    if (cross > 0) return 0;        // la piu' stretta, nel verso del giro
    if (dot > 0) return 1;          // dritto
    if (cross < 0) return 2;        // dall altra parte
    return 3;                       // torna indietro
  };

  const fuori = [];
  let restano = [...lati.values()].reduce((n, v) => n + v.length, 0);
  while (restano > 0) {
    const partenza = [...lati.entries()].find(([, v]) => v.length);
    if (!partenza) break;
    const primo = partenza[0];
    const anello = [primo.split(',').map(Number)];
    let qui = primo;
    let dir = null;
    while (true) {
      const usc = lati.get(qui);
      if (!usc || !usc.length) break;
      let scelto = 0;
      if (dir && usc.length > 1) {
        let meglio = 9;
        usc.forEach((q, i) => {
          const nd = [q[0] - anello[anello.length - 1][0], q[1] - anello[anello.length - 1][1]];
          const s2 = svolta(dir, nd);
          if (s2 < meglio) { meglio = s2; scelto = i; }
        });
      }
      const prossimo = usc.splice(scelto, 1)[0];
      restano--;
      dir = [prossimo[0] - anello[anello.length - 1][0], prossimo[1] - anello[anello.length - 1][1]];
      anello.push(prossimo);
      qui = prossimo.join(',');
      if (qui === primo) break;
    }
    if (anello.length > 3) fuori.push(semplifica(anello));
  }
  return fuori;
}

// tre punti in fila sulla stessa retta sono due punti: senza questo, un muro
// lungo dieci caselle esce con undici vertici invece di due
function semplifica(punti) {
  // l'anello arriva gia' chiuso — l'ultimo punto e' il primo — e lasciarlo
  // dentro faceva sbagliare i conti sui vicini: il quadrato usciva con tre
  // vertici invece di quattro
  if (punti.length > 1) {
    const a = punti[0], b = punti[punti.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) punti = punti.slice(0, -1);
  }
  const out = [];
  for (let i = 0; i < punti.length; i++) {
    const a = punti[(i - 1 + punti.length) % punti.length];
    const b = punti[i];
    const c = punti[(i + 1) % punti.length];
    const dritto = (b[0] - a[0]) * (c[1] - b[1]) === (b[1] - a[1]) * (c[0] - b[0]);
    if (!dritto) out.push(b);
  }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) {
    out.push(out[0]);
  }
  return out;
}

const area = (r) => {
  let a = 0;
  for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
  return a / 2;
};

// ------------------------------------------------------------------ il file
const uuid = (n) => {
  // deterministico: la stessa tessera produce lo stesso file, sempre. Con gli
  // uuid a caso due esportazioni della stessa stanza erano due file diversi, e
  // non si poteva piu' dire se una modifica veniva dai dati o dal generatore.
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 131 + n.charCodeAt(i)) >>> 0;
  const p = (k) => ((h * (k + 7) + 0x9e3779b9) >>> 0).toString(16).padStart(8, '0');
  return `${p(1)}-${p(2).slice(0, 4)}-4${p(3).slice(0, 3)}-a${p(4).slice(0, 3)}-${p(5)}${p(6).slice(0, 4)}`;
};

/**
 * Il JSON di un file `.ds` per una tessera.
 *
 * @param tile   la tessera (serve id e nome)
 * @param celle  [[col,row], ...] le caselle vive (la sagoma)
 * @param stile  'Classic Hatching' | 'Simple Walls' | 'Ancient Map' ...
 */
function documento(tile, celle, { stile = 'Classic Hatching', margine = 2 } = {}) {
  const seme = `${tile.id || ''}-${tile.nome || ''}`;
  const id = (che) => uuid(seme + che);
  const pagina = id('page');
  const geomNodo = id('geo');
  const geomDati = id('geodata');

  const rings = anelli(celle).map((r) => r.map(([x, y]) =>
    [(x + margine) * CELLA, (y + margine) * CELLA]));
  // l'anello con l'area piu' grande e' il muro esterno, gli altri sono i buchi
  rings.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));

  const nodi = {
    document: { type: 'DOCUMENT', id: 'document', name: tile.nome || 'tessera',
                selectedPage: pagina, children: [pagina] },
    [pagina]: {
      type: 'PAGE', id: pagina, parentId: 'document', name: tile.nome || '',
      children: [geomNodo], selection: [], alpha: 1, objectSelection: [],
      pageTransform: 'default', templateLocked: false,
      grid: { type: 'square', cellDiameter: CELLA, variant: 'lines', visible: true,
              dotsOptions: { radius: 1.5 }, linesOptions: { width: 1 },
              sharedOptions: { colour: { colour: 6710886, alpha: 0.5 } } },
      background: { colour: { colour: 15790320, alpha: 1 } },
    },
    [geomNodo]: {
      type: 'GEOMETRY', id: geomNodo, parentId: pagina, name: stile, alpha: 1,
      visible: true, allowsLightToPass: false, children: [id('walls'), id('floor')],
      geometryId: geomDati,
    },
    [id('floor')]: {
      type: 'MULTIPOLYGON', id: id('floor'), parentId: geomNodo, name: 'Floor',
      alpha: 1, visible: true, isFog: false, mask: false, blendMode: 'normal',
      fill: { colour: { colour: 15789280, alpha: 1 }, visible: true },
      stroke: { visible: false, colour: { colour: 0, alpha: 1 }, width: 1 },
    },
    [id('walls')]: {
      type: 'MULTIPOLYGON', id: id('walls'), parentId: geomNodo, name: 'Walls',
      alpha: 1, visible: true, isFog: false, mask: false, blendMode: 'normal',
      fill: { visible: false, colour: { colour: 0, alpha: 1 } },
      stroke: { visible: true, colour: { colour: 0, alpha: 1 }, width: 5 },
    },
  };

  return {
    version: 1,
    state: { document: { documentNodeId: 'document', nodes: nodi } },
    data: { geometry: { [geomDati]: { polygons: [rings], polylines: [] } }, assets: {} },
    errors: [],
  };
}

module.exports = { documento, anelli, CELLA };

// ------------------------------------------------------- una SPEDIZIONE intera
//
// Le stanze di un episodio su una pagina sola. Non si accostano: restano
// distanziate di UNA casella, e dove i dati mettono la porta si aggiunge la
// casella che le unisce. Cosi' il contorno che ne esce ha i muri fra una stanza
// e l'altra e le soglie dove devono stare — la stessa pianta del gioco, letta
// dallo stesso grafo delle uscite.
const DELTA = { N: [0, -1], S: [0, 1], E: [1, 0], O: [-1, 0] };
const primoId = (raw) => String(raw).split(/\s+/)[0];

function spedizione(ep, { latoDi, sagomaDi, setLato }) {
  const fs = require('fs');
  const path = require('path');
  const ROOT = path.resolve(__dirname, '..', '..');
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'webapp', 'data', `${ep}.json`), 'utf8'));
  const tess = new Map(d.tessere.map((t) => [t.id, t]));
  const L = new Map(d.tessere.map((t) => [t.id, latoDi(t)]));

  // dove si posa ogni stanza, IN CASELLE, con una casella di stacco fra due
  const pos = new Map([[d.tessere[0].id, [0, 0]]]);
  const coda = [d.tessere[0].id];
  const archi = [];
  while (coda.length) {
    const i = coda.shift();
    const [x, y] = pos.get(i);
    for (const [dir, raw] of Object.entries(tess.get(i).exits || {})) {
      const dest = primoId(raw);
      if (!tess.has(dest)) continue;
      if (!pos.has(dest)) {
        const La = L.get(i), Lb = L.get(dest);
        pos.set(dest, dir === 'E' ? [x + La + 1, y] : dir === 'O' ? [x - Lb - 1, y]
          : dir === 'S' ? [x, y + La + 1] : [x, y - Lb - 1]);
        coda.push(dest);
      }
      archi.push([i, dir, dest]);
    }
  }

  // le caselle di tutte le stanze, gia' spostate al loro posto sulla pagina
  const celle = [];
  const dentro = new Set();
  for (const t of d.tessere) {
    if (!pos.has(t.id)) continue;
    const l = L.get(t.id);
    setLato(l);
    // la porta al centro del lato: qui non si rifa' la scelta di pickDoorIndex,
    // si prende la casella centrale. Per una prova di forma basta; per fare sul
    // serio va passato l'indice vero, o le soglie non combaciano coi dati.
    const mezzo = Math.floor((l - 1) / 2);
    const porte = {};
    for (const dir of Object.keys(t.exits || {})) {
      porte[dir] = dir === 'N' ? [mezzo, 0] : dir === 'S' ? [mezzo, l - 1]
        : dir === 'O' ? [0, mezzo] : [l - 1, mezzo];
    }
    const sag = sagomaDi(t, porte, []);
    const [ox, oy] = pos.get(t.id);
    for (const [cx, cy] of sag.celle) {
      const k = `${ox + cx},${oy + cy}`;
      if (!dentro.has(k)) { dentro.add(k); celle.push([ox + cx, oy + cy]); }
    }
  }

  // e le soglie: una casella che unisce le due stanze, dove sta la porta
  for (const [a, dir, b] of archi) {
    if (!pos.has(a) || !pos.has(b)) continue;
    const [ax, ay] = pos.get(a); const La = L.get(a);
    const mezzoA = Math.floor((La - 1) / 2);
    const p = dir === 'E' ? [ax + La, ay + mezzoA] : dir === 'O' ? [ax - 1, ay + mezzoA]
      : dir === 'S' ? [ax + mezzoA, ay + La] : [ax + mezzoA, ay - 1];
    const k = p.join(',');
    if (!dentro.has(k)) { dentro.add(k); celle.push(p); }
  }

  // le coordinate possono essere negative: si trasla tutto in positivo
  const minX = Math.min(...celle.map((c) => c[0]));
  const minY = Math.min(...celle.map((c) => c[1]));
  return {
    titolo: d.titolo || ep,
    celle: celle.map(([x, y]) => [x - minX, y - minY]),
    stanze: d.tessere.filter((t) => pos.has(t.id)).length,
  };
}

module.exports.spedizione = spedizione;


// -------------------------------------------------------------- il collaudo
if (require.main === module) {
  const assert = require('assert');
  const quad = (n) => {
    const c = [];
    for (let r = 0; r < n; r++) for (let x = 0; x < n; x++) c.push([x, r]);
    return c;
  };

  // un quadrato pieno e' UN anello di quattro angoli (piu' il punto di chiusura)
  let r = anelli(quad(4));
  assert.strictEqual(r.length, 1, `il quadrato da' ${r.length} anelli`);
  assert.strictEqual(r[0].length, 5, `il quadrato ha ${r[0].length - 1} vertici invece di 4`);

  // UN ANELLO CON IL BUCO da' DUE anelli: e' il ballatoio, e non e' un caso a
  // parte — viene fuori dalla stessa regola
  const ciambella = quad(6).filter(([x, y]) => !(x > 1 && x < 4 && y > 1 && y < 4));
  r = anelli(ciambella);
  assert.strictEqual(r.length, 2, `la ciambella da' ${r.length} anelli`);
  // il buco gira al contrario del bordo: e' cosi' che un poligono dice «qui non c'e'»
  assert.ok(area(r[0]) * area(r[1]) < 0, 'il buco gira nello stesso verso del bordo');

  // una L: sei vertici, non undici. Il semplificatore serve a questo.
  const elle = quad(6).filter(([x, y]) => !(x >= 3 && y >= 3));
  r = anelli(elle);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].length, 7, `la L ha ${r[0].length - 1} vertici invece di 6`);

  // due stanze staccate danno due anelli distinti
  r = anelli([[0, 0], [1, 0], [4, 0], [5, 0]]);
  assert.strictEqual(r.length, 2);

  // IL VERTICE PIZZICATO: due caselle che si toccano solo per l'angolo. Sono due
  // anelli, non uno — e tenendo un lato solo per vertice si saldavano, con una
  // diagonale che tagliava la stanza. Il quadrato e la ciambella non hanno
  // vertici cosi', ed e' per questo che il banco restava verde col guasto dentro.
  r = anelli([[0, 0], [1, 1]]);
  assert.strictEqual(r.length, 2, `il vertice pizzicato da' ${r.length} anelli invece di 2`);
  for (const an of r) {
    assert.strictEqual(an.length, 5, `un quadratino ha ${an.length - 1} vertici`);
  }

  // e il file esce uguale due volte di fila
  const d1 = JSON.stringify(documento({ id: 'T2', nome: 'La Cisterna' }, ciambella));
  const d2 = JSON.stringify(documento({ id: 'T2', nome: 'La Cisterna' }, ciambella));
  assert.strictEqual(d1, d2, 'due esportazioni della stessa tessera sono diverse');

  console.log('contorni: quadrato, ciambella col buco, L, stanze staccate, vertice pizzicato — tutti giusti');
  console.log(`il file di prova pesa ${d1.length} caratteri`);
}
