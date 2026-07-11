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
    "Trovatelo. Avete <b>8 ore</b>, dalle 18:00 alle 2:00: dopo, temo, sar\u00e0 tardi. "
    "Segnate ogni ora sul Taccuino e annotate tutto: nomi, orari, e ogni parola scritta "
    "in MAIUSCOLO.<br/>\u2014 M., presidente della Societ\u00e0\u00bb<br/><br/>"
    "<i>Luoghi disponibili dall\u2019inizio: 1, 2, 3, 4, 8. Gli altri vanno sbloccati. A mezzanotte l\u2019Archivio Civico (7) chiude i battenti.</i>")

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
       "la porta sul retro cede a una spallata. Dentro, violini appesi come selvaggina e un "
       "silenzio sbagliato per un luogo nato per fare musica. Il banco da lavoro \u00e8 in "
       "ordine perfetto: chi \u00e8 partito, sapeva di partire.",
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
    'T3': "Migliaia di candele nere trasformano il corridoio in una gola di luce tremolante; "
          "il caldo \u00e8 innaturale, la cera cola dalle mensole come pioggia lenta. Chi entra "
          "per la prima volta prova NERVI (Media): se fallisce, 1 danno (cera bollente).",
    'T4': "Una scrivania sommersa di spartiti annotati con grafia febbrile, un pagliericcio "
          "che puzza di sego, una tazza ancora tiepida. Il custode non \u00e8 lontano.",
    'T5': "Gradini viscidi scendono in un buio che canta: a ogni passo le voci si fanno pi\u00f9 "
          "nitide, e pi\u00f9 sbagliate. Chi scende prova NERVI (Facile): se fallisce, ha 1 sola "
          "azione al prossimo turno.",
    'T6': "Un altare di pietra nera in un cerchio di candele: la cera ha colato per anni, fino a "
          "formare stalattiti. Dietro, una cella con Ruggero. QUANDO RIVELATE QUESTA TESSERA: "
          "appare il Custode della Cera con 2 Adepti. La cella si apre con la chiave (T4) o "
          "scassinando (ACUME Difficile).",
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
    for hro in heroes:
        hro['bio'] = BIO.get(hro['nome'], '')
    nuove = []
    for titolo, txt, tipo, subito in minacce:
        fl = _FLAVOR.get(titolo)
        nuove.append((titolo, ('<i>%s</i><br/><br/>%s' % (fl, txt)) if fl else txt, tipo, subito))
    return nuove
