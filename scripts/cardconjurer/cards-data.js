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

// Una carta per OGNI Osservazione/Presagio (L1 ne ha due: il flatMap a
// carta unica lasciava il secondo soggetto senza carta).
const EP4_INDIZI = LUOGHI4.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 4/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

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


// ============================================================ EPISODIO 5
// «L'organo di ossa» — vedi DESIGN-EPISODIO-5.md. Stesso schema dell'Ep. 4.

const LUOGHI5 = [
  { n: 1, nome: 'La Chiesa dei Battuti', req: 'Disponibile dall’inizio',
    art: 'artworks/Chiesa dei Battuti.png',
    testo: 'Il magazzino comunale abita la chiesa come un ospite maleducato: scaffali su per le navate, casse dove stavano i banchi. Ma la chiesa, sotto, non ha traslocato — e davanti alla parete di fondo, dove la calcina è fresca, l’aria sa di cera che nessuno ha acceso.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani del becchino',
        testo: 'Al funerale lampo di Fedele, il becchino-capo lavora di pala con le maniche lunghe, d’estate. Quando le rimbocca per un attimo, i polsi sono segnati di bianco: non calce da fossa — polvere d’ossa. Un becchino la conosce. E la lava, di solito.' },
      { tipo: 'Presagio', soggetto: 'La salmodia sotto',
        testo: 'Con l’orecchio alla breccia rimurata: un canto piano, senza parole, che non si ferma MAI — e si vede un corridoio di nicchie dove le ossa nei muri rispondono al canto, una per una. Chi passerà di lì, tacendo e in fretta, passerà meglio. La visione dura un rintocco.' },
    ] },
  { n: 2, nome: 'L’Ossario Comunale', req: 'Disponibile dall’inizio',
    art: 'artworks/Ossario Comunale.png',
    testo: 'Una biblioteca di casse: corridoi di scaffali fino al soffitto, etichette di tre generazioni di custodi, l’odore asciutto della polvere buona. Dove mancano le casse, gli scaffali mostrano rettangoli puliti — ventidue denti caduti nel sorriso ordinato dei morti.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Le casse marcate',
        testo: 'Il segno d’onda sulle casse mancanti non è del falegname: è inciso DOPO, con una sgorbia, sempre dalla stessa mano. Qualcuno ha censito l’ossario prima di svuotarlo — cassa per cassa, negli anni. Il furto è l’ultimo atto di un inventario cominciato molto tempo fa.' },
    ] },
  { n: 3, nome: 'Il Cimitero Nuovo', req: 'Disponibile dall’inizio',
    art: 'artworks/Cimitero Nuovo.png',
    testo: 'Cipressi adulti, ghiaia rastrellata, la piccola città dei morti che cresce per file ordinate. Le transenne delle fosse «in manutenzione» sono l’unica cosa fuori posto — quelle, e il cancello di servizio con l’erba consumata da ruote che di giorno nessuno vede mai. I carri notturni finiscono il carico verso le 21:00: dopo, le lapidi con l’onda non ci sono più (il luogo resta visitabile).',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'L’inserviente sputasentenze',
        testo: '«Mola una volta scavava e basta. Da quest’inverno misura: va per file coi passi contati e un taccuino, come un agrimensore. E quando ha finito di misurare, la settimana dopo, la fossa è “in manutenzione”. Io non so leggere, signori. Ma so contare: ventidue.»' },
    ] },
  { n: 4, nome: 'La Parrocchia del Borgo', req: 'Disponibile dall’inizio',
    art: 'artworks/Parrocchia del Borgo.png',
    testo: 'La stessa dell’inverno dei pozzi: banchi lucidi di cera, l’organo piccolo con la canna storta. Ma stavolta vi aspettano: la porta della sacrestia è aperta, e sul tavolo c’è un telo ripiegato di fresco, come per mostrare qualcosa che aspettava da centocinquant’anni.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'Il fonte che trattiene',
        testo: 'L’acqua nell’ampolla è ferma da centocinquant’anni, eppure — contro luce — trema: si vede un saio inginocchiato a un fonte, un bambino che piange al battesimo, e lo stesso saio, molto dopo, che canta in un buio pieno di nicchie senza fermarsi mai. La visione dura un rintocco.' },
    ] },
  { n: 5, nome: 'La Casa del Becchino',
    req: 'La moglie di Mola non apre a nessuno: «mio marito lavora, i morti non aspettano». Ma chi arriva sapendo COME viene pagato Mola trova la porta socchiusa e la moglie in lacrime.',
    art: 'artworks/Casa del Becchino.png',
    testo: 'La casa di un becchino con la credenza nuova, la stufa nuova, le scarpe buone per tutti i figli: tre stipendi in sei mesi, tutti in contanti mai piegati. Ogni cosa comprata è un mattone di un muro che non tiene — e la moglie spolvera tutto due volte al giorno, come si tiene pulita una colpa.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Mola, alla fine',
        testo: '«Io le ossa le SCAVO, signori. Non chiedo per chi suonano. Il maestro dei registri paga, il timbro è vero, la carta è vera — se la carta è vera, il peccato è di chi la scrive. Ditemi che è così. Vi prego: ditemi che è così.»' },
    ] },
  { n: 6, nome: 'Lo Studio del Maestro dei Registri',
    req: 'Uno studio di contabilità senza clienti: il praticante ripete «il titolare è fuori per inventari». Solo chi nomina il titolare col suo TITOLO giusto viene fatto entrare ad aspettare — in una stanza che parla.',
    art: 'artworks/Studio del Maestro.png',
    testo: 'Lo studio è una scenografia: registri finti in bella vista, polvere vera sui calamai. Ma le sedie d’attesa sono consumate davvero, e il campanello della porta è unto e silenzioso: qui la gente entra, aspetta, paga — e non viene per la contabilità.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Lo studio-scenografia',
        testo: 'I registri finti hanno i dorsi scoloriti DAL LATO SBAGLIATO: comprati usati, messi in scena in fretta. Ma le sedie d’attesa sono consumate davvero: qui la gente viene, aspetta, e paga. Uno studio che non lavora e incassa non è uno studio: è uno sportello. Di qualcosa.' },
    ] },
  { n: 7, nome: 'L’Ufficio delle Sconsacrazioni',
    req: 'Il cancelliere di Curia è cortesia e diffidenza: «gli archivi diocesani non sono un pubblico passeggio». Ma un fascicolo preciso, chiesto con l’anno preciso, è un atto dovuto.',
    art: 'artworks/La Curia.png',
    testo: 'Tre stanze in fondo alla Curia: armadi blindati d’archivio, il cancelliere che conosce ogni fascicolo per nome, l’odore di ceralacca e di secoli. Qui la Chiesa registra ciò che smette di essere sacro — con una cura che somiglia al rimorso.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il timbro prestato',
        testo: 'L’impronta del timbro è perfetta ma STANCA: cuscinetto quasi asciutto, impronta ribattuta. Chi timbra così non lavora in Curia: timbra di fretta, altrove, con un timbro che deve RIENTRARE prima che qualcuno ne senta la mancanza. Il prestito dura una notte. Da vent’anni, quando serve.' },
    ] },
  { n: 8, nome: 'Il Deposito del Marmista',
    req: 'Il marmista lavora e non alza gli occhi: «i preventivi il giovedì». Ma chi entra nominando il lavoro che lo imbarazza — quello delle lapidi — trova un uomo con una gran voglia di scaricarsi la coscienza.',
    art: 'artworks/Deposito del Marmista.png',
    testo: 'Un giardino di pietre in attesa: lapidi bianche per file, angeli a metà, nomi già incisi di gente ancora viva che paga in anticipo. E in fondo, girate contro il muro, le pietre di cui il marmista si vergogna.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le ultime due lapidi',
        testo: 'Le due lapidi pronte hanno le date di consegna a matita sul retro, come usa il marmista: dopodomani. Chiunque paghi verrà a ritirarle — o manderà il garzone — dopodomani. Un appuntamento, scolpito nel marmo da chi non sa di averlo dato.' },
    ] },
  { n: 9, nome: 'La Sagrestia dei Battuti',
    req: 'La porticina della sagrestia vecchia è serrata da una toppa nera di flagelli incrociati: senza la chiave giusta resta un muro — e il sagrato, di notte, non gradisce chi forza le porte dei morti.',
    art: 'artworks/Sagrestia dei Battuti.png',
    testo: 'La sagrestia vecchia è rimasta al Quarantuno: paramenti neri appesi, un inginocchiatoio, la polvere come neve. Sul tavolo, però, impronte fresche — e sotto l’armadio dei paramenti, trascinato di lato, il pavimento mostra una botola col flagello inciso.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'I cardini unti',
        testo: 'Il sego sui cardini è steso con metodo, dall’alto verso il basso, SENZA sbavature: la mano di chi apre questa botola non ha mai fretta e non ha mai paura. Voi avrete entrambe. Regolatevi sulle candele: là sotto le vostre saranno le uniche a tremare.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 5/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP5_INDIZI = LUOGHI5.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 5/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP5_TESTIMONI = LUOGHI5.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 5/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP5_REFERTI = LUOGHI5.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 5/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo Minaccia: 21 carte + 1 del Bivio («I legni chiamano», ramo
// "sigillata" dell'Ep. 4). Mix: 11 spawn, 3 insidie, 3 crescendo, 4 eventi.
const EP5_MINACCE = [
  { art: 'artworks/Il passo di cera.png', title: 'Il Passo di Cera', tipo: 'Posseduto',
    flavor: 'Due passi, mai di corsa. La cera non ricorda la paura.',
    effect: 'Piazzate 1 Confratello sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il passo di cera.png', title: 'La Processione', tipo: 'Posseduto',
    flavor: 'Vengono in fila, come andavano in chiesa. Ci vanno ancora.',
    effect: 'Piazzate 1 Confratello sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il passo di cera.png', title: 'Il Capitolo si Alza', tipo: 'Posseduto',
    flavor: 'I sedili di pietra restituiscono i loro occupanti, uno alla volta.',
    effect: 'Piazzate 1 Confratello sull’uscita più vicina agli eroi della tessera corrente. Se è già in gioco un Confratello, si attiva subito.' },
  { art: 'artworks/I manovali del cantiere.png', title: 'I Manovali del Cantiere', tipo: 'Posseduto',
    flavor: 'Sanno segare, incollare, montare. Non sanno più perché.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala del Sagrato (T1).' },
  { art: 'artworks/I manovali del cantiere.png', title: 'Il Turno di Notte', tipo: 'Posseduto',
    flavor: 'Il cantiere non chiude mai: la marea non aspetta.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala del Sagrato (T1).' },
  { art: 'artworks/I manovali del cantiere.png', title: 'La Calata delle Casse', tipo: 'Posseduto',
    flavor: 'Un’altra cassa scende dalla botola, piano, con rispetto. Il rispetto dei ladri.',
    effect: 'Piazzate 1 Adepto sull’ingresso dell’Officina delle Canne d’Ossa (T5). Se T5 non è rivelata: sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/I carrettieri.png', title: 'I Carrettieri', tipo: 'Malavita',
    flavor: 'Pagati per portare e non guardare. Guardano solo voi.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/I carrettieri.png', title: 'Il Carro Vuoto', tipo: 'Malavita',
    flavor: 'Un carro che torna vuoto ha sempre due uomini di troppo.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/I carrettieri.png', title: 'Il Sorvegliante del Sagrato', tipo: 'Malavita',
    flavor: 'Uno solo, fermo tra i cipressi, da prima che arrivaste.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Passi sulla scala.png', title: 'Passi sulla Scala', tipo: 'Posseduto',
    flavor: 'Qualcuno scende i gradini del sagrato. Con la calma di chi torna a casa.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala del Sagrato (T1).' },
  { art: 'artworks/Passi sulla scala.png', title: 'La Botola si Apre', tipo: 'Posseduto',
    flavor: 'Uno spiraglio di notte vera, lassù. Poi si richiude, con qualcuno in più quaggiù.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Scala del Sagrato (T1).' },
  { art: 'artworks/La salmodia nelle ossa.png', title: 'La Salmodia nelle Ossa', tipo: 'Insidia',
    flavor: 'Il canto passa dal muro alle vostre ossa. Le sentite rispondere.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il buio delle nicchie.png', title: 'Il Buio delle Nicchie', tipo: 'Insidia',
    flavor: 'Cento alloggi di buio perfetto, alla distanza giusta di un braccio.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La polvere di cripta.png', title: 'La Polvere di Cripta', tipo: 'Insidia',
    flavor: 'La polvere qui non è sporco: è qualcuno. Ed è ovunque.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/La prima canna.png', title: 'La Prima Canna', tipo: 'Crescendo',
    flavor: 'Una nota sola, bassa, perfetta. L’organo prova la voce nuova.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: il Salmodiante si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/L’accordatura.png', title: 'L’Accordatura', tipo: 'Crescendo',
    flavor: 'Le canne d’ossa si rispondono per quinte. Qualcuno, un tempo, cantava così in coro.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: il Salmodiante si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il registro pieno.png', title: 'Il Registro Pieno', tipo: 'Crescendo',
    flavor: 'Il mantice si gonfia da solo. Lo strumento è quasi pronto — e lo sa.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: il Salmodiante si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/La salmodia tace.png', title: 'La Salmodia Tace', tipo: 'Quiete',
    flavor: 'Per la prima volta in centocinquant’anni: silenzio. È peggio.',
    effect: 'Nessun effetto. Tirate il fiato — e chiedetevi perché ha smesso.' },
  { art: 'artworks/Uno spiffero di sagrato.png', title: 'Uno Spiffero di Sagrato', tipo: 'Favore',
    flavor: 'Aria di sopra: erba, notte, pioggia lontana. La strada di casa esiste ancora.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Le impalcature.png', title: 'Le Impalcature', tipo: 'Ostacolo',
    flavor: 'Il cantiere invade il passaggio: assi, corde, pali. Ordinatissimi. Ovunque.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/La nota bassa.png', title: 'La Nota Bassa', tipo: 'Insidia',
    flavor: 'Sotto la soglia dell’udito, sopra la soglia del cuore. Fedele lo sapeva.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno.' },
  { art: 'artworks/I legni chiamano.png', title: 'I Legni Chiamano', tipo: 'Bivio',
    flavor: 'La melodia impressa nella conchiglia riconosce le ossa che cantarono con lei.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: il Salmodiante si desta (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 5/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP5_OGGETTI = [
  { art: 'artworks/Acqua del Fonte.png', nome: 'L’Acqua del Fonte', ref: 'E5-L4',
    fonte: 'Luogo 4 — La Parrocchia del Borgo',
    flavor: 'L’acqua dell’ultimo battesimo dei Battuti, sigillata a cera da cinque generazioni.',
    effetto: 'Un’azione adiacente al Salmodiante: l’unica voce più vecchia della sua — Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione.' },
  { art: 'artworks/Chiave del Sagrato.png', nome: 'La Chiave del Sagrato', ref: 'E5-L4',
    fonte: 'Luogo 4 — La Parrocchia del Borgo',
    flavor: 'Marcata coi flagelli incrociati. «Se la prendete, non ditemi per cosa.»',
    effetto: 'Apre la sagrestia vecchia dei Battuti (Luogo 9) — e la strada per la cripta.' },
  { art: 'artworks/Candele della Parrocchia.png', nome: 'Le Candele della Parrocchia', ref: 'E5-L4',
    fonte: 'Luogo 4 — La Parrocchia del Borgo',
    flavor: 'Benedette, oneste, di cera BIANCA. Laggiù farà la differenza.',
    effetto: '+1 alle prove NERVI nel Corridoio degli Ossari (T3), come da tessera.' },
  { art: 'artworks/Crocifisso Spezzato.png', nome: 'Il Crocifisso Spezzato', ref: 'E5-L1',
    fonte: 'Luogo 1 — tra le mani di Fedele',
    flavor: 'Piegato a mani nude, verso l’esterno. Da lui stesso.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Olio dei Morti.png', nome: 'L’Olio dei Morti', ref: 'E5-L5',
    fonte: 'Luogo 5 — La Casa del Becchino',
    flavor: 'Regalo «del committente, per il lavoro fino». Mai toccato.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lanterna d’Altare.png', nome: 'Una Lanterna d’Altare', ref: 'E5-T2',
    fonte: 'Si trova cercando in T2 — La Navata Sepolta',
    flavor: 'Ottone e vetro rubino: la luce giusta per una chiesa in apnea.',
    effetto: '+1 alle prove NERVI finché la porta chi l’ha trovata.' },
  { art: 'artworks/Scalpello da Liutaio.png', nome: 'Uno Scalpello da Liutaio', ref: 'E5-T5',
    fonte: 'Si trova cercando in T5 — L’Officina delle Canne d’Ossa',
    flavor: 'Manico d’osso, filo perfetto. Lo strumento del sacrilegio, restituito al mittente.',
    effetto: '+1 alle prove Interagire con le canne e con l’organo.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 5/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP5_NEMICI = [
  { art: 'artworks/Il Salmodiante.png', title: 'Il Salmodiante',
    type: 'Confratello del Quarantuno (Boss) — Episodio 5',
    rules: '{i}Quando murarono la cripta, uno dei confratelli non volle uscire: rimase a cantare l’ufficio dei morti per i fratelli senza requiem. La cera lo ha vestito, il canto lo ha conservato — finché la voce e l’uomo non sono diventati la stessa cosa.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
  { art: 'artworks/Il Confratello.png', title: 'Il Confratello',
    type: 'Cera e ossa del Coro — Episodio 5',
    rules: '{i}Sai vuoti riempiti di cera e d’ossa spaiate: camminano come in processione — due passi, mai di corsa — e non arretrano, perché la cera non ricorda la paura.{/i}{divider}Statistiche nel Bestiario dell’episodio.' },
].map((n) => ({ ...n, file: `Episodio 5/Nemici/${n.title}` }));

const EP5 = [...LUOGHI5, ...EP5_INDIZI, ...EP5_TESTIMONI, ...EP5_REFERTI,
             ...EP5_MINACCE, ...EP5_OGGETTI, ...EP5_NEMICI];


// ============================================================ EPISODIO 6
// «Il Terzo Movimento» — FINALE D'ATTO (vedi DESIGN-EPISODIO-6.md). Il
// mazzo-antologia riusa le arti delle famiglie di tutto l'atto.

const LUOGHI6 = [
  { n: 1, nome: 'La Cattedrale, la Sagrestia', req: 'Disponibile dall’inizio',
    art: 'artworks/nervous priest in a candlelit sacristy.png',
    testo: 'Don Callisto non finge più: «il pavimento della cripta RESPIRA, signori. E stanotte l’acqua benedetta trema nelle pile senza che nessuno la tocchi.» Sotto la sagrestia, un battito lento — sessanta colpi l’ora, come un cuore che dorme. Stanotte batte più forte.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani di don Callisto',
        testo: 'Il parroco versa il vino della messa e trema — ma non di paura generica: «da tre notti, alle tre e un quarto esatte, tutto ciò che è liquido in questa chiesa fa UN’ONDA. Una sola. Poi torna fermo.» Il liutaio prova l’orchestra: e l’acqua risponde già.' },
    ] },
  { n: 2, nome: 'Il Canale Basso', req: 'Disponibile dall’inizio',
    art: 'artworks/derelict warehouses over black still water.png',
    testo: 'L’acqua del canale è FERMA: né marea né corrente, come tesa. I barcaioli non escono. Tre notti di chiatte cariche verso il fianco della Cattedrale — e stanotte c’è la marea di sizigia, la grande. L’acqua, invece di prepararsi, trattiene.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il barcaiolo più vecchio',
        testo: '«Il liutaio l’ho portato IO, tre notti fa, alla porta d’acqua. Quando siamo passati sotto la Cattedrale ha appoggiato la mano sul fasciame, come si tasta la febbre a un figlio — e ha detto, piano: “ancora un movimento, e ti sveglio”. Non parlava con me.»' },
    ] },
  { n: 3, nome: 'Il Catasto delle Acque', req: 'Disponibile dall’inizio',
    art: 'artworks/Catasto delle Acque.png',
    testo: 'L’archivista vi riconosce, e stavolta la mappa la srotola lui: «le tre acque convergono QUI, sotto la Cattedrale. La sala non è su nessuna carta ufficiale. Ma le vene ci vanno tutte, come radici a un bulbo.»',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il bulbo delle vene',
        testo: 'Ricalcando le tre carte idrografiche, la camera appare da sola: un vuoto rotondo dove nessuna vena passa ATTRAVERSO — tutte si fermano al bordo, come radici che nutrono senza entrare. La città non è costruita sopra qualcosa. È costruita INTORNO.' },
    ] },
  { n: 4, nome: 'Il Palazzo del Lume', req: 'Disponibile dall’inizio',
    art: 'artworks/Palazzo del Lume.png',
    testo: 'Tutte le lampade accese, tutte le stanze. M. ha disposto sul tavolo grande l’archivio dei Frammenti: i vostri cinque casi, le buste dei Bivi, i cimeli. «Stanotte si spende tutto», dice. «Ogni pezzo conservato è un incrocio in più. Contateli.»',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'M., a porte chiuse',
        testo: '«Ferri è vivo. L’ho sempre saputo — un uomo così non annega: si CONSERVA, come i suoi strumenti. Stanotte vi sembrerà stanco e gentile. Non esitate per questo. Gli uomini stanchi e gentili sono quelli che hanno già deciso tutto.»' },
    ] },
  { n: 5, nome: 'La Bottega di Ferri, riaperta',
    req: 'I sigilli della Gendarmeria pendono tagliati: qualcuno è entrato con la calma di chi torna a casa. Il vicinato parla solo con chi dimostra di sapere COSA torna, con la marea giusta.',
    art: 'artworks/abandoned luthier workshop.png',
    testo: 'La bottega del vostro primo caso, riaperta da dentro: polvere smossa a isole, i vuoti sugli attrezzi che raccontano cosa è partito. E sul banco, in evidenza, l’astuccio del diapason d’argento: aperto, e vuoto.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il banco del liutaio',
        testo: 'Gli strumenti rimasti sono in ordine perfetto, TRANNE l’astuccio del diapason: aperto e vuoto, al centro del banco. Non è una dimenticanza: è un messaggio. Ferri sa che verrete — e vi dice: “il LA giusto, stanotte, lo do io.”' },
    ] },
  { n: 6, nome: 'La Chiusa Grande',
    req: 'Il guardiano della chiusa non parla coi curiosi la notte di sizigia. Ma chi arriva nominando le acque col loro nome vero — tutte e tre — è del mestiere, o del destino.',
    art: 'artworks/La Chiusa Grande.png',
    testo: 'Una diga di lanterne: il guardiano regola le paratie della sizigia gridando numeri. A monte l’acqua preme; a valle, verso la città, il canale è liscio e nero come una lastra. «Non è mai stata così», ripete. «Mai.»',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Le tavole di marea',
        testo: 'Il colmo di sizigia dura undici minuti: dalle 3:15 alle 3:26. Qualunque cosa il rito debba fare con l’acqua, ha UNDICI MINUTI. E qualunque cosa dobbiate fare voi, conviene farla prima: l’acqua alta non fa sconti a chi sta nelle gallerie.' },
    ] },
  { n: 7, nome: 'L’Archivio Capitolare',
    req: 'Il canonico archivista apre solo a chi è mandato dal capitolo — o a chi ne nomina l’atto che il capitolo vorrebbe dimenticare. L’anno giusto, detto ad alta voce, qui dentro è una chiave.',
    art: 'artworks/Archivio Capitolare.png',
    testo: 'Una torre di carta sopra il chiostro: scale a chiocciola, armadi con le date dipinte. Gli atti del Quarantuno stanno nell’armadio più in alto — «le cose che non si vogliono rileggere si mettono dove costa fatica arrivare».',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La rubrica della Formula',
        testo: 'La pergamena è del Quarantuno, ma le pieghe recenti sono DUE: il fascicolo è stato consultato due volte negli ultimi mesi, e richiuso con cura d’archivista. Qualcuno ha letto la formula prima di voi. E non l’ha distrutta.' },
    ] },
  { n: 8, nome: 'Il Rifugio del Maestro dei Registri',
    req: 'Lo studio è svuotato e la corte tace. Ma il facchino del trasloco beve all’angolo, e con chi nomina il titolare — col suo titolo giusto — ricorda volentieri cosa è caduto dal carro.',
    art: 'artworks/Studio del Maestro.png',
    testo: 'Svuotato in una notte: chiodi nei muri, impronte di schedari sul pavimento. Chi è fuggito così non fugge dai gendarmi: fugge da un LAVORO FINITO. Dal carro è caduto uno schedario: «cripta».',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'L’impronta degli schedari',
        testo: 'Quattro impronte: fonderia, pozzi, teatro, cripta. Ma sotto la polvere di anni ce n’è una QUINTA — più stretta, portata via molto prima. Il Maestro dei Registri teneva un quinto conto, di cui nessuno sa niente. E lo custodiva meglio degli altri.' },
    ] },
  { n: 9, nome: 'L’Imbocco delle Tre Acque',
    req: 'Il cancello della porta d’acqua è chiuso a chiave dal guardiano della Chiusa: senza la sua chiave si può solo guardare, dall’altra riva, il buio che respira a filo d’acqua.',
    art: 'artworks/La Porta d’Acqua.png',
    testo: 'L’arco medievale nel fianco della Cattedrale, rimurato da un secolo e riaperto da un mese — conci numerati a gesso, lavoro da restauratori. Oltre l’arco, il buio respira. E sopra il battito di sempre, adesso, un ACCORDARSI.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'I conci numerati',
        testo: 'La numerazione a gesso non è di mano di muratore: è la calligrafia minuta di chi tiene registri. Il Maestro dei Registri ha DIRETTO la riapertura, concio per concio, come si smonta uno strumento prezioso. Tutto, in questo cantiere, è pensato per durare.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 6/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP6_INDIZI = LUOGHI6.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 6/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP6_TESTIMONI = LUOGHI6.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 6/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP6_REFERTI = LUOGHI6.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 6/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Il mazzo-antologia: 21 carte + 1 del Bivio. Le arti riusano le famiglie
// dell'atto (payoff visivo: la campagna intera torna nel mazzo finale).
const EP6_MINACCE = [
  { art: 'artworks/Il ritiro.png', title: 'Il Pellegrinaggio', tipo: 'Posseduto',
    flavor: 'Vengono da ogni caso che avete chiuso. Stanotte nessuno vuole mancare.',
    effect: 'Piazzate 1 Adepto sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il ritiro.png', title: 'La Barca delle Due e Mezza', tipo: 'Posseduto',
    flavor: 'Puntuale come una paga tripla. L’ultimo viaggio è il più pieno.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Porta d’Acqua (T1).' },
  { art: 'artworks/Il ritiro.png', title: 'I Facchini dell’Ultima Notte', tipo: 'Posseduto',
    flavor: 'Casse leggere, passo svelto: quello che serviva è già tutto sotto.',
    effect: 'Piazzate 1 Adepto sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Voce Cava.png', title: 'Gli Echi Tornano', tipo: 'Posseduto',
    flavor: 'Le voci del Borgo hanno sentito accordare. Rispondono alla chiamata.',
    effect: 'Piazzate 1 Voce Cava sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La Voce Cava.png', title: 'La Voce del Borgo', tipo: 'Posseduto',
    flavor: 'Una gola che conoscete cammina nelle gallerie, cercando il suo posto nel coro.',
    effect: 'Piazzate 1 Voce Cava sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il passo di cera.png', title: 'La Processione Ultima', tipo: 'Posseduto',
    flavor: 'I fratelli del Quarantuno scendono a sentire la fine del loro requiem.',
    effect: 'Piazzate 1 Confratello sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il passo di cera.png', title: 'I Fratelli del Quarantuno', tipo: 'Posseduto',
    flavor: 'Cera e ossa non hanno fretta. Ma stanotte, per la prima volta, camminano svelti.',
    effect: 'Piazzate 1 Confratello sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Turno di guardia.png', title: 'Le Guardie Pagate', tipo: 'Malavita',
    flavor: 'L’ultimo stipendio della Malavita: sorvegliare una notte sola. QUESTA.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Turno di guardia.png', title: 'Il Servizio di Banchina', tipo: 'Malavita',
    flavor: 'Due uomini e una lanterna schermata, dove l’acqua entra sotto la chiesa.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Passi sulla scala.png', title: 'Remi nel Buio', tipo: 'Posseduto',
    flavor: 'Un’altra barca passa l’arco. Il pellegrinaggio non è finito.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Porta d’Acqua (T1).' },
  { art: 'artworks/Passi sulla scala.png', title: 'La Seconda Barca', tipo: 'Posseduto',
    flavor: 'Scivola sotto l’arco senza lanterna. Come le senza-lanterne di una volta.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Porta d’Acqua (T1).' },
  { art: 'artworks/La marea di cera.png', title: 'La Marea che Sale', tipo: 'Insidia',
    flavor: 'La sizigia non aspetta i vostri piani. Un dito d’acqua alla volta.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Il ronzio nei denti.png', title: 'Il Battito Sotto', tipo: 'Insidia',
    flavor: 'Sessanta colpi l’ora. Poi sessantuno. Sta accelerando.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno.' },
  { art: 'artworks/L’eco che chiama.png', title: 'Il Canto delle Vene', tipo: 'Insidia',
    flavor: 'Le tre acque cantano insieme, e la vostra testa vuole cantare con loro.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il primo movimento.png', title: 'Il Primo Movimento', tipo: 'Crescendo',
    flavor: 'Il bronzo canta. Da qualche parte sopra di voi, una campana risponde.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: Ferri si desta in anticipo (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il secondo movimento.png', title: 'Il Secondo Movimento', tipo: 'Crescendo',
    flavor: 'La pietra risponde. I cinque righi si accendono uno dopo l’altro.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: Ferri si desta in anticipo (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/Il terzo movimento.png', title: 'Il Terzo Movimento', tipo: 'Crescendo',
    flavor: 'L’acqua ricorda. E ciò che ricorda, stanotte, comincia a sognarlo forte.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: Ferri si desta in anticipo (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
  { art: 'artworks/L’acqua ferma.png', title: 'L’Acqua Trattiene', tipo: 'Quiete',
    flavor: 'Per un momento, tutto tace: le vene, il battito, il coro. Il respiro prima.',
    effect: 'Nessun effetto. Tirate il fiato — ve ne servirà.' },
  { art: 'artworks/Una corrente d’aria buona.png', title: 'La Corrente Amica', tipo: 'Favore',
    flavor: 'Uno spiffero di città: qualcuno lassù ha aperto una porta al momento giusto.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/L’acqua sale.png', title: 'L’Acqua alle Ginocchia', tipo: 'Ostacolo',
    flavor: 'La sizigia reclama le gallerie basse. Si cammina come nei sogni cattivi.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il canto nelle orecchie.png', title: 'Il Richiamo', tipo: 'Insidia',
    flavor: 'Il coro vi conosce per nome, adesso. E chiama chi è più avanti degli altri.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Le ossa chiamano.png', title: 'Le Ossa Chiamano', tipo: 'Bivio',
    flavor: 'Le casse che avete tenuto rispondono all’organo da casa vostra.',
    effect: 'Aggiungete 1 segnalino Canto. Alla soglia: Ferri si desta in anticipo (vedi Soluzione). Se è già in gioco: cancellate 1 sua ferita dal Registro e si attiva subito.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 6/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP6_OGGETTI = [
  { art: 'artworks/Formula del Sigillo.png', nome: 'La Formula del Sigillo', ref: 'E6-L7',
    fonte: 'Luogo 7 — L’Archivio Capitolare',
    flavor: '«Si legga a voce ferma, a strumenti taciuti, nell’ora in cui l’acqua è più alta.»',
    effetto: 'Nella Camera (T8), a TUTTI e tre i movimenti spenti: un’azione — il rito muore, il Dormiente si riassopisce (vittoria piena).' },
  { art: 'artworks/Chiave della Porta d’Acqua.png', nome: 'La Chiave della Porta d’Acqua', ref: 'E6-L6',
    fonte: 'Luogo 6 — La Chiusa Grande',
    flavor: '«A voi la do volentieri. Così non tocca a me.»',
    effetto: 'Apre il cancello della Porta d’Acqua (Luogo 9) — e la strada per le Tre Acque.' },
  { art: 'artworks/Lanterna di Chiusa.png', nome: 'La Lanterna di Chiusa', ref: 'E6-L6',
    fonte: 'Luogo 6 — La Chiusa Grande',
    flavor: 'La lanterna dei guardiani di paratia: accesa da tre generazioni, mai spenta.',
    effetto: '+1 alle prove NERVI nella Galleria di Marea (T2), come da tessera.' },
  { art: 'artworks/Acqua Benedetta.png', nome: 'L’Acqua Benedetta', ref: 'E6-L1',
    fonte: 'Luogo 1 — La Cattedrale',
    flavor: 'Trema nelle pile da tre notti. Stanotte tremate insieme.',
    effetto: 'Effetto: nessuno finora scoperto. (Il conforto non è un’arma.)' },
  { art: 'artworks/Reliquia di San Teodoro.png', nome: 'La Reliquia di San Teodoro', ref: 'E6-L1',
    fonte: 'Luogo 1 — La Cattedrale',
    flavor: 'Il santo con la campana in mano. Venerabile. Muta.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Mazzetta da Campanaro.png', nome: 'La Mazzetta da Campanaro', ref: 'E6-T3',
    fonte: 'Si trova cercando in T3 — La Sala del Bronzo',
    flavor: 'Piombo e cuoio: lo strumento di chi lavora sulle campane senza farle cantare.',
    effetto: '+1 alle prove per spegnere i movimenti (T3, T5, T6).' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 6/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP6_NEMICI = [
  { art: 'artworks/Bastiano Ferri.png', title: 'Bastiano Ferri',
    type: 'Il Liutaio (Boss, finale d’atto) — Episodio 6',
    rules: '{i}Cinque casi dopo, è febbrile e lucido, quasi gentile — un artigiano alla consegna. Non crede al Dormiente: lo AMA, come si ama uno strumento supremo. La sua vera difesa è il rituale stesso.{/i}{divider}Statistiche nel Bestiario. Difesa 9, MENO 1 per ogni movimento spento.' },
  { art: 'artworks/Il Corista.png', title: 'Il Corista',
    type: 'Impiegato del rito (sciame, solo T8) — Episodio 6',
    rules: '{i}Dodici gole in accordo valgono una solista. Cantano una cosa che non capiscono, con la faccia di chi comincia a capirla. Non sono credenti: sono impiegati — e gli impiegati, quando il lavoro si mette male, scappano.{/i}{divider}Statistiche nel Bestiario. A 0 ferite FUGGE invece di morire.' },
].map((n) => ({ ...n, file: `Episodio 6/Nemici/${n.title}` }));

const EP6 = [...LUOGHI6, ...EP6_INDIZI, ...EP6_TESTIMONI, ...EP6_REFERTI,
             ...EP6_MINACCE, ...EP6_OGGETTI, ...EP6_NEMICI];



// ============================================================ EPISODIO 7
// «Il quartiere sordo» — apertura Atto II (vedi DESIGN-EPISODIO-7.md).
// Nessun mostro: Squadra del Silenzio (Sgherri), Guardiano (Sicario), il
// Capocantiere umano. Il Canto qui è l'ALLARME del cantiere.

const LUOGHI7 = [
  { n: 1, nome: 'La Contrada di Sant’Orsola', req: 'Disponibile dall’inizio',
    art: 'artworks/Contrada di Sant’Orsola.png',
    testo: 'Il suono, qui, cammina a chiazze: davanti alle case vecchie la vita si sente tutta, davanti a quelle rifatte c’è un’aria ferma che inghiotte i passi. La campana di San Michele suona per metà parrocchia. La gente parla forte senza accorgersene — o non parla affatto.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'La contrada',
        testo: '«Fava è passato di qui l’ultima sera, col diapason in mano, e batteva i muri come un medico batte un petto. Davanti al palazzone s’è fermato. Ha detto una parola sola: “qui”. Poi è andato verso il cantiere, e il cantiere se l’è bevuto come i muri si bevono le campane.»' },
    ] },
  { n: 2, nome: 'La Bottega di Fava', req: 'Disponibile dall’inizio',
    art: 'artworks/Bottega di Fava.png',
    testo: 'Pianoforti aperti come pazienti, martelletti in fila, diapason appesi per taglia. Tutto è fermo com’è rimasto mercoledì: la tazza sul banco, il grembiule sul gancio, il registro aperto. L’ordine di un uomo preciso — e l’assenza di un uomo preciso, che pesa di più.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il banco dell’accordatore',
        testo: 'Tra i ferri, una mattonella d’intonaco spaccata a metà, etichettata da Fava: «campione, palazzone, parete ovest». Nella frattura, una polvere grigia che luccica come metallo macinato. Fava non riparava pianoforti: faceva un’ANALISI. E chi analizza un brevetto, del brevetto è nemico.' },
    ] },
  { n: 3, nome: 'Le Fonderie', req: 'Disponibile dall’inizio',
    art: 'artworks/Fonderia Dossena.png',
    testo: 'I capannoni neri dell’episodio del bronzo, il piazzale, l’odore di ferro e pioggia. La montagna grigia in fondo — le scorie del Quarantuno — è DIMEZZATA, e il fronte di scavo è fresco. Gli operai la guardano come si guarda una tomba aperta.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il magazziniere',
        testo: '«Il carrettiere una volta ha bevuto troppo e ha parlato: “l’ingegnere dice che il bronzo vecchio BEVE il rumore, per questo lo macina nell’intonaco. L’ingegner Voltan, quello del brevetto. Un genio, dice lui. Io dico: un genio che paga perché non si sappia cosa c’è nel muro, che genio è?”»' },
    ] },
  { n: 4, nome: 'Il Banco dei Pegni', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Stavolta è Fossa a chiamare voi: tre pegni in fila sul banco — un orologio, una fede, un rasoio — e nelle incisioni di tutti e tre la stessa polvere grigia che luccica. «Operai del palazzone. E c’è di meglio: il guardiano licenziato. Per orecchie buone, dice lui.»',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il guardiano licenziato',
        testo: '«Una notte ho sentito battere da dentro l’intercapedine del terzo piano — tre colpi, pausa, tre colpi: uno che conta, mica un topo. L’ho detto al Capocantiere. Il giorno dopo ero in strada: “le orecchie buone, qui, sono un difetto”. È stato l’ingegnere a firmare: Voltan. Il brevetto è suo, il silenzio è suo.»' },
    ] },
  { n: 5, nome: 'L’Ufficio Brevetti Comunale',
    req: 'L’usciere è un muro di regolamenti: «i fascicoli si consultano su istanza motivata». Ma chi cita il nome esatto di un brevetto — quello vero, quello depositato — ha già mezza istanza fatta.',
    art: 'artworks/Ufficio Brevetti.png',
    testo: 'Un corridoio di sportelli e un archivio che sa di ceralacca: qui l’ingegno della provincia dorme in fascicoli numerati. Tra mille invenzioni oneste, una pratica pagata da nessuno — carta di pregio, piegata senza un’ombra di dita — aspetta chi sappia leggerla.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il foglio della società anonima',
        testo: 'Controluce, la carta di pregio ha la filigrana di una cartiera sola — la stessa delle commissioni dei casi passati. «La Quiete S.A.» esiste da undici mesi, non ha dipendenti, e compra silenzio: un brevetto che lo produce, un ingegnere che lo firma, un quartiere che fa da prova generale. Chi compra il silenzio a carrettate non lo fa per dormire meglio.' },
    ] },
  { n: 6, nome: 'La Baracca del Cantiere',
    req: 'Il cantiere di giorno è un formicaio sorvegliato: si entra solo per lavoro. Ma chi nomina la fornitura giusta — quella che arriva di notte — trova il furiere della baracca improvvisamente disponibile.',
    art: 'artworks/Baracca del Cantiere.png',
    testo: 'Il cervello di legno del palazzone: i disegni sul tavolo, le bolle sul chiodo, il registro dei turni, la stufa. Dalla finestrella si vede il cantiere tutto: sei piani di teli che respirano — e una lanterna accesa al terzo, dove il progetto non mette stanze.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La baracca del furiere',
        testo: 'Sotto il piano del tavolo, incollata col nastro, una seconda contabilità: le consegne notturne al terzo piano non sono calce — sono VIVERI. Pane, vino, candele. I muri non mangiano. Chi è murato, sì.' },
    ] },
  { n: 7, nome: 'L’Impresa Voltan & Figli',
    req: 'Il portiere dell’impresa smista i questuanti con un sopracciglio. Ma chi nomina la materia prima segreta — quella comprata di notte e mai dichiarata — viene fatto salire in fretta, prima che la strada senta.',
    art: 'artworks/Impresa Voltan.png',
    testo: 'Il palazzo dell’impresa è nuovo, naturalmente: intonaco brevettato, ottoni, targa lucida. Dentro, l’atrio è fermo come una fotografia — i passi non suonano, le voci muoiono a un metro. I commessi si sono abituati a leggersi le labbra.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'L’ufficio dell’ingegnere',
        testo: 'Sulla scrivania di Voltan, i conti della «Quiete S.A.»: l’impresa non VENDE l’intonaco alla società anonima — lo COMPRA da lei, a prezzo doppio, brevetto compreso. Voltan non è il padrone del silenzio: è il suo primo cliente. E chi gli sta sopra non ha nome, solo carta.' },
    ] },
  { n: 8, nome: 'Il Magazzino della Calce',
    req: 'Il magazzino fuori cinta è chiuso da un lucchetto da poco e da un cane da molto. Ma chi conosce il nome giusto — quello dell’uomo che ha la chiave e la sete — si fa aprire senza scavalcare.',
    art: 'artworks/Magazzino della Calce.png',
    testo: 'Un capannone basso tra gli orti, un cane che abbaia — QUI il suono c’è ancora — e file di sacchi marchiati con l’onda della Fonderia. Dentro, il chiarore lunare della calce: un intero magazzino di silenzio pronto da stendere. E in fondo, la sbornia del capoturno.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La calcina speciale',
        testo: 'Un sacco su dieci porta un secondo marchio, piccolo, sotto l’onda: una Q coronata — «La Quiete S.A.». La società anonima non compra soltanto il brevetto: compra la PRODUZIONE. Il quartiere sordo non è un cantiere: è un collaudo.' },
    ] },
  { n: 9, nome: 'Il Cancello del Palazzone',
    req: 'Il cancello del palazzone è l’unico varco nella cinta: guardiania nuova, squadra dentro, nessuna faccia amica. Si entra col carro della calce — e con la carta giusta sul carro.',
    art: 'artworks/Cancello del Palazzone.png',
    testo: 'Il confine tra la contrada e il silenzio totale: cinta di tavole, garitta nuova, il guardiano che non gira la testa nemmeno per le campane. Oltre, il cantiere di sera è una cattedrale di ponteggi — e al terzo piano una lanterna accesa dove non ci sono stanze.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'Il palazzone di sera',
        testo: 'A fissare il terzo piano, il palazzo sembra trattenere il fiato: si vede una stanza senza porte dietro un muro fresco, un uomo seduto che conta i colpi delle proprie nocche, e una squadra che gioca a carte in silenzio, sotto una lampada schermata. Nessuno parla, là dentro. Nemmeno per dare gli ordini. La visione dura un rintocco.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 7/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP7_INDIZI = LUOGHI7.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 7/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP7_TESTIMONI = LUOGHI7.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 7/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP7_REFERTI = LUOGHI7.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 7/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo Minaccia: 21 carte + 1 del Bivio («Gli occhi del culto», ramo
// "Ferri vivo" dell'Ep. 6). Mix: 11 spawn, 3 insidie, 3 crescendo, 4 eventi.
const EP7_MINACCE = [
  { art: 'artworks/La squadra del silenzio.png', title: 'La Squadra del Silenzio', tipo: 'Malavita',
    flavor: 'Arrivano senza un ordine detto ad alta voce. Non gli serve.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La squadra del silenzio.png', title: 'I Gesti del Capomastro', tipo: 'Malavita',
    flavor: 'Due dita, un cenno del mento: la squadra legge il direttore come un’orchestra.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/La squadra del silenzio.png', title: 'Il Piombo e la Sacca', tipo: 'Malavita',
    flavor: 'Attrezzi da lavoro. Dipende dal lavoro.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/I manovali di notte.png', title: 'I Manovali di Notte', tipo: 'Malavita',
    flavor: 'Pagati fuori busta, fuori registro, fuori discussioni.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Cancello (T1).' },
  { art: 'artworks/I manovali di notte.png', title: 'Il Turno Fuori Busta', tipo: 'Malavita',
    flavor: 'Il cantiere di notte lavora. A cosa, non si chiede.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Cancello (T1).' },
  { art: 'artworks/I manovali di notte.png', title: 'Le Pale nel Buio', tipo: 'Malavita',
    flavor: 'Le sentite solo quando smettono: qualcuno ha posato la pala per prendere altro.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/I manovali di notte.png', title: 'La Malta Fresca', tipo: 'Malavita',
    flavor: 'Qualcuno sta murando qualcosa, a quest’ora. È il mestiere della casa.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il guardiano di notte.png', title: 'Il Guardiano di Notte', tipo: 'Malavita',
    flavor: 'Pagato per non sentire. Ci vede benissimo.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il guardiano di notte.png', title: 'La Ronda del Cancello', tipo: 'Malavita',
    flavor: 'La lanterna schermata fa un occhio solo, e l’occhio gira.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Gli uomini dell’ingegnere.png', title: 'Gli Uomini dell’Ingegnere', tipo: 'Malavita',
    flavor: 'Non sono muratori: le mani sono sbagliate. Sono il capitolato segreto del contratto.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Gli uomini dell’ingegnere.png', title: 'La Paga del Silenzio', tipo: 'Malavita',
    flavor: 'Il triplo, per non sentire i colpi dal muro. Certe paghe comprano anche di peggio.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il silenzio che preme.png', title: 'Il Silenzio che Preme', tipo: 'Insidia',
    flavor: 'Preme sulle orecchie come acqua. E come l’acqua, trova ogni crepa.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/La tavola che cede.png', title: 'La Tavola che Cede', tipo: 'Insidia',
    flavor: 'Un crack asciutto — il primo suono vero da un’ora. Peccato sia sotto i vostri piedi.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La calce negli occhi.png', title: 'La Calce negli Occhi', tipo: 'Insidia',
    flavor: 'Uno spiffero, un sacco aperto, una nuvola bianca che morde.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Un fischio di sotto.png', title: 'Un Fischio di Sotto', tipo: 'Crescendo',
    flavor: 'Un fischio solo, dal piano terra. In un cantiere sordo, un fischio è un telegramma.',
    effect: 'Aggiungete 1 segnalino Canto (l’Allarme). Alla soglia: il cantiere è sveglio — ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Capocantiere è in gioco: si attiva subito.' },
  { art: 'artworks/Le lanterne si muovono.png', title: 'Le Lanterne si Muovono', tipo: 'Crescendo',
    flavor: 'Ai piani bassi, tre occhi di luce schermata cambiano posto. Vi stanno cercando.',
    effect: 'Aggiungete 1 segnalino Canto (l’Allarme). Alla soglia: il cantiere è sveglio — ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Capocantiere è in gioco: si attiva subito.' },
  { art: 'artworks/Il cantiere è sveglio.png', title: 'Il Cantiere è Sveglio', tipo: 'Crescendo',
    flavor: 'Nessun urlo, nessuna campana d’allarme. Solo: tutte le lanterne accese insieme.',
    effect: 'Aggiungete 1 segnalino Canto (l’Allarme). Alla soglia: il cantiere è sveglio — ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Capocantiere è in gioco: si attiva subito.' },
  { art: 'artworks/Il turno cambia.png', title: 'Il Turno Cambia', tipo: 'Quiete',
    flavor: 'Passi che scendono, passi che salgono, una bottiglia stappata in garitta.',
    effect: 'Nessun effetto. Tirate il fiato: per un momento, il cantiere pensa a se stesso.' },
  { art: 'artworks/Un’impalcatura amica.png', title: 'Un’Impalcatura Amica', tipo: 'Favore',
    flavor: 'Una rampa di servizio che il progetto non segna. I muratori scontenti lasciano strade.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/I sacchi franati.png', title: 'I Sacchi Franati', tipo: 'Ostacolo',
    flavor: 'Una pila cede — piano, senza fragore: la calce inghiotte anche il proprio crollo.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il piombo dal buio.png', title: 'Il Piombo dal Buio', tipo: 'Danno',
    flavor: 'Un filo a piombo lasciato cadere da tre piani non fa quasi rumore. Quasi.',
    effect: 'L’eroe più avanzato subisce 1 danno (nessuna prova: il buio ha mirato bene).' },
  { art: 'artworks/Gli occhi del culto.png', title: 'Gli Occhi del Culto', tipo: 'Bivio',
    flavor: 'Ferri, in cella, ha fatto un nome solo: il vostro. Qualcuno ha pagato per sapere il resto.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 7/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP7_OGGETTI = [
  { art: 'artworks/Bolla della Calce.png', nome: 'La Bolla della Calce', ref: 'E7-L6',
    fonte: 'Luogo 6 — La Baracca del Cantiere',
    flavor: 'Timbrata, firmata, in bianco. Il cancello non legge: riconosce.',
    effetto: 'Col carro della calce, si entra dal cancello del palazzone senza domande (vedi Soluzione: Domanda 4).' },
  { art: 'artworks/Lanterna Schermata.png', nome: 'La Lanterna Schermata', ref: 'E7-L8',
    fonte: 'Luogo 8 — Il Magazzino della Calce',
    flavor: 'Un occhio di luce, stretto come una moneta. Nel silenzio, la luce è la voce.',
    effetto: '+1 alle prove NERVI nelle tessere SORDE finché la porta chi l’ha presa.' },
  { art: 'artworks/Tappi di Cera.png', nome: 'I Tappi di Cera', ref: 'E7-L8',
    fonte: 'Luogo 8 — Il Magazzino della Calce',
    flavor: 'Del fonditore, su misura. Contro il silenzio, difendersi dal suono: chiedete a un artigiano.',
    effetto: 'Un eroe (deciso al momento) ignora la PRIMA prova NERVI da rumore o allarme della spedizione.' },
  { art: 'artworks/Fischietto del Capoturno.png', nome: 'Il Fischietto del Capoturno', ref: 'E7-L8',
    fonte: 'Luogo 8 — Il Magazzino della Calce',
    flavor: 'D’ordinanza, d’ottone, d’occasione. Un fischio, e il cantiere risponde. A lui.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lettera di Minaccia.png', nome: 'La Lettera di Minaccia', ref: 'E7-L2',
    fonte: 'Luogo 2 — La Bottega di Fava',
    flavor: '«O mi ricevete, o deposito tutto in Questura.» Spedita lunedì. Sparito mercoledì.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Fune di Servizio.png', nome: 'La Fune di Servizio', ref: 'E7-T3P',
    fonte: 'Si trova cercando in T3P — I Ponteggi di Ponente',
    flavor: 'Gancio buono, nodi da marinaio. Qualcuno scendeva in fretta, da qui.',
    effetto: 'Chi la porta può ridiscendere di UNA tessera senza prove, una sola volta (poi la fune resta giù).' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 7/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP7_NEMICI = [
  { art: 'artworks/Il Capocantiere.png', title: 'Il Capocantiere',
    type: 'La Squadra del Silenzio (Boss) — Episodio 7',
    rules: '{i}Il miglior capomastro della provincia, pagato il triplo per non sentire i colpi dall’intercapedine. Non urla mai: nel silenzio che ha costruito, non serve.{/i}{divider}Statistiche nel Bestiario. Nessuna debolezza-oggetto: è un uomo. «Smascherato» (D2): gridate il nome di Voltan — salta la sua prima attivazione e 1 Sgherro se ne va.' },
].map((n) => ({ ...n, file: `Episodio 7/Nemici/${n.title}` }));

const EP7 = [...LUOGHI7, ...EP7_INDIZI, ...EP7_TESTIMONI, ...EP7_REFERTI,
             ...EP7_MINACCE, ...EP7_OGGETTI, ...EP7_NEMICI];



// ============================================================ EPISODIO 8
// «L'oro vecchio» — standalone di Malavita (vedi DESIGN-EPISODIO-8.md).
// MAZZO FUORI STANDARD (regola varietà): 14 spawn / 2 insidie / 2
// crescendo / 3 eventi — la pressione è fatta di corpi.

const LUOGHI8 = [
  { n: 1, nome: 'L’Osteria della Bilancia', req: 'Disponibile dall’inizio',
    art: 'artworks/Osteria della Bilancia.png',
    testo: 'Il parlamento dei clan minori: tavoli assegnati per bandiera, il vino che misura le alleanze. Stasera la geografia è nuova — tavoli nemici da vent’anni si sono avvicinati, e si beve piano, come a un funerale andato bene.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il sensale dei banchi',
        testo: '«Il pagamento l’ho visto contare: marenghi con l’aquila vecchia, mai un millesimo leggibile — i bordi molati di fresco, tutti. E chi contava non era un gregario: era la Vedova Bruna in persona, coi guanti da messa. Contava senza guardare le dita. Chi conta così ha contato TANTO, nella vita.»' },
    ] },
  { n: 2, nome: 'Il Banco dei Pegni', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Il bancone lucido, la lente d’ottone, l’occhio che pesa prima della bilancia. I sette marenghi in fila sul velluto sembrano una costellazione — e Fossa li guarda come si guarda un cielo che promette tempesta.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La lente di Fossa',
        testo: 'Sotto la lente, tra le molature, un residuo nero nelle zigrinature: polvere di carbone da forgia. L’oro non viene speso com’è: viene RIFUSO, vicino a molto carbone — e il carbone da crogiolo, in una città senza fonderie attive, si compra solo in un posto. Chiedete ai carrettieri.' },
    ] },
  { n: 3, nome: 'La Taverna della Chiatta', req: 'Disponibile dall’inizio',
    art: 'artworks/Taverna della Chiatta.png',
    testo: 'Il porto senza il porto: reti alle travi, il pavimento che sa di sentina, il tavolo della Vedova in fondo come un altare laico. I patti qui si chiudono a bicchieri alzati e si rompono a bicchieri rotti — e nessun bicchiere è rotto da mesi.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il barcaiolo della Chiatta',
        testo: '«La Vedova è salita sulla mia barca una volta sola, per andare all’ansa morta. Non ha aperto bocca per tutto il viaggio. Alla banchina l’aspettava l’orefice — quello radiato, il Cambiavalute — col bilancino sotto il braccio. Lei gli ha dato UNA busta. Lui s’è inchinato come si fa coi vescovi.»' },
    ] },
  { n: 4, nome: 'Il Monte di Pietà', req: 'Disponibile dall’inizio',
    art: 'artworks/Monte di Pietà.png',
    testo: 'La memoria economica dei poveri: scaffali di pegni etichettati, la grata, l’odore di naftalina e dignità. File insolite: gente che RITIRA. Il direttore firma svincoli con la penna che trema — l’oro vecchio scotta anche a chi lo incassa.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il registro dei riscatti',
        testo: 'I riscatti anomali dell’ultimo trimestre fanno una mappa: tutti i quartieri dei clan minori, nessuno dei clan grandi. Chi paga sta comprando i PICCOLI — uno alla volta, casa per casa, come si compra un isolato prima di costruirci sopra. Questo non è racket: è un CONSOLIDAMENTO. E ha un progetto.' },
    ] },
  { n: 5, nome: 'La Carbonaia del Porto',
    req: 'Il carbonaio non parla coi curiosi: «il carbone è carbone». Ma chi nomina il carico giusto — quello che viaggia di notte — scopre che il carbonaio ha una coscienza, e che pesa più dei sacchi.',
    art: 'artworks/Carbonaia del Porto.png',
    testo: 'Una cattedrale nera: montagne di sacchi, polvere che inghiotte la luce, il carbonaio bianco solo intorno agli occhi. Le bolle sul chiodo, i carri in fila — e un carico che parte solo di giovedì, quando il porto dorme.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Le bolle del carbone',
        testo: 'Le firme di ricevuta sulle bolle del giovedì sono tutte della stessa mano — una mano ELEGANTE, da scrivano, che si sforza di sembrare rozza: le aste tremano dove non dovrebbero. Chi riceve il carbone all’ansa morta sa scrivere molto meglio di quanto voglia mostrare. Un orefice radiato, per esempio.' },
    ] },
  { n: 6, nome: 'La Casa del Vecchio Esattore',
    req: 'L’esattore in pensione non apre: «i conti dello Stato sono chiusi». Ma chi nomina l’oro giusto — quello che lo Stato ha perso — trova un vecchio che aspetta da cinquant’anni di raccontare.',
    art: 'artworks/Casa dell’Esattore.png',
    testo: 'Un archivio in pensione: fascicoli rilegati in casa, timbri a secco senza inchiostro, la divisa demaniale nell’armadio con la canfora. Un uomo che ha contato l’oro dello Stato per quarant’anni — e che da cinquanta aspetta qualcuno a cui raccontare dove è finito.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'L’inventario dell’esattore',
        testo: 'In fondo all’inventario, una nota a margine di mano diversa — più recente, inchiostro moderno: «il deposito non esiste più. Le casse nemmeno. Chiedere ai sigilli.» L’esattore giura di non averla scritta lui. Qualcuno ha letto questa copia PRIMA di voi — e ha lasciato un appunto da collega.' },
    ] },
  { n: 7, nome: 'L’Archivio dei Sequestri',
    req: 'L’archivista demaniale è un uomo prudente: «i fascicoli storici si aprono su istanza». Ma chi cita il sequestro giusto — con la sua lega e il suo anno — ottiene il faldone prima ancora di finire la frase.',
    art: 'artworks/Archivio Demaniale.png',
    testo: 'La soffitta dello Stato: sequestri, confische, eredità giacenti — tre secoli di roba tolta e mai resa, in faldoni legati col nastro rosso. L’archivista cammina piano, come in chiesa. Qui niente sparisce mai. Qui, ufficialmente, niente è mai sparito.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La ceralacca fresca',
        testo: 'Il sigillo è impresso con la matrice AUTENTICA: ogni dente, ogni difetto del conio originale. Non è un falso: è un USO. Qualcuno possiede ancora la matrice demaniale del 1741, la usa per aprire e richiudere ciò che lo Stato credeva sepolto — e un’eredità così non si ruba: si riceve, d’ufficio, in silenzio. Il tesoro non fu perso. Fu CUSTODITO.' },
    ] },
  { n: 8, nome: 'La Corte della Vedova',
    req: 'La villa non riceve chi non è atteso. Ma chi arriva nominando l’ansa morta — ad alta voce, davanti al cancello — scopre di essere atteso da giorni.',
    art: 'artworks/Villa della Vedova.png',
    testo: 'Sobria come un conto in pareggio: niente ori, una veranda sul fiume col dondolo e il binocolo da teatro. Il potere nuovo non si veste: si siede sulla curva del fiume, da dove vede passare ogni chiatta — e versa il caffè di persona, per contare le mani degli ospiti.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Le mani della Vedova',
        testo: 'Versa il caffè con la grazia di una padrona di casa — ma tiene la tazza da sotto, a dita aperte, come si tiene un BILANCINO. E quando vi porge lo zucchero, conta i movimenti: due, sempre due. Chi ha pesato oro per una vita non smette per un caffè. La Vedova non riceve ordini dal Cambiavalute: è il contrario.' },
    ] },
  { n: 9, nome: 'Il Molo delle Chiatte in Disarmo',
    req: 'Il molo è «chiuso per disarmo»: catena, sentinelle annoiate, cani che non abbaiano. Le sentinelle non trattano — ma un corriere col marengo giusto non tratta: PASSA.',
    art: 'artworks/Molo in Disarmo.png',
    testo: 'Il cimitero della flotta minuta: scafi in secca, bitte arrugginite, la catena col cartello DISARMO. Ma il cimitero ha sentinelle, e i cani non abbaiano: aspettano. In fondo, sotto la tettoia grande, un bagliore basso che nessun faro ha mai avuto.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'L’ansa morta',
        testo: 'A fissare il bagliore sotto la tettoia: si vede un crogiolo che non si spegne mai, un uomo col bilancino che pesa senza guardare, e ventidue casse col sigillo del Quarantuno che si svuotano una colata alla volta — la memoria di un tesoro che diventa moneta senza memoria. La visione dura un rintocco.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 8/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP8_INDIZI = LUOGHI8.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 8/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP8_TESTIMONI = LUOGHI8.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 8/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP8_REFERTI = LUOGHI8.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 8/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// MAZZO FUORI STANDARD: 14 spawn / 2 insidie / 2 crescendo / 3 eventi.
const EP8_MINACCE = [
  { art: 'artworks/Le sentinelle del molo.png', title: 'Le Sentinelle del Molo', tipo: 'Malavita',
    flavor: 'Contano tutti quelli che passano. Voi non tornate nel conto.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Le sentinelle del molo.png', title: 'Il Giro di Ronda', tipo: 'Malavita',
    flavor: 'Una lanterna bassa, un passo svogliato, un coltello per niente svogliato.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Le sentinelle del molo.png', title: 'Il Fischio Basso', tipo: 'Malavita',
    flavor: 'Due note, sull’acqua. La risposta arriva da tre punti diversi.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Le sentinelle del molo.png', title: 'Gli Uomini della Tettoia', tipo: 'Malavita',
    flavor: 'Scaricano di notte e sorvegliano di giorno. O il contrario. Sempre lì, comunque.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Molo in Disarmo (T1).' },
  { art: 'artworks/Le sentinelle del molo.png', title: 'Il Cambio di Guardia', tipo: 'Malavita',
    flavor: 'Quelli smontanti raccontano ai montanti cosa hanno visto. Stanotte: voi.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Molo in Disarmo (T1).' },
  { art: 'artworks/Il mastino sciolto.png', title: 'Il Mastino Sciolto', tipo: 'Malavita',
    flavor: 'Non abbaia. È questo il punto.',
    effect: 'Piazzate 1 Mastino sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il mastino sciolto.png', title: 'I Cani dell’Ansa', tipo: 'Malavita',
    flavor: 'Nutriti a carne e silenzio. Il gioco che conoscono ha un odore solo: il vostro.',
    effect: 'Piazzate 1 Mastino sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il mastino sciolto.png', title: 'Il Guinzaglio Tagliato', tipo: 'Malavita',
    flavor: 'Qualcuno, da qualche parte, ha appena aperto una mano.',
    effect: 'Piazzate 1 Mastino sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Il guardaspalle.png', title: 'Il Guardaspalle', tipo: 'Malavita',
    flavor: 'Il pesatore conta l’oro. Lui conta i respiri del pesatore. E i vostri.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Il guardaspalle.png', title: 'L’Ombra del Pesatore', tipo: 'Malavita',
    flavor: 'Dove c’è un registro, c’è un uomo pagato perché il registro non si legga.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Gli uomini dei clan.png', title: 'Gli Uomini dei Clan', tipo: 'Malavita',
    flavor: 'La nuova paga è arrivata puntuale. Il nuovo lavoro pure.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Gli uomini dei clan.png', title: 'La Paga del Giovedì', tipo: 'Malavita',
    flavor: 'Chi è pagato di giovedì, il giovedì lavora volentieri.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi della tessera corrente.' },
  { art: 'artworks/Gli uomini dei clan.png', title: 'Il Debito di Bandiera', tipo: 'Malavita',
    flavor: 'Hanno cambiato ala, non abitudini: quando il capo chiama, si corre.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Molo in Disarmo (T1).' },
  { art: 'artworks/Gli uomini dei clan.png', title: 'I Nuovi Assunti', tipo: 'Malavita',
    flavor: 'Facce nuove, coltelli vecchi. L’ansa morta assume in fretta.',
    effect: 'Piazzate 1 Sgherro sull’ingresso del Molo in Disarmo (T1).' },
  { art: 'artworks/La polvere negli occhi.png', title: 'La Polvere negli Occhi', tipo: 'Insidia',
    flavor: 'Il carbone non perdona chi respira nel momento sbagliato.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/La passerella marcia.png', title: 'La Passerella Marcia', tipo: 'Insidia',
    flavor: 'Il molo in disarmo è in disarmo davvero, dove serve a lui.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Un fischio sull’acqua.png', title: 'Un Fischio sull’Acqua', tipo: 'Crescendo',
    flavor: 'La voce gira: c’è gente all’ansa che non doveva entrarci.',
    effect: 'Aggiungete 1 segnalino Canto (la Voce che gira). Alla soglia: i clan sono in strada — ogni Fase Minaccia pesca 1 carta in più, per sempre. Se un Mastino è in gioco: si attiva subito.' },
  { art: 'artworks/I clan accorrono.png', title: 'I Clan Accorrono', tipo: 'Crescendo',
    flavor: 'La nuova paga si difende. I clan lo sanno prima ancora dell’ordine.',
    effect: 'Aggiungete 1 segnalino Canto (la Voce che gira). Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre. Se un Mastino è in gioco: si attiva subito.' },
  { art: 'artworks/Il turno di guardia.png', title: 'Il Turno di Guardia', tipo: 'Quiete',
    flavor: 'Una bottiglia passa di mano in garitta. Per un momento, l’ansa pensa a sé.',
    effect: 'Nessun effetto. Tirate il fiato — e contate le casse.' },
  { art: 'artworks/Una chiatta amica.png', title: 'Una Chiatta Amica', tipo: 'Favore',
    flavor: 'Un barcaiolo che deve un favore a Fossa passa lento, e guarda altrove.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Le casse rovesciate.png', title: 'Le Casse Rovesciate', tipo: 'Ostacolo',
    flavor: 'Una pila cede senza fragore: il carbone attutisce anche i crolli.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 8/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP8_OGGETTI = [
  { art: 'artworks/Marengo Segnato.png', nome: 'Il Marengo Segnato', ref: 'E8-L2',
    fonte: 'Luogo 2 — Il Banco dei Pegni',
    flavor: 'La tacca di Fossa, quasi invisibile. Per le sentinelle vale un lasciapassare; per i Mastini, un profumo.',
    effetto: 'Le sentinelle vi prendono per corrieri (vedi Soluzione: Domanda 4). ATTENZIONE: il Fiuto dei Mastini punta chi lo porta — si passa tra eroi adiacenti (gratuito, una volta per turno).' },
  { art: 'artworks/Lanterna da Sentina.png', nome: 'La Lanterna da Sentina', ref: 'E8-L5',
    fonte: 'Luogo 5 — La Carbonaia del Porto',
    flavor: 'Vetro basso, fiamma corta: la luce del contrabbando, che non si vede dal fiume.',
    effetto: '+1 alle prove NERVI nel deposito finché la porta chi l’ha presa.' },
  { art: 'artworks/Gancio da Carico.png', nome: 'Il Gancio da Carico', ref: 'E8-T2',
    fonte: 'Si trova cercando in T2 — La Tettoia delle Chiatte',
    flavor: 'Manico consumato da mani oneste, in un posto che non lo è.',
    effetto: '+1 alle prove Interagire con casse e paranchi.' },
  { art: 'artworks/Tessera della Chiatta.png', nome: 'La Tessera della Chiatta', ref: 'E8-L3',
    fonte: 'Luogo 3 — La Taverna della Chiatta',
    flavor: 'Di corno, incisa a caldo: vale un passaggio sul fiume, tra amici.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Sigillo di Piombo.png', nome: 'Il Sigillo di Piombo del Monte', ref: 'E8-L4',
    fonte: 'Luogo 4 — Il Monte di Pietà',
    flavor: 'Autentica i pegni, non le persone.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 8/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP8_NEMICI = [
  { art: 'artworks/Il Cambiavalute.png', title: 'Il Cambiavalute',
    type: 'L’Orefice dell’Ansa Morta (Boss) — Episodio 8',
    rules: '{i}Un orefice radiato, ripescato per il lavoro della vita: rifondere un tesoro che non esiste. Mani d’artista, bilancino da farmacista, la calma di chi pesa l’oro degli altri da trent’anni.{/i}{divider}Statistiche nel Bestiario. STANZIALE in T4. Il crogiolo: ogni round senza eroi in T4, 1 segnalino su una cassa non sequestrata — al 3° la cassa è persa.' },
  { art: 'artworks/Il Mastino.png', title: 'Il Mastino',
    type: 'Cane da guardia dell’Ansa (bestia) — Episodio 8',
    rules: '{i}I cani dell’ansa morta non abbaiano: aspettano. Un solo gioco: l’odore dell’oro conta più di quello della paura.{/i}{divider}Statistiche nel Bestiario. FIUTO: se può, attacca sempre chi porta il Marengo Segnato o una cassa d’oro.' },
].map((n) => ({ ...n, file: `Episodio 8/Nemici/${n.title}` }));

const EP8 = [...LUOGHI8, ...EP8_INDIZI, ...EP8_TESTIMONI, ...EP8_REFERTI,
             ...EP8_MINACCE, ...EP8_OGGETTI, ...EP8_NEMICI];



// ============================================================ EPISODIO 9
// «Il processo» — Atto II, mythology-light (vedi DESIGN-EPISODIO-9.md).
// Obiettivo SCORTA: Riva vivo al Molo. Il Sicario Gentile caccia il teste.

const LUOGHI9 = [
  { n: 1, nome: 'Il Tribunale', req: 'Disponibile dall’inizio',
    art: 'artworks/Il Tribunale.png',
    testo: 'Un tempio spento: colonne, l’eco dei passi, la Giustizia bendata che di notte inquieta. Negli uffici del cancelliere una lampada accesa: si prepara l’udienza di domani, e in silenzio anche il modo di guastarla.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il banco della difesa',
        testo: 'I faldoni della difesa sono ORDINATI per la deposizione di domani: ogni obiezione già scritta, ogni testimone già smontato — compreso Riva, con una nota: «ritratta o non compare». La difesa non improvvisa: sa GIÀ cosa dirà Riva, o cosa non dirà. Qualcuno gliel’ha promesso.' },
    ] },
  { n: 2, nome: 'La Redazione della Gazzetta', req: 'Disponibile dall’inizio',
    art: 'artworks/Gazzetta di Roccamora.png',
    testo: 'Il torchio fermo ma caldo, le bozze appese come panni, Ranuzzi curvo sul processo con l’astio del cronista a cui hanno tolto la notizia più grossa. Sa tutto e non può stampare niente: l’uomo giusto con cui parlare, di notte, a bassa voce.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Ranuzzi',
        testo: '«Ho visto arrivare l’avvocato alla stazione: nessuno ad aspettarlo tranne un uomo elegante coi guanti chiari, che gli ha preso la valigia e non ha detto una parola. Quel signore non alloggia con l’avvocato: alloggia solo, alla Locanda del Forestiero. E non è un cameriere: i camerieri non hanno quelle spalle, e non si guardano MAI alle spalle come lui.»' },
    ] },
  { n: 3, nome: 'La Pensione del Giurato', req: 'Disponibile dall’inizio',
    art: 'artworks/Pensione Serena.png',
    testo: 'Corridoi che sanno di cavolo e cera, una padrona che non fa domande, e dietro una porta al secondo piano un giurato che beve per non pensare a tre figlie di cui qualcuno conosce i nomi. La coscienza, qui, ha l’odore del vino cattivo.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Amilcare Bo',
        testo: '«L’oro della parcella dell’avvocato e l’oro dei miei debiti sono lo STESSO oro: marenghi vecchi, bordi molati. Chi ha comprato me ha comprato lui, e ha comprato il verdetto. Non è un avvocato che difende un cliente: è un impiegato che chiude una pratica. E la pratica siamo NOI.»' },
    ] },
  { n: 4, nome: 'La Gendarmeria', req: 'Disponibile dall’inizio',
    art: 'artworks/La Gendarmeria.png',
    testo: 'Mezza vuota di notte: un piantone assonnato, il registro aperto, le celle silenziose. L’usciere fidato, prestato alla guardia, custodisce un segreto troppo grande per una sacrestia — e sa che il cambio di guardia, stanotte, non gli piace.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'L’usciere del Tribunale',
        testo: '«La deposizione di domani terrorizza gente importante: da quando ho nascosto Riva, mi hanno offerto uno stipendio annuo per dire dov’è. In oro vecchio. Ho detto di no — ho giurato sul Vangelo, io. Ma non tutti giurano, e il cambio di guardia di stanotte lo fa uno che ai Vangeli preferisce i marenghi.»' },
    ] },
  { n: 5, nome: 'Lo Studio dell’Avvocato Grassi',
    req: 'Lo studio provvisorio dell’avvocato non riceve: «l’avvocato prepara la deposizione». Ma chi nomina il fondo giusto — quello che lo paga — trova un praticante spaventato e una porta socchiusa.',
    art: 'artworks/Studio Grassi.png',
    testo: 'Una scena teatrale: mobili d’affitto, faldoni nuovi di zecca, un ordine da chirurgo. Non ci vive nessuno: una bottega aperta per un solo lavoro, che chiuderà a caso chiuso. Sul tavolo l’oro non si vede — ma si sente, come un profumo.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il registro delle ronde',
        testo: 'Le «cortesie alle ronde» hanno un orario preciso, ripetuto: le pattuglie del porto e del centro «si diradano» tra l’una e le tre. Non è un caso: è una FINESTRA, comprata e pagata, ritagliata su misura per qualcosa che deve accadere in strada senza testimoni in divisa. Qualcosa come la scomparsa di un teste.' },
    ] },
  { n: 6, nome: 'La Sacrestia del Tribunale',
    req: 'La sacrestia dietro l’aula è sbarrata e sorvegliata: si entra solo sapendo cosa custodisce — la parola giusta, quella che vale più di una chiave.',
    art: 'artworks/Sacrestia del Tribunale.png',
    testo: 'Una stanzetta senza finestre: un inginocchiatoio, una branda, una candela. Anselmo Riva ci vive da giorni come un topo in trappola, con la mantella addosso e gli occhi di chi ha già visto la propria lapide. L’unico posto sicuro della città — e sicuro solo fino al cambio di guardia.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il verbale già scritto',
        testo: 'La ritrattazione è battuta a macchina PRIMA che Riva l’abbia firmata — anzi, prima che l’abbiano convinto. Chi l’ha preparata non spera che Riva ritratti: DÀ PER SCONTATO che entro domani Riva non parlerà, in un modo o nell’altro. Il foglio bianco per la firma è un atto di fede in un sicario.' },
    ] },
  { n: 7, nome: 'La Casa del Teste',
    req: 'La casa di Riva è vuota e sigillata dalla paura. Chi arriva sapendo del denaro giusto — l’oro che gira in questa storia — trova la porta ceduta e una minaccia lasciata bene in vista.',
    art: 'artworks/Casa del Teste.png',
    testo: 'Vuota e ordinata come una tomba: il letto rifatto, la valigia pronta sotto, la tazza lavata. Solo il cuscino è fuori posto — perché sopra, con cura, qualcuno ha lasciato un foglio che nessuno dovrebbe mai ricevere: il disegno della propria fine.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La minaccia sul cuscino',
        testo: 'A toccare il disegno della tomba: si vede una mano guantata di chiaro che posa il foglio sul cuscino con delicatezza, quasi con rispetto, e una seconda mano — nuda, con un anello da notaio — che lo raccoglie, ci scrive la data, e lo rimette a posto. Il sicario obbedisce; il notaio decide. La visione dura un rintocco.' },
    ] },
  { n: 8, nome: 'La Locanda del Forestiero',
    req: 'La locanda del forestiero è discreta e cara. Chi lo nomina per quello che è — il forestiero coi guanti — trova l’oste loquace per la paura, e la stanza giusta al primo piano. Ma dopo le 23 la stanza è vuota: lui è già in strada.',
    art: 'artworks/Locanda del Forestiero.png',
    testo: 'Discreta e cara, la locanda di chi non vuole essere ricordato. Al primo piano, la stanza più lontana dalle scale è quella del signore coi guanti chiari: ordinata come una caserma, muta come una cassaforte. Ci si entra solo quando lui è fuori — e di notte è sempre fuori.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il biglietto di C.B.',
        testo: 'Carta di pregio, filigrana della cartiera dei casi passati; e la «M.» della firma ha lo stesso ricciolo del Tessitore delle lettere d’incarico. La mano che vi ha assunti scrive gli ordini a chi vi dà la caccia. «Che sia pulito» a doppia lettura: uccidere senza scandalo, o far sparire senza sangue? Perfino l’ordine è ambiguo, come chi lo firma.' },
    ] },
  { n: 9, nome: 'L’Approdo della Società',
    req: 'L’approdo segreto della Società è protetto dall’oscurità e dal Salvacondotto: senza la carta del giudice, i posti di blocco notturni fermano chiunque — anche chi scorta un innocente.',
    art: 'artworks/Molo del Lume.png',
    testo: 'Un battello basso, due rematori fidati, una lanterna schermata. È QUI che finisce la scorta — Riva a bordo, e la verità salva fino all’alba. Da qui, di notte, si parte e si sparisce. Stanotte, se tutto va bene, si sparisce in tre.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'Il guanto sulla bitta',
        testo: 'A raccogliere il guanto chiaro lasciato di proposito sulla bitta: si vede l’uomo che se l’è sfilato guardando il molo dall’ombra, con la calma di chi ha già scelto il punto in cui aspettarvi — non qui, dove sareste in guardia, ma prima, dove crederete d’avercela fatta. Il Sicario Gentile non insegue: ANTICIPA. La visione dura un rintocco.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 9/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP9_INDIZI = LUOGHI9.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 9/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP9_TESTIMONI = LUOGHI9.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 9/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP9_REFERTI = LUOGHI9.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 9/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 11 spawn, 3 insidie, 3 crescendo, 4 eventi (+1 dal Bivio Ep. 8).
const EP9_MINACCE = [
  { art: 'artworks/I bravi del fondo.png', title: 'I Bravi del Fondo', tipo: 'Malavita',
    flavor: 'Pagati dal fondo caritatevole. La carità, di notte, ha i coltelli.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina a Riva.' },
  { art: 'artworks/I bravi del fondo.png', title: 'La Carità Armata', tipo: 'Malavita',
    flavor: 'Un’opera pia che assume gente con le nocche rotte.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina a Riva.' },
  { art: 'artworks/I bravi del fondo.png', title: 'Il Braccio dell’Avvocato', tipo: 'Malavita',
    flavor: 'L’avvocato smonta le prove in aula. Fuori, le smonta così.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina a Riva: si attiva subito.' },
  { art: 'artworks/I colleghi del gentile.png', title: 'I Colleghi del Gentile', tipo: 'Malavita',
    flavor: 'Meno eleganti di lui. Non meno puntuali.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina a Riva.' },
  { art: 'artworks/I colleghi del gentile.png', title: 'Il Coltello dal Buio', tipo: 'Malavita',
    flavor: 'Non si scusa: quello è un privilegio del capo.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina a Riva: si attiva subito.' },
  { art: 'artworks/La folla comprata.png', title: 'La Folla Comprata', tipo: 'Malavita',
    flavor: 'Testimoni pagati per non testimoniare. Stanotte, per intralciare.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/La folla comprata.png', title: 'Gli Ubriachi su Ordinazione', tipo: 'Malavita',
    flavor: 'Barcollano proprio dove dovete passare. Proprio quando.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/La folla comprata.png', title: 'Il Capannello', tipo: 'Malavita',
    flavor: 'Si radunano a discutere di niente, spalle al muro, occhi su Riva.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina a Riva.' },
  { art: 'artworks/I bravi del fondo.png', title: 'La Retroguardia', tipo: 'Malavita',
    flavor: 'Chiudono la strada dietro di voi. Non si torna indietro.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I colleghi del gentile.png', title: 'L’Uomo sul Tetto', tipo: 'Malavita',
    flavor: 'Non scende. Segnala. E qualcuno, sotto, accorre.',
    effect: 'Piazzate 1 Sicario sull’uscita più vicina a Riva.' },
  { art: 'artworks/I bravi del fondo.png', title: 'Il Fischio di Richiamo', tipo: 'Malavita',
    flavor: 'Un fischio, e i bravi convergono dove serve.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina a Riva: si attiva subito.' },
  { art: 'artworks/La nebbia del fiume.png', title: 'La Nebbia del Fiume', tipo: 'Insidia',
    flavor: 'Sale dall’acqua e cancella i compagni a due passi. E Riva a uno.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il selciato viscido.png', title: 'Il Selciato Viscido', tipo: 'Insidia',
    flavor: 'La pietra bagnata non perdona la fretta. E voi avete fretta.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La folla che spinge.png', title: 'La Folla che Spinge', tipo: 'Insidia',
    flavor: 'Un capannello che si stringe: qualcuno cerca di separarvi da Riva.',
    effect: 'L’eroe adiacente a Riva prova NERVI (Media): se fallisce, Riva è spinto di 2 caselle a caso (chi arbitra sceglie).' },
  { art: 'artworks/La prima ronda passa.png', title: 'La Prima Ronda Passa', tipo: 'Crescendo',
    flavor: 'Le lanterne dei gendarmi si allontanano. Puntuali, come pagate.',
    effect: 'Aggiungete 1 segnalino Canto (l’Ora che stringe). Alla soglia: l’intervallo delle ronde è al colmo — ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Sicario Gentile è in gioco: si attiva subito.' },
  { art: 'artworks/Le campane dell’una.png', title: 'Le Campane dell’Una', tipo: 'Crescendo',
    flavor: 'Un rintocco solo, sull’acqua. L’ora del sicario comincia.',
    effect: 'Aggiungete 1 segnalino Canto (l’Ora che stringe). Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Sicario Gentile è in gioco: si attiva subito.' },
  { art: 'artworks/L’intervallo delle ronde.png', title: 'L’Intervallo delle Ronde', tipo: 'Crescendo',
    flavor: 'Per due ore, la città è di chi l’ha comprata. Sbrigatevi.',
    effect: 'Aggiungete 1 segnalino Canto (l’Ora che stringe). Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre. Se il Sicario Gentile è in gioco: si attiva subito.' },
  { art: 'artworks/Un portone amico.png', title: 'Un Portone Amico', tipo: 'Quiete',
    flavor: 'Qualcuno lascia un portone accostato. In questa città, qualcuno vi vuole ancora bene.',
    effect: 'Nessun effetto. Tirate il fiato: Riva vi guarda come si guarda chi non ti tradisce.' },
  { art: 'artworks/La scorciatoia di ranuzzi.png', title: 'La Scorciatoia di Ranuzzi', tipo: 'Favore',
    flavor: 'Il cronista conosce i vicoli meglio dei gendarmi. E ve ne regala uno.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Il ponte levato.png', title: 'Il Ponte Levato', tipo: 'Ostacolo',
    flavor: 'Qualcuno ha alzato il ponticello di servizio: si passa, ma lenti.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il coltello dal buio.png', title: 'La Lama Educata', tipo: 'Insidia',
    flavor: '«Con permesso», dice il buio. E colpisce chi sta più vicino al teste.',
    effect: 'L’eroe adiacente a Riva (a pari merito: sceglie il gruppo) subisce 1 danno — è il prezzo di fare da scudo.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 9/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP9_OGGETTI = [
  { art: 'artworks/Salvacondotto del Giudice.png', nome: 'Il Salvacondotto del Giudice', ref: 'E9-L1',
    fonte: 'Luogo 1 — Il Tribunale (entro le 20)',
    flavor: 'Firmato e sigillato dal presidente. «Il teste arrivi vivo.» Apre il buio come una chiave.',
    effetto: 'Alla partenza della scorta, scegliete UNA fra T2/T4/T5 e la SALTATE (i posti di blocco vi aprono la scorciatoia).' },
  { art: 'artworks/Mantella da Sacrestano.png', nome: 'La Mantella da Sacrestano', ref: 'E9-L6',
    fonte: 'Luogo 6 — La Sacrestia del Tribunale',
    flavor: 'Grigia e anonima come cento altre. Nella folla, un sacrestano è un fantasma tra i fantasmi.',
    effetto: 'Nel Mercato Coperto (T4), il PRIMO attacco portato a Riva manca automaticamente («non era lui»).' },
  { art: 'artworks/Fischietto d’Allarme.png', nome: 'Il Fischietto d’Allarme', ref: 'E9-L4',
    fonte: 'Luogo 4 — La Gendarmeria',
    flavor: 'D’ordinanza, vero. Un fischio, e una ronda onesta accorre — dove ancora ce n’è una.',
    effetto: 'Una volta in spedizione: rimuovete dal tavolo 1 Sgherro appena piazzato (la ronda lo mette in fuga).' },
  { art: 'artworks/Tesserino della Gendarmeria.png', nome: 'Il Tesserino della Gendarmeria', ref: 'E9-L4',
    fonte: 'Luogo 4 — La Gendarmeria',
    flavor: 'Utile a un agente in servizio. Voi, di notte, non lo siete.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lettera di Ranuzzi.png', nome: 'La Lettera di Ranuzzi', ref: 'E9-L2',
    fonte: 'Luogo 2 — La Redazione della Gazzetta',
    flavor: 'È stampa, non autorità: convince i lettori, non i posti di blocco.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 9/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP9_NEMICI = [
  { art: 'artworks/Il Sicario Gentile.png', title: 'Il Sicario Gentile',
    type: 'Il Primo Agente di C.B. (Boss) — Episodio 9',
    rules: '{i}Il primo uomo di C.B. che la Società vede in faccia — e vorrebbe non averlo visto. Elegante, guanti chiari sempre puliti, la cortesia di chi ha fatto delle buone maniere un’arma: si scusa prima di colpire.{/i}{divider}Statistiche nel Bestiario. CACCIA IL TESTE: se può raggiungere Riva, attacca lui. «Il nome sbagliato» (D2): salta la prima attivazione.' },
].map((n) => ({ ...n, file: `Episodio 9/Nemici/${n.title}` }));

const EP9 = [...LUOGHI9, ...EP9_INDIZI, ...EP9_TESTIMONI, ...EP9_REFERTI,
             ...EP9_MINACCE, ...EP9_OGGETTI, ...EP9_NEMICI];

// ============================================================ EPISODIO 10
// «La casa che ricorda» — Atto II, standalone (vedi DESIGN-EPISODIO-10.md).
// Obiettivo CORSA ALLA DEMOLIZIONE: fissare la prova (fotografare il corpo
// murato) prima che il Muratore abbatta il muro. Mazzo con più insidie,
// meno spawn: l'orrore è ascoltare la casa che ricorda.

const LUOGHI10 = [
  { n: 1, nome: 'La Casa che Ricorda', req: 'Disponibile dall’inizio',
    art: 'artworks/La Casa della Corte.png',
    testo: 'Una modesta casa d’affitto appena ristrutturata: intonaco chiaro, odore di calce nuova. Di giorno pare una casa come le altre; di notte i muri sussurrano, e da una parete della camera al primo piano una voce detta, ostinata, sempre le stesse parole.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La parete che detta',
        testo: 'La parete della camera è più spessa delle altre di una spanna: battendola, in un punto suona vuota. Non è un muro pieno — è un muro DOPPIO, con un vano dietro. La voce non viene «dalla casa»: viene da quel vano. Qualcosa, o qualcuno, è murato lì da anni, e la calce che ricorda gli ha ridato la voce.' },
    ] },
  { n: 2, nome: 'La Corte della Faenza', req: 'Disponibile dall’inizio',
    art: 'artworks/Corte della Faenza.png',
    testo: 'Un cortile di case popolari strette attorno a un pozzo, panni stesi e chiacchiere di ballatoio. Qui tutti sanno tutto di tutti — e nessuno ha mai davvero creduto che Ada Malfanti se ne fosse andata di sua volontà. La conoscono da sempre. La piangono ancora.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'La vicina di Ada',
        testo: '«Una donna che scappa si porta via qualcosa. Ada lasciò tutto: l’anello, i vestiti, perfino le scarpe. Chi scappa scalza? Chi non è scappata: è stata portata via. E l’ha portata via lui, Corrado, che un anno dopo ha sposato la ragazza del fornaio. Abbandono, dissero. Io so cosa ho visto in faccia a quell’uomo.»' },
    ] },
  { n: 3, nome: 'L’Archivio Civico', req: 'Disponibile dall’inizio',
    art: 'artworks/L’Archivio Civico.png',
    testo: 'Un labirinto di scaffali e polvere: atti, licenze, denunce, piante catastali. Qui riposa, in un fascicolo del 1879, la menzogna ufficiale su Ada — e, nelle piante dell’edificio, la prova muta di una parete tirata su l’anno stesso in cui sparì.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La denuncia del 1879',
        testo: 'La grafia è nervosa, l’inchiostro premuto forte: non la mano di chi ha perso qualcuno, ma di chi recita una parte provata. E la data — quattro giorni dopo la scomparsa — è troppo presto: denuncia in fretta solo chi ha già bisogno che l’assenza sia ufficiale. Corrado Malfanti non cercava Ada: la dichiarava sparita perché sapeva che non sarebbe tornata.' },
    ] },
  { n: 4, nome: 'La Gendarmeria', req: 'Disponibile dall’inizio',
    art: 'artworks/La Gendarmeria.png',
    testo: 'Mezza vuota di notte: un piantone, un registro, le vecchie pratiche. Il brigadiere ricorda bene il caso Malfanti — lo ricorda come una delle tante cose chiuse troppo in fretta — e ha l’aria di chi aspettava da dieci anni qualcuno che gliene chiedesse conto.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il brigadiere',
        testo: '«Dieci anni fa Malfanti denunciò l’abbandono, noi archiviammo, e lui il mese dopo fece murare una parete “per umidità” — al primo piano, sul muro asciutto verso la corte. Nessuno collegò le due cose. Io sì, stanotte. Il colpevole è lui: l’ha uccisa e l’ha murata, e ha chiamato tutto “abbandono del tetto coniugale”.»' },
    ] },
  { n: 5, nome: 'Il Deposito del Muratore',
    req: 'Il deposito è chiuso e il muratore diffida degli sconosciuti: si apre solo a chi sa di cosa è fatta quella casa — la materia giusta, quella cara, nominata per nome.',
    art: 'artworks/Deposito del Muratore.png',
    testo: 'Un antro di sacchi di calce, secchi e attrezzi. Bortolo Sassi ci vive dentro il suo terrore: un uomo onesto che dieci anni fa fece una cosa disonesta per denaro, e che stanotte è costretto a farne una peggiore per paura. Sul banco, il libro mastro racconta tutto a chi sa leggere.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Gli ordini di Malfanti',
        testo: 'Il biglietto del ricatto fissa l’ora: «prima dell’alba, nell’intervallo delle ronde — entra dalla cantina e non farti sentire». Il muratore entrerà dal sottoscala e comincerà dal piano di sopra. Chi ha la pianta e conosce la parete doppia può andare dritto al vano senza cercarlo — e senza mettere il piede sul gradino marcio della scala.' },
    ] },
  { n: 6, nome: 'L’Intercapedine',
    req: 'Il vano è dietro un muro, e il muro è dietro una casa che nessuno vuole aprire: ci si arriva solo sapendo cosa custodisce — la parete di cui parlano tutti, quella che non tace.',
    art: 'artworks/Il vano murato.png',
    testo: 'Non è un luogo dove si va: è un luogo che si raggiunge sapendo. Dietro la parete doppia della camera, in un vano largo quanto un uomo, c’è Ada — e la calce del Borgo, che le ha tenuto la voce per dieci anni. L’unico posto della città dove una morta parla, e chiede solo di essere trovata.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La voce nel muro',
        testo: 'A posare la mano sull’intonaco fresco: si sente Ada, non come un fantasma ma come un solco inciso nella calce, ripetere le ultime parole che udì — «ferma di battere le mani» — e poi il silenzio del vano che si chiude. Non chiede vendetta: chiede solo di essere trovata prima che il muro cada di nuovo. La visione dura un rintocco, e sa di calce e di lacrime.' },
    ] },
  { n: 7, nome: 'La Casa del Vedovo',
    req: 'La casa di Malfanti è sbarrata e lui non apre agli estranei: cede solo davanti a chi nomina la parola vecchia con cui seppellì tutto — quella scritta nel registro del 1879.',
    art: 'artworks/Casa Malfanti.png',
    testo: 'Pulita, ordinata, borghese: la casa di chi ha ricostruito una vita sopra una tomba. Rosa, la seconda moglie, la tiene come uno specchio. Solo sul comò una cosa stona: la fede di Ada, lucidata e in mostra, il cimelio di un possesso che si spaccia per ricordo di un dolore.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'L’ignoranza di Rosa',
        testo: 'Rosa parla di Ada senza odio, con la pena sincera di chi crede a una storia triste: è innocente, e la sua innocenza è la prova più crudele della colpa di Corrado. Ma sul comò la fede di Ada è disposta con cura maniacale, girata verso la porta: non il ricordo di un abbandono — il cimelio di un possesso. Corrado non ha perso Ada. Se l’è tenuta, murata e in vista, per dieci anni.' },
    ] },
  { n: 8, nome: 'La Fornitura del Borgo',
    req: 'Il magazzino della fornitura tratta solo con chi sa cosa cercare: la materia buona, quella del quartiere dei pozzi, nominata per quello che è.',
    art: 'artworks/Fornitura del Borgo.png',
    testo: 'Un magazzino di materiali edili sull’orlo del quartiere dei pozzi: sabbia, pietra, calce. Da qui è partita la sabbia buona che ha dato voce alla casa — venduta a un privato che paga in anticipo, per lettera, e si firma con due sole lettere che il magazziniere non ha mai osato decifrare.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La commessa firmata «C.B.»',
        testo: 'Carta di pregio, filigrana della cartiera dei casi passati; la sabbia del Borgo pagata prima ancora di essere cavata; e la firma è un ricciolo solo, «C.B.», la stessa mano che affiora nei registri dell’inverno. La casa che parla non è un incidente della ristrutturazione: è un esperimento. Qualcuno sta scegliendo di che cosa è fatta Roccamora — e chi sceglie i materiali sceglie che cosa la città ricorderà.' },
    ] },
  { n: 9, nome: 'La Bottega del Fotografo',
    req: 'La bottega è chiusa a quest’ora, e il fotografo apre solo a chi gli spiega perché gli serva la notte: non un ritratto, ma qualcosa che resti anche quando la cosa ritratta non c’è più.',
    art: 'artworks/Bottega del Fotografo.png',
    testo: 'Sa di collodio e di chimica: lastre, cavalletti, un fondale dipinto. Il fotografo crede nella sua arte come in una missione — che un giorno si condanneranno gli assassini con la luce, non con le chiacchiere — e stanotte vi presta la macchina e il lampo per provarlo.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il lampo al magnesio',
        testo: 'La macchina è pesante ma pronta: cavalletto, otturatore, e una vaschetta di polvere di magnesio per il lampo. La regola è semplice: al buio della casa, un lampo fissa quello che la voce sola non basta a provare. Con la macchina, ogni istante passato a documentare l’intercapedine vale il doppio: la memoria effimera della casa diventa lastra permanente.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 10/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP10_INDIZI = LUOGHI10.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 10/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP10_TESTIMONI = LUOGHI10.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 10/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP10_REFERTI = LUOGHI10.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 10/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 6 spawn (garzoni), 8 insidie (NERVI, l'orrore della casa), 3
