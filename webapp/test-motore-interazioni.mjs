// INTERAGIRE: cinque cose diverse sotto un bottone solo.
//
// Aprire una grata, liberare un prigioniero, frugare sotto un arredo per
// l'uscita segreta, portare avanti il compito d'episodio, prendere un nemico
// gia' a terra. Erano 97 righe con tre `await tiraProva` e tre `flash` dentro.
//
// Si prova soprattutto quel che NON deve spendere l'azione: i due compiti
// bloccati (il bersaglio in un'altra stanza, il bersaglio ancora in forze) sono
// regole stampate, non errori, e devono rifiutare senza consumare il turno.
//
// node webapp/test-motore-interazioni.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { interazioneDisponibile, provaInterazione } from './public/motore/interazioni.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const SGH = COMUNE.nemici[0].nome;

// Tessere costruite a mano: una grata da aprire (T1→T2), una cella e un paio di
// arredi in T2 sotto cui cercare l'uscita.
const TESS = [
  { id: 'T1', nome: 'Ingresso', exits: { N: 'T2 (grata: apri)' }, arredi: [] },
  { id: 'T2', nome: 'Fondo', exits: { S: 'T1' },
    arredi: [[0, 0, 'botte'], [3, 3, 'cella'], [2, 2, 'altare']] },
];

