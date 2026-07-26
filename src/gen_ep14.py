# -*- coding: utf-8 -*-
"""Ombre su Roccamora - EPISODIO 14: Il rivale (Episodio 14/pdf/).

Fase B del piano (vedi DESIGN-EPISODIO-14.md e CAMPAGNA-EPISODI.md). Atto III,
standalone che si rivela collegato: il seme dell'Ep. 13 ha un nome, il
professor Cesare Braga (rivale storico di M., iniziali C.B.). Braga denuncia
un furto — sparite le sue lastre fonografiche — ma la refurtiva torna con
qualcosa IN PIÙ: oggetti-intrusi che arredano la sua colpevolezza. È M. che
prepara il falso smascheramento dell'Ep. 15. Spedizione: i tetti del Corso,
l'attico dei Gatti, per prendere il PRIMO GATTO e fargli dire cosa gli è stato
ordinato di LASCIARE. Boss: il Primo Gatto (tratta a 1 Ferita: onore di ladro).
Un solo seme: il Sigillo «C.B.» a verbale d'inventario.

Varietà strutturale (regola 2026-07-18): l'episodio È un'esca (nessun
colpevole da catturare); finale-tipo «negoziato col boss» (il Primo Gatto
sceglie di parlare). Riuso della regola in quota dell'Ep. 11 (i tetti) come
LOCALE, non come finale. Torsione d'indagine: «l'inventario al contrario»
(si cerca ciò che è tornato IN PIÙ, non ciò che manca).

Genera: Indagine.pdf, Spedizione.pdf, Soluzione (non aprire).pdf,
Bestiario.pdf, Luoghi.pdf (placeholder finche' manca l'arte, Fase D).

Fonte autoritativa lato Python; le carte fisiche vivono in
scripts/cardconjurer/cards-data.js, blocco EPISODIO 14.
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

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Episodio 14', 'pdf')
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

LETTERA_14 = (
    "Alla Società del Lume, riservata.<br/><br/>"
    "«Il professor Cesare Braga — il nostro rivale di trent’anni, i guanti bianchi, le iniziali "
    "<b>C.B.</b> — ha denunciato un furto: sparite le sue <b>lastre fonografiche</b>, le voci dei "
    "criminali celebri. Rifiutare il caso sarebbe confessare che lo temiamo. Accettatelo. Ma "
    "mentre indagate, la refurtiva <b>rientra</b> quasi tutta, lasciata sotto un portone: e qui "
    "comincia il vero caso.<br/><br/>"
    "Andate da Braga, e <b>contate</b>. Non ciò che manca: ciò che c’è. Un ladro porta via; chi "
    "vuole ingannarvi <b>lascia</b>. Guardate cosa è tornato <i>in più</i> nelle sue casse — un "
    "sigillo, delle ricevute, dei mezzi appunti che lui giura di non aver mai posseduto — e "
    "chiedetevi a chi conviene che Braga possieda proprio quello. Poi salite ai tetti e "
    "prendetemi il <b>Primo Gatto</b>: non per la refurtiva, per fargli dire cosa gli hanno "
    "ordinato di <b>lasciare</b>. Avete <b>6 ore</b>, dalle 18:00 alle 24:00.<br/>"
    "— M., presidente della Società»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: la Villa-Museo di Braga, la Gazzetta di Roccamora, il "
    "Banco dei Pegni e la Gendarmeria. Gli altri andranno sbloccati; l’Attico e il Covo dei Gatti "
    "sono in quota (sui tetti).</i>")

# Chiavi LETTERALI negli indizi, tutte da luoghi APERTI (L1-L4), doppia via:
# «le lastre sparite» (L1+L4), «il duello di trent’anni» (L1+L2),
# «i gatti sui tetti» (L2+L3), «la refurtiva tornata» (L3+L4).
# Rivelatorio (D2) su L1, L2, L4.
LUOGHI_14 = [
    dict(n=1, nome='LA VILLA-MUSEO DI BRAGA', voce_mappa='La Villa-Museo di Braga',
         req='Disponibile dall’inizio', art='La Villa-Museo di Braga.png',
         chiude=None,
         indizi=[
             'Il professor Braga vi riceve coi guanti bianchi, cortese e velenoso: «le lastre '
             'sparite erano il vanto della mia criminologia, signori — le voci vere dei mostri, '
             'incise. Un furto sui tetti, mano di professionisti. Che il vostro presidente e io ci '
             'detestiamo da trent’anni non c’entra: un gentiluomo derubato è un gentiluomo '
             'derubato.»',
             'La collezione ha un catalogo firmato, meticoloso, di suo pugno: ogni lastra, '
             'ogni cimelio, numerato. «Confrontate pure con ciò che è tornato: io non tocco '
             'nulla finché la Gendarmeria non verbalizza. I guanti, sa: l’igiene prima di '
             'tutto.»',
             'Nel salone, tra i cimeli, il duello di trent’anni con M. è ovunque: ritagli, lettere '
             'al vetriolo, due scuole del delitto che si odiano. «Il duello di trent’anni ci ha '
             'reso famosi entrambi. Ma io non rubo a lui, e lui — spero — non ruba a me.»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il professor Braga',
                  testo='«Ve lo dico da criminologo, non da derubato: guardate cosa manca, sì, ma '
                        'guardate meglio cosa <i>resta</i>. Un ladro professionista che restituisce '
                        'è una contraddizione in termini. O il colpo è fallito — e non pare — o non '
                        'era un furto: era un pretesto per <i>mettermi in casa</i> qualcosa. Io ho i '
                        'guanti da quarant’anni proprio per non lasciare traccia. Qualcuno vuole che '
                        'ne lasci una. Chiedetevi chi, tra quelli che mi conoscono da una vita.»'),
         ]),
    dict(n=2, nome='LA GAZZETTA DI ROCCAMORA', voce_mappa='La Gazzetta di Roccamora',
         req='Disponibile dall’inizio', art='Gazzetta di Roccamora.png',
         chiude=None,
         indizi=[
             'Il cronista Ranuzzi si frega le mani: «il duello di trent’anni tra il vostro '
             'presidente e Braga è oro per me. E ora il furto! I lettori impazziscono. Ma se '
             'volete un consiglio da chi campa di indiscrezioni: il colpo l’hanno fatto i gatti '
             'sui tetti, non un rivale in guanti bianchi.»',
             'Negli archivi della Gazzetta, i ritagli sui furti in quota degli ultimi anni: '
             'sempre la stessa firma. «I gatti sui tetti, la banda del Corso. Camminano sulle '
             'grondaie come niente. Se la refurtiva è passata di lì, è passata dal loro attico.»',
             'Ranuzzi, abbassando la voce: «lo sa cosa non torna? Che stavolta la refurtiva è '
             'tornata. I gatti non restituiscono mai. Se l’hanno fatto, è perché qualcuno li ha '
             'pagati per fare un giro strano: prendere, e riportare. Chi paga un furto per non '
             'tenersi la refurtiva?»'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il cronista Ranuzzi',
                  testo='«Fiuto le storie, e questa puzza. Due criminologi rivali, un furto che '
                        'torna indietro, e la città che non aspetta altro che vedere uno dei due '
                        'nel fango. Se fossi in voi mi chiederei non chi ha rubato — quello lo so '
                        'io, i gatti del Corso — ma chi VUOLE questa storia sui giornali. Perché '
                        'una storia così non nasce da sola: qualcuno la sta scrivendo, e la scrive '
                        'perché finisca su Braga.»'),
         ]),
    dict(n=3, nome='IL BANCO DEI PEGNI', voce_mappa='Il Banco dei Pegni di Fossa',
         req='Disponibile dall’inizio', art='Banco dei Pegni.png',
         chiude=None,
         indizi=[
             'Al Banco dei Pegni è passata parte della refurtiva prima di rientrare: «una lastra '
             'sola, impegnata e poi ritirata da uno dei gatti sui tetti. Il resto no — il resto è '
             'tornato tutto al professore, intero. Strano: di solito la roba dei gatti la vediamo '
             'a pezzi.»',
             'Il registro dei pegni segna quella lastra e chi l’ha impegnata.',
             'Il gestore, prudente: «la refurtiva tornata è tornata pulita, imballata con cura. '
             'Non è roba impegnata e riscattata: è roba <i>preparata</i>. Chi l’ha resa voleva che '
             'arrivasse in ordine, come un regalo. Coi gatti, un regalo si paga caro.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La refurtiva imballata',
                  testo='La refurtiva che passa da un banco dei pegni è merce da svendere, sporca e '
                        'a lotti. Questa no: è tornata inventariata, pulita, quasi catalogata — come '
                        'se qualcuno avesse voluto che la Gendarmeria la trovasse in perfetto '
                        'ordine, per poterla verbalizzare comodamente. Un ladro non imballa la '
                        'refurtiva. Un regista sì.'),
         ]),
    dict(n=4, nome='LA GENDARMERIA', voce_mappa='La Gendarmeria',
         req='Disponibile dall’inizio', art='La Gendarmeria.png',
         chiude=None,
         indizi=[
             'Alla Gendarmeria giace la denuncia di Braga e il primo verbale delle lastre sparite: '
             '«furto sui tetti, refurtiva parzialmente rientrata. Caso quasi chiuso, a dire il '
             'vero. Manca solo l’inventario di restituzione, che stiamo compilando.»',
             'Il maresciallo mostra l’elenco: «le lastre sparite erano dodici; ne sono tornate '
             'dodici. Ma nelle casse c’è dell’altro — roba che non è sull’inventario del furto. Un '
             'sigillo, delle ricevute. Il professore giura di non averle mai viste.»',
             'Sull’ultima pagina, appuntato di fretta: «la refurtiva tornata contiene più oggetti '
             'di quanti ne risultino rubati. Da verbalizzare a parte.» Il maresciallo scrolla le '
             'spalle: «burocrazia. Qualcuno avrà fatto confusione.» Non è confusione.'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’inventario che non torna',
                  testo='Il verbale è impietoso nella sua noia: colonna «sottratto», dodici voci; '
                        'colonna «restituito», quindici. Tre righe in più. Nessun ladro al mondo '
                        'restituisce di più di quanto ha preso. Quelle tre righe — un sigillo con '
                        'le iniziali di Braga, due ricevute intestate a lui — non sono refurtiva: '
                        'sono un impianto. Qualcuno sta costruendo, riga per riga d’inventario, la '
                        'colpevolezza del professore. E lo fa perché quelle righe finiscano agli '
                        'atti.'),
         ]),
    dict(n=5, nome='IL RICETTATORE', voce_mappa='Il Ricettatore',
         req='La bottega del ricettatore apre solo di notte, e solo a chi sa nominare la stranezza '
             'che gira in città: la refurtiva che, invece di sparire, è tornata.',
         chiave=('parola', 'LA REFURTIVA TORNATA'), art='Il Ricettatore.png',
         chiude=22,
         indizi=[
             'Il ricettatore ha smistato lui i pacchi rientrati, su commissione: «mi hanno pagato '
             'per <i>rendere</i>, non per comprare. Prima volta in vita mia. Imballa, metti dentro '
             'questo e questo, lascia sotto il portone del professore. Roba non sua, capisce? Me '
             'l’hanno data loro, da mettere dentro.»',
             'Tiene copia del verbale di restituzione, l’elenco di ciò che è uscito dalle sue '
             'mani:. «Il sigillo con le iniziali C.B. l’ho aggiunto io, sì. Non l’ho fatto '
             'io: me l’hanno dato già fatto.»',
             'Chi l’ha pagato? «Un intermediario. Mai visto in faccia. Oro d’antica fusione e '
             'ricevute su carta di pregio, di quella col giglio. Gente che sa quello che fa. Io '
             'non faccio domande a chi paga in oro vecchio.»'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Il furto al contrario',
                  testo='Un ricettatore pagato per <i>restituire</i> è il mondo alla rovescia: non '
                        'esiste, non deve esistere. Eppure eccolo, con in tasca l’elenco di ciò che '
                        'ha rimesso nelle casse di Braga — più di quanto ne fosse uscito. Chi ha '
                        'ordinato questo non voleva la refurtiva né il denaro: voleva usare i ladri '
                        'come corrieri della colpa, e un ricettatore come sarto. L’oro vecchio e la '
                        'carta col giglio dicono di chi è la mano. La stessa di sempre.'),
         ]),
    dict(n=6, nome='LO STUDIO DEL PERITO', voce_mappa='Lo Studio del Perito',
         req='Lo studio del vecchio perito rivale apre a chi conosce la faida accademica che lo '
             'rode: il duello di trent’anni tra le due scuole del delitto.',
         chiave=('parola', 'IL DUELLO DI TRENT’ANNI'), art='Lo Studio del Perito.png',
         chiude=None,
         indizi=[
             'Il perito Anselmo Coda odia Braga da una vita di congressi persi: «quel ciarlatano '
             'coi guanti! Il duello di trent’anni l’ho perso io, e lo sanno tutti. Se lo hanno '
             'derubato, brindo. Se lo impiccano, offro da bere.» Astio puro, non commissione.',
             'Tra le sue carte, una lettera livorosa in cui minaccia Braga di «smascherarlo '
             'pubblicamente».',
             'Coda, sbottando: «pensate che sia stato io? Magari! Ma io scrivo velenoso, non pago '
             'ladri. Chi ha orchestrato questa storia ha oro e uomini sui tetti. Io ho solo bile e '
             'una cattedra di provincia. Cercate qualcuno che possa <i>permettersi</i> Braga.»'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='Il rivale che non c’entra',
                  testo='Coda è l’esca perfetta: movente enorme, astio autentico, una lettera che '
                        'sembra una confessione. Ma un movente non è una mano. Chi ha comprato i '
                        'gatti, pagato un ricettatore e falsificato un sigillo ha risorse e freddezza '
                        'che a un perito invidioso mancano del tutto. La rabbia di Coda è vera e '
                        'inutile: serve solo a farvi perdere una notte guardando dalla parte '
                        'sbagliata. Come è stata messa lì apposta.'),
         ]),
    dict(n=7, nome='IL FALDONE D’INVENTARIO', voce_mappa='L’Archivio della Gendarmeria',
         req='L’archivio della Gendarmeria tira fuori il faldone giusto solo a chi sa esattamente '
             'cosa cercare: le lastre sparite, e ciò che è tornato al loro posto.',
         chiave=('parola', 'LE LASTRE SPARITE'), art='L’Archivio della Gendarmeria.png',
         chiude=None,
         indizi=[
             'Nel faldone, il verbale d’inventario definitivo: le lastre sparite, la '
             'refurtiva restituita, e le tre righe in più. È qui che il Sigillo «C.B.» '
             'finisce agli atti — il SEME, la prima pietra del falso.',
             'Il Sigillo con le iniziali di Braga è repertato e fotografato: qui c’è solo la '
             'sua scheda. «Trovato nelle casse restituite. Il professore ne disconosce la '
             'proprietà.» Un disconoscimento che, agli atti, pesa poco.',
             'L’archivista, a disagio: «una volta che una cosa è a verbale, esiste. Anche se è '
             'falsa. Se domani qualcuno vuol provare che Braga possedeva quel sigillo, gli basta '
             'questo faldone. Chi ha messo il sigillo nelle casse sapeva che sarebbe finito qui. '
             'Contava su di noi.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='La prima pietra del falso',
                  testo='Il Verbale d’Inventario è il capolavoro involontario del falsario: non ha '
                        'dovuto corrompere nessun gendarme, gli è bastato far trovare gli oggetti '
                        'giusti e lasciare che la burocrazia li rendesse reali. Il Sigillo «C.B.» è '
                        'ora un fatto agli atti: quando, tra qualche giorno, arriverà un dossier che '
                        'accusa Braga, questo faldone sarà la sua prima conferma. È così che si '
                        'costruisce un colpevole: non con una bugia, ma con una serie di verità '
                        'piccole e vere, messe dove servono.'),
         ]),
    dict(n=8, nome='IL COVO DEI GATTI', voce_mappa='Il Covo dei Gatti',
         req='Il covo dei ladri di grondaia non si trova per strada: ci si arriva sapendo dove '
             'passano, chi lavora in quota — i gatti sui tetti del Corso.',
         chiave=('parola', 'I GATTI SUI TETTI'), art='Il Covo dei Gatti.png',
         chiude=None,
         indizi=[
             'Il covo dei Gatti del Corso, un sottotetto pieno di funi, ramponi, attrezzi da '
             'quota. Qui preparano i colpi; qui hanno «lavorato» la refurtiva prima di '
             'renderla.',
             'Sul muro, inciso, il segno dei Gatti: la loro parola di riconoscimento, quella '
             'che ci si scambia sui tetti per non spararsi al buio.',
             'In un angolo, una delle lastre fonografiche, dimenticata o tenuta da parte: Sul '
             'bordo, un graffio fresco, di chi l’ha maneggiata con guanti che non erano di '
             'Braga.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='La parola dei tetti',
                  testo='I Gatti del Corso hanno un codice più vecchio di loro: chi conosce la '
                        'parola dei tetti è gente di rispetto, non un gendarme travestito. '
                        'Presentarla al Primo Gatto non è una minaccia — è un salvacondotto. Un re '
                        'dei tetti non parla sotto tortura, ma parla volentieri con chi tratta da '
                        'pari. E stanotte ha una cosa che gli pesa in tasca: un lavoro sbagliato, '
                        'di quelli che a un ladro d’onore lasciano l’amaro. Datele voce, quella '
                        'parola, e lui vi darà la sua.'),
         ]),
    dict(n=9, nome='L’ATTICO DEL CORSO', voce_mappa='L’Attico del Corso',
         req='L’attico dove i Gatti tengono il bottino è in cima ai tetti del Corso: ci si arriva '
             'solo sapendo che lassù lavorano loro, i gatti sui tetti.',
         chiave=('parola', 'I GATTI SUI TETTI'), art='L’Attico del Corso.png',
         chiude=None, in_quota=True,
         indizi=[
             'L’Attico del Corso, in cima ai tetti: la refurtiva accatastata e pronta, imballata '
             'con cura per la restituzione. È da qui che i pacchi sono scesi in strada, arredati '
             'del «di più». Qui vi aspetta, o vi sfugge, il Primo Gatto.',
             'Tra la refurtiva, il pezzo che non torna: un sigillo di ceralacca con le '
             'iniziali «C.B.», identico per foggia ai sigilli di ogni scatola vuota della '
             'campagna. Non è di Braga: è stato aggiunto.',
             'Il Primo Gatto, Berto detto lo Spillo, vi studia dalla cresta del tetto: agile, '
             'ironico, pronto a sparire nel vuoto. Non è un assassino — è un ladro d’onore a cui '
             'stanotte hanno fatto fare un lavoro che non gli è piaciuto.'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Lo Spillo, sulla cresta',
                  testo='«Di solito ci pagano per portar via, signori. Stavolta metà oro era per '
                        '<i>lasciare</i>: roba non sua, da mettere nelle casse del professore con '
                        'cura, dove i vostri gendarmi l’avrebbero pescata. Non so chi paga — oro '
                        'vecchio, un intermediario mai visto, ricevute su carta col giglio. Ma so '
                        'una cosa: chi ordina un furto per <i>arredare</i> una casa d’altri non '
                        'vuole rubare. Vuole che quell’uomo sia colpevole. E per farlo bene, lo '
                        'conosce da una vita.»'),
         ]),
]

# Tessere dei tetti (percorso lineare a 6: una scalata in quota, non un
# labirinto). Obiettivo = agganciare il Primo Gatto all'Attico (T6) e farlo
# TRATTARE prima che sparisca (FUGA, soglia-Canto). Boss: il Primo Gatto.
TILES_14 = [
    dict(id='T1', nome='LA GRONDA', exits={'N': 'T2'}, start='S',
         testo='La gronda del Corso, di notte: la città in basso, il vuoto sotto i piedi, la via '
               'dei Gatti che sale di tetto in tetto. QUANDO RIVELATE QUESTA TESSERA: applicate '
               'l’esito delle Domande 3 e 4. Coi Ramponi saltate lo strapiombo di partenza (e la '
               'sua caduta).',
         arbitro='STRAPIOMBO: senza i Ramponi, il primo salto è una prova VIGORE/DESTREZZA (Media); chi '
                 'fallisce perde un round aggrappato e la FUGA avanza. Coi Ramponi passate senza '
                 'prova. Da qui il pericolo non sono solo i Gatti: è la quota, il vuoto, il vetro.',
         hook='I Ramponi (dal Covo): sui tetti le cadute non vi feriscono, saltate lo strapiombo.',
         cerca_vuoto='Solo tegole e il respiro della città sotto. La gronda è stata '
                     'rifatta di recente: coppi nuovi, malta fresca, nemmeno un nido.',
         arredi=[(0, 3, 'casse'), (3, 0, 'casse')]),
    dict(id='T2', nome='IL COMIGNOLO', exits={'S': 'T1', 'N': 'T3'},
         testo='Un passaggio esposto attorno a un comignolo annerito, la grondaia che scricchiola, '
               'il vuoto della via a picco. QUANDO RIVELATE QUESTA TESSERA: pericolo di quota — chi '
               'passa prova DESTREZZA o NERVI (Media); chi fallisce resta un round aggrappato e la '
               'FUGA avanza.',
         arbitro='PERICOLO DI QUOTA (comignolo): non ci sono nemici stanziali, c’è il vuoto. Prova '
                 'DESTREZZA/NERVI per il passaggio. Coi Ramponi la caduta non vi ferisce e non '
                 'perdete il round.',
         cerca_vuoto='Fuliggine e il vento che tira. Il comignolo è liscio di '
                     'intemperie e nella grondaia non c’è che acqua vecchia e foglie '
                     'marce.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='LA TERRAZZA DEI PANNI', exits={'S': 'T2', 'N': 'T4'},
         testo='Una terrazza con lenzuola stese ad asciugare, ombre che si muovono tra i panni. '
               'QUANDO RIVELATE QUESTA TESSERA: i Gatti minori vi tagliano la strada, colpiscono e '
               'scappano tra le lenzuola.',
         arbitro='I Gatti minori (Sgherri ritematizzati) sono qui: agili, colpiscono e si '
                 'spostano. Le lenzuola danno copertura a loro come a voi. Passare in fretta è '
                 'meglio che inseguirli tra i panni (la FUGA avanza mentre perdete tempo).',
         cerca='Tra i panni, una fune leggera dimenticata (utile: alla prossima prova di quota, '
               'chi la porta la supera senza tirare — un tetto in più al sicuro).',
         arredi=[(0, 1, 'casse'), (3, 2, 'casse')]),
    dict(id='T4', nome='L’ABBAINO', exits={'S': 'T3', 'N': 'T5'},
         testo='Un abbaino sporgente, mezzo aperto sul buio della soffitta. QUANDO RIVELATE QUESTA '
               'TESSERA: il Primo Gatto appare in cresta, più in alto, e vi studia in silenzio. Da '
               'ora comincia il conto alla rovescia della FUGA.',
         arbitro='IL PRIMO GATTO appare (non ancora ingaggiabile): da qui le carte crescendo '
                 'spingono la traccia FUGA. Se la FUGA raggiunge la soglia prima che lo agganciate '
                 'all’Attico (T6), sparisce oltre i tetti (vittoria parziale). La Parola dei Tetti '
                 'abbassa la soglia d’ingaggio (vi lascia avvicinare).',
         hook='La Parola dei Tetti (dal Covo): il Primo Gatto vi riconosce come gente di codice — '
              'tratta già a 2 Ferite e non tenta la fuga finale.',
         cerca_vuoto='L’abbaino dà su una soffitta buia che sa di legno chiuso. Sul '
                     'davanzale, guano e vetri rotti da tempo: questa finestra non la '
                     'apre più nessuno.',
         arredi=[(1, 2, 'casse'), (2, 0, 'altare')]),
    dict(id='T5', nome='IL LUCERNARIO', exits={'S': 'T4', 'N': 'T6'},
         testo='Un grande lucernario di vetro e piombo, opaco di sporco, che cede sotto il peso. '
               'QUANDO RIVELATE QUESTA TESSERA: ultimo diaframma prima dell’Attico; il vetro è una '
               'trappola, e i Gatti lo sanno bene.',
         arbitro='PERICOLO DI QUOTA (lucernario): attraversarlo è una prova VIGORE/DESTREZZA '
                 '(Media); chi fallisce sfonda un vetro — 1 danno e la FUGA avanza. Coi Ramponi (o '
                 'la fune da T3) niente danno. Aggirarlo sul bordo costa un round.',
         cerca_vuoto='Vetro e piombo sotto i piedi, e la propria faccia riflessa nel '
                     'buio. Il telaio è saldato dallo sporco di decenni: non si apre, e '
                     'sotto non si vede niente.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T6', nome='L’ATTICO DEL CORSO', exits={'S': 'T5'},
         testo='L’attico dei Gatti, la refurtiva accatastata e imballata, il cielo aperto sulla '
               'cresta. IL PRIMO GATTO è qui, tra voi e la verità. QUANDO RIVELATE QUESTA TESSERA: '
               'lo si aggancia e lo si fa parlare — prima che scavalchi la cresta e sparisca.',
         arbitro='OBIETTIVO. Agganciare il Primo Gatto (adiacenza + Interagire, o la Parola dei '
                 'Tetti). Ridotto all’ultima Ferita TRATTA: dice della commissione cieca e — la '
                 'riga d’oro — che gli hanno ordinato di LASCIARE roba (vittoria piena). Ucciderlo '
                 '(0 Ferite senza la Parola) o lasciarlo fuggire = vittoria parziale. «La '
                 'commissione era cieca» (D2): gli salta un attacco.',
         cerca_vuoto='Casse imballate, corde, etichette scritte a mano in una lingua di '
                     'comodo. Roba d’altri, tutta quanta, e troppo grossa per '
                     'portarsela sui tetti.',
         arredi=[(0, 2, 'casse')]),
]

# Nemici (statistiche - fonte per Bestiario e simulatore).
NEMICI_14 = [
    dict(nome='IL PRIMO GATTO', att=3, dif=8, fer=6, mov=4, dan=1, boss=True,
         tipo='Il Re dei Tetti (Boss)', art='Il Primo Gatto.png',
         note='Nessuna debolezza-oggetto (è un uomo). «La Parola dei Tetti» (D4): mostrandogli il '
              'segno dei Gatti tratta già a 2 Ferite e non tenta la fuga finale. «La commissione '
              'era cieca» (D2 esatta): sapere che nessuno ha visto il mandante gli toglie la leva '
              '— salta un attacco. Ridotto all’ultima Ferita TRATTA (non muore): dice la verità '
              'sulla commissione. Ucciderlo perde la sua parola. Ai tavoli da 2-3 eroi non recupera '
              'mai Ferite (regola delle taglie).',
         bio_bestiario='Berto detto lo Spillo è il re dei tetti del Corso: cammina sulle grondaie '
              'come voi sul pavimento, e ruba da vent’anni senza aver mai fatto male a nessuno. Non '
              'è un assassino né un cultista: è un ladro d’onore, con un codice più vecchio di lui. '
              'Agilissimo (Mov 4) e sfuggente, in combattimento cerca la fuga più che il colpo '
              '(Danno 1): il suo regno è il vuoto, e lassù nessuno lo prende se non vuole farsi '
              'prendere. Stanotte, però, ha in tasca un lavoro che gli pesa: l’hanno pagato per '
              'restituire, non per rubare, e a un ladro d’orgoglio questo brucia. Ridotto all’ultima '
              'Ferita non crolla: si siede sul comignolo e TRATTA, perché parlare con chi conosce '
              'la Parola dei Tetti non è tradire, è rispetto. Chi gli mostra il segno lo trova '
              'disposto già prima; chi invece lo mette all’angolo e lo uccide si porta a casa un '
              'cadavere e nessuna verità. Ai tavoli da 2-3 eroi non recupera mai ferite (regola '
              'delle taglie). Non è il colpevole: è l’unico testimone di un colpevole che nessuno, '
              'stanotte, può ancora vedere.'),
]


# ================================================================ INDAGINE

def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 14 - Indagine')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'episodio 14')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'il rivale')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_14.replace(
        'Alla Società del Lume, riservata.',
        '<font name="%s" size="15" color="#7a1f2b">A</font>lla Società del Lume, riservata.' % F['sc'])
    frame_flow(c, mx, H - 196*mm, W - 2*mx, 136*mm,
               [Paragraph('lettera d’incarico — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 211*mm, r=13*mm, angle=-10)
    c.setFillColor(TEAL); c.setFont(F['i'], 9.5)
    c.drawCentredString(W/2, 18*mm, 'Chi tiene il fascicolo Luoghi ordina le 9 carte per numero (è nel titolo): aperte scoperte, le altre coperte.')
    c.drawCentredString(W/2, 12*mm, 'Aperti dall’inizio: la Villa-Museo di Braga, la Gazzetta di Roccamora, il Banco dei Pegni, la Gendarmeria.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — episodio 14')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita (6 ore). L’Attico e il Covo sono in quota (sui tetti).')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8)
    c.drawString(16*mm + 6*17*mm + 2*mm, H - 41.5*mm, '! Ricettatore (5) chiude 22')

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
    doms = ['1. DOVE è tornata la refurtiva prima di rientrare? (attenzione: serve più di una conferma)',
            '2. CHI ha eseguito il furto?',
            '3. COSA è tornato IN PIÙ? (attenzione: serve più di una conferma)',
            '4. COSA portate ai tetti?']
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
    c.setTitle('Ombre su Roccamora - Episodio 14 - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'episodio 14 — spedizione')
    c.setFillColor(TEAL); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H - 40*mm, 'i tetti del Corso, prima che il Gatto sparisca')
    wave(c, W/2 - 20*mm, H - 46*mm, 40*mm, OGOLD)
    frame_flow(c, 28*mm, H - 120*mm, W - 56*mm, 68*mm, [
        Paragraph('Le 21 carte Minaccia dell’episodio (7 spawn, 6 insidie, 4 crescendo, 4 '
                  'eventi) e le schede Nemici sono carte a parte (cartella <b>Episodio '
                  '14/cards/</b>). Le 6 tessere dei tetti sono in <b>Episodio 14/board/</b>. '
                  'Questo NON è un recupero né una cattura forzata: è raggiungere il <b>Primo '
                  'Gatto</b> all’Attico (T6) e farlo <b>parlare</b> prima che sparisca sui tetti. '
                  'La refurtiva torna da sé; ciò che conta è la sua testimonianza — che gli hanno '
                  'ordinato di <b>lasciare</b> roba, non solo di prenderla. Attenti alla <b>FUGA</b> '
                  '(soglia-Canto) e ai pericoli di <b>quota</b>. Le pagine seguenti sono le note '
                  'per tessera.', BODY)])
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawCentredString(W/2, H - 34*mm, 'come si usa questo fascicolo')
    frame_flow(c, 30*mm, H - 132*mm, W - 60*mm, 92*mm, [
        Paragraph('Lo tiene <b>una persona sola</b>. Quando il gruppo rivela una tessera, legge '
                  'ad alta voce la voce corrispondente. <b>Le regole di questo episodio:</b>', BODY),
        Paragraph('• <b>FUGA (soglia).</b> Il Primo Gatto (appare in T4) conosce i tetti meglio di '
                  'voi. Quando il Canto raggiunge la <b>soglia-fuga</b> (indicata dalla Soluzione) '
                  'prima che l’abbiate agganciato all’Attico (T6), <b>sparisce</b> oltre i tetti: '
                  'la spedizione si chiude senza la sua parola (vittoria parziale). Le carte '
                  'crescendo spingono verso la soglia; la <b>Parola dei Tetti</b> abbassa la soglia '
                  'd’ingaggio (vi lascia avvicinare).', BODY),
        Paragraph('• <b>OBIETTIVO.</b> All’Attico (T6), agganciate il Primo Gatto (adiacenza + '
                  'Interagire, o la Parola dei Tetti). Ridotto all’ultima Ferita <b>TRATTA</b> e '
                  'dice la verità sulla commissione — <b>vittoria piena</b>. <b>Ucciderlo</b> (a 0 '
                  'Ferite, senza la Parola) o lasciarlo <b>fuggire</b>: <b>vittoria parziale</b> '
                  '(l’Atto prosegue, ma con un incrocio in meno).', BODY),
        Paragraph('• <b>QUOTA.</b> I tetti sono il pericolo: il comignolo (T2) e il lucernario (T5) '
                  'si superano con prove DESTREZZA/VIGORE; chi fallisce resta aggrappato (la FUGA '
                  'avanza) o sfonda un vetro (1 danno). I <b>Ramponi</b> (dal Covo) tolgono le '
                  'cadute: niente danni, niente round persi. I <b>Gatti minori</b> colpiscono e '
                  'scappano tra i panni (T3): inseguirli fa avanzare la FUGA.', BODY)])
    c.showPage()
    import gen_narrator as N
    from deluxe_style import ARTWORKS_DIR
    for T in TILES_14:
        art_file = TILE_ART_14[T['id']]
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sulla tessera '
                  + T['id'] + ' (rigenerare quando arriva)')
            art_file = 'abandoned luthier workshop.png'
        N.pagina_tessera_fronte(c, T['id'], T['nome'], TESSERE_DESC_14[T['id']],
                                art_file, T['testo'])
        c.showPage()
        ogg = ['<b>Oggetto</b> — carta “' + o + '”' for o in OGGETTI_TESSERA_14.get(T['id'], [])]
        N.pagina_retro_tessera(c, T['id'], T['nome'], T, ogg)
        c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'nemici in campo')
    frame_flow(c, 20*mm, H - 88*mm, W - 40*mm, 60*mm, [
        Paragraph('Statistiche nel <b>Bestiario dell’Episodio 14</b>. In campo: i <b>Gatti '
                  'minori</b> (Sgherri ritematizzati: agili, colpiscono e scappano) e <b>il Primo '
                  'Gatto</b> (il boss: il re dei tetti, all’Attico, T6). Nessun mostro: il pericolo '
                  'è la quota, il vuoto della via sotto, il vetro del lucernario, e il Gatto che '
                  'scivola via se tardate. Vittoria: agganciare il Primo Gatto e farlo trattare '
                  'prima della FUGA. Ai tavoli da 2-3 eroi il Primo Gatto <b>non recupera mai '
                  'ferite</b> (regola delle taglie).', BODY)])
    c.showPage()
    token_sheet(c, token_groups_14())
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


def token_groups_14():
    """Miniature dell'Episodio 14. I segnalini Canto sono qui i segnalini della
    FUGA (il Primo Gatto che si sposta sui tetti verso la soglia-fuga)."""
    from deluxe_style import ARTWORKS_DIR
    groups = [
        TOKEN_EROI,
        ('GATTI MINORI (x5, Sgherri)', [('Lo Sgherro.png', 5)]),
        ('IL PRIMO GATTO', [('Il Primo Gatto.png', 1)]),
        ('LA FUGA (CANTO)', [('Un fischio sui tetti.png', 1),
                             ('Il Gatto si sposta.png', 1),
                             ('Le tegole cedono la traccia.png', 1)]),
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
    c.setTitle('Ombre su Roccamora - Episodio 14 - Soluzione (non aprire)')

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
        '<b>Il caso.</b> Il professor Braga (rivale di M., iniziali C.B.) denuncia il furto delle '
        'sue lastre fonografiche, opera dei Gatti del Corso. Ma la refurtiva rientra con oggetti '
        'IN PIÙ — un sigillo «C.B.», ricevute, appunti — che Braga disconosce.',
        '<b>La verità.</b> Il furto è vero, ma su commissione anonima: l’ordine era rubare E '
        'lasciare, tra ciò che si restituisce, la prova di una colpevolezza costruita. È M. che '
        'prepara il falso smascheramento dell’Ep. 15, arredando la colpa del rivale. Nessuno può '
        'ancora capirlo. Sventare = far parlare il Primo Gatto (l’unico che sa dell’ordine di '
        '«lasciare») e documentare il «di più».',
    ])
    pagina('le 4 domande — risposte e vantaggi', [
        '<b>1. DOVE è tornata la refurtiva prima di rientrare?</b> All’Attico del Corso, il covo '
        'dei Gatti sui tetti (la voce alla Gazzetta L2 + il pegno al Banco L3: serve più di una '
        'conferma). <i>Esatta:</i> sapete dove salire — nel 1° round della spedizione non si pesca '
        'nessuna carta Minaccia. <i>Sbagliata:</i> salite alla cieca — 1 Gatto minore appare in T1.',
        '<b>2. CHI ha eseguito il furto?</b> I Gatti del Corso, su commissione anonima e cieca (la '
        'testimonianza di Braga L1 + il cronista L2 + il referto della Gendarmeria L4). <i>Esatta '
        '(«la commissione era cieca»):</i> all’Attico, dire al Primo Gatto che nessuno ha visto il '
        'mandante gli toglie la leva — gli fa saltare un attacco. <i>Sbagliata:</i> nessun effetto.',
        '<b>3. COSA è tornato IN PIÙ?</b> Gli oggetti-intrusi (il sigillo «C.B.», ricevute, '
        'appunti) che arredano la colpa di Braga (l’Inventario Originale L1 + il verbale del '
        'Ricettatore/Faldone L5/L7: serve più di una conferma). <i>Esatta (torsione documentata):</i> '
        'all’Attico documentate il «di più» sul posto — la torsione è piena e il falso dell’Ep. 15 '
        'nasce con una crepa. <i>Sbagliata:</i> la refurtiva torna, ma il falso resta invisibile.',
        '<b>4. COSA portate ai tetti?</b> LA PAROLA DEI TETTI (il Covo dei Gatti). <i>Con la '
        'Parola:</i> il Primo Gatto vi riconosce come gente di codice — tratta già a 2 Ferite e '
        'non tenta la fuga finale (vittoria piena più facile). <i>Senza:</i> dovete ridurlo '
        'all’ultima Ferita senza ucciderlo. Aiuti: i Ramponi (Covo, tolgono le cadute di quota), '
        'la fune (T3). <i>Esche:</i> la Lettera del Perito e il Pegno Anonimo.',
        '<b>Nota sul rivelatorio (Domanda 2):</b> lo confermano tre carte — la Testimonianza «Il '
        'professor Braga» (L1), la Testimonianza «Il cronista Ranuzzi» (L2) e il Referto '
        '«L’inventario che non torna» (L4). Senza nessuna, giudicate con elasticità una risposta '
        '«vicina» (es. «i ladri dei tetti, su commissione»). La Domanda 2 non ha complicazione se '
        'sbagliata.',
        '<b>Vantaggio d’Indagine:</b> Slancio SOLO con tutte e 4 le risposte esatte E 3+ ore '
        'avanzate; Preparati con 1+ ore avanzate O 6+ luoghi visitati. Dossier completo (0 ore '
        'avanzate): 1 gettone Intuizione, come sempre.',
    ])
    pagina('spedizione — i tetti e il gatto che sfugge', [
        '<b>Montaggio</b> (tessere in Episodio 14/board/, coperte tranne T1):<br/>'
        'T1 La Gronda (partenza, da Sud) → T2 Il Comignolo (quota) → T3 La Terrazza dei Panni '
        '(Gatti minori) → T4 L’Abbaino (appare il Primo Gatto, parte la FUGA) → T5 Il Lucernario '
        '(quota, vetro) → T6 L’Attico (il Primo Gatto). Coi Ramponi si salta lo strapiombo di T1.',
        '<b>La soglia-fuga.</b> Segnate il Canto come al solito. Alla <b>soglia-fuga = Canto 5</b> '
        '(6 con la Parola dei Tetti), il Primo Gatto scavalca la cresta e sparisce, se non '
        'l’avete già agganciato all’Attico (T6): vittoria parziale. Le carte crescendo (fischio/il '
        'Gatto si sposta) accelerano. La Parola dei Tetti alza di fatto la soglia (aggancio a 2 '
        'Ferite, niente fuga finale).',
        '<b>Pericoli di quota.</b> Comignolo (T2): prova DESTREZZA/NERVI o si resta un round '
        'aggrappati (la FUGA avanza). Lucernario (T5): prova VIGORE/DESTREZZA o si sfonda un vetro '
        '(1 danno + FUGA). Coi Ramponi (o la fune da T3) niente cadute. I Gatti minori (T3) '
        'colpiscono e scappano: inseguirli fa avanzare la FUGA.',
        '<b>Il Primo Gatto.</b> Boss: Att +3, Dif 8, Fer 6, Mov 4, Danno 1. Agilissimo, cerca la '
        'fuga più del colpo. Nessuna debolezza-oggetto. «La commissione era cieca» (D2 esatta): '
        'salta un attacco. «La Parola dei Tetti» (D4): tratta a 2 Ferite. Ai tavoli da 2-3 eroi '
        'non recupera ferite.',
        '<b>Vittoria.</b> Primo Gatto agganciato e portato a trattare (all’ultima Ferita, o a 2 '
        'con la Parola): dice della commissione cieca e dell’ordine di «lasciare» = <b>vittoria '
        'piena</b>. Ucciso (0 Ferite senza la Parola) o fuggito = <b>vittoria parziale</b> (l’Atto '
        'prosegue, ma un incrocio più fragile avanti). <b>Il mazzo:</b> 21 carte (7 Gatti minori, '
        '6 insidie di quota, 4 crescendo-fuga, 4 eventi).',
    ])
    pagina('epilogo, frammento e bivio', [
        '<b>EPILOGO — da leggere a voce alta se il Primo Gatto tratta.</b> «Lo Spillo si siede sul '
        'comignolo come su un trono, i piedi nel vuoto, e ride piano. "Il lavoro era strano," dice. '
        '"Di solito ci pagano per portar via. Stavolta metà oro era per <i>lasciare</i>: roba che '
        'non era sua, del professore, da mettere giù con cura dove i gendarmi l’avrebbero trovata." '
        'Non sa chi paga: oro vecchio, un intermediario mai visto, la carta di pregio delle '
        'ricevute. Ma adesso lo sapete voi: qualcuno non vuole derubare Braga. Qualcuno lo vuole '
        '<b>colpevole</b>. E per arredargli addosso una vita di crimini, bisogna conoscerlo da una '
        'vita.»',
        '<b>FRAMMENTO DI CAMPAGNA N. 14:</b> <i>«Il professor Braga firma C.B. da sessant’anni. '
        'Qualcuno lo sa da sessant’anni.»</i> Conservatelo.',
        '<b>IL BIVIO — decidete insieme, poi sigillate.</b><br/>'
        '<b>Restituire tutto a Braga senza inventario</b> (cortesia tra gentiluomini). Braga, non '
        'umiliato, collaborerà nell’Episodio 15; ma senza verbale l’Episodio 18 perde un incrocio '
        '(il Sigillo non resta agli atti).<br/>'
        '<b>Inventario giudiziario completo.</b> Il Sigillo «C.B.» resta agli atti (un incrocio in '
        'più nell’Episodio 18), ma Braga, esposto al ridicolo, nell’Episodio 15 non muoverà un '
        'dito per aiutarvi.<br/>'
        'Scrivete la scelta sul retro del Frammento n. 14.',
        '<b>AGGANCIO.</b> Tre giorni dopo la chiusura del caso, un plico anonimo arriva alla '
        'Gendarmeria. Dentro, ordinate e perfette, «le prove» contro Braga: pagamenti, lettere, il '
        'sigillo dell’inventario, perfino un testimone. Tutto combacia. Troppo.',
        '<b>MIGLIORIE</b> (una a testa dopo la vittoria): le solite (vedi Regolamento). Se avete '
        'ottenuto solo la vittoria parziale (il Gatto ucciso o fuggito), l’Ep. 15 partirà con un '
        'incrocio in meno: senza la sua parola, la crepa nel falso è più sottile.',
    ])
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


# ================================================================== LUOGHI

LUOGHI14_DESC = {
    1: "Cera da mobili, canfora e quel principio d’odore d’aceto che lascia l’ottone appena "
        "lucidato: nella villa-museo non si accende il camino — il calore rovina la cera — e le "
        "sale tengono un freddo da chiesa di provincia, di quelli che si sentono nei polsi. Il "
        "delitto sta tutto sotto vetro molato, numerato e in fila: manette, un coltello col suo "
        "cartellino, calchi di gesso di mani che non esistono più, e i cilindri di cera nei loro "
        "astucci di cartone, ciascuno col numero scritto a inchiostro sul coperchio. Il "
        "professore vi riceve con le mani già guantate, bianche, cucite su misura, tenute basse "
        "davanti alla cintura come chi da quarant’anni non appoggia le dita da nessuna parte; e "
        "prima ancora di offrirvi una sedia mette le cose in chiaro: «io non tocco nulla finché "
        "la Gendarmeria non verbalizza. I guanti, sa: l’igiene prima di tutto.» Quando qualcuno "
        "attraversa il fondo del salone i cilindri appoggiati sul feltro girano appena su se "
        "stessi, tutti insieme, e continuano un poco dopo che i passi si sono fermati. Nella fila "
        "dei numeri, fra un astuccio e l’altro, il velluto ha tenuto la forma di ciò che ci stava "
        "sopra, e lì è più chiaro.",
    2: "Inchiostro grasso, piombo caldo e colla d’amido: alla Gazzetta l’odore sale dal torchio "
        "del piano di sotto e resta appiccicato ai tendaggi, e a quest’ora la redazione è più "
        "calda della strada di quanto una stanza con due finestre sconnesse possa spiegare. Casse "
        "di caratteri aperte, bozze infilzate al chiodo in mazzi spessi un dito, una lampada col "
        "paralume verde per ogni scrivania e nessuna accesa tranne due; lungo la parete "
        "l’archivio dei ritagli in buste di cartone, annata per annata, con le costole consumate "
        "dove le mani tornano più spesso. Ranuzzi si alza a metà, si frega le mani come chi "
        "rientra al caldo, e vi parla già camminando all’indietro verso le buste, in maniche di "
        "camicia e mezze maniche di lustrino: «E ora il furto! I lettori impazziscono», dice, e "
        "ride della risata di chi la prima pagina l’ha già vista. Sotto, il torchio batte a "
        "cadenza, e a ogni battuta i calamai tremano e dagli scaffali scende un filo di polvere "
        "di piombo, sempre negli stessi due punti. Una busta di ritagli è tornata al suo posto "
        "con la costola dalla parte sbagliata.",
    3: "Naftalina, spago nuovo e il ferro freddo della grata: al Banco dei Pegni si respira "
        "l’odore delle case degli altri, chiuse in pacchi di carta e messe in fila. Dietro il "
        "banco la lampada col paralume verde tiene illuminato soltanto il registro; più su, sugli "
        "scaffali, i pacchi salgono fino al soffitto col cartellino allo spago, e la bilancia da "
        "banco aspetta coi pesetti già disposti dal più grande al più piccolo. Il gestore vi "
        "ascolta con le mani ferme sul legno, i polpastrelli lisci di chi conta denaro d’altri "
        "tutto il giorno, e non alza la voce nemmeno per dire la cosa che non gli torna: «di "
        "solito la roba dei gatti la vediamo a pezzi», e intanto fa scorrere il pollice sul filo "
        "delle pagine. Ogni volta che la porta si apre i cartellini appesi si mettono in "
        "movimento tutti insieme, piano, e continuano un poco più a lungo di quanto dovrebbero. "
        "Sul banco è rimasto un pacco ancora legato: lo spago è di un altro colore, più chiaro, e "
        "il nodo ha tre giri invece di due.",
    4: "Panno bagnato, caffè d’orzo riscaldato due volte e l’inchiostro copiativo, che sa di "
        "violette andate a male: la Gendarmeria di notte è più silenziosa di un ufficio e più "
        "fredda di una caserma. La stufa di ghisa tira male e scalda soltanto il primo metro; "
        "oltre, il banco alto lucido di gomiti, la rastrelliera dei moschetti col lucchetto "
        "passato, e i registri in fila per annata, tutti dello stesso verde tranne quello aperto. "
        "Il maresciallo vi riceve senza sedersi, le mani grosse che voltano i fogli con la punta "
        "di un dito solo, e legge l’elenco con la voce piatta di chi legge elenchi da trent’anni; "
        "quando arriva in fondo scrolla le spalle: «burocrazia. Qualcuno avrà fatto confusione.» "
        "Le mantelline appese al chiodo gocciolano sul mattonato a una cadenza regolare, che non "
        "è quella della pioggia di fuori. In fondo al banco, sotto un fermacarte d’ottone, c’è un "
        "foglio di brutta con una colonna di numeri, e l’ultima cifra è ripassata due volte.",
    5: "Colla d’amido, paglia nuova e sego bruciato: la bottega odora di partenze più che di "
        "malaffare, e ci si arriva dal cortile, per una porta che non ha insegna né campanello. "
        "Dentro c’è una lampada sola, tenuta bassa sul banco di noce sfregiato, e attorno il buio "
        "è pieno di cose imballate: rotoli di carta grezza in piedi come colonne, ceste di paglia "
        "pettinata, un fornellino col cucchiaio della ceralacca appoggiato di traverso, e su una "
        "mensola i gomitoli di spago allineati per grossezza. L’uomo lavora mentre parla, le mani "
        "che tirano il nodo e lo provano col mignolo, gli avambracci grigi di polvere di carta, e "
        "non vi guarda in faccia se non quando gli si domanda chi lo paga: «Io non faccio domande "
        "a chi paga in oro vecchio», dice, e riprende a tirare. Il rocchetto appeso alla trave "
        "gira ancora piano dopo che lui ha già tagliato, e si ferma sempre un giro più tardi di "
        "quanto dovrebbe. Sul banco, accanto alla bilancia, c’è un mucchietto di paglia già "
        "pettinata, pronta, e nessuna cassa aperta che la aspetti.",
    6: "Carta ammuffita, fumo di pipa vecchio di anni dentro i tendaggi e, dalle scale, cavolo "
        "bollito: lo studio del perito Coda è al terzo piano di una casa senza portiere, e dentro "
        "fa più freddo che sul pianerottolo. Le pareti sono coperte di attestati incorniciati fin "
        "sopra la porta, fitti e storti come mattoni posati male, e sotto, per terra, gli atti "
        "dei congressi si reggono in pile alte un metro; sul tavolo un microscopio d’ottone con "
        "la vite gonfia di verderame, un quaderno di ritagli incollati e la lampada, accesa anche "
        "di giorno perché la finestra dà su un muro. Coda vi parla senza smettere di rimestare le "
        "carte, le dita macchiate d’inchiostro fino alla seconda falange, la vestaglia buttata "
        "sopra la giacca; e quando nomina il collega alza la voce di colpo, come si alza coi "
        "sordi: «Se lo hanno derubato, brindo. Se lo impiccano, offro da bere.» La lente montata "
        "sul braccio d’ottone scende da sola di un dito ogni tanto, e lui la rialza senza "
        "guardarla, sempre allo stesso modo. Sul davanzale c’è un bicchiere con dentro un dito di "
        "vino, e la polvere sul vetro arriva quasi all’orlo.",
    7: "Polvere di carta, colla animale e quel dolce di muffa che hanno i faldoni legati "
        "stretti; e sotto tutto, il freddo di un sotterraneo che non ha mai visto una stufa. Gli "
        "scaffali arrivano al soffitto e girano attorno alla stanza senza interrompersi mai, "
        "faldone su faldone col nastro passato due volte e l’annata scritta sulla costola; in "
        "mezzo una scala a rotelle sulla sua guida di ferro, e un tavolo con la lampada "
        "dell’archivista, l’unica luce, che tiene un cerchio giallo largo quanto un registro "
        "aperto. L’archivista si muove in ciabatte di feltro, porta il faldone contro il petto "
        "con tutte e due le braccia, come si porta un bambino che dorme, e ve lo posa davanti "
        "senza slegarlo: «una volta che una cosa è a verbale, esiste», dice, e resta in piedi "
        "accanto al tavolo per tutto il tempo. Quando in strada passa un carro la scala si sposta "
        "di mezzo palmo lungo la guida, da sola, e torna indietro più lentamente di quanto sia "
        "andata. Sul tavolo un tampone d’inchiostro è rimasto aperto, e la sua superficie si sta "
        "asciugando a chiazze.",
    8: "Canapa nuova, sego e ruggine: il sottotetto sa di corda più che di uomini, e sotto i "
        "coppi il freddo entra dalle fessure, ciascuna con la sua riga di luna. Le matasse "
        "pendono dai travetti a decine, arrotolate tutte nello stesso verso; su un’asse "
        "inchiodata alla parete stanno in fila i ferri da presa e i ramponi, puliti, ingrassati, "
        "ordinati per lunghezza come attrezzi di bottega, e sotto l’asse le suole chiodate "
        "aspettano appaiate, il cuoio ancora umido. Non c’è nessuno: un fornello spento, quattro "
        "pagliericci contro il muro, una brocca, e i segni delle mani sulla trave di colmo, nel "
        "punto in cui ci si tira su per uscire dall’abbaino. Sulla trave, inciso a colpi di punta "
        "e ripassato tante volte che il taglio è nero, c’è il segno dei Gatti. Una matassa appesa "
        "gira piano su se stessa, avanti e indietro, e non smette. Accanto al fornello, dentro "
        "una scodella, il sego rappreso tiene l’impronta di due dita.",
    9: "Quassù l’aria è un’altra: coppi ancora tiepidi del sole di ieri, fuliggine, guano secco, "
        "e un vento che a ogni comignolo cambia verso e vi arriva addosso da dove non ve lo "
        "aspettate. L’attico è un pianerottolo di tavole sotto il cielo aperto, e la città sta "
        "tutta di sotto: i canali neri fra le case, due fanali in fondo al Corso, il resto buio. "
        "Le casse sono accatastate contro il muro del camino, imballate strette, la paglia "
        "pettinata che esce dai coperchi, i cartellini scritti a mano in una grafia da bottega; "
        "accanto, corde arrotolate e un lanternino schermato, girato verso il muro perché dalla "
        "strada non si veda. Sulla cresta del tetto, più in alto di voi, c’è un uomo seduto con "
        "le ginocchia al mento, magrissimo, immobile: vi lascia guardare quanto volete, non dice "
        "niente, e ogni tanto sposta un piede sull’ardesia. Un cartellino gira sul suo spago, si "
        "ferma, riparte, sempre nello stesso verso. In cima a una cassa aperta, appoggiato sulla "
        "paglia, sta un dischetto di ceralacca rossa con due lettere in rilievo.",
}

OGGETTI_LUOGO_14 = {
    1: ['L’Inventario Originale'],
    3: [
        ('Esca', 'Il Pegno Anonimo', 'pare tradire il mandante, è solo un gatto che ha fatto cassa per conto suo'),
    ],
    5: [
        ('Incrocio D3', '', 'confrontatelo con l’Inventario Originale di Braga e vedrete il «di più»'),
    ],
    6: [
        ('Esca', 'La Lettera del Perito', 'è rancore da cattedra, non prova nulla: Coda non ha né i mezzi né i gatti'),
    ],
    7: [('Reperto C', 'il Verbale d’Inventario', ''),
        ('Nota', '', 'il Sigillo non è un reperto: qui c’è solo la sua scheda, '
                     'l’originale è all’Attico')],
    8: [
        ('Oggetto', 'La Parola dei Tetti', 'al Primo Gatto, lo dispone a trattare'),
        ('Oggetto', 'I Ramponi', 'sui tetti le cadute non vi feriranno'),
        ('Reperto B', 'la Lastra Fonografica', ''),
    ],
    9: [('Reperto A', 'il Sigillo «C.B.»', '')],
}

TILE_ART_14 = {t['id']: t['id'] + '-ep14.png' for t in TILES_14}
LUOGHI14_CROP = {}

TESSERE_DESC_14 = {
    'T1': "Il freddo dei coppi passa attraverso le suole prima ancora che attraverso il "
           "cappotto, e l’aria sa di fuliggine bagnata e di calce: quassù la città non si vede, "
           "si sente — un brusio basso e continuo che sale dalla strada come da sotto un "
           "pavimento. I tetti si stendono a perdita d’occhio sotto la luna, falda dopo falda, e "
           "ogni comignolo è un uomo fermo finché non gli si passa accanto. La gronda è stata "
           "rifatta di recente: coppi nuovi, malta ancora chiara nei giunti, e sotto la mano il "
           "canale di lamiera è liscio, senza una foglia. Il primo strapiombo separa questa falda "
           "dalla prossima. Il vento non arriva a raffiche ma a onde lunghe, sempre dallo stesso "
           "quarto, e a ogni onda una lamiera da qualche parte dietro di voi risponde con lo "
           "stesso rumore, alla stessa altezza. È la via dei Gatti, e stanotte è la vostra. Sul "
           "colmo, dove i coppi sono consumati fino al chiaro, la traccia è larga una fila sola.",
    'T2': "Il comignolo è più grande di quanto sembri da terra: un pilastro di mattoni anneriti, "
           "largo quanto una stanza piccola, e per girarlo bisogna staccarsi dal tetto e "
           "appoggiarsi alla grondaia. Da vicino la fuliggine non è nera, è unta, e resta sulle "
           "dita come il grasso delle candele; l’aria che esce dalla canna è tiepida e sa di fumo "
           "vecchio, di cucina di qualcun altro, ed è l’unica cosa calda che si trovi a "
           "quest’altezza. Dalla parte del vento i mattoni sono consumati fino a mostrare il "
           "cotto chiaro, e la calce fra un corso e l’altro se ne va via a scaglie se la si "
           "tocca. La grondaia scricchiola sotto i piedi con un rumore di legno, non di ferro, e "
           "i suoi sostegni sono chiodati nel muro a distanze diverse, alcune larghe due passi. "
           "Un passo sicuro e si è dall’altra parte; un passo incerto, e la città sale a "
           "prendersi chi cade. Il vuoto della via si apre a picco a un palmo dalle scarpe, e i "
           "fanali di sotto illuminano soltanto la prima metà della caduta. Nella grondaia c’è "
           "acqua vecchia e foglie marce, e in mezzo galleggia un bottone.",
    'T3': "Sapone da bucato e amido, l’odore più domestico che ci sia, e a trenta piedi da terra "
           "è fuori posto quanto una tavola apparecchiata: qualcuno stende ancora quassù, e le "
           "lenzuola sono asciutte da ore ma nessuno è salito a ritirarle. Sono tese su tre fili "
           "paralleli, bianche, gonfie di vento, e la luna le attraversa quel tanto che basta a "
           "mostrare le ombre di ciò che sta dietro senza mostrarne mai la forma. Il pavimento "
           "della terrazza è di mattoni posati a spina, con l’erba secca nei giunti, e in un paio "
           "di punti i mattoni suonano vuoto; contro il muretto una bacinella di zinco sta "
           "rovesciata a prendere la brina, e attorno il mattone è asciutto. Sono i Gatti minori, "
           "che di quelle lenzuola fanno scudo e sipario, colpiscono e spariscono. Passare in "
           "fretta è meglio che rincorrerli. Il filo di mezzo, quando il vento cala del tutto, "
           "continua a oscillare da un capo solo. In fondo, appesa a una molletta, una fune "
           "leggera arrotolata sta ad asciugare insieme al bucato.",
    'T4': "L’abbaino sporge dal tetto come una palpebra socchiusa sul buio, e dalla sua fessura "
           "esce un’aria ferma che sa di legno chiuso e di lana vecchia: un odore di stanza, e "
           "per un momento è più strano del vuoto. Il davanzale è coperto di guano secco e di "
           "vetri rotti da tempo, arrotondati agli spigoli dall’acqua; il telaio tiene ancora due "
           "chiodi e un pezzo di tenda, e il vetro superstite è opaco dalla parte di dentro, come "
           "se qualcuno ci avesse respirato contro e poi non avesse più aperto. Attorno, i coppi "
           "si fanno più ripidi e la fila dei comignoli si dirada. E in alto, sulla cresta, "
           "immobile contro il cielo, la sagoma dello Spillo: il Primo Gatto vi ha visti, vi "
           "studia, e comincia a muoversi. Da questo istante è una corsa: lui conosce i tetti. Un "
           "fischio sottile parte da qualche tetto più in là e ne riceve un altro in risposta, "
           "più lontano. Sul davanzale, fra i vetri, la polvere è pulita in due strisce lunghe "
           "una mano.",
    'T5': "Il lucernario è un rettangolo d’acqua nera in mezzo al tetto: vetro e piombo, opaco "
           "di decenni di sporco, e la luna non lo attraversa, ci resta sopra. Il telaio è "
           "saldato dallo sporco, i piombi si sono ingrossati alle giunture, e ogni riquadro "
           "tiene un dito di terriccio negli angoli dove l’acqua non arriva più. Passandoci "
           "accanto si vede la propria faccia, storta, col cielo dietro; sotto non si vede "
           "niente. Il vetro geme sotto il peso prima ancora di prenderlo tutto, un lamento lungo "
           "che parte dal centro e finisce ai bordi, e la nota cambia da un riquadro all’altro. I "
           "Gatti ci ballano sopra; voi dovrete attraversarlo sapendo che potrebbe cedere. "
           "Attorno al lucernario il bordo del tetto è una fascia di coppi larga due piedi, e in "
           "tre punti i coppi mancano. Una crepa vecchia attraversa un riquadro da parte a parte, "
           "ricucita con una striscia di piombo e mastice, e il mastice è ancora morbido sotto "
           "l’unghia.",
    'T6': "L’attico è l’ultimo pianerottolo prima del cielo: tavole, un parapetto di mattoni "
           "alto due corsi, e attorno soltanto aria e la città rovesciata di sotto, i canali neri "
           "e i fanali che da quassù stanno tutti sulla stessa linea. Il vento gira attorno alla "
           "cresta e porta fin lassù il freddo dell’acqua, che a quest’altezza non dovrebbe "
           "arrivare. La refurtiva è accatastata contro il muro del camino, imballata come per "
           "una spedizione: casse chiuse col loro giro di spago, paglia pettinata sotto i "
           "coperchi, etichette scritte a mano in una lingua di comodo, e ogni cassa porta il "
           "cartellino girato dalla stessa parte. Roba d’altri, tutta quanta, e troppo grossa per "
           "portarsela sui tetti. Sulla cresta, a un passo dal vuoto, il Primo Gatto vi aspetta: "
           "seduto, le braccia attorno alle ginocchia, che vi guarda arrivare senza spostarsi di "
           "un dito. Oltre il parapetto una corda pende dal gancio di carico, e il suo capo "
           "libero si muove piano, sempre nello stesso arco, anche quando il vento cade. "
           "Sull’ultima cassa il coperchio è tenuto alzato di un dito da un cuneo di legno nuovo.",
}

ESAMI_CARBONE_14 = {
    'IL SIGILLO «C.B.»': '«Le iniziali sono di Braga, la ceralacca no: è la stessa pasta rossa dei '
                'sigilli di ogni scatola vuota della campagna. Non l’ha fatto Braga — qualcuno lo '
                'fa <i>sembrare</i> Braga, e lo fa da chi conosce Braga e le sue abitudini da una '
                'vita intera. La firma di chi non firma, prestata a un innocente.»',
    'LA LASTRA FONOGRAFICA': '«La voce incisa è vecchia di decenni; il graffio sul bordo è di '
                'stanotte. Chi ha restituito la refurtiva l’ha maneggiata con guanti — ma non i '
                'guanti bianchi di Braga: un’altra mano, che lavora pulito. Non si ruba una '
                'collezione per riportarla intera: si ruba per avere il pretesto di <i>rimetterci '
                'dentro</i> qualcosa.»',
    'IL VERBALE D’INVENTARIO': '«La colonna del "restituito" è più lunga di quella del "sottratto": '
                'tre righe in più. Nessun ladro al mondo rende più di quanto ha preso. Quelle tre '
                'righe — un sigillo, due ricevute — non sono refurtiva: sono un impianto, e a '
                'verbale diventano verità. Chi ha ordinato questo furto non voleva la refurtiva. '
                'Voleva quelle tre righe negli atti della Gendarmeria.»',
}

OGGETTI_TESSERA_14 = {'T3': ['Una Fune Leggera']}


def luoghi():
    """Luoghi.pdf Episodio 14 (fronte/retro + indice citta')."""
    from deluxe_style import ARTWORKS_DIR, torn_portrait
    import gen_narrator as N
    PLACEHOLDER = 'abandoned luthier workshop.png'
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 14 - Luoghi (riferimenti narratore)')
    N.pagina_indice_citta(c, LUOGHI_14, 'Episodio 14')

    def oggetto_righe(n):
        return N.oggetto_righe(OGGETTI_LUOGO_14.get(n, []))

    for L in LUOGHI_14:
        art_file = L['art']
        if not os.path.exists(os.path.join(ARTWORKS_DIR, art_file)):
            print('  AVVISO: manca artworks/' + art_file + ' - placeholder sul Luogo '
                  + str(L['n']) + ' (rigenerare quando arriva)')
            art_file = PLACEHOLDER
        torn_portrait(c, W, H, art_file, N.TORN_TOP, window=N.WINDOW_TOP,
                      **LUOGHI14_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            tipo_chiave, valore = L['chiave']
            chiave_txt = ('la parola «' + valore.lower() + '»' if tipo_chiave == 'parola'
                          else 'l’oggetto “' + valore.lower() + '”')
            entrata = 'si entra con ' + chiave_txt + ' — solo per chi arbitra'
        N.header(c, 'luogo ' + str(L['n']), L['nome'], LUOGHI14_DESC[L['n']], entrata=entrata)
        N.indizi_block(c, L.get('indizi', []), oggetto_righe(L['n']), N.ART_BOTTOM - 10*mm)
        c.showPage()
        N.pagina_retro_luogo(c, L)
        c.showPage()

    N.pagina_esami_carbone(c, ESAMI_CARBONE_14)
    c.save()
    pad_to_even_pages(out_path)
    print('ok ->', out_path)


if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    import gen_bestiario
    gen_bestiario.NEMICI.extend([n for n in NEMICI_14
                                 if n['nome'] not in {x['nome'] for x in gen_bestiario.NEMICI}])
    gen_bestiario.bestiario(
        ['IL PRIMO GATTO', 'LO SGHERRO'],
        os.path.join(OUT_DIR, 'Bestiario.pdf'),
        'Ombre su Roccamora - Bestiario Episodio 14')
    print('OK episodio 14')
