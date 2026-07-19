# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 14 «Il rivale».

Indagine generica (clone di simulate_ep13), con una SPEDIZIONE in quota sui
tetti del Corso (vedi DESIGN-EPISODIO-14.md): scalata lineare a 6 tessere con
pericoli di quota (comignolo T2, lucernario T5) e una SOGLIA-FUGA legata al
Canto — il Primo Gatto sparisce sui tetti se non lo agganciate in tempo.

  - OBIETTIVO: raggiungere l'Attico (T6), agganciare il Primo Gatto (boss) e
    farlo TRATTARE (all'ultima Ferita, o a 2 Ferite con la Parola dei Tetti):
    dice la verità sulla commissione = VITTORIA PIENA. Se il Canto supera la
    SOGLIA_FUGA prima che l'abbiate ridotto, il Gatto scavalca la cresta e
    sparisce = VITTORIA PARZIALE (refurtiva e intrusi documentati, ma niente
    conferma della commissione).
  - QUOTA: il comignolo (T2) e il lucernario (T5) si superano con prove; i
    Ramponi (dal Covo) tolgono cadute e danni. I Gatti minori (Sgherri) colpiscono
    e scappano.
  - TORSIONE «l'inventario al contrario»: con l'Inventario Originale (L1) e il
    verbale (L5/L7) documentate ciò che è tornato IN PIÙ (intrusi_documentati).

PONYTAIL: modello a blocco (traversata + resa dei conti all'Attico), non la
griglia tattica. La tensione è il boss agile + i pericoli di quota + la corsa
alla FUGA. Config di produzione condivisa importata da simulate_playtest:
INTOCCABILE. Seed base 740000.
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
from gen_ep14 import NEMICI_14  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_14)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
TESSERE_QUOTA = {'T2', 'T5'}   # comignolo / lucernario (cadute)
TESSERA_SPAWN = 'T3'           # la terrazza dei panni: i Gatti minori
SOGLIA_FUGA = 3            # Canto oltre cui il Gatto sparisce (4 con la Parola dei Tetti)
DANNO_QUOTA = 1            # danno a fallire una prova di quota (T5) senza Ramponi
BOSS_INGAGGIO = 4         # eroi che accerchiano il Primo Gatto all'Attico (T6)
BOSS_COLPI = 3            # il Primo Gatto è agile: raffica di colpi (uno saltato con D2)

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
# tipo: 'spawn' (Gatto minore), 'insidiaA' (ogni eroe NERVI Facile, perde
# azione), 'insidiaB' (un eroe prova, 1 danno), 'quota' (prova DESTREZZA/VIGORE:
# fallita = 1 round perso o 1 danno; annullata dai Ramponi), 'crescendo'
# (+Canto/fuga), 'quiete'/'favore'/'ostacolo'/'danno'.
MINACCE = [
    ('OMBRE TRA I PANNI', 'spawn', False),
    ('SOPRA LA CRESTA', 'spawn', False),
    ('COLPISCI E SCAPPA', 'spawn', True),
    ('DALLA GRONDAIA', 'spawn', False),
    ('IL FISCHIO DELLO SPILLO', 'spawn', False),
    ('COPRONO LA FUGA DEL CAPO', 'spawn', False),
    ('RINCALZI DALL’ABBAINO', 'spawn', True),
    ('IL COPPO CHE FRANA', 'quota', False),
    ('LA GRONDAIA MARCIA', 'quotaB', False),
    ('IL VUOTO SOTTO', 'insidiaA', False),
    ('IL VETRO DEL LUCERNARIO', 'quotaB', False),
    ('LA FUNE TESA', 'quota', False),
    ('IL COLOMBO IN VOLO', 'insidiaA', False),
    ('UN FISCHIO SUI TETTI', 'crescendo', False),
    ('IL GATTO SI SPOSTA', 'crescendo', False),
    ('LE TEGOLE CEDONO LA TRACCIA', 'crescendo', False),
    ('LA CRESTA È VICINA', 'crescendo', False),
    ('LA NOTTE SUI TETTI', 'quiete', False),
    ('UN ABBAINO APERTO', 'favore', False),
    ('COMIGNOLI SUL PASSO', 'ostacolo', False),
    ('IL CORNICIONE CHE CEDE', 'danno', False),
]

# Rivelatorio Domanda 2 (chi ha eseguito = i Gatti / commissione cieca), 3 carte
# in aperti: L1-Testimonianza, L2-Testimonianza, L4-Referto.
CHI_ESPLICITO = {(1, 'Testimonianza'), (2, 'Testimonianza'), (4, 'Referto')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. parola_tetti=L8 (D4); ramponi=L8;
# inventario=L1 (D3). incrocio_d1 (DOVE: L2 Gazzetta + L3 Banco);
# incrocio_d3 (COSA IN PIÙ: L1 Inventario + L5 Ricettatore + L7 Faldone)
# -> intrusi_documentati.
LUOGHI_SIM = [
    dict(n=1, nome='La Villa-Museo di Braga', req=None, chiude=None,
         sblocca_parola=('LE LASTRE SPARITE', 'IL DUELLO DI TRENT’ANNI'),
         approf=['Testimonianza'], inventario=True, incrocio_d3=True),
    dict(n=2, nome='La Gazzetta di Roccamora', req=None, chiude=None,
         sblocca_parola=('IL DUELLO DI TRENT’ANNI', 'I GATTI SUI TETTI'),
         approf=['Testimonianza'], incrocio_d1=True),
    dict(n=3, nome='Il Banco dei Pegni', req=None, chiude=None,
         sblocca_parola=('I GATTI SUI TETTI', 'LA REFURTIVA TORNATA'),
         approf=['Osservazione'], incrocio_d1=True),
    dict(n=4, nome='La Gendarmeria', req=None, chiude=None,
         sblocca_parola=('LE LASTRE SPARITE', 'LA REFURTIVA TORNATA'),
         approf=['Referto']),
    dict(n=5, nome='Il Ricettatore', req=('parola', 'LA REFURTIVA TORNATA'),
         chiude=22, approf=['Presagio'], incrocio_d3=True),
    dict(n=6, nome='Lo Studio del Perito', req=('parola', 'IL DUELLO DI TRENT’ANNI'),
         chiude=None, approf=['Osservazione']),
    dict(n=7, nome='Il Faldone d’Inventario', req=('parola', 'LE LASTRE SPARITE'),
         chiude=None, approf=['Referto'], incrocio_d3=True),
    dict(n=8, nome='Il Covo dei Gatti', req=('parola', 'I GATTI SUI TETTI'),
         chiude=None, approf=['Presagio'], parola_tetti=True, ramponi=True),
    dict(n=9, nome='L’Attico del Corso', req=('parola', 'I GATTI SUI TETTI'),
         chiude=None, approf=['Testimonianza'], in_quota=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 14: "Il rivale"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    parola_tetti = ramponi = inventario = False
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
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        par_pri = 0 if (not parola_tetti and l.get('parola_tetti')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('parola_tetti') and not parola_tetti)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, par_pri, missione, strutturale, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: furto dei Gatti, commissione cieca (Domanda 2).')
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
        cand_missione = ((l.get('parola_tetti') and not parola_tetti)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2))
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
        if l.get('parola_tetti'):
            parola_tetti = True
            log('    -> Trovata: LA PAROLA DEI TETTI (il Primo Gatto tratta a 2 Ferite — Domanda 4).')
        if l.get('ramponi'):
            ramponi = True
            log('    -> Trovati: I RAMPONI (le cadute di quota non feriscono).')
        if l.get('inventario'):
            inventario = True
            log('    -> Trovato: L’INVENTARIO ORIGINALE (documenta il «di più» — Domanda 3).')
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
    intrusi_documentati = incroci_d3 >= 2   # «l'inventario al contrario» (D3)
    tutte_esatte = parola_tetti and d1_ok and intrusi_documentati and chi_confermato
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Parola dei Tetti: {"sì" if parola_tetti else "no"}; Ramponi: {"sì" if ramponi else "no"}; '
        f'Inventario/D3 ({incroci_d3}): {"ok" if intrusi_documentati else "NO"}; '
        f'DOVE/D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, parola_tetti=parola_tetti, ramponi=ramponi,
                inventario=inventario, intrusi_documentati=intrusi_documentati, d1_ok=d1_ok,
                visitati=visitati, chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

PRIMO_GATTO = dict(NEMICO['IL PRIMO GATTO'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = l'Attico


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - I tetti del Corso, prima che il Gatto sparisca')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Parola: '
        f'{"sì" if indagine["parola_tetti"] else "no"}  |  Ramponi: '
        f'{"sì" if indagine["ramponi"] else "no"}  |  DOVE(D1): '
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

    parola_tetti = indagine.get('parola_tetti')
    ramponi = indagine.get('ramponi')
    d1_ok = indagine.get('d1_ok')
    chi_conf = indagine.get('chi_confermato')
    soglia_fuga = SOGLIA_FUGA + (1 if parola_tetti else 0)
    tratta_soglia = 2 if parola_tetti else 1   # il Gatto tratta a <= questo n. di Ferite

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
    gatto_apparso = [False]

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
            log(f'    La caccia si scalda (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')
        if canto == soglia_fuga:
            log(f'    *** SOGLIA-FUGA ({soglia_fuga}): il Primo Gatto punta la cresta. '
                f'Agganciatelo ORA o sparisce. ***')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 Gatto minore (Sgherro){" — subito" if subito else ""}.')

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
                        applica_danno(b, SGHERRO['dan'], 'Gatto minore (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')
            elif tipo == 'insidiaB':
                if vivi():
                    b = random.choice(vivi())
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'quota':
                # caduta di quota: fallire = 1 round perso (nessun danno). Ramponi annullano.
                if vivi() and not ramponi:
                    b = random.choice(vivi())
                    if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media'):
                        log(f'    {b}: resta aggrappato — 1 round perso (la FUGA avanza).')
                        aggiungi_canto()
            elif tipo == 'quotaB':
                # caduta di quota col vuoto: fallire = 1 danno. Ramponi annullano.
                if vivi() and not ramponi:
                    b = random.choice(vivi())
                    if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media'):
                        applica_danno(b, DANNO_QUOTA, titolo)
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
                applica_danno(b, e['dan'], 'Gatto minore')
        if boss[0] and boss[0]['fer'] > 0:
            # Il Primo Gatto è agile: due colpi per round (uno saltato con «la
            # commissione era cieca», D2).
            colpi = BOSS_COLPI
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi -= 1
                log('    [LA COMMISSIONE ERA CIECA — D2] il Primo Gatto esita: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'il Primo Gatto')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: lo strapiombo di partenza (senza Ramponi, e senza DOVE una guardia) ---
    if not d1_ok:
        log('  Senza DOVE (D1): salite alla cieca — 1 Gatto minore appare a T1.')
        spawn()
    if not ramponi:
        log('  Senza Ramponi: lo strapiombo di partenza è una prova (caduta = round perso).')

    # --- Fase 1: traversata T1..T5 ---
    for tile in TRAVERSATA:
        round_n += 1
        quota = tile in TESSERE_QUOTA
        log(f'--- Round {round_n}: {tile}'
            f'{" (pericolo di quota)" if quota else ""} · Canto {canto}/{soglia_fuga} fuga ---')
        if tile == 'T1' and d1_ok and round_n == 1:
            log('    [DOVE — D1] sapete dove salire: nessuna carta Minaccia questo round.')
        if tile == 'T4' and not gatto_apparso[0]:
            gatto_apparso[0] = True
            log('    Appare IL PRIMO GATTO in cresta: da ora la FUGA corre.')
        # pericolo di quota della tessera (comignolo/lucernario)
        if quota and vivi() and not ramponi:
            b = random.choice(vivi())
            if tile == 'T2':
                # comignolo: fallire = 1 round perso (la FUGA avanza)
                if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media'):
                    log(f'    {b}: resta aggrappato al comignolo — 1 round perso.')
                    aggiungi_canto()
            elif tile == 'T5':
                # lucernario: fallire = 1 danno (vetro) + FUGA
                if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media'):
                    applica_danno(b, DANNO_QUOTA, 'il vetro del lucernario')
                    aggiungi_canto()
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok):
            fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (party wipe in traversata)'
            break

    # --- Fase 2: T6, l'Attico — boss + negoziato ---
    if esito is None:
        boss[0] = dict(PRIMO_GATTO)
        boss[0]['fer'] += custode_extra_fer
        if chi_conf:
            boss[0]['salta_attacco'] = True
        log(f'--- Round {round_n + 1}+: L’ATTICO DEL CORSO (T6) — il Primo Gatto '
            f'(Fer {boss[0]["fer"]}, tratta a {tratta_soglia}) ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): Primo Gatto {max(boss[0]["fer"],0)}/'
                f'{PRIMO_GATTO["fer"] + custode_extra_fer} · Canto {canto}/{soglia_fuga} '
                f'{"(FUGA APERTA)" if canto >= soglia_fuga else ""} ---')
            if not vivi():
                esito = 'SCONFITTA (party wipe all’Attico)'
                break
            # FUGA aperta: mentre vi scadete a bloccarlo, i Gatti lo coprono e
            # la cresta frana — 1 danno inevitabile a un eroe/round (chi indugia).
            if canto >= soglia_fuga and vivi():
                applica_danno(random.choice(vivi()), 1, 'i Gatti coprono la fuga')
                if not vivi():
                    esito = 'SCONFITTA (party wipe all’Attico)'
                    break
            vivi_ora = list(vivi())
            attaccanti_boss = vivi_ora[:BOSS_INGAGGIO]
            ripulitori = vivi_ora[BOSS_INGAGGIO:]
            eroi_ripuliscono(ripulitori)
            if boss[0]['fer'] > tratta_soglia:
                for n in attaccanti_boss:
                    if boss[0]['fer'] <= tratta_soglia:
                        break
                    if roll2d6() + HERO[n]['vigore'] + 1 >= boss[0]['dif']:
                        boss[0]['fer'] -= 1
            fase_minaccia()
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            # negoziato: il Gatto ridotto alla soglia-tratta parla
            if boss[0]['fer'] <= tratta_soglia and vivi():
                piena = indagine.get('intrusi_documentati')
                esito = 'VITTORIA' if piena else 'VITTORIA-PARZIALE'
                log(f'    Il Primo Gatto TRATTA: dice della commissione cieca e dell’ordine di '
                    f'«lasciare». {"Intrusi documentati: torsione PIENA." if piena else "Intrusi non documentati: torsione a metà."}')
            elif canto >= soglia_fuga and boss[0]['fer'] > tratta_soglia and vivi():
                # la cresta è vicina e il Gatto è ancora integro: scavalca e sparisce
                esito = 'VITTORIA-PARZIALE'
                log('    *** Il Primo Gatto scavalca la cresta e sparisce nel buio: '
                    'refurtiva recuperata, ma niente conferma della commissione. ***')
            elif not vivi():
                esito = 'SCONFITTA (party wipe all’Attico)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  soglia-fuga {soglia_fuga}')
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
                pct_parola=sum(1 for x in ind if x['parola_tetti']) / n * 100,
                pct_intrusi=sum(1 for x in ind if x['intrusi_documentati']) / n * 100)


ROSTER_14 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_14, size))
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
                 'media_canto', 'media_ore', 'media_luoghi', 'pct_parola', 'pct_intrusi')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep14-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep14-{size:02d}', size, 5, 30,
                                            seed_base=740000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep14.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 14 — curva 2-10 (tetti del Corso, quota + FUGA + negoziato)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep14: SOGLIA_FUGA={SOGLIA_FUGA} (+1 Parola), '
                f'quota={sorted(TESSERE_QUOTA)}, BOSS_INGAGGIO={BOSS_INGAGGIO}, '
                f'BOSS_COLPI={BOSS_COLPI}. Seed 740000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % piena | % sofferte | Picco terra | Round | Canto | '
                'Ore av. | Luoghi | % Parola | % Intrusi |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_parola"]:.0f}% | {m["pct_intrusi"]:.0f}% |\n')
    print(f'\nCurva Episodio 14 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% piena, '
              f'{m["pct_sofferta"]:.0f}% sofferte, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
