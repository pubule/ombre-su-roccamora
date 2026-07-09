# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Reperti dell'Episodio 1 (handout fisici)."""
import random
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Frame

def ff(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment, rule_border, seal, wave, F,
                          INK, RED, TEAL, GOLD, SEPIA, PAPER_DK)

register_fonts()
try:
    pdfmetrics.registerFont(TTFont('Scritta', '/home/claude/fonts/LaBelleAurore.ttf'))
    HAND = 'Scritta'
except Exception:
    HAND = F['i']
W, H = A4
BRUNO = colors.HexColor('#4a3a28')
GRAFITE = colors.HexColor('#8d8d94')


def torn_edge(c, y, seed=1, top=True):
    """Bordo strappato orizzontale a tutta pagina, con ombra."""
    rnd = random.Random(seed)
    pts = [(0, y)]
    x = 0
    while x < W:
        x += rnd.uniform(4*mm, 10*mm)
        pts.append((min(x, W), y + rnd.uniform(-3.5*mm, 3.5*mm)))
    c.saveState()
    # ombra e "vuoto" oltre lo strappo
    c.setFillColor(colors.HexColor('#d9cdae'))
    p = c.beginPath()
    p.moveTo(0, y + (20*mm if top else -20*mm))
    for px, py in pts:
        p.lineTo(px, py)
    p.lineTo(W, y + (20*mm if top else -20*mm))
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor('#b7a67f')); c.setLineWidth(1.1)
    p2 = c.beginPath(); p2.moveTo(*pts[0])
    for px, py in pts[1:]:
        p2.lineTo(px, py)
    c.drawPath(p2)
    c.restoreState()


def wax_drip(c, x, y, h, seed=1):
    rnd = random.Random(seed)
    c.saveState()
    c.setFillColor(colors.HexColor('#1c1a1e')); c.setFillAlpha(0.9)
    c.rect(x - 1*mm, y, 2*mm, h, fill=1, stroke=0)
    c.ellipse(x - 2*mm, y - 3*mm, x + 2*mm, y + 1*mm, fill=1, stroke=0)
    for _ in range(3):
        dx = rnd.uniform(-4*mm, 4*mm)
        c.circle(x + dx, y + rnd.uniform(0, h), rnd.uniform(0.6, 1.4)*mm, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()


def coffee_ring(c, x, y, r, seed=2):
    c.saveState()
    c.setStrokeColor(colors.HexColor('#7a5a30')); c.setStrokeAlpha(0.35)
    for k in (1.0, 0.94):
        c.setLineWidth(2.2 * k)
        c.circle(x, y, r * k)
    c.setStrokeAlpha(1)
    c.restoreState()


def hand_par(txt, size=15, leading=22, col=BRUNO):
    return Paragraph(txt, ParagraphStyle('h', fontName=HAND, fontSize=size,
                                         leading=leading, textColor=col))


def pagina_intro(c):
    parchment(c, W, H, seed=61)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'reperti \u00b7 episodio 1')
    wave(c, W/2 - 20*mm, H - 38*mm, 40*mm, GOLD)
    body = ("Questi tre documenti sono <b>reperti fisici</b>: stampateli, invecchiateli se "
            "volete (t\u00e8 freddo e bordi bruciati), e teneteli da parte coperti. Vanno "
            "consegnati ai giocatori nel momento in cui trovano l\u2019indizio corrispondente "
            "\u2014 da quel momento il documento resta sul tavolo, e si torna a interrogarlo "
            "come un vero fascicolo.<br/><br/>"
            "\u2022 <b>Reperto A \u2014 il diario di Ruggero</b>: si consegna al Luogo 1 "
            "(il Campanile), quando leggete l\u2019indizio del diario.<br/>"
            "\u2022 <b>Reperto B \u2014 il registro delle consegne</b>: si consegna al Luogo 5 "
            "(la Bottega del liutaio).<br/>"
            "\u2022 <b>Reperto C \u2014 il fascicolo del 1741</b>: si consegna al Luogo 7 "
            "(l\u2019Archivio Civico).<br/><br/>"
            "I reperti contengono <i>esattamente</i> le informazioni delle carte Luogo, "
            "pi\u00f9 qualche dettaglio d\u2019atmosfera: nessun indizio \u00e8 nascosto solo qui.")
    Frame(30*mm, H - 150*mm, W - 60*mm, 100*mm, showBoundary=0).addFromList(
        [Paragraph(body, ParagraphStyle('b', fontName=F['r'], fontSize=11, leading=16,
                                        textColor=INK, alignment=4))], c)
    seal(c, W - 40*mm, 40*mm, r=12*mm, angle=-12)
    c.showPage()


