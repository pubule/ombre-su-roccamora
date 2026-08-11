# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 19: La Società braccata (Episodio 19/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-19.md e CAMPAGNA-EPISODI.md). Atto IV
(apertura del finale), mythology: braccati (manifesto RICERCATI), la sede
sigillata. L'indagine è la vostra STESSA campagna: ogni luogo è un PNG del
passato, aperto/chiuso dai Bivi (il pay-off). Spedizione: irruzione
nell'Archivio sequestrato per il Fascicolo del 1741, braccati dall'Ispettore
Vidal — che NON si uccide: ridotto all'ultima Ferita ascolta, e si vince
convincendolo. Un solo luogo nuovo (la Taverna della Chiatta); tutto il resto
riuso deliberato (la città come memoria).

Varietà strutturale (regola 2026-07-18): la campagna come indagine (PNG del
passato come luoghi, il conto dei Bivi); boss che si CONVINCE (persuasione, non
morte). Torsione d'indagine: «la campagna vi presenta il conto».

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 19.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 19', 'pdf')
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

LETTERA_19 = (
    "Alla Società del Lume — o a ciò che ne resta.<br/><br/>"
    "«Non vi scrivo io da presidente, stavolta: vi scrivo io, il decano, da uomo braccato come "
    "voi. Il manifesto è in ogni piazza, la sede è sotto sigillo, e mezza città vi crede i mostri. "
    "Non avete tempo per l’orgoglio, ragazzi.<br/><br/>"
    "M. cerca l’ultima cosa che gli manca per il Quarto Movimento, e la cerca <b>stanotte</b>, "
    "nelle stesse ore in cui lui dà la caccia a voi. Bussate a tutte le porte del vostro passato e "
    "vedete quali si aprono ancora: la campagna vi presenta il conto. Poi riprendetevi il "
    "<b>Fascicolo del 1741</b> dall’Archivio sequestrato, e scendete. Le <b>maree di sizigia</b> "
    "tornano stanotte: è ora.<br/>"
    "— il decano Ferrante (o chi vi resta fedele)»<br/><br/>"
    "<font name=\"OldStd-Italic\"><i>Aperti dall’inizio: la Taverna della Chiatta (il rifugio in esilio), il Banco dei Pegni di "
    "Fossa, la Gazzetta di Roccamora, la Gendarmeria. Gli altri PNG del passato aprono — pieni o "
    "monchi — secondo i BIVI che avete scelto in diciotto serate.</i></font>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «le taglie sulle vostre teste» (L1+L2), «la Società braccata» (L2+L3),
# «il conto dei bivi» (L3+L4), «l'ultima discesa» (L1+L4). Riv. (D2) su L1,L2,L3.
LUOGHI_19 = [
    dict(n=1, nome='LA TAVERNA DELLA CHIATTA', voce_mappa='La Taverna della Chiatta',
         req='Disponibile dall’inizio', art='Taverna della Chiatta.png',
         chiude=None,
         indizi=[
             'La Taverna della Chiatta, sull’acqua bassa: il rifugio della Società in esilio. '
             'Qui si sono raccolti quelli che vi restano fedeli, sotto le taglie sulle vostre '
             'teste.',
             'Sul tavolo, il piano dell’ultima discesa: la Cattedrale, la gola della città, il '
             'punto oltre Ferri. «L’ultima discesa è stanotte, con le maree di sizigia. Serve il '
             'Fascicolo del 1741, la mappa acustica, e ogni amico che vi resta.»',
             'L’oste, uno dei vostri: «le taglie sulle vostre teste sono alte, signori. C’è chi vi '
             'venderebbe. Ma c’è anche chi, per come vi siete comportati in questi mesi, la porta '
             've la tiene aperta. Stanotte scoprirete chi è chi. È il conto.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='L’oste del rifugio',
                  testo='«Ve lo dico da amico: stanotte non contano le prove, contano le persone. '
                        'Ogni porta a cui bussate vi risponderà secondo ciò che avete fatto per '
                        'loro, o a loro, in diciotto mesi. Cinque porte, non una di più: Braga vivo '
                        'se l’avete protetto; il decano lucido se l’avete salvato in tempo; la '
                        'città con voi se avete reso pubblica la verità; i muti del Borgo se '
                        'restituiste loro la voce; il quartiere della casa che ricordava se gli '
                        'deste giustizia invece di ascoltarne i muri. '
                        'È il conto della campagna, e stanotte lo pagate o lo incassate. '
                        'M. ha comprato il suo coro; voi dovete <i>meritarvi</i> il vostro. È questa '
                        'la differenza, e forse è tutto.»'),
         ]),
    dict(n=2, nome='IL BANCO DEI PEGNI DI FOSSA', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Fossa non vi deve la vita: vi deve una cosa più piccola e più vera, e non l’ha '
             'dimenticata. Ogni volta che gli avete chiesto il registro l’ha aperto senza farsi '
             'pagare — la prima volta scagionò un innocente — e voi non avete mai messo il suo '
             'nome in un verbale: un prestapegni che finisce agli atti, in questa città, chiude '
             'bottega. «Con la Società braccata gli altri hanno chiuso; io no. Siamo pari, e i '
             'conti pari mi piacciono.» Vi passa la mappa dei sigilli '
             'dell’Archivio: «i gendarmi hanno ammassato lì la vostra roba. So dove sono i sigilli '
             'deboli.»',
             'Sul retro, i canali dell’usura conoscono chi paga le taglie sulle vostre teste: '
             '«qualcuno le sta riscuotendo con l’oro vecchio. Indovinate chi. M. vi vuole in cella '
             'o morti prima di stanotte, così nessuno scende sotto la Cattedrale a fermarlo.»',
             'Fossa, serio: «io tengo la porta aperta, ma non tutti. Chi avete lasciato indietro in '
             'questi mesi, stanotte vi lascia indietro. Chi avete tenuto, vi tiene. È giusto così: '
             'è il conto.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La mappa dei sigilli',
                  testo='Fossa, che non vi deve la vita ma un pugno di piccoli favori mai '
                        'riscossi, è la prova che il conto della campagna non è '
                        'solo un peso: è anche un tesoro. Non serve aver salvato un uomo perché '
                        'torni a salvarvi: basta non averlo mai venduto. La sua '
                        'mappa dei sigilli dell’Archivio è la vostra via dentro senza allarme; e la '
                        'sua rete d’usura vi dice che le taglie le paga M. in oro vecchio — la stessa '
                        'cassa di sempre. Braccati, ma non ciechi: ogni vecchio amico che apre è un '
                        'pezzo dell’ultima discesa che si rimette a posto.'),
         ]),
    dict(n=3, nome='LA GAZZETTA DI ROCCAMORA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         chiude=None,
         indizi=[
             'Ranuzzi è l’unico giornalista che non ha bevuto il manifesto: «la Società braccata da '
             'un giorno all’altro, per crimini di trent’anni? Troppo comodo, troppo in fretta. Io '
             'non stampo quello che mi danno già pronto. L’ho imparato con voi.»',
             'Ha seguito il filo: «l’ordine di caccia porta la firma di un Ispettore, Vidal. Onesto, '
             'il migliore — e proprio per questo il più facile da ingannare con prove pulite. Gli '
             'hanno messo in mano un dossier perfetto. Vi ricorda qualcosa?»',
             'Ranuzzi, offrendo aiuto: «il conto dei bivi vale anche per me. Avete reso pubblica la '
             'verità su Braga? Allora ho di che scrivere, e la città si divide a vostro favore. '
             'L’avete tenuta segreta? Allora sono solo, e voi con me.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il cronista Ranuzzi',
                  testo='«L’Ispettore Vidal non è un uomo di M.: è un uomo onesto a cui M. ha dato in '
                        'mano un dossier perfetto, esattamente come ha fatto con Braga. È il metodo, '
                        'sempre lo stesso: non corrompere il migliore, ingannalo. E un uomo onesto '
                        'ingannato è più pericoloso di dieci sicari, perché ci crede. Ma è anche la '
                        'vostra unica speranza: mostrategli come è stato usato — la matrice del '
                        'decano, il metodo di M. — e forse l’onestà che lo rende pericoloso lo farà '
                        'passare dalla vostra parte. Non uccidetelo. Convincetelo.»'),
         ]),
    dict(n=4, nome='LA GENDARMERIA', voce_mappa='La Gendarmeria',
         req='Disponibile dall’inizio', art='La Gendarmeria.png',
         chiude=None,
         indizi=[
             'Non tutti i gendarmi credono al manifesto: uno, in particolare, vi ha visti lavorare '
             'e non vi crede colpevoli. «Il conto dei bivi conta anche in divisa: chi si è '
             'comportato bene con noi, in questi mesi, stanotte trova una porta socchiusa.» Vi '
             'indica la via all’Archivio.',
             'Vi passa di nascosto le prove che smontano il dossier di Vidal: la matrice del '
             'decano, il confronto col metodo di M. «Se riuscite a parlargli prima che spari, '
             'questo lo ferma.»',
             'Il gendarme, sottovoce: «Vidal è già all’Archivio, vi aspetta. Sa che tornerete per '
             'il Fascicolo del 1741, per l’ultima discesa: è troppo bravo per non averlo capito. '
            'Andateci sapendo che '
             'l’unica arma che funziona con lui è la verità.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La via all’Archivio',
                  testo='Un gendarme che vi crede è una crepa nel muro che M. vi ha tirato addosso. '
                        'Vi apre la via all’Archivio sequestrato e vi consegna le prove che potrebbero '
                        'convincere Vidal — se arrivate a mostrargliele invece di combatterlo. È il '
                        'nodo dell’episodio: l’Ispettore non è il nemico, è la vittima più utile del '
                        'metodo di M., e riportarlo dalla parte giusta vale più di dieci gendarmi '
                        'abbattuti. La caccia può cambiare bersaglio, stanotte. Da voi a M.'),
         ]),
    dict(n=5, nome='IL PROFESSOR BRAGA', voce_mappa='La Villa-Museo di Braga',
         req='La villa di Braga apre a chi ricorda il conto dei bivi: il professore che avete '
             'salvato — o lasciato cadere — nell’Ep. 15.',
         chiave=('parola', 'IL CONTO DEI BIVI'), art='La Villa-Museo di Braga.png',
         chiude=None,
         indizi=[
             'Se avete PROTETTO Braga dal dossier anonimo che lo incastrava, il professore vi apre '
             'di persona: il dubbio che dichiaraste in pubblico ha lavorato per mesi '
             'nell’istruttoria finché l’accusa non ha retto più, e tre settimane fa è uscito dal '
             'Tribunale prosciolto. Dalla cella era riuscito a mandarvi solo un biglietto; adesso '
             'vi mette in mano il resto — l’archivio intero, trent’anni di studio del rivale, '
             'rimasto murato qui ad aspettarlo. «Ve l’avevo detto: guardate le '
             'penne, non le mani. Questa è la penna. Prendete, e usatelo: non è mai uscito da '
             'questa stanza.»',
             'Se lo avete AVALLATO, la villa è chiusa e la ceralacca è sulle imposte: Braga è '
             'morto in cella, nel sonno, senza processo, e l’archivio è sotto sequestro con tutto '
             'il resto. Il conto, stanotte, è a vostro sfavore.',
             'L’archivio di Braga, se lo avete, rafforza le Prove per l’Ispettore: il rivale che ha '
             'studiato M. per trent’anni è il testimone perfetto della sua doppiezza.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il debito di Braga',
                  testo='Braga è il conto più caro della campagna: se l’avete protetto quando la '
                        'città voleva la sua testa, il dubbio che dichiaraste in pubblico l’ha '
                        'tirato fuori di cella, e stanotte vi ripaga con l’unica cosa che ha — '
                        'trent’anni di studio del suo rivale, la prova vivente che M. ha due facce. '
                        'È la prima volta che quell’archivio cambia mano: dalla cella era passato '
                        'solo un biglietto, e un biglietto non è una prova. '
                        'Se l’avete lasciato cadere per comodità, Braga è morto in cella nel sonno, '
                        'la villa è sotto sigillo e con essa '
                        'una delle prove migliori per Vidal. Ogni scelta pesa: è questo il pay-off. '
                        'La campagna non dimentica, e stanotte ve lo dice in faccia.'),
         ]),
    dict(n=6, nome='IL DECANO FERRANTE', voce_mappa='Lo Studio del Decano',
         req='Lo studio del decano apre a chi ha pagato il conto dell’Ep. 17: il decano che avete '
             'salvato lucido — o ferito grave — nella villa-prigione.',
         chiave=('parola', 'LA SOCIETÀ BRACCATA'), art='Lo Studio del Decano.png',
         chiude=None,
         indizi=[
             'Se avete salvato il decano LUCIDO dalla notte in cui sparì, è qui, provato ma vivo, '
             'e vi consegna la matrice completa e la crepa del coro: «Ferri, ai suoi, dava una fede in cambio delle '
             'braccia. M. paga e non ha nulla da dare: un coro comprato canta con la bocca. Al '
             'Quarto Movimento gli manca una voce che creda.»',
             'La matrice del decano applicata all’ultimo movimento dice cosa manca a M.: La '
             'voce che il Coro insegue dall’inverno degli ammutoliti del Borgo.',
             'Se il decano è ferito grave, parla a fatica e la sua metà di verità è confusa: '
             'l’incrocio D3 è più fragile. Il conto della caccia alla talpa pesa qui.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La crepa del coro',
                  testo='Il decano, se lucido, vi dà la chiave tattica del finale: Ferri, ai suoi '
                        'dodici, offriva almeno una fede; M. paga e non ha nulla da offrire, e un '
                        'uomo pagato per cantare uno spartito che non '
                        'capisce, alla prima crepa, scappa. È la debolezza del Quarto Movimento, e '
                        'sarà la vostra arma nell’ultima discesa. Ma la crepa è anche più '
                        'profonda: a M. manca la voce che CREDA, e senza quella il rito non si compie. Voi non '
                        'dovete vincere una battaglia: dovete impedire che una sola persona canti '
                        'con l’anima. Cercatela prima di lui.'),
         ]),
    dict(n=7, nome='UN DEBITO ANTICO', voce_mappa='La Casa dell’Ex Fidanzata',
         req='La porta di un vecchio debito si apre a chi ricorda cosa deve: sotto le taglie sulle '
             'vostre teste, ogni conto in sospeso torna a bussare.',
         chiave=('parola', 'LE TAGLIE SULLE VOSTRE TESTE'), art='La Casa dell’Ex Fidanzata.png',
         chiude=None,
         indizi=[
             'Un PNG a cui dovete qualcosa dai casi passati: se il conto è a favore, vi nasconde e '
             'vi rifornisce; se è a sfavore, è tentato dalla taglia. «Vi ho aiutato una volta. '
             'Stanotte dipende da come mi avete trattato dopo.»',
             'C’è chi, disperato, valuta di consegnarvi per la taglia in oro vecchio.',
             'Il debito si è deciso nel quartiere della casa che ricordava: se allora consegnaste '
             'il vedovo alla giustizia invece di servirvi dei muri, quella strada vi è tornata '
             'amica e questa porta si apre — un alleato in più nel conto per l’Archivio: una mano, '
             'una porta di servizio, un avvertimento al momento giusto. Se invece la casa la '
             'usaste e basta, la porta resta socchiusa e non si apre oltre.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il conto in sospeso',
                  testo='Ogni debito lasciato aperto in diciotto mesi, stanotte, torna a presentarsi '
                        'con gli interessi. Un PNG che avete trattato bene vi nasconde dai gendarmi; '
                        'uno che avete usato e scaricato è tentato dalle taglie. Non è punizione né '
                        'premio morale: è economia della fiducia. M. compra la lealtà con l’oro '
                        'vecchio, e l’oro finisce; voi l’avete guadagnata (o sprecata) un caso alla '
                        'volta, e stanotte scoprite quanto ne resta in cassa.'),
         ]),
    dict(n=8, nome='I VECCHI TESTIMONI DEL CORO', voce_mappa='Il Cimitero delle Barche',
         req='I vecchi testimoni si aprono a chi si prepara all’ultima discesa: chi ricorda il Coro '
             'dall’inizio, e la via delle tre acque.',
         chiave=('parola', 'L’ULTIMA DISCESA'), art='Cimitero delle Barche.png',
         chiude=None,
         indizi=[
             'Chi ricorda il Coro dall’inverno degli ammutoliti del Borgo, i vecchi barcaioli e '
             'ossari: vi danno la mappa acustica, la via delle tre acque sotto la città.',
             'La mappa incrocia il sapere del decano: quali campane, organi e fontane far '
             'tacere e quali suonare per il controcanto. Senza la mappa, sotto la Cattedrale '
             'sareste sordi.',
             'Un vecchio ossario: «la voce che il Coro cerca dall’inizio è ancora là sotto, o ciò '
             'che ne resta — dipende da come avete chiuso i casi del Coro. M. la cerca stanotte. '
             'Arrivateci prima.» E se allora restituiste le voci agli ammutoliti del Borgo, i '
             'guariti sono qui stanotte, e i barcaioli con loro: vengono con voi, e sono un '
             'alleato in più nel conto. Se le canne le conservaste sigillate, la mappa ve la danno '
             'lo stesso, ma nessuno esce da questo fango.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La via delle tre acque',
                  testo='I vecchi testimoni del Coro custodiscono la mappa acustica: la città è uno '
                        'strumento accordato dai Padri, e la mappa dice come suonarlo per il '
                        'controcanto che riporta il Dormiente al sonno senza sogni. È la via delle '
                        'tre acque sotto la Cattedrale, il percorso dell’ultima discesa. Ciò che '
                        'avete fatto nei casi del Coro, dall’inverno degli ammutoliti in poi, '
                        'decide quanto della voce che M. cerca è ancora recuperabile. Il conto, di nuovo: la campagna presenta il suo saldo anche '
                        'qui, sotto forma di eco.'),
         ]),
    dict(n=9, nome='L’ARCHIVIO SEQUESTRATO', voce_mappa='L’Archivio Civico',
         req='L’Archivio sequestrato, dove è ammassata la roba della Società, apre solo a chi ha la '
             'mappa dei sigilli e sa che è lì che finisce la caccia: la Società braccata torna a '
             'casa propria da ladra.',
         chiave=('parola', 'LA SOCIETÀ BRACCATA'), art='L’Archivio Civico.png',
         chiude=None,
         indizi=[
             'L’Archivio Civico sotto sigillo dei gendarmi, dove hanno portato tutto ciò che era '
             'della Società. Dentro, nel deposito reperti, il Fascicolo del 1741. Ad aspettarvi, '
             'l’Ispettore Vidal.',
             'Il Fascicolo del 1741 è l’antico dossier della confraternita: come i Padri '
             'fecero tacere il Dormiente la prima volta, il controcanto. Senza, sotto la '
             'Cattedrale scenderete muti.',
             'Vidal non spara subito: vi studia. È un uomo onesto ingannato, non un sicario. Se lo '
             'riducete e gli mostrate le Prove — e il vostro conto di alleati regge — capisce di '
             'essere stato usato, e la caccia cambia bersaglio.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La caccia che cambia bersaglio',
                  testo='Nell’Archivio che vi ha sequestrato la casa, la partita non si vince con '
                        'l’acciaio ma con la verità. L’Ispettore Vidal è il migliore, e per questo '
                        'il più pericoloso e il più prezioso: abbatterlo è impossibile e inutile; '
                        'convincerlo è difficile e decisivo. Riducetelo, fermatelo, e mettetegli in '
                        'mano ciò che ha in mano lui — un dossier perfetto e falso, come quello di '
                        'Braga. Se il conto della campagna vi sostiene, l’uomo mandato a prendervi '
                        'stanotte terrà aperte le uscite della cripta. La caccia cambia bersaglio: '
                        'da voi, a M.'),
         ]),
]

