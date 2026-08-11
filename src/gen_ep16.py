# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 16: Un caso qualunque (Episodio 16/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-16.md e CAMPAGNA-EPISODI.md). Atto III,
standalone di RESPIRO: la figlia del lampionaio rapita dallo Sposo, un
truffatore matrimoniale. Caso piccolo e umano, zero culto — il boss più debole
della campagna, apposta. Ma la lettera d'incarico di M. cita il «nastro al
polso», un segreto che nessuno gli ha detto: la crepa. Debutta la meccanica
di campagna della RILETTURA (rileggere le vecchie lettere di M. banca incroci
per l'Ep. 18). Un solo seme: il nastro nella lettera di M.

Varietà strutturale (regola 2026-07-18): il respiro (manopole al minimo, verso
il basso); finale = liberare una persona smontando un inganno, non un boss.
Torsione d'indagine: «il dettaglio che il mandante non poteva sapere» (la
rilettura: per la prima volta si indaga il maestro).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 16.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 16', 'pdf')
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

LETTERA_16 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Un caso da nulla, per riposarvi la mente dopo tanto veleno: <b>Nina</b>, la figlia del "
    "lampionaio di riva, è sparita da tre giorni. Dicono fuga d’amore. Riportatemela a casa — la "
    "piccola col <b>nastro al polso</b>. Il padre accende ancora i lampioni ogni sera, come "
    "se lei potesse tornare a vederli.<br/><br/>"
    "E già che rileggete il fascicolo, fatemi un favore: <b>rileggete anche i miei</b>. Le vecchie "
    "lettere d’incarico, quelle che conservate. Con calma, una per una. A volte un uomo scrive più "
    "di quanto sappia di scrivere. Avete <b>6 ore</b>, dalle 18:00 alle 24:00; e dovunque l’abbia "
    "portata, non può essere lontano.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<font name=\"OldStd-Italic\"><i>Luoghi disponibili dall’inizio: la Casa del Lampionaio, il Caffè degli Annunci, la Gazzetta "
    "di Roccamora e la Stazione delle Carrozze. Gli altri andranno sbloccati. NUOVO — la RILETTURA: "
    "rileggere le vecchie lettere di M. al Taccuino banca incroci per l’Episodio 18, "
    "al massimo 3.</i></font>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «il nastro verde» (SOLO L1, tre volte: la lettera d'incarico dice «il nastro
