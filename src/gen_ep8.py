# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 8: L'oro vecchio (Episodio 8/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-8.md e CAMPAGNA-EPISODI.md).
Standalone di Malavita: i clan ricomprati in marenghi del 1741, la Vedova
Bruna, il Cambiavalute all'ansa morta. Un solo seme C.B./M.: i sigilli
demaniali con la ceralacca fresca.

Varietà strutturale (regola 2026-07-18): obiettivo non-boss (4 casse
d'oro da sequestrare, uscita da T6) + mazzo fuori standard (14/2/2/3);
il Cambiavalute è un difensore stanziale col crogiolo-orologio.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche
vivono in scripts/cardconjurer/cards-data.js, blocco EPISODIO 8).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 8', 'pdf')
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

LETTERA_8 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«I mercati stanno cambiando padrone senza un colpo di coltello: i clan minori passano "
    "uno alla volta sotto un’ala nuova, e nessuno sporge denuncia perché nessuno ha niente "
    "di cui lamentarsi. Il signor <b>Fossa</b> del Banco dei Pegni ha qualcosa da "
    "mostrarvi: sette marenghi d’oro, tutti dell’ultimo mese, tutti di una lega che non "
    "gira da cinquant’anni. Qualcuno sta COMPRANDO la Malavita di questa città — in "
    "contanti, e in contanti molto vecchi.<br/><br/>"
    "Quando la Malavita smette di sparare, è perché qualcuno paga meglio di quanto un "
    "coltello costi. Trovate la cassa. E contate PRIMA di toccare. Avete <b>6 ore</b>, "
    "dalle 18:00 alle 24:00.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: l’Osteria della Bilancia, il Banco dei Pegni, la "
    "Taverna della Chiatta e il Monte di Pietà. Gli altri andranno sbloccati.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via:
# «l'oro vecchio» da L1 e L2, «la fusione antica» da L2 e L4,
# «l'ansa morta» da L3 e L1, «il carro del carbone» da L4 e L3, il Marengo
# Segnato da L2. Rivelatorio (Domanda 2) su L1, L2, L3 - tutti aperti.
LUOGHI_8 = [
    dict(n=1, nome='L’OSTERIA DELLA BILANCIA', voce_mappa='L’Osteria della Bilancia',
         req='Disponibile dall’inizio', art='Osteria della Bilancia.png',
         chiude=None,
         indizi=[
             'Il sensale dei banchi — che ieri ha «cambiato bandiera» col suo clan — beve '
             'da solo e parla volentieri: «nessuna minaccia, signori. Un uomo gentile, un '
             'prezzo giusto, e l’oro vecchio sul tavolo: marenghi che mio nonno chiamava '
             '“i soldi della confraternita”. Chi rifiuta un pagamento così?»',
             'La sala ha una geografia nuova: i tavoli dei clan minori si sono AVVICINATI. '
             'Bandiere che si odiavano da vent’anni bevono lo stesso vino. L’oste, piano: '
             '«si sono messi tutti sotto l’ala dell’ansa morta. Là dove le chiatte vanno a '
             'morire — e adesso, pare, a rinascere.»',
             'Un giovane del clan del pesce, ubriaco di promozione: «la paga passa per la '
             'vedova, dicono. LA vedova. Quella che secondo voi ricama e secondo noi '
             'conta. Ma io non ho detto niente, e voi non avete sentito.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il sensale dei banchi',
                  testo='«Il pagamento l’ho visto contare: marenghi con l’aquila vecchia, '
                        'mai un millesimo leggibile — i bordi molati di fresco, tutti. E chi '
                        'contava non era un gregario: era la Vedova Bruna in persona, coi '
                        'guanti da messa. Contava senza guardare le dita. Chi conta così '
                        'ha contato TANTO, nella vita.»'),
         ]),
    dict(n=2, nome='IL BANCO DEI PEGNI', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Fossa allinea i sette marenghi sotto la lente: «lega del Settecento, conio '
             'del Settecento. Questa è la fusione antica delle zecche papaline — l’oro '
             'vecchio della confraternita, se date retta alle leggende. E le leggende, '
             'ultimamente, pagano la protezione di mezza città.»',
             'Su ogni marengo, lo stesso dettaglio: il bordo MOLATO di fresco, dove '
             'starebbe il millesimo. «Qualcuno cancella la data prima di spendere. L’oro '
             'che si vergogna della propria data ha sempre una bella storia dietro.»',
             'Fossa sceglie il marengo migliore e vi incide una tacca da banco, quasi '
             'invisibile: «un corriere che porta un marengo così non lo ferma nessuno, '
             'all’ansa morta. Riportatemelo, se potete. E se non potete, spendetelo BENE.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La lente di Fossa',
                  testo='Sotto la lente, tra le molature, un residuo nero nelle zigrinature: '
                        'polvere di carbone da forgia. L’oro non viene speso com’è: viene '
                        'RIFUSO, vicino a molto carbone — e il carbone da crogiolo, in una '
                        'città senza fonderie attive, si compra solo in un posto. Chiedete '
                        'ai carrettieri.'),
         ]),
    dict(n=3, nome='LA TAVERNA DELLA CHIATTA', voce_mappa='La Taverna della Chiatta',
         req='Disponibile dall’inizio', art='Taverna della Chiatta.png',
         chiude=None,
         indizi=[
             'La corte della Vedova tiene banco in fondo alla sala: si parla di noli, di '
             'pesce, di dazi — mai d’oro. Ma i barcaioli fanno la fila per UN tavolo, e da '
             'quel tavolo si esce o sorridendo o bianchi come il sale.',
             'Il registro dei noli, appeso al banco: da tre mesi, ogni giovedì notte, una '
             'chiatta «in disarmo» risulta noleggiata per l’ansa morta. Carico dichiarato: '
             '«carbone». Una chiatta da carbone che torna VUOTA e alta sull’acqua non ha '
             'portato carbone: ha portato peso piccolo e pesante. E il carico scende '
             'sempre insieme al CARRO DEL CARBONE, il giovedì.',
             'Un vecchio barcaiolo, per un litro: «all’ansa morta non si pesca più. C’è '
             'luce di notte sotto la tettoia grande — luce da fuoco, non da lanterna. E i '
             'cani. Cani grossi, signori, che non abbaiano: ASPETTANO.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il barcaiolo della Chiatta',
                  testo='«La Vedova è salita sulla mia barca una volta sola, per andare '
                        'all’ansa morta. Non ha aperto bocca per tutto il viaggio. Alla '
                        'banchina l’aspettava l’orefice — quello radiato, il Cambiavalute — '
                        'col bilancino sotto il braccio. Lei gli ha dato UNA busta. Lui '
                        's’è inchinato come si fa coi vescovi.»'),
         ]),
    dict(n=4, nome='IL MONTE DI PIETÀ', voce_mappa='Il Monte di Pietà',
         req='Disponibile dall’inizio', art='Monte di Pietà.png',
         chiude=None,
         indizi=[
             'Il registro dei riscatti è impazzito: famiglie che non riscattavano un pegno '
             'da dieci anni stanno riprendendo TUTTO — fedi, orologi, corredi — e pagano '
             'in oro vecchio. Il direttore: «la Malavita paga bene, di questi tempi. E i '
             'suoi stipendi finiscono qui, a ricomprare la dignità dei nonni.»',
             'Tra i pegni NON riscattati: la divisa da esattore demaniale di un vecchio '
             'impiegato, «quello dei sequestri». Il direttore: «viene ogni mese a pagare '
             'gli interessi, mai a riscattare. Abita alla salita dei Cappuccini. Se '
             'cercate l’oro vecchio, lui l’oro vecchio l’ha CONTATO, da giovane — e la '
             'fusione antica delle zecche la riconosce a colpo d’occhio.»',
             'Il carrettiere del carbone scarica sacchi anche qui, per le stufe: «il '
             'grosso però va al porto, il giovedì notte. Il carro del carbone, lo '
             'chiamano — ma da quando il carbone si scorta coi cani? Io scarico, incasso '
             'e non guardo. Guardare, di giovedì, non conviene.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il registro dei riscatti',
                  testo='I riscatti anomali dell’ultimo trimestre fanno una mappa: tutti i '
                        'quartieri dei clan minori, nessun quartiere dei clan grandi. Chi '
                        'paga sta comprando i PICCOLI — uno alla volta, casa per casa, come '
                        'si compra un isolato prima di costruirci sopra. Questo non è '
                        'racket: è un CONSOLIDAMENTO. E ha un progetto.'),
         ]),
    dict(n=5, nome='LA CARBONAIA DEL PORTO', voce_mappa='La Carbonaia del Porto',
         req='Il carbonaio non parla coi curiosi: «il carbone è carbone». Ma chi nomina il '
             'carico giusto — quello che viaggia di notte — scopre che il carbonaio ha una '
             'coscienza, e che pesa più dei sacchi.',
         chiave=('parola', 'IL CARRO DEL CARBONE'), art='Carbonaia del Porto.png',
         chiude=None,
         indizi=[
             'Le bolle del carbone, infilzate sul chiodo: carbone da FORGIA, il triplo del '
             'fabbisogno di un porto senza fonderie. Destinazione: «molo in disarmo, ansa '
             'morta, consegna giovedì notte».',
             'Il carbonaio, a voce bassa: «il giovedì il carro torna SCARICO ma pesante — '
             'le assi del fondo piegate come sotto il ferro. Io il carbone lo conosco: il '
             'carbone non piega le assi. L’oro sì.»',
             'In un angolo, casse di lanterne da sentina a vetro basso, «per il deposito»: '
             'luce da contrabbando, che non si vede dal fiume. Una è ancora imballata.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le bolle del carbone',
                  testo='Le firme di ricevuta sulle bolle del giovedì sono tutte della '
                        'stessa mano — una mano ELEGANTE, da scrivano, che si sforza di '
                        'sembrare rozza: le aste tremano dove non dovrebbero. Chi riceve il '
                        'carbone all’ansa morta sa scrivere molto meglio di quanto voglia '
                        'mostrare. Un orefice radiato, per esempio.'),
         ]),
    dict(n=6, nome='LA CASA DEL VECCHIO ESATTORE', voce_mappa='Casa dell’Esattore',
         req='L’esattore in pensione non apre: «i conti dello Stato sono chiusi». Ma chi '
             'nomina l’oro giusto — quello che lo Stato ha perso — trova un vecchio che '
             'aspetta da cinquant’anni di raccontare.',
         chiave=('parola', 'L’ORO VECCHIO'), art='Casa dell’Esattore.png',
         chiude=None,
         indizi=[
             'L’esattore tira fuori da sotto il letto la sua copia dell’inventario del '
             'sequestro: «casse ventidue, once quattromila, sigilli demaniali dall’uno al '
             'ventidue. Io le ho CONTATE, da praticante. Poi il deposito giudiziario bruciò, '
             'e le casse risultarono “disperse”. Disperse un corno: TRASLOCATE.»',
             'Il vecchio ricorda i sigilli: «la matrice demaniale del Quarantuno non fu '
             'mai distrutta. Passò d’ufficio, con l’archivio, di scrivania in scrivania. '
             'Chi la tiene oggi può sigillare — e DISSIGILLARE — qualunque cosa lo Stato '
             'abbia mai chiuso. Cercate all’Archivio, se vi lasciano entrare.»',
             'Sul comò, la fotografia di una squadra di giovani esattori davanti a un '
             'portone: «il deposito, l’anno prima dell’incendio. La fusione antica la '
             'riconosco a occhi chiusi: la pesavo a mani nude. Se quell’oro gira, non è '
             'stato TROVATO. È stato APERTO — da chi aveva la chiave.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='L’inventario dell’esattore',
                  testo='In fondo all’inventario, una nota a margine di mano diversa — più '
                        'recente, inchiostro moderno: «il deposito non esiste più. Le casse '
                        'nemmeno. Chiedere ai sigilli.» L’esattore giura di non averla '
                        'scritta lui. Qualcuno ha letto questa copia PRIMA di voi — e ha '
                        'lasciato un appunto da collega.'),
         ]),
    dict(n=7, nome='L’ARCHIVIO DEI SEQUESTRI', voce_mappa='L’Archivio Demaniale',
         req='L’archivista demaniale è un uomo prudente: «i fascicoli storici si aprono su '
             'istanza». Ma chi cita il sequestro giusto — con la sua lega e il suo anno — '
             'ottiene il faldone prima ancora di finire la frase.',
         chiave=('parola', 'LA FUSIONE ANTICA'), art='Archivio Demaniale.png',
         chiude=None,
         indizi=[
             'Il fascicolo del sequestro 1741 c’è tutto: verbali, inventario, e i SIGILLI '
             'demaniali in ceralacca sul faldone. Sigilli scaduti da un secolo — e la '
             'ceralacca di due di essi è FRESCA: lucida, elastica, di quest’anno.',
             'Il registro delle consultazioni del faldone: NESSUNA consultazione '
             'registrata da quarant’anni. Eppure la polvere sul faldone è smossa, e la '
             'ceralacca è nuova. Chi entra qui non passa dal registro — e non passa dal '
             'Comune.',
             'L’archivista, contando i faldoni con l’occhio: «le matrici dei sigilli '
             'demaniali non stanno qui. Seguono la carica, non l’archivio: passano '
             'd’ufficio a chi eredita la funzione. A CHI sia arrivata quella del '
             'Quarantuno, dopo cent’anni di riforme… servirebbe un genealogista dei '
             'ministeri.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La ceralacca fresca',
                  testo='Il sigillo è impresso con la matrice AUTENTICA: ogni dente, ogni '
                        'difetto del conio originale. Non è un falso: è un USO. Qualcuno '
                        'possiede ancora la matrice demaniale del 1741, la usa per aprire e '
                        'richiudere ciò che lo Stato credeva sepolto — e un’eredità così '
                        'non si ruba: si riceve, d’ufficio, in silenzio. Il tesoro non fu '
                        'perso. Fu CUSTODITO. (Il seme: conservatelo per la campagna.)'),
         ]),
    dict(n=8, nome='LA CORTE DELLA VEDOVA', voce_mappa='Villa della Vedova Bruna',
         req='La villa non riceve chi non è atteso. Ma chi arriva nominando l’ansa morta — '
             'ad alta voce, davanti al cancello — scopre di essere atteso da giorni.',
         chiave=('parola', 'L’ANSA MORTA'), art='Villa della Vedova.png',
         chiude=None,
         indizi=[
             'LA SCENA (non è un interrogatorio): la Vedova Bruna vi riceve in veranda, '
             'versa il caffè di persona, e parla del tempo, del porto, dei figli degli '
             'altri. Non nega niente perché non ammette niente. Vi congeda con una frase '
             'sola: «la città cambia padrone ogni vent’anni, signori. Conviene a tutti '
             'che stavolta cambi SENZA sangue.»',
             'La veranda dà sul fiume: dal suo dondolo, la Vedova vede passare ogni '
             'chiatta diretta all’ansa morta. Sul tavolino, un binocolo da teatro e un '
             'quaderno di conti che lei non nasconde nemmeno: sa che non potete leggerlo '
             'da qui. E sorride.',
             'Il servizio da caffè è di porcellana buona ma SPAIATO: tazze comprate in '
             'fretta, una per volta, per ricevere gente che prima non riceveva. La Vedova non '
             'è la figura di comodo di nessuno: è un’impresa in espansione.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani della Vedova',
                  testo='Versa il caffè con la grazia di una padrona di casa — ma tiene la '
                        'tazza da sotto, a dita aperte, come si tiene un BILANCINO. E '
                        'quando vi porge lo zucchero, conta i movimenti: due, sempre due. '
                        'Chi ha pesato oro per una vita non smette per un caffè. La Vedova '
                        'non riceve ordini dal Cambiavalute: è il contrario.'),
         ]),
    dict(n=9, nome='IL MOLO DELLE CHIATTE IN DISARMO', voce_mappa='Il Molo in Disarmo',
         req='Il molo è «chiuso per disarmo»: catena, sentinelle annoiate, cani che non '
             'abbaiano. Le sentinelle non trattano — ma un corriere col marengo giusto '
             'non tratta: PASSA.',
         chiave=('oggetto', 'IL MARENGO SEGNATO'), art='Molo in Disarmo.png',
         chiude=None,
         indizi=[
             'Dal molo, l’ansa morta di sera: chiatte in secca come balene, la tettoia '
             'grande, e — quando il vento gira — un bagliore basso da fuoco di forgia, '
             'con un fumo che sa di carbone buono.',
             'Le sentinelle guardano il marengo, non le facce: la tacca di Fossa passa '
             'per il segno dei corrieri. Uno di loro, annoiato, ci tiene a precisare: «il '
             'pesatore conta TUTTO, dentro. Se entrate, uscite pesati.»',
             'Sull’acqua, legata all’ultima bitta, una chiatta carica a metà con la '
             'cerata tirata male: sotto, lingottiere vuote di ritorno. Il carico del '
             'giovedì è già cominciato.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='L’ansa morta',
                  testo='A fissare il bagliore sotto la tettoia: si vede un crogiolo che '
                        'non si spegne mai, un uomo col bilancino che pesa senza guardare, '
                        'e ventidue casse col sigillo del Quarantuno che si svuotano una '
                        'colata alla volta — la memoria di un tesoro che diventa moneta '
                        'senza memoria. La visione dura un rintocco.'),
         ]),
]

