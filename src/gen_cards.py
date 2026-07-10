# -*- coding: utf-8 -*-
"""Ombre su Roccamora - dati di gioco (fonte autoritativa).

Solo dati: eroi, luoghi dell'Indagine, mazzo Minaccia, nemici, tessere. Il
rendering dei PDF vive in gen_gothic.py (03 Indagine, 04 Spedizione) e
gen_deluxe.py (02 Schede); le carte immagine in scripts/cardconjurer/. I testi
estesi per l'immersione stanno in story.py e vengono applicati con story.apply().
"""

# ================================================================= EROI
HEROES = [
    dict(nome='ELENA FOSCO', ruolo='L’Investigatrice', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Occhio Clinico</b> — In indagine: quando Elena visita un luogo con una '
               'carta <b>Indizio Nascosto</b> abbinata, consultatela subito. In spedizione: +2 alle '
               'prove di Cercare.'),
         equip='Bastone animato (arma, +1), lente d’ingrandimento, taccuino rilegato.'),
    dict(nome='DOTT. ATTILIO MARN', ruolo='Il Medico', acume=2, vigore=2, nervi=2,
         salute=7, difesa=8,
         abil=('<b>Pronto Soccorso</b> — Tre volte per spedizione, con un’azione cura '
               '2 Salute a un eroe adiacente o a sé stesso. Rianimare gli riesce sempre '
               'riportando l’eroe a 3 Salute invece che a 2.'),
         equip='Bisturi lungo (arma, +1), borsa medica, sali aromatici.'),
    dict(nome='SIBILLA REVE', ruolo='L’Occultista', acume=2, vigore=1, nervi=3,
         salute=6, difesa=8,
         abil=('<b>Sesto Senso</b> — Una volta per round, prima della fase Minaccia, guarda '
               'le prime 2 carte del mazzo e rimettile sopra nell’ordine che preferisce.'),
         equip='Pugnale rituale (arma, +1), pendolo d’ossidiana, gessetti.'),
    dict(nome='NINO “GRIMALDELLO” CAUTO', ruolo='Il Ladro', acume=2, vigore=2, nervi=1,
         salute=7, difesa=9,
         abil=('<b>Grimaldello</b> — Serrature e lucchetti: per Nino ogni prova per '
               'scassinare cala di un grado (Difficile→Media, Media→Facile). '
               'Inoltre si muove di 5 caselle invece di 4.'),
         equip='Sfollagente (arma, +1), grimaldelli, corda con rampino.'),
    dict(nome='OTTONE “MEZZENA” MASSARI', ruolo='Il Macellaio', acume=1, vigore=3, nervi=2,
         salute=8, difesa=8,
         abil=('<b>Un bicchiere con tutti</b> — In indagine: una volta per episodio, '
               'offrendo da bere e da mangiare fa ripetere una testimonianza: se il luogo ha '
               'una carta <b>Indizio Nascosto</b> abbinata, consultatela. In spedizione, '
               '<b>Colpo da macello</b>: una volta per turno, se abbatte un nemico in mischia '
               'attacca immediatamente un altro nemico adiacente.'),
         equip='Mannaia del banco (arma, +1), grembiule di cuoio, fiasco di vino robusto '
               '(2 usi: un sorso, anche su un eroe adiacente, annulla un effetto di paura o dei fumi).'),
    dict(nome='CARLA DOSTI', ruolo='La Giornalista', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Fonti riservate</b> — In indagine: una volta per episodio, una visita non '
               'costa nessuna ora. In spedizione: <b>Flash!</b> (2 usi) — azione: un nemico '
               'entro 2 caselle salta la sua prossima attivazione.'),
         equip='Ombrello ferrato (arma, +1), macchina fotografica, blocco note.'),
]

