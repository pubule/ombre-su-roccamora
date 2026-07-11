# -*- coding: utf-8 -*-
"""Ombre su Roccamora - versione GOTICA di carte e tessere (03 e 04).

Le 20 carte Minacce, i 4 Nemici e le 6 tessere T1-T6 sono ora generati come
immagini a se' stanti (cardconjurer + script di board: cards/Episodio 1/Minacce/,
cards/Episodio 1/Nemici/, board/Episodio 1/) invece che come pagine di questo
PDF, quindi qui non vengono piu' disegnati. spedizione() stampa solo le note per tessera che non
stanno sull'immagine della tessera (testo ambientazione, bonus Cercare) e i
segnalini da ritagliare.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border, seal, wave,
                          art, _cover_image, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
from ornaments import GOLD_L, BONE
from gen_cards import LUOGHI, MINACCE, NEMICI, TILES, HEROES
import story
MINACCE = story.apply(LUOGHI, TILES, NEMICI, HEROES, MINACCE)
LETTERA = story.LETTERA2

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf', 'Episodio 1')
os.makedirs(OUT_DIR, exist_ok=True)
register_fonts()
W, H = A4

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

BODY = st('body', alignment=4)
SMB  = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)
MTXT = st('mtxt', fontSize=8.4, leading=10.4, textColor=BONE, alignment=1)

def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

# ------------------------------------------------------------------ INDAGINE
def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Indagine')
    # lettera d'incarico (pergamena, invariata nello spirito)
    parchment_art(c, W, H)
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
    c.drawCentredString(W/2, 22*mm, 'Prendete le 8 carte Luogo, ordinatele per numero (guardate il titolo)')
    c.drawCentredString(W/2, 15*mm, 'e disponetele coperte in fila, da sinistra a destra: la posizione vi dice il numero.')
    c.showPage()
    # taccuino (come deluxe)
    parchment_art(c, W, H)
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
    pad_to_even_pages(out_path)

# ---------------------------------------------------------------- SPEDIZIONE
def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Spedizione')
    # copertina/nota: Minacce, Nemici e tessere T1-T6 sono immagini a se' stanti
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 1 \u2014 spedizione')
    wave(c, W/2 - 20*mm, H - 39*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 95*mm, W - 56*mm, 42*mm, [
        Paragraph('Le 20 carte Minacce e le 4 schede Nemici sono stampate come carte a parte '
                  '(cartelle <b>cards/Episodio 1/Minacce/</b> e <b>cards/Episodio 1/Nemici/</b>). '
                  'Le 6 tessere T1-T6 del magazzino sono in <b>board/Episodio 1/</b>, gi\u00e0 con '
                  'griglia, arredi e porte segnate. Qui sotto restano solo le note per tessera che '
                  'non stanno sull\u2019immagine.',
                  BODY)])
    c.showPage()
    # note per tessera (testo ambientazione + bonus Cercare): la tessera fisica e' in board/Episodio 1/
    y = H - 25*mm
    for T in TILES:
        c.setFillColor(RED); c.setFont(F['sc'], 13)
        c.drawString(20*mm, y, '%s \u00b7 %s' % (T['id'], T['nome'].lower()))
        flow = [Paragraph(T['testo'], st('tile', fontSize=9, leading=12, alignment=4))]
        if T.get('cerca'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph('<b>Cercare (ACUME Media):</b> ' + T['cerca'],
                                  st('tc', fontSize=9, leading=12, textColor=TEAL)))
        fh = 30*mm if T.get('cerca') else 22*mm
        frame_flow(c, 20*mm, y - 8*mm - fh, W - 40*mm, fh, flow)
        y -= fh + 16*mm
        if y < 40*mm and T is not TILES[-1]:
            c.showPage(); y = H - 25*mm
    c.showPage()
    token_sheet(c)
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)

MINI = 50*mm  # tessera 200mm / griglia 4x4: minimo richiesto per muovere comodo i token
MINI_GAP = 3*mm
MINI_COLS = 3  # 5 colonne da 50mm non ci starebbero piu' su A4 (250mm > ~190mm utili)

def mini_token(c, x, y, art_name, num=None, top_margin=0*mm, overscan=0.18):
    """Ritratto ritagliato a quadrato (stessa tecnica cover-fit di
    deluxe_style._cover_image usata per lo strappo delle schede eroe, qui senza
    strappo: il quadrato stesso e' il bordo, clippato perche' l'arte non sbordi).
    `num`, se dato, stampa un numero in un tondino nell'angolo: quando piu'
    copie dello stesso nemico sono in campo assieme, e' l'unico modo di sapere
    quale riga del Registro delle Ferite appartiene a quale miniatura (le copie
    riusano la stessa identica arte, altrimenti indistinguibili)."""
    c.saveState()
    p = c.beginPath(); p.rect(x, y, MINI, MINI); c.clipPath(p, stroke=0, fill=0)
    _cover_image(c, art(art_name), x, y, MINI, MINI, top_margin=top_margin, overscan=overscan)
    c.restoreState()
    c.setStrokeColor(OGOLD); c.setLineWidth(1.1)
    c.rect(x, y, MINI, MINI)
    c.setStrokeColor(INK); c.setLineWidth(0.5)
    c.rect(x + 0.8*mm, y + 0.8*mm, MINI - 1.6*mm, MINI - 1.6*mm)
    if num is not None:
        bx, by, br = x + MINI - 4.2*mm, y + 4.2*mm, 3.6*mm
        c.setFillColor(colors.HexColor('#1c1610')); c.setStrokeColor(OGOLD); c.setLineWidth(0.9)
        c.circle(bx, by, br, fill=1)
        c.setFillColor(GOLD_L); c.setFont(F['b'], 8.5)
        c.drawCentredString(bx, by - 3*mm/1.9, str(num))

# Inquadratura per ritratto: alcuni soggetti hanno bisogno di piu' zoom (busto
# stretto) o meno (creatura gia' centrata) per riempire un quadrato senza
# tagliare male testa/dettagli - stesso principio di top_margin/overscan gia'
# tarato a mano per gli eroi nello strappo delle schede (gen_deluxe.py), qui
# rifatto per un'inquadratura quadrata invece che verticale.
MINI_CROP = {
    'Elena.png': dict(overscan=0.35),
    'Attilio.png': dict(overscan=0.35),
    'Sibilla.png': dict(overscan=0.35),
    'Nino.png': dict(overscan=0.35),
    'Ottone.png': dict(overscan=0.35),
    'Carla.png': dict(overscan=0.35),
}

def token_sheet(c):
    """Miniature quadrate (taglia di una casella tessera) al posto dei gettoni
    tondi: ritratto di eroe/nemico ritagliato a quadrato, stesso soggetto delle
    carte. Le copie multiple di uno stesso nemico (Adepti, Cani, Fonditori,
    Sgherri, Sicari) portano un numero nell'angolo, cosi' si possono abbinare
    alle righe del Registro delle Ferite; gli eroi e le copie uniche (Custode,
    Ruggero, Canto) non ne hanno bisogno.
    """
    GROUPS = [
        ('EROI', [('Elena.png', 1), ('Attilio.png', 1), ('Sibilla.png', 1),
                  ('Nino.png', 1), ('Ottone.png', 1), ('Carla.png', 1)]),
        ('ADEPTI (x10)', [('Adepto Incappucciato.png', 10)]),
        ('CANI (x3) \u00b7 FONDITORI (x3)', [('Cani dei Moli.png', 3), ('Il Fonditore.png', 3)]),
        ('SGHERRI (x4) \u00b7 SICARI (x2)', [('Lo Sgherro.png', 4), ('Il Sicario.png', 2)]),
        ('CUSTODE · RUGGERO', [('Il Custode della Cera (boss).png', 1), ('Ruggero.png', 1)]),
        # I 3 segnalini Canto seguono lo stesso crescendo narrativo delle carte
        # Minaccia-timer (Il Canto Sale -> Il Coro Risponde -> Il Canto Cresce),
        # arte gia' dedicata: niente piu' cerchio astratto col simbolo dagger.
        ('CANTO', [('Il canto sale.png', 1), ('Il coro risponde.png', 1), ('Il canto cresce.png', 1)]),
    ]
    mx = (W - MINI_COLS*MINI - (MINI_COLS - 1)*MINI_GAP) / 2
    y = [0]

    def new_page():
        parchment_art(c, W, H)
        rule_border(c, W, H)
        c.setFillColor(RED); c.setFont(F['sc'], 16)
        c.drawString(16*mm, H - 22*mm, 'miniature \u2014 ritagliare')
        y[0] = H - 34*mm

    def ensure(h):
        if y[0] - h < 22*mm:
            c.showPage()
            new_page()

    new_page()
    for label, items in GROUPS:
        # numero solo se ci sono piu' copie dello stesso nemico (n>1): con una
        # copia sola non c'e' ambiguita' da risolvere, il numero sarebbe rumore.
        cells = [(a, (i + 1) if n > 1 else None) for a, n in items for i in range(n)]
        rows = -(-len(cells) // MINI_COLS)
        ensure(6*mm + rows*(MINI + MINI_GAP))
        c.setFillColor(TEAL); c.setFont(F['b'], 9)
        c.drawString(mx, y[0], label)
        y[0] -= 6*mm
        for i, (a, num) in enumerate(cells):
            col, row = i % MINI_COLS, i // MINI_COLS
            x = mx + col*(MINI + MINI_GAP)
            yy = y[0] - MINI - row*(MINI + MINI_GAP)
            mini_token(c, x, yy, a, num=num, **MINI_CROP.get(a, {}))
        y[0] -= rows*(MINI + MINI_GAP) + 4*mm

    c.setFillColor(INK); c.setFont(F['i'], 9)
    c.drawString(16*mm, 16*mm, 'Consiglio: incollate il foglio su cartoncino prima di ritagliare. '
                                'Per le Ferite dei nemici vedi il Registro nella pagina seguente.')
    c.showPage()

# Foglio riusabile per tracciare le Ferite dei nemici attivi: righe generiche
# (nessuna etichetta di tipo, un nemico qualsiasi ci sta) invece di un gettone
# per nemico sul tabellone - stesso principio del master in D&D/HeroQuest che
# tiene le ferite dei mostri su un proprio foglio, non su un componente fisico
# per mostro. Tenuto da chi pesca il mazzo Minaccia quel round (ruolo gia'
# informale, non se ne inventa uno nuovo): e' pubblico, non un segreto come il
# fascicolo Luoghi.
def registro_ferite(c):
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'registro delle ferite')
    frame_flow(c, 20*mm, H - 56*mm, W - 40*mm, 26*mm, [
        Paragraph('Chi pesca il mazzo Minaccia in un round tiene anche questo foglio. Ogni riga è un '
                  'nemico attivo sulla tessera: scrivete il tipo e, se ce n’è più di una copia in '
                  'campo, il numero stampato sull’angolo della sua miniatura (es. «Adepto 3»), poi '
                  'riempite una goccia per ogni colpo subito (le Ferite di ogni nemico sono sulla sua '
                  'carta). Quando le gocce coprono tutte le Ferite, il nemico cade: cancellate la riga '
                  'e riusatela per il prossimo.', BODY)])
    # 10 colonne: le Ferite max oggi sono 3 (vedi NEMICI in gen_cards.py), ma un
    # boss futuro puo' arrivare piu' in alto (vedi PROMPT-ESPANSIONE.md, scala di
    # difficolta') - meglio un registro che regge senza dover essere rifatto.
    N_PIP = 10
    gx0, dot_gap = 82*mm, 10.6*mm
    c.setFillColor(TEAL); c.setFont(F['b'], 8)
    c.drawString(20*mm, H - 70*mm, 'nemico')
    for k in range(N_PIP):
        c.setFont(F['b'], 6.5)
        c.drawCentredString(gx0 + k*dot_gap, H - 70*mm, str(k + 1))
    y = H - 78*mm
    while y > 25*mm:
        c.setStrokeColor(SEPIA); c.setLineWidth(0.6)
        c.line(20*mm, y, gx0 - 6*mm, y)
        for k in range(N_PIP):
            c.setStrokeColor(INK); c.setLineWidth(0.8)
            c.circle(gx0 + k*dot_gap, y + 2*mm, 2.6*mm)
        y -= 15*mm
    c.showPage()

indagine()
spedizione()
print('OK gothic')
