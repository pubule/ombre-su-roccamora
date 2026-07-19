# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 10 «La casa che ricorda».

Clone di simulate_ep9.py per la parte Indagine (generica), con una
SPEDIZIONE nuova: la CORSA ALLA DEMOLIZIONE (vedi DESIGN-EPISODIO-10.md).
Due tracce parallele:
  - DEMOLIZIONE (il Muratore abbatte il muro): sale di DEMO_BACKGROUND ogni
    round di traversata; all'intercapedine (T6) sale di DEMO_STRIKE ogni
    turno del Muratore in cui NESSUN eroe gli e' adiacente (inchiodato,
    attacca invece); le carte crescendo la fanno +1. Piena = SCONFITTA.
  - PROVA (gli eroi fotografano il corpo): a T6, gli eroi non impegnati a
    combattere documentano (+DOC_CAMERA con la Macchina, +DOC_NOCAMERA
    senza e con prova NERVI). Piena = VITTORIA.
Abbattere il Muratore ferma del tutto la demolizione (seconda via).

PONYTAIL: modello a blocco (non la griglia tattica 4x4 di simulate_ep9).
La tensione di questo episodio e' TEMPORALE (il muro che cade), non
l'affollamento fisico di una stanza: l'allocazione eroi->pinner/
combattente/documentatore cattura il vero trade-off (chi inchioda il
Muratore non fotografa). Se un domani serve la fisica reale, si clona il
motore tattico di simulate_ep9 - qui e' sovradimensionato.

