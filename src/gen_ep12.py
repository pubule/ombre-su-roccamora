# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 12: La seconda copia (Episodio 12/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-12.md e CAMPAGNA-EPISODI.md). Chiusura
Atto II, mythology: l'archivio della Societa' del Lume e' stato copiato senza
scasso (sigilli intatti) su ordine autentico di M. — ma tutti concludono che
esista una talpa capace d'imitare la mano del presidente. La spedizione e' un
INSEGUIMENTO: raggiungere il corriere delle copie (Tullio Vela) prima che le
consegni allo scambio al Cimitero delle Barche. Boss: il Corriere (fugge, non
combatte). Un solo seme: il fermo-posta «B. Camillo».

Varieta' strutturale (regola 2026-07-18): obiettivo non-boss di tipo
INSEGUIMENTO a bersaglio mobile (traccia FUGA che avanza), + picco d'atto
(mazzo pieno, morale: Canto +1 iniziale). Torsione d'indagine: «COME sono
uscite le copie?» (esca: effrazione; verita': ordine interno autentico).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 12.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 12', 'pdf')
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

LETTERA_12 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«La nostra stessa casa è stata aperta. Non forzata: <i>aperta</i>. I sigilli sui Frammenti "
    "sono intatti, le serrature vergini, eppure la perizia interna dice che tutti i Frammenti "
    "sono stati ricopiati mesi fa, più volte, da una mano che conosceva l’archivio. Stamane, al "
    "mercato, il segno del Coro è riapparso su una campanella nuova: le copie escono <i>adesso</i>, "
    "e stanotte un corriere le porta allo scambio.<br/><br/>"
    "Se qualcuno ha copiato i Frammenti senza scasso, o è un fantasma o ha le chiavi. Fermate il "
    "corriere prima che consegni, e portatemi ogni carta sul <b>come</b>: non chi, non dove — "
    "<i>come</i> sono uscite dalla mia stessa casa. Ho più paura di questa risposta che del "
    "Dormiente. Avete <b>6 ore</b>, dalle 18:00 alle 24:00; poi il corriere sarà allo scambio.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: il Palazzo del Lume (la nostra sede), la casa "
    "dell’archivista, l’Ufficio del Fermo-Posta e il Banco dei Pegni. Gli altri andranno "
    "sbloccati.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «i sigilli intatti» (L1+L2), «gli ordini protocollati» (L2+L3),
