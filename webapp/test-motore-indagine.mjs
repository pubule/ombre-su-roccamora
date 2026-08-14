// IL MOTORE DELL'INDAGINE: le regole della città, senza schermo.
//
// Fino al 14/08/2026 queste regole vivevano nella vista, e provarle voleva dire
// aprire un browser e cliccare. Qui si chiamano e basta — ed è la ragione per
// cui ci si sposta: quel che si può interrogare in tre righe si prova per bene.
//
// COSA SI PROVA. Non che «funzioni»: che l'ORA sia una risorsa vera. È l'unica
// cosa che l'Indagine mette in gioco, e ogni regola qui sotto le gira intorno —
// si spende dichiarando, si spende sbagliando la parola, non si spende con una
// pista fredda, e a mezzanotte non se ne spendono altre.
//
// node webapp/test-motore-indagine.mjs
import { readFileSync } from 'fs';
import { applica, applicaIndagine } from './public/motore/comandi.js';
import { INDAGINE_DI_ARBITRO } from './public/motore/indagine.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const leggi = (k) => JSON.parse(readFileSync(`webapp/data/${k}.json`, 'utf8'));
const COMUNE = leggi('comune');
const CARTE = leggi('carte');
const EP = leggi('ep1');
const DATI = { ep: EP, comune: COMUNE, carte: CARTE };

const APERTO = EP.luoghi.find((l) => l.aperto && !l.chiave);
const CHIUSO = EP.luoghi.find((l) => l.chiave && l.chiave[0] === 'parola');
const NINO = COMUNE.eroi.find((e) => /GRIMALDELLO/.test(e.nome)).nome;

const partita = (over = {}) => ({
  v: 1, episodio: 'ep1', party: [COMUNE.eroi[0].nome, NINO], fase: 'indagine',
  creata: 1, aggiornato: 1, rng: { seme: 7, passo: 0 },
  indagine: {
    ora: 18, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
    oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
    note: '', noteEroe: {}, risposte: ['', '', '', ''], chiusa: false, ...over,
  },
  spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
});

const fai = (stato, cmd) => applicaIndagine(stato, cmd, DATI);
const ind = (out) => out.stato.indagine;

