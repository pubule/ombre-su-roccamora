# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 9: Il processo (Episodio 9/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-9.md e CAMPAGNA-EPISODI.md).
Mythology-light: il processo dei fatti dell'Atto I, la SCORTA notturna del
teste chiave, il Sicario Gentile (primo agente diretto di C.B./M. visto in
faccia). Un solo seme: la parcella dell'avvocato in oro vecchio.

Varietà strutturale (regola 2026-07-18): obiettivo non-boss di tipo
SCORTA (portare Riva vivo al Molo del Lume); il boss caccia il teste.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche
vivono in scripts/cardconjurer/cards-data.js, blocco EPISODIO 9).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 9', 'pdf')
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

LETTERA_9 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Domani Roccamora processa i fatti dell’inverno. Sul banco degli imputati siede chi "
    "sapete — o un uomo scelto da altri per sembrargli. Un avvocato arrivato da fuori, il "
    "signor <b>Grassi</b>, smonta le nostre prove come un orologiaio: legalmente, "
    "educatamente, e con una parcella che nessuno gli ha visto incassare. Un giurato non ci "
    "guarda più. E il nostro teste — <b>Anselmo Riva</b>, il sacrestano che vide le chiatte "
    "sotto la Cattedrale — sta per ritrattare, perché qualcuno, di notte, gli ha descritto "
    "la propria morte.<br/><br/>"
    "Un processo non cerca la verità: cerca una storia che regga in appello. Qualcuno sta "
    "scrivendo la nostra. Portatemi Riva vivo alla deposizione — e badate a CHI ve lo chiede "
    "di non farlo. Avete <b>6 ore</b>, dalle 18:00 alle 24:00; poi comincia la notte, e la "
    "scorta.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: il Tribunale (chiude alle 20), la Gazzetta, la "
    "Pensione del Giurato e la Gendarmeria. Gli altri andranno sbloccati.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via:
