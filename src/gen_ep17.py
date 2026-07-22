# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 17: Lo scisma (Episodio 17/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-17.md e CAMPAGNA-EPISODI.md). Atto III,
mythology, IL PICCO: il decano rapito, un dossier cifrato nel camino (la matrice
delle doppie letture di M.), la Società spaccata da una «caccia alla talpa» che
è l'insabbiamento di M. Il decano è VIVO, rapito dal Notaio (l'ultimo lavoro).
Spedizione: la villa-prigione fuori porta, recuperare il decano e catturare il
Notaio (ricorrente Ep.13-15, finalmente preso). Boss: la Guardia del Notaio.
Un solo seme: la matrice decifrata + le parole del decano.

Varietà strutturale (regola 2026-07-18): il picco — meccanica MORALE (malus
NERVI da scisma finché non si trova il decano vivo); mazzo pieno; payoff del
ricorrente (il Notaio catturato). Torsione d'indagine: «il caso contro di voi»
(la caccia alla talpa: indagate mentre siete indagati).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 17.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 17', 'pdf')
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

LETTERA_17 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Il decano Ferrante è scomparso nella notte, e il suo studio è a soqquadro — ma di una mano "
    "<i>educata</i>. C’è un <b>traditore</b> in casa nostra, amici miei: qualcuno ha venduto il "
    "decano a C.B. Apro la caccia alla talpa, e vi voglio con me.<br/><br/>"
    "Cominciate da chi ha visto Ferrante per ultimo… ma siate prudenti: a volte il traditore è "
    "l’ultimo che sospettereste. Persino uno di voi. E se trovate, murato nel camino del decano, "
    "un certo dossier cifrato — portatelo a me, e a nessun altro. Avete <b>6 ore</b>, dalle 18:00 "
    "alle 24:00.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: lo Studio del Decano, l’Assemblea della Società (il Palazzo "
    "del Lume), il Tribunale e lo Studio del Notaio. Gli altri andranno sbloccati; la Villa-Prigione "
    "è fuori porta (dichiararla costa 2 ore). ATTENZIONE — lo SCISMA: finché non trovate il decano "
    "vivo, gli eroi hanno −1 ai NERVI.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «lo studio a soqquadro» (L1+L2), «la caccia alla talpa» (L2+L3+L4),
