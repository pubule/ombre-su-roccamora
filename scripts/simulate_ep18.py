# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 18 «La mano sola» (chiusura Atto III).

Indagine generica (clone di simulate_ep15) — ma è la DEDUZIONE: le 4 Domande =
«chi è C.B.», risposte con gli incroci. La SPEDIZIONE è la FUGA dal Palazzo del
Lume (casa vostra da nemico): uscire con la PROVA prima dell'arresto (soglia-
Canto), superando il maggiordomo (boss). M. non si affronta (Atto IV).

  - I GENDARMI (soglia-arresto): alla SOGLIA_ARRESTO i gendarmi sigillano; da
    lì ogni round un eroe rischia l'arresto (fuori scena). L'Uscita di Servizio
    alza la soglia.
  - LA PROVA (piena): uscire con la prova FORTE (vezzo + incroci D1/D3 pieni) e
    senza eroi arrestati = M. latitante (piena). Prova debole o eroi arrestati
    = parziale (braccati).
  - I gendarmi sono in buona fede: la posta è l'ARRESTO, non la morte. La ansia
    è la rete che si chiude; il colpo è emotivo (il volto del mostro).

PONYTAIL: la difficoltà non è la letalità, è il rovesciamento (cacciatori
diventati prede). Config di produzione condivisa importata da simulate_playtest:
INTOCCABILE. Seed base 780000.
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
from gen_ep18 import NEMICI_18  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_18)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la chiusura: si tara QUI) ===
SOGLIA_ARRESTO = 4       # Canto oltre cui i gendarmi sigillano (5 con l'Uscita di Servizio)
BOSS_INGAGGIO = 4        # eroi che ingaggiano il maggiordomo (T5)
BOSS_COLPI = 1           # il maggiordomo, Danno 2 ma riluttante: un colpo (saltato con D4)
ARRESTO_DIFF = 'Media'   # prova NERVI per non essere «catturati» dopo la soglia

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
# tipo: 'spawn' (gendarme), 'insidiaA' (ogni eroe NERVI Facile, perde azione),
# 'insidiaB' (un eroe NERVI, torna indietro/1 danno), 'crescendo' (+Canto/rete),
# 'quiete'/'favore'/'ostacolo'/'danno'.
MINACCE = [
    ('LA PRIMA PATTUGLIA', 'spawn', False),
    ('AI PIANI ALTI', 'spawn', False),
    ('CHI VI RICONOSCE', 'spawn', True),
    ('IL CORDONE ALLE PORTE', 'spawn', False),
    ('LA RONDA INTERNA', 'spawn', False),
    ('RINFORZI DAL CORTILE', 'spawn', False),
    ('L’ORDINE D’ARRESTO', 'spawn', True),
    ('LA LAMPADA CHE SI SPEGNE', 'insidiaA', False),
    ('LA PORTA CHE SI CHIUDE', 'ostacolo', False),
    ('IL PASSAGGIO CHE NON C’È PIÙ', 'insidiaB', False),
    ('LO SPECCHIO DEL CORRIDOIO', 'insidiaA', False),
    ('IL MAGGIORDOMO SA DOVE SIETE', 'insidiaB', False),
    ('IL BUIO CHE CONOSCETE MALE', 'insidiaA', False),
    ('FISCHIETTI NEL CORTILE', 'crescendo', False),
    ('I GENDARMI AI PIANI', 'crescendo', False),
    ('LE USCITE SI SIGILLANO', 'crescendo', False),
    ('LA RETE SI CHIUDE', 'crescendo', False),
    ('IL PALAZZO CHE TRATTIENE IL FIATO', 'quiete', False),
    ('UN CONFRATELLO VI COPRE', 'favore', False),
    ('MOBILI ROVESCIATI', 'ostacolo', False),
    ('UN MANGANELLO NEL BUIO', 'danno', False),
]

