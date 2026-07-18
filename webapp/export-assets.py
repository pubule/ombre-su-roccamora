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
    ('Episodio 3/cards', MAX_PX),
    ('Episodio 4/cards', MAX_PX),
    ('Episodio 5/cards', MAX_PX),
    ('Episodio 6/cards', MAX_PX),
    ('Episodio 7/cards', MAX_PX),
    ('Episodio 1/board', MAX_PX_TESSERE),
    ('Preludio/reperti', MAX_PX_TESSERE),
    ('Episodio 1/reperti', MAX_PX_TESSERE),
    ('Episodio 2/reperti', MAX_PX_TESSERE),
    ('Episodio 3/reperti', MAX_PX_TESSERE),
    ('Episodio 4/reperti', MAX_PX_TESSERE),
    ('Episodio 5/reperti', MAX_PX_TESSERE),
    ('Episodio 6/reperti', MAX_PX_TESSERE),
    ('Episodio 7/reperti', MAX_PX_TESSERE),
]

# tutta artworks/ (arti luogo per i banner, ritratti, sfondi): ~60 file,
# ridotti una volta e riusati ovunque dalla webapp
ARTE_TUTTA = True


def converti(src, dst, max_px):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return False
    img = Image.open(src)
    if max(img.size) > max_px:
        k = max_px / max(img.size)
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    # estensione SEMPRE preservata: il client costruisce gli URL dai dati
    # (art: 'xxx.png') e deve trovarli identici - un rename silenzioso a
    # .jpg li romperebbe in modo imprevedibile.
    if dst.lower().endswith('.png'):
        (img if img.mode in ('RGBA', 'LA', 'P') else img.convert('RGB')).save(dst, optimize=True)
    else:
        img.convert('RGB').save(dst, quality=82)
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
    art_dir = os.path.join(ROOT, 'artworks')
    for f in os.listdir(art_dir):
        if not f.lower().endswith(('.jpg', '.png')):
            continue
        if converti(os.path.join(art_dir, f), os.path.join(OUT, 'artworks', f), 900):
            fatti += 1
    print(f'OK assets webapp ({fatti} convertiti/aggiornati)')


if __name__ == '__main__':
    main()
