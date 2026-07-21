# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 16 «Un caso qualunque».

Indagine generica (clone di simulate_ep15), con una SPEDIZIONE deliberatamente
FACILE, senza soglia-catastrofe (vedi DESIGN-EPISODIO-16.md): è il respiro
dell'atto, lo scontro più piccolo della campagna.

  - OBIETTIVO: raggiungere la stanza di Bruna (T6), liberarla e prendere lo
    Sposo. Col FASCICOLO delle Vittime la cattura è AUTOMATICA (vittoria pulita);
    senza, lo Sposo tenta la fuga in barca a T5 e va battuto a forza (vittoria
    amara). Nessuna soglia FUOCO/FUGA/SIGILLO: il Canto sale ma non innesca
    catastrofi. Boss debolissimo (Att 2, Fer 4, Danno 1).
  - Metrica: la % "pulita" (Fascicolo) è l'asse; la RILETTURA è un contatore di
    campagna (carica l'Ep. 18), ortogonale alla difficoltà.
  - Torsione «il dettaglio che il mandante non poteva sapere»: la crepa (aver
    letto la lettera di M. col nastro verde, L6). Narrativa, non di difficoltà.

PONYTAIL: NON forzare tensione qui. La ansia dell'episodio è emotiva (la crepa),
non meccanica. Config di produzione condivisa importata da simulate_playtest:
INTOCCABILE. Seed base 760000.
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
from gen_ep16 import NEMICI_16  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_16)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (respiro: al minimo) ========
BOSS_INGAGGIO = 3         # eroi che ingaggiano lo Sposo (debole)
BOSS_COLPI = 1            # lo Sposo colpisce una volta (Att 2, Danno 1)
FUGA_BARCA_DIFF = 'Media'  # prova VIGORE per fermarlo al molo senza Fascicolo

# ============================ MAZZO MINACCIA (21: 7/6/4/4) — il piu' morbido =
# tipo: 'spawn' (complice), 'insidiaA' (ogni eroe NERVI Facile, perde azione),
# 'insidiaB' (un eroe prova, 1 danno), 'crescendo' (+Canto, senza catastrofe),
# 'quiete'/'favore'/'ostacolo'/'danno'.
MINACCE = [
    ('IL COCCHIERE DI RONDA', 'spawn', False),
    ('IL TUTTOFARE', 'spawn', False),
    ('DOMESTICI ALLARMATI', 'spawn', True),
    ('CHI COPRE LO SPOSO', 'spawn', False),
    ('IL FISCHIO D’ALLARME', 'spawn', False),
    ('VERSO L’IMBARCADERO', 'spawn', False),
    ('L’ULTIMO A DIFENDERE LA TRUFFA', 'spawn', True),
    ('IL CANE DA GUARDIA', 'insidiaA', False),
    ('LA SERRA SCIVOLOSA', 'insidiaA', False),
    ('IL LAMPADARIO CHE OSCILLA', 'insidiaB', False),
    ('LA PORTA A VETRI', 'ostacolo', False),
    ('IL BUIO DEL GIARDINO', 'insidiaA', False),
    ('LA RINGHIERA DEL MOLO', 'insidiaB', False),
    ('UN GRIDO NELLA NOTTE', 'crescendo', False),
    ('LE LUCI SI ACCENDONO', 'crescendo', False),
    ('LO SPOSO CAPISCE', 'crescendo', False),
    ('LA BARCA È SLEGATA', 'crescendo', False),
    ('LA VILLA CHE DORME', 'quiete', False),
    ('UNA FINESTRA SOCCHIUSA', 'favore', False),
    ('TAVOLI DEL BANCHETTO', 'ostacolo', False),
    ('UN CANDELIERE IN FACCIA', 'danno', False),
]

