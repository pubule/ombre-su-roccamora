# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Regolamento + Soluzione (PDF)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                PageBreak, Table, TableStyle, HRFlowable)
from deluxe_style import (register_fonts, parchment, rule_border, seal, F,
                          INK, RED, TEAL, GOLD, PAPER_DK)

register_fonts()
PAPER = PAPER_DK


def bg(canv, doc):
    canv.saveState()
    parchment(canv, A4[0], A4[1], seed=11 + doc.page)
    rule_border(canv, A4[0], A4[1])
    canv.setFillColor(GOLD)
    canv.setFont(F['sc'], 8)
    canv.drawCentredString(A4[0]/2, 4.2*mm, 'ombre su roccamora \u00b7 societ\u00e0 del lume')
    canv.restoreState()


def bg_cover(canv, doc):
    bg(canv, doc)
    canv.saveState()
    seal(canv, A4[0] - 32*mm, A4[1] - 34*mm, r=13*mm, angle=-14)
    canv.restoreState()


S = {}
S['title'] = ParagraphStyle('t', fontName=F['sc'], fontSize=31, leading=36,
                            textColor=RED, alignment=1, spaceAfter=4)
S['subtitle'] = ParagraphStyle('st', fontName=F['i'], fontSize=13.5, leading=18,
                               textColor=INK, alignment=1, spaceAfter=14)
S['h1'] = ParagraphStyle('h1', fontName=F['sc'], fontSize=15, leading=19,
                         textColor=RED, spaceBefore=14, spaceAfter=6)
S['h2'] = ParagraphStyle('h2', fontName=F['b'], fontSize=11, leading=14,
                         textColor=TEAL, spaceBefore=10, spaceAfter=3)
S['body'] = ParagraphStyle('b', fontName=F['r'], fontSize=10.5, leading=14,
                           textColor=INK, spaceAfter=5, alignment=4)
S['li'] = ParagraphStyle('li', parent=S['body'], leftIndent=14, bulletIndent=4, spaceAfter=3)
S['box'] = ParagraphStyle('bx', parent=S['body'], backColor=PAPER, borderColor=GOLD,
                          borderWidth=0.9, borderPadding=7, spaceBefore=6, spaceAfter=8)
S['warn'] = ParagraphStyle('w', fontName=F['sc'], fontSize=20, leading=26,
                           textColor=RED, alignment=1, spaceBefore=20, spaceAfter=20)


def P(txt, st='body'):
    return Paragraph(txt, S[st])


def LI(txt):
    return Paragraph(txt, S['li'], bulletText='\u2022')


def hr():
    return HRFlowable(width='100%', thickness=0.8, color=TEAL, spaceBefore=4, spaceAfter=8)


