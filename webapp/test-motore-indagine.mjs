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

// --- I QUATTRO DONI: uno per eroe, uno per serata
//
// Sono la sola cosa dell'Indagine che si spende UNA volta e non torna. Quel che
// si prova qui non e' l'effetto — e' che il conto sia onesto: chi non ha
// l'eroe non lo usa, chi ce l'ha lo usa una volta sola, e da quando i comandi
// arrivano dai telefoni, il dono di un eroe non lo spende un altro.
{
  const conMarani = () => { const p = partita(); p.party = ['PADRE CELSO MARANI', NINO]; return p; };
  const l = EP.luoghi.find((x) => (x.approfondimenti || []).length);

  const senza = fai(partita(), { tipo: 'discernimento', voce: l.voce_mappa });
  ok(senza.rifiuto && /non è in questa squadra/i.test(senza.rifiuto.motivo),
     'un dono senza il suo eroe non si spende');

  const altrui = fai(conMarani(), { tipo: 'discernimento', voce: l.voce_mappa, eroe: NINO });
  ok(altrui.rifiuto && /è di PADRE CELSO MARANI/.test(altrui.rifiuto.motivo),
     'e nemmeno lo spende il telefono di un altro eroe');

  const a = fai(conMarani(), { tipo: 'discernimento', voce: l.voce_mappa });
  ok(!a.rifiuto && a.eventi[0].ancora === true, 'Marani sente quel che il luogo nasconde ancora');
  ok(ind(a).visitaGratis === l.n, 'e quella visita non costerà l’ora');
  const b = fai(a.stato, { tipo: 'discernimento', voce: l.voce_mappa });
  ok(b.rifiuto && /già stato speso/i.test(b.rifiuto.motivo), 'una volta per serata, e basta');

  // il "no" e' informazione quanto il "si'", e non regala la visita
  const vuoto = EP.luoghi.find((x) => !(x.approfondimenti || []).length);
  if (vuoto) {
    const n = fai(conMarani(), { tipo: 'discernimento', voce: vuoto.voce_mappa });
    ok(n.eventi[0].ancora === false && !ind(n).visitaGratis,
       'dove non c’è nulla Marani dice no, e l’ora resta da pagare');
  }
}

