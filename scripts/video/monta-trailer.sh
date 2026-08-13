#!/usr/bin/env bash
# Monta il trailer da 30 secondi dalle clip generate con Seedance.
#
# Le clip si generano LUNGHE (5 s) e si tagliano qui: Seedance non tiene
# l'identita' del volto fino in fondo, quindi la coda si butta. La tabella dei
# tempi sta in un posto solo — SCALETTA qui sotto — cosi' cambiare il ritmo non
# vuol dire riscrivere il filtro.
#
# Uso:  ./scripts/video/monta-trailer.sh
# Vuole: ffmpeg (choco install ffmpeg / scoop install ffmpeg)
#        video/clip/*.mp4  (dalle generazioni)
#        video/musica.mp3  (da Suno, prompt in video/PROMPT-SUNO-TRAILER.md)

set -e
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

if ! command -v ffmpeg > /dev/null; then
  echo "ffmpeg non c'e'. Installalo e rilancia:"
  echo "   choco install ffmpeg      (da PowerShell come amministratore)"
  echo "   scoop install ffmpeg"
  exit 1
fi

# CLIP e FUORI si possono spostare: serve a provare la catena con clip finte
# ricavate dagli artwork PRIMA di spendere crediti veri su Seedance
CLIP=${CLIP:-video/clip}
FUORI=${FUORI:-video/ombre-su-roccamora-30s.mp4}
MUSICA=${MUSICA:-video/musica.mp3}
LARGO=1920; ALTO=1080; FPS=25
DISSOLVENZA=0.3          # fra un eroe e l'altro
FONT_TIT=fonts/IMFellEnglishSC.ttf

# nome:durata — l'ordine e' quello del trailer. Gli undici eroi stanno in
# mezzo a 1,6 s l'uno: aprono col metodo di Elena, chiudono con l'acqua di
# Mora, che porta al canale dell'Adepto.
# La durata e' quella VISIBILE a schermo, non quella da tagliare dalla clip:
# una dissolvenza SOVRAPPONE, quindi ogni incrocio si mangerebbe il suo tempo.
# Chi ingerisce piu' sotto prende `visibile + dissolvenza in uscita`, cosi' la
# somma fa 30,0 esatti. Sbagliarlo non si vede nel file — la durata resta
# dichiarata giusta — si vede solo contando i fotogrammi: 650 invece di 750.
# Nessuna clip puo' chiedere piu' di 5 secondi: e' quanto ne genera Seedance,
# e un primo input piu' corto dell'offset fa SALTARE l'incrocio senza un
# errore — il file resta lungo 30 s perche' e' l'audio a tenerlo su, e il
# video dentro e' 26,6. Misurato il 13/08/2026, e per questo c'e' il controllo
# qui sotto.
SCALETTA=(
  "01-citta:4.55"
  "02-elena:1.6"   "03-attilio:1.6" "04-sibilla:1.6" "05-nino:1.6"
  "06-ottone:1.6"  "07-carla:1.6"   "08-lazzaro:1.6" "09-celso:1.6"
  "10-fulgenzio:1.6" "11-ottavio:1.6" "12-mora:1.6"
  "13-adepto:4.85"
  "14-sigillo:3.0"
)   # 4,55 + 11x1,6 + 4,85 + 3,0 = 30,0

mancanti=()
for voce in "${SCALETTA[@]}"; do
  [ -f "$CLIP/${voce%%:*}.mp4" ] || mancanti+=("${voce%%:*}")
