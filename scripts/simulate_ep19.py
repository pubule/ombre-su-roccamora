# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 19 «La Società braccata» (apertura Atto IV).

Indagine generica (clone di simulate_ep18) — è la campagna che presenta il conto:
i luoghi sono PNG del passato. La SPEDIZIONE è l'irruzione nell'Archivio
sequestrato per il Fascicolo del 1741, braccati dall'Ispettore Vidal che NON si
uccide (vedi DESIGN-EPISODIO-19.md).

  - IL CONTO DEI BIVI: un modificatore aggregato (alleati), simulato come una
    distribuzione + le Prove raccolte. Decide se l'Ispettore è convincibile.
  - PERSUASIONE (non morte): Vidal ridotto all'ultima Ferita si FERMA; con le
    Prove e alleati >= CONTO_SOGLIA è CONVINTO (piena, dalla vostra parte);
    senza, solo fermato (parziale).
  - IL FASCICOLO del 1741 (T6): l'obiettivo materiale; senza, l'unico vero
    fallimento (raro).

PONYTAIL: il boss non si uccide — la persuasione è la meccanica. Config di
produzione condivisa importata da simulate_playtest: INTOCCABILE. Seed 790000.
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
from gen_ep19 import NEMICI_19  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_19)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (si tara QUI) ================
CONTO_SOGLIA = 3         # alleati per CONVINCERE l'Ispettore (= piena)
BOSS_INGAGGIO = 4        # eroi che ingaggiano l'Ispettore (T5)
BOSS_COLPI = 2           # l'Ispettore, Danno 2 (implacabile finché non si ferma)
# Il conto dei Bivi è simulato: alleati_base ~ distribuzione delle scelte di
# campagna (0..3), + le Prove raccolte in Indagine.
ALLEATI_BASE_MIN, ALLEATI_BASE_MAX = 0, 3

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
MINACCE = [
    ('LA GUARDIA NOTTURNA', 'spawn', False),
    ('IL POSTO DI BLOCCO', 'spawn', False),
    ('CHI DÀ L’ALLARME', 'spawn', True),
    ('RINFORZI DAI PIANI', 'spawn', False),
    ('LA RONDA DEI DEPOSITI', 'spawn', False),
    ('CHI COPRE L’ISPETTORE', 'spawn', False),
    ('L’ORDINE DI CATTURA', 'spawn', True),
    ('LO SCAFFALE CHE FRANA', 'insidiaB', False),
    ('LA PORTA A TEMPO', 'ostacolo', False),
    ('IL FALDONE SBAGLIATO', 'insidiaA', False),
    ('L’ALLARME SILENZIOSO', 'crescendo', False),
    ('IL FIUTO DELL’ISPETTORE', 'insidiaB', False),
    ('LA POLVERE DEI SIGILLI', 'insidiaA', False),
    ('UN RUMORE DI TROPPO', 'crescendo', False),
    ('L’ISPETTORE FIUTA LA PISTA', 'crescendo', False),
    ('LE GUARDIE CONVERGONO', 'crescendo', False),
    ('SEI ALLE STRETTE', 'crescendo', False),
    ('L’ARCHIVIO CHE TACE', 'quiete', False),
    ('UN ALLEATO DEL CONTO', 'favore', False),
    ('CASSE SEQUESTRATE', 'ostacolo', False),
    ('UN COLPO DI MANGANELLO', 'danno', False),
]

# Rivelatorio Domanda 2 (chi vi apre), 3 carte in aperti: L1-Testimonianza,
# L2-Osservazione, L3-Testimonianza.
CHI_ESPLICITO = {(1, 'Testimonianza'), (2, 'Osservazione'), (3, 'Testimonianza')}