# «il fermo-posta di Camillo» (L3+L4), «il segno sulla campanella» (L1+L4).
# Rivelatorio (D2) su L1, L2, L4.
LUOGHI_12 = [
    dict(n=1, nome='IL PALAZZO DEL LUME', voce_mappa='Il Palazzo del Lume',
         req='Disponibile dall’inizio', art='Il Palazzo del Lume.png',
         chiude=None,
         indizi=[
             'La vostra sede, stanotte, è una scena del delitto. L’archivio dei Frammenti è '
             'aperto, ma nulla è forzato: i sigilli di ceralacca sono intatti, le serrature senza '
             'un graffio. «Non è entrato nessuno», ripete il custode, sbiancato. «Eppure li hanno '
             'copiati tutti. I sigilli intatti sono la cosa più terribile che abbia mai visto.» '
             '<i>(Reperto A: raccogliete la Perizia dei Sigilli.)</i>',
             'Sul tavolo dell’archivio, la campanella nuova comprata al mercato: reca inciso il '
             'segno del Coro, quello vero dell’Atto I. Qualcuno ha usato le copie dei Frammenti — '
             'e le usa già. Il segno sulla campanella è fresco di conio.',
             'Il custode mostra il registro degli accessi: nessun ingresso irregolare, nessuna '
             'ora sospetta. «Chi ha copiato è entrato dalla porta principale, con una chiave o '
             'con un ordine. Non c’è terza possibilità. E le chiavi le abbiamo noi.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La perizia dei sigilli',
                  testo='La ceralacca non è mai stata scaldata due volte: i punzoni sono i '
                        'nostri, le serrature vergini. Non è entrato nessuno — è uscito qualcosa, '
                        'per la porta principale. Chi ha copiato aveva le chiavi, o l’autorità di '
                        'farsele dare. L’effrazione che tutti immaginano non c’è mai stata: '
                        'guardare fuori è guardare il fantasma sbagliato.'),
         ]),
    dict(n=2, nome='LA CASA DELL’ARCHIVISTA', voce_mappa='La Casa dell’Archivista',
         req='Disponibile dall’inizio', art='La Casa dell’Archivista.png',
         chiude=None,
         indizi=[
             'Anselmo Godi, il vecchio copista della Società, è mezzo cieco e tremante: «io ho '
             'solo obbedito, signori. Ordini in regola, timbrati, controfirmati. “Si copino i '
             'Frammenti per sicurezza, se ne conservi copia in luogo diverso.” Ho copiato. Non ho '
             'chiesto. A un presidente non si chiede.» I sigilli intatti li spiega lui: aveva le '
             'chiavi.',
             'Sul suo scrittoio, un biglietto di consegna per stanotte: un corriere ritirerà '
             'l’ultima infornata di copie e le porterà «al solito approdo». <i>(Incrocio D1: '
             'dove avviene lo scambio.)</i> E accanto, la pila degli ordini protocollati che gli '
             'hanno fatto copiare tutto.',
             'Godi vi mostra gli ordini protocollati, uno per uno: carta della Società, timbro '
             'della Società, firma del presidente. «Vedete? Tutto in regola. Se c’è una colpa, '
             'non è mia: io ho eseguito ordini autentici. Chi li ha scritti lo sa meglio di me.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il copista Godi',
                  testo='«Copio per la Società da quarant’anni, e conosco la mano del presidente '
                        'come la mia. Questi ordini sono suoi: non imitati, suoi. Li ho eseguiti '
                        'senza pensarci, come si esegue chi comanda in casa. Il colpevole, se '
                        'volete un nome, sono io: ho copiato i Frammenti. Ma li ho copiati per '
                        'ordine, e l’ordine era vero. Cercate un ladro e non lo troverete: non '
                        'c’è stato nessun furto, solo un’obbedienza.»'),
         ]),
    dict(n=3, nome='L’UFFICIO DEL FERMO-POSTA', voce_mappa='L’Ufficio del Fermo-Posta',
         req='Disponibile dall’inizio', art='L’Ufficio del Fermo-Posta.png',
         chiude=20,
         indizi=[
             'Lo sportello del fermo-posta tiene la corrispondenza di chi non vuole un indirizzo. '
             'Il registro segna una casella intestata a «B. Camillo»: ritiri regolari, sempre di '
             'notte, sempre pagati in anticipo. «Il fermo-posta di Camillo? Non l’ho mai visto in '
             'faccia. Manda un corriere.» <i>(Reperto C: la Ricevuta del Fermo-Posta — il SEME.)</i>',
             'L’impiegato ricorda il corriere: «Tullio Vela, un ragazzo dei traghetti. Ritira per '
             'conto di Camillo e porta al Cimitero delle Barche, all’approdo delle chiatte morte. '
             '<i>(Incrocio D1.)</i> Stanotte ha un ritiro grosso: un sacco di tela cerata.»',
             'Accanto al registro, gli ordini protocollati fanno capolino da una pratica: le '
             'copie della Società passano dallo stesso sportello, spedite con la stessa mano che '
             'firma gli ordini. Chi copia e chi compra usano gli ordini protocollati come binari. '
             '<i>(Oggetto: prendete il Registro dei Ritiri.)</i>'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La casella di Camillo',
                  testo='«B. Camillo» non è una persona: è un’etichetta d’archivio, un nome così '
                        'banale da sparire tra mille. La casella è pagata in anticipo, su carta di '
                        'pregio, e ritira solo copie e Frammenti. Chi si nasconde dietro un nome '
                        'che non è un nome non teme di essere trovato: teme solo di essere '
                        'guardato in faccia.'),
         ]),
    dict(n=4, nome='IL BANCO DEI PEGNI', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Al banco dei pegni la campanella nuova col segno del Coro è passata di mano ieri: '
             '«l’ha portata un ragazzo dei traghetti, per venderla. Roba nuova, ben fatta, col '
             'quel disegno strano. Il segno sulla campanella l’ho riconosciuto: è quello delle '
             'voci del pozzo, di due inverni fa.»',
             'Il prestapegni collega: «lo stesso ragazzo, Vela, ritira e consegna per un tale '
             'Camillo. Il fermo-posta di Camillo lo conoscono tutti al canale, e nessuno l’ha '
             'visto. Paga bene, paga prima, e non lascia mai la faccia.»',
             'In un angolo, i confratelli della Società bisbigliano tra loro, già in sospetto '
             'l’uno dell’altro: «se non c’è stato scasso, uno di noi ha aperto. Uno di noi copia '
             'per il nemico.» Il dubbio è entrato in casa, e avvelena più di ogni mostro.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il prestapegni',
                  testo='«Il ragazzo, Vela, non è nessuno: un corriere che porta quel che gli '
                        'danno, senza leggere. Il vecchio della Società gli ha dato le copie con '
                        'un biglietto timbrato, e lui le porta a Camillo come porterebbe pesce. '
                        'Il colpevole non è il corriere e non è il ragazzo: è chi firma i '
                        'biglietti timbrati. E quello, signori, firma con la vostra stessa penna.»'),
         ]),
    dict(n=5, nome='LA LOGGIA DEI CONFRATELLI', voce_mappa='La Loggia dei Confratelli',
         req='La loggia dei soci è riservata, e si apre solo a chi porta la notizia che nessuno '
             'vuole sentire: che nessuno ha scassinato, che i sigilli sono intatti.',
         chiave=('parola', 'I SIGILLI INTATTI'), art='La Loggia dei Confratelli.png',
         chiude=None,
         indizi=[
             'I confratelli, riuniti, si guardano in cagnesco. «Sigilli intatti significa che uno '
             'di noi ha aperto. Chi? Da quanto? Per chi?» La Società, unita contro il Dormiente, '
             'si sfalda alla prima ombra di tradimento interno.',
             'Qualcuno ha lasciato, sotto una candela, una lettera anonima che accusa un socio a '
             'caso di essere la talpa. <i>(Esca: potete prendere la carta La Lettera Anonima — '
             'accusa a caso, semina paranoia, non prova nulla.)</i>',
             'Il più anziano dei soci scuote il capo: «cerchiamo un falsario perfetto, un traditore '
             'geniale. E se non ci fosse? Se la mano che ha firmato gli ordini fosse davvero quella '
             'che sembra? No. È impensabile. Meglio un traditore che quel pensiero.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La paranoia in casa',
                  testo='La ricerca del falsario perfetto è così avvincente che nessuno considera '
                        'l’alternativa più semplice: che la mano vera non abbia bisogno di '
                        'imitarsi. Il sospetto reciproco è la vera vittoria di chi ha firmato: '
                        'mentre i confratelli si contano le colpe, la penna resta al sicuro, '
                        'perché il posto più nascosto per una firma è in cima all’ordine.'),
         ]),
    dict(n=6, nome='LO SCRIPTORIUM', voce_mappa='Lo Scriptorium',
         req='Lo scriptorium dove si copiava è chiuso a chiave, e cede solo a chi sa nominare '
             'ciò che vi ha fatto lavorare: gli ordini in regola, timbrati e protocollati.',
         chiave=('parola', 'GLI ORDINI PROTOCOLLATI'), art='Lo Scriptorium.png',
         chiude=None,
         indizi=[
             'Il tavolo di Godi è ancora carico di lavoro: i Frammenti originali e, accanto, le '
             'loro copie, mano identica. <i>(Reperto B: raccogliete la Pagina Ricopiata.)</i> '
             'Non c’è tremore di falsario: la copia è sicura come l’originale.',
             'Gli ordini protocollati sono impilati per data: mesi di «si copino i Frammenti», '
             'ognuno timbrato e controfirmato. Un archivio dell’obbedienza, tenuto in ordine '
             'maniacale da chi voleva poter dire «ho solo eseguito».',
             'Sul leggio, l’ultimo ordine: quello che dispone la consegna di stanotte al «solito '
             'approdo». La mano che l’ha scritto non trema, non esita: è una mano di casa, che '
             'firma come respira.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La mano che non imita',
                  testo='La mano della copia non IMITA quella dei Frammenti: è quella mano. '
                        'Sicura, senza le micro-esitazioni di chi ricalca un modello. O il '
                        'falsario è il più grande mai visto — capace di scrivere la mano altrui '
                        'con più naturalezza del proprietario — o non è un falsario, e la mano è '
                        'la sua. Gli ordini protocollati confermano il secondo: nessuno protocolla '
                        'un tradimento; si protocolla un ordine che si vuole poter negare come '
                        '«di routine».'),
         ]),
    dict(n=7, nome='IL DEPOSITO DEI SIGILLI', voce_mappa='Il Deposito dei Sigilli',
         req='Il deposito dei punzoni è sbarrato, e si apre solo a chi torna a dire la cosa che '
             'inchioda il caso: che i sigilli sono intatti, non violati.',
         chiave=('parola', 'I SIGILLI INTATTI'), art='Il Deposito dei Sigilli.png',
         chiude=None,
         indizi=[
             'I punzoni di ceralacca della Società, tutti al loro posto, tutti autentici. Nessuno '
             'è stato rubato o duplicato: i sigilli sui Frammenti li ha rifatti chi aveva diritto '
             'di rifarli, dopo aver copiato.',
             'In un cassetto, un grimaldello lasciato lì bene in vista, quasi apposta. <i>(Esca: '
             'potete prendere la carta Il Grimaldello Trovato — pare la prova dello scasso, ma '
             'nessuna serratura è stata forzata.)</i> Un depistaggio grossolano per chi vuole '
             'credere all’effrazione.',
             'Il custode dei sigilli è sicuro: «se qualcuno avesse forzato, la ceralacca lo '
             'mostrerebbe: scaldata due volte, colata storta, punzone sbagliato. Niente di tutto '
             'questo. Chi ha richiuso sapeva richiudere: uno di noi.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La casa che ascolta',
                  testo='A stare fermi nel deposito, tra i punzoni della Società, si ha la '
                        'sensazione netta di essere ascoltati da dentro le mura di casa. Non un '
                        'fantasma: un orecchio umano, paziente, che da mesi sente ogni riunione, '
                        'ogni deduzione, ogni Frammento letto ad alta voce. Il nemico non ha '
                        'forzato la porta perché non ne ha bisogno: è già dentro, e vi ascolta '
                        'contare le chiavi.'),
         ]),
    dict(n=8, nome='IL CORPO DI GUARDIA', voce_mappa='Il Corpo di Guardia',
         req='Il corpo di guardia dei gendarmi amici apre solo a chi sa della casella segreta: '
             'il fermo-posta intestato a quel nome che non è un nome.',
         chiave=('parola', 'IL FERMO-POSTA DI CAMILLO'), art='Il Corpo di Guardia.png',
         chiude=21,
         indizi=[
             'I gendarmi amici della Società conoscono i canali di notte: «se inseguite un '
             'corriere fino al Cimitero delle Barche, i ponti coperti sono i vostri alleati: '
             'fischiate, e vi chiudiamo un varco in faccia al fuggitivo.» <i>(Oggetto: prendete '
             'il Fischietto della Ronda.)</i>',
             'Il sergente traccia la rotta di Vela: «partirà dall’archivio e scenderà per il '
             'canale fino all’approdo. Se sapete da dove parte e a che ora, gli siete addosso '
             'subito; se no, vi guadagna mezza città.»',
             'Avverte sulla nebbia: «stanotte sale fitta dall’ansa morta. Senza una lanterna '
             'sorda, sull’ultimo tratto il corriere vi sparisce sotto il naso e arriva prima.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il sergente dei canali',
                  testo='«Un inseguimento sull’acqua non si vince coi muscoli: si vince coi ponti. '
                        'Ogni ponte coperto è un imbuto dove possiamo chiudere il passo, ma solo '
                        'se ci arrivate quando lui ci passa. Fischiate al momento giusto e il '
                        'corriere è vostro; fischiate tardi e avrete chiuso un varco sull’acqua '
                        'vuota. Il Fischietto vale quanto il vostro tempismo.»'),
         ]),
    dict(n=9, nome='IL CIMITERO DELLE BARCHE', voce_mappa='Il Cimitero delle Barche',
         req='L’approdo dello scambio si trova solo sapendo cosa vi si scambia: il segno del '
             'Coro sulla campanella, e chi lo ha comprato.',
         chiave=('parola', 'IL SEGNO SULLA CAMPANELLA'), art='Cimitero delle Barche.png',
         chiude=None,
         indizi=[
             'L’ansa morta del canale, dove le chiatte vengono a marcire: è qui che Vela consegna '
             'e «B. Camillo» ritira, nella nebbia, senza mai mostrarsi. <i>(D1: il luogo dello '
             'scambio, il traguardo dell’inseguimento.)</i>',
             'Tra le barche morte, la lanterna sorda di un barcaiolo, buona per la nebbia. '
             '<i>(Oggetto: prendete la Lanterna Sorda dei Canali.)</i> Senza, l’ultimo tratto '
             'dello scambio è cieco.',
             'Un vecchio barcaiolo mormora: «il compratore non scende mai a terra. Riceve dalla '
             'barca, paga dalla barca, sparisce nella nebbia. Come uno che ha imparato a non '
             'lasciare orme in tutta la sua vita.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Le chiatte morte',
                  testo='Nell’ansa morta, tra gli scafi rovesciati, l’acqua nera restituisce '
                        'suoni che non dovrebbe: un frammento di canto, il tonfo di un remo, una '
                        'voce che conta sottovoce. Qui finiscono le barche e, stanotte, un '
                        'inseguimento. Se il corriere consegna, le copie della vostra casa entrano '
                        'nel mondo e non tornano più; se lo fermate, portate a casa la carta — ma '
                        'non la risposta al come.'),
         ]),
]

