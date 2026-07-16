# PROMPT MIDJOURNEY — Ombre su Roccamora

Flusso a due binari: i prompt qui sotto generano **solo i soggetti** (dipinti a
pieno formato, senza cornice né scritte); le **cornici** le generi a parte una
volta sola (sezione in fondo) e il montaggio finale — cornice + dipinto + testi
italiani — avviene in compositing (carica tutto in chat) o in Canva/Photopea.

**Coerenza:** genera per primo l'Adepto, scegli il migliore, copia il suo URL e
aggiungi ` --sref <url> --sw 800` in coda a tutti i prompt successivi.

Ogni prompt include già `--no frame, border, card, text, letters, watermark`.

---

## I prompt per episodio stanno in file dedicati

Questo file contiene solo i soggetti COMUNI a tutta la campagna (eroi,
Malavita, cornici, dorsi, tessere e arredi, mappe, sigillo, tabellone,
pergamene) più il workflow di coerenza. I soggetti di ogni episodio:

- `PROMPT-MIDJOURNEY-Preludio.md` — P1-P4 e i 3 oggetti del Preludio.
- `PROMPT-MIDJOURNEY-Episodio-1.md` — Minacce, Custode, Luoghi 1-8, Oggetti.

Un episodio nuovo aggiunge il SUO file `PROMPT-MIDJOURNEY-Episodio-N.md`
con questa stessa nota in testa; qui si aggiunge solo la riga di indice
(e gli eventuali soggetti davvero riusabili, es. un nemico ricorrente).

### Malavita (nemici secolari, cross-episodio)

Non hanno cera né maschera: sono la malavita dei bassifondi, riusabile in ogni
episodio. Salva i file come `artworks/Lo Sgherro.png` e `artworks/Il Sicario.png`.

**Lo Sgherro** (bravo/muscolo a pagamento)
```
full bleed dark fantasy painting, brutish dockside thug in a worn wool coat and flat cap, broken nose and cold eyes, gripping a heavy cudgel and a rusty cleaver, standing on a foggy canal wharf at night, no mask no robe, ordinary criminal, 1889 gaslamp gothic, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark, wax, mask, hood, robe, monster
```

**Il Sicario** (lama assoldata)
```
full bleed dark fantasy painting, lean silent assassin in dark tailored clothes, half his face in shadow under a low brim, a thin stiletto blade catching a glint of lamplight, poised to strike from an alley, no mask no robe, ordinary killer, 1889 gaslamp gothic, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark, wax, mask, hood, robe, monster
```

## Soggetti — Eroi (ritratti, --ar 3:4)

Sostituisci RITRATTO e usa questo prompt unico:
```
full bleed dark fantasy character portrait, RITRATTO, victorian 1889 attire, three-quarter view, gaslamp gothic canal city at night behind, oil painting, dramatic candlelight, muted teal and crimson palette with gold accents --ar 3:4 --style raw --no frame, border, card, text, letters, watermark
```

Ritratti — **Elena** sharp-eyed woman in her 30s in a dark tailored coat with a magnifying lens on a chain and a walking cane · **Attilio** weary bearded physician with leather medical bag, round spectacles and bloodstained cuffs · **Sibilla** young Romani fortune-teller in the style of Esmeralda from The Hunchback of Notre-Dame, olive skin, wild dark curly hair, gold hoop earrings and a coin-fringed headscarf, colorful layered skirts and an embroidered shawl over her victorian attire, holding an obsidian pendulum in one hand and a fanned tarot deck in the other, sharp knowing eyes · **Nino** wiry smirking man with lockpicks between his fingers, coiled rope and grappling hook on his shoulder · **Carla** determined young woman with a brass folding camera and ink-stained hands · **Ottone** burly jovial butcher with a heavy cleaver over his shoulder, leather apron, wine flask on his belt, hearty laugh, in front of a smoky tavern · **Lazzaro** (salva come `Lazzaro.png`) gaunt asylum doctor in his 50s with a immaculate dark frock coat, silver-streaked hair, piercing calm eyes, holding a worn leather notebook full of patients' transcriptions, a distant island asylum in the mist behind · **Celso** (salva come `Celso.png`) suspended exorcist priest in his 60s, worn black cassock without clerical collar, iron crucifix in his fist, tired eyes that have seen too much, faint candlelit chapel behind · **Fulgenzio** (salva come `Fulgenzio.png`) elderly occult antiquarian with a jeweler's loupe on his forehead, silver-pommeled cane, waistcoat with too many watch chains, shelves of strange relics and sewn-shut diaries behind him in a cluttered shop · **Ottavio** (salva come `Ottavio.png`) stern retired judge in his 60s with impeccable old-fashioned attire, white sideburns, heavy gaze of a man who remembers every face he sentenced, bound court files under his arm · **Mora** (salva come `Mora.png`) young woman smuggler in her 20s with very short choppy hair, weathered canal-boater's coat over a rough tunic, a small ferret peeking out of her jacket pocket, sharp street-wise eyes, faint smirk, leaning on a boat hook, misty canal and moored sandolo boat behind

