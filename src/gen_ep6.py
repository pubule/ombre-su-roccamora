# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 6: Il Terzo Movimento (Episodio 6/pdf/).

Fase B (vedi DESIGN-EPISODIO-6.md e CAMPAGNA-EPISODI.md). FINALE D'ATTO:
la notte del rituale nella Camera delle Tre Acque. Spedizione a 8 tessere
con obiettivo a fasi (3 movimenti da spegnere = la Difesa di Ferri cala),
il Dormiente come ambiente a soglie di Canto, il mazzo-antologia che pesca
dalle famiglie di tutto l'atto, deduzione d'atto a incroci.

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 6', 'pdf')
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

LETTERA_6 = (
    "Alla Società del Lume, riservatissima.<br/><br/>"
    "«Le maree incise sulle canne scadono <b>stanotte</b>. Le campane della città tengono il "
    "fiato da ieri — nessuna suona più giusta — e l’acqua dei canali è ferma come prima dei "
    "temporali. Avete cinque casi alle spalle e una notte davanti: il Coro ha lo strumento, "
    "il luogo e l’ora. A voi mancano le ultime tre risposte: <b>DOVE</b>, <b>QUANDO</b>, e "
    "<b>CON COSA</b> fermarli.<br/><br/>"
    "Trovatele prima dell’acqua alta. Avete <b>6 ore</b>, dalle 18:00 alle 24:00 — poi si "
    "scende, con quello che avrete. E qualunque cosa recuperiate là sotto, portatela <b>a "
    "me</b>, non alla Gendarmeria: certe prove, in mani sbagliate, diventano armi.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la sagrestia della Cattedrale, il Canale Basso, il "
    "Catasto delle Acque e il Palazzo del Lume — dove M. ha aperto per voi l’archivio dei "
    "Frammenti. Gli altri andranno sbloccati. L’Archivio Capitolare chiude alle 22:00.</i>")

