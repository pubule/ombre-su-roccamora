# -*- coding: utf-8 -*-
"""Ombre su Roccamora - componenti versione deluxe."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment, rule_border, seal, wave,
                          triple_wave, stone_floor, water_band, candle, F,
                          INK, RED, RED_DK, TEAL, TEAL_DK, PAPER, PAPER_DK,
                          GOLD, SEPIA)
from gen_cards import HEROES, LUOGHI, MINACCE, NEMICI, TILES, LETTERA
import story
story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)

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
CARD = st('card', fontSize=8.8, leading=10.8)
CTTL = st('cttl', fontName=F['sc'], fontSize=9.5, textColor=colors.white, leading=11)
SUB  = st('sub', fontName=F['i'], fontSize=9, textColor=TEAL)

def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

def card_frame(c, x, y, w, h, seed=1):
    c.saveState()
    c.setFillColor(PAPER); c.setStrokeColor(INK); c.setLineWidth(1.2)
    c.rect(x, y, w, h, stroke=1, fill=1)
    # subtle inner mottling
    import random
    rnd = random.Random(seed)
    p = c.beginPath(); p.rect(x, y, w, h); c.clipPath(p, stroke=0)
    for _ in range(6):
        r = rnd.uniform(6*mm, 20*mm)
        c.setFillColor(PAPER_DK); c.setFillAlpha(rnd.uniform(0.06, 0.13))
        c.circle(x + rnd.uniform(0, w), y + rnd.uniform(0, h), r, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.setStrokeColor(GOLD); c.setLineWidth(0.6)
    c.rect(x + 2.2*mm, y + 2.2*mm, w - 4.4*mm, h - 4.4*mm)
    c.restoreState()

def stat_box(c, x, y, w, label, value):
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setFillColor(PAPER_DK)
    c.rect(x, y, w, 18*mm, fill=1)
    c.setStrokeColor(INK); c.setLineWidth(0.6)
    c.rect(x + 1.2*mm, y + 1.2*mm, w - 2.4*mm, 18*mm - 2.4*mm)
    c.setFillColor(TEAL); c.setFont(F['sc'], 8)
    c.drawCentredString(x + w/2, y + 13.2*mm, label.lower())
    c.setFillColor(INK); c.setFont(F['b'], 19)
    c.drawCentredString(x + w/2, y + 4*mm, str(value))
    c.restoreState()

# ================================================================= SCHEDE
def schede():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-02-Schede-Personaggio.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Schede Personaggio')
    for pg, hro in enumerate(HEROES):
        parchment(c, W, H, seed=40 + pg)
        rule_border(c, W, H)
        mx, mt = 20*mm, 20*mm
        c.setFillColor(RED); c.setFont(F['sc'], 23)
        c.drawString(mx, H - mt - 6*mm, hro['nome'].lower())
        c.setFillColor(TEAL); c.setFont(F['i'], 13)
        c.drawString(mx, H - mt - 12.5*mm, hro['ruolo'] + '  \u2014  Societ\u00e0 del Lume, Roccamora')
        seal(c, W - mx - 8*mm, H - mt - 6*mm, r=9*mm, angle=-16)
        c.setStrokeColor(INK); c.setLineWidth(1)
        c.line(mx, H - mt - 16*mm, W - mx, H - mt - 16*mm)
        frame_flow(c, mx, H - mt - 48*mm, W - 2*mx, 29*mm, [
            Paragraph('chi sei', SMB),
            Paragraph(hro.get('bio', ''), st('bio', fontName=F['i'], fontSize=9.8,
                                             leading=13, alignment=4))])
        y0 = H - mt - 72*mm
        bw = (W - 2*mx - 4*10*mm) / 5.0
        for i, (lb, v) in enumerate([('ACUME', hro['acume']), ('VIGORE', hro['vigore']),
                                     ('NERVI', hro['nervi']), ('DIFESA', hro['difesa']),
                                     ('SALUTE', hro['salute'])]):
            stat_box(c, mx + i*(bw + 10*mm), y0, bw, lb, v)
        y1 = y0 - 16*mm
        c.setFillColor(TEAL); c.setFont(F['b'], 9)
        c.drawString(mx, y1 + 8*mm, 'SEGNAPUNTI SALUTE (coprite le caselle con monete o segnate a matita)')
        c.setStrokeColor(INK); c.setLineWidth(0.9)
        for i in range(hro['salute']):
            c.setFillColor(colors.HexColor('#f7f0dd'))
            c.rect(mx + i*11*mm, y1 - 2*mm, 9*mm, 9*mm, fill=1)
            c.setFillColor(SEPIA); c.setFont(F['r'], 7)
            c.drawCentredString(mx + i*11*mm + 4.5*mm, y1 + 1*mm, str(i+1))
        c.setFillColor(colors.HexColor('#f7f0dd')); c.rect(W - mx - 9*mm, y1 - 2*mm, 9*mm, 9*mm, fill=1)
        c.setFillColor(TEAL); c.setFont(F['b'], 8)
        c.drawRightString(W - mx - 12*mm, y1 + 1*mm, 'SECONDO FIATO (1 ritento a episodio)')
        y2 = y1 - 14*mm
        frame_flow(c, mx, y2 - 44*mm, W - 2*mx, 44*mm, [
            Paragraph('abilit\u00e0 unica', SMB), Paragraph(hro['abil'], BODY),
            Spacer(1, 6),
            Paragraph('equipaggiamento iniziale', SMB), Paragraph(hro['equip'], BODY),
            Spacer(1, 4),
            Paragraph('Le armi (+1) aggiungono +1 ai tiri di Attacco.', SUB)])
        y3 = y2 - 54*mm
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(mx, y3, 'migliorie e oggetti di campagna')
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(4):
            c.line(mx, y3 - 8*mm - i*8*mm, W - mx, y3 - 8*mm - i*8*mm)
        y4 = y3 - 48*mm
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(mx, y4, 'cicatrici (alla terza: \u22121 permanente a una caratteristica)')
        for i in range(3):
            c.line(mx, y4 - 8*mm - i*8*mm, W - mx, y4 - 8*mm - i*8*mm)
        c.showPage()
    c.save()

# ================================================================= INDAGINE
def luogo_front(c, x, y, cw, ch, L):
    card_frame(c, x, y, cw, ch, seed=L['n'])
    c.saveState()
    c.setFillColor(RED)
    c.rect(x + 2.2*mm, y + ch - 12.5*mm, cw - 4.4*mm, 10.3*mm, fill=1, stroke=0)
    c.setStrokeColor(GOLD); c.setLineWidth(0.5)
    c.line(x + 4*mm, y + ch - 12.9*mm, x + cw - 4*mm, y + ch - 12.9*mm)
    c.setFillColor(colors.white); c.setFont(F['sc'], 12.5)
    c.drawString(x + 7*mm, y + ch - 9.7*mm, 'luogo %d \u2014 %s' % (L['n'], L['nome'].lower()))
    c.restoreState()
    c.setFillColor(TEAL); c.setFont(F['b'], 8.5)
    c.drawString(x + 7*mm, y + ch - 17*mm, L['req'])
    wave(c, x + cw - 26*mm, y + ch - 16.2*mm, 18*mm, GOLD, 1)
    flow = [Paragraph(L['testo'], BODY), Spacer(1, 4), Paragraph('indizi', SMB)]
    for cl in L['indizi']:
        flow.append(Paragraph('\u25c6 ' + cl, CLUE))
    if L['nascosto']:
        flow.append(Spacer(1, 3))
        flow.append(Paragraph('\u2739 ' + L['nascosto'], HIDN))
    frame_flow(c, x + 7*mm, y + 5*mm, cw - 14*mm, ch - 25*mm, flow)

def luogo_back(c, x, y, cw, ch, L):
    c.saveState()
    c.setFillColor(RED_DK); c.setStrokeColor(INK); c.setLineWidth(1.2)
    c.rect(x, y, cw, ch, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(0.8)
    c.rect(x + 3*mm, y + 3*mm, cw - 6*mm, ch - 6*mm)
    c.rect(x + 4.2*mm, y + 4.2*mm, cw - 8.4*mm, ch - 8.4*mm)
    cx, cy = x + cw/2, y + ch/2
    c.setFillColor(GOLD); c.setFont(F['sc'], 13)
    c.drawCentredString(cx, y + ch - 15*mm, 'ombre su roccamora')
    c.setStrokeColor(GOLD); c.setLineWidth(1.4)
    c.circle(cx, cy + 2*mm, 15*mm)
    c.setFont(F['sc'], 34)
    c.drawCentredString(cx, cy - 3.5*mm, str(L['n']))
    c.setFont(F['sc'], 12)
    c.drawCentredString(cx, y + 13*mm, 'luogo')
    triple_wave(c, cx, y + 9*mm, 26*mm, GOLD, 1, 2.6*mm)
    c.restoreState()

def indagine():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-03-Episodio1-Indagine.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Indagine')
    # lettera d'incarico
    parchment(c, W, H, seed=5)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 1')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il caso del campanaro scomparso')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, GOLD)
    lettera_deluxe = LETTERA.replace(
        'Alla Societ\u00e0 del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Societ\u00e0 del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 178*mm, W - 2*mx, 112*mm,
               [Paragraph('lettera d\u2019incarico \u2014 leggere ad alta voce', SMB),
                Paragraph(lettera_deluxe,
                          st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 190*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Ritagliate le carte Luogo delle pagine seguenti e disponetele coperte, numero in vista.')
    c.showPage()
    # carte luogo: fronti (2 per pagina) seguiti dai dorsi speculari
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
    # taccuino
    parchment(c, W, H, seed=9)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della societ\u00e0 \u2014 episodio 1')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, GOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO \u2014 barrate un\u2019ora per ogni visita:')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23', '24', '1', '2', '3']):
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

# ================================================================ SPEDIZIONE
def minaccia_back(c, x, y, cw, chh):
    c.saveState()
    c.setFillColor(TEAL_DK); c.setStrokeColor(INK); c.setLineWidth(1)
    c.rect(x + 1*mm, y + 1*mm, cw - 2*mm, chh - 2*mm, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(0.7)
    c.rect(x + 3.5*mm, y + 3.5*mm, cw - 7*mm, chh - 7*mm)
    cx = x + cw/2
    c.setFillColor(GOLD); c.setFont(F['sc'], 10.5)
    c.drawCentredString(cx, y + chh - 12*mm, 'ombre su roccamora')
    triple_wave(c, cx, y + chh/2 + 6*mm, 34*mm, GOLD, 1.6, 5*mm)
    c.setFont(F['sc'], 13)
    c.drawCentredString(cx, y + 9*mm, 'minaccia')
    c.restoreState()

def spedizione():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-04-Episodio1-Spedizione.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Spedizione')
    cwd, chh = 60*mm, 84*mm
    gx, gy = (W - 3*cwd) / 2.0, (H - 3*chh) / 2.0
    pages = [MINACCE[i:i+9] for i in range(0, len(MINACCE), 9)]
    for batch in pages:
        for i, (t, txt) in enumerate(batch):
            col, row = i % 3, i // 3
            x = gx + col * cwd
            y = H - gy - (row + 1) * chh
            card_frame(c, x + 1*mm, y + 1*mm, cwd - 2*mm, chh - 2*mm, seed=hash(t) % 97 + i)
            c.saveState(); c.setFillColor(TEAL)
            c.rect(x + 3.2*mm, y + chh - 14*mm, cwd - 6.4*mm, 10*mm, fill=1, stroke=0)
            c.restoreState()
            frame_flow(c, x + 5*mm, y + chh - 13.6*mm, cwd - 10*mm, 9.4*mm,
                       [Paragraph(t.lower(), CTTL)])
            wave(c, x + cwd/2 - 8*mm, y + chh - 18*mm, 16*mm, GOLD, 1)
            frame_flow(c, x + 5*mm, y + 5*mm, cwd - 10*mm, chh - 26*mm, [Paragraph(txt, CARD)])
        c.setFillColor(SEPIA); c.setFont(F['i'], 7.5)
        c.drawCentredString(W/2, 5*mm, 'stampa fronte/retro sul lato lungo: la pagina seguente contiene i dorsi')
        c.showPage()
        for i in range(len(batch)):
            col, row = 2 - (i % 3), i // 3  # mirrored for duplex long-edge
            minaccia_back(c, gx + col*cwd, H - gy - (row + 1)*chh, cwd, chh)
        c.showPage()
    # nemici
    parchment(c, W, H, seed=77)
    for j, N in enumerate(NEMICI):
        x, y, wdt, hgt = 20*mm, H - 25*mm - (j+1)*110*mm - j*10*mm, W - 40*mm, 110*mm
        card_frame(c, x, y, wdt, hgt, seed=60 + j)
        c.saveState(); c.setFillColor(RED)
        c.rect(x + 2.2*mm, y + hgt - 14*mm, wdt - 4.4*mm, 11.8*mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont(F['sc'], 15)
        c.drawString(x + 8*mm, y + hgt - 10.5*mm, N['nome'].lower())
        c.restoreState()
        wave(c, x + wdt - 32*mm, y + hgt - 10*mm, 24*mm, GOLD, 1.2)
        stats = [('ATTACCO', '+%d' % N['att']), ('DIFESA', N['dif']),
                 ('FERITE', N['fer']), ('MOVIMENTO', N['mov']), ('DANNO', N['dan'])]
        bw = (wdt - 16*mm - 4*6*mm) / 5.0
        for i, (lb, v) in enumerate(stats):
            stat_box(c, x + 8*mm + i*(bw + 6*mm), y + hgt - 40*mm, bw, lb, v)
        frame_flow(c, x + 8*mm, y + 8*mm, wdt - 16*mm, hgt - 52*mm,
                   [Paragraph(N['note'], BODY), Spacer(1, 5),
                    Paragraph('Attacca: 2d6 + Attacco \u2265 Difesa dell\u2019eroe \u2192 infligge il Danno. '
                              'Viene colpito se: 2d6 + VIGORE (+1 se armati) \u2265 la sua Difesa.', SUB)])
    c.showPage()
    # tessere sceniche
    ts = 130*mm
    cell = ts / 4.0
    for i, T in enumerate(TILES):
        pos = i % 2
        x = (W - ts) / 2.0
        y = H - 14*mm - ts - pos * (ts + 12*mm)
        stone_floor(c, x, y, ts, seed=i * 3 + 1)
        c.saveState()
        # gameplay grid
        c.setStrokeColor(INK); c.setLineWidth(0.9); c.setStrokeAlpha(0.45)
        for k in range(1, 4):
            c.line(x + k*cell, y, x + k*cell, y + ts)
            c.line(x, y + k*cell, x + ts, y + k*cell)
        c.setStrokeAlpha(1)
        # scenic extras
        if T['id'] == 'T1':
            water_band(c, x, y, ts, 9*mm)
        if T['id'] == 'T5':
            for (gx2, gy2, lab) in T['arredi']:
                fx, fy = x + gx2*cell, y + gy2*cell
                c.setStrokeColor(SEPIA); c.setLineWidth(0.8)
                for s in range(1, 4):
                    c.line(fx + 2*mm, fy + s*cell/4, fx + cell - 2*mm, fy + s*cell/4)
        if T['id'] == 'T6':
            import math
            ccx, ccy = x + 2*cell, y + 2.5*cell
            for k in range(12):
                a = k * math.pi * 2 / 12
                candle(c, ccx + math.cos(a)*cell*1.35, ccy + math.sin(a)*cell*0.95)
        # furniture with shadow
        for (gx2, gy2, lab) in T.get('arredi', []):
            if T['id'] == 'T5':
                continue
            fx, fy = x + gx2*cell, y + gy2*cell
            c.setFillColor(INK); c.setFillAlpha(0.18)
            c.rect(fx + 3*mm, fy + 1.2*mm, cell - 4*mm, cell - 4*mm, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFillColor(colors.HexColor('#cdbd97')); c.setStrokeColor(INK); c.setLineWidth(0.9)
            c.rect(fx + 2*mm, fy + 2*mm, cell - 4*mm, cell - 4*mm, fill=1)
            if lab == 'CELLA':
                c.setStrokeColor(INK); c.setLineWidth(1.1)
                for s in range(1, 5):
                    c.line(fx + 2*mm + s*(cell - 4*mm)/5, fy + 2*mm,
                           fx + 2*mm + s*(cell - 4*mm)/5, fy + cell - 2*mm)
            c.setFillColor(INK); c.setFont(F['sc'], 7)
            c.drawCentredString(fx + cell/2, fy + 3.2*mm, lab.lower())
        # frame + exits
        c.setStrokeColor(INK); c.setLineWidth(1.6)
        c.rect(x, y, ts, ts)
        c.setFillColor(RED); c.setFont(F['b'], 8)
        ex = T.get('exits', {})
        if 'N' in ex: c.drawCentredString(x + ts/2, y + ts + 1.8*mm, '\u25b2 verso ' + ex['N'])
        if 'S' in ex: c.drawCentredString(x + ts/2, y - 4.5*mm, '\u25bc verso ' + ex['S'])
        if 'E' in ex:
            c.saveState(); c.translate(x + ts + 4.5*mm, y + ts/2); c.rotate(-90)
            c.drawCentredString(0, 0, '\u25b6 verso ' + ex['E']); c.restoreState()
        if 'O' in ex:
            c.saveState(); c.translate(x - 2.5*mm, y + ts/2); c.rotate(90)
            c.drawCentredString(0, 0, '\u25c0 verso ' + ex['O']); c.restoreState()
        # title plaque
        c.setFillColor(colors.HexColor('#f4ecd6')); c.setFillAlpha(0.92)
        c.rect(x + 2.5*mm, y + ts - 37*mm, ts - 5*mm, 34.5*mm, fill=1, stroke=0)
        c.setFillAlpha(1)
        c.setStrokeColor(GOLD); c.setLineWidth(0.6)
        c.rect(x + 2.5*mm, y + ts - 37*mm, ts - 5*mm, 34.5*mm)
        c.setFillColor(RED); c.setFont(F['sc'], 12.5)
        c.drawString(x + 5*mm, y + ts - 8.5*mm, '%s \u2014 %s' % (T['id'], T['nome'].lower()))
        flow = [Paragraph(T['testo'], st('tile', fontSize=8.4, leading=10.2, alignment=4))]
        if T.get('cerca'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph('<b>Cercare (ACUME Media):</b> ' + T['cerca'],
                                  st('tc', fontSize=8.4, leading=10.2, textColor=TEAL)))
        frame_flow(c, x + 5*mm, y + ts - 36*mm, ts - 10*mm, 26*mm, flow)
        c.restoreState()
        if pos == 1 or i == len(TILES) - 1:
            c.showPage()
    # segnalini
    parchment(c, W, H, seed=88)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'segnalini \u2014 ritagliare')
    def token_row(y, label, items, fill, ring, tcol):
        c.setFillColor(TEAL); c.setFont(F['b'], 9)
        c.drawString(16*mm, y + 12*mm, label)
        for i, it in enumerate(items):
            cx = 24*mm + i * 19*mm
            c.setStrokeColor(INK); c.setLineWidth(1.1); c.setFillColor(fill)
            c.circle(cx, y, 8*mm, fill=1)
            c.setStrokeColor(ring); c.setLineWidth(0.8)
            c.circle(cx, y, 6.4*mm)
            c.setFillColor(tcol); c.setFont(F['sc'], 9.5)
            c.drawCentredString(cx, y - 1.4*mm, it)
    token_row(H - 44*mm, 'EROI', ['el', 'at', 'si', 'ni', 'ca'],
              colors.HexColor('#f7f0dd'), GOLD, INK)
    token_row(H - 74*mm, 'ADEPTI (x10)', ['a'] * 10,
              colors.HexColor('#4a4a54'), GOLD, colors.white)
    token_row(H - 104*mm, 'CUSTODE \u00b7 RUGGERO \u00b7 CANTO (x3)',
              ['cu', 'ru', '\u266a', '\u266a', '\u266a'], RED_DK, GOLD, GOLD)
    c.setFillColor(INK); c.setFont(F['i'], 9)
    c.drawString(16*mm, H - 128*mm, 'Consiglio: incollate il foglio su cartoncino prima di ritagliare. '
                                    'Le ferite dei nemici si segnano con monetine o a matita.')
    c.showPage()
    c.save()

if __name__ == '__main__':
    schede()  # 03 e 04 sono ora generati da gen_gothic.py
    print('OK deluxe schede')
