# Le risorse VTT dipinte — dove metterle

Qui dentro vanno gli **zip scaricati a mano** dai pacchetti di
[2-Minute Tabletop](https://2minutetabletop.com), scompattati in `2M/`. Non si
scaricano da soli: il sito li dà attraverso il carrello (prezzo libero, si può
mettere `0`).

## Quel che c'è oggi in `2M/`, e quel che manca

Scaricati: **Dungeon Room Builder**, **Basic Building Assets**, **Mercantile
Tokens**, **River & Water Assets**, **Ocean Surface Assets**, **Sailing Ship
Assets**. Da lì `importa-vtt.py` compone nove arredi e cinque pavimenti, e con
quelli escono **tutte dipinte 52 tessere su 127**; le altre hanno almeno un
pezzo dal ripiego — una texture Poly Haven CC0 o una sagoma CSS, mai una casella
vuota.

Ancora **da scaricare**, e coprirebbero quasi tutti gli scoperti:

| pacchetto | riempirebbe |
|---|---|
| [The Furniture Map Assets](https://2minutetabletop.com/fantasy-furniture-map-assets/) | `altare`, `stufa`, `toeletta`, e una `scrivania` e un `armadio` veri (oggi sono un tavolo e una cassapanca) |
| [Modular Jail Assets](https://2minutetabletop.com/modular-jail-map-assets/) | `cella`, `branda` (oggi è una stuoia) |
| [Buildings Pack](https://2minutetabletop.com/product/buildings-pack/) | tetti, gronde, guglie — le 6 tessere dei tetti |

Il `crogiolo` (la forgia) non lo copre nessuno dei tre: quello resta la sagoma
disegnata dal generatore.

**Due cose viste guardando i file, non leggendone i nomi.** Il *Mercantile
Tokens* esiste solo nella versione Roll20 a **72 DPI** — 205 px per casella
contro i 616 px a cui la tessera si stampa — e i suoi oggetti escono morbidi;
gli altri pacchetti hanno la cartella a 300 DPI e stanno giusti. E `Tile - 1
(3x3)` del Dungeon Room Builder *sembra* un pavimento ripetibile ma è un
quadrato con le fughe disegnate a mano ai bordi: ripetuto mostra la griglia.

## I pacchetti che servono, e cosa coprono

L'elenco NON e' a occhio: viene dal conto su tutte le **127 tessere dei 21
episodi** (`node -e` su `webapp/data/*.json`). Gli ambienti sono dieci, e le
casse da sole compaiono **172 volte** su 249 arredi — di quelle servono
varianti, o la stessa cassa si ripete come carta da parati.

| pacchetto (tutti gratuiti / prezzo libero) | copre |
|---|---|
| [Dungeon Room Builder](https://2minutetabletop.com/dungeon-room-builder/) | pietra, cripte, sotterranei, muri |
| [Basic Building Assets](https://2minutetabletop.com/product/basic-building-assets/) | assi, mattonelle, mattoni, macerie |
| [Modular Jail Assets](https://2minutetabletop.com/modular-jail-map-assets/) | `cella` (sbarre), `branda` |
| [The Furniture Map Assets](https://2minutetabletop.com/fantasy-furniture-map-assets/) | `scrivania`, `armadio`, `toeletta`, `altare`, `candele`, `stufa` |
| [Mercantile Tokens](https://2minutetabletop.com/product/mercantile-tokens/) | `casse` e le sue varianti (l'arredo piu' frequente del gioco) |
| [River & Water Assets](https://2minutetabletop.com/product/river-and-water-assets/) | canali, pozzi, cisterne — **10 tessere** |
| [Ocean Surface Assets](https://2minutetabletop.com/product/ocean-surface-assets/) | acqua aperta, darsene |
| [Sailing Ship Assets](https://2minutetabletop.com/product/sailing-ship-assets/) | `molo`, pontili, chiatte, il cimitero delle barche |
| [Buildings Pack](https://2minutetabletop.com/product/buildings-pack/) | tetti, gronde, guglie, ballatoi — **6 tessere** |

Gli ambienti che il generatore sa gia' distinguere, e quante tessere ciascuno
(sui 21 episodi): mattonelle 30 · lastricato 23 · assi 22 · mattoni 13 ·
**acqua 10** · terra 8 · **roccia 7** · **tetti 6** · **navata 5** · pietra 3.
I quattro in grassetto non esistevano finche' non si e' contato: prima finivano
tutti nel ripiego, cioe' 66 tessere su 127 avevano il lastricato di un cortile
anche se erano un canale, un tetto o una navata.

Scarica gli zip, scompattali in `2M/` e lasciali lì **così come sono**: ci pensa
`python scripts/importa-vtt.py` a ritagliare quel che serve e a mettere ogni
pezzo al suo posto in `webapp/vtt-2m/`. Poi
`python scripts/importa-vtt.py --contatti` monta i pezzi scelti in un unico PNG:
**va guardato**, perché i nomi dei pacchetti mentono più dei pixel.

## La licenza, e cosa comporta

Gli asset gratuiti di 2-Minute Tabletop sono **CC BY-NC 4.0**: attribuzione
obbligatoria, **nessun uso commerciale**. Vale anche per quel che ne deriva —
le tessere generate. Il credito lo scrive `importa-vtt.py` in
`webapp/vtt-2m/LICENZE.txt`, e sta anche in `NOTICE.md`.

**Gli zip NON entrano in git** (`.gitignore`): ridistribuire i pacchetti non è
permesso. Entrano solo le tessere che ne derivano, che è quel che la licenza
chiama «una mappa fatta con i loro asset».

Forgotten Adventures resta fuori apposta: i suoi asset gratuiti sono CC BY-NC-**SA**,
e il ShareAlike si attaccherebbe a quel che ne deriva. La libreria FA importata
il 18/08 sta in `webapp/vtt/` e serve **solo al confronto** — il mockup
`nebbia2-tessere-3vie.html` mette le stesse quindici tessere nelle tre vie (FA,
2M, 2M con FA a tappare) perche' la scelta si prenda guardando. Finche' quella
scelta non e' presa, `NOTICE.md` resta com'e'.
