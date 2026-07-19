# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 20: Il Quarto Movimento (Episodio 20/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-20.md e CAMPAGNA-EPISODI.md). IL FINALE:
la discesa sotto la Cattedrale, il coro a pagamento, M. umano, e il Dormiente
che ascolta. Non si vince con l'acciaio: col CONTROCANTO (la deduzione con TUTTI
i Frammenti — metà erano il canto del sonno che M. voleva, metà lo smascheravano).
La camera è il boss (fasi ambientali legate al Canto). Fuori scala: si possono
perdere eroi. NIENTE Bivio: è la fine. Finale aperto per una prossima campagna
(un nuovo C.B.).

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
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
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
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


# ================================================================= DATI

LETTERA_20 = (
    "Alla Società del Lume — l’ultima notte.<br/><br/>"
    "«Le <b>maree di sizigia</b> sono tornate, e con esse il Quarto Movimento. Non c’è tempo per "
    "indagare: c’è una notte sola, e tre cose da sapere prima di scendere. <b>Quando</b> "
    "esattamente — l’ora del picco. <b>Dove</b> passa la via delle tre acque. E <b>chi</b> è "
    "l’ultima voce che M. cerca, da salvare prima di lui.<br/><br/>"
    "Poi scendete, coi <b>Frammenti</b> di venti serate stretti in pugno: erano due metà di una "
    "cosa sola, e adesso lo capirete. Non abbassate la lama là sotto. <b>Alzate la voce.</b> "
    "Cantate giusto, e riportatelo a dormire. È tutto qui.<br/>"
    "— il decano (o Vidal, o chi vi resta)»<br/><br/>"
    "<i>Aperti dall’inizio: la Cattedrale, gli ossari (Cimitero delle Barche), la Taverna della "
    "Chiatta, l’Archivio del 1741. Portate con voi la Mappa Acustica e il Fascicolo del 1741 "
    "dall’Ep. 19, e TUTTI i Frammenti conservati: sono il controcanto.</i>")

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
             'Sull’altare, un segno del Coro fresco: M. è già sceso, o sta per farlo. '
             '<i>(Presagio.)</i> Non c’è margine: stanotte si chiude, in un modo o nell’altro.'],
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
             'Un vecchio barcaiolo vi dà l’ora esatta del picco: <i>(incrocio D1: con il calendario '
             'dei Padri, QUANDO scendere è provato.)</i> «Un minuto prima o dopo, e o vi annega la '
             'marea, o vi trova M. già cantando.»'],
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
             'Si conta il controcanto: quanti Frammenti avete conservato in venti serate. «Metà sono '
             'righe del canto del sonno, metà erano la firma di M. Cantate le prime, ricordate le '
             'seconde. Più ne avete, più il controcanto è completo.»',
             'Chi vi resta vi guarda in faccia, l’ultima volta prima dell’acqua: «qualunque cosa '
             'accada là sotto, avete già vinto una cosa — non siete diventati come lui. Adesso '
             'andate a cantare.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Chi vi resta',
                  testo='Alla Taverna della Chiatta, l’ultima notte, si tira la somma di tutto: la '
                        'mappa acustica (la via delle tre acque), il Fascicolo del 1741 (il '
                        'controcanto), e i Frammenti conservati (le righe da cantare). Chi vi resta — '
                        'il decano, Fossa, Ranuzzi, Vidal se convinto, i PNG del conto — non scende '
                        'con voi, ma vi arma di tutto ciò che venti serate hanno messo da parte. È il '
                        'pay-off finale: la campagna intera, ridotta a un canto e a una manciata di '
                        'amici. Portateli con voi, almeno nel cuore. Poi scendete.'),
         ]),
    dict(n=4, nome='L’ARCHIVIO DEL 1741', voce_mappa='L’Archivio delle Penne',
         req='Disponibile dall’inizio', art='L’Archivio delle Penne.png',
         chiude=None,
         indizi=[
             'Il Fascicolo del 1741 aperto sulla riga finale del controcanto, e il calendario dei '
             'Padri che fissa l’ora delle sizigie. <i>(Oggetto: prendete i Frammenti del '
             'Controcanto — le righe giuste tra i venti.)</i> <i>(incrocio D1: con gli ossari, '
             'QUANDO scendere è provato.)</i>',
             'Messi in fila, i venti Frammenti si dividono in due: metà sono il controcanto (M. li '
             'voleva per il Quarto Movimento, e ve li ha fatti cercare); metà smascheravano lui, e '
             'non l’ha mai saputo. «Cantate le prime. Le seconde ve le siete già cantate, '
             'smascherandolo.»',
             'La riga finale del controcanto — il Frammento 20 — si compone solo con tutti gli altri '
             'diciannove davanti. <i>(Referto: la deduzione finale.)</i> È la chiave del sonno senza '
             'sogni.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le due metà dei Frammenti',
                  testo='La deduzione finale non è un nome né un come: è un canto. Messi in fila '
                        'tutti e venti, i Frammenti si dividono in due metà. La prima — i dispari — '
                        'sono le righe del controcanto che riporta il Dormiente al sonno senza sogni: '
                        'M. le voleva per il Quarto Movimento, e vi ha usati per raccoglierle. La '
                        'seconda — i pari — erano la sua firma, la traccia che lo smascherava, e non '
                        'ha mai saputo che raccoglievate anche quelle. Ora la partita è semplice e '
                        'terribile: cantate le prime più in fretta di quanto lui canti il suo rito. '
                        'Chi ha conservato più Frammenti canta più giusto. Contateli, e scendete.'),
         ]),
    dict(n=5, nome='I VECCHI DEL CORO', voce_mappa='L’Ossario Comunale',
         req='I vecchi del Coro si aprono a chi cerca l’ultima voce: la candidata che il Coro '
             'insegue dall’inizio, la voce che crede.',
         chiave=('parola', 'LA VOCE CHE CREDE'), art='Ossario Comunale.png',
         chiude=None,
         indizi=[
             'Chi ricorda il Coro dall’Ep. 3 sa chi è l’ultima candidata: la voce che crede, l’unica '
             'che M. non può comprare. «È viva, o quel che ne resta, secondo come avete chiuso i '
             'casi del Coro. Se la salvate, M. resta con un coro senza anima: un rumore.»',
             'La candidata è tenuta da M. o dai suoi, in attesa del Quarto Movimento. '
             '<i>(incrocio D3: con l’organo di ossa, CHI è la voce è provato.)</i> Raggiungerla nella '
             'discesa (fase del coro) la sottrae a M.',
             'Un vecchio: «M. crede che una voce si possa costringere a credere. Non è vero. Per '
             'questo la sua unica speranza è la paura — e per questo va salvata, non solo trovata.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La voce che non si compra',
                  testo='La voce che crede è l’ultima cosa che il denaro di M. non ha potuto '
                        'comprare, e la sua unica speranza per il Quarto Movimento: un cuore che '
                        'canti il quarto rigo con l’anima e svegli il Dormiente in un’estasi che lui '
                        'crede di poter cavalcare. Ma la fede non si costringe, e M. lo sa: la sua '
                        'candidata la tiene con la paura, non con la devozione. Salvatela nella '
                        'discesa, e M. resterà con un coro comprato che canta con la bocca e non con '
                        'l’anima — un rumore, non un risveglio. È metà della vittoria: l’altra metà '
                        'è il vostro controcanto.'),
         ]),
    dict(n=6, nome='L’ORGANO DI OSSA', voce_mappa='La Chiesa dei Battuti',
         req='La chiesa dei Battuti apre a chi cerca la voce che crede: ciò che resta dell’organo '
             'di ossa e delle sue canne-voce.',
         chiave=('parola', 'LA VOCE CHE CREDE'), art='Chiesa dei Battuti.png',
         chiude=None,
         indizi=[
             'Ciò che resta dell’organo di ossa (Ep. 5): le canne-voce, la melodia della conchiglia, '
             'il campanello di Piero — dipende dai vostri Bivi. <i>(Reperto B: la Voce che Crede.)</i> '
             'È lo strumento con cui il Coro chiamava la voce, e con cui voi la riconoscerete.',
             'La melodia dell’organo di ossa incrocia il controcanto: alcune canne-voce cantano il '
             'risveglio, altre il sonno. <i>(incrocio D3: CHI è la voce è provato.)</i> Sapere quali '
             'è metà della battaglia acustica.',
             'Un ultimo Battuto sopravvissuto: «l’organo di ossa non è male in sé. È uno strumento. '
             'Dipende chi lo suona, e cosa gli fa cantare. M. gli fa cantare il risveglio. Voi '
             'fategli cantare il sonno.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Lo strumento e la mano',
                  testo='L’organo di ossa dell’Ep. 5 torna, un’ultima volta, come chiave della voce '
                        'che crede: le sue canne cantano il risveglio o il sonno secondo chi le '
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
             'La camera dove il Coro provava il Quarto Movimento: sul leggìo, una chiave che pare '
             'aprire la camera del Dormiente. <i>(Esca: la Chiave del Coro — apre l’estasi di M., '
             'non il sonno; usarla accelera il risveglio.)</i>',
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
                        'Braga. Non caScateci ora, a un passo dalla fine.'),
         ]),
    dict(n=8, nome='IL GRIMORIO DEL RITO', voce_mappa='Lo Scriptorium',
         req='Lo scriptorium apre a chi cerca lo spartito: il grimorio del Quarto Movimento, il '
             'controcanto scritto — o il suo contrario.',
         chiave=('parola', 'IL CONTROCANTO'), art='Lo Scriptorium.png',
         chiude=None,
         indizi=[
             'Lo scriptorium custodisce il grimorio del Quarto Movimento: lo spartito del rito. '
             '<i>(Esca: il Grimorio del Rito — è la partitura del RISVEGLIO, non del sonno; leggerlo '
             'aiuta M., non voi.)</i>',
             'Il grimorio è affascinante e mortale: sembra darvi il canto completo, e invece è il '
             'canto di M. Il controcanto vero non è scritto in un libro solo: è nei vostri Frammenti, '
             'sparso in venti serate.',
             'Un copista terrorizzato: «quel grimorio l’ha voluto M. Chi lo canta, canta per lui. Il '
             'vostro canto non è là dentro: è nelle cose che avete conservato senza capire perché.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il libro che canta per lui',
                  testo='Il Grimorio del Rito è l’altra faccia della tentazione: un libro solo, '
                        'completo, che pare contenere tutto il canto — e invece contiene il canto '
                        'sbagliato, la partitura del risveglio che M. vuole. Il controcanto vero non '
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
             'La gola della città, oltre il punto dove fermaste Ferri: la pietra dà sull’acqua, '
             'l’acqua dà sul buio, e nel buio qualcosa di grande respira piano. '
             '<i>(Reperto C: la Gola della Città — la camera che nessuna mappa registra.)</i>',
             'Non è un mostro da colpire: è un dio che sogna. M. e il suo coro comprato sono già '
             'qui, e cantano il quarto rigo. <i>(Reperto A: la Partitura del Controcanto — il '
             'Fascicolo aperto sulla riga finale, coi Frammenti.)</i>',
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
         cerca_vuoto='Acqua nera che sale gradino dopo gradino, e in basso un respiro lento che non '
                     'è il vostro. Scendete: la finestra delle maree è breve.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LE TRE ACQUE', exits={'S': 'T1', 'N': 'T3'},
         testo='Il punto dove tre correnti si incontrano nel buio: dolce, salata, morta. QUANDO '
               'RIVELATE QUESTA TESSERA: pericolo d’ambiente — la corrente fredda, l’eco che mente. '
               'La Mappa Acustica dice quale acqua seguire.',
         arbitro='Pericolo d’ambiente (le tre acque): prova VIGORE/NERVI o 1 round perso / 1 danno. '
                 'La Mappa Acustica annulla la confusione. La città può suonare a favore (evento).',
         cerca_vuoto='Tre correnti, un solo passaggio giusto. Sbagliare non uccide subito, ma vi '
                     'ruba il tempo che non avete: le maree salgono, il dio si muove.',
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
         hook='La Candidata Salvata (dai Vecchi del Coro): qui la sottraete a M. — il suo coro resta '
              'senza la voce che crede, un rumore, e il risveglio rallenta.',
         cerca_vuoto='Voci prezzolate che cantano male, con gli occhi impauriti: non credono a una '
                     'nota di ciò che cantano. Spezzatele — e cercate, tra loro, la voce che invece '
                     'crede: è lei che dovete salvare.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LA SOGLIA DELLA CAMERA', exits={'S': 'T4', 'N': 'T6'},
         testo='La soglia della camera del Dormiente: qui il coro fa l’ultima resistenza, e la '
               'candidata è vicina. QUANDO RIVELATE QUESTA TESSERA: se non l’avete già salvata, è '
               'ora — oltre questa soglia, M. la costringerà a cantare.',
         arbitro='Ultimo muro del coro. Se la Candidata non è salvata, M. la costringe (il '
                 'risveglio accelera). Salvatela qui, o subite la sua voce nella camera. Oltre, '
                 'la fase finale.',
         cerca_vuoto='Oltre la soglia, una luce che non è luce e un canto che non è canto: la '
                     'camera del dio. E in mezzo, M., che vi ha preceduti, e vi aspetta.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA CAMERA DEL DORMIENTE', exits={'S': 'T5'},
         testo='La camera, oltre ogni mappa: il Dormiente respira nel buio, M. canta il quarto rigo, '
               'e voi opponete il controcanto. QUANDO RIVELATE QUESTA TESSERA: comincia la FASE '
               'FINALE — completate il controcanto prima che il Dormiente si svegli.',
         arbitro='FASE 3 — LA CAMERA (il boss). Non si colpisce: si CANTA. Ogni round completate '
                 'righe di controcanto (ritmo = Frammenti + Mappa; il coro residuo rallenta). Le '
                 'fasi ambientali della camera fanno danno inevitabile a soglie di Canto. M. (umano) '
                 'in piedi con la sua voce accelera il risveglio: neutralizzarlo o averla salvata '
                 'aiuta. Controcanto completo PRIMA del risveglio = VITTORIA (il Dormiente torna al '
                 'sonno senza sogni). Risveglio prima = SCONFITTA (vedi Soluzione). FUORI SCALA: si '
                 'possono perdere eroi.',
         cerca_vuoto='Non c’è niente da cercare, e tutto da cantare. L’ultima riga sale dalle vostre '
                     'gole roche e umane, e per un istante impossibile fa a gara col canto del dio. '
                     'Poi il dio, cullato, richiude l’occhio. Avete vinto — cantando.',
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
              'canti il suo. È il finale: fuori scala, si possono perdere eroi. Ma la posta non è '
              'sopravvivere. È cantare giusto.'),
    dict(nome='M. (SENZA MASCHERA)', att=2, dif=8, fer=5, mov=4, dan=1, boss=False,
         tipo='C.B. — l’uomo, l’ultima maschera che cade', art='Il Presidente M.png',
         note='Umano e fragile (Att 2, Fer 5, Danno 1), feroce. NON è l’obiettivo (la vittoria è il '
              'controcanto): finché è in piedi e ha la sua voce, forza il Quarto Movimento (accelera '
              'il risveglio). Neutralizzarlo (a terra) o aver salvato la Candidata rallenta il '
              'risveglio. Quando il controcanto giusto sale, capisce di aver perso — e per la prima '
              'volta ha paura.',
         bio_bestiario='M. — il presidente, C.B., il Machiavelli — qui, per la prima e ultima '
              'volta, senza maschere: un uomo solo nell’acqua bassa della gola, che canta il quarto '
              'rigo con la disperazione di chi ha giocato tutto. Fragile (Att 2, Fer 5, Danno 1), '
              'non è più il ragno invisibile di diciotto mesi: è un vecchio che si crede l’Italia '
              'intera e sta per scoprire di essere solo un uomo. Non è l’obiettivo dello scontro — '
              'la vittoria non è ucciderlo, è cantare più giusto di lui — ma finché è in piedi e ha '
              'la voce che crede, spinge il Dormiente verso l’estasi del risveglio. Neutralizzarlo, '
              'o avergli sottratto la sua voce, gli toglie il rito dalle mani. E quando il vostro '
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
    c.drawString(16*mm, H - 31*mm, 'IL CONTROCANTO: contate TUTTI i Frammenti conservati (1-19). Più ne avete, più il canto è completo.')
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

    yy = sect(H - 52*mm, 'i frammenti conservati (1-19) — il controcanto', 4)
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
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '20/cards/</b>). Le 6 tessere della discesa sono in <b>Episodio 20/board/</b>. È '
                  'il FINALE, in tre fasi: la <b>discesa</b> (T1-T3, la gola della città), il '
                  '<b>coro a pagamento</b> (T4-T5, impiegati che si ROMPONO a metà Ferite), e la '
                  '<b>camera</b> (T6). Non c’è un boss da abbattere: la <b>camera è il boss</b>, con '
                  'fasi ambientali legate al Canto (il RISVEGLIO del Dormiente). Si vince '
                  'completando il <b>CONTROCANTO</b> (righe dai Frammenti) prima del risveglio. '
                  '<b>FUORI SCALA: si possono perdere eroi.</b> NIENTE Bivio: è la fine.', BODY)])
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
                  'in campo); spezzarlo (a metà Ferite fugge) libera il canto. Controcanto completo '
                  'PRIMA del risveglio = <b>VITTORIA</b>.', BODY),
        Paragraph('• <b>M. E LA CANDIDATA.</b> M. (umano, Att 2/Fer 5/Danno 1) non è l’obiettivo: '
                  'finché è in piedi con la sua voce, accelera il risveglio. Neutralizzarlo, o aver '
                  '<b>salvato la Candidata</b> (fase del coro, T4-T5) togliendogli la voce che crede, '
                  'rallenta il risveglio. Ma la vittoria resta il <b>controcanto</b>, non la sua '
                  'morte. <b>Esche:</b> la Chiave del Coro e il Grimorio del Rito cantano il '
                  'risveglio — aiutano M.', BODY)])
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
                  'regola delle taglie sul boss: la camera non ha Ferite. FUORI SCALA: il finale può '
                  'perdere eroi, e può finire male (il risveglio).', BODY)])
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
        c.showPage()

    pagina('soluzione — non aprire (il finale)', [
        '<b>Stampate questo fascicolo senza leggerlo e sigillatelo in una busta.</b> Apritelo '
        'solo dopo aver risposto per iscritto alle 4 Domande.',
        '<b>Il caso.</b> Le maree di sizigia sono tornate. Una notte sola: l’ora, la via delle tre '
        'acque, la voce che M. cerca, il controcanto. Poi la discesa nella gola della città.',
        '<b>La verità.</b> M. ha un coro comprato (canta senza fede); gli manca una voce che creda '
        'per il Quarto Movimento, e la cerca. Il Dormiente è inquieto: va rimesso a dormire col '
        'CONTROCANTO del Fascicolo del 1741, cantato coi Frammenti (metà erano il canto del sonno, '
        'metà smascheravano M.). Non si vince uccidendo: cantando giusto prima del risveglio.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. QUANDO?</b> All’ora del picco delle maree di sizigia (gli ossari L2 + il calendario '
        'dei Padri L4: serve più di una conferma). <i>Esatta:</i> scendete all’ora giusta — nel 1° '
        'round della discesa non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> arrivate '
        'scomposti — il Canto (risveglio) parte da 1.',
        '<b>2. DOVE?</b> La via delle tre acque, dalla Mappa Acustica (la Cattedrale L1 + la Taverna '
        'L3 + l’Archivio L4). <i>Esatta:</i> la Mappa guida la discesa (niente round persi nel buio; '
        'la città può suonare a favore). <i>Sbagliata:</i> la gola vi confonde (round persi).',
        '<b>3. CHI è l’ultima voce?</b> La candidata che il Coro insegue dall’Ep. 3 (i vecchi del '
        'Coro L5 + l’organo di ossa L6: serve più di una conferma). <i>Esatta:</i> sapete chi '
        'cercare nella fase del coro — salvatela e togliete a M. la sua voce (il risveglio '
        'rallenta). <i>Sbagliata:</i> M. la costringe, il risveglio accelera.',
        '<b>4. COME si fa dormire il Dormiente senza sogni?</b> Il CONTROCANTO del Fascicolo del '
        '1741, cantato coi Frammenti (metà erano il canto del sonno). <i>La deduzione finale:</i> '
        'contate i Frammenti conservati (1-19) — più ne avete, più righe di controcanto cantate per '
        'round. Aiuti: la Mappa Acustica, la Candidata Salvata. <i>Esche:</i> la Chiave del Coro e '
        'il Grimorio del Rito (cantano il RISVEGLIO — aiutano M.).',
        '<b>IL CONTROCANTO E I FRAMMENTI:</b> servono <b>10 righe</b> di controcanto per vincere. Ogni '
        'round nella camera (T6) cantate <b>1 riga + 1 ogni 6 Frammenti conservati</b> (Mappa '
        'Acustica: +1). Ogni impiegato del coro in campo: −1 riga/round. Il Canto (risveglio) sale '
        'come sempre; alla <b>soglia-risveglio = Canto 8</b> il Dormiente si desta.',
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
        'Frammento 19). Qui salvate la Candidata (se avete la D3): toglie a M. la voce che crede, il '
        'risveglio rallenta.',
        '<b>Fase 3 — la camera (T6, il boss).</b> Non si colpisce: si canta. Ogni round completate '
        'righe di controcanto (ritmo = Frammenti + Mappa − coro residuo). Le fasi ambientali della '
        'camera fanno danno inevitabile a soglie di Canto (Canto 4: 1 danno a un eroe; Canto 6: 1 '
        'danno a due; Canto 7: prova NERVI a tutti o 1 danno). M. (umano) in piedi con la voce '
        'accelera il risveglio (+1 Canto/round); a terra, o senza la Candidata, no.',
        '<b>Vittoria e sconfitta.</b> Controcanto (10 righe) completo PRIMA del risveglio (Canto 8) = '
        '<b>VITTORIA</b> (il Dormiente torna al sonno senza sogni). Risveglio (Canto 8) prima = '
        '<b>SCONFITTA</b> (il dio si desta — vedi epilogo). FUORI SCALA: le fasi ambientali possono '
        'far cadere eroi, e il finale può finire male. <b>Il mazzo:</b> 21 carte (7 coro, 6 insidie '
        'di discesa/camera, 4 crescendo-risveglio, 4 eventi).',
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
        '<b>FRAMMENTO DI CAMPAGNA N. 20:</b> l’<i>ultima riga del controcanto</i>, che si compone '
        'solo con tutti gli altri diciannove — metà erano il canto del sonno (M. li voleva), metà la '
        'sua firma (non l’ha mai saputo). <b>Migliorie finali</b> e <b>commiato dei PNG</b> secondo '
        'i Bivi. <b>NIENTE Bivio: è la fine.</b> L’ultima riga del Taccuino resta <b>bianca</b>.',
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
    1: "La Cattedrale, la bocca dell'ultima discesa: oltre la cripta dove "
       "fermaste Ferri, la pietra dà sull'acqua e le maree di sizigia salgono "
       "verso il picco. Non un luogo da indagare: una porta da attraversare, "
       "coi Frammenti in pugno.",
    2: "Gli ossari tra le barche morte, dove i vecchi leggono le maree: sanno "
       "l'ora esatta del picco, la finestra breve in cui la gola si apre. E "
       "ricordano il Coro dall'inizio, e la voce che insegue dal principio.",
    3: "La Taverna della Chiatta, il rifugio, l'ultima volta: qui la Società "
       "(e Vidal, se convinto) vi arma di tutto ciò che venti serate hanno "
       "messo da parte — la mappa acustica, il Fascicolo, i Frammenti. Il "
       "pay-off finale, ridotto a un canto e agli amici.",
    4: "L'Archivio del 1741: il Fascicolo aperto sulla riga finale del "
       "controcanto, il calendario dei Padri. Qui i venti Frammenti si "
       "dividono in due metà — il canto del sonno che M. voleva, e la sua "
       "firma che non ha mai saputo di avervi dato.",
    5: "I vecchi del Coro, tra le ossa, sanno chi è l'ultima voce: la candidata "
       "che il Coro insegue dall'Ep. 3, l'unica che M. non può comprare. "
       "Salvarla gli lascia un coro senza anima — un rumore, non un risveglio.",
    6: "Ciò che resta dell'organo di ossa nella chiesa dei Battuti: le "
       "canne-voce, la melodia, il campanello — secondo i vostri Bivi. Lo "
       "strumento con cui il Coro chiamava la voce: cantano il risveglio o il "
       "sonno, secondo la mano che li suona.",
    7: "La camera dove il Coro provava il Quarto Movimento: sul leggìo, una "
       "chiave che pare aprire la camera del Dormiente. È l'ultima esca di M.: "
       "apre l'estasi, non il sonno. Non c'è una scorciatoia per cantare un "
       "dio a dormire.",
    8: "Lo scriptorium col grimorio del Quarto Movimento: lo spartito del rito, "
       "affascinante e mortale. È la partitura del risveglio, non del sonno: "
       "chi lo canta, canta per M. Il vostro controcanto non è in un libro — "
       "è nei Frammenti di venti serate.",
    9: "La gola della città, oltre il punto dove fermaste Ferri: la pietra dà "
       "sull'acqua, l'acqua sul buio, e nel buio un dio sogna piano. Non un "
       "mostro da colpire: un dio da cantare a dormire, col controcanto e i "
       "Frammenti, più giusto di M.",
}

OGGETTI_LUOGO_20 = {
    4: ['I Frammenti del Controcanto'],
    5: ['La Candidata Salvata'],
    3: ['La Mappa Acustica Attiva'],
    7: ['La Chiave del Coro'],
    8: ['Il Grimorio del Rito'],
}

TILE_ART_20 = {t['id']: t['id'] + '-ep20.png' for t in TILES_20}
LUOGHI20_CROP = {}

TESSERE_DESC_20 = {
    'T1': "Oltre la cripta dove fermaste Ferri, una scala scende nel buio verso "
          "l'acqua che sale gradino dopo gradino. In basso, un respiro lento e "
          "immenso che non è il vostro: il Dormiente. La finestra delle maree è "
          "breve — scendete.",
    'T2': "Il punto dove tre correnti si incontrano nel buio della gola: una "
          "dolce, una salata, una morta. Solo un passaggio è quello giusto; le "
          "altre due vi rubano il tempo o vi trascinano. L'eco, qui, mente.",
    'T3': "Il cuore della gola: la pietra stessa pulsa piano, viva, al respiro "
          "del dio, e un canto immenso e sordo comincia a filtrare fra le "
          "giunture della roccia. Reggetevi la mente: oltre, c'è la camera.",
    'T4': "L'antecamera, dove il coro a pagamento canta lo spartito senza "
          "crederci, gli occhi impauriti, le voci prezzolate e stonate. Non "
          "credono a una nota — e per questo si spezzano. Cercate, tra loro, "
          "l'unica che invece crede.",
    'T5': "La soglia della camera del Dormiente: il coro fa l'ultima resistenza, "
          "e oltre, nel chiarore che non è luce, la candidata e M. È l'ultima "
          "occasione di salvarla, prima che lui la costringa a cantare il "
          "quarto rigo.",
    'T6': "La camera, oltre ogni mappa: il Dormiente respira nel buio come un "
          "mare capovolto, M. canta il quarto rigo con la disperazione di chi "
          "ha giocato tutto, e voi alzate la voce contro di lui. Non una lama: "
          "una canzone. L'ultima riga, roca e umana, contro il canto di un dio.",
}

ESAMI_CARBONE_20 = {
    'I FRAMMENTI DEL CONTROCANTO': '«Messi in fila tutti e venti, i Frammenti si dividono in due: '
                'metà sono righe di un canto che spegne, metà erano la firma di chi vi ha ingannati. '
                'M. voleva le prime e vi ha usati per raccoglierle; non ha mai saputo che '
                'raccoglievate anche le seconde. Ora cantate le prime, e ricordate le seconde.»',
    'LA VOCE CHE CREDE': '«Il Quarto Movimento non lo canta un coro comprato: lo canta un cuore che '
                'crede. È l’unica cosa che il denaro di M. non ha potuto comprare, e la sua unica '
                'speranza è costringerla. Salvatela, e M. avrà un coro senza anima: un rumore, non '
                'un risveglio.»',
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
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_20.get(n, [])]

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
