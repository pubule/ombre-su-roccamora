#!/usr/bin/env bash
# Scarica in ./fonts i font liberi usati dalla pipeline PDF
# (src/deluxe_style.py) e dai reperti in HTML
# (scripts/reperti/generate-reperti.js): Old Standard TT (regular/bold/
# italic), IM Fell English SC, La Belle Aurore.
#
# Il nome del file dentro il repo di Google Fonts non e' sempre prevedibile
# dal nome della famiglia (es. IM Fell English SC e' "IMFeENsc28P.ttf"): si
# legge da METADATA.pb, un file a percorso FISSO in ogni cartella del font,
# invece di elencare la cartella con l'API "contents" di GitHub - che ha un
# suo rate limit e, in una sessione con l'accesso GitHub ristretto a un solo
# repo (es. Claude Code on the web), e' bloccata a prescindere dal limite.
set -e
mkdir -p fonts && cd fonts
base="https://raw.githubusercontent.com/google/fonts/main/ofl"

# Su Windows l'installer python.org non mette 'python3' nel PATH, solo
# 'python' - a differenza di Linux/Mac dove 'python' spesso e' quello di
# sistema (py2 o assente). Si prende quello che c'e'.
PYTHON3=python3
command -v python3 >/dev/null 2>&1 || PYTHON3=python

# --max-time 30: senza limite una curl che si impunta (rete lenta, host che
# non risponde) blocca lo script in silenzio - visto il 19/09/2026 su GitHub
# Actions, dove un job restava "in corso" per oltre 20 minuti senza errore
# ne' output.
#
# $1 = cartella nel repo (es. oldstandardtt), $2 = style (normal|italic),
# $3 = weight (400|700), $4 = nome del file locale da scrivere
scarica() {
  local cartella="$1" style="$2" weight="$3" nome_locale="$4" filename
  filename=$(curl -sL --max-time 30 "$base/$cartella/METADATA.pb" | "$PYTHON3" -c '
import re, sys
style, weight = sys.argv[1], sys.argv[2]
blocco = ""
for riga in sys.stdin:
    if riga.strip() == "fonts {":
        blocco = ""
    blocco += riga
    if riga.strip() == "}":
        s = re.search(r"style: \"(\w+)\"", blocco)
        w = re.search(r"weight: (\d+)", blocco)
        f = re.search(r"filename: \"([^\"]+)\"", blocco)
        if s and w and f and s.group(1) == style and w.group(1) == weight:
            print(f.group(1))
            break
' "$style" "$weight")
  if [ -z "$filename" ]; then
    echo "fetch_fonts.sh: nessun file $style/$weight in $cartella/METADATA.pb" >&2
    exit 1
  fi
  curl -sL --max-time 30 -o "$nome_locale" "$base/$cartella/$filename"
}

scarica oldstandardtt   normal 400 OldStandard-Regular.ttf
scarica oldstandardtt   normal 700 OldStandard-Bold.ttf
scarica oldstandardtt   italic 400 OldStandard-Italic.ttf
scarica imfellenglishsc normal 400 IMFellEnglishSC.ttf
scarica labelleaurore   normal 400 LaBelleAurore.ttf

echo "Font scaricati in ./fonts"
