# -*- coding: utf-8 -*-
"""Porta dentro gli arredi e i pavimenti dipinti di Forgotten Adventures.

La libreria sta in `risorse-vtt/FA_Assets_Webp/` (147k file .webp, scaricati a
mano: il sito non si automatizza). Questo script sceglie i pezzi che servono ai
QUATTORDICI arredi e ai DIECI ambienti del gioco, li converte in PNG con
trasparenza e li mette in `webapp/vtt/`, dove il generatore delle tessere li
trova gia' (`pittura-vtt.js`, funzione `dipinto`).

DUE COSE CHE LA LIBRERIA REGALA, e che vanno usate:

1. IL NOME PORTA L'INGOMBRO. `Altar_Stone_Slate_A_2x1.webp` dice che l'altare
   occupa due caselle per una. I nostri arredi hanno gia' il loro ingombro nei
   dati (`groupArredi` fonde le celle adiacenti), quindi si sceglie la variante
   che combacia invece di stiracchiare un 1x1 su due caselle.

2. LE VARIANTI. Le casse compaiono 172 volte su 249 arredi di tutta la
   campagna: con un disegno solo si ripetono come carta da parati. Qui se ne
   prendono piu' d'una per chiave (`casse-1`, `casse-2`, ...) e il generatore
   sceglie in modo stabile dalla posizione della casella — stessa tessera,
   stesso disegno, sempre.

LICENZA. Gli asset gratuiti di Forgotten Adventures sono CC BY-NC-SA 4.0:
attribuzione, niente uso commerciale, e ShareAlike — il vincolo si attacca a
quel che ne deriva, cioe' alle tessere. Lo scrive `webapp/vtt/LICENZE.txt` e va
detto in NOTICE.md. La libreria non entra in git.

Uso:  python scripts/importa-fa.py [--elenca chiave]
"""
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# PIU' PACCHETTI, UN INDICE SOLO. La libreria grande ha quasi tutto, ma i
# pacchetti a tema hanno il pezzo giusto: `Dungeon_Decor_01` ha le GABBIE (la
# nostra cella) e i bracieri, che nella libreria grande o non ci sono o sono
# altro. Le ricette puntano prima al pacchetto giusto, poi alla libreria.
BASI = [
    os.path.join(ROOT, 'risorse-vtt', 'FA_Assets_Webp'),
    os.path.join(ROOT, 'risorse-vtt', 'Dungeon_Decor_01'),
    os.path.join(ROOT, 'risorse-vtt', 'Terrain_Textures_Pack_05'),
]
BASE = BASI[0]
FUORI = os.path.join(ROOT, 'webapp', 'vtt')
VARIANTI = 3           # quante ne prende per chiave
LATO = 1024

# chiave -> ricette in ordine di preferenza (tutte le parole devono comparire
# nel percorso, in minuscolo). Le cartelle FA sono precise: si punta a quelle,
# non a una parola qualunque che rischia di pescare un foglio di carta col
# nome giusto (e' successo: «law_enforcement» pescava i fascicoli, non le celle).
ARREDI = {
    'casse':     [['boxes_and_crates/crates', 'wood'], ['boxes_and_crates', 'crate'], ['crate']],
    'molo':      [['mooring_posts', 'wood'], ['mooring_posts'], ['ships', 'rope']],
    'candele':   [['dungeon_decor', 'braziers'], ['lightsources/candles'], ['candelabras']],
    'scrivania': [['tables/desks', 'wood'], ['tables/desks'], ['furniture', 'desk']],
    'branda':    [['bedding/beds', 'wood'], ['bedding/beds'], ['bedrolls']],
    'scala':     [['stairs_and_ladders/stairs_stone'], ['stairs_and_ladders/stairs_wood'], ['stairs']],
    'altare':    [['dungeon_decor', 'altars', 'altar_stone'], ['furniture/altars', 'stone'], ['altar']],
    'cella':     [['dungeon_decor', 'cages', 'cage_metal'], ['dungeon_decor', 'cages'],
                 ['building/cells', 'metal'], ['cage']],
    'forma':     [['alchemy', 'cauldron'], ['cauldron'], ['pottery', 'kiln']],
    'scorie':    [['rubble_piles/stone'], ['rubble_piles'], ['rubble']],
    'crogiolo':  [['smithing/forges', 'forge'], ['smithing/forges'], ['forge']],
    'stufa':     [['cooking_appliances', 'stove'], ['cooking_appliances', 'oven'], ['fireplaces']],
    'armadio':   [['cupboards_and_wardrobes', 'wardrobe'], ['cupboards_and_wardrobes'], ['cabinet']],
    'toeletta':  [['furniture/mirrors', 'wood'], ['furniture/mirrors'], ['vanity', 'table']],
}

