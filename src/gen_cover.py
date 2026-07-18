# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Copertina episodio (<Episodio N>/pdf/Copertina.pdf).

Poster a piena pagina: l'arte della mappa di campagna (artworks) a tutto
fondo, con nome del gioco in alto e titolo dell'episodio in basso. Il testo
non e' "incollato" sopra: sta in una zona d'ombra sfumata che fa parte della
scena (una velatura scura radiale/graduale, non un riquadro netto) e le
lettere sono incise (ombra interna scura + un filo di controluce caldo), come
scolpite nella pergamena invece che stampate sopra.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from deluxe_style import register_fonts, art, seal, pad_to_even_pages, scrim_gradient, F

OUT_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
register_fonts()

# Stesso font dei titoli sulle carte (cardconjurer, Beleren Bold Small Caps).
TITLE = 'IMFellSC'  # fallback se il font carte non c'e'
try:
    pdfmetrics.registerFont(TTFont('Beleren', os.path.join(ROOT, 'vendor/cardconjurer/fonts/beleren-bsc.ttf')))
    TITLE = 'Beleren'
except Exception:
    pass

W, H = A4

MAP_ART = 'Mappa di campagna di Roccamora.jpg'
GAME_NAME = 'Ombre su Roccamora'
GAME_SUB = 'Società del Lume · Roccamora, 1889'
WHITE = colors.HexColor('#ffffff')
WAVE = colors.HexColor('#e8e8e8')

