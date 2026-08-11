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
                          seal, wave, contatori_indagine, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
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
    # addFromList CONSUMA la lista e lascia dentro cio' che non e' entrato:
    # un Paragraph piu' alto del frame sparisce dalla pagina SENZA errori
    # (e' successo alla lettera del Preludio, vista solo aprendo il PDF).
    # Qui non si stampa a vuoto: si urla.
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)
    if flow:
        import os as _os, sys as _sys
        _testo = ' '.join(str(getattr(f, 'text', f))[:90] for f in flow[:2])
        _msg = ('FRAME TROPPO PICCOLO in %s: %d elementi non entrano in %.1fx%.1fmm '
                'e NON verranno stampati -> %s'
                % (_os.path.basename(__file__), len(flow), w / 2.83465, h / 2.83465, _testo))
        print('!! ' + _msg, file=_sys.stderr)
        if _os.environ.get('ROCCAMORA_FRAME_STRICT'):
            raise RuntimeError(_msg)


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
    "<font name=\"OldStd-Italic\"><i>Luoghi disponibili dall’inizio: il Tribunale (chiude alle 20), la Gazzetta, la "
    "Pensione del Giurato e la Gendarmeria. Gli altri andranno sbloccati.</i></font>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via:
# «la deposizione di domani» da L1 e L4, «il fondo caritatevole» da L2 e L3,
# «l'oro della parcella» da L3 e L2, «il forestiero coi guanti» da L4 e L2
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
             'Salvacondotto per le vostre… incombenze notturne. Apre i posti di blocco senza '
             'spiegazioni. Ordine del presidente: il teste arrivi vivo. Ma lo firmo entro le '
             'venti, poi chiudo — dopo, arrangiatevi.»',
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
    dict(n=2, nome='LA REDAZIONE DELLA GAZZETTA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         chiude=None,
         indizi=[
             'Ranuzzi copre il processo e ha un dente avvelenato: «l’avvocato Grassi non ha '
             'clienti in città, non ha studio qui, non ha un motivo al mondo per difendere '
             'questo caso. Eppure è arrivato in prima classe. Chi lo paga? Il forestiero coi '
             'guanti che l’ha accolto alla stazione, e un “fondo caritatevole” che non ho '
             'trovato da nessuna parte.»',
             'Sulla scrivania di Ranuzzi, una parcella intravista al volo e mai avuta in '
             'mano: «marenghi d’oro, vecchi, in una busta piegata coi guanti. Come le '
             'ricevute del porto di cui mi parlaste. Stesso oro, stessa piega. Ma provatelo '
             'voi, in tribunale.»',
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
             'L’usciere vi trattiene per la manica: «e non prima delle tre, mi raccomando — '
             'me l’ha appena dato il brigadiere, qui al banco: prima è pieno di ronde, vi '
             'fermano a ogni angolo; dopo le tre il Vicolo dei Tintori è sgombro, di là '
             'passate senza vedere nessuno. Io di strade non m’intendo, ma gli orari li '
             'tiene lui.» Il brigadiere, dal banco, conferma con un cenno senza alzare la '
             'testa dal registro.',
             'Sul banco degli oggetti smarriti, un tesserino della Gendarmeria «trovato»: '
             'utile a un agente in servizio, non a una scorta clandestina di notte. Accanto, '
             'un fischietto d’ordinanza vero.',
             'Il brigadiere, sottovoce e a disagio: «è arrivato in città un forestiero — «il '
             'forestiero coi guanti», lo chiamano i miei — alla Locanda del Forestiero. '
             'Documenti in regola, troppo in '
             'regola. Non ha fatto niente. Ma da quando è arrivato, i miei uomini “non '
             'sono disponibili” proprio nelle ore in cui servirebbero. Qualcuno, sopra di '
             'me, ha dato ordini.» Poi si riprende, e torna al registro: gli orari delle '
             'ronde al Tribunale li passa lui, e stanotte li ha già passati.'],
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
         # Era 19, e l'Indagine comincia alle 18: con `ora >= chiude`
         # (engine.luogoVisitabile) restava una sola visita — ma la parola che
         # apre qui si impara ALTROVE, e impararla consuma proprio quello slot.
         # Finestra zero, salvabile solo col Grimaldello. Stessa medicina
         # dell'Ep.16 L6 (I1 dell'audit): si sposta l'ora, non si toglie il
         # vincolo — restano 18-20 per arrivarci.
         chiude=21,
         indizi=[
             'Il registro delle «spese vive» dell’avvocato: voci innocue, tranne una '
             'ricorrente — «cortesie alle ronde, zona porto e centro, notturne». L’avvocato '
             'non paga solo giurati e testimoni: paga il BUIO. Le ronde di stanotte, tra '
             'l’una e le tre, sono già comprate.',
             'La parcella dell’avvocato, ancora nella busta: marenghi d’oro vecchio — la lega '
             'dell’ansa morta — e la busta è piegata in tre, senza un’ombra di dita, coi '
             'guanti.',
             'Tra le carte, un promemoria dell’avvocato: «coordinarsi con “il forestiero '
             'coi guanti” per la faccenda del teste — non per iscritto, mai per iscritto».',
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
             'Sul tavolo, il verbale della ritrattazione GIÀ SCRITTO, con la data di domani e '
             'uno spazio bianco per la firma di Riva: la bugia è pronta prima della verità. '
             'Manca solo una firma — o un’assenza.',
             'La mantella da sacrestano di Riva, grigia e anonima come cento altre in città: '
             'nella folla, di notte, chi cerca «il teste» cercherà un uomo, non un sacrestano '
             'tra i sacrestani.'],
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
             'matita: chi ha disegnato la tomba non sapeva il giorno; chi l’ha datata sì. Due '
             'persone, due ruoli — uno che spaventa, uno che DECIDE.',
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
             'Nel cestino, un biglietto appallottolato e non bruciato — l’unico errore: carta '
             'di pregio, poche righe, firma «M.». «Che sia PULITO. Il teste non deve avere un '
             'volto sui giornali di domani, solo un’assenza.»',
             'L’oste, terrorizzato: «paga in oro, è cortese, non alza mai la voce. Ma ieri '
             'un ladruncolo gli ha frugato la stanza, e il forestiero l’ha… convinto a '
             'restituire. Il ragazzo adesso non parla più: sorride e trema. Non l’ha '
             'toccato. Gli ha solo PARLATO.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il biglietto nel cestino',
                  testo='Carta di pregio, filigrana della cartiera già vista nei casi '
                        'passati; la firma è una sola iniziale, «M.». Un’iniziale non è un '
                        'nome, e in città di gente che si firma con una lettera sola ce '
                        'n’è più d’una — ma la carta è questa, e si ripete di caso in '
                        'caso. «Che sia pulito» a doppia lettura: uccidere senza scandalo, '
                        'o far sparire senza sangue? Perfino l’ordine è ambiguo, come chi '
                        'lo firma.'),
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
         cerca_vuoto='Ruggine a scaglie sulle catene, e sotto le assi l’acqua nera che '
                     'porta via tutto. Sul parapetto non è rimasto nemmeno un graffio.',
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
         cerca_vuoto='Gradini viscidi, muri ciechi, un lampione spento che dondola '
                     'senza dare luce. Fra i due muri non c’è una porta, una nicchia, '
                     'un davanzale: niente.',
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
         cerca_vuoto='Assi bagnate, un rotolo di gomena, l’acqua che sciaborda contro '
                     'il legno. L’approdo è stato ripulito di tutto quello che poteva '
                     'dire chi ci passa.',
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
    # Il frame non spezza il Paragraph: se la lettera non ci sta, sparisce
    # tutta dalla pagina (silenziosamente) - vedi l'urla in frame_flow. La
    # grafia manoscritta (F['hand']) e' meno compatta del corsivo tipografico
    # a parita' di corpo: l'altezza del frame si MISURA con wrapOn invece di
    # indovinarla a mano, il top del frame resta fisso (non risale sotto il
    # titolo) e il sigillo scende della stessa differenza.
    cap_p = Paragraph('lettera d’incarico — leggere ad alta voce', SMB)
    let_p = Paragraph(lett, st('let', fontName=F['hand'], fontSize=12.5, leading=17, alignment=4))
    avail_w = W - 2*mx
    lett_h = cap_p.wrapOn(c, avail_w, 400*mm)[1] + 2 + let_p.wrapOn(c, avail_w, 400*mm)[1] + 4*mm
    frame_top = H - (192 - 132)*mm
    frame_y = frame_top - lett_h
    delta = (H - 192*mm) - frame_y
    frame_flow(c, mx, frame_y, avail_w, lett_h, [cap_p, let_p])
    seal(c, W - mx - 12*mm, H - 207*mm - delta, r=13*mm, angle=-10)
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
    contatori_indagine(c, W)
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
                  'la scorta è fallita. <b>Deroga dichiarata</b> (leggetela prima del primo '
                  'colpo): il Regolamento vuole che i nemici <i>ignorino</i> il PNG '
                  'scortato. Qui no, ed è il punto dell’episodio: Riva è il bersaglio, ha '
                  'Salute propria e cade come un uomo. Vale quanto è scritto in questo '
                  'fascicolo. Le pagine seguenti sono le note per tessera.', BODY)])
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
        ('SGHERRI (x5) · SICARI (x3)', [('Lo Sgherro.png', 5), ('Il Sicario.png', 3)]),
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
        'C.B. usa il processo per riscrivere la storia ufficiale: la sentenza deve dire '
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
        '<b>CHI MENTE? (deduzione bonus).</b> Il bugiardo è <b>il brigadiere della '
        'Gendarmeria</b> (Luogo 4): è lui che tiene e passa al Tribunale gli orari delle '
        'ronde, ed è stato girato — «qualcuno, sopra di me, ha dato ordini» — e la sua '
        'versione falsa gliela ripete l’usciere in perfetta buona fede, dicendo da chi '
        'l’ha avuta (una «via sicura» per il teste che è invece una trappola: il Vicolo '
        'dei Tintori «dopo le tre», mentre il giurato Bo (L3) e il registro delle ronde '
        'comprate (L5) dicono entrambi «tra l’una e le tre». Due contro uno, e l’unico a '
        'discostarsi è l’unico che quegli orari li scrive di suo pugno. L’ora del colpo '
        'secondo chi mente non combacia col registro delle '
        'ronde comprate). <i>L’usciere resta pulito:</i> ha nascosto Riva, ha rifiutato '
        'l’oro, e su di lui si può contare — è il brigadiere che ha messo l’ora sbagliata '
        'nella sua bocca. Il gruppo lo smaschera CONFRONTANDO le versioni: se hanno '
        'incrociato il vero colpevole (un rivelatorio D2) e sentito almeno DUE dei tre '
        'testimoni, individuano il bugiardo — e nella scorta non si fidano della falsa via '
        'sicura: l’imboscata del Vicolo dei Tintori (T2) è alleggerita di 1 Sgherro '
        '(l’avete anticipata). Chi non confronta parte alla cieca: imboscata piena.',
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
        '<b>Deroga dichiarata</b> — annunciatela al tavolo prima che il primo nemico '
        'attacchi. Il Regolamento dice che i nemici ignorano il PNG scortato: qui no, ed è '
        'voluto, perché è tutto l’episodio. Riva è il bersaglio, ha Salute propria e cade '
        'come un uomo. Quello che è scritto qui vince su quella riga.',
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
    1: "Il Tribunale di notte sa di pietra bagnata e di cera da pavimenti, e il freddo che ci "
       "sta dentro non è quello di fuori: è il freddo che le colonne hanno accumulato per un "
       "secolo e restituiscono adesso, tutto insieme, a chi attraversa l’atrio. I banchi vuoti "
       "stanno in file come in una chiesa svuotata; sopra di essi la Giustizia bendata regge la "
       "sua bilancia troppo in alto perché qualcuno possa leggerla, e la benda, vista da sotto, "
       "sembra messa di fresco. In fondo al corridoio una sola lampada di cancelleria tiene "
       "acceso un riquadro giallo, e dentro quel riquadro un uomo scrive senza alzare la testa; "
       "quando entrate posa la penna, si asciuga il pollice e parla al ripiano più che a voi — "
       "«Ordine del presidente: il teste arrivi vivo» — allineando le carte con due colpetti "
       "secchi. L’eco dei vostri passi torna indietro mezzo battito più tardi di quanto una "
       "sala di quelle misure dovrebbe concedere, e ogni volta che vi fermate continua ancora "
       "per un passo. Sul banco della difesa, apparecchiato per domani, un fazzoletto di lino "
       "piegato in quattro sta appoggiato accanto ai calamai pieni.",
    2: "La redazione sa d’inchiostro fresco, di colla da bozze e di stufa caricata male; il "
       "torchio è fermo da ore e tiene ancora il suo calore, e appoggiandoci sopra una mano si "
       "sente che ha lavorato più a lungo di quanto una notte qualunque richieda. Le bozze "
       "pendono dal filo come panni, con le mollette in fila; sotto stanno le colonne di piombo "
       "legate con lo spago, una brocca d’acqua, il vassoio dei caratteri — e sul muro, fra due "
       "prime pagine appuntate, un rettangolo di carta meno ingiallita, grande come un foglio, "
       "dove fino a poco fa era appeso qualcosa. Ranuzzi non si alza: tiene gli occhiali sulla "
       "fronte, la penna fra due dita, e vi parla staccando le parole come se dovessero entrare "
       "in una riga di piombo: «l’avvocato Grassi non ha clienti in città, non ha studio qui, "
       "non ha un motivo al mondo per difendere questo caso. Eppure è arrivato in prima "
       "classe.» Mentre parla, la fiamma del becco a gas si abbassa e risale da sola, due "
       "volte, senza che nessuno tocchi la chiavetta. Sul tavolo, accanto al calamaio freddo, "
       "una bozza porta un titolo cancellato con due righe di matita blu, e nessun titolo nuovo "
       "al suo posto.",
    3: "La Pensione Serena sa di cavolo bollito e di cera cattiva, e il corridoio del secondo "
       "piano è più freddo delle scale, come se il calore, arrivato fin lì, avesse deciso di "
       "non entrare. La padrona vi indica la porta col mento e torna alle sue mani; sul "
       "pianerottolo la carta da parati si stacca a strisce lunghe, e sotto compare un fiore "
       "d’altro colore, di trent’anni prima. Dentro la stanza c’è una candela sola, una "
       "bottiglia, un bicchiere, e il letto rifatto perché non ci si dorme. Amilcare Bo siede "
       "di traverso sulla sedia, i gomiti sulle ginocchia, e le dita gli tremano abbastanza da "
       "far tintinnare il vetro contro il legno ogni volta che posa; parla senza guardarvi, "
       "tutto in una volta, come chi ha ripetuto la frase molte notti: «Io volevo la verità, "
       "signori!», e subito dopo, più piano, «Io ho tre figlie.» L’aria è ferma e la candela "
       "sta dritta, eppure la fiamma si piega a intervalli regolari, sempre verso la porta, e "
       "sempre alla stessa altezza. Sul tavolo, accanto alla bottiglia, un foglio di carta di "
       "pregio è piegato con la piega rivolta in alto.",
    4: "La Gendarmeria di notte sa di cuoio bagnato, di caffè tenuto troppo a lungo sulla "
       "piastra e di quel ferro dolciastro che hanno le stufe di ghisa; fa più caldo che in "
       "strada, e il calore rende ogni gesto più lento. Il piantone all’ingresso non vi domanda "
       "niente: gira il registro verso di voi, indica la riga, e mentre firmate guarda "
       "l’orologio a muro invece che la vostra mano. Le celle in fondo sono vuote e aperte, con "
       "le brande ribaltate contro il muro; al banco degli oggetti smarriti, nelle cassette "
       "numerate, stanno ombrelli, un rosario, un tesserino in un portafoglio di cuoio "
       "consunto, un fischietto d’ordinanza col cordino ancora nuovo. L’usciere del Tribunale, "
       "prestato alla guardia e ancora in giacca da usciere, vi tira per la manica fin dentro "
       "un angolo, e prima di parlare guarda due volte la porta: «io stanotte smonto, e chi "
       "monta dopo di me… non lo conosco», dice, e la manica non la lascia. Alla parete, il "
       "tabellone dei turni ha l’ultima riga cancellata e riscritta sopra, con un inchiostro "
       "che non è ancora asciutto.",
    5: "Lo studio dell’avvocato occupa due stanze prese a mesi in un palazzo di uffici, e sa di "
       "vernice fresca e di carta mai piegata: nessun odore di casa, nessuno di cucina, nessuno "
       "d’uomo. I mobili sono d’affitto e non combaciano — una scrivania troppo grande, due "
       "sedie spaiate, uno scaffale che porta ancora sul fianco i numeri a gesso del "
       "magazziniere — e sopra la scrivania la lampada dal paralume verde tiene un cerchio di "
       "luce dentro cui ogni cosa è allineata al filo: faldoni nuovi, calamai pieni, il "
       "tagliacarte parallelo al bordo. Il praticante che vi apre tiene la porta con due dita e "
       "il corpo di traverso, come chi non ha ancora deciso se farvi entrare; ripete la frase "
       "che gli hanno insegnato — «l’avvocato prepara la deposizione» — e mentre la ripete "
       "guarda il corridoio alle vostre spalle. Nel cerchio verde della lampada la polvere non "
       "c’è: il ripiano è stato passato da poco, e si vede il verso del panno. Sul bordo della "
       "scrivania, appoggiata di taglio, una busta piegata in tre non porta una sola impronta.",
    6: "Dietro l’aula c’è una stanza senza finestre, e l’aria dentro è quella di un armadio "
       "chiuso: cera, lana umida, il fiato di qualcuno che ci sta da troppi giorni. Sta tutta "
       "in quattro passi — un inginocchiatoio consumato agli angoli, una branda da caserma con "
       "due coperte, un catino, e una candela sola, più bassa di quanto una notte possa "
       "giustificare. Alle pareti restano i chiodi delle cose che qui si tenevano appese, e "
       "sotto ogni chiodo un alone più chiaro nella forma di un paramento; i chiodi sono tutti "
       "vuoti. Anselmo Riva è seduto sulla branda con la mantella addosso e le mani infilate "
       "nelle maniche, e non si alza: gira soltanto la testa, con gli occhi di chi non dorme da "
       "giorni e ha smesso di aspettarsi buone notizie. «Se lo dico, domani, muoio. Se non lo "
       "dico, muoio dentro», dice piano, come si dice una cosa già sistemata. La fiamma della "
       "candela non sta ferma: si allunga e si accorcia a tempo, e non è il tempo del respiro "
       "di nessuno dei presenti. Sul tavolino, un foglio battuto a macchina è girato verso la "
       "porta.",
    7: "La casa di Riva è una stanza sola sopra un sottoportico, e ci si entra in un’aria ferma "
       "che sa di calce e di cenere fredda: il camino è spento da giorni, ma nessuno ha aperto "
       "le finestre, e l’odore di chi ci abitava è rimasto dentro come in una cassa. Tutto è in "
       "ordine oltre il necessario — il letto rifatto con l’angolo piegato a regola, la tazza "
       "lavata e capovolta sullo strofinaccio, le due sedie spinte sotto il tavolo, il pettine "
       "allineato al bordo del cassettone — e sotto il letto, con le cinghie già tirate a "
       "fondo, sta una valigia chiusa. Dalla persiana accostata entra una lama di luna che "
       "attraversa il pavimento e arriva esattamente sul cuscino; e sul cuscino, posato al "
       "centro, c’è un foglio, con i quattro angoli a filo della federa. Nella stanza non entra "
       "vento, eppure la persiana batte piano contro il muro, sempre allo stesso intervallo, e "
       "a ogni colpo la lama di luna si sposta di un dito. Il foglio è un disegno a matita, e "
       "in basso, in un altro inchiostro, c’è una data.",
    8: "La locanda ha il silenzio caro delle case dove si paga per non essere ricordati: "
       "tappeti fin sulle scale, il legno lucidato all’olio, e un odore di cera e di lavanda "
       "che copre tutto quello che una locanda di solito lascia sentire. L’oste vi precede col "
       "candeliere e non domanda il motivo; del suo cliente parla come si parla di un padrone, "
       "tenendo la voce sotto il rumore dei propri passi: «paga in oro, è cortese, non alza mai "
       "la voce», dice, e sulla parola cortese gli si stringe la bocca. La stanza in fondo al "
       "primo piano, la più lontana dalle scale, è fredda perché il fuoco non ci è mai stato "
       "acceso. Dentro: un solo baule da viaggio chiuso a chiave, il letto fatto e intatto, tre "
       "paia di guanti chiari piegati a ventaglio sul comò, uno di fianco all’altro, alla "
       "stessa distanza. Non c’è una lettera, un ritratto, un biglietto, una camicia sporca; il "
       "lavamano è asciutto. Nel cestino sotto il tavolino — unica cosa della stanza a non "
       "stare al suo posto — c’è una pallottola di carta di pregio.",
    9: "L’approdo non ha insegna e non si trova: una scaletta di pietra che scende sotto il "
       "livello della strada, cinque gradini coperti d’alga nera, e in fondo l’acqua che non "
       "riflette niente, perché la lanterna è schermata su tre lati e lascia passare un occhio "
       "d’oro soltanto. Sa di limo, di gomena bagnata e di catrame; e sotto l’arco fa più caldo "
       "che in strada, di quel tepore che hanno le stalle. Il battello è basso e lungo, "
       "verniciato di scuro fino agli scalmi, senza un ottone che possa prendere luce; i due "
       "rematori stanno seduti coi remi già in acqua e li muovono appena, quel tanto che basta "
       "a restare fermi contro la corrente, e non si voltano quando arrivate. Il più vecchio "
       "parla senza smettere di guardare il canale, e recita la strada come un rosario: «dal "
       "Tribunale a qui, di notte, si passa per il Vicolo dei Tintori, il Ponte delle Catene, "
       "il Mercato Coperto e la Salita dei Lampionai.» L’acqua contro la pietra sale e scende "
       "di un palmo, con regolarità, e in un canale senza corrente non dovrebbe farlo. Sulla "
       "bitta, infilato per un dito, è rimasto un guanto chiaro.",
}

