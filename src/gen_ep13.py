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
sfugge per copione; si affronta l'esecutore e si SEQUESTRA la prova mentre il
molino di stracci prende fuoco (soglia-Canto). Prima trasferta fuori città
(pericoli d'ambiente: roggia, macine, fuoco). Torsione d'indagine: «il
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
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
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
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


# ================================================================= DATI

LETTERA_13 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Di C.B. non ci resta un volto né una firma per esteso: ci resta la <i>carta</i>. "
    "Filigrana rara, che un solo opificio produce — il <b>Molino delle Carte</b>, due ore di "
    "carrozza fuori città. A Roccamora quella carta la comprano in tre; il garzone dei ritiri "
    "non ha mai visto un volto, «solo scatole». E il suo capo-catena — l’unico che sapeva a chi "
    "andavano le risme — è stato ripescato dal canale stamattina, annegato, la notte prima di "
    "parlarci.<br/><br/>"
    "Chi non lascia un nome lascia una carta. Andate al Molino e portatemi i <b>registri dei "
    "noli</b>: chi paga il trasporto, e quando. E badate al capo-catena: i morti non depongono, "
    "ma lasciano il <b>calco</b> di ciò che sapevano — ricostruitelo. Avete <b>6 ore</b>, dalle "
    "18:00 alle 24:00; il Molino è fuori porta, e stanotte qualcuno vuole che bruci.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la Stazione delle Carrozze, lo studio del Notaio, "
    "l’Ufficio del Fermo-Posta e la Dogana Vecchia. Gli altri andranno sbloccati; il Molino è "
    "fuori città (dichiararlo costa 2 ore).</i>")

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
             'diceva che quel nolo valeva più di tutti gli altri messi insieme.» '
             '<i>(Oggetto: prendete il Lasciapassare del Nolo.)</i>',
             'Il capostazione, sottovoce: «il capo-catena l’hanno tirato su dal canale stamattina. '
             'Annegato, dicono. Ma sapeva nuotare come un pesce, e la notte prima aveva chiesto '
             'di parlare a qualcuno di importante. Il capo-catena annegato non è un incidente, '
             'signori.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il capostazione',
                  testo='«Ve lo dico perché ho paura anch’io: quel nolo puntuale lo intesta '
                        'sempre lo stesso studio, quello del Notaio Rasca. Carta in regola, '
                        'bolli a posto, paga prima. E il capo-catena, buon’anima, aveva '
                        'cominciato a farsi domande su una cosa sola: che la carrozza del nolo, '
                        'certe notti, faceva una fermata in più. Al Palazzo del Lume. La vostra '
                        'sede, no? Ecco. Poi è annegato.»'),
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
             '<i>(Esca: potete prendere il Timbro del Notaio — è un timbro di routine, non '
             'inchioda Rasca.)</i> Rasca lo lascia prendere senza battere ciglio: sa che non '
             'prova nulla.',
             'Un praticante, quando Rasca esce, bisbiglia: «il capo-catena annegato era venuto '
             'qui, tre giorni fa. Ha litigato col Notaio a porte chiuse. Il giorno dopo era '
             'morto. Io non ho visto niente, chiaro? Ma quell’uomo sapeva qualcosa, e il Notaio '
             'lo sapeva sapere.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La cortesia del Notaio',
                  testo='Rasca non commette errori: ogni carta è in regola, ogni bollo al suo '
                        'posto, ogni pagamento tracciato e puntuale. È proprio la perfezione a '
                        'tradirlo — nessun cliente onesto è così invisibile. È l’uomo del '
                        '«benefattore che ama la lirica» di due inverni fa: il legale che dà un '
                        'indirizzo di carta a chi non vuole un volto. Non lo prenderete stanotte; '
                        'ma sapere che è lui a tenere la penna del nolo è metà della caccia.'),
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
             'le bolle. Ne aveva copiata una, l’ultima, e se l’era messa in tasca. Diceva: "se '
             'mi succede qualcosa, guardate il nolo delle notti di luna nuova". Poi è successo '
             'qualcosa.»',
             'Sul registro doganale, il nolo della carta e un altro nolo si sovrappongono certe '
             'notti: stessa carrozza, stessa ora. L’altro nolo è intestato a una sede nota. Il '
             'doganiere non l’ha voluto scrivere per esteso: «certe fermate è meglio non '
             'timbrarle.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il doganiere',
                  testo='«Ve lo metto a verbale perché ormai è morto lui e non io: il capo-catena '
                        'aveva capito che la carrozza del nolo della carta, nelle notti giuste, '
                        'fa una fermata in più prima di lasciare la città. Al Palazzo del Lume. '
                        'La stessa carrozza che porta la carta di quel signore riservato porta '
                        'anche la carta della vostra Società. Lui lo sapeva. Ed è per questo che '
                        'è annegato: non per quello che aveva rubato, per quello che aveva '
                        'contato.»'),
         ]),
    dict(n=5, nome='LA CASA DEL CAPO-CATENA', voce_mappa='La Casa del Capo-Catena',
         req='La casa del morto è sigillata dai gendarmi, e si apre solo a chi sa perché è morto '
             '— la parola che tutti dicono a bassa voce, l’annegato che sapeva nuotare.',
         chiave=('parola', 'IL CAPO-CATENA ANNEGATO'), art='La Casa del Capo-Catena.png',
         chiude=None,
         indizi=[
             'La stanza di un uomo che aveva cominciato a contare: fogli ovunque, colonne di date '
             'e di noli, un mezzo diario. Nessuna confessione — un calcolo. <i>(Oggetto: prendete '
             'il Taccuino del Capo-Catena.)</i> Ricostruire ciò che sapeva è come farlo deporre da '
             'morto.',
             'In fondo al taccuino, una riga sola sottolineata due volte: l’ora in cui, ogni '
             'settimana, «la carta di C.B. e la carta della Società prendono la stessa strada». '
             'Sapeva di valere quella riga. È annegato per quella riga.',
             'Tra le carte, gli orari del molino annotati di suo pugno: i turni della guardia, '
             'l’ora in cui il Sorvegliante fa il giro, quando i magazzini restano scoperti. '
             'Voleva entrarci, o voleva vendere il modo di entrarci. Adesso quegli orari valgono '
             'a voi.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La deposizione mai resa',
                  testo='A leggere i suoi fogli nell’ordine giusto, la voce del capo-catena torna '
                        'come da sotto l’acqua: non un fantasma, il calco di una testimonianza '
                        'che nessuno ha raccolto in tempo. Vi dice tre cose — che la carta di '
                        'C.B. viaggia sulla carrozza della vostra sede; a che ora, stanotte, '
                        'daranno fuoco ai registri; e per dove passa la guardia. È tutto quello '
                        'che sarebbe morto in tribunale, se fosse arrivato vivo. Fatelo arrivare '
                        'voi.'),
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
             'Tra le pratiche, una lettera di raccomandazione mai spedita, che accredita un certo '
             'signore presso «ambienti che contano». <i>(Esca: potete prendere la Lettera di '
             'Raccomandazione — è cortesia di facciata, non porta a C.B.)</i>',
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
             'autorizzati: il nolo della carta col giglio c’è, puntuale da anni. <i>(Reperto C: '
             'consegnate il Registro dei Noli.)</i> È qui che il calcolo del capo-catena trova '
             'conferma.',
             'Incrociando il registro con gli appunti del morto, la riga sottolineata si legge '
             'per intero: sessant’anni di forniture allo stesso cliente storico, un professore '
             'collezionista, iniziali C.B. — e la carrozza condivisa col Palazzo del Lume. Il '
             'SEME della caccia.',
             'Un funzionario, a disagio: «quel nolo lo abbiamo sempre autorizzato senza fiatare: '
             'carte perfette, cliente d’antica famiglia. Nessuno ha mai chiesto perché un '
             'professore di lettere avesse bisogno di tanta carta di pregio. Nessuno tranne un '
             'capo-catena, e guardate com’è finito.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il registro dei noli',
                  testo='Sessant’anni di forniture allo stesso cliente storico, pagate al '
                        'centesimo e sempre in orario, intestate con due iniziali: «C.B.». E il '
                        'nolo parte con la carrozza che, certe notti, serve anche il Palazzo del '
                        'Lume. Liquidatelo pure come coincidenza dei vetturini — ma i vetturini '
                        'non sanno di esserlo. Chi paga la carta di C.B. paga da dove pagate voi: '
                        'è dentro casa, e da sessant’anni.'),
         ]),
    dict(n=8, nome='IL DEPOSITO DELLE RISME', voce_mappa='Il Deposito delle Risme',
         req='Il deposito dove arrivano le risme è chiuso a quest’ora, e apre solo a chi sa da '
             'dove vengono: l’opificio fuori le mura che fa la filigrana.',
         chiave=('parola', 'IL MOLINO FUORI PORTA'), art='Il Deposito delle Risme.png',
         chiude=20,
         indizi=[
             'Il deposito in città riceve le risme dal molino fuori porta e le smista ai tre '
             'compratori. <i>(Reperto B: consegnate la Bolla di Transito.)</i> Le bolle dicono '
             'tutto: quantità, date, nolo prepagato. Il molino fuori porta è il collo di '
             'bottiglia della filiera.',
             'In un armadio, una cassetta di latta stagna, di quelle che i notai usano per i '
             'documenti che devono sopravvivere a tutto. <i>(Oggetto: prendete la Cassetta '
             'Stagna.)</i> «Al molino ci sono acqua e stracci: se volete portar via delle carte '
             'sane, mettetele lì dentro.»',
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
             'identico alla carta di ogni caso della campagna. <i>(Reperto A: consegnate la '
             'Filigrana.)</i> Non una cartiera che vende a tanti: un’unica risma tagliata per una '
             'penna sola.',
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
# Obiettivo = salvare i registri (Interagire a T6, in Cassetta Stagna) prima
# che il FUOCO (soglia-Canto) li danneggi. Boss: il Sorvegliante. Il Notaio
# appare (T4), ordina il rogo e fugge.
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
         cerca_vuoto='Solo la carrozza che aspetta e il fiato dei cavalli. Chi la userà tra poco '
                     'non lo prenderete: puntate ai registri, non ai cavalli.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA ROGGIA', exits={'S': 'T1', 'N': 'T3'},
         testo='Il canale di adduzione che muove la macina: acqua nera e veloce, passerelle di '
               'assi scivolose sopra la corrente. QUANDO RIVELATE QUESTA TESSERA: pericolo '
               'd’ambiente — chi attraversa prova VIGORE o DESTREZZA (Media); chi fallisce '
               'scivola in acqua e la corrente lo trascina (1 round perso a risalire).',
         arbitro='PERICOLO D’AMBIENTE (roggia): non ci sono nemici stanziali, c’è l’acqua. Prova '
                 'VIGORE/DESTREZZA per la passerella. Con il Taccuino del Capo-Catena sapete dove '
                 'l’asse regge: prova a Facile.',
         cerca_vuoto='Assi bagnate e il rombo della macina più avanti. Niente da raccogliere: '
                     'solo da passare senza finire sotto la ruota.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA SALA DELLE MACINE', exits={'S': 'T2', 'N': 'T4'},
         testo='La grande ruota e le macine che pestano gli stracci, in moto: ingranaggi, cinghie, '
               'un frastuono che copre le voci. QUANDO RIVELATE QUESTA TESSERA: gli uomini del '
               'molino sono qui, e le macine mordono chi si distrae (insidia NERVI/VIGORE).',
         arbitro='Gli ingranaggi sono un pericolo d’ambiente oltre ai nemici: chi combatte '
                 'addosso alle macine rischia (prova NERVI Media se spinto contro gli '
                 'ingranaggi). Passare in fretta è meglio che fermarsi a combattere.',
         cerca='In un ripostiglio, un secchio d’acqua e sabbia (utile: al torchio, spegne un '
               'principio d’incendio — rimanda di 1 la soglia-fuoco per chi lo porta).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='I MAGAZZINI DI STRACCI', exits={'S': 'T3', 'N': 'T5'},
         testo='Montagne di stracci per la pasta di carta, polvere infiammabile sospesa nell’aria. '
               'QUANDO RIVELATE QUESTA TESSERA: appare IL NOTAIO, elegante e calmo; dà l’ordine di '
               'dar fuoco ai registri e si avvia alla carrozza. Da ora comincia il conto alla '
               'rovescia del FUOCO.',
         arbitro='IL NOTAIO (nemico minore) NON combatte: alla fine del round successivo alla sua '
                 'comparsa, fugge in carrozza (rimosso). Se lo inseguite invece di puntare ai '
                 'registri, perdete il round e il fuoco avanza. Da qui, le carte crescendo '
                 'spingono la soglia-fuoco: stracci e polvere aspettano una scintilla.',
         hook='Il Taccuino del Capo-Catena (dalla sua casa): sapete l’ora del rogo — la '
              'soglia-fuoco è più alta, arrivate col fuoco ancora lontano.',
         cerca_vuoto='Stracci fino al soffitto e odore di petrolio. Il Notaio è già alla porta: '
                     'non guardate lui, guardate quanto manca al torchio.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='L’ESSICCATOIO', exits={'S': 'T4', 'N': 'T6'},
         testo='Un labirinto di telai coi fogli appesi ad asciugare, carta ovunque, corridoi '
               'stretti di carta pendente. QUANDO RIVELATE QUESTA TESSERA: il Sorvegliante '
               'schiera i suoi uomini tra i telai; se il fuoco è già acceso, i fogli appesi '
               'prendono in fretta.',
         arbitro='Ultimo diaframma prima del torchio. Se la soglia-fuoco è superata, questa '
                 'tessera è in fiamme: attraversarla costa una prova NERVI o 1 danno. Con il '
                 'secchio (da T3) o la Cassetta già in mano, meno rischio.',
         cerca_vuoto='Fogli come lenzuoli nel buio, e in fondo la luce del torchio. Un fiammifero, '
                     'qui, e non c’è più niente da salvare. Correte.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA SALA DEL TORCHIO', exits={'S': 'T5'},
         testo='Il grande torchio e la cassaforte dei registri, attorniata di stracci pronti al '
               'rogo. IL SORVEGLIANTE è qui, tra voi e la prova. QUANDO RIVELATE QUESTA TESSERA: '
               'si prende il registro, lo si mette nella Cassetta Stagna, si esce — prima che il '
               'fuoco arrivi.',
         arbitro='OBIETTIVO. Interagire alla cassaforte prende i registri; con la Cassetta '
                 'Stagna sono SALVI (vittoria piena). Se la soglia-fuoco è superata e non avete '
                 'la Cassetta, ogni round al torchio DANNEGGIA i registri (vittoria parziale: '
                 'prova degradata). Il Sorvegliante va superato/abbattuto per arrivare alla '
                 'cassaforte. «Il nome del Notaio» (D2): gridargli che Rasca è già fuggito gli fa '
                 'saltare un attacco.',
         cerca_vuoto='Non c’è niente da cercare: c’è un registro da chiudere in una cassetta e '
                     'una porta da raggiungere mentre il molino brucia. Prendete e uscite.',
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
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
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
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). Il Molino (9) è FUORI CITTÀ: dichiararlo costa 2 ore.')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Deposito Risme (8) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Molino (9) fuori città: 2 ore')

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
            '4. COSA portate al Molino?']
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
                  'Questo NON è un inseguimento né una cattura: è un <b>recupero della prova</b> '
                  'in un opificio che vuole ucciderla. Obiettivo: raggiungere il torchio (T6), '
                  'prendere i <b>registri dei noli</b> e metterli nella <b>Cassetta Stagna</b> '
                  'prima che il <b>FUOCO</b> (soglia-Canto) li divori. Il vero colpevole, il '
                  'Notaio, non si prende: appare, ordina il rogo e fugge. Le pagine seguenti sono '
                  'le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>FUOCO (soglia).</b> Il Notaio (appare in T4) ordina di bruciare i '
                  'registri. Quando il Canto raggiunge la <b>soglia-fuoco</b> (indicata dalla '
                  'Soluzione), i magazzini di stracci prendono: da quel round, ogni round al '
                  'torchio (T6) SENZA i registri nella Cassetta Stagna li <b>danneggia</b> '
                  '(vittoria parziale). Le carte crescendo spingono verso la soglia; il Taccuino '
                  'del Capo-Catena la alza (sapete l’ora del rogo).', BODY),
        Paragraph('• <b>OBIETTIVO.</b> Al torchio (T6), Interagire alla cassaforte prende i '
                  'registri; con la <b>Cassetta Stagna</b> sono salvi — <b>vittoria piena</b>. '
                  'Presi col fuoco già alto e senza cassetta: <b>vittoria parziale</b> (prova '
                  'degradata, l’Atto prosegue). Il <b>Sorvegliante</b> (boss) guarda il torchio: '
                  'va superato o abbattuto.', BODY),
        Paragraph('• <b>IL NOTAIO NON SI PRENDE.</b> Appare in T4, ordina il rogo e alla fine del '
                  'round dopo fugge in carrozza. Inseguirlo = round perso e fuoco che avanza. È '
                  'il ricorrente dell’Atto: lo rivedrete. <b>Ambiente:</b> la roggia (T2) trascina '
                  'chi cade, le macine (T3) mordono, l’essiccatoio (T5) brucia. Il <b>Lasciapassare '
                  'del Nolo</b> salta lo sbarramento del cortile (T1).', BODY)])
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
                  'molino</b> (Sgherri), <b>il Notaio</b> (nemico minore: appare in T4, ordina il '
                  'rogo e fugge — NON si prende) e <b>il Sorvegliante del Molino</b> (il boss: '
                  'guarda il torchio, T6, e va superato per prendere i registri). Nessun mostro: '
                  'il pericolo è l’acqua della roggia, gli ingranaggi delle macine, il fuoco degli '
                  'stracci. Vittoria: registri nella Cassetta Stagna prima del fuoco. Ai tavoli da '
                  '2-3 eroi il Sorvegliante <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_13())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_13():
    """Miniature dell'Episodio 13. I segnalini Canto sono qui i segnalini del
    FUOCO (l'incendio dei magazzini di stracci che monta verso la soglia-rogo)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('UOMINI DEL MOLINO (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL SORVEGLIANTE · IL NOTAIO', [('Il Sorvegliante del Molino.png', 1),
                                         ('Il Notaio.png', 1)]),
        ('IL FUOCO (CANTO)', [('Odore di fumo.png', 1),
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
        '<b>Il caso.</b> La caccia a C.B. comincia dalla carta di pregio: filigrana rara, un solo '
        'Molino delle Carte fuori città. La filiera è amministrata dal Notaio Rasca. Il '
        'capo-catena dei ritiri, che sapeva troppo, è stato annegato la notte prima di parlare.',
        '<b>La verità.</b> Rasca intesta e paga i noli per conto di C.B.; il capo-catena aveva '
        'scoperto che la carta di C.B. viaggia sulla stessa carrozza che serve il Palazzo del '
        'Lume, e per questo è stato ucciso. Stanotte Rasca va al Molino a far bruciare i registri '
        'e fugge in carrozza. Sventare = SALVARE i registri dei noli prima del fuoco (Rasca non '
        'si prende: è il ricorrente dell’Atto).',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE si produce la carta di pregio?</b> Al Molino delle Carte, due ore fuori città '
        '(le bolle alla Dogana + il deposito risme: serve più di una conferma). <i>Esatta:</i> '
        'arrivate preparati — nel 1° round della spedizione non si pesca nessuna carta Minaccia. '
        '<i>Sbagliata:</i> perdete tempo a cercare il molino — 1 uomo del molino appare in T1.',
        '<b>2. CHI amministra la filiera?</b> Il Notaio Ludovico Rasca (la testimonianza del '
        'capostazione L1 + il referto dello studio L2 + il doganiere L4). <i>Esatta:</i> «Il nome '
        'del Notaio» — al torchio potete gridare al Sorvegliante che Rasca è già fuggito e lo '
        'scarica: gli fa saltare un attacco. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. COSA SAPEVA il capo-catena annegato?</b> Che la carta di C.B. viaggia sulla '
        'carrozza del Palazzo del Lume, e a che ora parte il nolo (i suoi appunti L5 + il registro '
        'dei noli L7: serve più di una conferma). <i>Esatta (deposizione ricostruita, Taccuino):</i> '
        'conoscete l’ora del rogo e i turni della guardia — la <b>soglia-fuoco è più alta</b> '
        '(arrivate col fuoco lontano) e le prove d’ambiente sono più facili. <i>Sbagliata:</i> '
        'arrivate alla cieca, il fuoco parte prima.',
        '<b>4. COSA portate al Molino?</b> LA CASSETTA STAGNA (il Deposito delle Risme, entro le '
        '20). <i>Con la Cassetta:</i> i registri presi al torchio sono SALVI dal fuoco (vittoria '
        'piena). <i>Senza:</i> se il fuoco è alto, ogni round al torchio li danneggia (vittoria '
        'parziale). Aiuti: il Lasciapassare del Nolo (Stazione, salta lo sbarramento T1), il '
        'Taccuino del Capo-Catena (alza la soglia-fuoco). <i>Esche:</i> la Lettera di '
        'Raccomandazione e il Timbro del Notaio.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «Il '
        'capostazione» (L1), il Referto «La cortesia del Notaio» (L2) e la Testimonianza «Il '
        'doganiere» (L4). Senza nessuna, giudicate con elasticità una risposta «vicina» (es. «il '
        'notaio che intesta i noli»). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre. <b>NB trasferta:</b> il Molino (L9) costa '
        '2 ore in Indagine: molti tavoli lo lasciano alla Spedizione.',
    ])
    pagina('spedizione — il molino che brucia', [
        '<b>Montaggio</b> (tessere in Episodio 13/board/, coperte tranne T1):<br/>'
        'T1 Cortile del Molino (partenza, da Sud) → T2 Roggia (pericolo acqua) → T3 Sala delle '
        'Macine (ingranaggi) → T4 Magazzini di Stracci (appare il Notaio, parte il fuoco) → T5 '
        'Essiccatoio → T6 Sala del Torchio (i registri). Col Lasciapassare del Nolo si salta lo '
        'sbarramento di T1.',
        '<b>La soglia-fuoco.</b> Segnate il Canto come al solito. Alla <b>soglia-fuoco = Canto '
        '4</b> (5 con il Taccuino del Capo-Catena), i magazzini prendono fuoco: da quel round, '
        'l’Essiccatoio (T5) e il Torchio (T6) sono in fiamme (prova NERVI o 1 danno ad '
        'attraversarli), e ogni round al torchio senza Cassetta Stagna danneggia i registri. Le '
        'carte crescendo (fumo/focolaio) accelerano.',
        '<b>Pericoli d’ambiente.</b> Roggia (T2): prova VIGORE/DESTREZZA o si cade in acqua (1 '
        'round perso). Macine (T3): combattere addosso agli ingranaggi = prova NERVI o rischio. '
        'Col Taccuino del Capo-Catena queste prove sono a Facile (conoscete il molino). Il secchio '
        'da T3 rimanda di 1 la soglia-fuoco per chi lo porta.',
        '<b>Il Notaio.</b> Appare in T4, dà l’ordine di bruciare, e alla fine del round successivo '
        'fugge in carrozza (rimosso). NON combatte e NON si prende: è il ricorrente dell’Atto III. '
        'Inseguirlo = un round perso e il fuoco che avanza. Puntate ai registri.',
        '<b>Il Sorvegliante.</b> Boss: Att +3, Dif 8, Fer 6, Mov 3, Danno 2. Guarda il torchio: '
        'superatelo o abbattetelo per la cassaforte. Nessuna debolezza-oggetto. «Il nome del '
        'Notaio» (D2 esatta): saltare un attacco. Ai tavoli da 2-3 eroi non recupera ferite.',
        '<b>Vittoria.</b> Registri presi (Interagire alla cassaforte, T6) e messi nella Cassetta '
        'Stagna = <b>vittoria piena</b> (prova intatta). Presi col fuoco alto e senza cassetta = '
        '<b>vittoria parziale</b> (prova degradata: l’Atto prosegue, ma l’Ep. 18 avrà un incrocio '
        'più fragile). <b>Il mazzo:</b> 21 carte (7 uomini del molino, 6 insidie d’ambiente, 4 '
        'crescendo-fuoco, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se salvate i registri.</b> «La Cassetta Stagna si '
        'chiude con uno scatto mentre alle vostre spalle i magazzini di stracci si accendono come '
        'una torcia. Fuori, la carrozza del Notaio è già una lanterna che rimpicciolisce sulla '
        'strada di città: Rasca non l’avete preso, e lo sapevate. Ma nella cassetta avete i noli, '
        'e i noli dicono una cosa incredibile: la carta di C.B. e la carta della vostra Società '
        'prendono la stessa carrozza, alla stessa ora, da sessant’anni. Non è una coincidenza dei '
        'vetturini. È che C.B. paga da dove pagate voi.»',
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
        '<b>AGGANCIO.</b> Sul registro del molino, tra i clienti storici, sessant’anni di '
        'forniture a un professore collezionista. Iniziali C.B. Un nome che in città conoscono '
        'tutti: il rivale storico del vostro presidente.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'ottenuto solo la vittoria parziale (registri degradati), l’Ep. 18 partirà con un '
        'incrocio in meno: la prova salvata a metà pesa a metà.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI13_DESC = {
    1: "La Stazione delle Carrozze è lo snodo dei trasporti di terraferma: "
       "rimesse, cavalli, il quadro dei noli. Da qui parte, ogni notte, il "
       "nolo puntuale della carta di pregio; e qui lavorava il capo-catena, "
       "prima che il canale se lo prendesse.",
    2: "Lo studio del Notaio Rasca è ordine e cortesia: scaffali di pratiche, "
       "bolli, ceralacca. Ogni carta è in regola, ogni pagamento tracciato. "
       "È il posto più pulito della città — ed è proprio la sua pulizia "
       "impeccabile a puzzare di bruciato.",
    3: "L'Ufficio del Fermo-Posta è uno dei tre che comprano la carta col "
       "giglio: caselle numerate, ritiri riservati. La carta pregiata costa "
       "un occhio, e la compra solo chi ha da scrivere cose che devono "
       "sembrare autentiche — o esserlo.",
    4: "La Dogana Vecchia timbra le bolle di transito delle risme dal molino "
       "fuori porta. Roba pulita, dazio pagato; troppo pulita. È qui che il "
       "capo-catena veniva a confrontare i noli, e qui che aveva copiato "
       "l'ultima bolla prima di finire in acqua.",
    5: "La casa del capo-catena è la stanza di un uomo che aveva cominciato a "
       "contare: fogli, colonne di date, un mezzo diario, e una riga "
       "sottolineata due volte. Non una confessione — un calcolo, quello per "
       "cui è annegato. I morti non depongono, ma lasciano il calco.",
    6: "La Cancelleria Vescovile compra la carta col giglio alla luce del "
       "sole, per gli atti solenni della diocesi: il compratore di facciata "
       "perfetto e involontario. Finché esiste chi la compra per forza, chi "
       "la compra di nascosto non spicca.",
    7: "La Prefettura custodisce i registri di ogni nolo autorizzato: è qui "
       "che il calcolo del capo-catena trova conferma nero su bianco. "
       "Sessant'anni di forniture allo stesso 'C.B.', e una carrozza che, "
       "certe notti, fa una fermata di troppo.",
    8: "Il deposito delle risme riceve la carta dal molino fuori porta e la "
       "smista ai tre compratori: bolle, quantità, date. Qui, in un armadio, "
       "una cassetta di latta stagna — la sola cosa che, stanotte, può "
       "portar via delle carte sane da un molino in fiamme.",
    9: "Il Molino delle Carte è due ore fuori le mura, sull'acqua: rogge, la "
       "grande macina, i magazzini di stracci per la pasta. È qui che nasce "
       "la filigrana col giglio, e qui che stanotte qualcuno vuole ridurre in "
       "cenere i registri prima che li leggiate.",
}

OGGETTI_LUOGO_13 = {
    1: ['Il Lasciapassare del Nolo'],
    2: ['Il Timbro del Notaio'],
    5: ['Il Taccuino del Capo-Catena'],
    6: ['La Lettera di Raccomandazione'],
    8: ['La Cassetta Stagna'],
}

TILE_ART_13 = {t['id']: t['id'] + '-ep13.png' for t in TILES_13}
LUOGHI13_CROP = {}

TESSERE_DESC_13 = {
    'T1': "Il cortile del Molino delle Carte, di notte: la grande ruota ferma "
          "sull'acqua nera, la carrozza del Notaio coi cavalli già attaccati, "
          "il fiato che fuma nell'aria fredda. Alcuni uomini del molino "
          "montano la guardia al cancello, annoiati, finché non vi vedono.",
    'T2': "La roggia di adduzione taglia il molino come una ferita: acqua "
          "nera e veloce che precipita verso la ruota, passerelle di assi "
          "viscide gettate di traverso. Un passo falso e la corrente ti "
          "prende e ti porta sotto la macina. Si sente già il rombo, più "
          "avanti.",
    'T3': "La sala delle macine è tutta frastuono: la grande ruota muove "
          "ingranaggi e magli che pestano gli stracci in poltiglia, cinghie "
          "che frustano l'aria. Il rumore copre le voci e i passi. Chi "
          "combatte qui rischia gli ingranaggi più delle lame: la macchina "
          "non distingue amici da nemici.",
    'T4': "I magazzini di stracci sono montagne di stoffa fino al soffitto, e "
          "l'aria è densa di polvere infiammabile. In mezzo, immobile ed "
          "elegante, il Notaio Rasca: guarda i registri, poi voi, con la "
          "calma di chi ha già deciso. Dice una parola ai suoi uomini e si "
          "avvia alla carrozza. Odore di petrolio.",
    'T5': "L'essiccatoio è un labirinto di telai e di fogli appesi ad "
          "asciugare, corridoi stretti di carta pendente che sfiora la "
          "faccia. Bello e mortale: un solo tizzone, qui dentro, e diventa "
          "una galleria di fuoco. In fondo, la luce rossa del torchio.",
    'T6': "La sala del torchio: il grande torchio di ferro e legno, e accanto "
          "la cassaforte dei registri, circondata di stracci ammonticchiati "
          "come per un rogo. Davanti alla cassaforte, largo e immobile, il "
          "Sorvegliante. Dietro di voi, l'essiccatoio comincia a scaldarsi. "
          "Prendere e uscire: non c'è un secondo tiro.",
}

ESAMI_CARBONE_13 = {
    'LA FILIGRANA': '«Il giglio spezzato, in controluce, è la stessa mano d’ogni carta di pregio '
                'della campagna: non una cartiera che vende a tanti, ma un’unica risma tagliata su '
                'misura per una penna sola. Chi scrive su questa carta vuole che ogni suo foglio '
                'sia riconoscibile e irripetibile — la firma di chi non firma.»',
    'IL REGISTRO DEI NOLI': '«Sessant’anni di forniture allo stesso cliente storico, "C.B.", '
                'pagate al centesimo e sempre in orario; e il nolo parte con la carrozza che, '
                'certe notti, serve anche il Palazzo del Lume. I vetturini non sanno di esserlo, '
                'ma chi paga la carta di C.B. paga da dove pagate voi: è in casa, e da '
                'sessant’anni.»',
    'IL TACCUINO DEL CAPO-CATENA': '«Non una confessione: un uomo che aveva cominciato a contare. '
                'Colonne di date e di noli, e in fondo una riga sottolineata due volte — l’ora in '
                'cui, ogni settimana, la carta di C.B. e la carta della Società prendono la stessa '
                'strada. Sapeva di valere quella riga. È annegato per quella riga: la sua '
                'deposizione, ricostruita, arriva viva dove lui non è arrivato.»',
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
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_13.get(n, [])]

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
