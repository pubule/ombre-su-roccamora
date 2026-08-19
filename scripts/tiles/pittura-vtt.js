// LA TESSERA VISTA DALL'ALTO, come la disegna un VTT.
//
// L'arte di oggi e' una VEDUTA IN PROSPETTIVA con l'orizzonte dentro: le pedine
// ci stanno sopra come figurine su una cartolina, e gli arredi sono
// illustrazioni isometriche ritagliate in una cornice d'oro — francobolli
// incollati su una stanza, non oggetti dentro una stanza.
//
// Qui si segue la grammatica che ogni VTT usa da vent'anni (Dungeondraft,
// Foundry, le mappe di 2-Minute Tabletop), e che la Spedizione ha gia' scelto
// per conto suo («la stanza e' il pezzo»):
//
//   1. PAVIMENTO PIASTRELLABILE visto dall'alto, non una veduta;
//   2. OGGETTI DALL'ALTO con la loro ombra, che li stacca dal pavimento;
//   3. LUCE: pozze di lanterna dove c'e' una fiamma, buio ai bordi.
//
// Il reticolo e le etichette delle porte NON si disegnano qui: l'app le
// ridisegna gia' in DOM sopra la tessera (`digitale.js`), e cuocerle nel PNG
// significava averle due volte — con quelle cotte illeggibili a schermo. Per la
// stampa servono, e per quello c'e' `--stampa`.
//
// Le materie prime sono texture CC0 di Poly Haven scaricate da
// scripts/scarica-texture.py in webapp/texture/ (con LICENZE.txt accanto).
// Nascono neutre: la palette di «notte e nebbia» gliela mette questo file —
// velatura fredda verso --tavolo #0c0e11, luce calda --nastro #e8c27a,
// saturazione bassa. Un pavimento generico diventa una banchina di Roccamora.

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const DIR_TEX = path.join(ROOT, 'webapp', 'texture');

// GLI ASSET DIPINTI VINCONO SULLE SAGOME. Se `webapp/vtt/` ha l'arredo o il
// pavimento dipinto (li porta dentro scripts/importa-vtt.py dai pacchetti
// 2-Minute Tabletop, CC BY-NC), si usa quello: e' il look dei riferimenti.
// Senza, restano la texture CC0 e la sagoma disegnata qui — cosi' una tessera
// esce comunque, e nessuna casella resta vuota all'occhio.
// QUALE LIBRERIA, lo dice l'ambiente. `webapp/vtt/` tiene Forgotten Adventures
// (CC BY-NC-SA: il ShareAlike si attacca alle tessere), `webapp/vtt-2m/` tiene
// 2-Minute Tabletop (CC BY-NC, niente ShareAlike). Le due devono stare in piedi
// insieme per confrontarle tessera per tessera, e la scelta si prende guardando.
//   OSR_VTT=webapp/vtt-2m   la libreria da usare (default: webapp/vtt)
//   OSR_MISTO=1             quel che 2M non ha lo tappa FA
//   OSR_MURI=2m|fa|casa     quale kit di muri (default: com'era, cioe' fa)
const DIR_VTT = path.join(ROOT, process.env.OSR_VTT || path.join('webapp', 'vtt'));
const DIR_FA = path.join(ROOT, 'webapp', 'vtt');
const MISTO = process.env.OSR_MISTO === '1';

// IL KIT DI MURI MODULARI (Forgotten Adventures, Modular Dungeons): pezzi di
// muro dipinti con l'ombra gia' dentro, 200px per casella. Un tratto dritto e'
// largo una casella e alto due — il muro sta nella meta' alta, l'ombra cade
// nell'altra. Ruotando il pezzo di 90/180/270 il muro va sugli altri tre lati,
// ed e' per questo che ogni pezzo si mette dentro un riquadro QUADRATO di due
// caselle: cosi' la rotazione non sposta l'ingombro e i conti restano semplici.
const DIR_MURI = path.join(ROOT, 'risorse-vtt', 'Modular_Dungeons_Tile_Set',
                           'Mapmaking', 'Tile_Sets', 'Modular_Dungeons');
const pezzoMuro = (nome) => {
  const p = path.join(DIR_MURI, `${nome}.png`);
  return fs.existsSync(p) ? pathToFileURL(p).href : null;
};
const MURI_MODULARI = fs.existsSync(DIR_MURI);

// IL MURO DIPINTO DI 2-MINUTE TABLETOP: una striscia sola, larga quanto il lato
// della tessera. Il DungeonRoomBuilder lo disegna col corso scuro in cima (la
// cima del muro) e i corsi chiari sotto (la faccia), quindi appoggiato a top:0
// guarda gia' dentro la stanza. Lo porta dentro scripts/importa-vtt.py, che lo
// ritaglia sull'alfa CON UNA SOGLIA — sotto la pietra c'e' un'ombra sfumata che
// arriva al bordo della tela, e un getbbox() normale non toglie niente.
const MURO_2M = path.join(ROOT, 'webapp', 'vtt-2m', 'muri', 'dritto.png');
// quanto spessa esce la fascia, in caselle. Alla sua proporzione naturale la
// striscia sarebbe alta 1,07 caselle e si mangerebbe una riga di gioco su
// quattro: qui si schiaccia, e la pietra schiacciata resta pietra. MANOPOLA —
// a 0,7 il davanzale chiaro del corso inferiore era largo quanto mezza casella
// e si leggeva come un ballatoio. Visto sul ritaglio 1:1, non sul mockup.
const MURO_2M_ALTEZZA = 0.55;
const QUALI_MURI = process.env.OSR_MURI
  || (fs.existsSync(MURO_2M) && (process.env.OSR_VTT || '').includes('vtt-2m') ? '2m' : 'fa');
const dipinto = (tipo, nome) => {
  const p = path.join(DIR_VTT, tipo, `${nome}.png`);
  if (fs.existsSync(p)) return pathToFileURL(p).href;
  // il MISTO: quel che la libreria scelta non ha, lo tappa Forgotten Adventures.
  // Basta un pezzo FA perche' il ShareAlike copra la tessera: e' una scelta di
  // licenza, e per questo va chiesta a voce alta invece che presa da sola.
  const f = path.join(DIR_FA, tipo, `${nome}.png`);
  return MISTO && fs.existsSync(f) ? pathToFileURL(f).href : null;
};

// LA RITINTA. Gli asset 2MT sono disegnati a mano e CHIARI — inchiostro e colore
// piatto su carta bianca — e il gioco e' scuro: senza queste tre mosse una cassa
// esce incollata sopra il pavimento, non appoggiata. FA invece nasce gia' dipinto
// scuro e non si tocca. Le tre cifre sono una TARATURA da rivedere guardando il
// render, non un risultato: sono le stesse mosse di webapp/_prova-ritinta.py.
// ------------------------------------------------------------------ LA MANO
//
// Gli artwork del gioco sono fatti con un prompt che si ripete identico su ogni
// carta e ogni tessera (PROMPT-MIDJOURNEY.md):
//
//   «1889 gaslamp gothic, oil painting, dramatic candlelight,
//    muted teal and crimson palette with gold accents, very dark and atmospheric»
//
// Le texture della libreria VTT non nascono cosi': nascono col loro colore —
// marmo verde, legno rossiccio, pietra grigia — e messe accanto agli artwork
// sembrano prese da un altro gioco. Non si possono ridipingere, ma si possono
// PORTARE NELLA STESSA MANO: si spegne il colore proprio, si vela di teal le
// ombre, si accende l'oro dove c'e' la fiamma, e si scende molto col nero.
//
// FINO A IERI I PAVIMENTI DIPINTI SALTAVANO QUESTO PASSAGGIO — `saturate(.9)
// brightness(1)`, cioe' quasi niente — «perche' hanno gia' la loro luce». Ce
// l'hanno, ma e' la luce di un'altra scatola. Le tre cifre qui sotto sono la
// manopola: girarle sposta tutta la campagna insieme, che e' il punto.
// IL CONTRASTO E' QUEL CHE FA VEDERE LA PIETRA, non la luminosita'. Abbassando
// la luce si otteneva una nebbia grigia: la fuga fra due lastre spariva e la
// navata diventava una lastra sola. Qui la texture esce CHIARA e CONTRASTATA, e
// a portarla nel buio ci pensano i veli sopra — che percio' vanno leggeri.
const MANO_PAVIMENTO = 'saturate(.38) brightness(.78) contrast(1.46)';

// ------------------------------------------------------------- DUE STILI
//
// «nebbia» e' quello del gioco: 1889 gaslamp gothic, buio, teal e cremisi, la
// pozza di lanterna. Bello a schermo, e giusto per gli artwork delle carte.
//
// «waterdeep» e' quello dei giochi da tavolo a tessere — il D&D Adventure System
// di WizKids, Castle Ravenloft, Dungeon of the Mad Mage. Serve un altro mestiere:
// la tessera sta su un tavolo, sotto la luce di una stanza, e dev'essere LEGGIBILE
// prima che atmosferica. Quindi:
//
//   - luce PIATTA: niente pozza di lanterna, niente velatura fredda, niente
//     cremisi. L'ombra drammatica su un cartoncino nasconde le caselle;
//   - tono MEDIO e non scuro: si legge a mezzo metro, di sera, in quattro;
//   - il RETICOLO E' STAMPATO nell'arte, non disegnato dall'app: al tavolo non
//     c'e' nessuna app a disegnarlo;
//   - il BORDO E' DURO: una fascia scura netta che dice dove finisce il pezzo.
//
// I due stili non si scelgono per gusto: dipende da dove si guarda la tessera.
// Sullo schermo vince nebbia, sul cartoncino vince waterdeep — e la stessa
// campagna puo' volerli tutti e due.
const STILE = process.env.OSR_STILE || 'nebbia';
const TAVOLO = STILE === 'waterdeep';
// Meno saturo di quanto verrebbe da pensare: le tessere dei giochi a tessere
// sono grigio-brune, non colorate. A saturate(.62) l'acqua della cisterna usciva
// turchese da piscina e il marmo della navata bianco da bagno.
const MANO_TAVOLO = 'saturate(.42) brightness(.96) contrast(1.16)';
const MANO_ARREDO = 'saturate(.44) brightness(.84) contrast(1.06)';
const MANO_ARREDO_TAVOLO = 'saturate(.75) brightness(1.05) contrast(1.06)';

