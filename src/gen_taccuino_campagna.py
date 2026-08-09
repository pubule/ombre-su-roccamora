# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Taccuino di Campagna (Comune/pdf/).

Il registro che sopravvive alla singola serata. Tutto il resto del materiale e'
per-episodio (si usa e si archivia); qui vanno le due cose che la campagna
chiede di ricordare per VENTI sessioni:

  - i FRAMMENTI conservati (uno per episodio, n. 1-20). L'Ep. 20 si vince col
    CONTROCANTO, e quante righe si cantano per round dipende da quanti Frammenti
    avete conservato. Senza questo foglio l'arbitro deve ricontarli aprendo venti
    fascicoli «Soluzione» diversi.
  - i BIVI presi (Ep. 1-19; l'Ep. 20 non ne ha, e' la fine). L'Ep. 19 chiede di
    ricontarli: il suo Taccuino ha gia' le righe per scriverli, ma non c'e' mai
    stato un posto dove leggerli tutti insieme.

Fondo PERGAMENA, non il nero del Tabellone: questo foglio si compila a matita,
sessione dopo sessione. Il Tabellone e' un overlay per segnalini e resta scuro.

Genera: Comune/pdf/Ombre-su-Roccamora-08-Taccuino-di-Campagna.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border,
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Comune', 'pdf')
os.makedirs(OUT_DIR, exist_ok=True)
register_fonts()
W, H = A4

# I titoli degli episodi: servono a riconoscere la riga a colpo d'occhio dopo
# settimane. L'Ep. 20 chiude la campagna e non ha Bivio.
EPISODI = [
    (1, 'Il Coro Sommerso'), (2, 'La voce del bronzo'), (3, 'Le voci del pozzo'),
    (4, 'Il teatro dell’eco'), (5, 'L’organo di ossa'), (6, 'Il Terzo Movimento'),
    (7, 'Il quartiere sordo'), (8, 'L’oro vecchio'), (9, 'Il processo'),
    (10, 'La casa che ricorda'), (11, 'Il censimento delle campane'),
    (12, 'La seconda copia'), (13, 'Carta di pregio'), (14, 'Il rivale'),
    (15, 'Lo smascheramento'), (16, 'Un caso qualunque'), (17, 'Lo scisma'),
    (18, 'La mano sola'), (19, 'La Società braccata'), (20, 'Il Quarto Movimento'),
]


