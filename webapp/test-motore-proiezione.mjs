// LA PROIEZIONE: cosa vede chi siede a questo posto.
//
// Questo test è fatto di ASSERT NEGATIVI — si prova che qualcosa NON passa — e
// gira su tutti e ventuno gli episodi, perché un segreto che sfugge su uno solo
// è comunque un segreto che sfugge.
//
// È la barriera gemella di `src/test_oggetto_righe.py`, quella che tiene la
// soluzione fuori dai testi letti ad alta voce. Come quella, va estesa a ogni
// episodio nuovo — ma qui l'estensione è automatica: si legge la cartella.
//
// node webapp/test-motore-proiezione.mjs
import { readFileSync, readdirSync } from 'fs';
import { vista, datiPerPosto, statoPerPosto, cercaSegreti } from './public/motore/proiezione.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EPISODI = readdirSync('webapp/data')
  .filter((f) => /^(ep\d+|preludio)\.json$/.test(f))
  .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(`webapp/data/${f}`, 'utf8'))]);

const ELENA = COMUNE.eroi[0].nome;
const ARBITRO = { ruolo: 'arbitro' };
const GIOCATORE = { ruolo: 'giocatore', eroe: ELENA };

function partita(ep, over = {}) {
  const t0 = ep.tessere[0].id;
  return {
    v: 1, episodio: ep.id, modo: 'digitale', party: [ELENA], fase: 'spedizione',
    indagine: { ora: 20, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
                risposte: ['', '', '', ''] },
    vantaggi: { tier: 'preparati' }, rng: { seme: 1, passo: 0 },
    spedizione: {
      round: 2, canto: 0, fase: 'eroi', esito: null,
      rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos: { [ELENA]: { t: t0, x: 1, y: 1 } }, vite: { [ELENA]: 6 },
      azioni: {}, storditi: {}, eroiFatti: [], scortati: [],
      mazzo: { pool: ['a', 'b', 'c'], ordine: [2, 0, 1], indice: 1, scarti: [] },
      insidie: {}, uscita: null, uscitaTentati: [],
      ...over,
    },
  };
}

