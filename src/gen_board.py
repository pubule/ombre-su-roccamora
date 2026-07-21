# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Tabellone (pdf/Ombre-su-Roccamora-07-Tabellone.pdf).

Overlay riusabile in ogni episodio per la Spedizione: NON contiene le tessere
(quelle si posano libere sul tavolo, la mappa cambia episodio per episodio,
vedi il pivot "generico/libero" scelto apposta per questo) ma da' una casa
fissa a cio' che altrimenti gira sciolto sul tavolo: il mazzo Minaccia con
gli scarti (foglio 1) e gli orologi della spedizione (foglio 2) - il Canto,
che gira in ogni episodio, piu' le tracce riusabili per Fuga, Demolizione,
Prova e Controcanto.

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

from deluxe_style import register_fonts, corner_flourish, art, pad_to_even_pages, ARTWORKS_DIR, F, GOLD

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Comune', 'pdf')
register_fonts()
W, H = A4
NOTTE = colors.HexColor('#17141a')
CREMA = colors.HexColor('#efe4c4')
CARD_W, CARD_H = 68*mm, 68*1.4*mm  # stessa taglia carta usata ovunque nella stampa
TOKEN = 50*mm  # deve restare = MINI in gen_gothic.py (taglia vera di una miniatura/casella)

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

def numbered_track(c, x0, y, box, gap, count, label):
    """Una riga di caselle numerate 0..count-1 (segnaposto per una traccia:
    FUGA/Demolizione/Prova/Controcanto). Un segnalino qualsiasi la percorre."""
    c.setFillColor(GOLD); c.setFont(F['sc'], 10)
    c.drawString(x0, y + box + 2.5*mm, label.lower())
    for i in range(count):
        x = x0 + i*(box + gap)
        dashed_rect_plain(c, x, y, box, box)
        c.setFillColor(CREMA); c.setFillAlpha(0.7); c.setFont(F['i'], 6.5)
        c.drawCentredString(x + box/2, y + box/2 - 2, str(i))
        c.setFillAlpha(1)


def retro(c, sub):
    """Retro scuro coerente col gioco: sigillo centrale + nome, cornice oro.
    Serve perche' board e tracce vanno su DUE fogli distinti (entrambi in
    tavola insieme): stampati fronte/retro finirebbero sui due lati dello
    stesso foglio, inservibili. Cosi' ogni fronte funzionale ha il suo retro."""
    c.setFillColor(NOTTE); c.rect(0, 0, W, H, fill=1, stroke=0)
    _vignette(c)
    gold_border(c)
    seal_img = art('Sigillo.png'); sw, sh = seal_img.getSize()
    d = 76*mm; dw, dh = d, d * sh / sw
    c.drawImage(seal_img, W/2 - dw/2, H/2 - dh/2 + 8*mm, width=dw, height=dh, mask='auto')
    c.setFillColor(GOLD); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H/2 - dh/2 - 2*mm, 'ombre su roccamora')
    c.setFillColor(CREMA); c.setFillAlpha(0.75); c.setFont(F['i'], 11)
    c.drawCentredString(W/2, H/2 - dh/2 - 12*mm, sub)
    c.setFillAlpha(1)
    c.showPage()


