# PROMPT MIDJOURNEY — Ombre su Roccamora

Obiettivo: carte, dorsi e tessere **interamente dipinti da Midjourney** (cornici,
gemme, targhe comprese), al posto della grafica vettoriale. Unico vincolo tecnico:
i generatori d'immagini non scrivono testo italiano corretto, quindi ogni prompt
chiede la carta completa **con le aree di testo vuote** (targa del titolo e
pannello del testo lasciati liberi). La tipografia si aggiunge dopo, in due modi:

- carichi le immagini in chat e il compositing nei PDF viene rifatto sopra di esse
  (titoli, testi e statistiche in italiano ai posti giusti); oppure
- le scritte le aggiungi tu in Canva/Photopea con i font del gioco
  (Old Standard TT per il testo, IM Fell English SC per i titoli).

I **dorsi** non hanno testo critico: quelli escono finiti direttamente.

**Coerenza:** genera per prima la carta dell'Adepto, scegli la migliore, copia il
suo URL e aggiungi ` --sref <url>` in coda a tutti i prompt successivi.

Suffisso anti-scritte già incluso in ogni prompt: `--no text, letters, words, watermark`.

---

## Carte Minaccia complete (fronte, con aree di testo vuote)

**Adepto Incappucciato**
```
complete ornate dark fantasy playing card design, carved gold filigree frame with ruby gems on black, empty scroll banner at the top, central painting of a hooded cultist in grey undertaker robes with smooth featureless wax mask holding a foundry sickle, empty dark parchment text panel at the bottom, 1889 gaslamp gothic, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Il Custode della Cera (boss)**
```
complete ornate dark fantasy playing card design, carved gold filigree frame with ruby gems on black, empty scroll banner at the top, central painting of a towering giant encased in layers of melted black and ivory wax with a faceless smooth head, glowing seams of candlelight in the cracks, empty dark parchment text panel at the bottom, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Il canto cresce (timer)**
```
complete ornate dark fantasy playing card design, carved gold filigree frame with ruby gems on black, empty scroll banner at the top, central painting of dozens of hooded figures singing in a drowned crypt with visible sound ripples on dark water, empty dark parchment text panel at the bottom, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Trappola di cera**
```
complete ornate dark fantasy playing card design, carved gold filigree frame with ruby gems on black, empty scroll banner at the top, central painting of a corridor flooded with steaming molten black wax and hundreds of burning black candles, empty dark parchment text panel at the bottom, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Presagio / Sussurri**
```
complete ornate dark fantasy playing card design, carved gold filigree frame with ruby gems on black, empty scroll banner at the top, central painting of a single wide-open eye reflected in black canal water with ripples forming a wave sigil, empty dark parchment text panel at the bottom, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

## Dorsi (finiti, senza ritocchi)

**Dorso carte Minaccia**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round medallion with three stacked engraved waves, deep teal and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no text, letters, words, watermark
```

**Dorso carte Luogo**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round empty medallion for a number, deep crimson and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no text, letters, words, watermark
```

## Carte Luogo (orizzontali, pannello testo vuoto)

Sostituisci la parte in maiuscolo con la scena del luogo (sotto trovi le otto scene).

```
complete ornate dark fantasy card design in landscape format, carved gold filigree frame with ruby gems on deep crimson, empty scroll banner at the top, wide central painting of SCENA, large empty aged parchment panel in the lower half for text, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:2 --style raw --no text, letters, words, watermark
```

Scene: **1** interior of a bell tower at 3am with three bronze bells and black wax on a spiral staircase · **2** humble candlelit canal-side room with a silver violin string on the table and a worried woman · **3** smoky canal tavern full of boatmen playing cards under an oil lamp · **4** nervous priest in a candlelit sacristy with a crypt door barred by new planks · **5** abandoned luthier workshop with violins hanging like game and a silver tuning fork on the workbench · **6** derelict warehouses over black still water with branded crates and a night watchman · **7** dusty municipal archive with a forbidden folio open on a lectern · **8** cluttered 19th century police office with a brigadier avoiding eye contact

## Schede eroe (ritratto incorniciato, resto vuoto)

Un prompt per eroe: sostituisci RITRATTO con la descrizione.

```
dark fantasy character portrait in an ornate carved gold frame with ruby gems, RITRATTO, victorian 1889 attire, three-quarter view, canal city at night behind, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no text, letters, words, watermark
```

Ritratti: **Elena** sharp-eyed woman in her 30s in a dark tailored coat with a magnifying lens on a chain and a walking cane · **Attilio** weary bearded physician with leather medical bag, round spectacles and bloodstained cuffs · **Sibilla** pale woman with silver-streaked hair holding an obsidian pendulum, chalk-dusted fingers · **Nino** wiry smirking man with lockpicks between his fingers, coiled rope and grappling hook on his shoulder · **Carla** determined young woman with a brass folding camera and ink-stained hands · **Ottone** burly jovial butcher with a heavy cleaver over his shoulder, leather apron, wine flask on his belt, hearty laugh, in front of a smoky tavern

## Tessere mappa (complete)

Una per tessera: sostituisci AMBIENTE.

```
top-down hand-drawn dungeon map tile on aged parchment, ink linework with crosshatched thick stone walls, AMBIENTE, faint 4x4 square grid over the floor, torn parchment edges, antique cartography style, warm sepia with teal water accents --ar 1:1 --style raw --no text, letters, words, watermark
```

Ambienti: **T1** loading dock with black canal water along one edge and mooring posts · **T2** warehouse room packed with stacked wooden crates branded with a wave · **T3** narrow corridor lined with hundreds of black candles and pooled wax · **T4** cluttered office with a desk covered in sheet music and a straw bed · **T5** slick stone staircase descending into darkness · **T6** underground crypt with a central altar in a ring of candles and a barred prison cell in the corner

## Extra

**Sigillo della Società (per lettera e regolamento)**
```
wax seal emblem, letters S and L intertwined with a single engraved wave, deep red wax with gold engraving, centered on black, product photography style, high detail --ar 1:1 --style raw --no watermark
```

**Mappa di campagna di Roccamora (poster da appendere)**
```
antique hand-drawn city map of a gothic canal city, bird's eye view, ink and watercolor on aged parchment, a great cathedral with bell tower at the center, winding canals dividing eight distinct districts, small warehouses along a dark lower canal, tiny rooftops, bridges and mooring posts, decorative compass rose and sea-serpent flourish in the corners, 1889 cartography style, muted teal water and sepia buildings with crimson accents --ar 3:4 --style raw --no text, letters, words, watermark
```
Uso: stampala in A4/A3 e appendila; dopo ogni episodio marcate i luoghi "accordati" dal
culto con un segno a onda e incollate accanto i Frammenti. Caricandola in chat, le
etichette dei luoghi (1–8), i riquadri per i Frammenti e la legenda vengono composte
sopra in tipografia italiana.

## Flusso di lavoro consigliato

1. Genera l'Adepto → scegli → upscala → copia URL → aggiungi `--sref <url>` a tutto.
2. Genera dorsi e tessere (finiti) e i fronti (con aree vuote).
3. Carica tutto in chat: il compositing rimette titoli, testi, statistiche e numeri
   in italiano sopra le tue immagini, e i PDF vengono rigenerati con le stesse
   regole di stampa fronte/retro. In alternativa: Canva/Photopea con Old Standard
   TT e IM Fell English SC.
