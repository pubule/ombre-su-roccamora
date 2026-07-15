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


def stat_box(c, x, y, w, label, value, value_color=None):
    """Stesso riquadro delle statistiche nella Scheda Personaggio
    (gen_deluxe.py): bordo oro, fondo pergamena scura, etichetta piccola in
    alto, valore grande al centro. C'e' spazio per riusarlo anche qui,
    invece della semplice riga label:valore delle prime bozze."""
    c.saveState()
    c.setStrokeColor(GOLD); c.setLineWidth(1); c.setFillColor(PAPER_DK)
    c.rect(x, y, w, 18*mm, fill=1)
    c.setStrokeColor(INK); c.setLineWidth(0.6)
    c.rect(x + 1.2*mm, y + 1.2*mm, w - 2.4*mm, 18*mm - 2.4*mm)
    c.setFillColor(TEAL); c.setFont(F['sc'], 8)
    c.drawCentredString(x + w/2, y + 13.2*mm, label.lower())
    c.setFillColor(value_color or INK); c.setFont(F['b'], 19)
    c.drawCentredString(x + w/2, y + 4*mm, str(value))
    c.restoreState()


def griglia_stat_box(c, x, y, w, voci, colonne=2, gap=3*mm):
    """Dispone `voci` (label, value[, value_color]) su una griglia a
    `colonne` colonne di stat_box, larghi quanto ci sta in `w`. Ritorna la
    coordinata y sotto l'ultima riga disegnata."""
    box_w = (w - (colonne - 1) * gap) / colonne
    for i, voce in enumerate(voci):
        label, value = voce[0], voce[1]
        value_color = voce[2] if len(voce) > 2 else None
        col, riga = i % colonne, i // colonne
        bx = x + col * (box_w + gap)
        by = y - riga * (18*mm + gap) - 18*mm
        stat_box(c, bx, by, box_w, label, value, value_color)
    righe = -(-len(voci) // colonne)  # ceil
    return y - righe * (18*mm + gap)


# Inquadratura per nemico: default overscan=0.75/center_x=0.5 (stessa
# tarata dei ritratti eroe), override dove il soggetto non cade a centro
# finestra di default - stesso principio di LUOGHI_CROP in gen_narrator.py.
INQUADRATURA = {
    # Il Custode e' un ritratto verticale gia' centrato: overscan piu' ampio
    # per farlo risaltare di piu' invece di lasciarlo piccolo a meta' pagina.
    'IL CUSTODE DELLA CERA': dict(overscan=1.1),
    # Testa e ceffo ringhiante stanno sopra al centro dell'arte (soggetto
    # verticale con molto molo/edificio intorno): overscan piu' alto stringe
    # sul muso invece di lasciare il palazzo alle spalle a rubare la scena,
    # center_x spostato verso destra segue il ceffo (piu' a destra del
    # centro immagine) invece delle zampe anteriori a sinistra.
    'CANE DEI MOLI': dict(overscan=0.95, center_x=0.58),
}


def inquadratura(nemico):
    base = dict(overscan=0.75, center_x=0.5, top_margin=0)
    base.update(INQUADRATURA.get(nemico['nome'], {}))
    return base


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
    torn_portrait(c, W, H, nemico['art'], TORN_BG,
                  window=(0.50, 0.0, 1.03, 0.51), **inquadratura(nemico))
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
    # l'abilita'/equipaggiamento delle Schede Personaggio. Stessi riquadri
    # (stat_box) delle statistiche eroe: c'e' spazio per farlo, ed e' lo
    # stesso linguaggio visivo su entrambi i fascicoli.
    col_w = CUT_X - mx
    y = ART_TOP - 4*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(mx, y, 'statistiche')
    y -= 6*mm
    y = griglia_stat_box(c, mx, y, col_w, [
        ('Attacco', '+%d' % nemico['att']), ('Difesa', nemico['dif']),
        ('Movimento', nemico['mov']), ('Danno', nemico['dan'])])

    y -= 10*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(mx, y, 'ferite, per eroi in tavola')
    y -= 4.5*mm
    c.setFillColor(SEPIA); c.setFont(F['i'], 7.3)
    c.drawString(mx, y, 'Fissate a inizio Spedizione, non ricalcolate dopo.')
    y -= 6*mm
    ferite = ferite_per_fascia(nemico)
    voci_ferite = [(fascia, fer, RED if fer != nemico['fer'] else INK)
                   for fascia, fer in zip(FASCE, ferite)]
    y = griglia_stat_box(c, mx, y, col_w, voci_ferite)

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
