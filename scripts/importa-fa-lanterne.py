# -*- coding: utf-8 -*-
"""Porta nel mockup «lanterne» i pezzi di Forgotten Adventures che gli servono.

Il mockup (webapp/public/mockups/tessere-alt/1-lanterne.html) compone le stanze
dell'Episodio 1 in DOM, pezzo per pezzo: pavimento, muri modulari, porte, arredi
e il minuto di contorno (ragnatele, ossa, candele nere, pozze). Le materie prime
stanno gia' in casa:

  webapp/vtt/            pavimenti e arredi scelti da scripts/importa-fa.py
  risorse-vtt/           la libreria grande (non in git, scaricata a mano)

Qui si copiano quelli e si convertono in PNG i pochi .webp in piu'. Una-tantum,
come ritaglia-personaggi.py: serve al mockup, non alla build.

LICENZA: CC BY-NC-SA 4.0, come tutto quel che viene da Forgotten Adventures —
il credito sta nella pagina del mockup.

Uso: python scripts/importa-fa-lanterne.py
"""
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'webapp', 'public', 'mockups', 'tessere-alt', 'fa')
VTT = os.path.join(ROOT, 'webapp', 'vtt')
FA = os.path.join(ROOT, 'risorse-vtt', 'FA_Assets_Webp')
KIT = os.path.join(ROOT, 'risorse-vtt', 'Modular_Dungeons_Tile_Set', 'Mapmaking', 'Tile_Sets', 'Modular_Dungeons')
CS = '!Core_Settlements'

