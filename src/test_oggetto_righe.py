# -*- coding: utf-8 -*-
"""Controllo delle righe 'per chi arbitra' (gen_narrator.oggetto_righe) e del
patto che le regge: nessun tag meta puo' restare dentro un indizio, che si
legge ad alta voce.

    python src/test_oggetto_righe.py
"""
import ast
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_narrator import oggetto_righe                        # noqa: E402


def prova_forme():
    r = oggetto_righe([
        'Il Martello di Collaudo',                            # solo nome
        ('I Ramponi', 'sui tetti le cadute non vi feriranno'),  # nome + nota
        ('Esca', 'Il Timbro del Notaio', 'non inchioda Rasca'),
        ('Reperto A', 'il Diario di Ruggero', ''),            # stampato, non carta
        ('Incrocio D1', '', 'dove avviene lo scambio'),       # regola, senza carta
        ('Incrocio D3', '', ''),                              # regola nuda
    ])
    assert r[0] == '<b>Oggetto</b> — carta “Il Martello di Collaudo”', r[0]
    assert r[1] == ('<b>Oggetto</b> — carta “I Ramponi” — sui tetti le cadute '
                    'non vi feriranno'), r[1]
    assert r[2] == '<b>Esca</b> — carta “Il Timbro del Notaio” — non inchioda Rasca', r[2]
    assert r[3] == '<b>Reperto A</b> — il Diario di Ruggero', r[3]
    assert r[4] == '<b>Incrocio D1</b> — dove avviene lo scambio', r[4]
    assert r[5] == '<b>Incrocio D3</b>', r[5]
    assert oggetto_righe([]) == []


TAG = re.compile(r'<i>\((?:Ogget\w+|Esca|Reperto|Referto|Aggancio|Incrocio|D\d)', re.I)


def prova_indizi_puliti():
    """Gli indizi sono l'unico testo letto ad alta voce: un tag li' dentro
    e' una regola detta al tavolo - e per un'Esca, la risposta regalata."""
    sporchi = []
    radice = os.path.dirname(os.path.abspath(__file__))
    for path in glob.glob(os.path.join(radice, 'gen_ep*.py')) + \
            [os.path.join(radice, f) for f in ('gen_cards.py', 'gen_preludio.py')]:
        for nodo in ast.walk(ast.parse(open(path, encoding='utf-8').read())):
            if not (isinstance(nodo, ast.Call) and getattr(nodo.func, 'id', None) == 'dict'):
                continue
            for kw in nodo.keywords:
                if kw.arg != 'indizi':
                    continue
                try:
                    indizi = ast.literal_eval(kw.value)
                except Exception:
                    continue
                for testo in indizi:
                    if TAG.search(testo):
                        sporchi.append(f'{os.path.basename(path)}:{kw.value.lineno}')
    assert not sporchi, 'tag meta rimasti negli indizi: ' + ', '.join(sporchi)


if __name__ == '__main__':
    prova_forme()
    prova_indizi_puliti()
    print('OK oggetto_righe + indizi puliti')
