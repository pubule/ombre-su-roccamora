# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 3: Le voci del pozzo (Episodio 3/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-3.md, la fonte di design di tutto
questo file). Episodio mythology: il Ladro di Voci - il barbiere Silvano
Alcesti, l'Accordatore - e il movimento della PIETRA («la pietra
risponde»). Primo boss umano della campagna; un solo seme C.B./M.
(la commissione delle canne), come da regole di diluizione dell'arco a 20.

Genera: Indagine.pdf, Spedizione.pdf (note tessera fronte/retro + registro
ferite + token), Soluzione (non aprire).pdf, Bestiario.pdf, Luoghi.pdf
(placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche vivono
in scripts/cardconjurer/cards-data.js, blocco EPISODIO 3).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 3', 'pdf')
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

LETTERA_3 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Nel Borgo delle Cisterne la gente perde la voce. Quattro in due settimane: trovati "
    "all’alba accanto ai pozzi murati, vivi, illesi, <b>muti</b> — con un taglio sottile alla "
    "gola che non sanguina e non guarisce. La Gazzetta ha già il nome che vende: il "
    "<b>Ladro di Voci</b>. Ieri è sparito anche <b>Tobia Manfredi, il pozzaiolo comunale</b> — "
    "manca da martedì — l’unico che dei pozzi murati nel 1741 conosca le falde e i segreti. "
    "Non credo ai mostri col rasoio. Credo ai lavori fatti con metodo, e questo lo è.<br/><br/>"
    "Trovate Tobia. Avete <b>6 ore</b>, dalle 18:00 alle 24:00. Segnate ogni ora sul Taccuino "
    "e annotate tutto: nomi, orari, e le parole che tornano.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: il Lavatoio Grande, la bottega del barbiere in Vicolo "
    "del Sapone, la Gazzetta di Roccamora e la casa del pozzaiolo alla Corte dei Pozzaioli. "
    "Gli altri andranno sbloccati. La Gazzetta va in stampa alle 23:00, l’Ospedale della "
    "Carità chiude alle 22:00.</i>")