function mondo(ep, over = {}) {
  const s = {
    v: 1, episodio: 'ep1', modo: 'digitale', party: [ELENA], fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' }, rng: { seme: 3, passo: 0 },
    spedizione: {
      round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: ['T1', 'T2'], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
      eroiPos: { [ELENA]: { t: 'T2', x: 1, y: 1 } }, vite: { [ELENA]: 6 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
      ...over,
    },
  };
  return [s, { ep, comune: COMUNE, carte: CARTE }];
}
const G = (s, dati) => ({ ...dati, sp: s.spedizione, partita: s, _layout: null });

// --- GRATA: si apre stando sulla cella-porta, e resta aperta
{
  const ep = { tessere: TESS, cartella: 'X' };
  // la cella-porta N di T1 la calcola il motore: ci si mette l'eroe sopra
  const [s0, dati] = mondo(ep);
  const { portaCella } = await import('./public/motore/griglia.js');
  const pc = portaCella(TESS[0], 'N');
  const [s, d] = mondo(ep, { eroiPos: { [ELENA]: { t: 'T1', x: pc[0], y: pc[1] } } });
  const disp = interazioneDisponibile(G(s, d), ELENA);
  ok(disp && disp.tipo === 'grata', `sulla cella-porta si offre la grata (visto ${disp && disp.tipo})`);
  ok(!('label' in disp), 'e la regola non porta piu\' la didascalia del bottone');

  const out = applica(s, { tipo: 'interagisci', eroe: ELENA }, d);
  ok(!out.rifiuto, `aprire la grata e' ammesso (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.stato.spedizione.grate.includes('T1-N'), 'e la grata risulta aperta');
  ok((out.stato.spedizione.azioni[ELENA] || []).includes('interagire'), 'e costa l\'azione');
  ok(provaInterazione(G(s, d), ELENA) === null, 'aprire una grata non chiede dadi');
}

// --- COMPITO BLOCCATO: rifiuta SENZA spendere l'azione (sono regole stampate)
{
  const ep = { tessere: TESS, cartella: 'X',
               compiti: [{ id: 'gatto', nemico: 'IL PRIMO GATTO', quante: 1, tile: 'T1',
                           etichetta: 'aggancia il Gatto' }] };
  const [s, d] = mondo(ep, {
    nemici: [{ nome: 'IL PRIMO GATTO', num: 1, pos: { t: 'T2', x: 1, y: 2 }, ferite: 0, max: 3 }],
  });
  const disp = interazioneDisponibile(G(s, d), ELENA);
  ok(disp && disp.bloccato === 'fuori-posto', `il compito fuori stanza risulta bloccato (visto ${disp && disp.bloccato})`);
  const out = applica(s, { tipo: 'interagisci', eroe: ELENA }, d);
  ok(out.rifiuto && /vi aspetta in T1/i.test(out.rifiuto.motivo),
     `il rifiuto dice dove va fatto (visto «${out.rifiuto && out.rifiuto.motivo}»)`);
  ok(!(out.stato.spedizione.azioni[ELENA] || []).length,
     'e NON spende l\'azione: e\' una regola, non un errore');
}

{
  const ep = { tessere: TESS, cartella: 'X',
               compiti: [{ id: 'capo', nemico: 'IL CAPOSQUADRA', quante: 1, ridotto: true,
                           etichetta: 'prendi il Caposquadra' }] };
  const [s, d] = mondo(ep, {
    nemici: [{ nome: 'IL CAPOSQUADRA', num: 1, pos: { t: 'T2', x: 1, y: 2 }, ferite: 0, max: 3 }],
  });
  const disp = interazioneDisponibile(G(s, d), ELENA);
  ok(disp && disp.bloccato === 'in-forze', 'il bersaglio in forze risulta bloccato');
  const out = applica(s, { tipo: 'interagisci', eroe: ELENA }, d);
  ok(out.rifiuto && /Ferite/i.test(out.rifiuto.motivo), 'il rifiuto dice a quante Ferite tratta');
  ok(!(out.stato.spedizione.azioni[ELENA] || []).length, 'e non spende l\'azione');

  // ridotto abbastanza: adesso si prende, e il nemico esce dal campo
  const [s2, d2] = mondo(ep, {
    nemici: [{ nome: 'IL CAPOSQUADRA', num: 1, pos: { t: 'T2', x: 1, y: 2 }, ferite: 2, max: 3 }],
  });
  const out2 = applica(s2, { tipo: 'interagisci', eroe: ELENA }, d2);
  ok(!out2.rifiuto, `ridotto all'ultima Ferita si aggancia (${out2.rifiuto && out2.rifiuto.motivo})`);
  ok(out2.stato.spedizione.nemici.length === 0,
     'e il catturato esce dal tavolo: e\' preso, non morto');
  ok(out2.stato.spedizione.compiti.capo === 1, 'il compito avanza');
}

// --- COMPITO CON PROVA: fallita costa l'azione e non avanza
{
  const ep = { tessere: TESS, cartella: 'X',
               compiti: [{ id: 'canne', quante: 3, tile: 'T2', etichetta: 'sfregia le canne',
                           prova: { attr: 'vigore', diff: 'Difficile' }, fallita: 'la lama scivola' }] };
  const [s, d] = mondo(ep);
  const p = provaInterazione(G(s, d), ELENA);
  ok(p && p.soglia === COMUNE.regole.diff.Difficile, 'la prova del compito e\' dichiarata con la sua soglia');

  const male = applica(s, { tipo: 'interagisci', eroe: ELENA, tiri: [[1, 1]] }, d);
  ok(!male.rifiuto, 'una prova fallita non e\' un rifiuto: e\' un esito');
  ok(!(male.stato.spedizione.compiti.canne > 0), 'il compito non avanza');
  ok((male.stato.spedizione.azioni[ELENA] || []).includes('interagire'), 'ma l\'azione e\' spesa');

  const bene = applica(s, { tipo: 'interagisci', eroe: ELENA, tiri: [[6, 6]] }, d);
  ok(bene.stato.spedizione.compiti.canne === 1, 'con la prova riuscita il compito avanza');
}

// --- USCITA SEGRETA: l'arredo giusto apre, quello sbagliato costa l'azione e
// non si ritenta piu'
{
  const ep = { tessere: TESS, cartella: 'X',
               scortato: [{ nome: 'RUGGERO', tile: 'T2', meta: 'T1',
                            uscita: { tile: 'T2', arredo: [2, 2], diff: 'Media',
                                      testo: 'Si apre un chiusino.' } }] };
  const libero = { liberato: true, pos: { t: 'T2', x: 0, y: 1 } };

  const [s, d] = mondo(ep, { scortati: [libero], eroiPos: { [ELENA]: { t: 'T2', x: 2, y: 1 } } });
  const disp = interazioneDisponibile(G(s, d), ELENA);
  ok(disp && disp.tipo === 'uscita', `accanto a un arredo si offre l'uscita (visto ${disp && disp.tipo})`);

  const male = applica(s, { tipo: 'interagisci', eroe: ELENA, tiri: [[1, 1]] }, d);
  ok(!male.stato.spedizione.uscita, 'prova fallita: l\'uscita non si apre');
  ok((male.stato.spedizione.azioni[ELENA] || []).includes('interagire'), 'ma l\'azione e\' spesa');

  const bene = applica(s, { tipo: 'interagisci', eroe: ELENA, tiri: [[6, 6]] }, d);
  ok(bene.stato.spedizione.uscita && bene.stato.spedizione.uscita.aperta,
     'l\'arredo GIUSTO (2,2) apre il passaggio');

  // l'arredo sbagliato: eroe accanto alla botte (0,0)
  const [s3, d3] = mondo(ep, { scortati: [libero], eroiPos: { [ELENA]: { t: 'T2', x: 0, y: 1 } } });
  const sbagliato = applica(s3, { tipo: 'interagisci', eroe: ELENA, tiri: [[6, 6]] }, d3);
  ok(!sbagliato.stato.spedizione.uscita, 'sotto l\'arredo sbagliato non c\'e\' niente');
  ok((sbagliato.stato.spedizione.uscitaTentati || []).length === 1,
     'e quell\'arredo non si ritenta piu\'');
  ok((sbagliato.stato.spedizione.azioni[ELENA] || []).includes('interagire'),
     'e l\'azione e\' comunque spesa: il fascicolo lo dice');
}

// --- LIBERARE: la chiave salta la prova; senza chiave si tira
{
  const ep = { tessere: TESS, cartella: 'X',
               scortato: [{ nome: 'RUGGERO', tile: 'T2', meta: 'T1', chiave: 'Chiave di Ferro',
                            prova: { attr: 'acume', diff: 'Media', fallita: 'la serratura resiste' } }] };
  const prigioniero = { liberato: false, pos: null };

  const [conChiave, d1] = mondo(ep, { scortati: [prigioniero] });
  conChiave.indagine.oggetti = ['La Chiave di Ferro'];
  ok(provaInterazione(G(conChiave, d1), ELENA) === null, 'con la chiave non si tira nessun dado');
  const out1 = applica(conChiave, { tipo: 'interagisci', eroe: ELENA }, d1);
  ok(out1.stato.spedizione.scortati[0].liberato, 'e il prigioniero e\' libero');

  const [senza, d2] = mondo(ep, { scortati: [{ liberato: false, pos: null }] });
  ok(provaInterazione(G(senza, d2), ELENA), 'senza chiave la prova c\'e\'');
  const male = applica(senza, { tipo: 'interagisci', eroe: ELENA, tiri: [[1, 1]] }, d2);
  ok(!male.stato.spedizione.scortati[0].liberato, 'prova fallita: resta dentro');
  const bene = applica(senza, { tipo: 'interagisci', eroe: ELENA, tiri: [[6, 6]] }, d2);
  ok(bene.stato.spedizione.scortati[0].liberato, 'prova riuscita: esce');
  ok(bene.stato.spedizione.scortati[0].pos, 'e finisce su una casella del tabellone');
}

// --- DUE PRIGIONIERI nella stessa fossa: un'azione li libera entrambi (Ep.4)
{
  const ep = { tessere: TESS, cartella: 'X',
               scortato: [{ nome: 'GASPARE', tile: 'T2', meta: 'T1', cella: 'cella' },
                          { nome: 'ROCCO', tile: 'T2', meta: 'T1', cella: 'cella' }] };
  const [s, d] = mondo(ep, {
    scortati: [{ liberato: false, pos: null }, { liberato: false, pos: null }],
    eroiPos: { [ELENA]: { t: 'T2', x: 3, y: 2 } },     // accanto alla cella (3,3)
  });
  const out = applica(s, { tipo: 'interagisci', eroe: ELENA }, d);
  ok(!out.rifiuto, `liberare e' ammesso (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.stato.spedizione.scortati.every((x) => x.liberato),
     'un\'azione libera ENTRAMBI i prigionieri della stessa fossa');
  ok(out.stato.spedizione.scortati[0].pos.t === 'T2'
     && out.stato.spedizione.scortati[1].pos.t === 'T2', 'e finiscono su caselle diverse');
  const a = out.stato.spedizione.scortati[0].pos, b = out.stato.spedizione.scortati[1].pos;
  ok(!(a.x === b.x && a.y === b.y), 'non impilati sulla stessa casella');
}

// --- USARE UN OGGETTO: il passivo si legge e NON spende l'azione
{
  const ep = { tessere: TESS, cartella: 'X', soluzione: { boss: 'IL CUSTODE' },
               oggetti: [{ nome: 'I Ramponi', effetto: 'Non scivoli sul ghiaccio.' }] };
  const [s, d] = mondo(ep);
  s.indagine.oggetti = ['I Ramponi'];
  const out = applica(s, { tipo: 'oggetto', eroe: ELENA, quale: 'I Ramponi' }, d);
  ok(!out.rifiuto, `usare un passivo e' ammesso (${out.rifiuto && out.rifiuto.motivo})`);
  ok(!(out.stato.spedizione.azioni[ELENA] || []).length,
     'un oggetto passivo si legge e basta: nessuna azione spesa');
  ok(out.eventi.some((e) => e.tipo === 'oggetto-letto'), 'e l\'effetto torna come evento');

  ok(applica(s, { tipo: 'oggetto', eroe: ELENA, quale: 'Un Oggetto Inventato' }, d).rifiuto,
     'un oggetto che non si ha e\' rifiutato');
}

// --- IL DIAPASON: solo adiacenti al boss, e allora morde davvero
{
  const ep = { tessere: TESS, cartella: 'X', soluzione: { boss: 'IL CUSTODE' }, oggetti: [] };
  const [lontano, d1] = mondo(ep, {
    nemici: [{ nome: 'IL CUSTODE', num: 1, pos: { t: 'T2', x: 3, y: 3 }, ferite: 0, max: 6 }],
  });
  lontano.indagine.oggetti = ['Il Diapason d’Argento'];
  const no = applica(lontano, { tipo: 'oggetto', eroe: ELENA, quale: 'Il Diapason d’Argento' }, d1);
  ok(no.rifiuto && /adiacente/i.test(no.rifiuto.motivo), 'il diapason vuole l\'adiacenza');

  const [vicino, d2] = mondo(ep, {
    nemici: [{ nome: 'IL CUSTODE', num: 1, pos: { t: 'T2', x: 1, y: 2 }, ferite: 0, max: 6 }],
  });
  vicino.indagine.oggetti = ['Il Diapason d’Argento'];
  const si = applica(vicino, { tipo: 'oggetto', eroe: ELENA, quale: 'Il Diapason d’Argento' }, d2);
  ok(!si.rifiuto, `adiacente funziona (${si.rifiuto && si.rifiuto.motivo})`);
  ok(si.stato.spedizione.nemici[0].difMod === 5, 'il Custode scende a Difesa 5');
  ok(si.stato.spedizione.nemici[0].flash === true, 'e salta la prossima attivazione');
  ok((si.stato.spedizione.azioni[ELENA] || []).includes('oggetto'), 'questo si\' che costa l\'azione');
}

console.log(ko === 0 ? 'TUTTO OK (interazioni)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
