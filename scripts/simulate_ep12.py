# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 12 «La seconda copia».

Indagine generica (clone di simulate_ep11), con una SPEDIZIONE nuova:
L'INSEGUIMENTO DEL CORRIERE (vedi DESIGN-EPISODIO-12.md). Ascesa lineare a 6
tessere lungo il canale, ma il boss e' un BERSAGLIO MOBILE:

  - FUGA: una traccia che misura il vantaggio del Corriere. Parte da un
    vantaggio iniziale (dalla D4; dimezzato dalla torsione D3 «le porte
    aperte»; il Registro dei Ritiri lo accorcia ancora). Sale di 1 a ogni
    crescendo (la corrente), di 1 quando la scorta comprata vi BLOCCA (round
    perso), di 1 a T4 se non avete la Lanterna Sorda (nebbia). Si TAGLIA di
    TAGLIO_PONTE ai ponti coperti (T2, T5) col Fischietto della Ronda. Se
    raggiunge FUGA_MAX prima di T6, il Corriere consegna: SCONFITTA.
  - AGGANCIO: arrivare a T6 con la FUGA sotto il massimo = lo bloccate,
    copie sequestrate: VITTORIA. Il Corriere fugge, non combatte: non lo si
    abbatte, lo si taglia fuori ai ponti e lo si aggancia al traguardo.

Il Corriere non attacca; la scorta (Sgherri + il Sicario Gentile se
sopravvissuto all'Ep. 9) fa danno lieve ma soprattutto BLOCCA (ruba il round
dell'aggancio). Picco d'atto: il Canto parte da CANTO_MORALE (la sede violata).

PONYTAIL: modello a corsa (FUGA vs traguardo), non la griglia tattica: la
tensione e' il vantaggio che scappa, non l'affollamento. Config di produzione
condivisa (finale_v3, TICK_CANTO_OGNI, SOGLIA_CANTO, SALUTE_BONUS_PER_N)
importata da simulate_playtest: INTOCCABILE. Seed base 720000.
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
from gen_ep12 import NEMICI_12  # noqa: E402
from gen_ep9 import NEMICI_9  # noqa: E402  (IL SICARIO GENTILE, scorta ai ponti)
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_9 + NEMICI_12)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
FUGA_MAX = 10           # caselle della traccia FUGA (piena = consegna = sconfitta)
FUGA_INIZIALE_OK = 3    # vantaggio iniziale del Corriere con D3 esatta (dimezzato)
FUGA_INIZIALE_NO = 6    # vantaggio iniziale con D3 sbagliata (credete all'effrazione)
TAGLIO_PONTE = 1        # -FUGA ai ponti coperti (T2, T5) col Fischietto
FUGA_BACKGROUND = 1     # il Corriere rema comunque: +FUGA ogni round (T2+)
GUADAGNO_CAP = 1        # max FUGA recuperata/round dagli eroi liberi (chiudono il divario)
# La FUGA da crescendo è capata a 1/round: il vantaggio del Corriere non deve
# scalare col volume di carte (che cresce con la taglia), o i tavoli grandi
# esploderebbero. I crescendo extra nel round danno solo Canto.
CANTO_MORALE = 1        # il Canto parte da qui (la sede violata: dubbio in casa)
PONTI = {'T2', 'T5'}
NEBBIA_TILE = 'T4'
TRAPPOLA_TILE = 'T3'

