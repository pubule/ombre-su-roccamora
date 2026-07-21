# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 15 «Lo smascheramento».

Indagine generica (clone di simulate_ep14), con una SPEDIZIONE che è una corsa
a DOCUMENTARE i tell del falso mentre gli Apparecchiatori li CANCELLANO e il
SIGILLO della Gendarmeria cala (vedi DESIGN-EPISODIO-15.md).

  - DOPPIA BUSTA: la Busta pubblica (le 4 Domande, «Braga è C.B.») si «chiude»
    comunque (vittoria pubblica); la CONTRO-busta («chi ha scritto il dossier?»)
    si apre solo se avete documentato abbastanza tell E preso il Capo
    Apparecchiatore. Metrica-tensione = % contro-busta (piena).
  - SIGILLO: alla SOGLIA_SIGILLO la Gendarmeria sigilla la villa; da lì niente
    più documentazione. La Chiave di Servizio dà un round di margine.
  - CANCELLAZIONE: da T4 gli Apparecchiatori cancellano 1 tell/round (finché il
    Capo è in piedi). Il Manuale Indiziario documenta +1 tell/round; il Reagente
    +1 tell iniziale.
  - Torsione «la soluzione che qualcuno ha scritto per voi»: la contro-busta.

PONYTAIL: modello a blocco (traversata + documentazione + boss), non la griglia
tattica. La tensione è il tempo (sigillo) e la prova che si cancella, non la
morte. Config di produzione condivisa importata da simulate_playtest:
INTOCCABILE. Seed base 750000.
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
from gen_ep15 import NEMICI_15  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_15)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
SOGLIA_SIGILLO = 5        # Canto oltre cui la Gendarmeria sigilla (6 con la Chiave)
PROVE_PIAZZATE = 5        # tell del falso da documentare (pool iniziale, +1 col Reagente)
SOGLIA_CONTRO = 4         # tell documentati per aprire la Contro-busta
CANCELLA_PER_ROUND = 2    # tell cancellati dagli Apparecchiatori da T4 (Capo vivo)
BOSS_INGAGGIO = 4         # eroi che ingaggiano il Capo Apparecchiatore (T6)
BOSS_COLPI = 2            # il Capo difende il suo lavoro: due colpi (uno saltato con D3)

# ============================ MAZZO MINACCIA (21: 7/6/4/4) ==================
# tipo: 'spawn' (Apparecchiatore/Sicario), 'cancella' (cancella 1 tell extra;
# annullato dal Manuale), 'disorienta' (l'eroe attivo NERVI o non documenta),
# 'insidiaB' (un eroe prova, 1 danno), 'crescendo' (+Canto/sigillo),
# 'quiete'/'favore'/'ostacolo'/'danno'.
MINACCE = [
    ('OMBRE CHE LUCIDANO', 'spawn', False),
    ('LA COPPIA DI SCENA', 'spawn', False),
    ('SICARI DI SCORTA', 'spawn', True),
    ('RINCALZI DAL SERVIZIO', 'spawn', False),
    ('IL CENNO DEL CAPO', 'spawn', False),
    ('CHI COPRE LA RITIRATA', 'spawn', False),
    ('MANI IN PIÙ', 'spawn', True),
    ('LA PROVA CHE SVANISCE', 'cancella', False),
    ('LO SPECCHIO DELLA SCENA', 'disorienta', False),
    ('IL PAVIMENTO LUCIDATO', 'insidiaB', False),
    ('LA PORTA CHE SI CHIUDE', 'ostacolo', False),
    ('IL FARO DELLA RONDA', 'crescendo', False),
    ('LA STANZA RIFATTA', 'cancella', False),
    ('PASSI NEL CORTILE', 'crescendo', False),
    ('IL CORDONE SI STRINGE', 'crescendo', False),
    ('LA GENDARMERIA ALLA PORTA', 'crescendo', False),
    ('IL SIGILLO DI CERALACCA', 'crescendo', False),
    ('LA CASA CHE TACE', 'quiete', False),
    ('UNA FINESTRA SUL RETRO', 'favore', False),
    ('MOBILI SPOSTATI', 'ostacolo', False),
    ('UN COLPO AL BUIO', 'danno', False),
]