const RITINTA_2M = 'saturate(.5) brightness(.68) contrast(1.08)';
const daRitingere = (url) => (url || '').includes('/vtt-2m/');

// LE VARIANTI. Le casse compaiono 172 volte in tutta la campagna: con un
// disegno solo si ripetono come carta da parati. L'importatore ne porta tre
// (`casse`, `casse-2`, `casse-3`) e qui se ne sceglie una IN MODO STABILE dalla
// posizione della casella: la stessa tessera esce sempre identica — se cambiasse
// a ogni generazione, il cartoncino stampato e lo schermo direbbero due cose.
function dipintoVario(chiave, col, row) {
  const tutte = [dipinto('arredi', chiave),
                 dipinto('arredi', `${chiave}-2`),
                 dipinto('arredi', `${chiave}-3`)].filter(Boolean);
  if (!tutte.length) return null;
  return tutte[(col * 7 + row * 3) % tutte.length];
}

// LE VARIANTI DEL PAVIMENTO. Due stanze dello stesso tipo accostate non devono
// avere lo stesso identico pavimento — e' la carta da parati che gia' si e'
// evitata per le casse. Se ne importano tre e qui se ne sceglie una IN MODO
// STABILE dal nome della tessera: la stessa stanza esce sempre uguale, o il
// cartoncino stampato e lo schermo direbbero due cose.
function pavimentoVario(chiave, tile) {
  const tutte = [dipinto('pavimenti', chiave),
                 dipinto('pavimenti', `${chiave}-2`),
                 dipinto('pavimenti', `${chiave}-3`)].filter(Boolean);
  if (!tutte.length) return null;
  const testo = `${tile.id || ''}${tile.nome || ''}`;
  let n = 0;
  for (let i = 0; i < testo.length; i++) n = (n * 31 + testo.charCodeAt(i)) % 9973;
  return tutte[n % tutte.length];
}

const tex = (nome) => {
  const p = path.join(DIR_TEX, `${nome}.jpg`);
  if (!fs.existsSync(p)) {
    throw new Error(`manca la texture ${nome}.jpg — lancia: python scripts/scarica-texture.py`);
  }
  return pathToFileURL(p).href;
};

// IL PAVIMENTO LO DICE IL NOME DELLA STANZA. I dati non hanno un campo
// «ambiente» e non glielo si aggiunge per una scelta di pittura: il nome della
// tessera ce l'ha gia' dentro — «banchina», «deposito», «cripta» — ed e' lo
// stesso nome che il tavolo sente leggere ad alta voce.
// L'ORDINE E' UNA REGOLA, non un caso: «Sala delle Casse» e' un magazzino, e
// se la riga dei salotti venisse prima si ritroverebbe il parquet.
// CHE COSA C'E' FUORI DALLA STANZA, dentro la stessa tessera.
//
// Le caselle fuori sagoma erano nero piatto: come se li' non ci fosse niente. Ma
// una banchina non finisce nel nulla, finisce NELL'ACQUA; sotto un ballatoio non
// c'e' il vuoto astratto, c'e' la strada tre piani piu' giu'; un giardino
// murato ha l'erba anche oltre il vialetto. Sono due ambienti nella stessa
// tessera — uno percorribile e uno no — ed e' quel che il molo chiede.
//
// La regola e' la solita: la dice il nome. Fuori da un molo c'e' acqua, fuori da
// un tetto c'e' il vuoto, fuori da una galleria c'e' la roccia viva.
const FUORI_DI = [
  [/molo|banchin|imbarcader|fondament|riva|barc|approdo|dogana|squero|pontile|passerell|ponte|ponticell|chiatt|darsena|canale|cistern|pozzo|confluenza|lavatoio|roggia|marea|vasca/i, 'acqua'],
  [/fogna|melma|scolo|chiusin|cloaca|vene|sentina/i, 'melma'],
  [/giardino|orto|serra|prato|roseto|verziere/i, 'erba'],
  [/grotta|caverna|galler|cunicol|scavo|intercapedine|pietra viva|discesa|budello/i, 'roccia'],
  [/cortile|terrapien|piazzal|mercato|calle|vicolo|campiello|sottoportico/i, 'terra'],
  // tetti, ballatoi, logge, guglie: sotto c'e' il vuoto, e il vuoto resta nero
  [/tetto|guglia|gronda|abbaino|campanil|torre|comignol|coppi|terrazza|ballatoio|loggia|camminament|lucernario/i, 'vuoto'],
];

function fuoriDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of FUORI_DI) if (re.test(nome)) return quale;
  return 'vuoto';
}

const PAVIMENTI = [
  // ------------------------------------------------------------- L'ACQUA
  // quel che si CAMMINA sopra l'acqua e' assi: il pavimento e' quello che i
  // piedi toccano, non quello che c'e' sotto
  [/passerell|ponte|ponticell|pontile|camminament|ballatoio|loggia|scalinata|scala|gradin/i, 'assi'],
  [/canale|acqua|pozzo|cistern|confluenza|darsena|vasca|chiatt|roggia|marea|lavatoio/i, 'acqua'],
  // la melma e' l'acqua che non scorre: fogne, scoli, le vene sotto la citta'
  [/fogna|melma|scolo|chiusin|cloaca|vene|budello|sentina|palude/i, 'melma'],
  [/molo|banchin|imbarcader|fondament|riva|barc|approdo|dogana|squero/i, 'assi'],
  // ------------------------------------------------------------- I TETTI
  [/tetto|guglia|gronda|abbaino|campanil|torre|comignol|coppi|terrazza|lucernario/i, 'tetti'],
  [/tettoia|baracc|capannone|rimessa/i, 'lamiera'],
  // -------------------------------------------------------------- IL SACRO
  [/chiesa|navata|sagrato|cappell|organo|coro|sacrest|capitolo|abside/i, 'navata'],
  [/cript|catacomb|ossari|tomb|sepolt|cimitero|reliqui/i, 'pietra'],
  // --------------------------------------------------------- IL SOTTOSUOLO
  [/grotta|caverna|scavo|galler|cunicol|intercapedine|sottoscala|pietra viva|discesa/i, 'roccia'],
  // -------------------------------------------------------------- IL LAVORO
  // il fuoco sta sul mattone, il ferro sulla lamiera, la merce sul tavolato
  [/fonder|forgia|crogiol|forni|fucina|carbone|calcara|bronzo/i, 'mattoni'],
  [/officina|contrappes|argano|staffe|scorie|ferriera|macchinar|canne/i, 'metallo'],
  [/magazzin|deposit|quinta|carico|stiva|scene|casse/i, 'tavolato'],
  [/molino|macine|torchio|essiccatoio|stracci|granaio|stalla|fienile|paglia/i, 'paglia'],
  // ------------------------------------------------------- LA CITTA' APERTA
  [/giardino|orto|serra|verziere|prato|roseto/i, 'erba'],
  [/piazzal|mercato|cantiere|ponteggi|sagrato di/i, 'ghiaia'],
  [/cortile|terrapien|cantina|fossa|vigna/i, 'terra'],
  [/calle|vicolo|salita|sottoportico|selciato|strada|fondamenta strett|campiello/i, 'lastricato'],
  // -------------------------------------------------------------- IL CHIUSO
  // dove si sta seduti c'e' il tappeto, dove si entra il mosaico, dove si
  // lavora la mattonella
  [/salone|salotto|biblioteca|studio|cimeli|ritratti|assemblea|lettura|attico|camera di|stanza di/i, 'tappeto'],
  [/atrio|scalone|anticamera|guardaroba|ingresso|vestibolo|soglia/i, 'mosaico'],
  [/ufficio|stanzin|archivio|scrittoio|sala|tinello|camer|piano|corridoio|stanza|cella|catalogazione|interrogator/i, 'mattonelle'],
];

// `scala` = QUANTE CASELLE COPRE UNA PIASTRELLA DI TEXTURE.
//
// Stava fra 0,9 e 2,4, cioe' una piastrella per casella o poco piu'. Ma le
// texture della libreria sono disegnate per un reticolo da ~140 px per casella:
// una da 1000 px e' pensata per coprirne SETTE. Stringendola a una si zoomava
// dentro — la fuga fra due lastre diventava larga un dito, e su una stanza da
// dodici caselle il motivo si ripeteva dieci volte: carta da parati.
//
// Adesso una piastrella copre 4-9 caselle secondo cosa raffigura: le assi
// corrono lunghe, l'acqua non ha una scala di riferimento e puo' andare larga,
// un tappeto e' un oggetto solo e non dovrebbe ripetersi affatto. Si paga in
// nitidezza — 6 caselle a 300 px l'una sono 1800 px chiesti a un file da 1000 —
// ma una texture un filo morbida si legge come pietra, una nitida e ripetuta
// dieci volte si legge come parati.
//
// OGNI TEXTURE NASCE CON LA SUA LUCE. `dark_wooden_planks` e' quasi nera,
// `cobblestone_floor_08` ha le pietre minute: una taratura sola per tutte dava
// un molo nero e una cripta a mosaico. Qui ognuna dichiara quanto schiarirla e
// quanto ingrandirne la piastrella (in caselle).
const TARATURA = {
  assi:       { luce: 1.25, scala: 6.5 },
  tavolato:   { luce: 1.2,  scala: 6.0 },
  lastricato: { luce: 1.0,  scala: 5.0 },
  pietra:     { luce: 1.05, scala: 5.0 },
  mattonelle: { luce: 1.15, scala: 4.0 },
  mosaico:    { luce: 1.1,  scala: 4.5 },
  // `mano`: quanto SCURIRE questa texture dipinta prima dei veli. Serviva quando
  // la libreria arrivava esposta a caso — il marmo bianco accanto al marmo nero
  // sotto lo stesso nome. Da quando `importa-fa.py` porta ogni pavimento alla
  // stessa luminanza media, nessuna ne ha piu' bisogno: resta la manopola, vuota.
  navata:     { luce: 0.95, scala: 5.5 },
  mattoni:    { luce: 1.05, scala: 4.5 },
  metallo:    { luce: 1.0,  scala: 5.0 },
  lamiera:    { luce: 1.0,  scala: 5.0 },
  acqua:      { luce: 1.0,  scala: 8.0 },
  melma:      { luce: 0.95, scala: 7.0 },
  terra:      { luce: 1.1,  scala: 6.0 },
  ghiaia:     { luce: 1.05, scala: 5.5 },
  roccia:     { luce: 1.15, scala: 6.5 },
  erba:       { luce: 1.0,  scala: 6.0 },
  tappeto:    { luce: 1.1,  scala: 9.0 },   // un tappeto non si ripete tre volte
  paglia:     { luce: 1.15, scala: 5.0 },
  tetti:      { luce: 1.0,  scala: 4.0 },
};