# ----------------------------------------------------------------- REGOLAMENTO
def regolamento():
    doc = SimpleDocTemplate('/mnt/user-data/outputs/Ombre-su-Roccamora-01-Regolamento.pdf',
                            pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                            topMargin=20*mm, bottomMargin=20*mm,
                            title='Ombre su Roccamora - Regolamento')
    e = []
    e.append(Spacer(1, 30))
    e.append(P('OMBRE SU ROCCAMORA', 'title'))
    e.append(P('Un gioco investigativo cooperativo a puntate \u2014 per 2\u20135 giocatori', 'subtitle'))
    e.append(hr())
    e.append(P("Roccamora, 1889. Una citt\u00e0 di canali neri, campanili e vicoli che non figurano "
               "sulle mappe. Voi siete i membri della <b>Societ\u00e0 del Lume</b>, un piccolo circolo "
               "privato che indaga su ci\u00f2 che la gendarmeria preferisce non vedere. Ogni episodio "
               "\u00e8 un caso. Ogni caso risolto \u00e8 un frammento di un mistero pi\u00f9 grande, che "
               "dorme sotto la citt\u00e0 dal 1741."))
    e.append(P('COSA VI SERVE', 'h1'))
    e.append(LI('Questo regolamento e i PDF dell\u2019episodio, stampati (vedi \u201cCome stampare\u201d in fondo).'))
    e.append(LI('Due dadi a sei facce (2d6), una matita ciascuno.'))
    e.append(LI('Forbici per ritagliare carte, tessere e segnalini.'))
    e.append(LI('Una busta in cui sigillare il PDF <b>Soluzione</b>: si apre solo a fine indagine.'))

    e.append(P('I PERSONAGGI', 'h1'))
    e.append(P("Il roster della Societ\u00e0 conta <b>sei eroi</b>: in tavola ne scendono al massimo "
               "cinque, gli altri restano di riserva (potete cambiarli tra un episodio e l\u2019altro; "
               "migliorie e cicatrici restano a chi le ha guadagnate). Ogni giocatore sceglie un eroe "
               "(in 2 giocatori potete anche guidarne due a testa). Ogni eroe ha tre caratteristiche:"))
    e.append(LI('<b>ACUME</b> \u2014 osservare, dedurre, scassinare, cercare.'))
    e.append(LI('<b>VIGORE</b> \u2014 combattere, forzare, resistere.'))
    e.append(LI('<b>NERVI</b> \u2014 sangue freddo davanti a trappole, buio e orrori.'))
    e.append(P("Inoltre: <b>Salute</b> (i danni che potete subire), <b>Difesa</b> (quanto \u00e8 difficile "
               "colpirvi) e un\u2019<b>Abilit\u00e0 unica</b>. Tutto \u00e8 sulla scheda personaggio."))
    e.append(P('Le prove', 'h2'))
    e.append(P('<b>Tirate 2d6 e sommate la caratteristica richiesta.</b> Dovete raggiungere la '
               'difficolt\u00e0: <b>Facile 7 \u2022 Media 9 \u2022 Difficile 11</b>. '
               'Una volta per episodio, ogni eroe pu\u00f2 <b>ritentare</b> una prova fallita '
               '(segnate la casella \u201cSecondo fiato\u201d sulla scheda).', 'box'))

    e.append(P('COME SI GIOCA UN EPISODIO', 'h1'))
    e.append(P("Ogni episodio si gioca in una serata (90\u2013150 minuti) e ha due fasi: "
               "l\u2019<b>Indagine</b> in citt\u00e0 e la <b>Spedizione</b> nel luogo che avrete scoperto. "
               "Quanto bene indagate determina quanto sar\u00e0 dura la spedizione."))

    e.append(P('FASE 1 \u2014 L\u2019INDAGINE', 'h1'))
    e.append(LI('Disponete le <b>carte Luogo</b> coperte al centro del tavolo. Alcune riportano '
                '\u201cDisponibile dall\u2019inizio\u201d: quelle potete visitarle subito. Le altre indicano '
                'la <b>parola chiave</b> o l\u2019<b>oggetto</b> che serve per sbloccarle.'))
    e.append(LI('Avete <b>8 ore</b>, dalle 18:00 alle 2:00: segnatele sul Taccuino. '
                '<b>Ogni visita a un luogo costa 1 ora</b> (anche rivisitarlo). Il tempo non basta per tutto: '
                'scegliete. L\u2019episodio pu\u00f2 legare eventi all\u2019orologio (luoghi che chiudono, '
                'testimoni che spariscono): applicateli quando barrate l\u2019ora corrispondente.'))
    e.append(LI('Per visitare un luogo, girate la carta e leggete ad alta voce testo e indizi. '
                'Prendete appunti sul Taccuino: nomi, orari, parole chiave in MAIUSCOLO.'))
    e.append(LI('Quando trovate una <b>parola chiave</b> o un <b>oggetto</b>, potete da quel momento '
                'visitare i luoghi che li richiedono.'))
    e.append(LI('Alcune carte hanno un <b>Indizio nascosto</b>: si legge solo se l\u2019abilit\u00e0 di un '
                'eroe presente lo consente.'))
    e.append(P('Chiudere l\u2019indagine', 'h2'))
    e.append(P("Quando esaurite le ore (o prima, se vi sentite pronti) rispondete <b>per iscritto</b> "
               "alle <b>4 Domande</b> sul Taccuino: discutetene insieme, \u00e8 il cuore del gioco. "
               "Poi aprite la busta della <b>Soluzione</b>: per ogni risposta esatta otterrete un "
               "<b>Vantaggio</b> per la Spedizione; per certe risposte sbagliate, una complicazione. "
               "La Soluzione vi dir\u00e0 anche come preparare la mappa."))

    e.append(PageBreak())
    e.append(P('FASE 2 \u2014 LA SPEDIZIONE', 'h1'))
    e.append(P("Costruite il luogo con le <b>tessere Mappa</b>, a faccia in gi\u00f9 tranne quella "
               "d\u2019ingresso, seguendo lo schema della Soluzione. Mischiate il <b>mazzo Minaccia</b>. "
               "Piazzate i segnalini eroe sull\u2019ingresso. Si gioca in <b>round</b>:"))
    e.append(P('1. Turno degli eroi', 'h2'))
    e.append(P('In qualsiasi ordine, ogni eroe compie <b>2 azioni</b> (anche la stessa due volte):'))
    e.append(LI('<b>Muovere</b> \u2014 fino a 4 caselle (niente diagonali, non si attraversano nemici o mobili).'))
    e.append(LI('<b>Attaccare</b> \u2014 un nemico adiacente: 2d6 + VIGORE (+1 se armato) \u2265 Difesa '
                'del nemico \u2192 gli infliggete 1 ferita.'))
    e.append(LI('<b>Cercare</b> \u2014 prova di ACUME Media: se riuscita, trovate ci\u00f2 che la tessera '
                'nasconde (una sola volta per tessera).'))
    e.append(LI('<b>Interagire</b> \u2014 aprire porte e grate, tirare leve, liberare prigionieri.'))
    e.append(LI('<b>Usare un oggetto</b> \u2014 come indicato sull\u2019oggetto.'))
    e.append(LI('<b>Rianimare</b> \u2014 un eroe a terra adiacente torna a 2 Salute.'))
    e.append(P('Quando un eroe esce da una tessera verso una tessera coperta, <b>rivelatela</b> e '
               'leggetene subito il testo.'))
    e.append(P('2. Fase Minaccia', 'h2'))
    e.append(P('Pescate <b>1 carta Minaccia ogni 2 eroi</b> (arrotondando per eccesso: 1 carta in '
               '2 giocatori, 2 carte in 3\u20134, 3 carte in 5) e applicatene gli effetti.', 'box'))
    e.append(P('Il mazzo Minaccia \u00e8 il vostro \u201cmaster\u201d automatico: nessun giocatore interpreta '
               'il nemico. Un giocatore qualsiasi pesca (consiglio: nominate un <b>custode del '
               'mazzo</b> a inizio serata, o pescate a turno), legge la carta ad alta voce ed '
               'esegue ci\u00f2 che dice: \u00e8 sempre il testo a stabilire dove piazzare nemici ed '
               'effetti. <b>Regola d\u2019oro per ogni ambiguit\u00e0</b> (uscite equidistanti, eroi a '
               'pari distanza, pi\u00f9 bersagli validi): decide il gruppo scegliendo <b>l\u2019opzione '
               'peggiore per s\u00e9</b>. Vale in tutta la spedizione, anche per i nemici.'))
    e.append(P('3. Turno dei nemici', 'h2'))
    e.append(LI('Ogni nemico si muove del suo Movimento verso l\u2019eroe pi\u00f9 vicino (a pari '
                'distanza vale la regola d\u2019oro: contro di s\u00e9).'))
    e.append(LI('Se adiacente a un eroe, attacca: 2d6 + Attacco del nemico \u2265 Difesa dell\u2019eroe '
                '\u2192 l\u2019eroe subisce il Danno indicato.'))
    e.append(P('Ferite e sconfitta', 'h2'))
    e.append(P("A 0 Salute un eroe cade <b>a terra</b>: non agisce finch\u00e9 non viene rianimato. "
               "Se tutti gli eroi sono a terra, l\u2019episodio \u00e8 fallito: potete rigiocarlo, ma il "
               "nemico avr\u00e0 fatto progressi (l\u2019episodio dir\u00e0 come)."))

    e.append(P('PRECISAZIONI (per i dubbi al tavolo)', 'h1'))
    e.append(LI('<b>Ruggero</b> \u2014 non \u00e8 un eroe: i nemici lo <b>ignorano</b> (il culto lo vuole '
                'vivo per il rituale). Si muove nel turno degli eroi, fino a 4 caselle, e non compie azioni.'))
    e.append(LI('<b>Eroi a terra</b> \u2014 i nemici li ignorano: puntano sempre l\u2019eroe in piedi pi\u00f9 vicino.'))
    e.append(LI('<b>Mazzo Minaccia esaurito</b> \u2014 rimescolate gli scarti e continuate. I segnalini '
                'Canto gi\u00e0 in gioco restano.'))
    e.append(LI('<b>Oggetti</b> \u2014 ci\u00f2 che trovate nell\u2019Indagine \u00e8 del gruppo: all\u2019inizio della '
                'Spedizione decidete chi porta cosa (annotatelo). In Spedizione, passare un oggetto a '
                'un eroe adiacente \u00e8 gratuito, una volta per turno; un eroe a terra pu\u00f2 essere '
                'alleggerito da chi gli \u00e8 adiacente.'))
    e.append(LI('<b>Cercare fallito</b> \u2014 si pu\u00f2 ritentare spendendo altre azioni, anche con eroi '
                'diversi. Una volta trovato ci\u00f2 che la tessera nasconde, la tessera \u00e8 esaurita.'))
    e.append(LI('<b>\u201cEroe pi\u00f9 avanzato\u201d</b> \u2014 quello pi\u00f9 lontano dall\u2019ingresso, contando le '
                'caselle. A pari merito: regola d\u2019oro.'))
    e.append(LI('<b>Movimento</b> \u2014 gli alleati (e Ruggero) si possono attraversare, ma non ci si '
                'pu\u00f2 fermare sulla loro casella.'))
    e.append(LI('<b>Tra un episodio e l\u2019altro</b> \u2014 tutti gli eroi tornano a Salute piena e '
                'recuperano gli usi delle abilit\u00e0. Le cicatrici invece restano.'))

    e.append(P('LA CAMPAGNA', 'h1'))
    e.append(LI('<b>Frammenti</b> \u2014 al termine di ogni episodio riuscito ottenete un Frammento di '
                'Campagna: conservateli, comporranno il mistero finale.'))
    e.append(LI('<b>Crescita</b> \u2014 dopo ogni episodio riuscito, ogni eroe sceglie <b>una</b> '
                'miglioria dall\u2019elenco nella Soluzione e la annota sulla scheda.'))
    e.append(LI('<b>Cicatrici</b> \u2014 un eroe finito a terra durante l\u2019episodio annota una '
                'cicatrice (descrivetela!): alla terza, \u22121 permanente a una caratteristica a scelta.'))
    e.append(P('Giocare in 2, in 4 o in 5', 'h2'))
    e.append(P("Il gioco scala da solo con la fase Minaccia. In 4\u20135 giocatori, durante l\u2019Indagine "
               "leggete gli indizi <b>a turno e solo per s\u00e9</b>, poi raccontateli con parole vostre: "
               "la deduzione diventa un racconto corale (ed \u00e8 il modo pi\u00f9 divertente di giocare "
               "in gruppo)."))

    e.append(P('COME STAMPARE', 'h1'))
    e.append(LI('<b>01 Regolamento</b> e <b>05 Soluzione</b>: fronte/retro normale. Sigillate la Soluzione in una busta!'))
    e.append(LI('<b>02 Schede</b>: una per giocatore, meglio su cartoncino.'))
    e.append(LI('<b>03 Indagine</b>: carte Luogo su cartoncino, ritagliate lungo i bordi. Il Taccuino su carta normale.'))
    e.append(LI('<b>04 Spedizione</b>: tessere, carte Minaccia e segnalini su cartoncino; ritagliate tutto.'))
    e.append(Spacer(1, 8))
    e.append(P('Episodio 1: <b>Il caso del campanaro scomparso</b>. Quando siete pronti, leggete la '
               'Lettera d\u2019incarico nel fascicolo Indagine. Buona fortuna \u2014 e non fidatevi della '
               'cera nera.', 'box'))
    doc.build(e, onFirstPage=bg_cover, onLaterPages=bg)