MARCIA_TESSERA = 2   # round per attraversare una tessera: media misurata sui
# simulatori con griglia (Ep.1-9), dove il Movimento 3 del Regolamento impone
# 2 round per andare da una porta all'altra di una tessera 4x4. Prima era 1
# (spostamento gratis), e ogni round regalato era una Fase Minaccia in meno.

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
# prove=L4 (persuasione); mappa_acustica=L8; mappa_sigilli=L2. incrocio_d1
# (DOVE: L4 gendarme + L2 sigilli); incrocio_d3 (COSA manca: L6 decano + L8).
LUOGHI_SIM = [
    dict(n=1, nome='La Taverna della Chiatta', req=None, chiude=None,
         sblocca_parola=('LE TAGLIE SULLE VOSTRE TESTE', 'L’ULTIMA DISCESA'),
         approf=['Testimonianza']),
    dict(n=2, nome='Il Banco dei Pegni di Fossa', req=None, chiude=None,
         sblocca_parola=('LE TAGLIE SULLE VOSTRE TESTE', 'LA SOCIETÀ BRACCATA'),
         approf=['Osservazione'], sigilli=True, incrocio_d1=True),
    dict(n=3, nome='La Gazzetta di Roccamora', req=None, chiude=None,
         sblocca_parola=('LA SOCIETÀ BRACCATA', 'IL CONTO DEI BIVI'),
         approf=['Testimonianza']),
    dict(n=4, nome='La Gendarmeria', req=None, chiude=None,
         sblocca_parola=('IL CONTO DEI BIVI', 'L’ULTIMA DISCESA'),
         approf=['Referto'], prove=True, incrocio_d1=True),
    dict(n=5, nome='Il Professor Braga', req=('parola', 'IL CONTO DEI BIVI'),
         chiude=None, approf=['Osservazione']),
    dict(n=6, nome='Il Decano Ferrante', req=('parola', 'LA SOCIETÀ BRACCATA'),
         chiude=None, approf=['Presagio'], incrocio_d3=True),
    dict(n=7, nome='Un Debito Antico', req=('parola', 'LE TAGLIE SULLE VOSTRE TESTE'),
         chiude=None, approf=['Osservazione']),
    dict(n=8, nome='I Vecchi Testimoni del Coro', req=('parola', 'L’ULTIMA DISCESA'),
         chiude=None, approf=['Referto'], mappa=True, incrocio_d3=True),
    dict(n=9, nome='L’Archivio Sequestrato', req=('parola', 'LA SOCIETÀ BRACCATA'),
         chiude=None, approf=['Presagio']),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 19: "La Società braccata" (il conto)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    prove = mappa = sigilli = False
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
        pro_pri = 0 if (not prove and l.get('prove')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('prove') and not prove)
                         or (l.get('mappa') and not mappa)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (pro_pri, missione, strutturale, copertura, l['n'])

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
                    log('    -> Conferma esplicita: sapete su chi contare (Domanda 2).')
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
        cand_missione = ((l.get('prove') and not prove)
                         or (l.get('mappa') and not mappa)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2))
        if (approf_letti >= 1 and ore <= 1 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Alleati e pezzi in mano: chiudete con {ore} ore in banca.')
            break
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Bussa — Luogo {l["n"]} — {l["nome"]}  (1 ora)')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('prove'):
            prove = True
            log('    -> Trovate: LE PROVE PER L’ISPETTORE (per convincere Vidal).')
        if l.get('mappa'):
            mappa = True
            log('    -> Trovata: LA MAPPA ACUSTICA (indispensabile per l’Ep. 20).')
        if l.get('sigilli'):
            sigilli = True
            log('    -> Trovata: LA MAPPA DEI SIGILLI (salta l’allarme T1).')
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
    # il conto dei Bivi: base (scelte di campagna, distribuzione) + le Prove
    alleati = random.randint(ALLEATI_BASE_MIN, ALLEATI_BASE_MAX) + (1 if prove else 0)
    tutte_esatte = d1_ok and d3_ok and chi_confermato and prove
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 porte, {approf_letti} Approfondimenti letti.')
    log(f'Prove: {"sì" if prove else "no"}; Mappa acustica: {"sì" if mappa else "no"}; '
        f'Sigilli: {"sì" if sigilli else "no"}; D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D3 ({incroci_d3}): {"ok" if d3_ok else "NO"}; alleati (conto): {alleati}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, prove=prove, mappa=mappa, sigilli=sigilli,
                alleati=alleati, d1_ok=d1_ok, d3_ok=d3_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

VIDAL = dict(NEMICO['L’ISPETTORE VIDAL'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4']   # poi T5 = Vidal, T6 = il Fascicolo


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - L’Archivio sequestrato, e un inseguitore da convincere')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Prove: '
        f'{"sì" if indagine["prove"] else "no"}  |  Alleati: {indagine["alleati"]}  |  Sigilli: '
        f'{"sì" if indagine["sigilli"] else "no"}')

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

    prove = indagine.get('prove')
    sigilli = indagine.get('sigilli')
    alleati = indagine.get('alleati', 0)
    d1_ok = indagine.get('d1_ok')

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
    scorta = []
    boss = [None]
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
            log(f'    L’individuazione monta (Canto {canto}): +1 carta Minaccia per Fase.')

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
        # gli alleati del conto ammorbidiscono: 1 carta scartata ogni 2 alleati
        scarta = min(n_carte, alleati // 2)
        for _ in range(scarta):
            pesca()
            log(f'    [CONTO] un alleato distrae una minaccia (carta scartata).')
        for _ in range(n_carte - scarta):
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

    def fase_nemici():
        for e in list(scorta):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'gendarme')
        if boss[0] and boss[0]['fer'] > 1:   # Vidal si ferma all'ultima Ferita (fer==1)
            for _ in range(BOSS_COLPI):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'l’Ispettore Vidal')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: senza la mappa dei sigilli, l'allarme (1 gendarme) ---
    if not sigilli:
        log('  Senza la mappa dei sigilli: l’allarme scatta — 1 gendarme a T1.')
        spawn()
    if not d1_ok:
        log('  Senza DOVE (D1): 1 gendarme in più a T1.')
        spawn()

    # --- Fase 1: traversata T1..T4 ---
    for tile in TRAVERSATA:
        # ROUND DI MARCIA: attraversare una tessera costa MARCIA_TESSERA round
        # (Movimento 3, Regolamento), non uno gratis. Il round in piu' porta la
        # pressione: carte Minaccia, nemici, Canto.
        for _ in range(MARCIA_TESSERA - 1):
            round_n += 1
            log(f'--- Round {round_n}: il gruppo marcia verso {tile} ---')
            fase_minaccia()
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            if not vivi():
                esito = 'SCONFITTA (party wipe in marcia)'
                break
        if esito:
            break
        round_n += 1
        log(f'--- Round {round_n}: {tile} · Canto {canto} · alleati {alleati} ---')
        if tile == 'T1' and d1_ok and sigilli and round_n == 1:
            log('    [DOVE + SIGILLI] entrate silenziosi: nessuna carta Minaccia questo round.')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok and sigilli):
            fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
        if not vivi():
            esito = 'SCONFITTA (tutti a terra nell’Archivio)'
            break

    # --- Fase 2: T5, l'Ispettore Vidal (persuasione, non morte) ---
    ispettore_fermato = [False]
    if esito is None:
        boss[0] = dict(VIDAL)
        boss[0]['fer'] += custode_extra_fer
        log(f'--- Round {round_n + 1}+: LA SALA DI LETTURA (T5) — l’Ispettore Vidal '
            f'(Fer {boss[0]["fer"]}, non si uccide) ---')
        while not ispettore_fermato[0] and esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T5): Vidal {max(boss[0]["fer"],1)}/'
                f'{VIDAL["fer"] + custode_extra_fer} ---')
            if not vivi():
                esito = 'SCONFITTA (tutti a terra nell’Archivio)'
                break
            vivi_ora = list(vivi())
            attaccanti_boss = vivi_ora[:BOSS_INGAGGIO]
            ripulitori = vivi_ora[BOSS_INGAGGIO:]
            eroi_ripuliscono(ripulitori)
            if boss[0]['fer'] > 1:
                for n in attaccanti_boss:
                    if boss[0]['fer'] <= 1:
                        break
                    if roll2d6() + HERO[n]['vigore'] + 1 >= boss[0]['dif']:
                        boss[0]['fer'] -= 1
                if boss[0]['fer'] <= 1:
                    ispettore_fermato[0] = True
                    log('    *** L’Ispettore si ferma all’ultima Ferita e abbassa l’arma: '
                        '«Parlate». ***')
            fase_minaccia()
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            if round_n > 40:
                esito = 'TIMEOUT'

    # --- Fase 3: T6, il Fascicolo + la persuasione ---
    if esito is None and ispettore_fermato[0]:
        log('--- L’USCITA CON IL FASCICOLO (T6) ---')
        if vivi():
            convinto = prove and alleati >= CONTO_SOGLIA
            # il Fascicolo si prende quasi sempre; l'unico vero fallimento è non
            # riuscire a raggiungerlo (party wipe, già gestito)
            esito = 'VITTORIA' if convinto else 'VITTORIA-PARZIALE'
            log(f'    Fascicolo del 1741 preso. {"Ispettore CONVINTO (dalla vostra parte): piena." if convinto else "Ispettore solo fermato (resta contro): parziale."}')
        else:
            esito = 'SCONFITTA (tutti a terra nell’Archivio)'
    elif esito is None:
        esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  alleati {alleati}  |  '
        f'a terra {len(down)}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena, alleati=alleati)


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
                pct_sofferta=(sum(1 for x in vitt if x['max_down'] >= 1) / len(vitt) * 100) if vitt else 0,
                media_max_down=sum(x['max_down'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                media_alleati=sum(x['alleati'] for x in sp) / n,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_prove=sum(1 for x in ind if x['prove']) / n * 100)


ROSTER_19 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_19, size))
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
                ('pct_vittoria', 'pct_piena', 'pct_sofferta', 'media_max_down', 'media_round',
                 'media_canto', 'media_alleati', 'media_ore', 'media_luoghi', 'pct_prove')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep19-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep19-{size:02d}', size, 5, 30,
                                            seed_base=790000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep19.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 19 — curva 2-10 (Archivio sequestrato, persuasione + conto)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep19: CONTO_SOGLIA={CONTO_SOGLIA}, '
                f'BOSS_INGAGGIO={BOSS_INGAGGIO}, BOSS_COLPI={BOSS_COLPI}. Seed 790000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % convinto | % sofferte | Picco terra | Round | Canto | '
                'Alleati | Ore av. | % Prove |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_alleati"]:.1f} | {m["media_ore"]:.1f} | '
                    f'{m["pct_prove"]:.0f}% |\n')
    print(f'\nCurva Episodio 19 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% convinto, '
              f'{m["pct_sofferta"]:.0f}% sofferte, alleati {m["media_alleati"]:.1f}, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
