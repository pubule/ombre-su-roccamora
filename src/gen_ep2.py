# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 2: La voce del bronzo (pdf/Episodio 2/).

Fase B-3 del piano (vedi DESIGN-EPISODIO-2.md, la fonte di design di tutto
questo file). Caso "della settimana": il furto dei pani del Quarantuno -
il bronzo delle campane della confraternita bandita - con la Malavita in
primo piano e il Coro Sommerso rivelato solo in coda. Niente frati, Ferri
mai in scena.

Genera: Indagine.pdf (lettera + taccuino), Spedizione.pdf (note tessera
FRONTE/RETRO come l'Ep. 1 + registro ferite), Soluzione (non aprire).pdf,
Bestiario.pdf (via gen_bestiario, salta i nemici senza arte). Luoghi.pdf
arriva con l'arte (Fase D): come gen_preludio, viene saltato con un avviso
finche' mancano i file in artworks/.

I dati qui sono la fonte autoritativa lato Python (le carte fisiche vivono
in scripts/cardconjurer/cards-data.js, blocco EPISODIO 2 - testi carta
identici, come per l'Ep. 1 gen_cards <-> cards-data).
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border,
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
from gen_gothic import registro_ferite, st as st_gothic

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf', 'Episodio 2')
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

LETTERA_2 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«La campana grande di San Teodoro — la stessa che avete sentito suonare da sola, "
    "quella notte — si è crepata. Doveva cantare di nuovo per la città: la rifusione era "
    "affidata alla fonderia dei Dossena, e il dazio aveva scorporato per l’occasione i "
    "<b>pani del Quarantuno</b>, il bronzo di stato che dorme sotto sigillo da centoquarantotto "
    "anni. Stanotte il mastro fonditore <b>Ilario Dossena</b> non è rientrato, e all’alba i "
    "pani pesavano giusto — ma non erano più bronzo.<br/><br/>"
    "Qualcuno ha preferito che quella campana cantasse per qualcun altro. C’è dell’altro, "
    "e non lo scrivo: lo sentirete da soli, se salite abbastanza in alto.<br/><br/>"
    "Trovate Ilario. Avete <b>6 ore</b>, dalle 18:00 alle 24:00. Segnate ogni ora sul "
    "Taccuino e annotate tutto: nomi, orari, e le parole che tornano.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la Fonderia Dossena alle Fonderie, la Cella "
    "Campanaria di San Teodoro, l’Osteria della Bilancia e il Banco dei Pegni di Fossa. "
    "Gli altri andranno sbloccati. Il capobarca del Molo delle Chiatte smonta alle 21:00, "
    "la Camera dei Pesi e delle Misure chiude alle 22:00.</i>")

# Luoghi: fonte autoritativa py (indizi core GARANTITI - le chiavi vivono
# qui, mai solo negli Approfondimenti: regola 1-ter). Le chiavi nascono
# tutte in luoghi APERTI (anti-fortuna, 1-sexies): «pari peso» da L3 e L6,
# «senza lanterne» da L2 e L3, «ghisa da scafo» da L1 (indizio core (c) -
# NON solo dal Referto gated), la polizza da L6.
LUOGHI_2 = [
    dict(n=1, nome='LA FONDERIA DOSSENA', voce_mappa='Le Fonderie',
         req='Disponibile dall’inizio', art='Fonderia Dossena.png',
         chiude=None,
         indizi=[
             'Il taccuino di collaudo di Ilario si interrompe al provino delle 20:00, con una sola '
             'nota, ripassata due volte: «suono sbagliato — questa lega non è la mia». '
             '<i>(Reperto A: consegnate il Taccuino di Collaudo.)</i>',
             'Nella sala delle staffe: uno sgabello rovesciato, segni di trascinamento, e sotto un '
             'banco il <b>martello di collaudo</b> di Ilario — lui non lo avrebbe mai lasciato a '
             'terra. <i>(Oggetto: prendete la carta Il Martello di Collaudo.)</i>',
             'I pani consegnati dal dazio, ancora nei casseri, non sono bronzo: <b>ghisa da '
             'scafo</b>, piena di sabbia di mare — roba da demolitori di barche. E il libro paga '
             'dice che il capomastro Sartorio ha anticipato la paga a tutti: con quali soldi?'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani del capomastro',
                  testo='Sartorio parla col cappello in mano, addoloratissimo. Ma sotto le unghie, '
                        'mentre lo torce, brillano trucioli sottili di piombo — piombo da sigillo, '
                        'quello che si taglia e si rifonde. Un fonditore di campane il piombo non '
                        'lo tocca mai: non entra nella lega.'),
             dict(tipo='Referto', soggetto='La zavorra',
                  testo='I pani lasciati nei casseri non sono bronzo: ghisa da scafo, fusa male, '
                        'piena di sabbia di mare. A Roccamora la ghisa da scafo si compra in un '
                        'posto solo — dove le barche vanno a morire.'),
         ]),
    dict(n=2, nome='LA CELLA CAMPANARIA DI SAN TEODORO', voce_mappa='Il Campanile di San Teodoro',
         req='Disponibile dall’inizio', art='Cella campanaria.png',
         sblocca_parola='SENZA LANTERNE', chiude=None,
         indizi=[
             'Ruggero Alvise vi fa strada: «Ilario ha suonato il provino quassù e s’è fatto '
             'bianco. “Questo non è il MIO bronzo”, ha detto. Un fonditore la sua lega la '
             'riconosce come una voce di famiglia.»',
             'Lo <b>smorzo di feltro</b> — il cuscino che tace le campane — è ancora appeso alla '
             'trave, dimenticato dal provino. <i>(Oggetto: prendete la carta Lo Smorzo di '
             'Feltro.)</i>',
             'Dal parapetto si vedono i moli daziari. Ruggero, la notte del furto, ha visto '
             'chiatte <b>senza lanterne</b> scivolare verso ponente: «è così che i barcaioli '
             'chiamano quelle corse: le senza-lanterne. Nessuno ne parla volentieri.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La crepa che canta',
                  testo='Appoggiare l’orecchio alla crepa basta: si vede una fossa di colata piena '
                        'di braci, e una passerella di assi sopra l’acqua nera — assi che NON '
                        'reggeranno chi ci correrà sopra. La visione dura un rintocco. Poi la '
                        'campana tace, in colpa.'),
             dict(tipo='Testimonianza', soggetto='Ruggero',
                  testo='«Le chiatte senza lanterne mostrano un contrassegno di piombo al '
                        'pesatore, grande come una moneta, con un segno tipo un’onda. L’ho visto '
                        'per anni dal campanile: di notte, da quassù, si vede tutto — ma nessuno '
                        'pensa mai a chi sta in alto.»'),
         ]),
    dict(n=3, nome='L’OSTERIA DELLA BILANCIA', voce_mappa='L’Osteria della Bilancia',
         req='Disponibile dall’inizio', art='Osteria della Bilancia.png',
         sblocca_parola=('PARI PESO', 'SENZA LANTERNE'), chiude=None,
         indizi=[
             'I facchini di notte entrano al Deposito con la parola del mese: quella che il '
             'daziere borbotta quando la bilancia torna — <b>«pari peso»</b>. La sanno tutti, '
             'qui dentro. Fuori di qui, nessuno.',
             'Un facchino insonne, pagato un bicchiere: la seconda chiatta <b>senza lanterne</b> '
             'ha passato la Punta delle Scorie alle 3 in punto. «Diretta al canale morto. Là non '
             'c’è niente. Cioè: non c’era.»',
             'Un sensale ubriaco giura il contrario, e non molla: «il bronzo è salito al Vecchio '
             'Mulino, l’ho caricato io con queste mani». Nessuno lo smentisce — qui dentro le '
             'storie non si pesano.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il facchino insonne',
                  testo='«Il capomastro dei Dossena beveva qui ogni notte, e ai tavoli di dietro '
                        'perdeva più di quanto pesasse. Da un mese paga da bere a tutti e non '
                        'tocca una carta. Chi smette di giocare così, di colpo, i debiti non li '
                        'ha vinti: glieli ha pagati qualcuno.»'),
         ]),
    dict(n=4, nome='IL DEPOSITO DAZIARIO', voce_mappa='Il Deposito Daziario',
         req='Il piantone alla sbarra non guarda nemmeno chi passa: ascolta. Aspetta le due '
             'parole che i facchini si scambiano al cambio, e voi non le sapete ancora.',
         chiave=('parola', 'PARI PESO'), art='Deposito Daziario.png', chiude=None,
         indizi=[
             'I sigilli dei pani non sono stati strappati: tagliati e rifusi a caldo, con mano '
             'paziente. Un lavoro da chi i sigilli li conosce — e da chi ne raccoglie i trucioli '
             'senza accorgersene.',
             'La pesa notturna del giorno del furto torna alla perfezione, riga per riga: troppo. '
             'Solo il pesatore notturno può firmare una pesa così — e la sua firma, quella notte, '
             'trema.',
             'La zavorra rimasta nei casseri di carico è <b>ghisa da scafo</b>: al Deposito non è '
             'mai entrata ghisa. Qualcuno l’ha portata da fuori, già fusa in pani della misura '
             'giusta.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il piombo dei sigilli',
                  testo='I sigilli non sono stati strappati: tagliati e rifusi, a caldo, con mano '
                        'paziente. La rifusione lascia trucioli sottili come capelli — gli stessi '
                        'che qualcuno, in fonderia, porta ancora sotto le unghie senza saperlo.'),
             dict(tipo='Osservazione', soggetto='La firma del pesatore',
                  testo='La pesa notturna del giorno del furto torna alla perfezione, riga per '
                        'riga. Ma la firma del pesatore trema dove le altre notti correva: una '
                        'mano costretta, o comprata, o tutt’e due. Da tre giorni, quella mano non '
                        'firma più.'),
         ]),
    dict(n=5, nome='CORTE DELLA FAENZA', voce_mappa='Corte della Faenza',
         req='La vedova che abita la corte vi squadra dalla ringhiera: «Il capomastro non c’è '
             'per nessuno». Ma il suo sguardo corre a ciò che avete in mano — o a ciò che non avete.',
         chiave=('oggetto', 'LA POLIZZA DEL MONTE'), art='Corte della Faenza.png', chiude=None,
         indizi=[
             'Sul tavolo, sotto la candela, ricevute di gioco per una cifra da far paura — '
             'saldate tutte lo stesso giorno, un mese fa, in contanti.',
             'Una lettera elegante, senza firma: «Al collaudo penserà il vostro mastro. Il resto '
             'a consegna. — C.B.» <i>(Reperto C: consegnate la Lettera di C.B.)</i>',
             'L’armadio è pieno di vestiti nuovi coi cartellini attaccati, e dietro la porta c’è '
             'una valigia pronta: il capomastro stava per lasciare Roccamora — dopo qualcosa.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La vedova della corte',
                  testo='«Ogni martedì un ragazzo gli porta una busta. Mai visto in faccia: sta '
                        'col berretto basso e se ne va di corsa. Ma lo sento arrivare prima di '
                        'vederlo — puzza di scoria bruciata, come i cenciaioli che frugano '
                        'nell’isola dei forni spenti.»'),
         ]),
    dict(n=6, nome='IL BANCO DEI PEGNI DI FOSSA', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         sblocca_parola='PARI PESO', sblocca_oggetto='LA POLIZZA DEL MONTE', chiude=None,
         indizi=[
             'Il registro di Fossa non mente: il capomastro Sartorio ha riscattato TUTTI i pegni '
             'di famiglia in un giorno solo, un mese fa, in contanti nuovi.',
             'Tra le carte del banco, dimenticata, la <b>polizza del Monte</b> intestata a '
             'Sartorio: riscattata, timbrata — la fretta lascia ricevute. <i>(Oggetto: prendete '
             'la carta La Polizza del Monte.)</i>',
             'Fossa, gratis per una volta: «Coi facchini del dazio ci lavoro da trent’anni: al '
             'piantone basta dire <b>“pari peso”</b>, come al cambio turno. Ma non ditegli chi ve '
             'l’ha insegnato.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Fossa',
                  testo='«Il piombo daziario lo riconosco a occhi chiusi: me ne hanno offerto un '
                        'sacchetto di trucioli, settimana scorsa. Ho detto no. Chi era? Il '
                        'capomastro dei Dossena in persona, con le mani sporche. Non l’ho scritto '
                        'sul registro: certe firme portano male.»'),
         ]),
    dict(n=7, nome='IL MOLO DELLE CHIATTE', voce_mappa='I Moli di Levante',
         req='Il capobarca spegne la pipa quando vi vede arrivare e riprende a spalare come se '
             'non esisteste: di certe corse notturne parla solo con chi mostra di saperle già '
             'chiamare per nome.',
         chiave=('parola', 'SENZA LANTERNE'), art='Molo delle Chiatte.png', chiude=21,
         indizi=[
             'Il capobarca, a voce bassa: le corse senza lanterne partono dal molo daziario e '
             'tornano LEGGERE. «Chi porta, torna vuoto. Il carico resta là dove va.»',
             'Da un chiattaiolo ubriaco ha sequestrato un <b>contrassegno di piombo</b>: una '
             'moneta senza re, con mezza onda al posto della faccia. «Tenetevelo. Io non l’ho '
             'mai visto.» <i>(Oggetto: prendete la carta Il Contrassegno di Piombo.)</i>',
             'La rotta delle senza-lanterne: Punta delle Scorie, poi il canale morto dell’Isola. '
             '«Là c’è solo la fonderia vecchia. Spenta da vent’anni. Be’: fino a poco fa.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='L’acqua che pesa',
                  testo='Sotto la chiglia alta l’acqua ha memoria: si sente ancora il peso che '
                        'non è mai stato scritto su nessuna pesa, pani su pani, e il fondo che li '
                        'ha contati uno a uno. L’acqua non fa la spia. Ricorda soltanto — e chi '
                        'ascolta, sa.'),
         ]),
    dict(n=8, nome='LA CAMERA DEI PESI E DELLE MISURE', voce_mappa='La Camera dei Pesi e delle Misure',
         req='L’usciere socchiude la porta sul buio delle teche: «Solo personale daziario». Poi '
             'resta lì, in ascolto, come chi aspetta di sentirvi dire le due parole del mestiere.',
         chiave=('parola', 'PARI PESO'), art='Camera dei Pesi.png', chiude=22,
         indizi=[
             'Il registro delle pese notturne: la firma del pesatore compare in nottate in cui '
             'NON era di turno. Qualcuno firmava per lui — o lui firmava per qualcuno.',
             'Il registro delle chiatte: due corse «di zavorra» verso l’Isola delle Scorie, '
             'pagate in contanti, senza mittente. <i>(Reperto B: consegnate il Registro delle '
             'Chiatte.)</i>',
             'Il pesatore notturno non si presenta da tre giorni: l’indirizzo è una stanza '
             'd’affitto già vuota. Scappato — con più paura che soldi, a giudicare da cosa ha '
             'lasciato.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La doppia pesa',
                  testo='Registro alla mano: la differenza fra la pesa dichiarata e il pescaggio '
                        'annotato dai fanalisti fa esattamente il tonnellaggio dei pani del '
                        'Quarantuno. Non un furto: una sostituzione, firmata da chi le bilance le '
                        'conosce troppo bene per sbagliarle così bene.'),
         ]),
    dict(n=9, nome='IL CIMITERO DELLE BARCHE', voce_mappa='Il Cimitero delle Barche',
         req='Il demolitore non alza la testa dal suo scafo: per lui esistono solo quelli del '
             'mestiere, quelli che sanno chiamare la sua merce col suo nome — gli altri sono '
             'gendarmi, o peggio.',
         chiave=('parola', 'GHISA DA SCAFO'), art='Cimitero delle Barche.png', chiude=None,
         indizi=[
             'Il demolitore: la ghisa da scafo l’ha venduta «a un capomastro coi guanti buoni», '
             'un mese fa, consegna al molo daziario. «Pagata in contanti. Della ghisa non chiedo '
             'mai il perché.»',
             'Learco il ramaio compra qui, con regolare bolla — e il campanaro civico della '
             'Torre ha comprato una campanella di rimpiazzo, odiando i Dossena a voce alta. Ma '
             'il registro del suo turno di guardia lo scagiona: era in Torre, tutta la notte.',
             'Tra i relitti, una <b>medaglia votiva</b> del santo con la campana in mano, '
             'consumata dai pollici. <i>(Oggetto: prendete la carta La Medaglia del '
             'Fonditore.)</i>'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La bolla di Learco',
                  testo='Il ramaio del Vecchio Mercato compra qui, con regolare bolla: date e '
                        'quantità del suo bronzo coincidono con i relitti demoliti, non coi pani '
                        'spariti. Chi ha comprato la ghisa da scafo, invece, ha pagato in '
                        'contanti — e si è fatto consegnare al molo daziario.'),
         ]),
]