# Rivelatorio Domanda 2 (chi accusa = Braga), 3 carte in aperti: L1-Referto,
# L2-Testimonianza, L4-Testimonianza.
CHI_ESPLICITO = {(1, 'Referto'), (2, 'Testimonianza'), (4, 'Testimonianza')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. manuale=L5 (D3/contro-busta);
# chiave=L8; reagente=L7. incrocio_d1 (DOVE: L1 dossier + L7 deposito).
LUOGHI_SIM = [
    dict(n=1, nome='La Gendarmeria', req=None, chiude=None,
         sblocca_parola=('IL DOSSIER CHE COMBACIA', 'IL TESTIMONE OCULARE'),
         approf=['Referto'], incrocio_d1=True),
    dict(n=2, nome='Il Tribunale', req=None, chiude=None,
         sblocca_parola=('IL DOSSIER CHE COMBACIA', 'IL METODO DELLA SOCIETÀ'),
         approf=['Testimonianza']),
    dict(n=3, nome='La Gazzetta di Roccamora', req=None, chiude=None,
         sblocca_parola=('IL METODO DELLA SOCIETÀ', 'LA SCENA NON ANCORA SIGILLATA'),
         approf=['Osservazione']),
    dict(n=4, nome='La Stanza del Testimone', req=None, chiude=None,
         sblocca_parola=('IL TESTIMONE OCULARE', 'LA SCENA NON ANCORA SIGILLATA'),
         approf=['Testimonianza']),
    dict(n=5, nome='L’Archivio dei Manuali', req=('parola', 'IL METODO DELLA SOCIETÀ'),
         chiude=None, approf=['Presagio'], manuale=True),
    dict(n=6, nome='Lo Studio del Perito', req=('parola', 'IL TESTIMONE OCULARE'),
         chiude=None, approf=['Osservazione']),
    dict(n=7, nome='Il Deposito Reperti', req=('parola', 'IL DOSSIER CHE COMBACIA'),
         chiude=21, approf=['Referto'], reagente=True, incrocio_d1=True),
    dict(n=8, nome='La Bottega dell’Incisore', req=('parola', 'IL DOSSIER CHE COMBACIA'),
         chiude=None, approf=['Osservazione'], chiave=True),
    dict(n=9, nome='La Villa di Braga', req=('parola', 'LA SCENA NON ANCORA SIGILLATA'),
         chiude=None, approf=['Presagio']),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 15: "Lo smascheramento"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    manuale = chiave = reagente = False
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
        man_pri = 0 if (not manuale and l.get('manuale')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('manuale') and not manuale)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('chiave') and not chiave)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, man_pri, missione, strutturale, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: il dossier accusa Braga (Domanda 2).')
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
        cand_missione = ((l.get('manuale') and not manuale)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('chiave') and not chiave))
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
        if l.get('manuale'):
            manuale = True
            log('    -> Trovato: IL MANUALE INDIZIARIO (documenta +1 tell/round; D3 metodo).')
        if l.get('chiave'):
            chiave = True
            log('    -> Trovata: LA CHIAVE DI SERVIZIO (salta il cordone T1, margine sul sigillo).')
        if l.get('reagente'):
            reagente = True
            log('    -> Trovato: IL REAGENTE (+1 tell documentabile all’inizio).')
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
    metodo = manuale   # D3 «il metodo della società» = avere il Manuale (dall'Archivio)
    tutte_esatte = d1_ok and chi_confermato and manuale and chiave
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Manuale/D3: {"sì" if manuale else "no"}; Chiave: {"sì" if chiave else "no"}; '
        f'Reagente: {"sì" if reagente else "no"}; DOVE/D1 ({incroci_d1}): '
        f'{"ok" if d1_ok else "NO"}; D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, manuale=manuale, chiave=chiave,
                reagente=reagente, metodo=metodo, d1_ok=d1_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

