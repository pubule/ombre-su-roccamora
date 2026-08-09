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
npx wrangler@latest deploy