# Rivelatorio Domanda 2 (chi = lo Sposo), 3 carte in aperti: L1-Testimonianza,
# L2-Testimonianza, L3-Osservazione.
CHI_ESPLICITO = {(1, 'Testimonianza'), (2, 'Testimonianza'), (3, 'Osservazione')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. fascicolo=L5 (D3); lettera_m=L6
# (D4/RILETTURA); indirizzo=L8 (D1). incrocio_d1 (DOVE: L4 + L8).
LUOGHI_SIM = [
    dict(n=1, nome='La Casa del Lampionaio', req=None, chiude=None,
         sblocca_parola=('IL NASTRO VERDE', 'LA FUGA D’AMORE'),
         approf=['Testimonianza']),
    dict(n=2, nome='Il Caffè degli Annunci', req=None, chiude=None,
         sblocca_parola=('LA FUGA D’AMORE', 'LO SPOSO PERFETTO'),
         approf=['Testimonianza']),
    dict(n=3, nome='La Gazzetta di Roccamora', req=None, chiude=None,
         sblocca_parola=('LO SPOSO PERFETTO', 'LA CARROZZA PER IL LAGO'),
         approf=['Osservazione']),
    dict(n=4, nome='La Stazione delle Carrozze', req=None, chiude=None,
         sblocca_parola=('IL NASTRO VERDE', 'LA CARROZZA PER IL LAGO'),
         approf=['Testimonianza'], incrocio_d1=True),
    dict(n=5, nome='La Casa dell’Ex Fidanzata', req=('parola', 'LO SPOSO PERFETTO'),
         chiude=None, approf=['Presagio'], fascicolo=True),
    dict(n=6, nome='L’Archivio delle Lettere', req=('parola', 'IL NASTRO VERDE'),
         chiude=18, approf=['Referto'], lettera_m=True, rilettura=True),
    dict(n=7, nome='Il Fioraio', req=('parola', 'LO SPOSO PERFETTO'),
         chiude=None, approf=['Osservazione']),
    dict(n=8, nome='Il Registro degli Affitti', req=('parola', 'LA CARROZZA PER IL LAGO'),
         chiude=None, approf=['Referto'], indirizzo=True, incrocio_d1=True),
    dict(n=9, nome='La Villa sul Lago', req=('parola', 'LA CARROZZA PER IL LAGO'),
         chiude=None, approf=['Presagio']),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 16: "Un caso qualunque"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    fascicolo = lettera_m = indirizzo = False
    riletture = 0
    incroci_d1 = 0
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
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        fas_pri = 0 if (not fascicolo and l.get('fascicolo')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('fascicolo') and not fascicolo)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('lettera_m') and not lettera_m)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, fas_pri, missione, strutturale, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: l’ha presa lo Sposo (Domanda 2).')
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
        cand_missione = ((l.get('fascicolo') and not fascicolo)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('lettera_m') and not lettera_m))
        if (approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Nucleo garantito in mano: il gruppo chiude con {ore} '
                f'ore in banca (Vantaggio).')
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
        if l.get('fascicolo'):
            fascicolo = True
            log('    -> Trovato: IL FASCICOLO DELLE VITTIME (cattura automatica dello Sposo — D3).')
        if l.get('lettera_m'):
            lettera_m = True
            log('    -> Trovata: LA LETTERA DI M. (il nastro verde — la crepa, D4).')
        if l.get('indirizzo'):
            indirizzo = True
            log('    -> Trovato: L’INDIRIZZO DELLA VILLA (niente round perso a T1 — D1).')
        if l.get('rilettura'):
            riletture += 3   # rilegge le vecchie lettere: banca incroci per l'Ep.18 (astratto)
            log('    -> RILETTURA: bancati incroci di campagna per l’Episodio 18.')
        if l.get('incrocio_d1'):
            incroci_d1 += 1
        if ok:
            tenta_approf(l)
        else:
            approf_falliti += len(l['approf'])
        ore -= 1
        ora_corrente += 1

    ore_avanzate = ore
    d1_ok = incroci_d1 >= 2
    crepa_vista = lettera_m   # torsione: aver letto la lettera col nastro verde
    tutte_esatte = d1_ok and chi_confermato and fascicolo and crepa_vista
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Fascicolo/D3: {"sì" if fascicolo else "no"}; Crepa/D4: {"sì" if crepa_vista else "no"}; '
        f'Indirizzo: {"sì" if indirizzo else "no"}; DOVE/D1 ({incroci_d1}): '
        f'{"ok" if d1_ok else "NO"}; Riletture bancate: {riletture}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, fascicolo=fascicolo, lettera_m=lettera_m,
                indirizzo=indirizzo, crepa_vista=crepa_vista, riletture=riletture, d1_ok=d1_ok,
                visitati=visitati, chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

