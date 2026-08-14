// LE MIGLIORIE AGISCONO, invece di essere stampate.
//
// Il precedente e' esplicito e costoso: tre abilita' di Spedizione sono state
// per mesi «carica spesa, effetto narrato» — il bottone c'era, l'azione si
// consumava, e il gioco non se ne accorgeva (AUDIT-CLASSI.md §5). Le Migliorie
// nascono con lo stesso rischio moltiplicato per dodici, e questa e' la rete.
//
// UNA SONDA PER VOCE, e ognuna misura il COMPORTAMENTO: con la miglioria lo
// stato cambia, senza no. Non si controlla che la tabella contenga una riga —
// quello lo passerebbe anche un elenco che non fa niente.
//
// node webapp/test-migliorie.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { MIGLIORIE, specDi, costoProssima, delta, righeDi, vociIgnote,
         quante, haIlGruppo } from './public/motore/migliorie.js';
import { eroe, saluteMax, difesaDi, movimento } from './public/motore/stat.js';
import { provaDi } from './public/motore/azioni.js';
import { pianoNemici } from './public/motore/nemici.js';
import { frammentiPortati } from './public/motore/obiettivi.js';
import { candidati } from './public/motore/abilita.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const dati = (id) => ({
  ep: JSON.parse(readFileSync(`webapp/data/${id}.json`, 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
});
const DATI = dati('ep1');
const EROI = DATI.comune.eroi.map((e) => e.nome);
const chiHa = (k) => EROI.find((n) => n.includes(k));
const T0 = DATI.ep.tessere[0].id;
const SGH = DATI.comune.nemici.find((n) => n.att >= 2).nome;

// ELENA e' la cavia giusta quasi ovunque: VIGORE 1, Salute 6, Difesa 8 — cioe'
// l'eroe su cui ogni miglioria si vede di piu'.
const ELENA = chiHa('ELENA');
const OTTONE = chiHa('OTTONE');

