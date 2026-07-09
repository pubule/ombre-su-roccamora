# -*- coding: utf-8 -*-
"""Ombre su Roccamora - ornamenti gotici e stile 'mappa a china'."""
import math
import random
from reportlab.lib.units import mm
from reportlab.lib import colors

# palette dark-fantasy per le carte
NIGHT   = colors.HexColor('#17141a')   # fondo carta minaccia
NIGHTR  = colors.HexColor('#1d1014')   # fondo carta luogo (retro)
ABYSS   = colors.HexColor('#0e1519')
GOLD_L  = colors.HexColor('#d8b25e')
GOLD    = colors.HexColor('#b68d3c')
GOLD_D  = colors.HexColor('#6e5522')
BONE    = colors.HexColor('#e8dcc0')
BLOOD   = colors.HexColor('#6e1420')
TEALGEM = colors.HexColor('#2e7d86')
INKMAP  = colors.HexColor('#3a2f22')   # china per le mappe


def scroll(c, x, y, s, flip=1, col=GOLD, lw=1.1):
    """Singolo ricciolo di filigrana (spirale a bezier)."""
    c.saveState()
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    p = c.beginPath()
    p.moveTo(x, y)
    p.curveTo(x + s*0.9*flip, y + s*0.15, x + s*1.05*flip, y + s*0.75, x + s*0.55*flip, y + s*0.8)
    p.curveTo(x + s*0.25*flip, y + s*0.83, x + s*0.2*flip, y + s*0.55, x + s*0.42*flip, y + s*0.5)
    c.drawPath(p)
    c.setFillColor(col)
    c.circle(x + s*0.42*flip, y + s*0.5, lw*0.9, fill=1, stroke=0)
    c.restoreState()


def filigree_corner(c, x, y, s, rot, col=GOLD):
    """Angolo con doppio ricciolo simmetrico + gemma."""
    c.saveState(); c.translate(x, y); c.rotate(rot)
    scroll(c, 2, 2, s, 1, col)
    c.saveState(); c.rotate(90); c.scale(1, -1)
    scroll(c, 2, 2, s, 1, col)
    c.restoreState()
    gem(c, s*0.28, s*0.28, s*0.14, BLOOD, col)
    c.restoreState()


def gem(c, x, y, r, fill=BLOOD, rim=GOLD):
    """Gemma a losanga sfaccettata."""
    c.saveState(); c.translate(x, y)
    c.setFillColor(fill); c.setStrokeColor(rim); c.setLineWidth(0.7)
    p = c.beginPath()
    p.moveTo(0, r); p.lineTo(r*0.75, 0); p.lineTo(0, -r); p.lineTo(-r*0.75, 0); p.close()
    c.drawPath(p, fill=1)
    c.setStrokeColor(colors.white); c.setStrokeAlpha(0.5); c.setLineWidth(0.4)
    c.line(-r*0.32, r*0.18, 0, r*0.55); c.line(0, r*0.55, r*0.32, r*0.18)
    c.setStrokeAlpha(1)
    c.restoreState()


def ornate_frame(c, x, y, w, h, base=NIGHT, col=GOLD, gems=True):
    """Cornice gotica: fondo scuro, doppi filetti oro, filigrane e gemme."""
    c.saveState()
    c.setFillColor(base); c.setStrokeColor(ABYSS); c.setLineWidth(1.4)
    c.rect(x, y, w, h, fill=1)
    # vignettatura interna (alone piu' chiaro al centro)
    cx, cy = x + w/2, y + h/2
    for k in range(5, 0, -1):
        c.setFillColor(colors.HexColor('#2a2430')); c.setFillAlpha(0.05)
        c.ellipse(cx - w*0.44*k/5, cy - h*0.44*k/5, cx + w*0.44*k/5, cy + h*0.44*k/5,
                  fill=1, stroke=0)
    c.setFillAlpha(1)
    m1, m2 = 2.6*mm, 4.0*mm
    c.setStrokeColor(GOLD_D); c.setLineWidth(2.2)
    c.rect(x + m1, y + m1, w - 2*m1, h - 2*m1)
    c.setStrokeColor(col); c.setLineWidth(0.8)
    c.rect(x + m1, y + m1, w - 2*m1, h - 2*m1)
    c.rect(x + m2, y + m2, w - 2*m2, h - 2*m2)
    s = min(w, h) * 0.14
    filigree_corner(c, x + m2 + 0.8*mm, y + m2 + 0.8*mm, s, 0, col)
    filigree_corner(c, x + w - m2 - 0.8*mm, y + m2 + 0.8*mm, s, 90, col)
    filigree_corner(c, x + w - m2 - 0.8*mm, y + h - m2 - 0.8*mm, s, 180, col)
    filigree_corner(c, x + m2 + 0.8*mm, y + h - m2 - 0.8*mm, s, 270, col)
    if gems:
        gem(c, x + w/2, y + m1, s*0.20, BLOOD, col)
        gem(c, x + w/2, y + h - m1, s*0.20, BLOOD, col)
        gem(c, x + m1, y + h/2, s*0.20, TEALGEM, col)
        gem(c, x + w - m1, y + h/2, s*0.20, TEALGEM, col)
    c.restoreState()


