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
PAVIMENTI = {
    'assi':       [['textures/wooden_floors', '.jpg'], ['textures/wood', '.jpg']],
    'lastricato': [['textures/stone_floors', 'cobblestone_a', '.jpg'], ['textures/stone_floors', '.jpg']],
    'pietra':     [['textures/stone_square_tiles', '.jpg'], ['textures/stone_floors', 'square', '.jpg']],
    'mattonelle': [['textures/stone_patterned_tiles', '.jpg'], ['textures/marble', 'tiles', '.jpg']],
    'mattoni':    [['textures/brick', 'brick_floor', '.jpg'], ['textures/brick', '.jpg']],
    'terra':      [['textures/cultivated_soil', '.jpg'], ['textures', 'dirt', '.jpg']],
    'acqua':      [['aquatic', 'textures', 'water', '.jpg'], ['textures', 'water', '.jpg']],
    'tetti':      [['textures/roof', 'tile', '.jpg'], ['textures/roof', '.jpg']],
    'navata':     [['textures/marble', 'white', '.jpg'], ['textures/marble', '.jpg']],
    'roccia':     [['underdark', 'textures', '.jpg'], ['textures', 'rock', '.jpg'],
                   ['textures/stone_floors', 'dirt', '.jpg']],
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


def porta(p, dove, ritaglia=True):
    img = Image.open(p).convert('RGBA')
    # un PAVIMENTO non si ritaglia: e' una piastrella intera, e il ritaglio del
    # trasparente la sposterebbe di qualche pixel rompendo la ripetizione
    if ritaglia:
        scatola = img.getbbox()
        if scatola:
            img = img.crop(scatola)
    img.thumbnail((LATO, LATO), Image.LANCZOS)
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

    for chiave, ricette in PAVIMENTI.items():
        parole, scelti = scegli(tutti, ricette, 1)
        if not scelti:
            mancanti.append('pavimento ' + chiave)
            print(f'  pavimento {chiave:11s} NIENTE')
            continue
        p = scelti[0]
        w, h = porta(p, os.path.join(FUORI, 'pavimenti', chiave + '.png'), ritaglia=False)
        righe.append(f'pavimenti/{chiave}.png  <-  {os.path.relpath(p, ROOT).replace(chr(92), '/')}')
        print(f'  pavimento {chiave:11s} {w}x{h} · {os.path.basename(p)}')

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
