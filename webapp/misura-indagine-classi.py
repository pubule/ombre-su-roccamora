# -*- coding: utf-8 -*-
"""Quanta Indagine vede ogni squadra — tutte e 330 le combinazioni di 4 eroi.

Il pilota Playwright NON gioca l'Indagine (la semina come esito), quindi la
meta' investigativa della serata non ha mai avuto uno strumento. Questo non e'
un pilota: e' il conto esatto delle regole che stanno in `indagine.js`, tirate
con dadi veri su tutti e 21 gli episodi. Modella cio' che dipende dalla
squadra e nient'altro.

Il modello, dichiarato:
  - 6 ore, una per visita (`ore_budget` e `luogo.ore` dai dati veri);
  - Carla e Marani portano una visita gratuita a testa (+1 luogo ciascuno);
  - i luoghi visitati sono presi a caso fra i nove: nessuna squadra e'
    avvantaggiata dalla scelta, che dipende dalle deduzioni del tavolo;
  - per ogni Approfondimento del luogo, se qualcuno ha la carica del tipo (o
    il jolly di Sibilla) tira 2d6+ACUME contro 9 (Media). Riuscita: preso, la
    carica si spende. Fallita: la carica resta ma il luogo si chiude per
    questa visita — esattamente `approfondisci()`;
  - se nessuno e' idoneo, aiuto profano: 2d6 + il miglior ACUME contro 11
    (Difficile), una sola occasione per luogo — `aiutoProfano()`.

Cosa NON modella, e quindi sottostima: Ombra di Mora (sapere in anticipo
quanti e di che tipo), il Discernimento di Marani come oracolo, la macchina
fotografica di Carla, il Grimaldello di Nino. Sono tutti vantaggi
d'informazione, e vanno a favore delle squadre che gia' escono meglio o peggio
per altre ragioni: il numero qui sotto e' un pavimento, non una condanna.

  python webapp/misura-indagine-classi.py [partite-per-episodio]
"""
import itertools
import json
import os
import random
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')
N = int(sys.argv[1]) if len(sys.argv) > 1 else 200
random.seed(20260812)

CARICHE = {
    'ELENA FOSCO': {'Osservazione': 2},
    'DOTT. ATTILIO MARN': {'Referto': 1},
    'SIBILLA REVE': {'jolly': 1},
    'NINO': {},
    'OTTONE': {'Testimonianza': 1},
    'CARLA DOSTI': {'Testimonianza': 1},
    'DOTT. LAZZARO SERRA': {'Presagio': 1},
    'PADRE CELSO MARANI': {},
    'FULGENZIO CARBONE': {},
    'OTTAVIO BRERA': {'Referto': 1},
    'MORA': {},
}
ACUME = {'ELENA FOSCO': 3, 'DOTT. ATTILIO MARN': 2, 'SIBILLA REVE': 2, 'NINO': 2,
         'OTTONE': 1, 'CARLA DOSTI': 3, 'DOTT. LAZZARO SERRA': 3, 'PADRE CELSO MARANI': 2,
         'FULGENZIO CARBONE': 2, 'OTTAVIO BRERA': 3, 'MORA': 2}
BREVE = {'ELENA FOSCO': 'elena', 'DOTT. ATTILIO MARN': 'marn', 'SIBILLA REVE': 'sibilla',
         'NINO': 'nino', 'OTTONE': 'ottone', 'CARLA DOSTI': 'carla',
         'DOTT. LAZZARO SERRA': 'serra', 'PADRE CELSO MARANI': 'celso',
         'FULGENZIO CARBONE': 'carbone', 'OTTAVIO BRERA': 'brera', 'MORA': 'mora'}
EROI = list(CARICHE)
MEDIA, DIFFICILE = 9, 11
d2 = lambda: random.randint(1, 6) + random.randint(1, 6)