# «il dossier cifrato» (L1+L3+L4). Rivelatorio (D2) su L2, L3, L4.
LUOGHI_17 = [
    dict(n=1, nome='LO STUDIO DEL DECANO', voce_mappa='Lo Studio del Decano',
         req='Disponibile dall’inizio', art='Lo Studio del Decano.png',
         chiude=None,
         indizi=[
             'Lo studio a soqquadro, ma di una violenza educata: cassetti aperti con metodo, niente '
             'rotto. «Non un furto, signori: una perquisizione. Chi è venuto cercava una cosa sola, '
             'e l’ha cercata sapendo dove guardare. Lo studio a soqquadro è la firma di chi non ha '
             'fretta perché ha le chiavi.»',
             'Murato nel camino, dietro un mattone smosso, un dossier cifrato: pagine su pagine di '
             'confronti tra le lettere d’incarico di M., dal 1885, annotate in una cifra tutta del '
             'decano. <i>(Il dossier cifrato: serve la Cifra del decano per leggerlo.)</i>',
             'Sul tavolo, l’ultimo appunto del decano prima di sparire: «se mi succede qualcosa, non '
             'è la talpa. Non c’è nessuna talpa. Guardate chi vi dirà che c’è.» La grafia trema: '
             'sapeva che stavano venendo a prenderlo.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La perquisizione educata',
                  testo='Chi ha messo a soqquadro lo studio del decano non era un ladro né un '
                        'rapitore comune: sapeva cosa cercare (il dossier cifrato) e aveva tempo e '
                        'chiavi. Non ha rotto nulla, non ha rubato i valori, non ha lasciato tracce '
                        'di scasso. È entrato come si entra in casa propria. E l’ultimo appunto del '
                        'decano lo dice chiaro: non temeva una talpa. Temeva chi la talpa la avrebbe '
                        'inventata — per spiegare la sua sparizione senza sospetti su di sé.'),
         ]),
    dict(n=2, nome='L’ASSEMBLEA DELLA SOCIETÀ', voce_mappa='Il Palazzo del Lume',
         req='Disponibile dall’inizio', art='Palazzo del Lume.png',
         chiude=None,
         indizi=[
             'Il Palazzo del Lume è spaccato in due: M., grave e addolorato, guida la caccia alla '
             'talpa; metà Società lo segue, l’altra metà guarda voi — gli ultimi ad aver parlato col '
             'decano. «Lo studio a soqquadro, il decano sparito, e un traditore tra noi. Chi, se non '
             'uno che aveva accesso?»',
             'M. parla con dolore misurato: «trovate la talpa, amici. Ma portate a me ogni indizio '
             'interno, prima che a chiunque. La casa deve restare unita.» Ogni filo passa da lui: la '
             'caccia alla talpa è tutta nelle sue mani.',
             'Un confratello anziano, in disparte, vi sussurra: «non mi torna. Perché il presidente '
             'ha annunciato la talpa <i>prima</i> ancora che cercassimo? Come faceva a sapere che '
             'c’era un traditore, se il decano è sparito solo stanotte? A meno che l’ultimo lavoro '
             'del Notaio non l’avesse ordinato lui.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il confratello anziano',
                  testo='«Ve lo dico sottovoce perché ho paura: la caccia alla talpa è cominciata '
                        'troppo in fretta, troppo sicura. Il presidente sapeva del traditore prima '
                        'di cercarlo — perché il traditore non esiste. È una storia che serve a '
                        'spiegare perché il decano è sparito, e a tenere ogni indizio nelle mani di '
                        'M. Il decano non è stato venduto da uno di noi: è stato preso su ordine di '
                        'chi ora ci aizza gli uni contro gli altri. Guardate l’ultimo lavoro del '
                        'Notaio, e capirete.»'),
         ]),
    dict(n=3, nome='IL TRIBUNALE', voce_mappa='Il Tribunale',
         req='Disponibile dall’inizio', art='Il Tribunale.png',
         chiude=None,
         indizi=[
             'Al Tribunale, la cella di Braga. Se lo avete protetto (Ep. 15), vi manda il suo '
             'archivio con un biglietto: «Vincete voi. Guardate le penne, non le mani.» '
             '<i>(Esca-lore: il Biglietto di Braga — vero e prezioso per la fine, ma nessun '
             'vantaggio ora.)</i> Se lo avete avallato, la cella è vuota: Braga è morto nel sonno.',
             'I secondini ricordano visite notturne «da parte di un signore in guanti, gentile, con '
             'carte in regola». La caccia alla talpa passa anche di qui: qualcuno ha voluto Braga '
             'zitto prima che parlasse. Il dossier cifrato spiegherà perché.',
             'Tra gli atti, la firma ricorrente di uno studio notarile su ogni pratica di C.B. '
             'trattata dal Tribunale: il Notaio Rasca. «La caccia alla talpa guarda dentro la '
             'Società; ma le carte guardano fuori, allo studio del Notaio.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le penne, non le mani',
                  testo='Il biglietto di Braga è un lascito da criminologo: «guardate le penne, non '
                        'le mani». Le mani che hanno preso il decano sono quelle del Notaio e dei '
                        'suoi; ma la penna che ha scritto l’ordine è un’altra. Braga, che ha studiato '
                        'M. per trent’anni, sa che il presidente non sporca mai le proprie mani: '
                        'firma, e paga. La caccia alla talpa è un teatro di mani; la verità è in una '
                        'penna sola. Tenete il biglietto: alla fine, saprà di che penna si tratta.'),
         ]),
    dict(n=4, nome='LO STUDIO DEL NOTAIO', voce_mappa='Lo Studio del Notaio',
         req='Disponibile dall’inizio', art='Lo Studio del Notaio.png',
         chiude=None,
         indizi=[
             'Lo studio del Notaio Rasca è chiuso, Rasca sparito da ieri. Ma le pratiche restano, e '
             'raccontano l’ultimo lavoro: un affitto di villa fuori porta, un nolo di carrozza '
             'notturno, «assistenza per un trasferimento riservato». La caccia alla talpa non vi '
             'porterà qui; le carte del Notaio sì.',
             'Sul registro, l’ultimo incarico protocollato tre giorni fa: «custodia e interrogatorio '
             'riservato, per conto del cliente di sempre». Il dossier cifrato, se decifrato, dirà chi '
             'è il cliente di sempre. Rasca lo sa, e per questo è sparito con lui.',
             'Un praticante terrorizzato: «il Notaio è andato alla villa fuori porta, quella dei suoi '
             'lavori sporchi. Ha portato uomini e una carrozza chiusa. Se cercate il decano, non '
             'cercate una talpa qui dentro: cercate quella villa.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il praticante del Notaio',
                  testo='«Il Notaio Rasca è l’uomo che fa sparire le persone con le carte in regola: '
                        'un affitto, un nolo, una custodia "riservata", e nessuno può dire che sia un '
                        'rapimento. L’ultimo lavoro è il decano: preso, portato alla villa fuori '
                        'porta, interrogato con garbo per sapere quanto sa la Società. Non c’è talpa, '
                        'signori. C’è un notaio che esegue e un cliente che paga. E il cliente, giuro '
                        'su Dio, non è fuori dalla vostra Società. È in cima.»'),
         ]),
    dict(n=5, nome='L’AULA DEL CIFRARIO', voce_mappa='L’Aula del Cifrario',
         req='L’aula dove il decano insegnava apre solo a chi ha trovato la sua opera nascosta: lo '
             'studio a soqquadro e ciò che vi era murato.',
         chiave=('parola', 'LO STUDIO A SOQQUADRO'), art='L’Aula del Cifrario.png',
         chiude=20,
         indizi=[
             'L’aula del cifrario, dove il decano insegnava la crittografia della Società. Tra i '
             'suoi appunti, la chiave del suo codice personale. <i>(Oggetto: prendete la Cifra del '
             'Decano.)</i> Con questa, il dossier cifrato si apre come un libro.',
             'Decifrato, il dossier è una matrice: ogni lettera d’incarico di M. dal 1885 in colonna, '
             'e di fronte ciò che M. sapeva prima del dovuto. <i>(Reperto A: consegnate il Dossier '
             'Cifrato del Decano — la matrice delle doppie letture.)</i> Il seme della deduzione '
             'finale.',
             'In fondo, una riga del decano: «non ho cercato una talpa. Ho cercato lo specchio. E '
             'ogni volta che ho confrontato una lettera con ciò che seguì, lo specchio mi ha '
             'restituito la stessa faccia. La nostra.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La matrice delle doppie letture',
                  testo='Il dossier del decano, decifrato con la sua Cifra, non è un elenco di '
                        'sospetti: è una matrice. Mette in colonna ogni lettera d’incarico di M. e, '
                        'di fronte, la cosa che M. sapeva prima del dovuto — un nome, un luogo, un '
                        'morto, un nastro verde. Dal 1885, nessuna eccezione. Il decano non stava '
                        'cercando chi tradiva la Società: stava dimostrando che il traditore la '
                        'guida. Con questa matrice, ogni vecchia lettera che avete riletto diventa '
                        'un incrocio per il giorno del giudizio.'),
         ]),
    dict(n=6, nome='IL MEMBRO INTERNO', voce_mappa='Il Membro Interno',
         req='Chi la caccia alla talpa addita apre la sua porta solo a chi entra nel gioco di M.: '
             'il sospetto interno, il presunto traditore.',
         chiave=('parola', 'LA CACCIA ALLA TALPA'), art='Il Membro Interno.png',
         chiude=None,
         indizi=[
             'Il confratello che la caccia alla talpa addita: un uomo mite, terrorizzato, con indizi '
             'che lo incastrano spuntati dal nulla. <i>(Esca: la Talpa Fittizia — un innocente '
             'costruito come colpevole; seguirla è fare il gioco di M.)</i>',
             '«Non ho fatto niente!» piange. «Ieri ho trovato in tasca una lettera che non ho mai '
             'scritto, che mi accusa. Qualcuno me l’ha messa. Chi vuole una talpa, se la fabbrica: '
             'ho visto come si arreda una colpa, con Braga. Adesso tocca a me. O a voi.»',
             'Gli indizi contro di lui sono troppo puliti, troppo pronti — come il dossier di Braga. '
             'La stessa mano che ha arredato la colpa del professore arreda ora quella di un '
             'confratello, per dare un volto alla talpa che non esiste.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La talpa fabbricata',
                  testo='La talpa è un capolavoro di scena, come il caso Braga: indizi troppo puliti, '
                        'spuntati troppo al momento giusto, contro un innocente incapace di '
                        'difendersi. Serve a due cose: dare alla Società un colpevole da odiare (così '
                        'nessuno cerca più in alto), e tenervi occupati a processare un povero '
                        'confratello mentre il decano viene interrogato e il Notaio copre le tracce. '
                        'Seguire la talpa fittizia è perdere. La vera domanda non è chi sia la talpa. '
                        'È perché a qualcuno serva tanto che ce ne sia una.'),
         ]),
    dict(n=7, nome='LA DOGANA VECCHIA', voce_mappa='La Dogana Vecchia',
         req='La Dogana Vecchia apre i suoi registri a chi legge tra le righe del decano: il dossier '
             'cifrato e la carrozza che porta fuori porta.',
         chiave=('parola', 'IL DOSSIER CIFRATO'), art='La Dogana Vecchia.png',
         chiude=None,
         indizi=[
             'Alla Dogana Vecchia, il transito notturno di una carrozza chiusa del Notaio, tre notti '
             'fa, verso la campagna. «Carte in regola, custodia riservata. Dazio pagato. Il solito '
             'nolo del signor Rasca.» Il decano era là dentro.',
             'Il doganiere, sottovoce, vi porge un lasciapassare del Notaio: <i>(Oggetto: prendete '
             'il Salvacondotto — passate i posti di blocco della villa, arrivate al decano prima del '
             'trasferimento.)</i> «Con questo non vi fermano ai cancelli. Fate presto: le carrozze '
             'chiuse del Notaio, di solito, tornano vuote.»',
             'Sul registro, la meta: villa fuori porta, sponda di levante. La stessa via dei noli '
             'della carta di pregio. <i>(incrocio D1: con il rifugio del Notaio, sapete dov’è la '
             'villa-prigione.)</i>'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La carrozza che torna vuota',
                  testo='La carrozza chiusa del Notaio è passata alla Dogana tre notti fa, diretta a '
                        'una villa fuori porta, con un «trasferimento riservato» a bordo: il decano. '
                        'Le carte erano in regola, come sempre con Rasca — perché il suo mestiere è '
                        'far sembrare legale ciò che non lo è. Il doganiere lo sa, e ha paura: dice '
                        'che le carrozze chiuse del Notaio, di solito, tornano vuote. Il decano è '
                        'ancora vivo solo perché serve, per ora, a sapere quanto sapete voi. Fate '
                        'presto.'),
         ]),
    dict(n=8, nome='IL RIFUGIO DEL NOTAIO', voce_mappa='Il Rifugio del Notaio',
         req='Il rifugio in città del Notaio si apre a chi ha decifrato dove tiene i suoi segreti: '
             'il dossier cifrato indica la mano che esegue.',
         chiave=('parola', 'IL DOSSIER CIFRATO'), art='Il Rifugio del Notaio.png',
         chiude=None,
         indizi=[
             'Il rifugio in città dove Rasca tiene ciò che non porta allo studio: chiavi, mazzi di '
             'copie, i «lavori in corso». <i>(Oggetto: prendete le Chiavi della Villa-Prigione.)</i> '
             'Con queste entrate senza sfondare, e senza svegliare la Guardia.',
             'Un registro nascosto dei «lavori sporchi» del Notaio: sparizioni, custodie, '
             'interrogatori, tutti per «il cliente di sempre». <i>(Reperto C: consegnate l’Archivio '
             'del Notaio.)</i> Nessun nome — solo iniziali, e una cifra che paga sempre.',
             'Una piantina della villa-prigione, con la cella e lo studio segnati. <i>(incrocio D1: '
             'con la Dogana, avete la villa e la sua pianta.)</i> «La cella è al piano di sotto. Lo '
             'studio, dove il Notaio tiene le carte, è in fondo. Il decano è tra i due.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il cliente di sempre',
                  testo='Il registro sporco del Notaio è un capolavoro di reticenza: pagine di '
                        'sparizioni e custodie, e mai un nome — solo «il cliente di sempre», iniziali, '
                        'una cifra che non manca mai. Rasca è il perfetto intermediario: non sa nulla '
                        'che possa dire, e non direbbe nulla che sa. Ma la costanza tradisce: un solo '
                        'cliente, da anni, che paga per far sparire chi si avvicina troppo. Il decano '
                        'è l’ultimo di una lista lunga. E la lista, letta con la matrice, ha una sola '
                        'firma in fondo.'),
         ]),
    dict(n=9, nome='LA VILLA-PRIGIONE DEL NOTAIO', voce_mappa='La Villa-Prigione',
         req='La villa-prigione è fuori porta, e non ci si arriva per caso: ci si va sapendo che è '
             'lì che la caccia alla talpa non vuole che guardiate.',
         chiave=('parola', 'LA CACCIA ALLA TALPA'), art='La Villa-Prigione.png',
         chiude=None, fuori_citta=True,
         indizi=[
             'La villa-prigione del Notaio, fuori le mura: un tempo casa di campagna, ora covo di '
             'custodie riservate. Dentro, al piano di sotto, il decano vivo; in fondo, il Notaio coi '
             'suoi incartamenti; ovunque, la sua Guardia personale.',
             'Il decano è interrogato «con garbo»: pesto ma lucido, tenuto in vita perché serve '
             'sapere quanto sa la Società. Trovarlo vivo è la prova che non c’è nessuna talpa — e '
             'cancella lo scisma che vi pesa addosso.',
             'Il Notaio Rasca, che vi è sfuggito al Molino e ha tirato i fili di tre episodi, è qui, '
             'a sovrintendere l’ultimo lavoro. Stavolta, con la Guardia a terra, non scapperà. '
             '<i>(Reperto B: al recupero, la Deposizione del Decano.)</i>'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La mano che si lascia prendere',
                  testo='Nella villa-prigione, per la prima volta, il ricorrente dell’Atto è a '
                        'portata di mano. Il Notaio non fugge come al Molino: si lascia prendere quasi '
                        'con sollievo, perché sa che non parlerà, e sa che prenderlo non chiude '
                        'nulla. «Il mio cliente firma poco, ma paga sempre», dirà. È la mano guantata '
                        'che si offre alle manette per proteggere la penna che la muove. Salvate il '
                        'decano, prendete il Notaio, e portate a casa la matrice: domani, in '
                        'assemblea, quella penna avrà finalmente un nome.'),
         ]),
]

