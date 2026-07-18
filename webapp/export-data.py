# -*- coding: utf-8 -*-
"""Ombre su Roccamora - export dati di gioco per la webapp (webapp/data/).

I moduli del repo restano la fonte di verita' (gen_cards, gen_preludio,
gen_ep2, gen_mappa, gen_bestiario, simulate_playtest per le costanti di
regola): questo script li serializza in JSON per la webapp. Va rilanciato
dopo ogni modifica ai dati (build-all lo fa).

Le carte Minaccia (flavor+effetto+arte) vivono in cards-data.js: le esporta
il gemello export-data.js (node), stessa cartella di output.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
OUT = os.path.join(ROOT, 'webapp', 'data')
os.makedirs(OUT, exist_ok=True)

from gen_cards import HEROES, LUOGHI, TILES, NEMICI, OGGETTI, ESAMI_CARBONE  # noqa: E402
import story  # noqa: E402
story.apply(LUOGHI, TILES, NEMICI, HEROES, [])
from gen_preludio import (LUOGHI_P, TESSERE_P, MAZZO_P, OGGETTI_LUOGO_P, LETTERA_P,  # noqa: E402
                          ESAMI_CARBONE_P)
from gen_ep2 import (LUOGHI_2, TILES_2, NEMICI_2, OGGETTI_LUOGO_2, LETTERA_2,  # noqa: E402
                     ESAMI_CARBONE_2)
from gen_ep3 import (LUOGHI_3, TILES_3, NEMICI_3, OGGETTI_LUOGO_3, LETTERA_3,  # noqa: E402
                     ESAMI_CARBONE_3)
from gen_ep4 import (LUOGHI_4, TILES_4, NEMICI_4, OGGETTI_LUOGO_4, LETTERA_4,  # noqa: E402
                     ESAMI_CARBONE_4)
from gen_mappa import VOCI_MAPPA, MAPPE  # noqa: E402
from gen_bestiario import FASCE, BOSS_DELTA, ferite_per_fascia  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, TICK_CANTO_OGNI, SOGLIA_CANTO,  # noqa: E402
                               MINACCIA_FORMULE, CUSTODE_TENSIONE_EXTRA,
                               SALUTE_BONUS_PER_N, TOKEN_POOL_BASE)
from simulate_ep2 import TOKEN_POOL_BASE as POOL_EP2  # noqa: E402
from simulate_ep3 import TOKEN_POOL_BASE as POOL_EP3  # noqa: E402
from simulate_ep4 import TOKEN_POOL_BASE as POOL_EP4  # noqa: E402


def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s or '')


# carte Oggetto consegnate dai luoghi (le tessere T* restano alla
# Spedizione): Ep.1 dalla lista OGGETTI (ref 'L<n>'), gli altri episodi dai
# loro dizionari dedicati
def _titolo(nome):
    minori = {'di', 'del', 'della', 'dei', 'delle', 'la', 'il', 'lo', 'a', 'da', 'in'}
    parole = nome.title().split(' ')
    return ' '.join(w.lower() if w.lower() in minori and i else w
                    for i, w in enumerate(parole))


OGGETTI_LUOGO_1 = {}
for _o in OGGETTI:
    if _o['ref'].startswith('L'):
        OGGETTI_LUOGO_1.setdefault(int(_o['ref'][1:]), []).append(_titolo(_o['nome']))


# Reperti stampabili consegnati dai luoghi (l'indizio dice quale: "Reperto X:
# consegnate ..."): nome file base in <cartella>/reperti/. Fonte visiva:
# scripts/reperti/generate-reperti.js.
REPERTI_LUOGO = {
    'preludio': {'P1': ['Registro delle Consultazioni']},
    'ep1': {1: ['Reperto A - Diario di Ruggero'],
            5: ['Reperto B - Registro delle Consegne'],
            7: ['Reperto C - Fascicolo del 1741']},
    'ep2': {1: ['Reperto A - Taccuino di Collaudo'],
            5: ['Reperto C - Lettera di C.B.'],
            8: ['Reperto B - Registro delle Chiatte']},
    'ep3': {1: ['Reperto A - Registro dei Livelli'],
            4: ['Reperto C - Pagina del Quaderno'],
            6: ['Reperto B - Commissione di C.B.']},
    'ep4': {2: ['Reperto C - Spartito Annotato'],
            5: ['Reperto A - Registro delle Macchine'],
            6: ['Reperto B - Commissione del Notaio']},
}


def luogo_json(L, oggetti_map=None, reperti_map=None):
    req = L.get('req')
    # un luogo con solo vincolo d'orario inverso (`apre`) e' APERTO: niente
    # chiave, lo tiene chiuso l'orologio (engine.luogoVisitabile)
    aperto = req in (None, 'Disponibile dall’inizio') or L.get('apre') is not None
    chiave = L.get('chiave')
    oggetti = (oggetti_map or {}).get(L['n'], [])
    reperti = (reperti_map or {}).get(L['n'], [])
    return dict(
        n=L['n'], nome=L['nome'],   # resa (small-caps lowercase) alla UI
        voce_mappa=L.get('voce_mappa'),
        aperto=aperto,
        requisito=None if aperto else req,
        chiave=list(chiave) if chiave else None,      # ('parola'|'oggetto', valore)
        chiude=L.get('chiude'),
        apre=L.get('apre'),
        art=L.get('art'),
        testo=strip_tags(L.get('testo', '')) or None,  # testo carta (Ep.1 via story)
        indizi=[i for i in (L.get('indizi') or [])],   # html-lite: la webapp rende <b>/<i>
        approfondimenti=[dict(tipo=a['tipo'], soggetto=a.get('soggetto'),
                              testo=a['testo']) for a in (L.get('approfondimenti') or [])],
        oggetti=oggetti,
        reperti=reperti,
    )


def tessera_json(T):
    return dict(
        id=T['id'], nome=T['nome'],
        testo=T.get('testo'),
        cerca=T.get('cerca'), cerca_vuoto=T.get('cerca_vuoto'),
        arbitro=T.get('arbitro'), hook=T.get('hook'),
        exits=T.get('exits'), arredi=T.get('arredi'),
    )


def nemico_json(n):
    return dict(nome=n['nome'], tipo=n.get('tipo'), art=n.get('art'),
                att=n['att'], dif=n['dif'], fer=n['fer'], mov=n['mov'], dan=n['dan'],
                boss=bool(n.get('boss')), gittata=n.get('gittata'),
                bio=n.get('bio_bestiario', n.get('note')),
                ferite_per_fascia=ferite_per_fascia(n))


def _art_eroe(nome):
    """Ritratto in artworks/: primo nome proprio (senza titoli), es.
    'DOTT. LAZZARO SERRA' -> 'Lazzaro.png'."""
    parole = [w for w in nome.split() if w not in ('DOTT.', 'PADRE')]
    return parole[0].strip('“”').capitalize() + '.png'


def eroe_json(h):
    return dict(nome=h['nome'], ruolo=h['ruolo'],
                acume=h['acume'], vigore=h['vigore'], nervi=h['nervi'],
                salute=h['salute'], difesa=h['difesa'],
                abil=h['abil'], equip=h.get('equip'),
                bio=h.get('bio_scheda', h.get('bio', '')),
                art=_art_eroe(h['nome']),
                cariche=INDAGINE_UNLOCK.get(h['nome'], {}))


def oggetto_json(o):
    return dict(nome=o['nome'], ref=o.get('ref'), fonte=o.get('fonte'),
                flavor=o.get('flavor'), effetto=o.get('effetto'),
                rischio=bool(o.get('rischio')))


# --- Regole comuni (config di produzione, vedi bibbia 3-quater) ------------
REGOLE = dict(
    diff=dict(Facile=7, Media=9, Difficile=11),
    tick_canto_ogni=TICK_CANTO_OGNI,
    soglia_canto=SOGLIA_CANTO,
    # pesca Minaccia per taglia: [carte fisse, terza nei round pari (bool)]
    pesca={n: [int(MINACCIA_FORMULE['finale_v3'](n)),
               MINACCIA_FORMULE['finale_v3'](n) % 1 != 0] for n in range(2, 11)},
    boss_delta_per_taglia=CUSTODE_TENSIONE_EXTRA,
    salute_bonus_per_taglia=SALUTE_BONUS_PER_N,
    fasce_bestiario=dict(fasce=FASCE, boss_delta=BOSS_DELTA),
    ore=dict(inizio=18, fine=24),
)

# --- Soluzioni (fonte: gen_docs.soluzione(), gen_preludio.soluzione(),
# gen_ep2.soluzione() - qui in forma strutturata per l'oracolo dell'app) ----
SOLUZIONI = dict(
    ep1=dict(
        domande=[
            dict(q='DOVE è tenuto prigioniero Ruggero?',
                 risposta='Nel Magazzino delle Cere “Dellacqua”, al Canale Basso.',
                 esatta='Conoscete l’ingresso sul retro: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Arrivate allo scoperto: pescate 1 Minaccia extra nel 1° round.'),
            dict(q='CHI guida il Coro Sommerso?',
                 risposta='Bastiano Ferri, il liutaio.',
                 esatta='Vantaggio “Smascherato”: una volta, quando piazzereste Adepti, gridate il suo nome: non vengono piazzati.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUAL È la combinazione a tre cifre del lucchetto?',
                 risposta='3 – 1 – 5.',
                 esatta='Aprite la porta della Banchina senza prove.',
                 sbagliata='Va forzata: ACUME Difficile; ogni fallimento = pescate 1 carta Minaccia.'),
            dict(q='QUALE oggetto è indispensabile portare con voi?',
                 risposta='Il diapason d’argento (Bottega Ferri).',
                 esatta='Lo avete con voi: vedi “Il Custode della Cera”.',
                 sbagliata='Non lo avete. Il Custode conserva Difesa 9.'),
        ],
        boss='IL CUSTODE DELLA CERA',
    ),
    ep2=dict(
        domande=[
            dict(q='DOVE è tenuto Ilario Dossena?',
                 risposta='Nella Fonderia Vecchia, sull’Isola delle Scorie.',
                 esatta='Approdo giusto: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Lato sbagliato dell’isola: la spedizione parte con 1 segnalino Canto in più.'),
            dict(q='CHI ha venduto i pani del Quarantuno?',
                 risposta='Muzio Sartorio, il capomastro.',
                 esatta='“Smascherato”: una volta, quando piazzereste Sgherri o il Sicario, gridate il suo nome: non vengono piazzati.',
                 sbagliata='Nessun effetto.'),
            dict(q='CON COSA si passa lo sbarco senza dare l’allarme?',
                 risposta='Col Contrassegno di Piombo (Molo delle Chiatte).',
                 esatta='Sbarco silenzioso: l’apparizione di T1 non ha luogo.',
                 sbagliata='I 2 Sgherri di T1 appaiono, come da tessera.'),
            dict(q='COSA serve contro ciò che canta là dentro?',
                 risposta='Lo Smorzo di Feltro E il Martello di Collaudo, insieme.',
                 esatta='Un’azione adiacente allo Scoriatore lo stona: Difesa 8→5 e salta la prossima attivazione.',
                 sbagliata='Lo Scoriatore conserva Difesa 8. (La Medaglia del Fonditore è un’esca.)'),
        ],
        boss='LO SCORIATORE',
    ),
    ep3=dict(
        domande=[
            dict(q='DOVE è tenuto il pozzaiolo Tobia Manfredi?',
                 risposta='Nel Pozzo Maestro, sotto la corte del Lavatoio Grande.',
                 esatta='Sapete dove scendere: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Girate a vuoto nei cunicoli: la spedizione parte con 1 segnalino Canto in più.'),
            dict(q='CHI è il Ladro di Voci?',
                 risposta='Mastro Silvano Alcesti, il barbiere.',
                 esatta='“Il nome vero”: quando l’Accordatore appare, chiamatelo per nome — esita, e salta la sua PRIMA attivazione.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUALE dei pozzi murati è il Pozzo Maestro?',
                 risposta='Il terzo della corte del Lavatoio — «il pozzo che non gela mai».',
                 esatta='Scendete dal chiusino giusto: T1 è tranquilla.',
                 sbagliata='Pozzo sbagliato, cunicoli rumorosi: 1 Voce Cava appare in T1 alla rivelazione.'),
            dict(q='COSA portate con voi per passare là sotto?',
                 risposta='LA CANNA MUTA (il reso del lattoniere).',
                 esatta='Portata al petto: nella Galleria delle Eco (T3) nessuna prova.',
                 sbagliata='La Galleria vi sente: prova come da tessera. (Lanterna a Specchio e Rasoio d’Argento sono esche.)'),
        ],
        boss='L’ACCORDATORE',
    ),
    ep4=dict(
        domande=[
            dict(q='DOVE sono tenuti Gaspare e Rocco?',
                 risposta='Nella fossa del contrappeso morto, sotto il palco.',
                 esatta='Scendete dal lato giusto: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Girate nel sottopalco facendo rumore: 1 Claque appare in T1 alla rivelazione.'),
            dict(q='CHI dirige il lavoro notturno?',
                 risposta='Il maestro concertatore Ermete Alboni.',
                 esatta='Alboni fermato in camerino prima della gala: la scorta di Claque in T6 NON appare.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO scatta la «registrazione»?',
                 risposta='Alla gala di sabato, sull’aria del terzo atto.',
                 esatta='Entrate col giusto anticipo: il Canto parte da 0.',
                 sbagliata='Arrivate a spettacolo iniziato: la spedizione parte con 1 segnalino Canto in più.'),
            dict(q='COSA portate là sotto?',
                 risposta='IL LIBRETTO DI GASPARE (l’Archivio degli Spartiti).',
                 esatta='Un’azione adiacente al Suggeritore: Difesa 8→5 e salta la prossima attivazione.',
                 sbagliata='Resta Gaspare in persona, liberato in T5 — rischioso. (Binocolo, Chiave del Tagliafuoco e Maschera sono esche.)'),
        ],
        boss='IL SUGGERITORE',
    ),
    preludio=dict(
        domande=[
            dict(q='DOVE è tenuto Ansaldo?',
                 risposta='Nella Dogana Vecchia, sul canale di ponente.',
                 esatta='Sapete dove sbarcare: nessuna penalità.',
                 sbagliata='Nessuna penalità (è la scuola).'),
            dict(q='COSA cercavano nel palazzo della Società?',
                 risposta='Il FASCICOLO DEL 1741, l’antico dossier della confraternita.',
                 esatta='Lo sapete: M. ve ne parlerà (epilogo).',
                 sbagliata='Nessuna penalità (è la scuola).'),
        ],
        boss=None,
    ),
)

# --- Episodi ---------------------------------------------------------------
episodi = dict(
    preludio=dict(
        id='preludio', titolo='La Prova del Lume',
        sottotitolo='il preludio — la vostra prova d’ammissione',
        cartella='Preludio', ore_budget=6,
        lettera=LETTERA_P,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_P, REPERTI_LUOGO['preludio']) for L in LUOGHI_P],
        oggetti_luogo=OGGETTI_LUOGO_P,
        tessere=[dict(id=t[0], nome=t[1].title(), art=t[2], testo=t[3]) for t in TESSERE_P],
        obiettivo='Liberate Ansaldo (Interagire, in T4) e riportatelo in T1, alla barca.',
        esami_carbone=ESAMI_CARBONE_P,
        mazzo_da_ep1=MAZZO_P,
        pool={'LO SGHERRO': 4, 'IL SICARIO': 2},   # miniature Ep.1 riusate
        marea=dict(ogni=2, soglia=3, effetto='Movimento -1 (minimo 1) per tutti gli eroi.'),
        soluzione=SOLUZIONI['preludio'],
    ),
    ep1=dict(
        id='ep1', titolo='Il Coro Sommerso',
        sottotitolo='episodio 1 — il caso del campanaro scomparso',
        cartella='Episodio 1', ore_budget=6,
        lettera=story.LETTERA2,
        obiettivo='Liberate Ruggero (Interagire, la cella in T6) e riportatelo in T1, alla banchina.',
        esami_carbone=ESAMI_CARBONE,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_1, REPERTI_LUOGO['ep1']) for L in LUOGHI],
        tessere=[tessera_json(T) for T in TILES],
        oggetti=[oggetto_json(o) for o in OGGETTI],
        vantaggio=dict(slancio_ore=3, slancio_luoghi=6, preparati_ore=1, preparati_luoghi=5),
        soluzione=SOLUZIONI['ep1'],
        pool=TOKEN_POOL_BASE,
    ),
    ep2=dict(
        id='ep2', titolo='La voce del bronzo',
        sottotitolo='episodio 2 — i pani del Quarantuno',
        cartella='Episodio 2', ore_budget=6,
        lettera=LETTERA_2,
        obiettivo='Liberate Ilario (Interagire, in T5) e riportatelo in T1, alla chiatta. '
                  'Secondario: le campanelle grezze in T6, una ad azione (Interagire).',
        esami_carbone=ESAMI_CARBONE_2,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_2, REPERTI_LUOGO['ep2']) for L in LUOGHI_2],
        tessere=[tessera_json(T) for T in TILES_2],
        vantaggio=dict(slancio_ore=3, slancio_luoghi=7, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep2'],
        pool=POOL_EP2,
        passerella_due_round=True,
    ),
    ep3=dict(
        id='ep3', titolo='Le voci del pozzo',
        sottotitolo='episodio 3 — il Ladro di Voci',
        cartella='Episodio 3', ore_budget=6,
        lettera=LETTERA_3,
        obiettivo='Liberate Tobia (Interagire, in T6) e riportatelo in T1, alla scala. '
                  'Secondario: le canne-voce in T5, una ad azione (Interagire).',
        esami_carbone=ESAMI_CARBONE_3,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_3, REPERTI_LUOGO['ep3']) for L in LUOGHI_3],
        tessere=[tessera_json(T) for T in TILES_3],
        vantaggio=dict(slancio_ore=3, slancio_luoghi=7, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep3'],
        pool=POOL_EP3,
    ),
    ep4=dict(
        id='ep4', titolo='Il teatro dell’eco',
        sottotitolo='episodio 4 — la conchiglia che ricorda',
        cartella='Episodio 4', ore_budget=6,
        lettera=LETTERA_4,
        obiettivo='Liberate Gaspare e Rocco (Interagire, in T5), disaccordate i 3 pannelli '
                  'della Conchiglia (Interagire, in T6) e riportate tutti in T1. '
                  'Secondario: le lastre di cera incise, una ad azione (Interagire).',
        esami_carbone=ESAMI_CARBONE_4,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_4, REPERTI_LUOGO['ep4']) for L in LUOGHI_4],
        tessere=[tessera_json(T) for T in TILES_4],
        vantaggio=dict(slancio_ore=3, slancio_luoghi=7, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep4'],
        pool=POOL_EP4,
    ),
)

comune = dict(
    eroi=[eroe_json(h) for h in HEROES],
    nemici=[nemico_json(n) for n in NEMICI + NEMICI_2 + NEMICI_3 + NEMICI_4],
    mappa=dict(voci=[dict(nome=v[0], indirizzo=v[1], tag=v[2]) for v in VOCI_MAPPA],
               mappe=[dict(cartella=m[0], sottotitolo=m[1], tags=list(m[2])) for m in MAPPE]),
    regole=REGOLE,
)


def dump(name, obj):
    p = os.path.join(OUT, name)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=True)
    print('ok ->', p)


dump('comune.json', comune)
for k, ep in episodi.items():
    dump(f'{k}.json', ep)
print('OK export dati webapp')