// ============================================ l'INDAGINE IN CORSO
// Il caso che mancava, ed e' quello che si gioca davvero: serata aperta, il
// gruppo ha gia' battuto qualche porta, e uno guarda dal telefono. Fin qui
// `vistaIndagine` non riceveva nemmeno il posto e mostrava a tutti la
// scrivania di chi arbitra — chiavi delle porte comprese.
//
// Si semina il caso PEGGIORE: un luogo visitato (cosi' la potatura deve
// distinguere, non cancellare tutto) e uno aperto sotto gli occhi del gruppo.
{
  let controllati = 0;
  for (const [id, ep] of EPISODI) {
    const primo = (ep.luoghi || [])[0];
    if (!primo) continue;
    const s = partita(ep);
    s.fase = 'indagine';
    s.indagine = { ...s.indagine, chiusa: false, ora: 21, visitati: [primo.n],
                   luogoAperto: primo.n, note: 'la chiave non torna',
                   risposte: ['il liutaio', '', '', ''], risposteEsatte: [true, false, false, false] };
    const dati = { ep, comune: COMUNE, carte: CARTE };
    const g = vista(s, dati, GIOCATORE);

    // IL SETACCIO SI PASSA A PORTE CHIUSE, e non e' una scorciatoia: entrare in
    // un luogo E' il modo in cui si impara una risposta, e quel che il gruppo
    // ha sentito leggere ad alta voce deve arrivare a tutti. Col luogo aperto
    // il setaccio suonerebbe sul funzionamento del gioco (visto sull'Ep.20:
    // «La via delle tre acque» e' insieme la risposta e l'indizio del rifugio).
    // Quel che si prova qui e' che a serata appena cominciata non trapeli
    // niente; la forma della potatura la provano i controlli sotto.
    const s0 = partita(ep);
    s0.fase = 'indagine';
    s0.indagine = { ...s0.indagine, chiusa: false, ora: 18, visitati: [], luogoAperto: null };
    const trovati = cercaSegreti(vista(s0, dati, GIOCATORE), ep);
    ok(trovati.length === 0, `${id}: a indagine appena aperta trapela qualcosa — ${trovati.join(', ')}`);

    // le chiavi delle porte NON battute: sono la deduzione, e dirle e' dire
    // la soluzione un pezzo alla volta
    const chiusi = (g.dati.ep.luoghi || []).filter((l) => l.n !== primo.n);
    ok(chiusi.every((l) => l.chiave === undefined),
       `${id}: le chiavi dei luoghi non visitati restano di chi arbitra`);
    ok(chiusi.every((l) => l.indizi === undefined && l.approfondimenti === undefined),
       `${id}: e nemmeno gli indizi o gli Approfondimenti di quelle porte`);
    // il luogo dove il gruppo E' ENTRATO invece si vede tutto: l'hanno sentito
    // leggere ad alta voce, e nasconderlo sarebbe una bugia
    const dentro = (g.dati.ep.luoghi || []).find((l) => l.n === primo.n);
    ok(dentro && (primo.indizi === undefined || dentro.indizi !== undefined),
       `${id}: il luogo visitato si vede per intero`);
    // la verifica delle risposte no: le risposte che il gruppo ha scritto
    // restano, sapere QUALI sono giuste e' la busta
    ok(g.stato.indagine.risposteEsatte === undefined,
       `${id}: dal telefono non si sa quali risposte sono giuste`);

    // LE DOMANDE SI', LE RISPOSTE NO. Da quando il telefono e' il Taccuino, chi
    // gioca deve poter leggere su cosa sta ragionando il gruppo; la busta
    // resta di chi arbitra.
    const dom = g.dati.ep.domande || [];
    ok(dom.length === (ep.soluzione.domande || []).length,
       `${id}: le Domande arrivano al telefono (${dom.length}/${(ep.soluzione.domande || []).length})`);
    ok(dom.every((d) => d.q && d.risposta === undefined && d.esatta === undefined),
       `${id}: ma senza le risposte, che sono la busta`);
    ok(g.stato.indagine.ora === 21 && (g.stato.indagine.visitati || []).length === 1,
       `${id}: l'orologio e le porte gia' battute invece si vedono`);

    // QUEL CHE IL GRUPPO HA GIA' SENTITO deve arrivare: e' stato letto ad alta
    // voce, e nasconderlo a chi era nella stanza non protegge niente. Qui
    // `approfondimentiLetti` e' una lista di OGGETTI, e confrontarli come
    // stringhe li rendeva tutti «[object Object]»: la sezione restava vuota per
    // sempre, senza un errore.
    const app0 = ((ep.luoghi || [])[0] || {}).approfondimenti || [];
    if (app0.length && (CARTE.approfondimenti_carte[id] || []).length) {
      const s2 = partita(ep);
      s2.fase = 'indagine';
      s2.indagine = { ...s2.indagine, chiusa: false, visitati: [primo.n],
                      approfondimentiLetti: [{ n: primo.n, tipo: app0[0].tipo,
                                               soggetto: app0[0].soggetto }] };
      const gl = vista(s2, dati, GIOCATORE);
      const arrivate = (gl.dati.carte.approfondimenti_carte[id] || [])
        .filter((c) => String(c.title).includes(app0[0].soggetto));
      const esiste = (CARTE.approfondimenti_carte[id] || [])
        .some((c) => String(c.title).includes(app0[0].soggetto));
      ok(!esiste || arrivate.length === 1,
         `${id}: la carta di un Approfondimento GIA' LETTO arriva al telefono («${app0[0].soggetto}»)`);
      // e quelle non lette restano di la'
      ok((gl.dati.carte.approfondimenti_carte[id] || []).length <= 1,
         `${id}: e solo quella, non tutto il mazzo degli Approfondimenti`);
    }
    controllati++;
  }
  ok(controllati === EPISODI.length, `indagine in corso setacciata su tutti (${controllati}/${EPISODI.length})`);
}

