# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 4: Il teatro dell'eco (Episodio 4/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-4.md e CAMPAGNA-EPISODI.md).
Episodio standalone col seme: la conchiglia acustica del Comunale (legni
del 1741) che RICORDA, il concertatore comprato, il Suggeritore nella
buca. Un solo seme C.B./M.: il benefattore via notaio.

Genera: Indagine.pdf, Spedizione.pdf (note tessera fronte/retro + registro
ferite + token), Soluzione (non aprire).pdf, Bestiario.pdf, Luoghi.pdf
(placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche vivono
in scripts/cardconjurer/cards-data.js, blocco EPISODIO 4).
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border,
                          seal, wave, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
from gen_gothic import registro_ferite, token_sheet, TOKEN_EROI

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 4', 'pdf')
os.makedirs(OUT_DIR, exist_ok=True)
register_fonts()
W, H = A4


def st(name, **kw):
    from reportlab.lib.styles import ParagraphStyle
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


BODY = st('body', alignment=4)
SMB = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)


def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)


# ================================================================= DATI

LETTERA_4 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Al Teatro Comunale sono spariti due uomini in una settimana: <b>Gaspare</b>, il "
    "suggeritore — dalla sua buca, a metà prova generale — e <b>Rocco Malpede</b>, il capo "
    "della claque, che andava dicendo d’aver sentito il teatro <b>provare da solo</b>, a "
    "sipario chiuso. La direzione parla di fughe e debiti. Io non credo alle fughe di chi "
    "lascia la giacca sulla sedia.<br/><br/>"
    "Sabato c’è la gala di beneficenza e la signora Vetri canterà per metà città. Trovate i "
    "due scomparsi prima che il sipario si alzi. Avete <b>6 ore</b>, dalle 18:00 alle 24:00. "
    "Una cortesia: <b>non disturbate il benefattore del teatro</b> — è un amico della "
    "Società.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: il palcoscenico del Comunale, il camerino della "
    "signora Vetri all’ingresso degli artisti, il loggione (apre col pubblico, alle 20:00) e "
    "il Caffè dei Cantanti. Gli altri andranno sbloccati. Il ridotto dell’amministrazione "
    "chiude alle 22:00.</i>")

