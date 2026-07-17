# -*- coding: utf-8 -*-
"""Ombre su Roccamora - PRELUDIO: La Prova del Lume (Preludio/pdf/).

Mini-episodio tutorial, giocato PRIMA dell'Episodio 1: undici sconosciuti,
convocati ognuno da una lettera di M., superano la prova d'ammissione alla
Societa' del Lume risolvendo il loro primo caso - la sparizione di Ansaldo,
il vecchio custode-archivista del palazzo della Societa'. Giustifica come gli
eroi si conoscono e perche' fanno parte della Societa', e insegna le regole
in modo soft:

- Indagine ridotta: 4 luoghi (P1-P4), 6 ore, 2 Domande invece di 4, una falsa
  pista (il nipote), un vincolo d'orologio (il barcaiolo dalle 21), un
  Approfondimento per verbo (Osservazione/Testimonianza/Referto/Presagio) +
  Accesso. Box "Scuola del Lume" che spiegano le regole man mano che
  servono, comprese le due varianti (Discernimento di Marani, esame
  Oggetti/Reperti di Carbone).
- Mini-spedizione: 3 tessere (riusa T1/T2/T4 di Episodio 1/board/ - i depositi sul
  canale di Roccamora si somigliano tutti), nemici solo Malavita (2 Sgherri
  + 1 Sicario), mazzo Minaccia ridotto a 6 carte prese dal mazzo Episodio 1,
  orologio "la Marea" (solo avanzamento automatico: insegna il timer senza
  boss ne' carte dedicate).
- Foreshadow dell'Episodio 1 senza spoiler: il fascicolo del 1741, "un
  signore ben vestito, mani da artigiano", mezza onda su un lembo di carta.
  Frammento di Campagna n. 0 e Bivio sigillato con conseguenze nell'Ep. 1.

Deroghe deliberate dalla bibbia (PROMPT-ESPANSIONE.md), perche' e' un
tutorial: 2 Domande invece di 4, gli Approfondimenti sono solo corroborazione
(nessuna Eco condivisa: quella e' la meccanica del culto, che qui non c'e'),
1 solo reperto, niente boss, tessere e mazzo Minaccia riusati dall'Ep. 1,
niente tabella Ore Avanzate (il vantaggio e' gia' dato per Domanda esatta,
vedi soluzione()).

Arte luoghi/oggetti: nuova, vedi PROMPT-MIDJOURNEY-Preludio.md.
Le carte si generano con `node scripts/cardconjurer/generate-batch.js preludio`
quando le arti esistono; Luoghi.pdf viene saltato con un avviso finche' manca
l'arte dei luoghi.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, rule_border, seal, wave,
                          art, _cover_image, torn_portrait, ARTWORKS_DIR,
                          F, INK, RED, TEAL, GOLD as OGOLD, SEPIA)
from ornaments import GOLD_L

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Preludio', 'pdf')
os.makedirs(OUT_DIR, exist_ok=True)
register_fonts()
W, H = A4

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

BODY = st('body', alignment=4)
SMB = st('smb', fontName=F['sc'], fontSize=8.5, textColor=TEAL, spaceBefore=4, spaceAfter=2)

def frame_flow(c, x, y, w, h, flow):
    from reportlab.platypus import Frame
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

def scuola(c, x, y, w, testo):
    """Box tutorial "Scuola del Lume": insegna una regola nel punto in cui
    serve, senza rimandare al regolamento."""
    p = Paragraph(f'<b>Scuola del Lume:</b> {testo}',
                  st('sc', fontSize=8.8, leading=11.5, textColor=INK))
    ph = p.wrapOn(c, w - 8*mm, 60*mm)[1]
    c.saveState()
    c.setFillColor(colors.HexColor('#efe3c2')); c.setStrokeColor(SEPIA); c.setLineWidth(0.7)
    c.rect(x, y - ph - 6*mm, w, ph + 6*mm, fill=1)
    c.restoreState()
    p.drawOn(c, x + 4*mm, y - ph - 3*mm)
    return y - ph - 12*mm

# ================================================================= DATI

LETTERA_P = (
    "«Non vi conoscete tra voi, ma io vi conosco a uno a uno — meglio, forse, di quanto "
    "vi conosciate voi stessi. So la notte in cui avete smesso di credere alle "
    "spiegazioni comode. So il nome di chi, per primo, non vi ha creduto. Ho seguito "
    "abbastanza le vostre vite da sapere che avete visto, almeno una volta, qualcosa "
    "che il buon senso vi ordinava di ignorare — e non l’avete ignorato. Un dettaglio "
    "fuori posto. Un silenzio durato troppo. Una domanda che tutti, attorno a voi, "
    "preferivano lasciare cadere. Vi hanno chiamati eccentrici. Qualche volta, peggio. "
    "Io vi ho scelti per questo — e stanotte ho bisogno di voi.<br/><br/>"
    "La Società del Lume non recluta per referenze: mi fido solo dei fatti, e questa "
    "lettera ne porta uno, fresco quanto l’inchiostro con cui è scritta. <b>Ansaldo</b>, "
    "custode del nostro palazzo da vent’anni, è scomparso da tre notti. Nessuna "
    "richiesta di riscatto. Nessun biglietto. Solo la sua sedia vuota, e undici "
    "poltrone nel salone che aspettano ancora undici nomi.<br/><br/>"
    "Bruciate questa lettera appena l’avrete letta: le altre dieci dicono la stessa "
    "cosa, ma nessuna è stata scritta perché qualcuno la conservi. Avete <b>6 ore</b>, "
    "dalle 18:00 alle 24:00. Segnate ogni ora sul Taccuino, ogni parola che conta."
    "<br/>— M.»<br/><br/>"
    "<i>Luoghi disponibili dall’inizio: il Palazzo del Lume, la Taverna della "
    "Chiatta e il Banco dei Pegni di Fossa. Il quarto va sbloccato.</i>")

LUOGHI_P = [
    dict(n='P1', nome='IL PALAZZO DEL LUME', voce_mappa='Il Palazzo del Lume', req='Disponibile dall’inizio',
         art='Palazzo del Lume.png',
         testo='Il palazzo della Società sa di cera d’api e di anni chiusi a chiave: undici poltrone '
               'attorno a un tavolo, dieci ritratti alle pareti e un gancio vuoto dove l’undicesimo è '
               'stato tolto. La stanza di Ansaldo è in fondo al corridoio, ordinata come una cella '
               'di monaco. M. vi osserva dalla soglia, e non tocca nulla.',
         indizi=['Il letto è intatto da tre notti, ma pipa e scialle sono ancora al chiodo: chi esce '
                 'per sempre non lascia la pipa. <i>(Oggetto: prendete la carta La Pipa di Ansaldo.)</i>',
                 'Nel registro delle consultazioni dell’archivio manca una pagina, strappata di netto. '
                 'L’ultima riga rimasta: «1741 — fascicolo della confraternita…» '
                 '<i>(Reperto A: consegnate il Registro delle Consultazioni.)</i>',
                 'Sul pavimento dell’archivio, graffi di stivali chiodati: uomini pesanti, almeno due, '
                 'e nessuno dei due era il vecchio Ansaldo. Sul tavolo, il suo anello di chiavi. '
                 '<i>(Oggetto: prendete la carta L’Anello di Chiavi.)</i>'],
         approfondimenti=[
             dict(tipo='Osservazione', soggetto='La polvere smossa a metà',
                  testo='La polvere sullo scaffale del 1741 è smossa solo a metà: chi ha preso il '
                        'fascicolo sapeva DOVE cercare, ma non era pratico dell’archivio. Non era '
                        'Ansaldo — e nemmeno un ladro qualunque.'),
         ]),
    dict(n='P2', nome='LA TAVERNA DELLA CHIATTA', voce_mappa='La Taverna della Chiatta', req='Disponibile dall’inizio',
         art='Taverna della Chiatta.png',
         testo='Dirimpetto al palazzo, oltre il ponte, la taverna è il posto da cui si vede chi entra '
               'e chi esce dalla porta della Società. L’oste lucida bicchieri che restano opachi e '
               'parla volentieri: da queste parti un cliente nuovo è un avvenimento, tre clienti nuovi '
               'sono una storia.',
         indizi=['L’oste: «Tre uomini da molo, tre sere di fila, sempre quel tavolo: guardavano il '
                 'vostro portone. Uno ha detto una parola che qui non si usa: la dogana vecchia.» '
                 '<i>(Parola chiave: sblocca il Luogo P4.)</i>',
                 'Il nipote di Ansaldo ha litigato col vecchio la settimana scorsa, per soldi: metà '
                 'taverna li ha sentiti. Da allora il ragazzo non si è più visto.',
                 'Dopo le 21:00 arriva il barcaiolo della Chiatta: prima di quell’ora è in acqua. '
                 '<i>(Vincolo d’orologio: l’indizio del barcaiolo si legge solo visitando P2 '
                 'dalle 21 in poi.)</i>'],
         approfondimenti=[
             dict(tipo='Testimonianza', soggetto='Il barcaiolo della Chiatta',
                  testo='Con un bicchiere davanti, il barcaiolo ricorda: due notti, un passeggero fino '
                        'alla riva del palazzo. «Un signore ben vestito, mani da artigiano. Pagava '
                        'doppio per non avere domande. Mai di giorno.»'),
         ]),
    dict(n='P3', nome='IL BANCO DEI PEGNI DI FOSSA', voce_mappa='Il Banco dei Pegni di Fossa', req='Disponibile dall’inizio',
         art='Banco dei Pegni.png',
         testo='Mezza Roccamora è passata da Fossa a impegnare l’altra metà. Dietro la grata, il '
               'vecchio prestatore vi squadra come si squadra un anello: cercando il difetto. Il suo '
               'registro è la vera cronaca del quartiere — basta saperlo leggere, o pagare la tariffa.',
         indizi=['Nel registro: l’orologio da tasca di Ansaldo, impegnato IERI da «un signore coi '
                 'stivali chiodati». Ansaldo era sparito da due giorni: qualcuno gli ha svuotato le '
                 'tasche, e quel qualcuno gira ancora per la città.',
                 'Sempre nel registro, la settimana scorsa: il NIPOTE di Ansaldo ha impegnato '
                 'l’argenteria di famiglia e saldato un debito di gioco. La notte della sparizione '
                 'era qui a ritirarla: il prestatore lo giura. <i>(Il nipote è innocente: il litigio '
                 'era per questo.)</i>',
                 'Il prestatore, sottovoce: «Gli stivali chiodati puzzavano di sego e di corda '
                 'bagnata. Roba da molo, non da città.»'],
         approfondimenti=[
             dict(tipo='Referto', soggetto='L’orologio impegnato',
                  testo='Il vetro è incrinato e sulla corona c’è sangue secco, ma poco: un colpo '
                        'solo, di taglio, non una colluttazione lunga. Ansaldo è stato tramortito, '
                        'non ucciso — un morto non serve a chi ha ancora domande da fargli.'),
         ]),
    dict(n='P4', nome='LA DOGANA VECCHIA', voce_mappa='La Dogana Vecchia', req='L’uomo con la canna da pesca non stacca gli occhi da voi: sembra aspettare una parola d’ordine, la stessa bisbigliata in qualche taverna.',
         chiave=('parola', 'dogana'),
         art='Dogana Vecchia.png',
         testo='In fondo al canale di ponente, la vecchia dogana marcisce da vent’anni: banchina '
               'sfondata, portoni murati, una chiatta ormeggiata dove non dovrebbe esserci niente. '
               'Un uomo finge di pescare senza esca, e vi guarda arrivare per tutto il molo.',
         indizi=['Le casse sulla chiatta sono vuote e nuove: nessun carico, solo la scusa per stare '
                 'ormeggiati. Il finto pescatore ha il calcio di un coltellaccio sotto la giacca.',
                 'Da sotto la banchina, attraverso le assi, colpi ritmici: tre, pausa, tre. Qualcuno, '
                 'là sotto, batte per farsi sentire. Ansaldo è qui.',
                 'Nel fango del molo, un lembo di carta antica strappata: mezzo disegno a inchiostro, '
                 'una linea che ondeggia. Come mezza onda.'],
         approfondimenti=[
             dict(tipo='Presagio', soggetto='Le due voci sotto la banchina',
                  testo='Chi si sofferma ad ascoltare i colpi sotto la banchina giurerebbe che, per '
                        'un istante, rispondono in due voci — non una. Come se qualcosa, là sotto, '
                        'stesse imparando la cadenza.'),
         ]),
]

# Descrizione allargata SOLO per Luoghi.pdf (il narratore, non i giocatori):
# più sensoriale e atmosferica del testo terso stampato sulla carta Luogo,
# utile per improvvisare la scena a voce. Non tocca le carte stampate - stessi
# fatti, stesse battute di dialogo, mai nuove regole, solo più respiro attorno
# (stesso pattern di LUOGHI_DESC in gen_narrator.py per l'Episodio 1).
LUOGHI_P_DESC = {
    'P1': 'Il palazzo della Società sa di cera d’api e di anni chiusi a chiave, un profumo dolce '
          'e stantio che si deposita in gola prima ancora di superare la soglia. Nella sala del '
          'consiglio, undici poltrone di pelle scura aspettano attorno al tavolo tondo, i '
          'braccioli lucidi solo dove undici mani, per anni, li hanno stretti; alle pareti, dieci '
          'ritratti in cornice ovale seguono ogni movimento con gli occhi dipinti di chi non deve '
          'più rispondere a nessuno, e accanto all’ultimo un gancio vuoto — polvere più chiara '
          'tutt’intorno, come un’ombra che si rifiuta di sbiadire — dove un undicesimo volto è '
          'stato tolto, e nessuno, negli ultimi anni, ha mai spiegato perché. M. si ferma sulla '
          'soglia e non entra: «Non ho toccato nulla», dice, e nella voce c’è più disagio che '
          'rispetto per la scena. In fondo al corridoio, la stanza di Ansaldo è ordinata come una '
          'cella di monaco: il letto rifatto, tre notti di polvere sul comodino, la pipa ancora al '
          'chiodo accanto allo scialle — nessuno dei due oggetti che un uomo porta con sé se pensa '
          'di non tornare. Più giù, nell’archivio, i graffi di due paia di stivali chiodati '
          'incrociano il pavimento fin sotto lo scaffale del 1741, dove una pagina è stata '
          'strappata di netto, e l’anello di chiavi di Ansaldo giace dimenticato sul tavolo, come '
          'se chi l’ha lasciato non ne avesse più avuto bisogno.',
    'P2': 'Dirimpetto al palazzo, oltre il ponte, la Taverna della Chiatta è il punto da cui tutta '
          'la strada si vede senza essere visti: un tavolo vicino alla finestra appannata basta '
          'per contare chi entra e chi esce dalla porta della Società. L’oste lucida bicchieri che '
          'restano opachi qualunque cosa faccia, e parla con la facilità di chi ha raccontato la '
          'stessa storia a troppi avventori per fermarsi ora — da queste parti un cliente nuovo è '
          'un avvenimento, tre clienti nuovi sono già una leggenda, e voi, tutti insieme, siete già '
          'il racconto della cena di qualcun altro, stasera. Tre sere di fila, giura abbassando la voce, tre uomini '
          'col passo dei moli si sono seduti proprio a quel tavolo, senza mai ordinare granché, gli '
          'occhi sempre sul portone di fronte; uno di loro, l’ultima sera, ha lasciato cadere una '
          'parola che qui non si usa, come una moneta falsa sul bancone. Più tardi, tra un '
          'bicchiere e l’altro, qualcuno ricorda anche il nipote di Ansaldo, la voce alzata per un '
          'debito, e nessuno che lo veda da allora. Ma è solo dopo le ventuno, quando l’acqua fuori '
          'si fa nera e silenziosa, che l’ultimo avventore della sera prende posto senza dire una '
          'parola: il barcaiolo della Chiatta, che di giorno vive sul canale e la sera, a volte, ha '
          'voglia di parlare.',
    'P3': 'Mezza Roccamora è passata da Fossa a impegnare l’altra metà, e lui lo sa: dietro la '
          'grata di ferro battuto, il vecchio prestatore vi squadra come si squadra un anello '
          'portato a vendere, cercando il difetto prima ancora del prezzo. Il suo registro, '
          'rilegato in pelle consunta agli angoli, è la vera cronaca del quartiere — ogni pegno una '
          'data, ogni data una disgrazia, basta saperlo leggere, o pagare la tariffa per farselo '
          'leggere da lui. Le pagine più recenti raccontano più di quanto dovrebbero: ieri, un '
          'orologio da tasca portato da «un signore con gli stivali chiodati» che puzzavano, dice '
          'sottovoce, di sego e corda bagnata — roba da molo, non da città. La settimana prima, un '
          'nome che conoscete: il nipote di Ansaldo, venuto a impegnare l’argenteria di famiglia '
          'per saldare un debito di gioco, la notte stessa in cui suo zio è sparito — il prestatore '
          'lo giurerebbe su quel registro, e non ha motivo di mentire per un ragazzo che gli deve '
          'ancora dei soldi. Il vetro dell’orologio è incrinato, la corona macchiata di un sangue '
          'ormai scuro: poco, un colpo solo, non una lotta.',
    'P4': 'In fondo al canale di ponente, dove le lanterne pubbliche non arrivano più, la vecchia '
          'dogana marcisce da vent’anni: banchina sfondata in tre punti, portoni murati con mattoni '
          'più nuovi del resto, e una chiatta ormeggiata dove non dovrebbe esserci niente da '
          'scaricare né da caricare. Un uomo, seduto su un bidone rovesciato, finge di pescare '
          'senza esca in un’acqua che sa bene non dare nulla, e vi guarda arrivare per tutto il '
          'molo senza mai voltare davvero la testa. Le casse ammucchiate sulla chiatta sono vuote e '
          'nuove, il legno ancora chiaro: nessun carico, solo una scusa per restare ormeggiati a '
          'guardare chi passa — e sotto la giacca del pescatore, quando si allunga per finta a '
          'controllare la lenza, si intravede il calcio scuro di un coltellaccio. È chinandosi tra '
          'le assi della banchina, però, che si sente: colpi ritmici, tre, una pausa, tre ancora, '
          'troppo regolari per essere l’acqua o il legno che lavora. Qualcuno, là sotto, batte per '
          'farsi sentire da chi ha ancora orecchie per ascoltare. Nel fango del molo, mezzo '
          'affondato, un lembo di carta antica strappata mostra una linea che ondeggia — come '
          'mezza onda, in cerca dell’altra metà.',
}

DOMANDE_P = ['1. DOVE è tenuto Ansaldo?',
             '2. COSA cercavano nel palazzo della Società?']

TESSERE_P = [
    ('T1', 'LA BANCHINA DELLA DOGANA', 'Episodio 1/board/T1 - Banchina d’Ingresso.png',
     'La porta d’acqua della dogana: assi viscide, anelli d’ormeggio, l’acqua nera che '
     'respira sotto il molo. Qui dovete riportare Ansaldo per vincere. La porta verso il '
     'deposito (N) si apre con l’Anello di Chiavi, o forzandola (VIGORE Media).'),
    # Oggetto-scuola: il Preludio insegna Cercare FACENDOLO trovare qualcosa
    # (gap chiuso 20260716: l'azione era elencata ma nessuna tessera nascondeva
    # nulla). In chiaro, come tutto il tutorial - negli episodi veri gli esiti
    # di Cercare stanno sul retro delle note tessera, solo per chi arbitra.
    ('T2', 'IL DEPOSITO', 'Episodio 1/board/T2 - Sala delle Casse.png',
     'Casse accatastate, quasi tutte vuote: la dogana è un guscio. Una cassa, in un angolo, '
     'è meno impolverata delle altre. QUANDO RIVELATE QUESTA TESSERA: 2 Sgherri appaiono '
     'tra le casse. Le porte E e N sono murate da anni: contano solo S (banchina) e O '
     '(stanzino). SCUOLA — qui c’è qualcosa da trovare: un eroe può spendere un’azione per '
     'Cercare (ACUME, Media). Se riesce, prendete la carta L’ACQUAVITE DEL DAZIERE.'),
    ('T4', 'LO STANZINO DEL DAZIERE', 'Episodio 1/board/T4 - Ufficio del Custode.png',
     'Il vecchio ufficio del daziere: scrivania sfondata, un pagliericcio recente. QUANDO '
     'RIVELATE QUESTA TESSERA: il Sicario appare accanto alla porta. Ansaldo è legato '
     'alla branda: si libera con Interagire (nessuna prova).'),
]

MAZZO_P = ['Bravi sul Molo', 'Il Branco', 'Lama nel Buio',
           'Corrente Gelida', 'Presagio', 'Eco Amica']

# ============================================================== INDAGINE
def indagine():
    out_path = os.path.join(OUT_DIR, 'Indagine.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Preludio - Indagine')
    # lettera
    parchment_art(c, W, H)
    rule_border(c, W, H)
    mx = 28*mm
    c.setFillColor(RED); c.setFont(F['sc'], 24)
    c.drawCentredString(W/2, H - 38*mm, 'preludio')
    c.setFont(F['sc'], 16)
    c.drawCentredString(W/2, H - 47*mm, 'la prova del lume')
    wave(c, W/2 - 20*mm, H - 53*mm, 40*mm, OGOLD)
    lett = LETTERA_P.replace('«Non vi conoscete',
                             '«<font name="%s" size="15" color="#7a1f2b">N</font>on vi conoscete' % F['sc'])
    frame_flow(c, mx, H - 188*mm, W - 2*mx, 122*mm,
               [Paragraph('undici lettere identiche, undici destinatari — leggere ad alta voce', SMB),
                Paragraph(lett, st('let', fontName=F['i'], fontSize=11, leading=16, alignment=4))])
    seal(c, W - mx - 12*mm, H - 198*mm, r=13*mm, angle=-10)
    y = scuola(c, mx, H - 218*mm, W - 2*mx,
               'Questo Preludio insegna il gioco giocando: quando compare un box come questo, '
               'leggetelo ad alta voce. Chi tiene il fascicolo Luoghi ordina le 4 carte Luogo del '
               'Preludio per sigla (è nel titolo: P1-P4) e le dispone in fila, da sinistra a '
               'destra: le prime tre scoperte, l’ultima coperta — la posizione vi dice la sigla. '
               'Ogni giocatore sceglie il suo eroe (stendete le 11 carte Eroe sul tavolo) e '
               'prende la sua Scheda.')
    c.showPage()
    # taccuino
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(16*mm, H - 22*mm, 'taccuino della società — preludio')
    wave(c, W - 58*mm, H - 20*mm, 40*mm, OGOLD)
    c.setFillColor(TEAL); c.setFont(F['b'], 9)
    c.drawString(16*mm, H - 31*mm, 'OROLOGIO — barrate un’ora per ogni visita:')
    for i, hh in enumerate(['18', '19', '20', '21', '22', '23']):
        xx = 16*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.HexColor('#f7f0dd')); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 41*mm, 5*mm, fill=1)
        c.setFillColor(SEPIA); c.setFont(F['r'], 8)
        c.drawCentredString(xx + 5*mm, H - 42*mm, hh)
    c.setFillColor(RED); c.setFont(F['i'], 8.5)
    c.drawString(16*mm + 6*17*mm, H - 42*mm, '! il barcaiolo (P2) c’è solo dalle 21')
    y = scuola(c, 16*mm, H - 52*mm, W - 32*mm,
               'Visitare un luogo costa 1 ora, anche tornarci. Girate la carta, leggete testo e '
               'indizi ad alta voce, annotate qui nomi e parole chiave. Il luogo coperto si può '
               'visitare lo stesso (1 ora): girata la carta, leggete cosa serve per entrare — se '
               'credete di avere la chiave, dichiarate UNA parola o UN oggetto a chi tiene il '
               'fascicolo Luoghi: giusta si entra subito, sbagliata l’ora è comunque spesa. '
               'Alcuni eroi cavano indizi in più (Approfondimenti): quando visitate un luogo, '
               'chi tiene il fascicolo controlla se l’eroe giusto è presente. Due eroi funzionano '
               'diverso: Padre Marani (Discernimento) chiede solo sì o no su un luogo non '
               'ancora visitato, senza leggere nulla; Carbone esamina un Oggetto o un Reperto '
               'già trovato e ne cava un dettaglio in più, se chi tiene il fascicolo ne ha uno.')
    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(16*mm, ytop, label)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(16*mm, ytop - 7*mm - i*7*mm, W - 16*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm
    yy = sect(y - 4*mm, 'persone e sospetti', 4)
    yy = sect(yy, 'indizi e parole chiave', 5)
    c.setFillColor(RED); c.setFont(F['sc'], 11)
    c.drawString(16*mm, yy, 'le 2 domande — rispondete per iscritto, poi aprite la busta della soluzione')
    for i, d in enumerate(DOMANDE_P):
        yd = yy - 10*mm - i*15*mm
        c.setFillColor(INK); c.setFont(F['b'], 10.5)
        c.drawString(16*mm, yd, d)
        c.setStrokeColor(SEPIA)
        c.line(16*mm, yd - 7*mm, W - 16*mm, yd - 7*mm)
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)

# ============================================================ SPEDIZIONE
def spedizione():
    out_path = os.path.join(OUT_DIR, 'Spedizione.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Preludio - Spedizione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 20)
    c.drawCentredString(W/2, H - 32*mm, 'preludio — la dogana vecchia')
    wave(c, W/2 - 20*mm, H - 39*mm, 40*mm, OGOLD)
    frame_flow(c, 24*mm, H - 108*mm, W - 48*mm, 58*mm, [
        Paragraph('Una spedizione in piccolo, per imparare: 3 tessere, nessun mostro — solo '
                  'uomini pagati per non farvi passare. Usate le tessere <b>T1, T2 e T4</b> '
                  'dell’Episodio 1 (i depositi sul canale di Roccamora si somigliano tutti: '
                  'stesse banchine, stesse casse, stessi stanzini) e le miniature di Sgherri, '
                  'Sicario ed eroi. Montaggio: T1 in basso, T2 sopra (uscita N di T1), T4 a '
                  'sinistra di T2 (uscita O). Le porte E e N di T2 sono murate: ignoratele.',
                  BODY),
    ])
    y = scuola(c, 24*mm, H - 84*mm, W - 48*mm,
               'Si gioca in round: prima OGNI EROE fa 2 azioni di tipo diverso (Muovere 3 caselle · Attaccare '
               'un nemico adiacente: 2d6+VIGORE, +1 se armati, contro la sua Difesa · Cercare '
               '· Interagire · Usare un oggetto · Rianimare), poi si pesca 1 carta Minaccia '
               'ogni 2 eroi, poi I NEMICI si muovono verso l’eroe più vicino e attaccano se '
               'adiacenti. Le ferite dei nemici si segnano sul Registro delle Ferite '
               '(ultima pagina).')
    y = scuola(c, 24*mm, y, W - 48*mm,
               'IL MAZZO MINACCIA del Preludio si costruisce con 6 carte dell’Episodio 1: ' +
               ', '.join(MAZZO_P) + '. Mescolatele. Se il mazzo finisce, rimescolate gli scarti. Se '
               'una carta vi dice di piazzare uno Sgherro o un Sicario ma non ne restano più '
               'segnalini, l’effetto di piazzamento non ha luogo: applicate comunque il resto '
               'della carta, se ne ha.')
    y = scuola(c, 24*mm, y, W - 48*mm,
               'LA MAREA — l’orologio della spedizione. Alla fine di ogni 2° round (2°, 4°, '
               '6°...) mettete 1 segnalino Marea (usate i segnalini Canto). Al 3° segnalino '
               'l’acqua invade la dogana: da quel momento ogni eroe ha Movimento -1 (minimo 1). '
               'Negli episodi veri l’orologio fa cose peggiori: imparate a non perdere tempo. '
               'La Marea è acqua, non è il Coro del culto: la Litania di Padre Marani non la '
               'rallenta.')
    c.showPage()
    # note per tessera
    parchment_art(c, W, H)
    rule_border(c, W, H)
    yy = H - 25*mm
    for tid, nome, _, testo in TESSERE_P:
        c.setFillColor(RED); c.setFont(F['sc'], 13)
        c.drawString(20*mm, yy, '%s · %s' % (tid, nome.lower()))
        flow = [Paragraph(testo, st('tile', fontSize=9, leading=12, alignment=4))]
        # 28mm (era 24): il testo di T2 ora porta anche la riga-scuola su
        # Cercare; gap ridotto per compensare, il totale pagina non cambia.
        frame_flow(c, 20*mm, yy - 8*mm - 28*mm, W - 40*mm, 28*mm, flow)
        yy -= 28*mm + 14*mm
    c.setFillColor(TEAL); c.setFont(F['b'], 9.5)
    c.drawString(20*mm, yy, 'NEMICI IN CAMPO (statistiche nel Bestiario del Preludio, PDF a parte in Preludio/):')
    frame_flow(c, 20*mm, yy - 30*mm, W - 40*mm, 26*mm, [
        Paragraph('2 <b>Sgherri</b> in T2 (branco: +1 Attacco se adiacenti tra loro) e 1 '
                  '<b>Sicario</b> in T4 (+2 Attacco contro un eroe isolato o ferito — '
                  'muovetevi in coppia e non gliene lasciate). Le carte Minaccia possono '
                  'portarne altri. Vittoria: liberate Ansaldo (Interagire in T4) e riportatelo '
                  'in T1, alla barca. Ansaldo si muove con voi: 3 caselle, nessuna azione.', BODY)])
    y = scuola(c, 20*mm, yy - 36*mm, W - 40*mm,
               'Se un eroe scende a 0 Salute cade a terra: niente panico, un compagno adiacente '
               'lo Rianima a 2 Salute con un’azione. Se cadete tutti, la prova è fallita: '
               'M. manda i gendarmi, Ansaldo torna a casa comunque — ma la Società riparte '
               'da capo. Rigiocate quando volete.')
    c.showPage()
    registro_ferite(c)
    c.save()
    pad_to_even_pages(out_path)

def registro_ferite(c):
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 16)
    c.drawString(16*mm, H - 22*mm, 'registro delle ferite')
    frame_flow(c, 20*mm, H - 50*mm, W - 40*mm, 20*mm, [
        Paragraph('Chi pesca il mazzo Minaccia tiene anche questo foglio. Una riga per nemico '
                  'attivo: scrivete il tipo e, se ce n’è più di una copia in campo, il numero '
                  'sull’angolo della sua miniatura (es. «Sgherro 2») — riempite una goccia per '
                  'ogni colpo subito; a Ferite piene il nemico cade, cancellate la riga e '
                  'riusatela.', BODY)])
    N_PIP = 10
    gx0, dot_gap = 82*mm, 10.6*mm
    c.setFillColor(TEAL); c.setFont(F['b'], 8)
    c.drawString(20*mm, H - 62*mm, 'nemico')
    for k in range(N_PIP):
        c.setFont(F['b'], 6.5)
        c.drawCentredString(gx0 + k*dot_gap, H - 62*mm, str(k + 1))
    y = H - 70*mm
    while y > 25*mm:
        c.setStrokeColor(SEPIA); c.setLineWidth(0.6)
        c.line(20*mm, y, gx0 - 6*mm, y)
        for k in range(N_PIP):
            c.setStrokeColor(INK); c.setLineWidth(0.8)
            c.circle(gx0 + k*dot_gap, y + 2*mm, 2.6*mm)
        y -= 15*mm
    c.showPage()

# ============================================================= SOLUZIONE
def soluzione():
    out_path = os.path.join(OUT_DIR, 'Soluzione (non aprire).pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Preludio - Soluzione')
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 22)
    c.drawCentredString(W/2, H/2 + 20*mm, 'soluzione del preludio')
    c.setFillColor(INK); c.setFont(F['i'], 12)
    c.drawCentredString(W/2, H/2 + 8*mm, 'Stampate senza leggere. Sigillate in busta.')
    c.drawCentredString(W/2, H/2, 'Si apre solo dopo aver risposto alle 2 Domande.')
    seal(c, W/2, H/2 - 24*mm, r=13*mm, angle=-8)
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 15)
    c.drawString(16*mm, H - 22*mm, 'le risposte')
    flow = [
        Paragraph('<b>1. DOVE è tenuto Ansaldo?</b> Nella cantina della DOGANA VECCHIA, sotto la '
                  'banchina (P2: gli uomini da molo e la parola «dogana»; P4: i colpi ritmici '
                  'sotto le assi; P3 corrobora: stivali chiodati che puzzano di molo). '
                  '<b>Vantaggio se esatta:</b> entrate dalla porta d’acqua senza farvi sentire — '
                  'i 2 Sgherri di T2 non si attivano finché un eroe non entra in T2 o attacca.', BODY),
        Paragraph('<b>2. COSA cercavano nel palazzo?</b> Il FASCICOLO DEL 1741, l’antico dossier '
                  'della Società su una confraternita bandita (P1: la pagina strappata del registro, '
                  'la polvere smossa a metà; P4: il lembo con la mezza onda). '
                  '<b>Vantaggio se esatta:</b> M. vi dà la sua lanterna schermata: una volta nella '
                  'spedizione, annullate una carta Minaccia appena pescata (scartatela senza effetto).', BODY),
        Paragraph('<b>La falsa pista:</b> il nipote di Ansaldo litigò col vecchio per l’argenteria '
                  'impegnata (P3): la notte della sparizione era da Fossa a ritirarla. Innocente. '
                  'Se il gruppo lo ha accusato, nessuna penalità: solo un sopracciglio alzato di M.', BODY),
        Paragraph('<b>Nota per chi arbitra:</b> gli Approfondimenti del Preludio (la polvere, il '
                  'barcaiolo, l’orologio impegnato) corroborano ma non sono mai indispensabili: '
                  'le 2 Domande si risolvono con i soli indizi delle carte. Se il gruppo risponde '
                  '«vicino» (es. «al molo» per la 1), contate la risposta come esatta: è '
                  'una prova d’ammissione, non un esame.', BODY),
    ]
    frame_flow(c, 18*mm, H - 150*mm, W - 36*mm, 122*mm, flow)
    c.setFillColor(RED); c.setFont(F['sc'], 15)
    c.drawString(16*mm, H - 160*mm, 'epilogo — leggere ad alta voce a spedizione conclusa')
    frame_flow(c, 18*mm, H - 246*mm, W - 36*mm, 82*mm, [
        Paragraph('<i>Ansaldo beve mezzo bicchiere prima di parlare. «Volevano il fascicolo del '
                  '1741. Sapevano il numero, sapevano lo scaffale. Chi li pagava non l’ho visto '
                  'mai: veniva di notte, in barca — un signore ben vestito, dicevano, con le mani '
                  'da artigiano. Quando li ho sorpresi, mi hanno chiuso in cantina. Non volevano '
                  'me: volevano quello che sappiamo.»<br/><br/>'
                  'M. posa sul tavolo undici spille: una piccola onda d’argento. «Le undici '
                  'poltrone hanno undici nomi. Benvenuti nella Società del Lume. Riposatevi: '
                  'qualcosa mi dice '
                  'che il prossimo caso busserà presto.»</i><br/><br/>'
                  '<b>Frammento di Campagna n. 0:</b> il lembo di carta con la mezza onda. '
                  'Conservatelo con gli altri Frammenti.', BODY)])
    c.setFillColor(RED); c.setFont(F['sc'], 15)
    c.drawString(16*mm, H - 256*mm, 'bivio — decidete insieme, annotatelo, conterà nell’episodio 1')
    frame_flow(c, 18*mm, 16*mm, W - 36*mm, H - 276*mm, [
        Paragraph('La pagina strappata del registro (il reperto) è una prova di reato. '
                  '<b>La consegnate alla gendarmeria</b> (il brigadiere vi registra come '
                  '«investigatori privati»: nell’Episodio 1, alla Gendarmeria, vi riconosce '
                  'e il fascicolo che nasconde si ottiene senza convincerlo) <b>oppure la tenete '
                  'nell’archivio della Società</b> (M. la studia: nell’Episodio 1 iniziate '
                  'l’Indagine con 1 ora in più sul Taccuino)?', BODY)])
    c.showPage()
    c.save()
    pad_to_even_pages(out_path)

# ========================================================= LUOGHI (narratore)
TIPO_EROI = {'Osservazione': 'Elena', 'Presagio': 'Serra',
             'Testimonianza': 'Ottone o Carla', 'Referto': 'Attilio o Brera'}
TIPO_LABEL = {'Osservazione': 'Indizio Nascosto', 'Presagio': 'Indizio Nascosto',
              'Testimonianza': 'Testimone', 'Referto': 'Referto'}
TORN_TOP = 'background scheda personaggio.png'
WINDOW_TOP = (0.50, 0.49, 1.03, 1.03)
MX = 20*mm
ART_BOTTOM = WINDOW_TOP[1] * H
COL_W = WINDOW_TOP[0]*W - MX - 4*mm
DESC_TOP = H - 37*mm
DESC_MAX_H = DESC_TOP - (ART_BOTTOM - 4*mm) - 3*mm
# Override overscan/top_margin/center_x per-luogo quando il ritaglio standard
# non valorizza il soggetto (stesso motivo/pattern di LUOGHI_CROP in
# gen_narrator.py per l'Episodio 1).
LUOGHI_P_CROP = {
    'P2': dict(overscan=0.1, center_x=0.85),  # l'oste e mani/bicchiere sono a destra
}

def fit_desc(c, text, start=9.5, floor=7, desc_top=None):
    top = DESC_TOP if desc_top is None else desc_top
    max_h = top - (ART_BOTTOM - 4*mm) - 3*mm
    size = start
    while True:
        style = st('desc', fontName=F['i'], fontSize=size, leading=size*1.42, alignment=4)
        p = Paragraph(text, style)
        w, h = p.wrapOn(c, COL_W, 400*mm)
        if h <= max_h or size <= floor:
            return p, h
        size -= 0.3

# Carte Oggetto per luogo del Preludio (sotto-sezione "carte da prendere"
# della sezione Indizi - vedi gen_narrator.py, stesso pattern): l'Oggetto e'
# gia' nominato nell'indizio letto ad alta voce, questa mappa serve solo a
# chi arbitra per sapere quale carta fisica prendere. A differenza di
# Episodio 1 (OGGETTI in gen_cards.py, con 'ref'), il Preludio non ha una
# lista strutturata: solo 2 oggetti, entrambi a P1, mappati qui a mano.
# Esami di Carbone (vedi gen_cards.ESAMI_CARBONE per la bibbia di scrittura)
ESAMI_CARBONE_P = {
    'ANELLO DI CHIAVI': '«Ferro dolce, chiavi vecchie — tranne una: tagliata da poco, su '
                'calco di cera. Qualcuno ha voluto un doppione senza passare dal fabbro '
                'della Società. Ansaldo le sue chiavi le conosceva a peso: questa non '
                'è sua.»',
}

OGGETTI_LUOGO_P = {
    'P1': ['L’Anello di Chiavi', 'La Pipa di Ansaldo'],
}

def luoghi():
    missing = [L['art'] for L in LUOGHI_P
               if not os.path.exists(os.path.join(ARTWORKS_DIR, L['art']))]
    if missing:
        print('SALTO Luoghi.pdf: manca arte in artworks/:', ', '.join(missing))
        print('  (genera con i prompt in PROMPT-MIDJOURNEY-Preludio.md)')
        return
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Preludio - Luoghi (riferimenti narratore)')
    ROW = st('row', fontSize=10.5, leading=15)
    NONE_ROW = st('none_row', fontName=F['i'], fontSize=9.5, leading=14, textColor=SEPIA)
    INDIZIO_ROW = st('indizio_row', fontName=F['i'], fontSize=10, leading=14)

    def body(rows, y_start, none_text='Nessun Approfondimento qui.'):
        y = y_start
        if not rows:
            p = Paragraph(none_text, NONE_ROW)
            p.wrapOn(c, W - 2*MX, 20*mm)
            p.drawOn(c, MX, y - 5*mm)
            return
        for r in rows:
            p = Paragraph(f'— {r}', ROW)
            pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
            p.drawOn(c, MX, y - ph)
            y -= ph + 4*mm

    def nome_fit(text, max_w, start=17):
        size = start
        while c.stringWidth(text.lower(), F['sc'], size) > max_w and size > 10:
            size -= 1
        return size

    # Indice voce di Mappa -> carta Luogo, solo per chi arbitra (stesso
    # pattern di gen_narrator.pagina_indice_citta) + retro di servizio per
    # la parita' fronte/retro delle coppie luogo/retro che seguono.
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(MX, H - 22*mm, 'la città in questo episodio — solo per chi arbitra')
    c.setFillColor(INK); c.setFont(F['i'], 9.5)
    c.drawString(MX, H - 29*mm, 'Quando il gruppo dichiara una destinazione dalla Mappa, cercatela qui:')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, H - 33*mm, W - MX, H - 33*mm)
    y = H - 42*mm
    for L in LUOGHI_P:
        p = Paragraph(f"<b>{L['voce_mappa']}</b> — carta Luogo {L['n']} ({L['nome'].title()})", ROW)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 3.5*mm
    y -= 3*mm
    c.setStrokeColor(SEPIA); c.setLineWidth(0.4)
    c.line(MX, y, W - MX, y)
    p = Paragraph('<b>Ogni altra voce della Mappa</b> — pista fredda: rispondete con una frase '
                  'di colore («bussate, nessuno apre: qui non c’è nulla per voi stanotte»). '
                  '<b>Nessuna ora spesa.</b>', ROW)
    pw, ph = p.wrapOn(c, W - 2*MX, 30*mm)
    p.drawOn(c, MX, y - 6*mm - ph)
    c.showPage()
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawString(MX, H - 22*mm, 'come si usa questo fascicolo')
    for i, riga in enumerate([
            'Ogni luogo occupa un foglio: sul fronte la scena e gli indizi da leggere ad alta voce',
            '(e, se il luogo è bloccato, la riga rossa con cui verificare la chiave dichiarata);',
            'sul retro gli Approfondimenti — sempre presenti, anche quando non c’è nulla, così',
            'sfogliando non si capisce mai dove si nasconde qualcosa.',
            'Se NESSUN eroe al tavolo può più sbloccare un tipo, concedete l’Aiuto profano',
            '(Regolamento): ACUME Difficile, una sola volta per luogo — riuscita sblocca,',
            'fallita sigilla l’Approfondimento qui.',
            'Sesto Senso di Sibilla: consegnate un Approfondimento QUALSIASI ancora chiuso',
            'del luogo presente; se non ne restano, nominate un luogo che ne nasconde',
            'ancora uno — solo il nome, mai il tipo. Se non resta nulla, il jolly non si spende.']):
        c.setFillColor(INK); c.setFont(F['i'], 10)
        c.drawString(MX, H - 32*mm - i*6*mm, riga)
    c.showPage()

    for L in LUOGHI_P:
        # Fronte: arte + indizi (letti ad alta voce) + eventuale Oggetto da
        # consegnare. Retro: SEMPRE gli Approfondimenti, anche quando il
        # luogo non ne ha nessuno - stessa struttura visiva in entrambi i
        # casi, cosi' chi arbitra non puo' distinguerli sfogliando (stesso
        # pattern di gen_narrator.py). Le due pagine restano consecutive nel
        # PDF cosi' una stampa fronte/retro le allinea sullo stesso foglio.
        torn_portrait(c, W, H, L['art'], TORN_TOP, window=WINDOW_TOP,
                      **LUOGHI_P_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(MX, H - 20*mm, ('luogo ' + L['n']).lower())
        size = nome_fit(L['nome'], COL_W, start=18)
        c.setFillColor(RED); c.setFont(F['sc'], size)
        c.drawString(MX, H - 30*mm, L['nome'].lower())
        desc_top = DESC_TOP
        if L.get('chiave'):
            # Oracolo della regola Bussare, subito sotto il nome del luogo
            # (stesso pattern di gen_narrator.py): l'unico posto dove la
            # chiave del luogo bloccato e' scritta.
            tipo_chiave, valore = L['chiave']
            chiave_txt = (f'la parola «{valore}»' if tipo_chiave == 'parola'
                          else f'l’oggetto “{valore}”')
            c.setFillColor(RED); c.setFont(F['sc'], 9)
            c.drawString(MX, H - 36*mm, f'si entra con {chiave_txt} — solo per chi arbitra')
            desc_top = H - 43*mm
        d, dh = fit_desc(c, LUOGHI_P_DESC[L['n']], desc_top=desc_top)
        d.drawOn(c, MX, desc_top - dh)
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        c.line(MX, ART_BOTTOM - 4*mm, W - MX, ART_BOTTOM - 4*mm)
        c.setFillColor(TEAL); c.setFont(F['sc'], 9)
        c.drawString(MX, ART_BOTTOM - 10*mm, 'indizi — leggeteli ad alta voce')
        y = ART_BOTTOM - 15*mm
        for ind in L.get('indizi', []):
            p = Paragraph(f'• {ind}', INDIZIO_ROW)
            pw, ph = p.wrapOn(c, W - 2*MX, 60*mm)
            p.drawOn(c, MX, y - ph)
            y -= ph + 3*mm
        oggetti = OGGETTI_LUOGO_P.get(L['n'], [])
        if oggetti:
            y -= 2*mm
            c.setStrokeColor(SEPIA); c.setLineWidth(0.3)
            c.line(MX, y, W - MX, y)
            y -= 6*mm
            c.setFillColor(TEAL); c.setFont(F['sc'], 8)
            c.drawString(MX, y, 'carte da prendere — solo per chi arbitra')
            y -= 5*mm
            body([f'<b>Oggetto</b> — carta “{nome}”' for nome in oggetti], y)
        c.showPage()

        parchment_art(c, W, H)
        rule_border(c, W, H)
        max_w = W - 2*MX
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(MX, H - 20*mm, ('luogo ' + L['n']).lower())
        size = nome_fit(L['nome'], max_w)
        c.setFillColor(RED); c.setFont(F['sc'], size)
        c.drawString(MX, H - 30*mm, L['nome'].lower())
        c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
        c.line(MX, H - 36*mm, W - MX, H - 36*mm)
        c.setFillColor(TEAL); c.setFont(F['sc'], 10)
        c.drawString(MX, H - 44*mm, 'approfondimenti')
        c.setFillColor(TEAL); c.setFont(F['sc'], 8.5)
        c.drawString(MX, H - 50*mm, 'carte da prendere — solo per chi arbitra')
        rows = []
        for a in L['approfondimenti']:
            tipo = TIPO_LABEL[a['tipo']]
            sblocca = f"sblocca: {TIPO_EROI[a['tipo']]}, o Sibilla col jolly"
            if 'soggetto' in a:
                rows.append(f"<b>{tipo}</b> — carta “{a['soggetto']}” <i>({sblocca})</i>")
            else:
                rows.append(f"<b>{tipo}</b> <i>({a['tipo']} — {sblocca})</i>")
        body(rows, H - 55*mm)
        c.showPage()
    import gen_narrator as N
    N.pagina_esami_carbone(c, ESAMI_CARBONE_P)
    c.save()
    pad_to_even_pages(out_path)

if __name__ == '__main__':
    indagine()
    spedizione()
    soluzione()
    luoghi()
    print('OK preludio')