# Tessere della Fonderia Vecchia (Isola delle Scorie). Fronte = letto alla
# rivelazione (tell inclusi), retro = cerca/arbitro/hook/cerca_vuoto (solo
# per chi arbitra) - stesso sistema dell'Ep. 1 (gen_gothic.spedizione).
TILES_2 = [
    dict(id='T1', nome='BANCHINA DELLE SCORIE', exits={'N': 'T2'}, start='S',
         testo='Vetro nero sotto le suole, l’acqua ferma del canale morto alle spalle. QUANDO '
               'RIVELATE QUESTA TESSERA: se non mostrate il CONTRASSEGNO DI PIOMBO, 2 Sgherri '
               'appaiono tra le scorie. Qui dovete riportare Ilario per vincere.',
         cerca_vuoto='Tra le scorie della banchina solo vetro nero, ruggine e l’acqua che vi '
                     'osserva frugare. Niente.',
         arredi=[(0, 3, 'molo'), (3, 0, 'scorie')]),
    dict(id='T2', nome='IL PIAZZALE DELLE FORME', exits={'S': 'T1', 'E': 'T3', 'N': 'T4'},
         testo='Forme di campane interrate come fosse aperte, in file ordinate. Una, in fondo, è '
               'stata usata da poco: la terra intorno è ancora calda.',
         cerca='Un badile del formatore, corto e pesante: +1 alle prove per forzare e scassinare.',
         arredi=[(1, 1, 'forma'), (2, 2, 'forma')]),
    dict(id='T3', nome='IL MAGAZZINO DELLE STAFFE', exits={'O': 'T2'},
         testo='Staffe e casseri accatastati fino alle travi, vent’anni di polvere. Tra le staffe, '
               'in basso, un luccichio d’olio fresco — qualcosa qui è stato usato ieri.',
         cerca='Una latta d’olio di colata: versato su un’arma, +1 all’attacco fino a fine round '
               '(2 usi). La latta è incastrata tra le staffe: prenderla è una scelta. Se la '
               'lasciate lì, nessuna conseguenza. Se la prendete, prova NERVI (Media): se '
               'fallita, scivolata sull’olio — 1 danno e perdete 1 azione al prossimo turno (la '
               'latta resta comunque vostra).',
         arredi=[(1, 0, 'casse'), (3, 1, 'casse'), (0, 3, 'crogiolo')]),
    dict(id='T4', nome='LA PASSERELLA SUL CANALE DI SCOLO', exits={'S': 'T2', 'N': 'T5'},
         testo='Assi sopra l’acqua di scolo, nera e veloce. Alcune sono state rattoppate — male. '
               'Chi entra in questa tessera per la prima volta prova NERVI (Facile): se fallisce, '
               'ha 1 sola azione al prossimo turno.',
         hook='Se il gruppo ha letto il Presagio «La crepa che canta» (Luogo 2) O l’Osservazione '
              '«La bolla di Learco» (Luogo 9): riconoscono le assi rattoppate — passano piano, '
              'niente prova.',
         cerca_vuoto='Sotto le assi corre solo l’acqua di scolo, nera e veloce. Meglio non '
                     'fissarla troppo a lungo.',
         arredi=[(0, 1, 'molo'), (3, 1, 'molo'), (0, 2, 'molo'), (3, 2, 'molo')]),
    dict(id='T5', nome='L’UFFICIO DEL PESATORE', exits={'S': 'T4', 'E': 'T6'},
         testo='Una scrivania, una stufa che fuma ancora, e legato alla sedia — vivo — Ilario '
               'Dossena. QUANDO RIVELATE QUESTA TESSERA: il Sicario appare accanto alla porta. '
               'Ilario si libera con Interagire (nessuna prova); si muove con voi: 3 caselle, '
               'nessuna azione.',
         cerca_vuoto='Nella stufa, registri bruciati fino alla rilegatura: qualcuno ha già fatto '
                     'pulizia. Non resta niente.',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'stufa')]),
    dict(id='T6', nome='LA SALA DEI FORNI', exits={'O': 'T5'},
         testo='Il forno grande è riacceso e la sala trema di calore. Sulla rastrelliera, '
               'campanelle grezze in fila — e due posti vuoti. QUANDO RIVELATE QUESTA TESSERA: '
               'appare lo Scoriatore con 1 Crogiolante.',
         arbitro='Le campanelle grezze: un’azione Interagire ciascuna per prenderle (contano '
                 'nell’epilogo — due sono già state portate via). Lo Scoriatore si «stona» solo '
                 'con SMORZO DI FELTRO + MARTELLO DI COLLAUDO insieme (vedi le carte Oggetto): '
                 'un oggetto solo non basta.',
         cerca_vuoto='Solo scorie e calore. Ciò che vale, qui, è in fila sulla rastrelliera — e '
                     'non si trova Cercando.',
         arredi=[(1, 2, 'crogiolo'), (2, 2, 'forma'), (3, 3, 'forma')]),
]

