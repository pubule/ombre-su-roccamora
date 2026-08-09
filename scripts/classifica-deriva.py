# -*- coding: utf-8 -*-
"""Classifica la deriva fra carte fisiche e fascicoli (N-09).

`sync-cards-data.py` conta le divergenze: sono un centinaio, e un centinaio di
diff non sono una decisione. Qui si separano i tre casi, perche' chiedono cose
diverse:

  A · REGOLA        la carta e il fascicolo non dicono lo stesso numero, la
                    stessa difficolta' o la stessa soglia. Non e' editoriale:
                    e' un difetto, e va corretto.
  B · FATTO         la carta non nomina un nome proprio o una cifra che il
                    fascicolo nomina. Da guardare: al tavolo si legge la carta,
                    e se quel nome serve a rispondere a una Domanda, manca.
  C · FORMA         stesso contenuto, carta piu' corta. E' voluto: la carta ha
                    uno spazio fisico. Si accetta e si dichiara.

Uso:
    python scripts/classifica-deriva.py            (riepilogo + lista A e B)
    python scripts/classifica-deriva.py --tutto    (anche le C, per lettura)
"""
import argparse
import importlib.util
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# sync-cards-data.py ha un trattino nel nome: si carica a mano
_spec = importlib.util.spec_from_file_location(
    'syncards', os.path.join(ROOT, 'scripts', 'sync-cards-data.py'))
_sync = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_sync)

# --- cosa rende una divergenza «di regola» ---------------------------------
# I gettoni che portano un obbligo al tavolo. Un numero che compare da una
# parte sola e' il caso peggiore: due copie della stessa carta che chiedono
# due prove diverse.
RX_NUMERO = re.compile(r'(?<![\w+−-])[0-9]+(?![\w°])')
RX_REGOLA = re.compile(
    r'\b(Facile|Media|Difficile|ACUME|VIGORE|NERVI|DESTREZZA|'
    r'soglia|round|ore|ora|danno|Ferite|Canto|incrocio|conferma|riga|righe)\b',
    re.I)
# nomi propri: maiuscola non a inizio frase, esclusi gli inizi di citazione
RX_PROPRIO = re.compile(r'(?<![.!?»:]\s)(?<!^)\b([A-ZÀÈÉÌÒÙ][a-zàèéìòù’]{2,})\b')

VUOTE = set('''Il Lo La I Gli Le Un Uno Una Nel Nella Sul Sulla Dal Dalla Del Della
Dei Degli Delle Ma E Se Che Chi Cosa Come Dove Quando Perche Non Si Ci Vi Ne Qui
Ora Poi Anche Ancora Solo Sono Era Erano Questo Questa Quello Quella'''.split())


def gettoni(s):
    """I gettoni che contano, normalizzati."""
    numeri = set(RX_NUMERO.findall(s))
    regole = {m.group(0).lower() for m in RX_REGOLA.finditer(s)}
    propri = {m.group(1) for m in RX_PROPRIO.finditer(s)} - VUOTE
    return numeri, regole, propri