function partita(party, mig = {}, over = {}, cic = {}) {
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: T0, x: 1, y: i % 4 }; vite[n] = 4; });
  return {
    v: 1, episodio: 'ep1', party, fase: 'spedizione',
    migliorie: mig, cicatrici: cic,
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
const G = (s, d = DATI) => ({ ep: d.ep, comune: d.comune, carte: d.carte,
                              sp: s.spedizione, partita: s, _layout: null });

// ---------------------------------------------------------------- la tabella
{
  const ids = MIGLIORIE.map((m) => m.id);
  ok(new Set(ids).size === ids.length, 'nessun id doppio nella tabella');
  ok(MIGLIORIE.every((m) => Array.isArray(m.costo) && m.costo.length >= 1),
     'ogni voce ha almeno una casella con un prezzo');
  // Il conto che chiude la saturazione: comprare tutto deve costare PIU' dei
  // premi di una campagna perfetta (21 serate + la seconda casella dell'Ep.6).
  const tutto = MIGLIORIE.reduce((a, m) => a + m.costo.reduce((x, y) => x + y, 0), 0);
  ok(tutto > 22, `comprare tutto costa ${tutto} punti, piu' dei ~22 premi di una campagna perfetta`);
}

// -------------------------------------------------------- TEMPRA e CICATRICI
{
  const s0 = partita([ELENA]);
  const s1 = partita([ELENA], { [ELENA]: ['tempra:vigore', 'tempra:vigore'] });
  ok(eroe(G(s1), ELENA).vigore === eroe(G(s0), ELENA).vigore + 2,
     `due Tempre su VIGORE valgono +2 (${eroe(G(s0), ELENA).vigore} → ${eroe(G(s1), ELENA).vigore})`);

  // il tetto: massimo 4, anche spuntandone di piu'
  const s2 = partita([OTTONE], { [OTTONE]: ['tempra:vigore', 'tempra:vigore', 'tempra:vigore', 'tempra:vigore'] });
  ok(eroe(G(s2), OTTONE).vigore === 4, `il tetto e' 4 (VIGORE ${eroe(G(s2), OTTONE).vigore})`);

  // il pavimento: le cicatrici non portano sotto 1
  const s3 = partita([ELENA], {}, {}, { [ELENA]: ['vigore', 'vigore', 'vigore'] });
  ok(eroe(G(s3), ELENA).vigore === 1, `il pavimento e' 1 (VIGORE ${eroe(G(s3), ELENA).vigore})`);

  // e si annullano: +2 Tempra, −1 cicatrice = +1
  const s4 = partita([ELENA], { [ELENA]: ['tempra:nervi', 'tempra:nervi'] }, {}, { [ELENA]: ['nervi'] });
  ok(eroe(G(s4), ELENA).nervi === eroe(G(s0), ELENA).nervi + 1,
     'Tempra e Cicatrice sulla stessa caratteristica si sommano col segno');

  // LA COPIA. `comune.eroi` e' in cache e condiviso: sporcarlo farebbe cadere
  // la crescita di un tavolo addosso alla partita dopo.
  eroe(G(s1), ELENA);
  ok(eroe(G(s0), ELENA).vigore === DATI.comune.eroi.find((e) => e.nome === ELENA).vigore,
     'la crescita non sporca la carta condivisa in cache');

  const d = delta(G(s1), ELENA);
  ok(d.vigore === 2 && d.salute === 0, 'delta() conta solo quel che e' + ' stato spuntato');
}

// -------------------------------------------------------------------- FIBRA
{
  const s0 = partita([ELENA]);
  const s1 = partita([ELENA], { [ELENA]: ['fibra', 'fibra', 'fibra'] });
  const m0 = saluteMax(G(s0), eroe(G(s0), ELENA));
  const m1 = saluteMax(G(s1), eroe(G(s1), ELENA));
  ok(m1 === m0 + 3, `tre Fibre valgono +3 Salute massima (${m0} → ${m1})`);
}

// ------------------------------------------------------------------ REVOLVER
{
  const T1 = DATI.ep.tessere[1].id;
  const nem = [{ nome: SGH, pos: { t: T0, x: 1, y: 3 }, ferite: 0, max: 3 }];
  const s = partita([ELENA], { [ELENA]: ['revolver'] }, { nemici: nem });
  s.spedizione.eroiPos[ELENA] = { t: T0, x: 1, y: 0 };     // tre caselle di distanza

  // senza Revolver, quel nemico e' irraggiungibile
  const senza = partita([ELENA], {}, { nemici: JSON.parse(JSON.stringify(nem)) });
  senza.spedizione.eroiPos[ELENA] = { t: T0, x: 1, y: 0 };
  const koMischia = applica(senza, { tipo: 'attacca', eroe: ELENA, bersaglio: 0 }, DATI);
  ok(koMischia.rifiuto, 'a tre caselle il corpo a corpo e\' rifiutato');
  const koArma = applica(senza, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, arma: 'revolver' }, DATI);
  ok(koArma.rifiuto && /non ha il Revolver/.test(koArma.rifiuto.motivo),
     'chi non ha il Revolver non spara');

  // con il Revolver, si spara
  const out = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, arma: 'revolver' }, DATI);
  ok(!out.rifiuto, `il Revolver arriva a tre caselle (${out.rifiuto && out.rifiuto.motivo})`);
  const tiro = (out.eventi || []).find((e) => e.tipo === 'tiro');
  ok(tiro && tiro.bonus.length === 1 && tiro.bonus[0].val === 2,
     'il Revolver tira 2d6+2 fisso, senza VIGORE');

  // e spende «attaccare»: in un turno si spara O si mena, non tutt'e due.
  // La seconda meta' di questa sonda e' quella che conta — «il Revolver non e'
  // un attacco in piu'» e' l'intera differenza fra la voce tarabile e i dieci
  // colpi gratis a round che il Regolamento scriveva.
  ok((out.stato.spedizione.azioni[ELENA] || []).includes('attaccare'),
     'sparare spende l\'azione di attacco');
  {
    const dopo = JSON.parse(JSON.stringify(out.stato));
    dopo.spedizione.nemici.push({ nome: SGH, pos: { t: T0, x: 1, y: 1 }, ferite: 0, max: 3 });
    dopo.spedizione.eroiPos[ELENA] = { t: T0, x: 1, y: 2 };
    const bis = applica(dopo, { tipo: 'attacca', eroe: ELENA, bersaglio: 1 }, DATI);
    ok(bis.rifiuto && /già attaccato/.test(bis.rifiuto.motivo),
       'chi ha sparato non mena anche: e\' la stessa azione');
    const ancora = applica(dopo, { tipo: 'attacca', eroe: ELENA, bersaglio: 1, arma: 'revolver' }, DATI);
    ok(ancora.rifiuto, 'e non spara due volte nello stesso turno');
  }

  // fuori gittata resta fuori: un nemico nella stanza accanto e' oltre le 3
  const lontano = partita([ELENA], { [ELENA]: ['revolver'] },
    { rivelate: [T0, T1], nemici: [{ nome: SGH, pos: { t: T1, x: 2, y: 2 }, ferite: 0, max: 3 }] });
  lontano.spedizione.eroiPos[ELENA] = { t: T0, x: 1, y: 1 };
  const fuori = applica(lontano, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, arma: 'revolver' }, DATI);
  ok(fuori.rifiuto && /tiro/i.test(fuori.rifiuto.motivo),
     `oltre 3 caselle il colpo non parte (${fuori.rifiuto && fuori.rifiuto.motivo})`);

  // E SENZA LINEA nemmeno: `distGlob` torna 0 quando un cammino non c'e', e 0
  // non e' «vicinissimo». Senza questa guardia si sparava attraverso i muri —
  // trovato da questa sonda, non dal diff.
  const muro = partita([ELENA], { [ELENA]: ['revolver'] },
    { nemici: [{ nome: SGH, pos: { t: T0, x: 3, y: 3 }, ferite: 0, max: 3 }] });
  muro.spedizione.eroiPos[ELENA] = { t: T0, x: 1, y: 1 };
  const chiuso = applica(muro, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, arma: 'revolver' }, DATI);
  ok(chiuso.rifiuto, 'senza cammino non si spara: 0 vuol dire «non ci arrivi», non «adiacente»');
}

