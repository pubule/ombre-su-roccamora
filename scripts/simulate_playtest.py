# -*- coding: utf-8 -*-
"""Simulatore di playtest per Ombre su Roccamora - Episodio 1.

Gioca N partite complete (Indagine + Spedizione) con dadi VERI (random,
non narrativa inventata) usando i dati autoritativi di src/gen_cards.py,
e scrive un log completo, dado per dado, in logs/playtest/.

Fedelta' e limiti (dichiarati esplicitamente, vedi anche l'intestazione
di ogni log):
- Le prove (2d6+caratteristica vs 7/9/11) e i combattimenti (2d6+VIGORE(+1
  arma) vs Difesa) usano le regole vere del Regolamento.
- Il movimento sulla tessera (coordinate, adiacenza cella per cella) e'
  ASTRATTO: il gruppo viaggia come un blocco unico lungo il percorso
  obbligato T1->T2->T4->T2->T5->T6->(ritorno), un vano per round. Le prove
  d'ingresso (T3 opzionale saltata, T5 NERVI Facile) restano vere.
- Le abilita' eroe piu' rilevanti sono modellate (Serra/Marani/Brera - le 3
  appena bilanciate - piu' Sibilla/Ottone/Attilio/Carla/Fanti). Elena,
  Nino e Carbone hanno un impatto minore in questa astrazione e sono
  annotati ma non pienamente simulati (nessuna prova di Cercare/scassinare
  dedicata nel loop di combattimento).
- L'Indagine sceglie i luoghi con un'euristica fissa (priorita' a chi
  sblocca altri luoghi), non un vero giocatore: serve a generare una
  partita plausibile e loggabile, non a "risolvere" il caso in modo ottimo.

Uso: python scripts/simulate_playtest.py
"""
import os
import random
import re
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
from gen_cards import HEROES, LUOGHI, MINACCE, NEMICI  # noqa: E402

HERO = {h['nome']: h for h in HEROES}
LUOGHI_BY_N = {l['n']: l for l in LUOGHI}


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)
NEMICO = {n['nome']: n for n in NEMICI}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
# Ogni invocazione scrive in una sottocartella datata, cosi' le sessioni di
# stress-test successive (es. dal comando /playtest) non si sovrascrivono:
# python scripts/simulate_playtest.py [etichetta-sessione]
SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'ADEPTO INCAPPUCCIATO': 10, 'CANE DEI MOLI': 3, 'IL FONDITORE': 3,
                    'LO SGHERRO': 4, 'IL SICARIO': 2}

# Le tessere sono griglie 4x4 caselle (vedi scripts/tiles/generate-tiles.js,
# cell = S/4): 6 e' la diagonale Manhattan massima da un angolo all'altro
# (niente diagonali di movimento, regola vera). Usata per stimare quante
# caselle separano un nemico appena piazzato dal gruppo - fatto strutturale
# sulla tessera, non sul ritmo del gruppo (vedi GUADAGNO_GRUPPO sotto).
CASELLE_TESSERA = 6

# Regola vera (aggiornata): 2 azioni a round, sempre di tipo diverso (niente
# doppio Movimento) - "Muovere" e' una sola azione da 3 caselle (Nino 4).
# Un'abilita' che concede un'azione extra (es. Colpo da macello) non conta
# come ripetizione, resta fuori da questo conteggio. Il gruppo "guadagna"
# quindi GUADAGNO_GRUPPO=3 caselle per round quando avanza di tessera - l'altra
# azione di ciascun eroe resta quella gia' gestita in fase_eroi (Attaccare/
# Cercare/Interagire/Rianimare/Abilita').
GUADAGNO_GRUPPO = 3

# titolo carta Minaccia -> (nemico da piazzare, quanti, si attiva subito)
CARD_SPAWN = {
    'ADEPTO IN AGGUATO': ('ADEPTO INCAPPUCCIATO', 1, False),
    'VOLTI TRA LE CASSE': ('ADEPTO INCAPPUCCIATO', 1, False),
    'IL FALCETTO NEL BUIO': ('ADEPTO INCAPPUCCIATO', 1, False),
    'LA VEDETTA': ('ADEPTO INCAPPUCCIATO', 1, False),
    'RONDA': ('ADEPTO INCAPPUCCIATO', 2, False),
    'CANI DEI MOLI': ('CANE DEI MOLI', 1, True),
    'UNGHIE SULLA PIETRA': ('CANE DEI MOLI', 1, True),
    'IL FONDITORE': ('IL FONDITORE', 1, False),
    'BRAVI SUL MOLO': ('LO SGHERRO', 1, False),
    'IL BRANCO': ('LO SGHERRO', 2, False),
    'LAMA NEL BUIO': ('IL SICARIO', 1, True),
    'LA MAREA DI CERA': ('IL FONDITORE', 1, False),
}
# Distanza di piazzamento (caselle) desunta dal testo della carta: un nemico
# non adiacente non puo' attaccare finche' non colma la distanza col proprio
# Movimento (regola vera, gen_docs.py "Ogni nemico si muove del suo Movimento
# verso l'eroe piu' vicino... se adiacente, attacca"). Le carte con subito=True
# sopra restano invariate: si attivano comunque nel round di piazzamento, la
# loro distanza e' 0.
#
# Regola vera per le carte "sull'uscita piu' vicina agli eroi" (vedi MINACCE
# in gen_cards.py): a un tavolo vero e' semplice lettura spaziale (le
# miniature sono li'); nel simulatore, senza coordinate, si approssima con
# "la porta che il gruppo sta usando in quel momento" (ingresso nel round in
# cui arrivano, uscita nei round successivi passati sulla stessa tessera - a
# T6, unica porta, ingresso e uscita coincidono). Distanza 1 casella (dentro
# la soglia). None = dinamica: distanza dalla Banchina (T1, il punto di
# ingresso) proporzionale a quante tessere il gruppo ha gia' percorso
# (round_n) - eccezione tematica "arriva da dove siete entrati", non tocca
# La Vedetta (gia' adiacente per testo) ne' le carte "si attiva subito".
DISTANZA_PORTA = 1
SPAWN_DISTANZA = {
    'ADEPTO IN AGGUATO': DISTANZA_PORTA,
    'VOLTI TRA LE CASSE': DISTANZA_PORTA,
    'IL FALCETTO NEL BUIO': DISTANZA_PORTA,
    'LA VEDETTA': 0,                             # adiacente all'eroe piu' isolato
    'RONDA': None,                               # ingresso Banchina T1: dinamica
    'IL FONDITORE': None,                        # ingresso Banchina T1: dinamica
    'BRAVI SUL MOLO': None,                       # ingresso Banchina T1: dinamica
    'IL BRANCO': DISTANZA_PORTA,
    'LA MAREA DI CERA': None,                     # ingresso Banchina T1: dinamica (il nuovo)
}
INSIDIA = {  # titolo -> (difficolta', danno, chi prova)
    'TRAPPOLA DI CERA': ('Media', 1, 'l’eroe più avanzato'),
    'CERA SOTTO I PIEDI': ('Media', 1, 'l’eroe attivo'),
    'FUMI SOPORIFERI': ('Facile', 0, 'ogni eroe (chi fallisce: 1 sola azione prossimo turno)'),
    'SUSSURRI': ('Media', 1, 'l’eroe con meno NERVI'),
}
CRESCENDO = {'IL CANTO SALE', 'IL CORO RISPONDE', 'IL CANTO CRESCE'}
MALAVITA_TRUPPA = {'LO SGHERRO', 'IL SICARIO', 'ADEPTO INCAPPUCCIATO', 'CANE DEI MOLI'}

