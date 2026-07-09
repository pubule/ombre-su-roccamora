# PROMPT GEMINI (Nano Banana) — Reperti stampabili

Genera i 3 reperti dell'Episodio 1 componendo testo + pergamena direttamente in
Gemini 2.5 Flash Image ("Nano Banana"), invece dello script Playwright in
`scripts/reperti/`. Il vantaggio: il modello inchiostra il testo dentro la
texture della carta (pieghe, macchie, luce) invece di sovrapporre un
rettangolo/pannello, quindi niente "cartellino incollato".

## Come usare

1. Apri Gemini, carica come immagine di riferimento `artworks/Sfondo pergamena
   per i Reperti.png`.
2. Incolla il prompt del reperto che vuoi (uno alla volta, sotto).
3. Se il testo esce troppo nitido/stampato invece che manoscritto, o il
   modello aggiunge comunque un box, ripeti chiedendo esplicitamente
   "remove any background panel behind the text, ink it directly into the
   paper fibers".
4. Salva il risultato in `reperti/Reperto A - Diario di Ruggero.png` (e B, C),
   sovrascrivendo l'output dello script Playwright se lo tieni come fallback.

Testi presi 1:1 da `src/gen_reperti.py` (fonte autoritativa del gioco).

---

## Reperto A — Diario di Ruggero

```
Using the attached aged parchment paper photograph as the base image, add the text below directly onto the paper surface as realistic period ink handwriting — as if physically written on this exact sheet decades ago. The text must follow the paper's creases, stains, burn marks and uneven lighting (darker where the paper is darker, catching highlights where it's lit), with slightly irregular ink absorption at the edges of each letter. Do NOT add any rectangle, panel, box, drop shadow, glow, halo, vignette, or flat-color/lightened background behind the text — it must look like ink soaked into this specific paper, not text pasted on top of it. Keep the parchment's photographic texture, folds and torn edges completely unchanged.

TITLE (top right, small aged italic print): "Reperto A — dal diario di Ruggero Alvise, campanaro"

BODY (brown cursive handwritten ink, diary entries with a blank line between each, upper half of the page):
"12 del mese. Stanotte di nuovo la musica. Viene da sotto la cripta, ne sono certo: il pavimento la beve e la restituisce alle mie campane. Don Callisto dice che sogno.

15 del mese. Ho trovato una corda d'argento sui gradini della cripta. Non è roba da chiesa. L'ho portata a casa, Bice non deve spaventarsi.

19 del mese. Il liutaio sale all'organo anche di notte, ormai. Stanotte l'ho visto uscire dalla cripta con la sua chiave. Mi ha guardato. Non ha detto nulla.

21 del mese. Le mie campane suonano senza di me e io conto i rintocchi come un condannato conta i gradini. Domani scendo anch'io, e che Dio mi perdoni la curiosità."

Near the bottom of the page, set apart from the diary entries, render this last line in a lighter graphite-pencil-rubbing style — as if traced from the indentation left by a page torn out above it, fainter and grayer than the brown ink above: "...alle 3 in punto, ogni notte. Tre rintocchi, poi uno, poi cinque. Non sono io a suonare." This line must have the exact same lighting, shadow and paper texture as the rest of the sheet around it — only the ink color/tone changes to light gray, nothing else. Do NOT add any glow, halo, vignette, soft gradient, or lightened/whitened patch behind this line or any other part of the text — no area of the paper should look brighter or flatter than its surroundings just because text sits there.
```

## Reperto B — Registro delle Consegne (bottega Ferri)

```
Using the attached aged parchment paper photograph as the base image, add the text below directly onto the paper surface as realistic period ink handwriting and print — as if physically written on this exact sheet decades ago. The text must follow the paper's creases, stains and uneven lighting, ink absorption slightly irregular at letter edges. Do NOT add any rectangle, panel, box, drop shadow, glow, halo, vignette, or flat-color/lightened background behind the text — it must read as ink on this specific paper, not text pasted on top. Keep the parchment's photographic texture, folds and torn edges completely unchanged.

TITLE (centered, small-caps engraved print): "bottega b. ferri · liutaio · registro delle consegne"
SUBTITLE below it (small italic): "Reperto B — trovato aperto sul banco da lavoro"

Below the title, render a simple ruled ledger table (thin ink lines, four columns: data / fornitura / destinazione / nota), handwritten cursive entries in brown ink, one per row:

data           | fornitura                          | destinazione                          | nota
3 del mese     | sei corde di minugia, colofonia    | Teatro dell'Eco                       | saldato
7 del mese     | riparazione violoncello, ponticello| Casa Morvilli                         | saldato
10 del mese    | accordatura organo — III settimana | Cattedrale di S. Teodoro              | in opera
14 del mese    | una corda d'argento, su misura     | commessa privata                      | ritirata
18 del mese    | sedici candele di cera nera        | C.B., molo terzo                      | pagato B.F.
21 del mese    | quaranta candele di cera nera      | C.B., molo terzo, il vecchio deposito | pagato B.F.

Below the table, a hurried handwritten margin note in the same ink: "il bronzo canta, la pietra risponde, l'acqua ricorda — II mov. quasi pronto"
```

## Reperto C — Fascicolo del 1741 (Archivio Civico)

```
Using the attached aged parchment paper photograph as the base image, add the text below directly onto the paper surface as a mix of formal period printed/inked decree text and later handwritten annotations — as if physically written on this exact sheet centuries ago. The text must follow the paper's creases, stains and uneven lighting. Do NOT add any rectangle, panel, box, drop shadow, glow, halo, vignette, or flat-color/lightened background behind the text — it must read as ink on this specific paper, not text pasted on top. Keep the parchment's photographic texture, folds and torn edges completely unchanged.

TITLE (centered, small-caps engraved print): "atti del consiglio di roccamora · anno mdccxli"
SUBTITLE below it (small italic): "Reperto C — fascicolo n. 44, Archivio Civico"

Below that, a formal justified decree in dark brown ink, upright period print lettering (not cursive), with "bandisce in perpetuo", "CORO SOMMERSO" and "un'onda incisa" in bold:

"Addì XII di novembre, l'anno del Signore MDCCXLI.

Il Consiglio, udite le testimonianze de' parroci e de' barcaioli, bandisce in perpetuo la confraternita detta del CORO SOMMERSO, per pratiche contrarie a Dio ed alla quiete delle acque; la quale confraternita usava radunarsi nelle cavità sotto la Cattedrale, dove l'acqua canta, e quivi levare canti che non sono di questo mondo né per questo mondo.

Si ordina: che le dette cavità siano murate; che le campane tacciano dal vespro all'alba per un anno intero; che il sigillo della confraternita — un'onda incisa — sia scalpellato ovunque si trovi.

Chi canterà al di sotto, non si lamenti di ciò che al di sotto risponde."

In the lower-right area of the decree, place a small circular red wax seal with "S L" engraved in gold, slightly tilted, casting a soft realistic shadow on the paper (use the attached seal image `artworks/Sigillo.jpg` as reference for its design if provided as a second reference image).

Below the decree, a distinct later addition — a small bordered ledger card in a different, slightly lighter ink and more casual handwriting, titled "SCHEDA DELLE CONSULTAZIONI — fascicolo n. 44", listing three rows:
1893, marzo — don E. Callisto, per la parrocchia
1901, ottobre — G. Morvilli, storico
due mesi or sono — B. Ferri, liutaio
```