// crescendo (la casa trema, +Demolizione), 4 eventi. Più insidie, meno
// spawn: la scala di questo episodio (vedi DESIGN-EPISODIO-10.md §7).
const EP10_MINACCE = [
  { art: 'artworks/I garzoni del muratore.png', title: 'I Garzoni del Muratore', tipo: 'Malavita',
    flavor: 'Ragazzi pagati che non sanno cosa c’è nel muro. Solo che non dovete salire.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I garzoni del muratore.png', title: 'Il Manovale Spaventato', tipo: 'Malavita',
    flavor: 'Trema più di voi. Ma ha una famiglia da sfamare, e ordini da eseguire.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I garzoni del muratore.png', title: 'Ordini dal Deposito', tipo: 'Malavita',
    flavor: '«Non far salire nessuno», ha detto Bortolo. E loro obbediscono, subito.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/I garzoni del muratore.png', title: 'Chi Non Deve Salire', tipo: 'Malavita',
    flavor: 'Un braccio teso sulla scala. Non minacciano: sbarrano.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I garzoni del muratore.png', title: 'La Ronda del Cantiere', tipo: 'Malavita',
    flavor: 'Fanno il giro della casa con la lanterna cieca, come guardiani di un morto.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I garzoni del muratore.png', title: 'Il Fischio di Bortolo', tipo: 'Malavita',
    flavor: 'Un fischio dall’alto, e i garzoni convergono dove il padrone li vuole.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/La voce che urla.png', title: 'La Voce che Urla', tipo: 'Insidia',
    flavor: 'Il muro non sussurra più: urla, con la gola di dieci anni fa.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il nome sussurrato.png', title: 'Il Nome Sussurrato', tipo: 'Insidia',
    flavor: 'Tra i nomi dei morti, la casa sillaba il vostro. Come vi conosce?',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La parete che suda calce.png', title: 'La Parete che Suda Calce', tipo: 'Insidia',
    flavor: 'Gocce bianche colano dall’intonaco, come lacrime dense. La casa piange.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La voce che urla.png', title: 'L’Eco del Colpo', tipo: 'Insidia',
    flavor: 'Ogni mazzata di sopra rimbomba anche in voi, come un cuore che sbaglia.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/La ninnananna di ada.png', title: 'La Ninnananna di Ada', tipo: 'Insidia',
    flavor: 'Una nenia dolcissima dalla parete. È peggio dell’urlo: vi vuole restare.',
    effect: 'L’eroe con meno NERVI prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La parete che suda calce.png', title: 'Il Respiro nel Muro', tipo: 'Insidia',
    flavor: 'Dietro l’intonaco, qualcosa respira piano. Aspetta di essere trovato.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La voce che urla.png', title: 'Il Silenzio Improvviso', tipo: 'Insidia',
    flavor: 'D’un tratto la casa tace, del tutto. È il silenzio a gelarvi il sangue.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il nome sussurrato.png', title: 'La Casa Trema', tipo: 'Insidia',
    flavor: 'Un fremito percorre i muri: la casa sa che stanno per aprirla.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Il primo colpo di mazza.png', title: 'Il Primo Colpo di Mazza', tipo: 'Crescendo',
    flavor: 'Dall’intercapedine, la prima mazzata. Un pezzo di verità va in polvere.',
    effect: 'Aggiungete 1 segnalino Canto (la Casa che trema) E fate avanzare la DEMOLIZIONE di 1. Alla soglia: la casa è al colmo — ogni Fase Minaccia pesca 1 carta in più, per sempre.' },
  { art: 'artworks/La crepa si allarga.png', title: 'La Crepa si Allarga', tipo: 'Crescendo',
    flavor: 'Una crepa corre lungo la parete, e con lei corre il tempo che vi resta.',
    effect: 'Aggiungete 1 segnalino Canto (la Casa che trema) E fate avanzare la DEMOLIZIONE di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre.' },
  { art: 'artworks/Il muro geme.png', title: 'Il Muro Geme', tipo: 'Crescendo',
    flavor: 'Il muro cede con un lamento quasi umano. Ada sta per tornare alla luce — o alle macerie.',
    effect: 'Aggiungete 1 segnalino Canto (la Casa che trema) E fate avanzare la DEMOLIZIONE di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre.' },
  { art: 'artworks/Un raggio di luna.png', title: 'Un Raggio di Luna', tipo: 'Quiete',
    flavor: 'Dal lucernario, per un attimo, la luna. La casa, sotto, sembra quasi in pace.',
    effect: 'Nessun effetto. Tirate il fiato: anche una casa che ricorda, ogni tanto, riposa.' },
  { art: 'artworks/Una crepa mostra la via.png', title: 'Una Crepa Mostra la Via', tipo: 'Favore',
    flavor: 'Una fenditura nel muro rivela la stanza accanto: la casa vi apre una porta.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Calcinacci sul passo.png', title: 'Calcinacci sul Passo', tipo: 'Ostacolo',
    flavor: 'Detriti franati sbarrano il corridoio: si passa, ma piano.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Un mattone dallalto.png', title: 'Un Mattone dall’Alto', tipo: 'Danno',
    flavor: 'La demolizione fa piovere macerie: un mattone si stacca proprio sopra di voi.',
    effect: 'Un eroe a caso (chi arbitra tira) subisce 1 danno.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 10/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP10_OGGETTI = [
  { art: 'artworks/Macchina Fotografica.png', nome: 'La Macchina Fotografica', ref: 'E10-L9',
    fonte: 'Luogo 9 — La Bottega del Fotografo (entro le 21)',
    flavor: 'Cavalletto, otturatore, lampo al magnesio. Una voce svanisce all’alba; una lastra impressa resta per sempre.',
    effetto: 'All’intercapedine (T6), ogni azione Interagire per documentare il corpo fa avanzare la traccia PROVA di 2 invece di 1 (e senza prova NERVI).' },
  { art: 'artworks/Pianta del Restauro.png', nome: 'La Pianta del Restauro', ref: 'E10-L5',
    fonte: 'Luogo 5 — Il Deposito del Muratore',
    flavor: 'La parete doppia segnata a matita rossa. Sapete quale muro nasconde il vano — e quale gradino non calpestare.',
    effetto: 'All’inizio della spedizione saltate la tessera T2 (la Scala che Ripete) e la sua trappola: andate dritti verso l’intercapedine.' },
  { art: 'artworks/Ritratto di Ada.png', nome: 'Il Ritratto di Ada', ref: 'E10-L6',
    fonte: 'Luogo 6 — L’Intercapedine',
    flavor: 'Un dagherrotipo di dieci anni fa: una giovane donna che ride nella corte, viva. Guardarla cambia il terrore in pietà.',
    effetto: 'Chi porta il Ritratto ha +1 a tutte le prove NERVI provocate dalla casa (le carte insidia dell’episodio).' },
  { art: 'artworks/Ferro del Muratore.png', nome: 'Il Ferro del Muratore', ref: 'E10-L5',
    fonte: 'Luogo 5 — Il Deposito del Muratore',
    flavor: 'Un ferro da muratore arrugginito. Sembra l’arma di un delitto. È solo un attrezzo di un delitto.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Fede di Rosa.png', nome: 'La Fede di Rosa', ref: 'E10-L7',
    fonte: 'Luogo 7 — La Casa del Vedovo',
    flavor: 'La fede di Ada, che Corrado tiene in mostra come un trofeo. Prova la sua crudeltà, non il suo delitto.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 10/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP10_NEMICI = [
  { art: 'artworks/Il Muratore.png', title: 'Il Muratore',
    type: 'Il Bruto della Calce (Boss) — Episodio 10',
    rules: '{i}Bortolo «Malta» Sassi non è un assassino: è un muratore ricattato che, per denaro e per paura, dieci anni fa murò un corpo e stanotte è costretto a portarlo via. Cala la mazza sul muro come chi butta giù il proprio passato.{/i}{divider}Statistiche nel Bestiario. DEMOLISCE: se non inchiodato all’intercapedine, +2 alla traccia Demolizione invece di attaccare. «La casa ha già parlato» (D2): salta il primo colpo di demolizione.' },
  { art: 'artworks/Il Vedovo.png', title: 'Il Vedovo',
    type: 'Il Colpevole Disperato — Episodio 10',
    rules: '{i}Corrado Malfanti, il vedovo risposato, entrato di nascosto nella sua stessa casa per assistere alla cancellazione della sua colpa. Non ha più la freddezza di dieci anni fa: vede crollare la menzogna con l’intonaco.{/i}{divider}Nemico minore (appare in T4): intralcia chi documenta. «La casa ha già parlato» (D2): nominare Ada lo paralizza, rimosso dal gioco.' },
].map((n) => ({ ...n, file: `Episodio 10/Nemici/${n.title}` }));

const EP10 = [...LUOGHI10, ...EP10_INDIZI, ...EP10_TESTIMONI, ...EP10_REFERTI,
              ...EP10_MINACCE, ...EP10_OGGETTI, ...EP10_NEMICI];


// ============================================================ EPISODIO 11
// «Il censimento delle campane» — Atto II, mythology-light (vedi
// DESIGN-EPISODIO-11.md). Spedizione LA VIA DELLE GUGLIE: ascesa in quota con
// regola d'ambiente (vento/vertigine → NERVI). Obiettivo CATTURA VIVA del
// Caposquadra (overkill = filo perso). Torsione d'indagine: IN CHE ORDINE?

const LUOGHI11 = [
  { n: 1, nome: 'La Torre Civica', req: 'Disponibile dall’inizio',
    art: 'artworks/La Torre Civica.png',
    testo: 'Domina la piazza col suo quadrante e le sue campane. Ai suoi piedi, stanotte, un telo copre un morto; in cima, la cella campanaria da cui è caduto. È l’ultimo posto dove Emilio Ratti ha misurato qualcosa — e il primo dove le sue misure cominciano a raccontare, se qualcuno le rimette in fila.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La caduta',
        testo: 'Il parapetto della cella è alto al petto: non ci si sporge per sbaglio. E sul davanzale, nella polvere di calce, due impronte di mani larghe — non di Ratti, che le aveva magre — puntate come chi spinge, non come chi trattiene. Ratti non è caduto: è stato buttato. Da uno abituato a stare in quota, che sui tetti non ha vertigini.' },
    ] },
  { n: 2, nome: 'La Pensione dei Topografi', req: 'Disponibile dall’inizio',
    art: 'artworks/La Pensione dei Topografi.png',
    testo: 'Un alloggio dignitoso e provvisorio: sei uomini venuti da fuori, treppiedi negli angoli, cordelle appese. Si parla poco e si guarda la porta: da quando Ratti è morto, la squadra sa più di quanto dica, e il caposquadra sorride un sorriso che non arriva agli occhi.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il topografo più giovane',
        testo: '«Ratti aveva rimesso in ordine le sue pagine e aveva capito: tutte le misure puntano allo stesso posto. Voleva vendere il rilievo per conto suo. Speranza lo ha saputo — se perdiamo la commessa, siamo sei uomini in mezzo a una strada. Ieri sono saliti insieme alla Torre. È sceso solo Speranza. È stato lui. Ma non è un mostro: è uno che aveva più paura della fame che del sangue.»' },
    ] },
  { n: 3, nome: 'L’Archivio Civico', req: 'Disponibile dall’inizio',
    art: 'artworks/L’Archivio Civico.png',
    testo: 'Un labirinto di scaffali e polvere: catasti, reti idriche, piante del sottosuolo. Qui le misure sciolte di un morto trovano una carta su cui posarsi — e, posate, disegnano una freccia verso un punto che nessuna mappa civica ammette di conoscere.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il punto che non c’è',
        testo: 'Le misure di Ratti, ordinate e riportate sulla pianta, non descrivono la città: la triangolano verso un solo fuoco, un punto sotto la Cattedrale che nessuna mappa civica riconosce. Non è un censimento di campane: è un rilievo di puntamento. Qualcuno vuole sapere al palmo dove si trova quel vuoto — e da quali bocche di pietra, in tutta Roccamora, il suono ci arriverebbe sopra.' },
    ] },
  { n: 4, nome: 'La Camera dei Pesi', req: 'Disponibile dall’inizio',
    art: 'artworks/Camera dei Pesi.png',
    testo: 'L’ufficio che tara gli strumenti della città: bilance di ottone, regoli campione, e le tavole delle maree del molo aggiornate ogni giorno. È il posto meno misterioso di Roccamora — ed è proprio qui che le misure impossibili di Ratti trovano l’orologio che le mette in ordine.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'L’ordine delle misure',
        testo: 'Datando ogni pagina con la marea e l’accordatura, la sequenza si chiude: fontane, poi campanili, poi la Torre Civica per ultima, al tramonto di ieri. L’ultima misura è il puntamento verso la Cattedrale: è lì che Ratti capì il disegno, ed è lì che decise di vendersi. L’ordine non serve solo a voi: seguire i suoi passi vi dice per dove Speranza salirà e fuggirà stanotte — i tetti non hanno segreti, se sai in che ordine sono stati calpestati.' },
    ] },
  { n: 5, nome: 'Lo Studio Corrispondente',
    req: 'Lo studio è chiuso e sulla targa non c’è che una sigla: apre solo a chi sa nominare chi lo tiene in piedi — quegli uomini venuti da fuori, la ditta che paga.',
    art: 'artworks/Lo Studio Corrispondente.png',
    testo: 'Una porta con una targa nuova su una via qualunque: dentro, uno scrittoio, una lampada spenta, un timbro, e la posta che si accumula non aperta. Non uno studio: un recapito. Una scatola vuota che gira lettere e denaro verso un’altra scatola, e così via, fino a una mano che nessuno vede.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La commessa firmata',
        testo: 'Carta di pregio, filigrana della cartiera dei casi passati; il rilievo acustico di mezza Roccamora pagato prima ancora di cominciare; e la firma è un ricciolo solo, la stessa mano che affiora nei registri dell’inverno. «La squadra di Milano» non esiste: è un nome dipinto su una porta chiusa. Dietro c’è una penna sola, che compra misure come chi accorda uno strumento prima del concerto.' },
    ] },
  { n: 6, nome: 'Il Campanile di San Teodoro',
    req: 'Al campanile si sale, e a quest’ora la salita è chiusa: apre solo a chi sa che la misura buona si prende con la marea, quando l’acqua del molo è al suo segno.',
    art: 'artworks/Cella campanaria.png',
    testo: 'Si sale per una scala a chiocciola fino alla cella dei bronzi. Da lassù la città è una mappa e il vento è un padrone. Il vecchio campanaro accorda le campane al vespro, e in quell’ora — e solo in quella — le misure prese dall’alto tornano giuste. Di qui parte la via delle guglie.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La città che aspetta il suono',
        testo: 'In cima, con il vento che porta via le parole, per un istante le campane di tutta Roccamora paiono trattenere il fiato insieme, accordate sullo stesso vuoto. Non è una visione: è un calcolo che si fa carne. Qualcuno vuole che ogni bocca di bronzo della città, a un segnale, canti verso lo stesso punto sotto la Cattedrale. Il censimento non conta le campane: le prepara.' },
    ] },
  { n: 7, nome: 'Il Sagrato della Cattedrale',
    req: 'Il sagrato è aperto a tutti, ma quello che conta è sotto, e ci si arriva solo sapendo cosa cercare: il luogo segnato dalle misure, quello che sulle carte non esiste.',
    art: 'artworks/Il Sagrato della Cattedrale.png',
    testo: 'Di notte, una distesa di pietra silenziosa. Sotto, dicono, solo vecchie cisterne murate. Eppure ogni linea del taccuino di Ratti converge qui, su una lastra più nuova delle altre, senza nome: il punto che non c’è, il fuoco verso cui qualcuno vuole far cantare la città intera.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La colpa del morto',
        testo: 'Tutto sembra accusare Ratti: era lui a misurare con più zelo, lui a tornare di notte, lui a scrivere di «venderlo». Facile crederlo il regista del disegno. Ma un regista non si fa buttare da una torre dal proprio caposquadra: Ratti aveva solo capito troppo e voluto guadagnarci. La vera mano non misura e non sale: firma, paga, e resta pulita. Attenti a non prendere la vittima per il mandante.' },
    ] },
  { n: 8, nome: 'La Bottega del Cordaio',
    req: 'La bottega del cordaio è chiusa, e lui apre a quest’ora solo a chi gli parla del suo mestiere vero: le corde che tengono i bronzi, quelle che non devono cedere.',
    art: 'artworks/La Bottega del Cordaio.png',
    testo: 'Odora di canapa e di sego. Qui si fanno le funi che tengono i bronzi delle campane — e che, all’occorrenza, tengono un uomo sospeso nel vuoto. Il cordaio conosce la via alta meglio di chiunque: sa quali corde reggono, e sa che stanotte reggeranno o lasceranno cadere.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La corda che trattiene',
        testo: 'La corda del campanaro non è un attrezzo da scalata: è fatta per reggere il peso oscillante di un bronzo, e per anni di strappi. In quota fa due cose: vi assicura ai passaggi esposti (le trappole di caduta non vi feriscono) e vi dà di che afferrare un uomo aggrappato al cornicione senza precipitare con lui. Prendere Speranza vivo, senza questa corda, è quasi impossibile: il vento decide prima di voi.' },
    ] },
  { n: 9, nome: 'Il Ponteggio del Restauro',
    req: 'Il ponteggio dà accesso ai tetti, ed è sbarrato: ci si passa solo mostrando di sapere del morto e del suo taccuino — la faccenda delle misure che non tornano.',
    art: 'artworks/Il Ponteggio del Restauro.png',
    testo: 'Fascia il fianco della Torre come una gabbia di tavole e corde: è la via che i topografi usano per salire senza farsi vedere. Da qui, ieri sera, sono saliti in due; è tornato giù uno solo. E di qui, stanotte, comincia la salita verso la guglia e verso l’uomo che non deve morire prima di parlare.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il falso troppo perfetto',
        testo: 'Il tesserino è un falso di qualità impossibile per un falsario di strada: carta giusta, timbri autentici, sigilli veri. Solo un ufficio fa falsi così — o qualcuno che ha accesso agli originali. Ma è proprio la perfezione a tradirlo: è lasciato dove chi indaga lo trovi, non dove serva a lavorare. È un’esca, posata per far accusare un ministero che non c’entra. La penna che paga vi vuole a caccia della preda sbagliata.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 11/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP11_INDIZI = LUOGHI11.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 11/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP11_TESTIMONI = LUOGHI11.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 11/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP11_REFERTI = LUOGHI11.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 11/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 6 spawn (topografi lealisti), 7 insidie (vertigine/NERVI, il
// cuore dell'episodio), 4 crescendo (raffiche/la Bora, +vento), 4 eventi.
const EP11_MINACCE = [
  { art: 'artworks/I topografi lealisti.png', title: 'Il Topografo Ligio', tipo: 'Malavita',
    flavor: 'Crede alla disposizione ministeriale. Vi sbarra il passo con un treppiede alzato.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I topografi lealisti.png', title: 'Ordini del Caposquadra', tipo: 'Malavita',
    flavor: '«Non far salire nessuno stanotte», ha detto Speranza. E loro obbediscono.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I topografi lealisti.png', title: 'Chi Non Deve Salire', tipo: 'Malavita',
    flavor: 'Un braccio teso sul camminamento. Non minacciano: sbarrano.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/I topografi lealisti.png', title: 'La Ronda dei Tetti', tipo: 'Malavita',
    flavor: 'Fanno il giro delle guglie con la lanterna, come gatti pagati.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I topografi lealisti.png', title: 'Il Fischio dall’Alto', tipo: 'Malavita',
    flavor: 'Un fischio dalla guglia, e i lealisti convergono dove il padrone li vuole.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/La Claque.png', title: 'La Claque sul Cornicione', tipo: 'Malavita',
    flavor: 'Voci comprate che dall’alto vi coprono di insulti e vi fanno perdere l’equilibrio.',
    effect: 'L’eroe più avanzato prova NERVI (Facile): se fallisce, 1 sola azione al prossimo turno. (Se la Claque dell’Ep. 4 non è sopravvissuta, ignorate: pescate un’altra carta.)' },
  { art: 'artworks/Il vuoto sotto i piedi.png', title: 'Il Vuoto Sotto i Piedi', tipo: 'Insidia',
    flavor: 'Un passo, e sotto la suola non c’è più tetto: solo la piazza minuscola, in fondo.',
    effect: 'Ogni eroe su tessera ESPOSTA prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Leco dei bronzi.png', title: 'L’Eco dei Bronzi', tipo: 'Insidia',
    flavor: 'Una folata muove i battagli: un rintocco improvviso vi entra nelle ossa.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/La tegola che scivola.png', title: 'La Tegola che Scivola', tipo: 'Insidia',
    flavor: 'Un coppo si stacca sotto il piede e vola giù, contando i secondi fino a terra.',
    effect: 'L’eroe attivo prova VIGORE (Media): se fallisce, scivola — 1 danno e perde lo scatto. Con la Corda del Campanaro: nessuna prova.' },
  { art: 'artworks/Le mani sudate.png', title: 'Le Mani Sudate', tipo: 'Insidia',
    flavor: 'La presa si fa incerta proprio quando serve salda. Il vuoto lo sa.',
    effect: 'Ogni eroe su tessera ESPOSTA prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Lo sguardo in giu.png', title: 'Lo Sguardo in Giù', tipo: 'Insidia',
    flavor: 'Basta un attimo a guardare sotto, e la città gira come un gorgo.',
    effect: 'L’eroe con meno NERVI prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Il rintocco improvviso.png', title: 'Il Rintocco Improvviso', tipo: 'Insidia',
    flavor: 'Le campane suonano l’ora senza avviso, e il fragore vi stacca dal muro.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/La ringhiera che cede.png', title: 'La Ringhiera che Cede', tipo: 'Insidia',
    flavor: 'Vi appoggiate, e il ferro arrugginito cede con uno schianto sul vuoto.',
    effect: 'L’eroe più avanzato su tessera ESPOSTA prova NERVI (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Il primo refolo.png', title: 'Il Primo Refolo', tipo: 'Crescendo',
    flavor: 'Il vento cambia e comincia a spingere. È solo l’inizio: monterà.',
    effect: 'Aggiungete 1 segnalino Canto (la Bora) E alzate di 1 la difficoltà delle prove di vento, per sempre. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/Il vento gira.png', title: 'Il Vento Gira', tipo: 'Crescendo',
    flavor: 'Cambia lato senza avvisare: quello che vi teneva, ora vi spinge giù.',
    effect: 'Aggiungete 1 segnalino Canto (la Bora) E alzate di 1 la difficoltà delle prove di vento, per sempre. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/La bora dal mare.png', title: 'La Bora dal Mare', tipo: 'Crescendo',
    flavor: 'Dal mare arriva la bora, dura e fredda, che sui tetti non perdona.',
    effect: 'Aggiungete 1 segnalino Canto (la Bora) E alzate di 1 la difficoltà delle prove di vento, per sempre. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/La raffica sulla guglia.png', title: 'La Raffica sulla Guglia', tipo: 'Crescendo',
    flavor: 'La raffica investe la cima: chi è in bilico sul cornicione, adesso, rischia di volare.',
    effect: 'Aggiungete 1 segnalino Canto (la Bora) E alzate di 1 la difficoltà delle prove di vento. Se il Caposquadra è a 1 Ferita su tessera ESPOSTA, CADE nel vuoto (filo perso): tenetelo al riparo prima!' },
  { art: 'artworks/Il vento cade.png', title: 'Il Vento Cade', tipo: 'Quiete',
    flavor: 'Per un istante, l’aria si ferma. La città, sotto, sembra a portata di mano.',
    effect: 'Nessun effetto. Tirate il fiato: anche la bora, ogni tanto, riprende lena.' },
  { art: 'artworks/Un appiglio sicuro.png', title: 'Un Appiglio Sicuro', tipo: 'Favore',
    flavor: 'Una sporgenza di pietra buona, giusto dove serve: il tetto vi offre una mano.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Labbaino sbarrato.png', title: 'L’Abbaino Sbarrato', tipo: 'Ostacolo',
    flavor: 'Una botola incrostata di ghiaccio blocca il passaggio corto: si gira, ma piano.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Una tegola in testa.png', title: 'Una Tegola in Testa', tipo: 'Danno',
    flavor: 'Il vento stacca un coppo da più in alto e lo scaglia dritto sul gruppo.',
    effect: 'Un eroe a caso (chi arbitra tira) subisce 1 danno.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 11/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP11_OGGETTI = [
  { art: 'artworks/Corda del Campanaro.png', nome: 'La Corda del Campanaro', ref: 'E11-L8',
    fonte: 'Luogo 8 — La Bottega del Cordaio',
    flavor: 'Una fune da campane, fatta per reggere il peso oscillante di un bronzo. In quota, tiene un uomo meglio di qualsiasi ringhiera.',
    effetto: 'Assicurati: le trappole di caduta (T2, T4) non vi feriscono. Alla guglia, la cattura del Caposquadra a 1 Ferita è automatica (Interagire), senza prova FORZA e senza rischio di vederlo cadere.' },
  { art: 'artworks/Taccuino Ordinato.png', nome: 'Il Taccuino Ordinato', ref: 'E11-L4',
    fonte: 'Luogo 4 — La Camera dei Pesi (col Taccuino grezzo dalla Torre)',
    flavor: 'Le pagine sciolte di Ratti, rimesse in fila con la marea e le campane. Conoscete i suoi passi — e per dove Speranza salirà.',
    effetto: 'Il Caposquadra perde la scorciatoia sui tetti (non può saltare a tessere non adiacenti) e voi avete +1 a tutte le prove NERVI del vento.' },
  { art: 'artworks/Lanterna Cieca.png', nome: 'La Lanterna Cieca', ref: 'E11-L6',
    fonte: 'Luogo 6 — Il Campanile di San Teodoro',
    flavor: 'Una lanterna a specchio, che getta un fascio solo davanti a sé: la via alta al buio si legge un appiglio per volta.',
    effetto: 'Annulla il −1 alle prove di vento dovuto al buio sulle tessere ESPOSTE: la salita notturna diventa leggibile.' },
  { art: 'artworks/Tesserino Perfetto.png', nome: 'Il Tesserino Perfetto', ref: 'E11-L9',
    fonte: 'Luogo 9 — Il Ponteggio del Restauro',
    flavor: 'Un falso di qualità impossibile: carta giusta, timbri veri. Sembra la prova di un mandante ufficiale. È un’esca posata per depistare.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Colpa del Morto.png', nome: 'La Colpa del Morto', ref: 'E11-L7',
    fonte: 'Luogo 7 — Il Sagrato della Cattedrale',
    flavor: 'Gli appunti che paiono fare di Ratti il regista del disegno. Prova solo che aveva capito troppo — e voluto guadagnarci.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 11/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP11_NEMICI = [
  { art: 'artworks/Il Caposquadra.png', title: 'Il Caposquadra',
    type: 'Il Cacciatore di Tetti (Boss) — Episodio 11',
    rules: '{i}Ivo Speranza non è un cultista: è un caposquadra con sei uomini da sfamare e una commessa che è la sua sola salvezza. Quando Ratti volle vendersi, vide sparire il pane di tutti — e lo spinse dalla cella. Una colpa sola, per paura, non per vocazione.{/i}{divider}Statistiche nel Bestiario. CONOSCE I TETTI: ignora il vento, 1 scorciatoia per round. Va preso VIVO (a 1 Ferita: Interagire adiacente; overkill = CADE, filo perso). «Le misure ordinate» (D3): perde la scorciatoia, +1 NERVI agli eroi.' },
  { art: 'artworks/Il Topografo Lealista.png', title: 'Il Topografo Lealista',
    type: 'L’Ingannato in Buona Fede — Episodio 11',
    rules: '{i}Uno dei sei uomini della squadra: crede davvero di lavorare per un ministero, di fare un servizio alla città. Non sa nulla della penna che paga né del vuoto sotto la Cattedrale: sa solo che stanotte non deve far salire nessuno.{/i}{divider}Nemico minore (appare in T4): vi sbarra il camminamento. Cade con poco; non ha colpe, solo ordini.' },
].map((n) => ({ ...n, file: `Episodio 11/Nemici/${n.title}` }));

const EP11 = [...LUOGHI11, ...EP11_INDIZI, ...EP11_TESTIMONI, ...EP11_REFERTI,
              ...EP11_MINACCE, ...EP11_OGGETTI, ...EP11_NEMICI];


// ============================================================ EPISODIO 12
// «La seconda copia» — Atto II, chiusura d'atto (vedi DESIGN-EPISODIO-12.md).
// Spedizione INSEGUIMENTO: raggiungere il Corriere (Tullio Vela) prima che
// consegni le copie allo scambio. Torsione d'indagine: COME sono uscite le
// copie (esca: effrazione; verità: ordine interno autentico, sigilli intatti).

const LUOGHI12 = [
  { n: 1, nome: 'Il Palazzo del Lume', req: 'Disponibile dall’inizio',
    art: 'artworks/Il Palazzo del Lume.png',
    testo: 'La sede della Società: sala delle riunioni, archivio dei Frammenti, ritratti di presidenti morti. Stanotte è una scena del delitto senza delitto — nulla forzato, tutto copiato — e per la prima volta la vostra stessa casa è il luogo da indagare.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La perizia dei sigilli',
        testo: 'La ceralacca non è mai stata scaldata due volte, i punzoni sono i nostri, le serrature vergini. Non è entrato nessuno — è uscito qualcosa, per la porta principale. Chi ha copiato aveva le chiavi, o l’autorità di farsele dare. L’effrazione che tutti immaginano non c’è mai stata: guardare fuori è guardare il fantasma sbagliato mentre il vero ladro siede al vostro tavolo.' },
    ] },
  { n: 2, nome: 'La Casa dell’Archivista', req: 'Disponibile dall’inizio',
    art: 'artworks/La Casa dell’Archivista.png',
    testo: 'Modesta e ordinata come chi ha passato la vita a mettere carte in fila. Anselmo Godi, mezzo cieco e tremante, ci vive con la sua obbedienza: ha copiato i Frammenti per ordine, e l’ordine, giura, era autentico e protocollato.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il copista Godi',
        testo: '«Copio per la Società da quarant’anni, e conosco la mano del presidente come la mia. Questi ordini sono suoi: non imitati, suoi. Li ho eseguiti senza pensarci, come si esegue chi comanda in casa. Il colpevole, se volete un nome, sono io: ho copiato i Frammenti. Ma li ho copiati per ordine, e l’ordine era vero. Cercate un ladro e non lo troverete: non c’è stato nessun furto, solo un’obbedienza.»' },
    ] },
  { n: 3, nome: 'L’Ufficio del Fermo-Posta', req: 'Disponibile dall’inizio',
    art: 'artworks/L’Ufficio del Fermo-Posta.png',
    testo: 'Tiene la corrispondenza di chi non vuole un indirizzo: caselle numerate, ritiri notturni, nomi che non sono nomi. Qui una casella intestata a «B. Camillo» riceve, da mesi, le copie della vostra casa.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La casella di Camillo',
        testo: '«B. Camillo» non è una persona: è un’etichetta d’archivio, un nome così banale da sparire tra mille. La casella è pagata in anticipo, su carta di pregio, e ritira solo copie e Frammenti. Chi si nasconde dietro un nome che non è un nome non teme di essere trovato: teme solo di essere guardato in faccia.' },
    ] },
  { n: 4, nome: 'Il Banco dei Pegni', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Il Banco dei Pegni di Fossa compra e vende tutto ciò che la città impegna: qui è passata la campanella nuova col segno del Coro, e qui i confratelli, già in sospetto l’uno dell’altro, cominciano a contarsi le colpe.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il prestapegni',
        testo: '«Il ragazzo, Vela, non è nessuno: un corriere che porta quel che gli danno, senza leggere. Il vecchio della Società gli ha dato le copie con un biglietto timbrato, e lui le porta a Camillo come porterebbe pesce. Il colpevole non è il corriere e non è il ragazzo: è chi firma i biglietti timbrati. E quello, signori, firma con la vostra stessa penna.»' },
    ] },
  { n: 5, nome: 'La Loggia dei Confratelli',
    req: 'La loggia dei soci è riservata, e si apre solo a chi porta la notizia che nessuno vuole sentire: che nessuno ha scassinato, che i sigilli sono intatti.',
    art: 'artworks/La Loggia dei Confratelli.png',
    testo: 'La sala riservata dei soci della Società: stanotte è un nido di veleni, perché sigilli intatti vogliono dire che uno di loro ha aperto. Si cerca un traditore per non dover pensare l’impensabile.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La paranoia in casa',
        testo: 'La ricerca del falsario perfetto è così avvincente che nessuno considera l’alternativa più semplice: che la mano vera non abbia bisogno di imitarsi. Il sospetto reciproco è la vera vittoria di chi ha firmato: mentre i confratelli si contano le colpe, la penna resta al sicuro, perché il posto più nascosto per una firma è in cima all’ordine.' },
    ] },
  { n: 6, nome: 'Lo Scriptorium',
    req: 'Lo scriptorium dove si copiava è chiuso a chiave, e cede solo a chi sa nominare ciò che vi ha fatto lavorare: gli ordini in regola, timbrati e protocollati.',
    art: 'artworks/Lo Scriptorium.png',
    testo: 'La stanza dove Godi copiava: leggii, calamai, i Frammenti e le loro copie affiancati. Qui la mano che ricalca non trema — perché non ricalca: scrive la propria — e gli ordini protocollati fanno da alibi a chi li ha firmati.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La mano che non imita',
        testo: 'La mano della copia non IMITA quella dei Frammenti: è quella mano. Sicura, senza le micro-esitazioni di chi ricalca un modello. O il falsario è il più grande mai visto — capace di scrivere la mano altrui con più naturalezza del proprietario — o non è un falsario, e la mano è la sua. Gli ordini protocollati confermano il secondo: nessuno protocolla un tradimento; si protocolla un ordine che si vuole poter negare come «di routine».' },
    ] },
  { n: 7, nome: 'Il Deposito dei Sigilli',
    req: 'Il deposito dei punzoni è sbarrato, e si apre solo a chi torna a dire la cosa che inchioda il caso: che i sigilli sono intatti, non violati.',
    art: 'artworks/Il Deposito dei Sigilli.png',
    testo: 'Custodisce i punzoni di ceralacca della Società: tutti al loro posto, tutti autentici. È la prova muta che non c’è stato scasso — e, lasciato lì bene in vista, un grimaldello che vorrebbe farvi credere il contrario.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La casa che ascolta',
        testo: 'A stare fermi nel deposito, tra i punzoni della Società, si ha la sensazione netta di essere ascoltati da dentro le mura di casa. Non un fantasma: un orecchio umano, paziente, che da mesi sente ogni riunione, ogni deduzione, ogni Frammento letto ad alta voce. Il nemico non ha forzato la porta perché non ne ha bisogno: è già dentro, e vi ascolta contare le chiavi.' },
    ] },
  { n: 8, nome: 'Il Corpo di Guardia',
    req: 'Il corpo di guardia dei gendarmi amici apre solo a chi sa della casella segreta: il fermo-posta intestato a quel nome che non è un nome.',
    art: 'artworks/Il Corpo di Guardia.png',
    testo: 'I gendarmi amici della Società conoscono i canali di notte come le proprie tasche: sanno dove un fuggitivo si incanala e dove chiudere il passo. Il loro fischietto, al ponte giusto, vale più di ogni corsa.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il sergente dei canali',
        testo: '«Un inseguimento sull’acqua non si vince coi muscoli: si vince coi ponti. Ogni ponte coperto è un imbuto dove possiamo chiudere il passo, ma solo se ci arrivate quando lui ci passa. Fischiate al momento giusto e il corriere è vostro; fischiate tardi e avrete chiuso un varco sull’acqua vuota. Il Fischietto vale quanto il vostro tempismo.»' },
    ] },
  { n: 9, nome: 'Il Cimitero delle Barche',
    req: 'L’approdo dello scambio si trova solo sapendo cosa vi si scambia: il segno del Coro sulla campanella, e chi lo ha comprato.',
    art: 'artworks/Cimitero delle Barche.png',
    testo: 'L’ansa morta del canale, dove le chiatte vengono a marcire nella nebbia. È l’approdo dello scambio: qui il corriere consegna e il compratore anonimo ritira, senza mai mostrare un volto all’acqua nera.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'Le chiatte morte',
        testo: 'Nell’ansa morta, tra gli scafi rovesciati, l’acqua nera restituisce suoni che non dovrebbe: un frammento di canto, il tonfo di un remo, una voce che conta sottovoce. Qui finiscono le barche e, stanotte, un inseguimento. Se il corriere consegna, le copie della vostra casa entrano nel mondo e non tornano più; se lo fermate, portate a casa la carta — ma non la risposta al come.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 12/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP12_INDIZI = LUOGHI12.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 12/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP12_TESTIMONI = LUOGHI12.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 12/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP12_REFERTI = LUOGHI12.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 12/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 8 spawn (scorta comprata), 4 insidie (canale/NERVI), 5 crescendo
// (FUGA: la corrente aiuta il Corriere), 4 eventi. Picco d'atto.
const EP12_MINACCE = [
  { art: 'artworks/I bravi della scorta.png', title: 'I Bravi della Scorta', tipo: 'Malavita',
    flavor: 'Braccia pagate per rubarvi il round che serve ad agganciare il corriere.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I bravi della scorta.png', title: 'Uomini ai Varchi', tipo: 'Malavita',
    flavor: 'Ai ponti, alle calli: la scorta chiude ogni scorciatoia che non sia la loro.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I bravi della scorta.png', title: 'Il Blocco sul Ponte', tipo: 'Malavita',
    flavor: 'Un muro di spalle sull’arco coperto: passa il corriere, non voi.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/I bravi della scorta.png', title: 'Rincalzi dal Canale', tipo: 'Malavita',
    flavor: 'Una barca accosta e sbarca altri due: la scorta si rinfoltisce.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I bravi della scorta.png', title: 'Il Fischio della Malavita', tipo: 'Malavita',
    flavor: 'Un fischio dal buio, e i bravi convergono dove vogliono fermarvi.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/I bravi della scorta.png', title: 'Chi Copre la Fuga', tipo: 'Malavita',
    flavor: 'Non attaccano per ferire: attaccano per farvi perdere tempo.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I bravi della scorta.png', title: 'Il Palo all’Angolo', tipo: 'Malavita',
    flavor: 'Uno di vedetta all’angolo: segnala ogni vostra mossa al corriere.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I bravi della scorta.png', title: 'La Barca di Traverso', tipo: 'Malavita',
    flavor: 'Una barca messa di traverso vi taglia la via d’acqua: aggiratela.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/La corrente contraria.png', title: 'La Corrente Contraria', tipo: 'Insidia',
    flavor: 'La marea vi rema contro proprio mentre lui la ha a favore.',
    effect: 'L’eroe più avanzato prova VIGORE (Media): se fallisce, il Corriere guadagna terreno (FUGA +1).' },
  { art: 'artworks/La nebbia che inganna.png', title: 'La Nebbia che Inganna', tipo: 'Insidia',
    flavor: 'La foschia fa vedere il corriere dove non è: si insegue un fantasma.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il vicolo cieco.png', title: 'Il Vicolo Cieco', tipo: 'Insidia',
    flavor: 'La calle finisce sull’acqua: la via giusta era un’altra.',
    effect: 'L’eroe attivo perde il movimento extra questo turno (tornare indietro).' },
  { art: 'artworks/Lo scambio di barca.png', title: 'Lo Scambio di Barca', tipo: 'Insidia',
    flavor: 'Il corriere salta su un’altra barca pronta: un attimo, e ha cambiato passo.',
    effect: 'Il Corriere guadagna terreno: FUGA +1.' },
  { art: 'artworks/La corrente lo aiuta.png', title: 'La Corrente lo Aiuta', tipo: 'Crescendo',
    flavor: 'La marea gira a suo favore: la barca del corriere fila via.',
    effect: 'Aggiungete 1 segnalino Canto (la sede violata) E fate avanzare la FUGA di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più, per sempre.' },
  { art: 'artworks/Il corriere accelera.png', title: 'Il Corriere Accelera', tipo: 'Crescendo',
    flavor: 'Vi ha visti: piega sui remi e allunga il passo verso l’approdo.',
    effect: 'Aggiungete 1 segnalino Canto E fate avanzare la FUGA di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/Un varco si apre.png', title: 'Un Varco si Apre', tipo: 'Crescendo',
    flavor: 'Un ramo laterale del canale gli offre una scorciatoia.',
    effect: 'Aggiungete 1 segnalino Canto E fate avanzare la FUGA di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/La marea sale.png', title: 'La Marea Sale', tipo: 'Crescendo',
    flavor: 'L’acqua monta e spinge: chi va con la corrente vola, chi la rema contro annaspa.',
    effect: 'Aggiungete 1 segnalino Canto E fate avanzare la FUGA di 1. Alla soglia: ogni Fase Minaccia pesca 1 carta in più.' },
  { art: 'artworks/Le campane coprono i passi.png', title: 'Le Campane Coprono i Passi', tipo: 'Crescendo',
    flavor: 'I rintocchi della notte coprono il tonfo del remo: lo perdete d’orecchio.',
    effect: 'Aggiungete 1 segnalino Canto E fate avanzare la FUGA di 1. Se il Corriere raggiunge l’approdo (T6) con la FUGA piena, consegna: sconfitta.' },
  { art: 'artworks/La bonaccia.png', title: 'La Bonaccia', tipo: 'Quiete',
    flavor: 'Per un tratto l’acqua è ferma e nessuno guadagna: si rifiata sui remi.',
    effect: 'Nessun effetto. Tirate il fiato: anche la marea, per un istante, si ferma.' },
  { art: 'artworks/Un gondoliere amico.png', title: 'Un Gondoliere Amico', tipo: 'Favore',
    flavor: 'Un barcaiolo riconosce la Società e vi dà un passaggio veloce.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/La chiatta di traverso.png', title: 'La Chiatta di Traverso', tipo: 'Ostacolo',
    flavor: 'Una chiatta incagliata blocca il canale: si passa, ma piano.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Un colpo di gaffa.png', title: 'Un Colpo di Gaffa', tipo: 'Danno',
    flavor: 'Un bravo vi allunga una gaffa dal buio, mirando alla testa.',
    effect: 'Un eroe a caso (chi arbitra tira) subisce 1 danno.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 12/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP12_OGGETTI = [
  { art: 'artworks/Fischietto della Ronda.png', nome: 'Il Fischietto della Ronda', ref: 'E12-L8',
    fonte: 'Luogo 8 — Il Corpo di Guardia (entro le 21)',
    flavor: 'Il fischietto dei gendarmi amici. Al ponte giusto, un fischio chiude un varco in faccia al fuggitivo.',
    effetto: 'Ai ponti coperti (T2, T5), se il Corriere è in vista, tagliate la traccia FUGA di 2 (i gendarmi chiudono) o lo agganciate automaticamente.' },
  { art: 'artworks/Registro dei Ritiri.png', nome: 'Il Registro dei Ritiri', ref: 'E12-L3',
    fonte: 'Luogo 3 — L’Ufficio del Fermo-Posta',
    flavor: 'Il registro dei ritiri di «B. Camillo»: sapete a che ora e da dove parte il corriere.',
    effetto: 'La traccia FUGA iniziale parte più corta (−1 al vantaggio del Corriere) e all’inizio dell’inseguimento saltate la tessera T3 e la sua trappola.' },
  { art: 'artworks/Lanterna Sorda dei Canali.png', nome: 'La Lanterna Sorda dei Canali', ref: 'E12-L9',
    fonte: 'Luogo 9 — Il Cimitero delle Barche',
    flavor: 'Una lanterna cieca da barcaiolo, che buca la nebbia dell’ansa morta un braccio d’acqua per volta.',
    effetto: 'A T4 (il Canale della Nebbia) il Corriere NON guadagna il round di nebbia: il tratto resta leggibile.' },
  { art: 'artworks/Grimaldello Trovato.png', nome: 'Il Grimaldello Trovato', ref: 'E12-L7',
    fonte: 'Luogo 7 — Il Deposito dei Sigilli',
    flavor: 'Un grimaldello lasciato bene in vista. Pare la prova dello scasso, ma nessuna serratura è stata forzata.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lettera Anonima.png', nome: 'La Lettera Anonima', ref: 'E12-L5',
    fonte: 'Luogo 5 — La Loggia dei Confratelli',
    flavor: 'Una lettera che accusa un confratello a caso di essere la talpa. Semina paranoia; non prova nulla.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 12/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP12_NEMICI = [
  { art: 'artworks/Il Corriere.png', title: 'Il Corriere',
    type: 'Il Bersaglio in Fuga (Boss) — Episodio 12',
    rules: '{i}Tullio Vela è un ragazzo dei traghetti, un corriere pagato che non ha mai letto una riga di ciò che porta: prende quel che gli danno con un biglietto in regola e lo consegna. Non un cultista, non un assassino: un paio di braccia oneste al servizio di una firma disonesta.{/i}{divider}Statistiche nel Bestiario. FUGGE, non combatte: avanza verso lo scambio (FUGA +1 se non adiacente). Va AGGANCIATO (adiacenza + Interagire, o taglio ai ponti col Fischietto), non abbattuto. «Le porte aperte» (D3): FUGA iniziale dimezzata.' },
].map((n) => ({ ...n, file: `Episodio 12/Nemici/${n.title}` }));

const EP12 = [...LUOGHI12, ...EP12_INDIZI, ...EP12_TESTIMONI, ...EP12_REFERTI,
              ...EP12_MINACCE, ...EP12_OGGETTI, ...EP12_NEMICI];


// ============================================================ EPISODIO 13
// «Carta di pregio» — Atto III (apertura), mythology (vedi
// DESIGN-EPISODIO-13.md). Trasferta al Molino delle Carte: salvare i registri
// dei noli prima del rogo (soglia-Canto), mentre il Notaio sfugge. Boss: il
// Sorvegliante. Torsione d'indagine: «il testimone che non c'è più».

const LUOGHI13 = [
  { n: 1, nome: 'La Stazione delle Carrozze', req: 'Disponibile dall’inizio',
    art: 'artworks/La Stazione delle Carrozze.png',
    testo: 'Lo snodo dei trasporti di terraferma: rimesse, cavalli, il quadro dei noli. Da qui parte, ogni notte, il nolo puntuale della carta di pregio; e qui lavorava il capo-catena, prima che il canale se lo prendesse.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il capostazione',
        testo: '«Quel nolo puntuale lo intesta sempre lo stesso studio, quello del Notaio Rasca. Carta in regola, paga prima. E il capo-catena, buon’anima, aveva cominciato a farsi domande su una cosa sola: che la carrozza del nolo, certe notti, faceva una fermata in più. Al Palazzo del Lume. La vostra sede. Poi è annegato.»' },
    ] },
  { n: 2, nome: 'Lo Studio del Notaio', req: 'Disponibile dall’inizio',
    art: 'artworks/Lo Studio del Notaio.png',
    testo: 'Ordine e cortesia: scaffali di pratiche, bolli, ceralacca. Ogni carta è in regola, ogni pagamento tracciato. È il posto più pulito della città — ed è proprio la sua pulizia impeccabile a puzzare di bruciato.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La cortesia del Notaio',
        testo: 'Rasca non commette errori: ogni carta in regola, ogni pagamento puntuale. È la perfezione a tradirlo — nessun cliente onesto è così invisibile. È l’uomo del «benefattore che ama la lirica» di due inverni fa: il legale che dà un indirizzo di carta a chi non vuole un volto. Non lo prenderete stanotte; ma sapere che è lui a tenere la penna del nolo è metà della caccia.' },
    ] },
  { n: 3, nome: 'L’Ufficio del Fermo-Posta', req: 'Disponibile dall’inizio',
    art: 'artworks/L’Ufficio del Fermo-Posta.png',
    testo: 'Uno dei tre che comprano la carta col giglio: caselle numerate, ritiri riservati. La carta pregiata costa un occhio, e la compra solo chi ha da scrivere cose che devono sembrare autentiche — o esserlo.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'I tre compratori',
        testo: 'La carta col giglio la comprano in tre: il vescovado, la Prefettura, e questa casella riservata. Due sono facciate rispettabili che giustificano l’acquisto; la terza è il vero destinatario. Chi vuole nascondere una carta la fa comprare anche da chi non ne ha bisogno: così la sua non spicca. Il fermo-posta è la foglia nella foresta.' },
    ] },
  { n: 4, nome: 'La Dogana Vecchia', req: 'Disponibile dall’inizio',
    art: 'artworks/La Dogana Vecchia.png',
    testo: 'Timbra le bolle di transito delle risme dal molino fuori porta. Roba pulita, dazio pagato; troppo pulita. È qui che il capo-catena veniva a confrontare i noli, e qui che aveva copiato l’ultima bolla prima di finire in acqua.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il doganiere',
        testo: '«Ve lo metto a verbale perché ormai è morto lui e non io: il capo-catena aveva capito che la carrozza del nolo della carta, nelle notti giuste, fa una fermata in più prima di lasciare la città. Al Palazzo del Lume. La stessa carrozza che porta la carta di quel signore riservato porta anche la carta della vostra Società. È annegato non per quello che aveva rubato, per quello che aveva contato.»' },
    ] },
  { n: 5, nome: 'La Casa del Capo-Catena',
    req: 'La casa del morto è sigillata dai gendarmi, e si apre solo a chi sa perché è morto — la parola che tutti dicono a bassa voce, l’annegato che sapeva nuotare.',
    art: 'artworks/La Casa del Capo-Catena.png',
    testo: 'La stanza di un uomo che aveva cominciato a contare: fogli, colonne di date, un mezzo diario, e una riga sottolineata due volte. Non una confessione — un calcolo, quello per cui è annegato. I morti non depongono, ma lasciano il calco.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La deposizione mai resa',
        testo: 'A leggere i suoi fogli nell’ordine giusto, la voce del capo-catena torna come da sotto l’acqua: il calco di una testimonianza che nessuno ha raccolto in tempo. Vi dice tre cose — che la carta di C.B. viaggia sulla carrozza della vostra sede; a che ora, stanotte, daranno fuoco ai registri; e per dove passa la guardia. È tutto quello che sarebbe morto in tribunale, se fosse arrivato vivo. Fatelo arrivare voi.' },
    ] },
  { n: 6, nome: 'La Cancelleria Vescovile',
    req: 'La cancelleria del vescovado riceve solo chi sa nominare la merce che vi si compra a caro prezzo: la carta pregiata col segno del giglio.',
    art: 'artworks/La Cancelleria Vescovile.png',
    testo: 'Compra la carta col giglio alla luce del sole, per gli atti solenni della diocesi: il compratore di facciata perfetto e involontario. Finché esiste chi la compra per forza, chi la compra di nascosto non spicca.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il compratore di facciata',
        testo: 'Il vescovado compra la carta col giglio per atti che la richiedono davvero: è la copertura perfetta, e involontaria. Finché esistono compratori legittimi, il compratore illegittimo non spicca. Rasca ha scelto bene la sua foresta: tre alberi identici, e solo uno nasconde il nido.' },
    ] },
  { n: 7, nome: 'La Prefettura',
    req: 'La Prefettura apre i suoi registri solo a chi sa del trasporto che non salta mai: il nolo pagato in anticipo, sempre in orario.',
    art: 'artworks/La Prefettura.png',
    testo: 'Custodisce i registri di ogni nolo autorizzato: è qui che il calcolo del capo-catena trova conferma nero su bianco. Sessant’anni di forniture allo stesso «C.B.», e una carrozza che, certe notti, fa una fermata di troppo.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'Il registro dei noli',
        testo: 'Sessant’anni di forniture allo stesso cliente storico, pagate al centesimo e sempre in orario, intestate con due iniziali: «C.B.». E il nolo parte con la carrozza che, certe notti, serve anche il Palazzo del Lume. Liquidatelo pure come coincidenza dei vetturini — ma i vetturini non sanno di esserlo. Chi paga la carta di C.B. paga da dove pagate voi: è dentro casa, e da sessant’anni.' },
    ] },
  { n: 8, nome: 'Il Deposito delle Risme',
    req: 'Il deposito dove arrivano le risme è chiuso a quest’ora, e apre solo a chi sa da dove vengono: l’opificio fuori le mura che fa la filigrana.',
    art: 'artworks/Il Deposito delle Risme.png',
    testo: 'Riceve le risme dal molino fuori porta e le smista ai tre compratori: bolle, quantità, date. Qui, in un armadio, una cassetta di latta stagna — la sola cosa che, stanotte, può portar via delle carte sane da un molino in fiamme.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La cassetta stagna',
        testo: 'La cassetta di latta è a doppia parete, guarnizione di sughero: tiene fuori l’acqua e regge le fiamme il tempo di attraversare una stanza in fiamme. In un molino di stracci pronto a bruciare, è la differenza tra portare a casa i registri e portare a casa la cenere. Riempitela al torchio, chiudetela, e uscite.' },
    ] },
  { n: 9, nome: 'Il Molino delle Carte',
    req: 'Il molino è due ore fuori città, e non ci si arriva per caso: ci si va sapendo che è lì che nasce la carta col giglio, dietro le mura, sull’acqua.',
    art: 'artworks/Il Molino delle Carte.png',
    testo: 'Sull’acqua, fuori le mura: rogge, la grande macina, i magazzini di stracci per la pasta. È qui che si fa la filigrana col giglio, e qui che stanotte qualcuno vuole ridurre in cenere i registri prima che li leggiate.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La carta che aspetta la fiamma',
        testo: 'Nel molino silenzioso, la macina gira ancora piano e l’acqua della roggia parla da sola. Tra i telai coi fogli appesi, per un istante pare di sentire il fruscio di sessant’anni di carta scritta con la stessa mano: lettere, ordini, sentenze del Coro, tutto uscito da questa filigrana. Stanotte qualcuno vuole ridurla in cenere prima che la leggiate. Arrivate al torchio, prendete i registri, e non guardate il fuoco: guardate la porta.' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 13/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP13_INDIZI = LUOGHI13.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 13/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP13_TESTIMONI = LUOGHI13.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 13/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP13_REFERTI = LUOGHI13.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 13/Referti/${a.soggetto}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 7 spawn (uomini del molino), 6 insidie (ambiente: roggia/macine/
// telai/polvere), 4 crescendo (FUOCO: soglia-rogo), 4 eventi.
const EP13_MINACCE = [
  { art: 'artworks/Gli uomini del molino.png', title: 'La Guardia al Cancello', tipo: 'Malavita',
    flavor: 'Uomini pagati per sorvegliare un molino e non fare domande. Stanotte hanno ordini.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/Gli uomini del molino.png', title: 'Ordini dal Sorvegliante', tipo: 'Malavita',
    flavor: 'Il Sorvegliante li schiera dove servono: tra voi e il torchio.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/Gli uomini del molino.png', title: 'Chi Sbarra la Strada', tipo: 'Malavita',
    flavor: 'Non vogliono uccidervi: vogliono farvi perdere il round che vi serve.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Gli uomini del molino.png', title: 'Rincalzi dalle Macine', tipo: 'Malavita',
    flavor: 'Altri due sbucano da dietro la grande ruota, chiave inglese in pugno.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/Gli uomini del molino.png', title: 'La Ronda del Cortile', tipo: 'Malavita',
    flavor: 'Il giro di guardia rientra proprio adesso, lanterna alta.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi.' },
  { art: 'artworks/Gli uomini del molino.png', title: 'Il Fischio del Sorvegliante', tipo: 'Malavita',
    flavor: 'Un fischio secco, e gli uomini convergono dove il capo li vuole.',
    effect: 'Piazzate 1 Sgherro sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Gli uomini del molino.png', title: 'Chi Copre la Fuga del Notaio', tipo: 'Malavita',
    flavor: 'Mentre la carrozza si scalda, qualcuno resta a coprirla. Contro di voi.',
    effect: 'Piazzate 1 Sgherro sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/La corrente della roggia.png', title: 'La Corrente della Roggia', tipo: 'Insidia',
    flavor: 'L’acqua nera precipita verso la ruota e vuole prendersi chi scivola.',
    effect: 'L’eroe attivo prova VIGORE/DESTREZZA (Media): se fallisce, cade in acqua — 1 round perso a risalire. Con il Taccuino del Capo-Catena: a Facile.' },
  { art: 'artworks/Lingranaggio delle macine.png', title: 'L’Ingranaggio delle Macine', tipo: 'Insidia',
    flavor: 'La macchina non distingue amici da nemici: un lembo di giacca, e ti tira.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, 1 danno (spinto contro gli ingranaggi).' },
  { art: 'artworks/La passerella scivolosa.png', title: 'La Passerella Scivolosa', tipo: 'Insidia',
    flavor: 'Assi viscide sopra la corrente: un passo troppo lungo e sei sotto.',
    effect: 'L’eroe attivo prova DESTREZZA (Media): se fallisce, perde il movimento extra questo turno.' },
  { art: 'artworks/La polvere che soffoca.png', title: 'La Polvere che Soffoca', tipo: 'Insidia',
    flavor: 'La polvere di stracci riempie i polmoni: si tossisce, si vede meno.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il telaio che cade.png', title: 'Il Telaio che Cade', tipo: 'Insidia',
    flavor: 'Un telaio carico di fogli si stacca dall’alto e piomba giù.',
    effect: 'L’eroe più avanzato prova DESTREZZA (Media): se fallisce, 1 danno.' },
  { art: 'artworks/Lo straccio in fiamme.png', title: 'Lo Straccio in Fiamme', tipo: 'Insidia',
    flavor: 'Uno straccio prende e vola, portando il fuoco dove non deve.',
    effect: 'Se la soglia-fuoco è superata, l’eroe attivo prova NERVI (Media) o 1 danno; altrimenti nessun effetto (ancora).' },
  { art: 'artworks/Odore di fumo.png', title: 'Odore di Fumo', tipo: 'Crescendo',
    flavor: 'Un filo di fumo dai magazzini: hanno cominciato. Poco, per ora.',
    effect: 'Aggiungete 1 segnalino Canto (il Fuoco). Alla soglia-fuoco (Canto 4, 5 col Taccuino): i magazzini bruciano — vedi Soluzione. Alla soglia (3): +1 carta Minaccia per Fase, per sempre.' },
  { art: 'artworks/Il primo focolaio.png', title: 'Il Primo Focolaio', tipo: 'Crescendo',
    flavor: 'Le fiamme trovano gli stracci e cominciano a correre lungo le pile.',
    effect: 'Aggiungete 1 segnalino Canto (il Fuoco). Alla soglia-fuoco, l’Essiccatoio e il Torchio sono in fiamme (prova NERVI o 1 danno ad attraversarli).' },
  { art: 'artworks/I magazzini bruciano.png', title: 'I Magazzini Bruciano', tipo: 'Crescendo',
    flavor: 'Un boato morbido: i magazzini di stracci sono una torcia sola.',
    effect: 'Aggiungete 1 segnalino Canto (il Fuoco). Da ora ogni round al torchio senza la Cassetta Stagna DANNEGGIA i registri (vittoria parziale).' },
  { art: 'artworks/Il tetto prende.png', title: 'Il Tetto Prende', tipo: 'Crescendo',
    flavor: 'Il fuoco sale alle travi: il molino non è più un posto dove restare.',
    effect: 'Aggiungete 1 segnalino Canto (il Fuoco). Se siete ancora dentro con i registri non salvati, il round dopo la prova è perduta: uscite o chiudete la Cassetta ORA.' },
  { art: 'artworks/La macina si ferma.png', title: 'La Macina si Ferma', tipo: 'Quiete',
    flavor: 'Qualcuno stacca la ruota: per un attimo, silenzio. Si sente il proprio fiato.',
    effect: 'Nessun effetto. Tirate il fiato: anche un molino che brucia, per un istante, tace.' },
  { art: 'artworks/Una porta dacqua aperta.png', title: 'Una Porta d’Acqua Aperta', tipo: 'Favore',
    flavor: 'Una paratia lasciata aperta rivela un passaggio di servizio.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Balle di stracci sul passo.png', title: 'Balle di Stracci sul Passo', tipo: 'Ostacolo',
    flavor: 'Balle di stracci rovesciate ingombrano il corridoio: si passa, ma piano.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Una trave in fiamme.png', title: 'Una Trave in Fiamme', tipo: 'Danno',
    flavor: 'Una trave accesa si stacca dal soffitto e piomba sul gruppo.',
    effect: 'Un eroe a caso (chi arbitra tira) subisce 1 danno.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 13/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP13_OGGETTI = [
  { art: 'artworks/Cassetta Stagna.png', nome: 'La Cassetta Stagna', ref: 'E13-L8',
    fonte: 'Luogo 8 — Il Deposito delle Risme (entro le 20)',
    flavor: 'Latta a doppia parete, guarnizione di sughero: tiene fuori l’acqua e regge le fiamme il tempo di attraversare una stanza che brucia.',
    effetto: 'Al torchio (T6), i registri messi nella Cassetta sono SALVI dal fuoco: vittoria piena a prescindere dalla soglia-fuoco. Senza, se il fuoco è alto, ogni round li danneggia.' },
  { art: 'artworks/Lasciapassare del Nolo.png', nome: 'Il Lasciapassare del Nolo', ref: 'E13-L1',
    fonte: 'Luogo 1 — La Stazione delle Carrozze',
    flavor: 'La bolla di carico del nolo: chi la mostra al cancello è «gente del trasporto», non un intruso.',
    effetto: 'All’inizio della spedizione saltate lo sbarramento del cortile (T1) e la sua guardia: entrate senza combattere.' },
  { art: 'artworks/Taccuino del Capo-Catena.png', nome: 'Il Taccuino del Capo-Catena', ref: 'E13-L5',
    fonte: 'Luogo 5 — La Casa del Capo-Catena',
    flavor: 'I suoi conti rimessi in ordine: la deposizione che non ha fatto in tempo a rendere — l’ora del rogo e i turni della guardia.',
    effetto: 'Alza di 1 la soglia-fuoco (arrivate col fuoco più lontano) e rende Facili le prove d’ambiente del molino (roggia, macine, telai).' },
  { art: 'artworks/Lettera di Raccomandazione.png', nome: 'La Lettera di Raccomandazione', ref: 'E13-L6',
    fonte: 'Luogo 6 — La Cancelleria Vescovile',
    flavor: 'Una lettera che accredita un signore presso «ambienti che contano». Cortesia di facciata, non porta a C.B.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Timbro del Notaio.png', nome: 'Il Timbro del Notaio', ref: 'E13-L2',
    fonte: 'Luogo 2 — Lo Studio del Notaio',
    flavor: 'Il timbro di studio di Rasca, quello che finisce su ogni bolla. È di routine: non lo inchioda.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 13/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP13_NEMICI = [
  { art: 'artworks/Il Sorvegliante del Molino.png', title: 'Il Sorvegliante del Molino',
    type: 'Il Guardiano della Filiera (Boss) — Episodio 13',
    rules: '{i}Ezio Fonda è il capo della sicurezza della filiera: un uomo pagato per sorvegliare un molino e non fare domande, che stanotte difende un rogo che non ha deciso lui, mentre il suo padrone sale in carrozza e lo scarica.{/i}{divider}Statistiche nel Bestiario. Nessuna debolezza-oggetto. Guarda il torchio: va superato/abbattuto per i registri. «Il nome del Notaio» (D2): gridargli che Rasca è già fuggito gli fa saltare un attacco.' },
  { art: 'artworks/Il Notaio.png', title: 'Il Notaio',
    type: 'Il Ricorrente dell’Atto (non si prende) — Episodio 13',
    rules: '{i}Ludovico Rasca dà un indirizzo di carta a chi non vuole un volto: intesta, protocolla, paga, e resta pulito. Stanotte è venuto a far sparire i registri che lo legano a C.B.{/i}{divider}NON combatte. Appare in T4, ordina il rogo, e alla fine del round dopo fugge in carrozza (rimosso): è il ricorrente dell’Atto III. Inseguirlo = round perso, il fuoco avanza. Puntate ai registri.' },
].map((n) => ({ ...n, file: `Episodio 13/Nemici/${n.title}` }));

const EP13 = [...LUOGHI13, ...EP13_INDIZI, ...EP13_TESTIMONI, ...EP13_REFERTI,
              ...EP13_MINACCE, ...EP13_OGGETTI, ...EP13_NEMICI];


// ===================================================================== EP14
// «Il rivale» — Atto III, standalone che si rivela collegato (vedi
// DESIGN-EPISODIO-14.md). L'episodio È un'esca: si smaschera l'ARREDO della
// colpa di Braga (M. prepara il falso dell'Ep.15). Spedizione: i tetti del
// Corso, negoziato col Primo Gatto (tratta a 1 Ferita). Torsione d'indagine:
// «l'inventario al contrario» (ciò che è tornato IN PIÙ).

const LUOGHI14 = [
  { n: 1, nome: 'La Villa-Museo di Braga', req: 'Disponibile dall’inizio',
    art: 'artworks/La Villa-Museo di Braga.png',
    testo: 'Un tempio della criminologia positivista: vetrine di cimeli del delitto, le lastre fonografiche coi mostri celebri, e ovunque i guanti bianchi del professore, che non tocca nulla a mani nude. Un uomo che vive per non lasciare tracce.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il professor Braga',
        testo: '«Ve lo dico da criminologo, non da derubato: guardate cosa manca, sì, ma guardate meglio cosa resta. Un ladro che restituisce è una contraddizione in termini. Non era un furto: era un pretesto per mettermi in casa qualcosa. Ho i guanti da quarant’anni per non lasciare traccia — qualcuno vuole che ne lasci una. Chiedetevi chi, tra quelli che mi conoscono da una vita.»' },
    ] },
  { n: 2, nome: 'Gazzetta di Roccamora', req: 'Disponibile dall’inizio',
    art: 'artworks/Gazzetta di Roccamora.png',
    testo: 'La redazione vive di indiscrezioni e duelli, e quello di trent’anni tra M. e Braga è il piatto forte di Ranuzzi. Qui si sa chi cammina sui tetti, chi paga chi, e quali storie qualcuno vuole vedere stampate.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Il cronista Ranuzzi',
        testo: '«Fiuto le storie, e questa puzza. Due criminologi rivali, un furto che torna indietro, e la città che aspetta solo di vedere uno dei due nel fango. Non chiedetevi chi ha rubato — quello lo so io, i gatti del Corso — ma chi VUOLE questa storia sui giornali. Una storia così non nasce da sola: qualcuno la sta scrivendo, e la scrive perché finisca su Braga.»' },
    ] },
  { n: 3, nome: 'Il Banco dei Pegni', req: 'Disponibile dall’inizio',
    art: 'artworks/Banco dei Pegni.png',
    testo: 'Il termometro della malavita: ci passa tutto ciò che è stato rubato, prima o poi. Stavolta è passata roba che torna indietro imballata e pulita — un controsenso che al gestore, che di refurtiva se ne intende, non torna affatto.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'La refurtiva imballata',
        testo: 'La refurtiva che passa da un banco dei pegni è merce da svendere, sporca e a lotti. Questa no: è tornata inventariata, pulita, quasi catalogata — come se qualcuno avesse voluto che la Gendarmeria la trovasse in perfetto ordine, per poterla verbalizzare comodamente. Un ladro non imballa la refurtiva. Un regista sì.' },
    ] },
  { n: 4, nome: 'La Gendarmeria', req: 'Disponibile dall’inizio',
    art: 'artworks/La Gendarmeria.png',
    testo: 'Tiene la denuncia di Braga e l’inventario del furto. Un caso quasi chiuso — refurtiva rientrata — se non fosse per quelle tre righe in più nella colonna del restituito, che nessuno sa spiegare e che qualcuno preferirebbe archiviare in fretta.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'L’inventario che non torna',
        testo: 'Il verbale è impietoso nella sua noia: colonna «sottratto», dodici voci; colonna «restituito», quindici. Tre righe in più. Nessun ladro al mondo restituisce di più di quanto ha preso. Quelle tre righe — un sigillo con le iniziali di Braga, due ricevute intestate a lui — non sono refurtiva: sono un impianto. Qualcuno sta costruendo, riga per riga d’inventario, la colpevolezza del professore.' },
    ] },
  { n: 5, nome: 'Il Ricettatore',
    req: 'La bottega del ricettatore apre solo di notte, e solo a chi sa nominare la stranezza che gira in città: la refurtiva che, invece di sparire, è tornata.',
    art: 'artworks/Il Ricettatore.png',
    testo: 'Un buco che apre solo di notte, dove la refurtiva cambia mani. Stavolta il suo mestiere è girato al contrario: pagato per restituire, non per comprare, e per aggiungere alle casse del professore oggetti che qualcun altro gli ha messo in mano.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'Il furto al contrario',
        testo: 'Un ricettatore pagato per restituire è il mondo alla rovescia: non deve esistere. Eppure eccolo, con in tasca l’elenco di ciò che ha rimesso nelle casse di Braga — più di quanto ne fosse uscito. Chi ha ordinato questo non voleva la refurtiva né il denaro: voleva usare i ladri come corrieri della colpa, e un ricettatore come sarto. L’oro vecchio e la carta col giglio dicono di chi è la mano. La stessa di sempre.' },
    ] },
  { n: 6, nome: 'Lo Studio del Perito',
    req: 'Lo studio del vecchio perito rivale apre a chi conosce la faida accademica che lo rode: il duello di trent’anni tra le due scuole del delitto.',
    art: 'artworks/Lo Studio del Perito.png',
    testo: 'La tana di un rancore accademico vecchio di trent’anni: pareti di attestati mai bastati, e l’odio per Braga come unica passione rimasta. Movente da vendere, ma né oro né uomini: il sospetto perfetto, e perfettamente innocente.',
    approfondimenti: [
      { tipo: 'Osservazione', soggetto: 'Il rivale che non c’entra',
        testo: 'Coda è l’esca perfetta: movente enorme, astio autentico, una lettera che sembra una confessione. Ma un movente non è una mano. Chi ha comprato i gatti, pagato un ricettatore e falsificato un sigillo ha risorse e freddezza che a un perito invidioso mancano del tutto. La rabbia di Coda è vera e inutile: serve solo a farvi perdere una notte guardando dalla parte sbagliata. Come è stata messa lì apposta.' },
    ] },
  { n: 7, nome: 'Il Faldone d’Inventario',
    req: 'L’archivio della Gendarmeria tira fuori il faldone giusto solo a chi sa esattamente cosa cercare: le lastre sparite, e ciò che è tornato al loro posto.',
    art: 'artworks/L’Archivio della Gendarmeria.png',
    testo: 'Dove le cose diventano vere: una volta a verbale, un oggetto esiste, anche se è falso. Qui il Sigillo «C.B.» trovato nelle casse di Braga è ormai un fatto agli atti — la prima pietra, involontaria e perfetta, del falso che verrà.',
    approfondimenti: [
      { tipo: 'Referto', soggetto: 'La prima pietra del falso',
        testo: 'Il Verbale d’Inventario è il capolavoro involontario del falsario: non ha dovuto corrompere nessun gendarme, gli è bastato far trovare gli oggetti giusti e lasciare che la burocrazia li rendesse reali. Il Sigillo «C.B.» è ora un fatto agli atti: quando arriverà un dossier che accusa Braga, questo faldone sarà la sua prima conferma. Non si costruisce un colpevole con una bugia, ma con verità piccole e vere, messe dove servono.' },
    ] },
  { n: 8, nome: 'Il Covo dei Gatti',
    req: 'Il covo dei ladri di grondaia non si trova per strada: ci si arriva sapendo dove passano, chi lavora in quota — i gatti sui tetti del Corso.',
    art: 'artworks/Il Covo dei Gatti.png',
    testo: 'Un sottotetto di funi e ramponi, il quartier generale dei ladri di grondaia. Qui hanno «lavorato» la refurtiva prima di renderla, e qui vive la parola dei tetti — il segno che, al Primo Gatto, vale più di una lama alla gola.',
    approfondimenti: [
      { tipo: 'Presagio', soggetto: 'La parola dei tetti',
        testo: 'I Gatti del Corso hanno un codice più vecchio di loro: chi conosce la parola dei tetti è gente di rispetto, non un gendarme travestito. Presentarla al Primo Gatto non è una minaccia — è un salvacondotto. Un re dei tetti non parla sotto tortura, ma parla volentieri con chi tratta da pari. E stanotte ha in tasca un lavoro sbagliato, di quelli che a un ladro d’onore lasciano l’amaro. Datele voce, e lui vi darà la sua.' },
    ] },
  { n: 9, nome: 'L’Attico del Corso',
    req: 'L’attico dove i Gatti tengono il bottino è in cima ai tetti del Corso: ci si arriva solo sapendo che lassù lavorano loro, i gatti sui tetti.',
    art: 'artworks/L’Attico del Corso.png',
    testo: 'In cima ai tetti: il bottino accatastato e imballato per la restituzione, il cielo aperto e il vuoto della via sotto. È da qui che i pacchi sono scesi arredati del «di più», e qui che il Primo Gatto vi aspetta — o vi sfugge, sulla cresta.',
    approfondimenti: [
      { tipo: 'Testimonianza', soggetto: 'Lo Spillo, sulla cresta',
        testo: '«Di solito ci pagano per portar via, signori. Stavolta metà oro era per lasciare: roba non sua, da mettere nelle casse del professore con cura, dove i vostri gendarmi l’avrebbero pescata. Non so chi paga — oro vecchio, un intermediario mai visto, ricevute su carta col giglio. Ma chi ordina un furto per arredare una casa d’altri non vuole rubare: vuole che quell’uomo sia colpevole. E per farlo bene, lo conosce da una vita.»' },
    ] },
].map((L) => ({
  art: L.art,
  title: `${L.n} · ${L.nome}`,
  file: `Episodio 14/Luoghi/${L.n} - ${L.nome.replace(/’/g, "'")}`,
  type: `Luogo ${L.n}`,
  rules: `{i}${L.req === 'Disponibile dall’inizio' ? L.testo : L.req}{/i}`,
  approfondimenti: L.approfondimenti, n: L.n,
}));

