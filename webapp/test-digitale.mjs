// Self-check del motore multi-tessera della modalita' digitale (digitale.js).
// node webapp/test-digitale.mjs
import { _motore } from './public/js/digitale.js';
const { esploraMosse, camminoGlob, adiacGlob, portaCella, layout, nk, _setup,
        avanzaCancellazione, avanzaRitmo, avanzaPressione, controllaFiloPerso,
        avanzaOrologio } = _motore;

// `salvaP()` scrive su localStorage, che in node non esiste: qui la partita
// non va salvata, va solo ispezionata in memoria.
globalThis.localStorage = { setItem() {}, getItem() { return null; }, removeItem() {} };

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// tessere Ep.1 (exits/arredi 1:1 da ep1.json) per il grafo e il pathfinding
const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, start: 'S', arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5 (grata: apri)' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Candele', exits: { O: 'T2' }, arredi: [[0, 0, 'c'], [3, 0, 'c'], [0, 3, 'c'], [3, 3, 'c']] },
  { id: 'T4', nome: 'Ufficio', exits: { E: 'T2' }, arredi: [[1, 3, 's'], [3, 0, 'b']] },
  { id: 'T5', nome: 'Scala', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 1, 's'], [2, 1, 's'], [1, 2, 's'], [2, 2, 's']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T5' }, arredi: [[1, 2, 'a'], [2, 2, 'a'], [3, 3, 'cella']] },
];
const ep = { tessere: TESS, cartella: 'Episodio 1', obiettivo: '' };
const mkSp = (over) => ({ rivelate: ['T1'], grate: [], nemici: [], eroiPos: {}, ruggero: { liberato: false, pos: null }, ...over });

// --- layout: T2 a N di T1, T3 a E di T2, ecc.
_setup(ep, mkSp());
const L = layout();
ok(L.T1[0] === 0 && L.T1[1] === 0, 'T1 origine');
ok(L.T2[0] === 0 && L.T2[1] === 1, 'T2 a nord di T1');
ok(L.T3[0] === 1 && L.T3[1] === 1, 'T3 a est di T2');
ok(L.T4[0] === -1 && L.T4[1] === 1, 'T4 a ovest di T2');
ok(L.T5[1] === 2 && L.T6[1] === 3, 'T5, T6 salgono a nord');

// porta S di T1 = ingresso (1,0); porta N di T1 = (1,3)
ok(portaCella(TESS[0], 'S').join() === '1,0', 'ingresso T1 = (1,0)');
ok(portaCella(TESS[0], 'N').join() === '1,3', 'porta N T1 = (1,3)');

// --- reveal: dall'ingresso T1, con budget 4 la porta N raggiunge l'entrata di T2 (coperta)
_setup(ep, mkSp());
let info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 4, new Set());
const revT2 = Object.values(info).find((v) => v.reveal === 'T2');
ok(revT2 && revT2.node.t === 'T2', 'porta N di T1 offre il reveal di T2 (budget 4)');
// con budget 3 non ci si arriva (porta a 3 + attraversamento = 4)
info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 3, new Set());
ok(!Object.values(info).some((v) => v.reveal === 'T2'), 'budget 3 non basta a rivelare T2');

// --- con T2 rivelata, si cammina DENTRO T2 attraversando la porta
_setup(ep, mkSp({ rivelate: ['T1', 'T2'] }));
info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 5, new Set());
ok(Object.values(info).some((v) => v.node.t === 'T2' && !v.reveal), 'con T2 rivelata si entra in T2 a piedi');

// --- grata: la porta N di T2 non si attraversa finche' la grata e' chiusa
const nT2 = portaCella(TESS[1], 'N');
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T5'] }));
info = esploraMosse({ t: 'T2', x: nT2[0], y: nT2[1] }, 2, new Set());
ok(!Object.values(info).some((v) => v.node.t === 'T5'), 'grata chiusa: T5 irraggiungibile');
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T5'], grate: ['T2-N'] }));
info = esploraMosse({ t: 'T2', x: nT2[0], y: nT2[1] }, 2, new Set());
ok(Object.values(info).some((v) => v.node.t === 'T5'), 'grata aperta: si passa in T5');

// --- adiacenza attraverso la porta T1(N)<->T2(S)
_setup(ep, mkSp({ rivelate: ['T1', 'T2'] }));
ok(adiacGlob({ t: 'T1', x: 1, y: 3 }, { t: 'T2', x: 1, y: 0 }), 'adiac attraverso la porta T1/T2');
ok(!adiacGlob({ t: 'T1', x: 0, y: 0 }, { t: 'T2', x: 3, y: 3 }), 'non adiac tra celle lontane di tessere diverse');

