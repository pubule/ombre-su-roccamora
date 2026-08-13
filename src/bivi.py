# -*- coding: utf-8 -*-
"""I BIVI DI CAMPAGNA, in forma che il motore possa applicare.

A fine episodio il gruppo decide insieme e sigilla la scelta sul retro di un
Frammento; quella scelta cambia le REGOLE di uno o piu' episodi successivi.
Finora esisteva solo sui fascicoli: il tavolo la applicava a mano, e la webapp
non ne sapeva niente — chi giocava a schermo prendeva una decisione che l'app
dimenticava, e l'episodio dopo partiva con le regole sbagliate.

PERCHE' UN FILE A PARTE. Le conseguenze sono gia' scritte nei generatori, ma
dentro le funzioni che disegnano il PDF: sono paragrafi, non costanti, e non si
possono importare. Le alternative erano riscrivere venti generatori (invasivo, e
i PDF sono la fonte stampata) o leggerne il sorgente a colpi di regex (fragile).
Qui invece la traduzione sta in un posto solo, si legge tutta insieme, e
`test-bivi.mjs` controlla che nessun Bivio dei fascicoli sia rimasto indietro.

LA FORMA. Ogni Bivio ha due opzioni; ognuna porta una lista di EFFETTI TIPIZZATI
— non prosa da interpretare a runtime. Un effetto dice sempre su QUALE episodio
cade, perche' un Bivio non colpisce solo quello dopo: quello dell'Ep.8 si applica
in Ep.13, 14 e 16, e quello dell'Ep.11 arriva fino all'Ep.20.

I TIPI DI EFFETTO, e cosa fanno:

    canto-iniziale   {val}                 il Canto parte da li'
    soglia-canto     {val}                 quanti segnalini prima che il rituale monti
    ore              {val}                 ore d'Indagine in piu' (o in meno, se negativo)
    mazzo-aggiungi   {carta, quante?}      una carta Minaccia entra nel mazzo
    mazzo-togli      {carta}               una carta Minaccia esce dal mazzo
    approfondimento-togli {carta}          un Testimone/Approfondimento non e' piu' disponibile
    carica           {chi, val}            cariche di un'abilita' (Litania 2 invece di 1)
    luogo-aperto     {luogo}               un luogo si ottiene senza superare la prova
    testimone-muto   {luogo}               un testimone non parla piu'
    conferma         {domanda}             una conferma in piu' su una Domanda
    nota             {testo}               niente di meccanico: va detto e basta

`nota` esiste perche' alcune conseguenze sono di regia («designate chi porta lo
spartito») e non hanno un numero da cambiare: meglio dirle a chi arbitra che
fingere che non esistano.
"""

