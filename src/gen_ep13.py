# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 13: Carta di pregio (Episodio 13/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-13.md e CAMPAGNA-EPISODI.md). Apertura
Atto III, mythology: la caccia a C.B. comincia dalla carta di pregio — un solo
Molino delle Carte, due ore fuori città. La filiera è amministrata dal Notaio
Rasca (l'uomo del «benefattore» dell'Ep. 4): compare e SFUGGE (ricorrente
dell'Atto). Spedizione: il Molino di notte (rogge, macine, magazzini di
stracci), per SALVARE i registri dei noli prima che brucino. Boss: il
Sorvegliante del Molino. Un solo seme: il registro dei noli (carrozza condivisa
col Palazzo del Lume) firmato «C.B.».

Varietà strutturale (regola 2026-07-18): il vero antagonista (il Notaio)
sfugge per copione; si SEQUESTRA la prova e poi si FUGGE dal molino di stracci
che brucia (rogo doom-clock a round: le fiamme scendono di piano in piano verso
l'uscita, gli sgherri fuggono, si corre coi registri fino a T1). Prima trasferta
fuori città (pericoli d'ambiente: roggia, macine, fuoco). Torsione d'indagine: «il
testimone che non c'è più» (il capo-catena annega: deposizione ricostruita).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 13.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 13', 'pdf')
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

LETTERA_13 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Di C.B. non ci resta un volto né una firma per esteso: ci resta la <i>carta</i>. "
    "Filigrana rara — un giglio spezzato, in controluce — che nessuna cartiera comune sa fare: "
    "in tutta la provincia la produce un <b>opificio solo</b>, e quale sia non ve lo so dire. "
    "Scopritelo voi. A Roccamora quella carta la comprano in tre; il garzone dei ritiri "
    "non ha mai visto un volto, «solo scatole». E il suo capo-catena — l’unico che sapeva a chi "
    "andavano le risme — è stato ripescato dal canale stamattina, annegato, la notte prima di "
    "parlarci.<br/><br/>"
    "Chi non lascia un nome lascia una carta. Risalite le risme fino a chi le fabbrica e "
    "portatemi i <b>registri dei noli</b>: chi paga il trasporto, e quando. E badate al "
    "capo-catena: i morti non depongono, ma lasciano il <b>calco</b> di ciò che sapevano — "
    "ricostruitelo. Avete <b>6 ore</b>, dalle 18:00 alle 24:00, e non una di più: stanotte, là "
    "dove quella carta nasce, qualcuno la vuole in cenere.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<font name=\"OldStd-Italic\"><i>Luoghi disponibili dall’inizio: la Stazione delle Carrozze, lo studio del Notaio, "
    "l’Ufficio del Fermo-Posta e la Dogana Vecchia. Gli altri andranno sbloccati; uno di essi, "
    "il Luogo 9, è fuori città: dichiararlo costa 2 ore.</i></font>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «la carta col giglio» (L1+L3), «il nolo puntuale» (L1+L2),
# «il capo-catena annegato» (L2+L4), «il molino fuori porta» (L3+L4).
# Rivelatorio (D2) su L1, L2, L4.
LUOGHI_13 = [
    dict(n=1, nome='LA STAZIONE DELLE CARROZZE', voce_mappa='La Stazione delle Carrozze',
         req='Disponibile dall’inizio', art='La Stazione delle Carrozze.png',
         chiude=None,
         indizi=[
             'Il garzone dei ritiri è un ragazzo di strada spaventato: «io porto le scatole, '
             'signori, non guardo in faccia nessuno. Ritiro qui, consegno là, mi pagano. Le '
             'risme di carta buona — quella col giglio nella filigrana — arrivano dal molino '
             'fuori porta e ripartono col nolo. La carta col giglio la riconosco a occhi chiusi.»',
             'Sul quadro dei noli, uno parte sempre alla stessa ora, pagato in anticipo, '
             'puntualissimo: «il nolo puntuale, lo chiamiamo. Non salta mai. Il capo-catena '
             'diceva che quel nolo valeva più di tutti gli altri messi insieme.»',
             'Il capostazione, sottovoce: «il capo-catena l’hanno tirato su dal canale stamattina. '
             'Annegato, dicono. Ma sapeva nuotare come un pesce, e la notte prima aveva chiesto '
             'di parlare a qualcuno di importante. Il capo-catena annegato non è un incidente, '
             'signori.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il capostazione',
                  testo='«Ve lo dico perché ho paura anch’io: quel nolo puntuale lo intesta '
                        'sempre lo stesso studio, quello del Notaio Rasca. Carta in regola, '
                        'bolli a posto, paga prima. E il capo-catena, buon’anima, s’era messo a '
                        'cronometrare quella carrozza come si cronometra un treno: l’ora di '
                        'partenza, le soste, il ritorno. Diceva che certe notti fa una fermata in '
                        'più, al Palazzo del Lume. I vetturini alzano le spalle — comodità del '
                        'giro, dicono, si è sempre fatta così. Lui però continuava a segnarla.»'),
         ]),
    dict(n=2, nome='LO STUDIO DEL NOTAIO', voce_mappa='Lo Studio del Notaio',
         req='Disponibile dall’inizio', art='Lo Studio del Notaio.png',
         chiude=None,
         indizi=[
             'Il Notaio Ludovico Rasca è cortese, impeccabile, impenetrabile: «il nolo della '
             'carta? Un incarico come tanti, signori. Intesto, protocollo, pago per conto di un '
             'cliente riservato. La riservatezza è il mio mestiere. Il nolo puntuale è solo buona '
             'amministrazione.» Sorride, e non dice un nome.',
             'Sulla scrivania, il suo timbro di studio, quello che finisce su ogni bolla. '
             'Rasca lo lascia prendere senza battere ciglio: sa che non prova nulla.',
             'Un praticante, quando Rasca esce, bisbiglia: «il capo-catena annegato era venuto '
             'qui ieri. Ha litigato col Notaio a porte chiuse. Stanotte era '
             'morto. Io non ho visto niente, chiaro? Ma quell’uomo sapeva qualcosa, e il Notaio '
             'lo sapeva sapere.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La cortesia del Notaio',
                  testo='Rasca non commette errori: ogni carta è in regola, ogni bollo al suo '
                        'posto, ogni pagamento tracciato e puntuale. È proprio la perfezione a '
                        'tradirlo — nessun cliente onesto è così invisibile. È l’uomo del '
                        '«benefattore che ama la lirica» dell’inverno scorso: il legale che dà un '
                        'indirizzo di carta a chi non vuole un volto. E non è la prima maschera '
                        'di carta che vi passa davanti: la società anonima del quartiere sordo — '
                        '«La Quiete S.A.» — nessun dipendente, sede presso uno studio '
                        'notarile — era tagliata così. Chi intestava allora e chi intesta '
                        'adesso esce dalla stessa specie di mano. '
                        'Non lo prenderete stanotte; ma sapere che è lui a tenere la penna '
                        'del nolo è metà della caccia.'),
         ]),
    dict(n=3, nome='L’UFFICIO DEL FERMO-POSTA', voce_mappa='L’Ufficio del Fermo-Posta',
         req='Disponibile dall’inizio', art='L’Ufficio del Fermo-Posta.png',
         chiude=None,
         indizi=[
             'Lo sportello del fermo-posta è uno dei tre che comprano la carta col giglio: «sì, '
             'ne arriva una risma ogni tanto, per una casella riservata. La carta col giglio '
             'costa un occhio: la compra solo chi ha da scrivere cose che devono sembrare '
             'importanti. O autentiche.»',
             'Il registro dei ritiri segna la provenienza: sempre il molino fuori porta, sempre '
             'lo stesso nolo. «Il molino fuori porta è l’unico che fa quella filigrana in tutta '
             'la provincia. Due ore di carrozza. Chi vuole quella carta, la fa venire da lì.»',
             'L’impiegato ricorda il capo-catena: «veniva a controllare le consegne di persona, '
             'ultimamente. Nervoso. Contava, segnava. Diceva che c’era una consegna che «non '
             'tornava coi conti». Poi non è più venuto.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I tre compratori',
                  testo='La carta col giglio, in città, la comprano in tre: il vescovado, la '
                        'Prefettura, e questa casella riservata. Due sono facciate rispettabili '
                        'che giustificano l’acquisto; la terza è il vero destinatario. Chi vuole '
                        'nascondere una carta la fa comprare anche da chi non ne ha bisogno: così '
                        'la sua non spicca. Il fermo-posta è la foglia nella foresta.'),
         ]),
    dict(n=4, nome='LA DOGANA VECCHIA', voce_mappa='La Dogana Vecchia',
         req='Disponibile dall’inizio', art='La Dogana Vecchia.png',
         chiude=None,
         indizi=[
             'Alla Dogana Vecchia passano le bolle di transito delle risme dal molino fuori '
             'porta: «carta di pregio, dazio pagato, tutto in regola. Il molino fuori porta '
             'spedisce qui, noi timbriamo, il nolo prosegue in città. Roba pulita. Troppo '
             'pulita, se mi chiedete.»',
             'Il doganiere ha conosciuto il morto: «il capo-catena annegato veniva a confrontare '
             'le bolle. Ne aveva copiata una, l’ultima, e se l’era messa in tasca. Diceva: “se '
             'mi succede qualcosa, guardate il nolo delle notti di luna nuova”. Poi è successo '
             'qualcosa.»',
             'Sul registro doganale, il nolo della carta e un altro nolo si sovrappongono certe '
             'notti: stessa carrozza, stessa ora. L’altro nolo è intestato a una sede nota. Il '
             'doganiere non l’ha voluto scrivere per esteso: «certe fermate è meglio non '
             'timbrarle.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il doganiere',
                  testo='«Ve lo metto a verbale perché ormai è morto lui e non io: il capo-catena '
                        'aveva preso a contare il nolo della carta ora per ora, notte per notte, '
                        'e sapeva a memoria quando parte e quando torna. Diceva anche che nelle '
                        'notti giuste la carrozza fa una fermata in più prima di lasciare la '
                        'città, al Palazzo del Lume. Che cosa ci vada a fare non me l’ha spiegato '
                        'e io non gliel’ho chiesto; il vetturino giura che di là la strada è più '
                        'corta. So soltanto che è annegato per quello che aveva contato, non per '
                        'quello che aveva rubato.»'),
         ]),
    dict(n=5, nome='LA CASA DEL CAPO-CATENA', voce_mappa='La Casa del Capo-Catena',
         req='La casa del morto è sigillata dai gendarmi, e si apre solo a chi sa perché è morto '
             '— la parola che tutti dicono a bassa voce, l’annegato che sapeva nuotare.',
         chiave=('parola', 'IL CAPO-CATENA ANNEGATO'), art='La Casa del Capo-Catena.png',
         chiude=None,
         indizi=[
             'La stanza di un uomo che aveva cominciato a contare: fogli ovunque, colonne di '
             'date e di noli, un mezzo diario. Nessuna confessione — un calcolo. Ricostruire '
             'ciò che sapeva è come farlo deporre da morto.',
             'In fondo al taccuino, una riga sola sottolineata due volte: l’ora esatta in cui, '
             'ogni settimana, parte il nolo della carta — e accanto, in una sigla che non '
             'appartiene a nessun registro, l’appunto di una seconda fermata. Sapeva di valere '
             'quella riga. È annegato per quella riga, e nessuno di voi, stanotte, riesce a '
             'leggerla per intero.',
             'Tra le carte, gli orari del molino annotati di suo pugno: i turni della guardia, '
             'l’ora in cui il Sorvegliante fa il giro, quando i magazzini restano scoperti. '
             'Voleva entrarci, o voleva vendere il modo di entrarci. Adesso quegli orari valgono '
             'a voi.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La deposizione mai resa',
                  testo='A leggere i suoi fogli nell’ordine giusto, la voce del capo-catena torna '
                        'come da sotto l’acqua: non un fantasma, il calco di una testimonianza '
                        'che nessuno ha raccolto in tempo. Vi dice tre cose — a che ora parte il '
                        'nolo della carta; a che ora, stanotte, daranno fuoco ai registri; e per '
                        'dove passa la guardia. È tutto quello che sarebbe morto in tribunale, se '
                        'fosse arrivato vivo. Fatelo arrivare voi. Una quarta cosa l’ha scritta e '
                        'non l’ha spiegata — quella fermata in più, segnata e mai sciolta: resta '
                        'sulla pagina come un chiodo, e stanotte non vi serve.'),
         ]),
    dict(n=6, nome='LA CANCELLERIA VESCOVILE', voce_mappa='La Cancelleria Vescovile',
         req='La cancelleria del vescovado riceve solo chi sa nominare la merce che vi si compra '
             'a caro prezzo: la carta pregiata col segno del giglio.',
         chiave=('parola', 'LA CARTA COL GIGLIO'), art='La Cancelleria Vescovile.png',
         chiude=None,
         indizi=[
             'Il cancelliere conferma l’acquisto della carta col giglio «per gli atti solenni '
             'della diocesi»: legittimo, tracciato, innocente. È uno dei tre compratori di '
             'facciata — quello che rende normale un acquisto altrimenti sospetto.',
             'Tra le pratiche, una lettera di raccomandazione mai spedita, che accredita un '
             'certo signore presso «ambienti che contano».',
             'Il cancelliere, prudente: «se cercate chi compra quella carta per ragioni meno '
             'sante, non guardate noi. Guardate chi la compra <i>senza averne bisogno</i>. Noi '
             'ne abbiamo bisogno per forza: siamo la Chiesa. Gli altri no.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il compratore di facciata',
                  testo='Il vescovado compra la carta col giglio alla luce del sole, per atti che '
                        'la richiedono davvero: è la copertura perfetta, e involontaria. Finché '
                        'esistono compratori legittimi, il compratore illegittimo non spicca. '
                        'Rasca ha scelto bene la sua foresta: tre alberi identici, e solo uno '
                        'nasconde il nido.'),
         ]),
    dict(n=7, nome='LA PREFETTURA', voce_mappa='La Prefettura',
         req='La Prefettura apre i suoi registri solo a chi sa del trasporto che non salta mai: '
             'il nolo pagato in anticipo, sempre in orario.',
         chiave=('parola', 'IL NOLO PUNTUALE'), art='La Prefettura.png',
         chiude=None,
         indizi=[
             'L’archivio dei noli della Prefettura tiene i registri di tutti i trasporti '
             'autorizzati: il nolo della carta col giglio c’è, puntuale da anni. È qui che il '
             'calcolo del capo-catena trova conferma. Ad aprirvi i cassettoni è il decano '
             'Ferrante, il più anziano della Società, che ne tiene i libri da trent’anni e ha '
             'la firma buona per farsi dare un faldone: siede, si bagna il pollice e comincia a '
             'spuntare colonne come se fossero le sue.',
             'Incrociando il registro con gli appunti del morto, la riga sottolineata si legge '
             'per intero: sessant’anni di forniture allo stesso conto, intestato a un professore '
             'collezionista, iniziali C.B. — sessant’anni, cioè più di quanti un uomo possa averne '
             'passati a comprar carta — e, in coda alla colonna, quella fermata in più che '
             'nessuno ha mai spiegato. Il SEME della caccia.',
             'Un funzionario, a disagio: «quel nolo lo abbiamo sempre autorizzato senza fiatare: '
             'carte perfette, cliente d’antica famiglia. Nessuno ha mai chiesto perché un '
             'professore di lettere avesse bisogno di tanta carta di pregio, né chi si presenti a '
             'firmare per lui: al banco viene sempre uno studio, mai lui. Nessuno tranne un '
             'capo-catena, e guardate com’è finito.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il registro dei noli',
                  testo='Sessant’anni di forniture allo stesso conto, pagate al '
                        'centesimo e sempre in orario, intestate con due iniziali: «C.B.». '
                        'Sessant’anni, però, sono più di una vita di acquisti: chi ha aperto quel '
                        'conto non può essere lo stesso che lo paga stanotte. Un’intestazione che '
                        'sopravvive a chi la porta non è un cliente, è una casella — la stessa '
                        'specie di maschera del «benefattore che ama la lirica» e della «Quiete '
                        'S.A.». Il professore collezionista può benissimo essere il nome scritto '
                        'sulla casella e non la mano che paga; il registro non distingue le due '
                        'cose, e non è tenuto a farlo. E il '
                        'nolo parte con la carrozza che, certe notti, serve anche il Palazzo del '
                        'Lume. Perché lo faccia, il registro non lo dice: segna l’ora, il '
                        'vetturino, il prezzo, e nient’altro; e i vetturini giurano che di là il '
                        'giro è più corto. Copiate piuttosto l’ora di partenza — è la stessa riga '
                        'che il capo-catena aveva sottolineato, e stanotte vi serve. Il decano '
                        'Ferrante non commenta: ricopia l’ora sul suo taccuino e, sotto, la '
                        'fermata che non torna. «Una comodità del giro che si ripete sempre nelle '
                        'stesse notti non è più una comodità», dice, e si rimette il taccuino in '
                        'tasca.'),
         ]),
    dict(n=8, nome='IL DEPOSITO DELLE RISME', voce_mappa='Il Deposito delle Risme',
         req='Il deposito dove arrivano le risme è chiuso a quest’ora, e apre solo a chi sa da '
             'dove vengono: l’opificio fuori le mura che fa la filigrana.',
         chiave=('parola', 'IL MOLINO FUORI PORTA'), art='Il Deposito delle Risme.png',
         chiude=20,
         indizi=[
             'Il deposito in città riceve le risme dal molino fuori porta e le smista ai tre '
             'compratori. Le bolle dicono tutto: quantità, date, nolo prepagato. Il molino '
             'fuori porta è il collo di bottiglia della filiera.',
             'In un armadio, una cassetta di latta stagna, di quelle che i notai usano per i '
             'documenti che devono sopravvivere a tutto. «Al molino ci sono acqua e stracci: '
             'se volete portar via delle carte sane, mettetele lì dentro.»',
             'Il magazziniere avverte: «stanotte al molino c’è aria strana. È passato un signore '
             'in carrozza, elegante, ha parlato col Sorvegliante e se n’è andato. Poco dopo hanno '
             'cominciato a portare stracci verso la sala del torchio. Stracci vicino ai '
             'registri: a me pare che qualcuno voglia un incendio.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La cassetta stagna',
                  testo='La cassetta di latta è a doppia parete, guarnizione di sughero: tiene '
                        'fuori l’acqua e regge le fiamme il tempo di attraversare una stanza in '
                        'fiamme. In un molino di stracci pronto a bruciare, è la differenza tra '
                        'portare a casa i registri e portare a casa la cenere. Riempitela al '
                        'torchio, chiudetela, e uscite: dentro, la prova è al sicuro.'),
         ]),
    dict(n=9, nome='IL MOLINO DELLE CARTE', voce_mappa='Il Molino delle Carte',
         req='Il molino è due ore fuori città, e non ci si arriva per caso: ci si va sapendo che '
             'è lì che nasce la carta col giglio, dietro le mura, sull’acqua.',
         chiave=('parola', 'LA CARTA COL GIGLIO'), art='Il Molino delle Carte.png',
         chiude=None, fuori_citta=True,
         indizi=[
             'Il Molino delle Carte, sull’acqua, fuori le mura: rogge, la grande macina, i '
             'magazzini di stracci per la pasta di carta. È qui che si fa la filigrana col '
             'giglio, e qui finiranno i registri dei noli — se non li salvate prima del fuoco.',
             'Contro la luce di una lanterna, un foglio della filigrana: il giglio spezzato, '
             'identico alla carta di ogni caso della campagna. Non una cartiera che vende a '
             'tanti: un’unica risma tagliata per una penna sola.',
             'Nel cortile, la carrozza del Notaio con i cavalli già pronti alla fuga, e il '
             'Sorvegliante che dà ordini agli uomini del molino. Dentro, verso il torchio, la '
             'cassaforte dei registri — e attorno, stracci ammonticchiati come per un rogo.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La carta che aspetta la fiamma',
                  testo='Nel molino silenzioso, la macina gira ancora piano e l’acqua della '
                        'roggia parla da sola. Tra i telai coi fogli appesi ad asciugare, per un '
                        'istante, pare di sentire il fruscio di sessant’anni di carta scritta con '
                        'la stessa mano: lettere, ordini, sentenze del Coro, tutto uscito da '
                        'questa filigrana. Stanotte qualcuno vuole ridurla in cenere prima che la '
                        'leggiate. Arrivate al torchio, prendete i registri, e non guardate il '
                        'fuoco: guardate la porta.'),
         ]),
]