const EP14_INDIZI = LUOGHI14.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Osservazione' || a.tipo === 'Presagio')
    .map((a) => ({
      art: L.art, n: L.n, kind: 'Indizio',
      title: `Indizio Nascosto — ${a.soggetto}`,
      file: `Episodio 14/Indizi/${a.soggetto.replace(/’/g, "'")}`,
      type: a.tipo,
      rules: `{i}◆ (${a.tipo}) ${a.testo}{/i}`,
    })));

const EP14_TESTIMONI = LUOGHI14.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Testimonianza').map((a) => ({
    art: L.art, n: L.n, kind: 'Testimone',
    title: `Testimone — ${a.soggetto}`,
    file: `Episodio 14/Testimoni/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Testimone`,
    rules: `{i}${a.testo}{/i}`,
  })));

const EP14_REFERTI = LUOGHI14.flatMap((L) =>
  L.approfondimenti.filter((a) => a.tipo === 'Referto').map((a) => ({
    art: L.art, n: L.n, kind: 'Referto',
    title: `Referto — ${a.soggetto}`,
    file: `Episodio 14/Referti/${a.soggetto.replace(/’/g, "'")}`,
    type: `Luogo ${L.n} · Referto`,
    rules: `{i}${a.testo}{/i}`,
  })));

