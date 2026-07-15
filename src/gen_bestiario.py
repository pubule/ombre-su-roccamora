# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Bestiario (un fascicolo per episodio).

Una pagina per nemico, stesso template delle Schede Personaggio: arte fusa
nello strappo trasparente della pergamena (in basso a destra, la stessa
`background scheda personaggio 2.png`), bio estesa a piena larghezza sopra,
statistiche fisse e FERITE tabellate per numero di eroi in tavola sotto -
la scalatura del Regolamento ("Giocare in un tavolo grande") letta a colpo
d'occhio, senza calcoli a mente. Le carte Creatura non riportano piu' le
statistiche: questo fascicolo e' l'unica fonte al tavolo.

Ogni episodio ripete nel proprio Bestiario anche i nemici comuni (Malavita):
il fascicolo e' autocontenuto, come tutto il materiale per episodio.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, torn_portrait, rule_border, pad_to_even_pages, seal, F,
                          ARTWORKS_DIR, INK, RED, TEAL, PAPER_DK, GOLD, SEPIA)
from gen_cards import HEROES, LUOGHI, MINACCE, NEMICI, TILES
import story
story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4

# Stesso strappo (in basso a destra) e stessa finestra d'arte delle Schede
# Personaggio (gen_deluxe.py): CUT_X e' il bordo sinistro dello strappo,
# tutto cio' che sta sotto la riga del titolo e a destra di CUT_X mostra
# l'arte del nemico attraverso la pergamena - il testo sotto quella riga
# resta a sinistra di CUT_X per non finirci sopra.
TORN_BG = 'background scheda personaggio 2.png'
CUT_X = 105*mm
# finestra d'arte (window di torn_portrait): meta' destra, meta' inferiore.
ART_TOP = 0.51 * H  # sopra questa riga, nessuna arte: testo a piena larghezza


def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


BODY = st('body', alignment=4)
SMB = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)


def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


def stat_row(c, x, y, w, label, value):
    """Riga compatta label:valore (non un riquadro pieno come le Schede
    Personaggio): sotto ART_TOP lo spazio utile e' solo CUT_X-mx di
    larghezza, un riquadro da 18mm come le Schede non ci basterebbe per
    piu' di due elementi affiancati."""
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(0.7)
    c.line(x, y, x + w, y)
    c.setFillColor(TEAL); c.setFont(F['sc'], 8.5)
    c.drawString(x, y + 2*mm, label.lower())
    c.setFillColor(INK); c.setFont(F['b'], 11)
    c.drawRightString(x + w, y + 2*mm, str(value))
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
    # Posizionamento arte: di default l'inquadratura e' quella "cover" gia'
    # tarata per i ritratti eroe (top_margin=0, overscan=0.75, center_x=0.5)
    # - la stessa finestra usata dalle Schede Personaggio. Il Custode e' un
    # ritratto verticale con la figura gia' centrata: overscan piu' ampio
    # (1.1) per farlo risaltare di piu' nello strappo invece di lasciarlo
    # piccolo al centro di una finestra che e' comunque meta' pagina.
    overscan = 1.1 if nemico.get('boss') else 0.75
    torn_portrait(c, W, H, nemico['art'], TORN_BG,
                  window=(0.50, 0.0, 1.03, 0.51), overscan=overscan)
    rule_border(c, W, H)
    mx, mt = 20*mm, 20*mm
    c.setFillColor(RED); c.setFont(F['sc'], 23)
    c.drawString(mx, H - mt - 6*mm, nemico['nome'].lower())
    c.setFillColor(TEAL); c.setFont(F['i'], 13)
    c.drawString(mx, H - mt - 12.5*mm, nemico['tipo'] + '  —  Bestiario della Società del Lume')
    seal(c, W - mx - 8*mm, H - mt - 6*mm, r=9*mm, angle=-16)
    c.setStrokeColor(INK); c.setLineWidth(1)
    c.line(mx, H - mt - 16*mm, W - mx, H - mt - 16*mm)

    # Bio a piena larghezza: tutta l'area sopra ART_TOP e' libera dallo
    # strappo (la finestra d'arte comincia solo sotto meta' pagina), stesso
    # spazio "chi sei" delle Schede Personaggio ma qui puo' arrivare fin
    # quasi al bordo dello strappo per una bio davvero estesa.
    bio_top = H - mt - 19*mm
    bio_bottom = ART_TOP + 6*mm
    frame_flow(c, mx, bio_bottom, W - 2*mx, bio_top - bio_bottom, [
        Paragraph('chi è', SMB),
        Paragraph(nemico.get('bio_bestiario', nemico['note']),
                  st('bio', fontName=F['i'], fontSize=9.8, leading=13, alignment=4))])

    # Sotto la riga di meta' pagina, l'arte occupa la meta' destra: le
    # statistiche restano nella colonna sinistra (mx..CUT_X), come
    # l'abilita'/equipaggiamento delle Schede Personaggio.
    col_w = CUT_X - mx
    y = ART_TOP - 4*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(mx, y, 'statistiche')
    y -= 7*mm
    for lb, v in [('Attacco', '+%d' % nemico['att']), ('Difesa', nemico['dif']),
                  ('Movimento', nemico['mov']), ('Danno', nemico['dan'])]:
        stat_row(c, mx, y, col_w, lb, v)
        y -= 8*mm

    y -= 6*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(mx, y, 'ferite, per eroi in tavola')
    y -= 5.5*mm
    c.setFillColor(SEPIA); c.setFont(F['i'], 7.3)
    for riga in ('Fissate a inizio Spedizione,', 'non ricalcolate dopo.'):
        c.drawString(mx, y, riga)
        y -= 3.3*mm
    y -= 2*mm
    ferite = ferite_per_fascia(nemico)
    for fascia, fer in zip(FASCE, ferite):
        c.setFillColor(RED if fer != nemico['fer'] else INK); c.setFont(F['b'], 11)
        c.drawString(mx, y, str(fer))
        c.setFillColor(TEAL); c.setFont(F['r'], 9)
        c.drawString(mx + 8*mm, y, fascia)
        y -= 6.5*mm

    c.setFillColor(SEPIA); c.setFont(F['i'], 7.5)
    c.drawString(mx, 14*mm, 'Le ferite subite si segnano sul Registro delle Ferite')
    c.drawString(mx, 10.5*mm, '(fascicolo Spedizione), una riga per nemico attivo.')
    c.showPage()


def bestiario(nomi_nemici, out_path, titolo):
    per_nome = {n['nome']: n for n in NEMICI}
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle(titolo)
    for nome in nomi_nemici:
        if nome not in per_nome:
            print(f'AVVISO: {nome} non trovato in NEMICI, saltato.')
            continue
        n = per_nome[nome]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, n['art'])):
            print(f"SALTO {nome}: manca artworks/{n['art']}.")
            continue
        pagina_nemico(c, n)
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
