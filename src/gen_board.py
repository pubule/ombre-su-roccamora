# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Tabellone (pdf/Ombre-su-Roccamora-07-Tabellone.pdf).

Overlay riusabile in ogni episodio per la Spedizione: NON contiene le tessere
(quelle si posano libere sul tavolo, la mappa cambia episodio per episodio,
vedi il pivot "generico/libero" scelto apposta per questo) ma da' una casa
fissa a due elementi che altrimenti girano sciolti sul tavolo - la traccia
del Canto (3 caselle) e il mazzo Minaccia con gli scarti.

Sfondo: usa `artworks/Tabellone.png` se esiste (prompt in PROMPT-MIDJOURNEY.md,
sezione "Sfondo Tabellone"), altrimenti un fondo scuro liscio con un sigillo
enorme e sbiadito come unico elemento decorativo (cosi' il centro della
pagina non resta un vuoto morto anche senza arte dedicata) - l'utente ha
detto esplicitamente che va bene "anche nero" pur di avere gli slot
funzionali subito. In entrambi i casi un velo scuro sopra tiene il contrasto
basso: gli slot sono tratteggi oro sottili, devono restare leggibili.
"""
import os
import math
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from deluxe_style import register_fonts, corner_flourish, art, ARTWORKS_DIR, F, GOLD

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4
NOTTE = colors.HexColor('#17141a')
CREMA = colors.HexColor('#efe4c4')
CARD_W, CARD_H = 68*mm, 68*1.4*mm  # stessa taglia carta usata ovunque nella stampa

def _veil(c, alpha):
    c.setFillColor(NOTTE); c.setFillAlpha(alpha)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillAlpha(1)

def _vignette(c):
    for i, a in ((16*mm, 0.5), (7*mm, 0.35)):
        c.setFillColor(colors.black); c.setFillAlpha(a)
        c.rect(0, 0, W, i, fill=1, stroke=0); c.rect(0, H - i, W, i, fill=1, stroke=0)
        c.rect(0, 0, i, H, fill=1, stroke=0); c.rect(W - i, 0, i, H, fill=1, stroke=0)
    c.setFillAlpha(1)

def bg(c):
    if os.path.exists(os.path.join(ARTWORKS_DIR, 'Tabellone.png')):
        img = art('Tabellone.png')
        iw, ih = img.getSize()
        scale = max(W / iw, H / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(img, (W - dw) / 2, (H - dh) / 2, width=dw, height=dh, mask=None)
        _veil(c, 0.5)
    else:
        c.setFillColor(NOTTE)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        seal_img = art('Sigillo.png')
        sw, sh = seal_img.getSize()
        d = 190*mm
        dw, dh = d, d * sh / sw
        c.saveState()
        c.translate(W/2, H/2); c.rotate(-8)
        c.drawImage(seal_img, -dw/2, -dh/2, width=dw, height=dh, mask='auto')
        c.restoreState()
        # velo scuro sopra il sigillo per riportarlo a un filigrana appena percettibile
        _veil(c, 0.88)
    _vignette(c)

def gold_border(c):
    """Doppio filetto oro + fiorellini d'angolo (stessa tecnica di rule_border,
    qui senza il tratto INK: su fondo scuro l'inchiostro non si vedrebbe)."""
    m1, m2 = 7*mm, 9.5*mm
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1)
    c.rect(m1, m1, W - 2*m1, H - 2*m1)
    c.setLineWidth(0.6)
    c.rect(m2, m2, W - 2*m2, H - 2*m2)
    s = 7*mm
    corner_flourish(c, m2 + 1.5*mm, m2 + 1.5*mm, s, 0)
    corner_flourish(c, W - m2 - 1.5*mm, m2 + 1.5*mm, s, 90)
    corner_flourish(c, W - m2 - 1.5*mm, H - m2 - 1.5*mm, s, 180)
    corner_flourish(c, m2 + 1.5*mm, H - m2 - 1.5*mm, s, 270)
    c.restoreState()

def dashed_rect_plain(c, x, y, w, h):
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setDash(4, 3)
    c.rect(x, y, w, h)
    c.restoreState()