# Luoghi: fonte autoritativa py (indizi core GARANTITI - regola 1-ter).
# Chiavi tutte da luoghi APERTI, doppia via (anti-fortuna, 1-sexies):
# «acqua morta» da L1 e L4, «canne d'organo» da L2 e L3, «requiem per
# Piero» da L2 e L4, «salasso» da L2 e L3, le Chiavi dei Chiusini da L1.
# Rivelatorio (Domanda 2) su 3 carte designate: L1, L2, L3 - tutti aperti.
LUOGHI_3 = [
    dict(n=1, nome='IL LAVATOIO GRANDE', voce_mappa='Il Lavatoio Grande',
         req='Disponibile dall’inizio', art='Lavatoio Grande.png',
         chiude=None,
         indizi=[
             'L’ultima ammutolita è una lavandaia: l’hanno trovata all’alba sul bordo del pozzo '
             'della corte, in ginocchio, con le mani ancora nell’acqua. Cantava sempre, ai '
             'mastelli — «era lei che dava il tempo a tutte» — ed era debole, dicono le altre: '
             'il giorno prima s’era fatta fare un salasso, come mezzo Borgo.',
             'Il registro dei livelli del lavatoio: ogni mattina si segna quanta acqua danno i '
             'pozzi. Da un mese una colonna «beve» — il terzo pozzo della corte cala di notte, '
             'quando nessuno attinge. <i>(Reperto A: consegnate il Registro dei Livelli.)</i>',
             'Le lavandaie lo chiamano «il pozzo dell’acqua morta»: non gela mai, non fa schiuma, '
             'e il Catasto delle Acque — dicono — ha una stanza intera per le acque morte del '
             'Borgo. Nella loggia, appese a un chiodo, le chiavi dei chiusini della corte. '
             '<i>(Oggetto: prendete la carta Le Chiavi dei Chiusini.)</i>'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Le lavandaie',
                  testo='«Il barbiere passa all’alba, col suo borsone dei salassi. Anche nelle '
                        'corti dove non è malato nessuno. Lo vediamo perché all’alba ci siamo '
                        'solo noi — e lui non guarda mai le finestre: guarda i chiusini, e conta '
                        'coi passi.»'),
             dict(tipo='Osservazione', soggetto='L’acqua che ascolta',
                  testo='L’acqua del terzo pozzo non increspa: bussando sul coperchio del '
                        'chiusino, il suono torna su lungo, doppio, come da una stanza grande. '
                        'Gli altri pozzi rispondono corto. Là sotto non c’è una canna d’acqua: '
                        'c’è una sala.'),
         ]),
    dict(n=2, nome='LA BOTTEGA DEL BARBIERE', voce_mappa='Vicolo del Sapone',
         req='Disponibile dall’inizio', art='Bottega del Barbiere.png',
         sblocca_parola=('SALASSO', 'REQUIEM PER PIERO', 'CANNE D’ORGANO'), chiude=None,
         indizi=[
             'Mastro Silvano Alcesti vi riceve con cortesia stanca: mezza città passa dalla sua '
             'poltrona. Dei tagli dice, piano: «un taglio così non lo fa un coltello. Lo fa una '
             'mano ferma, e una lama che sa dove fermarsi.» Di notte lo chiamano per i '
             'salassi — il medico costa, il barbiere no.',
             'Alla parete, tra gli ex-voto, il ritratto a carboncino di un bambino: Piero, il '
             'figlio, morto di febbri due inverni fa. «Aveva una voce che il rione si fermava. '
             'Il requiem per Piero non l’ho voluto: certe voci non si seppelliscono.»',
             'Sul banco, tra i rasoi in fila, una canna di piombo corta fa da vaso a un fiore '
             'secco. «Me l’ha lasciata un cliente. Il lattoniere ne ha fatte a dozzine, mesi fa — '
             'canne d’organo, diceva, per una chiesa che non ho mai saputo.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani del barbiere',
                  testo='Mani curatissime, da mestiere. Ma le nocche portano segni di corda e '
                        'd’argano, e sotto le unghie — mentre versa l’acqua di lavanda — una '
                        'polvere chiara che non è talco: polvere di pietra, e cera da sigillo. '
                        'Mani che di notte fanno un altro lavoro.'),
             dict(tipo='Testimonianza', soggetto='Silvano, su Piero',
                  testo='Quando parlate di Piero, la cortesia si incrina. Dal collo tira fuori un '
                        'campanellino d’argento, consumato: «lo suonavo io, piano, quando aveva '
                        'le febbri. Tenetelo voi, per la processione di San Rocco — a me, ormai, '
                        'canta troppo.» <i>(Oggetto: prendete la carta Il Campanello di '
                        'Piero.)</i>'),
         ]),
    dict(n=3, nome='LA GAZZETTA DI ROCCAMORA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         sblocca_parola=('CANNE D’ORGANO', 'SALASSO'), chiude=23,
         indizi=[
             'Il cronista Ranuzzi vi accoglie come clienti: «Il Ladro di Voci! Un mostro col '
             'rasoio, signori, e io so chi è: il maestro del coro della Parrocchia. Scartato, '
             'livoroso, e con le mani in gola ai ragazzini da vent’anni, si fa per dire.» Ci '
             'crede davvero — ed è il suo mestiere, far credere.',
             'L’archivio della Gazzetta, a pagamento: un trafiletto di tre mesi fa deride una '
             '«commissione curiosa» al lattoniere Bo — dodici canne d’organo per un organo che '
             'nessuna chiesa del circondario ha mai ordinato.',
             'Il tipografo, gratis: gli ammutoliti non hanno niente in comune — età, mestiere, '
             'rione. Niente, tranne una cosa che il giornale non ha scritto: «cantavano tutti. '
             'La lavandaia ai mastelli, il garzone che fischiava, la vedova del rosario. Il '
             'Borgo, di notte, adesso è muto.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il tipografo',
                  testo='«Stampo alle tre, e alle tre il Borgo è mio. Due volte ho visto il '
                        'barbiere coi suoi ferri, fermo a un chiusino, col lanternino schermato. '
                        'Non l’ho scritto a Ranuzzi: il barbiere mi ha cavato un dente gratis, e '
                        'poi il mostro col rasoio vende di più di un uomo in ginocchio che '
                        'ascolta un buco.»'),
         ]),
    dict(n=4, nome='LA CASA DI TOBIA', voce_mappa='Corte dei Pozzaioli',
         req='Disponibile dall’inizio', art='Casa di Tobia.png',
         sblocca_parola=('ACQUA MORTA', 'REQUIEM PER PIERO'), chiude=None,
         indizi=[
             'La moglie di Tobia ha denunciato la scomparsa mercoledì: «manca da mercoledì '
             'all’alba, è uscito coi ferri e non è tornato». Sul tavolo, la copia della denuncia '
             'porta la stessa data. Nessuno, in casa, ha parlato di martedì.',
             'Il quaderno dei pozzi di Tobia è sul banco, sfogliato da mani estranee: manca una '
             'pagina, strappata di netto. Un lembo è rimasto nel filo della rilegatura — e '
             'un’altra copia della pagina, ricalcata a matita, è scivolata dietro il cassetto: '
             '<i>«il terzo pozzo non gela mai. Non è l’acqua a scaldarlo.»</i> <i>(Reperto C: '
             'consegnate la Pagina del Quaderno.)</i>',
             'I ferri del mestiere mancano, ma non tutti: restano i tappi di cera che Tobia si '
             'faceva per scendere — «il pozzo parla», diceva, «e chi ascolta troppo resta giù» — '
             'e la sua lanterna a specchio, quella buona. Al muro, il santino del funerale di '
             'Piero Alcesti: Tobia c’era — «al requiem per Piero mai cantato», diceva, «il Borgo '
             'ha perso due voci». Della moglie: «dell’acqua morta non voleva più parlare. Diceva '
             'che al Catasto sanno, e che è meglio così.» '
             '<i>(Oggetti: prendete le carte I Tappi di Cera e La Lanterna a Specchio.)</i>'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La moglie di Tobia',
                  testo='«Un mese fa qualcuno lo ha pagato per sapere dei pozzi murati. Tanto. '
                        'Lui ha detto no — “certe acque si lasciano dormire” — e da allora ha '
                        'smesso di raccontarmi le giornate. L’ultima sera ha detto solo: devo '
                        'chiudere una cosa che ho aperto io.»'),
         ]),
    dict(n=5, nome='IL CATASTO DELLE ACQUE', voce_mappa='Il Catasto delle Acque',
         req='L’archivista non alza gli occhi dal timbro: «Le acque vive al piano di sopra. '
             'Questa sala è un’altra materia — e la materia, qui, bisogna saperla chiamare col '
             'suo nome.»',
         chiave=('parola', 'ACQUA MORTA'), art='Catasto delle Acque.png', chiude=None,
         indizi=[
             'Le mappe delle falde del Borgo: undici pozzi murati, e le vene d’acqua convergono '
             'a ventaglio tutte verso lo stesso punto — la corte del Lavatoio Grande.',
             'Il fascicolo del 1741: i pozzi non furono murati per l’acqua. L’ordinanza li dice '
             'chiusi «per la quiete pubblica», e in margine, a mano antica: <i>«acciocché '
             'tacciano»</i>. La pietra, nel Borgo, ha già risposto una volta.',
             'Il registro delle consultazioni: un mese fa qualcuno ha chiesto proprio queste '
             'mappe. Pagato in contanti, nessuna firma. L’archivista ricorda solo i guanti — '
             '«buoni. D’estate.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il ventaglio delle falde',
                  testo='Ricalcando le mappe una sull’altra, il ventaglio si chiude: ogni vena '
                        'del Borgo passa per il terzo pozzo della corte del Lavatoio prima di '
                        'andare altrove. Chi parla in quella gola di pietra, parla in tutte le '
                        'acque di Roccamora.'),
         ]),
    dict(n=6, nome='LA BOTTEGA DEL LATTONIERE BO', voce_mappa='Calle degli Stagnini',
         req='Bo salda e non ascolta: mezzo Borgo gli deve grondaie. Alza la testa solo per i '
             'clienti che sanno di che lavoro si parla — e voi, per ora, non lo sapete.',
         chiave=('parola', 'CANNE D’ORGANO'), art='Lattoniere Bo.png', chiude=None,
         indizi=[
             'La commissione delle canne, appesa alla lesina come una ricevuta qualsiasi: carta '
             'di pregio, mano elegante, una sigla in calce — <b>«C.B.»</b>. Ritiro a mezzo '
             'garzone, pagamento anticipato, in contanti. <i>(Reperto B: consegnate la '
             'Commissione di C.B.)</i>',
             'Il conto di bottega: <b>dodici</b> canne di piombo consegnate, «da organo, sigillo '
             'a cera». Bo non se n’è mai chiesto il perché — ma i pozzi murati del Borgo sono '
             'undici. Una canna è per qualcosa che pozzo non è.',
             'Sul ripiano dei resi, una canna tornata indietro per difetto di fusione: vuota, '
             'sigillata, mai ritirata. Bo ve la cede volentieri — «a me i lavori muti non '
             'piacciono». <i>(Oggetto: prendete la carta La Canna Muta.)</i>'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Bo, sul committente',
                  testo='«Il committente mai visto: solo il garzone, uno svelto, di quelli che '
                        'non guardano in faccia. La carta però la riconosco: è carta da registro, '
                        'di quella che usano negli uffici buoni. E chi scrive così non ha mai '
                        'saldato una grondaia in vita sua.»'),
         ]),
    dict(n=7, nome='LA PARROCCHIA DEL BORGO', voce_mappa='La Parrocchia del Borgo',
         req='Il parroco vi ferma sul portale: «Se venite per il coro, la prova è finita. Se '
             'venite per altro, ditemi per CHI venite — qui i nomi contano più delle facce.»',
         chiave=('parola', 'REQUIEM PER PIERO'), art='Parrocchia del Borgo.png', chiude=None,
         indizi=[
             'Il maestro del coro — l’uomo del giornale — trema di rabbia, non di colpa: la sera '
             'dell’ultimo ammutolito era all’organo per la novena, e mezza parrocchia lo ha '
             'sentito suonare fino a notte. Il registro delle funzioni lo conferma, riga per riga.',
             'Il registro dei funerali: <i>Piero Alcesti, anni dieci, voce d’angelo</i>. Il padre '
             'rifiutò il requiem cantato: «disse che la voce di Piero non era finita. Che '
             'seppellirla era un peccato più grosso dei miei.» Il maestro del coro, a Piero, '
             'aveva promesso il posto da solista.',
             'Il sagrestano, a voce bassissima: da mesi, all’alba, dal Borgo sale un canto di '
             'bambino. «Viene dai chiusini. Lo sentiamo in tre, e in tre lo teniamo per noi: '
             'certe cose, a dirle, si avverano.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La voce nel pozzo',
                  testo='Nella sacrestia, l’acquasantiera trema senza mani: si vede una galleria '
                        'di pietra bagnata dove l’eco non restituisce la vostra voce — ne '
                        'restituisce un’altra, sbagliata, che vi chiama per nome. E si vede che '
                        'chi tace, e stringe qualcosa al petto, passa. La visione dura un '
                        'rintocco.'),
         ]),
    dict(n=8, nome='L’OSPEDALE DELLA CARITÀ', voce_mappa='L’Ospedale della Carità',
         req='La suora portinaia non apre ai curiosi: «I muti non sono bestie da fiera». Entra '
             'chi sa dire di che CURA si tratta — il nome del mestiere, non quello del male.',
         chiave=('parola', 'SALASSO'), art='Ospedale della Carità.png', chiude=22,
         indizi=[
             'Gli ammutoliti sono in corsia, insieme: vivi, sani, muti. Scrivono, mangiano, '
             'dormono. Ma nessuno di loro piange — il medico dice che è la cosa che lo spaventa '
             'di più: «il pianto è voce. Gliel’hanno presa tutta.»',
             'Il taglio è identico su tutti: sottile, obliquo, non sanguina e non guarisce. Il '
             'medico, mostrandolo: «non è una ferita. È un’<b>accordatura</b> — come si fa alle '
             'canne, per cambiarne la voce. Chi l’ha fatto sapeva dove fermarsi: qui non c’è '
             'rabbia. C’è metodo.»',
             'I registri d’accettazione: nelle settimane prima, tutti e quattro erano stati '
             'salassati — visite regolari, mai pagate per intero. La bottega non è segnata: nel '
             'Borgo di botteghe da salasso ce n’è una sola, e ci passa mezza città. Tra gli '
             'effetti del primo ammutolito, in guardiola, un rasoio d’argento trovato accanto al '
             'corpo — sequestrato e mai reclamato. <i>(Oggetto: prendete la carta Il Rasoio '
             'd’Argento.)</i>'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’accordatura',
                  testo='Sotto la lente, il taglio non recide: TENDE. La lama è entrata a metà e '
                        'ha tirato, come si tende una corda sul ponticello. Un lavoro che al '
                        'mondo sanno fare in due: chi accorda strumenti, e chi apre gole per '
                        'mestiere senza ucciderle — un cerusico. O tutt’e due insieme.'),
         ]),
    dict(n=9, nome='LA CORTE DEI POZZI MURATI', voce_mappa='Il Pozzo del Cieco',
         req='I chiusini della corte sono serrati con lucchetti daziari: senza le chiavi giuste '
             'si può solo girare intorno ai coperchi — e ascoltare da fuori, come fanno i cani.',
         chiave=('oggetto', 'LE CHIAVI DEI CHIUSINI'), art='Corte dei Pozzi Murati.png',
         chiude=None,
         indizi=[
             'All’alba la brina copre ogni coperchio della corte — tranne uno. Il terzo pozzo '
             'respira: il metallo è asciutto, tiepido, e la condensa gli disegna intorno un '
             'cerchio scuro sul selciato.',
             'L’argano del terzo chiusino è stato unto da poco: sego nuovo, corda fresca, e i '
             'solchi sulla pietra sono profondi — da carichi, non da secchi. Qualcuno cala e '
             'risale, di notte, da settimane.',
             'In ginocchio, l’orecchio sul coperchio: da sotto, lontanissimo, un canto di '
             'bambino — fermo sull’acqua che non si muove, come una cosa appoggiata. Si '
             'interrompe quando vi sente. Poi, piano, RIPRENDE DA CAPO.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I segni delle corde',
                  testo='I solchi non sono tutti uguali: quelli vecchi scendono dritti — secchi '
                        'd’acqua. Quelli nuovi strisciano di lato, dove la corda ha lavorato di '
                        'peso e di paziente: casse, o canne, o un uomo che non collabora. '
                        'L’ultimo solco è di stanotte.'),
         ]),
]