def banner(c, cx, cy, w, h, fill=BLOOD, rim=GOLD):
    """Targa a nastro con code a rondine per i titoli."""
    c.saveState()
    notch = h * 0.55
    # code
    c.setFillColor(colors.HexColor('#4a0d16'))
    for sgn in (-1, 1):
        p = c.beginPath()
        x0 = cx + sgn * (w/2 - 1)
        p.moveTo(x0, cy + h*0.32)
        p.lineTo(x0 + sgn*notch, cy)
        p.lineTo(x0, cy - h*0.32)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    # corpo
    c.setFillColor(fill); c.setStrokeColor(rim); c.setLineWidth(0.9)
    c.roundRect(cx - w/2, cy - h/2, w, h, h*0.18, fill=1)
    c.setStrokeColor(colors.white); c.setStrokeAlpha(0.18); c.setLineWidth(0.5)
    c.line(cx - w/2 + 2, cy + h/2 - 1.5, cx + w/2 - 2, cy + h/2 - 1.5)
    c.setStrokeAlpha(1)
    c.restoreState()


def medallion(c, cx, cy, r, col=GOLD):
    """Medaglione centrale a raggiera."""
    c.saveState()
    c.setStrokeColor(col); c.setLineWidth(1.3)
    c.circle(cx, cy, r)
    c.setLineWidth(0.6)
    c.circle(cx, cy, r*0.82)
    for k in range(16):
        a = k * math.pi / 8
        c.line(cx + math.cos(a)*r*0.86, cy + math.sin(a)*r*0.86,
               cx + math.cos(a)*r*0.97, cy + math.sin(a)*r*0.97)
    c.restoreState()


# ----------------------------------------------------------- stile 'a china'
def ink_line(c, x1, y1, x2, y2, seed=0, lw=1.1, col=INKMAP, wob=0.8):
    """Linea tremolante come tracciata a mano."""
    rnd = random.Random(seed)
    L = math.hypot(x2 - x1, y2 - y1)
    n = max(2, int(L / (4*mm)))
    nx, ny = -(y2 - y1)/max(L, 0.001), (x2 - x1)/max(L, 0.001)
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    p = c.beginPath(); p.moveTo(x1, y1)
    for k in range(1, n):
        t = k / n
        off = rnd.uniform(-wob, wob)
        p.lineTo(x1 + (x2-x1)*t + nx*off, y1 + (y2-y1)*t + ny*off)
    p.lineTo(x2, y2)
    c.drawPath(p)
    c.restoreState()


def ink_rect(c, x, y, w, h, seed=0, lw=1.1, col=INKMAP, double=False):
    ink_line(c, x, y, x + w, y, seed+1, lw, col)
    ink_line(c, x + w, y, x + w, y + h, seed+2, lw, col)
    ink_line(c, x + w, y + h, x, y + h, seed+3, lw, col)
    ink_line(c, x, y + h, x, y, seed+4, lw, col)
    if double:
        d = 1.1*mm
        ink_rect(c, x - d, y - d, w + 2*d, h + 2*d, seed + 40, lw*0.7, col)


def hatch_band(c, x, y, w, h, seed=0, col=INKMAP, step=1.7*mm, ang=45):
    """Tratteggio a china dentro un rettangolo (per spessore muri/ombre)."""
    rnd = random.Random(seed)
    c.saveState()
    p = c.beginPath(); p.rect(x, y, w, h); c.clipPath(p, stroke=0)
    c.setStrokeColor(col); c.setLineWidth(0.45); c.setStrokeAlpha(0.8)
    dx = step / math.sin(math.radians(ang))
    k = 0
    xx = x - h
    while xx < x + w + h:
        j = rnd.uniform(-0.4, 0.4)
        c.line(xx + j, y, xx + h + j, y + h)
        xx += dx; k += 1
    c.setStrokeAlpha(1)
    c.restoreState()