def dashed_rect(c, x, y, w, h, label):
    dashed_rect_plain(c, x, y, w, h)
    c.setFillColor(GOLD); c.setFont(F['sc'], 9)
    c.drawCentredString(x + w/2, y - 6*mm, label.lower())

def dashed_circle(c, cx, cy, r):
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setDash(3, 2.4)
    c.circle(cx, cy, r)
    c.restoreState()

def arrow(c, x0, y0, x1, y1, head=5*mm):
    """Freccia tratteggiata (linea + punta a V): indica una direzione senza
    pretendere di delimitare un'area, coerente con lo spazio tessere libero."""
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1.1); c.setDash(3, 2.4)
    c.line(x0, y0, x1, y1)
    c.restoreState()
    ang = math.atan2(y1 - y0, x1 - x0)
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1.1)
    for da in (0.5, -0.5):
        c.line(x1, y1, x1 - head*math.cos(ang - da), y1 - head*math.sin(ang - da))
    c.restoreState()

def tabellone():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-07-Tabellone.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Tabellone')
    bg(c)
    gold_border(c)

    # --- traccia del Canto: 3 caselle (fascia compatta in alto, per lasciare
    # spazio alla zona tessere sotto) ---
    c.setFillColor(GOLD); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 22*mm, 'il canto')
    cy = H - 40*mm
    for i in range(3):
        cx = W/2 + (i - 1) * 28*mm
        dashed_circle(c, cx, cy, 10*mm)

    # --- mazzo Minaccia + scarti ---
    c.setFillColor(GOLD); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 62*mm, 'minaccia')
    gap = 15*mm
    total = 2*CARD_W + gap
    x0 = (W - total) / 2
    y0 = H - 70*mm - CARD_H
    dashed_rect(c, x0, y0, CARD_W, CARD_H, 'mazzo')
    dashed_rect(c, x0 + CARD_W + gap, y0, CARD_W, CARD_H, 'scarti')

    # --- ingresso + direzione di espansione: niente riquadro-contenitore (una
    # tessera vera e' 130mm, non ci sta in nessun formato A4 insieme alle
    # altre) - solo dove posare la prima tessera (scoperta dall'inizio, le
    # altre restano coperte finche' un eroe non ci entra: si rivelano da
    # sole, non e' un'azione) e una freccia che indica che si puo' espandere
    # liberamente in ogni direzione sul tavolo, non solo verso la freccia. ---
    m2 = 9.5*mm
    ing_side = 50*mm
    ing_x = m2 + 8*mm
    ing_y = 24*mm
    dashed_rect(c, ing_x, ing_y, ing_side, ing_side, 'ingresso — scoperta da subito')
    c.setFillColor(GOLD); c.setFont(F['sc'], 9)
    c.drawCentredString(ing_x + ing_side/2, ing_y + ing_side/2 + 3, '1ª tessera')

    ax0, ay0 = ing_x + ing_side + 6*mm, ing_y + ing_side*0.35
    ax1, ay1 = ax0 + 55*mm, ay0 + 40*mm
    arrow(c, ax0, ay0, ax1, ay1)
    c.setFillColor(CREMA); c.setFillAlpha(0.75); c.setFont(F['i'], 8.5)
    c.drawCentredString(ax1 + 12*mm, ay1 + 9*mm, 'espandete liberamente')
    c.drawCentredString(ax1 + 12*mm, ay1 + 2*mm, 'in ogni direzione')
    c.setFillAlpha(1)

    c.setFillColor(CREMA); c.setFillAlpha(0.75); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, 112*mm,
                        'le altre tessere restano coperte: si rivelano da sole quando un eroe ci entra per la prima volta')
    c.setFillAlpha(1)

    c.setFillColor(CREMA); c.setFillAlpha(0.7); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, 12*mm, 'ombre su roccamora · società del lume — tabellone riusabile, tutte le tessere si posano libere')
    c.setFillAlpha(1)
    c.showPage()
    c.save()

if __name__ == '__main__':
    tabellone()
    print('OK board')
