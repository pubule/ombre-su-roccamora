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
- Il Custode della Cera si desta al 3° segnalino Canto ANCHE prima di
  raggiungere T6 (regola vera, Soluzione: "oppure al terzo segnalino
  Canto... piazzatelo sulla tessera piu' lontana dagli eroi") - prima di
  questa istrumentazione (sessione dedicata a party da 8-10 eroi) il
  codice si limitava a loggare un avviso senza spawnarlo davvero: gap
  corretto qui perche' l'ipotesi "il Custode si sveglia troppo presto con
  piu' Minacce pescate a round" non era altrimenti misurabile. Stessa
  correzione per "da quel momento ogni Fase Minaccia pesca 1 carta in
  piu'" (`canto_bonus_carte`), applicata una volta sola al raggiungimento
  di 3 segnalini indipendentemente da quando/come il Custode e' spawnato.
- Formula di pesca Minaccia parametrizzata (`MINACCIA_FORMULE`): la regola
  vera (`eroi // 2`, arrotondato per eccesso nel Regolamento ma per difetto
  con minimo 1 in questo codice, invariato) resta il default 'standard';
  altre chiavi sono varianti diagnostiche per party grandi, non regole
  ufficiali.

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
# Le uniche 3 carte Approfondimento che confermano ESPLICITAMENTE che Ferri
# comanda il culto (Domanda 2), non solo vi e' coinvolto - le altre 11 sono
# state ammorbidite apposta (vedi gen_cards.py, LUOGHI). Serve a verificare
# empiricamente che un gruppo plausibile ne trovi quasi sempre una, dato che
# il vantaggio "Smascherato" ora richiede la carta giusta, non una qualsiasi.
CHI_ESPLICITO = {(3, 'Testimonianza'), (7, 'Osservazione'), (8, 'Referto')}


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

# Formula di pesca Minaccia a round, per party size (chiave -> funzione
# eroi_vivi -> n_carte). 'standard' e' la regola vera del Regolamento
# (eroi//2, minimo 1). Le altre sono ipotesi diagnostiche da confrontare
# per party da 8-10, non proposte di regola gia' decise (vedi piano
# "portare il gioco a 10 giocatori"): 'tetto3'/'tetto4' bloccano la
# crescita oltre il ritmo gia' rodato a 5-6/8 eroi, per capire se il
# Canto/pool nemici reggono meglio con meno carte extra a round.
MINACCIA_FORMULE = {
    'standard': lambda n: max(1, n // 2),
    'tetto3': lambda n: max(1, min(n // 2, 3)),
    'tetto4': lambda n: max(1, min(n // 2, 4)),
    # Round 4: come tetto4 fino a 8 eroi, poi si ferma a 3 oltre (invece di
    # restare fissa a 4) - ipotesi per abbassare il tetto massimo di carte/
    # round proprio dove il risveglio anticipato del Custode sembrava piu'
    # rischioso nel round 3, senza toccare il ritmo gia' visto fino a 8.
    'tetto2_oltre8': lambda n: max(1, min(n // 2, 4) if n <= 8 else 3),
    # Round 6: come tetto3 ma il tetto di 3 carte si raggiunge a n=8 invece
    # che a n=6 (a 6 eroi restano 2 carte/round). Motivo: round 5 ha isolato
    # un crollo reale a n=6 con curva-C (0-13% vittoria su 5 party casuali
    # diversi) - a n=6 e n=8 tetto3 dava la STESSA pressione nemica (3
    # carte) ma n=6 ha 2 eroi in meno per assorbirla. Sequenza: 1,2,2,3,3.
    'tetto3_ritardato': lambda n: max(1, min(1 + (n + 1) // 4, 3)),
}

# Scalatura statistiche nemiche per party grandi (diagnostica, non regola
# vera): n -> (bonus Ferite, bonus Danno), applicato a tutti i nemici
# incluso il Custode. Round 4: SOLO Ferite (niente piu' bonus Danno - il
# round 3 ha mostrato che il Danno e' la leva piu' instabile: si moltiplica
# per ogni nemico che colpisce nello stesso round, mentre un bonus Ferite
# e' in parte auto-compensato da "piu' eroi = anche piu' attacchi dei
# giocatori"), curve che partono prima di n=5 (oggi 4 e 6 restavano a
# vittoria 100%, bonus 0) e crescono a passi piu' piccoli per evitare il
# salto netto 6->8 visto con le vecchie formule 'lieve'/'marcata'.
NEMICO_SCALE_FORMULE = {
    'nessuna': lambda n: (0, 0),
    'curva-A': lambda n: (max(0, (n - 3) // 3), 0),               # 2:0 4:0 6:1 8:1 10:2
    'curva-B': lambda n: (max(0, (n - 1) // 3), 0),               # 2:0 4:1 6:1 8:2 10:3
    'curva-C': lambda n: (max(0, round((n - 2) / 2.5)), 0),       # 2:0 4:1 6:2 8:2 10:3
    # Round 6: curva-C ma con bonus 0 sotto i 6 eroi (invece di partire gia'
    # a n=4). A n=4 'nessuna' scalatura da' gia' 95-100% vittoria - il
    # bonus prematuro di curva-C la faceva crollare al 42-53% senza motivo
    # (stesso tipo di bug del tetto Minaccia troppo precoce, vedi
    # tetto3_ritardato). Da n=6 in su identica a curva-C.
    'curva-C_tardiva': lambda n: (max(0, round((n - 2) / 2.5)) if n >= 6 else 0, 0),  # 2:0 4:0 6:2 8:2 10:3
}

# Copie extra di miniature stampabili per party grandi (diagnostica): "non
# il doppio" (richiesta esplicita) - +1 copia per tipo ogni 4 eroi oltre 5.
def token_pool_extra(n_eroi):
    return max(0, (n_eroi - 5) // 4)

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


class NullLogger:
    """Per i batch multi-seed (Fase C, round 2): solo il primo seed di ogni
    batch scrive log dettagliati su disco (utile per un controllo a
    campione), gli altri 4 usano questo per non moltiplicare i file - le
    statistiche aggregate restano comunque calcolate su tutti e 5."""
    def __call__(self, line=''):
        pass

    def close(self):
        pass


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
    chi_confermato = False
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
        #
        # Eccezione (rischio): un luogo non strutturale che chiuderebbe per
        # sempre se non visitato QUESTA ora salta in testa alla coda. Senza
        # questo, un luogo come il Luogo 8 (chiude presto, non sblocca nulla)
        # perde sempre contro 1/2/3 finche' non e' gia' troppo tardi per
        # visitarlo - irraggiungibile in ogni singola simulazione, non solo
        # qualche volta.
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        strutturale = 0 if l['n'] in (1, 2, 3) else 1
        urgenza = l['chiude'] or 99  # chi chiude prima, tra i pari, va prima
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)  # più negativo = più utile a QUESTO party
        return (rischio, strutturale, urgenza, copertura, l['n'])

    da_rivisitare = []  # luoghi dove "leggere la scena" e' fallita, Approfondimento ancora da cogliere

    def tenta_approfondimenti(l):
        nonlocal approf_letti, approf_falliti, chi_confermato
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
                if (l['n'], tipo) in CHI_ESPLICITO:
                    chi_confermato = True
                    log('    -> Questa carta conferma esplicitamente che Ferri comanda (Domanda 2).')
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
            # NON e' ancora la chiusura vera: rinuncia solo a NUOVI luoghi, potrebbe
            # ancora tornare a cogliere un Approfondimento mancato (vedi loop sotto).
            # La chiusura effettiva, con le ore davvero rimaste, e' nei due messaggi
            # dopo il loop di rivisita.
            log(f'[h{ora_corrente:02d}:00] Il gruppo ha già il nucleo garantito in mano: rinuncia '
                f'a nuovi luoghi (il prossimo sarebbe stato il Luogo {l["n"]} — {l["nome"]}), ma '
                f'valuta ancora se tornare a cogliere un Approfondimento mancato prima di chiudere.')
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
    log(f'Chi comanda confermato esplicitamente (Domanda 2, Vantaggio Smascherato): '
        f'{"sì" if chi_confermato else "no — risposta “vicina” da giudicare con elasticità"}')
    if fanti_scout:
        log('Nota: Ombra fiuta (Fanti) avrebbe dato il conteggio Approfondimenti per luogo prima di '
            'ogni scelta — l’euristica sopra già sceglie con priorità di sblocco, effetto equivalente.')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, diapason=diapason, visitati=visitati,
                chi_confermato=chi_confermato)


def simula_indagine_2gruppi(party, log, orologio_condiviso=True):
    """Diagnostica per 8-10 giocatori (NON una regola vera): il party si
    divide in 2 sottogruppi per l'intera Indagine (oggi la regola vera lo
    permette una sola volta a episodio, vedi Regolamento) - serve a
    misurare se la scarsita' "non potete visitare tutti gli 8 luoghi",
    elemento centrale della tensione della Fase 1, regge ancora quando il
    throughput raddoppia. `orologio_condiviso=True`: una visita di UN
    sottogruppo costa comunque solo 1 ora dal Taccuino comune (come la
    regola vera per la divisione singola, estesa qui a ogni visita).
    `orologio_condiviso=False`: ogni sottogruppo ha le proprie 6 ore
    indipendenti. Parole chiave/oggetti/Approfondimenti trovati da un
    sottogruppo restano disponibili per l'altro (stessa indagine, stesso
    Taccuino fisico) - solo `visitati` e' condiviso per evitare doppie
    visite allo stesso luogo."""
    log('=' * 78)
    log('INDAGINE (2 SOTTOGRUPPI, diagnostica) - Episodio 1: "Il Coro Sommerso"')
    log('=' * 78)
    meta = len(party) // 2
    gruppi = {'A': party[0::2], 'B': party[1::2]}  # alternati: copertura tipi piu' bilanciata dei due
    log(f'Sottogruppo A: {", ".join(gruppi["A"])}')
    log(f'Sottogruppo B: {", ".join(gruppi["B"])}')
    log(f'Orologio: {"condiviso (1 ora per visita, di qualunque sottogruppo)" if orologio_condiviso else "separato (6 ore a testa)"}')
    log('')

    visitati = set()
    parole, oggetti = set(), set()
    diapason = False
    approf_letti, approf_falliti = 0, 0
    chi_confermato = False
    charges = {g: {n: dict(INDAGINE_UNLOCK.get(n, {})) for n in gruppi[g]} for g in gruppi}
    ore = {'A': 6, 'B': 6} if not orologio_condiviso else {'condivisa': 6}

    def tipi_coperti(g):
        tc, jolly = set(), False
        for n in gruppi[g]:
            for tipo in INDAGINE_UNLOCK.get(n, {}):
                if tipo == 'jolly':
                    jolly = True
                else:
                    tc.add(tipo)
        if jolly:
            tc |= {'Osservazione', 'Testimonianza', 'Referto', 'Presagio'}
        return tc

    tc_gruppo = {g: tipi_coperti(g) for g in gruppi}

    def luogo_raggiungibile(l):
        if l['n'] in visitati:
            return False
        req = l.get('req')
        if req is None:
            return True
        kind, key = req
        return key in (parole if kind == 'parola' else oggetti)

    def punteggio(l, g):
        strutturale = 0 if l['n'] in (1, 2, 3) else 1
        copertura = -sum(1 for t in l['approf'] if t in tc_gruppo[g])
        return (strutturale, copertura, l['n'])

    def tenta_approfondimenti(l, g):
        nonlocal approf_letti, approf_falliti, chi_confermato
        for tipo in l['approf']:
            idoneo = next((n for n in gruppi[g] if
                           charges[g][n].get(tipo, 0) > 0 or charges[g][n].get('jolly', 0) > 0), None)
            if idoneo:
                usa_jolly = charges[g][idoneo].get(tipo, 0) <= 0
                charges[g][idoneo]['jolly' if usa_jolly else tipo] -= 1
                approf_letti += 1
                log(f'    [{g}] [APPROFONDIMENTO {tipo}] sbloccato da {idoneo}'
                    f'{" (jolly)" if usa_jolly else ""}.')
                if (l['n'], tipo) in CHI_ESPLICITO:
                    chi_confermato = True
            else:
                approf_falliti += 1
                log(f'    [{g}] [APPROFONDIMENTO {tipo}] nessun eroe idoneo — non letto.')

    def visita(g, l):
        nonlocal diapason, approf_falliti
        visitati.add(l['n'])
        log(f'  [{g}] Visita Luogo {l["n"]} — {l["nome"]}')
        lettore = max(gruppi[g], key=lambda n: HERO[n]['acume'])
        ok, _ = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if l.get('sblocca_parola'):
            parole.add(l['sblocca_parola'])
        if l.get('sblocca_oggetto'):
            oggetti.add(l['sblocca_oggetto'])
        if l.get('diapason'):
            diapason = True
        if ok:
            tenta_approfondimenti(l, g)
        else:
            approf_falliti += len(l['approf'])

    if orologio_condiviso:
        turno = 0
        while ore['condivisa'] > 0:
            g = 'A' if turno % 2 == 0 else 'B'
            candidati = sorted((l for l in LUOGHI_SIM if luogo_raggiungibile(l)), key=lambda l: punteggio(l, g))
            if not candidati:
                # prova l'altro sottogruppo prima di arrendersi: puo' vedere luoghi
                # diversi solo per copertura tipi, non per raggiungibilita' (quella
                # e' oggettiva), quindi in pratica qui i candidati coincidono - ma
                # teniamo la struttura simmetrica per chiarezza del log.
                break
            visita(g, candidati[0])
            ore['condivisa'] -= 1
            turno += 1
        ore_avanzate = ore['condivisa']
    else:
        for g in gruppi:
            while ore[g] > 0:
                candidati = sorted((l for l in LUOGHI_SIM if luogo_raggiungibile(l)), key=lambda l: punteggio(l, g))
                if not candidati:
                    break
                visita(g, candidati[0])
                ore[g] -= 1
        ore_avanzate = min(ore.values())  # il Vantaggio della Spedizione vale per tutto il party

    if ore_avanzate >= 3:
        tier = 'SLANCIO (3 azioni al 1° round di spedizione)'
    elif ore_avanzate >= 1:
        tier = 'PREPARATI (+1 Salute massima a testa)'
    else:
        tier = 'nessun vantaggio'
    log('')
    log(f'Fine Indagine (2 sottogruppi): {len(visitati)}/8 luoghi visitati (TUTTI, se 8), '
        f'{approf_letti} Approfondimenti letti, {approf_falliti} mancati.')
    log(f'Ore avanzate (min tra i sottogruppi se orologio separato): {ore_avanzate} -> {tier}')
    log('')
    return dict(ore_avanzate=ore_avanzate, tier=tier, diapason=diapason, visitati=list(visitati),
                chi_confermato=chi_confermato, luoghi_coperti=len(visitati))


def spawn_from_card(log, title, pool, enemies, round_n, fer_bonus=0, dan_bonus=0):
    nome, n, subito = CARD_SPAWN[title]
    dist_base = SPAWN_DISTANZA.get(title, 0)
    distanza = dist_base if dist_base is not None else CASELLE_TESSERA * max(1, round_n)
    piazzati = 0
    esauriti = 0
    for _ in range(n):
        if pool[nome] <= 0:
            log(f'    Segnalini {nome} esauriti: il piazzamento non ha luogo (resto della carta si applica comunque).')
            esauriti += 1
            continue
        pool[nome] -= 1
        piazzati += 1
        base = NEMICO[nome]
        fer_tot = base['fer'] + fer_bonus
        enemies.append(dict(nome=nome, fer=fer_tot, fer_max=fer_tot, dif=base['dif'],
                             att=base['att'], dan=base['dan'] + dan_bonus, mov=base['mov'], distanza=distanza))
    if piazzati:
        extra = f', a {distanza} caselle dal gruppo' if distanza > 0 else ', già adiacenti'
        log(f'    Piazzati {piazzati}x {nome} (pool residua: {pool[nome]}){extra}.')
    return (subito and piazzati), esauriti


def simula_spedizione(party, indagine, log, run_seed, formula_minaccia='standard',
                       nemico_scale='nessuna', pool_extra=False):
    log('=' * 78)
    log('SPEDIZIONE - Il Campanile di San Teodoro (sotterranei)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    log(f'Bonus da Indagine: {indagine["tier"]}; diapason: {"sì" if indagine["diapason"] else "no"}')
    log('NOTA: gruppo trattato come blocco unico tessera per tessera (vedi intestazione script).')
    fer_bonus, dan_bonus = NEMICO_SCALE_FORMULE[nemico_scale](len(party))
    if fer_bonus or dan_bonus:
        log(f'Scalatura nemici ({nemico_scale}): +{fer_bonus} Ferite, +{dan_bonus} Danno su ogni nemico incluso il Custode.')
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
    if pool_extra:
        extra = token_pool_extra(len(party))
        if extra:
            log(f'Pool nemici aumentato (+{extra} copie per tipo, diagnostica "non il doppio").')
            for k in pool:
                pool[k] += extra
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

    # Diagnostica per party grandi (8-10 eroi): non regole di gioco, solo
    # metriche per confrontare formule/party size nel riepilogo finale.
    rimescolamenti_mazzo = 0
    pool_esauriti_totale = 0
    azioni_per_round = []  # azioni nominali (2/eroe vivo, 3 al 1° round con SLANCIO)
    round_custode_svegliato = None
    canto_bonus_carte = False  # "da quel momento ogni Fase Minaccia pesca 1 carta in piu'"

    def log_azioni_round():
        n_azioni = len(vivi()) * (3 if (round_n == 1 and indagine['tier'].startswith('SLANCIO')) else 2)
        azioni_per_round.append(n_azioni)
        log(f'    (azioni nominali questo round: {n_azioni} — {len(vivi())} eroi vivi)')

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
        nonlocal deck, scarti, rimescolamenti_mazzo
        if not deck:
            rimescolamenti_mazzo += 1
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
        nonlocal canto, custode, custode_stunned, pool_esauriti_totale, canto_bonus_carte, round_custode_svegliato
        n_carte = MINACCIA_FORMULE[formula_minaccia](len(vivi())) + (1 if canto_bonus_carte else 0)
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
                subito_attiva, esauriti = spawn_from_card(log, titolo, pool, enemies, round_n,
                                                           fer_bonus, dan_bonus)
                pool_esauriti_totale += esauriti
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
                canto += 1
                log(f'    Segnalino Canto: {canto}.')
                if canto >= 3 and not canto_bonus_carte:
                    canto_bonus_carte = True
                    log('    Il Canto raggiunge 3: da ora ogni Fase Minaccia pesca 1 carta in più '
                        '(fino a fine spedizione, anche se il Custode è già stato abbattuto).')
                if custode is None:
                    if canto >= 3:
                        round_custode_svegliato = round_n
                        log('    Il Custode della Cera si desta in anticipo (3° segnalino Canto), '
                            'sulla tessera più lontana dagli eroi!')
                        c_fer = CUSTODE['fer'] + fer_bonus
                        custode = dict(CUSTODE, fer=c_fer, fer_max=c_fer, dan=CUSTODE['dan'] + dan_bonus,
                                       distanza=CASELLE_TESSERA)
                        for _ in range(2):
                            if pool['ADEPTO INCAPPUCCIATO'] <= 0:
                                pool_esauriti_totale += 1
                                log('    Segnalini ADEPTO INCAPPUCCIATO esauriti: il Custode si desta senza scorta.')
                                continue
                            pool['ADEPTO INCAPPUCCIATO'] -= 1
                            base = NEMICO['ADEPTO INCAPPUCCIATO']
                            a_fer = base['fer'] + fer_bonus
                            enemies.append(dict(nome='ADEPTO INCAPPUCCIATO', fer=a_fer, fer_max=a_fer,
                                                 dif=base['dif'], att=base['att'], dan=base['dan'] + dan_bonus,
                                                 mov=base['mov'], distanza=CASELLE_TESSERA))
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
                # Svegliato in anticipo dal Canto (vedi fase_minaccia): parte "sulla
                # tessera piu' lontana dagli eroi" (regola vera), quindi deve
                # colmare distanza come un nemico qualunque prima di attaccare.
                # Svegliato a T6 invece e' gia' nella stessa stanza (distanza=0,
                # comportamento invariato).
                c_distanza = custode.get('distanza', 0)
                if c_distanza > 0:
                    custode['distanza'] = max(0, c_distanza + guadagno - custode['mov'])
                    if custode['distanza'] > 0:
                        log(f'  {custode["nome"]} si avvicina (Movimento {custode["mov"]}): ancora '
                            f'{custode["distanza"]} caselle prima di raggiungere il gruppo.')
                        return
                    log(f'  {custode["nome"]} raggiunge il gruppo.')
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
                        else:
                            # La miniatura torna disponibile (si toglie dal tavolo, non
                            # si consuma): senza questo il pool sembrava esaurirsi molto
                            # piu' spesso di quanto accada davvero al tavolo fisico -
                            # bug trovato confrontando i numeri round 1 vs round 2.
                            pool[bersaglio_e['nome']] += 1
                        if bersaglio_e is not custode and ability_uses[n].get('cleave_per_turno'):
                            altri = [e for e in enemies
                                     if e is not bersaglio_e and e['fer'] > 0 and e.get('distanza', 0) <= 0]
                            if altri:
                                extra = altri[0]
                                log(f'    [ABILITÀ] {n} usa Colpo da macello: attacco extra su {extra["nome"]}.')
                                if attack_roll(log, n, h['vigore'], armed[n], extra['nome'], extra['dif']):
                                    extra['fer'] -= 1
                                    log(f'    {extra["nome"]}: {max(extra["fer"], 0)}/{extra["fer_max"]} ferite residue.')
                                    if extra['fer'] <= 0:
                                        log(f'    {extra["nome"]} è ABBATTUTO.')
                                        pool[extra['nome']] += 1
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
        log_azioni_round()
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
            c_fer = CUSTODE['fer'] + fer_bonus
            custode = dict(CUSTODE, fer=c_fer, fer_max=c_fer, dan=CUSTODE['dan'] + dan_bonus)
            pool['ADEPTO INCAPPUCCIATO'] -= 2
            for _ in range(2):
                base = NEMICO['ADEPTO INCAPPUCCIATO']
                a_fer = base['fer'] + fer_bonus
                enemies.append(dict(nome='ADEPTO INCAPPUCCIATO', fer=a_fer, fer_max=a_fer,
                                     dif=base['dif'], att=base['att'], dan=base['dan'] + dan_bonus,
                                     mov=base['mov'], distanza=0))  # rivelati nella stessa stanza del gruppo
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
            log_azioni_round()
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
            log_azioni_round()
            fase_eroi('rientro')
            fase_minaccia()
            fase_nemici('rientro', True)
            if not vivi():
                esito = 'SCONFITTA (party wipe durante il rientro)'
                break
        if esito is None:
            esito = 'VITTORIA'

    azioni_media = sum(azioni_per_round) / len(azioni_per_round) if azioni_per_round else 0
    azioni_max = max(azioni_per_round) if azioni_per_round else 0
    log('')
    log('=' * 78)
    log(f'ESITO SPEDIZIONE: {esito}')
    log(f'Round totali: {round_n}')
    log(f'Formula Minaccia: {formula_minaccia} | Azioni nominali/round: media {azioni_media:.1f}, '
        f'picco {azioni_max}')
    log(f'Mazzo Minaccia rimescolato: {rimescolamenti_mazzo} volta/e')
    log(f'Segnalini nemici esauriti nel pool (piazzamenti saltati): {pool_esauriti_totale}')
    log(f'Custode della Cera svegliato: {"in anticipo al round " + str(round_custode_svegliato) if round_custode_svegliato else "solo a T6 (mai in anticipo via Canto)"}')
    for n in party:
        stato = 'a terra' if n in down else f'{max(salute[n], 0)}/{salute_max[n]} Salute'
        log(f'  {n}: {stato}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, salute_finale=dict(salute), down=list(down),
                formula_minaccia=formula_minaccia, nemico_scale=nemico_scale, pool_extra=pool_extra,
                azioni_media=azioni_media, azioni_max=azioni_max,
                rimescolamenti_mazzo=rimescolamenti_mazzo, pool_esauriti_totale=pool_esauriti_totale,
                round_custode_svegliato=round_custode_svegliato)


def esegui_run(nome_run, party, seed, formula_minaccia='standard', indagine_2gruppi=None,
               nemico_scale='nessuna', pool_extra=False, ind_log=None, sped_log=None):
    """`indagine_2gruppi`: None = Indagine normale (1 gruppo, regola vera).
    True/False = diagnostica 2 sottogruppi, valore = orologio_condiviso.
    `ind_log`/`sped_log`: passa un Logger/NullLogger gia' pronto (usato da
    `esegui_batch` per i seed 2-5, che non scrivono su disco); se omessi
    ne crea di normali su `logs/playtest/<sessione>/<nome_run>/`."""
    random.seed(seed)
    chiudi_log = ind_log is None
    if chiudi_log:
        run_dir = os.path.join(LOG_DIR, nome_run)
        os.makedirs(run_dir, exist_ok=True)
        ind_log = Logger(os.path.join(run_dir, 'indagine.log'))
        sped_log = Logger(os.path.join(run_dir, 'spedizione.log'))
    ind_log(f'Run: {nome_run}  |  seed={seed}  |  generato: {datetime.now().isoformat(timespec="seconds")}')
    sped_log(f'Run: {nome_run}  |  seed={seed}  |  formula Minaccia={formula_minaccia}  |  '
             f'generato: {datetime.now().isoformat(timespec="seconds")}')
    if indagine_2gruppi is None:
        indagine = simula_indagine(party, ind_log)
    else:
        indagine = simula_indagine_2gruppi(party, ind_log, orologio_condiviso=indagine_2gruppi)
    if chiudi_log:
        ind_log.close()
    spedizione = simula_spedizione(party, indagine, sped_log, seed, formula_minaccia,
                                    nemico_scale=nemico_scale, pool_extra=pool_extra)
    if chiudi_log:
        sped_log.close()
    return dict(nome=nome_run, party=party, indagine=indagine, spedizione=spedizione)


def esegui_batch(nome_base, party, seeds, formula_minaccia='standard', nemico_scale='nessuna',
                  pool_extra=False):
    """Round 2 (conferma numeri): stesso party/formula/scalatura ripetuto su
    piu' seed, aggregato invece di un singolo punto dati. Solo il primo
    seed scrive i log dettagliati su disco (`<nome_base>/`), gli altri
    usano NullLogger - le statistiche aggregate coprono comunque tutti i
    seed passati."""
    risultati = []
    for i, seed in enumerate(seeds):
        if i == 0:
            run_dir = os.path.join(LOG_DIR, nome_base)
            os.makedirs(run_dir, exist_ok=True)
            ind_log = Logger(os.path.join(run_dir, 'indagine.log'))
            sped_log = Logger(os.path.join(run_dir, 'spedizione.log'))
        else:
            ind_log = NullLogger()
            sped_log = NullLogger()
        r = esegui_run(f'{nome_base}_seed{i}', party, seed, formula_minaccia, None,
                        nemico_scale, pool_extra, ind_log, sped_log)
        risultati.append(r)

    n = len(risultati)
    sp_list = [r['spedizione'] for r in risultati]
    pct_custode_anticipo = sum(1 for sp in sp_list if sp['round_custode_svegliato']) / n * 100
    media_pool_esauriti = sum(sp['pool_esauriti_totale'] for sp in sp_list) / n
    max_pool_esauriti = max(sp['pool_esauriti_totale'] for sp in sp_list)
    media_round = sum(sp['round_n'] for sp in sp_list) / n
    media_eroi_terra = sum(len(sp['down']) for sp in sp_list) / n
    pct_vittoria = sum(1 for sp in sp_list if sp['esito'] == 'VITTORIA') / n * 100
    return dict(nome=nome_base, party=party, n_seed=n, formula_minaccia=formula_minaccia,
                nemico_scale=nemico_scale, pool_extra=pool_extra,
                pct_custode_anticipo=pct_custode_anticipo, media_pool_esauriti=media_pool_esauriti,
                max_pool_esauriti=max_pool_esauriti, media_round=media_round,
                media_eroi_terra=media_eroi_terra, pct_vittoria=pct_vittoria)


# Roster completo (11) e sottoinsiemi per i playtest diagnostici a 8/10
# eroi (vedi piano "portare il gioco a 10 giocatori" - riusa l'11 esistente,
# nessun eroe nuovo). PARTY_10 tiene CARLA DOSTI di riserva (1 eroe su 11,
# come da regola "massimo 5 in tavola" estesa a "quasi tutti e 11" per un
# tavolo da 10). PARTY_8 toglie anche Nino (nessun Approfondimento in
# Indagine) e Padre Marani (idem) per un secondo punto dati a copertura
# piu' bassa.
ROSTER_11 = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO',
             'OTTONE “MEZZENA” MASSARI', 'CARLA DOSTI', 'DOTT. LAZZARO SERRA', 'PADRE CELSO MARANI',
             'FULGENZIO CARBONE', 'OTTAVIO BRERA', 'MORA “SPILLA” FANTI']
PARTY_10 = [n for n in ROSTER_11 if n != 'CARLA DOSTI']
PARTY_8 = [n for n in PARTY_10 if n not in ('NINO “GRIMALDELLO” CAUTO', 'PADRE CELSO MARANI')]
# Curva 2-4-6-8-10 (richiesta esplicita: testare la scalatura nemici su
# tutta la gamma, non solo 8/10, cosi' si vede anche dove NON scatta
# ancora bonus - le formule in NEMICO_SCALE_FORMULE valgono 0 fino a
# n=5 per costruzione, quindi 2/4 sono il controllo "nessun cambiamento
# atteso"). Composizioni bilanciate (tank/healer/utility), non le piu'
# ottimali possibili - lo scopo e' la curva di difficolta', non trovare
# la combo perfetta.
PARTY_2 = ['DOTT. ATTILIO MARN', 'OTTONE “MEZZENA” MASSARI']
PARTY_4 = ['OTTONE “MEZZENA” MASSARI', 'ELENA FOSCO', 'OTTAVIO BRERA', 'FULGENZIO CARBONE']
PARTY_6 = ['OTTONE “MEZZENA” MASSARI', 'ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE',
           'OTTAVIO BRERA', 'FULGENZIO CARBONE']
PARTY_PER_SIZE = {2: PARTY_2, 4: PARTY_4, 6: PARTY_6, 8: PARTY_8, 10: PARTY_10}


def party_random(size, escludi, tentativi=200):
    """Pesca una combinazione casuale di `size` eroi da ROSTER_11, scartando
    quelle gia' in `escludi` (set di frozenset, mutato in place). Serve a
    non fidarsi di UNA composizione a mano per taglia (round 4: PARTY_6
    poteva essere semplicemente una scelta sfortunata, non una vera
    proprieta' di "6 eroi" - vedi piano round 5)."""
    for _ in range(tentativi):
        combo = frozenset(random.sample(ROSTER_11, size))
        if combo not in escludi:
            escludi.add(combo)
            return sorted(combo)  # ordine stabile solo per leggibilita' nei log, non ha effetto di gioco
    raise ValueError(f'Non trovo una nuova combinazione da {size} eroi dopo {tentativi} tentativi '
                      f'({len(escludi)} gia\' escluse).')


def esegui_batch_multi_party(nome_base, size, formula, scale, n_party=5, n_seed=30,
                              pool_extra=False, seed_base=90000):
    """Round 5: invece di UNA composizione fissa per taglia, ne pesca
    `n_party` diverse (nessuna ripetuta) e fa girare `esegui_batch` su
    ciascuna - isola l'effetto "taglia del party" da quello "questa
    specifica combinazione di eroi". Le composizioni si pescano PRIMA di
    entrare nei seed di gioco (che reimpostano `random.seed` per la
    riproducibilita' dei tiri), cosi' la scelta del party non dipende dal
    seed della singola simulazione."""
    random.seed(seed_base)  # solo per la scelta delle composizioni, non per i dadi
    escludi = set()
    per_party = []
    for p in range(n_party):
        party = party_random(size, escludi)
        b = esegui_batch(f'{nome_base}_p{p}', party, [seed_base + 1000 + p * 100 + i for i in range(n_seed)],
                          formula, scale, pool_extra)
        per_party.append(b)

    def media(chiave):
        return sum(b[chiave] for b in per_party) / n_party

    return dict(nome=nome_base, size=size, formula_minaccia=formula, nemico_scale=scale,
                n_party=n_party, n_seed=n_seed,
                pct_custode_anticipo=media('pct_custode_anticipo'),
                media_pool_esauriti=media('media_pool_esauriti'),
                max_pool_esauriti=max(b['max_pool_esauriti'] for b in per_party),
                media_round=media('media_round'), media_eroi_terra=media('media_eroi_terra'),
                pct_vittoria=media('pct_vittoria'), per_party=per_party)


def main():
    os.makedirs(LOG_DIR, exist_ok=True)
    # Party di default (composizioni "medie"). Per una sessione di stress-test
    # mirata (vedi /playtest), sostituisci questa lista con composizioni scelte
    # apposta per far fallire qualcosa: nessun healer, nessun combattente,
    # party al minimo/massimo, un'abilita' messa apposta dopo chi le ruba il
    # bersaglio nell'ordine del gruppo, ecc. Il nome del run finisce nel path
    # del log: usane uno che dica QUALE dinamica stai stressando.
    # Quarto elemento (formula Minaccia) opzionale, default 'standard' se
    # omesso - vedi MINACCIA_FORMULE.
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
        # --- Diagnostica 8-10 giocatori (piano "portare il gioco a 10", round 1) ---
        ('run-09_dieci_formula-standard', PARTY_10, 9101, 'standard'),
        ('run-10_dieci_formula-tetto4', PARTY_10, 9102, 'tetto4'),
        ('run-11_dieci_formula-tetto3', PARTY_10, 9103, 'tetto3'),
        ('run-12_otto_formula-standard', PARTY_8, 9201, 'standard'),
        ('run-13_otto_formula-tetto4', PARTY_8, 9202, 'tetto4'),
        # Nota: la modalita' "2 sottogruppi" per l'Indagine (vedi
        # simula_indagine_2gruppi) resta disponibile ma NON e' piu' nelle run
        # raccomandate - l'utente ha scartato la direzione (rompe la scarsita'
        # "non potete vedere tutto"), vedi piano round 2.
    ]
    riepilogo = []
    for run in runs:
        nome, party, seed = run[0], run[1], run[2]
        formula = run[3] if len(run) > 3 else 'standard'
        indagine_2gruppi = run[4] if len(run) > 4 else None
        print(f'Eseguo {nome} ({len(party)} eroi, formula {formula}'
              f'{f", 2 sottogruppi (orologio {"condiviso" if indagine_2gruppi else "separato"})" if indagine_2gruppi is not None else ""})...')
        r = esegui_run(nome, party, seed, formula, indagine_2gruppi)
        riepilogo.append(r)

    idx_path = os.path.join(LOG_DIR, 'riepilogo.md')
    with open(idx_path, 'w', encoding='utf-8') as f:
        f.write('# Riepilogo playtest simulati\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('| Run | Eroi | Formula | Luoghi coperti | Ore avanzate | Diapason | Chi confermato | '
                'Azioni/round (media/picco) | Rimescolamenti | Pool esauriti | Custode svegliato | Esito | '
                'Round | Eroi a terra |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n')
        for r in riepilogo:
            ind = r['indagine']
            sp = r['spedizione']
            custode_txt = f'round {sp["round_custode_svegliato"]}' if sp['round_custode_svegliato'] else 'solo a T6'
            f.write(f'| {r["nome"]} | {len(r["party"])} | {sp["formula_minaccia"]} | '
                    f'{len(ind["visitati"])}/8 | {ind["ore_avanzate"]} '
                    f'({ind["tier"].split(" (")[0]}) | {"sì" if ind["diapason"] else "no"} | '
                    f'{"sì" if ind["chi_confermato"] else "no"} | '
                    f'{sp["azioni_media"]:.1f} / {sp["azioni_max"]} | {sp["rimescolamenti_mazzo"]} | '
                    f'{sp["pool_esauriti_totale"]} | {custode_txt} | '
                    f'{sp["esito"]} | {sp["round_n"]} | {", ".join(sp["down"]) or "nessuno"} |\n')
        f.write('\nEroi per run (nomi completi, il conteggio in tabella e\' solo il numero): ' +
                '; '.join(f'{r["nome"]}=[{", ".join(r["party"])}]' for r in riepilogo) + '\n')
        f.write('\nLog completi (tiri di dado, prove, decisioni) in `<run>/indagine.log` e '
                '`<run>/spedizione.log`.\n')

    # --- Round 4: 30 seed (non 10), curva 2-4-6-8-10 x 3 curve Ferite-only x
    # 3 formule Minaccia (misura molto piu' rumore-resistente di round 3:
    # esecuzione verificata ~ms per batch, il collo di bottiglia non e' il
    # tempo di calcolo). Bersaglio: ~80% vittoria, 0-10% risveglio anticipato
    # su tutta la gamma, non solo a 10 eroi (vedi piano).
    N_SEED = 30
    SEEDS_N = lambda base: [base + i for i in range(N_SEED)]  # noqa: E731
    batch_configs = [
        # (nome, party, formula, nemico_scale, pool_extra, seed_base)
    ]
    for size in (2, 4, 6, 8, 10):
        for formula in ('tetto4', 'tetto3', 'tetto2_oltre8'):
            for scale in ('nessuna', 'curva-A', 'curva-B', 'curva-C'):
                batch_configs.append((f'batch-{size:02d}_{formula}_{scale}', PARTY_PER_SIZE[size],
                                       formula, scale, False, 25000 + size * 1000))

    batch_risultati = []
    for i, (nome, party, formula, scale, pe, seed_base) in enumerate(batch_configs):
        print(f'Eseguo {nome} ({N_SEED} seed, {len(party)} eroi, formula {formula}, scala {scale})...')
        batch_risultati.append(esegui_batch(nome, party, SEEDS_N(seed_base + i * 40), formula, scale, pe))

    batch_path = os.path.join(LOG_DIR, 'riepilogo_batch.md')
    with open(batch_path, 'w', encoding='utf-8') as f:
        f.write(f'# Riepilogo batch multi-seed ({N_SEED} seed a combinazione) — round 4\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('| Batch | Eroi | Formula | Scala nemici | Pool extra | % Custode anticipo | '
                'Pool esauriti (media/picco) | Round medi | Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|---|---|---|---|\n')
        for b in batch_risultati:
            f.write(f'| {b["nome"]} | {len(b["party"])} | {b["formula_minaccia"]} | {b["nemico_scale"]} | '
                    f'{"sì" if b["pool_extra"] else "no"} | {b["pct_custode_anticipo"]:.0f}% | '
                    f'{b["media_pool_esauriti"]:.1f} / {b["max_pool_esauriti"]} | {b["media_round"]:.1f} | '
                    f'{b["media_eroi_terra"]:.1f} | {b["pct_vittoria"]:.0f}% |\n')
        f.write(f'\nOgni riga = {N_SEED} simulazioni con lo stesso party/formula/scalatura, seed diversi, '
                f'aggregate (media, percentuale, picco). Solo il primo seed di ogni batch scrive log '
                f'dettagliati su disco (`<batch>_seed0/`), gli altri {N_SEED - 1} solo contribuiscono ai '
                f'numeri qui.\n')
        f.write('Le formule di scalatura (`NEMICO_SCALE_FORMULE`) danno bonus 0 fino a 5 eroi per '
                'costruzione: le righe a 2/4 eroi sono il controllo "nessun cambiamento atteso" (nessuna/'
                'lieve/marcata devono coincidere), 6 e\' il limite della soglia (ancora 0 in entrambe le '
                'formule attuali), 8/10 sono dove le formule iniziano davvero a differire.\n')
    print(f'\nBatch fatti. Riepilogo aggregato in {batch_path}')

    # --- Round 5: verifica il vincitore (tetto3 + curva-C) su composizioni
    # random, non solo le PARTY_N scelte a mano - isola se l'anomalia a 6
    # eroi vista nel round 4 e' una proprieta' della taglia o di quella
    # specifica composizione. 5 party per taglia, nessuno ripetuto, 30 seed
    # a party (150 simulazioni per taglia). 'nessuna' scalatura come
    # controllo di riferimento, accanto al candidato vincitore.
    print('\n--- Round 5: verifica su composizioni casuali (5 party x taglia, 30 seed ciascuno) ---')
    mp_risultati = []
    for size in (2, 4, 6, 8, 10):
        for scale in ('nessuna', 'curva-C'):
            nome = f'mp-{size:02d}_tetto3_{scale}'
            print(f'Eseguo {nome} (5 party casuali x 30 seed, {size} eroi, tetto3, scala {scale})...')
            mp_risultati.append(esegui_batch_multi_party(nome, size, 'tetto3', scale,
                                                          n_party=5, n_seed=30,
                                                          seed_base=40000 + size * 1000 +
                                                          (500 if scale == 'curva-C' else 0)))

    mp_path = os.path.join(LOG_DIR, 'riepilogo_multiparty.md')
    with open(mp_path, 'w', encoding='utf-8') as f:
        f.write('# Riepilogo composizioni casuali (round 5) — tetto3, 5 party x taglia, 30 seed ciascuno\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('## Aggregato (media delle 5 composizioni per taglia)\n\n')
        f.write('| Taglia | Scala | % Custode anticipo | Pool esauriti (media/picco) | Round medi | '
                'Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|---|\n')
        for m in mp_risultati:
            f.write(f'| {m["size"]} | {m["nemico_scale"]} | {m["pct_custode_anticipo"]:.0f}% | '
                    f'{m["media_pool_esauriti"]:.1f} / {m["max_pool_esauriti"]} | {m["media_round"]:.1f} | '
                    f'{m["media_eroi_terra"]:.1f} | {m["pct_vittoria"]:.0f}% |\n')
        f.write('\n## Dettaglio per composizione (per capire quanto varia DENTRO una stessa taglia)\n\n')
        f.write('| Taglia | Scala | Party | % Custode anticipo | Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|\n')
        for m in mp_risultati:
            for b in m['per_party']:
                f.write(f'| {m["size"]} | {m["nemico_scale"]} | {", ".join(b["party"])} | '
                        f'{b["pct_custode_anticipo"]:.0f}% | {b["media_eroi_terra"]:.1f} | '
                        f'{b["pct_vittoria"]:.0f}% |\n')
    print(f'\nRound 5 fatto. Riepilogo in {mp_path}')

    # --- Round 6: 'tetto3_ritardato' (il tetto di 3 carte si raggiunge a
    # n=8 invece che a n=6) contro il crollo isolato dal round 5 a n=6 con
    # curva-C. Stessa procedura multi-party del round 5, cosi' i due
    # riepiloghi si confrontano riga per riga.
    print("\n--- Round 6: verifica 'tetto3_ritardato' (tetto a 3 carte spostato a n=8) ---")
    mp6_risultati = []
    for size in (2, 4, 6, 8, 10):
        for scale in ('nessuna', 'curva-C'):
            nome = f'mp-{size:02d}_tetto3rit_{scale}'
            print(f'Eseguo {nome} (5 party casuali x 30 seed, {size} eroi, tetto3_ritardato, scala {scale})...')
            mp6_risultati.append(esegui_batch_multi_party(nome, size, 'tetto3_ritardato', scale,
                                                           n_party=5, n_seed=30,
                                                           seed_base=60000 + size * 1000 +
                                                           (500 if scale == 'curva-C' else 0)))

    mp6_path = os.path.join(LOG_DIR, 'riepilogo_multiparty_tetto3ritardato.md')
    with open(mp6_path, 'w', encoding='utf-8') as f:
        f.write('# Riepilogo composizioni casuali (round 6) — tetto3_ritardato, 5 party x taglia, 30 seed ciascuno\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('Confronto diretto con round 5 (`riepilogo_multiparty.md`, formula tetto3): stessa scala nemici, '
                'stesse taglie, stesso numero di party/seed, unica differenza e\' la formula Minaccia.\n\n')
        f.write('| Taglia | Scala | % Custode anticipo | Pool esauriti (media/picco) | Round medi | '
                'Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|---|\n')
        for m in mp6_risultati:
            f.write(f'| {m["size"]} | {m["nemico_scale"]} | {m["pct_custode_anticipo"]:.0f}% | '
                    f'{m["media_pool_esauriti"]:.1f} / {m["max_pool_esauriti"]} | {m["media_round"]:.1f} | '
                    f'{m["media_eroi_terra"]:.1f} | {m["pct_vittoria"]:.0f}% |\n')
        f.write('\n## Dettaglio per composizione\n\n')
        f.write('| Taglia | Scala | Party | % Custode anticipo | Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|\n')
        for m in mp6_risultati:
            for b in m['per_party']:
                f.write(f'| {m["size"]} | {m["nemico_scale"]} | {", ".join(b["party"])} | '
                        f'{b["pct_custode_anticipo"]:.0f}% | {b["media_eroi_terra"]:.1f} | '
                        f'{b["pct_vittoria"]:.0f}% |\n')
    print(f'\nRound 6 fatto. Riepilogo in {mp6_path}')

    # --- Round 7: combinazione finale tetto3_ritardato + curva-C_tardiva
    # su tutta la curva 2-10, per confermare in un'unica tabella che il
    # gate a n=6 sistema sia il buco a n=6 (round 5) sia il crollo
    # prematuro a n=4 (curva-C partiva un passo troppo presto).
    print("\n--- Round 7: combinazione finale tetto3_ritardato + curva-C_tardiva (tutta la curva 2-10) ---")
    mp7_risultati = []
    for size in (2, 4, 6, 8, 10):
        nome = f'mp-{size:02d}_finale'
        print(f'Eseguo {nome} (5 party casuali x 30 seed, {size} eroi, tetto3_ritardato, curva-C_tardiva)...')
        mp7_risultati.append(esegui_batch_multi_party(nome, size, 'tetto3_ritardato', 'curva-C_tardiva',
                                                       n_party=5, n_seed=30, seed_base=70000 + size * 1000))

    mp7_path = os.path.join(LOG_DIR, 'riepilogo_multiparty_finale.md')
    with open(mp7_path, 'w', encoding='utf-8') as f:
        f.write('# Riepilogo composizioni casuali (round 7) — candidato finale: tetto3_ritardato + '
                'curva-C_tardiva\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write('| Taglia | % Custode anticipo | Pool esauriti (media/picco) | Round medi | '
                'Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|---|\n')
        for m in mp7_risultati:
            f.write(f'| {m["size"]} | {m["pct_custode_anticipo"]:.0f}% | '
                    f'{m["media_pool_esauriti"]:.1f} / {m["max_pool_esauriti"]} | {m["media_round"]:.1f} | '
                    f'{m["media_eroi_terra"]:.1f} | {m["pct_vittoria"]:.0f}% |\n')
        f.write('\n## Dettaglio per composizione\n\n')
        f.write('| Taglia | Party | % Custode anticipo | Eroi a terra medi | % Vittoria |\n')
        f.write('|---|---|---|---|---|\n')
        for m in mp7_risultati:
            for b in m['per_party']:
                f.write(f'| {m["size"]} | {", ".join(b["party"])} | {b["pct_custode_anticipo"]:.0f}% | '
                        f'{b["media_eroi_terra"]:.1f} | {b["pct_vittoria"]:.0f}% |\n')
    print(f'\nRound 7 fatto. Riepilogo in {mp7_path}')

    print(f'\nFatto. Log in {LOG_DIR}')


if __name__ == '__main__':
    main()