// ------------------------------------------------------------ SPALLE COPERTE
{
  const A = ELENA; const B = OTTONE;
  const vicini = { [A]: { t: T0, x: 1, y: 1 }, [B]: { t: T0, x: 1, y: 2 } };
  const s0 = partita([A, B], {}, { eroiPos: { ...vicini } });
  const s1 = partita([A, B], { [B]: ['spalle'] }, { eroiPos: { ...vicini } });
  ok(difesaDi(G(s1), A) === difesaDi(G(s0), A) + 1,
     `il compagno con le Spalle coperte da' +1 Difesa (${difesaDi(G(s0), A)} → ${difesaDi(G(s1), A)})`);

  // non cumulabile: due che la portano si danno +1 ciascuno, non +2
  const s2 = partita([A, B], { [A]: ['spalle'], [B]: ['spalle'] }, { eroiPos: { ...vicini } });
  ok(difesaDi(G(s2), A) === difesaDi(G(s0), A) + 1, 'due Spalle coperte adiacenti non fanno +2');

  // lontani, niente
  const lontani = { [A]: { t: T0, x: 0, y: 0 }, [B]: { t: T0, x: 3, y: 3 } };
  const s3 = partita([A, B], { [B]: ['spalle'] }, { eroiPos: lontani });
  ok(difesaDi(G(s3), A) === difesaDi(G(s0), A), 'da lontano le spalle non si coprono');

  // E ARRIVA AL COLPO: e' il punto: il piano dei nemici deve usare quella Difesa.
  const nem = [{ nome: SGH, pos: { t: T0, x: 1, y: 0 }, ferite: 0, max: 3 }];
  const conNem = (mig) => {
    const s = partita([A, B], mig, { fase: 'nemici', nemici: JSON.parse(JSON.stringify(nem)),
                                     eroiPos: { ...vicini } });
    s.spedizione.eroiPos[A] = { t: T0, x: 1, y: 1 };
    const caso = { tira2d6: () => ({ d: [3, 3], tot: 6 }), scegli: () => 0 };
    return pianoNemici(G(s), caso, true);
  };
  const p0 = conNem({}); const p1 = conNem({ [B]: ['spalle'] });
  const dif0 = (p0.find((x) => x.attacco) || {}).attacco;
  const dif1 = (p1.find((x) => x.attacco) || {}).attacco;
  ok(dif0 && dif1 && dif1.dif === dif0.dif + 1,
     `la Difesa alzata arriva al piano dei nemici (${dif0 && dif0.dif} → ${dif1 && dif1.dif})`);
}