# Tessere delle Cisterne del Borgo. Fronte = letto alla rivelazione (tell
# inclusi), retro = cerca/arbitro/hook/cerca_vuoto (solo per chi arbitra).
TILES_3 = [
    dict(id='T1', nome='LA SCALA DEI CHIUSINI', exits={'N': 'T2'}, start='S',
         testo='La scala a pioli cala nel fiato freddo del pozzo, e in fondo la pietra si apre: '
               'le cisterne. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito della Domanda 3 '
               '(vedi la busta della Soluzione). Qui dovete riportare Tobia per vincere.',
         cerca_vuoto='Sotto la scala solo secchi sfondati e la corda di qualcun altro. L’acqua, '
                     'ferma, vi guarda frugare senza increspare.',
         arredi=[(0, 3, 'molo'), (3, 0, 'scorie')]),
    dict(id='T2', nome='LA CISTERNA DELLE COLONNE', exits={'S': 'T1', 'N': 'T3'},
         testo='Un colonnato basso regge il Borgo intero, e ogni passo torna indietro due volte. '
               'Tra le colonne, sull’acqua alta un palmo, passerelle di pietra consumate da '
               'piedi che non sono i vostri.',
         cerca='Una lanterna da minatore col vetro integro, appesa a un gancio d’altri tempi: '
               '+1 alle prove NERVI finché la porta chi l’ha trovata.',
         arredi=[(1, 1, 'forma'), (2, 2, 'forma')]),
    dict(id='T3', nome='LA GALLERIA DELLE ECO', exits={'S': 'T2', 'N': 'T4'},
         testo='La galleria si stringe e l’eco cambia mestiere: non ripete — RISPONDE. Chi entra '
               'in questa tessera per la prima volta prova NERVI (Difficile): la propria voce '
               'torna sbagliata, e chiama per nome. Se fallisce, ha 1 sola azione al prossimo '
               'turno. Se il gruppo porta LA CANNA MUTA, nessuna prova: la galleria non vi sente.',
         hook='Se il gruppo ha letto il Presagio «La voce nel pozzo» (Luogo 7): sanno che chi '
              'tace e stringe qualcosa al petto passa — la prova è Media invece che Difficile. '
              'I TAPPI DI CERA danno il loro +1 qui, come da carta.',
         cerca_vuoto='Nella galleria non c’è niente da trovare: solo la vostra voce, che ci '
                     'mette troppo a tornare — e quando torna, non è più vostra.',
         arredi=[(0, 1, 'molo'), (3, 1, 'molo'), (0, 2, 'molo'), (3, 2, 'molo')]),
    dict(id='T4', nome='LA CONFLUENZA', exits={'S': 'T3', 'E': 'T5', 'N': 'T6'},
         testo='Tre gole di pietra si incontrano in una sala rotonda, e l’acqua qui ha una '
               'direzione: gira, piano, come rimestata. Dall’alto pende una corda nuova, unta di '
               'sego — e la corda LAVORA. QUANDO RIVELATE QUESTA TESSERA: 1 Adepto sta calando — '
               'appare sotto la corda.',
         cerca_vuoto='Solo l’acqua che gira e la corda che pende. Quello che scendeva da qui è '
                     'già arrivato dove doveva.',
         arredi=[(1, 1, 'forma'), (2, 2, 'crogiolo')]),
    dict(id='T5', nome='L’OFFICINA DELLE CANNE', exits={'O': 'T4'},
         testo='Una cella asciutta, rialzata sull’acqua: rastrelliere da cantina, e in fila, '
               'sigillate a cera, le canne di piombo — dentro ciascuna, una voce del Borgo. '
               'QUANDO RIVELATE QUESTA TESSERA: 1 Adepto appare tra le rastrelliere.',
         arbitro='Le canne-voce: un’azione Interagire ciascuna per staccarle (contano '
                 'nell’epilogo e nel Bivio). Se il gruppo NON ha il Campanello di Piero: è qui, '
                 'in una scatolina di legno sulla rastrelliera più alta (si trova Cercando) — ma '
                 'suonarlo qui sotto sveglia gli echi: 1 Voce Cava appare.',
         cerca='Sulla rastrelliera più alta, una scatolina di legno da bambino: dentro, IL '
               'CAMPANELLO DI PIERO (prendete la carta, se non l’avete già — e leggete la nota '
               'per chi arbitra). Se lo avete già: la scatolina è vuota, e odora di lavanda.',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'casse')]),
    dict(id='T6', nome='IL POZZO MAESTRO', exits={'S': 'T4'},
         testo='La gola di pietra sale a perdita d’occhio: il terzo pozzo, visto da dentro. '
               'Appeso alla carrucola, legato, VIVO — Tobia. Ai lati, come metronomi, due '
               'campanelle di bronzo grezzo. E in mezzo alla sala, di spalle, un uomo col '
               'grembiule da barbiere sta accordando la pietra. QUANDO RIVELATE QUESTA TESSERA: '
               'appare L’ACCORDATORE con 1 Voce Cava ogni 4 eroi (arrotondate per eccesso).',
         arbitro='Tobia si libera con Interagire (nessuna prova); si muove con voi: 3 caselle, '
                 'nessuna azione. Le 2 campanelle grezze (quelle dell’Episodio 2): un’azione '
                 'Interagire ciascuna (contano nell’epilogo — e sul Frammento n. 2, se lo '
                 'avete). La debolezza dell’Accordatore è IL CAMPANELLO DI PIERO (vedi la carta '
                 'e il Bestiario): un’azione adiacente — Difesa 8→5 per il resto della partita, '
                 'e salta la sua prossima attivazione. Il Rasoio d’Argento non gli fa niente: '
                 'non è mai stato suo.',
         cerca_vuoto='Qui non si trova: si ascolta. E quello che si sente — un canto di bambino '
                     'fermo sull’acqua — non si può mettere in tasca.',
         arredi=[(2, 2, 'forma')]),
]

