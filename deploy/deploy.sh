#!/usr/bin/env bash
# Pubblica la webapp su Cloudflare (Worker di soli asset statici, wrangler.jsonc).
#
# Presuppone: export-data.js/py e export-assets.py gia' girati (webapp/data e
# webapp/assets esistono, sono in .gitignore), ./fetch_fonts.sh fatto.
#
# Uso: ./deploy/deploy.sh     (la prima volta wrangler apre il browser per il
#                              login Cloudflare)
#
# Fa TRE cose, in quest'ordine: assembla dist, porta il database allo schema,
# pubblica il Worker. Vedi deploy/README.md.
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

./deploy/build-dist.sh

# LO SCHEMA PRIMA DEL CODICE. `wrangler deploy` pubblica il codice e non tocca
# il database: il 13/08/2026 e' andata online la vista eroe, che interroga la
# tabella `membri`, e in produzione quella tabella non c'era — ogni apertura
# rispondeva 500. Il deploy era «riuscito» e l'app era morta. Da qui in poi le
# due cose viaggiano insieme, e nell'ordine giusto: prima il posto dove mettere
# i dati, poi il codice che li chiede.
./deploy/applica-schema.sh --remote

# wrangler e' bloccato in package.json (versione esatta, con l'hash nel
# lockfile) e non "@latest": questo comando riceve il token OAuth del tuo
# account Cloudflare — scrittura su Workers, zone, DNS, email — quindi non
# deve poter eseguire codice di una release nuova che nessuno ha visto.
# Per aggiornarlo: npm install --save-dev --save-exact wrangler@<versione>
npx --no-install wrangler deploy
