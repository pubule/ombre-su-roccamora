# -*- coding: utf-8 -*-
"""Porta in produzione i pezzi di Forgotten Adventures per la plancia digitale.

La plancia (js/plancia/, e il mockup che l'ha originata,
webapp/public/mockups/tessere-alt/1-lanterne.html) compone le stanze pezzo per
pezzo: pavimento, muri modulari, porte, arredi e il decoro (ragnatele, ossa,
candele nere, pozze, e tutto quel che dice docs/scenografia.md). Le materie
prime stanno gia' in casa:

  webapp/vtt/            pavimenti e arredi scelti da scripts/importa-fa.py
  risorse-vtt/           la libreria grande (non in git, scaricata a mano)

Qui si copiano muri, porte e decori (i pavimenti e gli arredi li porta gia'
importa-fa.py) e si convertono in PNG i .webp. webapp/export-assets.py porta
poi tutto in webapp/assets/vtt/ per la produzione.

LICENZA: CC BY-NC-SA 4.0, come tutto quel che viene da Forgotten Adventures —
il credito sta in webapp/vtt/LICENZE.txt.

Uso: python scripts/importa-fa-lanterne.py
     python scripts/importa-fa-lanterne.py --provino <cartella-in-FA_Assets_Webp>
"""
import glob
import json
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'webapp', 'vtt')
FA = os.path.join(ROOT, 'risorse-vtt', 'FA_Assets_Webp')
KIT = os.path.join(ROOT, 'risorse-vtt', 'Modular_Dungeons_Tile_Set', 'Mapmaking', 'Tile_Sets', 'Modular_Dungeons')
CS = '!Core_Settlements'

