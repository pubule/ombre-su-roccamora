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
from gen_ep5 import (LUOGHI_5, TILES_5, NEMICI_5, OGGETTI_LUOGO_5, LETTERA_5,  # noqa: E402
                     ESAMI_CARBONE_5)
from gen_ep6 import (LUOGHI_6, TILES_6, NEMICI_6, OGGETTI_LUOGO_6, LETTERA_6,  # noqa: E402
                     ESAMI_CARBONE_6)
from gen_ep7 import (LUOGHI_7, TILES_7, NEMICI_7, OGGETTI_LUOGO_7, LETTERA_7,  # noqa: E402
                     ESAMI_CARBONE_7)
from gen_ep8 import (LUOGHI_8, TILES_8, NEMICI_8, OGGETTI_LUOGO_8, LETTERA_8,  # noqa: E402
                     ESAMI_CARBONE_8)
from gen_mappa import VOCI_MAPPA, MAPPE  # noqa: E402
from gen_bestiario import FASCE, BOSS_DELTA, ferite_per_fascia  # noqa: E402
from simulate_playtest import (INDAGINE_UNLOCK, TICK_CANTO_OGNI, SOGLIA_CANTO,  # noqa: E402
                               MINACCIA_FORMULE, CUSTODE_TENSIONE_EXTRA,
                               SALUTE_BONUS_PER_N, TOKEN_POOL_BASE)
