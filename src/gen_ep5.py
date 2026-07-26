# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 5: L'organo di ossa (Episodio 5/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-5.md e CAMPAGNA-EPISODI.md).
Episodio mythology: la cripta mai svuotata dei Battuti, l'organo con le
canne d'ossa dei confratelli del 1741, il becchino Mola, il Maestro dei
Registri. Un solo seme C.B./M.: il timbro vero prestato a un funzionario
inesistente.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche vivono
in scripts/cardconjurer/cards-data.js, blocco EPISODIO 5).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 5', 'pdf')
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

LETTERA_5 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«La chiesa sconsacrata dei <b>Battuti</b> — il magazzino comunale — di notte suona. "
    "L’organo fu murato nel Quarantuno e le canne fuse in grondaie: eppure mezza contrada lo "
    "sente, «basso, come sotto i piedi». Stamattina il custode <b>Fedele</b> è stato trovato "
    "morto tra le scaffalature: il medico dice cuore, la faccia dice altro, e le mani — "
    "piene di calcina fresca — dicono che stava murando qualcosa che qualcun altro aveva "
    "aperto. All’ossario comunale, intanto, mancano casse: non a caso, non a peso. Solo "
    "certe casse.<br/><br/>"
    "Scoprite chi suona, e con che cosa. Avete <b>6 ore</b>, dalle 18:00 alle 24:00. Una "
    "cortesia: <b>non allarmate la Curia</b> — i timbri sono cosa delicata.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la chiesa dei Battuti, l’ossario comunale, il "
    "cimitero nuovo e la Parrocchia del Borgo — che conoscete. Gli altri andranno "
    "sbloccati. L’ossario chiude alle 22:00, l’ufficio delle sconsacrazioni in Curia "
    "alle 21:00. E al Cimitero Nuovo i carri notturni finiscono il carico verso le "
    "21:00: le lapidi che portano via, dopo, non le trovate più.</i>")

