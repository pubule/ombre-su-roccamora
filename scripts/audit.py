# -*- coding: utf-8 -*-
"""Auditor di campagna: regole, artefatti, ponti fra episodi, lessico.

Esce 0 se non trova nulla, 1 altrimenti. E' la condizione d'arresto del loop
di revisione: finche' stampa righe, c'e' lavoro.

    python scripts/audit.py              # report leggibile
    python scripts/audit.py --json       # per farci sopra uno script

Cosa NON fa: giudizi narrativi. Quelli restano a una lettura umana (o a un
agente), e non finiscono qui perche' non sarebbero decidibili. Qui stanno solo
i controlli che o passano o no.

# ponytail: un file solo, nessuna classe, nessun plugin system. I controlli
# sono funzioni che ritornano liste di finding; aggiungerne uno = una funzione
# in piu' nella lista CONTROLLI.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
DATA = os.path.join(ROOT, 'webapp', 'data')
sys.path.insert(0, SRC)

EPISODI = ['preludio'] + ['ep%d' % i for i in range(1, 21)]
STAT = {'ACUME', 'VIGORE', 'NERVI'}
DIFF = {'Facile', 'Media', 'Difficile'}


def F(codice, dove, msg):
    return {'codice': codice, 'dove': dove, 'msg': msg}


def sorgenti():
    """{nome file: testo} dei generatori di episodio."""
    out = {}
    for n in ['gen_preludio', 'gen_docs'] + ['gen_ep%d' % i for i in range(2, 21)]:
        p = os.path.join(SRC, n + '.py')
        if os.path.exists(p):
            out[n] = io.open(p, encoding='utf-8').read()
    return out


def dati():
    out = {}
    for k in EPISODI:
        p = os.path.join(DATA, '%s.json' % k)
        if os.path.exists(p):
            out[k] = json.load(io.open(p, encoding='utf-8'))
    return out


def unisci(src):
    """Ricompone i literal spezzati su piu' righe, per cercare frasi intere."""
    s = re.sub(r"'\s*\n\s*'", '', src)
    return re.sub(r'"\s*\n\s*"', '', s)


def testi_ad_alta_voce(ep):
    """(etichetta, testo) di tutto cio' che si legge verbatim ai giocatori."""
    fuori = []
    for i, L in enumerate(ep.get('luoghi', []), 1):
        for j, x in enumerate(L.get('indizi', []) or [], 1):
            fuori.append(('L%d indizio %d' % (i, j), x))
        for a in L.get('approfondimenti', []) or []:
            fuori.append(('L%d %s' % (i, a.get('soggetto', '?')), a.get('testo') or ''))
    for T in ep.get('tessere', []):
        fuori.append(('%s testo' % T['id'], T.get('testo') or ''))
    # della lettera conta solo il corpo: la coda in corsivo dopo la firma e' la
    # nota di allestimento componenti («Aperti dall'inizio…», «portate il
    # Fascicolo dall'Ep. 19»), che parla al tavolo e non alla finzione.
    lett = ep.get('lettera') or ''
    if '»' in lett:
        lett = lett[:lett.rindex('»') + 1]
    fuori.append(('lettera', lett))
    return [(e, t) for e, t in fuori if t]


# ------------------------------------------------------------------ REGOLE
def c_difficolta(src, dt):
    """Solo le prove di caratteristica: la parentesi dopo un «prova» qualsiasi
    puo' contenere di tutto (un rinvio, un effetto), e non e' una difficolta."""
    out = []
    pat = re.compile(r'\b(?:prova|Prova)\s+(?:di\s+)?(?:%s)[^().;]{0,10}\(([^)]{1,30})\)'
                     % '|'.join(STAT | {'DESTREZZA'}))
    for f, s in src.items():
        for m in pat.finditer(unisci(s)):
            d = m.group(1).strip()
            if any(q in d for q in '“”«»"'):
                continue          # e' una citazione fra virgolette, non una difficolta
            if d and d not in DIFF and not d.startswith('vedi'):
                out.append(F('R1', f, 'difficolta non canonica: «%s»' % d))
    return out


