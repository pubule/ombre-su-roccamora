# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 10: La casa che ricorda (Episodio 10/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-10.md e CAMPAGNA-EPISODI.md).
Standalone: nella Corte della Faenza una casa d'affitto ristrutturata
«parla» (la calce impastata con sabbia del Borgo delle Cisterne ha
registrato). Non un dungeon, non una scorta: una CORSA ALLA DEMOLIZIONE
dentro la casa, mentre il muratore abbatte il muro che nasconde il corpo
della prima moglie. Boss: il Muratore (bruto). Nessun mostro: il
soprannaturale è solo memoria. Un solo seme: la commessa della sabbia
firmata «C.B.».

Varietà strutturale (regola 2026-07-18): obiettivo non-boss di tipo
CORSA ALLA DEMOLIZIONE (fissare la prova prima che il muro crolli), +
mazzo con più insidie e meno spawn (orrore psicologico).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

I dati qui sono la fonte autoritativa lato Python (le carte fisiche
vivono in scripts/cardconjurer/cards-data.js, blocco EPISODIO 10).
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 10', 'pdf')
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

LETTERA_10 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Nella Corte della Faenza c’è una casa d’affitto, appena ristrutturata, che <i>parla</i>. "
    "I nuovi inquilini — i coniugi <b>Neri</b> — sono fuggiti dopo tre notti: dicono che i muri "
    "sussurrano le voci di chi ci abitava prima. L’ultima notte una voce avrebbe dettato, parola "
    "per parola, come un uomo strangolò la moglie e la murò — un delitto di dieci anni fa, che i "
    "registri chiudono come «abbandono del tetto coniugale». Il vedovo, <b>Corrado Malfanti</b>, "
    "risposato, abita ancora nella corte. E qualcuno, stanotte, ha cominciato a demolire un "
    "muro.<br/><br/>"
    "Una casa che ricorda è un testimone che non si può corrompere né spaventare — finché sta in "
    "piedi. Andate, ascoltate cosa dice, e portatemi ogni carta sui materiali del restauro: da "
    "dove viene la calce, chi ha venduto la sabbia. Voglio sapere di cosa è fatta una città che "
    "comincia a parlare. Avete <b>6 ore</b>, dalle 18:00 alle 24:00; poi comincia la notte, e la "
    "casa non aspetta.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la casa che ricorda, la Corte della Faenza, l’Archivio "
    "Civico e la Gendarmeria. Gli altri andranno sbloccati.</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «la calce del restauro» (L1+L2), «il muro che ricorda» (L1+L3),
