#!/usr/bin/env bash
# Porta il database allo schema di `deploy/schema.sql`.
#
# PERCHE' ESISTE. `wrangler deploy` pubblica il CODICE e non tocca il database:
# sono due cose separate, e nessuno lo dice. Il 13/08/2026 e' andata online la
# vista eroe, che interroga la tabella `membri` — la tabella in produzione non
# c'era, e OGNI apertura dell'app rispondeva 500 su /api/stato. Il deploy era
# «riuscito», i test erano verdi, e l'app era morta.
#
# Tutte le DDL dello schema sono IF NOT EXISTS, quindi questo script si puo'
# rilanciare quante volte si vuole: e' per questo che `deploy.sh` lo chiama
# sempre, invece di lasciare che qualcuno se ne ricordi.
#
# Uso:
#   ./deploy/applica-schema.sh            # locale (il D1 di `wrangler dev`)
#   ./deploy/applica-schema.sh --remote   # PRODUZIONE
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

DOVE="--local"
[ "$1" = "--remote" ] && DOVE="--remote"

echo "schema -> $DOVE"
npx --no-install wrangler d1 execute ombre-salvataggi "$DOVE" --file=deploy/schema.sql --yes

# A CHE PUNTO E' il database, detto in chiaro invece che sperato: se una
# tabella manca, si vede qui e non da un 500 in faccia a chi apre l'app.
echo
echo "tabelle presenti:"
npx --no-install wrangler d1 execute ombre-salvataggi "$DOVE" --yes \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '\_cf%' ESCAPE '\' ORDER BY name"
