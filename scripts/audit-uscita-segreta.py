# -*- coding: utf-8 -*-
"""Audit di coerenza fra la regola dell'USCITA SEGRETA e i PDF stampati.

Un episodio ha l'uscita segreta solo se il dato esiste (`scortato[0].uscita` in
webapp/data). Dove c'e', il fascicolo Spedizione deve dare all'arbitro la
battuta da leggere e il segreto; dove non c'e', «riportatelo in T1» e' giusto e
non va segnalato. Il Regolamento deve presentare la regola come CONDIZIONATA,
altrimenti contraddice gli episodi che non la usano.

Uso: python scripts/audit-uscita-segreta.py
"""
import fitz, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def testo(p):
    d = fitz.open(p); t = ''.join(d[i].get_text() for i in range(len(d))); d.close()
    return t

problemi = []

# --- Regolamento: la regola c'e' ed e' condizionata ------------------------
reg = 'Comune/pdf/Ombre-su-Roccamora-01-Regolamento.pdf'
if not os.path.exists(reg):
    problemi.append(f'{reg}: assente')
else:
    t = testo(reg)
    if 'via che conosce' not in t:
        problemi.append('Regolamento: manca la regola «La via che conosce»')
    elif 'in alcuni episodi' not in t:
        problemi.append('Regolamento: la regola non e\' condizionata — contraddice gli episodi che non la usano')

# --- episodi: coerenza dato <-> fascicolo ----------------------------------
for dati in sorted(glob.glob('webapp/data/ep*.json'), key=lambda p: int(re.search(r'\d+', os.path.basename(p)).group())):
    ep = json.load(open(dati, encoding='utf-8'))
    n = re.search(r'\d+', os.path.basename(dati)).group()
    sc = (ep.get('scortato') or [{}])[0]
    u = sc.get('uscita')
    fasc = f'Episodio {n}/pdf/Spedizione.pdf'
    if not os.path.exists(fasc):
        continue
    t = testo(fasc)
    if u:
        # dove l'uscita esiste, l'arbitro deve avere di che condurla
        if 'APPENA' not in t.upper():
            problemi.append(f'Ep.{n}: ha l\'uscita segreta ma il fascicolo non dice all\'arbitro quando annunciarla')
        if not re.search(r'SEGRETO|ALTARE|MOBILE', t.upper()):
            problemi.append(f'Ep.{n}: ha l\'uscita segreta ma il fascicolo non dice sotto quale arredo')
        print(f'Ep.{n}: uscita segreta in {u["tile"]} sotto {tuple(u["arredo"])} — fascicolo OK')
    else:
        print(f'Ep.{n}: nessuna uscita segreta (il rientro all\'ingresso resta l\'unica via) — coerente')

print()
if problemi:
    for p in problemi:
        print('  PROBLEMA:', p)
    print(f'\n{len(problemi)} PROBLEMI')
    sys.exit(1)
print('COERENTE: regola condizionata, e ogni episodio che ha l\'uscita la documenta all\'arbitro')