# chiave in PEZZI = percorso relativo dentro webapp/vtt/ (muri/, porte/, decori/).
# I pavimenti e gli arredi restano compito di importa-fa.py: non si ripetono qui.
#
# I decori portano anche un dizionario {ambienti, lato, luce, sopra}: e' quello
# che finisce in decori/CATALOGO.json, la lista della spesa di docs/scenografia.md
# per comporre una stanza. 'lato' e' la misura tipica in caselle, 'luce' None o
# il tipo di luce che fa ('torcia'/'cera'), 'sopra' se puo' stare su un arredo-
# superficie (principio 7 della guida).
PEZZI = {
    # muri modulari: un tratto e' 1x2, il muro nella meta' alta e l'ombra sotto
    'muri/muro-a.png': (KIT, 'Dungeon_Straight_1x2_A.png'),
    'muri/muro-b.png': (KIT, 'Dungeon_Straight_1x2_B.png'),
    'muri/pilastro.png': (KIT, 'Dungeon_Pillar_1x1_A.png'),
    'muri/scale.png': (KIT, 'Dungeon_Stairs_Thick_2x2.png'),
    # porte e grata
    'porte/porta.png': (FA, f'{CS}/Structures/Building/Doors/Door_Wood_Dark_A_1x1.webp'),
    'porte/porta-2.png': (FA, f'{CS}/Structures/Building/Doors/Door_Wood_Dark_B_1x1.webp'),
    'porte/grata.png': (FA, f'{CS}/Structures/Building/Doors/Large_Doors/Portcullis_Metal_Rusty_A_2x1.webp'),
    # le luci: sono quelle che il buio della plancia lascia vedere
    'decori/torcia.png': (FA, f'{CS}/Lightsources/Torches_and_Sconces/Lit/Wall_Torch_01_A_Lit_1x1.webp',
                          {'ambienti': ['gotico', 'ovunque'], 'lato': 0.8, 'luce': 'torcia', 'sopra': False}),
    'decori/candele-nere.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A1_1x1.webp',
                                {'ambienti': ['gotico', 'chiese', 'cripte'], 'lato': 0.8, 'luce': 'cera', 'sopra': True}),
    'decori/candele-nere-2.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A2_1x1.webp',
                                  {'ambienti': ['gotico', 'chiese', 'cripte'], 'lato': 0.8, 'luce': 'cera', 'sopra': True}),
    'decori/candele-nere-3.png': (FA, f'{CS}/Lightsources/Candles/Arranged_Candles/Candles_Black_Arranged_A3_1x1.webp',
                                  {'ambienti': ['gotico', 'chiese', 'cripte'], 'lato': 0.8, 'luce': 'cera', 'sopra': True}),
    # il contorno: nessuno blocca il passo, tutti raccontano la stanza
    'decori/ragnatela.png': (FA, '!Effects/Webs/Cobwebs/Cobweb_Black_A1_1x1.webp',
                             {'ambienti': ['ovunque', 'gotico', 'cripte', 'fogne'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/ragnatela-2.png': (FA, '!Effects/Webs/Cobwebs/Cobweb_Black_A2_1x1.webp',
                               {'ambienti': ['ovunque', 'gotico', 'cripte', 'fogne'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/ossa.png': (FA, 'Horror/!Wilderness/Decor/Bones/Humanoid_Skeletons/Bones_White_Arranged_A1_2x2.webp',
                        {'ambienti': ['cripte'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/sangue.png': (FA, 'Horror/!Wilderness/Gore/Blood/Blood_Puddle_A1_1x1.webp',
                          {'ambienti': ['gotico'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/pozza.png': (FA, 'Woodlands/!Wilderness/Decor/Puddles/Puddle_Water_Blue_A11_1x1.webp',
                         {'ambienti': ['acqua', 'fogne'], 'lato': 1.1, 'luce': None, 'sopra': False}),
    'decori/catene.png': (FA, f'{CS}/Decor/Restraints_and_Torture/Restraints_and_Chains/Chain_Metal_Rusty_Wall_Manacles_A_1x1.webp',
                          {'ambienti': ['gotico', 'cripte', 'fogne'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/barile.png': (FA, f'{CS}/Decor/Storage/Barrels/Barrel_Wood_Dark_A_1x1.webp',
                          {'ambienti': ['acqua', 'magazzini'], 'lato': 0.75, 'luce': None, 'sopra': False}),
    'decori/sacco.png': (FA, f'{CS}/Decor/Storage/Sacks/Cloth/Sack_Cloth_Black_A_1x1.webp',
                         {'ambienti': ['magazzini'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/corda.png': (FA, f'{CS}/Clutter/Adventuring_Gear/Ropes/Rope_Ashen_A1_1x1.webp',
                         {'ambienti': ['acqua', 'magazzini'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/teschio.png': (FA, f'{CS}/Clutter/Magic_Items/Skulls/Skull_Decor_Candle_1x1.webp',
                           {'ambienti': ['gotico', 'cripte'], 'lato': 0.6, 'luce': 'cera', 'sopra': True}),
    # per la prova della guida di scenografia (docs/scenografia.md) su Ep.1 e
    # Ep.11: le campane, i tetti, lo studio del custode, l'abbandono
    'decori/campana-grande.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Large_A1_2x2.webp',
                                  {'ambienti': ['chiese', 'tetti'], 'lato': 1.8, 'luce': None, 'sopra': False}),
    'decori/campana-grande-2.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Large_B1_2x2.webp',
                                    {'ambienti': ['chiese', 'tetti'], 'lato': 1.8, 'luce': None, 'sopra': False}),
    'decori/campana.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_A1_1x1.webp',
                           {'ambienti': ['chiese', 'tetti'], 'lato': 0.9, 'luce': None, 'sopra': False}),
    'decori/campana-rotta.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Broken_A1_1x1.webp',
                                 {'ambienti': ['chiese', 'tetti'], 'lato': 0.9, 'luce': None, 'sopra': False}),
    'decori/detriti-bronzo.png': (FA, f'{CS}/Structures/Mechanical_Parts/Bells/Bell_Metal_Gray_Debris_A1_1x1.webp',
                                  {'ambienti': ['chiese', 'tetti'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/cero.png': (FA, f'{CS}/Lightsources/Candles/Candle_Wax/Candle_White_Wax_A1_1x1.webp',
                        {'ambienti': ['gotico', 'chiese', 'ovunque'], 'lato': 0.4, 'luce': 'cera', 'sopra': True}),
    'decori/candela-nera.png': (FA, f'{CS}/Lightsources/Candles/Candle_Wax/Candle_Black_Wax_A1_1x1.webp',
                                {'ambienti': ['gotico', 'chiese', 'ovunque'], 'lato': 0.4, 'luce': 'cera', 'sopra': True}),
    'decori/statua-incappucciata.png': (FA, f'{CS}/Structures/Statues/Statue_Marble_Black_Hooded_Figure_Lantern_2x2.webp',
                                        {'ambienti': ['gotico', 'tetti'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    'decori/statua-morte.png': (FA, f'{CS}/Structures/Statues/Statue_Marble_Black_Death_2x2.webp',
                                {'ambienti': ['gotico', 'tetti'], 'lato': 1.8, 'luce': None, 'sopra': False}),
    'decori/ali-di-pietra.png': (FA, f'{CS}/Structures/Statues/Add_Ons/Statue_Marble_Black_Bat_Wings_Folded_2x1.webp',
                                 {'ambienti': ['gotico', 'tetti'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/nido.png': (FA, 'Woodlands/!Wilderness/Decor/Nests/Nest_Medium_A1_1x1.webp',
                        {'ambienti': ['tetti', 'giardini'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/calcinacci.png': (FA, f'{CS}/Structures/Rubble/Rubble_Pieces/Stone/Rubble_Stone_Earthy_A10_1x1.webp',
                              {'ambienti': ['ovunque', 'tetti'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/calcinacci-2.png': (FA, f'{CS}/Structures/Rubble/Rubble_Pieces/Stone/Rubble_Stone_Earthy_A11_1x1.webp',
                                {'ambienti': ['ovunque', 'tetti'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/fogli.png': (FA, f'{CS}/Clutter/Paper_Goods/Paper_Sheets_and_Scraps/Blank_Paper_White_A1_1x1.webp',
                         {'ambienti': ['archivi'], 'lato': 0.3, 'luce': None, 'sopra': True}),
    'decori/spartiti.png': (FA, f'{CS}/Decor/Musical_Instruments/Sheet_Stands/Music_Sheets_White_A_1x1.webp',
                            {'ambienti': ['chiese'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/libri.png': (FA, f'{CS}/Clutter/Paper_Goods/Books_and_Tomes/Book_Piles/Book_Leather_Line_A1_1x1.webp',
                         {'ambienti': ['archivi', 'case'], 'lato': 0.5, 'luce': None, 'sopra': True}),
    'decori/tazza.png': (FA, f'{CS}/Clutter/Kitchenware/Mugs/Ashen/Mug_Side_Wood_Ashen_A_1x1.webp',
                         {'ambienti': ['case'], 'lato': 0.3, 'luce': None, 'sopra': True}),
    'decori/sgabello-rovesciato.png': (FA, f'{CS}/Furniture/Seating/Stools/Fallen/Stool_Fallen_Wood_Ashen_A1_1x1.webp',
                                       {'ambienti': ['case', 'gotico'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/comignolo.png': (FA, f'{CS}/Structures/Building/Roofs/Chimneys/Chimney_Stone_Earthy_A_1x1.webp',
                             {'ambienti': ['tetti'], 'lato': 0.9, 'luce': None, 'sopra': False}),
    'decori/comignolo-2.png': (FA, f'{CS}/Structures/Building/Roofs/Chimneys/Chimney_Stone_Earthy_C_1x1.webp',
                               {'ambienti': ['tetti'], 'lato': 0.9, 'luce': None, 'sopra': False}),
    'decori/botola.png': (FA, f'{CS}/Structures/Building/Doors/Trapdoors/Trapdoor_Wood_Ashen_A1_Closed_Rusty_1x1.webp',
                          {'ambienti': ['fogne', 'tetti'], 'lato': 0.9, 'luce': None, 'sopra': False}),

    # AMPLIAMENTO CATALOGO (docs/scenografia.md, «Il catalogo»): da 14 a ~85
    # pezzi, uno per ogni ambiente della tabella, scelti guardando i provini
    # (--provino), non leggendo i nomi — scartati Horror/Paths (interiora:
    # troppo splatter), Spider_Cocoons (troppo mostro-fresco), Treasure_Chest
    # e Clutter/Food (tesori e dolci: fuori mood), Natural_Decor (sono balle
    # di fieno, non decoro selvatico).
    #
    # -- fonderie, forni, officine
    'decori/carbone.png': (FA, f'{CS}/Lightsources/Coals_and_Firewood/Basin_Coal_Fire_Unlit_A8_1x1.webp',
                           {'ambienti': ['fonderie'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    'decori/carbone-2.png': (FA, f'{CS}/Lightsources/Coals_and_Firewood/Basin_Coal_Fire_Unlit_A3_1x1.webp',
                             {'ambienti': ['fonderie'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    'decori/carbone-mucchio.png': (FA, f'{CS}/Lightsources/Coals_and_Firewood/Basin_Coal_Fire_Unlit_A15_2x2.webp',
                                   {'ambienti': ['fonderie'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/tinozza-fonderia.png': (FA, f'{CS}/Workplace_Equipment/Smithing/Troughs/Trough_Metal_Rusty_Water_Blue_A1_1x1.webp',
                                    {'ambienti': ['fonderie'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/cappa-fonderia.png': (FA, f'{CS}/Workplace_Equipment/Smithing/Forges/Chimneys/Chimney_Metal_Rusty_Large_Rectangle_A1_2x1.webp',
                                  {'ambienti': ['fonderie'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    'decori/mantice.png': (FA, f'{CS}/Workplace_Equipment/Smithing/Bellows/Bellows_Wood_Dark_1x1.webp',
                           {'ambienti': ['fonderie'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/incudine.png': (FA, f'{CS}/Workplace_Equipment/Smithing/Smithing_Tools/Benchtop_Tools/Anvil_Metal_Rusty_A1_1x1.webp',
                            {'ambienti': ['fonderie'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/fumo.png': (FA, '!Effects/Smoke/Smoke_Large_Dark_A6_3x3.webp',
                        {'ambienti': ['fonderie', 'gotico'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    # -- archivi, biblioteche, studi, uffici
    'decori/calamaio-rovesciato.png': (FA, f'{CS}/Clutter/Writing_Implements/Ink_Bottle_B_Spilled_1x1.webp',
                                       {'ambienti': ['archivi'], 'lato': 0.3, 'luce': None, 'sopra': True}),
    'decori/carta-assorbente.png': (FA, f'{CS}/Clutter/Writing_Implements/Inkwells_and_Bases/Ink_Blotter/Blotting_Paper_Inky_A1_1x1.webp',
                                    {'ambienti': ['archivi'], 'lato': 0.3, 'luce': None, 'sopra': True}),
    'decori/mappamondo.png': (FA, f'{CS}/Decor/Office/Globes/Globe_Large_Metal_Black_A1_1x1.webp',
                              {'ambienti': ['archivi', 'case'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/sfera-armillare.png': (FA, f'{CS}/Decor/Office/Armillary_Spheres/Armillary_Sphere_Metal_Rusty_A1_2x1.webp',
                                   {'ambienti': ['archivi', 'gotico'], 'lato': 1.0, 'luce': None, 'sopra': False}),
    'decori/libro-aperto.png': (FA, f'{CS}/Clutter/Paper_Goods/Books_and_Tomes/Book_E1_Brown_1x1.webp',
                                {'ambienti': ['archivi'], 'lato': 0.4, 'luce': None, 'sopra': True}),
    'decori/libro-aperto-2.png': (FA, f'{CS}/Clutter/Paper_Goods/Books_and_Tomes/Book_E1_Black_1x1.webp',
                                  {'ambienti': ['archivi', 'case'], 'lato': 0.4, 'luce': None, 'sopra': True}),
    'decori/orologio-fermo.png': (FA, 'Industrial/Base_Industrial_Settlement/Structures/Mechanical_Parts/Clock_Parts/Clock_Metal_Gray_Face_A1_6x6.webp',
                                  {'ambienti': ['archivi', 'case', 'gotico'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/pacco.png': (FA, f'{CS}/Decor/Storage/Parcels/Parcel_Brown_A1_1x1.webp',
                         {'ambienti': ['archivi', 'magazzini'], 'lato': 0.4, 'luce': None, 'sopra': True}),
    # -- case, salotti, camere
    'decori/specchio-rotto.png': (FA, f'{CS}/Furniture/Mirrors/Broken/Mirror_Blue_Metal_Bronze_A1_Broken_1x1.webp',
                                  {'ambienti': ['case', 'gotico'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/specchio-rotto-2.png': (FA, f'{CS}/Furniture/Mirrors/Broken/Mirror_Blue_Metal_Bronze_A2_Broken_1x1.webp',
                                    {'ambienti': ['case', 'gotico'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/busto.png': (FA, f'{CS}/Decor/Busts/Statue_Bust_Marble_White_A1_Fallen_Broken_1x1.webp',
                         {'ambienti': ['case', 'archivi', 'gotico'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/tenda-strappata.png': (FA, f'{CS}/Decor/Wall_Hangings/Curtains/Window_Curtains/Large_Window_Curtains/Large_Window_Curtain_Cloths/Curtain_Large_Cloth_Black_A_3x1.webp',
                                   {'ambienti': ['case'], 'lato': 2.0, 'luce': None, 'sopra': False}),
    'decori/armadio-anta.png': (FA, f'{CS}/Furniture/Cupboards_and_Wardrobes/Cupboard_Door_Wood_Dark_A_1x1.webp',
                                {'ambienti': ['case'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    'decori/vetri-infranti.png': (FA, f'{CS}/Structures/Rubble/Rubble_Piles/Glass/Glass_Pile_Blue_A17_1x1.webp',
                                  {'ambienti': ['case', 'ovunque'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    'decori/vetri-infranti-2.png': (FA, f'{CS}/Structures/Rubble/Rubble_Piles/Glass/Glass_Pile_Blue_A18_1x1.webp',
                                    {'ambienti': ['case', 'ovunque'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    # -- giardini, serre, cortili (l'abbandono vegetale: secco, non lussureggiante)
    'decori/edera.png': (FA, 'Woodlands/!Wilderness/Flora/Vines/Ivy_Vines/Ivy_Green2_D1_1x1.webp',
                         {'ambienti': ['giardini', 'gotico'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/topiaria-secca.png': (FA, 'Woodlands/Botanical_Garden_Settlement/Structures/Hedgemaze/Topiary/Topiary_Dry_A1_2x2.webp',
                                  {'ambienti': ['giardini'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/topiaria-secca-2.png': (FA, 'Woodlands/Botanical_Garden_Settlement/Structures/Hedgemaze/Topiary/Topiary_Dry_B1_2x2.webp',
                                    {'ambienti': ['giardini'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/erbacce-secche.png': (FA, 'Woodlands/!Wilderness/Flora/Weeds/Weed_Edges/Weed_Edge_Red_A5_1x1.webp',
                                  {'ambienti': ['giardini'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/erbacce-secche-2.png': (FA, 'Woodlands/!Wilderness/Flora/Weeds/Weed_Edges/Weed_Edge_Multicolor1_A9_3x1.webp',
                                    {'ambienti': ['giardini'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/ramo-secco.png': (FA, 'Woodlands/!Wilderness/Flora/Sticks_Twigs_Branches/Branches/Branch_Wood_Dark_A6_1x1.webp',
                              {'ambienti': ['giardini'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/masso-muschioso.png': (FA, 'Woodlands/!Wilderness/Decor/Rocks/Boulders/Boulder_Stone_Mossy_D22_2x2.webp',
                                   {'ambienti': ['giardini'], 'lato': 1.0, 'luce': None, 'sopra': False}),
    # -- fogne, cisterne, gallerie, grotte
    'decori/tife-marce.png': (FA, 'Swamp/!Wilderness/Flora/Water_Plants/Cattails/Cattail_Brown_A12_1x1.webp',
                              {'ambienti': ['fogne', 'acqua'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    # -- acqua, banchine, moli, darsene
    'decori/ancora.png': (FA, f'{CS}/Vehicles/Ships/Anchors/Anchor_Medium_Metal_Rusty_B1_3x3.webp',
                          {'ambienti': ['acqua'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/pozzo-coperto.png': (FA, f'{CS}/Structures/Water_Structures/Wells/Well_Cover_Metal_Rusty_A_2x2.webp',
                                 {'ambienti': ['acqua', 'fogne'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    # -- magazzini, depositi, quinte
    'decori/secchio.png': (FA, f'{CS}/Decor/Storage/Buckets/Bucket_Wood_Dark_A1_1x1.webp',
                           {'ambienti': ['magazzini'], 'lato': 0.4, 'luce': None, 'sopra': False}),
    'decori/straccio.png': (FA, f'{CS}/Clutter/Cloth/Rags/Rag_Cloth_Black_A_1x1.webp',
                            {'ambienti': ['magazzini', 'case'], 'lato': 0.3, 'luce': None, 'sopra': False}),
    'decori/baule.png': (FA, f'{CS}/Decor/Storage/Chests/Chest_Wood_Dark_A_1x1.webp',
                         {'ambienti': ['magazzini', 'case'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    # -- cripte, ossari, cimiteri
    'decori/sarcofago.png': (FA, f'{CS}/Burial_and_Graves/Sarcophagi/Sarcophagus_Stone_Earthy_A1_2x3.webp',
                             {'ambienti': ['cripte'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    'decori/lapide.png': (FA, f'{CS}/Burial_and_Graves/Tombstones/Tombstone_Stone_Earthy_A3_1x1.webp',
                          {'ambienti': ['cripte'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/lapide-2.png': (FA, f'{CS}/Burial_and_Graves/Tombstones/Tombstone_Stone_Earthy_A4_1x1.webp',
                            {'ambienti': ['cripte'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/bara.png': (FA, f'{CS}/Burial_and_Graves/Coffins/Coffin_Wood_Dark_C_1x2.webp',
                        {'ambienti': ['cripte'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/bara-2.png': (FA, f'{CS}/Burial_and_Graves/Coffins/Coffin_Wood_Dark_A_1x2.webp',
                          {'ambienti': ['cripte'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/gabbia.png': (FA, f'{CS}/Decor/Restraints_and_Torture/Cages/Cage_Metal_Rusty_A2_Top_2x2.webp',
                          {'ambienti': ['cripte', 'gotico'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/gabbia-2.png': (FA, f'{CS}/Decor/Restraints_and_Torture/Cages/Cage_Metal_Rusty_B1_Top_3x2.webp',
                            {'ambienti': ['cripte', 'gotico'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    # -- chiese, navate, cori, organi / il gotico trasversale
    'decori/candelabro.png': (FA, f'{CS}/Lightsources/Candelabras/Candelabra_Metal_Rusty_A_1x1.webp',
                              {'ambienti': ['chiese', 'gotico'], 'lato': 0.7, 'luce': 'cera', 'sopra': True}),
    'decori/candelabro-2.png': (FA, f'{CS}/Lightsources/Candelabras/Candelabra_Metal_Rusty_B_1x1.webp',
                                {'ambienti': ['chiese', 'gotico'], 'lato': 0.7, 'luce': 'cera', 'sopra': True}),
    'decori/organo.png': (FA, f'{CS}/Decor/Musical_Instruments/Keys/Organ_Pipes_Wood_Dark_Metal_Gold_A_1x1.webp',
                          {'ambienti': ['chiese'], 'lato': 0.8, 'luce': None, 'sopra': False}),
    'decori/panca-marcia.png': (FA, f'{CS}/Furniture/Seating/Benches/Bench_Wood_Ashen_A1_2x1.webp',
                                {'ambienti': ['chiese'], 'lato': 1.5, 'luce': None, 'sopra': False}),
    'decori/filo-spinato.png': (FA, f'{CS}/Decor/Restraints_and_Torture/Barbwire/Barbwire_Metal_Rusty_A1_1x1.webp',
                                {'ambienti': ['gotico', 'cripte'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    # -- tetti, guglie, ballatoi, logge
    'decori/trave-spezzata.png': (FA, f'{CS}/Structures/Beams_and_Supports/Beams/Beam_End_Wood_Ashen_Metal_Gray_A1_2x2.webp',
                                  {'ambienti': ['tetti'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/trave-spezzata-2.png': (FA, f'{CS}/Structures/Beams_and_Supports/Beams/Beam_End_Wood_Dark_Metal_Gray_A1_2x2.webp',
                                    {'ambienti': ['tetti'], 'lato': 1.2, 'luce': None, 'sopra': False}),
    'decori/forca.png': (FA, f'{CS}/Structures/Beams_and_Supports/Beams/Beam_Gallow_Wood_Dark_Metal_Gray_A1_1x2.webp',
                         {'ambienti': ['tetti', 'gotico'], 'lato': 1.8, 'luce': None, 'sopra': False}),
    # -- Ep.6 (Il Terzo Movimento): l'anticamera del coro, dodici mantelli e
    # dodici paia di scarpe allineate — provino guardato prima di importarli
    'decori/mantello.png': (FA, f'{CS}/Clutter/Clothing/Jackets_and_Cloaks/Cloak_Cloth_Black_A1_1x2.webp',
                            {'ambienti': ['gotico', 'chiese'], 'lato': 1.0, 'luce': None, 'sopra': False}),
    'decori/scarpe.png': (FA, f'{CS}/Clutter/Clothing/Footwear/Boots_Leather_Black_A1_1x1.webp',
                          {'ambienti': ['chiese', 'case'], 'lato': 0.5, 'luce': None, 'sopra': False}),
    # -- Ep.7 (Il quartiere sordo): il cantiere di notte, il montacarichi delle
    # canne morte — provini guardati prima di importarli (--provino)
    'decori/carrucola.png': (FA, f'{CS}/Structures/Mechanical_Parts/Winches/Winch_Rope_Wood_Ashen_Metal_Rusty_B1_2x2.webp',
                             {'ambienti': ['magazzini'], 'lato': 1.4, 'luce': None, 'sopra': False}),
    'decori/sacco-chiaro.png': (FA, f'{CS}/Decor/Storage/Sacks/Cloth/Sack_Cloth_White_A_1x1.webp',
                                {'ambienti': ['magazzini'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    'decori/telo-strappato.png': (FA, f'{CS}/Structures/Shelters/Awnings/Awning_Cloths/Ruined/Tarp_Awning_Cloth_Beige_Ruined_A1_2x2.webp',
                                  {'ambienti': ['tetti', 'magazzini'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    # -- Ep.8 (L'oro vecchio): la sala del crogiolo e l'ufficio del pesatore —
    # provini guardati prima di importarli (--provino). Il nome 'crogiolo' e'
    # apposta: e' quello che ambiente-fa.js riconosce come fuoco acceso quando
    # sostituisce un arredo "casse" (docs/scenografia.md, tabella arredo del
    # posto) — niente campo luce da impostare a mano. 'fornello-freddo' invece
    # evita apposta la sottostringa 'stufa' nel nome: e' spento, e quella
    # sottostringa accenderebbe la stessa regola.
    'decori/crogiolo.png': (FA, f'{CS}/Workplace_Equipment/Smithing/Smelting/Crucibles/Crucible_Large_Metal_Sut_Molten_A1_2x2.webp',
                            {'ambienti': ['fonderie'], 'lato': 1.5, 'luce': 'cera', 'sopra': False}),
    'decori/lingotto.png': (FA, f'{CS}/Clutter/Treasure/Ingots/Ingot_Gold_A2_1x1.webp',
                            {'ambienti': ['fonderie'], 'lato': 0.35, 'luce': None, 'sopra': True}),
    'decori/bilancia.png': (FA, f'{CS}/Clutter/Misc/Mercantile/Scales_Metal_Brass_A1_1x1.webp',
                            {'ambienti': ['fonderie'], 'lato': 0.5, 'luce': None, 'sopra': True}),
    'decori/fornello-freddo.png': (FA, f'{CS}/Furniture/Cooking_Appliances/Stove_Rusty_C_1x1.webp',
                                   {'ambienti': ['fonderie', 'case'], 'lato': 0.7, 'luce': None, 'sopra': False}),
    # -- Ep.12 (La seconda copia): l'inseguimento nei canali, ponti coperti e
    # il cimitero delle barche — provini guardati prima di importarli
    # (--provino). 'lanterna-cieca' e' apposta senza luce: e' la lanterna
    # SPENTA appesa alla prua del barcaiolo (Cimitero delle Barche), mai
    # accesa in scena.
    'decori/rete.png': (FA, f'{CS}/Workplace_Equipment/Fishing/Fishing_Nets/Fishing_Net_01_Fish_01_A1_2x2.webp',
                        {'ambienti': ['acqua'], 'lato': 1.3, 'luce': None, 'sopra': False}),
    'decori/sigillo-cera.png': (FA, f'{CS}/Clutter/Writing_Implements/Sigils_and_Stamps/Wax_Sigil_Red_A_1x1.webp',
                                {'ambienti': ['archivi'], 'lato': 0.35, 'luce': None, 'sopra': False}),
    'decori/barca-rovesciata.png': (FA, f'{CS}/Vehicles/Boats/Broken/Rowboat_Upsidedown_Broken_Wood_Dark_A1_2x2.webp',
                                    {'ambienti': ['acqua'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    'decori/lanterna-cieca.png': (FA, f'{CS}/Lightsources/Lanterns/Lantern_Metal_Rusty_A1_1x1.webp',
                                  {'ambienti': ['acqua', 'gotico'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    'decori/bitta-cima.png': (FA, f'{CS}/Vehicles/Ships/Mooring_Posts/Mooring_Post_Metal_Rusty_Rope_Ashen_A2_1x1.webp',
                              {'ambienti': ['acqua'], 'lato': 0.6, 'luce': None, 'sopra': False}),
    # -- Ep.13 (Carta di pregio): il molino fuori citta', T3/T5/T6 — provini
    # guardati prima di importarli (--provino). Nessun pezzo del catalogo
    # rendeva una macina, un telaio da essiccatoio o un torchio da stampa: la
    # sala delle macine, l'essiccatoio e la sala del torchio sono i nomi stessi
    # delle tessere, servivano pezzi veri e non casse generiche.
    'decori/macina.png': (FA, f'{CS}/Workplace_Equipment/Farming/Grain_Milling/Grain_Mill_Stone_Earthy_Wood_Ashen_A1_2x3.webp',
                          {'ambienti': ['magazzini'], 'lato': 2.2, 'luce': None, 'sopra': False}),
    'decori/telaio-carta.png': (FA, f'{CS}/Workplace_Equipment/Fishing/Drying_Racks/Drying_Rack_Wood_Dark_Empty_A1_2x2.webp',
                                {'ambienti': ['archivi'], 'lato': 1.6, 'luce': None, 'sopra': False}),
    'decori/torchio.png': (FA, f'{CS}/Workplace_Equipment/Book_Making/Printing_Press_Wood_Dark_A_3x3.webp',
                           {'ambienti': ['archivi', 'magazzini'], 'lato': 2.0, 'luce': None, 'sopra': False}),
}


def provino(cartella, max_n=60):
    # un foglio coi primi max_n pezzi di una cartella, col nome sotto: si
    # sceglie guardando, non leggendo i nomi dei file
    from PIL import ImageDraw
    fs = sorted(glob.glob(os.path.join(FA, cartella, '**', '*.webp'), recursive=True))[:max_n]
    S, cols = 160, 10
    foglio = Image.new('RGB', (cols * S, ((len(fs) + cols - 1) // cols) * (S + 28)), (40, 36, 32))
    d = ImageDraw.Draw(foglio)
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGBA'); im.thumbnail((S - 8, S - 8))
        x, y = (i % cols) * S, (i // cols) * (S + 28)
        foglio.paste(im, (x + 4, y + 4), im)
        d.text((x + 4, y + S), os.path.basename(f)[:26], fill=(220, 210, 190))
    out = os.path.join(ROOT, 'logs', 'provini', cartella.replace('/', '_').replace('!', '') + '.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True); foglio.save(out, quality=85)
    print('provino:', out)


def main():
    if '--provino' in sys.argv:
        return provino(sys.argv[sys.argv.index('--provino') + 1])
    if not os.path.isdir(FA):
        sys.exit('manca risorse-vtt/FA_Assets_Webp — vedi risorse-vtt/LEGGIMI.md')
    mancano = []
    catalogo = {}
    for dst, spec in PEZZI.items():
        base, rel = spec[0], spec[1]
        meta = spec[2] if len(spec) > 2 else None
        src = os.path.join(base, rel)
        if not os.path.exists(src):
            mancano.append(rel); continue
        out = os.path.join(OUT, dst)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        if src.endswith('.png'):
            shutil.copyfile(src, out)
        else:
            img = Image.open(src).convert('RGBA')
            img.thumbnail((600, 600), Image.LANCZOS)   # 200px a casella bastano per lo schermo
            img.save(out, optimize=True)
        if meta is not None:
            nome = os.path.basename(dst)[:-4]   # decori/xxx.png -> xxx
            catalogo[nome] = {**meta, 'fonte': os.path.relpath(src, ROOT).replace(os.sep, '/')}
    if catalogo:
        with open(os.path.join(OUT, 'decori', 'CATALOGO.json'), 'w', encoding='utf-8') as f:
            json.dump(catalogo, f, ensure_ascii=False, indent=2, sort_keys=True)
    print(f'OK {len(PEZZI) - len(mancano)} pezzi in {os.path.relpath(OUT, ROOT)}')
    for m in mancano:
        print('  ! manca', m)


if __name__ == '__main__':
    main()
