# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 11: Il censimento delle campane (Episodio 11/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-11.md e CAMPAGNA-EPISODI.md).
Mythology-light: funzionari-fantasma censiscono campane, organi e fontane
(«disposizione ministeriale») — è la mappatura acustica di Roccamora,
ordinata da uno studio-scatola di Milano. Un topografo che aveva capito il
disegno cade dalla Torre Civica: l'ha spinto il caposquadra, per paura. La
spedizione NON e' un dungeon: e' la VIA DELLE GUGLIE, l'ascesa sui tetti con
regola d'ambiente (vento/vertigine → NERVI), per prendere il caposquadra
VIVO — l'unico che sa a chi vanno i rilievi («e' una PENNA»). Un solo seme:
la commessa del rilievo su carta di pregio.

Varieta' strutturale (regola 2026-07-18): obiettivo non-boss di tipo CATTURA
VIVA (non uccidere il boss; overkill = filo perso), + regola d'ambiente in
quota (vento cumulativo dai crescendo). Torsione d'indagine: IN CHE ORDINE?
(riordino delle misure del morto).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche
vivono in scripts/cardconjurer/cards-data.js, blocco EPISODIO 11).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 11', 'pdf')
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

LETTERA_11 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Da settimane, in città, uomini in redingote grigia e tesserino inappuntabile misurano "
    "tutto ciò che suona: le campane a una a una, l’organo della Collegiata, le fontane dei "
    "chiostri, perfino l’eco sotto i portici. Dicono «rilievo fonico, disposizione "
    "ministeriale». Ho scritto al Ministero: nessuno li ha mandati. Ho scritto al Comune: "
    "nessuno li conosce. Poi uno di loro, <b>Emilio Ratti</b>, è precipitato dalla cella "
    "campanaria della <b>Torre Civica</b>. I documenti addosso sono falsi perfetti, e nel suo "
    "taccuino le ultime misure — pagine sciolte, senza data — non tornano con niente.<br/><br/>"
    "Non si misura ciò che non si vuole far suonare. Salite dove è caduto, mettete <b>in "
    "ordine</b> ciò che ha scritto, e ditemi verso cosa puntavano quelle misure. E badate bene: "
    "il caposquadra di quegli uomini sa a chi manda i rilievi, e chi sa parlare non lo si "
    "prende morto. Avete <b>6 ore</b>, dalle 18:00 alle 24:00; poi cala il buio sui tetti, e "
    "col buio non si sale.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la Torre Civica, la pensione dei topografi, l’Archivio "
    "Civico e la Camera dei Pesi. Gli altri andranno sbloccati.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «le misure che non tornano» (L1+L2), «un punto che non c'e» (L1+L3),
