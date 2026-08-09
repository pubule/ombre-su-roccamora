# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 7: Il quartiere sordo (Episodio 7/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-7.md e CAMPAGNA-EPISODI.md).
Apertura dell'Atto II: standalone senza culto in scena — l'intonaco
brevettato con le scorie del bronzo del '41 che beve il suono, Fava
sequestrato nel palazzone, l'ingegner Voltan. Un solo seme C.B./M.: la
società anonima su carta di pregio all'Ufficio Brevetti.

Varietà strutturale (regola 2026-07-18): mappa con scelta di percorso
VERA (ponteggi esposti / intercapedini sorde); finale boss-umano con
squadra ≠ obiettivo a fasi dell'Ep. 6.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche
vivono in scripts/cardconjurer/cards-data.js, blocco EPISODIO 7).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 7', 'pdf')
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

LETTERA_7 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Nella contrada di Sant’Orsola il suono muore: le campane di San Michele non si "
    "sentono a cinquanta passi, le voci arrivano come attraverso la lana, i cani se ne "
    "sono andati. La gente dice che è il prezzo del rituale sventato — la città che smette "
    "di sentire dopo aver smesso di cantare. Poi, tre giorni fa, è sparito <b>Ernesto "
    "Fava</b>, accordatore di pianoforti: l’unico che rideva della superstizione, e andava "
    "dicendo che «la sordità ha un odore. Odore di calce nuova».<br/><br/>"
    "Un uomo pratico sparisce sempre per ragioni pratiche. Trovate la ragione — e non "
    "fatevi incantare dal silenzio: è quello che vuole chi lo vende. Avete <b>6 ore</b>, "
    "dalle 18:00 alle 24:00.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la contrada di Sant’Orsola, la bottega di Fava, le "
    "Fonderie e il Banco dei Pegni. Gli altri andranno sbloccati.</i>")