# Nemici nuovi (statistiche - fonte per Bestiario e simulatore).
NEMICI_3 = [
    dict(nome='L’ACCORDATORE', att=3, dif=8, fer=4, mov=3, dan=2, boss=True,
         tipo='Il Ladro di Voci (Boss)', art='L’Accordatore.png',
         note='Umano: Mastro Silvano Alcesti, il barbiere del Borgo. La debolezza è il '
              'Campanello di Piero (Difesa 8→5 + salta la prossima attivazione).',
         bio_bestiario='Mastro Silvano Alcesti, barbiere-cerusico del Borgo delle Cisterne: la '
              'mano più ferma di Roccamora, la poltrona di cui tutti si fidano. Il Coro non lo '
              'ha preso con la paura ma con una promessa: la voce di Piero, suo figlio, calata '
              'nei pozzi — e da fissare, gli hanno insegnato, con altre voci. Il suo rasoio non '
              'uccide: ACCORDA. Combatte come lavora, con metodo e senza rabbia, e piange '
              'mentre lo fa. Ciò che lo ferma non è una lama: è il campanellino d’argento che '
              'suonava a Piero nelle notti di febbre (un’azione adiacente: Difesa 8→5 per il '
              'resto della partita, e salta la sua prossima attivazione — la voce vera, non '
              'quella rubata). Ai tavoli da 2-3 eroi non recupera mai ferite, qualunque cosa '
              'dicano le carte Crescendo (regola delle taglie, vedi Regolamento).'),
    dict(nome='LA VOCE CAVA', att=1, dif=6, fer=1, mov=3, dan=1,
         tipo='Eco del Coro', art='La Voce Cava.png',
         note='Quando viene abbattuta, URLA: ogni eroe adiacente prova NERVI (Facile) — chi '
              'fallisce perde 1 azione al prossimo turno.',
         bio_bestiario='Quello che resta quando una voce rubata scappa dalla sua canna: un '
              'inviluppo d’aria e di eco a forma d’uomo, che cammina perché ricorda di aver '
              'camminato. Non pensa e non ha fame: RIPETE. Si spegne con niente — un colpo ben '
              'dato la disfa — ma è nel disfarsi il suo prezzo: tutta la voce che tratteneva '
              'esce in una volta sola, un urlo che non è di dolore perché non è di nessuno. '
              'Chi le sta accanto quando accade (prova NERVI, Facile) se lo porta nelle '
              'orecchie per un turno intero.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 3 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 3')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'le voci del pozzo')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_3.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 2 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 3')
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
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 39.5*mm, '! la Gazzetta (3) va in stampa alle 23:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 44.5*mm, '! l’Ospedale della Carità (8) chiude alle 22:00')

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
    doms = ['1. DOVE è tenuto il pozzaiolo Tobia Manfredi?',
            '2. CHI è il Ladro di Voci?',
            '3. QUALE dei pozzi murati è il Pozzo Maestro? (attenzione: serve più di una conferma)',
            '4. COSA portate con voi per passare là sotto?']
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
    c.setTitle('Ombre su Roccamora - Episodio 3 - Spedizione')
    # copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 3 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'le cisterne del borgo, sotto il lavatoio grande')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 108*mm, W - 56*mm, 55*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (più «La campana nuova» SOLO se il vostro '
                  'Bivio lo dice — vedi Soluzione) e le schede Nemici sono carte a parte '
                  '(cartella <b>Episodio 3/cards/</b>). Le 6 tessere delle Cisterne sono in '
                  '<b>Episodio 3/board/</b>. Le pagine seguenti sono le note per tessera, una tessera per foglio: il '
                  '<b>fronte</b> si legge ad alta voce quando una tessera viene rivelata; il '
                  '<b>retro del foglio</b> è solo per chi tiene questo fascicolo — dice cosa '
                  'nasconde ogni tessera, e si consulta SOLO quando un eroe Cerca (o prova ad '
                  'aprire qualcosa). Non giratelo prima.', BODY)])
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
    for T in TILES_3:
        art_file = TILE_ART_3[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_3[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_3.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 74*mm, W - 40*mm, 46*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 3</b> (PDF a parte). In campo: '
                  '<b>Sgherri</b> e <b>Sicario</b> (i guardiani pagati dei chiusini), gli '
                  '<b>Adepti</b> (calano e risalgono), le <b>Voci Cave</b> (quando abbattute '
                  'URLANO: prova NERVI Facile per gli adiacenti, o 1 azione in meno) e '
                  '<b>l’Accordatore</b> (il boss: si desta in T6, o al 3° segnalino Canto). '
                  'Vittoria: liberate Tobia (Interagire in T6) e riportatelo in T1, alla scala. '
                  'Le canne-voce in T5 sono l’obiettivo secondario: ognuna recuperata è una voce '
                  'del Borgo, e pesa nell’epilogo e nel Bivio. Ai tavoli da 2-3 eroi '
                  'l’Accordatore <b>non recupera mai ferite</b> dalle carte Crescendo (regola '
                  'delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_3())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_3():
    """Miniature dell'Episodio 3: copie massime = spawn iniziali delle tessere
    + carte Minaccia che piazzano. Tobia e' il prigioniero-scorta; i 3
    segnalini Canto usano le arti delle carte Crescendo dell'episodio."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x2) · SICARI (x1) · ADEPTI (x4)', [('Lo Sgherro.png', 2), ('Il Sicario.png', 1),
                                                      ('Adepto Incappucciato.png', 4)]),
        ('VOCI CAVE (x3)', [('La Voce Cava.png', 3)]),
        ('ACCORDATORE · TOBIA', [('L’Accordatore.png', 1), ('Tobia.png', 1)]),
        ('CANTO', [('La pietra impara.png', 1), ('La pietra ripete.png', 1),
                   ('La pietra risponde.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 3 - Soluzione (non aprire)')

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
        'solo dopo aver risposto per iscritto alle 4 Domande. La carta «La campana nuova» va in '
        'una seconda busta, chiusa, con scritto «Bivio».',
        '<b>APERTURA — il Bivio dell’Episodio 2</b> (applicare PRIMA della lettera): se avete '
        'fatto <b>RIFONDERE LA CAMPANA GIUSTA</b> — Padre Marani ha un alleato di bronzo: la sua '
        'Litania si usa 2 volte in questo episodio invece di 1 (vale solo se Marani è nel '
        'gruppo); ma uno strumento accordabile in più suona sopra Roccamora: mescolate la carta '
        'crescendo «La campana nuova» nel mazzo Minaccia (22 carte). Se l’avete <b>STONATA</b> — '
        'il vaccino funziona: la soglia del Canto è a <b>4</b> segnalini invece di 3; ma la '
        'piazza non vi ha perdonato: rimuovete la Testimonianza «Il tipografo» dal mazzo '
        'Approfondimenti (un dente cavato gratis non basta più, a farlo parlare coi nemici di '
        'San Teodoro).',
    ])
    pagina('la verità', [
        'Il Ladro di Voci è <b>Mastro Silvano Alcesti</b>, il barbiere-cerusico del Borgo: '
        'rasoio da mestiere, clientela che si fida, e le notti libere di chi viene chiamato per '
        'i salassi. Non è un mostro: è un padre. Suo figlio Piero — dieci anni, la voce che '
        'fermava il rione — è morto di febbri due inverni fa, e il Coro Sommerso gli ha '
        'promesso di rendergliela: la voce del bambino è GIÀ nei pozzi (è il canto che il Borgo '
        'sente all’alba), e per fissarla nella pietra servono altre voci — raccolte col taglio '
        'che il culto gli ha insegnato: un’accordatura di lama che non uccide, SCORDA.',
        'Le voci rubate stanno in canne di piombo sigillate a cera, commissionate al lattoniere '
        'Bo da un committente senza volto (sigla <b>«C.B.»</b> — la stessa mano elegante '
        'dell’Episodio 2) e calate nel <b>Pozzo Maestro</b>: la gola di pietra sotto il terzo '
        'pozzo della corte del Lavatoio, dove tutte le falde del Borgo convergono. Con le canne, '
        'le due campanelle grezze mai recuperate alla Fonderia: al Coro serviva un metronomo. '
        '<b>Tobia</b> è là sotto, vivo: solo lui sa quale gola di pietra regge l’accordatura '
        'senza spaccarsi — e il Coro non sa ancora farla cantare da solo. «Il bronzo canta, la '
        'pietra risponde»: questo è il secondo movimento.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è tenuto Tobia?</b> Nel Pozzo Maestro, sotto la corte del Lavatoio Grande. '
        '<i>Esatta:</i> sapete dove scendere — nel 1° round non si pesca nessuna carta '
        'Minaccia. <i>Sbagliata:</i> girate a vuoto nei cunicoli — la spedizione parte con 1 '
        'segnalino Canto in più.',
        '<b>2. CHI è il Ladro di Voci?</b> Mastro Silvano Alcesti, il barbiere. <i>Esatta:</i> '
        'Vantaggio «Il nome vero»: quando l’Accordatore appare, chiamatelo per nome — Silvano '
        'esita, e salta la sua PRIMA attivazione. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. QUALE pozzo è il Pozzo Maestro?</b> Il terzo della corte del Lavatoio — «il '
        'pozzo che non gela mai» (lo confermano il registro dei livelli, il ventaglio delle '
        'falde e il conto delle canne: dodici canne, undici pozzi). <i>Esatta:</i> scendete dal '
        'chiusino giusto — T1 è tranquilla. <i>Sbagliata:</i> scendete dal pozzo sbagliato e '
        'attraversate i cunicoli facendo rumore: 1 Voce Cava appare in T1 alla rivelazione.',
        '<b>4. COSA portate con voi?</b> LA CANNA MUTA (il reso del lattoniere): portata al '
        'petto, il coro là sotto non vi «sente» — nella Galleria delle Eco (T3) nessuna prova. '
        '<i>Nota per chi arbitra:</i> la Lanterna a Specchio e il Rasoio d’Argento sono esche — '
        'nessun effetto là sotto (la luce non è il problema, e il rasoio non è mai stato '
        'dell’Accordatore). I Tappi di Cera sono onesti: +1 NERVI in T3, come da carta.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente solo tre carte — la '
        'Testimonianza «Le lavandaie» (L1), l’Osservazione «Le mani del barbiere» (L2) e la '
        'Testimonianza «Il tipografo» (L3). Se il gruppo non ne ha letta nessuna, giudicate con '
        'elasticità una risposta «vicina» (es. «qualcuno che gira all’alba per i salassi»).',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo (0 ore avanzate): 1 '
        'gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio e boss', [
        '<b>Montaggio</b> (tessere in Episodio 3/board/, coperte tranne T1):<br/>'
        'T1 Scala dei Chiusini (ingresso, da Sud) → T2 Cisterna delle Colonne → T3 Galleria '
        'delle Eco (il passaggio obbligato) → T4 Confluenza → a Est T5 Officina delle Canne '
        '(ramo opzionale: le canne-voce) → a Nord T6 Pozzo Maestro (Tobia e l’Accordatore).',
        '<b>Mazzo Minaccia:</b> le 21 carte dell’episodio (più «La campana nuova» se il Bivio '
        'lo dice). Il Canto funziona come sempre: carte crescendo + 1 segnalino automatico ogni '
        '4° round; alla soglia (3 segnalini — o 4, col Bivio «stonata») l’Accordatore si desta '
        'in anticipo (piazzatelo sulla tessera più lontana dagli eroi, con 1 Voce Cava di '
        'scorta) e da quel momento ogni Fase Minaccia pesca 1 carta in più, per sempre.',
        '<b>L’Accordatore</b> (statistiche nel Bestiario; Ferite per taglia già tabellate): si '
        'desta quando rivelate T6, o in anticipo col Canto. La sua debolezza è la carta IL '
        'CAMPANELLO DI PIERO (Domanda 4 a parte: il campanello si prende in Indagine dal '
        'barbiere, o Cercando in T5). <b>Due finali di vittoria:</b> potete fuggire con Tobia '
        'senza affrontarlo — ma le canne-voce restano al Coro (epilogo peggiore, non '
        'sconfitta). Ogni canna recuperata (Interagire in T5) pesa nell’epilogo e nel Bivio.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «Tobia non parla finché '
        'non rivede il cielo dal fondo della scala. Poi dice: “Non volevano l’acqua. Volevano '
        'la gola. La pietra, se la accordi, non smette più: adesso, sotto il rione, qualcosa '
        'RIPETE.” E dopo un po’, più piano: “Il barbiere non contava per loro. Contava la '
        'dodicesima canna. Chiedetevi per CHI era.”» — Se avete recuperato le campanelle '
        'dell’Episodio 2: segnatelo sul Frammento n. 2 — il metronomo del Coro tace. Se avete '
        'lasciato canne-voce là sotto: annotate quante — quelle voci, il Coro le ha ancora.',
        '<b>FRAMMENTO DI CAMPAGNA N. 3:</b> <i>«Il rituale non è a tre movimenti: lo spartito '
        'ha QUATTRO righi. Il quarto rigo non è scritto per uno strumento.»</i> Conservatelo '
        'per il finale di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> Le canne-voce recuperate si possono '
        'aprire — o no:<br/>'
        '<b>Restituire le voci.</b> Gli ammutoliti guariscono, e una di loro — la prima donna '
        'del Teatro Comunale, che era sulla lista — ricorda TUTTO di chi l’ha «misurata» per '
        'l’accordatura: un testimone in più vi aspetta nell’Episodio 4. Ma le voci restituite '
        'hanno imparato la melodia, e la canticchiano nel sonno: il mazzo dell’Episodio 4 '
        'aggiunge 1 carta crescendo.<br/>'
        '<b>Conservarle sigillate.</b> I muti restano muti — e la Gazzetta ve lo farà pagare: '
        'un testimone in meno vi parlerà, nell’Episodio 4. Ma una canna, contro luce, mostra '
        'inciso lo spartito del rituale: segnate sul retro del Frammento n. 3 che LA MELODIA È '
        'VOSTRA — al finale di campagna, varrà.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 3 e non parlatene più fino '
        'all’Episodio 4.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite — Tempra, Fibra, Revolver, '
        'Lanterna schermata, Borsa di garze (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

# Descrizioni estese per chi arbitra (bibbia di scrittura: stessi fatti
# della carta, molto piu' aria - un dettaglio che si muove, mai indizi
# nuovi). Dizionario dedicato, MAI il campo testo della carta.
LUOGHI3_DESC = {
    1: "Il lavatoio è un chiostro d'acqua: mastelli in fila sotto la loggia, vapore "
       "che sale a colonne dritte, e i panni stesi che dividono la luce in stanze. "
       "Una volta qui si lavorava cantando — lo dicono le altre, lo dice il ritmo "
       "che alle mani è rimasto. Adesso si sente solo l'acqua, e l'acqua, da sola, "
       "tiene un tempo che non è di nessuno. Sul pozzo in fondo alla corte, il "
       "terzo, nessuna lavandaia stende più.",
    2: "La bottega è piccola, calda e in ordine feroce: i rasoi in fila per taglia, "
       "la poltrona di cuoio lucidata dagli anni, l'acqua di lavanda nel vetro "
       "buono. Alla parete, tra gli ex-voto, il carboncino di un bambino che ride. "
       "Mastro Silvano lavora piano e parla piano, e ha la cortesia esatta di chi "
       "non vuole essere ricordato — ma quando il vento passa sotto la porta, la "
       "mano con il rasoio si ferma da sola, a mezz'aria, in ascolto.",
    3: "La redazione è una stanza sola sopra la tipografia, e trema tutta quando le "
       "macchine battono: carta ovunque, bozze infilzate, l'odore dell'inchiostro "
       "fresco che sale dalle assi. Ranuzzi parla come titola, a corpo dodici. Di "
       "sotto, il tipografo compone parole al contrario, piombo a piombo — e da "
       "come tiene la testa si capisce che ascolta tutto, da sempre, e che il "
       "giornale vero è lui.",
    4: "La casa del pozzaiolo sa di corda, sego e minestra fredda: i ferri del "
       "mestiere appesi per taglia sulla parete, come in bottega, e il quaderno "
       "dei pozzi sul banco, aperto. La moglie non si siede: sta alla finestra che "
       "guarda la corte, le mani strette, e ogni volta che un chiusino sbatte da "
       "qualche parte nel Borgo, il suo respiro si ferma un momento — poi riparte, "
       "più basso.",
    5: "La sala delle acque morte è in fondo a un corridoio che nessuno spazza: "
       "scaffali di mappe arrotolate, il catasto delle falde, un lume verde. "
       "L'archivista timbra pratiche di canali che non esistono più e conosce ogni "
       "vena d'acqua della città come un medico le proprie — sul tavolo grande, "
       "srotolata e tenuta ferma da quattro pesi, qualcuno ha lasciato la mappa "
       "del Borgo. Di recente: la polvere, intorno, ha un rettangolo pulito.",
    6: "La bottega del lattoniere è un organo essa stessa: canne, grondaie e "
       "lattoneria appese a ogni trave, che al passaggio d'aria suonano piano, "
       "ognuna la sua nota. Bo lavora alla fiamma con gli occhiali neri e le "
       "maniche legate, e parla ai metalli più volentieri che ai clienti. Sul "
       "ripiano dei resi, in mezzo alla ferraglia onesta, una sola canna sigillata "
       "che non suona — e in bottega, si capisce, nessuno la vuole toccare.",
    7: "La parrocchia del Borgo è povera e pulita: banchi lucidi di cera, l'organo "
       "piccolo con una canna storta, il registro dei morti rilegato in nero sul "
       "leggio della sacrestia. Il parroco parla con le mani giunte, il maestro "
       "del coro con le mani che tremano. Dalla finestra della sacrestia si vede "
       "la corte dei pozzi murati — e il sagrestano, ogni volta che ci passa "
       "davanti, cambia lato al corridoio.",
    8: "La corsia della Carità è bianca e sommessa, e la sezione dei muti è la più "
       "silenziosa di un posto già silenzioso: quattro letti, quattro lavagnette "
       "per scrivere, il gesso che stride. Gli ammutoliti vi seguono con gli occhi "
       "tutti insieme, come una cosa sola. Il medico parla a voce bassa per "
       "abitudine nuova — e quando uno dei quattro apre la bocca nel sonno, senza "
       "suono, le suore si fanno il segno della croce.",
    9: "La corte dei pozzi murati è una piazza che la città ha dimenticato "
       "apposta: undici coperchi di ferro in cerchio, il selciato gobbo, l'erba "
       "nelle fughe. Di giorno i bambini ci giocano senza avvicinarsi troppo, di "
       "notte non ci passa nessuno. La brina, all'alba, fa l'appello dei coperchi "
       "uno a uno — e uno, ogni volta, non risponde: asciutto, tiepido, con il "
       "suo cerchio scuro sudato intorno.",
}

# Carte Oggetto per luogo (sotto-sezione "carte da prendere" degli indizi).
# Il Campanello di Piero NON e' qui: si prende SOLO con la Testimonianza
# di L2 (o Cercando in T5) - vedi DESIGN-EPISODIO-3.md.
OGGETTI_LUOGO_3 = {
    1: ['Le Chiavi dei Chiusini'],
    4: ['I Tappi di Cera', 'La Lanterna a Specchio'],
    6: ['La Canna Muta'],
    8: ['Il Rasoio d’Argento'],
}

# arte tessere del fascicolo (le stesse dei board)
TILE_ART_3 = {t['id']: t['id'] + '-ep3.png' for t in TILES_3}

# taratura ritagli del fascicolo Luoghi (verificare A VIDEO in Fase D,
# quando arriva l'arte - regola della bibbia)
LUOGHI3_CROP = {}

# Descrizioni estese delle tessere (fascicolo Spedizione): stessa bibbia
# di scrittura di LUOGHI3_DESC.
TESSERE_DESC_3 = {
    'T1': "La scala a pioli scende per venti braccia dentro il fiato del pozzo: freddo, "
          "minerale, con un fondo dolciastro di cera. Poi la pietra si apre e le "
          "cisterne cominciano: volte basse, acqua ferma un palmo sotto le passerelle, "
          "e il buio che non è vuoto — è pieno, come una stanza dove qualcuno ha appena "
          "smesso di parlare. In alto, il cerchio del chiusino è già piccolo come una "
          "moneta. La corda con cui siete scesi oscilla ancora.",
    'T2': "Le colonne escono dall'acqua in file che il lume non finisce: il Borgo "
          "intero poggia su questa sala, e si sente — ogni tanto la volta manda un "
          "tonfo sordo, un carro che passa nel mondo di sopra. L'eco qui è educata ma "
          "insistente: ripete due volte, la seconda più piano, e nell'intervallo tra "
          "le due c'è sempre un momento in cui sembra che stia per aggiungere qualcosa "
          "di suo. Le passerelle di pietra sono consumate al centro, da piedi pazienti.",
    'T3': "La galleria si stringe fino a toccare le spalle, e la pietra cambia grana: "
          "liscia, lavorata, VOLUTA. Qui l'eco smette di ripetere. Bisbigliate una "
          "parola, e ne torna un'altra; chiamate un nome, e il nome che torna è il "
          "vostro — detto da una bocca che non è la vostra. Le pareti portano incisioni "
          "sottili come graffi di pettine, a righi orizzontali, cinque a cinque. "
          "Qualcuno ha accordato questa gola come si accorda uno strumento. E "
          "l'ha lasciata aperta.",
    'T4': "La sala rotonda raccoglie tre gole di pietra e le fa respirare insieme: "
          "l'acqua gira in tondo, piano, senza vento e senza pendenza, rimestata da "
          "qualcosa che non si vede. Dall'occhio della volta pende una corda nuova, "
          "unta, che scende fino a un palmo dall'acqua e lì si ferma, paziente. I "
          "solchi che ha lasciato sull'orlo della pietra sono una calligrafia di "
          "settimane: qualcuno cala qualcosa, qui, con una cura da farmacista.",
    'T5': "La cella è asciutta e ordinata come una dispensa di canonica: rastrelliere "
          "di legno buono, montate da mani che avevano tempo, e in fila, coricate, le "
          "canne di piombo sigillate a cera. Sono etichettate a punzone, una sigla per "
          "canna. Avvicinando l'orecchio si sente — piano, dentro il metallo — un "
          "fruscio che non è aria: è come una gola che si schiarisce prima di parlare, "
          "per sempre. Sulla rastrelliera più alta, fuori fila, una scatolina di legno "
          "da bambino.",
    'T6': "Il Pozzo Maestro visto da dentro è una cattedrale verticale: la gola di "
          "pietra sale a perdita di lume, rigata dai cinque righi dell'accordatura, e "
          "l'acqua sul fondo è nera e tesa come una pelle di tamburo. Ogni suono qui "
          "dura troppo: un passo diventa una frase, un respiro un coro. Appeso alla "
          "carrucola, Tobia vi trova subito con gli occhi. Ai lati, due campanelle di "
          "bronzo grezzo pendono immobili — e nell'aria, ferma sull'acqua come una "
          "cosa appoggiata, la voce di un bambino canta piano, da capo.",
}

# Esami di Carbone (vedi gen_cards.ESAMI_CARBONE per la bibbia di scrittura)
ESAMI_CARBONE_3 = {
    'CANNA MUTA': '«Piombo daziario rifuso — lo stesso pane due volte, si vede dalla grana. E '
                'la cera del sigillo non è da candela: è cera da campana, quella che si usa '
                'per le forme. Chi ha commissionato queste canne compra dove comprava il '
                'Coro.»',
    'COMMISSIONE DI C.B.': '«Stessa carta di pregio, stesso inchiostro ferro-gallico da '
                'registro della lettera dell’Episodio 2 — e la piega è fatta coi guanti, '
                'nemmeno qui un’ombra di dita. Chiunque sia, C.B. scrive molto, firma poco, e '
                'non tocca mai niente a mani nude.»',
    'CAMPANELLO DI PIERO': '«L’argento è consumato in un punto solo: il battente. Nessun '
                'graffio, nessuna caduta — questo campanello non è mai stato giocattolo. '
                'Qualcuno lo ha suonato per anni, piano, sempre allo stesso modo: come si '
                'parla a un malato. O a un morto che non deve sentirsi solo.»',
}

# Carte Oggetto nascoste nelle tessere (retro delle pagine tessera).
OGGETTI_TESSERA_3 = {'T2': ['Una Lanterna da Minatore'],
                     'T5': ['Il Campanello di Piero ⚠ suonarlo qui ha un prezzo']}


def luoghi():
    """Luoghi.pdf Episodio 3 (fronte/retro + indice citta'): costruito con
    le funzioni parametriche di gen_narrator, sui dati LUOGHI_3. I luoghi
    senza arte usano un placeholder con avviso (si rigenera quando l'arte
    arriva)."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'humble candlelit canal-side room.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 3 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_3, 'Episodio 3')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_3.get(n, [])]

    for L in LUOGHI_3:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI3_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI3_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_3)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    # Bestiario: gen_bestiario con i nemici dell'episodio + i comuni riusati
    # (salta chi non ha ancora l'arte, come sempre)
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_3
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['L’ACCORDATORE', 'LA VOCE CAVA', 'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 3')
    print('OK episodio 3')