# Luoghi: fonte autoritativa py (indizi core GARANTITI - regola 1-ter).
# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI, doppia via
# (anti-fortuna, 1-sexies): «contrappeso morto» da L1 e L4, «l'aria del
# terzo atto» da L2 e L3, «lo spartito che canta» da L2 e L4, «cera nera»
# da L3 e L4, il Passe-partout da L2. Rivelatorio (Domanda 2) su 3 carte
# designate: L1, L2, L3 - tutti aperti (L3 apre alle 20: vincolo
# d'orologio, non chiave).
LUOGHI_4 = [
    dict(n=1, nome='IL PALCOSCENICO DEL COMUNALE', voce_mappa='Il Teatro Comunale',
         req='Disponibile dall’inizio', art='Palcoscenico del Comunale.png',
         chiude=None,
         indizi=[
             'La buca del suggeritore è vuota e ordinata: il leggio, la lampadina schermata, '
             'la sedia consumata da quarant’anni di Gaspare. Manca solo lui — e il suo '
             'libretto. Il gobbo di scena giura che «da lì sotto, certe sere, qualcuno '
             'suggerisce ancora. Ma non è la sua voce.»',
             'Il macchinista anziano, a mezza voce: «il contrappeso morto — quello fuori uso, '
             'legato dal Settanta — tira da solo, di notte. Le funi cantano. E i morti, '
             'signori miei, non tirano.»',
             'I pannelli della conchiglia acustica sono lucidi di cera nuova, tranne uno: il '
             'centrale manca, e nelle giunture c’è cera NERA. Un attrezzista: «lo rimontano '
             'la mattina della gala. Ordine del maestro concertatore: l’accordatura si '
             'finisce all’ultimo.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani del concertatore',
                  testo='Il maestro Alboni prova l’orchestra guardando il SOFFITTO: dirige i '
                        'pannelli, non i violini. E sui polsini, dove un direttore porta il '
                        'gesso delle bacchette, lui porta ditate di cera nera. Un concertatore '
                        'accorda musicisti. Questo sta accordando la sala.'),
             dict(tipo='Presagio', soggetto='La buca che respira',
                  testo='Dalla buca del suggeritore sale un fiato regolare, come una platea che '
                        'dorme: si vede una fossa di legno sotto il palco, un contrappeso '
                        'fermo, e due uomini legati che respirano piano — vivi, e sorvegliati '
                        'da qualcosa che non ha fretta. La visione dura un rintocco.'),
         ]),
    dict(n=2, nome='IL CAMERINO DELLA VETRI', voce_mappa='L’Ingresso degli Artisti',
         req='Disponibile dall’inizio', art='Camerino della Vetri.png',
         sblocca_parola=('LO SPARTITO CHE CANTA', 'L’ARIA DEL TERZO ATTO'),
         sblocca_oggetto='IL PASSE-PARTOUT DI SCENA', chiude=None,
         indizi=[
             'Gli spartiti anonimi sono impilati sul tavolino da trucco: dodici, identici, '
             'senza mittente. La Vetri li chiama «lo spartito che canta»: «lo leggi una volta '
             'e ti resta in testa per giorni. Lo canticchio nel sonno, dice la mia cameriera. '
             'Io nel sonno non canto mai.» <i>(Reperto C: consegnate lo Spartito '
             'Annotato.)</i>',
             'Appeso tra i costumi, il passe-partout di scena della prima donna: apre ogni '
             'porta del teatro, ridotto compreso. «La direzione me lo diede per capriccio. '
             'Prendetelo voi: io di porte, in questo teatro, comincio ad averne paura.» '
             '<i>(Oggetto: prendete la carta Il Passe-partout di Scena.)</i>',
             'Il programma di studio è una sola pagina, ricopiata a mano: «il maestro Alboni '
             'mi fa provare l’aria del terzo atto. Solo quella. Da tre settimane. Dice che '
             'sabato deve essere PERFETTA — e quando la sbaglio, non si arrabbia: soffre.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La Vetri',
                  testo='«Alboni mi corregge il respiro come si accorda un mobile: mezzo grado '
                        'di petto in qua, il mento in là. L’altra sera ho steccato l’acuto e '
                        'l’ho visto piangere — non di rabbia: di paura. Un uomo che ha paura '
                        'dei MIEI errori sta rispondendo a qualcuno dei suoi.»'),
         ]),
    dict(n=3, nome='IL LOGGIONE', voce_mappa='La Scala del Loggione',
         req='Apre col pubblico, alle 20:00', art='Il Loggione.png',
         apre=20, chiude=None,
         sblocca_parola=('L’ARIA DEL TERZO ATTO', 'CERA NERA'),
         indizi=[
             'La claque è orfana e nervosa: «Rocco non è scappato con la colletta. Rocco '
             'aveva PAURA: diceva che il teatro provava da solo, a sipario chiuso, e che '
             'l’applauso serviva a coprire qualcosa.» Il baritono rivale della Vetri, che '
             'mezza città accusa, quella notte cantava a Mantova: il loggione lo sa a memoria.',
             'Un claqueur giovane, per un bicchiere: ai carichi notturni ha visto entrare '
             'casse di candele — «cera nera, signori. Al Comunale le candele sono bianche da '
             'cent’anni: quelle le ho scaricate io, e ho ancora il nero sulle mani.»',
             'Gli ordini di Rocco, trovati nel suo posto sotto la balaustra: pagamenti DOPPI '
             'per applaudire una cosa sola — «l’aria del terzo atto, forte, lungo, finché il '
             'maestro non abbassa la mano». Una claque non copre un’aria: la scorta.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il secondo della claque',
                  testo='«Le sere di prova a porte chiuse ci pagava il maestro Alboni in '
                        'persona: battimani a tempo, mezz’ora, sipario chiuso. “Coprite i '
                        'lavori”, diceva. Che lavori si fanno in un teatro vuoto, con le '
                        'candele nere e il sipario giù? Rocco è andato a vedere. Ecco che '
                        'lavori.»'),
         ]),
    dict(n=4, nome='IL CAFFÈ DEI CANTANTI', voce_mappa='Il Caffè dei Cantanti',
         req='Disponibile dall’inizio', art='Caffè dei Cantanti.png',
         sblocca_parola=('CONTRAPPESO MORTO', 'LO SPARTITO CHE CANTA', 'CERA NERA'),
         chiude=None,
         indizi=[
             'Il cuoco del teatro qui si sfoga: «da due settimane la mia dispensa cala di '
             'notte. Pane, formaggio, vino — ceste intere. Ho dato la colpa ai gatti finché '
             'non ho trovato la cesta VUOTA, ripiegata, dietro la porta del sottopalco. I '
             'gatti non ripiegano.»',
             'I macchinisti fuori servizio giocano a carte e parlano del «contrappeso morto»: '
             '«legato dal Settanta, dopo l’incidente. Nessuno lo tocca, nessuno ci passa '
             'sotto. Be’: qualcuno l’ha ingrassato. L’argano nuovo luccica.»',
             'Un copista di musica, ubriaco e in vena: «dodici copie dello stesso spartito, '
             'pagate il triplo, consegna al portone di servizio. “Lo spartito che canta”, lo '
             'chiamano adesso. Io l’ho solo copiato — e da quella settimana lo sogno. Con la '
             'cera nera sotto le unghie, nel sogno. Come l’originale che mi diedero.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il copista',
                  testo='«L’originale scottava, ve lo giuro: carta vecchia, righi a mano, e '
                        'una piega sola, da busta elegante. Me lo riprese un fattorino coi '
                        'guanti prima che finissi il caffè. Il compenso? Anticipato, in '
                        'contanti nuovi. Chi paga così non ama la musica: la COMPRA.»'),
         ]),
    dict(n=5, nome='IL SOTTOPALCO DELLE MACCHINE', voce_mappa='La Porta di Servizio del Teatro',
         req='La porta di servizio è sprangata dal capomacchinista: «giù non si scende, ordine '
             'della direzione». Ma il suo sguardo corre alla fossa in fondo — e chi sa chiamare '
             'le cose col loro nome, di là dentro, passa.',
         chiave=('parola', 'CONTRAPPESO MORTO'), art='Sottopalco delle Macchine.png', chiude=None,
         indizi=[
             'Il registro delle macchine sceniche: il contrappeso morto — fuori uso dal 1870 — '
             'risulta «movimentato» ogni notte da due settimane, sempre tra le due e le '
             'quattro. Firma di servizio: nessuna. <i>(Reperto A: consegnate il Registro '
             'delle Macchine.)</i>',
             'Appesa al quadro delle funi, la pianta delle macchine del Comunale: ogni argano, '
             'ogni leva, ogni botola. Manca un dettaglio solo: la fossa del contrappeso morto '
             'è disegnata... e poi cancellata a matita. <i>(Oggetti: prendete le carte La '
             'Pianta delle Macchine e La Chiave del Tagliafuoco.)</i>',
             'I pannelli smontati della conchiglia sono qui, in fila contro il muro, numerati '
             'a gesso: accordati uno a uno, richiusi, pronti. Manca il centrale — «si monta '
             'la mattina della gala», dice il cartellino. Dopo, la conchiglia sarà intera.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il registro delle macchine',
                  testo='Le movimentazioni notturne del contrappeso morto sollevano sempre lo '
                        'stesso peso: ottanta chili, poi centosessanta. Ottanta chili è un '
                        'uomo. Centosessanta sono due. Il contrappeso morto non è un argano, '
                        'adesso: è un montacarichi per prigionieri.'),
         ]),
    dict(n=6, nome='CASA DEL MAESTRO ALBONI', voce_mappa='Vicolo dell’Armonia',
         req='La governante non apre: «il maestro prova e non riceve». Dalla finestra, sempre '
             'la stessa frase al pianoforte — chi la riconosce e la nomina, in questa casa, è '
             'del mestiere.',
         chiave=('parola', 'L’ARIA DEL TERZO ATTO'), art='Casa del Maestro Alboni.png',
         chiude=None,
         indizi=[
             'Il calendario delle prove, appeso in studio: da tre settimane, ogni giorno, una '
             'sola riga — «l’aria del III atto, la signora Vetri». Le altre pagine del '
             'repertorio della gala: intonse. Un concertatore prepara una serata. Questo '
             'prepara un MOMENTO.',
             'Nel cassetto dello scrittoio, le ricevute di una vita in debito — sarti, '
             'strozzini, il Monte — tutte saldate lo stesso giorno, tre mesi fa, in contanti. '
             'Da allora, nessun nuovo pegno. E nessuna nuova entrata dichiarata.',
             'Sotto il fermacarte, una commissione su carta di pregio, siglata dal notaio '
             'Grillanda per conto di «un benefattore che ama la lirica»: il restauro '
             'dell’accordatura della conchiglia, «da compiersi entro la gala». '
             '<i>(Reperto B: consegnate la Commissione del Notaio.)</i>'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I conti di Alboni',
                  testo='I debiti saldati fanno una cifra tonda spaventosa — e le ricevute '
                        'sono in ordine di data, legate col nastro, come si tengono le prove '
                        'di un ricatto CONTRO SE STESSI. Alboni sa di aver venduto qualcosa. '
                        'Le tiene per ricordarsi il prezzo.'),
         ]),
    dict(n=7, nome='L’ARCHIVIO DEGLI SPARTITI', voce_mappa='L’Archivio del Teatro',
         req='L’archivista, tra le scaffalature, non alza gli occhi: «qui si entra per '
             'consultare, non per curiosare. Ditemi COSA cercate — col suo nome di catalogo — '
             'o tornate al foyer.»',
         chiave=('parola', 'LO SPARTITO CHE CANTA'), art='Archivio degli Spartiti.png',
         chiude=None,
         indizi=[
             'Gli spartiti anonimi sono già schedati: «mano di copisteria teatrale, carta '
             'nostra, inchiostro NON nostro». L’archivista ha contato le copie in giro per la '
             'città: dodici. «Chi fa copiare dodici volte la stessa aria non ama la musica: '
             'fa delle prove.»',
             'Nel fondo Gaspare — quarant’anni di servizio — il suo libretto personale non '
             'c’è: risulta RITIRATO due settimane fa, «per rilegatura», da una firma che '
             'l’archivista non riconosce. Ma la rilegatoria non l’ha mai visto. '
             '<i>(Oggetto: prendete la carta Il Libretto di Gaspare — è ancora qui, '
             'nascosto tra i registri: qualcuno voleva farlo sparire e non ha finito il '
             'lavoro.)</i>',
             'Il registro dei prestiti: il maestro Alboni ha ritirato i rilievi acustici '
             'della conchiglia — le carte del restauro di vent’anni fa — e non li ha mai '
             'resi. «Un direttore che studia i muri invece delle partiture», sospira '
             'l’archivista, «o è un genio, o è un muratore.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La carta degli spartiti',
                  testo='Sotto la lente, l’inchiostro degli spartiti anonimi è impastato con '
                        'polvere di cera nera: la pagina non è scritta per essere letta — è '
                        'scritta per TRATTENERE. Chi la canta, la nutre. Dodici copie in '
                        'città: dodici piccole reti da voce, in attesa della retata grande.'),
         ]),
    dict(n=8, nome='IL PALCO REALE E L’AMMINISTRAZIONE', voce_mappa='Il Ridotto del Teatro',
         req='Il segretario del ridotto è cortesia pura e porte chiuse: «l’amministrazione '
             'riceve su appuntamento». Ma un passe-partout di scena, in questo teatro, apre '
             'anche le cortesie.',
         chiave=('oggetto', 'IL PASSE-PARTOUT DI SCENA'), art='Palco Reale.png', chiude=22,
         indizi=[
             'Il palco 13 è pagato da vent’anni, mai occupato: «il benefattore ama la lirica '
             'ma non le folle», recita il contratto. Dentro, polvere intatta — e sul '
             'davanzale di velluto, un binocolo da signora in madreperla, mai usato. '
             '<i>(Oggetto: prendete la carta Il Binocolo della Contessa.)</i>',
             'I libri contabili del restauro di vent’anni fa: la conchiglia fu pagata «da '
             'privato munifico» tramite il notaio Grillanda — lo stesso della commissione ad '
             'Alboni. Vent’anni, due lavori, un notaio solo: il benefattore non è un '
             'ammiratore. È un PROPRIETARIO.',
             'Il libro dei palchi della gala di sabato: tutto esaurito da settimane — tranne '
             'il 13, «riservato». Il segretario, a voce bassissima: «stavolta ha chiesto le '
             'candele. Per la prima volta in vent’anni, sabato, il benefattore viene a '
             'sentire.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il palco tredici',
                  testo='Dal 13 non si vede bene il palcoscenico: l’angolo è mediocre, mezzo '
                        'proscenio è tagliato. Ma la CONCHIGLIA, da lì, si vede tutta — ogni '
                        'pannello, ogni giuntura. Non è un palco per guardare lo spettacolo: '
                        'è un palco per sorvegliare uno strumento.'),
         ]),
    dict(n=9, nome='IL LABORATORIO DEGLI SCENOGRAFI', voce_mappa='Il Laboratorio degli Scenografi',
         req='Il capo scenografo difende il suo capannone come un forte: «qui si lavora per '
             'sabato, fuori i curiosi». Solo chi nomina il materiale giusto — quello che non '
             'dovrebbe esserci — lo fa impallidire e aprire.',
         chiave=('parola', 'CERA NERA'), art='Laboratorio degli Scenografi.png', chiude=None,
         indizi=[
             'L’ordine di forniture per la gala, appeso al chiodo: tele, ori, e «candele di '
             'cera nera, casse quattro, consegna al portone di servizio — per la serata». '
             'Il capo scenografo giura di non averle ordinate lui: «la firma è della '
             'direzione. Ma la direzione non firma MAI le forniture.»',
             'In fondo al capannone, i legni avanzati dal restauro della conchiglia, '
             'vent’anni di polvere: quercia scura, stagionatura d’acqua. E su ogni asse, un '
             'marchio a fuoco — una chiesa: «i Battuti», dice il più vecchio degli '
             'scenografi. «I legni venivano da lì. Dalla chiesa sconsacrata.»',
             'Tra i materiali di scena, una maschera dorata della prima stagione del teatro, '
             'bellissima e inquietante: il capo scenografo la scaccia con la mano — «quella '
             'porta male, la teniamo per scaramanzia. Prendetevela, se vi piace il genere.» '
             '<i>(Oggetto: prendete la carta La Maschera della Prima Stagione.)</i>'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='I legni marchiati',
                  testo='Toccare le assi basta: si vede una chiesa spogliata, un organo murato '
                        'che respira dietro i mattoni, e casse di legname che partono su un '
                        'carro, vent’anni fa, verso il teatro. I legni non furono venduti: '
                        'furono AFFIDATI. E ciò che è affidato, un giorno, si viene a '
                        'riprendere. La visione dura un rintocco.'),
         ]),
]

