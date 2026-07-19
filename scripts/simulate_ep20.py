# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 20 «Il Quarto Movimento» (IL FINALE).

Indagine breve (l'ORA, la VIA, la VOCE, il CONTROCANTO). La SPEDIZIONE è la
discesa multi-fase nella gola della città: si vince completando il CONTROCANTO
(righe dai Frammenti) prima del RISVEGLIO del Dormiente (vedi
DESIGN-EPISODIO-20.md).

  - DOPPIA TRACCIA: CONTROCANTO (righe da completare) vs RISVEGLIO (Canto). Il
    controcanto avanza col ritmo dei Frammenti + Mappa − coro in campo. Il
    Canto sale; alla SOGLIA_RISVEGLIO il Dormiente si desta = SCONFITTA.
  - LA CAMERA È IL BOSS: non si colpisce, fasi ambientali (danno inevitabile a
    soglie di Canto). M. (umano) in piedi con la sua voce accelera il risveglio;
    neutralizzarlo o salvare la Candidata lo rallenta. Il coro si ROMPE.
  - FUORI SCALA: si possono perdere eroi, e può finire male (il risveglio).

PONYTAIL: NON puntare a win-rate alta uniforme — è il finale, deve poter finire
male. Config di produzione condivisa importata da simulate_playtest: INTOCCABILE.
Seed base 800000.
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
from gen_ep20 import NEMICI_20  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_20)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (il finale: si tara QUI) =====
SOGLIA_CONTROCANTO = 10   # righe di controcanto per la vittoria (finale: lungo)
SOGLIA_RISVEGLIO = 8      # Canto oltre cui il Dormiente si desta (sconfitta)
FRAMMENTI_MIN, FRAMMENTI_MAX = 8, 19   # Frammenti conservati (distribuzione campagna)
CORO_ROMPE_META = True    # gli impiegati fuggono a meta' Ferite
# danno inevitabile della camera OGNI round della fase 3, a soglie di Canto
CAMERA_DANNO_SOGLIA = {4: 1, 6: 2, 7: 3}   # danni/round nella camera a soglie di Canto

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
MINACCE = [
    ('LE VOCI PREZZOLATE', 'spawn', False),
    ('IL RINFORZO DEL CORO', 'spawn', False),
    ('CHI COPRE M.', 'spawn', True),
    ('IL CORO STONATO', 'spawn', False),
    ('LA SEZIONE DEI BASSI', 'spawn', False),
    ('CHI TRATTIENE LA CANDIDATA', 'spawn', False),
    ('L’ULTIMA VOCE COMPRATA', 'spawn', True),
    ('L’ACQUA CHE SALE', 'insidiaB', False),
    ('LA PIETRA VIVA', 'insidiaA', False),
    ('IL BUIO DELLA GOLA', 'ostacolo', False),
    ('IL CANTO CHE CONFONDE', 'insidiaA', False),
    ('LA CORRENTE FREDDA', 'insidiaV', False),
    ('L’ECO CHE MENTE', 'eco', False),          # -1 riga di controcanto (Mappa annulla)
    ('IL DORMIENTE SI MUOVE', 'crescendo', False),
    ('LE MAREE AL PICCO', 'crescendo', False),
    ('IL QUARTO RIGO SALE', 'crescendo', False),
    ('IL DIO APRE UN OCCHIO', 'crescendo', False),
    ('UN RESPIRO DEL DIO', 'quiete', False),
    ('LA CITTÀ SUONA A FAVORE', 'favore_canto', False),  # +1 riga (serve Mappa)
    ('DETRITI NELLA CORRENTE', 'ostacolo', False),
    ('LA PIETRA CHE CROLLA', 'danno', False),
]

# Rivelatorio Domanda 2 (DOVE, la via), 3 carte in aperti: L1-Presagio,
# L3-Testimonianza, L4-Referto.
CHI_ESPLICITO = {(1, 'Presagio'), (3, 'Testimonianza'), (4, 'Referto')}


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)


def roll2d6():
    return random.randint(1, 6) + random.randint(1, 6)


