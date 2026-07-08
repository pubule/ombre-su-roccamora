# PROMPT MIDJOURNEY — Ombre su Corvasca

Libreria di prompt per generare le illustrazioni del gioco mantenendo uno stile
coerente tra loro e con la grafica dei PDF (gotico ottocentesco, palette
verde-acqua/cremisi/oro su fondi notturni). Funzionano anche su DALL-E,
Leonardo.ai e Stable Diffusion con piccoli adattamenti.

## Stile base (da accodare a OGNI prompt)

```
dark fantasy trading card illustration, 1889 gaslamp gothic, canal city at night,
oil painting, dramatic candlelight, muted teal and crimson palette with gold
accents, heavy fog, ominous mood, highly detailed --ar 3:4 --style raw
```

Per coerenza tra immagini: genera la prima che ti piace, poi riusa il suo URL come
riferimento di stile con `--sref <url>` (e in alternativa fissa `--seed <numero>`).
Formato: `--ar 3:4` per le carte, `--ar 4:3` per le carte Luogo orizzontali,
`--ar 1:1` per i medaglioni e i token.

## Nemici e minacce

- **Adepto Incappucciato** — `hooded cultist in grey robes with smooth wax mask,
  holding a foundry sickle, black candle wax dripping from sleeves` + stile base
- **Il Custode della Cera (boss)** — `towering giant encased in layers of melted
  black and ivory wax, faceless smooth head, glowing seams of candlelight in the
  cracks, standing before an altar ringed with black candles` + stile base
- **Il canto cresce (timer)** — `dozens of hooded figures singing in a drowned
  crypt, sound ripples visible in dark water, black candles` + stile base
- **Trappola di cera** — `floor of a corridor flooded with steaming molten wax,
  hundreds of burning black candles along the walls` + stile base
- **Presagio / Sussurri** — `a single wide-open eye reflected in black canal
  water, ripples forming a wave sigil` + stile base

## Eroi della Società del Lume (ritratti per le schede)

Aggiungi a ciascuno: `character portrait, three-quarter view, victorian 1889
attire` + stile base.

- **Elena Fosco, investigatrice** — `sharp-eyed woman in her 30s, dark tailored
  coat, magnifying lens on a chain, walking cane`
- **Dott. Attilio Marn, medico** — `weary bearded physician with leather medical
  bag, round spectacles, bloodstained cuffs`
- **Sibilla Reve, occultista** — `pale woman with silver-streaked hair, obsidian
  pendulum, chalk-dusted fingers, knowing gaze`
- **Nino "Grimaldello" Cauto, ladro** — `wiry smirking man with lockpicks between
  his fingers, coiled rope and grappling hook on his shoulder`
- **Carla Dosti, giornalista** — `determined young woman with a brass folding
  camera, press notes tucked in her coat, ink-stained hands`

## Luoghi (illustrazioni per le carte Indagine, --ar 4:3)

- **Campanile** — `interior of a bell tower at 3am, great bronze bells, black wax
  dripping down a spiral staircase`
- **Casa di Ruggero** — `humble canal-side room, a silver violin string glinting
  on a wooden table, worried woman by a candle`
- **Taverna del Ponte Rotto** — `smoky canal tavern full of boatmen, cards and
  cheap wine, rain on the windows`
- **Sagrestia** — `nervous priest in a candlelit sacristy, barred crypt door,
  hymn board showing number 315`
- **Bottega del liutaio** — `abandoned luthier workshop, violins hanging like
  game, a silver tuning fork engraved with a wave on the workbench`
- **Canale Basso** — `derelict warehouses over black still water, crates branded
  with a wave symbol, lone night watchman with a lantern`
- **Archivio Civico** — `dusty municipal archive, forbidden 1741 folio open on a
  lectern, wax seal shaped like a wave`
- **Magazzino delle Cere** — `abandoned wax warehouse on a canal at night, faint
  candlelight through broken shutters, singing heard within`

## Elementi grafici

- **Dorso carta** — `ornate symmetrical dark fantasy card back template, engraved
  gold filigree frame with ruby gems, central medallion with three stacked waves,
  deep teal and black --ar 3:4 --style raw` (variante rosso scuro per le carte Luogo)
- **Texture tessere** — `top-down hand-drawn dungeon map tile, ink on aged
  parchment, crosshatched stone walls, Dyson Logos style, warehouse interior with
  crates --ar 1:1` (varianti: `corridor of black candles`, `underground crypt
  with altar and prison cell`, `dock with black water`)
- **Sigillo della Società** — `wax seal emblem, letter S and L intertwined with a
  wave, engraved gold on deep red, vector style, centered --ar 1:1`

## Consigli d'uso

1. Genera in batch di 4, tieni la migliore, upscala.
2. Post-produzione veloce: porta tutto alla stessa temperatura colore
   (teal/cremisi) con un unico filtro in Canva/Photopea, così anche immagini di
   sessioni diverse sembrano della stessa mano.
3. Le illustrazioni vanno nel **medaglione** delle carte Minaccia, nel pannello
   superiore delle carte Luogo o come ritratto nelle schede: le cornici, gemme e
   targhe restano quelle vettoriali dei PDF. Se carichi le immagini nella chat del
   progetto, il compositing nei PDF può essere rifatto automaticamente.
