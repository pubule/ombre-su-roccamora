# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Mappa di Roccamora (per episodio, incrementale).

Il componente con cui i giocatori DICHIARANO una destinazione (vedi
Regolamento, regola Bussare): una pagina di mappa illustrata della citta'
+ una pagina di legenda in stile stradario d'epoca (nome + indirizzo per
esteso, MAI righe evocative ne' numeri di carta: il ponte voce->carta
vive solo nel fascicolo Luoghi, per chi arbitra).

PER EPISODIO e INCREMENTALE: ogni episodio stampa la SUA mappa, che
contiene tutte le voci delle mappe degli episodi precedenti piu' le sue
nuove - la citta' si allarga a ogni caso. Le voci non si rinominano MAI
tra episodi (i giocatori le ritrovano); un episodio nuovo AGGIUNGE le sue
con un tag nuovo in VOCI_MAPPA e una riga in MAPPE (vedi in fondo).

Le voci fuori episodio sono piste fredde: dichiararle non costa nulla
("bussate, nessuno apre"), ma dichiarare una voce vera impegna la visita
(1 ora) - vedi PROMPT-ESPANSIONE.md, 1-sexies.
"""
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment_art, rule_border, art, _cover_image,
                          scrim_gradient, ARTWORKS_DIR, F, INK, RED, TEAL, SEPIA)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4
MX = 20*mm

# Stesso font-titolo della copertina episodio (gen_cover): Beleren, il font
# dei titoli carte, con fallback IMFellSC se il vendor non c'e'.
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TITLE = F['sc']
try:
    pdfmetrics.registerFont(TTFont('Beleren', os.path.join(ROOT, 'vendor/cardconjurer/fonts/beleren-bsc.ttf')))
    TITLE = 'Beleren'
except Exception:
    pass

MAPPA_ART = 'Mappa della città di Roccamora.png'

# (nome, indirizzo, tag). Tag 'citta' = fondo comune, in ogni mappa fin dal
# Preludio (piste fredde riusabili, alcune gia' citate negli indizi: il
# Vecchio Mercato di Learco, il Vecchio Mulino del barcaiolo ubriaco).
# Ordine qui = ordine di introduzione; la legenda stampa in alfabetico.
VOCI_MAPPA = [
    # fondo comune della citta'
    ('Il Vecchio Mercato', 'piazza delle Erbe', 'citta'),
    ('Il Vecchio Mulino', 'a monte, oltre la chiusa', 'citta'),
    ('I Moli di Levante', 'riva orientale, oltre la dogana nuova', 'citta'),
    ('Le Fonderie', 'vicolo dei Fonditori, capannoni sul retro', 'citta'),
    ('Il Cimitero delle Barche', 'ansa morta del canale grande', 'citta'),
    ('L’Ospedale della Carità', 'largo San Rocco 2', 'citta'),
    ('Il Ponte delle Catene', 'tra il corso e i moli', 'citta'),
    ('La Stazione delle Carrozze', 'porta di terraferma', 'citta'),
    ('Il Teatro Comunale', 'corso della Prefettura 9', 'citta'),
    ('Il Lavatoio Grande', 'canale di mezzo', 'citta'),
    # Preludio
    ('Il Palazzo del Lume', 'riva del Ponte dei Lumi 1', 'preludio'),
    ('La Taverna della Chiatta', 'riva del Ponte dei Lumi 4, oltre il ponte', 'preludio'),
    ('Il Banco dei Pegni di Fossa', 'calle della Fossa 12', 'preludio'),
    ('La Dogana Vecchia', 'canale di ponente, molo estremo', 'preludio'),
    # Episodio 1
    ('Il Campanile di San Teodoro', 'piazza di San Teodoro', 'ep1'),
    ('Vicolo dei Fonditori', 'al civico 7, dietro le fonderie', 'ep1'),
    ('Taverna del Ponte Rotto', 'sotto il Ponte Rotto, riva dei barcaioli', 'ep1'),
    ('La Cattedrale', 'piazza della Cattedrale, sagrestia sul fianco nord', 'ep1'),
    ('Bottega del Liutaio Ferri', 'via degli Archetti 11, quartiere della Cattedrale', 'ep1'),
    ('Il Canale Basso', 'banchina di Dellacqua, moli di ponente', 'ep1'),
    ('L’Archivio Civico', 'palazzo del Comune, scalone secondo', 'ep1'),
    ('La Gendarmeria', 'corso della Prefettura 3', 'ep1'),
]

# (sottocartella pdf/, sottotitolo, tag inclusi). Un episodio nuovo aggiunge
# una riga con i tag di TUTTI i precedenti + il suo.
MAPPE = [
    ('Preludio', 'preludio — la città che conoscete', ('citta', 'preludio')),
    ('Episodio 1', 'episodio 1 — la città che conoscete', ('citta', 'preludio', 'ep1')),
]

# Tipografico (provata la grafia manoscritta La Belle Aurore su tutta la
# riga: resa uniforme, poco leggibile come elenco - scelta finale: nome in
# grassetto, indirizzo in corsivo NON grassetto).
VOCE_ST = ParagraphStyle('voce', fontName=F['r'], fontSize=10.5, leading=15, textColor=INK)


def pagina_mappa(c, sottotitolo):
    art_path = os.path.join(ARTWORKS_DIR, MAPPA_ART)
    if os.path.exists(art_path):
        _cover_image(c, art(MAPPA_ART), 0, 0, W, H)
        # L'arte e' notturna e scura: velo sfumato dal bordo alto (gradiente
        # immagine vero, vedi scrim_gradient - le fasce con setFillAlpha
        # lasciavano righe orizzontali) e titolo bianco/oro, o non si legge.
        scrim_gradient(c, 0, H - 42*mm, W, 42*mm, 0.6, knee=1.6, opaque_top=True)
        # Sottotitolo: stesso colore del titolo e in grassetto (richiesta esplicita).
        titolo_col, sotto_col = colors.HexColor('#f2e9d8'), colors.HexColor('#f2e9d8')
    else:
        parchment_art(c, W, H)
        c.setFillColor(SEPIA); c.setFont(F['i'], 10)
        c.drawCentredString(W/2, H/2, '(arte della mappa non ancora generata: vedi PROMPT-MIDJOURNEY.md)')
        titolo_col, sotto_col = RED, TEAL
    rule_border(c, W, H)
    titolo = 'Mappa di Roccamora' if TITLE == 'Beleren' else 'mappa di roccamora'
    c.setFillColor(titolo_col); c.setFont(TITLE, 24)
    c.drawString(MX, H - 24*mm, titolo)
    c.setFillColor(sotto_col); c.setFont(F['b'], 12)
    c.drawString(MX, H - 31*mm, sottotitolo)
    c.showPage()


def pagina_stradario(c, voci):
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(MX, H - 22*mm, 'stradario — dove chiedere in città')
    c.setFillColor(INK); c.setFont(F['i'], 9.5)
    c.drawString(MX, H - 29*mm, 'Dichiarate una destinazione: se la serata non ha nulla per voi lì, lo saprete')
    c.drawString(MX, H - 34*mm, 'senza spendere l’ora. Se invece qualcosa c’è, la visita parte — e l’ora si spende.')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, H - 38*mm, W - MX, H - 38*mm)
    y = H - 48*mm
    # Alfabetico ignorando l'articolo iniziale (come uno stradario vero:
    # "Il Lavatoio" sta sotto la L, non sotto la I).
    def chiave(v):
        return re.sub(r"^(il|lo|la|i|gli|le|l’|l')\s*", '', v[0], flags=re.IGNORECASE).lower()
    for nome, indirizzo in sorted(voci, key=chiave):
        p = Paragraph(f'<b>{nome}</b> — <i>{indirizzo}</i>', VOCE_ST)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 3.2*mm
    c.showPage()


def mappe():
    for sottocartella, sottotitolo, tags in MAPPE:
        out_dir = os.path.join(OUT_DIR, sottocartella)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, 'Mappa.pdf')
        c = canvas.Canvas(out_path, pagesize=A4)
        c.setTitle(f'Ombre su Roccamora - Mappa di Roccamora ({sottocartella})')
        pagina_mappa(c, sottotitolo)
        voci = [(n, i) for n, i, t in VOCI_MAPPA if t in tags]
        pagina_stradario(c, voci)
        c.save()
        print(f'ok -> {out_path} ({len(voci)} voci)')


if __name__ == '__main__':
    mappe()
    print('OK mappa')
