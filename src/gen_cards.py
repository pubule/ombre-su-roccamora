# -*- coding: utf-8 -*-
"""Ombre su Roccamora - dati di gioco (fonte autoritativa).

Solo dati: eroi, luoghi dell'Indagine, oggetti trovabili, mazzo Minaccia,
nemici, tessere. Il rendering dei PDF vive in gen_gothic.py (Indagine,
Spedizione), gen_deluxe.py (Schede) e gen_narrator.py (Luoghi, riferimenti per
chi arbitra); le carte immagine in scripts/cardconjurer/ (compreso il fronte/
retro pronto da stampare, generate-print-sheets.js, dorso Approfondimenti con
solo il tipo, mai il luogo). I testi estesi per l'immersione stanno in
story.py e vengono applicati con story.apply().

Approfondimenti: ogni luogo puo' avere indizi extra "gated", ognuno di un tipo
(Osservazione/Referto/Testimonianza/Presagio) che si sblocca con l'abilita' di
un eroe presente. Sono sempre BONUS: le 4 Domande restano risolvibili dai soli
`indizi` core.
"""

# ================================================================= EROI
HEROES = [
    dict(nome='ELENA FOSCO', ruolo='L’Investigatrice', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Occhio Clinico</b> — In indagine: due volte per episodio legge le '
               '<b>Osservazioni</b> nascoste di un luogo. In spedizione: +2 alle '
               'prove di Cercare.'),
         equip='Bastone animato (arma, +1), lente d’ingrandimento, taccuino rilegato.'),
    dict(nome='DOTT. ATTILIO MARN', ruolo='Il Medico', acume=2, vigore=2, nervi=2,
         salute=7, difesa=8,
         abil=('<b>Pronto Soccorso</b> — In spedizione, tre volte, con un’azione cura '
               '2 Salute a un eroe adiacente o a sé stesso. Rianimare gli riesce sempre '
               'riportando l’eroe a 3 Salute invece che a 2. In indagine: una volta per '
               'episodio redige un <b>Referto</b> — esamina la scena e ne ricava un fatto '
               'forense che agli altri sfugge.'),
         equip='Bisturi lungo (arma, +1), borsa medica, sali aromatici.'),
    dict(nome='SIBILLA REVE', ruolo='L’Occultista', acume=2, vigore=1, nervi=3,
         salute=6, difesa=8,
         abil=('<b>Sesto Senso</b> — In indagine: una volta per episodio il pendolo si '
               'ferma su un luogo presente: leggetene un <b>Approfondimento qualsiasi</b> '
               '(Osservazione, Testimone, Referto o Presagio); se non ne ha, il pendolo '
               'indica un luogo che ne nasconde uno. In spedizione: tre volte per '
               'spedizione, prima della fase Minaccia, guarda le prime 2 carte del mazzo e '
               'mettine una in <b>fondo</b> al mazzo; l’altra torna in cima.'),
         equip='Pugnale rituale (arma, +1), pendolo d’ossidiana, gessetti.'),
    dict(nome='NINO “GRIMALDELLO” CAUTO', ruolo='Il Ladro', acume=2, vigore=2, nervi=1,
         salute=7, difesa=9,
         abil=('<b>Grimaldello</b> — Serrature e lucchetti: per Nino ogni prova per '
               'scassinare cala di un grado (Difficile→Media, Media→Facile). '
               'Inoltre si muove di 5 caselle invece di 4. In indagine: una volta per '
               'episodio scassina l’ingresso di <b>un luogo bloccato</b> ed entra senza '
               'la parola chiave o l’oggetto richiesto.'),
         equip='Sfollagente (arma, +1), grimaldelli, corda con rampino.'),
    dict(nome='OTTONE “MEZZENA” MASSARI', ruolo='Il Macellaio', acume=1, vigore=3, nervi=2,
         salute=8, difesa=8,
         abil=('<b>Un bicchiere con tutti</b> — In indagine: una volta per episodio, '
               'offrendo da bere e da mangiare, convince un <b>Testimone</b> reticente: '
               'prendetene la carta Testimone. In spedizione, <b>Colpo da macello</b>: '
               'una volta per turno, se abbatte un nemico in mischia attacca '
               'immediatamente un altro nemico adiacente.'),
         equip='Mannaia del banco (arma, +1), grembiule di cuoio, fiasco di vino robusto '
               '(2 usi: un sorso, anche su un eroe adiacente, annulla un effetto di paura o dei fumi).'),
    dict(nome='CARLA DOSTI', ruolo='La Giornalista', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Fonti riservate</b> — In indagine: una volta per episodio una visita non '
               'costa nessuna ora (non conta come ora avanzata a fine indagine); inoltre, con '
               'la tessera stampa, convince il <b>Testimone</b> di un luogo (carta). In '
               'spedizione: <b>Flash!</b> (2 usi) — azione: un nemico entro 2 caselle salta '
               'la sua prossima attivazione.'),
         equip='Ombrello ferrato (arma, +1), macchina fotografica, blocco note.'),
    dict(nome='DOTT. LAZZARO SERRA', ruolo='L’Alienista', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>I deliri sanno</b> — In indagine: una volta per episodio legge i '
               '<b>Presagi</b> nascosti di un luogo. In spedizione, <b>Voce ferma</b>: gli '
               'eroi a lui adiacenti tirano le prove di NERVI con +2.'),
         equip='Bastone da passeggio (arma, +1), taccuino dei colloqui, boccetta di laudano.'),
    dict(nome='PADRE CELSO MARANI', ruolo='L’Esorcista Sospeso', acume=2, vigore=1, nervi=3,
         salute=6, difesa=8,
         abil=('<b>Discernimento</b> — In indagine: una volta per episodio indica un luogo; '
               'chi tiene il fascicolo Luoghi dice se vi si nasconde ancora qualcosa (solo '
               'sì o no, mai cosa). In spedizione, <b>Litania</b> (1 volta): con un’azione '
               'la sua voce copre il coro — rimuovete 1 segnalino Canto.'),
         equip='Crocifisso di ferro (arma, +1), breviario annotato, stola consunta.'),
    dict(nome='FULGENZIO CARBONE', ruolo='L’Antiquario dell’Occulto', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>È passato dalla mia bottega</b> — In indagine: una volta per episodio, '
               'esaminando un <b>Oggetto o un Reperto</b> trovato, ne ricava un dettaglio '
               'in più. In spedizione, <b>Esca preziosa</b> (2 usi): azione — lancia un '
               'monile su una casella entro 3: i nemici entro 2 caselle dall’esca si '
               'muovono verso di essa nella loro prossima attivazione, invece che verso '
               'di voi.'),
         equip='Bastone col pomo d’argento (arma, +1), lente da gioielliere, monili d’esca.'),
    dict(nome='OTTAVIO BRERA', ruolo='Il Magistrato in Pensione', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Riaprire i fascicoli</b> — In indagine: una volta per episodio legge i '
               '<b>Referti</b> nascosti di un luogo. In spedizione, <b>Vi conosco, '
               'Malacarne</b> (1 volta): fissa un nemico di tipo <b>Malavita</b> in vista '
               'e lo chiama per nome — quello abbassa il ferro e sparisce nel buio: '
               'rimuovetelo dal tabellone.'),
         equip='Bastone da magistrato (arma, +1), toga ripiegata, fascicoli rilegati.'),
]