def reperto_a(c):
    """Diario di Ruggero: pagina superstite, strappo in alto."""
    parchment(c, W, H, seed=62)
    torn_edge(c, H - 24*mm, seed=7, top=True)
    wax_drip(c, 32*mm, H - 90*mm, 45*mm, seed=3)
    wax_drip(c, W - 40*mm, H - 150*mm, 30*mm, seed=8)
    c.setFillColor(SEPIA); c.setFont(F['i'], 9)
    c.drawRightString(W - 20*mm, H - 34*mm, 'Reperto A \u2014 dal diario di Ruggero Alvise, campanaro')
    voci = [
        "12 del mese. Stanotte di nuovo la musica. Viene da sotto la cripta, ne sono certo: "
        "il pavimento la beve e la restituisce alle mie campane. Don Callisto dice che sogno.",
        "15 del mese. Ho trovato una corda d\u2019argento sui gradini della cripta. Non \u00e8 "
        "roba da chiesa. L\u2019ho portata a casa, Bice non deve spaventarsi.",
        "19 del mese. Il liutaio sale all\u2019organo anche di notte, ormai. Stanotte l\u2019ho "
        "visto uscire dalla cripta con la sua chiave. Mi ha guardato. Non ha detto nulla.",
        "21 del mese. Le mie campane suonano senza di me e io conto i rintocchi come un "
        "condannato conta i gradini. Domani scendo anch\u2019io, e che Dio mi perdoni la "
        "curiosit\u00e0.",
    ]
    flow = []
    for v in voci:
        flow.append(hand_par(v))
        flow.append(Paragraph('<br/>', ParagraphStyle('sp', fontSize=4, leading=8)))
    Frame(26*mm, H - 205*mm, W - 52*mm, 165*mm, showBoundary=0).addFromList(flow, c)
    # pagina strappata: ricalco a grafite
    c.saveState()
    c.setFillColor(colors.HexColor('#e3e0da')); c.setFillAlpha(0.75)
    c.rect(24*mm, 28*mm, W - 48*mm, 46*mm, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.setStrokeColor(GRAFITE); c.setLineWidth(0.7)
    c.rect(24*mm, 28*mm, W - 48*mm, 46*mm)
    c.setFillColor(GRAFITE); c.setFont(F['i'], 8.5)
    c.drawString(27*mm, 69*mm, 'L\u2019ultima pagina \u00e8 strappata. Ricalcando a grafite i solchi della penna, affiora:')
    c.restoreState()
    Frame(28*mm, 30*mm, W - 56*mm, 36*mm, showBoundary=0).addFromList(
        [hand_par('...alle 3 in punto, ogni notte. Tre rintocchi, poi uno, poi cinque. '
                  'Non sono io a suonare.', size=16, leading=24, col=GRAFITE)], c)
    c.showPage()


def reperto_b(c):
    """Registro consegne della bottega Ferri."""
    parchment(c, W, H, seed=63)
    rule_border(c, W, H)
    c.setFillColor(BRUNO); c.setFont(F['sc'], 15)
    c.drawCentredString(W/2, H - 26*mm, 'bottega b. ferri \u00b7 liutaio \u00b7 registro delle consegne')
    c.setFillColor(SEPIA); c.setFont(F['i'], 9)
    c.drawRightString(W - 18*mm, H - 33*mm, 'Reperto B \u2014 trovato aperto sul banco da lavoro')
    coffee_ring(c, W - 52*mm, H - 120*mm, 14*mm)
    rows = [
        ('3 del mese',  'sei corde di minugia, colofonia',        'Teatro dell\u2019Eco',        'saldato'),
        ('7 del mese',  'riparazione violoncello, ponticello',    'Casa Morvilli',               'saldato'),
        ('10 del mese', 'accordatura organo \u2014 III settimana', 'Cattedrale di S. Teodoro',    'in opera'),
        ('14 del mese', 'una corda d\u2019argento, su misura',     'commessa privata',            'ritirata'),
        ('18 del mese', 'sedici candele di cera nera',            'C.B., molo terzo',            'pagato B.F.'),
        ('21 del mese', 'quaranta candele di cera nera',          'C.B., molo terzo, il vecchio deposito', 'pagato B.F.'),
    ]
    y0 = H - 52*mm
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    xs = [20*mm, 48*mm, 108*mm, 158*mm, W - 20*mm]
    c.setFillColor(BRUNO); c.setFont(F['b'], 9)
    for x, lab in zip(xs, ['data', 'fornitura', 'destinazione', 'nota']):
        c.drawString(x + 1*mm, y0 + 2*mm, lab)
    c.line(20*mm, y0, W - 20*mm, y0)
    for i, r in enumerate(rows):
        yy = y0 - (i + 1) * 13*mm
        c.line(20*mm, yy, W - 20*mm, yy)
        for x, val in zip(xs, r):
            ff(c, x + 1*mm, yy + 0.5*mm, (xs[xs.index(x)+1] - x) - 2*mm, 12*mm,
               [hand_par(val, size=10.5, leading=12)])
    for x in xs:
        c.line(x, y0, x, y0 - len(rows)*13*mm)
    # scarabocchio a margine: onda + appunto
    wave(c, W - 70*mm, y0 - len(rows)*13*mm - 14*mm, 24*mm, BRUNO, 1.2)
    Frame(24*mm, y0 - len(rows)*13*mm - 34*mm, W - 48*mm, 18*mm, showBoundary=0).addFromList(
        [hand_par('il bronzo canta, la pietra risponde, l\u2019acqua ricorda \u2014 II mov. quasi pronto',
                  size=12, leading=15)], c)
    c.showPage()


def reperto_c(c):
    """Fascicolo del 1741 dall'Archivio Civico."""
    parchment(c, W, H, seed=64)
    rule_border(c, W, H, m1=6*mm, m2=8*mm)
    c.setFillColor(BRUNO); c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 28*mm, 'atti del consiglio di roccamora \u00b7 anno mdccxli')
    c.setFillColor(SEPIA); c.setFont(F['i'], 9)
    c.drawRightString(W - 18*mm, H - 35*mm, 'Reperto C \u2014 fascicolo n. 44, Archivio Civico')
    decreto = (
        "Addì XII di novembre, l\u2019anno del Signore MDCCXLI.<br/><br/>"
        "Il Consiglio, udite le testimonianze de\u2019 parroci e de\u2019 barcaioli, <b>bandisce "
        "in perpetuo</b> la confraternita detta del <b>CORO SOMMERSO</b>, per pratiche "
        "contrarie a Dio ed alla quiete delle acque; la quale confraternita usava radunarsi "
        "nelle cavit\u00e0 sotto la Cattedrale, <i>dove l\u2019acqua canta</i>, e quivi levare "
        "canti che non sono di questo mondo n\u00e9 per questo mondo.<br/><br/>"
        "Si ordina: che le dette cavit\u00e0 siano murate; che le campane tacciano dal vespro "
        "all\u2019alba per un anno intero; che il sigillo della confraternita \u2014 "
        "<b>un\u2019onda incisa</b> \u2014 sia scalpellato ovunque si trovi.<br/><br/>"
        "Chi canter\u00e0 al di sotto, non si lamenti di ci\u00f2 che al di sotto risponde.")
    Frame(28*mm, H - 175*mm, W - 56*mm, 130*mm, showBoundary=0).addFromList(
        [Paragraph(decreto, ParagraphStyle('d', fontName=F['r'], fontSize=11.5, leading=17,
                                           textColor=BRUNO, alignment=4))], c)
    seal(c, W - 44*mm, H - 185*mm, r=11*mm, angle=-8)
    # scheda consultazioni
    y0 = 62*mm
    c.setFillColor(colors.HexColor('#f6efdb'))
    c.rect(24*mm, 24*mm, W - 48*mm, y0 - 24*mm, fill=1)
    c.setStrokeColor(SEPIA); c.setLineWidth(0.6)
    c.rect(24*mm, 24*mm, W - 48*mm, y0 - 24*mm)
    c.setFillColor(BRUNO); c.setFont(F['b'], 9)
    c.drawString(27*mm, y0 - 6*mm, 'SCHEDA DELLE CONSULTAZIONI \u2014 fascicolo n. 44')
    consult = [('1893, marzo', 'don E. Callisto, per la parrocchia'),
               ('1901, ottobre', 'G. Morvilli, storico'),
               ('due mesi or sono', 'B. Ferri, liutaio')]
    for i, (dt, chi) in enumerate(consult):
        yy = y0 - 13*mm - i * 8*mm
        c.setStrokeColor(colors.HexColor('#c9b58c'))
        c.line(27*mm, yy - 1*mm, W - 27*mm, yy - 1*mm)
        ff(c, 27*mm, yy - 1*mm, 45*mm, 8*mm, [hand_par(dt, size=10, leading=11)])
        ff(c, 80*mm, yy - 1*mm, 100*mm, 8*mm, [hand_par(chi, size=10, leading=11)])
    c.showPage()


def main():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-08-Reperti.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Reperti Episodio 1')
    pagina_intro(c)
    reperto_a(c)
    reperto_b(c)
    reperto_c(c)
    c.save()


main()
print('OK reperti')
