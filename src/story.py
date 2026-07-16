# -*- coding: utf-8 -*-
"""Ombre su Roccamora - testi narrativi estesi (immersione)."""

LETTERA2 = (
    "Alla Societ\u00e0 del Lume, riservata.<br/><br/>"
    "\u00abTre notti fa le campane di San Teodoro hanno suonato da sole, alle 3 in punto. "
    "Non un rintocco sbagliato di vento: una melodia, dicono i pochi svegli, lenta e "
    "ordinata come una processione. La stessa notte \u00e8 scomparso <b>Ruggero Alvise</b>, "
    "il campanaro: quarant\u2019anni di servizio, n\u00e9 debiti n\u00e9 nemici, un uomo che saliva "
    "quegli ottanta gradini anche con la febbre. La gendarmeria parla di fuga volontaria. "
    "Sua sorella Bice ha bussato alla nostra porta in lacrime, con le chiavi del campanile "
    "strette in pugno come una reliquia.<br/><br/>"
    "C\u2019\u00e8 dell\u2019altro, e non lo scrivo. Lo capirete da soli, se siete quelli che credo.<br/><br/>"
    "Trovatelo. Avete <b>6 ore</b>, dalle 18:00 alle 24:00: dopo, temo, sar\u00e0 tardi. "
    "Segnate ogni ora sul Taccuino e annotate tutto: nomi, orari, e ogni parola scritta "
    "in MAIUSCOLO.<br/>\u2014 M., presidente della Societ\u00e0\u00bb<br/><br/>"
    "<i>Luoghi disponibili dall\u2019inizio: 1, 2, 3, 4, 8. Gli altri vanno sbloccati. L\u2019Archivio Civico (7) e il Canale Basso (6) chiudono alle 23:00, la Gendarmeria (8) alle 21:00.</i>")

TESTI_LUOGHI = {
    1: "La scala a chiocciola sale nel buio, ottanta gradini che Ruggero conosceva a memoria. "
       "In cima, la cella campanaria \u00e8 un disordine congelato: lo sgabello rovesciato, la "
       "lanterna ancora appesa al gancio, la cena intatta sotto un panno. Le tre grandi campane "
       "pendono immobili come bestie addormentate, e fa pi\u00f9 freddo di quanto dovrebbe.",
    2: "Il vicolo dei Fonditori sa di carbone e minestra. Bice vi apre con gli occhi rossi e le "
       "mani che non stanno ferme; la casa \u00e8 linda, povera, piena dell\u2019assenza di suo "
       "fratello. \u00abNegli ultimi tempi diceva di sentire musica sotto il pavimento della "
       "cripta\u00bb, mormora. \u00abE aveva paura del suo stesso campanile.\u00bb",
    3: "Fumo denso, vino cattivo, il tanfo dolciastro del canale che entra a ogni porta che "
       "sbatte. I barcaioli giocano a carte sotto una lampada a olio e vi squadrano appena: "
       "qui le lingue si sciolgono con poco, purch\u00e9 il poco finisca nel bicchiere giusto.",
    4: "Odore d\u2019incenso e di chiuso. Don Callisto vi riceve tra i paramenti, nervoso, "
       "nascondendo dietro la schiena le mani sporche di cera. Alle sue spalle la porta della "
       "cripta, sbarrata con assi nuove su pietra antica: \u00abChiusa per lavori\u00bb, taglia "
       "corto, e la voce gli si incrina sull\u2019ultima sillaba.",
    5: "La bottega \u00e8 chiusa da giorni, la polvere ha gi\u00e0 preso possesso delle vetrine; "
       "il vicino di guardia si scosta solo davanti a ci\u00f2 che riportate. Dentro, violini "
       "appesi come selvaggina e un silenzio sbagliato per un luogo nato per fare musica. Il "
       "banco da lavoro \u00e8 in ordine perfetto: chi \u00e8 partito, sapeva di partire.",
    6: "L\u2019acqua qui non scorre: sta. Nera, ferma, densa come olio, lambisce magazzini "
       "ciechi dai portoni murati. Il guardiano notturno esce dal casotto con la lanterna "
       "alzata e, per qualche moneta, la diffidenza si scioglie in fretta: da settimane "
       "muore dalla voglia di raccontare a qualcuno quello che sente la notte.",
    7: "Scaffali fino al soffitto, cartelle legate con lo spago, la luce verde delle lampade a "
       "schermo. L\u2019archivista, minuscolo dietro occhiali spessi, si irrigidisce quando "
       "pronunciate la parola giusta: poi, senza fiatare, vi guida a uno scaffale che nessuno "
       "tocca da decenni \u2014 la polvere \u00e8 spessa un dito, tranne che su un solo fascicolo.",
    8: "Pile di pratiche, una stufa che fuma, il brigadiere che vi riceve senza alzarsi. "
       "\u00abIl campanaro? Sar\u00e0 scappato con qualche vedova.\u00bb Ma mentre lo dice non vi "
       "guarda negli occhi, e la sua mano tamburella su un fascicolo di denunce che continua "
       "a spostare da un lato all\u2019altro della scrivania.",
}