# ================================================================= INDAGINE
LUOGHI = [
    dict(n=1, nome='IL CAMPANILE DI SAN TEODORO', req='Disponibile dall’inizio',
         testo='La scala a chiocciola sale nel buio. In cima, la cella campanaria è in disordine: '
               'lo sgabello di Ruggero è rovesciato, la sua lanterna ancora appesa.',
         indizi=['Colate di <b>cera nera</b> sui gradini — troppo in alto perché vengano dalle candele della chiesa.',
                 'Il diario di Ruggero, con l’ultima pagina strappata. Ricalcando i solchi della penna leggete: '
                 '«...alle 3 in punto, ogni notte. <b>Tre rintocchi, poi uno, poi cinque.</b> Non sono io a suonare.»',
                 'Graffiata sul legno della balaustra, una parola: <b>SOMMERSO</b>.'],
         nascosto='Indizio nascosto: tra le assi, un frammento di spartito scritto a mano. '
                  'Le note non sono per organo: sono per <b>campane</b>.'),
    dict(n=2, nome='CASA DI RUGGERO — VICOLO DEI FONDITORI', req='Disponibile dall’inizio',
         testo='Bice, la sorella, vi apre con gli occhi rossi: «Negli ultimi tempi diceva di sentire '
               'musica sotto il pavimento della cripta. E aveva paura del suo stesso campanile.»',
         indizi=['Sul tavolo, una <b>CORDA DI VIOLINO d’argento</b>: «L’ha trovata in cripta», dice Bice. '
                 '<i>(Oggetto: sblocca il Luogo 5.)</i>',
                 'Una ricevuta: Ruggero aveva chiesto all’Archivio Civico i documenti antichi della cattedrale.',
                 'Bice: «L’ultima sera ripeteva una parola, come una preghiera al contrario: sommerso, sommerso.»'],
         nascosto=None),
    dict(n=3, nome='TAVERNA DEL PONTE ROTTO', req='Disponibile dall’inizio',
         testo='Fumo, vino cattivo e barcaioli. Qui le lingue si sciolgono con poco.',
         indizi=['Ugo il barcaiolo: «Tre notti fa una <b>CHIATTA</b> senza lanterne ha scaricato casse al '
                 'Canale Basso. Alle 3, proprio mentre le campane suonavano da sole.» '
                 '<i>(Parola chiave: sblocca il Luogo 6.)</i>',
                 'Un avventore ubriaco: «Vicino ai vecchi magazzini c’è puzza di cera bruciata da settimane.»',
                 'L’oste conferma: <b>Tonio il sagrestano</b> era qui a giocare a carte fino all’alba, '
                 'la notte della scomparsa.'],
         nascosto=None),
    dict(n=4, nome='LA SAGRESTIA DELLA CATTEDRALE', req='Disponibile dall’inizio',
         testo='Don Callisto vi riceve nervoso, le mani sporche di cera. Dietro di lui, la porta della '
               'cripta è sbarrata: «Chiusa per lavori», taglia corto.',
         indizi=['La tabella degli inni segna il numero <b>315</b>, «Dal Profondo». Tonio giura di non averlo '
                 'mai impostato: «Quell’inno non si canta da cent’anni. È roba dell’antico coro.»',
                 'Don Callisto ammette: la <b>seconda chiave della cripta</b> ce l’ha il liutaio <b>Ferri</b>, '
                 'che sta restaurando l’organo.',
                 'Prima che usciate, vi mette in mano un’<b>ampolla di acqua benedetta</b>: «Se là '
                 'sotto c’è il demonio, portate questa.»'],
         nascosto='Indizio nascosto: la cera sulle mani di don Callisto è bianca, comune: '
                  'vende candele di nascosto per pagare i debiti della parrocchia. Con la cera nera non c’entra.'),
    dict(n=5, nome='BOTTEGA DEL LIUTAIO FERRI', req='Serve: la CORDA DI VIOLINO (Luogo 2)',
         testo='Bottega chiusa da giorni; la porta sul retro cede a una spallata. Dentro, polvere e '
               'violini appesi come selvaggina.',
         indizi=['Bastiano Ferri è sparito da tre giorni. Sul banco, un <b>diapason d’argento</b> inciso '
                 'con un’onda.',
                 'Il registro consegne, ultima riga: «40 candele di cera nera — consegna al <b>C.B.</b>, '
                 'molo terzo, il vecchio deposito — pagato B.F.»',
                 'Uno spartito: «Dal Profondo», riscritto <b>per campane</b>. In margine: «il bronzo canta, '
                 'la pietra risponde, l’acqua ricorda».'],
         nascosto='Indizio nascosto: nel camino, cenere di carta ancora tiepida. Un lembo si salva, '
                  'grafia febbrile: «...non riesco più a fermarlo, il Coro canta anche senza di me. '
                  'Che Dio perdoni ciò che ho svegliato. — B.»'),
    dict(n=6, nome='IL CANALE BASSO', req='Serve: la parola chiave CHIATTA (Luogo 3)',
         testo='Acqua nera e ferma, magazzini ciechi. Il guardiano notturno accetta di parlare per '
               'qualche moneta.',
         indizi=['«Le casse erano marchiate a fuoco con un’<b>onda</b>. Le hanno portate al vecchio '
                 '<b>Magazzino delle Cere</b>, quello chiuso da vent’anni.»',
                 '«Alle 3 di notte, da là dentro, viene un canto sommesso. Di molte voci. Una volta... '
                 'ho sentito un urlo.»',
                 'Sul molo: gocce di cera nera e un lucchetto nuovo di zecca sulla porta della banchina, '
                 'di quelli <b>a tre cifre</b>.'],
         nascosto='Indizio nascosto: il guardiano abbassa la voce. «Certe notti li ho visti entrare — '
                  'un fornaio, un sagrestano, gente che saluto al mercato — e uscire all’alba con gli '
                  'occhi vuoti, senza riconoscermi. Non erano più loro.»'),
    dict(n=7, nome='L’ARCHIVIO CIVICO', req='Serve: la parola chiave SOMMERSO (Luogo 1)',
         testo='L’archivista, sentendo la parola giusta, vi guida a uno scaffale che nessuno tocca '
               'da decenni.',
         indizi=['Fascicolo del 1741: la confraternita del <b>Coro Sommerso</b>, bandita per «pratiche '
                 'contrarie a Dio e alla quiete delle acque». Si riuniva in cavità sotto la cattedrale, '
                 '«dove l’acqua canta». Il suo sigillo: un’onda.',
                 'Una mappa antica: dalla cripta, condotti scendono verso il <b>Canale Basso</b>.',
                 'Registro consultazioni, due mesi fa: «<b>B. Ferri, liutaio</b>» ha richiesto questo '
                 'stesso fascicolo.'],
         nascosto=None),
    dict(n=8, nome='LA GENDARMERIA', req='Disponibile dall’inizio',
         testo='Il brigadiere vi riceve tra pile di pratiche: «Il campanaro? Sarà scappato con '
               'qualche vedova.»',
         indizi=['Nessuna richiesta di riscatto. Il sospettato ufficiale è <b>Tonio il sagrestano</b>, '
                 'l’ultimo ad aver visto Ruggero.',
                 'Denunce recenti: furti di <b>cera e canapa</b> da tre chiese. E un fonditore giura d’aver '
                 'venduto un quintale di bronzo a un compratore incappucciato.',
                 '«Se trovate qualcosa di concreto, tornate. Non perquisiamo mezza città per un campanaro '
                 'con la testa fra le nuvole.»'],
         nascosto=None),
]