# Nemici nuovi (statistiche - la fonte per Bestiario e simulatore; le carte
# Creatura non portano statistiche, come sempre).
NEMICI_2 = [
    dict(nome='LO SCORIATORE', att=3, dif=8, fer=4, mov=3, dan=2, boss=True,
         tipo='Guardiano (Boss)', art='Lo Scoriatore.png',
         note='Il guardiano della fonderia dismessa: la colata di prova del Coro gli ha fuso il '
              'grembiule addosso e insegnato a risuonare.',
         bio_bestiario='Vent’anni da solo a guardia di una fonderia spenta, a parlare con le '
              'scorie. Poi qualcuno ha riacceso il forno grande, una notte, e ha versato una '
              'colata di prova: da allora il grembiule di cuoio non si toglie più — è fuso con '
              'lui — e il petto, quando cammina, rimbomba come bronzo cavo. Non è del Coro: è '
              'ciò che il Coro lascia dietro di sé quando prova i suoi strumenti su chi non può '
              'rifiutare. Colpirlo è come suonare una campana rotta; ciò che lo stona davvero è '
              'un colpo che non fa rumore (lo smorzo di feltro sul martello di collaudo: Difesa '
              '8→5 per il resto della partita, e salta la sua prossima attivazione).'),
    dict(nome='IL CROGIOLANTE', att=1, dif=7, fer=1, mov=3, dan=1,
         tipo='Operaio del Coro', art='Il Crogiolante.png',
         note='Attacca fino a 2 caselle di distanza, in linea retta (il mestolo di metallo fuso).',
         bio_bestiario='Operai pagati in contanti per non fare domande, poi pagati in altro per '
              'non poterne più fare. Portano il crogiolo come un’incensiere e il mestolo trabocca '
              'senza scottarli: il caldo, ormai, sta dalla loro parte. Attaccano da lontano — uno '
              'schizzo di metallo fuso fino a 2 caselle, in linea retta — e non arretrano mai: '
              'nessuno ha spiegato loro come si fa.'),
]