// LO SPORCO DI OGNI POSTO. Le macchie larghe sul pavimento erano tre pozze nere
// uguali per tutti: una cripta e una fonderia si sporcano in modo diverso, e la
// macchia e' meta' di quel che fa sembrare un pavimento un pavimento vissuto.
const SPORCO = {
  acqua:   ['rgba(20,60,60,.55)', 'rgba(10,30,36,.5)'],
  melma:   ['rgba(38,44,20,.6)', 'rgba(20,26,12,.55)'],
  mattoni: ['rgba(18,10,6,.62)', 'rgba(40,18,6,.35)'],       // fuliggine
  metallo: ['rgba(46,22,10,.5)', 'rgba(12,14,16,.6)'],       // ruggine
  navata:  ['rgba(24,24,20,.42)', 'rgba(60,56,44,.28)'],     // polvere
  pietra:  ['rgba(16,16,18,.55)', 'rgba(36,34,28,.3)'],
  erba:    ['rgba(16,26,14,.5)', 'rgba(8,16,10,.45)'],
  tappeto: ['rgba(24,10,10,.45)', 'rgba(10,8,8,.4)'],
  paglia:  ['rgba(38,30,12,.5)', 'rgba(18,14,6,.45)'],
};
const SPORCO_BASE = ['rgba(0,0,0,.55)', 'rgba(10,20,22,.5)'];

function pavimentoDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of PAVIMENTI) if (re.test(nome)) return quale;
  return 'lastricato';
}

// ---------------------------------------------------------------- gli arredi
//
// Ogni arredo e' una SAGOMA vista da sopra, riempita della sua materia e
// staccata dal pavimento dalla propria ombra. Niente cornice: l'oggetto occupa
// la casella che il dato gli assegna, e basta.
//
// Si disegnano qui e non si scaricano gia' fatti per tre ragioni pratiche:
// stanno esattamente nella casella dichiarata, seguono la palette senza
// ritocchi, e un arredo nuovo non aspetta che qualcuno generi un'illustrazione
// — oggi `armadio` e `toeletta` non hanno il PNG e le loro caselle sono
// INVISIBILI, bloccate dalle regole ma libere all'occhio.
//
// `w`/`h` sono frazioni della cella: un oggetto non riempie mai il quadrato
// fino al bordo, o la stanza diventa un mosaico di scatole.

const OMBRA = '0 18px 34px rgba(0,0,0,.62), 0 3px 8px rgba(0,0,0,.5)';

// assi di legno ripetute, per casse e mobili
const assi = (n = 4) =>
  `repeating-linear-gradient(90deg, rgba(0,0,0,.5) 0 4px, rgba(255,255,255,.08) 4px ${Math.round(100 / n)}%)`;

const ARREDI = {
  // il molo: bitte d'ormeggio e la cima avvolta. Vista da sopra una bitta e'
  // un cerchio di ferro, la cima e' una spirale.
  molo: ({ c }) => `
    <div class="og" style="width:${c * 0.5}px;height:${c * 0.5}px;border-radius:50%;
         background:conic-gradient(from 20deg, #6f5c3f, #4a3c28 35%, #7a664a 62%, #4a3c28 88%, #6f5c3f);
         box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.34}px;height:${c * 0.34}px;border-radius:50%;
         background:#0d0b09; box-shadow:inset 0 0 ${c * 0.04}px rgba(0,0,0,.9)"></div>
    <div class="og" style="width:${c * 0.26}px;height:${c * 0.26}px;border-radius:50%;
         background:radial-gradient(circle at 38% 32%, #6a6258, #241f19 72%);
         box-shadow:0 ${c * 0.02}px ${c * 0.05}px rgba(0,0,0,.7)"></div>
    <div class="og" style="width:${c * 0.62}px;height:${c * 0.4}px;border-radius:50%;
         transform:translate(-38%,-42%) rotate(-14deg);
         border:${Math.round(c * 0.03)}px solid #7d6947; opacity:.85;
         box-shadow:0 ${c * 0.015}px ${c * 0.04}px rgba(0,0,0,.6)"></div>`,

  // casse accatastate: quadrati di legno con le cantonate di ferro, ruotati
  // di poco l'uno rispetto all'altro — impilate a mano, non a squadra
  casse: ({ c }) => [0, 1, 2].map((i) => {
    const lato = c * (0.46 - i * 0.05);
    const dx = [-0.13, 0.14, 0.02][i] * c;
    const dy = [0.12, 0.06, -0.14][i] * c;
    const rot = [-6, 5, 2][i];
    return `<div class="og" style="width:${lato}px;height:${lato}px;
      transform:translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg);
      background-image:${assi(4)}, url('${tex('legno')}');
      background-size:auto, ${lato}px ${lato}px; border-radius:${c * 0.012}px;
      box-shadow:${OMBRA}, inset 0 0 0 ${Math.round(c * 0.018)}px rgba(38,28,18,.85)"></div>`;
  }).join(''),

  // candele: cera e fiamma. Sono anche una SORGENTE DI LUCE (vedi luciDi).
  candele: ({ c }) => [[-0.12, -0.08, 0.075], [0.1, 0.02, 0.06], [-0.02, 0.13, 0.05]]
    .map(([dx, dy, r]) => `
      <div class="og" style="width:${c * r}px;height:${c * r}px;border-radius:50%;
        transform:translate(calc(-50% + ${dx * c}px), calc(-50% + ${dy * c}px));
        background:radial-gradient(circle at 50% 50%, #fff3c4 0 22%, #e8c27a 30%, #6b5836 70%);
        box-shadow:0 0 ${c * 0.16}px ${c * 0.05}px rgba(232,194,122,.55), ${OMBRA}"></div>`).join(''),

  // scrivania: piano di legno, due fogli, il calamaio
  scrivania: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.78}px;height:${h * 0.56}px;
      background-image:${assi(6)}, url('${tex('legno')}'); background-size:auto, ${c * 0.5}px ${c * 0.5}px;
      border-radius:${c * 0.02}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.17}px;height:${c * 0.23}px;transform:translate(-70%,-40%) rotate(-7deg);
      background:#d9cfae; box-shadow:0 4px 10px rgba(0,0,0,.5)"></div>
    <div class="og" style="width:${c * 0.16}px;height:${c * 0.21}px;transform:translate(-20%,-55%) rotate(4deg);
      background:#cdc29d; box-shadow:0 4px 10px rgba(0,0,0,.5)"></div>
    <div class="og" style="width:${c * 0.07}px;height:${c * 0.07}px;border-radius:50%;
      transform:translate(120%,10%); background:radial-gradient(circle at 40% 35%, #2b3a3f, #0d1416);
      box-shadow:0 3px 8px rgba(0,0,0,.6)"></div>`,

  // branda: telaio, tela, la coperta ripiegata ai piedi
  branda: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.5}px;height:${h * 0.82}px;
      background-image:linear-gradient(rgba(30,28,24,.62), rgba(18,16,14,.72)), url('${tex('tela')}');
      background-size:auto, ${c * 0.6}px ${c * 0.6}px; border-radius:${c * 0.02}px;
      box-shadow:${OMBRA}, inset 0 0 0 ${Math.round(c * 0.012)}px rgba(40,32,24,.8)"></div>
    <div class="og" style="width:${w * 0.46}px;height:${h * 0.17}px;transform:translate(-50%,-190%);
      background:#8d8578; opacity:.75; border-radius:${c * 0.02}px"></div>
    <div class="og" style="width:${w * 0.48}px;height:${h * 0.22}px;transform:translate(-50%,120%);
      background:repeating-linear-gradient(90deg, #6b5744 0 ${Math.round(c*0.02)}px, #4a3b2c ${Math.round(c*0.02)}px ${Math.round(c*0.045)}px);
      border-radius:${c * 0.01}px;
      box-shadow:0 8px 16px rgba(0,0,0,.5)"></div>`,

  // scala: i gradini si leggono come bande, e la luce cala scendendo
  scala: ({ w, h }) => `
    <div class="og" style="width:${w * 0.86}px;height:${h * 0.86}px;
      background-image:repeating-linear-gradient(180deg, rgba(255,255,255,.07) 0 ${h * 0.055}px,
        rgba(0,0,0,.42) ${h * 0.055}px ${h * 0.115}px), url('${tex('muro')}');
      background-size:auto, ${w * 0.5}px ${w * 0.5}px;
      box-shadow:${OMBRA}, inset 0 -${h * 0.3}px ${h * 0.35}px rgba(0,0,0,.75)"></div>`,

  // altare: lastra di pietra, il cerchio inciso, due candele agli angoli
  altare: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.72}px;height:${h * 0.72}px;
      background-image:linear-gradient(rgba(30,28,26,.25), rgba(10,9,8,.45)), url('${tex('muro')}');
      background-size:auto, ${c * 0.7}px ${c * 0.7}px; border-radius:${c * 0.015}px;
      box-shadow:${OMBRA}, inset 0 0 ${c * 0.12}px rgba(0,0,0,.7)"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.4}px;height:${Math.min(w, h) * 0.4}px;border-radius:50%;
      border:${Math.round(c * 0.012)}px solid rgba(232,194,122,.5); box-shadow:0 0 ${c * 0.1}px rgba(232,194,122,.25)"></div>
    ${[[-0.26, -0.26], [0.26, -0.26]].map(([dx, dy]) => `
      <div class="og" style="width:${c * 0.07}px;height:${c * 0.07}px;border-radius:50%;
        transform:translate(calc(-50% + ${dx * w}px), calc(-50% + ${dy * h}px));
        background:radial-gradient(circle, #fff3c4 0 25%, #e8c27a 35%, #6b5836 75%);
        box-shadow:0 0 ${c * 0.14}px ${c * 0.04}px rgba(232,194,122,.5)"></div>`).join('')}`,

  // cella: le sbarre. Da sopra sono ferro che attraversa la casella.
  cella: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.92}px;height:${h * 0.92}px;
      background:linear-gradient(rgba(4,4,6,.55), rgba(4,4,6,.72));"></div>
    <div class="og" style="width:${w * 0.92}px;height:${h * 0.92}px;
      background-image:repeating-linear-gradient(90deg, rgba(120,120,128,.85) 0 ${c * 0.022}px,
        transparent ${c * 0.022}px ${c * 0.13}px), url('${tex('ferro')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; background-blend-mode:multiply;
      box-shadow:${OMBRA}"></div>`,

  // forma da cera: bacile tondo dentro un telaio quadro
  forma: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.66}px;height:${h * 0.66}px;
      background-image:linear-gradient(rgba(20,18,16,.4), rgba(10,9,8,.55)), url('${tex('legno')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.42}px;height:${Math.min(w, h) * 0.42}px;border-radius:50%;
      background:radial-gradient(circle at 42% 38%, #cbb383, #7a6540 60%, #3a2f1e);
      box-shadow:inset 0 0 ${c * 0.06}px rgba(0,0,0,.7), 0 6px 14px rgba(0,0,0,.5)"></div>`,

  // scorie: mucchi irregolari, ferro arrugginito e pietrisco
  scorie: ({ c, w, h }) => [[-0.16, 0.1, 0.34], [0.14, -0.08, 0.4], [0.04, 0.2, 0.26]]
    .map(([dx, dy, s]) => `
      <div class="og" style="width:${Math.min(w, h) * s}px;height:${Math.min(w, h) * s * 0.8}px;
        transform:translate(calc(-50% + ${dx * w}px), calc(-50% + ${dy * h}px)) rotate(${dx * 90}deg);
        border-radius:48% 52% 40% 60% / 55% 45% 55% 45%;
        background-image:linear-gradient(rgba(24,16,10,.35), rgba(10,7,5,.6)), url('${tex('ruggine')}');
        background-size:auto, ${c * 0.4}px ${c * 0.4}px; box-shadow:${OMBRA}"></div>`).join(''),

  // crogiolo: il bacile del metallo fuso — la sorgente di luce piu' forte
  crogiolo: ({ c, w, h }) => `
    <div class="og" style="width:${Math.min(w, h) * 0.62}px;height:${Math.min(w, h) * 0.62}px;border-radius:50%;
      background-image:linear-gradient(rgba(20,14,10,.4), rgba(10,7,5,.6)), url('${tex('ferro')}');
      background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.min(w, h) * 0.4}px;height:${Math.min(w, h) * 0.4}px;border-radius:50%;
      background:radial-gradient(circle at 50% 45%, #ffe9b0 0 18%, #e8934a 45%, #7a2f14 85%);
      box-shadow:0 0 ${c * 0.3}px ${c * 0.1}px rgba(232,147,74,.55)"></div>`,

  // stufa: ghisa, e lo sportello acceso
  stufa: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.6}px;height:${h * 0.6}px;border-radius:${c * 0.06}px;
      background-image:linear-gradient(rgba(16,16,18,.45), rgba(8,8,10,.62)), url('${tex('ferro')}');
      background-size:auto, ${c * 0.45}px ${c * 0.45}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${c * 0.14}px;height:${c * 0.1}px;border-radius:${c * 0.02}px;
      transform:translate(-50%, 60%); background:radial-gradient(ellipse at 50% 50%, #ffd08a, #b8501c);
      box-shadow:0 0 ${c * 0.22}px ${c * 0.07}px rgba(232,147,74,.5)"></div>`,

  // armadio: due ante e le maniglie (oggi INVISIBILE: manca il PNG)
  armadio: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.74}px;height:${h * 0.5}px;
      background-image:${assi(3)}, url('${tex('legno')}'); background-size:auto, ${c * 0.55}px ${c * 0.55}px;
      border-radius:${c * 0.012}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${Math.round(c * 0.008)}px;height:${h * 0.5}px;background:rgba(0,0,0,.55)"></div>
    ${[-1, 1].map((s) => `<div class="og" style="width:${c * 0.03}px;height:${c * 0.03}px;border-radius:50%;
      transform:translate(calc(-50% + ${s * c * 0.045}px), -50%); background:#c9a86a"></div>`).join('')}`,

  // toeletta: il mobile e lo specchio ovale
  toeletta: ({ c, w, h }) => `
    <div class="og" style="width:${w * 0.7}px;height:${h * 0.42}px;
      background-image:${assi(5)}, url('${tex('legno')}'); background-size:auto, ${c * 0.5}px ${c * 0.5}px;
      border-radius:${c * 0.012}px; box-shadow:${OMBRA}"></div>
    <div class="og" style="width:${w * 0.34}px;height:${h * 0.22}px;border-radius:50%;
      transform:translate(-50%,-120%);
      background:linear-gradient(140deg, rgba(190,205,210,.75), rgba(60,70,78,.85));
      box-shadow:0 0 ${c * 0.1}px rgba(200,215,220,.25), ${OMBRA}"></div>`,
};