def c_caratteristiche(src, dt):
    """DESTREZZA e' colore per VIGORE: accostarla a NERVI mette in alternativa
    due caratteristiche reali senza dire chi sceglie.

    # ponytail: niente unisci() qui. Ricomponendo i literal spezzati due stat
    # citate in righe diverse del Regolamento sembravano una prova doppia.
    """
    out = []
    sinonimi = {'DESTREZZA': 'VIGORE'}
    valide = STAT | set(sinonimi)
    pat = re.compile(r'(prova|insidia|Prova|Insidia)[^.;\n]{0,20}\b([A-Z]{5,9})\s*(?:/|\bo\b)\s*([A-Z]{5,9})\b')
    for f, s in src.items():
        for m in pat.finditer(s):
            a, b = m.group(2), m.group(3)
            if a not in valide or b not in valide:
                continue
            if sinonimi.get(a, a) != sinonimi.get(b, b):
                out.append(F('R2', f, 'prova con due caratteristiche diverse: %s/%s' % (a, b)))
    return out


def c_prove_senza_difficolta(src, dt):
    out = []
    p = os.path.join(DATA, 'carte.json')
    if not os.path.exists(p):
        return out
    for c in json.load(io.open(p, encoding='utf-8')).get('minacce', {}).get('__tutte__', []) or []:
        pass  # struttura per episodio, sotto
    tutte = json.load(io.open(p, encoding='utf-8')).get('minacce', {})
    for ep, carte in tutte.items():
        for c in carte:
            r = c.get('rules', '')
            for m in re.finditer(r'prova\s+([A-Z/]{4,20})', r):
                coda = r[m.end():m.end() + 40]
                if not any('(%s)' % d in coda for d in DIFF):
                    out.append(F('R3', '%s/%s' % (ep, c.get('title', '?')),
                                 'prova «%s» senza difficolta dichiarata' % m.group(1)))
    return out


def c_soglie(src, dt):
    out = []
    comune = json.load(io.open(os.path.join(DATA, 'comune.json'), encoding='utf-8'))
    tetto_std = comune['regole']['canto_max']
    for k, ep in dt.items():
        tetto = ep.get('canto_max', tetto_std)
        o = ep.get('orologio') or {}
        for campo in ('su_canto', 'su_canto_con_oggetto'):
            v = o.get(campo)
            if v is not None and v > tetto:
                out.append(F('R4', k, '%s=%d oltre il tetto della traccia (%d)' % (campo, v, tetto)))
    return out


def c_scortato(src, dt):
    """Il Regolamento da' 3 caselle e nessuna Salute al PNG scortato: ogni
    deroga dev'essere dichiarata nel fascicolo."""
    out = []
    for k, ep in dt.items():
        for s in ep.get('scortato') or []:
            gen = os.path.join(SRC, 'gen_%s.py' % k)
            testo = io.open(gen, encoding='utf-8').read() if os.path.exists(gen) else ''
            dichiarata = 'deroga' in testo.lower()
            if s.get('mov', 3) != 3 and not dichiarata:
                out.append(F('R5', k, 'PNG «%s» con Movimento %s e nessuna deroga dichiarata'
                             % (s.get('nome'), s.get('mov'))))
            if s.get('salute') is not None and not dichiarata:
                out.append(F('R5', k, 'PNG «%s» ha Salute %s (i nemici dovrebbero ignorarlo) '
                             'e nessuna deroga dichiarata' % (s.get('nome'), s.get('salute'))))
    return out


def c_migliorie(src, dt):
    out = []
    for n in range(2, 21):
        f = 'gen_ep%d' % n
        if n == 20:
            continue  # il finale distribuisce le migliorie nell'epilogo di campagna
        if 'MIGLIORIE' not in src.get(f, ''):
            out.append(F('R6', f, 'nessuna riga MIGLIORIE: il Regolamento ne promette una a episodio'))
    return out


def c_domande(src, dt):
    out = []
    for k, ep in dt.items():
        d = ep['soluzione'].get('domande', [])
        busta = [x for x in d if not x.get('dopo_spedizione')]
        attese = 2 if k == 'preludio' else 4
        if len(busta) != attese:
            out.append(F('R7', k, '%d Domande nella busta, attese %d' % (len(busta), attese)))
    return out


def c_finestre(src, dt):
    """Un luogo bloccato che chiude prima di poter essere aperto e' morto."""
    out = []
    for k, ep in dt.items():
        inizio = 18
        for i, L in enumerate(ep.get('luoghi', []), 1):
            ch, ap = L.get('chiude'), L.get('apre')
            if ch is not None and ch <= (ap or inizio):
                out.append(F('R8', '%s L%d' % (k, i),
                             'finestra nulla: apre %s, chiude %s' % (ap or inizio, ch)))
    return out