# al polso» senza il colore, altrimenti la serratura del Luogo 6 — «apre solo a
# chi ha notato la crepa» — si apriva alle 18:00 leggendo la busta; e il
# capostazione NON lo nomina piu' — se un estraneo lo ha visto non e' un
# segreto, e la crepa della D4 crolla),
# «la fuga d'amore» (L1+L2), «lo sposo perfetto» (L2+L3),
# «la carrozza per il lago» (L3+L4). Rivelatorio (D2) su L1, L2, L3.
LUOGHI_16 = [
    dict(n=1, nome='LA CASA DEL LAMPIONAIO', voce_mappa='La Casa del Lampionaio',
         req='Disponibile dall’inizio', art='La Casa del Lampionaio.png',
         chiude=None,
         indizi=[
             'Il lampionaio è un uomo spezzato che accende ancora i lumi ogni sera: «la mia Nina '
             'non è scappata per amore, signori. Lo dicono tutti, la fuga d’amore, ma io la '
             'conosco. Un bel giovane le girava intorno, promesse di nozze… e poi il nulla. Non '
             'una riga. Una fuga d’amore lascia almeno un biglietto.»',
             'Sul comò, la fotografia di Nina. Il padre indica il polso: «vede? Non c’è, '
             'nella foto, ma glielo avevo legato io, un nastro verde, il giorno che ha '
             'compiuto vent’anni. Un segno nostro, tra me e lei. Non l’ho mai detto a '
             'nessuno. Se la trovate col nastro verde al polso, è la mia Nina.»',
             'Il padre, sottovoce: «è strano, però. Ieri è passato un signore della vostra Società '
             'a portarmi coraggio, gentile. Ha detto “la ritroveremo, la piccola col nastro '
             'verde”. Ma io il nastro verde non l’avevo detto a nessuno. A nessuno. Come faceva a '
             'saperlo?»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il lampionaio',
                  testo='«Ve lo dico perché mi pesa sul cuore: il nastro verde al polso di Nina '
                        'era un segreto tra me e lei, un pegno di compleanno, mai detto ad anima '
                        'viva. Eppure il signore della vostra Società lo sapeva, ieri, prima ancora '
                        'che voi arrivaste. Io non capisco queste cose. Ma voi che indagate — '
                        'chiedetevi come fa un uomo a sapere un segreto che nessuno gli ha detto. '
                        'Io, la notte, non dormo più a pensarci.»'),
         ]),
    dict(n=2, nome='IL CAFFÈ DEGLI ANNUNCI', voce_mappa='Il Caffè degli Annunci',
         req='Disponibile dall’inizio', art='Il Caffè degli Annunci.png',
         chiude=None,
         indizi=[
             'Il caffè dove si leggono gli annunci matrimoniali è il territorio di caccia dello '
             'sposo perfetto: «un giovanotto distinto, sempre elegante, faceva la corte alle '
             'ragazze coi begli annunci. Lo sposo perfetto, dicevano. Troppo perfetto: spariva '
             'appena firmata la promessa di dote.»',
             'Sul tavolino d’angolo, un biglietto d’amore dimenticato, firma illeggibile.',
             'La cameriera ricorda Nina: «veniva qui con lui, raggiante. Poi un giorno lui le ha '
             'detto che partivano per sposarsi in una villa sul lago, lontano dalle chiacchiere. '
             'Lei era felice. Non sapeva. Ho provato ad avvertirla, ma l’amore è sordo.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La cameriera del caffè',
                  testo='«Non è la prima, sa. Ne ho viste altre, negli anni, sedersi a quel tavolo '
                        'con lo stesso tipo di uomo, la stessa luce negli occhi, e poi sparire nel '
                        'nulla o tornare rovinate. Lo sposo perfetto cambia faccia e nome, ma è '
                        'sempre lo stesso mestiere: promette nozze, si fa firmare la dote, e via. '
                        'Non è un mostro dei vostri, signori. È solo un uomo che ha fatto del cuore '
                        'delle ragazze un commercio.»'),
         ]),
    dict(n=3, nome='LA GAZZETTA DI ROCCAMORA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         chiude=None,
         indizi=[
             'Negli archivi della Gazzetta, gli annunci matrimoniali degli ultimi anni e le '
             'sparizioni che li seguono: «lo sposo perfetto lascia una scia. Ragazze di buona '
             'famiglia, doti sparite, nessuna denuncia per vergogna. Un mestiere silenzioso.»',
             'Ranuzzi incrocia le date: «e c’è sempre una carrozza per il lago, negli ultimi '
             'colpi. Affitta una villa fuori porta, ci porta la ragazza col miraggio delle nozze, '
             'la spenna e sparisce dall’altra sponda. La carrozza per il lago è la sua firma.»',
             'Il cronista, con dispiacere di mestiere: «di solito cacciate mostri. Questo è un '
             'truffatore da caffè, non gli darei mezza colonna. Eppure le ragazze che si porta '
             'via non tornano più quelle di prima, e di quelle non scrive nessuno.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La scia dello Sposo',
                  testo='Incrociate gli annunci e le sparizioni: lo Sposo è un seriale prevedibile, '
                        'quasi noioso nella sua meccanica. Villa affittata sul lago, promessa di '
                        'nozze, dote firmata, fuga dall’altra sponda. Nessun mistero, nessuna '
                        'ombra: un mestiere ripetuto tante volte da diventare prevedibile — e la '
                        'prevedibilità è l’unica cosa di lui che potete usare. Sapete dove porta '
                        'le ragazze e sapete cosa aspetta per sparire: la firma sulla dote. '
                        'Finché quella carta non è firmata, Nina gli serve viva e contenta.'),
         ]),
    dict(n=4, nome='LA STAZIONE DELLE CARROZZE', voce_mappa='La Stazione delle Carrozze',
         req='Disponibile dall’inizio', art='La Stazione delle Carrozze.png',
         chiude=None,
         indizi=[
             'Alla Stazione, il capostazione ricorda la partenza: «tre giorni fa, una ragazza e un '
             'signore distinto, carrozza per il lago. Lei rideva — quella risata l’ho sentita '
             'prima di vederla. Vestito buono della domenica, una valigia sola, e i guanti lunghi '
             'della festa: delle mani, di lei, non ho visto niente. Sono partiti verso ponente.»',
             'Il registro dei noli segna la carrozza per il lago: «villa dei Càrpine, sponda di '
             'ponente, affitto trimestrale. Poco fuori porta, un’ora scarsa. È lì che vanno tutti '
             'quelli che vogliono sparire senza andare troppo lontano.»',
             'Un mozzo di stalla, timido: «il signore distinto è tornato indietro due volte, da '
             'solo, sempre di notte. Una villa di nozze non ha bisogno di viaggi di notte. Quello '
             'lì non sposa nessuno: quello lì tiene qualcuno.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il capostazione',
                  testo='«La ragazza me la ricordo bene, ma non per la faccia: rideva come chi non '
                        'ha mai preso una vettura per andare lontano, e lui la teneva per il gomito '
                        'con la cortesia che si usa coi bauli. Le facce non le tengo a mente, '
                        'signori, tengo a mente gli orari. E la carrozza per il lago era quella di '
                        'sempre, la '
                        'villa dei Càrpine sulla sponda di ponente. Un’ora scarsa da qui. Se '
                        'cercate la piccola del lampionaio, è là che l’hanno portata: non a nozze, '
                        'ma a marcire finché lui non ha in mano la dote.»'),
         ]),
    dict(n=5, nome='LA CASA DELL’EX FIDANZATA', voce_mappa='La Casa dell’Ex Fidanzata',
         req='La casa di una vittima precedente apre solo a chi ha capito il mestiere del rapitore: '
             'lo sposo perfetto che colleziona cuori e doti.',
         chiave=('parola', 'LO SPOSO PERFETTO'), art='La Casa dell’Ex Fidanzata.png',
         chiude=None,
         indizi=[
             'Una donna rovinata anni fa dallo stesso uomo, la voce piatta di chi non si stupisce '
             'più: «lo sposo perfetto. Sì. Anche a me. Villa sul lago, promesse, la mia dote. Poi '
             'il nulla e la vergogna. Non ho denunciato: chi mi avrebbe creduto?»',
             'Tiene un fascicolo che si è costruita da sola negli anni, per rabbia: nomi, '
             'date, le altre vittime che è riuscita a rintracciare. «Se salvate quella '
             'ragazza, mettetele questo davanti. È l’unica cosa che scioglie l’incantesimo: '
             'vedere che non sei l’unica.»',
             'Sul retro del fascicolo, un elenco di dieci nomi diversi dello stesso uomo. '
             '«Dieci nomi. Nessuno è il vero. Chiedetegli quale, e lo vedrete perdere la '
             'faccia.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il male con una misura',
                  testo='Nella casa di questa donna il male ha una faccia piccola e un nome — anzi '
                        'dieci nomi, tutti falsi. Dopo mesi di ombre senza volto, di C.B. che non '
                        'si lascia toccare, fa quasi tenerezza un cattivo così: prevedibile, '
                        'meschino, umano. Un male con una misura si prende in una sera, e stasera '
                        'basterà. Eppure, scendendo quelle scale, vi resta addosso il freddo di '
                        'una cosa piccola che non torna — e non riguarda quest’uomo.'),
         ]),
    dict(n=6, nome='L’ARCHIVIO DELLE LETTERE', voce_mappa='L’Archivio delle Lettere',
         req='L’archivio delle lettere della Società apre solo a chi ha notato la crepa: il nastro '
             'verde che il presidente sapeva prima di tutti.',
         chiave=('parola', 'IL NASTRO VERDE'), art='L’Archivio delle Lettere.png',
         # NON rimettere 18: l'indagine COMINCIA alle 18:00 e luogoVisitabile
         # chiude a `ora >= chiude`, quindi il luogo era irraggiungibile dal
         # primo istante — e con esso la Lettera di M., il Reperto A e la
         # RILETTURA. Il controllo dell'orologio precede la serratura
         # (indagine.js), quindi nemmeno il Grimaldello di Nino entrava.
         chiude=21,
         indizi=[
             'Il Taccuino e le vecchie lettere d’incarico di M.: non le vostre copie, le sue '
             'minute — compresa la prima, quella che vi ordinò di bruciare. È qui che debutta '
             'la RILETTURA: rileggere le lettere passate, con occhi nuovi.',
             'La lettera di stanotte nomina «la piccola col nastro al polso». Quel nastro è '
             'un dettaglio che la famiglia non ha mai confidato a nessuno, ed è qui di pugno '
             'del presidente, scritto prima che voi lo scopriste. Impossibile — eppure eccolo.',
             'Rilette in fila, le vecchie lettere hanno tutte, ognuna, un dettaglio di '
             'troppo: una cosa saputa un giorno prima del dovuto, un nome anticipato, una '
             'data. Prese una a una, coincidenze. Prese insieme, una firma.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La firma nelle lettere',
                  testo='Il nastro verde non è un caso isolato. Rileggete le lettere d’incarico di '
                        'M. dal primo giorno, e ognuna nasconde un dettaglio che lui non poteva '
                        'sapere per vie oneste: il nome di un colpevole prima delle prove, un '
                        'luogo prima della scoperta, un morto prima del ritrovamento. Uno alla '
                        'volta, li avete letti come genio deduttivo. Tutti insieme, sono altro: '
                        'sono un uomo che sa perché è lui a muovere le cose. Rileggete tutto: '
                        'ogni lettera riletta è un mattone per il giorno in cui lo chiederete a '
                        'lui, al massimo 3 per sessione.'),
         ]),
    dict(n=7, nome='IL FIORAIO', voce_mappa='Il Fioraio',
         req='La bottega del fioraio apre a chi segue il metodo d’adescamento dello sposo perfetto: '
             'i fiori con cui incanta le ragazze.',
         chiave=('parola', 'LO SPOSO PERFETTO'), art='Il Fioraio.png',
         chiude=None,
         indizi=[
             'Il fioraio conosce bene il cliente: «lo sposo perfetto, sì, compra sempre le stesse '
             'rose bianche, ogni volta per una ragazza diversa. Paga bene, sorride. Mai capito che '
             'faccia avesse davvero: cambia baffi, cambia nome.»',
             'Un mazzo pronto, ordinato e non ritirato.',
             'Il fioraio, indicando un registro: «l’ultima consegna l’ho fatta io stesso, tre '
             'giorni fa, alla villa sul lago. Rose bianche e un biglietto: “presto sposi”. Povera '
             'figliola. Le rose, a quella, gliele ho portate io senza saperlo alla sua prigione.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le rose dell’inganno',
                  testo='Le rose bianche sono lo strumento del mestiere: fanno credere all’amore '
                        'chi ha voglia di crederci. Il fioraio è l’unico che ha visto lo Sposo da '
                        'vicino, ma non serve a nulla — dieci nomi, dieci facce. La pista dei '
                        'fiori porta solo alla villa, che già conoscete: un vicolo cieco '
                        'profumato. Serve però a misurare l’uomo: paga in contanti, ordina sempre '
                        'lo stesso mazzo, non lascia mai un indirizzo. Non è audacia, è '
                        'abitudine — e l’abitudine è la sola cosa per cui lo si aspetta al varco.'),
         ]),
    dict(n=8, nome='IL REGISTRO DEGLI AFFITTI', voce_mappa='Il Registro degli Affitti',
         req='L’ufficio degli affitti apre a chi sa dove cercare: la villa presa in affitto per '
             'la fuga, la carrozza per il lago.',
         chiave=('parola', 'LA CARROZZA PER IL LAGO'), art='Il Registro degli Affitti.png',
         chiude=None,
         indizi=[
             'Il registro degli affitti trova la villa dei Càrpine: affittata un mese fa con '
             'nome falso, pagamento anticipato, sponda di ponente. Sapete dove sbarcare.',
             'Le condizioni d’affitto: «trimestrale, riservata, con imbarcadero e barca». Una '
             'barca all’imbarcadero: la via di fuga dello Sposo, se lo mettete alle strette.',
             'L’impiegato ricorda: «il signore che l’ha affittata era gentile, sbrigativo. Ha '
             'firmato con un nome, ma ne ha detto un altro all’uscita, per sbaglio. Uno di quei '
             'tipi con troppi nomi. Non mi è tornato, ma l’affitto era in regola.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La villa dell’inganno',
                  testo='La villa sul lago è la scena perfetta della truffa: isolata, riservata, '
                        'con una barca sempre pronta all’imbarcadero. Non una prigione con le '
                        'sbarre, ma una prigione di miraggi, dove una ragazza aspetta nozze che non '
                        'verranno. Sapere dov’è e che c’è una barca vi dice come finirà: o lo '
                        'prendete prima che raggiunga il molo, o vi scappa sull’acqua con lei per '
                        'scudo. Portate qualcosa che spezzi l’incantesimo, non solo qualcosa che '
                        'spezzi le ossa.'),
         ]),
    dict(n=9, nome='LA VILLA SUL LAGO', voce_mappa='La Villa sul Lago',
         req='La villa sul lago, poco fuori porta, dove finisce il caso: ci si va sapendo che è '
             'lì che porta la carrozza per il lago.',
         chiave=('parola', 'LA CARROZZA PER IL LAGO'), art='La Villa sul Lago.png',
         chiude=None,
         indizi=[
             'La villa dei Càrpine sulla sponda di ponente, di sera: giardino, serra, un '
             'imbarcadero con la barca pronta. Dentro, lo Sposo recita la parte del fidanzato '
             'premuroso davanti a Nina, che ancora non sa.',
             'Nel salone, Nina col nastro verde al polso, felice, in attesa di nozze che non '
             'verranno. Liberarla non è questione di forza: è questione di verità. Mostratele il '
             'Fascicolo delle Vittime e l’incantesimo crolla.',
             'I due complici — un cocchiere e un tuttofare — fanno la ronda annoiati. Nessuna '
             'scorta armata, nessun mostro: una casa di provincia e tre imbroglioni. Lo scontro '
             'più piccolo che abbiate mai avuto. E, forse, per questo, il più giusto.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La ragazza che aspetta le nozze',
                  testo='Nella villa illuminata a festa per un matrimonio che non ci sarà, una '
                        'ragazza col nastro verde al polso aspetta di essere felice. Non c’è un '
                        'Dormiente, non c’è un Coro, non c’è C.B.: c’è solo un uomo meschino e una '
                        'bugia grande abbastanza da tenere prigioniera una giovane senza catene. '
                        'Riportatela al padre e ai suoi lampioni. È il caso più piccolo della '
                        'vostra carriera. Fatelo bene: perché domani, quando il decano non ci sarà '
                        'più, rimpiangerete i casi piccoli.'),
         ]),
]