// Mazzo 21: 7 spawn (Gatti minori), 6 insidie (quota: comignolo/grondaia/vuoto/
// vetro/fune/colombo), 4 crescendo (FUGA: soglia-fuga), 4 eventi.
const EP14_MINACCE = [
  { art: 'artworks/I Gatti del Corso.png', title: 'Ombre tra i Panni', tipo: 'Malavita',
    flavor: 'Un Gatto minore sguscia tra le lenzuola stese: un colpo, e via.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Sopra la Cresta', tipo: 'Malavita',
    flavor: 'Sbucano dalla cresta del tetto, dove nessuno pensa di guardare.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Colpisci e Scappa', tipo: 'Malavita',
    flavor: 'Non vogliono battervi: vogliono rubarvi il round che vi serve.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Dalla Grondaia', tipo: 'Malavita',
    flavor: 'Due si arrampicano dalla grondaia, silenziosi come gatti veri.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Il Fischio dello Spillo', tipo: 'Malavita',
    flavor: 'Un fischio dalla cresta, e i suoi convergono dove il capo li vuole.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’uscita più vicina agli eroi.' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Coprono la Fuga del Capo', tipo: 'Malavita',
    flavor: 'Mentre lo Spillo cerca la via di scampo, qualcuno resta a coprirlo.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’ingresso della tessera (dal lato da cui siete entrati).' },
  { art: 'artworks/I Gatti del Corso.png', title: 'Rincalzi dall’Abbaino', tipo: 'Malavita',
    flavor: 'Dall’abbaino socchiuso ne escono altri, agili e beffardi.',
    effect: 'Piazzate 1 Sgherro (Gatto minore) sull’uscita più vicina agli eroi: si attiva subito.' },
  { art: 'artworks/Il coppo che frana.png', title: 'Il Coppo che Frana', tipo: 'Insidia',
    flavor: 'Una tegola si stacca sotto il piede e scivola verso il vuoto, trascinando l’appoggio.',
    effect: 'L’eroe attivo prova DESTREZZA (Media): se fallisce, resta un round aggrappato — perde il turno e la FUGA avanza. Coi Ramponi: nessun effetto.' },
  { art: 'artworks/La grondaia marcia.png', title: 'La Grondaia Marcia', tipo: 'Insidia',
    flavor: 'Il ferro arrugginito cede con un gemito proprio mentre ci si appoggia.',
    effect: 'L’eroe più avanzato prova VIGORE (Media): se fallisce, 1 danno (uno strappo, un volo breve). Coi Ramponi: nessun danno.' },
  { art: 'artworks/Il vuoto sotto.png', title: 'Il Vuoto Sotto', tipo: 'Insidia',
    flavor: 'Uno sguardo alla via a picco, e le gambe si fanno di piombo.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, ha 1 sola azione al prossimo turno (la vertigine).' },
  { art: 'artworks/Il vetro del lucernario.png', title: 'Il Vetro del Lucernario', tipo: 'Insidia',
    flavor: 'Il vetro sporco geme, si incrina a ragnatela: un attimo prima di cedere.',
    effect: 'L’eroe attivo prova DESTREZZA (Media): se fallisce, 1 danno (sfonda il vetro) e la FUGA avanza. Coi Ramponi o la fune (T3): nessun danno.' },
  { art: 'artworks/La fune tesa.png', title: 'La Fune Tesa', tipo: 'Insidia',
    flavor: 'Una fune da bucato tesa all’altezza del collo, invisibile nel buio.',
    effect: 'L’eroe più avanzato prova DESTREZZA (Media): se fallisce, perde il movimento extra questo turno.' },
  { art: 'artworks/Il colombo in volo.png', title: 'Il Colombo in Volo', tipo: 'Insidia',
    flavor: 'Uno stormo esplode in volo da un comignolo, all’improvviso, in faccia.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce indietreggia di un passo — se sul bordo, prova DESTREZZA o cade di un livello (rientra al turno dopo).' },
  { art: 'artworks/Un fischio sui tetti.png', title: 'Un Fischio sui Tetti', tipo: 'Crescendo',
    flavor: 'Un fischio lontano risponde a un altro: lo Spillo ha chiamato, e si muove.',
    effect: 'Aggiungete 1 segnalino Canto (la Fuga). Alla soglia-fuga (Canto 4, 3 senza la Parola dei Tetti) il Primo Gatto sparisce se non agganciato. Alla soglia (3): +1 carta Minaccia per Fase, per sempre.' },
  { art: 'artworks/Il Gatto si sposta.png', title: 'Il Gatto si Sposta', tipo: 'Crescendo',
    flavor: 'La sagoma sulla cresta cambia posto: guadagna un tetto, poi un altro.',
    effect: 'Aggiungete 1 segnalino Canto (la Fuga). Il Primo Gatto arretra di una tessera verso l’uscita alta: agganciarlo costa ora un passo in più.' },
  { art: 'artworks/Le tegole cedono la traccia.png', title: 'Le Tegole Cedono la Traccia', tipo: 'Crescendo',
    flavor: 'Dietro di lui le tegole franano: la via che ha fatto non si può più rifare.',
    effect: 'Aggiungete 1 segnalino Canto (la Fuga). L’ultima tessera attraversata si «chiude» (non si torna indietro): se restate staccati dal gruppo, siete soli coi Gatti minori.' },
  { art: 'artworks/La cresta è vicina.png', title: 'La Cresta è Vicina', tipo: 'Crescendo',
    flavor: 'Lo Spillo è quasi al colmo del tetto: un salto, e sarà oltre, nel buio.',
    effect: 'Aggiungete 1 segnalino Canto (la Fuga). Se non lo agganciate entro il prossimo round, il Gatto scavalca la cresta e sparisce: vittoria parziale. Giocate la Parola dei Tetti ORA, se l’avete.' },
  { art: 'artworks/La notte sui tetti.png', title: 'La Notte sui Tetti', tipo: 'Quiete',
    flavor: 'Per un attimo solo il vento e le luci lontane della città. Si respira.',
    effect: 'Nessun effetto. Tirate il fiato: anche una caccia sui tetti, per un istante, si ferma.' },
  { art: 'artworks/Un abbaino aperto.png', title: 'Un Abbaino Aperto', tipo: 'Favore',
    flavor: 'Un abbaino lasciato aperto offre un appiglio e una scorciatoia.',
    effect: 'Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).' },
  { art: 'artworks/Comignoli sul passo.png', title: 'Comignoli sul Passo', tipo: 'Ostacolo',
    flavor: 'Una selva di comignoli e antenne intralcia il passaggio: si passa, ma piano.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Il cornicione che cede.png', title: 'Il Cornicione che Cede', tipo: 'Danno',
    flavor: 'Un pezzo di cornicione si stacca sotto il gruppo e porta giù chi c’è sopra.',
    effect: 'Un eroe a caso (chi arbitra tira) subisce 1 danno.' },
].map((m) => ({
  art: m.art,
  title: `${m.tipo} — ${m.title}`,
  file: `Episodio 14/Minacce/${m.title.replace(/’/g, "'")}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

const EP14_OGGETTI = [
  { art: 'artworks/Parola dei Tetti.png', nome: 'La Parola dei Tetti', ref: 'E14-L8',
    fonte: 'Luogo 8 — Il Covo dei Gatti',
    flavor: 'Il segno di riconoscimento dei Gatti del Corso, quello che ci si scambia sui tetti per non spararsi al buio. Vale più di una lama.',
    effetto: 'Al Primo Gatto (T6): vi riconosce come gente di codice — tratta già a 2 Ferite (non serve portarlo all’ultima) e non tenta la fuga finale. Abbassa la soglia-fuga d’ingaggio.' },
  { art: 'artworks/I Ramponi.png', nome: 'I Ramponi', ref: 'E14-L8',
    fonte: 'Luogo 8 — Il Covo dei Gatti',
    flavor: 'Gli attrezzi da quota dei ladri di grondaia: rampini, cinghie, suole chiodate. Sui tetti, la differenza tra un passo e un volo.',
    effetto: 'Sui tetti le cadute non vi feriscono e non vi fanno perdere il round: saltate lo strapiombo di T1 e superate le insidie di quota (comignolo, lucernario) senza danno.' },
  { art: 'artworks/Inventario Originale.png', nome: 'L’Inventario Originale', ref: 'E14-L1',
    fonte: 'Luogo 1 — La Villa-Museo di Braga',
    flavor: 'Il catalogo firmato della collezione, di pugno di Braga: ogni lastra, ogni cimelio, numerato. Il metro per misurare il «di più».',
    effetto: 'Confrontato col verbale della refurtiva (D3), rende visibili gli oggetti-intrusi. All’Attico (T6) documentate il «di più» sul posto: torsione piena, il falso dell’Ep.15 nasce con una crepa.' },
  { art: 'artworks/Pegno Anonimo.png', nome: 'Il Pegno Anonimo', ref: 'E14-L3',
    fonte: 'Luogo 3 — Il Banco dei Pegni',
    flavor: 'Una lastra impegnata e riscattata da un Gatto: pare tradire il mandante, è solo un ladro che ha fatto cassa per conto suo.',
    effetto: 'Effetto: nessuno finora scoperto.' },
  { art: 'artworks/Lettera del Perito.png', nome: 'La Lettera del Perito', ref: 'E14-L6',
    fonte: 'Luogo 6 — Lo Studio del Perito',
    flavor: 'Una lettera livorosa in cui Coda minaccia di «smascherare» Braga. Rancore da cattedra: Coda non ha né i mezzi né i gatti.',
    effetto: 'Effetto: nessuno finora scoperto.' },
].map((o) => ({
  art: o.art,
  title: o.nome,
  file: `Episodio 14/Oggetti/${o.nome.replace(/’/g, "'")}`,
  type: 'Oggetto',
  rules: `{i}${o.flavor}{/i}{divider}${o.effetto}`,
  ref: o.ref, fonte: o.fonte,
}));

const EP14_NEMICI = [
  { art: 'artworks/Il Primo Gatto.png', title: 'Il Primo Gatto',
    type: 'Il Re dei Tetti (Boss) — Episodio 14',
    rules: '{i}Berto detto lo Spillo è il re dei tetti del Corso: cammina sulle grondaie come voi sul pavimento, e ruba da vent’anni senza aver mai fatto male a nessuno. Un ladro d’onore, con un codice più vecchio di lui.{/i}{divider}Statistiche nel Bestiario. Nessuna debolezza-oggetto. Ridotto all’ultima Ferita TRATTA (non muore): dice la verità sulla commissione. «La Parola dei Tetti» (D4): tratta già a 2 Ferite. «La commissione era cieca» (D2): gli salta un attacco. Ucciderlo perde la sua parola.' },
].map((n) => ({ ...n, file: `Episodio 14/Nemici/${n.title}` }));

const EP14 = [...LUOGHI14, ...EP14_INDIZI, ...EP14_TESTIMONI, ...EP14_REFERTI,
              ...EP14_MINACCE, ...EP14_OGGETTI, ...EP14_NEMICI];


module.exports = {
  HEROES, NEMICI, MINACCE, LUOGHI, INDIZI, TESTIMONI, REFERTI, OGGETTI, PRELUDIO,
  PRELUDIO_LUOGHI, PRELUDIO_APPROFONDIMENTI, PRELUDIO_OGGETTI,
  EP2, LUOGHI2, EP2_INDIZI, EP2_TESTIMONI, EP2_REFERTI, EP2_MINACCE, EP2_OGGETTI, EP2_NEMICI,
  EP3, LUOGHI3, EP3_INDIZI, EP3_TESTIMONI, EP3_REFERTI, EP3_MINACCE, EP3_OGGETTI, EP3_NEMICI,
  EP4, LUOGHI4, EP4_INDIZI, EP4_TESTIMONI, EP4_REFERTI, EP4_MINACCE, EP4_OGGETTI, EP4_NEMICI,
  EP5, LUOGHI5, EP5_INDIZI, EP5_TESTIMONI, EP5_REFERTI, EP5_MINACCE, EP5_OGGETTI, EP5_NEMICI,
  EP6, LUOGHI6, EP6_INDIZI, EP6_TESTIMONI, EP6_REFERTI, EP6_MINACCE, EP6_OGGETTI, EP6_NEMICI,
  EP7, LUOGHI7, EP7_INDIZI, EP7_TESTIMONI, EP7_REFERTI, EP7_MINACCE, EP7_OGGETTI, EP7_NEMICI,
  EP8, LUOGHI8, EP8_INDIZI, EP8_TESTIMONI, EP8_REFERTI, EP8_MINACCE, EP8_OGGETTI, EP8_NEMICI,
  EP9, LUOGHI9, EP9_INDIZI, EP9_TESTIMONI, EP9_REFERTI, EP9_MINACCE, EP9_OGGETTI, EP9_NEMICI,
  EP10, LUOGHI10, EP10_INDIZI, EP10_TESTIMONI, EP10_REFERTI, EP10_MINACCE, EP10_OGGETTI, EP10_NEMICI,
  EP11, LUOGHI11, EP11_INDIZI, EP11_TESTIMONI, EP11_REFERTI, EP11_MINACCE, EP11_OGGETTI, EP11_NEMICI,
  EP12, LUOGHI12, EP12_INDIZI, EP12_TESTIMONI, EP12_REFERTI, EP12_MINACCE, EP12_OGGETTI, EP12_NEMICI,
  EP13, LUOGHI13, EP13_INDIZI, EP13_TESTIMONI, EP13_REFERTI, EP13_MINACCE, EP13_OGGETTI, EP13_NEMICI,
  EP14, LUOGHI14, EP14_INDIZI, EP14_TESTIMONI, EP14_REFERTI, EP14_MINACCE, EP14_OGGETTI, EP14_NEMICI,
  ALL: [...HEROES, ...NEMICI, ...MINACCE, ...LUOGHI, ...INDIZI, ...TESTIMONI, ...REFERTI, ...OGGETTI, ...PRELUDIO, ...EP2, ...EP3, ...EP4, ...EP5, ...EP6, ...EP7, ...EP8, ...EP9, ...EP10, ...EP11, ...EP12, ...EP13, ...EP14],
};
