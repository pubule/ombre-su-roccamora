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
    rules: '{i}Il Macellaio{/i}{divider}Il banco dei Massari sta al Vecchio Mercato da tre generazioni, e Ottone conosce Roccamora dalla pancia: sa chi mangia, chi digiuna e chi da qualche tempo non ha più fame. Ci pensa da quando il suo garzone sparì durante la festa di San Teodoro e tornò tre giorni dopo, senza appetito e senza voce.',
  },
  {
    art: 'artworks/Carla.png',
    title: 'Carla Dosti',
    type: 'Eroe — La Giornalista',
    rules: '{i}La Giornalista{/i}{divider}Prima donna in redazione al Corriere di Roccamora, relegata ai necrologi finché non ha scoperto che i necrologi, letti in fila, raccontano storie che nessuno vuole stampare. Ha una macchina fotografica, una memoria feroce e la convinzione che la verità sia un diritto anche quando è indicibile.',
  },
];

const NEMICI = [
  {
    art: 'artworks/Adepto Incappucciato.png',
    title: 'Adepto Incappucciato',
    type: 'Creatura — Cultista Incappucciato',
    rules: '{i}Att +1 · Dif 7 · Ferite 1 · Mov 4 · Danno 1{/i}{divider}Palandrana grigia da becchino, maschera di cera liscia e senza tratti. Sotto, gente comune di Roccamora — fornai, barcaioli, sagrestani — che alle 3 di notte smette di essere gente comune. Combattono con falcetti da fonditore, in perfetto silenzio: la voce la conservano per il canto.',
  },
  {
    art: 'artworks/Cani dei Moli.png',
    title: 'Cane dei Moli',
    type: 'Creatura — Cane dei Moli',
    rules: '{i}Att +2 · Dif 6 · Ferite 1 · Mov 6 · Danno 1{/i}{divider}Bestie da guardia dei magazzini, il muso incrostato di cera nera: il culto li nutre e li accorda come strumenti. Arrivano prima del loro ringhio. Fragili, ma il colpo va messo a segno mentre saltano.',
  },
  {
    art: 'artworks/Il Fonditore.png',
    title: 'Il Fonditore',
    type: 'Creatura — Fonditore',
    rules: '{i}Att +1 · Dif 8 · Ferite 2 · Mov 2 · Danno 2{/i}{divider}Gli artigiani del culto: grembiule di cuoio, mestolo colmo di cera fusa, la pazienza di chi ha versato mille candele. Non corrono mai: non ne hanno bisogno. Chi viene ferito dal Fonditore si muove di 1 casella in meno nel suo prossimo turno.',
  },
  {
    art: 'artworks/Il Custode della Cera (boss).png',
    title: 'Il Custode della Cera',
    type: 'Creatura — Custode (Boss)',
    rules: '{i}Att +3 · Dif 9 · Ferite 4 · Mov 3 · Danno 2{/i}{divider}Un gigante ricoperto di strati di cera colata, il volto un moncone liscio in cui affiorano, a tratti, i lineamenti di qualcun altro. Avanza lento e senza fretta: nulla, nel suo magazzino, gli è mai sfuggito. Se il diapason d’argento viene fatto vibrare a lui adiacente (azione): Difesa 5 per il resto della partita e salta la sua prossima attivazione.',
  },
];

