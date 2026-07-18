// Dataset delle carte verticali rimanenti (eroi, nemici, minacce), testi presi
// da src/story.py e src/gen_cards.py (fonte autoritativa del gioco).
// `file` e' opzionale: nome file di output se diverso dal titolo mostrato in carta
// (serve a evitare collisioni, es. "Il Fonditore" esiste sia come nemico che come minaccia).

const HEROES = [
  {
    art: 'artworks/Elena.png',
    title: 'Elena Fosco',
    type: 'Eroe — L’Investigatrice',
    rules: '{i}L’Investigatrice{/i}{divider}Figlia di un giudice e di una cantante d’opera, ha ereditato dal primo il metodo e dalla seconda l’orecchio per le stonature: nelle voci, nelle storie, negli alibi. Ha lasciato la polizia dopo che un caso «impossibile» fu archiviato con troppa fretta; da allora archivia lei, a modo suo. Non crede ai fantasmi: crede ai colpevoli che li inventano.',
  },
  {
    art: 'artworks/Attilio.png',
    title: 'Dott. Attilio Marn',
    type: 'Eroe — Il Medico',
    rules: '{i}Il Medico{/i}{divider}Vent’anni di ambulatorio nei quartieri bassi, dove si impara che la città uccide più della malaria. Ha visto cose di cui i colleghi dell’Accademia riderebbero, e ha smesso di raccontarle. Cura chiunque bussi, annota tutto, e nella borsa porta un bisturi più lungo del necessario.',
  },
  {
    art: 'artworks/Sibilla.png',
    title: 'Sibilla Reve',
    type: 'Eroe — L’Occultista',
    rules: '{i}L’Occultista{/i}{divider}Dicono legga le carte alle vedove per denaro; è vero, ed è il modo migliore per ascoltare la città. Sa distinguere la superstizione dal pericolo vero, perché il secondo l’ha guardata in faccia una notte, da bambina, sul bordo di un pozzo. Il pendolo che porta era di sua nonna. Non è mai stato fermo.',
  },
  {
    art: 'artworks/Nino.png',
    title: 'Nino "Grimaldello" Cauto',
    type: 'Eroe — Il Ladro',
    rules: '{i}Il Ladro{/i}{divider}Cresciuto sui tetti e nelle intercapedini di Roccamora, conosce la città come un ladro conosce le tasche altrui: al buio. Un lavoro finito male gli ha lasciato un debito con la persona sbagliata e un motivo per stare dalla parte giusta, almeno per ora. Le serrature, dice, sono domande: basta fare quella giusta.',
  },
  {
    art: 'artworks/Ottone.png',
    title: 'Ottone "Mezzena" Massari',
    type: 'Eroe — Il Macellaio',
    rules: '{i}Il Macellaio{/i}{divider}Il banco dei Massari sta al Vecchio Mercato da tre generazioni, e Ottone conosce Roccamora dalla pancia: sa chi mangia, chi digiuna e chi da qualche tempo non ha più fame. Ci pensa da quando il suo garzone sparì durante la festa di San Teodoro e tornò tre giorni dopo, senza appetito e senza voce. Dice che la città si legge a tavola: dove si smette di mangiare e di ridere, lì c’è il male.',
  },
  {
    art: 'artworks/Carla.png',
    title: 'Carla Dosti',
    type: 'Eroe — La Giornalista',
    rules: '{i}La Giornalista{/i}{divider}Prima donna in redazione al Corriere di Roccamora, relegata ai necrologi finché non ha scoperto che i necrologi, letti in fila, raccontano storie che nessuno vuole stampare. Ha una macchina fotografica, una memoria feroce e la convinzione che la verità sia un diritto anche quando è indicibile.',
  },
  {
    art: 'artworks/Lazzaro.png',
    title: 'Dott. Lazzaro Serra',
    type: 'Eroe — L’Alienista',
    rules: '{i}L’Alienista{/i}{divider}Dirige il manicomio di Roccamora da undici anni. I suoi pazienti «sentono» cose che i sani non sentono, e lui ha smesso da tempo di liquidarle come deliri: le trascrive tutte, quaderno dopo quaderno. Quando tre internati mai incontratisi cominciarono a cantare la stessa melodia, smise di chiamarla coincidenza.',
  },
  {
    art: 'artworks/Celso.png',
    title: 'Padre Celso Marani',
    type: 'Eroe — L’Esorcista Sospeso',
    rules: '{i}L’Esorcista Sospeso{/i}{divider}Sospeso a divinis dopo un esorcismo finito male — non perché fallì, ma per quello che mise a verbale. La Curia lo vuole dimenticare; lui continua il mestiere senza più chiedere permesso, e ha imparato a riconoscere le case dove qualcosa non vuole farsi trovare.',
  },
  {
    art: 'artworks/Fulgenzio.png',
    title: 'Fulgenzio Carbone',
    type: 'Eroe — L’Antiquario dell’Occulto',
    rules: '{i}L’Antiquario dell’Occulto{/i}{divider}La sua bottega senza insegna compra ciò che le famiglie di Roccamora vogliono far sparire: reliquie, diari cuciti, specchi che nessuno vuole pulire. Non rivende quasi mai — non per scrupolo, per collezione. Dice che ogni oggetto ricorda le mani che l’hanno toccato, e che basta saperlo interrogare.',
  },
  {
    art: 'artworks/Ottavio.png',
    title: 'Ottavio Brera',
    type: 'Eroe — Il Magistrato in Pensione',
    rules: '{i}Il Magistrato in Pensione{/i}{divider}Trent’anni di sentenze: conosce per nome ogni criminale della città e il rimorso di ogni fascicolo archiviato troppo in fretta. Il caso del pozzo lo firmò lui, nel 1876. In pensione ha smesso di dormire bene e ha cominciato a rimediare.',
  },
  {
    art: 'artworks/Mora.png',
    title: 'Mora “Spilla” Fanti',
    type: 'Eroe — La Contrabbandiera dei Canali',
    rules: '{i}La Contrabbandiera dei Canali{/i}{divider}Guida un sandolo tra i moli di notte per conto di chi paga meglio della legge. Conosce ogni canale di Roccamora, anche quelli che sulle mappe non ci sono più. Il furetto Ombra le dorme in tasca da quando l’ha salvato da un carico mai consegnato.',
  },
];

