# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 18: La mano sola (Episodio 18/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-18.md e CAMPAGNA-EPISODI.md). Atto III,
mythology, LA RIVELAZIONE e la chiusura d'atto: l'indagine È la deduzione (le 4
Domande = «chi è C.B.», risposte con gli incroci di tutta la campagna). C.B. è
M. — Camillo Benso + il Machiavelli, due maschere, una mano sola. Smascherato,
M. rovescia il tavolo (accusa VOI) e sfugge all'Atto IV. Spedizione: la fuga dal
Palazzo del Lume (casa vostra) col maggiordomo traditore (boss), prima che i
gendarmi vi arrestino. Non c'è più un seme: si RACCOGLIE.

Varietà strutturale (regola 2026-07-18): l'indagine È la deduzione (nessun
luogo nuovo, i fili aperti che convergono); la casa come dungeon, la caccia
rovesciata (fuggite VOI). Torsione d'indagine: «chi è C.B.» — la deduzione di
campagna.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 18.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 18', 'pdf')
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

LETTERA_18 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Siete arrivati lontano, amici miei. Più di quanto immaginassi. Stasera chiudiamo il caso di "
    "C.B., finalmente — <i>insieme</i>. Portate tutto ciò che avete raccolto: i verbali, i bivi, le "
    "riletture, la matrice del povero decano. Mettetelo sul tavolo, davanti alla Società riunita.<br/><br/>"
    "E poi guardatevi in faccia, e ditemi: chi, in questa stanza, ha sempre saputo un passo più di "
    "voi? Chi vi ha mandati a caccia, e ogni volta sapeva dove sareste andati? La risposta è più "
    "semplice, e più terribile, di quanto crediate. È stata davanti a voi per diciotto mesi. Avete "
    "<b>6 ore</b> per pronunciare un nome. Poi tocca a me.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Non ci sono luoghi nuovi da sbloccare stanotte: ci sono i FILI da chiudere. Le 4 Domande "
    "sono una sola — CHI È C.B.? — e si rispondono con gli INCROCI DI CAMPAGNA che avete raccolto "
    "(bivi, verbali, riletture dell’Ep. 16, matrice dell’Ep. 17). Aperti dall’inizio: l’Assemblea, "
    "l’Archivio delle Penne, la Contabilità, il Fascicolo di Campagna.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «una mano sola» (L1+L2), «l'oro vecchio» (L1+L3), «la carrozza condivisa»
