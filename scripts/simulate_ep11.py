# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 11 «Il censimento delle campane».

Indagine generica (clone di simulate_ep10), con una SPEDIZIONE nuova: LA VIA
DELLE GUGLIE (vedi DESIGN-EPISODIO-11.md). Ascesa lineare a 6 tessere in quota
con una REGOLA D'AMBIENTE (vento/vertigine) e obiettivo CATTURA VIVA del boss.

  - VENTO/VERTIGINE: le tessere ESPOSTE (T2, T4, T5, T6) chiedono a inizio
    turno una prova NERVI a ogni eroe; il livello del vento sale di 1 a ogni
    carta crescendo (raffica). Fallire costa lo scatto e, se il vento e' forte
    o l'eroe e' allo stremo, 1 danno da vertigine. Il Taccuino Ordinato (D3)
    da' +1; la Lanterna Cieca leva il malus del buio.
  - CATTURA VIVA: il Caposquadra va ridotto a CATTURA_SOGLIA Ferite, non a 0;
    poi si cattura (Corda del Campanaro = automatico; senza = prova FORZA,
    fallita = lui sfugge e una raffica sull'esposto lo fa CADERE, filo perso).
    Overkill deliberato non modellato: un tavolo competente si ferma a 1.
  - CONOSCE I TETTI: senza il Taccuino Ordinato (D3) il boss elude (una mossa
    a vuoto degli eroi per round finche' non e' sottomesso). Con D3, niente.

PONYTAIL: modello a blocco (non la griglia tattica 4x4). La tensione qui e'
verticale/ambientale (il vento che chiama giu'), non l'affollamento: l'ascesa
tessera-per-tessera con la prova NERVI d'ambiente e la resa dei conti a cattura
catturano il vero rischio. Config di produzione condivisa (finale_v3,
TICK_CANTO_OGNI, SOGLIA_CANTO, SALUTE_BONUS_PER_N, taglie boss) importata da
simulate_playtest: INTOCCABILE. La curva si tara con le LEVE PER-EPISODIO.
Seed base 710000.
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
from gen_ep11 import NEMICI_11  # noqa: E402
# Config di produzione CONDIVISA e INTOCCABILE (unica fonte: simulate_playtest).
from simulate_playtest import (INDAGINE_UNLOCK, MINACCIA_FORMULE,  # noqa: E402
                               SALUTE_BONUS_PER_N,
                               TICK_CANTO_OGNI, SOGLIA_CANTO, custode_fer_bonus)

HERO = {h['nome']: h for h in HEROES}
NEMICO = {n['nome']: n for n in (NEMICI_COMUNI + NEMICI_11)}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
DOSSIER_ATTIVO = True

SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

# Pool miniature nemici (topografi lealisti = Sgherri; pochi). Esportato webapp.
TOKEN_POOL_BASE = {'LO SGHERRO': 5}

# ============================ LEVE PER-EPISODIO (la curva si tara QUI) ======
TESSERE_ESPOSTE = {'T2', 'T4', 'T5', 'T6'}  # dove vale la regola del vento
VENTO_DIFF = 'Media'        # difficolta' base della prova NERVI d'ambiente
VENTO_T6_EXTRA = 1          # il vento sulla guglia (T6) e' +1 di base
CATTURA_SOGLIA = 1          # Ferite a cui il boss si aggrappa (poi cattura)
FORZA_DIFF = 'Media'        # cattura senza Corda: prova FORZA (Facile se D2 ok)
BOSS_MOV_ELUSIONE = True    # senza D3 il boss elude (1 attacco a vuoto/round)
MAX_INGAGGIO_GUGLIA = 3     # la guglia è stretta: solo pochi eroi ingaggiano il boss

# ============================ MAZZO MINACCIA (21: 6/7/4/4) ==================
# tipo: 'spawn' (topografo lealista Sgherro), 'insidiaA' (ogni eroe NERVI
# Facile, perde azione), 'insidiaB' (l'eroe piu' esposto NERVI Media, 1 danno),
# 'insidiaC' (l'eroe con meno NERVI, Media, 1 danno), 'tegola' (VIGORE Media,
# 1 danno; la Corda annulla), 'crescendo' (+Canto +vento), 'raffica' (come
# crescendo, e se il boss e' a 1 Ferita sull'esposto CADE), 'quiete'/'favore'/
# 'ostacolo'/'danno'. `subito` = lo spawn si attiva subito.
MINACCE = [
    ('IL TOPOGRAFO LIGIO', 'spawn', False),
    ('ORDINI DEL CAPOSQUADRA', 'spawn', False),
    ('CHI NON DEVE SALIRE', 'spawn', True),
    ('LA RONDA DEI TETTI', 'spawn', False),
    ('IL FISCHIO DALL’ALTO', 'spawn', True),
    ('LA CLAQUE SUL CORNICIONE', 'insidiaA', False),
    ('IL VUOTO SOTTO I PIEDI', 'insidiaB', False),
    ('L’ECO DEI BRONZI', 'insidiaB', False),
    ('LA TEGOLA CHE SCIVOLA', 'tegola', False),
    ('LE MANI SUDATE', 'insidiaA', False),
    ('LO SGUARDO IN GIÙ', 'insidiaC', False),
    ('IL RINTOCCO IMPROVVISO', 'insidiaA', False),
    ('LA RINGHIERA CHE CEDE', 'insidiaB', False),
    ('IL PRIMO REFOLO', 'crescendo', False),
    ('IL VENTO GIRA', 'crescendo', False),
    ('LA BORA DAL MARE', 'crescendo', False),
    ('LA RAFFICA SULLA GUGLIA', 'raffica', False),
    ('IL VENTO CADE', 'quiete', False),
    ('UN APPIGLIO SICURO', 'favore', False),
    ('L’ABBAINO SBARRATO', 'ostacolo', False),
    ('UNA TEGOLA IN TESTA', 'danno', False),
]

# Rivelatorio Domanda 2 (chi ha spinto = Speranza), 3 carte in aperti:
# L2-Testimonianza, L3-Referto, L4-Referto.
CHI_ESPLICITO = {(2, 'Testimonianza'), (3, 'Referto'), (4, 'Referto')}


MARCIA_TESSERA = 2   # round per attraversare una tessera: media misurata sui
# simulatori con griglia (Ep.1-9), dove il Movimento 3 del Regolamento impone
# 2 round per andare da una porta all'altra di una tessera 4x4. Prima era 1
# (spostamento gratis), e ogni round regalato era una Fase Minaccia in meno.

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
# Luoghi Indagine (compatti). Chiavi tutte da aperti (L1-L4), doppia via.
# corda=L8 (D4, Corda del Campanaro); lanterna=L6 (leva il buio); ordine =
# incrocio_d3 (L1 taccuino grezzo + L4 marea/accordatura) -> Taccuino Ordinato;
# incrocio_d1 (L1 taccuino + L3 mappe) -> DOVE converge.
LUOGHI_SIM = [
    dict(n=1, nome='La Torre Civica', req=None, chiude=None,
         sblocca_parola=('LE MISURE CHE NON TORNANO', 'UN PUNTO CHE NON C’È', 'LA MAREA DEL MOLO'),
         approf=['Osservazione'], incrocio_d1=True, incrocio_d3=True),
    dict(n=2, nome='La Pensione dei Topografi', req=None, chiude=None,
         sblocca_parola=('LE MISURE CHE NON TORNANO', 'LA SQUADRA DI MILANO', 'LE FUNI DELLE CAMPANE'),
         approf=['Testimonianza']),
    dict(n=3, nome='L’Archivio Civico', req=None, chiude=None,
         sblocca_parola=('UN PUNTO CHE NON C’È', 'LA SQUADRA DI MILANO'),
         approf=['Referto'], incrocio_d1=True),
    dict(n=4, nome='La Camera dei Pesi', req=None, chiude=20,
         sblocca_parola=('LA MAREA DEL MOLO', 'LE FUNI DELLE CAMPANE'),
         approf=['Referto'], incrocio_d3=True),
    dict(n=5, nome='Lo Studio Corrispondente', req=('parola', 'LA SQUADRA DI MILANO'),
         chiude=None, approf=['Referto']),
    dict(n=6, nome='Il Campanile di San Teodoro', req=('parola', 'LA MAREA DEL MOLO'),
         chiude=19, approf=['Presagio'], lanterna=True),
    dict(n=7, nome='Il Sagrato della Cattedrale', req=('parola', 'UN PUNTO CHE NON C’È'),
         chiude=None, approf=['Osservazione']),
    dict(n=8, nome='La Bottega del Cordaio', req=('parola', 'LE FUNI DELLE CAMPANE'),
         chiude=None, approf=['Osservazione'], corda=True),
    dict(n=9, nome='Il Ponteggio del Restauro', req=('parola', 'LE MISURE CHE NON TORNANO'),
         chiude=None, approf=['Osservazione']),
]


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 11: "Il censimento delle campane"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    corda = lanterna = False
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
        # La Corda del Campanaro (D4) è indispensabile alla cattura: un tavolo
        # vero sblocca subito la sua chiave («le funi delle campane», da L2/L4)
        # e passa dalla Bottega. Priorità appena sotto il rischio d'orario.
        corda_pri = 0 if (not corda and l.get('corda')) else 1
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        missione = 0 if ((l.get('corda') and not corda)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        urgenza = l['chiude'] or 99
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)
        return (rischio, corda_pri, missione, strutturale, urgenza, copertura, l['n'])

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
                    log('    -> Conferma esplicita: chi ha spinto è il Caposquadra (Domanda 2).')
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
        cand_missione = ((l.get('corda') and not corda)
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
        if l.get('corda'):
            corda = True
            log('    -> Trovata: LA CORDA DEL CAMPANARO (assicura le trappole e la cattura — Domanda 4).')
        if l.get('lanterna'):
            lanterna = True
            log('    -> Trovata: LA LANTERNA CIECA (leva il malus del buio in quota).')
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
    ordine_ok = incroci_d3 >= 2   # Taccuino Ordinato (IN CHE ORDINE, D3)
    tutte_esatte = corda and d1_ok and ordine_ok and chi_confermato
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI'
    else:
        tier = 'nessun vantaggio'
    dossier_completo = ore_avanzate == 0
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi, {approf_letti} Approfondimenti letti.')
    log(f'Corda: {"sì" if corda else "no"}; Lanterna: {"sì" if lanterna else "no"}; '
        f'Ordine/D3 ({incroci_d3}): {"ok" if ordine_ok else "NO"}; '
        f'DOVE/D1 ({incroci_d1}): {"ok" if d1_ok else "NO"}; '
        f'D2 confermata: {"sì" if chi_confermato else "no"}')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, corda=corda, lanterna=lanterna,
                ordine_ok=ordine_ok, d1_ok=d1_ok, visitati=visitati,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato)


# =============================================================== SPEDIZIONE

CAPOSQUADRA = dict(NEMICO['IL CAPOSQUADRA'])   # boss
LEALISTA = dict(NEMICO['IL TOPOGRAFO LEALISTA'])
SGHERRO = dict(NEMICO['LO SGHERRO'])

TRAVERSATA = ['T1', 'T2', 'T3', 'T4', 'T5']   # poi T6 = la resa dei conti


def simula_spedizione(party, indagine, log, formula_minaccia='finale_v3'):
    log('=' * 78)
    log('SPEDIZIONE - La via delle guglie: cattura viva in quota')
    log('=' * 78)
    log(f'Party: {", ".join(party)}  |  {indagine["tier"]}  |  Corda: '
        f'{"sì" if indagine["corda"] else "no"}  |  Ordine(D3): '
        f'{"sì" if indagine["ordine_ok"] else "no"}  |  Lanterna: '
        f'{"sì" if indagine["lanterna"] else "no"}')

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

    corda = indagine.get('corda')
    ordine = indagine.get('ordine_ok')
    lanterna = indagine.get('lanterna')
    chi_conf = indagine.get('chi_confermato')
    ordine_bonus = 1 if ordine else 0      # +1 NERVI vento (sai dove mettere i piedi)
    buio_malus = 0 if lanterna else -1     # senza Lanterna, il buio pesa in quota

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

    vento_livello = [0]
    enemies = []          # topografi lealisti (blocco)
    lealista_min = [None]  # il Topografo Lealista nominato (T4)

    canto = 0
    canto_bonus_carte = [False]
    round_n = 0
    esito = None

    deck = list(MINACCE)
    random.shuffle(deck)
    scarti = []
    boss = [None]         # dict del Caposquadra quando in campo (T6)

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
            log(f'    La Bora è al colmo (Canto {canto}): +1 carta Minaccia per Fase, per sempre.')

    def prova_nervi(b, diff_name, extra=0):
        ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        if not ok and secondo_fiato.get(b):
            secondo_fiato[b] = False
            ok = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, extra)
        return ok

    def spawn_lealista(subito=False):
        e = dict(nome='LO SGHERRO', fer=SGHERRO['fer'], att=SGHERRO['att'],
                 dif=SGHERRO['dif'], dan=SGHERRO['dan'])
        enemies.append(e)
        log(f'    Piazzato 1 topografo lealista (Sgherro){" — si attiva subito" if subito else ""}.')

    def vento_check(esposta, t6=False):
        """Prova NERVI d'ambiente per ogni eroe su tessera esposta. Fallire
        costa lo scatto; con vento forte (>=2) o eroe allo stremo (<=1), 1
        danno da vertigine (la caduta vera)."""
        if not esposta:
            return
        extra_diff = -vento_livello[0] + ordine_bonus + buio_malus + (-VENTO_T6_EXTRA if t6 else 0)
        for b in list(vivi()):
            if not prova_nervi(b, VENTO_DIFF, extra_diff):
                # In quota il vento ferisce già a livello 1 (a terra si perde solo
                # lo scatto); sulla guglia (T6) e allo stremo è sempre pericoloso.
                if vento_livello[0] >= 1 or salute[b] <= 1:
                    applica_danno(b, 1, 'vertigine (vento)')
                else:
                    log(f'    {b}: il vento gli toglie lo scatto (nessun danno, per ora).')

    def fase_minaccia(esposta):
        base = MINACCIA_FORMULE[formula_minaccia](len(vivi()))
        n_carte = int(base) + (1 if base % 1 and round_n % 2 == 0 else 0) \
            + (1 if canto_bonus_carte[0] else 0)
        for _ in range(n_carte):
            titolo, tipo, subito = pesca()
            log(f'  [MINACCIA] {titolo} ({tipo})')
            if tipo == 'spawn':
                spawn_lealista(subito)
                if subito and vivi():
                    b = min(vivi(), key=lambda n: salute[n])
                    if roll2d6() + SGHERRO['att'] >= HERO[b]['difesa']:
                        applica_danno(b, SGHERRO['dan'], 'lealista (subito)')
            elif tipo == 'insidiaA':
                for b in list(vivi()):
                    prova_nervi(b, 'Facile')   # fallire = perde azione (modellato lieve)
            elif tipo in ('insidiaB', 'insidiaC'):
                if vivi():
                    b = min(vivi(), key=lambda n: HERO[n]['nervi'])
                    if not prova_nervi(b, 'Media'):
                        applica_danno(b, 1, titolo)
            elif tipo == 'tegola':
                if vivi() and not corda:      # la Corda annulla la trappola di caduta
                    b = random.choice(vivi())
                    if not check(log, b, 'VIGORE', HERO[b]['vigore'], 'Media'):
                        applica_danno(b, 1, titolo)
                elif corda:
                    log('    [CORDA DEL CAMPANARO] assicurati: la tegola non ferisce.')
            elif tipo in ('crescendo', 'raffica'):
                aggiungi_canto()
                vento_livello[0] += 1
                log(f'    Raffica: il vento sale a livello {vento_livello[0]}.')
                if (tipo == 'raffica' and boss[0] and not boss[0].get('catturato')
                        and boss[0]['fer'] <= CATTURA_SOGLIA and esposta):
                    log('    *** LA RAFFICA SULLA GUGLIA: il Caposquadra, in bilico sull’esposto, '
                        'CADE nel vuoto. ***')
                    boss[0]['caduto'] = True
            elif tipo == 'danno':
                if vivi():
                    applica_danno(random.choice(vivi()), 1, titolo)
            # quiete/favore/ostacolo: nessun effetto nel modello a blocco

    def fase_nemici_combattimento():
        for e in list(enemies):
            if not vivi():
                break
            b = random.choice(vivi())
            if roll2d6() + e['att'] >= HERO[b]['difesa']:
                applica_danno(b, e['dan'], 'lealista')
        lm = lealista_min[0]
        if lm and lm['fer'] > 0 and vivi():
            b = random.choice(vivi())
            if roll2d6() + lm['att'] >= HERO[b]['difesa']:
                applica_danno(b, lm['dan'], 'il Topografo Lealista')
        if boss[0] and boss[0]['fer'] > 0:
            # Cornered animal: sulla guglia il Caposquadra, disperato, mena due
            # volte per round, colpendo di preferenza chi è più debole.
            for _ in range(2):
                if not vivi():
                    break
                b = min(vivi(), key=lambda n: salute[n])
                if roll2d6() + boss[0]['att'] >= HERO[b]['difesa']:
                    applica_danno(b, boss[0]['dan'], 'il Caposquadra')

    def eroi_ripuliscono_lealisti(attaccanti):
        """`attaccanti` eroi colpiscono i lealisti in campo (1 per lealista)."""
        vivi_l = [e for e in enemies if e['fer'] > 0]
        for i, e in enumerate(vivi_l):
            if i < len(attaccanti) and roll2d6() + HERO[attaccanti[i]]['vigore'] + 1 >= e['dif']:
                e['fer'] -= 1
        enemies[:] = [e for e in enemies if e['fer'] > 0]

    if not indagine.get('d1_ok'):
        log('  Salite alla cieca (Domanda 1 sbagliata): 1 lealista in T1.')
        spawn_lealista()

    # --- Fase 1: ascesa T1..T5 (una tessera per round) ---
    for tile in TRAVERSATA:
        # ROUND DI MARCIA: attraversare una tessera costa MARCIA_TESSERA round
        # (Movimento 3, Regolamento), non uno gratis. Il round in piu' porta la
        # pressione: carte Minaccia, nemici, Canto.
        for _ in range(MARCIA_TESSERA - 1):
            round_n += 1
            log(f'--- Round {round_n}: il gruppo marcia verso {tile} ---')
            fase_minaccia(tile in TESSERE_ESPOSTE)   # `esposta` si calcola piu' sotto
            fase_nemici_combattimento()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
            if not vivi():
                esito = 'SCONFITTA (party wipe in marcia)'
                break
        if esito:
            break
        round_n += 1
        esposta = tile in TESSERE_ESPOSTE
        log(f'--- Round {round_n}: la via delle guglie attraversa {tile} '
            f'({"ESPOSTA" if esposta else "riparata"}) ---')
        vento_check(esposta)
        if not vivi():
            esito = 'SCONFITTA (party wipe in ascesa)'
            break
        if tile == 'T4' and lealista_min[0] is None:
            lealista_min[0] = dict(LEALISTA)
            log('    Appare IL TOPOGRAFO LEALISTA (ingannato in buona fede), e vi sbarra.')
        # eroi: ripuliscono i lealisti presenti (tutti i vivi disponibili)
        eroi_ripuliscono_lealisti(list(vivi()))
        if lealista_min[0] and lealista_min[0]['fer'] > 0 and vivi():
            if roll2d6() + HERO[vivi()[0]]['vigore'] + 1 >= lealista_min[0]['dif']:
                lealista_min[0]['fer'] -= 1
                if lealista_min[0]['fer'] <= 0:
                    log('    Il Topografo Lealista è messo fuori gioco.')
        fase_minaccia(esposta)
        fase_nemici_combattimento()
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            aggiungi_canto()
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')
        if not vivi():
            esito = 'SCONFITTA (party wipe in ascesa)'
            break

    # --- Fase 2: T6, la guglia — cattura viva ---
    if esito is None:
        boss[0] = dict(CAPOSQUADRA)
        boss[0]['fer'] += custode_extra_fer
        boss[0]['caduto'] = False
        catturato = [False]
        log(f'--- Round {round_n + 1}+: LA GUGLIA (T6, ESPOSTA) — il Caposquadra '
            f'(Fer {boss[0]["fer"]}), va preso VIVO ---')
        while esito is None:
            round_n += 1
            log(f'--- Round {round_n} (T6): vento {vento_livello[0]} · Caposquadra '
                f'{max(boss[0]["fer"],0)}/{CAPOSQUADRA["fer"] + custode_extra_fer} Fer ---')
            vento_check(True, t6=True)
            if not vivi():
                esito = 'SCONFITTA (party wipe alla guglia)'
                break
            if boss[0].get('caduto'):
                esito = 'SCONFITTA-FILO (il Caposquadra è caduto: nessun testimone)'
                break
            # Allocazione: se il boss è ancora sopra soglia, gli eroi lo
            # sottomettono (senza overkill); un eroe tiene i lealisti. Con
            # l'elusione (niente D3) un attacco al boss va a vuoto ogni round.
            vivi_ora = list(vivi())
            # La guglia è stretta: solo MAX_INGAGGIO_GUGLIA eroi arrivano al boss;
            # gli altri tengono i lealisti e subiscono il vento (bottleneck che
            # allunga la resa dei conti — e l'esposizione — ai tavoli grandi).
            attaccanti_boss = vivi_ora[:MAX_INGAGGIO_GUGLIA]
            ripulitori = vivi_ora[MAX_INGAGGIO_GUGLIA:]
            eroi_ripuliscono_lealisti(ripulitori)
            if boss[0]['fer'] > CATTURA_SOGLIA:
                elude = BOSS_MOV_ELUSIONE and not ordine
                colpi = attaccanti_boss[1:] if elude else attaccanti_boss
                if elude:
                    log('    Il Caposquadra taglia per i tetti (niente D3): un attacco va a vuoto.')
                for n in colpi:
                    if boss[0]['fer'] <= CATTURA_SOGLIA:
                        break
                    # Guglia ghiacciata: footing pessimo, −1 a colpire un uomo
                    # agile che si sposta sul cornicione (allunga la resa dei conti).
                    if roll2d6() + HERO[n]['vigore'] + 1 - 1 >= boss[0]['dif']:
                        boss[0]['fer'] -= 1
                if boss[0]['fer'] <= CATTURA_SOGLIA:
                    log('    Il Caposquadra è ridotto all’ultima Ferita: si aggrappa al cornicione.')
                    if corda:
                        # Con la Corda lo si trattiene e cattura NELLO STESSO turno
                        # in cui lo si sottomette: niente finestra per la raffica.
                        catt = max(vivi(), key=lambda n: HERO[n]['vigore'])
                        catturato[0] = True
                        boss[0]['catturato'] = True
                        log(f'    [CORDA DEL CAMPANARO] {catt} lo trattiene e lo cattura subito: preso VIVO.')
            else:
                # tentativo di cattura viva (senza Corda: al turno dopo, rischioso)
                catt = max(vivi(), key=lambda n: HERO[n]['vigore'])
                if corda:
                    catturato[0] = True
                    boss[0]['catturato'] = True
                    log(f'    [CORDA DEL CAMPANARO] {catt} lo trattiene e lo cattura: preso VIVO.')
                else:
                    forza_diff = 'Facile' if chi_conf else FORZA_DIFF
                    if check(log, catt, 'FORZA/VIGORE', HERO[catt]['vigore'], forza_diff):
                        catturato[0] = True
                        boss[0]['catturato'] = True
                        log(f'    {catt} lo afferra a mani nude: preso VIVO (senza Corda, al pelo).')
                    else:
                        log(f'    {catt} manca la presa: il Caposquadra resta in bilico sull’esposto '
                            '(una raffica ora lo farebbe cadere).')

            fase_minaccia(True)
            if boss[0].get('caduto'):
                esito = 'SCONFITTA-FILO (il Caposquadra è caduto: nessun testimone)'
                break
            fase_nemici_combattimento()
            if round_n % TICK_CANTO_OGNI == 0 and vivi():
                aggiungi_canto()
                log(f'  [OROLOGIO] Fine del {round_n}° round: +1 Canto automatico.')

            if catturato[0]:
                esito = 'VITTORIA'
            elif not vivi():
                esito = 'SCONFITTA (party wipe alla guglia)'
            elif round_n > 40:
                esito = 'TIMEOUT'

    max_down = len(down)
    log('')
    log('=' * 78)
    log(f'ESITO: {esito}  |  Round: {round_n}  |  vento {vento_livello[0]}  |  Canto {canto}')
    log('=' * 78)
    # Per la curva: la cattura viva è la vittoria; caduta/wipe = sconfitta.
    vittoria = esito == 'VITTORIA'
    return dict(esito=esito, round_n=round_n, vento=vento_livello[0],
                down=list(down), max_down=max_down, canto_finale=canto,
                vittoria=vittoria,
                filo_perso=bool(esito and esito.startswith('SCONFITTA-FILO')))


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
                pct_filo=sum(1 for x in sp if x['filo_perso']) / n * 100,
                media_max_down=sum(x['max_down'] for x in sp) / n,
                media_round=sum(x['round_n'] for x in sp) / n,
                media_vento=sum(x['vento'] for x in sp) / n,
                media_canto=sum(x['canto_finale'] for x in sp) / n,
                media_ore=sum(x['ore_avanzate'] for x in ind) / n,
                media_luoghi=sum(len(x['visitati']) for x in ind) / n,
                pct_corda=sum(1 for x in ind if x['corda']) / n * 100,
                pct_ordine=sum(1 for x in ind if x['ordine_ok']) / n * 100,
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
                ('pct_vittoria', 'pct_sofferta', 'pct_filo', 'media_max_down', 'media_round',
                 'media_vento', 'media_canto', 'media_ore', 'media_luoghi',
                 'pct_corda', 'pct_ordine', 'pct_chi')})


