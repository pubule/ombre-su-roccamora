# -*- coding: utf-8 -*-
"""Ombre su Roccamora - versione GOTICA di carte e tessere (03 e 04)."""
import math
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment, rule_border, seal, wave,
                          triple_wave, candle, F, INK, RED, TEAL, PAPER,
                          PAPER_DK, GOLD as OGOLD, SEPIA)
import ornaments as O
from ornaments import (NIGHT, NIGHTR, GOLD, GOLD_L, GOLD_D, BONE, BLOOD,
                       INKMAP, ornate_frame, banner, medallion, ink_rect,
                       ink_line, hatch_band, stipple, compass)
from gen_cards import LUOGHI, MINACCE, NEMICI, TILES, HEROES
import story
MINACCE = story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)
LETTERA = story.LETTERA2

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

ICONS = {
    'ADEPTO IN AGGUATO': O.icon_hood, 'VOLTI TRA LE CASSE': O.icon_hood,
    'IL FALCETTO NEL BUIO': O.icon_hood, 'LA VEDETTA': O.icon_hood,
    'RONDA': O.icon_hood, 'RINFORZI DAL CANALE': O.icon_anchor,
    'CANI DEI MOLI': O.icon_paw, 'UNGHIE SULLA PIETRA': O.icon_paw,
    'IL FONDITORE': O.icon_ladle, 'LA MAREA DI CERA': O.icon_ladle,
    'TRAPPOLA DI CERA': O.icon_trap, 'CERA SOTTO I PIEDI': O.icon_trap,
    'FUMI SOPORIFERI': O.icon_smoke,
    'IL CANTO SALE': O.icon_note, 'IL CORO RISPONDE': O.icon_note,
    'IL CANTO CRESCE': O.icon_note,
    'PRESAGIO': O.icon_eye, 'ECO AMICA': O.icon_bell,
    'CERA CHE COLA': O.icon_drip, 'SUSSURRI': O.icon_spiral,
}

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
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-03-Episodio1-Indagine.pdf', pagesize=A4)
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
def minaccia_front(c, x, y, cw, chh, title, txt):
    ornate_frame(c, x, y, cw, chh, base=NIGHT)
    banner(c, x + cw/2, y + chh - 10.5*mm, cw - 16*mm, 8*mm)
    c.setFillColor(BONE); c.setFont(F['sc'], 8.6)
    c.drawCentredString(x + cw/2, y + chh - 11.7*mm, title.lower())
    cx, cy = x + cw/2, y + chh - 29*mm
    medallion(c, cx, cy, 11*mm, GOLD)
    # alone dietro l'icona
    c.saveState()
    for k in range(4, 0, -1):
        c.setFillColor(GOLD_L); c.setFillAlpha(0.05)
        c.circle(cx, cy, 10*mm*k/4, fill=1, stroke=0)
    c.setFillAlpha(1); c.restoreState()
    ICONS.get(title, O.icon_eye)(c, cx, cy, 6.8*mm)
    frame_flow(c, x + 8*mm, y + 6*mm, cw - 16*mm, chh - 48*mm, [Paragraph(txt, MTXT)])
    O.gem(c, cx, y + 7.5*mm, 1.8*mm)

def minaccia_back(c, x, y, cw, chh):
    ornate_frame(c, x, y, cw, chh, base=colors.HexColor('#101c1f'))
    cx, cy = x + cw/2, y + chh/2 + 4*mm
    c.setFillColor(GOLD_L); c.setFont(F['sc'], 9.5)
    c.drawCentredString(cx, y + chh - 12*mm, 'ombre su roccamora')
    medallion(c, cx, cy, 15*mm, GOLD)
    triple_wave(c, cx, cy + 4*mm, 20*mm, GOLD_L, 1.4, 4*mm)
    for sgn in (-1, 1):
        O.scroll(c, cx + sgn*4*mm, cy - 22*mm, 9*mm, -sgn, GOLD, 0.9)
        O.scroll(c, cx + sgn*4*mm, y + chh - 22*mm, 9*mm, -sgn, GOLD, 0.9)
    banner(c, cx, y + 12*mm, 32*mm, 7*mm)
    c.setFillColor(BONE); c.setFont(F['sc'], 10)
    c.drawCentredString(cx, y + 10.9*mm, 'minaccia')