# --------------------------------------------------------------- ARTEFATTI
def c_import(src, dt):
    out = []
    r = subprocess.run([sys.executable, '-c',
                        "import sys; sys.path.insert(0,%r)\n" % SRC +
                        "import gen_preludio, story, gen_cards\n" +
                        "[__import__('gen_ep%d'%i) for i in range(2,21)]"],
                       capture_output=True, text=True)
    if r.returncode:
        out.append(F('A1', 'src', 'un generatore non importa: %s' % (r.stderr or '').strip()[-300:]))
    return out


def c_data_allineati(src, dt):
    """webapp/data deve essere il riflesso dei generatori: se rilanciando
    l'export qualcosa cambia, i JSON in repo sono stantii."""
    out = []
    prima = {k: json.dumps(v, sort_keys=True, ensure_ascii=False) for k, v in dt.items()}
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'webapp', 'export-data.py')],
                       capture_output=True, text=True, cwd=ROOT)
    if r.returncode:
        out.append(F('A2', 'export-data.py', 'export fallito: %s' % (r.stderr or '').strip()[-200:]))
        return out
    for k, v in dati().items():
        if prima.get(k) != json.dumps(v, sort_keys=True, ensure_ascii=False):
            out.append(F('A2', k, 'webapp/data era stantio rispetto ai generatori (ora rigenerato)'))
    return out


def c_carte_stantie(src, dt):
    """Le frasi che una correzione ha tolto dai fascicoli non devono
    sopravvivere nelle carte fisiche o nei Reperti."""
    out = []
    # frasi intere, non frammenti: «vostra stessa penna» sopravvive legittima
    # dentro «o firma con la vostra stessa penna, o se l’è presa in casa vostra»
    vietate = [
        'ricciolo del Tessitore',
        'La mano che vi ha assunti scrive gli ordini',
        'paga da dove pagate voi',
        'Questi ordini sono suoi: non imitati, suoi',
        'E quello, signori, firma con la vostra stessa penna',
        'il posto più nascosto per una firma è in cima all’ordine',
        'La prima — i dispari',
        'da quindici mesi', 'di due inverni fa',
        # tornata dell'08/08, secondo giro
        'Il capostazione ricorda il nastro verde',
        'la squadra di scena di C.B.',
        'not. Grillanda',
        '⚠',                       # non esiste in nessuno dei font: stampa vuoto
        # tornata dell'08/08, sesto passaggio: conclusioni dette ad alta voce
        # durante l'Indagine, che sono materia della Contro-busta o dell'Ep. 18
        'è dentro casa nostra',
        'Il mostro ha il nostro volto',
        'È una delle nostre',
        'regista di scena di C.B.',
        # aritmetica dei Frammenti: 9+11, mai 10+10
        'si dividono in due metà',
        'metà erano il canto del sonno',
        'Otto erano il canto del sonno',
        # gli ammicchi a M. che l'Ep. 16 ha tolto per farlo respirare
        'la Società si abbassa a un caso così piccolo',
        'vi manda a caccia di un topo',
        'vi guarda da casa vostra',
        'chi vi ha mandato a prenderlo',
        'conservate una a una',
        # il manifesto RICERCATI esce all'alba, dopo la fuga dell'Ep. 18
        'quelli del manifesto',
        'quella del manifesto',
    ]
    # webapp/export-data.py e' la quarta superficie: una copia a mano dei testi,
    # che nessun controllo confrontava coi generatori. Le Domande dell'Ep. 18
    # vivono li', ed e' la ragione per cui la riscrittura how-to-prove non ci
    # era passata.
    for rel in ('scripts/cardconjurer/cards-data.js', 'scripts/reperti/generate-reperti.js',
                'webapp/export-data.py'):
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        # Spazi normalizzati: i template dei Reperti vanno a capo dentro la
        # frase, e il controllo assolveva chiunque spezzasse la riga — «C.B.
        # paga da dove pagate voi» e' sopravvissuta cosi' su un Reperto che il
        # gruppo si porta a casa.
        s = ' '.join(io.open(p, encoding='utf-8').read().split())
        for v in vietate:
            if ' '.join(v.split()) in s:
                out.append(F('A3', rel, 'copia stantia di una frase corretta nei fascicoli: «%s»' % v))
    return out