# Luoghi: chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via
# (anti-fortuna): «il maestro dei registri» da L1 e L3, «contanti nuovi» da
# L2 e L3, «lapidi rifatte» da L2 e L3, «la sconsacrazione del Quarantuno»
# da L1 e L4, la Chiave del Sagrato da L4. Rivelatorio (Domanda 2) su 3
# carte designate: L1, L2, L3.
LUOGHI_5 = [
    dict(n=1, nome='LA CHIESA DEI BATTUTI', voce_mappa='La Chiesa dei Battuti',
         req='Disponibile dall’inizio', art='Chiesa dei Battuti.png',
         chiude=None,
         indizi=[
             'Fedele è dove l’hanno trovato, tra le scaffalature del magazzino: la faccia di '
             'chi ha visto, le mani piene di calcina fresca. Ai piedi della parete di fondo, '
             'una breccia rimurata a metà — da FUORI. Stava chiudendo qualcosa dentro.',
             'Gli inservienti del magazzino, a bassa voce: Fedele negli ultimi giorni parlava '
             'di un «maestro dei registri» che veniva a misurare le navate di notte, con due '
             'uomini e una lanterna schermata. «Diceva: quello non conta le casse. Conta i '
             'PASSI.»',
             'Il pavimento davanti alla breccia è pulito in una striscia larga un carro: '
             'qualcosa è entrato e uscito molte volte, e qualcuno ha spazzato — ma la '
             'calcina nuova sulla parete viene da un sacco che in magazzino non esiste. La '
             'sconsacrazione del Quarantuno murò la cripta: il fascicolo dev’essere in Curia.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani del becchino',
                  testo='Al funerale lampo di Fedele, il becchino-capo del cimitero nuovo lavora '
                        'di pala con le maniche lunghe, d’estate. Quando le rimbocca per un '
                        'attimo, i polsi sono segnati di bianco: non calce da fossa — polvere '
                        'd’ossa. Un becchino la conosce. E la lava, di solito.'),
             dict(tipo='Presagio', soggetto='La salmodia sotto',
                  testo='Con l’orecchio alla breccia rimurata: un canto piano, senza parole, che '
                        'non si ferma MAI — e si vede un corridoio di nicchie dove le ossa nei '
                        'muri rispondono al canto, una per una, come un registro che si accorda. '
                        'Chi passerà di lì, tacendo e in fretta, passerà meglio. La visione dura '
                        'un rintocco.'),
         ]),
    dict(n=2, nome='L’OSSARIO COMUNALE', voce_mappa='L’Ossario Comunale',
         req='Disponibile dall’inizio', art='Ossario Comunale.png',
         sblocca_parola=('CONTANTI NUOVI', 'LAPIDI RIFATTE'), chiude=22,
         indizi=[
             'Le casse mancanti sono ventidue, e non sono a caso: solo sepolture del secolo '
             'scorso, solo casse marcate con un segno d’onda sul legno. Il custode '
             'dell’ossario: «le ricognizioni le fa la Curia. Ma la Curia qui non viene da '
             'vent’anni.»',
             'Nel registro delle consegne, le uscite risultano autorizzate e ritirate «per '
             'ricognizione» — sempre di notte, sempre con lo stesso carrettiere. Il custode: '
             '«pagato in contanti nuovi, davanti a me. Chi paga il carrettiere davanti al '
             'custode, il custode lo sta pagando in silenzio.»',
             'Tre nicchie svuotate portano lapidi NUOVE, di marmo appena tagliato, coi nomi '
             'ricopiati — «lapidi rifatte, per pietà dei discendenti», dice la carta. I '
             'discendenti di confratelli banditi nel Quarantuno. Che non esistono.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le casse marcate',
                  testo='Il segno d’onda sulle casse mancanti non è del falegname: è inciso '
                        'DOPO, con una sgorbia, sempre dalla stessa mano. Qualcuno ha censito '
                        'l’ossario prima di svuotarlo — cassa per cassa, negli anni. Il furto è '
                        'l’ultimo atto di un inventario cominciato molto tempo fa.'),
         ]),
    dict(n=3, nome='IL CIMITERO NUOVO', voce_mappa='Il Cimitero Nuovo',
         req='Disponibile dall’inizio', art='Cimitero Nuovo.png',
         sblocca_parola=('IL MAESTRO DEI REGISTRI', 'CONTANTI NUOVI', 'LAPIDI RIFATTE'),
         chiude=None,
         indizi=[
             'Il regno di Zaccaria Mola, becchino-capo: fosse «in manutenzione» transennate da '
             'settimane, e gli inservienti pagati il doppio — in contanti nuovi — per i turni '
             'di notte. «Manutenzione di cosa», dice uno sputando, «se là sotto non c’è più '
             'nessuno?»',
             'I carri notturni escono dal cancello di servizio e NON portano terra: un '
             'guardiano li ha contati — «entrano vuoti, escono pesanti, e il lasciapassare lo '
             'firma il maestro dei registri. Chi è? Boh. Ma il cancello si apre.»',
             'Dietro la rimessa, lapidi vecchie accatastate a faccia in giù: sono quelle vere '
             'delle tombe «rifatte» — e su ciascuna, sotto il muschio, un’onda scalpellata '
             'via. Le lapidi rifatte non sono pietà: sono una cancellatura — e i carri le '
             'portano dal marmista STANOTTE. Se arrivate qui dopo le 21:00 il cortile è '
             'già vuoto: questa prova l’avete persa (il Cimitero resta visitabile, ma la '
             'Domanda 3 dovrete confermarla altrove).'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='L’inserviente sputasentenze',
                  testo='«Mola una volta scavava e basta. Da quest’inverno misura: va per file '
                        'coi passi contati e un taccuino, come un agrimensore. E quando ha '
                        'finito di misurare, la settimana dopo, la fossa è “in manutenzione”. '
                        'Io non so leggere, signori. Ma so contare: ventidue.»'),
         ]),
    dict(n=4, nome='LA PARROCCHIA DEL BORGO', voce_mappa='La Parrocchia del Borgo',
         req='Disponibile dall’inizio', art='Parrocchia del Borgo.png',
         sblocca_parola='LA SCONSACRAZIONE DEL QUARANTUNO',
         sblocca_oggetto='LA CHIAVE DEL SAGRATO', chiude=None,
         indizi=[
             'Il sagrestano vi riconosce — il Borgo non dimentica i pozzi — e per una volta '
             'parla per primo: «i Battuti? La sconsacrazione del Quarantuno la fece il '
             'vescovado in tre giorni, di fretta, A PORTE CHIUSE. Il fascicolo è in Curia. E '
             'in Curia, di solito, la fretta non abita.»',
             'Nel ripostiglio della sacrestia, sotto un telo: il fonte battesimale dei '
             'Battuti, salvato nel Quarantuno da un parroco testardo. Dentro il piede cavo, '
             'un’ampolla sigillata a cera: l’acqua dell’ultimo battesimo.',
             'Il sagrestano custodisce anche un anello di chiavi «che non aprono più niente»: '
             'una è marcata coi flagelli incrociati dei Battuti — la chiave del sagrato e '
             'della sagrestia vecchia. «Se la prendete, non ditemi per cosa.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il fonte che trattiene',
                  testo='L’acqua nell’ampolla è ferma da centocinquant’anni, eppure — contro '
                        'luce — trema: si vede un saio inginocchiato a un fonte, un bambino che '
                        'piange al battesimo, e lo stesso saio, molto dopo, che canta in un '
                        'buio pieno di nicchie senza fermarsi mai. La voce del fonte è più '
                        'vecchia della sua. La visione dura un rintocco.'),
         ]),
    dict(n=5, nome='LA CASA DEL BECCHINO', voce_mappa='Vicolo delle Croci',
         req='La moglie di Mola non apre a nessuno: «mio marito lavora, i morti non aspettano». '
             'Ma i vicini di casa hanno occhi, e chi arriva sapendo COME viene pagato Mola '
             'trova la porta socchiusa e la moglie in lacrime.',
         chiave=('parola', 'CONTANTI NUOVI'), art='Casa del Becchino.png', chiude=None,
         indizi=[
             'La casa di un becchino con la credenza nuova, la stufa nuova, le scarpe buone '
             'per tutti i figli: tre stipendi in sei mesi, tutti in contanti mai piegati. La '
             'moglie: «gli ho chiesto da dove. Mi ha detto: da un lavoro che non si racconta. '
             'Da allora non dorme.»',
             'Sotto il pagliericcio, il registro privato di Mola: date, casse, fosse — e '
             'accanto a ogni riga, le iniziali «M.d.R.». L’ultima pagina è un conto: ventidue '
             'casse consegnate, DUE ancora da consegnare.',
             'Nel ripostiglio, un’ampolla d’olio dei morti e una pala nuova mai usata: regalo '
             '«del committente, per il lavoro fino». Mola non l’ha mai toccata: «le pale '
             'nuove», dice la moglie, «portano male ai vivi».'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Mola, alla fine',
                  testo='Rintracciato al cancello di servizio, Mola non nega niente: «io le '
                        'ossa le SCAVO, signori. Non chiedo per chi suonano. Il maestro dei '
                        'registri paga, il timbro è vero, la carta è vera — se la carta è '
                        'vera, il peccato è di chi la scrive. Ditemi che è così. Vi prego: '
                        'ditemi che è così.»'),
         ]),
    dict(n=6, nome='LO STUDIO DEL MAESTRO DEI REGISTRI', voce_mappa='Corte del Ragioniere',
         req='Uno studio di contabilità senza clienti: il praticante sulla porta ripete «il '
             'titolare è fuori per inventari». Solo chi nomina il titolare col suo TITOLO '
             'giusto viene fatto entrare ad aspettare — in una stanza che parla.',
         chiave=('parola', 'IL MAESTRO DEI REGISTRI'), art='Studio del Maestro.png', chiude=None,
         indizi=[
             'Lo studio è una scenografia: registri finti in bella vista, polvere vera sui '
             'calamai. Ma nel retro, tre schedari VERI: la contabilità di tre cantieri — '
             '«fonderia», «pozzi», «teatro» — chiusi, saldati, archiviati. Il quarto '
             'schedario, «cripta», è vuoto: portato via da poco.',
             'Nel cestino, bruciata a metà, una minuta d’ordine: «...le ultime due casse '
             'entro la marea. Il registro dev’essere PIENO per la prova d’organo.» La firma '
             'manca. La carta è di pregio.',
             'Sulla scrivania, dimenticata sotto il tampone, un’autorizzazione alle '
             'riesumazioni pronta per l’uso: firma di un funzionario di Curia... che non '
             'risulta in nessun annuario. Il timbro, però, è autentico.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Lo studio-scenografia',
                  testo='I registri finti hanno i dorsi scoloriti DAL LATO SBAGLIATO: comprati '
                        'usati, messi in scena in fretta. Ma le sedie d’attesa sono consumate '
                        'davvero: qui la gente viene, aspetta, e paga. Uno studio che non '
                        'lavora e incassa non è uno studio: è uno sportello. Di qualcosa.'),
         ]),
    dict(n=7, nome='L’UFFICIO DELLE SCONSACRAZIONI', voce_mappa='La Curia',
         req='Il cancelliere di Curia è cortesia e diffidenza: «gli archivi diocesani non sono '
             'un pubblico passeggio». Ma un fascicolo preciso, chiesto con l’anno preciso, è '
             'un atto dovuto — e la parola giusta apre più porte di un mandato.',
         chiave=('parola', 'LA SCONSACRAZIONE DEL QUARANTUNO'), art='La Curia.png', chiude=21,
         indizi=[
             'Il fascicolo del Quarantuno, tre giorni in tutto: sconsacrazione «per quiete '
             'pubblica», l’organo murato, le campane fuse — e in margine, la riga che pesa: '
             '«la cripta capitolare, murata com’è, si abbandona ALLO STATO in cui giace». '
             'Mai svuotata. Mai riconsacrata. Mai più aperta.',
             'Il registro dei timbri: quello impresso sulle autorizzazioni alle riesumazioni '
             'è il timbro della Cancelleria per gli atti mortuari — e da vent’anni, per '
             'regolamento, NON ESCE dalla stanza del cancelliere. Il cancelliere impallidisce: '
             '«non esce. Non è mai uscito. Ci sono io, qui.»',
             'Nell’annuario diocesano, il funzionario firmatario non esiste: né oggi, né mai. '
             'Il cancelliere sfoglia due volte, tre volte, e alla fine chiude l’annuario '
             'piano, come si chiude una bara: «vi chiedo di non dire a nessuno quello che '
             'avete visto qui.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il timbro prestato',
                  testo='L’impronta del timbro sulle autorizzazioni è perfetta ma STANCA: il '
                        'cuscinetto era quasi asciutto, l’impronta ribattuta due volte. Chi '
                        'timbra così non lavora in Curia: timbra di fretta, altrove, con un '
                        'timbro che deve RIENTRARE prima che qualcuno ne senta la mancanza. Il '
                        'prestito dura una notte. Da vent’anni, quando serve.'),
         ]),
    dict(n=8, nome='IL DEPOSITO DEL MARMISTA', voce_mappa='Calle del Marmo',
         req='Il marmista lavora e non alza gli occhi: «i preventivi il giovedì». Ma chi entra '
             'nominando il lavoro che lo imbarazza — quello delle lapidi — trova un uomo che '
             'ha una gran voglia di scaricarsi la coscienza.',
         chiave=('parola', 'LAPIDI RIFATTE'), art='Deposito del Marmista.png', chiude=None,
         indizi=[
             'Le commesse delle lapidi rifatte: ventidue, pagate in anticipo, «per conto dei '
             'discendenti». Il marmista: «i discendenti non li ho mai visti. Veniva un '
             'garzone con la carta scritta bene e i soldi contati giusti. Io copio nomi, non '
             'faccio domande.»',
             'L’ordine più strano: su ogni lapide nuova, l’istruzione di NON incidere il '
             'segno che c’era sulla vecchia — «un’onda, tipo una S coricata». Il marmista '
             'l’ha scalpellata via anche dalle originali, «per contratto». Qualcuno sta '
             'cancellando un censimento.',
             'In fondo al deposito, due lapidi nuove già pronte e mai ritirate: i nomi sono '
             'di due confratelli le cui casse — controllando il registro dell’ossario — '
             'risultano ANCORA al loro posto. Le ultime due. Il lavoro non è finito.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le ultime due lapidi',
                  testo='Le due lapidi pronte hanno le date di consegna incise a matita sul '
                        'retro, come usa il marmista: dopodomani. Chiunque paghi, verrà a '
                        'ritirarle — o manderà il garzone — dopodomani. Un appuntamento, '
                        'scolpito nel marmo da chi non sa di averlo dato.'),
         ]),
    dict(n=9, nome='LA SAGRESTIA DEI BATTUTI', voce_mappa='Il Sagrato dei Battuti',
         req='La porticina della sagrestia vecchia è serrata da una toppa nera di flagelli '
             'incrociati: senza la chiave giusta resta un muro — e il sagrato, di notte, non '
             'gradisce chi forza le porte dei morti.',
         chiave=('oggetto', 'LA CHIAVE DEL SAGRATO'), art='Sagrestia dei Battuti.png',
         chiude=None,
         indizi=[
             'La sagrestia vecchia è rimasta al Quarantuno: paramenti neri appesi, un '
             'inginocchiatoio, la polvere come neve. Sul tavolo, però, IMPRONTE fresche: '
             'qualcuno ci passa, e da poco. Sotto l’armadio dei paramenti, trascinato di '
             'lato, il pavimento mostra una botola col flagello inciso.',
             'Nel cassetto dell’inginocchiatoio, il diario di Fedele — portato QUI, al '
             'sicuro, dove dormiva la sua paura: «stanotte l’ho sentito accordarsi. Domani '
             'chiudo il muro e non lo dico a nessuno: certe porte, a denunciarle, si aprono.»',
             'La botola è unta di fresco sui cardini, e dal buio sotto sale — piano, senza '
             'parole, senza fermarsi mai — una salmodia. Da qui si scende. Da qui, ogni '
             'notte, scendono LORO.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I cardini unti',
                  testo='Il sego sui cardini è steso con metodo, dall’alto verso il basso, '
                        'SENZA sbavature: la mano di chi apre questa botola non ha mai '
                        'fretta e non ha mai paura. Voi avrete entrambe. Regolatevi sulle '
                        'candele: là sotto le vostre saranno le uniche a tremare.'),
         ]),
]

