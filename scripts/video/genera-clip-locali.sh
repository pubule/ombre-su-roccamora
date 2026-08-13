#!/usr/bin/env bash
# Genera in locale le quattordici clip del trailer, partendo dagli artwork.
# Niente Seedance, niente crediti: il movimento lo fa ffmpeg.
#
# Il movimento non e' un ripiego decorativo, e' quello progettato: ogni eroe
# comincia inquadrato sulle MANI — dove sta il gesto del suo mestiere — e la
# macchina sale sul VISO. In 16:9 l'arte 3:4 non tiene i due insieme, e questa
# salita e' il modo di averli tutti e due (vedi video/PROMPT-SEEDANCE.md).
#
# Cosa NON fa, ed e' il motivo per cui i prompt Seedance restano: qui niente si
# muove DENTRO l'immagine. La fiamma non trema, il pendolo non oscilla, la
# testa dell'Adepto non gira. Si muove la macchina, non il mondo.
#
# Uso:  ./scripts/video/genera-clip-locali.sh
#       ./scripts/video/monta-trailer.sh
# Le clip finiscono in video/clip/, dove il montaggio le cerca: sostituirne una
# con la versione Seedance e rilanciare il montaggio funziona senza toccare
# niente.

set -e
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

command -v ffmpeg > /dev/null || { echo "ffmpeg non c'e' (scoop install ffmpeg)"; exit 1; }

FUORI=video/clip
LARGO=1920; ALTO=1080; FPS=25
mkdir -p "$FUORI"

# Ogni clip dura 5 s: e' quanto ne genera Seedance, e tenere la stessa misura
# vuol dire poterle scambiare una per una. Il montaggio taglia quel che serve.
DURATA=5

# --- la salita dalle mani agli occhi ----------------------------------------
# L'arte eroe e' 1904x2544 con la figura in piedi: la testa sta nel primo
# quinto, le mani circa a meta'. Si porta l'immagine a ZOOM volte la larghezza
# del fotogramma (cosi' la panoramica ha margine anche di lato) e si fa
# scorrere la finestra 16:9 dall'alto verso il basso... in coordinate: da y
# GRANDE (le mani, in basso) a y PICCOLO (il viso, in alto).
#
# DA e A sono frazioni dell'altezza scalata. Si tarano GUARDANDO l'ultimo
# fotogramma di ogni clip: se non c'e' il viso, e' A che va alzato.
ZOOM=1.18
DA=0.42      # dove comincia: le mani
A=0.045      # dove arriva: il viso

sali() {   # sorgente, uscita
  local src="$1" out="$2"
  local w h
  w=$(awk -v l="$LARGO" -v z="$ZOOM" 'BEGIN{printf "%d", int(l*z/2)*2}')
  # l'altezza scalata serve per calcolare y in pixel: la si ricava dal file
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src" \
      | awk -F, -v w="$w" '{printf "%d", int(w*$2/$1/2)*2}')
  local y0 y1
  y0=$(awk -v h="$h" -v a="$ALTO" -v d="$DA" 'BEGIN{y=h*d; m=h-a; printf "%d", (y<0?0:(y>m?m:y))}')
  y1=$(awk -v h="$h" -v a="$ALTO" -v d="$A"  'BEGIN{y=h*d; m=h-a; printf "%d", (y<0?0:(y>m?m:y))}')
  # `easing`: la salita parte e finisce morbida (coseno), o sembra un ascensore
  ffmpeg -y -loglevel error -loop 1 -t "$DURATA" -i "$src" \
    -vf "scale=$w:$h,crop=$LARGO:$ALTO:(iw-$LARGO)/2:'$y0+($y1-$y0)*(0.5-0.5*cos(PI*min(t/$DURATA,1)))',fps=$FPS,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 "$out"
}

avanti() {  # carrello in avanti lentissimo (la citta'): zoom da 1.0 a 1.08
  local src="$1" out="$2"
  ffmpeg -y -loglevel error -loop 1 -t "$DURATA" -i "$src" \
    -vf "scale=$((LARGO*2)):-2,zoompan=z='1+0.08*on/($FPS*$DURATA)':d=$((FPS*DURATA)):x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${LARGO}x${ALTO}:fps=$FPS,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 "$out"
}

respira() {  # l'emblema: zoom impercettibile e la luce che cala sul finale
  local src="$1" out="$2"
  ffmpeg -y -loglevel error -loop 1 -t "$DURATA" -i "$src" \
    -vf "scale=$((LARGO*2)):-2,zoompan=z='1+0.04*on/($FPS*$DURATA)':d=$((FPS*DURATA)):x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${LARGO}x${ALTO}:fps=$FPS,fade=t=out:st=3.6:d=1.4,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 "$out"
}

echo "== la citta' =="
avanti video/sorgenti/01-citta.png "$FUORI/01-citta.mp4"

echo "== gli undici, dalle mani agli occhi =="
for coppia in \
  "02-elena:Elena" "03-attilio:Attilio" "04-sibilla:Sibilla" "05-nino:Nino" \
  "06-ottone:Ottone" "07-carla:Carla" "08-lazzaro:Lazzaro" "09-celso:Celso" \
  "10-fulgenzio:Fulgenzio" "11-ottavio:Ottavio" "12-mora:Mora"; do
  nome="${coppia%%:*}"; arte="${coppia##*:}"
  printf '   %-14s ' "$arte"
  sali "artworks/$arte.png" "$FUORI/$nome.mp4"
  echo 'ok'
done

echo "== l'Adepto e la citta' dall'alto =="
# l'Adepto: la macchina si avvicina piano, come chi non vorrebbe
avanti video/sorgenti/13-adepto.png "$FUORI/13-adepto.mp4"
# la chiusa torna sulla citta', ma da sopra e su una mappa vecchia: e' un
# altro registro rispetto all'apertura, quindi non sa di gia' visto
indietro video/sorgenti/14-citta-alta.png "$FUORI/14-citta-alta.mp4"

echo
echo "quattordici clip in $FUORI/"
echo "GUARDA l'ultimo fotogramma degli eroi: se non c'e' il viso, alza A qui sopra."
