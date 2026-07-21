# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 17 «Lo scisma».

Indagine generica (clone di simulate_ep15), con una SPEDIZIONE che è il PICCO
dell'atto (vedi DESIGN-EPISODIO-17.md): recupero del decano vivo sotto il peso
dello SCISMA (malus NERVI), mentre il Notaio prova a trasferirlo e a dileguarsi.

  - MORALE (lo scisma): finché non si libera il decano vivo (T5), tutti gli
    eroi hanno −1 ai NERVI. Trovarlo vivo cancella il malus.
  - SOGLIA-DECANO: se il Canto la raggiunge prima di liberare il decano, viene
    «trasferito» = ferito grave (decano non lucido, vittoria parziale sulla
    deposizione). Il Salvacondotto alza la soglia; le Chiavi saltano il T1.
  - OBIETTIVO: liberare il decano (T5) e catturare il Notaio (T6, non combatte)
    superando la sua Guardia (boss, Danno 2). Payoff del ricorrente.
  - Torsione «il caso contro di voi»: la matrice (Cifra del decano, L5) arma
    l'Ep. 18; decano lucido + matrice = piena.

PONYTAIL: modello a blocco (traversata + cella + boss+notaio). La ansia è
massima: casa divisa (malus), ostaggio a termine, la Guardia Danno 2. Config di
produzione condivisa importata da simulate_playtest: INTOCCABILE. Seed 770000.
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
from gen_ep17 import NEMICI_17  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_17)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (il picco: si tara QUI) ======
MORALE_MALUS = -1        # ai NERVI, finché il decano non è liberato vivo (T5)
SCISMA_SALUTE = -1       # −1 Salute iniziale a tutti: la casa divisa entra sfiancata
SOGLIA_DECANO = 3        # Canto oltre cui il decano è «trasferito» (4 col Salvacondotto)
BOSS_INGAGGIO = 4        # eroi che ingaggiano la Guardia del Notaio (T6)
BOSS_COLPI = 2           # la Guardia, Danno 2, due colpi (uno saltato con D3/matrice)

# ============================ MAZZO MINACCIA (21: 7/6/4/4) — il mazzo pieno ==
# tipo: 'spawn' (uomo del Notaio), 'insidiaA' (ogni eroe NERVI Facile+malus,
# perde azione), 'insidiaB' (un eroe NERVI+malus, 1 danno), 'insidiaV' (VIGORE,
# perde movimento), 'crescendo' (+Canto/trasferimento), 'quiete'/'favore'/
# 'ostacolo'/'danno'.
MINACCE = [
    ('LA GUARDIA AL CORTILE', 'spawn', False),
    ('POSTO DI BLOCCO', 'spawn', False),
    ('CHI COPRE IL NOTAIO', 'spawn', True),
    ('RINCALZI DALLA RIMESSA', 'spawn', False),
    ('LA RONDA DELLA VILLA', 'spawn', False),
    ('CHI SCORTA IL TRASFERIMENTO', 'spawn', False),
    ('L’ULTIMO MURO', 'spawn', True),
    ('IL SOSPETTO RECIPROCO', 'insidiaA', False),
    ('LA VOCE DEL TRADITORE', 'insidiaA', False),
    ('LA PORTA BLINDATA', 'ostacolo', False),
    ('IL CORRIDOIO DELLE CELLE', 'insidiaB', False),
    ('LO SGUARDO DELLA GUARDIA', 'insidiaB', False),
    ('IL FREDDO DELLA CANTINA', 'insidiaV', False),
    ('RASCA DÀ L’ORDINE', 'crescendo', False),
    ('IL DECANO VIENE SPOSTATO', 'crescendo', False),
    ('LA CARROZZA AL CANCELLO POSTERIORE', 'crescendo', False),
    ('L’ULTIMO LAVORO', 'crescendo', False),
    ('LA VILLA CHE TACE', 'quiete', False),
    ('UN UOMO DEL DECANO', 'favore', False),
    ('CASSE DI CUSTODIA', 'ostacolo', False),
    ('UN COLPO DALLA GUARDIA', 'danno', False),
]