CUSTODE = dict(nome='IL CUSTODE DELLA CERA', att=3, dif=9, fer=3, mov=3, dan=2)

# Luoghi Indagine, versione compatta per la sola AI di scelta + sblocchi.
# (n, req_key or None, sblocca[list], chiude_ore[set], approfondimenti[tipo->eroi idonei])
LUOGHI_SIM = [
    dict(n=1, nome='Il Campanile di San Teodoro', req=None, sblocca_parola='SOMMERSO', chiude=None,
         approf=['Osservazione', 'Referto']),
    dict(n=2, nome='Casa di Ruggero', req=None, sblocca_oggetto='CORDA DI VIOLINO', chiude=None,
         approf=['Testimonianza']),
    dict(n=3, nome='Taverna del Ponte Rotto', req=None, sblocca_parola='CHIATTA', chiude=None,
         approf=['Testimonianza', 'Presagio']),
    dict(n=4, nome='La Sagrestia della Cattedrale', req=None, chiude=None,
         approf=['Osservazione', 'Testimonianza']),
    dict(n=5, nome='Bottega del Liutaio Ferri', req=('oggetto', 'CORDA DI VIOLINO'), chiude=None,
         approf=['Osservazione', 'Referto'], diapason=True),
    dict(n=6, nome='Il Canale Basso', req=('parola', 'CHIATTA'), chiude=23,
         approf=['Testimonianza', 'Presagio']),
    dict(n=7, nome='L’Archivio Civico', req=('parola', 'SOMMERSO'), chiude=23,
         approf=['Osservazione']),
    dict(n=8, nome='La Gendarmeria', req=None, chiude=21,
         approf=['Referto', 'Testimonianza']),
]

# Sblocchi Approfondimento per eroe, presi 1:1 dal testo abilita' in
# gen_cards.py (NON dedotti per string-matching sul flavor text: Sibilla,
# Carbone e Brera nominano nel loro stesso testo parole come "Referto"/
# "Reperto"/"Presagio" che farebbero scattare falsi positivi - vedi bug
# corretto dopo la run-02 di sessione: Sibilla aveva ottenuto 3 cariche
# fasulle oltre al suo unico jolly).
# valore = {tipo: cariche} oppure {'jolly': N} (N volte, un tipo qualsiasi
# a scelta, mai piu' di N letture totali indipendentemente dal tipo).
INDAGINE_UNLOCK = {
    'ELENA FOSCO': {'Osservazione': 2},
    'DOTT. ATTILIO MARN': {'Referto': 1},
    'SIBILLA REVE': {'jolly': 1},
    'NINO “GRIMALDELLO” CAUTO': {},           # Accesso: bypassa i luoghi, non legge Approfondimenti
    'OTTONE “MEZZENA” MASSARI': {'Testimonianza': 1},
    'CARLA DOSTI': {'Testimonianza': 1},
    'DOTT. LAZZARO SERRA': {'Presagio': 1},
    'PADRE CELSO MARANI': {},                 # Discernimento: si'/no su un luogo, non e' un Approfondimento
    'FULGENZIO CARBONE': {},                  # esamina Oggetti/Reperti gia' trovati, non Approfondimenti
    'OTTAVIO BRERA': {'Referto': 1},
    'MORA “SPILLA” FANTI': {},                # Ombra fiuta: conta gli Approfondimenti, non li legge
}


def roll2d6():
    a, b = random.randint(1, 6), random.randint(1, 6)
    return a, b, a + b


def check(log, chi, stat_label, stat_val, diff_name, extra=0, extra_label=''):
    a, b, s = roll2d6()
    tot = s + stat_val + extra
    ok = tot >= DIFF[diff_name]
    extra_txt = f' +{extra_label}({extra:+d})' if extra else ''
    log(f'    [PROVA {stat_label}] {chi}: 2d6({a},{b})={s} +{stat_label}({stat_val}){extra_txt} '
        f'= {tot} vs {diff_name}({DIFF[diff_name]}) -> {"SUCCESSO" if ok else "FALLITA"}')
    return ok, tot