# ================================================================= INDAGINE
# Ogni luogo: `indizi` = core (sempre letti, sulla carta Luogo). `approfondimenti`
# = gated, ognuno {tipo, testo, [soggetto]}. Osservazione/Presagio finiscono
# sulla carta "Indizio Nascosto" del luogo; Referto/Testimonianza diventano carte
# a sé (mazzi Referti/Testimoni), col titolo = soggetto.
#
# ECHI_DEL_CORO: famiglia di 4 varianti che il generatore di carte (cards-data.js)
# appende IN CODA a tutte e 14 le carte Approfondimento (Indizi/Testimoni/Referti),
# a rotazione per luogo (n % 4) - non piu' un frammento identico su ogni carta.
# Ogni variante porta comunque lo STESSO nucleo garantito (nome esatto del
# nascondiglio, Domanda 1; Ferri capo e non solo coinvolto, Domanda 2): rende
# l'uso delle abilità un requisito reale non importa di chi, perché qualunque
# singola carta pescata - anche una sola in tutta la partita - basta da sola.
# In più ogni variante aggiunge un accenno diverso che tocca anche la Domanda 3
# (il ritmo 3-1-5, corroborazione, non serve a risolverla: già risolvibile dal
# solo core) o la Domanda 4 (l'urgenza del diapason), cosi' il meccanismo non
# ignora metà delle 4 Domande e non suona sempre uguale carta dopo carta.
# L'indizio core del Luogo 6 resta ammorbidito apposta (non nomina il magazzino).
# Vedi gen_docs.py soluzione() per la nota al Narratore.
ECHI_DEL_CORO = [
    'Per un istante, chi scava davvero a fondo sente lo stesso sussurro, ovunque si trovi: '
    '«il Magazzino delle Cere che fu di Dellacqua — lì Bastiano Ferri guida ancora il canto, '
    'alle 3 di ogni notte, come le campane comandano.»',
    'Per un istante, chi scava davvero a fondo sente lo stesso sussurro, ovunque si trovi: '
    '«è la voce di Bastiano Ferri a guidare il coro, nel Magazzino delle Cere che fu di '
    'Dellacqua — nessun altro osa cantare per primo.»',
    'Per un istante, chi scava davvero a fondo sente lo stesso sussurro, ovunque si trovi: '
    '«tre, poi uno, poi cinque: è il verso che apre ogni porta del Coro, cantato nel '
    'Magazzino delle Cere che fu di Dellacqua, dove Ferri guida ancora il canto.»',
    'Per un istante, chi scava davvero a fondo sente lo stesso sussurro, ovunque si trovi: '
    '«solo l’argento intonato può spezzare il canto — portatelo nel Magazzino delle Cere '
    'che fu di Dellacqua, dove Bastiano Ferri guida ancora il coro.»',
]
LUOGHI = [
    dict(n=1, nome='IL CAMPANILE DI SAN TEODORO', req='Disponibile dall’inizio',
         testo='La scala a chiocciola sale nel buio. In cima, la cella campanaria è in disordine: '
               'lo sgabello di Ruggero è rovesciato, la sua lanterna ancora appesa.',
         indizi=['Colate di <b>cera nera</b> sui gradini — troppo in alto perché vengano dalle candele della chiesa.',
                 'Il diario di Ruggero, con l’ultima pagina strappata. Ricalcando i solchi della penna leggete: '
                 '«...alle 3 in punto, ogni notte. <b>Tre rintocchi, poi uno, poi cinque.</b> Non sono io a suonare.» '
                 '<i>(Reperto A: consegnate il Diario di Ruggero.)</i>',
                 'Graffiata sul legno della balaustra, una parola: <b>SOMMERSO</b>.'],
         approfondimenti=[
             dict(tipo='Osservazione',
                  testo='Tra le assi, un frammento di spartito scritto a mano. Le note non sono per organo: sono per <b>campane</b>.'),
             dict(tipo='Referto', soggetto='La cena intatta',
                  testo='La cena è ancora sotto il panno, fredda ma composta; nessun segno di lotta, nessuna caduta. '
                        'Ruggero non è stato trascinato via: si è alzato e ha seguito qualcuno, verso le 3.'),
         ]),
    dict(n=2, nome='CASA DI RUGGERO — VICOLO DEI FONDITORI', req='Disponibile dall’inizio',
         testo='Bice, la sorella, vi apre con gli occhi rossi: «Negli ultimi tempi diceva di sentire '
               'musica sotto il pavimento della cripta. E aveva paura del suo stesso campanile.»',
         indizi=['Sul tavolo, una <b>CORDA DI VIOLINO d’argento</b>: «L’ha trovata in cripta», dice Bice. '
                 '<i>(Oggetto: sblocca il Luogo 5.)</i>',
                 'Una ricevuta: Ruggero aveva chiesto all’Archivio Civico i documenti antichi della cattedrale.',
                 'Bice: «L’ultima sera ripeteva una parola, come una preghiera al contrario: sommerso, sommerso.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Bice',
                  testo='Consolata, Bice ricorda: nelle ultime settimane Ruggero riceveva di notte un visitatore '
                        '«ben vestito, con mani da artigiano». Non ne ha mai saputo il nome.'),
         ]),
    dict(n=3, nome='TAVERNA DEL PONTE ROTTO', req='Disponibile dall’inizio',
         testo='Fumo, vino cattivo e barcaioli. Qui le lingue si sciolgono con poco.',
         indizi=['Ugo il barcaiolo: «Tre notti fa una <b>CHIATTA</b> senza lanterne ha scaricato casse al '
                 'Canale Basso. Alle 3, proprio mentre le campane suonavano da sole.» '
                 '<i>(Parola chiave: sblocca il Luogo 6.)</i>',
                 'Un avventore ubriaco: «Vicino ai vecchi magazzini c’è puzza di cera bruciata da settimane.»',
                 'L’oste conferma: <b>Tonio il sagrestano</b> era qui a giocare a carte fino all’alba, '
                 'la notte della scomparsa.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Ugo il barcaiolo',
                  testo='Con un altro bicchiere, Ugo precisa: la chiatta senza lanterne ha attraccato al '
                        '<b>molo terzo</b> del Canale Basso, poco dopo le 3, e ha scaricato in fretta.'),
             dict(tipo='Presagio',
                  testo='Mentre i barcaioli giocano, a Sibilla cade sotto gli occhi la stessa carta due volte: '
                        'l’Annegato. Il canale, stanotte, ha fame.'),
         ]),
    dict(n=4, nome='LA SAGRESTIA DELLA CATTEDRALE', req='Disponibile dall’inizio',
         testo='Don Callisto vi riceve nervoso, le mani sporche di cera. Dietro di lui, la porta della '
               'cripta è sbarrata: «Chiusa per lavori», taglia corto.',
         indizi=['La tabella degli inni segna il numero <b>315</b>, «Dal Profondo». Tonio giura di non averlo '
                 'mai impostato: «Quell’inno non si canta da cent’anni. È roba dell’antico coro.»',
                 'Don Callisto ammette: la <b>seconda chiave della cripta</b> ce l’ha il liutaio <b>Ferri</b>, '
                 'che sta restaurando l’organo.',
                 'Prima che usciate, vi mette in mano un’<b>ampolla di acqua benedetta</b>: «Se là '
                 'sotto c’è il demonio, portate questa.»'],
         approfondimenti=[
             dict(tipo='Osservazione',
                  testo='La cera sulle mani di don Callisto è bianca, comune: vende candele di nascosto per '
                        'pagare i debiti della parrocchia. Con la cera nera non c’entra.'),
             dict(tipo='Testimonianza', soggetto='Don Callisto',
                  testo='Se rassicurato, il prete crolla: certe notti dalla cripta sale un canto sommesso, '
                        '«di molte voci». Ha troppa paura per denunciarlo — e troppa vergogna per benedirlo.'),
         ]),
    dict(n=5, nome='BOTTEGA DEL LIUTAIO FERRI', req='Serve: la CORDA DI VIOLINO (Luogo 2)',
         testo='Bottega chiusa da giorni; la porta sul retro cede a una spallata. Dentro, polvere e '
               'violini appesi come selvaggina.',
         indizi=['Bastiano Ferri è sparito da tre giorni. Sul banco, un <b>diapason d’argento</b> inciso '
                 'con un’onda.',
                 'Il registro consegne, ultima riga: «40 candele di cera nera — consegna al <b>C.B.</b>, '
                 'molo terzo, il vecchio deposito — pagato B.F.» '
                 '<i>(Reperto B: consegnate il Registro delle Consegne.)</i>',
                 'Uno spartito: «Dal Profondo», riscritto <b>per campane</b>. In margine: «il bronzo canta, '
                 'la pietra risponde, l’acqua ricorda».'],
         approfondimenti=[
             dict(tipo='Osservazione',
                  testo='Nel camino, cenere di carta ancora tiepida. Un lembo si salva, grafia febbrile: '
                        '«...non riesco più a fermarlo, il Coro canta anche senza di me. Che Dio perdoni ciò '
                        'che ho svegliato. — B.»'),
             dict(tipo='Referto', soggetto='Residui sulle lime',
                  testo='Su lime e sgorbie, incrostazioni di <b>cera nera</b> — non la pece da liutaio. Qui, '
                        'tra un violino e l’altro, Ferri lavorava le candele del culto.'),
         ]),
    dict(n=6, nome='IL CANALE BASSO', req='Serve: la parola chiave CHIATTA (Luogo 3)',
         testo='Acqua nera e ferma, magazzini ciechi. Il guardiano notturno accetta di parlare per '
               'qualche moneta.',
         indizi=['«Le casse erano marchiate a fuoco con un’<b>onda</b>. Le hanno portate in un vecchio '
                 'magazzino sul canale, chiuso da vent’anni — ce ne sono tre o quattro uguali, al buio '
                 'non saprei dirvi quale.»',
                 '«Alle 3 di notte, da là dentro, viene un canto sommesso. Di molte voci. Una volta... '
                 'ho sentito un urlo.»',
                 'Sul molo: gocce di cera nera e un lucchetto nuovo di zecca sulla porta della banchina, '
                 'di quelli <b>a tre cifre</b>.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il guardiano notturno',
                  testo='Il guardiano abbassa la voce. «Certe notti li ho visti entrare — un fornaio, un '
                        'sagrestano, gente che saluto al mercato — e uscire all’alba con gli occhi vuoti, '
                        'senza riconoscermi. Non erano più loro.»'),
             dict(tipo='Presagio',
                  testo='Sibilla sfiora l’acqua nera: non è fredda, è attenta. Qualcosa, sotto la città, '
                        'ascolta i passi sul molo — e li conta.'),
         ]),
    dict(n=7, nome='L’ARCHIVIO CIVICO', req='Serve: la parola chiave SOMMERSO (Luogo 1)',
         testo='L’archivista, sentendo la parola giusta, vi guida a uno scaffale che nessuno tocca '
               'da decenni.',
         indizi=['Fascicolo del 1741: la confraternita del <b>Coro Sommerso</b>, bandita per «pratiche '
                 'contrarie a Dio e alla quiete delle acque». Si riuniva in cavità sotto la cattedrale, '
                 '«dove l’acqua canta». Il suo sigillo: un’onda. '
                 '<i>(Reperto C: consegnate il Fascicolo del 1741.)</i>',
                 'Una mappa antica: dalla cripta, condotti scendono verso il <b>Canale Basso</b>.',
                 'Registro consultazioni, due mesi fa: «<b>B. Ferri, liutaio</b>» ha richiesto questo '
                 'stesso fascicolo.'],
         approfondimenti=[
             dict(tipo='Osservazione',
                  testo='Le mani dell’archivista tremano su un solo scaffale. Sul fascicolo, una nota a margine '
                        'di altra mano: «il sigillo a onda è ancora inciso nella cripta — sotto l’altare».'),
         ]),
    dict(n=8, nome='LA GENDARMERIA', req='Disponibile dall’inizio',
         testo='Il brigadiere vi riceve tra pile di pratiche: «Il campanaro? Sarà scappato con '
               'qualche vedova.»',
         indizi=['Nessuna richiesta di riscatto. Il sospettato ufficiale è <b>Tonio il sagrestano</b>, '
                 'l’ultimo ad aver visto Ruggero.',
                 'Denunce recenti: furti di <b>cera e canapa</b> da tre chiese. E un fonditore giura d’aver '
                 'venduto un quintale di bronzo a un compratore incappucciato.',
                 '«Se trovate qualcosa di concreto, tornate. Non perquisiamo mezza città per un campanaro '
                 'con la testa fra le nuvole.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La denuncia dei furti',
                  testo='Attilio confronta le denunce: la cera «rubata da tre chiese» è la stessa cera d’altare '
                        'della cattedrale. Qualcuno raccoglie cera consacrata in quantità.'),
             dict(tipo='Testimonianza', soggetto='Il fascicolo nascosto',
                  testo='Il fascicolo che il brigadiere continua a spostare (fatelo parlare, o sfilateglielo): '
                        'il compratore incappucciato scaricava «al molo terzo del Canale Basso». La gendarmeria '
                        'lo sapeva e ha lasciato correre.'),
         ]),
]

