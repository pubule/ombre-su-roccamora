#!/usr/bin/env bash
# Scarica in webapp/public/js/vendor/ le librerie della nebbia di sfondo
# (Vanta.FOG su three.js, vedi webapp/public/js/nebbia.js): stessa scelta dei
# font (fetch_fonts.sh) — librerie di terzi non entrano in git, si scaricano
# a ogni build. L'hash sha384 blocca lo script se il file non e' quello
# atteso, cosi' un mirror compromesso non passa inosservato.
set -e
mkdir -p webapp/public/js/vendor

# --max-time 30: vedi fetch_fonts.sh, stesso motivo (una curl che si impunta
# non deve bloccare la build in silenzio).
verifica() {
  local file="$1" atteso="$2" reale
  reale=$(openssl dgst -sha384 -binary "$file" | openssl base64 -A)
  if [ "$reale" != "$atteso" ]; then
    echo "hash sha384 diverso per $file: atteso $atteso, trovato $reale" >&2
    exit 1
  fi
}

curl -fsSL --max-time 30 -o webapp/public/js/vendor/three.min.js \
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
verifica webapp/public/js/vendor/three.min.js \
  "CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu"

curl -fsSL --max-time 30 -o webapp/public/js/vendor/vanta.fog.min.js \
  "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js"
verifica webapp/public/js/vendor/vanta.fog.min.js \
  "6pWFXNNSqb0oVNIZRz63YH5+lolGdFdCh23nHfD7SI3PIW69QAVOvVl/0pkWLG62"

echo "vendor pronto: $(ls webapp/public/js/vendor | wc -l) file"