// ============================================================ i segreti
// Su TUTTI gli episodi: quel che arriva al giocatore non contiene la busta.
{
  let controllati = 0;
  for (const [id, ep] of EPISODI) {
    const s = partita(ep);
    const dati = { ep, comune: COMUNE, carte: CARTE };

    const vistaG = vista(s, dati, GIOCATORE);
    const trovati = cercaSegreti(vistaG, ep);
    ok(trovati.length === 0, `${id}: al giocatore arrivano segreti — ${trovati.join(', ')}`);

    ok(vistaG.dati.ep.soluzione === undefined, `${id}: la soluzione non parte`);
    // L'epilogo, il Frammento e il Bivio sono la soluzione in prosa: a meta'
    // serata non partono, e a serata FINITA partono — quello e' il momento in
    // cui sono la ricompensa, e chi ha giocato dal telefono deve leggerli sul
    // suo schermo invece che sentirseli riassumere.
    ok(vistaG.dati.ep.epilogo === undefined, `${id}: l'epilogo non parte a partita aperta`);
    ok(vistaG.dati.ep.frammento === undefined, `${id}: il Frammento non parte a partita aperta`);
    ok(vistaG.dati.ep.bivio === undefined, `${id}: il Bivio non parte a partita aperta`);
    const finita = vista(partita(ep, { esito: 'vittoria' }), dati, GIOCATORE);
    ok(!ep.epilogo || finita.dati.ep.epilogo, `${id}: a serata finita l'epilogo arriva anche al telefono`);
    ok(!ep.bivio || finita.dati.ep.bivio, `${id}: e il Bivio, che si decide insieme`);
    controllati++;

    // …e all'arbitro invece arriva tutto: la proiezione non deve mutilare CHI
    // il gioco lo conduce
    const vistaA = vista(s, dati, ARBITRO);
    ok(vistaA.dati.ep.soluzione, `${id}: l'arbitro la soluzione ce l'ha`);
    ok(vistaA.dati.ep === ep, `${id}: e i dati sono gli stessi, non una copia potata`);
  }
  ok(controllati === EPISODI.length, `controllati tutti gli episodi (${controllati}/${EPISODI.length})`);
}

// ============================================================ i luoghi
{
  const [, ep] = EPISODI.find(([id]) => id === 'ep1');
  const dati = { ep, comune: COMUNE, carte: CARTE };
  const conChiave = (ep.luoghi || []).find((l) => l.chiave);
  ok(conChiave, 'l\'Ep.1 ha un luogo con la chiave alla porta');

  // non visitato: nome sulla mappa e basta
  {
    const g = datiPerPosto(dati, partita(ep), GIOCATORE);
    const l = g.ep.luoghi.find((x) => x.n === conChiave.n);
    ok(l.nome === conChiave.nome, 'il nome del luogo si vede (è sulla mappa)');
    ok(l.chiave === undefined, 'ma la parola d\'ordine no: si deve dedurre');
    ok(l.testo === undefined, 'né il testo, che si sente leggere entrando');
    ok(l.approfondimenti === undefined, 'né cosa ci si può approfondire');
    ok(l.indizi === undefined, 'né gli indizi');
  }

  // visitato: tutto
  {
    const s = partita(ep);
    s.indagine.visitati = [conChiave.n];
    const g = datiPerPosto(dati, s, GIOCATORE);
    const l = g.ep.luoghi.find((x) => x.n === conChiave.n);
    ok(l.testo !== undefined, 'una volta entrati, il testo c\'è');
    ok(l.approfondimenti !== undefined, 'e gli Approfondimenti pure');
  }
}