# Chiavi LETTERALI, doppia via da aperti: «la marea di sizigia» (L2+L3),
# «le tre acque» (L3+L2), «il capitolo del Quarantuno» (L1+L4), «il maestro
# dei registri» (L4+L3), Chiave della Porta d'Acqua (L6). Rivelatorio (D2) su
# L1, L2, L4.
LUOGHI_6 = [
    dict(n=1, nome='LA CATTEDRALE, LA SAGRESTIA', voce_mappa='La Cattedrale',
         req='Disponibile dall’inizio', art='nervous priest in a candlelit sacristy.png',
         chiude=None,
         indizi=[
             'Don Callisto non finge più niente: «il pavimento della cripta RESPIRA, signori. '
             'Lo sento sotto i piedi durante i vespri, come una nave. E stanotte l’acqua '
             'benedetta trema nelle pile senza che nessuno la tocchi.» '
             '<i>(Oggetti: prendete le carte L’Acqua Benedetta e La Reliquia di San '
             'Teodoro.)</i>',
             'Il capitolo della Cattedrale custodiva gli atti del Quarantuno: «il capitolo '
             'del Quarantuno decise la sconsacrazione dei Battuti E qualcos’altro, di cui '
             'non si parla. Gli atti sono all’Archivio Capitolare. Io la chiave ce l’ho, ma '
             'la parola giusta dovete saperla voi.»',
             'Dalla sagrestia, con l’orecchio al pavimento: un battito lento, sotto, '
             'profondissimo — sessanta colpi l’ora, come un cuore che dorme. E stanotte, '
             'dice don Callisto, «batte più forte. Come chi sogna qualcosa che sta per '
             'accadere.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Le mani di don Callisto',
                  testo='Il parroco versa il vino della messa e trema — ma non di paura '
                        'generica: guarda il calice come chi ha visto il vino incresparsi da '
                        'solo. «Da tre notti», ammette alla fine, «alle tre e un quarto '
                        'esatte, tutto ciò che è liquido in questa chiesa fa UN’ONDA. Una '
                        'sola. Poi torna fermo.» Il liutaio prova l’orchestra: e l’acqua '
                        'risponde già.'),
         ]),
    dict(n=2, nome='IL CANALE BASSO', voce_mappa='Il Canale Basso',
         req='Disponibile dall’inizio', art='derelict warehouses over black still water.png',
         sblocca_parola=('LA MAREA DI SIZIGIA', 'LE TRE ACQUE'), chiude=None,
         indizi=[
             'L’acqua del canale è FERMA: né marea né corrente, come tesa. I barcaioli non '
             'escono: «l’acqua così non si è mai vista. Stanotte c’è la marea di sizigia, '
             'la grande — e l’acqua, invece di prepararsi, trattiene.»',
             'Tre notti di chiatte cariche verso il fianco della Cattedrale: casse lunghe, '
             'un carico «da chiesa» — e gli scaricatori pagati in contanti nuovi, mai gli '
             'stessi due volte. L’ultimo viaggio è previsto stanotte: l’attracco è la '
             'vecchia porta d’acqua.',
             'Il barcaiolo più vecchio, indicando il pelo dell’acqua: «le tre acque, '
             'signori. La dolce del monte, la salata di laguna, la morta dei pozzi: sotto '
             'la città si incontrano in un posto solo. Mio nonno diceva: dove si incontrano, '
             'la città sogna. Il Catasto sa dove.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il barcaiolo più vecchio',
                  testo='«Il liutaio l’ho portato IO, tre notti fa, alla porta d’acqua. '
                        'Pagava bene e taceva meglio. Ma quando siamo passati sotto la '
                        'Cattedrale ha appoggiato la mano sul fasciame, come si tasta la '
                        'febbre a un figlio — e ha detto, piano: “ancora un movimento, e ti '
                        'sveglio”. Non parlava con me.»'),
         ]),
    dict(n=3, nome='IL CATASTO DELLE ACQUE', voce_mappa='Il Catasto delle Acque',
         req='Disponibile dall’inizio', art='Catasto delle Acque.png',
         sblocca_parola='LE TRE ACQUE', chiude=None,
         indizi=[
             'L’archivista vi riconosce — l’inverno dei pozzi non si dimentica — e stavolta '
             'la mappa la srotola lui: «le tre acque convergono QUI, sotto la Cattedrale. '
             'La sala non è su nessuna carta ufficiale. Ma le vene ci vanno tutte, come '
             'radici a un bulbo.»',
             'Il registro delle consultazioni: nessuno è più venuto coi guanti — ma il '
             'fascicolo delle tre acque mostra una piega nuova e una scheda di prestito '
             'INTERNO, sigla di Curia: qualcuno l’ha fatto uscire e rientrare senza passare '
             'dal banco — la mano del Maestro dei Registri, che negli archivi entra ed esce '
             'senza lasciare firma.',
             'Sulle tavole idrografiche, la chiusa grande regola l’acqua dolce: «se '
             'stanotte c’è la marea di sizigia», dice l’archivista, «il colmo lo decide la Chiusa '
             'Grande. Il guardiano tiene le tavole di marea aggiornate all’ora.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Il bulbo delle vene',
                  testo='Ricalcando le tre carte idrografiche una sull’altra, la camera '
                        'appare da sola: un vuoto rotondo dove nessuna vena passa ATTRAVERSO '
                        '— tutte si fermano al bordo, come radici che nutrono senza entrare. '
                        'La città non è costruita SOPRA qualcosa. È costruita INTORNO.'),
         ]),
    dict(n=4, nome='IL PALAZZO DEL LUME', voce_mappa='Il Palazzo del Lume',
         req='Disponibile dall’inizio', art='Palazzo del Lume.png',
         sblocca_parola=('IL CAPITOLO DEL QUARANTUNO', 'IL MAESTRO DEI REGISTRI'),
         chiude=None,
         indizi=[
             'M. ha fatto disporre sul tavolo grande l’archivio dei Frammenti: i vostri '
             'cinque casi, le buste dei Bivi, i cimeli. «Stanotte si spende tutto», dice. '
             '«Ogni pezzo che avete conservato è un incrocio in più. Contateli.» '
             '<i>(La deduzione d’atto: vedi la busta della Soluzione.)</i>',
             'Negli appunti della Società sul caso della cripta: lo studio del «maestro dei '
             'registri» in Corte del Ragioniere risulta SVUOTATO ieri — di fretta. Un '
             'facchino ha visto portar via schedari «tranne uno, caduto dal carro».',
             'M., davanti alla mappa: «gli atti del capitolo del Quarantuno non furono mai '
             'copiati: originale unico, Archivio Capitolare. Se esiste una formula che '
             'addormentò QUELLA cosa una volta, è scritta lì. Fatevi aprire: la parola è '
             'l’anno, il resto è coraggio.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='M., a porte chiuse',
                  testo='«Ferri è vivo. L’ho sempre saputo — un uomo così non annega in un '
                        'canale: si CONSERVA, come i suoi strumenti. Stanotte lo troverete '
                        'al centro della sala, e vi sembrerà stanco e gentile. Non '
                        'esitate per questo. Gli uomini stanchi e gentili sono quelli che '
                        'hanno già deciso tutto.»'),
         ]),
    dict(n=5, nome='LA BOTTEGA DI FERRI, RIAPERTA', voce_mappa='Bottega del Liutaio Ferri',
         req='I sigilli della Gendarmeria pendono tagliati: qualcuno è entrato, di recente, '
             'con la calma di chi torna a casa. Il vicinato non parla — tranne che con chi '
             'dimostra di sapere COSA torna, con la marea giusta.',
         chiave=('parola', 'LA MAREA DI SIZIGIA'), art='abandoned luthier workshop.png',
         chiude=None,
         indizi=[
             'La bottega sigillata dal vostro primo caso è stata riaperta da dentro: polvere '
             'smossa a isole, e i vuoti sugli attrezzi raccontano cosa è partito — i ferri '
             'da accordatura grossa, il banco portatile, la campana piccola di prova.',
             'Sul banco, dimenticato o lasciato, il diario di lavorazione di Ferri: '
             'l’ultima pagina è di ieri. «La solista non serve: DODICI gole in accordo la '
             'valgono. Devono valerla.» <i>(Reperto A: consegnate il Diario di '
             'Ferri.)</i>',
             'Nel retro, il calco in gesso di una campana GEMELLA a quella di San Teodoro — '
             'e trucioli di bronzo recente. Il bronzo scampato alla Fonderia, cinque casi '
             'fa, non era sparito: stava maturando.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il banco del liutaio',
                  testo='Gli strumenti rimasti sono in ordine perfetto, TRANNE il diapason '
                        'd’argento del primo caso: il suo astuccio è aperto e vuoto, al '
                        'centro del banco, in evidenza. Non è una dimenticanza: è un '
                        'messaggio. Ferri sa che verrete, e vi dice: “vi ho lasciato '
                        'l’astuccio. Il LA giusto, stanotte, lo do io.”'),
         ]),
    dict(n=6, nome='LA CHIUSA GRANDE', voce_mappa='La Chiusa Grande',
         req='Il guardiano della chiusa non parla coi curiosi la notte di sizigia: troppa '
             'responsabilità. Ma chi arriva nominando le acque col loro nome vero — tutte e '
             'tre — è del mestiere, o del destino.',
         chiave=('parola', 'LE TRE ACQUE'), art='La Chiusa Grande.png', chiude=None,
         indizi=[
             'Le tavole di marea, aggiornate all’ora: il colmo della sizigia è alle TRE E '
             'UN QUARTO. «L’acqua alta delle tre e un quarto», dice il guardiano, «è quella '
             'che non perdona: mezz’ora prima e mezz’ora dopo, le gallerie basse si '
             'allagano.»',
             'Il guardiano, a bassa voce: «la porta d’acqua sotto la Cattedrale era murata '
             'da cent’anni. Da un mese è ARIA: qualcuno l’ha riaperta dal di dentro, e la '
             'marea ci entra e ne esce come da una bocca. La chiave del cancello ce l’ho '
             'io — e a voi la do volentieri, così non tocca a me.» '
             '<i>(Oggetti: prendete le carte La Chiave della Porta d’Acqua e La Lanterna '
             'di Chiusa.)</i>',
             'Sul registro delle portate, da tre notti, un ammanco d’acqua dolce alla '
             'stessa ora: qualcuno, sotto, APRE e CHIUDE. Prove generali. Stanotte è la '
             'prima.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Le tavole di marea',
                  testo='Il colmo di sizigia dura undici minuti: dalle 3:15 alle 3:26. '
                        'Qualunque cosa il rito debba fare con l’acqua, ha UNDICI MINUTI '
                        'per farla. E qualunque cosa dobbiate fare voi, conviene che sia '
                        'fatta prima: l’acqua alta non fa sconti a chi sta nelle gallerie.'),
         ]),
    dict(n=7, nome='L’ARCHIVIO CAPITOLARE', voce_mappa='L’Archivio Capitolare',
         req='Il canonico archivista apre solo a chi è mandato dal capitolo — o a chi ne '
             'nomina l’atto che il capitolo vorrebbe dimenticare. L’anno giusto, detto ad '
             'alta voce, qui dentro è una chiave.',
         chiave=('parola', 'IL CAPITOLO DEL QUARANTUNO'), art='Archivio Capitolare.png',
         chiude=22,
         indizi=[
             'Gli atti del Quarantuno, mai copiati: la sconsacrazione dei Battuti è solo '
             'l’APPENDICE. L’atto principale è un altro: «Del sigillo posto alla camera '
             'delle acque, e della formula con cui vi si impose il sonno». La città lo '
             'fece. La città lo scrisse. La città lo dimenticò apposta.',
             'La Formula del Sigillo è trascritta per esteso, con la rubrica: «si legga a '
             'voce ferma, a strumenti TACIUTI, nell’ora in cui l’acqua è più alta». A '
             'strumenti taciuti: prima si spegne, poi si legge. '
             '<i>(Oggetto: prendete la carta La Formula del Sigillo.)</i>',
             'Allegata agli atti, la pianta della camera: tre sale-vestibolo — il bronzo, '
             'la pietra, le ossa — e al centro la Camera delle Tre Acque. Le sale non sono '
             'stanze: sono VALVOLE. <i>(Reperto B: consegnate la Pianta della '
             'Camera.)</i>'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La rubrica della Formula',
                  testo='La pergamena è del Quarantuno, ma la PIEGA è recente, e c’è una '
                        'seconda piega, diversa, più vecchia di poco: il fascicolo è stato '
                        'consultato DUE volte negli ultimi mesi. Qualcuno ha letto la '
                        'formula prima di voi — e l’ha rimessa a posto con cura da '
                        'archivista. Chiunque sia, sapeva che sareste arrivati qui. E non '
                        'l’ha distrutta.'),
         ]),
    dict(n=8, nome='IL RIFUGIO DEL MAESTRO DEI REGISTRI', voce_mappa='Corte del Ragioniere',
         req='Lo studio è svuotato e la corte tace. Ma il facchino del trasloco beve '
             'all’angolo, e con chi nomina il titolare — col suo titolo giusto — ricorda '
             'volentieri cosa è caduto dal carro.',
         chiave=('parola', 'IL MAESTRO DEI REGISTRI'), art='Studio del Maestro.png',
         chiude=None,
         indizi=[
             'Lo studio è stato svuotato in una notte: restano i chiodi dei quadri e '
             'l’impronta pulita degli schedari sul pavimento. Chi è fuggito così non torna — '
             'e non fugge dai gendarmi: fugge da un LAVORO FINITO.',
             'Dal carro del trasloco è caduto uno schedario: «cripta». Dentro, i conti del '
             'cantiere finale — e una riga che gela: «onorario del direttore: nulla. Il '
             'direttore non lavora per denaro.» <i>(Reperto C: consegnate lo Schedario '
             'della Cripta.)</i>',
             'L’ultima pagina dei conti: «coristi: dodici, saldati anticipati, vestiario '
             'compreso. Rimborso barca: porta d’acqua. Ora di chiamata: le due e mezza.» '
             'Il coro entra alle due e mezza. Il colmo è alle tre e un quarto. La finestra '
             'è quella.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='L’impronta degli schedari',
                  testo='Quattro impronte sul pavimento: quattro schedari. «Fonderia», '
                        '«pozzi», «teatro» li avete visti. Il quarto era «cripta». Ma '
                        'l’impronta più vecchia, sotto la polvere di anni, è una QUINTA — '
                        'più stretta, portata via molto prima. Il Maestro dei Registri '
                        'teneva un quinto conto, di cui nessuno sa niente. E lo custodiva '
                        'meglio degli altri.'),
         ]),
    dict(n=9, nome='L’IMBOCCO DELLE TRE ACQUE', voce_mappa='La Porta d’Acqua',
         req='Il cancello della porta d’acqua è chiuso a chiave dal guardiano della Chiusa: '
             'senza la sua chiave si può solo guardare, dall’altra riva, il buio che respira '
             'a filo d’acqua.',
         chiave=('oggetto', 'LA CHIAVE DELLA PORTA D’ACQUA'), art='La Porta d’Acqua.png',
         chiude=None,
         indizi=[
             'La porta d’acqua medievale: un arco a pelo d’acqua nel fianco della '
             'Cattedrale, rimurato da un secolo e riaperto da un mese. La malta nuova è '
             'stata tolta CON CURA, conci numerati a gesso: lavoro da restauratori, non da '
             'ladri.',
             'Legata all’anello d’ormeggio, una barca piatta da carico, vuota: è quella '
             'delle chiatte notturne. Sul fondo, cera nera colata e trucioli di bronzo — '
             'l’inventario di cinque casi in un palmo di sentina.',
             'Dal buio oltre l’arco, a orecchio fermo: il battito lento di sempre — e '
             'sopra, adesso, un ACCORDARSI. Corde, canne, bronzo. Sotto la vostra città, '
             'qualcuno sta dando il la.'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='I conci numerati',
                  testo='La numerazione a gesso dei conci non è di mano di muratore: è la '
                        'calligrafia minuta e ordinata di chi tiene registri. Il Maestro '
                        'dei Registri non ha solo pagato la riapertura: l’ha DIRETTA, '
                        'concio per concio, come si smonta uno strumento prezioso. Il Coro '
                        'intende richiuderla, dopo. Tutto, in questo cantiere, è pensato '
                        'per durare.'),
         ]),
]