// --- cammino multi-tessera T1 -> T3
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T3'] }));
const path = camminoGlob({ t: 'T1', x: 1, y: 0 }, { t: 'T3', x: 1, y: 1 }, new Set());
ok(path.length > 0 && path[path.length - 1].t === 'T3', 'cammino globale T1->T3 arriva in T3');
ok(!path.some((n) => TESS.find((t) => t.id === n.t).arredi.some(([x, y]) => x === n.x && y === n.y)), 'cammino non passa dagli arredi');

// --- la CANCELLAZIONE dell'Ep.15: il pool dei tell si svuota davvero
// Era la meccanica che da' il nome all'episodio e in digitale non esisteva:
// il pilota misurava una serata senza clessidra. Questo controllo fallisce se
// la clessidra torna a fermarsi.
{
  const ep15 = {
    tessere: TESS,
    cancellazione: { compito: 'tell', da_tessera: 'T4', per_round: 1,
                     finche_compito: 'capo', testo: 'Un tell sparisce.',
                     esaurito: 'Non trovano nulla da cancellare.' },
    compiti: [{ id: 'tell', quante: 4, tile: 'T2', etichetta: 'tell' },
              { id: 'capo', quante: 1, tile: 'T6', etichetta: 'capo' }],
  };
  const gioca = (sp) => { _setup(ep15, sp); return avanzaCancellazione(); };

  const primaDiT4 = { rivelate: ['T1', 'T2'], compiti: { tell: 3 }, round: 5 };
  ok(gioca(primaDiT4).length === 0 && primaDiT4.compiti.tell === 3,
     'prima che T4 sia rivelata non si cancella nulla');

  const inCorso = { rivelate: ['T1', 'T2', 'T4'], compiti: { tell: 3 }, round: 5 };
  ok(gioca(inCorso).length === 1 && inCorso.compiti.tell === 2,
     'da T4 gli Apparecchiatori cancellano un tell per round');

  const capoPreso = { rivelate: ['T1', 'T4'], compiti: { tell: 3, capo: 1 }, round: 6 };
  ok(gioca(capoPreso).length === 0 && capoPreso.compiti.tell === 3,
     'preso il Capo, la cancellazione si ferma');

  const aSecco = { rivelate: ['T1', 'T4'], compiti: { tell: 0 }, round: 7 };
  ok(gioca(aSecco)[0] === 'Non trovano nulla da cancellare.' && aSecco.compiti.tell === 0,
     'il pool non va sotto zero');

  const finito = { rivelate: ['T1', 'T4'], compiti: { tell: 4 }, round: 8 };
  gioca(finito); gioca(finito); gioca(finito); gioca(finito);
  ok(finito.compiti.tell === 0, 'quattro round di cancellazione svuotano il pool pieno');
}

// --- il RITMO del controcanto (Ep.20): i Frammenti pesano, il coro rallenta
// Il finale digitale era un compito da 10 con una prova per azione, dove venti
// serate di Frammenti non cambiavano nulla. Questo controllo fallisce se ci
// ritorna.
{
  const RITMO = { tile: 'T6', base: 1, per_frammenti: 6, minimo: 1,
                  oggetto: 'Mappa Acustica', con_oggetto: 1,
                  frammenti_default: 12, testo: 'canta' };
  const ep20 = { tessere: TESS,
                 compiti: [{ id: 'controcanto', tile: 'T6', quante: 10,
                             fatto: 'Il Controcanto è compiuto.', ritmo: RITMO }] };
  const gioca = (sp, extra) => { _setup(ep20, sp, extra); return avanzaRitmo(); };
  const camera = (o = {}) => ({ rivelate: ['T1', 'T6'], compiti: {}, nemici: [], round: 3, ...o });

  const fuori = { rivelate: ['T1'], compiti: {}, nemici: [], round: 3 };
  gioca(fuori, {});
  ok(!(fuori.compiti.controcanto > 0), 'fuori dalla camera non si canta');

  const base = camera();
  gioca(base, { frammenti: 12, indagine: { oggetti: [] } });
  ok(base.compiti.controcanto === 3, `12 Frammenti = 1+2 righe (viste ${base.compiti.controcanto})`);

  const conMappa = camera();
  gioca(conMappa, { frammenti: 12, indagine: { oggetti: ['La Mappa Acustica Attiva'] } });
  ok(conMappa.compiti.controcanto === 4, 'la Mappa Acustica vale una riga in più');

  const pochi = camera();
  gioca(pochi, { frammenti: 0, indagine: { oggetti: [] } });
  ok(pochi.compiti.controcanto === 1, 'senza Frammenti si canta la sola riga di base');

  const soffocati = camera({ nemici: [1, 2, 3, 4, 5].map(() => ({ pos: { t: 'T6', x: 0, y: 0 } })) });
  gioca(soffocati, { frammenti: 12, indagine: { oggetti: [] } });
  ok(soffocati.compiti.controcanto === 1,
     `cinque del coro non azzerano il canto: pavimento 1 (viste ${soffocati.compiti.controcanto})`);

  const senzaDichiarazione = camera();
  gioca(senzaDichiarazione, { indagine: { oggetti: [] } });
  ok(senzaDichiarazione.compiti.controcanto === 3, 'senza dichiarazione vale il default dei dati');

  const quasi = camera({ compiti: { controcanto: 9 } });
  const ann = gioca(quasi, { frammenti: 12, indagine: { oggetti: [] } });
  ok(quasi.compiti.controcanto === 10, 'il contatore non supera le 10 righe');
  ok(ann.some((a) => a.includes('Controcanto è compiuto')), 'alle 10 righe il finale si dichiara');
}