// ============================================================ le tessere
{
  const [, ep] = EPISODI.find(([id]) => id === 'ep1');
  const dati = { ep, comune: COMUNE, carte: CARTE };
  const t0 = ep.tessere[0].id;
  const coperta = ep.tessere[ep.tessere.length - 1];
  const g = datiPerPosto(dati, partita(ep), GIOCATORE);

  const vista0 = g.ep.tessere.find((t) => t.id === t0);
  const vistaX = g.ep.tessere.find((t) => t.id === coperta.id);

  ok(vista0.testo !== undefined || !ep.tessere[0].testo, 'la tessera rivelata porta il suo testo');
  ok(vistaX.testo === undefined, 'quella coperta no: si scopre entrandoci');
  ok(vistaX.cerca === undefined, 'né cosa ci si trova cercando');
  ok(vistaX.exits !== undefined, 'ma le uscite sì: la forma della mappa si vede');

  // le note d'arbitro non escono MAI, nemmeno dalle tessere rivelate
  const conNota = ep.tessere.find((t) => t.arbitro);
  if (conNota) {
    const s = partita(ep, { rivelate: ep.tessere.map((t) => t.id) });
    const tutte = datiPerPosto(dati, s, GIOCATORE);
    const v = tutte.ep.tessere.find((t) => t.id === conNota.id);
    ok(v.arbitro === undefined, 'la nota di regia non esce nemmeno da una tessera rivelata');
    ok(v.testo !== undefined, 'ma il testo della stanza aperta sì');
  }
}

// ============================================================ lo stato
{
  const [, ep] = EPISODI.find(([id]) => id === 'ep1');

  // il mazzo: quante ne restano, non quali
  {
    const g = statoPerPosto(partita(ep), GIOCATORE);
    ok(g.spedizione.mazzo.ordine === undefined, 'l\'ordine del mazzo non parte');
    ok(g.spedizione.mazzo.pool === undefined, 'né quali carte contiene');
    ok(g.spedizione.mazzo.restano === 2, `ma quante ne restano sì (viste ${g.spedizione.mazzo.restano})`);
    const a = statoPerPosto(partita(ep), ARBITRO);
    ok(a.spedizione.mazzo.ordine, 'l\'arbitro l\'ordine ce l\'ha: è lui che pesca');
  }

  // l'uscita segreta: la stanza sì, l'arredo no
  {
    const chiusa = statoPerPosto(partita(ep, {
      uscita: { aperta: false, tile: 'T6', cella: [1, 2] } }), GIOCATORE);
    ok(chiusa.spedizione.uscita === null, 'finché non è aperta, l\'uscita segreta non si vede');

    const aperta = statoPerPosto(partita(ep, {
      uscita: { aperta: true, tile: 'T6', cella: [1, 2] } }), GIOCATORE);
    ok(aperta.spedizione.uscita, 'aperta, invece, sì: ci si deve portare il prigioniero');

    // gli arredi già tentati restano pubblici: il gruppo li ha frugati insieme
    const tentati = statoPerPosto(partita(ep, { uscitaTentati: ['0,0'] }), GIOCATORE);
    ok(tentati.spedizione.uscitaTentati.length === 1, 'gli arredi già provati si sanno');
  }

  // quel che è pubblico al tavolo resta pubblico
  {
    const g = statoPerPosto(partita(ep), GIOCATORE);
    ok(g.spedizione.vite[ELENA] === 6, 'la salute dei compagni si vede: è sulla scheda');
    ok(g.spedizione.eroiPos[ELENA], 'e dove sono le pedine, che stanno sul tabellone');
    ok(g.spedizione.log, 'e il diario di quel che è successo');
    ok(g.posto && g.posto.eroe === ELENA, 'e ognuno sa a che posto siede');
  }
}

// ============================================================ la non-vacuità
// Se la proiezione smettesse di potare, questo test deve accorgersene. Lo si
// prova qui, invece di fidarsi: si passa alla ricerca dei segreti l'episodio
// NUDO, che i segreti ce li ha di sicuro.
{
  const [, ep] = EPISODI.find(([id]) => id === 'ep1');
  const trovati = cercaSegreti({ ep }, ep);
  ok(trovati.length > 0,
     'il setaccio riconosce un episodio non potato: se qui non trova niente, non trova niente mai');
}

console.log(ko === 0
  ? `TUTTO OK (proiezione, ${EPISODI.length} episodi setacciati)`
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