# Rivelatorio Domanda 2 (chi = il Notaio, non una talpa), 3 carte in aperti:
# L2-Testimonianza, L3-Referto, L4-Testimonianza.
CHI_ESPLICITO = {(2, 'Testimonianza'), (3, 'Referto'), (4, 'Testimonianza')}


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
# Chiavi tutte da aperti (L1-L4), doppia via. cifra=L5 (D3/matrice); chiavi=L8;
# salvacondotto=L7. incrocio_d1 (DOVE: L7 dogana + L8 rifugio).
LUOGHI_SIM = [
    dict(n=1, nome='Lo Studio del Decano', req=None, chiude=None,
         sblocca_parola=('LO STUDIO A SOQQUADRO', 'IL DOSSIER CIFRATO'),
         approf=['Presagio']),
    dict(n=2, nome='L’Assemblea della Società', req=None, chiude=None,
         sblocca_parola=('LO STUDIO A SOQQUADRO', 'LA CACCIA ALLA TALPA'),
         approf=['Testimonianza']),
    dict(n=3, nome='Il Tribunale', req=None, chiude=None,
         sblocca_parola=('LA CACCIA ALLA TALPA', 'IL DOSSIER CIFRATO'),
         approf=['Referto']),
    dict(n=4, nome='Lo Studio del Notaio', req=None, chiude=None,
         sblocca_parola=('LA CACCIA ALLA TALPA', 'IL DOSSIER CIFRATO'),
         approf=['Testimonianza']),
    dict(n=5, nome='L’Aula del Cifrario', req=('parola', 'LO STUDIO A SOQQUADRO'),
         chiude=20, approf=['Referto'], cifra=True),
    dict(n=6, nome='Il Membro Interno', req=('parola', 'LA CACCIA ALLA TALPA'),
         chiude=None, approf=['Osservazione']),
    dict(n=7, nome='La Dogana Vecchia', req=('parola', 'IL DOSSIER CIFRATO'),
         chiude=None, approf=['Referto'], salvacondotto=True, incrocio_d1=True),
    dict(n=8, nome='Il Rifugio del Notaio', req=('parola', 'IL DOSSIER CIFRATO'),
         chiude=None, approf=['Osservazione'], chiavi=True, incrocio_d1=True),
    dict(n=9, nome='La Villa-Prigione', req=('parola', 'LA CACCIA ALLA TALPA'),
         chiude=None, approf=['Presagio'], fuori_citta=True),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 17: "Lo scisma"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    cifra = chiavi = salvacondotto = False
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

    def costo(l):
        return 2 if l.get('fuori_citta') else 1

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
        cif_pri = 0 if (not cifra and l.get('cifra')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('cifra') and not cifra)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('chiavi') and not chiavi)) else 1
        trasferta = costo(l)
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, cif_pri, missione, strutturale, trasferta, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: l’ha preso il Notaio, non una talpa (Domanda 2).')
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
        cand_missione = ((l.get('cifra') and not cifra)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('chiavi') and not chiavi))
        if (approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3, 4)
                and not cand_missione and not esplora_a_fondo):
            log(f'[h{ora_corrente:02d}:00] Nucleo garantito in mano: il gruppo chiude con {ore} '
                f'ore in banca (Vantaggio).')
            break
        cst = costo(l)
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Visita Luogo {l["n"]} — {l["nome"]}  '
            f'({cst} or{"e" if cst > 1 else "a"}{" — trasferta" if cst > 1 else ""})')
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            ok = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            for p in l['sblocca_parola']:
                parole.add(p)
        if l.get('cifra'):
            cifra = True
            log('    -> Trovata: LA CIFRA DEL DECANO (decifra la matrice — D3).')
        if l.get('chiavi'):
            chiavi = True
            log('    -> Trovate: LE CHIAVI DELLA VILLA-PRIGIONE (saltano il cancello T1).')
        if l.get('salvacondotto'):
            salvacondotto = True
            log('    -> Trovato: IL SALVACONDOTTO (posti di blocco + soglia-decano più alta).')
        if l.get('incrocio_d1'):
            incroci_d1 += 1
        if ok:
            tenta_approf(l)
        else:
            approf_falliti += len(l['approf'])
        ore -= cst
        ora_corrente += cst

    ore_avanzate = ore
    d1_ok = incroci_d1 >= 2
    matrice = cifra   # D3 «la matrice» = avere la Cifra (dall'Aula del Cifrario)
    tutte_esatte = d1_ok and chi_confermato and cifra and chiavi
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Cifra/matrice: {"sì" if cifra else "no"}; Chiavi: {"sì" if chiavi else "no"}; '
        f'Salvacondotto: {"sì" if salvacondotto else "no"}; DOVE/D1 ({incroci_d1}): '
        f'{"ok" if d1_ok else "NO"}; D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, cifra=cifra, chiavi=chiavi,
                salvacondotto=salvacondotto, matrice=matrice, d1_ok=d1_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