# 8 tessere (finale d'atto). Geometria: T1-T2-T3-T4; da T4: E->T5 (ramo
# pietra), N->T6; T6-T7-T8 in linea.
TILES_6 = [
    dict(id='T1', nome='LA PORTA D’ACQUA', exits={'N': 'T2'}, start='S',
         testo='La barca passa sotto l’arco medievale e il buio vi prende in consegna: '
               'l’acqua è a un palmo dalle volte, ferma, tesa. QUANDO RIVELATE QUESTA '
               'TESSERA: applicate l’esito della Domanda 1 (vedi la busta della Soluzione). '
               'Qui dovete tornare per vincere — prima che l’acqua alta chiuda l’arco.',
         cerca_vuoto='Solo l’anello d’ormeggio e la sentina dell’altra barca: cera nera e '
                     'trucioli di bronzo. L’inventario dei vostri cinque casi.',
         arredi=[(0, 3, 'molo'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA GALLERIA DI MAREA', exits={'S': 'T1', 'N': 'T3'},
         testo='La galleria corre bassa lungo la vena salmastra: i muri portano i segni '
               'dell’acqua alta — e stanotte l’acqua SALE. Dal 6° round di partita, chi si '
               'trova in questa tessera prova NERVI (Media) a inizio round: se fallisce, '
               'l’acqua alla cintola — 1 sola azione. LA LANTERNA DI CHIUSA dà +1, come da '
               'carta.',
         cerca_vuoto='Alghe, cirripedi e una tacca di piena del 1874 più alta della vostra '
                     'testa. Meglio non pensarci.',
         arredi=[(0, 1, 'molo'), (3, 2, 'molo')]),
    dict(id='T3', nome='LA SALA DELLA PRIMA ACQUA — IL BRONZO', exits={'S': 'T2', 'N': 'T4'},
         testo='La vena dolce entra cantando sotto una campana APPESA: la gemella di San '
               'Teodoro, rifusa di nascosto, il battaglio già in tiro. QUANDO RIVELATE '
               'QUESTA TESSERA: 2 Adepti a guardia del bronzo.',
         arbitro='SPEGNERE IL BRONZO (1° movimento): un’azione Interagire adiacente alla '
                 'campana + prova VIGORE (Media) — si scapola il battaglio. Riuscita: il '
                 'movimento è spento (Ferri -1 Difesa, vedi Soluzione). Fallita: l’azione è '
                 'spesa, si può ritentare. Lo Scalpello/attrezzi: +1 se pertinenti.',
         cerca='Fra le casse del cantiere, una mazzetta di piombo da campanaro: +1 alle '
               'prove per spegnere i movimenti.',
         arredi=[(1, 2, 'crogiolo'), (2, 2, 'forma')]),
    dict(id='T4', nome='LO SNODO DELLE VENE', exits={'S': 'T3', 'E': 'T5', 'N': 'T6'},
         testo='Le tre gallerie si incontrano in una rotonda di pietra viva: le vene '
               'corrono in canali scoperti, e al centro i tre flussi si sfiorano senza '
               'mescolarsi — dolce, salmastra, morta. Da qui si vede tutto. E tutto, da '
               'qui, vi sente.',
         cerca_vuoto='I canali scoperti e tre colori d’acqua. Chi guarda troppo a lungo '
                     'giura di vederle scorrere in TRE direzioni sbagliate.',
         arredi=[(1, 1, 'forma'), (2, 2, 'crogiolo')]),
    dict(id='T5', nome='LA SALA DELLA SECONDA ACQUA — LA PIETRA', exits={'O': 'T4'},
         testo='La vena morta dei pozzi risale in una gola di pietra accordata: i cinque '
               'righi incisi che conoscete dall’inverno del Borgo, e un cuneo maestro '
               'piantato nella fenditura. QUANDO RIVELATE QUESTA TESSERA: 1 Voce Cava ogni '
               '4 eroi (arrotondate per eccesso).',
         arbitro='SPEGNERE LA PIETRA (2° movimento): un’azione Interagire al cuneo + prova '
                 'ACUME (Media) — si disaccorda il cuneo maestro. Riuscita: movimento '
                 'spento (Ferri -1 Difesa). Fallita: si ritenta. La mazzetta di T3: +1.',
         cerca_vuoto='La gola risponde ai vostri passi con mezzi toni sbagliati. Non c’è '
                     'niente da prendere: c’è solo da non restare.',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'casse')]),
    dict(id='T6', nome='LA SALA DELLA TERZA ACQUA — LE OSSA', exits={'S': 'T4', 'N': 'T7'},
         testo='L’organo superstite, ricostruito in fretta: metà canne d’ossa, metà tubi '
               'di stagno — un ibrido febbrile che respira già. La vena salmastra gli fa '
               'da mantice. QUANDO RIVELATE QUESTA TESSERA: 1 Confratello ogni 4 eroi '
               '(arrotondate per eccesso).',
         arbitro='SPEGNERE LE OSSA (3° movimento): un’azione Interagire al somiere + prova '
                 'NERVI (Media) — si strappa il somiere con le mani dentro lo strumento '
                 'che suona. Riuscita: movimento spento (Ferri -1 Difesa). Fallita: si '
                 'ritenta. La mazzetta di T3: +1.',
         cerca_vuoto='Trucioli d’osso e stagno. Le canne montate hanno ancora i nomi '
                     'incisi: non leggeteli ad alta voce.',
         arredi=[(2, 2, 'altare')]),
    dict(id='T7', nome='L’ANTICAMERA DEL CORO', exits={'S': 'T6', 'N': 'T8'},
         testo='Dodici scranni, dodici mantelli appesi, dodici paia di scarpe buone '
               'allineate: il coro si è vestito qui. Sul tavolo, gli spartiti-rete del '
               'teatro, aperti alla stessa pagina. QUANDO RIVELATE QUESTA TESSERA: 1 '
               'Adepto e 1 Sgherro — le ultime guardie.',
         cerca='In un mantello dimenticato, il contratto di un corista: «una notte, paga '
               'tripla, silenzio eterno». Firmato con una X. Sono impiegati, non credenti '
               '— ricordatevelo quando li vedrete rompersi.',
         arredi=[(1, 1, 'scrivania'), (2, 2, 'casse')]),
    dict(id='T8', nome='LA CAMERA DELLE TRE ACQUE', exits={'S': 'T7'},
         testo='La sala che non esiste sulle mappe: rotonda, perfetta, con le tre vene che '
               'entrano da tre bocche e si torcono al centro SENZA mescolarsi. Intorno, il '
               'coro dei dodici canta dagli spartiti. Al centro, con la bacchetta di '
               'liutaio e il vostro diapason d’argento al collo, Bastiano Ferri. Alza gli '
               'occhi. Sorride, stanco e gentile. QUANDO RIVELATE QUESTA TESSERA: appare '
               'BASTIANO FERRI col Coro dei Dodici (vedi il retro e il Bestiario).',
         arbitro='FERRI: Difesa 9, MENO 1 per ogni movimento spento (8/7/6). Il CORO DEI '
                 'DODICI: piazzate 6 Coristi (le miniature); finché almeno 3 Coristi sono '
                 'in gioco, il Canto sale di 1 extra ogni 2 round; un Corista portato a 0 '
                 'ferite FUGGE invece di morire (sceglie chi arbitra: sono impiegati). LA '
                 'FORMULA DEL SIGILLO: a TUTTI e tre i movimenti spenti, un’azione — '
                 'leggerla a voce ferma: il rito muore, il Dormiente si riassopisce '
                 '(vittoria piena; Ferri crolla: Bivio). IL DORMIENTE (ambiente): al 4° '
                 'segnalino Canto tutte le prove -1; al 6°: ogni round l’eroe con meno '
                 'NERVI subisce 1 danno; al 9°: il rituale si compie — fuga forzata '
                 '(epilogo peggiore, non sconfitta).',
         cerca_vuoto='Qui non si cerca. Qui si finisce quello per cui siete venuti.',
         arredi=[(2, 2, 'altare')]),
]

