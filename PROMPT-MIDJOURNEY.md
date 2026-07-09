# PROMPT MIDJOURNEY — Ombre su Roccamora

Flusso a due binari: i prompt qui sotto generano **solo i soggetti** (dipinti a
pieno formato, senza cornice né scritte); le **cornici** le generi a parte una
volta sola (sezione in fondo) e il montaggio finale — cornice + dipinto + testi
italiani — avviene in compositing (carica tutto in chat) o in Canva/Photopea.

**Coerenza:** genera per primo l'Adepto, scegli il migliore, copia il suo URL e
aggiungi ` --sref <url> --sw 800` in coda a tutti i prompt successivi.

Ogni prompt include già `--no frame, border, card, text, letters, watermark`.

---

## Soggetti — Minacce e nemici (--ar 3:4)

**Adepto Incappucciato**
```
full bleed dark fantasy painting, hooded cultist in grey undertaker robes with smooth featureless wax mask, holding a foundry sickle, black candle wax dripping from sleeves, 1889 gaslamp gothic canal city at night behind, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents, heavy fog --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Il Custode della Cera (boss)**
```
full bleed dark fantasy painting, towering giant encased in layers of melted black and ivory wax, faceless smooth head with faint traces of another face beneath, glowing seams of candlelight in the cracks, stone altar ringed with black candles behind, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Cane dei Moli**
```
full bleed dark fantasy painting, feral guard dog leaping across a dark dock, muzzle crusted with black wax, matted fur, glowing pale eyes, mooring posts and still black water behind, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Il Fonditore**
```
full bleed dark fantasy painting, heavy-set cultist artisan in a scorched leather apron and wax-smeared hood, carrying a huge iron ladle overflowing with molten black wax, slow menacing stride through candlelit warehouse, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Il canto cresce (timer)**
```
full bleed dark fantasy painting, dozens of hooded figures singing in a drowned crypt, visible sound ripples spreading on dark water, black candles reflected on the surface, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Trappola di cera**
```
full bleed dark fantasy painting, warehouse corridor flooded with steaming molten black wax, hundreds of burning black candles along wooden shelves, glistening floor, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

**Presagio / Sussurri**
```
full bleed dark fantasy painting, a single wide-open human eye reflected in black canal water, ripples forming a wave sigil, extinguished candle in the foreground, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents, heavy fog --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

## Soggetti — Eroi (ritratti, --ar 3:4)

Sostituisci RITRATTO e usa questo prompt unico:
```
full bleed dark fantasy character portrait, RITRATTO, victorian 1889 attire, three-quarter view, gaslamp gothic canal city at night behind, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

Ritratti — **Elena** sharp-eyed woman in her 30s in a dark tailored coat with a magnifying lens on a chain and a walking cane · **Attilio** weary bearded physician with leather medical bag, round spectacles and bloodstained cuffs · **Sibilla** pale woman with silver-streaked hair holding an obsidian pendulum, chalk-dusted fingers · **Nino** wiry smirking man with lockpicks between his fingers, coiled rope and grappling hook on his shoulder · **Carla** determined young woman with a brass folding camera and ink-stained hands · **Ottone** burly jovial butcher with a heavy cleaver over his shoulder, leather apron, wine flask on his belt, hearty laugh, in front of a smoky tavern

## Soggetti — Luoghi (orizzontali, --ar 3:2)

Sostituisci SCENA e usa questo prompt unico:
```
full bleed dark fantasy painting in landscape format, SCENA, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents --ar 3:2 --style raw --no frame, border, card, text, letters, watermark
```

Scene — **1** interior of a bell tower at 3am with three bronze bells and black wax on a spiral staircase · **2** humble candlelit canal-side room with a silver violin string on the table and a worried woman · **3** smoky canal tavern full of boatmen playing cards under an oil lamp · **4** nervous priest in a candlelit sacristy with a crypt door barred by new planks · **5** abandoned luthier workshop with violins hanging like game and a silver tuning fork on the workbench · **6** derelict warehouses over black still water with branded crates and a night watchman · **7** dusty municipal archive with a forbidden folio open on a lectern · **8** cluttered 19th century police office with a brigadier avoiding eye contact · **copertina spedizione** abandoned wax warehouse on a canal at night, faint candlelight through broken shutters

## Cornici (una sola generazione, poi si riusa ovunque)

**Cornice carte verticali (Minacce, eroi)** — centro vuoto e scuro:
```
ornate dark fantasy card frame template, carved gold filigree border with ruby and teal gems on black, empty scroll banner at the top, empty dark parchment text panel at the bottom, the large central area completely plain dark and empty, victorian gothic, perfectly symmetrical --ar 3:4 --style raw --no text, letters, words, watermark
```

**Cornice carte orizzontali (Luoghi)**:
```
ornate dark fantasy card frame template in landscape format, carved gold filigree border with ruby gems on deep crimson, empty scroll banner at the top, wide empty aged parchment panel in the lower half, the upper central area completely plain dark and empty, victorian gothic, perfectly symmetrical --ar 3:2 --style raw --no text, letters, words, watermark
```

Suggerimento: per il montaggio serve che il centro sia davvero vuoto; se Midjourney
ci disegna dentro qualcosa, usa Vary Region e cancella il centro, oppure va bene
comunque: nel compositing il dipinto viene sovrapposto al centro coprendolo.

## Finiti così come escono

**Dorso carte Minaccia**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round medallion with three stacked engraved waves, deep teal and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no text, letters, words, watermark
```

**Dorso carte Luogo**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round empty medallion for a number, deep crimson and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no text, letters, words, watermark
```

**Tessere mappa** (sostituisci AMBIENTE):
```
top-down hand-drawn dungeon map tile on aged parchment, ink linework with crosshatched thick stone walls, AMBIENTE, faint 4x4 square grid over the floor, torn parchment edges, antique cartography style, warm sepia with teal water accents --ar 1:1 --style raw --no text, letters, words, watermark
```
Ambienti — **T1** loading dock with black canal water along one edge and mooring posts · **T2** warehouse room packed with stacked wooden crates branded with a wave · **T3** narrow corridor lined with hundreds of black candles and pooled wax · **T4** cluttered office with a desk covered in sheet music and a straw bed · **T5** slick stone staircase descending into darkness · **T6** underground crypt with a central altar in a ring of candles and a barred prison cell in the corner

**Mappa di campagna di Roccamora (poster)**
```
antique hand-drawn city map of a gothic canal city, bird's eye view, ink and watercolor on aged parchment, a great cathedral with bell tower at the center, winding canals dividing eight distinct districts, small warehouses along a dark lower canal, tiny rooftops, bridges and mooring posts, decorative compass rose and sea-serpent flourish in the corners, 1889 cartography style, muted teal water and sepia buildings with crimson accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Sigillo della Società**
```
wax seal emblem, letters S and L intertwined with a single engraved wave, deep red wax with gold engraving, centered on black, product photography style, high detail --ar 1:1 --style raw --no watermark
```

## Montaggio

1. Genera l'Adepto → `--sref` + `--sw 800` su tutto il resto.
2. Genera le due cornici (una volta), i dorsi, le tessere, la mappa.
3. Carica in chat cornici + soggetti: il compositing monta ogni dipinto nella sua
   cornice, aggiunge titoli, flavor, effetti e statistiche in italiano e rigenera i
   PDF con l'impaginazione di stampa fronte/retro. In alternativa fai il montaggio
   in Canva/Photopea (font: Old Standard TT e IM Fell English SC).
