#!/usr/bin/env bash
set -e
mkdir -p fonts && cd fonts
base="https://raw.githubusercontent.com/google/fonts/main/ofl"
curl -sL -o OldStandard-Regular.ttf "$base/oldstandardtt/OldStandard-Regular.ttf"
curl -sL -o OldStandard-Bold.ttf    "$base/oldstandardtt/OldStandard-Bold.ttf"
curl -sL -o OldStandard-Italic.ttf  "$base/oldstandardtt/OldStandard-Italic.ttf"
url=$(curl -s "https://api.github.com/repos/google/fonts/contents/ofl/imfellenglishsc" | grep download_url | grep -i ttf | cut -d'"' -f4)
curl -sL -o IMFellEnglishSC.ttf "$url"
curl -sL -o LaBelleAurore.ttf "$base/labelleaurore/LaBelleAurore.ttf"
echo "Font scaricati in ./fonts"