# Nemici nuovi (statistiche - fonte per Bestiario e simulatore).
NEMICI_6 = [
    dict(nome='BASTIANO FERRI', att=3, dif=9, fer=5, mov=3, dan=2, boss=True,
         tipo='Il Liutaio (Boss, finale d’atto)', art='Bastiano Ferri.png',
         note='La sua Difesa cala di 1 per ogni movimento spento (9→8→7→6). Ai tavoli da '
              '2-3 eroi non recupera mai ferite dai Crescendo (regola delle taglie).',
         bio_bestiario='Il liutaio del primo caso: l’uomo che accordava organi in '
              'Cattedrale e corde d’argento per commesse private. Cinque casi dopo, è '
              'febbrile e lucido, quasi gentile — un artigiano alla consegna. Non crede '
              'al Dormiente come ci crede il Coro: lo AMA come si ama uno strumento '
              'supremo, l’unico degno delle sue mani. Combatte come dirige: preciso, '
              'paziente, mai crudele. La sua vera difesa è il rituale stesso — ogni '
              'movimento che gli spegnete gli toglie terra sotto i piedi (Difesa -1 per '
              'movimento spento). Quando l’ultimo si spegne, ciò che resta è solo un '
              'uomo stanco con un diapason al collo.'),
    dict(nome='IL CORISTA', att=1, dif=6, fer=1, mov=2, dan=1,
         tipo='Impiegato del rito (sciame, solo T8)', art='Il Corista.png',
         note='Solo nella Camera (T8). Finché almeno 3 Coristi sono in gioco, il Canto '
              'sale di 1 extra ogni 2 round. Portato a 0 ferite FUGGE invece di morire.',
         bio_bestiario='Dodici gole in accordo valgono una solista, dice il diario di '
              'Ferri. Devono valerla. Sono cantori di chiesa e di osteria, assoldati a '
              'paga tripla con vestiario compreso: leggono dagli spartiti-rete e cantano '
              'una cosa che non capiscono, con la faccia di chi comincia a capirla. Non '
              'sono credenti: sono impiegati — e gli impiegati, quando il lavoro si mette '
              'male, SCAPPANO. Ogni corista che fugge è una gola in meno al rito. E un '
              'testimone in più per la città di domani.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 6 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 6')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il terzo movimento')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_6.replace(
        'Alla Società del Lume, riservatissima.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservatissima.' % F['sc'])
    frame_flow(c, mx, H - 190*mm, W - 2*mx, 130*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 205*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 22*mm, 'PRIMA DI TUTTO: aprite la busta del Bivio dell’Episodio 5 e applicate il vostro ramo.')
    c.drawCentredString(W/2, 15*mm, 'Poi chi tiene il fascicolo Luoghi ordina le 9 carte per numero: aperte scoperte, le altre coperte. Portate al tavolo i Frammenti 1-5.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 6')
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
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 39.5*mm, '! l’Archivio Capitolare (7) chiude alle 22:00')
    c.drawString(16*mm + 6*17*mm + 4*mm, H - 44.5*mm, '! il rito comincia alle 3:15: si scende con ciò che avrete')

    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm

    yy = sect(H - 56*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi, frammenti e incroci spesi', 5)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 4 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    doms = ['1. DOVE si compie il rituale? (la deduzione d’atto: contate Frammenti e cimeli)',
            '2. CHI dirige il rito?',
            '3. QUANDO comincia?',
            '4. COSA portate contro il Dormiente?',
            '5. (bonus) IN CHE ORDINE si spengono le valvole? — solo col Diario di Ferri E la Pianta della Camera']
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
    c.setTitle('Ombre su Roccamora - Episodio 6 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 6 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'le tre acque, sotto la cattedrale — la notte del rito')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 134*mm, W - 56*mm, 82*mm, [
        Paragraph('FINALE D’ATTO: <b>8 tessere</b> invece di 6, e nessuno vi promette che '
                  'torniate tutti. Le 21 carte Minaccia (più «Le ossa chiamano» SOLO se il '
                  'vostro Bivio lo dice) e le schede Nemici sono in <b>Episodio 6/cards/</b>; '
                  'le 8 tessere in <b>Episodio 6/board/</b>. L’obiettivo è a fasi: spegnete '
                  'i TRE movimenti (bronzo T3, pietra T5, ossa T6 — un’azione più una prova '
                  'ciascuno), poi leggete la Formula nella Camera (T8). Ogni movimento '
                  'spento toglie 1 Difesa a Ferri. Le pagine seguenti sono le note per '
                  'tessera, una per foglio: fronte ad alta voce alla rivelazione, retro solo '
                  'per chi arbitra.', BODY),
        Paragraph('<b>L’orologio di questa spedizione:</b> il Canto sale da solo ogni '
                  '<b>6° round</b> (6°, 12°...) e non ogni 4° — è la notte più lunga della '
                  'campagna, e il Coro dei Dodici aggiunge già segnalini per conto suo. Le '
                  'carte crescendo valgono come sempre.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 110*mm, W - 60*mm, 62*mm, [
        Paragraph('Lo tiene <b>una persona sola</b> — di solito chi pesca il mazzo Minaccia e '
                  'tiene il Registro delle Ferite. Quando il gruppo rivela una tessera, legge ad '
                  'alta voce la voce corrispondente. Quando un eroe <b>Cerca</b> o prova ad '
                  '<b>aprire</b> qualcosa, gira il foglio e legge l’esito di quella sola '
                  'tessera, con lo stesso tono in ogni caso. Gli altri giocatori non leggono '
                  'il retro. E stanotte, più che mai: niente anticipazioni.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_6:
        art_file = TILE_ART_6[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'derelict warehouses over black still water.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_6[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_6.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 78*mm, W - 40*mm, 50*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 6</b>. In campo: il '
                  'mazzo-antologia richiama le famiglie di tutto l’atto — <b>Adepti</b>, '
                  '<b>Voci Cave</b> (urlano quando abbattute), <b>Confratelli</b> (+1 Difesa '
                  'se adiacenti tra loro non vale qui: il Salmodiante non c’è), '
                  '<b>Sgherri</b> e <b>Sicario</b>. In T8: <b>Bastiano Ferri</b> (Difesa 9, '
                  '-1 per ogni movimento spento) e <b>il Coro dei Dodici</b> (6 miniature '
                  'Corista: finché 3+ sono in gioco, +1 Canto ogni 2 round; a 0 ferite '
                  'FUGGONO). Il Dormiente non si combatte: si legge la Formula a movimenti '
                  'spenti. Vittoria piena: 3 movimenti + Formula + ritorno a T1. Vittoria '
                  'parziale: 2+ movimenti spenti e ritirata. Ai tavoli da 2-3 eroi Ferri '
                  '<b>non recupera mai ferite</b> dai Crescendo.', BODY)])
    c.showPage()
    token_sheet(c, token_groups_6())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_6():
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('SGHERRI (x2) · SICARI (x1) · ADEPTI (x4)', [('Lo Sgherro.png', 2), ('Il Sicario.png', 1),
                                                      ('Adepto Incappucciato.png', 4)]),
        ('VOCI CAVE (x2) · CONFRATELLI (x2)', [('La Voce Cava.png', 2), ('Il Confratello.png', 2)]),
        ('CORISTI (x6)', [('Il Corista.png', 6)]),
        ('FERRI', [('Bastiano Ferri.png', 1)]),
        ('CANTO', [('Il primo movimento.png', 1), ('Il secondo movimento.png', 1),
                   ('Il terzo movimento.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 6 - Soluzione (non aprire)')

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
        'solo dopo aver risposto per iscritto alle 4 Domande. La carta «Le ossa chiamano» va '
        'in una seconda busta, chiusa, con scritto «Bivio».',
        '<b>APERTURA — il Bivio dell’Episodio 5</b> (applicare PRIMA della lettera): se avete '
        '<b>RICONSACRATO LE OSSA</b> — il requiem pesa: la spedizione parte col Canto a 0 e '
        'la Litania di Marani vale doppio in questo episodio; ma la mappa incisa è sepolta '
        'con loro: 1 incrocio in MENO alla deduzione d’atto. Se le avete <b>TENUTE</b> — 1 '
        'incrocio in PIÙ alla deduzione; ma le ossa chiamano: mescolate la carta crescendo '
        '«Le ossa chiamano» nel mazzo (22 carte).',
        '<b>LA DEDUZIONE D’ATTO (Domanda 1):</b> contate gli incroci — 1 per ogni Frammento '
        'da 1 a 5 posseduto; 1 per ogni cimelio di Bivio conservato (Frammento 1-bis, la '
        'melodia impressa 4-bis, le ossa tenute, le canne-voce sigillate, il verbale del '
        'sigillo...). Con <b>5 o più incroci</b>: la Domanda 1 è esatta garantita e si '
        'scende SAPENDO (T1 tranquilla, nessuna pesca al 1° round). Con 3-4: rispondete '
        'normalmente. Con 0-2: si scende per tentativi — 1 segnalino Canto in più.',
    ])
    pagina('la verità', [
        'Il rituale si compie nella <b>Camera delle Tre Acque</b>: la sala rotonda che non '
        'esiste sulle mappe, sotto la Cattedrale, dove la vena dolce, la salmastra e la '
        'morta si incontrano senza mescolarsi. È la gola del Dormiente — che non dorme '
        'SOTTO la città: È la città (Frammento 5). <b>Bastiano Ferri</b> dirige in persona: '
        'la campana gemella (il bronzo dell’Ep. 2), la gola di pietra (l’eco dei pozzi, '
        'Ep. 3), l’organo ibrido (le canne superstiti, Ep. 5) — e al posto della solista '
        'mai catturata (Ep. 4), un coro di <b>dodici impiegati</b> che canta dagli '
        'spartiti-rete. Il rito è MONCO, e Ferri lo sa: per questo si può fermare.',
        'L’arma è la <b>Formula del Sigillo</b> (Archivio Capitolare): la formula con cui '
        'il capitolo del Quarantuno impose il sonno — «a voce ferma, a strumenti TACIUTI, '
        'nell’ora in cui l’acqua è più alta». Prima si spengono i tre movimenti, poi si '
        'legge. Il colmo di sizigia è alle 3:15 e dura undici minuti.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE si compie il rituale?</b> Nella Camera delle Tre Acque, sotto la '
        'Cattedrale. <i>Esatta (o garantita dalla deduzione a 5+ incroci):</i> nel 1° round '
        'non si pesca nessuna carta Minaccia. <i>Sbagliata (o 0-2 incroci):</i> si scende '
        'per tentativi — 1 segnalino Canto in più.',
        '<b>2. CHI dirige il rito?</b> Bastiano Ferri, il liutaio. <i>Esatta:</i> lo '
        'chiamate per nome sulla soglia della Camera — e per un istante il direttore è di '
        'nuovo un artigiano: Ferri salta la sua PRIMA attivazione. <i>Sbagliata:</i> nessun '
        'effetto.',
        '<b>3. QUANDO comincia?</b> Alle 3:15, al colmo della sizigia (tavole della Chiusa '
        '+ date sulle canne + il diario di Ruggero: i tre rintocchi). <i>Esatta:</i> '
        'entrate nella finestra giusta — il Canto parte da 0. <i>Sbagliata:</i> arrivate a '
        'rito avviato — 1 segnalino Canto in più.',
        '<b>4. COSA portate contro il Dormiente?</b> LA FORMULA DEL SIGILLO (l’Archivio '
        'Capitolare). Senza, non c’è vittoria piena: si può solo sfregiare e ritirarsi. '
        '<i>Nota per chi arbitra:</i> l’Acqua Benedetta e la Reliquia sono esche — '
        'conforto, non armi. La Lanterna di Chiusa è onesta (+1 in T2); la Mazzetta di T3 '
        'dà +1 alle prove per spegnere i movimenti.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano l’Osservazione «Le mani di '
        'don Callisto» (L1), la Testimonianza «Il barcaiolo più vecchio» (L2) e la '
        'Testimonianza «M., a porte chiuse» (L4). Dopo cinque casi, giudicate con la '
        'massima elasticità: il tavolo che dice «Ferri» ha già vinto questa domanda.',
        '<b>5ª DOMANDA — IN CHE ORDINE si spengono le valvole? (deduzione bonus da '
        'reperto).</b> Si sblocca SOLO se avete in mano DUE reperti: il Diario di Ferri '
        '(Reperto A, la Bottega L5) e la Pianta della Camera (Reperto B, l’Archivio '
        'Capitolare L7). Insieme rivelano che le tre sale-movimento sono VALVOLE, e '
        'l’ordine con cui il capitolo del ’41 le chiuse: <b>bronzo, poi pietra, poi '
        'ossa</b>. Chi ha entrambi i reperti affronta la Camera SAPENDO — e il Dormiente '
        'gli concede più margine: tutte le sue soglie ambiente salgono di 1 '
        '(<b>4/6/9→5/7/10</b>, cioè prove -1 al 5° segnalino, battito al 7°, rituale '
        'compiuto al 10° invece che a 4/6/9). Un solo reperto non basta: servono '
        'entrambi.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ '
        'ore avanzate (lo slancio è di chi SA dove andare); Preparati con 1+ ore avanzate '
        'O 6+ luoghi visitati. Dossier completo: 1 gettone '
        'Intuizione, come sempre.',
    ])
    pagina('spedizione — montaggio, fasi e boss', [
        '<b>Montaggio</b> (8 tessere in Episodio 6/board/, coperte tranne T1):<br/>'
        'T1 Porta d’Acqua → T2 Galleria di Marea → T3 Sala del Bronzo → T4 Snodo delle '
        'Vene → a Est T5 Sala della Pietra (ramo) → a Nord T6 Sala delle Ossa → T7 '
        'Anticamera del Coro → T8 Camera delle Tre Acque.',
        '<b>L’obiettivo a fasi:</b> spegnere BRONZO (T3, Interagire + VIGORE Media), '
        'PIETRA (T5, Interagire + ACUME Media), OSSA (T6, Interagire + NERVI Media). Ogni '
        'movimento spento: Ferri -1 Difesa (9→8→7→6). La Mazzetta da campanaro (Cercare '
        'in T3): +1 a queste prove. A tutti e tre spenti, nella Camera: un’azione per '
        'leggere LA FORMULA — vittoria piena.',
        '<b>Il Canto, qui, batte ogni 6° round</b> (6°, 12°...) e non ogni 4°: è la notte '
        'più lunga della campagna, e il Coro dei Dodici aggiunge già segnalini per conto suo.',
        '<b>La marea (T2):</b> dal 6° round di partita, chi si trova in T2 prova NERVI '
        '(Media) a inizio round o ha 1 sola azione (l’acqua alla cintola).',
        '<b>Il Dormiente (ambiente, solo T8 rivelata):</b> al 4° segnalino Canto tutte le '
        'prove hanno -1; al 6°: ogni round l’eroe con meno NERVI subisce 1 danno (il '
        'battito); al 9°: il rituale si compie — fuga forzata: epilogo peggiore, NON '
        'sconfitta a tavolino.',
        '<b>Ferri e il Coro:</b> Ferri si desta in T8 (o al 3° segnalino: piazzatelo '
        'sulla tessera più lontana, con 1 Adepto di scorta — e da quel momento ogni Fase '
        'Minaccia pesca 1 carta in più). Il Coro dei Dodici: 6 miniature Corista in T8; '
        'finché 3+ in gioco, +1 Canto ogni 2 round; a 0 ferite fuggono. '
        '<b>Vittoria parziale:</b> 2+ movimenti spenti e ritirata a T1 — il rito fallisce, '
        'il Dormiente resta semi-desto (epilogo peggiore, non sconfitta).',
    ])
    pagina('epilogo, frammento e bivio (chiusura d’atto)', [
        '<b>EPILOGO (vittoria piena) — da leggere a voce alta.</b> «L’alba trova l’acqua '
        'dei canali che TORNA A MUOVERSI. Le campane della città suonano l’Angelus — '
        'tutte, e tutte intonate, per la prima volta da mesi. Ferri, o ciò che ne resta, '
        'esce di scena per sempre. E sulla riva opposta del canale, un uomo coi guanti '
        'chiude un taccuino, si alza senza fretta, e se ne va. La lettera di M. arriva '
        'prima di pranzo: “Portatemi tutto. Ottimo lavoro. — M.”»',
        '<b>FRAMMENTO DI CAMPAGNA N. 6:</b> <i>«Ferri contava i movimenti su quattro '
        'dita. Poi chiudeva il pugno.»</i> Conservatelo per il finale di campagna.',
        '<b>IL BIVIO — decidete insieme, poi sigillate (conseguenze a LUNGO raggio).</b><br/>'
        '<b>Ferri catturato vivo.</b> Un giorno ci sarà un processo, e sarà il processo '
        'all’uomo GIUSTO (vantaggio investigativo quando accadrà). Ma il culto sa '
        'esattamente cosa avete capito: i mazzi dei prossimi due episodi aggiungono 1 '
        'carta Malavita (sorveglianza).<br/>'
        '<b>Ferri lasciato agli abissi.</b> Il culto è decapitato più a lungo: i mazzi '
        'dei prossimi due episodi perdono 1 carta crescendo. Ma quando il processo verrà, '
        'l’imputato lo sceglierà qualcun altro.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 6. FINE DELL’ATTO PRIMO: la '
        'campagna è interrompibile qui con un finale vero. Se continuate: il tarlo resta — '
        'quattro cantieri, un committente, nessuna fretta.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite, più — solo stavolta — '
        'una SECONDA miglioria a testa (premio di fine atto).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI6_DESC = {
    1: "La sagrestia della Cattedrale è la stessa del primo caso — l'armadio dei "
       "paramenti, l'odore di cera e chiuso — ma don Callisto è un altro uomo: "
       "dimagrito, diretto, quasi sollevato che siate tornati. Ha smesso di "
       "fingere che le cose non accadano. Sul pavimento, vicino alla grata della "
       "cripta, ha steso un tappeto: «per non sentirlo», dice. Non funziona.",
    2: "Il Canale Basso è irriconoscibile per chi lo ricorda vivo: l'acqua ferma "
       "come vetro scuro, le chiatte legate in doppia fila, i barcaioli seduti "
       "sui moli a guardare l'acqua come si guarda un malato. Nessuno impreca, "
       "nessuno canta. La banchina di Dellacqua, cinque casi fa, era l'inizio. "
       "Stanotte, dicono le schiene curve, è la fine di qualcosa.",
    3: "La sala delle acque morte è la stessa dell'inverno dei pozzi: le mappe, "
       "il lume verde, l'archivista. Ma stavolta il tavolo grande è già pronto "
       "quando arrivate — tre carte idrografiche sovrapposte, i pesi d'ottone ai "
       "quattro angoli — e l'archivista ha l'aria di chi ha passato la notte a "
       "guardare un buco rotondo al centro del ricalco, sperando di essersi "
       "sbagliato.",
    4: "Il Palazzo del Lume a mezzanotte è acceso come per una festa che nessuno "
       "festeggia: tutte le lampade, tutte le stanze. M. ha fatto portare "
       "nel salone l'archivio dei vostri casi — i Frammenti nelle loro buste, i "
       "cimeli etichettati — e cammina lungo il tavolo come un generale davanti "
       "alla mappa. Per la prima volta da quando lo conoscete, non sorride.",
    5: "La bottega di via degli Archetti è un reliquiario profanato: i sigilli "
       "della Gendarmeria tagliati con cura, la polvere di due anni smossa a "
       "isole precise. Chi è entrato sapeva dove mettere le mani — e ha lasciato "
       "il resto intatto, con un rispetto che fa più paura del saccheggio. "
       "L'odore di colofonia, sotto la polvere, non se n'è mai andato.",
    6: "La Chiusa Grande di notte è una diga di lanterne: il guardiano regola le "
       "paratie della sizigia con la faccia di chi pilota una nave nella "
       "tempesta, gridando numeri a due aiutanti mezzi addormentati. L'acqua, a "
       "monte, preme. A valle, verso la città, il canale è liscio e nero come "
       "una lastra. «Non è mai stata così», continua a ripetere. «Mai.»",
    7: "L'Archivio Capitolare è una torre di carta sopra il chiostro: scale a "
       "chiocciola, armadi a muro con le date dipinte, il canonico archivista "
       "che sale i gradini a memoria, senza lume. Gli atti del Quarantuno stanno "
       "nell'armadio più in alto — non per caso, ammette il canonico: «le cose "
       "che non si vogliono rileggere si mettono dove costa fatica arrivare».",
    8: "La Corte del Ragioniere è la stessa dell'episodio della cripta, ma lo "
       "studio è un guscio: chiodi nei muri, impronte di mobili, la polvere che "
       "disegna il negativo di una vita di copertura. Solo le sedie d'attesa "
       "sono rimaste, consumate e assurde, in fila davanti a un banco che non "
       "c'è più. Chi aspettava qui non aspetterà più niente.",
    9: "La porta d'acqua è un arco basso nel fianco della Cattedrale, a pelo di "
       "canale: cent'anni di mattoni tolti con la cura di un restauro, la grata "
       "nuova del guardiano, e oltre — il buio che respira. L'acqua entra ed "
       "esce piano, come da una bocca. Attraccata all'anello, la barca piatta "
       "delle chiatte notturne aspetta il suo ultimo viaggio.",
}

OGGETTI_LUOGO_6 = {
    1: ['L’Acqua Benedetta', 'La Reliquia di San Teodoro'],
    6: ['La Chiave della Porta d’Acqua', 'La Lanterna di Chiusa'],
    7: ['La Formula del Sigillo'],
}

TILE_ART_6 = {t['id']: t['id'] + '-ep6.png' for t in TILES_6}
LUOGHI6_CROP = {}

TESSERE_DESC_6 = {
    'T1': "L'arco medievale inghiotte la barca e la restituisce a un mondo senza "
          "cielo: volte basse, l'acqua a un palmo dalla pietra, l'eco dei remi "
          "che torna doppio. Dietro, la città dorme. Davanti, il buio è ABITATO "
          "— e organizzato: anelli d'ormeggio nuovi, una lanterna schermata "
          "fissata alla volta, il canale dragato di fresco. Qualcuno ha "
          "trasformato la gola della città in un ingresso di servizio.",
    'T2': "La galleria di marea è un budello che l'acqua usa da secoli: i muri "
          "lucidi fino all'altezza del petto, le tacche di piena incise dai "
          "guardiani morti, i cirripedi che crocchiano sotto gli stivali. "
          "Stanotte l'acqua sale con la sizigia, un dito alla volta, paziente "
          "come tutto ciò che sta sotto questa città. La galleria non è "
          "pericolosa. È PUNTUALE.",
    'T3': "La sala della prima acqua è un battistero del rovescio: la vena dolce "
          "entra da una bocca di pietra e canta — canta DAVVERO, un filo di "
          "nota che l'orecchio aggancia e non molla più. Sopra il flusso, "
          "appesa a un'incastellatura nuova, la campana gemella: bronzo chiaro, "
          "mai suonata, il battaglio in tiro come un cane al guinzaglio. "
          "Aspetta un solo colpo. Quello giusto.",
    'T4': "Lo snodo delle vene è il centro della rosa: una rotonda di pietra "
          "viva dove i tre canali si incontrano scoperti — l'acqua dolce "
          "chiara, la salmastra verde, la morta nera — e si sfiorano senza "
          "mescolarsi, ognuna nel suo solco, come tre dita della stessa mano. "
          "Il pavimento trema appena, sempre. Qui sotto non c'è roccia. Qui "
          "sotto c'è QUALCOSA.",
    'T5': "La sala della seconda acqua è la gemella grande della gola dei pozzi: "
          "i cinque righi incisi salgono a perdita di lume, e la vena morta "
          "risale in silenzio — l'unica acqua al mondo che non fa rumore "
          "salendo. Nel punto esatto dove i righi convergono, un cuneo di "
          "bronzo è piantato nella fenditura maestra: piccolo, preciso, "
          "PRESUNTUOSO. Tutta la sala si regge su quel dito.",
    'T6': "La sala della terza acqua puzza di colla d'ossa e stagno: l'organo "
          "superstite è un ibrido montato in fretta — metà canne bianche che "
          "conoscete, metà tubi da lattoniere — e RESPIRA, i mantici gonfiati "
          "dalla vena salmastra, un sospiro ogni sette secondi. È brutto, "
          "raffazzonato, febbrile. Ed è quasi pronto: sul somiere, i registri "
          "sono già tirati.",
    'T7': "L'anticamera del coro è una cappella spogliata arredata da un "
          "impresario: dodici scranni, dodici attaccapanni, una specchiera da "
          "camerino con la cipria e le pasticche per la gola. Gli spartiti-rete "
          "sono aperti sulla stessa pagina, con le stesse quattro battute "
          "cerchiate in rosso. Il vestiario dei coristi sa di naftalina e di "
          "paga tripla. Nessuno di loro sa dove si trova davvero.",
    'T8': "La Camera delle Tre Acque è perfetta come nessuna mano umana: una "
          "sfera di pietra tagliata a metà, le tre bocche equidistanti, e al "
          "centro le tre acque che si torcono in una colonna liquida che non "
          "cade e non schizza — si TIENE, come tenuta da un fiato. Il coro "
          "canta intorno, dodici voci in un accordo che non finisce. E in "
          "mezzo, piccolo e dritto, il liutaio dirige con gli occhi chiusi: "
          "l'uomo che ha passato cinque casi a costruire quest'unico minuto.",
}

ESAMI_CARBONE_6 = {
    'FORMULA DEL SIGILLO': '«La pergamena è del Quarantuno, ma le pieghe sono DUE, ed '
                'entrambe recenti: due consultazioni negli ultimi mesi, richiuse con cura '
                'd’archivista. Qualcuno ha letto la formula prima di voi — e l’ha lasciata '
                'trovare. Chiunque sia, o non teme che la usiate, o CONTA che la usiate.»',
    'DIARIO DI FERRI': '«La grafia peggiora pagina dopo pagina — non è fretta: è febbre. '
                'E le ultime righe sono scritte con l’inchiostro annacquato di chi non '
                'esce più a comprarne: Ferri vive là sotto da settimane. Chi scrive così '
                'non dirige un rituale: ci si sta consumando dentro.»',
    'SCHEDARIO DELLA CRIPTA': '«Quattro cantieri in cinque anni, tutti in pareggio '
                'perfetto: il committente non cerca profitto — compra un risultato, e non '
                'ha fretta. Ma guardate la quinta impronta sul pavimento dello studio: il '
                'conto che manca è più vecchio di tutti. Qualunque cosa sia, viene PRIMA '
                'della fonderia. Prima, forse, di Ferri.»',
}

OGGETTI_TESSERA_6 = {'T3': ['La Mazzetta da Campanaro'],
                     'T7': ['Il Contratto del Corista (colore, nessun effetto)']}


def luoghi():
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'bell tower.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 6 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_6, 'Episodio 6')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_6.get(n, [])]

    for L in LUOGHI_6:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI6_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI6_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_6)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_6
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    # il bestiario del finale richiama anche le famiglie riusate dell'atto
    from gen_ep3 import NEMICI_3
    from gen_ep5 import NEMICI_5
    for gruppo in (NEMICI_3, NEMICI_5):
        gen_bestiario.NEMICI.extend([n for n in gruppo
                                     if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['BASTIANO FERRI', 'IL CORISTA', 'LA VOCE CAVA', 'IL CONFRATELLO',
         'ADEPTO INCAPPUCCIATO', 'LO SGHERRO', 'IL SICARIO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 6')
    print('OK episodio 6')