# ------------------------------------------------------- PONTI FRA EPISODI
def c_bivi(src, dt):
    out = []
    for n in range(2, 21):
        s = src.get('gen_ep%d' % n, '')
        if 'APERTURA' not in s or 'Bivio' not in s:
            out.append(F('P1', 'gen_ep%d' % n, 'non apre la busta del Bivio dell’episodio precedente'))
    if 'Bivio del Preludio' not in src.get('gen_docs', '') and 'BIVIO DEL PRELUDIO' not in src.get('gen_docs', ''):
        out.append(F('P1', 'gen_docs (Ep.1)', 'l’Episodio 1 non applica il Bivio del Preludio'))
    return out


def c_frammenti(src, dt):
    out = []
    visti = set()
    for f, s in src.items():
        for m in re.finditer(r'FRAMMENTO DI CAMPAGNA N\.?\s*(\d+)', unisci(s)):
            visti.add(int(m.group(1)))
    mancanti = [n for n in range(1, 21) if n not in visti]
    if mancanti:
        out.append(F('P2', 'campagna', 'Frammenti mancanti: %s' % mancanti))
    return out


def c_numeri_episodio_in_scena(src, dt):
    """«Ep. 3» dentro un testo letto ad alta voce rompe la finzione: dentro il
    mondo gli episodi non esistono."""
    out = []
    for k, ep in dt.items():
        for etichetta, t in testi_ad_alta_voce(ep):
            for m in re.finditer(r'\bEp\.?\s?\d+|\bEpisodio\s+\d+', t):
                out.append(F('P3', '%s %s' % (k, etichetta),
                             'riferimento fuori-fiction in un testo letto ad alta voce: «%s»' % m.group(0)))
    return out


# I nomi propri della campagna che devono restare univoci. Un bigramma
# Maiuscola+Maiuscola non basta a riconoscere una persona («Archivio Civico»,
# «San Teodoro», «Mappa Acustica» finivano tutti nel conto): serve una lista.
CAST = ['Anselmo', 'Ansaldo', 'Tobia', 'Bruna', 'Nina', 'Cesare', 'Amedeo',
        'Egidio', 'Silvano', 'Zaccaria', 'Ilario', 'Ruggero', 'Fedele',
        'Corrado', 'Ada', 'Emilio', 'Ivo', 'Tullio', 'Ludovico', 'Berto',
        'Achille', 'Ernesto', 'Silvio', 'Gaspare', 'Rocco', 'Ermete', 'Bastiano',
        'Casimiro', 'Prospero']


def c_omonimi(src, dt):
    """Due persone diverse con lo stesso nome di battesimo, in episodi diversi."""
    out = []
    noti = defaultdict(set)
    for k, ep in dt.items():
        blob = ' '.join(t for _, t in testi_ad_alta_voce(ep))
        for nome in CAST:
            for m in re.finditer(r'\b%s\b(?:\s+([A-Z][a-zàèéìòù]{3,}))?' % nome, blob):
                noti[nome].add((k, m.group(1) or '—'))
    for nome, occ in sorted(noti.items()):
        cognomi = {c for _, c in occ if c != '—'}
        if len(cognomi) > 1:
            out.append(F('P4', 'campagna',
                         'nome «%s» dato a persone diverse: %s'
                         % (nome, sorted('%s/%s' % (e, c) for e, c in occ if c != '—'))))
    return out


def c_cronologia(src, dt):
    """La campagna dichiara la propria durata: dev'essere una scala sola.

    Solo i numerali di scala-campagna: «da tre mesi» e «da undici mesi» sono
    durate interne alla finzione (una chiatta, una societa' anonima), non la
    lunghezza della caccia, e non vanno contate.
    """
    out = []
    # La scala CRESCE con la campagna: all'Ep. 16 sono sedici mesi, all'Ep. 18
    # diciotto. Non e' un'incoerenza avere numeri diversi — lo e' avere, in un
    # episodio, un numero che non corrisponde alla sua posizione.
    campagna = {'quattordici': 14, 'quindici': 15, 'sedici': 16, 'diciassette': 17,
                'diciotto': 18, 'diciannove': 19, 'venti': 20}
    for n in range(2, 21):
        f = 'gen_ep%d' % n
        for m in re.finditer(r'\b(%s)\s+mesi\b' % '|'.join(campagna), unisci(src.get(f, ''))):
            v = campagna[m.group(1)]
            # gli Ep. 19 e 20 accadono nelle notti subito dopo il 18: la caccia
            # resta «di diciotto mesi». Quindi il numero puo' restare indietro,
            # mai correre avanti.
            if not (n - 2 <= v <= n + 1):
                out.append(F('P5', f, 'dichiara «%s mesi» di caccia in un episodio che ne conta %d'
                             % (m.group(1), n)))
    return out


