#!/usr/bin/env bash
# Monta il trailer dalle clip generate con Seedance.
#
# Ogni clip e' un personaggio, generato a 4 secondi col proprio artwork come
# fotogramma zero (vedi video/prompt-trailer-30s.txt). La tabella dei tempi sta
# in un posto solo — SCALETTA qui sotto — cosi' cambiare il ritmo non vuol dire
# riscrivere il filtro, e la durata totale si somma da li'.
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

# SETTE clip, una per personaggio, col suo artwork come fotogramma zero.
# Le due strade provate prima sono state bocciate sul campo (13/08/2026): una
# ripresa unica da 30s saltava troppo in fretta da una cosa all'altra, e nove
# riferimenti attaccati insieme venivano ignorati quasi del tutto. Ritmo e
# dissolvenze si fanno QUI, non nel generatore.
#
# La durata e' quella VISIBILE a schermo, NON quella da tagliare dalla clip:
# una dissolvenza SOVRAPPONE, quindi ogni incrocio si mangerebbe il suo tempo.
# Chi ingerisce piu' sotto prende `visibile + dissolvenza in uscita`, e per
# questo con clip da 4,0 s le righe qui sotto dicono 3,7 e 3,85: il resto se
# lo prende l'incrocio. Sbagliarlo non si vede nel file — la durata dichiarata
# resta giusta perche' la tiene su l'audio — si vede solo contando i
# fotogrammi, ed e' successo davvero: 650 invece di 750.
SCALETTA=(
  "01-citta:3.85"
  "02-elena:3.7"  "03-nino:3.7"  "04-ottone:3.7"  "05-sibilla:3.7"
  "06-adepto:3.85"
  "07-mora:4.0"
)   # ognuna sta dentro i 4,0 s generati; in tutto 26,5 s

# la durata totale NON si scrive a mano: si somma. Era gia' scritta in quattro
# posti diversi (taglio, audio, controllo fotogrammi, cartelli) e bastava
# cambiarne uno per avere un file che dichiara una cosa e ne contiene un'altra.
TOTALE=$(printf '%s\n' "${SCALETTA[@]}" | awk -F: '{t+=$2} END{printf "%.2f", t}')

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
  # dentro il blocco dei personaggi ci si scioglie, ai bordi si stacca netto
  if [ "$i" -ge 1 ] && [ "$i" -le $((${#SCALETTA[@]} - 3)) ]; then echo "$DISSOLVENZA"; else echo 0.15; fi
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
# i tempi si ancorano alla fine VERA: il titolo entra sull'ultima clip, che
# chiude nel nero, ed e' li' che un titolo sta bene
t2=$(awk -v t="$TOTALE" 'BEGIN{printf "%.2f", t - 9}')
t2f=$(awk -v t="$t2" 'BEGIN{printf "%.2f", t + 2}')
t3=$(awk -v t="$TOTALE" 'BEGIN{printf "%.2f", t - 2.5}')
CARTELLI="$(riga "Roccamora, 1889. Sotto la città, qualcosa canta." 0.5 3.5 44 "h-h/6")"
CARTELLI+="$(riga "Sei ore per capire dove. Poi si scende." "$t2" "$t2f" 44 "h-h/6")"
CARTELLI+="$(riga "OMBRE SU ROCCAMORA" "$t3" "$TOTALE" 96 "(h-text_h)/2")"
CARTELLI="${CARTELLI%,}"

AFADE=$(awk -v t="$TOTALE" 'BEGIN{printf "%.2f", t - 2}')
ffmpeg -y "${ingressi[@]}" -i "$MUSICA" \
  -filter_complex "${filtri[*]}${catena}[$prec]${CARTELLI}[vout];[$n:a]atrim=0:$TOTALE,afade=t=out:st=$AFADE:d=2[aout]" \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r "$FPS" \
  -c:a aac -b:a 192k -movflags +faststart -t "$TOTALE" \
  "$FUORI"

echo
echo "fatto: $FUORI"
# La durata del contenitore MENTE: se il video finisce prima, la tiene su
# l'audio. L'unica misura che non si lascia ingannare e' contare i fotogrammi.
attesi=$(awk -v f="$FPS" -v t="$TOTALE" 'BEGIN{printf "%d", t * f}')
letti=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$FUORI")
ffprobe -v error -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=0 -select_streams v:0 "$FUORI"
echo "fotogrammi: $letti (attesi $attesi)"
if [ "$letti" -lt $((attesi - 2)) ]; then
  echo "IL VIDEO E' PIU' CORTO DI QUEL CHE DICE: qualche incrocio non e' avvenuto."
  exit 1
fi
echo
echo "Ora GUARDALO a schermo pieno e con l'audio: sette volti in fila hanno un"
echo "ritmo che in una finestrella muta non si giudica."
