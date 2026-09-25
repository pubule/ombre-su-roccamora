# -*- coding: utf-8 -*-
"""Ritaglia lo sfondo ai ritratti, per usarli come sagome in piedi (standee).

I ritratti in artworks/ sono a mezzo busto su sfondo pieno (folla, palazzi): sul
tabellone digitale finiscono dentro un token tondo, e della figura non resta
niente. Qui rembg toglie lo sfondo e resta la persona, che si puo' piantare in
piedi su un piano isometrico.

Una-tantum, NON in build-all.sh: serve solo al mockup
webapp/public/mockups/plancia/spedizione-iso.html. Se la direzione viene scelta,
i ritagli si spostano in artworks/ritagli/ con una riga in SORGENTI di
export-assets.py (che l'alfa dei PNG la conserva gia').

Uso: python scripts/ritaglia-personaggi.py [--rifai] [--sagome]
Serve: pip install rembg onnxruntime
"""
import os
import sys

from PIL import Image, ImageFilter

try:
    from rembg import new_session, remove
except ImportError:
    sys.exit('manca rembg — lancia:  pip install rembg onnxruntime')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# --sagome: bordo netto e contorno di cartoncino, per le pedine del plastico
# (webapp/public/mockups/tessere-alt/2-plastico.html)
SAGOME = '--sagome' in sys.argv
OUT = os.path.join(ROOT, 'webapp', 'public', 'mockups', 'ritagli-sagome' if SAGOME else 'ritagli')
LATO = 512          # lato lungo del PNG ritagliato
SFUMA = 0.12        # frazione bassa della figura che sfuma nel nulla
SOGLIA = 150        # alfa sotto cui e' nebbia rimasta attaccata, non figura
CORNICE = 7         # px di cartoncino attorno alla figura, come una fustella

# I soggetti del mockup (gli stessi di webapp/public/mockups/dati.js).
SOGGETTI = [
    'Elena.png', 'Attilio.png', 'Nino.png', 'Ottone.png', 'Sibilla.png',
    'Adepto Incappucciato.png', 'Cani dei Moli.png',
    'Il Custode della Cera (boss).png',
]


def sfuma_in_basso(img, frazione=SFUMA):
    """L'alfa svanisce verso il bordo basso.

    Il ritratto e' tagliato alla vita: senza questo la sagoma finisce di netto e
    si vede un busto mozzato appoggiato sul pavimento. Sfumandola, la figura si
    perde nell'ombra ai piedi e legge come una miniatura.
    """
    alfa = img.getchannel('A')
    h = img.height
    inizio = int(h * (1 - frazione))
    px = alfa.load()
    for y in range(inizio, h):
        k = (y - inizio) / max(1, h - inizio)          # 0 -> 1 scendendo
        f = 1 - k * k                                   # spegnimento morbido
        for x in range(img.width):
            v = px[x, y]
            if v:
                px[x, y] = int(v * f)
    img.putalpha(alfa)
    return img


def fustella(img):
    """La figura come esce da una fustella: alfa tutto-o-niente e un bordo di
    cartoncino attorno.

    rembg lascia attaccata la nebbia dei dipinti a mezza trasparenza: su un
    fantasma va bene, su una sagoma di cartone no — il cartone c'e' o non c'e'.
    Sotto SOGLIA si butta, poi apertura (Min poi Max) per togliere i puntini
    isolati. Il contorno e' l'alfa allargata di CORNICE px, riempita di crema.
    """
    import numpy as np
    from scipy import ndimage
    m = np.array(img.getchannel('A')) > SOGLIA
    m = ndimage.binary_opening(m, iterations=1)
    # solo il pezzo piu' grande: rembg lascia isole (una mano di un passante,
    # un lembo di nebbia) che sul cartone diventerebbero ritagli volanti
    lab, n = ndimage.label(m)
    if n > 1:
        m = lab == (np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1)
    m = ndimage.binary_fill_holes(m)
    a = Image.fromarray((m * 255).astype('uint8'))
    bbox = a.getbbox()
    pad = CORNICE + 2
    fig = img.crop(bbox); a = a.crop(bbox)
    W, H = fig.width + 2 * pad, fig.height + pad        # sotto niente bordo: poggia sulla basetta
    tela = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bordo = Image.new('L', (W, H), 0); bordo.paste(a, (pad, pad))
    # allargare con un disco e non con un quadrato, poi sfocare e ri-sogliare:
    # il contorno viene tondo come un taglio di fustella, non a gradini
    raggio = np.hypot(*np.mgrid[-CORNICE:CORNICE + 1, -CORNICE:CORNICE + 1]) <= CORNICE
    b = ndimage.binary_dilation(np.array(bordo) > 0, structure=raggio)
    b = ndimage.gaussian_filter(b.astype(float), 2.2) > .5
    bordo = Image.fromarray((b * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.7))
    a = a.filter(ImageFilter.GaussianBlur(.6))           # bordo della figura antialias
    tela.paste(Image.new('RGBA', (W, H), (236, 226, 200, 255)), (0, 0), bordo)
    fig.putalpha(a)
    tela.alpha_composite(fig, (pad, pad))
    return tela.crop((0, 0, W, pad + a.height))       # taglio dritto in basso


def ritaglia(nome, sessione, rifai):
    src = os.path.join(ROOT, 'artworks', nome)
    dst = os.path.join(OUT, nome)
    if not os.path.exists(src):
        print(f'  ! manca {nome} in artworks/')
        return False
    if not rifai and os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return False
    img = remove(Image.open(src).convert('RGBA'), session=sessione)
    bbox = img.getchannel('A').getbbox()
    if not bbox:
        print(f'  ! {nome}: rembg non ha trovato nessun soggetto')
        return False
    img = img.crop(bbox)
    img.thumbnail((LATO, LATO), Image.LANCZOS)   # prima rimpicciolisce: la
    img = fustella(img) if SAGOME else sfuma_in_basso(img)   # sfumatura e' un ciclo per pixel
    img.save(dst, optimize=True)
    print(f'  {nome} -> {img.width}x{img.height}')
    return True


def main():
    rifai = '--rifai' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    # u2net generico: fra i soggetti c'e' anche un cane, e u2net_human_seg lo
    # cancellerebbe. Se un ritaglio umano viene male, si guarda il PNG e si
    # decide li' — non prima.
    sessione = new_session('u2net')
    fatti = sum(ritaglia(n, sessione, rifai) for n in SOGGETTI)
    print(f'OK ritagli ({fatti} nuovi/aggiornati) in {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