# «l'abbandono del tetto coniugale» (L3+L4), «la sabbia buona del Borgo»
# (L2+L4), «una prova che resti» (L1+L4). Rivelatorio (D2) su L2, L3, L4.
LUOGHI_10 = [
    dict(n=1, nome='LA CASA CHE RICORDA', voce_mappa='La Casa della Corte',
         req='Disponibile dall’inizio', art='La Casa della Corte.png',
         chiude=None,
         indizi=[
             'I coniugi Neri, sulla soglia, non rientrano più: «i muri parlano, signori. La '
             'prima notte, sussurri. La terza, una voce d’uomo che ripeteva sempre le stesse '
             'parole, come chi detta a uno scrivano: “ferma di battere le mani, Ada”. Poi il '
             'nome, e come è morta. Non siamo pazzi. È la casa.»',
             'La ristrutturazione è recente, l’intonaco ancora chiaro. Tobia Neri, muratore lui '
             'stesso di mestiere, tocca la parete: «l’hanno rifatta con calce buona, sabbia '
             'fine, non quella del fiume. Un lavoro caro per una casa d’affitto. La calce del '
             'restauro è meglio di quella di casa mia — e casa mia non parla.»',
             'La voce, dicono i Neri, viene sempre dalla stessa parete: la camera al primo '
             'piano, il muro cieco verso la corte. «È lì che detta. Come se dietro ci fosse '
             'qualcuno che non ha finito di raccontare. Il muro che ricorda, l’ha chiamato mia '
             'moglie. E se una casa vuole essere ascoltata, forse una prova che resti si trova '
             'proprio lì.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La parete che detta',
                  testo='La parete della camera è più spessa delle altre di una spanna buona: '
                        'battendola, in un punto suona vuota. Non è un muro pieno — è un muro '
                        'DOPPIO, con un vano dietro. La voce non viene «dalla casa»: viene da '
                        'quel vano. Qualcosa, o qualcuno, è murato lì da anni, e la calce che '
                        'ricorda gli ha ridato la voce.'),
         ]),
    dict(n=2, nome='LA CORTE DELLA FAENZA', voce_mappa='Corte della Faenza',
         req='Disponibile dall’inizio', art='Corte della Faenza.png',
         chiude=None,
         indizi=[
             'I vicini della corte parlano a bassa voce di Corrado Malfanti, che abita tre porte '
             'più in là: «risposato in fretta, dieci anni fa, con una ragazzina. La prima moglie, '
             'Ada, se n’è andata una notte e non si è più vista. Lui denunciò l’abbandono. Ma Ada '
             'amava questa corte: non se ne sarebbe andata senza salutare nessuno.»',
             'Una lavandaia indica la casa che parla: «l’ha fatta ristrutturare il padrone coi '
             'materiali del cantiere nuovo — la sabbia buona del Borgo, quella che costa. Strano, '
             'per una casa vecchia. E da quando l’hanno rifatta, la notte si sentono cose. La '
             'calce del restauro ha svegliato qualcosa che dormiva.»',
             'Un vecchio della corte, sottovoce: «stanotte, verso l’una, ho sentito i colpi. Un '
             'muratore che batte, dentro la casa vuota. Chi ristruttura una casa d’affitto alle '
             'ore piccole, e di nascosto? Chi non vuole rifarla — chi vuole disfarla.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='La vicina di Ada',
                  testo='«Ada me lo disse, l’ultima settimana: “Corrado non mi guarda più, guarda '
                        'la ragazza del fornaio”. Poi sparì, e lui pianse a favore di corte per '
                        'un mese, e sposò proprio quella ragazza l’anno dopo. Abbandono, dissero. '
                        'Ma una donna che scappa si porta via qualcosa. Ada lasciò tutto: '
                        'l’anello, i vestiti, perfino le scarpe. Chi scappa scalza? Chi non è '
                        'scappata: è stata portata via. E l’ha portata via lui.»'),
         ]),
    dict(n=3, nome='L’ARCHIVIO CIVICO', voce_mappa='L’Archivio Civico',
         req='Disponibile dall’inizio', art='L’Archivio Civico.png',
         chiude=None,
         indizi=[
             'Il fascicolo del 1879: la denuncia di «abbandono del tetto coniugale» a firma '
             'Corrado Malfanti. Datata quattro giorni dopo la scomparsa di Ada. <i>(Reperto A: '
             'consegnate la Denuncia di Abbandono.)</i> Quattro giorni: nessuno denuncia così in '
             'fretta un abbandono che spera passeggero.',
             'Nelle vecchie piante catastali dell’edificio, la camera al primo piano risulta con '
             'una parete «di tramezzo» aggiunta DOPO la costruzione — l’anno stesso della '
             'scomparsa. Il muro che ricorda non c’era: fu tirato su nel 1879. Chi murò cosa, in '
             'quella parete, l’anno che Ada sparì?',
             'Un impiegato pignolo nota una postilla: «l’abbandono del tetto coniugale fu '
             'archiviato senza cercare la donna — bastò la parola del marito. Ai tempi si '
             'chiudevano così, questi casi: una donna che se ne va è un affare di famiglia, non '
             'della legge.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La denuncia del 1879',
                  testo='La grafia della denuncia è nervosa, l’inchiostro fu premuto forte: non '
                        'la mano di chi ha perso qualcuno, ma di chi recita una parte provata. E '
                        'la data — quattro giorni — è troppo presto: un marito abbandonato aspetta, '
                        'spera, cerca. Denuncia in fretta solo chi ha già bisogno che l’assenza '
                        'sia ufficiale. Corrado Malfanti non cercava Ada: la stava dichiarando '
                        'sparita perché sapeva che non sarebbe tornata.'),
         ]),
    dict(n=4, nome='LA GENDARMERIA', voce_mappa='La Gendarmeria',
         req='Disponibile dall’inizio', art='La Gendarmeria.png',
         chiude=None,
         indizi=[
             'Il brigadiere tira fuori il vecchio caso, controvoglia: «Malfanti? Abbandono, caso '
             'chiuso da dieci anni. Perché lo riaprite? Perché una casa parla? Andate a raccontarlo '
             'al giudice.» Ma abbassa la voce: «tra noi: quel caso l’abbiamo chiuso troppo in '
             'fretta. Come tanti, ai tempi.»',
             'Sul registro, la nuova licenza edilizia della casa che parla: materiali «sabbia buona '
             'del Borgo», fornitore non nominato, pagamento anticipato. «Roba strana. Chi anticipa '
             'per rifare una topaia in affitto? A meno che rifarla non sia il punto. Se volete la '
             'prova, una prova che resti, dovrete portarla voi: la mia carta non basta.»',
             'Un piantone ricorda: «Malfanti è passato ieri, agitato, a chiedere se “per una vecchia '
             'denuncia di abbandono del tetto coniugale” si può riaprire un caso. Gli ho detto di '
             'no, salvo prove nuove. È sbiancato. Un innocente non sbianca per una parola vecchia '
             'di dieci anni.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il brigadiere',
                  testo='«Ve lo dico fuori dai denti: dieci anni fa Malfanti denunciò l’abbandono, '
                        'noi archiviammo, e lui il mese dopo fece murare una parete “per umidità” — '
                        'lo scrisse pure sulla licenza dei lavori, allora. Umidità, al primo piano, '
                        'sul muro asciutto verso la corte. Nessuno collegò le due cose. Io sì, '
                        'stanotte, con voi che me lo chiedete. Il colpevole è lui: l’ha uccisa e '
                        'l’ha murata, e ha chiamato tutto “abbandono”.»'),
         ]),
    dict(n=5, nome='IL DEPOSITO DEL MURATORE', voce_mappa='Deposito del Muratore',
         req='Il deposito è chiuso e il muratore diffida degli sconosciuti: si apre solo a chi '
             'sa di cosa è fatta quella casa — la materia giusta, quella cara, nominata per '
             'nome.',
         chiave=('parola', 'LA CALCE DEL RESTAURO'), art='Deposito del Muratore.png',
         chiude=None,
         indizi=[
             'Bortolo «Malta» Sassi, il muratore, è terrorizzato: «io ho una famiglia, signori. '
             'Dieci anni fa Malfanti mi pagò per chiudere un vano e non fare domande. Adesso mi '
             'paga — mi COSTRINGE — a riaprirlo e portar via quello che c’è dentro, prima che il '
             'giudice senta la casa. Stanotte torno a demolire. Non voglio, ma ho tre figli.»',
             'Sul banco, il libro mastro della muratura: la partita di dieci anni fa («chiudere '
             'il vano piccolo, primo piano — pagato in contanti, non registrare») e sotto, '
             'recente, l’appunto del ricatto («tornare ad aprire — Malfanti insiste, prima '
             'dell’alba»). <i>(Reperto B: consegnate il Libro Mastro della Muratura.)</i>',
             'Arrotolata in un angolo, la pianta del restauro con la parete doppia segnata a '
             'matita rossa: sa esattamente quale muro nasconde il vano. <i>(Oggetto: prendete '
             'la carta La Pianta del Restauro.)</i> Accanto, un ferro da muratore arrugginito. '
             '<i>(Esca: potete prendere la carta Il Ferro del Muratore.)</i>'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='Gli ordini di Malfanti',
                  testo='Il biglietto del ricatto fissa l’ora: «prima dell’alba, nell’intervallo '
                        'delle ronde — entra dalla cantina, che dà sul deposito, e non farti '
                        'sentire». Il muratore entrerà dal sottoscala e comincerà dal piano di '
                        'sopra. Chi ha la pianta e conosce la parete doppia può andare dritto al '
                        'vano senza cercarlo a tentoni — e senza mettere il piede sul gradino '
                        'marcio della scala.'),
         ]),
    dict(n=6, nome='L’INTERCAPEDINE', voce_mappa='Il vano murato',
         req='Il vano è dietro un muro, e il muro è dietro una casa che nessuno vuole aprire: '
             'ci si arriva solo sapendo cosa custodisce — la parete di cui parlano tutti, quella '
             'che non tace.',
         chiave=('parola', 'IL MURO CHE RICORDA'), art='Il vano murato.png',
         chiude=None,
         indizi=[
             'Battendo la parete doppia della camera, il vuoto risponde. Dentro l’intercapedine, '
             'dietro un dito di intonaco fresco, c’è Ada Malfanti — o ciò che dieci anni di calce '
             'ne hanno conservato. È QUI che la casa detta. È QUI che finirà la notte, in un modo '
             'o nell’altro.',
             'Sul davanzale della camera, dimenticato dai Neri nella fuga, un dagherrotipo di '
             'Ada da giovane, sorridente nella corte. <i>(Oggetto: prendete la carta Il Ritratto '
             'di Ada.)</i> Guardarla in faccia cambia il terrore in pietà: si ascolta la casa '
             'senza impazzire.',
             'La calce dell’intercapedine è impastata con sabbia del Borgo delle Cisterne — la '
             'stessa che tiene le voci nei pozzi. Un muro fatto così non dimentica: registra. Il '
             'soprannaturale, in questa casa, è soltanto memoria che non ha potuto tacere.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La voce nel muro',
                  testo='A posare la mano sull’intonaco fresco: si sente Ada, non come un '
                        'fantasma ma come un solco inciso nella calce, ripetere le ultime parole '
                        'che udì — «ferma di battere le mani» — e poi il silenzio del vano che si '
                        'chiude. Non chiede vendetta: chiede solo di essere trovata prima che il '
                        'muro cada di nuovo. La visione dura un rintocco, e sa di calce e di '
                        'lacrime.'),
         ]),
    dict(n=7, nome='LA CASA DEL VEDOVO', voce_mappa='Casa Malfanti',
         req='La casa di Malfanti è sbarrata e lui non apre agli estranei: cede solo davanti a '
             'chi nomina la parola vecchia con cui seppellì tutto — quella scritta nel registro '
             'del 1879.',
         chiave=('parola', 'L’ABBANDONO DEL TETTO CONIUGALE'), art='Casa Malfanti.png',
         chiude=None,
         indizi=[
             'Corrado Malfanti apre solo quando gli sbattete in faccia la vecchia parola: '
             'sbianca. Rosa, la seconda moglie, non capisce: «di che parlate? Ada se n’è andata '
             'prima che io conoscessi Corrado. Lui ha sofferto tanto.» Rosa non sa nulla: è la '
             'prima ingannata di tutte.',
             'Sul comò, la fede nuziale di Ada — quella che una donna che «abbandona» il tetto '
             'si sarebbe portata via, e che invece è qui, lucidata, in mostra come un trofeo. '
             '<i>(Esca: potete prendere la carta La Fede di Rosa — è la fede di Ada, ma non prova '
             'nulla in tribunale.)</i>',
             'Corrado, messo alle strette, non confessa: minaccia. «Quella casa è mia, e stanotte '
             'la faccio rimettere a posto una volta per tutte. Domani non ci sarà più niente da '
             'sentire. Andate a casa, signori: certe pareti è meglio non aprirle.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='L’ignoranza di Rosa',
                  testo='Rosa parla di Ada senza odio, con la pena sincera di chi crede a una '
                        'storia triste: è innocente, e la sua innocenza è la prova più crudele '
                        'della colpa di Corrado. Ma sul comò la fede di Ada è disposta con cura '
                        'maniacale, girata verso la porta: non il ricordo di un abbandono — il '
                        'cimelio di un possesso. Corrado non ha perso Ada. Se l’è tenuta, murata '
                        'e in vista, per dieci anni.'),
         ]),
    dict(n=8, nome='LA FORNITURA DEL BORGO', voce_mappa='Fornitura del Borgo',
         req='Il magazzino della fornitura tratta solo con chi sa cosa cercare: la materia buona, '
             'quella del quartiere dei pozzi, nominata per quello che è.',
         chiave=('parola', 'LA SABBIA BUONA DEL BORGO'), art='Fornitura del Borgo.png',
         chiude=20,
         indizi=[
             'Il magazziniere mostra il registro delle vendite: la sabbia del Borgo delle Cisterne '
             'venduta ai restauri della corte, in quantità, a un privato. «Roba fine, cara. La '
             'compra chi vuole muri che durano. O muri che… tengono le cose, come dicono al '
             'Borgo.»',
             'La commessa è pagata IN ANTICIPO, su carta di pregio, filigranata, e firmata con '
             'una sola sigla: «C.B.» — non Malfanti. Chi fornisce la sabbia buona non lavora per '
             'il vedovo: lavora per qualcuno di più grande. <i>(Reperto C: consegnate la '
             'Commessa del Fornitore.)</i>',
             'Il magazziniere, a disagio: «il signor C.B. non l’ho mai visto. Ordini per '
             'lettera, denaro prima, consegne dove dico io. Vuole la sabbia del Borgo per mezza '
             'città, dice. Per rifare i muri vecchi coi materiali giusti. Che vorrà dire, non '
             'lo so.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La commessa firmata «C.B.»',
                  testo='Carta di pregio, filigrana della cartiera dei casi passati; la sabbia '
                        'del Borgo pagata prima ancora di essere cavata; e la firma è un ricciolo '
                        'solo, «C.B.», la stessa mano che affiora nei registri dell’inverno. La '
                        'casa che parla non è un incidente della ristrutturazione: è un '
                        'esperimento. Qualcuno sta scegliendo di che cosa è fatta Roccamora — e '
                        'chi sceglie i materiali sceglie che cosa la città ricorderà.'),
         ]),
    dict(n=9, nome='LA BOTTEGA DEL FOTOGRAFO', voce_mappa='Bottega del Fotografo',
         req='La bottega è chiusa a quest’ora, e il fotografo apre solo a chi gli spiega perché '
             'gli serva la notte: non un ritratto, ma qualcosa che resti anche quando la cosa '
             'ritratta non c’è più.',
         chiave=('parola', 'UNA PROVA CHE RESTI'), art='Bottega del Fotografo.png',
         chiude=21,
         indizi=[
             'Il fotografo capisce al volo: «una voce svanisce all’alba, un muro cade, un '
             'testimone ritratta. Ma una lastra impressa resta. Vi presto la macchina e il lampo '
             'al magnesio: fotografate quel che trovate, e nessun avvocato ve lo cancella.» '
             '<i>(Oggetto: prendete la carta La Macchina Fotografica.)</i>',
             'Spiega la fretta necessaria: «il magnesio fa una luce sola, accecante, e la lastra '
             'va cambiata. Ogni scatto è prezioso. Se là dentro qualcuno sta buttando giù il '
             'muro, avrete pochi lampi prima che non ci sia più niente da fotografare.»',
             'Un ritaglio appeso alla parete: «LA FOTOGRAFIA GIUDIZIARIA — la prova che il tempo '
             'non corrompe». Il fotografo ci tiene: «un giorno si condanneranno gli assassini con '
             'le lastre, non con le chiacchiere. Fatelo stanotte, per primi.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il lampo al magnesio',
                  testo='La macchina è pesante ma pronta: cavalletto, otturatore, e una vaschetta '
                        'di polvere di magnesio per il lampo. La regola è semplice: al buio della '
                        'casa, un lampo fissa quello che la voce sola non basta a provare. Con la '
                        'macchina, ogni istante passato a documentare l’intercapedine vale il '
                        'doppio: la memoria effimera della casa diventa lastra permanente.'),
         ]),
]