// Le carte Creatura NON riportano le statistiche: vivono nel Bestiario
// dell'episodio (gen_bestiario.py, con Ferite tabellate per numero di
// eroi in tavola). La carta resta il segnalino da tavolo: ritratto,
// flavor e il rimando al fascicolo.
const NEMICI = [
  {
    art: 'artworks/Adepto Incappucciato.png',
    title: 'Adepto Incappucciato',
    type: 'Creatura — Cultista Incappucciato',
    rules: 'Palandrana grigia da becchino, maschera di cera liscia e senza tratti. Sotto, gente comune di Roccamora — fornai, barcaioli, sagrestani — che alle 3 di notte smette di essere gente comune. Combattono con falcetti da fonditore, in perfetto silenzio: la voce la conservano per il canto.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
  {
    art: 'artworks/Cani dei Moli.png',
    title: 'Cane dei Moli',
    type: 'Creatura — Cane dei Moli',
    rules: 'Bestie da guardia dei magazzini, il muso incrostato di cera nera: il culto li nutre e li accorda come strumenti. Arrivano prima del loro ringhio. Fragili, ma il colpo va messo a segno mentre saltano.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
  {
    art: 'artworks/Il Fonditore.png',
    title: 'Il Fonditore',
    type: 'Creatura — Fonditore',
    rules: 'Gli artigiani del culto: grembiule di cuoio, mestolo colmo di cera fusa, la pazienza di chi ha versato mille candele. Non corrono mai: non ne hanno bisogno. La cera bollente che schizza dal mestolo resta addosso per giorni.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
  {
    art: 'artworks/Il Custode della Cera (boss).png',
    title: 'Il Custode della Cera',
    type: 'Creatura — Custode (Boss)',
    rules: 'Un gigante ricoperto di strati di cera colata, il volto un moncone liscio in cui affiorano, a tratti, i lineamenti di qualcun altro. Avanza lento e senza fretta: nulla, nel suo magazzino, gli è mai sfuggito. Se il diapason d’argento viene fatto vibrare a lui adiacente (azione): Difesa 5 per il resto della partita e salta la sua prossima attivazione.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
  // Malavita di Roccamora: nemici secolari riusabili in ogni episodio.
  {
    art: 'artworks/Lo Sgherro.png',
    title: 'Lo Sgherro',
    type: 'Creatura — Malavita',
    rules: 'Muscolo a pagamento dei bassifondi: bastone, coltellaccio e nessuna fede se non la moneta. Tattica del branco: se è adiacente a un altro Sgherro, ha +1 Attacco. Non vengono quasi mai da soli.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
  {
    art: 'artworks/Il Sicario.png',
    title: 'Il Sicario',
    type: 'Creatura — Malavita',
    rules: 'Una lama assoldata, silenziosa e rapida. Sceglie sempre il bersaglio più debole. Colpo a tradimento: +2 all’Attacco contro un eroe isolato (nessun altro eroe adiacente) o già ferito. Fragile: chi lo raggiunge, lo abbatte.{divider}{i}Statistiche nel Bestiario dell’episodio.{/i}',
  },
];

// tipo: stessa idea del `tipo` degli Approfondimenti (LUOGHI), formalizza
// pattern meccanici reali (vedi analisi in plans/wondrous-foraging-raven.md),
// non i nomi delle creature - "Adepto/Cane/Fonditore" separati non
// abiliterebbero nessuna interazione che il testo non dia gia'. Diventa
// anche la riga "Tipo" nel titolo carta (il campo "type" nativo di Card
// Conjurer non si vede su nessuna carta di questo progetto, bug
// preesistente in lib.js). subito: true sulle creature che si attivano
// immediatamente al piazzamento (rischio immediato vs differito) - asse
// trasversale a posseduto/malavita, non un tipo a se'.
const MINACCE = [
  { art: 'artworks/Adepto Incappucciato.png', title: 'Adepto in Agguato', tipo: 'Posseduto',
    flavor: 'Una sagoma si stacca dal buio, il volto una lastra di cera liscia.',
    effect: 'Piazzate 1 Adepto sull’uscita più vicina agli eroi della tessera in cui si trova l’eroe attivo.' },
  { art: 'artworks/Volti tra le casse.png', title: 'Volti tra le Casse', tipo: 'Posseduto',
    flavor: 'Tra le pile, un volto liscio che non respira. Vi guarda da un pezzo.',
    effect: 'Piazzate 1 Adepto sull’uscita più vicina agli eroi della tessera corrente: si è intrufolato dietro le casse.' },
  { art: 'artworks/Il falcetto nel buio.png', title: 'Il Falcetto nel Buio', tipo: 'Posseduto',
    flavor: 'Il fischio sottile di una lama da fonditore, proprio dietro di voi.',
    effect: 'Piazzate 1 Adepto sull’ingresso della tessera corrente, alle spalle degli eroi.' },
  { art: 'artworks/La Vedetta.png', title: 'La Vedetta', tipo: 'Posseduto',
    flavor: 'Chi resta solo, a Roccamora, non resta solo a lungo.',
    effect: 'Piazzate 1 Adepto adiacente all’eroe più isolato (quello più lontano dagli altri; a pari merito: sceglie il gruppo).' },
  { art: 'artworks/Cani dei Moli.png', title: 'Cani dei Moli', tipo: 'Posseduto', subito: true,
    flavor: 'Un ringhio basso, poi unghie sulla pietra. Troppo veloci.',
    effect: 'Piazzate 1 Cane dei Moli sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Unghie sulla pietra.png', title: 'Unghie sulla Pietra', tipo: 'Posseduto', subito: true,
    flavor: 'Dal buio dell’ingresso, un galoppo basso che non rallenta.',
    effect: 'Piazzate 1 Cane dei Moli sull’ingresso della tessera corrente: si attiva subito.' },
  { art: 'artworks/Il Fonditore.png', title: 'Il Fonditore', tipo: 'Posseduto',
    flavor: 'Passi lenti, e il gorgoglio di un mestolo colmo di cera fusa.',
    effect: 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1). Se è già in gioco un Fonditore, cancellate 1 sua ferita dal Registro.' },
  { art: 'artworks/La marea di cera.png', title: 'La Marea di Cera', tipo: 'Posseduto', subito: true,
    flavor: 'Il gorgoglio si fa coro: i mestoli avanzano tutti insieme.',
    effect: 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1): tutti i Fonditori in gioco si attivano subito.' },
  { art: 'artworks/Ronda.png', title: 'Ronda', tipo: 'Posseduto',
    flavor: 'Passi cadenzati e un salmodiare sommesso: non siete più soli.',
    effect: 'Piazzate 2 Adepti sull’ingresso della Banchina (T1).' },
  { art: 'artworks/Bravi sul Molo.png', title: 'Bravi sul Molo', tipo: 'Malavita',
    flavor: 'Passi pesanti e un fischio: i bravacci del molo sono sul libro paga del culto.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della Banchina (T1).' },
  { art: 'artworks/Il Branco.png', title: 'Il Branco', tipo: 'Malavita',
    flavor: 'Non vengono mai da soli, e si coprono le spalle a vicenda.',
    effect: 'Piazzate 2 Sgherri, adiacenti tra loro, sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Lama nel Buio.png', title: 'Lama nel Buio', tipo: 'Malavita', subito: true,
    flavor: 'Un luccichio, poi il freddo tra le scapole. Sceglie sempre il più solo.',
    effect: 'Piazzate 1 Sicario adiacente all’eroe più isolato o più ferito (a pari merito: sceglie il gruppo): si attiva subito.' },
  { art: 'artworks/Trappola di cera.png', title: 'Trappola di Cera', tipo: 'Insidia',
    flavor: 'Il pavimento luccica. Capite troppo tardi perché.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, cera bollente: 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Cera sotto i piedi.png', title: 'Cera sotto i Piedi', tipo: 'Insidia',
    flavor: 'Il pavimento cede morbido sotto lo stivale. Era ancora calda.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Fumi soporiferi.png', title: 'Fumi Soporiferi', tipo: 'Insidia',
    flavor: 'Un dolciastro di sego e papavero vi riempie i polmoni.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il canto sale.png', title: 'Il Canto Sale', tipo: 'Crescendo',
    flavor: 'Una voce sola, sottile, cerca il tono giusto. Lo trova.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode si desta e da lì ogni Fase Minaccia pesca 1 carta in più. Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il coro risponde.png', title: 'Il Coro Risponde', tipo: 'Crescendo',
    flavor: 'Dieci voci. Poi cento. La pietra le beve tutte.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode si desta e da lì ogni Fase Minaccia pesca 1 carta in più. Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il canto cresce.png', title: 'Il Canto Cresce', tipo: 'Crescendo',
    flavor: 'Le voci salgono di un tono. Sotto i piedi, la pietra vibra.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode si desta e da lì ogni Fase Minaccia pesca 1 carta in più. Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Presagio.png', title: 'Presagio', tipo: 'Quiete',
    flavor: 'Una candela si spegne da sola. Nessuno ha fiatato.',
    effect: 'Un brivido corre lungo la schiena. Non accade nulla... per ora.' },
  { art: 'artworks/Eco amica.png', title: 'Eco Amica', tipo: 'Favore',
    flavor: 'Tre colpi sordi, ostinati: qualcuno, là sotto, è ancora vivo.',
    effect: 'Ruggero è vivo. Rivelate una tessera coperta adiacente a una già rivelata.' },
  { art: 'artworks/Cera che cola.png', title: 'Cera che Cola', tipo: 'Ostacolo',
    flavor: 'Dalle travi piove cera bollente, filo dopo filo.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Corrente gelida.png', title: 'Corrente Gelida', tipo: 'Ostacolo',
    flavor: 'Un freddo d’acqua nera risale i condotti e vi entra nelle ossa.',
    effect: 'Fino all’inizio del vostro prossimo turno ogni eroe ha -1 al Movimento (minimo 1).' },
  { art: 'artworks/Sussurri.png', title: 'Sussurri', tipo: 'Insidia',
    flavor: 'Qualcuno pronuncia il vostro nome. Con la vostra voce.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal terrore.' },
].map((m) => ({
  art: m.art,
  // Il campo "type" di Card Conjurer non e' mai apparso su nessuna carta di
  // questo progetto (nemmeno sui Nemici, che pure lo valorizzano da tempo:
  // fillTextArea('Type', ...) in lib.js non trova il relativo pulsante sul
  // frame "Marker Card" e fallisce in silenzio) - il tipo va nel titolo
  // stesso, che quello slot funziona di sicuro.
  title: `${m.tipo} — ${m.title}`,
  // Malavita (Sgherro/Sicario): riusabile in ogni episodio come i Nemici Malavita
  // sotto (vedi n.file piu' in basso) - fuori da "Episodio 1/", stesso criterio.
  file: (m.tipo === 'Malavita' ? 'Minacce/' : 'Episodio 1/Minacce/') + m.title,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

// Luoghi dell'Indagine: testo esteso da src/story.py TESTI_LUOGHI (quello
// realmente stampato nel PDF via story.apply), indizi/approfondimenti/req da
// src/gen_cards.py LUOGHI. Un'arte per luogo, riusata da tutte le sue carte
// (Luogo, Indizio Nascosto, Testimoni, Referti).
const LUOGHI_ART = {
  1: 'artworks/bell tower.png',
  2: 'artworks/humble candlelit canal-side room.png',
  3: 'artworks/smoky canal tavern.png',
  4: 'artworks/nervous priest in a candlelit sacristy.png',
  5: 'artworks/abandoned luthier workshop.png',
  6: 'artworks/derelict warehouses over black still water.png',
  7: 'artworks/dusty municipal archive (libro+persona).png', // ritagliata (crop 300,550-1700,2510) per ingrandire l'archivista senza tagliare libro/base
  8: 'artworks/cluttered 19th century police office.png',
};

const LUOGHI = [
  { n: 1, nome: 'Il Campanile di San Teodoro', req: 'Disponibile dall’inizio',
    testo: 'La scala a chiocciola sale nel buio, ottanta gradini che Ruggero conosceva a memoria. In cima, la cella campanaria è un disordine congelato: lo sgabello rovesciato, la lanterna ancora appesa al gancio, la cena intatta sotto un panno. Le tre grandi campane pendono immobili come bestie addormentate, e fa più freddo di quanto dovrebbe.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Lo spartito tra le assi', testo: 'Tra le assi, un frammento di spartito scritto a mano. Le note non sono per organo: sono per campane — e in calce, a matita, un nome e un indirizzo: «B. Ferri — vecchio magazzino delle cere, Dellacqua, Canale Basso.» Non un semplice cantore: conosce il posto meglio di chiunque altro.' },
      { tipo: 'Referto', soggetto: 'La cena intatta', testo: 'La cena è ancora sotto il panno, fredda ma composta: nessun segno di lotta. Ruggero si è alzato e ha seguito qualcuno, verso le 3. Sul pavimento, fango nero dei moli intorno al vecchio magazzino di Dellacqua, sul Canale Basso — e un frammento di corda per violino, di quelle che vende solo un liutaio: chi lascia il proprio mestiere impresso ovunque passa non si intrufola.' },
    ] },
  { n: 2, nome: 'Casa di Ruggero — Vicolo dei Fonditori', req: 'Disponibile dall’inizio',
    testo: 'Il vicolo dei Fonditori sa di carbone e minestra. Bice vi apre con gli occhi rossi e le mani che non stanno ferme; la casa è linda, povera, piena dell’assenza di suo fratello. «Negli ultimi tempi diceva di sentire musica sotto il pavimento della cripta», mormora. «E aveva paura del suo stesso campanile.»',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Bice', testo: 'Consolata, Bice ricorda: di notte Ruggero riceveva un visitatore «ben vestito, con mani da artigiano». Lo seguì una volta fino al vecchio magazzino delle cere di Dellacqua, sul Canale Basso — e lo sentì chiamare «il liutaio Ferri». Li vide inchinarsi a lui, come si inchina chi teme di essere guardato.' },
    ] },
  { n: 3, nome: 'Taverna del Ponte Rotto', req: 'Disponibile dall’inizio',
    testo: 'Fumo denso, vino cattivo, il tanfo dolciastro del canale che entra a ogni porta che sbatte. I barcaioli giocano a carte sotto una lampada a olio e vi squadrano appena: qui le lingue si sciolgono con poco, purché il poco finisca nel bicchiere giusto.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Ugo il barcaiolo', testo: 'Con un altro bicchiere, Ugo precisa: la chiatta senza lanterne ha attraccato al molo terzo del Canale Basso, poco dopo le 3, scaricando dritta al vecchio magazzino delle cere di Dellacqua — quello con la porta sempre sbarrata. A dare ordini, quella notte, non era un uomo di scarico: era il liutaio Ferri in persona, voce di chi comanda.' },
      { tipo: 'Presagio', soggetto: 'La carta dell’Annegato', testo: 'Mentre i barcaioli giocano, la stessa carta cade due volte: l’Annegato. Per un istante si vede, netto come un ricordo non proprio, un vecchio magazzino sul Canale Basso — quello che fu di Dellacqua — e tra le candele, una figura con le mani da liutaio. Il canale, stanotte, ha fame.' },
    ] },
  { n: 4, nome: 'La Sagrestia della Cattedrale', req: 'Don Callisto socchiude appena la porta e non fa entrare nessuno: si fida solo di chi gli porta notizie del suo sagrestano — quello di cui, in città, tutti fanno il nome.',
    testo: 'Odore d’incenso e di chiuso. Don Callisto vi riceve tra i paramenti, nervoso, nascondendo dietro la schiena le mani sporche di cera. Alle sue spalle la porta della cripta, sbarrata con assi nuove su pietra antica: «Chiusa per lavori», taglia corto, e la voce gli si incrina sull’ultima sillaba.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il registro delle elemosine', testo: 'La cera sulle mani di don Callisto è bianca, comune: vende candele di nascosto per pagare i debiti della parrocchia. Con la cera nera non c’entra — ma sul registro delle elemosine, una voce ricorrente: consegne mensili, sempre allo stesso destinatario, «B. Ferri, per conto del magazzino Dellacqua, Canale Basso». Non un cliente qualunque.' },
      { tipo: 'Testimonianza', soggetto: 'Don Callisto', testo: 'Se rassicurato, il prete crolla: certe notti dalla cripta sale un canto di molte voci — e tra tutte, una gli è fin troppo familiare: quella di Bastiano Ferri, il liutaio. «Mi ha detto lui dove si radunano davvero: un vecchio magazzino di cera sul Canale Basso, quello che fu di Dellacqua.» Troppa paura per denunciarlo, troppa vergogna per benedirlo.' },
    ] },
  { n: 5, nome: 'Bottega del Liutaio Ferri', req: 'Un vicino sorveglia la bottega da quando Ferri è sparito: si allontana solo se vi vede portare con voi qualcosa che sembra suo, come per restituirlo.',
    testo: 'La bottega è chiusa da giorni, la polvere ha già preso possesso delle vetrine; il vicino di guardia si scosta solo davanti a ciò che riportate. Dentro, violini appesi come selvaggina e un silenzio sbagliato per un luogo nato per fare musica. Il banco da lavoro è in ordine perfetto: chi è partito, sapeva di partire.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La cenere nel camino', testo: 'Nel camino, cenere di carta ancora tiepida. Un lembo si salva, grafia febbrile: «...il Coro canta anche senza di me, ormai, anche laggiù al magazzino delle cere di Dellacqua, sul Canale Basso. Che Dio perdoni ciò che ho svegliato. — B.» La grafia è la stessa del registro consegne sul banco: quella del liutaio Ferri.' },
      { tipo: 'Referto', soggetto: 'Residui sulle lime', testo: 'Su lime e sgorbie, incrostazioni di cera nera — non la pece da liutaio. Qui Ferri lavorava le candele del culto: la sua bottega è l’unica officina della città attrezzata per fonderle in quantità. Sul registro, l’ultima consegna è diretta al vecchio magazzino delle cere di Dellacqua, sul Canale Basso — non un grammo di bronzo in vista: qualunque cosa venda Learco il ramaio, non passa da qui.' },
    ] },
  { n: 6, nome: 'Il Canale Basso', req: 'Il guardiano del molo non vi lascia avvicinare: aspetta che gli diciate la parola giusta, quella sentita altrove, tra un bicchiere e l’altro.',
    testo: 'L’acqua qui non scorre: sta. Nera, ferma, densa come olio, lambisce magazzini ciechi dai portoni murati. Il guardiano notturno esce dal casotto con la lanterna alzata e, per qualche moneta, la diffidenza si scioglie in fretta: da settimane muore dalla voglia di raccontare a qualcuno quello che sente la notte.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il guardiano notturno', testo: 'Il guardiano abbassa la voce. «Certe notti li ho visti entrare — un fornaio, un sagrestano, gente che saluto al mercato — sempre dallo stesso magazzino, quello che fu di Dellacqua. E tra loro, sempre lui: il liutaio Ferri.» Uscivano all’alba con gli occhi vuoti. Non erano più loro.' },
      { tipo: 'Presagio', soggetto: 'L’acqua che ascolta', testo: 'Sfiorare l’acqua nera basta: non è fredda, sembra vigile. Per un istante si vede, netto come attraverso occhi non propri, l’interno del vecchio magazzino delle cere di Dellacqua, sul Canale Basso — le mani di un liutaio tra le candele; una stanza sepolta dagli spartiti, dove una chiave pende da un filo teso. Teso apposta. Qualcosa, sotto la città, conta i passi sul molo.' },
    ] },
  { n: 7, nome: 'L’Archivio Civico', req: 'L’archivista non alza lo sguardo finché non pronunciate la parola che avete già sentito da qualche parte in città.',
    testo: 'Scaffali fino al soffitto, cartelle legate con lo spago, la luce verde delle lampade a schermo. L’archivista, minuscolo dietro occhiali spessi, si irrigidisce quando pronunciate la parola giusta: poi, senza fiatare, vi guida a uno scaffale che nessuno tocca da decenni — la polvere è spessa un dito, tranne che su un solo fascicolo.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le note a margine', testo: 'Le mani dell’archivista tremano su un solo scaffale. Sul fascicolo, due note a margine, la stessa calligrafia frettolosa: «il sigillo a onda è ancora inciso nella cripta, sotto l’altare — non toccare a mani nude ciò che lo porta» e, più sotto, quasi illeggibile, «B. Ferri ha ripreso il posto del fondatore — vecchio magazzino Dellacqua, Canale Basso — nessuno osa contraddirlo». Chi ha scritto, temeva di essere letto.' },
    ] },
  { n: 8, nome: 'La Gendarmeria', req: 'Disponibile dall’inizio',
    testo: 'Pile di pratiche, una stufa che fuma, il brigadiere che vi riceve senza alzarsi. «Il campanaro? Sarà scappato con qualche vedova.» Ma mentre lo dice non vi guarda negli occhi, e la sua mano tamburella su un fascicolo di denunce che continua a spostare da un lato all’altro della scrivania.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La denuncia dei furti', testo: 'Confrontate, le denunce dicono più che lette una per una: la cera «rubata da tre chiese» è la stessa d’altare della cattedrale, e le quantità bastano a rifornire un solo luogo per mesi — il vecchio magazzino di Dellacqua, sul Canale Basso. Un furto così non lo organizza un gregario: pianifica, quindi comanda. Miglior cliente dei fonditori per «materiale da fusione»: sempre lo stesso nome, Bastiano Ferri.' },
      { tipo: 'Testimonianza', soggetto: 'Il fascicolo nascosto', testo: 'Il fascicolo che il brigadiere continua a spostare (fatelo parlare, o sfilateglielo): il compratore incappucciato scaricava «al molo terzo del Canale Basso, nel vecchio magazzino di Dellacqua» — pagando bene perché nessuno facesse domande: gli agenti, nel fascicolo, lo chiamano solo «il liutaio», mai per nome. La gendarmeria lo sapeva, e ha lasciato correre.' },
    ] },
].map((L) => ({
  art: LUOGHI_ART[L.n],
  // Il numero nel titolo e' l'unico posto dove compare sulla carta stessa: il
  // campo `type` sotto NON viene disegnato dal frame Tokens/Marker Card usato
  // (vedi vendor/cardconjurer/js/frames/packTokenMarker.js) - senza il numero
  // qui, la carta Luogo non mostra mai il suo numero da nessuna parte, e non
  // si puo' abbinare al dorso Approfondimenti corrispondente ("Luogo N").
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 1/Luoghi/${L.n} - ${L.nome}`,
  type: `Luogo ${L.n} — ${L.req}`,
  // Luoghi bloccati: la descrizione d'apertura lascia il posto a un tocco
  // narrativo (un guardiano, un vicino diffidente...) che giustifica perche'
  // serva qualcosa per entrare - MAI il nome dell'oggetto/la parola e MAI un
  // puntatore "(Luogo N)" - il collegamento lo fa chi gioca da solo,
  // riconoscendo cosa ha gia' trovato/sentito (vedi PROMPT-ESPANSIONE.md).
  // Luoghi aperti dall'inizio: descrizione normale, invariata.
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  n: L.n,
  nome: L.nome,
  approfondimenti: L.approfondimenti || [],
}));

// Approfondimenti gated derivati dai luoghi. Osservazione+Presagio -> carta
// "Indizio Nascosto" del luogo (una per luogo che ne ha, righe taggate per eroe).
// Testimonianza -> mazzo Testimoni; Referto -> mazzo Referti. Tutte riusano l'arte
// del luogo. Il dorso mostra SOLO il tipo, inciso direttamente nell'arte generata
// (dorso dedicato per tipo, vedi PROMPT-MIDJOURNEY.md: "Dorso carte Indizio
// Nascosto/Testimone/Referto") - mai il numero del luogo: un unico mazzo coperto
// in cui si trova la carta solo visitando quel luogo con l'abilita' giusta. Quale
// carta prendere per quale luogo sta nel PDF Episodio 1/pdf/Luoghi.pdf
// (src/gen_narrator.py), mai sulla carta stessa.
// Niente nomi eroe qui: chi sblocca cosa dipende dal roster (cambia nel tempo,
// e il jolly di Sibilla copre comunque qualunque tipo) - vive SOLO nel
// Regolamento e in Episodio N/pdf/Luoghi.pdf, mai su una carta.

const INDIZI = LUOGHI.flatMap((L) => {
  const righe = L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio');
  if (!righe.length) return [];
  // Il titolo usa il SOGGETTO della riga, mai il nome del luogo: la bibbia
  // (1-bis) vieta qualunque riferimento al luogo sulle carte, fronte o retro
  // - il ponte carta<->luogo vive solo nel fascicolo Luoghi (che elenca le
  // carte proprio per questo soggetto).
  const sogg = righe[0].soggetto;
  return [{
    art: L.art, n: L.n, kind: 'Indizio',
    title: `Indizio Nascosto — ${sogg}`,
    file: `Episodio 1/Indizi/${sogg.replace(/’/g, "'")}`,
    type: `Osservazione / Presagio`,
    rules: `{i}${righe.map((a) => `◆ (${a.tipo}) ${a.testo}`).join('\n')}{/i}`,
  }];
});

const TESTIMONI = LUOGHI.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 1/Testimoni/${a.soggetto}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const REFERTI = LUOGHI.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 1/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Oggetti trovabili: mazzo a se', arte dedicata (non riusata da altre carte).
// `effetto` copiato 1:1 da src/gen_cards.py OGGETTI (indizio del Luogo o
// `cerca` della tessera) - la carta e' solo un supporto fisico, nessuna regola
// nuova.
// `ref`/`fonte` NON vanno sulla carta (riusabilita' tra episodi + niente indizi
// su dove si trova cosa): restano solo dati per generate-narrator-reference.js,
// il pdf a parte che dice al narratore quale carta prendere per quale luogo/
// tessera. La carta stessa mostra solo il nome dell'oggetto, punto.
const OGGETTI = [
  { art: 'artworks/Corda di Violino.png', nome: 'Corda di Violino d’Argento', ref: 'L2', fonte: 'Luogo 2 — Casa di Ruggero',
    flavor: 'Ancora tesa, come se qualcuno l’avesse suonata ieri.',
    effetto: 'A Roccamora una corda così la vende una sola bottega — e qualcuno, lì, potrebbe volerla indietro.' },
  { art: 'artworks/Ampolla Benedetta.png', nome: 'Ampolla di Acqua Benedetta', ref: 'L4', fonte: 'Luogo 4 — La Sagrestia della Cattedrale',
    flavor: '«Se là sotto c’è il demonio, portate questa», vi dice, e non vi guarda negli occhi.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Diapason.png', nome: 'Il Diapason d’Argento', ref: 'L5', fonte: 'Luogo 5 — Bottega del Liutaio Ferri',
    flavor: 'Inciso con un’onda. Vibra anche senza essere toccato.',
    effetto: 'In spedizione: un’azione adiacente al Custode della Cera lo fa vibrare — Difesa 5 per il resto della partita, e il Custode salta la sua prossima attivazione.' },
  { art: 'artworks/Piede di Porco.png', nome: 'Un Piede di Porco', ref: 'T2', fonte: 'Si trova cercando in T2 — Sala delle Casse',
    flavor: 'Freddo, pesante, già piegato da altre porte.',
    effetto: '+1 alle prove per forzare e scassinare.' },
  { art: 'artworks/Talismano Onda.png', nome: 'Un Talismano a Forma d’Onda', ref: 'T3', fonte: 'Si trova cercando in T3 — Corridoio delle Candele',
    flavor: 'Tiepido al tatto, come se qualcuno lo stringesse un istante prima di voi.',
    effetto: '+1 NERVI finché lo portate. Prenderlo è una scelta: se lo lasciate lì, nessuna conseguenza. Se lo prendete, prova NERVI (Media): fallita, cera bollente — 1 danno e perdete 1 azione al prossimo turno (il talismano resta comunque vostro).' },
  { art: 'artworks/Chiave della Cella.png', nome: 'La Chiave della Cella', ref: 'T4', fonte: 'Si trova cercando in T4 — Ufficio del Custode',
    flavor: 'Ruggine recente sul dente: uso frequente.',
    effetto: 'Apre la cella in T6 con Interagire, senza prove. La chiave pende da un filo teso a un vasetto rovesciato: prenderla è una scelta. Se la lasciate lì, il registro resta comunque leggibile. Se la prendete, prova NERVI (Media): se fallita, i fumi vi stordiscono — 1 sola azione al prossimo turno (la chiave resta comunque vostra).' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 1/Oggetti/${o.nome}`,
  type: `Oggetto — ${o.fonte}`,
  ref: o.ref,
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
}));

