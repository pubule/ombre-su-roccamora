# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 13 «Carta di pregio».

Indagine generica (clone di simulate_ep11/12), con una SPEDIZIONE dungeon-boss
al Molino delle Carte (vedi DESIGN-EPISODIO-13.md): ascesa lineare a 6 tessere
con pericoli d'ambiente (roggia T2, macine T3, essiccatoio T5) e una
SOGLIA-FUOCO legata al Canto.

  - OBIETTIVO: raggiungere il torchio (T6), superare/abbattere il Sorvegliante
    (boss) e SEQUESTRARE i registri (Interagire). Con la Cassetta Stagna sono
    SALVI a prescindere dal fuoco = VITTORIA PIENA. Senza, se il Canto ha
    superato la SOGLIA_FUOCO, la prova è degradata = VITTORIA PARZIALE.
  - FUOCO: il Notaio (T4) ordina il rogo; i crescendo spingono il Canto verso
    SOGLIA_FUOCO; oltre, l'Essiccatoio (T5) e il Torchio (T6) sono in fiamme
    (prova NERVI o 1 danno). Il Taccuino del Capo-Catena alza la SOGLIA_FUOCO.
  - IL NOTAIO non si prende: appare in T4 e fugge (flavor; nel sim non combatte).

PONYTAIL: modello a blocco (traversata + resa dei conti al torchio), non la
griglia tattica. La tensione è il boss + i pericoli + il fuoco che degrada la
prova. Config di produzione condivisa importata da simulate_playtest:
INTOCCABILE. Seed base 730000.
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
from gen_ep13 import NEMICI_13  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_13)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
TESSERE_PERICOLO = {'T2', 'T3', 'T5'}   # roggia / macine / essiccatoio
SOGLIA_FUOCO = 4            # Canto oltre cui i magazzini bruciano (5 col Taccuino)
DANNO_FUOCO = 1            # danno ad attraversare T5/T6 in fiamme (fallita NERVI)
BOSS_INGAGGIO = 3          # eroi che ingaggiano il Sorvegliante al torchio (T6 stretto)

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
# tipo: 'spawn' (uomo del molino), 'insidiaA' (ogni eroe NERVI Facile, perde
# azione), 'insidiaB' (l'eroe piu' avanzato prova, 1 danno), 'ambiente' (prova
# VIGORE/DESTREZZA: fallita = 1 round perso), 'crescendo' (+Canto/fuoco),
# 'quiete'/'favore'/'ostacolo'/'danno'.
MINACCE = [
    ('LA GUARDIA AL CANCELLO', 'spawn', False),
    ('ORDINI DAL SORVEGLIANTE', 'spawn', False),
    ('CHI SBARRA LA STRADA', 'spawn', True),
    ('RINCALZI DALLE MACINE', 'spawn', False),
    ('LA RONDA DEL CORTILE', 'spawn', False),
    ('IL FISCHIO DEL SORVEGLIANTE', 'spawn', True),
    ('CHI COPRE LA FUGA DEL NOTAIO', 'spawn', False),
    ('LA CORRENTE DELLA ROGGIA', 'ambiente', False),
    ('L’INGRANAGGIO DELLE MACINE', 'insidiaB', False),
    ('LA PASSERELLA SCIVOLOSA', 'ambiente', False),
    ('LA POLVERE CHE SOFFOCA', 'insidiaA', False),
    ('IL TELAIO CHE CADE', 'insidiaB', False),
    ('LO STRACCIO IN FIAMME', 'insidiaB', False),
    ('ODORE DI FUMO', 'crescendo', False),
    ('IL PRIMO FOCOLAIO', 'crescendo', False),
    ('I MAGAZZINI BRUCIANO', 'crescendo', False),
    ('IL TETTO PRENDE', 'crescendo', False),
    ('LA MACINA SI FERMA', 'quiete', False),
    ('UNA PORTA D’ACQUA APERTA', 'favore', False),
    ('BALLE DI STRACCI SUL PASSO', 'ostacolo', False),
    ('UNA TRAVE IN FIAMME', 'danno', False),
]

