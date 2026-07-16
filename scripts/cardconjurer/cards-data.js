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
// carta prendere per quale luogo sta nel PDF pdf/Episodio 1/Luoghi.pdf
// (src/gen_narrator.py), mai sulla carta stessa.
// Niente nomi eroe qui: chi sblocca cosa dipende dal roster (cambia nel tempo,
// e il jolly di Sibilla copre comunque qualunque tipo) - vive SOLO nel
// Regolamento e in pdf/Episodio N/Luoghi.pdf, mai su una carta.

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


module.exports = {
  HEROES, NEMICI, MINACCE, LUOGHI, INDIZI, TESTIMONI, REFERTI, OGGETTI, PRELUDIO,
  PRELUDIO_LUOGHI, PRELUDIO_APPROFONDIMENTI, PRELUDIO_OGGETTI,
  EP2, LUOGHI2, EP2_INDIZI, EP2_TESTIMONI, EP2_REFERTI, EP2_MINACCE, EP2_OGGETTI, EP2_NEMICI,
  ALL: [...HEROES, ...NEMICI, ...MINACCE, ...LUOGHI, ...INDIZI, ...TESTIMONI, ...REFERTI, ...OGGETTI, ...PRELUDIO, ...EP2],
};
