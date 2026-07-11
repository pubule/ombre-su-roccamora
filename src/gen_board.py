# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Tabellone (pdf/Ombre-su-Roccamora-07-Tabellone.pdf).

Overlay riusabile in ogni episodio per la Spedizione: NON contiene le tessere
(quelle si posano libere sul tavolo, la mappa cambia episodio per episodio,
vedi il pivot "generico/libero" scelto apposta per questo) ma da' una casa
fissa a due elementi che altrimenti girano sciolti sul tavolo - la traccia
del Canto (3 caselle) e il mazzo Minaccia con gli scarti.

Sfondo scuro liscio (nessuna arte Midjourney per ora: l'utente ha detto
esplicitamente che va bene "anche nero" pur di avere gli slot funzionali
subito) con un sigillo enorme e sbiadito come unico elemento decorativo, cosi'
il centro della pagina non resta un vuoto morto. Se in futuro si genera uno
sfondo dedicato, vedi il prompt suggerito in fondo al file: basta sostituire
`bg()` per usarlo, gli slot sopra restano identici.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from deluxe_style import register_fonts, corner_flourish, art, F, GOLD

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4
NOTTE = colors.HexColor('#17141a')
CREMA = colors.HexColor('#efe4c4')
CARD_W, CARD_H = 68*mm, 68*1.4*mm  # stessa taglia carta usata ovunque nella stampa

def bg(c):
    """Sfondo scuro liscio + vignetta ai bordi + sigillo enorme e sbiadito al
    centro (evita un vuoto morto senza distrarre dagli slot funzionali)."""
    c.setFillColor(NOTTE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    seal_img = art('Sigillo.png')
    sw, sh = seal_img.getSize()
    d = 190*mm
    dw, dh = d, d * sh / sw
    c.saveState()
    c.translate(W/2, H/2); c.rotate(-8)
    c.setFillAlpha(1)
    c.drawImage(seal_img, -dw/2, -dh/2, width=dw, height=dh, mask='auto')
    c.restoreState()
    # velo scuro sopra il sigillo per riportarlo a un filigrana appena percettibile
    c.setFillColor(NOTTE); c.setFillAlpha(0.88)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillAlpha(1)
    for i, a in ((16*mm, 0.5), (7*mm, 0.35)):
        c.setFillColor(colors.black); c.setFillAlpha(a)
        c.rect(0, 0, W, i, fill=1, stroke=0); c.rect(0, H - i, W, i, fill=1, stroke=0)
        c.rect(0, 0, i, H, fill=1, stroke=0); c.rect(W - i, 0, i, H, fill=1, stroke=0)
    c.setFillAlpha(1)

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

def dashed_rect(c, x, y, w, h, label):
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setDash(4, 3)
    c.rect(x, y, w, h)
    c.restoreState()
    c.setFillColor(GOLD); c.setFont(F['sc'], 9)
    c.drawCentredString(x + w/2, y - 6*mm, label.lower())

def dashed_circle(c, cx, cy, r):
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setDash(3, 2.4)
    c.circle(cx, cy, r)
    c.restoreState()

def tabellone():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-07-Tabellone.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Tabellone')
    bg(c)
    gold_border(c)

    # --- traccia del Canto: 3 caselle ---
    c.setFillColor(GOLD); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 55*mm, 'il canto')
    cy = H - 78*mm
    for i in range(3):
        cx = W/2 + (i - 1) * 34*mm
        dashed_circle(c, cx, cy, 13*mm)

    # --- mazzo Minaccia + scarti ---
    c.setFillColor(GOLD); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 105*mm, 'minaccia')
    gap = 15*mm
    total = 2*CARD_W + gap
    x0 = (W - total) / 2
    y0 = H - 118*mm - CARD_H
    dashed_rect(c, x0, y0, CARD_W, CARD_H, 'mazzo')
    dashed_rect(c, x0 + CARD_W + gap, y0, CARD_W, CARD_H, 'scarti')

    c.setFillColor(CREMA); c.setFillAlpha(0.7); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, 12*mm, 'ombre su roccamora · società del lume — tabellone riusabile, tutte le tessere si posano libere')
    c.setFillAlpha(1)
    c.showPage()
    c.save()

if __name__ == '__main__':
    tabellone()
    print('OK board')

# Prompt Midjourney suggerito per sostituire lo sfondo liscio con arte vera
# (facoltativo, vedi PROMPT-MIDJOURNEY.md sezione "Tabellone" quando esiste):
#
# full bleed dark fantasy painting, worn black stone dock floor beside still
# canal water at night, faint gold filigree markings barely visible in the
# stone, sparse dripped black wax, 1889 gaslamp gothic, oil painting, muted
# teal and crimson palette with gold accents, very dark and atmospheric
# --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