# i pavimenti sono TEXTURE piastrellabili: cartelle diverse, e una sola per ruolo
# I PAVIMENTI VENGONO PRIMA DAL PACCHETTO DI TERRENI: e' fatto per questo —
# piastrelle grandi, cucitura invisibile, e la stessa mano degli arredi. La
# libreria grande resta come ripiego.
# DICIOTTO AMBIENTI, non piu' dieci. Dieci erano secchi larghi: «mattoni» teneva
# insieme la fonderia e il magazzino, «terra» il giardino e la cantina, «navata»
# tutte le chiese. Roccamora ha piu' posti di cosi', e la libreria FA ha piu'
# texture di cosi' — quaranta famiglie, dalle assi di catapecchia al marmo, dalla
# melma di palude alla lamiera ondulata.
#
# TRE VARIANTI PER AMBIENTE, come per gli arredi: due stanze dello stesso tipo
# accostate non devono avere lo stesso identico pavimento. Il generatore ne
# sceglie una in modo stabile dal nome della tessera, cosi' la stessa stanza esce
# sempre uguale — schermo e cartoncino devono dire la stessa cosa.
PAVIMENTI = {
    # -- il legno: le banchine e i moli sono una cosa, i tavolati poveri un'altra
    'assi':       [['textures/wooden_floors', 'ashen'], ['textures/wooden_floors', '.jpg']],
    'tavolato':   [['textures/shack_floors', '.jpg'], ['textures/wooden_floors', 'dark']],
    # -- la pietra della citta': la calle, la cripta, la stanza, il palazzo
    'lastricato': [['texture_pack_05', 'stone_tiles_a'],
                   ['textures/stone_floors', 'cobblestone', '.jpg'],
                   ['textures/stone_floors', '.jpg']],
    'pietra':     [['texture_pack_05', 'square_grout'],
                   ['textures/stone_square_tiles', '.jpg']],
    'mattonelle': [['texture_pack_05', 'marble_tiles_b'],
                   ['textures/stone_patterned_tiles', '.jpg']],
    'mosaico':    [['textures/stone_diagonal_tiles', '.jpg'],
                   ['textures/stone_hexagonal_tiles', '.jpg']],
    'navata':     [['textures/marble', '.jpg'], ['texture_pack_05', 'marble_tiles_a']],
    # -- il lavoro: il forno, l'officina, la passerella di ferro
    'mattoni':    [['textures/brick', 'brick_floor', '.jpg'], ['textures/brick', '.jpg']],
    'metallo':    [['textures/metal', 'metal_floor', '.jpg'], ['textures/metal', '.jpg']],
    'lamiera':    [['textures/roof', 'corrugated', '.jpg'], ['textures/roof', '.jpg']],
    # -- l'acqua e quel che ci sta attorno: il canale, la melma, il fango
    'acqua':      [['texture_pack_05', 'still_water_a'],
                   ['aquatic', 'textures/water', 'calm', '.jpg'],
                   ['aquatic', 'textures/water', '.jpg']],
    'melma':      [['textures/marsh', '.jpg'], ['textures/mud', '.jpg']],
    # -- la terra: il cortile, il piazzale, la grotta
    'terra':      [['texture_pack_05', 'terrain'], ['textures/dirt', '.jpg']],
    'ghiaia':     [['textures/gravel', '.jpg'], ['textures/dirt', '.jpg']],
    'roccia':     [['texture_pack_05', 'rock_'], ['textures/rock', '.jpg']],
    # -- il verde e il chiuso: il giardino, il salotto, l'essiccatoio
    'erba':       [['textures/grass', '.jpg'], ['textures/forest', '.jpg']],
    'tappeto':    [['textures/rug_and_carpets', 'red', '.jpg'],
                   ['textures/rug_and_carpets', '.jpg']],
    'paglia':     [['textures/hay', '.jpg'], ['textures/dirt', '.jpg']],
    # -- i tetti restano quel che erano
    # I COPPI STANNO IN .webp, non in .jpg — la regola «i pavimenti sono jpg»
    # vale per le texture di terreno, non per questa: chiedendo .jpg il tetto
    # cadeva sulla LAMIERA ONDULATA, e l Ep.11 e un campanile, non un capannone.
    'tetti':      [['textures/roof', 'roof_texture_tile'], ['textures/roof', 'tile']],
}