# Il mazzo Minaccia dell'episodio (23 carte: 21 + 2 Segugi del Coro nella
# busta del Bivio) vive in scripts/cardconjurer/cards-data.js (EP2_MINACCE)
# e nel simulatore dell'episodio (Fase C). Qui solo il conteggio per la
# Soluzione.


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 2 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 2')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la voce del bronzo')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_2.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 1 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 2')
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
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 39.5*mm, '! il Molo delle Chiatte (7) tace dalle 21:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 44.5*mm, '! la Camera dei Pesi (8) chiude alle 22:00')

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
    doms = ['1. DOVE è tenuto prigioniero Ilario Dossena?',
            '2. CHI ha venduto i pani del Quarantuno?',
            '3. CON COSA si passa lo sbarco senza dare l’allarme?',
            '4. COSA serve contro ciò che canta là dentro? (attenzione: potrebbe non bastare una cosa sola)']
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
    c.setTitle('Ombre su Roccamora - Episodio 2 - Spedizione')
    # copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 2 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la fonderia vecchia, isola delle scorie')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 108*mm, W - 56*mm, 55*mm, [
        Paragraph('Le 23 carte Minaccia dell’episodio (le 2 «Segugi del Coro» SOLO se il vostro '
                  'Bivio lo dice — vedi Soluzione) e le schede Nemici sono carte a parte '
                  '(cartelle <b>cards/Episodio 2/</b>). Le 6 tessere della Fonderia Vecchia sono '
                  'in <b>board/Episodio 2/</b>. Le pagine seguenti sono le note per tessera: il '
                  '<b>fronte</b> si legge ad alta voce quando una tessera viene rivelata; il '
                  '<b>retro del foglio</b> è solo per chi tiene questo fascicolo — dice cosa '
                  'nasconde ogni tessera, e si consulta SOLO quando un eroe Cerca (o prova ad '
                  'aprire qualcosa). Non giratelo prima.', BODY)])
    c.showPage()
    # retro di copertina (parita' fronte/retro, come gen_gothic)
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
    # FRONTE note tessera
    y = H - 25*mm
    for T in TILES_2:
        c.setFillColor(RED); c.setFont(F['sc'], 13)
        c.drawString(20*mm, y, '%s · %s' % (T['id'], T['nome'].lower()))
        fh = 22*mm
        frame_flow(c, 20*mm, y - 8*mm - fh, W - 40*mm, fh,
                   [Paragraph(T['testo'], st_gothic('tile', fontSize=9, leading=12, alignment=4))])
        y -= fh + 14*mm
    c.setFillColor(TEAL); c.setFont(F['i'], 9)
    c.drawString(20*mm, 18*mm, 'Quando un eroe Cerca o prova ad aprire qualcosa: chi tiene il fascicolo '
                               'legge la voce della tessera sul retro di questo foglio.')
    c.showPage()
    # RETRO note tessera - solo per chi arbitra
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(20*mm, H - 22*mm, 'cosa nasconde ogni tessera — solo per chi arbitra')
    c.setFillColor(SEPIA); c.setFont(F['i'], 8.5)
    c.drawString(20*mm, H - 28*mm, 'Consultate la voce SOLO quando un eroe Cerca (ACUME Media) o prova ad aprire '
                                   'qualcosa. Leggete l’esito, non la lista.')
    y = H - 38*mm
    for T in TILES_2:
        c.setFillColor(RED); c.setFont(F['sc'], 12)
        c.drawString(20*mm, y, '%s · %s' % (T['id'], T['nome'].lower()))
        flow = []
        if T.get('cerca'):
            flow.append(Paragraph('<b>Cercare:</b> ' + T['cerca'],
                                  st_gothic('tc2', fontSize=9, leading=12, textColor=TEAL)))
        else:
            flow.append(Paragraph('<b>Cercare:</b> ' + T.get('cerca_vuoto', 'niente da trovare qui.'),
                                  st_gothic('tn2', fontSize=9, leading=12, textColor=TEAL)))
        if T.get('hook'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph('<b>' + T['hook'] + '</b>',
                                  st_gothic('th2', fontSize=9, leading=12, textColor=RED)))
        if T.get('arbitro'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph(T['arbitro'], st_gothic('ta2', fontSize=9, leading=12, textColor=TEAL)))
        fh = 32*mm if T.get('hook') or T.get('arbitro') else \
             26*mm if (T.get('cerca') and len(T['cerca']) > 120) else 12*mm
        frame_flow(c, 20*mm, y - 6*mm - fh, W - 40*mm, fh, flow)
        y -= fh + 10*mm
    c.showPage()
    # nemici in campo + registro (token sheet arriva con l'arte, Fase D)
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 70*mm, W - 40*mm, 42*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 2</b> (PDF a parte). In campo: '
                  '<b>Sgherri</b> e <b>Sicario</b> (la squadra pagata), il <b>Crogiolante</b> '
                  '(attacca fino a 2 caselle, in linea), gli <b>Adepti</b> (arrivano a ritirare, '
                  'in coda al mazzo) e <b>lo Scoriatore</b> (il boss: si desta in T6, o al 3° '
                  'segnalino Canto). Vittoria: liberate Ilario (Interagire in T5) e riportatelo '
                  'in T1, alla chiatta. Le campanelle grezze in T6 sono l’obiettivo secondario: '
                  'ognuna recuperata pesa nell’epilogo.', BODY)])
    c.showPage()
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================ SOLUZIONE