// ================================================================ PRELUDIO
// Mini-episodio tutorial (vedi src/gen_preludio.py, fonte autoritativa dei
// testi). Stesse regole delle carte Ep. 1: numero del luogo nel titolo,
// niente riferimenti a luoghi su Approfondimenti/Oggetti. Le arti sono nella
// PROMPT-MIDJOURNEY-Preludio.md.
const PRELUDIO_LUOGHI = [
  { n: 'P1', nome: 'Il Palazzo del Lume', req: 'Disponibile dall’inizio',
    art: 'artworks/Palazzo del Lume.png',
    testo: 'Il palazzo della Società sa di cera d’api e di anni chiusi a chiave: undici poltrone attorno a un tavolo, dieci ritratti alle pareti e un gancio vuoto dove l’undicesimo è stato tolto. La stanza di Ansaldo è in fondo al corridoio, ordinata come una cella di monaco. M. vi osserva dalla soglia, e non tocca nulla.' },
  { n: 'P2', nome: 'La Taverna della Chiatta', req: 'Disponibile dall’inizio',
    art: 'artworks/Taverna della Chiatta.png',
    testo: 'Dirimpetto al palazzo, oltre il ponte, la taverna è il posto da cui si vede chi entra e chi esce dalla porta della Società. L’oste lucida bicchieri che restano opachi e parla volentieri: da queste parti un cliente nuovo è un avvenimento, tre clienti nuovi sono una storia.' },
  { n: 'P3', nome: 'Il Banco dei Pegni di Fossa', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Mezza Roccamora è passata da Fossa a impegnare l’altra metà. Dietro la grata, il vecchio prestatore vi squadra come si squadra un anello: cercando il difetto. Il suo registro è la vera cronaca del quartiere — basta saperlo leggere, o pagare la tariffa.' },
  { n: 'P4', nome: 'La Dogana Vecchia', req: 'L’uomo con la canna da pesca non stacca gli occhi da voi: sembra aspettare una parola d’ordine, la stessa bisbigliata in qualche taverna.',
    art: 'artworks/Dogana Vecchia.png',
    testo: 'In fondo al canale di ponente, la vecchia dogana marcisce da vent’anni: banchina sfondata, portoni murati, una chiatta ormeggiata dove non dovrebbe esserci niente. Un uomo finge di pescare senza esca, e vi guarda arrivare per tutto il molo.' },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Preludio/${L.n} - ${L.nome}`,
  type: `Luogo ${L.n} — ${L.req}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
}));

