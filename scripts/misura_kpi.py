# -*- coding: utf-8 -*-
"""Un metro solo per venti episodi.

I simulatori sono di DUE generazioni e non si leggono allo stesso modo:

  Ep.1-9    esegui_batch_multi_party(nome, size, formula, scale, n_party, n_seed, seed_base)
            e la metrica dell'ansia si chiama `pct_vittoria_sofferta`
  Ep.10-20  esegui_multi_party(nome, size, n_party, n_seed, seed_base, formula)
            e la stessa metrica si chiama `pct_sofferta`

(e l'Ep.1 vive in `simulate_playtest.py`, non in `simulate_ep1.py`.)

Qui sta l'unico posto che conosce la differenza. Tutto il resto — il loop di
bilanciamento, i confronti fra episodi — riceve le stesse quattro chiavi.

I KPI MISURABILI (il bersaglio e' a 4 eroi):
  vittoria  70-80%   giocabilita' (finale vero + finale amaro insieme)
  piena     40-60%   il finale VERO e' un premio, non la norma — e nemmeno
                     una decorazione: l'Ep.15 stava al 100% di «vittoria»
                     mentre la sua Contro-busta non si apriva mai
  sofferte  >= 60%   ansia: hai vinto, ma qualcuno e' andato a terra
  picco     >= 1.0   ansia: quanti eroi a terra nel momento peggiore

Le ultime due NON si applicano agli episodi a tensione non letale (NON_LETALI,
segnati con * nel verdetto): li' la posta e' un arresto, una fuga, un teste da
non perdere, e il sangue non e' la misura giusta.

Coinvolgimento e immersione NON hanno strumento: nessun numero qui li vede, e
nessuna di queste percentuali dice se un episodio e' ancora bello. Una vittoria
in fascia ottenuta appiattendo l'episodio ha lo stesso aspetto di una sana.

Uso:  python scripts/misura_kpi.py ep7 [n_party] [n_seed]
      python scripts/misura_kpi.py tutti
"""
import importlib
import io
import os
import sys
import contextlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'scripts'))

# la fascia e le soglie decise col committente (2026-07-22)
BANDA = (70, 80)
# Molti episodi hanno DUE finali: quello vero (la Contro-busta, il decano
# lucido, la matrice) e quello amaro. `pct_vittoria` li conta insieme, e cosi'
# l'Ep.15 sembrava al 100% mentre il suo finale vero non si apriva MAI in 600
# partite, e l'Ep.17 due volte su cento. Il finale vero e' un premio, non la
# norma: lo vede circa meta' dei tavoli, e quasi tutti portano a casa almeno
# quello amaro.
BANDA_PIENA = (40, 60)
SOFFERTE_MIN = 60
PICCO_MIN = 1.0
TAGLIA = 4

# episodi che NON vanno tarati: la loro facilita' e' una scelta di design
ESENTI = {'ep16': 'il respiro dell’Atto III: 100% e nessuna sofferenza, voluto'}

# TENSIONE NON LETALE. In questi episodi la posta non e' la morte degli eroi, e
# i due proxy dell'ansia — vittorie sofferte e picco di eroi a terra — misurano
# una cosa che li' non deve succedere. Applicarli uniformemente porterebbe a
# renderli sanguinosi, cioe' a distruggere quello per cui esistono. Per loro
# l'ansia e' l'INCERTEZZA DELL'ESITO: la fascia della vittoria piena.
#   ep9   la posta e' il TESTE scortato, non gli eroi (14 sconfitte su 32 sono
#         «il teste e' caduto», col picco degli eroi a 0.3)
#   ep14  il Primo Gatto che scavalca la cresta e sparisce
#   ep15  il sigillo che cala e le prove cancellate
#   ep18  «i gendarmi sono in buona fede: la posta e' l'ARRESTO, non la morte»
#   ep19  «l'Ispettore Vidal che NON si uccide... PERSUASIONE (non morte)»
NON_LETALI = {'ep9', 'ep14', 'ep15', 'ep18', 'ep19'}

MODULO = {'ep1': 'simulate_playtest'}          # gli altri: simulate_epN


def _modulo(ep):
    return importlib.import_module(MODULO.get(ep, f'simulate_{ep}'))


def _primo(d, *chiavi):
    """La stessa grandezza ha nomi diversi nelle due generazioni."""
    for k in chiavi:
        if k in d:
            return d[k]
    return None