# (L3+L4), «l'inchiostro del presidente» (L2+L4). Rivelatorio (D2) su L1, L3, L4.
LUOGHI_18 = [
    dict(n=1, nome='L’ASSEMBLEA DELLA SOCIETÀ', voce_mappa='Il Palazzo del Lume',
         req='Disponibile dall’inizio', art='Palazzo del Lume.png',
         chiude=None,
         indizi=[
             'La Società riunita, nella forma scelta dall’Ep. 17: il processo interno o la trappola '
             'della firma. Sul tavolo, diciotto mesi di indizi. «È tutto qui, confratelli: basta '
             'metterlo in fila. Ogni volta che C.B. sapeva troppo, e ogni volta che il presidente '
             'sapeva un passo più di noi. Una mano sola muove entrambi.»',
             'Il libro mastro della Società, aperto: l’oro vecchio che paga C.B. e l’oro che finanzia '
             'la confraternita escono dalla stessa cassa. «L’oro vecchio è la firma contabile: chi '
             'paga C.B. paga da dove paghiamo noi. Non è un nemico esterno. È in bilancio.»',
             'Su un vassoio, pronte, delle prove che accusano VOI: pagamenti, lettere, un testimone. '
             '<i>(Esca: l’Accusa Pronta contro di Voi — le prove che M. ha arredato per farvi '
             'cadere; toccarle è entrare nella trappola prima del tempo.)</i>'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La Società riunita',
                  testo='Messi in fila davanti all’assemblea, i diciotto mesi non raccontano diciotto '
                        'casi: raccontano un uomo solo che, da presidente, vi mandava a caccia di se '
                        'stesso da C.B., restando sempre un passo avanti perché il passo lo dettava '
                        'lui. La carta di pregio, la carrozza dei noli, il nastro verde, il sigillo, '
                        'la matrice del decano: ogni seme di diciotto mesi converge su una sola mano. '
                        'Non serve un nuovo indizio. Serve il coraggio di dire il nome che avete '
                        'sotto gli occhi da sempre.'),
         ]),
    dict(n=2, nome='L’ARCHIVIO DELLE PENNE', voce_mappa='L’Archivio delle Penne',
         req='Disponibile dall’inizio', art='L’Archivio delle Penne.png',
         chiude=None,
         indizi=[
             'L’archivio delle penne della Società: calamai, pennini, l’inchiostro ferro-gallico che '
             'annerisce col tempo. La penna d’archivio del presidente scrive con lo stesso inchiostro '
             'di ogni firma di C.B. «L’inchiostro del presidente e quello di C.B. sono lo stesso: '
             'ferro-gallico, stessa ricetta, stesso annerimento. Una mano sola, un calamaio solo.»',
             'Confrontando le firme conservate, «M.» e «C.B.» hanno lo stesso vezzo: lo stesso '
             'allungo sulla coda, la stessa esitazione prima della maiuscola. Un falsario imita una '
             'firma; nessuno imita due firme rivali con lo stesso identico tic — se non chi le scrive '
             'entrambe. Una mano sola.',
             'Il custode delle penne, sbiancando: «il presidente scrive le sue lettere qui, di notte, '
             'da sempre. E certe notti, dopo che se n’è andato, trovavo un secondo calamaio usato, e '
             'una seconda grafia sugli scarti. Credevo avesse un segretario. Non aveva un segretario. '
             'Aveva un’altra maschera.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’inchiostro del presidente',
                  testo='L’inchiostro ferro-gallico della penna d’archivio del presidente è identico, '
                        'ricetta per ricetta, a quello di ogni firma di C.B. sulla carta di pregio. '
                        'Non due fornitori simili: lo stesso calamaio. E il vezzo della mano — '
                        'l’esitazione prima della maiuscola — è lo stesso in «M.» e in «C.B.». '
                        'Diciotto mesi a cercare due uomini, e c’era una penna sola, in una stanza '
                        'sola, in mano a un uomo solo. Il presidente firma da entrambi i lati del '
                        'tavolo, e da entrambi vi ha guardati cadere nella caccia.'),
         ]),
    dict(n=3, nome='LA CONTABILITÀ DELLA SOCIETÀ', voce_mappa='La Contabilità',
         req='Disponibile dall’inizio', art='La Contabilità.png',
         chiude=None,
         indizi=[
             'La contabilità della Società: il libro mastro, l’oro d’antica fusione. Gli stessi lotti '
             'd’oro vecchio pagano i lavori di C.B. e finanziano la confraternita. «L’oro vecchio è '
             'uno solo, e paga entrambi. Chi tiene questa cassa tiene C.B. E questa cassa la tiene '
             'il presidente.»',
             'Certe notti la carrozza condivisa dei noli parte dal cortile del Palazzo: la stessa che '
             'serve la cartiera di C.B. e il Palazzo del Lume. «La carrozza condivisa è la prova '
             'logistica: una sola carrozza per due maschere, alla stessa ora, dallo stesso cortile.»',
             'Il contabile, tremando: «i conti tornano sempre, ma tornano *troppo*. C.B. e la Società '
             'non si fanno mai concorrenza sull’oro vecchio, mai un lotto conteso. Come due mani che '
             'non si pestano i piedi — perché sono la stessa mano.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’oro d’una cassa sola',
                  testo='L’oro d’antica fusione che paga C.B. e quello che finanzia la Società escono '
                        'dalla stessa cassa, senza mai un conflitto, senza mai un lotto conteso. Due '
                        'imprese rivali si contendono le risorse; queste due si spartiscono l’oro come '
                        'un uomo si sposta la borsa da una tasca all’altra. Non è collusione tra due '
                        'poteri: è un potere solo che finge di essere due. Il presidente non finanzia '
                        'C.B.: il presidente È il bilancio di C.B.'),
         ]),
    dict(n=4, nome='IL FASCICOLO DI CAMPAGNA', voce_mappa='Il Fascicolo di Campagna',
         req='Disponibile dall’inizio', art='Il Fascicolo di Campagna.png',
         chiude=None,
         indizi=[
             'Il vostro fascicolo di diciotto mesi: i verbali, i bivi, le riletture dell’Ep. 16, la '
             'matrice del decano. <i>(Oggetto: prendete gli Incroci di Campagna — più ne avete '
             'raccolti, più solida è l’accusa.)</i> Messi in fila, non è una caccia: è un uomo che vi '
             'mandava a caccia di sé.',
             'Ogni volta che M. «sapeva troppo» (il nastro verde, il nome prima delle prove), non era '
             'genio: era memoria. Sapeva perché era lui a muovere le cose. La carrozza condivisa, '
             'l’inchiostro del presidente, l’oro vecchio: quattro fili, una mano sola.',
             'In fondo al fascicolo, il vezzo delle firme messo a confronto: «M.» — Machiavelli; '
             '«C.B.» — Camillo Benso. Due maschere che «hanno fatto l’Italia in due»: il cospiratore '
             'e il contabile. Un uomo che si crede l’Italia intera.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Gli incroci di diciotto mesi',
                  testo='Il fascicolo di campagna è la vostra vera arma stanotte: non un indizio, ma '
                        'diciotto mesi di indizi che si tengono per mano. Ogni bivio deciso, ogni '
                        'verbale sigillato, ogni lettera riletta, la matrice del decano: presi uno a '
                        'uno, coincidenze; presi insieme, un ritratto. E il ritratto ha il volto del '
                        'presidente. Più fili avete chiuso in questi mesi, più la mano che li tiene è '
                        'innegabile — davanti alla Società, e davanti a voi stessi, che non avete mai '
                        'osato guardarlo.'),
         ]),
    dict(n=5, nome='LO STUDIO PRIVATO DI M.', voce_mappa='Lo Studio Privato di M.',
         req='Lo studio privato del presidente, dove non siete mai entrati, si apre solo a chi ha '
             'osato pensare l’impensabile: che dietro le due maschere ci sia una mano sola.',
         chiave=('parola', 'UNA MANO SOLA'), art='Lo Studio Privato di M.png',
         chiude=None,
         indizi=[
             'Lo studio privato del presidente, in cui non siete mai entrati in diciotto mesi: alle '
             'pareti, il ritratto del Machiavelli e, di fronte, uno specchio. Le due maschere si '
             'guardano. Qui M. era C.B. e C.B. era M., ogni notte, da solo.',
             'Sul leggìo, un documento firmato due volte: una «M.», una «C.B.», la stessa mano. '
             '<i>(Reperto A: la Firma Doppia — la prova che smaschera.)</i> <i>(Oggetto: prendete il '
             'Vezzo delle Firme — le due firme a confronto, D4.)</i>',
             'Su un cavalletto, il ritratto di un rivale immaginario. <i>(Esca: il Ritratto del '
             'Rivale — pare che M. tema un nemico esterno; è solo una delle sue maschere, non un '
             'altro uomo.)</i> M. non ha rivali: è rivale di se stesso.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Le due maschere allo specchio',
                  testo='Nello studio privato del presidente, il ritratto del Machiavelli e lo '
                        'specchio si fronteggiano: e ora capite. M. non serviva un padrone né temeva '
                        'un rivale — M. *era* il rivale, l’altra faccia di sé. Camillo Benso e il suo '
                        'specchio, il cospiratore e il contabile, le due mani con cui «si fa '
                        'un’Italia». Si è dato la caccia da sé per anni, muovendo entrambi i lati del '
                        'tavolo, perché un uomo che si crede la storia non ha bisogno di complici: ha '
                        'bisogno di un palcoscenico. E il palcoscenico eravate voi.'),
         ]),
    dict(n=6, nome='LA CARTA DI PREGIO', voce_mappa='La Carta di Pregio',
         req='Il richiamo alla carta di pregio si apre a chi ricollega la firma di C.B. alla penna '
             'del presidente: l’inchiostro del presidente sul giglio spezzato.',
         chiave=('parola', 'L’INCHIOSTRO DEL PRESIDENTE'), art='La Carta di Pregio.png',
         chiude=None,
         indizi=[
             'Il richiamo all’Ep. 13: la carta col giglio spezzato, l’inchiostro ferro-gallico. '
             'Confrontata con la penna d’archivio del presidente, la mano è la stessa. '
             '<i>(incrocio D1: con l’Archivio delle Penne, DOVE firma C.B. è provato.)</i>',
             'La filigrana col giglio, tagliata su misura per una penna sola, esce dalla stessa '
             'carrozza che serve il Palazzo. Il filo dell’Ep. 13 si chiude qui: la carta di C.B. e '
             'la carta della Società sono la stessa risma.',
             'Un vecchio membro ricorda: «il presidente ha sempre insistito per la carta di pregio '
             '"per il decoro della Società". Nessuno ha mai chiesto perché il decoro avesse bisogno '
             'della stessa identica carta di C.B. Nessuno osava.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il giglio del presidente',
                  testo='La carta col giglio spezzato dell’Ep. 13, l’inchiostro ferro-gallico, la '
                        'penna d’archivio del presidente: tre fili che, incrociati, danno una sola '
                        'risposta alla Domanda 1. C.B. non firma da nessun luogo segreto: firma dal '
                        'Palazzo del Lume, con la penna del presidente, sulla carta della Società. '
                        'Il nascondiglio migliore è sempre stato il più esposto: la sedia da cui vi '
                        'guardava indagare.'),
         ]),
    dict(n=7, nome='LA MATRICE DEL DECANO', voce_mappa='La Matrice del Decano',
         req='La matrice del decano si applica solo a chi porta gli incroci: la carrozza condivisa '
             'dei due mondi di M.',
         chiave=('parola', 'LA CARROZZA CONDIVISA'), art='La Matrice del Decano.png',
         chiude=None,
         indizi=[
             'Il richiamo all’Ep. 17: la matrice delle doppie letture, applicata a tutte le lettere. '
             'Ogni volta che M. sapeva troppo, la matrice segna la data e la fonte: sempre lui. '
             '<i>(incrocio D3: con il Vezzo delle Firme, COSA muove C.B. è provato.)</i>',
             'La matrice incrocia la carrozza dei noli: la stessa che porta la carta di C.B. e serve '
             'il Palazzo del Lume, alla stessa ora, dallo stesso cortile. Una sola logistica per due '
             'maschere. Il decano è morto per questa riga; ora la riga parla.',
             'Applicata all’ultima lettera — quella di stanotte — la matrice restituisce la firma '
             'più chiara di tutte: «chi ha sempre saputo un passo più di voi?» Non era una domanda. '
             'Era una confessione travestita da sfida.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La logistica di una mano sola',
                  testo='La matrice del decano, incrociata con la carrozza dei noli, chiude la '
                        'Domanda 3: una sola carrozza, una sola ora, un solo cortile — quello del '
                        'Palazzo — servono due maschere che fingono di non conoscersi. C.B. non ha '
                        'una logistica sua: usa quella della Società, perché sono la stessa impresa. '
                        'Il decano l’aveva capito, e per questo è stato preso. La sua matrice, ora, '
                        'trasforma diciotto mesi di riletture in una sola, incontestabile deduzione.'),
         ]),
    dict(n=8, nome='IL VEZZO DELLE FIRME', voce_mappa='Il Vezzo delle Firme',
         req='Il confronto delle firme si apre a chi porta gli incroci: la carrozza condivisa che '
             'lega i due nomi di un uomo solo.',
         chiave=('parola', 'LA CARROZZA CONDIVISA'), art='Il Vezzo delle Firme.png',
         chiude=None,
         indizi=[
             'Le due firme a confronto, ingrandite: «M.» e «C.B.». Lo stesso allungo, la stessa '
             'esitazione, lo stesso tremito impercettibile prima della maiuscola. '
             '<i>(Reperto C: le Due Firme a Confronto.)</i> Il vezzo morelliano non mente: una mano '
             'sola.',
             '«M.» sta per Machiavelli — «il Machiavelli italiano», il soprannome che si è dato. '
             '«C.B.» sta per Camillo Benso. Il cospiratore e il contabile, le due maschere che «hanno '
             'fatto l’Italia». <i>(incrocio D3.)</i> Un uomo che si crede l’Italia intera.',
             'Non c’è più niente da provare: c’è solo un nome da pronunciare. E quando lo pronuncerete '
             'in assemblea, l’uomo che vi ha guidati per diciotto mesi non negherà. Vi guarderà con '
             'orgoglio, e spegnerà la prima lampada.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il Machiavelli e il contabile',
                  testo='«M.» e «C.B.» non sono due uomini: sono le due maschere di uno solo — il '
                        'Machiavelli e Camillo Benso, il cospiratore e il contabile, «quelli che '
                        'hanno fatto l’Italia in due». M. non si crede un criminale: si crede un padre '
                        'della patria, che rifà la storia con le stesse mani della prima volta. Ed è '
                        'questo a renderlo imprendibile stanotte: un uomo che si crede l’Italia intera '
                        'non fugge per paura. Si ritira, con calma, per continuare l’opera. Voi avete '
                        'il suo volto; lui ha ancora il suo Dormiente.'),
         ]),
    dict(n=9, nome='IL PALAZZO DEL LUME (LA FUGA)', voce_mappa='Il Palazzo del Lume (la fuga)',
         req='Il Palazzo del Lume, casa vostra, si rivolta in dungeon solo quando avete pronunciato '
             'il nome: una mano sola lo ha sempre governato, e ora lo spegne.',
         chiave=('parola', 'UNA MANO SOLA'), art='Il Palazzo del Lume (fuga).png',
         chiude=None,
         indizi=[
             'Il Palazzo del Lume, la vostra sede da diciotto mesi, diventa un labirinto ostile: M. '
             'fugge spegnendo le luci stanza per stanza, porte che si chiudono da sole, passaggi che '
             'non sapevate esistessero. <i>(Reperto B: la Piantina del Palazzo — i passaggi segreti '
             'di M.)</i>',
             'Il maggiordomo Anselmo — l’uomo che vi ha aperto la porta, servito il tè, annunciato le '
             'lettere per diciotto mesi — vi si rivolta contro: era la Guardia del Presidente da '
             'sempre. Il tradimento più personale.',
             'Fuori, i fischietti dei gendarmi: M. ha girato le accuse su di voi, e la rete si chiude. '
             'Non inseguite M. (sfugge): uscite dal Palazzo con la prova, prima di finire in cella '
             'per i crimini di chi vi ha guidati.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La casa che si spegne',
                  testo='La vostra casa, stanotte, vi si volta contro: le sue luci si spengono a una '
                        'a una sotto la mano che l’ha sempre governata, e i suoi corridoi — che '
                        'credevate di conoscere — nascondono passaggi che erano solo di M. Non è più '
                        'una spedizione: è una fuga. Il cacciatore è diventato preda, in casa propria, '
                        'tradito da chi gli apriva la porta. Portate fuori la prova, e sopravvivete '
                        'all’accusa: perché domani, con la firma doppia in mano, sarete voi a dare la '
                        'caccia — e M., per la prima volta in diciotto mesi, dovrà scappare.'),
         ]),
]

