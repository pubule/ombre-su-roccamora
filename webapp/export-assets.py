# -*- coding: utf-8 -*-
"""Copie WEB delle immagini di gioco (mai toccare gli originali).

Carte jpg (Comune/Preludio/Episodio N -> cards/), tessere png (board/),
ritratti/arte utile (artworks/) ridimensionati a ~720px lato lungo in
webapp/assets/, stessa struttura di percorso. Idempotente: salta i file
gia' aggiornati (mtime sorgente <= destinazione).
"""
import json
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
    ('Episodio 8/cards', MAX_PX),
    ('Episodio 9/cards', MAX_PX),
    ('Episodio 10/cards', MAX_PX),
    ('Episodio 11/cards', MAX_PX),
    ('Episodio 12/cards', MAX_PX),
    ('Episodio 13/cards', MAX_PX),
    ('Episodio 14/cards', MAX_PX),
    ('Episodio 15/cards', MAX_PX),
    ('Episodio 16/cards', MAX_PX),
    ('Episodio 17/cards', MAX_PX),
    ('Episodio 18/cards', MAX_PX),
    ('Episodio 19/cards', MAX_PX),
    ('Episodio 20/cards', MAX_PX),
    ('Preludio/reperti', MAX_PX_TESSERE),
    ('Episodio 1/reperti', MAX_PX_TESSERE),
    ('Episodio 2/reperti', MAX_PX_TESSERE),
    ('Episodio 3/reperti', MAX_PX_TESSERE),
    ('Episodio 4/reperti', MAX_PX_TESSERE),
    ('Episodio 5/reperti', MAX_PX_TESSERE),
    ('Episodio 6/reperti', MAX_PX_TESSERE),
    ('Episodio 7/reperti', MAX_PX_TESSERE),
    ('Episodio 8/reperti', MAX_PX_TESSERE),
    ('Episodio 9/reperti', MAX_PX_TESSERE),
    ('Episodio 10/reperti', MAX_PX_TESSERE),
    ('Episodio 11/reperti', MAX_PX_TESSERE),
    ('Episodio 12/reperti', MAX_PX_TESSERE),
    ('Episodio 13/reperti', MAX_PX_TESSERE),
    ('Episodio 14/reperti', MAX_PX_TESSERE),
    ('Episodio 15/reperti', MAX_PX_TESSERE),
    ('Episodio 16/reperti', MAX_PX_TESSERE),
    ('Episodio 17/reperti', MAX_PX_TESSERE),
    ('Episodio 18/reperti', MAX_PX_TESSERE),
    ('Episodio 19/reperti', MAX_PX_TESSERE),
    ('Episodio 20/reperti', MAX_PX_TESSERE),
]

# tessere board: si esportano da OGNI cartella che ne ha (oggi Ep.1 ed Ep.2, i
# soli con le tessere stampate), e il nome si NORMALIZZA a «<TileId>.png». A
# monte i file sono «T1 - Nome della Tessera.png» con un nome che non coincide
# con quello del JSON (maiuscoletto, apostrofo tipografico o dritto a seconda
# dell'episodio): normalizzando qui, la webapp costruisce l'URL dal solo id.
BOARD_DIRS = ['Preludio/board'] + [f'Episodio {n}/board' for n in range(1, 21)]

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


# --------------------------------------------------------- icone e avvio PWA
# Le icone dell'app e le immagini di lancio, tutte dal sigillo della Societa'
# (artworks/Sigillo.png). Prima il manifest dichiarava «512x512» puntando al
# sigillo cosi' com'e', che 512x512 non lo e' mai stato: Android lo scartava.
TAVOLO = (11, 11, 13)          # --tavolo del fascicolo
SIGILLO = 'artworks/Sigillo.png'

# schermi coperti dallo splash di iOS: (larghezza, altezza, densita').
# Chi non e' in elenco ricade sul background_color, che e' quello giusto.
SCHERMI = [
    (390, 844, 3),    # iPhone 12/13/14
    (393, 852, 3),    # iPhone 14/15 Pro
    (430, 932, 3),    # iPhone Pro Max
    (810, 1080, 2),   # iPad 10.2
    (820, 1180, 2),   # iPad Air / Pro 11
    (1024, 1366, 2),  # iPad Pro 12.9
]