# Rivelatorio Domanda 2 (chi amministra = il Notaio), 3 carte in aperti:
# L1-Testimonianza, L2-Referto, L4-Testimonianza.
CHI_ESPLICITO = {(1, 'Testimonianza'), (2, 'Referto'), (4, 'Testimonianza')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. cassetta=L8 (D4); lasciapassare=L1;
# taccuino=L5 (deposizione). incrocio_d1 (DOVE: L4 bolle + L8 deposito);
# incrocio_d3 (COSA SAPEVA: L5 appunti + L7 registro) -> deposizione_ok.
LUOGHI_SIM = [
    dict(n=1, nome='La Stazione delle Carrozze', req=None, chiude=None,
         sblocca_parola=('LA CARTA COL GIGLIO', 'IL NOLO PUNTUALE'),
         approf=['Testimonianza'], lasciapassare=True),
    dict(n=2, nome='Lo Studio del Notaio', req=None, chiude=None,
         sblocca_parola=('IL NOLO PUNTUALE', 'IL CAPO-CATENA ANNEGATO'),
         approf=['Referto']),
    dict(n=3, nome='L’Ufficio del Fermo-Posta', req=None, chiude=None,
         sblocca_parola=('LA CARTA COL GIGLIO', 'IL MOLINO FUORI PORTA'),
         approf=['Osservazione']),
    dict(n=4, nome='La Dogana Vecchia', req=None, chiude=None,
         sblocca_parola=('IL MOLINO FUORI PORTA', 'IL CAPO-CATENA ANNEGATO'),
         approf=['Testimonianza'], incrocio_d1=True),
    dict(n=5, nome='La Casa del Capo-Catena', req=('parola', 'IL CAPO-CATENA ANNEGATO'),
         chiude=None, approf=['Presagio'], taccuino=True, incrocio_d3=True),
    dict(n=6, nome='La Cancelleria Vescovile', req=('parola', 'LA CARTA COL GIGLIO'),
         chiude=None, approf=['Osservazione']),
    dict(n=7, nome='La Prefettura', req=('parola', 'IL NOLO PUNTUALE'),
         chiude=None, approf=['Referto'], incrocio_d3=True),
    dict(n=8, nome='Il Deposito delle Risme', req=('parola', 'IL MOLINO FUORI PORTA'),
         chiude=20, approf=['Osservazione'], cassetta=True, incrocio_d1=True),
    dict(n=9, nome='Il Molino delle Carte', req=('parola', 'LA CARTA COL GIGLIO'),
         chiude=None, approf=['Presagio'], fuori_citta=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 13: "Carta di pregio"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    cassetta = lasciapassare = taccuino = False
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

    def costo(l):
        return 2 if l.get('fuori_citta') else 1   # il Molino è fuori città

    def raggiungibile(l):
        if ora_corrente >= (l['chiude'] or 99):
            return False
        if ore < costo(l):
            return False
        req = l.get('req')
        if req is None:
            return True
        return req[1] in parole

    def punteggio(l):
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        cas_pri = 0 if (not cassetta and l.get('cassetta')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('cassetta') and not cassetta)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        trasferta = costo(l)   # preferisci luoghi in città (costo 1) a parità
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, cas_pri, missione, strutturale, trasferta, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: la filiera la amministra il Notaio (Domanda 2).')
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
        cand_missione = ((l.get('cassetta') and not cassetta)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2))
        if (approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Nucleo garantito in mano: il gruppo chiude con {ore} '
                f'ore in banca (Vantaggio).')
            break
        c = costo(l)
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Visita Luogo {l["n"]} — {l["nome"]}  '
            f'({c} or{"e" if c > 1 else "a"}{" — trasferta" if c > 1 else ""})')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('cassetta'):
            cassetta = True
            log('    -> Trovata: LA CASSETTA STAGNA (registri salvi dal fuoco — Domanda 4).')
        if l.get('lasciapassare'):
            lasciapassare = True
            log('    -> Trovato: IL LASCIAPASSARE DEL NOLO (salta lo sbarramento T1).')
        if l.get('taccuino'):
            taccuino = True
            log('    -> Trovato: IL TACCUINO DEL CAPO-CATENA (soglia-fuoco +1, ambiente Facile).')
        if l.get('incrocio_d1'):
            incroci_d1 += 1
        if l.get('incrocio_d3'):
            incroci_d3 += 1
        if ok:
            tenta_approf(l)
        else:
            approf_falliti += len(l['approf'])
        ore -= c
        ora_corrente += c

    ore_avanzate = ore
    d1_ok = incroci_d1 >= 2
    deposizione_ok = incroci_d3 >= 2   # «il testimone che non c'è più» (D3)
    tutte_esatte = cassetta and d1_ok and deposizione_ok and chi_confermato
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Cassetta: {"sì" if cassetta else "no"}; Lasciapassare: {"sì" if lasciapassare else "no"}; '
        f'Taccuino/D3 ({incroci_d3}): {"ok" if deposizione_ok else "NO"}; '
        f'DOVE/D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, cassetta=cassetta, lasciapassare=lasciapassare,
                taccuino=taccuino, deposizione_ok=deposizione_ok, d1_ok=d1_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

SORVEGLIANTE = dict(NEMICO['IL SORVEGLIANTE DEL MOLINO'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = il torchio


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - Il Molino delle Carte, prima che bruci')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Cassetta: '
        f'{"sì" if indagine["cassetta"] else "no"}  |  Taccuino: '
        f'{"sì" if indagine["taccuino"] else "no"}  |  Lasciapassare: '
        f'{"sì" if indagine["lasciapassare"] else "no"}')

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

    cassetta = indagine.get('cassetta')
    taccuino = indagine.get('taccuino')
    lasciapassare = indagine.get('lasciapassare')
    chi_conf = indagine.get('chi_confermato')
    amb_bonus = 1 if taccuino else 0
    soglia_fuoco = SOGLIA_FUOCO + (1 if taccuino else 0)

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
    notaio_apparso = [False]

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
            log(f'    Il fuoco monta (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')
        if canto == soglia_fuoco:
            log(f'    *** SOGLIA-FUOCO ({soglia_fuoco}): i magazzini bruciano. '
                f'Essiccatoio e Torchio in fiamme. ***')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 uomo del molino (Sgherro){" — subito" if subito else ""}.')

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
                        applica_danno(b, SGHERRO['dan'], 'uomo del molino (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile', amb_bonus)
            elif tipo == 'insidiaB':
                if vivi():
                    b = max(vivi(), key=lambda n: 0)  # l'eroe più avanzato (astratto)
                    b = random.choice(vivi())
                    if not prova_nervi(b, 'Media', amb_bonus):
                        applica_danno(b, 1, titolo)
            elif tipo == 'ambiente':
                if vivi():
                    b = random.choice(vivi())
                    if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media', amb_bonus):
                        log(f'    {b}: travolto dall’ambiente — 1 round perso (nessun danno).')
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
                applica_danno(b, e['dan'], 'uomo del molino')
        if boss[0] and boss[0]['fer'] > 0:
            # Il Sorvegliante guarda il torchio con la forza della disperazione:
            # due colpi per round (uno saltato con «il nome del Notaio», D2).
            colpi = 2
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi = 1
                log('    [IL NOME DEL NOTAIO — D2] il Sorvegliante esita: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'il Sorvegliante')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    def fuoco_attivo():
        return canto >= soglia_fuoco

    if not lasciapassare:
        log('  Senza Lasciapassare del Nolo: 2 uomini al cancello (T1).')
        spawn(); spawn()
    else:
        log('  [LASCIAPASSARE] Entrate come gente del trasporto: nessuno sbarramento a T1.')

    # --- Fase 1: traversata T1..T5 ---
    for tile in TRAVERSATA:
        round_n += 1
        pericolo = tile in TESSERE_PERICOLO
        log(f'--- Round {round_n}: {tile}'
            f'{" (pericolo d’ambiente)" if pericolo else ""} · Canto {canto}/{soglia_fuoco} fuoco ---')
        if tile == 'T4' and not notaio_apparso[0]:
            notaio_apparso[0] = True
            log('    Appare IL NOTAIO: ordina il rogo e fugge in carrozza (non si prende).')
        # pericolo d'ambiente della tessera (roggia/macine/essiccatoio)
        if pericolo and vivi():
            b = random.choice(vivi())
            if tile == 'T2':
                # roggia: fallire = 1 round perso (nessun danno)
                if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media', amb_bonus):
                    log(f'    {b}: travolto dalla roggia — 1 round perso.')
            elif tile == 'T3':
                # macine: fallire = 1 danno (ingranaggi)
                if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media', amb_bonus):
                    applica_danno(b, 1, 'gli ingranaggi delle macine')
            elif tile == 'T5' and fuoco_attivo():
                # essiccatoio in fiamme: OGNI eroe prova NERVI o 1 danno
                for h in list(vivi()):
                    if not prova_nervi(h, 'Media', amb_bonus):
                        applica_danno(h, DANNO_FUOCO, 'l’essiccatoio in fiamme')
        eroi_ripuliscono(list(vivi()))
        fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (party wipe in traversata)'
            break

    # --- Fase 2: T6, il torchio — boss + sequestro ---
    if esito is None:
        boss[0] = dict(SORVEGLIANTE)
        boss[0]['fer'] += custode_extra_fer
        if chi_conf:
            boss[0]['salta_attacco'] = True
        log(f'--- Round {round_n + 1}+: LA SALA DEL TORCHIO (T6) — il Sorvegliante '
            f'(Fer {boss[0]["fer"]}) ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): Sorvegliante {max(boss[0]["fer"],0)}/'
                f'{SORVEGLIANTE["fer"] + custode_extra_fer} · Canto {canto} '
                f'({"FUOCO" if fuoco_attivo() else "no fuoco"}) ---')
            # il torchio in fiamme: pericolo di stanza, OGNI eroe prova NERVI o 1 danno
            if fuoco_attivo() and vivi():
                for h in list(vivi()):
                    if not prova_nervi(h, 'Media', amb_bonus):
                        applica_danno(h, DANNO_FUOCO, 'il torchio in fiamme')
            # inferno: superata la soglia di due, il tetto cede — 1 danno
            # INEVITABILE a un eroe/round (chi indugia al torchio brucia)
            if canto >= soglia_fuoco + 1 and vivi():
                applica_danno(random.choice(vivi()), 1, 'una trave in fiamme (inevitabile)')
            if not vivi():
                esito = 'SCONFITTA (party wipe al torchio)'
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
                    log('    *** IL SORVEGLIANTE È A TERRA: la strada al torchio è libera. ***')
            fase_minaccia()
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            # sequestro: appena il Sorvegliante è giù, un eroe prende i registri
            if boss[0]['fer'] <= 0 and vivi():
                piena = cassetta or not fuoco_attivo()
                esito = 'VITTORIA' if piena else 'VITTORIA-PARZIALE'
                log(f'    Registri sequestrati. {"In Cassetta Stagna: prova INTATTA." if cassetta else ("Fuoco non ancora alto: prova intatta." if not fuoco_attivo() else "Fuoco alto, senza Cassetta: prova DEGRADATA.")}')
            elif not vivi():
                esito = 'SCONFITTA (party wipe al torchio)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  soglia-fuoco {soglia_fuoco}')
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
                pct_cassetta=sum(1 for x in ind if x['cassetta']) / n * 100,
                pct_depo=sum(1 for x in ind if x['deposizione_ok']) / n * 100)


ROSTER_13 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_13, size))
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
                 'media_canto', 'media_ore', 'media_luoghi', 'pct_cassetta', 'pct_depo')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep13-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep13-{size:02d}', size, 5, 30,
                                            seed_base=730000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep13.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 13 — curva 2-10 (Molino delle Carte, dungeon-boss + fuoco)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep13: SOGLIA_FUOCO={SOGLIA_FUOCO} (+1 Taccuino), '
                f'pericolo={sorted(TESSERE_PERICOLO)}, BOSS_INGAGGIO={BOSS_INGAGGIO}. '
                f'Seed 730000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % piena | % sofferte | Picco terra | Round | Canto | '
                'Ore av. | Luoghi | % Cassetta | % Depo |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_cassetta"]:.0f}% | {m["pct_depo"]:.0f}% |\n')
    print(f'\nCurva Episodio 13 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% piena, '
              f'{m["pct_sofferta"]:.0f}% sofferte, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