EPISODI = []
for e in ['preludio'] + [f'ep{i}' for i in range(1, 21)]:
    p = f'webapp/data/{e}.json'
    if not os.path.exists(p):
        continue
    d = json.load(open(p, encoding='utf-8'))
    EPISODI.append((e, [[a['tipo'] for a in (l.get('approfondimenti') or [])] for l in d['luoghi']],
                    d.get('ore_budget', 6)))


def partita(party, luoghi, ore):
    """Un'Indagine: quanti Approfondimenti finiscono in mano al gruppo."""
    resto = {nm: dict(CARICHE[nm]) for nm in party}
    visite = ore + sum(1 for nm in party if nm in ('CARLA DOSTI', 'PADRE CELSO MARANI'))
    scelti = random.sample(range(len(luoghi)), min(visite, len(luoghi)))
    profano_speso = set()
    presi = 0
    for i in scelti:
        chiuso = False                      # `scenaChiusa`: un fallimento e si esce
        for tipo in luoghi[i]:
            if chiuso:
                break
            idonei = [(ACUME[nm], nm, k) for nm in party
                      for k in (tipo, 'jolly') if resto[nm].get(k, 0) > 0]
            if idonei:
                _, nm, k = max(idonei, key=lambda x: (x[2] == tipo, x[0]))
                if d2() + ACUME[nm] >= MEDIA:
                    resto[nm][k] -= 1
                    presi += 1
                else:
                    chiuso = True
            elif i not in profano_speso:
                profano_speso.add(i)
                if d2() + max(ACUME[nm] for nm in party) >= DIFFICILE:
                    presi += 1
    return presi


righe = []
for party in itertools.combinations(EROI, 4):
    tot = 0
    for _, luoghi, ore in EPISODI:
        for _ in range(N // 20 or 1):
            tot += partita(party, luoghi, ore)
    righe.append((tot / (len(EPISODI) * (N // 20 or 1)), party))
righe.sort()

print(f'Approfondimenti colti per episodio — {len(righe)} squadre da 4 eroi, '
      f'{N // 20 or 1} partite × {len(EPISODI)} episodi ciascuna\n')
print('  peggiori 8')
for v, p in righe[:8]:
    print(f'   {v:4.1f}  {", ".join(BREVE[x] for x in p)}')
print('\n  migliori 8')
for v, p in righe[-8:]:
    print(f'   {v:4.1f}  {", ".join(BREVE[x] for x in p)}')
mediana = righe[len(righe) // 2]
print(f'\n  mediana {mediana[0]:.1f} ({", ".join(BREVE[x] for x in mediana[1])})')
print(f'  divario peggiore→migliore: {righe[0][0]:.1f} → {righe[-1][0]:.1f} '
      f'= ×{righe[-1][0] / max(righe[0][0], 0.01):.1f}')

# quanto pesa ogni eroe: media delle squadre che lo contengono
print('\n  quanto sposta ogni eroe (media delle squadre che lo hanno)')
for nm in sorted(EROI, key=lambda n: -sum(v for v, p in righe if n in p) / sum(1 for _, p in righe if n in p)):
    con = [v for v, p in righe if nm in p]
    print(f'   {BREVE[nm]:8} {sum(con) / len(con):4.1f}')

# copertura dei quattro tipi
print('\n  squadre cieche a un tipo (nessuna carica, solo aiuto profano)')
c = Counter()
for _, p in righe:
    for tipo, chi in [('Osservazione', {'ELENA FOSCO'}), ('Referto', {'DOTT. ATTILIO MARN', 'OTTAVIO BRERA'}),
                      ('Testimonianza', {'OTTONE', 'CARLA DOSTI'}), ('Presagio', {'DOTT. LAZZARO SERRA'})]:
        if not (set(p) & (chi | {'SIBILLA REVE'})):
            c[tipo] += 1
for tipo, n in c.most_common():
    print(f'   {tipo:14} {n}/{len(righe)} squadre = {100 * n / len(righe):.0f}%')
