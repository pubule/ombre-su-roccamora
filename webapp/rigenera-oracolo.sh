#!/usr/bin/env bash
# L'ORACOLO DEI TEST DIFFERENZIALI.
#
# Impalcatura della Fase 1 (PIANO-MOTORE-PURO.md): una copia di digitale.js
# com'era PRIMA che il motore ne uscisse, contro cui confrontare ogni funzione
# estratta. Si confronta col codice di partenza, non con quello di ieri: e' il
# solo modo di sapere che l'estrazione non ha cambiato una regola per sbaglio.
#
# Sta accanto agli originali perche' i suoi import relativi (./store.js,
# ./engine.js, ./dadi.js) risolvano. E' gitignorato, e a fine Fase 1 si
# cancella insieme ai test differenziali.
#
#   bash webapp/rigenera-oracolo.sh [riferimento-git]
#
# Senza argomenti prende il commit di partenza della Fase 1. Con un argomento
# prende quello che gli si dice ('' o 'DISCO' per il file su disco).
set -euo pipefail
cd "$(dirname "$0")/.."

# 588825bd = "il generatore seminato", l'ultimo commit prima che digitale.js
# venga toccato dall'estrazione. Da qui in poi il file cambia, l'oracolo no.
RIF="${1:-588825bd}"
DEST=webapp/public/js/_oracolo.js

if [ "$RIF" = "DISCO" ]; then
  cp webapp/public/js/digitale.js "$DEST"
else
  git show "$RIF:webapp/public/js/digitale.js" > "$DEST"
fi

# digitale.js esporta solo una manciata di funzioni interne (`_motore`, per
# test-digitale.mjs). I differenziali ne servono di piu': si aggiunge un
# secondo export con tutto cio' che serve confrontare. Va fatto qui e non a
# mano, o alla prossima rigenerazione sparisce e i test passano a vuoto.
cat >> "$DEST" <<'EOF'

// --- aggiunto da webapp/rigenera-oracolo.sh: la superficie che i test
// differenziali confrontano. Non esiste in digitale.js e non deve esistere.
export const _diff = {
  // geometria
  dentro, chiave, eq, dirExit, OPP, DELTA, arrediSet, vicini, portaCella,
  dirVerso, tileDi, nk, layout, grataChiusa, viciniGlob, esploraMosse,
  camminoGlob, celleAdiacLibere, adiacGlob, celleLibereTile, occupati, distGlob,
  // statistiche derivate
  eroe, nemStat, movimento, fascia, feriteMaxNem, saluteMax,
  specScortati, specScort, statoScortati, scortAttivo,
  primo, eroiAttivoNome, azioniOf, azioneSpesa, stordito, azioniMax,
  azioniRestano, bonusVoce, raggEroe, celleEsca, raggScortato,
  // regole d'episodio
  specCompiti, statoCompiti, compitoFatte, compitiFiniti, obiettivoFatto,
  compitoDisponibile, specOrologio, avanzaOrologio, specRogo, rogoBrucia,
  haProtezioneRogo, avanzaRogo, specCancellazione, avanzaCancellazione,
  specRitmo, avanzaRitmo, frammentiPortati, avanzaPressione,
  controllaFiloPerso, scortaPuoVincere, eroePiuAvanzato, provaRichiesta,
  applicaConseguenza, interazioneDisponibile, arredoUscita, scortLiberabile,
  caricaDi, CARICHE_SPED,
  // spawn e minaccia
  spawnRegex, spawnUno, tessLontana, destaBossSeSoglia, spawnDaTesto,
  tileAffollata,
  // chiusura e turno nemici
  controllaVittoria, chiudiFaseNemici, risolviRestoNemici,
};
EOF

echo "oracolo rigenerato da ${RIF}: $(wc -l < "$DEST") righe"

# Prova che sia importabile: un oracolo che non si carica fa passare a vuoto
# ogni differenziale, ed e' peggio di non averlo.
node --input-type=module -e "
globalThis.localStorage = { setItem(){}, getItem(){ return null }, removeItem(){} };
const m = await import('./${DEST}');
const n = Object.keys(m._diff).length;
if (!n) { console.error('FAIL: _diff vuoto'); process.exit(1); }
console.log('importabile, _diff espone ' + n + ' funzioni');
" 2>&1 | grep -vE 'Warning|Reparsing|add "type"|trace-warnings'