def attack_roll(log, attacker, vigore, armed, target_name, difesa, bonus=0, bonus_label=''):
    a, b, s = roll2d6()
    bonus_tot = vigore + (1 if armed else 0) + bonus
    tot = s + bonus_tot
    ok = tot >= difesa
    extra_txt = f' +{bonus_label}({bonus:+d})' if bonus else ''
    log(f'    [ATTACCO] {attacker} -> {target_name}: 2d6({a},{b})={s} +VIGORE({vigore})'
        f'{"+arma(1)" if armed else ""}{extra_txt} = {tot} vs Difesa({difesa}) '
        f'-> {"COLPITO" if ok else "MANCATO"}')
    return ok


def enemy_attack_roll(log, enemy_name, att, target_hero, difesa):
    a, b, s = roll2d6()
    tot = s + att
    ok = tot >= difesa
    log(f'    [ATTACCO NEMICO] {enemy_name} -> {target_hero}: 2d6({a},{b})={s} +Attacco({att}) '
        f'= {tot} vs Difesa({difesa}) -> {"COLPITO" if ok else "MANCATO"}')
    return ok


class Logger:
    def __init__(self, path):
        self.f = open(path, 'w', encoding='utf-8')

    def __call__(self, line=''):
        self.f.write(line + '\n')

    def close(self):
        self.f.close()


def simula_indagine(party, log):
    log('=' * 78)
    log('INDAGINE - Episodio 1: "Il Coro Sommerso"')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    log('Clock: 6 ore, dalle 18:00 alle 24:00.')
    log('')
    heroes = [HERO[n] for n in party]
    ore = 6
    ora_corrente = 18
    visitati = []
    parole = set()
    oggetti = set()
    diapason = False
    approf_letti = 0
    approf_falliti = 0
    charges = {n: dict(INDAGINE_UNLOCK.get(n, {})) for n in party}
    fanti_scout = any(INDAGINE_UNLOCK.get(n, {}) == {} and 'Ombra fiuta' in HERO[n]['abil'] for n in party)

    # Tipi che QUESTO party puo' effettivamente sbloccare (il jolly di Sibilla
    # copre tutti i tipi, ma una volta sola: l'euristica sotto lo tratta come
    # copertura piena per la scelta del luogo, il consumo resta a 1 uso vero).
    tipi_coperti = set()
    ha_jolly = False
    for n in party:
        for tipo in INDAGINE_UNLOCK.get(n, {}):
            if tipo == 'jolly':
                ha_jolly = True
            else:
                tipi_coperti.add(tipo)
    if ha_jolly:
        tipi_coperti |= {'Osservazione', 'Testimonianza', 'Referto', 'Presagio'}
    log(f'Tipi di Approfondimento coperti da questo party: {", ".join(sorted(tipi_coperti)) or "nessuno"}')
    log('')

    def luogo_raggiungibile(l):
        if ora_corrente >= (l['chiude'] or 99):
            return False
        req = l.get('req')
        if req is None:
            return True
        kind, key = req
        return key in (parole if kind == 'parola' else oggetti)

    def punteggio(l):
        # 1,2,3 sempre per primi: sbloccano gli altri luoghi (parola/oggetto).
        # Il diapason (L5) NON ha priorita' speciale: e' un oggetto come un
        # altro nel punteggio, l'euristica puo' anche saltarlo. Se il party
        # arriva al Custode senza diapason e perde, e' un esito legittimo
        # della simulazione, non un difetto da correggere a tavolino.
        strutturale = 0 if l['n'] in (1, 2, 3) else 1
        urgenza = l['chiude'] or 99  # chi chiude prima, tra i pari, va prima
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)  # più negativo = più utile a QUESTO party
        return (strutturale, urgenza, copertura, l['n'])

    da_rivisitare = []  # luoghi dove "leggere la scena" e' fallita, Approfondimento ancora da cogliere

    def tenta_approfondimenti(l):
        nonlocal approf_letti, approf_falliti
        for tipo in l['approf']:
            idoneo = next((n for n in party if
                           charges[n].get(tipo, 0) > 0 or charges[n].get('jolly', 0) > 0), None)
            if idoneo:
                usa_jolly = charges[idoneo].get(tipo, 0) <= 0
                if usa_jolly:
                    charges[idoneo]['jolly'] -= 1
                    log(f'    [APPROFONDIMENTO {tipo}] sbloccato da {idoneo} (jolly, Sesto Senso).')
                else:
                    charges[idoneo][tipo] -= 1
                    log(f'    [APPROFONDIMENTO {tipo}] sbloccato da {idoneo}.')
                approf_letti += 1
            else:
                log(f'    [APPROFONDIMENTO {tipo}] nessun eroe idoneo presente/con usi residui — non letto.')
                approf_falliti += 1

    while ore > 0:
        candidati = [l for l in LUOGHI_SIM if l['n'] not in visitati and luogo_raggiungibile(l)]
        if not candidati:
            log(f'[h{ora_corrente:02d}:00] Nessun luogo raggiungibile con le info raccolte finora '
                f'({ore} ore rimaste, non spese).')
            break
        candidati.sort(key=punteggio)
        l = candidati[0]
        # Chiudere in anticipo: col nucleo garantito gia' in mano (>=1 Approfondimento
        # letto) e poche ore residue, un gruppo plausibile preferisce banchare il
        # Vantaggio (FASE 1 del Regolamento) piuttosto che rincorrere un ultimo luogo
        # non strutturale (non serve a sbloccarne altri). Senza questa soglia
        # SLANCIO/PREPARATI non scattano mai: 6 ore bastano appena per gli 8 luoghi,
        # il gruppo le spenderebbe sempre tutte sui nuovi luoghi.
        if approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3):
            log(f'[h{ora_corrente:02d}:00] Il gruppo ha già il nucleo garantito in mano: chiude '
                f'l’indagine con {ore} ora/e ancora sul Taccuino invece di visitare anche il '
                f'Luogo {l["n"]} — {l["nome"]}.')
            break
        visitati.append(l['n'])
        log(f'[h{ora_corrente:02d}:00] Visita Luogo {l["n"]} — {l["nome"]}  (1 ora)')
        vero_luogo = LUOGHI_BY_N.get(l['n'])
        if vero_luogo:
            log(f'    "{strip_tags(vero_luogo["testo"])}"')
        # Leggere la scena: alla prima visita, un eroe a scelta (il migliore ACUME
        # del party) prova ACUME Media prima di leggere gli indizi. Gli indizi core
        # si leggono comunque (regola Gumshoe: mai un vicolo cieco); solo
        # l'eventuale Approfondimento resta condizionato all'esito.
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok, _ = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if vero_luogo:
            for indizio in vero_luogo.get('indizi', []):
                log(f'    - Indizio: {strip_tags(indizio)}')
        if l.get('sblocca_parola'):
            parole.add(l['sblocca_parola'])
            log(f'    -> Parola chiave trovata (vedi indizio sopra): {l["sblocca_parola"]}')
        if l.get('sblocca_oggetto'):
            oggetti.add(l['sblocca_oggetto'])
            log(f'    -> Oggetto trovato (vedi indizio sopra): {l["sblocca_oggetto"]}')
        if l.get('diapason'):
            diapason = True
            log('    -> Trovato: IL DIAPASON D’ARGENTO (vedi indizio sopra; servirà contro il Custode della Cera).')
        if ok:
            tenta_approfondimenti(l)
        else:
            log('    “Leggere la scena” fallita: l’Approfondimento di questo luogo resta nascosto '
                '(si può tornare più tardi, senza ripetere il tiro).')
            approf_falliti += len(l['approf'])
            if l['approf']:
                da_rivisitare.append(l)
        ore -= 1
        ora_corrente += 1

    # Un gruppo plausibile non insegue OGNI Approfondimento mancato a costo di
    # spendersi tutte le ore residue: torna a cogliere il rimpianto piu' sentito
    # (il primo mancato) poi preferisce chiudere con ore in banca (Vantaggio,
    # vedi FASE 1 nel Regolamento) piuttosto che il resto. Senza questo limite
    # SLANCIO/PREPARATI non scatta mai in simulazione: l'euristica precedente
    # spendeva sempre fino all'ultima ora disponibile sulle rivisite.
    RIVISITE_MASSIME = 1
    rivisite = 0
    while ore > 0 and da_rivisitare and rivisite < RIVISITE_MASSIME:
        l = da_rivisitare.pop(0)
        log(f'[h{ora_corrente:02d}:00] Ritorno al Luogo {l["n"]} — {l["nome"]} per cogliere '
            f'l’Approfondimento mancato (1 ora, nessun nuovo tiro).')
        tenta_approfondimenti(l)
        ore -= 1
        ora_corrente += 1
        rivisite += 1
    if ore > 0 and da_rivisitare:
        log(f'[h{ora_corrente:02d}:00] Restano {len(da_rivisitare)} Approfondimento/i mancato/i '
            f'ancora recuperabile/i, ma il gruppo preferisce chiudere l’indagine con {ore} '
            f'ora/e ancora sul Taccuino (Vantaggio per la Spedizione) piuttosto che inseguirli tutti.')

    ore_avanzate = ore
    if ore_avanzate >= 3:
        tier = 'SLANCIO (3 azioni al 1° round di spedizione)'
    elif ore_avanzate >= 1:
        tier = 'PREPARATI (+1 Salute massima a testa)'
    else:
        tier = 'nessun vantaggio'
    log('')
    log(f'Fine Indagine: {len(visitati)}/8 luoghi visitati, {approf_letti} Approfondimenti letti, '
        f'{approf_falliti} mancati.')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    log(f'Diapason d’argento in mano: {"sì" if diapason else "no"}')
    if fanti_scout:
        log('Nota: Ombra fiuta (Fanti) avrebbe dato il conteggio Approfondimenti per luogo prima di '
            'ogni scelta — l’euristica sopra già sceglie con priorità di sblocco, effetto equivalente.')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, diapason=diapason, visitati=visitati)


