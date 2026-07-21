# -*- coding: utf-8 -*-
"""Simulatore di playtest - EPISODIO 7 «Il quartiere sordo».

COPIA di simulate_ep4.py cucita sull'Episodio 7 (vedi DESIGN-EPISODIO-7.md):
il palazzone di Sant'Orsola, percorso a SCELTA dopo T2 (ponteggi T3P-T4P,
esposti: prova NERVI a ogni ingresso; o intercapedini T3I-T4I-T5I, SORDE:
la prima carta spawn di ogni tessera sorda piazza 1 nemico in meno — il
supporto adiacente e' gia' la regola base del motore), boss IL
CAPOCANTIERE a T6 con 2 Sgherri (+1 ogni 4 eroi oltre il 4°), nessuna
debolezza-oggetto: «Smascherato» (D2 esatta) = salta la prima attivazione
e 1 Sgherro se ne va. Vittoria: Fava fuori da T1 per la via dell'andata.
Nomi interni riusati dal motore (minimizzare il diff): `libretto` = LA
BOLLA DELLA CALCE (D4), `pianta` = LANTERNA SCHERMATA + TAPPI (bonus
NERVI), `tobia_libero` = Fava liberato, `campanello*` = non usato.
Config di produzione condivisa riusata. Seed base 670000.
"""

import os
import random
import re
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
from gen_cards import HEROES, NEMICI as NEMICI_COMUNI  # noqa: E402
from gen_ep7 import TILES_7 as TILES, NEMICI_7, LUOGHI_7  # noqa: E402

NEMICI = NEMICI_COMUNI + NEMICI_7
HERO = {h['nome']: h for h in HEROES}
LUOGHI_BY_N = {l['n']: l for l in LUOGHI_7}