# ------------------------------------------------------------------ SOLUZIONE
def soluzione():
    doc = SimpleDocTemplate('/mnt/user-data/outputs/Ombre-su-Roccamora-05-SOLUZIONE-non-aprire.pdf',
                            pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                            topMargin=20*mm, bottomMargin=20*mm,
                            title='Ombre su Roccamora - Soluzione Episodio 1')
    e = []
    e.append(Spacer(1, 200))
    e.append(P('\u26a0 ALT \u26a0', 'warn'))
    e.append(P('SOLUZIONE DELL\u2019EPISODIO 1', 'title'))
    e.append(P('Stampate questo fascicolo senza leggerlo, sigillatelo in una busta.<br/>'
               'Apritelo solo dopo aver risposto per iscritto alle 4 Domande.', 'subtitle'))
    e.append(PageBreak())

    e.append(P('LA VERIT\u00c0', 'h1'))
    e.append(P("Il liutaio <b>Bastiano Ferri</b> ha riportato in vita la confraternita del "
               "<b>Coro Sommerso</b>, bandita nel 1741. Riparando l\u2019organo della cattedrale ha "
               "ottenuto la seconda chiave della cripta e ha scoperto i condotti che scendono verso "
               "il Canale Basso, \u201cdove l\u2019acqua canta\u201d. Ogni notte alle 3 il culto fa suonare le "
               "campane con un meccanismo a contrappesi: le vibrazioni del bronzo attraversano la "
               "pietra e <b>svegliano qualcosa che dorme sotto Roccamora</b>. Il campanaro Ruggero "
               "Alvise se n\u2019\u00e8 accorto, ha visto Ferri in cripta, ed \u00e8 stato rapito. \u00c8 tenuto "
               "prigioniero nel vecchio <b>Magazzino delle Cere \u201cDellacqua\u201d</b> sul Canale Basso, "
               "dove il culto fonde le candele nere e prepara il rituale."))

    e.append(P('LE 4 DOMANDE \u2014 RISPOSTE E VANTAGGI', 'h1'))
    rows = [
        ['#', 'Risposta esatta', 'Se avete risposto bene', 'Se avete sbagliato'],
        ['1', 'Ruggero \u00e8 tenuto nel Magazzino delle\nCere \u201cDellacqua\u201d, al Canale Basso.',
         'Conoscete l\u2019ingresso sul retro:\nnel 1\u00b0 round non si pesca\nnessuna carta Minaccia.',
         'Arrivate allo scoperto:\npescate 1 Minaccia extra\nnel 1\u00b0 round.'],
        ['2', 'Il capo del Coro Sommerso \u00e8\nBastiano Ferri, il liutaio.',
         'Vantaggio \u201cSmascherato\u201d:\nuna volta, quando piazzereste\nAdepti, gridate il suo nome:\nnon vengono piazzati.',
         'Nessun effetto.'],
        ['3', 'La combinazione del lucchetto\n\u00e8 3 \u2013 1 \u2013 5.',
         'Aprite la porta della Banchina\nsenza prove.',
         'Va forzata: prova di ACUME\nDifficile; ogni fallimento =\npescate 1 carta Minaccia.'],
        ['4', 'L\u2019oggetto da portare \u00e8 il\ndiapason d\u2019argento (Bottega Ferri).',
         'Lo avete con voi: vedi\n\u201cIl Custode della Cera\u201d.',
         'Non lo avete. Il Custode\nconserva Difesa 9.'],
    ]
    t = Table(rows, colWidths=[8*mm, 52*mm, 55*mm, 45*mm])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), F['b']),
        ('FONTNAME', (0, 1), (-1, -1), F['r']),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f6efdb'), PAPER_DK]),
        ('GRID', (0, 0), (-1, -1), 0.6, TEAL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    e.append(t)
    e.append(P('Come sono deducibili: 1) registro consegne della Bottega + testimonianze di barcaiolo '
               'e guardiano; 2) pagamento firmato \u201cB.F.\u201d, fascicolo d\u2019archivio consultato da '
               'Ferri, la seconda chiave della cripta in mano sua, il diapason con l\u2019onda; '
               '3) il diario di Ruggero (\u201ctre rintocchi, poi uno, poi cinque\u201d) confermato '
               'dall\u2019inno n. 315; 4) lo spartito \u201cper campane\u201d e il sigillo a onda legano il '
               'diapason al culto. Il \u201cC.B.\u201d del registro \u00e8 il Canale Basso: da solo non '
               'basta, va incrociato col guardiano o con la mappa d\u2019archivio. Don Callisto e Tonio '
               'sono false piste, e la sua acqua benedetta \u00e8 un\u2019esca: sul Custode non ha '
               'alcun effetto.'))

    e.append(P('PREPARAZIONE DELLA SPEDIZIONE', 'h1'))
    e.append(P('Disponete le tessere cos\u00ec (coperte, tranne T1). Le uscite sono stampate sui bordi:', 'body'))
    e.append(P('<font face="Courier" size="9">'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T6 Cripta della Cera]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T5 Scala Interrata]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| (grata)<br/>'
               '[T4 Ufficio] \u2014 [T2 Sala delle Casse] \u2014 [T3 Corridoio]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T1 Banchina \u2014 INGRESSO]</font>', 'box'))
    e.append(LI('Eroi sulla porta di T1. Mischiate il mazzo Minaccia. Tenete a portata i segnalini '
                'Adepto, il Custode, Ruggero e i 3 segnalini Canto.'))
    e.append(LI('<b>Obiettivo:</b> aprire la cella in T6, liberare Ruggero e riportarlo sulla '
                'Banchina (T1). Ruggero si muove con voi (Movimento 4, non agisce).'))
    e.append(LI('<b>Il Custode della Cera</b> appare (con 2 Adepti) quando rivelate T6, oppure al '
                'terzo segnalino Canto: in quel caso piazzatelo sulla tessera pi\u00f9 lontana dagli '
                'eroi. Se avete il <b>diapason</b>: con un\u2019azione adiacente al Custode lo fate '
                'vibrare: la sua Difesa scende a 5 per il resto della partita e il Custode salta la '
                'sua prossima attivazione.'))
    e.append(LI('<b>Il Canto avanza da solo:</b> alla fine di ogni quarto round (4\u00b0, 8\u00b0...), '
                'aggiungete 1 segnalino Canto anche senza pescare la carta.'))
    e.append(LI('<b>Terzo segnalino Canto:</b> il rituale \u00e8 quasi compiuto. Da ora ogni fase '
                'Minaccia pescate 1 carta in pi\u00f9.'))
    e.append(LI('<b>Se fallite</b> e rigiocate l\u2019episodio: iniziate con 1 segnalino Canto gi\u00e0 in gioco.'))

    e.append(P('EPILOGO \u2014 da leggere ad alta voce a vittoria ottenuta', 'h1'))
    e.append(P('\u00abRuggero trema mentre la chiatta vi riporta a casa. \u201cCantavano all\u2019acqua\u201d, '
               'dice. \u201cE l\u2019acqua rispondeva. Ferri diceva che le campane servono a svegliare '
               'qualcosa che dorme sotto Roccamora dal 1741. Diceva che ormai... ha aperto gli '
               'occhi.\u201d Del liutaio, al magazzino, nessuna traccia: solo uno spartito incompiuto '
               'e una riga in margine: \u201cSecondo movimento: le voci del pozzo\u201d.\u00bb', 'box'))
    e.append(P('FRAMMENTO DI CAMPAGNA N. 1', 'h2'))
    e.append(P('<i>Il Coro Sommerso non evoca: <b>accorda</b>. Ogni episodio il culto \u201caccorda\u201d '
               'un luogo della citt\u00e0. Segnate sulla mappa mentale di Roccamora: la Cattedrale \u00e8 '
               'gi\u00e0 accordata.</i> Conservate questo frammento per il finale di campagna.'))
    e.append(P('MIGLIORIE (una a testa dopo la vittoria)', 'h2'))
    e.append(LI('<b>Tempra</b> \u2014 +1 permanente a una caratteristica a scelta (massimo 4).'))
    e.append(LI('<b>Fibra</b> \u2014 +1 Salute massima.'))
    e.append(LI('<b>Revolver</b> \u2014 una volta per round, attacco a distanza (fino a 3 caselle): 2d6+2.'))
    e.append(LI('<b>Lanterna schermata</b> \u2014 le trappole delle tessere non si attivano sull\u2019eroe che la porta.'))
    e.append(LI('<b>Borsa di garze</b> \u2014 2 usi per spedizione: azione, cura 2 Salute a un eroe adiacente.'))
    e.append(P('Prossimo episodio: <b>Le voci del pozzo</b>. (Quando lo vorrete, tornate da chi vi '
               'ha costruito questo gioco e chiedete l\u2019Episodio 2.)'))
    doc.build(e, onFirstPage=bg_cover, onLaterPages=bg)


regolamento()
soluzione()
print('OK docs')
