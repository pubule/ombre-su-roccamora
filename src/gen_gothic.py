# -*- coding: utf-8 -*-
"""Ombre su Roccamora - versione GOTICA di carte e tessere (03 e 04).

Le 20 carte Minacce, i 4 Nemici e le 6 tessere T1-T6 sono ora generati come
immagini a se' stanti (cardconjurer + script di board: cards/Minacce/,
cards/Nemici/, board/) invece che come pagine di questo PDF, quindi qui non
vengono piu' disegnati. spedizione() stampa solo le note per tessera che non
stanno sull'immagine della tessera (testo ambientazione, bonus Cercare) e i
segnalini da ritagliare.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment, rule_border, seal, wave,
                          triple_wave, F, INK, RED, TEAL, PAPER,
                          PAPER_DK, GOLD as OGOLD, SEPIA)
import ornaments as O
from ornaments import (NIGHT, NIGHTR, GOLD, GOLD_L, GOLD_D, BONE,
                       ornate_frame, banner, medallion)
from gen_cards import LUOGHI, MINACCE, NEMICI, TILES, HEROES
import story
MINACCE = story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)
LETTERA = story.LETTERA2

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

BODY = st('body', alignment=4)
CLUE = st('clue', leftIndent=10, spaceAfter=2.5)
HIDN = st('hidn', leftIndent=10, textColor=TEAL, fontName=F['i'], spaceAfter=2)
SMB  = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)
MTXT = st('mtxt', fontSize=8.4, leading=10.4, textColor=BONE, alignment=1)

def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

# ------------------------------------------------------------------ INDAGINE
def luogo_front(c, x, y, cw, ch, L):
    ornate_frame(c, x, y, cw, ch, base=NIGHTR, gems=True)
    # pannello pergamena interno
    px, py = x + 7*mm, y + 6*mm
    pw, ph = cw - 14*mm, ch - 19*mm
    c.saveState()
    c.setFillColor(PAPER); c.setStrokeColor(GOLD_D); c.setLineWidth(0.8)
    c.rect(px, py, pw, ph, fill=1)
    import random
    rnd = random.Random(L['n'])
    p = c.beginPath(); p.rect(px, py, pw, ph); c.clipPath(p, stroke=0)
    for _ in range(7):
        r = rnd.uniform(6*mm, 18*mm)
        c.setFillColor(PAPER_DK); c.setFillAlpha(rnd.uniform(0.06, 0.13))
        c.circle(px + rnd.uniform(0, pw), py + rnd.uniform(0, ph), r, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()
    # targa titolo
    banner(c, x + cw/2, y + ch - 9*mm, cw - 30*mm, 8.6*mm)
    c.setFillColor(BONE); c.setFont(F['sc'], 11)
    c.drawCentredString(x + cw/2, y + ch - 10.3*mm, 'luogo %d \u00b7 %s' % (L['n'], L['nome'].lower()))
    # requisito
    c.setFillColor(TEAL); c.setFont(F['b'], 8.5)
    c.drawString(px + 3*mm, py + ph - 5*mm, L['req'])
    wave(c, px + pw - 22*mm, py + ph - 4.2*mm, 18*mm, OGOLD, 1)
    flow = [Paragraph(L['testo'], BODY), Spacer(1, 4), Paragraph('indizi', SMB)]
    for cl in L['indizi']:
        flow.append(Paragraph('\u25c6 ' + cl, CLUE))
    if L['nascosto']:
        flow.append(Spacer(1, 3))
        flow.append(Paragraph('\u2739 ' + L['nascosto'], HIDN))
    frame_flow(c, px + 3*mm, py + 2.5*mm, pw - 6*mm, ph - 9*mm, flow)

def luogo_back(c, x, y, cw, ch, L):
    ornate_frame(c, x, y, cw, ch, base=NIGHTR, gems=True)
    cx, cy = x + cw/2, y + ch/2
    c.setFillColor(GOLD_L); c.setFont(F['sc'], 13)
    c.drawCentredString(cx, y + ch - 15*mm, 'ombre su roccamora')
    medallion(c, cx, cy + 2*mm, 17*mm, GOLD)
    c.setFillColor(GOLD_L); c.setFont(F['sc'], 36)
    c.drawCentredString(cx, cy - 4*mm, str(L['n']))
    for sgn in (-1, 1):
        O.scroll(c, cx + sgn*24*mm, cy - 2*mm, 12*mm, -sgn, GOLD, 1)
    banner(c, cx, y + 13*mm, 34*mm, 7.5*mm)
    c.setFillColor(BONE); c.setFont(F['sc'], 11)
    c.drawCentredString(cx, y + 11.8*mm, 'luogo')
    triple_wave(c, cx, y + ch - 21*mm, 24*mm, GOLD, 1, 2.4*mm)

def indagine():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-03-Episodio1-Indagine.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Indagine')
    # lettera d'incarico (pergamena, invariata nello spirito)
    parchment(c, W, H, seed=5)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 1')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il caso del campanaro scomparso')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA.replace(
        'Alla Societ\u00e0 del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Societ\u00e0 del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 178*mm, W - 2*mx, 112*mm,
               [Paragraph('lettera d\u2019incarico \u2014 leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 190*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Ritagliate le carte Luogo delle pagine seguenti e disponetele coperte, numero in vista.')
    c.showPage()
    ch = (H - 30*mm) / 2.0
    cw = W - 24*mm
    for i in range(0, len(LUOGHI), 2):
        pair = LUOGHI[i:i+2]
        for pos, L in enumerate(pair):
            luogo_front(c, 12*mm, H - 12*mm - ch - pos*(ch + 6*mm), cw, ch, L)
        c.setFillColor(SEPIA); c.setFont(F['i'], 7.5)
        c.drawCentredString(W/2, 5*mm, 'stampa fronte/retro sul lato lungo: la pagina seguente contiene i dorsi')
        c.showPage()
        for pos, L in enumerate(pair):
            luogo_back(c, 12*mm, H - 12*mm - ch - pos*(ch + 6*mm), cw, ch, L)
        c.showPage()
    # taccuino (come deluxe)
    parchment(c, W, H, seed=9)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della societ\u00e0 \u2014 episodio 1')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO \u2014 barrate un\u2019ora per ogni visita:')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23', '24', '1']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8.5)
    c.drawString(16*mm + 8*17*mm, H - 42*mm, '\u2601 a mezzanotte l\u2019Archivio (7) chiude')
    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm
    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole chiave', 5)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande \u2014 rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE \u00e8 tenuto prigioniero Ruggero?',
            '2. CHI guida il Coro Sommerso?',
            '3. QUAL \u00c8 la combinazione a tre cifre del lucchetto?',
            '4. QUALE oggetto \u00e8 indispensabile portare con voi?']
    for i, d in enumerate(doms):
        yd = yy - 10*mm - i*15*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 7*mm, W - 16*mm, yd - 7*mm)
    c.showPage()
    c.save()

# ---------------------------------------------------------------- SPEDIZIONE
def spedizione():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-04-Episodio1-Spedizione.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Spedizione')
    # copertina/nota: Minacce, Nemici e tessere T1-T6 sono immagini a se' stanti
    parchment(c, W, H, seed=88)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 1 \u2014 spedizione')
    wave(c, W/2 - 20*mm, H - 39*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 95*mm, W - 56*mm, 42*mm, [
        Paragraph('Le 20 carte Minacce e le 4 schede Nemici sono stampate come carte a parte '
                  '(cartelle <b>cards/Minacce/</b> e <b>cards/Nemici/</b>). Le 6 tessere T1-T6 del '
                  'magazzino sono in <b>board/</b>, gi\u00e0 con griglia, arredi e porte segnate. '
                  'Qui sotto restano solo le note per tessera che non stanno sull\u2019immagine.',
                  BODY)])
    c.showPage()
    # note per tessera (testo ambientazione + bonus Cercare): la tessera fisica e' in board/
    y = H - 25*mm
    for T in TILES:
        c.setFillColor(RED); c.setFont(F['sc'], 13)
        c.drawString(20*mm, y, '%s \u00b7 %s' % (T['id'], T['nome'].lower()))
        flow = [Paragraph(T['testo'], st('tile', fontSize=9, leading=12, alignment=4))]
        if T.get('cerca'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph('<b>Cercare (ACUME Media):</b> ' + T['cerca'],
                                  st('tc', fontSize=9, leading=12, textColor=TEAL)))
        fh = 30*mm if T.get('cerca') else 22*mm
        frame_flow(c, 20*mm, y - 8*mm - fh, W - 40*mm, fh, flow)
        y -= fh + 16*mm
        if y < 40*mm and T is not TILES[-1]:
            c.showPage(); y = H - 25*mm
    c.showPage()
    # segnalini (invariati, con anelli oro)
    parchment(c, W, H, seed=88)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'segnalini \u2014 ritagliare')
    def token_row(yy, label, items, fill, ring, tcol):
        c.setFillColor(TEAL); c.setFont(F['b'], 9)
        c.drawString(16*mm, yy + 12*mm, label)
        for i, it in enumerate(items):
            cx = 24*mm + i * 19*mm
            c.setStrokeColor(INK); c.setLineWidth(1.1); c.setFillColor(fill)
            c.circle(cx, yy, 8*mm, fill=1)
            c.setStrokeColor(ring); c.setLineWidth(0.8)
            c.circle(cx, yy, 6.4*mm)
            c.setFillColor(tcol); c.setFont(F['sc'], 9.5)
            c.drawCentredString(cx, yy - 1.4*mm, it)
    token_row(H - 44*mm, 'EROI', ['el', 'at', 'si', 'ni', 'ca', 'ot'],
              colors.HexColor('#f7f0dd'), OGOLD, INK)
    token_row(H - 74*mm, 'ADEPTI (x10)', ['a'] * 10,
              colors.HexColor('#2b2b33'), OGOLD, colors.white)
    token_row(H - 104*mm, 'CANI (x3) \u00b7 FONDITORI (x3)',
              ['cn', 'cn', 'cn', 'fo', 'fo', 'fo'],
              colors.HexColor('#3a3a30'), OGOLD, colors.white)
    token_row(H - 134*mm, 'CUSTODE \u00b7 RUGGERO \u00b7 CANTO (x3)',
              ['cu', 'ru', '\u266a', '\u266a', '\u266a'],
              colors.HexColor('#4a0d16'), OGOLD, GOLD_L)
    c.setFillColor(INK); c.setFont(F['i'], 9)
    c.drawString(16*mm, H - 158*mm, 'Consiglio: incollate il foglio su cartoncino prima di ritagliare. '
                                    'Le ferite dei nemici si segnano con monetine o a matita.')
    c.showPage()
    c.save()

indagine()
spedizione()
print('OK gothic')