# Tessere dell'inseguimento (percorso lineare a 6 lungo il canale: un
# inseguimento ha una sola direzione). Traccia FUGA (il Corriere avanza)
# contro AGGANCIO (gli eroi lo raggiungono). FUGA piena a T6 = SCONFITTA.
TILES_12 = [
    dict(id='T1', nome='L’ARCHIVIO VIOLATO', exits={'N': 'T2'}, start='S',
         testo='La sala dell’archivio della Società, aperta e saccheggiata di copie ma senza un '
               'segno di scasso: i sigilli a terra, intatti, come gusci vuoti. Da una finestra, '
               'sull’acqua, la sagoma di una barca che si stacca: è Vela, col sacco delle copie. '
               'QUANDO RIVELATE QUESTA TESSERA: applicate gli esiti delle Domande 3 e 4; parte '
               'l’INSEGUIMENTO. Il Corriere ha già un vantaggio (traccia FUGA iniziale).',
         cerca_vuoto='Solo sigilli vuoti e il rumore di un remo che si allontana. La caccia è '
                     'già cominciata: ogni istante qui è terreno che il corriere guadagna.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL PONTE DEI SOSPIRI', exits={'S': 'T1', 'N': 'T3'},
         testo='Un ponte coperto scavalca il canale: un imbuto di pietra dove un fuggitivo si '
               'incanala. QUANDO RIVELATE QUESTA TESSERA: se avete il Fischietto della Ronda e il '
               'Corriere sta attraversando, i gendarmi chiudono il varco — TAGLIO FUGA. La scorta '
               'comprata vi aspetta qui per farvi perdere il round.',
         arbitro='PONTE COPERTO: col Fischietto della Ronda, se il Corriere è in vista, tagliate '
                 'la sua traccia FUGA (i gendarmi chiudono). La scorta (Sgherri) è schierata per '
                 'rubarvi il round dell’aggancio: passateli o abbatteteli in fretta.',
         hook='Il Fischietto della Ronda (dal Corpo di Guardia): al ponte, taglio della FUGA.',
         cerca_vuoto='Sotto il ponte, l’acqua nera e il riverbero di una lanterna che corre '
                     'avanti. Niente da raccogliere: solo da guadagnare terreno.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA FONDAMENTA STRETTA', exits={'S': 'T2', 'N': 'T4'},
         testo='Una calle stretta lungo il canale, l’acqua a filo del selciato. QUANDO RIVELATE '
               'QUESTA TESSERA: reti da pesca stese sbarrano il passo. Con il Registro dei Ritiri '
               'conoscete la via buona e le saltate; senza, perdete terreno a scavalcarle.',
         arbitro='TRAPPOLA: reti stese (DESTREZZA/VIGORE Media o un round perso, il Corriere '
                 'guadagna FUGA +1). CON IL REGISTRO DEI RITIRI: sapete la via, nessuna prova. '
                 'Tessera di corsa, non di combattimento: qui non si piazza scorta.',
         hook='Il Registro dei Ritiri (dal Fermo-Posta): conoscete la via, saltate le reti.',
         cerca_vuoto='Reti, secchi, l’odore di alga. Il corriere è passato di qui poco fa: '
                     'l’acqua è ancora mossa dal suo remo.',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL CANALE DELLA NEBBIA', exits={'S': 'T3', 'N': 'T5'},
         testo='Il canale si allarga e la nebbia sale fitta dall’ansa morta. QUANDO RIVELATE '
               'QUESTA TESSERA: senza la Lanterna Sorda dei Canali, il Corriere sparisce nella '
               'foschia e guadagna un round di FUGA; la scorta comprata raddoppia lo sforzo per '
               'trattenervi.',
         arbitro='NEBBIA: senza la Lanterna Sorda, +1 FUGA al Corriere (lo perdete di vista). Con '
                 'la Lanterna, il tratto è leggibile. La scorta (Sgherri, e il Sicario Gentile se '
                 'sopravvissuto all’Ep. 9) preme per rubarvi il round.',
         hook='La Lanterna Sorda dei Canali (dal Cimitero delle Barche): niente round di nebbia.',
         cerca_vuoto='Bianco ovunque, e il tonfo di un remo che non si sa da dove venga. La '
                     'nebbia è amica di chi fugge.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='IL SOTTOPORTICO', exits={'S': 'T4', 'N': 'T6'},
         testo='L’ultimo ponte coperto prima dell’approdo: l’ultima strettoia dove chiudere il '
               'passo. QUANDO RIVELATE QUESTA TESSERA: ultimo TAGLIO FUGA possibile col Fischietto. '
               'Il Sicario Gentile, se in campo, fa muro qui: è venuto a rubarvi l’ultimo round.',
         arbitro='ULTIMO PONTE COPERTO: col Fischietto, ultimo taglio della FUGA. IL SICARIO '
                 'GENTILE (se sopravvissuto all’Ep. 9) fa muro: bypassa lo scudo, +2 Dif — '
                 'toglietevelo di torno o aggiratelo, o il Corriere passa.',
         cerca_vuoto='L’approdo è a un passo, oltre l’arco. Si sente la campanella del compratore '
                     'che chiama la barca. Ora o mai più.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='IL CIMITERO DELLE BARCHE', exits={'S': 'T5'},
         testo='L’ansa morta, le chiatte rovesciate, la nebbia sull’acqua nera. Dalla foschia, la '
               'barca del compratore anonimo aspetta lo scambio. QUANDO RIVELATE QUESTA TESSERA: '
               'l’inseguimento si decide. Se il Corriere arriva con la FUGA piena, consegna e '
               'sparisce; se lo agganciate prima, le copie sono vostre.',
         arbitro='RESA DEI CONTI. Se la traccia FUGA è piena quando il Corriere raggiunge T6: '
                 'consegna avvenuta, le copie nel mondo — SCONFITTA. Se siete adiacenti al '
                 'Corriere e spendete Interagire (o avete tagliato la FUGA ai ponti) prima: lo '
                 'BLOCCATE, copie sequestrate — VITTORIA. Il compratore, nella nebbia, non scende '
                 'mai: se lo scambio salta, sparisce senza un volto.',
         cerca_vuoto='Non c’è niente da raccogliere qui: c’è solo un uomo con un sacco da fermare, '
                     'e una barca nella nebbia da mandare via vuota.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_12 = [
    dict(nome='IL CORRIERE', att=1, dif=8, fer=4, mov=5, dan=1, boss=True,
         tipo='Il Bersaglio in Fuga (Boss)', art='Il Corriere.png',
         note='FUGGE, non combatte: ogni suo turno avanza verso lo scambio (FUGA +1 se non '
              'adiacente a un eroe); se adiacente e non bloccato, si sgancia e corre invece di '
              'attaccare. Nessuna debolezza-oggetto. «Le porte aperte» (D3 esatta): la FUGA '
              'iniziale è dimezzata (sapete da dove parte). Lo si AGGANCIA (adiacenza + Interagire, '
              'o taglio ai ponti col Fischietto), non lo si abbatte. Ai tavoli 2-3 non recupera '
              'ferite (regola delle taglie).',
         bio_bestiario='Tullio Vela è un ragazzo dei traghetti, un corriere pagato che non ha mai '
              'letto una riga di ciò che porta: prende quel che gli danno con un biglietto in '
              'regola e lo consegna, come consegnerebbe pesce. Non è un cultista, non è un '
              'assassino: è un paio di braccia oneste al servizio di una firma disonesta. Nella '
              'notte dei canali è imprendibile a inseguirlo di forza (Mov 5, fugge invece di '
              'battersi): l’unico modo di fermarlo è tagliargli la strada ai ponti coperti, col '
              'Fischietto e coi gendarmi, e agganciarlo prima che raggiunga l’approdo. Se lo '
              'prendete, non saprà dirvi nulla se non che «me le ha date il vecchio, con un '
              'biglietto timbrato» — e il timbro è quello della vostra stessa casa. La sua '
              'innocenza è la prova più crudele: chi lo manda non ha bisogno di sporcarsi le mani, '
              'perché ha le chiavi.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 12 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 12')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la seconda copia')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_12.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: il Palazzo del Lume, la casa dell’archivista, l’Ufficio del Fermo-Posta, il Banco dei Pegni.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 12')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Fermo-Posta (3) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Corpo di Guardia (8) chiude 21')

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
    doms = ['1. DOVE avviene lo scambio? (attenzione: serve più di una conferma)',
            '2. CHI ha copiato i Frammenti?',
            '3. COME sono uscite dall’archivio? (attenzione: serve più di una conferma)',
            '4. COSA portate per l’inseguimento?']
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
    c.setTitle('Ombre su Roccamora - Episodio 12 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 12 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'l’inseguimento del corriere, per i canali')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (8 spawn, 4 insidie, 5 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '12/cards/</b>). Le 6 tessere del canale sono in <b>Episodio 12/board/</b>. '
                  'Questo NON è un dungeon né una cattura: è un <b>inseguimento</b> a bersaglio '
                  'mobile. Tenete un segnalino sulla traccia <b>FUGA</b> (il Corriere che avanza '
                  'verso lo scambio): se si riempie prima che lo agganciate, arriva all’approdo e '
                  'consegna — sconfitta. Agganciarlo prima (adiacenza + Interagire, o taglio ai '
                  'ponti col Fischietto) = vittoria. Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 130*mm, W - 60*mm, 90*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole dell’inseguimento:</b>', BODY),
        Paragraph('• <b>FUGA</b> (traccia su carta, lunghezza dalla Soluzione). Parte da un '
                  '<b>vantaggio iniziale</b> (dalla Domanda 4). Sale di 1 alla fine di ogni round '
                  'in cui <b>nessun eroe è adiacente</b> al Corriere, e di 1 a ogni carta '
                  'crescendo (la corrente lo aiuta). Se si riempie, il Corriere è all’approdo: '
                  '<b>sconfitta</b>.', BODY),
        Paragraph('• <b>AGGANCIO</b> (la vittoria). Raggiungete il Corriere ed essere adiacenti + '
                  'Interagire lo <b>blocca</b>. Ai <b>ponti coperti</b> (T2, T5), col <b>Fischietto '
                  'della Ronda</b> i gendarmi chiudono il varco: <b>taglio FUGA</b> (o aggancio '
                  'automatico se il Corriere vi è in vista). Bloccato prima di T6: copie '
                  'sequestrate, vittoria.', BODY),
        Paragraph('• <b>Il Corriere fugge, non combatte</b> (Mov 5): non lo si abbatte, lo si '
                  'taglia fuori. La <b>scorta comprata</b> (Sgherri, e il Sicario Gentile se '
                  'sopravvissuto all’Ep. 9) è lì per rubarvi il round che serve all’aggancio. Il '
                  'Registro dei Ritiri accorcia il vantaggio iniziale e salta T3; la Lanterna '
                  'Sorda nega il round di nebbia a T4.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_12:
        art_file = TILE_ART_12[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_12[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_12.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 12</b>. In campo: la <b>scorta '
                  'comprata</b> (Sgherri, e <b>il Sicario Gentile</b> se sopravvissuto all’Ep. 9, '
                  'che fa muro ai ponti), e <b>il Corriere</b> (il boss: fugge verso lo scambio, '
                  'T6, e va AGGANCIATO, non abbattuto). Nessun mostro: la posta è la carta, non '
                  'il sangue. Vittoria: bloccare il Corriere prima che consegni. Ai tavoli da 2-3 '
                  'eroi il Corriere <b>non recupera mai ferite</b> (regola delle taglie), ma '
                  'raramente si arriva a ferirlo: lo si taglia fuori.', BODY)])
    c.showPage()
    token_sheet(c, token_groups_12())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_12():
    """Miniature dell'Episodio 12. I segnalini Canto sono qui i segnalini della
    SEDE VIOLATA (il dubbio in casa: partono da +1) e della corrente che aiuta
    la fuga."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('LA SCORTA COMPRATA (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL CORRIERE · IL SICARIO GENTILE', [('Il Corriere.png', 1),
                                              ('Il Sicario Gentile.png', 1)]),
        ('LA SEDE VIOLATA / LA CORRENTE (CANTO)', [('La corrente lo aiuta.png', 1),
                                                   ('Il corriere accelera.png', 1),
                                                   ('La marea sale.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 12 - Soluzione (non aprire)')

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
        '<b>Il caso.</b> L’archivio della Società è stato copiato senza scasso (sigilli intatti). '
        'Tutti concludono che esista una talpa capace d’imitare la mano del presidente. Stanotte '
        'un corriere porta l’ultima infornata di copie allo scambio.',
        '<b>La verità.</b> Le copie escono da mesi per mano del copista Anselmo Godi, che ha '
        'copiato SU ORDINE SCRITTO e autentico di M. — ordini protocollati «per sicurezza». Non '
        'c’è nessuna talpa e nessun falsario: la mano vera non ha bisogno d’imitarsi. Il corriere '
        'Tullio Vela porta le copie a «B. Camillo» al Cimitero delle Barche. Sventare = '
        'AGGANCIARE il Corriere prima che consegni.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE avviene lo scambio?</b> Al Cimitero delle Barche (il biglietto di consegna in '
        'casa dell’archivista + il registro del fermo-posta: serve più di una conferma). '
        '<i>Esatta:</i> sapete dov’è il traguardo — nel 1° round non si pesca nessuna carta '
        'Minaccia. <i>Sbagliata:</i> inseguite alla cieca: 1 sgherro della scorta appare in T1.',
        '<b>2. CHI ha copiato i Frammenti?</b> Anselmo Godi, il vecchio copista della Società, su '
        'ordine (la Perizia dei Sigilli L1 + la testimonianza di Godi L2 + il prestapegni L4). '
        '<i>Esatta:</i> sapete che non inseguite un ladro ma recuperate una prova — al Cimitero, '
        'l’aggancio del Corriere riesce anche senza Fischietto (adiacenza + Interagire, senza '
        'contendere il round alla scorta). <i>Sbagliata:</i> nessun effetto.',
        '<b>3. COME sono uscite dall’archivio?</b> Non per effrazione (sigilli intatti): per '
        'ordine interno autentico e protocollato (la perizia dei sigilli L1 + gli ordini '
        'protocollati L2/L6: serve più di una conferma). <i>Esatta:</i> sapendo che non c’è stato '
        'scasso, sapete da dove parte il Corriere e con quale anticipo — la traccia FUGA iniziale '
        'è DIMEZZATA. <i>Sbagliata (credete all’effrazione):</i> inseguite dal punto sbagliato — '
        'FUGA iniziale piena. (Il Grimaldello Trovato e la Lettera Anonima sono esche: nessuna '
        'serratura è stata forzata, nessun confratello è la talpa.)',
        '<b>4. COSA portate per l’inseguimento?</b> IL FISCHIETTO DELLA RONDA (il Corpo di '
        'Guardia, entro le 21). <i>Con il Fischietto:</i> ai ponti coperti (T2, T5) tagliate la '
        'FUGA / agganciate automaticamente. <i>Senza:</i> dovete raggiungerlo a forza, quasi '
        'impossibile (Mov 5). Aiuti: il Registro dei Ritiri (accorcia la FUGA iniziale, salta '
        'T3), la Lanterna Sorda (nega il round di nebbia a T4).',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — il Referto «La '
        'perizia dei sigilli» (L1), la Testimonianza «Il copista Godi» (L2) e la Testimonianza '
        '«Il prestapegni» (L4). Senza nessuna, giudicate con elasticità una risposta «vicina» '
        '(es. «il vecchio archivista, ma per ordine»). La Domanda 2 non ha complicazione se '
        'sbagliata: si perde solo il vantaggio.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — l’inseguimento del corriere', [
        '<b>La traccia FUGA (segnalino su carta):</b> lunga <b>10 caselle</b>. Vantaggio iniziale: '
        '<b>3</b> (Domanda 3 esatta) o <b>6</b> (sbagliata). Il Registro dei Ritiri toglie 1 al '
        'vantaggio iniziale. Se la FUGA si riempie quando il Corriere è a T6: consegna, sconfitta. '
        'Se lo agganciate prima: vittoria.',
        '<b>Montaggio</b> (tessere in Episodio 12/board/, coperte tranne T1):<br/>'
        'T1 Archivio Violato (partenza, da Sud) → T2 Ponte dei Sospiri (ponte coperto) → T3 '
        'Fondamenta Stretta (reti) → T4 Canale della Nebbia → T5 Sottoportico (ponte coperto) → '
        'T6 Cimitero delle Barche (lo scambio). Con il Registro si salta T3 e la sua trappola.',
        '<b>FUGA.</b> Alla fine di ogni round in cui NESSUN eroe è adiacente al Corriere, +1; ogni '
        'carta crescendo (la corrente lo aiuta) +1. Ai ponti coperti (T2, T5), col Fischietto, i '
        'gendarmi chiudono il varco: −1 alla FUGA (o aggancio automatico se il Corriere vi è in '
        'vista). Senza Lanterna Sorda, a T4 la nebbia dà +1 FUGA.',
        '<b>AGGANCIO.</b> Essere adiacenti al Corriere e spendere Interagire lo blocca (vittoria). '
        'La scorta comprata (Sgherri; il Sicario Gentile se sopravvissuto, che bypassa lo scudo e '
        'ha +2 Dif ai ponti) è lì per rubarvi il round dell’aggancio: superatela in fretta. Con '
        'D2 esatta, al Cimitero l’aggancio riesce senza contendere il round.',
        '<b>Il Corriere.</b> Boss in fuga: Att +1, Dif 8, Fer 4, Mov 5, Danno 1. Non combatte: '
        'avanza. Nessuna debolezza-oggetto. «Le porte aperte» (D3): FUGA iniziale dimezzata. '
        'Raramente lo si ferisce: lo si taglia fuori ai ponti.',
        '<b>Il mazzo:</b> 21 carte (8 scorta, 4 insidie, 5 crescendo FUGA, 4 eventi), picco '
        'd’atto. <b>Sede violata (morale):</b> il Canto parte da <b>+1</b> segnalino: il dubbio in '
        'casa pesa da subito. Alla soglia (3), come sempre, +1 carta Minaccia per Fase.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se agganciate il Corriere.</b> «Le copie sono in un '
        'sacco di tela cerata, legate come pesce da vendere. Tullio Vela non è nessuno: un '
        'corriere pagato che non ha mai letto una riga. “Me le ha date il vecchio,” dice, “con un '
        'biglietto in regola. Timbrato. Io porto quel che è timbrato.” E il timbro è il vostro. '
        'Nessuno ha scassinato l’archivio: le porte gli sono state aperte, con un ordine '
        'autentico, dall’interno. Guardate i confratelli intorno al tavolo, e per la prima volta '
        'contate le chiavi della vostra casa.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 12:</b> <i>«Chi ha copiato non ha forzato nulla. Le porte '
        'gli sono state aperte. Contate le chiavi della vostra casa.»</i> Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Dire a M. della talpa.</b> M. «indaga» e la fiducia interna regge (i PNG della '
        'Società restano uniti nell’Atto III), ma la sua indagine interna «ripulisce»: un incrocio '
        'in meno nell’Episodio 18.<br/>'
        '<b>Tacere anche a M.</b> La Società si incrina (lo scisma dell’Episodio 17 costa un PNG '
        'in più), ma conservate il vantaggio: un incrocio in più nell’Episodio 18.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 12.',
        '<b>CHIUSURA DELL’ATTO II.</b> La città, dopo il rituale sventato, risuona di nuovo; e '
        'qualcuno, in casa vostra, ascolta. Il cerchio «la città cambiata» è chiuso; il tarlo — la '
        'mano che firma dall’interno — resta, e apre la caccia dell’Atto III. Potete interrompere '
        'qui la campagna.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI12_DESC = {
    1: "Il Palazzo del Lume è la sede della Società: sala delle riunioni, "
       "archivio dei Frammenti, ritratti di presidenti morti. Stanotte è una "
       "scena del delitto senza delitto — nulla forzato, tutto copiato — e per "
       "la prima volta la vostra stessa casa è il luogo da indagare.",
    2: "La casa dell'archivista è modesta e ordinata come chi ha passato la "
       "vita a mettere carte in fila. Anselmo Godi, mezzo cieco e tremante, ci "
       "vive con la sua obbedienza: ha copiato i Frammenti per ordine, e "
       "l'ordine, giura, era autentico.",
    3: "L'Ufficio del Fermo-Posta tiene la corrispondenza di chi non vuole un "
       "indirizzo: caselle numerate, ritiri notturni, nomi che non sono nomi. "
       "Qui una casella intestata a «B. Camillo» riceve, da mesi, le copie "
       "della vostra casa.",
    4: "Il Banco dei Pegni di Fossa compra e vende tutto ciò che la città "
       "impegna: qui è passata la campanella nuova col segno del Coro, e qui i "
       "confratelli, già in sospetto l'uno dell'altro, cominciano a contarsi "
       "le colpe.",
    5: "La Loggia dei Confratelli è la sala riservata dei soci della Società: "
       "stanotte è un nido di veleni, perché sigilli intatti vogliono dire che "
       "uno di loro ha aperto. Si cerca un traditore per non dover pensare "
       "l'impensabile.",
    6: "Lo Scriptorium è la stanza dove Godi copiava: leggii, calamai, i "
       "Frammenti e le loro copie affiancati. Qui la mano che ricalca non "
       "trema — perché non ricalca: scrive la propria — e gli ordini "
       "protocollati fanno da alibi a chi li ha firmati.",
    7: "Il Deposito dei Sigilli custodisce i punzoni di ceralacca della "
       "Società: tutti al loro posto, tutti autentici. È la prova muta che "
       "non c'è stato scasso — e, lasciato lì bene in vista, un grimaldello "
       "che vorrebbe farvi credere il contrario.",
    8: "Il Corpo di Guardia dei gendarmi amici conosce i canali di notte come "
       "le proprie tasche: sanno dove un fuggitivo si incanala e dove chiudere "
       "il passo. Il loro fischietto, al ponte giusto, vale più di ogni corsa.",
    9: "Il Cimitero delle Barche è l'ansa morta del canale, dove le chiatte "
       "vengono a marcire nella nebbia. È l'approdo dello scambio: qui il "
       "corriere consegna e il compratore anonimo ritira, senza mai mostrare "
       "un volto all'acqua nera.",
}

OGGETTI_LUOGO_12 = {
    3: ['Il Registro dei Ritiri'],
    5: ['La Lettera Anonima'],
    7: ['Il Grimaldello Trovato'],
    8: ['Il Fischietto della Ronda'],
    9: ['La Lanterna Sorda dei Canali'],
}

TILE_ART_12 = {t['id']: t['id'] + '-ep12.png' for t in TILES_12}
LUOGHI12_CROP = {}

TESSERE_DESC_12 = {
    'T1': "La sala dell'archivio della Società, aperta e svuotata di copie ma "
          "intatta: i sigilli di ceralacca a terra come gusci, le serrature "
          "senza un graffio. Da una finestra sull'acqua, una barca che si "
          "stacca dalla riva col favore del buio. La caccia comincia dentro "
          "casa vostra.",
    'T2': "Il Ponte dei Sospiri scavalca il canale coperto, un budello di "
          "pietra dove chi fugge si incanala per forza. Sotto gli archi, "
          "l'acqua nera; agli imbocchi, le sagome della scorta comprata che "
          "aspettano di rubarvi un round. Un fischio, al momento giusto, e il "
          "varco si chiude.",
    'T3': "La fondamenta stretta corre a filo del canale, l'acqua che lecca il "
          "selciato. Reti da pesca stese ad asciugare sbarrano il passo come "
          "una ragnatela. Il corriere è passato di qui: l'acqua è ancora mossa "
          "dal suo remo, e la via buona la conosce solo chi ha letto il "
          "registro.",
    'T4': "Il canale si allarga in uno specchio nero e la nebbia sale fitta "
          "dall'ansa morta, ingoiando le sponde. Da qualche parte, davanti, un "
          "remo affonda e riemerge. Senza una lanterna sorda che buchi la "
          "foschia, il corriere è già un ricordo, e la scorta ne approfitta "
          "per stringervi.",
    'T5': "Il sottoportico è l'ultimo ponte coperto prima dell'approdo: "
          "l'ultima strettoia dove chiudere il passo. Oltre l'arco si sente "
          "già la campanella del compratore che chiama la barca. Se c'è un "
          "muro da sfondare, è qui e adesso — o il corriere passa e consegna.",
    'T6': "L'ansa morta del canale: chiatte rovesciate, alberi spezzati, la "
          "nebbia distesa sull'acqua come un lenzuolo. Dalla foschia, immobile, "
          "la barca del compratore anonimo attende lo scambio. Un uomo con un "
          "sacco da fermare, e una barca da mandare via vuota. Non c'è un "
          "secondo tiro.",
}

ESAMI_CARBONE_12 = {
    'LA PERIZIA DEI SIGILLI': '«La ceralacca non è mai stata scaldata due volte, i punzoni sono i '
                'nostri, le serrature vergini. Non è entrato nessuno: è uscito qualcosa, per la '
                'porta principale. Chi ha copiato aveva le chiavi, o l’autorità di farsele dare. '
                'L’effrazione che tutti immaginano non c’è mai stata: cercare uno scassinatore è '
                'guardare il fantasma sbagliato mentre il vero ladro siede al vostro tavolo.»',
    'LA PAGINA RICOPIATA': '«La mano della copia non imita quella dei Frammenti: È quella mano, '
                'sicura, senza le esitazioni di chi ricalca. O il falsario è il più grande mai '
                'visto — capace di scrivere l’altrui con più naturalezza del proprietario — o non '
                'è un falsario. Gli ordini protocollati sciolgono il dubbio: nessuno protocolla un '
                'tradimento; si protocolla ciò che si vuol poter chiamare “routine”.»',
    'LA RICEVUTA DEL FERMO-POSTA': '«Carta di pregio, filigrana della cartiera dei casi passati; '
                'il ritiro pagato prima della consegna, intestato a un nome che non è un nome — '
                '“B. Camillo”, un’etichetta d’archivio. Chi compra le copie della Società paga '
                'come chi compra tutto il resto della campagna: puntuale, anonimo, con la solita '
                'penna. Il compratore delle copie e il padrone delle scatole vuote sono la stessa '
                'mano.»',
}

OGGETTI_TESSERA_12 = {'T4': ['Un Remo di Scorta']}


def luoghi():
    """Luoghi.pdf Episodio 12 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'derelict warehouses over black still water.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 12 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_12, 'Episodio 12')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_12.get(n, [])]

    for L in LUOGHI_12:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI12_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI12_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_12)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    from gen_ep9 import NEMICI_9  # per riuso IL SICARIO GENTILE nella scorta
    for _extra in (NEMICI_9 + NEMICI_12):
        if _extra['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}:
            gen_bestiario.NEMICI.append(_extra)
    gen_bestiario.bestiario(
        ['IL CORRIERE', 'IL SICARIO GENTILE', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 12')
    print('OK episodio 12')