# «la deposizione di domani» da L1 e L4, «il fondo caritatevole» da L2 e L3,
# «l'oro della parcella» da L3 e L2, «il forestiero coi guanti» da L4 e L5
# (interna), il Salvacondotto da L1. Rivelatorio (D2) su L2, L3, L4.
LUOGHI_9 = [
    dict(n=1, nome='IL TRIBUNALE', voce_mappa='Il Tribunale',
         req='Disponibile dall’inizio', art='Il Tribunale.png',
         chiude=20,
         indizi=[
             'Il ruolo d’udienza, affisso nell’atrio: «Il Popolo contro l’imputato dei '
             'fatti dell’inverno — deposizione del teste Anselmo Riva DOMANI, prima '
             'chiamata». Riva è la chiave: senza di lui, la storia dell’accusa è aria.',
             'Il cancelliere, di malumore, tende una carta col sigillo del giudice: «un '
             'Salvacondotto per le vostre… incombenze notturne. Apre i posti di blocco '
             'senza spiegazioni. Ordine del presidente: il teste arrivi vivo. Ma lo '
             'firmo entro le venti, poi chiudo — dopo, arrangiatevi.» <i>(Oggetto: '
             'prendete la carta Il Salvacondotto del Giudice — solo entro le 20:00.)</i>',
             'Nell’aula vuota, il banco della difesa è già apparecchiato per domani: '
             'faldoni nuovi, calamai pieni, e un fazzoletto di lino con le iniziali '
             'ricamate «T.G.» — profumato. L’avvocato Grassi cura le apparenze come chi '
             'sa di recitare una parte molto più grande di lui.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il banco della difesa',
                  testo='I faldoni della difesa sono ORDINATI per la deposizione di domani: '
                        'ogni obiezione già scritta, ogni testimone già smontato — compreso '
                        'Riva, con una nota a lato: «ritratta o non compare». La difesa non '
                        'improvvisa: sa GIÀ cosa dirà Riva, o cosa non dirà. Qualcuno gliel’ha '
                        'promesso.'),
         ]),
    dict(n=2, nome='LA REDAZIONE DELLA GAZZETTA', voce_mappa='La Gazzetta',
         req='Disponibile dall’inizio', art='La Gazzetta.png',
         chiude=None,
         indizi=[
             'Ranuzzi copre il processo e ha un dente avvelenato: «l’avvocato Grassi non ha '
             'clienti in città, non ha studio qui, non ha un motivo al mondo per difendere '
             'questo caso. Eppure è arrivato in prima classe. Chi lo paga? Un “fondo '
             'caritatevole” che non ho trovato da nessuna parte.»',
             'Sulla scrivania di Ranuzzi, una parcella intravista al volo e mai avuta in '
             'mano: «marenghi d’oro, vecchi, in una busta piegata coi guanti. Come le '
             'ricevute del porto di cui mi parlaste. Stesso oro, stessa piega. Ma provatelo '
             'voi, in tribunale.» <i>(Esca: potete prendere la carta La Lettera di '
             'Ranuzzi.)</i>',
             'Ranuzzi ha una scorciatoia per voi, non una prova: «il giurato Bo, quello che '
             'non vi guarda, alloggia alla Pensione Serena. Beve, e ha paura. Se qualcuno '
             'crolla in questa storia, crolla lui. Andateci prima che ci vada il fondo '
             'caritatevole.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Ranuzzi',
                  testo='«Ho visto arrivare l’avvocato alla stazione: nessuno ad '
                        'aspettarlo tranne un uomo elegante coi guanti chiari, che gli ha '
                        'preso la valigia e non ha detto una parola. L’ho seguito: quel '
                        'signore non alloggia con l’avvocato. Alloggia solo, alla Locanda '
                        'del Forestiero. E non è un cameriere: i camerieri non hanno quelle '
                        'spalle, e non si guardano MAI alle spalle come lui.»'),
         ]),
    dict(n=3, nome='LA PENSIONE DEL GIURATO', voce_mappa='Pensione Serena',
         req='Disponibile dall’inizio', art='Pensione Serena.png',
         chiude=None,
         indizi=[
             'Amilcare Bo, il giurato, beve nella sua stanza e non vi apre finché non '
             'nominate il fondo caritatevole: allora scoppia. «Mi hanno pagato i debiti '
             'tutti insieme, tre mesi fa. In oro vecchio. Poi mi hanno “consigliato” un '
             'verdetto. Io volevo la verità, signori! Ma ho tre figlie, e loro sanno i '
             'nomi delle mie tre figlie.»',
             'Bo trema e conta: «il colpo al teste è per stanotte. L’ho sentito dire '
             'all’uomo coi guanti, sulle scale: “tra l’una e le tre, nell’intervallo delle '
             'ronde”. Riva non arriverà mai a deporre, se non lo spostate voi. Io non ho '
             'detto niente. Io ho tre figlie.»',
             'Sul tavolo di Bo, la lettera di «consiglio»: nessuna firma, carta di pregio, '
             'e in fondo una sola iniziale a inchiostro — «M.». «Me l’hanno infilata sotto '
             'la porta. Chi scrive così non minaccia: INFORMA. È peggio.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Amilcare Bo',
                  testo='«L’oro della parcella dell’avvocato e l’oro dei miei debiti sono '
                        'lo STESSO oro: marenghi vecchi, bordi molati. Ce l’ho ancora una '
                        'moneta, guardate. Chi ha comprato me ha comprato lui, e ha '
                        'comprato il verdetto. Non è un avvocato che difende un cliente: è '
                        'un impiegato che chiude una pratica. E la pratica siamo NOI.»'),
         ]),
    dict(n=4, nome='LA GENDARMERIA', voce_mappa='La Gendarmeria',
         req='Disponibile dall’inizio', art='La Gendarmeria.png',
         chiude=None,
         indizi=[
             'L’usciere fidato del Tribunale, che stasera è di guardia qui, abbassa la '
             'voce: «il teste Riva l’ho nascosto io, nella sacrestia del Tribunale, dietro '
             'l’aula. Un solo uomo di guardia: me. Ma io stanotte smonto, e chi monta dopo '
             'di me… non lo conosco. Portatelo via prima del cambio.»',
             'Sul banco degli oggetti smarriti, un tesserino della Gendarmeria «trovato»: '
             'utile a un agente in servizio, non a una scorta clandestina di notte. '
             '<i>(Esca: potete prendere la carta Il Tesserino della Gendarmeria.)</i> '
             'Accanto, un fischietto d’ordinanza vero. <i>(Oggetto: prendete la carta Il '
             'Fischietto d’Allarme.)</i>',
             'Il brigadiere, sottovoce e a disagio: «è arrivato in città un forestiero coi '
             'guanti chiari, alla Locanda del Forestiero. Documenti in regola, troppo in '
             'regola. Non ha fatto niente. Ma da quando è arrivato, i miei uomini “non '
             'sono disponibili” proprio nelle ore in cui servirebbero. Qualcuno, sopra di '
             'me, ha dato ordini.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='L’usciere del Tribunale',
                  testo='«La deposizione di domani terrorizza gente importante, signori: da '
                        'quando ho nascosto Riva, mi hanno offerto uno stipendio annuo per '
                        'dire dov’è. In oro vecchio. Ho detto di no — ho giurato sul '
                        'Vangelo, io. Ma non tutti giurano, e il cambio di guardia di '
                        'stanotte lo fa uno che ai Vangeli preferisce i marenghi.»'),
         ]),
    dict(n=5, nome='LO STUDIO DELL’AVVOCATO GRASSI', voce_mappa='Studio Grassi',
         req='Lo studio provvisorio dell’avvocato non riceve: «l’avvocato prepara la '
             'deposizione». Ma chi nomina il fondo giusto — quello che lo paga — trova un '
             'praticante spaventato e una porta socchiusa.',
         chiave=('parola', 'IL FONDO CARITATEVOLE'), art='Studio Grassi.png',
         chiude=19,
         indizi=[
             'Il registro delle «spese vive» dell’avvocato: voci innocue, tranne una '
             'ricorrente — «cortesie alle ronde, zona porto e centro, notturne». '
             'L’avvocato non paga solo giurati e testimoni: paga il BUIO. Le ronde di '
             'stanotte, tra l’una e le tre, sono già comprate. <i>(Reperto: consegnate il '
             'Registro delle Ronde.)</i>',
             'La parcella dell’avvocato, ancora nella busta: marenghi d’oro vecchio — la '
             'lega dell’ansa morta — e la busta è piegata in tre, senza un’ombra di dita, '
             'coi guanti. <i>(Reperto B: consegnate la Parcella dell’Avvocato.)</i>',
             'Appunti per l’arringa: «ridurre il tutto a una SETTA di truffatori — la '
             'Società del Lume, dilettanti esaltati. Caso chiuso, nessun mandante, nessun '
             'oltre.» L’avvocato non difende l’imputato: seppellisce la pista che porta '
             'oltre di lui.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il registro delle ronde',
                  testo='Le «cortesie alle ronde» hanno un orario preciso, ripetuto: le '
                        'pattuglie del porto e del centro «si diradano» tra l’una e le tre. '
                        'Non è un caso: è una FINESTRA, comprata e pagata, ritagliata su '
                        'misura per qualcosa che deve accadere in strada senza testimoni in '
                        'divisa. Qualcosa come la scomparsa di un teste.'),
         ]),
    dict(n=6, nome='LA SACRESTIA DEL TRIBUNALE', voce_mappa='Il Tribunale, retro',
         req='La sacrestia dietro l’aula è sbarrata e sorvegliata: si entra solo sapendo '
             'cosa custodisce — la parola giusta, quella che vale più di una chiave.',
         chiave=('parola', 'LA DEPOSIZIONE DI DOMANI'), art='Sacrestia del Tribunale.png',
         chiude=None,
         indizi=[
             'Anselmo Riva è qui, sveglio da giorni, con addosso ancora la mantella da '
             'sacrestano: «ho visto le chiatte, signori. Cariche, sotto la Cattedrale, la '
             'notte del rituale. Se lo dico, domani, muoio. Se non lo dico, muoio dentro. '
             'Portatemi voi, allora — ma sappiate che LORO sanno che venite.»',
             'Sul tavolo, il verbale della ritrattazione GIÀ SCRITTO, con la data di '
             'domani e uno spazio bianco per la firma di Riva: la bugia è pronta prima '
             'della verità. Manca solo una firma — o un’assenza. <i>(Reperto A: '
             'consegnate il Verbale della Ritrattazione.)</i>',
             'La mantella da sacrestano di Riva, grigia e anonima come cento altre in '
             'città: nella folla, di notte, chi cerca «il teste» cercherà un uomo, non un '
             'sacrestano tra i sacrestani. <i>(Oggetto: prendete la carta La Mantella da '
             'Sacrestano.)</i>'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il verbale già scritto',
                  testo='La ritrattazione è battuta a macchina PRIMA che Riva l’abbia '
                        'firmata — anzi, prima che l’abbiano convinto. Chi l’ha preparata '
                        'non spera che Riva ritratti: DÀ PER SCONTATO che entro domani Riva '
                        'non parlerà, in un modo o nell’altro. Il foglio bianco per la '
                        'firma è un atto di fede in un sicario.'),
         ]),
    dict(n=7, nome='LA CASA DEL TESTE', voce_mappa='Casa di Anselmo Riva',
         req='La casa di Riva è vuota e sigillata dalla paura. Chi arriva sapendo del '
             'denaro giusto — l’oro che gira in questa storia — trova la porta ceduta e '
             'una minaccia lasciata bene in vista.',
         chiave=('parola', 'L’ORO DELLA PARCELLA'), art='Casa del Teste.png',
         chiude=None,
         indizi=[
             'La casa è vuota: Riva è al sicuro (per ora). Ma sul cuscino, lasciato con '
             'cura, un disegno a matita: la sua tomba, con la sua lapide, e una data. La '
             'data è DOMANI. Chi minaccia così non vuole spaventare per tacere: vuole '
             'spaventare per far RITRATTARE, e se non basta, procedere.',
             'La data sul disegno è aggiunta a inchiostro, mano diversa da quella della '
             'matita: chi ha disegnato la tomba non sapeva il giorno; chi l’ha datata sì. '
             'Due persone, due ruoli — uno che spaventa, uno che DECIDE. <i>(Esame di '
             'Carbone disponibile: la minaccia sul cuscino.)</i>',
             'Sotto il letto, la valigia di Riva pronta da giorni: non ha mai pensato di '
             'scappare da solo. Aspettava qualcuno di cui fidarsi. Aspettava voi — o '
             'chiunque arrivasse prima dell’uomo coi guanti.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La minaccia sul cuscino',
                  testo='A toccare il disegno della tomba: si vede una mano guantata di '
                        'chiaro che posa il foglio sul cuscino con delicatezza, quasi con '
                        'rispetto, e una seconda mano — nuda, con un anello da notaio — che '
                        'lo raccoglie, ci scrive la data, e lo rimette a posto. Il sicario '
                        'obbedisce; il notaio decide. La visione dura un rintocco.'),
         ]),
    dict(n=8, nome='LA LOCANDA DEL FORESTIERO', voce_mappa='Locanda del Forestiero',
         req='La locanda del forestiero è discreta e cara. Chi lo nomina per quello che è '
             '— il forestiero coi guanti — trova l’oste loquace per la paura, e la stanza '
             'giusta al primo piano. Ma dopo le 23 la stanza è vuota: lui è già in strada.',
         chiave=('parola', 'IL FORESTIERO COI GUANTI'), art='Locanda del Forestiero.png',
         chiude=23,
         indizi=[
             'La stanza del forestiero è ordinata come una caserma: un solo bagaglio, tre '
             'paia di guanti chiari identici piegati a ventaglio, e nessun effetto '
             'personale — nessuna lettera, nessun ritratto, nessun nome. Un uomo che non '
             'lascia tracce perché è ADDESTRATO a non lasciarne.',
             'Nel cestino, un biglietto appallottolato e non bruciato — l’unico errore: '
             'carta di pregio, poche righe, firma «M.». «Che sia PULITO. Il teste non '
             'deve avere un volto sui giornali di domani, solo un’assenza.» <i>(Reperto C: '
             'consegnate il Biglietto di C.B.)</i>',
             'L’oste, terrorizzato: «paga in oro, è cortese, non alza mai la voce. Ma ieri '
             'un ladruncolo gli ha frugato la stanza, e il forestiero l’ha… convinto a '
             'restituire. Il ragazzo adesso non parla più: sorride e trema. Non l’ha '
             'toccato. Gli ha solo PARLATO.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il biglietto di C.B.',
                  testo='Carta di pregio, filigrana della cartiera dei casi passati; e la '
                        '«M.» della firma ha lo stesso ricciolo del Tessitore delle lettere '
                        'd’incarico. La mano che vi ha assunti scrive gli ordini a chi vi '
                        'dà la caccia. «Che sia pulito» a doppia lettura: uccidere senza '
                        'scandalo, o far sparire senza sangue? Perfino l’ordine è ambiguo, '
                        'come chi lo firma.'),
         ]),
    dict(n=9, nome='L’APPRODO DELLA SOCIETÀ', voce_mappa='Il Molo del Lume',
         req='L’approdo segreto della Società è protetto dall’oscurità e dal Salvacondotto: '
             'senza la carta del giudice, i posti di blocco notturni fermano chiunque — '
             'anche chi scorta un innocente.',
         chiave=('oggetto', 'IL SALVACONDOTTO DEL GIUDICE'), art='Molo del Lume.png',
         chiude=None,
         indizi=[
             'Il molo segreto della Società: un battello basso, due rematori fidati, una '
             'lanterna schermata. È QUI che finisce la scorta — Riva a bordo, e la verità '
             'salva fino all’alba.',
             'I rematori hanno studiato la rotta: «dal Tribunale a qui, di notte, si passa '
             'per il Vicolo dei Tintori, il Ponte delle Catene, il Mercato Coperto e la '
             'Salita dei Lampionai. Col Salvacondotto possiamo saltare il pezzo peggiore. '
             'Senza, li facciamo tutti — e tutti sono d’agguato.»',
             'Sulla bitta, un guanto chiaro, lasciato lì DI PROPOSITO: il forestiero sa '
             'del molo. Sa la rotta. Vi aspetta da qualche parte, lungo la strada — e '
             'vuole che lo sappiate.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il guanto sulla bitta',
                  testo='A raccogliere il guanto chiaro: si vede l’uomo che se l’è sfilato '
                        'guardando il molo dall’ombra, con la calma di chi ha già scelto il '
                        'punto in cui aspettarvi — non qui, dove sareste in guardia, ma '
                        'prima, dove crederete d’avercela fatta. Il Sicario Gentile non '
                        'insegue: ANTICIPA. La visione dura un rintocco.'),
         ]),
]

