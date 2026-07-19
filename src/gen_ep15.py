# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 15: Lo smascheramento (Episodio 15/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-15.md e CAMPAGNA-EPISODI.md). Atto III,
mythology, FALSO FINALE: un dossier anonimo incastra il professor Braga come
C.B. — tutto combacia troppo. È M. che ha SCRITTO il caso col metodo indiziario
della Società. Meccanica nuova: la DOPPIA BUSTA (Busta pubblica «Braga è C.B.»
+ Contro-busta «chi ha scritto il dossier?»). Spedizione: la villa di Braga di
notte, cogliere gli Apparecchiatori che cancellano i tell del falso, prima del
SIGILLO della Gendarmeria. Boss: il Capo Apparecchiatore. Un solo seme: le
Istruzioni con la grafia di Braga (metodo del manuale, una copia consultata).

Varietà strutturale (regola 2026-07-18): falso finale / vittoria invertita (la
vittoria pubblica È la trappola); meccanica CANCELLAZIONE (i tell = pool che si
esaurisce) + race col sigillo; mazzo «umano». Torsione d'indagine: «la
soluzione che qualcuno ha scritto per voi» (la doppia busta).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 15.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border,
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
from gen_gothic import registro_ferite, token_sheet, TOKEN_EROI

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 15', 'pdf')
os.makedirs(OUT_DIR, exist_ok=True)
register_fonts()
W, H = A4


def st(name, **kw):
    from reportlab.lib.styles import ParagraphStyle
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


BODY = st('body', alignment=4)
SMB = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)


def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


# ================================================================= DATI

LETTERA_15 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Un plico anonimo è arrivato alla Gendarmeria: dentro, il caso contro il professor "
    "<b>Cesare Braga</b> — pagamenti, lettere, il sigillo «C.B.», un testimone oculare. Dice che "
    "il nostro rivale è C.B. La città esulta, il Tribunale prepara il processo, e ci chiamano a "
    "<b>verificare</b>.<br/><br/>"
    "Verificate il dossier come vi ho insegnato. E se ogni prova regge — se il caso si chiude da "
    "sé, pulito come un teorema — allora fermatevi un istante e chiedetevi una cosa sola: chi ha "
    "avuto la mano tanto ferma da renderlo così <i>perfetto</i>. Un delitto vero è sporco. Solo un "
    "delitto <b>scritto</b> è pulito. Se sospettate la messinscena, entrate nella villa di Braga "
    "<b>prima che la Gendarmeria la sigilli</b>, e cogliete sul fatto chi la sta apparecchiando. "
    "Avete <b>6 ore</b>, dalle 18:00 alle 24:00.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la Gendarmeria, il Tribunale, la Gazzetta di Roccamora e "
    "la Stanza del Testimone. Gli altri andranno sbloccati. La <b>Contro-busta</b> si apre solo a "
    "chi non si accontenta della soluzione servita.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «il dossier che combacia» (L1+L2), «il testimone oculare» (L1+L4),
