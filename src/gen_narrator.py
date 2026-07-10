# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Riferimenti Narratore (PDF 09).

L'UNICA cosa che lega una carta Approfondimento o Oggetto a un luogo/tessera
specifico. Le carte stesse non portano piu' questa informazione (dorso
Approfondimenti = solo tipo, carte Oggetto = solo nome): restano riusabili tra
episodi e i giocatori non possono dedurre dove cercare sfogliando i mazzi.

Una pagina per luogo (piu' le tessere che nascondono un oggetto da Cercare),
stile scheda personaggio: arte del luogo fusa nello strappo della pergamena
(stessa tecnica di deluxe_style.torn_portrait), ma con la variante di sfondo
CON STRAPPO IN ALTO (background scheda personaggio.png) per opporsi visivamente
alle schede eroe, che usano lo strappo in basso.

Non contiene le risposte alle 4 Domande: solo "quale carta prendere quando".
Non va sigillato come la Soluzione, ma tenuto a portata di mano dal narratore.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import register_fonts, torn_portrait, rule_border, F, INK, RED, TEAL, SEPIA
from gen_cards import LUOGHI, TILES, OGGETTI
import story
story.apply(LUOGHI, TILES, [], [], [])

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4

LUOGHI_ART = {
    1: 'bell tower.png',
    2: 'humble candlelit canal-side room.png',
    3: 'smoky canal tavern.png',
    4: 'nervous priest in a candlelit sacristy.png',
    5: 'abandoned luthier workshop.png',
    6: 'derelict warehouses over black still water.png',
    7: 'dusty municipal archive (libro+persona).png',
    8: 'cluttered 19th century police office.png',
}
TILE_ART = {
    'T2': 'T2.png',
    'T3': 'T3.png',
    'T4': 'T4.png',
}
TIPO_LABEL = {'Osservazione': 'Indizio Nascosto', 'Presagio': 'Indizio Nascosto',
              'Testimonianza': 'Testimone', 'Referto': 'Referto'}

TORN_TOP = 'background scheda personaggio.png'
# Mirror del window delle schede eroe (strappo in basso, window=(0.50,0.0,1.03,0.51)):
# qui lo strappo e' in alto, stessa fascia orizzontale destra, specchiata in verticale.
WINDOW_TOP = (0.50, 0.49, 1.03, 1.03)
MX = 20*mm
ART_BOTTOM = WINDOW_TOP[1] * H  # bordo inferiore della finestra d'arte

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=10, leading=14, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

LABEL = st('label', fontName=F['sc'], fontSize=10, textColor=TEAL)
NOME = st('nome', fontName=F['sc'], fontSize=17, textColor=RED, leading=19)
DESC = st('desc', fontName=F['i'], fontSize=9.5, leading=13.5, alignment=4)
ROW = st('row', fontName=F['r'], fontSize=10.5, leading=15)
NONE_ROW = st('none_row', fontName=F['i'], fontSize=9.5, leading=14, textColor=SEPIA)

def oggetto_di(ref):
    return next((o for o in OGGETTI if o['ref'] == ref), None)

def righe(approfondimenti, ref):
    out = []
    for a in approfondimenti:
        tipo = TIPO_LABEL[a['tipo']]
        if 'soggetto' in a:
            out.append(f"<b>{tipo}</b> — carta “{a['soggetto']}”")
        else:
            out.append(f"<b>{tipo}</b> <i>({a['tipo']})</i>")
    ogg = oggetto_di(ref)
    if ogg:
        out.append(f"<b>Oggetto</b> — carta “{ogg['nome'].title()}”")
    return out

def header(c, label_text, nome_text):
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(MX, H - 20*mm, label_text.lower())
    c.setFillColor(RED); c.setFont(F['sc'], 18)
    # nomi lunghi: riduci il font finche' non entra nella colonna libera (bordo art escluso)
    max_w = WINDOW_TOP[0]*W - MX - 4*mm
    size = 18
    while c.stringWidth(nome_text.lower(), F['sc'], size) > max_w and size > 10:
        size -= 1
    c.setFont(F['sc'], size)
    c.drawString(MX, H - 30*mm, nome_text.lower())
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, ART_BOTTOM - 4*mm, W - MX, ART_BOTTOM - 4*mm)

def body(c, testo, rows):
    y = ART_BOTTOM - 12*mm
    d = Paragraph(testo, DESC)
    dw, dh = d.wrapOn(c, W - 2*MX, 60*mm)
    d.drawOn(c, MX, y - dh)
    y -= dh + 8*mm
    if not rows:
        p = Paragraph('Nessun Approfondimento o Oggetto qui.', NONE_ROW)
        p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - 5*mm)
        return
    for r in rows:
        p = Paragraph(f'— {r}', ROW)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 4*mm

def narratore():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-09-Riferimenti-Narratore.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Riferimenti Narratore')

    for L in LUOGHI:
        torn_portrait(c, W, H, LUOGHI_ART[L['n']], TORN_TOP, window=WINDOW_TOP)
        rule_border(c, W, H)
        header(c, f"luogo {L['n']}", L['nome'])
        body(c, L['testo'], righe(L['approfondimenti'], f"L{L['n']}"))
        c.showPage()

    for t in TILES:
        if t['id'] not in TILE_ART:
            continue
        torn_portrait(c, W, H, TILE_ART[t['id']], TORN_TOP, window=WINDOW_TOP)
        rule_border(c, W, H)
        header(c, f"tessera {t['id']}", t['nome'])
        body(c, t['testo'], righe([], t['id']))
        c.showPage()

    c.save()

if __name__ == '__main__':
    narratore()
    print('OK narratore')