## Cornici (una sola generazione, poi si riusa ovunque)

**Cornice carte verticali (Minacce, eroi, Luoghi, Indizi Nascosti, Oggetti)** — centro vuoto e scuro:
```
ornate dark fantasy card frame template, carved gold filigree border with ruby and teal gems on black, empty scroll banner at the top, empty dark parchment text panel at the bottom, the large central area completely plain dark and empty, victorian gothic, perfectly symmetrical --ar 3:4 --style raw --no text, letters, words, watermark
```
Stessa cornice per tutti i mazzi verticali, Luoghi e Indizi Nascosti inclusi
(non serve più una cornice orizzontale separata).

Suggerimento: per il montaggio serve che il centro sia davvero vuoto; se Midjourney
ci disegna dentro qualcosa, usa Vary Region e cancella il centro, oppure va bene
comunque: nel compositing il dipinto viene sovrapposto al centro coprendolo.

## Finiti così come escono

**Mappa della città** → `artworks/Mappa della città di Roccamora.png`
(usata da `src/gen_mappa.py` a piena pagina A4 verticale; finché manca, il
generatore ripiega su pergamena + avviso). Deve leggersi come una PIANTA
urbana d'epoca, non un paesaggio: vista dall'alto, canali, isolati, ponti,
un campanile e una cattedrale riconoscibili — su carta ingiallita, senza
nomi scritti (le voci vivono nello stradario generato, non nell'arte):
```
antique 1889 city map of a canal town, top-down hand-drawn cartography on aged yellowed paper, ink linework with subtle sepia and teal wash, winding canals, dense blocks of gabled houses, bridges, a bell tower and a cathedral, docks and warehouses along the west canal, decorative compass rose, no labels, no text, gaslamp gothic atmosphere --ar 3:4 --style raw --no frame, border, letters, words, watermark, figures, people
```

**Sfondo Tabellone** → `artworks/Tabellone.png` (opzionale: `src/gen_board.py`
funziona già con uno sfondo scuro procedurale, questo lo sostituisce). Deve
restare MOLTO scuro: sopra ci vanno testo/tratteggi color oro a basso
contrasto (traccia Canto, slot mazzo Minaccia+scarti, angolo d'ingresso) —
uno sfondo troppo chiaro o troppo "affollato" li rende illeggibili:
```
full bleed dark fantasy painting, worn black stone dock floor beside still black canal water at night, faint gold filigree markings barely visible worn into the stone, sparse dripped black wax, empty and uncluttered, 1889 gaslamp gothic, oil painting, muted teal and crimson palette with gold accents, very dark and atmospheric --ar 3:4 --style raw --no frame, border, card, text, letters, watermark, figures, people
```

I dorsi hanno il tipo di carta **inciso direttamente nell'arte** (parola in
maiuscolo blackletter incisa nel medaglione centrale), non sovrapposto via
codice: niente overlay in `generate-print-sheets.js`, il file generato è
finito così com'è. Nota su Midjourney e testo: anche una singola parola può
uscire storpiata — genera più varianti e scegli la più leggibile, non
aspettarti un risultato pulito al primo tentativo. Salva ogni dorso come
`artworks/Dorso <Nome>.png` (es. `Dorso Eroe.png`, `Dorso Indizio Nascosto.png`
— vedi `SIMPLE_DECKS` in `generate-print-sheets.js` per i nomi esatti attesi).

**Dorso carte Eroe**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, amber gems, central round medallion with a wave sigil above the engraved gothic blackletter word "EROE", warm bone and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Nemico**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, sickly green gems, central round medallion with a smooth featureless wax mask above the engraved gothic blackletter word "NEMICO", black and deep grey, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Minaccia**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round medallion with three stacked engraved waves above the engraved gothic blackletter word "MINACCIA", deep teal and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Luogo**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, ruby gems, central round medallion with the engraved gothic blackletter word "LUOGO", deep crimson and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Indizio Nascosto** — mazzo separato, dorso diverso da quello dei
Luoghi cosi' resta irriconoscibile finche' non si scopre. Copre anche Testimoni
e Referti: sono lo stesso mazzo coperto unico in gioco (vedi regolamento), ma
ora con **dorsi distinti per tipo** — stessa famiglia visiva (teal, stesso
stile), icona e parola diverse, cosi' si riconosce il tipo ma MAI il luogo
(quello sta solo su `pdf/Episodio 1/Luoghi.pdf`, mai sulla carta):
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, teal gems, central round medallion with a single closed eye above the engraved gothic blackletter word "INDIZIO", deep midnight blue and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Testimone** (famiglia Approfondimenti, stesso stile dell'Indizio)
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, teal gems, central round medallion with a listening ear above the engraved gothic blackletter word "TESTIMONE", deep midnight blue and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Referto** (famiglia Approfondimenti, stesso stile dell'Indizio)
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, teal gems, central round medallion with a surgeon's loupe above the engraved gothic blackletter word "REFERTO", deep midnight blue and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso carte Oggetto**
```
ornate symmetrical dark fantasy card back, engraved gold filigree covering the whole surface, bronze gems, central round medallion with a crossed key and quill above the engraved gothic blackletter word "OGGETTO", warm sepia and black, victorian gothic, perfectly symmetrical, full bleed --ar 3:4 --style raw --no watermark, signature, blurry text
```

**Dorso tessere (T1-T6)** — retro delle tessere di Spedizione, da stampare
sul verso quando si stampano fronte/retro (le tessere restano coperte finché
un eroe non ci entra, vedi Regolamento). I codici T1-T6 sono **posizioni nel
mazzo, non stanze fisse**: da episodio a episodio la tessera dietro "T3" può
essere una stanza completamente diversa (qui in Episodio 1 è il Corridoio
delle Candele, altrove no), quindi il dorso non deve alludere al contenuto
della stanza — stessa icona neutra (il sigillo/onda della Società, già
ricorrente nel resto dell'arte) su tutti e 6, cambia solo il codice, così
resta riusabile ovunque e non spoilera cosa c'è dietro. Stessa idea dei
dorsi carta (testo inciso nell'arte, non overlay via codice) ma quadrato
`--ar 1:1` (la tessera è 200×200mm) e con un **codice di 2 caratteri
invece di una parola intera** — è un esperimento: un codice corto è più
difficile da rendere leggibile per Midjourney di una parola lunga, genera
più varianti del solito e scarta quelle dove il codice esce storpiato o
irriconoscibile. Salva come `artworks/Dorso Tessera T1.png` ...
`Dorso Tessera T6.png`.

```
ornate symmetrical dark fantasy map-tile back, engraved gold filigree covering the whole surface on aged parchment, teal accents, central round medallion with a wave sigil above the engraved gothic blackletter code "T1", warm sepia and deep teal, victorian gothic cartography, perfectly symmetrical, full bleed --ar 1:1 --style raw --no watermark, signature, blurry text
```
Ripeti lo stesso identico prompt per T2, T3, T4, T5, T6 cambiando solo il
codice fra virgolette — icona, palette e stile restano fissi apposta.

**Tessere mappa** (sostituisci AMBIENTE):
```
top-down hand-drawn dungeon map tile on aged parchment, ink linework with crosshatched thick stone walls, AMBIENTE, faint 4x4 square grid over the floor, torn parchment edges, antique cartography style, warm sepia with teal water accents --ar 1:1 --style raw --no text, letters, words, watermark
```
Ambienti — **T1** loading dock with black canal water along one edge and mooring posts · **T2** warehouse room packed with stacked wooden crates branded with a wave · **T3** narrow corridor lined with hundreds of black candles and pooled wax · **T4** cluttered office with a desk covered in sheet music and a straw bed · **T5** slick stone staircase descending into darkness · **T6** underground crypt with a central altar in a ring of candles and a barred prison cell in the corner

**Arredi delle tessere** — le caselle bloccate dentro la griglia 4x4 (casse,
candele, scala...) usavano un rettangolo a gradiente CSS con la sola
etichetta testuale come segnaposto; ora `scripts/tiles/generate-tiles.js`
disegna l'arte vera generata da questi prompt (`ARREDO_ART` nello script).
Salva come `artworks/<chiave>.png`, minuscolo, senza prefisso "Arredo"
(chiavi: `molo`, `casse`, `candele`, `scrivania`, `branda`, `scala`,
`altare`, `cella`) — deve combaciare col nome atteso dallo script.

**Tentativo 1 fallito** ("bird's eye view" + "orthographic top-down"): Midjourney
ha comunque disegnato un render 3D isometrico stile icona di videogioco (le
casse viste "dall'alto ma in 3D", facce laterali visibili, nessuna texture a
inchiostro/pergamena) — chiedere un ANGOLO DI RIPRESA su un oggetto 3D non
basta, Midjourney continua a pensare "oggetto nello spazio", non "disegno
piatto". **Tentativo 2** (sotto): invece di descrivere una vista, chiedo
direttamente un **simbolo da legenda di mappa** — lo stesso trucco che ha
funzionato per le tessere (lì "dungeon map tile" bastava perché "tile/map"
implica già piatto; per un oggetto singolo va detto esplicitamente che
DEVE essere un simbolo/glifo, non un render).

Sostituisci OGGETTO e usa questo prompt unico:
```
flat map legend symbol for an antique hand-drawn dungeon map, OGGETTO drawn as a simple flat ink glyph exactly like a mapmaker's legend icon, plan view blueprint style, zero perspective and zero shading, aged parchment, sepia ink linework, antique cartography style --ar 1:1 --no text, letters, words, watermark, 3D, isometric, render, photorealistic, painting, shading, gradient, drop shadow, perspective, depth, side view, angled view
```
Se esce ancora in 3D/isometrico, il colpevole probabile è `--style raw`
(spinge verso un rendering pittorico invece che un disegno piatto): togli
`--style raw` e riprova, o aggiungi `--no realistic lighting, volumetric`.

Oggetti — **molo** a mooring post wrapped in wet rope on cracked dock stone ·
**casse** a stack of wooden crates branded with a wave sigil · **candele** a
cluster of tall black candles thick with dripped wax · **scrivania** a
cluttered writing desk with sheet music and a quill · **branda** a narrow
straw pallet bed with a folded blanket · **scala** a stone spiral staircase
seen from above, descending into shadow · **altare** a stone altar ringed
with candle stubs and old bloodstains · **cella** a barred prison cell door
set in a stone archway

**Mappa di campagna di Roccamora (poster)**
```
antique hand-drawn city map of a gothic canal city, bird's eye view, ink and watercolor on aged parchment, a great cathedral with bell tower at the center, winding canals dividing eight distinct districts, small warehouses along a dark lower canal, tiny rooftops, bridges and mooring posts, decorative compass rose and sea-serpent flourish in the corners, 1889 cartography style, muted teal water and sepia buildings with crimson accents --ar 3:4 --style raw --no text, letters, words, watermark
```

**Sigillo della Società**
```
wax seal emblem, letters S and L intertwined with a single engraved wave, deep red wax with gold engraving, centered on black, product photography style, high detail --ar 1:1 --style raw --no watermark
```

**Sfondo pergamena per i Reperti**
```
flat lay top-down macro photo of a single sheet of aged 19th century parchment paper filling the entire frame edge to edge, warm sepia paper texture, ragged torn edges cropped by the frame on all four sides, faint coffee ring stain, scattered ink blots, subtle creases and foxing, completely blank empty flat surface ready for handwritten text, no background visible around the paper --ar 3:4 --style raw --no scroll, curling, rolled edges, flames, fire, vignette, dark background, text, letters, words, watermark
```
Se esce comunque come pergamena arrotolata/fiammeggiante invece che piatta a tutto
campo, aggiungi `--no scroll, curling, flames` (già incluso sopra) e rigenera, oppure
usa Vary Region per appiattire i bordi arricciati.
Sfondo unico riusato per tutti e 3 i documenti-reperto (diario, registro, atti
d'archivio): testo e sigillo si sovrappongono in compositing via
`scripts/reperti/generate-reperti.js` (blend mode Multiply, niente pannelli).
Output finale in `reperti/Episodio N/` (o `reperti/Preludio/`).

## Montaggio

1. Genera l'Adepto → `--sref` + `--sw 800` su tutto il resto.
2. Genera le due cornici (una volta), i dorsi, le tessere, la mappa.
3. Carica in chat cornici + soggetti: il compositing monta ogni dipinto nella sua
   cornice, aggiunge titoli, flavor, effetti e statistiche in italiano e rigenera i
   PDF con l'impaginazione di stampa fronte/retro. In alternativa fai il montaggio
   in Canva/Photopea (font: Old Standard TT e IM Fell English SC).
