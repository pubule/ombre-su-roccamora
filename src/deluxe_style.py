# -*- coding: utf-8 -*-
"""Ombre su Roccamora - stile deluxe condiviso."""
import os
import random
from io import BytesIO
from PIL import Image
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'fonts')
ARTWORKS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'artworks')

INK = colors.HexColor("#33291f")
RED = colors.HexColor("#7a1f2b")
RED_DK = colors.HexColor("#571420")
TEAL = colors.HexColor("#1f5f6b")
TEAL_DK = colors.HexColor("#123c44")
PAPER = colors.HexColor("#f0e6cc")
PAPER_DK = colors.HexColor("#e2d3ac")
EDGE = colors.HexColor("#c8b184")
GOLD = colors.HexColor("#a8833a")
SEPIA = colors.HexColor("#8a7150")

F = dict(r='OldStd', b='OldStd-Bold', i='OldStd-Italic', sc='IMFellSC')

def register_fonts():
    try:
        pdfmetrics.registerFont(TTFont('OldStd', os.path.join(FONTS_DIR, 'OldStandard-Regular.ttf')))
        pdfmetrics.registerFont(TTFont('OldStd-Bold', os.path.join(FONTS_DIR, 'OldStandard-Bold.ttf')))
        pdfmetrics.registerFont(TTFont('OldStd-Italic', os.path.join(FONTS_DIR, 'OldStandard-Italic.ttf')))
        registerFontFamily('OldStd', normal='OldStd', bold='OldStd-Bold',
                           italic='OldStd-Italic', boldItalic='OldStd-Bold')
        pdfmetrics.registerFont(TTFont('IMFellSC', os.path.join(FONTS_DIR, 'IMFellEnglishSC.ttf')))
    except Exception:
        F.update(r='Times-Roman', b='Times-Bold', i='Times-Italic', sc='Times-Bold')

ROOT_DIR = os.path.dirname(ARTWORKS_DIR)
_art_cache = {}

# ponytail: reportlab embeds PNG art as raw deflate, not the source PNG's own
# compression - a full-res 2700px photo art costs 10+MB per embed even though
# it's only ever shown through a torn-paper window a fraction of the page.
# Downscale + re-encode once here (JPEG for opaque art, PNG for real alpha
# cutouts) instead of at every call site: this alone took the narrator PDF
# from 129MB (over GitHub's 100MB limit) to a few MB.
ART_MAX_PX = 1800

def art(name):
    """Cached ImageReader. A bare filename resolves under artworks/; a path
    containing a '/' (e.g. 'board/Episodio 1/T2 - Sala delle Casse.png') resolves
    relative to the repo root instead."""
    if name not in _art_cache:
        base = ROOT_DIR if '/' in name else ARTWORKS_DIR
        img = Image.open(os.path.join(base, name))
        if max(img.size) > ART_MAX_PX:
            scale = ART_MAX_PX / max(img.size)
            img = img.resize((round(img.width*scale), round(img.height*scale)), Image.LANCZOS)
        buf = BytesIO()
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img.convert('RGBA').save(buf, format='PNG', optimize=True)
        else:
            img.convert('RGB').save(buf, format='JPEG', quality=88)
        buf.seek(0)
        _art_cache[name] = ImageReader(buf)
    return _art_cache[name]

def parchment_art(c, w, h, name='background manuale.png'):
    """Full-bleed background using a real parchment texture artwork (instead of
    the procedural parchment() blobs), with the same edge-darkening vignette."""
    c.saveState()
    c.drawImage(art(name), 0, 0, width=w, height=h, preserveAspectRatio=False, mask='auto')
    for i, a in ((10*mm, 0.08), (5*mm, 0.10)):
        c.setFillColor(EDGE); c.setFillAlpha(a)
        c.rect(0, 0, w, i, fill=1, stroke=0); c.rect(0, h - i, w, i, fill=1, stroke=0)
        c.rect(0, 0, i, h, fill=1, stroke=0); c.rect(w - i, 0, i, h, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()

def _cover_image(c, img, x, y, w, h, top_margin=0, overscan=0.0):
    """Draws img to fill (x,y,w,h) with no gaps, cropping overflow (CSS
    background-size:cover), leaving `top_margin` of empty space above the
    image top (so a head doesn't sit exactly on a jagged torn-paper edge).
    `overscan` zooms in further beyond the tight cover-fit, giving slack to
    crop from the bottom instead (legs/lower body) without eating into the
    margin. All the spare height beyond top_margin is cropped off the bottom."""
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih) * (1 + overscan)
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) / 2.0
    dy = y + h - top_margin - dh
    c.drawImage(img, dx, dy, width=dw, height=dh, mask=None)