# «la squadra di Milano» (L2+L3), «la marea del molo» (L1+L4),
# «le funi delle campane» (L2+L4). Rivelatorio (D2) su L2, L3, L4.
LUOGHI_11 = [
    dict(n=1, nome='LA TORRE CIVICA', voce_mappa='La Torre Civica',
         req='Disponibile dall’inizio', art='La Torre Civica.png',
         chiude=None,
         indizi=[
             'Ai piedi della torre, il corpo di Emilio Ratti è ancora coperto da un telo. Il '
             'custode indica in alto: «cadde dalla cella delle campane, ieri sera. Uno di quei '
             'signori del rilievo. Diceva che qui c’era “l’ultima misura buona”. Aveva un '
             'taccuino sempre in mano, e le misure che non tornano gli facevano una rabbia.» '
             '<i>(Reperto A: raccogliete il Taccuino delle Misure.)</i>',
             'Il taccuino è un disastro ordinato: pagine sciolte, ognuna una misura — angoli, '
             'distanze, tempi — ma nessuna datata, e prese così non chiudono. «Segnava e '
             'strappava, segnava e strappava», dice il custode. Rimesse in fila, forse, '
             'direbbero qualcosa. Da sole, sono un punto che non c’è.',
             'Sull’ultima pagina, ripassata due volte: un rilievo dalla cella verso la '
             'Cattedrale, con una nota a margine — «riferire alla bassa marea del molo, campane '
             'accordate». Ratti misurava incrociando la marea e i rintocchi: senza quei due '
             'riferimenti, le pagine non si datano.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La caduta',
                  testo='Il parapetto della cella è alto al petto: non ci si sporge per '
                        'sbaglio. E sul davanzale, nella polvere di calce, due impronte di '
                        'mani larghe — non di Ratti, che le aveva magre — puntate come chi '
                        'spinge, non come chi trattiene. Ratti non è caduto: è stato buttato. '
                        'Da uno abituato a stare in quota, che sui tetti non ha vertigini.'),
         ]),
    dict(n=2, nome='LA PENSIONE DEI TOPOGRAFI', voce_mappa='La Pensione dei Topografi',
         req='Disponibile dall’inizio', art='La Pensione dei Topografi.png',
         chiude=None,
         indizi=[
             'La pensione ospita l’intera squadra: sei uomini, strumenti da geometra, treppiedi '
             'e cordelle. Il caposquadra, Ivo Speranza, è cortese e nervoso: «tragico incidente, '
             'il povero Ratti. Il vertigine, sa com’è, prima o poi tradisce.» Ma nessuno della '
             'squadra ha il vertigine: ci vivono, sui tetti.',
             'Gli altri topografi, a bassa voce quando Speranza esce: «lavoriamo per uno studio '
             'di Milano, la squadra di Milano ci chiamano. Paga bene, paga prima. Misuriamo e '
             'basta, non chiediamo per chi. Ratti invece chiedeva. E ieri aveva litigato forte '
             'col caposquadra.»',
             'In un cassetto della camera di Ratti, una minuta mai spedita, di suo pugno: «Ho '
             'capito dove va tutto. Non è uno studio. È una PENNA. So quanto vale, e a chi '
             'venderlo.» <i>(Aggancio: conservatela per l’Episodio 12.)</i> Le misure che non '
             'tornano tornano eccome, se sai che cosa cercavano: fra tutte, le funi delle '
             'campane di ogni torre, misurate a una a una.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il topografo più giovane',
                  testo='«Ve lo dico perché ho paura, non per denaro. Ratti aveva rimesso in '
                        'ordine le sue pagine e aveva capito: tutte le misure puntano allo '
                        'stesso posto. Voleva vendere il rilievo per conto suo. Speranza lo ha '
                        'saputo — se perdiamo la commessa, siamo sei uomini in mezzo a una '
                        'strada. Ieri sono saliti insieme alla Torre. È sceso solo Speranza. '
                        'È stato lui. Ma non prendetelo per un mostro: è solo uno che aveva '
                        'più paura della fame che del sangue.»'),
         ]),
    dict(n=3, nome='L’ARCHIVIO CIVICO', voce_mappa='L’Archivio Civico',
         req='Disponibile dall’inizio', art='L’Archivio Civico.png',
         chiude=None,
         indizi=[
             'L’archivista tira fuori le mappe ufficiali di Roccamora: catasto, reti idriche, '
             'pianta del sottosuolo. «I vostri topografi sono venuti a copiarle tutte. Cortesi. '
             'Cercavano soprattutto le mappe dei condotti sotto la Cattedrale — quelle, non ce '
             'le abbiamo. Sotto la Cattedrale, ufficialmente, non c’è niente.»',
             'Sovrapponendo le misure del taccuino alla pianta ufficiale, le linee convergono '
             'tutte in un punto — e quel punto, sulla carta, è vuoto: un punto che non c’è, '
             'sotto la navata della Cattedrale. <i>(Reperto B: raccogliete la Mappa Parziale.)</i> '
             'Qualcuno sta misurando qualcosa che le mappe non ammettono esista.',
             'L’archivista abbassa la voce: «la squadra di Milano ha lasciato un recapito in '
             'città, uno studio corrispondente. Ci sono andato a portare una copia: chiuso, '
             'buio, una targa nuova e nessuno dentro. Una scatola vuota, signori. Eppure paga.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il punto che non c’è',
                  testo='Le misure di Ratti, ordinate e riportate sulla pianta, non descrivono '
                        'la città: la triangolano verso un solo fuoco, un punto sotto la '
                        'Cattedrale che nessuna mappa civica riconosce. Non è un censimento di '
                        'campane: è un rilievo di puntamento. Qualcuno vuole sapere con '
                        'precisione al palmo dove si trova quel vuoto — e da quali bocche di '
                        'pietra, in tutta Roccamora, il suono ci arriverebbe sopra.'),
         ]),
    dict(n=4, nome='LA CAMERA DEI PESI', voce_mappa='La Camera dei Pesi e delle Misure',
         req='Disponibile dall’inizio', art='Camera dei Pesi.png',
         chiude=20,
         indizi=[
             'L’ufficio dei pesi e misure tara gli strumenti della città: bilance, regoli, e le '
             'tavole delle maree del molo, aggiornate ogni giorno. «I vostri topografi venivano '
             'a tarare le cordelle qui. E a copiare le tavole della marea del molo: dicevano che '
             'senza, le misure fatte dall’alto non tornano.»',
             'Il misuratore capo mostra come si datano le pagine di Ratti: ogni misura porta una '
             'quota di marea e l’ora d’accordatura delle campane. Con le tavole in mano, le '
             'pagine sciolte trovano il loro ordine — e l’ordine dice quale fu l’ultima. «Le '
             'funi delle campane e la marea: due orologi, e lui li usava entrambi.»',
             'Rimesse in fila, le misure raccontano un percorso: partì dalle fontane, salì ai '
             'campanili, e finì alla Torre — dove segnò l’ultima, quella verso la Cattedrale, e '
             'capì tutto. È dopo quell’ultima misura che è morto. <i>(Con il Taccuino ordinato '
             'qui, prendete la carta Il Taccuino Ordinato.)</i>'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’ordine delle misure',
                  testo='Datando ogni pagina con la marea e l’accordatura, la sequenza si '
                        'chiude: fontane, poi campanili, poi la Torre Civica per ultima, al '
                        'tramonto di ieri. L’ultima misura è il puntamento verso la Cattedrale: '
                        'è lì che Ratti capì il disegno, ed è lì che decise di vendersi. '
                        'L’ordine non serve solo a voi: seguire i suoi passi vi dice per dove '
                        'Speranza salirà e fuggirà stanotte — i tetti non hanno segreti, se sai '
                        'in che ordine sono stati calpestati.'),
         ]),
    dict(n=5, nome='LO STUDIO CORRISPONDENTE', voce_mappa='Lo Studio Corrispondente',
         req='Lo studio è chiuso e sulla targa non c’è che una sigla: apre solo a chi sa nominare '
             'chi lo tiene in piedi — quegli uomini venuti da fuori, la ditta che paga.',
         chiave=('parola', 'LA SQUADRA DI MILANO'), art='Lo Studio Corrispondente.png',
         chiude=None,
         indizi=[
             'Dentro, niente: uno scrittoio, una lampada spenta, un timbro. Nessun impiegato, '
             'nessun registro. Sul tavolo, la corrispondenza in arrivo si accumula non aperta. '
             'È un recapito, non uno studio: una scatola vuota che gira lettere e denaro verso '
             'un’altra scatola, altrove.',
             'Nel cassetto a chiave forzato, la commessa del rilievo: incarico allo studio '
             '«per censimento fonico», pagato in anticipo, su carta di pregio, filigranata, '
             'firmato con un ricciolo solo. Non una ditta: una penna. <i>(Reperto C: consegnate '
             'la Commessa del Rilievo.)</i>',
             'Sul retro della commessa, di altra mano, un elenco di consegne: dove mandare i '
             'rilievi finiti. Non a Milano. A un fermo-posta cittadino, intestato a un nome '
             'd’archivio così anonimo che nessuno ci farebbe caso. Chi paga non è lontano: è '
             'qui, e si nasconde dietro una scatola.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La commessa firmata',
                  testo='Carta di pregio, filigrana della cartiera dei casi passati; il rilievo '
                        'acustico di mezza Roccamora pagato prima ancora di cominciare; e la '
                        'firma è un ricciolo solo, la stessa mano che affiora nei registri '
                        'dell’inverno. «La squadra di Milano» non esiste: è un nome dipinto su '
                        'una porta chiusa. Dietro c’è una penna sola, che compra misure come '
                        'chi accorda uno strumento prima del concerto.'),
         ]),
    dict(n=6, nome='IL CAMPANILE DI SAN TEODORO', voce_mappa='Il Campanile di San Teodoro',
         req='Al campanile si sale, e a quest’ora la salita è chiusa: apre solo a chi sa che la '
             'misura buona si prende con la marea, quando l’acqua del molo è al suo segno.',
         chiave=('parola', 'LA MAREA DEL MOLO'), art='Cella campanaria.png',
         chiude=19,
         indizi=[
             'Il campanaro, vecchio e sordo di un orecchio, ricorda i topografi: «salivano '
             'all’ora d’accordatura, quando batto le campane per il vespro. Dicevano che serviva '
             'il rintocco per la misura. Uno solo, magro, tornava sempre: segnava e rifaceva, '
             'segnava e rifaceva, come uno che cerca un errore che non c’è.»',
             'Da quassù si vede la città come una mappa: e si vede il punto. L’orario '
             'd’accordatura scolpito sul registro del campanaro conferma la sequenza del '
             'taccuino — è di qui che passa l’ordine giusto delle misure. Le funi delle campane '
             'sono un orologio, e Ratti lo leggeva.',
             'Il campanaro indica i tetti verso la Torre: «i vostri amici topografi ci saltano '
             'come gatti, di notte. C’è una via alta, di camminamenti e guglie, che solo chi la '
             'sa fa in fretta. Il caposquadra la conosce meglio di tutti. Se lo cercate lassù, '
             'preparatevi al vento — e a non guardare giù.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La città che aspetta il suono',
                  testo='In cima, con il vento che porta via le parole, per un istante le '
                        'campane di tutta Roccamora paiono trattenere il fiato insieme, '
                        'accordate sullo stesso vuoto. Non è una visione: è un calcolo che si '
                        'fa carne. Qualcuno vuole che ogni bocca di bronzo della città, a un '
                        'segnale, canti verso lo stesso punto sotto la Cattedrale. Il censimento '
                        'non conta le campane: le prepara.'),
         ]),
    dict(n=7, nome='IL SAGRATO DELLA CATTEDRALE', voce_mappa='Il Sagrato della Cattedrale',
         req='Il sagrato è aperto a tutti, ma quello che conta è sotto, e ci si arriva solo '
             'sapendo cosa cercare: il luogo segnato dalle misure, quello che sulle carte non '
             'esiste.',
         chiave=('parola', 'UN PUNTO CHE NON C’È'), art='Il Sagrato della Cattedrale.png',
         chiude=None,
         indizi=[
             'Sul sagrato, di notte, il sagrestano è a disagio: «rilievi, qui? Nessuno mi ha '
             'avvisato. Sotto la navata? Là ci sono solo le vecchie cisterne murate, roba di '
             'secoli fa. Niente che valga una misura.» Eppure tutte le linee del taccuino '
             'convergono proprio sotto i suoi piedi.',
             'Confrontando la Mappa Parziale con la pietra del sagrato, il punto che non c’è '
             'cade esattamente sopra una lastra più nuova delle altre, senza iscrizione. Sotto '
             'quella lastra passa qualcosa che le mappe civiche non ammettono: il fuoco verso '
             'cui suonerebbe la città intera.',
             'Un chierichetto, curioso, sussurra: «il povero Ratti è venuto qui l’ultima sera, '
             'prima della Torre. Ha guardato la lastra a lungo, ha scritto una cosa sola, e se '
             'n’è andato bianco in faccia. Diceva tra sé: “allora è per questo che pagano”.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La colpa del morto',
                  testo='Tutto sembra accusare Ratti: era lui a misurare con più zelo, lui a '
                        'tornare di notte, lui a scrivere di «venderlo». Facile crederlo il '
                        'regista del disegno. Ma un regista non si fa buttare da una torre dal '
                        'proprio caposquadra: Ratti aveva solo capito troppo e voluto '
                        'guadagnarci. La vera mano non misura e non sale: firma, paga, e resta '
                        'pulita. Attenti a non prendere la vittima per il mandante.'),
         ]),
    dict(n=8, nome='LA BOTTEGA DEL CORDAIO', voce_mappa='La Bottega del Cordaio',
         req='La bottega del cordaio è chiusa, e lui apre a quest’ora solo a chi gli parla del '
             'suo mestiere vero: le corde che tengono i bronzi, quelle che non devono cedere.',
         chiave=('parola', 'LE FUNI DELLE CAMPANE'), art='La Bottega del Cordaio.png',
         chiude=None,
         indizi=[
             'Il cordaio arma le campane di mezza città: «le mie funi tengono un uomo meglio di '
             'un bronzo. Volete salire per i tetti stanotte? Senza una corda buona, il primo '
             'colpo di vento vi porta via. Ve ne do una da campanaro: assicuratevi, e la guglia '
             'non vi fa paura.» <i>(Oggetto: prendete la carta La Corda del Campanaro.)</i>',
             'Il cordaio conosce la via alta: «tegole viscide, grondaie marce, camminamenti '
             'senza ringhiera. Ma il pericolo vero non è cadere voi: è che caschi chi inseguite. '
             'Se volete quel caposquadra vivo, sul cornicione dovrete trattenerlo — e senza una '
             'corda in mano, lo vedrete solo volare giù.»',
             'Mostra come si assicura un passaggio esposto: un nodo, un appiglio, e il vento '
             'perde la presa. «Con la corda, le tegole che cedono e le grondaie che si sfondano '
             'non vi ammazzano: vi appendono e basta. È l’unica cosa che vi tiene in questo '
             'mestiere di gatti.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La corda che trattiene',
                  testo='La corda del campanaro non è un attrezzo da scalata: è fatta per '
                        'reggere il peso oscillante di un bronzo, e per anni di strappi. In '
                        'quota fa due cose: vi assicura ai passaggi esposti (le trappole di '
                        'caduta non vi feriscono) e vi dà di che afferrare un uomo aggrappato '
                        'al cornicione senza precipitare con lui. Prendere Speranza vivo, senza '
                        'questa corda, è quasi impossibile: il vento decide prima di voi.'),
         ]),
    dict(n=9, nome='IL PONTEGGIO DEL RESTAURO', voce_mappa='Il Ponteggio del Restauro',
         req='Il ponteggio dà accesso ai tetti, ed è sbarrato: ci si passa solo mostrando di '
             'sapere del morto e del suo taccuino — la faccenda delle misure che non tornano.',
         chiave=('parola', 'LE MISURE CHE NON TORNANO'), art='Il Ponteggio del Restauro.png',
         chiude=None,
         indizi=[
             'Il ponteggio del restauro della Torre è la via che i topografi usano per salire '
             'senza passare dalle scale interne. Il guardiano notturno: «i signori del rilievo '
             'salgono di qui. Ieri sera sono saliti in due, il magro e il caposquadra. È tornato '
             'giù solo il caposquadra, e aveva le mani che gli tremavano.»',
             'Appeso a un chiodo, dimenticato nella fretta, un tesserino: identico a quelli veri, '
             'timbri ministeriali perfetti, ma intestato a un ispettore che non esiste. Sembra la '
             'prova d’un mandante ufficiale. <i>(Esca: potete prendere la carta Il Tesserino '
             'Perfetto — un falso fatto per depistare, non prova nulla.)</i>',
             'Da qui parte la via delle guglie: un dedalo di camminamenti in quota fino alla '
             'Torre. Il guardiano scuote la testa: «col vento di stanotte, lassù, non ci salirei '
             'per tutto l’oro del mondo. Ma se ci andate, sappiate che il caposquadra quei tetti '
             'li conosce a memoria, e voi no.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il falso troppo perfetto',
                  testo='Il tesserino è un falso di qualità impossibile per un falsario di '
                        'strada: carta giusta, timbri autentici, sigilli veri. Solo un ufficio '
                        'fa falsi così — o qualcuno che ha accesso agli originali. Ma è '
                        'proprio la perfezione a tradirlo: è lasciato dove chi indaga lo trovi, '
                        'non dove serva a lavorare. È un’esca, posata per far accusare un '
                        'ministero che non c’entra. La penna che paga vi vuole a caccia della '
                        'preda sbagliata.'),
         ]),
]