# Tessere della corsa (percorso lineare a 6: e' una casa stretta, non un
# labirinto). Due tracce: DEMOLIZIONE (il Muratore abbatte il muro) contro
# PROVA (gli eroi fotografano il corpo). Vittoria = PROVA piena; sconfitta =
# DEMOLIZIONE piena.
TILES_10 = [
    dict(id='T1', nome='L’INGRESSO (IL TINELLO)', exits={'N': 'T2'}, start='S',
         testo='Il tinello dei coniugi Neri, lasciato a metà cena: la fuga si vede nelle sedie '
               'rovesciate. Dall’alto, un rimbombo sordo — il primo colpo di mazza. La casa '
               'trema, e da una parete arriva un sussurro che non è vento. QUANDO RIVELATE '
               'QUESTA TESSERA: applicate l’esito delle Domande 3 e 4 (vedi Soluzione); '
               'comincia la traccia DEMOLIZIONE. Dovete raggiungere l’intercapedine (T6) e '
               'fissare la prova prima che il muro crolli.',
         cerca_vuoto='Solo una tavola apparecchiata e fredda, e il rimbombo di sopra che scandisce '
                     'il tempo che avete. La casa, stanotte, non è vuota: è piena di chi non c’è più.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='LA SCALA CHE RIPETE', exits={'S': 'T1', 'N': 'T3'},
         testo='La scala verso il primo piano. A ogni gradino, i muri rimandano una lite di '
               'dieci anni fa: una voce d’uomo che sale, una di donna che supplica. QUANDO '
               'RIVELATE QUESTA TESSERA: ogni eroe prova NERVI (Media) — l’orrore è capire che '
               'la lite è vera. La casa qui è più forte della paura dei nemici.',
         arbitro='TRAPPOLA: il terzo gradino è marcio e cede (VIGORE Media o 1 danno e cadi al '
                 'piano di sotto — un round perso a risalire). CON LA PIANTA DEL RESTAURO: '
                 'sapete quale gradino saltare, nessuna prova. Questa è una tessera d’ORRORE, '
                 'non di combattimento: qui non si piazzano garzoni.',
         hook='La Pianta del Restauro (dal Deposito): «l’indagine vi ha avvertiti» — niente '
              'prova sul gradino marcio.',
         cerca_vuoto='Gradini che scricchiolano parole. Non c’è niente da cercare: c’è solo da '
                     'salire, e da non ascoltare troppo.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='IL CORRIDOIO DEI NOMI', exits={'S': 'T2', 'N': 'T4'},
         testo='Un corridoio lungo, le porte delle stanze tutte chiuse. Dai muri, sottovoce, i '
               'nomi di chi ci ha abitato: inquilini di trent’anni, di dieci, di ieri. E in '
               'mezzo, ostinato, il nome «Ada». QUANDO RIVELATE QUESTA TESSERA: l’eroe più '
               'avanzato prova NERVI (Media) — sentire il proprio nome tra quelli lo gela.',
         arbitro='Nessun nemico stanziale qui: solo la casa. Se avete il Ritratto di Ada, le '
                 'prove NERVI di questo corridoio sono a Facile (sapete di chi è la voce: pietà, '
                 'non terrore).',
         cerca='Dietro una porta socchiusa, la stanza dei Neri: una lanterna a olio dimenticata, '
               'ancora carica (+1 alle prove NERVI finché la porta chi l’ha presa).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='LA CAMERA CHE DETTA', exits={'S': 'T3', 'N': 'T5'},
         testo='La camera al primo piano: il letto disfatto dei Neri, e la parete cieca verso la '
               'corte — quella che detta. Qui la voce è nitida, ripete il delitto parola per '
               'parola. QUANDO RIVELATE QUESTA TESSERA: appare IL VEDOVO, Corrado Malfanti, '
               'entrato di nascosto per «sistemare»: disperato, vi supplica e vi intralcia.',
         arbitro='TRAPPOLA: un trave del soffitto, indebolito dai lavori, può cedere (l’eroe '
                 'sotto prova NERVI Media o 1 danno). IL VEDOVO (nemico minore, Fer 2) tenta di '
                 'fermare chi va verso l’intercapedine: non è un combattente. «LA CASA HA GIÀ '
                 'PARLATO» (D2 esatta): nominare Ada davanti a lui lo paralizza — rimuovetelo '
                 'dal gioco (crolla in ginocchio).',
         hook='La denuncia dell’Archivio (Referto, L3): sapete della parete tirata su nel 1879 — '
              'riconoscete il trave manomesso, niente prova sulla trappola.',
         cerca='Sotto il letto, la valigia di Ada mai partita: dentro, le sue scarpe. La prova '
               'che non è mai «abbandonata» nessuno.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='IL SOTTOSCALA', exits={'S': 'T4', 'N': 'T6'},
         testo='Lo stretto sottoscala che scende alla cantina: è da qui che il muratore è '
               'entrato, dal deposito attiguo. Odore di calcina fresca e di polvere. QUANDO '
               'RIVELATE QUESTA TESSERA: 2 garzoni del Muratore (Sgherri) sbarrano il passo — '
               'gli hanno detto di non far entrare nessuno.',
         arbitro='Ultimo diaframma prima dell’intercapedine. I garzoni non sono cattivi: sono '
                 'ragazzi pagati che non sanno cosa c’è nel muro. Abbatterli o passarli è uguale: '
                 'l’importante è arrivare in tempo di sopra.',
         cerca_vuoto='Sacchi di calce, secchi, e i calcinacci freschi di chi ha già cominciato a '
                     'buttare giù. Il tempo stringe: sentite la mazza, vicinissima ora.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='L’INTERCAPEDINE', exits={'S': 'T5'},
         testo='La camera, di nuovo, dal lato del vano: la parete doppia è già scrostata, e IL '
               'MURATORE, Bortolo, cala la mazza sul muro che ricorda. Dietro l’intonaco che '
               'cade, il pallore di ciò che resta di Ada. QUANDO RIVELATE QUESTA TESSERA: '
               'la corsa si decide qui.',
         arbitro='CORSA A DUE TRACCE. DEMOLIZIONE: ogni turno del Muratore in cui NESSUN eroe '
                 'gli è adiacente, +2 alla traccia (cala la mazza); inchiodato, attacca invece. '
                 'Le carte crescendo fanno +1 Demolizione. PROVA: fino a due eroi '
                 'all’intercapedine possono Interagire per documentare (+1 ciascuno; +2 con la '
                 'Macchina Fotografica). VITTORIA: traccia PROVA piena prima della DEMOLIZIONE. '
                 'Abbattere il Muratore ferma del tutto la demolizione (seconda via, non '
                 'obbligatoria).',
         cerca_vuoto='Non c’è niente da cercare qui: c’è solo da fotografare, in fretta, prima '
                     'che il muro finisca di cadere. Un lampo, e Ada torna alla luce.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_10 = [
    dict(nome='IL MURATORE', att=3, dif=8, fer=5, mov=3, dan=3, boss=True,
         tipo='Il Bruto della Calce (Boss)', art='Il Muratore.png',
         note='DEMOLISCE: ogni turno non inchiodato all’intercapedine, +2 alla traccia '
              'Demolizione invece di attaccare; inchiodato (un eroe adiacente), attacca. Nessuna '
              'debolezza-oggetto. «La casa ha già parlato» (D2 esatta): salta il primo colpo di '
              'demolizione. Ai tavoli da 2-3 eroi non recupera mai ferite (regola delle taglie).',
         bio_bestiario='Bortolo «Malta» Sassi non è un assassino: è un muratore con tre figli e '
              'una colpa vecchia di dieci anni, quando per denaro chiuse un vano e non fece '
              'domande. Ora lo stesso uomo che lo pagò allora lo ricatta perché torni a '
              'demolire e portar via ciò che murò. Non odia nessuno, non gode di niente: cala la '
              'mazza sul muro come chi butta giù il proprio passato, perché ha più paura del '
              'vivo che lo ricatta che della morta che ha sepolto. Bruto e tenace (Fer 5, Danno '
              '3), ma lento (Mov 3): non insegue: DEMOLISCE. Tenetelo inchiodato mentre gli '
              'altri fotografano, o abbattetelo per fermare del tutto la mazza. E se sapete '
              'nominare Ada e dirgli che la casa ha già parlato, esiterà — perché una parte di '
              'lui aspetta da dieci anni che qualcuno lo fermi. Ai tavoli da 2-3 eroi non '
              'recupera mai ferite (regola delle taglie).'),
    dict(nome='IL VEDOVO', att=1, dif=7, fer=2, mov=3, dan=1, boss=False,
         tipo='Il Colpevole Disperato', art='Il Vedovo.png',
         note='Appare in T4. Nemico minore: intralcia chi va verso l’intercapedine, non è un '
              'combattente. «La casa ha già parlato» (D2 esatta): nominare Ada lo paralizza — '
              'rimosso dal gioco.',
         bio_bestiario='Corrado Malfanti, il vedovo risposato, entrato di nascosto nella sua '
              'stessa casa d’affitto per assistere alla cancellazione della sua colpa. Non ha '
              'più la freddezza di dieci anni fa: è un uomo che vede dieci anni di menzogna '
              'crollare con l’intonaco. Vi supplica, vi minaccia, vi si aggrappa — qualunque '
              'cosa pur di allontanarvi dal muro. Ma basta guardarlo in faccia e pronunciare il '
              'nome che ha murato — Ada — perché crolli: perché in fondo sapeva che una casa '
              'fatta con la sabbia dei pozzi non avrebbe taciuto per sempre.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 10 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 10')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la casa che ricorda')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_10.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 192*mm, W - 2*mx, 132*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11.5, leading=17, alignment=4))])
    seal(c, W - mx - 12*mm, H - 207*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la casa che ricorda, la Corte della Faenza, l’Archivio Civico, la Gendarmeria.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 10')
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
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 39.5*mm, '! Fornitura (8) chiude 20')
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 44.5*mm, '! Fotografo (9) chiude 21')

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
    doms = ['1. DOVE è murata la prima moglie? (attenzione: serve più di una conferma)',
            '2. CHI l’ha uccisa?',
            '3. QUANDO torna il Muratore a demolire? (attenzione: serve più di una conferma)',
            '4. COSA portate per fissare la prova?']
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
    c.setTitle('Ombre su Roccamora - Episodio 10 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 10 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'la casa che ricorda, mentre il muro cade')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 116*mm, W - 56*mm, 64*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (6 spawn, 8 insidie, 3 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '10/cards/</b>). Le 6 tessere dell’interno di casa sono in <b>Episodio '
                  '10/board/</b>. Questo NON è un dungeon: è una <b>corsa a due tracce</b>. '
                  'Tenete DUE segnalini su due piste (sul Tabellone o su carta): '
                  '<b>DEMOLIZIONE</b> (il Muratore abbatte il muro) e <b>PROVA</b> (voi '
                  'fotografate il corpo). Vince chi arriva in fondo per primo: PROVA piena = '
                  'vittoria; DEMOLIZIONE piena = il muro crolla, il corpo è macerie, sconfitta. '
                  'Le pagine seguenti sono le note per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 128*mm, W - 60*mm, 88*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le due tracce (fissate su carta, '
                  'lunghezza indicata dalla Soluzione):</b>', BODY),
        Paragraph('• <b>DEMOLIZIONE</b> sale ogni turno del Muratore in cui NESSUN eroe gli è '
                  'adiacente (cala la mazza) e a ogni carta crescendo (la casa trema). '
                  'Inchiodatelo — statevi adiacenti — e non demolisce: attacca voi. Se la traccia '
                  'si riempie, il muro crolla: sconfitta.', BODY),
        Paragraph('• <b>PROVA</b> sale quando un eroe, all’intercapedine (T6), spende un’azione '
                  'Interagire per documentare il corpo: +1, oppure <b>+2 con la Macchina '
                  'Fotografica</b> (la memoria effimera della casa diventa lastra permanente). '
                  'Riempitela prima della Demolizione: vittoria.', BODY),
        Paragraph('Abbattere il Muratore (bruto, Fer 5) ferma del tutto la demolizione: è la '
                  'seconda via, non obbligatoria. Il cuore tattico è inchiodarlo mentre gli '
                  'altri fotografano. La Pianta del Restauro salta T2, il Ritratto di Ada calma '
                  'le prove NERVI dei muri.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_10:
        art_file = TILE_ART_10[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'humble candlelit canal-side room.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_10[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_10.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 84*mm, W - 40*mm, 56*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 10</b>. In campo: i <b>garzoni del '
                  'Muratore</b> (Sgherri, pochi: non è un accerchiamento), <b>il Vedovo</b> '
                  '(Corrado, nemico minore, appare in T4 e intralcia — nominare Ada lo paralizza) '
                  'e <b>il Muratore</b> (il boss: è all’intercapedine, T6, e DEMOLISCE — se non '
                  'lo inchiodate, cala la mazza sul muro invece di attaccarvi). Nessun mostro: '
                  'l’orrore è la casa che ricorda. Vittoria: traccia PROVA piena (fotografate il '
                  'corpo) prima che la DEMOLIZIONE finisca. Ai tavoli da 2-3 eroi il Muratore '
                  '<b>non recupera mai ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_10())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_10():
    """Miniature dell'Episodio 10. I segnalini Canto sono qui i segnalini
    della CASA CHE TREMA (l'orologio dell'orrore che alimenta anche la
    Demolizione)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('GARZONI DEL MURATORE (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL MURATORE · IL VEDOVO', [('Il Muratore.png', 1), ('Il Vedovo.png', 1)]),
        ('LA CASA CHE TREMA (CANTO)', [('Il primo colpo di mazza.png', 1),
                                       ('La crepa si allarga.png', 1),
                                       ('Il muro geme.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 10 - Soluzione (non aprire)')

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
        '<b>Il caso.</b> Nella Corte della Faenza una casa d’affitto ristrutturata «parla»: la '
        'calce del restauro fu impastata con sabbia del Borgo delle Cisterne (Ep. 3), e i muri '
        'hanno registrato. Una voce detta un delitto di dieci anni fa: un uxoricidio archiviato '
        'come «abbandono del tetto coniugale».',
        '<b>La verità.</b> Corrado Malfanti strangolò la prima moglie Ada e la fece murare '
        'nell’intercapedine dal muratore Bortolo «Malta» Sassi, poi denunciò l’abbandono. Ora, '
        'sentendo la casa parlare, ricatta di nuovo Bortolo perché torni a demolire il muro e '
        'porti via il corpo prima che un magistrato lo senta. Sventare = FISSARE la prova '
        '(fotografare il corpo) prima che il muro crolli.',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è murata la prima moglie?</b> Nell’intercapedine dietro la parete della '
        'camera al primo piano — quella che detta (la voce nella casa + le vecchie piante '
        'dell’Archivio: serve più di una conferma). <i>Esatta:</i> andate dritti al vano — nel '
        '1° round non si pesca nessuna carta Minaccia. <i>Sbagliata:</i> cercate la parete a '
        'tentoni: 1 garzone appare in T1 alla rivelazione.',
        '<b>2. CHI l’ha uccisa?</b> Corrado Malfanti, il vedovo, archiviato come abbandono del '
        'tetto coniugale. <i>Esatta:</i> «La casa ha già parlato» — all’intercapedine potete '
        'nominare Ada al Muratore: demolire è inutile e gli aggiunge un’accusa di omicidio — '
        'salta il suo PRIMO colpo di demolizione (e, se lo incontrate, il Vedovo in T4 crolla, '
        'rimosso dal gioco). <i>Sbagliata:</i> nessun effetto.',
        '<b>3. QUANDO torna il Muratore a demolire?</b> Stanotte, prima dell’alba, '
        'nell’intervallo delle ronde, dalla cantina (il registro nel deposito + i vicini che '
        'sentirono i primi colpi: serve più di una conferma). <i>Esatta:</i> arrivate mentre '
        'comincia, non a demolizione avviata — la traccia DEMOLIZIONE parte da 0. '
        '<i>Sbagliata:</i> arrivate tardi, la mazza già batte: la Demolizione parte da 2.',
        '<b>4. COSA portate per fissare la prova?</b> LA MACCHINA FOTOGRAFICA (la Bottega del '
        'Fotografo, entro le 21). <i>Con la Macchina:</i> ogni documentazione all’intercapedine '
        'vale +2 alla traccia PROVA invece di +1 (il lampo al magnesio fissa una prova '
        'permanente). <i>Senza:</i> potete solo testimoniare a voce, +1 per volta e con una '
        'prova NERVI. <i>Esche:</i> la Fede di Rosa e il Ferro del Muratore. La Pianta del '
        'Restauro (Deposito) salta T2 e la sua trappola; il Ritratto di Ada (intercapedine) '
        'abbassa a Facile le prove NERVI dei muri.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano apertamente tre carte — la '
        'Testimonianza «La vicina di Ada» (L2), il Referto «La denuncia del 1879» (L3) e la '
        'Testimonianza «Il brigadiere» (L4). Senza nessuna delle tre, giudicate con elasticità '
        'una risposta «vicina» (es. «il vedovo, quello che denunciò l’abbandono»). La Domanda 2 '
        'non ha complicazione se sbagliata: si perde solo il vantaggio.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — la corsa alla demolizione', [
        '<b>Le due tracce (segnalini su carta o sul Tabellone):</b> DEMOLIZIONE lunga <b>12 '
        'caselle</b>, PROVA lunga <b>14 caselle</b>. La DEMOLIZIONE parte da 0 (Domanda 3 esatta) '
        'o da 2 (sbagliata). Vince chi riempie la sua traccia per primo: PROVA piena = vittoria; '
        'DEMOLIZIONE piena = il muro crolla, sconfitta.',
        '<b>Montaggio</b> (tessere in Episodio 10/board/, coperte tranne T1):<br/>'
        'T1 Ingresso (partenza, da Sud) → T2 Scala che Ripete → T3 Corridoio dei Nomi → T4 '
        'Camera che Detta (appare il Vedovo) → T5 Sottoscala (2 garzoni) → T6 Intercapedine (il '
        'Muratore demolisce). Con la Pianta del Restauro si salta T2 (e la sua trappola).',
        '<b>DEMOLIZIONE.</b> Finché siete in cammino (T1-T5), il muratore lavora dietro il muro: '
        '+1 alla traccia alla fine di ogni round. All’intercapedine (T6), ogni turno del '
        'Muratore in cui NESSUN eroe gli è adiacente vale +2 (cala la mazza); inchiodato, '
        'attacca voi e non demolisce. Ogni carta crescendo (la casa trema) fa +1 Demolizione, '
        'in più.',
        '<b>PROVA.</b> Solo a T6: fino a DUE eroi adiacenti al vano spendono Interagire per '
        'documentare (uno regge la lastra, uno il lampo) — ciascuno +1, o <b>+2 con la Macchina '
        'Fotografica</b>. Senza la Macchina, chi documenta prova prima NERVI (Media): se '
        'fallisce, l’orrore lo blocca, +0 quel turno (col Ritratto di Ada la prova è a Facile).',
        '<b>Il Muratore.</b> Boss bruto: Att +3, Dif 8, Fer 5, Mov 3, Danno 3. Non insegue: '
        'DEMOLISCE. Nessuna debolezza-oggetto. «La casa ha già parlato» (D2 esatta): salta il '
        'primo colpo di demolizione. Abbatterlo (Fer 5) ferma del tutto la mazza — poi '
        'fotografate con calma. Ai tavoli da 2-3 eroi non recupera mai ferite.',
        '<b>Il mazzo:</b> 21 carte (6 garzoni, 8 insidie NERVI, 3 crescendo, 4 eventi). Il Canto '
        'qui è LA CASA CHE TREMA: alla soglia (3) la casa è al colmo — ogni Fase Minaccia pesca '
        '1 carta in più, per sempre, e le crepe si allargano.',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se fissate la prova (traccia PROVA piena).</b> «Il '
        'lampo al magnesio acceca la stanza per un istante, e per quell’istante Ada Malfanti è '
        'di nuovo alla luce — dieci anni dopo, dietro un muro che l’ha ricordata quando nessun '
        'altro voleva. La lastra è impressa. All’alba la casa tacerà, placata; ma la fotografia '
        'resta, e nessun avvocato la fa svanire. Corrado Malfanti guarda il vano aperto senza '
        'più parole: la casa le ha dette tutte lui.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 10:</b> <i>«La città nuova è fatta coi materiali della '
        'vecchia. Chi sceglie i materiali sceglie che cosa la città ricorderà.»</i> '
        'Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Consegnare il vedovo.</b> Giustizia piena: il quartiere vi torna amico (un testimone '
        'in più nell’Episodio 11), ma la casa, placata dalla verità detta, tace per sempre.<br/>'
        '<b>Usare la casa come orecchio.</b> Le voci vecchie dei muri valgono un incrocio negli '
        'Episodi 11-12, ma il processo a Corrado salta per vizio di prova (l’avete usata, non '
        'consegnata): la Gendarmeria vi chiude una porta — un accesso in meno nell’Episodio '
        '11.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 10.',
        '<b>AGGANCIO.</b> Tra le voci dei muri, una recente e fuori posto — non di dieci anni fa, '
        'di ieri: un uomo che detta misure. «Dalla fontana al portico, quaranta passi. Segna.» '
        'Qualcuno sta misurando la città.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento).',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI10_DESC = {
    1: "La casa che ricorda è una modesta abitazione d'affitto della Corte "
       "della Faenza, appena ristrutturata: intonaco chiaro, odore di calce "
       "nuova. Di giorno pare una casa come le altre; di notte i muri "
       "sussurrano, e da una parete della camera al primo piano una voce "
       "detta, ostinata, sempre le stesse parole.",
    2: "La Corte della Faenza è un cortile di case popolari strette attorno a "
       "un pozzo, panni stesi e chiacchiere di ballatoio. Qui tutti sanno "
       "tutto di tutti — e nessuno ha mai davvero creduto che Ada Malfanti se "
       "ne fosse andata di sua volontà. La conoscono da sempre. La piangono "
       "ancora.",
    3: "L'Archivio Civico è un labirinto di scaffali e polvere: atti, "
       "licenze, denunce, piante catastali. Qui riposa, in un fascicolo del "
       "1879, la menzogna ufficiale su Ada — e, nelle piante dell'edificio, "
       "la prova muta di una parete tirata su l'anno stesso in cui sparì.",
    4: "La Gendarmeria di notte è mezza vuota: un piantone, un registro, le "
       "vecchie pratiche. Il brigadiere ricorda bene il caso Malfanti — lo "
       "ricorda come una delle tante cose chiuse troppo in fretta — e ha "
       "l'aria di chi aspettava da dieci anni qualcuno che gliene chiedesse "
       "conto.",
    5: "Il deposito del muratore è un antro di sacchi di calce, secchi e "
       "attrezzi. Bortolo Sassi ci vive dentro il suo terrore: un uomo "
       "onesto che dieci anni fa fece una cosa disonesta per denaro, e che "
       "stanotte è costretto a farne una peggiore per paura. Sul banco, il "
       "libro mastro racconta tutto a chi sa leggere.",
    6: "L'intercapedine non è un luogo dove si va: è un luogo che si "
       "raggiunge sapendo. Dietro la parete doppia della camera, in un vano "
       "largo quanto un uomo, c'è Ada — e la calce del Borgo, che le ha "
       "tenuto la voce per dieci anni. È l'unico posto della città dove una "
       "morta parla, e chiede solo di essere trovata.",
    7: "La casa di Corrado Malfanti è pulita, ordinata, borghese: la casa di "
       "chi ha ricostruito una vita sopra una tomba. Rosa, la seconda "
       "moglie, la tiene come uno specchio. Solo sul comò una cosa stona: la "
       "fede di Ada, lucidata e in mostra, il cimelio di un possesso che si "
       "spaccia per ricordo di un dolore.",
    8: "La fornitura del Borgo è un magazzino di materiali edili sull'orlo "
       "del quartiere dei pozzi: sabbia, pietra, calce. Da qui è partita la "
       "sabbia buona che ha dato voce alla casa — venduta a un privato che "
       "paga in anticipo, per lettera, e si firma con due sole lettere che "
       "il magazziniere non ha mai osato decifrare.",
    9: "La bottega del fotografo sa di collodio e di chimica: lastre, "
       "cavalletti, un fondale dipinto. Il fotografo crede nella sua arte "
       "come in una missione — che un giorno si condanneranno gli assassini "
       "con la luce, non con le chiacchiere — e stanotte vi presta la "
       "macchina e il lampo per provarlo.",
}

OGGETTI_LUOGO_10 = {
    5: ['La Pianta del Restauro', 'Il Ferro del Muratore'],
    6: ['Il Ritratto di Ada'],
    7: ['La Fede di Rosa'],
    9: ['La Macchina Fotografica'],
}

TILE_ART_10 = {t['id']: t['id'] + '-ep10.png' for t in TILES_10}
LUOGHI10_CROP = {}

TESSERE_DESC_10 = {
    'T1': "Il tinello dei coniugi Neri, abbandonato a metà cena: due sedie "
          "rovesciate, un piatto ancora pieno, una lampada che fuma. Dall'alto, "
          "regolare come un cuore malato, il tonfo di una mazza contro il muro. "
          "E, sotto quel tonfo, un sussurro che esce dall'intonaco fresco e non "
          "smette. La casa vi ha già visti entrare.",
    'T2': "La scala verso il primo piano è stretta e ripida, il legno nuovo "
          "sopra un'ossatura vecchia. A ogni gradino i muri rendono un frammento "
          "di una notte di dieci anni fa: una voce d'uomo che sale, dura; una di "
          "donna che prega, sotto. Il terzo gradino, se lo guardate, è di un "
          "legno diverso — più scuro, più molle.",
    'T3': "Il corridoio del primo piano è lungo e cieco, le porte delle stanze "
          "tutte serrate. Dai muri, come da tante bocche chiuse, salgono i nomi "
          "di chi ha dormito qui: vecchi, bambini, sposi. Uno torna più spesso "
          "degli altri, sillabato piano, quasi con tenerezza: «A-da». E se "
          "ascoltate troppo, tra quei nomi, sentite il vostro.",
    'T4': "La camera al primo piano: il letto disfatto dei Neri, la finestra "
          "sbarrata, e la parete cieca verso la corte — quella che detta. Qui la "
          "voce non sussurra: recita, nitida, il come e il quando. E in un "
          "angolo, rannicchiato, un uomo in cappotto buono che non doveva essere "
          "qui: vi guarda con gli occhi di chi ha appena visto crollare dieci "
          "anni di menzogne.",
    'T5': "Il sottoscala scende alla cantina in un budello di mattoni umidi: è "
          "da qui che il muratore è entrato, dal deposito che dà sul retro. "
          "L'aria è densa di calcina fresca e di polvere di calce. Due ragazzi "
          "in grembiule da manovale vi sbarrano il passo, a disagio: gli hanno "
          "detto di non far salire nessuno, e basta.",
    'T6': "La camera, di nuovo, ma dal lato del vano: l'intonaco è già a terra a "
          "chiazze, e nella parete aperta si intravede il pallore di ciò che "
          "dieci anni di calce hanno conservato di una donna. Sopra, enorme "
          "nella luce della lanterna, il Muratore alza di nuovo la mazza. Ogni "
          "colpo si porta via un pezzo di verità. Avete pochi lampi.",
}

ESAMI_CARBONE_10 = {
    'LA DENUNCIA DI ABBANDONO': '«La data è di quattro giorni dopo la scomparsa, la mano è '
                'quella del marito, l’inchiostro fu premuto forte come chi recita: nessuno '
                'denuncia così in fretta un abbandono che spera passeggero. Si denuncia così in '
                'fretta solo ciò che si è già fatto sparire. Corrado non cercava Ada: la stava '
                'dichiarando sparita perché sapeva che non sarebbe tornata.»',
    'LA COMMESSA DEL FORNITORE': '«Carta di pregio, filigrana della cartiera dei casi passati; '
                'la sabbia del Borgo pagata prima ancora di essere cavata; la firma è un '
                'ricciolo solo, “C.B.”. Chi sceglie i materiali sceglie che cosa la città '
                'ricorderà — e qualcuno sta comprando i muri di mezza Roccamora. La casa che '
                'parla non è un caso: è il primo esperimento.»',
    'IL RITRATTO DI ADA': '«Un dagherrotipo di dieci anni fa, un po’ velato: una giovane donna '
                'che ride nella corte, viva. Tenetelo davanti agli occhi mentre la casa parla, e '
                'la voce nel muro smette di essere un orrore e torna a essere una persona. Non è '
                'un talismano: è pietà. Ma la pietà, qui dentro, è ciò che vi tiene lucidi.»',
}

OGGETTI_TESSERA_10 = {'T3': ['Una Lanterna a Olio']}


def luoghi():
    """Luoghi.pdf Episodio 10 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'humble candlelit canal-side room.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 10 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_10, 'Episodio 10')

    def oggetto_righe(n):
        return ['<b>Oggetto</b> — carta “' + t + '”' for t in OGGETTI_LUOGO_10.get(n, [])]

    for L in LUOGHI_10:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI10_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI10_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_10)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_10
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL MURATORE', 'IL VEDOVO', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 10')
    print('OK episodio 10')