def soluzione():
    out_path = os.path.join(OUT_DIR, 'Soluzione (non aprire).pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 2 - Soluzione (non aprire)')

    def pagina(titolo, blocchi, alto=True):
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
        'solo dopo aver risposto per iscritto alle 4 Domande. Le due carte «Segugi del Coro» '
        'vanno in una seconda busta, chiusa, con scritto «Bivio».',
        '<b>APERTURA — il Bivio dell’Episodio 1</b> (applicare PRIMA della lettera): se avete '
        '<b>BRUCIATO</b> lo spartito — il Canto parte a 0; aggiungete 1 carta «Polvere di '
        'Bronzo» in più al mazzo; il culto ha cambiato i codici: rimuovete la carta Testimone '
        '«Il facchino insonne» dal mazzo Approfondimenti (quell’uomo ha ricevuto una smentita '
        'anonima, e ha smesso di parlare). Se lo avete <b>CONSERVATO</b> — la spedizione parte '
        'con il Canto a 1 (lo spartito chiama); mescolate le 2 carte «Segugi del Coro» nel '
        'mazzo Minaccia; designate chi porta lo spartito.',
    ])
    pagina('la verità', [
        'Il capomastro <b>Muzio Sartorio</b> giocava — e perdeva — ai tavoli protetti dalla '
        'Malavita. Un intermediario elegante e senza volto (lettere sigillate, sigla '
        '<b>«C.B.»</b>) gli ha ripianato i debiti in cambio dei <b>pani del Quarantuno</b>: il '
        'bronzo delle campane della confraternita bandita nel 1741, requisito e custodito dal '
        'dazio. Sartorio ha comprato ghisa da scafo al Cimitero delle Barche, ha costretto il '
        'pesatore notturno a firmare pese false, ha sostituito i pani sotto sigillo e li ha '
        'spediti su chiatte senza lanterne alla <b>Fonderia Vecchia dell’Isola delle Scorie</b>, '
        'dove una squadra pagata li rifonde in campanelle grezze da consegnare a peso.',
        '<b>Ilario Dossena</b> non ha visto nulla: ha SENTITO. Al provino, il bronzo di '
        'prestito suonava sbagliato. Ha risalito la pesa, ha capito, e lo ha detto alla persona '
        'sbagliata. Lo tengono legato nell’ufficio del pesatore, vivo: è l’unico che sappia '
        'rifinire la colata senza spaccarla, e il compratore paga solo campanelle che cantano.',
        'Chi compra è il <b>Coro Sommerso</b>: il bronzo del 1741 è il bronzo delle SUE '
        'campane. Il culto non costruisce strumenti nuovi — ricompra i suoi. Nessun cultista '
        'compare in scena fino alla Fonderia: solo denaro, lettere e ciò che una colata di '
        'prova ha già fatto al guardiano.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è tenuto Ilario?</b> Nella Fonderia Vecchia, sull’Isola delle Scorie. '
        '<i>Esatta:</i> conoscete l’approdo giusto — nel 1° round non si pesca nessuna carta '
        'Minaccia. <i>Sbagliata:</i> arrivate dal lato sbagliato dell’isola — la spedizione '
        'parte con 1 segnalino Canto in più.',
        '<b>2. CHI ha venduto i pani?</b> Muzio Sartorio, il capomastro. <i>Esatta:</i> '
        'Vantaggio «Smascherato»: una volta, quando piazzereste Sgherri o il Sicario, gridate '
        'il suo nome — non vengono piazzati (la squadra esita: il padrone è finito). '
        '<i>Sbagliata:</i> nessun effetto.',
        '<b>3. CON COSA si passa?</b> Col Contrassegno di Piombo (Molo delle Chiatte). '
        '<i>Ce l’avete:</i> sbarco silenzioso — l’apparizione di T1 non ha luogo. <i>Non ce '
        'l’avete:</i> i 2 Sgherri di T1 appaiono, come da tessera.',
        '<b>4. COSA serve contro ciò che canta?</b> Lo Smorzo di Feltro E il Martello di '
        'Collaudo, insieme: un’azione adiacente allo Scoriatore lo «stona» — Difesa 8→5 per il '
        'resto della partita, e salta la sua prossima attivazione. Un oggetto solo non basta. '
        '<i>Nota per chi arbitra:</i> la Medaglia del Fonditore è un’esca — nessun effetto.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente solo tre carte — '
        'l’Osservazione «Le mani del capomastro» (L1), la Testimonianza «Il facchino insonne» '
        '(L3) e la Testimonianza «Fossa» (L6). Se il gruppo non ne ha letta nessuna, giudicate '
        'con elasticità una risposta «vicina» (es. «qualcuno della fonderia, col pesatore»).',
        '<b>Vantaggio d’Indagine (due vie):</b> Slancio con 3+ ore avanzate O 7+ luoghi '
        'visitati; Preparati con 1-2 ore O 6 luoghi. Dossier completo (0 ore avanzate): 1 '
        'gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio e boss', [
        '<b>Montaggio</b> (tessere in board/Episodio 2/, coperte tranne T1):<br/>'
        'T1 Banchina (ingresso, da Sud) → T2 Piazzale delle Forme → a Est T3 Magazzino delle '
        'Staffe (ramo opzionale) → a Nord T4 Passerella → T5 Ufficio del Pesatore (Ilario) → a '
        'Est T6 Sala dei Forni (lo Scoriatore).',
        '<b>Mazzo Minaccia:</b> le 21 carte dell’episodio (più le 2 dei Segugi se il Bivio lo '
        'dice). Il Canto funziona come sempre: carte crescendo + 1 segnalino automatico ogni 4° '
        'round; al 3° segnalino lo Scoriatore si desta in anticipo (piazzatelo sulla tessera '
        'più lontana dagli eroi, con 1 Crogiolante di scorta) e da quel momento ogni Fase '
        'Minaccia pesca 1 carta in più, per sempre.',
        '<b>Lo Scoriatore</b> (statistiche nel Bestiario; Ferite per taglia già tabellate): '
        'si desta quando rivelate T6, o in anticipo col Canto. La sua debolezza è la Domanda 4. '
        '<b>Due finali di vittoria:</b> potete fuggire con Ilario senza affrontarlo — ma le '
        'campanelle restano al Coro (epilogo peggiore, non sconfitta). Ogni campanella '
        'recuperata (Interagire in T6) pesa nell’epilogo.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «Ilario si guarda le '
        'mani per tutto il ritorno. “Il bronzo era il loro”, dice infine. “Adesso so perché '
        'suonava sbagliato: non era stonato. Era nostalgico — voleva tornare a casa.” Poi, più '
        'piano: “Quelli che mi tenevano parlavano a bassa voce di un posto. Lo chiamavano: le '
        'voci del pozzo.”» — Se avete recuperato tutte le campanelle: il Coro ha perso la voce '
        'nuova, per ora. Se ne mancano (due erano già partite prima del vostro arrivo): '
        'annotatelo sul Frammento — quelle campanelle canteranno da qualche parte.',
        '<b>FRAMMENTO DI CAMPAGNA N. 2:</b> <i>«Il Coro non costruisce strumenti nuovi: '
        'ricompra i SUOI. Il bronzo del 1741 ricorda il canto. Segnate: ciò che fu del Coro '
        'vuole tornare al Coro.»</i> Conservatelo per il finale di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> Ilario può rifondere la campana di '
        'San Teodoro col bronzo recuperato — o «stonarla» di proposito, come un vaccino:<br/>'
        '<b>Rifonderla giusta.</b> La città riavrà la sua voce, e Padre Marani un alleato di '
        'bronzo (Episodio 3: Litania utilizzabile 2 volte invece di 1). Ma uno strumento '
        'accordabile in più suona sopra Roccamora: il mazzo dell’Episodio 3 aggiunge 1 carta '
        'crescendo.<br/>'
        '<b>Stonarla.</b> San Teodoro resterà rauca, e la piazza non ve lo perdonerà (un '
        'testimone in meno vi parlerà, nell’Episodio 3). Ma il vaccino funziona: l’Episodio 3 '
        'parte con la soglia del Canto a 4 segnalini invece di 3.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 2 e non parlatene più fino '
        'all’Episodio 3.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite — Tempra, Fibra, Revolver, '
        'Lanterna schermata, Borsa di garze (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

def luoghi():
    """Luoghi.pdf (fronte/retro + indice citta'): arriva con l'arte dei
    luoghi (Fase D) - come gen_preludio, si salta con un avviso finche'
    mancano i file. Il pattern da riusare e' quello di gen_narrator
    (header/indizi_block/pagina_retro_luogo/pagina_indice_citta, funzioni
    parametriche) sui dati LUOGHI_2 qui sopra."""
    from deluxe_style import ARTWORKS_DIR
    missing = [L['art'] for L in LUOGHI_2
               if not os.path.exists(os.path.join(ARTWORKS_DIR, L['art']))]
    if missing:
        print('SALTO Luoghi.pdf (Episodio 2): manca arte in artworks/:', ', '.join(sorted(set(missing))))
        print('  (genera con i prompt in PROMPT-MIDJOURNEY-Episodio-2.md)')
        return
    raise NotImplementedError('Fase D: costruire su gen_narrator (vedi docstring)')


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    # Bestiario: gen_bestiario con i nemici dell'episodio + i comuni riusati
    # (salta chi non ha ancora l'arte, come sempre)
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_2
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LO SCORIATORE', 'IL CROGIOLANTE', 'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 2')
    print('OK episodio 2')