def tile_gothic(c, x, y, ts, T, idx):
    cell = ts / 4.0
    wall = 3.6*mm
    # pergamena della tessera
    c.saveState()
    c.setFillColor(PAPER); c.rect(x - wall, y - wall, ts + 2*wall, ts + 2*wall, fill=1, stroke=0)
    import random
    rnd = random.Random(idx * 7)
    p = c.beginPath(); p.rect(x - wall, y - wall, ts + 2*wall, ts + 2*wall); c.clipPath(p, stroke=0)
    for _ in range(9):
        r = rnd.uniform(8*mm, 26*mm)
        c.setFillColor(PAPER_DK); c.setFillAlpha(rnd.uniform(0.07, 0.15))
        c.circle(x + rnd.uniform(0, ts), y + rnd.uniform(0, ts), r, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()
    # muri: doppia linea a china + tratteggio
    exits = T.get('exits', {})
    gap = 2 * cell / 3.0
    def wall_seg(side):
        segs = []
        if side in exits:
            if side in ('N', 'S'):
                segs = [(x, x + ts/2 - gap/2), (x + ts/2 + gap/2, x + ts)]
            else:
                segs = [(y, y + ts/2 - gap/2), (y + ts/2 + gap/2, y + ts)]
        else:
            segs = [(x, x + ts)] if side in ('N', 'S') else [(y, y + ts)]
        return segs
    sd = idx * 13
    for a, b in wall_seg('S'):
        hatch_band(c, a, y - wall, b - a, wall, sd+1); ink_line(c, a, y, b, y, sd+1, 1.3); ink_line(c, a, y - wall, b, y - wall, sd+5, 1.0)
    for a, b in wall_seg('N'):
        hatch_band(c, a, y + ts, b - a, wall, sd+2); ink_line(c, a, y + ts, b, y + ts, sd+2, 1.3); ink_line(c, a, y + ts + wall, b, y + ts + wall, sd+6, 1.0)
    for a, b in wall_seg('O'):
        hatch_band(c, x - wall, a, wall, b - a, sd+3); ink_line(c, x, a, x, b, sd+3, 1.3); ink_line(c, x - wall, a, x - wall, b, sd+7, 1.0)
    for a, b in wall_seg('E'):
        hatch_band(c, x + ts, a, wall, b - a, sd+4); ink_line(c, x + ts, a, x + ts, b, sd+4, 1.3); ink_line(c, x + ts + wall, a, x + ts + wall, b, sd+8, 1.0)
    # griglia di gioco leggera
    c.saveState()
    c.setStrokeColor(SEPIA); c.setLineWidth(0.4); c.setStrokeAlpha(0.5)
    for k in range(1, 4):
        c.line(x + k*cell, y, x + k*cell, y + ts)
        c.line(x, y + k*cell, x + ts, y + k*cell)
    c.setStrokeAlpha(1); c.restoreState()
    # ombreggiature d'angolo a puntini
    stipple(c, x + 1*mm, y + 1*mm, 16*mm, 10*mm, sd+9, n=60)
    stipple(c, x + ts - 17*mm, y + ts - 11*mm, 16*mm, 10*mm, sd+10, n=60)
    # elementi scenici
    if T['id'] == 'T1':
        stipple(c, x, y + 0.5*mm, ts, 8*mm, sd+11, n=220)
        for i in range(5):
            wave(c, x + 4*mm + i*(ts - 12*mm)/4, y + 3.5*mm, 10*mm, INKMAP, 0.8)
    if T['id'] == 'T5':
        for (gx2, gy2, lab) in T['arredi']:
            fx, fy = x + gx2*cell, y + gy2*cell
            for s in range(1, 4):
                ink_line(c, fx + 2*mm, fy + s*cell/4, fx + cell - 2*mm, fy + s*cell/4, sd + s, 0.8)
    if T['id'] == 'T6':
        ccx, ccy = x + 2*cell, y + 2.5*cell
        for k in range(12):
            a = k * math.pi * 2 / 12
            candle(c, ccx + math.cos(a)*cell*1.35, ccy + math.sin(a)*cell*0.95, 2*mm)
    # arredi a china
    for (gx2, gy2, lab) in T.get('arredi', []):
        if T['id'] == 'T5':
            continue
        fx, fy = x + gx2*cell + 2*mm, y + gy2*cell + 2*mm
        fw = cell - 4*mm
        hatch_band(c, fx + 1.5*mm, fy - 1.2*mm, fw, 1.2*mm, sd + gx2*4 + gy2, step=1.2*mm)
        ink_rect(c, fx, fy, fw, fw, seed=sd + gx2 + gy2*4, double=True)
        if lab == 'CELLA':
            for s in range(1, 5):
                ink_line(c, fx + s*fw/5, fy + 1*mm, fx + s*fw/5, fy + fw - 1*mm, sd + s, 1.0)
        c.setFillColor(INKMAP); c.setFont(F['sc'], 6.5)
        c.drawCentredString(fx + fw/2, fy + 2.6*mm, lab.lower())
    # etichette uscite
    c.setFillColor(BLOOD); c.setFont(F['b'], 8)
    if 'N' in exits: c.drawCentredString(x + ts/2, y + ts + wall + 1.6*mm, '\u25b2 verso ' + exits['N'])
    if 'S' in exits: c.drawCentredString(x + ts/2, y - wall - 4.4*mm, '\u25bc verso ' + exits['S'])
    if 'E' in exits:
        c.saveState(); c.translate(x + ts + wall + 4*mm, y + ts/2); c.rotate(-90)
        c.drawCentredString(0, 0, '\u25b6 verso ' + exits['E']); c.restoreState()
    if 'O' in exits:
        c.saveState(); c.translate(x - wall - 2*mm, y + ts/2); c.rotate(90)
        c.drawCentredString(0, 0, '\u25c0 verso ' + exits['O']); c.restoreState()
    # targa titolo + testo
    banner(c, x + ts/2, y + ts - 7*mm, ts - 26*mm, 8*mm)
    c.setFillColor(BONE); c.setFont(F['sc'], 10.5)
    c.drawCentredString(x + ts/2, y + ts - 8.3*mm, '%s \u00b7 %s' % (T['id'], T['nome'].lower()))
    c.saveState()
    c.setFillColor(colors.HexColor('#f4ecd6')); c.setFillAlpha(0.94)
    c.rect(x + 3*mm, y + ts - 41*mm, ts - 6*mm, 28*mm, fill=1, stroke=0)
    c.setFillAlpha(1)
    ink_rect(c, x + 3*mm, y + ts - 41*mm, ts - 6*mm, 28*mm, seed=idx + 99, lw=0.8)
    flow = [Paragraph(T['testo'], st('tile', fontSize=8.3, leading=10, alignment=4))]
    if T.get('cerca'):
        flow.append(Spacer(1, 2))
        flow.append(Paragraph('<b>Cercare (ACUME Media):</b> ' + T['cerca'],
                              st('tc', fontSize=8.3, leading=10, textColor=TEAL)))
    frame_flow(c, x + 5*mm, y + ts - 40.4*mm, ts - 10*mm, 27*mm, flow)
    c.restoreState()
    compass(c, x + ts - 9*mm, y + 10*mm, 4*mm)

def spedizione():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-04-Episodio1-Spedizione.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Spedizione')
    cwd, chh = 60*mm, 84*mm
    gx, gy = (W - 3*cwd) / 2.0, (H - 3*chh) / 2.0
    pages = [MINACCE[i:i+9] for i in range(0, len(MINACCE), 9)]
    for batch in pages:
        for i, (t, txt) in enumerate(batch):
            col, row = i % 3, i // 3
            minaccia_front(c, gx + col*cwd + 1*mm, H - gy - (row + 1)*chh + 1*mm,
                           cwd - 2*mm, chh - 2*mm, t, txt)
        c.setFillColor(SEPIA); c.setFont(F['i'], 7.5)
        c.drawCentredString(W/2, 5*mm, 'stampa fronte/retro sul lato lungo: la pagina seguente contiene i dorsi')
        c.showPage()
        for i in range(len(batch)):
            col, row = 2 - (i % 3), i // 3
            minaccia_back(c, gx + col*cwd + 1*mm, H - gy - (row + 1)*chh + 1*mm,
                          cwd - 2*mm, chh - 2*mm)
        c.showPage()
    # nemici in stile gotico (2 per pagina)
    for j, N in enumerate(NEMICI):
        pos = j % 2
        x, y, wdt, hgt = 20*mm, H - 25*mm - (pos+1)*110*mm - pos*10*mm, W - 40*mm, 110*mm
        ornate_frame(c, x, y, wdt, hgt, base=NIGHT)
        banner(c, x + wdt/2, y + hgt - 11*mm, wdt - 40*mm, 9.5*mm)
        c.setFillColor(BONE); c.setFont(F['sc'], 13.5)
        c.drawCentredString(x + wdt/2, y + hgt - 12.6*mm, N['nome'].lower())
        stats = [('attacco', '+%d' % N['att']), ('difesa', N['dif']),
                 ('ferite', N['fer']), ('movimento', N['mov']), ('danno', N['dan'])]
        bw = (wdt - 24*mm - 4*6*mm) / 5.0
        for i, (lb, v) in enumerate(stats):
            bx = x + 12*mm + i*(bw + 6*mm)
            by = y + hgt - 42*mm
            c.setFillColor(colors.HexColor('#241f2a')); c.setStrokeColor(GOLD)
            c.setLineWidth(0.9)
            c.rect(bx, by, bw, 18*mm, fill=1)
            c.setFillColor(GOLD_L); c.setFont(F['sc'], 7.5)
            c.drawCentredString(bx + bw/2, by + 13*mm, lb)
            c.setFillColor(BONE); c.setFont(F['b'], 18)
            c.drawCentredString(bx + bw/2, by + 4*mm, str(v))
            O.gem(c, bx + bw/2, by, 1.5*mm)
        frame_flow(c, x + 12*mm, y + 9*mm, wdt - 24*mm, hgt - 56*mm,
                   [Paragraph(N['note'], st('nn', fontSize=9.6, leading=12.5,
                                            textColor=BONE, alignment=4)),
                    Spacer(1, 5),
                    Paragraph('Attacca: 2d6 + Attacco \u2265 Difesa dell\u2019eroe \u2192 infligge il Danno. '
                              'Viene colpito se: 2d6 + VIGORE (+1 se armati) \u2265 la sua Difesa.',
                              st('ns', fontName=F['i'], fontSize=8.6, leading=11,
                                 textColor=GOLD_L))])
        if pos == 1 or j == len(NEMICI) - 1:
            c.showPage()
    # tessere a china
    ts = 126*mm
    for i, T in enumerate(TILES):
        pos = i % 2
        x = (W - ts) / 2.0
        y = H - 17*mm - ts - pos * (ts + 15*mm)
        tile_gothic(c, x, y, ts, T, i)
        if pos == 1 or i == len(TILES) - 1:
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