# Rivelatorio Domanda 2 (chi paga = una cassa sola), 3 carte in aperti:
# L1-Testimonianza, L3-Referto, L4-Osservazione.
CHI_ESPLICITO = {(1, 'Testimonianza'), (3, 'Referto'), (4, 'Osservazione')}


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
# La deduzione: vezzo=L8 (D4); incroci_campagna=L4; uscita=L9. incrocio_d1
# (DOVE: L2 penna + L6 carta); incrocio_d3 (COSA: L7 matrice + L8 vezzo).
LUOGHI_SIM = [
    dict(n=1, nome='L’Assemblea della Società', req=None, chiude=None,
         sblocca_parola=('UNA MANO SOLA', 'L’ORO VECCHIO'),
         approf=['Testimonianza']),
    dict(n=2, nome='L’Archivio delle Penne', req=None, chiude=None,
         sblocca_parola=('UNA MANO SOLA', 'L’INCHIOSTRO DEL PRESIDENTE'),
         approf=['Referto'], incrocio_d1=True),
    dict(n=3, nome='La Contabilità', req=None, chiude=None,
         sblocca_parola=('L’ORO VECCHIO', 'LA CARROZZA CONDIVISA'),
         approf=['Referto']),
    dict(n=4, nome='Il Fascicolo di Campagna', req=None, chiude=None,
         sblocca_parola=('LA CARROZZA CONDIVISA', 'L’INCHIOSTRO DEL PRESIDENTE'),
         approf=['Osservazione'], incroci_campagna=True),
    dict(n=5, nome='Lo Studio Privato di M.', req=('parola', 'UNA MANO SOLA'),
         chiude=None, approf=['Presagio']),
    dict(n=6, nome='La Carta di Pregio', req=('parola', 'L’INCHIOSTRO DEL PRESIDENTE'),
         chiude=None, approf=['Referto'], incrocio_d1=True),
    dict(n=7, nome='La Matrice del Decano', req=('parola', 'LA CARROZZA CONDIVISA'),
         chiude=None, approf=['Referto'], incrocio_d3=True),
    dict(n=8, nome='Il Vezzo delle Firme', req=('parola', 'LA CARROZZA CONDIVISA'),
         chiude=None, approf=['Presagio'], vezzo=True, incrocio_d3=True),
    dict(n=9, nome='Il Palazzo del Lume (la fuga)', req=('parola', 'UNA MANO SOLA'),
         chiude=None, approf=['Presagio'], uscita=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 18: "La mano sola" (la deduzione)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    vezzo = incroci_campagna = uscita = False
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
        vez_pri = 0 if (not vezzo and l.get('vezzo')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('vezzo') and not vezzo)
                         or (l.get('incroci_campagna') and not incroci_campagna)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        secondaria = 0 if (l.get('uscita') and not uscita) else 1
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (vez_pri, missione, strutturale, secondaria, copertura, l['n'])

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
                    log('    -> Conferma esplicita: una cassa sola paga entrambi (Domanda 2).')
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
        cand_missione = ((l.get('vezzo') and not vezzo)
                         or (l.get('incroci_campagna') and not incroci_campagna)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)
                         or (l.get('uscita') and not uscita))
        if (approf_letti >= 1 and ore <= 1 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Deduzione in mano: il gruppo chiude con {ore} ore in '
                f'banca (Vantaggio).')
            break
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Chiude il filo — Luogo {l["n"]} — {l["nome"]}  (1 ora)')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('vezzo'):
            vezzo = True
            log('    -> Trovato: IL VEZZO DELLE FIRME (la prova che C.B. è M. — D4).')
        if l.get('incroci_campagna'):
            incroci_campagna = True
            log('    -> Trovati: GLI INCROCI DI CAMPAGNA (la prova pubblica, la forza).')
        if l.get('uscita'):
            uscita = True
            log('    -> Trovata: L’USCITA DI SERVIZIO (soglia-arresto più alta).')
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
    prova_forte = vezzo and incroci_campagna and (d1_ok or d3_ok)
    tutte_esatte = d1_ok and d3_ok and chi_confermato and vezzo
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 fili chiusi, {approf_letti} Approfondimenti letti.')
    log(f'Vezzo/D4: {"sì" if vezzo else "no"}; Incroci campagna: {"sì" if incroci_campagna else "no"}; '
        f'Uscita: {"sì" if uscita else "no"}; D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D3 ({incroci_d3}): {"ok" if d3_ok else "NO"}; prova forte: {"SÌ" if prova_forte else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, vezzo=vezzo, incroci_campagna=incroci_campagna,
                uscita=uscita, prova_forte=prova_forte, d1_ok=d1_ok, d3_ok=d3_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

GUARDIA = dict(NEMICO['LA GUARDIA DEL PRESIDENTE'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = l'uscita


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - Il Palazzo del Lume, la fuga da casa vostra')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Prova forte: '
        f'{"sì" if indagine["prova_forte"] else "no"}  |  Uscita: '
        f'{"sì" if indagine["uscita"] else "no"}  |  Vezzo: '
        f'{"sì" if indagine["vezzo"] else "no"}')

    custode_extra_fer = custode_fer_bonus(len(party))
    salute, salute_max = {}, {}
    tier = indagine['tier']
    bonus_salute = SALUTE_BONUS_PER_N.get(len(party), 0)
    for n in party:
        smax = HERO[n]['salute'] + (1 if tier in ('PREPARATI', 'SLANCIO') else 0) + bonus_salute
        salute[n] = salute_max[n] = smax
    down = set()
    arrestati = set()
    secondo_fiato = dict(indagine.get('secondo_fiato') or {n: True for n in party})
    intuizione = [DOSSIER_ATTIVO and bool(indagine.get('dossier_completo'))]

    vezzo = indagine.get('vezzo')
    uscita = indagine.get('uscita')
    prova_forte = indagine.get('prova_forte')
    incroci_campagna = indagine.get('incroci_campagna')
    d3_ok = indagine.get('d3_ok')  # D4/«una mano sola» ~ la deduzione completa
    soglia_arresto = SOGLIA_ARRESTO + (1 if uscita else 0)

    def fuori():
        return down | arrestati

    def vivi():
        return [n for n in party if n not in fuori()]

    def applica_danno(b, dan, fonte):
        if intuizione[0] and salute[b] - dan <= 0 and b not in fuori():
            intuizione[0] = False
            salute[b] = 1
            log(f'    [INTUIZIONE] {b} resta a 1 Salute invece di cadere (gettone Dossier).')
            return
        salute[b] -= dan
        log(f'    {b} subisce {dan} da {fonte} (Salute {max(salute[b],0)}/{salute_max[b]}).')
        if salute[b] <= 0 and b not in fuori():
            down.add(b)
            log(f'    *** {b} è A TERRA. ***')

    canto = 0
    canto_bonus_carte = [False]
    scorta = []
    boss = [None]
    round_n = 0
    esito = None
    rete_chiusa = [False]

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
            log(f'    La rete si stringe (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')
        if canto >= soglia_arresto and not rete_chiusa[0]:
            rete_chiusa[0] = True
            log(f'    *** SOGLIA-ARRESTO ({soglia_arresto}): i gendarmi sigillano. Da ora ogni '
                f'round un eroe rischia l’arresto. ***')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 gendarme (Sgherro){" — subito" if subito else ""}.')

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
                        applica_danno(b, SGHERRO['dan'], 'gendarme (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')
            elif tipo == 'insidiaB':
                if vivi():
                    b = random.choice(vivi())
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'crescendo':
                aggiungi_canto()
            elif tipo == 'danno':
                if vivi():
                    applica_danno(random.choice(vivi()), 1, titolo)
            # quiete/favore/ostacolo: nessun effetto nel modello a blocco

    def fase_arresti():
        # dopo la soglia, ogni round un eroe rischia l'arresto (prova NERVI o «catturato»)
        if rete_chiusa[0] and vivi():
            b = random.choice(vivi())
            if not prova_nervi(b, ARRESTO_DIFF):
                arrestati.add(b)
                log(f'    *** {b} è CATTURATO dai gendarmi (fuori scena fino alla fine). ***')

    def fase_nemici():
        for e in list(scorta):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'gendarme')
        if boss[0] and boss[0]['fer'] > 0:
            colpi = BOSS_COLPI
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi -= 1
                log('    [UNA MANO SOLA — D4] il maggiordomo vacilla: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'la Guardia del Presidente')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: se prova forte, un confratello copre (favore); se D1 sbagliata, 1 gendarme ---
    if prova_forte:
        log('  [PROVA FORTE] La Società vi crede: un confratello copre la fuga (nessuno spawn a T1).')
    elif not indagine.get('d1_ok'):
        log('  Senza DOVE (D1): 1 gendarme appare a T1.')
        spawn()

    # --- Fase 1: traversata T1..T5 ---
    for tile in TRAVERSATA:
        round_n += 1
        log(f'--- Round {round_n}: {tile} · Canto {canto}/{soglia_arresto} arresto '
            f'{"(RETE CHIUSA)" if rete_chiusa[0] else ""} ---')
        if tile == 'T1' and prova_forte and round_n == 1:
            log('    [T1] la Società dalla vostra parte: nessuna carta Minaccia questo round.')
        if tile == 'T4':
            log('    Appare M.: prende una cosa e sparisce nel muro (Atto IV, non si affronta).')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and prova_forte):
            fase_minaccia()
        fase_nemici()
        fase_arresti()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (tutti a terra o catturati nel Palazzo)'
            break

    # --- Fase 2: T6, l'uscita — il maggiordomo + la fuga ---
    if esito is None:
        boss[0] = dict(GUARDIA)
        boss[0]['fer'] += custode_extra_fer
        if d3_ok and vezzo:
            boss[0]['salta_attacco'] = True
        fuggiti = [False]
        log(f'--- Round {round_n + 1}+: L’USCITA (T6) — la Guardia del Presidente '
            f'(Fer {boss[0]["fer"]}) ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): Guardia {max(boss[0]["fer"],0)}/'
                f'{GUARDIA["fer"] + custode_extra_fer} · Canto {canto} · '
                f'{len(arrestati)} arrestati ---')
            if not vivi():
                esito = 'SCONFITTA (tutti a terra o catturati nel Palazzo)'
                break
            vivi_ora = list(vivi())
            attaccanti_boss = vivi_ora[:BOSS_INGAGGIO]
            ripulitori = vivi_ora[BOSS_INGAGGIO:]
            eroi_ripuliscono(ripulitori)
            if boss[0]['fer'] > 0:
                for n in attaccanti_boss:
                    if boss[0]['fer'] <= 0:
                        break
                    if roll2d6() + HERO[n]['vigore'] + 1 >= boss[0]['dif']:
                        boss[0]['fer'] -= 1
                if boss[0]['fer'] <= 0:
                    log('    *** Il maggiordomo è a terra: la porta è libera. ***')
            fase_minaccia()
            fase_nemici()
            fase_arresti()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            # fuga: con la Guardia a terra, si esce
            if boss[0]['fer'] <= 0 and vivi():
                fuggiti[0] = True
                piena = prova_forte and not arrestati
                esito = 'VITTORIA' if piena else 'VITTORIA-PARZIALE'
                log(f'    Uscite dal Palazzo con la prova. {"Prova forte, tutti liberi: M. latitante — VITTORIA PIENA." if piena else "Prova debole o eroi arrestati: ve la cavate ma braccati."}')
            elif not vivi():
                esito = 'SCONFITTA (tutti a terra o catturati nel Palazzo)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  arrestati '
        f'{len(arrestati)}  |  a terra {len(down)}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena,
                arrestati=len(arrestati))


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
                pct_piena=sum(1 for x in sp if x['piena']) / n * 100,
                pct_sofferta=(sum(1 for x in vitt if x['max_down'] >= 1 or x['arrestati'] >= 1)
                              / len(vitt) * 100) if vitt else 0,
                media_arrestati=sum(x['arrestati'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_prova_forte=sum(1 for x in ind if x['prova_forte']) / n * 100)


ROSTER_18 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_18, size))
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
                ('pct_vittoria', 'pct_piena', 'pct_sofferta', 'media_arrestati', 'media_round',
                 'media_canto', 'media_ore', 'media_luoghi', 'pct_prova_forte')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep18-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep18-{size:02d}', size, 5, 30,
                                            seed_base=780000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep18.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 18 — curva 2-10 (Palazzo del Lume, la fuga: soglia-arresto)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep18: SOGLIA_ARRESTO={SOGLIA_ARRESTO} (+1 Uscita), '
                f'BOSS_INGAGGIO={BOSS_INGAGGIO}, BOSS_COLPI={BOSS_COLPI}. Seed 780000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % prova forte | % sofferte | Arrestati | Round | Canto | '
                'Ore av. | Fili | % Prova forte(ind) |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_arrestati"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_prova_forte"]:.0f}% |\n')
    print(f'\nCurva Episodio 18 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% prova-forte, '
              f'{m["pct_sofferta"]:.0f}% sofferte, arrestati {m["media_arrestati"]:.1f}, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
