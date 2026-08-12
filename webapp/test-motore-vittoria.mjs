// Come finisce una serata: chi vince, chi perde, chi arriva secondo.
//
// Qui non c'e' differenziale, e per una ragione: la firma cambia apposta.
// Prima `controllaVittoria` restituiva un booleano e chiudeva da se' con
// `salvaP(); epilogo()`, cioe' la regola sapeva che esiste uno schermo. Ora
// dice `{ esito, riga }` e chi ha lo schermo decide cosa farne. Non c'e' niente
// da confrontare: c'e' da provare che i rami siano gli stessi.
//
// Sono le righe che decidono se una serata e' stata vinta, quindi si provano su
// stati costruiti a mano — un ramo per volta, incluso quello che nessun pilota
// raggiunge spesso.
//
// node webapp/test-motore-vittoria.mjs
import * as v from './public/motore/vittoria.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const TESS = [{ id: 'T1', nome: 'Ingresso', exits: { N: 'T2' }, arredi: [] },
              { id: 'T2', nome: 'Fondo', exits: { S: 'T1' }, arredi: [] }];
const ELENA = 'ELENA FOSCO', NINO = 'NINO MORA';

const G = (ep, sp, party = [ELENA]) => ({
  ep, comune: { regole: {} }, sp,
  partita: { party, indagine: { oggetti: [] } }, _layout: null,
});
const base = (o = {}) => ({
  rivelate: ['T1', 'T2'], nemici: [], compiti: {}, log: [], round: 5, esito: null,
  vite: { [ELENA]: 5 }, eroiPos: { [ELENA]: { t: 'T2', x: 0, y: 0 } },
  scortati: [], ...o,
});

// --- compito finito e tutti sulla tessera giusta: vittoria
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2', testo: 'Siete salvi.' },
               compiti: [{ id: 'x', quante: 1, tile: 'T2' }] };
  const out = v.controllaVittoria(G(ep, base({ compiti: { x: 1 } })));
  ok(out && out.esito === 'vittoria', `compito fatto in T2 = vittoria (visto ${out && out.esito})`);
  ok(out && out.riga === 'Siete salvi.', 'con il testo dichiarato dall\'episodio');
}

// --- il compito non basta se manca la meta
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  const sp = base({ compiti: { x: 1 }, eroiPos: { [ELENA]: { t: 'T1', x: 0, y: 0 } } });
  ok(!v.controllaVittoria(G(ep, sp)), 'obiettivo fatto ma nessuno alla meta: la partita continua');
}

// --- un compagno rimasto indietro tiene aperta la partita…
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  const sp = base({ compiti: { x: 1 }, vite: { [ELENA]: 5, [NINO]: 4 },
                    eroiPos: { [ELENA]: { t: 'T2', x: 0, y: 0 }, [NINO]: { t: 'T1', x: 0, y: 0 } } });
  ok(!v.controllaVittoria(G(ep, sp, [ELENA, NINO])), 'chi e\' rimasto indietro tiene aperta la partita');
}

// --- …ma uno a terra no: si contano i vivi
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  const sp = base({ compiti: { x: 1 }, vite: { [ELENA]: 5, [NINO]: 0 },
                    eroiPos: { [ELENA]: { t: 'T2', x: 0, y: 0 }, [NINO]: { t: 'T1', x: 0, y: 0 } } });
  ok(v.controllaVittoria(G(ep, sp, [ELENA, NINO])),
     'un compagno a terra in T1 non impedisce la vittoria: si guardano i vivi');
}

// --- il boss in piedi sbarra; a terra in attesa d'essere preso, no
{
  const ep = { tessere: TESS, vittoria: { boss: true }, soluzione: { boss: 'IL DORMIENTE' },
               compiti: [{ id: 'x', quante: 1 }] };
  const inPiedi = base({ compiti: { x: 1 },
    nemici: [{ nome: 'IL DORMIENTE', pos: { t: 'T2', x: 1, y: 1 } }] });
  ok(!v.controllaVittoria(G(ep, inPiedi)), 'col boss in piedi non si vince');

  const aTerra = base({ compiti: { x: 1 },
    nemici: [{ nome: 'IL DORMIENTE', pos: { t: 'T2', x: 1, y: 1 }, abbattuto: true }] });
  ok(v.controllaVittoria(G(ep, aTerra)), 'il boss a terra in attesa d\'essere preso non sbarra piu\'');
}

// --- i due modi di arrivare secondi
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }],
               rogo: { scala: [], testo_parziale: 'Anneriti.' } };
  const rogo = v.controllaVittoria(G(ep, base({ compiti: { x: 1 }, registriAnneriti: true })));
  ok(rogo.esito === 'parziale', 'i registri anneriti declassano a parziale');
  ok(rogo.riga === 'Anneriti.', 'col testo del rogo dichiarato dall\'episodio');

  const orol = v.controllaVittoria(G(ep, base({ compiti: { x: 1 }, declassato: 'Il decano se n\'è andato.' })));
  ok(orol.esito === 'parziale', 'l\'orologio superato declassa a parziale');
  ok(/decano/.test(orol.riga), 'e la riga dice perche\'');
}