# Oggetti: carta fisica per ogni oggetto trovabile, in Indagine (nei Luoghi) o
# in Spedizione (Cercare in una tessera). `effetto` e' copiato 1:1 dal dato di
# provenienza (indizio del Luogo o `cerca` della tessera in TILES sotto) - la
# carta non aggiunge alcuna regola nuova, solo un supporto fisico da tenere in
# mano invece che una riga di testo da ricordare.
OGGETTI = [
    dict(nome='CORDA DI VIOLINO D’ARGENTO', ref='L2', fonte='Luogo 2 — Casa di Ruggero',
         flavor='Ancora tesa, come se qualcuno l’avesse suonata ieri.',
         effetto='Sblocca la visita al Luogo 5 (Bottega del Liutaio Ferri).'),
    dict(nome='AMPOLLA DI ACQUA BENEDETTA', ref='L4', fonte='Luogo 4 — La Sagrestia della Cattedrale',
         flavor='«Se là sotto c’è il demonio, portate questa», vi dice, e non vi guarda negli occhi.',
         effetto='Effetto: nessuno finora scoperto.'),
    dict(nome='IL DIAPASON D’ARGENTO', ref='L5', fonte='Luogo 5 — Bottega del Liutaio Ferri',
         flavor='Inciso con un’onda. Vibra anche senza essere toccato.',
         effetto='In spedizione: un’azione adiacente al Custode della Cera lo fa vibrare — '
                 'Difesa 5 per il resto della partita, e il Custode salta la sua prossima attivazione.'),
    dict(nome='UN PIEDE DI PORCO', ref='T2', fonte='Si trova cercando in T2 — Sala delle Casse',
         flavor='Freddo, pesante, già piegato da altre porte.',
         effetto='+1 alle prove per forzare e scassinare.'),
    dict(nome='UN TALISMANO A FORMA D’ONDA', ref='T3', fonte='Si trova cercando in T3 — Corridoio delle Candele',
         flavor='Tiepido al tatto, come se qualcuno lo stringesse un istante prima di voi.',
         effetto='+1 NERVI finché lo portate.'),
    dict(nome='LA CHIAVE DELLA CELLA', ref='T4', fonte='Si trova cercando in T4 — Ufficio del Custode',
         flavor='Ruggine recente sul dente: uso frequente.',
         effetto='Apre la cella in T6 con Interagire, senza prove.'),
]