# Tessere del sottopalco. Fronte = letto alla rivelazione, retro =
# cerca/arbitro/hook/cerca_vuoto (solo per chi arbitra).
TILES_4 = [
    dict(id='T1', nome='LA QUINTA DI CARICO', exits={'N': 'T2'}, start='S',
         testo='La porta di servizio si chiude alle spalle e il teatro, da sotto, è un’altra '
               'bestia: travi, funi, e l’orchestra che suona sopra le vostre teste — la gala è '
               'cominciata. QUANDO RIVELATE QUESTA TESSERA: applicate l’esito della Domanda 1 '
               '(vedi la busta della Soluzione). Qui dovete riportare Gaspare e Rocco per '
               'vincere.',
         cerca_vuoto='Casse di scena vuote e cime arrotolate. Sopra, un applauso lontano copre '
                     'ogni rumore — il vostro compreso.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL MAGAZZINO DELLE SCENE', exits={'S': 'T1', 'N': 'T3'},
         testo='Fondali arrotolati come vele ammainate: città finte, boschi finti, un cielo '
               'stellato appoggiato al muro. Tra le scene, corridoi stretti dove il buio ha '
               'la forma delle cose dipinte.',
         cerca='La lanterna cieca del trovarobe, con lo sportello schermato: +1 alle prove '
               'NERVI finché la porta chi l’ha trovata.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA SALA DEI CONTRAPPESI', exits={'S': 'T2', 'N': 'T4'},
         testo='La macchina del teatro: sacchi di sabbia in fila come impiccati pazienti, '
               'tamburi, funi che salgono nel buio. Ogni cambio di scena, lassù, fa TIRARE '
               'qualcosa quaggiù. Chi entra in questa tessera per la prima volta prova NERVI '
               '(Media): il sipario chiama i contrappesi senza preavviso. Se fallisce, ha 1 '
               'sola azione al prossimo turno. Se il gruppo porta LA PIANTA DELLE MACCHINE, '
               'nessuna prova: sapete dove NON stare.',
         hook='Se il gruppo ha letto il Presagio «La buca che respira» (Luogo 1): riconoscono '
              'il respiro della fossa oltre la parete — la prova resta, ma chi fallisce non '
              'perde l’azione (solo lo spavento).',
         cerca_vuoto='Sabbia, canapa e grasso d’argano. Le funi cantano piano quando l’orchestra '
                     'sale. Meglio non stare sotto a niente.',
         arredi=[(0, 1, 'casse'), (3, 1, 'casse'), (0, 2, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL CORRIDOIO DEI CAMERINI MORTI', exits={'S': 'T3', 'E': 'T5', 'N': 'T6'},
         testo='I camerini della stagione chiusa: porte accostate, specchi coperti da lenzuoli, '
               'nomi sbiaditi sulle targhette. In fondo, il corridoio si divide: da una parte '
               'la fossa del contrappeso morto, dall’altra il ventre della conchiglia. E in '
               'mezzo al corridoio, una gobba familiare china su un leggio che non c’è. '
               'QUANDO RIVELATE QUESTA TESSERA: appare IL SUGGERITORE con 1 Claque ogni 4 '
               'eroi (per difetto: nessuna a 2-3 eroi) — l’eco vi ha sentiti, e da questo '
               'momento vi INCALZA.',
         arbitro='Il Suggeritore NON va abbattuto per vincere: è la buca del teatro fatta '
                 'eco — si lascia senza spartito, non si uccide. Vi seguirà fino alla fine: '
                 'la sua debolezza (Domanda 4) serve a scrollarselo di dosso.',
         cerca='Dietro uno specchio coperto, una maschera dorata identica a quella del '
               'laboratorio — o è la stessa? ⚠ (vedi la nota per chi arbitra).',
         arredi=[(1, 1, 'scrivania'), (2, 2, 'casse')]),
    dict(id='T5', nome='LA FOSSA DEL CONTRAPPESO MORTO', exits={'O': 'T4'},
         testo='Una fossa di legno sotto il piano del palco, e dentro — legati, imbavagliati, '
               'VIVI — Gaspare e Rocco. Il contrappeso morto pende sopra di loro, ingrassato '
               'di fresco: è così che li calano e li tirano su. QUANDO RIVELATE QUESTA '
               'TESSERA: 1 Adepto di guardia appare tra le funi.',
         arbitro='Gaspare e Rocco si liberano con Interagire (nessuna prova, un’azione per '
                 'entrambi); si muovono col gruppo: 3 caselle, nessuna azione. Se il gruppo '
                 'NON ha il Libretto di Gaspare: Gaspare stesso è la voce vera — portato '
                 'adiacente al Suggeritore, un’azione: vale come la debolezza (ma è un uomo '
                 'ferito in mezzo a una battaglia: se subisce 1 danno, torna a T1 da solo).',
         cerca_vuoto='Nella fossa: coperte, una cesta di cibo ripiegata, e i segni di due '
                     'uomini che hanno contato i giorni sul legno. Niente altro.',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'casse')]),
    dict(id='T6', nome='LA CONCHIGLIA', exits={'S': 'T4'},
         testo='Il ventre di legno del proscenio: i pannelli del 1741 curvano sopra di voi '
               'come il fasciame di una nave capovolta, e VIBRANO — l’orchestra è a un palmo, '
               'oltre le assi. Su una rastrelliera, lastre di cera incise in fila. In mezzo, '
               'la platea di legno ASCOLTA. QUANDO RIVELATE QUESTA TESSERA: appare la '
               'scorta — 1 gruppo di Claque ogni 4 eroi (arrotondate per eccesso).',
         arbitro='Il sabotaggio: TRE pannelli da disaccordare (un’azione Interagire ciascuno, '
                 'contrassegnati sulla tessera) prima del 4° segnalino Canto — al 4°, '
                 'l’aria del terzo atto comincia di sopra e la conchiglia '
                 'REGISTRA (vedi Soluzione: non è una sconfitta, è l’epilogo peggiore). Le '
                 'lastre di cera già incise: un’azione Interagire ciascuna (contano '
                 'nell’epilogo e nel Bivio). La debolezza del Suggeritore è IL LIBRETTO DI '
                 'GASPARE (o Gaspare stesso, vedi T5): un’azione adiacente — Difesa 8→5 per '
                 'il resto della partita, e salta la sua prossima attivazione.',
         cerca_vuoto='Qui non si trova: si ascolta. E ciò che si sente — la vostra città che '
                     'applaude a un palmo di distanza — non sa niente di voi.',
         arredi=[(2, 2, 'casse')]),
]