// ---------------------------------------------------------------- MANO FERMA
{
  // una prova NERVI da tessera: si chiede a provaDi quale sara', con e senza
  const tess = DATI.ep.tessere.find((t) => /NERVI\s*\(/i.test(t.testo || ''));
  ok(tess, 'l\'Ep.1 ha una tessera con una prova di NERVI (serve alla sonda)');
  if (tess) {
    const nodo = { t: tess.id, x: 1, y: 1 };
    const s0 = partita([ELENA], {}, { rivelate: [T0, tess.id] });
    const s1 = partita([ELENA], { [ELENA]: ['mano'] }, { rivelate: [T0, tess.id] });
    const somma = (s) => {
      const p = provaDi(G(s), { tipo: 'muovi', eroe: ELENA, nodo });
      return p ? p.bonus.reduce((a, b) => a + b.val, 0) : null;
    };
    ok(somma(s0) != null, 'la prova d\'insidia si dichiara');
    ok(somma(s1) === somma(s0) + 1, `Mano ferma vale +1 sui NERVI d'ambiente (${somma(s0)} → ${somma(s1)})`);
  }

  // ma NON sui combattimenti: l'attacco non passa da prova()
  const nem = [{ nome: SGH, pos: { t: T0, x: 1, y: 2 }, ferite: 0, max: 3 }];
  const a0 = partita([ELENA], {}, { nemici: nem });
  const a1 = partita([ELENA], { [ELENA]: ['mano'] }, { nemici: JSON.parse(JSON.stringify(nem)) });
  const bon = (s) => provaDi(G(s), { tipo: 'attacca', eroe: ELENA, bersaglio: 0 })
    .bonus.reduce((a, b) => a + b.val, 0);
  ok(bon(a1) === bon(a0), 'Mano ferma non tocca gli attacchi');
}

// -------------------------------------------------------- LANTERNA SCHERMATA
{
  const tess = DATI.ep.tessere.find((t) => /NERVI\s*\(|ACUME\s*\(|VIGORE\s*\(/i.test(t.testo || ''));
  if (tess) {
    const nodo = { t: tess.id, x: 1, y: 1 };
    const s0 = partita([ELENA], {}, { rivelate: [T0, tess.id] });
    const s1 = partita([ELENA], { [ELENA]: ['lanterna'] }, { rivelate: [T0, tess.id] });
    ok(provaDi(G(s0), { tipo: 'muovi', eroe: ELENA, nodo }) !== null,
       'senza lanterna l\'insidia d\'ingresso scatta');
    ok(provaDi(G(s1), { tipo: 'muovi', eroe: ELENA, nodo }) === null,
       'con la Lanterna schermata la trappola non si attiva su chi la porta');

    // e resta ARMATA per il compagno che entra dopo
    const s2 = partita([ELENA, OTTONE], { [ELENA]: ['lanterna'] }, { rivelate: [T0, tess.id] });
    const dopo = applica(s2, { tipo: 'muovi', eroe: ELENA, nodo }, DATI);
    ok(!dopo.stato.spedizione.insidie[tess.id],
       'la trappola non si segna come scattata: il compagno dopo la trova ancora');
    ok(provaDi(G(dopo.stato), { tipo: 'muovi', eroe: OTTONE, nodo }) !== null,
       'e infatti scatta su chi non ha la lanterna');
  }
}

// ------------------------------------------------------------ BORSA DI GARZE
{
  const vicini = { [ELENA]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 1, y: 2 } };
  const s = partita([ELENA, OTTONE], { [ELENA]: ['garze'] }, { eroiPos: { ...vicini } });
  const cand = candidati(G(s), ELENA, 'garze');
  ok(cand && cand.opzioni.length === 1 && cand.opzioni[0].id === OTTONE,
     'le garze si danno a un adiacente, e non a se stessi');

  const out = applica(s, { tipo: 'abilita', eroe: ELENA, voce: 'garze', scelta: OTTONE }, DATI);
  ok(!out.rifiuto, `le garze partono (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.stato.spedizione.vite[OTTONE] === 6, `+2 Salute (4 → ${out.stato.spedizione.vite[OTTONE]})`);
  ok(out.stato.spedizione.migUsi[ELENA].garze === 1, 'la carica si spende');
  ok((out.stato.spedizione.azioni[ELENA] || []).includes('abilita'), 'e costa un\'azione');

  // due usi, non tre
  let st = out.stato;
  st.spedizione.azioni = {}; st.spedizione.vite[OTTONE] = 4;
  st = applica(st, { tipo: 'abilita', eroe: ELENA, voce: 'garze', scelta: OTTONE }, DATI).stato;
  st.spedizione.azioni = {};
  const terza = applica(st, { tipo: 'abilita', eroe: ELENA, voce: 'garze', scelta: OTTONE }, DATI);
  ok(terza.rifiuto, 'la terza garza e\' rifiutata: sono due usi');

  // e chi non le ha, non le usa
  const senza = partita([ELENA, OTTONE], {}, { eroiPos: { ...vicini } });
  const no = applica(senza, { tipo: 'abilita', eroe: ELENA, voce: 'garze', scelta: OTTONE }, DATI);
  ok(no.rifiuto && /non ha/.test(no.rifiuto.motivo), 'chi non ha la Borsa non la usa');
}

// ------------------------------------------------------------- PASSO FELPATO
{
  const s0 = partita([ELENA]);
  const s1 = partita([ELENA], { [ELENA]: ['passo'] });
  ok(movimento(G(s0), ELENA) === 3, 'il movimento base e\' 3');
  const out = applica(s1, { tipo: 'abilita', eroe: ELENA, voce: 'passo' }, DATI);
  ok(!out.rifiuto, `il Passo felpato parte (${out.rifiuto && out.rifiuto.motivo})`);
  ok(movimento(G(out.stato), ELENA) === 6, `+3 caselle (3 → ${movimento(G(out.stato), ELENA)})`);
  ok(!(out.stato.spedizione.azioni[ELENA] || []).includes('abilita'),
     'e NON costa un\'azione: e\' un modo di muoversi');

  // vale per il round in corso e non oltre
  const dopo = JSON.parse(JSON.stringify(out.stato));
  dopo.spedizione.round += 1;
  ok(movimento(G(dopo), ELENA) === 3, 'il round dopo il passo e\' tornato normale');

  // un uso solo
  const bis = applica(out.stato, { tipo: 'abilita', eroe: ELENA, voce: 'passo' }, DATI);
  ok(bis.rifiuto, 'il Passo felpato e\' una volta per spedizione');
}

// ---------------------------------------------------------- VOCE CHE REGGE
{
  const D20 = dati('ep20');
  const s0 = partita([ELENA, OTTONE]); s0.episodio = 'ep20'; s0.frammenti = 6;
  const s1 = partita([ELENA, OTTONE], { [OTTONE]: ['voce'] }); s1.episodio = 'ep20'; s1.frammenti = 6;
  ok(frammentiPortati(G(s1, D20)) === frammentiPortati(G(s0, D20)) + 1,
     `Voce che regge vale un Frammento in piu' (${frammentiPortati(G(s0, D20))} → ${frammentiPortati(G(s1, D20))})`);
  ok(haIlGruppo(G(s1), 'voce'), 'e la porta il gruppo, non il singolo');

  // una sola per gruppo: due caselle non fanno due Frammenti
  const s2 = partita([ELENA, OTTONE], { [ELENA]: ['voce'], [OTTONE]: ['voce'] });
  s2.episodio = 'ep20'; s2.frammenti = 6;
  ok(frammentiPortati(G(s2, D20)) === frammentiPortati(G(s1, D20)),
     'due Voci non valgono due Frammenti');
}

// -------------------------------------------------- il prezzario e le righe
{
  const s = partita([ELENA], { [ELENA]: ['tempra:vigore'] });
  ok(costoProssima(G(s), ELENA, 'tempra', 'vigore') === 2,
     'la seconda Tempra sulla stessa caratteristica costa 2');
  ok(costoProssima(G(s), ELENA, 'tempra', 'nervi') === 1,
     'ma la prima su un\'altra caratteristica costa ancora 1');
  ok(costoProssima(G(s), ELENA, 'fibra') === 1, 'la prima Fibra costa 1');

  const pieno = partita([ELENA], { [ELENA]: ['fibra', 'fibra', 'fibra'] });
  ok(costoProssima(G(pieno), ELENA, 'fibra') === null, 'finite le caselle, non c\'e\' prezzo');
  ok(quante(G(pieno), ELENA, 'fibra') === 3, 'quante() conta le caselle');

  // quel che l'app puo' solo dire, lo dice
  const dice = partita([ELENA], { [ELENA]: ['taccuino', 'fiato'] });
  const righe = righeDi(G(dice));
  ok(righe.length === 2, `le due voci non applicate escono come righe (${righe.length})`);
  ok(righe.every((r) => r.includes(ELENA)), 'e dicono di chi sono');
  ok(righeDi(G(partita([ELENA], { [ELENA]: ['fibra'] }))).length === 0,
     'quelle applicate non si ripetono a parole');

  // e una voce sconosciuta non passa in silenzio
  const strana = partita([ELENA], { [ELENA]: ['bazooka'] });
  ok(vociIgnote(G(strana)).length === 1, 'una miglioria sconosciuta viene dichiarata');
  ok(vociIgnote(G(partita([ELENA], { [ELENA]: ['fibra'] }))).length === 0,
     'e quelle note no');
  ok(specDi('bazooka') === null, 'specDi non inventa');
}

// ------------------------------------------------- l'eroe senza migliorie
// La rete piu' importante: un gruppo che non e' cresciuto deve giocare
// ESATTAMENTE la partita di prima. Se questa cade, tutta la mappa pilota
// misurata finora e' da rifare per un motivo che non e' il bilanciamento.
{
  const s = partita([ELENA]);
  const base = DATI.comune.eroi.find((e) => e.nome === ELENA);
  ok(eroe(G(s), ELENA) === base, 'senza migliorie `eroe()` torna proprio la carta, senza copiarla');
  ok(difesaDi(G(s), ELENA) === base.difesa, 'e la Difesa e\' quella stampata');
  ok(movimento(G(s), ELENA) === 3, 'e il movimento pure');
  // nessuna chiave nuova nello stato finche' non serve
  const out = applica(s, { tipo: 'finisci-eroe', eroe: ELENA }, DATI);
  ok(out.stato.spedizione.migUsi === undefined, 'e lo stato non si sporca di chiavi inutili');
}

console.log(ko === 0 ? `TUTTO OK (migliorie, ${MIGLIORIE.length} voci)` : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
