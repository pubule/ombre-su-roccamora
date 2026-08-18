# -*- coding: utf-8 -*-
"""Porta dentro gli arredi e i pavimenti DIPINTI dei pacchetti VTT.

Gli zip li scarica una persona (il sito li dà dal carrello, prezzo libero) e li
lascia in `risorse-vtt/`; questo script li apre, sceglie i pezzi che servono ai
quattordici arredi del gioco, li normalizza e li mette in `webapp/vtt/`, dove il
generatore delle tessere li trova.

COME SCEGLIE. Non per nome esatto — i pacchetti cambiano i nomi a ogni
revisione — ma per PAROLE nel nome del file, in ordine di preferenza: la prima
che risponde vince. Quel che non trova lo dice, e per quell'arredo il
generatore continua a disegnare la sagoma che ha (`pittura-vtt.js`): meglio una
sagoma che una casella vuota, che è l'inganno del Preludio.

LA LICENZA VIAGGIA COI FILE. Gli asset gratuiti di 2-Minute Tabletop sono
CC BY-NC 4.0: attribuzione obbligatoria, nessun uso commerciale, e vale anche
per le tessere che ne derivano. Lo scrive `webapp/vtt/LICENZE.txt`, e sta in
NOTICE.md. Gli zip non entrano in git: ridistribuirli non è permesso.

Uso:  python scripts/importa-vtt.py [--elenca]
      --elenca: non importa niente, stampa solo cosa c'è dentro gli zip
                (serve la prima volta, per capire come sono nominati i file)
"""
import io
import os
import re
import sys
import zipfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DENTRO = os.path.join(ROOT, 'risorse-vtt')
FUORI = os.path.join(ROOT, 'webapp', 'vtt')
LATO = 1024          # un arredo puo' occupare piu' caselle: 1024 basta a 616px

# ---------------------------------------------------------------- che cercare
#
# Ogni voce: chiave del gioco -> liste di parole. Un file vale se il suo nome
# contiene TUTTE le parole di una lista; le liste si provano in ordine, e la
# prima che risponde vince. Le parole sono in inglese perche' i pacchetti lo
# sono, e minuscole perche' il confronto e' fatto in minuscolo.
ARREDI = {
    'casse':     [['crate', 'stack'], ['crates'], ['crate'], ['barrel', 'group'], ['barrel']],
    'molo':      [['bollard'], ['mooring'], ['rope', 'coil'], ['dock', 'post'], ['anchor']],
    'candele':   [['candle', 'group'], ['candles'], ['candle'], ['brazier']],
    'scrivania': [['desk'], ['writing', 'table'], ['table', 'small']],
    'branda':    [['bed', 'simple'], ['bedroll'], ['cot'], ['bed']],
    'scala':     [['stairs', 'stone'], ['staircase'], ['stairs']],
    'altare':    [['altar'], ['shrine'], ['sarcophagus']],
    'cella':     [['jail', 'bars'], ['prison', 'bars'], ['cell', 'door'], ['bars']],
    'forma':     [['cauldron'], ['basin'], ['vat'], ['barrel', 'open']],
    'scorie':    [['rubble'], ['debris'], ['rocks', 'small']],
    'crogiolo':  [['forge'], ['furnace'], ['smelter'], ['cauldron', 'fire']],
    'stufa':     [['stove'], ['fireplace'], ['oven']],
    'armadio':   [['wardrobe'], ['cupboard'], ['cabinet'], ['dresser']],
    'toeletta':  [['vanity'], ['dressing', 'table'], ['mirror', 'table']],
}

# i pavimenti: stessa idea, ma qui serve una piastrella grande e ripetibile
PAVIMENTI = {
    'assi':       [['floor', 'wood'], ['wooden', 'floor'], ['planks']],
    'lastricato': [['floor', 'cobble'], ['cobblestone'], ['floor', 'stone', 'rough']],
    'pietra':     [['floor', 'stone'], ['stone', 'tile'], ['dungeon', 'floor']],
    'mattonelle': [['floor', 'tile'], ['tiles'], ['floor', 'marble']],
    'mattoni':    [['floor', 'brick'], ['brick']],
    'terra':      [['floor', 'dirt'], ['dirt'], ['floor', 'earth'], ['sand']],
}

IMMAGINI = re.compile(r'\.(png|webp|jpg|jpeg)$', re.I)


