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
# Uso: ./build-all.sh

set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "== Tessere (board/Episodio 1/) =="
node scripts/tiles/generate-tiles.js

echo "== Carte (cards/) =="
# generate-batch.js risolve card.art (es. 'artworks/Elena.png') relativo alla
# cwd: va lanciato dalla radice del repo, MAI da dentro scripts/cardconjurer
# (li' 'artworks/...' punterebbe a scripts/cardconjurer/artworks, che non esiste).
node scripts/cardconjurer/generate-batch.js

echo "== Fogli fronte/retro carte + tessere (non committato) =="
node scripts/cardconjurer/generate-print-sheets.js

echo "== Reperti (reperti/Episodio 1/) =="
node scripts/reperti/generate-reperti.js

echo "== PDF (pdf/) =="
(cd src && python gen_docs.py)
(cd src && python gen_deluxe.py)
(cd src && python gen_gothic.py)
(cd src && python gen_narrator.py)
(cd src && python gen_cover.py)
(cd src && python gen_preludio.py)
(cd src && python gen_board.py)

echo "== Fatto: pdf/, cards/, board/Episodio 1/, reperti/ aggiornati =="