# Tessere della scorta (percorso lineare a 6: e' una fuga). Il teste RIVA
# e' un PNG fragile che gli aggressori bersagliano.
TILES_9 = [
    dict(id='T1', nome='LA SACRESTIA (USCITA DI SERVIZIO)', exits={'N': 'T2'}, start='S',
         testo='La porticina sul retro del Tribunale dà su un cortile buio. Riva stringe '
               'la sua mantella e non dice niente: ha smesso di parlare da quando ha '
               'firmato di NON firmare. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito '
               'delle Domande 4 e 1 (vedi la busta della Soluzione). Da qui parte la '
               'scorta: Riva deve arrivare vivo al Molo del Lume (T6).',
         cerca_vuoto='Il cortile è vuoto: un pozzo, una carriola, e il silenzio di chi '
                     'trattiene il fiato. La città, stanotte, vi ascolta.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL VICOLO DEI TINTORI', exits={'S': 'T1', 'N': 'T3'},
         testo='Un budello tra le tintorie: vasche di guado, panni stesi che gocciolano '
               'nel buio, l’odore acre che chiude la gola. QUANDO RIVELATE QUESTA '
               'TESSERA: 1 Sgherro appare su OGNI uscita (i bravi del fondo aspettavano '
               'proprio qui).',
         arbitro='Gli aggressori puntano RIVA: nella Fase Nemici, ogni nemico che può '
                 'raggiungere Riva attacca lui invece di un eroe. Tenetelo in mezzo.',
         cerca='Dietro una vasca, una pertica da tintore: un’arma di fortuna (+1 a un '
               'attacco, poi si spezza).',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='IL PONTE DELLE CATENE', exits={'S': 'T2', 'N': 'T4'},
         testo='Il ponte obbligato, esposto sull’acqua nera, le grandi catene che lo '
               'chiudevano un tempo arrugginite ai lati. A metà, elegante, un uomo coi '
               'guanti chiari vi aspetta appoggiato al parapetto. QUANDO RIVELATE QUESTA '
               'TESSERA: appare IL SICARIO GENTILE. Si toglie il cappello: «signori. Mi '
               'dispiace per quello che segue.»',
         arbitro='Il Sicario Gentile CACCIA il teste: ogni suo turno, se può raggiungere '
                 'Riva, attacca LUI (non gli eroi). Mov 4: fatevi trovare tra lui e Riva. '
                 'Non ha debolezza-oggetto. «Il nome sbagliato» (Domanda 2 esatta): '
                 'gridategli che il suo mandante lo brucerà come ha bruciato Ferri — '
                 'salta la sua PRIMA attivazione.',
         cerca_vuoto='Solo catene rugginose e vuoto sotto le assi. Sul ponte non ci si '
                     'nasconde: si passa, in fretta.',
         arredi=[(2, 2, 'altare')]),
    dict(id='T4', nome='IL MERCATO COPERTO DI NOTTE', exits={'S': 'T3', 'N': 'T5'},
         testo='Banchi vuoti a perdita d’occhio sotto la tettoia, teli abbassati, sagome '
               'di manichini e ceste che nel buio sembrano gente. Un labirinto di angoli '
               'ciechi. QUANDO RIVELATE QUESTA TESSERA: 1 Sgherro e 1 Sicario appaiono '
               'tra i banchi.',
         arbitro='CON LA MANTELLA DA SACRESTANO: Riva si confonde tra le sagome — il '
                 'PRIMO attacco portato a Riva in questa tessera MANCA automaticamente '
                 '(«non era lui, era un manichino»). Poi vale la regola normale.',
         cerca='Sotto un banco, una lanterna cieca dimenticata: +1 alle prove NERVI '
               'finché la porta chi l’ha trovata.',
         arredi=[(0, 1, 'casse'), (3, 1, 'casse'), (1, 3, 'casse')]),
    dict(id='T5', nome='LA SALITA DEI LAMPIONAI', exits={'S': 'T4', 'N': 'T6'},
         testo='L’unica risalita verso il molo: una scalinata stretta tra due muri, i '
               'lampioni spenti (i lampionai sono stati «convinti» a saltare il giro). '
               'QUANDO RIVELATE QUESTA TESSERA: se il Sicario Gentile è ancora in gioco, '
               'si è portato AVANTI e vi aspetta in cima (piazzatelo sull’uscita Nord); '
               'altrimenti, 2 Sgherri di retroguardia dal basso.',
         arbitro='Al buio, le prove NERVI di questa tessera sono a Difficile (Media con '
                 'una lanterna). Il Sicario, se qui, continua a cacciare Riva.',
         cerca_vuoto='Gradini viscidi, muri ciechi, un lampione spento che dondola. In '
                     'cima, l’odore del fiume: il molo è vicino.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='IL MOLO DEL LUME', exits={'S': 'T5'},
         testo='L’approdo segreto: il battello basso, i due rematori con i remi già in '
               'acqua, la lanterna schermata. Riva a bordo, e la notte è vinta. QUANDO '
               'RIVELATE QUESTA TESSERA: portate Riva alla barca (Interagire) — è la '
               'vittoria.',
         arbitro='VITTORIA: Riva vivo a bordo del battello (Interagire in T6). Se il '
                 'Sicario Gentile vi ha inseguiti fin qui, i due rematori entrano nella '
                 'mischia (contano come 2 alleati di truppa, Att +1, per coprire '
                 'l’imbarco).',
         cerca_vuoto='La barca dondola, l’acqua sciaborda. Non c’è niente da cercare qui: '
                     'c’è solo da partire, con Riva a bordo.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_9 = [
    dict(nome='IL SICARIO GENTILE', att=3, dif=8, fer=4, mov=4, dan=2, boss=True,
         tipo='Il Primo Agente di C.B. (Boss)', art='Il Sicario Gentile.png',
         note='CACCIA IL TESTE: ogni turno, se può raggiungere Riva, attacca lui (non gli '
              'eroi). Nessuna debolezza-oggetto. «Il nome sbagliato» (D2 esatta): salta la '
              'sua prima attivazione. Col Bivio «Ferri vivo»: +1 Danno la prima volta che '
              'raggiunge Riva.',
         bio_bestiario='Il primo uomo di C.B. che la Società vede in faccia — e vorrebbe '
              'non averlo visto. Elegante, guanti chiari sempre puliti, la cortesia di '
              'chi ha imparato le buone maniere per farne un’arma: si scusa prima di '
              'colpire, si complimenta dopo. Non prova odio e non prova gusto: è un '
              'professionista, e il suo lavoro stanotte è un teste. Caccia RIVA con la '
              'pazienza di un cacciatore: ogni suo turno, se può arrivare al teste, va da '
              'lui e non da voi. Movimento 4: non lo seminate — lo si abbatte, lo si '
              'inganna (la Mantella, il Fischietto), o lo si fa esitare ricordandogli che '
              'i mandanti bruciano i loro sicari come hanno bruciato Ferri (Domanda 2 '
              'esatta: salta la prima attivazione). Ai tavoli da 2-3 eroi non recupera '
              'mai ferite (regola delle taglie).'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 9 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 9')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il processo')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_9.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 192*mm, W - 2*mx, 132*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 207*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 8 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 9')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Tribunale (1) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Studio Grassi (5) chiude 19')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole che tornano', 5)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE è nascosto il teste stanotte? (attenzione: serve più di una conferma)',
            '2. CHI paga l’avvocato?',
            '3. QUANDO scatta il colpo al teste? (attenzione: serve più di una conferma)',
            '4. COSA portate con voi per la scorta?']
    for i, d in enumerate(doms):
        yd = yy - 10*mm - i*15*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 7*mm, W - 16*mm, yd - 7*mm)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 9 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 9 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la scorta del teste, dopo mezzanotte')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 112*mm, W - 56*mm, 60*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (più o meno una, secondo il vostro '
                  'Bivio dell’Episodio 8 — vedi Soluzione) e le schede Nemici sono carte a '
                  'parte (cartella <b>Episodio 9/cards/</b>). Le 6 tessere della città '
                  'notturna sono in <b>Episodio 9/board/</b>. Questo NON è un dungeon: è '
                  'una SCORTA. La miniatura del teste <b>Anselmo Riva</b> parte con voi in '
                  'T1 e deve arrivare viva alla barca in T6. Riva ha <b>3 Salute</b>, '
                  'Movimento 3, non combatte e non agisce: tenetelo in mezzo. Se Riva cade, '
                  'la scorta è fallita. Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 112*mm, W - 60*mm, 64*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, '
                  'legge ad alta voce la voce corrispondente. <b>La regola della scorta:</b> '
                  'nella Fase Nemici, ogni aggressore che PUÒ raggiungere Riva attacca LUI '
                  'invece di un eroe (il Sicario Gentile sempre). Un eroe adiacente a Riva '
                  'può «fare da scudo»: intercetta l’attacco e lo subisce al posto suo '
                  '(regola vera: Proteggere, un’azione di reazione una volta per round). '
                  'Riva si muove nel turno degli eroi, fino a 3 caselle, e non agisce.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_9:
        art_file = TILE_ART_9[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_9[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_9.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 80*mm, W - 40*mm, 52*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 9</b>. In campo: i '
                  '<b>bravi del fondo</b> e la <b>folla comprata</b> (Sgherri), i '
                  '<b>colleghi del Gentile</b> (Sicari), e <b>il Sicario Gentile</b> (il '
                  'boss: appare in T3, CACCIA Riva — se può raggiungerlo attacca lui, non '
                  'voi). Nessun mostro: gli uomini di C.B. hanno finalmente un volto, e '
                  'sono cortesi. Vittoria: Riva vivo alla barca in T6 (Interagire). La '
                  'Mantella (T4), il Fischietto (–1 spawn una volta) e il Salvacondotto '
                  '(salta una tessera d’imboscata, vedi Soluzione) sono le vostre armi '
                  'vere. Ai tavoli da 2-3 eroi il Sicario Gentile <b>non recupera mai '
                  'ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_9())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_9():
    """Miniature dell'Episodio 9. Riva e' il PNG scortato; i segnalini
    Canto sono qui i segnalini dell'ORA CHE STRINGE."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x5) · SICARI (x2)', [('Lo Sgherro.png', 5), ('Il Sicario.png', 2)]),
        ('SICARIO GENTILE · RIVA', [('Il Sicario Gentile.png', 1), ('Anselmo Riva.png', 1)]),
        ('L’ORA CHE STRINGE (CANTO)', [('La prima ronda passa.png', 1),
                                       ('Le campane dell’una.png', 1),
                                       ('L’intervallo delle ronde.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 9 - Soluzione (non aprire)')

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
        'solo dopo aver risposto per iscritto alle 4 Domande.',
        '<b>APERTURA — i Bivi degli Episodi 6 e 8</b> (applicare PRIMA della lettera):<br/>'
        '<b>Ep. 6</b> — se avete <b>CATTURATO FERRI VIVO</b>: sul banco c’è l’uomo giusto, e '
        'la deposizione di Riva può inchiodarlo — C.B. lo vuole DAVVERO morto: il Sicario '
        'Gentile ha +1 Danno la prima volta che raggiunge Riva. Se <b>FERRI È AGLI ABISSI</b>: '
        'sul banco un capro, la posta è più bassa (nessun bonus al Sicario).<br/>'
        '<b>Ep. 8</b> — se avete <b>SEQUESTRATO L’ORO</b>: i clan senza paga diradano — '
        'rimuovete 1 carta spawn dal mazzo (20 carte). Se l’avete <b>LASCIATO '
        'CIRCOLARE</b>: i clan consolidati — aggiungete la carta «I bravi del fondo» (22 '
        'carte).',
    ])
    pagina('la verità', [
        'C.B./M. usa il processo per riscrivere la storia ufficiale: la sentenza deve dire '
        '«una setta di truffatori, caso chiuso», e bruciare per sempre la pista che porta '
        'oltre Ferri fino a lui. Gli strumenti sono tre uomini: l’<b>avvocato Grassi</b> '
        '(pagato da un fondo fittizio, in oro vecchio dell’ansa morta — la stessa mano '
        'dell’Ep. 8); il <b>giurato Bo</b> (ricomprato, indebitato); e il teste <b>Anselmo '
        'Riva</b>, non comprato ma MINACCIATO.',
        'La notte prima della deposizione, C.B. manda il suo primo agente diretto a far '
        'sparire Riva: il <b>Sicario Gentile</b>. Sventare il piano significa portare Riva '
        'vivo dalla sacrestia del Tribunale al battello della Società, attraverso la città '
        'addormentata e nell’intervallo delle ronde comprate. Il Sicario non insegue: '
        'ANTICIPA — e caccia il teste, non voi.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è nascosto Riva?</b> Nella sacrestia del Tribunale, dietro l’aula '
        '(ruolo d’udienza + usciere: serve più di una conferma). <i>Esatta:</i> lo '
        'raggiungete per la via sicura — nel 1° round della scorta non si pesca nessuna '
        'carta Minaccia. <i>Sbagliata:</i> lo cercate a tentoni: 1 Sgherro appare in T1 '
        'alla rivelazione.',
        '<b>2. CHI paga l’avvocato?</b> Un fondo fittizio; il denaro è oro vecchio, la '
        'stessa mano dell’ansa morta. <i>Esatta:</i> «Il nome sbagliato» — in T3, potete '
        'ricordare al Sicario Gentile che i mandanti bruciano i sicari come hanno bruciato '
        'Ferri: salta la sua PRIMA attivazione. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. QUANDO scatta il colpo?</b> Stanotte, tra l’una e le tre, nell’intervallo '
        'delle ronde comprate (registro delle ronde + giurato: serve più di una conferma). '
        '<i>Esatta:</i> partite nella finestra giusta, prima di loro — il Canto (l’Ora che '
        'stringe) parte da 0. <i>Sbagliata:</i> partite tardi, con le ronde già ritirate: '
        '1 segnalino Canto in più.',
        '<b>4. COSA portate con voi?</b> IL SALVACONDOTTO DEL GIUDICE (il Tribunale, entro '
        'le 20). <i>Con il Salvacondotto:</i> alla partenza scegliete UNA tessera '
        'd’imboscata (T2, T4 o T5) e la SALTATE (i posti di blocco vi aprono la '
        'scorciatoia). <i>Nota per chi arbitra:</i> il Tesserino della Gendarmeria e la '
        'Lettera di Ranuzzi sono esche. La Mantella (T6) fa mancare il primo colpo a Riva '
        'in T4; il Fischietto (Gendarmeria) rimuove 1 Sgherro appena piazzato, una volta.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente tre carte — '
        'la Testimonianza «Ranuzzi» (L2), la Testimonianza «Amilcare Bo» (L3) e la '
        'Testimonianza «L’usciere del Tribunale» (L4). Senza nessuna delle tre, giudicate '
        'con elasticità una risposta «vicina» (es. «chi pagava i clan, l’oro vecchio»).',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier '
        'completo (0 ore avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — la scorta e il boss', [
        '<b>Montaggio</b> (tessere in Episodio 9/board/, coperte tranne T1):<br/>'
        'T1 Sacrestia (partenza, da Sud) → T2 Vicolo dei Tintori → T3 Ponte delle Catene '
        '(il Sicario Gentile si rivela) → T4 Mercato Coperto → T5 Salita dei Lampionai → '
        'T6 Molo del Lume (l’arrivo: Riva alla barca = vittoria). Col Salvacondotto '
        '(Domanda 4) si salta UNA fra T2/T4/T5.',
        '<b>Riva (il teste):</b> parte in T1, 3 Salute, Movimento 3, non combatte e non '
        'agisce. Si muove nel turno degli eroi. Se cade, la scorta è FALLITA. Un eroe '
        'adiacente può Proteggerlo (azione di reazione, una volta per round: intercetta un '
        'attacco a Riva e lo subisce).',
        '<b>La regola della scorta:</b> nella Fase Nemici, ogni aggressore che può '
        'raggiungere Riva attacca LUI invece di un eroe. Tenetelo in mezzo, sempre.',
        '<b>Il Sicario Gentile:</b> appare in T3, CACCIA Riva (Mov 4, va sempre al teste '
        'se può). Nessuna debolezza-oggetto. «Il nome sbagliato» (D2 esatta): salta la '
        'prima attivazione. Se non lo abbattete in T3, si porta AVANTI e vi aspetta in '
        'cima alla Salita (T5). Abbatterlo non è obbligatorio per vincere — ma finché è in '
        'gioco, Riva non è mai al sicuro.',
        '<b>Il mazzo:</b> le 21 carte (±1 dal Bivio Ep. 8). Il Canto qui è L’ORA CHE '
        'STRINGE: carte crescendo + 1 segnalino ogni 4° round; alla soglia (3) '
        'l’intervallo delle ronde è al colmo — il Sicario ha via libera: ogni Fase '
        'Minaccia pesca 1 carta in più, per sempre.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se Riva arriva vivo alla barca.</b> «Il '
        'battello scivola nel buio del canale. Riva, per la prima volta in una settimana, '
        'respira. All’alba deporrà, e la verità resterà a verbale, dove nessun avvocato la '
        'cancella del tutto. Sulla riva, mentre il battello parte, un uomo coi guanti '
        'chiari si toglie il cappello verso di voi. Non è un saluto: è un appuntamento.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 9:</b> <i>«La storia ufficiale è una campana: chi la '
        'fonde decide come suona. Qualcuno sta fondendo la vostra.»</i> Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Far deporre il teste.</b> All’alba Riva depone: la verità resta a verbale — un '
        'incrocio in più alla deduzione d’atto dell’Episodio 18. Ma Riva va protetto per '
        'sempre (programma testimoni): un PNG-alleato in meno per il resto della '
        'campagna.<br/>'
        '<b>Nasconderlo e perdere la causa.</b> Senza il teste in aula, la sentenza-beffa '
        '(«setta di truffatori») scredita la Società: negli Episodi 10-12 un Testimone in '
        'meno nel mazzo Approfondimenti. Ma Riva, vivo e libero e in debito con voi, '
        'diventa la fonte segreta dell’Episodio 17.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 9.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI9_DESC = {
    1: "Il Tribunale di notte è un tempio spento: colonne, l'eco dei passi, il "
       "busto della Giustizia bendata che di giorno ispira e di notte inquieta. "
       "Negli uffici del cancelliere, ancora una lampada accesa: si prepara "
       "l'udienza di domani, e si prepara, in silenzio, anche il modo di "
       "guastarla.",
    2: "La redazione della Gazzetta non dorme mai: il torchio fermo ma caldo, le "
       "bozze appese come panni, Ranuzzi curvo sul processo con l'astio del "
       "cronista a cui hanno tolto la notizia più grossa. Sa tutto e non può "
       "stampare niente: è l'uomo giusto con cui parlare, di notte, a bassa voce.",
    3: "La Pensione Serena è tutt'altro: corridoi che sanno di cavolo e cera, "
       "una padrona che non fa domande, e dietro una porta al secondo piano un "
       "giurato che beve per non pensare a tre figlie di cui qualcuno conosce i "
       "nomi. La coscienza, qui, ha l'odore del vino cattivo.",
    4: "La Gendarmeria di notte è mezza vuota: un piantone assonnato, il registro "
       "aperto, le celle silenziose. L'usciere fidato, prestato alla guardia, ha "
       "l'aria di chi custodisce un segreto troppo grande per una sacrestia — e "
       "sa che il cambio di guardia, stanotte, non gli piace.",
    5: "Lo studio provvisorio dell'avvocato Grassi è una scena teatrale: mobili "
       "d'affitto, faldoni nuovi di zecca, e un ordine da chirurgo. Non ci vive "
       "nessuno: è una bottega aperta per un solo lavoro, che chiuderà a caso "
       "chiuso. Sul tavolo, l'oro non si vede — ma si sente, come un profumo.",
    6: "La sacrestia dietro l'aula è una stanzetta senza finestre: un "
       "inginocchiatoio, una branda, una candela. Anselmo Riva ci vive da giorni "
       "come un topo in trappola, con la sua mantella addosso e gli occhi di chi "
       "ha già visto la propria lapide. È l'unico posto sicuro della città — e "
       "sicuro solo fino al cambio di guardia.",
    7: "La casa di Riva è vuota e ordinata come una tomba: il letto rifatto, la "
       "valigia pronta sotto, la tazza lavata. Solo il cuscino è fuori posto — "
       "perché sopra, con cura, qualcuno ha lasciato un foglio che nessuno "
       "dovrebbe mai ricevere: il disegno della propria fine.",
    8: "La Locanda del Forestiero è discreta e cara, la locanda di chi non vuole "
       "essere ricordato. Al primo piano, la stanza più lontana dalle scale è "
       "quella del signore coi guanti chiari: ordinata come una caserma, muta "
       "come una cassaforte. Ci si entra solo quando lui è fuori — e lui, di "
       "notte, è sempre fuori.",
    9: "Il Molo del Lume è l'approdo segreto della Società: una scaletta di "
       "pietra, l'acqua nera che lambisce, un battello basso con due rematori "
       "che aspettano senza parlare. Da qui, di notte, si parte e si sparisce. "
       "Stanotte, se tutto va bene, si sparisce in tre.",
}

OGGETTI_LUOGO_9 = {
    1: ['Il Salvacondotto del Giudice'],
    4: ['Il Tesserino della Gendarmeria', 'Il Fischietto d’Allarme'],
    6: ['La Mantella da Sacrestano'],
    2: ['La Lettera di Ranuzzi'],
}

TILE_ART_9 = {t['id']: t['id'] + '-ep9.png' for t in TILES_9}
LUOGHI9_CROP = {}

TESSERE_DESC_9 = {
    'T1': "La porticina di servizio del Tribunale dà su un cortile di pietra "
          "umida: un pozzo, una carriola rovesciata, il muro cieco dell'aula da "
          "un lato. Riva esce per primo, incappucciato nella sua mantella, e si "
          "ferma sulla soglia come chi non crede di essere ancora vivo. La città, "
          "oltre l'arco, è un buio che respira.",
    'T2': "Il Vicolo dei Tintori è un budello che gronda: vasche di guado dai "
          "riflessi malati, panni stesi che sfiorano la testa, l'odore acre che "
          "chiude la gola e nasconde ogni altro odore — compreso quello di chi "
          "aspetta appiattito contro un muro. Un vicolo così ha due sole uscite. "
          "Entrambe sorvegliate.",
    'T3': "Il Ponte delle Catene scavalca l'acqua nera in un arco solo, esposto "
          "come un palcoscenico: i grandi anelli arrugginiti che un tempo lo "
          "sbarravano pendono ai lati come collane rotte. A metà, con la calma "
          "di chi ha tutto il tempo del mondo, un uomo elegante coi guanti "
          "chiari si stacca dal parapetto e si toglie il cappello.",
    'T4': "Il Mercato Coperto di notte è un bosco di ferro e tela: banchi vuoti "
          "in file infinite, teloni abbassati, sagome di manichini e ceste che "
          "il buio trasforma in gente ferma. Ogni angolo è cieco, ogni ombra "
          "potrebbe muoversi. Qui un uomo con la mantella grigia è uguale a cento "
          "fantasmi — se ha la mantella giusta.",
    'T5': "La Salita dei Lampionai è l'ultima erta prima del fiume: una scalinata "
          "stretta incassata tra due muri ciechi, e i lampioni tutti spenti — i "
          "lampionai, stanotte, hanno saltato il giro. Al buio i gradini sono "
          "viscidi e il fiato pesa; e in cima, dove l'aria sa già di molo, "
          "qualcuno potrebbe essersi portato avanti.",
    'T6': "Il Molo del Lume è la fine della corsa: la scaletta di pietra, l'acqua "
          "che sciaborda, e il battello basso con i due rematori che tendono già "
          "i remi. La lanterna schermata fa un solo occhio d'oro nel buio. "
          "Ancora tre passi, e Riva è a bordo — e la notte, per una volta, la "
          "vincete voi.",
}

ESAMI_CARBONE_9 = {
    'LA MINACCIA SUL CUSCINO': '«Il disegno della tomba è a matita grassa, mano ferma, '
                'senza esitazioni: un professionista dello spavento. Ma la data è a '
                'inchiostro, mano diversa, aggiunta dopo — e con un anello da notaio che '
                'ha premuto il foglio. Due persone: una che spaventa, una che DECIDE. Il '
                'sicario e il mandante, nella stessa stanza.»',
    'LA PARCELLA DELL’AVVOCATO': '«L’oro è la lega dell’ansa morta, la piega della busta '
                'è quella di sempre: chi paga l’avvocato paga anche i clan, ed è la stessa '
                'mano che vi ha assunti. Un solo portafoglio muove il processo, la '
                'Malavita e — sospettatelo — la Società. Contro chi indagate, se firma le '
                'vostre buste paga?»',
    'IL BIGLIETTO DI C.B.': '«Carta di pregio, filigrana della cartiera dei casi passati; '
                'la “M.” ha il ricciolo del Tessitore. La stessa mano che scrive le vostre '
                'lettere d’incarico scrive gli ordini a chi vi dà la caccia. “Che sia '
                'pulito” non dice se uccidere o far sparire: perfino l’ordine è a doppia '
                'lettura, come chi lo firma.»',
}

OGGETTI_TESSERA_9 = {'T2': ['Una Pertica da Tintore'], 'T4': ['Una Lanterna Cieca']}


def luoghi():
    """Luoghi.pdf Episodio 9 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'cluttered 19th century police office.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 9 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_9, 'Episodio 9')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_9.get(n, [])]

    for L in LUOGHI_9:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI9_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI9_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_9)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_9
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL SICARIO GENTILE', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 9')
    print('OK episodio 9')
