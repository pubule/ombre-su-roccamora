# Le risorse VTT dipinte — dove metterle

Qui dentro vanno gli **zip scaricati a mano** dai pacchetti di
[2-Minute Tabletop](https://2minutetabletop.com). Non si scaricano da soli:
il sito li dà attraverso il carrello (prezzo libero, si può mettere `0`).

## I pacchetti che servono, e cosa coprono

| pacchetto | copre |
|---|---|
| [Dungeon Room Builder](https://2minutetabletop.com/dungeon-room-builder/) | pavimenti e muri di pietra |
| [Basic Building Assets](https://2minutetabletop.com/product/basic-building-assets/) | pavimenti (assi, mattonelle), muri, macerie |
| [Modular Jail Assets](https://2minutetabletop.com/modular-jail-map-assets/) | `cella` (sbarre), `branda` |
| [The Furniture Map Assets](https://2minutetabletop.com/fantasy-furniture-map-assets/) | `scrivania`, `armadio`, `toeletta`, `altare`, `casse`, `candele` |

Scarica gli zip e lasciali qui **così come sono**: ci pensa
`python scripts/importa-vtt.py` a scompattarli, ritagliare quel che serve e
mettere ogni pezzo al suo posto in `webapp/vtt/`.

## La licenza, e cosa comporta

Gli asset gratuiti di 2-Minute Tabletop sono **CC BY-NC 4.0**: attribuzione
obbligatoria, **nessun uso commerciale**. Vale anche per quel che ne deriva —
le tessere generate. Il credito lo scrive `importa-vtt.py` in
`webapp/vtt/LICENZE.txt`, e sta anche in `NOTICE.md`.

**Gli zip NON entrano in git** (`.gitignore`): ridistribuire i pacchetti non è
permesso. Entrano solo le tessere che ne derivano, che è quel che la licenza
chiama «una mappa fatta con i loro asset».

Forgotten Adventures resta fuori apposta: i suoi asset gratuiti sono CC BY-NC-**SA**,
e il ShareAlike si attaccherebbe a quel che ne deriva.
