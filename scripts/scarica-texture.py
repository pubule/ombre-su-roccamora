# -*- coding: utf-8 -*-
"""Texture CC0 per il dungeon isometrico del mockup.

L'arte delle tessere e' dipinta con una prospettiva gia' dentro: proiettarla su
un piano inclinato la sdraia. Il dungeon isometrico si costruisce invece con
texture piastrellabili (pavimento, muro, legno, pietra) su cui alzare muri e
volumi veri.

Una-tantum, NON in build-all.sh: serve solo a
webapp/public/mockups/plancia/spedizione-iso.html.

Fonte: Poly Haven (polyhaven.com) — tutte le texture sono CC0.
Uso: python scripts/scarica-texture.py [--rifai]
"""
import io
import os
import sys
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'webapp', 'public', 'mockups', 'texture')
LATO = 512      # basta: a schermo una piastrella e' una casella da 104px

# ruolo -> slug Poly Haven. Lo schema dell'URL e' verificato su tutti e quattro.
TEXTURE = {
    'pavimento': 'cobblestone_floor_08',
    'muro': 'castle_brick_02_red',
    'legno': 'dark_wooden_planks',
    'pietra': 'rough_block_wall',
}
URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{s}/{s}_diff_1k.jpg'


def scarica(ruolo, slug, rifai):
    dst = os.path.join(OUT, ruolo + '.jpg')
    if os.path.exists(dst) and not rifai:
        return False
    url = URL.format(s=slug)
    # Un buco silenzioso qui diventa un pavimento nero nel mockup e mezz'ora
    # persa a cercarlo nel CSS: se non arriva, si ferma e lo dice.
    with urllib.request.urlopen(url, timeout=60) as r:
        if r.status != 200:
            sys.exit(f'{ruolo}: {url} ha risposto {r.status}')
        crudo = r.read()
    img = Image.open(io.BytesIO(crudo)).convert('RGB')
    img.thumbnail((LATO, LATO), Image.LANCZOS)
    img.save(dst, quality=80, optimize=True)
    print(f'  {ruolo} <- {slug}  {img.width}x{img.height}  {os.path.getsize(dst) // 1024} KB')
    return True


def main():
    rifai = '--rifai' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    fatti = sum(scarica(r, s, rifai) for r, s in TEXTURE.items())
    with open(os.path.join(OUT, 'LICENZE.txt'), 'w', encoding='utf-8') as f:
        f.write('Texture del dungeon isometrico (mockup).\n')
        f.write('Fonte: Poly Haven — https://polyhaven.com — licenza CC0.\n')
        f.write('Ridimensionate a %dpx e ricompresse da scripts/scarica-texture.py\n\n' % LATO)
        for ruolo, slug in TEXTURE.items():
            f.write(f'{ruolo}.jpg  <-  {slug}  ({URL.format(s=slug)})\n')
    print(f'OK texture ({fatti} scaricate) in {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