OGGETTI_LUOGO_9 = {
    1: [
        ('Oggetto', 'Il Salvacondotto del Giudice', 'solo entro le 20:00'),
    ],
    2: [
        ('Esca', 'La Lettera di Ranuzzi', ''),
    ],
    4: [
        ('Esca', 'Il Tesserino della Gendarmeria', ''),
        'Il Fischietto d’Allarme',
    ],
    5: [
        ('Reperto', 'il Registro delle Ronde', ''),
        ('Reperto B', 'la Parcella dell’Avvocato', ''),
    ],
    6: [
        'La Mantella da Sacrestano',
        ('Reperto A', 'il Verbale della Ritrattazione', ''),
    ],
    7: [
        ('Esame di Carbone', '', 'disponibile sulla minaccia lasciata sul cuscino'),
    ],
    8: [
        ('Reperto C', 'il Biglietto nel Cestino', ''),
    ],
}

TILE_ART_9 = {t['id']: t['id'] + '-ep9.png' for t in TILES_9}
LUOGHI9_CROP = {}

TESSERE_DESC_9 = {
    'T1': "La porticina di servizio dà su un cortile di pietra dove l’aria cambia di colpo: "
          "dopo la cera e il chiuso, il freddo bagnato del fiume, che arriva da sotto l’arco e "
          "si sente prima sui denti che sulle mani. Il cortile è quattro muri e una sola via "
          "d’uscita — un pozzo con la carrucola senza secchio, una carriola rovesciata contro "
          "il muro cieco, una pila di sacchi di sabbia da spargere sul ghiaccio — e non c’è una "
          "finestra che ci guardi dentro, nemmeno una, in tutta l’altezza. Riva esce per ultimo "
          "e si ferma sulla soglia stringendosi la mantella al collo con tutte e due le mani; "
          "ha già detto la sua sola frase della serata, e l’ha detta piano: «sappiate che LORO "
          "sanno che venite.» La corda del pozzo, che nessuno ha toccato, batte piano contro il "
          "muretto e continua a battere per tutto il tempo che restate, sempre alla stessa "
          "cadenza. Oltre l’arco la città non ha una voce: nessun cane, nessuna ruota, nessun "
          "passo. Sul selciato, davanti alla porticina, un mozzicone di sigaro è ancora acceso.",
    'T2': "Il vicolo si annuncia due passi prima con l’odore: guado e urina invecchiata, "
          "l’acre delle tinte che chiude la gola e cancella ogni altro odore, compreso quello "
          "del fiume che pure scorre a trenta passi. È largo quanto due uomini di fianco, e non "
          "tutti e due comodi. Le vasche stanno interrate lungo i muri, coperte da assi "
          "appoggiate male, e sotto le assi la tinta ferma tiene un riflesso che non è né blu "
          "né nero; sopra la testa i panni stesi scendono così bassi da doverli scostare col "
          "braccio, e gocciolano — non tutti allo stesso ritmo, e mai uno sul selciato "
          "asciutto. La lanterna qui serve a poco: illumina il panno più vicino e restituisce "
          "subito dopo un buio doppio. Riva vi cammina in mezzo senza che nessuno gliel’abbia "
          "chiesto, con le spalle strette come chi attraversa una folla. L’ultimo panno prima "
          "dell’uscita è ancora caldo, e da un lato è asciutto: qualcuno ci è stato appoggiato "
          "contro.",
    'T3': "Sul ponte l’aria cambia un’altra volta: niente più muri, niente più odore di "
          "vicolo, soltanto il fiato freddo dell’acqua nera che sale da sotto e vi si posa "
          "addosso. È una campata sola, di pietra, larga e senza riparo — chi ci sta sopra è in "
          "mezzo a un palcoscenico, e lo capisce dai piedi prima che dalla testa. Le grandi "
          "catene che un tempo lo sbarravano pendono ai lati dai loro anelli, arrugginite a "
          "scaglie, e ogni tanto una scaglia si stacca e cade nell’acqua senza far rumore. A "
          "metà del ponte, appoggiato al parapetto con le caviglie incrociate come chi aspetta "
          "un appuntamento cordiale, un uomo in soprabito scuro guarda dalla vostra parte da "
          "prima che voi lo vediate; i guanti sono chiari, e sono puliti. Si stacca dal "
          "parapetto, si toglie il cappello e se lo tiene contro il petto: «signori. Mi "
          "dispiace per quello che segue.» Le catene, tutte insieme e senza vento, si mettono a "
          "battere piano contro la pietra. Riva si è fermato due passi indietro, e non guarda "
          "l’uomo: guarda l’acqua.",
    'T4': "Sotto la tettoia il rumore dei vostri passi sale e torna dall’alto, dalle capriate, "
          "mezzo battito più tardi: è l’unica cosa grande che si muova qui dentro. Sa di "
          "segatura bagnata, di pesce lavato via male e di frutta a fine stagione, e fa più "
          "freddo che fuori — di quel freddo che hanno i posti coperti e non abitati. I banchi "
          "corrono in file che si perdono nel buio, i teloni calati a metà, e sopra ogni banco "
          "resta la roba che non si porta a casa: ceste impilate, stadere appese, manichini da "
          "merceria messi in piedi in un angolo, con le braccia dove le ha lasciate qualcuno. "
          "Ogni fila apre un corridoio, ogni corridoio finisce in un angolo cieco, e le sagome "
          "si somigliano tutte finché non ci si arriva a un passo. Riva cammina con la mantella "
          "tirata sul capo, e di spalle è un profilo grigio come molti altri. Su un banco "
          "vuoto, nella polvere pareggiata, restano le impronte di due mani aperte, come di chi "
          "ci si è appoggiato per passare dall’altra parte.",
    'T5': "La salita è una fessura fra due muri ciechi, gradini di pietra alti e stretti, e si "
          "comincia a salire con la sensazione di essere entrati in qualcosa più che di averla "
          "imboccata. I lampioni ci sono — uno ogni sei gradini, il vetro intero, il gancio a "
          "portata di pertica — e sono tutti spenti; passandoci accanto si sente che il "
          "bruciatore è freddo da ore, non da poco. L’odore cambia a metà: sotto è ancora "
          "città, calce e fumo di camino; sopra arriva il fiume, alga e legno bagnato, e arriva "
          "tutto in un gradino solo, come si cambia stanza. La pietra è viscida di quel velo "
          "che lasciano la nebbia e i piedi, e il fiato pesa prima di quanto l’erta meriti. "
          "Riva sale tenendosi al muro con la mano aperta e non chiede mai di fermarsi, "
          "nemmeno dove il gradino si alza di due dita più degli altri. In alto, "
          "dove i due muri finiscono, l’apertura è un rettangolo di cielo appena meno nero; e "
          "l’ultimo lampione, quello in cima, dondola sul suo braccio di ferro.",
    'T6': "Gli ultimi gradini scendono sotto il livello della strada e l’aria si fa subito più "
          "tiepida e più densa: limo, catrame, gomena bagnata, il fiato del canale sotto "
          "l’arco. Il molo è una lingua di pietra larga tre passi, senza parapetto, con gli "
          "anelli d’ormeggio infissi nel bordo e l’alga nera che segna fin dove arriva l’acqua "
          "quando si alza. Il battello è già accostato, basso sull’acqua, verniciato di scuro "
          "fino agli scalmi; i due rematori tengono i remi in acqua e li muovono appena, quel "
          "tanto che basta a restare fermi contro la corrente, e non salutano. La lanterna è "
          "schermata su tre lati: fa un occhio d’oro solo, che non illumina niente e serve "
          "soltanto a farsi vedere da chi sa dove guardare. Riva arriva in fondo alla scaletta "
          "e si ferma, una mano sul muro, a guardare l’acqua fra la pietra e il legno. Sul "
          "primo gradino, ancora bagnata, c’è l’impronta di una scarpa che scende — e non ne "
          "torna indietro nessuna.",
}