def _sigillo():
    return Image.open(os.path.join(ROOT, SIGILLO)).convert('RGBA')


def _quadrata(img, lato, margine=0.0, fondo=None):
    """Il sigillo centrato in un quadrato. `margine` e' la quota di lato
    lasciata libera attorno (serve alle maskable, che Android ritaglia)."""
    tela = Image.new('RGBA', (lato, lato), (fondo or (0, 0, 0, 0)))
    utile = int(lato * (1 - 2 * margine))
    s = img.copy()
    s.thumbnail((utile, utile), Image.LANCZOS)
    tela.paste(s, ((lato - s.width) // 2, (lato - s.height) // 2), s)
    return tela


def icone():
    """Icone dell'app e immagini di avvio. Sempre riscritte: sono poche e
    piccole, e un'icona vecchia rimasta indietro non si nota finche' non e'
    sullo schermo di casa di qualcuno."""
    src = _sigillo()
    out = os.path.join(OUT, 'icone')
    os.makedirs(out, exist_ok=True)
    fatti = 0

    # trasparenti: le usa Chrome/Android come icona «any»
    for lato in (192, 512):
        _quadrata(src, lato).save(os.path.join(out, f'icona-{lato}.png'))
        fatti += 1
    # maskable: Android ritaglia a cerchio o a quadratino, e senza margine di
    # sicurezza mangerebbe il bordo di ceralacca
    _quadrata(src, 512, margine=0.20, fondo=TAVOLO + (255,))         .save(os.path.join(out, 'icona-maskable-512.png'))
    fatti += 1
    # iOS ignora la trasparenza e ci mette il nero sotto: componiamo noi, cosi'
    # il bordo resta pulito. Niente alpha nel file finale.
    _quadrata(src, 180, margine=0.08, fondo=TAVOLO + (255,))         .convert('RGB').save(os.path.join(out, 'apple-touch-icon-180.png'))
    fatti += 1

    # avvio: il sigillo al centro del buio, come la schermata di caricamento
    for (w, h, d) in SCHERMI:
        for larga in (False, True):
            px = (h * d, w * d) if larga else (w * d, h * d)
            tela = Image.new('RGB', px, TAVOLO)
            s = src.copy()
            lato = int(min(px) * 0.28)
            s.thumbnail((lato, lato), Image.LANCZOS)
            tela.paste(s, ((px[0] - s.width) // 2, (px[1] - s.height) // 2), s)
            verso = 'landscape' if larga else 'portrait'
            tela.save(os.path.join(out, f'avvio-{w}x{h}@{d}x-{verso}.png'))
            fatti += 1
    print(f'OK icone e immagini di avvio ({fatti} file)')


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
    for rel in BOARD_DIRS:
        base = os.path.join(ROOT, rel)
        if not os.path.isdir(base):
            continue
        for f in os.listdir(base):
            if not f.lower().endswith('.png'):
                continue
            tile_id = f.split(' - ')[0].strip()     # «T1 - Nome.png» -> «T1»
            dst = os.path.join(OUT, rel, f'{tile_id}.png')
            if converti(os.path.join(base, f), dst, MAX_PX_TESSERE):
                fatti += 1
    # Il Preludio non ha tessere sue: riusa T1/T2/T4 dell'Episodio 1 (scelta di
    # gen_preludio.py, stampata nel suo Spedizione.pdf). Al tavolo lo dice il
    # testo; la webapp costruisce /assets/Preludio/board/<id>.png e senza queste
    # copie mostrava la mini-spedizione con le tessere vuote.
    with open(os.path.join(ROOT, 'webapp', 'data', 'preludio.json'), encoding='utf-8') as f:
        for t in json.load(f)['tessere']:
            dst = os.path.join(OUT, 'Preludio', 'board', t['id'] + '.png')
            if converti(os.path.join(ROOT, t['art']), dst, MAX_PX_TESSERE):
                fatti += 1
    art_dir = os.path.join(ROOT, 'artworks')
    for f in os.listdir(art_dir):
        if not f.lower().endswith(('.jpg', '.png')):
            continue
        if converti(os.path.join(art_dir, f), os.path.join(OUT, 'artworks', f), 900):
            fatti += 1
    print(f'OK assets webapp ({fatti} convertiti/aggiornati)')
    icone()


if __name__ == '__main__':
    main()
