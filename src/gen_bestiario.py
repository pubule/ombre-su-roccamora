# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Bestiario (un fascicolo per episodio).

Una pagina per nemico, template affine alla Scheda Personaggio: ritratto,
bio, statistiche fisse (Attacco/Difesa/Movimento/Danno) e FERITE tabellate
per numero di eroi in tavola - la scalatura del Regolamento ("Giocare in un
tavolo grande") letta a colpo d'occhio, senza calcoli a mente. Le carte
Creatura (cards-data.js) non riportano piu' le statistiche: questo
fascicolo e' l'unica fonte al tavolo.

Ogni episodio ripete nel proprio Bestiario anche i nemici comuni (Malavita):
il fascicolo e' autocontenuto, come tutto il materiale per episodio.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph, Frame
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, rule_border, pad_to_even_pages, parchment_art, seal, F,
                          ARTWORKS_DIR, INK, RED, TEAL, PAPER_DK, GOLD, SEPIA)
from gen_cards import HEROES, LUOGHI, MINACCE, NEMICI, TILES
import story
story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4


def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


BODY = st('body', alignment=4)
SMB = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)


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


# Scalatura Ferite per numero di eroi in tavola - STESSI numeri del
# Regolamento ("Giocare in 2, in 4-5, o in un tavolo grande") e di
# curva-G_tattica + CUSTODE_TENSIONE_EXTRA in scripts/simulate_playtest.py,
# validati sul motore a griglia tattica. Se quelle regole cambiano, questa
# tabella va aggiornata insieme (e viceversa).
FASCE = ['2–5 eroi', '6 eroi', '7 eroi', '8–10 eroi']


def ferite_per_fascia(nemico):
    base = nemico['fer']
    return [base, base + 2, base, base + (1 if nemico.get('boss') else 0)]


