#!/usr/bin/env bash
# Rigenera TUTTO il materiale stampabile del gioco, nell'ordine corretto:
# tessere/carte/reperti (Node/Playwright, letti da artworks/) prima, poi i
# PDF (Python/reportlab) che li referenziano solo per nome di cartella nel
# testo, mai per contenuto — l'ordine tra i due gruppi non e' in realta'
# vincolante, ma le carte vanno generate (generate-batch.js) prima dei fogli
# fronte/retro (generate-print-sheets.js) che le impaginano.
#
# Presuppone: pip install reportlab, ./fetch_fonts.sh, npm install (playwright)
# gia' fatti una volta. Arte mancante in artworks/ (MJ non ancora generata) non
# blocca lo script: i generatori la saltano con un avviso o usano un fallback
# procedurale (stesso pattern in tutto il progetto, es. dorsi carta mancanti,
# sfondo Tabellone mancante).
#
# Uso: ./build-all.sh [--solo-mancanti]
# --solo-mancanti: rigenera solo gli artefatti (tessere/carte/fogli/reperti)
# che ancora non esistono su disco, invece di rifare tutto da capo. I PDF
# (Python) restano sempre rigenerati per intero: sono veloci, e i generatori
# saltano da soli l'arte ancora mancante senza bisogno del flag.

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

FLAG=""
[ "$1" = "--solo-mancanti" ] && FLAG="--solo-mancanti"

# Tutti e 20 gli episodi: quelli senza dati scritti a mano nello script leggono
# le tessere da webapp/data/ep<N>.json, e chi non ha ancora lo sfondo d'arte
# salta la sua tessera dicendolo (non ne produce una vuota).
echo "== Tessere (Episodio N/board/) =="
for n in $(seq 1 20); do node scripts/tiles/generate-tiles.js "ep$n" $FLAG; done

echo "== Carte (cards/) =="
# generate-batch.js risolve card.art (es. 'artworks/Elena.png') relativo alla
# cwd: va lanciato dalla radice del repo, MAI da dentro scripts/cardconjurer
# (li' 'artworks/...' punterebbe a scripts/cardconjurer/artworks, che non esiste).
node scripts/cardconjurer/generate-batch.js all $FLAG

echo "== Fogli fronte/retro carte + tessere (non committato) =="
node scripts/cardconjurer/generate-print-sheets.js $FLAG

echo "== Reperti (reperti/Episodio 1/) =="
node scripts/reperti/generate-reperti.js $FLAG

echo "== PDF (pdf/) =="
(cd src && python gen_docs.py)
(cd src && python gen_deluxe.py)
(cd src && python gen_bestiario.py)
(cd src && python gen_mappa.py)
(cd src && python gen_gothic.py)
(cd src && python gen_narrator.py)
(cd src && python gen_cover.py)
(cd src && python gen_preludio.py)
# Tutti gli episodi, non solo il secondo: fino a qui la build ne rigenerava
# due su ventuno, e i PDF degli altri diciotto restavano indietro rispetto ai
# sorgenti a ogni correzione. `scripts/audit.py` (controllo A4) verifica che
# questo elenco resti completo.
for n in $(seq 2 20); do (cd src && python "gen_ep$n.py"); done
(cd src && python gen_board.py)
(cd src && python gen_taccuino_campagna.py)

echo "== Stampa completa unica, tutto fronte/retro (non committato) =="
# Ultimo passo apposta: unisce i PDF appena rigenerati sopra + il foglio
# carte/tessere di generate-print-sheets.js. File finale grande (70+MB,
# soprattutto per lo sfondo pergamena dei fascicoli): normale per un PDF
# di stampa a piena risoluzione, non un errore.
python scripts/merge-print-all.py

echo "== Fatto: Comune/, Preludio/, Episodio 1/, Episodio 2/ aggiornati =="