// --- IL GUSCIO NON MUTA QUEL CHE RICEVE
// È la prima delle tre garanzie del motore: senza, uno stato rifiutato
// resterebbe mezzo cambiato e nessuno se ne accorgerebbe.
{
  const p = partita();
  const prima = JSON.stringify(p);
  fai(p, { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(JSON.stringify(p) === prima, 'applicaIndagine lavora su una copia');

  const out = fai(p, { tipo: 'non-esiste' });
  ok(out.rifiuto && /sconosciuto/i.test(out.rifiuto.motivo),
     'un comando che non esiste è un rifiuto in chiaro, non un’eccezione');
  ok(out.stato === p, 'e lo stato torna quello di prima');
}

// --- LA PISTA FREDDA NON COSTA NIENTE
// È la regola che rende sensato dichiarare: si può tentare un nome e scoprire
// che a Roccamora, quella sera, lì non c'è niente.
{
  const out = fai(partita(), { tipo: 'dichiara', voce: 'un posto che non esiste' });
  ok(!out.rifiuto && ind(out).ora === 18, `una pista fredda non spende l’ora (${ind(out).ora})`);
  ok(out.eventi.some((e) => e.tipo === 'pista-fredda'), 'e lo dice, invece di tacere');
}

// --- ENTRARE IN UN LUOGO APERTO SPENDE L'ORA
{
  const out = fai(partita(), { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(!out.rifiuto, `si entra dove è aperto (${out.rifiuto && out.rifiuto.motivo})`);
  ok(ind(out).ora === 18 + (APERTO.ore || 1), `l’ora si spende (${ind(out).ora})`);
  ok(ind(out).visitati.includes(APERTO.n), 'e il luogo risulta battuto');
  ok(ind(out).luogoAperto === APERTO.n, 'e ci si resta dentro');
  ok(out.eventi.some((e) => e.tipo === 'entrati' && e.prima), 'l’evento dice che è la prima volta');
}

// --- LA PORTA CHIUSA NON È UN RIFIUTO: È L'ALTRA METÀ DEL GIOCO
{
  const out = fai(partita(), { tipo: 'dichiara', voce: CHIUSO.voce_mappa });
  ok(!out.rifiuto, 'dichiarare un luogo chiuso non è un errore');
  ok(out.eventi.some((e) => e.tipo === 'porta-chiusa'), 'si annuncia che la porta è chiusa');
  ok(ind(out).ora === 18, `e l’ora NON si spende ancora: si spende bussando (${ind(out).ora})`);
}

// --- BUSSARE: L'ORA SI SPENDE GIUSTA O SBAGLIATA
// È il cuore della tensione dell'Indagine, e la regola che un test a schermo
// non riusciva a provare senza giocare mezza serata.
{
  const giusta = CHIUSO.chiave[1];
  const a = fai(partita(), { tipo: 'bussa', luogo: CHIUSO.n, dichiarazione: giusta });
  ok(!a.rifiuto && ind(a).sbloccati.includes(CHIUSO.n), 'la parola giusta apre');
  ok(ind(a).ora === 18 + (CHIUSO.ore || 1), `e costa l’ora (${ind(a).ora})`);
  ok(ind(a).luogoAperto === CHIUSO.n, 'e si entra subito, senza pagarla due volte');

  const b = fai(partita(), { tipo: 'bussa', luogo: CHIUSO.n, dichiarazione: 'una parola qualunque' });
  ok(!b.rifiuto && !(b.stato.indagine.sbloccati || []).includes(CHIUSO.n), 'la parola sbagliata non apre');
  ok(ind(b).ora === 18 + (CHIUSO.ore || 1), `ma l’ora si spende lo stesso (${ind(b).ora})`);
  ok(ind(b).scoperti.includes(CHIUSO.n), 'e la carta del luogo resta girata: ne conoscete il volto');
  ok(ind(b).luogoAperto == null, 'senza entrare');

  // e una volta detta, la parola vale per tutta la notte
  const c = fai(a.stato, { tipo: 'lascia-luogo' });
  const d = fai(c.stato, { tipo: 'visita', luogo: CHIUSO.n });
  ok(!d.rifiuto && ind(d).luogoAperto === CHIUSO.n, 'si rientra senza ridire la parola');
  ok(ind(d).ora > ind(c).ora, 'ma l’ora si paga di nuovo: è il viaggio, non la porta');
}

// --- MEZZANOTTE È MEZZANOTTE
{
  // NON un rifiuto: una SCENA. Dichiarare era legale, e la risposta e' «non se
  // ne fa niente, e l'ora resta» — come la pista fredda.
  const out = fai(partita({ ora: 24 }), { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(!out.rifiuto && out.eventi.some((e) => e.tipo === 'mezzanotte'),
     'a mezzanotte si annuncia che il tempo e’ finito');
  ok(out.stato.indagine.ora === 24, 'e non si spende un’altra ora');

  const lontano = EP.luoghi.find((l) => (l.ore || 1) > 1);
  if (lontano) {
    const o = fai(partita({ ora: 23 }), { tipo: 'dichiara', voce: lontano.voce_mappa });
    ok(o.eventi.some((e) => e.tipo === 'troppo-lontano'),
       'e un luogo fuori città con un’ora sola si annuncia');
    ok(o.stato.indagine.ora === 23, 'senza spendere niente');
  }
  const chiude = EP.luoghi.find((l) => l.chiude != null);
  if (chiude) {
    const o = fai(partita({ ora: chiude.chiude }), { tipo: 'dichiara', voce: chiude.voce_mappa });
    ok(o.eventi.some((e) => e.tipo === 'gia-chiuso'), 'e una porta che ha chiuso lo dice');
    ok(o.stato.indagine.ora === chiude.chiude, 'senza spendere l’ora: lo sapevate arrivando');
  }
}

// --- IL GRIMALDELLO APRE QUESTA VISITA, NON LA SERRATURA
{
  const a = fai(partita(), { tipo: 'grimaldello', luogo: CHIUSO.n });
  ok(!a.rifiuto && ind(a).luogoAperto === CHIUSO.n, 'Nino entra senza dire niente');
  ok(!(ind(a).sbloccati || []).includes(CHIUSO.n),
     'ma la parola resta da scoprire: la porta non è sbloccata');
  ok(ind(a).grimaldelloUsato === true, 'e la carica è spesa');

  const b = fai(a.stato, { tipo: 'grimaldello', luogo: CHIUSO.n });
  ok(b.rifiuto && /già/i.test(b.rifiuto.motivo), 'e vale una volta sola');

  const senzaNino = partita();
  senzaNino.party = [COMUNE.eroi[0].nome];
  const c = fai(senzaNino, { tipo: 'grimaldello', luogo: CHIUSO.n });
  ok(c.rifiuto && /Nino/.test(c.rifiuto.motivo), 'e serve Nino in squadra');
}

// --- LE COSE RACCOLTE, E IL TACCUINO
{
  const dentro = fai(partita(), { tipo: 'dichiara', voce: APERTO.voce_mappa }).stato;
  const a = fai(dentro, { tipo: 'prendi-oggetto', nome: 'Corda di Violino d’Argento' });
  ok(ind(a).oggetti.includes('Corda di Violino d’Argento'), 'un oggetto si registra');
  const b = fai(a.stato, { tipo: 'prendi-oggetto', nome: 'Corda di Violino d’Argento' });
  ok(b.rifiuto, 'e non si prende due volte');

  const c = fai(dentro, { tipo: 'nota-eroe', eroe: NINO, testo: 'il liutaio esce di notte' });
  ok(ind(c).noteEroe[NINO] === 'il liutaio esce di notte', 'gli appunti di un eroe si scrivono');
  const d = fai(c.stato, { tipo: 'risposte', risposte: ['al magazzino', '', '', ''] });
  ok(ind(d).risposte[0] === 'al magazzino', 'e le risposte della busta pure');
}

// --- L'INDAGINE CHIUSA NON ACCETTA PIÙ NIENTE
{
  const out = fai(partita({ chiusa: true }), { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(out.rifiuto && /chiusa/i.test(out.rifiuto.motivo), 'a busta aperta l’indagine è finita');
}

// --- `applica` SMISTA DA SOLO
// La porta d'ingresso è una: chi manda un comando non deve sapere in quale metà
// della serata si trova.
{
  const out = applica(partita(), { tipo: 'dichiara', voce: APERTO.voce_mappa }, DATI);
  ok(!out.rifiuto && out.stato.indagine.luogoAperto === APERTO.n,
     '`applica` manda i comandi d’Indagine al motore giusto');

  const sped = partita({ chiusa: true });
  sped.fase = 'spedizione';
  const o2 = applica(sped, { tipo: 'dichiara', voce: APERTO.voce_mappa }, DATI);
  ok(o2.rifiuto && /sconosciuto/i.test(o2.rifiuto.motivo),
     'e in Spedizione quel comando non esiste');
}

// --- CHI PUÒ MANDARE COSA
// L'ora è la risorsa del GRUPPO: quattro dita che la spendono senza parlarne è
// il modo più rapido di rovinare l'ansia della notte.
{
  for (const c of ['dichiara', 'bussa', 'visita', 'risposte', 'prendi-oggetto']) {
    ok(INDAGINE_DI_ARBITRO.has(c), `«${c}» è del gruppo: lo manda chi arbitra`);
  }
  ok(!INDAGINE_DI_ARBITRO.has('nota-eroe'), 'gli appunti di un eroe sono suoi');
}

// --- GUARDARE MEGLIO: il tiro viaggia dentro il comando
//
// E' la parte che stanotte ha fatto piu' danni, e la ragione e' che il tiro
// stava in mezzo: il telefono chiedeva, chi arbitra eseguiva, la prova si
// sospendeva. Qui chi tira e' chi manda, e il dado arriva col comando.
{
  const conApp = EP.luoghi.find((l) => (l.approfondimenti || []).length && (l.aperto && !l.chiave));
  const conAppQualsiasi = conApp || EP.luoghi.find((l) => (l.approfondimenti || []).length);
  const TIPO = conAppQualsiasi.approfondimenti[0].tipo;
  const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);

  const dentro = () => {
    const p = partita({ luogoAperto: conAppQualsiasi.n, visitati: [conAppQualsiasi.n] });
    p.party = [IDONEO.nome, NINO];
    return p;
  };
  const cmd = (over) => ({ tipo: 'approfondisci', tipoApp: TIPO, luogo: conAppQualsiasi.n,
                           eroe: IDONEO.nome, ...over });

  // 12 sul dado: riuscita certa. 2: fallita certa.
  const bene = fai(dentro(), cmd({ tiri: [[6, 6]] }));
  ok(!bene.rifiuto, `si guarda meglio (${bene.rifiuto && bene.rifiuto.motivo})`);
  ok(ind(bene).approfondimentiLetti.some((x) => x.tipo === TIPO), 'e quel che si coglie si segna');
  ok(bene.eventi.some((e) => e.tipo === 'tiro' && e.ok), 'il tiro sta negli eventi, con l’esito');
  ok(ind(bene).carta && /colto/.test(ind(bene).carta.esito),
     'e la carta da leggere insieme la scrive il MOTORE, non la vista');
  const usate = ind(bene).caricheUsate[IDONEO.nome] || {};
  ok((usate[TIPO] || usate.jolly) >= 1, 'la carica si spende solo riuscendo');

  const male = fai(dentro(), cmd({ tiri: [[1, 1]] }));
  ok(ind(male).scenaChiusa === true, 'fallendo, qui non si tenta più: si esce e si torna');
  ok(!(ind(male).caricheUsate[IDONEO.nome] || {})[TIPO],
     'e la carica NON si spende: si paga l’ora, non la risorsa');
  const ancora = fai(male.stato, cmd({ tiri: [[6, 6]] }));
  ok(ancora.rifiuto && /uscite/i.test(ancora.rifiuto.motivo), 'e il chiavistello tiene');

  // IL SECONDO FIATO rifa' QUEL tiro: rialza il chiavistello appena scattato,
  // una volta a episodio. E' una regola, e sta nel motore — tenerla nella vista
  // voleva dire mandare il comando su uno stato che lo rifiutava.
  const fiato = fai(male.stato, cmd({ tiri: [[6, 6]], fiato: true }));
  ok(!fiato.rifiuto && !ind(fiato).scenaChiusa, 'col Secondo Fiato si ritenta');
  ok(ind(fiato).approfondimentiLetti.length === 1, 'e stavolta si coglie');
  ok(fiato.stato.fiatoUsato[IDONEO.nome] === true, 'e il fiato è speso');
  const due = fai(fiato.stato, cmd({ tiri: [[6, 6]], fiato: true }));
  ok(due.rifiuto && /fiato/i.test(due.rifiuto.motivo), 'una volta sola a episodio');

  // solo chi ha l'abilita' giusta
  const altro = COMUNE.eroi.find((e) => !((e.cariche || {})[TIPO] > 0) && e.nome !== IDONEO.nome);
  const p = dentro(); p.party = [IDONEO.nome, altro.nome];
  const no = fai(p, cmd({ eroe: altro.nome, tiri: [[6, 6]] }));
  ok(no.rifiuto && /non può leggere/i.test(no.rifiuto.motivo),
     `una ${TIPO} la legge chi ha l’abilità giusta`);

  // e non si guarda meglio da fuori
  const fuori = partita();
  fuori.party = [IDONEO.nome, NINO];
  const f = fai(fuori, cmd({ tiri: [[6, 6]] }));
  ok(f.rifiuto && /dentro/i.test(f.rifiuto.motivo), 'e nemmeno stando per strada');
}

// --- L'AIUTO PROFANO: l'occasione UNA del luogo
{
  const l = EP.luoghi.find((x) => (x.approfondimenti || []).length);
  const p = partita({ luogoAperto: l.n, visitati: [l.n] });
  const cmd = { tipo: 'aiuto-profano', luogo: l.n, eroe: p.party[0],
                tipoApp: l.approfondimenti[0].tipo, tiri: [[6, 6]] };
  const a = fai(p, cmd);
  ok(!a.rifiuto, `il dilettante può tentare (${a.rifiuto && a.rifiuto.motivo})`);
  ok(ind(a).profano[l.n] === true, 'e l’occasione del luogo è spesa');
  // e la seconda volta non e' un errore: e' una scena, e il tavolo la legge
  const b = fai(a.stato, cmd);
  ok(!b.rifiuto && b.eventi.some((e) => e.tipo === 'profano-gia-speso'),
     'una volta sola qui, e lo si racconta invece di dire di no');
}

console.log(ko === 0
  ? 'test-motore-indagine: l’ora è una risorsa, e le regole stanno nel motore'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