def torn_portrait(c, w, h, portrait_name, torn_name, window=(0.50, 0.0, 1.03, 0.51),
                  top_margin=0*mm, overscan=0.75):
    """Draws an image (hero portrait, but works for any scenic art) cover-fit
    to the torn window only (not the whole page: covering the full page would
    zoom into a random crop, since the window is much smaller than the page),
    then the torn-parchment sheet with its transparent cutout on top: the art
    shows through the hole, almost entirely visible, like a photo tucked under
    aged paper. `torn_name` must be an RGBA png with a real alpha cutout (see
    artworks/background scheda personaggio*.png). `window` is the cutout's
    bounding box as page fractions (x0, y0, x1, y1), y measured from the
    bottom; slightly oversized so the image bleeds past the torn edge."""
    c.saveState()
    x0, y0, x1, y1 = window
    _cover_image(c, art(portrait_name), x0*w, y0*h, (x1-x0)*w, (y1-y0)*h,
                top_margin=top_margin, overscan=overscan)
    c.drawImage(art(torn_name), 0, 0, width=w, height=h,
               preserveAspectRatio=False, mask='auto')
    for i, a in ((10*mm, 0.08), (5*mm, 0.10)):
        c.setFillColor(EDGE); c.setFillAlpha(a)
        c.rect(0, 0, w, i, fill=1, stroke=0); c.rect(0, h - i, w, i, fill=1, stroke=0)
        c.rect(0, 0, i, h, fill=1, stroke=0); c.rect(w - i, 0, i, h, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()

def parchment(c, w, h, seed=7):
    """Full-bleed aged paper background."""
    rnd = random.Random(seed)
    c.saveState()
    c.setFillColor(PAPER); c.rect(0, 0, w, h, fill=1, stroke=0)
    for _ in range(24):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        r = rnd.uniform(8*mm, 42*mm)
        c.setFillColor(PAPER_DK); c.setFillAlpha(rnd.uniform(0.05, 0.14))
        c.ellipse(x - r, y - r*rnd.uniform(0.35, 0.9), x + r, y + r*rnd.uniform(0.35, 0.9),
                  fill=1, stroke=0)
    # darkened edges
    for i, a in ((10*mm, 0.10), (5*mm, 0.14)):
        c.setFillColor(EDGE); c.setFillAlpha(a)
        c.rect(0, 0, w, i, fill=1, stroke=0); c.rect(0, h - i, w, i, fill=1, stroke=0)
        c.rect(0, 0, i, h, fill=1, stroke=0); c.rect(w - i, 0, i, h, fill=1, stroke=0)
    # ink specks
    c.setFillAlpha(0.35); c.setFillColor(SEPIA)
    for _ in range(46):
        c.circle(rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(0.2, 0.8), fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()

def corner_flourish(c, x, y, s, rot):
    c.saveState(); c.translate(x, y); c.rotate(rot)
    c.setStrokeColor(GOLD); c.setLineWidth(0.9)
    c.line(0, 0, s, 0); c.line(0, 0, 0, s)
    c.setFillColor(GOLD)
    c.saveState(); c.translate(s*0.62, s*0.62); c.rotate(45)
    c.rect(-s*0.09, -s*0.09, s*0.18, s*0.18, fill=1, stroke=0)
    c.restoreState()
    c.restoreState()

def rule_border(c, w, h, m1=7*mm, m2=9.5*mm):
    c.saveState()
    c.setStrokeColor(INK); c.setLineWidth(1.2)
    c.rect(m1, m1, w - 2*m1, h - 2*m1)
    c.setStrokeColor(GOLD); c.setLineWidth(0.6)
    c.rect(m2, m2, w - 2*m2, h - 2*m2)
    s = 7*mm
    corner_flourish(c, m2 + 1.5*mm, m2 + 1.5*mm, s, 0)
    corner_flourish(c, w - m2 - 1.5*mm, m2 + 1.5*mm, s, 90)
    corner_flourish(c, w - m2 - 1.5*mm, h - m2 - 1.5*mm, s, 180)
    corner_flourish(c, m2 + 1.5*mm, h - m2 - 1.5*mm, s, 270)
    c.restoreState()

def wave(c, x, y, w, col=TEAL, lw=1.4):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(lw)
    seg = w / 4.0
    p = c.beginPath(); p.moveTo(x, y)
    for i in range(4):
        x0 = x + i * seg
        p.curveTo(x0 + seg*0.25, y + 4, x0 + seg*0.75, y - 4, x0 + seg, y)
    c.drawPath(p); c.restoreState()

def triple_wave(c, cx, cy, w, col=GOLD, lw=1.6, gap=5*mm):
    for k, ww in enumerate((w, w*0.72, w*0.46)):
        wave(c, cx - ww/2, cy - k*gap, ww, col, lw)

def seal(c, x, y, r=13*mm, angle=-12):
    """Wax seal of the Societa del Lume: real photoreal art (artworks/Sigillo.png,
    background removed by saturation-key from the raw Sigillo.jpg) rotated and
    centered at (x, y), diameter ~2r like the old procedural version."""
    img = art('Sigillo.png')
    iw, ih = img.getSize()
    d = 2.05 * r
    dw, dh = d, d * ih / iw
    c.saveState()
    c.translate(x, y); c.rotate(angle)
    c.drawImage(img, -dw/2, -dh/2, width=dw, height=dh, mask='auto')
    c.restoreState()

def stone_floor(c, x, y, size, seed=3):
    """Running-bond stone pattern inside a square tile."""
    rnd = random.Random(seed)
    c.saveState()
    p = c.beginPath(); p.rect(x, y, size, size); c.clipPath(p, stroke=0)
    c.setFillColor(colors.HexColor('#e9ddbd')); c.rect(x, y, size, size, fill=1, stroke=0)
    row = size / 8.0
    c.setStrokeColor(colors.HexColor('#c3ae83')); c.setLineWidth(0.5)
    yy = y
    k = 0
    while yy <= y + size:
        c.line(x, yy, x + size, yy)
        off = (row if k % 2 else 0)
        xx = x - row + off
        while xx <= x + size:
            c.line(xx, yy, xx, min(yy + row, y + size))
            xx += 2*row
        yy += row; k += 1
    for _ in range(10):
        gx, gy = rnd.randint(0, 7), rnd.randint(0, 7)
        c.setFillColor(SEPIA); c.setFillAlpha(rnd.uniform(0.04, 0.10))
        c.rect(x + gx*row, y + gy*row, 2*row, row, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()

def water_band(c, x, y, w, h):
    c.saveState()
    c.setFillColor(colors.HexColor('#bcd4d2')); c.setFillAlpha(0.85)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillAlpha(1)
    n = int(w // (18*mm))
    for r in range(2):
        for i in range(n):
            wave(c, x + 4*mm + i*(w - 8*mm)/max(n, 1), y + h*0.3 + r*h*0.35,
                 12*mm, TEAL, 0.9)
    c.restoreState()

def candle(c, x, y, s=2.2*mm):
    c.saveState()
    c.setFillColor(colors.HexColor('#3d3d46'))
    c.rect(x - s*0.35, y, s*0.7, s*1.5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(x, y + s*1.9, s*0.42, fill=1, stroke=0)
    c.setFillColor(RED)
    c.circle(x, y + s*2.0, s*0.2, fill=1, stroke=0)
    c.restoreState()