# Nemici nuovi (statistiche - fonte per Bestiario e simulatore).
NEMICI_4 = [
    dict(nome='IL SUGGERITORE', att=3, dif=8, fer=4, mov=3, dan=2, boss=True,
         tipo='Eco della Buca (Boss)', art='Il Suggeritore.png',
         note='Quando colpisce un eroe, il colpito prova NERVI (Facile): se fallisce, dice '
              'parole non sue — perde 1 azione al prossimo turno. La debolezza è il Libretto '
              'di Gaspare (Difesa 8→5 + salta la prossima attivazione).',
         bio_bestiario='Quarant’anni di battute sussurrate lasciano un solco, e il solco — '
              'quando la conchiglia ha cominciato a ricordare — si è riempito: una gobba, un '
              'bisbiglio, pagine che frusciano senza mani. Non è Gaspare: è il POSTO di '
              'Gaspare, svuotato e rimesso in scena. Suggerisce. Chi viene colpito dal suo '
              'sussurro prova NERVI (Facile) o dice parole non sue e perde 1 azione al '
              'prossimo turno. Ciò che lo stona è la voce vera del suo posto: il libretto '
              'consumato di Gaspare — o Gaspare in persona — un’azione adiacente: Difesa 8→5 '
              'per il resto della partita, e salta la sua prossima attivazione. Ai tavoli da '
              '2-3 eroi non recupera mai ferite, qualunque cosa dicano le carte Crescendo '
              '(regola delle taglie, vedi Regolamento).'),
    dict(nome='LA CLAQUE', att=1, dif=6, fer=1, mov=3, dan=1,
         tipo='Applauso del Coro', art='La Claque.png',
         note='Aura: finché una Claque è adiacente a un eroe, quell’eroe ha −1 alle prove '
              '(il battimani cadenzato copre i pensieri).',
         bio_bestiario='Pagati per applaudire a tempo, poi pagati per non chiedersi cosa '
              'coprisse l’applauso. Ora battono le mani anche quando non c’è nessuno a '
              'sentirli: un ritmo cavo, cadenzato, che entra nel petto e sfratta i pensieri. '
              'Non colpiscono quasi mai per fare male — colpiscono per tenere il TEMPO. '
              'Finché uno di loro vi è adiacente, ogni vostra prova soffre un −1: è '
              'difficile pensare, dentro un applauso che non finisce.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 4 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 4')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il teatro dell’eco')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_4.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 3 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 4')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8.5)
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 39.5*mm, '! il Loggione (3) apre alle 20:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 44.5*mm, '! il Ridotto (8) chiude alle 22:00')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole che tornano', 5)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE sono tenuti Gaspare e Rocco? (attenzione: serve più di una conferma)',
            '2. CHI dirige il lavoro notturno nel teatro?',
            '3. QUANDO scatta la «registrazione»? (attenzione: serve più di una conferma)',
            '4. COSA portate là sotto contro ciò che suggerisce?']
    for i, d in enumerate(doms):
        yd = yy - 10*mm - i*15*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 7*mm, W - 16*mm, yd - 7*mm)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# =============================================================== SPEDIZIONE