# Tessere della cripta dei Battuti.
TILES_5 = [
    dict(id='T1', nome='LA SCALA DEL SAGRATO', exits={'N': 'T2'}, start='S',
         testo='I gradini scendono stretti, consumati al centro da duecento anni di sai: la '
               'botola si richiude sopra di voi col peso di una lapide. In fondo, il buio ha '
               'una temperatura sua — e la salmodia, adesso, si sente coi denti. QUANDO '
               'RIVELATE QUESTA TESSERA: applicate l’esito della Domanda 1 (vedi la busta '
               'della Soluzione). Qui dovete risalire per vincere.',
         cerca_vuoto='Sotto la scala, secoli di cera colata e un sandalo spaiato, pietrificato '
                     'dal tempo. Nient’altro: chi scende qui non lascia bagagli.',
         arredi=[(0, 3, 'candele'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA NAVATA SEPOLTA', exits={'S': 'T1', 'N': 'T3'},
         testo='La chiesa di sotto: una navata intera, sepolta in piedi. Banchi marci in fila '
               'che aspettano fedeli morti da due secoli, l’altare spogliato, e sulle pareti '
               'gli affreschi dei flagellanti che il buio ha custodito meglio del sole.',
         cerca='Dietro l’altare spogliato, una lanterna d’altare di ottone col vetro rubino, '
               'ancora buona: +1 alle prove NERVI finché la porta chi l’ha trovata.',
         arredi=[(1, 1, 'casse'), (2, 2, 'altare')]),
    dict(id='T3', nome='IL CORRIDOIO DEGLI OSSARI', exits={'S': 'T2', 'N': 'T4'},
         testo='Il corridoio è foderato di nicchie, e le nicchie sono piene: ossa incassate '
               'nei muri come libri in biblioteca. La salmodia corre LUNGO le ossa — le '
               'attraversa, le accorda, le fa rispondere una per una. Chi entra in questa '
               'tessera per la prima volta prova NERVI (Difficile): il muro vi canta accanto. '
               'Se fallisce, ha 1 sola azione al prossimo turno. LE CANDELE DELLA PARROCCHIA '
               'danno +1 alla prova, come da carta.',
         hook='Se il gruppo ha letto il Presagio «La salmodia sotto» (Luogo 1): sanno che si '
              'passa tacendo e in fretta — la prova è Media invece che Difficile.',
         cerca_vuoto='Le nicchie sono piene e ordinate, e nessuna manca: le ossa del corridoio '
                     'non interessano al Coro. Sono il pubblico, non lo strumento.',
         arredi=[(0, 1, 'casse'), (3, 1, 'casse'), (0, 2, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='LA SALA DEL CAPITOLO', exits={'S': 'T3', 'E': 'T5', 'N': 'T6'},
         testo='La sala dove i Battuti tenevano capitolo: lo stallo del priore, i sedili in '
               'giro, e sul tavolo di pietra — nuovi, ordinati, ALTRUI — i registri di '
               'cantiere: conti, misure, un calendario di maree. QUANDO RIVELATE QUESTA '
               'TESSERA: 1 Confratello di guardia appare tra i sedili.',
         cerca_vuoto='I registri di cantiere sono copie di lavoro: numeri e misure, '
                     'nessun nome. Carta comune, inchiostro comune, niente che valga la '
                     'pena portarsi via.',
         arredi=[(1, 1, 'scrivania'), (2, 2, 'casse')]),
    dict(id='T5', nome='L’OFFICINA DELLE CANNE D’OSSA', exits={'O': 'T4'},
         testo='Banchi da liutaio in una cripta: seghe fini, colla d’ossa che bolle piano su '
               'un fornello, e in rastrelliera le canne finite — femori innestati, incerati, '
               'LUCIDI. Contro il muro, le casse dell’ossario ancora piene, in attesa di '
               'diventare musica.',
         arbitro='Le casse di ossa: un’azione Interagire ciascuna per metterle in salvo '
                 '(contano nell’epilogo e nel Bivio). Se la Domanda 3 è SBAGLIATA: le casse '
                 'giuste non sono riconoscibili — ogni Interagire qui richiede prima una '
                 'prova ACUME (Media); fallita, l’azione è spesa su una cassa qualunque '
                 '(non conta).',
         cerca='Tra i trucioli sotto il banco, uno scalpello da liutaio col manico d’osso: '
               '+1 alle prove Interagire con le canne e con l’organo.',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'crogiolo')]),
    dict(id='T6', nome='L’ORGANO MURATO', exits={'S': 'T4'},
         testo='La breccia grande: il muro del Quarantuno abbattuto a metà, e dietro — '
               'nell’abside della cripta — l’ORGANO. Canne d’ossa montate a file, mantici '
               'nuovi di cuoio chiaro, un’impalcatura da cattedrale. Davanti alla tastiera, '
               'un saio che canta senza fermarsi. In alto, una condotta respira aria di '
               'canale: una sagoma magra vi si infila coi suoi libri sottobraccio — e non la '
               'prenderete. QUANDO RIVELATE QUESTA TESSERA: appare IL SALMODIANTE con 1 '
               'Confratello ogni 4 eroi (arrotondate per eccesso).',
         arbitro='Lo sfregio: TRE canne montate da sfregiare (un’azione Interagire ciascuna, '
                 'contrassegnate sulla tessera) — a sfregio compiuto l’organo non potrà '
                 'suonare questa marea (vittoria piena). La debolezza del Salmodiante è '
                 'L’ACQUA DEL FONTE (vedi carta e Bestiario): un’azione adiacente — Difesa '
                 '8→5 per il resto della partita, e salta la sua prossima attivazione. Il '
                 'Crocifisso Spezzato e l’Olio dei Morti non fanno nulla: esche. Finché il '
                 'Salmodiante è vivo, i Confratelli a lui adiacenti hanno +1 Difesa (la '
                 'salmodia li tiene insieme).',
         cerca_vuoto='Qui non c’è niente da trovare che non vi stia già guardando. Le '
                     'canne montate luccicano di cera fresca, e il cuoio dei mantici '
                     'odora ancora di conceria.',
         arredi=[(2, 2, 'altare')]),
]

# Nemici nuovi (statistiche - fonte per Bestiario e simulatore).
NEMICI_5 = [
    dict(nome='IL SALMODIANTE', att=3, dif=8, fer=4, mov=3, dan=2, boss=True,
         tipo='Confratello del Quarantuno (Boss)', art='Il Salmodiante.png',
         note='Finché è vivo, i Confratelli a lui adiacenti hanno +1 Difesa (la salmodia li '
              'tiene insieme). La debolezza è l’Acqua del Fonte (Difesa 8→5 + salta la '
              'prossima attivazione).',
         bio_bestiario='Quando murarono la cripta, nel Quarantuno, uno dei confratelli non '
              'volle uscire: rimase a cantare l’ufficio dei morti per i fratelli che non '
              'avevano avuto il requiem. La cera lo ha vestito, il canto lo ha conservato: '
              'centocinquant’anni di salmodia senza un respiro di pausa, finché la voce e '
              'l’uomo non sono diventati la stessa cosa. Non odia: CUSTODISCE. Finché canta, '
              'i Confratelli a lui adiacenti hanno +1 Difesa — la salmodia li tiene insieme '
              'come una mano tiene le dita. Ciò che lo ferma è l’unica voce più vecchia '
              'della sua: l’acqua del fonte dove fu battezzato (un’azione adiacente: Difesa '
              '8→5 per il resto della partita, e salta la sua prossima attivazione). Ai '
              'tavoli da 2-3 eroi non recupera mai ferite, qualunque cosa dicano le carte '
              'Crescendo (regola delle taglie, vedi Regolamento).'),
    dict(nome='IL CONFRATELLO', att=1, dif=7, fer=1, mov=2, dan=1,
         tipo='Cera e ossa del Coro', art='Il Confratello.png',
         note='Lento (Movimento 2) e paziente: non arretra mai. +1 Difesa se adiacente al '
              'Salmodiante.',
         bio_bestiario='Sai vuoti riempiti di cera e d’ossa spaiate: i fratelli minori che la '
              'salmodia ha rimesso in piedi per servire il cantiere. Camminano come si '
              'cammina in processione — due passi, mai di corsa — e non arretrano, perché '
              'la cera non ricorda la paura. Vicino al Salmodiante si stringono nel canto '
              'e diventano più duri da rompere (+1 Difesa). Lontano da lui sono solo cera: '
              'pazienza e peso.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 5 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 5')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'l’organo di ossa')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_5.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 4 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 5')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8.5)
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 39.5*mm, '! la Curia (7) chiude alle 21:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 44.5*mm, '! l’Ossario (2) chiude alle 22:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 49.5*mm, '! il Cimitero (3): dalle 21:00 i carri hanno finito — prova persa')

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
    doms = ['1. DOVE si costruisce lo strumento?',
            '2. CHI procura le ossa?',
            '3. QUALI ossa cercano? (attenzione: serve più di una conferma)',
            '4. COSA portate con voi contro ciò che canta là sotto?']
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
    c.setTitle('Ombre su Roccamora - Episodio 5 - Spedizione')
    # copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 5 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la cripta dei battuti, sotto il magazzino comunale')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 128*mm, W - 56*mm, 75*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (più «I legni chiamano» SOLO se il '
                  'vostro Bivio lo dice — vedi Soluzione) e le schede Nemici sono carte a '
                  'parte (cartella <b>Episodio 5/cards/</b>). Le 6 tessere della cripta sono '
                  'in <b>Episodio 5/board/</b>. Le pagine seguenti sono le note per tessera, una tessera per foglio: il '
                  '<b>fronte</b> si legge ad alta voce quando una tessera viene rivelata; il '
                  '<b>retro del foglio</b> è solo per chi tiene questo fascicolo — dice cosa '
                  'nasconde ogni tessera, e si consulta SOLO quando un eroe Cerca (o prova ad '
                  'aprire qualcosa). Non giratelo prima.', BODY),
        Paragraph('<b>L’orologio di questa spedizione:</b> il Canto sale da solo ogni '
                  '<b>6° round</b> (6°, 12°...) e non ogni 4° come nelle spedizioni corte — '
                  'la cripta è lunga da percorrere. Le carte crescendo valgono come sempre.',
                  BODY)])
    c.showPage()
    # retro di copertina (parita' fronte/retro)
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 110*mm, W - 60*mm, 62*mm, [
        Paragraph('Lo tiene <b>una persona sola</b> — di solito chi pesca il mazzo Minaccia e '
                  'tiene il Registro delle Ferite. Quando il gruppo rivela una tessera, legge ad '
                  'alta voce la voce corrispondente sulla pagina seguente. Quando un eroe '
                  '<b>Cerca</b> o prova ad <b>aprire</b> qualcosa, gira il foglio e legge '
                  'l’esito di quella sola tessera: con lo stesso tono sia che ci sia un tesoro, '
                  'sia che non ci sia niente. Gli altri giocatori non leggono il retro.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_5:
        art_file = TILE_ART_5[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'dusty municipal archive.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_5[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_5.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 74*mm, W - 40*mm, 46*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 5</b> (PDF a parte). In campo: '
                  'i <b>Confratelli</b> (lenti, non arretrano; +1 Difesa adiacenti al '
                  'Salmodiante), gli <b>Adepti</b> (i manovali del cantiere), <b>Sgherri</b> '
                  'e <b>Sicario</b> (i carrettieri pagati) e <b>il Salmodiante</b> (il boss: '
                  'si desta in T6, o al 3° segnalino Canto). Vittoria: sfregiate le 3 canne '
                  'montate (Interagire in T6) e risalite da T1. Le casse di ossa in T5 sono '
                  'l’obiettivo secondario: ognuna salvata pesa nell’epilogo e nel Bivio. Ai '
                  'tavoli da 2-3 eroi il Salmodiante <b>non recupera mai ferite</b> dalle '
                  'carte Crescendo (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_5())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_5():
    """Miniature dell'Episodio 5. I 3 segnalini Canto usano le arti delle
    carte Crescendo dell'episodio."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x2) · SICARI (x1) · ADEPTI (x4)', [('Lo Sgherro.png', 2), ('Il Sicario.png', 1),
                                                      ('Adepto Incappucciato.png', 4)]),
        ('CONFRATELLI (x4)', [('Il Confratello.png', 4)]),
        ('SALMODIANTE', [('Il Salmodiante.png', 1)]),
        ('CANTO', [('La prima canna.png', 1), ('L’accordatura.png', 1),
                   ('Il registro pieno.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 5 - Soluzione (non aprire)')

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
        'solo dopo aver risposto per iscritto alle 4 Domande. La carta «I legni chiamano» va '
        'in una seconda busta, chiusa, con scritto «Bivio».',
        '<b>APERTURA — il Bivio dell’Episodio 4</b> (applicare PRIMA della lettera): se avete '
        '<b>DISTRUTTO LA CONCHIGLIA</b> — il Coro ha perso lo strumento gemello: la spedizione '
        'parte col Canto a 0; ma la città non vi ha perdonato il Comunale muto: rimuovete la '
        'Testimonianza «L’inserviente sputasentenze» (Luogo 3) dal mazzo Approfondimenti. Se '
        'l’avete <b>SIGILLATA</b> — la melodia impressa è vostra (Frammento 4-bis); ma ciò '
        'che è impresso chiama ciò che è d’ossa: mescolate la carta crescendo «I legni '
        'chiamano» nel mazzo Minaccia (22 carte).',
    ])
    pagina('la verità', [
        'Sotto la chiesa dei Battuti la cripta non fu mai svuotata: la sconsacrazione del '
        'Quarantuno la murò e basta. Lì il Coro sta costruendo lo strumento del <b>Terzo '
        'Movimento</b>: un organo con le canne fatte con le <b>ossa dei confratelli del '
        '1741</b> — l’acqua ricorda, e i corpi che cantarono ricordano meglio di tutto. Le '
        'ossa le procura <b>Zaccaria Mola</b>, becchino-capo del cimitero nuovo, pagato in '
        'contanti nuovi con autorizzazioni «vere»; dirige il cantiere il <b>Maestro dei '
        'Registri</b>, il contabile del Coro — tre cantieri già chiusi nei suoi schedari: '
        'fonderia, pozzi, teatro. Sono i vostri casi. Erano tutti UN cantiere.',
        'Il custode <b>Fedele</b> aveva trovato la breccia e stava rimurandola da solo, di '
        'notte, per paura: l’organo ha provato una nota con lui davanti, e il suo cuore no. '
        'Nella cripta canta il <b>Salmodiante</b>: un confratello del Quarantuno che non '
        'volle uscire quando murarono, e che la cera e il canto hanno conservato — la voce '
        'che «accorda» le ossa dei suoi fratelli da centocinquant’anni.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE si costruisce lo strumento?</b> Nella cripta murata dei Battuti, sotto '
        'il magazzino (lo confermano i carri che entrano al sagrato, il fascicolo della '
        'Curia e la calcina di Fedele). <i>Esatta:</i> scendete preparati — nel 1° round non '
        'si pesca nessuna carta Minaccia. <i>Sbagliata:</i> scendete alla cieca: 1 '
        'Confratello appare in T1 alla rivelazione.',
        '<b>2. CHI procura le ossa?</b> Zaccaria Mola, il becchino-capo. <i>Esatta:</i> '
        'fermato al cancello prima di mezzanotte, le ULTIME DUE CASSE non arrivano: in T5 '
        'due casse sono già in salvo (contano come recuperate). <i>Sbagliata:</i> nessun '
        'effetto.',
        '<b>3. QUALI ossa cercano?</b> Solo i confratelli del 1741 — le casse marcate '
        'con l’onda (lo confermano il registro delle riesumazioni, le lapidi rifatte e le '
        'casse mancanti all’ossario). <i>Esatta:</i> in T5 riconoscete le casse giuste a '
        'colpo d’occhio. <i>Sbagliata:</i> ogni cassa in T5 richiede prima una prova ACUME '
        '(Media): fallita, l’azione è spesa su una cassa qualunque (non conta).',
        '<b>Orologio inverso — la prova delle lapidi.</b> La prova fisica della Domanda 3 '
        '(le lapidi originali con l’onda) è al Cimitero Nuovo SOLO fino alle 21:00: dopo, '
        'i carri l’hanno portata dal marmista a farne polvere. Arrivate entro la 3ª ora '
        '(orologio a 18/19/20): il Cimitero conta come riscontro D3 e bloccate gli ultimi '
        'due carri — le due casse finali sono già in salvo in T5. Arrivate dopo: quel '
        'riscontro è perso; restano l’Ossario (aperto) e il Marmista (parola «lapidi '
        'rifatte»): due riscontri bastano ancora, ma il Marmista costa una parola e '
        'un’ora in più. Se non rimediate, la D3 resta sbagliata (ACUME per cassa in T5).',
        '<b>4. COSA portate con voi?</b> L’ACQUA DEL FONTE (la Parrocchia del Borgo): '
        'un’azione adiacente al Salmodiante — l’unica voce più vecchia della sua: Difesa '
        '8→5 per il resto della partita, e salta la sua prossima attivazione. <i>Nota per '
        'chi arbitra:</i> il Crocifisso Spezzato e l’Olio dei Morti sono esche — nessun '
        'effetto. Le Candele della Parrocchia sono oneste: +1 NERVI nel Corridoio degli '
        'Ossari, come da carta.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente solo tre carte — '
        'l’Osservazione «Le mani del becchino» (L1), il Referto «Le casse marcate» (L2) e '
        'la Testimonianza «L’inserviente sputasentenze» (L3). Se il gruppo non ne ha letta '
        'nessuna, giudicate con elasticità una risposta «vicina» (es. «qualcuno del cimitero '
        'nuovo, coi carri di notte»).',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo (0 ore avanzate): 1 '
        'gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio e boss', [
        '<b>Montaggio</b> (tessere in Episodio 5/board/, coperte tranne T1):<br/>'
        'T1 Scala del Sagrato (ingresso, da Sud) → T2 Navata Sepolta → T3 Corridoio degli '
        'Ossari (il passaggio obbligato, prova Difficile) → T4 Sala del Capitolo → a Est T5 '
        'Officina delle Canne d’Ossa (ramo: le casse) → a Nord T6 L’Organo Murato (il '
        'Salmodiante e lo sfregio).',
        '<b>Mazzo Minaccia:</b> le 21 carte dell’episodio (più «I legni chiamano» se il '
        'Bivio lo dice). Il Canto funziona come sempre: carte crescendo + 1 segnalino '
        'automatico ogni <b>6° round</b> (6°, 12°...) — non ogni 4°: la cripta è lunga da '
        'percorrere. Alla soglia (3 segnalini) il Salmodiante si desta in '
        'anticipo (piazzatelo sulla tessera più lontana dagli eroi, con 1 Confratello di '
        'scorta) e da quel momento ogni Fase Minaccia pesca 1 carta in più, per sempre.',
        '<b>Il Salmodiante</b> (statistiche nel Bestiario; Ferite per taglia già tabellate): '
        'si desta quando rivelate T6, o in anticipo col Canto. La sua debolezza è la Domanda '
        '4. <b>Due finali di vittoria:</b> potete risalire senza sfregiare l’organo — ma la '
        'prova d’organo si farà (epilogo peggiore, non sconfitta). Ogni cassa salvata in T5 '
        'pesa nell’epilogo e nel Bivio. Il Maestro dei Registri NON si cattura: fugge dalla '
        'condotta alla rivelazione di T6 (è il filo dell’Episodio 6).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «L’organo sfregiato '
        'non suonerà — non questa marea. Il becchino Mola confessa tutto tranne una cosa: '
        '“il compenso non l’ho mai contato. Certe cifre si prendono senza contarle, sennò '
        'si scappa.” Fedele ha il funerale che avrebbe voluto: silenzioso. E negli schedari '
        'del Maestro dei Registri, tre cantieri chiusi portano i nomi dei vostri casi: '
        'fonderia, pozzi, teatro. Qualcuno tiene la contabilità della vostra città da molto '
        'prima che voi arrivaste.» — Se avete salvato casse di ossa: annotate quante sul '
        'Frammento. Se ne mancano: il registro dell’organo, da qualche parte, non è vuoto.',
        '<b>FRAMMENTO DI CAMPAGNA N. 5:</b> <i>«Il Dormiente non dorme sotto la città. Il '
        'Dormiente È la città: canali per vene, campane per denti — e il coro gli fa da '
        'respiro.»</i> Conservatelo per il finale di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> Le ossa salvate:<br/>'
        '<b>Riconsacrarle e seppellirle.</b> Il requiem che il Quarantuno non ebbe: '
        'l’Episodio 6 parte col Canto a 0, e la Litania di Marani vale doppio. Ma la mappa '
        'incisa sulle canne va sottoterra con loro: un incrocio in meno alla deduzione '
        'd’atto dell’Episodio 6.<br/>'
        '<b>Tenerle come prova e strumento.</b> Un incrocio in più alla deduzione d’atto '
        'dell’Episodio 6. Ma le ossa chiamano: il mazzo dell’Episodio 6 aggiunge 1 carta '
        'crescendo.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 5 e non parlatene più fino '
        'all’Episodio 6.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite — Tempra, Fibra, '
        'Revolver, Lanterna schermata, Borsa di garze (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI5_DESC = {
    1: "Sa di iuta e di segatura, e sotto quell’odore da magazzino resta quello che le chiese non "
       "perdono: cera vecchia, pietra bagnata, un principio di muffa nei pilastri. Il comune è "
       "entrato qui come un inquilino che non ha chiesto permesso — scaffalature su per le navate, "
       "casse dove stavano i banchi, i cartellini d’inventario inchiodati alla pietra — ma le volte "
       "sono rimaste padrone di casa, e ogni cassa che qualcuno posa torna indietro dall’alto un "
       "istante più tardi di quanto dovrebbe. Fra due scaffalature, in un corridoio che nessuno "
       "attraversa più, un lenzuolo copre Fedele fino alle scarpe. Gli inservienti lavorano attorno "
       "a mezza voce e si passano le cose senza chiamarsi; e quando ripetono ciò che il custode "
       "andava dicendo negli ultimi giorni, si voltano prima verso la porta: «quello non conta le "
       "casse. Conta i PASSI.» La luce dei finestroni alti scende in due lame oblique e si ferma "
       "sempre a qualche passo dalla parete di fondo, dove il pavimento è pulito in una striscia "
       "larga un carro. A terra, dove la striscia finisce, una cazzuola è rimasta posata con la "
       "calcina addosso, indurita a metà.",
    2: "L’ossario è asciutto come una madia e ha lo stesso odore: legno vecchio, polvere buona, un "
       "fondo di canfora che qualcuno rinnova a ogni primavera. Corridoi di scaffali salgono fino "
       "al soffitto, cassette di legno una accanto all’altra con le etichette scritte a mano da tre "
       "generazioni di custodi — inchiostri diversi, grafie diverse, la stessa cura da libro "
       "mastro. In fondo, dove il soffitto si abbassa, una finestrella a bocca di lupo lascia "
       "entrare una lama di luce in cui la polvere non si muove: qui non tira aria, e la "
       "temperatura è la stessa d’inverno e d’agosto. Il custode vi accompagna con la lanterna "
       "tenuta bassa e non la alza mai sopra la "
       "propria testa; parla piano, e le mani gli restano dietro la schiena come a un uomo che "
       "visita un ospedale: «le ricognizioni le fa la Curia. Ma la Curia qui non viene da "
       "vent’anni.» Dove la fila si interrompe, il legno del ripiano resta di un colore più chiaro, "
       "rettangoli netti che la polvere attorno disegna meglio di un gesso. Quando passate, la "
       "fiamma della lanterna fa scorrere le etichette come le pagine di un registro sfogliato da "
       "qualcun altro. Su un ripiano a mezza altezza una cassetta è stata rimessa a posto al "
       "contrario, con l’etichetta girata verso il muro.",
    3: "Odora di ghiaia bagnata e di cipresso, quell’odore verde e amaro che il vento tira giù "
       "dagli alberi alti quando la sera si abbassa; e qui dentro fa più fresco che nella strada "
       "che ci porta, di parecchi gradi, come in una cantina all’aperto. Il cimitero è nuovo da "
       "sessant’anni: viali rastrellati, file ordinate, i vasi allineati come in una piazza di case "
       "basse. Le transenne di legno attorno a certe fosse sono l’unica cosa storta del posto, e la "
       "vernice ci si è già scolorita sopra. In alto i cipressi si muovono tutti insieme e con un "
       "ritardo che il vento sul viso non spiega, come se lassù ne passasse un altro. Un "
       "inserviente stacca le mani dalla pala, si asciuga "
       "la fronte con l’avambraccio e sputa di lato prima di parlare, con la voce di chi non teme "
       "di essere sentito perché tanto nessuno ascolta: «Manutenzione di cosa, se là sotto non c’è "
       "più nessuno?» In fondo al viale, il cancello di servizio ha l’erba consumata in due strisce "
       "parallele, larghe da carro, e le strisce sono più fresche dell’erba che le separa. Accanto "
       "a una fossa transennata la terra di scavo è ammucchiata da settimane, e sopra il mucchio "
       "l’erba è già ricresciuta.",
    4: "La Parrocchia del Borgo sa ancora di cera d’api e di lisciva, l’odore delle chiese povere "
       "tenute pulite meglio delle ricche; è la stessa dell’inverno dei pozzi, e i banchi portano "
       "lo stesso lucido di gomiti sugli spigoli. L’organo piccolo tiene la sua canna storta in "
       "seconda fila, come un dente che nessuno raddrizza più; davanti all’altare il lume del "
       "Sacramento è l’unica fiamma accesa, e si piega verso la sacrestia ogni volta che una porta "
       "si muove in fondo alla casa — sempre di quel poco, sempre da quella parte. Sui muri gli "
       "ex voto d’argento sono appesi a grappoli, cuori e gambe e occhi di gente guarita "
       "cent’anni fa, e la cera delle candele si è accumulata sotto la mensola in una colata che "
       "arriva al pavimento. Il sagrestano vi "
       "viene incontro con le mani già asciugate sul grembiule, come chi aspettava; vi riconosce, e "
       "per una volta parla lui per primo. Quando arriva all’anello delle chiavi che non aprono più "
       "niente lo posa sul tavolo senza consegnarvelo, e ci tiene sopra un dito solo: «Se la "
       "prendete, non ditemi per cosa.» Nel ripostiglio della sacrestia un telo grigio copre "
       "qualcosa d’alto quanto un uomo seduto; un angolo del telo è stato rialzato di fresco e "
       "lasciato ricadere male.",
    5: "In Vicolo delle Croci le case sanno di muro umido e di cavolo bollito; questa no. Questa sa "
       "di vernice fresca e di cera da mobili, e il calore che arriva dalla porta socchiusa è "
       "quello di una stufa tenuta accesa tutto il giorno, cosa che in un vicolo così non fa "
       "nessuno. Dentro, la credenza odora ancora di falegname, la stufa smaltata non ha una "
       "bruciatura, e accanto alla porta le scarpe dei figli stanno in fila per misura, buone, di "
       "cuoio, con le suole ancora chiare. Al chiodo dietro l’uscio, dove nelle case di qui sta "
       "il cappotto buono, non c’è niente, e il calcinaccio attorno al chiodo è più chiaro. I "
       "figli stanno seduti in fila sulla panca e non litigano, il che a quell’età non si spiega "
       "con l’educazione. La moglie di Mola vi lascia entrare senza domandare chi "
       "siete e continua a passare lo straccio mentre parla, sugli stessi mobili, due volte, tre; "
       "ha gli occhi rossi da prima che arrivaste e li tiene bassi sul legno. Del ripostiglio parla "
       "come si parla di una stanza in cui non si entra: «le pale nuove», dice, «portano male ai "
       "vivi». Sul pagliericcio la coperta è rifatta storta, tirata da un lato solo, come da chi si "
       "alza sempre dalla stessa parte.",
    6: "In Corte del Ragioniere è l’unica porta senza la targa consumata; dentro, l’odore è di "
       "lampada a petrolio e di carta nuova, e manca del tutto quel tabacco freddo che hanno gli "
       "uffici dove si lavora davvero. Il paralume verde tinge di verde anche il legno del banco; i "
       "calamai sono colmi fino all’orlo, allineati, coi pennini asciutti. Sugli scaffali i "
       "registri stanno in ordine di formato e hanno i dorsi scoloriti dal sole, che qui, con le "
       "persiane accostate a ogni ora, non entra da nessuna parte. Il campanello sopra la porta è "
       "unto e non suona; la maniglia, invece, è lucida come quella di un caffè. Il praticante si "
       "alza appena vi "
       "vede, si tira le maniche di lustrino sui polsi e ripete la sua frase come si ripete una "
       "preghiera imparata da bambini: «il titolare è fuori per inventari». Poi torna a copiare, e "
       "la penna riprende esattamente dalla lettera dov’era rimasta, senza rileggere. Sulla sedia "
       "d’attesa più vicina alla porta il velluto è consumato fino alla trama, e nel mezzo tiene "
       "ancora l’incavo di chi ci si è seduto.",
    7: "Tre stanze in fondo a un corridoio della Curia, e a ogni porta l’aria cambia di poco e "
       "sempre nello stesso verso: ceralacca, poi carta, poi quel principio d’aceto che hanno i "
       "locali dove si lucida l’ottone. Gli armadi d’archivio sono blindati e verniciati di nero, "
       "con le maniglie tenute lucide dalle mani e non dallo straccio; le finestre alte hanno le "
       "persiane accostate anche di giorno, e la luce che resta basta appena a leggere i cartellini "
       "delle annate. Sul ripiano più basso, in fila, i sigilli di piombo delle annate morte "
       "pendono dai loro spaghi e si toccano appena, con un tintinnio da tazzine, ogni volta che "
       "qualcuno cammina nella stanza accanto. Il cancelliere è un vecchio che si alza puntando le "
       "due mani sul piano della "
       "scrivania e vi guarda sopra gli occhiali, non attraverso: «gli archivi diocesani non sono "
       "un pubblico passeggio», dice, ed è già in piedi verso lo scaffale giusto. Mentre cammina, i "
       "cartellini appesi alle ante si muovono uno dopo l’altro, ciascuno in ritardo di un passo su "
       "di lui. Sulla scrivania, a destra del tampone, un cassetto solo ha la toppa, e attorno alla "
       "serratura la vernice è consumata a mezzaluna.",
    8: "Il deposito si sente in bocca prima che nel naso: polvere di marmo, un gusto di gesso e "
       "d’acqua ferma che resta sui denti per un’ora. È un giardino di pietre in attesa — file di "
       "lastre bianche appoggiate ai cavalletti, angeli fermi a metà con le ali ancora dentro il "
       "blocco, nomi già incisi di gente che passa a controllarli da viva — e su ogni cosa la "
       "stessa polvere chiara, che sui davanzali è alta un dito. Contro la parete della bottega "
       "gli attrezzi sono appesi per taglia sopra la loro sagoma disegnata a carboncino, e due "
       "sagome restano scoperte. Fa freddo come in una ghiacciaia, di quel freddo che viene dalla "
       "pietra e sale per le gambe, e nessuna delle due stufe è accesa. Il marmista non alza gli "
       "occhi dal "
       "suo scalpello: ha le mani bianche fino al polso, il mazzuolo che batte a tempo, e continua "
       "a battere anche mentre vi risponde, con una pausa sola in tutta la frase: «i preventivi il "
       "giovedì». La polvere gli si posa sulle spalle mentre lavora e lui non se la scrolla mai. In "
       "fondo, contro il muro e voltate a faccia in giù, stanno appoggiate certe pietre vecchie, "
       "col muschio ancora attaccato lungo il bordo.",
    9: "Il sagrato dei Battuti è un fazzoletto d’erba matta fra il fianco della chiesa e il muro di "
       "cinta, e ci si arriva da una calle in cui l’aria si ferma: pietra bagnata, ortica, acqua "
       "che ristagna sotto l’erba anche quando non piove da giorni. Due cipressi che nessuno pota "
       "tengono il posto in ombra a ogni ora; contro il muro stanno una carriola rovesciata e mezza "
       "dozzina di vasi vuoti, accatastati da qualcuno che contava di tornare. Il fianco della "
       "chiesa è cieco fin quasi al tetto, e le poche finestre basse sono murate con mattoni di un "
       "rosso più nuovo del muro; a metà parete resta la mensola vuota di una statua, con sopra "
       "la macchia scura dove la pioggia scendeva attorno a qualcosa. Il silenzio è quello "
       "speciale dei luoghi che nessuno attraversa — e in mezzo a quel silenzio l’erba resta "
       "piegata in una striscia sola, larga una spalla, che va dal cancelletto alla porticina della "
       "sagrestia vecchia; la rugiada della notte la rialza, e il mattino dopo è piegata di nuovo. "
       "Da sotto la porta esce un filo d’aria che sa di cera. Sulla toppa nera, incisa di flagelli "
       "incrociati, il ferro è lucido in un punto solo, all’altezza della mano.",
}

OGGETTI_LUOGO_5 = {
    1: ['Il Crocifisso Spezzato'],
    4: ['L’Acqua del Fonte', 'Le Candele della Parrocchia', 'La Chiave del Sagrato'],
    5: ['L’Olio dei Morti', ('Reperto A', 'il Registro di Mola', '')],
    6: [('Reperto B', 'l’Autorizzazione Timbrata', '')],
    9: [('Reperto C', 'il Diario di Fedele', '')],
}

TILE_ART_5 = {t['id']: t['id'] + '-ep5.png' for t in TILES_5}
LUOGHI5_CROP = {}

TESSERE_DESC_5 = {
    'T1': "L’aria che sale dal buco è più tiepida di quella del sagrato, e questo, in una scala di "
          "pietra che scende sotto un cimitero, non torna. I gradini sono stretti e alti, e il "
          "centro di ciascuno è scavato a conca da duecento anni di piedi passati sempre nello "
          "stesso punto; le pareti, a mezza altezza, hanno la lucidatura scura delle spalle che le "
          "hanno sfiorate. La botola si richiude sopra di voi col peso di una lapide e il rumore di "
          "una lapide, e per qualche secondo nessuno dice niente. La pietra dei muri suda: ci si "
          "appoggia una mano e la si ritira bagnata, e l’intonaco, dove c’era, è caduto in "
          "placche che stanno ancora sui gradini come gusci. Più giù il suono cambia natura: "
          "non lo sentite più con le orecchie ma con i denti e con lo sterno, una nota bassa e "
          "continua che non prende fiato mai e che si fa più fitta di gradino in gradino senza "
          "farsi più forte. Le fiamme delle vostre candele si piegano tutte insieme verso il basso, "
          "come tirate. Sul terzo gradino dal fondo, una goccia di cera nera è colata di fresco e "
          "non si è ancora indurita del tutto.",
    'T2': "Una chiesa intera, sepolta in piedi: la navata ha tenuto la sua altezza, e l’eco ci gira "
          "dentro con l’agio di una stanza grande, ma torna sorda, come coperta da un panno. Sa di "
          "legno bagnato e di terra, e non c’è un filo d’aria — le fiamme stanno dritte come "
          "dipinte. I banchi marci tengono la fila per due secoli di fedeli che non sono venuti, il "
          "legno gonfio e nero, gli inginocchiatoi ceduti nel mezzo; l’altare è spogliato fino alla "
          "pietra viva; lungo la parete, ai loro ganci, pende ancora una fila di discipline di "
          "corda, e le corde sono marcite tutte alla stessa altezza — quella a cui, un tempo, "
          "arrivava l’acqua. Sulle pareti gli affreschi dei flagellanti hanno colori che di "
          "sopra non "
          "esistono più: il buio li ha custoditi meglio del sole, e i sai dipinti sono di un nero "
          "che regge la luce senza scolorire. Camminando, la polvere si alza dai banchi al vostro "
          "passaggio e resta sospesa nella luce molto dopo che siete oltre. Sulla mensa "
          "dell’altare, al centro, la pietra è più chiara nella forma esatta di una croce che non "
          "c’è.",
    'T3': "Il corridoio è foderato di nicchie da terra al soffitto, e le nicchie sono piene: ossa "
          "incassate nei muri per file e per taglia, con l’ordine di una biblioteca di provincia — "
          "femori come dorsi di volumi, crani in prima fila come i libri che si consultano spesso. "
          "Qui il canto non arriva dal fondo: corre lungo le pareti, e lo si sente cambiare mano "
          "passando da un osso all’altro, come una mano che scorra i tasti senza premerli; e ogni "
          "volta che la nota si sposta, nella nicchia che ha appena lasciato resta un tremito "
          "brevissimo, che si vede nella polvere e non si sente. Sa di "
          "polvere asciutta e di calce, e la polvere è pallida, finissima, e si posa sulle spalle "
          "senza che ve ne accorgiate. A metà corridoio le fiamme si piegano tutte nella stessa "
          "direzione, verso nord, e restano piegate: da qualche parte, davanti a voi, quest’aria "
          "viene bevuta. In una nicchia all’altezza del petto, un cranio di prima fila ha gli "
          "incavi ancora pieni di polvere e la fronte pulita, lucida come il corrimano di una scala "
          "molto usata.",
    'T4': "La sala del capitolo è ottagonale e più asciutta del resto della cripta: qui la pietra è "
          "rimasta tiepida quanto basta perché la polvere non si impasti, e l’aria sa di cenere "
          "fredda. Il cerchio dei sedili gira lungo il muro, consumato al centro di ciascun posto; "
          "lo stallo del priore è più alto di un gradino, con lo schienale scolpito a flagelli, e "
          "di lassù si vede l’intera sala senza girare la testa. Alle pareti, fra un sedile e "
          "l’altro, restano i chiodi in fila delle tavole degli obiti, e le tavole non ci sono "
          "più: solo il legno del muro più chiaro, rettangolare, uno per ogni chiodo. Sul tavolo "
          "di pietra, che ha il "
          "bordo lucido di gomiti di due secoli, stanno cose che in questa stanza non sono mai "
          "state: registri nuovi con la costola ancora rigida, un calamaio, un panno piegato per i "
          "pennini, un calendario di maree tenuto fermo da un sasso. Una candela nera brucia in un "
          "piattino e non cola da nessun lato, benché la fiamma tremi. Sul cuscino dello stallo del "
          "priore, che nessuno occupa, resta l’impronta di un peso, e la polvere attorno è spinta "
          "verso i bordi.",
    'T5': "Il caldo si sente tre passi prima della porta, e col caldo l’odore: colla d’ossa che "
          "sobbolle, un odore dolce, di brodo dimenticato sul fuoco, che si attacca ai vestiti e "
          "non se ne va più. Sotto le volte, banchi da liutaio: seghe fini appese per taglia dalla "
          "più piccola alla più grande, morsetti in fila, un fornello col pentolino che fa la "
          "pelle, la rompe e la rifà. I trucioli sotto i banchi sono pallidi e leggeri, e non sono "
          "di legno. Sul banco più grande, sotto un fermacarte, sta un disegno a inchiostro con le "
          "misure delle canne una accanto all’altra, e la mano che l’ha tracciato ha rifatto la "
          "stessa riga tre volte prima di accontentarsi. In rastrelliera stanno le canne finite, "
          "femori innestati l’uno nell’altro e "
          "incerati fino a diventare lisci come manici di coltello; contro il muro le casse "
          "dell’ossario sono accatastate in ordine, ancora chiuse. Ogni tanto una canna della "
          "rastrelliera prende a vibrare da sola, tiene la nota qualche secondo e smette. In una "
          "morsa, una canna a metà è ferma con la sega posata di traverso e il segno a matita "
          "ancora da tagliare.",
    'T6': "Oltre la breccia l’abside è diventata una cassa armonica, e lo strumento lo sentite nel "
          "petto prima di vederlo: la nota bassa arriva addosso come una spinta piana, e la polvere "
          "sul pavimento salta a ogni ripresa. L’organo sale verso la volta per file — canne d’ossa "
          "montate dalla più corta alla più lunga, incerate, di una lucidatura recente; i mantici "
          "di cuoio chiaro si alzano e si abbassano piano anche quando nessuno li tocca, e le "
          "impalcature lo tengono su per tre lati con la cura di un cantiere di cattedrale, i "
          "palchi spazzati, le corde arrotolate e appese al loro posto. Davanti "
          "alla tastiera un saio canta, e non si ferma, e non prende fiato: la cera gli è colata "
          "addosso per anni fino a fargli una veste sola. In alto, dove la volta si chiude, una "
          "condotta beve aria di canale e la porta via fredda; nel suo imbocco, per un istante, "
          "passa una sagoma magra coi libri sotto il braccio. Sul leggio non c’è spartito: solo il "
          "legno lucidato da due mani, sempre negli stessi due punti.",
}

ESAMI_CARBONE_5 = {
    'AUTORIZZAZIONE TIMBRATA': '«Il timbro è vero e la firma è di nessuno: inchiostro da '
                'registro, mano da amanuense — la stessa piega professionale delle carte '
                'di C.B., ma qui la mano è un’altra. Chi presta i timbri non firma mai in '
                'proprio: affitta la propria assenza.»',
    'ACQUA DEL FONTE': '«L’ampolla è del Seicento, la cera del sigillo è d’Ottocento: '
                'qualcuno la richiude a ogni generazione, con cura da consegna. La '
                'Parrocchia non custodiva un cimelio: custodiva un’ARMA, e lo sapeva da '
                'centocinquant’anni.»',
    'CROCIFISSO SPEZZATO': '«Spezzato non dalla caduta: piegato a mani nude, verso '
                'l’esterno, con le impronte di Fedele ancora nella cera dei pollici. '
                'L’ha rotto lui stesso — come chi smette di credere. O come chi comincia, '
                'e capisce che il suo dio, là sotto, non è quello giusto.»',
}

OGGETTI_TESSERA_5 = {'T2': ['Una Lanterna d’Altare'],
                     'T5': ['Uno Scalpello da Liutaio']}


def luoghi():
    """Luoghi.pdf Episodio 5 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'nervous priest in a candlelit sacristy.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 5 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_5, 'Episodio 5')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_5.get(n, []))

    for L in LUOGHI_5:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI5_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI5_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_5)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_5
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL SALMODIANTE', 'IL CONFRATELLO', 'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 5')
    print('OK episodio 5')
