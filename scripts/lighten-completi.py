# -*- coding: utf-8 -*-
"""Schiarisce i PDF completi per la stampa (troppo scuri), agendo SOLO sulle
immagini incorporate — arte, tessere, copertine, dorsi delle carte — e NON sui
file artwork su disco né sul testo vettoriale (che resta nitido). I dorsi delle
carte sono arte scura senza overlay: qui li si rende leggibili alzando gamma e
luminosità della resa dentro il bundle di stampa.

Come: per ogni `*-Completo.pdf` si estrae ogni immagine raster (via PyMuPDF),
si applica una LUT di gamma + un leggero lift di luminosità (Pillow) e la si
reincorpora con `page.replace_image`. Le maschere alpha (smask) si saltano, per
non rovinare le trasparenze.

Uso:
  python scripts/lighten-completi.py                # tutti i *-Completo.pdf
  python scripts/lighten-completi.py "Comune/...Comune-Completo.pdf"   # uno solo

Nota: i completi sono artefatti rigenerabili (merge-print-all). Lanciare DOPO
il merge. Non è idempotente: rilanciarlo schiarisce di nuovo.
"""
import io
import os
import sys
import glob

import fitz  # PyMuPDF
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ponytail: unici due knob. Gamma <1 schiarisce le ombre (dove i dorsi
# affondano); consigliato 0.75–0.85. BRIGHT è un lift lineare gentile.
GAMMA = 0.80
BRIGHT = 1.10
JPEG_Q = 88

_LUT = [round(255 * ((i / 255.0) ** GAMMA)) for i in range(256)]


def _schiarisci(data, alpha_data=None):
    """bytes immagine -> bytes immagine schiarita. Se l'immagine ha alpha (propria
    o via smask esterno) la si preserva in RGBA PNG; altrimenti JPEG opaco."""
    im = Image.open(io.BytesIO(data))
    im.load()
    alpha = None
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        im2 = im.convert('RGBA')
        alpha = im2.getchannel('A')
        rgb = im2.convert('RGB')
    else:
        rgb = im.convert('RGB')
    rgb = rgb.point(_LUT * 3)                     # gamma sui 3 canali
    if BRIGHT != 1.0:
        rgb = ImageEnhance.Brightness(rgb).enhance(BRIGHT)
    # smask esterno (trasparenza separata, es. il sigillo): va fuso nell'immagine,
    # altrimenti replace_image scollega la maschera e lo sfondo diventa bianco
    if alpha_data is not None:
        a = Image.open(io.BytesIO(alpha_data)).convert('L')
        if a.size != rgb.size:
            a = a.resize(rgb.size)
        alpha = a
    out = io.BytesIO()
    if alpha is not None:
        rgba = rgb.convert('RGBA')
        rgba.putalpha(alpha)
        rgba.save(out, 'PNG')
    else:
        rgb.save(out, 'JPEG', quality=JPEG_Q)
    return out.getvalue()


def schiarisci_pdf(path):
    doc = fitz.open(path)
    # xref immagine per pagina, smask associato a ciascuna, e insieme degli smask
    prima_pagina = {}          # xref colore -> indice pagina che lo usa
    smask_of = {}              # xref colore -> xref smask (0 se nessuno)
    smasks = set()
    for pno in range(len(doc)):
        for img in doc[pno].get_images(full=True):
            xref, smask = img[0], img[1]
            prima_pagina.setdefault(xref, pno)
            smask_of.setdefault(xref, smask)
            if smask:
                smasks.add(smask)
    fatti = 0
    for xref, pno in prima_pagina.items():
        if xref in smasks:
            continue                              # e' una maschera alpha: gestita con la sua immagine colore
        try:
            info = doc.extract_image(xref)
            if not info or not info.get('image'):
                continue
            smx = smask_of.get(xref, 0)
            alpha_data = None
            if smx:
                sinfo = doc.extract_image(smx)
                alpha_data = sinfo['image'] if sinfo else None
            nuovo = _schiarisci(info['image'], alpha_data)
            doc[pno].replace_image(xref, stream=nuovo)
            fatti += 1
        except Exception as e:                    # immagine anomala: la lascio com'è
            print(f'    (salto xref {xref}: {e})')
    tmp = path + '.tmp'
    doc.save(tmp, deflate=True, garbage=3)
    doc.close()
    os.replace(tmp, path)
    return fatti, len(prima_pagina)


def main():
    args = sys.argv[1:]
    if args:
        files = [a if os.path.isabs(a) else os.path.join(ROOT, a) for a in args]
    else:
        files = sorted(glob.glob(os.path.join(ROOT, '**', 'Ombre-su-Roccamora-*-Completo.pdf'),
                                 recursive=True))
    if not files:
        print('nessun *-Completo.pdf trovato (lancia prima merge-print-all).')
        return
    for f in files:
        n, tot = schiarisci_pdf(f)
        print(f'schiarito {os.path.relpath(f, ROOT)} — {n}/{tot} immagini')
    print('OK lighten')


if __name__ == '__main__':
    main()