// --- la PRESSIONE della camera: cio' che corre contro il controcanto
{
  const epP = { tessere: TESS, canto_max: 8,
                pressione: { tile: 'T6', per_round: 1, testo: 'desta',
                             rito: { per_round: 1, testo: 'voce' } } };
  const corri = (sp) => { _setup(epP, sp, {}); return avanzaPressione(); };
  const dentro = (o = {}) => ({ rivelate: ['T1', 'T6'], canto: 0, nemici: [], round: 3, ...o });

  const fuori = { rivelate: ['T1'], canto: 0, nemici: [], round: 3 };
  corri(fuori);
  ok(fuori.canto === 0, 'fuori dalla camera il Dormiente non si desta');

  // senza una condizione dichiarata il rito ha sempre voce: e' la pressione
  // piena, +1 Dormiente +1 rito. Chi vuole una leva la dichiara nei dati.
  const sgombra = dentro();
  corri(sgombra);
  ok(sgombra.canto === 2, `rito senza condizione: +2 Canto (visto ${sgombra.canto})`);

  const conVoce = dentro({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 } }] });
  corri(conVoce);
  ok(conVoce.canto === 2, `col rito che ha una voce: +2 Canto (visto ${conVoce.canto})`);

  // N-112: la voce del rito non e' il coro comprato ma la Candidata. Un
  // impiegato in camera rallenta il controcanto e basta; salvare la Candidata
  // e' cio' che zittisce il rito. Se questo controllo cade, l'impiegato e'
  // tornato a fare due mestieri opposti e il finale ridiventa binario.
  const epC = { tessere: TESS, canto_max: 8,
                pressione: { tile: 'T6', per_round: 1, testo: 'desta',
                             rito: { per_round: 1, finche_manca_oggetto: 'Candidata Salvata',
                                     testo: 'voce' } } };
  const conOggetto = (sp, ogg) => { _setup(epC, sp, { indagine: { oggetti: ogg } }); return avanzaPressione(); };

  const candidataInMano = dentro({ nemici: [] });
  conOggetto(candidataInMano, []);
  ok(candidataInMano.canto === 2,
     `camera vuota ma Candidata in mano a M.: il rito canta lo stesso (+2, visto ${candidataInMano.canto})`);

  const candidataSalva = dentro({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 } }] });
  conOggetto(candidataSalva, ['La Candidata Salvata']);
  ok(candidataSalva.canto === 1,
     `Candidata salva: il coro in camera non canta il rito (+1, visto ${candidataSalva.canto})`);

  const altrove = dentro({ nemici: [{ pos: { t: 'T5', x: 0, y: 0 } }] });
  corri(altrove);
  ok(altrove.canto === 2, 'senza la Candidata il rito canta anche a camera sgombra');

  const alTetto = dentro({ canto: 8, nemici: [{ pos: { t: 'T6', x: 0, y: 0 } }] });
  corri(alTetto);
  ok(alTetto.canto === 8, 'il Canto non supera il tetto dei segnalini in scatola');
}