# ============================ MAZZO MINACCIA (21: 8/4/5/4) ==================
# tipo: 'spawn' (scorta Sgherro), 'insidiaA' (ogni eroe NERVI Facile, perde
# azione), 'insidiaFuga' (FUGA +1 diretto o via prova), 'crescendo' (+Canto
# +FUGA), 'quiete'/'favore'/'ostacolo'/'danno'. `subito` = spawn attivo subito.
MINACCE = [
    ('I BRAVI DELLA SCORTA', 'spawn', False),
    ('UOMINI AI VARCHI', 'spawn', False),
    ('IL BLOCCO SUL PONTE', 'spawn', True),
    ('RINCALZI DAL CANALE', 'spawn', False),
    ('IL FISCHIO DELLA MALAVITA', 'spawn', True),
    ('CHI COPRE LA FUGA', 'spawn', False),
    ('IL PALO ALL’ANGOLO', 'spawn', False),
    ('LA BARCA DI TRAVERSO', 'spawn', True),
    ('LA CORRENTE CONTRARIA', 'insidiaFuga', False),
    ('LA NEBBIA CHE INGANNA', 'insidiaA', False),
    ('IL VICOLO CIECO', 'insidiaA', False),
    ('LO SCAMBIO DI BARCA', 'insidiaFuga', False),
    ('LA CORRENTE LO AIUTA', 'crescendo', False),
    ('IL CORRIERE ACCELERA', 'crescendo', False),
    ('UN VARCO SI APRE', 'crescendo', False),
    ('LA MAREA SALE', 'crescendo', False),
    ('LE CAMPANE COPRONO I PASSI', 'crescendo', False),
    ('LA BONACCIA', 'quiete', False),
    ('UN GONDOLIERE AMICO', 'favore', False),
    ('LA CHIATTA DI TRAVERSO', 'ostacolo', False),
    ('UN COLPO DI GAFFA', 'danno', False),
]

