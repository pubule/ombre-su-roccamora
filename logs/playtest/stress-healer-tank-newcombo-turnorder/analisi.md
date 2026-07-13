# Analisi — sessione "stress-healer-tank-newcombo-turnorder"

## Aggiornamento — modello di movimento/distanza nemici (supersede le sezioni sotto)

Dopo questa analisi l'utente ha fatto notare che nei log i nemici colpiscono
il gruppo indipendentemente da dove la carta li piazza ("uscita più lontana",
"tessera rivelata più lontana"...) — la regola vera (gen_docs.py righe
277-280) impone invece che ogni nemico **si muova del suo Movimento verso
l'eroe più vicino** e attacchi solo se **adiacente**; il simulatore invece
faceva attaccare ogni nemico piazzato, ogni round, chiunque, senza mai
controllare la distanza. Insieme, sono stati corretti in
`scripts/simulate_playtest.py`:

1. **Distanza/Movimento nemici**: ogni nemico piazzato riceve ora una
   `distanza` (caselle) dedotta dal testo della carta (adiacente=0, stessa
   tessera=6, tessera diversa=12, dalla Banchina T1=dinamica in base a
   quante tessere il gruppo ha già percorso), decrementata ogni round dal
   suo Movimento; attacca solo quando raggiunge 0. Le carte "si attiva
   subito" (Cani dei Moli, Unghie sulla Pietra, Lama nel Buio) restano
   invariate. Le tessere sono griglie 4x4 (`scripts/tiles/generate-tiles.js`),
   6 caselle è la diagonale Manhattan massima — da cui la stima.
2. **Il gruppo "guadagna" 6 caselle quando avanza di tessera**: i nemici con
   Movimento pari o inferiore restano indietro quando il gruppo è in
   transito (path principale e rientro), colmano la distanza solo quando il
   gruppo è fermo (scontro col Custode a T6). Corretto anche un bug gemello
   nel bersaglio extra di Colpo da macello (Ottone), che ignorava la
   distanza e colpiva nemici ancora lontani.
3. **SLANCIO/PREPARATI**: mai raggiunto nelle run precedenti perché
   l'euristica Indagine spendeva sempre tutte le 6 ore sui nuovi luoghi
   prima di arrivare a un'eventuale rivisita. Ora il gruppo, una volta in
   mano il nucleo garantito (≥1 Approfondimento letto), con 2 ore o meno
   rimaste preferisce chiudere e banchare il Vantaggio piuttosto che
   visitare un ultimo luogo non strutturale — raggiunge PREPARATI in tutte
   e 5 le run rilanciate (`logs/playtest/stress-movimento-distanza-slancio-v3/`).

