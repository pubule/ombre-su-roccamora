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

# LE TESSERE VISTE DALL'ALTO. Stessa fonte e stessa licenza, altra cartella e
# altra misura: queste servono alla GENERAZIONE delle tessere (una casella
# stampata e' 616px, non 104), non a una pagina di prova.
#
# I pavimenti sono piastrellabili: una tessera li ripete quattro volte per
# casella. I materiali servono agli arredi, che si disegnano come sagome viste
# da sopra riempite della loro materia — il legno di una cassa, il ferro di una
# stufa, la tela di una branda.
OUT_TESSERE = os.path.join(ROOT, 'webapp', 'texture')
LATO_TESSERE = 1024
TEXTURE_TESSERE = {
    # pavimenti
    'assi': 'wood_floor_deck',             # il molo, i pontili (assi di ponte)
    'lastricato': 'cobblestone_floor_08',  # banchine e cortili
    'pietra': 'medieval_blocks_02',        # cripte, sotterranei
    'mattonelle': 'herringbone_parquet',   # uffici, stanzini (spina di pesce)
    'mattoni': 'worn_brick_floor',         # magazzini, fonderie
    'terra': 'dirt_floor',                 # cantine, terrapieni
    # materiali degli arredi
    'legno': 'wood_table_001',
    'ferro': 'metal_plate',
    'ruggine': 'rusty_metal_02',
    'tela': 'leather_white',
    'muro': 'rough_block_wall',
}
URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{s}/{s}_diff_1k.jpg'


def scarica(ruolo, slug, rifai, out=None, lato=None):
    dst = os.path.join(out or OUT, ruolo + '.jpg')
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
    img.thumbnail((lato or LATO, lato or LATO), Image.LANCZOS)
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

    # e quelle delle tessere
    os.makedirs(OUT_TESSERE, exist_ok=True)
    fatti2 = sum(scarica(r, sl, rifai, OUT_TESSERE, LATO_TESSERE)
                 for r, sl in TEXTURE_TESSERE.items())
    with open(os.path.join(OUT_TESSERE, 'LICENZE.txt'), 'w', encoding='utf-8') as f:
        f.write('Texture delle tessere di Spedizione (pavimenti e materiali).\n')
        f.write('Fonte: Poly Haven — https://polyhaven.com — licenza CC0.\n')
        f.write('Ridimensionate a %dpx da scripts/scarica-texture.py\n' % LATO_TESSERE)
        f.write('Le usa scripts/tiles/generate-tiles.js per pavimento e arredi.\n\n')
        for ruolo, slug in TEXTURE_TESSERE.items():
            f.write(f'{ruolo}.jpg  <-  {slug}  ({URL.format(s=slug)})\n')
    print(f'OK texture tessere ({fatti2} scaricate) in {os.path.relpath(OUT_TESSERE, ROOT)}')


if __name__ == '__main__':
    main()