# Luoghi: fonte autoritativa py (indizi core GARANTITI - regola 1-ter).
# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via
# (anti-fortuna, 1-sexies): «la calce nuova» da L1 e L3, «l'intonaco
# brevettato» da L2 e L1, «le scorie del Quarantuno» da L3 e L4, «il
# capoturno» da L6 e L7 (seconda via interna), la Bolla della Calce da L6.
# Rivelatorio (Domanda 2) su 3 carte designate: L2, L3, L4 - tutti aperti.
LUOGHI_7 = [
    dict(n=1, nome='LA CONTRADA DI SANT’ORSOLA', voce_mappa='La Contrada di Sant’Orsola',
         req='Disponibile dall’inizio', art='Contrada di Sant’Orsola.png',
         chiude=None,
         indizi=[
             'Il silenzio non è dappertutto: è a CHIAZZE. Davanti alle case vecchie si sente '
             'tutto — il pozzo, i passi, una lite al secondo piano. Davanti alle case '
             'rifatte, niente: la strada inghiotte. Una vecchia, dal portone: «è la calce '
             'nuova, signori. Da quando rifanno i muri, qui non si sente più morire nessuno.»',
             'Il sagrestano di San Michele suona mezzogiorno per voi: dal sagrato la campana '
             'è piena, a cinquanta passi è un ricordo, davanti al palazzone non c’è più. '
             '«Prima arrivava al fiume. Adesso non arriva al forno. E il vescovo dice che '
             'sono sordo io.»',
             'I muri nuovi hanno tutti lo stesso intonaco: grigio chiaro, liscio, con una '
             'polvere fine che luccica appena. I manifesti dell’impresa lo chiamano '
             '«l’intonaco brevettato — la quiete in casa vostra». La contrada lo chiama in '
             'un altro modo: il muro che mangia.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La contrada',
                  testo='«Fava è passato di qui l’ultima sera, col diapason in mano, e '
                        'batteva i muri come un medico batte un petto. Davanti al palazzone '
                        's’è fermato. Ha detto una parola sola: “qui”. Poi è andato verso il '
                        'cantiere, e il cantiere se l’è bevuto come i muri si bevono le '
                        'campane.»'),
         ]),
    dict(n=2, nome='LA BOTTEGA DI FAVA', voce_mappa='Bottega dell’Accordatore',
         req='Disponibile dall’inizio', art='Bottega di Fava.png',
         chiude=None,
         indizi=[
             'Il registro dei lavori è aperto sull’ultima settimana: sette pianoforti '
             'accordati e RIACCORDATI a distanza di giorni, tutti a Sant’Orsola, tutti in '
             'case nuove. In margine, la grafia fitta di Fava: «non sono io. Non è lo '
             'strumento. È la STANZA. La stanza beve gli acuti.»',
             'Sul banco, la copia di una lettera all’impresa Voltan & Figli: «il vostro '
             'intonaco brevettato altera l’acustica delle abitazioni ed è impastato con '
             'materiale che non avete dichiarato. O mi ricevete, o deposito tutto in '
             'Questura.» Spedita lunedì. Fava è sparito mercoledì.',
             'Il diapason da lavoro di Fava non c’è — l’ha portato con sé. C’è la sua '
             'agenda: mercoledì sera, un’unica riga — «cantiere, ore nove, il capoturno '
             'stacca e si beve tutto: si entra».'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il banco dell’accordatore',
                  testo='Tra i ferri del mestiere c’è una mattonella d’intonaco, spaccata a '
                        'metà, con l’etichetta di Fava: «campione, palazzone, parete ovest». '
                        'Nella frattura, una polvere grigia che non è sabbia: luccica come '
                        'metallo macinato. Fava non stava riparando pianoforti: stava '
                        'facendo un’ANALISI. E chi analizza un brevetto, del brevetto è '
                        'nemico.'),
         ]),
    dict(n=3, nome='LE FONDERIE', voce_mappa='Le Fonderie',
         req='Disponibile dall’inizio', art='Fonderia Dossena.png',
         chiude=None,
         indizi=[
             'Il magazziniere delle Fonderie tiene il registro degli scarti: «le scorie del '
             'Quarantuno — quelle del bronzo vecchio, la montagna grigia in fondo al '
             'piazzale — le compra da un anno un carrettiere solo. A carrettate. Paga in '
             'anticipo e carica di notte.»',
             'La montagna di scorie è dimezzata. Sul fronte di scavo, impronte di pale e di '
             'sacchi — e la stessa polvere fine che luccica: bronzo macinato dal tempo. Il '
             'capofonderia sputa per terra: «quella roba non vale niente. Nessuno compra il '
             'niente a carrettate. Nessuno di onesto.»',
             'Le bolle del carrettiere, ricopiate a mano dal magazziniere diffidente: '
             'destinazione «cantiere di Sant’Orsola — calcina». La calce nuova della '
             'contrada nasce qui, da un bronzo che ha suonato per due secoli e che qualcuno '
             'ha spento.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il magazziniere',
                  testo='«Il carrettiere una volta ha bevuto troppo e ha parlato: “l’ingegnere '
                        'dice che il bronzo vecchio BEVE il rumore, per questo lo macina '
                        'nell’intonaco. L’ingegner Voltan, quello del brevetto. Un genio, '
                        'dice lui. Io dico: un genio che paga perché non si sappia cosa c’è '
                        'nel muro, che genio è?”»'),
         ]),
    dict(n=4, nome='IL BANCO DEI PEGNI', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Fossa allinea sul banco tre pegni della settimana: un orologio, una fede, un '
             'rasoio. Su tutti e tre, nelle incisioni, la stessa polvere grigia che '
             'luccica. «Operai del palazzone. Impegnano tutto, e hanno le mani piene di '
             'questa. Le scorie del Quarantuno, se chiedete a me: mio nonno le fondeva.»',
             'Tra i pegni non riscattati: la giubba con le mostrine da guardiano notturno. '
             '«Il vecchio guardiano del cantiere. L’hanno licenziato in un giorno — dice '
             'lui: “per orecchie buone”. Sentiva quello che non doveva: c’è gente chiusa là '
             'dentro, dice. Lo trovate all’osteria dietro l’angolo, a bere quello che gli '
             'resta.»',
             'Il guardiano licenziato, per il prezzo di due bicchieri: «il turno di notte '
             'stacca alle NOVE. Dieci minuti buoni col cancello incustodito, finché il '
             'capoturno finisce la sua bottiglia. Io lo dicevo, che era un cantiere strano: '
             'consegne di calce alle tre del mattino, e il terzo piano murato PRIMA del '
             'secondo.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il guardiano licenziato',
                  testo='«Una notte ho sentito battere da dentro l’intercapedine del terzo '
                        'piano — tre colpi, pausa, tre colpi: uno che conta, mica un topo. '
                        'L’ho detto al Capocantiere. Il giorno dopo ero in strada, e la '
                        'squadra mi ha accompagnato al cancello: “le orecchie buone, qui, '
                        'sono un difetto”. È stato l’ingegnere a firmare: Voltan. Il '
                        'brevetto è suo, il silenzio è suo.»'),
         ]),
    dict(n=5, nome='L’UFFICIO BREVETTI COMUNALE', voce_mappa='L’Ufficio Brevetti',
         req='L’usciere è un muro di regolamenti: «i fascicoli si consultano su istanza '
             'motivata». Ma chi cita il nome esatto di un brevetto — quello vero, quello '
             'depositato — ha già mezza istanza fatta.',
         chiave=('parola', 'L’INTONACO BREVETTATO'), art='Ufficio Brevetti.png',
         chiude=None,
         indizi=[
             'Il fascicolo del brevetto: «Intonaco fonoassorbente Voltan — composizione: '
             'calce, sabbia, e MATERIA INERTE DI RECUPERO (non specificata)». La legge '
             'consente il segreto industriale. Il segreto, qui, pesa quattro carrettate a '
             'settimana.',
             'La domanda di deposito non è intestata all’impresa: la paga una società '
             'anonima, «La Quiete S.A.», sede presso uno studio notarile. Il foglio di '
             'accompagnamento è carta di pregio, piegata in tre SENZA un’ombra di dita.',
             'L’archivista, sottovoce, sfogliando: «è la terza pratica quest’anno che passa '
             'su questa carta. Le altre due? Una cartiera in concordato e una parcella '
             'notarile. Chi scrive su questa roba non lascia MAI il nome. Solo la carta.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il foglio della società anonima',
                  testo='Controluce, la carta di pregio ha la filigrana di una cartiera sola '
                        '— la stessa delle commissioni dei casi passati. «La Quiete S.A.» '
                        'esiste da undici mesi, non ha dipendenti, e compra silenzio: un '
                        'brevetto che spegne il suono, un ingegnere che lo firma, un '
                        'quartiere che fa da prova generale. Chi compra il silenzio a '
                        'carrettate non lo fa per dormire meglio.'),
         ]),
    dict(n=6, nome='LA BARACCA DEL CANTIERE', voce_mappa='Il Cantiere di Sant’Orsola',
         req='Il cantiere di giorno è un formicaio sorvegliato: si entra solo per lavoro. Ma '
             'chi nomina la fornitura giusta — quella che arriva di notte — trova il '
             'furiere della baracca improvvisamente disponibile.',
         chiave=('parola', 'LA CALCE NUOVA'), art='Baracca del Cantiere.png',
         chiude=None,
         indizi=[
             'Le bolle di consegna, infilzate su un chiodo: calce, calce, calce — il TRIPLO '
             'del fabbisogno di un cantiere onesto, e metà delle consegne «al terzo piano, '
             'ore notturne». Un muratore che non sa di parlare: «il terzo piano è finito da '
             'mesi. Murato prima del secondo. Boh.»',
             'Il registro dei turni, appeso in baracca: il turno di notte stacca alle NOVE '
             'in punto; il capoturno firma il rientro «alle nove e un quarto» — un quarto '
             'd’ora di cancello a metà, ogni sera, da mesi. Qualcuno l’ha già notato: '
             'accanto, una crocetta a matita che nessuno del cantiere sa spiegare.',
             'Nella baracca, il timbro delle forniture e una bolla in bianco già firmata: col '
             'carro giusto e questa carta, il cancello del palazzone si apre da solo. Il '
             'furiere borbotta del capoturno: «il capoturno beve, e quando beve, il cantiere '
             'è di chiunque.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La baracca del furiere',
                  testo='Sotto il piano del tavolo, incollata col nastro, una seconda '
                        'contabilità: le consegne notturne al terzo piano non sono calce — '
                        'sono VIVERI. Pane, vino, candele. I muri non mangiano. Chi è '
                        'murato, sì.'),
         ]),
    dict(n=7, nome='L’IMPRESA VOLTAN & FIGLI', voce_mappa='Palazzo dell’Impresa Voltan',
         req='Il portiere dell’impresa smista i questuanti con un sopracciglio. Ma chi '
             'nomina la materia prima segreta — quella che l’impresa compra di notte e non '
             'dichiara — viene fatto salire in fretta, prima che la strada senta.',
         chiave=('parola', 'LE SCORIE DEL QUARANTUNO'), art='Impresa Voltan.png',
         chiude=None,
         indizi=[
             'L’ingegner Voltan non riceve: «è in cantiere». Il suo ufficio, dalla porta a '
             'vetri: il campionario dell’intonaco in mattonelle numerate, e una parete '
             'INTONACATA A METÀ — metà stanza suona, metà stanza è morta. L’ingegnere dorme '
             'nella metà morta.',
             'In portineria, sotto chiave e sotto un nome falso, il taccuino sequestrato di '
             'Fava: il portiere lo consegna pur di non sentire più la parola «Questura». '
             'Ultima pagina strappata; sulla precedente: «le note muoiono a tre passi dalla '
             'parete di ponente. La parete BEVE.»',
             'La bacheca degli ordini di servizio: «il capoturno del cantiere risponde SOLO '
             'al Capocantiere; il Capocantiere risponde SOLO all’ingegnere». In fondo, '
             'firmato Voltan: «la squadra di notte è pagata a parte. Fuori busta, fuori '
             'registro, fuori discussioni.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='L’ufficio dell’ingegnere',
                  testo='Sulla scrivania di Voltan, i conti della «Quiete S.A.»: l’impresa '
                        'non VENDE l’intonaco alla società anonima — lo COMPRA da lei, a '
                        'prezzo doppio, brevetto compreso. Voltan non è il padrone del '
                        'silenzio: è il suo primo cliente. E chi gli sta sopra non ha nome, '
                        'solo carta.'),
         ]),
    dict(n=8, nome='IL MAGAZZINO DELLA CALCE', voce_mappa='Magazzino della Calce',
         req='Il magazzino fuori cinta è chiuso da un lucchetto da poco e da un cane da '
             'molto. Ma chi conosce il nome giusto — quello dell’uomo che ha la chiave e '
             'la sete — si fa aprire senza scavalcare.',
         chiave=('parola', 'IL CAPOTURNO'), art='Magazzino della Calce.png',
         chiude=None,
         indizi=[
             'I sacchi di «calcina speciale» hanno tutti il marchio a fuoco con l’onda '
             'della Fonderia: dentro, calce e bronzo macinato. Un intero magazzino di '
             'silenzio pronto da stendere — abbastanza per TRE quartieri come Sant’Orsola.',
             'Il capoturno in persona dorme la sbornia tra i sacchi: nel gilet, il fischietto '
             'd’ordinanza e le chiavi del cancello. Si sveglia quel tanto che basta: «alle '
             'nove stacco. Sempre. Chiedete pure in cantiere.»',
             'Dietro i sacchi, casse di lanterne da cantiere a sportello schermato — comprate '
             'a dozzine, «per i lavori di notte al terzo piano». Una è ancora nella paglia.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La calcina speciale',
                  testo='Un sacco su dieci porta un secondo marchio, piccolo, sotto '
                        'l’onda: una Q coronata — «La Quiete S.A.». La società anonima non '
                        'compra soltanto il brevetto: compra la PRODUZIONE. Il quartiere '
                        'sordo non è un cantiere: è un collaudo.'),
         ]),
    dict(n=9, nome='IL CANCELLO DEL PALAZZONE', voce_mappa='Il Palazzone di Sant’Orsola',
         req='Il cancello del palazzone è l’unico varco nella cinta: guardiania nuova, '
             'squadra dentro, e nessuna faccia amica. Si entra col carro della calce — e '
             'con la carta giusta sul carro.',
         chiave=('oggetto', 'LA BOLLA DELLA CALCE'), art='Cancello del Palazzone.png',
         chiude=None,
         indizi=[
             'Dal cancello, il palazzone di sera: sei piani di ponteggi e teli, nessuna '
             'lanterna ai piani — tranne una, al TERZO, dietro l’intercapedine di ponente, '
             'che non dovrebbe avere stanze dietro.',
             'Il carro della calce entra alle nove meno un quarto e nessuno controlla il '
             'carico in uscita: solo in entrata. Il guardiano nuovo ha l’aria di chi è '
             'pagato per non sentire: al primo rintocco di San Michele non gira nemmeno la '
             'testa.',
             'Sui teli del ponteggio di ponente, in basso, qualcuno ha scritto col gesso '
             'da muratore, in piccolo: «F. — III — vivo». Una mano di dentro. Qualcuno del '
             'cantiere non è d’accordo con quello che custodisce.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il palazzone di sera',
                  testo='A fissare il terzo piano, il palazzo sembra trattenere il fiato: '
                        'si vede una stanza senza porte dietro un muro fresco, un uomo '
                        'seduto che conta i colpi delle proprie nocche, e una squadra che '
                        'gioca a carte in silenzio, sotto una lampada schermata. Nessuno '
                        'parla, là dentro. Nemmeno per dare gli ordini. La visione dura un '
                        'rintocco.'),
         ]),
]