SPOSO = dict(NEMICO['LO SPOSO'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = la stanza di Bruna


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La villa sul lago (lo scontro più piccolo)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Fascicolo: '
        f'{"sì" if indagine["fascicolo"] else "no"}  |  Indirizzo: '
        f'{"sì" if indagine["indirizzo"] else "no"}  |  DOVE(D1): '
        f'{"sì" if indagine["d1_ok"] else "no"}')

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

    fascicolo = indagine.get('fascicolo')
    indirizzo = indagine.get('indirizzo')
    d1_ok = indagine.get('d1_ok')
    chi_conf = indagine.get('chi_confermato')

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
    sposo_al_molo = [False]

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
            log(f'    L’allarme monta (Canto {canto}): +1 carta Minaccia per Fase, per sempre. '
                f'(Nessuna catastrofe: è un respiro.)')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 complice (Sgherro){" — subito" if subito else ""}.')

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
                        applica_danno(b, SGHERRO['dan'], 'complice (subito)')
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
                applica_danno(b, e['dan'], 'complice')
        if boss[0] and boss[0]['fer'] > 0:
            colpi = BOSS_COLPI
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi -= 1
                log('    [QUALE NOME? — D2] lo Sposo si confonde: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'lo Sposo')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: senza Indirizzo, un round perso a orientarsi (nessun danno) ---
    if not indirizzo:
        log('  Senza l’Indirizzo della Villa: 1 round perso a orientarsi nel giardino.')
        round_n += 1
    if not d1_ok:
        log('  Senza DOVE (D1): 1 complice appare a T1.')
        spawn()

    # --- Fase 1: traversata T1..T5 ---
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
        log(f'--- Round {round_n}: {tile} · Canto {canto} (allarme, nessuna soglia) ---')
        if tile == 'T1' and d1_ok and round_n <= 2:
            log('    [DOVE — D1] sapete dove sbarcare: nessuna carta Minaccia questo round.')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok):
            fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
        if not vivi():
            esito = 'SCONFITTA (party wipe alla villa)'
            break
        if tile == 'T5' and not fascicolo:
            sposo_al_molo[0] = True   # senza Fascicolo, lo Sposo tenta la barca

    # --- Fase 2: T6, la stanza di Bruna — boss debole + doppio esito ---
    if esito is None:
        if fascicolo:
            # il Fascicolo mostrato a Bruna: l'inganno crolla, cattura automatica
            log('--- L’ATTICO/STANZA (T6): mostrato il Fascicolo a Bruna, l’inganno crolla. ---')
            log('    *** Lo Sposo, senza scudo, è preso senza combattere: VITTORIA PULITA. ***')
            esito = 'VITTORIA'
        else:
            boss[0] = dict(SPOSO)
            boss[0]['fer'] += custode_extra_fer
            if chi_conf:
                boss[0]['salta_attacco'] = True
            log(f'--- Round {round_n + 1}+: LA STANZA DI BRUNA (T6) — lo Sposo '
                f'(Fer {boss[0]["fer"]}), tenta la barca ---')
            barca_tentata = [False]
            while esito is None:
                round_n += 1
                log(f'--- Round {round_n} (T6): Sposo {max(boss[0]["fer"],0)}/'
                    f'{SPOSO["fer"] + custode_extra_fer} · Canto {canto} ---')
                if not vivi():
                    esito = 'SCONFITTA (party wipe alla villa)'
                    break
                # senza Fascicolo, lo Sposo tenta la fuga in barca usando Bruna:
                # una prova VIGORE per fermarlo (fallita = fuga con lei = amara comunque)
                if sposo_al_molo[0] and not barca_tentata[0]:
                    barca_tentata[0] = True
                    fermatore = max(vivi(), key=lambda n: HERO[n]['vigore'])
                    if check(log, fermatore, 'VIGORE', HERO[fermatore]['vigore'], FUGA_BARCA_DIFF):
                        log('    Lo Sposo è bloccato al molo prima di salpare.')
                    else:
                        log('    *** Lo Sposo salpa con Bruna per scudo: ripresa a fatica, '
                            'VITTORIA AMARA (la ragazza traumatizzata). ***')
                        esito = 'VITTORIA-PARZIALE'
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
                fase_minaccia()
                fase_nemici()
                if round_n % TICK_CANTO_OGNI == 0 and vivi():
                    aggiungi_canto()
                if boss[0]['fer'] <= 0 and vivi():
                    esito = 'VITTORIA-PARZIALE'   # preso a forza, senza Fascicolo: amara
                    log('    Lo Sposo battuto e preso a forza: VITTORIA AMARA (Bruna salva, ma ferita).')
                elif not vivi():
                    esito = 'SCONFITTA (party wipe alla villa)'
                elif round_n > 40:
                    esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'   # "pulita" (col Fascicolo)
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena)


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
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_fascicolo=sum(1 for x in ind if x['fascicolo']) / n * 100,
                media_riletture=sum(x['riletture'] for x in ind) / n)


ROSTER_16 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_16, size))
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
                 'media_canto', 'media_ore', 'media_luoghi', 'pct_fascicolo', 'media_riletture')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep16-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep16-{size:02d}', size, 5, 30,
                                            seed_base=760000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep16.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 16 — curva 2-10 (villa sul lago, il respiro — nessuna soglia)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('finale_v3 (condivisa) + leve ep16: boss Lo Sposo Att2/Fer4/Dan1, '
                'Fascicolo=cattura automatica (pulita). Nessuna soglia-catastrofe. '
                'Seed 760000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % pulita | % sofferte | Picco terra | Round | Canto | '
                'Ore av. | Luoghi | % Fascicolo | Riletture |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_fascicolo"]:.0f}% | {m["media_riletture"]:.1f} |\n')
    print(f'\nCurva Episodio 16 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% pulita, '
              f'{m["pct_sofferta"]:.0f}% sofferte, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