def stipple(c, x, y, w, h, seed=0, col=INKMAP, n=140):
    rnd = random.Random(seed)
    c.saveState(); c.setFillColor(col); c.setFillAlpha(0.55)
    for _ in range(n):
        c.circle(x + rnd.uniform(0, w), y + rnd.uniform(0, h),
                 rnd.uniform(0.15, 0.5), fill=1, stroke=0)
    c.setFillAlpha(1)
    c.restoreState()


def compass(c, cx, cy, r, col=INKMAP):
    c.saveState()
    c.setStrokeColor(col); c.setFillColor(col); c.setLineWidth(0.8)
    c.circle(cx, cy, r)
    c.circle(cx, cy, r*0.12, fill=1)
    for k, big in ((0, 1), (90, 0.55), (180, 0.55), (270, 0.55)):
        a = math.radians(k + 90)
        tip = (cx + math.cos(a)*r*big*1.35, cy + math.sin(a)*r*big*1.35)
        l = (cx + math.cos(a + 2.2)*r*0.22, cy + math.sin(a + 2.2)*r*0.22)
        rr = (cx + math.cos(a - 2.2)*r*0.22, cy + math.sin(a - 2.2)*r*0.22)
        p = c.beginPath(); p.moveTo(*tip); p.lineTo(*l); p.lineTo(cx, cy); p.lineTo(*rr); p.close()
        c.drawPath(p, fill=1, stroke=0)
    c.setFont('Helvetica', r*0.42)
    c.drawCentredString(cx, cy + r*1.45, 'N')
    c.restoreState()


# ---------------------------------------------------- icone tematiche carte
def icon_hood(c, cx, cy, s, col=GOLD_L):
    """Figura incappucciata."""
    c.saveState(); c.setStrokeColor(col); c.setFillColor(col); c.setLineWidth(1.2)
    p = c.beginPath()
    p.moveTo(cx - s*0.55, cy - s*0.7)
    p.curveTo(cx - s*0.6, cy + s*0.35, cx - s*0.3, cy + s*0.8, cx, cy + s*0.8)
    p.curveTo(cx + s*0.3, cy + s*0.8, cx + s*0.6, cy + s*0.35, cx + s*0.55, cy - s*0.7)
    p.close()
    c.drawPath(p, fill=0, stroke=1)
    p2 = c.beginPath()
    p2.moveTo(cx - s*0.3, cy + s*0.25)
    p2.curveTo(cx - s*0.15, cy - s*0.05, cx + s*0.15, cy - s*0.05, cx + s*0.3, cy + s*0.25)
    p2.curveTo(cx + s*0.18, cy + s*0.5, cx - s*0.18, cy + s*0.5, cx - s*0.3, cy + s*0.25)
    c.drawPath(p2, fill=1, stroke=0)
    c.restoreState()

def icon_trap(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.4)
    c.arc(cx - s*0.7, cy - s*0.5, cx + s*0.7, cy + s*0.9, 200, 140)
    for k in range(7):
        a = math.radians(200 + k * 140 / 6)
        x1 = cx + math.cos(a)*s*0.7; y1 = cy + s*0.2 + math.sin(a)*s*0.7
        c.line(x1, y1, cx + math.cos(a)*s*0.5, cy + s*0.2 + math.sin(a)*s*0.5)
    c.line(cx - s*0.8, cy - s*0.55, cx + s*0.8, cy - s*0.55)
    c.restoreState()