CAPO = dict(NEMICO['IL CAPO APPARECCHIATORE'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = lo studio segreto
TESSERE_DOC = {'T2', 'T3'}                     # dove i tell sono fitti


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La villa di Braga, prima del sigillo')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Manuale: '
        f'{"sì" if indagine["manuale"] else "no"}  |  Chiave: '
        f'{"sì" if indagine["chiave"] else "no"}  |  Reagente: '
        f'{"sì" if indagine["reagente"] else "no"}')

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

    manuale = indagine.get('manuale')
    chiave = indagine.get('chiave')
    reagente = indagine.get('reagente')
    d1_ok = indagine.get('d1_ok')
    metodo = indagine.get('metodo')
    soglia_sigillo = SOGLIA_SIGILLO + (1 if chiave else 0)
    doc_rate = 1 + (1 if manuale else 0)

    tell_pool = [PROVE_PIAZZATE]
    tell_doc = [1 if reagente else 0]   # il Reagente documenta subito un tell
    sigillato = [False]

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
    apparecchiatori_in_campo = [False]
    disorientato = [False]

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
            log(f'    Il cordone si muove (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')
        if canto >= soglia_sigillo and not sigillato[0]:
            sigillato[0] = True
            log(f'    *** SIGILLO ({soglia_sigillo}): la Gendarmeria entra e sigilla la villa. '
                f'Fine documentazione. ***')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 Apparecchiatore/Sicario (Sgherro){" — subito" if subito else ""}.')

    def documenta(quanti):
        # documenta fino a `quanti` tell dal pool, se non sigillati e non disorientati
        if sigillato[0] or disorientato[0] or tell_pool[0] <= 0:
            return
        n = min(quanti, tell_pool[0])
        tell_pool[0] -= n
        tell_doc[0] += n
        if n:
            log(f'    Documentati {n} tell (tot {tell_doc[0]}/{SOGLIA_CONTRO}; pool {tell_pool[0]}).')

    def cancella(quanti):
        if tell_pool[0] <= 0:
            return
        n = min(quanti, tell_pool[0])
        tell_pool[0] -= n
        if n:
            log(f'    Gli Apparecchiatori cancellano {n} tell (pool {tell_pool[0]}).')

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
                        applica_danno(b, SGHERRO['dan'], 'Apparecchiatore (subito)')
            elif tipo == 'cancella':
                if not manuale:
                    cancella(1)      # un tell extra sparisce; il Manuale lo salva
                else:
                    log('    [MANUALE] riconosciuto al volo: nessun tell perso extra.')
            elif tipo == 'disorienta':
                if vivi():
                    b = random.choice(vivi())
                    if not prova_nervi(b, 'Media'):
                        disorientato[0] = True   # niente documentazione questo round
                        log(f'    {b} disorientato: nessun tell documentato questo round.')
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
                applica_danno(b, e['dan'], 'Apparecchiatore/Sicario')
        if boss[0] and boss[0]['fer'] > 0:
            colpi = BOSS_COLPI
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi -= 1
                log('    [IL METODO DELLA SOCIETÀ — D3] il Capo esita: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'il Capo Apparecchiatore')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: il cordone (con la Chiave si entra di soppiatto) ---
    if not d1_ok:
        log('  Senza DOVE (D1): entrate scomposti — 1 gendarme (Sgherro) appare a T1.')
        spawn()
    if chiave:
        log('  [CHIAVE] Entrate dal servizio: niente cordone, un round di margine sul sigillo.')

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
        disorientato[0] = False
        log(f'--- Round {round_n}: {tile} · Canto {canto}/{soglia_sigillo} sigillo · '
            f'tell {tell_doc[0]}/{SOGLIA_CONTRO} (pool {tell_pool[0]}) ---')
        if tile == 'T1' and d1_ok and round_n == 1:
            log('    [DOVE — D1] sapete dove guardare: nessuna carta Minaccia questo round.')
        if tile == 'T4' and not apparecchiatori_in_campo[0]:
            apparecchiatori_in_campo[0] = True
            log('    Appaiono gli APPARECCHIATORI: da ora cancellano i tell ogni round.')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok):
            fase_minaccia()
        # documentazione dei tell (nelle tessere fitte si fa qualcosa; altrove
        # solo col Manuale si tiene il passo)
        if vivi() and (tile in TESSERE_DOC or manuale):
            documenta(doc_rate)
        # cancellazione degli Apparecchiatori (da T4, boss vivo)
        if apparecchiatori_in_campo[0]:
            cancella(CANCELLA_PER_ROUND)
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (party wipe nella villa)'
            break

    # --- Fase 2: T6, lo studio segreto — boss + doppia busta ---
    if esito is None:
        boss[0] = dict(CAPO)
        boss[0]['fer'] += custode_extra_fer
        if metodo:
            boss[0]['salta_attacco'] = True
        capo_preso = [False]
        log(f'--- Round {round_n + 1}+: LO STUDIO SEGRETO (T6) — il Capo Apparecchiatore '
            f'(Fer {boss[0]["fer"]}) ---')
        while esito is None:
            round_n += 1
            disorientato[0] = False
            log(f'--- Round {round_n} (T6): Capo {max(boss[0]["fer"],0)}/'
                f'{CAPO["fer"] + custode_extra_fer} · Canto {canto}/{soglia_sigillo} '
                f'{"(SIGILLATA)" if sigillato[0] else ""} · tell {tell_doc[0]}/{SOGLIA_CONTRO} ---')
            if not vivi():
                esito = 'SCONFITTA (party wipe nella villa)'
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
                    capo_preso[0] = True
                    log('    *** IL CAPO APPARECCHIATORE È PRESO: ottenete le Istruzioni con la '
                        'Grafia di Braga. ***')
            fase_minaccia()
            # ancora qualche tell documentabile al torchio del falso, se non sigillato
            if vivi() and not capo_preso[0]:
                documenta(doc_rate)
            # cancellazione finché il Capo è in piedi
            if boss[0]['fer'] > 0:
                cancella(CANCELLA_PER_ROUND)
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            if capo_preso[0] and vivi():
                piena = tell_doc[0] >= SOGLIA_CONTRO
                esito = 'VITTORIA' if piena else 'VITTORIA-PARZIALE'
                log(f'    Doppia busta: {"CONTRO-BUSTA aperta (tell a sufficienza)" if piena else "solo Busta pubblica (tell insufficienti)"}.')
            elif not vivi():
                esito = 'SCONFITTA (party wipe nella villa)'
            elif round_n > 40:
                esito = 'TIMEOUT'
            elif sigillato[0] and boss[0]['fer'] > 0 and tell_pool[0] <= 0:
                # sigillata, tell esauriti e Capo ancora in piedi: la scena è persa
                esito = 'VITTORIA-PARZIALE'
                log('    *** Villa sigillata e tell esauriti: resta la sola Busta pubblica '
                    '(Braga arrestato, verità persa). ***')

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  tell {tell_doc[0]}/'
        f'{SOGLIA_CONTRO}  |  soglia-sigillo {soglia_sigillo}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena, tell_doc=tell_doc[0])


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
                media_tell=sum(x['tell_doc'] for x in sp) / n,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_manuale=sum(1 for x in ind if x['manuale']) / n * 100,
                pct_chiave=sum(1 for x in ind if x['chiave']) / n * 100)


