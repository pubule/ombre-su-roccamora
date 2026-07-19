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
from gen_ep9 import (LUOGHI_9, TILES_9, NEMICI_9, OGGETTI_LUOGO_9, LETTERA_9,  # noqa: E402
                     ESAMI_CARBONE_9)
from gen_ep10 import (LUOGHI_10, TILES_10, NEMICI_10, OGGETTI_LUOGO_10, LETTERA_10,  # noqa: E402
                      ESAMI_CARBONE_10)
from gen_ep11 import (LUOGHI_11, TILES_11, NEMICI_11, OGGETTI_LUOGO_11, LETTERA_11,  # noqa: E402
                      ESAMI_CARBONE_11)
from gen_ep12 import (LUOGHI_12, TILES_12, NEMICI_12, OGGETTI_LUOGO_12, LETTERA_12,  # noqa: E402
                      ESAMI_CARBONE_12)
from gen_ep13 import (LUOGHI_13, TILES_13, NEMICI_13, OGGETTI_LUOGO_13, LETTERA_13,  # noqa: E402
                      ESAMI_CARBONE_13)
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
from simulate_ep9 import TOKEN_POOL_BASE as POOL_EP9  # noqa: E402
from simulate_ep10 import TOKEN_POOL_BASE as POOL_EP10  # noqa: E402
from simulate_ep11 import TOKEN_POOL_BASE as POOL_EP11  # noqa: E402
from simulate_ep12 import TOKEN_POOL_BASE as POOL_EP12  # noqa: E402
from simulate_ep13 import TOKEN_POOL_BASE as POOL_EP13  # noqa: E402


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
    'ep9': {6: ['Reperto A - Verbale della Ritrattazione'],
            5: ['Reperto B - Parcella dell’Avvocato'],
            8: ['Reperto C - Biglietto di C.B.']},
    'ep10': {3: ['Reperto A - Denuncia di Abbandono'],
             5: ['Reperto B - Libro Mastro della Muratura'],
             8: ['Reperto C - Commessa del Fornitore']},
    'ep11': {1: ['Reperto A - Taccuino delle Misure'],
             3: ['Reperto B - Mappa Parziale'],
             5: ['Reperto C - Commessa del Rilievo']},
    'ep12': {1: ['Reperto A - Perizia dei Sigilli'],
             6: ['Reperto B - Pagina Ricopiata'],
             3: ['Reperto C - Ricevuta del Fermo-Posta']},
    'ep13': {9: ['Reperto A - Filigrana'],
             8: ['Reperto B - Bolla di Transito'],
             7: ['Reperto C - Registro dei Noli']},
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
    ep9=dict(
        domande=[
            dict(q='DOVE è nascosto il teste stanotte?',
                 risposta='Nella sacrestia del Tribunale, dietro l’aula.',
                 esatta='Lo raggiungete per la via sicura: nel 1° round della scorta non si pesca nessuna carta Minaccia.',
                 sbagliata='Lo cercate a tentoni: 1 Sgherro appare in T1 alla rivelazione.'),
            dict(q='CHI paga l’avvocato?',
                 risposta='Un fondo fittizio; il denaro è oro vecchio, la stessa mano dell’ansa morta.',
                 esatta='«Il nome sbagliato»: in T3 ricordate al Sicario Gentile che i mandanti bruciano i sicari — salta la sua PRIMA attivazione.',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO scatta il colpo al teste?',
                 risposta='Stanotte, tra l’una e le tre, nell’intervallo delle ronde comprate.',
                 esatta='Partite nella finestra giusta: il Canto (l’Ora che stringe) parte da 0.',
                 sbagliata='Partite tardi, ronde già ritirate: 1 segnalino Canto in più.'),
            dict(q='COSA portate con voi per la scorta?',
                 risposta='IL SALVACONDOTTO DEL GIUDICE (il Tribunale, entro le 20).',
                 esatta='Alla partenza saltate una tessera d’imboscata (T2/T4/T5).',
                 sbagliata='Le fate tutte. (Tesserino e Lettera di Ranuzzi sono esche; la Mantella e il Fischietto restano armi vere.)'),
        ],
        boss='IL SICARIO GENTILE',
    ),
    ep10=dict(
        domande=[
            dict(q='DOVE è murata la prima moglie?',
                 risposta='Nell’intercapedine dietro la parete della camera al primo piano — quella che detta.',
                 esatta='Andate dritti al vano: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Cercate la parete a tentoni: 1 garzone appare in T1 alla rivelazione.'),
            dict(q='CHI l’ha uccisa?',
                 risposta='Corrado Malfanti, il vedovo, archiviato come «abbandono del tetto coniugale».',
                 esatta='«La casa ha già parlato»: nominate Ada al Muratore — salta il suo PRIMO colpo di demolizione (e il Vedovo in T4 crolla, rimosso).',
                 sbagliata='Nessun effetto.'),
            dict(q='QUANDO torna il Muratore a demolire?',
                 risposta='Stanotte, prima dell’alba, nell’intervallo delle ronde, dalla cantina.',
                 esatta='Arrivate mentre comincia: la traccia DEMOLIZIONE parte da 0.',
                 sbagliata='Arrivate a mazza già in azione: la DEMOLIZIONE parte da 2.'),
            dict(q='COSA portate per fissare la prova?',
                 risposta='LA MACCHINA FOTOGRAFICA (la Bottega del Fotografo, entro le 21).',
                 esatta='Ogni documentazione all’intercapedine vale +2 alla traccia PROVA invece di +1.',
                 sbagliata='Solo testimonianza a voce: +1 per volta, con prova NERVI. (Fede di Rosa e Ferro del Muratore sono esche; Pianta del Restauro salta T2, Ritratto di Ada abbassa le prove NERVI.)'),
        ],
        boss='IL MURATORE',
    ),
    ep11=dict(
        domande=[
            dict(q='DOVE converge la mappatura?',
                 risposta='In un punto sotto la Cattedrale che sulle mappe ufficiali non esiste.',
                 esatta='Sapete già dove tutto punta: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Salite alla cieca: 1 topografo lealista appare in T1 alla rivelazione.'),
            dict(q='CHI ha spinto il topografo dalla Torre?',
                 risposta='Ivo Speranza, il caposquadra, per paura di perdere la commessa.',
                 esatta='Lo affrontate sapendo chi è: alla guglia la cattura riesce anche senza Corda (prova FORZA a Facile invece di Media).',
                 sbagliata='Nessun effetto.'),
            dict(q='IN CHE ORDINE ha preso le ultime misure?',
                 risposta='Fontane, poi campanili, poi la Torre per ultima (il puntamento verso la Cattedrale). Il Taccuino Ordinato: serve più di una conferma (L1 grezzo + L4 marea/accordatura).',
                 esatta='Conoscete la via del boss: il Caposquadra PERDE la scorciatoia sui tetti e avete +1 a tutte le prove NERVI del vento.',
                 sbagliata='Lui taglia per i tetti e vi guadagna terreno (scorciatoia attiva).'),
            dict(q='COSA portate per la via delle guglie?',
                 risposta='LA CORDA DEL CAMPANARO (la Bottega del Cordaio).',
                 esatta='Assicurati (le trappole di caduta T2/T4 non feriscono) e la cattura del Caposquadra a 1 Ferita è automatica.',
                 sbagliata='Trappole feriscono e la cattura richiede una prova FORZA rischiosa (fallita = lo perdete nel vuoto). (Tesserino Perfetto e Colpa del Morto sono esche; Taccuino Ordinato spegne la scorciatoia, Lanterna Cieca leva il buio.)'),
        ],
        boss='IL CAPOSQUADRA',
    ),
    ep12=dict(
        domande=[
            dict(q='DOVE avviene lo scambio?',
                 risposta='Al Cimitero delle Barche, l’approdo delle chiatte morte.',
                 esatta='Sapete dov’è il traguardo: nel 1° round non si pesca nessuna carta Minaccia.',
                 sbagliata='Inseguite alla cieca: 1 bravo della scorta appare in T1.'),
            dict(q='CHI ha copiato i Frammenti?',
                 risposta='Anselmo Godi, il vecchio copista della Società, su ordine autentico.',
                 esatta='Sapete di recuperare una prova, non d’inseguire un ladro: al Cimitero l’aggancio riesce senza contendere il round alla scorta.',
                 sbagliata='Nessun effetto.'),
            dict(q='COME sono uscite dall’archivio?',
                 risposta='Non per effrazione (sigilli intatti): per ordine interno autentico e protocollato. Le porte sono state aperte, non forzate.',
                 esatta='Sapete da dove parte il Corriere e con quale anticipo: la traccia FUGA iniziale è DIMEZZATA.',
                 sbagliata='Inseguite dal punto sbagliato: FUGA iniziale piena. (Il Grimaldello e la Lettera Anonima sono esche: nessuno scasso, nessun confratello traditore.)'),
            dict(q='COSA portate per l’inseguimento?',
                 risposta='IL FISCHIETTO DELLA RONDA (il Corpo di Guardia, entro le 21).',
                 esatta='Ai ponti coperti (T2, T5) tagliate la FUGA / agganciate automaticamente.',
                 sbagliata='Dovete raggiungerlo a forza, quasi impossibile (Mov 5). (Registro dei Ritiri: FUGA iniziale più corta e salta T3; Lanterna Sorda: niente round di nebbia a T4.)'),
        ],
        boss='IL CORRIERE',
    ),
    ep13=dict(
        domande=[
            dict(q='DOVE si produce la carta di pregio?',
                 risposta='Al Molino delle Carte, due ore fuori città: un solo opificio ha quella filigrana.',
                 esatta='Sapete dove finisce la corsa: col Lasciapassare del Nolo saltate lo sbarramento del Cortile (T1) e la sua guardia.',
                 sbagliata='Arrivate al cancello alla cieca: la guardia del Cortile (T1) vi ingaggia.'),
            dict(q='CHI amministra la filiera?',
                 risposta='Il Notaio Rasca, che intesta e paga i noli — appare al Molino e fugge in carrozza.',
                 esatta='Sapete il nome che comanda: al torchio il Sorvegliante esita un round (salta il suo primo attacco).',
                 sbagliata='Nessun effetto. (Il Timbro del Notaio è un’esca: timbro di routine, non lo inchioda.)'),
            dict(q='COSA SAPEVA il capo-catena annegato?',
                 risposta='Che le risme di C.B. viaggiano sulla carrozza del Palazzo del Lume — la deposizione mai resa, ricostruita dai suoi appunti e dal registro dei noli.',
                 esatta='La deposizione è ricostruita (incroci L5+L7): il seme dell’Atto III è saldo, la prova regge in tribunale.',
                 sbagliata='Il filo resta monco: senza la deposizione la prova al torchio vale meno (verso la vittoria parziale).'),
            dict(q='COSA portate al Molino?',
                 risposta='LA CASSETTA STAGNA (il Deposito delle Risme, L8): chiusa, salva i registri dall’acqua e dal fuoco.',
                 esatta='I registri sequestrati sono immuni al rogo: la prova esce intatta — VITTORIA PIENA anche col fuoco alto.',
                 sbagliata='Portate via i registri a mani nude: se il Canto ha superato la soglia-rogo la prova è degradata — vittoria parziale. (La Lettera di Raccomandazione è un’esca.)'),
        ],
        boss='IL SORVEGLIANTE DEL MOLINO',
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
    ep9=dict(
        id='ep9', titolo='Il processo',
        sottotitolo='episodio 9 — Atto II: la scorta del teste, e il primo volto di C.B.',
        cartella='Episodio 9', ore_budget=6,
        lettera=LETTERA_9,
        obiettivo='Portate vivo il teste Anselmo Riva (3 Salute, si muove col gruppo, non '
                  'combatte) dalla sacrestia (T1) al Molo del Lume (T6): gli aggressori '
                  'bersagliano LUI, il Sicario Gentile lo CACCIA. Riva a bordo = vittoria; '
                  'Riva a terra = scorta fallita.',
        esami_carbone=ESAMI_CARBONE_9,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_9, REPERTI_LUOGO['ep9']) for L in LUOGHI_9],
        tessere=[tessera_json(T) for T in TILES_9],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep9'],
        pool=POOL_EP9,
    ),
    ep10=dict(
        id='ep10', titolo='La casa che ricorda',
        sottotitolo='episodio 10 — Atto II: la casa che ricorda, e la corsa alla demolizione',
        cartella='Episodio 10', ore_budget=6,
        lettera=LETTERA_10,
        obiettivo='Fissate la prova (fotografate il corpo murato) prima che il Muratore abbatta '
                  'il muro: due tracce, DEMOLIZIONE (il boss demolisce se non inchiodato) e '
                  'PROVA (documentate all’intercapedine, +2 con la Macchina Fotografica). PROVA '
                  'piena = vittoria; DEMOLIZIONE piena = il muro crolla, sconfitta. Abbattere il '
                  'Muratore ferma la demolizione (seconda via).',
        esami_carbone=ESAMI_CARBONE_10,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_10, REPERTI_LUOGO['ep10']) for L in LUOGHI_10],
        tessere=[tessera_json(T) for T in TILES_10],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep10'],
        pool=POOL_EP10,
    ),
    ep11=dict(
        id='ep11', titolo='Il censimento delle campane',
        sottotitolo='episodio 11 — Atto II: il censimento delle campane, e la via delle guglie',
        cartella='Episodio 11', ore_budget=6,
        lettera=LETTERA_11,
        obiettivo='Salite la via delle guglie e prendete VIVO il Caposquadra (l’unico testimone di '
                  'chi paga): riducetelo all’ultima Ferita, tenetelo al riparo dal vento e '
                  'catturatelo (Interagire; con la Corda del Campanaro è automatico). Un colpo che '
                  'lo uccide, o una raffica che lo fa cadere dall’esposto, perde il filo.',
        esami_carbone=ESAMI_CARBONE_11,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_11, REPERTI_LUOGO['ep11']) for L in LUOGHI_11],
        tessere=[tessera_json(T) for T in TILES_11],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep11'],
        pool=POOL_EP11,
    ),
    ep12=dict(
        id='ep12', titolo='La seconda copia',
        sottotitolo='episodio 12 — Atto II (chiusura): la seconda copia, e l’inseguimento del corriere',
        cartella='Episodio 12', ore_budget=6,
        lettera=LETTERA_12,
        obiettivo='Inseguite il corriere Tullio Vela per i canali e AGGANCIATELO (adiacenza + '
                  'Interagire, o taglio ai ponti coperti col Fischietto) prima che consegni le '
                  'copie allo scambio al Cimitero delle Barche (T6). Se la traccia FUGA si riempie '
                  'prima, le copie sono nel mondo: spedizione fallita.',
        esami_carbone=ESAMI_CARBONE_12,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_12, REPERTI_LUOGO['ep12']) for L in LUOGHI_12],
        tessere=[tessera_json(T) for T in TILES_12],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep12'],
        pool=POOL_EP12,
    ),
    ep13=dict(
        id='ep13', titolo='Carta di pregio',
        sottotitolo='episodio 13 — Atto III (apertura): la cartiera di C.B., il molino fuori città',
        cartella='Episodio 13', ore_budget=6,
        lettera=LETTERA_13,
        obiettivo='Salite il Molino delle Carte fino al torchio (T6), superate o abbattete il '
                  'Sorvegliante e SEQUESTRATE i registri (Interagire). Con la Cassetta Stagna sono '
                  'salvi dal rogo: prova intatta, VITTORIA PIENA. Se il Notaio ha già dato fuoco ai '
                  'magazzini (Canto oltre la soglia-rogo) e non avete la Cassetta, li portate via '
                  'anneriti: vittoria parziale, ma l’Atto prosegue. Il Notaio non si prende: appare '
                  'in T4, ordina il rogo e fugge in carrozza.',
        esami_carbone=ESAMI_CARBONE_13,
        luoghi=[luogo_json(L, OGGETTI_LUOGO_13, REPERTI_LUOGO['ep13']) for L in LUOGHI_13],
        tessere=[tessera_json(T) for T in TILES_13],
        vantaggio=dict(slancio_ore=3, preparati_ore=1, preparati_luoghi=6),
        soluzione=SOLUZIONI['ep13'],
        pool=POOL_EP13,
    ),
)

comune = dict(
    eroi=[eroe_json(h) for h in HEROES],
    nemici=[nemico_json(n) for n in NEMICI + NEMICI_2 + NEMICI_3 + NEMICI_4 + NEMICI_5 + NEMICI_6 + NEMICI_7 + NEMICI_8 + NEMICI_9 + NEMICI_10],
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