def icon_note(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setFillColor(col); c.setStrokeColor(col); c.setLineWidth(1.6)
    c.ellipse(cx - s*0.45, cy - s*0.75, cx + s*0.05, cy - s*0.35, fill=1)
    c.line(cx + s*0.03, cy - s*0.5, cx + s*0.03, cy + s*0.65)
    p = c.beginPath(); p.moveTo(cx + s*0.03, cy + s*0.65)
    p.curveTo(cx + s*0.35, cy + s*0.55, cx + s*0.4, cy + s*0.35, cx + s*0.55, cy + s*0.45)
    c.drawPath(p)
    c.restoreState()

def icon_eye(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.3)
    p = c.beginPath(); p.moveTo(cx - s*0.8, cy)
    p.curveTo(cx - s*0.3, cy + s*0.6, cx + s*0.3, cy + s*0.6, cx + s*0.8, cy)
    p.curveTo(cx + s*0.3, cy - s*0.6, cx - s*0.3, cy - s*0.6, cx - s*0.8, cy)
    c.drawPath(p)
    c.setFillColor(col); c.circle(cx, cy, s*0.22, fill=1)
    c.restoreState()

def icon_bell(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.4)
    p = c.beginPath()
    p.moveTo(cx - s*0.6, cy - s*0.35)
    p.curveTo(cx - s*0.55, cy + s*0.5, cx - s*0.25, cy + s*0.7, cx, cy + s*0.7)
    p.curveTo(cx + s*0.25, cy + s*0.7, cx + s*0.55, cy + s*0.5, cx + s*0.6, cy - s*0.35)
    c.drawPath(p)
    c.line(cx - s*0.75, cy - s*0.35, cx + s*0.75, cy - s*0.35)
    c.setFillColor(col); c.circle(cx, cy - s*0.55, s*0.14, fill=1)
    c.restoreState()

def icon_drip(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setFillColor(col)
    p = c.beginPath()
    p.moveTo(cx, cy + s*0.8)
    p.curveTo(cx + s*0.55, cy + s*0.05, cx + s*0.45, cy - s*0.5, cx, cy - s*0.5)
    p.curveTo(cx - s*0.45, cy - s*0.5, cx - s*0.55, cy + s*0.05, cx, cy + s*0.8)
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

def icon_smoke(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.3); c.setLineCap(1)
    for dx in (-s*0.35, 0, s*0.35):
        p = c.beginPath(); p.moveTo(cx + dx, cy - s*0.6)
        p.curveTo(cx + dx - s*0.25, cy - s*0.1, cx + dx + s*0.25, cy + s*0.2, cx + dx, cy + s*0.7)
        c.drawPath(p)
    c.restoreState()

def icon_spiral(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.3)
    r = s * 0.8
    a = 0.0
    p = c.beginPath(); p.moveTo(cx + r, cy)
    while a < math.pi * 5:
        a += 0.25
        rr = r * (1 - a / (math.pi * 5.4))
        p.lineTo(cx + math.cos(a)*rr, cy + math.sin(a)*rr)
    c.drawPath(p)
    c.restoreState()

def icon_anchor(c, cx, cy, s, col=GOLD_L):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(1.4)
    c.line(cx, cy + s*0.55, cx, cy - s*0.45)
    c.circle(cx, cy + s*0.65, s*0.14)
    c.line(cx - s*0.4, cy + s*0.25, cx + s*0.4, cy + s*0.25)
    c.arc(cx - s*0.6, cy - s*0.85, cx + s*0.6, cy + s*0.05, 200, 140)
    c.restoreState()


def icon_paw(c, cx, cy, s, col=GOLD_L):
    """Zampa: cuscinetto + tre dita."""
    c.saveState(); c.setFillColor(col)
    c.ellipse(cx - s*0.42, cy - s*0.65, cx + s*0.42, cy + s*0.1, fill=1, stroke=0)
    for dx in (-s*0.42, 0, s*0.42):
        c.circle(cx + dx, cy + s*0.42, s*0.2, fill=1, stroke=0)
    c.restoreState()


def icon_ladle(c, cx, cy, s, col=GOLD_L):
    """Mestolo colmo che gocciola."""
    c.saveState(); c.setStrokeColor(col); c.setFillColor(col); c.setLineWidth(1.5)
    c.line(cx + s*0.15, cy + s*0.05, cx + s*0.75, cy + s*0.8)
    p = c.beginPath()
    p.moveTo(cx - s*0.65, cy + s*0.1); p.lineTo(cx + s*0.25, cy + s*0.1)
    p.curveTo(cx + s*0.25, cy - s*0.45, cx - s*0.65, cy - s*0.45, cx - s*0.65, cy + s*0.1)
    c.drawPath(p, fill=1, stroke=0)
    c.circle(cx - s*0.2, cy - s*0.62, s*0.09, fill=1, stroke=0)
    c.circle(cx - s*0.05, cy - s*0.8, s*0.06, fill=1, stroke=0)
    c.restoreState()
