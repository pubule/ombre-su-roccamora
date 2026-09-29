// LE REGOLE DEL POSTO: dal nome di una stanza, che pavimento ha e che cosa c'e'
// fuori. Una sola fonte per due usi — le tessere stampate
// (scripts/tiles/pittura-vtt.js) e la plancia digitale (js/plancia/) — perche'
// una banchina non puo' essere di assi al tavolo e di pietra sullo schermo.

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
export const FUORI_DI = [
  [/molo|banchin|imbarcader|fondament|riva|barc|approdo|dogana|squero|pontile|passerell|ponte|ponticell|chiatt|darsena|canale|cistern|pozzo|confluenza|lavatoio|roggia|marea|vasca/i, 'acqua'],
  [/fogna|melma|scolo|chiusin|cloaca|vene|sentina/i, 'melma'],
  [/giardino|orto|serra|prato|roseto|verziere/i, 'erba'],
  [/grotta|caverna|galler|cunicol|scavo|intercapedine|pietra viva|discesa|budello/i, 'roccia'],
  [/cortile|terrapien|piazzal|mercato|calle|vicolo|campiello|sottoportico/i, 'terra'],
  // tetti, ballatoi, logge, guglie: sotto c'e' il vuoto, e il vuoto resta nero
  [/tetto|guglia|gronda|abbaino|campanil|torre|comignol|coppi|terrazza|ballatoio|loggia|camminament|lucernario/i, 'vuoto'],
];

export function fuoriDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of FUORI_DI) if (re.test(nome)) return quale;
  return 'vuoto';
}

// IL PAVIMENTO LO DICE IL NOME DELLA STANZA. I dati non hanno un campo
// «ambiente» e non glielo si aggiunge per una scelta di pittura: il nome della
// tessera ce l'ha gia' dentro — «banchina», «deposito», «cripta» — ed e' lo
// stesso nome che il tavolo sente leggere ad alta voce.
// L'ORDINE E' UNA REGOLA, non un caso: «Sala delle Casse» e' un magazzino, e
// se la riga dei salotti venisse prima si ritroverebbe il parquet.
export const PAVIMENTI = [
  // ------------------------------------------------------------- L'ACQUA
  // quel che si CAMMINA sopra l'acqua e' assi: il pavimento e' quello che i
  // piedi toccano, non quello che c'e' sotto
  // il ballatoio della torre e' un anello di PIETRA levigata dal vento (Ep.11):
  // le assi sono delle passerelle e dei camminamenti, non delle torri
  [/ballatoio/i, 'pietra'],
  [/passerell|ponte|ponticell|pontile|camminament|loggia|scalinata|scala|gradin/i, 'assi'],
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

export function pavimentoDi(tile) {
  // UNA STANZA CHE IL NOME NON BASTA A DIRE: «L'abbaino» dell'Ep.11 e' un
  // riparo al chiuso, quello dell'Ep.14 sporge sul tetto. Il campo `pavimento`
  // della tessera (src/gen_ep*.py) vince sulla regola, per stampa e schermo.
  if (tile.pavimento) return tile.pavimento;
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of PAVIMENTI) if (re.test(nome)) return quale;
  return 'lastricato';
}

// ATTENZIONE: fuoriDi() da' 'vuoto' anche di DEFAULT (per il generatore vuol
// dire «fuori non si disegna niente»). Per sapere se una stanza e' davvero
// SUI TETTI — niente muri, il vuoto intorno — serve questa, che guarda la sola
// riga dei tetti. Vista nella prova del 25/09: coi muri legati a fuoriDi,
// la sala delle casse e la cripta uscivano senza muri.
const TETTI = FUORI_DI[FUORI_DI.length - 1][0];
// il fuori che la stanza DICHIARA (senza il 'vuoto' di default): serve al
// fuori dell'episodio (Task 5, Step 4b); null se la stanza non dice niente
export function fuoriDichiarato(tile) {
  const n = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, q] of FUORI_DI.slice(0, -1)) if (re.test(n)) return q;
  return TETTI.test(n) ? 'tetti' : null;
}
// SUI TETTI davvero: come fuoriDichiarato, non la riga dei tetti isolata —
// «la Tettoia delle Chiatte» conteneva «tetto» ma e' «chiatt» (acqua) a
// vincere per prima nell'elenco ordinato (fix Task 8/ep8, 29/09/2026: i
// due controlli erano scritti diversi e in disaccordo su questa stanza).
export const alAperto = (tile) => fuoriDichiarato(tile) === 'tetti';
