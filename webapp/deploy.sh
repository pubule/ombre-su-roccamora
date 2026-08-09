#!/usr/bin/env bash
# Pubblica la webapp su Cloudflare (Worker di soli asset statici, wrangler.jsonc).
#
# Presuppone: export-data.js/py e export-assets.py gia' girati (webapp/data e
# webapp/assets esistono, sono in .gitignore), ./fetch_fonts.sh fatto.
#
# Uso: ./webapp/deploy.sh     (la prima volta wrangler apre il browser per il
#                              login Cloudflare)
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

./webapp/build-dist.sh

# wrangler e' bloccato in package.json (versione esatta, con l'hash nel
# lockfile) e non "@latest": questo comando riceve il token OAuth del tuo
# account Cloudflare — scrittura su Workers, zone, DNS, email — quindi non
# deve poter eseguire codice di una release nuova che nessuno ha visto.
# Per aggiornarlo: npm install --save-dev --save-exact wrangler@<versione>
npx --no-install wrangler deploy
