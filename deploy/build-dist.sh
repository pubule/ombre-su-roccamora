#!/usr/bin/env bash
# Assembla webapp/dist, la cartella che Cloudflare pubblica.
#
# La webapp e' solo file statici, ma i mount di server.js (/data /assets
# /fonts) stanno fuori da public/: qui si appiattisce tutto in una cartella
# sola, che e' quello che vuole un Worker con static assets.
#
# In locale basta questo (data/ e assets/ gia' esportati, font gia' scaricati).
# Su Cloudflare Builds serve prima rigenerarli: quelle tre cartelle sono in
# .gitignore, vedi il comando di build in wrangler.jsonc / dashboard.
set -e
# i percorsi qui sotto sono relativi a webapp/: lo script ci entra, da
# qualunque cartella lo si lanci
cd "$(dirname "${BASH_SOURCE[0]}")/../webapp"

for d in public data assets ../fonts; do
  [ -d "$d" ] || { echo "manca $d — lancia export-data.py/js, export-assets.py, ./fetch_fonts.sh"; exit 1; }
done

# Si svuota il CONTENUTO, non si cancella la cartella. La differenza conta
# quando due `wrangler dev` girano insieme — ed e' la procedura documentata per
# provare l'isolamento fra account, che con un utente solo non si prova: il
# primo tiene `dist` aperta, e su Windows una directory aperta non si cancella.
# Il secondo moriva li', sul suo build custom, prima ancora di partire.
mkdir -p dist
find dist -mindepth 1 -delete 2>/dev/null || true

cp -r public/. dist/
cp -r data dist/data
cp -r assets dist/assets
cp -r ../fonts dist/fonts
echo "dist pronta: $(find dist -type f | wc -l) file"