// le fiamme accese: dove c'e' una di queste, la stanza ha una pozza di luce
const FUOCHI = { candele: '#e8c27a', crogiolo: '#e8934a', stufa: '#e8934a', altare: '#e8c27a' };

// ------------------------------------------------------------------ la pagina
//
// `gruppi` arriva gia' fuso da `groupArredi()` del generatore: un arredo che
// occupa piu' celle e' UN oggetto piu' grande, non lo stesso oggetto ripetuto.
function htmlVtt(tile, S, { gruppi, porte, stampa = false, celle = null, cornice = 0, lato = 4, bordoAperto = false, decori = [] }) {
  // LA CORNICE E' MEZZO MURO, non un muro intero.
  //
  // Due tessere accostate hanno ciascuna la propria cornice: se ognuna portasse
  // un muro intero, fra due stanze ce ne sarebbero DUE, e in mezzo un canale
  // scuro spesso quanto mezza casella. Al tavolo due stanze confinanti dividono
  // UNA parete. Quindi ogni tessera ne disegna la meta', e accostandole le due
  // meta' fanno il muro — come i pezzi di un tramezzo, non come due case che si
  // toccano.
  //
  // LA CORNICE: il muro sta FUORI dalle caselle giocabili.
  //
  // Fino a ieri il pezzo di muro veniva appoggiato SOPRA la prima casella del
  // bordo e ne mangiava meta' (misurato: la pietra del kit occupa dal 9% al 60%
  // della casella). Una pedina posata li' sembra dentro il muro, e le caselle
  // giocabili vere erano meno di sedici. Con `cornice > 0` la tessera si allarga
  // di una fascia per lato e il reticolo 4x4 resta tutto pavimento.
  //
  //   S = 4 caselle + 2 cornici   ->   c = S / (4 + 2 * cornice)
  //
  // A cornice 0 il conto torna a S/4 e non cambia un pixel: e' cosi' che le
  // tessere gia' stampate restano quelle di prima.
  // QUANTE CASELLE PER LATO. Quattro e' quel che c'e' sempre stato; con cinque o
  // sei la stanza ha spazio per girarci attorno a un arredo invece di doverlo
  // scavalcare. Il conto e' lo stesso, il numero e' una manopola.
  const L = lato;
  const c = S / (L + 2 * cornice);
  const M = c * cornice;          // lo spessore del muro, fuori dal reticolo
  const off = M;                  // dove comincia la prima casella
  // LA SAGOMA (scripts/tiles/sagome.js). `celle` sono le caselle VIVE: quel che
  // non c'e' dentro non e' pavimento, e il muro ci gira attorno. Senza il campo,
  // la tessera resta il quadrato pieno di sempre — e' cosi' che il vecchio
  // comportamento resta intatto senza un ramo apposta.
  const vive = new Set((celle || Array.from({ length: L * L },
    (_, i) => [i % L, (i / L) | 0])).map(([x, y]) => x + ',' + y));
  const viva = (x, y) => vive.has(x + ',' + y);
  const pav = pavimentoDi(tile);
  const tar = TARATURA[pav] || { luce: 1, scala: 1 };
  const sporco = SPORCO[pav] || SPORCO_BASE;
  // LO SFASAMENTO. Due stanze dello stesso ambiente, anche con varianti diverse,
  // mostravano il ritaglio nello stesso punto: accostate si vedeva la ripetizione
  // saltare da una tessera all'altra. Qui ognuna parte da un punto suo, preso dal
  // nome — stabile, quindi la stessa stanza esce sempre identica.
  const sfasa = (() => {
    const testo = `${tile.id || ''}${tile.nome || ''}`;
    let n = 0;
    for (let i = 0; i < testo.length; i++) n = (n * 131 + testo.charCodeAt(i)) % 9973;
    // lo sfasamento deve poter arrivare a TUTTA la piastrella: su una da otto
    // caselle un salto di mille pixel e' un decimo, e due stanze d'acqua
    // finivano per mostrare la stessa onda nello stesso posto
    const passo = c * tar.scala;
    return [((n % 997) / 997) * passo, (((n * 7) % 991) / 991) * passo];
  })();
  const manoBase = TAVOLO ? MANO_TAVOLO : MANO_PAVIMENTO;
  const mano = manoBase.replace(TAVOLO ? 'brightness(.96)' : 'brightness(.78)',
    `brightness(${((TAVOLO ? 0.96 : 0.78) * (tar.mano || 1)).toFixed(2)})`);
  const pavDipinto = pavimentoVario(pav, tile);
  // L'ACQUA NON HA UNA TEXTURE. Poly Haven fa superfici, non canali: finche'
  // non arriva quella dipinta del pacchetto VTT, il canale lo si dipinge qui —
  // buio verdastro con le spire lente della corrente.
  const acquaDipintaInCasa = pav === 'acqua' && !pavDipinto;
  const fondo = acquaDipintaInCasa
    ? `radial-gradient(60% 42% at 30% 26%, rgba(60,120,120,.30), transparent 70%),
       radial-gradient(50% 38% at 72% 68%, rgba(40,96,104,.28), transparent 72%),
       repeating-linear-gradient(102deg, rgba(120,190,190,.055) 0 3px, rgba(8,20,24,0) 3px 22px),
       repeating-linear-gradient(-8deg, rgba(90,160,170,.05) 0 2px, rgba(8,20,24,0) 2px 31px),
       linear-gradient(160deg, #0d2226, #061014)`
    : `url('${pavDipinto || tex(pav)}')`;

  // LE CASELLE FUORI SAGOMA non sono un buco: sono l'altro ambiente della
  // tessera. Si dipingono con la loro texture — acqua attorno al molo, roccia
  // attorno alla galleria — e si scuriscono, perche' li' non ci si va: la
  // differenza di luce e' quel che dice a chi gioca dove puo' mettere la pedina.
  const fuoriAmb = fuoriDi(tile);
  // in modalita' caverna la massa dev'essere PIATTA: la texture sopravviveva allo
  // style inline, e blur+contrast su un bruno texturizzato faceva rocce al neon.
  // Il colore lo mette il velo dopo, quando la forma e' gia' decisa.
  const fuoriTex = (fuoriAmb === 'vuoto' || bordoAperto) ? null : pavimentoVario(fuoriAmb, tile);
  const tarF = TARATURA[fuoriAmb] || { scala: 5 };
  // LA ROCCIA NON HA LA FORMA DELLE CASELLE. Disegnata cella per cella esce una
  // scacchiera di quadretti; nelle tessere di riferimento e' una massa organica
  // che il reticolo lo ignora. Il rimedio e' vecchio come il CSS: si sfoca il
  // gruppo e si rialza il contrasto — i quadrati si fondono e i bordi tornano
  // netti, ma curvi. Il reticolo resta sotto e continua a contarsi.
  const morbida = bordoAperto;
  const fuori = Array.from({ length: L * L }, (_, i) => [i % L, (i / L) | 0])
    .filter(([x, y]) => !viva(x, y))
    .map(([x, y]) => `<div class="fuori" style="left:${off + x * c}px; top:${off + y * c}px;
      width:${c}px; height:${c}px;
      ${fuoriTex ? `background-image:url('${fuoriTex}');
        background-size:${Math.round(c * tarF.scala)}px ${Math.round(c * tarF.scala)}px;
        background-position:${-Math.round(sfasa[0] + off + x * c)}px ${-Math.round(sfasa[1] + off + y * c)}px;`
        : ''}"></div>`).join('');

  // I DECORI: dettaglio a terra che NON ostacola. Sono tutti PIATTI apposta —
  // niente ombre portate, niente volume — perche' una cosa che non blocca non
  // deve nemmeno sembrare che blocchi: un dubbio al tavolo costa piu' di un
  // disegno in meno. Chi vede una cassa esita; chi vede una crepa ci cammina.
  const decoro = (tipo, giro) => {
    const g = Math.round(giro * 360);
    if (tipo === 'crepa') {
      return `<div class="dec" style="width:${c * 0.72}px; height:${Math.max(1, Math.round(c * 0.02))}px;
        transform:translate(-50%,-50%) rotate(${g}deg);
        background:linear-gradient(90deg, transparent, rgba(14,12,10,.85) 18%,
          rgba(14,12,10,.85) 78%, transparent); border-radius:2px"></div>
        <div class="dec" style="width:${c * 0.3}px; height:${Math.max(1, Math.round(c * 0.016))}px;
        transform:translate(-6%,-140%) rotate(${g + 34}deg);
        background:linear-gradient(90deg, transparent, rgba(18,15,12,.5), transparent)"></div>`;
    }
    if (tipo === 'pozza') {
      return `<div class="dec" style="width:${c * 0.92}px; height:${c * 0.66}px;
        transform:translate(-50%,-50%) rotate(${g}deg); border-radius:50%;
        background:radial-gradient(ellipse at 44% 40%, rgba(150,176,182,.30),
          rgba(96,120,128,.34) 58%, transparent 92%);
        box-shadow:inset 0 ${Math.round(c * 0.02)}px ${Math.round(c * 0.05)}px rgba(210,226,230,.30)"></div>`;
    }
    if (tipo === 'muschio') {
      return `<div class="dec" style="width:${c * 0.98}px; height:${c * 0.78}px;
        transform:translate(-50%,-50%) rotate(${g}deg);
        border-radius:52% 48% 40% 60% / 55% 45% 55% 45%;
        background:radial-gradient(circle at 44% 40%, rgba(88,106,58,.62), rgba(48,62,34,.46) 62%,
          transparent 92%)"></div>`;
    }
    if (tipo === 'sabbia') {
      return `<div class="dec" style="width:${c * 1.15}px; height:${c * 0.7}px;
        transform:translate(-50%,-50%) rotate(${g}deg);
        border-radius:50% 50% 46% 54% / 60% 40% 60% 40%;
        background:radial-gradient(ellipse at 50% 45%, rgba(214,198,164,.44), transparent 78%)"></div>`;
    }
    // detriti: quattro sassetti, mai in fila
    return [[0.28, 0.32, 0.26], [0.62, 0.26, 0.18], [0.42, 0.64, 0.22], [0.72, 0.68, 0.15]]
      .map(([dx, dy, r], i) => `<div class="dec" style="width:${c * r}px; height:${c * r * 0.82}px;
        transform:translate(${(dx - 0.5 + giro * 0.12) * c}px, ${(dy - 0.5 - giro * 0.1) * c}px)
          rotate(${g + i * 47}deg);
        border-radius:48% 52% 44% 56% / 56% 44% 56% 44%;
        background:radial-gradient(circle at 36% 30%, rgba(188,182,166,.95), rgba(64,58,48,.95) 72%);
        box-shadow:0 ${Math.round(c * 0.012)}px ${Math.round(c * 0.02)}px rgba(10,8,6,.5)"></div>`)
      .join('');
  };
  const decoriHtml = decori.map(([x, y, tipo, giro]) =>
    `<div class="posto" style="left:${off + x * c}px; top:${off + y * c}px;
      width:${c}px; height:${c}px">${decoro(tipo, giro)}</div>`).join('');

  const arredi = gruppi.map((g) => {
    const chiave = String(g.label).toLowerCase();
    const disegna = ARREDI[chiave];
    // Una chiave senza disegno lascerebbe la casella LIBERA ALL'OCCHIO pur
    // essendo bloccata dalle regole: e' l'inganno del Preludio, e qui non si
    // ripete — si mette almeno un ingombro, e lo si dice in console.
    const w = g.cols * c, h = g.rows * c;
    const arte = dipintoVario(chiave, g.col, g.row);
    const dentro = arte
      ? `<div class="og dipinto" style="width:${w * 0.86}px;height:${h * 0.86}px;
           background-image:url('${arte}'); background-size:contain;
           background-repeat:no-repeat; filter:${daRitingere(arte) ? RITINTA_2M : (TAVOLO ? MANO_ARREDO_TAVOLO : MANO_ARREDO)} drop-shadow(0 ${Math.round(c * 0.03)}px
           ${Math.round(c * 0.05)}px rgba(0,0,0,.65))"></div>`
      : disegna
      ? disegna({ c, w, h })
      : `<div class="og" style="width:${w * 0.6}px;height:${h * 0.6}px;border-radius:${c * 0.02}px;
           background-image:linear-gradient(rgba(20,18,16,.5), rgba(8,7,6,.6)), url('${tex('legno')}');
           background-size:auto, ${c * 0.5}px ${c * 0.5}px; box-shadow:${OMBRA}"></div>`;
    if (!arte && !disegna) console.log(`arredo senza arte ne' sagoma, disegnato come ingombro: ${chiave}`);
    return `<div class="posto" style="left:${off + g.col * c}px; top:${off + g.row * c}px; width:${w}px; height:${h}px;">${dentro}</div>`;
  }).join('');

  // le pozze di luce: una per fiamma, piu' fredde sulle porte
  const luci = gruppi.filter((g) => FUOCHI[String(g.label).toLowerCase()]).map((g) => {
    const col = FUOCHI[String(g.label).toLowerCase()];
    const x = off + (g.col + g.cols / 2) * c, y = off + (g.row + g.rows / 2) * c;
    const r = c * 1.9;
    return `<div class="luce" style="left:${x - r}px; top:${y - r}px; width:${r * 2}px; height:${r * 2}px;
      background:radial-gradient(circle, ${col}44 0%, ${col}1c 38%, transparent 70%)"></div>`;
  }).join('') + porte.map(({ dir, idx }) => {
    const x = (dir === 'N' || dir === 'S') ? off + (idx + 0.5) * c : (dir === 'E' ? S - off : off);
    const y = (dir === 'E' || dir === 'O') ? off + (idx + 0.5) * c : (dir === 'N' ? off : S - off);
    const r = c * 1.25;
    return `<div class="luce" style="left:${x - r}px; top:${y - r}px; width:${r * 2}px; height:${r * 2}px;
      background:radial-gradient(circle, rgba(150,190,200,.16) 0%, rgba(120,160,175,.07) 40%, transparent 70%)"></div>`;
  }).join('');

  // I MURI. Nei riferimenti (le battlemap dipinte) e' la prima cosa che si
  // vede: una fascia di pietra con SPESSORE attorno alla stanza, e l'ombra che
  // cade dentro. Senza, un pavimento e' una piastrella; con, e' una stanza.
  // Le porte sono varchi nel muro, non barre appiccicate sopra: si aprono
  // esattamente sulla cella che `pickDoorIndex` ha scelto.
  const sp = Math.round(c * 0.26);          // spessore del muro disegnato in casa
  // UN VARCO NON SI DISEGNA SOPRA, SI LASCIA: il muro di quel lato si spezza
  // in due tratti e in mezzo resta la soglia. Un rettangolo trasparente sopra
  // la pietra non toglie la pietra — l'ho provato, e la porta restava murata.
  const tratti = (idxs) => {
    const buchi = idxs
      .map((i) => [i * c + c * 0.16, i * c + c * 0.84])
      .sort((a, b) => a[0] - b[0]);
    const pezzi = []; let da = 0;
    for (const [a, b] of buchi) { if (a > da) pezzi.push([da, a]); da = b; }
    if (da < S) pezzi.push([da, S]);
    return pezzi;
  };

  // le caselle di bordo occupate da una porta, per lato
  const idxPorte = (dir) => porte.filter((p) => p.dir === dir).map((p) => p.idx);
  const conPorta = (dir) => new Set(idxPorte(dir));

  // IL MURO NASCE DOVE LA CASELLA ACCANTO NON ESISTE. Prima si girava sui
  // quattro lati per indice, che sa fare solo rettangoli; qui si gira sui BORDI
  // della sagoma, e lo stesso codice regge il quadrato pieno, la stanza a L,
  // l'abside e il ballatoio col vuoto in mezzo.
  const VERSO = { N: [0, -1], S: [0, 1], O: [-1, 0], E: [1, 0] };
  const soglie = new Set(porte.map(({ dir, idx }) =>
    (dir === 'N' ? `${idx},0` : dir === 'S' ? `${idx},${L - 1}`
      : dir === 'O' ? `0,${idx}` : `${L - 1},${idx}`) + dir));
  // UN MURO NON VA FRA IL MOLO E L'ACQUA. Il perimetro della tessera e' muro —
  // serve anche a far combaciare due tessere accostate — ma il bordo INTERNO,
  // quello fra la parte percorribile e l'altro ambiente, e' un'altra cosa: la
  // riva di una banchina e' una sponda di legno, il ciglio di un ballatoio e' un
  // gradino sul vuoto. Mettere la pietra da dungeon anche li' faceva sembrare il
  // canale una stanza murata.
  const dentroGriglia = (x, y) => x >= 0 && y >= 0 && x < L && y < L;
  const bordi = [];        // il muro vero: solo il perimetro della tessera
  const sponde = [];       // il ciglio verso l'altro ambiente
  for (const [cx, cy] of [...vive].map((k2) => k2.split(',').map(Number))) {
    for (const [dir, [dx, dy]] of Object.entries(VERSO)) {
      if (viva(cx + dx, cy + dy)) continue;
      if (soglie.has(`${cx},${cy}${dir}`)) continue;   // qui c'e' la porta
      const interno = dentroGriglia(cx + dx, cy + dy);
      // BORDO APERTO: nella direzione a caverna la parete e' la ROCCIA dipinta,
      // non un muro disegnato, e sul perimetro non ci va niente — dove il
      // pavimento tocca il bordo deve fondersi con quello della tessera accanto.
      // Un muro li' rifarebbe la scacchiera di stanze murate.
      if (!interno && bordoAperto) continue;
      if (interno && fuoriAmb !== 'vuoto') sponde.push([cx, cy, dir]);
      else bordi.push([cx, cy, dir]);
    }
  }
  // la sponda: una fascia scura e sottile, con l'ombra che cade sull'acqua
  const spondeHtml = sponde.map(([cx, cy, dir]) => {
    const sp2 = Math.round(M * 0.55);
    const x0 = off + cx * c, y0 = off + cy * c;
    const q = { N: `left:${x0}px; top:${y0 - sp2}px; width:${c}px; height:${sp2}px;`,
                S: `left:${x0}px; top:${y0 + c}px; width:${c}px; height:${sp2}px;`,
                E: `left:${x0 + c}px; top:${y0}px; width:${sp2}px; height:${c}px;`,
                O: `left:${x0 - sp2}px; top:${y0}px; width:${sp2}px; height:${c}px;` }[dir];
    return `<div class="sponda" style="${q}"></div>`;
  }).join('');

  // LA SOGLIA NON E' UN BUCO. Togliere il pezzo di muro lascia un varco, e un
  // varco fra due tessere si legge come uno spazio vuoto: al tavolo sembra che
  // le stanze non si tocchino. Qui nel varco ci va una PORTA, disegnata nella
  // cornice — mezza per tessera, come il muro. Accostando le due tessere le due
  // metà compongono un battente solo, e la porta appartiene alla giuntura invece
  // che a una delle due stanze (è così che la mette in tavola HeroQuest: un
  // pezzo a cavallo del confine, non stampato su nessuna delle due stanze).
  // senza cornice non c'e' dove metterla: il battente sarebbe alto zero e
  // resterebbe solo il suo alone, che basta a cambiare il PNG di una tessera
  // gia' stampata. Visto sullo SHA, non a occhio.
  const uscio = cornice <= 0 ? '' : porte.map(({ dir, idx }) => {
    const lungo = (dir === 'N' || dir === 'S');
    const w = lungo ? c : M, h = lungo ? M : c;
    const x = dir === 'O' ? off - M : dir === 'E' ? off + L * c : off + idx * c;
    const y = dir === 'N' ? off - M : dir === 'S' ? off + L * c : off + idx * c;
    // le assi corrono ATTRAVERSO il varco, non lungo il muro: e' quel che
    // distingue a colpo d'occhio un battente da un pezzo di parete
    const assi = `repeating-linear-gradient(${lungo ? 0 : 90}deg,
      rgba(0,0,0,.55) 0 ${Math.round(c * 0.012)}px,
      rgba(255,255,255,.05) ${Math.round(c * 0.012)}px ${Math.round(c * 0.09)}px)`;
    // le due bande di ferro, di traverso alle assi
    const ferro = `linear-gradient(${lungo ? 90 : 0}deg, transparent 0 18%,
      rgba(120,124,132,.85) 18% 27%, transparent 27% 73%,
      rgba(120,124,132,.85) 73% 82%, transparent 82%)`;
    return `<div class="uscio" style="left:${x}px; top:${y}px; width:${w}px; height:${h}px;
      background-image:${ferro}, ${assi}, url('${tex('legno')}');
      background-size:auto, auto, ${Math.round(c * 0.5)}px ${Math.round(c * 0.5)}px"></div>`;
  }).join('');

  // ponytail: la striscia 2M copre un LATO intero e sa fare solo rettangoli.
  // Con una sagoma cede il posto al kit a pezzi (o al ripiego disegnato), invece
  // di uscire storta. Se la direzione 2 viene scelta, la striscia va tagliata
  // per casella come i pezzi del kit — stesso conto, altra immagine.
  const muri = QUALI_MURI === '2m' && fs.existsSync(MURO_2M) && vive.size === L * L
    // --- la striscia dipinta 2MT: una per lato, spezzata dove c'e' la soglia ---
    ? (() => {
      const giro = { N: 0, E: 90, S: 180, O: 270 };
      // ruotare di 180 e di 270 una scatola quadrata RIBALTA il lato: il tratto
      // che sul bordo alto sta a sinistra, sul bordo basso finisce a destra. Se
      // non si specchia l'indice, la soglia si apre dalla parte sbagliata — e
      // la porta resta murata mentre il muro ha un buco altrove.
      const specchia = { N: false, E: false, S: true, O: true };
      const alt = Math.round(c * MURO_2M_ALTEZZA);
      const url = pathToFileURL(MURO_2M).href;
      return ['N', 'E', 'S', 'O'].map((dir) => {
        const idxs = idxPorte(dir).map((i) => (specchia[dir] ? L - 1 - i : i));
        const pezzi = tratti(idxs).map(([a, b]) => `<div style="position:absolute;
          left:${a}px; top:0; width:${b - a}px; height:${alt}px;
          background-image:url('${url}'); background-size:${S}px ${alt}px;
          background-position:${-a}px 0; background-repeat:no-repeat"></div>`).join('');
        return `<div class="lato2m" style="transform:rotate(${giro[dir]}deg)">${pezzi}</div>`;
      }).join('');
    })()
    // --- il kit dipinto, MESSO FUORI dal reticolo: una fascia per bordo ---
    //
    // Il pezzo del kit e' 200x400 e la sua pietra sta fra il 37,5% e il 70,25%
    // dell'altezza (misurato sull'alfa, non a occhio: il resto del PNG e' vuoto).
    // Scalandolo perche' quella fascia sia alta esattamente `M` e ripetendolo in
    // orizzontale, il muro sta tutto nella cornice — e le sedici caselle restano
    // sedici caselle. Le pietre vengono piu' piccole del disegno originale, che a
    // casella grande e' anche piu' giusto: un muro non e' fatto di massi da 60 cm.
    : MURI_MODULARI && cornice > 0
    ? (() => {
      const arte = pezzoMuro('Dungeon_Straight_1x2_A');
      if (!arte) return '';
      const DA = 0.375, SPESSO = 0.3275;      // dove sta la pietra, nell'immagine
      const H = M / SPESSO;                   // quanto va alta tutta l'immagine
      const L = H / 2;                        // il pezzo e' largo meta' dell'altezza
      const fascia = (x, y, w, giro) => `<div class="muroFascia" style="left:${x}px;
        top:${y}px; width:${w}px; height:${M}px; transform:rotate(${giro}deg);
        background-image:url('${arte}'); background-size:${L}px ${H}px;
        background-position:0 ${-DA * H}px; background-repeat:repeat-x"></div>`;
      const fuoriMuri = [];
      for (const [cx, cy, dir] of bordi) {
        const x0 = off + cx * c, y0 = off + cy * c;
        // la fascia nasce orizzontale con la pietra in alto e l'ombra in basso;
        // ruotandola l'ombra deve sempre cadere DENTRO la stanza
        if (dir === 'N') fuoriMuri.push(fascia(x0, y0 - M, c, 0));
        else if (dir === 'S') fuoriMuri.push(fascia(x0, y0 + c, c, 180));
        // per i lati verticali la fascia resta larga `c` e alta `M`, e si ruota
        // attorno al proprio centro: e' l'unico modo di non deformarla
        else if (dir === 'O') fuoriMuri.push(fascia(x0 - M / 2 - c / 2, y0 + c / 2 - M / 2, c, -90));
        else fuoriMuri.push(fascia(x0 + c - c / 2 + M / 2, y0 + c / 2 - M / 2, c, 90));
      }
      // GLI ANGOLI. Due fasce che si incontrano lasciano un buco quadrato di
      // MxM: senza, il muro ha una tacca in ogni spigolo della sagoma
      const bordo = new Set(bordi.map(([cx, cy, d]) => `${cx},${cy}${d}`));
      for (const [cx, cy] of [...vive].map((k2) => k2.split(',').map(Number))) {
        for (const [a, b, dx, dy] of [['N', 'O', -1, -1], ['N', 'E', 1, -1],
                                      ['S', 'O', -1, 1], ['S', 'E', 1, 1]]) {
          if (!bordo.has(`${cx},${cy}${a}`) || !bordo.has(`${cx},${cy}${b}`)) continue;
          const x = off + cx * c + (dx > 0 ? c : -M);
          const y = off + cy * c + (dy > 0 ? c : -M);
          fuoriMuri.push(`<div class="muroFascia" style="left:${x}px; top:${y}px;
            width:${M}px; height:${M}px; background-image:url('${arte}');
            background-size:${L}px ${H}px; background-position:0 ${-DA * H}px"></div>`);
        }
      }
      return fuoriMuri.join('');
    })()
    : MURI_MODULARI
    // --- il kit dipinto SOPRA il reticolo: com'era prima della cornice ---
    ? (() => {
      const giro = { N: 0, E: 90, S: 180, O: 270 };
      const box = 2 * c;                       // il riquadro quadrato che si ruota
      const pezzi = [];
      for (const [cx, cy, dir] of bordi) {
        // il kit ha due varianti per il tratto dritto (A e B), non tre. La
        // variante la sceglie l'indice LUNGO IL LATO — cx sui lati orizzontali,
        // cy su quelli verticali — e non le due coordinate insieme: con quelle
        // le tessere gia' stampate cambiavano disegno del muro sui lati S, E e
        // O. Visto confrontando lo SHA del PNG col codice di prima.
        const lungo = (dir === 'N' || dir === 'S') ? cx : cy;
        const v = ['A', 'B'][(lungo + dir.charCodeAt(0)) % 2];
        const arte = pezzoMuro(`Dungeon_Straight_1x2_${v}`) || pezzoMuro('Dungeon_Straight_1x2_A');
        if (!arte) continue;
        const pos = { N: [cx * c - c / 2, cy * c],
                      S: [cx * c - c / 2, (cy + 1) * c - box],
                      E: [(cx + 1) * c - box, cy * c - c / 2],
                      O: [cx * c, cy * c - c / 2] }[dir];
        pezzi.push(`<div class="muroBox" style="left:${pos[0]}px; top:${pos[1]}px;
          width:${box}px; height:${box}px; transform:rotate(${giro[dir]}deg)">
          <img src="${arte}" style="left:${c / 2}px; top:${-0.8 * c}px; width:${c}px; height:${2 * c}px"></div>`);
      }
      // NIENTE PEZZI D'ANGOLO: quelli del kit sono 2x2 e allungano le braccia
      // due caselle DENTRO la stanza — a schermo diventava una croce di pietra
      // in mezzo al pavimento. Gli angoli li chiudono i due tratti che si
      // incontrano, che e' come li chiude un muro vero.
      return pezzi.join('');
    })()
    // --- il ripiego: la fascia di pietra disegnata qui, un tratto per bordo ---
    : bordi.map(([cx, cy, dir]) => {
      // con la cornice la fascia sta FUORI dalla casella (spessa M); senza,
      // resta dentro com'era, e le tessere gia' stampate non si muovono
      const g = cornice > 0 ? M : sp;
      const x0 = off + cx * c, y0 = off + cy * c;
      const q = { N: `left:${x0}px; top:${cornice > 0 ? y0 - g : y0}px; width:${c}px; height:${g}px;`,
                  S: `left:${x0}px; top:${cornice > 0 ? y0 + c : y0 + c - g}px; width:${c}px; height:${g}px;`,
                  E: `left:${cornice > 0 ? x0 + c : x0 + c - g}px; top:${y0}px; width:${g}px; height:${c}px;`,
                  O: `left:${cornice > 0 ? x0 - g : x0}px; top:${y0}px; width:${g}px; height:${c}px;` }[dir];
      return `<div class="muro" style="${q}"></div>`;
    }).join('');

  // il reticolo e i cartellini stanno nel PNG SOLO per la stampa: a schermo li
  // disegna l'app, e cuocerli qui significa averli due volte
  const griglia = stampa
    ? Array.from({ length: L * L }, (_, i) => {
      const col = i % L, row = (i / L) | 0;
      return `<div class="cell" style="left:${off + col * c}px; top:${off + row * c}px; width:${c}px; height:${c}px;"></div>`;
    }).join('')
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:${S}px; height:${S}px; background:#0b0d10; }
    .stage { position:relative; width:${S}px; height:${S}px; overflow:hidden;
      background:#0b0d10; }
    /* il riquadro giocabile: quattro caselle per quattro, e nient'altro */
    .dentro { position:absolute; left:${off}px; top:${off}px;
      width:${L * c}px; height:${L * c}px; overflow:hidden; }

    /* IL PAVIMENTO. La texture nasce neutra e viene portata in palette qui:
       velatura fredda verso il fondo dell'app, saturazione bassa. La piastrella
       e' mezza casella — a casella intera si legge il ripetersi, a un quarto
       diventa un tessuto. */
    .suolo { position:absolute; inset:0;
      background-image:${fondo};
      ${acquaDipintaInCasa ? '' : `background-size:${Math.round(c * tar.scala)}px ${Math.round(c * tar.scala)}px;
         background-position:${-Math.round(sfasa[0])}px ${-Math.round(sfasa[1])}px;`}
      /* almeno una piastrella per casella: piu' fitta di cosi' il pavimento
         diventa un tessuto e smette di leggersi come pavimento */
      ${pavDipinto || acquaDipintaInCasa
        /* un pavimento gia' dipinto ha la sua luce e la sua palette: toccarlo
           col filtro delle foto lo spegnerebbe due volte */
        ? `filter:${daRitingere(pavDipinto) ? RITINTA_2M : mano};`
        : `filter:saturate(.5) brightness(${(0.86 * tar.luce).toFixed(2)}) contrast(1.06);`} }
    /* la velatura porta la texture nella palette senza spegnerla: il PNG non
       deve arrivare gia' nero, perche' e' l'app a metterci sopra i suoi filtri
       (e in stampa il nero non si recupera) */
    /* la velatura fredda: a piena forza moltiplicava per mezzo e spegneva la
       trama insieme al colore. Vela, non spegne. */
    .tinta { position:absolute; inset:0; mix-blend-mode:multiply; opacity:.74;
      background:linear-gradient(rgba(120,146,152,1), rgba(64,84,96,1)); }
    /* macchie larghe: senza, un pavimento piastrellato e' carta da parati */
    .macchie { position:absolute; inset:0; opacity:${TAVOLO ? '.16' : '.32'};
      background:
        radial-gradient(38% 30% at 22% 18%, ${sporco[0]}, transparent 70%),
        radial-gradient(30% 26% at 78% 62%, ${sporco[0]}, transparent 70%),
        radial-gradient(26% 22% at 55% 88%, ${sporco[1]}, transparent 70%); }

    /* LA STANZA HA I MURI: senza il buio ai bordi, quattro tessere accostate
       sembrano un unico pavimento continuo e non si capisce dove finisce una
       stanza. E' la stessa vignettatura del mockup «la stanza e' il pezzo». */
    .muri { position:absolute; left:${off}px; top:${off}px;
      width:${L * c}px; height:${L * c}px; pointer-events:none;
      /* «very dark and atmospheric»: il buio ai bordi e' la meta' del prompt.
         Su una stanza da dieci caselle una vignettatura tarata sul 4x4 non
         arrivava nemmeno al centro — qui e' proporzionale al LATO, non alla
         casella. */
      box-shadow: inset 0 0 ${Math.round(c * L * (TAVOLO ? 0.035 : 0.09))}px ${Math.round(c * L * 0.006)}px rgba(0,0,0,${TAVOLO ? '.30' : '.55'}),
                  inset 0 0 0 ${Math.round(c * 0.018)}px rgba(0,0,0,.8); }

    /* L'ORO CONSUMATO NELLA PIETRA. Il prompt della tessera del gioco lo dice
       alla lettera — «faint gold filigree markings barely visible worn into the
       stone» — ed e' il segno che lega una mappa alle carte. Va tenuto SOTTO la
       soglia del visibile: se si nota, e' decorazione; se non si nota ma si
       sente, e' atmosfera. */
    .filigrana { position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen;
      opacity:.05;
      /* NON al centro e NON concentrica: due cerchi in mezzo alla stanza fanno un
         bersaglio, non un pavimento consumato. Qui e' un reticolo largo di righe
         d'oro, come le fughe di un intarsio mangiato dai passi. */
      background-image:
        repeating-linear-gradient(0deg, rgba(232,194,122,.8) 0 ${Math.max(1, Math.round(c * 0.012))}px,
          transparent ${Math.max(1, Math.round(c * 0.012))}px ${Math.round(c * 3)}px),
        repeating-linear-gradient(90deg, rgba(232,194,122,.8) 0 ${Math.max(1, Math.round(c * 0.012))}px,
          transparent ${Math.max(1, Math.round(c * 0.012))}px ${Math.round(c * 3)}px);
      background-position:${Math.round(c * 1.4)}px ${Math.round(c * 0.8)}px;
      -webkit-mask-image:radial-gradient(72% 62% at 42% 46%, #000 10%, transparent 78%); }
    /* IL CREMISI della palette: non si vede come colore, si sente come calore
       che entra da un lato solo. Senza, la tessera e' teal e basta — meta' di
       quel che dicono gli artwork. */
    .crimson { position:absolute; inset:0; pointer-events:none; mix-blend-mode:soft-light;
      background:radial-gradient(78% 62% at 88% 12%, rgba(150,44,52,.55), transparent 72%); }
    /* LA GRANA DELL'OLIO. Una texture fotografica e' liscia; una pittura a olio
       ha la tela sotto. E' quel che tiene insieme una fotografia di pietra e un
       ritratto dipinto guardandoli sullo stesso tavolo. */
    .olio { position:absolute; inset:0; pointer-events:none; mix-blend-mode:overlay;
      opacity:.22;
      background-image:
        repeating-linear-gradient(37deg, rgba(255,255,255,.10) 0 1px, rgba(0,0,0,.10) 1px 2px),
        repeating-linear-gradient(-51deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.07) 1px 3px);
      background-size:${Math.round(c * 0.05)}px ${Math.round(c * 0.05)}px,
                      ${Math.round(c * 0.08)}px ${Math.round(c * 0.08)}px; }

    .luce { position:absolute; pointer-events:none; mix-blend-mode:screen; }
    /* la luce che entra comunque nella stanza: senza, un ambiente senza fiamme
       e' una superficie uniforme, e uniforme al tavolo vuol dire scacchiera */
    .lanterna { position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen;
      background:
        radial-gradient(30% 26% at 42% 36%, rgba(255,196,110,.44), rgba(232,150,74,.12) 55%, transparent 78%),
        radial-gradient(52% 46% at 66% 70%, rgba(232,194,122,.13), transparent 76%); }

    /* un arredo sta DENTRO la sua casella: il posto e' la casella, l'oggetto e'
       centrato li' dentro e non la tocca mai ai bordi */
    .posto { position:absolute; }
    .posto .og { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      background-position:center; background-blend-mode:multiply;
      /* il legno di Poly Haven e' rossiccio: qui va nella palette, o le casse
         sembrano incollate sopra invece che appoggiate */
      filter:saturate(.4) brightness(1.12); }
    /* quel che e' gia' dipinto non si ritocca: ha la sua luce */
    .posto .og.dipinto { background-blend-mode:normal; box-shadow:none; }
    .posto .og.dipinto::after { content:none; }
    /* un decoro e' PIATTO: sta sul pavimento, non sopra il pavimento */
    .dec { position:absolute; left:50%; top:50%; transform-origin:50% 50%;
      pointer-events:none; }
    /* un filo di luce sul bordo alto: la lanterna sta in alto a sinistra, e
       senza questo riflesso un oggetto scuro su pavimento scuro e' una macchia */
    .posto .og { box-shadow:${OMBRA}; }
    .posto .og::after { content:''; position:absolute; inset:0; border-radius:inherit;
      pointer-events:none;
      background:linear-gradient(155deg, rgba(255,238,200,.18), rgba(255,238,200,0) 42%); }

    /* la pietra del muro, e l'ombra che getta dentro la stanza: e' l'ombra a
       dare lo spessore, non il bordo */
    .muro { position:absolute; background-image:linear-gradient(rgba(30,34,40,.5), rgba(12,14,18,.7)),
      url('${tex('muro')}'); background-size:auto, ${Math.round(c * 0.8)}px ${Math.round(c * 0.8)}px;
      background-blend-mode:multiply; filter:saturate(.35) brightness(.95);
      box-shadow:0 0 ${Math.round(c * 0.22)}px ${Math.round(c * 0.06)}px rgba(0,0,0,.85),
                 inset 0 0 ${Math.round(c * 0.1)}px rgba(0,0,0,.6); }
    /* il riquadro che porta un pezzo di muro dipinto: quadrato, cosi' ruotarlo
       non ne cambia l'ingombro */
    /* la casella FUORI SAGOMA: il fondo del tavolo, non un buco trasparente —
       cosi' la tessera resta un PNG quadrato e la stampa non cambia mestiere */
    /* IL FUORI: l'altro ambiente della tessera. Piu' scuro e piu' spento di quel
       che si cammina — la differenza di luce e' la regola letta a occhio: dove e'
       chiaro si va, dove e' cupo no. */
    /* la massa di roccia: sfocare piu' di mezza casella e rialzare il contrasto
       salda i quadrati in una chiazza sola. Il filo chiaro attorno e' il bordo
       illuminato della pietra, ed e' quel che la stacca dal pavimento. */
    /* IL MURO DI CONFINE fra il pavimento e il nero.
       Non si puo' disegnare per lato di casella: la roccia e' una chiazza
       organica e un bordo a scalini non le starebbe addosso. Si usa invece la
       catena dei filtri — le ombre portate si disegnano DIETRO la sagoma, quindi
       attorno a una massa nera diventano un anello che ne segue esattamente il
       profilo. Tre passaggi: un filo chiaro (la cima della pietra illuminata),
       una fascia di pietra, e uno stacco scuro che la separa dal pavimento. */
    .rocce { position:absolute; inset:0; pointer-events:none;
      filter: url(#pietra)
              drop-shadow(0 0 ${Math.max(1, Math.round(c * 0.020))}px rgba(206,206,202,1))
              drop-shadow(0 0 ${Math.max(2, Math.round(c * 0.045))}px rgba(112,112,110,1))
              drop-shadow(0 0 ${Math.max(2, Math.round(c * 0.065))}px rgba(60,58,56,.95))
              drop-shadow(0 ${Math.round(c * 0.02)}px ${Math.round(c * 0.09)}px rgba(10,10,12,.75)); }
    /* NERO NEUTRO, non un nero caldo: contrast() lavora sui tre canali, e su
       un #15120e (che ha piu' rosso che blu) li divarica invece di scurirli —
       le rocce uscivano blu e rosse al neon. Il colore glielo da' il velo sopra. */
    .rocce .fuori { box-shadow:none; filter:none; background:#000; }
    /* il velo che ridà alla massa il colore della pietra, DOPO che la forma e'
       stata decisa: qui il contrasto non ci arriva piu' */
    .rocce-tinta { position:absolute; inset:0; pointer-events:none;
      mix-blend-mode:multiply; }
    .fuori { position:absolute; background-color:#0b0d10;
      filter:saturate(${TAVOLO ? '.22' : '.30'}) brightness(${TAVOLO ? '.34' : '.44'}) contrast(1.15);
      box-shadow:inset 0 0 ${Math.round(c * 0.35)}px rgba(0,0,0,.75); }
    /* LA SPONDA: il ciglio fra il camminabile e l'acqua. Non e' un muro — e' un
       bordo di legno consumato con l'ombra che cade DI LA', dove non si va. */
    .sponda { position:absolute;
      background:linear-gradient(rgba(58,46,32,.95), rgba(24,18,12,.95));
      box-shadow:0 0 ${Math.round(c * 0.10)}px ${Math.round(c * 0.03)}px rgba(0,0,0,.85); }
    /* LA FASCIA DI MURO, fuori dal reticolo. L'ombra la mette il box-shadow e
       cade DENTRO la stanza: e' l'ombra a dare lo spessore, non il bordo. */
    .muroFascia { position:absolute; image-rendering:auto;
      filter:saturate(.42) brightness(.82) contrast(1.05);
      box-shadow:0 0 ${Math.round(c * 0.16)}px ${Math.round(c * 0.05)}px rgba(0,0,0,.9); }
    /* LA PORTA nella cornice: legno e ferro, e un filo di luce calda che passa
       dalla fessura — e' il segno che di la' c'e' una stanza, non il vuoto */
    .uscio { position:absolute; background-blend-mode:normal, normal, multiply;
      filter:saturate(.5) brightness(.8);
      box-shadow:0 0 ${Math.round(c * 0.14)}px ${Math.round(c * 0.04)}px rgba(232,194,122,.35),
                 inset 0 0 ${Math.round(c * 0.08)}px rgba(0,0,0,.8); }
    /* IL RETICOLO STAMPATO. A schermo lo disegna l'app; sul cartoncino non c'e'
       nessuna app, e senza reticolo una tessera dipinta e' un quadro. Righe
       sottili e scure, che non rubano la scena all'arte ma si contano. */
    .reticolo { position:absolute; inset:0; pointer-events:none;
      background-image:
        repeating-linear-gradient(0deg, rgba(24,20,16,.40) 0 ${Math.max(2, Math.round(c * 0.009))}px,
          transparent ${Math.max(2, Math.round(c * 0.009))}px ${c}px),
        repeating-linear-gradient(90deg, rgba(24,20,16,.40) 0 ${Math.max(2, Math.round(c * 0.009))}px,
          transparent ${Math.max(2, Math.round(c * 0.009))}px ${c}px); }
    /* IL BORDO DURO: dice dove finisce il pezzo. Su un tavolo dove le tessere si
       accostano e' quel che le tiene distinte a colpo d'occhio. */
    .taglio { position:absolute; inset:0; pointer-events:none;
      box-shadow: inset 0 0 0 ${Math.max(2, Math.round(c * 0.05))}px rgba(16,13,10,.92); }
    .muroBox { position:absolute; }
    .muroBox img { position:absolute; }
    /* un LATO intero di muro dipinto: la scatola e' quadrata come la tessera,
       cosi' ruotarla di 90/180/270 porta il bordo alto sugli altri tre lati
       senza spostare niente. La ritinta e' la stessa degli arredi 2MT. */
    /* il muro 2MT nasce quasi bianco e il pavimento del gioco e' quasi nero:
       la ritinta degli arredi non basta, qui serve mezzo passo in piu' */
    .lato2m { position:absolute; inset:0; filter:saturate(.45) brightness(.55) contrast(1.1); }

    .cell { position:absolute; border:2px solid rgba(230,195,120,0.35); }
  </style></head><body>
    <!-- IL FILTRO CHE FA IL MURO.
         contrast() del CSS lavora sui canali RGB e NON tocca l'alfa: sfocando
         una massa nera l'alfa sfuma, e nessun contrasto la ririalza — restava un
         alone invece di un bordo. Qui la sfocatura si fa in SVG e poi si
         RIDISEGNA L'ALFA con una matrice: moltiplicata per 22 e traslata di -10,
         tutto quel che sta sotto meta' sparisce e tutto quel che sta sopra
         diventa pieno. Il risultato e' la stessa forma organica, ma con un
         taglio netto — e su un taglio netto le ombre portate fanno un muro. -->
    <svg width="0" height="0" style="position:absolute">
      <filter id="pietra" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(c * 0.26).toFixed(1)}" result="sfocata"/>
        <feColorMatrix in="sfocata" type="matrix" result="dura"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 22 -10"/>
      </filter>
    </svg>
    <div class="stage">
      <!-- IL PAVIMENTO STA NEL RETICOLO, non in tutta la tessera: fuori c'e' la
           cornice, che e' muro e tavolo. A cornice 0 il riquadro coincide con la
           tessera e non cambia niente. Le caselle per lato sono L. -->
      <div class="dentro">
        <div class="suolo"></div>
        ${TAVOLO ? '' : `<div class="tinta"></div>`}
        <div class="macchie"></div>
        ${TAVOLO ? '' : `<div class="filigrana"></div>
        <div class="crimson"></div>
        <div class="olio"></div>
        <div class="lanterna"></div>`}
        ${TAVOLO ? `<div class="reticolo"></div>` : ''}
      </div>
      ${luci}
      ${morbida ? `<div class="rocce">${fuori}</div>` : fuori}
      ${decoriHtml}
      ${morbida ? '' : spondeHtml}
      ${arredi}
      ${uscio}
      ${muri}
      <div class="muri"></div>
      <!-- il bordo duro serve quando le tessere sono stanze murate; in modalita'
           caverna il pavimento attraversa la giuntura, e una riga scura li' la
           rimetterebbe in evidenza proprio dove non deve vedersi -->
      ${TAVOLO && !bordoAperto ? '<div class="taglio"></div>' : ''}
      ${griglia}
    </div>
  </body></html>`;
}

module.exports = { htmlVtt, pavimentoDi, ARREDI };