// --- non si vince due volte, e senza compiti non si vince affatto
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  ok(!v.controllaVittoria(G(ep, base({ compiti: { x: 1 }, esito: 'vittoria' }))),
     'a partita gia\' chiusa controllaVittoria tace');
  const senza = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [] };
  ok(!v.controllaVittoria(G(senza, base())), 'un episodio senza compiti non si vince per compiti');
}

// --- la regola NON tocca lo stato: e' il chiamante che chiude la partita
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  const sp = base({ compiti: { x: 1 } });
  const prima = JSON.stringify(sp);
  v.controllaVittoria(G(ep, sp));
  ok(JSON.stringify(sp) === prima,
     'controllaVittoria non scrive esito ne\' log: dice soltanto com\'e\' finita');
}

// --- party-wipe
{
  const ep = { tessere: TESS };
  const out = v.chiudiFaseNemici(G(ep, base({ vite: { [ELENA]: 0, [NINO]: 0 } }), [ELENA, NINO]));
  ok(out && out.esito === 'sconfitta', 'tutti a terra = sconfitta');

  const vivo = v.chiudiFaseNemici(G(ep, base({ vite: { [ELENA]: 1, [NINO]: 0 } }), [ELENA, NINO]));
  ok(!vivo, 'con uno solo in piedi la partita continua');
}

// --- la scorta: l'uscita segreta
{
  const ep = { tessere: TESS, compiti: [],
               scortato: [{ nome: 'RUGGERO', meta: 'T1', vittoria: 'Ruggero è fuori.' }] };
  const sp = base({ uscita: { tile: 'T2', cella: [3, 3], aperta: true },
                    scortati: [{ liberato: true, pos: { t: 'T2', x: 0, y: 0 } }] });
  const out = v.esitoScorta(G(ep, sp), 0, { t: 'T2', x: 3, y: 3 });
  ok(out.esito === 'vittoria', `imboccare il condotto vince (visto ${out.esito})`);
  ok(sp.scortati[0].uscito === true && sp.scortati[0].pos === null,
     'e il PNG sparisce dal board, liberando il chiusino');
}

// --- due PNG: il primo che esce NON chiude la partita da solo (Ep.4)
{
  const ep = { tessere: TESS, compiti: [],
               scortato: [{ nome: 'GASPARE', meta: 'T1' }, { nome: 'ROCCO', meta: 'T1' }] };
  const sp = base({ uscita: { tile: 'T2', cella: [3, 3], aperta: true },
                    scortati: [{ liberato: true, pos: { t: 'T2', x: 0, y: 0 } },
                               { liberato: true, pos: { t: 'T2', x: 1, y: 0 } }] });
  const uno = v.esitoScorta(G(ep, sp), 0, { t: 'T2', x: 3, y: 3 });
  ok(!uno.esito, 'con due prigionieri il primo che esce non chiude la partita');
  const due = v.esitoScorta(G(ep, sp), 1, { t: 'T2', x: 3, y: 3 });
  ok(due.esito === 'vittoria', 'esce anche il secondo: adesso si vince');
}

// --- «QUI L'USCITA NON BASTA» (Ep.4): coi compiti aperti la fuga non vince
{
  const ep = { tessere: TESS, compiti: [{ id: 'pannelli', quante: 3, etichetta: 'i pannelli' }],
               scortato: [{ nome: 'GASPARE', meta: 'T1' }] };
  const sp = base({ compiti: { pannelli: 1 },
                    uscita: { tile: 'T2', cella: [3, 3], aperta: true },
                    scortati: [{ liberato: true, pos: { t: 'T2', x: 0, y: 0 } }] });
  const out = v.esitoScorta(G(ep, sp), 0, { t: 'T2', x: 3, y: 3 });
  ok(!out.esito, 'col compito aperto la scorta in salvo non chiude la serata');
  ok(out.righe.some((r) => /non e' finito|pannelli/i.test(r)), 'e lo dice');
  ok(v.scortaPuoVincere(G(ep, base({ compiti: { pannelli: 3 } }))),
     'finiti i pannelli, la scorta puo\' vincere');
}

// --- la scorta per la meta, senza uscita segreta
{
  const ep = { tessere: TESS, compiti: [], scortato: [{ nome: 'FAVA', meta: 'T1' }] };
  const sp = base({ scortati: [{ liberato: true, pos: { t: 'T2', x: 0, y: 0 } }] });
  const out = v.esitoScorta(G(ep, sp), 0, { t: 'T1', x: 1, y: 1 });
  ok(out.esito === 'vittoria', `riportato alla meta = vittoria (visto ${out.esito})`);
}

// --- l'eroe piu' avanzato (bersaglio di certe insidie)
{
  const ep = { tessere: TESS };
  const sp = base({ eroiPos: { [ELENA]: { t: 'T1', x: 0, y: 0 }, [NINO]: { t: 'T2', x: 0, y: 0 } },
                    vite: { [ELENA]: 5, [NINO]: 5 } });
  ok(v.eroePiuAvanzato(G(ep, sp, [ELENA, NINO]), [ELENA, NINO]) === NINO,
     'il piu' + '\'' + ' avanzato e\' chi sta sulla tessera piu\' lontana dall\'ingresso');
}

console.log(ko === 0 ? 'TUTTO OK (vittoria)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
