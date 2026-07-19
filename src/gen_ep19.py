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
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
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
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


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
    "<i>Aperti dall’inizio: la Taverna della Chiatta (il rifugio in esilio), il Banco dei Pegni di "
    "Fossa, la Gazzetta di Roccamora, la Gendarmeria. Gli altri PNG del passato aprono — pieni o "
    "monchi — secondo i BIVI che avete scelto in diciotto serate.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «le taglie sulle vostre teste» (L1+L2), «la Società braccata» (L2+L3),
# «il conto dei bivi» (L3+L4), «l'ultima discesa» (L1+L4). Riv. (D2) su L1,L2,L3.
LUOGHI_19 = [
    dict(n=1, nome='LA TAVERNA DELLA CHIATTA', voce_mappa='La Taverna della Chiatta',
         req='Disponibile dall’inizio', art='La Taverna della Chiatta.png',
         chiude=None,
         indizi=[
             'La Taverna della Chiatta, sull’acqua bassa: il rifugio della Società in esilio. Qui '
             'si sono raccolti quelli che vi restano fedeli, sotto le taglie sulle vostre teste. '
             '<i>(Reperto C: prendete il Manifesto dei Ricercati — il vostro volto sui muri.)</i>',
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
                        'loro, o a loro, in diciotto mesi. Braga vivo se l’avete protetto; il decano '
                        'lucido se l’avete salvato in tempo; la città con voi se avete reso pubblica '
                        'la verità. È il conto della campagna, e stanotte lo pagate o lo incassate. '
                        'M. ha comprato il suo coro; voi dovete <i>meritarvi</i> il vostro. È questa '
                        'la differenza, e forse è tutto.»'),
         ]),
    dict(n=2, nome='IL BANCO DEI PEGNI DI FOSSA', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Fossa vi deve la vita dal Preludio, e non l’ha dimenticato: «con la Società braccata, '
             'gli altri hanno chiuso; io no. Vi devo troppo.» Vi passa la mappa dei sigilli '
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
                  testo='Fossa, che vi deve la vita, è la prova che il conto della campagna non è '
                        'solo un peso: è anche un tesoro. Chi avete salvato torna a salvarvi. La sua '
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
             'Vi passa di nascosto le prove che smontano il dossier di Vidal: la matrice del decano, '
             'il confronto col metodo di M. <i>(Oggetto: prendete le Prove per l’Ispettore.)</i> '
             '«Se riuscite a parlargli prima che spari, questo lo ferma.»',
             'Il gendarme, sottovoce: «Vidal è già all’Archivio, vi aspetta. Sa che tornerete per '
             'il Fascicolo del 1741: è troppo bravo per non averlo capito. Andateci sapendo che '
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
             'Se avete PROTETTO Braga (Bivio Ep. 15), il professore vi apre e vi consegna il suo '
             'archivio su M.: trent’anni di studio del rivale. «Ve l’avevo detto: guardate le '
             'penne, non le mani. Adesso sapete di che penna si tratta. Prendete, e usatelo.»',
             'Se lo avete AVALLATO, la villa è vuota: Braga è morto, o sparito, e la porta resta '
             'chiusa. <i>(Esca: la Via Facile — un passaggio che pare comodo all’Archivio, è '
             'un’imboscata dei gendarmi.)</i> Il conto, stanotte, è a vostro sfavore.',
             'L’archivio di Braga, se lo avete, rafforza le Prove per l’Ispettore: il rivale che ha '
             'studiato M. per trent’anni è il testimone perfetto della sua doppiezza.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il debito di Braga',
                  testo='Braga è il conto più caro della campagna: se l’avete protetto quando la '
                        'città voleva la sua testa, stanotte vi ripaga con l’unica cosa che ha — '
                        'trent’anni di studio del suo rivale, la prova vivente che M. ha due facce. '
                        'Se l’avete lasciato cadere per comodità, la sua porta è chiusa, e con essa '
                        'una delle prove migliori per Vidal. Ogni scelta pesa: è questo il pay-off. '
                        'La campagna non dimentica, e stanotte ve lo dice in faccia.'),
         ]),
    dict(n=6, nome='IL DECANO FERRANTE', voce_mappa='Lo Studio del Decano',
         req='Lo studio del decano apre a chi ha pagato il conto dell’Ep. 17: il decano che avete '
             'salvato lucido — o ferito grave — nella villa-prigione.',
         chiave=('parola', 'LA SOCIETÀ BRACCATA'), art='Lo Studio del Decano.png',
         chiude=None,
         indizi=[
             'Se avete salvato il decano LUCIDO (Ep. 17), è qui, provato ma vivo, e vi consegna la '
             'matrice completa e la crepa del coro: «M. ha comprato i cantori, non li ha convertiti. '
             'Un coro comprato canta con la bocca. Al Quarto Movimento gli manca una voce che creda.»',
             'La matrice del decano applicata all’ultimo movimento dice cosa manca a M.: '
             '<i>(incrocio D3: con i vecchi testimoni, COSA manca a M. è provato.)</i> La voce che '
             'il Coro insegue dall’Ep. 3.',
             'Se il decano è ferito grave, parla a fatica e la sua metà di verità è confusa: '
             'l’incrocio D3 è più fragile. Il conto dell’Ep. 17 pesa qui.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La crepa del coro',
                  testo='Il decano, se lucido, vi dà la chiave tattica del finale: il coro di M. è '
                        'comprato, non convertito, e un uomo pagato per cantare uno spartito che non '
                        'capisce, alla prima crepa, scappa. È la debolezza del Quarto Movimento, e '
                        'sarà la vostra arma nell’Ep. 20. Ma la crepa è anche più profonda: a M. '
                        'manca la voce che CREDA, e senza quella il rito non si compie. Voi non '
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
             'C’è chi, disperato, valuta di consegnarvi per la taglia in oro vecchio. <i>(Esca: la '
             'Taglia da Riscuotere — pare fruttare, è la trappola di M.: chi vi consegna finisce '
             'usato e scartato.)</i>',
             'Il debito, se onorato, aggiunge un alleato al conto per l’Archivio: una mano in più, '
             'una porta di servizio, un avvertimento al momento giusto.'],
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
             'Chi ricorda il Coro dall’Ep. 3, i vecchi barcaioli e ossari: vi danno la mappa '
             'acustica, la via delle tre acque sotto la città. <i>(Oggetto: prendete la Mappa '
             'Acustica.)</i> <i>(Reperto B: consegnate la Mappa Acustica.)</i>',
             'La mappa incrocia il sapere del decano: quali campane, organi e fontane far tacere e '
             'quali suonare per il controcanto. <i>(incrocio D3: COSA manca a M. è provato.)</i> '
             'Senza la mappa, sotto la Cattedrale sareste sordi.',
             'Un vecchio ossario: «la voce che il Coro cerca dall’inizio è ancora là sotto, o ciò '
             'che ne resta — dipende da come avete chiuso i casi del Coro. M. la cerca stanotte. '
             'Arrivateci prima.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La via delle tre acque',
                  testo='I vecchi testimoni del Coro custodiscono la mappa acustica: la città è uno '
                        'strumento accordato dai Padri, e la mappa dice come suonarlo per il '
                        'controcanto che riporta il Dormiente al sonno senza sogni. È la via delle '
                        'tre acque sotto la Cattedrale, il percorso dell’Ep. 20. Ciò che avete fatto '
                        'nei casi del Coro (Ep. 3-6) decide quanto della voce che M. cerca è ancora '
                        'recuperabile. Il conto, di nuovo: la campagna presenta il suo saldo anche '
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
             'Il Fascicolo del 1741 è l’antico dossier della confraternita: come i Padri fecero '
             'tacere il Dormiente la prima volta, il controcanto. <i>(Reperto A: al recupero, il '
             'Fascicolo del 1741.)</i> Senza, l’Ep. 20 non ha il controcanto.',
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
         cerca_vuoto='Sale buie piene della vostra stessa roba sequestrata: fascicoli, cimeli, la '
                     'vostra vita di Società impacchettata. Da qualche parte, il Fascicolo del 1741.',
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
         cerca_vuoto='Faldoni su faldoni, e da qualche parte il Fascicolo del 1741. Ma prima '
                     'dovrete passare dall’uomo che vi aspetta più avanti.',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL CORRIDOIO DEI SIGILLI', exits={'S': 'T3', 'N': 'T5'},
         testo='Il corridoio dei depositi sigillati. QUANDO RIVELATE QUESTA TESSERA: l’Ispettore '
               'Vidal vi individua — ha capito da giorni che sareste tornati per il Fascicolo. Da '
               'qui la caccia è dentro l’Archivio, e lui è bravissimo.',
         arbitro='Da ora l’Ispettore è sulle vostre tracce (le carte crescendo lo avvicinano). '
                 'Preparate le Prove per l’Ispettore: alla Sala di Lettura (T5) dovrete fermarlo e '
                 'parlargli, non abbatterlo.',
         cerca_vuoto='Porte sigillate a decine, e i passi misurati di Vidal che si avvicinano. Non '
                     'correte: pensate a cosa gli direte quando vi troverà.',
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
         cerca_vuoto='Vidal abbassa lentamente l’arma, in attesa. «Parlate,» dice. «Ma parlate '
                     'bene: è l’ultima cosa che sentirò da voi prima di decidere.»',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='IL DEPOSITO REPERTI', exits={'S': 'T5'},
         testo='Il deposito reperti, dove il Fascicolo del 1741 giace sotto sigillo fresco. QUANDO '
               'RIVELATE QUESTA TESSERA: prendete il Fascicolo — il controcanto per l’Ep. 20 — e '
               'uscite, con l’Ispettore convinto (o almeno fermato) alle spalle.',
         arbitro='OBIETTIVO. Interagire prende il Fascicolo del 1741 (indispensabile per l’Ep. 20). '
                 'Con l’Ispettore convinto = vittoria piena (i gendarmi coprono la ritirata nel '
                 'finale). Solo fermato = vittoria parziale. Senza il Fascicolo = spedizione '
                 'fallita (raro).',
         cerca_vuoto='Il Fascicolo del 1741, l’antico dossier della confraternita, finalmente in '
                     'mano. Dentro c’è il controcanto: come si fa dormire un dio senza sogni. '
                     'Prendetelo, e scendete.',
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
         bio_bestiario='L’Ispettore Cesare Vidal è il migliore che la Gendarmeria abbia: onesto '
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
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
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
        Paragraph('• <b>IL CONTO DEI BIVI (setup).</b> Prima di cominciare, contate i vostri Bivi '
                  'di campagna a favore (Braga protetto Ep. 15, decano salvato Ep. 17, prova '
                  'pubblica Ep. 18, e i minori). Ogni Bivio a favore = <b>+1 alleato</b> (una carta '
                  'evento-favore in più nel mazzo, o una spawn scartata); ogni Bivio a sfavore = un '
                  'PNG che vi volta le spalle (un aiuto in meno). Il conto totale decide se '
                  'l’Ispettore è <b>convincibile</b>.', BODY),
        Paragraph('• <b>L’ISPETTORE NON SI UCCIDE.</b> Alla Sala di Lettura (T5), Vidal (boss) fa '
                  'muro. Riducetelo all’ultima Ferita: si <b>ferma</b> ad ascoltare. Con le <b>Prove '
                  'per l’Ispettore</b> (matrice del decano + metodo di M.) e un conto ≥ soglia, lo '
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
        '<b>Il caso.</b> Braccati, la sede sigillata. L’indagine è la vostra campagna: ogni luogo è '
        'un PNG del passato che apre o chiude secondo i Bivi. Obiettivo: rimettere insieme i pezzi '
        'per l’ultima discesa e riprendere il Fascicolo del 1741.',
        '<b>La verità.</b> M. ha comprato ciò che resta del Coro (impiegati, non credenti): gli '
        'manca una voce che creda per il Quarto Movimento, e la cerca stanotte. L’Ispettore Vidal '
        'che vi bracca è onesto, ingannato dal metodo di M. (come Braga). Sventare = raccogliere '
        'gli alleati, prendere il Fascicolo e CONVINCERE Vidal.',
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
        'spedizione) e i Frammenti-bis. <i>È l’economia dell’Ep. 20:</i> ciò che manca qui, manca '
        'là. Aiuti: la mappa dei sigilli (Fossa), le Prove per l’Ispettore (L4 + Braga L5). '
        '<i>Esche:</i> la Taglia da Riscuotere, la Via Facile.',
        '<b>IL CONTO DEI BIVI:</b> contate i Bivi a favore (Braga protetto Ep. 15, decano lucido '
        'Ep. 17, prova pubblica Ep. 18, e minori). Ogni favore = +1 alleato (evento-favore in più o '
        'spawn scartata); ogni sfavore = un PNG in meno. Il conto decide se Vidal è convincibile '
        '(serve conto ≥ 3 alleati) e quanto è morbido il mazzo.',
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
        '(raro). La Mappa Acustica (dall’Indagine, L8) e i Frammenti-bis completano l’economia del '
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
        '<b>FRAMMENTO DI CAMPAGNA N. 19:</b> <i>«Il Quarto Movimento ha bisogno di un coro che '
        'creda. M. non ha mai avuto un coro: ha sempre avuto impiegati. Questa è la sua crepa.»</i> '
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
    1: "La Taverna della Chiatta, sull'acqua bassa: il rifugio della Società in "
       "esilio, dove si sono raccolti quelli che vi restano fedeli sotto le "
       "taglie. Qui si pianifica l'ultima discesa, e qui si comincia a fare il "
       "conto di chi vi apre ancora la porta.",
    2: "Il Banco dei Pegni di Fossa: Fossa vi deve la vita dal Preludio e non "
       "l'ha dimenticato. Con la Società braccata, lui la porta la tiene aperta, "
       "e vi passa la mappa dei sigilli dell'Archivio. Chi avete salvato torna "
       "a salvarvi: il conto, stavolta, a favore.",
    3: "La Gazzetta di Roccamora: Ranuzzi è l'unico che non ha bevuto il "
       "manifesto. Ha capito il metodo — un dossier perfetto messo in mano a un "
       "Ispettore onesto, come con Braga — e vi aiuta a smontarlo, se il conto "
       "dei bivi glielo permette.",
    4: "La Gendarmeria: non tutti credono al manifesto. Un gendarme che vi ha "
       "visti lavorare vi apre la via all'Archivio e vi passa le prove che "
       "potrebbero convincere l'Ispettore Vidal — se arrivate a parlargli "
       "invece di combatterlo.",
    5: "Il professor Braga (la sua villa): apre SOLO se l'avete protetto (Ep. "
       "15). Allora vi consegna trent'anni di studio del rivale M., la prova "
       "vivente della sua doppiezza. Se l'avete lasciato cadere, la porta è "
       "chiusa: il conto, qui, a vostro sfavore.",
    6: "Lo studio del decano Ferrante: apre lucido SOLO se l'avete salvato in "
       "tempo (Ep. 17). Allora vi dà la matrice completa e la crepa del coro — "
       "M. ha comprato i cantori, non li ha convertiti. Se è ferito grave, la "
       "sua metà di verità è confusa.",
    7: "Un debito antico (la casa di una vecchia conoscenza): sotto le taglie, "
       "ogni conto in sospeso torna a bussare. Chi avete trattato bene vi "
       "nasconde; chi avete usato è tentato dalla taglia in oro vecchio. "
       "Economia della fiducia, non morale.",
    8: "I vecchi testimoni del Coro, tra le barche morte: chi ricorda il Coro "
       "dall'Ep. 3 vi dà la mappa acustica, la via delle tre acque sotto la "
       "città. Senza, sotto la Cattedrale sareste sordi. La voce che il Coro "
       "cerca è ancora là sotto — o ciò che ne resta.",
    9: "L'Archivio Civico, sotto sigillo dei gendarmi, dove è ammassata tutta "
       "la roba della Società: la vostra vita impacchettata da mani estranee. "
       "Dentro, il Fascicolo del 1741 — e l'Ispettore Vidal, che vi aspetta e "
       "va convinto, non ucciso.",
}

OGGETTI_LUOGO_19 = {
    2: ['La Mappa dei Sigilli'],
    8: ['La Mappa Acustica'],
    4: ['Le Prove per l’Ispettore'],
    7: ['La Taglia da Riscuotere'],
    5: ['La Via Facile'],
}

TILE_ART_19 = {t['id']: t['id'] + '-ep19.png' for t in TILES_19}
LUOGHI19_CROP = {}

TESSERE_DESC_19 = {
    'T1': "L'ingresso dell'Archivio Civico sotto sigillo, di notte: nastri di "
          "ceralacca sulle porte, un lucchetto nuovo, la vostra casa di "
          "Società trasformata in deposito di prove contro di voi. Un sigillo, "
          "però, è più debole degli altri: Fossa lo sapeva.",
    'T2': "L'atrio dove monta la guardia notturna: pochi gendarmi annoiati, "
          "convinti di sorvegliare la roba di criminali. Non sanno di custodire "
          "la vostra vita, e di dare la caccia agli unici innocenti della "
          "storia. In buona fede, e proprio per questo tristi da abbattere.",
    'T3': "Le sale di catalogazione: montagne di faldoni, cimeli etichettati, "
          "la storia della Società smistata e numerata da mani estranee. Da "
          "qualche parte, tra migliaia di scatole, il Fascicolo del 1741 — e "
          "mille faldoni sbagliati che vi farebbero perdere la notte.",
    'T4': "Il corridoio dei depositi sigillati, lungo e silenzioso. E in fondo, "
          "che si avvicina coi suoi passi misurati, la sagoma dell'Ispettore "
          "Vidal: vi ha aspettati, sapeva che sareste tornati per il Fascicolo. "
          "Il migliore che la Gendarmeria abbia, e crede in ciò che fa.",
    'T5': "La grande sala di lettura, tavoli lunghi e lampade dal paralume "
          "verde. Qui Vidal vi affronta, tra voi e il deposito. Non è una "
          "trappola: è un esame. Riducetelo, sì, ma tenete pronte le parole "
          "giuste — perché è con quelle, non con le lame, che si vince stanotte.",
    'T6': "Il deposito reperti, sigilli freschi ovunque. E lì, catalogato come "
          "prova numero tante, il Fascicolo del 1741: l'antico dossier della "
          "confraternita, il controcanto che fa dormire un dio senza sogni. "
          "Prendetelo. Da qui si scende.",
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
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_19.get(n, [])]

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