# Mazzo Minaccia dell'episodio (21 carte - «Gli occhi del culto» del
# Bivio NON e' simulata). Tuple (titolo, testo, tipo, subito); testi 1:1
# da cards-data.js (EP7_MINACCE).
MINACCE = (
    [('LA SQUADRA DEL SILENZIO', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('I GESTI DEL CAPOMASTRO', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('IL PIOMBO E LA SACCA', 'Piazzate 1 Sgherro: si attiva subito.', 'malavita', True),
     ('I MANOVALI DI NOTTE', 'Piazzate 1 Sgherro sull’ingresso del Cancello (T1).', 'malavita', False),
     ('IL TURNO FUORI BUSTA', 'Piazzate 1 Sgherro sull’ingresso del Cancello (T1).', 'malavita', False),
     ('LE PALE NEL BUIO', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('LA MALTA FRESCA', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('IL GUARDIANO DI NOTTE', 'Piazzate 1 Sicario sull’uscita più vicina agli eroi.', 'malavita', False),
     ('LA RONDA DEL CANCELLO', 'Piazzate 1 Sicario: si attiva subito.', 'malavita', True),
     ('GLI UOMINI DELL’INGEGNERE', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('LA PAGA DEL SILENZIO', 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.', 'malavita', False),
     ('IL SILENZIO CHE PREME', 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.', 'insidia', False),
     ('LA TAVOLA CHE CEDE', 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.', 'insidia', False),
     ('LA CALCE NEGLI OCCHI', 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione.', 'insidia', False),
     ('UN FISCHIO DI SOTTO', 'Aggiungete 1 segnalino Canto (l’Allarme).', 'crescendo', False),
     ('LE LANTERNE SI MUOVONO', 'Aggiungete 1 segnalino Canto (l’Allarme).', 'crescendo', False),
     ('IL CANTIERE È SVEGLIO', 'Aggiungete 1 segnalino Canto (l’Allarme).', 'crescendo', False),
     ('IL TURNO CAMBIA', 'Nessun effetto (tensione).', 'quiete', False),
     ('UN’IMPALCATURA AMICA', 'Rivelate una tessera coperta adiacente.', 'favore', False),
     ('I SACCHI FRANATI', 'Muoversi costa il doppio sulla tessera dell’eroe attivo fino a fine round.', 'ostacolo', False),
     ('IL PIOMBO DAL BUIO', 'L’eroe più avanzato subisce 1 danno (nessuna prova).', 'insidia', False)])
# Rivelatorio Domanda 2 (Voltan), 3 carte in aperti: L2-Osservazione,
# L3-Testimonianza, L4-Testimonianza.
CHI_ESPLICITO = {(2, 'Osservazione'), (3, 'Testimonianza'), (4, 'Testimonianza')}


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)
NEMICO = {n['nome']: n for n in NEMICI}
DIFF = {'Facile': 7, 'Media': 9, 'Difficile': 11}
# Ogni invocazione scrive in una sottocartella datata, cosi' le sessioni di
# stress-test successive (es. dal comando /playtest) non si sovrascrivono:
# python scripts/simulate_playtest.py [etichetta-sessione]
SESSION = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime('%Y%m%d-%H%M%S')
LOG_DIR = os.path.join(ROOT, 'logs', 'playtest', SESSION)

TOKEN_POOL_BASE = {'LO SGHERRO': 5, 'IL SICARIO': 2}

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

# --- Griglia tattica (posizioni reali cella per cella) -----------------
# Ogni tessera e' una griglia 4x4 (vedi TILES in gen_cards.py e
# scripts/tiles/generate-tiles.js). Convenzione: gx 0-3 sinistra->destra,
# gy 0-3 dal basso verso l'alto ("gy=0 in basso", stessa convenzione gia'
# usata per gli arredi in TILES). Notazione scacchistica nei log: colonna
# A-D (=gx), riga 1-4 (=gy+1, riga 1 = lato Sud, dove sta l'ingresso T1) -
# la vista di un giocatore seduto a Sud del tavolo.
TILE = {t['id']: t for t in TILES}
COLONNE = 'ABCD'


def chess(cella):
    gx, gy = cella
    return f'{COLONNE[gx]}{gy + 1}'


def _porta_screen(direzione, occupate_screen):
    """Replica pickDoorIndex di scripts/tiles/generate-tiles.js: stessa
    preferenza [1,2,0,3], stessa convenzione "riga schermo" (0=Nord/in
    alto, 3=Sud/in basso) - lavorare in questo spazio (invece di
    ri-derivare l'ordine di preferenza in gy) evita di sbagliare la
    conversione e garantisce che la cella scelta combaci esattamente con
    quella disegnata sulla tessera stampata."""
    for idx in (1, 2, 0, 3):
        cella = (idx, 0) if direzione == 'N' else (idx, 3) if direzione == 'S' \
            else (3, idx) if direzione == 'E' else (0, idx)
        if cella not in occupate_screen:
            return cella
    return (1, 0) if direzione == 'N' else (1, 3) if direzione == 'S' \
        else (3, 1) if direzione == 'E' else (0, 1)


def _porte_tessera(tile_id):
    """dict direzione -> cella (gx, gy) di ogni uscita della tessera."""
    occupate_screen = {(gx, 3 - gy) for gx, gy, *_ in TILE[tile_id]['arredi']}
    porte = {}
    for direzione in TILE[tile_id]['exits']:
        col, riga_schermo = _porta_screen(direzione, occupate_screen)
        porte[direzione] = (col, 3 - riga_schermo)
    return porte


PORTE = {tile_id: _porte_tessera(tile_id) for tile_id in TILE}


def porta_ingresso(tile_id, tile_precedente):
    """Cella (gx, gy) da cui il gruppo entra in `tile_id`, provenendo da
    `tile_precedente` - la porta di `tile_id` il cui testo la collega a
    quella tessera (gli exits sono sempre reciproci in TILES)."""
    for direzione, dest in TILE[tile_id]['exits'].items():
        if dest.split()[0] == tile_precedente:
            return PORTE[tile_id][direzione]
    return (1, 0)  # non dovrebbe succedere con un `path` valido; centro-basso come fallback


MOV_EROE = 3   # Regolamento: «Muovere — fino a 3 caselle» (niente diagonali)


def round_di_marcia(da_tile, a_tile, partenza):
    """Round per attraversare `da_tile` e varcare la porta verso `a_tile`, col
    movimento VERO del Regolamento (Mov 3, niente diagonali).

    Prima del 20260721 lo spostamento fra tessere era gratis (una tessera per
    round). Ma una tessera e' 4x4 con le porte su lati opposti: sono 4-6
    caselle, cioe' DUE round. Regalarli dimezzava le Fasi Minaccia - e quindi
    carte, nemici e Canto - rendendo la %vittoria misurata ottimistica.
    """
    if not da_tile or da_tile == a_tile or partenza is None:
        return 1
    uscita = None
    for direzione, dest in TILE[da_tile]['exits'].items():
        if dest.split()[0] == a_tile:
            uscita = PORTE[da_tile][direzione]
            break
    if uscita is None:
        return 1
    passi = len(cammino(da_tile, partenza, uscita, set()))
    if not passi:
        passi = abs(uscita[0] - partenza[0]) + abs(uscita[1] - partenza[1])
    passi += 1                       # il passo che varca la porta
    return max(1, -(-passi // MOV_EROE))


def percorso_verso(da_tile, a_tile):
    """Sequenza di tessere dal punto attuale a `a_tile` (BFS sulle uscite)."""
    if not da_tile or da_tile == a_tile:
        return []
    prec = {da_tile: None}
    coda = [da_tile]
    while coda:
        cur = coda.pop(0)
        for dest in TILE[cur]['exits'].values():
            d = dest.split()[0]
            if d in prec or d not in TILE:
                continue
            prec[d] = cur
            if d == a_tile:
                out = []
                n = d
                while n != da_tile:
                    out.append(n)
                    n = prec[n]
                return out[::-1]
            coda.append(d)
    return []


def round_marcia_percorso(tappe, tile_partenza, pos_partenza):
    """Round di marcia per una sequenza di tessere (usato per il rientro)."""
    tot, cur_tile, cur_pos = 0, tile_partenza, pos_partenza
    for t in tappe:
        tot += round_di_marcia(cur_tile, t, cur_pos)
        cur_pos = porta_ingresso(t, cur_tile)
        cur_tile = t
    return tot


def _vicini(cella):
    x, y = cella
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < 4 and 0 <= ny < 4:
            yield (nx, ny)


def _arredi(tile_id):
    return {(gx, gy) for gx, gy, *_ in TILE[tile_id]['arredi']}


def cammino(tile_id, partenza, arrivo, bloccate):
    """BFS del cammino piu' breve da `partenza` ad `arrivo` sulla griglia
    4x4 della tessera (niente diagonali, regola vera). Bloccato dagli
    arredi (mai attraversabili) e dalle celle in `bloccate` (nemici per un
    eroe che si muove, eroi per un nemico) - tranne la cella di arrivo
    stessa, che puo' essere "bloccata" (ci si ferma adiacenti a chi la
    occupa, non sopra: vedi muovi_verso). Ritorna la lista di celle
    attraversate (partenza esclusa), [] se gia' li' o irraggiungibile."""
    if partenza == arrivo:
        return []
    muro = _arredi(tile_id) | (bloccate - {arrivo})
    coda = [partenza]
    prima = {partenza: None}
    while coda:
        corrente = coda.pop(0)
        if corrente == arrivo:
            break
        for vic in _vicini(corrente):
            if vic in prima or vic in muro:
                continue
            prima[vic] = corrente
            coda.append(vic)
    if arrivo not in prima:
        return []
    cammino_inv = []
    nodo = arrivo
    while nodo != partenza:
        cammino_inv.append(nodo)
        nodo = prima[nodo]
    cammino_inv.reverse()
    return cammino_inv


def muovi_verso(tile_id, partenza, obiettivo, passi_massimi, bloccate):
    """Sposta di al massimo `passi_massimi` celle lungo il cammino piu'
    breve verso `obiettivo`. Se l'obiettivo e' occupato (un nemico o un
    eroe: ci si vuole avvicinare A lui, non muoversi SOPRA), la vera meta'
    diventa la cella libera adiacente a lui piu' vicina alla partenza -
    "gli alleati si attraversano ma non ci si ferma sopra" vale anche qui,
    lo stesso muro di `bloccate` blocca il passaggio, mai solo l'arrivo."""
    if obiettivo in bloccate:
        candidate = [c for c in _vicini(obiettivo) if c not in bloccate and c not in _arredi(tile_id)]
        if not candidate:
            return partenza
        obiettivo = min(candidate, key=lambda c: len(cammino(tile_id, partenza, c, bloccate)) or 99)
        if obiettivo == partenza:
            return partenza
    tratta = cammino(tile_id, partenza, obiettivo, bloccate)
    if not tratta:
        return partenza
    return tratta[min(passi_massimi, len(tratta)) - 1]


def adiacenti(cella_a, cella_b):
    (x1, y1), (x2, y2) = cella_a, cella_b
    return abs(x1 - x2) + abs(y1 - y2) == 1


def cella_libera_vicino(tile_id, preferita, bloccate):
    """BFS della cella libera piu' vicina a `preferita` (se libera, e' lei
    stessa). None se la tessera e' piena (nessuna cella raggiungibile senza
    arredi/occupanti) - un nemico che arriva a tessera piena resta in coda
    fuori tessera invece di impilarsi sulla porta (bug: senza questo, con
    tavoli affollati la cella d'ingresso accumula piu' occupanti della
    griglia 4x4, e il BFS di movimento resta bloccato per tutti - vedi
    stallo osservato a 8-10 eroi, sessione 20260715-stress-tattico-kpi)."""
    muro = _arredi(tile_id) | bloccate
    if preferita not in muro:
        return preferita
    visti = {preferita}
    coda = [preferita]
    while coda:
        corrente = coda.pop(0)
        for vic in _vicini(corrente):
            if vic in visti:
                continue
            visti.add(vic)
            if vic not in muro:
                return vic
            coda.append(vic)
    return None

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
    # Ricalibrazione post-fix motore (vedi sessione_ricalibrazione): coi
    # nemici che ora raggiungono e colpiscono davvero, la pressione carte
    # va abbassata, non alzata. Due candidate piu' conservative di
    # tetto3_ritardato (2:1, 3-6:2, 7-10:3):
    'tetto2_ritardato': lambda n: max(1, min(1 + (n + 1) // 4, 2)),   # 2:1, 3-10:2 - mai 3 carte
    'tetto3_tardissimo': lambda n: 1 if n <= 2 else 2 if n <= 8 else 3,  # il tetto di 3 arriva solo a 9-10
    # Giro 4: la validazione finale ha mostrato n=3 a 39% (2 carte con 3
    # eroi = pressione da tavolo medio con meta' braccia) - 1 carta fino a
    # 3 eroi. E n=7 a 61% (il gradino 2->3 carte e' un dirupo ovunque
    # cada) - variante con il gradino spostato a 8.
    'finale_v2': lambda n: 1 if n <= 3 else 2 if n <= 6 else 3,          # 2-3:1, 4-6:2, 7-10:3
    'finale_v2_grad8': lambda n: 1 if n <= 3 else 2 if n <= 7 else 3,    # come v2 ma 7 resta a 2 carte
    # Giro 5: mezzo passo sul dirupo 2->3 carte. x.5 = la carta extra si
    # pesca solo nei round pari (vedi fase_minaccia). DI PRODUZIONE dal
    # 20260715 (vedi logs/playtest/20260715-ricalibrazione/analisi.md):
    # curva 3-10 misurata a 77-87% vittoria, 24-39% sofferte, Custode
    # anticipo <=3%, con CUSTODE_TENSIONE_EXTRA={6,8,9,10:1} e
    # SALUTE_BONUS_PER_N={4:1}. n=2 resta sotto target con qualunque leva
    # (39%, rumore enorme sui 5 party): dichiarata modalita' dura, in 2
    # giocatori si consiglia 4 eroi multi-handed (2 a testa).
    'finale_v3': lambda n: 1 if n <= 3 else 2 if n <= 6 else 2.5,        # 2-3:1, 4-6:2, 7-10:2+1 nei round pari
    # Round 6: come tetto3 ma il tetto di 3 carte si raggiunge a n=8 invece
    # che a n=6 (a 6 eroi restano 2 carte/round). Motivo: round 5 ha isolato
    # un crollo reale a n=6 con curva-C (0-13% vittoria su 5 party casuali
    # diversi) - a n=6 e n=8 tetto3 dava la STESSA pressione nemica (3
    # carte) ma n=6 ha 2 eroi in meno per assorbirla. Sequenza: 1,2,2,3,3.
    'tetto3_ritardato': lambda n: max(1, min(1 + (n + 1) // 4, 3)),
    # Round 8: alternativa a tetto3_ritardato che NON fa mai scendere le
    # carte all'aumentare degli eroi (l'utente ha giustamente notato che un
    # calo 5->6 e' contro-intuitivo). Stesso ceil(n/2) gia' pubblicato per
    # n=2..5, poi resta piatta a 3 invece di scendere a 2 a n=6 - la
    # compensazione per n=6 si sposta tutta sul bonus Ferite (vedi
    # curva-D_dolce) invece che sul numero di carte.
    'plateau3': lambda n: max(1, min((n + 1) // 2, 3)),  # 2:1 3:2 4:2 5:3 6:3 7:3 8:3 9:3 10:3
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
    # Round 8: rampa piu' dolce (+1 Ferite ogni 2 eroi da n=6, invece di
    # saltare subito a +2), pensata per accompagnare 'plateau3' - qui il
    # numero di carte NON scende a 6, quindi la compensazione deve venire
    # tutta da qui: si parte piu' bassi (+1 invece di +2) per non ripetere
    # il crollo visto con curva-C a tetto3 (3 carte + subito +2 Ferite).
    'curva-D_dolce': lambda n: (0 if n < 6 else (n - 4) // 2, 0),  # 2:0 4:0 6:1 7:1 8:2 9:2 10:3
    # Round 8b: scatto di +1 Ferite per OGNI eroe in piu' da n=6 (non ogni
    # 2 come curva-D_dolce) - il round 8 ha mostrato che tenere la stessa
    # Ferite per 2 taglie consecutive (con plateau3, carte sempre ferme a
    # 3) crea uno zigzag: la taglia dispari ha "un attaccante gratis"
    # rispetto al bonus invariato. Qui ogni eroe in piu' alza subito il
    # bonus, cosi' non c'e' mai un salto di taglia "a sconto".
    'curva-E_lineare': lambda n: (max(0, n - 5), 0),  # 2:0 4:0 6:1 7:2 8:3 9:4 10:5
    # Round griglia tattica: con posizioni/movimento reali l'affollamento
    # fisico di una tessera 4x4 penalizza i party grandi molto piu' di
    # quanto la vecchia formula (pensata per uno scaling lineare "piu'
    # eroi = piu' danno") prevedesse - misurato: curva-C_tardiva crolla
    # n=8/10 al 43%/40% (era 70-80%). Con ZERO bonus, n=8/10 tornano
    # 85-87% da soli (la fisica reale aggiunge gia' tensione). Qui il
    # bonus sale fino a n=6 (INVARIATO, gia' validato a 78%) poi SCENDE
    # invece di continuare a salire, perche' l'affollamento peggiora piu'
    # in fretta di quanto un Custode/nemici piu' duri possano compensare.
    # +1 Ferite a TUTTI i nemici (compresi quelli di truppa da 1 Ferita
    # base, che un +1 RADDOPPIA) crolla comunque a 42-49% anche solo da
    # n=7 - stesso problema gia' visto ungated a n=4 nel round precedente,
    # qui riemerso a causa dell'affollamento che allunga i combattimenti
    # (piu' round esposti = l'asimmetria del bonus pesa di piu'). Lezione:
    # con la griglia tattica, qualunque bonus Ferite generale sopra n=6 e'
    # da evitare - vedi CUSTODE_TENSIONE_EXTRA per la via corretta (solo
    # boss, mai i nemici di truppa).
    'curva-F_affollamento': lambda n: (2 if n == 6 else 1 if n >= 7 else 0, 0),  # SCARTATA, vedi sopra
    # Round griglia tattica, candidato buono: bonus generale INVARIATO a
    # n=6 (+2, gia' validato a 78%), ZERO da n=7 in su - tutta la tensione
    # oltre n=6 viene da CUSTODE_TENSIONE_EXTRA (solo boss) + dalla fisica
    # reale stessa, mai da un bonus generale che colpirebbe anche i
    # nemici di truppa da 1 Ferita.
    'curva-G_tattica': lambda n: (2 if n == 6 else 0, 0),  # 2:0 4:0 6:2 7:0 8:0 9:0 10:0
}

# KPI round (con simulazione astratta, niente griglia tattica): a n=4-5 il
# KPI "ansia" era piatto (97% vittoria, solo 27% sofferte, 0.4 eroi a terra
# di picco in media). Introdotto +1 Ferite SOLO al Custode (base 3 Ferite,
# +1 = +33%, non raddoppia un Adepto da 1 Ferita come un bonus generale -
# gia' scartato altrove) per concentrare la tensione nello scontro finale.
#
# Round griglia tattica: a n=4-5 il bonus e' diventato ridondante e
# dannoso - la fisica reale (a volte il movimento non basta per
# l'adiacenza, azione persa) da SOLA riporta l'ansia a un livello sano
# (32% sofferte, 1.0 eroi a terra di picco), mentre sommare ANCHE il
# bonus Ferite fa crollare la giocabilita' sotto target (72.7% contro
# l'84% senza, misurato a n=4) - RIMOSSO li'. A n=8-10 invece l'effetto
# opposto: l'affollamento fa crollare la giocabilita' cosi' tanto
# (curva-C_tardiva: 43%/40%) che serve TOGLIERE il bonus generale
# (vedi curva-G_tattica) e aggiungerne uno piccolo SOLO al Custode per
# recuperare un minimo di tensione (misurato: 79-84% con questo, 85-87%
# senza). A n=7 anche il bonus solo-Custode e' troppo (66% contro 88%
# senza) - lasciato a 0, l'88% e' piu' vicino al target di un 66%
# sottotarget.
#
# SUPERSEDUTO dai fix di movimento (commit e82a407, vedi sessione_
# ricalibrazione*): coi nemici che ora raggiungono e colpiscono davvero,
# {8,9,10}=1 lasciava 8-10 sotto target (48-56%) e il +2 generale a n=6
# (curva-G_tattica sopra) era diventato il killer della taglia (30%).
# Dopo 6 giri di ricalibrazione (logs/playtest/20260715-ricalibrazione):
# boss+1 a 6 e 8-10 (NON a 7), nessun bonus generale in nessuna taglia.
#
# RITARATO di nuovo il 20260716 dopo i fix di fedelta' (tick del Canto +
# abilita' vere, vedi logs/playtest/20260716-fedelta): col secondo
# orologio attivo le taglie che pescano "piu' carte che corpi" affondavano
# (n=4 69%, n=8 59%) mentre 9-10 tenevano il target anche col boss+1.
# Misure (matrice d0/d1/d2, seed deterministici): -1 Ferita al Custode a
# n=2 (21->43%, resta la modalita' dura dichiarata) e n=4 (69->75%, con
# sofferte al 32%: meglio del +2 Salute, 74% ma piatto al 22%); estenderlo
# a 3 e 5 sballa (95%/92%); boss+1 a n=8 bocciato (59% contro 81% senza);
# a 9-10 invece serve, senza si vola a 85-91% con sofferte 14-16%.
# Va di pari passo con MINACCIA_FORMULE['finale_v3'] (vedi sotto) e la
# tabella Ferite del Custode in src/gen_bestiario.py.
CUSTODE_TENSIONE_EXTRA = {2: -1, 4: -1, 6: 1, 9: 1, 10: 1}


# Toggle di ricalibrazione (sessione_ricalibrazione, post-fix motore):
# i batch girano in sequenza, un globale basta - niente parametro da
# infilare in tutta la catena esegui_batch -> simula_spedizione.
CUSTODE_EXTRA_ATTIVO = True
# Gettone Intuizione "Dossier completo" (vedi simula_indagine): ON di
# produzione. Toggle solo per il test A/B (sessione_dossier).
DOSSIER_ATTIVO = True

# Il Canto (regola vera del Regolamento): oltre alle carte crescendo, +1
# segnalino automatico alla fine di ogni TICK_CANTO_OGNI-esimo round (4°,
# 8°, 12°...) - il "secondo orologio parallelo" che garantisce la pressione
# anche evitando ogni carta-timer. MAI simulato prima del 20260716: tutta
# la ricalibrazione precedente era tarata senza questa fonte (audit di
# fedelta'). SOGLIA_CANTO = 3 e' la soglia di risveglio dell'Ep. 1
# (stampata su carte crescendo/Regolamento/Aiuto: se la ricalibrazione la
# cambia, vanno aggiornati anche i componenti).
TICK_CANTO_OGNI = 4
SOGLIA_CANTO = 3
# +Salute massima a testa per taglia di party. DI PRODUZIONE: solo n=4
# (67%->79% nella ricalibrazione; nullo a 8-10, dove il collo di bottiglia
# sono le ondate non i punti Salute - vedi logs/playtest/20260715-
# ricalibrazione/analisi.md). Precedente: Gloomhaven abbassa il livello
# mostri ai tavoli piccoli; qui la lingua e' quella del bonus PREPARATI,
# zero componenti nuovi. {} = spento.
SALUTE_BONUS_PER_N = {2: 1, 4: 1}  # {2:1} dal 20260717, vedi simulate_playtest


def custode_fer_bonus(n_eroi):
    return CUSTODE_TENSIONE_EXTRA.get(n_eroi, 0) if CUSTODE_EXTRA_ATTIVO else 0

# Copie extra di miniature stampabili per party grandi (diagnostica): "non
# il doppio" (richiesta esplicita) - +1 copia per tipo ogni 4 eroi oltre 5.
def token_pool_extra(n_eroi):
    return max(0, (n_eroi - 5) // 4)

# titolo carta Minaccia -> (nemico da piazzare, quanti, si attiva subito)
CARD_SPAWN = {
    'LA SQUADRA DEL SILENZIO': ('LO SGHERRO', 1, False),
    'I GESTI DEL CAPOMASTRO': ('LO SGHERRO', 1, False),
    'IL PIOMBO E LA SACCA': ('LO SGHERRO', 1, True),
    'I MANOVALI DI NOTTE': ('LO SGHERRO', 1, False),
    'IL TURNO FUORI BUSTA': ('LO SGHERRO', 1, False),
    'LE PALE NEL BUIO': ('LO SGHERRO', 1, False),
    'LA MALTA FRESCA': ('LO SGHERRO', 1, False),
    'IL GUARDIANO DI NOTTE': ('IL SICARIO', 1, False),
    'LA RONDA DEL CANCELLO': ('IL SICARIO', 1, True),
    'GLI UOMINI DELL’INGEGNERE': ('LO SGHERRO', 1, False),
    'LA PAGA DEL SILENZIO': ('LO SGHERRO', 1, False),
}
DISTANZA_PORTA = 1
SPAWN_DISTANZA = {
    'LA SQUADRA DEL SILENZIO': DISTANZA_PORTA,
    'I GESTI DEL CAPOMASTRO': DISTANZA_PORTA,
    'IL PIOMBO E LA SACCA': DISTANZA_PORTA,
    'I MANOVALI DI NOTTE': None,
    'IL TURNO FUORI BUSTA': None,
    'LE PALE NEL BUIO': DISTANZA_PORTA,
    'LA MALTA FRESCA': DISTANZA_PORTA,
    'IL GUARDIANO DI NOTTE': DISTANZA_PORTA,
    'LA RONDA DEL CANCELLO': DISTANZA_PORTA,
    'GLI UOMINI DELL’INGEGNERE': DISTANZA_PORTA,
    'LA PAGA DEL SILENZIO': DISTANZA_PORTA,
}
INSIDIA = {  # titolo -> (difficolta', danno, chi prova)
    'LA TAVOLA CHE CEDE': ('Media', 1, 'l’eroe più avanzato'),
    'LA CALCE NEGLI OCCHI': ('Media', 1, 'l’eroe attivo'),
    'IL SILENZIO CHE PREME': ('Facile', 0, 'ogni eroe (chi fallisce: 1 sola azione prossimo turno)'),
}
PERDE_AZIONE = {'LA CALCE NEGLI OCCHI', 'IL SILENZIO CHE PREME'}
CRESCENDO = {'UN FISCHIO DI SOTTO', 'LE LANTERNE SI MUOVONO', 'IL CANTIERE È SVEGLIO'}
MALAVITA_TRUPPA = {'LO SGHERRO', 'IL SICARIO'}
# «Il piombo dal buio»: danno diretto senza prova (gestito in fase_minaccia).
DANNO_DIRETTO = {'IL PIOMBO DAL BUIO'}
# Le tessere SORDE della via delle intercapedini (regola d'ambiente).
TESSERE_SORDE = {'T3I', 'T4I', 'T5I'}

# Il boss dell'episodio (vedi gen_ep7.NEMICI_7 e DESIGN-EPISODIO-7.md):
# un uomo, nessuna debolezza-oggetto. «Smascherato» (D2 esatta): salta la
# PRIMA attivazione e 1 Sgherro della scorta se ne va.
CUSTODE = dict(nome='IL CAPOCANTIERE', att=2, dif=8, fer=4, mov=3, dan=2)

# Luoghi Indagine, versione compatta per la sola AI di scelta + sblocchi.
# (n, req_key or None, sblocca[list], chiude_ore[set], approfondimenti[tipo->eroi idonei])
LUOGHI_SIM = [
    # Ep. 7: chiavi garantite negli indizi core, tutte da aperti (1-4).
    # `libretto=True` = L6 consegna LA BOLLA DELLA CALCE (D4, indizio
    # core); `pianta=True` = L8 (Lanterna Schermata + Tappi: bonus NERVI);
    # `incrocio_d1` = riscontri della Domanda 1 (L4/L6/L7, ne servono 2);
    # `incrocio_d3` = riscontri della Domanda 3 (L2/L4/L6, ne servono 2).
    dict(n=1, nome='La Contrada di Sant’Orsola', req=None,
         sblocca_parola=('LA CALCE NUOVA', 'L’INTONACO BREVETTATO'), chiude=None,
         approf=['Testimonianza']),
    dict(n=2, nome='La Bottega di Fava', req=None,
         sblocca_parola='L’INTONACO BREVETTATO', chiude=None,
         approf=['Osservazione'], incrocio_d3=True),
    dict(n=3, nome='Le Fonderie', req=None,
         sblocca_parola=('LE SCORIE DEL QUARANTUNO', 'LA CALCE NUOVA'), chiude=None,
         approf=['Testimonianza']),
    dict(n=4, nome='Il Banco dei Pegni', req=None,
         sblocca_parola='LE SCORIE DEL QUARANTUNO', chiude=None,
         approf=['Testimonianza'], incrocio_d1=True, incrocio_d3=True),
    dict(n=5, nome='L’Ufficio Brevetti Comunale', req=('parola', 'L’INTONACO BREVETTATO'),
         chiude=None, approf=['Referto']),
    dict(n=6, nome='La Baracca del Cantiere', req=('parola', 'LA CALCE NUOVA'),
         sblocca_parola='IL CAPOTURNO', sblocca_oggetto='LA BOLLA DELLA CALCE',
         chiude=None,
         approf=['Osservazione'], incrocio_d1=True, incrocio_d3=True, libretto=True),
    dict(n=7, nome='L’Impresa Voltan & Figli', req=('parola', 'LE SCORIE DEL QUARANTUNO'),
         sblocca_parola='IL CAPOTURNO', chiude=None,
         approf=['Osservazione'], incrocio_d1=True),
    dict(n=8, nome='Il Magazzino della Calce', req=('parola', 'IL CAPOTURNO'),
         chiude=None, approf=['Referto'], pianta=True),
    dict(n=9, nome='Il Cancello del Palazzone', req=('oggetto', 'LA BOLLA DELLA CALCE'),
         chiude=None, approf=['Presagio']),
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


def simula_indagine(party, log, esplora_a_fondo=False):
    log('=' * 78)
    log('INDAGINE - Episodio 7: "Il quartiere sordo"')
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
    pianta = False       # L8: Lanterna Schermata + Tappi (bonus NERVI, tessere sorde)
    libretto = False     # L6: LA BOLLA DELLA CALCE (Domanda 4, apre L9)
    incroci_d1 = 0       # riscontri della Domanda 1 (>=2 = lato giusto)
    incroci_d3 = 0       # riscontri della Domanda 3 (>=2 = anticipo giusto)
    approf_letti = 0
    approf_falliti = 0
    chi_confermato = False
    charges = {n: dict(INDAGINE_UNLOCK.get(n, {})) for n in party}
    # Secondo Fiato (Regolamento: ogni eroe ha 1 solo ritento a episodio):
    # condiviso tra Indagine e Spedizione - il residuo viaggia nel dict di
    # ritorno e simula_spedizione lo eredita.
    secondo_fiato = {n: True for n in party}
    # Quali Approfondimenti sono stati letti, per luogo e tipo: serve agli
    # hook Indagine->Spedizione (es. il Presagio di L6 che avverte della
    # trappola della chiave in T4 - vedi bibbia punto 3).
    approf_dettaglio = set()
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
        if ora_corrente < l.get('apre', 0):
            return False
        req = l.get('req')
        if req is None:
            return True
        kind, key = req
        return key in (parole if kind == 'parola' else oggetti)

    def punteggio(l):
        # 1,2,3 sempre per primi: sbloccano gli altri luoghi (parola/oggetto).
        # Il diapason (L5) sale alla stessa priorita' di 1/2/3 SOLO dopo che
        # il gruppo ha sentito da Bice (Casa di Ruggero, L2) che Ferri ne
        # tiene uno in bottega - prima di allora resta un oggetto come un
        # altro (l'euristica non "sa" del diapason finche' nessuno gliene ha
        # parlato). Senza questo, L5 perdeva sempre contro luoghi con
        # scadenza (regola "rischio" sotto) e non veniva mai visitato: un
        # tavolo vero che ha SENTITO Bice ci andrebbe, e' il cuore del
        # deduttivo (vedi Sherlock Holmes Consulting Detective - si seguono
        # le piste nominate). Se il gruppo non arriva mai a sentire Bice,
        # il diapason mancante resta un esito legittimo, non un bug.
        #
        # Eccezione (rischio): un luogo non strutturale che chiuderebbe per
        # sempre se non visitato QUESTA ora salta in testa alla coda. Senza
        # questo, un luogo come il Luogo 8 (chiude presto, non sblocca nulla)
        # perde sempre contro 1/2/3 finche' non e' gia' troppo tardi per
        # visitarlo - irraggiungibile in ogni singola simulazione, non solo
        # qualche volta.
        rischio = 0 if (l['chiude'] is not None and ora_corrente + 1 >= l['chiude']) else 1
        # Ep. 3: strutturali = le 4 fonti di chiavi, tutte aperte (L1-L4).
        strutturale = 0 if l['n'] in (1, 2, 3, 4) else 1
        # La "missione" del caso: un tavolo vero insegue la Canna Muta
        # (Domanda 4, indispensabile in T3) e i riscontri del Pozzo Maestro
        # (Domanda 3, ne servono 2) - come la pista-diapason dell'Ep. 1:
        # si seguono le piste nominate dagli indizi (L1/L3/L4 le nominano
        # tutte). Senza questo, l'euristica chiudeva a 4 luoghi con D3
        # sbagliata e senza Canna (misurato nello smoke test).
        missione = 0 if ((l.get('libretto') and not libretto)
                         or (l.get('pianta') and not pianta)
                         or (l.get('incrocio_d1') and incroci_d1 < 2)
                         or (l.get('incrocio_d3') and incroci_d3 < 2)) else 1
        urgenza = l['chiude'] or 99  # chi chiude prima, tra i pari, va prima
        copertura = -sum(1 for t in l['approf'] if t in tipi_coperti)  # più negativo = più utile a QUESTO party
        # `missione` PRIMA di `strutturale`: appena una pista di missione si
        # sblocca (Bo, il Catasto, la corte dei pozzi), il tavolo la segue -
        # le fonti di chiavi restanti aspettano (misurato: con l'ordine
        # inverso il gruppo non arrivava MAI da Bo, vedi smoke test).
        return (rischio, missione, strutturale, urgenza, copertura, l['n'])

    da_rivisitare = []  # luoghi dove "leggere la scena" e' fallita, Approfondimento ancora da cogliere
    profano_usato = set()  # aiuto profano: una sola occasione per luogo (Regolamento)

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
                approf_dettaglio.add((l['n'], tipo))
                if (l['n'], tipo) in CHI_ESPLICITO:
                    chi_confermato = True
                    log('    -> Questa carta conferma esplicitamente che il colpevole è l’ingegner Voltan (Domanda 2).')
            else:
                # Aiuto profano (Regolamento): nessuno puo' piu' sbloccare il
                # tipo -> un eroe qualsiasi tenta ACUME (Difficile), una sola
                # occasione per luogo. Riuscita = sbloccato; fallita = resta
                # sigillato qui.
                if l['n'] in profano_usato:
                    log(f'    [APPROFONDIMENTO {tipo}] nessun eroe idoneo e occasione profana già spesa qui — non letto.')
                    approf_falliti += 1
                    continue
                profano_usato.add(l['n'])
                dilettante = max(party, key=lambda n: HERO[n]['acume'])
                ok, _ = check(log, dilettante, 'ACUME', HERO[dilettante]['acume'], 'Difficile')
                if ok:
                    log(f'    [APPROFONDIMENTO {tipo}] colto da profano da {dilettante} (ACUME Difficile).')
                    approf_letti += 1
                    approf_dettaglio.add((l['n'], tipo))
                    if (l['n'], tipo) in CHI_ESPLICITO:
                        chi_confermato = True
                        log('    -> Questa carta conferma esplicitamente che il colpevole è l’ingegner Voltan (Domanda 2).')
                else:
                    log(f'    [APPROFONDIMENTO {tipo}] aiuto profano fallito: resta sigillato qui.')
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
        # ...ma MAI rinunciare finche' mancano la Canna Muta o il secondo
        # riscontro della Domanda 3, se il prossimo candidato li porta: un
        # tavolo vero non "banca" ore lasciando la Domanda 4 senza oggetto.
        candidato_missione = ((l.get('libretto') and not libretto)
                              or (l.get('pianta') and not pianta)
                              or (l.get('incrocio_d1') and incroci_d1 < 2)
                              or (l.get('incrocio_d3') and incroci_d3 < 2))
        if (approf_letti >= 1 and ore <= 2 and l['n'] not in (1, 2, 3)
                and not candidato_missione and not esplora_a_fondo):
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
        # Leggere la scena: alla prima visita, un eroe a scelta (il migliore ACUME
        # del party) prova ACUME Media prima di leggere gli indizi. Gli indizi core
        # si leggono comunque (regola Gumshoe: mai un vicolo cieco); solo
        # l'eventuale Approfondimento resta condizionato all'esito.
        lettore = max(party, key=lambda n: HERO[n]['acume'])
        ok, _ = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        # Secondo Fiato: il ritento si spende qui solo se il luogo ha
        # Approfondimenti da perdere (un tavolo vero non lo brucia su un
        # luogo senza posta) e l'eroe non l'ha gia' usato.
        if not ok and l['approf'] and secondo_fiato.get(lettore):
            secondo_fiato[lettore] = False
            log(f'    [SECONDO FIATO] {lettore} ritenta “leggere la scena” (unico ritento dell’episodio):')
            ok, _ = check(log, lettore, 'ACUME', HERO[lettore]['acume'], 'Media')
        if vero_luogo:
            for indizio in vero_luogo.get('indizi', []):
                log(f'    - Indizio: {strip_tags(indizio)}')
        if l.get('sblocca_parola'):
            sp = l['sblocca_parola']
            for p in ([sp] if isinstance(sp, str) else sp):
                parole.add(p)
                log(f'    -> Parola chiave trovata (vedi indizio sopra): {p}')
        if l.get('sblocca_oggetto'):
            oggetti.add(l['sblocca_oggetto'])
            log(f'    -> Oggetto trovato (vedi indizio sopra): {l["sblocca_oggetto"]}')
        if l.get('pianta'):
            pianta = True
            log('    -> Trovate: LANTERNA SCHERMATA e TAPPI DI CERA (+1 NERVI nelle tessere sorde).')
        if l.get('libretto'):
            libretto = True
            log('    -> Trovata: LA BOLLA DELLA CALCE (si entra dal cancello — Domanda 4).')
        if l.get('incrocio_d1'):
            incroci_d1 += 1
            log(f'    -> Riscontro sulla Domanda 1 ({incroci_d1}: taccuino/bolle/guardiano).')
        if l.get('incrocio_d3'):
            incroci_d3 += 1
            log(f'    -> Riscontro sulla Domanda 3 ({incroci_d3}: agenda/guardiano/registro turni).')
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
    # Regola 2026-07-18 (chiusura del bug "Slancio gratis"): lo SLANCIO e' di
    # chi SA dove andare — scatta SOLO con TUTTE le risposte esatte E 3+ ore
    # avanzate (la Domanda 2 conta esatta: elasticita' massima da fascicolo).
    # La via "approfondita" (6+ luoghi) vale ora il tier PREPARATI.
    tutte_esatte = libretto and incroci_d1 >= 2 and incroci_d3 >= 2
    if ore_avanzate >= 3 and tutte_esatte:
        tier = 'SLANCIO (3 azioni al 1° round di spedizione, +1 Salute massima a testa)'
    elif ore_avanzate >= 1 or len(visitati) >= 6:
        tier = 'PREPARATI (+1 Salute massima a testa)'
    else:
        tier = 'nessun vantaggio'
    log('')
    log(f'Fine Indagine: {len(visitati)}/9 luoghi visitati, {approf_letti} Approfondimenti letti, '
        f'{approf_falliti} mancati.')
    log(f'Ore avanzate: {ore_avanzate} -> {tier}')
    d1_ok = incroci_d1 >= 2
    d3_ok = incroci_d3 >= 2
    log(f'Bolla della Calce: {"sì" if libretto else "NO — si scavalca (1 Canto in più)"}; '
        f'Lanterna+Tappi: {"sì" if pianta else "no"}; Domanda 1 ({incroci_d1} riscontri): '
        f'{"esatta" if d1_ok else "SBAGLIATA"}; Domanda 3 ({incroci_d3} riscontri): '
        f'{"esatta" if d3_ok else "SBAGLIATA — arriverete a spettacolo iniziato"}')
    log(f'Chi dirige confermato esplicitamente (Domanda 2): '
        f'{"sì" if chi_confermato else "no — risposta “vicina” da giudicare con elasticità"}')
    if fanti_scout:
        log('Nota: Ombra fiuta (Fanti) avrebbe dato il conteggio Approfondimenti per luogo prima di '
            'ogni scelta — l’euristica sopra già sceglie con priorità di sblocco, effetto equivalente.')
    # "Dossier completo": ciliegina che inclina LEGGERMENTE l'incentivo verso
    # l'esplorazione totale senza rendere inutile la via veloce. Condizione:
    # NESSUNA ora avanzata (avete speso tutte le ore in Indagine) - la via
    # veloce, che per definizione banca ore, NON puo' averla. Da' 1 gettone
    # Intuizione per la Spedizione (vedi simula_spedizione). Precedente: D&D
    # Inspiration, obiettivo bonus di Gloomhaven - premio piccolo e puntuale,
    # non un tier di potere. Generico per la campagna: dipende dal budget
    # ore, non da un numero fisso di luoghi.
    dossier_completo = ore_avanzate == 0
    if dossier_completo:
        log('Dossier completo (tutte le ore spese in Indagine): 1 gettone Intuizione per la Spedizione.')
    log('')
    # Torsione «QUANTI?»: quante consegne notturne al terzo piano? Il numero
    # si ricava incrociando le bolle della Baracca (L6) con le chiazze sorde
    # della Contrada (L1). Chi lo ha regge un round in piu' prima dello
    # sbarramento (soglia +1).
    conteggio_ok = (6 in visitati) and (1 in visitati)
    if conteggio_ok:
        log('Conteggio delle consegne notturne esatto (bolle L6 + contrada L1): '
            'soglia di sbarramento +1.')
    return dict(ore_avanzate=ore_avanzate, tier=tier, libretto=libretto,
                pianta=pianta, d1_ok=d1_ok, d3_ok=d3_ok, visitati=visitati,
                conteggio_ok=conteggio_ok,
                chi_confermato=chi_confermato, dossier_completo=dossier_completo,
                secondo_fiato=secondo_fiato, approf_dettaglio=approf_dettaglio)


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
            sp = l['sblocca_parola']
            parole.update([sp] if isinstance(sp, str) else sp)
        if l.get('sblocca_oggetto'):
            oggetti.add(l['sblocca_oggetto'])
        if l.get('stona'):
            diapason = True  # approssimazione diagnostica: un pezzo basta
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
        tier = 'SLANCIO (3 azioni al 1° round di spedizione, +1 Salute massima a testa)'
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
                chi_confermato=chi_confermato, luoghi_coperti=len(visitati),
                dossier_completo=ore_avanzate == 0)


def spawn_from_card(log, title, pool, enemies, round_n, fer_bonus=0, dan_bonus=0,
                     tile_id=None, porta_pos=None, pos_eroi=None, occupate=frozenset()):
    """`tile_id`/`porta_pos`/`pos_eroi`/`occupate`: geometria della tessera
    corrente, per dare una `pos` reale ai piazzamenti che avvengono nella
    STESSA tessera del gruppo (tutti tranne le carte "dinamiche" con
    SPAWN_DISTANZA=None, che arrivano da fuori tessera e restano astratte -
    vedi fase_nemici). Regola vera per "sull'uscita più vicina/lontana
    agli eroi": qui si approssima sempre con l'unica porta della tessera
    corrente (vedi commento su SPAWN_DISTANZA/DISTANZA_PORTA)."""
    nome, n, subito = CARD_SPAWN[title]
    dist_base = SPAWN_DISTANZA.get(title, 0)
    piazzati = 0
    esauriti = 0
    occupate = set(occupate)
    for _ in range(n):
        if pool[nome] <= 0:
            log(f'    Segnalini {nome} esauriti: il piazzamento non ha luogo (resto della carta si applica comunque).')
            esauriti += 1
            continue
        pool[nome] -= 1
        piazzati += 1
        base = NEMICO[nome]
        fer_tot = base['fer'] + fer_bonus
        nemico_pos = None
        distanza = 0
        if dist_base is None:
            # "dalla Banchina T1": ancora fuori dalla tessera corrente, resta
            # astratto finche' non colma la distanza (vedi fase_nemici). Fisso
            # a CASELLE_TESSERA (fatto strutturale sulla tessera, vedi sopra) -
            # NON scalare con round_n: un rinforzo che nasce a round 30
            # nascerebbe a 180 caselle, irraggiungibile per costruzione (bug
            # trovato nello stallo del combattimento T6, sessione
            # 20260715-stress-tattico-kpi).
            distanza = CASELLE_TESSERA
        elif dist_base == 0 and pos_eroi:
            bersaglio_pos = pos_eroi[random.choice(list(pos_eroi))]
            libere = [c for c in _vicini(bersaglio_pos) if c not in occupate and c not in _arredi(tile_id)]
            nemico_pos = libere[0] if libere else porta_pos
        elif porta_pos:
            nemico_pos = porta_pos
        if nemico_pos:
            occupate.add(nemico_pos)
        enemies.append(dict(nome=nome, fer=fer_tot, fer_max=fer_tot, dif=base['dif'],
                             att=base['att'], dan=base['dan'] + dan_bonus, mov=base['mov'],
                             distanza=distanza, pos=nemico_pos))
    if piazzati:
        ultimo = enemies[-1]
        extra = f' in {chess(ultimo["pos"])}' if ultimo['pos'] else (
            f', a {ultimo["distanza"]} caselle dalla tessera del gruppo' if ultimo['distanza'] > 0 else ', già adiacenti')
        log(f'    Piazzati {piazzati}x {nome} (pool residua: {pool[nome]}){extra}.')
    return (subito and piazzati), esauriti


def simula_spedizione(party, indagine, log, run_seed, formula_minaccia='standard',
                       nemico_scale='nessuna', pool_extra=False):
    log('=' * 78)
    log('SPEDIZIONE - Il Palazzone di Sant’Orsola (al cambio delle nove)')
    log('=' * 78)
    log(f'Party: {", ".join(party)}')
    log(f'Bonus da Indagine: {indagine["tier"]}; Bolla: '
        f'{"sì" if indagine["libretto"] else "no"}; Lanterna+Tappi: '
        f'{"sì" if indagine.get("pianta") else "no"}; D1: '
        f'{"esatta" if indagine.get("d1_ok") else "sbagliata"}; D3: '
        f'{"esatta" if indagine.get("d3_ok") else "sbagliata"}')
    log('NOTA: gruppo trattato come blocco unico tessera per tessera (vedi intestazione script).')
    fer_bonus, dan_bonus = NEMICO_SCALE_FORMULE[nemico_scale](len(party))
    if fer_bonus or dan_bonus:
        log(f'Scalatura nemici ({nemico_scale}): +{fer_bonus} Ferite, +{dan_bonus} Danno su ogni nemico incluso il Custode.')
    custode_extra_fer = custode_fer_bonus(len(party))
    if custode_extra_fer:
        log(f'Tensione tavolo piccolo: +{custode_extra_fer} Ferite SOLO al Capocantiere (non ai nemici di truppa).')
    log('')

    salute = {}
    salute_max = {}
    armed = {n: True for n in party}  # tutti gli eroi hanno un'arma iniziale (+1)
    bonus_n2 = SALUTE_BONUS_PER_N.get(len(party), 0)
    if bonus_n2:
        log(f'Tavolo da {len(party)}: +{bonus_n2} Salute massima a testa (ricalibrazione).')
    for n in party:
        h = HERO[n]
        smax = h['salute'] + (1 if indagine['tier'].startswith(('PREPARATI', 'SLANCIO')) else 0) + bonus_n2
        salute[n] = smax
        salute_max[n] = smax
    down = set()
    intuizione = {'disponibile': DOSSIER_ATTIVO and bool(indagine.get('dossier_completo'))}
    if intuizione['disponibile']:
        log('Gettone Intuizione in mano (Dossier completo): un ri-tiro, una volta in Spedizione.')
    pool = dict(TOKEN_POOL_BASE)
    # Domanda 1 sbagliata: si sale a tentoni - 1 Sgherro in T1. Domanda 3
    # sbagliata: fuori finestra - +1 Canto. Senza Bolla (D4): si scavalca -
    # +1 Canto (vedi sotto, `canto`).
    sbarco_rumoroso = not indagine.get('d1_ok')
    if pool_extra:
        extra = token_pool_extra(len(party))
        if extra:
            log(f'Pool nemici aumentato (+{extra} copie per tipo, diagnostica "non il doppio").')
            for k in pool:
                pool[k] += extra
    enemies = []
    if sbarco_rumoroso:
        if pool['LO SGHERRO'] > 0:
            pool['LO SGHERRO'] -= 1
            base = NEMICO['LO SGHERRO']
            g_fer = base['fer'] + fer_bonus
            enemies.append(dict(nome='LO SGHERRO', fer=g_fer, fer_max=g_fer,
                                 dif=base['dif'], att=base['att'], dan=base['dan'] + dan_bonus,
                                 mov=base['mov'], distanza=DISTANZA_PORTA, pos=None))
        log('  A tentoni nel cantiere (Domanda 1): 1 Sgherro appare al Cancello.')
    pos = {}  # nome eroe -> (gx, gy) nella tessera corrente (griglia tattica)
    tile_attuale = None  # id della tessera dove valgono le `pos` correnti
    custode = None
    custode_stunned = False
    sorde_scontate = set()     # tessere sorde col primo spawn gia' scontato
    SOGLIA_SBARRAMENTO = 12 + (1 if indagine.get('conteggio_ok') else 0)  # +1 col conteggio esatto (Domanda QUANTI?). Leva per-episodio (stampata): al 12°/13° segnalino
                               # Allarme il cantiere si sbarra — Fava resta dentro
                               # (sconfitta a tempo, non a sangue)
    sbarrato = [False]
    canto = (0 if indagine.get('d3_ok') else 1) + (0 if indagine.get('libretto') else 1)
    if not indagine.get('libretto'):
        log('  Senza Bolla della Calce (Domanda 4): si scavalca la cinta — +1 segnalino Canto.')
    if not indagine.get('d3_ok'):
        log('  Fuori dalla finestra del cambio (Domanda 3): il cancello vi nota — +1 segnalino Canto.')
    voce_ferma_scade_round = 0
    adescati = []  # nemici che l'Esca preziosa (Carbone) distoglie per il round corrente
    attivati_extra = set()  # id() dei nemici gia' attivati "subito" questo round (vedi fase_minaccia) -
    # senza, fase_nemici li processava DI NUOVO nello stesso round: 2 mosse/attacchi invece di 1
    # (bug preesistente, mai visibile prima perche' l'attacco "subito" non controllava la distanza).
    chiave = False
    tobia_libero = False
    tessere_cercate = set()  # luogo_label gia' perquisiti (Cercare, una volta a tessera)
    n_players_actions = len(party) * 2

    # Diagnostica per party grandi (8-10 eroi): non regole di gioco, solo
    # metriche per confrontare formule/party size nel riepilogo finale.
    rimescolamenti_mazzo = 0
    pool_esauriti_totale = 0
    azioni_per_round = []  # azioni nominali (2/eroe vivo, 3 al 1° round con SLANCIO)
    round_custode_svegliato = None
    canto_bonus_carte = False  # "da quel momento ogni Fase Minaccia pesca 1 carta in piu'"
    max_down_simultanei = 0  # proxy "ansia": picco di eroi a terra nello stesso momento

    def log_azioni_round():
        n_azioni = len(vivi()) * (3 if (round_n == 1 and indagine['tier'].startswith('SLANCIO')) else 2)
        azioni_per_round.append(n_azioni)
        log(f'    (azioni nominali questo round: {n_azioni} — {len(vivi())} eroi vivi)')

    def movimento_eroe(n):
        return 4 if n == 'NINO “GRIMALDELLO” CAUTO' else 3

    def celle_occupate(esclusa=None):
        """Celle occupate da chiunque sia vivo e posizionato (eroi + nemici
        + Custode), tranne `esclusa` (chi si sta muovendo: non blocca se
        stesso). Ponytail: alleati e nemici bloccano il passaggio allo
        stesso modo (niente distinzione "attraversabile ma non ci si
        ferma"), semplificazione ragionevole su una griglia 4x4 piccola -
        aggiungere la distinzione se i log mostrano eroi bloccati spesso
        vicino a una porta affollata."""
        celle = {p for m, p in pos.items() if m != esclusa}  # vivi e a terra: un corpo occupa comunque la cella
        celle |= {e['pos'] for e in enemies if e['fer'] > 0 and e.get('pos') and e is not esclusa}
        if custode and custode['fer'] > 0 and custode.get('pos') and custode is not esclusa:
            celle.add(custode['pos'])
        return celle

    def sposta_verso(n, tile_id, obiettivo_pos, obiettivo_nome):
        """Muove l'eroe `n` fino a `movimento_eroe(n)` celle verso
        `obiettivo_pos` (BFS, bloccato da arredi e da chiunque sia sul
        cammino), logga lo spostamento se la posizione cambia. Ritorna True
        se dopo il movimento e' adiacente all'obiettivo."""
        partenza = pos[n]
        nuova = muovi_verso(tile_id, partenza, obiettivo_pos, movimento_eroe(n), celle_occupate(esclusa=n))
        if nuova != partenza:
            log(f'    {n} si muove verso {obiettivo_nome}: {chess(partenza)} -> {chess(nuova)}.')
            pos[n] = nuova
        return adiacenti(pos[n], obiettivo_pos)

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
        if 'Diversivo' in a:
            u['diversivo'] = 2

    def carica_minaccia_deck():
        d = list(MINACCE)
        random.shuffle(d)
        return d

    deck = carica_minaccia_deck()
    scarti = []
    # Eroi che hanno perso 1 azione (insidie: TRAPPOLA/CERA SOTTO I PIEDI/
    # FUMI, piu' gli eventi scriptati T5/T4): al loro prossimo turno hanno
    # una sola azione (muoversi O agire, non entrambe).
    azioni_perse = set()
    # Secondo Fiato (1 ritento a episodio per eroe): il residuo arriva
    # dall'Indagine (chi l'ha gia' speso su "leggere la scena" non lo ha piu').
    secondo_fiato = dict(indagine.get('secondo_fiato') or {n: True for n in party})

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
            # Gettone Intuizione (Dossier completo, vedi indagine): il gruppo
            # spende l'unico ri-tiro sul momento peggiore - qui modellato come
            # il primo eroe che sarebbe caduto e invece regge a 1 Salute (a
            # tavolo: si ripete il tiro d'attacco nemico letale, e manca).
            # Uso conservativo (primo KO utile): un gruppo vero lo spende
            # almeno cosi' bene, mai peggio.
            if intuizione['disponibile']:
                intuizione['disponibile'] = False
                salute[bersaglio] = 1
                log(f'    [INTUIZIONE] Il gruppo spende il gettone Dossier: {bersaglio} resta '
                    f'in piedi a 1 Salute invece di cadere.')
                return
            down.add(bersaglio)
            log(f'    *** {bersaglio} è A TERRA. ***')

    def urlo_voce_cava(e):
        """La Voce Cava, abbattuta, URLA (regola nuova dell'episodio, vedi
        Bestiario): ogni eroe adiacente prova NERVI (Facile) - chi fallisce
        perde 1 azione al prossimo turno."""
        if e['nome'] != 'LA VOCE CAVA' or not e.get('pos'):
            return
        vicini_eroi = [m for m in vivi() if adiacenti(pos[m], e['pos'])]
        if vicini_eroi:
            log('    La Voce Cava URLA nel disfarsi:')
        for m in vicini_eroi:
            ok_u, _ = check(log, m, 'NERVI', HERO[m]['nervi'], 'Facile')
            if not ok_u:
                azioni_perse.add(m)
                log(f'    {m} avrà 1 sola azione al suo prossimo turno (l’urlo).')

    def malus_claque(eroe):
        """Aura della Claque (regola nuova dell'episodio): -1 alle prove
        per gli eroi adiacenti a una Claque viva."""
        if pos.get(eroe) is None:
            return 0
        for e in enemies:
            if e['nome'] == 'LA CLAQUE' and e['fer'] > 0 and e.get('pos') \
                    and adiacenti(pos[eroe], e['pos']):
                return -1
        return 0

    def voce_ferma_bonus(bersaglio=None):
        # Regola vera: +2 NERVI SOLO agli eroi ADIACENTI a Serra, non a tutto
        # il gruppo (prima il bonus era globale: fedeltà 20260716). Serra
        # stesso non ne beneficia ("gli eroi a lui adiacenti").
        if round_n <= voce_ferma_scade_round and bersaglio is not None:
            n = next((x for x in party if 'Voce ferma' in HERO[x]['abil']), None)
            if (n and n not in down and n != bersaglio
                    and pos.get(n) and pos.get(bersaglio)
                    and adiacenti(pos[n], pos[bersaglio])):
                return 2, n
        return 0, None

    # La SCELTA della via (regola varieta', vedi T2): euristica — un party
    # con NERVI medi alti regge le prove dei ponteggi (via corta, esposta);
    # gli altri prendono le intercapedini (via lunga, sorda). Annunciata e
    # vincolante; il ritorno percorre la stessa via.
    # ponteggi solo se TUTTI reggono il vuoto: la catena e' forte quanto
    # l'anello debole (un tavolo vero non porta il compagno da NERVI 0 sulle
    # tavole a sbalzo)
    nervi_medi = sum(HERO[n]['nervi'] for n in party) / len(party)
    via_ponteggi = min(HERO[n]['nervi'] for n in party) >= 2
    if via_ponteggi:
        ramo = ['T3P (I Ponteggi di Ponente)', 'T4P (Il Castello di Tavole)']
    else:
        ramo = ['T3I (L’Intercapedine di Levante)', 'T4I (Il Vano delle Canne Morte)',
                'T5I (La Scala di Servizio)']
    log(f'La via scelta (media NERVI {nervi_medi:.1f}): '
        f'{"i PONTEGGI (corta, esposta)" if via_ponteggi else "le INTERCAPEDINI (lunga, sorda)"}.')
    path = ['T2 (Il Piano Terra)'] + ramo + ['T6 (L’Intercapedine del Terzo Piano)']
    round_n = 0
    esito = None

    def aggiungi_canto(cura_custode=False):
        """Aggiunge 1 segnalino Canto (l'ALLARME del cantiere) e applica la
        soglia: pesca extra per sempre. Il Capocantiere NON si desta via
        Canto (e' di copione, a T6) e NON recupera ferite (e' un uomo):
        `cura_custode` qui significa solo "si attiva subito"."""
        nonlocal canto, custode, custode_stunned, pool_esauriti_totale, canto_bonus_carte, round_custode_svegliato
        canto += 1
        log(f'    Segnalino Canto (Allarme): {canto}.')
        if canto >= SOGLIA_SBARRAMENTO:
            log(f'    L’Allarme raggiunge {SOGLIA_SBARRAMENTO}: il cantiere si SBARRA — '
                'portoni chiusi, squadre ovunque. Fava resta dentro.')
            sbarrato[0] = True
        if canto >= SOGLIA_CANTO and not canto_bonus_carte:
            canto_bonus_carte = True
            log(f'    L’Allarme raggiunge {SOGLIA_CANTO}: il cantiere è sveglio — da ora ogni '
                'Fase Minaccia pesca 1 carta in più (fino a fine spedizione).')
        if cura_custode and custode and custode['fer'] > 0 and custode.get('pos') and vivi():
            log('    Il Capocantiere si attiva subito (l’allarme lo chiama).')
            _avvicina_e_attacca(custode, 8)

    def tick_canto():
        """Il secondo orologio (regola vera, MAI simulato prima del
        20260716): alla fine di ogni TICK_CANTO_OGNI-esimo round, +1
        segnalino a prescindere dalle carte pescate."""
        if round_n % TICK_CANTO_OGNI == 0 and vivi():
            log(f'  [OROLOGIO] Fine del {round_n}° round: +1 segnalino Canto automatico.')
            aggiungi_canto(cura_custode=False)

    def fase_minaccia():
        nonlocal canto, custode, custode_stunned, pool_esauriti_totale, canto_bonus_carte, round_custode_svegliato
        base_carte = MINACCIA_FORMULE[formula_minaccia](len(vivi()))
        # Valore x.5 = mezza carta: la carta extra si pesca solo nei round
        # pari (giro 5 di ricalibrazione: il gradino 2->3 carte e' un dirupo
        # da ~30 punti di %vittoria ovunque cada - serve il mezzo passo;
        # precedente di genere: escalation a scatti alla Pandemic).
        n_carte = int(base_carte) + (1 if base_carte % 1 and round_n % 2 == 0 else 0) \
            + (1 if canto_bonus_carte else 0)
        # Fanti: "Diversivo" (2 usi) — semina una falsa pista sui canali e
        # salta una carta Minaccia del round. Euristica: sotto pressione
        # (Canto avviato o dal 3° round) e solo se c'e' almeno una carta da
        # saltare. Consuma una carica.
        fanti = next((x for x in vivi() if ability_uses[x].get('diversivo', 0) > 0), None)
        if fanti and (canto >= 1 or round_n >= 3) and n_carte >= 1:
            ability_uses[fanti]['diversivo'] -= 1
            n_carte -= 1
            log(f'    [ABILITÀ] {fanti} semina un diversivo: una carta Minaccia in meno '
                f'questo round ({ability_uses[fanti]["diversivo"]} usi residui).')
        # Sibilla: "prima della fase Minaccia, guarda le prime 2 carte del
        # mazzo e mettine una in fondo; l'altra torna in cima" (3 usi).
        # Euristica: scruta solo sotto pressione (Canto avviato o dal 3°
        # round) e seppellisce la carta peggiore (crescendo > attivazione
        # immediata > spawn); se nessuna delle due morde, le rimette
        # com'erano senza spendere l'uso — leggera chiaroveggenza a favore
        # degli eroi, dichiarata nel docstring "Fedeltà e limiti".
        sibilla = next((x for x in vivi() if ability_uses[x].get('scruta', 0) > 0), None)
        if sibilla and (canto >= 1 or round_n >= 3) and len(deck) >= 2:
            def gravita(carta):
                return 3 if carta[0] in CRESCENDO else 2 if carta[3] else \
                       1 if carta[0] in CARD_SPAWN else 0
            top1, top2 = deck.pop(), deck.pop()
            peggiore, altra = (top1, top2) if gravita(top1) >= gravita(top2) else (top2, top1)
            if gravita(peggiore) >= 2:
                ability_uses[sibilla]['scruta'] -= 1
                deck.insert(0, peggiore)
                deck.append(altra)
                log(f'    [ABILITÀ] {sibilla} scruta il mazzo: «{peggiore[0]}» finisce in fondo, '
                    f'«{altra[0]}» torna in cima ({ability_uses[sibilla]["scruta"]} usi residui).')
            else:
                deck.append(top2)
                deck.append(top1)
        for _ in range(n_carte):
            c = pesca()
            titolo, testo, tipo, subito = c
            log(f'  [MINACCIA] {titolo} ({tipo}) — {testo[:90]}{"…" if len(testo) > 90 else ""}')
            if titolo in CARD_SPAWN:
                # Regola sorda: la PRIMA carta spawn rivelata in una tessera
                # sorda piazza 1 nemico in meno (qui: nessuno — le carte
                # piazzano 1) e il resto della carta non ha luogo.
                if tile_attuale in TESSERE_SORDE and tile_attuale not in sorde_scontate:
                    sorde_scontate.add(tile_attuale)
                    log('    [TESSERA SORDA] Non vi hanno sentiti: il primo piazzamento qui non ha luogo.')
                    continue
                if titolo == 'LA MAREA DI CERA':
                    # "Tutti i Fonditori in gioco si attivano subito": quelli gia'
                    # piazzati (non il nuovo, che segue la distanza dinamica normale
                    # di IL FONDITORE) diventano adiacenti per questo round.
                    fonditori_esistenti = [e for e in enemies if e['nome'] == 'IL FONDITORE' and e['fer'] > 0]
                    for e in fonditori_esistenti:
                        e['distanza'] = 0
                        if e.get('pos') is None:
                            e['pos'] = porta_attuale_pos  # "si attiva subito": ora e' nella tessera del gruppo
                    if fonditori_esistenti:
                        log(f'    {len(fonditori_esistenti)}x IL FONDITORE già in gioco si attiva subito.')
                subito_attiva, esauriti = spawn_from_card(
                    log, titolo, pool, enemies, round_n, fer_bonus, dan_bonus,
                    tile_id=tile_attuale, porta_pos=porta_attuale_pos,
                    pos_eroi={n: pos[n] for n in vivi()}, occupate=celle_occupate())
                pool_esauriti_totale += esauriti
                if subito_attiva and vivi():
                    e = enemies[-1]
                    log(f'    {e["nome"]} si attiva subito:')
                    _avvicina_e_attacca(e, 8)
                    attivati_extra.add(id(e))
            elif titolo in INSIDIA:
                diff_name, dan, chi = INSIDIA[titolo]
                bersagli = vivi() if 'ogni' in chi else [min(vivi(), key=lambda n: HERO[n]['nervi'])] if vivi() else []
                for b in bersagli:
                    bonus, chi_bonus = voce_ferma_bonus(b)
                    bonus += malus_claque(b)
                    ok, _ = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, bonus,
                                  'con aura Claque' if malus_claque(b) else (f'Voce ferma di {chi_bonus}' if bonus else ''))
                    # Secondo Fiato (Regolamento: 1 solo ritento a episodio per
                    # eroe): speso sulla prima insidia fallita che morde.
                    if not ok and secondo_fiato.get(b):
                        secondo_fiato[b] = False
                        log(f'    [SECONDO FIATO] {b} ritenta la prova (unico ritento dell’episodio):')
                        ok, _ = check(log, b, 'NERVI', HERO[b]['nervi'], diff_name, bonus,
                                      f'Voce ferma di {chi_bonus}' if bonus else '')
                    if not ok:
                        if dan:
                            applica_danno(b, dan, titolo)
                        if titolo in PERDE_AZIONE and b not in down:
                            azioni_perse.add(b)
                            log(f'    {b} avrà 1 sola azione al suo prossimo turno.')
            elif titolo in CRESCENDO:
                aggiungi_canto(cura_custode=True)
            elif titolo in DANNO_DIRETTO:
                if vivi():
                    b = max(vivi(), key=lambda n: pos.get(n, (0, 0))[1])
                    applica_danno(b, 1, titolo)
            elif titolo == 'PRESAGIO':
                log('    Nessun effetto meccanico (tensione).')
            elif titolo == 'ECO AMICA':
                log('    Rivelata una tessera coperta adiacente (nessun effetto in questa astrazione).')
            elif titolo in ('CERA CHE COLA', 'CORRENTE GELIDA'):
                log('    Penalità di Movimento fino al prossimo turno (non modellata nel loop di combattimento).')
            else:
                log('    (carta senza effetto modellato in questa simulazione)')

    def _avvicina_e_attacca(e, difesa):
        """Un nemico con `pos` reale si muove (BFS) fino al suo Movimento
        verso un eroe vivo scelto A CASO (non il piu' vicino: puntare
        sempre al piu' vicino concentra il fuoco su un solo eroe senza che
        gli eroi abbiano contromisure tattiche - IA di posizionamento
        difensivo/protezione non modellata - misurato: crolla la
        %vittoria dal 91% al 50% a 4 eroi. Random.choice tiene la stessa
        distribuzione del danno del vecchio modello astratto, mantenendo
        movimento e posizione reali), poi attacca chi risulta adiacente
        dopo il movimento (non necessariamente il bersaglio scelto, se
        arredi/affollamento deviano il cammino - o un altro eroe gli
        capita comunque adiacente). Se nessuno e' raggiungibile, si
        avvicina soltanto: stesso esito di "colma parte della distanza"
        di prima, ora con una posizione vera invece di uno scalare."""
        vivi_ora = vivi()
        bersaglio = random.choice(vivi_ora)
        nuova = muovi_verso(tile_attuale, e['pos'], pos[bersaglio], e['mov'], celle_occupate(esclusa=e))
        if nuova != e['pos']:
            log(f'  {e["nome"]} si muove verso {bersaglio}: {chess(e["pos"])} -> {chess(nuova)}.')
            e['pos'] = nuova
        gittata = NEMICO.get(e['nome'], {}).get('gittata', 1)
        if gittata > 1:
            # Crogiolante: attacca fino a `gittata` caselle, in linea retta
            adiacenti_ora = [m for m in vivi_ora
                             if (e['pos'][0] == pos[m][0] or e['pos'][1] == pos[m][1])
                             and abs(e['pos'][0] - pos[m][0]) + abs(e['pos'][1] - pos[m][1]) <= gittata]
        else:
            adiacenti_ora = [m for m in vivi_ora if adiacenti(e['pos'], pos[m])]
        if not adiacenti_ora:
            log(f'  {e["nome"]} si avvicina, non ancora a contatto.')
            return
        bersaglio_reale = bersaglio if bersaglio in adiacenti_ora else random.choice(adiacenti_ora)
        log(f'  {e["nome"]} attacca {bersaglio_reale}:')
        if enemy_attack_roll(log, e['nome'], e['att'], bersaglio_reale, difesa):
            applica_danno(bersaglio_reale, e['dan'], e['nome'])
            # Il "suggerimento" (regola del boss): il colpito prova NERVI
            # (Facile) o dice parole non sue - 1 azione in meno.
    def fase_nemici(luogo_label, party_in_transito):
        nonlocal custode_stunned
        # Un nemico ancora astratto (niente `pos`: sta arrivando da fuori
        # tessera, vedi spawn_from_card/CARD_SPAWN dinamici) colma distanza
        # come prima - il gruppo che avanza "guadagna" GUADAGNO_GRUPPO
        # caselle sui nemici piu' lenti (Fonditore, mov 2, resta indietro,
        # come da testo "non corre mai"). Una volta arrivato (`pos` reale)
        # si muove e attacca con la griglia vera: l'astrazione di guadagno
        # non serve piu', il movimento del gruppo e' gia' quello reale di
        # fase_eroi.
        guadagno = GUADAGNO_GRUPPO if party_in_transito else 0
        for e in list(enemies):
            if e['fer'] <= 0 or not vivi():
                continue
            if id(e) in attivati_extra:
                continue  # gia' mosso/attaccato "subito" in fase_minaccia questo round
            if e in adescati:
                log(f'  {e["nome"]} si dirige verso l’esca (Carbone): non attacca questo round.')
                continue
            if e.pop('salta_flash', False):
                log(f'  {e["nome"]} salta l’attivazione (Flash! di Carla).')
                continue
            if e.get('pos') is None:
                distanza = e.get('distanza', 0)
                if distanza > 0:
                    e['distanza'] = max(0, distanza + guadagno - e['mov'])
                    if e['distanza'] > 0:
                        log(f'  {e["nome"]} si avvicina (Movimento {e["mov"]}): ancora '
                            f'{e["distanza"]} caselle prima di raggiungere la tessera del gruppo.')
                        continue
                cella = cella_libera_vicino(tile_attuale, porta_attuale_pos, celle_occupate())
                if cella is None:
                    log(f'  {e["nome"]} arriva alla porta ma la tessera è piena: resta in coda fuori tessera.')
                    continue
                log(f'  {e["nome"]} raggiunge la tessera del gruppo, da {chess(cella)}.')
                e['pos'] = cella
            _avvicina_e_attacca(e, 8)
        adescati.clear()
        if custode and custode['fer'] > 0 and vivi():
            if custode_stunned:
                log(f'  {custode["nome"]} salta l’attivazione (stonato).')
                custode_stunned = False
                return
            if custode.pop('salta_flash', False):
                log(f'  {custode["nome"]} salta l’attivazione (Flash! di Carla).')
                return
            if custode.get('pos') is None:
                # Svegliato in anticipo dal Canto (vedi fase_minaccia): parte "sulla
                # tessera piu' lontana dagli eroi" (regola vera), quindi deve
                # colmare distanza come un nemico qualunque prima di avere una
                # posizione vera. Svegliato a T6 invece ha gia' `pos` dal
                # piazzamento (comportamento invariato).
                c_distanza = custode.get('distanza', 0)
                if c_distanza > 0:
                    custode['distanza'] = max(0, c_distanza + guadagno - custode['mov'])
                    if custode['distanza'] > 0:
                        log(f'  {custode["nome"]} si avvicina (Movimento {custode["mov"]}): ancora '
                            f'{custode["distanza"]} caselle prima di raggiungere la tessera del gruppo.')
                        return
                cella = cella_libera_vicino(tile_attuale, porta_attuale_pos, celle_occupate())
                if cella is None:
                    log(f'  {custode["nome"]} arriva alla porta ma la tessera è piena: resta in coda fuori tessera.')
                    return
                log(f'  {custode["nome"]} raggiunge la tessera del gruppo, da {chess(cella)}.')
                custode['pos'] = cella
            _avvicina_e_attacca(custode, 8)

    def fase_eroi(luogo_label):
        nonlocal chiave, tobia_libero, custode, custode_stunned, canto, voce_ferma_scade_round
        for n in vivi():
            h = HERO[n]
            # Effetto insidia del round scorso: 1 sola azione (muoversi O
            # agire). Modellato sui due rami con movimento+azione (attacco,
            # rianimare): se non gia' adiacente al bersaglio, il turno si
            # spende solo ad avvicinarsi. I rami abilita' sono gia' una sola
            # azione e restano leciti.
            sola_azione = n in azioni_perse
            azioni_perse.discard(n)
            if sola_azione:
                log(f'    {n} ha 1 sola azione questo turno (insidia del round scorso).')
            # Attaccare in mischia richiede un nemico adiacente (regola vera): un
            # nemico ancora astratto (niente `pos`, sta colmando la distanza da
            # fuori tessera - vedi fase_nemici) non e' un bersaglio valido, solo
            # per abilita' "in vista" (Esca preziosa, Malacarne, sotto) che
            # restano sugli `enemies` grezzi.
            bersagli_vivi = [e for e in enemies if e['fer'] > 0 and e.get('pos') is not None]
            if custode and custode['fer'] > 0 and custode.get('pos') is not None:
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
                # sorted(): 'down' e' un set - senza ordine stabile il pareggio
                # su min() dipende da PYTHONHASHSEED e il run non e' riproducibile
                # tra processi diversi a parita' di seed (scoperto il 20260716).
                feriti = [m for m in vivi() if salute[m] < salute_max[m]] + sorted(down)
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
            # Carla: Flash! (2 usi, azione) - un nemico entro 2 caselle salta
            # la sua prossima attivazione. Euristica: solo su bersagli che
            # picchiano forte (Danno >= 2: Fonditore, Custode) - su uno
            # Sgherro da 1 danno l'azione vale meno di un attacco.
            if ability_uses[n].get('flash', 0) > 0:
                candidati_flash = [e for e in bersagli_vivi if not e.get('salta_flash')
                                   and e['dan'] >= 2
                                   and abs(e['pos'][0] - pos[n][0]) + abs(e['pos'][1] - pos[n][1]) <= 2]
                if candidati_flash:
                    bersaglio_f = max(candidati_flash, key=lambda e: (e['dan'], e['fer']))
                    ability_uses[n]['flash'] -= 1
                    bersaglio_f['salta_flash'] = True
                    log(f'    [ABILITÀ] {n} usa Flash! su {bersaglio_f["nome"]}: accecato, salta '
                        f'la sua prossima attivazione ({ability_uses[n]["flash"]} usi residui).')
                    continue
            # Solo i nemici con un cammino vero fino a loro sono bersagli validi
            # (bug: con una tessera affollata a 8-10 eroi, TUTTI i bersagli
            # potevano risultare irraggiungibili e l'eroe li "inseguiva"
            # comunque all'infinito invece di ripiegare su Rianimare/Cercare -
            # vedi stallo osservato in sessione 20260715-stress-tattico-kpi).
            raggiungibili = [e for e in bersagli_vivi
                              if cammino(tile_attuale, pos[n], e['pos'], celle_occupate(esclusa=n))]
            if raggiungibili:
                # Movimento reale: si avvicina al nemico piu' vicino (a parita'
                # di cammino, il piu' debole - finire chi e' quasi abbattuto
                # prima di aprirne un altro), poi attacca solo se ADESSO e'
                # adiacente. Su una tessera piccola questo quasi sempre riesce
                # in un'unica azione; se arredi/affollamento lo impediscono,
                # il round si spende tutto nell'avvicinamento (nessun attacco).
                obiettivo = min(raggiungibili, key=lambda e: (
                    len(cammino(tile_attuale, pos[n], e['pos'], celle_occupate(esclusa=n))), e['fer']))
                if sola_azione and not any(adiacenti(pos[n], e['pos']) for e in bersagli_vivi):
                    sposta_verso(n, tile_attuale, obiettivo['pos'], obiettivo['nome'])
                    log(f'    {n} (1 sola azione) si limita ad avvicinarsi a {obiettivo["nome"]}.')
                    continue
                if not sposta_verso(n, tile_attuale, obiettivo['pos'], obiettivo['nome']):
                    log(f'    {n} si avvicina a {obiettivo["nome"]}, non ancora a contatto.')
                    continue
                adiacenti_ora = [e for e in bersagli_vivi if adiacenti(pos[n], e['pos'])]
                bersaglio_e = min(adiacenti_ora, key=lambda e: e['fer'])
                if attack_roll(log, n, h['vigore'], armed[n], bersaglio_e['nome'], bersaglio_e['dif']):
                    bersaglio_e['fer'] -= 1
                    log(f'    {bersaglio_e["nome"]}: {max(bersaglio_e["fer"], 0)}/{bersaglio_e["fer_max"]} ferite residue.')
                    if bersaglio_e['fer'] <= 0:
                        log(f'    {bersaglio_e["nome"]} è ABBATTUTO.')
                        if bersaglio_e is custode:
                            log('    *** IL CAPOCANTIERE È A TERRA: la squadra ha perso il direttore. ***')
                        else:
                            urlo_voce_cava(bersaglio_e)
                            # La miniatura torna disponibile (si toglie dal tavolo, non
                            # si consuma): senza questo il pool sembrava esaurirsi molto
                            # piu' spesso di quanto accada davvero al tavolo fisico -
                            # bug trovato confrontando i numeri round 1 vs round 2.
                            pool[bersaglio_e['nome']] += 1
                        if bersaglio_e is not custode and ability_uses[n].get('cleave_per_turno'):
                            altri = [e for e in enemies
                                     if e is not bersaglio_e and e['fer'] > 0 and e.get('pos') is not None
                                     and adiacenti(pos[n], e['pos'])]
                            if altri:
                                extra = altri[0]
                                log(f'    [ABILITÀ] {n} usa Colpo da macello: attacco extra su {extra["nome"]}.')
                                if attack_roll(log, n, h['vigore'], armed[n], extra['nome'], extra['dif']):
                                    extra['fer'] -= 1
                                    log(f'    {extra["nome"]}: {max(extra["fer"], 0)}/{extra["fer_max"]} ferite residue.')
                                    if extra['fer'] <= 0:
                                        log(f'    {extra["nome"]} è ABBATTUTO.')
                                        urlo_voce_cava(extra)
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
                bersaglio_down = min(sorted(down), key=lambda m: len(
                    cammino(tile_attuale, pos[n], pos[m], celle_occupate(esclusa=n))) or 99)
                if sola_azione and not adiacenti(pos[n], pos[bersaglio_down]):
                    sposta_verso(n, tile_attuale, pos[bersaglio_down], bersaglio_down)
                    log(f'    {n} (1 sola azione) si avvicina a {bersaglio_down}: rianimerà al prossimo turno.')
                    continue
                if not sposta_verso(n, tile_attuale, pos[bersaglio_down], bersaglio_down):
                    log(f'    {n} si avvicina a {bersaglio_down} per rianimarlo, non ancora a contatto.')
                    continue
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

    porta_attuale_pos = None  # cella (gx,gy) della porta d'ingresso della tessera corrente
    tappa_prec = None
    for tappa in path:
        # ROUND DI MARCIA: il gruppo non salta piu' da una tessera all'altra a
        # costo zero. Col Movimento 3 attraversare una tessera costa in genere
        # 2 round, e ogni round in piu' e' una Fase Minaccia in piu'.
        for _ in range(round_di_marcia(tile_attuale, tappa.split()[0], porta_attuale_pos) - 1):
            round_n += 1
            attivati_extra.clear()
            log(f'--- Round {round_n}: il gruppo attraversa {tile_attuale} '
                f'verso {tappa.split()[0]} ---')
            log_azioni_round()
            fase_eroi(tappa_prec or tappa)
            fase_minaccia()
            fase_nemici(tappa_prec or tappa, True)
            tick_canto()
            max_down_simultanei = max(max_down_simultanei, len(down))
            if not vivi():
                esito = 'SCONFITTA (party wipe in marcia)'
                break
        if esito:
            break
        round_n += 1
        attivati_extra.clear()
        log(f'--- Round {round_n}: il gruppo raggiunge {tappa} ---')
        log_azioni_round()
        tappa_prec = tappa
        tile_id = tappa.split()[0]
        if tile_id != tile_attuale:
            porta_attuale_pos = porta_ingresso(tile_id, tile_attuale or 'T1')
            for n in vivi():
                pos[n] = porta_attuale_pos
            tile_attuale = tile_id
            log(f'    Il gruppo entra in {tile_id} da {chess(porta_attuale_pos)}.')
        if tile_id in ('T3P', 'T4P'):
            # I ponteggi: prova NERVI (Media) per OGNI eroe a ogni ingresso
            # in tessera; chi fallisce perde 1 azione (vertigine). Vale
            # anche al ritorno (stessa via).
            for n in vivi():
                bonus, chi_bonus = voce_ferma_bonus(n)
                ok, _ = check(log, n, 'NERVI', HERO[n]['nervi'], 'Media', bonus,
                              f'Voce ferma di {chi_bonus}' if bonus else '')
                if not ok and secondo_fiato.get(n):
                    secondo_fiato[n] = False
                    log(f'    [SECONDO FIATO] {n} ritenta la prova (unico ritento dell’episodio):')
                    ok, _ = check(log, n, 'NERVI', HERO[n]['nervi'], 'Media', bonus,
                                  f'Voce ferma di {chi_bonus}' if bonus else '')
                if not ok:
                    azioni_perse.add(n)
                    log(f'    {n}: il vuoto tira, le tavole ballano — 1 sola azione al prossimo turno.')
        if tile_id in TESSERE_SORDE:
            log('    Tessera SORDA: ogni aiuto tra eroi richiede adiacenza (già regola base '
                'del motore); la prima carta spawn qui non piazzerà nessuno.')
        if tile_id in ('T4P', 'T5I') and 'ritorno' not in tappa:
            # la ronda di meta' salita (stampata sulle tessere): 1 Sicario
            log('    QUANDO RIVELATE: un Sicario di ronda — la lanterna schermata si gira.')
            if pool['IL SICARIO'] > 0:
                pool['IL SICARIO'] -= 1
                base = NEMICO['IL SICARIO']
                s_fer = base['fer'] + fer_bonus
                cella = cella_libera_vicino(tile_id, (2, 2), celle_occupate())
                enemies.append(dict(nome='IL SICARIO', fer=s_fer, fer_max=s_fer,
                                     dif=base['dif'], att=base['att'], dan=base['dan'] + dan_bonus,
                                     mov=base['mov'], pos=cella))
        if tappa.startswith('T6') and custode is None:
            log('    Rivelata l’Intercapedine del Terzo Piano: Fava legato tra i sacchi — '
                'e la Squadra del Silenzio posa le carte da gioco.')
            c_fer = CUSTODE['fer'] + fer_bonus + custode_extra_fer
            c_pos = cella_libera_vicino(tile_id, (2, 1) if (2, 1) not in _arredi('T6')
                                        else porta_attuale_pos, celle_occupate())
            custode = dict(CUSTODE, fer=c_fer, fer_max=c_fer, dan=CUSTODE['dan'] + dan_bonus,
                           pos=c_pos or porta_attuale_pos)
            # scorta: 2 Sgherri, +1 ogni 4 eroi oltre il quarto
            n_scorta = 2 + len(party) // 4  # 2 Sgherri +1 ogni 4 eroi (per difetto)
            if indagine.get('chi_confermato'):
                custode_stunned = True
                n_scorta -= 1
                log('    [SMASCHERATO — D2] «VOLTAN!» — il Capocantiere esita (salta la sua '
                    'prima attivazione) e 1 Sgherro posa gli attrezzi e se ne va.')
            occ_t6 = celle_occupate() | {custode['pos']}
            for _ in range(max(0, n_scorta)):
                if pool['LO SGHERRO'] <= 0:
                    pool_esauriti_totale += 1
                    break
                pool['LO SGHERRO'] -= 1
                base = NEMICO['LO SGHERRO']
                a_fer = base['fer'] + fer_bonus
                libere = [c for c in _vicini(custode['pos'])
                          if c not in occ_t6 and c not in _arredi('T6')]
                a_pos = libere[0] if libere else porta_attuale_pos
                occ_t6.add(a_pos)
                enemies.append(dict(nome='LO SGHERRO', fer=a_fer, fer_max=a_fer,
                                     dif=base['dif'], att=base['att'], dan=base['dan'] + dan_bonus,
                                     mov=base['mov'], distanza=0, pos=a_pos))
            log('    Fava si libera con Interagire (nessuna prova): si muove col gruppo (Mov 3).')
            tobia_libero = True
        fase_eroi(tappa)
        fase_minaccia()
        fase_nemici(tappa, True)
        tick_canto()
        max_down_simultanei = max(max_down_simultanei, len(down))
        if not vivi():
            esito = 'SCONFITTA (party wipe)'
            break
        if sbarrato[0]:
            esito = 'SCONFITTA (il cantiere si sbarra: Fava resta dentro)'
            break
        if round_n > 60:
            esito = 'TIMEOUT (60 round, simulazione interrotta)'
            break

    if esito is None:
        log(f'--- Ritorno a T1 per la via dell’andata '
            f'({"i ponteggi" if via_ponteggi else "le intercapedini"}): la squadra insegue ---')
        tratti = list(reversed(ramo)) + ['T2 (Il Piano Terra)', 'T1 (Il Cancello)']
        idx_tratto = 0
        while idx_tratto < len(tratti):
            tratto = tratti[idx_tratto]
            round_n += 1
            attivati_extra.clear()
            tratto_id = tratto.split()[0]
            log(f'--- Round {round_n}: rientro — {tratto} ---')
            log_azioni_round()
            if tratto_id in ('T3P', 'T4P'):
                for n in vivi():
                    bonus, chi_bonus = voce_ferma_bonus(n)
                    ok, _ = check(log, n, 'NERVI', HERO[n]['nervi'], 'Media', bonus,
                                  f'Voce ferma di {chi_bonus}' if bonus else '')
                    if not ok and secondo_fiato.get(n):
                        secondo_fiato[n] = False
                        log(f'    [SECONDO FIATO] {n} ritenta la prova (unico ritento dell’episodio):')
                        ok, _ = check(log, n, 'NERVI', HERO[n]['nervi'], 'Media', bonus,
                                      f'Voce ferma di {chi_bonus}' if bonus else '')
                    if not ok:
                        azioni_perse.add(n)
                        log(f'    {n}: il vuoto tira anche in discesa — 1 sola azione al prossimo turno.')
            # La squadra insegue; sui ponteggi chi arbitra tira UNA prova per
            # la squadra: fallita, resta indietro di un round (regola stampata).
            insegue = True
            if tratto_id in ('T3P', 'T4P'):
                a, b = random.randint(1, 6), random.randint(1, 6)
                if a + b + 2 < 9:
                    insegue = False
                    log(f'    La squadra esita sulle tavole (2d6({a},{b})+2 < 9): resta indietro un round.')
            fase_eroi('rientro')
            fase_minaccia()
            if insegue:
                fase_nemici('rientro', True)
            else:
                log('    (la squadra non attacca questo round: è rimasta indietro)')
            tick_canto()
            max_down_simultanei = max(max_down_simultanei, len(down))
            if not vivi():
                esito = 'SCONFITTA (party wipe durante il rientro)'
                break
            if sbarrato[0]:
                esito = 'SCONFITTA (il cantiere si sbarra: Fava resta dentro)'
                break
            # Aggancio (regola stampata): col Capocantiere ADIACENTE a un
            # eroe, o 3+ della squadra adiacenti, a fine round il gruppo
            # non avanza di un tratto — sganciatevi o abbatteteli.
            boss_addosso = (custode and custode['fer'] > 0 and custode.get('pos')
                            and any(adiacenti(custode['pos'], pos[m]) for m in vivi()))
            truppa_addosso = sum(1 for e in enemies if e['fer'] > 0 and e.get('pos')
                                 and any(adiacenti(e['pos'], pos[m]) for m in vivi()))
            if (boss_addosso and not custode_stunned) or truppa_addosso >= 3:
                log('    La squadra vi SBARRA la strada: questo round non si avanza.')
            else:
                idx_tratto += 1
            if round_n > 60:
                esito = 'TIMEOUT (60 round: la squadra non molla)'
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
    log(f'Via scelta: {"i ponteggi" if via_ponteggi else "le intercapedini"} | '
        f'Capocantiere: {"abbattuto" if custode and custode["fer"] <= 0 else "in piedi"}')
    for n in party:
        stato = 'a terra' if n in down else f'{max(salute[n], 0)}/{salute_max[n]} Salute'
        log(f'  {n}: {stato}')
    log('=' * 78)
    return dict(esito=esito, round_n=round_n, salute_finale=dict(salute), down=list(down),
                via_ponteggi=via_ponteggi,
                formula_minaccia=formula_minaccia, nemico_scale=nemico_scale, pool_extra=pool_extra,
                azioni_media=azioni_media, azioni_max=azioni_max,
                rimescolamenti_mazzo=rimescolamenti_mazzo, pool_esauriti_totale=pool_esauriti_totale,
                round_custode_svegliato=round_custode_svegliato,
                canto_finale=canto, max_down=max_down_simultanei,
                custode_ingaggiato=custode is not None)


def esegui_run(nome_run, party, seed, formula_minaccia='standard', indagine_2gruppi=None,
               nemico_scale='nessuna', pool_extra=False, ind_log=None, sped_log=None,
               esplora_a_fondo=False):
    """`indagine_2gruppi`: None = Indagine normale (1 gruppo, regola vera).
    True/False = diagnostica 2 sottogruppi, valore = orologio_condiviso.
    `esplora_a_fondo`: euristica "thorough" (KPI round) - non chiude
    l'Indagine appena il nucleo garantito e' in mano, continua a visitare
    nuovi luoghi finche' ci sono ore/candidati. Serve a testare la via
    "approfondita" del nuovo Vantaggio (6+ luoghi = SLANCIO anche a 0 ore
    avanzate), altrimenti l'euristica di default non la sceglierebbe mai.
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
        indagine = simula_indagine(party, ind_log, esplora_a_fondo=esplora_a_fondo)
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
                  pool_extra=False, esplora_a_fondo=False):
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
                        nemico_scale, pool_extra, ind_log, sped_log, esplora_a_fondo)
        risultati.append(r)

    n = len(risultati)
    sp_list = [r['spedizione'] for r in risultati]
    ind_list = [r['indagine'] for r in risultati]
    pct_custode_anticipo = sum(1 for sp in sp_list if sp['round_custode_svegliato']) / n * 100
    media_pool_esauriti = sum(sp['pool_esauriti_totale'] for sp in sp_list) / n
    max_pool_esauriti = max(sp['pool_esauriti_totale'] for sp in sp_list)
    media_round = sum(sp['round_n'] for sp in sp_list) / n
    media_eroi_terra = sum(len(sp['down']) for sp in sp_list) / n
    pct_vittoria = sum(1 for sp in sp_list if sp['esito'] == 'VITTORIA') / n * 100
    # Proxy KPI (giocabilita'/ansia/coinvolgimento/immersione, vedi round KPI):
    # una vittoria e' "sofferta" se nel suo picco peggiore almeno un eroe era
    # a terra - misura "partite in bilico" (ansia buona), da distinguere
    # dalle vittorie mai in discussione (ansia zero) e dalle sconfitte.
    vittorie = [sp for sp in sp_list if sp['esito'] == 'VITTORIA']
    pct_vittoria_sofferta = (sum(1 for sp in vittorie if sp['max_down'] >= 1) / len(vittorie) * 100
                             if vittorie else 0)
    media_max_down = sum(sp['max_down'] for sp in sp_list) / n
    media_canto_finale = sum(sp['canto_finale'] for sp in sp_list) / n
    media_ore_avanzate = sum(i['ore_avanzate'] for i in ind_list) / n
    media_luoghi_visitati = sum(len(i['visitati']) for i in ind_list) / n
    pct_chi_confermato = sum(1 for i in ind_list if i['chi_confermato']) / n * 100
    pct_diapason = sum(1 for i in ind_list if i.get('libretto')) / n * 100
    pct_canna = sum(1 for i in ind_list if i.get('pianta')) / n * 100
    pct_d3 = sum(1 for i in ind_list if i.get('d3_ok')) / n * 100
    return dict(nome=nome_base, party=party, n_seed=n, formula_minaccia=formula_minaccia,
                nemico_scale=nemico_scale, pool_extra=pool_extra,
                pct_custode_anticipo=pct_custode_anticipo, media_pool_esauriti=media_pool_esauriti,
                max_pool_esauriti=max_pool_esauriti, media_round=media_round,
                media_eroi_terra=media_eroi_terra, pct_vittoria=pct_vittoria,
                pct_vittoria_sofferta=pct_vittoria_sofferta, media_max_down=media_max_down,
                media_canto_finale=media_canto_finale, media_ore_avanzate=media_ore_avanzate,
                media_luoghi_visitati=media_luoghi_visitati, pct_chi_confermato=pct_chi_confermato,
                pct_diapason=pct_diapason, pct_canna=pct_canna, pct_d3=pct_d3)


# Roster completo (11) e sottoinsiemi per i playtest diagnostici a 8/10
# eroi (vedi piano "portare il gioco a 10 giocatori" - riusa l'11 esistente,
# nessun eroe nuovo). PARTY_10 tiene CARLA DOSTI di riserva (1 eroe su 11,
# ora che il tetto "massimo cinque in tavola" e' stato tolto - vedi
# Regolamento, "ne scendono in tavola tanti quanti siete, fino a dieci").
# PARTY_8 toglie anche Nino (nessun Approfondimento in Indagine) e Padre
# Marani (idem) per un secondo punto dati a copertura piu' bassa.
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
                              pool_extra=False, seed_base=90000, esplora_a_fondo=False):
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
                          formula, scale, pool_extra, esplora_a_fondo)
        per_party.append(b)

    def media(chiave):
        return sum(b[chiave] for b in per_party) / n_party

    return dict(nome=nome_base, size=size, formula_minaccia=formula, nemico_scale=scale,
                n_party=n_party, n_seed=n_seed,
                pct_custode_anticipo=media('pct_custode_anticipo'),
                media_pool_esauriti=media('media_pool_esauriti'),
                max_pool_esauriti=max(b['max_pool_esauriti'] for b in per_party),
                media_round=media('media_round'), media_eroi_terra=media('media_eroi_terra'),
                pct_vittoria=media('pct_vittoria'),
                pct_vittoria_sofferta=media('pct_vittoria_sofferta'),
                media_max_down=media('media_max_down'),
                media_canto_finale=media('media_canto_finale'),
                media_ore_avanzate=media('media_ore_avanzate'),
                media_luoghi_visitati=media('media_luoghi_visitati'),
                pct_chi_confermato=media('pct_chi_confermato'),
                pct_diapason=media('pct_diapason'),
                pct_canna=media('pct_canna'), pct_d3=media('pct_d3'),
                per_party=per_party)


def sessione_curva():
    """Curva completa 2-10 dell'Episodio 7, config di produzione riusata.
    Seed 670000+ (mai usati altrove)."""
    os.makedirs(LOG_DIR, exist_ok=True)
    risultati = []
    for size in (2, 3, 4, 5, 6, 7, 8, 9, 10):
        nome = f'ep7-{size:02d}'
        print(f'Eseguo {nome} (5 party x 30 seed)...')
        m = esegui_batch_multi_party(nome, size, 'finale_v3', 'nessuna',
                                      n_party=5, n_seed=30, seed_base=670000 + size * 1000)
        risultati.append(m)

    path = os.path.join(LOG_DIR, 'riepilogo_ep7.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# Episodio 7 — curva 2-10, config di produzione riusata\n\n')
        f.write(f'Generato: {datetime.now().isoformat(timespec="seconds")}\n\n')
        f.write(f'finale_v3 + CUSTODE_TENSIONE_EXTRA {CUSTODE_TENSIONE_EXTRA} + SALUTE_BONUS_PER_N '
                f'{SALUTE_BONUS_PER_N}; TICK_CANTO_OGNI={TICK_CANTO_OGNI}, SOGLIA_CANTO={SOGLIA_CANTO}. '
                'Seed 670000+size*1000.\n\n')
        f.write('| Taglia | % Vittoria | % Vitt. sofferte | Picco a terra | '
                'Canto finale | Round medi | % Boss anticipo | Pool esauriti |\n')
        f.write('|---|---|---|---|---|---|---|---|\n')
        for m in risultati:
            f.write(f'| {m["size"]} | {m["pct_vittoria"]:.0f}% | '
                    f'{m["pct_vittoria_sofferta"]:.0f}% | {m["media_max_down"]:.1f} | '
                    f'{m["media_canto_finale"]:.1f} | {m["media_round"]:.1f} | '
                    f'{m["pct_custode_anticipo"]:.0f}% | {m["media_pool_esauriti"]:.1f} |\n')
    print(f'\nCurva Episodio 7 fatta. Riepilogo in {path}')


if __name__ == '__main__':
    sessione_curva()