# ----------------------------------------------------------------- LESSICO
def c_reveal_anticipato(src, dt):
    """Frasi che pronunciano la soluzione dell'Ep. 18 prima dell'Ep. 18."""
    out = []
    spie = [
        'La stessa mano che scrive le vostre lettere',
        'la stessa mano che scrive le vostre lettere',
        'paga da dove pagate voi',
        'Questi ordini sono suoi: non imitati, suoi',
        'E quello, signori, firma con la vostra stessa penna',
    ]
    for n in list(range(2, 18)):
        s = unisci(src.get('gen_ep%d' % n, ''))
        for spia in spie:
            if spia in s:
                out.append(F('L1', 'gen_ep%d' % n,
                             'pronuncia la soluzione dell’Ep. 18: «%s»' % spia))
    return out


def c_nomi_luogo(src, dt):
    """Il nome di un Luogo sulla carta DEVE coincidere con quello del fascicolo.

    Non e' cosmesi: il gruppo dichiara la destinazione allo stradario leggendo
    la carta, e chi tiene il fascicolo la cerca nel proprio indice. Due grafie
    diverse dello stesso luogo sono due luoghi (successo con la
    Sagrestia/Sacrestia dei Battuti, Ep. 5).
    """
    out = []
    p = os.path.join(ROOT, 'scripts', 'cardconjurer', 'cards-data.js')
    if not os.path.exists(p):
        return out
    js = io.open(p, encoding='utf-8').read()
    # blocchi per episodio, stessa euristica di sync-cards-data.py
    primo = {}
    for m in re.finditer(r'(?m)^//.*?EPISODIO[- ](\d+)', js):
        primo.setdefault(int(m.group(1)), m.start())
    ordinati, ultimo = [], 0
    for pos, n in sorted((v, k) for k, v in primo.items()):
        if n > ultimo:
            ordinati.append((n, pos)); ultimo = n
    # l'Episodio 1 non ha un marcatore: le sue carte stanno PRIMA del primo
    # «EPISODIO 2». Senza questa riga il controllo aveva un punto cieco proprio
    # sull'episodio che tutti giocano per primo.
    if ordinati and ordinati[0][0] == 2:
        ordinati.insert(0, (1, 0))
    for i, (n_ep, ini) in enumerate(ordinati):
        fin = ordinati[i + 1][1] if i + 1 < len(ordinati) else len(js)
        ep = dt.get('ep%d' % n_ep)
        if not ep:
            continue
        for m in re.finditer(r"n: (\d+), nome: '((?:[^'\\]|\\.)*)'", js[ini:fin]):
            n_luogo, nome_carta = int(m.group(1)), m.group(2).replace("\\'", "'")
            luoghi = ep.get('luoghi') or []
            if not (1 <= n_luogo <= len(luoghi)):
                continue
            nome_fasc = luoghi[n_luogo - 1].get('nome') or ''
            if nome_carta.strip().lower() != nome_fasc.strip().lower():
                out.append(F('A6', 'ep%d L%d' % (n_ep, n_luogo),
                             'la carta dice «%s», il fascicolo «%s»' % (nome_carta, nome_fasc)))
    return out