TESTI_TILES = {
    'T1': "L\u2019acqua nera lambisce le pietre della banchina; l\u2019aria sa di sego, di sale "
          "e di qualcosa di pi\u00f9 antico. La porta sul retro ha un lucchetto a tre cifre "
          "(vedi Soluzione). Qui dovete riportare Ruggero per vincere.",
    'T2': "Casse marchiate a fuoco con l\u2019onda, accatastate fino al soffitto in corridoi "
          "ciechi. Qualcosa, tra le pile, scricchiola nei momenti in cui nessuno si muove.",
    # Tell nel testo letto ad alta voce (bibbia punto 3): T3 il riflesso
    # (ramo opzionale, tell deliberatamente piu' leggibile), T4 il filo
    # (la trappola della chiave, telegrafata a chi presta attenzione).
    'T3': "Migliaia di candele nere trasformano il corridoio in una gola di luce tremolante; "
          "il caldo \u00e8 innaturale, la cera cola dalle mensole come pioggia lenta. Tra le "
          "colate, in fondo, un riflesso che non \u00e8 cera. Chi entra "
          "per la prima volta prova NERVI (Media): se fallisce, 1 danno (cera bollente).",
    'T4': "Una scrivania sommersa di spartiti annotati con grafia febbrile, un pagliericcio "
          "che puzza di sego, una tazza ancora tiepida. Sulla mensola, tra i vasetti, un filo "
          "di spago che non regge nulla \u2014 o cos\u00ec pare. Il custode non \u00e8 lontano.",
    'T5': "Gradini viscidi scendono in un buio che canta: a ogni passo le voci si fanno pi\u00f9 "
          "nitide, e pi\u00f9 sbagliate. Chi scende prova NERVI (Facile): se fallisce, ha 1 sola "
          "azione al prossimo turno.",
    # Come si apre la cella NON sta qui: e' una scoperta, vive nel campo
    # `arbitro` della tessera (gen_cards.TILES) e finisce sul retro delle
    # note tessera, solo per chi arbitra.
    'T6': "Un altare di pietra nera in un cerchio di candele: la cera ha colato per anni, fino a "
          "formare stalattiti. Dietro, una cella sbarrata con Ruggero. QUANDO RIVELATE QUESTA "
          "TESSERA: appare il Custode della Cera con 2 Adepti.",
}

NOTE_NEMICI = {
    'ADEPTO INCAPPUCCIATO':
        "Palandrana grigia da becchino, maschera di cera liscia e senza tratti. Sotto, gente "
        "comune di Roccamora \u2014 fornai, barcaioli, sagrestani \u2014 che alle 3 di notte "
        "smette di essere gente comune. Combattono con falcetti da fonditore, in perfetto "
        "silenzio: la voce la conservano per il canto.",
    'IL CUSTODE DELLA CERA':
        "Un gigante ricoperto di strati di cera colata, il volto un moncone liscio in cui "
        "affiorano, a tratti, i lineamenti di qualcun altro. Avanza lento e senza fretta: "
        "nulla, nel suo magazzino, gli \u00e8 mai sfuggito. Se il diapason d\u2019argento viene "
        "fatto vibrare a lui adiacente (azione): Difesa 5 per il resto della partita e salta "
        "la sua prossima attivazione.",
    'LO SGHERRO':
        "Roccamora ha una malavita antica quanto i suoi canali: barcaioli che sfondano teste "
        "per pochi soldi, disertori, ex galeotti. Il culto non li converte \u2014 li paga, e "
        "loro non fanno domande. Si muovono in branco e si coprono le spalle a vicenda.",
    'IL SICARIO':
        "Non porta maschera n\u00e9 cera: solo una lama sottile e la pazienza di chi aspetta il "
        "momento. Sceglie chi \u00e8 rimasto indietro, chi zoppica, chi \u00e8 solo. Quando lo "
        "vedi, di solito \u00e8 gi\u00e0 tardi \u2014 ma basta un colpo ben messo per fermarlo.",
}

