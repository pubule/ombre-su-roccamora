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
                          seal, wave, contatori_indagine, F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
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
    # addFromList CONSUMA la lista e lascia dentro cio' che non e' entrato:
    # un Paragraph piu' alto del frame sparisce dalla pagina SENZA errori
    # (e' successo alla lettera del Preludio, vista solo aprendo il PDF).
    # Qui non si stampa a vuoto: si urla.
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)
    if flow:
        import os as _os, sys as _sys
        _testo = ' '.join(str(getattr(f, 'text', f))[:90] for f in flow[:2])
        _msg = ('FRAME TROPPO PICCOLO in %s: %d elementi non entrano in %.1fx%.1fmm '
                'e NON verranno stampati -> %s'
                % (_os.path.basename(__file__), len(flow), w / 2.83465, h / 2.83465, _testo))
        print('!! ' + _msg, file=_sys.stderr)
        if _os.environ.get('ROCCAMORA_FRAME_STRICT'):
            raise RuntimeError(_msg)


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
    "<font name=\"OldStd-Italic\"><i>Luoghi disponibili dall’inizio: la sacrestia della Cattedrale, il Canale Basso, il "
    "Catasto delle Acque e il Palazzo del Lume — dove M. ha aperto per voi l’archivio dei "
    "Frammenti. Gli altri andranno sbloccati. L’Archivio Capitolare chiude alle 22:00.</i></font>")