const MINACCE = [
  { art: 'artworks/Adepto Incappucciato.png', title: 'Adepto in Agguato',
    flavor: 'Una sagoma si stacca dal buio, il volto una lastra di cera liscia.',
    effect: 'Piazzate 1 Adepto sull’uscita più lontana dagli eroi della tessera in cui si trova l’eroe attivo.' },
  { art: 'artworks/Volti tra le casse.png', title: 'Volti tra le Casse',
    flavor: 'Tra le pile, un volto liscio che non respira. Vi guarda da un pezzo.',
    effect: 'Piazzate 1 Adepto sulla tessera rivelata più lontana dagli eroi.' },
  { art: 'artworks/Il falcetto nel buio.png', title: 'Il Falcetto nel Buio',
    flavor: 'Il fischio sottile di una lama da fonditore, proprio dietro di voi.',
    effect: 'Piazzate 1 Adepto sull’ingresso della tessera corrente, alle spalle degli eroi.' },
  { art: 'artworks/La Vedetta.png', title: 'La Vedetta',
    flavor: 'Chi resta solo, a Roccamora, non resta solo a lungo.',
    effect: 'Piazzate 1 Adepto adiacente all’eroe più isolato (quello più lontano dagli altri; a pari merito, l’eroe attivo).' },
  { art: 'artworks/Cani dei Moli.png', title: 'Cani dei Moli',
    flavor: 'Un ringhio basso, poi unghie sulla pietra. Troppo veloci.',
    effect: 'Piazzate 1 Cane dei Moli sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.' },
  { art: 'artworks/Unghie sulla pietra.png', title: 'Unghie sulla Pietra',
    flavor: 'Dal buio dell’ingresso, un galoppo basso che non rallenta.',
    effect: 'Piazzate 1 Cane dei Moli sull’ingresso della tessera corrente: si attiva subito.' },
  { art: 'artworks/Il Fonditore.png', title: 'Il Fonditore',
    flavor: 'Passi lenti, e il gorgoglio di un mestolo colmo di cera fusa.',
    effect: 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1). Se è già in gioco un Fonditore, recupera 1 ferita.' },
  { art: 'artworks/La marea di cera.png', title: 'La Marea di Cera',
    flavor: 'Il gorgoglio si fa coro: i mestoli avanzano tutti insieme.',
    effect: 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1): tutti i Fonditori in gioco si attivano subito.' },
  { art: 'artworks/Ronda.png', title: 'Ronda',
    flavor: 'Passi cadenzati e un salmodiare sommesso: non siete più soli.',
    effect: 'Piazzate 2 Adepti sull’ingresso della Banchina (T1).' },
  { art: 'artworks/Trappola di cera.png', title: 'Trappola di Cera',
    flavor: 'Il pavimento luccica. Capite troppo tardi perché.',
    effect: 'L’eroe più avanzato prova NERVI (Media): se fallisce, cera bollente: 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Cera sotto i piedi.png', title: 'Cera sotto i Piedi',
    flavor: 'Il pavimento cede morbido sotto lo stivale. Era ancora calda.',
    effect: 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.' },
  { art: 'artworks/Fumi soporiferi.png', title: 'Fumi Soporiferi',
    flavor: 'Un dolciastro di sego e papavero vi riempie i polmoni.',
    effect: 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.' },
  { art: 'artworks/Il canto sale.png', title: 'Il Canto Sale',
    flavor: 'Una voce sola, sottile, cerca il tono giusto. Lo trova.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta. Se è già in gioco: recupera 1 ferita e si attiva subito.' },
  { art: 'artworks/Il coro risponde.png', title: 'Il Coro Risponde',
    flavor: 'Dieci voci. Poi cento. La pietra le beve tutte.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta. Se è già in gioco: recupera 1 ferita e si attiva subito.' },
  { art: 'artworks/Il canto cresce.png', title: 'Il Canto Cresce',
    flavor: 'Le voci salgono di un tono. Sotto i piedi, la pietra vibra.',
    effect: 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta. Se è già in gioco: recupera 1 ferita e si attiva subito.' },
  { art: 'artworks/Presagio.png', title: 'Presagio',
    flavor: 'Una candela si spegne da sola. Nessuno ha fiatato.',
    effect: 'Un brivido corre lungo la schiena. Non accade nulla... per ora.' },
  { art: 'artworks/Eco amica.png', title: 'Eco Amica',
    flavor: 'Tre colpi sordi, ostinati: qualcuno, là sotto, è ancora vivo.',
    effect: 'Tre colpi sordi, in lontananza: Ruggero è vivo. Rivelate una tessera coperta adiacente a una rivelata.' },
  { art: 'artworks/Cera che cola.png', title: 'Cera che Cola',
    flavor: 'Dalle travi piove cera bollente, filo dopo filo.',
    effect: 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.' },
  { art: 'artworks/Rinforzi dal canale.png', title: 'Rinforzi dal Canale',
    flavor: 'Dal canale, il tonfo di una chiatta che attracca senza lanterne.',
    effect: 'Piazzate 1 Adepto sull’ingresso della Banchina (T1).' },
  { art: 'artworks/Sussurri.png', title: 'Sussurri',
    flavor: 'Qualcuno pronuncia il vostro nome. Con la vostra voce.',
    effect: 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal terrore.' },
].map((m) => ({
  art: m.art,
  title: m.title,
  file: `Minacce/${m.title}`,
  rules: `{i}${m.flavor}{/i}{divider}${m.effect}`,
}));

// Luoghi dell'Indagine: testo esteso da src/story.py TESTI_LUOGHI (quello
// realmente stampato nel PDF via story.apply), indizi/nascosto/req da
// src/gen_cards.py LUOGHI. Un'arte per luogo, riusata anche dalla carta
// Indizio Nascosto corrispondente.
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
    indizi: ['Colate di cera nera sui gradini — troppo in alto perché vengano dalle candele della chiesa.',
             'Il diario di Ruggero, con l’ultima pagina strappata. Ricalcando i solchi della penna leggete: «...alle 3 in punto, ogni notte. Tre rintocchi, poi uno, poi cinque. Non sono io a suonare.»',
             'Graffiata sul legno della balaustra, una parola: SOMMERSO.'],
    nascosto: 'Tra le assi, un frammento di spartito scritto a mano. Le note non sono per organo: sono per campane.' },
  { n: 2, nome: 'Casa di Ruggero — Vicolo dei Fonditori', req: 'Disponibile dall’inizio',
    testo: 'Il vicolo dei Fonditori sa di carbone e minestra. Bice vi apre con gli occhi rossi e le mani che non stanno ferme; la casa è linda, povera, piena dell’assenza di suo fratello. «Negli ultimi tempi diceva di sentire musica sotto il pavimento della cripta», mormora. «E aveva paura del suo stesso campanile.»',
    indizi: ['Sul tavolo, una CORDA DI VIOLINO d’argento: «L’ha trovata in cripta», dice Bice. (Oggetto: sblocca il Luogo 5.)',
             'Una ricevuta: Ruggero aveva chiesto all’Archivio Civico i documenti antichi della cattedrale.',
             'Bice: «L’ultima sera ripeteva una parola, come una preghiera al contrario: sommerso, sommerso.»'],
    nascosto: null },
  { n: 3, nome: 'Taverna del Ponte Rotto', req: 'Disponibile dall’inizio',
    testo: 'Fumo denso, vino cattivo, il tanfo dolciastro del canale che entra a ogni porta che sbatte. I barcaioli giocano a carte sotto una lampada a olio e vi squadrano appena: qui le lingue si sciolgono con poco, purché il poco finisca nel bicchiere giusto.',
    indizi: ['Ugo il barcaiolo: «Tre notti fa una CHIATTA senza lanterne ha scaricato casse al Canale Basso. Alle 3, proprio mentre le campane suonavano da sole.» (Parola chiave: sblocca il Luogo 6.)',
             'Un avventore ubriaco: «Vicino ai vecchi magazzini c’è puzza di cera bruciata da settimane.»',
             'L’oste conferma: Tonio il sagrestano era qui a giocare a carte fino all’alba, la notte della scomparsa.'],
    nascosto: null },
  { n: 4, nome: 'La Sagrestia della Cattedrale', req: 'Disponibile dall’inizio',
    testo: 'Odore d’incenso e di chiuso. Don Callisto vi riceve tra i paramenti, nervoso, nascondendo dietro la schiena le mani sporche di cera. Alle sue spalle la porta della cripta, sbarrata con assi nuove su pietra antica: «Chiusa per lavori», taglia corto, e la voce gli si incrina sull’ultima sillaba.',
    indizi: ['La tabella degli inni segna il numero 315, «Dal Profondo». Tonio giura di non averlo mai impostato: «Quell’inno non si canta da cent’anni. È roba dell’antico coro.»',
             'Don Callisto ammette: la seconda chiave della cripta ce l’ha il liutaio Ferri, che sta restaurando l’organo.',
             'Prima che usciate, vi mette in mano un’ampolla di acqua benedetta: «Se là sotto c’è il demonio, portate questa.»'],
    nascosto: 'La cera sulle mani di don Callisto è bianca, comune: vende candele di nascosto per pagare i debiti della parrocchia. Con la cera nera non c’entra.' },
  { n: 5, nome: 'Bottega del Liutaio Ferri', req: 'Serve: la CORDA DI VIOLINO (Luogo 2)',
    testo: 'La bottega è chiusa da giorni, la polvere ha già preso possesso delle vetrine; la porta sul retro cede a una spallata. Dentro, violini appesi come selvaggina e un silenzio sbagliato per un luogo nato per fare musica. Il banco da lavoro è in ordine perfetto: chi è partito, sapeva di partire.',
    indizi: ['Bastiano Ferri è sparito da tre giorni. Sul banco, un diapason d’argento inciso con un’onda.',
             'Il registro consegne, ultima riga: «40 candele di cera nera — consegna al C.B., molo terzo, il vecchio deposito — pagato B.F.»',
             'Uno spartito: «Dal Profondo», riscritto per campane. In margine: «il bronzo canta, la pietra risponde, l’acqua ricorda».'],
    nascosto: null },
  { n: 6, nome: 'Il Canale Basso', req: 'Serve: la parola chiave CHIATTA (Luogo 3)',
    testo: 'L’acqua qui non scorre: sta. Nera, ferma, densa come olio, lambisce magazzini ciechi dai portoni murati. Il guardiano notturno esce dal casotto con la lanterna alzata e, per qualche moneta, la diffidenza si scioglie in fretta: da settimane muore dalla voglia di raccontare a qualcuno quello che sente la notte.',
    indizi: ['«Le casse erano marchiate a fuoco con un’onda. Le hanno portate al vecchio Magazzino delle Cere, quello chiuso da vent’anni.»',
             '«Alle 3 di notte, da là dentro, viene un canto sommesso. Di molte voci. Una volta... ho sentito un urlo.»',
             'Sul molo: gocce di cera nera e un lucchetto nuovo di zecca sulla porta della banchina, di quelli a tre cifre.'],
    nascosto: null },
  { n: 7, nome: 'L’Archivio Civico', req: 'Serve: la parola chiave SOMMERSO (Luogo 1)',
    testo: 'Scaffali fino al soffitto, cartelle legate con lo spago, la luce verde delle lampade a schermo. L’archivista, minuscolo dietro occhiali spessi, si irrigidisce quando pronunciate la parola giusta: poi, senza fiatare, vi guida a uno scaffale che nessuno tocca da decenni — la polvere è spessa un dito, tranne che su un solo fascicolo.',
    indizi: ['Fascicolo del 1741: la confraternita del Coro Sommerso, bandita per «pratiche contrarie a Dio e alla quiete delle acque». Si riuniva in cavità sotto la cattedrale, «dove l’acqua canta». Il suo sigillo: un’onda.',
             'Una mappa antica: dalla cripta, condotti scendono verso il Canale Basso.',
             'Registro consultazioni, due mesi fa: «B. Ferri, liutaio» ha richiesto questo stesso fascicolo.'],
    nascosto: null },
  { n: 8, nome: 'La Gendarmeria', req: 'Disponibile dall’inizio',
    testo: 'Pile di pratiche, una stufa che fuma, il brigadiere che vi riceve senza alzarsi. «Il campanaro? Sarà scappato con qualche vedova.» Ma mentre lo dice non vi guarda negli occhi, e la sua mano tamburella su un fascicolo di denunce che continua a spostare da un lato all’altro della scrivania.',
    indizi: ['Nessuna richiesta di riscatto. Il sospettato ufficiale è Tonio il sagrestano, l’ultimo ad aver visto Ruggero.',
             'Denunce recenti: furti di cera e canapa da tre chiese. E un fonditore giura d’aver venduto un quintale di bronzo a un compratore incappucciato.',
             '«Se trovate qualcosa di concreto, tornate. Non perquisiamo mezza città per un campanaro con la testa fra le nuvole.»'],
    nascosto: null },
].map((L) => ({
  art: LUOGHI_ART[L.n],
  title: L.nome,
  file: `Luoghi/${L.n} - ${L.nome}`,
  type: `Luogo ${L.n} — ${L.req}`,
  rules: `{i}${L.testo}{/i}{divider}${L.indizi.map((c) => `◆ ${c}`).join('\n')}`,
  nascosto: L.nascosto,
}));

// Indizi Nascosti: solo i luoghi che hanno un vero Indizio nascosto nei dati
// (oggi 1 e 4 — vedi src/gen_cards.py). Si legge solo se l'abilita' di un
// eroe lo permette (Elena: sempre; Ottone: una volta a episodio).
const INDIZI = LUOGHI.filter((L) => L.nascosto).map((L) => ({
  art: L.art,
  title: `Indizio Nascosto — ${L.title}`,
  file: `Indizi/${L.title}`,
  type: `Si legge solo con un’abilità (Elena: sempre · Ottone: 1 volta a episodio)`,
  rules: `{i}${L.nascosto}{/i}`,
}));

// Sottocartella per tipo, cosi' e' chiaro a colpo d'occhio se una carta e' la
// scheda nemico (combattimento) o la carta minaccia (evento dal mazzo), anche
// quando condividono soggetto/art (es. "Il Fonditore" esiste in entrambe).
NEMICI.forEach((n) => { n.file = `Nemici/${n.title}`; });
HEROES.forEach((h) => { h.file = `Eroi/${h.title}`; });

module.exports = {
  HEROES, NEMICI, MINACCE, LUOGHI, INDIZI,
  ALL: [...HEROES, ...NEMICI, ...MINACCE, ...LUOGHI, ...INDIZI],
};