def voci_zip():
    """Tutte le immagini dentro tutti gli zip, come (zip, nome interno)."""
    zips = sorted(f for f in os.listdir(DENTRO) if f.lower().endswith('.zip'))
    if not zips:
        sys.exit(f'nessuno zip in {os.path.relpath(DENTRO, ROOT)} — vedi il LEGGIMI')
    for z in zips:
        with zipfile.ZipFile(os.path.join(DENTRO, z)) as zf:
            for n in zf.namelist():
                if IMMAGINI.search(n) and not n.endswith('/'):
                    yield z, n


def scegli(voci, ricette):
    """Il primo file che risponde a una ricetta, ricette in ordine di preferenza."""
    for parole in ricette:
        for z, n in voci:
            basso = n.lower()
            if all(p in basso for p in parole):
                return z, n
    return None


def porta_dentro(z, nome, dove, quadrato):
    """Ritaglia il trasparente attorno, normalizza, salva PNG con alpha."""
    with zipfile.ZipFile(os.path.join(DENTRO, z)) as zf:
        img = Image.open(io.BytesIO(zf.read(nome))).convert('RGBA')
    # IL RITAGLIO E' LA META' DEL LAVORO: questi asset arrivano centrati in una
    # tela grande, e senza togliere il vuoto attorno un oggetto si ritrova
    # grande la meta' della casella che dovrebbe riempire.
    scatola = img.getbbox()
    if scatola:
        img = img.crop(scatola)
    if quadrato:
        lato = max(img.size)
        tela = Image.new('RGBA', (lato, lato), (0, 0, 0, 0))
        tela.paste(img, ((lato - img.width) // 2, (lato - img.height) // 2))
        img = tela
    img.thumbnail((LATO, LATO), Image.LANCZOS)
    img.save(dove, optimize=True)
    return img.size


def main():
    if not os.path.isdir(DENTRO):
        sys.exit(f'manca {os.path.relpath(DENTRO, ROOT)} — vedi il LEGGIMI')
    voci = list(voci_zip())

    if '--elenca' in sys.argv:
        for z, n in voci:
            print(f'{z}  ::  {n}')
        print(f'\n{len(voci)} immagini in totale')
        return

    os.makedirs(os.path.join(FUORI, 'arredi'), exist_ok=True)
    os.makedirs(os.path.join(FUORI, 'pavimenti'), exist_ok=True)
    presi, mancanti, righe = 0, [], []

    for chiave, ricette in ARREDI.items():
        trovato = scegli(voci, ricette)
        if not trovato:
            mancanti.append(chiave)
            continue
        z, n = trovato
        dove = os.path.join(FUORI, 'arredi', chiave + '.png')
        w, h = porta_dentro(z, n, dove, quadrato=False)
        righe.append(f'arredi/{chiave}.png  <-  {z} :: {n}')
        print(f'  {chiave:10s} <- {os.path.basename(n)}  {w}x{h}')
        presi += 1

    for chiave, ricette in PAVIMENTI.items():
        trovato = scegli(voci, ricette)
        if not trovato:
            mancanti.append('pavimento ' + chiave)
            continue
        z, n = trovato
        dove = os.path.join(FUORI, 'pavimenti', chiave + '.png')
        w, h = porta_dentro(z, n, dove, quadrato=True)
        righe.append(f'pavimenti/{chiave}.png  <-  {z} :: {n}')
        print(f'  pavimento {chiave:10s} <- {os.path.basename(n)}  {w}x{h}')
        presi += 1

    with open(os.path.join(FUORI, 'LICENZE.txt'), 'w', encoding='utf-8') as f:
        f.write('Arredi e pavimenti delle tessere di Spedizione.\n')
        f.write('Fonte: 2-Minute Tabletop — https://2minutetabletop.com\n')
        f.write('Licenza: CC BY-NC 4.0 — attribuzione obbligatoria, NESSUN uso commerciale.\n')
        f.write('Il vincolo vale anche per le tessere che ne derivano.\n')
        f.write('Credito da mostrare: «Mappe realizzate con asset di 2-Minute Tabletop».\n\n')
        f.write('\n'.join(righe) + '\n')

    print(f'\nOK {presi} pezzi in {os.path.relpath(FUORI, ROOT)}')
    if mancanti:
        print('non trovati (restano le sagome disegnate): ' + ', '.join(mancanti))
        print('se i pacchetti li hanno con un altro nome, aggiungi la parola'
              ' nelle ricette qui sopra, o guarda con --elenca')


if __name__ == '__main__':
    main()