# Tessere della villa (percorso lineare a 6). Obiettivo = liberare Nina (T6) e
# catturare lo Sposo. NIENTE soglia-catastrofe: col Fascicolo la cattura è
# automatica; senza, lo Sposo tenta la barca (T5). Boss: lo Sposo (debole).
TILES_16 = [
    dict(id='T1', nome='IL CANCELLO DEL GIARDINO', exits={'N': 'T2'}, start='S',
         testo='Il cancello del giardino della villa sul lago, di sera: siepi, un viale di ghiaia, '
               'le finestre illuminate a festa. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito '
               'delle Domande 3 e 4. Con l’Indirizzo della Villa entrate dal punto giusto, senza '
               'giri a vuoto.',
         arbitro='Nessuno sbarramento serio: è una villa, non una fortezza. Senza l’Indirizzo, '
                 'perdete il primo round a orientarvi nel buio del giardino (nessun danno). Questo '
                 'episodio non ha soglie di catastrofe: solo lo Sposo da prendere prima della barca.',
         hook='L’Indirizzo della Villa (dal Registro degli Affitti): entrate dal punto giusto, '
              'niente round perso a orientarvi.',
         cerca_vuoto='Solo ghiaia e il profumo delle rose bianche. Il viale è '
                     'rastrellato da poco, le siepi tosate a squadra: qui non si passa '
                     'senza lasciare un’impronta.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL GIARDINO', exits={'S': 'T1', 'N': 'T3'},
         testo='Il giardino all’italiana: aiuole, statue, un pergolato. QUANDO RIVELATE QUESTA '
               'TESSERA: un complice (il cocchiere) fa la ronda, annoiato, e vi scambia per '
               'invitati finché non capisce.',
         arbitro='Un complice (Sgherro) di ronda. Non è un sicario: se lo mettete a terra, gli '
                 'altri si spaventano. Nessun pericolo d’ambiente serio in questo episodio.',
         cerca='Sotto il pergolato, una bottiglia di vino delle «nozze» (utile: rovesciata sul '
               'pavimento della serra, i complici scivolano — 1 complice salta un turno).',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA SERRA', exits={'S': 'T2', 'N': 'T4'},
         testo='La serra: vetri appannati, piante grasse, umidità. QUANDO RIVELATE QUESTA TESSERA: '
               'il secondo complice (il tuttofare) è qui a curare le rose bianche dell’inganno.',
         arbitro='Il secondo complice (Sgherro). Ambiente innocuo: al più i vetri, che non feriscono '
                 'ma fanno rumore (se combattete qui, la prossima carta Minaccia si pesca subito).',
         cerca_vuoto='Rose bianche a decine, tagliate e in secchi d’acqua, sotto un '
                     'vetro che gocciola. Fra i vasi non c’è che terriccio, forbici e '
                     'gomitoli di spago.',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL SALONE', exits={'S': 'T3', 'N': 'T5'},
         testo='Il salone illuminato a festa: lo Sposo, elegante, recita la parte del fidanzato '
               'premuroso davanti a Nina col nastro verde al polso. QUANDO RIVELATE QUESTA '
               'TESSERA: lo Sposo vi vede, e capisce che è finita.',
         arbitro='Lo Sposo comincia a manovrare per portare Nina verso l’imbarcadero (T5) e usarla '
                 'come scudo per la barca. Se avete il Fascicolo delle Vittime, potete già qui '
                 'mostrarlo a Nina: l’incantesimo si incrina, lei rallenta i suoi piani.',
         hook='Il Fascicolo delle Vittime (dalla ex fidanzata): mostrato a Nina, spezza la bugia '
              '— lo Sposo perde lo scudo e la cattura diventa automatica alla stanza (T6).',
         cerca_vuoto='Tavoli imbanditi per un banchetto: argenteria a nolo, e i '
                     'cartellini dei posti scritti tutti dalla stessa mano. Nessuna '
                     'carta, nessuna lettera, niente da prendere.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='L’IMBARCADERO', exits={'S': 'T4', 'N': 'T6'},
         testo='L’imbarcadero sul lago, la barca legata e pronta. QUANDO RIVELATE QUESTA TESSERA: '
               'se lo Sposo arriva qui con Nina ancora incantata, tenta la fuga sull’acqua '
               'usandola come scudo.',
         arbitro='Punto di fuga. Se Nina è ancora sotto l’inganno (niente Fascicolo), lo Sposo la '
                 'trascina alla barca: fermarlo richiede una prova rischiosa (rischia di cadere in '
                 'acqua con lei). Col Fascicolo, Nina non lo segue: niente fuga, niente rischio.',
         cerca_vuoto='Acqua nera e una barca che dondola contro i respingenti di corda. '
                     'Sull’imbarcadero, un bidone di petrolio e una lampada spenta: '
                     'nient’altro.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA STANZA DI NINA', exits={'S': 'T5'},
         testo='La stanza preparata per la «prima notte di nozze», dove Nina aspetta. QUANDO '
               'RIVELATE QUESTA TESSERA: qui si chiude il caso — si libera Nina e si prende lo '
               'Sposo, con la verità o con la forza.',
         arbitro='OBIETTIVO. Col Fascicolo delle Vittime mostrato a Nina, l’inganno crolla: lei si '
                 'stacca dallo Sposo, che resta senza scudo — CATTURA AUTOMATICA (vittoria pulita). '
                 'Senza il Fascicolo, dovete strapparla con la forza mentre lui si dibatte: '
                 'vittoria «amara» (ci riuscite, ma male). «Quale nome?» (D2): chiedergli quale dei '
                 'dieci sia il vero lo confonde, salta un attacco. '
                 '— APPENA NINA È LIBERA, leggete ad alta voce: «Nina non guarda il giardino '
                 'da cui siete venuti. — Di lì si scende all’imbarcadero. Lo Sposo ci fa '
                 'portare i bauli delle “mogli”: la porta sul retro non la chiude mai, dà '
                 'sull’acqua.» Il gruppo sa che si esce da questa stanza, ma non da sotto '
                 'quale mobile: scoprirlo è Interagire adiacenti a un mobile + prova VIGORE '
                 '(Media). '
                 '— SEGRETO: è dietro le CASSE accanto al letto (uno dei tre mobili). '
                 '— QUANDO NINA SCENDE ALL’IMBARCADERO la spedizione è VINTA: leggete '
                 'l’epilogo. Non serve rifare a ritroso la villa.',
         cerca_vuoto='La stanza è preparata come una scena: lenzuola nuove, candele '
                     'accese, un vestito appeso che nessuno ha mai indossato. Niente, '
                     'qui, è davvero di qualcuno.',
         # La stanza aveva UN SOLO mobile, mentre il testo promette «non sapete
         # da sotto quale»: la ricerca aveva un candidato solo, cioe' nessuna.
         # Una camera nuziale allestita ne ha piu' d'uno, e il motore gia'
         # tiene il conto dei tentativi andati a vuoto (`uscitaTentati`).
         arredi=[(0, 2, 'casse'), (3, 2, 'armadio'), (2, 3, 'toeletta')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore). Il boss piu' debole.
NEMICI_16 = [
    dict(nome='LO SPOSO', att=2, dif=7, fer=4, mov=3, dan=1, boss=True,
         tipo='Il Truffatore Matrimoniale (Boss)', art='Lo Sposo.png',
         note='Il boss più debole della campagna, apposta. DEBOLEZZA: il Fascicolo delle Vittime '
              '(D3) — mostrato a Nina, gli toglie l’ostaggio e la cattura è automatica. «Quale '
              'nome?» (D2 esatta): chiedergli quale dei dieci nomi sia il vero lo confonde, salta '
              'un attacco. Se arriva all’imbarcadero (T5) con Nina sotto l’inganno, tenta la fuga '
              'in barca. Ai tavoli da 2-3 eroi non recupera mai Ferite (regola delle taglie).',
         bio_bestiario='Lo Sposo — Aldo Sereni, o Marco Vela, o uno dei dieci nomi che indossa '
              'come cravatte — è un truffatore matrimoniale, non un mostro. Colleziona cuori e '
              'doti: promette nozze alle ragazze di buona famiglia, si fa firmare la dote, e '
              'sparisce dall’altra sponda del lago lasciandole rovinate e mute per la vergogna. È '
              'vile, viscido, quasi patetico (Att 2, Fer 4, Danno 1): il contrario di tutto ciò che '
              'la Società caccia da sedici mesi. Non ha scorta armata, solo due complici da '
              'quattro soldi; non ha un culto, solo l’avidità; non ha un piano, solo un metodo '
              'ripetuto. La sua unica arma è la bugia con cui tiene Nina prigioniera senza '
              'catene — e quella bugia crolla nel momento in cui la ragazza vede il Fascicolo '
              'delle altre vittime. Messo alle strette, non combatte: scappa, e userebbe una '
              'ragazza come scudo senza batter ciglio. Ai tavoli da 2-3 eroi non recupera mai '
              'ferite (regola delle taglie). Prenderlo è facile. Il difficile, in questo episodio, '
              'è un’altra cosa: capire come faceva il vostro presidente a sapere del nastro verde.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 16 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 16')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'un caso qualunque')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_16.replace(
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
    c.drawCentredString(W/2, 24*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 15 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Casa del Lampionaio, il Caffè degli Annunci, la Gazzetta di Roccamora, la Stazione delle Carrozze.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 16')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). NUOVO: la RILETTURA (vedi in fondo).')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 41.5*mm, '! Archivio Lettere (6) chiude 21')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 3)
    yy = sect(yy, 'indizi e parole che tornano', 3)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE è Nina? (attenzione: serve più di una conferma)',
            '2. CHI l’ha presa?',
            '3. COSA la tiene lì?',
            '4. COSA SAPEVA M.? (il dettaglio impossibile)']
    for i, d in enumerate(doms):
        yd = yy - 9*mm - i*12*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 6*mm, W - 16*mm, yd - 6*mm)
    c.setFillColor(TEAL); c.setFont(F['sc'], 9.5)
    c.drawString(16*mm, yy - 9*mm - 4*12*mm, 'LA RILETTURA (nuovo): all’Archivio delle Lettere (6), rileggete le vecchie lettere di M.')
    c.setFillColor(INK); c.setFont(F['r'], 8.5)
    c.drawString(16*mm, yy - 9*mm - 4*12*mm - 5*mm, 'Ogni lettera riletta = 1 incrocio per l’Episodio 18, MASSIMO 3 in tutto. Segnateli sul Frammento.')
    contatori_indagine(c, W)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 16 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 16 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la villa sul lago, e una ragazza da riportare a casa')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '16/cards/</b>). Le 6 tessere della villa sono in <b>Episodio 16/board/</b>. '
                  'Questo è lo scontro <b>più piccolo</b> della campagna, apposta: nessuna soglia, '
                  'nessuna catastrofe a termine. Obiettivo: raggiungere la stanza di Nina (T6), '
                  '<b>liberarla</b> e <b>catturare lo Sposo</b>. Col <b>Fascicolo delle Vittime</b> '
                  'mostrate a Nina la verità e l’inganno crolla: cattura automatica (vittoria '
                  'pulita). Senza, la strappate con la forza mentre lui tenta la barca (vittoria '
                  'amara). Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>NIENTE SOGLIA.</b> A differenza degli altri episodi dell’atto, qui non c’è '
                  'né fuoco, né fuga, né sigillo: nessuna catastrofe a termine. Il Canto sale come '
                  'sempre (l’allarme della villa), ma non innesca nulla di irreparabile. È un '
                  'respiro.', BODY),
        Paragraph('• <b>LA FUGA IN BARCA.</b> L’unica pressione: se lo Sposo raggiunge '
                  'l’imbarcadero (T5) con Nina ancora sotto l’inganno, tenta di scappare sul lago '
                  'usandola come scudo (fermarlo lì è rischioso). Col <b>Fascicolo delle Vittime</b> '
                  'mostrato a Nina, lei non lo segue: niente fuga.', BODY),
        Paragraph('• <b>VITTORIA PULITA vs AMARA.</b> Alla stanza (T6): col Fascicolo, l’inganno '
                  'crolla e lo Sposo è preso <b>automaticamente</b> (pulita). Senza, strappate Nina '
                  'con la forza e lo Sposo si dibatte (amara: ci riuscite, ma lei si porta a casa '
                  'anche lo spavento). «Quale nome?» (D2): il boss salta un attacco. Il vero peso '
                  'dell’episodio non è qui: è nella <b>crepa</b> — M. sapeva del nastro verde.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_16:
        art_file = TILE_ART_16[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_16[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_16.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 16</b>. In campo: i <b>due '
                  'complici</b> dello Sposo (Sgherri: un cocchiere e un tuttofare, non sicari) e '
                  '<b>lo Sposo</b> (il boss più debole della campagna: Att 2, Fer 4, Danno 1). '
                  'Nessun mostro, nessuna scorta armata: una casa di provincia e tre imbroglioni. '
                  'Debolezza dello Sposo: il Fascicolo delle Vittime (cattura automatica). Ai tavoli '
                  'da 2-3 eroi lo Sposo <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_16())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_16():
    """Miniature dell'Episodio 16. Nessuna soglia: i segnalini Canto sono
    l'allarme della villa (non una catastrofe)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('I COMPLICI (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('LO SPOSO', [('Lo Sposo.png', 1)]),
        ('L’ALLARME (CANTO)', [('Un grido nella notte.png', 1),
                               ('Le luci si accendono.png', 1),
                               ('Lo Sposo capisce.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 16 - Soluzione (non aprire)')

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
        '<b>APERTURA — il Bivio dell’Episodio 15</b> (applicare PRIMA della lettera): se avete '
        'scelto <b>AVALLARE L’ARRESTO DI BRAGA</b> — la città festeggia, il caso è chiuso in '
        'gloria e chi porta una divisa o un berretto d’ordinanza vi deve un favore: è la serata '
        'tranquilla che vi era stata promessa, e il testimone in più è alla Stazione delle '
        'Carrozze — la Testimonianza «Il capostazione» (Luogo 4) parte GIÀ RIVELATA. Il prezzo '
        'non si paga qui: l’incrocio in meno è dell’Episodio 17, segnatelo ora sul Taccuino '
        'perché non ve ne dimentichiate. Se avete <b>DICHIARATO PUBBLICAMENTE IL DUBBIO</b> — la '
        'stampa vi ha sbranati, e al Caffè degli Annunci i giornali pendono ancora dalle stecche '
        'aperti sulla vostra vergogna: nessuno vuole essere visto parlare con voi a quei tavolini. '
        'Rimuovete la Testimonianza «La cameriera del caffè» (Luogo 2) dal mazzo Approfondimenti. '
        'La stessa perdita vale per l’Episodio 17 (un Testimone in meno, indicato nel suo '
        'fascicolo), e là arriva il primo pezzo del compenso: dalla cella Braga manda un biglietto '
        'e la chiave per leggere le sue carte — l’archivio resta in casa sua, e tornerà quando '
        'sarà lui a riaprire quella porta. Chi ha chiuso '
        'solo la Busta pubblica ha avallato senza saperlo: primo ramo.<br/>'
        '<b>CODA — il Bivio dell’Episodio 8</b> (retro del Frammento n. 8): lo Sposo affitta la '
        'villa, affitta la carrozza e affitta anche gli uomini — di suoi non ne ha. Se avete '
        'scelto <b>SEQUESTRARE L’ORO</b> — la Vedova Bruna non fa una guerra per un truffatore '
        'da dote, ma quando le chiedono un braccio e sotto c’è il vostro nome lo presta '
        'volentieri, e senza farselo pagare: <b>un terzo complice (Sgherro) è in campo dall’inizio, '
        'in T1</b>. Resta la serata più leggera dell’Atto — nessuna soglia, nessuna catastrofe a '
        'termine, lo Sposo è quello che è: è un uomo in più al cancello, non una guerra. Se '
        'avete scelto <b>LASCIARLO CIRCOLARE E TRACCIARLO</b> — <b>non applicate nulla</b>: i due '
        'complici sono quelli che lo Sposo si è pagato da solo, e nessuno in città ha interesse '
        'a regalargliene un altro.',
        '<b>Il caso.</b> Nina, la figlia del lampionaio, è nelle mani dello Sposo, un truffatore '
        'matrimoniale che la tiene in una villa sul lago col miraggio delle nozze. Caso piccolo, '
        'zero culto: il respiro dell’atto.',
        '<b>La verità.</b> Del caso: lo Sposo (dieci nomi) e due complici, villa affittata, la '
        'dote come bottino. Della campagna: la lettera di M. nomina il nastro al polso di '
        'Nina — un segreto che nessuno gli ha detto. La crepa. Sventare il caso = liberare Nina '
        '(col Fascicolo, senza forza) e prendere lo Sposo. Il vero episodio è la RILETTURA.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è Nina?</b> Nella villa dei Càrpine sul lago (il registro affitti L8 + la '
        'carrozza vista alla Stazione L4: serve più di una conferma). <i>Esatta:</i> sapete dove '
        'sbarcare — nel 1° round non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> perdete il '
        '1° round a orientarvi nel giardino (nessun danno: è un respiro).',
        '<b>2. CHI l’ha presa?</b> Lo Sposo, truffatore matrimoniale coi dieci nomi (il lampionaio '
        'L1 + la cameriera L2 + la scia sulla Gazzetta L3). <i>Esatta («quale nome?»):</i> alla '
        'villa, chiedergli quale dei dieci nomi sia il vero lo confonde — salta un attacco. '
        '<i>Sbagliata:</i> nessun effetto.',
        '<b>3. COSA la tiene lì?</b> Non catene: la bugia delle nozze (il Fascicolo delle Vittime '
        'L5). <i>Esatta (Fascicolo):</i> mostrato a Nina alla stanza, l’inganno crolla e la '
        'cattura dello Sposo è AUTOMATICA (vittoria pulita). <i>Sbagliata (senza Fascicolo):</i> '
        'strappate Nina con la forza, lo Sposo tenta la barca (vittoria amara).',
        '<b>4. COSA SAPEVA M.?</b> Il nastro al polso di Nina, un segreto mai confidato (la Lettera '
        'di M. all’Archivio L6). <i>La crepa:</i> non dà un vantaggio meccanico in questo episodio '
        '— dà il seme più pesante della campagna. E abilita la RILETTURA. Aiuti spedizione: '
        'l’Indirizzo della Villa (L8). <i>Esche:</i> il Mazzo di Fiori, il Biglietto d’Amore.',
        '<b>LA RILETTURA (meccanica di campagna — debutto):</b> all’Archivio delle Lettere (L6, '
        'entro le 21), come azione al Taccuino, rileggete le vecchie lettere d’incarico di M. (una '
        'per ogni episodio conservato). Ogni rilettura banca un <b>incrocio di campagna</b>: '
        'segnatelo sul Frammento. <b>La sessione di rilettura banca al massimo 3 incroci</b>, per '
        'quante lettere ne rileggiate: oltre il terzo si ripetono le stesse tre coincidenze. '
        'Nell’Ep. 18, ogni incrocio di rilettura è una risposta già in '
        'mano alla domanda «chi è C.B.». Non aggiunge difficoltà a questo episodio: carica il '
        'finale.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «Il '
        'lampionaio» (L1), la Testimonianza «La cameriera del caffè» (L2) e l’Osservazione «La '
        'scia dello Sposo» (L3). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — lo scontro più piccolo', [
        '<b>Montaggio</b> (tessere in Episodio 16/board/, coperte tranne T1):<br/>'
        'T1 Il Cancello del Giardino (partenza, da Sud) → T2 Il Giardino → T3 La Serra → T4 Il '
        'Salone (lo Sposo vi vede) → T5 L’Imbarcadero (la barca) → T6 La Stanza di Nina. Con '
        'l’Indirizzo della Villa non si perde il 1° round.',
        '<b>Niente soglia.</b> Questo episodio non ha catastrofi a termine. Segnate il Canto come '
        'al solito (l’allarme della villa), ma non innesca nulla di irreparabile: alla soglia '
        '(Canto 3) solo +1 carta Minaccia per Fase, come sempre. È il respiro dell’atto.',
        '<b>La fuga in barca.</b> Se lo Sposo raggiunge l’imbarcadero (T5) con Nina ancora sotto '
        'l’inganno (niente Fascicolo mostrato), la trascina alla barca: fermarlo richiede una prova '
        'VIGORE rischiosa (fallita = lui salpa con lei, e la spedizione si chiude in vittoria '
        'amara comunque, ma con la ragazza traumatizzata). Col Fascicolo, non c’è fuga.',
        '<b>Lo Sposo.</b> Boss: Att +2, Dif 7, Fer 4, Mov 3, Danno 1 — il più debole della '
        'campagna. Debolezza: il Fascicolo delle Vittime (cattura automatica). «Quale nome?» (D2 '
        'esatta): salta un attacco. Due complici (Sgherri), nessuna scorta. Ai tavoli da 2-3 eroi '
        'non recupera ferite.',
        '<b>Vittoria.</b> Nina liberata e lo Sposo preso: col Fascicolo = <b>vittoria pulita</b> '
        '(cattura automatica, la ragazza torna serena); senza = <b>vittoria amara</b> (ci riuscite, '
        'ma con la forza). Non c’è una vera sconfitta se non il party wipe (improbabile). <b>Il '
        'mazzo:</b> 21 carte (7 complici, 6 insidie morbide, 4 crescendo-allarme, 4 eventi).',
    ])
    pagina('epilogo, frammento, rilettura e bivio', [
        '<b>EPILOGO — da leggere se liberate Nina col Fascicolo.</b> «Quando le mettete davanti i '
        'nomi delle altre — dieci ragazze, dieci doti sparite — Nina non piange. Guarda lo Sposo, '
        'che per la prima volta non sa che faccia fare, e gli sfila la mano di dosso da sola. “Il '
        'nastro verde,” dice piano, “me l’aveva legato mio padre. Non l’ho detto a nessuno.” E voi '
        'vi gelate: perché quel segreto tra un padre e una figlia l’avete già letto stasera — nella '
        'lettera del vostro presidente. M. lo sapeva. Da quanto tempo M. sa le cose prima che '
        'accadano?»',
        '<b>FRAMMENTO DI CAMPAGNA N. 16:</b> <i>«M. sa le cose prima che accadano — o le cose '
        'accadono perché M. le sa. Rileggete ogni lettera.»</i> Conservatelo, e segnate qui accanto '
        'gli incroci di RILETTURA bancati (mai più di 3).',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Affrontare M. in privato.</b> La sua spiegazione è elegante, perfetta, e contiene una '
        'contraddizione databile (un incrocio in più per l’Ep. 18), ma da domani M. vi osserva: '
        'nell’Ep. 17 le vostre mosse sono anticipate (1 carta in più nel mazzo).<br/>'
        '<b>Tacere e cominciare a mentirgli.</b> La Società gioca a due tavoli (margine di manovra '
        'nell’Ep. 17), ma mentire al maestro logora: un membro interno vi si allontana (un PNG '
        'amico in meno).<br/>'
        'Scrivete la scelta sul retro del Frammento n. 16.',
        '<b>AGGANCIO.</b> La sera stessa, il decano Ferrante — il vecchio dell’archivio, quello dei '
        'mazzi legati con la fettuccia — vi ferma sotto un lampione, la '
        'voce bassa: «Anch’io ho un nastro verde. Il mio è del 1885. Venite a trovarmi domani — '
        'c’è una cosa che devo mostrarvi prima che sia tardi.» Domani il decano non ci sarà più.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'ottenuto la vittoria amara (senza Fascicolo), nessuna penalità meccanica: solo Nina '
        'torna a casa con una cicatrice in più. Ricordatelo.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI16_DESC = {
    1: "La casa di riva sa di petrolio da lampione e di stoppino bruciato, un odore che sta nei muri "
       "più che nell’aria, e sotto ci passa sempre il fiato dell’acqua a due passi dalla porta. È "
       "povera e lindissima: il cotto lavato di fresco, la scala di legno appoggiata al muro come si "
       "appoggia un attrezzo che si riprenderà fra un’ora, la latta dell’olio col beccuccio pulito, e "
       "sul comò la fotografia di Nina in una cornice di latta lucidata fino a mangiarne il fregio. "
       "Il vecchio vi apre con le mani ancora nere del suo mestiere e se le strofina sui calzoni per "
       "tutto il tempo che parla, come se restasse sempre qualcosa da togliere; guarda la fotografia, "
       "non voi, quando dice: «una fuga d’amore lascia almeno un biglietto». Fuori, oltre il vetro, i "
       "lampioni della riva sono già accesi, e quando passa una barca le fiamme si piegano tutte "
       "insieme, poi si raddrizzano una dopo l’altra, in fila, dalla prima all’ultima, con un ritardo "
       "che si può contare. A tavola le sedie sono due; una è tirata indietro e nessuno l’ha rimessa "
       "a posto.",
    2: "Il caffè sa di orzo tostato, di segatura sul pavimento e di cera passata sui mobili la "
       "mattina presto; il vetro appannato tiene fuori la sera, e ogni volta che la porta si apre "
       "l’aria fredda arriva fino in fondo alla sala e solleva gli angoli dei giornali. I tavolini "
       "sono di marmo, freddi anche a stufa accesa, e alla rastrelliera i fogli della settimana "
       "pendono dalle loro stecche di legno, aperti quasi tutti alla stessa pagina, quella degli "
       "annunci, perché è lì che la mano di chi li prende si ferma. La cameriera passa fra i tavoli "
       "con lo strofinaccio sulla spalla, e lucida due volte il marmo dell’angolo prima di "
       "appoggiarci i gomiti e parlarvi; ha la voce bassa di chi ha già detto la stessa cosa a "
       "qualcuno che non ha voluto sentirla: «Ho provato ad avvertirla, ma l’amore è sordo.» La "
       "fiamma del becco a gas sopra il banco tira di lato per tutta la sera, sempre verso la porta, "
       "anche quando la porta è chiusa. Sul tavolino d’angolo un giornale è rimasto aperto, e nella "
       "pagina degli annunci c’è un rettangolo vuoto, ritagliato con le forbici.",
    3: "La redazione è sempre la stessa stanza sopra la tipografia: inchiostro fresco, colla da "
       "bozze, e la stufa che tira male e rimanda in faccia il fumo a ogni colpo di vento. Quando la "
       "pressa batte, di sotto, tremano insieme il tavolo, i calamai e il bicchiere lasciato sul "
       "davanzale, e per un istante nessuno parla, perché tanto non si sentirebbe. Le annate stanno "
       "legate in volumi alti come un bambino, allineate lungo la parete; quello dell’anno scorso è "
       "fuori posto, appoggiato di piatto sul leggio, con tre strisce di carta infilate a tenere il "
       "segno. Ranuzzi vi riceve con la penna ancora fra due dita e gli occhiali alzati sulla fronte, "
       "e non smette di correggere mentre vi guarda, come si tiene il dito su una riga che si intende "
       "riprendere: «Di solito cacciate mostri. Questo è un truffatore da caffè.» Lo dice senza "
       "malizia, quasi con dispiacere di mestiere. Alla parete il calendario del dazio pende da un "
       "chiodo solo e a ogni colpo della pressa scivola di un poco; qualcuno, senza interrompersi e "
       "senza guardarlo, allunga la mano e lo raddrizza. Sul ripiano in fondo una risma di ritagli è "
       "tenuta ferma da un pezzo di piombo tipografico messo di traverso.",
    4: "La stazione sa di cavallo bagnato, di grasso da mozzi e di paglia calpestata, e il fiato "
       "delle bestie sta nell’aria in nuvole basse che la lanterna attraversa senza scaldarle. Sotto "
       "la tettoia le vetture sono tirate in fila con le stanghe a terra, i mantici abbassati, i "
       "numeri a gesso sulle portiere; la lavagna dei noli porta le corse del giorno scritte e "
       "cancellate tante volte che il nero non se ne va più, e le righe vecchie si leggono sotto le "
       "nuove. Il capostazione vi ascolta con le mani infilate sotto le ascelle per tenersele calde e "
       "risponde guardando la tettoia, non voi, come chi ha imparato a ricordare gli orari e non le "
       "facce: «Lei rideva», dice, e poi, dopo una pausa più lunga del necessario: «Sono partiti "
       "verso ponente.» Nella rimessa un cavallo batte lo zoccolo tre volte, si ferma, e ricomincia "
       "dopo lo stesso numero di respiri, tutta la sera. Davanti al portone, sul selciato bagnato, "
       "resta una macchia asciutta lunga quanto una vettura, con due strisce più chiare dove stavano "
       "le ruote.",
    5: "La stanza è all’ultimo piano e ci si arriva per una scala che sa di cavolo e di panni; dentro "
       "invece non c’è odore di niente — solo carta, e quel freddo delle stanze dove il fuoco si "
       "accende tardi apposta, per farlo durare. Un tavolo, una sedia sola, una lampada tirata giù "
       "bassa sui fogli, e lungo la parete le scatole da scarpe legate con lo spago, una sopra "
       "l’altra, con gli anni scritti sul fianco a matita. La donna vi fa entrare senza chiedere chi "
       "siete e parla con la voce piatta di chi ha già raccontato tutto a se stessa tante volte che "
       "non le costa più niente: «Non ho denunciato: chi mi avrebbe creduto?» Mentre parla pareggia i "
       "fogli battendoli sul bordo del tavolo, e li pareggia di nuovo quando sono già pari. "
       "Nell’altra stanza una pendola batte i quarti; a ogni quarto lei si ferma a metà frase, "
       "aspetta che finisca, e riprende dalla parola esatta dove si era interrotta. Sulla mensola del "
       "camino spento, in un piattino di porcellana sbeccata, sta un anello d’ottone che il verde ha "
       "già mangiato tutt’attorno.",
    6: "L’archivio è una stanza stretta e senza fuoco dietro la sala grande della Società: carta "
       "vecchia, colla d’amido, e quell’odore di ferro che prendono i luoghi dove si scrive molto e "
       "si apre poco la finestra. Le lettere del presidente stanno nei loro mazzi legati con la "
       "fettuccia di cotone, un mazzo per stagione, allineati sul palchetto in ordine di data; la "
       "fettuccia dei mazzi vecchi ha perso il colore fino al bianco sporco, quella degli ultimi no. "
       "Al centro il leggio da lettura, con la lampada a petrolio calata bassa e il vetro pulito di "
       "fresco — l’unica cosa pulita di fresco, qui dentro. Il mazzo dell’anno in corso non è ancora "
       "legato, e a ogni passaggio accanto al tavolo i fogli di sopra si spostano di poco, sempre "
       "nello stesso verso, come se la stanza respirasse dalla parte del corridoio. In fondo, aperto "
       "sul suo leggio piccolo, il Taccuino di Campagna. E sopra il mazzo, ancora nelle sue tre "
       "pieghe, l’ultima lettera arrivata: la ceralacca è aperta di netto, con una lama, non spezzata "
       "con l’unghia. Al leggio c’è già qualcuno: il decano Ferrante, il più vecchio della Società, "
       "che rimette a posto un mazzo di stagioni andate con la fettuccia arrotolata a un dito. Non "
       "chiede cosa cercate: «Il nostro mestiere è conservare e rileggere», dice, «una carta sola "
       "non ha mai detto niente a nessuno», e vi lascia la lampada.",
    7: "La bottega è più fredda della strada, apposta, e l’odore ci sta dentro come in una cantina: "
       "rose bianche a decine, acqua ferma dei secchi di zinco, e sotto il verde tagliato quel "
       "principio di dolce che i fiori prendono il secondo giorno. Il pavimento è bagnato fino alla "
       "soglia; sul banco stanno le forbici, il gomitolo di spago, la carta velina in risme e il "
       "registro delle consegne, aperto, con la matita infilata nella piega. Il fioraio parla mentre "
       "monda i gambi, un colpo per stelo, e non alza gli occhi dalle mani: le ha piene di tagli "
       "vecchi e di tagli nuovi, e i nuovi non li fascia. «Paga bene, sorride», dice, e col dorso del "
       "polso si scosta una ciocca dalla fronte, per non toccarsi la faccia con le dita bagnate. Nel "
       "secchio grande, ogni tanto, una rosa scivola di lato e va a posarsi contro il bordo, sempre "
       "lo stesso bordo, e nessuno la rimette dritta. Sul ripiano dietro il banco un mazzo è pronto "
       "da tre giorni, ancora nella sua carta e nel suo spago, col cartoncino infilato fra i gambi e "
       "voltato dalla parte scritta contro il vetro.",
    8: "L’ufficio è un bancone, una grata d’ottone e un corridoio di scaffali che si perde nel buio "
       "dietro l’impiegato: inchiostro ferro-gallico, gomma da cancellare, e il fumo dolciastro della "
       "stufa a segatura, che scalda l’altezza delle ginocchia e niente più su. I registri stanno in "
       "piedi sul palchetto, dorso contro dorso, con l’anno in oro sbiadito; quello aperto sul "
       "bancone ha le colonne tirate a riga e squadra, e ogni riga finisce con un timbro, sempre lo "
       "stesso, sempre alla stessa distanza dal margine. Alla parete, in un armadio a vetri, le "
       "chiavi delle case sfitte pendono coi loro cartellini di cartone; quando la porta della strada "
       "si apre si toccano tutte piano, un rumore d’acqua, e la fila si mette a dondolare da un capo "
       "all’altro come se qualcuno l’avesse percorsa con un dito. L’impiegato bagna il pennino, lo "
       "asciuga sullo straccio, e lo bagna di nuovo prima di rispondere: «Non mi è tornato, ma "
       "l’affitto era in regola.» Sulla carta assorbente del bancone resta, rovesciata, l’impronta di "
       "una firma lunga, ripassata due volte.",
    9: "Il lago ha un odore che a Roccamora non si sente: acqua dolce, pietra bagnata, legno di barca "
       "— e nessuna traccia di quel verde di canale che avete nel naso da sedici mesi, sicché la "
       "mancanza si sente più dell’odore. La villa dei Càrpine sta sulla sponda di ponente con tutte "
       "le finestre accese, e la luce arriva sull’acqua prima che sulla ghiaia: due file di riquadri "
       "gialli che tremano appena, si spezzano quando l’onda torna dal largo, e si rimettono insieme "
       "sempre nello stesso ordine. Dal giardino sale l’odore delle rose bianche e, dietro, quello "
       "della cera passata sui pavimenti, che di fuori non dovrebbe arrivare. Si sentono un violino "
       "stonato, un applauso corto, e una risata di ragazza che si ferma da sola. La serra a levante "
       "è illuminata più della casa, e i vetri, dall’interno, sono bianchi di appannatura. "
       "All’imbarcadero, in fondo al prato, la barca è avvolta alla bitta con un giro solo di cima, e "
       "il capo libero è arrotolato sul pontile, asciutto.",
}

OGGETTI_LUOGO_16 = {
    2: [
        ('Esca', 'Un Biglietto d’Amore', 'alimenta la voce della fuga d’amore, ma depista dal rapimento'),
    ],
    5: ['Il Fascicolo delle Vittime', ('Reperto C', 'il Libro delle Promesse dello Sposo', '')],
    6: [
        ('Oggetto', 'La Lettera di M.', 'quella di stanotte, col nastro al polso nero su bianco'),
        # N-98: la RILETTURA era una riga di sola regola (nome vuoto), e il suo
        # Esame di Carbone restava orfano — nessun pezzo da portare al banco, in
        # digitale irraggiungibile per costruzione. Ora la riga consegna la carta.
        ('Oggetto', 'Il Mazzo delle Minute', 'la RILETTURA: ogni lettera riletta banca un '
                                             'incrocio per l’Episodio 18, al massimo 3'),
        ('Reperto A', 'la Lettera d’Incarico di M.', ''),
    ],
    7: [
        ('Esca', 'Il Mazzo di Fiori dello Sposo', 'è il suo metodo d’adescamento, non porta oltre la villa'),
    ],
    8: ['L’Indirizzo della Villa', ('Reperto B', 'il Registro degli Affitti', '')],
}

TILE_ART_16 = {t['id']: t['id'] + '-ep16.png' for t in TILES_16}
LUOGHI16_CROP = {}

TESSERE_DESC_16 = {
    'T1': "La ghiaia del viale è stata rastrellata da poco e tiene ancora le righe del rastrello come "
          "un campo arato; camminarci sopra fa un rumore sproporzionato, e ci si sorprende a cercare "
          "l’erba di lato. Le siepi sono tosate a squadra fino all’altezza del petto e dietro, sul "
          "prato, le rose bianche stanno già in ombra e mandano più odore di quanto una notte fredda "
          "dovrebbe permettere. Il cancello è di ferro, alto, con le punte a lancia dorate di fresco "
          "sopra una ruggine che si sente al primo tocco; è accostato e non chiuso, e la catena pende "
          "dal montante senza lucchetto, arrotolata due volte da una mano che aveva fretta. Oltre il "
          "viale la villa ha tutte le finestre gialle e nessuna tenda tirata: si muovono due o tre "
          "ombre in una sala grande abbastanza per cinquanta. Un violino attacca lo stesso giro di "
          "note per la terza volta, e per la terza volta si ferma nello stesso punto. Sulla ghiaia, "
          "davanti al cancello, un solco di ruota entra e non esce.",
    'T2': "Il giardino è disegnato con la riga: aiuole quadre, bosso tagliato basso, viottoli di "
          "ghiaia che si incrociano ad angolo retto attorno a una vasca senz’acqua. Le statue sono di "
          "gesso e non di marmo — si vede dagli spigoli sbrecciati che nessuno ha ritoccato — e sono "
          "state messe da poco: attorno ai basamenti la terra è ancora smossa e non ha preso il "
          "muschio. Qui fa più freddo che fuori dal cancello, per via dell’acqua vicina, e l’umido "
          "porta a folate l’odore della cera e dei fiori dalla parte della casa. Il cocchiere fa il "
          "giro con la lanterna tenuta bassa, alla coscia, come chi vuole vedere dove mette i piedi e "
          "non chi arriva; canticchia mezza aria da ballo, si interrompe, la riprende dallo stesso "
          "punto, e ogni giro lo fa nello stesso verso e nello stesso tempo. Sotto il pergolato, "
          "all’asciutto, stanno le casse del vino su due assi, e accanto alle casse una fila di "
          "bottiglie vuote messe in piedi nell’erba, allineate con la stessa cura delle aiuole.",
    'T3': "Nella serra si entra come dentro un fiato: caldo umido addosso, i vetri bianchi "
          "d’appannatura e l’acqua che ci cammina sopra in righe lente fino ai correnti di ferro. "
          "Terriccio bagnato, calce, e rose — troppe, di quell’odore che dopo un poco non si sente "
          "più e resta soltanto in fondo alla gola. Le rose bianche stanno a decine nei secchi di "
          "zinco, tagliate di fresco, coi gambi ancora a bere; sui banconi le forbici, i gomitoli di "
          "spago, i vasi capovolti in pila e i mucchietti di gambi mondati, tutti della stessa "
          "lunghezza, come se qualcuno li avesse misurati a uno a uno. Il pavimento di mattoni è "
          "viscido e in pendenza verso il centro, dove una griglia di ferro raccoglie l’acqua e non "
          "la manda via abbastanza in fretta. Da uno dei vetri alti una goccia cade ogni pochi "
          "secondi, sempre nello stesso punto di un bancone, e lì il legno è marcito in un cerchio "
          "scuro largo come un piatto. Contro la parete di fondo un secchio è rovesciato, e le rose "
          "che conteneva sono rimaste dov’erano, aperte a ventaglio, senz’acqua.",
    'T4': "Il salone sa di cera per pavimenti passata il giorno stesso e di candele accese da troppe "
          "ore, quell’odore di grasso caldo che sotto la festa non se ne va. Le tavole sono "
          "apparecchiate per cinquanta e in piedi ce n’è mezza dozzina: tovaglie inamidate, "
          "argenteria in fila per portata, i cartellini dei posti scritti tutti dalla stessa mano, "
          "con la stessa inclinazione e lo stesso svolazzo sulla maiuscola. L’argenteria non fa "
          "coppia — le forchette hanno un manico, i cucchiai un altro — e sotto il piede dei "
          "candelabri il punzone di un noleggiatore non è stato lucidato via. Il lampadario è basso e "
          "carico, e le fiamme si piegano tutte insieme verso le portefinestre ogni volta che "
          "qualcuno attraversa il fondo della sala, poi tornano dritte con comodo, una dopo l’altra. "
          "Lo Sposo tiene una mano sulla spalliera della sedia di Nina e la sposta di un dito per "
          "volta, senza guardarla, mentre parla; lei ride, e la sua risata è l’unica cosa in questa "
          "stanza che non sia stata preparata. In fondo, il tavolo dei regali è apparecchiato con la "
          "stessa cura, e non ha sopra niente.",
    'T5': "Fuori dalla casa il rumore della festa si stacca e resta indietro, e l’acqua prende tutto: "
          "sciabordio contro i piloni, legno bagnato, catrame freddo, e sotto l’odore del lago quello "
          "del petrolio del bidone appoggiato in fondo al pontile. Le assi sono nere d’umido e più "
          "larghe alla fine che al principio, dove il pontile allarga in una piattaforma con due "
          "bitte e una lampada spenta appesa al gancio. La barca sta legata di traverso, e i "
          "respingenti di corda intrecciata cigolano contro il bordo a ogni onda di ritorno: due "
          "colpi, una pausa, due colpi, tutta la sera, alla cadenza dell’acqua e non a quella del "
          "vento. L’acqua è nera fino a un braccio dalla riva, poi prende la luce delle finestre e la "
          "tiene, tremando, come se fosse una cosa solida su cui si può camminare. Sotto il telo "
          "cerato, sul fondo della barca, sta un baule da viaggio già stivato e legato alla panca; il "
          "telo è asciutto di sopra e bagnato di sotto, e i remi sono negli scalmi, non in barca.",
    'T6': "La stanza è più calda del resto della casa e sa di cera, di lenzuola nuove e di rose che "
          "hanno passato il loro giorno: quel dolce che prendono le camere dove i fiori restano tutta "
          "la notte. Il letto è rifatto a spigolo, con la coperta ripiegata di venti centimetri "
          "esatti come negli alberghi buoni; sul comodino un candeliere a tre fiamme, un bicchiere "
          "d’acqua coperto con un piattino, un libro chiuso senza segno. All’anta dell’armadio, "
          "appeso a una gruccia foderata, sta il vestito: chiaro, lungo, con gli spilli ancora sulle "
          "spalline, dove non è stato provato da nessuno. Le candele sono accese anche dove non serve "
          "— sulla toeletta, sul cassettone, sul davanzale — e nessuna è consumata quanto le altre, "
          "come se le avessero accese in ordine, molto prima. Sul marmo della toeletta stanno la "
          "spazzola, due fermagli e un mazzetto di rose che ha già lasciato cadere i primi petali; i "
          "petali sono tre, e stanno in fila, dalla parte del muro.",
}

ESAMI_CARBONE_16 = {
    'LA LETTERA D’INCARICO DI M.': '«Il nastro al polso: un pegno segreto tra un padre e una '
                'figlia, che nessuno fuori casa conosceva. Eppure è qui, di pugno del presidente, '
                'scritto prima che voi lo scopriste. Un uomo che sa un segreto che non gli è stato '
                'detto o l’ha rubato, o l’ha ordinato, o guarda da più lontano di quanto crediate.»',
    'IL LIBRO DELLE PROMESSE DELLO SPOSO': '«Dieci nomi, dieci ragazze, dieci doti: lo Sposo è un '
                'mestiere, non un mostro. Piccolo, umano, prevedibile — il contrario di ciò che '
                'cacciate da quindici episodi. Ed è per questo che fa così male: perché qui, per '
                'una volta, il male ha una misura.»',
    'IL MAZZO DELLE MINUTE': '«Rilette in fila, le lettere d’incarico di M. hanno '
                'tutte, ognuna, un dettaglio di troppo: una cosa saputa un giorno prima del dovuto, '
                'un nome anticipato, una data. Prese una a una, coincidenze. Prese insieme, una '
                'firma. Rileggetele tutte: ogni lettera è un mattone per il giorno in cui lo '
                'chiederete a lui.»',
}

OGGETTI_TESSERA_16 = {'T2': ['Una Bottiglia delle Nozze']}


def luoghi():
    """Luoghi.pdf Episodio 16 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 16 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_16, 'Episodio 16')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_16.get(n, []))

    for L in LUOGHI_16:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI16_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI16_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_16)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_16
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LO SPOSO', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 16')
    print('OK episodio 16')