def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 4 - Spedizione')
    # copertina
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 4 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'il sottopalco del comunale, a gala in corso')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 108*mm, W - 56*mm, 55*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (più «La melodia impressa» SOLO se il '
                  'vostro Bivio lo dice — vedi Soluzione) e le schede Nemici sono carte a '
                  'parte (cartella <b>Episodio 4/cards/</b>). Le 6 tessere del sottopalco sono '
                  'in <b>Episodio 4/board/</b>. Le pagine seguenti sono le note per tessera, una tessera per foglio: il '
                  '<b>fronte</b> si legge ad alta voce quando una tessera viene rivelata; il '
                  '<b>retro del foglio</b> è solo per chi tiene questo fascicolo — dice cosa '
                  'nasconde ogni tessera, e si consulta SOLO quando un eroe Cerca (o prova ad '
                  'aprire qualcosa). Non giratelo prima.', BODY)])
    c.showPage()
    # retro di copertina (parita' fronte/retro)
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 110*mm, W - 60*mm, 62*mm, [
        Paragraph('Lo tiene <b>una persona sola</b> — di solito chi pesca il mazzo Minaccia e '
                  'tiene il Registro delle Ferite. Quando il gruppo rivela una tessera, legge ad '
                  'alta voce la voce corrispondente sulla pagina seguente. Quando un eroe '
                  '<b>Cerca</b> o prova ad <b>aprire</b> qualcosa, gira il foglio e legge '
                  'l’esito di quella sola tessera: con lo stesso tono sia che ci sia un tesoro, '
                  'sia che non ci sia niente. Gli altri giocatori non leggono il retro.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_4:
        art_file = TILE_ART_4[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_4[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_4.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    # nemici in campo + miniature + registro
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 74*mm, W - 40*mm, 46*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 4</b> (PDF a parte). In campo: '
                  'le <b>Claque</b> (aura: −1 alle prove per gli eroi adiacenti), gli '
                  '<b>Adepti</b> (i facchini del benefattore), <b>Sgherri</b> e <b>Sicario</b> '
                  '(le maschere di sala comprate) e <b>il Suggeritore</b> (il boss: si desta '
                  'in T6, o al 3° segnalino Canto). Vittoria: liberate Gaspare e Rocco '
                  '(Interagire in T5), disaccordate i 3 pannelli della Conchiglia (Interagire '
                  'in T6) e riportate tutti in T1. Le lastre di cera in T6 sono l’obiettivo '
                  'secondario: ognuna recuperata è una voce rubata, e pesa nell’epilogo e nel '
                  'Bivio. Ai tavoli da 2-3 eroi il Suggeritore <b>non recupera mai ferite</b> '
                  'dalle carte Crescendo (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_4())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_4():
    """Miniature dell'Episodio 4. Gaspare e Rocco sono i prigionieri-scorta;
    i 3 segnalini Canto usano le arti delle carte Crescendo dell'episodio."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x2) · SICARI (x1) · ADEPTI (x4)', [('Lo Sgherro.png', 2), ('Il Sicario.png', 1),
                                                      ('Adepto Incappucciato.png', 4)]),
        ('CLAQUE (x3)', [('La Claque.png', 3)]),
        ('SUGGERITORE · GASPARE · ROCCO', [('Il Suggeritore.png', 1), ('Gaspare.png', 1),
                                           ('Rocco.png', 1)]),
        ('CANTO', [('L’ouverture.png', 1), ('Il secondo atto.png', 1),
                   ('L’aria si avvicina.png', 1)]),
    ]
    out = []
    for label, items in groups:
        ok = [(a, n) for a, n in items if os.path.exists(os.path.join(ARTWORKS_DIR, a))]
        for a, _ in items:
            if not os.path.exists(os.path.join(ARTWORKS_DIR, a)):
                print('  AVVISO: manca artworks/' + a + ' - miniatura saltata '
                      '(rigenerare quando arriva)')
        if ok:
            out.append((label, ok))
    return out


# ================================================================ SOLUZIONE

def soluzione():
    out_path = os.path.join(OUT_DIR, 'Soluzione (non aprire).pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 4 - Soluzione (non aprire)')

    def pagina(titolo, blocchi):
        parchment_art(c, W, H)
        rule_border(c, W, H)
        c.setFillColor(RED); c.setFont(F['sc'], 16)
        c.drawString(16*mm, H - 22*mm, titolo)
        y = H - 32*mm
        for b in blocchi:
            p = Paragraph(b, BODY)
            pw, ph = p.wrapOn(c, W - 32*mm, 200*mm)
            p.drawOn(c, 16*mm, y - ph)
            y -= ph + 6*mm
        c.showPage()

    pagina('soluzione — non aprire', [
        '<b>Stampate questo fascicolo senza leggerlo e sigillatelo in una busta.</b> Apritelo '
        'solo dopo aver risposto per iscritto alle 4 Domande. La carta «La melodia impressa» '
        'va in una seconda busta, chiusa, con scritto «Bivio».',
        '<b>APERTURA — il Bivio dell’Episodio 3</b> (applicare PRIMA della lettera): se avete '
        '<b>RESTITUITO LE VOCI</b> — la prima donna sa cosa le è quasi successo, e parla: la '
        'Testimonianza «La Vetri» (Luogo 2) si legge anche senza eroe idoneo, una sola volta '
        '(la paura scioglie le lingue); ma le voci guarite canticchiano nel sonno la melodia '
        'del pozzo: mescolate la carta crescendo «La melodia impressa» nel mazzo Minaccia (22 '
        'carte). Se le avete <b>CONSERVATE SIGILLATE</b> — la Gazzetta vi ha marchiati come '
        '«quelli che tengono le voci in scatola»: rimuovete la Testimonianza «Il secondo '
        'della claque» (Luogo 3) dal mazzo Approfondimenti; ma la melodia è vostra: nella '
        'spedizione, la soglia del Canto sale di 1 (il vostro spartito sa stonare l’aria).',
    ])
    pagina('la verità', [
        'La <b>conchiglia acustica</b> del proscenio — rifatta vent’anni fa coi legni delle '
        'barche demolite della confraternita del 1741, affidati dalla chiesa dei Battuti — '
        'non amplifica: <b>ricorda</b>. Imprime nei legni ciò che vi si canta dentro. Il '
        'maestro concertatore <b>Ermete Alboni</b>, rovinato dal gioco e ricomprato da un '
        '«benefattore» mai visto (commissione su carta di pregio, tramite il notaio '
        'Grillanda), la sta riaccordando pannello per pannello: alla gala di sabato, quando '
        'la Vetri canterà l’aria del terzo atto, la conchiglia TERRÀ la sua voce — la '
        'solista che il Coro insegue dall’episodio dei pozzi.',
        '<b>Gaspare e Rocco</b> hanno visto il lavoro notturno, e Alboni li tiene VIVI nella '
        'fossa del contrappeso morto: non è un assassino — è un uomo che ha venduto una cosa '
        'sola e ha scoperto che il prezzo sale a ogni consegna. Nella buca del suggeritore, '
        'intanto, qualcosa ha preso il posto di Gaspare: un’eco con la sua gobba e il suo '
        'sussurro. Il Coro non compare mai in scena: solo denaro, un notaio, e dodici '
        'spartiti che cantano da soli.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE sono Gaspare e Rocco?</b> Nella fossa del contrappeso morto, sotto il '
        'palco (lo confermano il registro delle macchine, le razioni sparite e il '
        'macchinista). <i>Esatta:</i> scendete dal lato giusto — nel 1° round non si pesca '
        'nessuna carta Minaccia. <i>Sbagliata:</i> girate nel sottopalco facendo rumore: 1 '
        'Claque appare in T1 alla rivelazione.',
        '<b>2. CHI dirige il lavoro notturno?</b> Il maestro concertatore Ermete Alboni. '
        '<i>Esatta:</i> lo fate fermare nel suo camerino prima della gala — senza il suo '
        'segnale, la Claque di scorta in T6 NON appare. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. QUANDO scatta la registrazione?</b> Alla gala di sabato, sull’aria del terzo '
        'atto (lo confermano il calendario delle prove, le candele di cera nera e il '
        'pannello centrale che si monta la mattina della gala). <i>Esatta:</i> entrate col '
        'giusto anticipo — il Canto parte da 0. <i>Sbagliata:</i> arrivate a spettacolo '
        'iniziato — la spedizione parte con 1 segnalino Canto in più.',
        '<b>4. COSA portate là sotto?</b> IL LIBRETTO DI GASPARE (l’Archivio, tra i registri): '
        'un’azione adiacente al Suggeritore — l’eco riconosce la voce vera del suo posto: '
        'Difesa 8→5 per il resto della partita, e salta la sua prossima attivazione. '
        '<i>Nota per chi arbitra:</i> senza Libretto, Gaspare liberato può farlo di persona '
        '(vedi il retro di T5 — rischioso). Il Binocolo della Contessa, la Chiave del '
        'Tagliafuoco e la Maschera della Prima Stagione sono esche: nessun effetto. La '
        'Pianta delle Macchine è onesta: niente prova in T3, +1 Interagire con argani e leve.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente solo tre carte — '
        'l’Osservazione «Le mani del concertatore» (L1), la Testimonianza «La Vetri» (L2) e '
        'la Testimonianza «Il secondo della claque» (L3). Se il gruppo non ne ha letta '
        'nessuna, giudicate con elasticità una risposta «vicina» (es. «qualcuno del podio, '
        'che paga la claque»).',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo (0 ore avanzate): 1 '
        'gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio e boss', [
        '<b>Montaggio</b> (tessere in Episodio 4/board/, coperte tranne T1):<br/>'
        'T1 Quinta di Carico (ingresso, da Sud) → T2 Magazzino delle Scene → T3 Sala dei '
        'Contrappesi (il passaggio obbligato) → T4 Corridoio dei Camerini Morti → a Est T5 '
        'Fossa del Contrappeso Morto (Gaspare e Rocco) → a Nord T6 La Conchiglia (il '
        'Suggeritore e le lastre).',
        '<b>Mazzo Minaccia:</b> le 21 carte dell’episodio (più «La melodia impressa» se il '
        'Bivio lo dice). Il Canto qui è il programma di sala: carte crescendo + 1 segnalino '
        'automatico ogni 4° round; alla soglia (3 segnalini — o 4, col Bivio «conservate») '
        'l’aria del terzo atto comincia e il Suggeritore si desta in anticipo, se non è già in '
        'gioco (piazzatelo sulla tessera più lontana dagli eroi, con 1 Claque di scorta), e da quel momento '
        'ogni Fase Minaccia pesca 1 carta in più, per sempre.',
        '<b>Il Suggeritore</b> (statistiche nel Bestiario; Ferite per taglia già tabellate): '
        'si desta quando rivelate T4 — a metà discesa — o in anticipo col Canto, e da lì vi '
        'INCALZA fino all’uscita. <b>Abbatterlo non è necessario:</b> la vittoria è liberare '
        'i prigionieri, disaccordare i 3 pannelli e riportare TUTTI in T1. La sua debolezza '
        'è la Domanda 4: un’azione adiacente e l’eco esita (Difesa 8→5, salta '
        'un’attivazione) — respiro per fuggire, non per finirlo. <b>Due finali di '
        'vittoria:</b> potete fuggire coi prigionieri senza disaccordare i pannelli — ma la '
        'conchiglia registra l’aria (epilogo peggiore, non sconfitta). Ogni lastra di cera '
        'recuperata (Interagire in T6) pesa nell’epilogo e nel Bivio.',
        '<b>Il palco risponde:</b> finché il Suggeritore è in gioco, ogni Fase Minaccia '
        'pesca 1 carta in più (l’eco vi ha sentiti: il teatro è contro di voi). '
        '<b>La registrazione:</b> se il 4° segnalino Canto arriva PRIMA del terzo '
        'pannello disaccordato, la conchiglia REGISTRA l’aria: epilogo peggiore, non '
        'sconfitta. <b>Il ritorno (3 tratti):</b> a fine di ogni round di ritorno, se il '
        'Suggeritore è ADIACENTE a un eroe il gruppo non avanza di un tratto: seminatelo, '
        'stordirlo (la debolezza) o abbattetelo. <b>A 2 eroi:</b> l’eco esita — il '
        'Suggeritore si attiva solo nei round PARI (regola di taglia, come le Ferite del '
        'Bestiario).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta a vittoria ottenuta.</b> «Gaspare risale nella '
        'sua buca la sera dopo, “perché il teatro senza gobbo cade”. La Vetri canta l’aria — '
        'a conchiglia spenta — e la città applaude senza sapere niente. In questura, Alboni '
        'ripete una cosa sola: “Non ho mai visto il suo volto. Ho visto la parcella del '
        'notaio. E la carta era così bella.”» — Se avete recuperato le lastre di cera: le '
        'voci di prova rubate tornano mute. Se ne mancano: annotatelo sul Frammento — '
        'qualcuno, da qualche parte, ha dei provini.',
        '<b>FRAMMENTO DI CAMPAGNA N. 4:</b> <i>«La conchiglia non amplifica: ricorda. Ciò '
        'che fu cantato nei legni del ’41 si può ricantare.»</i> Conservatelo per il finale '
        'di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b> La conchiglia è vostra, per una '
        'notte:<br/>'
        '<b>Distruggerla.</b> Il Coro perde lo strumento: l’Episodio 5 parte col Canto a 0. '
        'Ma il Comunale resta muto una stagione, e la città non ve lo perdona: un testimone '
        'in meno vi parlerà, nell’Episodio 5.<br/>'
        '<b>Sigillarla e conservarla.</b> Frammento 4-bis: la melodia impressa nei legni è '
        'VOSTRA — al finale di campagna, varrà. Ma ciò che è impresso chiama: il mazzo '
        'dell’Episodio 5 aggiunge 1 carta crescendo.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 4 e non parlatene più fino '
        'all’Episodio 5.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite — Tempra, Fibra, '
        'Revolver, Lanterna schermata, Borsa di garze (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

# Descrizioni estese per chi arbitra (bibbia di scrittura: stessi fatti
# della carta, molto piu' aria - un dettaglio che si muove, mai indizi
# nuovi).
LUOGHI4_DESC = {
    1: "Il palcoscenico a sipario chiuso è una piazza di legno che finge di dormire: "
       "le quinte respirano agli spifferi, la ribalta tiene il tepore delle lampade "
       "spente da un'ora. La conchiglia curva sopra il proscenio come l'interno di "
       "un liuto — e manca un pannello, in mezzo, come un dente. Dalla buca del "
       "suggeritore sale odore di polvere e di carta. E ogni tanto, da sotto, un "
       "fruscio: pagine. Nessuno, là sotto, dovrebbe sfogliare.",
    2: "Il camerino della Vetri sa di cipria e di gelsomino: lo specchio con le "
       "lampadine, i telegrammi infilati nella cornice, i fiori di ieri sera già "
       "stanchi. La diva siede dritta come in scena anche quando è sola. Sul "
       "tavolino, la pila degli spartiti anonimi: dodici, allineati per bene — e "
       "lei li guarda come si guarda una lettera di minacce scritta in bella "
       "calligrafia.",
    3: "Il loggione è il vero padrone del teatro: panche lucide, ringhiera di ferro, "
       "e l'acustica migliore della sala — «i soldi stanno sotto, le orecchie "
       "stanno sopra». La claque senza Rocco è un'orchestra senza direttore: "
       "battibecchi, lutto e vino. Da quassù la conchiglia si vede di taglio, e "
       "qualcuno, da settimane, guarda giù molto più di quanto applauda.",
    4: "Il Caffè dei Cantanti vive degli orari del teatro: pieno alle sei, vuoto "
       "alle otto, pieno a mezzanotte. Specchi dorati, caricature dei divi alle "
       "pareti, il pianoforte scordato che nessuno suona. Qui il Comunale parla di "
       "sé senza il sipario: cuochi, macchinisti, copisti — e i segreti passano "
       "col vassoio, un bicchiere alla volta.",
    5: "Il sottopalco è il ventre della nave: travi catramate, funi che salgono nel "
       "buio come sartie, sabbia nei sacchi e polvere di vent'anni. I pannelli "
       "della conchiglia, smontati, stanno in fila contro il muro come pale "
       "d'altare in restauro. In fondo, dietro il quadro delle funi, la fossa del "
       "contrappeso morto: una botola di buio che il capomacchinista non guarda "
       "mai — e ingrassata di fresco, luccica.",
    6: "La casa del maestro Alboni è tutta studio: il pianoforte a mezza coda, le "
       "partiture in pile geometriche, il metronomo fermo. È la casa di un uomo "
       "ordinato che non dorme: le candele consumate fino al piattino, il caffè "
       "freddo a metà, e sul leggio sempre la stessa aria, aperta alla stessa "
       "pagina, con le stesse quattro battute cerchiate a matita rossa.",
    7: "L'archivio del teatro è una chiesa di carta: scaffali fino al soffitto, "
       "spartiti rilegati in tela, l'odore buono della colla vecchia. L'archivista "
       "si muove tra i fondi come un sacrestano e parla dei compositori per nome "
       "di battesimo. Nel fondo Gaspare — quarant'anni di servizio in tre scatole — "
       "c'è un vuoto a forma di libretto, e all'archivista quel vuoto brucia più "
       "di un furto.",
    8: "Il ridotto è il teatro dei ricchi: specchi, stucchi, il registro dei palchi "
       "rilegato in rosso. Il palco 13 è in fondo al corridoio di velluto: la "
       "porta è come le altre, ma la maniglia non ha ditate. Dentro, l'aria ferma "
       "di vent'anni — e la polvere sul davanzale disegna il contorno preciso di "
       "un binocolo che nessuno ha mai alzato.",
    9: "Il laboratorio degli scenografi è un duomo di tela e trementina: fondali "
       "stesi come vele, impalcature, cieli a metà. Per sabato si lavora d'oro e "
       "di porpora. In fondo, dove la luce non arriva, il legname vecchio del "
       "restauro dorme sotto i teli — quercia scura, stagionata d'acqua — e chi ci "
       "passa accanto abbassa la voce senza sapere perché.",
}

# Carte Oggetto per luogo (sotto-sezione "carte da prendere" degli indizi).
OGGETTI_LUOGO_4 = {
    2: ['Il Passe-partout di Scena'],
    5: ['La Pianta delle Macchine', 'La Chiave del Tagliafuoco'],
    7: ['Il Libretto di Gaspare'],
    8: ['Il Binocolo della Contessa'],
    9: ['La Maschera della Prima Stagione'],
}

# arte tessere del fascicolo (le stesse dei board)
TILE_ART_4 = {t['id']: t['id'] + '-ep4.png' for t in TILES_4}

# taratura ritagli del fascicolo Luoghi (verificare A VIDEO in Fase D)
LUOGHI4_CROP = {}

# Descrizioni estese delle tessere (fascicolo Spedizione).
TESSERE_DESC_4 = {
    'T1': "La quinta di carico è il retrobottega del sogno: casse sventrate, cime "
          "arrotolate, mezza carrozza di cartapesta appoggiata al muro. Da sopra "
          "arriva l'orchestra — attutita, calda, terribilmente vicina: la gala è "
          "cominciata, e ottocento persone respirano a tre metri sopra le vostre "
          "teste. Ogni applauso è un'onda che copre tutto. Anche voi.",
    'T2': "I fondali arrotolati fanno un bosco di tronchi di tela: città dipinte, "
          "giardini dipinti, un cielo stellato che dorme in piedi. I corridoi tra "
          "le scene sono stretti e storti, e la lanterna accende scorci assurdi — "
          "una finestra dipinta che dà sul buio vero, una porta finta socchiusa su "
          "un muro. In un posto così, chiunque può essere una cosa dipinta. Finché "
          "non si muove.",
    'T3': "La sala dei contrappesi è il cuore meccanico del teatro: sacchi di "
          "sabbia in file verticali, tamburi di legno, funi tese che salgono e "
          "spariscono. Quando di sopra cambia la scena, qui tutto TIRA: un fischio "
          "di canapa, un tonfo sordo, un sacco che piomba dove un attimo fa non "
          "c'era niente. La macchina non sa che ci siete. La macchina fa il suo "
          "mestiere.",
    'T4': "Il corridoio dei camerini morti è la stagione che non c'è più: targhette "
          "sbiadite, specchi coperti coi lenzuoli, una vestaglia appesa che per un "
          "attimo ha le spalle di qualcuno. La polvere qui non è abbandono: è "
          "silenzio depositato. In fondo, il corridoio si biforca — e da una delle "
          "due direzioni arriva, piano, un respiro che conta.",
    'T5': "La fossa del contrappeso morto è una tasca di buio sotto il piano del "
          "palco: legno annerito, l'argano ingrassato di fresco che luccica come "
          "una cosa viva, e in fondo — su coperte militari — due uomini legati che "
          "alzano gli occhi insieme. Vivi. Il più vecchio ha le mani da suggeritore, "
          "consumate di carta: fa segno di NO con la testa, piano. Non a voi: alla "
          "parete dietro di voi.",
    'T6': "Il ventre della conchiglia è l'interno di un violino grande come una "
          "casa: i pannelli del '41 curvano sopra la testa, fasciame biondo e "
          "scuro, e VIBRANO — l'orchestra è oltre le assi, l'aria arriva come "
          "attraverso l'acqua. Su una rastrelliera, lastre di cera incise in fila "
          "ordinata. E in mezzo, china su un leggio che non c'è, una gobba "
          "familiare sfoglia pagine che non ci sono. Il fruscio, adesso, lo "
          "riconoscete.",
}

# Esami di Carbone
ESAMI_CARBONE_4 = {
    'SPARTITO ANONIMO': '«Carta da copisteria teatrale, mano professionale — ma l’inchiostro è '
                'impastato con polvere di cera nera: la pagina non è scritta per essere '
                'letta. È scritta per trattenere. Chi la canta, la nutre.»',
    'BINOCOLO DELLA CONTESSA': '«Madreperla e ottone di pregio — e ghiere vergini: mai messo '
                'a fuoco in vent’anni. Non è uno strumento d’osservazione: è un oggetto di '
                'scena. Qualcuno arreda quel palco come si arreda un alibi.»',
    'COMMISSIONE DEL NOTAIO': '«La stessa carta di pregio, per la terza volta in tre casi: '
                'stessa risma, stessa piega coi guanti. Il notaio Grillanda firma per conto '
                'di qualcuno che non firma mai — e che compra carta come un ministero.»',
}

# Carte Oggetto nascoste nelle tessere (retro delle pagine tessera).
OGGETTI_TESSERA_4 = {'T2': ['Una Lanterna Cieca'],
                     'T4': ['La Maschera della Prima Stagione ⚠ è un’esca, anche qui']}


def luoghi():
    """Luoghi.pdf Episodio 4 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'smoky canal tavern.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 4 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_4, 'Episodio 4')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_4.get(n, [])]

    for L in LUOGHI_4:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI4_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI4_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_4)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_4
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL SUGGERITORE', 'LA CLAQUE', 'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 4')
    print('OK episodio 4')