# BIO_BESTIARIO: versione estesa e immersiva, usata SOLO nel Bestiario
# (gen_bestiario.py), dove c'e' spazio per respirare - stesso principio di
# BIO/BIO_SCHEDA per gli eroi (breve sulla carta, estesa sulla scheda). Se un
# nemico non ha BIO_BESTIARIO, il fascicolo ripiega su NOTE_NEMICI/`note`. Un
# nemico nuovo porta entrambe le versioni (vedi PROMPT-ESPANSIONE.md).
BIO_BESTIARIO = {
    'ADEPTO INCAPPUCCIATO':
        "Di giorno sono nessuno: il fornaio che impasta all\u2019alba, il barcaiolo che tira "
        "la cima, il sagrestano che spegne le candele. Alle 3 di notte qualcosa li chiama e "
        "loro rispondono, uno a uno, senza svegliare chi dorme accanto. Indossano la "
        "palandrana grigia sopra i vestiti da lavoro \u2014 a volte si intravede ancora il "
        "grembiule del fornaio sotto \u2014 e la maschera di cera liscia, colata sul volto "
        "ancora tiepida, che si indurisce mentre camminano verso il luogo del raduno. "
        "Non parlano. Non gridano, nemmeno colpiti. Combattono con gli stessi falcetti che "
        "di giorno tagliano gli stoppini nelle fonderie, con un\u2019efficienza distratta, "
        "quasi annoiata \u2014 come se una parte di loro fosse gi\u00e0 altrove, gi\u00e0 nel "
        "canto. Al mattino, chi sopravvive alla notte torna al banco o alla barca senza "
        "ricordare nulla: solo la cera secca dietro le orecchie, che si toglie con "
        "l\u2019unghia senza chiedersi perch\u00e9 c\u2019\u00e8.",
    'CANE DEI MOLI':
        "Erano cani da guardia normali, prima \u2014 bastardi grossi tenuti a stecchetto nei "
        "magazzini, per tenere lontani i ladri di corda e di piombo. Il culto li ha presi "
        "come prende tutto ci\u00f2 che serve: senza chiedere, pagando in cera e in carne. Ora "
        "hanno il muso incrostato di gocce nere, come se avessero bevuto a una candela "
        "invece che a una ciotola, e un ringhio che arriva un istante dopo il morso, non "
        "prima. Corrono lungo le passerelle di legno marcio senza far scricchiolare una "
        "tavola, saltano da un molo all\u2019altro con una leggerezza che il loro peso non "
        "dovrebbe permettere. Sono le prime sentinelle di ogni deposito del Coro: se "
        "abbaiano \u2014 non lo fanno quasi mai \u2014 \u00e8 gi\u00e0 troppo tardi per chi li "
        "sente arrivare.",
    'IL FONDITORE':
        "Nella vita del culto sono gli artigiani, non i soldati: uomini di mezza et\u00e0 col "
        "grembiule di cuoio bruciacchiato e le mani coperte di calli vecchi di decenni, "
        "quelle che hanno versato mille candele prima di questa e ne verseranno altre mille "
        "se qualcuno glielo lascer\u00e0 fare. Portano il mestolo colmo di cera fusa come "
        "un\u2019arma qualunque, senza fretta e senza rabbia \u2014 la stessa pazienza "
        "silenziosa con cui hanno sempre lavorato, applicata ora a tutt\u2019altro. Non "
        "corrono: chi ha versato cera bollente per una vita sa che la fretta \u00e8 quello "
        "che ti fa scottare. Restano fermi, aspettano che il bersaglio venga a loro, e "
        "quando colpiscono, la cera bollente che schizza si attacca alla pelle e ai "
        "vestiti \u2014 un ricordo bruciante, che resta addosso per giorni, di quanto in "
        "fonderia un errore costi caro.",
    'IL CUSTODE DELLA CERA':
        "Nessuno, nemmeno tra gli Adepti, sa dire da quanti anni sorvegli la cripta sotto "
        "la Cattedrale, n\u00e9 chi fosse prima che gli strati di cera cominciassero a "
        "coprirlo \u2014 uno dopo l\u2019altro, colata dopo colata, finch\u00e9 il volto sotto "
        "non \u00e8 rimasto che un moncone liscio in cui, a tratti, sotto una certa luce, "
        "affiorano lineamenti che non sono i suoi. Non si affretta mai: chi vive "
        "nell\u2019unico luogo di Roccamora dove il tempo non passa non ha motivo di farlo. "
        "Le sue mani, quando si muovono, colano ancora cera calda a ogni passo, lasciando "
        "una scia che si indurisce sul pavimento della cripta \u2014 un sentiero di tutte le "
        "volte in cui si \u00e8 mosso, che nessuno ha mai contato. Il diapason d\u2019argento "
        "\u00e8 l\u2019unica cosa che sembra davvero disturbarlo: la vibrazione, da vicino, "
        "incrina la superficie di cera come una crepa nel ghiaccio \u2014 la guardia gli "
        "resta incrinata per il resto della notte, e per un lungo momento deve "
        "fermarsi a ricomporsi.",
    'LO SGHERRO':
        "Roccamora ha una malavita antica quanto i suoi canali, e il Coro Sommerso non ha "
        "avuto bisogno di inventarne una nuova: gli \u00e8 bastato affittarla. Gli Sgherri "
        "sono barcaioli che hanno smesso di remare, disertori di guarnigioni lontane, "
        "ex galeotti che il fiume ha ributtato a riva \u2014 gente che sfondava teste per pochi "
        "soldi molto prima che sotto la citt\u00e0 qualcosa si mettesse a cantare, e continuer\u00e0 "
        "a farlo il giorno dopo che il canto sar\u00e0 cessato, per chiunque paghi meglio. Il "
        "culto non li converte, "
        "non li accorda, non gli mette la maschera: li paga in anticipo, e loro non fanno "
        "domande su cosa proteggono o perch\u00e9. Girano quasi sempre in coppia o in gruppo, "
        "bastone in una mano e coltellaccio nell\u2019altra, e sanno coprirsi le spalle a "
        "vicenda con la disinvoltura di chi lo fa da anni per mestiere: adiacenti tra loro, "
        "si passano parole basse e si scambiano la posizione senza bisogno di guardarsi.",
    'IL SICARIO':
        "Non porta maschera n\u00e9 cera, e questo lo rende pi\u00f9 inquietante di chi la "
        "porta: significa che sceglie di essere l\u00ec, ogni volta, con la testa lucida e "
        "niente da recitare. Una lama sottile, tenuta come si tiene qualcosa di prezioso, e "
        "la pazienza fredda di chi ha imparato a contare i respiri di un bersaglio prima di "
        "avvicinarsi. Non attacca mai chi \u00e8 nel pieno delle forze, circondato da amici, "
        "attento: aspetta, si sposta ai margini, osserva chi zoppica, chi resta indietro, "
        "chi si \u00e8 allontanato un passo di troppo dal gruppo \u2014 e quando lo trova, il "
        "colpo arriva da un angolo che nessuno stava guardando. \u00c8 un mestiere che si "
        "impara ai moli, tra i contrabbandieri, non nei conventicoli del culto: viene pagato "
        "meglio degli Sgherri, e lo sa. Fragile sotto la lama, per\u00f2 \u2014 chi riesce a "
        "chiudere la distanza prima che lui scelga il momento, di solito lo abbatte in "
        "fretta.",
}

