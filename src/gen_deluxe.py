# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Schede Personaggio (PDF 02, versione deluxe).

Solo le schede: Indagine (03) e Spedizione (04) sono generate da gen_gothic.py.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, torn_portrait, rule_border, pad_to_even_pages, parchment_art, seal, F,
                          ARTWORKS_DIR, INK, RED, TEAL, PAPER_DK, GOLD, SEPIA)
from gen_cards import HEROES, LUOGHI, MINACCE, NEMICI, TILES
import story
story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Comune', 'pdf')
register_fonts()
W, H = A4

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

BODY = st('body', alignment=4)
SMB  = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)
SUB  = st('sub', fontName=F['i'], fontSize=9, textColor=TEAL)

def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

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
# Ritratto eroe fuso nello strappo della pergamena (trasparenza reale nel png):
# stessa arte usata per le carte Eroi. Solo la variante "2" (strappo in basso a
# destra): l'altra invaderebbe nome/statistiche/abilità in alto, troppo densi.
PORTRAIT = ['Elena.png', 'Attilio.png', 'Sibilla.png', 'Nino.png', 'Ottone.png', 'Carla.png',
            'Lazzaro.png', 'Celso.png', 'Fulgenzio.png', 'Ottavio.png', 'Mora.png']
TORN_BG = 'background scheda personaggio 2.png'
CUT_X = 105*mm  # bordo sinistro dello strappo trasparente: le righe da scrivere si fermano prima

def schede():
    out_path = os.path.join(OUT_DIR, 'Ombre-su-Roccamora-02-Schede-Personaggio.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Schede Personaggio')
    for pg, hro in enumerate(HEROES):
        # ritratto non ancora generato (eroi nuovi in attesa dell'arte MJ):
        # salta la scheda con avviso invece di crashare, stesso pattern di
        # gen_preludio.luoghi() - rilanciare quando l'arte esiste.
        if not os.path.exists(os.path.join(ARTWORKS_DIR, PORTRAIT[pg])):
            print(f"SALTO scheda {hro['nome']}: manca artworks/{PORTRAIT[pg]}"
                  ' (genera il ritratto con PROMPT-MIDJOURNEY.md e rilancia)')
            continue
        torn_portrait(c, W, H, PORTRAIT[pg], TORN_BG)
        rule_border(c, W, H)
        mx, mt = 20*mm, 20*mm
        c.setFillColor(RED); c.setFont(F['sc'], 23)
        c.drawString(mx, H - mt - 6*mm, hro['nome'].lower())
        c.setFillColor(TEAL); c.setFont(F['i'], 13)
        c.drawString(mx, H - mt - 12.5*mm, hro['ruolo'] + '  —  Società del Lume, Roccamora')
        seal(c, W - mx - 8*mm, H - mt - 6*mm, r=9*mm, angle=-16)
        c.setStrokeColor(INK); c.setLineWidth(1)
        c.line(mx, H - mt - 16*mm, W - mx, H - mt - 16*mm)
        # riquadro "chi sei" alto abbastanza da ospitare la bio estesa immersiva
        # della scheda (bio_scheda ~12 righe), non quella breve della carta.
        # Top invariato sotto il filetto (H-mt-19), bottom giu' a H-mt-79 = 60mm;
        # le statistiche e tutto il blocco sotto scendono di 14mm di conseguenza
        # (c'e' spazio morto in fondo alla scheda, ~35mm di margine restano).
        frame_flow(c, mx, H - mt - 79*mm, W - 2*mx, 60*mm, [
            Paragraph('chi sei', SMB),
            Paragraph(hro.get('bio_scheda', hro.get('bio', '')),
                      st('bio', fontName=F['i'], fontSize=9.8, leading=13, alignment=4))])
        y0 = H - mt - 86*mm
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
        # abilità/equipaggiamento larghi solo fino a CUT_X, come le righe scrivibili
        # sotto: oltre CUT_X c'è lo strappo col ritratto, e il testo a piena larghezza
        # ci finiva sopra (illeggibile, es. l'equip di Ottone sotto la mannaia). Frame
        # più alto (64mm) perché a colonna stretta il testo va a capo più volte; il
        # blocco sotto scende di conseguenza (margine in fondo ancora ~25mm).
        frame_flow(c, mx, y2 - 64*mm, CUT_X - mx, 64*mm, [
            Paragraph('abilità unica', SMB), Paragraph(hro['abil'], BODY),
            Spacer(1, 6),
            Paragraph('equipaggiamento iniziale', SMB), Paragraph(hro['equip'], BODY),
            Spacer(1, 4),
            Paragraph('Le armi (+1) aggiungono +1 ai tiri di Attacco.', SUB)])
        y3 = y2 - 72*mm
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(mx, y3, 'migliorie e oggetti di campagna')
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(4):
            c.line(mx, y3 - 8*mm - i*8*mm, CUT_X, y3 - 8*mm - i*8*mm)
        y4 = y3 - 48*mm
        c.setFillColor(TEAL); c.setFont(F['sc'], 9)
        c.drawString(mx, y4, 'cicatrici (alla terza: -1 a una caratteristica)')
        for i in range(3):
            c.line(mx, y4 - 8*mm - i*8*mm, CUT_X, y4 - 8*mm - i*8*mm)
        c.showPage()
        # Ogni eroe e' un foglio fisico a se': senza questo retro, in stampa
        # fronte/retro il verso della scheda di un eroe e' il fronte di quello
        # successivo (con 11 eroi, dispari, il problema tocca ogni foglio tranne
        # l'ultimo) - inservibile per distribuire una scheda a testa. Pergamena
        # bianca, stesso trattamento di pad_to_even_pages ma per OGNI eroe, non
        # solo alla fine del fascicolo.
        parchment_art(c, W, H)
        rule_border(c, W, H)
        c.showPage()
    c.save()
    pad_to_even_pages(out_path)

if __name__ == '__main__':
    schede()
    print('OK deluxe schede')