def sessione_curva():
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        print(f'Eseguo ep11-{size:02d} (5 party x 30 seed)...')
        risultati.append(esegui_multi_party(f'ep11-{size:02d}', size, 5, 30,
                                            seed_base=710000 + size * 1000))
    path = os.path.join(LOG_DIR, 'riepilogo_ep11.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 11 — curva 2-10 (via delle guglie, cattura viva)\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 (condivisa) + leve ep11: esposte={sorted(TESSERE_ESPOSTE)}, '
                f'VENTO_DIFF={VENTO_DIFF}, VENTO_T6_EXTRA={VENTO_T6_EXTRA}, '
                f'CATTURA_SOGLIA={CATTURA_SOGLIA}, elusione={BOSS_MOV_ELUSIONE}. '
                f'Seed 710000+size*1000.\n\n')
        f.write('| Taglia | % Vitt | % sofferte | % filo perso | Picco terra | Round | '
                'Vento | Canto | Ore av. | Luoghi | % Corda | % Ordine |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | {m["pct_sofferta"]:.0f}% | '
                    f'{m["pct_filo"]:.0f}% | {m["media_max_down"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["media_vento"]:.1f} | {m["media_canto"]:.1f} | {m["media_ore"]:.1f} | '
                    f'{m["media_luoghi"]:.1f} | {m["pct_corda"]:.0f}% | {m["pct_ordine"]:.0f}% |\n')
    print(f'\nCurva Episodio 11 fatta. Riepilogo in {path}')
    for m in risultati:
        print(f'  n={m["size"]}: {m["pct_vittoria"]:.0f}% vittoria, {m["pct_sofferta"]:.0f}% sofferte, '
              f'filo perso {m["pct_filo"]:.0f}%, vento {m["media_vento"]:.1f}')


if __name__ == '__main__':
    sessione_curva()