BIVI = {
    # ---------------------------------------------------------------- PRELUDIO
    # src/gen_preludio.py — «bivio — decidete insieme, annotatelo, contera'
    # nell'episodio 1». Il reperto e' la pagina strappata del registro.
    'preludio': {
        'titolo': 'La pagina strappata del registro',
        'domanda': 'La pagina strappata del registro è una prova di reato. '
                   'La consegnate alla gendarmeria, o la tenete nell’archivio della Società?',
        'opzioni': [
            {
                'id': 'gendarmeria',
                'titolo': 'Alla gendarmeria',
                'testo': 'Il brigadiere vi registra come «investigatori privati».',
                'effetti': [
                    {'ep': 'ep1', 'tipo': 'luogo-aperto', 'luogo': 'La Gendarmeria',
                     'nota': 'Il brigadiere vi riconosce: il fascicolo che nasconde '
                             'si ottiene senza convincerlo.'},
                ],
            },
            {
                'id': 'archivio',
                'titolo': 'Nell’archivio della Società',
                'testo': 'M. la studia.',
                'effetti': [
                    {'ep': 'ep1', 'tipo': 'ore', 'val': 1,
                     'nota': 'M. ha studiato la pagina: cominciate l’Indagine con 1 ora in più.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.1
    # src/gen_docs.py:825 — «IL BIVIO — decidete insieme, poi sigillate».
    # Le conseguenze sono dichiarate in src/gen_ep2.py, in apertura.
    'ep1': {
        'titolo': 'Lo spartito del primo movimento',
        'domanda': 'Sul leggio dell’altare trovate lo spartito completo del rituale, '
                   '«Dal Profondo — primo movimento», annotato dalla mano di Ferri. '
                   'Prima di lasciare il magazzino dovete scegliere.',
        'opzioni': [
            {
                'id': 'bruciarlo',
                'titolo': 'Bruciarlo',
                'testo': 'Il fuoco vi scalda le mani come un’assoluzione. Il culto dovrà '
                         'ricominciare da capo — ma anche voi perdete l’unica trascrizione '
                         'del suo canto.',
                'effetti': [
                    {'ep': 'ep2', 'tipo': 'canto-iniziale', 'val': 0,
                     'nota': 'Il culto ricomincia da capo: il Canto parte a 0.'},
                    {'ep': 'ep2', 'tipo': 'mazzo-aggiungi', 'carta': 'Polvere di Bronzo',
                     'nota': 'Il rogo ha lasciato polvere: 1 carta «Polvere di Bronzo» in più.'},
                    {'ep': 'ep2', 'tipo': 'approfondimento-togli', 'carta': 'Il facchino insonne',
                     'nota': 'Il culto ha cambiato i codici: il facchino insonne ha ricevuto '
                             'una smentita anonima e ha smesso di parlare.'},
                ],
            },
            {
                'id': 'conservarlo',
                'titolo': 'Conservarlo',
                'testo': 'Ripiegate quei fogli che sembrano pulsare. Sapere è potere — ma ora '
                         'il Coro sa che il primo movimento ce l’avete voi.',
                'effetti': [
                    {'ep': 'ep2', 'tipo': 'canto-iniziale', 'val': 1,
                     'nota': 'Lo spartito chiama: la spedizione parte col Canto a 1.'},
                    {'ep': 'ep2', 'tipo': 'mazzo-aggiungi', 'carta': 'Segugi del Coro', 'quante': 2,
                     'nota': 'Il Coro vi cerca: le 2 carte «Segugi del Coro» entrano nel mazzo.'},
                    {'ep': 'ep2', 'tipo': 'nota',
                     'testo': 'Designate chi porta lo spartito.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.2
    'ep2': {
        'titolo': 'La campana di San Teodoro',
        'domanda': 'Ilario può rifondere la campana col bronzo recuperato — o «stonarla» '
                   'di proposito, come un vaccino.',
        'opzioni': [
            {
                'id': 'rifondere',
                'titolo': 'Rifonderla giusta',
                'testo': 'La città riavrà la sua voce, e Padre Marani un alleato di bronzo.',
                'effetti': [
                    {'ep': 'ep3', 'tipo': 'carica', 'chi': 'Litania', 'val': 2,
                     'nota': 'Marani ha un alleato di bronzo: la Litania vale 2 volte invece di 1.'},
                    {'ep': 'ep3', 'tipo': 'mazzo-aggiungi', 'crescendo': True,
                     'nota': 'Uno strumento accordabile in più suona sopra Roccamora: '
                             '1 carta crescendo in più.'},
                ],
            },
            {
                'id': 'stonarla',
                'titolo': 'Stonarla',
                'testo': 'San Teodoro resterà rauca, e la piazza non ve lo perdonerà.',
                'effetti': [
                    {'ep': 'ep3', 'tipo': 'testimone-muto',
                     'nota': 'La piazza non ve lo perdona: un testimone in meno vi parlerà.'},
                    {'ep': 'ep3', 'tipo': 'soglia-canto', 'val': 4,
                     'nota': 'Il vaccino funziona: la soglia del Canto parte a 4 invece di 3.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.3
    'ep3': {
        'titolo': 'Le canne-voce',
        'domanda': 'Le canne-voce recuperate si possono aprire — o no.',
        'opzioni': [
            {
                'id': 'restituire',
                'titolo': 'Restituire le voci',
                'testo': 'Gli ammutoliti guariscono, e la cosa si sente più lontano di quanto '
                         'crediate: alla prima donna del Comunale il ricordo torna intero.',
                'effetti': [
                    {'ep': 'ep4', 'tipo': 'testimone-in-piu',
                     'nota': 'La prima donna sa chi l’ha misurata, e ha una voce per dirlo: '
                             'un testimone in più vi aspetta.'},
                    {'ep': 'ep4', 'tipo': 'mazzo-aggiungi', 'crescendo': True,
                     'nota': 'Le voci restituite hanno imparato la melodia e la canticchiano '
                             'nel sonno: 1 carta crescendo in più.'},
                ],
            },
            {
                'id': 'sigillare',
                'titolo': 'Conservarle sigillate',
                'testo': 'I muti restano muti, e la prima donna resta senza quella notte.',
                'effetti': [
                    {'ep': 'ep4', 'tipo': 'testimone-muto',
                     'nota': 'La Gazzetta ve lo fa pagare: un testimone in meno vi parlerà.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.4
    'ep4': {
        'titolo': 'La conchiglia',
        'domanda': 'La conchiglia è vostra, per una notte.',
        'opzioni': [
            {
                'id': 'distruggerla',
                'titolo': 'Distruggerla',
                'testo': 'Il Coro perde lo strumento. Ma il Comunale resta muto una stagione, '
                         'e la città non ve lo perdona.',
                'effetti': [
                    {'ep': 'ep5', 'tipo': 'canto-iniziale', 'val': 0,
                     'nota': 'Il Coro perde lo strumento: la spedizione parte col Canto a 0.'},
                    {'ep': 'ep5', 'tipo': 'testimone-muto',
                     'nota': 'Il Comunale resta muto una stagione: un testimone in meno.'},
                ],
            },
            {
                'id': 'sigillarla',
                'titolo': 'Sigillarla e conservarla',
                'testo': 'La melodia impressa nei legni è VOSTRA: al finale di campagna, varrà.',
                'effetti': [
                    {'ep': 'ep5', 'tipo': 'mazzo-aggiungi', 'crescendo': True,
                     'nota': 'Ciò che è impresso chiama: 1 carta crescendo in più.'},
                    {'ep': 'ep20', 'tipo': 'nota',
                     'testo': 'Frammento 4-bis: la melodia impressa nei legni è vostra, '
                              'e al finale di campagna varrà.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.5
    'ep5': {
        'titolo': 'Le ossa salvate',
        'domanda': 'Le ossa salvate: riconsacrarle, o tenerle come prova e strumento?',
        'opzioni': [
            {
                'id': 'riconsacrare',
                'titolo': 'Riconsacrarle e seppellirle',
                'testo': 'Il requiem che il Quarantuno non ebbe.',
                'effetti': [
                    {'ep': 'ep6', 'tipo': 'canto-iniziale', 'val': 0,
                     'nota': 'Il requiem pesa: la spedizione parte col Canto a 0.'},
                    {'ep': 'ep6', 'tipo': 'carica', 'chi': 'Litania', 'val': 2,
                     'nota': 'La Litania di Marani vale doppio.'},
                    {'ep': 'ep6', 'tipo': 'incrocio', 'val': -1,
                     'nota': 'La mappa incisa sulle canne va sottoterra con loro: '
                             'un incrocio in meno alla deduzione d’atto.'},
                ],
            },
            {
                'id': 'tenerle',
                'titolo': 'Tenerle come prova e strumento',
                'testo': 'Le ossa restano con voi — e chiamano.',
                'effetti': [
                    {'ep': 'ep6', 'tipo': 'incrocio', 'val': 1,
                     'nota': 'Un incrocio in più alla deduzione d’atto.'},
                    {'ep': 'ep6', 'tipo': 'mazzo-aggiungi', 'crescendo': True,
                     'nota': 'Le ossa chiamano: 1 carta crescendo in più.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.6
    # Da qui `ep` puo' essere una LISTA: certe conseguenze non nominano una
    # serata ma un tratto di campagna («gli Episodi 9-12», «i prossimi due»).
    'ep6': {
        'titolo': 'Ferri',
        'domanda': 'Ferri catturato vivo, o lasciato agli abissi? (conseguenze a lungo raggio)',
        'opzioni': [
            {
                'id': 'vivo',
                'titolo': 'Ferri catturato vivo',
                'testo': 'Un giorno ci sarà un processo, e sarà il processo all’uomo giusto.',
                'effetti': [
                    {'ep': ['ep7', 'ep8'], 'tipo': 'mazzo-aggiungi', 'carta': 'Malavita',
                     'nota': 'Il culto sa cosa avete capito e vi guarda: 1 carta Malavita '
                             '(sorveglianza) nei prossimi due episodi.'},
                    {'ep': 'ep18', 'tipo': 'nota',
                     'testo': 'Ferri è vivo: quando il processo verrà, sarà all’uomo giusto '
                              '(vantaggio investigativo).'},
                ],
            },
            {
                'id': 'abissi',
                'titolo': 'Ferri lasciato agli abissi',
                'testo': 'Il culto è decapitato più a lungo.',
                'effetti': [
                    {'ep': ['ep7', 'ep8'], 'tipo': 'mazzo-togli', 'crescendo': True,
                     'nota': 'Il culto è decapitato: 1 carta crescendo in meno nei prossimi due.'},
                    {'ep': 'ep18', 'tipo': 'nota',
                     'testo': 'Ferri è morto: quando il processo verrà, l’imputato lo sceglierà '
                              'qualcun altro.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.7
    'ep7': {
        'titolo': 'Il brevetto',
        'domanda': 'Il fascicolo del brevetto è in mano vostra: denunciarlo, o tacere e '
                   'tracciare gli acquirenti?',
        'opzioni': [
            {
                'id': 'denunciare',
                'titolo': 'Denunciare il brevetto',
                'testo': 'Sant’Orsola è salva e riconoscente: le demolizioni cominciano, '
                         'la contrada risente le campane e parla.',
                'effetti': [
                    {'ep': 'ep8', 'tipo': 'luogo-rivelato', 'luogo': 'Il sensale dei banchi',
                     'nota': 'La contrada parla: la Testimonianza «Il sensale dei banchi» '
                             'parte già rivelata.'},
                    {'ep': 'ep8', 'tipo': 'esame-negato', 'esame': 'oro',
                     'nota': 'Chi comprava l’intonaco brucia i registri: l’esame di Carbone '
                             'sull’oro non sarà disponibile.'},
                ],
            },
            {
                'id': 'tacere',
                'titolo': 'Tacere e tracciare gli acquirenti',
                'testo': 'Partite con la lista dei compratori.',
                'effetti': [
                    {'ep': 'ep8', 'tipo': 'conferma', 'domanda': 1,
                     'nota': 'Avete la lista dei compratori: una conferma in più alla Domanda 1.'},
                    {'ep': 'ep8', 'tipo': 'approfondimento-togli', 'carta': 'Il sensale dei banchi',
                     'nota': 'Sant’Orsola resta sorda: la Testimonianza «Il sensale dei banchi» '
                             'esce dal mazzo Approfondimenti.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.8
    # Il Bivio che colpisce piu' lontano: Ep.9-12, e poi ancora Ep.13, 14, 16.
    'ep8': {
        'titolo': 'Le casse d’oro',
        'domanda': 'Le casse sono vostre, per una notte: sequestrare l’oro, o lasciarlo '
                   'circolare e tracciarlo?',
        'opzioni': [
            {
                'id': 'sequestrare',
                'titolo': 'Sequestrare l’oro',
                'testo': 'Consegnate tutto: i clan, senza paga, si sbandano.',
                'effetti': [
                    {'ep': ['ep9', 'ep10', 'ep11', 'ep12'], 'tipo': 'mazzo-togli', 'carta': 'Malavita',
                     'nota': 'I clan si sbandano: 1 carta Malavita in meno.'},
                    {'ep': ['ep13', 'ep14', 'ep16'], 'tipo': 'nota',
                     'testo': 'La Vedova vi ha segnati: dall’Atto III la Malavita vi è '
                              'SEMPRE ostile.'},
                ],
            },
            {
                'id': 'tracciare',
                'titolo': 'Lasciarlo circolare e tracciarlo',
                'testo': 'Le casse tornano, marcate.',
                'effetti': [
                    {'ep': 'ep12', 'tipo': 'incrocio', 'val': 1,
                     'nota': 'La rete dei traccianti vale un incrocio.'},
                    {'ep': ['ep9', 'ep10', 'ep11', 'ep12'], 'tipo': 'pool-nemici',
                     'chi': 'LO SGHERRO', 'val': 1,
                     'nota': 'I clan si consolidano: +1 Sgherro nel pool nemici.'},
                ],
            },
        ],
    },

    # -------------------------------------------------------------------- EP.9
    'ep9': {
        'titolo': 'Il teste Riva',
        'domanda': 'Far deporre il teste, o nasconderlo e perdere la causa?',
        'opzioni': [
            {
                'id': 'deporre',
                'titolo': 'Far deporre il teste',
                'testo': 'All’alba Riva depone: la verità resta a verbale.',
                'effetti': [
                    {'ep': 'ep18', 'tipo': 'incrocio', 'val': 1,
                     'nota': 'La deposizione di Riva è a verbale: un incrocio in più alla '
                             'deduzione d’atto.'},
                    {'ep': ['ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17',
                            'ep18', 'ep19', 'ep20'], 'tipo': 'alleato-meno',
                     'nota': 'Riva va protetto per sempre (programma testimoni): un PNG-alleato '
                             'in meno per il resto della campagna.'},
                ],
            },
            {
                'id': 'nascondere',
                'titolo': 'Nasconderlo e perdere la causa',
                'testo': 'Senza il teste in aula, la sentenza-beffa scredita la Società.',
                'effetti': [
                    {'ep': ['ep10', 'ep11', 'ep12'], 'tipo': 'approfondimento-togli',
                     'nota': 'La sentenza-beffa vi scredita: un Testimone in meno nel mazzo '
                             'Approfondimenti.'},
                    {'ep': 'ep17', 'tipo': 'fonte-segreta', 'chi': 'Riva',
                     'nota': 'Riva, vivo e libero e in debito con voi, è la fonte segreta '
                             'di questa serata.'},
                ],
            },
        ],
    },
}