# BIO_SCHEDA: versione estesa e immersiva della biografia, usata SOLO sulla
# Scheda Personaggio (gen_deluxe.py), dove c'e' spazio per respirare. La carta
# Eroe (cards-data.js) tiene la versione breve di BIO: sulla carta lo spazio e'
# poco e il ritratto e' il protagonista. Convenzione da mantenere per ogni
# espansione (vedi PROMPT-ESPANSIONE.md): un eroe nuovo porta entrambe le
# versioni. Se un eroe non ha BIO_SCHEDA, la scheda ripiega sulla BIO breve.
BIO_SCHEDA = {
    'ELENA FOSCO':
        "Da bambina si addormentava al piano di sopra mentre suo padre, di sotto, "
        "smontava le bugie degli imputati come si smonta un orologio, e sua madre, "
        "in teatro, teneva in pugno mille persone con una nota tenuta un istante di "
        "troppo. Ha imparato da entrambi la stessa cosa: che la verita\u2019 e\u2019 una "
        "questione di tempo e di orecchio. Lascio\u2019 la polizia la notte in cui un "
        "commissario le mise una mano sulla spalla e le disse, paterno, di lasciar "
        "perdere il \u201ccaso del pozzo\u201d \u2014 e lei capi\u2019 dal peso di quella mano che "
        "sapeva. Ora porta il bastone animato di suo padre e la lente con cui lui "
        "leggeva i contratti; di sua madre le resta l\u2019abitudine di canticchiare "
        "sottovoce quando pensa, e il fastidio fisico, quasi una nausea, davanti a "
        "una storia che stona. Non crede ai fantasmi. Crede, con freddezza, ai "
        "colpevoli che hanno bisogno che tu ci creda.",
    'DOTT. ATTILIO MARN':
        "Ha aperto l\u2019ambulatorio nei vicoli bassi da giovane, con l\u2019idea di fare del "
        "bene; vent\u2019anni dopo sa che la citta\u2019 uccide piu\u2019 della malaria, e che nessun "
        "titolo dell\u2019Accademia insegna a riconoscere l\u2019odore della paura in una stanza. "
        "Cura chiunque bussi, all\u2019ora che sia, senza chiedere come si e\u2019 procurato la "
        "ferita \u2014 e proprio per questo ha visto cose che i colleghi archivierebbero come "
        "delirio: pupille che non reagiscono alla luce, morti troppo composti, cera nera "
        "sotto le unghie di gente che giura di non aver mai toccato una candela. Ha "
        "smesso di raccontarle, e ha cominciato ad annotarle, in una grafia minuta che "
        "solo lui rilegge. Nella borsa, tra garze e sali, tiene un bisturi piu\u2019 lungo "
        "del necessario. Non lo ha mai usato su un vivo. Se lo porta comunque.",
    'SIBILLA REVE':
        "Legge le carte alle vedove per denaro, ed e\u2019 vero \u2014 ma e\u2019 anche il modo "
        "migliore per farsi raccontare una citta\u2019 intera senza mai fare una domanda: "
        "chi ha paura parla, e a lei parlano tutti. Sa distinguere la superstizione "
        "dal pericolo autentico perche\u2019 il secondo l\u2019ha guardata in faccia una notte, "
        "da bambina, sul bordo di un pozzo dove qualcosa la chiamava per nome con la "
        "voce di sua madre morta. Non si e\u2019 sporta. Da allora il confine tra i due "
        "mondi, per lei, e\u2019 una linea sottile e reale come il filo di un rasoio. Il "
        "pendolo d\u2019ossidiana che porta al collo era di sua nonna, che glielo mise in "
        "mano dicendo \u201cnon e\u2019 mai stato fermo, e non fidarti di quando lo e\u2019\u201d. Non lo "
        "e\u2019 mai stato. Sibilla ha imparato a non fidarsi.",
    'NINO \u201cGRIMALDELLO\u201d CAUTO':
        "Cresciuto sui tetti, nelle intercapedini e nei sottotetti di Roccamora, "
        "conosce la citta\u2019 come un ladro conosce le tasche altrui: al buio, per tatto, "
        "senza bisogno di guardare. Da ragazzino entrava nelle case dei ricchi per "
        "rubare il pane; da uomo e\u2019 entrato una volta di troppo nel posto sbagliato, e "
        "quel lavoro finito male gli ha lasciato addosso un debito con gente che non "
        "dimentica e una ragione, per ora, di stare dalla parte giusta. Ride facile, "
        "parla troppo, e tiene sempre un occhio sull\u2019uscita piu\u2019 vicina \u2014 un\u2019abitudine "
        "che gli ha salvato la pelle piu\u2019 volte delle sue mani veloci. Le serrature, "
        "dice, sono domande poste male: basta capire cosa vogliono sentirsi chiedere. "
        "Delle porte che ha aperto negli ultimi tempi, alcune avrebbe preferito "
        "lasciarle chiuse.",
    'OTTONE \u201cMEZZENA\u201d MASSARI':
        "Il banco dei Massari sta al Vecchio Mercato da tre generazioni, e Ottone "
        "conosce Roccamora dalla pancia: sa chi mangia e chi digiuna, chi festeggia e "
        "chi, da qualche tempo, ha smesso di aver fame. Grande, rumoroso, generoso di "
        "vino e di risate, e\u2019 l\u2019uomo con cui tutti si confidano perche\u2019 nessuno lo "
        "teme \u2014 a torto: dietro il grembiule insanguinato del macellaio c\u2019e\u2019 una mente "
        "che non dimentica un volto. Ha cominciato a farsi domande quando il suo "
        "garzone spari\u2019 durante la festa di San Teodoro e torno\u2019 tre giorni dopo senza "
        "appetito e senza voce, con lo sguardo di chi ha lasciato qualcosa di se\u2019 da "
        "qualche parte, al buio. Dice che una citta\u2019 si legge a tavola: dove la gente "
        "smette di mangiare e di ridere, li\u2019 sotto c\u2019e\u2019 il male. Alla festa, quest\u2019anno, "
        "non e\u2019 andato nessuno.",
    'CARLA DOSTI':
        "Prima donna in redazione al Corriere di Roccamora, la misero ai necrologi per "
        "toglierla di mezzo \u2014 e fu il loro errore: Carla scopri\u2019 che i necrologi, letti "
        "in fila e nell\u2019ordine giusto, raccontano storie che nessun direttore vuole "
        "stampare. Tre annegati in un mese nello stesso tratto di canale. Un fonditore "
        "morto \u201cper cause naturali\u201d con le mani ustionate. Nomi che ricorrono, orari "
        "che coincidono. Ha una macchina fotografica a soffietto che porta sempre con "
        "se\u2019, una memoria feroce che non perdona ne\u2019 le bugie ne\u2019 chi le dice, e la "
        "convinzione ostinata \u2014 pericolosa, in questa citta\u2019 \u2014 che la verita\u2019 sia un "
        "diritto di tutti, anche quando e\u2019 indicibile, anche quando conviene a molti "
        "che resti sepolta. Ha gia\u2019 ricevuto il primo avvertimento. Lo ha fotografato.",
    'DOTT. LAZZARO SERRA':
        "Il manicomio di Roccamora sta su un\u2019isola che le mappe della citta\u2019 preferiscono "
        "lasciare bianca, e Lazzaro Serra lo dirige da undici anni con la pazienza di chi "
        "ha smesso di aspettarsi gratitudine. I colleghi del continente lo compatiscono; "
        "lui li lascia fare, perche\u2019 sa una cosa che loro non sanno: i suoi pazienti non "
        "delirano a caso. Da anni trascrive tutto \u2014 le parole ripetute alle tre di notte, "
        "i disegni d\u2019acqua e di campane, i nomi che nessun ricoverato potrebbe conoscere \u2014 "
        "e i quaderni, ormai, sono piu\u2019 di trenta. Quando tre internati che non si erano "
        "mai incontrati cominciarono a cantare la stessa melodia nella stessa settimana, "
        "smise di chiamarla coincidenza. Ha una voce che calma i furiosi e inchioda i "
        "bugiardi, mani ferme, e un\u2019unica paura: che i matti abbiano ragione, e di essere "
        "rimasto l\u2019unico sano ad ascoltarli.",
    'PADRE CELSO MARANI':
        "Il verbale dell\u2019esorcismo di Ca\u2019 Landi, ottobre 1884, e\u2019 chiuso in un cassetto "
        "della Curia con la sua firma in calce: e\u2019 per quello che l\u2019hanno sospeso, non "
        "per il rito. Perche\u2019 Padre Celso non scrisse \u201cisteria\u201d come volevano, ne\u2019 "
        "\u201cdemonio\u201d come speravano \u2014 scrisse quello che la ragazza aveva detto con la voce "
        "sbagliata: nomi, date e un canto, e che qualcosa, sotto Roccamora, rispondeva. "
        "Da allora dice messa in una cappella sconsacrata per un pugno di vecchie che non "
        "fanno domande, e continua il mestiere senza piu\u2019 chiedere permesso a nessuno: "
        "benedice le soglie ai portuali, ascolta confessioni che nessun tribunale "
        "vorrebbe sentire, e ha imparato a riconoscere le case dove qualcosa non vuole "
        "farsi trovare \u2014 dal silenzio, dice, che non e\u2019 mai dello stesso tipo. Ha paura "
        "di una cosa sola: che la Curia avesse ragione a fermarlo, e che certe porte, una "
        "volta aperte, non lo lascino piu\u2019 tornare indietro.",
    'FULGENZIO CARBONE':
        "La bottega di Carbone non ha insegna e non ne ha bisogno: chi deve trovarla la "
        "trova, di solito di sera, di solito con un pacco sottobraccio e la voglia di "
        "disfarsene in fretta. Fulgenzio compra cio\u2019 che le famiglie di Roccamora vogliono "
        "far sparire \u2014 reliquie di santi mai canonizzati, diari con le pagine cucite, "
        "specchi che le domestiche si rifiutano di pulire \u2014 e paga bene, purche\u2019 gli si "
        "dica la verita\u2019 sulla provenienza. Non rivende quasi mai: il retrobottega e\u2019 un "
        "archivio di cose che non stanno ferme di notte, catalogate con calligrafia "
        "minuta e maniacale. Sostiene che ogni oggetto ricordi le mani che l\u2019hanno "
        "toccato, e che basti saperlo interrogare; i pochi che l\u2019hanno visto farlo \u2014 la "
        "lente all\u2019occhio, il monile che oscilla \u2014 giurano che a un certo punto la bottega "
        "trattiene il fiato. Sa di collezionare esche. Spera solo di non essere lui, alla "
        "fine, il pesce.",
    'OTTAVIO BRERA':
        "Trent\u2019anni di sentenze nel tribunale di Roccamora lasciano due cose: la memoria "
        "dei volti \u2014 tutti, imputati, testimoni, bugiardi \u2014 e un elenco di rimorsi "
        "rilegato meglio di qualunque codice. In cima all\u2019elenco di Ottavio Brera c\u2019e\u2019 il "
        "caso del pozzo, archiviato nel 1876 con una firma che era la sua: la bambina "
        "diceva che qualcosa l\u2019aveva chiamata per nome dall\u2019acqua, e lui scrisse "
        "\u201csuggestione\u201d perche\u2019 era l\u2019anno della promozione. In pensione da tre anni, ha "
        "smesso di dormire bene e ha cominciato a rimediare: riapre fascicoli che nessuno "
        "reclama, paga di tasca sua le perizie che il tribunale nego\u2019, e cammina per la "
        "citta\u2019 senza scorta perche\u2019 la malavita, quella vera, il giudice Brera lo saluta "
        "ancora togliendosi il cappello \u2014 meta\u2019 per rispetto, meta\u2019 per paura. Sa che il "
        "culto compra i bravacci a giornata. E sa che nessuno di loro morira\u2019 per una "
        "causa che non paga il sabato.",
    'MORA \u201cSPILLA\u201d FANTI':
        "A Roccamora la chiamano \u201cSpilla\u201d perche\u2019 dicono che con un sandolo infila "
        "qualunque canale, anche quelli che sulle mappe non ci sono piu\u2019. Di giorno "
        "trasporta legname e sale; di notte, quello che paga meglio \u2014 tabacco di "
        "contrabbando, lettere che non devono passare per la posta, una volta un uomo "
        "che doveva sparire da una citta\u2019 e comparire in un\u2019altra. Ha imparato a leggere "
        "l\u2019acqua prima di leggere le lettere, e i capelli cortissimi se li e\u2019 tagliata "
        "lei stessa, a coltello, il primo inverno che ha dovuto passare per un ragazzo "
        "per non farsi fermare alla dogana. Ombra, il furetto che le dorme in tasca, "
        "viene da un carico mai consegnato: doveva finire in un laboratorio universitario "
        "per essere sezionato, e Mora ha deciso che quella notte il fiume avrebbe reso "
        "un favore a qualcuno per una volta. Conosce ogni sporgenza, ogni cancello "
        "rotto, ogni guardia corruttibile tra la Banchina e l\u2019Archivio. Non le importa "
        "cosa il culto nasconda sotto Roccamora: le importa che le sue rotte, di colpo, "
        "non sono piu\u2019 sicure.",
}