# nome nel mockup  <-  sorgente
PEZZI = {
    # pavimenti (gia' scelti per le tessere: stessa regola «il nome della stanza»)
    'pav-assi.png': (VTT, 'pavimenti/assi.png'),
    'pav-tavolato.png': (VTT, 'pavimenti/tavolato.png'),
    'pav-navata.png': (VTT, 'pavimenti/navata.png'),
    'pav-mattonelle.png': (VTT, 'pavimenti/mattonelle.png'),
    'pav-pietra.png': (VTT, 'pavimenti/pietra.png'),
    'pav-pietra-2.png': (VTT, 'pavimenti/pietra-2.png'),
    'pav-acqua.png': (VTT, 'pavimenti/acqua.png'),
    # muri modulari: un tratto e' 1x2, il muro nella meta' alta e l'ombra sotto
    'muro-a.png': (KIT, 'Dungeon_Straight_1x2_A.png'),
    'muro-b.png': (KIT, 'Dungeon_Straight_1x2_B.png'),
    'pilastro.png': (KIT, 'Dungeon_Pillar_1x1_A.png'),
    'scale.png': (KIT, 'Dungeon_Stairs_Thick_2x2.png'),
    # porte e grata
    'porta.png': (FA, f'{CS}/Structures/Building/Doors/Door_Wood_Dark_A_1x1.webp'),
    'porta-2.png': (FA, f'{CS}/Structures/Building/Doors/Door_Wood_Dark_B_1x1.webp'),
    'grata.png': (FA, f'{CS}/Structures/Building/Doors/Large_Doors/Portcullis_Metal_Rusty_A_2x1.webp'),
    # le luci: sono quelle che il buio del mockup lascia vedere
    'torcia.png': (FA, f'{CS}/Lightsources/Torches_and_Sconces/Lit/Wall_Torch_01_A_Lit_1x1.webp'),
    'candele-nere.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A1_1x1.webp'),
    'candele-nere-2.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A2_1x1.webp'),
    'candele-nere-3.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A3_1x1.webp'),
    # il contorno: nessuno blocca il passo, tutti raccontano la stanza
    'ragnatela.png': (FA, '!Effects/Webs/Cobwebs/Cobweb_Black_A1_1x1.webp'),
    'ragnatela-2.png': (FA, '!Effects/Webs/Cobwebs/Cobweb_Black_A2_1x1.webp'),
    'ossa.png': (FA, 'Horror/!Wilderness/Decor/Bones/Humanoid_Skeletons/Bones_White_Arranged_A1_2x2.webp'),
    'sangue.png': (FA, 'Horror/!Wilderness/Gore/Blood/Blood_Puddle_A1_1x1.webp'),
    'pozza.png': (FA, 'Woodlands/!Wilderness/Decor/Puddles/Puddle_Water_Blue_A11_1x1.webp'),
    'catene.png': (FA, f'{CS}/Decor/Restraints_and_Torture/Restraints_and_Chains/Chain_Metal_Rusty_Wall_Manacles_A_1x1.webp'),
    'barile.png': (FA, f'{CS}/Decor/Storage/Barrels/Barrel_Wood_Dark_A_1x1.webp'),
    'sacco.png': (FA, f'{CS}/Decor/Storage/Sacks/Cloth/Sack_Cloth_Black_A_1x1.webp'),
    'corda.png': (FA, f'{CS}/Clutter/Adventuring_Gear/Ropes/Rope_Ashen_A1_1x1.webp'),
    'teschio.png': (FA, f'{CS}/Clutter/Magic_Items/Skulls/Skull_Decor_Candle_1x1.webp'),
    # per la prova della guida di scenografia (docs/scenografia.md) su Ep.1 e
    # Ep.11: le campane, i tetti, lo studio del custode, l'abbandono
    'pav-tetti.png': (VTT, 'pavimenti/tetti.png'),
    'campana-grande.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Large_A1_2x2.webp'),
    'campana-grande-2.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Large_B1_2x2.webp'),
    'campana.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_A1_1x1.webp'),
    'campana-rotta.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Broken_A1_1x1.webp'),
    'detriti-bronzo.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Debris_A1_1x1.webp'),
    'cero.png': (FA, f'{CS}/Lightsources/Candles/Candle_Wax/Candle_White_Wax_A1_1x1.webp'),
    'candela-nera.png': (FA, f'{CS}/Lightsources/Candles/Candle_Wax/Candle_Black_Wax_A1_1x1.webp'),
    'statua-incappucciata.png': (FA, f'{CS}/Structures/Statues/Statue_Marble_Black_Hooded_Figure_Lantern_2x2.webp'),
    'statua-morte.png': (FA, f'{CS}/Structures/Statues/Statue_Marble_Black_Death_2x2.webp'),
    'ali-di-pietra.png': (FA, f'{CS}/Structures/Statues/Add_Ons/Statue_Marble_Black_Bat_Wings_Folded_2x1.webp'),
    'nido.png': (FA, 'Woodlands/!Wilderness/Decor/Nests/Nest_Medium_A1_1x1.webp'),
    'calcinacci.png': (FA, f'{CS}/Structures/Rubble/Rubble_Pieces/Stone/Rubble_Stone_Earthy_A10_1x1.webp'),
    'calcinacci-2.png': (FA, f'{CS}/Structures/Rubble/Rubble_Pieces/Stone/Rubble_Stone_Earthy_A11_1x1.webp'),
    'fogli.png': (FA, f'{CS}/Clutter/Paper_Goods/Paper_Sheets_and_Scraps/Blank_Paper_White_A1_1x1.webp'),
    'spartiti.png': (FA, f'{CS}/Decor/Musical_Instruments/Sheet_Stands/Music_Sheets_White_A_1x1.webp'),
    'libri.png': (FA, f'{CS}/Clutter/Paper_Goods/Books_and_Tomes/Book_Piles/Book_Leather_Line_A1_1x1.webp'),
    'tazza.png': (FA, f'{CS}/Clutter/Kitchenware/Mugs/Ashen/Mug_Side_Wood_Ashen_A_1x1.webp'),
    'sgabello-rovesciato.png': (FA, f'{CS}/Furniture/Seating/Stools/Fallen/Stool_Fallen_Wood_Ashen_A1_1x1.webp'),
    'comignolo.png': (FA, f'{CS}/Structures/Building/Roofs/Chimneys/Chimney_Stone_Earthy_A_1x1.webp'),
    'comignolo-2.png': (FA, f'{CS}/Structures/Building/Roofs/Chimneys/Chimney_Stone_Earthy_C_1x1.webp'),
    'botola.png': (FA, f'{CS}/Structures/Building/Doors/Trapdoors/Trapdoor_Wood_Ashen_A1_Closed_Rusty_1x1.webp'),
}
# gli arredi dei dati: tutte e tre le varianti
for k in ['casse', 'candele', 'molo', 'scala', 'altare', 'cella', 'scrivania', 'branda']:
    for v in ['', '-2', '-3']:
        PEZZI[f'{k}{v}.png'] = (VTT, f'arredi/{k}{v}.png')


def main():
    if not os.path.isdir(FA):
        sys.exit('manca risorse-vtt/FA_Assets_Webp — vedi risorse-vtt/LEGGIMI.md')
    os.makedirs(OUT, exist_ok=True)
    mancano = []
    for dst, (base, rel) in PEZZI.items():
        src = os.path.join(base, rel)
        if not os.path.exists(src):
            mancano.append(rel); continue
        out = os.path.join(OUT, dst)
        if src.endswith('.png'):
            shutil.copyfile(src, out)
        else:
            img = Image.open(src).convert('RGBA')
            img.thumbnail((600, 600), Image.LANCZOS)   # 200px a casella bastano per lo schermo
            img.save(out, optimize=True)
    print(f'OK {len(PEZZI) - len(mancano)} pezzi in {os.path.relpath(OUT, ROOT)}')
    for m in mancano:
        print('  ! manca', m)


if __name__ == '__main__':
    main()