def c_registro_narrativo(src, dt):
    """Il *contenuto* del registro non e' decidibile, ma la sua FORMA si': un
    id non si riusa, e ogni voce aperta deve avere uno stato leggibile."""
    out = []
    p = os.path.join(ROOT, 'AUDIT-NARRATIVA-APERTA.md')
    if not os.path.exists(p):
        return out
    t = io.open(p, encoding='utf-8').read()
    # Solo gli id DICHIARATI: un titolo `### N-nn`, o una riga della tabella
    # delle voci chiuse. I rimandi in prosa fra una voce e l'altra («e' N-03
    # alla lettera») sono legittimi e non sono definizioni.
    ids = (re.findall(r'^### (N-\d+) ·', t, re.M)
           + re.findall(r'^\|\s*(N-\d+)\s*\|', t, re.M))
    doppi = [i for i, n in Counter(ids).items() if n > 1]
    if doppi:
        out.append(F('A5', 'AUDIT-NARRATIVA-APERTA.md',
                     'id riusati nel registro: %s' % sorted('N-%s' % d for d in doppi)))
    for m in re.finditer(r'^### (N-\d+) · .+$', t, re.M):
        coda = t[m.end():m.end() + 200]
        if '**stato:' not in coda:
            out.append(F('A5', 'AUDIT-NARRATIVA-APERTA.md',
                         '%s non dichiara uno stato' % m.group(1)))
    return out


def c_build_completa(src, dt):
    """La build deve ricostruire i PDF di TUTTI gli episodi.

    Ne rigenerava due su ventuno: i fascicoli degli altri diciotto restavano
    indietro rispetto ai sorgenti a ogni correzione, e nessuno se ne accorgeva
    perche' i PDF sono committati.
    """
    out = []
    p = os.path.join(ROOT, 'build-all.sh')
    if not os.path.exists(p):
        return out
    s = io.open(p, encoding='utf-8').read()
    if 'seq 2 20' in s or all(('gen_ep%d.py' % n) in s for n in range(2, 21)):
        return out
    manca = [n for n in range(2, 21) if ('gen_ep%d.py' % n) not in s]
    out.append(F('A4', 'build-all.sh',
                 'la build non rigenera i PDF degli episodi %s' % manca))
    return out


CONTROLLI = [
    ('REGOLE', [c_difficolta, c_caratteristiche, c_prove_senza_difficolta, c_soglie,
                c_scortato, c_migliorie, c_domande, c_finestre]),
    ('ARTEFATTI', [c_import, c_data_allineati, c_carte_stantie, c_build_completa,
                  c_nomi_luogo, c_registro_narrativo]),
    ('PONTI', [c_bivi, c_frammenti, c_numeri_episodio_in_scena, c_omonimi, c_cronologia]),
    ('LESSICO', [c_reveal_anticipato]),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args()

    src, dt = sorgenti(), dati()
    tutti = []
    for famiglia, funzioni in CONTROLLI:
        for fn in funzioni:
            try:
                trovati = fn(src, dt) or []
            except Exception as e:                      # un controllo rotto e' un finding
                trovati = [F('XX', fn.__name__, 'controllo in errore: %r' % e)]
            for t in trovati:
                t['famiglia'] = famiglia
            tutti.extend(trovati)

    if args.json:
        print(json.dumps(tutti, ensure_ascii=False, indent=1))
    else:
        for famiglia, _ in CONTROLLI:
            righe = [t for t in tutti if t['famiglia'] == famiglia]
            if not righe:
                continue
            print('\n== %s (%d)' % (famiglia, len(righe)))
            for t in righe:
                print('  [%s] %-24s %s' % (t['codice'], t['dove'][:24], t['msg']))
        print('\n%d finding meccanici.' % len(tutti))
        # Il registro narrativo non blocca: e' il contenitore di cio' che
        # nessun controllo puo' decidere. Lo si stampa perche' resti visibile.
        led = os.path.join(ROOT, 'AUDIT-NARRATIVA-APERTA.md')
        if os.path.exists(led):
            t = io.open(led, encoding='utf-8').read()
            # solo gli stati che seguono un titolo `### N-nn`: in fondo al
            # registro c'e' un blocco d'esempio (`### N-nn · titolo`) che non
            # e' una voce e non va contato.
            stati = re.findall(r'^### N-\d+ · .+\n\*\*stato: (\w+)', t, re.M)
            aperte = stati.count('aperta')
            decise = stati.count('decisa')
            print('Registro narrativo: %d aperte, %d decise da eseguire '
                  '(AUDIT-NARRATIVA-APERTA.md) — non bloccano.' % (aperte, decise))
        if not tutti:
            print('Niente di meccanico da correggere: il loop puo fermarsi.')
    return 1 if tutti else 0


if __name__ == '__main__':
    sys.exit(main())