ESAMI_CARBONE_9 = {
    'LA MINACCIA SUL CUSCINO': '«Il disegno della tomba è a matita grassa, mano ferma, '
                'senza esitazioni: un professionista dello spavento. Ma la data è a '
                'inchiostro, mano diversa, aggiunta dopo — e con un anello da notaio che '
                'ha premuto il foglio. Due persone: una che spaventa, una che DECIDE. Il '
                'sicario e il mandante, nella stessa stanza.»',
    'LA PARCELLA DELL’AVVOCATO': '«L’oro è la lega dell’ansa morta, la piega della busta '
                'è quella di sempre: chi paga l’avvocato paga anche i clan, ed è la stessa '
                'mano dell’ansa morta. Un solo portafoglio muove il processo e la Malavita '
                '— e non è un portafoglio da vicolo: è di chi tiene conti, notai e un nome '
                'rispettabile. Quanti, in questa città, possono permetterselo?»',
    'IL BIGLIETTO NEL CESTINO': '«Carta di pregio, filigrana della cartiera dei casi passati: '
                'non è la prima volta che questa carta mi passa sotto gli occhi, ed è la '
                'cosa che mi inquieta di più. La firma è una lettera sola, “M.”, e una '
                'lettera sola non è un nome: di gente che si firma così, in città, ce n’è '
                'più d’una. “Che sia pulito” non dice se uccidere o far sparire: perfino '
                'l’ordine è a doppia lettura, come chi lo firma.»',
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
        return N.oggetto_righe(OGGETTI_LUOGO_9.get(n, []))

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