# ================================================================ SPEDIZIONE
MINACCE = (
    # famiglia ADEPTO (4): stessa sostanza, apparizioni diverse
    [('ADEPTO IN AGGUATO', 'Piazzate 1 Adepto sull’uscita più lontana dagli eroi della tessera in cui si trova l’eroe attivo.'),
     ('VOLTI TRA LE CASSE', 'Piazzate 1 Adepto sulla tessera rivelata più lontana dagli eroi.'),
     ('IL FALCETTO NEL BUIO', 'Piazzate 1 Adepto sull’ingresso della tessera corrente, alle spalle degli eroi.'),
     ('LA VEDETTA', 'Piazzate 1 Adepto adiacente all’eroe più isolato (quello più lontano dagli altri; a pari merito, l’eroe attivo).')] +
    # famiglia CANI (2)
    [('CANI DEI MOLI', 'Piazzate 1 Cane dei Moli sull’uscita più vicina agli eroi della tessera corrente: si attiva subito.'),
     ('UNGHIE SULLA PIETRA', 'Piazzate 1 Cane dei Moli sull’ingresso della tessera corrente: si attiva subito.')] +
    # famiglia FONDITORE (2)
    [('IL FONDITORE', 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1). Se è già in gioco un Fonditore, recupera 1 ferita.'),
     ('LA MAREA DI CERA', 'Piazzate 1 Fonditore sull’ingresso della Banchina (T1): tutti i Fonditori in gioco si attivano subito.')] +
    [('RONDA', 'Piazzate 2 Adepti sull’ingresso della Banchina (T1).')] +
    # famiglia TRAPPOLE (2)
    [('TRAPPOLA DI CERA', 'L’eroe più avanzato prova NERVI (Media): se fallisce, cera bollente: 1 danno e perde 1 azione al prossimo turno.'),
     ('CERA SOTTO I PIEDI', 'L’eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.')] +
    [('FUMI SOPORIFERI', 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.')] +
    # famiglia CANTO (3): crescendo, effetto identico
    [('IL CANTO SALE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.'),
     ('IL CORO RISPONDE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.'),
     ('IL CANTO CRESCE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se è già in gioco: recupera 1 ferita e si attiva subito.')] +
    [('PRESAGIO', 'Un brivido corre lungo la schiena. Non accade nulla... per ora.')] +
    [('ECO AMICA', 'Tre colpi sordi, in lontananza: Ruggero è vivo. Rivelate una tessera coperta adiacente a una rivelata.')] +
    [('CERA CHE COLA', 'Fino a fine round, sulla tessera dell’eroe attivo muoversi costa il doppio.')] +
    [('RINFORZI DAL CANALE', 'Piazzate 1 Adepto sull’ingresso della Banchina (T1).')] +
    [('SUSSURRI', 'L’eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal terrore.')]
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
    dict(nome='IL CUSTODE DELLA CERA', att=3, dif=9, fer=4, mov=3, dan=2,
         note='Un gigante ricoperto di cera colata, il volto un moncone liscio. Se il diapason '
              'd’argento viene fatto vibrare a lui adiacente (azione): Difesa 5 per il resto '
              'della partita e salta la sua prossima attivazione.'),
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
