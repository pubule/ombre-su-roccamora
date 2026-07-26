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


# Le descrizioni estese sono lette ad alta voce al tavolo E mostrate al
# giocatore dalla webapp (webapp/export-data.py:DESC_LUOGHI). Valgono per loro
# le stesse regole degli indizi, piu' un tetto di lunghezza che il PDF non fa
# rispettare da solo.
# Il tetto e' una rete, non l'obiettivo: si scrive puntando a 900-1300, e a
# 1400 il corpo scende sotto i 9pt (piu' piccolo dell'Ep. 1, si nota). Il
# limite fisico oltre cui fit_desc sfonda il blocco indizi e' ~2500.
TETTO = 1400
TETTO_CHIAVE = 1350  # i luoghi bloccati perdono 6mm per la riga «si entra con…»
PAVIMENTO = 700      # sotto, e' una descrizione non ancora riscritta

# Lessico da design doc: non deve mai arrivare al tavolo.
VIETATE = re.compile(r'\bpay[- ]?off\b|\bincroci\w*\s+D\d|\bDomanda\s+\d'
                     r'|\bReperto\s+[A-Z]\b|\brivelatori\w+\b', re.I)
# Regole di gioco: vietate nei LUOGHI, ammesse VERBATIM nelle TESSERE (dove il
# pericolo d'ambiente e' parte della scena — PROMPT-ESPANSIONE.md:990-1008).
REGOLE = re.compile(r'\bprov[ae]\s+(NERVI|VIGORE|DESTREZZA|ACUME)\b', re.I)


_VUOTE = {'il', 'lo', 'la', 'i', 'le', 'gli', 'l', 'un', 'uno', 'una',
          'di', 'del', 'della', 'dei', 'delle', 'dello', 'd', 'da', 'al',
          'alla', 'e', 'che', 'per', 'con', 'in', 'a'}


def _piene(s):
    """Le parole che contano di una chiave: «LA CACCIA ALLA TALPA» -> 2."""
    return [p for p in re.split(r'[^0-9A-Za-zÀ-ÿ]+', s.lower())
            if p and p not in _VUOTE]


def _dizionari_desc(path):
    """(nome, {chiave: testo}, riga) di ogni LUOGHI*_DESC / TESSERE_DESC*."""
    for nodo in ast.walk(ast.parse(open(path, encoding='utf-8').read())):
        if not isinstance(nodo, ast.Assign):
            continue
        nome = getattr(nodo.targets[0], 'id', '')
        if not ((nome.startswith('LUOGHI') and nome.endswith('_DESC'))
                or nome.startswith('TESSERE_DESC')):
            continue
        try:
            yield nome, ast.literal_eval(nodo.value), nodo.lineno
        except Exception:
            continue


def prova_descrizioni(pavimento=False):
    """Tetto, lessico da design doc e parole-chiave in chiaro. Il pavimento
    e' opzionale: serve a scoprire le descrizioni non ancora riscritte, ma
    fallirebbe finche' la riscrittura non e' completa."""
    guai = []
    radice = os.path.dirname(os.path.abspath(__file__))
    for path in sorted(glob.glob(os.path.join(radice, 'gen_ep*.py'))) + \
            [os.path.join(radice, 'gen_narrator.py'), os.path.join(radice, 'gen_preludio.py')]:
        f = os.path.basename(path)
        for nome, dati, riga in _dizionari_desc(path):
            for k, testo in dati.items():
                dove = f'{f}:{riga} {nome}[{k!r}]'
                tetto = TETTO_CHIAVE if _ha_chiave(path, k) else TETTO
                if len(testo) > tetto:
                    guai.append(f'{dove} troppo lunga ({len(testo)} > {tetto})')
                if pavimento and len(testo) < PAVIMENTO:
                    guai.append(f'{dove} troppo corta ({len(testo)} < {PAVIMENTO})')
                m = VIETATE.search(testo) or (
                    None if nome.startswith('TESSERE') else REGOLE.search(testo))
                if m:
                    guai.append(f'{dove} lessico vietato: «{m.group(0)}»')
                # «esca» e' parola d'epoca legittima (si pesca con l'esca): e'
                # una fuga solo dove il luogo consegna davvero un'Esca.
                if re.search(r'\besc(a|he)\b', testo, re.I) and _da_esca(path, k):
                    guai.append(f'{dove} l’Esca e’ annunciata nel testo')
                # Una parola d'ordine vale uno sblocco: stamparla e' un regalo
                # ovunque compaia, non solo nella descrizione del luogo che
                # apre. Si controllano solo le chiavi di due parole piene o
                # piu': quelle di una sola («dogana», «chiatta») coincidono coi
                # nomi dei luoghi e darebbero falsi allarmi a raffica.
                _, nome_luogo = _chiave_di(path, k)
                for n_altro, (chiave, _) in _luoghi_del_file(path).items():
                    if not chiave or len(_piene(chiave)) < 2:
                        continue
                    if chiave.lower() not in testo.lower():
                        continue
                    if chiave.lower() in (nome_luogo or '').lower():
                        continue
                    # se la chiave e' gia' negli indizi di QUESTO luogo, la
                    # descrizione non regala niente: il tavolo la sente
                    # comunque un rigo dopo, nella stessa visita
                    if chiave.lower() in _voce_del_luogo(path, k):
                        continue
                    fonte = '' if n_altro == k else f' (apre il luogo {n_altro})'
                    guai.append(f'{dove} parola-chiave in chiaro: «{chiave}»{fonte}')
    assert not guai, 'descrizioni fuori norma:\n  ' + '\n  '.join(guai)