const PRELUDIO_APPROFONDIMENTI = [
  { art: 'artworks/Palazzo del Lume.png', kind: 'Indizio',
    title: 'Indizio Nascosto — La polvere smossa a metà',
    file: 'Preludio/Indizio - La polvere smossa a meta',
    type: 'Preludio · Osservazione',
    rules: '{i}◆ (Osservazione) La polvere sullo scaffale del 1741 è smossa solo a metà: chi ha preso il fascicolo sapeva DOVE cercare, ma non era pratico dell’archivio. Non era Ansaldo — e nemmeno un ladro qualunque.{/i}' },
  { art: 'artworks/Taverna della Chiatta.png', kind: 'Testimone',
    title: 'Testimone — Il barcaiolo della Chiatta',
    file: 'Preludio/Testimone - Il barcaiolo della Chiatta',
    type: 'Preludio · Testimone',
    rules: '{i}Con un bicchiere davanti, il barcaiolo ricorda: due notti, un passeggero fino alla riva del palazzo. «Un signore ben vestito, mani da artigiano. Pagava doppio per non avere domande. Mai di giorno.»{/i}' },
  { art: 'artworks/Banco dei Pegni.png', kind: 'Referto',
    title: 'Referto — L’orologio impegnato',
    file: 'Preludio/Referto - L’orologio impegnato',
    type: 'Preludio · Referto',
    rules: '{i}Il vetro è incrinato e sulla corona c’è sangue secco, ma poco: un colpo solo, di taglio, non una colluttazione lunga. Ansaldo è stato tramortito, non ucciso — un morto non serve a chi ha ancora domande da fargli.{/i}' },
  { art: 'artworks/Dogana Vecchia.png', kind: 'Indizio',
    title: 'Indizio Nascosto — Le due voci sotto la banchina',
    file: 'Preludio/Indizio - Le due voci sotto la banchina',
    type: 'Preludio · Presagio',
    rules: '{i}◆ (Presagio) Chi si sofferma ad ascoltare i colpi sotto la banchina giurerebbe che, per un istante, rispondono in due voci — non una. Come se qualcosa, là sotto, stesse imparando la cadenza.{/i}' },
];

const PRELUDIO_OGGETTI = [
  { art: 'artworks/Anello di Chiavi.png', title: 'L’Anello di Chiavi',
    file: 'Preludio/L’Anello di Chiavi',
    type: 'Oggetto — Preludio',
    rules: '{i}Vent’anni di tasca l’hanno lucidato più di qualunque argentiere.{/i}{divider}Nella spedizione: apre la porta della banchina (T1 → T2) con Interagire, senza prove.' },
  { art: 'artworks/Acquavite del Daziere.png', title: 'L’Acquavite del Daziere',
    file: 'Preludio/L’Acquavite del Daziere',
    type: 'Oggetto — Preludio',
    rules: '{i}Nascosta sotto la cassa sbagliata apposta. Brucia, ma scalda.{/i}{divider}1 uso: con un’azione, un eroe la beve (o la offre a un eroe adiacente) e recupera 1 Salute.' },
  { art: 'artworks/Pipa di Ansaldo.png', title: 'La Pipa di Ansaldo',
    file: 'Preludio/La Pipa di Ansaldo',
    type: 'Oggetto — Preludio',
    rules: '{i}Radica scura, morsa da una vita. Sa ancora di tabacco buono.{/i}{divider}Effetto: nessuno finora scoperto.' },
];

// Sottocartella per tipo, cosi' e' chiaro a colpo d'occhio se una carta e' la
// scheda nemico (combattimento) o la carta minaccia (evento dal mazzo), anche
// quando condividono soggetto/art (es. "Il Fonditore" esiste in entrambe).
// I nemici del culto sono legati alla trama dell'Episodio 1; la Malavita
// (Sgherro/Sicario) e' dichiaratamente riusabile in ogni episodio (vedi
// PROMPT-ESPANSIONE.md) e resta percio' comune, fuori da "Episodio 1/".
// Windows non accetta " < > : | ? * nei nomi file (es. Nino "Grimaldello"
// Cauto): lib.js li toglie dal nome salvato su disco (outName), quindi
// vanno tolti anche qui - altrimenti generate-print-sheets.js cerca un file
// con le virgolette che non esiste, e salta il fronte della carta.
const sanitizeFile = (s) => s.replace(/["<>:|?*]/g, '');
NEMICI.forEach((n) => {
  n.file = sanitizeFile((n.type.includes('Malavita') ? 'Nemici/' : 'Episodio 1/Nemici/') + n.title);
});
HEROES.forEach((h) => { h.file = sanitizeFile(`Eroi/${h.title}`); });

const PRELUDIO = [...PRELUDIO_LUOGHI, ...PRELUDIO_APPROFONDIMENTI, ...PRELUDIO_OGGETTI];

// ============================================================ EPISODIO 2
// «La voce del bronzo» — vedi DESIGN-EPISODIO-2.md. Stesso schema dell'Ep. 1:
// LUOGHI2 porta testo carta + approfondimenti (le carte derivate si generano
// con gli stessi flatMap), MINACCE2 flavor+effetto, oggetti con arte dedicata.

const LUOGHI2 = [
  { n: 1, nome: 'La Fonderia Dossena', req: 'Disponibile dall’inizio',
    art: 'artworks/Fonderia Dossena.png',
    testo: 'La colata è sospesa e la fonderia trattiene il fiato: la forma della campana nuova è una fossa aperta al centro del pavimento. Gli attrezzi di Ilario sono appesi in ordine, tranne uno. Gli operai parlano piano, come si fa nelle case dove qualcuno è morto — o non è tornato.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani del capomastro',
        testo: 'Sartorio parla col cappello in mano, addoloratissimo. Ma sotto le unghie, mentre lo torce, brillano trucioli sottili di piombo — piombo da sigillo, quello che si taglia e si rifonde. Un fonditore di campane il piombo non lo tocca mai: non entra nella lega.' },
      { tipo: 'Referto', soggetto: 'La zavorra',
        testo: 'I pani lasciati nei casseri non sono bronzo: ghisa da scafo, fusa male, piena di sabbia di mare. A Roccamora la ghisa da scafo si compra in un posto solo — dove le barche vanno a morire.' },
    ] },
  { n: 2, nome: 'La Cella Campanaria di San Teodoro', req: 'Disponibile dall’inizio',
    art: 'artworks/Cella campanaria.png',
    testo: 'La campana grande porta la sua crepa come una cicatrice che non si chiude: quando il vento gira, la ferita respira. Ruggero Alvise sale i gradini davanti a voi senza contarli. «Ilario ha suonato il provino qui», dice, e abbassa la voce come in chiesa.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La crepa che canta',
        testo: 'Appoggiare l’orecchio alla crepa basta: si vede una fossa di colata piena di braci, e una passerella di assi sopra l’acqua nera — assi che NON reggeranno chi ci correrà sopra. La visione dura un rintocco. Poi la campana tace, in colpa.' },
      { tipo: 'Testimonianza', soggetto: 'Ruggero',
        testo: '«Le chiatte senza lanterne mostrano un contrassegno di piombo al pesatore, grande come una moneta, con un segno tipo un’onda. L’ho visto per anni dal campanile: di notte, da quassù, si vede tutto — ma nessuno pensa mai a chi sta in alto.»' },
    ] },
  { n: 3, nome: 'L’Osteria della Bilancia', req: 'Disponibile dall’inizio',
    art: 'artworks/Osteria della Bilancia.png',
    testo: 'L’osteria dei facchini del dazio non chiude mai davvero: cambia solo turno. Sotto la stadera d’ottone appesa alle travi si beve, si gioca e si pesa ogni parola come fosse merce. Uno sconosciuto che paga da bere, qui, compra più di un giro.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il facchino insonne',
        testo: '«Il capomastro dei Dossena beveva qui ogni notte, e ai tavoli di dietro perdeva più di quanto pesasse. Da un mese paga da bere a tutti e non tocca una carta. Chi smette di giocare così, di colpo, i debiti non li ha vinti: glieli ha pagati qualcuno.»' },
    ] },
  { n: 4, nome: 'Il Deposito Daziario',
    req: 'Il piantone alla sbarra non guarda nemmeno chi passa: ascolta. Aspetta le due parole che i facchini si scambiano al cambio, e voi non le sapete ancora.',
    art: 'artworks/Deposito Daziario.png',
    testo: 'Il corpo dei magazzini sa di iuta, sego e piombo. Le rastrelliere del bronzo di stato sono in fondo, dietro tre sbarre e un registro: i sigilli pendono intatti — troppo intatti, come una firma ricalcata.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il piombo dei sigilli',
        testo: 'I sigilli non sono stati strappati: tagliati e rifusi, a caldo, con mano paziente. La rifusione lascia trucioli sottili come capelli — gli stessi che qualcuno, in fonderia, porta ancora sotto le unghie senza saperlo.' },
      { tipo: 'Osservazione', soggetto: 'La firma del pesatore',
        testo: 'La pesa notturna del giorno del furto torna alla perfezione, riga per riga. Ma la firma del pesatore trema dove le altre notti correva: una mano costretta, o comprata, o tutt’e due. Da tre giorni, quella mano non firma più.' },
    ] },
  { n: 5, nome: 'Corte della Faenza',
    req: 'La vedova che abita la corte vi squadra dalla ringhiera: «Il capomastro non c’è per nessuno». Ma il suo sguardo corre a ciò che avete in mano — o a ciò che non avete.',
    art: 'artworks/Corte della Faenza.png',
    testo: 'La stanza del capomastro tradisce una fortuna recente: vestiti buoni coi cartellini ancora attaccati, una valigia pronta dietro la porta, e sul tavolo, sotto la candela, un mazzetto di ricevute tenute insieme da un nastro nuovo.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'La vedova della corte',
        testo: '«Ogni martedì un ragazzo gli porta una busta. Mai visto in faccia: sta col berretto basso e se ne va di corsa. Ma lo sento arrivare prima di vederlo — puzza di scoria bruciata, come i cenciaioli che frugano nell’isola dei forni spenti.»' },
    ] },
  { n: 6, nome: 'Il Banco dei Pegni di Fossa', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Fossa è ancora lì, dietro la sua grata, come se il Preludio non fosse mai finito: mezza Roccamora impegna, l’altra metà riscatta. Vi riconosce — o riconosce il modo in cui si entra da lui sapendo già cosa chiedere — e per una volta non chiede tariffa.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Fossa',
        testo: '«Il piombo daziario lo riconosco a occhi chiusi: me ne hanno offerto un sacchetto di trucioli, settimana scorsa. Ho detto no. Chi era? Il capomastro dei Dossena in persona, con le mani sporche. Non l’ho scritto sul registro: certe firme portano male.»' },
    ] },
  { n: 7, nome: 'Il Molo delle Chiatte',
    req: 'Il capobarca spegne la pipa quando vi vede arrivare e riprende a spalare come se non esisteste: di certe corse notturne parla solo con chi mostra di saperle già chiamare per nome.',
    art: 'artworks/Molo delle Chiatte.png',
    testo: 'Le chiatte dormono legate in due file, chiglia contro chiglia. Una sola galleggia alta, leggera, come chi ha appena posato un peso che non voleva portare. Il capobarca smonta alle nove: dopo, qui restano solo l’acqua e le cime che cigolano.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'L’acqua che pesa',
        testo: 'Sotto la chiglia alta l’acqua ha memoria: si sente ancora il peso che non è mai stato scritto su nessuna pesa, pani su pani, e il fondo che li ha contati uno a uno. L’acqua non fa la spia. Ricorda soltanto — e chi ascolta, sa.' },
    ] },
  { n: 8, nome: 'La Camera dei Pesi e delle Misure',
    req: 'L’usciere socchiude la porta sul buio delle teche: «Solo personale daziario». Poi resta lì, in ascolto, come chi aspetta di sentirvi dire le due parole del mestiere.',
    art: 'artworks/Camera dei Pesi.png',
    testo: 'I campioni d’ottone dormono nelle teche come reliquie, e i registri delle pese salgono fino al soffitto. L’usciere spegne le lampade alle dieci in punto, da trent’anni: la burocrazia di Roccamora è l’unico orologio che non sbaglia mai.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La doppia pesa',
        testo: 'Registro alla mano: la differenza fra la pesa dichiarata e il pescaggio annotato dai fanalisti fa esattamente il tonnellaggio dei pani del Quarantuno. Non un furto: una sostituzione, firmata da chi le bilance le conosce troppo bene per sbagliarle così bene.' },
    ] },
  { n: 9, nome: 'Il Cimitero delle Barche',
    req: 'Il demolitore non alza la testa dal suo scafo: per lui esistono solo quelli del mestiere, quelli che sanno chiamare la sua merce col suo nome — gli altri sono gendarmi, o peggio.',
    art: 'artworks/Cimitero delle Barche.png',
    testo: 'Nell’ansa morta del canale le barche vanno a morire in silenzio: chiglie spaccate, costole all’aria, e il vento che tra gli scafi vuoti trova sempre una nota. Il demolitore lavora anche di notte — il ferro non aspetta.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La bolla di Learco',
        testo: 'Il ramaio del Vecchio Mercato compra qui, con regolare bolla: date e quantità del suo bronzo coincidono con i relitti demoliti, non coi pani spariti. Chi ha comprato la ghisa da scafo, invece, ha pagato in contanti — e si è fatto consegnare al molo daziario.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 2/Luoghi/${L.n} - ${L.nome}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP2_INDIZI = LUOGHI2.flatMap((L) => {
  const righe = L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio');
  if (!righe.length) return [];
  const sogg = righe[0].soggetto;
  return [{
    art: L.art, n: L.n, kind: 'Indizio',
    title: `Indizio Nascosto — ${sogg}`,
    file: `Episodio 2/Indizi/${sogg.replace(/’/g, "'")}`,
    type: 'Osservazione / Presagio',
    rules: `{i}${righe.map((a) => `◆ (${a.tipo}) ${a.testo}`).join('\n')}{/i}`,
  }];
});