# Tessere della villa-prigione (percorso lineare a 6, fuori porta). Obiettivo =
# liberare il decano vivo (T5, cancella il MORALE) e catturare il Notaio (T6).
# Boss: la Guardia del Notaio. Soglia-decano: il trasferimento.
TILES_17 = [
    dict(id='T1', nome='IL CANCELLO DI CAMPAGNA', exits={'N': 'T2'}, start='S',
         testo='Il cancello della villa-prigione fuori porta, di notte: un muro di cinta, un viale '
               'buio, la campagna intorno. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito delle '
               'Domande 3 e 4. Con le Chiavi della Villa-Prigione entrate senza sfondare, saltate '
               'lo sbarramento e la sua Guardia.',
         arbitro='SBARRAMENTO: senza le Chiavi, la Guardia al cancello vi ingaggia (2 Sgherri). Con '
                 'le Chiavi entrate silenziosi. RICORDA: il MORALE (−1 NERVI a tutti) è attivo da '
                 'ora, e resta finché non trovate il decano vivo (T5).',
         hook='Le Chiavi della Villa-Prigione (dal Rifugio): entrate senza sfondare, niente Guardia '
              'al cancello.',
         cerca_vuoto='Solo il muro e il buio della campagna. Il decano è dentro, vivo: trovarlo è '
                     'l’unica cosa che vi toglierà il peso dallo stomaco.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL CORTILE', exits={'S': 'T1', 'N': 'T3'},
         testo='Il cortile interno della villa-prigione: un pozzo, una rimessa, la carrozza chiusa '
               'del Notaio. QUANDO RIVELATE QUESTA TESSERA: la Guardia del Notaio pattuglia in '
               'forze — è gente addestrata, non sgherri qualsiasi.',
         arbitro='La Guardia del Notaio (boss) o i suoi uomini presidiano. Sotto il malus di morale, '
                 'le prove NERVI sono più dure: la casa divisa pesa. Passate in fretta verso le '
                 'cucine.',
         cerca='Nella rimessa, una lanterna cieca (utile: alla sala degli interrogatori, illumina '
               'senza farsi vedere — la prossima carta insidia "sospetto" non ha effetto).',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LE CUCINE', exits={'S': 'T2', 'N': 'T4'},
         testo='Le cucine della villa, il passaggio di servizio verso le celle. QUANDO RIVELATE '
               'QUESTA TESSERA: i posti di blocco del Notaio; col Salvacondotto passate senza '
               'destare sospetti.',
         arbitro='POSTI DI BLOCCO: senza il Salvacondotto, gli uomini del Notaio vi fermano '
                 '(1 round perso e la soglia-decano avanza). Col Salvacondotto passate come gente '
                 'del Notaio.',
         hook='Il Salvacondotto (dalla Dogana): passate i posti di blocco senza fermarvi — arrivate '
              'al decano prima del trasferimento.',
         cerca_vuoto='Pentole fredde e l’odore di una casa che finge normalità. Di là, un corridoio '
                     'di celle: il decano è vicino.',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='LA SALA DEGLI INTERROGATORI', exits={'S': 'T3', 'N': 'T5'},
         testo='La sala dove il decano è interrogato «con garbo»: una sedia, una lampada, carte. '
               'QUANDO RIVELATE QUESTA TESSERA: capite che il decano è vivo, di là; il Notaio, '
               'sentendovi, ordina il trasferimento. Da qui parte la SOGLIA-DECANO.',
         arbitro='Da ora le carte crescendo spingono la soglia-decano: se il Canto la raggiunge '
                 'prima che liberiate il decano (T5), lui viene «trasferito» — lo recuperate ferito '
                 'gravemente (vittoria parziale). Il Salvacondotto ha già alzato la soglia.',
         cerca_vuoto='La sedia è ancora calda, la lampada accesa: il decano era qui un minuto fa. '
                     'Lo stanno spostando. Correte alla cella.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='LA CELLA DEL DECANO', exits={'S': 'T4', 'N': 'T6'},
         testo='La cella al piano di sotto, dove tengono il decano. QUANDO RIVELATE QUESTA TESSERA: '
               'liberarlo VIVO cancella il malus di morale (non c’è talpa, e ora lo sapete tutti). '
               'Se la soglia-decano è passata, lo trovate già in trasferimento, ferito.',
         arbitro='OBIETTIVO 1. Liberare il decano vivo: da questo momento il MORALE si rialza (−1 '
                 'NERVI RIMOSSO per il resto della spedizione). Se la soglia-decano era già passata, '
                 'il decano è ferito grave (vittoria parziale sul fronte deposizione).',
         cerca_vuoto='Il decano vi guarda con un occhio solo aperto e sorride: «lo sapevo che '
                     'sareste venuti. Non c’è nessuna talpa, ragazzi. Ora prendetelo, il Notaio: è '
                     'di là.»',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LO STUDIO DEL NOTAIO', exits={'S': 'T5'},
         testo='Lo studio in fondo alla villa, dove il Notaio Rasca raccoglie i suoi incartamenti '
               'per sparire. IL NOTAIO è qui, protetto dalla Guardia. QUANDO RIVELATE QUESTA '
               'TESSERA: superate la Guardia e catturate Rasca prima che si dilegui coi suoi lavori.',
         arbitro='OBIETTIVO 2. La Guardia (boss) va superata/abbattuta; poi Interagire col Notaio lo '
                 'cattura. Il Notaio NON combatte: se non lo agganciate entro un round dall’arrivo, '
                 'tenta di sparire (come al Molino) — ma con la Guardia a terra è cattura quasi '
                 'automatica. «La matrice» (D3): sapere che avete decifrato tutto fa saltare un '
                 'attacco alla Guardia.',
         cerca_vuoto='Rasca vi porge i polsi guantati quasi con sollievo: «il mio cliente firma '
                     'poco, signori. Ma paga sempre.» Prendete lui, e la matrice: domani parla la '
                     'penna, non la mano.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_17 = [
    dict(nome='LA GUARDIA DEL NOTAIO', att=3, dif=8, fer=6, mov=3, dan=2, boss=True,
         tipo='Gli Uomini di Fiducia (Boss)', art='La Guardia del Notaio.png',
         note='Protegge il Notaio col corpo: va superata per arrivare a Rasca. Nessuna debolezza-'
              'oggetto. «La matrice» (D3 esatta): sapere che avete già decifrato tutto toglie ai '
              'suoi il senso di difendere il segreto — saltano un attacco. Ai tavoli da 2-3 eroi '
              'non recupera mai Ferite (regola delle taglie).',
         bio_bestiario='La Guardia del Notaio non è la solita ciurma di sgherri: sono gli uomini di '
              'fiducia di Rasca, addestrati a custodire, trasferire e all’occorrenza far sparire, '
              'con la freddezza professionale di chi tratta le persone come pratiche. Robusti e '
              'disciplinati (Fer 6, Danno 2), non cercano la gloria: fanno muro tra voi e il '
              'padrone, per dargli il tempo di raccogliere le carte e dileguarsi. Non sono '
              'fanatici né mostri: sono un servizio, pagato bene. Ma quando capiscono che avete '
              'già la matrice del decano — che il segreto che difendono è bruciato — qualcosa in '
              'loro cede: difendere una carta già letta non ha senso. Ai tavoli da 2-3 eroi non '
              'recupera mai ferite (regola delle taglie). Sono l’ultimo muro davanti al Notaio, e '
              'il Notaio è l’ultima mano prima della penna.'),
    dict(nome='IL NOTAIO', att=1, dif=8, fer=3, mov=4, dan=1, boss=False,
         tipo='Il Ricorrente dell’Atto (stavolta si prende)', art='Il Notaio.png',
         note='NON combatte. Al T6 tenta di sparire coi suoi incartamenti (come nell’Ep. 13): se '
              'non lo agganciate (Interagire) entro un round dall’arrivo, fugge — ma con la Guardia '
              'a terra è cattura quasi automatica. Preso, tace: «Il mio cliente firma poco, ma paga '
              'sempre.»',
         bio_bestiario='Il Notaio Ludovico Rasca è la mano guantata che vi sfugge dall’Ep. 13: '
              'l’uomo che fa sparire le persone con le carte in regola, l’esecutore legale di ogni '
              'lavoro sporco di C.B. Al Molino vi è scappato in carrozza; ha ordito il rapimento di '
              'Braga (Ep. 14) e vegliato sul falso (Ep. 15); ha preso il decano perché sapeva '
              'troppo. Stavolta, però, la fuga è finita: raggiunto nella sua villa-prigione, con la '
              'Guardia a terra, si lascia prendere quasi con sollievo — perché sa di non poter '
              'parlare (un notaio muore col segreto professionale) e sa che prenderlo non chiude '
              'nulla. «Il mio cliente firma poco, signori. Ma paga sempre.» Non è il nemico: è '
              'l’ultima maschera prima del volto. Catturarlo non vi dà un nome — vi dà la certezza '
              'che il nome esiste, ed è più in alto di quanto osiate pensare.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 17 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 17')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'lo scisma')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_17.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: lo Studio del Decano, l’Assemblea (Palazzo del Lume), il Tribunale, lo Studio del Notaio.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 17')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). La Villa-Prigione (9) è FUORI PORTA: 2 ore.')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Aula del Cifrario (5) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Villa-Prigione (9): 2 ore')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole che tornano', 4)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE è il decano? (attenzione: serve più di una conferma)',
            '2. CHI l’ha preso?',
            '3. COSA dice il dossier cifrato?',
            '4. COSA portate alla villa?']
    for i, d in enumerate(doms):
        yd = yy - 9*mm - i*13*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 6.5*mm, W - 16*mm, yd - 6.5*mm)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 17 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 17 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la villa-prigione, e un decano da salvare')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '17/cards/</b>). Le 6 tessere della villa-prigione sono in <b>Episodio '
                  '17/board/</b>. È il PICCO dell’atto: entrate sotto il peso dello <b>SCISMA</b> '
                  '(−1 ai NERVI finché non trovate il decano vivo). Obiettivo: liberare il '
                  '<b>decano</b> vivo (T5) e catturare il <b>Notaio</b> (T6), prima che il decano '
                  'sia «trasferito» (soglia-decano) e che il Notaio si dilegui. Le pagine seguenti '
                  'sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>SCISMA (morale).</b> Finché non liberate il decano <b>vivo</b> (T5), tutti '
                  'gli eroi hanno <b>−1 ai NERVI</b> (la casa divisa, il dubbio del traditore). '
                  'Trovarlo vivo — la prova che la caccia alla talpa è una menzogna — <b>cancella il '
                  'malus</b> per il resto della spedizione.', BODY),
        Paragraph('• <b>SOGLIA-DECANO (il trasferimento).</b> Dalla Sala degli Interrogatori (T4) '
                  'le carte crescendo spingono la soglia. Quando il Canto la raggiunge, il decano è '
                  '«trasferito»: lo recuperate comunque, ma <b>ferito gravemente</b> (vittoria '
                  'parziale: sopravvive, ma non depone lucido). Il <b>Salvacondotto</b> alza la '
                  'soglia; le <b>Chiavi</b> saltano lo sbarramento del cancello (T1).', BODY),
        Paragraph('• <b>OBIETTIVO e NOTAIO.</b> Liberato il decano, allo studio (T6) superate la '
                  '<b>Guardia</b> (boss, Danno 2) e Interagite col <b>Notaio</b> per catturarlo (non '
                  'combatte; se tardate un round tenta di sparire, ma con la Guardia a terra è preso '
                  'quasi di certo). Decano salvo + Notaio preso = <b>vittoria</b>; decano lucido + '
                  'matrice = <b>piena</b>. «La matrice» (D3): la Guardia salta un attacco.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_17:
        art_file = TILE_ART_17[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_17[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_17.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 17</b>. In campo: gli <b>uomini del '
                  'Notaio</b> (Sgherri), <b>la Guardia del Notaio</b> (il boss: gli uomini di '
                  'fiducia, Danno 2) e <b>il Notaio</b> (nemico-obiettivo: NON combatte, si cattura '
                  'a T6). Nessun mostro: il pericolo è il <b>tempo</b> (il trasferimento del '
                  'decano), il <b>morale</b> (lo scisma, −1 NERVI) e la Guardia. Vittoria: decano '
                  'salvo e Notaio preso. Ai tavoli da 2-3 eroi la Guardia <b>non recupera mai '
                  'ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_17())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_17():
    """Miniature dell'Episodio 17. I segnalini Canto sono qui il TRASFERIMENTO
    del decano (la carrozza che si prepara verso la soglia)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('UOMINI DEL NOTAIO (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('LA GUARDIA · IL NOTAIO', [('La Guardia del Notaio.png', 1),
                                    ('Il Notaio.png', 1)]),
        ('IL TRASFERIMENTO (CANTO)', [('Rasca dà l’ordine.png', 1),
                                      ('Il decano viene spostato.png', 1),
                                      ('La carrozza al cancello posteriore.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 17 - Soluzione (non aprire)')

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
        '<b>Il caso.</b> Il decano è sparito, il suo studio a soqquadro, un dossier cifrato nel '
        'camino. M. annuncia una talpa e apre la caccia, spaccando la Società. Voi siete tra i '
        'sospettati.',
        '<b>La verità.</b> Non c’è nessuna talpa. Il decano è VIVO, rapito dal Notaio (l’ultimo '
        'lavoro) su ordine di M., interrogato per sapere quanto sa la Società. La caccia alla talpa '
        'è l’insabbiamento. Sventare = salvare il decano vivo (cancella lo scisma) e catturare il '
        'Notaio; decifrare il dossier (la matrice delle doppie letture) arma l’Ep. 18.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è il decano?</b> Rapito, nella villa-prigione del Notaio fuori porta (la Dogana '
        'L7 + il rifugio del Notaio L8: serve più di una conferma). <i>Esatta:</i> sapete dove '
        'sbarcare — nel 1° round della spedizione non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> '
        'arrivate scomposti — 1 uomo del Notaio appare in T1.',
        '<b>2. CHI l’ha preso?</b> Gli uomini di C.B., per mano del Notaio Rasca — non una talpa (il '
        'confratello anziano L2 + il referto del Tribunale L3 + il praticante L4). <i>Esatta:</i> '
        'sapete che non c’è talpa: il malus di morale della spedizione è ridotto (parte da −1 e si '
        'cancella subito trovando il decano). <i>Sbagliata:</i> nessun effetto.',
        '<b>3. COSA dice il dossier cifrato?</b> La matrice delle doppie letture di tutte le lettere '
        'di M. (la Cifra del decano L5 la decifra). <i>Esatta («la matrice»):</i> allo studio del '
        'Notaio (T6), la Guardia salta un attacco (il segreto che difende è bruciato); e ogni '
        'rilettura dell’Ep. 16 diventa un incrocio per l’Ep. 18. <i>Sbagliata:</i> niente incroci di '
        'campagna.',
        '<b>4. COSA portate alla villa?</b> Le Chiavi della Villa-Prigione (L8) e il Salvacondotto '
        '(L7). <i>Chiavi:</i> saltate lo sbarramento del cancello (T1). <i>Salvacondotto:</i> passate '
        'i posti di blocco (T3) e alzate la soglia-decano (arrivate prima del trasferimento). '
        '<i>Esche:</i> la Talpa Fittizia (L6) e il Biglietto di Braga (L3 — vero, prezioso per '
        'l’Ep. 18, ma nessun effetto ora).',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «Il '
        'confratello anziano» (L2), il Referto «Le penne, non le mani» (L3) e la Testimonianza «Il '
        'praticante del Notaio» (L4). La Domanda 2 non ha complicazione se sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione. <b>NB trasferta:</b> la Villa-Prigione (L9) costa 2 ore.',
    ])
    pagina('spedizione — la casa divisa', [
        '<b>Montaggio</b> (tessere in Episodio 17/board/, coperte tranne T1):<br/>'
        'T1 Il Cancello di Campagna (partenza, da Sud) → T2 Il Cortile → T3 Le Cucine (posti di '
        'blocco) → T4 La Sala degli Interrogatori (parte la soglia-decano) → T5 La Cella del Decano '
        '(liberarlo vivo cancella il morale) → T6 Lo Studio del Notaio (la Guardia + il Notaio). '
        'Con le Chiavi si salta lo sbarramento di T1.',
        '<b>Lo scisma (morale).</b> Da T1, tutti gli eroi hanno −1 ai NERVI (la casa divisa). Il '
        'malus resta finché non liberate il decano vivo (T5): trovarlo — la prova che non c’è talpa '
        '— lo cancella per il resto della spedizione. È il peso dell’episodio: entrate dubitando '
        'l’uno dell’altro.',
        '<b>La soglia-decano.</b> Dalla Sala degli Interrogatori (T4), le carte crescendo '
        '(trasferimento) spingono il Canto. Alla <b>soglia-decano = Canto 6</b> (7 col Salvacondotto), '
        'il decano è trasferito: lo recuperate ferito grave (vittoria parziale sul fronte '
        'deposizione — l’Ep. 18 perde un incrocio).',
        '<b>La Guardia e il Notaio.</b> Guardia (boss): Att +3, Dif 8, Fer 6, Mov 3, Danno 2. Va '
        'superata per Rasca. «La matrice» (D3): salta un attacco. Il Notaio NON combatte: a T6, se '
        'non lo agganciate entro 1 round, tenta di sparire — ma con la Guardia a terra è cattura '
        'quasi automatica. Ai tavoli da 2-3 eroi la Guardia non recupera ferite.',
        '<b>Vittoria.</b> Decano salvo (vivo) e Notaio preso = <b>vittoria</b>; decano lucido (prima '
        'della soglia) + matrice decifrata = <b>vittoria piena</b> (l’Ep. 18 parte armato). Decano '
        'ferito grave, o Notaio sfuggito = <b>vittoria parziale</b>. <b>Il mazzo:</b> 21 carte '
        '(7 uomini/Guardia, 6 insidie di scisma/prigione, 4 crescendo-trasferimento, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere se salvate il decano e prendete il Notaio.</b> «Il decano Ferrante '
        'è vivo, pesto ma lucido, e la prima cosa che dice, mentre lo tirate fuori dalla cella, vi '
        'gela: "Non c’è nessuna talpa, ragazzi. Ve l’ha fatto credere lui." Nell’altra stanza, il '
        'Notaio Rasca vi lascia mettergli le manette ai polsi guantati senza resistere, quasi '
        'divertito. Gli chiedete per chi lavora. Sorride: "Il mio cliente firma poco, signori. Ma '
        'paga sempre." E voi, con la matrice del decano in tasca, sapete finalmente leggere quella '
        'firma. Domani la porterete in assemblea. Domani la Società saprà.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 17:</b> il <b>dossier decifrato del decano</b> — la <i>matrice '
        'delle doppie letture</i>: la chiave che trasforma ogni lettera d’incarico conservata (le '
        'riletture dell’Ep. 16) in un incrocio per la deduzione finale. Conservatelo con gli incroci '
        'di rilettura.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Processare M. davanti alla Società riunita.</b> L’Ep. 18 sarà un processo interno: '
        'deduzione pubblica, tutto o niente (con pochi incroci M. rovescia il tavolo e l’Ep. 18 '
        'parte in svantaggio; con molti, trionfo).<br/>'
        '<b>Tendergli la trappola della firma.</b> L’Ep. 18 sarà un inganno: attirare M. a firmare '
        'da C.B. (più sicuro, ma M. può fiutare: un’occasione sola).<br/>'
        'Scrivete la scelta sul retro del Frammento n. 17.',
        '<b>AGGANCIO.</b> Comunque scelto, l’appuntamento è fissato. La Società non può più non '
        'sapere. E M., che finora vi ha sempre preceduti, per la prima volta non sa che voi avete '
        'la matrice.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'ottenuto solo la vittoria parziale (decano ferito o Notaio sfuggito), l’Ep. 18 partirà con '
        'un incrocio in meno.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI17_DESC = {
    1: "Lo studio del decano, messo a soqquadro con metodo: cassetti aperti, "
       "niente rotto, una perquisizione più che un furto. Murato nel camino, un "
       "dossier cifrato — e sul tavolo, l'ultimo appunto di un uomo che sapeva "
       "che stavano venendo a prenderlo: «non c'è nessuna talpa».",
    2: "Il Palazzo del Lume, la sede della Società, spaccato in due: M. guida "
       "la caccia alla talpa e metà confratelli lo seguono; l'altra metà guarda "
       "voi. Ogni indizio interno passa dal presidente — e un vecchio confratello "
       "si chiede come facesse M. a sapere della talpa prima di cercarla.",
    3: "Il Tribunale e la cella di Braga: morto nel sonno, o — se protetto — "
       "mittente di un ultimo biglietto, «guardate le penne, non le mani». Qui "
       "sono passate visite notturne di un signore in guanti, e le carte "
       "portano allo studio del Notaio.",
    4: "Lo studio del Notaio Rasca, chiuso, il padrone sparito. Ma le pratiche "
       "restano e raccontano l'ultimo lavoro: un affitto di villa fuori porta, "
       "una carrozza notturna, una «custodia riservata per il cliente di "
       "sempre». Non c'è talpa qui: c'è un esecutore.",
    5: "L'aula dove il decano insegnava la crittografia della Società: tra i "
       "suoi appunti, la chiave del suo codice, e con essa il dossier cifrato "
       "diventa una matrice — ogni lettera di M. e, di fronte, ciò che sapeva "
       "prima del dovuto. «Non ho cercato una talpa. Ho cercato lo specchio.»",
    6: "La casa del confratello che la caccia alla talpa addita: un uomo mite, "
       "terrorizzato, con indizi contro di lui spuntati dal nulla, troppo "
       "puliti — come quelli di Braga. La stessa mano che arreda le colpe, di "
       "nuovo. Un innocente cucito su misura per la talpa che non esiste.",
    7: "La Dogana Vecchia, dove è passata la carrozza chiusa del Notaio tre "
       "notti fa, verso una villa fuori porta: «custodia riservata, dazio "
       "pagato». Il doganiere ha paura, e vi porge un salvacondotto: «le "
       "carrozze chiuse del Notaio, di solito, tornano vuote».",
    8: "Il rifugio in città del Notaio, dove tiene ciò che non porta allo "
       "studio: chiavi, copie, un registro dei lavori sporchi per «il cliente "
       "di sempre», e una piantina della villa-prigione. Nessun nome — solo "
       "iniziali e una cifra che paga sempre.",
    9: "La villa-prigione del Notaio, fuori le mura: un tempo casa di campagna, "
       "ora covo di custodie riservate. Al piano di sotto, il decano vivo; in "
       "fondo, il Notaio coi suoi incartamenti; ovunque, la sua Guardia. È qui "
       "che la mano guantata, per la prima volta, è a portata di manette.",
}

OGGETTI_LUOGO_17 = {
    5: ['La Cifra del Decano'],
    8: ['Le Chiavi della Villa-Prigione'],
    7: ['Il Salvacondotto'],
    6: ['La Talpa Fittizia'],
    3: ['Il Biglietto di Braga'],
}

TILE_ART_17 = {t['id']: t['id'] + '-ep17.png' for t in TILES_17}
LUOGHI17_CROP = {}

TESSERE_DESC_17 = {
    'T1': "Il cancello di una villa di campagna fuori le mura, di notte: un "
          "muro di cinta basso, un viale di ghiaia buio, i campi tutt'intorno "
          "che tacciono. Sembra una casa qualunque, e proprio per questo è il "
          "posto giusto per far sparire un uomo.",
    'T2': "Il cortile interno: un pozzo, una rimessa, e la carrozza chiusa del "
          "Notaio, ancora attaccata, come se dovesse ripartire da un momento "
          "all'altro. La Guardia del Notaio pattuglia con la calma di chi è "
          "pagato per non aver fretta.",
    'T3': "Le cucine della villa, fredde, il passaggio di servizio verso le "
          "celle. Agli imbocchi dei corridoi, uomini del Notaio fanno da posti "
          "di blocco: chiedono chi siete, e senza il salvacondotto giusto la "
          "risposta costa tempo.",
    'T4': "La sala degli interrogatori: una sedia al centro, una lampada bassa, "
          "carte sparse, e il calore ancora nell'aria di chi era qui un minuto "
          "fa. Il decano è vivo, di là — e il Notaio, sentendovi arrivare, ha "
          "appena dato l'ordine di spostarlo.",
    'T5': "La cella al piano di sotto, umida e buia. Sul pagliericcio, il "
          "decano Ferrante: pesto, un occhio gonfio, ma vivo e lucido. Alla "
          "vostra vista sorride, e il peso che vi schiacciava il petto dallo "
          "scisma si allenta di colpo: non c'era nessuna talpa.",
    'T6': "Lo studio in fondo alla villa, dove il Notaio Rasca raccoglie con "
          "calma i suoi incartamenti in una borsa, pronto a sparire come al "
          "Molino. Ma stavolta la sua Guardia è a terra, e la porta è dietro di "
          "voi. La mano guantata vi porge i polsi, quasi sollevata.",
}

ESAMI_CARBONE_17 = {
    'IL DOSSIER CIFRATO DEL DECANO': '«Decifrato con la Cifra del decano, è una matrice: mette in '
                'colonna ogni lettera d’incarico di M. e, di fronte, ciò che M. sapeva prima del '
                'dovuto — un nome, un luogo, un morto, un nastro verde. Dal 1885, nessuna eccezione. '
                'Il decano non cercava una talpa: dimostrava che il traditore firma le lettere.»',
    'LA DEPOSIZIONE DEL DECANO': '«Ferito ma lucido: "non c’è nessuna talpa, ragazzi. Mi ha fatto '
                'prendere lui, per non farmi parlare. Il rapitore lavora per il presidente — l’ha '
                'detto ridendo, poi ha detto che scherzava. Non scherzava." È il seme più vicino al '
                'volto che abbiate mai avuto.»',
    'L’ARCHIVIO DI BRAGA': '«Trent’anni di lettere tra i due rivali, e in fondo la prova che l’uno '
                'studiava l’altro come uno specchio. Braga combatteva M. perché era l’unico che '
                'l’aveva capito: per questo M. lo ha scelto come capro. Chi meglio del rivale che ti '
                'conosce, per nascondere che il mostro sei tu?»',
}

OGGETTI_TESSERA_17 = {'T2': ['Una Lanterna Cieca']}


def luoghi():
    """Luoghi.pdf Episodio 17 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 17 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_17, 'Episodio 17')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_17.get(n, [])]

    for L in LUOGHI_17:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI17_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI17_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_17)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_17
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LA GUARDIA DEL NOTAIO', 'IL NOTAIO', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 17')
    print('OK episodio 17')