def classifica(carta, fascicolo, titolo=''):
    nc, rc, pc = gettoni(carta)
    nf, rf, pf = gettoni(fascicolo)
    # A: un numero o una difficolta' che sta da una parte sola
    numeri_soli = (nc ^ nf)
    regole_sole = (rc ^ rf)
    if numeri_soli:
        return 'A', 'numeri solo da una parte: %s' % ', '.join(sorted(numeri_soli))
    if regole_sole & {'facile', 'media', 'difficile', 'acume', 'vigore', 'nervi', 'destrezza'}:
        return 'A', 'prova/difficolta\' solo da una parte: %s' % ', '.join(sorted(regole_sole))
    # B: un nome proprio che il fascicolo dice e la carta no.
    # Il confronto fra insiemi non basta: RX_PROPRIO scarta le maiuscole a
    # inizio frase, e siccome le due versioni spezzano le frasi in punti
    # diversi lo stesso nome risultava «perso» pur essendo li' («Ada lascio'
    # tutto», «Braga e' il conto piu' caro»). Un nome e' perso solo se sulla
    # carta non compare affatto.
    # il soggetto e' stampato sul fronte della carta («Testimone — Mola, alla
    # fine»): un corpo che non lo ripete non perde niente, e contarlo come
    # perso e' la stessa specie di falso positivo dei nomi a inizio frase.
    visibile = carta + ' ' + (titolo or '')
    persi = {w for w in (pf - pc) if w not in visibile}
    if persi:
        return 'B', 'la carta non nomina: %s' % ', '.join(sorted(persi)[:6])
    return 'C', 'stesso contenuto, %d caratteri in meno sulla carta' % (len(fascicolo) - len(carta))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tutto', action='store_true', help='elenca anche le C')
    args = ap.parse_args()

    # sync() stampa; qui serve la lista. Si rifa' la raccolta con le sue parti.
    src = io.open(_sync.CARDS, encoding='utf-8').read()
    fasce = _sync.blocchi_episodio(src)
    dati = _sync.luoghi_per_episodio()
    voci = []
    for n_ep, luoghi in sorted(dati.items()):
        fascia = [f for f in fasce if f[0] == n_ep]
        if not fascia:
            continue
        _, ini, fin = fascia[0]
        for L in luoghi:
            for a in L.get('approfondimenti', []) or []:
                sogg, atteso = a.get('soggetto'), ' '.join((a.get('testo') or '').split())
                if not sogg or not atteso:
                    continue
                pat = re.compile(
                    r"(soggetto:\s*'%s',\s*\n?\s*testo:\s*')((?:[^'\\]|\\.)*)(')"
                    % re.escape(_sync.js_literal(sogg)))
                m = pat.search(src, ini, fin)
                if not m:
                    continue
                attuale = ' '.join(m.group(2).replace("\\'", "'").split())
                if attuale != atteso:
                    voci.append((n_ep, sogg, attuale, atteso))

    gruppi = {'A': [], 'B': [], 'C': []}
    for n_ep, sogg, carta, fasc in voci:
        cl, perche = classifica(carta, fasc, sogg)
        gruppi[cl].append((n_ep, sogg, perche, carta, fasc))

    tot = len(voci)
    print('Deriva carte/fascicoli — %d divergenze\n' % tot)
    print('  A · REGOLA  %3d   la carta e il fascicolo non dicono lo stesso numero: da correggere'
          % len(gruppi['A']))
    print('  B · FATTO   %3d   la carta non nomina qualcosa che il fascicolo nomina: da guardare'
          % len(gruppi['B']))
    print('  C · FORMA   %3d   stesso contenuto, carta piu\' corta: e\' voluto' % len(gruppi['C']))

    if gruppi['A']:
        print('\n' + '=' * 78 + '\nA · DIVERGENZE DI REGOLA (da correggere)\n')
        for n_ep, sogg, perche, carta, fasc in gruppi['A']:
            print('EP%-3d %-42s %s' % (n_ep, sogg[:42], perche))
            print('   carta     : %s' % carta[:160])
            print('   fascicolo : %s' % fasc[:160])

    # Le B non sono tutte uguali. Quella che pesa e' la B il cui nome perduto
    # compare nella RISPOSTA a una Domanda: al tavolo si legge la carta, e se
    # il nome che chiude una Domanda non c'e', la carta non basta piu'. Le
    # altre sono colore, e una carta piu' corta se lo puo' permettere.
    if gruppi['B']:
        pesano, colore = [], []
        for n_ep, sogg, perche, carta, fasc in gruppi['B']:
            persi = perche.split(': ', 1)[1].split(', ')
            p = os.path.join(ROOT, 'webapp', 'data', 'ep%d.json' % n_ep)
            dom = ''
            if os.path.exists(p):
                import json
                d = json.load(io.open(p, encoding='utf-8'))
                dom = json.dumps((d.get('soluzione') or {}).get('domande') or [],
                                 ensure_ascii=False)
            caldi = [x for x in persi if x in dom]
            (pesano if caldi else colore).append((n_ep, sogg, caldi or persi))
        print('\n' + '=' * 78 + '\nB · FATTI CHE LA CARTA NON DICE\n')
        print('  che stanno in una risposta alle Domande — da guardare (%d)' % len(pesano))
        for n_ep, sogg, w in pesano:
            print('     EP%-3d %-42s %s' % (n_ep, sogg[:42], ', '.join(w)))
        print('\n  solo colore — la carta piu\' corta se lo puo\' permettere (%d)' % len(colore))
        for n_ep, sogg, w in colore:
            print('     EP%-3d %-42s %s' % (n_ep, sogg[:42], ', '.join(w)))

    if args.tutto and gruppi['C']:
        print('\n' + '=' * 78 + '\nC · SOLO FORMA (nessuna azione)\n')
        for n_ep, sogg, perche, _c, _f in gruppi['C']:
            print('EP%-3d %-42s %s' % (n_ep, sogg[:42], perche))

    return 0


if __name__ == '__main__':
    sys.exit(main())
