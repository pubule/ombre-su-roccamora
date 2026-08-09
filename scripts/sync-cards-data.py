# -*- coding: utf-8 -*-
"""Riallinea scripts/cardconjurer/cards-data.js ai testi dei fascicoli.

Il problema che risolve: `cards-data.js` e' una COPIA A MANO dei testi che
vivono in `src/gen_ep*.py`. Le carte fisiche (Luogo, Approfondimento) si
stampano da li', e `webapp/export-data.js` ne ricava `webapp/data/carte.json`.
Quindi una correzione fatta solo nel fascicolo non arriva mai al tavolo: e'
la radice del difetto gia' visto sulle soglie di Canto stampate sbagliate.

Cosa fa: importa i LUOGHI_N dei generatori, e per ogni Approfondimento
(chiave: numero di luogo + soggetto) e ogni testo di Luogo riscrive il campo
corrispondente in cards-data.js se diverge.

    python scripts/sync-cards-data.py            # elenca le divergenze
    python scripts/sync-cards-data.py --scrivi   # le applica

# ponytail: match per (episodio, n. luogo, soggetto). Se un soggetto viene
# rinominato la coppia non si trova piu' e lo script lo segnala come orfano
# invece di indovinare: meglio un report che una sostituzione sbagliata.
"""
import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
CARDS = os.path.join(ROOT, 'scripts', 'cardconjurer', 'cards-data.js')


def luoghi_per_episodio():
    """{n_ep: [luogo, ...]} dai generatori, senza passare da export-data."""
    import gen_cards
    import story
    story.apply(gen_cards.LUOGHI, gen_cards.TILES, gen_cards.NEMICI, gen_cards.HEROES, [])
    out = {1: gen_cards.LUOGHI}
    for n in range(2, 21):
        mod = __import__('gen_ep%d' % n)
        out[n] = getattr(mod, 'LUOGHI_%d' % n)
    return out


def blocchi_episodio(src):
    r"""Spezza cards-data.js nei blocchi di episodio. Ritorna [(n_ep, ini, fin)].

    Serve a non confondere due luoghi omonimi di episodi diversi (il Banco dei
    Pegni compare in cinque episodi, la Gazzetta in quattro).

    # ponytail: il banner `// ==== EPISODIO N` c'e' solo fino all'Ep. 13; dal
    # 14 in poi il blocco si apre con un commento che cita DESIGN-EPISODIO-N.md.
    # Agganciarsi al solo `EPISODIO \d+` prendeva la citazione a meta' blocco e
    # sfalsava tutte le finestre (l'Ep. 10 si chiudeva 100 righe troppo presto,
    # e dall'Ep. 14 in poi non si trovava piu' nulla). Qui: prima occorrenza
    # utile per ogni N, in ordine crescente, fine = inizio del successivo.
    """
    primo = {}
    for m in re.finditer(r'(?m)^//.*?EPISODIO[- ](\d+)', src):
        n = int(m.group(1))
        primo.setdefault(n, m.start())
    ordinati = sorted((pos, n) for n, pos in primo.items())
    # scarta i fuori-ordine (una citazione incrociata a un altro episodio)
    puliti, ultimo_n = [], 0
    for pos, n in ordinati:
        if n > ultimo_n:
            puliti.append((n, pos))
            ultimo_n = n
    return [(n, pos, puliti[i + 1][1] if i + 1 < len(puliti) else len(src))
            for i, (n, pos) in enumerate(puliti)]


def js_literal(s):
    """Testo python -> literal JS single-quoted, come lo scrive cards-data."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')


def sync(scrivi=False, solo=None):
    """`solo`: elenco di soggetti da toccare. Senza, riporta tutto e scrive
    tutto — sconsigliato in blocco: parte delle divergenze storiche sono
    accorciature volute per far stare il testo sulla carta, e vanno guardate
    a render prima di sovrascriverle."""
    src = io.open(CARDS, encoding='utf-8').read()
    fasce = blocchi_episodio(src)
    dati = luoghi_per_episodio()
    diff, orfani = [], []

    for n_ep, luoghi in sorted(dati.items()):
        fascia = [f for f in fasce if f[0] == n_ep]
        if not fascia:
            continue
        _, ini, fin = fascia[0]
        for L in luoghi:
            for a in L.get('approfondimenti', []) or []:
                sogg = a.get('soggetto')
                atteso = ' '.join((a.get('testo') or '').split())
                if not sogg or not atteso:
                    continue
                if solo is not None and sogg not in solo:
                    continue
                # cerca il blocco { tipo: ..., soggetto: '<sogg>', testo: '<...>' }
                pat = re.compile(
                    r"(soggetto:\s*'%s',\s*\n?\s*testo:\s*')((?:[^'\\]|\\.)*)(')"
                    % re.escape(js_literal(sogg)))
                m = pat.search(src, ini, fin)
                if not m:
                    orfani.append((n_ep, sogg))
                    continue
                attuale = ' '.join(m.group(2).replace("\\'", "'").split())
                if attuale != atteso:
                    diff.append((n_ep, sogg, attuale, atteso))
                    if scrivi:
                        src = src[:m.start(2)] + js_literal(atteso) + src[m.end(2):]
                        # gli offset a valle si spostano: rifai le fasce
                        fasce = blocchi_episodio(src)
                        f2 = [f for f in fasce if f[0] == n_ep][0]
                        ini, fin = f2[1], f2[2]

    for n_ep, sogg, prima, dopo in diff:
        # la lunghezza conta: la carta ha uno spazio fisico, e una divergenza
        # storica puo' essere un'accorciatura voluta per farcela stare
        cresce = ' [+%d caratteri: GUARDA IL RENDER]' % (len(dopo) - len(prima)) \
            if len(dopo) > len(prima) + 40 else ''
        print('EP%-3d %s  (%d -> %d)%s' % (n_ep, sogg, len(prima), len(dopo), cresce))
        print('   - %s' % prima[:150])
        print('   + %s' % dopo[:150])
    if orfani:
        print('\nApprofondimenti non trovati in cards-data.js (soggetto rinominato o carta assente):')
        for n_ep, s in orfani:
            print('   EP%-3d %s' % (n_ep, s))
    print('\n%d divergenze, %d orfani.' % (len(diff), len(orfani)))

    if scrivi and diff:
        io.open(CARDS, 'w', encoding='utf-8', newline='').write(src)
        print('cards-data.js aggiornato.')
    elif diff:
        print('(nessuna modifica scritta: rilancia con --scrivi)')
    return len(diff)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--scrivi', action='store_true')
    ap.add_argument('--solo', help='soggetti separati da ; (solo questi)')
    a = ap.parse_args()
    sys.exit(0 if sync(a.scrivi, a.solo.split(';') if a.solo else None) >= 0 else 1)