# Tessere del deposito. Obiettivo di RACCOLTA: una cassa d'oro in T2, T3,
# T4, T5; vittoria = casse fuori da T6 (la porta d'acqua).
TILES_8 = [
    dict(id='T1', nome='IL MOLO IN DISARMO', exits={'N': 'T2'}, start='S',
         testo='Le sentinelle vi contano mentre passate, senza fermarvi: il marengo ha '
               'parlato per voi. Oltre la catena, il regno delle chiatte morte: scafi in '
               'secca, bitte arrugginite, e in fondo la tettoia grande col suo bagliore '
               'basso. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito delle Domande 4 e '
               '1 (vedi la busta della Soluzione).',
         cerca_vuoto='Cordame marcio, pece secca, un gatto che vi giudica da una bitta. '
                     'Gli scafi in secca sono stati svuotati anni fa: non resta un '
                     'chiodo che valga chinarsi.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA TETTOIA DELLE CHIATTE', exits={'S': 'T1', 'N': 'T3'},
         testo='Chiatte in secca in fila come balene spiaggiate, reti stese che fanno '
               'pareti. Tra le casse da pesce in mostra — vuote, di facciata — una pila ha '
               'i fianchi rinforzati e i lucchetti nuovi. QUANDO RIVELATE QUESTA TESSERA: '
               'segnate LA PRIMA CASSA D’ORO su questa tessera (Interagire per '
               'sequestrarla o marcarla — un’azione).',
         arbitro='La cassa pesa: chi la porta ha Movimento -1 (le casse si possono '
                 'passare tra eroi adiacenti, un’azione gratuita per turno come gli '
                 'oggetti). Le casse NON si perdono se l’eroe cade: restano sulla sua '
                 'casella.',
         cerca='Sotto una cerata, un gancio da carico col manico consumato: +1 alle prove '
               'Interagire con casse e paranchi.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='IL MAGAZZINO DEL CARBONE', exits={'S': 'T2', 'N': 'T4'},
         testo='Montagne di sacchi fino alle travi, polvere nera che beve la luce delle '
               'lanterne. Sotto la terza pila a destra — dove le assi del pavimento sono '
               'nuove — il legno suona pieno. QUANDO RIVELATE QUESTA TESSERA: segnate LA '
               'SECONDA CASSA D’ORO su questa tessera (Interagire per sequestrarla).',
         arbitro='Chi Cerca o Interagisce qui esce nero di carbone: +1 alle prove NERVI '
                 'fino a fine round (nel buio del deposito, il nero è un vantaggio).',
         cerca_vuoto='Carbone, carbone, carbone. Sacchi fino alle travi e polvere nera '
                     'che vi si attacca addosso: qualunque cosa ci sia in mezzo, non la '
                     'trovate adesso.',
         arredi=[(0, 1, 'casse'), (3, 1, 'casse'), (0, 2, 'casse')]),
    dict(id='T4', nome='LA SALA DEL CROGIOLO', exits={'S': 'T3', 'E': 'T5', 'N': 'T6'},
         testo='Il cuore dell’ansa morta: il crogiolo acceso che non si spegne mai, le '
               'lingottiere in fila, il bilancino da farmacista su un banco pulitissimo. '
               'E LA TERZA CASSA D’ORO, aperta, accanto al banco di colata. QUANDO '
               'RIVELATE QUESTA TESSERA: appare IL CAMBIAVALUTE coi suoi due MASTINI.',
         arbitro='Il Cambiavalute è STANZIALE: non lascia mai T4 — difende il crogiolo, '
                 'è la sua vita. IL CROGIOLO (l’orologio dell’episodio): alla fine di '
                 'ogni round in cui NESSUN eroe è in T4, il Cambiavalute fonde — mettete '
                 '1 segnalino su una cassa non ancora sequestrata (la più vicina a T4): '
                 'al 3° segnalino sulla stessa cassa, quella cassa è PERSA (moneta '
                 'anonima). I Mastini invece INSEGUONO: il Fiuto li porta sempre, se '
                 'possono, su chi porta il Marengo Segnato o una cassa.',
         cerca_vuoto='Il calore vi respinge di un passo. Banco pulito, lingottiere in '
                     'fila, bilancino coperto: qui è tutto in ordine e tutto in uso, '
                     'niente lasciato in giro da prendere.',
         arredi=[(2, 2, 'casse')]),
    dict(id='T5', nome='L’UFFICIO DEL PESATORE', exits={'O': 'T4'},
         testo='Registri di colata rilegati come messali, il libro dei corrieri, una '
               'stufa spenta. Sotto il pavimento — dove il tappeto è inchiodato — LA '
               'QUARTA CASSA D’ORO. QUANDO RIVELATE QUESTA TESSERA: 1 Sicario di guardia '
               'appare (il guardaspalle del pesatore).',
         arbitro='Il libro dei corrieri: chi Cerca qui trova le pagine dei pagamenti '
                 'della Vedova — conta come riscontro nell’epilogo (annotarlo), non è un '
                 'oggetto.',
         cerca='Il libro dei corrieri: date, sigle e cifre — la contabilità del '
               'consolidamento. Pesa nell’epilogo (annotatelo sul Taccuino).',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'casse')]),
    dict(id='T6', nome='LA PORTA D’ACQUA DEL DEPOSITO', exits={'S': 'T4'},
         testo='L’uscita sul fiume: una banchina interna, la chiatta del giovedì carica '
               'a metà, l’acqua nera che aspetta. È da qui che si esce — con le casse. '
               'La vittoria è QUI, non serve tornare al molo: chi arriva alla chiatta '
               'con le casse sequestrate ha finito.',
         arbitro='VITTORIA: tutti gli eroi vivi in T6 con TUTTE e 4 le casse sequestrate '
                 '= vittoria piena. Con 3 casse = vittoria parziale (una partita di '
                 'moneta anonima circolerà: epilogo peggiore, non sconfitta). Con meno '
                 'di 3: il colpo è fallito (sconfitta — il deposito trasloca e la pista '
                 'muore).',
         cerca_vuoto='Acqua nera contro la banchina, gomene tese, il freddo del fiume '
                     'che sale dalle assi. Sulla pietra non è rimasto nulla: quello che '
                     'conta è già a bordo.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_8 = [
    dict(nome='IL CAMBIAVALUTE', att=2, dif=7, fer=4, mov=2, dan=1, boss=True,
         tipo='L’Orefice dell’Ansa Morta (Boss)', art='Il Cambiavalute.png',
         note='STANZIALE: non lascia mai T4. Il crogiolo-orologio: ogni round senza eroi '
              'in T4, 1 segnalino su una cassa non sequestrata — al 3° la cassa è persa. '
              'Nessuna debolezza-oggetto: è un uomo col bilancino.',
         bio_bestiario='Un orefice radiato dall’albo per una storia di leghe aggiustate, '
              'ripescato dall’ansa morta per il lavoro della vita: rifondere un tesoro '
              'che non esiste. Mani d’artista, bilancino da farmacista, e la calma di '
              'chi pesa l’oro degli altri da trent’anni. Non è un combattente: è un '
              'ARTIGIANO — e difende il crogiolo come Ferri difendeva il rituale, senza '
              'mai alzare la voce. Non lascia mai la Sala del Crogiolo: se il gruppo lo '
              'lascia solo, FONDE — un segnalino per round su una cassa non sequestrata, '
              'e al terzo segnalino quella cassa è moneta anonima per sempre. I suoi '
              'Mastini invece viaggiano: il Fiuto li porta su chi ha addosso l’oro. Ai '
              'tavoli da 2-3 eroi non recupera mai ferite (regola delle taglie).'),
    dict(nome='IL MASTINO', att=2, dif=6, fer=2, mov=4, dan=2,
         tipo='Cane da guardia dell’Ansa (bestia)', art='Il Mastino.png',
         note='FIUTO: se può, attacca sempre chi porta il Marengo Segnato o una cassa '
              'd’oro. Non abbaia mai.',
         bio_bestiario='I cani dell’ansa morta non abbaiano: aspettano. Comprati già '
              'addestrati da un canile militare, nutriti a carne e silenzio, conoscono '
              'un solo gioco: l’ODORE dell’oro e del metallo conta più di quello della '
              'paura. Il Fiuto li porta dritti su chi ha addosso il Marengo Segnato o '
              'una cassa — mollare il carico a un compagno è l’unico modo di '
              'togliersteli di dosso. Movimento 4: sulla distanza corta, nessun eroe è '
              'più veloce di loro.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 8 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 8')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'l’oro vecchio')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_8.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 7 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 8')
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
    doms = ['1. DOVE si rifonde l’oro vecchio? (attenzione: serve più di una conferma)',
            '2. CHI sta unificando i clan minori?',
            '3. QUANDO passa il prossimo carico? (attenzione: serve più di una conferma)',
            '4. COSA portate con voi per passare le sentinelle?']
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
    c.setTitle('Ombre su Roccamora - Episodio 8 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 8 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'il deposito dell’ansa morta, giovedì notte')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 110*mm, W - 56*mm, 58*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (più o meno, secondo il vostro Bivio '
                  'dell’Episodio 7 — vedi Soluzione) e le schede Nemici sono carte a parte '
                  '(cartella <b>Episodio 8/cards/</b>). Le 6 tessere del deposito sono in '
                  '<b>Episodio 8/board/</b>. ATTENZIONE: il mazzo di questo episodio è '
                  'FUORI STANDARD — 14 carte di spawn su 21: la pressione è fatta di corpi. '
                  'Le pagine seguenti sono le note per tessera: il <b>fronte</b> si legge ad '
                  'alta voce alla rivelazione; il <b>retro</b> è solo per chi tiene questo '
                  'fascicolo, e si consulta SOLO quando un eroe Cerca.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 110*mm, W - 60*mm, 62*mm, [
        Paragraph('Lo tiene <b>una persona sola</b> — di solito chi pesca il mazzo Minaccia e '
                  'tiene il Registro delle Ferite. Quando il gruppo rivela una tessera, legge ad '
                  'alta voce la voce corrispondente. Quando un eroe <b>Cerca</b>, gira il '
                  'foglio e legge l’esito di quella sola tessera: con lo stesso tono sia che '
                  'ci sia un tesoro, sia che non ci sia niente.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_8:
        art_file = TILE_ART_8[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_8[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_8.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 80*mm, W - 40*mm, 52*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 8</b>. In campo: le '
                  '<b>sentinelle e i clan</b> (Sgherri), il <b>guardaspalle</b> (Sicario), i '
                  '<b>Mastini</b> (bestie: il Fiuto li porta su chi ha addosso il Marengo o '
                  'una cassa) e <b>il Cambiavalute</b> (il boss: STANZIALE in T4, non '
                  'insegue mai — ma se lo lasciate solo, FONDE: 1 segnalino per round su '
                  'una cassa non sequestrata; al 3° segnalino quella cassa è persa). '
                  'Vittoria: TUTTE e 4 le casse sequestrate e portate alla Porta d’Acqua '
                  '(T6) — con 3 è vittoria parziale, con meno il colpo fallisce. Ai tavoli '
                  'da 2-3 eroi il Cambiavalute <b>non recupera mai ferite</b> (regola delle '
                  'taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_8())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_8():
    """Miniature dell'Episodio 8. Le 4 casse d'oro sono segnalini-obiettivo;
    i segnalini Canto sono qui i segnalini del CROGIOLO."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x5) · SICARI (x2)', [('Lo Sgherro.png', 5), ('Il Sicario.png', 2)]),
        ('CAMBIAVALUTE · MASTINI (x2)', [('Il Cambiavalute.png', 1), ('Il Mastino.png', 2)]),
        ('CASSE D’ORO (x4)', [('La Cassa d’Oro.png', 4)]),
        ('LA VOCE CHE GIRA (CANTO)', [('Un fischio sull’acqua.png', 1),
                                      ('I clan accorrono.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 8 - Soluzione (non aprire)')

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
        '<b>APERTURA — il Bivio dell’Episodio 7</b> (applicare PRIMA della lettera): se '
        'avete <b>DENUNCIATO IL BREVETTO</b> — i registri degli acquirenti sono bruciati: '
        'l’esame di Carbone sul marengo NON è disponibile (Carbone non ha riscontri); ma '
        'Sant’Orsola, salva e riconoscente, parla: la Testimonianza «Il sensale dei banchi» '
        '(Luogo 1) parte GIÀ RIVELATA. Se avete <b>TACIUTO E TRACCIATO</b> — partite con la '
        'lista degli acquirenti: un incrocio in più alla Domanda 1; ma Sant’Orsola è rimasta '
        'sorda e la voce gira: la Testimonianza «Il sensale dei banchi» (Luogo 1) esce dal '
        'mazzo Approfondimenti.',
    ])
    pagina('la verità', [
        'Il «protettore invisibile» sta consolidando i clan minori sotto la <b>Vedova '
        'Bruna</b> — che tutti credono figura di comodo e che di comodo non ha niente: '
        'tratta, compra, unifica, casa per casa e banco per banco. La cassa è il '
        '<b>tesoro della confraternita del 1741</b>, sequestrato dallo Stato e «mai '
        'ritrovato»: qualcuno che EREDITA i sigilli demaniali sapeva dove dormiva, l’ha '
        'aperto senza scasso, e lo spende — attraverso la Vedova — per comprare la '
        'Malavita di Roccamora.',
        'L’oro antico si rifonde al deposito dell’ansa morta: il <b>Cambiavalute</b> '
        '(orefice radiato, bilancino da farmacista) cola i marenghi in verghe anonime, '
        'coi Mastini alla porta e le sentinelle dei clan sul molo. La Vedova non ha mai '
        'visto in faccia il finanziatore: ordini e oro arrivano per corriere, con '
        'sigilli che non dovrebbero esistere più. Il tesoro non fu perso: fu CUSTODITO. '
        'E chi lo custodiva non passa dal Comune.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE si rifonde l’oro?</b> Al deposito dell’ansa morta, oltre il molo in '
        'disarmo (registro dei noli + sensale + carbone da forgia: serve più di una '
        'conferma). <i>Esatta:</i> sapete dove sbarcare — nel 1° round non si pesca '
        'nessuna carta Minaccia. <i>Sbagliata:</i> girate l’ansa a tentoni: 1 Sgherro '
        'appare in T1 alla rivelazione.',
        '<b>2. CHI unifica i clan?</b> La Vedova Bruna, in prima persona. <i>Esatta:</i> '
        'sapete CHI comanda davvero: quando pescate la carta «I clan accorrono», la '
        'ignorate (una volta sola) — i clan aspettano un ordine che la Vedova non ha '
        'dato. <i>Sbagliata:</i> se avete seguito la pista falsa (la Vedova «figura di '
        'comodo», il vero capo un clan rivale), avete mosso contro il bersaglio sbagliato '
        'e il deposito è sull’avviso: <b>1 Mastino in più</b> nel pool.',
        '<b>3. QUANDO passa il prossimo carico?</b> Giovedì notte, col carro del carbone '
        '(bolle + carrettiere: serve più di una conferma). <i>Esatta:</i> arrivate '
        'PRIMA del carico: il Canto (la Voce che gira) parte da 0. <i>Sbagliata:</i> il '
        'molo è già in fermento: 1 segnalino Canto in più alla partenza.',
        '<b>4. COSA portate con voi?</b> IL MARENGO SEGNATO (il Banco di Fossa): le '
        'sentinelle vi prendono per corrieri — si entra dal molo senza allarme. '
        '<i>Nota per chi arbitra:</i> la Tessera della Chiatta e il Sigillo di Piombo '
        'sono esche. ATTENZIONE: chi tiene il Marengo attira il Fiuto dei Mastini — '
        'passarlo di mano è lecito (e saggio).',
        '<b>Doppia pista — l’esca strutturale (Domanda 2):</b> qualcuno ha costruito la '
        'storia comoda che la Vedova sia solo una figura di comodo e il vero regista un '
        'clan rivale (le false prove sono seminate: un capro pronto). È un DEPISTAGGIO. '
        'La pista VERA la confermano tre carte in luoghi aperti — la Testimonianza «Il '
        'sensale dei banchi» (L1: contava lei di persona), l’Osservazione «La lente di '
        'Fossa» (L2, indiretta: giudicate con favore) e la Testimonianza «Il barcaiolo '
        'della Chiatta» (L3: l’orefice si inchina a LEI) — e la scena della Corte (L8) '
        'la sigilla. Chi accusa il clan rivale senza aver letto un rivelatorio crede '
        'all’esca (penalità sopra). Senza nulla in mano, giudicate con elasticità una '
        'risposta «vicina» (es. «la vedova del vecchio capo»).',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier '
        'completo (0 ore avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio, il crogiolo e le casse', [
        '<b>Montaggio</b> (tessere in Episodio 8/board/, coperte tranne T1):<br/>'
        'T1 Molo in Disarmo (ingresso, da Sud) → T2 Tettoia delle Chiatte → T3 Magazzino '
        'del Carbone → T4 Sala del Crogiolo (il centro) → a Est T5 Ufficio del Pesatore '
        '(ramo) → a Nord T6 Porta d’Acqua (l’USCITA: la vittoria si compie qui).',
        '<b>Le 4 casse d’oro</b> (l’obiettivo): una in T2, una in T3, una in T4, una in '
        'T5 — un’azione Interagire ciascuna per sequestrarle. Una cassa pesa: chi la '
        'porta ha Movimento −1; si passa tra eroi adiacenti (gratuito, una volta per '
        'turno). <b>Vittoria:</b> tutti gli eroi vivi in T6 — con 4 casse è PIENA, con '
        '3 è parziale (epilogo peggiore), con meno il colpo fallisce (sconfitta).',
        '<b>Il Cambiavalute e il crogiolo:</b> STANZIALE in T4, non insegue mai. Alla '
        'fine di ogni round in cui nessun eroe è in T4: 1 segnalino su una cassa non '
        'ancora sequestrata (la più vicina a T4) — al 3° segnalino sulla stessa cassa, '
        'quella cassa è PERSA. Abbatterlo ferma il crogiolo, ma non è necessario.',
        '<b>I Mastini (il Fiuto):</b> se possono, attaccano sempre chi porta il Marengo '
        'Segnato o una cassa. Movimento 4: non li si semina — li si inganna (passando '
        'il carico) o li si abbatte.',
        '<b>Il mazzo (FUORI STANDARD, 14 spawn su 21):</b> la pressione è fatta di '
        'corpi. Il Canto qui è LA VOCE CHE GIRA: carte crescendo + 1 segnalino ogni 4° '
        'round; alla soglia (3) i clan sono in strada — ogni Fase Minaccia pesca 1 '
        'carta in più, per sempre.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «Il crogiolo '
        'dell’ansa morta si spegne per la prima volta in tre mesi. Il Cambiavalute, o '
        'quel che ne resta della sua bottega, non pesa più per nessuno. E alla veranda '
        'sulla curva del fiume, la Vedova Bruna guarda passare la vostra barca senza '
        'binocolo: vi ha già misurati. Il caffè, la prossima volta, non ve lo '
        'offrirà.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 8:</b> <i>«Il tesoro del Coro non fu perso: fu '
        'sequestrato. Cercate chi ereditò i sigilli.»</i> Conservatelo per il finale.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> Le casse sono vostre, per '
        'una notte:<br/>'
        '<b>Sequestrare l’oro.</b> Consegnate tutto: i clan, senza paga, si sbandano — '
        'gli Episodi 9-12 tolgono 1 carta Malavita dai mazzi. Ma la Vedova vi segna: '
        'dall’Atto III la Malavita vi sarà SEMPRE ostile.<br/>'
        '<b>Lasciarlo circolare e tracciarlo.</b> Le casse tornano, marcate: la rete '
        'dei traccianti varrà un incrocio nell’Episodio 12. Ma i clan si consolidano: '
        'il pool nemici degli Episodi 9-12 guadagna +1 Sgherro.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 8.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI8_DESC = {
    1: "Fumo di sego, vino acido e lana bagnata: all’Osteria della Bilancia si entra come in "
       "una stalla al coperto, e il caldo che vi accoglie è più fitto di quanto tanti uomini "
       "fermi possano fare da soli. Dalle travi pende la stadera d’ottone che dà il nome al "
       "posto, immobile sui suoi piatti vuoti; sotto, i tavoli non stanno dove stavano — sedie "
       "tirate di traverso, bandiere di panno appese agli schienali una accanto all’altra, e "
       "sul pavimento il segno più chiaro delle gambe, là dove un tavolo è rimasto per "
       "vent’anni. Il sensale dei banchi beve da solo, con la manica che ha già asciugato il "
       "ripiano due o tre volte; vi parla senza che gliel’abbiate chiesto, guardando il "
       "bicchiere e non voi: «nessuna minaccia, signori. Un uomo gentile, un prezzo giusto», e "
       "ride di una risata corta, come si ride in chiesa. Le voci non salgono mai: crescono "
       "fino a una certa altezza e lì si fermano tutte insieme, come se qualcuno tenesse la "
       "mano sopra un coperchio. Sul banco, accanto alle colonne di tacche a gesso, una "
       "bandierina di clan è stata piegata e messa via, sotto un piatto.",
    2: "Il banco di Fossa sa di canfora, di tela cerata e di monete tenute in tasca troppo a "
       "lungo: la grata di ferro battuto, la lampada col paralume verde che tinge le mani di "
       "chi paga, e dietro, sugli scaffali fino al soffitto, mezza Roccamora impegnata in "
       "pacchi di carta legati con lo spago. Stasera il velluto nero del ripiano è sgombro di "
       "tutto tranne che di sette monete, messe in fila a distanza uguale come si allineano i "
       "bottoni di una divisa. Fossa non ve le porge: gira il panno perché le guardiate voi, e "
       "intanto tiene la lente all’occhio anche quando non sta guardando niente. «Qualcuno "
       "cancella la data prima di spendere», dice, e con l’unghia del mignolo segue il bordo di "
       "una moneta, avanti e indietro, per tutto il tempo in cui parla. Il paralume è basso e "
       "il suo verde toglie all’oro il colore: sul velluto quelle sette sembrano di piombo, "
       "finché lui non ne alza una. Nel cassetto aperto, fra i punzoni, un bulino da banco è "
       "stato posato fuori dal suo incavo, con la punta ancora lucida.",
    3: "Sentina, pesce e corda bagnata: alla Taverna della Chiatta l’odore del porto entra "
       "prima dei clienti e resta anche a porta chiusa. Le reti stese alle travi fanno un "
       "secondo soffitto, più basso; sui muri i noli scritti a gesso, la campanella dell’ultimo "
       "giro, e una disposizione di sedie che nessuno ha deciso e nessuno cambia. In fondo alla "
       "sala un tavolo sta più lontano dagli altri di quanto la stanza richieda, e attorno a "
       "quello si fa la fila come alla posta: si va in due, si torna in uno, e chi torna non "
       "racconta. Il registro dei noli pende dal banco a uno spago, le pagine gonfie d’umido. "
       "Un vecchio barcaiolo accetta il litro senza ringraziare e parla tenendo il bicchiere "
       "davanti alla bocca: «c’è luce di notte sotto la tettoia grande — luce da fuoco, non da "
       "lanterna», e mentre lo dice gli tremano gli avambracci, non le mani. La porta sul "
       "canale non chiude bene: a ogni risacca si scosta di un dito e torna, sempre alla stessa "
       "cadenza, per tutta la sera. Al chiodo del banco, un mazzo di chiavi da barca ha un "
       "vuoto in mezzo.",
    4: "Il Monte di Pietà sa di naftalina e di carta bagnata dai pollici: la grata al bancone, "
       "i registri incatenati al ripiano, e sugli scaffali i pegni in pacchi di tela con "
       "l’etichetta legata al polso come si fa negli ospedali. Fa più caldo di quanto una stufa "
       "spenta possa spiegare, perché la fila arriva fino alla porta e non è la fila di sempre: "
       "sono famiglie in abito buono, e il denaro lo portano dentro invece di portarlo via. Il "
       "direttore firma svincoli uno dietro l’altro, bagnandosi il pollice a ogni pagina; sulla "
       "data la penna gli trema un poco, e ogni volta guarda la moneta prima di guardare la "
       "persona. «La Malavita paga bene, di questi tempi», dice, senza alzare gli occhi dal "
       "registro. Dal cortile il carrettiere scarica i sacchi per le stufe e lascia sul "
       "pavimento lucido una scia nera di orme che il fattorino spazza subito, sempre nello "
       "stesso punto, sempre prima che siate arrivati a contarle. Sullo scaffale dei pegni non "
       "riscattati, in fondo, una divisa demaniale piegata porta ancora tutti i suoi bottoni, e "
       "la canfora attorno è nuova.",
    5: "La carbonaia si sente in gola prima che negli occhi: un secco che pizzica in fondo alla "
       "lingua e un sapore di ferro che resta anche dopo che avete smesso di respirare col "
       "naso. È una navata nera fino alle capriate, sacchi su sacchi legati a collo d’oca, e la "
       "lanterna non fa cerchio — la luce entra nel nero e non torna, così che le distanze si "
       "sbagliano tutte, e il fondo del locale è sempre un passo più in là di dove lo mettete. "
       "Il carbonaio è bianco solo attorno agli occhi; parla poco e senza smettere di lavorare, "
       "con la pala che continua a scendere fra una parola e l’altra: «io il carbone lo "
       "conosco: il carbone non piega le assi». Sul chiodo accanto alla porta le bolle "
       "infilzate fanno un mazzo spesso un dito. Da qualche parte fra i mucchi un rivolo di "
       "minuto scende da solo, poco alla volta, e ricomincia sempre quando avete smesso di "
       "aspettarlo. In fondo, con le stanghe abbassate, un carro carico ha le ruote fasciate di "
       "feltro, e il feltro è consumato solo sul davanti.",
    6: "La stanza dell’esattore in pensione è tenuta come un ufficio che non ha più orario: "
       "cera da mobili, canfora, e sotto a tutto quel principio d’odore d’aceto dei locali dove "
       "si lucida l’ottone. Una parete intera è di fascicoli rilegati in casa, la costola "
       "scritta a mano e la data in fondo; sul tavolino i timbri a secco stanno in fila per "
       "grandezza, e il tampone accanto è asciutto da anni. Vi apre in giacca — se l’è messa "
       "per voi, e le pieghe delle maniche lo dicono — poi tira fuori da sotto il letto un "
       "plico avvolto nella tela, sul cui coperchio la polvere manca in due punti larghi come "
       "pollici. «Casse ventidue, once quattromila, sigilli demaniali dall’uno al ventidue», "
       "recita, e non legge: tiene gli occhi sul muro davanti a sé. Il pendolo nell’angolo "
       "guadagna un battito ogni tanto, come chi si corregge parlando. Sul comò una fotografia "
       "di squadra sta appoggiata alla parete e non appesa, e il vetro è pulito soltanto in "
       "basso a destra, dove passa il pollice.",
    7: "L’Archivio Demaniale è il silenzio fatto mestiere: carta vecchia, colla animale, e quel "
       "freddo da scantinato che si sente nei denti prima che nelle mani. Scaffali fino al "
       "soffitto, tre secoli di roba tolta e mai resa legata col nastro rosso, e cartellini di "
       "cotone appesi ai faldoni che si muovono tutti insieme quando qualcuno cammina in fondo "
       "al corridoio — e continuano a muoversi un poco più a lungo di quanto dovrebbero. "
       "L’archivista vi precede a passi corti, sulle scarpe di feltro, tenendo le mani dietro "
       "la schiena come chi ha imparato a non toccare: «le matrici dei sigilli demaniali non "
       "stanno qui. Seguono la carica, non l’archivio», dice al corridoio, non a voi. La "
       "lampada da leggio ha il vetro verde e taglia la sala in due: sotto la luce la carta è "
       "gialla, un palmo più in là è nera. Sul leggio un faldone è già stato tirato fuori e "
       "posato di piatto; attorno la polvere è rigata come un letto disfatto, e sulla ceralacca "
       "di due sigilli la luce si ferma invece di spegnersi.",
    8: "La villa non ha ori né stucchi: intonaco chiaro, ghiaia rastrellata, e sul fiume una "
       "veranda di vimini dove l’aria sa di caffè appena fatto e di legno bagnato. Fa più "
       "fresco di quanto un pomeriggio così possa giustificare, perché la corrente passa sotto "
       "la balaustra e porta su l’acqua. Il servizio da caffè è di porcellana buona e non fa "
       "coppia: due tazze grandi, una piccola, tre piattini che vengono da tre case diverse. La "
       "Vedova Bruna versa lei, e nel farlo tiene la tazza da sotto, a dita aperte; le mani "
       "sono vecchie e non tremano, e i guanti da messa stanno piegati sul bracciolo, uno "
       "dentro l’altro. «La città cambia padrone ogni vent’anni, signori», dice, e intanto "
       "guarda il fiume dietro le vostre spalle, non voi. Quando si alza, il dondolo continua "
       "per un poco da solo, con lo stesso ritmo di prima. Sul tavolino di vimini, accanto a un "
       "quaderno chiuso, un binocolo da teatro sta girato verso l’acqua, e la vernice delle "
       "ghiere è consumata fino all’ottone.",
    9: "Il molo in disarmo sa di alga secca e di pece fredda, e ha il silenzio dei posti dove "
       "non si lavora più da anni ma qualcuno passa ancora ogni notte. Gli scafi stanno in "
       "secca sul fianco, uno dietro l’altro fino al buio, con le costole all’aria; le bitte "
       "sono arrugginite tutte tranne tre, lucide sulla cima come le maniglie di una porta "
       "molto usata. Di traverso al passaggio corre una catena col suo cartello, e il cartello "
       "è nuovo. Le sentinelle non vi fermano e non vi guardano in faccia: guardano le mani, e "
       "mentre passate una di loro conta a mezza voce, come si contano le casse. «Se entrate, "
       "uscite pesati», dice, e torna a soffiare sulle dita. I cani stanno seduti alle due "
       "estremità della catena, con le orecchie ferme, e girano la testa un istante prima che "
       "vi muoviate, mai dopo; non abbaiano, e nessuno gli dice di tacere. In fondo, sotto la "
       "tettoia grande, un bagliore basso non cresce e non cala mai.",
}

OGGETTI_LUOGO_8 = {
    2: [
        'Il Marengo Segnato',
    ],
    3: [
        'La Tessera della Chiatta',
    ],
    4: [
        'Il Sigillo di Piombo del Monte',
    ],
    5: [
        'La Lanterna da Sentina',
        ('Reperto C', 'le Bolle del Carbone', ''),
    ],
    6: [
        ('Reperto A', 'l’Inventario del Tesoro', ''),
    ],
    7: [
        ('Reperto B', 'il Fascicolo del Sequestro', ''),
    ],
    8: [
        ('Esame di Carbone', '', 'disponibile sulla tazza del caffè'),
    ],
}

TILE_ART_8 = {t['id']: t['id'] + '-ep8.png' for t in TILES_8}
LUOGHI8_CROP = {}

TESSERE_DESC_8 = {
    'T1': "Oltre la catena il freddo cambia natura: non più vento di fiume, ma l’aria ferma "
          "dei cortili chiusi, e un odore di pece secca che il giorno ha scaldato e la notte "
          "non ha ancora portato via. Gli scafi in secca stanno in due file, chiglia contro "
          "chiglia, spogliati fino alle ordinate; nel fango fra l’una e l’altra restano "
          "impronte di ruote strette, e vanno tutte nello stesso verso. La garitta delle "
          "sentinelle ha il braciere acceso e la porta socchiusa: dentro, una bottiglia passa "
          "fra due paia di mani, e nessuno esce a vedere chi cammina. L’acqua contro la "
          "banchina è nera e ferma, e non restituisce niente: nemmeno la lanterna che le "
          "tenete sopra, nemmeno la faccia di chi si sporge. "
          "In fondo, sotto la tettoia grande, un bagliore basso tiene la sua altezza senza "
          "crescere né calare, e a guardarlo a lungo se ne perde la distanza. Su una bitta "
          "arrugginita, a mezz’altezza, la ruggine manca in un anello lucido largo quanto una "
          "gomena.",
    'T2': "Sotto la tettoia il rumore cambia prima della luce: i passi tornano indietro "
          "dall’alto, dalle travi, e il fiume si sente attraverso il legno invece che "
          "attraverso l’aria. Sa di pece, di pesce vecchio e di reti che non asciugano mai. Le "
          "chiatte in secca stanno in fila come balene spiaggiate, e fra l’una e l’altra le "
          "reti tese fanno pareti che si muovono al vostro passaggio, tutte insieme, con un "
          "ritardo di un respiro. Le casse da pesce sono accatastate fino all’altezza di un "
          "uomo, aperte, vuote, con dentro la paglia secca da mesi. Una pila sola sta di fianco "
          "alle altre e non con loro: i fianchi hanno regoli inchiodati di traverso, il legno è "
          "dello stesso grigio ma i chiodi no, e i lucchetti non hanno preso ruggine. Sopra "
          "quella pila la polvere della tettoia è più sottile che sulle vicine. A terra, contro "
          "un montante, una cerata è ripiegata male, e da sotto il lembo spunta un gancio da "
          "carico col manico consumato al centro.",
    'T3': "Il magazzino del carbone si sente in gola prima che negli occhi: un secco che "
          "pizzica in fondo alla lingua, e un sapore di ferro che resta anche dopo che avete "
          "smesso di respirare col naso. La lanterna serve a poco — la luce entra nei mucchi e "
          "non torna — e le montagne di sacchi salgono verso le capriate senza mostrare dove "
          "finiscono. Il silenzio qui è imbottito: ogni rumore che fate torna indietro "
          "smorzato, come sotto una coperta di lana bagnata, e ogni tanto, da un mucchio o "
          "dall’altro, scende un rivolo di minuto che si ferma da solo. Sotto le suole il "
          "pavimento suona pieno per tutta la parete; poi, per la larghezza di tre assi, suona "
          "in un altro modo — più corto, più alto — e lì il legno è chiaro, con le teste dei "
          "chiodi ancora quadrate e senza ruggine. Appoggiata al muro dietro la terza pila a "
          "destra sta una pala da carbone, la lama pulita fino allo splendore e il manico "
          "invece nero.",
    'T4': "La porta si apre su un caldo da forno di pane: l’aria trema sopra il crogiolo e le "
          "cose dietro si piegano un poco, come viste attraverso l’acqua. Dopo il carbone e il "
          "fiume, qui si respira metallo e cenere, e la gola si asciuga in tre respiri. Il "
          "crogiolo tiene una luce arancione bassa e uguale, che non guizza mai: le ombre sulle "
          "pareti restano ferme anche quando qualcuno si muove. Le lingottiere sono in fila sul "
          "banco di colata, allineate a squadra, la sabbia spazzata via dal ripiano; accanto, "
          "sotto una campana di vetro, un bilancino da farmacista coi pesetti nei loro incavi "
          "di panno. L’uomo al banco non alza la testa quando entrate: le mani continuano, "
          "prendono, posano, e i polsini della camicia sono bianchi e chiusi al bottone in una "
          "stanza dove tutto il resto è nero; gli avambracci portano bruciature vecchie, tutte "
          "alla stessa altezza. Ai suoi piedi due cani si alzano insieme, senza rumore. Accanto "
          "al banco una cassa aperta poggia sul proprio coperchio, e la ceralacca del sigillo è "
          "rimasta attaccata al legno in un cerchio spezzato.",
    'T5': "L’ufficio del pesatore è freddo come il resto — la stufa è spenta da ore, e la "
          "lamiera è fredda anche vicino allo sportello — ma l’odore qui è di inchiostro e di "
          "gomma da cancellare, un odore da scuola che in un deposito sul fiume non sta. I "
          "registri di colata stanno sullo scaffale rilegati come messali, in pelle, la costola "
          "scritta in oro e le date in fila senza un buco. Sulla scrivania un libro più grande "
          "è rimasto aperto, e la pagina è tenuta ferma da un abaco d’osso le cui palline sono "
          "spinte tutte a sinistra tranne due. Il calamaio è chiuso, il pennino asciutto, la "
          "sedia tirata indietro come si tira quando ci si alza in fretta. Il tappeto arriva "
          "agli angoli e non è disteso: è inchiodato al pavimento, chiodi a testa larga a un "
          "palmo l’uno dall’altro, e lungo un lato le teste sono lucide dove tutte le altre "
          "sono opache. Contro la gamba della scrivania, una sputacchiera d’ottone è piena di "
          "cartine bruciate fino allo stesso punto.",
    'T6': "L’ultima porta dà sull’acqua e il freddo cambia padrone: non più il calore del "
          "crogiolo, ma il fiume che sale dalle assi e prende le caviglie. La banchina interna "
          "è una vasca di pietra dentro il deposito, e il nero che avete davanti non è buio: è "
          "acqua ferma, che tiene la lanterna sulla superficie e sotto non vi mostra niente. Le "
          "gomene sono tese e sgocciolano una alla volta, mai insieme. La chiatta del giovedì è "
          "carica a metà, la cerata tirata male su un carico basso e regolare, e dondola contro "
          "la pietra più di quanto la corrente giustifichi. L’argano è pronto, il cavo avvolto "
          "in spire ordinate e il gancio calato all’altezza del petto: qualcuno l’ha lasciato "
          "dove serve, non dove si posa. Oltre l’apertura il fiume è largo e non porta rumore, "
          "e l’aria che entra sa di alghe e di notte aperta. Sul bordo della banchina, in un "
          "punto solo, la pietra è consumata a scalino, lucida, larga quanto una spalla.",
}

ESAMI_CARBONE_8 = {
    'IL MARENGO': '«La lega è del Settecento, il conio pure — ma la molatura del bordo è '
                'di quest’anno: qualcuno cancella il millesimo prima di spendere. Oro '
                'che si vergogna della propria data ha sempre una storia da nascondere — '
                'e questa comincia in un deposito giudiziario.»',
    'LA TAZZA DELLA VEDOVA': '«Porcellana buona, servizio SPAIATO: pezzi comprati uno '
                'alla volta, di fretta, per ricevere gente che prima non veniva. La '
                'Vedova non è stata promossa dal lutto: si sta ATTREZZANDO. E chi si '
                'attrezza, aspetta ospiti — o ispezioni.»',
    'LA CERALACCA': '«Il sigillo è impresso con la matrice autentica del Quarantuno: '
                'ogni dente del conio. Non è un falso: è un USO. Le matrici demaniali '
                'non si rubano — si ereditano, d’ufficio, in silenzio. Cercate chi ha '
                'ereditato la funzione, non chi ha scassinato l’archivio.»',
}

OGGETTI_TESSERA_8 = {'T2': ['Il Gancio da Carico']}


def luoghi():
    """Luoghi.pdf Episodio 8 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'smoky canal tavern.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 8 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_8, 'Episodio 8')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_8.get(n, []))

    for L in LUOGHI_8:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI8_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI8_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_8)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_8
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL CAMBIAVALUTE', 'IL MASTINO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 8')
    print('OK episodio 8')