BIO = {
    'ELENA FOSCO':
        "Figlia di un giudice e di una cantante d\u2019opera, ha ereditato dal primo il metodo "
        "e dalla seconda l\u2019orecchio per le stonature: nelle voci, nelle storie, negli "
        "alibi. Ha lasciato la polizia dopo che un caso \u201cimpossibile\u201d fu archiviato "
        "con troppa fretta; da allora archivia lei, a modo suo. Non crede ai fantasmi: crede "
        "ai colpevoli che li inventano.",
    'DOTT. ATTILIO MARN':
        "Vent\u2019anni di ambulatorio nei quartieri bassi, dove si impara che la citt\u00e0 "
        "uccide pi\u00f9 della malaria. Ha visto cose di cui i colleghi dell\u2019Accademia "
        "riderebbero, e ha smesso di raccontarle. Cura chiunque bussi, annota tutto, e nella "
        "borsa porta un bisturi pi\u00f9 lungo del necessario.",
    'SIBILLA REVE':
        "Dicono legga le carte alle vedove per denaro; \u00e8 vero, ed \u00e8 il modo migliore "
        "per ascoltare la citt\u00e0. Sa distinguere la superstizione dal pericolo vero, perch\u00e9 "
        "il secondo l\u2019ha guardata in faccia una notte, da bambina, sul bordo di un pozzo. "
        "Il pendolo che porta era di sua nonna. Non \u00e8 mai stato fermo.",
    'NINO \u201cGRIMALDELLO\u201d CAUTO':
        "Cresciuto sui tetti e nelle intercapedini di Roccamora, conosce la citt\u00e0 come un "
        "ladro conosce le tasche altrui: al buio. Un lavoro finito male gli ha lasciato un "
        "debito con la persona sbagliata e un motivo per stare dalla parte giusta, almeno per "
        "ora. Le serrature, dice, sono domande: basta fare quella giusta.",
    'OTTONE \u201cMEZZENA\u201d MASSARI':
        "Il banco dei Massari sta al Vecchio Mercato da tre generazioni, e Ottone conosce "
        "Roccamora dalla pancia: sa chi mangia, chi digiuna e chi da qualche tempo non ha "
        "pi\u00f9 fame. Ci pensa da quando il suo garzone spar\u00ec durante la festa di San "
        "Teodoro e torn\u00f2 tre giorni dopo, senza appetito e senza voce. Dice che la "
        "citt\u00e0 si legge a tavola: dove si smette di mangiare e di ridere, l\u00ec "
        "c\u2019\u00e8 il male.",
    'CARLA DOSTI':
        "Prima donna in redazione al Corriere di Roccamora, relegata ai necrologi finch\u00e9 non "
        "ha scoperto che i necrologi, letti in fila, raccontano storie che nessuno vuole "
        "stampare. Ha una macchina fotografica, una memoria feroce e la convinzione che la "
        "verit\u00e0 sia un diritto anche quando \u00e8 indicibile.",
    'DOTT. LAZZARO SERRA':
        "Dirige il manicomio di Roccamora da undici anni. I suoi pazienti \u201csentono\u201d cose "
        "che i sani non sentono, e lui ha smesso da tempo di liquidarle come deliri: le "
        "trascrive tutte, quaderno dopo quaderno. Quando tre internati mai incontratisi "
        "cominciarono a cantare la stessa melodia, smise di chiamarla coincidenza.",
    'PADRE CELSO MARANI':
        "Sospeso a divinis dopo un esorcismo finito male \u2014 non perch\u00e9 fall\u00ec, ma per quello "
        "che mise a verbale. La Curia lo vuole dimenticare; lui continua il mestiere senza "
        "pi\u00f9 chiedere permesso, e ha imparato a riconoscere le case dove qualcosa non "
        "vuole farsi trovare.",
    'FULGENZIO CARBONE':
        "La sua bottega senza insegna compra ci\u00f2 che le famiglie di Roccamora vogliono far "
        "sparire: reliquie, diari cuciti, specchi che nessuno vuole pulire. Non rivende "
        "quasi mai \u2014 non per scrupolo, per collezione. Dice che ogni oggetto ricorda le "
        "mani che l\u2019hanno toccato, e che basta saperlo interrogare.",
    'OTTAVIO BRERA':
        "Trent\u2019anni di sentenze: conosce per nome ogni criminale della citt\u00e0 e il rimorso "
        "di ogni fascicolo archiviato troppo in fretta. Il caso del pozzo lo firm\u00f2 lui, "
        "nel 1876. In pensione ha smesso di dormire bene e ha cominciato a rimediare.",
    'MORA \u201cSPILLA\u201d FANTI':
        "Guida un sandolo tra i moli di notte per conto di chi paga meglio della legge. "
        "Conosce ogni canale di Roccamora, anche quelli che sulle mappe non ci sono pi\u00f9. "
        "Il furetto Ombra le dorme in tasca da quando l\u2019ha salvato da un carico mai "
        "consegnato.",
}