Config di produzione condivisa (finale_v3, TICK_CANTO_OGNI, SOGLIA_CANTO,
CUSTODE_TENSIONE_EXTRA, SALUTE_BONUS_PER_N) importata da simulate_playtest:
INTOCCABILE. La curva si tara con le LEVE PER-EPISODIO qui sotto. Seed base
700000.
"""
import os
import random
import re
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from gen_cards import HEROES, NEMICI as NEMICI_COMUNI  # noqa: E402
from gen_ep10 import NEMICI_10  # noqa: E402
# Config di produzione CONDIVISA e INTOCCABILE (unica fonte: simulate_playtest).
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               CUSTODE_TENSIONE_EXTRA, SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_10)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

# Pool miniature nemici dell'episodio (garzoni del Muratore = Sgherri; pochi:
# è un episodio d'orrore, non d'accerchiamento). Esportato per la webapp.
TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
DEMOLIZIONE_MAX = 12   # caselle della traccia Demolizione (piena = sconfitta)
PROVA_MAX = 14         # caselle della traccia Prova (piena = vittoria)
DEMO_BACKGROUND = 1    # +Demolizione a fine di ogni round di traversata
DEMO_STRIKE = 2        # +Demolizione per turno del Muratore NON inchiodato (T6)
DOC_CAP = 2            # documentatori per round (fino a 2 al muro: uno regge la lastra, uno il lampo)
DOC_CAMERA = 2         # +Prova per documentatore, con la Macchina Fotografica
DOC_NOCAMERA = 1       # +Prova per documentatore, senza (e con prova NERVI)

# ============================ MAZZO MINACCIA (21: 6/8/3/4) ==================
# tipo: 'spawn' (garzone Sgherro), 'insidiaA' (ogni eroe NERVI Facile, perde
# azione), 'insidiaB' (l'eroe piu' esposto NERVI Media, 1 danno), 'insidiaC'
# (l'eroe con meno NERVI, Media, 1 danno), 'crescendo' (+Canto +Demolizione),
# 'quiete'/'favore'/'ostacolo'/'danno'. `subito` = lo spawn si attiva subito.
MINACCE = [
    ('I GARZONI DEL MURATORE', 'spawn', False),
    ('IL MANOVALE SPAVENTATO', 'spawn', False),
    ('ORDINI DAL DEPOSITO', 'spawn', True),
    ('CHI NON DEVE SALIRE', 'spawn', False),
    ('LA RONDA DEL CANTIERE', 'spawn', False),
    ('IL FISCHIO DI BORTOLO', 'spawn', True),
    ('LA VOCE CHE URLA', 'insidiaA', False),
    ('IL NOME SUSSURRATO', 'insidiaB', False),
    ('LA PARETE CHE SUDA CALCE', 'insidiaB', False),
    ('L’ECO DEL COLPO', 'insidiaA', False),
    ('LA NINNANANNA DI ADA', 'insidiaC', False),
    ('IL RESPIRO NEL MURO', 'insidiaB', False),
    ('IL SILENZIO IMPROVVISO', 'insidiaA', False),
    ('LA CASA TREMA', 'insidiaB', False),
    ('IL PRIMO COLPO DI MAZZA', 'crescendo', False),
    ('LA CREPA SI ALLARGA', 'crescendo', False),
    ('IL MURO GEME', 'crescendo', False),
    ('UN RAGGIO DI LUNA', 'quiete', False),
    ('UNA CREPA MOSTRA LA VIA', 'favore', False),
    ('CALCINACCI SUL PASSO', 'ostacolo', False),
    ('UN MATTONE DALL’ALTO', 'danno', False),
]

# Rivelatorio Domanda 2 (chi l'ha uccisa = Corrado), 3 carte in aperti:
# L2-Testimonianza, L3-Referto, L4-Testimonianza.
CHI_ESPLICITO = {(2, 'Testimonianza'), (3, 'Referto'), (4, 'Testimonianza')}


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)


def roll2d6():
    a, b = random.randint(1, 6), random.randint(1, 6)
    return a + b


def check(log, chi, stat_label, stat_val, diff_name, extra=0):
    s = roll2d6()
    tot = s + stat_val + extra
    ok = tot >= DIFF[diff_name]
    log(f'    [PROVA {stat_label}] {chi}: 2d6={s} +{stat_label}({stat_val})'
        f'{f" +{extra}" if extra else ""} = {tot} vs {diff_name}({DIFF[diff_name]}) '
        f'-> {"SUCCESSO" if ok else "FALLITA"}')
    return ok


class Logger:
    def __init__(self, path):
        self.f = open(path, 'w', encoding='utf-8')

    def __call__(self, line=''):
        self.f.write(line + '\n')

    def close(self):
        self.f.close()


class NullLogger:
    def __call__(self, line=''):
        pass

    def close(self):
        pass


# ================================================================ INDAGINE
# Luoghi Indagine (compatti). Chiavi tutte da aperti (L1-L4), doppia via.
# camera=L9 (D4, Macchina Fotografica); pianta=L5 (salta T2); ritratto=L6
# (+1 NERVI); incrocio_d1 (L1,L3), incrocio_d3 (L2,L4,L5).
LUOGHI_SIM = [
    dict(n=1, nome='La Casa che Ricorda', req=None, chiude=None,
         sblocca_parola=('LA CALCE DEL RESTAURO', 'IL MURO CHE RICORDA', 'UNA PROVA CHE RESTI'),
         approf=['Osservazione'], incrocio_d1=True, sblocca_camera=True),
    dict(n=2, nome='La Corte della Faenza', req=None, chiude=None,
         sblocca_parola=('LA CALCE DEL RESTAURO', 'LA SABBIA BUONA DEL BORGO'),
         approf=['Testimonianza'], incrocio_d3=True),
    dict(n=3, nome='L’Archivio Civico', req=None, chiude=None,
         sblocca_parola=('IL MURO CHE RICORDA', 'L’ABBANDONO DEL TETTO CONIUGALE'),
         approf=['Referto'], incrocio_d1=True),
    dict(n=4, nome='La Gendarmeria', req=None, chiude=None,
         sblocca_parola=('L’ABBANDONO DEL TETTO CONIUGALE', 'LA SABBIA BUONA DEL BORGO',
                         'UNA PROVA CHE RESTI'),
         approf=['Testimonianza'], incrocio_d3=True, sblocca_camera=True),
    dict(n=5, nome='Il Deposito del Muratore', req=('parola', 'LA CALCE DEL RESTAURO'),
         chiude=None, approf=['Referto'], pianta=True, incrocio_d3=True),
    dict(n=6, nome='L’Intercapedine', req=('parola', 'IL MURO CHE RICORDA'),
         chiude=None, approf=['Presagio'], ritratto=True),
    dict(n=7, nome='La Casa del Vedovo', req=('parola', 'L’ABBANDONO DEL TETTO CONIUGALE'),
         chiude=None, approf=['Osservazione']),
    dict(n=8, nome='La Fornitura del Borgo', req=('parola', 'LA SABBIA BUONA DEL BORGO'),
         chiude=20, approf=['Referto']),
    dict(n=9, nome='La Bottega del Fotografo', req=('parola', 'UNA PROVA CHE RESTI'),
         chiude=21, approf=['Osservazione'], camera=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 10: "La casa che ricorda"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    camera = pianta = ritratto = False
    incroci_d1 = incroci_d3 = 0
    approf_letti = approf_falliti = 0
    chi_confermato = False
    charges = {n: dict(INDAGINE_UNLOCK.get(n, {})) for n in party}
    secondo_fiato = {n: True for n in party}

    tipi_coperti, ha_jolly = set(), False
    for n in party:
        for tipo in INDAGINE_UNLOCK.get(n, {}):
            if tipo == 'jolly':
                ha_jolly = True
            else:
                tipi_coperti.add(tipo)
    if ha_jolly:
        tipi_coperti |= {'Osservazione', 'Testimonianza', 'Referto', 'Presagio'}

    def raggiungibile(l):
        if ora_corrente >= (l['chiude'] or 99):
            return False
        req = l.get('req')
        if req is None:
            return True
        return req[1] in parole

    def punteggio(l):
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        # La Macchina Fotografica (D4) è l'oggetto indispensabile e la sua
        # bottega chiude presto: un tavolo vero sblocca subito la sua chiave
        # (visita L1/L4) prima che sia troppo tardi. Priorità appena sotto il
        # rischio d'orario, sopra tutto il resto.
        cam_pri = 0 if (not camera and l.get('sblocca_camera')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('camera') and not camera)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, cam_pri, missione, strutturale, urgenza, copertura, l['n'])

    def tenta_approf(l):
        nonlocal approf_letti, approf_falliti, chi_confermato
        for tipo in l['approf']:
            idoneo = next((n for n in party if charges[n].get(tipo, 0) > 0
                           or charges[n].get('jolly', 0) > 0), None)
            if idoneo:
                usa_jolly = charges[idoneo].get(tipo, 0) <= 0
                charges[idoneo]['jolly' if usa_jolly else tipo] -= 1
                approf_letti += 1
                log(f'    [APPROFONDIMENTO {tipo}] sbloccato da {idoneo}{" (jolly)" if usa_jolly else ""}.')
                if (l['n'], tipo) in CHI_ESPLICITO:
                    chi_confermato = True
                    log('    -> Conferma esplicita: il colpevole è Corrado, il vedovo (Domanda 2).')
            else:
                dilettante = max(party, key=lambda n: HERO[n]['acume'])
                if check(log, dilettante, 'ACUME', HERO[dilettante]['acume'], 'Difficile'):
                    approf_letti += 1
                    if (l['n'], tipo) in CHI_ESPLICITO:
                        chi_confermato = True
                else:
                    approf_falliti += 1

    while ore > 0:
        candidati = [l for l in LUOGHI_SIM if l['n'] not in visitati and raggiungibile(l)]
        if not candidati:
            break
        candidati.sort(key=punteggio)
        l = candidati[0]
        cand_missione = ((l.get('camera') and not camera)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2))
        if (approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Nucleo garantito in mano: il gruppo chiude con {ore} '
                f'ore in banca (Vantaggio) invece di inseguire il Luogo {l["n"]}.')
            break
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Visita Luogo {l["n"]} — {l["nome"]}  (1 ora)')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('camera'):
            camera = True
            log('    -> Trovata: LA MACCHINA FOTOGRAFICA (documentare vale doppio — Domanda 4).')
        if l.get('pianta'):
            pianta = True
            log('    -> Trovata: LA PIANTA DEL RESTAURO (si salta T2 e la sua trappola).')
        if l.get('ritratto'):
            ritratto = True
            log('    -> Trovato: IL RITRATTO DI ADA (+1 alle prove NERVI dei muri).')
        if l.get('incrocio_d1'):
            incroci_d1 += 1
        if l.get('incrocio_d3'):
            incroci_d3 += 1
        if ok:
            tenta_approf(l)
        else:
            approf_falliti += len(l['approf'])
        ore -= 1
        ora_corrente += 1

    ore_avanzate = ore
    d1_ok = incroci_d1 >= 2
    d3_ok = incroci_d3 >= 2
    tutte_esatte = camera and d1_ok and d3_ok
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Macchina: {"sì" if camera else "no"}; Pianta: {"sì" if pianta else "no"}; '
        f'Ritratto: {"sì" if ritratto else "no"}; D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D3 ({incroci_d3}): {"ok" if d3_ok else "NO"}; D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, camera=camera, pianta=pianta,
                ritratto=ritratto, d1_ok=d1_ok, d3_ok=d3_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

CUSTODE = dict(NEMICO['IL MURATORE'])   # boss
VEDOVO = dict(NEMICO['IL VEDOVO'])
SGHERRO = dict(NEMICO['LO SGHERRO'])


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La casa che ricorda: la corsa alla demolizione')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Macchina: '
        f'{"sì" if indagine["camera"] else "no"}  |  Pianta: {"sì" if indagine["pianta"] else "no"}')

    custode_extra_fer = custode_fer_bonus(len(party))
    salute, salute_max = {}, {}
    tier = indagine['tier']
    bonus_salute = SALUTE_BONUS_PER_N.get(len(party), 0)
    for n in party:
        smax = HERO[n]['salute'] + (1 if tier in ('PREPARATI', 'SLANCIO') else 0) + bonus_salute
        salute[n] = salute_max[n] = smax
    down = set()
    secondo_fiato = dict(indagine.get('secondo_fiato') or {n: True for n in party})
    intuizione = [DOSSIER_ATTIVO and bool(indagine.get('dossier_completo'))]

    def vivi():
        return [n for n in party if n not in down]

    def applica_danno(b, dan, fonte):
        if intuizione[0] and salute[b] - dan <= 0 and b not in down:
            intuizione[0] = False
            salute[b] = 1
            log(f'    [INTUIZIONE] {b} resta a 1 Salute invece di cadere (gettone Dossier).')
            return
        salute[b] -= dan
        log(f'    {b} subisce {dan} da {fonte} (Salute {max(salute[b],0)}/{salute_max[b]}).')
        if salute[b] <= 0 and b not in down:
            down.add(b)
            log(f'    *** {b} è A TERRA. ***')

    # Tracce della corsa
    demolizione = 0 if indagine.get('d3_ok') else 2
    if not indagine.get('d3_ok'):
        log('  Arrivate a demolizione avviata (Domanda 3 sbagliata): DEMOLIZIONE parte da 2.')
    prova = 0
    camera = indagine.get('camera')
    ritratto_bonus = 1 if indagine.get('ritratto') else 0
    doc_unit = DOC_CAMERA if camera else DOC_NOCAMERA
    chi_conf = indagine.get('chi_confermato')

    enemies = []   # garzoni/vedovo attivi (blocco): dict(nome,fer,att,dif,dan)

    def spawn_garzone(subito=False):
        e = dict(nome='LO SGHERRO', fer=SGHERRO['fer'] + custode_extra_fer * 0,
                 att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan'])
        enemies.append(e)
        log(f'    Piazzato 1 garzone (Sgherro){" — si attiva subito" if subito else ""}.')

    # Muratore e Vedovo: entrano di copione (T4 il Vedovo, T6 il Muratore)
    muratore = None
    muratore_primo_colpo_saltato = [False]
    vedovo = None

    canto = 0
    canto_bonus_carte = [False]
    round_n = 0
    esito = None

    deck = list(MINACCE)
    random.shuffle(deck)
    scarti = []

    def pesca():
        nonlocal deck, scarti
        if not deck:
            deck = scarti
            scarti = []
            random.shuffle(deck)
        c = deck.pop()
        scarti.append(c)
        return c

    def aggiungi_canto():
        nonlocal canto
        canto += 1
        if canto >= SOGLIA_CANTO and not canto_bonus_carte[0]:
            canto_bonus_carte[0] = True
            log(f'    La casa è al colmo (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')

    def prova_nervi(b, diff_name):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, ritratto_bonus)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, ritratto_bonus)
        return ok

    azioni_perse = set()

    def fase_minaccia(a_t6):
        nonlocal demolizione
        base = MINACCIA_FORMULE[formula_minaccia](len(vivi()))
        n_carte = int(base) + (1 if base % 1 and round_n % 2 == 0 else 0) \
            + (1 if canto_bonus_carte[0] else 0)
        for _ in range(n_carte):
            titolo, tipo, subito = pesca()
            log(f'  [MINACCIA] {titolo} ({tipo})')
            if tipo == 'spawn':
                spawn_garzone(subito)
                if subito and vivi():
                    b = min(vivi(), key=lambda n: salute[n])
                    if roll2d6() + SGHERRO['att'] >= HERO[b]['difesa']:
                        applica_danno(b, SGHERRO['dan'], 'garzone (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    if not prova_nervi(b, 'Facile'):
                        azioni_perse.add(b)
                        log(f'    {b}: 1 sola azione al prossimo turno (l’orrore).')
            elif tipo == 'insidiaB':
                if vivi():
                    b = min(vivi(), key=lambda n: HERO[n]['nervi'])
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'insidiaC':
                if vivi():
                    b = min(vivi(), key=lambda n: HERO[n]['nervi'])
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'crescendo':
                aggiungi_canto()
                demolizione += 1
                log(f'    La casa trema: +1 DEMOLIZIONE ({demolizione}/{DEMOLIZIONE_MAX}).')
            elif tipo == 'danno':
                if vivi():
                    applica_danno(random.choice(vivi()), 1, titolo)
            elif tipo == 'ostacolo' and vivi():
                azioni_perse.add(random.choice(vivi()))
            # quiete/favore: nessun effetto meccanico nel modello a blocco

    def fase_nemici_combattimento(pinner):
        """garzoni e Vedovo attaccano; il Muratore, se inchiodato dal
        `pinner`, attacca lui, altrimenti demolisce (gestito fuori)."""
        for e in list(enemies):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'garzone')
        if vedovo and vedovo['fer'] > 0 and vivi():
            b = random.choice(vivi())
            if roll2d6() + vedovo['att'] >= HERO[b]['difesa']:
                applica_danno(b, vedovo['dan'], 'il Vedovo')
        if muratore and muratore['fer'] > 0 and pinner and pinner not in down:
            if roll2d6() + muratore['att'] >= HERO[pinner]['difesa']:
                applica_danno(pinner, muratore['dan'], 'il Muratore')

    def eroi_attaccano(bersaglio, n_attaccanti):
        """`n_attaccanti` eroi colpiscono `bersaglio` (dict con fer/dif)."""
        for n in list(vivi())[:n_attaccanti]:
            if bersaglio['fer'] <= 0:
                break
            if roll2d6() + HERO[n]['vigore'] + 1 >= bersaglio['dif']:
                bersaglio['fer'] -= 1
        return bersaglio['fer'] <= 0

    # Percorso: T1..T5 traversata (T2 saltata con la Pianta), poi T6 la corsa.
    traversata = ['T1', 'T2', 'T3', 'T4', 'T5']
    if indagine.get('pianta'):
        traversata.remove('T2')
        log('  [PIANTA DEL RESTAURO] Si salta la Scala che Ripete (T2) e la sua trappola.')
    if not indagine.get('d1_ok'):
        log('  Cercate la parete a tentoni (Domanda 1): 1 garzone in T1.')
        spawn_garzone()

    # --- Fase 1: traversata (una tessera per round) ---
    for tile in traversata:
        round_n += 1
        log(f'--- Round {round_n}: la scorta attraversa {tile} ---')
        if tile == 'T4' and vedovo is None:
            vedovo = dict(VEDOVO)
            log('    Appare IL VEDOVO (Corrado), disperato, e vi intralcia.')
            if chi_conf:
                vedovo['fer'] = 0
                log('    [LA CASA HA GIÀ PARLATO — D2] nominate Ada: il Vedovo crolla, rimosso.')
        if tile == 'T5':
            for _ in range(2):
                spawn_garzone()
            log('    Il Sottoscala: 2 garzoni sbarrano il passo.')
        # eroi: fanno fuori i garzoni presenti (1 attaccante per garzone)
        garzoni_vivi = [e for e in enemies if e['fer'] > 0]
        for i, e in enumerate(garzoni_vivi):
            liberi = [n for n in vivi()]
            if i < len(liberi) and roll2d6() + HERO[liberi[i]]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        enemies[:] = [e for e in enemies if e['fer'] > 0]
        fase_minaccia(a_t6=False)
        enemies[:] = [e for e in enemies if e['fer'] > 0]
        pinner_vedovo = next((n for n in vivi()), None)
        fase_nemici_combattimento(pinner=None)
        demolizione += DEMO_BACKGROUND
        log(f'    Il muratore lavora dietro il muro: DEMOLIZIONE {demolizione}/{DEMOLIZIONE_MAX}.')
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        for n in list(azioni_perse):
            azioni_perse.discard(n)
        if not vivi():
            esito = 'SCONFITTA (party wipe in traversata)'
            break
        if demolizione >= DEMOLIZIONE_MAX:
            esito = 'SCONFITTA (il muro è crollato prima dell’arrivo)'
            break

    # --- Fase 2: T6, la corsa vera ---
    if esito is None:
        muratore = dict(CUSTODE)
        muratore['fer'] += custode_extra_fer
        log(f'--- Round {round_n + 1}+: L’INTERCAPEDINE (T6) — il Muratore demolisce '
            f'(Fer {muratore["fer"]}) ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): DEMOLIZIONE {demolizione}/{DEMOLIZIONE_MAX} · '
                f'PROVA {prova}/{PROVA_MAX} ---')
            garzoni_vivi = [e for e in enemies if e['fer'] > 0]
            # Allocazione eroi (priorità alla PROVA, che è la vittoria): fino a
            # DOC_CAP fotografano al muro; UN eroe in più (se c'è) inchioda il
            # Muratore per dimezzare la mazza; il resto ripulisce i garzoni. Coi
            # tavoli piccoli (2-3) conviene documentare TUTTI e correre la corsa,
            # accettando che il Muratore cali la mazza piena: è la scelta vera.
            vivi_ora = sorted(vivi(), key=lambda n: -salute[n])
            documentatori = vivi_ora[:DOC_CAP]
            resto = vivi_ora[DOC_CAP:]
            pinner = resto[0] if (muratore['fer'] > 0 and resto) else None
            combattenti = [n for n in resto if n != pinner]

            # eroi attaccano: il pinner colpisce il Muratore, i combattenti i garzoni
            if pinner and roll2d6() + HERO[pinner]['vigore'] + 1 >= muratore['dif']:
                muratore['fer'] -= 1
                log(f'    {pinner} inchioda e colpisce il Muratore: {max(muratore["fer"],0)}/'
                    f'{CUSTODE["fer"] + custode_extra_fer} ferite.')
                if muratore['fer'] <= 0:
                    log('    *** IL MURATORE È A TERRA: la demolizione si ferma. ***')
            for i, n in enumerate(combattenti):
                if i < len(garzoni_vivi) and roll2d6() + HERO[n]['vigore'] + 1 >= garzoni_vivi[i]['dif']:
                    garzoni_vivi[i]['fer'] -= 1
            enemies[:] = [e for e in enemies if e['fer'] > 0]

            # documentazione
            n_doc = min(len(documentatori), DOC_CAP)
            if n_doc:
                if camera:
                    prova += n_doc * DOC_CAMERA
                    log(f'    {n_doc} eroe/i documentano col lampo al magnesio: '
                        f'+{n_doc * DOC_CAMERA} PROVA ({prova}/{PROVA_MAX}).')
                else:
                    successi = sum(1 for n in documentatori[:n_doc]
                                   if prova_nervi(n, 'Media'))
                    prova += successi * DOC_NOCAMERA
                    log(f'    {n_doc} eroe/i documentano a voce: +{successi} PROVA '
                        f'({prova}/{PROVA_MAX}).')

            fase_minaccia(a_t6=True)
            # Muratore: inchiodato (un eroe adiacente) -> attacca il pinner INVECE
            # di demolire, la traccia si ferma; libero -> cala la mazza (colpo
            # pieno). Solo tenerlo inchiodato o abbatterlo ferma la demolizione.
            fase_nemici_combattimento(pinner=pinner)
            if muratore['fer'] > 0:
                pinned = pinner is not None and pinner not in down
                if muratore_primo_colpo_saltato[0] is False and chi_conf:
                    muratore_primo_colpo_saltato[0] = True
                    log('    [LA CASA HA GIÀ PARLATO — D2] il Muratore esita: salta il primo '
                        'colpo di demolizione.')
                elif pinned:
                    log('    Il Muratore inchiodato attacca chi lo tiene INVECE di demolire: '
                        f'DEMOLIZIONE ferma a {demolizione}/{DEMOLIZIONE_MAX}.')
                else:
                    demolizione += DEMO_STRIKE
                    log(f'    Il Muratore cala la mazza: +{DEMO_STRIKE} -> '
                        f'DEMOLIZIONE {demolizione}/{DEMOLIZIONE_MAX}.')
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
                log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
            for n in list(azioni_perse):
                azioni_perse.discard(n)

            if prova >= PROVA_MAX:
                esito = 'VITTORIA'
            elif demolizione >= DEMOLIZIONE_MAX:
                esito = 'SCONFITTA (il muro è crollato: prova distrutta)'
            elif not vivi():
                esito = 'SCONFITTA (party wipe all’intercapedine)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  DEMOLIZIONE {demolizione}/{DEMOLIZIONE_MAX}  |  '
        f'PROVA {prova}/{PROVA_MAX}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, demolizione=demolizione, prova=prova,
                down=list(down), max_down=max_down, canto_finale=canto,
                muratore_abbattuto=bool(muratore and muratore['fer'] <= 0))


# =============================================================== HARNESS

def esegui_run(nome, party, seed, formula='finale_v3', ind_log=None, sped_log=None,
               esplora_a_fondo=False):
    random.seed(seed)
    chiudi = ind_log is None
    if chiudi:
        run_dir = os.path.join(LOG_DIR, nome)
        os.makedirs(run_dir, exist_ok=True)
        ind_log = Logger(os.path.join(run_dir, 'indagine.log'))
        sped_log = Logger(os.path.join(run_dir, 'spedizione.log'))
    indagine = simula_indagine(party, ind_log, esplora_a_fondo)
    if chiudi:
        ind_log.close()
    spedizione = simula_spedizione(party, indagine, sped_log, formula)
    if chiudi:
        sped_log.close()
    return dict(nome=nome, party=party, indagine=indagine, spedizione=spedizione)


def esegui_batch(nome_base, party, seeds, formula='finale_v3', esplora_a_fondo=False):
    risultati = []
    for i, seed in enumerate(seeds):
        if i == 0:
            run_dir = os.path.join(LOG_DIR, nome_base)
            os.makedirs(run_dir, exist_ok=True)
            ind_log = Logger(os.path.join(run_dir, 'indagine.log'))
            sped_log = Logger(os.path.join(run_dir, 'spedizione.log'))
        else:
            ind_log = sped_log = NullLogger()
        risultati.append(esegui_run(f'{nome_base}_s{i}', party, seed, formula,
                                     ind_log, sped_log, esplora_a_fondo))
    n = len(risultati)
    sp = [r['spedizione'] for r in risultati]
    ind = [r['indagine'] for r in risultati]
    vitt = [x for x in sp if x['esito'] == 'VITTORIA']
    return dict(nome=nome_base, party=party, n=n,
                pct_vittoria=sum(1 for x in sp if x['esito'] == 'VITTORIA') / n * 100,
                pct_sofferta=(sum(1 for x in vitt if x['max_down'] >= 1) / len(vitt) * 100) if vitt else 0,
                media_max_down=sum(x['max_down'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_demol=sum(x['demolizione'] for x in sp) / n,
                media_prova=sum(x['prova'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                pct_muratore=sum(1 for x in sp if x['muratore_abbattuto']) / n * 100,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_camera=sum(1 for x in ind if x['camera']) / n * 100,
                pct_chi=sum(1 for x in ind if x['chi_confermato']) / n * 100)


ROSTER_11 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_11, size))
        if combo not in escludi:
            escludi.add(combo)
            return sorted(combo)
    raise ValueError('combinazioni esaurite')


def esegui_multi_party(nome, size, n_party=5, n_seed=30, seed_base=90000, formula='finale_v3'):
    random.seed(seed_base)
    escludi = set()
    per_party = [esegui_batch(f'{nome}_p{p}', party_random(size, escludi),
                              [seed_base + 1000 + p * 100 + i for i in range(n_seed)], formula)
                 for p in range(n_party)]

    def media(k):
        return sum(b[k] for b in per_party) / n_party
    return dict(size=size, **{k: media(k) for k in
                ('pct_vittoria', 'pct_sofferta', 'media_max_down', 'media_round',
                 'media_demol', 'media_prova', 'media_canto', 'pct_muratore',
                 'media_ore', 'media_luoghi', 'pct_camera', 'pct_chi')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep10-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep10-{size:02d}', size, 5, 30,
                                            seed_base=700000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep10.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 10 — curva 2-10 (corsa alla demolizione)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep10: DEMOLIZIONE_MAX={DEMOLIZIONE_MAX}, '
                f'PROVA_MAX={PROVA_MAX}, DEMO_BACKGROUND={DEMO_BACKGROUND}, DEMO_STRIKE={DEMO_STRIKE}, '
                f'DOC_CAP={DOC_CAP}, DOC_CAMERA={DOC_CAMERA}. Seed 700000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % sofferte | Picco terra | Demol.media | Prova.media | '
                'Round | % Muratore giù | Canto | Ore av. | Luoghi | % Macchina |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_sofferta"]:.0f}% | '
                    f'{m["media_max_down"]:.1f} | {m["media_demol"]:.1f} | {m["media_prova"]:.1f} | '
                    f'{m["media_round"]:.1f} | {m["pct_muratore"]:.0f}% | {m["media_canto"]:.1f} | '
                    f'{m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | {m["pct_camera"]:.0f}% |\n')
    print(f'\nCurva Episodio 10 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vittoria, {m["pct_sofferta"]:.0f}% sofferte, '
              f'demol {m["media_demol"]:.1f}, prova {m["media_prova"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