# Rivelatorio Domanda 2 (chi ha copiato = Godi, su ordine), 3 carte in aperti:
# L1-Referto, L2-Testimonianza, L4-Testimonianza.
CHI_ESPLICITO = {(1, 'Referto'), (2, 'Testimonianza'), (4, 'Testimonianza')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. fischietto=L8 (D4); registro=L3
# (accorcia FUGA iniziale + salta T3); lanterna=L9 (nega nebbia T4);
# incrocio_d1 (DOVE scambio: L2 biglietto + L3 registro); incrocio_d3 (COME:
# L1 perizia sigilli + L2 ordini protocollati) -> porta_aperta_capita.
LUOGHI_SIM = [
    dict(n=1, nome='Il Palazzo del Lume', req=None, chiude=None,
         sblocca_parola=('I SIGILLI INTATTI', 'IL SEGNO SULLA CAMPANELLA'),
         approf=['Referto'], incrocio_d3=True),
    dict(n=2, nome='La Casa dell’Archivista', req=None, chiude=None,
         sblocca_parola=('I SIGILLI INTATTI', 'GLI ORDINI PROTOCOLLATI'),
         approf=['Testimonianza'], incrocio_d1=True, incrocio_d3=True),
    dict(n=3, nome='L’Ufficio del Fermo-Posta', req=None, chiude=20,
         sblocca_parola=('GLI ORDINI PROTOCOLLATI', 'IL FERMO-POSTA DI CAMILLO'),
         approf=['Osservazione'], incrocio_d1=True, registro=True),
    dict(n=4, nome='Il Banco dei Pegni', req=None, chiude=None,
         sblocca_parola=('IL FERMO-POSTA DI CAMILLO', 'IL SEGNO SULLA CAMPANELLA'),
         approf=['Testimonianza']),
    dict(n=5, nome='La Loggia dei Confratelli', req=('parola', 'I SIGILLI INTATTI'),
         chiude=None, approf=['Osservazione']),
    dict(n=6, nome='Lo Scriptorium', req=('parola', 'GLI ORDINI PROTOCOLLATI'),
         chiude=None, approf=['Referto']),
    dict(n=7, nome='Il Deposito dei Sigilli', req=('parola', 'I SIGILLI INTATTI'),
         chiude=None, approf=['Presagio']),
    dict(n=8, nome='Il Corpo di Guardia', req=('parola', 'IL FERMO-POSTA DI CAMILLO'),
         chiude=21, approf=['Testimonianza'], fischietto=True),
    dict(n=9, nome='Il Cimitero delle Barche', req=('parola', 'IL SEGNO SULLA CAMPANELLA'),
         chiude=None, approf=['Presagio'], lanterna=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 12: "La seconda copia"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    fischietto = registro = lanterna = False
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
        # Il Fischietto (D4) è indispensabile all'aggancio: un tavolo vero
        # sblocca subito la sua chiave («il fermo-posta di Camillo», da L3/L4).
        fis_pri = 0 if (not fischietto and l.get('fischietto')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('fischietto') and not fischietto)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, fis_pri, missione, strutturale, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: ha copiato l’archivista, su ordine (Domanda 2).')
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
        cand_missione = ((l.get('fischietto') and not fischietto)
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
        if l.get('fischietto'):
            fischietto = True
            log('    -> Trovato: IL FISCHIETTO DELLA RONDA (taglio FUGA ai ponti — Domanda 4).')
        if l.get('registro'):
            registro = True
            log('    -> Trovato: IL REGISTRO DEI RITIRI (FUGA iniziale più corta, salta T3).')
        if l.get('lanterna'):
            lanterna = True
            log('    -> Trovata: LA LANTERNA SORDA DEI CANALI (niente round di nebbia a T4).')
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
    porta_aperta = incroci_d3 >= 2   # COME: nessuno scasso, ordini autentici (D3)
    tutte_esatte = fischietto and d1_ok and porta_aperta and chi_confermato
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Fischietto: {"sì" if fischietto else "no"}; Registro: {"sì" if registro else "no"}; '
        f'Lanterna: {"sì" if lanterna else "no"}; COME/D3 ({incroci_d3}): '
        f'{"ok" if porta_aperta else "NO"}; DOVE/D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, fischietto=fischietto, registro=registro,
                lanterna=lanterna, porta_aperta=porta_aperta, d1_ok=d1_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

CORRIERE = dict(NEMICO['IL CORRIERE'])
SGHERRO = dict(NEMICO['LO SGHERRO'])
SICARIO = dict(NEMICO['IL SICARIO GENTILE'])


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - L’inseguimento del corriere, per i canali')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Fischietto: '
        f'{"sì" if indagine["fischietto"] else "no"}  |  Registro: '
        f'{"sì" if indagine["registro"] else "no"}  |  Lanterna: '
        f'{"sì" if indagine["lanterna"] else "no"}  |  COME(D3): '
        f'{"sì" if indagine["porta_aperta"] else "no"}')

    salute, salute_max = {}, {}
    tier = indagine['tier']
    bonus_salute = SALUTE_BONUS_PER_N.get(len(party), 0)
    for n in party:
        smax = HERO[n]['salute'] + (1 if tier in ('PREPARATI', 'SLANCIO') else 0) + bonus_salute
        salute[n] = salute_max[n] = smax
    down = set()
    secondo_fiato = dict(indagine.get('secondo_fiato') or {n: True for n in party})
    intuizione = [DOSSIER_ATTIVO and bool(indagine.get('dossier_completo'))]

    fischietto = indagine.get('fischietto')
    registro = indagine.get('registro')
    lanterna = indagine.get('lanterna')
    porta_aperta = indagine.get('porta_aperta')
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

    # Traccia FUGA: vantaggio iniziale del Corriere.
    fuga = (FUGA_INIZIALE_OK if porta_aperta else FUGA_INIZIALE_NO) - (1 if registro else 0)
    fuga = max(0, fuga)
    log(f'  FUGA iniziale: {fuga}/{FUGA_MAX} '
        f'({"D3 esatta, dimezzata" if porta_aperta else "D3 sbagliata, piena"}'
        f'{", −1 Registro" if registro else ""}).')

    canto = CANTO_MORALE
    canto_bonus_carte = [False]
    if canto >= SOGLIA_CANTO:
        canto_bonus_carte[0] = True
    log(f'  Canto iniziale (sede violata): {canto}.')

    scorta = []          # scorta comprata in campo (blocca il round dell'aggancio)
    cresc_used = [False]  # FUGA da crescendo già contata in questo round (cap 1/round)
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
            log(f'    La sede violata pesa (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')

    def spawn_scorta(subito=False):
        scorta.append(dict(nome='LO SGHERRO', fer=SGHERRO['fer'], att=SGHERRO['att'],
                           dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 bravo della scorta (Sgherro){" — attivo subito" if subito else ""}.')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def fase_minaccia():
        nonlocal fuga
        base = MINACCIA_FORMULE[formula_minaccia](len(vivi()))
        n_carte = int(base) + (1 if base % 1 and round_n % 2 == 0 else 0) \
            + (1 if canto_bonus_carte[0] else 0)
        for _ in range(n_carte):
            titolo, tipo, subito = pesca()
            log(f'  [MINACCIA] {titolo} ({tipo})')
            if tipo == 'spawn':
                spawn_scorta(subito)
                if subito and vivi():
                    b = min(vivi(), key=lambda n: salute[n])
                    if roll2d6() + SGHERRO['att'] >= HERO[b]['difesa']:
                        applica_danno(b, SGHERRO['dan'], 'scorta (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')
            elif tipo == 'insidiaFuga':
                fuga += 1
                log(f'    Il Corriere guadagna terreno: FUGA {fuga}/{FUGA_MAX}.')
            elif tipo == 'crescendo':
                aggiungi_canto()
                if not cresc_used[0]:
                    cresc_used[0] = True
                    fuga += 1
                    log(f'    La corrente lo aiuta: FUGA {fuga}/{FUGA_MAX}.')
                else:
                    log('    (altra corrente nel round: solo Canto, la FUGA da corrente è già contata.)')
            elif tipo == 'danno':
                if vivi():
                    applica_danno(random.choice(vivi()), 1, titolo)
            # quiete/favore/ostacolo: nessun effetto meccanico nel modello a corsa

    def scorta_attacca():
        for e in list(scorta):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'scorta')

    def eroi_ripuliscono(riservati):
        """Gli eroi (meno i `riservati` all'aggancio) colpiscono la scorta a
        fuoco concentrato (i bravi hanno Fer 2). Ritorna True se ripulita."""
        attaccanti = [n for n in vivi()][riservati:]
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]
        return len(scorta) == 0

    # Percorso: T1..T6. Con il Registro si salta T3 (via nota).
    percorso = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
    if registro:
        percorso.remove(TRAPPOLA_TILE)
        log('  [REGISTRO DEI RITIRI] Si salta la Fondamenta Stretta (T3) e le sue reti.')

    for tile in percorso:
        round_n += 1
        ponte = tile in PONTI
        cresc_used[0] = False
        log(f'--- Round {round_n}: inseguimento a {tile}'
            f'{" (ponte coperto)" if ponte else ""} · FUGA {fuga}/{FUGA_MAX} ---')

        # Un muro alla T5: il Sicario Gentile (se sopravvissuto all'Ep. 9) fa
        # scorta dura al sottoportico. Nel simulatore lo mettiamo sempre (caso
        # peggiore realistico): un bravo che regge di più.
        if tile == 'T5':
            scorta.append(dict(nome='IL SICARIO GENTILE', fer=SICARIO['fer'],
                               att=SICARIO['att'], dif=SICARIO['dif'] + 2, dan=SICARIO['dan']))
            log('    Il Sicario Gentile fa muro al sottoportico (Dif +2).')

        # Il Corriere rema comunque: vantaggio di fondo ogni round (da T2).
        if tile != 'T1':
            fuga += FUGA_BACKGROUND
            log(f'    Il Corriere rema avanti: FUGA {fuga}/{FUGA_MAX}.')

        # nebbia a T4 senza Lanterna: +1 FUGA
        if tile == NEBBIA_TILE and not lanterna:
            fuga += 1
            log(f'    Nebbia senza Lanterna Sorda: il Corriere sparisce — FUGA {fuga}/{FUGA_MAX}.')

        fase_minaccia()
        if fuga >= FUGA_MAX:
            esito = 'SCONFITTA (il Corriere ha consegnato: copie nel mondo)'
            break

        # Un eroe è riservato all'aggancio/inseguimento; gli altri ripuliscono
        # la scorta. Se non la ripuliscono, vi BLOCCANO: round perso, FUGA +1.
        # Se la ripuliscono e avanzano braccia, chiudono il divario (FUGA -=,
        # scala con la taglia: è l'aggancio che compensa il volume di carte).
        riservati = 1 if len(vivi()) >= 2 else 0
        fer_scorta = sum(e['fer'] for e in scorta if e['fer'] > 0)  # colpi per ripulire
        ripulita = eroi_ripuliscono(riservati)
        if not ripulita:
            fuga += 1
            log(f'    La scorta vi BLOCCA (round perso): FUGA {fuga}/{FUGA_MAX}.')
        else:
            # colpi avanzati dopo aver ripulito la scorta: chiudono il divario
            spare = (len(vivi()) - riservati) - fer_scorta
            if spare > 0:
                g = min(spare, GUADAGNO_CAP)
                fuga = max(0, fuga - g)
                log(f'    Braccia libere ({spare}) chiudono il divario: FUGA {fuga}/{FUGA_MAX}.')

        # ponte coperto + Fischietto: i gendarmi chiudono, taglio FUGA
        if ponte and fischietto:
            fuga = max(0, fuga - TAGLIO_PONTE)
            log(f'    [FISCHIETTO] I gendarmi chiudono il varco al ponte: FUGA {fuga}/{FUGA_MAX}.')

        scorta_attacca()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')

        if fuga >= FUGA_MAX:
            esito = 'SCONFITTA (il Corriere ha consegnato: copie nel mondo)'
            break
        if not vivi():
            esito = 'SCONFITTA (party wipe nell’inseguimento)'
            break

    # Traguardo: arrivati a T6 con FUGA sotto il massimo = aggancio.
    if esito is None:
        # All'approdo, con D2 esatta l'aggancio non contende il round alla
        # scorta (sapete che recuperate una prova, non inseguite un ladro).
        if fuga < FUGA_MAX:
            esito = 'VITTORIA'
            log('  All’approdo, la FUGA non è piena: agganciate il Corriere. Copie sequestrate.')
        else:
            esito = 'SCONFITTA (il Corriere ha consegnato: copie nel mondo)'

    max_down = len(down)
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  FUGA {min(fuga,FUGA_MAX)}/{FUGA_MAX}  |  Canto {canto}')
    log('=' * 78)
    vittoria = esito == 'VITTORIA'
    return dict(esito=esito, round_n=round_n, fuga=min(fuga, FUGA_MAX),
                down=list(down), max_down=max_down, canto_finale=canto, vittoria=vittoria)


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
                pct_sofferta=(sum(1 for x in vitt if x['max_down'] >= 1) / len(vitt) * 100) if vitt else 0,
                media_max_down=sum(x['max_down'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_fuga=sum(x['fuga'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_fischietto=sum(1 for x in ind if x['fischietto']) / n * 100,
                pct_come=sum(1 for x in ind if x['porta_aperta']) / n * 100,
                pct_chi=sum(1 for x in ind if x['chi_confermato']) / n * 100)


ROSTER_12 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_12, size))
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
                 'media_fuga', 'media_canto', 'media_ore', 'media_luoghi',
                 'pct_fischietto', 'pct_come', 'pct_chi')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep12-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep12-{size:02d}', size, 5, 30,
                                            seed_base=720000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep12.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 12 — curva 2-10 (inseguimento del corriere)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep12: FUGA_MAX={FUGA_MAX}, '
                f'FUGA_INIZIALE={FUGA_INIZIALE_OK}/{FUGA_INIZIALE_NO}, TAGLIO_PONTE={TAGLIO_PONTE}, '
                f'CANTO_MORALE={CANTO_MORALE}. Seed 720000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % sofferte | Picco terra | FUGA media | Round | '
                'Canto | Ore av. | Luoghi | % Fischietto | % COME |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_sofferta"]:.0f}% | '
                    f'{m["media_max_down"]:.1f} | {m["media_fuga"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_fischietto"]:.0f}% | {m["pct_come"]:.0f}% |\n')
    print(f'\nCurva Episodio 12 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vittoria, {m["pct_sofferta"]:.0f}% sofferte, '
              f'FUGA {m["media_fuga"]:.1f}, round {m["media_round"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