**Effetto sulle conclusioni sopra**: con la distanza modellata, la maggior
parte dei nemici piazzati lontano (tutte le carte non "subito") **non
raggiunge mai** un gruppo che continua ad avanzare — restano indietro,
alcuni (Fonditore, Movimento 2) sempre di più round dopo round, coerente col
suo stesso testo ("non corre mai"). Rilanciando le 5 run con lo stesso seed,
**nessun eroe va più a terra in nessuna delle 5 run** (prima capitava in
run-06/07/08, anche al netto del bug Custode): la minaccia reale arriva solo
da chi spawna già adiacente/"si attiva subito" e dal pacchetto del Custode
a T6. Le sezioni Ansia/Immersività sotto restano valide come *lettura del
log bacato*, ma vanno riletta con questo in mente: la vera difficoltà del
gioco, letta correttamente, sembra più bassa di quanto i log originali
suggerissero. La sezione Giocabilità sui turni "nessun bersaglio" invece si
rafforza: nei log corretti la quota sale al 50-82% dei turni-eroe, perché
ora un eroe non può più colpire un nemico ancora lontano (prima poteva,
sbagliando). Effetto collaterale non cercato: con l'euristica che ora banca
ore invece di rincorrere ogni luogo, il diapason (Luogo 5, opzionale) viene
trovato meno spesso — coerente con la nota di design già in `gen_cards.py`
("il diapason non ha priorità speciale, arrivare al Custode senza è un
esito legittimo"), quindi non trattato come problema.

Log puliti in `logs/playtest/stress-movimento-distanza-slancio-v3/`.

---


Party testati (mai ripetuti da run-01/02/03): senza healer a 5, minimo a 2
con healer+tank, "cervelli" ACU alto/VIG basso senza tank, i 5 eroi più
recenti tutti insieme, ordine di turno avverso per le abilità one-shot.

## Bug nel simulatore trovato durante l'analisi (non nel gioco) — CORRETTO

`fase_minaccia()` in `scripts/simulate_playtest.py` (riga ~458-467)
applicava "Il Custode recupera 1 ferita e si attiva subito" delle carte
CRESCENDO (IL CANTO SALE/CORO RISPONDE/CANTO CRESCE) **anche dopo che il
Custode era già stato dichiarato SCONFITTO**. La carta vera dice "Se è
già in gioco"; il Regolamento (gen_docs.py righe 530-533) chiarisce che
oltre il terzo segnalino Canto l'unico effetto ulteriore è la carta
Minaccia extra, non la resurrezione del boss. Corretto aggiungendo il
controllo `custode['fer'] > 0` prima del recupero (altrimenti si logga
solo che il Custode resta sconfitto). Run-04/05/06/07/08 rilanciate con
gli stessi seed in `logs/playtest/stress-healer-tank-newcombo-turnorder-fixed/`
per numeri puliti — le sezioni sotto usano i dati corretti. Differenze
principali col log originale: run-05 15→13 round, run-06 12→11 round
(ma ora è **Mora Fanti**, non Brera, a scendere a terra), run-07 11→10
round (nessuno più a terra), run-08 stesso 11 round ma **nessuno più a
terra** (prima Brera scendeva a 0 per un colpo del Custode "resuscitato"
un round prima).

## Coinvolgimento

- Il "leggere la scena" (ACUME Media) e le scelte di luogo restano
  automatiche (euristica fissa, limite dichiarato nell'intestazione dello
  script) — nessuna nuova osservazione rispetto alle run precedenti.
- **Scelta reale osservata**: in tre run su cinque (run-04 riga 22,
  run-06 riga 28, run-08 riga 24) il gruppo trova "LA CHIAVE DELLA CELLA"
  a T4 e la prova di NERVI la fa scattare comunque ("oggetto rischioso" —
  la scelta di prenderlo è già presa a monte, poi si tira le conseguenze).
  Funziona come da design: mai un vicolo cieco, ma la tensione c'è.
- **Le abilità "esca/rimozione" trovano bersaglio anche con ordine di
  turno avverso**: run-08 mette Ottone ed Elena (alto danno) prima di
  Brera e Carbone (abilità one-shot su bersaglio raro). Malacarne di
  Brera scatta comunque 2 volte (righe 30, 49-esimo equivalente) e Esca
  di Carbone 3 volte: le carte Minaccia piazzano quasi sempre 2+ nemici
  insieme (IL BRANCO, RONDA), quindi Ottone da solo non li ripulisce mai
  prima che tocchi a loro. Il timore della sezione 2 del piano di stress
  non si è materializzato in nessuna delle run.

## Ansia

- **Run-05 (2 eroi, minimo, con healer)**, dati corretti: nonostante
  Pronto Soccorso di Attilio (3 usi), la spedizione finisce con
  **Ottone 1/8 e Attilio 4/7** (riga 137) dopo 13 round — il duo più
  "sicuro" possibile (tank + healer) arriva comunque a un soffio dal
  wipe: un solo colpo in più del Sicario sull'ultimo scambio e Ottone
  scendeva a terra. Anche corretto il bug, la tensione era reale, non un
  artefatto.
- **Run-06 (cervelli senza tank)**, dati corretti: Mora Fanti scende a
  **1/7 Salute** (riga 194, fallita una prova NERVI su CERA SOTTO I PIEDI)
  e **va a terra il round dopo** (riga 216-217, 1 danno da un Adepto
  banale) — il party "di carta" (VIG 1 quasi ovunque, Difesa 8 piatta)
  non solo si avvicina al wipe, stavolta un eroe scende davvero, per un
  colpo minore su chi era già al limite. Coerente con l'assenza di
  healer E tank insieme, non uno dei due soli.
- **Run-04 (senza Attilio, ma con Ottone)**: nessuno scende sotto 5/8 di
  Salute in tutta la run (riga 166-170). L'assenza dell'unico healer del
  gioco **non crea ansia percepibile quando c'è comunque un tank con
  Difesa/Vigore alti**: Ottone assorbe quasi tutti i colpi diretti a lui
  (Difesa 8, VIG 3) e gli altri restano quasi sempre fuori portata dei
  nemici superstiti. Il contrasto con run-06 suggerisce che il vero
  fattore di rischio non è "c'è Attilio sì/no" ma "c'è **qualcuno con
  Difesa/Vigore sopra la media** sì/no" — Attilio da solo cura, non tank-a.

## Immersività

- Il momento più cinematografico del lotto: run-08, Ottone che regge da
  solo il gruppo e scende a **1/8 di Salute** (riga 189) per due morsi di
  Cane dei Moli di fila mentre il resto del party è già ferito (Brera
  2/6, Carbone 2/6) — la spedizione finisce comunque in vittoria, nessuno
  a terra, ma per un margine minimo: letto ad alta voce è una vera ultima
  resistenza, e stavolta senza correzioni da fare al log.
- Run-06 riga 87: "ELENA FOSCO fa vibrare il diapason d'argento sul
  Custode: Difesa 9->5, salta la prossima attivazione" seguito subito da
  tre nemici abbattuti in fila (righe 88-94) — il diapason funziona come
  la "mossa a effetto" che il testo promette, non solo un numero su
  scheda.
- Il rumore di fondo resta alto: "nessun bersaglio, avanza / assiste il
  gruppo" compare così spesso (vedi Giocabilità) che diluisce i momenti
  buoni — un narratore che legge il log ad alta voce dovrebbe saltare
  quelle righe, altrimenti la sensazione è di ripetizione, non di scena.

## Giocabilità

- **Turni senza azione, quantificati** (dati corretti): su questa
  sessione, la riga "nessun bersaglio, avanza / assiste il gruppo" copre
  tra il 32% (run-08, 14/44 turni-eroe) e il 63% (run-04, 25/40
  turni-eroe) di tutti i turni-eroe della spedizione. Non è un'anomalia isolata: succede in
  tutte e 5 le run, di più nei party numerosi (4-5 eroi) contro pochi
  nemici alla volta. È coerente con un'economia a "pochi nemici alla
  volta, tanti eroi": ogni round raramente ci sono abbastanza bersagli
  per tutti. Vale la pena verificare a tavolino se questo si sente come
  "il gruppo circonda e abbatte insieme" (voluto) o come "3 giocatori su 5
  aspettano il proprio turno senza far niente" (da correggere) — non lo
  decido da un log, serve un tavolo vero.
- Abilità osservate in uso almeno una volta in questa sessione: Pronto
  Soccorso (Attilio), Colpo da macello (Ottone), Voce ferma (Serra),
  Litania (Marani, 1 sola volta — run-07 riga 23), Vi conosco Malacarne
  (Brera), Esca preziosa (Carbone), diapason (oggetto, run-06/07).
  **Mai vista**: Scambio di mano di Mora Fanti (sposta equip/oggetto tra
  eroi non adiacenti) — coerente col fatto che è un'abilità di
  convenienza situazionale, non offensiva: la sua assenza nei log non
  segnala un problema, richiede solo una scena con eroi separati sulla
  tessera per emergere (il modello a "blocco unico" del simulatore lo
  rende strutturalmente raro da vedere qui, vedi limiti dichiarati in
  testa allo script).
- Mazzo Minaccia: in run-06 (riga 236) si esaurisce e si rimescola una
  volta durante una spedizione di 12 round — nessun problema, il
  meccanismo di rimescolo funziona come da regola.
- Il bug di resurrezione del Custode (vedi sopra) è di per sé un problema
  di giocabilità del *simulatore*, non del gioco: se non corretto,
  qualunque futura run che superi ~5 round di combattimento contro il
  Custode con almeno 1 carta CRESCENDO nel mazzo residuo produrrà numeri
  di round/danno non rappresentativi.