// --- il filo perso: il bersaglio da prendere vivo e' caduto (Ep.11)
// Senza, la partita in cui muore non finisce piu': il compito resta
// impossibile e si va avanti a vuoto fino al timeout.
{
  const epF = { tessere: TESS,
                compiti: [{ id: 'capo', nemico: 'IL CAPOSQUADRA', quante: 1, tile: 'T6',
                            perso_se_abbattuto: { esito: 'parziale', testo: 'Il filo è perso.' } }] };
  const gira = (sp) => { _setup(epF, sp, {}); return controllaFiloPerso(); };
  const base = (o = {}) => ({ rivelate: ['T1', 'T6'], compiti: {}, nemici: [], log: [], round: 5, ...o });

  const nonAncoraApparso = base();
  gira(nonAncoraApparso);
  ok(!nonAncoraApparso.esito, 'prima che il bersaglio compaia non si perde niente');

  const inCampo = base({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 }, nome: 'IL CAPOSQUADRA' }] });
  gira(inCampo);
  ok(!inCampo.esito, 'col bersaglio in piedi la spedizione continua');

  const caduto = base({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 }, nome: 'IL CAPOSQUADRA' }] });
  gira(caduto);                       // lo vede
  caduto.nemici = [];                 // e poi cade
  const ann = gira(caduto);
  ok(caduto.esito === 'parziale', `bersaglio caduto: parziale (visto ${caduto.esito})`);
  ok(ann.length === 1, 'e lo dice una volta sola');

  const giaPreso = base({ compiti: { capo: 1 },
                          nemici: [{ pos: { t: 'T6', x: 0, y: 0 }, nome: 'IL CAPOSQUADRA' }] });
  gira(giaPreso); giaPreso.nemici = []; gira(giaPreso);
  ok(!giaPreso.esito, 'se era gia' + "'" + ' stato preso, sparire dal campo non e' + "'" + ' un filo perso');
}

// --- la seconda via: abbattere il bersaglio ferma l'orologio (Ep.10)
// Il freno per adiacenza c'era; questa no, e senza l'episodio era perso per
// aritmetica (0 vittorie su 20 misurate).
{
  const epO = { tessere: TESS,
                orologio: { id: 'demolizione', nome: 'Demolizione', max: 12, ogni: 1,
                            esito: 'sconfitta', testo: 'Il muro e caduto.',
                            ferma_se_abbattuto: 'IL MURATORE' } };
  const gira = (sp) => { _setup(epO, sp, {}); return avanzaOrologio(1, 'prova'); };
  const base = (o = {}) => ({ rivelate: ['T1'], nemici: [], eroiPos: {}, vite: {},
                              log: [], traccia: 0, round: 3, ...o });

  // «non c'e' in campo» e' vero anche PRIMA che compaia — il Muratore sta in
  // T6 — e una guardia scritta male fermerebbe l'orologio dal primo round,
  // cioe' regalerebbe l'episodio invece di ripararlo.
  const primaCheCompaia = base();
  gira(primaCheCompaia); gira(primaCheCompaia); gira(primaCheCompaia);
  ok(primaCheCompaia.traccia === 3,
     `prima che il bersaglio compaia l'orologio corre sempre (visto ${primaCheCompaia.traccia})`);

  const conLui = base({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 }, nome: 'IL MURATORE' }] });
  gira(conLui);
  ok(conLui.traccia === 1, 'col bersaglio in piedi corre');

  const abbattuto = base({ nemici: [{ pos: { t: 'T6', x: 0, y: 0 }, nome: 'IL MURATORE' }] });
  gira(abbattuto);              // lo vede
  abbattuto.nemici = [];        // e poi cade
  gira(abbattuto); gira(abbattuto);
  ok(abbattuto.traccia === 1,
     `abbattuto il bersaglio l'orologio si ferma (visto ${abbattuto.traccia})`);
}

// --- l'orologio legato a un personaggio non gira prima che entri in scena
// La Demolizione e' «ogni turno del MURATORE», e il Muratore sta in T6: la
// traccia partiva dal round 1 e correva nove round a vuoto. Questo controllo
// fallisce se ci ritorna.
{
  const epT = { tessere: TESS,
                orologio: { id: 'demolizione', nome: 'Demolizione', max: 12, ogni: 2,
                            esito: 'sconfitta', da_tessera: 'T6' } };
  const gira = (sp) => { _setup(epT, sp, {}); return avanzaOrologio(2, 'prova'); };

  const fuori = { rivelate: ['T1', 'T5'], nemici: [], eroiPos: {}, vite: {}, log: [], traccia: 0, round: 4 };
  gira(fuori); gira(fuori); gira(fuori);
  ok(!fuori.traccia, `fuori dalla stanza la traccia non parte (vista ${fuori.traccia})`);

  const dentro = { rivelate: ['T1', 'T6'], nemici: [], eroiPos: {}, vite: {}, log: [], traccia: 0, round: 9 };
  gira(dentro); gira(dentro);
  ok(dentro.traccia === 4, `nella stanza sale di 2 per round (vista ${dentro.traccia})`);
}

console.log(ko === 0 ? 'TUTTO OK (motore multi-tessera)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