_FLAVOR = {
    'ADEPTO IN AGGUATO': 'Una sagoma si stacca dal buio, il volto una lastra di cera liscia.',
    'VOLTI TRA LE CASSE': 'Tra le pile, un volto liscio che non respira. Vi guarda da un pezzo.',
    'IL FALCETTO NEL BUIO': 'Il fischio sottile di una lama da fonditore, proprio dietro di voi.',
    'LA VEDETTA': 'Chi resta solo, a Roccamora, non resta solo a lungo.',
    'UNGHIE SULLA PIETRA': 'Dal buio dell\u2019ingresso, un galoppo basso che non rallenta.',
    'LA MAREA DI CERA': 'Il gorgoglio si fa coro: i mestoli avanzano tutti insieme.',
    'CERA SOTTO I PIEDI': 'Il pavimento cede morbido sotto lo stivale. Era ancora calda.',
    'IL CANTO SALE': 'Una voce sola, sottile, cerca il tono giusto. Lo trova.',
    'IL CORO RISPONDE': 'Dieci voci. Poi cento. La pietra le beve tutte.',
    'CANI DEI MOLI': 'Un ringhio basso, poi unghie sulla pietra. Troppo veloci.',
    'IL FONDITORE': 'Passi lenti, e il gorgoglio di un mestolo colmo di cera fusa.',
    'RONDA': 'Passi cadenzati e un salmodiare sommesso: non siete pi\u00f9 soli.',
    'TRAPPOLA DI CERA': 'Il pavimento luccica. Capite troppo tardi perch\u00e9.',
    'FUMI SOPORIFERI': 'Un dolciastro di sego e papavero vi riempie i polmoni.',
    'IL CANTO CRESCE': 'Le voci salgono di un tono. Sotto i piedi, la pietra vibra.',
    'PRESAGIO': 'Una candela si spegne da sola. Nessuno ha fiatato.',
    'ECO AMICA': 'Tre colpi sordi, ostinati: qualcuno, l\u00e0 sotto, \u00e8 ancora vivo.',
    'CERA CHE COLA': 'Dalle travi piove cera bollente, filo dopo filo.',
    'CORRENTE GELIDA': 'Un freddo d’acqua nera risale i condotti e vi entra nelle ossa.',
    'BRAVI SUL MOLO': 'Passi pesanti e un fischio: i bravacci del molo sono sul libro paga del culto.',
    'IL BRANCO': 'Non vengono mai da soli, e si coprono le spalle a vicenda.',
    'LAMA NEL BUIO': 'Un luccichio, poi il freddo tra le scapole. Sceglie sempre il più solo.',
    'SUSSURRI': 'Qualcuno pronuncia il vostro nome. Con la vostra voce.',
}


def apply(luoghi, tiles, nemici, heroes, minacce):
    """Applica i testi estesi alle strutture dati importate da gen_cards."""
    for L in luoghi:
        if L['n'] in TESTI_LUOGHI:
            L['testo'] = TESTI_LUOGHI[L['n']]
    for T in tiles:
        if T['id'] in TESTI_TILES:
            T['testo'] = TESTI_TILES[T['id']]
    for N in nemici:
        if N['nome'] in NOTE_NEMICI:
            N['note'] = NOTE_NEMICI[N['nome']]
        # bio estesa per il solo Bestiario; se manca, il fascicolo usa `note`
        N['bio_bestiario'] = BIO_BESTIARIO.get(N['nome'], N['note'])
    for hro in heroes:
        hro['bio'] = BIO.get(hro['nome'], '')
        # bio estesa per la sola Scheda Personaggio; se manca, la scheda usa la breve
        hro['bio_scheda'] = BIO_SCHEDA.get(hro['nome'], hro['bio'])
    nuove = []
    for titolo, txt, tipo, subito in minacce:
        fl = _FLAVOR.get(titolo)
        nuove.append((titolo, ('<i>%s</i><br/><br/>%s' % (fl, txt)) if fl else txt, tipo, subito))
    return nuove
