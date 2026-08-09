# -*- coding: utf-8 -*-
"""Quanto della risposta alla Domanda 1 sta gia' nella lettera d'incarico.

La lettera pone il caso; l'Indagine deve dare il luogo. Quando la lettera
nomina gia' il posto che la D1 chiede di dedurre, la Domanda smette di essere
una domanda — e siccome la D1 esatta vale un vantaggio in Spedizione (di solito
«nessuna carta Minaccia al 1° round»), e' anche un vantaggio regalato.

    python scripts/misura-lettere.py

Diagnostica, non un cancello: la soglia giusta e' una scelta d'autore, e alcune
sovrapposizioni sono legittime (il luogo di partenza e' spesso un Luogo aperto,
e la lettera lo nomina apposta). Serve a vedere i casi estremi e a controllare
che una riscrittura abbia funzionato.

# ponytail: legge i JSON gia' esportati invece di parsare i generatori — stessa
# fonte che vede la webapp, e nessun parser di literal python da mantenere.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'webapp', 'data')

# parole grammaticali: non dicono nulla sul luogo
VUOTE = set('''a ad al alla alle allo agli ai anche che chi ci col come con cui da dai dal
dalla dalle dallo degli dei del della delle dello di e ed gli il in la le lo ma mi ne nei
nel nella nelle nello non per piu qui se si sono su sui sul sulla sulle suo sua tra tutti
un una uno vi dove cosa chi quando quale quali sotto sopra dentro fuori presso verso
serve conferma confermano piu' oltre dopo prima ancora'''.split())


def parole(s):
    s = re.sub(r'<[^>]+>', ' ', s or '').lower().replace('’', "'")
    fuori = set()
    for w in re.findall(r"[a-zàèéìòùç']{4,}", s):
        w = w.strip("'")
        if w and w not in VUOTE:
            fuori.add(w)
    return fuori


def corpo_lettera(ep):
    """Solo il corpo: la coda dopo la firma e' la nota di allestimento, che
    parla al tavolo (e nomina i luoghi aperti apposta)."""
    t = ep.get('lettera') or ''
    return t[:t.rindex('»') + 1] if '»' in t else t


def main():
    righe = []
    for k in ['preludio'] + ['ep%d' % i for i in range(1, 21)]:
        p = os.path.join(DATA, '%s.json' % k)
        if not os.path.exists(p):
            continue
        ep = json.load(io.open(p, encoding='utf-8'))
        dom = [d for d in ep['soluzione'].get('domande', []) if not d.get('dopo_spedizione')]
        if not dom:
            continue
        d1 = dom[0]
        if not d1['q'].strip().upper().startswith('DOVE'):
            righe.append((k, None, d1['q'][:46], []))
            continue
        # via le parentetiche: «(lo confermano L1+L4)» e' nota d'arbitro
        risposta = re.sub(r'\([^)]*\)', ' ', d1['risposta'])
        chiavi = parole(risposta)
        prese = sorted(chiavi & parole(corpo_lettera(ep)))
        quota = len(prese) / max(1, len(chiavi))
        righe.append((k, quota, d1['risposta'][:46], prese))

    print('%-9s %6s  %-48s %s' % ('episodio', 'quota', 'risposta alla D1', 'gia nella lettera'))
    print('-' * 108)
    for k, q, risp, prese in righe:
        if q is None:
            print('%-9s %6s  %-48s (D1 non e di luogo)' % (k, '—', risp))
            continue
        segno = '  <-- la lettera la regala' if q >= 0.6 else ''
        print('%-9s %5d%%  %-48s %s%s' % (k, round(q * 100), risp, ', '.join(prese) or '—', segno))
    peggio = [r for r in righe if r[1] is not None and r[1] >= 0.6]
    print('\n%d episodi sopra il 60%%.' % len(peggio))
    return 0


if __name__ == '__main__':
    sys.exit(main())