# Tessere del Palazzo del Lume, la fuga (percorso lineare a 6). Obiettivo =
# uscire (T6) con la PROVA prima dell'arresto (soglia-Canto). Boss: la Guardia
# del Presidente (il maggiordomo). M. appare in T4 e sfugge (Atto IV).
TILES_18 = [
    dict(id='T1', nome='LA SALA DELL’ASSEMBLEA', exits={'N': 'T2'}, start='S',
         testo='La sala dell’assemblea della Società: avete appena pronunciato il nome. M., in '
               'piedi al suo posto, non nega — spiega, con orgoglio, e spegne la prima lampada. '
               'QUANDO RIVELATE QUESTA TESSERA: applicate l’esito delle Domande 3 e 4. Con gli '
               'Incroci di Campagna forti, alcuni confratelli vi credono e coprono la fuga.',
         arbitro='Nessun combattimento ancora: qui M. parla e comincia lo spegnimento. Se avete gli '
                 'Incroci forti (prova pubblica), la Società è dalla vostra parte: 1 evento-favore '
                 'garantito. Da qui in poi non inseguite M.: fuggite.',
         hook='Gli Incroci di Campagna (dal Fascicolo): la prova è pubblica — la Società vi crede e '
              'i confratelli coprono la vostra ritirata.',
         cerca_vuoto='M. parla ancora, la voce calma, mentre le luci si spengono. Non ascoltatelo: '
                     'guardate le uscite, perché tra poco saranno chiuse.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL CORRIDOIO DEI RITRATTI', exits={'S': 'T1', 'N': 'T3'},
         testo='Il corridoio dei ritratti dei presidenti passati: le luci si spengono una a una '
               'alle vostre spalle. QUANDO RIVELATE QUESTA TESSERA: i primi gendarmi entrano dal '
               'cortile, convinti di arrestare dei colpevoli — voi.',
         arbitro='I gendarmi (Sgherri) sono in buona fede: non vogliono uccidervi, vogliono '
                 'catturarvi. Superateli o evitateli. Da qui le carte crescendo spingono la soglia-'
                 'arresto: quando i gendarmi sigillano, ogni round rischia la cattura di un eroe.',
         cerca_vuoto='I ritratti dei presidenti vi guardano dal buio: e l’ultimo, quello di M., '
                     'sorride come non avevate mai notato. Proseguite.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA BIBLIOTECA', exits={'S': 'T2', 'N': 'T4'},
         testo='La biblioteca della Società, dove un intero scaffale ruota su un passaggio segreto '
               'che non conoscevate. QUANDO RIVELATE QUESTA TESSERA: il maggiordomo Anselmo comincia '
               'a ostacolarvi, chiudendo porte e indicando ai gendarmi dove siete.',
         arbitro='Il maggiordomo (boss) comincia a manifestarsi: non ancora in mischia, ma vi toglie '
                 'le scorciatoie (le carte "il maggiordomo sa dove siete" hanno più morso). Il '
                 'passaggio segreto è la via di M., non la vostra: non seguitelo.',
         cerca='In un cassetto della biblioteca, una lanterna cieca (utile: al buio del Palazzo, '
               'chi la porta non è indicato dal maggiordomo per un round).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='LO STUDIO PRIVATO DI M.', exits={'S': 'T3', 'N': 'T5'},
         testo='Lo studio privato del presidente, dove non eravate mai entrati. QUANDO RIVELATE '
               'QUESTA TESSERA: M. è qui un istante — prende una cosa sola (che rivedrete nell’Atto '
               'IV), vi guarda, e sparisce nel muro. Il maggiordomo vi si rivolta contro apertamente.',
         arbitro='M. NON si affronta e NON si cattura: appare, prende una cosa, sparisce nel '
                 'passaggio. Inseguirlo = perdersi nel Palazzo mentre la rete si chiude (round '
                 'perso, soglia-arresto avanza). Da qui il maggiordomo (boss) è in mischia aperta.',
         hook='Il Vezzo delle Firme / la Firma Doppia: mostrarla al maggiordomo gli ricorda chi ha '
              'servito davvero — «una mano sola» (D4): salta un attacco.',
         cerca_vuoto='Il ritratto del Machiavelli e lo specchio si fronteggiano nel buio. M. non '
                     'c’è più: c’è solo il posto vuoto da cui vi ha guardati per diciotto mesi.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LA SCALINATA', exits={'S': 'T4', 'N': 'T6'},
         testo='La grande scalinata del Palazzo: i gendarmi salgono dal basso, il maggiordomo fa '
               'muro in cima. QUANDO RIVELATE QUESTA TESSERA: ultimo diaframma prima dell’uscita; '
               'se la rete è chiusa, ogni gradino è un rischio d’arresto.',
         arbitro='La Guardia del Presidente (il maggiordomo, boss) fa muro sulla scalinata: va '
                 'superata/abbattuta per raggiungere l’uscita. I gendarmi premono dal basso. Se la '
                 'soglia-arresto è superata, un eroe per round rischia la cattura.',
         cerca_vuoto='In cima alla scalinata, il maggiordomo Anselmo vi sbarra la strada con le '
                     'lacrime agli occhi: «mi dispiace, signori. Ho sempre servito il presidente.» '
                     'E anche lui, in fondo, è stato ingannato.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='L’USCITA', exits={'S': 'T5'},
         testo='La porta di casa vostra, che non è più casa vostra: il portone principale, o '
               'l’uscita di servizio che il maggiordomo non ha bloccato. QUANDO RIVELATE QUESTA '
               'TESSERA: uscite con la PROVA prima che la rete si chiuda del tutto.',
         arbitro='OBIETTIVO. Uscire dal Palazzo con la prova (il Vezzo delle Firme + gli Incroci). '
                 'Con la prova FORTE (incroci pieni) = il mondo saprà, M. è latitante (vittoria '
                 'piena). Con la prova debole, o con eroi arrestati = ve la cavate, ma braccati '
                 '(vittoria parziale). L’Uscita di Servizio salta l’ultimo giro dei gendarmi.',
         cerca_vuoto='Sulla soglia, vi voltate a guardare la vostra casa che si spegne finestra '
                     'dopo finestra. Da qualche parte, nel buio, il presidente si ritira. Non '
                     'l’avete preso. L’avete smascherato. Uscite: comincia la caccia vera.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_18 = [
    dict(nome='LA GUARDIA DEL PRESIDENTE', att=3, dif=8, fer=7, mov=3, dan=2, boss=True,
         tipo='Il Maggiordomo Traditore (Boss)', art='La Guardia del Presidente.png',
         note='Il maggiordomo Anselmo, che vi ha aperto la porta per diciotto mesi. Nessuna '
              'debolezza-oggetto. «Una mano sola» (D4 esatta): dirgli che ha servito un uomo che si '
              'dava la caccia da sé lo fa vacillare — salta un attacco. È l’ultimo muro tra voi e la '
              'porta. Ai tavoli da 2-3 eroi non recupera mai Ferite (regola delle taglie).',
         bio_bestiario='Anselmo, il maggiordomo della Società del Lume, è l’uomo che per diciotto '
              'mesi vi ha aperto la porta, servito il tè, annunciato le lettere del presidente con un '
              'inchino. Era la Guardia del Presidente da sempre: non un sicario, un servitore fedele '
              'fino al tradimento, che stanotte vi sbarra la strada con le lacrime agli occhi perché '
              'non sa fare altro che obbedire. Robusto e disperato (Fer 7, Danno 2), difende la casa '
              'e il padrone col corpo, ma è il più umano dei nemici: quando gli dite in faccia che ha '
              'servito un uomo che si dava la caccia da sé — che anche lui è stato ingannato — '
              'qualcosa in lui cede, e per un istante non alza la mano. Ai tavoli da 2-3 eroi non '
              'recupera mai ferite (regola delle taglie). Batterlo non è una vittoria: è l’ultima, '
              'triste conferma che nella casa del Lume nessuno era ciò che sembrava — tranne voi.'),
    dict(nome='M. (IL PRESIDENTE)', att=1, dif=9, fer=99, mov=5, dan=0, boss=False,
         tipo='C.B. — la mano sola (non si affronta, non si cattura)', art='Il Presidente M.png',
         note='NON si affronta e NON si cattura. Appare in T4, prende una cosa sola (Atto IV), '
              'spiega e sparisce nel passaggio segreto. Inseguirlo = perdersi nel Palazzo mentre la '
              'rete si chiude (round perso). È l’Atto IV: stanotte lo smascherate, non lo prendete.',
         bio_bestiario='M. — il presidente della Società del Lume, e C.B.: Camillo Benso e il '
              'Machiavelli, due maschere rivali e una mano sola. Per diciotto mesi vi ha mandati a '
              'caccia di se stesso, muovendo entrambi i lati del tavolo, restando sempre un passo '
              'avanti perché il passo lo dettava lui. Non lo fa per denaro né per potere spiccioli: '
              'crede di rifare l’Italia, di essere lui — da solo — il cospiratore e il contabile che '
              '«la fecero in due», qualcosa di più grande con le stesse mani. Smascherato, non nega: '
              'spiega, con l’orgoglio di chi finalmente può dirlo, e poi rovescia il tavolo — le '
              'accuse su di voi, i gendarmi alle porte, e lui che si ritira per il Palazzo che '
              'conosce meglio di chiunque. NON si affronta e NON si cattura: la partita finale è sua '
              'finché il Dormiente dorme. Stanotte gli avete tolto la maschera. Nell’Atto IV, gli '
              'toglierete la mano.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 18 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 18')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la mano sola')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_18.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Stanotte non ci sono luoghi nuovi: ci sono i fili da chiudere. Le 4 Domande sono una sola — CHI È C.B.?')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: l’Assemblea, l’Archivio delle Penne, la Contabilità, il Fascicolo di Campagna.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 18')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — 6 ore. Portate gli INCROCI DI CAMPAGNA (bivi, verbali, riletture Ep.16, matrice Ep.17).')
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

    yy = sect(H - 52*mm, 'gli incroci di campagna raccolti (bivi, verbali, riletture, matrice)', 4)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — un volto da quattro lati: CHI È C.B.?')
    doms = ['1. DOVE firma C.B.? (l’inchiostro del presidente — serve più di una conferma)',
            '2. CHI paga C.B.? (l’oro d’una cassa sola)',
            '3. COSA muove C.B.? (la carrozza condivisa — serve più di una conferma)',
            '4. CHI È C.B.? (il vezzo delle firme: la rivelazione)']
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
    c.setTitle('Ombre su Roccamora - Episodio 18 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 18 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'il Palazzo del Lume, la fuga da casa vostra')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '18/cards/</b>). Le 6 tessere del Palazzo sono in <b>Episodio 18/board/</b>. La '
                  'caccia si rovescia: smascherato, M. spegne le luci e <b>fugge</b>, il maggiordomo '
                  'vi tradisce, i gendarmi vengono per VOI. NON inseguite M. (sfugge, è l’Atto IV): '
                  '<b>fuggite VOI</b> dal Palazzo (T6) con la <b>prova</b> (il Vezzo delle Firme + '
                  'gli Incroci), prima che i gendarmi vi arrestino (soglia-arresto). Le pagine '
                  'seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>I GENDARMI (soglia-arresto).</b> M. ha girato le accuse su di voi. Quando il '
                  'Canto raggiunge la <b>soglia-arresto</b>, i gendarmi sigillano le uscite: da quel '
                  'round, ogni round nel Palazzo un eroe rischia l’<b>arresto</b> (fuori scena). '
                  'L’<b>Uscita di Servizio</b> alza la soglia (una via che non sorvegliano).', BODY),
        Paragraph('• <b>LA PROVA (la piena).</b> Dovete uscire (T6) con la prova che C.B. è M. Più '
                  '<b>Incroci di Campagna</b> avete (bivi, verbali, riletture, matrice), più la prova '
                  'è pubblica: uscirne con la <b>prova forte</b> = il mondo saprà, M. è latitante '
                  '(vittoria piena). Prova debole = ve la cavate, ma braccati (parziale).', BODY),
        Paragraph('• <b>M. NON SI PRENDE.</b> Appare in T4, prende una cosa e sparisce nel muro: è '
                  'l’Atto IV. Inseguirlo = perdersi mentre la rete si chiude. Il boss è il '
                  '<b>maggiordomo</b> (la Guardia del Presidente, Danno 2), l’ultimo muro prima della '
                  'porta. «Una mano sola» (D4): gli fa saltare un attacco. I gendarmi sono in buona '
                  'fede (vi vogliono in cella, non morti): la posta è l’<b>arresto</b>, non la morte.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_18:
        art_file = TILE_ART_18[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_18[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_18.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 18</b>. In campo: i <b>gendarmi</b> '
                  '(Sgherri: uomini in buona fede che credono di arrestare dei colpevoli — voi), '
                  '<b>la Guardia del Presidente</b> (il boss: il maggiordomo traditore, Danno 2) e '
                  '<b>M.</b> (il presidente, C.B.: appare in T4 e sfugge — NON si affronta, NON si '
                  'cattura). Nessun mostro: il pericolo è la <b>rete che si chiude</b> e la casa che '
                  'vi si volta contro. Vittoria: fuggire con la prova. Ai tavoli da 2-3 eroi la '
                  'Guardia <b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_18())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_18():
    """Miniature dell'Episodio 18. I segnalini Canto sono qui la RETE dei
    gendarmi che si chiude (verso la soglia-arresto)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('GENDARMI (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('LA GUARDIA DEL PRESIDENTE · M.', [('La Guardia del Presidente.png', 1),
                                            ('Il Presidente M.png', 1)]),
        ('LA RETE (CANTO)', [('Fischietti nel cortile.png', 1),
                             ('I gendarmi ai piani.png', 1),
                             ('Le uscite si sigillano.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 18 - Soluzione (non aprire)')

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
        '<b>Il caso.</b> Non c’è un nuovo delitto: c’è la deduzione finale. Le 4 Domande sono una '
        'sola — CHI È C.B.? — e si rispondono con gli incroci di tutta la campagna.',
        '<b>La verità.</b> C.B. è M.: «C.B.» = Camillo Benso, «M.» = il Machiavelli. Due maschere '
        'rivali, una mano sola. Il presidente si è dato la caccia da sé per anni, muovendo entrambi '
        'i lati del tavolo. Smascherato, non nega: spiega, rovescia il tavolo (accusa VOI), e sfugge '
        'per il Palazzo. Sventare = provare che C.B. è M. e fuggire dal Palazzo con la prova prima '
        'dell’arresto. M. NON si cattura: è l’Atto IV.',
    ])
    pagina('le 4 domande — un volto da quattro lati', [
        '<b>1. DOVE firma C.B.?</b> Sulla carta di pregio, con l’inchiostro ferro-gallico della '
        'penna d’archivio del presidente (l’Archivio delle Penne L2 + la Carta di Pregio L6: serve '
        'più di una conferma). <i>Esatta:</i> la prova materiale regge — nel 1° round della '
        'spedizione non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> 1 gendarme appare in T1.',
        '<b>2. CHI paga C.B.?</b> Con l’oro d’antica fusione, dalla stessa cassa della Società (la '
        'Società riunita L1 + la Contabilità L3 + il Fascicolo L4). <i>Esatta:</i> la prova '
        'contabile è pubblica: la Società vi crede. <i>Sbagliata:</i> nessun effetto meccanico.',
        '<b>3. COSA muove C.B.?</b> La carrozza condivisa dei noli, una sola logistica per due '
        'maschere (la matrice del decano L7 + il vezzo delle firme L8: serve più di una conferma). '
        '<i>Esatta («una mano sola»):</i> al maggiordomo (T4/T5), dirgli che ha servito un uomo che '
        'si dava la caccia da sé gli fa saltare un attacco. <i>Sbagliata:</i> nessun effetto.',
        '<b>4. CHI È C.B.?</b> M. Il vezzo delle firme lo prova: «M.» = il Machiavelli, «C.B.» = '
        'Camillo Benso, due maschere di un uomo solo. <i>La rivelazione:</i> non dà un vantaggio '
        'meccanico — dà il volto del mostro. Aiuti spedizione: gli Incroci di Campagna (prova forte), '
        'l’Uscita di Servizio (L9). <i>Esche:</i> l’Accusa contro di Voi, il Ritratto del Rivale.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «La '
        'Società riunita» (L1), il Referto «L’oro d’una cassa sola» (L3) e l’Osservazione «Gli '
        'incroci di diciotto mesi» (L4). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Gli INCROCI DI CAMPAGNA:</b> la vera arma. Contate gli incroci raccolti in diciotto mesi '
        '(bivi decisi, verbali sigillati, riletture dell’Ep. 16, matrice dell’Ep. 17). Più ne avete, '
        'più la prova è forte in spedizione (la piena). <b>Vantaggio d’Indagine:</b> come sempre.',
    ])
    pagina('spedizione — la fuga da casa vostra', [
        '<b>Montaggio</b> (tessere in Episodio 18/board/, coperte tranne T1):<br/>'
        'T1 La Sala dell’Assemblea (partenza, da Sud) → T2 Il Corridoio dei Ritratti → T3 La '
        'Biblioteca → T4 Lo Studio Privato di M. (M. appare e sfugge) → T5 La Scalinata (la Guardia) '
        '→ T6 L’Uscita. Con l’Uscita di Servizio si salta l’ultimo giro dei gendarmi.',
        '<b>La soglia-arresto.</b> Segnate il Canto come al solito. Alla <b>soglia-arresto = Canto '
        '4</b> (5 con l’Uscita di Servizio), i gendarmi sigillano le uscite: da quel round, ogni '
        'round un eroe rischia l’arresto (prova NERVI o «catturato», fuori scena fino a fine '
        'spedizione). Le carte crescendo (fischietti/gendarmi ai piani) accelerano.',
        '<b>M. e il maggiordomo.</b> M. NON si affronta: appare in T4, prende una cosa, sparisce nel '
        'passaggio segreto (Atto IV). Inseguirlo = round perso, soglia avanza. La Guardia del '
        'Presidente (il maggiordomo, boss): Att +3, Dif 8, Fer 7, Danno 2, sulla scalinata (T5). «Una '
        'mano sola» (D4): salta un attacco. I gendarmi (Sgherri) vogliono catturarvi, non uccidervi.',
        '<b>Vittoria.</b> Uscire dal Palazzo (T6) con la prova: con la <b>prova forte</b> (incroci '
        'pieni, tutti gli eroi liberi) = il mondo saprà, M. è latitante (<b>vittoria piena</b>). Con '
        'la prova debole, o con eroi arrestati = ve la cavate ma braccati (<b>vittoria parziale</b>: '
        'l’Atto IV comincia più soli). <b>Il mazzo:</b> 21 carte (7 gendarmi, 6 insidie casa-ostile, '
        '4 crescendo-arresto, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio (l’ultimo dell’atto)', [
        '<b>EPILOGO — da leggere se fuggite con la prova forte.</b> «Sulla soglia del Palazzo del '
        'Lume, mentre i fischietti dei gendarmi riempiono il cortile alle vostre spalle, vi fermate '
        'a guardare la vostra casa che si spegne finestra dopo finestra. Da qualche parte là dentro, '
        'nel buio dei suoi passaggi segreti, il vostro presidente si allontana — non in fuga, ma in '
        'ritirata. In mano avete la sua firma doppia: "M." e "C.B.", la stessa esitazione prima della '
        'maiuscola, la stessa mano. Il Machiavelli e il contabile. Diciotto mesi a dargli la caccia, '
        'e la caccia ve la dava lui. Ma ora la Società sa: il mostro ha un volto, ed è quello di chi '
        'ci ha guidati. Non l’avete preso. L’avete smascherato. E un uomo smascherato, per la prima '
        'volta, deve scappare lui.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 18:</b> <i>«Si firma M. — Machiavelli. Si firma C.B. — Camillo '
        'Benso. Due maschere rivali, una mano sola: un uomo che si crede l’Italia intera.»</i> '
        'Conservatelo: è la chiave dell’Atto IV.',
        '<b>IL BIVIO — l’ultimo dell’atto; decidete insieme, poi sigillate.</b><br/>'
        '<b>Rendere pubblica la prova subito.</b> La città sa, M. è latitante e braccato (l’Atto IV '
        'comincia con la Società accusatrice e i PNG amici schierati), ma M., all’angolo, accelera '
        'il Quarto Movimento (l’Ep. 20 parte col Dormiente più vicino a svegliarsi).<br/>'
        '<b>Tenere la prova e colpire nell’ombra.</b> Giocate come lui, di nascosto (margine di '
        'manovra nell’Ep. 19), ma senza il clamore siete più soli (un PNG amico in meno).<br/>'
        'Scrivete la scelta sul retro del Frammento n. 18.',
        '<b>AGGANCIO — ATTO IV.</b> All’alba, un manifesto in ogni piazza. Ma non è la faccia di M.: '
        'è la vostra. «RICERCATI: la Società del Lume, per i crimini di C.B.» M. ha rovesciato il '
        'tavolo per intero. L’Atto IV comincia con voi braccati, senza sede, coi PNG amici di '
        'diciotto episodi come unica rete.',
        '<b>CHECKPOINT D’ATTO:</b> qui si chiude l’Atto III. Prima di aprire l’Atto IV (Ep. 19-20, '
        '«Il Quarto Movimento»), fermatevi: rileggete i vostri Frammenti 1-18, contate gli incroci, '
        'e preparatevi. La caccia, finalmente, è vostra.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI18_DESC = {
    1: "L'assemblea della Società riunita, nella forma scelta dall'Ep. 17: il "
       "processo interno, o la trappola della firma. Sul tavolo, diciotto mesi "
       "di indizi da mettere in fila. Basta il coraggio di pronunciare il nome "
       "che avete avuto sotto gli occhi da sempre.",
    2: "L'archivio delle penne della Società: calamai, pennini, l'inchiostro "
       "ferro-gallico. La penna d'archivio del presidente scrive con lo stesso "
       "inchiostro di ogni firma di C.B., e «M.» e «C.B.» hanno lo stesso vezzo. "
       "Una mano sola, un calamaio solo.",
    3: "La contabilità della Società: il libro mastro, l'oro d'antica fusione "
       "che paga i lavori di C.B. e finanzia la confraternita, senza mai un "
       "conflitto. Due imprese rivali si contendono l'oro; queste se lo "
       "spartiscono come un uomo si sposta la borsa di tasca.",
    4: "Il vostro fascicolo di diciotto mesi: verbali, bivi, riletture dell'Ep. "
       "16, la matrice del decano. La vera arma stanotte — non un indizio, ma "
       "diciotto mesi di indizi che si tengono per mano, e che presi insieme "
       "danno il volto del presidente.",
    5: "Lo studio privato del presidente, dove non siete mai entrati in diciotto "
       "mesi: alle pareti, il ritratto del Machiavelli e, di fronte, uno "
       "specchio. Le due maschere si guardano. Qui M. era C.B. e C.B. era M., "
       "ogni notte, da solo.",
    6: "Il richiamo alla carta di pregio (Ep. 13): il giglio spezzato, "
       "l'inchiostro ferro-gallico. Confrontata con la penna del presidente, la "
       "mano è la stessa. Il nascondiglio migliore è sempre stato il più "
       "esposto: la sedia da cui vi guardava indagare.",
    7: "Il richiamo alla matrice del decano (Ep. 17): le doppie letture "
       "applicate a tutte le lettere, e la carrozza condivisa dei noli. Il "
       "decano è morto per questa riga; ora la riga parla, e chiude la Domanda "
       "sulla logistica di una mano sola.",
    8: "Il confronto delle firme: «M.» e «C.B.» ingrandite, lo stesso allungo, "
       "la stessa esitazione prima della maiuscola. Il Machiavelli e Camillo "
       "Benso, le due maschere che «hanno fatto l'Italia in due». Non c'è più "
       "niente da provare: c'è un nome da pronunciare.",
    9: "Il Palazzo del Lume, casa vostra da diciotto mesi, che si rivolta in "
       "labirinto: le luci si spengono, le porte si chiudono, i passaggi segreti "
       "di M. si aprono. Il maggiordomo vi tradisce, i gendarmi vengono per voi. "
       "Non inseguite: fuggite, con la prova.",
}

OGGETTI_LUOGO_18 = {
    8: ['Il Vezzo delle Firme'],
    4: ['Gli Incroci di Campagna'],
    9: ['L’Uscita di Servizio'],
    1: ['L’Accusa Pronta contro di Voi'],
    5: ['Il Ritratto del Rivale'],
}

TILE_ART_18 = {t['id']: t['id'] + '-ep18.png' for t in TILES_18}
LUOGHI18_CROP = {}

TESSERE_DESC_18 = {
    'T1': "La grande sala dell'assemblea della Società, i confratelli seduti a "
          "semicerchio, il tavolo delle prove al centro. Avete appena "
          "pronunciato il nome. M., in piedi al suo posto d'onore, non nega: "
          "sorride, comincia a parlare, e spegne con calma la prima lampada.",
    'T2': "Il lungo corridoio dei ritratti dei presidenti passati, le cornici "
          "dorate nel buio crescente: una lampada dopo l'altra si spegne alle "
          "vostre spalle, come una mano che chiude un libro. In fondo, i primi "
          "elmi dei gendarmi che salgono dal cortile.",
    'T3': "La biblioteca della Società, scaffali fino al soffitto: e uno di "
          "essi, adesso lo vedete, ruota su un cardine nascosto — un passaggio "
          "segreto che in diciotto mesi non avete mai sospettato. È la via di "
          "M., non la vostra. Il maggiordomo, in ombra, chiude le porte.",
    'T4': "Lo studio privato del presidente, in cui non eravate mai entrati: il "
          "ritratto del Machiavelli e lo specchio che si fronteggiano. M. è qui "
          "un istante — prende dallo scrittoio una cosa sola, vi guarda con una "
          "specie di affetto, e sparisce nel muro. Il maggiordomo si rivela.",
    'T5': "La grande scalinata di marmo del Palazzo: i gendarmi salgono dal "
          "basso a ondate, e in cima, che vi sbarra la strada con le lacrime "
          "agli occhi, il maggiordomo Anselmo. «Mi dispiace, signori. Ho sempre "
          "servito il presidente.» L'ultimo muro prima della porta.",
    'T6': "La porta di casa vostra, che non è più casa vostra: il portone "
          "principale sorvegliato, o l'uscita di servizio nel buio. Oltre, la "
          "città e la notte. Uscite con la prova in mano, e voltatevi un'ultima "
          "volta a guardare il Palazzo del Lume che si spegne.",
}

ESAMI_CARBONE_18 = {
    'LA FIRMA DOPPIA': '«"M." e "C.B.", scritte a anni di distanza da mani che si fingono nemiche, '
                'hanno lo stesso vezzo: lo stesso allungo sulla coda, la stessa esitazione prima '
                'della maiuscola. Un falsario imita una firma; nessuno imita <i>due</i> firme rivali '
                'con lo stesso identico tic, se non l’unico uomo che le scrive entrambe.»',
    'GLI INCROCI DI CAMPAGNA': '«Messi in fila, diciotto mesi di indizi non raccontano diciotto '
                'casi: raccontano un uomo solo che, da presidente, vi mandava a caccia di se stesso '
                'da C.B., restando sempre un passo avanti perché il passo lo dettava lui. Ogni volta '
                'che M. sapeva troppo, non era genio: era memoria.»',
    'IL VEZZO DELLE FIRME': '«Il Machiavelli e il contabile, le due maschere che "hanno fatto '
                'l’Italia": M. non si crede un criminale, si crede un padre della patria. Ed è '
                'questo a renderlo imprendibile stanotte — un uomo che si crede l’Italia intera non '
                'fugge per paura, si ritira per continuare l’opera.»',
}

OGGETTI_TESSERA_18 = {'T3': ['Una Lanterna Cieca']}


def luoghi():
    """Luoghi.pdf Episodio 18 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 18 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_18, 'Episodio 18')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_18.get(n, [])]

    for L in LUOGHI_18:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI18_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI18_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_18)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_18
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LA GUARDIA DEL PRESIDENTE', 'M. (IL PRESIDENTE)', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 18')
    print('OK episodio 18')
