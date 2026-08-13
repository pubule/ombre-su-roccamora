# -*- coding: utf-8 -*-
"""Prepara le immagini di partenza del trailer in 16:9.

Poche: le undici figure eroe si caricano INTERE su Seedance, perche' e' il
carrello che sale a mostrare prima le mani e poi il viso — ritagliarle in 16:9
significherebbe scegliere adesso uno dei due, e perdere l'altro
(`video/PROMPT-SEEDANCE.md`).

Restano le tre d'atmosfera. `copertina spedizione.png` e' gia' orizzontale e
si limita a essere riquadrata; le altre due sono 3:4 e vanno tagliate
**ancorando il soggetto**, non il centro dell'immagine: l'Adepto ha il
cappuccio in alto, e un ritaglio centrato glielo taglia via.

`ANCORA` e' la frazione di altezza su cui centrare la banda 16:9 (0.0 = in
cima, 0.5 = al centro). Si tara guardando l'uscita, non a memoria.

  python video/prepara-sorgenti.py
"""
import os
import sys

from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUORI = os.path.join(ROOT, 'video', 'sorgenti')
LARGO, ALTO = 1920, 1080

# (uscita, sorgente, ancora verticale)
SORGENTI = [
    ('01-citta.png', 'copertina spedizione.png', 0.50),
    # il cappuccio sta in alto: centrare la banda a mezza immagine lo decapita
    ('13-adepto.png', 'Adepto Incappucciato.png', 0.34),
    # la chiusa e' la citta' vista dall'alto, che nasce da una mappa vecchia:
    # la citta' sta nei primi due terzi, il compasso in basso. Si tiene la
    # citta' e un'unghia di mappa, non il contrario.
    ('14-citta-alta.png', 'Mappa della città di Roccamora.png', 0.32),
]


def in_sedicinoni(src, ancora):
    """Ritaglia alla proporzione 16:9 tenendo `ancora` come centro verticale,
    poi porta a 1920x1080. Se l'immagine e' gia' piu' larga che 16:9 il taglio
    avviene in orizzontale, e li' il centro va bene: nessuna delle nostre ha
    il soggetto spostato di lato."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if w / h >= LARGO / ALTO:                      # gia' larga: taglio ai lati
        nw = int(h * LARGO / ALTO)
        x = (w - nw) // 2
        box = (x, 0, x + nw, h)
    else:                                          # verticale: taglio una banda
        nh = int(w * ALTO / LARGO)
        y = int(h * ancora - nh / 2)
        y = max(0, min(h - nh, y))                 # senza uscire dall'immagine
        box = (0, y, w, y + nh)
    return im.crop(box).resize((LARGO, ALTO), Image.LANCZOS), box


def main():
    os.makedirs(FUORI, exist_ok=True)
    for nome, sorgente, ancora in SORGENTI:
        src = os.path.join(ROOT, 'artworks', sorgente)
        if not os.path.exists(src):
            print(f'  MANCA  {sorgente}')
            continue
        im, box = in_sedicinoni(src, ancora)
        out = os.path.join(FUORI, nome)
        im.save(out, quality=95)
        print(f'  ok  {nome:16} da «{sorgente}»  ritaglio {box}')
    print(f'\nin {FUORI}. GUARDARLE prima di caricarle: l’ancora si tara a occhio.')


if __name__ == '__main__':
    main()
