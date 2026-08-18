# -*- coding: utf-8 -*-
"""Come verrebbe un asset 2-Minute Tabletop portato in «notte e nebbia».

Gli asset di 2MT sono disegnati a mano e CHIARI: inchiostro e colore piatto su
carta bianca. Il gioco e' scuro. Questa e' la ricetta che il generatore
applicherebbe — le stesse tre mosse del CSS, qui in Python per poterle guardare
fianco a fianco:

  1. si desatura, perche' il colore piatto e' squillante;
  2. si moltiplica per una velatura fredda (verso --tavolo #0c0e11);
  3. si accende una pozza di lanterna calda (--nastro #e8c27a) e si spengono i
     bordi.

Uso: python webapp/_prova-ritinta.py
"""
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

SRC = 'scatti/2mt/mappa.jpg'
FREDDO = (116, 142, 150)      # la velatura fredda
CALDO = (232, 194, 122)       # --nastro, il lume


def radiale(size, dentro, fuori, cx=0.5, cy=0.42, raggio=0.9):
    """Maschera tonda morbida, disegnata piccola e poi sfocata: fare i conti
    pixel per pixel su 760x643 costa secondi per niente."""
    w, h = size
    piccola = Image.new('L', (80, 68), fuori)
    d = ImageDraw.Draw(piccola)
    rx, ry = int(80 * raggio * 0.6), int(68 * raggio * 0.6)
    d.ellipse([int(80 * cx) - rx, int(68 * cy) - ry, int(80 * cx) + rx, int(68 * cy) + ry],
              fill=dentro)
    return piccola.filter(ImageFilter.GaussianBlur(14)).resize((w, h), Image.LANCZOS)


def ritinta(im):
    im = im.convert('RGB')
    im = ImageEnhance.Color(im).enhance(0.45)
    im = ImageChops.multiply(im, Image.new('RGB', im.size, FREDDO))
    # buio ai bordi
    buio = Image.new('RGB', im.size, (6, 8, 10))
    im = Image.composite(im, buio, radiale(im.size, 255, 45))
    # pozza di lanterna
    caldo = ImageChops.screen(im, Image.new('RGB', im.size, (60, 46, 24)))
    im = Image.composite(caldo, im, radiale(im.size, 210, 0, raggio=0.55))
    return ImageEnhance.Brightness(im).enhance(1.12)


def main():
    im = Image.open(SRC)
    stanza = im.crop((55, 45, 445, 375)).resize((760, 643), Image.LANCZOS)
    stanza.save('scatti/2mt/stanza-originale.jpg', quality=88)
    ritinta(stanza).save('scatti/2mt/stanza-ritinta.jpg', quality=88)

    a = Image.open('scatti/2mt/stanza-originale.jpg')
    b = Image.open('scatti/2mt/stanza-ritinta.jpg')
    doppia = Image.new('RGB', (a.width + b.width + 12, a.height), (12, 14, 17))
    doppia.paste(a, (0, 0))
    doppia.paste(b, (a.width + 12, 0))
    doppia.save('scatti/2mt/confronto.jpg', quality=88)
    print('fatto: scatti/2mt/confronto.jpg')


if __name__ == '__main__':
    main()