# Tessere del molino (percorso lineare a 6: un opificio, non un labirinto).
# Obiettivo = prendere i registri (Interagire a T6) e RIPORTARLI all'uscita (T1)
# mentre il ROGO (doom-clock a round: T5@7 T6@9, poi scende T4@12 T3@14 T2@16
# T1@18) scende a inseguirvi. Presi i registri gli sgherri fuggono. Boss: il
# Sorvegliante (guarda il torchio). Il Notaio appare (T4), ordina il rogo e fugge.
TILES_13 = [
    dict(id='T1', nome='IL CORTILE DEL MOLINO', exits={'N': 'T2'}, start='S',
         testo='Il cortile del Molino delle Carte, di notte: la carrozza del Notaio coi cavalli '
               'pronti, gli uomini del molino di guardia. QUANDO RIVELATE QUESTA TESSERA: '
               'applicate l’esito delle Domande 3 e 4. Col Lasciapassare del Nolo entrate come '
               'gente del trasporto e saltate lo sbarramento del cortile (e la sua guardia).',
         arbitro='SBARRAMENTO: senza il Lasciapassare del Nolo, 2 uomini del molino (Sgherri) '
                 'bloccano il cancello. Col Lasciapassare passate senza combattere. Da qui in '
                 'poi il pericolo non sono solo gli uomini: è l’acqua, gli ingranaggi, il fuoco.',
         hook='Il Lasciapassare del Nolo (dalla Stazione): entrate come gente del trasporto, '
              'niente sbarramento.',
         cerca_vuoto='Solo la carrozza che aspetta e il fiato dei cavalli nel freddo. '
                     'Finimenti lucidi, cassetta chiusa a chiave: niente lasciato in '
                     'vista.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA ROGGIA', exits={'S': 'T1', 'N': 'T3'},
         testo='Il canale di adduzione che muove la macina: acqua nera e veloce, passerelle di '
               'assi scivolose sopra la corrente. QUANDO RIVELATE QUESTA TESSERA: pericolo '
               'd’ambiente — chi attraversa prova VIGORE (Media); chi fallisce '
               'scivola in acqua e la corrente lo trascina (1 round perso a risalire).',
         arbitro='PERICOLO D’AMBIENTE (roggia): non ci sono nemici stanziali, c’è l’acqua. Prova '
                 'VIGORE per la passerella. Con il Taccuino del Capo-Catena sapete dove '
                 'l’asse regge: prova a Facile.',
         cerca_vuoto='Assi bagnate e il rombo della macina più avanti. La corrente ha '
                     'lavato la passerella fino al legno vivo: non ci si è fermato '
                     'niente.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA SALA DELLE MACINE', exits={'S': 'T2', 'N': 'T4'},
         testo='La grande ruota e le macine che pestano gli stracci, in moto: ingranaggi, cinghie, '
               'un frastuono che copre le voci. QUANDO RIVELATE QUESTA TESSERA: gli uomini del '
               'molino sono qui, e le macine mordono chi si distrae (insidia NERVI Media).',
         arbitro='Gli ingranaggi sono un pericolo d’ambiente oltre ai nemici: chi combatte '
                 'addosso alle macine rischia (prova NERVI Media se spinto contro gli '
                 'ingranaggi). Passare in fretta è meglio che fermarsi a combattere.',
         cerca='In un ripostiglio, un secchio d’acqua e sabbia (utile in fuga: chi lo porta '
               'rimanda di 1 round l’accensione della tessera in cui si trova).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='I MAGAZZINI DI STRACCI', exits={'S': 'T3', 'N': 'T5'},
         testo='Montagne di stracci per la pasta di carta, polvere infiammabile sospesa nell’aria. '
               'QUANDO RIVELATE QUESTA TESSERA: appare IL NOTAIO, elegante e calmo: l’ordine di '
               'dar fuoco ai registri l’ha già dato — dal fondo del molino sale il fumo — e si '
               'avvia alla carrozza. L’orologio del ROGO corre da quando siete entrati: le fiamme '
               'scattano ai round segnati, qualunque cosa facciate.',
         arbitro='IL NOTAIO (nemico minore) NON combatte: alla fine del round successivo alla sua '
                 'comparsa, fugge in carrozza (rimosso). Se lo inseguite invece di puntare ai '
                 'registri, perdete round preziosi mentre il fuoco monta. Il rogo è un orologio di '
                 'ROUND che corre dal 1° round della Spedizione, che questa tessera sia stata '
                 'rivelata o no (schedule nella Soluzione): l’essiccatoio (T5) e il torchio (T6) '
                 'prendono per primi, poi le fiamme SCENDONO di piano in piano verso l’uscita. Se '
                 'il gruppo arriva qui a fuoco già acceso, il Notaio se ne sta andando: non dà '
                 'l’ordine, l’ha dato prima.',
         hook='Il Taccuino del Capo-Catena (dalla sua casa): sapete l’ora del rogo — tutto '
              'l’orologio del rogo slitta di 2 round (ogni soglia; la tabella slittata è nella '
              'Soluzione), e arrivate col fuoco ancora lontano. NON si somma alla Domanda 3 '
              'esatta: è lo stesso vantaggio, 2 round in tutto, mai 4.',
         cerca_vuoto='Stracci fino al soffitto, odore di petrolio, polvere che vi resta '
                     'in gola. Fra le balle non si distingue una cosa dall’altra, e '
                     'nessuna vale il tempo che costa.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='L’ESSICCATOIO', exits={'S': 'T4', 'N': 'T6'},
         testo='Un labirinto di telai coi fogli appesi ad asciugare, carta ovunque, corridoi '
               'stretti di carta pendente. QUANDO RIVELATE QUESTA TESSERA: il Sorvegliante '
               'schiera i suoi uomini tra i telai; quando il rogo arriva qui, i fogli appesi '
               'prendono in fretta.',
         arbitro='Ultimo diaframma prima del torchio. L’essiccatoio prende fuoco al ROUND 7 '
                 '(schedule del rogo): da lì chi vi termina il round si brucia (−1 Salute). In '
                 'fuga lo riattraverserete in fiamme — il secchio (da T3) rimanda di 1 round '
                 'l’accensione della tessera in cui si trova.',
         cerca_vuoto='Fogli come lenzuoli nel buio, ancora umidi di colla. Tutto quello '
                     'che pende da questi telai è carta bianca: non una riga scritta, '
                     'da nessuna parte.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA SALA DEL TORCHIO', exits={'S': 'T5'},
         testo='Il grande torchio e la cassaforte dei registri, attorniata di stracci pronti al '
               'rogo. IL SORVEGLIANTE è qui, tra voi e la prova. QUANDO RIVELATE QUESTA TESSERA: '
               'strappate i registri, e nell’istante in cui li avete il fuoco che già corre '
               'trova gli stracci: la vampata caccia gli uomini, e comincia la corsa per uscire.',
         arbitro='OBIETTIVO. Interagire alla cassaforte prende i registri. Appena presi, TUTTI gli '
                 'sgherri (Sorvegliante compreso) fuggono dalle fiamme: toglieteli dal campo. Poi '
                 'i registri vanno RIPORTATI all’uscita (T1). Presi PRIMA che il torchio prenda '
                 '(round 9), o con la Cassetta Stagna: vittoria PIENA. Presi col torchio già in '
                 'fiamme e senza Cassetta: anneriti, vittoria PARZIALE. Il Sorvegliante va superato/'
                 'abbattuto per arrivare alla cassaforte; «Il nome del Notaio» (D2) gli fa saltare '
                 'un attacco.',
         cerca_vuoto='Attorno al torchio, solo stracci accatastati e barattoli '
                     'd’inchiostro. Il resto della sala è già stato svuotato di tutto '
                     'ciò che si poteva portare via.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_13 = [
    dict(nome='IL SORVEGLIANTE DEL MOLINO', att=3, dif=8, fer=6, mov=3, dan=2, boss=True,
         tipo='Il Guardiano della Filiera (Boss)', art='Il Sorvegliante del Molino.png',
         note='Nessuna debolezza-oggetto (è un uomo). «Il nome del Notaio» (D2 esatta): sapere '
              'che Rasca è già scappato e lo lascia a prendersi le accuse lo fa esitare — salta '
              'un attacco. Guarda il torchio: va superato o abbattuto per prendere i registri. '
              'Ai tavoli da 2-3 eroi non recupera mai Ferite (regola delle taglie).',
         bio_bestiario='Ezio Fonda è il capo della sicurezza della filiera della carta: un uomo '
              'pagato per sorvegliare un molino e non fare domande, che stanotte si ritrova a '
              'difendere un rogo che non ha deciso lui. Non è un cultista né un mostro: è un '
              'dipendente fedele a una busta paga, messo di guardia al torchio mentre il suo '
              'padrone — il Notaio Rasca — sale in carrozza e lo lascia solo a prendersi le '
              'accuse. Robusto e testardo (Fer 6, Danno 2), sbarra la strada ai registri con il '
              'corpo. Ma sa leggere una situazione: se gli gridate che Rasca è già fuggito e lo '
              'sta scaricando, qualcosa in lui cede — perché è vero, e lo sa. Ai tavoli da 2-3 '
              'eroi non recupera mai ferite (regola delle taglie). Non è il vero nemico: è la '
              'porta chiusa davanti al vero nemico, che intanto scappa.'),
    dict(nome='IL NOTAIO', att=1, dif=8, fer=3, mov=4, dan=1, boss=False,
         tipo='Il Ricorrente dell’Atto (non si prende)', art='Il Notaio.png',
         note='NON combatte. Appare in T4, ordina il rogo, e alla fine del round successivo fugge '
              'in carrozza (rimosso dal gioco): è il ricorrente dell’Atto III. Inseguirlo invece '
              'di puntare ai registri = round perso, il fuoco avanza.',
         bio_bestiario='Il Notaio Ludovico Rasca è l’uomo che dà un indirizzo di carta a chi non '
              'vuole un volto: intesta, protocolla, paga, e resta pulito. È l’esecutore legale di '
              'ogni scatola vuota della campagna, e stanotte è venuto di persona a far sparire i '
              'registri che lo legano a C.B. Non alza mai la voce e non impugna mai niente: dà un '
              'ordine e sale in carrozza. Non lo prenderete in questo episodio — è il ricorrente '
              'dell’Atto III, la mano guantata che vi scivola tra le dita ogni volta che credete '
              'di stringere. Chi lo insegue perde tempo e registri; chi lo lascia andare e salva '
              'la prova, invece, gli toglie l’unica cosa che gli serviva bruciasse.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 13 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 13')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'carta di pregio')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_13.replace(
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
    frame_top = H - (196 - 136)*mm
    frame_y = frame_top - lett_h
    delta = (H - 196*mm) - frame_y
    frame_flow(c, mx, frame_y, avail_w, lett_h, [cap_p, let_p])
    seal(c, W - mx - 12*mm, H - 211*mm - delta, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 24*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 12 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Stazione delle Carrozze, lo studio del Notaio, l’Ufficio del Fermo-Posta, la Dogana Vecchia.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 13')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). Il Luogo 9 è FUORI CITTÀ: dichiararlo costa 2 ore.')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Deposito Risme (8) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Luogo 9 fuori città: 2 ore')

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
    doms = ['1. DOVE si produce la carta di pregio? (attenzione: serve più di una conferma)',
            '2. CHI amministra la filiera?',
            '3. COSA SAPEVA il capo-catena annegato? (attenzione: serve più di una conferma)',
            '4. COSA portate alla Spedizione?']
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
    c.setTitle('Ombre su Roccamora - Episodio 13 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 13 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'il Molino delle Carte, prima che bruci')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '13/cards/</b>). Le 6 tessere del molino sono in <b>Episodio 13/board/</b>. '
                  'Questo NON è un inseguimento né una cattura: è un <b>colpo e una fuga</b>. '
                  'Salite fino al torchio (T6), strappate i <b>registri dei noli</b> — e nel '
                  'momento stesso in cui li prendete il Notaio dà fuoco al Molino: gli uomini '
                  'del molino FUGGONO, e il <b>ROGO scende di piano in piano</b> verso l’uscita. '
                  'Ora è una corsa: <b>riportate i registri fuori</b> (T1) prima che le fiamme '
                  'vi chiudano dentro. Il Notaio non si prende: ordina il rogo e fugge. Le pagine '
                  'seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>IL ROGO (doom-clock a round).</b> Non è legato al Canto: è un orologio '
                  'di <b>round</b> — le fiamme scattano ai round che la <b>Soluzione</b> indica, '
                  'qualunque cosa facciate. Partono in cima (essiccatoio T5, torchio T6) e '
                  '<b>SCENDONO di piano in piano</b> verso l’uscita (T4, T3, T2, T1). Chi termina '
                  'il round in una tessera in fiamme <b>si brucia (−1 Salute)</b>. La fuga è una '
                  'corsa contro il fuoco che vi insegue giù per il molino.', BODY),
        Paragraph('• <b>OBIETTIVO: prendere E portare fuori.</b> Al torchio (T6), Interagire prende '
                  'i <b>registri</b> — e nell’istante in cui li avete, gli stracci pronti al rogo '
                  'prendono (il fuoco correva già: non comincia qui, qui divampa) e gli '
                  'uomini del molino (Sorvegliante compreso) <b>fuggono dalle fiamme</b>. Poi '
                  'dovete <b>riportare i registri all’uscita (T1)</b>. Vittoria quando ci arrivate '
                  'vivi. Se li strappate <b>prima</b> che il torchio prenda, o avete la <b>Cassetta '
                  'Stagna</b>: prova intatta, <b>vittoria PIENA</b>. Presi col torchio già in fiamme '
                  'e senza cassetta: escono anneriti, <b>vittoria PARZIALE</b> (l’Atto prosegue).', BODY),
        Paragraph('• <b>IL NOTAIO NON SI PRENDE.</b> Ordina il rogo e fugge in carrozza: '
                  'inseguirlo = round perso mentre il fuoco scende. È il ricorrente dell’Atto: lo '
                  'rivedrete. <b>Ambiente:</b> la roggia (T2) trascina chi cade, le macine (T3) '
                  'mordono. Il <b>Lasciapassare del Nolo</b> salta lo sbarramento del cortile (T1) '
                  '— prezioso in uscita, con le fiamme alle spalle.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_13:
        art_file = TILE_ART_13[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_13[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_13.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 13</b>. In campo: gli <b>uomini del '
                  'molino</b> (Sgherri), <b>il Notaio</b> (nemico minore: ordina il rogo e fugge — '
                  'NON si prende) e <b>il Sorvegliante del Molino</b> (il boss: guarda il torchio, '
                  'T6). <b>Appena i registri sono presi, tutti fuggono dalle fiamme</b>: la fuga è '
                  'voi contro il rogo, non contro la truppa. Nessun mostro: il pericolo è l’acqua '
                  'della roggia, gli ingranaggi delle macine, e soprattutto il <b>fuoco</b> che '
                  'scende. Vittoria: i registri fuori dal Molino (T1). Ai tavoli da 2-3 eroi il '
                  'Sorvegliante <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_13())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_13():
    """Miniature dell'Episodio 13. I segnalini FUOCO si posano sulle TESSERE
    man mano che il rogo scende (round schedule nella Soluzione): marcano quali
    piani sono in fiamme durante la fuga. Il Canto si segna a parte, come sempre."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('UOMINI DEL MOLINO (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL SORVEGLIANTE · IL NOTAIO', [('Il Sorvegliante del Molino.png', 1),
                                         ('Il Notaio.png', 1)]),
        ('SEGNALINI FUOCO — sulle tessere in fiamme (rogo che scende)',
                             [('Odore di fumo.png', 1),
                              ('Il primo focolaio.png', 1),
                              ('I magazzini bruciano.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 13 - Soluzione (non aprire)')

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
        '<b>APERTURA — il Bivio dell’Episodio 12</b> (applicare PRIMA della lettera): il Bivio '
        'della talpa <b>non tocca questa serata</b> — non cambiate nulla al montaggio. Entrambi '
        'i rami si pagano più avanti, e vanno solo segnati sul Taccuino. Se avete scelto <b>DIRE '
        'A M. DELLA TALPA</b> — i PNG della Società restano uniti per tutto l’Atto III, ma la sua '
        'indagine interna «ripulisce»: un incrocio in meno alla deduzione d’atto dell’Episodio '
        '18. Se avete scelto <b>TACERE ANCHE A M.</b> — un incrocio in più all’Episodio 18, ma '
        'lo scisma dell’Episodio 17 costerà un PNG in più. Alla riga «Episodio 18» del Taccuino '
        'sommate anche l’esito di stanotte (vittoria parziale = un incrocio in meno).<br/>'
        '<b>CODA — il Bivio dell’Episodio 11</b> (retro del Frammento n. 11): quello sì che si '
        'applica stanotte, perché prometteva gli Episodi 12-13. Se avete <b>INFILTRATO LA '
        'SQUADRA</b> — il vostro uomo fra i topografi ha battuto la provincia palmo a palmo e sa '
        'dov’è l’unico opificio sull’acqua fuori le mura: <b>una conferma in più alla Domanda '
        '1</b> (il prezzo è già scritto e si paga all’Episodio 20). Se avete <b>PUBBLICATO LO '
        'SCANDALO</b> — il «filo in meno nell’Atto III» si spende qui, all’apertura dell’Atto, '
        'una volta sola: dopo i giornali nessun uomo in divisa mette più niente a verbale con '
        'voi. Rimuovete la Testimonianza «Il doganiere» (Luogo 4) dal mazzo Approfondimenti; la '
        'Domanda 2 resta raggiungibile con le altre due conferme (L1 e L2).<br/>'
        '<b>CODA — il Bivio dell’Episodio 8</b> (retro del Frammento n. 8): quel Bivio non '
        'nominava una serata, nominava un Atto — e l’Atto III comincia stanotte. Se avete '
        'scelto <b>SEQUESTRARE L’ORO</b> — la Vedova Bruna vi ha segnati, e da allora in città '
        'le braccia si affittano anche contro di voi: per la notte del rogo il Notaio ne ha '
        'comprato uno in più, e non gli è costato caro. <b>1 uomo del molino in più appare in '
        'T1</b> a inizio Spedizione (si somma, se c’è, a quello della Domanda 1 sbagliata). Non '
        'è gente del molino: è gente presa a giornata, e si vede da come tiene il bastone. Se '
        'avete scelto <b>LASCIARLO CIRCOLARE E TRACCIARLO</b> — le casse sono tornate a lei, '
        'marcate, e per lei il conto di quella notte è chiuso: <b>non applicate nulla</b>, '
        'stanotte i clan guardano da un’altra parte. In entrambi i rami il montaggio, l’orologio '
        'del rogo e le 4 Domande restano quelli.',
        '<b>Il caso.</b> La caccia a C.B. comincia dalla carta di pregio: filigrana rara, un solo '
        'Molino delle Carte fuori città. La filiera è amministrata dal Notaio Rasca. Il '
        'capo-catena dei ritiri, che sapeva troppo, è stato annegato la notte prima di parlare.',
        '<b>La verità.</b> Rasca intesta e paga i noli per conto di C.B.; il capo-catena aveva '
        'scoperto che la carta di C.B. viaggia sulla stessa carrozza che serve il Palazzo del '
        'Lume, e per questo è stato ucciso. <b>Questo lo sapete voi che arbitrate, non loro:</b> '
        'stanotte il gruppo ricostruisce solo la metà operativa della sua deposizione (ore e '
        'turni); la fermata in più resta un appunto non sciolto, e si scioglierà all’Episodio 18. '
        'Non anticipatela. Stanotte Rasca va al Molino a far bruciare i registri '
        'e fugge in carrozza. Sventare = SALVARE i registri dei noli prima del fuoco (Rasca non '
        'si prende: è il ricorrente dell’Atto).',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE si produce la carta di pregio?</b> Al Molino delle Carte, due ore fuori città '
        '(il registro dei ritiri al Fermo-Posta L3 + le bolle alla Dogana L4: serve più di una '
        'conferma, e sono due luoghi aperti dall’inizio. Il Deposito delle Risme NON conta come '
        'conferma: si apre pronunciando questa stessa risposta). <i>Esatta:</i> '
        'arrivate preparati — nel 1° round della spedizione non si pesca nessuna carta Minaccia. '
        '<i>Sbagliata:</i> perdete tempo a cercare il molino — 1 uomo del molino appare in T1.',
        '<b>2. CHI amministra la filiera?</b> Il Notaio Ludovico Rasca (la testimonianza del '
        'capostazione L1 + il referto dello studio L2 + il doganiere L4). <i>Esatta:</i> «Il nome '
        'del Notaio» — al torchio potete gridare al Sorvegliante che Rasca è già fuggito e lo '
        'scarica: gli fa saltare un attacco. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. COSA SAPEVA il capo-catena annegato?</b> L’ora del nolo e i turni della guardia al '
        'Molino: a che ora parte la carrozza della carta, e in quali ore i magazzini restano '
        'scoperti (i suoi appunti L5 + il registro dei noli L7, che si incrociano sulla stessa ora '
        'di partenza: serve più di una conferma). <i>Esatta (deposizione ricostruita, Taccuino):</i> '
        'conoscete l’ora del rogo e i turni della guardia — <b>tutto l’orologio del rogo slitta '
        'di 2 round</b>, ogni soglia compresa: <b>T5 al 9, T6 al 11, T4 al 14, T3 al 16, T2 al 18, '
        'T1 al 20</b> (arrivate col fuoco lontano, e anche la fuga ha più respiro). Le prove '
        'd’ambiente sono a Facile. <b>NON si cumula col Taccuino del Capo-Catena</b> (l’oggetto di '
        'L5 dà lo stesso identico vantaggio): chi ha tutt’e due slitta di <b>2 round in tutto, non '
        'di 4</b>, e le prove d’ambiente restano a Facile — quella qui sopra è l’unica tabella '
        'slittata che esista. <i>Sbagliata:</i> arrivate alla cieca, il rogo corre secondo '
        'la tabella base.',
        '<b>4. COSA portate alla Spedizione?</b> LA CASSETTA STAGNA (il Deposito delle Risme, entro le '
        '20). <i>Con la Cassetta:</i> i registri strappati al torchio sono SALVI dalle fiamme — '
        '<b>vittoria piena</b> anche col rogo già alto. <i>Senza:</i> presi col torchio in fiamme, '
        'escono anneriti (<b>vittoria parziale</b>). Aiuti: il Lasciapassare del Nolo (Stazione, '
        'salta lo sbarramento T1, prezioso in uscita), il Taccuino del Capo-Catena (ritarda il '
        'rogo). <i>Esche:</i> la Lettera di Raccomandazione e il Timbro del Notaio.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «Il '
        'capostazione» (L1), il Referto «La cortesia del Notaio» (L2) e la Testimonianza «Il '
        'doganiere» (L4). Senza nessuna, giudicate con elasticità una risposta «vicina» (es. «il '
        'notaio che intesta i noli»). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre. <b>NB trasferta (regola, non colore):</b> '
        'il Molino (L9) è FUORI CITTÀ e costa <b>2 ore</b>, non una — barrate <b>due</b> cerchi '
        'dell’orologio nel momento in cui il gruppo lo dichiara, che la dichiarazione sia giusta o '
        'sbagliata. Con una sola ora rimasta la trasferta non è dichiarabile. Le due ore contano '
        'come tali per lo Slancio e per i «6+ luoghi visitati»: molti tavoli lo lasciano alla '
        'Spedizione, ed è una scelta legittima.',
    ])
    pagina('spedizione — il molino che brucia', [
        '<b>Montaggio</b> (tessere in Episodio 13/board/, coperte tranne T1):<br/>'
        'T1 Cortile del Molino (partenza, da Sud) → T2 Roggia (pericolo acqua) → T3 Sala delle '
        'Macine (ingranaggi) → T4 Magazzini di Stracci (appare il Notaio, parte il fuoco) → T5 '
        'Essiccatoio → T6 Sala del Torchio (i registri). Col Lasciapassare del Nolo si salta lo '
        'sbarramento di T1.',
        '<b>Il Rogo (orologio di round).</b> Non è legato al Canto e non è legato alla comparsa '
        'del Notaio: si contano i <b>round dal 1° della Spedizione</b>, rivelata o no la tessera '
        'T4. Le fiamme scattano così, qualunque cosa facciate — <b>essiccatoio T5 al '
        'round 7, torchio T6 al round 9</b> (da qui i registri presi senza Cassetta escono '
        'anneriti), poi il fuoco SCENDE verso l’uscita: <b>T4 al round 12, T3 al 14, T2 al 16, '
        'T1 al 18</b>. Con la Domanda 3 esatta <i>oppure</i> col Taccuino (non con tutt’e due: è '
        'lo stesso vantaggio) vale la tabella slittata di 2 round della pagina precedente. '
        'Chi termina un round in una tessera in fiamme subisce <b>−1 Salute</b>. '
        'Posate un <b>segnalino Fuoco</b> su ogni tessera man mano che prende, così i giocatori '
        'vedono il rogo scendere. Non annunciate i round: fate solo scattare le fiamme quando tocca.',
        '<b>Pericoli d’ambiente.</b> Roggia (T2): prova VIGORE o si cade in acqua (1 '
        'round perso). Macine (T3): combattere addosso agli ingranaggi = prova NERVI o rischio. '
        'Col Taccuino del Capo-Catena <i>o</i> con la Domanda 3 esatta queste prove sono a Facile '
        '(conoscete il molino); averli entrambi non le rende più facili di così. Il secchio '
        'da T3 rimanda di 1 round l’accensione della sua tessera per chi lo porta.',
        '<b>Il Notaio.</b> Appare in T4, dà l’ordine di bruciare, e alla fine del round successivo '
        'fugge in carrozza (rimosso). NON combatte e NON si prende: è il ricorrente dell’Atto III. '
        'Inseguirlo = un round perso e il fuoco che avanza. Puntate ai registri.',
        '<b>Il Sorvegliante.</b> Boss: Att +3, Dif 8, Fer 6, Mov 3, Danno 2. Guarda il torchio: '
        'superatelo o abbattetelo per la cassaforte. Nessuna debolezza-oggetto. «Il nome del '
        'Notaio» (D2 esatta): saltare un attacco. Ai tavoli da 2-3 eroi non recupera ferite.',
        '<b>Vittoria: prendere E portare fuori.</b> Presi i registri (Interagire, T6), gli stracci '
        'attorno alla cassaforte prendono — <i>vampata, non accensione: l’orologio del rogo '
        'corre dal 1° round comunque</i> — e <b>tutti gli sgherri, Sorvegliante compreso, '
        'fuggono</b>: togliete i nemici '
        'dal campo. Poi il gruppo deve <b>riportare i registri all’uscita (T1)</b> scendendo tra '
        'le fiamme. Vittoria quando i vivi sono a T1 coi registri. Presi <b>prima</b> del round 9, '
        'o con la <b>Cassetta Stagna</b> = <b>vittoria piena</b> (prova intatta). Presi col torchio '
        'già in fiamme e senza cassetta = <b>vittoria parziale</b> (prova annerita: l’Atto prosegue, '
        'ma l’Ep. 18 avrà un incrocio più fragile). Gruppo intero a terra tra le fiamme = fuga '
        'fallita. <b>Il mazzo:</b> 21 carte (7 uomini del molino, 6 insidie d’ambiente, 4 '
        'crescendo-fuoco, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se salvate i registri.</b> «La Cassetta Stagna si '
        'chiude con uno scatto mentre alle vostre spalle i magazzini di stracci si accendono come '
        'una torcia. Fuori, la carrozza del Notaio è già una lanterna che rimpicciolisce sulla '
        'strada di città: Rasca non l’avete preso, e lo sapevate. Ma nella cassetta avete i noli, '
        'e i noli dicono quello che sanno dire: sessant’anni di carta pagata al centesimo da due '
        'sole iniziali, sempre alla stessa ora, e un giro di consegne che certe notti allunga di '
        'una fermata — al Palazzo del Lume. Il vetturino, svegliato all’alba, sbadiglia: di là la '
        'strada è più corta, dice, si è sempre fatta così. Sarà comodità del giro. Intanto quella '
        'riga resta in colonna, in mezzo alle altre, e nessuno di voi sa ancora leggerla.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 13:</b> <i>«C.B. non compra la carta: compra il silenzio di '
        'chi la vende. Il prezzo è sempre esatto. Conosce i bilanci di tutti.»</i> Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Puntare all’arresto del Notaio.</b> La filiera di carta basta per un fermo: in cella, '
        'prima che i soldi di C.B. lo facciano scarcerare in pochi giorni, Rasca fa UN nome — il '
        'professor Braga (l’Episodio 14 parte con un sospetto già in mano), ma il fermo chiude la '
        'filiera: un incrocio in meno nell’Episodio 14. Rasca torna comunque libero: lo '
        'riprenderete solo molto più avanti.<br/>'
        '<b>Pedinarlo.</b> Un incrocio in più nell’Episodio 14, ma è lui che vi porta dove vuole: '
        'la falsa pista su Braga nasce qui, più credibile.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 13.',
        '<b>AGGANCIO.</b> Sul registro del molino, tra i conti storici, sessant’anni di '
        'forniture intestate a un professore collezionista. Iniziali C.B. Un nome che in città '
        'conoscono tutti: il rivale storico del vostro presidente. <b>Per chi arbitra:</b> quel '
        'conto è più vecchio di chiunque possa averlo aperto, e l’intestazione a una persona è '
        'una maschera di carta come le altre — il nome sul registro non è per forza la mano che '
        'paga. Il Referto del Luogo 7 lo dice già: se il tavolo ci arriva da solo, non '
        'confermate e non smentite. Stanotte il registro è una prova vera che punta a un nome, e '
        'tanto basta.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'ottenuto solo la vittoria parziale (registri degradati), l’Ep. 18 partirà con un '
        'incrocio in meno: la prova salvata a metà pesa a metà.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI13_DESC = {
    1: "La Stazione delle Carrozze sa di cavalli tenuti al coperto, di cuoio ingrassato e di quel "
       "dolce marcio che il fieno prende quando la notte è umida; sotto la tettoia fa meno freddo "
       "che in strada, e l’aria sta ferma. Rimesse aperte in fila, i finimenti appesi a testa in "
       "giù, secchi rovesciati sul selciato, e il gran quadro dei noli scritto a gesso, con le "
       "ore in colonna e certe righe passate sopra due volte. I cavalli sono già bardati e "
       "spostano il peso da uno zoccolo all’altro, sempre nello stesso ordine, e i sonagli dei "
       "pettorali si rispondono da una rimessa all’altra per tutta la sera. Il garzone dei ritiri "
       "vi parla tenendo le mani dietro la schiena, le unghie nere, e non guarda mai due volte "
       "nello stesso punto: «io porto le scatole, signori, non guardo in faccia nessuno. Ritiro "
       "qui, consegno là, mi pagano.» Il capostazione lo lascia dire, poi abbassa la voce di suo: "
       "«Annegato, dicono. Ma sapeva nuotare come un pesce.» Al chiodo in fondo alla rimessa una "
       "palandrana di panno pesante è ancora appesa, e il colletto è scuro d’umido.",
    2: "Lo studio del Notaio sa di ceralacca fredda e di carta nuova, e ci si sente addosso il "
       "freddo di una stanza che nessuno abita davvero: il camino è spento e pulito fin dentro la "
       "cenere, come a primavera. Scaffali di pratiche legate con la fettuccia rossa, il calamaio "
       "col coperchio abbassato, il tampone dei timbri nel suo astuccio, e sulla scrivania "
       "nient’altro — non una carta fuori posto, non una goccia di cera, non un grano di "
       "sabbiolina da asciugare. Il pendolo dell’orologio a muro batte piano, e a ogni battuta i "
       "vetri della libreria rispondono con un tintinnio che arriva sempre un istante dopo. Rasca "
       "vi riceve senza togliersi i guanti; le mani restano ferme una sull’altra per tutto il "
       "tempo, e sorride di quel poco che serve: «Un incarico come tanti, signori. Intesto, "
       "protocollo, pago per conto di un cliente riservato. La riservatezza è il mio mestiere.» "
       "Dietro di lui il praticante continua a copiare e la penna non si ferma mai, nemmeno "
       "quando dovrebbe voltare pagina. Sul tampone dei timbri l’inchiostro è asciutto al centro "
       "e fresco sul bordo.",
    3: "L’Ufficio del Fermo-Posta sa di colla d’amido e di spago nuovo, con sotto quel filo "
       "d’aceto che lasciano le spugnette dei francobolli; è più caldo del corridoio, e il caldo "
       "viene dalla stufetta di ghisa dietro il banco. Caselle numerate d’ottone dal pavimento al "
       "soffitto, pacchi legati in croce sugli scaffali, la bilancetta a piatti, e il registro "
       "dei ritiri assicurato al banco con una catenella troppo corta per portarlo alla luce. "
       "Quando in fondo al corridoio qualcuno chiude una porta, le targhette d’ottone delle "
       "caselle tremano tutte insieme e da qualche parte si sente uno scatto secco, che nessuno "
       "va a controllare. L’impiegato dello sportello si toglie le mezze maniche prima di "
       "rispondervi, come chi si prepara a restare in piedi un pezzo, e parla di un uomo che qui "
       "non viene più: «veniva a controllare le consegne di persona, ultimamente. Nervoso. "
       "Contava, segnava.» Poi rimette le mezze maniche. Sul banco, il pennello della colla è "
       "rimasto ritto nel barattolo, con la setola indurita a ventaglio.",
    4: "La Dogana Vecchia sa di canapa bagnata e d’inchiostro da timbro, e dentro fa più freddo "
       "che sulla banchina: il muro verso il canale suda anche d’inverno, e la macchia dell’umido "
       "è salita fin sopra il quadro delle tariffe. Bolle di transito infilzate a decine sul "
       "punteruolo, casse di risme incartate in fila lungo la parete, il bancone consumato a "
       "conca nel punto dove si timbra, e una lanterna d’ispezione appesa al suo gancio. Ogni "
       "volta che la porta si muove le bolle sul punteruolo si alzano tutte insieme di un dito e "
       "ricadono, e la carta continua a frusciare quando la porta è già ferma. Il doganiere "
       "timbra mentre parla, senza guardare il foglio, e batte due volte il tampone per ogni "
       "bolla: «carta di pregio, dazio pagato, tutto in regola», dice. E più tardi, sempre senza "
       "smettere di timbrare, con la voce di chi parla al bancone e non a voi: «certe fermate è "
       "meglio non timbrarle.» Sul vetro della lanterna la fuliggine è nera da una parte sola.",
    5: "La casa del capo-catena sa di stanza chiusa e di stoppino spento, e sotto c’è ancora "
       "l’acqua: quell’odore verde di canale che i panni di un uomo si tengono addosso e non "
       "lasciano più. Sul telaio della porta il sigillo di ceralacca dei gendarmi è stato "
       "tagliato di netto e pende dai due capi. Dentro, una branda rifatta con cura da caserma, "
       "una tazza sola sul tavolo, l’attaccapanni dietro l’uscio senza niente sopra, e fogli "
       "dappertutto — sulla branda, sul davanzale, in terra lungo il battiscopa — colonne di date "
       "e di cifre in una calligrafia che si stringe verso il fondo della pagina. La finestra non "
       "chiude bene, e a ogni soffio i fogli in terra si sollevano di un angolo e ricadono, uno "
       "dopo l’altro, sempre nello stesso ordine, come una mano che volta. In mezzo al tavolo sta "
       "un mezzo diario aperto, e nell’ultima pagina scritta una riga sola è sottolineata due "
       "volte, premendo tanto che la punta ha inciso anche i fogli di sotto. La candela è "
       "consumata fino al piattino, e la cera è colata tutta verso la finestra.",
    6: "La Cancelleria Vescovile sa d’incenso spento e di cera vergine, e il corridoio che vi "
       "porta è più freddo della strada; dentro, invece, l’aria è tiepida e ferma, tenuta in "
       "caldo dalle candele più che dalla stufa. Registri solenni in piedi come mattoni sugli "
       "scaffali, la cassetta dei sigilli col suo scaldacera, un inginocchiatoio spostato contro "
       "la parete per far posto a un tavolo da copista; e sopra il tavolo, sulla tappezzeria, un "
       "rettangolo più chiaro grande come un ritratto, col chiodo ancora al suo posto. Il tirante "
       "del campanello, che nessuno ha suonato, oscilla piano contro il muro e ogni tanto batte "
       "una nota di legno, senza regola. Il cancelliere vi riceve con le mani in grembo, le dita "
       "macchiate d’inchiostro fino alla seconda falange, e sceglie le parole come si sceglie in "
       "un cesto: «se cercate chi compra quella carta per ragioni meno sante, non guardate noi», "
       "dice, e con questo considera chiusa la questione. Sul leggio, un foglio di carta pregiata "
       "è già tagliato a misura, e ancora bianco.",
    7: "La Prefettura sa di polvere di carta e di cera da pavimenti, e nell’archivio dei noli fa "
       "quel freddo asciutto che spacca le labbra e conserva i registri più a lungo degli uomini. "
       "Scaffali a cassettoni numerati fino al soffitto, una scala a rotelle appoggiata a metà "
       "corridoio, i faldoni legati per annata con lo spago passato due volte, e in fondo un "
       "unico tavolo con la lampada dal paralume verde. La scala non sta ferma: ogni tanto rotola "
       "di mezzo palmo sulla sua guida, da sola, e si arresta con un colpo che percorre tutto lo "
       "scaffale. Il funzionario che vi accompagna tiene il faldone contro il petto con tutte e "
       "due le braccia, e prima di posarlo si guarda alle spalle, verso una porta chiusa: «quel "
       "nolo lo abbiamo sempre autorizzato senza fiatare: carte perfette, cliente d’antica "
       "famiglia», dice, e lo dice come si recita una formula imparata da altri. Sul ripiano più "
       "alto, nella polvere, resta l’impronta netta di un faldone tirato fuori e non rimesso a "
       "posto.",
    8: "Il Deposito delle Risme sa di carta nuova, e la carta nuova, in quantità, asciuga la "
       "bocca: polvere chiara sospesa, iuta, colla, e un fondo di umido che sale dal pavimento di "
       "mattoni. Le risme stanno impilate a torri pari, incartate e legate in croce con lo spago, "
       "ciascuna col suo cartellino; poi la bilancia a bilico, il punteruolo delle bolle, e un "
       "armadio a muro di quelli che si chiudono a chiave e restano aperti tutta la sera. Le "
       "torri lavorano da sole nel silenzio: la carta scricchiola quando l’aria cambia, una risma "
       "alla volta, in punti diversi del magazzino, e ogni volta si volta la testa. Il "
       "magazziniere non smette di spuntare cartellini mentre vi risponde, e tiene la matita fra "
       "i denti da una riga all’altra; del molino parla come si parla del tempo che si mette al "
       "brutto: «stanotte al molino c’è aria strana», dice, e passa alla pila seguente. "
       "Nell’armadio, fra i moduli in bianco, sta una cassetta di latta grigia, chiusa col suo "
       "gancio.",
    9: "Il Molino delle Carte lo si sente prima di vederlo: l’acqua che cade sempre nello stesso "
       "punto, e un odore di stracci bagnati e di colla che sull’aria di campagna non ci sta. Due "
       "ore di strada oltre le mura, l’opificio sta sull’acqua nera con la ruota grande da un "
       "lato e le rogge che gli corrono attorno come fossi; dentro il recinto, capannoni bassi, "
       "balle di stracci accatastate fin sotto le finestre, e i telai dei fogli appesi che si "
       "indovinano in controluce quando qualcuno passa con una lanterna. Fa più caldo di quanto "
       "una notte sull’acqua permetta, e all’odore degli stracci se ne mescola un altro, di "
       "petrolio. La ruota gira ancora piano senza che nessuno la governi, e l’acqua che ne cade "
       "batte sempre sullo stesso gradino di pietra, a tempo, come una goccia dentro una casa "
       "vuota. Nel cortile una carrozza aspetta coi cavalli attaccati. Sul greto, sotto la ruota, "
       "un foglio bagnato è rimasto incollato a una pietra, e la corrente non riesce a portarlo "
       "via.",
}

OGGETTI_LUOGO_13 = {
    1: ['Il Lasciapassare del Nolo'],
    2: [('Esca', 'Il Timbro del Notaio', 'è un timbro di routine, non inchioda Rasca')],
    5: ['Il Taccuino del Capo-Catena'],
    6: [('Esca', 'La Lettera di Raccomandazione', 'è cortesia di facciata, non porta a C.B.')],
    7: [('Reperto C', 'il Registro dei Noli', '')],
    8: ['La Cassetta Stagna', ('Reperto B', 'la Bolla di Transito', '')],
    9: [('Reperto A', 'la Filigrana', '')],
}

TILE_ART_13 = {t['id']: t['id'] + '-ep13.png' for t in TILES_13}
LUOGHI13_CROP = {}

TESSERE_DESC_13 = {
    'T1': "Il cortile del Molino delle Carte, di notte, sa di acqua ferma e di cavalli: il fiato "
          "delle bestie fuma nel freddo e resta basso, e sopra tutto c’è l’odore verde della "
          "roggia che gira dietro il muro di cinta. La grande ruota sta ferma sull’acqua nera, "
          "con le pale in alto ancora gocciolanti. La carrozza del Notaio aspetta col mantice "
          "alzato, i finimenti lucidi, i cavalli già attaccati, la cassetta chiusa a chiave; "
          "accanto al cancello, casse accatastate e una lanterna posata in terra invece che "
          "appesa. Alcuni uomini del molino montano la guardia annoiati, battendo i piedi per il "
          "freddo, finché non vi vedono. Uno dei cavalli sposta il peso da uno zoccolo all’altro, "
          "sempre nello stesso ordine, e i finimenti tintinnano a intervalli regolari, come un "
          "orologio che nessuno ha caricato. Le finestre del molino sono tutte nere tranne una, "
          "in alto, di un colore più caldo di quello di un lume — e quella non sta ferma. Sul "
          "predellino della carrozza qualcuno ha appoggiato un guanto chiaro, e il guanto è "
          "ancora lì.",
    'T2': "La roggia di adduzione taglia il molino come una ferita: acqua nera e veloce che "
          "precipita verso la ruota, passerelle di assi viscide gettate di traverso. Un passo "
          "falso e la corrente ti prende e ti porta sotto la macina. L’aria sa di legno fradicio "
          "e di ferro, ed è più fredda di due passi indietro; parlare serve a poco, perché il "
          "rombo più avanti si mangia le voci a metà frase. Le assi sono state posate una accanto "
          "all’altra senza inchiodarle, quasi tutte vecchie e imbarcate, una sola nuova e chiara; "
          "sotto, a mezzo braccio, l’acqua corre in un verso solo, senza un riflesso, e non fa "
          "schiuma da nessuna parte. La passerella respira sotto il peso e torna su, sempre con "
          "la stessa nota, e continua a muoversi un poco anche dopo che vi siete fermati. A riva, "
          "i pali di sostegno portano la fascia scura dell’acqua alta un palmo sopra il livello "
          "di adesso. Contro il palo di mezzo, fermo nella corrente e non portato via, sta uno "
          "zoccolo di legno, uno solo.",
    'T3': "La sala delle macine è tutta frastuono: la grande ruota muove ingranaggi e magli che "
          "pestano gli stracci in poltiglia, cinghie che frustano l’aria. Il rumore copre le voci "
          "e i passi. Chi combatte qui rischia gli ingranaggi più delle lame: la macchina non "
          "distingue amici da nemici. Sa di grasso caldo, di stoffa bagnata e di una polvere che "
          "si sente in gola prima che nel naso; fa più caldo che alla roggia, e il caldo viene "
          "dal ferro, non dall’aria. I pestelli scendono nelle pile di pietra a tempo doppio, e a "
          "ogni giro la cinghia lunga batte contro la trave con un colpo che si sente nei denti "
          "prima che nelle orecchie. Sotto le pile la poltiglia gira lenta e grigia, e ogni tanto "
          "sale a galla un pezzo di stoffa che si riconosce ancora — un pezzo di camicia, un orlo "
          "di lenzuolo — e torna sotto. Sul ceppo accanto alla macina una scodella di latta è "
          "rimasta piena a metà, e la superficie dell’acqua trema tutta, senza fermarsi mai, in "
          "cerchi che non arrivano al bordo. Contro il muro, appesa a un chiodo, una scopa di "
          "saggina consumata da una parte sola.",
    'T4': "I magazzini di stracci sono montagne di stoffa fino al soffitto, e l’aria è densa di "
          "polvere infiammabile. Sa di stracci vecchi e di sudore d’altri, e sotto — netto, fuori "
          "posto in un magazzino di stoffa — c’è l’odore del petrolio. La polvere gira nel cono "
          "della lanterna e non si posa mai; resta in gola, e chi tossisce lo fa sempre due "
          "volte. In mezzo, immobile ed elegante, il Notaio Rasca: i guanti chiari, il colletto "
          "senza una piega, le mani una sull’altra. Guarda i registri, poi voi, con la calma di "
          "chi ha già deciso. Dice una parola ai suoi uomini e si avvia alla carrozza senza "
          "affrettare il passo, e nessuno degli uomini lo guarda andare via. Fra le balle restano "
          "aperti i corridoi stretti dove sono passati portando qualcosa: la stoffa è schiacciata "
          "all’altezza dei fianchi, sempre alla stessa altezza. Sulla balla più vicina alla "
          "porta, posata in terra, sta una lanterna cieca con lo sportello già aperto.",
    'T5': "L’essiccatoio è un labirinto di telai e di fogli appesi ad asciugare, corridoi stretti "
          "di carta pendente che sfiora la faccia. Bello e mortale: un solo tizzone, qui dentro, "
          "e diventa una galleria di fuoco. Sa di colla e di carta umida, e fa più caldo che nei "
          "magazzini — un caldo che non viene dai muri e che si sente sulla faccia prima che "
          "sulle mani. I fogli pendono a migliaia, tutti alla stessa altezza; quando passate si "
          "muovono in fila uno dopo l’altro, e tornano fermi molto dopo di voi. In fondo, oltre "
          "il corridoio di carta, la luce del torchio è rossa e bassa: prende i fogli da dietro e "
          "li tiene accesi come vetri di chiesa. Fra i telai il pavimento è coperto di ritagli e "
          "di fiocchi di stoppa, che a ogni passo si spostano e si rimettono. I corridoi sono "
          "tanto stretti che si passa di fianco, e la carta bagnata tocca la guancia da tutte e "
          "due le parti, fredda come un panno steso al buio. All’ultima "
          "svolta, un telaio è stato tirato di traverso al corridoio e lasciato lì.",
    'T6': "La sala del torchio sa d’inchiostro e di stracci, e da dietro le spalle arriva un "
          "tepore che alla roggia non c’era. Il grande torchio di ferro e legno sta al centro con "
          "la vite alzata; accanto, la cassaforte dei registri, circondata di stracci "
          "ammonticchiati come per un rogo, e in fila sul davanzale i barattoli d’inchiostro col "
          "tappo di sughero. Davanti alla cassaforte, largo e immobile, il Sorvegliante: le mani "
          "grandi lasciate lungo i fianchi, il randello ancora infilato nella cintura, i piedi "
          "piantati alla larghezza delle spalle come chi ha deciso di non spostarsi. Non parla e "
          "non vi viene incontro; gira soltanto la testa quanto basta a tenervi tutti davanti. "
          "Dietro di voi, l’essiccatoio comincia a scaldarsi. La luce sui muri cresce a scatti, e "
          "a ogni scatto le ombre del torchio si allungano un poco e non tornano più dov’erano. "
          "Sul piano del torchio, sotto la platina, è rimasto un foglio appena stampato, con "
          "l’inchiostro ancora lucido.",
}

ESAMI_CARBONE_13 = {
    'LA FILIGRANA': '«Il giglio spezzato, in controluce, è la stessa mano d’ogni carta di pregio '
                'della campagna: non una cartiera che vende a tanti, ma un’unica risma tagliata su '
                'misura per una penna sola. Chi scrive su questa carta vuole che ogni suo foglio '
                'sia riconoscibile e irripetibile — la firma di chi non firma.»',
    'IL REGISTRO DEI NOLI': '«Sessant’anni di forniture allo stesso cliente storico, “C.B.”, '
                'pagate al centesimo e sempre in orario; e il nolo parte con la carrozza che, '
                'certe notti, serve anche il Palazzo del Lume. Perché lo faccia, la carta non lo '
                'dice, e i vetturini giurano che di là il giro è più corto. Quel che si legge con '
                'certezza è l’ora: sempre quella, da anni, al minuto.»',
    'IL TACCUINO DEL CAPO-CATENA': '«Non una confessione: un uomo che aveva cominciato a contare. '
                'Colonne di date, di ore e di noli, e in fondo una riga sottolineata due volte — '
                'l’ora di partenza del nolo della carta, e accanto, in una sigla sua, una seconda '
                'fermata che nessuno sa sciogliere. Sapeva di valere quella riga. È annegato per '
                'quella riga: la sua deposizione, ricostruita, arriva viva dove lui non è '
                'arrivato — e con lei gli orari del Molino, turno per turno.»',
}

OGGETTI_TESSERA_13 = {'T3': ['Un Secchio d’Acqua e Sabbia']}


def luoghi():
    """Luoghi.pdf Episodio 13 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 13 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_13, 'Episodio 13')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_13.get(n, []))

    for L in LUOGHI_13:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI13_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI13_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_13)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_13
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL SORVEGLIANTE DEL MOLINO', 'IL NOTAIO', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 13')
    print('OK episodio 13')