EPISODI = {
    0: 'La Prova del Lume',  # il Preludio (tutorial), cartella Preludio/pdf/
    1: 'Il caso del campanaro scomparso',
    2: 'La voce del bronzo',
    3: 'Le voci del pozzo',
    4: 'Il teatro dell’eco',
    5: 'L’organo di ossa',
    6: 'Il Terzo Movimento',
    7: 'Il quartiere sordo',
    8: 'L’oro vecchio',
    9: 'Il processo',
    10: 'La casa che ricorda',
    11: 'Il censimento delle campane',
    12: 'La seconda copia',
}
# arte dedicata per episodio (default: la mappa di campagna, MAP_ART)
COVER_ART = {2: 'copertina episodio 2.png', 3: 'copertina episodio 3.png', 4: 'copertina episodio 4.png', 5: 'copertina episodio 5.png', 6: 'copertina episodio 6.png', 7: 'copertina episodio 7.png', 8: 'copertina episodio 8.png', 9: 'copertina episodio 9.png', 10: 'copertina episodio 10.png', 11: 'copertina episodio 11.png', 12: 'copertina episodio 12.png'}
ROMAN = {1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'}

def etichetta(num):
    return 'Preludio' if num == 0 else 'Episodio ' + ROMAN.get(num, str(num))

def cartella(num):
    return 'Preludio' if num == 0 else f'Episodio {num}'


def cover_fit(c, name):
    """Arte a tutto fondo, ritagliata per riempire la pagina (cover) senza deformare."""
    img = art(name)
    iw, ih = img.getSize()
    scale = max(W / iw, H / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(img, (W - dw) / 2, (H - dh) / 2, width=dw, height=dh, mask=None)


def scrim(c, y_dark, y_clear, dark_alpha):
    """Velatura scura sfumata: alpha dark_alpha al bordo y_dark, trasparente a
    y_clear. Prima era una pila di fasce con setFillAlpha (reportlab.
    linearGradient ignora l'alpha degli stop), ma le fasce lasciano righe
    orizzontali visibili nei viewer per quante siano: ora e' un gradiente
    immagine vero (scrim_gradient in deluxe_style), liscio a ogni zoom.
    Curva a ginocchio (esponente 2.4): forte solo vicino al bordo, poi cala
    in fretta, cosi' l'arte resta visibile al centro."""
    y0, y1 = min(y_dark, y_clear), max(y_dark, y_clear)
    scrim_gradient(c, 0, y0, W, y1 - y0, dark_alpha, knee=2.4,
                   opaque_top=(y_dark > y_clear))


def engraved(c, cx, y, text, font, size, fill, tracking=0):
    """Testo centrato inciso: ombra scura in basso-destra (incavo), un filo di
    controluce caldo in alto-sinistra (bordo rialzato che prende luce), poi il
    colore pieno. Con letter-spacing manuale se tracking != 0."""
    def draw(dx, dy, col, alpha=1.0):
        c.saveState()
        c.setFillColor(col); c.setFillAlpha(alpha)
        if tracking:
            total = sum(c.stringWidth(ch, font, size) + tracking for ch in text) - tracking
            x = cx - total / 2
            for ch in text:
                c.setFont(font, size)
                c.drawString(x + dx, y + dy, ch)
                x += c.stringWidth(ch, font, size) + tracking
        else:
            c.setFont(font, size)
            c.drawCentredString(cx + dx, y + dy, text)
        c.restoreState()
    draw(0.45, -0.45, colors.black, 0.85)          # incavo (ombra)
    draw(-0.35, 0.35, colors.HexColor('#fff2c8'), 0.30)  # controluce caldo
    draw(0, 0, fill)                                 # colore pieno


def divider(c, cx, y, w, col, lw=1.1):
    """Filetto ornamentale: due tratti che rastremano verso il centro con un
    rombo (losanga) centrale e due piccoli rombi terminali - stesso linguaggio
    delle gemme a losanga sulle cornici delle carte, al posto delle onde."""
    c.saveState()
    c.setStrokeColor(col); c.setFillColor(col)
    c.setLineWidth(lw); c.setLineCap(1)
    half = w / 2.0
    gap = 3.2*mm            # spazio attorno al rombo centrale
    c.line(cx - half, y, cx - gap, y)
    c.line(cx + gap, y, cx + half, y)

    def lozenge(x, s):
        c.saveState(); c.translate(x, y); c.rotate(45)
        c.rect(-s, -s, 2*s, 2*s, fill=1, stroke=0)
        c.restoreState()
    lozenge(cx, 1.5*mm)     # rombo centrale
    lozenge(cx - half, 0.7*mm)  # terminali
    lozenge(cx + half, 0.7*mm)
    c.restoreState()


def copertina(c, num, titolo):
    cover_name = COVER_ART.get(num, MAP_ART)
    if not os.path.exists(os.path.join(ROOT, 'artworks', cover_name)):
        print(f'  AVVISO: manca artworks/{cover_name} - uso la mappa di campagna '
              '(rigenerare quando arriva)')
        cover_name = MAP_ART
    cover_fit(c, cover_name)
    scrim(c, H, H - 70*mm, 0.4)            # velo leggero dal bordo alto: l'arte resta ben visibile
    scrim(c, 0, 96*mm, 0.36)              # velo leggero dal bordo basso

    # --- alto: nome del gioco (bianco, font titoli carte) ---
    ty = H - 34*mm
    engraved(c, W/2, ty, GAME_NAME, TITLE, 33, WHITE, tracking=1.5)
    divider(c, W/2, ty - 8*mm, 74*mm, WAVE, 1.2)
    # Stesso trattamento inciso del titolo (ombra + controluce): il testo
    # piatto spariva dove l'arte e' chiara (la guglia della cattedrale).
    engraved(c, W/2, ty - 20*mm, GAME_SUB, F['b'], 12.5, WHITE, tracking=0.6)

    # --- basso: episodio ---
    engraved(c, W/2, 74*mm, etichetta(num), TITLE, 15, WHITE, tracking=2.5)
    # titolo, ridotto se troppo largo per stare su una riga con margini
    size = 29
    while c.stringWidth(titolo, TITLE, size) > W - 44*mm and size > 16:
        size -= 0.5
    engraved(c, W/2, 56*mm, titolo, TITLE, size, WHITE, tracking=0.8)
    divider(c, W/2, 48*mm, 58*mm, WAVE, 1.0)
    seal(c, W/2, 30*mm, r=9*mm, angle=-10)

    # sottile filetto bianco a filo pagina, molto discreto
    c.saveState()
    c.setStrokeColor(WHITE); c.setLineWidth(0.8); c.setStrokeAlpha(0.4)
    c.rect(7*mm, 7*mm, W - 14*mm, H - 14*mm)
    c.restoreState()
    c.showPage()


def build(num):
    titolo = EPISODI[num]
    out_dir = os.path.join(OUT_ROOT, cartella(num), 'pdf')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'Copertina.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle(f'Ombre su Roccamora - {etichetta(num)} - {titolo}')
    copertina(c, num, titolo)
    c.save()
    pad_to_even_pages(out_path)


if __name__ == '__main__':
    for n in EPISODI:
        build(n)
    print('OK cover')