const EP2_TESTIMONI = LUOGHI2.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 2/Testimoni/${a.soggetto}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP2_REFERTI = LUOGHI2.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 2/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP2_MINACCE = [
  { art: 'artworks/Turno di guardia.png', title: 'Turno di Guardia', tipo: 'Malavita',
    flavor: 'Passi regolari sulla scoria: qualcuno è pagato per non dormire.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera in cui si trova l’eroe attivo.' },
  { art: 'artworks/Turno di guardia.png', title: 'I Bravi del Capomastro', tipo: 'Malavita',
    flavor: 'Facce da molo, paga da fonderia. Non fanno domande.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Turno di guardia.png', title: 'Fischio dal Piazzale', tipo: 'Malavita',
    flavor: 'Due dita in bocca, una nota sola. La risposta arriva.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Turno di guardia.png', title: 'Il Giro del Piazzale', tipo: 'Malavita',
    flavor: 'La ronda passa tra le forme come tra lapidi.',
    effect: 'Piazzate 2 Sgherri sull’ingresso della Banchina delle Scorie (T1).' },
  { art: 'artworks/Il carceriere.png', title: 'Il Carceriere', tipo: 'Malavita',
    flavor: 'Qualcuno, di sopra, affila qualcosa con molta calma.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il carceriere.png', title: 'Lama tra le Forme', tipo: 'Malavita',
    flavor: 'Un riflesso tra le fosse di colata. Poi più niente.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Il Crogiolante.png', title: 'Mestolata', tipo: 'Posseduto',
    flavor: 'Il mestolo pesca nel crogiolo senza guardare. Non sbaglia mai.',
    effect: 'Piazzate 1 Crogiolante sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il Crogiolante.png', title: 'Il Secchio Bolle', tipo: 'Posseduto',
    flavor: 'Sentite il calore in faccia prima ancora dei passi.',
    effect: 'Piazzate 1 Crogiolante sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il Crogiolante.png', title: 'Squadra di Colata', tipo: 'Posseduto',
    flavor: 'Lavorano al buio. Il metallo fa luce da sé.',
    effect: 'Piazzate 1 Crogiolante sull’uscita più vicina agli eroi della tessera corrente. Se è già in gioco un Crogiolante, si attiva subito.' },
  { art: 'artworks/Il ritiro.png', title: 'Il Ritiro', tipo: 'Posseduto',
    flavor: 'Una chiatta senza lanterne accosta. Nessuno rema.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Banchina delle Scorie (T1).' },
  { art: 'artworks/Il ritiro.png', title: 'Volti alla Banchina', tipo: 'Posseduto',
    flavor: 'Maschere lisce contano le campanelle. Una manca.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Banchina delle Scorie (T1).' },
  { art: 'artworks/Cenere negli occhi.png', title: 'Cenere negli Occhi', tipo: 'Insidia',
    flavor: 'Il vento del forno vi trova gli occhi, uno a uno.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, cenere rovente — 1 danno.' },
  { art: 'artworks/Pavimento di scoria.png', title: 'Pavimento di Scoria', tipo: 'Insidia',
    flavor: 'La crosta nera regge, regge, regge. Poi no.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Il fischio del forno.png', title: 'Il Fischio del Forno', tipo: 'Insidia',
    flavor: 'Un fischio sottile, appena oltre l’udito. I denti dolgono.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il primo rintocco.png', title: 'Il Primo Rintocco', tipo: 'Crescendo',
    flavor: 'Una campanella grezza rintocca da sola. Una volta.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: lo Scoriatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il bronzo risponde.png', title: 'Il Bronzo Risponde', tipo: 'Crescendo',
    flavor: 'Le campanelle in fila si inclinano insieme, in ascolto.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: lo Scoriatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/La lega canta.png', title: 'La Lega Canta', tipo: 'Crescendo',
    flavor: 'Il metallo fuso vibra a onde ferme, come una gola.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: lo Scoriatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Polvere di bronzo.png', title: 'Polvere di Bronzo', tipo: 'Quiete',
    flavor: 'Oro finto sospeso nell’aria ferma. Nessun rumore, da nessuna parte.',
    effect: 'Nessun effetto. Tirate il fiato — qualcosa, là fuori, lo sta trattenendo.' },
  { art: 'artworks/Uno spiffero dal canale.png', title: 'Uno Spiffero dal Canale', tipo: 'Favore',
    flavor: 'Aria fredda e pulita, da una parte che non conoscevate.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Scorie che franano.png', title: 'Scorie che Franano', tipo: 'Ostacolo',
    flavor: 'La collina nera si muove. Meglio non esserci sotto.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il ronzio nei denti.png', title: 'Il Ronzio nei Denti', tipo: 'Insidia',
    flavor: 'Non lo sentite con le orecchie. Lo sentite con le otturazioni.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal dolore.' },
  { art: 'artworks/Il ritiro.png', title: 'Segugi del Coro', tipo: 'Bivio',
    flavor: 'Sanno cosa portate. Lo sentono cantare da qui.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Banchina delle Scorie (T1): punta sempre l’eroe che porta lo spartito (se nessuno lo porta: il più vicino).' },
  { art: 'artworks/Il ritiro.png', title: 'Segugi del Coro (II)', tipo: 'Bivio',
    flavor: 'Il secondo non ha fretta. Il primo vi ha già trovati.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Banchina delle Scorie (T1): punta sempre l’eroe che porta lo spartito (se nessuno lo porta: il più vicino).' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 2/Minacce/${m.title}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP2_OGGETTI = [
  { art: 'artworks/Martello di Collaudo.png', nome: 'Il Martello di Collaudo', ref: 'E2-L1',
    fonte: 'Luogo 1 — La Fonderia Dossena',
    flavor: 'Il manico è consumato dove Ilario lo stringeva. Solo lì.',
    effetto: 'Da solo: nessun effetto. Insieme allo SMORZO DI FELTRO, un’azione adiacente allo Scoriatore: il colpo smorzato lo stona — Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione.' },
  { art: 'artworks/Smorzo di Feltro.png', nome: 'Lo Smorzo di Feltro', ref: 'E2-L2',
    fonte: 'Luogo 2 — La Cella Campanaria',
    flavor: 'Feltro grigio, spesso quanto un messale. Sa di torre e di corda.',
    effetto: 'Da solo: nessun effetto. Insieme al MARTELLO DI COLLAUDO, un’azione adiacente allo Scoriatore: il colpo smorzato lo stona — Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione.' },
  { art: 'artworks/Contrassegno di Piombo.png', nome: 'Il Contrassegno di Piombo', ref: 'E2-L7',
    fonte: 'Luogo 7 — Il Molo delle Chiatte',
    flavor: 'Una moneta senza re, con mezza onda al posto della faccia.',
    effetto: 'In spedizione: mostrandolo, lo sbarco alla Banchina è silenzioso — l’apparizione segnata su T1 «QUANDO RIVELATE» non ha luogo.' },
  { art: 'artworks/Polizza del Monte.png', nome: 'La Polizza del Monte', ref: 'E2-L6',
    fonte: 'Luogo 6 — Il Banco dei Pegni di Fossa',
    flavor: 'Riscattata, timbrata, dimenticata. La fretta lascia ricevute.',
    effetto: 'A Roccamora una polizza riscattata si riporta al proprietario — e certe porte, davanti a chi restituisce, si aprono da sole.' },
  { art: 'artworks/Badile del Formatore.png', nome: 'Un Badile del Formatore', ref: 'E2-T2',
    fonte: 'Si trova cercando in T2 — Il Piazzale delle Forme',
    flavor: 'Corto, pesante, con la pala consumata a mezzaluna.',
    effetto: '+1 alle prove per forzare e scassinare.' },
  { art: 'artworks/Latta d’Olio di Colata.png', nome: 'Una Latta d’Olio di Colata', ref: 'E2-T3',
    fonte: 'Si trova cercando in T3 — Il Magazzino delle Staffe',
    rischio: true,
    flavor: 'Denso, ambrato, senza etichetta. Il metallo lo beve.',
    effetto: 'Versato su un’arma: +1 all’attacco fino a fine round (2 usi). La latta è incastrata tra le staffe: prenderla è una scelta. Se la lasciate lì, nessuna conseguenza. Se la prendete, prova NERVI (Media): se fallita, scivolata — 1 danno e perdete 1 azione al prossimo turno (la latta resta comunque vostra).' },
  { art: 'artworks/Medaglia del Fonditore.png', nome: 'La Medaglia del Fonditore', ref: 'E2-L9',
    fonte: 'Luogo 9 — Il Cimitero delle Barche',
    flavor: 'Un santo con la campana in mano, consumato dai pollici di tre generazioni.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 2/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP2_NEMICI = [
  { art: 'artworks/Lo Scoriatore.png', title: 'Lo Scoriatore',
    type: 'Guardiano (Boss) — Episodio 2',
    rules: '{i}Vent’anni da solo tra le scorie, finché una colata di prova non gli ha insegnato a risuonare: il grembiule di cuoio gli si è fuso addosso, e il petto rimbomba come bronzo cavo a ogni passo.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
  { art: 'artworks/Il Crogiolante.png', title: 'Il Crogiolante',
    type: 'Operaio del Coro — Episodio 2',
    rules: '{i}Pagato in contanti per non fare domande, poi pagato in altro per non poterne più fare. Il mestolo trabocca e lui non sente il caldo.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
].map((n) => ({ ...n, file: `Episodio 2/Nemici/${n.title}` }));

const EP2 = [...LUOGHI2, ...EP2_INDIZI, ...EP2_TESTIMONI, ...EP2_REFERTI,
             ...EP2_MINACCE, ...EP2_OGGETTI, ...EP2_NEMICI];


// ============================================================ EPISODIO 3
// «Le voci del pozzo» — vedi DESIGN-EPISODIO-3.md. Stesso schema dell'Ep. 2.

const LUOGHI3 = [
  { n: 1, nome: 'Il Lavatoio Grande', req: 'Disponibile dall’inizio',
    art: 'artworks/Lavatoio Grande.png',
    testo: 'Il chiostro d’acqua del Borgo: mastelli in fila, vapore a colonne, panni stesi che dividono la luce in stanze. Una volta qui si lavorava cantando. Adesso si sente solo l’acqua — e sul terzo pozzo, in fondo alla corte, nessuna lavandaia stende più.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Le lavandaie',
        testo: '«Il barbiere passa all’alba, col suo borsone dei salassi. Anche nelle corti dove non è malato nessuno. Lo vediamo perché all’alba ci siamo solo noi — e lui non guarda mai le finestre: guarda i chiusini, e conta coi passi.»' },
      { tipo: 'Osservazione', soggetto: 'L’acqua che ascolta',
        testo: 'L’acqua del terzo pozzo non increspa: bussando sul coperchio del chiusino, il suono torna su lungo, doppio, come da una stanza grande. Gli altri pozzi rispondono corto. Là sotto non c’è una canna d’acqua: c’è una sala.' },
    ] },
  { n: 2, nome: 'La Bottega del Barbiere', req: 'Disponibile dall’inizio',
    art: 'artworks/Bottega del Barbiere.png',
    testo: 'Piccola, calda, in ordine feroce: i rasoi per taglia, la poltrona lucidata dagli anni, alla parete il carboncino di un bambino che ride. Mastro Silvano lavora piano e parla piano — ma quando il vento passa sotto la porta, la mano col rasoio si ferma a mezz’aria, in ascolto.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani del barbiere',
        testo: 'Mani curatissime, da mestiere. Ma le nocche portano segni di corda e d’argano, e sotto le unghie — mentre versa l’acqua di lavanda — una polvere chiara che non è talco: polvere di pietra, e cera da sigillo. Mani che di notte fanno un altro lavoro.' },
      { tipo: 'Testimonianza', soggetto: 'Silvano, su Piero',
        testo: 'Quando parlate di Piero, la cortesia si incrina. Dal collo tira fuori un campanellino d’argento, consumato: «lo suonavo io, piano, quando aveva le febbri. Tenetelo voi, per la processione di San Rocco — a me, ormai, canta troppo.» (Prendete la carta Il Campanello di Piero.)' },
    ] },
  { n: 3, nome: 'La Gazzetta di Roccamora', req: 'Disponibile dall’inizio',
    art: 'artworks/Gazzetta di Roccamora.png',
    testo: 'Una stanza sola sopra la tipografia, che trema tutta quando le macchine battono. Ranuzzi parla come titola, a corpo dodici: il suo mostro col rasoio vende benissimo. Di sotto, il tipografo compone parole al contrario, piombo a piombo — e ascolta tutto, da sempre.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il tipografo',
        testo: '«Stampo alle tre, e alle tre il Borgo è mio. Due volte ho visto il barbiere coi suoi ferri, fermo a un chiusino, col lanternino schermato. Non l’ho scritto a Ranuzzi: il barbiere mi ha cavato un dente gratis, e poi il mostro col rasoio vende di più di un uomo in ginocchio che ascolta un buco.»' },
    ] },
  { n: 4, nome: 'La Casa di Tobia', req: 'Disponibile dall’inizio',
    art: 'artworks/Casa di Tobia.png',
    testo: 'Corda, sego e minestra fredda: i ferri del pozzaiolo appesi per taglia, il quaderno dei pozzi aperto sul banco, sfogliato da mani estranee. La moglie sta alla finestra che guarda la corte — e ogni volta che un chiusino sbatte nel Borgo, il suo respiro si ferma un momento.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'La moglie di Tobia',
        testo: '«Un mese fa qualcuno lo ha pagato per sapere dei pozzi murati. Tanto. Lui ha detto no — “certe acque si lasciano dormire” — e da allora ha smesso di raccontarmi le giornate. L’ultima sera ha detto solo: devo chiudere una cosa che ho aperto io.»' },
    ] },
  { n: 5, nome: 'Il Catasto delle Acque',
    req: 'L’archivista non alza gli occhi dal timbro: «Le acque vive al piano di sopra. Questa sala è un’altra materia — e la materia, qui, bisogna saperla chiamare col suo nome.»',
    art: 'artworks/Catasto delle Acque.png',
    testo: 'La sala delle acque morte è in fondo a un corridoio che nessuno spazza: mappe arrotolate, il catasto delle falde, un lume verde. Sul tavolo grande, tenuta ferma da quattro pesi, la mappa del Borgo — e intorno, nella polvere, un rettangolo pulito.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il ventaglio delle falde',
        testo: 'Ricalcando le mappe una sull’altra, il ventaglio si chiude: ogni vena del Borgo passa per il terzo pozzo della corte del Lavatoio prima di andare altrove. Chi parla in quella gola di pietra, parla in tutte le acque di Roccamora.' },
    ] },
  { n: 6, nome: 'La Bottega del Lattoniere Bo',
    req: 'Bo salda e non ascolta: mezzo Borgo gli deve grondaie. Alza la testa solo per i clienti che sanno di che lavoro si parla — e voi, per ora, non lo sapete.',
    art: 'artworks/Lattoniere Bo.png',
    testo: 'La bottega è un organo essa stessa: canne, grondaie e lattoneria appese a ogni trave, che al passaggio d’aria suonano piano, ognuna la sua nota. Sul ripiano dei resi, in mezzo alla ferraglia onesta, una sola canna sigillata che non suona.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Bo, sul committente',
        testo: '«Il committente mai visto: solo il garzone, uno svelto, di quelli che non guardano in faccia. La carta però la riconosco: è carta da registro, di quella che usano negli uffici buoni. E chi scrive così non ha mai saldato una grondaia in vita sua.»' },
    ] },
  { n: 7, nome: 'La Parrocchia del Borgo',
    req: 'Il parroco vi ferma sul portale: «Se venite per il coro, la prova è finita. Se venite per altro, ditemi per CHI venite — qui i nomi contano più delle facce.»',
    art: 'artworks/Parrocchia del Borgo.png',
    testo: 'Povera e pulita: banchi lucidi di cera, l’organo piccolo con una canna storta, il registro dei morti sul leggio della sacrestia. Dalla finestra si vede la corte dei pozzi murati — e il sagrestano, ogni volta che ci passa davanti, cambia lato al corridoio.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La voce nel pozzo',
        testo: 'Nella sacrestia, l’acquasantiera trema senza mani: si vede una galleria di pietra bagnata dove l’eco non restituisce la vostra voce — ne restituisce un’altra, sbagliata, che vi chiama per nome. E si vede che chi tace, e stringe qualcosa al petto, passa. La visione dura un rintocco.' },
    ] },
  { n: 8, nome: 'L’Ospedale della Carità',
    req: 'La suora portinaia non apre ai curiosi: «I muti non sono bestie da fiera». Entra chi sa dire di che CURA si tratta — il nome del mestiere, non quello del male.',
    art: 'artworks/Ospedale della Carità.png',
    testo: 'La sezione dei muti è la più silenziosa di un posto già silenzioso: quattro letti, quattro lavagnette, il gesso che stride. Gli ammutoliti vi seguono con gli occhi tutti insieme, come una cosa sola — e nessuno dei quattro, dice il medico, piange mai.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'L’accordatura',
        testo: 'Sotto la lente, il taglio non recide: TENDE. La lama è entrata a metà e ha tirato, come si tende una corda sul ponticello. Un lavoro che al mondo sanno fare in due: chi accorda strumenti, e chi apre gole per mestiere senza ucciderle — un cerusico. O tutt’e due insieme.' },
    ] },
  { n: 9, nome: 'La Corte dei Pozzi Murati',
    req: 'I chiusini della corte sono serrati con lucchetti daziari: senza le chiavi giuste si può solo girare intorno ai coperchi — e ascoltare da fuori, come fanno i cani.',
    art: 'artworks/Corte dei Pozzi Murati.png',
    testo: 'Una piazza che la città ha dimenticato apposta: undici coperchi di ferro in cerchio, il selciato gobbo, l’erba nelle fughe. La brina, all’alba, fa l’appello dei coperchi uno a uno — e uno, ogni volta, non risponde: asciutto, tiepido, col suo cerchio scuro intorno.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'I segni delle corde',
        testo: 'I solchi non sono tutti uguali: quelli vecchi scendono dritti — secchi d’acqua. Quelli nuovi strisciano di lato, dove la corda ha lavorato di peso e di paziente: casse, o canne, o un uomo che non collabora. L’ultimo solco è di stanotte.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 3/Luoghi/${L.n} - ${L.nome}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP3_INDIZI = LUOGHI3.flatMap((L) => {
  const righe = L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio');
  if (!righe.length) return [];
  const sogg = righe[0].soggetto;
  return [{
    art: L.art, n: L.n, kind: 'Indizio',
    title: `Indizio Nascosto — ${sogg}`,
    file: `Episodio 3/Indizi/${sogg.replace(/’/g, "'")}`,
    type: 'Osservazione / Presagio',
    rules: `{i}${righe.map((a) => `◆ (${a.tipo}) ${a.testo}`).join('\n')}{/i}`,
  }];
});