# Tessere della via delle guglie (percorso lineare a 6 in salita: una torre,
# non un labirinto). Regola d'ambiente VENTO/VERTIGINE sulle tessere ESPOSTE;
# obiettivo = CATTURA VIVA del Caposquadra (overkill = filo perso).
TILES_11 = [
    dict(id='T1', nome='L’ABBAINO', exits={'N': 'T2'}, start='S', esposta=False,
         testo='L’abbaino della Torre, ultimo riparo prima dei tetti: una botola, un cero, il '
               'vento che fischia dalle fessure. QUANDO RIVELATE QUESTA TESSERA: applicate '
               'l’esito delle Domande 3 e 4 (vedi Soluzione); comincia la salita. Da qui in su '
               'vale la REGOLA DEL VENTO: sulle tessere ESPOSTE, a inizio turno, ogni eroe prova '
               'NERVI o perde lo scatto (e, se a 1 Ferita, subisce 1 danno da vertigine).',
         cerca_vuoto='Solo un cero mozzo e il vento che entra dalle fessure. Di qui in avanti '
                     'non c’è più tetto sopra la testa: c’è la città, sotto i piedi.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL CAMMINAMENTO OVEST', exits={'S': 'T1', 'N': 'T3'}, esposta=True,
         testo='Un camminamento stretto lungo il fianco ovest, senza ringhiera, il vuoto a un '
               'palmo dai piedi. Il vento spinge di traverso. QUESTA TESSERA È ESPOSTA: prova '
               'NERVI a inizio turno (vedi regola). L’altezza fa più paura di qualsiasi nemico.',
         arbitro='TRAPPOLA: una tegola cede sotto il piede (VIGORE Media o scivoli e resti '
                 'appeso — un round perso a risalire). CON LA CORDA DEL CAMPANARO: siete '
                 'assicurati, nessuna prova sulla tegola. Tessera d’AMBIENTE, non di '
                 'combattimento: qui non si piazzano lealisti.',
         hook='La Corda del Campanaro (dalla Bottega del Cordaio): assicurati, la tegola non vi '
              'ferisce.',
         cerca_vuoto='Tegole viscide e il vuoto. Non c’è niente da cercare quassù: c’è solo da '
                     'passare, e da non guardare giù.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA LOGGIA DELLE CAMPANE', exits={'S': 'T2', 'N': 'T4'}, esposta=False,
         testo='Una loggia riparata tra i bronzi enormi di una cella campanaria: qui il vento '
               'non arriva, ma i rintocchi assordano. QUANDO RIVELATE QUESTA TESSERA: l’eroe più '
               'avanzato prova NERVI (Media) — l’eco dei bronzi disorienta chi non se l’aspetta. '
               'Tessera RIPARATA: nessuna prova di vento.',
         arbitro='Riparo dal vento: buon punto per riprendere fiato e, se serve, trattenere il '
                 'boss lontano dal vuoto. Se avete il Taccuino Ordinato, la loggia è un nodo '
                 'della via che conoscete: +1 alle prove NERVI di questa tessera.',
         cerca='In una nicchia, la corda di servizio di un campanaro, ancora buona (+1 alle '
               'prove NERVI del vento finché la tiene chi l’ha presa).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='IL TETTO A SCHIENA D’ASINO', exits={'S': 'T3', 'N': 'T5'}, esposta=True,
         testo='Un tetto ripido a doppia falda, il colmo come una lama: si passa in equilibrio, '
               'col vento che gira. QUESTA TESSERA È ESPOSTA, e il vento qui è FORTE (+1 alla '
               'difficoltà della prova NERVI). QUANDO RIVELATE QUESTA TESSERA: appare un '
               'TOPOGRAFO LEALISTA, che crede alla «disposizione ministeriale» e vi sbarra.',
         arbitro='TRAPPOLA: la grondaia di gronda è marcia e cede (NERVI Media o scivoli lungo '
                 'la falda, 1 danno e un round a risalire). CON LA CORDA: assicurati. IL '
                 'TOPOGRAFO LEALISTA (nemico minore, Fer 2) intralcia: non è un assassino, è un '
                 'uomo ingannato.',
         hook='La Corda del Campanaro: la grondaia che cede non vi ferisce.',
         cerca='Incastrato tra due tegole, un treppiede da geometra abbandonato: dentro la '
               'sacca, una fiala d’olio da lanterna (utile a chi ha la Lanterna Cieca).',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='IL BALLATOIO DELLA TORRE', exits={'S': 'T4', 'N': 'T6'}, esposta=True,
         testo='Il ballatoio che gira attorno alla Torre, appena sotto la cella: di qui si vede '
               'tutta Roccamora, e il vento la sferza. QUESTA TESSERA È ESPOSTA. IL CAPOSQUADRA '
               'vi ha visti salire e comincia a fuggire verso la guglia: se non gli avete tolto '
               'i tetti (Domanda 3), usa la sua scorciatoia e vi guadagna terreno.',
         arbitro='Ultimo diaframma prima della guglia. Il Caposquadra è già in movimento: senza '
                 'il Taccuino Ordinato, una volta per round salta a una tessera non adiacente '
                 '(conosce i tetti). Con il Taccuino Ordinato, sapete dove va: niente '
                 'scorciatoia.',
         cerca_vuoto='Il ballatoio gira nel vuoto. Nessun appiglio, nessun riparo: solo il vento '
                     'e la sagoma del caposquadra che sale davanti a voi, verso la guglia.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='LA GUGLIA', exits={'S': 'T5'}, esposta=True,
         testo='La guglia della Torre, il punto più alto e più esposto della città: il vento '
               'urla, la pietra è liscia di ghiaccio. IL CAPOSQUADRA, Ivo Speranza, è qui, la '
               'mappa-madre stretta in pugno e un piede già sul cornicione. QUANDO RIVELATE '
               'QUESTA TESSERA: la resa dei conti. Va preso VIVO.',
         arbitro='CATTURA VIVA. Vento al massimo (+1 alla difficoltà NERVI, oltre alle raffiche). '
                 'Portate Speranza all’ultima Ferita: si aggrappa al cornicione. Allora un eroe '
                 'adiacente lo CATTURA con Interagire (con la Corda del Campanaro è automatico; '
                 'senza, prova FORZA Media). Un attacco che lo porterebbe a 0 lo fa CADERE: filo '
                 'perso. Se resta sull’esposto a 1 Ferita e si pesca una raffica, cade da solo: '
                 'tenetelo sul lato riparato della guglia.',
         cerca_vuoto='Non c’è niente da raccogliere quassù: c’è solo un uomo aggrappato al vuoto '
                     'e una mappa che il vento vuole strappargli di mano. Prendeteli entrambi, '
                     'in fretta.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_11 = [
    dict(nome='IL CAPOSQUADRA', att=2, dif=8, fer=5, mov=4, dan=2, boss=True,
         tipo='Il Cacciatore di Tetti (Boss)', art='Il Caposquadra.png',
         note='CONOSCE I TETTI: ignora la regola del vento; una volta per round si muove a una '
              'tessera non adiacente (scorciatoia). Nessuna debolezza-oggetto (è un uomo). «LE '
              'MISURE ORDINATE» (D3 esatta, Taccuino Ordinato): perde la scorciatoia e gli eroi '
              'hanno +1 alle prove NERVI. CATTURA VIVA: a 1 Ferita si aggrappa al cornicione, '
              'catturabile con Interagire (Corda = automatico; overkill = CADE, filo perso). Ai '
              'tavoli da 2-3 eroi non recupera mai ferite (regola delle taglie).',
         bio_bestiario='Ivo Speranza non è un cultista e non è un mostro: è un caposquadra di '
              'topografi con sei uomini da sfamare e una commessa che è la sua unica salvezza. '
              'Sa di misurare la città per conto di uno studio che non esiste; non sa per chi '
              'davvero, e ha scelto di non chiederselo. Quando Emilio Ratti ha capito il disegno '
              'e ha voluto vendersi, Speranza ha visto sparire il pane di tutti — e lo ha spinto '
              'dalla cella campanaria con le sue mani. Una colpa sola, per paura, non per '
              'vocazione. Agile e svelto (Mov 4), conosce i tetti come le proprie tasche: '
              'ignora il vento e taglia per scorciatoie che voi non vedete. Ma non picchia forte '
              '(Danno 2): la sua arma è la fuga in quota. Va preso VIVO — è l’unico che ha visto '
              'la firma sulla commessa e sa a chi vanno i rilievi. Se lo uccidete, o se il vento '
              'lo strappa dal cornicione, il filo che porta alla penna muore con lui. Toglietegli '
              'i tetti (rimettete in ordine le misure di Ratti) e diventa un uomo qualunque, in '
              'bilico sul vuoto, che aspetta solo una mano che lo tiri su.'),
    dict(nome='IL TOPOGRAFO LEALISTA', att=1, dif=7, fer=2, mov=3, dan=1, boss=False,
         tipo='L’Ingannato in Buona Fede', art='Il Topografo Lealista.png',
         note='Appare in T4. Nemico minore: crede alla «disposizione ministeriale» e sbarra chi '
              'sale, non è un combattente. Cade con poco; non ha colpe, solo ordini.',
         bio_bestiario='Uno dei sei uomini della squadra: crede davvero di lavorare per un '
              'ministero, di fare un servizio alla città misurandone le voci. Non sa nulla della '
              'penna che paga, né del vuoto sotto la Cattedrale; sa solo che il caposquadra gli '
              'ha detto di non far salire nessuno stanotte, e lui obbedisce. Vi sbarra il '
              'camminamento con un treppiede alzato come un’arma goffa. Abbatterlo è facile e '
              'quasi ingiusto: è ingannato quanto la città che sta aiutando a misurare. Se '
              'sopravvive alla notte, un giorno capirà, e avrà vergogna abbastanza per '
              'testimoniare.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 11 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 11')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il censimento delle campane')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_11.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 200*mm, W - 2*mx, 140*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 215*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Torre Civica, la pensione dei topografi, l’Archivio Civico, la Camera dei Pesi.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 11')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore, 9 luoghi: dovrete sceglierne 3 da saltare):')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Camera dei Pesi (4) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Campanile San Teodoro (6) chiude 19')

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
    doms = ['1. DOVE converge la mappatura? (attenzione: serve più di una conferma)',
            '2. CHI ha spinto il topografo dalla Torre?',
            '3. IN CHE ORDINE ha preso le ultime misure? (attenzione: serve più di una conferma)',
            '4. COSA portate per la via delle guglie?']
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
    c.setTitle('Ombre su Roccamora - Episodio 11 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 11 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la via delle guglie, col vento che chiama giù')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (6 spawn, 7 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '11/cards/</b>). Le 6 tessere della via delle guglie sono in <b>Episodio '
                  '11/board/</b>. Questo NON è un dungeon né una corsa: è un’<b>ascesa in '
                  'quota</b> con una <b>regola d’ambiente</b>. Metà tessere sono ESPOSTE al '
                  'vento: chi ci sta prova NERVI a inizio turno. L’obiettivo non è uccidere il '
                  'boss ma <b>prenderlo VIVO</b>: è l’unico testimone di chi paga. Le pagine '
                  'seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole nuove di questo episodio:</b>', BODY),
        Paragraph('• <b>VENTO / VERTIGINE.</b> Ogni tessera è ESPOSTA (tetti, camminamenti, '
                  'ballatoi, guglia) o RIPARATA (abbaino, loggia). Su una tessera ESPOSTA, a '
                  'inizio turno ogni eroe prova <b>NERVI</b>: se fallisce perde lo scatto (niente '
                  'movimento extra) e, se è a 1 Ferita, subisce 1 danno da vertigine. Le carte '
                  '<b>crescendo</b> sono raffiche: alzano di 1 la difficoltà del vento, '
                  'cumulativo, oltre al +1 Canto. Il Taccuino Ordinato dà +1 a queste prove.', BODY),
        Paragraph('• <b>CATTURA VIVA.</b> Il Caposquadra va preso vivo. Ridotto a 1 Ferita si '
                  'aggrappa al cornicione: un eroe adiacente lo <b>cattura</b> con Interagire — '
                  'automatico con la <b>Corda del Campanaro</b>, altrimenti prova FORZA. Un '
                  'attacco che lo porterebbe a 0 lo fa <b>CADERE</b>: non è wipe, ma il filo '
                  'dell’Atto III è perso. Tenetelo lontano dal vuoto: sull’esposto, a 1 Ferita, '
                  'una raffica lo butta giù da sola.', BODY),
        Paragraph('• <b>CONOSCE I TETTI.</b> Il boss ignora il vento e, una volta per round, '
                  'salta a una tessera non adiacente. Con il Taccuino Ordinato (Domanda 3) '
                  'sapete dove va: perde la scorciatoia. La Corda annulla le due trappole di '
                  'caduta (T2, T4) e abilita la cattura; la Lanterna Cieca leva il malus del '
                  'buio.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_11:
        art_file = TILE_ART_11[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'bell tower.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_11[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_11.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 11</b>. In campo: i <b>topografi '
                  'lealisti</b> (Sgherri, pochi: ingannati, non assassini), <b>il Topografo '
                  'Lealista</b> nominato (nemico minore, appare in T4) e <b>il Caposquadra</b> '
                  '(il boss: fugge sui tetti verso la guglia, T6, e va preso VIVO). La Claque '
                  '(Ep. 4), se sopravvissuta, appare come voci comprate che dall’alto vi coprono '
                  'di insulti (insidia NERVI a distanza). Nessun mostro: l’orrore è l’altezza. '
                  'Vittoria: catturare il Caposquadra vivo. Ai tavoli da 2-3 eroi non recupera '
                  'mai ferite (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_11())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_11():
    """Miniature dell'Episodio 11. I segnalini Canto sono qui i segnalini
    della BORA (le raffiche di vento che salgono in quota e alimentano la
    difficolta' dell'ambiente)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('TOPOGRAFI LEALISTI (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL CAPOSQUADRA · IL TOPOGRAFO LEALISTA', [('Il Caposquadra.png', 1),
                                                    ('Il Topografo Lealista.png', 1)]),
        ('LA BORA (CANTO)', [('Il primo refolo.png', 1),
                             ('Il vento gira.png', 1),
                             ('La bora dal mare.png', 1),
                             ('La raffica sulla guglia.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 11 - Soluzione (non aprire)')

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
        'solo dopo aver risposto per iscritto alle 4 Domande.',
        '<b>Il caso.</b> Funzionari-fantasma censiscono campane, organi e fontane «per '
        'disposizione ministeriale». Nessun ministero li ha mandati. Uno di loro, Emilio Ratti, '
        'cade dalla Torre Civica; le sue ultime misure, pagine sciolte e non datate, non '
        'tornano.',
        '<b>La verità.</b> È la mappatura acustica di Roccamora, eseguita da topografi veri '
        'ingaggiati da uno studio-scatola di Milano che non esiste. Le misure convergono in un '
        'punto sotto la Cattedrale che le mappe non riconoscono: è il puntamento per il Terzo '
        'Movimento. Ratti aveva capito e voleva vendersi il rilievo; il caposquadra Ivo '
        'Speranza, per non perdere la commessa, lo ha spinto dalla cella. Sventare = prendere '
        'Speranza VIVO, l’unico che sa a chi vanno i rilievi.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE converge la mappatura?</b> In un punto sotto la Cattedrale che sulle mappe '
        'ufficiali non esiste (le misure del taccuino + le mappe dell’Archivio, sovrapposte: '
        'serve più di una conferma). <i>Esatta:</i> sapete già dove tutto punta — nel 1° round '
        'non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> salite alla cieca, 1 topografo '
        'lealista appare in T1 alla rivelazione.',
        '<b>2. CHI ha spinto il topografo?</b> Ivo Speranza, il caposquadra, per paura di '
        'perdere la commessa (impronte di mani sul davanzale + la testimonianza della squadra + '
        'la lite alla pensione). <i>Esatta:</i> lo affrontate sapendo chi è e perché — quando è '
        'a 1 Ferita, la cattura con Interagire riesce anche senza prova FORZA (con la Corda '
        'resta automatica; senza Corda, la FORZA è a Facile). <i>Sbagliata:</i> nessun effetto.',
        '<b>3. IN CHE ORDINE ha preso le ultime misure?</b> Fontane, poi campanili, poi la Torre '
        'per ultima — l’ultima misura è il puntamento verso la Cattedrale (il taccuino grezzo + '
        'la marea e l’accordatura della Camera dei Pesi: serve più di una conferma; il Campanile '
        'conferma). <i>Esatta (Taccuino Ordinato):</i> conoscete la via del boss — il '
        'Caposquadra PERDE la scorciatoia sui tetti e voi avete +1 a tutte le prove NERVI del '
        'vento. <i>Sbagliata:</i> lui taglia per i tetti e vi guadagna terreno (scorciatoia '
        'attiva).',
        '<b>4. COSA portate per la via delle guglie?</b> LA CORDA DEL CAMPANARO (la Bottega del '
        'Cordaio). <i>Con la Corda:</i> siete assicurati (le trappole di caduta T2/T4 non vi '
        'feriscono) e potete TRATTENERE Speranza sul cornicione — la cattura a 1 Ferita è '
        'automatica. <i>Senza:</i> le trappole feriscono e la cattura richiede una prova FORZA '
        'rischiosa (fallita = lo perdete nel vuoto). Aiuti: il Taccuino Ordinato (Camera dei '
        'Pesi, spegne la scorciatoia e +1 NERVI), la Lanterna Cieca (Campanile, leva il malus '
        'del buio). <i>Esche:</i> il Tesserino Perfetto (un falso, non un mandante) e la Colpa '
        'del Morto (Ratti è la vittima, non il regista).',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente tre carte — la '
        'Testimonianza «Il topografo più giovane» (L2), il Referto «Il punto che non c’è» (L3, '
        'che smaschera il disegno) e il Referto «L’ordine delle misure» (L4, che pone Speranza '
        'sulla Torre all’ora giusta). Senza nessuna delle tre, giudicate con elasticità una '
        'risposta «vicina» (es. «il caposquadra, quello sceso solo dalla Torre»). La Domanda 2 '
        'non ha complicazione se sbagliata: si perde solo il vantaggio sulla cattura.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — la via delle guglie', [
        '<b>Montaggio</b> (tessere in Episodio 11/board/, coperte tranne T1):<br/>'
        'T1 Abbaino (partenza, da Sud, RIPARATA) → T2 Camminamento Ovest (ESPOSTA, trappola) → '
        'T3 Loggia delle Campane (RIPARATA) → T4 Tetto a Schiena d’Asino (ESPOSTA, vento forte, '
        'trappola, appare il Topografo Lealista) → T5 Ballatoio (ESPOSTA, il boss fugge) → T6 '
        'Guglia (ESPOSTA, la cattura). Salita lineare: è una torre, non un labirinto.',
        '<b>Regola del vento.</b> Su ogni tessera ESPOSTA, a inizio turno ogni eroe prova NERVI '
        '(Media): fallita, niente scatto quel turno, e se è a 1 Ferita 1 danno da vertigine. '
        'Ogni carta crescendo (raffica) alza di 1 la difficoltà, cumulativa e permanente, oltre '
        'al +1 Canto. Il Taccuino Ordinato dà +1 a queste prove; alla guglia (T6) il vento è a '
        '+1 di base.',
        '<b>Le trappole (T2, T4).</b> Una tegola e una grondaia che cedono: senza la Corda del '
        'Campanaro, prova (VIGORE/NERVI Media) o 1 danno e un round perso a risalire; con la '
        'Corda, siete assicurati e non c’è prova. La Lanterna Cieca annulla il −1 alle prove di '
        'vento sulle tessere esposte al buio.',
        '<b>Il Caposquadra.</b> Boss agile: Att +2, Dif 8, Fer 5, Mov 4, Danno 2. Conosce i '
        'tetti: ignora il vento e, 1 volta per round, salta a una tessera non adiacente. Col '
        'Taccuino Ordinato (D3) perde la scorciatoia e non può usarla per sganciarsi da chi lo '
        'tiene. Nessuna debolezza-oggetto: è un uomo.',
        '<b>La cattura viva.</b> Portatelo all’ultima Ferita: si aggrappa al cornicione. Un eroe '
        'adiacente lo cattura con Interagire — automatico con la Corda, altrimenti prova FORZA '
        '(Facile se D2 esatta, Media se no). Un colpo che lo porterebbe a 0 lo fa CADERE: filo '
        'perso (l’Atto III perde l’aggancio; la campagna prosegue depotenziata, non è wipe). Se '
        'resta su tessera ESPOSTA a 1 Ferita e si pesca una raffica, cade da solo: portatelo/'
        'tenetelo sul lato riparato della guglia prima di finirlo.',
        '<b>Il mazzo:</b> 21 carte (6 topografi lealisti, 7 insidie NERVI, 4 crescendo/raffiche, '
        '4 eventi). Il Canto qui è LA BORA: alla soglia (3) il vento è al colmo — ogni Fase '
        'Minaccia pesca 1 carta in più, per sempre, e ogni tessera esposta diventa un azzardo. '
        'Ramo del Bivio Ep. 10: se avete consegnato il vedovo, un evento-favore extra (un '
        'campanaro vi indica la via); se avete usato la casa, la partenza in T1 è più esposta '
        '(Gendarmeria ostile).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se catturate Speranza vivo.</b> «Il caposquadra si '
        'aggrappa al cornicione con le dita bianche, e per la prima volta in settimane le sue '
        'misure non contano niente. Lo tirate su. Non è un cultista, non è nessuno: è un uomo '
        'che ha spinto un altro uomo per non perdere sei paghe. Parla subito, perché non ha '
        'altro da vendere. “Non è uno studio,” dice, “lo studio è vuoto. È una penna. Ho visto '
        'la firma sulla commessa una volta sola.” E vi mostra, dall’ordine che avete rimesso, il '
        'punto verso cui puntava tutto: sotto la Cattedrale, dove sulle mappe non c’è niente.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 11:</b> <i>«Qualcuno sta misurando la gola della città. Non '
        'si misura ciò che non si vuole far suonare.»</i> Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Pubblicare lo scandalo.</b> I lavori si fermano: l’Episodio 12 parte con <b>1 '
        'crescendo in meno</b> nel mazzo. Ma le scatole vuote bruciano tutto — <b>un filo in '
        'meno nell’Atto III</b>.<br/>'
        '<b>Infiltrare la squadra.</b> Un vostro uomo dentro: <b>un incrocio in più negli '
        'Episodi 12-13</b>. Ma la mappatura si completa — nel finale (Episodio 20) il rituale '
        'parte con <b>1 segnalino Canto in più</b>.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 11.',
        '<b>AGGANCIO.</b> La minuta mai spedita di Ratti, e la parola di Speranza: «è una '
        'PENNA». Non uno studio, non un ufficio con un mandante: una mano sola che firma e paga. '
        'Chi imita una firma — o chi non ha bisogno di imitarla?',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'perso il filo (Speranza caduto), niente aggancio «PENNA» all’Episodio 12: la Società ci '
        'arriva più tardi e più al buio.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI11_DESC = {
    1: "La Torre Civica domina la piazza col suo quadrante e le sue campane. "
       "Ai suoi piedi, stanotte, un telo copre un morto; in cima, la cella "
       "campanaria da cui è caduto. È l'ultimo posto dove Emilio Ratti ha "
       "misurato qualcosa — e il primo dove le sue misure cominciano a "
       "raccontare, se qualcuno le rimette in fila.",
    2: "La pensione dei topografi è un alloggio dignitoso e provvisorio: sei "
       "uomini venuti da fuori, treppiedi negli angoli, cordelle appese. Si "
       "parla poco e si guarda la porta: da quando Ratti è morto, la squadra "
       "sa più di quanto dica, e il caposquadra sorride un sorriso che non "
       "arriva agli occhi.",
    3: "L'Archivio Civico è un labirinto di scaffali e polvere: catasti, reti "
       "idriche, piante del sottosuolo. Qui le misure sciolte di un morto "
       "trovano una carta su cui posarsi — e, posate, disegnano una freccia "
       "verso un punto che nessuna mappa civica ammette di conoscere.",
    4: "La Camera dei Pesi è l'ufficio che tara gli strumenti della città: "
       "bilance di ottone, regoli campione, e le tavole delle maree del molo "
       "aggiornate ogni giorno. È il posto meno misterioso di Roccamora — ed "
       "è proprio qui che le misure impossibili di Ratti trovano l'orologio "
       "che le mette in ordine.",
    5: "Lo studio corrispondente è una porta con una targa nuova su una via "
       "qualunque: dentro, uno scrittoio, una lampada spenta, un timbro, e la "
       "posta che si accumula non aperta. Non uno studio: un recapito. Una "
       "scatola vuota che gira lettere e denaro verso un'altra scatola, e "
       "così via, fino a una mano che nessuno vede.",
    6: "Il Campanile di San Teodoro si sale per una scala a chiocciola fino "
       "alla cella dei bronzi. Da lassù la città è una mappa e il vento è "
       "un padrone. Il vecchio campanaro accorda le campane al vespro, e in "
       "quell'ora — e solo in quella — le misure prese dall'alto tornano "
       "giuste. Di qui parte la via delle guglie.",
    7: "Il sagrato della Cattedrale, di notte, è una distesa di pietra "
       "silenziosa. Sotto, dicono, solo vecchie cisterne murate. Eppure ogni "
       "linea del taccuino di Ratti converge qui, su una lastra più nuova "
       "delle altre, senza nome: il punto che non c'è, il fuoco verso cui "
       "qualcuno vuole far cantare la città intera.",
    8: "La bottega del cordaio odora di canapa e di sego. Qui si fanno le "
       "funi che tengono i bronzi delle campane — e che, all'occorrenza, "
       "tengono un uomo sospeso nel vuoto. Il cordaio conosce la via alta "
       "meglio di chiunque: sa quali corde reggono, e sa che stanotte "
       "reggeranno o lasceranno cadere.",
    9: "Il ponteggio del restauro fascia il fianco della Torre come una "
       "gabbia di tavole e corde: è la via che i topografi usano per salire "
       "senza farsi vedere. Da qui, ieri sera, sono saliti in due; è tornato "
       "giù uno solo. E di qui, stanotte, comincia la salita verso la guglia "
       "e verso l'uomo che non deve morire prima di parlare.",
}

OGGETTI_LUOGO_11 = {
    1: ['Il Taccuino Ordinato'],
    6: ['La Lanterna Cieca'],
    7: ['La Colpa del Morto'],
    8: ['La Corda del Campanaro'],
    9: ['Il Tesserino Perfetto'],
}

TILE_ART_11 = {t['id']: t['id'] + '-ep11.png' for t in TILES_11}
LUOGHI11_CROP = {}

TESSERE_DESC_11 = {
    'T1': "L'abbaino della Torre è l'ultimo pezzo di dentro prima del fuori: "
          "una botola aperta sul buio, un cero che il vento fa danzare, "
          "l'odore di guano e di pioggia vecchia. Oltre la botola, i tetti di "
          "Roccamora scendono a onde nel nero, e da qualche parte, lassù, un "
          "uomo sale più in fretta di voi.",
    'T2': "Il camminamento ovest corre lungo il fianco della Torre, largo "
          "quanto un piede e mezzo, senza ringhiera: da un lato la pietra, "
          "dall'altro il vuoto e la piazza minuscola in fondo. Il vento "
          "arriva di traverso, a folate, e prova a staccarvi dal muro. Una "
          "tegola, sotto la suola, si muove.",
    'T3': "La loggia delle campane è un riparo insperato: tra i bronzi enormi "
          "il vento tace, e per un momento si respira. Ma i battagli, mossi "
          "dalle folate di fuori, sfiorano il metallo e mandano un ronzio "
          "basso che entra nelle ossa. Riposate in fretta: di qui in su non "
          "c'è più riparo fino alla cima.",
    'T4': "Il tetto a schiena d'asino sale ripido a due falde, e il colmo è "
          "una lama di coppi da percorrere in equilibrio. Il vento gira, "
          "cambia lato senza avvisare. Sulla gronda, un uomo in redingote "
          "grigia vi aspetta con un treppiede alzato come una picca: crede di "
          "difendere una cosa giusta. La grondaia, sotto di lui, è marcia.",
    'T5': "Il ballatoio gira attorno alla Torre appena sotto la cella: una "
          "balaustra bassa, la città intera che ruota sotto i piedi, il vento "
          "che sferza. E davanti a voi, che sale svelto verso la guglia con "
          "la mappa stretta al petto, la sagoma del caposquadra. Vi ha visti. "
          "Se conosce ancora i suoi tetti, tra un istante sparisce.",
    'T6': "La guglia è l'ultimo dito di pietra della Torre, e il posto più "
          "esposto di tutta Roccamora: il vento urla, il ghiaccio vela la "
          "pietra, e non c'è più su. Ivo Speranza è qui, un piede sul "
          "cornicione e la mappa-madre in pugno, l'aria di chi preferirebbe "
          "cadere che parlare. Prendetelo. Vivo. Prima che il vento decida "
          "per lui.",
}

ESAMI_CARBONE_11 = {
    'IL TACCUINO DELLE MISURE': '«Le pagine sono sciolte perché nessuno doveva rimetterle in '
                'fila: prese a caso, non chiudono; in ordine — datate con la marea del molo e '
                'l’accordatura delle campane — puntano tutte allo stesso vuoto. Un uomo che '
                'misura la gola della città non la censisce: la mira. E l’ultima misura, quella '
                'verso la Cattedrale, è l’ora in cui ha firmato la propria condanna.»',
    'LA COMMESSA DEL RILIEVO': '«Carta di pregio, filigrana della cartiera dei casi passati; il '
                'rilievo acustico di mezza Roccamora pagato prima di cominciare; e la firma non è '
                'd’uno studio, è d’una penna sola, la stessa che affiora nei registri '
                'dell’inverno. “La squadra di Milano” è un nome dipinto su una porta chiusa. '
                'Dietro c’è una mano che accorda la città come uno strumento, prima del '
                'concerto.»',
    'IL TESSERINO PERFETTO': '«Un falso di qualità impossibile: carta giusta, timbri autentici, '
                'sigilli veri. Non lo fa un falsario di strada — lo fa un ufficio, o chi tocca '
                'gli originali. Ma è lasciato dove chi indaga inciampi, non dove serva a '
                'lavorare: è un’esca, posata per far accusare un ministero che non c’entra. Chi '
                'paga vi vuole a caccia della preda sbagliata.»',
}

OGGETTI_TESSERA_11 = {'T3': ['Una Corda di Servizio']}


def luoghi():
    """Luoghi.pdf Episodio 11 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'bell tower.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 11 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_11, 'Episodio 11')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_11.get(n, [])]

    for L in LUOGHI_11:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI11_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI11_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_11)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_11
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL CAPOSQUADRA', 'IL TOPOGRAFO LEALISTA', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 11')
    print('OK episodio 11')