_LUOGHI = {}


def _luoghi_del_file(path):
    """{n: (parola-chiave o None, nome del luogo)} — serve sia per il tetto
    ridotto dei luoghi bloccati sia per non segnalare una chiave che e' gia'
    nel nome del luogo (P4 «La Dogana Vecchia», chiave «dogana»)."""
    if path in _LUOGHI:
        return _LUOGHI[path]
    m = {}
    for nodo in ast.walk(ast.parse(open(path, encoding='utf-8').read())):
        if isinstance(nodo, ast.Call) and getattr(nodo.func, 'id', None) == 'dict':
            kw = {k.arg: k.value for k in nodo.keywords}
            if 'n' not in kw or 'nome' not in kw:
                continue
            try:
                chiave = ast.literal_eval(kw['chiave'])[1] if 'chiave' in kw else None
                m[ast.literal_eval(kw['n'])] = (chiave, ast.literal_eval(kw['nome']))
            except Exception:
                pass
    _LUOGHI[path] = m
    return m


_ESCHE = {}


def _da_esca(path, n):
    """Il luogo n consegna davvero un'Esca? (OGGETTI_LUOGO*, etichetta 'Esca')"""
    if path not in _ESCHE:
        m = {}
        for nodo in ast.walk(ast.parse(open(path, encoding='utf-8').read())):
            if isinstance(nodo, ast.Assign) and \
                    getattr(nodo.targets[0], 'id', '').startswith('OGGETTI_LUOGO'):
                try:
                    m = ast.literal_eval(nodo.value)
                except Exception:
                    pass
        _ESCHE[path] = {k for k, v in m.items()
                        for x in v if not isinstance(x, str) and x[0] == 'Esca'}
    return n in _ESCHE[path]


_VOCI = {}


def _voce_del_luogo(path, n):
    """Tutto cio' che si legge visitando il luogo: indizi + req, minuscolo."""
    if path not in _VOCI:
        m = {}
        for nodo in ast.walk(ast.parse(open(path, encoding='utf-8').read())):
            if isinstance(nodo, ast.Call) and getattr(nodo.func, 'id', None) == 'dict':
                kw = {k.arg: k.value for k in nodo.keywords}
                if 'n' not in kw or 'indizi' not in kw:
                    continue
                try:
                    pezzi = list(ast.literal_eval(kw['indizi']))
                    if 'req' in kw:
                        pezzi.append(ast.literal_eval(kw['req']))
                    m[ast.literal_eval(kw['n'])] = ' '.join(pezzi).lower()
                except Exception:
                    pass
        _VOCI[path] = m
    return _VOCI[path].get(n, '')


def _chiave_di(path, n):
    return _luoghi_del_file(path).get(n, (None, None))


def _ha_chiave(path, n):
    return _luoghi_del_file(path).get(n, (None, None))[0] is not None


if __name__ == '__main__':
    prova_forme()
    prova_indizi_puliti()
    prova_descrizioni(pavimento='--pavimento' in sys.argv)
    print('OK oggetto_righe + indizi puliti + descrizioni')