from simulate_ep2 import TOKEN_POOL_BASE as POOL_EP2  # noqa: E402
from simulate_ep3 import TOKEN_POOL_BASE as POOL_EP3  # noqa: E402
from simulate_ep4 import TOKEN_POOL_BASE as POOL_EP4  # noqa: E402
from simulate_ep5 import TOKEN_POOL_BASE as POOL_EP5  # noqa: E402
from simulate_ep6 import TOKEN_POOL_BASE as POOL_EP6  # noqa: E402
from simulate_ep7 import TOKEN_POOL_BASE as POOL_EP7  # noqa: E402
from simulate_ep8 import TOKEN_POOL_BASE as POOL_EP8  # noqa: E402


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
    'ep5': {5: ['Reperto A - Registro di Mola'],
            6: ['Reperto B - Autorizzazione Timbrata'],
            9: ['Reperto C - Diario di Fedele']},
    'ep6': {5: ['Reperto A - Diario di Ferri'],
            7: ['Reperto B - Pianta della Camera'],
            8: ['Reperto C - Schedario della Cripta']},
    'ep7': {5: ['Reperto B - Deposito del Brevetto'],
            6: ['Reperto C - Bolle della Calce'],
            7: ['Reperto A - Taccuino di Fava']},
    'ep8': {5: ['Reperto C - Bolle del Carbone'],
            6: ['Reperto A - Inventario del Tesoro'],
            7: ['Reperto B - Fascicolo del Sequestro']},
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
    ep5=dict(
        domande=[
            dict(q='DOVE si costruisce lo strumento?',
                 risposta='Nella cripta murata dei Battuti, sotto il magazzino comunale.',
                 esatta='Scendete preparati: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Scendete alla cieca: 1 Confratello appare in T1 alla rivelazione.'),
            dict(q='CHI procura le ossa?',
                 risposta='Zaccaria Mola, il becchino-capo.',
                 esatta='Mola fermato al cancello: in T5 due casse sono già in salvo (contano come recuperate).',
                 sbagliata='Nessun effetto.'),
            dict(q='QUALI ossa cercano?',
                 risposta='Solo i confratelli del 1741 — le casse marcate con l’onda.',
                 esatta='In T5 riconoscete le casse giuste a colpo d’occhio.',
                 sbagliata='Ogni cassa in T5 richiede prima una prova ACUME (Media); fallita, l’azione non conta.'),
            dict(q='COSA portate con voi?',
                 risposta='L’ACQUA DEL FONTE (la Parrocchia del Borgo).',
                 esatta='Un’azione adiacente al Salmodiante: Difesa 8→5 e salta la prossima attivazione.',
                 sbagliata='Il Salmodiante conserva Difesa 8. (Crocifisso Spezzato e Olio dei Morti sono esche.)'),
        ],
        boss='IL SALMODIANTE',
    ),
    ep6=dict(
        domande=[
            dict(q='DOVE si compie il rituale?',
                 risposta='Nella Camera delle Tre Acque, sotto la Cattedrale (deduzione d’atto: 5+ incroci = esatta garantita).',
                 esatta='Nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Si scende per tentativi: la spedizione parte con 1 segnalino Canto in più.'),
            dict(q='CHI dirige il rito?',
                 risposta='Bastiano Ferri, il liutaio.',
                 esatta='Lo chiamate per nome sulla soglia della Camera: Ferri salta la sua PRIMA attivazione.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO comincia?',
                 risposta='Alle 3:15, al colmo della marea di sizigia.',
                 esatta='Entrate nella finestra giusta: il Canto parte da 0.',
                 sbagliata='Arrivate a rito avviato: 1 segnalino Canto in più.'),
            dict(q='COSA portate contro il Dormiente?',
                 risposta='LA FORMULA DEL SIGILLO (l’Archivio Capitolare).',
                 esatta='A movimenti spenti, un’azione nella Camera per leggerla: vittoria piena.',
                 sbagliata='Senza Formula niente vittoria piena: solo sfregiare e ritirarsi. (Acqua Benedetta e Reliquia sono esche.)'),
        ],
        boss='BASTIANO FERRI',
    ),
    ep7=dict(
        domande=[
            dict(q='DOVE è tenuto Ernesto Fava?',
                 risposta='Nell’intercapedine del terzo piano del palazzone.',
                 esatta='Sapete dove salire: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Girate il cantiere a tentoni: 1 Sgherro appare in T1 alla rivelazione.'),
            dict(q='CHI vende il silenzio?',
                 risposta='L’ingegner Silvio Voltan, l’autore del brevetto.',
                 esatta='«Smascherato»: in T6 gridate il suo nome — il Capocantiere salta la sua PRIMA attivazione e 1 Sgherro se ne va.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO si entra senza dare l’allarme?',
                 risposta='Alle NOVE, al cambio del guardiano notturno.',
                 esatta='Entrate nella finestra giusta: il Canto (l’Allarme) parte da 0.',
                 sbagliata='Il cancello vi nota: 1 segnalino Canto in più alla partenza.'),
            dict(q='COSA portate con voi?',
                 risposta='LA BOLLA DELLA CALCE (la baracca del cantiere).',
                 esatta='Il carro entra dal cancello senza domande.',
                 sbagliata='Si scavalca la cinta: 1 segnalino Canto in più. (Fischietto e Lettera di Minaccia sono esche.)'),
        ],
        boss='IL CAPOCANTIERE',
    ),
    ep8=dict(
        domande=[
            dict(q='DOVE si rifonde l’oro vecchio?',
                 risposta='Al deposito dell’ansa morta, oltre il molo in disarmo.',
                 esatta='Sapete dove sbarcare: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Girate l’ansa a tentoni: 1 Sgherro appare in T1 alla rivelazione.'),
            dict(q='CHI sta unificando i clan minori?',
                 risposta='La Vedova Bruna, in prima persona.',
                 esatta='Sapete chi comanda: la carta «I clan accorrono» la ignorate una volta.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO passa il prossimo carico?',
                 risposta='Giovedì notte, col carro del carbone.',
                 esatta='Arrivate prima del carico: il Canto (la Voce che gira) parte da 0.',
                 sbagliata='Il molo è già in fermento: 1 segnalino Canto in più alla partenza.'),
            dict(q='COSA portate con voi per passare le sentinelle?',
                 risposta='IL MARENGO SEGNATO (il Banco di Fossa).',
                 esatta='Le sentinelle vi prendono per corrieri: si entra dal molo senza allarme.',
                 sbagliata='Ci si cala dalla cinta: 1 segnalino Canto in più. (Tessera della Chiatta e Sigillo di Piombo sono esche; chi porta il Marengo attira i Mastini.)'),
        ],
        boss='IL CAMBIAVALUTE',
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
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
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
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
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
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep3'],
        pool=POOL_EP3,
    ),
    ep4=dict(
        id='ep4', titolo='Il teatro dell’eco',
        sottotitolo='episodio 4 — la conchiglia che ricorda',
        cartella='Episodio 4', ore_budget=6,
        lettera=LETTERA_4,
        obiettivo='Liberate Gaspare e Rocco (Interagire, in T5), disaccordate i 3 pannelli '
                  'della Conchiglia (Interagire, in T6) prima del 4° segnalino Canto e '
                  'riportate tutti in T1 — col Suggeritore alle calcagna da T4: abbatterlo '
                  'NON è necessario. Secondario: le lastre di cera incise, una ad azione '
                  '(Interagire).',
        esami_carbone=ESAMI_CARBONE_4,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_4, REPERTI_LUOGO['ep4']) for L in LUOGHI_4],
        tessere=[tessera_json(T) for T in TILES_4],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep4'],
        pool=POOL_EP4,
    ),
    ep5=dict(
        id='ep5', titolo='L’organo di ossa',
        sottotitolo='episodio 5 — la cripta dei Battuti',
        cartella='Episodio 5', ore_budget=6,
        lettera=LETTERA_5,
        obiettivo='Sfregiate le 3 canne montate dell’organo (Interagire, in T6) e risalite '
                  'da T1. Secondario: le casse di ossa in T5, una ad azione (Interagire).',
        esami_carbone=ESAMI_CARBONE_5,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_5, REPERTI_LUOGO['ep5']) for L in LUOGHI_5],
        tessere=[tessera_json(T) for T in TILES_5],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep5'],
        pool=POOL_EP5,
    ),
    ep6=dict(
        id='ep6', titolo='Il Terzo Movimento',
        sottotitolo='episodio 6 — finale dell’Atto I: la notte del rituale',
        cartella='Episodio 6', ore_budget=6,
        lettera=LETTERA_6,
        obiettivo='Spegnete i 3 movimenti — BRONZO (T3, VIGORE), PIETRA (T5, ACUME), OSSA '
                  '(T6, NERVI) — poi nella Camera (T8) leggete la Formula del Sigillo: '
                  'vittoria piena. Vittoria parziale: 2+ movimenti spenti e ritirata a T1.',
        esami_carbone=ESAMI_CARBONE_6,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_6, REPERTI_LUOGO['ep6']) for L in LUOGHI_6],
        tessere=[tessera_json(T) for T in TILES_6],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep6'],
        pool=POOL_EP6,
    ),
    ep7=dict(
        id='ep7', titolo='Il quartiere sordo',
        sottotitolo='episodio 7 — apertura dell’Atto II: la calce che beve il suono',
        cartella='Episodio 7', ore_budget=6,
        lettera=LETTERA_7,
        obiettivo='Liberate Fava (Interagire, in T6) e riportatelo in T1 per la via '
                  'dell’andata (scelta in T2: ponteggi O intercapedini). Il Capocantiere '
                  'non va abbattuto per forza; al 12° segnalino Allarme il cantiere si '
                  'sbarra (sconfitta a tempo).',
        esami_carbone=ESAMI_CARBONE_7,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_7, REPERTI_LUOGO['ep7']) for L in LUOGHI_7],
        tessere=[tessera_json(T) for T in TILES_7],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep7'],
        pool=POOL_EP7,
    ),
    ep8=dict(
        id='ep8', titolo='L’oro vecchio',
        sottotitolo='episodio 8 — Atto II: la Malavita comprata a marenghi del 1741',
        cartella='Episodio 8', ore_budget=6,
        lettera=LETTERA_8,
        obiettivo='Sequestrate le 4 casse d’oro (Interagire, una in T2/T3/T4/T5) e '
                  'portatele alla Porta d’Acqua (T6): 4 casse = vittoria piena, 3 = '
                  'parziale, meno = colpo fallito. Il Cambiavalute è stanziale in T4 e '
                  'FONDE le casse non ancora prese; abbatterlo ferma il crogiolo ma non '
                  'è necessario.',
        esami_carbone=ESAMI_CARBONE_8,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_8, REPERTI_LUOGO['ep8']) for L in LUOGHI_8],
        tessere=[tessera_json(T) for T in TILES_8],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep8'],
        pool=POOL_EP8,
    ),
)

comune = dict(
    eroi=[eroe_json(h) for h in HEROES],
    nemici=[nemico_json(n) for n in NEMICI + NEMICI_2 + NEMICI_3 + NEMICI_4 + NEMICI_5 + NEMICI_6 + NEMICI_7 + NEMICI_8],
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