def spawn_from_card(log, title, pool, enemies, round_n):
    nome, n, subito = CARD_SPAWN[title]
    dist_base = SPAWN_DISTANZA.get(title, 0)
    distanza = dist_base if dist_base is not None else CASELLE_TESSERA * max(1, round_n)
    piazzati = 0
    for _ in range(n):
        if pool[nome] <= 0:
            log(f'    Segnalini {nome} esauriti: il piazzamento non ha luogo (resto della carta si applica comunque).')
            continue
        pool[nome] -= 1
        piazzati += 1
        base = NEMICO[nome]
        enemies.append(dict(nome=nome, fer=base['fer'], fer_max=base['fer'], dif=base['dif'],
                             att=base['att'], dan=base['dan'], mov=base['mov'], distanza=distanza))
    if piazzati:
        extra = f', a {distanza} caselle dal gruppo' if distanza > 0 else ', già adiacenti'
        log(f'    Piazzati {piazzati}x {nome} (pool residua: {pool[nome]}){extra}.')
    return subito and piazzati


def simula_spedizione(party, indagine, log, run_seed):
    log('=' * 78)
    log('SPEDIZIONE - Il Campanile di San Teodoro (sotterranei)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    log(f'Bonus da Indagine: {indagine["tier"]}; diapason: {"sì" if indagine["diapason"] else "no"}')
    log('NOTA: gruppo trattato come blocco unico tessera per tessera (vedi intestazione script).')
    log('')

    salute = {}
    salute_max = {}
    armed = {n: True for n in party}  # tutti gli eroi hanno un'arma iniziale (+1)
    for n in party:
        h = HERO[n]
        smax = h['salute'] + (1 if indagine['tier'].startswith('PREPARATI') else 0)
        salute[n] = smax
        salute_max[n] = smax
    down = set()
    pool = dict(TOKEN_POOL_BASE)
    enemies = []
    canto = 0
    custode = None
    custode_stunned = False
    diapason_usato = False
    voce_ferma_scade_round = 0
    adescati = []  # nemici che l'Esca preziosa (Carbone) distoglie per il round corrente
    chiave = False
    ruggero_libero = False
    tessere_cercate = set()  # luogo_label gia' perquisiti (Cercare, una volta a tessera)
    n_players_actions = len(party) * 2

    ability_uses = {n: dict() for n in party}
    for n in party:
        a = HERO[n]['abil']
        u = ability_uses[n]
        if 'Colpo da macello' in a:
            u['cleave_per_turno'] = True
        if 'Pronto Soccorso' in a:
            u['cura'] = 3
        if 'Flash!' in a:
            u['flash'] = 2
        if 'scruta' in a.lower() or 'prime 2 carte' in a:
            u['scruta'] = 3
        if 'Voce ferma' in a:
            u['voce_ferma'] = 3
        if 'Litania' in a:
            u['litania'] = 1
        if 'Esca preziosa' in a:
            u['esca'] = 2
        if 'Malacarne' in a:
            u['malacarne'] = 1
        if 'Scambio di mano' in a:
            u['scambio'] = 2

    def carica_minaccia_deck():
        d = list(MINACCE)
        random.shuffle(d)
        return d

    deck = carica_minaccia_deck()
    scarti = []

    def pesca():
        nonlocal deck, scarti
        if not deck:
            log('    Mazzo Minaccia esaurito: si rimescolano gli scarti.')
            deck = scarti
            scarti = []
            random.shuffle(deck)
        c = deck.pop()
        scarti.append(c)
        return c

    def vivi():
        return [n for n in party if n not in down]

    def rianima(soccorritore, bersaglio):
        h = HERO[soccorritore]
        target_salute = 3 if 'Rianimare gli riesce sempre' in h['abil'] else 2
        salute[bersaglio] = min(salute_max[bersaglio], target_salute)
        down.discard(bersaglio)
        log(f'    {soccorritore} rianima {bersaglio} -> Salute {salute[bersaglio]}.')

    def applica_danno(bersaglio, dan, fonte):
        salute[bersaglio] -= dan
        log(f'    {bersaglio} subisce {dan} danno da {fonte} (Salute: {max(salute[bersaglio], 0)}/{salute_max[bersaglio]}).')
        if salute[bersaglio] <= 0 and bersaglio not in down:
            down.add(bersaglio)
            log(f'    *** {bersaglio} è A TERRA. ***')

    def voce_ferma_bonus():
        if round_n <= voce_ferma_scade_round:
            n = next((x for x in party if 'Voce ferma' in HERO[x]['abil']), None)
            if n:
                return 2, n
        return 0, None

    path = ['T2 (Sala delle Casse)', 'T4 (Ufficio del Custode)', 'T2 (Sala delle Casse)',
            'T5 (Scala interrata)', 'T6 (Cripta della Cera)']
    round_n = 0
    esito = None

    def fase_minaccia():
        nonlocal canto, custode, custode_stunned
        n_carte = max(1, len(vivi()) // 2)
        for _ in range(n_carte):
            if ability_uses.get('_scruta_hero'):
                pass
            c = pesca()
            titolo, testo, tipo, subito = c
            log(f'  [MINACCIA] {titolo} ({tipo}) — {testo[:90]}{"…" if len(testo) > 90 else ""}')
            if titolo in CARD_SPAWN:
                if titolo == 'LA MAREA DI CERA':
                    # "Tutti i Fonditori in gioco si attivano subito": quelli gia'
                    # piazzati (non il nuovo, che segue la distanza dinamica normale
                    # di IL FONDITORE) diventano adiacenti per questo round.
                    fonditori_esistenti = [e for e in enemies if e['nome'] == 'IL FONDITORE' and e['fer'] > 0]
                    for e in fonditori_esistenti:
                        e['distanza'] = 0
                    if fonditori_esistenti:
                        log(f'    {len(fonditori_esistenti)}x IL FONDITORE già in gioco si attiva subito.')
                subito_attiva = spawn_from_card(log, titolo, pool, enemies, round_n)
                if subito_attiva and vivi():
                    e = enemies[-1]
                    bersaglio = random.choice(vivi())
                    log(f'    {e["nome"]} si attiva subito:')
                    if enemy_attack_roll(log, e['nome'], e['att'], bersaglio, 8):
                        applica_danno(bersaglio, e['dan'], e['nome'])
            elif titolo in INSIDIA:
                diff_name, dan, chi = INSIDIA[titolo]
                bersagli = vivi() if 'ogni' in chi else [min(vivi(), key=lambda n: HERO[n]['nervi'])] if vivi() else []
                for b in bersagli:
                    bonus, chi_bonus = voce_ferma_bonus()
                    ok, _ = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, bonus,
                                  f'Voce ferma di {chi_bonus}' if bonus else '')
                    if not ok and dan:
                        applica_danno(b, dan, titolo)
            elif titolo in CRESCENDO:
                if custode is None:
                    canto += 1
                    log(f'    Segnalino Canto: {canto}/3.')
                    if canto >= 3:
                        log('    Il Canto raggiunge 3: il Custode della Cera si desta in anticipo!')
                elif custode['fer'] > 0:
                    custode['fer'] = min(custode['fer_max'], custode['fer'] + 1)
                    custode_stunned = False
                    log(f'    Il Custode recupera 1 ferita ({custode["fer"]}/{custode["fer_max"]}) e si attiva subito.')
                else:
                    log('    Il Custode è già stato sconfitto: nessun effetto su di lui (il culto '
                        'sente comunque il rituale avvicinarsi, vedi Regolamento).')
            elif titolo == 'PRESAGIO':
                log('    Nessun effetto meccanico (tensione).')
            elif titolo == 'ECO AMICA':
                log('    Rivelata una tessera coperta adiacente (nessun effetto in questa astrazione).')
            elif titolo in ('CERA CHE COLA', 'CORRENTE GELIDA'):
                log('    Penalità di Movimento fino al prossimo turno (non modellata nel loop di combattimento).')
            else:
                log('    (carta senza effetto modellato in questa simulazione)')

    def fase_nemici(luogo_label, party_in_transito):
        nonlocal custode_stunned
        # Il gruppo che avanza di tessera "guadagna" GUADAGNO_GRUPPO caselle di
        # vantaggio sui nemici non ancora aggrappati: chi ha Movimento piu' basso
        # o uguale (es. il Fonditore, mov 2, o Adepto/Sgherro, mov 4) resta
        # indietro o al massimo tiene il passo, come da testo del Fonditore
        # ("non corre mai"). Da fermi (combattimento al Custode) il vantaggio e' 0.
        guadagno = GUADAGNO_GRUPPO if party_in_transito else 0
        for e in list(enemies):
            if e['fer'] <= 0 or not vivi():
                continue
            if e in adescati:
                log(f'  {e["nome"]} si dirige verso l’esca (Carbone): non attacca questo round.')
                continue
            distanza = e.get('distanza', 0)
            if distanza > 0:
                e['distanza'] = max(0, distanza + guadagno - e['mov'])
                if e['distanza'] > 0:
                    log(f'  {e["nome"]} si avvicina (Movimento {e["mov"]}): ancora '
                        f'{e["distanza"]} caselle prima di raggiungere il gruppo.')
                    continue
                log(f'  {e["nome"]} raggiunge il gruppo.')
            bersaglio = random.choice(vivi())
            difesa = 8
            log(f'  {e["nome"]} attacca {bersaglio}:')
            if enemy_attack_roll(log, e['nome'], e['att'], bersaglio, difesa):
                applica_danno(bersaglio, e['dan'], e['nome'])
        adescati.clear()
        if custode and custode['fer'] > 0 and vivi():
            if custode_stunned:
                log(f'  {custode["nome"]} salta l’attivazione (diapason).')
                custode_stunned = False
            else:
                bersaglio = random.choice(vivi())
                log(f'  {custode["nome"]} attacca {bersaglio}:')
                if enemy_attack_roll(log, custode['nome'], custode['att'], bersaglio, 8):
                    applica_danno(bersaglio, custode['dan'], custode['nome'])

    def fase_eroi(luogo_label):
        nonlocal chiave, ruggero_libero, custode, custode_stunned, diapason_usato, canto, voce_ferma_scade_round
        for n in vivi():
            h = HERO[n]
            # Attaccare in mischia richiede un nemico adiacente (regola vera): chi non
            # ha ancora colmato la propria distanza (vedi fase_nemici) non e' un
            # bersaglio valido per l'azione Attaccare, solo per abilita' "in vista"
            # (Esca preziosa, Malacarne, sotto) che restano sugli `enemies` grezzi.
            bersagli_vivi = [e for e in enemies if e['fer'] > 0 and e.get('distanza', 0) <= 0]
            if custode and custode['fer'] > 0:
                bersagli_vivi.append(custode)
            # Carbone: Esca preziosa, devia fino a 2 nemici (non il Custode) dal
            # loro prossimo attacco - un round di sollievo per il gruppo.
            if ability_uses[n].get('esca', 0) > 0:
                bersagli_esca = [e for e in enemies if e['fer'] > 0 and e not in adescati][:2]
                if bersagli_esca:
                    ability_uses[n]['esca'] -= 1
                    adescati.extend(bersagli_esca)
                    nomi = ', '.join(e['nome'] for e in bersagli_esca)
                    log(f'    [ABILITÀ] {n} usa Esca preziosa: {nomi} si dirige verso l’esca invece '
                        f'che verso il gruppo alla prossima attivazione.')
                    continue
            # Brera: rimuove un nemico di truppa a inizio combattimento (1 volta)
            if ability_uses[n].get('malacarne', 0) > 0:
                truppa = [e for e in enemies if e['fer'] > 0 and e['nome'] in MALAVITA_TRUPPA]
                if truppa:
                    bersaglio_e = truppa[0]
                    ability_uses[n]['malacarne'] -= 1
                    enemies.remove(bersaglio_e)
                    log(f'    [ABILITÀ] {n} usa Vi conosco, Malacarne su {bersaglio_e["nome"]}: rimosso dal tabellone.')
                    continue
            # Marani: Litania rimuove un segnalino Canto
            if ability_uses[n].get('litania', 0) > 0 and canto > 0 and custode is None:
                ability_uses[n]['litania'] -= 1
                log(f'    [ABILITÀ] {n} usa Litania: -1 segnalino Canto ({canto}->{canto - 1}).')
                canto -= 1
                continue
            # Attilio: cura un alleato ferito
            if ability_uses[n].get('cura', 0) > 0:
                feriti = [m for m in vivi() if salute[m] < salute_max[m]] + list(down)
                if feriti:
                    bersaglio_h = min(feriti, key=lambda m: salute.get(m, 0))
                    ability_uses[n]['cura'] -= 1
                    if bersaglio_h in down:
                        rianima(n, bersaglio_h)
                    else:
                        salute[bersaglio_h] = min(salute_max[bersaglio_h], salute[bersaglio_h] + 2)
                        log(f'    [ABILITÀ] {n} usa Pronto Soccorso su {bersaglio_h} -> Salute {salute[bersaglio_h]}.')
                    continue
            # Serra: attiva l'aura quando ci sono nemici sul campo e non è già attiva;
            # dura fino al suo prossimo turno (round corrente + 1), poi va riattivata.
            if (ability_uses[n].get('voce_ferma', 0) > 0 and round_n > voce_ferma_scade_round
                    and (enemies or (custode and custode['fer'] > 0))):
                ability_uses[n]['voce_ferma'] -= 1
                voce_ferma_scade_round = round_n + 1
                log(f'    [ABILITÀ] {n} attiva Voce ferma ({ability_uses[n]["voce_ferma"]} usi '
                    f'residui): +2 NERVI agli alleati fino al suo prossimo turno.')
                continue
            if custode and custode['fer'] > 0 and diapason['has'] and not diapason_usato and not custode_stunned:
                diapason_usato = True
                log(f'    [OGGETTO] {n} fa vibrare il diapason d’argento sul Custode: Difesa 9->5, '
                    f'salta la prossima attivazione.')
                custode['dif'] = 5
                custode_stunned = True
                continue
            if bersagli_vivi:
                bersaglio_e = min(bersagli_vivi, key=lambda e: e['fer'])
                if attack_roll(log, n, h['vigore'], armed[n], bersaglio_e['nome'], bersaglio_e['dif']):
                    bersaglio_e['fer'] -= 1
                    log(f'    {bersaglio_e["nome"]}: {max(bersaglio_e["fer"], 0)}/{bersaglio_e["fer_max"]} ferite residue.')
                    if bersaglio_e['fer'] <= 0:
                        log(f'    {bersaglio_e["nome"]} è ABBATTUTO.')
                        if bersaglio_e is custode:
                            log('    *** IL CUSTODE DELLA CERA È SCONFITTO. ***')
                        elif ability_uses[n].get('cleave_per_turno'):
                            altri = [e for e in enemies
                                     if e is not bersaglio_e and e['fer'] > 0 and e.get('distanza', 0) <= 0]
                            if altri:
                                extra = altri[0]
                                log(f'    [ABILITÀ] {n} usa Colpo da macello: attacco extra su {extra["nome"]}.')
                                if attack_roll(log, n, h['vigore'], armed[n], extra['nome'], extra['dif']):
                                    extra['fer'] -= 1
                                    log(f'    {extra["nome"]}: {max(extra["fer"], 0)}/{extra["fer_max"]} ferite residue.')
                continue
            # Senza bersaglio in mischia, un eroe non sta comunque fermo (regola vera:
            # Rianimare e Cercare sono azioni disponibili a chiunque, non solo ad
            # Attilio o a chi ha un'abilita' dedicata). Priorita': un alleato a terra
            # prima di tutto, poi perquisire la tessera se non gia' fatto in questa
            # visita. L'oggetto eventualmente trovato non e' modellato (il simulatore
            # non conosce quale tessera nasconda cosa): logghiamo solo l'esito della
            # prova, non un oggetto specifico.
            if down:
                bersaglio_down = next(iter(down))
                down.discard(bersaglio_down)
                salute[bersaglio_down] = min(salute_max[bersaglio_down], 2)
                log(f'    [AZIONE] {n} rianima {bersaglio_down}: torna in piedi con 2 Salute.')
                continue
            if luogo_label not in tessere_cercate:
                tessere_cercate.add(luogo_label)
                ok_cerca, _ = check(log, n, 'ACUME', h['acume'], 'Media')
                if ok_cerca:
                    log(f'    {n} cerca sulla tessera e trova qualcosa (oggetto non modellato '
                        f'in questa simulazione).')
                else:
                    log(f'    {n} cerca sulla tessera: niente da trovare qui, o prova fallita.')
                continue
            log(f'    {n}: nessun bersaglio, avanza / assiste il gruppo.')

    for tappa in path:
        round_n += 1
        log(f'--- Round {round_n}: il gruppo raggiunge {tappa} ---')
        if tappa.startswith('T5') and round_n:
            for n in vivi():
                bonus, chi_bonus = voce_ferma_bonus()
                ok, _ = check(log, n, 'NERVI', HERO[n]['nervi'], 'Facile', bonus,
                              f'Voce ferma di {chi_bonus}' if bonus else '')
                if not ok:
                    log(f'    {n} avrà solo 1 azione al prossimo turno (non modellato oltre il log).')
        if tappa.startswith('T4') and not chiave:
            log('    Cercando: trovata LA CHIAVE DELLA CELLA. Prenderla è una scelta — il gruppo '
                'decide di prenderla (oggetto rischioso).')
            chiave = True
            presatore = max(party, key=lambda n: HERO[n]['nervi'])
            bonus, chi_bonus = voce_ferma_bonus()
            ok, _ = check(log, presatore, 'NERVI', HERO[presatore]['nervi'], 'Media', bonus,
                          f'Voce ferma di {chi_bonus}' if bonus else '')
            if not ok:
                log(f'    I fumi stordiscono {presatore}: 1 sola azione al prossimo turno (non '
                    f'modellato oltre il log). La chiave resta comunque sua.')
        if tappa.startswith('T6') and custode is None:
            log('    Rivelata la Cripta della Cera: il Custode della Cera si desta con 2 Adepti.')
            custode = dict(CUSTODE, fer_max=CUSTODE['fer'])
            pool['ADEPTO INCAPPUCCIATO'] -= 2
            for _ in range(2):
                base = NEMICO['ADEPTO INCAPPUCCIATO']
                enemies.append(dict(nome='ADEPTO INCAPPUCCIATO', fer=base['fer'], fer_max=base['fer'],
                                     dif=base['dif'], att=base['att'], dan=base['dan'], mov=base['mov'],
                                     distanza=0))  # rivelati nella stessa stanza del gruppo
        diapason = {'has': indagine['diapason']}
        fase_eroi(tappa)
        fase_minaccia()
        fase_nemici(tappa, True)
        if not vivi():
            esito = 'SCONFITTA (party wipe)'
            break
        if round_n > 30:
            esito = 'TIMEOUT (30 round, simulazione interrotta)'
            break

    if esito is None and custode and custode['fer'] > 0:
        log('--- Combattimento contro il Custode della Cera ---')
        while custode['fer'] > 0 and vivi():
            round_n += 1
            log(f'--- Round {round_n}: scontro nella Cripta della Cera ---')
            fase_eroi('T6')
            fase_minaccia()
            fase_nemici('T6', False)
            if not vivi():
                esito = 'SCONFITTA (party wipe)'
                break
            if round_n > 30:
                esito = 'TIMEOUT (30 round)'
                break

    if esito is None:
        if chiave:
            log('    La cella si apre con la chiave: RUGGERO È LIBERO.')
            ruggero_libero = True
        else:
            n = max(vivi(), key=lambda x: HERO[x]['acume'])
            ok, _ = check(log, n, 'ACUME', HERO[n]['acume'], 'Difficile')
            if ok:
                log('    La cella si apre scassinata: RUGGERO È LIBERO.')
                ruggero_libero = True
            else:
                log('    Scasso fallito: si ritenta il prossimo round (non modellato oltre il log).')
                ruggero_libero = True  # non blocchiamo la simulazione su un loop di retry
        log('--- Ritorno a T1 con Ruggero (3 round di movimento, minacce ancora attive) ---')
        for _ in range(3):
            round_n += 1
            log(f'--- Round {round_n}: rientro verso T1 ---')
            fase_eroi('rientro')
            fase_minaccia()
            fase_nemici('rientro', True)
            if not vivi():
                esito = 'SCONFITTA (party wipe durante il rientro)'
                break
        if esito is None:
            esito = 'VITTORIA'

    log('')
    log('=' * 78)
    log(f'ESITO SPEDIZIONE: {esito}')
    log(f'Round totali: {round_n}')
    for n in party:
        stato = 'a terra' if n in down else f'{max(salute[n], 0)}/{salute_max[n]} Salute'
        log(f'  {n}: {stato}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, salute_finale=dict(salute), down=list(down))


def esegui_run(nome_run, party, seed):
    random.seed(seed)
    run_dir = os.path.join(LOG_DIR, nome_run)
    os.makedirs(run_dir, exist_ok=True)
    ind_log = Logger(os.path.join(run_dir, 'indagine.log'))
    sped_log = Logger(os.path.join(run_dir, 'spedizione.log'))
    ind_log(f'Run: {nome_run}  |  seed={seed}  |  generato: {datetime.now().isoformat(timespec="seconds")}')
    sped_log(f'Run: {nome_run}  |  seed={seed}  |  generato: {datetime.now().isoformat(timespec="seconds")}')
    indagine = simula_indagine(party, ind_log)
    ind_log.close()
    spedizione = simula_spedizione(party, indagine, sped_log, seed)
    sped_log.close()
    return dict(nome=nome_run, party=party, indagine=indagine, spedizione=spedizione)


def main():
    os.makedirs(LOG_DIR, exist_ok=True)
    # Party di default (composizioni "medie"). Per una sessione di stress-test
    # mirata (vedi /playtest), sostituisci questa lista con composizioni scelte
    # apposta per far fallire qualcosa: nessun healer, nessun combattente,
    # party al minimo/massimo, un'abilita' messa apposta dopo chi le ruba il
    # bersaglio nell'ordine del gruppo, ecc. Il nome del run finisce nel path
    # del log: usane uno che dica QUALE dinamica stai stressando.
    runs = [
        ('run-04_senza_healer_5forte', ['OTTONE “MEZZENA” MASSARI', 'ELENA FOSCO',
                                         'NINO “GRIMALDELLO” CAUTO', 'SIBILLA REVE',
                                         'MORA “SPILLA” FANTI'], 4004),
        ('run-05_minimo_con_healer', ['DOTT. ATTILIO MARN', 'OTTONE “MEZZENA” MASSARI'], 5005),
        ('run-06_cervelli_senza_tank', ['ELENA FOSCO', 'DOTT. LAZZARO SERRA', 'FULGENZIO CARBONE',
                                         'OTTAVIO BRERA', 'MORA “SPILLA” FANTI'], 6006),
        ('run-07_cinque_nuovi_combo', ['DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
                                        'FULGENZIO CARBONE', 'OTTAVIO BRERA',
                                        'MORA “SPILLA” FANTI'], 7007),
        ('run-08_turnorder_ottone_prima_brera', ['OTTONE “MEZZENA” MASSARI', 'ELENA FOSCO',
                                                   'OTTAVIO BRERA', 'FULGENZIO CARBONE'], 8008),
    ]
    riepilogo = []
    for nome, party, seed in runs:
        print(f'Eseguo {nome} ({len(party)} eroi)...')
        r = esegui_run(nome, party, seed)
        riepilogo.append(r)

    idx_path = os.path.join(LOG_DIR, 'riepilogo.md')
    with open(idx_path, 'w', encoding='utf-8') as f:
        f.write('# Riepilogo playtest simulati\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('| Run | Eroi | Ore avanzate | Diapason | Esito spedizione | Round | Eroi a terra a fine partita |\n')
        f.write('|---|---|---|---|---|---|---|\n')
        for r in riepilogo:
            ind = r['indagine']
            sp = r['spedizione']
            f.write(f'| {r["nome"]} | {", ".join(r["party"])} | {ind["ore_avanzate"]} '
                    f'({ind["tier"].split(" (")[0]}) | {"sì" if ind["diapason"] else "no"} | '
                    f'{sp["esito"]} | {sp["round_n"]} | {", ".join(sp["down"]) or "nessuno"} |\n')
        f.write('\nLog completi (tiri di dado, prove, decisioni) in `<run>/indagine.log` e '
                '`<run>/spedizione.log`.\n')
    print(f'\nFatto. Log in {LOG_DIR}')


if __name__ == '__main__':
    main()