# ================================================================ SPEDIZIONE
# Ogni Minaccia ha un tipo (terza voce) e un flag 'subito' (quarta voce),
# stessa idea del `tipo` degli Approfondimenti: formalizza pattern meccanici
# reali nel testo effetto, non solo raggruppamenti di comodo (vedi analisi
# nel piano di sessione, plans/wondrous-foraging-raven.md). Ogni tipo esiste
# solo se abilita un'interazione presente o futura:
#   posseduto  - creature esclusive di questo episodio (non piu' se stesse:
#                gente comune posseduta), generico per episodi futuri con un
#                villain diverso; MAI 'culto' (troppo legato a Episodio 1).
#   malavita   - criminali secolari, gia' dichiaratamente riusabili
#                cross-episodio (vedi README): corruttibili/spaventabili in
#                un modo in cui un Posseduto non lo e'.
#   insidia    - "prova NERVI o subisci" (fisica o psicologica): disinnescata
#                da Learco Sarti (eroe proposto, non ancora implementato).
#   crescendo  - avanza il countdown verso il boss di episodio; generico
#                (un episodio futuro puo' non avere un coro).
#   ostacolo   - penalizza il Movimento (ambito/durata diversi, stesso asse).
#   quiete     - nessun effetto, filler di tensione (asse per episodi futuri
#                con piu' filler, oggi solo 1 carta).
#   favore     - effetto positivo per gli eroi (asse per episodi futuri con
#                piu' "respiro" nel mazzo, oggi solo 1 carta).
# 'subito' (True/False): la creatura piazzata si attiva immediatamente
# invece che al prossimo giro di attivazioni nemiche - rischio immediato vs
# differito, trasversale a posseduto/malavita. Non e' un tipo a se': non e'
# un "sostantivo" e frammenterebbe la tassonomia sopra. Pronto per
# un'abilita' futura tipo "il primo nemico piazzato non si attiva subito".
MINACCE = (
    # famiglia ADEPTO (4): stessa sostanza, apparizioni diverse
    [('ADEPTO IN AGGUATO', 'Piazzate 1 Adepto sull’uscita più lontana dagli eroi della tessera in cui si trova l’eroe attivo.', 'posseduto', False),
     ('VOLTI TRA LE CASSE', 'Piazzate 1 Adepto sulla tessera rivelata più lontana dagli eroi.', 'posseduto', False),
     ('IL FALCETTO NEL BUIO', 'Piazzate 1 Adepto sull’ingresso della tessera corrente, alle spalle degli eroi.', 'posseduto', False),
     ('LA VEDETTA', 'Piazzate 1 Adepto adiacente all’eroe più isolato (quello più lontano dagli altri; a pari merito, l’eroe attivo).', 'posseduto', False)] +
    # famiglia CANI (2)
    [('CANI DEI MOLI', 'Piazzate 1 Cane dei Moli sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.', 'posseduto', True),
     ('UNGHIE SULLA PIETRA', 'Piazzate 1 Cane dei Moli sull’ingresso della tessera corrente: si attiva subito.', 'posseduto', True)] +
    # famiglia FONDITORE (2)
    [('IL FONDITORE', 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1). Se è già in gioco un Fonditore, recupera 1 ferita.', 'posseduto', False),
     ('LA MAREA DI CERA', 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1): tutti i Fonditori in gioco si attivano subito.', 'posseduto', True)] +
    [('RONDA', 'Piazzate 2 Adepti sull’ingresso della Banchina (T1).', 'posseduto', False)] +
    # famiglia MALAVITA (3): i bravacci secolari a libro paga del culto
    [('BRAVI SUL MOLO', 'Piazzate 1 Sgherro sull’ingresso della Banchina (T1).', 'malavita', False),
     ('IL BRANCO', 'Piazzate 2 Sgherri, adiacenti tra loro, sulla tessera rivelata più lontana dagli eroi.', 'malavita', False),
     ('LAMA NEL BUIO', 'Piazzate 1 Sicario adiacente all’eroe più isolato o più ferito (a pari merito: sceglie il gruppo): si attiva subito.', 'malavita', True)] +
    # famiglia INSIDIE (4, Sussurri compresa: stesso pattern "prova NERVI o subisci")
    [('TRAPPOLA DI CERA', 'L’eroe più avanzato prova NERVI (Media): se fallisce, cera bollente: 1 danno e perde 1 azione al prossimo turno.', 'insidia', False),
     ('CERA SOTTO I PIEDI', 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.', 'insidia', False)] +
    [('FUMI SOPORIFERI', 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.', 'insidia', False)] +
    # famiglia CANTO (3): crescendo, effetto identico
    [('IL CANTO SALE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.', 'crescendo', False),
     ('IL CORO RISPONDE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.', 'crescendo', False),
     ('IL CANTO CRESCE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.', 'crescendo', False)] +
    [('PRESAGIO', 'Un brivido corre lungo la schiena. Non accade nulla... per ora.', 'quiete', False)] +
    [('ECO AMICA', 'Tre colpi sordi, in lontananza: Ruggero è vivo. Rivelate una tessera coperta adiacente a una rivelata.', 'favore', False)] +
    [('CERA CHE COLA', 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.', 'ostacolo', False)] +
    [('CORRENTE GELIDA', 'Una corrente gelida risale dai condotti: fino all’inizio del vostro prossimo turno ogni eroe ha -1 al Movimento (minimo 1).', 'ostacolo', False)] +
    [('SUSSURRI', 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal terrore.', 'insidia', False)]
)

NEMICI = [
    dict(nome='ADEPTO INCAPPUCCIATO', att=1, dif=7, fer=1, mov=4, dan=1,
         note='Palandrana grigia, maschera di cera. Combatte con falcetti da fonditore.'),
    dict(nome='CANE DEI MOLI', att=2, dif=6, fer=1, mov=6, dan=1,
         note='Bestie da guardia dei magazzini, il muso incrostato di cera nera: il culto li '
              'nutre e li accorda come strumenti. Arrivano prima del loro ringhio. Fragili, '
              'ma il colpo va messo a segno mentre saltano.'),
    dict(nome='IL FONDITORE', att=1, dif=8, fer=2, mov=2, dan=2,
         note='Gli artigiani del culto: grembiule di cuoio, mestolo colmo di cera fusa, la '
              'pazienza di chi ha versato mille candele. Non corrono mai: non ne hanno bisogno. '
              'Chi viene ferito dal Fonditore si muove di 1 casella in meno nel suo prossimo '
              'turno (la cera si addensa addosso).'),
    dict(nome='IL CUSTODE DELLA CERA', att=3, dif=9, fer=3, mov=3, dan=2,
         note='Un gigante ricoperto di cera colata, il volto un moncone liscio. Se il diapason '
              'd’argento viene fatto vibrare a lui adiacente (azione): Difesa 5 per il resto '
              'della partita e salta la sua prossima attivazione.'),
    # Malavita di Roccamora: nemici SECOLARI, riusabili in ogni episodio (non legati al
    # culto della cera). Nell'Episodio 1 sono i bravacci pagati per guardare i moli.
    dict(nome='LO SGHERRO', att=2, dif=8, fer=2, mov=4, dan=1,
         note='Muscolo a pagamento dei bassifondi: bastone, coltellaccio e nessuna fede se non '
              'la moneta. <b>Tattica del branco:</b> se è adiacente a un altro Sgherro, ha +1 '
              'Attacco. Non vengono quasi mai da soli.'),
    dict(nome='IL SICARIO', att=3, dif=7, fer=1, mov=5, dan=2,
         note='Una lama assoldata, silenziosa e rapida. Sceglie sempre il bersaglio più debole. '
              '<b>Colpo a tradimento:</b> +2 all’Attacco contro un eroe isolato (nessun altro eroe '
              'adiacente) o già ferito. Fragile: chi lo raggiunge, lo abbatte.'),
]

TILES = [
    dict(id='T1', nome='BANCHINA D’INGRESSO', exits={'N': 'T2'},
         testo='Acqua nera che lambisce le pietre, odore di sego. La porta sul retro ha un lucchetto '
               'a tre cifre (vedi Soluzione). Qui dovete riportare Ruggero per vincere.',
         arredi=[(0, 3, 'molo'), (3, 3, 'casse')]),
    dict(id='T2', nome='SALA DELLE CASSE', exits={'S': 'T1', 'E': 'T3', 'O': 'T4', 'N': 'T5 (grata: azione Interagire per aprirla)'},
         testo='Casse marchiate con l’onda, accatastate fino al soffitto.',
         cerca='Un piede di porco: +1 alle prove per forzare e scassinare.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='CORRIDOIO DELLE CANDELE', exits={'O': 'T2'},
         testo='Migliaia di candele nere accese. Chi entra in questa tessera per la prima volta prova '
               'NERVI (Media): se fallisce, 1 danno (cera bollente).',
         cerca='Un talismano a forma d’onda: chi lo porta ha +1 NERVI.',
         arredi=[(0, 0, 'candele'), (3, 0, 'candele'), (0, 3, 'candele'), (3, 3, 'candele')]),
    dict(id='T4', nome='UFFICIO DEL CUSTODE', exits={'E': 'T2'},
         testo='Una scrivania sommersa di spartiti, un pagliericcio che puzza di sego.',
         cerca='La CHIAVE DELLA CELLA e un registro: «Il dormiente gradisce il canto. '
               'Manca solo la voce del bronzo.»',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'branda')]),
    dict(id='T5', nome='SCALA AL PIANO INTERRATO', exits={'S': 'T2', 'N': 'T6'},
         testo='Gradini viscidi che scendono nel canto. Chi scende prova NERVI (Facile): se fallisce, '
               'ha 1 sola azione al prossimo turno.',
         arredi=[(1, 1, 'scala'), (2, 1, 'scala'), (1, 2, 'scala'), (2, 2, 'scala')]),
    dict(id='T6', nome='CRIPTA DELLA CERA', exits={'S': 'T5'},
         testo='Un altare circondato da candele nere; dietro, una cella con Ruggero. QUANDO RIVELATE '
               'QUESTA TESSERA: appare il Custode della Cera con 2 Adepti. La cella si apre con la '
               'chiave (T4) o scassinando: ACUME Difficile.',
         arredi=[(1, 2, 'altare'), (2, 2, 'altare'), (3, 3, 'CELLA')]),
]