# Tessere dell'Archivio sequestrato (percorso lineare a 6). Obiettivo = prendere
# il Fascicolo del 1741 (T6) e CONVINCERE l'Ispettore (non ucciderlo). Boss:
# l'Ispettore Vidal (si ferma all'ultima Ferita, poi persuasione).
TILES_19 = [
    dict(id='T1', nome='L’INGRESSO SIGILLATO', exits={'N': 'T2'}, start='S',
         testo='L’ingresso dell’Archivio Civico, sotto sigillo dei gendarmi, di notte. QUANDO '
               'RIVELATE QUESTA TESSERA: applicate l’esito delle Domande 3 e 4. Con la mappa dei '
               'sigilli di Fossa entrate senza forzare, niente allarme iniziale.',
         arbitro='SIGILLO: senza la mappa dei sigilli (Fossa), forzare l’ingresso fa scattare '
                 'l’allarme (1 gendarme subito). Con la mappa, entrate silenziosi. Ricorda: qui non '
                 'si uccide l’Ispettore — si arriva al Fascicolo e lo si convince.',
         hook='La mappa dei sigilli (dal Banco di Fossa): entrate senza allarme dal sigillo debole.',
         cerca_vuoto='Sale buie piene della vostra stessa roba sequestrata: fascicoli, '
                     'cimeli, la vostra vita di Società impacchettata da mani estranee. '
                     'Tutto chiuso, tutto numerato.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='L’ATRIO DEI GENDARMI', exits={'S': 'T1', 'N': 'T3'},
         testo='L’atrio dove monta la guardia notturna dell’Archivio. QUANDO RIVELATE QUESTA '
               'TESSERA: i gendarmi di ronda — onesti, in buona fede, convinti di sorvegliare la '
               'roba di criminali.',
         arbitro='Gendarmi (Sgherri) in buona fede: metterli a terra è sgradevole (non sono '
                 'nemici), ma passare in fretta è meglio. Un alleato del conto può averne '
                 'distratti alcuni (vedi setup).',
         cerca='Su una scrivania, un lasciapassare notturno dimenticato (utile: alle Sale di '
               'Catalogazione, evitate un posto di blocco — 1 spawn in meno).',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LE SALE DI CATALOGAZIONE', exits={'S': 'T2', 'N': 'T4'},
         testo='Le sale dove i gendarmi smistano e catalogano la roba sequestrata: montagne di '
               'faldoni, la vostra storia messa in ordine da mani estranee. QUANDO RIVELATE QUESTA '
               'TESSERA: qui è facile perdersi tra i faldoni giusti e quelli sbagliati.',
         arbitro='Ambiente d’archivio: cercare il faldone giusto tra migliaia costa tempo (insidie '
                 '"faldone sbagliato"). Un alleato archivista del conto, se l’avete, indica la '
                 'sala giusta (salta un’insidia).',
         cerca_vuoto='Faldoni su faldoni, cataloghi aperti a metà, matite copiative '
                     'lasciate sui tavoli. Il lavoro è a un terzo: qui dentro, per ora, '
                     'non si trova niente per caso.',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL CORRIDOIO DEI SIGILLI', exits={'S': 'T3', 'N': 'T5'},
         testo='Il corridoio dei depositi sigillati. QUANDO RIVELATE QUESTA TESSERA: l’Ispettore '
               'Vidal vi individua — ha capito da giorni che sareste tornati per il Fascicolo. Da '
               'qui la caccia è dentro l’Archivio, e lui è bravissimo.',
         arbitro='Da ora l’Ispettore è sulle vostre tracce (le carte crescendo lo avvicinano). '
                 'Preparate le Prove per l’Ispettore: alla Sala di Lettura (T5) dovrete fermarlo e '
                 'parlargli, non abbatterlo.',
         cerca_vuoto='Porte sigillate a decine, ceralacca fresca su ognuna, e un '
                     'corridoio che non finisce mai. Non un solo sigillo già rotto, non '
                     'una porta accostata.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LA SALA DI LETTURA', exits={'S': 'T4', 'N': 'T6'},
         testo='La grande sala di lettura dell’Archivio, tavoli lunghi e lampade verdi. QUANDO '
               'RIVELATE QUESTA TESSERA: l’Ispettore Vidal vi affronta qui, tra voi e il deposito. '
               'È il momento della persuasione: riducetelo all’ultima Ferita e mostrategli le Prove.',
         arbitro='L’Ispettore (boss) fa muro. NON si uccide: ridotto all’ultima Ferita si FERMA ad '
                 'ascoltare. A quel punto, con le Prove e un conto di alleati sufficiente, lo '
                 'CONVINCETE (dalla vostra parte); senza, si ferma comunque ma resta contro.',
         hook='Le Prove per l’Ispettore (dalla Gendarmeria + l’archivio di Braga): la matrice del '
              'decano e il metodo di M. — convincono Vidal di essere stato manipolato.',
         cerca_vuoto='Tavoli lunghi, lampade verdi spente, sedie rimesse a posto una '
                     'per una. La sala di lettura è stata sgomberata: sui piani non è '
                     'rimasto un foglio di brutta.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='IL DEPOSITO REPERTI', exits={'S': 'T5'},
         testo='Il deposito reperti, dove il Fascicolo del 1741 giace sotto sigillo fresco. QUANDO '
               'RIVELATE QUESTA TESSERA: prendete il Fascicolo — il controcanto per l’ultima '
               'discesa — e uscite, con l’Ispettore convinto (o almeno fermato) alle spalle.',
         arbitro='OBIETTIVO. Interagire prende il Fascicolo del 1741 (indispensabile per l’Ep. 20). '
                 'Con l’Ispettore convinto = vittoria piena (i gendarmi coprono la ritirata nel '
                 'finale). Solo fermato = vittoria parziale. Senza il Fascicolo = spedizione '
                 'fallita (raro).',
         cerca_vuoto='Scaffali di reperti in file numerate, cartellini, spago, '
                     'ceralacca. Tutto quello che è impilato qui appartiene ai casi di '
                     'qualcun altro.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_19 = [
    dict(nome='L’ISPETTORE VIDAL', att=3, dif=8, fer=6, mov=3, dan=2, boss=True,
         tipo='L’Inseguitore Onesto (Boss) — non si uccide', art='L’Ispettore Vidal.png',
         note='NON si uccide: ridotto all’ultima Ferita si ferma ad ascoltare. Nessuna debolezza-'
              'oggetto. Le Prove (la matrice del decano + il metodo di M.) e un conto di alleati '
              'sufficiente lo CONVINCONO (passa dalla vostra parte: piena). Senza, si ferma comunque '
              '(non vi arresta stanotte) ma resta contro (parziale). Ai tavoli da 2-3 eroi non '
              'recupera mai Ferite (regola delle taglie).',
         bio_bestiario='L’Ispettore Achille Vidal è il migliore che la Gendarmeria abbia: onesto '
              'fino all’osso, metodico, incorruttibile — e proprio per questo l’arma perfetta nelle '
              'mani di M., che non l’ha comprato (non si può) ma l’ha ingannato con un dossier '
              'costruito come quello di Braga. Vi dà la caccia perché crede, in buona fede, di '
              'fermare dei criminali. Robusto e implacabile (Fer 6, Danno 2), non molla la presa. '
              'Ma non è un nemico: è una vittima del metodo di M., la più utile, e non si uccide — '
              'ridotto all’ultima Ferita si ferma, abbassa l’arma, e ascolta. Lì la battaglia '
              'diventa un’altra: mettergli in mano le prove del proprio inganno, e lasciare che '
              'l’onestà che lo rende temibile lo porti dalla parte giusta. Ai tavoli da 2-3 eroi '
              'non recupera mai ferite (regola delle taglie). Convincerlo non è solo vincere uno '
              'scontro: è guadagnare, per l’ultima discesa, l’uomo che tiene le chiavi delle uscite.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 19 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 19')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la società braccata')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_19.replace(
        'Alla Società del Lume — o a ciò che ne resta.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume — o a ciò che ne resta.' % F['sc'])
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
    c.drawCentredString(W/2, 24*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 18 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 18*mm, 'I nove «luoghi» sono PNG del passato: aprono pieni o monchi secondo i BIVI che avete scelto.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Taverna della Chiatta, il Banco di Fossa, la Gazzetta, la Gendarmeria.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 19')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — 6 ore. IL CONTO DEI BIVI: segnate quali PNG vi aprono (a favore) o vi voltano le spalle.')
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

    yy = sect(H - 52*mm, 'il conto dei bivi — chi apre, chi volta le spalle', 4)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE è il Fascicolo del 1741? (attenzione: serve più di una conferma)',
            '2. CHI vi apre ancora la porta? (il conto della campagna)',
            '3. COSA manca a M. per il Quarto Movimento? (attenzione: serve più di una conferma)',
            '4. COSA portate alla discesa?']
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
    c.setTitle('Ombre su Roccamora - Episodio 19 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 19 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'l’Archivio sequestrato, e un inseguitore da convincere')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '19/cards/</b>). Le 6 tessere dell’Archivio sono in <b>Episodio 19/board/</b>. '
                  'Irrompete nell’Archivio che vi ha sequestrato la casa per riprendere il '
                  '<b>Fascicolo del 1741</b> (T6, indispensabile per il finale). Ad aspettarvi, '
                  'l’<b>Ispettore Vidal</b>: NON si uccide — ridotto all’ultima Ferita si ferma, e '
                  'si vince <b>convincendolo</b> con le Prove, se il <b>conto</b> dei vostri alleati '
                  'regge. Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>IL CONTO DEI BIVI (setup).</b> Prima di cominciare, contate gli alleati '
                  'dell’<b>elenco chiuso</b> — cinque nomi e cinque soli, nella Soluzione, pagina '
                  '«il conto dei bivi»: Braga (Bivio 15), il decano lucido (esito 17), Ranuzzi '
                  '(Bivio 18), i vecchi testimoni del Coro (Bivio 3), il debito antico (Bivio 10). '
                  'Ogni alleato = <b>+1</b> (una carta '
                  'evento-favore in più nel mazzo, o una spawn scartata); ogni PNG che vi volta le '
                  'spalle = un aiuto in meno. Servono <b>≥ 3 alleati</b> perché '
                  'l’Ispettore sia <b>convincibile</b>.', BODY),
        Paragraph('• <b>L’ISPETTORE NON SI UCCIDE.</b> Alla Sala di Lettura (T5), Vidal (boss) fa '
                  'muro. Riducetelo all’ultima Ferita: si <b>ferma</b> ad ascoltare. Con le <b>Prove '
                  'per l’Ispettore</b> (matrice del decano + metodo di M.) e un conto ≥ 3, lo '
                  '<b>convincete</b> (dalla vostra parte: piena, e nell’Ep. 20 tiene aperte le '
                  'uscite). Senza, si ferma ma resta contro (parziale).', BODY),
        Paragraph('• <b>IL FASCICOLO.</b> Al deposito (T6), prendete il <b>Fascicolo del 1741</b>: '
                  'senza, l’Ep. 20 non ha il controcanto (fallimento raro). I <b>gendarmi</b> sono '
                  'in buona fede (come nell’Ep. 18): la posta è la cattura, non la morte. La mappa '
                  'dei sigilli di Fossa salta l’allarme di T1.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_19:
        art_file = TILE_ART_19[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_19[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_19.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 19</b>. In campo: i <b>gendarmi</b> '
                  '(Sgherri: onesti, in buona fede) e l’<b>Ispettore Vidal</b> (il boss: '
                  'l’inseguitore onesto, che NON si uccide — si ferma all’ultima Ferita e si '
                  'convince). Nessun mostro: il pericolo è essere presi in casa dello Stato. '
                  'Vittoria: prendere il Fascicolo e convincere (o almeno fermare) l’Ispettore. Ai '
                  'tavoli da 2-3 eroi Vidal <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_19())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_19():
    """Miniature dell'Episodio 19. I segnalini Canto sono l'INDIVIDUAZIONE
    (l'Ispettore che fiuta la pista, verso lo scontro)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('GENDARMI (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('L’ISPETTORE VIDAL', [('L’Ispettore Vidal.png', 1)]),
        ('L’INDIVIDUAZIONE (CANTO)', [('Un rumore di troppo.png', 1),
                                      ('L’Ispettore fiuta la pista.png', 1),
                                      ('Le guardie convergono.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 19 - Soluzione (non aprire)')

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
        '<b>APERTURA — il Bivio dell’Episodio 18</b> (applicare PRIMA della lettera): se avete scelto '
        '<b>RENDERE PUBBLICA LA PROVA SUBITO</b> — la città sa, M. è latitante, e i PNG amici sono '
        'schierati: è la voce <b>n. 3 del CONTO DEI BIVI</b> — il cronista Ranuzzi — nell’elenco '
        'chiuso della pagina seguente, e vale <b>+1 alleato</b>. Contatela una volta sola: è '
        'quella, non una in più. Il '
        'prezzo non si paga qui — M. all’angolo accelera il Quarto Movimento, e l’Episodio 20 parte '
        'col Dormiente più vicino a svegliarsi: segnatelo ora sul Taccuino di Campagna perché non ve '
        'ne dimentichiate. Se avete scelto <b>TENERE LA PROVA E COLPIRE NELL’OMBRA</b> — senza '
        'clamore quella voce nel conto non ce l’avete, e il PNG amico in meno ha un nome: Ranuzzi, '
        'che senza la prova pubblica non ha niente da stampare e resta solo (lo dice lui stesso alla '
        'Gazzetta). <b>Rimuovete la Testimonianza «Il cronista Ranuzzi» (Luogo 3) dal mazzo '
        'Approfondimenti.</b> In cambio avete il margine di manovra di chi si muove come M., di '
        'nascosto: il rifugio vi aspetta già pronto, e la Testimonianza <b>«L’oste del rifugio» '
        '(Luogo 1) parte GIÀ RIVELATA</b>. La soglia resta quella: <b>conto ≥ 3 alleati</b>, in '
        'entrambi i rami — su cinque alleati possibili nel primo, su quattro nel secondo, e '
        'l’elenco chiuso è alla pagina seguente. La Domanda 2 regge comunque — le restano due conferme su tre (l’oste, già '
        'in tavola, e la mappa dei sigilli di Fossa). Chi ha sigillato la busta senza decidere ha '
        'lasciato uscire la prova: primo ramo.',
        '<b>Il caso.</b> Braccati, la sede sigillata. L’indagine è la vostra campagna: ogni luogo è '
        'un PNG del passato che apre o chiude secondo i Bivi. Obiettivo: rimettere insieme i pezzi '
        'per l’ultima discesa e riprendere il Fascicolo del 1741.',
        '<b>La verità.</b> M. ha comprato ciò che resta del Coro (impiegati, non credenti): gli '
        'manca una voce che creda per il Quarto Movimento, e la cerca stanotte. L’Ispettore Vidal '
        'che vi bracca è onesto, ingannato dal metodo di M. (come Braga). Sventare = raccogliere '
        'gli alleati, prendere il Fascicolo e CONVINCERE Vidal.',
    ])
    pagina('il conto dei bivi — l’elenco chiuso', [
        '<b>Cinque PNG del passato possono schierarsi stanotte, e solo questi cinque.</b> '
        'Spuntateli sul Taccuino di Campagna prima di cominciare; '
        'se un nome non è qui sotto, non è un alleato e non entra nel conto.',
        '<b>1 · Il professor Braga</b> (Luogo 5) — Bivio dell’Ep. 15, ramo <i>«Dichiarare '
        'pubblicamente il dubbio»</i>. Sull’altro ramo è morto in cella: nessun alleato.',
        '<b>2 · Il decano Ferrante</b> (Luogo 6) — <b>non è un Bivio</b>: è l’<i>esito</i> della '
        'spedizione dell’Ep. 17, il decano riportato a casa <b>lucido</b>. Se è ferito grave parla '
        'a fatica e non conta come alleato.',
        '<b>3 · Il cronista Ranuzzi</b> (Luogo 3) — Bivio dell’Ep. 18, ramo <i>«Rendere pubblica '
        'la prova subito»</i>. Sull’altro ramo non ha nulla da stampare, resta solo e la sua '
        'Testimonianza esce dal mazzo.',
        '<b>4 · I vecchi testimoni del Coro</b> (Luogo 8) — Bivio dell’Ep. 3, ramo <i>«Restituire '
        'le voci»</i>: gli ammutoliti guariti parlano per voi, e i barcaioli con loro. Se '
        'conservaste le canne sigillate vi danno lo stesso la Mappa Acustica, ma non si espongono.',
        '<b>5 · Il debito antico</b> (Luogo 7) — Bivio dell’Ep. 10, ramo <i>«Consegnare il '
        'vedovo»</i>: il quartiere vi è tornato amico e quella porta si apre. Se usaste la casa '
        'come orecchio, dietro quella porta c’è solo la tentazione della taglia.',
        '<b>LA SOGLIA RESTA 3</b>, e adesso è un numero verificabile: 3 su 5 sul ramo della prova '
        'pubblica, 3 su 4 sul ramo dell’ombra (Ranuzzi fuori dal conto). Ogni alleato vale <b>+1</b> '
        '(un evento-favore in più nel mazzo, oppure una spawn scartata); ogni PNG che vi volta le '
        'spalle è un aiuto in meno. Il conto decide se l’Ispettore è convincibile (serve <b>conto '
        '≥ 3</b>) e quanto è morbido il mazzo. I luoghi che vi sono dovuti — l’oste della '
        'Chiatta (L1), Fossa (L2), il gendarme amico (L4) — vi aiutano comunque, ma <b>non</b> si '
        'contano: il conto misura ciò che vi siete meritati, non ciò che vi è dovuto. La Gazzetta '
        '(L3) è aperta dall’inizio come loro, ma la porta non è la voce n. 3: nel conto entra '
        '<b>Ranuzzi che si schiera</b>, e quello ve lo siete meritato al Bivio dell’Ep. 18.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è il Fascicolo del 1741?</b> Nell’Archivio sequestrato (il gendarme amico L4 + '
        'la mappa dei sigilli di Fossa L2: serve più di una conferma). <i>Esatta:</i> entrate senza '
        'allarme — nel 1° round della spedizione non si pesca nessuna carta Minaccia. '
        '<i>Sbagliata:</i> forzate l’ingresso — 1 gendarme appare in T1.',
        '<b>2. CHI vi apre ancora la porta?</b> I PNG del passato, secondo i Bivi (l’oste L1 + Fossa '
        'L2 + Ranuzzi L3). <i>Esatta:</i> avete chiaro il vostro conto di alleati — sapete su chi '
        'contare per convincere l’Ispettore. <i>Sbagliata:</i> nessun effetto meccanico, ma andate '
        'alla cieca sul conto.',
        '<b>3. COSA manca a M. per il Quarto Movimento?</b> Una voce che creda (il decano L6 + i '
        'vecchi testimoni L8: serve più di una conferma). <i>Esatta:</i> conoscete la crepa del coro '
        '(la chiave tattica dell’Ep. 20: gli impiegati si rompono e fuggono). <i>Sbagliata:</i> '
        'entrerete nel finale senza sapere la debolezza di M.',
        '<b>4. COSA portate alla discesa?</b> La Mappa Acustica (L8), il Fascicolo del 1741 (L9, in '
        'spedizione) e i <b>Frammenti conservati e non incrinati</b> (n. 1-19, quelli che avete '
        'tenuto serata dopo serata vincendo pieno: sono le righe del controcanto). '
        '<i>È l’economia dell’Ep. 20:</i> ciò che manca qui, manca '
        'là. Aiuti: la mappa dei sigilli (Fossa), le Prove per l’Ispettore (L4 + Braga L5). '
        '<i>Esche:</i> la Taglia da Riscuotere, la Via Facile.',
        '<b>IL CONTO DEI BIVI:</b> l’elenco chiuso dei cinque alleati possibili e la soglia sono '
        'nella pagina «il conto dei bivi — l’elenco chiuso». Applicatelo al setup, non qui.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «L’oste '
        'del rifugio» (L1), l’Osservazione «La mappa dei sigilli» (L2) e la Testimonianza «Il '
        'cronista Ranuzzi» (L3). La Domanda 2 non ha complicazione se sbagliata.',
    ])
    pagina('spedizione — l’Archivio e la persuasione', [
        '<b>Montaggio</b> (tessere in Episodio 19/board/, coperte tranne T1):<br/>'
        'T1 L’Ingresso Sigillato (partenza, da Sud) → T2 L’Atrio dei Gendarmi → T3 Le Sale di '
        'Catalogazione → T4 Il Corridoio dei Sigilli (l’Ispettore vi individua) → T5 La Sala di '
        'Lettura (lo scontro/persuasione) → T6 Il Deposito Reperti (il Fascicolo). Con la mappa dei '
        'sigilli di Fossa si salta l’allarme di T1.',
        '<b>La persuasione (non la morte).</b> L’Ispettore Vidal (boss): Att +3, Dif 8, Fer 6, Mov '
        '3, Danno 2. NON si uccide: ridotto all’ultima Ferita si FERMA ad ascoltare. A quel punto: '
        'con le Prove per l’Ispettore E un conto ≥ 3 alleati, lo CONVINCETE (dalla vostra parte, '
        'vittoria piena); senza, si ferma comunque ma resta ufficialmente contro (vittoria '
        'parziale). Non c’è modo di «vincere» abbattendolo.',
        '<b>Il conto in campo.</b> Ogni alleato del conto, in spedizione, vale un evento-favore o '
        'una spawn scartata: la caccia è più o meno stretta secondo quanto vi siete meritati in '
        'diciotto mesi. I gendarmi (Sgherri) sono in buona fede: metterli a terra è sgradevole, '
        'evitarli è meglio.',
        '<b>Il Fascicolo.</b> Al deposito (T6), Interagire prende il Fascicolo del 1741 — '
        'indispensabile per il controcanto dell’Ep. 20. Non prenderlo è l’unico vero fallimento '
        '(raro). La Mappa Acustica (dall’Indagine, L8) e i Frammenti conservati e non incrinati (n. 1-19) completano l’economia del '
        'finale.',
        '<b>Vittoria.</b> Fascicolo preso e Ispettore CONVINTO = <b>vittoria piena</b> (nell’Ep. 20 '
        'Vidal tiene aperte le uscite: ritirata sicura). Fascicolo preso e Ispettore solo fermato = '
        '<b>vittoria parziale</b> (l’Ep. 20 senza la sua rete). <b>Il mazzo:</b> 21 carte (7 '
        'gendarmi, 6 insidie d’archivio, 4 crescendo-individuazione, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio (l’ultimo prima del finale)', [
        '<b>EPILOGO — da leggere se convincete l’Ispettore.</b> «Vidal vi guarda a lungo, la matrice '
        'del decano in mano, il fiato corto della lotta ancora nel petto. Poi abbassa la pistola. '
        '"Mi hanno usato come usano tutti," dice piano. "Come hanno usato voi per diciotto mesi." '
        'Fuori, i suoi uomini aspettano un ordine che non arriva. Vi lascia passare col Fascicolo '
        'del 1741 sotto il braccio, e mentre uscite nella notte vi dice l’ultima cosa: "Le maree di '
        'sizigia sono tornate. Se scendete stanotte, scendo con voi — o almeno tengo aperte le '
        'uscite." Non siete più soli.»',
        # La premessa («il Quarto Movimento ha bisogno di un coro che creda») era
        # sparita nella riscrittura che ha aggiunto il contrasto con Ferri: e' la
        # ragione per cui nel finale conta salvare la voce che crede, e senza di
        # essa il Frammento non conteneva piu' la chiave che dichiara di essere.
        '<b>FRAMMENTO DI CAMPAGNA N. 19:</b> <i>«Il Quarto Movimento ha bisogno di un coro che '
        'creda. Ferri comprava le braccia, ma una fede aveva da darla in cambio; M. compra tutto '
        'e non ha niente da dare — un coro pagato canta con la bocca, e la bocca si chiude per '
        'molto meno.»</i> '
        'Conservatelo: è la chiave tattica del finale.',
        '<b>IL BIVIO — l’ultimo prima del finale; decidete insieme, poi sigillate.</b><br/>'
        '<b>Convincere l’Ispettore con le prove.</b> Nell’Ep. 20 i gendarmi sigillano le uscite '
        'della cripta (ritirata sicura: gli eroi a terra si recuperano), ma la voce gira e M. sposta '
        'l’ora (un round di margine in meno).<br/>'
        '<b>Entrare da soli.</b> Nessuno sa dove siete (sorpresa: 1 carta in meno nel primo giro del '
        'mazzo finale), ma senza rete: ogni eroe a terra nel finale resta a terra.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 19.',
        '<b>AGGANCIO — IL FINALE.</b> Le maree di sizigia tornano. Stanotte. Sotto la Cattedrale, '
        'oltre il punto dove fermaste Ferri, M. e il suo coro comprato aspettano l’ultima voce. È '
        'il Quarto Movimento.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite. Se avete solo fermato '
        'l’Ispettore (non convinto), nessuna penalità immediata — ma nell’Ep. 20 non avrete la sua '
        'rete alle uscite. Il conto continua.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI19_DESC = {
    1: "Sa di acqua bassa e di vinaccio, la Taverna della Chiatta, e di panni messi ad asciugare "
       "troppo vicino al fuoco: l’odore di una casa che non è casa di nessuno. Il pavimento "
       "segue lo scafo e pende di un dito verso il canale — i bicchieri lo sanno, e si radunano "
       "tutti dalla stessa parte del tavolo. Sul tavolo grande, sotto la lampada, stanno aperti "
       "una carta della città con tre segni a matita, una brocca, un mozzicone di candela e un "
       "foglio staccato da un muro, ripiegato in quattro con la stampa all’interno; alle pareti "
       "i chiodi sono più dei quadri. L’oste vi versa senza chiedere, con quelle mani grosse da "
       "barcaiolo che tremano appena nel posare la brocca, e non abbassa la voce come si fa "
       "quando non c’è nessun altro: «le taglie sulle vostre teste sono alte, signori. C’è chi "
       "vi venderebbe.» Fuori, contro la fiancata, l’acqua batte a intervalli regolari; ogni "
       "tanto salta un colpo, e nel vuoto tutti quelli alla panca alzano la testa insieme, poi "
       "la riabbassano. Sulla porta, dalla parte di dentro, qualcuno ha inchiodato una spranga "
       "nuova: il legno attorno è ancora bianco.",
    2: "Canfora, tela cerata e monete tenute in tasca troppo a lungo: dal banco di Fossa l’odore "
       "non è cambiato, ed è l’unica cosa in città che stanotte vi accolga com’è sempre stata. "
       "La grata di ferro battuto, la lampada col paralume verde che tinge le mani di chi paga, "
       "e dietro, sugli scaffali, mezza Roccamora impegnata in pacchi di carta legati con lo "
       "spago, un cartellino per ciascuno. La saracinesca è abbassata per tre quarti, la porta "
       "di servizio socchiusa da prima che arrivaste. Fossa non vi guarda in faccia subito: si "
       "asciuga le mani nel grembiule, due volte, tira la tenda sulla vetrina, e solo allora "
       "alza gli occhi. «Con la Società braccata, gli altri hanno chiuso; io no. Siamo pari, "
       "noi due», dice, e lo dice come si dice una cifra, senza tono. Il paralume verde oscilla "
       "piano sopra il banco per tutto il tempo che restate, e non c’è una finestra aperta in "
       "tutta la stanza. Sul ripiano, fra i registri, c’è un foglio piegato che non è una "
       "polizza: la carta è più ruvida, e le pieghe sono state passate con l’unghia.",
    3: "Inchiostro grasso, piombo e carta umida: alla Gazzetta l’odore resta in gola, e i banchi "
       "delle casse tipografiche sono tiepidi anche a quest’ora, che è l’ora in cui una "
       "redazione dovrebbe essere fredda. La macchina piana sta ferma a metà tiratura, con un "
       "foglio ancora sotto il rullo; sul filo, appese come panni, asciugano le prove di stampa "
       "della prima pagina, tutte uguali, tutte con lo stesso ritratto ripetuto quaranta volte. "
       "Sul tavolo di Ranuzzi: forbici, un pennello da colla, una risma di manifesti che "
       "qualcuno ha portato dentro invece di lasciarli fuori. Lui vi apre dalla porta dei rulli "
       "con le maniche rimboccate e le dita nere fino al secondo nodo, e comincia a parlare "
       "prima ancora di richiudere: «io non stampo quello che mi danno già pronto. L’ho imparato "
       "con voi.» I fogli sul filo si muovono tutti nello stesso istante, un respiro, e poi "
       "tornano fermi; la porta è chiusa. Sul cavalletto delle notizie del giorno la lavagnetta "
       "è stata cancellata di fresco, e nell’angolo in basso resta il gesso di una data.",
    4: "La Gendarmeria di notte sa di cera da pavimenti e di caffè riscaldato tre volte, e ci fa "
       "più caldo che nelle case: le stufe, qui, non le spegne nessuno. Nell’atrio, sotto la "
       "lampada a gas, il tabellone dei ricercati è stato rifatto oggi — le puntine vecchie sono "
       "rimaste nel sughero, in file che non corrispondono più ai fogli — e la colla sull’ultimo "
       "manifesto non ha finito di asciugare, tanto che il bordo si arriccia da solo. Dal "
       "corridoio arriva una macchina da scrivere che batte lenta: tre tasti e una pausa, tre "
       "tasti e una pausa. Il gendarme che vi aspetta non sta in piedi al banco ma seduto di "
       "lato, il berretto sulle ginocchia, e vi parla guardando l’imbocco del corridoio invece "
       "che voi: «chi si è comportato bene con noi, in questi mesi, stanotte trova una porta "
       "socchiusa.» Poi si alza troppo in fretta, come chi i minuti li ha contati. "
       "Sull’attaccapanni a muro, in fondo alla fila dei pastrani grigio-blu, un gancio è "
       "libero, e sotto, sul pavimento, c’è ancora l’acqua sgocciolata da una mantella.",
    5: "La villa-museo sta dietro il suo cancello come una casa in lutto: le imposte del piano "
       "nobile chiuse tutte tranne una, la ghiaia del viale rastrellata di fresco in un senso "
       "solo, e nell’aria quell’odore di canfora e di gommalacca che hanno le collezioni tenute "
       "bene. Sotto il portico le casse da imballaggio aspettano con la paglia già dentro e i "
       "coperchi appoggiati sopra senza un chiodo, come se qualcuno avesse cominciato e si fosse "
       "fermato a metà. Dalla vetrata del vestibolo si vedono le vetrine coperte da teli "
       "bianchi, in fila, e su un piedistallo il velluto conserva l’impronta tonda di ciò che ci "
       "stava. Il campanello d’ottone è tirato lucido dalle dita; quando suona, dentro, la corda "
       "continua a battere contro il muro molto dopo che il suono si è spento. Vi torna in mente "
       "com’era la sua voce quando insegnava, quel gusto di aver ragione con calma: «guardate le "
       "penne, non le mani», diceva, e lo diceva a chiunque. Sullo scalino, contro lo stipite, "
       "sta una bottiglia del latte piena, con la panna già salita.",
    6: "Lo studio del decano è la stanza di un uomo che ha sempre lavorato di notte: tabacco "
       "vecchio, colla da rilegatore e quel principio d’odore d’aceto dei locali dove si tiene "
       "la carta. Il fuoco è acceso ma tenuto basso, e nel camino, sopra la brace, restano fogli "
       "bruciati che hanno conservato la forma: righe intere si leggono ancora, bianche sul "
       "nero, finché non le si tocca. La scrivania porta il calamaio, la lente, le forbicine da "
       "erbario e tre matite temperate tutte alla stessa lunghezza; sulla parete, fra i ritratti "
       "dei presidenti, un chiodo è rimasto solo. Il decano non si alza per accogliervi — le "
       "mani appoggiate ai braccioli, i polsi che escono dalle maniche più magri di come li "
       "ricordate — e aspetta che siate voi a sedervi. «Non avete tempo per l’orgoglio, "
       "ragazzi», dice, e la voce gli scende di mezzo tono sull’ultima parola. Nel corridoio la "
       "pendola batte i quarti; batte anche mentre parla, e ogni volta lui si ferma un istante, "
       "poi riprende. Accanto alla poltrona, sul tappeto, c’è un bicchiere d’acqua pieno che "
       "nessuno ha bevuto.",
    7: "Al secondo piano, dietro una porta come tutte le altre, la casa sa di sapone di "
       "Marsiglia e di ferro da stiro appena posato: un odore da domenica, in una notte che "
       "domenica non è. Sul pianerottolo il becco a gas è abbassato al minimo, e sotto la porta "
       "la luce c’è, ferma, di quelle che non si muovono perché dentro nessuno cammina. Bussate, "
       "e passa più tempo di quanto ce ne voglia ad attraversare una stanza. Dentro: la macchina "
       "da cucire chiusa nel suo mobile, un cesto di rammendi, due tazze sul vassoio e lo "
       "zucchero in una sola. Le mani che vi aprono restano sulla maniglia anche dopo, e non "
       "finiscono di aprire: «Vi ho aiutato una volta. Stanotte dipende da come mi avete "
       "trattato dopo.» Sul tavolo, accanto alla lucerna, un giornale è piegato in modo da "
       "lasciar fuori una colonna sola, e la piega è stata ripassata più volte con il dorso "
       "dell’unghia. La finestra sul cortile è accostata, non chiusa, e la tenda si gonfia e "
       "ricade a intervalli regolari, come se di sotto qualcuno continuasse ad aprire e chiudere "
       "un portone.",
    8: "Il cimitero delle barche si annuncia prima con l’odore — fango scoperto, alghe secche, "
       "catrame vecchio — e poi con il rumore: gli scafi rovesciati fanno da cassa, e ogni passo "
       "sulla melma torna indietro più grande di com’è partito. Le carene stanno in fila sul "
       "fianco con le costole all’aria, mezze dentro e mezze fuori dall’acqua, e fra le ordinate "
       "vuote il vento tiene una nota sola, lunga e bassa, che cala di tono quando cala la "
       "marea. I vecchi si radunano attorno a un braciere ricavato da mezzo bidone, tre o "
       "quattro, le coperte sulle spalle e i remi piantati nel fango come bastoni; uno di loro "
       "ha le mani troppo ferme per l’età, e prima di parlare batte il palmo due volte sulla "
       "chiglia accanto, come si bussa a una porta. «È ancora là sotto», dice, «o ciò che ne "
       "resta.» Nessuno gli chiede di che cosa parli, e nessuno guarda l’acqua. La brace si "
       "abbassa e si rialza da sola, sempre alla stessa cadenza, e il vento non c’entra. Sul "
       "fianco della barca più grande, dove il fasciame è saltato, qualcuno ha inchiodato una "
       "tavola nuova all’altezza di un uomo.",
    9: "L’Archivio Civico di notte è un edificio che non dorme e non è sveglio: dalle finestre "
       "alte del primo piano esce una luce ferma, verdina, e nel vicolo di servizio l’aria sa di "
       "ceralacca calda — un odore d’ufficio, dolciastro, che a quest’ora non dovrebbe esserci "
       "più. Sotto il portico, ammassate contro il muro e coperte da un telo che non basta, "
       "stanno le casse: iuta, spago, cartellini scritti a mano, e su ognuna il bollo dei "
       "gendarmi. Da sotto il telo spunta l’angolo di un mobile che conoscete, e riconoscerlo "
       "qui costa più di quanto sia ragionevole. Il piantone al portone non passeggia: sta fermo "
       "con la lanterna appesa al braccio e la testa un poco piegata, come chi ascolta dentro "
       "invece che fuori. Sulla facciata il manifesto è stato affisso anche qui, e qualcuno l’ha "
       "già strappato all’altezza delle mani, lasciando su il resto. Sul gradino del portone di "
       "servizio, fuori dal telo, è rimasto un cavalletto da imballatore con sopra un rotolo di "
       "spago e un coltellino aperto.",
}

OGGETTI_LUOGO_19 = {
    1: [('Reperto C', 'il Manifesto dei Ricercati', 'il vostro volto sui muri')],
    2: ['La Mappa dei Sigilli'],
    4: ['Le Prove per l’Ispettore'],
    5: [
        ('Esca', 'La Via Facile', 'un passaggio che pare comodo all’Archivio, è un’imboscata dei gendarmi'),
    ],
    6: [('Incrocio D3', '', 'con i vecchi testimoni, COSA manca a M. è provato')],
    7: [
        ('Esca', 'La Taglia da Riscuotere', 'pare fruttare, è la trappola di M.: chi vi consegna finisce usato e scartato'),
    ],
    8: [
        ('Reperto B', 'La Mappa Acustica', ''),
        ('Incrocio D3', '', 'COSA manca a M. è provato'),
    ],
    9: [('Reperto A', 'il Fascicolo del 1741', 'al recupero')],
}

TILE_ART_19 = {t['id']: t['id'] + '-ep19.png' for t in TILES_19}
LUOGHI19_CROP = {}

TESSERE_DESC_19 = {
    'T1': "La ceralacca, di notte e al freddo, non sa di niente finché non ci si avvicina: "
           "allora ha quell’odore dolce di gommalacca e di lampada spenta, e lo si sente prima di "
           "vedere i nastri. Attraversano le due ante in croce, tesi, sigillati alle estremità, e "
           "sotto la mano corre la grana di un portone che avete varcato cento volte da ospiti. "
           "Il lucchetto invece è nuovo — acciaio chiaro, ancora oliato, senza un graffio attorno "
           "al buco della chiave — e sul ferro nero stona come un dente rifatto. Sui gradini la "
           "pioggia della sera ha lasciato una pozza che arriva fino allo stipite, e la soglia "
           "sotto la porta è asciutta. Nel silenzio si sente il canale dietro l’angolo e, di "
           "quando in quando, la ceralacca che schiocca piano raffreddandosi: un colpetto secco, "
           "sempre da un punto diverso della fila. A terra, contro il primo gradino, c’è un "
           "pennello da colla indurito, e la sua traccia sale sul muro fino al bordo di un "
           "manifesto affisso di fresco.",
    'T2': "L’atrio è di marmo, e il marmo restituisce tutto: i passi, la sedia che si sposta, il "
           "respiro. Ci fa freddo come in chiesa, e l’unico calore viene dal fornello a spirito "
           "sul banco della guardia, dove una caffettiera dimenticata sul fuoco basso continua a "
           "borbottare per conto suo. Il posto di guardia è tre sedie, un tavolo e un registro "
           "delle consegne aperto alla pagina di stanotte, con l’ultima riga scritta e non ancora "
           "asciugata; accanto, un mazzo di carte diviso in due mucchi e una giacca d’uniforme "
           "appesa allo schienale invece che al gancio. Lungo la parete, in due file, le casse "
           "sequestrate arrivano all’altezza del petto, ognuna col suo bollo e il suo numero, e "
           "l’ultima è aperta con la paglia rovesciata fuori. Le fiamme delle lanterne appese si "
           "piegano tutte insieme verso il corridoio a settentrione, si raddrizzano, si piegano "
           "ancora: da laggiù tira aria, e nessuno ha aperto una porta. Sul banco, sotto il "
           "registro, spunta l’angolo di un foglio con una fotografia incollata.",
    'T3': "Qui l’aria è secca e sa di polvere di carta e di matita copiativa, quel sapore di "
           "violetta e di metallo che resta sulla lingua a chi passa le giornate a bagnare la "
           "punta. I faldoni salgono in colonne sui tavoli lunghi, legati con lo spago a tre "
           "giri, e sopra ognuno un cartellino di cartoncino giallo scritto da una mano sempre "
           "uguale, ordinata, senza fretta. Fra un tavolo e l’altro si riconoscono le cose per "
           "quello che sono state: una cassetta di vetrini, un teodolite senza treppiede, una "
           "cassa di libri con le costole voltate al muro perché nessuno ha guardato i titoli. Il "
           "lavoro è a un terzo, e si vede dove si è fermato — una fila etichettata, una fila no, "
           "e in mezzo un cartellino compilato a metà. Le fiammelle delle lampade da tavolo "
           "tremano quando qualcuno cammina due sale più in là, tutte insieme, e continuano a "
           "tremare un poco più a lungo di quanto il passo giustifichi. In cima a una colonna, "
           "sul tavolo di mezzo, c’è un orologio da tasca senza catena, fermo, col cartellino "
           "ancora vuoto.",
    'T4': "Il corridoio è lungo abbastanza che la lanterna non ne veda la fine, e le porte dei "
           "depositi si ripetono a destra e a sinistra sempre alla stessa distanza, ognuna con la "
           "sua ceralacca fresca e il suo numero a stampino. L’odore è di cera e di calce, e a "
           "metà corridoio l’aria diventa più fredda di quanto un piano interno possa spiegare. "
           "Sotto i piedi il cotto è consumato al centro in un solco lucido, e le suole ci "
           "scivolano appena. Non un sigillo già rotto, non una porta accostata, non una crepa: "
           "la fila è così regolare che gli occhi si mettono a cercare l’errore per conto loro. "
           "Poi, dal fondo, arrivano dei passi — passi normali, senza fretta, uno ogni battito e "
           "mezzo — e non cambiano ritmo quando la vostra lanterna si abbassa; si fermano una "
           "volta sola, il tempo di guardare qualcosa, e ripartono con la stessa misura. Contro "
           "la parete, all’altezza del ginocchio, una porta porta un graffio nuovo nel legno, "
           "lungo un palmo, e sotto la polvere è raccolta in una riga chiara.",
    'T5': "La sala di lettura è la stanza più grande dell’edificio e la più silenziosa: il "
           "soffitto si perde nel buio, e in basso le lampade dal paralume verde, accese tutte, "
           "posano sui tavoli lunghi una fila di cerchi di luce che non si toccano. Il verde fa "
           "alle mani quello che fa sempre — le rende di un colore che non hanno — e il resto "
           "della sala resta ai bordi, dove le scaffalature salgono in ballatoi. Sui piani non è "
           "rimasto un foglio di brutta: le sedie sono state rimesse a posto una per una, tutte "
           "alla stessa distanza dal tavolo, e i leggii inclinati sono vuoti. Sa di polvere calda "
           "di lampada e di cuoio vecchio, e sotto, appena, di tabacco spento da poco. Una delle "
           "lampade in fondo ronza — un ronzio da insetto chiuso in una stanza — e ogni tanto "
           "smette per due o tre secondi, poi riprende. All’ultimo tavolo, un posto solo è stato "
           "usato: la sedia scostata di traverso, e sul piano un bicchiere d’acqua bevuto a metà.",
    'T6': "Il deposito è una stanza senza finestre, e l’aria ci sta ferma da tanto tempo che la "
           "fiamma della lanterna non si piega di un capello. Ceralacca dappertutto: sui nodi "
           "dello spago, sulle ante degli armadi, sugli angoli delle scatole, e ogni sigillo "
           "porta lo stemma della città schiacciato di fresco, ancora lucido. Gli scaffali "
           "corrono dal pavimento al soffitto in file numerate, e su ogni ripiano i reperti "
           "stanno in ordine di entrata e non di che cosa siano: un coltello accanto a un "
           "servizio da tè, una scarpa spaiata accanto a un mazzo di lettere legato con un "
           "nastro. Sa di cera, di spago nuovo e di quella polvere fine che fa la carta quando è "
           "tanta. Ogni tanto, fra gli scaffali, si sente un fruscio breve, sempre nella stessa "
           "fila, come di carta che si assesta sotto il proprio peso. Fra tutti quei sigilli "
           "rossi, su un ripiano all’altezza degli occhi, uno solo è scuro e vecchio, e la "
           "cartella che chiude ha il dorso di pelle e gli angoli consumati fino alla tela.",
}

ESAMI_CARBONE_19 = {
    'IL FASCICOLO DEL 1741': '«L’antico dossier della confraternita: come i Padri fecero <i>tacere</i> '
                'il Dormiente la prima volta. Non uccidendolo — non si può — ma cantandogli sopra un '
                'controcanto che lo riporta al sonno senza sogni. Metà dei Frammenti che avete '
                'raccolto sono righe di questo controcanto; M. le voleva per il Quarto Movimento, e '
                've le ha fatte cercare da sé.»',
    'LA MAPPA ACUSTICA': '«La città è uno strumento: campane, organi, fontane, cisterne, tutto '
                'accordato dai Padri per portare o spegnere la voce del Dormiente. La mappa dice '
                'quali tacere e quali far suonare per il controcanto. Senza, sotto la Cattedrale '
                'sareste sordi.»',
    'IL MANIFESTO DEI RICERCATI': '«Il vostro volto sui muri, "per i crimini di C.B.". È la misura '
                'esatta della disperazione di M.: per fermarvi ha dovuto bruciare la sua stessa '
                'maschera pubblica, il presidente rispettabile. Un uomo che rovescia il tavolo ha '
                'finito le carte buone. Braccati sì, ma non più ingannati.»',
}

OGGETTI_TESSERA_19 = {'T2': ['Un Lasciapassare Notturno']}


def luoghi():
    """Luoghi.pdf Episodio 19 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 19 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_19, 'Episodio 19')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_19.get(n, []))

    for L in LUOGHI_19:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI19_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI19_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_19)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_19
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['L’ISPETTORE VIDAL', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 19')
    print('OK episodio 19')