def pagina_nemico(c, nemico):
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx, mt = 20*mm, 20*mm
    c.setFillColor(RED); c.setFont(F['sc'], 23)
    c.drawString(mx, H - mt - 6*mm, nemico['nome'].lower())
    c.setFillColor(TEAL); c.setFont(F['i'], 13)
    c.drawString(mx, H - mt - 12.5*mm, nemico['tipo'] + '  —  Bestiario della Società del Lume')
    seal(c, W - mx - 8*mm, H - mt - 6*mm, r=9*mm, angle=-16)
    c.setStrokeColor(INK); c.setLineWidth(1)
    c.line(mx, H - mt - 16*mm, W - mx, H - mt - 16*mm)

    # Ritratto: riquadro bordato a destra (le art nemico sono le stesse
    # delle carte Creatura, quadrate, nessuna trasparenza a strappo come i
    # ritratti eroe - un box in cornice e' il rendering onesto).
    art_path = os.path.join(ARTWORKS_DIR, nemico['art'])
    box_w, box_h = 72*mm, 72*mm
    bx, by = W - mx - box_w, H - mt - 20*mm - box_h
    if os.path.exists(art_path):
        img = ImageReader(art_path)
        iw, ih = img.getSize()
        scala = max(box_w / iw, box_h / ih)
        c.saveState()
        p = c.beginPath()
        p.rect(bx, by, box_w, box_h)
        c.clipPath(p, stroke=0, fill=0)
        c.drawImage(img, bx + (box_w - iw*scala)/2, by + (box_h - ih*scala)/2,
                    iw*scala, ih*scala)
        c.restoreState()
        c.setStrokeColor(GOLD); c.setLineWidth(1.4)
        c.rect(bx, by, box_w, box_h)
        c.setStrokeColor(INK); c.setLineWidth(0.6)
        c.rect(bx + 1.2*mm, by + 1.2*mm, box_w - 2.4*mm, box_h - 2.4*mm)
    else:
        print(f"AVVISO: manca artworks/{nemico['art']} - pagina senza ritratto.")

    # Bio a sinistra del ritratto (il campo `note` arricchito da story.py
    # contiene flavor E tratti meccanici del nemico: qui c'e' spazio per
    # leggerli per intero, sulle carte non piu').
    testo_w = bx - mx - 8*mm
    frame_flow(c, mx, by, testo_w, box_h, [
        Paragraph('chi è', SMB),
        Paragraph(nemico['note'], st('bio', fontName=F['i'], fontSize=9.8, leading=13, alignment=4))])

    # Statistiche fisse (non cambiano col numero di eroi).
    y0 = by - 26*mm
    bw = (W - 2*mx - 3*10*mm) / 4.0
    for i, (lb, v) in enumerate([('ATTACCO', '+%d' % nemico['att']), ('DIFESA', nemico['dif']),
                                 ('MOVIMENTO', nemico['mov']), ('DANNO', nemico['dan'])]):
        stat_box(c, mx + i*(bw + 10*mm), y0, bw, lb, v)

    # Ferite per numero di eroi in tavola: la riga da leggere e' UNA, quella
    # del proprio tavolo, fissata a inizio spedizione (vedi Regolamento).
    y1 = y0 - 14*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(mx, y1, 'ferite — in base a quanti eroi sono in tavola')
    c.setFillColor(SEPIA); c.setFont(F['i'], 8.5)
    c.drawString(mx, y1 - 4.5*mm, 'Si fissa all’inizio della Spedizione e non cambia più, '
                                  'anche se un eroe cade a terra.')
    y2 = y1 - 26*mm
    col_w = (W - 2*mx) / len(FASCE)
    ferite = ferite_per_fascia(nemico)
    for i, (fascia, fer) in enumerate(zip(FASCE, ferite)):
        x = mx + i*col_w
        c.setStrokeColor(GOLD); c.setLineWidth(1); c.setFillColor(PAPER_DK)
        c.rect(x, y2, col_w, 18*mm, fill=1)
        c.setStrokeColor(INK); c.setLineWidth(0.6)
        c.rect(x + 1.2*mm, y2 + 1.2*mm, col_w - 2.4*mm, 18*mm - 2.4*mm)
        c.setFillColor(TEAL); c.setFont(F['sc'], 8.5)
        c.drawCentredString(x + col_w/2, y2 + 13*mm, fascia)
        c.setFillColor(RED if fer != nemico['fer'] else INK); c.setFont(F['b'], 19)
        c.drawCentredString(x + col_w/2, y2 + 4*mm, str(fer))

    # Richiamo al Registro delle Ferite (dove si segnano davvero).
    c.setFillColor(SEPIA); c.setFont(F['i'], 8.5)
    c.drawString(mx, y2 - 7*mm, 'Le ferite subite si segnano sul Registro delle Ferite '
                                '(in fondo al fascicolo Spedizione), una riga per nemico attivo.')
    c.showPage()


def bestiario(nomi_nemici, out_path, titolo):
    per_nome = {n['nome']: n for n in NEMICI}
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle(titolo)
    for nome in nomi_nemici:
        pagina_nemico(c, per_nome[nome])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    # Episodio 1: tutti i nemici, compresi i comuni (Malavita) - ogni
    # Bestiario di episodio e' autocontenuto.
    bestiario([n['nome'] for n in NEMICI],
              os.path.join(OUT_DIR, 'Episodio 1', 'Bestiario.pdf'),
              'Ombre su Roccamora - Bestiario Episodio 1')
    # Preludio: solo la Malavita in campo (2 Sgherri + 1 Sicario, vedi
    # gen_preludio) - prima le statistiche vivevano sulle carte Creatura
    # dell'Episodio 1, ora il Preludio ha il proprio Bestiario e resta
    # giocabile da solo.
    bestiario(['LO SGHERRO', 'IL SICARIO'],
              os.path.join(OUT_DIR, 'Preludio', 'Bestiario.pdf'),
              'Ombre su Roccamora - Bestiario del Preludio')
    print('OK bestiario')