ROSTER_15 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_15, size))
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
                 'media_canto', 'media_tell', 'media_ore', 'media_luoghi', 'pct_manuale',
                 'pct_chiave')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep15-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep15-{size:02d}', size, 5, 30,
                                            seed_base=750000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep15.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 15 — curva 2-10 (villa di Braga, doppia busta + sigillo)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep15: SOGLIA_SIGILLO={SOGLIA_SIGILLO} (+1 Chiave), '
                f'PROVE_PIAZZATE={PROVE_PIAZZATE}, SOGLIA_CONTRO={SOGLIA_CONTRO}, '
                f'CANCELLA={CANCELLA_PER_ROUND}, BOSS_INGAGGIO={BOSS_INGAGGIO}. '
                f'Seed 750000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % contro-busta | % sofferte | Picco terra | Round | Canto | '
                'Tell | Ore av. | Luoghi | % Manuale | % Chiave |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_tell"]:.1f} | {m["media_ore"]:.1f} | '
                    f'{m["media_luoghi"]:.1f} | {m["pct_manuale"]:.0f}% | {m["pct_chiave"]:.0f}% |\n')
    print(f'\nCurva Episodio 15 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% contro-busta, '
              f'{m["pct_sofferta"]:.0f}% sofferte, tell {m["media_tell"]:.1f}, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