def check(log, chi, stat_label, stat_val, diff_name, extra=0):
    s = roll2d6()
    tot = s + stat_val + extra
    ok = tot >= DIFF[diff_name]
    log(f'    [PROVA {stat_label}] {chi}: 2d6={s} +{stat_label}({stat_val})'
        f'{f" {extra:+d}" if extra else ""} = {tot} vs {diff_name}({DIFF[diff_name]}) '
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
# frammenti_obj=L4 (il controcanto); mappa=L3; candidata=D3 (L5+L6).
# incrocio_d1 (QUANDO: L2 ossari + L4 archivio); incrocio_d3 (CHI voce: L5+L6).
LUOGHI_SIM = [
    dict(n=1, nome='La Cattedrale', req=None, chiude=None,
         sblocca_parola=('LE MAREE DI SIZIGIA', 'LA VIA DELLE TRE ACQUE'),
         approf=['Presagio']),
    dict(n=2, nome='Gli Ossari e le Maree', req=None, chiude=None,
         sblocca_parola=('LE MAREE DI SIZIGIA', 'LA VOCE CHE CREDE'),
         approf=['Osservazione'], incrocio_d1=True),
    dict(n=3, nome='La Taverna della Chiatta', req=None, chiude=None,
         sblocca_parola=('LA VIA DELLE TRE ACQUE', 'IL CONTROCANTO'),
         approf=['Testimonianza'], mappa=True),
    dict(n=4, nome='L’Archivio del 1741', req=None, chiude=None,
         sblocca_parola=('IL CONTROCANTO', 'LE MAREE DI SIZIGIA'),
         approf=['Referto'], frammenti_obj=True, incrocio_d1=True),
    dict(n=5, nome='I Vecchi del Coro', req=('parola', 'LA VOCE CHE CREDE'),
         chiude=None, approf=['Presagio'], incrocio_d3=True),
    dict(n=6, nome='L’Organo di Ossa', req=('parola', 'LA VOCE CHE CREDE'),
         chiude=None, approf=['Osservazione'], incrocio_d3=True),
    dict(n=7, nome='La Camera del Coro', req=('parola', 'IL CONTROCANTO'),
         chiude=None, approf=['Osservazione']),
    dict(n=8, nome='Il Grimorio del Rito', req=('parola', 'IL CONTROCANTO'),
         chiude=None, approf=['Presagio']),
    dict(n=9, nome='La Gola della Città', req=('parola', 'LA VIA DELLE TRE ACQUE'),
         chiude=None, approf=['Presagio']),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 20: "Il Quarto Movimento" (il finale)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    frammenti_obj = mappa = False
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
        if ore < 1:
            return False
        req = l.get('req')
        if req is None:
            return True
        return req[1] in parole

    def punteggio(l):
        fra_pri = 0 if (not frammenti_obj and l.get('frammenti_obj')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('frammenti_obj') and not frammenti_obj)
                         or (l.get('mappa') and not mappa)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (fra_pri, missione, strutturale, copertura, l['n'])

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
                    log('    -> Conferma esplicita: la via delle tre acque (Domanda 2).')
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
        cand_missione = ((l.get('frammenti_obj') and not frammenti_obj)
                         or (l.get('mappa') and not mappa)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2))
        if (approf_letti >= 1 and ore <= 1 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Pronti a scendere: chiudete con {ore} ore in banca.')
            break
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Prepara — Luogo {l["n"]} — {l["nome"]}  (1 ora)')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('frammenti_obj'):
            frammenti_obj = True
            log('    -> Trovati: I FRAMMENTI DEL CONTROCANTO (la deduzione finale — D4).')
        if l.get('mappa'):
            mappa = True
            log('    -> Trovata: LA MAPPA ACUSTICA ATTIVA (guida la discesa — D2).')
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
    d3_ok = incroci_d3 >= 2   # CHI e' la voce: puo' salvare la Candidata
    # i Frammenti conservati: la deduzione di campagna (distribuzione)
    frammenti = random.randint(FRAMMENTI_MIN, FRAMMENTI_MAX) if frammenti_obj else random.randint(0, 8)
    tutte_esatte = d1_ok and d3_ok and chi_confermato and frammenti_obj
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Frammenti obj/D4: {"sì" if frammenti_obj else "no"} ({frammenti} righe); Mappa/D2: '
        f'{"sì" if mappa else "no"}; QUANDO/D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'VOCE/D3 ({incroci_d3}): {"ok" if d3_ok else "NO"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, frammenti_obj=frammenti_obj, mappa=mappa,
                frammenti=frammenti, d1_ok=d1_ok, d3_ok=d3_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

SGHERRO = dict(NEMICO['LO SGHERRO'])
M_SENZA = dict(NEMICO['M. (SENZA MASCHERA)'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = la camera (controcanto)
TESSERE_AMBIENTE = {'T1', 'T2', 'T3'}


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La discesa nella gola della città (il finale)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Frammenti: '
        f'{indagine["frammenti"]}  |  Mappa: {"sì" if indagine["mappa"] else "no"}  |  '
        f'VOCE(D3): {"sì" if indagine["d3_ok"] else "no"}')

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

    mappa = indagine.get('mappa')
    frammenti = indagine.get('frammenti', 0)
    d1_ok = indagine.get('d1_ok')
    puo_salvare_candidata = indagine.get('d3_ok')
    controcanto_rate = 1 + frammenti // 6 + (1 if mappa else 0)

    controcanto = [0]
    candidata_salvata = [False]
    m_a_terra = [False]

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

    canto = 0
    canto_bonus_carte = [False]
    scorta = []      # ogni impiegato: dict(fer, fer_max)
    m_nemico = [None]
    round_n = 0
    esito = None
    eco_penalita = [0]
    citta_bonus = [0]
    camera_danni_dati = set()

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

    def aggiungi_canto(n=1, fonte=''):
        nonlocal canto
        canto += n
        if canto >= SOGLIA_CANTO and not canto_bonus_carte[0]:
            canto_bonus_carte[0] = True
            log(f'    Il Dormiente si desta (Canto {canto}): +1 carta Minaccia per Fase.')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        f = SGHERRO['fer']
        scorta.append(dict(fer=f, fer_max=f, att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 impiegato del coro (Sgherro){" — subito" if subito else ""}.')

    def fase_minaccia():
        base = MINACCIA_FORMULE[formula_minaccia](len(vivi()))
        n_carte = int(base) + (1 if base % 1 and round_n % 2 == 0 else 0) \
            + (1 if canto_bonus_carte[0] else 0)
        for _ in range(n_carte):
            titolo, tipo, subito = pesca()
            log(f'  [MINACCIA] {titolo} ({tipo})')
            if tipo == 'spawn':
                spawn(subito)
                if subito and vivi():
                    b = min(vivi(), key=lambda n: salute[n])
                    if roll2d6() + SGHERRO['att'] >= HERO[b]['difesa']:
                        applica_danno(b, SGHERRO['dan'], 'impiegato (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')
            elif tipo == 'insidiaB':
                if vivi():
                    b = random.choice(vivi())
                    if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media',
                                 1 if mappa else 0):
                        applica_danno(b, 1, titolo)
            elif tipo == 'insidiaV':
                if vivi():
                    b = random.choice(vivi())
                    check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media')
            elif tipo == 'eco':
                if not mappa:
                    eco_penalita[0] += 1
                    log('    L’eco che mente: −1 riga di controcanto al prossimo giro.')
            elif tipo == 'favore_canto':
                if mappa:
                    citta_bonus[0] += 1
                    log('    La città suona a favore: +1 riga di controcanto al prossimo giro.')
            elif tipo == 'crescendo':
                aggiungi_canto(1, titolo)
            elif tipo == 'danno':
                if vivi():
                    applica_danno(random.choice(vivi()), 1, titolo)
            # quiete/ostacolo: nessun effetto nel modello a blocco

    def coro_in_campo():
        return len([e for e in scorta if e['fer'] > 0])

    def fase_nemici():
        for e in list(scorta):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'impiegato del coro')
        if m_nemico[0] and not m_a_terra[0]:
            b = min(vivi(), key=lambda n: salute[n]) if vivi() else None
            if b and roll2d6() + m_nemico[0]['att'] >= HERO[b]['difesa']:
                applica_danno(b, m_nemico[0]['dan'], 'M. (senza maschera)')

    def eroi_ripuliscono(attaccanti, anche_m=False):
        # gli impiegati si rompono a meta' Ferite (fuggono)
        for n in attaccanti:
            bersagli = [e for e in scorta if e['fer'] > 0]
            if bersagli:
                e = bersagli[0]
                if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                    e['fer'] -= 1
                    if CORO_ROMPE_META and e['fer'] <= e['fer_max'] / 2 and e['fer'] > 0:
                        e['fer'] = 0
                        log('    Un impiegato si ROMPE e fugge (crepa del Frammento 19).')
            elif anche_m and m_nemico[0] and not m_a_terra[0]:
                if roll2d6() + HERO[n]['vigore'] + 1 >= m_nemico[0]['dif']:
                    m_nemico[0]['fer'] -= 1
                    if m_nemico[0]['fer'] <= 0:
                        m_a_terra[0] = True
                        log('    *** M. è a terra: il suo rito si spegne. ***')
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: se D1 sbagliata, il risveglio parte da 1 ---
    if not d1_ok:
        log('  Senza QUANDO (D1): scendete scomposti — il Canto (risveglio) parte da 1.')
        aggiungi_canto(1, 'ora sbagliata')

    # --- Fase 1-2: discesa T1..T5 ---
    for tile in TRAVERSATA:
        round_n += 1
        log(f'--- Round {round_n}: {tile} · Canto {canto}/{SOGLIA_RISVEGLIO} risveglio · '
            f'controcanto {controcanto[0]}/{SOGLIA_CONTROCANTO} ---')
        if tile == 'T1' and d1_ok and round_n == 1:
            log('    [QUANDO — D1] all’ora giusta: nessuna carta Minaccia questo round.')
        if tile in ('T4', 'T5') and puo_salvare_candidata and not candidata_salvata[0]:
            candidata_salvata[0] = True
            log('    *** La Candidata è SALVATA: M. resta con un coro senza anima. ***')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok):
            fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto(1, 'orologio')
        if canto >= SOGLIA_RISVEGLIO:
            esito = 'SCONFITTA (il Dormiente si desta)'
            break
        if not vivi():
            esito = 'SCONFITTA (party wipe nella discesa)'
            break

    # --- Fase 3: la camera (T6) — il controcanto contro il risveglio ---
    if esito is None:
        m_nemico[0] = dict(M_SENZA)
        m_nemico[0]['fer'] += 0   # M. non scala con le taglie (e' un uomo solo)
        log(f'--- Round {round_n + 1}+: LA CAMERA DEL DORMIENTE (T6) — M. '
            f'(Fer {m_nemico[0]["fer"]}) + il controcanto ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): Canto {canto}/{SOGLIA_RISVEGLIO} · '
                f'controcanto {controcanto[0]}/{SOGLIA_CONTROCANTO} · coro {coro_in_campo()} · '
                f'M. {"a terra" if m_a_terra[0] else "in piedi"} ---')
            if canto >= SOGLIA_RISVEGLIO:
                esito = 'SCONFITTA (il Dormiente si desta)'
                break
            if not vivi():
                esito = 'SCONFITTA (party wipe nella camera)'
                break
            # fase ambientale della camera: danno inevitabile ogni round (fuori scala)
            dan_camera = 0
            for soglia, dan in sorted(CAMERA_DANNO_SOGLIA.items()):
                if canto >= soglia:
                    dan_camera = dan
            for _ in range(dan_camera):
                if vivi():
                    applica_danno(random.choice(vivi()), 1, 'la camera del Dormiente')
            if not vivi():
                esito = 'SCONFITTA (party wipe nella camera)'
                break
            # gli eroi: alcuni cantano il controcanto, altri spezzano il coro / M.
            vivi_ora = list(vivi())
            # meta' canta, meta' combatte (almeno 1 canta se c'e' qualcuno)
            n_cantori = max(1, len(vivi_ora) // 2)
            cantori = vivi_ora[:n_cantori]
            combattenti = vivi_ora[n_cantori:]
            eroi_ripuliscono(combattenti, anche_m=True)
            # avanza il controcanto
            righe = len(cantori) and controcanto_rate  # se c'e' almeno un cantore
            righe = controcanto_rate if cantori else 0
            righe = max(0, righe - coro_in_campo() + citta_bonus[0] - eco_penalita[0])
            citta_bonus[0] = 0
            eco_penalita[0] = 0
            controcanto[0] += righe
            log(f'    Cantate {righe} righe di controcanto (tot {controcanto[0]}/{SOGLIA_CONTROCANTO}).')
            fase_minaccia()
            fase_nemici()
            # nella camera il Dormiente si desta a ogni round (la corsa col controcanto)
            if vivi():
                aggiungi_canto(1, 'il Dormiente si desta (camera)')
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto(1, 'orologio')
            # M. in piedi con la sua voce accelera il risveglio
            if m_nemico[0] and not m_a_terra[0] and not candidata_salvata[0] and vivi():
                aggiungi_canto(1, 'il rito di M. (voce che crede)')
            if controcanto[0] >= SOGLIA_CONTROCANTO and vivi():
                esito = 'VITTORIA'
                log('    *** Il controcanto è completo: il Dormiente torna al sonno senza sogni. '
                    'VITTORIA. ***')
            elif canto >= SOGLIA_RISVEGLIO:
                esito = 'SCONFITTA (il Dormiente si desta)'
            elif not vivi():
                esito = 'SCONFITTA (party wipe nella camera)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito == 'VITTORIA'   # nel finale non c'e' vittoria parziale: si canta o ci si sveglia
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  controcanto '
        f'{controcanto[0]}/{SOGLIA_CONTROCANTO}  |  a terra {len(down)}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena,
                controcanto=controcanto[0], candidata=candidata_salvata[0])


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
    vitt = [x for x in sp if x['vittoria']]
    return dict(nome=nome_base, party=party, n=n,
                pct_vittoria=sum(1 for x in sp if x['vittoria']) / n * 100,
                pct_risveglio=sum(1 for x in sp if 'desta' in x['esito']) / n * 100,
                pct_sofferta=(sum(1 for x in vitt if x['max_down'] >= 1) / len(vitt) * 100) if vitt else 0,
                media_max_down=sum(x['max_down'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                media_controcanto=sum(x['controcanto'] for x in sp) / n,
                media_frammenti=sum(x['frammenti'] for x in ind) / n,
                pct_candidata=sum(1 for x in sp if x['candidata']) / n * 100)


ROSTER_20 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_20, size))
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
                ('pct_vittoria', 'pct_risveglio', 'pct_sofferta', 'media_max_down', 'media_round',
                 'media_canto', 'media_controcanto', 'media_frammenti', 'pct_candidata')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep20-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep20-{size:02d}', size, 5, 30,
                                            seed_base=800000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep20.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 20 — curva 2-10 (il finale: controcanto vs risveglio, fuori scala)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep20: SOGLIA_CONTROCANTO={SOGLIA_CONTROCANTO}, '
                f'SOGLIA_RISVEGLIO={SOGLIA_RISVEGLIO}, Frammenti {FRAMMENTI_MIN}-{FRAMMENTI_MAX}. '
                f'FUORI SCALA. Seed 800000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % risveglio | % sofferte | Picco terra | Round | Canto | '
                'Controcanto | Frammenti | % Candidata |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_risveglio"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_controcanto"]:.1f} | {m["media_frammenti"]:.1f} | '
                    f'{m["pct_candidata"]:.0f}% |\n')
    print(f'\nCurva Episodio 20 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_risveglio"]:.0f}% risveglio, '
              f'{m["pct_sofferta"]:.0f}% sofferte, controcanto {m["media_controcanto"]:.1f}, '
              f'canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