# Chiavi LETTERALI, doppia via da aperti: «la marea di sizigia» (L2+L3),
# «le tre acque» (L3+L2), «il capitolo del Quarantuno» (L1+L4), «il maestro
# dei registri» (L4+L3), Chiave della Porta d'Acqua (L6). Rivelatorio (D2) su
# L1, L2, L4.
LUOGHI_6 = [
    dict(n=1, nome='LA CATTEDRALE, LA SACRESTIA', voce_mappa='La Cattedrale',
         req='Disponibile dall’inizio', art='nervous priest in a candlelit sacristy.png',
         chiude=None,
         indizi=[
             'Don Callisto non finge più niente: «il pavimento della cripta RESPIRA, signori. '
             'Lo sento sotto i piedi durante i vespri, come una nave. E stanotte l’acqua '
             'benedetta trema nelle pile senza che nessuno la tocchi.»',
             'Il capitolo della Cattedrale custodiva gli atti del Quarantuno: «il capitolo '
             'del Quarantuno decise la sconsacrazione dei Battuti E qualcos’altro, di cui '
             'non si parla. Gli atti sono all’Archivio Capitolare. Io la chiave ce l’ho, ma '
             'la parola giusta dovete saperla voi.»',
             'Dalla sacrestia, con l’orecchio al pavimento: un battito lento, sotto, '
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
             '«Ogni pezzo che avete conservato è un incrocio in più. Contateli.»',
             'Negli appunti della Società sul caso della cripta: lo studio del «maestro dei '
             'registri» in Corte del Ragioniere risulta SVUOTATO ieri — di fretta. Un '
             'facchino ha visto portar via schedari «tranne uno, caduto dal carro».',
             'M., davanti alla mappa: «gli atti del capitolo del Quarantuno non furono mai '
             'copiati: originale unico, Archivio Capitolare. Se esiste una formula che '
             'addormentò QUELLA cosa una volta, è scritta lì. Fatevi aprire: la parola è '
             'l’anno, il resto è coraggio.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='M., a porte chiuse',
                  testo='«Ferri è vivo. L’ho sempre saputo — dal magazzino non tornò '
                        'nessun corpo, solo uno spartito lasciato a metà, e chi lascia il '
                        'lavoro a metà non muore: si CONSERVA, come i suoi strumenti. '
                        'Stanotte lo troverete al centro della sala, e vi sembrerà '
                        'stanco e gentile. Non '
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
             'da accordatura grossa, il banco portatile, la campana piccola di prova. E il '
             'diapason d’argento: a caso chiuso era rientrato qui coi reperti della bottega, '
             'sotto i sigilli della Gendarmeria — e i sigilli li ha tagliati lui, da dentro.',
             'Sul banco, dimenticato o lasciato, il diario di lavorazione di Ferri: l’ultima '
             'pagina è di ieri. «La solista non serve: DODICI gole in accordo la valgono. '
             'Devono valerla.»',
             'Nel retro, il calco in gesso di una campana GEMELLA a quella di San Teodoro — '
             'e trucioli di bronzo recente. Il bronzo scampato alla Fonderia, quattro casi '
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
             'Il guardiano, a bassa voce: «la porta d’acqua sotto la Cattedrale era murata da '
             'cent’anni. Da un mese è ARIA: qualcuno l’ha riaperta dal di dentro, e la marea '
             'ci entra e ne esce come da una bocca. La chiave del cancello ce l’ho io — e a '
             'voi la do volentieri, così non tocca a me.»',
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
             'strumenti taciuti: prima si spegne, poi si legge.',
             'Allegata agli atti, la pianta della camera: tre sale-vestibolo — il bronzo, la '
             'pietra, le ossa — e al centro la Camera delle Tre Acque. Le sale non sono '
             'stanze: sono VALVOLE.'],
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
             'direttore non lavora per denaro.»',
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
         cerca_vuoto='Solo l’anello d’ormeggio e la sentina dell’altra barca: cera nera '
                     'e trucioli di bronzo, sul fondo, sotto un dito d’acqua.',
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
         cerca_vuoto='La gola risponde ai vostri passi con mezzi toni sbagliati. La '
                     'roccia è liscia da secoli d’acqua: non c’è una sporgenza, una '
                     'fessura, un appiglio.',
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
         cerca_vuoto='Trucioli d’osso e riccioli di stagno, calpestati nella fretta di '
                     'montare. Niente di intero, niente che si stacchi senza far '
                     'cantare tutto il resto.',
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
               'liutaio e al collo il diapason d’argento del vostro primo caso, Bastiano '
               'Ferri. Alza gli '
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
                 'NERVI subisce 1 danno; al 7°: il rituale si compie — fuga forzata '
                 '(epilogo peggiore, non sconfitta).',
         cerca_vuoto='Le tre vene si torcono al centro senza mescolarsi, e la pietra '
                     'intorno è nuda: nessun arredo, nessuna nicchia, niente che '
                     'qualcuno abbia lasciato indietro.',
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
    # Il frame non spezza il Paragraph: se la lettera non ci sta, sparisce
    # tutta dalla pagina (silenziosamente) - vedi l'urla in frame_flow. La
    # grafia manoscritta (F['hand']) e' meno compatta del corsivo tipografico
    # a parita' di corpo: l'altezza del frame si MISURA con wrapOn invece di
    # indovinarla a mano, il top del frame resta fisso (non risale sotto il
    # titolo) e il sigillo scende della stessa differenza.
    cap_p = Paragraph('lettera d’incarico — leggere ad alta voce', SMB)
    let_p = Paragraph(lett, st('let', fontName=F['hand'], fontSize=12.5, leading=17, alignment=4))
    avail_w = W - 2*mx
    lett_h = cap_p.wrapOn(c, avail_w, 400*mm)[1] + 2 + let_p.wrapOn(c, avail_w, 400*mm)[1] + 4*mm
    frame_top = H - (190 - 130)*mm
    frame_y = frame_top - lett_h
    delta = (H - 190*mm) - frame_y
    frame_flow(c, mx, frame_y, avail_w, lett_h, [cap_p, let_p])
    seal(c, W - mx - 12*mm, H - 205*mm - delta, r=13*mm, angle=-10)
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
    contatori_indagine(c, W)
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
                  '<b>6° round</b> (6°, 12°…) e non ogni 4° — è la notte più lunga della '
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
                  'spenti. Vittoria piena: 3 movimenti spenti + Formula letta (in T8). Vittoria '
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
        'sigillo…). Con <b>5 o più incroci</b>: la Domanda 1 è esatta garantita e si '
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
        '(<b>4/6/7→5/7/8</b>, cioè prove -1 al 5° segnalino, battito al 7°, rituale '
        'compiuto all’8° invece che al 7°). Un solo reperto non basta: servono '
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
        '<b>Il Canto, qui, batte ogni 6° round</b> (6°, 12°…) e non ogni 4°: è la notte '
        'più lunga della campagna, e il Coro dei Dodici aggiunge già segnalini per conto suo.',
        '<b>La marea (T2):</b> dal 6° round di partita, chi si trova in T2 prova NERVI '
        '(Media) a inizio round o ha 1 sola azione (l’acqua alla cintola).',
        '<b>Il Dormiente (ambiente, solo T8 rivelata):</b> al 4° segnalino Canto tutte le '
        'prove hanno -1; al 6°: ogni round l’eroe con meno NERVI subisce 1 danno (il '
        'battito); al 7°: il rituale si compie — fuga forzata: epilogo peggiore, NON '
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
        '<b>FRAMMENTO DI CAMPAGNA N. 6:</b> <i>«Ferri contava i movimenti: li contava su '
        'quattro dita. E poi chiudeva il pugno.»</i> Conservatelo per il finale di campagna.',
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
    1: "La sacrestia sa di cera vecchia e di lino inamidato, la stessa aria di chiuso del "
       "vostro primo caso; ma è più fredda di quanto una stanza attaccata alla navata abbia "
       "diritto di essere, e il freddo viene dal basso. L’armadio dei paramenti è aperto a "
       "metà, le stole appese per colore, il turibolo spento sul ripiano con la catena "
       "raccolta come si raccoglie una cima in barca; e sopra la grata della cripta, dove per "
       "vent’anni non c’è stato niente, don Callisto ha fatto stendere un tappeto da salotto, "
       "buono, fuori posto in una chiesa povera. Il parroco è dimagrito: la tonaca gli sta "
       "addosso come su un attaccapanni, e le mani non le sa più tenere ferme — dietro la "
       "schiena, poi sul tavolo, poi in tasca. «Lo sento sotto i piedi durante i vespri, come "
       "una nave», dice, e mentre lo dice guarda il tappeto, non voi. Nelle pile l’acqua "
       "trema e torna piatta senza che nessuno l’abbia toccata; le fiamme delle candele "
       "sull’armadio si piegano tutte dalla stessa parte, e non c’è una finestra aperta. "
       "All’angolo del tappeto la frangia è già consumata, in un punto solo.",
    2: "Il Canale Basso sa di alghe scoperte e di catrame freddo, e manca l’odore che "
       "dovrebbe esserci: quello dell’acqua che si muove. La corrente non c’è, la marea "
       "nemmeno. Il pelo dell’acqua sta fermo come una lastra di vetro scuro appoggiata fra "
       "le due rive, e ciò che ci galleggia sopra — un cesto sfondato, una crosta di pane, la "
       "solita pellicola d’olio — è nello stesso punto di un’ora fa. Le chiatte sono legate "
       "in doppia fila e non si urtano: senza onda di ritorno non hanno di che parlarsi, e la "
       "fila tace tutta insieme, che su un canale è più innaturale di un grido. I barcaioli "
       "non escono; stanno seduti sui bordoni con le mani sulle ginocchia, gli avambracci "
       "fermi, e guardano l’acqua come si guarda un malato che dorme: senza aspettarsi niente "
       "di buono, senza andarsene. «L’acqua così non si è mai vista», dice il più vecchio, e "
       "non aggiunge altro. In fondo alla fila una chiatta si scosta dalla banchina di un "
       "dito e ci torna, ogni tanto, senza che nessuno la tocchi. Accanto alla bitta un remo "
       "è stato piantato nel fondo e sta su da solo, dritto, con la pala fuori dall’acqua.",
    3: "Il Catasto sa di gomma arabica, di carta bagnata e riasciugata troppe volte e di quel "
       "principio di muffa che hanno le stanze dove si conservano mappe; è la stessa sala "
       "dell’inverno dei pozzi, e ci fa lo stesso freddo da cantina, un grado meno di quanto "
       "il camino acceso in fondo prometta. Le carte stanno arrotolate negli scaffali a nido "
       "d’ape, ciascuna col suo cartellino; il lume verde da tavolo tinge le mani di chi "
       "lavora, e sotto quella luce tutti hanno la faccia di un annegato. L’archivista vi "
       "riconosce e non fa il cerimonioso: ha le maniche di lustrino ancora ai gomiti, gli "
       "occhi cerchiati di chi non è andato a casa, e srotola lui, senza farselo chiedere, "
       "tre tavole idrografiche una sopra l’altra, fermandole ai lati coi pesi d’ottone. «Il "
       "guardiano tiene le tavole di marea aggiornate all’ora», dice, e intanto passa il "
       "dorso della mano sulla carta, avanti e indietro, molto più a lungo di quanto serva a "
       "spianarla. Negli scaffali, ogni tanto, un rotolo si apre da solo di un dito e si "
       "richiude. Dei quattro pesi, uno è rimasto sul davanzale, e l’angolo di carta che "
       "teneva resta arricciato.",
    4: "Il Palazzo del Lume è acceso come per un ricevimento: tutte le lampade di tutte le "
       "stanze, gli specchi che se le rimandano fino in fondo al corridoio, e nessun invitato "
       "— solo servitori che camminano piano e non incrociano lo sguardo. Fa caldo, un caldo "
       "di stufe caricate da ore, e sa di cera da pavimenti, di lampante e di carta vecchia "
       "tirata fuori dalle casse. Nel salone il tavolo grande è stato sgombrato di tutto e "
       "rivestito di feltro verde: sopra ci stanno in fila le buste dei vostri cinque casi, i "
       "cimeli con l’etichetta legata al filo, i verbali nelle loro cartelle di cartone, ogni "
       "cosa distante dall’altra un palmo esatto, come le posate di un pranzo che nessuno "
       "mangerà. M. cammina lungo il tavolo dal capo alla fine e ritorno, le mani dietro la "
       "schiena, e ogni volta che passa raddrizza una busta che era già dritta. «Stanotte si "
       "spende tutto», dice, senza fermarsi e senza guardarvi; per la prima volta da quando "
       "lo conoscete, non sorride. Sul camino l’orologio a pendolo è fermo, e la chiave della "
       "carica è appoggiata sul quadrante.",
    5: "Via degli Archetti a quest’ora è un budello di persiane chiuse, e la bottega in fondo "
       "sa ancora di colofonia e di vernice a spirito — un odore da laboratorio, caldo, che "
       "cinque mesi di sigilli non hanno tolto e che nessuna stanza abbandonata dovrebbe avere "
       "così vivo. Dentro, la polvere non è un velo uniforme: è smossa a isole, con sentieri "
       "da un banco all’altro e cerchi puliti dove delle cose sono state posate e riprese. "
       "Alla parete la rastrelliera dei ferri è ancora piena per tre quarti, e i vuoti non "
       "sono sparsi: stanno in fila, come si sceglie da un cassetto sapendo già cosa serve. "
       "Il retro è più freddo e ci si respira gesso; c’è un telo teso su qualcosa di alto "
       "quanto un uomo seduto. Fra due chiodi piantati nel muro qualcuno ha lasciato tesa una "
       "corda di budello, e quando attraversate il pavimento la corda risponde da sola, una "
       "nota bassa che dura più di quanto durino le corde vecchie. Sul banco, in mezzo alla "
       "polvere, c’è un bicchiere d’acqua mezzo pieno; e dentro l’acqua non c’è polvere.",
    6: "La Chiusa Grande di notte si sente prima di vederla: un tuono basso e continuo che "
       "non finisce mai, e sotto il tuono lo sgrondare da mille fessure delle paratie. Sa di "
       "ferro bagnato, di grasso da ingranaggi e di quel verde di fondale che l’acqua tira su "
       "quando la si costringe. Le lanterne appese ai portali illuminano gli argani, le "
       "catene, le tacche del livello dipinte sul muro di riva; a monte l’acqua è alta e "
       "gonfia e preme con la pazienza di una cosa molto grande, a valle sta liscia e nera "
       "come una lastra da tetto, e fra le due, stanotte, c’è più scarto di quanto ne facciano "
       "di solito le maree. Il guardiano non stacca gli occhi dal quadrante dell’argano e "
       "grida numeri a due aiutanti mezzi addormentati, che li ripetono come una preghiera. "
       "«Mezz’ora prima e mezz’ora dopo, le gallerie basse si allagano», dice, e lo dice a "
       "voi con la faccia di chi lo dice a sé. Il nottolino dell’argano grande batte un colpo "
       "ogni tanto, da solo. Alla parete della guardiola, a un chiodo, appesa con la sua "
       "targhetta d’ottone, sta la chiave del cancello di valle.",
    7: "Sopra il chiostro, la torre dell’archivio è una colonna di carta: quattro piani di "
       "armadi a muro con le date dipinte a mano sulle ante, che salgono in giro fino a dove "
       "nessuna scala arriva più. Ci si respira polvere di pergamena e colla di pesce, e un "
       "freddo asciutto, da cassa di museo, che le mani sentono prima della faccia. La scala "
       "a chiocciola è di pietra, stretta come un imbuto, e il canonico archivista la sale "
       "davanti a voi senza lume, contando i gradini con la punta della scarpa: gli occhi, "
       "dice, non gli servono più da anni — e infatti non guarda dove mette i piedi, ma dove "
       "tiene le mani. Sui pianerottoli le candele nei bracci di ferro non stanno mai ferme: "
       "la torre tira aria da qualche parte in alto, e la fiamma si allunga sempre verso "
       "l’interno delle scale, mai verso la finestra. Gli atti del Quarantuno stanno "
       "nell’armadio più alto di tutti, quello che si raggiunge con la scala a pioli, dove le "
       "date non si leggono senza avvicinare la candela. L’anta di quell’armadio è accostata, "
       "e il gancetto pende fuori dall’occhiello.",
    8: "La Corte del Ragioniere è un pozzo di case alte dove il sole non entra mai e l’odore "
       "di minestra delle famiglie si mescola a quello del canale morto dietro il muro; le "
       "finestre sono chiuse tutte, ma chiuse da poco, che si vede dalle imposte ancora "
       "pulite nel giro dei cardini. Le scale sanno di cera e di gatto. Al primo piano la "
       "porta dello studio è aperta e non serve bussare: dentro non c’è più niente. Restano i "
       "chiodi nei muri all’altezza dei quadri, con sotto la carta da parati più scura in "
       "quadrati regolari; restano le impronte degli schedari sul pavimento, rettangoli di "
       "legno chiaro nel legno scurito da anni di passi; resta l’odore d’inchiostro "
       "ferro-gallico, che è l’ultima cosa ad andarsene da una stanza di scritture. "
       "Nell’anticamera, in fila contro la parete, le sedie d’attesa sono ancora al loro "
       "posto, sei, coi sedili di paglia sfondati al centro dalle stesse schiene; una dondola "
       "quando qualcuno cammina al piano di sopra. Contro il battiscopa, dove finiva la "
       "scrivania, è rimasta una gomma da cancellare consumata fino a metà.",
    9: "L’arco si apre nel fianco della Cattedrale a un palmo dal pelo dell’acqua, tanto "
       "basso che una barca ci passa solo se chi sta a bordo si piega; per un secolo lì c’è "
       "stato un muro, e adesso c’è aria. Il canale sotto non ha corrente e non ha odore "
       "d’acqua: manda su un fiato di pietra bagnata e di calce vecchia, più tiepido della "
       "notte, che arriva a folate come se qualcosa, dentro, respirasse a intervalli lunghi. "
       "La malta è stata tolta con la pazienza di un restauro e non con la mazza: i conci "
       "sono impilati sulla riva in ordine, ciascuno col suo numero a gesso sulla faccia, e i "
       "numeri sono sbavati soltanto dove le mani li hanno presi. Legata all’anello, una "
       "barca piatta da carico sta vuota e alta sull’acqua. Dentro l’arco il livello sale e "
       "scende di due dita, e ogni volta l’acqua fa contro la pietra lo stesso schiocco, "
       "senza che dal canale arrivi un’onda. Il cancello di ferro nuovo è accostato, non "
       "chiuso, e i cardini sono ingrassati di fresco.",
}

OGGETTI_LUOGO_6 = {
    1: [
        'L’Acqua Benedetta',
        'La Reliquia di San Teodoro',
    ],
    4: [
        ('Nota', '', 'deduzione d’atto: vedi la busta della Soluzione'),
    ],
    5: [
        ('Reperto A', 'il Diario di Ferri', ''),
    ],
    6: [
        'La Chiave della Porta d’Acqua',
        'La Lanterna di Chiusa',
    ],
    7: [
        'La Formula del Sigillo',
        ('Reperto B', 'la Pianta della Camera', ''),
    ],
    8: [
        ('Reperto C', 'lo Schedario della Cripta', ''),
    ],
}

TILE_ART_6 = {t['id']: t['id'] + '-ep6.png' for t in TILES_6}
LUOGHI6_CROP = {}

TESSERE_DESC_6 = {
    'T1': "Il cielo finisce di colpo: l’arco passa sopra le teste e quello che resta è un "
          "soffitto di conci a un braccio dalla fronte, con l’acqua a un palmo dalle volte. "
          "L’eco cambia prima ancora della luce — i remi, il respiro, il cigolio dello scalmo "
          "tornano indietro doppi, e più tardi di quanto una gola così stretta li dovrebbe "
          "restituire. Sa di pietra bagnata e di calce, non di canale: l’acqua qui dentro è "
          "ferma e tesa come la pelle di un tamburo, e la barca ci scivola sopra senza fare "
          "scia. Le pareti hanno anelli d’ormeggio nuovi, di ferro non ancora arrugginito, "
          "piantati a distanze regolari fino in fondo al buio; alla volta è fissata una "
          "lanterna a specchio, schermata dalla parte del canale, spenta; il fondo è stato "
          "dragato di fresco e il fango tirato su sta ancora in mucchi lungo il muretto di "
          "riva. Ogni tanto, dal buio davanti, arriva un soffio d’aria tiepida che non viene "
          "dalla città. Sull’imposta dell’arco, dalla parte di dentro, c’è una tacca di "
          "scalpello chiara nella pietra nera.",
    'T2': "La galleria è un budello di mattoni che l’acqua usa da secoli e concede in "
          "prestito: alta quanto un uomo con le spalle curve, larga quanto due, lucida fino "
          "all’altezza del petto, dove la pietra è liscia come un corrimano di chiesa. Sopra "
          "quella linea è ruvida e bianca di salnitro. Si cammina su una cengia stretta, e "
          "sotto le suole crocchia tutto: cirripedi secchi, gusci, alghe rapprese come "
          "capelli. L’aria sa di iodio e di fogna fredda, e cambia a ogni curva — in certi "
          "tratti tira, in altri sta ferma e pesa, e la fiamma della lanterna lo dice prima "
          "di voi. Sui muri, incise a scalpello, ci sono le tacche delle piene con l’anno "
          "accanto: le più alte stanno dove il collo si deve piegare all’indietro per "
          "leggerle. Il livello nel canaletto di fondo non è quello che avete visto "
          "entrando; sale di un dito alla volta, senza fretta, e la linea bagnata della "
          "parete lo segue. Infilato in una fessura, a mezz’altezza, resta un mozzicone di "
          "candela: la cera è colata in basso e poi, per un tratto, di lato.",
    'T3': "Qui l’acqua canta davvero: la vena dolce entra da una bocca di pietra scolpita a "
          "mascherone e cade in una vasca bassa con una nota sola, sempre la stessa, un filo "
          "di suono che l’orecchio aggancia al primo passo e poi non riesce più a lasciare. "
          "La sala è calda — più calda di una cantina sotto il livello del canale, e nessuno "
          "ha acceso niente. Sopra il flusso, appesa a un’incastellatura di legno nuovo che "
          "sa ancora di resina, sta una campana grande: bronzo chiaro, senza una macchia di "
          "verderame, la bocca a un braccio dall’acqua e il battaglio tirato indietro e "
          "legato corto, come si tiene un cane che ha già visto la porta aperta. Attorno "
          "stanno le casse del cantiere, la sabbia di fusione, i cunei e le funi, ammucchiati "
          "in fretta e non ancora sporchi. Quando parlate, il bronzo risponde: raccoglie le "
          "vostre voci e le restituisce un tono più basso, con un ritardo. Sul fianco della "
          "campana, a mezz’altezza, la patina è tolta in un punto solo, largo come un pollice.",
    'T4': "La rotonda è scavata nella pietra viva, senza un mattone: le pareti portano ancora "
          "i colpi degli scalpelli, e i colpi non sono in fila come li darebbe una squadra, "
          "ma a raggiera, come se si fosse lavorato dal centro verso fuori. Tre canali "
          "scoperti entrano da tre bocche e corrono ciascuno nel suo solco, larghi un passo, "
          "profondi quanto un braccio; al centro si sfiorano e proseguono, e ognuna tiene il "
          "proprio colore fin dentro l’altra. L’aria è ferma e sa di terra "
          "bagnata, di ruggine e appena appena di zolfo; è più tiepida della galleria da cui "
          "venite di quel tanto che si sente sulle guance. Il pavimento vibra: non un "
          "tremito, un battito lungo, così basso che i piedi lo prendono per un’impressione e "
          "le ginocchia no. Ogni volta che passa, la superficie dei tre canali si increspa "
          "tutta insieme e torna liscia. Al centro esatto della sala, piantato nella pietra, "
          "c’è un anello di ferro grosso come un braccialetto, senza niente attaccato.",
    'T5': "La gola di pietra sale oltre dove arriva il lume: si vedono i primi righi e si "
          "indovinano gli altri, cinque linee orizzontali incise nella roccia a distanze "
          "uguali, larghe un dito, che corrono da una parete all’altra come sopra una pagina "
          "di musica troppo grande per essere letta da vicino. La vena morta dei pozzi risale "
          "dentro la gola e non fa rumore — nessuno sciacquio, nessuna goccia — ed è questa "
          "la cosa che non torna: un’acqua che sale in silenzio, nera e piatta, come se la si "
          "versasse dal basso. La roccia è liscia da secoli, senza un appiglio e senza "
          "polvere, e il freddo qui è di un altro genere: un freddo di pozzo, che entra dalle "
          "maniche. Ogni tanto la sala restituisce un vostro passo un mezzo tono più su di "
          "come l’avete dato, e il ritorno arriva quando avete già smesso di aspettarlo. "
          "Nella fenditura maestra, dove i righi si stringono, è piantato un cuneo di bronzo "
          "largo tre dita; sotto, in un rigagnolo, il metallo ha lasciato una riga verde "
          "sulla pietra.",
    'T6': "Si sente prima di vederlo: un respiro, uno solo ogni sette secondi, largo e umido, "
          "che riempie la sala e la lascia. L’aria sa di colla d’ossa scaldata, di stagno "
          "saldato di fresco e, sotto, di quell’odore dolciastro che hanno le cose di chiesa "
          "tenute in cantina. L’organo è stato rimesso insieme in fretta e si vede: metà "
          "canne sono quelle bianche e leggere che conoscete, allineate per statura come una "
          "fila di ragazzi; metà sono tubi da lattoniere, tagliati a misura, con le saldature "
          "ancora grigie e le sbavature non limate. Il tutto sta su un’incastellatura di "
          "travi non piallate, e il mantice, in basso, è gonfiato dalla vena salmastra che "
          "gli passa sotto e lo carica a ogni onda. Le canne non suonano: soffiano. E fra un "
          "soffio e l’altro, dentro la cassa, qualcosa si assesta con un piccolo schiocco di "
          "legno, sempre lo stesso. Sul somiere i registri sono tirati fuori tutti quanti. "
          "Sul fornelletto accanto alla panca, una scodella di colla d’ossa fa la pelle in "
          "superficie ed è ancora liquida sotto.",
    'T7': "Una cappella spogliata di tutto e riarredata da chi allestisce i camerini: dodici "
          "scranni portati da fuori e messi in cerchio, dodici mantelli neri agli "
          "attaccapanni, dodici paia di scarpe buone in fila sotto la panca, le punte tutte "
          "allo stesso verso. Sa di naftalina, di cipria e di menta forte — le pasticche per "
          "la gola stanno aperte sulla specchiera, una scatola per posto, con lo specchio "
          "appoggiato al muro e le candele ai lati, come si fa in teatro. Fa più caldo che "
          "nel resto delle gallerie: dodici uomini si sono vestiti qui poco fa, e il calore "
          "dei corpi non se n’è ancora andato dai mantelli. Sul tavolo di mezzo gli spartiti "
          "sono aperti tutti alla stessa pagina, e le stesse quattro battute sono cerchiate a "
          "matita rossa su ogni copia, con lo stesso giro di mano. Le fiamme delle candele si "
          "piegano tutte insieme, ogni tanto, verso la porta in fondo, e tornano dritte. Un "
          "paio di scarpe, l’ultimo della fila, è ancora legato con lo spago del negozio.",
    'T8': "La sala è rotonda come nessuna sala scavata a mano, e il cerchio torna troppo "
          "bene: nessuna nicchia, nessuno spigolo, la pietra chiusa su se stessa come "
          "l’interno di una campana. Tre bocche uguali si aprono a uguale distanza, e da "
          "ognuna entra un’acqua: la chiara, la verde, la nera. Non si mescolano. Si torcono "
          "al centro l’una nell’altra e salgono in una colonna alta quanto un uomo in piedi, "
          "ferma, senza cadere e senza schizzare, e la luce delle candele ci passa dentro e "
          "ne esce di un altro colore. Intorno, in cerchio, i dodici cantano dagli spartiti "
          "tenuti alti, senza guardarsi, e la nota che tengono non prende mai fiato: quando "
          "uno lascia, un altro è già dentro. In mezzo, piccolo, in maniche di camicia, con "
          "la bacchetta da liutaio e il diapason d’argento appeso al collo, Bastiano Ferri "
          "dirige a occhi chiusi. Al vostro rumore li apre. Vi guarda, e la mano non perde il "
          "tempo. Per terra, accanto alla bocca di mezzo, c’è una tazza di latta con dentro "
          "un dito di caffè freddo.",
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
        return N.oggetto_righe(OGGETTI_LUOGO_6.get(n, []))

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
