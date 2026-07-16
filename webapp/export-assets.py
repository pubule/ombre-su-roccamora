# -*- coding: utf-8 -*-
"""Copie WEB delle immagini di gioco (mai toccare gli originali).

Carte jpg (Comune/Preludio/Episodio N -> cards/), tessere png (board/),
ritratti/arte utile (artworks/) ridimensionati a ~720px lato lungo in
webapp/assets/, stessa struttura di percorso. Idempotente: salta i file
gia' aggiornati (mtime sorgente <= destinazione).
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'webapp', 'assets')
MAX_PX = 720
MAX_PX_TESSERE = 1100   # le tessere si zoomano: un filo piu' grandi

SORGENTI = [
    ('Comune/cards', MAX_PX),
    ('Preludio/cards', MAX_PX),
    ('Episodio 1/cards', MAX_PX),
    ('Episodio 2/cards', MAX_PX),
    ('Episodio 1/board', MAX_PX_TESSERE),
    ('Preludio/reperti', MAX_PX_TESSERE),
    ('Episodio 1/reperti', MAX_PX_TESSERE),
]

# arte singola utile alla shell (ritratti gia' coperti dalle carte Eroi)
ARTE_EXTRA = ['copertina spedizione.png', 'Mappa della città di Roccamora.png',
              'Sigillo.png', 'background manuale.png']


def converti(src, dst, max_px):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return False
    img = Image.open(src)
    if max(img.size) > max_px:
        k = max_px / max(img.size)
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    if img.mode in ('RGBA', 'LA', 'P') and dst.lower().endswith('.png'):
        img.save(dst, optimize=True)
    else:
        img.convert('RGB').save(os.path.splitext(dst)[0] + '.jpg', quality=82)
    return True


def main():
    fatti = 0
    for rel, mx in SORGENTI:
        base = os.path.join(ROOT, rel)
        if not os.path.isdir(base):
            continue
        for dirpath, _, files in os.walk(base):
            for f in files:
                if not f.lower().endswith(('.jpg', '.png')):
                    continue
                src = os.path.join(dirpath, f)
                dst = os.path.join(OUT, os.path.relpath(src, ROOT))
                if converti(src, dst, mx):
                    fatti += 1
    for f in ARTE_EXTRA:
        src = os.path.join(ROOT, 'artworks', f)
        if os.path.exists(src):
            if converti(src, os.path.join(OUT, 'artworks', f), MAX_PX_TESSERE):
                fatti += 1
    print(f'OK assets webapp ({fatti} convertiti/aggiornati)')


if __name__ == '__main__':
    main()
