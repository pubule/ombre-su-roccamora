// DATI VERI, presi da webapp/data/epN.json e dalle COPERTINE di js/main.js: titolo,
// sottotitolo (senza il prefisso «episodio N —»), atto, arte di copertina. Niente trama: la scelta dell'episodio non deve
// anticipare nulla della serata.
const EPISODI = [
 {
  "id": "preludio",
  "n": 0,
  "atto": 0,
  "titolo": "La Prova del Lume",
  "sotto": "la vostra prova d’ammissione",
  "art": "/assets/artworks/Palazzo del Lume.png"
 },
 {
  "id": "ep1",
  "n": 1,
  "atto": 1,
  "titolo": "Il Coro Sommerso",
  "sotto": "il caso del campanaro scomparso",
  "art": "/assets/artworks/copertina spedizione.png"
 },
 {
  "id": "ep2",
  "n": 2,
  "atto": 1,
  "titolo": "La voce del bronzo",
  "sotto": "i pani del Quarantuno",
  "art": "/assets/artworks/copertina episodio 2.png"
 },
 {
  "id": "ep3",
  "n": 3,
  "atto": 1,
  "titolo": "Le voci del pozzo",
  "sotto": "il Ladro di Voci",
  "art": "/assets/artworks/derelict warehouses over black still water.png"
 },
 {
  "id": "ep4",
  "n": 4,
  "atto": 1,
  "titolo": "Il teatro dell’eco",
  "sotto": "la conchiglia che ricorda",
  "art": "/assets/artworks/Il buio di quinta.png"
 },
 {
  "id": "ep5",
  "n": 5,
  "atto": 1,
  "titolo": "L’organo di ossa",
  "sotto": "la cripta dei Battuti",
  "art": "/assets/artworks/nervous priest in a candlelit sacristy.png"
 },
 {
  "id": "ep6",
  "n": 6,
  "atto": 1,
  "titolo": "Il Terzo Movimento",
  "sotto": "la notte del rituale",
  "art": "/assets/artworks/abandoned luthier workshop.png"
 },
 {
  "id": "ep7",
  "n": 7,
  "atto": 2,
  "titolo": "Il quartiere sordo",
  "sotto": "la calce che beve il suono",
  "art": "/assets/artworks/dusty municipal archive.png"
 },
 {
  "id": "ep8",
  "n": 8,
  "atto": 2,
  "titolo": "L’oro vecchio",
  "sotto": "la Malavita comprata a marenghi del 1741",
  "art": "/assets/artworks/Banco dei Pegni.png"
 },
 {
  "id": "ep9",
  "n": 9,
  "atto": 2,
  "titolo": "Il processo",
  "sotto": "un teste da portare vivo al Tribunale",
  "art": "/assets/artworks/cluttered 19th century police office.png"
 },
 {
  "id": "ep10",
  "n": 10,
  "atto": 2,
  "titolo": "La casa che ricorda",
  "sotto": "la casa che ricorda, e la corsa alla demolizione",
  "art": "/assets/artworks/Corte della Faenza.png"
 },
 {
  "id": "ep11",
  "n": 11,
  "atto": 2,
  "titolo": "Il censimento delle campane",
  "sotto": "il censimento delle campane, e la via delle guglie",
  "art": "/assets/artworks/Cella campanaria.png"
 },
 {
  "id": "ep12",
  "n": 12,
  "atto": 2,
  "titolo": "La seconda copia",
  "sotto": "la seconda copia, e l’inseguimento del corriere",
  "art": "/assets/artworks/Palazzo del Lume.png"
 },
 {
  "id": "ep13",
  "n": 13,
  "atto": 3,
  "titolo": "Carta di pregio",
  "sotto": "il molino fuori città",
  "art": "/assets/artworks/derelict warehouses over black still water.png"
 },
 {
  "id": "ep14",
  "n": 14,
  "atto": 3,
  "titolo": "Il rivale",
  "sotto": "il rivale, e le prove che lo inchiodano",
  "art": "/assets/artworks/bell tower.png"
 },
 {
  "id": "ep15",
  "n": 15,
  "atto": 3,
  "titolo": "Lo smascheramento",
  "sotto": "la sera in cui tutto torna",
  "art": "/assets/artworks/cluttered 19th century police office.png"
 },
 {
  "id": "ep16",
  "n": 16,
  "atto": 3,
  "titolo": "Un caso qualunque",
  "sotto": "il respiro, e la crepa nella lettera di M.",
  "art": "/assets/artworks/humble candlelit canal-side room.png"
 },
 {
  "id": "ep17",
  "n": 17,
  "atto": 3,
  "titolo": "Lo scisma",
  "sotto": "lo scisma, e il decano che non risponde",
  "art": "/assets/artworks/derelict warehouses over black still water.png"
 },
 {
  "id": "ep18",
  "n": 18,
  "atto": 3,
  "titolo": "La mano sola",
  "sotto": "l’ultima assemblea",
  "art": "/assets/artworks/Palazzo del Lume.png"
 },
 {
  "id": "ep19",
  "n": 19,
  "atto": 4,
  "titolo": "La Società braccata",
  "sotto": "il conto della campagna",
  "art": "/assets/artworks/dusty municipal archive.png"
 },
 {
  "id": "ep20",
  "n": 20,
  "atto": 4,
  "titolo": "Il Quarto Movimento",
  "sotto": "la gola della città, l’ultima notte",
  "art": "/assets/artworks/derelict warehouses over black still water.png"
 }
];