def misura(ep, n_party=20, n_seed=30, seed_base=970000, taglia=TAGLIA, zitto=True):
    """Ritorna le metriche normalizzate. `seed_base` fissa le composizioni del
    party: due misure che lo condividono sono APPAIATE, e solo quelle si
    possono confrontare — lo stesso Ep.3 a 4 eroi ha dato 0%, 16% e 31% con
    gruppi diversi."""
    sim = _modulo(ep)
    corri = getattr(sim, 'esegui_batch_multi_party', None)
    buf = io.StringIO()
    with (contextlib.redirect_stdout(buf) if zitto else contextlib.nullcontext()):
        if corri is not None:                                  # Ep.1-9
            m = corri(f'kpi-{ep}', taglia, 'finale_v3', 'nessuna',
                      n_party=n_party, n_seed=n_seed, seed_base=seed_base)
        else:                                                  # Ep.10-20
            m = sim.esegui_multi_party(f'kpi-{ep}', taglia, n_party=n_party,
                                       n_seed=n_seed, seed_base=seed_base)
    return dict(
        ep=ep, taglia=taglia, partite=n_party * n_seed,
        vittoria=m['pct_vittoria'],
        sofferte=_primo(m, 'pct_vittoria_sofferta', 'pct_sofferta'),
        piena=_primo(m, 'pct_piena'),          # None se l'episodio ha un finale solo
        picco=m['media_max_down'],
        round=_primo(m, 'media_round'),
        canto=_primo(m, 'media_canto_finale', 'media_canto'),
    )


def verdetto(k):
    """Perche' un episodio non e' chiuso — o '' se lo e'.

    Una vittoria in fascia con l'ansia sotto soglia NON passa: e' un episodio
    diventato una passeggiata, e va respinto come si respinge una sconfitta.
    """
    if k['ep'] in ESENTI:
        return 'esente'
    manca = []
    if k['vittoria'] < BANDA[0]:
        manca.append(f'troppo duro ({k["vittoria"]:.0f}% < {BANDA[0]}%)')
    elif k['vittoria'] > BANDA[1]:
        manca.append(f'troppo facile ({k["vittoria"]:.0f}% > {BANDA[1]}%)')
    if k.get('piena') is not None:
        if k['piena'] < BANDA_PIENA[0]:
            manca.append(f'il finale vero non si vede ({k["piena"]:.0f}% < {BANDA_PIENA[0]}%)')
        elif k['piena'] > BANDA_PIENA[1]:
            manca.append(f'il finale amaro non esiste ({k["piena"]:.0f}% > {BANDA_PIENA[1]}%)')
    if k['ep'] not in NON_LETALI:
        if (k['sofferte'] or 0) < SOFFERTE_MIN:
            manca.append(f'poca ansia: sofferte {k["sofferte"]:.0f}% < {SOFFERTE_MIN}%')
        if (k['picco'] or 0) < PICCO_MIN:
            manca.append(f'poca ansia: picco a terra {k["picco"]:.1f} < {PICCO_MIN}')
    return '; '.join(manca)


def riga(k):
    v = verdetto(k)
    stato = 'ESENTE' if v == 'esente' else ('CHIUSO' if not v else 'aperto')
    if k['ep'] in NON_LETALI:
        stato += '*'                       # tensione non letale: il sangue non si conta
    piena = '' if k.get('piena') is None else f'piena {k["piena"]:4.0f}%  '
    return (f'{k["ep"]:>5}  {k["vittoria"]:5.0f}%  {piena}sofferte {(k["sofferte"] or 0):5.0f}%  '
            f'picco {(k["picco"] or 0):4.1f}  round {(k["round"] or 0):5.1f}  '
            f'canto {(k["canto"] or 0):5.1f}  {stato:6}  {"" if v == "esente" else v}')


if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else 'ep1'
    np = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    ns = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    eps = [f'ep{i}' for i in range(1, 21)] if arg == 'tutti' else [arg]
    for ep in eps:
        try:
            print(riga(misura(ep, n_party=np, n_seed=ns)), flush=True)
        except Exception as e:                      # un simulatore rotto non ferma gli altri
            print(f'{ep:>5}  ERRORE: {type(e).__name__}: {e}', flush=True)
