# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 2: La voce del bronzo (Episodio 2/pdf/).

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
from gen_gothic import registro_ferite, token_sheet, TOKEN_EROI, st as st_gothic

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 2', 'pdf')
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
# «senza lanterne» da L2 e L3, «ghisa da scafo» da L1 e L3 (indizio core (c) -
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
             'banco il martello di collaudo di Ilario — lui non lo avrebbe mai lasciato a '
             'terra. <i>(Oggetto: prendete la carta Il Martello di Collaudo.)</i>',
             'I pani consegnati dal dazio, ancora nei casseri, non sono bronzo: ghisa da '
             'scafo, piena di sabbia di mare — roba da demolitori di barche. E il libro paga '
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
             'Lo smorzo di feltro — il cuscino che tace le campane — è ancora appeso alla '
             'trave, dimenticato dal provino. <i>(Oggetto: prendete la carta Lo Smorzo di '
             'Feltro.)</i>',
             'Dal parapetto si vedono i moli daziari. Ruggero, la notte del furto, ha visto '
             'chiatte senza lanterne scivolare verso ponente: «è così che i barcaioli '
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
             'daziere borbotta quando la bilancia torna — «pari peso». La sanno tutti, '
             'qui dentro. Fuori di qui, nessuno.',
             'Un facchino insonne, pagato un bicchiere: la seconda chiatta senza lanterne '
             'ha passato la Punta delle Scorie alle 3 in punto. «Diretta al canale morto. Là non '
             'c’è niente. Cioè: non c’era.»',
             'Un sensale ubriaco giura il contrario, e non molla: «il bronzo è salito al Vecchio '
             'Mulino, l’ho caricato io con queste mani». Ma quel «bronzo» pesava troppo poco: era '
             'ghisa da scafo, fusa male. Nessuno lo smentisce — qui dentro le storie non si pesano.'],
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
             'La zavorra rimasta nei casseri di carico è ghisa da scafo: al Deposito non è '
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
             'Tra le carte del banco, dimenticata, la polizza del Monte intestata a '
             'Sartorio: riscattata, timbrata — la fretta lascia ricevute. <i>(Oggetto: prendete '
             'la carta La Polizza del Monte.)</i>',
             'Fossa, gratis per una volta: «Coi facchini del dazio ci lavoro da trent’anni: al '
             'piantone basta dire “pari peso”, come al cambio turno. Ma non ditegli chi ve '
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
             'Da un chiattaiolo ubriaco ha sequestrato un contrassegno di piombo: una '
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
             'Tra i relitti, una medaglia votiva del santo con la campana in mano, '
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
              '8→5 per il resto della partita, e salta la sua prossima attivazione). Ai tavoli '
              'da 2-3 eroi il bronzo non gli risponde: non recupera mai ferite, qualunque cosa '
              'dicano le carte Crescendo (regola delle taglie, vedi Regolamento).'),
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
                  '(cartella <b>Episodio 2/cards/</b>). Le 6 tessere della Fonderia Vecchia sono '
                  'in <b>Episodio 2/board/</b>. Le pagine seguenti sono le note per tessera, una tessera per foglio: il '
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
    # Note per tessera: una tessera per FOGLIO, nello stile dei Luoghi
    # (stesso pattern di gen_gothic.spedizione). Fronte = arte + descrizione
    # estesa + testo letto alla rivelazione; retro fisico = cosa nasconde,
    # solo per chi arbitra - una voce per OGNI tessera, anche vuota. Le
    # coppie restano consecutive nel PDF: una stampa fronte/retro normale
    # le allinea sullo stesso foglio.
    import gen_narrator as N
    for T in TILES_2:
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_2[T['id']],
                                TILE_ART_2[T['id']], T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_2.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
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
                  'ognuna recuperata pesa nell’epilogo. Ai tavoli da 2-3 eroi lo Scoriatore '
                  '<b>non recupera mai ferite</b> dalle carte Crescendo (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_2())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_2():
    """Miniature dell'Episodio 2: copie massime = spawn iniziali delle tessere
    + carte Minaccia che piazzano (se i segnalini finiscono, il piazzamento
    non ha luogo - regola del Regolamento). Ilario e' il prigioniero-scorta
    (come Ruggero in Ep.1); i 3 segnalini Canto usano le arti delle carte
    Crescendo dell'episodio."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x4) · SICARI (x2)', [('Lo Sgherro.png', 4), ('Il Sicario.png', 2)]),
        ('CROGIOLANTI (x3) · ADEPTI (x4)', [('Il Crogiolante.png', 3),
                                            ('Adepto Incappucciato.png', 4)]),
        ('SCORIATORE · ILARIO', [('Lo Scoriatore.png', 1), ('Ilario.png', 1)]),
        ('CANTO', [('Il primo rintocco.png', 1), ('Il bronzo risponde.png', 1),
                   ('La lega canta.png', 1)]),
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
        'Chi compra è il Coro Sommerso: il bronzo del 1741 è il bronzo delle SUE '
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
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo (0 ore avanzate): 1 '
        'gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio e boss', [
        '<b>Montaggio</b> (tessere in Episodio 2/board/, coperte tranne T1):<br/>'
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

# Descrizioni estese per chi arbitra (bibbia di scrittura: stessi fatti
# della carta, molto piu' aria - un dettaglio che si muove, mai indizi
# nuovi). Dizionario dedicato, MAI il campo testo della carta.
LUOGHI2_DESC = {
    1: "La fonderia \u00e8 ferma come si ferma un cuore: la forma della campana nuova "
       "aspetta al centro del pavimento, una fossa vestita di mattoni refrattari, e "
       "il paranco sopra di essa oscilla di un dito, avanti e indietro, senza vento. "
       "Gli operai lavorano a met\u00e0 voce e a met\u00e0 gesto. Sul banco di Ilario gli "
       "attrezzi sono appesi in fila per taglia \u2014 e il gancio vuoto del martello, in "
       "quella fila perfetta, urla.",
    2: "Ottanta gradini, e a ogni giro di scala il freddo cambia odore: cera vecchia, "
       "poi corda, poi bronzo. La campana grande porta la crepa come una ferita mal "
       "cucita, e quando il vento gira, la crepa respira \u2014 un sibilo sottile che "
       "Ruggero finge di non sentire. \u00c8 tornato a fare il suo mestiere, ma dorme "
       "ancora con la lanterna accesa.",
    3: "Fumo, sego e birra: l'osteria dei facchini non chiude mai davvero, cambia "
       "solo turno. Sotto la stadera d'ottone appesa alle travi si giocano paghe "
       "intere, e le voci salgono e scendono come la marea. Quando entrate voi, "
       "per un momento, tutte insieme si abbassano \u2014 poi qualcuno ride troppo "
       "forte, e il fiume riprende.",
    4: "Il corpo dei magazzini daziari \u00e8 una cattedrale di iuta e piombo: colonne "
       "di casse fino al soffitto, corridoi numerati col gesso. In fondo, dietro "
       "tre sbarre, le rastrelliere del bronzo di stato \u2014 i sigilli pendono "
       "intatti, troppo intatti, e il piantone evita di guardarli, come si evita "
       "di guardare una bara aperta.",
    5: "La corte della Faenza \u00e8 tre piani di ringhiere e panni stesi che gocciolano "
       "nel buio. La stanza del capomastro sa di lana nuova: vestiti coi cartellini, "
       "una valigia pronta dietro la porta, ricevute in pila sotto la candela. \u00c8 la "
       "stanza di uno che sta per scappare \u2014 e che da giorni non ci dorme.",
    6: "Il banco di Fossa non \u00e8 cambiato di un chiodo dal Preludio: la grata, la "
       "lampada verde, il registro rilegato in tela cerata. Fossa vi riconosce \u2014 o "
       "riconosce il modo in cui si entra da lui sapendo gi\u00e0 cosa chiedere \u2014 e per "
       "una volta, dice lui, la tariffa non serve. Il favore se lo segna comunque, "
       "da qualche parte dietro gli occhi.",
    7: "Le chiatte dormono in due file, chiglia contro chiglia, e le cime cigolano "
       "piano come una conversazione che non vuole farsi sentire. Una sola barca "
       "galleggia alta, leggera, sbagliata. Il capobarca fuma guardando l'acqua: "
       "smonta alle nove, e da come tiene le spalle si capisce che il momento non "
       "arriva mai abbastanza presto.",
    8: "La Camera dei Pesi \u00e8 il silenzio fatto ufficio: teche di campioni d'ottone, "
       "registri fino al soffitto, l'odore di ceralacca e polvere di decenni. "
       "L'usciere vi accompagna senza rumore e resta sulla porta, in ascolto \u2014 "
       "alle dieci in punto, da trent'anni, spegne le lampade una a una, e la "
       "burocrazia di Roccamora chiude gli occhi.",
    9: "Nell'ansa morta del canale le barche vengono a morire: chiglie spaccate, "
       "costole all'aria, e il vento che tra gli scafi vuoti trova sempre una nota "
       "lunga, bassa, da chiesa sconsacrata. Il demolitore lavora anche di notte, "
       "a lume di forgia \u2014 il ferro non aspetta, dice, e nemmeno lui: \u00e8 uno che "
       "alle domande preferisce i prezzi.",
}

# Carte Oggetto per luogo (sotto-sezione "carte da prendere" degli indizi -
# stesso pattern di OGGETTI_LUOGO_P nel Preludio).
OGGETTI_LUOGO_2 = {
    1: ['Il Martello di Collaudo'],
    2: ['Lo Smorzo di Feltro'],
    6: ['La Polizza del Monte'],
    7: ['Il Contrassegno di Piombo'],
    9: ['La Medaglia del Fonditore'],
}

# arte tessere del fascicolo (le stesse dei board)
TILE_ART_2 = {t['id']: t['id'] + '-ep2.png' for t in TILES_2}

# taratura ritagli del fascicolo Luoghi (vedi bibbia: verificare A VIDEO,
# mai fidarsi del ritaglio di default) - overscan basso = meno zoom
LUOGHI2_CROP = {
    2: dict(overscan=0.1),    # la campana intera, non solo il fianco
}

# Descrizioni estese delle tessere (fascicolo Spedizione, pagine
# fronte/retro nello stile dei Luoghi): stessa bibbia di scrittura di
# LUOGHI2_DESC - stessi fatti del testo di rivelazione, molto piu' aria,
# un dettaglio che si muove, mai indizi nuovi.
TESSERE_DESC_2 = {
    'T1': "La banchina dell'isola è fatta di scarti: vetro nero che scricchiola sotto "
          "le suole, ruggine, scorie pressate da vent'anni di scarichi. Il canale morto "
          "alle spalle non ha corrente, e ciò che galleggia resta dov'è, in un ordine "
          "che nessuno ha voluto. Dall'altra parte, la fonderia: finestre cieche, e una "
          "sola riga di fumo dritta nel cielo — un camino che non dovrebbe più fumare. "
          "La chiatta che vi ha portati fin qui sembra già pentita.",
    'T2': "Le forme delle campane dormono interrate in file ordinate, fosse aperte "
          "vestite di mattoni refrattari, come una semina di tombe che aspetta il suo "
          "raccolto. La brina si è posata dappertutto tranne che su una, in fondo: lì "
          "la terra è smossa, scura, e tenendoci la mano sopra si sente ancora un "
          "tepore che con la notte non c'entra niente. Tra le file il vento gira basso "
          "e porta, a folate, l'odore del metallo caldo.",
    'T3': "Staffe, casseri e morsetti accatastati fino alle travi: vent'anni di polvere "
          "hanno arrotondato ogni spigolo e reso tutto dello stesso grigio. Ma in "
          "basso, tra le staffe, la polvere manca: un luccichio d'olio fresco che la "
          "lanterna fa brillare, una pista di dita e di trascinamenti. Qualcuno, qui "
          "dentro, è venuto a prendere qualcosa di preciso — e sapeva dove guardare. "
          "Il buio tra le pile è fitto, e ha gli angoli giusti per aspettare.",
    'T4': "Le assi corrono basse sopra l'acqua di scolo, nera, veloce, l'unica cosa "
          "viva dell'isola. Alcune sono nuove, inchiodate di fretta e male, e sotto il "
          "peso rispondono con una nota diversa — più alta, più corta — che i piedi "
          "imparano prima della testa. Il corrimano è un ricordo: un filo di ferro "
          "molle che è meglio non ringraziare. A metà passerella l'odore cambia: non "
          "più scorie, ma metallo caldo. Di là si lavora.",
    'T5': "Un ufficio piccolo e ostinato nel ventre della fonderia: la scrivania con "
          "la pesa da banco, chiodi con le ricevute infilzate, e una stufa che fuma "
          "ancora — qualcuno l'ha caricata da poco, e contava di tornare. Legato alla "
          "sedia, con gli occhi che vi trovano subito, Ilario Dossena: vivo, e con "
          "l'aria di chi ha passato le ultime ore a contare i propri errori. Oltre la "
          "parete di assi, il calore grande della sala dei forni preme come una mano.",
    'T6': "La sala grande trema di calore: il forno riacceso ha una voce bassa e "
          "continua che si sente nelle ossa prima che nelle orecchie, e la luce "
          "arancione muove le ombre anche quando nessuno si muove. Sulla rastrelliera, "
          "in fila come canne d'organo, le campanelle grezze della colata — e due "
          "posti vuoti, due assenze precise che nessuno si è preso il disturbo di "
          "nascondere. Il pavimento è segnato da colate vecchie, e da una nuova, "
          "ancora lucida.",
}

# Esami di Carbone (vedi gen_cards.ESAMI_CARBONE per la bibbia di scrittura)
ESAMI_CARBONE_2 = {
    'CONTRASSEGNO': '«Piombo da sigillo, rifuso una volta sola: sotto la patina si legge '
                'ancora mezzo stemma daziario. Chi conia questi gettoni ha accesso ai '
                'sigilli del Deposito — o a chi ne raccoglie i trucioli.»',
    'MARTELLO DI COLLAUDO': '«L’impugnatura è consumata dalla mano di Ilario, ma guardate la '
                'testa: un solo segno di provino recente, netto. Il suono sbagliato è '
                'stato sentito una volta — e subito dopo il martello è finito sotto il '
                'banco. Nessun fonditore lo posa lì: gli è caduto, o gliel’hanno fatto '
                'cadere di mano.»',
    'LETTERA DI C.B.': '«Carta di pregio, ma piegata coi guanti: nessun grasso di dita, '
                'nemmeno un’ombra. E l’inchiostro è ferro-gallico da registro, non da '
                'salotto — chi ha scritto queste righe passa le giornate a firmare '
                'carte d’ufficio.»',
}

# Carte Oggetto nascoste nelle tessere (retro delle pagine tessera).
OGGETTI_TESSERA_2 = {'T2': ['Un Badile del Formatore'],
                     'T3': ['Una Latta d’Olio di Colata ⚠ rischioso']}


def luoghi():
    """Luoghi.pdf Episodio 2 (fronte/retro + indice citta'): costruito con
    le funzioni parametriche di gen_narrator, sui dati LUOGHI_2. I luoghi
    senza arte usano un placeholder con avviso (si rigenera quando l'arte
    arriva)."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'derelict warehouses over black still water.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 2 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_2, 'Episodio 2')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> \u2014 carta \u201c' + t + '\u201d' for t in OGGETTI_LUOGO_2.get(n, [])]

    for L in LUOGHI_2:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI2_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola \u00ab' + valore.lower() + '\u00bb' if tipo_chiave == 'parola'
                          else 'l\u2019oggetto \u201c' + valore.lower() + '\u201d')
            entrata = 'si entra con ' + chiave_txt + ' \u2014 solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI2_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    # (le pagine tessera vivono nel fascicolo Spedizione, fronte/retro -
    # vedi spedizione(): questo fascicolo copre solo l'Indagine)
    N.pagina_esami_carbone(c, ESAMI_CARBONE_2)
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
    gen_bestiario.NEMICI.extend([n for n in NEMICI_2
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['LO SCORIATORE', 'IL CROGIOLANTE', 'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 2')
    print('OK episodio 2')