def taccuino_campagna():
    out_path = os.path.join(OUT_DIR, 'Ombre-su-Roccamora-08-Taccuino-di-Campagna.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Taccuino di Campagna')
    parchment_art(c, W, H)
    rule_border(c, W, H)

    c.setFillColor(RED); c.setFont(F['sc'], 18)
    c.drawString(16*mm, H - 21*mm, 'taccuino di campagna')
    wave(c, W - 74*mm, H - 19*mm, 40*mm, OGOLD)
    seal(c, W - 26*mm, H - 22*mm, r=11*mm, angle=-8)
    c.setFillColor(TEAL); c.setFont(F['i'], 9)
    c.drawString(16*mm, H - 27.5*mm,
                 'Stampatelo UNA VOLTA e tenetelo con voi per tutta la campagna: è l’unico foglio che non si archivia a fine serata.')

    # intestazione della tabella
    x_ep, x_fr, x_bv = 16*mm, 92*mm, 108*mm
    y = H - 38*mm
    c.setFillColor(TEAL); c.setFont(F['sc'], 9)
    c.drawString(x_ep, y, 'episodio')
    # due caselle: conservato, e — se la vittoria fu parziale — incrinato. Un
    # Frammento incrinato si legge come gli altri ma non conta nel finale: e'
    # l'unico modo in cui il conto puo' scendere, e senza di esso ogni tavolo
    # arriverebbe all'ultimo episodio con lo stesso numero.
    c.drawCentredString(x_fr + 3*mm, y, 'framm.')
    c.drawCentredString(x_fr + 12*mm, y, 'incrin.')
    c.drawString(x_bv, y, 'bivio scelto — e a chi è costato')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.9)
    c.line(16*mm, y - 2.5*mm, W - 16*mm, y - 2.5*mm)

    riga = 10.0*mm   # 20 righe + riquadro finale + piede: sotto i 10.0 si toccano
    y -= 9*mm
    for n, titolo in EPISODI:
        c.setFillColor(INK); c.setFont(F['b'], 9)
        c.drawString(x_ep, y, f'{n}.')
        c.setFillColor(SEPIA); c.setFont(F['r'], 8.5)
        c.drawString(x_ep + 7*mm, y, titolo)
        # casella del Frammento: si barra quando lo si conserva
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(0.9)
        c.circle(x_fr + 3*mm, y + 1.2*mm, 3.1*mm, fill=1)
        # casella «incrinato»: si barra se l'episodio si e' chiuso con vittoria
        # parziale — il Frammento resta, ma non conta per il controcanto finale
        c.circle(x_fr + 12*mm, y + 1.2*mm, 2.4*mm, fill=1)
        # riga per il Bivio (l'Ep. 20 non ne ha)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        if n == 20:
            c.setFillColor(SEPIA); c.setFont(F['i'], 7.5)
            c.drawString(x_bv, y, '— nessun Bivio: è la fine.')
        else:
            c.line(x_bv, y - 1.5*mm, W - 16*mm, y - 1.5*mm)
        y -= riga

    # riquadro di chiusura: il conto che serve al finale
    y -= 2*mm
    c.setStrokeColor(SEPIA); c.setLineWidth(0.9)
    c.rect(16*mm, y - 26*mm, W - 32*mm, 26*mm, fill=0)
    c.setFillColor(RED); c.setFont(F['sc'], 10)
    c.drawString(20*mm, y - 7*mm, 'il conto che vi servirà')
    c.setFillColor(INK); c.setFont(F['r'], 8.5)
    c.drawString(20*mm, y - 13.5*mm,
                 'CONSERVATI: ......... / 19      INCRINATI: ......... (vittorie parziali)      CHE CONTANO: ......... ')
    c.drawString(20*mm, y - 18.5*mm,
                 '→ all’Episodio 20 il Controcanto si canta più in fretta quante più righe avete, e gli incrinati non contano:')
    c.drawString(20*mm, y - 23.5*mm,
                 'è lì che questo foglio si ripaga. I BIVI serviranno all’Episodio 19: rileggeteli tutti insieme prima.')

    c.setFillColor(TEAL); c.setFont(F['i'], 8)
    c.drawCentredString(W/2, 13*mm,
                        'ombre su roccamora · società del lume — il registro che sopravvive alla serata')
    c.showPage()

    # --- pagina 2: le cose che gli episodi mandano a segnare QUI ------------
    # Nove episodi dicono «segnatelo sul Taccuino di Campagna» — gli incroci
    # bancati verso l'assemblea, gli alleati che possono schierarsi nell'ultima
    # notte — e il foglio non aveva una casella per nessuna delle due. Questa
    # pagina esisteva gia' ed era BIANCA: era solo il padding fronte/retro.
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 18)
    c.drawString(16*mm, H - 21*mm, 'il conto che si porta all’assemblea')
    wave(c, W - 74*mm, H - 19*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['i'], 9)
    c.drawString(16*mm, H - 27.5*mm,
                 'Da riempire strada facendo: gli episodi vi diranno quando. Serve tutto nelle ultime tre serate.')

    def riquadro(y, titolo, sottotitolo, voci, alt):
        c.setStrokeColor(SEPIA); c.setLineWidth(0.9)
        c.rect(16*mm, y - alt, W - 32*mm, alt, fill=0)
        c.setFillColor(RED); c.setFont(F['sc'], 11)
        c.drawString(20*mm, y - 8*mm, titolo)
        c.setFillColor(SEPIA); c.setFont(F['i'], 8)
        c.drawString(20*mm, y - 13.5*mm, sottotitolo)
        yy = y - 22*mm
        for testo in voci:
            c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(0.9)
            c.circle(23*mm, yy + 1.1*mm, 2.6*mm, fill=1)
            c.setFillColor(INK); c.setFont(F['r'], 9)
            c.drawString(29*mm, yy, testo)
            yy -= 8.5*mm
        return yy

    riquadro(H - 36*mm, 'incroci di campagna',
             'Ogni incrocio bancato vale nella deduzione dell’ultima assemblea. Massimo 7.',
             ['rilettura di una vecchia lettera d’incarico  (massimo 3)',
              'rilettura di una vecchia lettera d’incarico',
              'rilettura di una vecchia lettera d’incarico',
              'la matrice delle doppie letture',
              'un verbale sigillato  ......................................................',
              'un verbale sigillato  ......................................................',
              'un verbale sigillato  ......................................................'],
             86*mm)

    riquadro(H - 132*mm, 'il conto dei bivi — chi può schierarsi l’ultima notte',
             'Spuntate solo chi il vostro conto vi lascia. Ne servono tre.',
             ['il professor Braga  —  se avete dichiarato pubblicamente il dubbio',
              'il decano Ferrante  —  se lo avete riportato a casa lucido',
              'il cronista Ranuzzi  —  se avete reso pubblica la prova',
              'i vecchi testimoni del Coro  —  se restituiste le voci del Borgo',
              'un debito antico  —  se consegnaste il vedovo'],
             68*mm)

    y = H - 208*mm
    c.setStrokeColor(SEPIA); c.setLineWidth(0.9)
    c.rect(16*mm, y - 34*mm, W - 32*mm, 34*mm, fill=0)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(20*mm, y - 8*mm, 'note che valgono più tardi')
    c.setFillColor(SEPIA); c.setFont(F['i'], 8)
    c.drawString(20*mm, y - 13.5*mm,
                 'Quando un episodio dice «segnatelo sul Taccuino» e non è né un Frammento né un Bivio, va qui.')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    for i in range(3):
        c.line(20*mm, y - 20*mm - i*6*mm, W - 20*mm, y - 20*mm - i*6*mm)

    c.setFillColor(TEAL); c.setFont(F['i'], 8)
    c.drawCentredString(W/2, 13*mm,
                        'ombre su roccamora · società del lume — il registro che sopravvive alla serata')
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    taccuino_campagna()
    print('OK taccuino di campagna')