done
if [ ${#mancanti[@]} -gt 0 ]; then
  echo "mancano ${#mancanti[@]} clip in $CLIP/: ${mancanti[*]}"
  echo "(i prompt per generarle stanno in video/PROMPT-SEEDANCE.md)"
  exit 1
fi

# quanto dura la dissolvenza IN USCITA da una clip (0 per l'ultima): dentro il
# blocco degli eroi si scioglie, ai bordi si stacca quasi netto
dissolvenza_dopo() {
  local i=$1
  [ "$i" -ge $((${#SCALETTA[@]} - 1)) ] && { echo 0; return; }
  if [ "$i" -ge 1 ] && [ "$i" -le 11 ]; then echo "$DISSOLVENZA"; else echo 0.15; fi
}

# --- ingressi: ogni clip presa lunga quanto serve, e normalizzata ------------
# Le clip arrivano da un servizio esterno: risoluzione e fps non sono garantiti
# uguali fra loro, e concatenare roba disomogenea da' salti. Qui si impone
# tutto: scala, taglio, fps, SAR.
ingressi=(); filtri=(); n=0
for voce in "${SCALETTA[@]}"; do
  nome="${voce%%:*}"; visibile="${voce##*:}"
  d=$(dissolvenza_dopo "$n")
  presa=$(awk -v v="$visibile" -v d="$d" 'BEGIN{printf "%.3f", v + d}')
  # una clip piu' corta di quanto le si chiede non da' errore: fa saltare
  # l'incrocio e accorcia il film in silenzio. Meglio fermarsi qui.
  vera=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP/$nome.mp4")
  if awk -v a="$vera" -v b="$presa" 'BEGIN{exit !(a < b - 0.02)}'; then
    echo "«$nome.mp4» dura ${vera}s ma ne servono $presa (${visibile} visibili + $d di dissolvenza)."
    echo "Rigenerala piu' lunga, o accorcia la sua riga nella SCALETTA."
    exit 1
  fi
  ingressi+=(-t "$presa" -i "$CLIP/$nome.mp4")
  filtri+=("[$n:v]scale=$LARGO:$ALTO:force_original_aspect_ratio=increase,crop=$LARGO:$ALTO,fps=$FPS,setsar=1,format=yuv420p[v$n];")
  n=$((n + 1))
done

# --- gli undici eroi si sciolgono l'uno nell'altro, il resto stacca ----------
# L'incrocio i-esimo comincia dove finisce il tempo VISIBILE di tutto quello
# che sta prima: l'offset e' la somma delle durate di scaletta, non di quelle
# ingerite.
catena=""; off=0; prec="v0"
for ((i = 1; i < n; i++)); do
  visibile="${SCALETTA[$((i - 1))]##*:}"
  off=$(awk -v o="$off" -v v="$visibile" 'BEGIN{printf "%.3f", o + v}')
  d=$(dissolvenza_dopo $((i - 1)))
  catena+="[$prec][v$i]xfade=transition=fade:duration=$d:offset=$off[x$i];"
  prec="x$i"
done

# --- i tre cartelli ---------------------------------------------------------
# Entrano in dissolvenza e non anticipano mai la clip a cui appartengono.
riga() {  # testo, inizio, fine, dimensione, y
  printf "drawtext=fontfile=%s:text='%s':fontcolor=0xF4D68A:fontsize=%d:x=(w-text_w)/2:y=%s:alpha='if(lt(t,%s),0,if(lt(t,%s+0.4),(t-%s)/0.4,if(lt(t,%s-0.4),1,if(lt(t,%s),(%s-t)/0.4,0))))'," \
    "$FONT_TIT" "$1" "$4" "$5" "$2" "$2" "$2" "$3" "$3" "$3"
}
CARTELLI="$(riga "Roccamora, 1885. Sotto la città, qualcosa canta." 0.5 3.5 44 "h-h/6")"
CARTELLI+="$(riga "Sei ore per capire dove. Poi si scende." 20.0 22.0 44 "h-h/6")"
CARTELLI+="$(riga "OMBRE SU ROCCAMORA" 27.5 30.0 96 "(h-text_h)/2")"
CARTELLI="${CARTELLI%,}"

ffmpeg -y "${ingressi[@]}" -i "$MUSICA" \
  -filter_complex "${filtri[*]}${catena}[$prec]${CARTELLI}[vout];[$n:a]atrim=0:30,afade=t=out:st=28:d=2[aout]" \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r "$FPS" \
  -c:a aac -b:a 192k -movflags +faststart -t 30 \
  "$FUORI"

echo
echo "fatto: $FUORI"
# La durata del contenitore MENTE: se il video finisce prima, la tiene su
# l'audio. L'unica misura che non si lascia ingannare e' contare i fotogrammi.
attesi=$(awk -v f="$FPS" 'BEGIN{printf "%d", 30 * f}')
letti=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$FUORI")
ffprobe -v error -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=0 -select_streams v:0 "$FUORI"
echo "fotogrammi: $letti (attesi $attesi)"
if [ "$letti" -lt $((attesi - 2)) ]; then
  echo "IL VIDEO E' PIU' CORTO DI QUEL CHE DICE: qualche incrocio non e' avvenuto."
  exit 1
fi
echo
echo "Ora GUARDALO a schermo pieno e con l'audio: undici salite di macchina in"
echo "fila hanno un ritmo che in una finestrella muta non si giudica."