GUARDIA = dict(NEMICO['LA GUARDIA DEL NOTAIO'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # a T5 si libera il decano; poi T6 = boss+Notaio


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La villa-prigione (il picco: lo scisma pesa)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Cifra: '
        f'{"sì" if indagine["cifra"] else "no"}  |  Chiavi: '
        f'{"sì" if indagine["chiavi"] else "no"}  |  Salvacondotto: '
        f'{"sì" if indagine["salvacondotto"] else "no"}')

    custode_extra_fer = custode_fer_bonus(len(party))
    salute, salute_max = {}, {}
    tier = indagine['tier']
    bonus_salute = SALUTE_BONUS_PER_N.get(len(party), 0)
    for n in party:
        smax = HERO[n]['salute'] + (1 if tier in ('PREPARATI', 'SLANCIO') else 0) + bonus_salute \
            + SCISMA_SALUTE
        salute[n] = salute_max[n] = smax
    down = set()
    secondo_fiato = dict(indagine.get('secondo_fiato') or {n: True for n in party})
    intuizione = [DOSSIER_ATTIVO and bool(indagine.get('dossier_completo'))]

    cifra = indagine.get('cifra')
    chiavi = indagine.get('chiavi')
    salvacondotto = indagine.get('salvacondotto')
    d1_ok = indagine.get('d1_ok')
    matrice = indagine.get('matrice')
    soglia_decano = SOGLIA_DECANO + (1 if salvacondotto else 0)

    decano_vivo = [False]     # liberato a T5: cancella il malus di morale
    decano_lucido = [True]    # False se trasferito (soglia superata prima di T5)

    def morale():
        return 0 if decano_vivo[0] else MORALE_MALUS

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
    trasferimento_attivo = [False]

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
            log(f'    Il trasferimento si avvicina (Canto {canto}): +1 carta Minaccia per Fase.')
        if canto == soglia_decano and not decano_vivo[0]:
            log(f'    *** SOGLIA-DECANO ({soglia_decano}): il decano è trasferito. '
                f'Lo recupererete ferito grave. ***')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra + morale())
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra + morale())
        return ok

    def spawn(subito=False):
        scorta.append(dict(fer=SGHERRO['fer'], att=SGHERRO['att'], dif=SGHERRO['dif'], dan=SGHERRO['dan']))
        log(f'    Piazzato 1 uomo del Notaio (Sgherro){" — subito" if subito else ""}.')

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
                        applica_danno(b, SGHERRO['dan'], 'uomo del Notaio (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')
            elif tipo == 'insidiaB':
                if vivi():
                    b = random.choice(vivi())
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'insidiaV':
                if vivi():
                    b = random.choice(vivi())
                    check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media')  # perde movimento (flavor)
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
                applica_danno(b, e['dan'], 'uomo del Notaio')
        if boss[0] and boss[0]['fer'] > 0:
            colpi = BOSS_COLPI
            if boss[0].get('salta_attacco'):
                boss[0]['salta_attacco'] = False
                colpi -= 1
                log('    [LA MATRICE — D3] la Guardia esita: un colpo in meno.')
            for _ in range(colpi):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'la Guardia del Notaio')

    def eroi_ripuliscono(attaccanti):
        for n in attaccanti:
            vivi_s = [e for e in scorta if e['fer'] > 0]
            if not vivi_s:
                break
            e = vivi_s[0]
            if roll2d6() + HERO[n]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        scorta[:] = [e for e in scorta if e['fer'] > 0]

    # --- T1: senza Chiavi, la Guardia al cancello ---
    if not chiavi:
        log('  Senza le Chiavi: la Guardia al cancello vi ingaggia (2 Sgherri).')
        spawn(); spawn()
    else:
        log('  [CHIAVI] Entrate senza sfondare: niente sbarramento al cancello (T1).')
    if not d1_ok:
        log('  Senza DOVE (D1): 1 uomo del Notaio in più a T1.')
        spawn()
    log(f'  [SCISMA] Malus di morale: {MORALE_MALUS} ai NERVI finché il decano non è libero.')

    # --- Fase 1: traversata T1..T5 (a T5 si libera il decano) ---
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
        log(f'--- Round {round_n}: {tile} · Canto {canto}/{soglia_decano} decano · '
            f'morale {morale():+d} ---')
        if tile == 'T1' and d1_ok and round_n == 1:
            log('    [DOVE — D1] sapete dove sbarcare: nessuna carta Minaccia questo round.')
        if tile == 'T4' and not trasferimento_attivo[0]:
            trasferimento_attivo[0] = True
            log('    Il Notaio ordina il trasferimento: da ora la soglia-decano corre.')
        if tile == 'T5':
            # la cella: si libera il decano
            if canto >= soglia_decano:
                decano_lucido[0] = False
                log('    Il decano era già in trasferimento: recuperato VIVO ma ferito grave '
                    '(non depone lucido).')
            else:
                log('    *** Il decano è liberato VIVO e lucido: non c’è nessuna talpa. ***')
            decano_vivo[0] = True
            log('    [MORALE] Trovato il decano vivo: il malus di scisma è CANCELLATO.')
        eroi_ripuliscono(list(vivi()))
        if not (tile == 'T1' and d1_ok):
            fase_minaccia()
        fase_nemici()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (party wipe nella villa-prigione)'
            break

    # --- Fase 2: T6, lo studio — la Guardia + cattura del Notaio ---
    if esito is None:
        boss[0] = dict(GUARDIA)
        boss[0]['fer'] += custode_extra_fer
        if matrice:
            boss[0]['salta_attacco'] = True
        notaio_preso = [False]
        log(f'--- Round {round_n + 1}+: LO STUDIO DEL NOTAIO (T6) — la Guardia '
            f'(Fer {boss[0]["fer"]}) + il Notaio ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): Guardia {max(boss[0]["fer"],0)}/'
                f'{GUARDIA["fer"] + custode_extra_fer} · Canto {canto} ---')
            if not vivi():
                esito = 'SCONFITTA (party wipe nella villa-prigione)'
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
                    log('    *** LA GUARDIA È A TERRA: la strada al Notaio è libera. ***')
            fase_minaccia()
            fase_nemici()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            # cattura del Notaio: con la Guardia a terra, è quasi automatica
            if boss[0]['fer'] <= 0 and vivi():
                notaio_preso[0] = True
                piena = decano_lucido[0] and matrice
                esito = 'VITTORIA' if piena else 'VITTORIA-PARZIALE'
                log(f'    Il Notaio è catturato. {"Decano lucido + matrice: prova PIENA per l’Ep.18." if piena else "Decano ferito o niente matrice: prova parziale."}')
            elif not vivi():
                esito = 'SCONFITTA (party wipe nella villa-prigione)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    piena = esito == 'VITTORIA'
    vittoria = esito in ('VITTORIA', 'VITTORIA-PARZIALE')
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  Canto {canto}  |  decano '
        f'{"lucido" if decano_lucido[0] else "ferito"}  |  soglia {soglia_decano}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, canto_finale=canto, down=list(down),
                max_down=max_down, vittoria=vittoria, piena=piena,
                decano_lucido=decano_lucido[0])


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
                pct_cifra=sum(1 for x in ind if x['cifra']) / n * 100,
                pct_lucido=sum(1 for x in sp if x['decano_lucido']) / n * 100)