# «il metodo della società» (L2+L3), «la scena non ancora sigillata» (L3+L4).
# Rivelatorio (D2) su L1, L2, L4.
LUOGHI_15 = [
    dict(n=1, nome='LA GENDARMERIA', voce_mappa='La Gendarmeria',
         req='Disponibile dall’inizio', art='La Gendarmeria.png',
         chiude=None,
         indizi=[
             'Il plico anonimo è sul tavolo del maresciallo: il dossier che combacia in ogni sua '
             'riga. «Mai visto un caso così pulito, signori. Pagamenti, lettere, il sigillo «C.B.», '
             'un testimone oculare. Il professor Braga è C.B., non c’è un buco. Firmiamo l’arresto '
             'e chiudiamo.»',
             'La grafia delle lettere è quella di Braga — perfetta. «Il testimone oculare l’ha '
             'riconosciuto senza esitare, e la sua deposizione è precisa al minuto. Troppo precisa, '
             'per uno che dice di averlo visto una notte sola, di sfuggita. Ma chi sono io per '
             'guardare in bocca a un caso regalato?»',
             'Il maresciallo, quasi a disagio per la sua stessa fortuna: «di solito le prove le '
             'sudiamo. Questo dossier è arrivato in un plico, ordinato come una pratica già chiusa. '
             'Chi lo ha compilato ci ha fatto il lavoro. E a me, la roba gratis, ha sempre '
             'insegnato a diffidare.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il dossier troppo pulito',
                  testo='Ogni prova del dossier regge alla verifica: ed è proprio questo il '
                        'problema. Un caso vero ha crepe, contraddizioni, testimoni che si '
                        'smentiscono. Questo no: combacia riga per riga, come un teorema scritto '
                        'all’indietro dalla soluzione. Chi lo ha cucito non ha *raccolto* prove — '
                        'le ha *disposte*, perché tornassero. La domanda giusta non è se Braga sia '
                        'colpevole. È chi ha avuto la mano tanto ferma da renderlo perfetto.'),
         ]),
    dict(n=2, nome='IL TRIBUNALE', voce_mappa='Il Tribunale',
         req='Disponibile dall’inizio', art='Il Tribunale.png',
         chiude=None,
         indizi=[
             'Al Tribunale si prepara già il processo: il dossier che combacia è agli atti, e '
             'l’accusa lo tratta come oro colato. «Un caso da manuale,» dice il cancelliere, e non '
             'sa quanto ha ragione: segue il metodo della società punto per punto, come se '
             'l’accusatore avesse studiato sul nostro stesso libro.',
             'Un vecchio giudice, in disparte, storce il naso: «il metodo della società lo conosco '
             'anch’io, di riflesso, a furia di sentirvi deporre. E questo dossier lo applica meglio '
             'di voi. Meglio di chiunque. Un dilettante non scrive così: solo chi *insegna* il '
             'metodo lo maneggia con questa freddezza.»',
             'Sul ruolo d’udienza, l’arresto di Braga è dato per fatto: manca solo la vostra '
             'conferma. «Confermate e si chiude in gloria,» dice l’usciere. «La città vuole il suo '
             'mostro, e stavolta ha pure il volto giusto: il rivale del vostro presidente.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il vecchio giudice',
                  testo='«Ve lo dico perché sono troppo vecchio per aver paura: quel dossier non '
                        'l’ha scritto un nemico di Braga. L’ha scritto un allievo del vostro metodo '
                        '— uno che sa come la Società legge un uomo dagli inchiostri e dalle '
                        'abitudini, e ha *disposto* gli inchiostri e le abitudini perché li leggeste '
                        'così. È un falso fatto con la vostra grammatica. E di gente che conosce la '
                        'vostra grammatica, a Roccamora, ce n’è pochissima. Contatela.»'),
         ]),
    dict(n=3, nome='LA GAZZETTA DI ROCCAMORA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         chiude=None,
         indizi=[
             'Ranuzzi ha già pronto il titolo — «IL MOSTRO HA UN VOLTO» — ma non è convinto: «la '
             'città esulta, il metodo della società ha inchiodato il rivale del vostro presidente, '
             'fine della storia. Solo che io le storie le fiuto, e questa sa di scena montata. '
             'Troppo lieto fine.»',
             'Negli archivi, i pochi che a Roccamora padroneggiano il metodo indiziario: «una '
             'manciata di nomi, tutti dentro o vicini alla Società. Il manuale ha dodici copie, '
             'dicono, tutte numerate. Se il dossier segue il metodo, l’ha scritto uno che una di '
             'quelle copie ce l’ha, o ce l’ha avuta.»',
             'Ranuzzi, abbassando la voce: «e c’è la fretta. La villa di Braga la sigillano domani '
             'all’alba, ma stanotte, mi dicono, c’è movimento là dentro. La scena non ancora '
             'sigillata è l’unico posto dove il falso è ancora vivo. Dopo il sigillo, resta solo la '
             'versione ufficiale.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I pochi che sanno il metodo',
                  testo='Il metodo indiziario della Società non è roba da strada: lo padroneggiano '
                        'in pochi, tutti dentro o attorno alla confraternita. Un falso costruito con '
                        'quel metodo restringe il campo dei sospetti a una manciata di persone — e '
                        'nessuna di loro è Braga, che il metodo lo *combatte* da trent’anni. Chi ha '
                        'scritto il dossier non odia Braga: lo usa. Odia, o teme, qualcos’altro.'),
         ]),
    dict(n=4, nome='LA STANZA DEL TESTIMONE', voce_mappa='La Stanza del Testimone',
         req='Disponibile dall’inizio', art='La Stanza del Testimone.png',
         chiude=None,
         indizi=[
             'Il testimone oculare vi riceve sicuro di sé, la deposizione già a memoria: «l’ho '
             'visto io, il professore, quella notte. Ne sono certo.» Il testimone oculare recita '
             'più che ricordare: nessuna esitazione, nessun «forse», ogni dettaglio al posto '
             'giusto. Chi ricorda davvero dubita; chi è stato istruito, no.',
             'Sul tavolo, la sua deposizione battuta a macchina, pronta per il verbale. <i>(Esca: '
             'potete prendere la Deposizione del Testimone — pare la prova regina, è costruita a '
             'tavolino.)</i>',
             'Quando gli chiedete dettagli fuori copione, il testimone si irrigidisce: «me l’hanno '
             'fatta imparare… cioè, l’ho vista così. La scena non ancora sigillata? Non so di cosa '
             'parliate. Io ho solo visto il professore. Punto.» Un teste vero divaga; questo torna '
             'sempre al binario.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il testimone istruito',
                  testo='«Me l’hanno fatta imparare» gli scappa, e poi si corregge. È tutto lì. Il '
                        'testimone oculare non mente su ciò che ha visto: mente sull’aver visto. È '
                        'stato istruito, pagato o spaventato, e recita una parte scritta da altri — '
                        'la stessa mano che ha scritto il dossier. Un testimone vero è la crepa di '
                        'un caso; questo ne è il cemento. Chi lo ha preparato sapeva esattamente '
                        'quale tassello mancava, e l’ha fabbricato.'),
         ]),
    dict(n=5, nome='L’ARCHIVIO DEI MANUALI', voce_mappa='L’Archivio dei Manuali',
         req='L’archivio dei manuali della Società apre solo a chi sospetta la mano dietro il '
             'falso: qualcuno che scrive col metodo della società, il nostro stesso ago.',
         chiave=('parola', 'IL METODO DELLA SOCIETÀ'), art='L’Archivio dei Manuali.png',
         chiude=None,
         indizi=[
             'Lo scaffale delle dodici copie del manuale indiziario, tutte numerate e censite. '
             '<i>(Oggetto: prendete il Manuale Indiziario.)</i> Col metodo in mano riconoscerete '
             'nel dossier ogni riga «disposta» invece che raccolta: il falso parla la vostra '
             'grammatica.',
             'Il registro delle consultazioni segna una firma recente su una delle copie: «copia '
             'n. 7, consultata il mese scorso.» Il nome è abraso, illeggibile — cancellato con la '
             'stessa cura con cui si cancella una scena. Ma la data resta: qualcuno ha ripassato il '
             'metodo poco prima che il dossier nascesse.',
             'Il custode dell’archivio, pallido: «le copie sono dodici, le conto ogni mese. Ci '
             'sono tutte. Ma una è tornata al suo posto… diversa. Riletta, sottolineata, con un '
             'orecchio a una pagina sola: quella su come si legge una grafia. Chi l’ha presa non '
             'voleva imparare a leggere. Voleva imparare a *scrivere* un falso leggibile.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La copia consultata',
                  testo='Dodici copie, tutte presenti, tutte censite — e una, la n. 7, riletta di '
                        'recente da una mano che ha poi cancellato la propria firma. Non un ladro: '
                        'un confratello. Chi ha scritto il dossier non ha rubato il metodo, lo '
                        '*aveva*: è dentro la Società, ha diritto a quella copia, e l’ha usata per '
                        'costruire un colpevole a tavolino. Il cerchio dei sospetti si stringe fino '
                        'a diventare un ritratto — e il ritratto vi somiglia.'),
         ]),
    dict(n=6, nome='LO STUDIO DEL PERITO', voce_mappa='Lo Studio del Perito',
         req='Lo studio del vecchio perito rivale apre a chi insegue la falsa conferma: il '
             'testimone oculare che tutti citano e nessuno ha davvero vagliato.',
         chiave=('parola', 'IL TESTIMONE OCULARE'), art='Lo Studio del Perito.png',
         chiude=None,
         indizi=[
             'Il perito Coda si dice pronto a «confermare» la deposizione del testimone oculare '
             'contro Braga: «finalmente qualcuno lo inchioda, quel ciarlatano! Testimonio anch’io, '
             'se serve.» Ma non ha visto nulla: vuole solo unirsi alla curée. Astio, non prova.',
             'Tra le sue carte, il Sigillo «C.B.» che circola come prova regina. <i>(Esca: potete '
             'prendere il Sigillo «C.B.» — è la pietra piantata nelle casse di Braga due mesi fa, '
             'non lo tocca: è un intruso, non una firma.)</i>',
             'Coda, quando gli fate notare che non c’entra nulla: «e va bene, non ho visto niente! '
             'Ma se cade Braga, festeggio comunque. Solo… un momento: chi mi ha *chiesto* di '
             'confermare, ieri, non era della Gendarmeria. Non so chi fosse. Sapeva del testimone '
             'prima che lo sapessi io.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La falsa conferma',
                  testo='Coda è l’esca perfetta della scena montata: un rivale astioso pronto a '
                        'giurare il falso per rancore, così che l’accusa a Braga sembri avere più '
                        'voci. Ma Coda non ha visto niente e non prova niente; serve solo a fare '
                        'volume. Il dettaglio che conta è un altro: qualcuno, non la Gendarmeria, '
                        'lo ha *sollecitato* a confermare — qualcuno che orchestra il coro. La stessa '
                        'mano, di nuovo, che dispone le voci.'),
         ]),
    dict(n=7, nome='IL DEPOSITO REPERTI', voce_mappa='Il Deposito Reperti',
         req='Il deposito reperti della Gendarmeria apre solo a chi vuole toccare con mano il '
             'falso: il dossier che combacia, carta e inchiostro alla luce.',
         chiave=('parola', 'IL DOSSIER CHE COMBACIA'), art='Il Deposito Reperti.png',
         chiude=21,
         indizi=[
             'Il dossier fisico è qui, repertato: carta, inchiostro, sigilli. <i>(Reperto C: '
             'consegnate il Dossier Originale.)</i> Alla lente, l’inchiostro delle lettere «di '
             'trent’anni fa» è fresco di settimane, e la carta è tagliata tutta dallo stesso '
             'foglio. Trent’anni di crimini scritti in pochi giorni.',
             'La scientifica ha un reagente che rivela gli inchiostri recenti. <i>(Oggetto: '
             'prendete il Reagente per gli Inchiostri.)</i> Alla villa, sui documenti piazzati, '
             'tradirà i tell freschi che l’occhio nudo non coglie.',
             'L’archivista dei reperti, sottovoce: «il dossier è arrivato già repertato, capisce? '
             'Con i numeri, le buste, tutto. Nessuno lo ha raccolto: è nato archiviato. Come una '
             'messinscena che si porta dietro anche la propria catalogazione.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il dossier nato archiviato',
                  testo='Un dossier vero cresce per accumulo: un foglio oggi, un altro tra un mese, '
                        'inchiostri e carte di epoche diverse. Questo è nato tutto insieme, stessa '
                        'carta, stesso inchiostro fresco, già impaginato e numerato come una pratica '
                        'chiusa. Non è la prova di un delitto trentennale: è la *rappresentazione* '
                        'di un delitto trentennale, prodotta in una settimana da chi sapeva '
                        'esattamente che aspetto deve avere una prova per essere creduta.'),
         ]),
    dict(n=8, nome='LA BOTTEGA DELL’INCISORE', voce_mappa='La Bottega dell’Incisore',
         req='La bottega dell’incisore apre a chi ha capito che il dossier che combacia è stato '
             'fabbricato, non trovato: qualcuno ha inciso quelle prove.',
         chiave=('parola', 'IL DOSSIER CHE COMBACIA'), art='La Bottega dell’Incisore.png',
         chiude=None,
         indizi=[
             'Nel retro della bottega, gli strumenti di un incisore che lavora su commissione muta: '
             'bulini, ceralacca, lastre. <i>(Reperto B: consegnate la Lastra dell’Incisore.)</i> '
             'Una sola matrice ha battuto il sigillo «C.B.» e mezze lettere del dossier: le prove '
             'sono state stampate, non raccolte.',
             'Su un gancio, un mazzo di chiavi copiate di fresco, tra cui quelle di servizio della '
             'villa di Braga. <i>(Oggetto: prendete la Chiave di Servizio.)</i> «Chi apparecchia '
             'una scena,» dice l’incisore terrorizzato, «ha bisogno di entrare e uscire quando '
             'vuole. Le ho copiate io, che Dio mi perdoni.»',
             'L’incisore, con le mani che tremano: «un signore mai visto, paga in oro vecchio, '
             'carta di pregio. Mi ha dato un modello di grafia da riprodurre — perfetta, di uno '
             'che scrive svelto e sicuro — e mi ha detto: "falla sembrare del professore". Io ho '
             'inciso. Non ho chiesto. Chi paga in oro vecchio non lo chiedi.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le prove stampate',
                  testo='Un incisore, una matrice, pochi giorni: ecco come trent’anni di '
                        'colpevolezza entrano in un plico. Il sigillo «C.B.», le mezze lettere, i '
                        'timbri — tutto uscito dalla stessa mano su commissione anonima, pagato in '
                        'oro d’antica fusione e carta col giglio. La firma di sempre. Le prove '
                        'contro Braga non raccontano ciò che Braga ha fatto: raccontano ciò che '
                        'qualcuno vuole che abbiate visto.'),
         ]),
    dict(n=9, nome='LA VILLA DI BRAGA', voce_mappa='La Villa-Museo di Braga',
         req='La villa di Braga, di notte, prima che la Gendarmeria la sigilli: ci si va sapendo '
             'che è lì, sulla scena non ancora sigillata, che il falso è ancora vivo.',
         chiave=('parola', 'LA SCENA NON ANCORA SIGILLATA'), art='La Villa-Museo di Braga.png',
         chiude=None, in_quota=False,
         indizi=[
             'La villa di Braga sotto il cordone che si stringe: dentro, ombre che lavorano in '
             'silenzio, spostano, lucidano, cancellano. Sono gli Apparecchiatori, la squadra di '
             'scena di C.B., che posano gli ultimi tocchi del falso prima del sigillo.',
             'Sul pavimento dello studio, i tell del falso ancora freschi: inchiostri che non si '
             'sono asciugati, tagli di carta identici, il sigillo ribattuto. Documentarli è '
             'l’unico modo di provare che la scena è stata *scritta* — ma gli Apparecchiatori li '
             'stanno cancellando uno a uno.',
             'Nello studio segreto in fondo, il Capo Apparecchiatore posa l’ultima prova con la '
             'calma di un regista. In tasca, le istruzioni di lavoro: grafia di Braga, perfetta. '
             '<i>(Reperto A: se lo prendete, ottenete le Istruzioni con la Grafia di Braga.)</i>'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La scena da smontare',
                  testo='Nella villa silenziosa, ogni cosa è al suo posto — ed è proprio questa '
                        'perfezione a gridare il falso. Gli Apparecchiatori non rubano e non '
                        'uccidono: *scrivono*, con oggetti invece che con parole, la colpevolezza di '
                        'un innocente. Salvarne i tell prima che li cancellino, e prima che il '
                        'sigillo cali, è l’unico modo di riavvolgere la scena e leggere, sotto, la '
                        'mano che l’ha diretta. Non è la mano di Braga. È una delle nostre.'),
         ]),
]

