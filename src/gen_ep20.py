# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 20: Il Quarto Movimento (Episodio 20/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-20.md e CAMPAGNA-EPISODI.md). IL FINALE:
la discesa sotto la Cattedrale, il coro a pagamento, M. umano, e il Dormiente
che ascolta. Non si vince con l'acciaio: col CONTROCANTO (la deduzione con TUTTI
i Frammenti — nove erano il canto del sonno che M. voleva, undici lo smascheravano).
La camera è il boss (fasi ambientali legate al Canto). Fuori scala: gli eroi
cadono a terra e quaggiù rialzarli può non essere possibile (sul ramo «entrare
da soli» Rianimare non c'è). NIENTE Bivio: è la fine. Finale aperto per una
prossima campagna (un nuovo C.B.).

Varietà strutturale (regola 2026-07-18): fuori scala — la camera come boss, si
vince cantando; multi-fase (discesa / coro che si rompe / camera). Torsione
d'indagine: «il controcanto» (la deduzione di tutti i 20 Frammenti).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 20.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 20', 'pdf')
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

LETTERA_20 = (
    "Alla Società del Lume — l’ultima notte.<br/><br/>"
    "«Le <b>maree di sizigia</b> sono tornate, e con esse il Quarto Movimento. Non c’è tempo per "
    "indagare: c’è una notte sola, e tre cose da sapere prima di scendere. <b>Quando</b> "
    "esattamente — l’ora del picco. <b>Dove</b> passa la via delle tre acque. E <b>chi</b> è "
    "l’ultima voce che M. cerca, da salvare prima di lui.<br/><br/>"
    "Poi scendete, coi <b>Frammenti</b> di venti serate stretti in pugno: <b>nove</b> sono righe "
    "del canto del sonno, gli altri <b>undici</b> erano la firma di M., e adesso lo capirete. "
    "Non abbassate la lama là sotto. <b>Alzate la voce.</b> "
    "Cantate giusto, e riportatelo a dormire. È tutto qui.<br/>"
    "— il decano (o Vidal, o chi vi resta)»<br/><br/>"
    "<i>Aperti dall’inizio: la Cattedrale, gli ossari (Cimitero delle Barche), la Taverna della "
    "Chiatta, l’Archivio del 1741. Portate con voi la Mappa Acustica e il Fascicolo del 1741 "
    "dall’Ep. 19, e TUTTI i Frammenti conservati e non incrinati: sono il controcanto.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «le maree di sizigia» (L1+L2), «la via delle tre acque» (L1+L3),
# «la voce che crede» (L2+L3), «il controcanto» (L3+L4). Riv. (D2) su L1,L3,L4.
LUOGHI_20 = [
    dict(n=1, nome='LA CATTEDRALE (LA SOGLIA)', voce_mappa='La Cattedrale',
         req='Disponibile dall’inizio', art='La Cattedrale.png',
         chiude=None,
         indizi=[
             'La Cattedrale, la bocca della discesa: oltre la cripta dove fermaste Ferri, la pietra '
             'dà sull’acqua. Le maree di sizigia salgono; quando toccheranno il picco, la gola della '
             'città si aprirà. «La via delle tre acque comincia qui, sotto l’altare.»',
             'Il vecchio sagrestano, tremante: «ci risiamo, come nel Terzo Movimento. Ma stavolta è '
             'l’ultimo rigo, il quarto. Se M. trova la voce che crede, il Dormiente si sveglia in '
             'estasi. Se voi cantate prima il controcanto, si riaddormenta senza sogni.»',
             'Sull’altare, un segno del Coro fresco: M. è già sceso, o sta per farlo. Non c’è '
             'margine: stanotte si chiude, in un modo o nell’altro.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La bocca della discesa',
                  testo='La Cattedrale è la soglia dell’ultima notte. Sotto, oltre il punto dove '
                        'fermaste Ferri nel Terzo Movimento, la gola della città aspetta il picco '
                        'delle maree di sizigia per aprirsi. Non è un luogo da indagare: è una porta '
                        'da attraversare, coi Frammenti in pugno. Perché là sotto non servono lame '
                        'né deduzioni su chi o come — serve sapere una cosa sola: come si canta un '
                        'dio a dormire senza sogni. E quella cosa è scritta, riga per riga, in ciò '
                        'che avete raccolto in venti serate senza saperlo.'),
         ]),
    dict(n=2, nome='GLI OSSARI E LE MAREE', voce_mappa='Il Cimitero delle Barche',
         req='Disponibile dall’inizio', art='Cimitero delle Barche.png',
         chiude=None,
         indizi=[
             'Tra le barche morte, i vecchi che leggono le maree di sizigia: «il picco è stanotte, '
             'all’ora che l’acqua salata risale nei pozzi dolci. È allora che la gola si apre, e '
             'allora che dovete essere già giù, o non scenderete più.»',
             'Gli ossari ricordano il Coro dall’inizio: «la voce che crede, quella che il Coro '
             'insegue dal principio, è ancora là — o ciò che ne resta, dipende da come avete chiuso '
             'i loro casi. M. la cerca stanotte. Arrivateci prima.»',
             'Un vecchio barcaiolo vi dà l’ora esatta del picco: «Un minuto prima o dopo, e o '
             'vi annega la marea, o vi trova M. già cantando.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='L’ora del picco',
                  testo='I vecchi delle maree conoscono l’ora esatta in cui la sizigia apre la gola '
                        'della città: il momento in cui il salato risale nel dolce, e la pietra sotto '
                        'la Cattedrale si fa porta. È una finestra sola, breve. Scendere prima è '
                        'impossibile (la gola è chiusa); scendere dopo è tardi (M. avrà cantato). '
                        'Sapere l’ora è la prima riga di questa notte: tutto il resto — la via, la '
                        'voce, il controcanto — si gioca dentro quella finestra d’acqua.'),
         ]),
    dict(n=3, nome='LA TAVERNA DELLA CHIATTA', voce_mappa='La Taverna della Chiatta',
         req='Disponibile dall’inizio', art='La Taverna della Chiatta.png',
         chiude=None,
         indizi=[
             'Il rifugio, l’ultima volta: la Società (e Vidal, se l’avete convinto) vi prepara alla '
             'discesa. Sul tavolo, la mappa acustica e il Fascicolo del 1741. «La via delle tre '
             'acque è segnata: quali suoni portare, quali spegnere. Senza, la gola vi confonde.»',
             'Si conta il controcanto: quanti Frammenti avete conservato in venti serate. «Nove sono '
             'righe del canto del sonno, gli altri undici erano la firma di M. Cantate i nove, '
             'ricordate gli undici. Più ne avete, più il controcanto è completo.»',
             'Chi vi resta vi guarda in faccia, l’ultima volta prima dell’acqua: «qualunque cosa '
             'accada là sotto, avete già vinto una cosa — non siete diventati come lui. Adesso '
             'andate a cantare.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Chi vi resta',
                  testo='Alla Taverna della Chiatta, l’ultima notte, si tira la somma di tutto: la '
                        'mappa acustica (la via delle tre acque), il Fascicolo del 1741 (il '
                        'controcanto), e i Frammenti conservati e non incrinati (le righe da cantare). Chi vi resta — '
                        'il decano, Fossa, Ranuzzi, Vidal se convinto, i PNG del conto — non scende '
                        'con voi, ma vi arma di tutto ciò che venti serate hanno messo da parte. È il '
                        'pay-off finale: la campagna intera, ridotta a un canto e a una manciata di '
                        'amici. Portateli con voi, almeno nel cuore. Poi scendete.'),
         ]),
    dict(n=4, nome='L’ARCHIVIO DEL 1741', voce_mappa='L’Archivio delle Penne',
         req='Disponibile dall’inizio', art='L’Archivio delle Penne.png',
         chiude=None,
         indizi=[
             'Il Fascicolo del 1741 aperto sulla riga finale del controcanto, e il calendario '
             'dei Padri che fissa l’ora delle sizigie.',
             'Messi in fila, i venti Frammenti si dividono in due parti disuguali: nove sono il '
             'controcanto (M. li voleva per il Quarto Movimento, e ve li ha fatti cercare); gli '
             'altri undici smascheravano lui, e non l’ha mai saputo. «Cantate i nove. Gli undici '
             've li siete già cantati, smascherandolo.»',
             'La riga finale del controcanto — il Frammento 20 — si compone solo con tutti '
             'gli altri diciannove davanti. È la chiave del sonno senza sogni.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le due metà dei Frammenti',
                  testo='La deduzione finale non è un nome né un come: è un canto. Messi in fila '
                        'tutti e venti, i Frammenti si dividono in due — ma non a metà. La '
                        'prima è di nove: sono le righe del controcanto che riporta il Dormiente al '
                        'sonno senza sogni, e M. le voleva per il Quarto Movimento — vi ha usati per '
                        'raccoglierle. La seconda è di undici: erano la sua firma, la traccia che lo '
                        'smascherava, e non ha mai saputo che raccoglievate anche quelle. Non '
                        'fidatevi dell’orecchio per separarle. La città e l’uomo qui si somigliano '
                        'troppo: più d’una riga parla di lui con la voce del bronzo, e più d’una '
                        'parla della città per dire di lui. Il Fascicolo non le descrive: le conta. '
                        'I nove sono i Frammenti <b>1, 2, 3, 4, 5, 6, 7</b> e <b>11</b> — e '
                        'l’ultimo, il <b>20</b>, che si compone solo '
                        'davanti agli altri diciannove. Tutti gli altri sono firma. Il lembo di '
                        'carta con la mezza onda, il primo che vi fu messo in mano, non è riga di '
                        'canto né firma: è il vostro giuramento, e resta fuori dal conto. Ora la '
                        'partita è semplice e terribile: cantate i nove '
                        'più in fretta di quanto lui canti il suo rito. Chi ha conservato più '
                        'Frammenti canta più giusto. Contateli, e scendete.'),
         ]),
    dict(n=5, nome='I VECCHI DEL CORO', voce_mappa='L’Ossario Comunale',
         req='I vecchi del Coro si aprono a chi cerca l’ultima voce: la signora Vetri, la prima '
             'donna del Comunale, la voce che crede.',
         chiave=('parola', 'LA VOCE CHE CREDE'), art='Ossario Comunale.png',
         chiude=None,
         indizi=[
             'Chi ricorda il Coro dall’inverno degli ammutoliti del Borgo sa chi è l’ultima voce: '
             'la <b>signora Vetri</b>, la prima donna del Comunale. La misurarono quell’inverno e '
             'la mancarono — la voce non gliel’hanno mai presa, solo il ricordo di quella notte — '
             'e la inseguono da allora. «È viva, o quel che ne resta, secondo come avete chiuso '
             'i casi del Coro. Se la salvate, M. resta con un coro senza anima: un rumore.»',
             'La Vetri non crede per devozione: crede perché è l’unica persona viva che ha sentito '
             'la conchiglia del teatro risponderle. È questo a farne la voce che M. non può '
             'comprare — e la Vetri è tenuta da lui o dai suoi, in attesa del Quarto Movimento. '
             'Raggiungerla nella discesa (fase del coro) la sottrae a M.',
             'Un vecchio: «M. crede che una voce si possa costringere a credere. Non è vero. Per '
             'questo tiene la Vetri con la paura e non con la fede — e per questo va salvata, non '
             'solo trovata.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La voce che non si compra',
                  testo='Il più vecchio del Coro tiene la lanterna bassa e ve lo dice lui, il nome: '
                        'la signora Vetri, la prima donna del '
                        'Comunale, la solista che il Coro insegue dall’inverno degli ammutoliti e '
                        'non ha mai preso — la mancarono quell’inverno, e di nuovo alla gala. «È l’ultima cosa che il denaro di quell’uomo non ha potuto '
                        'comprare, e la sua sola speranza per il Quarto Movimento: un cuore che '
                        'canti il quarto rigo con l’anima e desti il Dormiente in un’estasi che lui '
                        'crede di poter cavalcare. Non crede per devozione: crede perché è l’unica '
                        'persona viva che ha sentito la conchiglia del teatro risponderle — e una '
                        'voce che ha avuto risposta non si compra. Ma la fede non si costringe, e '
                        'lui lo sa: la tiene con la paura.» Poi il vecchio conta sulle dita, e sono '
                        'due sere vostre a decidere in che stato ve la ritroverete. Se apriste le '
                        'canne-voce e rendeste il maltolto agli ammutoliti, tornò a lei anche la '
                        'memoria di chi l’aveva misurata: arriva <b>intera</b>, e sa contro chi '
                        'canta. Se le canne le teneste sigillate ma la conchiglia la conservaste '
                        'sotto sigillo, arriva <b>a metà</b>: canta, e da qualche parte, nei legni '
                        'che sono vostri e non suoi, un pannello canta con lei. Se le canne '
                        'restarono chiuse e la conchiglia la spezzaste, arriva <b>muta di quel '
                        'ricordo</b> — non sa più di essere stata ascoltata una volta, e crede lo '
                        'stesso. «Salvatela nella discesa», chiude il vecchio, «e a lui resterà un '
                        'coro comprato che canta con la bocca e non con l’anima: un rumore, non un '
                        'risveglio.» È metà della '
                        'vittoria: l’altra metà è il vostro controcanto.'),
         ]),
    dict(n=6, nome='L’ORGANO DI OSSA', voce_mappa='La Chiesa dei Battuti',
         req='La chiesa dei Battuti apre a chi cerca la voce che crede: ciò che resta dell’organo '
             'di ossa e delle sue canne-voce.',
         chiave=('parola', 'LA VOCE CHE CREDE'), art='Chiesa dei Battuti.png',
         chiude=None,
         indizi=[
             'Ciò che resta dell’organo di ossa della cripta dei Battuti: le canne-voce, la '
             'melodia della conchiglia, il campanello di Piero — dipende dai vostri Bivi. È lo strumento '
             'con cui il Coro chiamava la voce, e con cui voi la riconoscerete.',
             'La melodia dell’organo di ossa incrocia il controcanto: alcune canne-voce '
             'cantano il risveglio, altre il sonno. Sapere quali è metà della battaglia '
             'acustica.',
             'Un ultimo Battuto sopravvissuto: «l’organo di ossa non è male in sé. È uno strumento. '
             'Dipende chi lo suona, e cosa gli fa cantare. M. gli fa cantare il risveglio. Voi '
             'fategli cantare il sonno.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Lo strumento e la mano',
                  testo='L’organo di ossa della cripta dei Battuti torna, un’ultima volta, come '
                        'chiave della voce che crede: le sue canne cantano il risveglio o il sonno secondo chi le '
                        'suona. Non è il male: è uno strumento, come la città intera è uno strumento. '
                        'M. gli fa cantare il Quarto Movimento; voi, con la mappa acustica e il '
                        'controcanto, potete fargli cantare il contrario. È il tema di tutta la '
                        'campagna, ridotto all’osso: gli stessi strumenti, le stesse mani, due '
                        'canzoni opposte. Scegliete quale far suonare.'),
         ]),
    dict(n=7, nome='LA CAMERA DEL CORO', voce_mappa='La Loggia dei Confratelli',
         req='La camera del Coro apre a chi crede di aver trovato la scorciatoia: la chiave che '
             'pare aprire la camera del Dormiente, il controcanto facile.',
         chiave=('parola', 'IL CONTROCANTO'), art='La Loggia dei Confratelli.png',
         chiude=None,
         indizi=[
             'La camera dove il Coro provava il Quarto Movimento: sul leggìo, una chiave che '
             'pare aprire la camera del Dormiente.',
             'Chi crede che la scorciatoia esista si inganna: non c’è un modo facile di cantare un '
             'dio a dormire. C’è solo il controcanto, riga per riga, coi Frammenti veri.',
             'La Chiave del Coro è la tentazione finale di M.: sembra darvi il controllo della '
             'camera, e invece vi mette a cantare il suo rito. La partitura del risveglio travestita '
             'da scorciatoia.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La scorciatoia che uccide',
                  testo='La Chiave del Coro è l’ultima esca di M.: pare la via facile alla camera, e '
                        'invece è la sua trappola più elegante. Non esiste una scorciatoia per '
                        'cantare un dio a dormire; esiste solo il controcanto lungo, difficile, '
                        'stonato e umano, riga per riga. Chi cerca la via facile canta, senza '
                        'saperlo, il rito del risveglio. È il tema di M. fino all’ultimo: offrire una '
                        'soluzione perfetta che è la sua vittoria travestita. L’avete imparato con '
                        'Braga. Non cascateci ora, a un passo dalla fine.'),
         ]),
    dict(n=8, nome='IL GRIMORIO DEL RITO', voce_mappa='Lo Scriptorium',
         req='Lo scriptorium apre a chi cerca lo spartito: il grimorio del Quarto Movimento, il '
             'controcanto scritto — o il suo contrario.',
         chiave=('parola', 'IL CONTROCANTO'), art='Lo Scriptorium.png',
         chiude=None,
         indizi=[
             'Lo scriptorium custodisce il grimorio del Quarto Movimento: lo spartito del '
             'rito.',
             'Il grimorio è affascinante e mortale: sembra darvi il canto completo, e invece è il '
             'canto di M. Il controcanto vero non è scritto in un libro solo: è nei vostri Frammenti, '
             'sparso in venti serate.',
             'Un copista terrorizzato: «quel grimorio l’ha voluto M. Chi lo canta, canta per lui. Il '
             'vostro canto non è là dentro: è nelle cose che avete conservato senza capire perché.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il libro che canta per lui',
                  testo='Collazionato foglio per foglio con la copia rimasta sul leggio, il Grimorio '
                        'del Rito si lascia leggere per quello che è: un libro solo, '
                        'completo, che pare contenere tutto il canto — e invece contiene il canto '
                        'sbagliato. Le note del quarto rigo salgono dove dovrebbero calare: la '
                        'legatura, la carta e la mano sono di pregio, ma la partitura è quella del '
                        'risveglio che M. vuole, rilegata come si rilega una preghiera. Il '
                        'controcanto vero non '
                        'sta in un grimorio: sta sparso nei venti Frammenti che avete raccolto una '
                        'serata alla volta, senza sapere che stavate imparando a spegnere un dio. La '
                        'differenza tra il grimorio e i Frammenti è la differenza tra M. e voi: lui '
                        'cerca il canto in un libro di potere; voi lo avete costruito coi pezzi di '
                        'una città che avete imparato ad amare.'),
         ]),
    dict(n=9, nome='LA GOLA DELLA CITTÀ', voce_mappa='La Gola della Città',
         req='La gola della città si apre solo al picco delle maree, a chi conosce la via delle tre '
             'acque: è lì che finisce tutto.',
         chiave=('parola', 'LA VIA DELLE TRE ACQUE'), art='La Gola della Città.png',
         chiude=None,
         indizi=[
             'La gola della città, oltre il punto dove fermaste Ferri: la pietra dà '
             'sull’acqua, l’acqua dà sul buio, e nel buio qualcosa di grande respira piano.',
             'Non è un mostro da colpire: è un dio che sogna. M. e il suo coro comprato sono '
             'già qui, e cantano il quarto rigo.',
             'Il Dormiente ascolta. Ogni rigo giusto lo culla; ogni rigo sbagliato lo desta. Non '
             'abbassate la lama. Alzate la voce. È l’ultima cosa che vi resta da fare, e la più '
             'difficile: cantare più giusto di un uomo che si crede l’Italia intera.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il dio che sogna',
                  testo='Nella gola della città, oltre ogni mappa, il Dormiente respira nel buio, e '
                        'non è un mostro: è un dio che sogna, e i suoi sogni sono la storia segreta '
                        'di Roccamora. M. vuole svegliarlo per cavalcarne l’estasi e rifare l’Italia; '
                        'voi volete rimetterlo a dormire senza sogni, col controcanto dei Padri e i '
                        'Frammenti di venti serate. Non c’è un boss da abbattere: c’è un canto da '
                        'finire prima che il dio apra l’occhio del tutto. I dadi contano; la '
                        'deduzione — quali righe, quanti Frammenti — di più. E quando l’ultima riga '
                        'salirà, roca e umana, e il dio richiuderà l’occhio, avrete fatto la cosa più '
                        'gentile e più difficile: non ucciso, ma cantato a dormire.'),
         ]),
]