ROSTER_17 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']


def party_random(size, escludi, tentativi=300):
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_17, size))
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
                 'media_canto', 'media_ore', 'media_luoghi', 'pct_cifra', 'pct_lucido')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep17-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep17-{size:02d}', size, 5, 30,
                                            seed_base=770000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep17.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 17 — curva 2-10 (villa-prigione, il picco: scisma + soglia-decano)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep17: MORALE_MALUS={MORALE_MALUS} (NERVI, fino al '
                f'decano), SOGLIA_DECANO={SOGLIA_DECANO} (+1 Salvacondotto), BOSS_INGAGGIO={BOSS_INGAGGIO}, '
                f'BOSS_COLPI={BOSS_COLPI}. Seed 770000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % piena | % sofferte | Picco terra | Round | Canto | '
                'Ore av. | Luoghi | % Cifra | % Decano lucido |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_piena"]:.0f}% | '
                    f'{m["pct_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_canto"]:.1f} | {m["media_ore"]:.1f} | {m["media_luoghi"]:.1f} | '
                    f'{m["pct_cifra"]:.0f}% | {m["pct_lucido"]:.0f}% |\n')
    print(f'\nCurva Episodio 17 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vitt, {m["pct_piena"]:.0f}% piena, '
              f'{m["pct_sofferta"]:.0f}% sofferte, lucido {m["pct_lucido"]:.0f}%, canto {m["media_canto"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