// --- FONTI RISERVATE: la prossima visita, gratis
{
  const p = partita(); p.party = ['CARLA DOSTI', NINO];
  const a = fai(p, { tipo: 'fonti-riservate' });
  ok(!a.rifiuto && ind(a).fontiRiservateAttive === true, 'Carla arma il vantaggio');
  // su un luogo aperto, dichiarare E' entrare: la prossima visita e' quella.
  const v = fai(a.stato, { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(ind(v).ora === ind(a).ora, 'e la visita che segue non costa l’ora');
  ok(!ind(v).fontiRiservateAttive, 'il vantaggio si consuma');
  const pieno = fai(partita(), { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(ind(pieno).ora > 18, 'senza Carla, quella stessa visita l’ora la costa');
}

// --- OMBRA FIUTA: il numero, mai il tipo
{
  const p = partita(); p.party = ['MORA “SPILLA” FANTI', NINO];
  const l = EP.luoghi.find((x) => (x.approfondimenti || []).length);
  const a = fai(p, { tipo: 'ombra', voce: l.voce_mappa });
  ok(a.eventi[0].quanti === l.approfondimenti.length, 'il furetto torna col conto giusto');
  ok(!JSON.stringify(a.eventi).includes(l.approfondimenti[0].soggetto),
     'e non col soggetto: Ombra fiuta, non legge');
}

// --- L'ESAME DI CARBONE: muto non si paga
{
  const chiave = Object.keys(EP.esami_carbone || {})[0];
  if (chiave) {
    const p = partita({ oggetti: [chiave, 'UN COCCIO QUALUNQUE'] });
    p.party = ['FULGENZIO CARBONE', NINO];
    const muto = fai(p, { tipo: 'esame-carbone', pezzo: 'UN COCCIO QUALUNQUE' });
    ok(muto.eventi[0].tipo === 'esame-muto' && !muto.stato.carboneUsato,
       'un pezzo senza segreti non consuma l’occasione');
    const a = fai(muto.stato, { tipo: 'esame-carbone', pezzo: chiave });
    ok(a.eventi[0].testo === EP.esami_carbone[chiave], 'e il pezzo giusto parla');
    ok(a.stato.carboneUsato === true, 'ora sì che è speso');
    const b = fai(a.stato, { tipo: 'esame-carbone', pezzo: chiave });
    ok(b.rifiuto, 'una volta sola');
    const fuori = fai(p, { tipo: 'esame-carbone', pezzo: 'IL CAMPANILE' });
    ok(fuori.rifiuto && /non è fra le vostre cose/i.test(fuori.rifiuto.motivo),
       'e solo su quel che avete in mano');
  }
}

// --- IL PENDOLO: non si spreca su un buco
{
  const l = EP.luoghi.find((x) => (x.approfondimenti || []).length);
  const altro = EP.luoghi.find((x) => x.n !== l.n && (x.approfondimenti || []).length);
  const p = partita({ luogoAperto: l.n, visitati: [l.n] });
  p.party = ['SIBILLA REVE', NINO];
  const a = fai(p, { tipo: 'pendolo', luogo: l.n, eroe: 'SIBILLA REVE' });
  ok(a.eventi[0].tipo === 'colto', 'dove c’è qualcosa, il pendolo lo coglie');
  ok(ind(a).approfondimentiLetti.length === 1, 'e resta scritto');

  if (altro) {
    // svuotato il luogo, il dono indica altrove invece di sprecarsi
    const pieno = partita({ luogoAperto: l.n, visitati: [l.n],
      approfondimentiLetti: l.approfondimenti.map((x) =>
        ({ n: l.n, tipo: x.tipo, soggetto: x.soggetto })) });
    pieno.party = ['SIBILLA REVE', NINO];
    const b = fai(pieno, { tipo: 'pendolo', luogo: l.n, eroe: 'SIBILLA REVE' });
    ok(b.eventi[0].tipo === 'pendolo-indica' && b.eventi[0].luogo !== l.n,
       'e dove non c’è più niente indica un altro luogo');
    ok(!b.eventi[0].tipoApp, 'senza dire di che tipo');
    // stesso seme, stessa serata: il luogo indicato non cambia — e semi diversi
    // indicano luoghi diversi, che è quel che rende il dado un dado e non una
    // scelta finta che si rigiocherebbe uguale per sempre.
    const c = fai(pieno, { tipo: 'pendolo', luogo: l.n, eroe: 'SIBILLA REVE' });
    ok(c.eventi[0].luogo === b.eventi[0].luogo, 'e a parità di seme indica sempre lo stesso');
    const quanti = EP.luoghi.filter((x) => x.n !== l.n && (x.approfondimenti || []).length).length;
    if (quanti > 1) {
      const visti = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seme) => {
        const q = JSON.parse(JSON.stringify(pieno)); q.rng = { seme, passo: 0 };
        return fai(q, { tipo: 'pendolo', luogo: l.n, eroe: 'SIBILLA REVE' }).eventi[0].luogo;
      }));
      ok(visti.size > 1, 'ma semi diversi indicano luoghi diversi: è il caso, non una scelta finta');
    }
  }
}

// --- LA BUSTA: si apre una volta, e il conto lo fa il motore
//
// E' l'ultima cosa che l'Indagine consegna alla Spedizione, e finche' il conto
// lo faceva la vista era il conto del browser di chi arbitra: i telefoni
// leggevano un vantaggio che nessuno aveva calcolato per loro.
{
  const dom = (EP.soluzione || {}).domande || [];
  const giuste = dom.map((d) => String(d.risposta || ''));
  const p = partita({ risposte: giuste, visitati: EP.luoghi.map((l) => l.n), ora: 20 });
  const a = fai(p, { tipo: 'apri-busta' });
  ok(!a.rifiuto && ind(a).chiusa === true, 'la busta si apre e chiude la notte');
  ok(a.stato.vantaggi && a.stato.vantaggi.tier, `e lascia un vantaggio (${
    a.stato.vantaggi && a.stato.vantaggi.tier})`);
  ok(fai(a.stato, { tipo: 'apri-busta' }).rifiuto, 'e non si riapre');

  // sbagliando, il vantaggio cala e la penalita' si applica davvero
  const male = partita({ risposte: ['no', 'no', 'no', 'no'], ora: 20 });
  const b = fai(male, { tipo: 'apri-busta' });
  ok(b.stato.vantaggi.risposte.every((x) => x === false), 'le risposte sbagliate restano sbagliate');
  // La penalita' piu' comune, «si parte con 1 Canto in piu'», si prova su un
  // episodio che ce l'ha davvero: sull'Ep.1 il controllo sarebbe vuoto, e un
  // controllo vuoto e' peggio di nessun controllo.
  const EP2 = leggi('ep2');
  const conCanto = (EP2.soluzione.domande || []).some((d) => (d.penalita || {}).canto);
  ok(conCanto, 'l’Ep.2 ha una Domanda che costa un Canto (se no, questo controllo è vuoto)');
  const male2 = partita({ risposte: ['no', 'no', 'no', 'no'], ora: 20 });
  male2.episodio = 'ep2';
  const b2 = applicaIndagine(male2, { tipo: 'apri-busta' },
                             { ep: EP2, comune: COMUNE, carte: CARTE });
  ok(b2.stato.spedizione.canto > 0,
     `e la penalita’ da Domanda sbagliata parte con la spedizione, non solo stampata (canto ${
       b2.stato.spedizione.canto})`);

  // l'ultima parola e' del gruppo: correggere ricalcola tutto
  const c = fai(b.stato, { tipo: 'correggi', i: 0 });
  ok(c.stato.indagine.correzioni[0] === true, 'il gruppo può ribaltare il giudizio');
  ok(c.stato.vantaggi.risposte[0] === true, 'e il vantaggio si rifà col nuovo esito');
  ok(fai(b.stato, { tipo: 'correggi', i: 99 }).rifiuto, 'ma solo su una Domanda che esiste');
  ok(fai(partita(), { tipo: 'correggi', i: 0 }).rifiuto, 'e solo a busta aperta');
}

// --- IL REGISTRO DELLA NOTTE: gli eventi con l'ora, non la prosa
//
// Serve a tre cose che al tavolo mancavano: la riga «cos'è appena successo», la
// pagina da rileggere quando qualcuno chiede «cos'era quella cosa del mulino?»,
// e il materiale con cui a fine serata si risponde alle Domande. Si tiene il
// FATTO — la frase la compone la vista, come per tutto il resto.
{
  const p = partita();
  const a = fai(p, { tipo: 'dichiara', voce: 'una via che non esiste' });
  ok((ind(a).notte || []).length === 1, 'anche una pista fredda lascia una riga');
  ok(ind(a).notte[0].tipo === 'pista-fredda' && ind(a).notte[0].ora === 18,
     `e la riga porta l’ora in cui è successo (${JSON.stringify(ind(a).notte[0])})`);

  const b = fai(a.stato, { tipo: 'dichiara', voce: APERTO.voce_mappa });
  ok(ind(b).notte.length === 2 && ind(b).notte[1].tipo === 'entrati',
     'entrare ne lascia un’altra, in coda');
  ok(ind(b).notte[1].ora === ind(b).ora,
     'e l’ora è quella con cui la serata è andata avanti, non quella di prima');

  // il taccuino non è il registro: si scrive di continuo, e riempirlo di righe
  // «ha scritto una nota» renderebbe illeggibile la notte
  const c = fai(b.stato, { tipo: 'nota', testo: 'la chiave non torna' });
  ok(ind(c).notte.length === 2, 'gli appunti non finiscono nel registro');
  const d = fai(c.stato, { tipo: 'carta', titolo: 'x', corpo: 'y' });
  ok(ind(d).notte.length === 2, 'e nemmeno la messa in scena di quel che è già scritto');

  // UN TIRO NON E' UNA RIGA. Guardare meglio emette due eventi — il tiro e
  // quel che se n'è ricavato — e il registro deve tenere il secondo: «Elena ha
  // tirato 9» è il rumore del meccanismo, «Elena ha colto la cera nera» è la
  // notte. Senza il filtro, il registro raddoppia e diventa illeggibile.
  {
    const l = EP.luoghi.find((x) => (x.approfondimenti || []).length);
    const tipo = l.approfondimenti[0].tipo;
    const chi = COMUNE.eroi.find((e) => ((e.cariche || {})[tipo] || 0) > 0);
    const dentro = partita({ luogoAperto: l.n, visitati: [l.n] });
    dentro.party = [chi.nome, NINO];
    const prima = (dentro.indagine.notte || []).length;
    const g = fai(dentro, { tipo: 'approfondisci', luogo: l.n, tipoApp: tipo,
                            eroe: chi.nome, tiri: [[6, 6]] });
    const nuove = ind(g).notte.slice(prima);
    ok(nuove.length === 1, `guardare meglio lascia UNA riga, non due (${
      nuove.map((x) => x.tipo).join(', ')})`);
    ok(nuove[0].tipo === 'colto', 'e la riga è quel che si è colto, non il dado');
  }

  // un rifiuto non è successo, quindi non si scrive
  const no = fai(b.stato, { tipo: 'prendi-oggetto', nome: '' });
  ok(no.rifiuto && (no.stato.indagine.notte || []).length === 2,
     'un rifiuto non lascia righe: non è successo niente');
}

console.log(ko === 0
  ? 'test-motore-indagine: l’ora è una risorsa, e le regole stanno nel motore'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
