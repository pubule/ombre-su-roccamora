/* LE REGOLE DEL POSTO — COPIA PROVVISORIA di scripts/tiles/pittura-vtt.js
   (FUORI_DI, PAVIMENTI), finche' il Task 1 del piano non le sposta in
   webapp/public/motore/ambiente.js. Per il mockup 6-scenografia.html. */
(function () {
const FUORI_DI = [
  [/molo|banchin|imbarcader|fondament|riva|barc|approdo|dogana|squero|pontile|passerell|ponte|ponticell|chiatt|darsena|canale|cistern|pozzo|confluenza|lavatoio|roggia|marea|vasca/i, 'acqua'],
  [/fogna|melma|scolo|chiusin|cloaca|vene|sentina/i, 'melma'],
  [/giardino|orto|serra|prato|roseto|verziere/i, 'erba'],
  [/grotta|caverna|galler|cunicol|scavo|intercapedine|pietra viva|discesa|budello/i, 'roccia'],
  [/cortile|terrapien|piazzal|mercato|calle|vicolo|campiello|sottoportico/i, 'terra'],
  // tetti, ballatoi, logge, guglie: sotto c'e' il vuoto, e il vuoto resta nero
  [/tetto|guglia|gronda|abbaino|campanil|torre|comignol|coppi|terrazza|ballatoio|loggia|camminament|lucernario/i, 'vuoto'],
];
const PAVIMENTI = [
  // ------------------------------------------------------------- L'ACQUA
  // quel che si CAMMINA sopra l'acqua e' assi: il pavimento e' quello che i
  // piedi toccano, non quello che c'e' sotto
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
  const nome = (t) => `${t.nome || ''} ${t.id || ''}`;
  const trova = (lista, t, dflt) => { for (const [re, q] of lista) if (re.test(nome(t))) return q; return dflt; };
  // ATTENZIONE: fuoriDi() da' 'vuoto' anche di DEFAULT (per il generatore vuol
  // dire «fuori non si disegna niente»). Per sapere se una stanza e' davvero
  // sui tetti — niente muri, il vuoto intorno — serve alAperto(), che guarda
  // la sola riga dei tetti.
  const TETTI = FUORI_DI[FUORI_DI.length - 1][0];
  window.POSTO = {
    pavimentoDi: (t) => t.pavimento || trova(PAVIMENTI, t, 'lastricato'),   // il campo della tessera vince
    fuoriDi: (t) => trova(FUORI_DI, t, 'vuoto'),
    alAperto: (t) => TETTI.test(nome(t)),
    // il fuori DICHIARATO da una stanza (senza il 'vuoto' di default): acqua,
    // melma, erba, roccia, terra, o 'tetti' per le stanze sui tetti; null se la
    // stanza non dice niente di cosa c'e' fuori
    fuoriDichiarato: (t) => { for (const [re, q] of FUORI_DI.slice(0, -1)) if (re.test(nome(t))) return q; return TETTI.test(nome(t)) ? 'tetti' : null; },
  };
})();