INGOMBRO = re.compile(r'_(\d+)x(\d+)\.(webp|png|jpg)$', re.I)

# LE PARTI NON SONO L'OGGETTO. FA scompone: il coperchio della cassa, l'anta
# dell'armadio, la ringhiera della scala, la cappa del forno, lo specchio
# rotto. Hanno tutti il nome giusto e non sono la cosa.
VIETATE = ['_lid', 'lid_', 'door_', '_door', 'railing', 'hood', 'broken',
           'damage', 'overlay', 'shadow', 'top_', '_part', 'piece', 'frame_only']


def indice():
    """Gli OGGETTI sono .webp con trasparenza, i PAVIMENTI sono .jpg
    piastrellabili: indicizzando i soli webp si pescavano le decalcomanie
    «Overlay» al posto delle texture, e il pavimento usciva trasparente.

    Le fonti sono piu' d'una: la libreria grande ha quasi tutto, i pacchetti a
    tema hanno il pezzo giusto (le GABBIE di Dungeon_Decor per la cella)."""
    fuori = []
    for base in BASI:
        if not os.path.isdir(base):
            continue
        for radice, _, file in os.walk(base):
            for f in file:
                if f.lower().endswith(('.webp', '.jpg', '.png')):
                    fuori.append(os.path.join(radice, f).replace(chr(92), '/'))
    return fuori


def scegli(tutti, ricette, quante=VARIANTI):
    """I primi `quante` file della prima ricetta che risponde, tenendo le
    varianti DIVERSE fra loro: FA numera A1, A2, A3 la stessa cassa vista da
    tre angoli — prenderle tutte e tre non e' varieta', e' la stessa cassa."""
    for parole in ricette:
        trovati = [p for p in tutti if all(w in p.lower() for w in parole)
                   and not any(v in os.path.basename(p).lower() for v in VIETATE)]
        if not trovati:
            continue
        trovati.sort()
        scelti, visti = [], set()
        for p in trovati:
            # la famiglia e' il nome senza la lettera-variante finale
            famiglia = re.sub(r'_[A-Z]\d*(_\d+x\d+)?\.(webp|png|jpg)$', '', os.path.basename(p), flags=re.I)
            if famiglia in visti:
                continue
            visti.add(famiglia)
            scelti.append(p)
            if len(scelti) >= quante:
                break
        return parole, scelti
    return None, []


# TUTTE LE TEXTURE ALLA STESSA ESPOSIZIONE.
#
# La libreria non e' esposta in modo uniforme: fra le tre varianti di «navata»
# una e' marmo bianco e una e' marmo nero, e sulla stessa tessera una stanza
# usciva al neon e quella accanto in ombra. Nessuna gradazione a valle puo'
# rimediare, perche' parte da due punti diversi.
#
# Qui ogni pavimento viene portato alla stessa luminanza media prima di entrare:
# da li' in poi la «mano» del gioco (pittura-vtt.js) agisce uguale su tutti, ed
# e' il primo requisito perche' venti texture di venti cartelle diverse sembrino
# dipinte dalla stessa persona. Il colore proprio resta — cambia l'esposizione.
LUMINANZA = 118        # su 255: il grigio medio di una fotografia ben esposta


def esponi(img, bersaglio=LUMINANZA):
    from PIL import ImageEnhance, ImageStat
    grigio = img.convert('L')
    media = ImageStat.Stat(grigio).mean[0]
    if media < 4:
        return img
    fattore = max(0.35, min(2.8, bersaglio / media))
    rgb = ImageEnhance.Brightness(img.convert('RGB')).enhance(fattore)
    fuori = rgb.convert('RGBA')
    fuori.putalpha(img.getchannel('A'))
    return fuori


def porta(p, dove, ritaglia=True, esposizione=False, lato=LATO):
    img = Image.open(p).convert('RGBA')
    # un PAVIMENTO non si ritaglia: e' una piastrella intera, e il ritaglio del
    # trasparente la sposterebbe di qualche pixel rompendo la ripetizione
    if ritaglia:
        scatola = img.getbbox()
        if scatola:
            img = img.crop(scatola)
    if esposizione:
        img = esponi(img)
    img.thumbnail((lato, lato), Image.LANCZOS)
    img.save(dove, optimize=True)
    return img.size