# Tessere della villa (percorso lineare a 6: una casa, non un labirinto).
# Obiettivo = prendere il Capo Apparecchiatore (T6) e documentare i tell del
# falso (CANCELLAZIONE) prima del SIGILLO (soglia-Canto). Boss: il Capo.
TILES_15 = [
    dict(id='T1', nome='IL CANCELLO', exits={'N': 'T2'}, start='S',
         testo='Il cancello della villa di Braga, di notte: il cordone della Gendarmeria si sta '
               'formando attorno al muro di cinta. QUANDO RIVELATE QUESTA TESSERA: applicate '
               'l’esito delle Domande 3 e 4. Con la Chiave di Servizio entrate di soppiatto e '
               'saltate il cordone (un round di margine sul sigillo).',
         arbitro='CORDONE: senza la Chiave di Servizio, entrare costa tempo — 1 gendarme (Sgherro) '
                 'vi ferma al cancello e il sigillo parte con meno margine. Con la Chiave passate '
                 'dal servizio, silenziosi. Da qui, il pericolo non è la lama: è il tempo (il '
                 'sigillo) e la scena che si cancella.',
         hook='La Chiave di Servizio (dall’incisore): entrate dal retro, niente cordone, un round '
              'di margine in più sul sigillo.',
         cerca_vuoto='Solo il muro e le lanterne dei gendarmi che si avvicinano. Non c’è niente da '
                     'prendere qui: c’è una scena da smontare, dentro, prima che la chiudano.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='L’ATRIO', exits={'S': 'T1', 'N': 'T3'},
         testo='L’atrio della villa: tutto in ordine perfetto, ogni cimelio al suo posto, e '
               'proprio per questo sbagliato. QUANDO RIVELATE QUESTA TESSERA: la scena «perfetta» '
               'comincia; i primi tell del falso sono qui, ancora freschi.',
         arbitro='Nessun nemico stanziale ancora: qui si comincia a DOCUMENTARE i tell (Interagire). '
                 'Col Manuale Indiziario riconoscete un tell in più. Ogni tell documentato conta '
                 'per la Contro-busta; il tempo, però, corre verso il sigillo.',
         cerca='Un tell fresco: inchiostro non ancora asciutto su una lettera «di trent’anni fa» '
               '(documentabile — vale per la Contro-busta).',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LO STUDIO DI BRAGA', exits={'S': 'T2', 'N': 'T4'},
         testo='Lo studio del professore, dove il dossier è stato «trovato»: carte disposte con '
               'cura, un cassetto lasciato aperto ad arte. QUANDO RIVELATE QUESTA TESSERA: qui i '
               'tell sono fitti — e qui il Reagente rivela gli inchiostri freschi.',
         arbitro='Cuore della documentazione: più tell da salvare (Interagire). Il Reagente per '
                 'gli Inchiostri ne rivela uno in più. Attenti: gli Apparecchiatori stanno per '
                 'entrare, e da lì cominceranno a cancellare.',
         cerca='Sotto il tappeto, un ritaglio di carta identico a quello del dossier: la prova che '
               'il foglio è uno solo (documentabile).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='LA GALLERIA DEI CIMELI', exits={'S': 'T3', 'N': 'T5'},
         testo='La galleria delle lastre fonografiche e dei cimeli di Braga. QUANDO RIVELATE '
               'QUESTA TESSERA: appaiono gli APPARECCHIATORI, in coppia, e cominciano a CANCELLARE '
               'i tell — da questo round, ogni round ne spariscono.',
         arbitro='Da qui gli Apparecchiatori cancellano un tell per round (finché il Capo è in '
                 'piedi): correte a documentare prima che spariscano. Non vogliono uccidervi: '
                 'vogliono finire il lavoro e dileguarsi prima del sigillo.',
         hook='Il Manuale Indiziario (dall’archivio): riconoscete i tell al volo — ne documentate '
              'uno in più per round, tenendo il passo della cancellazione.',
         cerca_vuoto='Gli Apparecchiatori lucidano via le tracce sotto i vostri occhi. Ogni round '
                     'perso è un tell in meno: non fermatevi a frugare, documentate ciò che vedete.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LE SCALE DI SERVIZIO', exits={'S': 'T4', 'N': 'T6'},
         testo='Le scale di servizio, la via per cui gli Apparecchiatori entrano ed escono. '
               'QUANDO RIVELATE QUESTA TESSERA: i Sicari di scorta coprono la ritirata del Capo; '
               'il sigillo, intanto, si avvicina.',
         arbitro='Ultimo diaframma prima dello studio segreto. I Sicari (Sgherri) sbarrano le '
                 'scale. Se il sigillo è vicino, ogni round qui è un round in meno per prendere il '
                 'Capo prima che la Gendarmeria entri.',
         cerca_vuoto='Scalini di servizio e l’eco di passi che salgono di fretta: sono i vostri, o '
                     'sono i gendarmi al cancello? Salite: il Capo è in cima, e sta finendo.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LO STUDIO SEGRETO', exits={'S': 'T5'},
         testo='Lo studio segreto in fondo alla villa: il Capo Apparecchiatore posa l’ultima prova '
               'falsa con la calma di un regista. IL CAPO è qui, tra voi e la verità. QUANDO '
               'RIVELATE QUESTA TESSERA: prenderlo (Interagire) gli toglie le istruzioni — la prova '
               'che il caso è scritto — prima del sigillo.',
         arbitro='OBIETTIVO. Interagire col Capo Apparecchiatore (ridotto/abbattuto) ottiene le '
                 'Istruzioni con la Grafia di Braga. Con abbastanza tell documentati = Contro-busta '
                 '(vittoria piena). Se il sigillo scatta prima, o i tell sono troppo pochi, resta '
                 'solo la Busta pubblica (vittoria parziale). «Il metodo della società» (D3): dirgli '
                 'che avete riconosciuto il vostro metodo lo fa esitare (salta un attacco).',
         cerca_vuoto='Non c’è un tesoro: c’è un uomo da fermare prima che finisca, e delle '
                     'istruzioni da togliergli di tasca. Prendetelo, e uscite prima del sigillo.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_15 = [
    dict(nome='IL CAPO APPARECCHIATORE', att=3, dif=8, fer=6, mov=3, dan=2, boss=True,
         tipo='Il Regista della Scena (Boss)', art='Il Capo Apparecchiatore.png',
         note='Nessuna debolezza-oggetto (è un uomo). Finché è in piedi, i suoi Apparecchiatori '
              'cancellano un tell per round. «Il metodo della società» (D3 esatta): mostrargli che '
              'avete riconosciuto il vostro stesso metodo nel suo falso lo fa esitare — salta un '
              'attacco. Prenderlo (Interagire) ottiene le Istruzioni con la Grafia di Braga. Ai '
              'tavoli da 2-3 eroi non recupera mai Ferite (regola delle taglie).',
         bio_bestiario='Il Capo Apparecchiatore è il regista di scena di C.B.: non un sicario, un '
              'artigiano dell’inganno. Dirige la squadra che piazza le prove e cancella le tracce, '
              'e lo fa con la freddezza di chi ha studiato come si legge un uomo — per poterlo '
              'scrivere. Stanotte apparecchia l’ultima scena contro Braga, e ogni round che passa '
              'i suoi lucidano via un altro tell del falso. Robusto e metodico (Fer 6, Danno 2), '
              'difende il proprio lavoro col corpo, ma non è un fanatico: quando capisce che avete '
              'riconosciuto il *metodo* — il vostro stesso metodo — nel suo capolavoro, qualcosa in '
              'lui cede, perché sa cosa significa. Non è C.B. né il mandante: è la mano che esegue, '
              'e in tasca porta le istruzioni di chi la guida — una grafia di Braga troppo perfetta '
              'per essere di Braga. Ai tavoli da 2-3 eroi non recupera mai ferite (regola delle '
              'taglie). Prenderlo non chiude il caso pubblico: lo *riapre*, di nascosto, nella '
              'Contro-busta.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 15 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 15')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'lo smascheramento')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_15.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Gendarmeria, il Tribunale, la Gazzetta di Roccamora, la Stanza del Testimone.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 15')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). La Contro-busta si apre solo in spedizione.')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 41.5*mm, '! Deposito Reperti (7) chiude 21')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole che tornano', 4)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'la busta pubblica — le 4 domande (poi aprite la busta della soluzione)')
    doms = ['1. DOVE sono le prove contro Braga? (attenzione: serve più di una conferma)',
            '2. CHI accusa il dossier?',
            '3. COSA regge alla verifica? (e perché è un problema)',
            '4. COSA consegnate alla Gendarmeria?']
    for i, d in enumerate(doms):
        yd = yy - 9*mm - i*13*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 6.5*mm, W - 16*mm, yd - 6.5*mm)
    c.setFillColor(RED); c.setFont(F['sc'], 10)
    c.drawString(16*mm, yy - 9*mm - 4*13*mm, 'CONTRO-BUSTA (sigillata a parte): 5. CHI HA SCRITTO IL DOSSIER? — si apre solo dopo la spedizione.')
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 15 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 15 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la villa di Braga, prima del sigillo')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '15/cards/</b>). Le 6 tessere della villa sono in <b>Episodio 15/board/</b>. '
                  'Questo NON è un recupero né un inseguimento: è cogliere la <b>messinscena sul '
                  'fatto</b>. Obiettivo: prendere il <b>Capo Apparecchiatore</b> (T6) e '
                  '<b>documentare i tell</b> del falso prima che gli Apparecchiatori li '
                  '<b>cancellino</b> e prima del <b>SIGILLO</b> della Gendarmeria. Con abbastanza '
                  'tell salvati e il Capo preso si apre la <b>Contro-busta</b> — la verità che il '
                  'caso è stato <i>scritto</i>. Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>SIGILLO (soglia).</b> Quando il Canto raggiunge la <b>soglia-sigillo</b> '
                  '(indicata dalla Soluzione), la Gendarmeria entra e <b>sigilla la villa</b>: da '
                  'quel round non documentate più tell, gli Apparecchiatori si dileguano, resta la '
                  'sola cornice pubblica (vittoria parziale). Le carte crescendo spingono verso la '
                  'soglia; la <b>Chiave di Servizio</b> vi fa entrare presto (un round di margine).', BODY),
        Paragraph('• <b>CANCELLAZIONE.</b> Da quando gli Apparecchiatori appaiono (T4), ogni round '
                  'ne <b>cancellano un tell</b> (finché il Capo è in piedi). Voi <b>documentate</b> '
                  '(Interagire) i tell che potete: col <b>Manuale Indiziario</b> ne riconoscete uno '
                  'in più per round; il <b>Reagente</b> ne aggiunge uno all’inizio. Servono '
                  'abbastanza tell salvati per la Contro-busta.', BODY),
        Paragraph('• <b>OBIETTIVO e DOPPIA BUSTA.</b> Prendere il <b>Capo Apparecchiatore</b> (T6, '
                  'Interagire) dà le Istruzioni con la Grafia di Braga. Con i tell a sufficienza si '
                  'apre la <b>Contro-busta</b> («chi ha scritto il dossier?») = <b>vittoria '
                  'piena</b>. Pochi tell, o sigillo già scattato: solo la Busta pubblica = '
                  '<b>vittoria parziale</b>. Chiudere il caso senza mai entrare qui è la «vittoria» '
                  'di M. «Il metodo della società» (D3): il Capo salta un attacco.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_15:
        art_file = TILE_ART_15[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_15[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_15.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 15</b>. In campo: gli '
                  '<b>Apparecchiatori</b> e i <b>Sicari</b> (Sgherri: la squadra di scena — si '
                  'muovono in coppia e ogni round cancellano un tell) e <b>il Capo '
                  'Apparecchiatore</b> (il boss: il regista, nello studio segreto, T6). Nessun '
                  'mostro: il pericolo è il <b>tempo</b> (il sigillo) e la <b>perdita della prova</b> '
                  '(la cancellazione). Vittoria piena: Capo preso e tell a sufficienza (Contro-busta). '
                  'Ai tavoli da 2-3 eroi il Capo <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_15())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_15():
    """Miniature dell'Episodio 15. I segnalini Canto sono qui i segnalini del
    SIGILLO (il cordone della Gendarmeria che si stringe verso la soglia)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('APPARECCHIATORI / SICARI (x5, Sgherri)', [('Gli Apparecchiatori.png', 5)]),
        ('IL CAPO APPARECCHIATORE', [('Il Capo Apparecchiatore.png', 1)]),
        ('IL SIGILLO (CANTO)', [('Passi nel cortile.png', 1),
                                ('Il cordone si stringe.png', 1),
                                ('La Gendarmeria alla porta.png', 1)]),
    ]
    out = []
    for label, items in groups:
        ok = [(a, n) for a, n in items if os.path.exists(os.path.join(ARTWORKS_DIR, a))]
        for a, _ in items:
            if not os.path.exists(os.path.join(ARTWORKS_DIR, a)):
                print('  AVVISO: manca artworks/' + a + ' - miniatura saltata '
                      '(rigenerare quando arriva)')
        if ok:
            out.append((label, ok))
    return out


# ================================================================ SOLUZIONE

def soluzione():
    out_path = os.path.join(OUT_DIR, 'Soluzione (non aprire).pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 15 - Soluzione (non aprire)')

    def pagina(titolo, blocchi):
        parchment_art(c, W, H)
        rule_border(c, W, H)
        c.setFillColor(RED); c.setFont(F['sc'], 16)
        c.drawString(16*mm, H - 22*mm, titolo)
        y = H - 32*mm
        for b in blocchi:
            p = Paragraph(b, BODY)
            pw, ph = p.wrapOn(c, W - 32*mm, 200*mm)
            p.drawOn(c, 16*mm, y - ph)
            y -= ph + 6*mm
        c.showPage()

    pagina('soluzione — non aprire', [
        '<b>Stampate questo fascicolo senza leggerlo e sigillatelo in una busta.</b> Apritelo '
        'solo dopo aver risposto per iscritto alle 4 Domande della Busta pubblica.',
        '<b>Il caso.</b> Un dossier anonimo incastra il professor Braga come C.B.: tutto combacia. '
        'La città esulta, il Tribunale prepara l’arresto, la Società è chiamata a verificare.',
        '<b>La verità.</b> Il dossier è fabbricato da M. col metodo indiziario della Società (una '
        'delle 12 copie del manuale, consultata di recente). Gli Apparecchiatori l’hanno '
        'apparecchiato; stanotte cancellano i tell nella villa prima del sigillo. Braga è '
        'innocente: chi lo incastra è dentro la Società. Sventare = smontare la scena, prendere il '
        'Capo, aprire la <b>Contro-busta</b> («chi ha scritto il dossier?»).',
    ])
    pagina('la busta pubblica — 4 domande (risposte e vantaggi)', [
        '<b>1. DOVE sono le prove contro Braga?</b> Nel dossier alla Gendarmeria e nella villa (la '
        'perquisizione: il dossier fisico L7 + la scena L9 — serve più di una conferma). '
        '<i>Esatta:</i> sapete dove guardare — nel 1° round della spedizione non si pesca nessuna '
        'carta Minaccia. <i>Sbagliata:</i> entrate scomposti — 1 gendarme (Sgherro) appare in T1.',
        '<b>2. CHI accusa il dossier?</b> Il professor Cesare Braga (la testimonianza del vecchio '
        'giudice L2 + il referto della Gendarmeria L1 + il testimone istruito L4). <i>Esatta:</i> '
        'la Busta pubblica «si chiude» in ordine (la città esulta). <i>Sbagliata:</i> nessun '
        'effetto meccanico, ma senza questa non avete nemmeno la cornice.',
        '<b>3. COSA regge alla verifica? (e perché è un problema)</b> Tutto — perché il dossier '
        'segue il metodo della Società (l’archivio dei manuali L5, la copia consultata). <i>Esatta '
        '(«il metodo della società»):</i> al Capo Apparecchiatore potete gridare che avete '
        'riconosciuto il vostro metodo nel suo falso: gli fa saltare un attacco. <i>Sbagliata:</i> '
        'non aprite la strada alla Contro-busta con la stessa facilità.',
        '<b>4. COSA consegnate alla Gendarmeria?</b> Il fascicolo che chiude il caso pubblico. '
        '<i>Nota:</i> rispondere SOLO alle 4 Domande = «vittoria pubblica» (Braga arrestato) — ma '
        'è la soluzione che vi ha scritto M. La vittoria vera è la Contro-busta. Aiuti spedizione: '
        'la Chiave di Servizio (L8, salta il cordone T1), il Manuale Indiziario (L5, +1 tell/round), '
        'il Reagente (L7, +1 tell iniziale). <i>Esche:</i> la Deposizione del Testimone, il Sigillo '
        '«C.B.».',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — il Referto «Il dossier '
        'troppo pulito» (L1), la Testimonianza «Il vecchio giudice» (L2) e la Testimonianza «Il '
        'testimone istruito» (L4). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — la scena che si cancella', [
        '<b>Montaggio</b> (tessere in Episodio 15/board/, coperte tranne T1):<br/>'
        'T1 Il Cancello (partenza, da Sud) → T2 L’Atrio → T3 Lo Studio di Braga → T4 La Galleria '
        'dei Cimeli (appaiono gli Apparecchiatori, parte la cancellazione) → T5 Le Scale di '
        'Servizio → T6 Lo Studio Segreto (il Capo). Con la Chiave di Servizio si salta il cordone '
        'di T1.',
        '<b>Il sigillo.</b> Segnate il Canto come al solito. Alla <b>soglia-sigillo = Canto 5</b> '
        '(la Chiave di Servizio vi dà un round di margine entrando presto), la Gendarmeria sigilla: '
        'da quel round niente più documentazione, gli Apparecchiatori spariscono, resta la sola '
        'Busta pubblica. Le carte crescendo (passi/cordone) accelerano.',
        '<b>La cancellazione e i tell.</b> Ci sono <b>5 tell</b> del falso da documentare '
        '(Interagire, a T2/T3 soprattutto). Da T4 gli Apparecchiatori ne cancellano <b>2 per '
        'round</b> (finché il Capo è in piedi). Servono <b>4 tell documentati</b> per la '
        'Contro-busta. Il Manuale Indiziario: +1 documentato/round. Il Reagente: +1 tell iniziale.',
        '<b>Il Capo Apparecchiatore.</b> Boss: Att +3, Dif 8, Fer 6, Mov 3, Danno 2. Va '
        'ridotto/abbattuto e poi preso (Interagire) per le Istruzioni con la Grafia di Braga. '
        'Nessuna debolezza-oggetto. «Il metodo della società» (D3 esatta): saltare un attacco. Ai '
        'tavoli da 2-3 eroi non recupera ferite.',
        '<b>Vittoria.</b> Capo preso E 4+ tell documentati prima del sigillo = <b>vittoria '
        'piena</b> (si apre la Contro-busta se avete 4+ tell). Capo preso ma pochi '
        'tell, o sigillo già scattato = <b>vittoria parziale</b> (un dubbio, non una prova: l’Ep. '
        '17 parte più fragile). <b>Il mazzo:</b> 21 carte (7 Apparecchiatori/Sicari, 6 insidie di '
        'scena, 4 crescendo-sigillo, 4 eventi).',
    ])
    pagina('contro-busta, epilogo, frammento e bivio', [
        '<b>CONTRO-BUSTA — apritela SOLO se avete preso il Capo e documentato 4+ tell.</b><br/>'
        '<b>5. CHI HA SCRITTO IL DOSSIER?</b> Una mano interna alla Società: il metodo è quello del '
        'manuale (12 copie, la n. 7 consultata di recente), le istruzioni agli Apparecchiatori sono '
        'di grafia di Braga ma troppo perfette. Non un nome, ancora: «uno di noi». È il seme verso '
        'M. Rispondere = <b>vittoria piena</b>: avete rifiutato la soluzione perfetta.',
        '<b>EPILOGO — da leggere se aprite la Contro-busta.</b> «Il Capo Apparecchiatore non si '
        'scompone quando gli togliete le istruzioni di tasca: le guarda, poi guarda voi, quasi '
        'sollevato. "Bel lavoro," dice, "riconoscere il proprio metodo. Non tutti ne sono capaci." '
        'Fuori, la città festeggia l’arresto di un innocente. Voi tenete la prova che il caso è '
        'stato <i>scritto</i> — da chi ha il nostro manuale, il nostro metodo, e un vecchio conto '
        'con Braga. Il mostro non ha il volto del rivale. Ha il nostro.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 15:</b> <i>«Chi ha cucito questo caso conosce il nostro ago. '
        'Il manuale della Società ha dodici copie. Contatele.»</i> Conservatelo.',
        '<b>IL BIVIO — solo per chi ha aperto la Contro-busta; poi sigillate.</b><br/>'
        '<b>Avallare l’arresto di Braga.</b> La città festeggia, l’Ep. 16 è tranquillo (un '
        'testimone in più), ma un innocente è in cella e C.B. ha vinto un giro: l’Ep. 17 parte con '
        'un incrocio in meno.<br/>'
        '<b>Dichiarare pubblicamente il dubbio.</b> La stampa vi sbrana e la Società si spacca (Ep. '
        '16-17: un testimone in meno ovunque), ma Braga, protetto, vi consegnerà nell’Ep. 17 il suo '
        'archivio privato su M.: trent’anni di rivalità.<br/>'
        'Chi ha chiuso solo la Busta pubblica ha già scelto, senza saperlo, di avallare. Scrivete '
        'la scelta sul retro del Frammento n. 15.',
        '<b>AGGANCIO.</b> A verbale chiuso, M. vi convoca in persona: «Ottimo lavoro. Archiviate '
        'tutto e riposatevi: vi ho trovato io il prossimo caso. Una cosa semplice.» È la prima '
        'volta che è lui a darvi un caso.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI15_DESC = {
    1: "La Gendarmeria custodisce il plico anonimo: il dossier più pulito mai "
       "visto, arrivato già ordinato come una pratica chiusa. Il maresciallo "
       "firmerebbe l'arresto a occhi chiusi — ed è proprio la fretta di tutti a "
       "insospettire chi guarda meglio.",
    2: "Il Tribunale prepara il processo del secolo: il rivale del presidente "
       "della Società inchiodato dal metodo della Società stessa. Un vecchio "
       "giudice, però, riconosce nel dossier una mano che il metodo non lo "
       "subisce: lo insegna.",
    3: "La redazione della Gazzetta ha già il titolo — «IL MOSTRO HA UN VOLTO» "
       "— ma Ranuzzi fiuta la scena montata. Qui si sa chi, a Roccamora, "
       "padroneggia il metodo indiziario: una manciata di nomi, tutti attorno "
       "alla confraternita.",
    4: "La stanza del testimone oculare, quello che ha «visto» Braga: sicuro, "
       "preciso, senza un'esitazione. Troppo. Chi ricorda davvero dubita; chi "
       "recita una parte scritta da altri torna sempre al binario, e qui il "
       "binario scricchiola.",
    5: "L'archivio dei manuali della Società: dodici copie numerate del metodo "
       "indiziario, tutte presenti — e una, la n. 7, riletta di recente da una "
       "mano che ha cancellato la propria firma. Chi ha ripassato il metodo, "
       "poco prima che il dossier nascesse?",
    6: "Lo studio del perito Coda, pronto a «confermare» il testimone contro "
       "Braga per puro astio: l'esca perfetta della scena montata, una voce in "
       "più nel coro. Ma qualcuno — non la Gendarmeria — lo ha sollecitato a "
       "farlo, e sapeva del teste prima di lui.",
    7: "Il deposito reperti della Gendarmeria, dove il dossier fisico attende "
       "il processo: carta e inchiostro alla lente rivelano settimane, non "
       "trent'anni. Un dossier nato già archiviato — con i suoi numeri, le sue "
       "buste — come una messinscena che porta la propria catalogazione.",
    8: "La bottega dell'incisore, dove il falso è stato materialmente prodotto: "
       "una matrice per il sigillo «C.B.» e le lettere, un mazzo di chiavi "
       "copiate della villa. Un artigiano terrorizzato, pagato in oro vecchio "
       "da un signore mai visto, che gli ha ordinato una grafia da imitare.",
    9: "La villa di Braga, di notte, prima del sigillo: dentro, gli "
       "Apparecchiatori posano gli ultimi tocchi del falso e cancellano le "
       "tracce del proprio lavoro. È l'unico posto dove la scena è ancora viva "
       "— dopo il sigillo, resterà solo la versione ufficiale.",
}

OGGETTI_LUOGO_15 = {
    5: ['Il Manuale Indiziario'],
    7: ['Il Reagente per gli Inchiostri'],
    8: ['La Chiave di Servizio'],
    4: ['La Deposizione del Testimone'],
    6: ['Il Sigillo «C.B.»'],
}

TILE_ART_15 = {t['id']: t['id'] + '-ep15.png' for t in TILES_15}
LUOGHI15_CROP = {}

TESSERE_DESC_15 = {
    'T1': "Il cancello della villa di Braga nella notte: il muro di cinta, il "
          "viale di ghiaia, e il cordone della Gendarmeria che si sta chiudendo "
          "attorno come un cappio lento. Dentro, una sola finestra è illuminata, "
          "e si muove qualcuno che non dovrebbe esserci.",
    'T2': "L'atrio della villa è un quadro: ogni cimelio al suo posto, ogni "
          "quadro dritto, la polvere spolverata di fresco. È tutto così perfetto "
          "da sembrare finto — e lo è. Sotto la perfezione, i primi tell della "
          "messinscena luccicano, ancora umidi.",
    'T3': "Lo studio del professore, dove il dossier è stato 'trovato': un "
          "cassetto lasciato aperto ad arte, carte disposte perché venissero "
          "lette in un certo ordine. Inchiostri freschi su lettere datate "
          "trent'anni fa. Il falso, qui, è fitto come una foresta.",
    'T4': "La galleria dei cimeli, le lastre fonografiche lungo le pareti. E in "
          "mezzo, immobili come mobili, gli Apparecchiatori: silenziosi, in "
          "coppia, con lo straccio e la spugna. Vi vedono, non si allarmano — "
          "continuano a cancellare. Il tempo è dalla loro parte.",
    'T5': "Le scale di servizio, strette e buie, la via per cui la squadra di "
          "scena entra ed esce senza farsi vedere. Sui gradini, i Sicari di "
          "scorta fanno da tappo, per dare al Capo il tempo di finire. Da sopra, "
          "il fruscio di carta di chi lavora con calma.",
    'T6': "Lo studio segreto in fondo alla villa, che nessun inventario "
          "registra. Il Capo Apparecchiatore è chino su un tavolo, posa l'ultima "
          "prova con la cura di un orafo. Non alza nemmeno lo sguardo. In tasca, "
          "il foglio delle istruzioni: la grafia di Braga, perfetta come Braga "
          "non l'ha mai avuta.",
}

ESAMI_CARBONE_15 = {
    'IL MANUALE INDIZIARIO': '«Il dossier segue riga per riga il metodo di lettura che la Società '
                'insegna: non un falsario qualunque, ma uno che ha studiato sul <i>nostro</i> '
                'manuale. E delle dodici copie, la n. 7 è stata consultata il mese scorso, la firma '
                'cancellata. Chi ha scritto il falso non ha rubato il metodo: lo aveva.»',
    'LA LASTRA DELL’INCISORE': '«Una sola matrice ha battuto il sigillo "C.B." e mezze lettere del '
                'dossier: le prove non sono state raccolte, sono state <i>stampate</i>, tutte dalla '
                'stessa mano, in pochi giorni, su commissione anonima pagata in oro vecchio e carta '
                'col giglio. La firma di sempre.»',
    'LE ISTRUZIONI CON LA GRAFIA DI BRAGA': '«La calligrafia è di Braga, perfetta — troppo. Un uomo '
                'non scrive mai due volte identico; un falsario che lo <i>imita</i> col metodo '
                'morelliano, sì. Chi ha scritto questo conosce Braga e il metodo meglio di Braga '
                'stesso: è dentro casa nostra. Il mostro ha il nostro volto.»',
}

OGGETTI_TESSERA_15 = {'T3': ['Un Ritaglio del Dossier']}


def luoghi():
    """Luoghi.pdf Episodio 15 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 15 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_15, 'Episodio 15')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_15.get(n, [])]

    for L in LUOGHI_15:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI15_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI15_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_15)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_15
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL CAPO APPARECCHIATORE', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 15')
    print('OK episodio 15')