const EP3_TESTIMONI = LUOGHI3.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 3/Testimoni/${a.soggetto}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP3_REFERTI = LUOGHI3.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 3/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo Minaccia dell'episodio: 21 carte + 1 del Bivio («La campana nuova»,
// solo ramo "rifusa"). Mix: 11 spawn, 3 insidie, 3 crescendo, 4 eventi.
const EP3_MINACCE = [
  { art: 'artworks/Il calare dei secchi.png', title: 'Il Calare dei Secchi', tipo: 'Posseduto',
    flavor: 'Dall’occhio della volta, una corda si tende. Il secchio non porta acqua.',
    effect: 'Piazzate 1 Adepto sotto la corda della Confluenza (T4). Se T4 non è rivelata: sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il calare dei secchi.png', title: 'Corde dall’Alto', tipo: 'Posseduto',
    flavor: 'Il sego non cigola. È questo, il punto del sego.',
    effect: 'Piazzate 1 Adepto sotto la corda della Confluenza (T4). Se T4 non è rivelata: sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il calare dei secchi.png', title: 'Il Ritiro delle Canne', tipo: 'Posseduto',
    flavor: 'Qualcuno è venuto a prendere le voci. Non se ne andrà a mani vuote.',
    effect: 'Piazzate 1 Adepto sull’ingresso dell’Officina delle Canne (T5). Se T5 non è rivelata: sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Voce Cava.png', title: 'Un’Eco di Troppo', tipo: 'Posseduto',
    flavor: 'Contate i vostri respiri. Ce n’è uno in più.',
    effect: 'Piazzate 1 Voce Cava sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Voce Cava.png', title: 'La Voce che Manca', tipo: 'Posseduto',
    flavor: 'Una gola del Borgo cammina laggiù, cercando il suo padrone.',
    effect: 'Piazzate 1 Voce Cava sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Voce Cava.png', title: 'Il Coro Prova', tipo: 'Posseduto',
    flavor: 'Una nota sola, tenuta troppo a lungo per polmoni veri.',
    effect: 'Piazzate 1 Voce Cava sull’uscita più vicina agli eroi della tessera corrente. Se è già in gioco una Voce Cava, si attiva subito.' },
  { art: 'artworks/Guardiani dei chiusini.png', title: 'Guardiani dei Chiusini', tipo: 'Malavita',
    flavor: 'Qualcuno paga perché i coperchi restino coperchi.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Guardiani dei chiusini.png', title: 'Il Turno di Sotto', tipo: 'Malavita',
    flavor: 'Anche laggiù si smonta e si monta. La paga è doppia, e si capisce perché.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Guardiani dei chiusini.png', title: 'L’Uomo Pagato in Contanti', tipo: 'Malavita',
    flavor: 'Non fa domande da così tanto tempo che ha disimparato.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Chiusini che sbattono.png', title: 'Passi nella Galleria', tipo: 'Posseduto',
    flavor: 'Dietro di voi, qualcuno cammina nel vostro stesso passo. Per non farsi contare.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala dei Chiusini (T1).' },
  { art: 'artworks/Chiusini che sbattono.png', title: 'Chiusini che Sbattono', tipo: 'Posseduto',
    flavor: 'In superficie, uno dopo l’altro, i coperchi salutano qualcuno che scende.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala dei Chiusini (T1).' },
  { art: 'artworks/Il buio d’acqua.png', title: 'Il Buio d’Acqua', tipo: 'Insidia',
    flavor: 'Il lume regge. È il buio, qui sotto, che spinge.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, un passo nell’acqua nera — 1 danno.' },
  { art: 'artworks/Il passo sul vuoto.png', title: 'Il Passo sul Vuoto', tipo: 'Insidia',
    flavor: 'La passerella c’è. Poi, per un passo, non c’è.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/L’eco che chiama.png', title: 'L’Eco che Chiama', tipo: 'Insidia',
    flavor: 'Qualcuno, con la vostra voce, chiama il vostro nome. Da davanti.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/La pietra impara.png', title: 'La Pietra Impara', tipo: 'Crescendo',
    flavor: 'Il canto del bambino si ferma. Poi riprende — una nota più in basso.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’Accordatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/La pietra ripete.png', title: 'La Pietra Ripete', tipo: 'Crescendo',
    flavor: 'Le pareti provano la melodia da sole, a bocca chiusa.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’Accordatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/La pietra risponde.png', title: 'La Pietra Risponde', tipo: 'Crescendo',
    flavor: 'Bussate una volta. La pietra bussa due.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’Accordatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/L’acqua ferma.png', title: 'L’Acqua Ferma', tipo: 'Quiete',
    flavor: 'Per un momento, le cisterne sono solo cisterne: pietra, acqua e il vostro lume.',
    effect: 'Nessun effetto. Tirate il fiato — qualcosa, là sotto, lo sta trattenendo.' },
  { art: 'artworks/Una corrente d’aria buona.png', title: 'Una Corrente d’Aria Buona', tipo: 'Favore',
    flavor: 'Aria fredda e pulita, da una gola che non canta.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/L’acqua sale.png', title: 'L’Acqua Sale', tipo: 'Ostacolo',
    flavor: 'Nessuna pioggia, nessuna chiusa. Eppure sale — come un respiro preso.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il canto nelle orecchie.png', title: 'Il Canto nelle Orecchie', tipo: 'Insidia',
    flavor: 'La melodia vi entra da un orecchio. Non esce dall’altro.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal dolore.' },
  { art: 'artworks/La campana nuova.png', title: 'La Campana Nuova', tipo: 'Bivio',
    flavor: 'San Teodoro canta sopra Roccamora — giusta, piena, accordabile. E qualcosa, qui sotto, la sente.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’Accordatore si desta e da quel momento ogni Fase Minaccia pesca 1 carta in più (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 3/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP3_OGGETTI = [
  { art: 'artworks/Chiavi dei Chiusini.png', nome: 'Le Chiavi dei Chiusini', ref: 'E3-L1',
    fonte: 'Luogo 1 — Il Lavatoio Grande',
    flavor: 'Un anello di ferro con undici chiavi, e una dodicesima aggiunta dopo, più nuova.',
    effetto: 'Aprono i lucchetti daziari della corte dei pozzi murati — e certe porte si aprono solo per chi può aprire anche i coperchi.' },
  { art: 'artworks/Tappi di Cera.png', nome: 'I Tappi di Cera', ref: 'E3-L4',
    fonte: 'Luogo 4 — La Casa di Tobia',
    flavor: 'Modellati sulle orecchie di Tobia. «Il pozzo parla», diceva, «e chi ascolta troppo resta giù.»',
    effetto: '+1 alle prove NERVI contro suoni, echi e voci (vale nella Galleria delle Eco).' },
  { art: 'artworks/Lanterna a Specchio.png', nome: 'La Lanterna a Specchio', ref: 'E3-L4',
    fonte: 'Luogo 4 — La Casa di Tobia',
    flavor: 'La lanterna buona del pozzaiolo: uno specchio parabolico che butta la luce lontano.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/La Canna Muta.png', nome: 'La Canna Muta', ref: 'E3-L6',
    fonte: 'Luogo 6 — La Bottega del Lattoniere Bo',
    flavor: 'Sigillata, vuota, resa per difetto. L’unica canna del Borgo che non suonerà mai.',
    effetto: 'In spedizione: finché il gruppo la porta, nella Galleria delle Eco (T3) nessuna prova — il coro là sotto non vi «sente».' },
  { art: 'artworks/Rasoio d’Argento.png', nome: 'Il Rasoio d’Argento', ref: 'E3-L8',
    fonte: 'Luogo 8 — L’Ospedale della Carità',
    flavor: 'Trovato accanto al primo ammutolito. Il filo è intatto: non ha mai tagliato niente.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Campanello di Piero.png', nome: 'Il Campanello di Piero', ref: 'E3-L2',
    fonte: 'Luogo 2 — dal barbiere (o cercando in T5)',
    flavor: 'Argento consumato solo sul battente: suonato per anni, piano, come si parla a un malato.',
    effetto: 'Un’azione adiacente all’Accordatore: suonarlo — la voce vera, non quella rubata. Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione.' },
  { art: 'artworks/Lanterna da Minatore.png', nome: 'Una Lanterna da Minatore', ref: 'E3-T2',
    fonte: 'Si trova cercando in T2 — La Cisterna delle Colonne',
    flavor: 'Il vetro è integro e la fiamma sta dritta: laggiù è già qualcosa.',
    effetto: '+1 alle prove NERVI finché la porta chi l’ha trovata.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 3/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP3_NEMICI = [
  { art: 'artworks/L’Accordatore.png', title: 'L’Accordatore',
    type: 'Il Ladro di Voci (Boss) — Episodio 3',
    rules: '{i}Un grembiule da barbiere, un rasoio che non uccide, e una promessa: la voce del figlio, calata nei pozzi, da fissare con le voci degli altri. Combatte come lavora — con metodo, senza rabbia. E piange, mentre lo fa.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
  { art: 'artworks/La Voce Cava.png', title: 'La Voce Cava',
    type: 'Eco del Coro — Episodio 3',
    rules: '{i}Quello che resta quando una voce rubata scappa dalla sua canna: aria ed eco a forma d’uomo, che cammina perché ricorda di aver camminato. Attenti a spegnerla: tutta la voce che tratteneva esce in una volta sola.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
].map((n) => ({ ...n, file: `Episodio 3/Nemici/${n.title.replace(/’/g, "'")}` }));

const EP3 = [...LUOGHI3, ...EP3_INDIZI, ...EP3_TESTIMONI, ...EP3_REFERTI,
             ...EP3_MINACCE, ...EP3_OGGETTI, ...EP3_NEMICI];


// ============================================================ EPISODIO 4
// «Il teatro dell'eco» — vedi DESIGN-EPISODIO-4.md. Stesso schema dell'Ep. 3.

const LUOGHI4 = [
  { n: 1, nome: 'Il Palcoscenico del Comunale', req: 'Disponibile dall’inizio',
    art: 'artworks/Palcoscenico del Comunale.png',
    testo: 'A sipario chiuso il palcoscenico finge di dormire: le quinte respirano agli spifferi, la conchiglia curva sul proscenio come l’interno di un liuto — e manca un pannello, in mezzo, come un dente. Dalla buca del suggeritore, ogni tanto, un fruscio di pagine. Nessuno, là sotto, dovrebbe sfogliare.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani del concertatore',
        testo: 'Il maestro Alboni prova l’orchestra guardando il SOFFITTO: dirige i pannelli, non i violini. E sui polsini, dove un direttore porta il gesso delle bacchette, lui porta ditate di cera nera. Un concertatore accorda musicisti. Questo sta accordando la sala.' },
      { tipo: 'Presagio', soggetto: 'La buca che respira',
        testo: 'Dalla buca del suggeritore sale un fiato regolare, come una platea che dorme: si vede una fossa di legno sotto il palco, un contrappeso fermo, e due uomini legati che respirano piano — vivi, e sorvegliati da qualcosa che non ha fretta. La visione dura un rintocco.' },
    ] },
  { n: 2, nome: 'Il Camerino della Vetri', req: 'Disponibile dall’inizio',
    art: 'artworks/Camerino della Vetri.png',
    testo: 'Cipria, gelsomino, telegrammi nella cornice dello specchio. La diva siede dritta come in scena anche quando è sola — e guarda la pila degli spartiti anonimi come si guarda una lettera di minacce scritta in bella calligrafia.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'La Vetri',
        testo: '«Alboni mi corregge il respiro come si accorda un mobile: mezzo grado di petto in qua, il mento in là. L’altra sera ho steccato l’acuto e l’ho visto piangere — non di rabbia: di paura. Un uomo che ha paura dei MIEI errori sta rispondendo a qualcuno dei suoi.»' },
    ] },
  { n: 3, nome: 'Il Loggione', req: 'Apre col pubblico, alle 20:00',
    art: 'artworks/Il Loggione.png',
    testo: 'Panche lucide, ringhiera di ferro e l’acustica migliore della sala: i soldi stanno sotto, le orecchie stanno sopra. La claque senza Rocco è un’orchestra senza direttore — battibecchi, lutto e vino. E da quassù, da settimane, qualcuno guarda giù molto più di quanto applauda.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il secondo della claque',
        testo: '«Le sere di prova a porte chiuse ci pagava il maestro Alboni in persona: battimani a tempo, mezz’ora, sipario chiuso. “Coprite i lavori”, diceva. Che lavori si fanno in un teatro vuoto, con le candele nere e il sipario giù? Rocco è andato a vedere. Ecco che lavori.»' },
    ] },
  { n: 4, nome: 'Il Caffè dei Cantanti', req: 'Disponibile dall’inizio',
    art: 'artworks/Caffè dei Cantanti.png',
    testo: 'Specchi dorati, caricature dei divi, il pianoforte scordato che nessuno suona. Il Caffè vive degli orari del teatro — pieno alle sei, vuoto alle otto, pieno a mezzanotte — e qui il Comunale parla di sé senza il sipario: i segreti passano col vassoio, un bicchiere alla volta.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il copista',
        testo: '«L’originale scottava, ve lo giuro: carta vecchia, righi a mano, e una piega sola, da busta elegante. Me lo riprese un fattorino coi guanti prima che finissi il caffè. Il compenso? Anticipato, in contanti nuovi. Chi paga così non ama la musica: la COMPRA.»' },
    ] },
  { n: 5, nome: 'Il Sottopalco delle Macchine',
    req: 'La porta di servizio è sprangata dal capomacchinista: «giù non si scende, ordine della direzione». Ma il suo sguardo corre alla fossa in fondo — e chi sa chiamare le cose col loro nome, di là dentro, passa.',
    art: 'artworks/Sottopalco delle Macchine.png',
    testo: 'Travi catramate, funi che salgono nel buio come sartie, sabbia nei sacchi. I pannelli della conchiglia stanno in fila contro il muro come pale d’altare in restauro. In fondo, la fossa del contrappeso morto: una botola di buio che il capomacchinista non guarda mai — e ingrassata di fresco, luccica.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il registro delle macchine',
        testo: 'Le movimentazioni notturne del contrappeso morto sollevano sempre lo stesso peso: ottanta chili, poi centosessanta. Ottanta chili è un uomo. Centosessanta sono due. Il contrappeso morto non è un argano, adesso: è un montacarichi per prigionieri.' },
    ] },
  { n: 6, nome: 'Casa del Maestro Alboni',
    req: 'La governante non apre: «il maestro prova e non riceve». Dalla finestra, sempre la stessa frase al pianoforte — chi la riconosce e la nomina, in questa casa, è del mestiere.',
    art: 'artworks/Casa del Maestro Alboni.png',
    testo: 'Una casa tutta studio: il mezza coda, le partiture in pile geometriche, il metronomo fermo. È la casa di un uomo ordinato che non dorme — le candele consumate fino al piattino, e sul leggio sempre la stessa aria, aperta alla stessa pagina, con quattro battute cerchiate in rosso.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'I conti di Alboni',
        testo: 'I debiti saldati fanno una cifra tonda spaventosa — e le ricevute sono in ordine di data, legate col nastro, come si tengono le prove di un ricatto CONTRO SE STESSI. Alboni sa di aver venduto qualcosa. Le tiene per ricordarsi il prezzo.' },
    ] },
  { n: 7, nome: 'L’Archivio degli Spartiti',
    req: 'L’archivista, tra le scaffalature, non alza gli occhi: «qui si entra per consultare, non per curiosare. Ditemi COSA cercate — col suo nome di catalogo — o tornate al foyer.»',
    art: 'artworks/Archivio degli Spartiti.png',
    testo: 'Una chiesa di carta: scaffali fino al soffitto, spartiti rilegati in tela, l’odore buono della colla vecchia. Nel fondo Gaspare — quarant’anni di servizio in tre scatole — c’è un vuoto a forma di libretto, e all’archivista quel vuoto brucia più di un furto.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La carta degli spartiti',
        testo: 'Sotto la lente, l’inchiostro degli spartiti anonimi è impastato con polvere di cera nera: la pagina non è scritta per essere letta — è scritta per TRATTENERE. Chi la canta, la nutre. Dodici copie in città: dodici piccole reti da voce, in attesa della retata grande.' },
    ] },
  { n: 8, nome: 'Il Palco Reale e l’Amministrazione',
    req: 'Il segretario del ridotto è cortesia pura e porte chiuse: «l’amministrazione riceve su appuntamento». Ma un passe-partout di scena, in questo teatro, apre anche le cortesie.',
    art: 'artworks/Palco Reale.png',
    testo: 'Il teatro dei ricchi: specchi, stucchi, il registro dei palchi rilegato in rosso. Il palco 13 è in fondo al corridoio di velluto: la porta è come le altre, ma la maniglia non ha ditate — e dentro, l’aria ferma di vent’anni disegna nella polvere il contorno di un binocolo mai alzato.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il palco tredici',
        testo: 'Dal 13 non si vede bene il palcoscenico: l’angolo è mediocre, mezzo proscenio è tagliato. Ma la CONCHIGLIA, da lì, si vede tutta — ogni pannello, ogni giuntura. Non è un palco per guardare lo spettacolo: è un palco per sorvegliare uno strumento.' },
    ] },
  { n: 9, nome: 'Il Laboratorio degli Scenografi',
    req: 'Il capo scenografo difende il suo capannone come un forte: «qui si lavora per sabato, fuori i curiosi». Solo chi nomina il materiale giusto — quello che non dovrebbe esserci — lo fa impallidire e aprire.',
    art: 'artworks/Laboratorio degli Scenografi.png',
    testo: 'Un duomo di tela e trementina: fondali stesi come vele, impalcature, cieli a metà. In fondo, dove la luce non arriva, il legname vecchio del restauro dorme sotto i teli — quercia scura, stagionata d’acqua — e chi ci passa accanto abbassa la voce senza sapere perché.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'I legni marchiati',
        testo: 'Toccare le assi basta: si vede una chiesa spogliata, un organo murato che respira dietro i mattoni, e casse di legname che partono su un carro, vent’anni fa, verso il teatro. I legni non furono venduti: furono AFFIDATI. E ciò che è affidato, un giorno, si viene a riprendere. La visione dura un rintocco.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 4/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP4_INDIZI = LUOGHI4.flatMap((L) => {
  const righe = L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio');
  if (!righe.length) return [];
  const sogg = righe[0].soggetto;
  return [{
    art: L.art, n: L.n, kind: 'Indizio',
    title: `Indizio Nascosto — ${sogg}`,
    file: `Episodio 4/Indizi/${sogg.replace(/’/g, "'")}`,
    type: 'Osservazione / Presagio',
    rules: `{i}${righe.map((a) => `◆ (${a.tipo}) ${a.testo}`).join('\n')}{/i}`,
  }];
});