# Tessere della discesa (percorso lineare a 6, multi-fase). Obiettivo =
# completare il CONTROCANTO (T6, camera) prima del RISVEGLIO (soglia-Canto). Non
# c'e' un boss da abbattere: la camera e' il boss. M. umano; il coro si rompe.
TILES_20 = [
    dict(id='T1', nome='LA DISCESA (LA CRIPTA)', exits={'N': 'T2'}, start='S',
         testo='Oltre la cripta dove fermaste Ferri, la scala scende nell’acqua che sale. QUANDO '
               'RIVELATE QUESTA TESSERA: applicate l’esito delle Domande 3 e 4. Con la Mappa '
               'Acustica la via delle tre acque è chiara; senza, il buio confonde (round perso).',
         arbitro='FASE 1 — LA DISCESA. Pericolo d’ambiente: l’acqua sale. Con la Mappa Acustica '
                 'niente round persi. Da qui il Canto è il RISVEGLIO del Dormiente: ogni crescendo '
                 'lo avvicina alla veglia.',
         hook='La Mappa Acustica (dall’Ep. 19): la via delle tre acque è segnata — niente round '
              'persi nel buio della gola.',
         cerca_vuoto='Acqua nera che sale gradino dopo gradino, e in basso un respiro '
                     'lento che non è il vostro. Sulla pietra bagnata non regge niente: '
                     'quel che si posa, scivola via.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LE TRE ACQUE', exits={'S': 'T1', 'N': 'T3'},
         testo='Il punto dove tre correnti si incontrano nel buio: dolce, salata, morta. QUANDO '
               'RIVELATE QUESTA TESSERA: pericolo d’ambiente — la corrente fredda, l’eco che mente. '
               'La Mappa Acustica dice quale acqua seguire.',
         arbitro='Pericolo d’ambiente (le tre acque): la corrente fredda che trascina — prova '
                 'VIGORE (Media) o 1 round perso / 1 danno. '
                 'La Mappa Acustica annulla la confusione. La città può suonare a favore (evento).',
         cerca_vuoto='Tre correnti che si torcono senza mescolarsi, e l’eco che vi '
                     'rimanda passi da dove non li avete fatti. Qui non galleggia '
                     'niente e non resta niente.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA PIETRA VIVA', exits={'S': 'T2', 'N': 'T4'},
         testo='Il cuore della gola: la pietra stessa sembra viva, pulsa piano al respiro del dio. '
               'QUANDO RIVELATE QUESTA TESSERA: il canto del Dormiente comincia a filtrare — prove '
               'NERVI per non farsi confondere.',
         arbitro='Ultimo diaframma della discesa. Il canto del dio (fase ambientale iniziale): '
                 'prova NERVI o 1 azione persa. Oltre, la camera e il coro. Preparate il controcanto.',
         cerca='Un frammento di eco pulito (utile: nella camera, la prima riga del controcanto '
               'si canta senza disturbo).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL CORO A PAGAMENTO', exits={'S': 'T3', 'N': 'T5'},
         testo='Gli impiegati del coro sbarrano l’antecamera, cantando lo spartito senza crederci. '
               'QUANDO RIVELATE QUESTA TESSERA: il coro canta CONTRO il vostro controcanto; ma sono '
               'comprati, non fedeli — si rompono.',
         arbitro='FASE 2 — IL CORO. Ogni impiegato (Sgherro) in campo rallenta il controcanto di 1 '
                 'riga/round. MA si ROMPE: ridotto a metà Ferite fugge (la crepa del Frammento 19). '
                 'Spezzare il coro libera il controcanto.',
         hook='La Candidata Salvata (la signora Vetri, dai Vecchi del Coro): qui la sottraete a M. '
              '— il suo coro resta '
              'senza la voce che crede, un rumore, e il risveglio rallenta.',
         cerca_vuoto='Leggii da orchestra, spartiti fermati con le mollette, borracce '
                     'd’acqua per la gola. Attrezzatura da lavoro, e nient’altro.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LA SOGLIA DELLA CAMERA', exits={'S': 'T4', 'N': 'T6'},
         testo='La soglia della camera del Dormiente: qui il coro fa l’ultima resistenza, e la '
               'signora Vetri è vicina. QUANDO RIVELATE QUESTA TESSERA: se non l’avete già salvata, è '
               'ora — oltre questa soglia, M. la costringerà a cantare.',
         arbitro='Ultimo muro del coro. Se la Candidata non è salvata, M. la costringe (il '
                 'risveglio accelera). Salvatela qui, o subite la sua voce nella camera. Oltre, '
                 'la fase finale.',
         cerca_vuoto='Sulla soglia la pietra è liscia come se fosse stata calpestata '
                     'per secoli. Nessuna nicchia, nessun arredo: da qui in avanti la '
                     'roccia è nuda.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA CAMERA DEL DORMIENTE', exits={'S': 'T5'},
         testo='La camera, oltre ogni mappa: il Dormiente respira nel buio, M. canta il quarto rigo, '
               'e voi opponete il controcanto. QUANDO RIVELATE QUESTA TESSERA: comincia la FASE '
               'FINALE — completate il controcanto prima che il Dormiente si svegli.',
         arbitro='FASE 3 — LA CAMERA (il boss). Non si colpisce: si CANTA. Ogni round completate '
                 'righe di controcanto (ritmo = Frammenti + Mappa; il coro residuo rallenta, ma una '
                 'riga la cantate sempre). Le fasi ambientali della camera fanno danno inevitabile a '
                 'soglie di Canto. Il rito accelera il risveglio (+1 Canto/round) finché ha una '
                 'voce: M. in piedi con la sua, OPPURE un impiegato del coro che canta al posto suo. '
                 'Abbattere l’uomo non basta: va spezzato il coro. Controcanto completo PRIMA del '
                 'risveglio = VITTORIA. Risveglio prima = SCONFITTA (vedi Soluzione). FUORI SCALA: '
                 'gli eroi cadono, e quaggiù rialzarli può non essere possibile.',
         cerca_vuoto='Non c’è niente da raccogliere qui: solo pietra, acqua e buio, e '
                     'un’aria così densa da pesare sul petto. Quel che conta, in questa '
                     'camera, non si prende con le mani.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_20 = [
    dict(nome='LA CAMERA DEL DORMIENTE', att=0, dif=99, fer=99, mov=0, dan=2, boss=True,
         tipo='Il Boss Finale (non si colpisce: si canta)', art='La Camera del Dormiente.png',
         note='NON si colpisce e NON ha attacchi classici: è la camera stessa, con FASI AMBIENTALI '
              'legate al Canto (la pietra trema, l’acqua sale, il canto del dio confonde — danno '
              'inevitabile e prove NERVI a tutti, a soglie crescenti). La si «vince» completando il '
              'CONTROCANTO prima del risveglio (Canto alla SOGLIA_RISVEGLIO). Fuori scala: le fasi '
              'ambientali possono far cadere eroi.',
         bio_bestiario='La Camera del Dormiente non è un nemico: è il boss finale che nessuna lama '
              'può toccare. È la gola della città, oltre ogni mappa, dove un dio sogna nel buio e i '
              'suoi sogni sono la storia segreta di Roccamora. Non attacca per malizia: reagisce. '
              'Ogni rigo giusto del vostro controcanto lo culla verso il sonno senza sogni; ogni '
              'rigo sbagliato, ogni nota del rito di M., lo desta un poco di più — e a ogni soglia '
              'del suo risveglio la camera stessa si scatena: la pietra trema, l’acqua sale, il '
              'canto del dio riempie i crani e confonde. Non ha Ferite da togliere: ha un occhio '
              'che, se si apre del tutto (il Canto alla soglia del risveglio), cambia la città per '
              'sempre. La si sconfigge in un modo solo — completando il controcanto del Fascicolo '
              'del 1741, riga per riga, coi Frammenti di venti serate, più in fretta di quanto M. '
              'canti il suo. È il finale: fuori scala, e chi cade quaggiù può non rialzarsi prima '
              'dell’ultima riga. Ma la posta non è sopravvivere. È cantare giusto.'),
    dict(nome='M. (SENZA MASCHERA)', att=2, dif=8, fer=5, mov=4, dan=1, boss=False,
         tipo='C.B. — l’uomo, l’ultima maschera che cade', art='Il Presidente M.png',
         note='Umano e fragile (Att 2, Fer 5, Danno 1), feroce. NON è l’obiettivo (la vittoria è il '
              'controcanto): finché è in piedi e ha la sua voce, forza il Quarto Movimento (+1 '
              'Canto/round). Ma la voce che gli serve non è la sua: è quella della Candidata, il '
              'cuore che crede. Finché lei è nelle sue mani il rito canta, che lui sia in piedi '
              'o a terra; salvarla lo zittisce. Abbatterlo non serve — è l’unica cosa che non '
              'serve. Il coro comprato non canta il rito: rallenta il vostro controcanto, e '
              'quello sì. Quando il controcanto giusto sale, capisce di aver perso — e per la prima '
              'volta ha paura.',
         bio_bestiario='M. — il presidente, C.B., il Machiavelli — qui, per la prima e ultima '
              'volta, senza maschere: un uomo solo nell’acqua bassa della gola, che canta il quarto '
              'rigo con la disperazione di chi ha giocato tutto. Fragile (Att 2, Fer 5, Danno 1), '
              'non è più il ragno invisibile di diciotto mesi: è un vecchio che si crede l’Italia '
              'intera e sta per scoprire di essere solo un uomo. Non è l’obiettivo dello scontro — '
              'la vittoria non è ucciderlo, è cantare più giusto di lui — ma finché è in piedi e ha '
              'la voce che crede, spinge il Dormiente verso l’estasi del risveglio. Neutralizzarlo, '
              'o avergli sottratto la sua voce, gli toglie il rito dalle mani — ma non lo spegne: '
              'gli impiegati continuano a leggere lo spartito anche sopra un uomo caduto, ed è il '
              'coro che va spezzato, non l’uomo. E quando il vostro '
              'controcanto roco e umano prevale, l’ultima maschera cade davvero: non l’estasi che '
              'sognava, ma il silenzio; non la storia che voleva rifare, ma un dio che si '
              'riaddormenta ignorandolo. Per la prima volta in vita sua, M. ha paura. È la sua vera '
              'sconfitta — e, forse, l’unica pietà che gli concedete.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 20 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 20')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il quarto movimento — il finale')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_20.replace(
        'Alla Società del Lume — l’ultima notte.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume — l’ultima notte.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 24*mm, 'PRIMA DI TUTTO: aprite le buste dei Bivi degli Episodi 19, 18 e 11 e applicate i vostri rami.')
    c.drawCentredString(W/2, 18*mm, 'Indagine breve e feroce: l’ORA, la VIA, la VOCE, il CONTROCANTO. Poi la discesa.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Cattedrale, gli ossari, la Taverna della Chiatta, l’Archivio del 1741.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 20 (il finale)')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'IL CONTROCANTO: contate i Frammenti conservati e non incrinati (1-19), più 1 se avete la Miglioria «Voce che regge».')
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

    yy = sect(H - 52*mm, 'i frammenti conservati e non incrinati (1-19) — il controcanto', 4)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — breve e feroce, poi si scende')
    doms = ['1. QUANDO? (l’ora del picco delle maree — serve più di una conferma)',
            '2. DOVE? (la via delle tre acque)',
            '3. CHI è l’ultima voce? (serve più di una conferma)',
            '4. COME si fa dormire il Dormiente senza sogni? (il controcanto)']
    for i, d in enumerate(doms):
        yd = yy - 10*mm - i*15*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 7*mm, W - 16*mm, yd - 7*mm)
    # I due conti che l'arbitro teneva a mente: gli Ep. 18-20 erano gli
    # unici a non stamparli, e la loro Soluzione ne chiede il conto.
    contatori_indagine(c, W)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 20 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 20 — la discesa')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la gola della città, e un dio da cantare a dormire')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 124*mm, W - 56*mm, 72*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 7 insidie, 3 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '20/cards/</b>). Le 6 tessere della discesa sono in <b>Episodio 20/board/</b>. È '
                  'il FINALE, in tre fasi: la <b>discesa</b> (T1-T3, la gola della città), il '
                  '<b>coro a pagamento</b> (T4-T5, impiegati che si ROMPONO a metà Ferite), e la '
                  '<b>camera</b> (T6). Non c’è un boss da abbattere: la <b>camera è il boss</b>, con '
                  'fasi ambientali legate al Canto (il RISVEGLIO del Dormiente). Si vince '
                  'completando il <b>CONTROCANTO</b> (righe dai Frammenti) prima del risveglio. '
                  '<b>FUORI SCALA: quaggiù un eroe che cade può restare a terra fino all’ultima '
                  'riga.</b> NIENTE Bivio: è la fine.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 134*mm, W - 60*mm, 96*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole del finale:</b>', BODY),
        Paragraph('• <b>IL RISVEGLIO (il Canto).</b> Qui il Canto è il risveglio del Dormiente: ogni '
                  'round e ogni crescendo lo avvicinano alla veglia. Alla <b>soglia-risveglio</b> '
                  '(indicata dalla Soluzione), il dio si desta: <b>SCONFITTA</b> (la campagna si '
                  'chiude in tragedia — vedi epilogo). Le fasi ambientali della camera fanno danno '
                  'inevitabile a soglie crescenti di Canto.', BODY),
        Paragraph('• <b>IL CONTROCANTO (la vittoria).</b> Una traccia da completare (righe indicate '
                  'dalla Soluzione). Nella camera (T6), ogni round «cantate» righe: il ritmo dipende '
                  'dai <b>Frammenti del Controcanto</b> conservati (più ne avete, più righe/round) e '
                  'dalla <b>Mappa Acustica</b>. Il <b>coro</b> rallenta (−1 riga/round per impiegato '
                  'in campo); spezzarlo (a metà Ferite fugge) libera il canto. <b>Comunque vada, '
                  'una riga per round la cantate sempre:</b> il ritmo non scende sotto 1. '
                  'Controcanto completo PRIMA del risveglio = <b>VITTORIA</b>.', BODY),
        Paragraph('• <b>M. E LA CANDIDATA (la signora Vetri).</b> M. (umano, Att 2/Fer 5/Danno 1) '
                  'non è l’obiettivo. Il rito accelera il risveglio (+1 Canto/round) finché <b>ha una '
                  'voce che creda</b>, e quella voce è <b>la Candidata</b>: finché è nelle sue mani '
                  'il rito canta, che M. sia in piedi o a terra. <b>Salvarla</b> (fase del coro, '
                  'T4-T5) lo zittisce. <b>Abbattere M. non serve</b>: è l’unica cosa che non serve, '
                  'ed è quella che vi verrà voglia di fare. Il coro comprato non canta il rito: '
                  '<b>rallenta il vostro controcanto</b> (−1 riga per impiegato in campo), ed è per '
                  'quello che va spezzato. <b>Esche:</b> la Chiave del Coro '
                  'e il Grimorio del Rito cantano il risveglio — aiutano M.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_20:
        art_file = TILE_ART_20[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_20[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_20.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 90*mm, W - 40*mm, 62*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 20</b>. In campo: il <b>coro a '
                  'pagamento</b> (Sgherri che si ROMPONO a metà Ferite), <b>M.</b> (umano, fragile: '
                  'Att 2, Fer 5, Danno 1 — non è l’obiettivo, ma accelera il risveglio) e <b>la '
                  'Camera del Dormiente</b> (il boss finale: NON si colpisce, fasi ambientali legate '
                  'al Canto). Vittoria: completare il controcanto prima del risveglio. Non c’è una '
                  'regola delle taglie sul boss: la camera non ha Ferite. FUORI SCALA: gli eroi '
                  'cadono e rialzarli può non essere possibile, e la notte può finire male (il '
                  'risveglio).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_20())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_20():
    """Miniature dell'Episodio 20. I segnalini Canto sono qui il RISVEGLIO del
    Dormiente (il dio che si desta verso la soglia)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('IL CORO A PAGAMENTO (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('LA CAMERA · M.', [('La Camera del Dormiente.png', 1),
                            ('Il Presidente M.png', 1)]),
        ('IL RISVEGLIO (CANTO)', [('Il Dormiente si muove.png', 1),
                                  ('Le maree al picco.png', 1),
                                  ('Il quarto rigo sale.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 20 - Soluzione (non aprire)')

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
        # stessa guardia di frame_flow: qui si disegna a mano e il testo che
        # sfora il piede di pagina uscirebbe dal foglio senza un errore.
        if y < 12*mm:
            import sys as _sys
            print('!! FRAME TROPPO PICCOLO in gen_ep20.py: la pagina Soluzione «%s» sfora il '
                  'piede di %.1fmm e il testo in fondo NON verra stampato' % (titolo, 12 - y/mm),
                  file=_sys.stderr)
        c.showPage()

    pagina('soluzione — non aprire (il finale)', [
        '<b>Stampate questo fascicolo senza leggerlo e sigillatelo in una busta.</b> Apritelo '
        'solo dopo aver risposto per iscritto alle 4 Domande.',

        '<b>APERTURA — l’Episodio 19: prima l’esito, poi il Bivio</b> (applicare PRIMA della '
        'lettera). <b>Il Bivio vale solo per chi ha CONVINTO l’Ispettore Vidal</b> (vittoria '
        'piena). La rete è sua: nessuno può sigillarla in una busta se lui non ve l’ha promessa.',
        '<b>Se avete convinto Vidal</b> e avete scelto <b>CONVINCERE L’ISPETTORE CON LE PROVE</b> — '
        'i gendarmi sigillano le uscite della '
        'cripta, e alle spalle avete una ritirata: vale la regola normale, <b>un eroe a terra può '
        'essere rianimato</b> da un compagno adiacente. Ma le prove sono passate per troppe mani e '
        'l’ora si è spostata: <b>il Canto (risveglio) sale ogni 5° round invece che ogni 6°</b> '
        '(5°, 10°, 15°…). Chi ha convinto Vidal e ha sigillato la busta senza decidere ha lasciato '
        'che l’Ispettore si muovesse da sé: questo ramo.',
        '<b>Se avete scelto ENTRARE DA SOLI, o se l’Ispettore l’avete solo fermato senza '
        'convincerlo</b> (vittoria parziale dell’Episodio 19) — nessuno sa dove siete, e la '
        'prima ondata vi cerca altrove: <b>nel primo giro del mazzo Minaccia pescate 1 carta in '
        'meno</b>. Ma non c’è nessuno fuori ad aspettarvi: <b>Rianimare non è disponibile</b> — un '
        'eroe che cade resta a terra fino alla fine. Chi non ha convinto Vidal scende da solo '
        'qualunque cosa dica la busta: <b>ignoratela</b>, e non leggete l’altro ramo.',

        '<b>CODA — il Bivio dell’Episodio 18</b> (retro del Frammento n. 18): se avete <b>RESO '
        'PUBBLICA LA PROVA SUBITO</b> — il vantaggio l’avete già incassato nell’Episodio 19 (la '
        'città schierata), e qui si paga: messo all’angolo, il Quarto Movimento è stato anticipato '
        'e il Dormiente è più vicino alla veglia. <b>Mescolate 1 carta crescendo in più nel mazzo '
        'Minaccia</b> — 5 crescendo invece di 4, 22 carte invece di 21. Se avete <b>TENUTO LA '
        'PROVA</b> — quel Bivio si è già chiuso nell’Episodio 19, in bene e in male: <b>qui non '
        'applicate nulla</b>.',

        '<b>CODA — il Bivio dell’Episodio 11</b> (retro del Frammento n. 11): quel Bivio nominava '
        'proprio questa notte. Se avete scelto <b>INFILTRARE LA SQUADRA</b> — il vostro uomo dentro '
        'vi ha fruttato due episodi di vantaggio, ma la mappatura della gola si è completata lo '
        'stesso, e il rituale non comincia da fermo: <b>+1 segnalino Canto di partenza</b>, che si '
        '<b>somma</b> a quello della Domanda 1 sbagliata — chi ha infiltrato la squadra <i>e</i> ha '
        'sbagliato l’ora scende con il <b>Canto già a 2</b>. Due è il massimo: non c’è una terza '
        'leva di partenza. Se '
        'avete scelto <b>PUBBLICARE LO SCANDALO</b> — quel prezzo l’avete pagato nell’Atto III: '
        '<b>qui non applicate nulla</b>.',

        '<b>Per chi arbitra: quanto pesano.</b> Un solo segnalino Canto di partenza è il colpo più '
        'duro dei tre — la corsa del Controcanto è lunga e il risveglio non aspetta; due segnalini '
        'sono la partita più dura che questo finale sappia dare, e restano giocabili. Non '
        'compensateli di vostra iniziativa: il contrappeso è già nel gioco, ed è il <b>ritmo del '
        'canto</b>. Un gruppo che canta 2 righe per round e uno che ne canta 4 non giocano la '
        'stessa partita: il secondo si riprende il segnalino perduto e avanza. Quel ritmo lo '
        'decidono i <b>Frammenti conservati e non incrinati</b> (1 riga + 1 ogni 6; la Miglioria '
        '«Voce che regge» vale un Frammento in più) e la Mappa Acustica, cioè '
        'venti episodi di scelte, non questa notte. Un gruppo che arriva qui con un Bivio duro e '
        'pochi Frammenti deve perdere: è il conto della campagna che si chiude.',
        '<b>Il caso.</b> Le maree di sizigia sono tornate. Una notte sola: l’ora, la via delle tre '
        'acque, la voce che M. cerca, il controcanto. Poi la discesa nella gola della città.',
        '<b>La verità.</b> M. ha un coro comprato (canta senza fede); gli manca una voce che creda '
        'per il Quarto Movimento, e la cerca. Il Dormiente è inquieto: va rimesso a dormire col '
        'CONTROCANTO del Fascicolo del 1741, cantato coi Frammenti (nove erano il canto del sonno, '
        'gli altri undici smascheravano M.). La voce che gli manca è <b>la signora Vetri</b>, la '
        'prima donna del Comunale — la solista che inseguono dall’inverno degli ammutoliti e '
        'non hanno mai preso. Non si vince '
        'uccidendo: cantando giusto prima del risveglio.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. QUANDO?</b> All’ora del picco delle maree di sizigia (gli ossari L2 + il calendario '
        'dei Padri L4: serve più di una conferma). <i>Esatta:</i> scendete all’ora giusta — nel 1° '
        'round della discesa non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> arrivate '
        'scomposti — il Canto (risveglio) parte da 1.',
        '<b>2. DOVE?</b> La via delle tre acque, dalla Mappa Acustica (la Cattedrale L1 + la Taverna '
        'L3 + l’Archivio L4). <i>Esatta:</i> la Mappa guida la discesa (niente round persi nel buio; '
        'la città può suonare a favore). <i>Sbagliata:</i> la gola vi confonde (round persi).',
        '<b>3. CHI è l’ultima voce?</b> <b>La signora Vetri</b>, la prima donna del Teatro '
        'Comunale: la solista che il Coro insegue dall’Ep. 3 — la misurarono quell’inverno e la '
        'mancarono — e che ha mancato di nuovo alla gala dell’Ep. 4 (i vecchi '
        'del Coro L5 + l’organo di ossa L6: serve più di una conferma). Non crede per devozione: '
        'crede perché è l’unica persona viva che ha sentito la conchiglia del teatro risponderle — '
        'per questo M. non può comprarla, e la tiene con la paura. <b>In che stato arrivi</b> '
        'dipende da due Bivi, non dalla spedizione: le canne-voce (Ep. 3) e la conchiglia (Ep. 4). '
        '<b>Voci restituite</b> (Ep. 3) = <b>intera</b>, qualunque cosa faceste della conchiglia. '
        '<b>Canne sigillate + conchiglia sigillata e conservata</b> (Ep. 4) = <b>a metà</b>. '
        '<b>Canne sigillate + conchiglia distrutta</b> = <b>muta di quel ricordo</b>. Lo stato non '
        'cambia le regole della fase del coro: cambia il suo commiato nell’epilogo. '
        '<i>Esatta:</i> sapete chi cercare nella fase del coro — salvatela e togliete '
        'a M. la sua voce (il risveglio rallenta). <i>Sbagliata:</i> M. la costringe, il risveglio '
        'accelera. <i>Accettate come esatta:</i> «la Vetri», «la prima donna del Comunale», «la '
        'solista della gala», «la solista dell’inverno».',
        '<b>4. COME si fa dormire il Dormiente senza sogni?</b> Il CONTROCANTO del Fascicolo del '
        '1741, cantato coi Frammenti: <b>nove</b> sono il canto del sonno (Frammenti <b>1, 2, 3, '
        '4, 5, 6, 7, 11, 20</b>), gli altri <b>undici</b> erano la firma di M. (<b>8, 9, 10, 12, '
        '13, 14, 15, 16, 17, 18, 19</b>). Il <b>Frammento n. 0</b> del Preludio — il lembo con la '
        'mezza onda — non è né canto né firma: è il giuramento della Società, e non entra in '
        'nessuno dei due conti né nel ritmo. <b>Non offrite al tavolo una chiave per distinguerli '
        'a orecchio:</b> non ne esiste una che tenga (mezza dozzina di righe parlano di lui col '
        'bronzo, o della città per accusare lui). L’elenco qui sopra è la risposta, e il Referto '
        '«Le due metà dei Frammenti» (L4) lo stampa già per esteso. <i>La deduzione finale:</i> '
        'contate i Frammenti conservati e <b>non incrinati</b> (1-19) — tutti quelli che contano, non solo i nove: le righe della '
        'firma sono ciò che vi ha insegnato a riconoscere le altre. Più ne avete, più righe di '
        'controcanto cantate per '
        'round. Aiuti: la Mappa Acustica, la Candidata Salvata (la signora Vetri). <i>Esche:</i> la Chiave del Coro e '
        'il Grimorio del Rito (cantano il RISVEGLIO — aiutano M.).',
        '<b>IL CONTROCANTO E I FRAMMENTI:</b> servono <b>10 righe</b> di controcanto per vincere. Ogni '
        'round nella camera (T6) cantate <b>1 riga + 1 ogni 6 Frammenti conservati e non '
        'incrinati</b> (Mappa '
        'Acustica: +1; la Miglioria <b>«Voce che regge»</b>, se qualcuno l’ha spuntata, conta come '
        'un Frammento in più — una sola per gruppo). Ogni impiegato del coro in campo: −1 '
        'riga/round, <b>ma il ritmo non scende mai sotto 1: per quanti siano, una riga la cantate '
        'sempre.</b> Il Canto (risveglio) sale '
        'alla fine di <b>ogni 6° round</b> (6°, 12°, 18°…) — è una spedizione lunga, non ogni 4° — '
        'più ogni crescendo pescato; alla <b>soglia-risveglio = Canto 8</b> il Dormiente si desta.',
    ])
    pagina('spedizione — la discesa, in tre fasi', [
        '<b>Montaggio</b> (tessere in Episodio 20/board/, coperte tranne T1):<br/>'
        'T1 La Discesa → T2 Le Tre Acque → T3 La Pietra Viva (fase 1) → T4 Il Coro a Pagamento → T5 '
        'La Soglia della Camera (fase 2) → T6 La Camera del Dormiente (fase 3, il controcanto).',
        '<b>Fase 1 — la discesa (T1-T3).</b> Pericoli d’ambiente (l’acqua che sale, le tre acque, la '
        'pietra viva): la Mappa Acustica annulla la confusione. Il Canto (risveglio) comincia a '
        'salire coi crescendo.',
        '<b>Fase 2 — il coro (T4-T5).</b> Gli impiegati (Sgherri) sbarrano la camera e rallentano il '
        'controcanto (−1 riga/round ciascuno), ma si ROMPONO a metà Ferite (fuggono: la crepa del '
        'Frammento 19). Qui salvate la Candidata, la signora Vetri (se avete la D3): toglie a M. '
        'la voce che crede, il '
        'risveglio rallenta.',
        '<b>Fase 3 — la camera (T6, il boss).</b> Non si colpisce: si canta. Ogni round completate '
        'righe di controcanto (ritmo = Frammenti + Mappa − coro residuo, minimo 1). Le fasi '
        'ambientali della camera fanno danno inevitabile a soglie di Canto (Canto 4: 1 danno a un '
        'eroe; Canto 6: 1 danno a due; Canto 7: prova NERVI a tutti o 1 danno). <b>Il rito accelera '
        'il risveglio (+1 Canto/round) finché ha una voce che lo canti:</b> M. in piedi con la sua '
        '(cioè senza la Candidata salvata), <b>oppure</b> — anche con M. a terra o senza voce — '
        'almeno un impiegato del coro ancora in campo, che tiene lo spartito sopra l’uomo caduto. '
        'Abbattere M. non chiude la notte: spezzare il coro <i>e</i> togliergli la voce sì. È la '
        'ragione per cui «non abbassate la lama» non è solo una frase: la lama, da sola, non ferma '
        'l’orologio.',
        '<b>Vittoria e sconfitta.</b> Controcanto (10 righe) completo PRIMA del risveglio (Canto 8) = '
        '<b>VITTORIA</b> (il Dormiente torna al sonno senza sogni). Risveglio (Canto 8) prima = '
        '<b>SCONFITTA</b> (il dio si desta — vedi epilogo). FUORI SCALA: le fasi ambientali possono '
        'far cadere eroi, e il finale può finire male. <b>Il mazzo:</b> 21 carte (7 coro, 7 insidie '
        'di discesa/camera, <b>3</b> crescendo-risveglio, 4 eventi). <i>Tre e non quattro:</i> '
        'la marea non sveglia il dio, bagna voi — la pressione non cala, cambia bersaglio.',
    ])
    pagina('epilogo di campagna — e il finale aperto', [
        '<b>EPILOGO — VITTORIA (controcanto completo).</b> «L’ultima riga sale dalle vostre gole '
        'roche, stonate, umane — e per un istante impossibile fa a gara col canto del dio. Poi il '
        'dio, cullato, richiude l’occhio che aveva aperto. La gola della città si chiude come una '
        'bocca sazia. M. resta in ginocchio nell’acqua bassa, la sua Italia immaginata sciolta come '
        'sale. All’alba, uscite nell’aria fredda di Roccamora — e tutte le campane della città '
        'suonano da sole, una volta sola, insieme. Un ringraziamento. O un addio. Non l’avete '
        'ucciso, il Dormiente. L’avete cantato a dormire. Ed è la cosa più difficile, e più gentile, '
        'che abbiate mai fatto.»',
        '<b>EPILOGO — SCONFITTA (il risveglio).</b> Il Dormiente si desta: non distrugge, sogna a '
        'occhi aperti, e la città con lui. Roccamora non cade — cambia: le acque non tornano al loro '
        'posto, le campane suonano a ore sbagliate, la gente ricorda cose mai vissute. Chi resta '
        'della Società non ha perso: ha rimandato. Ci vorrà un’altra generazione, e un altro '
        'controcanto.',
        '<b>IL COMMIATO — dopo la vittoria, leggere solo le righe che vi spettano.</b> «All’alba, '
        'sul molo, non siete in molti e nessuno ha voglia di parlare per primo.»<br/>'
        '<b>La signora Vetri</b> (se l’avete sottratta a M. nella fase del coro): «La portano su '
        'avvolta in un cappotto d’uomo, e la prima cosa che chiede è dell’acqua. — <i>Intera:</i> '
        'in inverno riapre il Comunale, e canta l’aria del terzo atto a teatro pieno; dicono che '
        'sia la sera più bella della sua carriera. — <i>A metà:</i> non torna in scena, ma insegna, '
        'e le sue allieve prendono il fiato dove lo prendeva lei. — <i>Muta di quel ricordo:</i> '
        'canta ancora, e non saprà mai perché una conchiglia le rispose una volta: la lasciate '
        'così, ed è una gentilezza.» Se non l’avete salvata: «di lei restano lo scialle piegato '
        'sulla soglia e una fila di sedie vuote. Il Comunale non riapre.»<br/>'
        '<b>L’Ispettore Vidal</b> — <i>se lo convinceste:</i> «vi restituisce le taglie strappate '
        'una per una, in silenzio, e chiede di essere trasferito: non vuole più comandare uomini '
        'che obbediscono e basta.» <i>Se lo fermaste soltanto:</i> «non è venuto. Ha mandato un '
        'biglietto di tre parole — <i>“Non vi arresto”</i> — e nient’altro, mai più.»<br/>'
        '<b>Il decano Ferrante</b> «rimette la matrice delle doppie letture nell’archivio della '
        'Società, e sul registro scrive una riga sola: <i>caso chiuso, e la città non lo saprà</i>. '
        'Poi torna a dormire per due giorni interi.» <b>Fossa</b> «riapre il Banco alle sette in '
        'punto, come ogni mattina, e non fa domande: ma quel giorno non registra nessun pegno.» '
        '<b>Ranuzzi</b> «non scrive l’articolo della sua vita, e se ne vanta.»<br/>'
        '<b>Il professor Braga</b> — <i>se dichiaraste in pubblico il dubbio sul dossier:</i> «viene '
        'al molo col cappotto buono, vi stringe la mano troppo a lungo e non dice niente di sensato; '
        'in primavera riapre la villa-museo, e all’ingresso non fa pagare nessuno.» <i>Se lo '
        'avallaste:</i> «non c’è nessuno da salutare. È morto in cella nel sonno, senza processo, e '
        'la ceralacca sulle imposte della villa non l’ha ancora tolta nessuno: quel conto resta '
        'vostro.»<br/>'
        '<b>Gli eroi rimasti a terra nella camera</b> (se ce n’è qualcuno): «li tirano fuori '
        'dall’acqua nera per ultimi, e respirano. Non hanno sentito l’ultima riga: se la faranno '
        'raccontare per anni, e non sarà la stessa cosa. Rimetteteli in piedi all’alba, i vostri '
        'compagni: la loro parte di gloria è intera, e la tosse durerà loro l’inverno.»<br/>'
        'Se avete <b>reso pubblica la prova</b>: «la città li conosce tutti per nome, adesso, e '
        'nessuno di loro lo trova comodo.» Se l’avete <b>tenuta</b>: «nessuno saprà mai chi siete '
        'stati, e vi tocca il congedo più difficile: quello senza applausi.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 20:</b> l’<i>ultima riga del canto del sonno</i>, la nona — '
        '<i>«L’ultima riga non si legge: si compone. E si compone solo con gli altri diciannove '
        'davanti. Poi la città dorme.»</i> Nove erano il canto del sonno con '
        'lei (Frammenti 1-7 e 11: M. li voleva), undici la sua firma (8, 9, 10, 12-19: non l’ha mai '
        'saputo). <b>Migliorie finali.</b> Il <b>commiato dei PNG</b> è quello qui sopra: leggete '
        'solo le righe che i vostri Bivi vi hanno guadagnato. '
        '<b>NIENTE Bivio: è la fine.</b> L’ultima riga del Taccuino resta <b>bianca</b>.',
        '<b>IL FINALE APERTO — leggere solo dopo la vittoria, all’alba.</b> «Mentre le campane '
        'suonano e la città rinasce, sul banco della Società qualcuno ha lasciato un biglietto: '
        'carta di pregio col giglio spezzato, una sola riga in una grafia che <i>non è di M.</i> — '
        '"Il Dormiente ha molti sogni, e voi ne avete spento uno solo. Grazie di avermi insegnato il '
        'controcanto. — C.B." C.B. erano due maschere di M.; ma qualcuno, stanotte, ha raccolto la '
        'seconda maschera dal fango, e ha imparato guardandovi vincere. Roccamora dorme di nuovo. Ma '
        'da qualche parte, una penna nuova intinge nell’inchiostro ferro-gallico. La caccia è finita. '
        'La <i>prossima</i> comincia con voi che, senza saperlo, avete addestrato il nemico che '
        'verrà.»',
        '<b>Grazie di aver giocato «Ombre su Roccamora».</b> La riga bianca del Taccuino è per la '
        'vostra prossima storia: il nuovo C.B., gli altri sogni del Dormiente, la voce che avete '
        'salvato o perduto. La città vi aspetta ancora.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI20_DESC = {
    1: "La Cattedrale, stanotte, sa di cera fredda e di acqua che non dovrebbe esserci: un "
       "fiato salmastro sale dalle fughe del pavimento e si mescola all’incenso vecchio, e "
       "più ci si avvicina all’altare più il primo odore vince sul secondo. Le panche sono "
       "state spinte contro le colonne in fretta, di traverso; i candelabri d’ottone stanno "
       "accesi lungo la navata di sinistra soltanto, e dall’altra parte il buio arriva fino "
       "alle volte. Sotto le lastre lavora qualcosa di grande e di lento — non un rumore, un "
       "livello: l’acqua appoggia contro la pietra da sotto, sale di un dito, si ritira, e "
       "ogni volta che lo fa le fiammelle delle candele si piegano tutte insieme dalla stessa "
       "parte, come per una porta aperta chissà dove. Il sagrestano vi aspetta in fondo con le "
       "mani infilate nelle maniche, i polsi magri, la faccia di chi non dorme da tre notti; "
       "vi lascia passare e poi dice, piano, alla vostra schiena: «ci risiamo, come nel Terzo "
       "Movimento.» Sul gradino dell’altare, nel velo di sale asciutto che ha lasciato l’ultima "
       "marea, c’è un segno tracciato con un dito, fresco.",
    2: "Nell’ansa dove le barche vengono a morire l’aria sa di fango scoperto e di alghe "
       "secche, e stanotte anche di sale: un sale forte, da mare aperto, che in un canale "
       "interno non si sente mai. Gli scafi stanno riversi sul fianco con le costole all’aria, "
       "e nella pancia dei relitti i vecchi hanno costruito i loro ossari — cassette di legno "
       "impilate, ciascuna col cartellino e lo spago, e davanti a ognuna un lumino a olio che "
       "nessuno lascia spegnere. Sui montanti delle chiglie, dal fango in su, i segni delle "
       "maree stanno incisi a coltello uno sopra l’altro, decine, con l’anno accanto; gli "
       "ultimi tre sono più alti di tutti, e l’acqua di adesso è già sopra il penultimo. I "
       "vecchi non guardano l’acqua mentre parlano di lei: guardano i segni, e ogni tanto uno "
       "allunga la mano, la posa sul legno bagnato, la ritira, la asciuga sulla giacca. Un "
       "barcaiolo con gli avambracci pieni di cicatrici vecchie vi tiene per la manica più a "
       "lungo del necessario: «Un minuto prima o dopo, e o vi annega la marea, o vi trova M. "
       "già cantando.» Ai suoi piedi, in una scodella di legno, l’acqua raccolta dal fondo "
       "della stiva trema di continuo, in cerchi piccolissimi.",
    3: "La chiatta è ormeggiata sull’acqua bassa e la taverna ci sta sopra come una casa "
       "costruita per sbaglio: sa di legno bagnato, di sego e di zuppa tenuta al caldo troppo "
       "a lungo, e sotto le assi del pavimento l’acqua batte piano, sempre alla stessa "
       "cadenza, così che il tavolo grande oscilla di un niente e i bicchieri lo raccontano. "
       "Alle pareti il manifesto di taglia con le vostre facce, tolto e riappeso tante volte "
       "che gli angoli sono morbidi; una fila di chiodi coi cappotti degli assenti; e in un "
       "angolo, sotto un telo, quello che era il banco della Società, ridotto a due assi e un "
       "cassetto. Stasera hanno apparecchiato per tutti, anche per i posti che restano vuoti: "
       "le scodelle capovolte, il pane già tagliato, il vino versato e non toccato. Nessuno fa "
       "discorsi lunghi. Uno appoggia gli avambracci sul tavolo, guarda la porta invece che "
       "voi e dice: «qualunque cosa accada là sotto, avete già vinto una cosa — non siete "
       "diventati come lui.» Poi la lampada cala e risale da sola, come fa quando qualcuno "
       "cammina sul ponte di sopra, e nessuno alza gli occhi. Sul tavolo, tenuta ferma agli "
       "angoli da quattro bicchieri, sta aperta una carta della discesa segnata a matita.",
    4: "L’Archivio sa di ferro-gallico e di carta tenuta al freddo: quell’odore di acqua "
       "ferruginosa e di chiodo che l’inchiostro da registro lascia nelle stanze dove si "
       "scrive da un secolo, e che d’inverno prende alla gola. Scaffali fino al soffitto, "
       "faldoni legati con la fettuccia, i calamai in fila sul ripiano coi tappi d’ottone, i "
       "pennini nuovi ancora nella carta velina; e sul leggio grande, aperto e non richiuso da "
       "nessuno, il fascicolo del 1741, la carta ondulata dall’umidità come una pagina che ha "
       "preso pioggia molti anni fa. Accanto sta il calendario dei Padri, disegnato a mano su "
       "un foglio unico: cerchi e mezzelune per ogni mese di centocinquant’anni, e in fondo "
       "alla colonna di questo autunno una data cerchiata due volte, con la matita ripassata "
       "tante volte da lucidare la carta. Le finestre sono chiuse, eppure ogni tanto i fogli "
       "appesi ad asciugare sul filo si muovono tutti insieme per un istante e poi tornano "
       "fermi. Sul tavolo lungo qualcuno ha messo in fila i fogli che avete conservato di "
       "serata in serata, uno accanto all’altro, e in fondo alla fila ha lasciato un posto "
       "vuoto.",
    5: "L’Ossario Comunale è una biblioteca di morti: corridoi di scaffali fino al soffitto, e "
       "su ogni ripiano cassette di legno grandi come una scatola da cappelli, ciascuna col "
       "cartellino scritto a mano — tre generazioni di grafie, dalla corsiva grassa dei nonni "
       "allo stampatello d’ufficio. Sa di calce, di legno vecchio e di quel niente asciutto "
       "che hanno le stanze dove non entra mai acqua: è l’unico posto della città, stanotte, "
       "dove la marea non si sente. I vecchi del Coro stanno seduti nel corridoio di mezzo su "
       "sedie portate da casa, le coperte sulle ginocchia, e tengono la lanterna bassa fra i "
       "piedi perché la luce non arrivi ai cartellini; parlano uno alla volta, e mentre uno "
       "parla gli altri chiudono gli occhi. «M. crede che una voce si possa costringere a "
       "credere», dice il più vecchio, e si ferma tanto da farvi pensare che abbia finito. "
       "«Non è vero.» Nella polvere del ripiano dietro le loro teste restano ventidue "
       "rettangoli puliti, e in uno di quei vuoti qualcuno ha posato una candela accesa.",
    6: "La chiesa dei Battuti serve da magazzino comunale da anni e ne ha preso l’odore: iuta, "
       "cera da pavimenti, cassette d’inventario, e sotto, immobile, il chiuso dolciastro "
       "delle chiese sconsacrate. Le casse riempiono la navata fino a metà colonna, ciascuna "
       "col cartellino inchiodato al pilastro; in fondo, dove il muro era stato sfondato, i "
       "mattoni nuovi arrivano all’altezza di un uomo e poi si fermano, con la cazzuola ancora "
       "appoggiata sopra e la malta ormai secca. Dietro quel mezzo muro sta ciò che resta "
       "dell’organo di ossa: le canne allineate per lunghezza sul cavalletto, la conchiglia "
       "legata al suo supporto, un campanello d’ottone piccolissimo appeso a parte. Non le "
       "tocca nessuno, eppure le canne più corte tengono una nota sottile ogni volta che "
       "qualcuno apre il portone in fondo, e la tengono un poco più a lungo di quanto una "
       "canna spenta dovrebbe. Un vecchio Battuto vi guarda armeggiare senza avvicinarsi, le "
       "mani nelle tasche del grembiule: «l’organo di ossa non è male in sé. È uno strumento. "
       "Dipende chi lo suona, e cosa gli fa cantare.» Nella fila delle canne ne manca una, e "
       "il feltro sotto ne ha conservato l’impronta.",
    7: "La sala delle prove sa di cera bruciata e di fiato di molte persone andate via da "
       "poco: l’aria è ancora tiepida e i vetri sono appannati dalla parte di dentro. Le sedie "
       "intagliate stanno in semicerchio attorno al leggìo, tutte voltate verso di esso e "
       "tutte scostate all’indietro dello stesso mezzo passo, come si alza un coro che ha "
       "finito insieme; sul tappeto, davanti a ciascuna, la lana è consumata in una macchia "
       "grande come due piedi. Nessuno ha spento le candele: sono arrivate al collo dei "
       "candelieri e continuano a colare sul legno. Quando di sopra sbatte una porta, le sedie "
       "del semicerchio scricchiolano una dopo l’altra, in ordine, da sinistra a destra, e poi "
       "tacciono tutte insieme. Sul leggìo, aperto e girato verso l’uscio invece che verso le "
       "sedie, è rimasto un foglio solo, con quattro righe di note e sotto una riga di parole "
       "in una lingua che non è italiano; e sopra il foglio, posata al centro come un "
       "fermacarte, sta una chiave di ferro nuovo, lunga come una mano, con l’ingegno tagliato "
       "di fresco e ancora lucido di limatura.",
    8: "Lo scriptorium si sente col naso prima che con gli occhi: colla di pelle scaldata, "
       "gomma arabica, e la punta acida dell’inchiostro fresco che alla lunga fa lacrimare. I "
       "leggii inclinati stanno in due file sotto le finestre alte, ciascuno con la sua "
       "lampada schermata di verde, il calamaio e il raschietto; su uno solo ci sono due "
       "volumi affiancati, l’originale e la copia, aperti alla stessa pagina, e le due pagine "
       "si somigliano fino al tremito delle aste. Il grimorio del Quarto Movimento sta "
       "sull’ultimo leggio in fondo, legato in pelle scura, con una fettuccia rossa fra le "
       "pagine e i quattro angoli protetti d’ottone: è l’unica cosa nella sala che non abbia "
       "polvere sopra. Il copista che l’ha ricopiato non si è più seduto — sta in piedi contro "
       "lo scaffale, lo straccio in mano, il pollice destro macchiato fino all’unghia — e "
       "mentre parla del libro non lo guarda: «quel grimorio l’ha voluto M.» Al suo posto la "
       "sedia è stata spinta indietro e lasciata di traverso, e la lampada verde è rimasta "
       "accesa.",
    9: "Oltre il punto dove fermaste Ferri la pietra finisce e comincia l’acqua, e l’odore "
       "cambia tutto insieme: non più cripta e salnitro, ma salso freddo, fango di fondale e "
       "una dolcezza guasta che sta sotto le altre due e non se ne va. Il fiato che sale dal "
       "basso è più tiepido dell’aria, e la lanterna tenuta in avanti non trova pareti: la "
       "luce esce e non torna. Le pareti però ci sono, e si toccano — pietra bagnata, tiepida "
       "come il fianco di un animale, con le fughe che sudano; chi ci appoggia la mano la "
       "ritira, e poi ce la rimette. Il rumore dell’acqua arriva da tre parti diverse e non si "
       "raccoglie mai in uno solo. Ogni parola detta a mezza voce torna indietro dopo un tempo "
       "troppo lungo, e non sempre dalla parte in cui l’avete mandata. Sotto tutto questo, "
       "così basso che lo sentite nello sterno prima che nelle orecchie, qualcosa di grande "
       "respira piano, e a ogni fiato tirato l’acqua contro i gradini si ritira di un dito. "
       "Sull’ultimo gradino asciutto qualcuno ha lasciato una lanterna accesa, girata verso il "
       "basso.",
}

OGGETTI_LUOGO_20 = {
    2: [('Incrocio D1', '', 'con il calendario dei Padri, QUANDO scendere è provato')],
    3: ['La Mappa Acustica Attiva'],
    4: [
        ('Oggetto', 'I Frammenti del Controcanto', 'le righe giuste tra i venti'),
        ('Referto', '', 'la riga finale del controcanto è la deduzione finale'),
        ('Incrocio D1', '', 'con gli ossari, QUANDO scendere è provato'),
    ],
    5: [
        'La Candidata Salvata',
        ('Incrocio D3', '', 'con l’organo di ossa, CHI è la voce è provato'),
    ],
    6: [('Reperto B', 'la Voce che Crede', ''), ('Incrocio D3', '', 'CHI è la voce è provato')],
    7: [
        ('Esca', 'La Chiave del Coro', 'apre l’estasi di M., non il sonno; usarla accelera il risveglio'),
    ],
    8: [
        ('Esca', 'Il Grimorio del Rito', 'è la partitura del RISVEGLIO, non del sonno; leggerlo aiuta M., non voi'),
    ],
    9: [
        ('Reperto C', 'la Gola della Città', 'la camera che nessuna mappa registra'),
        ('Reperto A', 'la Partitura del Controcanto', 'il Fascicolo aperto sulla riga finale, coi Frammenti'),
    ],
}

TILE_ART_20 = {t['id']: t['id'] + '-ep20.png' for t in TILES_20}
LUOGHI20_CROP = {}

TESSERE_DESC_20 = {
    'T1': "Oltre la cripta la scala continua dove le mappe della Cattedrale finiscono: gradini "
          "tagliati nella roccia viva, senza corrimano, larghi in cima e sempre più stretti "
          "mano a mano che si scende, consumati al centro da un passaggio che nessuno ricorda. "
          "L’aria si fa pesante in due giri di scala soltanto — prima muffa e cera, poi "
          "salnitro, poi il salso pieno del mare aperto, che sotto una città non ha nessun "
          "diritto di esserci. Agli anelli di ferro dove un tempo stavano le torce non è "
          "rimasto niente se non la ruggine, colata in basso in righe lunghe e rossastre. "
          "L’acqua nera aspetta più giù e non sta ferma: sale un gradino, si ritira di mezzo, "
          "risale, e ogni volta che tocca la pietra asciutta lascia una riga di schiuma "
          "sottile che non fa in tempo a seccare. Dal fondo, sotto il rumore dell’acqua e in "
          "un tempo tutto suo, arriva un respiro lento e immenso, e a ogni respiro le fiamme "
          "delle lanterne si allungano e si accorciano insieme, tutte quante. Sul quinto "
          "gradino sopra l’acqua, appoggiata al muro, sta una scarpa sola, gonfia, con la "
          "stringa ancora annodata.",
    'T2': "Il passaggio si allarga in una camera bassa dove tre correnti arrivano da tre bocche "
          "diverse e si incontrano senza mescolarsi: una dolce e veloce, che sa di pozzo e di "
          "pietra pulita; una salata e pesante, che tira in basso e sa di mare aperto; e una "
          "terza che non sa di niente e non fa rumore, ferma in mezzo alle altre due come una "
          "macchia d’olio. Dove si toccano, l’acqua si torce in trecce lente che si disfano e "
          "si rifanno, sempre nello stesso punto. Il freddo, qui, non è nell’aria: è "
          "nell’acqua, e arriva alle gambe prima che ve ne accorgiate. Le pareti sono lisce "
          "fino all’altezza del petto e ruvide sopra, come in un canale che qualcuno ha "
          "scavato e poi ha smesso di scavare. E c’è l’eco: parlate, e la vostra voce torna "
          "dalla bocca sbagliata, con un ritardo che cambia ogni volta; chi resta indietro "
          "sente i passi di chi lo precede arrivargli da dietro le spalle. Sul bordo di "
          "pietra, all’imbocco della terza bocca, sta un mucchietto di ossa piccole e pulite, "
          "accatastate in piramide.",
    'T3': "Qui il condotto si stringe fino a costringervi in fila indiana, e la roccia cambia "
          "sotto le mani: non più fredda e asciutta, ma tiepida e umida, con una grana che "
          "cede appena sotto il pollice e poi torna, come cuoio bagnato. Le fughe fra i blocchi "
          "— se sono blocchi, perché in certi punti il taglio non si vede più — si aprono e si "
          "chiudono di un capello, piano, sempre alla stessa cadenza, e da quelle fessure esce "
          "un’aria tiepida che sa di ferro e di sale. La polvere che avete addosso resta "
          "attaccata al muro e vi disegna il posto delle mani. E dalla pietra, non da "
          "un’apertura ma da tutta la pietra insieme, comincia a filtrare un canto: bassissimo, "
          "senza parole, così lento che una nota sola dura più di un vostro respiro, e non "
          "viene da davanti né da dietro — viene da dentro le orecchie, e chi tiene la "
          "mascella serrata se lo sente nei denti. Le lanterne diventano inutili prima di "
          "spegnersi: la luce non muore, smette soltanto di dire dove sono le cose. In una "
          "nicchia asciutta, all’altezza del ginocchio, sta una fila di conchiglie disposte in "
          "cerchio, con l’apertura tutte verso il centro.",
    'T4': "L’antecamera è la prima stanza fatta da mani d’uomo che incontrate là sotto: volta a "
          "botte, pavimento in piano, e lungo le pareti i leggii da orchestra portati giù "
          "pezzo per pezzo, con gli spartiti fermati alle aste dalle mollette da bucato perché "
          "l’umidità li fa arricciare. In terra, in fila contro il muro, le borracce d’acqua "
          "per la gola, i cappotti piegati, una cassetta di lumini di scorta: attrezzatura da "
          "giornata di lavoro, in un posto dove il lavoro è questo. Cantano in trenta, in tre "
          "file, e si vede subito che leggono — gli occhi non lasciano la carta, le bocche "
          "fanno le vocali giuste e nient’altro, e a ogni respiro qualcuno perde il tempo e lo "
          "riprende un mezzo secondo dopo gli altri. Sono impiegati, con le scarpe buone "
          "rovinate dall’acqua salata; la paura si sente prima nella voce che nelle facce, "
          "perché le note lunghe tremano tutte allo stesso modo. Fra la seconda e la terza "
          "fila, in mezzo a bocche che vanno a tempo, ce n’è una che canta guardando avanti, "
          "senza carta.",
    'T5': "Da qui in avanti la roccia è nuda: nessuna nicchia, nessun anello, nessun segno di "
          "scalpello, e la pietra della soglia è liscia e leggermente incavata al centro, come "
          "i gradini delle chiese dove è passata troppa gente — solo che qui non passa nessuno "
          "da secoli. Fa più caldo che nell’antecamera, di parecchio, e l’aria è ferma al "
          "punto che il fumo delle lanterne sale dritto e resta appeso a mezz’altezza. Oltre "
          "l’arco non c’è buio: c’è un chiarore, e non è luce — non illumina niente, non fa "
          "ombre, non si posa sulle cose; somiglia piuttosto al colore che si vede a occhi "
          "chiusi premendo le palpebre, e chi lo guarda troppo a lungo si accorge di aver "
          "smesso di respirare. Gli ultimi del coro si sono messi di traverso davanti "
          "all’arco, spalla contro spalla, e cantano voltati verso di voi invece che verso il "
          "leggìo. Più indietro, dentro il chiarore, due sagome: una in piedi, ferma; l’altra "
          "tenuta per il gomito. Sulla pietra della soglia, a metà, qualcuno ha appoggiato uno "
          "scialle piegato, e lo scialle è asciutto.",
    'T6': "La camera non ha pareti che la lanterna possa trovare, e il suono ci mette troppo a "
          "tornare: quando uno di voi parla, la sua voce si allontana e riappare dopo un tempo "
          "che non appartiene a nessuna stanza. Il pavimento è acqua nera fino al ginocchio, "
          "tiepida come acqua di bagno lasciata raffreddare a metà, e sotto la superficie "
          "qualcosa si alza e si abbassa piano — non onde: un livello, la stessa cosa che fa "
          "il petto di chi dorme. L’aria è densa e pesa sul torace; l’odore è di sale, di "
          "pietra bagnata e di quel dolciastro che hanno le stanze dei malati. Al centro, dove "
          "l’acqua è più alta, sta in piedi un vecchio con la palandrana fradicia fino alla "
          "cintura, e canta: la voce gli si rompe, riparte, si rompe di nuovo, e ogni volta la "
          "ricomincia dalla stessa nota, più forte. Dietro di lui il chiarore che non è luce "
          "si allarga e si stringe al ritmo del respiro, e a ogni respiro l’acqua vi sale di "
          "un dito. Sulla superficie, a un braccio da voi, galleggia un foglio di spartito, "
          "asciutto.",
}

ESAMI_CARBONE_20 = {
    'I FRAMMENTI DEL CONTROCANTO': '«Messi in fila tutti e venti, i Frammenti si dividono in due '
                'parti disuguali: nove sono righe di un canto che spegne, gli altri undici erano la '
                'firma di chi vi ha ingannati. Non si distinguono a orecchio — di lui si parla anche '
                'col bronzo, e della città anche per accusarlo: il Fascicolo li conta invece di '
                'descriverli, e i nove sono i Frammenti 1, 2, 3, 4, 5, 6, 7 e 11, più il 20 che si '
                'compone davanti a tutti gli altri. Il lembo con la mezza onda non è dell’uno né '
                'dell’altro conto: quello è il giuramento. '
                'M. voleva i nove e vi ha usati per raccoglierli; non ha mai saputo che '
                'raccoglievate anche gli undici. Ora cantate i nove, e ricordate gli undici.»',
    'LA VOCE CHE CREDE': '«Il Quarto Movimento non lo canta un coro comprato: lo canta un cuore che '
                'crede. È la signora Vetri, la prima donna del Comunale — e non crede per devozione: '
                'crede perché è l’unica persona viva che ha sentito la conchiglia del teatro '
                'risponderle. È l’unica cosa che il denaro di M. non ha potuto comprare, e la sua '
                'unica speranza è costringerla con la paura. Salvatela, e M. avrà un coro senza '
                'anima: un rumore, non un risveglio.»',
    'LA GOLA DELLA CITTÀ': '«Oltre il punto dove fermaste Ferri, la pietra dà sull’acqua e l’acqua '
                'dà sul buio, e nel buio qualcosa di grande respira piano. Non è un mostro da '
                'colpire: è un dio che sogna. Non abbassate la lama. Alzate la voce.»',
}

OGGETTI_TESSERA_20 = {'T3': ['Un Frammento di Eco Pulito']}


def luoghi():
    """Luoghi.pdf Episodio 20 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 20 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_20, 'Episodio 20')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_20.get(n, []))

    for L in LUOGHI_20:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI20_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI20_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_20)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_20
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LA CAMERA DEL DORMIENTE', 'M. (SENZA MASCHERA)', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 20')
    print('OK episodio 20')