# Tessere del palazzone. Percorso a SCELTA (regola varietà): dopo T2 si
# sale dai ponteggi (T3P-T4P, esposti) o dalle intercapedini (T3I-T4I-T5I,
# sorde). Le due vie sboccano in T6.
TILES_7 = [
    dict(id='T1', nome='IL CANCELLO E IL CARRO', exits={'N': 'T2'}, start='S',
         testo='Il carro della calce passa il cancello al passo, e il cantiere di notte vi '
               'inghiotte: ponteggi come alberi di nave, teli che respirano al vento, e un '
               'silenzio SBAGLIATO — i vostri passi arrivano alle orecchie un attimo dopo, '
               'attutiti, come sott’acqua. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito '
               'delle Domande 4 e 1 (vedi la busta della Soluzione). Qui dovete riportare '
               'Fava per vincere.',
         cerca_vuoto='Sacchi di calce accatastati, badili, una garitta con la stufa '
                     'ancora tiepida e una sedia scostata in fretta. Niente altro: qui '
                     'si lavora e basta.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL PIANO TERRA', exits={'S': 'T1', 'O': 'T3P', 'E': 'T3I'},
         testo='Il piano terra è una selva di puntelli: calcinaie aperte come pozze, la '
               'betoniera ferma, archi di mattone fresco. La scala di ponente è MURATA — '
               'calce nuova, stesa male, in fretta. Si sale in due modi: dai PONTEGGI di '
               'ponente (a Ovest: veloci, e all’aperto) o dalle INTERCAPEDINI di levante (a '
               'Est: coperte, e mute). Il gruppo SCEGLIE la via ad alta voce prima di '
               'rivelare la prossima tessera — e da quella via tornerà.',
         arbitro='La scelta è vincolante: la via non scelta resta coperta e NON si rivela '
                 '(le sue tessere restano nella scatola). Il ritorno percorre la via '
                 'dell’andata, con le stesse regole (prove dei ponteggi comprese).',
         cerca='Nella calcinaia, mezzo affondato, il badile del capoturno col manico '
               'marchiato: non è un oggetto — è la conferma che qui si lavora di notte, '
               'fuori registro.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3P', nome='I PONTEGGI DI PONENTE', exits={'E': 'T2', 'N': 'T4P'},
         testo='Il ponteggio sale nel buio: tavole che ballano, corde che cantano al vento, '
               'la contrada sorda là sotto — e quassù, sorpresa, si SENTE: il vento riporta '
               'il suono. OGNI VOLTA che un eroe entra in questa tessera, prova NERVI '
               '(Media): il vuoto tira, le tavole si spostano. Chi fallisce perde 1 azione '
               'al prossimo turno (vertigine).',
         arbitro='Le carte spawn qui piazzano i nemici sulla porta di USCITA (Nord: la '
                 'squadra sale dall’interno e vi taglia la strada). La regola sorda NON '
                 'vale sui ponteggi: il vento riporta il suono — abilità e aiuti come da '
                 'regole normali.',
         cerca='Legata a un montante, una fune di servizio con gancio: chi la prende può '
               'ridiscendere di UNA tessera senza prove, una sola volta (poi resta giù).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4P', nome='IL CASTELLO DI TAVOLE', exits={'S': 'T3P', 'E': 'T6'},
         testo='L’ultimo tratto di ponteggio è un castello di tavole a sbalzo sul vuoto: il '
               'telo strappato schiaffeggia l’aria, la contrada è un pozzo nero là sotto. '
               'OGNI VOLTA che un eroe entra in questa tessera, prova NERVI (Media); chi '
               'fallisce perde 1 azione al prossimo turno. A Est, il varco nel muro fresco: '
               'l’intercapedine del terzo piano. QUANDO RIVELATE QUESTA TESSERA: appare 1 '
               'Sicario di ronda — quassù la lanterna schermata gira.',
         arbitro='Vale la stessa regola di T3P (prova a ogni ingresso, niente regola '
                 'sorda). Dal varco a Est si entra in T6 — e la squadra, di là, non vi ha '
                 'sentiti arrivare SOLO se nessuno ha fallito prove in questa tessera '
                 'nell’ultimo round (altrimenti T6 si rivela con la squadra già in guardia: '
                 'nessun effetto meccanico extra, ma leggete la variante del fronte).',
         cerca_vuoto='Tavole, morsetti, un secchio di chiodi. E trenta metri di vuoto a un '
                     'passo, pazienti come un creditore.',
         arredi=[(1, 2, 'casse')]),
    dict(id='T3I', nome='L’INTERCAPEDINE DI LEVANTE', exits={'O': 'T2', 'N': 'T4I'},
         testo='Il muro è doppio, e voi siete DENTRO il muro: un cunicolo di mattone fresco '
               'largo due spalle, che sale piano. L’intonaco qui è steso su entrambi i '
               'lati: la vostra lanterna è un tuono di luce in un mondo senza suono. '
               'REGOLA D’AMBIENTE — IL SILENZIO SEPARA: in questa tessera ogni abilità o '
               'aiuto rivolto a un ALTRO eroe (cure, bonus, ri-tiri altrui) richiede '
               'ADIACENZA. In compenso, non vi sentono: la PRIMA carta spawn rivelata in '
               'questa tessera piazza 1 nemico in meno.',
         cerca='In una nicchia, il gesso di un muratore e tre parole: «F. — III — vivo». '
               'Chi l’ha scritto conosce la strada: un segno di gesso ogni dieci passi, '
               'fino in cima.',
         arredi=[(0, 2, 'casse')]),
    dict(id='T4I', nome='IL VANO DELLE CANNE MORTE', exits={'S': 'T3I', 'N': 'T5I'},
         testo='Le canne fumarie del palazzone salgono in fascio dentro il muro — ma sono '
               'MORTE: murate in cima, senza tiraggio. Qualcuno le usa come intercapedine '
               'di servizio: pioli di ferro, una carrucola, secchi che salgono e scendono. '
               'REGOLA D’AMBIENTE — IL SILENZIO SEPARA (come T3I): aiuti solo tra '
               'adiacenti; la PRIMA carta spawn della tessera piazza 1 nemico in meno.',
         arbitro='La carrucola è il montacarichi dei viveri per il terzo piano: chi Cerca '
                 'trova i secchi coi resti — pane, cera, un fiasco. Fava è vivo e '
                 'mantenuto: la squadra non è una banda di assassini, è gente PAGATA. '
                 'Conta, per chi vorrà parlare invece di combattere.',
         cerca='Nei secchi del montacarichi: mezza pagnotta, un mozzicone di candela e un '
               'biglietto mai spedito, scritto a matita: «dite a mia moglie che il sordo '
               'qui sono io. E.F.»',
         arredi=[(1, 1, 'casse'), (2, 3, 'casse')]),
    dict(id='T5I', nome='LA SCALA DI SERVIZIO', exits={'S': 'T4I', 'O': 'T6'},
         testo='Una scala a chiocciola di ferro, stretta nel vano tra i muri, sale al '
               'terzo piano. I gradini sono foderati di FELTRO: qualcuno sale e scende '
               'senza fare rumore, da mesi. REGOLA D’AMBIENTE — IL SILENZIO SEPARA (come '
               'T3I): aiuti solo tra adiacenti; la PRIMA carta spawn della tessera piazza '
               '1 nemico in meno. A Ovest, in cima, la porta bassa: l’intercapedine del '
               'terzo piano. QUANDO RIVELATE QUESTA TESSERA: appare 1 Sicario di ronda — '
               'il guardiano dei piedi di feltro fa le scale ogni ora.',
         cerca_vuoto='Feltro inchiodato gradino per gradino, e sotto, polvere di calce '
                     'che non conserva impronte. La tromba delle scale è nuda: nessuna '
                     'nicchia, nessun ripostiglio.',
         arredi=[(0, 1, 'casse')]),
    dict(id='T6', nome='L’INTERCAPEDINE DEL TERZO PIANO', exits={'O': 'T4P', 'E': 'T5I'},
         testo='La stanza che non esiste: un vano lungo e basso tra due muri, foderato '
               'd’intonaco grigio da tutti i lati — un silenzio così pieno che si sente il '
               'proprio sangue. Al centro, legato a una sedia tra i sacchi di scorie, '
               'ERNESTO FAVA: vivo, magro, e con gli occhi di chi conta i giorni. QUANDO '
               'RIVELATE QUESTA TESSERA: appare IL CAPOCANTIERE con la Squadra del '
               'Silenzio — 2 Sgherri, più 1 ogni 4 eroi.',
         arbitro='Liberare Fava: Interagire, nessuna prova; si muove col gruppo (Movimento '
                 '5 — appena liberato CORRE per la vita, non agisce). <b>Deroga '
                 'dichiarata:</b> il Regolamento assegna 3 caselle al PNG scortato; qui sono '
                 '5, ed è voluto — un uomo appena sciolto dalla corda corre per la vita. '
                 'Il Capocantiere NON parla mai durante lo scontro: nel '
                 'silenzio che ha costruito, non serve. «Smascherato» (Domanda 2 esatta): '
                 'gridando il nome di VOLTAN, il Capocantiere capisce chi pagherà per '
                 'tutto — salta la sua PRIMA attivazione e 1 Sgherro se ne va («io non '
                 'vado in galera per l’ingegnere»). Vittoria: Fava fuori da T1, per la '
                 'via dell’andata.',
         cerca_vuoto='Sacchi di scorie messi a far da mobili, una branda, un piatto di '
                     'latta. Chi ha allestito l’intercapedine ha portato dentro il '
                     'minimo e nient’altro.',
         arredi=[(2, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore). Nessun mostro:
# la Squadra del Silenzio sono Sgherri riusati, il boss e' un uomo.
NEMICI_7 = [
    dict(nome='IL CAPOCANTIERE', att=2, dif=8, fer=4, mov=3, dan=2, boss=True,
         tipo='La Squadra del Silenzio (Boss)', art='Il Capocantiere.png',
         note='Non parla mai. Nessuna debolezza-oggetto: è un uomo. «Smascherato» (D2 '
              'esatta): gridate il nome di Voltan — salta la sua PRIMA attivazione e 1 '
              'Sgherro della Squadra se ne va.',
         bio_bestiario='Un uomo grande e paziente col piombo da muratore in mano e '
              'l’aria di chi ha già murato ogni domanda. Non urla mai: nel silenzio che '
              'ha costruito, non serve — la squadra legge i suoi gesti come un’orchestra '
              'legge il direttore. Non è un mostro e non è un fanatico: è il miglior '
              'capomastro della provincia, pagato il triplo per non sentire i colpi '
              'dall’intercapedine. Nessuna reliquia lo stona e nessun oggetto lo doma: '
              'è un uomo, e come tutti gli uomini pagati ha un punto debole — il nome di '
              'chi paga. Gridate «VOLTAN» davanti a lui (Domanda 2 esatta): capisce in un '
              'attimo chi finirà in galera e chi no, esita — salta la sua prima '
              'attivazione — e uno della squadra posa gli attrezzi e se ne va. Ai tavoli '
              'da 2-3 eroi non recupera mai ferite, qualunque cosa dicano le carte '
              '(regola delle taglie, vedi Regolamento).'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 7 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 7')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il quartiere sordo')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_7.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 6 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 7')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)

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
    doms = ['1. DOVE è tenuto Ernesto Fava? (attenzione: serve più di una conferma)',
            '2. CHI vende il silenzio?',
            '3. QUANDO si entra nel cantiere senza dare l’allarme?',
            '4. COSA portate con voi per passare il cancello?']
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
    c.setTitle('Ombre su Roccamora - Episodio 7 - Spedizione')
    # copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 7 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'il palazzone di sant’orsola, al cambio delle nove — la sera dopo')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 112*mm, W - 56*mm, 60*mm, [
        Paragraph('<i>Il cancello si scopre al cambio del guardiano, e il cambio è alle nove '
                  'di sera: quando l’Indagine si chiude, quello di stasera è passato da un '
                  'pezzo — e un carro della calce, col carrettiere e la bolla, non si mette '
                  'insieme a mezzanotte. Si entra al cambio della sera dopo. Fava è murato, ma '
                  'nutrito: chi lo tiene non ha fretta, e questo è l’unico vantaggio che vi '
                  'lascia.</i><br/><br/>'
                  'Le 21 carte Minaccia dell’episodio (più o meno una, secondo il vostro '
                  'Bivio dell’Episodio 6 — vedi Soluzione) e le schede Nemici sono carte a '
                  'parte (cartella <b>Episodio 7/cards/</b>). Le 8 tessere del palazzone sono '
                  'in <b>Episodio 7/board/</b> — ma se ne giocano al massimo 6: dopo il piano '
                  'terra il gruppo SCEGLIE la via (ponteggi O intercapedini) e l’altra resta '
                  'nella scatola. Le pagine seguenti sono le note per tessera: il <b>fronte</b> '
                  'si legge ad alta voce quando una tessera viene rivelata; il <b>retro del '
                  'foglio</b> è solo per chi tiene questo fascicolo, e si consulta SOLO quando '
                  'un eroe Cerca. Non giratelo prima.', BODY)])
    c.showPage()
    # retro di copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 110*mm, W - 60*mm, 62*mm, [
        Paragraph('Lo tiene <b>una persona sola</b> — di solito chi pesca il mazzo Minaccia e '
                  'tiene il Registro delle Ferite. Quando il gruppo rivela una tessera, legge ad '
                  'alta voce la voce corrispondente. Quando un eroe <b>Cerca</b>, gira il '
                  'foglio e legge l’esito di quella sola tessera: con lo stesso tono sia che '
                  'ci sia un tesoro, sia che non ci sia niente. Gli altri giocatori non leggono '
                  'il retro.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_7:
        art_file = TILE_ART_7[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_7[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_7.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 80*mm, W - 40*mm, 52*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 7</b> (PDF a parte). In campo: '
                  'la <b>Squadra del Silenzio</b> e i manovali (Sgherri), il <b>Guardiano di '
                  'notte</b> (Sicario) e <b>il Capocantiere</b> (il boss: appare in T6 con 2 '
                  'Sgherri, +1 ogni 4 eroi). Nessun mostro: l’orrore, qui, è '
                  'il silenzio. Vittoria: liberate Fava (Interagire in T6) e riportatelo in '
                  'T1 per la via dell’andata. <b>Nelle tessere SORDE</b> (T3I, T4I, T5I) ogni '
                  'aiuto tra eroi richiede adiacenza, e la prima carta spawn di ogni tessera '
                  'piazza 1 nemico in meno. <b>Sui ponteggi</b> (T3P, T4P): prova NERVI '
                  '(Media) a ogni ingresso in tessera, chi fallisce perde 1 azione. Ai tavoli '
                  'da 2-3 eroi il Capocantiere <b>non recupera mai ferite</b> (regola delle '
                  'taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_7())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_7():
    """Miniature dell'Episodio 7. Fava e' il prigioniero-scorta; i 3
    segnalini Canto usano le arti delle carte Crescendo dell'episodio
    (qui il Canto e' l'ALLARME del cantiere)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x5) · SICARI (x2)', [('Lo Sgherro.png', 5), ('Il Sicario.png', 2)]),
        ('CAPOCANTIERE · FAVA', [('Il Capocantiere.png', 1), ('Ernesto Fava.png', 1)]),
        ('ALLARME (CANTO)', [('Un fischio di sotto.png', 1), ('Le lanterne si muovono.png', 1),
                             ('Il cantiere è sveglio.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 7 - Soluzione (non aprire)')

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
        '<b>APERTURA — il Bivio dell’Episodio 6</b> (applicare PRIMA della lettera): se '
        'avete <b>CATTURATO FERRI VIVO</b> — il culto sa esattamente cosa avete capito, e vi '
        'guarda: mescolate nel mazzo Minaccia la carta «Gli occhi del culto» (22 carte). Se '
        'l’avete <b>LASCIATO AGLI ABISSI</b> — il culto è decapitato e la città respira: '
        'rimuovete la carta crescendo «Un fischio di sotto» dal mazzo (20 carte).',
    ])
    pagina('la verità', [
        'Niente culto, stavolta. L’impresa <b>Voltan & Figli</b> costruisce il palazzone di '
        'Sant’Orsola con un intonaco brevettato impastato con le <b>scorie del bronzo del '
        '1741</b> — comprate a carrettate dalle Fonderie: il bronzo che ha suonato per due '
        'secoli, macinato, BEVE il suono. L’ingegner <b>Silvio Voltan</b> firma il brevetto '
        'e vende «quiete»; ma il vero committente è una società anonima, «La Quiete S.A.», '
        'che il brevetto lo PAGA — su carta di pregio, senza mai un nome. Il quartiere '
        'sordo non è un cantiere: è un collaudo.',
        '<b>Ernesto Fava</b> l’aveva scoperto dall’unico sintomo che non poteva ignorare: i '
        'pianoforti appena accordati stonavano DENTRO le case nuove. Ha scritto all’impresa '
        'minacciando la Questura: da mercoledì è murato — vivo, nutrito, e sordo per '
        'davvero — nell’intercapedine del terzo piano, sorvegliato dal Capocantiere e '
        'dalla sua squadra pagata fuori registro. Voltan non è un assassino: è un uomo che '
        'ha venduto il brevetto a qualcuno che non ha fretta. E che non ha nome.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è tenuto Fava?</b> Nell’intercapedine del terzo piano del palazzone '
        '(lo confermano il taccuino, le bolle notturne «al terzo piano» e il guardiano '
        'licenziato — serve più di una conferma). <i>Esatta:</i> sapete dove salire — nel '
        '1° round non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> girate il '
        'cantiere a tentoni: 1 Sgherro appare in T1 alla rivelazione.',
        '<b>2. CHI vende il silenzio?</b> L’ingegner Silvio Voltan, l’autore del brevetto. '
        '<i>Esatta:</i> «Smascherato» — in T6, gridate il suo nome davanti al '
        'Capocantiere: salta la sua PRIMA attivazione e 1 Sgherro della Squadra se ne va. '
        '<i>Sbagliata:</i> nessun effetto.',
        '<b>3. QUANDO si entra senza dare l’allarme?</b> Alle NOVE, al cambio del '
        'guardiano (registro dei turni + guardiano licenziato). <i>Esatta:</i> entrate '
        'nella finestra giusta — il Canto (l’Allarme) parte da 0. <i>Sbagliata:</i> il '
        'cancello vi nota: 1 segnalino Canto in più alla partenza.',
        '<b>4. COSA portate con voi?</b> LA BOLLA DELLA CALCE (la baracca del cantiere): '
        'il carro entra dal cancello senza domande. <i>Nota per chi arbitra:</i> il '
        'Fischietto del Capoturno e la Lettera di Minaccia sono esche — il fischietto '
        'serve a un capoturno vero (voi non lo siete), la lettera è il movente, non un '
        'lasciapassare. La Lanterna Schermata è onesta (+1 NERVI nelle tessere sorde), i '
        'Tappi di Cera pure (un eroe ignora la prima prova NERVI da rumore/allarme).',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente tre carte — '
        'l’Osservazione «Il banco dell’accordatore» (L2), la Testimonianza «Il '
        'magazziniere» (L3) e la Testimonianza «Il guardiano licenziato» (L4). Se il '
        'gruppo non ne ha letta nessuna, giudicate con elasticità una risposta «vicina» '
        '(es. «l’impresa del palazzone», «quelli del brevetto»).',
        '<b>QUANTE consegne notturne? (deduzione bonus di CONTEGGIO).</b> Le bolle della '
        'Baracca (Reperto C, L6) contano le consegne notturne «al terzo piano»; le chiazze '
        'sorde della Contrada (L1) dicono quante case sono già intonacate. Incrociando i '
        'due numeri sapete ESATTAMENTE come è presidiato il cantiere e a che ritmo lavora: '
        'reggete un round in più prima che il cantiere si sbarri (soglia di sbarramento '
        'dal 7° all’8° segnalino Allarme). Un conteggio approssimato non basta: servono '
        'entrambe le fonti.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo (0 ore avanzate): 1 gettone Intuizione, '
        'come sempre.',
    ])
    pagina('spedizione — montaggio, la scelta e il boss', [
        '<b>Quando si entra.</b> Il varco del cambio si apre ogni sera alle nove (registro '
        'dei turni, L6), e quello di stasera passa mentre il gruppo raccoglie le prove: la '
        'Spedizione si gioca al cambio della sera SUCCESSIVA all’Indagine. Il vantaggio '
        'della Domanda 3 vale per quel cambio lì, non per uno che è già andato — e la '
        'giornata serve comunque a procurarsi carro, carrettiere e bolla. Fava è murato ma '
        'nutrito: l’attesa non lo uccide e non costa niente al tavolo. <i>Se qualcuno '
        'chiede perché non si corre subito: perché alle undici di sera al cancello c’è il '
        'guardiano nuovo, sveglio, e nessuna consegna in arrivo.</i>',
        '<b>Montaggio</b> (tessere in Episodio 7/board/, coperte tranne T1):<br/>'
        'T1 Cancello e Carro (ingresso, da Sud) → T2 Piano Terra. Da qui DUE vie verso '
        'T6, a scelta del gruppo (annunciata ad alta voce, vincolante — l’altra via '
        'resta nella scatola): a Ovest i PONTEGGI (T3P → T4P → T6), a Est le '
        'INTERCAPEDINI (T3I → T4I → T5I → T6). Il ritorno percorre la via dell’andata.',
        '<b>La via dei ponteggi</b> (corta, esposta): a OGNI ingresso di un eroe in T3P o '
        'T4P, prova NERVI (Media) — chi fallisce perde 1 azione (vertigine). Niente '
        'regola sorda: il vento riporta il suono. Le carte spawn piazzano i nemici sulla '
        'porta di USCITA (la squadra sale dall’interno).',
        '<b>La via delle intercapedini</b> (lunga, SORDA): in T3I, T4I e T5I ogni abilità '
        'o aiuto rivolto a un altro eroe richiede ADIACENZA (il silenzio separa). In '
        'compenso non vi sentono arrivare: la PRIMA carta spawn rivelata in ciascuna '
        'tessera sorda piazza 1 nemico in meno.',
        '<b>Il mazzo Minaccia:</b> le 21 carte dell’episodio (±1 dal Bivio, vedi prima '
        'pagina). Il Canto qui è l’ALLARME del cantiere: carte crescendo + 1 segnalino '
        'automatico ogni 4° round; alla soglia (3 segnalini) il cantiere è sveglio — da '
        'quel momento ogni Fase Minaccia pesca 1 carta in più, per sempre. <b>Il '
        'cantiere si sbarra (7° segnalino, 8° se avete il conteggio esatto — vedi Domanda QUANTI?):</b> portoni chiusi, squadre a ogni varco — '
        'la fuga è impossibile, Fava resta dentro: sconfitta (a tempo, non a sangue).',
        '<b>Il Capocantiere</b> (statistiche nel Bestiario; Ferite per taglia tabellate): '
        'appare quando rivelate T6, con 2 Sgherri (+1 ogni 4 eroi). '
        'Nessuna debolezza-oggetto: è un uomo — si combatte, si aggira, o si smaschera '
        '(Domanda 2). Vittoria: Fava (Interagire) fuori da T1 per la via dell’andata. '
        'Il Capocantiere e la squadra INSEGUONO: le prove dei ponteggi al ritorno valgono '
        'anche per loro (chi arbitra tira una prova unica per la squadra: se fallisce, '
        'la squadra resta indietro di un round). <b>L’aggancio:</b> a fine di ogni round '
        'di ritorno, se il Capocantiere è ADIACENTE a un eroe (e non stordito dallo '
        'Smascherato), o se 3+ membri della squadra sono adiacenti a eroi, il gruppo non '
        'avanza di un tratto: sganciatevi o abbatteteli.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «Fava riapre '
        'bottega il lunedì. Il primo lavoro non se lo fa pagare: accorda il pianoforte '
        'della parrocchia di Sant’Orsola, “così almeno QUALCOSA, qui, suona giusto”. '
        'L’ingegner Voltan patteggia in una mattina: il brevetto è ritirato, l’impresa '
        'paga, il palazzone resta — muto — ad aspettare le demolizioni o gli inquilini. '
        'Nessuno, in aula, fa l’unica domanda che conta: CHI comprava tutto quel '
        'silenzio?»',
        '<b>FRAMMENTO DI CAMPAGNA N. 7:</b> <i>«Le scorie del bronzo del ’41 bevono il '
        'suono: al suono succede il silenzio. E il silenzio qualcuno lo compra a '
        'carrettate.»</i> Conservatelo per il finale di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> Il fascicolo del brevetto è '
        'in mano vostra:<br/>'
        '<b>Denunciare il brevetto.</b> Sant’Orsola è salva e riconoscente: le demolizioni '
        'cominciano, la contrada risente le campane e parla. Nell’Episodio 8 la Testimonianza '
        '«Il sensale dei banchi» (Luogo 1) parte GIÀ RIVELATA (gratis). Ma chi comprava '
        'l’intonaco brucia i registri: nell’Episodio 8 l’esame di Carbone sull’oro NON sarà '
        'disponibile.<br/>'
        '<b>Tacere e tracciare gli acquirenti.</b> Partite con la lista dei compratori: '
        'nell’Episodio 8, una conferma in più alla Domanda 1. Ma Sant’Orsola resta sorda: '
        'la Testimonianza «Il sensale dei banchi» (Luogo 1) esce dal mazzo Approfondimenti '
        'dell’Episodio 8.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 7 e non parlatene più fino '
        'all’Episodio 8.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite — Tempra, Fibra, '
        'Revolver, Lanterna schermata, Borsa di garze (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

# Descrizioni estese per chi arbitra (stessi fatti della carta, piu' aria).
LUOGHI7_DESC = {
    1: "Sant’Orsola sa di pane del forno e di calce bagnata, e il primo passo dentro la contrada "
       "lo si sente due volte: prima sotto la suola, poi da qualche parte più in là, come se la "
       "strada lo restituisse a chi passa. Venti passi più avanti non lo restituisce più. Davanti "
       "alle case vecchie c’è tutto — il secchio contro la pietra del pozzo, una lite al secondo "
       "piano, un cerchio di ferro spinto da un bambino lungo il muro — e davanti a quelle "
       "rifatte l’aria si chiude come una porta imbottita: il bambino corre, il cerchio gira, e "
       "per quattro portoni non fa rumore. Il sagrestano di San Michele risale la contrada con "
       "voi solo per farvi sentire mezzogiorno; tiene la testa un poco piegata e conta i "
       "rintocchi sulle dita, come si contano i soldi degli altri: «Prima arrivava al fiume. "
       "Adesso non arriva al forno. E il vescovo dice che sono sordo io», e mentre lo dice non "
       "guarda il campanile, guarda i muri. Al chiodo accanto a un portone rifatto una catena da "
       "cane pende vuota fino a terra, con l’anello di fondo lucido dove la bestia tirava.",
    2: "La bottega dell’accordatore sa di feltro, colla di pesce e legno stagionato, e dentro fa "
       "più freddo della strada — quel freddo che prende una stanza chiusa da tre giorni, con la "
       "stufa spenta a metà mattina. Il pianoforte verticale è aperto come un paziente sul "
       "tavolo: la meccanica scoperta, i martelletti in fila per ottava, il panno steso sulle "
       "corde perché non prendano l’umido. Ogni cosa sta al suo posto con l’ostinazione di chi "
       "lavora di precisione — le chiavi appese per taglia, la colla nel bagnomaria, il grembiule "
       "piegato in tre sul deschetto invece che buttato sul gancio — e nella fila dei diapason, "
       "dal piccolo al grande, ne manca uno in mezzo: il chiodo è rimasto lucido, e attorno il "
       "legno è più chiaro. Quando in strada passa un carro, il pianoforte scoperto risponde da "
       "solo, una nota bassa che dura quanto il carro e poi smette; poi torna il silenzio della "
       "bottega, che è più pieno di quello della strada. Sul banco, accanto al registro aperto, "
       "c’è una tazza col fondo di caffè rappreso, già screpolato al centro.",
    3: "Le Fonderie sanno di ferro bagnato e di cenere spenta, e il piazzale, dopo la pioggia, "
       "restituisce da sotto le suole il caldo del giorno. In fondo, la montagna grigia che "
       "nessuno spazza da due secoli e che nessuno ha mai voluto porta un fronte di scavo fresco, "
       "tagliato netto come una fetta di polenta; alla base, i solchi delle ruote entrano leggeri "
       "ed escono più profondi. Adesso non supera l’altezza di un uomo, e nella guardiola c’è una "
       "fotografia dell’anno scorso dove arriva alla gronda del capannone. Il magazziniere tiene "
       "il registro degli scarti sotto il braccio come si tiene un breviario e non ve lo lascia "
       "in mano; il capofonderia, invece, sputa per terra prima di parlare e si pulisce le dita "
       "sul grembiule due volte di seguito: «quella roba non vale niente», dice, e il resto se lo "
       "tiene. A ogni palata sul fronte di scavo si alza una polvere fine che luccica e non "
       "ricade: resta sospesa nella luce della forgia come farina sopra una madia. Sul ceppo, "
       "accanto al taglio, è rimasto un sacco vuoto con l’orlo rovesciato e l’interno grigio.",
    4: "Il Banco dei Pegni sa di naftalina, di carta da pacchi e di monete tenute in tasca troppo "
       "a lungo; dietro la grata di ferro battuto la lampada col paralume verde tiene tutto il "
       "resto in penombra. Sugli scaffali, mezza contrada in pacchi legati collo spago, un "
       "cartellino per ciascuno; sul bancone, allineati come per un’ispezione, tre pegni della "
       "settimana: un orologio, una fede, un rasoio. Fossa non aspetta che chiediate — li gira "
       "uno per volta con l’unghia, perché la lampada prenda dentro le incisioni, e nelle "
       "incisioni c’è la stessa polvere grigia: «Operai del palazzone», dice, «impegnano tutto, e "
       "hanno le mani piene di questa», e mentre lo dice guarda le vostre. Fra i pegni non "
       "riscattati, appesa in fondo, sta una giubba da guardiano notturno col panno più scuro "
       "all’altezza del petto, nella forma esatta della placca che non c’è più. L’orologio sul "
       "bancone cammina ancora, benché nessuno lo carichi da giorni; e a una certa ora della "
       "sera, quando le voci calano, lo si sente battere sopra tutto il resto.",
    5: "L’Ufficio Brevetti sa di ceralacca, di colla d’amido e di quella polvere di carta che si "
       "posa sulla lingua e non va via bevendo. Scaffali fino al soffitto, fascicoli legati col "
       "nastro rosso e ordinati per annata, timbri a rullo in fila sul feltro del bancone, e "
       "l’usciere che conosce ogni comma e nessuna eccezione. L’archivista, invece, sale la "
       "scaletta senza farselo chiedere e torna con la pratica sotto il braccio: manichette nere "
       "ai polsi e i pollici neri lo stesso, e sfoglia parlando piano, come si parla in una "
       "stanza di malati. «È la terza pratica quest’anno che passa su questa carta», dice, e "
       "conta le altre due sulle dita senza nominarle. Ogni volta che qualcuno attraversa il "
       "corridoio i vetri dello schedario tintinnano un poco e i fascicoli si assestano sugli "
       "scaffali con un fruscio che dura più del passo. Sotto la lampada verde, le pagine del "
       "fascicolo hanno tutte lo stesso ingiallito d’ufficio tranne una: il foglio di "
       "accompagnamento, piegato in tre, spesso come tela, senza l’ombra di un dito.",
    6: "La baracca del cantiere sa di ghisa calda, segatura bagnata e tabacco da pipa: qui dentro "
       "il rumore c’è ancora — la lamiera della stufa che schiocca, il legno che lavora, una "
       "sedia spostata — e la cosa si nota più del caldo. Sul tavolo a cavalletti i disegni del "
       "palazzone stanno aperti, tenuti giù ai quattro angoli da un mattone, un piombo, una "
       "bottiglia e il gomito del furiere; al chiodo dietro la porta le bolle di consegna sono "
       "infilzate a mazzi spessi un dito, la carta di sotto già ingiallita e quella di sopra "
       "ancora bianca. Un muratore entra a scaldarsi le mani e parla senza sapere di parlare, "
       "guardando la stufa: «il terzo piano è finito da mesi. Murato prima del secondo. Boh», e "
       "si stringe nelle spalle come per un dispetto del tempo. Dalla finestrella il palazzone "
       "riempie tutto il vetro: sei piani di teli che si gonfiano e si afflosciano piano, sempre "
       "alla stessa cadenza, anche adesso che in cortile non tira un filo d’aria. Accanto al "
       "registro dei turni, sul muro, c’è una crocetta a matita, piccola, all’altezza degli "
       "occhi.",
    7: "Il palazzo dell’impresa è nuovo di un anno e lo si sente prima di vederlo: l’atrio non ha "
       "odore — né di gente, né di stufa, né di cera da pavimenti — e la porta a vetri, "
       "chiudendosi alle vostre spalle, non fa il colpo che dovrebbe, ma un tonfo corto, tutto "
       "all’interno. Ottoni lucidati di fresco, una targa grande come il coperchio di una cassa, "
       "il banco della portineria, un pavimento a scacchi su cui i passi non contano niente. I "
       "commessi attraversano l’atrio con le pratiche sotto il braccio e si guardano la bocca "
       "invece degli occhi; uno, dall’altro capo della sala, risponde a una domanda che nessuno "
       "ha sentito fare. Il portiere vi tiene fermi al banco con due dita sul registro delle "
       "visite e la risposta già pronta: «è in cantiere», dice dell’ingegnere, e lo ripete una "
       "seconda volta senza che nessuno abbia insistito. Oltre la porta a vetri dell’ufficio si "
       "vede il campionario in mattonelle numerate e, sul pavimento, la riga netta dove "
       "l’intonaco si ferma a metà stanza: dritta come un confine di catasto.",
    8: "Fuori cinta, fra gli orti, la calce si sente in gola prima che negli occhi — un pizzicore "
       "secco che fa tossire due volte e poi passa. Il cane legato all’anello del capannone "
       "abbaia da quando avete girato l’angolo, e l’abbaio arriva intero, con la sua coda d’eco "
       "sui muri dell’orto: in contrada, da mesi, non succede più. Dentro, la polvere posata su "
       "ogni cosa fa un chiarore da neve vecchia; i sacchi stanno in pile da otto, marchiati a "
       "fuoco con l’onda della Fonderia, e contro la parete di fondo aspettano casse di lanterne "
       "da cantiere comprate a dozzine, ancora nella paglia dell’imballo. Fra due pile dorme un "
       "uomo grosso, col cappotto addosso e la bocca aperta: nel gilet, un fischietto d’ordinanza "
       "e un mazzo di chiavi che a ogni respiro gli scivola sul fianco e a ogni respiro risale, "
       "senza mai cadere. Si sveglia quel tanto che basta a guardarvi e a decidere che non valete "
       "la fatica. Nella cassa aperta, una lanterna è rimasta nella paglia, con lo sportello "
       "ancora legato col fil di ferro.",
    9: "Al cancello l’aria cambia temperatura da un passo all’altro: dalla parte della contrada "
       "sa di minestra e di canale, dalla parte della cinta di legno crudo bagnato e di calce, e "
       "più fredda di quanto una tavola d’abete possa spiegare. La cinta è nuova, alta due "
       "uomini, le tavole ancora chiare e senza un manifesto sopra — in una città dove ogni muro "
       "porta la sua carta incollata, quel legno pulito si nota come una faccia rasata di fresco. "
       "La garitta ha il vetro e la stufa; il guardiano ci sta dentro seduto di tre quarti e non "
       "gira la testa, né per voi, né quando San Michele batte l’ora dietro i tetti — e l’ora "
       "arriva fin lì appena, come una parola detta in un’altra stanza. Oltre le tavole il "
       "cantiere sta contro il cielo: sei piani di ponteggi e di teli che si gonfiano tutti "
       "insieme e poi si afflosciano, con un ritardo l’uno sull’altro, dal basso verso l’alto. "
       "Dentro si lavora anche a quest’ora — le lanterne si spostano dietro i teli del primo "
       "piano — ma di quel lavoro al cancello non arriva niente: non un colpo di martello, non un "
       "ordine gridato. Al terzo piano, dietro il telo di ponente, una lanterna è accesa e non si "
       "muove.",
}

# Carte Oggetto per luogo (sotto-sezione "carte da prendere" degli indizi).
OGGETTI_LUOGO_7 = {
    2: [('Esca', 'La Lettera di Minaccia', '')],
    5: [('Reperto B', 'il Deposito del Brevetto', '')],
    6: ['La Bolla della Calce', ('Reperto C', 'le Bolle della Calce', '')],
    7: [('Reperto A', 'il Taccuino di Fava', '')],
    8: [
        ('Esca', 'Il Fischietto del Capoturno', ''),
        'La Lanterna Schermata',
        'I Tappi di Cera',
    ],
}

# arte tessere del fascicolo (le stesse dei board)
TILE_ART_7 = {t['id']: t['id'] + '-ep7.png' for t in TILES_7}

# taratura ritagli del fascicolo Luoghi (verificare A VIDEO in Fase D)
LUOGHI7_CROP = {}

# Descrizioni estese delle tessere (fascicolo Spedizione).
TESSERE_DESC_7 = {
    'T1': "Il carro passa la soglia al passo e il cantiere si richiude alle spalle senza fare il "
          "rumore che una cosa così grande dovrebbe fare: il battente di tavole rientra nel "
          "telaio, il chiavistello scende, e tutto arriva alle orecchie con un attimo di ritardo, "
          "come attraverso una parete. L’aia d’ingresso è terra battuta e pozzanghere di latte di "
          "calce: sacchi in pile da otto, badili piantati nel mucchio, una carriola rovesciata, e "
          "sopra ogni cosa l’ombra dei ponteggi che la luna stampa sul terreno a graticola. Il "
          "cavallo respira e lo si vede più che sentirlo; il fiato gli esce dritto e resta lì. "
          "Nella garitta la stufa è ancora tiepida e la sedia è scostata di traverso, come si "
          "scosta quando ci si alza in fretta — ma nessuno esce, e la porticina rimane socchiusa "
          "per tutto il tempo che restate fermi, senza aprirsi di più e senza chiudersi. Sul "
          "montante del cancello, all’altezza della mano, il legno è consumato in un punto solo: "
          "lucido, scuro, grande come un palmo.",
    'T2': "Al piano terra il freddo sale dal terreno come in una cantina, e con il freddo "
          "l’odore: malta bagnata, segatura, calce spenta di fresco che punge in fondo al naso. È "
          "una selva di puntelli — le calcinaie aperte tengono un chiarore lattiginoso che "
          "rimanda la lanterna dal basso e mette le vostre ombre sul soffitto invece che sul "
          "pavimento; la betoniera è ferma col muso in aria e la pala dentro; gli archi di "
          "mattone fresco aspettano ancora le loro centine. Il buio dei piani sale a cerchi sopra "
          "le vostre teste, e la lanterna, alzata a braccio teso, non arriva a trovare il "
          "soffitto. Sul lato di ponente la scala non c’è più: al suo posto un muro steso in "
          "fretta, con la calce colata a lingue sui gradini e le impronte delle mani rimaste "
          "dentro, tre file di dita all’altezza del petto. Ogni tanto, in un punto qualunque "
          "della sala, una goccia cade da un impalcato dentro una calcinaia — e il tonfo non "
          "torna indietro, non fa eco, non fa niente: cade e finisce lì. A terra, davanti al muro "
          "nuovo, una cazzuola è rimasta con la lama in su, piantata nella malta ormai rappresa.",
    'T3P': "Sul ponteggio il mondo torna a funzionare: al terzo palco il vento prende di traverso "
           "e con il vento arriva la città — un cane lontanissimo, una lite dietro un canale, le "
           "campane di un’altra parrocchia che battono l’ora per intero. Dopo il piano terra la "
           "cosa fa un effetto che nessuno si aspettava, e per qualche istante nessuno parla. Il "
           "ponteggio parla per tutti: le tavole non sono inchiodate ma appoggiate e legate, e "
           "cambiano nota sotto ogni piede — le vecchie basse, le nuove più corte e più alte; le "
           "corde lavorano sotto il carico con un cigolio che sale e scende come una fisarmonica; "
           "il telo strappato si gonfia e schiaffeggia il montante, sempre a due tempi. Sotto le "
           "tavole il cortile è un pozzo nero, e ogni tanto una scaglia di calce cade dal palco "
           "di sopra e ci sparisce dentro senza che l’arrivo si senta. A un montante, all’altezza "
           "della cintola, è legata una fune di servizio con il gancio di ferro, ravvolta con la "
           "cura di una mano che ha fatto il mare.",
    'T4P': "L’ultimo tratto non è più un ponteggio ma un castello di tavole a sbalzo, e quassù il "
           "vento non porta più niente della città: prende soltanto, e tira i vestiti da una "
           "parte sola. Le tavole sporgono oltre i montanti quanto un uomo disteso, il telo "
           "strappato sventola come una bandiera che nessuno ammaina, i morsetti sono di due "
           "misure diverse e uno, sull’angolo, è stretto a metà. La contrada sta trenta metri più "
           "in basso e non manda su niente — né voci, né campane, né lo sciacquio dei canali: "
           "soltanto due lumi gialli e la riga più chiara della strada. Nel muro fresco, a filo "
           "di tavolato, si apre un varco basso da manovale, alto quanto un uomo piegato, coi "
           "mattoni dell’imbotte messi di taglio in fretta; da dentro non viene aria, e la fiamma "
           "della lanterna, avvicinata alla bocca del varco, non si piega di un dito. Ogni tanto "
           "una raffica passa sotto il tavolato e le tavole si sollevano tutte insieme di mezzo "
           "dito, poi si riappoggiano una dopo l’altra, dall’esterno verso il muro. Sul bordo "
           "dell’ultima, incastrata fra due assi, sta una gavetta di latta con dentro due dita "
           "d’acqua piovana, ferma.",
    'T3I': "Dentro il muro finisce anche l’idea del rumore: il cunicolo è largo due spalle e i "
           "due intonaci si chiudono ai lati come le pareti di una cassa, così che ogni cosa che "
           "fate vi torna addosso invece di andarsene — il sangue nelle orecchie, la lana del "
           "bavero contro il collo, il cuoio degli stivali, che qui suona come una porta. L’aria "
           "è ferma e sa di malta bagnata e di gesso; la lanterna è un tuono di luce e non ha un "
           "tremito, perché non c’è un filo di corrente in nessun punto. Il passaggio sale piano, "
           "senza gradini, sopra le stesse tavole che i muratori usavano per il ponte di "
           "servizio; ogni tanto un mattone di taglio sporge all’altezza del ginocchio, sempre "
           "dallo stesso lato. Sotto il palmo l’intonaco non è freddo come il mattone che gli sta "
           "sotto: tiene un tepore da pelle, e la mano ci resta un istante di troppo. Parlare "
           "costa più di quanto dovrebbe: le parole escono e cadono a mezzo metro, e chi resta "
           "indietro di due passi vede muoversi le labbra e riceve mezze sillabe. Sul mattone, "
           "ogni dieci passi, c’è un segno di gesso tirato col pollice, sempre alla stessa "
           "altezza.",
    'T4I': "Il vano delle canne sa di fuliggine vecchia e di pane. Le canne fumarie salgono in "
           "fascio dentro il muro, otto o dieci, di mattone e di terracotta, e non tirano: murate "
           "in cima, mai accese, fredde da toccare come pietra di chiesa — un camino che non ha "
           "mai fatto il suo mestiere. Contro la parete corrono i pioli di ferro, piantati a "
           "distanza da uomo alto; a fianco, una carrucola di legno ingrassata di fresco, con la "
           "corda avvolta a spire strette e pulite, e la ruota che gira senza dire niente; la "
           "corda è nuova nel tratto basso e lisa in quello alto, come tutte le corde che fanno "
           "sempre lo stesso viaggio. Nel fascio, una sola canna è aperta da uno sportellino di "
           "ghisa, e dentro non c’è fuliggine: c’è sabbia asciutta. Il secchio è a mezz’aria, "
           "fermo a due metri dal fondo, e ruota su se stesso lentissimo, prima in un verso e poi "
           "nell’altro, come fanno le cose appese quando qualcuno le ha mosse da poco. Di "
           "fuliggine, sui pioli, non ce n’è: i primi tre sono lucidi sopra e sotto, dove la mano "
           "stringe. In fondo al vano, per terra, sta un tovagliolo di tela aperto, con dentro le "
           "briciole e un torsolo di mela già scuro.",
    'T5I': "La scala di servizio è una chiocciola di ferro stretta nel vano fra due muri, e sale "
           "foderata di feltro: inchiodato gradino per gradino con le borchie da tappezziere, "
           "consumato al centro di ogni scalino nella forma di una suola. Sotto la mano la "
           "ringhiera è fredda e non vibra; sotto il piede il ferro non risponde; si sale più "
           "facilmente di quanto sia giusto, e si arriva in cima col fiato corto senza aver "
           "sentito la fatica. Nel vano non c’è nulla da guardare — muro, muro, ferro, e la "
           "polvere di calce che sui gradini foderati non conserva le impronte — se non i segni "
           "di gesso che salgono con voi, uno per rampa, sempre sul montante di destra. Ai due "
           "terzi della salita il vano si allarga in un pianerottolo grande quanto un tavolo, con "
           "una cassetta rovesciata e sopra un mozzicone di candela: la cera, toccata, cede "
           "ancora sotto l’unghia. Dalla fessura sotto la porta in cima esce un filo d’aria "
           "tiepida, a intermittenza, con la cadenza lenta che ha l’aria quando da qualche parte "
           "una fiamma si muove. La porta è bassa, da intercapedine, e la maniglia di ferro è "
           "stata montata al contrario.",
    'T6': "La stanza che non esiste è lunga, bassa e grigia da ogni lato, e il silenzio qui non è "
          "una mancanza: è una cosa che preme, come l’acqua alle orecchie quando si scende in "
          "fondo a una vasca. Ci sono i sacchi di scorie messi in fila a fare da muro e da sedia, "
          "una branda con due coperte, un piatto di latta, un moccolo su un mattone; sulla parete "
          "di fondo, a gesso, file di aste raggruppate a cinque, e l’ultimo gruppo non è finito. "
          "L’aria sa di calce e di sego, e di quell’odore che prende una stanza dove qualcuno "
          "dorme vestito da parecchie notti; di porte non ce n’è nessuna, e quella da cui siete "
          "entrati resta alle vostre spalle. Al centro, legato a una sedia da cantiere, c’è "
          "Ernesto Fava: magro, la barba di tre notti, i polsi segnati dalla corda. Alza la testa "
          "prima che la luce lo raggiunga, e non grida — ha smesso da un pezzo di credere che "
          "serva — ma vi guarda le mani invece della faccia, per capire con che gente ha a che "
          "fare. La fiamma del moccolo, in tutto questo, sta dritta e ferma come dipinta; e in "
          "fondo al vano, dalle ombre, qualcuno posa un mazzo di carte sopra un sacco, senza "
          "fretta.",
}

# Esami di Carbone
ESAMI_CARBONE_7 = {
    'LA POLVERE DI SCORIA': '«Bronzo, macinato fine come farina — e dentro, filamenti di '
                'cera nera: questo bronzo ha SUONATO, per secoli, e qualcuno l’ha spento. '
                'Macinare una campana è come macinare una voce: la polvere ricorda, e '
                'beve ogni suono che passa.»',
    'IL TACCUINO DI FAVA': '«L’ultima pagina è strappata, ma la pressione della matita '
                'resta sul foglio sotto: un indirizzo — il palazzone — e un’ora, le nove. '
                'Fava è entrato con le sue gambe, dal cancello, all’ora del cambio. '
                'Sapeva la finestra. Non sapeva di essere atteso.»',
    'IL CAMPIONE D’INTONACO': '«Fresco, beve i suoni acuti; stagionato, berrà TUTTO. '
                'Tra un anno Sant’Orsola non sentirà nemmeno le proprie campane — e chi '
                'ha comprato questo brevetto avrà un quartiere dove nessun grido arriva '
                'alla strada. Nessuno compra una cosa così per abitarci. La compra per '
                'USARLA.»',
}

# Carte Oggetto nascoste nelle tessere (retro delle pagine tessera).
OGGETTI_TESSERA_7 = {'T3P': ['La Fune di Servizio']}


def luoghi():
    """Luoghi.pdf Episodio 7 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'dusty municipal archive.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 7 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_7, 'Episodio 7')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_7.get(n, []))

    for L in LUOGHI_7:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI7_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI7_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_7)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_7
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL CAPOCANTIERE', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 7')
    print('OK episodio 7')