const EP4_TESTIMONI = LUOGHI4.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 4/Testimoni/${a.soggetto}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP4_REFERTI = LUOGHI4.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 4/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo Minaccia dell'episodio: 21 carte + 1 del Bivio («La melodia
// impressa», solo ramo "restituite" dell'Ep. 3). Mix: 11 spawn, 3 insidie,
// 3 crescendo, 4 eventi.
const EP4_MINACCE = [
  { art: 'artworks/La Claque.png', title: 'Il Battimani', tipo: 'Posseduto',
    flavor: 'Un applauso a tempo, da nessuna platea. Vi cerca il ritmo del cuore.',
    effect: 'Piazzate 1 Claque sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Claque.png', title: 'L’Applauso a Comando', tipo: 'Posseduto',
    flavor: 'Qualcuno, di sopra, ha abbassato la mano. Qualcosa, quaggiù, ha obbedito.',
    effect: 'Piazzate 1 Claque sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Claque.png', title: 'Il Tempo Battuto', tipo: 'Posseduto',
    flavor: 'Due mani sole. Poi quattro. Poi il buio intero, a tempo.',
    effect: 'Piazzate 1 Claque sull’uscita più vicina agli eroi della tessera corrente. Se è già in gioco una Claque, si attiva subito.' },
  { art: 'artworks/I facchini del carico.png', title: 'I Facchini del Carico', tipo: 'Posseduto',
    flavor: 'Casse in spalla, passo sicuro: conoscono il sottopalco meglio dei macchinisti.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Quinta di Carico (T1).' },
  { art: 'artworks/I facchini del carico.png', title: 'Le Casse di Candele', tipo: 'Posseduto',
    flavor: 'Cera nera, imballata come argenteria. Il carico non deve aspettare.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Quinta di Carico (T1).' },
  { art: 'artworks/I facchini del carico.png', title: 'Il Ritiro delle Lastre', tipo: 'Posseduto',
    flavor: 'Vengono per le lastre incise. Le voci di prova non devono restare qui.',
    effect: 'Piazzate 1 Adepto sull’ingresso dell’Officina della Conchiglia (T6). Se T6 non è rivelata: sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Le maschere di sala.png', title: 'Le Maschere di Sala', tipo: 'Malavita',
    flavor: 'Divisa del teatro, paga di qualcun altro. Controllano i biglietti che non esistono.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Le maschere di sala.png', title: 'Il Giro delle Poltrone', tipo: 'Malavita',
    flavor: 'La ronda scende dal foyer, lampada schermata e passo felpato.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Le maschere di sala.png', title: 'Il Servizio d’Ordine', tipo: 'Malavita',
    flavor: 'Uno solo, in frac. Non chiede il biglietto: chiede il nome.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Passi in platea.png', title: 'Passi in Platea', tipo: 'Posseduto',
    flavor: 'Sopra le vostre teste, tra una fila e l’altra, qualcuno cammina verso il palco.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Quinta di Carico (T1).' },
  { art: 'artworks/Passi in platea.png', title: 'La Porta della Platea', tipo: 'Posseduto',
    flavor: 'Uno spiffero di applausi: la porta di sala si è aperta, e richiusa.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Quinta di Carico (T1).' },
  { art: 'artworks/Il buio di quinta.png', title: 'Il Buio di Quinta', tipo: 'Insidia',
    flavor: 'Tra due fondali il buio è totale — e ha la forma delle cose dipinte.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, un passo nel vuoto tra le scene — 1 danno.' },
  { art: 'artworks/L’applauso che copre.png', title: 'L’Applauso che Copre', tipo: 'Insidia',
    flavor: 'Ottocento paia di mani. Sotto quell’onda, nessuno sente nessuno.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il contrappeso che chiama.png', title: 'Il Contrappeso che Chiama', tipo: 'Insidia',
    flavor: 'Un fischio di canapa. Qualcosa piomba dove un attimo fa non c’era niente.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/L’ouverture.png', title: 'L’Ouverture', tipo: 'Crescendo',
    flavor: 'Il programma di sala avanza. L’orchestra accorda il respiro della serata.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’aria comincia e il Suggeritore si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il secondo atto.png', title: 'Il Secondo Atto', tipo: 'Crescendo',
    flavor: 'Applausi, sipario, applausi. Il momento si avvicina una scena alla volta.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’aria comincia e il Suggeritore si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/L’aria si avvicina.png', title: 'L’Aria si Avvicina', tipo: 'Crescendo',
    flavor: 'La Vetri è in quinta. La conchiglia, sopra di voi, trattiene il fiato.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’aria comincia e il Suggeritore si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il cambio scena.png', title: 'Il Cambio Scena', tipo: 'Quiete',
    flavor: 'Di sopra si cambia quadro: buio in sala, macchine ferme, un minuto di niente.',
    effect: 'Nessun effetto. Tirate il fiato — il teatro sta trattenendo il suo.' },
  { art: 'artworks/Uno spiraglio di sipario.png', title: 'Uno Spiraglio di Sipario', tipo: 'Favore',
    flavor: 'Una lama di luce dorata taglia il sottopalco: per un attimo si vede TUTTO.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Le funi calate.png', title: 'Le Funi Calate', tipo: 'Ostacolo',
    flavor: 'Un cambio di scena cala un bosco di funi dove prima c’era un corridoio.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/L’acuto.png', title: 'L’Acuto', tipo: 'Insidia',
    flavor: 'Un acuto di prova trafigge le assi. I pannelli lo bevono. Voi no.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal dolore.' },
  { art: 'artworks/La melodia impressa.png', title: 'La Melodia Impressa', tipo: 'Bivio',
    flavor: 'Le voci guarite del Borgo la canticchiano nel sonno. I legni la riconoscono.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: l’aria comincia e il Suggeritore si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 4/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP4_OGGETTI = [
  { art: 'artworks/Passe-partout di Scena.png', nome: 'Il Passe-partout di Scena', ref: 'E4-L2',
    fonte: 'Luogo 2 — Il Camerino della Vetri',
    flavor: 'Apre ogni porta del teatro. La diva ha cominciato ad averne paura.',
    effetto: 'Apre il ridotto e l’amministrazione (Luogo 8) — e certe porte del teatro, in spedizione, si aprono senza prova.' },
  { art: 'artworks/Pianta delle Macchine.png', nome: 'La Pianta delle Macchine', ref: 'E4-L5',
    fonte: 'Luogo 5 — Il Sottopalco delle Macchine',
    flavor: 'Ogni argano, ogni leva, ogni botola. E una fossa cancellata a matita.',
    effetto: 'Nella Sala dei Contrappesi (T3) nessuna prova: sapete dove NON stare. E +1 alle prove Interagire con argani e leve.' },
  { art: 'artworks/Chiave del Tagliafuoco.png', nome: 'La Chiave del Tagliafuoco', ref: 'E4-L5',
    fonte: 'Luogo 5 — Il Sottopalco delle Macchine',
    flavor: 'La chiave del sipario di ferro: pesante, drammatica, definitiva.',
    effetto: 'Effetto: nessuno finora scoperto. (Il tagliafuoco è bloccato dalla ruggine da vent’anni.)' },
  { art: 'artworks/Libretto di Gaspare.png', nome: 'Il Libretto di Gaspare', ref: 'E4-L7',
    fonte: 'Luogo 7 — L’Archivio degli Spartiti',
    flavor: 'Quarant’anni di recite, consumate dal pollice. La voce vera della buca.',
    effetto: 'Un’azione adiacente al Suggeritore: l’eco riconosce la voce vera del suo posto — Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione.' },
  { art: 'artworks/Binocolo della Contessa.png', nome: 'Il Binocolo della Contessa', ref: 'E4-L8',
    fonte: 'Luogo 8 — Il Palco Reale',
    flavor: 'Madreperla e ottone, mai messo a fuoco in vent’anni.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Maschera della Prima Stagione.png', nome: 'La Maschera della Prima Stagione', ref: 'E4-L9',
    fonte: 'Luogo 9 — Il Laboratorio degli Scenografi (o cercando in T4)',
    flavor: 'Dorata, bellissima, inquietante. La tengono per scaramanzia.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lanterna Cieca.png', nome: 'Una Lanterna Cieca', ref: 'E4-T2',
    fonte: 'Si trova cercando in T2 — Il Magazzino delle Scene',
    flavor: 'Lo sportello schermato del trovarobe: la luce solo dove serve.',
    effetto: '+1 alle prove NERVI finché la porta chi l’ha trovata.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 4/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP4_NEMICI = [
  { art: 'artworks/Il Suggeritore.png', title: 'Il Suggeritore',
    type: 'Eco della Buca (Boss) — Episodio 4',
    rules: '{i}Quarant’anni di battute sussurrate lasciano un solco — e il solco, quando la conchiglia ha cominciato a ricordare, si è riempito: una gobba, un bisbiglio, pagine che frusciano senza mani. Non è Gaspare: è il POSTO di Gaspare.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
  { art: 'artworks/La Claque.png', title: 'La Claque',
    type: 'Applauso del Coro — Episodio 4',
    rules: '{i}Pagati per applaudire a tempo, poi pagati per non chiedersi cosa coprisse l’applauso. Ora battono le mani anche quando non c’è nessuno a sentirli — un ritmo cavo che entra nel petto e sfratta i pensieri.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
].map((n) => ({ ...n, file: `Episodio 4/Nemici/${n.title}` }));

const EP4 = [...LUOGHI4, ...EP4_INDIZI, ...EP4_TESTIMONI, ...EP4_REFERTI,
             ...EP4_MINACCE, ...EP4_OGGETTI, ...EP4_NEMICI];


module.exports = {
  HEROES, NEMICI, MINACCE, LUOGHI, INDIZI, TESTIMONI, REFERTI, OGGETTI, PRELUDIO,
  PRELUDIO_LUOGHI, PRELUDIO_APPROFONDIMENTI, PRELUDIO_OGGETTI,
  EP2, LUOGHI2, EP2_INDIZI, EP2_TESTIMONI, EP2_REFERTI, EP2_MINACCE, EP2_OGGETTI, EP2_NEMICI,
  EP3, LUOGHI3, EP3_INDIZI, EP3_TESTIMONI, EP3_REFERTI, EP3_MINACCE, EP3_OGGETTI, EP3_NEMICI,
  EP4, LUOGHI4, EP4_INDIZI, EP4_TESTIMONI, EP4_REFERTI, EP4_MINACCE, EP4_OGGETTI, EP4_NEMICI,
  ALL: [...HEROES, ...NEMICI, ...MINACCE, ...LUOGHI, ...INDIZI, ...TESTIMONI, ...REFERTI, ...OGGETTI, ...PRELUDIO, ...EP2, ...EP3, ...EP4],
};