def tabellone():
    out_path = os.path.join(OUT_DIR, 'Ombre-su-Roccamora-07-Tabellone.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Tabellone')
    bg(c)
    gold_border(c)

    # Il Canto NON sta piu' qui: era una fila di 3 caselle a taglia miniatura
    # (50mm), e portarlo a 8 avrebbe richiesto 456mm su una pagina di 210. E'
    # diventato una traccia numerata 0-8 sul foglio degli orologi (102mm, un
    # segnalino solo che avanza) - dove stanno gia' Fuga, Demolizione e le
    # altre. Le 3 arti del crescendo restano: si sostituisce il segnalino ai
    # passi (sale -> risponde -> cresce).

    # --- mazzo Minaccia + scarti (taglia carta vera, CARD_W/CARD_H) ---
    minaccia_label_y = H - 32*mm
    c.setFillColor(GOLD); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, minaccia_label_y, 'minaccia')
    gap = 15*mm
    total = 2*CARD_W + gap
    x0 = (W - total) / 2
    y0 = minaccia_label_y - 6*mm - CARD_H
    dashed_rect(c, x0, y0, CARD_W, CARD_H, 'mazzo')
    dashed_rect(c, x0 + CARD_W + gap, y0, CARD_W, CARD_H, 'scarti')
    minaccia_bottom = y0 - 6*mm  # sotto le etichette "mazzo"/"scarti"

    # --- ingresso + direzione di espansione: niente riquadro-contenitore (una
    # tessera vera e' 200mm, non ci sta in nessun formato A4 insieme alle
    # altre) - solo dove posare la prima tessera (scoperta dall'inizio, le
    # altre restano coperte finche' un eroe non ci entra: si rivelano da
    # sole, non e' un'azione) e una freccia che indica che si puo' espandere
    # liberamente in ogni direzione sul tavolo, non solo verso la freccia.
    # Il riquadro e' a taglia vera (TOKEN = 1 casella/miniatura, non l'intera
    # tessera 200mm): l'etichetta lo dice esplicitamente per non far credere
    # che rappresenti la tessera intera. Tutto lo stack sotto "minaccia" e'
    # posizionato per gap espliciti da minaccia_bottom in giu', non a numeri
    # fissi indovinati: cosi' non si accavalla se le taglie sopra cambiano. ---
    m2 = 9.5*mm
    ing_x = m2 + 8*mm
    ing_y = 22*mm
    dashed_rect(c, ing_x, ing_y, TOKEN, TOKEN, 'ingresso — scoperta da subito')
    c.setFillColor(GOLD); c.setFont(F['sc'], 8)
    c.drawCentredString(ing_x + TOKEN/2, ing_y + TOKEN/2 + 2, '1 casella')
    c.drawCentredString(ing_x + TOKEN/2, ing_y + TOKEN/2 - 5, '(rif.)')

    ax0, ay0 = ing_x + TOKEN + 6*mm, ing_y + TOKEN*0.35
    ax1, ay1 = ax0 + 55*mm, ay0 + 28*mm
    arrow(c, ax0, ay0, ax1, ay1)
    c.setFillColor(CREMA); c.setFillAlpha(0.75); c.setFont(F['i'], 8)
    c.drawCentredString(ax1 + 12*mm, ay1 + 7*mm, 'espandete liberamente')
    c.drawCentredString(ax1 + 12*mm, ay1 + 1.5*mm, 'in ogni direzione')
    c.setFillAlpha(1)

    # caption a due righe, ancorata sopra all'ingresso e sotto a minaccia_bottom
    cap_y1 = minaccia_bottom - 5*mm
    c.setFillColor(CREMA); c.setFillAlpha(0.75); c.setFont(F['i'], 8)
    c.drawCentredString(W/2, cap_y1,
                        'il riquadro e’ una casella di riferimento: la tessera (200mm) si estende verso la freccia')
    c.drawCentredString(W/2, cap_y1 - 4.5*mm,
                        'le altre restano coperte finche’ un eroe non vi entra per la prima volta')
    c.setFillAlpha(1)

    c.setFillColor(CREMA); c.setFillAlpha(0.7); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, 12*mm, 'ombre su roccamora · società del lume — tabellone riusabile, tutte le tessere si posano libere')
    c.setFillAlpha(1)
    c.showPage()
    retro(c, 'tabellone — la minaccia')             # retro del foglio 1

    # --- foglio 2 (fronte): tracce di spedizione numerate (riusabili). Va su un
    # foglio a se': board e tracce servono in tavola CONTEMPORANEAMENTE. Alcuni episodi
    # fanno correre un segnalino su una traccia (FUGA, Demolizione, Prova,
    # Controcanto): qui hanno una casa stampata invece di "un segnalino su
    # carta". L'Ep.10 ne usa DUE insieme (Demolizione + Prova). ---
    bg(c); gold_border(c)
    c.setFillColor(GOLD); c.setFont(F['sc'], 14)
    c.drawCentredString(W/2, H - 24*mm, 'gli orologi della spedizione')
    c.setFillColor(CREMA); c.setFillAlpha(0.8); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, H - 30*mm,
                        'un segnalino su ciascuna. Il Canto vale in ogni episodio; le altre usatele '
                        'secondo l’episodio: Fuga, Demolizione, Prova, Controcanto.')
    c.drawCentredString(W/2, H - 34.5*mm,
                        'l’Ep. 10 ne usa due insieme (Demolizione e Prova). La casella d’arrivo è la soglia scritta nella Soluzione.')
    c.setFillAlpha(1)
    box, gap = 9*mm, 2.6*mm
    tx0 = (W - (15*box + 14*gap)) / 2
    ty = H - 58*mm
    # Il CANTO per primo: e' l'unico orologio che gira in ogni episodio. Arriva
    # a 8, il massimo che un episodio richieda (il risveglio del Dormiente,
    # Ep.20); dove scatti la soglia lo dice la Soluzione dell'episodio.
    numbered_track(c, tx0, ty, box, gap, 9, 'il canto (0–8)')
    ty -= 26*mm
    for lab, cnt in (('traccia A (0–14)', 15), ('traccia B (0–14)', 15),
                     ('traccia C (0–10)', 11), ('traccia D (0–10)', 11)):
        numbered_track(c, tx0, ty, box, gap, cnt, lab)
        ty -= 26*mm
    c.setFillColor(CREMA); c.setFillAlpha(0.7); c.setFont(F['i'], 8.5)
    c.drawCentredString(W/2, 12*mm, 'ombre su roccamora · società del lume — gli orologi della spedizione')
    c.setFillAlpha(1)
    c.showPage()
    retro(c, 'gli orologi della spedizione')         # retro del foglio 2
    c.save()
    pad_to_even_pages(out_path)

if __name__ == '__main__':
    tabellone()
    print('OK board')