def ingombro(p):
    m = INGOMBRO.search(p)
    return f'{m.group(1)}x{m.group(2)}' if m else '?'


def main():
    if not os.path.isdir(BASE):
        sys.exit(f'manca {os.path.relpath(BASE, ROOT)}')
    tutti = indice()
    print(f'{len(tutti)} file nella libreria\n')

    if '--elenca' in sys.argv:
        chiave = sys.argv[sys.argv.index('--elenca') + 1]
        ricette = ARREDI.get(chiave) or PAVIMENTI.get(chiave)
        parole, scelti = scegli(tutti, ricette, 20)
        print(f'{chiave}: ricetta {parole}')
        for p in scelti:
            print('   ', os.path.relpath(p, ROOT).replace(chr(92), '/'))
        return

    os.makedirs(os.path.join(FUORI, 'arredi'), exist_ok=True)
    os.makedirs(os.path.join(FUORI, 'pavimenti'), exist_ok=True)
    righe, mancanti = [], []

    for chiave, ricette in ARREDI.items():
        parole, scelti = scegli(tutti, ricette)
        if not scelti:
            mancanti.append(chiave)
            print(f'  {chiave:11s} NIENTE')
            continue
        for i, p in enumerate(scelti):
            nome = chiave if i == 0 else f'{chiave}-{i + 1}'
            w, h = porta(p, os.path.join(FUORI, 'arredi', nome + '.png'))
            righe.append(f'arredi/{nome}.png  <-  {os.path.relpath(p, ROOT).replace(chr(92), '/')}')
        print(f'  {chiave:11s} {len(scelti)} varianti · ingombro {ingombro(scelti[0])} · {os.path.basename(scelti[0])}')

    # I COLORI SQUILLANTI NON SONO VARIANTI. FA numera lo stesso tetto in nero,
    # blu e rosso, e lo stesso marmo in verde e oro: pescandone tre a caso la
    # guglia usciva col pavimento azzurro a righe. Sui PAVIMENTI si tengono solo
    # le tinte neutre — sugli arredi no, li' il colore e' l'oggetto.
    tinti = ['_blue', '_red', '_green', '_purple', '_gold', '_silver', '_pink',
             '_orange', '_yellow', 'bluesilver', 'goldred', 'blackgold']
    neutri = [q for q in tutti if not any(t in os.path.basename(q).lower() for t in tinti)]
    for chiave, ricette in PAVIMENTI.items():
        parole, scelti = scegli(neutri, ricette, VARIANTI)
        if not scelti:
            mancanti.append('pavimento ' + chiave)
            print(f'  pavimento {chiave:11s} NIENTE')
            continue
        for i, p in enumerate(scelti):
            nome = chiave if i == 0 else f'{chiave}-{i + 1}'
            # I PAVIMENTI POSSONO ANDARE PIU' GRANDI DEGLI OGGETTI: una
            # piastrella che copre sei caselle a 345 px l'una chiede duemila
            # pixel, e il tetto a 1024 li tagliava. Quel che la libreria ha in
            # piu' (l'acqua e' 3200) qui non si butta.
            w, h = porta(p, os.path.join(FUORI, 'pavimenti', nome + '.png'),
                         ritaglia=False, esposizione=True, lato=2048)
            righe.append(f'pavimenti/{nome}.png  <-  {os.path.relpath(p, ROOT).replace(chr(92), '/')}')
        print(f'  pavimento {chiave:11s} {len(scelti)} varianti · {os.path.basename(scelti[0])}')

    with open(os.path.join(FUORI, 'LICENZE.txt'), 'w', encoding='utf-8') as f:
        f.write('Arredi e pavimenti delle tessere di Spedizione.\n')
        f.write('Fonte: Forgotten Adventures - https://www.forgotten-adventures.net\n')
        f.write('Licenza: CC BY-NC-SA 4.0 - attribuzione, NESSUN uso commerciale,\n')
        f.write('e ShareAlike: il vincolo passa alle tessere che ne derivano.\n')
        f.write('Credito da mostrare: «Mappe realizzate con asset di Forgotten Adventures».\n\n')
        f.write('\n'.join(righe) + '\n')

    print(f'\nOK {len(righe)} pezzi in {os.path.relpath(FUORI, ROOT)}')
    if mancanti:
        print('senza arte (restano le sagome disegnate): ' + ', '.join(mancanti))


if __name__ == '__main__':
    main()
