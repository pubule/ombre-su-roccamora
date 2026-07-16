# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Regolamento + Soluzione (PDF)."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                PageBreak, Table, TableStyle, HRFlowable)
from deluxe_style import (register_fonts, parchment_art, pad_to_even_pages, seal, F,
                          INK, RED, RED_DK, TEAL, GOLD, SEPIA, PAPER_DK)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
EP1_DIR = os.path.join(OUT_DIR, 'Episodio 1')
os.makedirs(EP1_DIR, exist_ok=True)
register_fonts()
PAPER = PAPER_DK
TEXT_W = A4[0] - 44*mm  # = leftMargin+rightMargin di regolamento()/soluzione() (22mm ciascuno)


def bg(canv, doc):
    canv.saveState()
    parchment_art(canv, A4[0], A4[1])
    canv.setStrokeColor(SEPIA); canv.setLineWidth(0.6)
    canv.rect(9*mm, 9*mm, A4[0] - 18*mm, A4[1] - 18*mm)
    canv.setFillColor(SEPIA)
    canv.setFont(F['sc'], 7.5)
    canv.drawCentredString(A4[0]/2, 4.2*mm, 'ombre su roccamora \u00b7 societ\u00e0 del lume')
    canv.restoreState()


def bg_cover(canv, doc):
    bg(canv, doc)
    canv.saveState()
    seal(canv, A4[0] - 22*mm, A4[1] - 20*mm, r=11*mm, angle=-14)
    canv.restoreState()


S = {}
S['title'] = ParagraphStyle('t', fontName=F['sc'], fontSize=31, leading=36,
                            textColor=RED, alignment=1, spaceAfter=4)
S['subtitle'] = ParagraphStyle('st', fontName=F['i'], fontSize=13.5, leading=18,
                               textColor=INK, alignment=1, spaceAfter=14)
S['h1txt'] = ParagraphStyle('h1t', fontName=F['sc'], fontSize=13.5, leading=16,
                            textColor=colors.HexColor('#f1e2b8'))
S['h2'] = ParagraphStyle('h2', fontName=F['b'], fontSize=11, leading=14,
                         textColor=TEAL, spaceBefore=10, spaceAfter=3)
S['body'] = ParagraphStyle('b', fontName=F['r'], fontSize=10.5, leading=14,
                           textColor=INK, spaceAfter=5, alignment=4)
S['li'] = ParagraphStyle('li', parent=S['body'], leftIndent=14, bulletIndent=4, spaceAfter=3)
S['box'] = ParagraphStyle('bx', parent=S['body'], backColor=PAPER, borderColor=SEPIA,
                          borderWidth=0.9, borderPadding=7, spaceBefore=6, spaceAfter=8)
S['warn'] = ParagraphStyle('w', fontName=F['sc'], fontSize=20, leading=26,
                           textColor=RED, alignment=1, spaceBefore=20, spaceAfter=20)


def h1_bar(txt, width=TEXT_W):
    """Banner rosso stile 5e per i titoli di sezione, al posto del semplice
    testo colorato: piu' vicino al look 'manuale' chiesto."""
    t = Table([[Paragraph(txt.lower(), S['h1txt'])]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), RED_DK),
        ('LINEABOVE', (0, 0), (-1, 0), 1.1, GOLD),
        ('LINEBELOW', (0, 0), (-1, -1), 1.1, GOLD),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 4.2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.2),
    ]))
    t.spaceBefore = 14
    t.spaceAfter = 7
    return t


def dropcap(txt, size=20):
    """Prima lettera ingrandita in rosso, stesso trucco gia' usato per la
    lettera d'incarico in gen_gothic.py."""
    return '<font name="%s" size="%d" color="#7a1f2b">%s</font>%s' % (F['sc'], size, txt[0], txt[1:])


def P(txt, st='body'):
    if st == 'h1':
        return h1_bar(txt)
    return Paragraph(txt, S[st])


def LI(txt):
    return Paragraph(txt, S['li'], bulletText='\u2022')


def hr():
    return HRFlowable(width='100%', thickness=0.8, color=TEAL, spaceBefore=4, spaceAfter=8)


# ----------------------------------------------------------------- REGOLAMENTO
def regolamento():
    doc = SimpleDocTemplate(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-01-Regolamento.pdf'),
                            pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                            topMargin=20*mm, bottomMargin=20*mm,
                            title='Ombre su Roccamora - Regolamento')
    e = []
    e.append(Spacer(1, 30))
    e.append(P('OMBRE SU ROCCAMORA', 'title'))
    e.append(P('Un gioco investigativo cooperativo a puntate \u2014 per 2\u201310 giocatori', 'subtitle'))
    e.append(hr())
    e.append(P(dropcap("Roccamora, 1889. Una citt\u00e0 di canali neri, campanili e vicoli che non figurano "
               "sulle mappe. Voi siete i membri della <b>Societ\u00e0 del Lume</b>, un piccolo circolo "
               "privato che indaga su ci\u00f2 che la gendarmeria preferisce non vedere. Ogni episodio "
               "\u00e8 un caso. Ogni caso risolto \u00e8 un frammento di un mistero pi\u00f9 grande, che "
               "dorme sotto la citt\u00e0 dal 1741.")))
    e.append(P('COSA VI SERVE', 'h1'))
    e.append(LI('Questo regolamento e i PDF dell\u2019episodio, stampati (vedi \u201cCome stampare\u201d in fondo).'))
    e.append(LI('Due dadi a sei facce (2d6), una matita ciascuno.'))
    e.append(LI('Forbici per ritagliare carte, tessere e segnalini.'))
    e.append(LI('Una busta in cui sigillare il PDF <b>Soluzione</b>: si apre solo a fine indagine.'))

    e.append(P('I PERSONAGGI', 'h1'))
    e.append(P("Il roster della Societ\u00e0 conta <b>undici eroi</b>: ne scendono in tavola tanti quanti "
               "siete, fino a dieci \u2014 gli altri restano di riserva (potete cambiarli tra un episodio e l\u2019altro; "
               "migliorie e cicatrici restano a chi le ha guadagnate). Per scegliere, stendete sul "
               "tavolo le <b>11 carte Eroe</b> (ritratto, ruolo, chi sono \u2014 cartelle "
               "<b>cards/Eroi/</b>): ogni giocatore ne prende una (in 2 giocatori vi consigliamo "
               "di guidarne due a testa: con solo due eroi in campo l\u2019indagine regge peggio), "
               "poi passa alla Scheda Personaggio corrispondente per "
               "statistiche e abilit\u00e0. Scegliere chi portare \u00e8 gi\u00e0 una mossa: ogni eroe apre "
               "porte diverse nell\u2019Indagine, e chi lasciate a casa le lascia chiuse. Ogni eroe "
               "ha tre caratteristiche:"))
    e.append(LI('<b>ACUME</b> \u2014 osservare, dedurre, scassinare, cercare.'))
    e.append(LI('<b>VIGORE</b> \u2014 combattere, forzare, resistere.'))
    e.append(LI('<b>NERVI</b> \u2014 sangue freddo davanti a trappole, buio e orrori.'))
    e.append(P("Inoltre: <b>Salute</b> (i danni che potete subire), <b>Difesa</b> (quanto \u00e8 difficile "
               "colpirvi) e un\u2019<b>Abilit\u00e0 unica</b>. Tutto \u00e8 sulla scheda personaggio."))
    e.append(P('Le prove', 'h2'))
    e.append(P('<b>Tirate 2d6 e sommate la caratteristica richiesta.</b> Dovete raggiungere la '
               'difficolt\u00e0: <b>Facile 7 \u2022 Media 9 \u2022 Difficile 11</b>. '
               'Una volta per episodio, ogni eroe pu\u00f2 <b>ritentare</b> una prova fallita '
               '(segnate la casella \u201cSecondo fiato\u201d sulla scheda).', 'box'))

    e.append(P('COME SI GIOCA UN EPISODIO', 'h1'))
    e.append(P("Ogni episodio si gioca in una serata (90\u2013150 minuti) e ha due fasi: "
               "l\u2019<b>Indagine</b> in citt\u00e0 e la <b>Spedizione</b> nel luogo che avrete scoperto. "
               "Quanto bene indagate determina quanto sar\u00e0 dura la spedizione."))

    e.append(P('FASE 1 \u2014 L\u2019INDAGINE', 'h1'))
    e.append(LI('Disponete le <b>carte Luogo</b> al centro del tavolo: quelle che riportano '
                '\u201cDisponibile dall\u2019inizio\u201d <b>scoperte</b> (sono le piste che qualunque investigatore '
                'batterebbe: la casa dello scomparso, la taverna, la gendarmeria...), le altre '
                '<b>coperte</b> \u2014 luoghi di cui per ora conoscete solo l\u2019esistenza, non il volto.'))
    e.append(LI('Avete <b>6 ore</b>, dalle 18:00 alle 24:00: segnatele sul Taccuino. '
                '<b>Ogni visita a un luogo costa 1 ora</b> (anche rivisitarlo) \u2014 gli 8 luoghi di un '
                'episodio non entrano tutti in 6 ore: <b>dovrete scegliere cosa saltare</b>. Ogni ora '
                'conta: alcuni luoghi vanno prima sbloccati, altri chiudono a un\u2019ora precisa \u2014 '
                'pianificate l\u2019ordine delle visite e non sprecate ore su vicoli ciechi. '
                'L\u2019episodio pu\u00f2 legare eventi all\u2019orologio: applicateli quando barrate '
                'l\u2019ora corrispondente.'))
    e.append(LI('<b>Scegliere dove andare</b> — la <b>Mappa di Roccamora</b> (stampata con '
                'l’episodio, sempre sul tavolo) elenca nello stradario molti più luoghi di quelli in '
                'gioco. Potete visitare una carta scoperta indicandola, oppure <b>dichiarare una '
                'voce dello stradario</b>: chi tiene il fascicolo <b>Luoghi</b> la cerca nel suo '
                'indice. Se la città non ha nulla per voi lì, ve lo dice subito — <b>pista fredda, '
                'nessuna ora spesa</b>. Se invece il luogo è nell’episodio, la visita parte e '
                '<b>l’ora si spende</b>: dichiarare è impegnarsi.'))
    e.append(LI('<b>Visitare un luogo</b> — girate la carta (mostra solo l’ambientazione): chi tiene '
                'il fascicolo <b>Luoghi</b> legge ad alta voce testo e indizi da lì. Prendete appunti '
                'sul Taccuino: nomi, orari, parole chiave.'))
    e.append(LI('<b>Alla prima visita, “leggere la scena”</b> — prima di leggere testo e indizi, il '
                'gruppo indica un eroe che prova ACUME Media. <b>Testo, indizi, l’eventuale parola '
                'chiave e l’eventuale oggetto si leggono comunque</b>, che la prova riesca o no: non '
                'si perde mai un’informazione necessaria a un tiro sbagliato. Se la prova fallisce, '
                'però, l’eventuale <b>Approfondimento</b> di quel luogo (sotto) resta nascosto per '
                'questa visita: tornateci un’altra volta (di nuovo 1 ora, come ogni visita, ma senza '
                'ripetere la prova) per coglierlo.'))
    e.append(LI('<b>Bussare a una porta chiusa</b> — se la destinazione è un luogo bloccato (carta '
                'coperta), chi tiene il fascicolo gira la carta e leggete che cosa vi sbarra la '
                'strada. Se credete di avere la chiave, dichiaratela — <b>UNA parola o UN oggetto '
                'per visita</b> — a chi tiene il fascicolo, che verifica (senza dire altro): giusta, '
                'si entra subito, nella stessa ora; sbagliata, <b>l’ora è comunque spesa</b> e '
                'restate fuori. Nessun’altra penalità: con 6 ore e 8 luoghi, un’ora persa è già un '
                'prezzo salato.'))
    e.append(LI('<b>Approfondimenti</b> — alcuni luoghi nascondono indizi <i>extra</i> '
                '(oltre a quelli sopra, mai al posto loro) che emergono solo se un eroe presente sa '
                'come cavarli <b>e</b> se avete superato la prova di “leggere la scena” a quella visita. '
                '<b>Almeno un dettaglio decisivo per le 4 Domande emerge solo così</b> — qualsiasi '
                'Approfondimento va bene, non importa quale o di chi: se l’indagine finisce senza '
                'averne consultato nemmeno uno, alcune risposte resteranno solo probabili, non certe.'))
    e.append(P('Le carte Approfondimento sono <b>3 mazzi fisici</b> (Indizi Nascosti, Testimoni, '
               'Referti), tenuti insieme in un <b>unico mazzo coperto</b>: il dorso mostra solo il '
               '<b>tipo</b>, mai il luogo, così le carte restano irriconoscibili e riusabili tra '
               'episodi. Quando visitate un luogo e un eroe presente sblocca quel tipo, chi tiene il '
               'fascicolo <b>Luoghi</b> controlla il suo elenco (solo per chi arbitra, mai letto ad '
               'alta voce) e vi passa la carta corrispondente dal mazzo. Se il luogo non è '
               'nell’elenco, non ne ha — così non sapete mai in anticipo dove si nasconde qualcosa. '
               'Il fascicolo non contiene le risposte alle 4 Domande.', 'body'))
    e.append(LI('<b>Indizio Nascosto (Osservazioni)</b> \u2014 un dettaglio in pi\u00f9 sulla scena. Lo '
                'sblocca <b>Elena</b> (2 volte a episodio), oltre al jolly di Sibilla (<b>Sesto '
                'Senso</b>: un Approfondimento qualsiasi del luogo presente, o intuisce dove '
                'cercarne uno \u2014 1 volta a episodio).'))
    e.append(LI('<b>Indizio Nascosto (Presagi)</b> \u2014 quello che i sani non sentono. Lo sblocca il '
                '<b>Dott. Serra</b> (1 volta a episodio), oltre al jolly di Sibilla.'))
    e.append(LI('<b>Testimone</b> \u2014 qualcuno che si lascia convincere a parlare. Lo sblocca '
                '<b>Ottone</b> o <b>Carla</b> (offrendo da bere o con la tessera stampa \u2014 1 volta a '
                'episodio ciascuno), oltre al jolly di Sibilla.'))
    e.append(LI('<b>Referto</b> \u2014 un esame della scena o di un oggetto. Lo sblocca <b>Attilio</b> '
                'o <b>Brera</b> (1 volta a episodio ciascuno), oltre al jolly di Sibilla.'))
    e.append(LI('<b>Carbone</b> non sblocca carte del mazzo: la sua abilit\u00e0 esamina un <b>Oggetto '
                'o Reperto</b> gi\u00e0 trovato e ne cava un dettaglio in pi\u00f9 (1 volta a episodio \u2014 '
                'chi tiene il fascicolo Luoghi legge la voce corrispondente, se c\u2019\u00e8).'))
    e.append(LI('<b>Padre Marani</b> non sblocca carte: con <b>Discernimento</b> (1 volta a '
                'episodio) indica un luogo e chi tiene il fascicolo Luoghi risponde solo '
                '<b>s\u00ec o no</b>: \u201cl\u00ec si nasconde ancora qualcosa?\u201d \u2014 mai cosa, mai di che tipo. '
                'Se la risposta \u00e8 s\u00ec, quella visita non costa l\u2019ora (non conta come ora avanzata) '
                '\u2014 ma tira comunque \u201cleggere la scena\u201d come ogni prima visita.'))
    e.append(LI('<b>Nino</b> non sblocca carte: la sua abilit\u00e0 (<b>Grimaldello</b>) entra in un luogo '
                'bloccato senza parola chiave n\u00e9 oggetto, 1 volta a episodio \u2014 bypassa solo il '
                'requisito d\u2019ingresso: una volta dentro si tira \u201cleggere la scena\u201d come sempre.'))
    e.append(P('<b>Esempio:</b> il gruppo visita il Luogo 1 (Campanile) con Elena presente. Prima di '
               'tutto, un eroe a scelta legge la scena: 2d6+ACUME (3) = 10, raggiunge la Media (9) \u2014 '
               'via libera. Girate la carta, leggete testo e i 3 indizi core \u2014 sempre, a chiunque, '
               'tiro riuscito o no. Poich\u00e9 la prova \u00e8 riuscita ed Elena c\u2019\u00e8, chi tiene il fascicolo '
               'Luoghi controlla la voce \u201cLuogo 1\u201d: c\u2019\u00e8 un Indizio Nascosto, prende dal mazzo coperto '
               'la carta di quel tipo e la legge ad alta voce. Pi\u00f9 tardi il gruppo visita il Luogo 2 '
               '(Bice) con Ottone: la prova di leggere la scena questa volta fallisce (7 contro Media '
               '9) \u2014 gli indizi core si leggono comunque, ma il Testimone di Bice resta per ora '
               'nascosto: dovranno tornarci un\u2019altra ora, senza ripetere la prova, per convincerla. '
               'Se un luogo non \u00e8 in elenco per quel tipo, semplicemente non c\u2019\u00e8 nulla da trovare l\u00ec '
               'per quell\u2019eroe, tiro o non tiro.', 'box'))
    e.append(LI('<b>Reperti</b> \u2014 nessuna azione o prova in pi\u00f9: si ottengono semplicemente '
                'visitando il luogo, come qualsiasi indizio core. Quando un indizio, sulla carta '
                'stessa, riporta tra parentesi <i>(Reperto X: consegnate...)</i>, non limitatevi a '
                'leggerlo \u2014 consegnate al gruppo il foglio stampato indicato e lasciate che lo '
                'leggano loro. Sono solo un modo pi\u00f9 tangibile di leggere lo stesso indizio: non '
                'contengono nulla in pi\u00f9 rispetto alla carta.'))
    e.append(P('Chiudere l\u2019indagine', 'h2'))
    e.append(P("Quando esaurite le ore (o prima, se vi sentite pronti) rispondete <b>per iscritto</b> "
               "alle <b>4 Domande</b> sul Taccuino: discutetene insieme, \u00e8 il cuore del gioco. "
               "Poi aprite la busta della <b>Soluzione</b>: per ogni risposta esatta otterrete un "
               "<b>Vantaggio</b> per la Spedizione; per certe risposte sbagliate, una complicazione. "
               "La Soluzione vi dir\u00e0 anche come preparare la mappa."))
    e.append(LI('<b>Il Vantaggio extra (velocit\u00e0 O approfondimento)</b> \u2014 se al momento delle '
                'risposte avete <b>ore ancora sul Taccuino</b>, oppure avete visitato <b>molti '
                'luoghi</b> (anche spendendo tutte le ore per farlo), la Soluzione vi dar\u00e0 un '
                'vantaggio in pi\u00f9: sono <b>due strade alternative allo stesso premio</b>, la fretta '
                'e la completezza valgono uguale \u2014 prendete quella che vi somiglia di pi\u00f9. Fermarsi '
                'presto senza aver visitato molto vuol dire comunque rispondere con meno indizi in '
                'mano: quanto rischiare lo decidete voi.'))
    e.append(LI('<b>Il gettone Intuizione</b> \u2014 premio a parte, riservato a chi non lascia '
                '<b>nessuna ora</b> sul Taccuino (le avete spese tutte esplorando): <b>una volta in '
                'Spedizione</b>, subito dopo un tiro fallito di un vostro eroe, potete ripeterlo e '
                'tenere il nuovo risultato. La via veloce, che per definizione tiene ore in banca, '
                'non lo ottiene mai.'))

    e.append(PageBreak())
    e.append(P('FASE 2 \u2014 LA SPEDIZIONE', 'h1'))
    e.append(P("Costruite il luogo con le <b>tessere Mappa</b>, a faccia in gi\u00f9 tranne quella "
               "d\u2019ingresso, seguendo lo schema della Soluzione. Mischiate il <b>mazzo Minaccia</b>. "
               "Piazzate i segnalini eroe sull\u2019ingresso. Si gioca in <b>round</b>:"))
    e.append(P('1. Turno degli eroi', 'h2'))
    e.append(P('In qualsiasi ordine, ogni eroe compie <b>2 azioni, sempre di tipo diverso</b> '
               '(mai la stessa due volte \u2014 niente due Attacchi o due Movimenti nello stesso turno; '
               'un\u2019abilit\u00e0 che concede un\u2019azione extra, come Colpo da macello di Ottone, non conta: '
               '\u00e8 un\u2019azione in pi\u00f9, non una delle due scelte dall\u2019eroe):'))
    e.append(LI('<b>Muovere</b> \u2014 fino a 3 caselle (niente diagonali, non si attraversano nemici o mobili).'))
    e.append(LI('<b>Attaccare</b> \u2014 un nemico adiacente: 2d6 + VIGORE (+1 se armato) \u2265 Difesa '
                'del nemico \u2192 gli infliggete 1 ferita: segnatela sul <b>Registro delle Ferite</b> '
                '(lo tiene chi pesca il mazzo Minaccia quel round). Difesa e Ferite di ogni nemico '
                'stanno nel <b>Bestiario</b> dell\u2019episodio, tenuto aperto accanto al Registro (la '
                'carta Creatura mostra solo ritratto e indole). Quando le ferite segnate raggiungono '
                'il valore <b>Ferite</b> del Bestiario, il nemico cade: rimuovetelo dal tabellone e '
                'cancellate la sua riga sul Registro.'))
    e.append(LI('<b>Cercare</b> — su una tessera già rivelata, prova di ACUME Media: se riuscita, '
                'trovate l’<b>oggetto</b> che nasconde (una sola volta per tessera; non tutte le '
                'tessere ne nascondono uno). Non serve per l’obiettivo dell’episodio (liberare un '
                'prigioniero, prendere ciò che va portato via): quello si fa con <b>Interagire</b>, '
                'dove la Soluzione lo indica.'))
    e.append(LI('<b>Interagire</b> — aprire porte e grate, tirare leve, liberare prigionieri.'))
    e.append(LI('<b>Usare un oggetto</b> \u2014 come indicato sulla sua carta.'))
    e.append(LI('<b>Rianimare</b> \u2014 un eroe a terra adiacente torna a 2 Salute.'))
    e.append(P('Quando un eroe esce da una tessera verso una tessera coperta, <b>rivelatela</b> e '
               'leggetene subito il testo: è automatico, non un’azione, e non è la stessa cosa di '
               'Cercare — rivelare mostra <i>che stanza è</i>, Cercare (sopra) trova <i>cosa ci ha '
               'lasciato chi ci è passato prima di voi</i>.'))
    e.append(P('2. Fase Minaccia', 'h2'))
    e.append(P('Pescate carte Minaccia in base a quanti eroi sono in tavola (vedi tabella sotto \u2014 poi '
               'vedi “Giocare in pochi o in tanti” più avanti per il bonus Ferite che '
               'va con questi numeri) e applicatene gli effetti:', 'body'))
    minaccia_reg_t = Table([
        ['Eroi in tavola', '2\u20133', '4\u20136', '7\u201310'],
        ['Carte da pescare', '1', '2', '2 (+1 nei round pari)'],
    ], colWidths=[34*mm, 40*mm, 40*mm, 52*mm])
    minaccia_reg_t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), F['b']),
        ('FONTNAME', (1, 0), (-1, -1), F['r']),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f6efdb')]),
        ('GRID', (0, 0), (-1, -1), 0.6, TEAL),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    e.append(minaccia_reg_t)
    e.append(Spacer(1, 4))
    e.append(P('Il mazzo Minaccia \u00e8 il vostro \u201cmaster\u201d automatico: nessun giocatore interpreta '
               'il nemico. Un giocatore qualsiasi pesca (consiglio: nominate un <b>custode del '
               'mazzo</b> a inizio serata, o pescate a turno), legge la carta ad alta voce ed '
               'esegue ci\u00f2 che dice: \u00e8 sempre il testo a stabilire dove piazzare nemici ed '
               'effetti. <b>Regola d\u2019oro per ogni ambiguit\u00e0</b> (uscite equidistanti, eroi a '
               'pari distanza, pi\u00f9 bersagli validi): decide il gruppo scegliendo <b>l\u2019opzione '
               'peggiore per s\u00e9</b>. Vale in tutta la spedizione, anche per i nemici.'))
    e.append(P('Il Canto', 'h2'))
    e.append(P('Non \u00e8 un nemico n\u00e9 un oggetto: \u00e8 un <b>orologio della sventura</b>, tracciato con '
               'segnalini <b>Canto</b> che si accumulano e non tornano mai indietro. Cresce da due '
               'fonti insieme:'))
    e.append(LI('Alcune carte Minaccia aggiungono <b>1 segnalino</b> quando le pescate (l\u2019episodio '
                'dice quali).'))
    e.append(LI('<b>In pi\u00f9</b>, a prescindere dalle carte pescate: <b>ogni 4\u00b0 round</b> (4\u00b0, 8\u00b0, '
                '12\u00b0...) aggiungete comunque 1 segnalino. \u00c8 un secondo orologio parallelo: garantisce '
                'che il pericolo massimo arrivi comunque, anche evitando ogni carta Canto.'))
    e.append(P('Ogni episodio fissa una <b>soglia</b> (l\u2019episodio dice quale \u2014 per l\u2019Episodio 1: '
               '<b>3 segnalini</b>): al suo raggiungimento, il nemico pi\u00f9 forte dell\u2019episodio si '
               'desta immediatamente e da quel momento <b>ogni Fase Minaccia pesca 1 carta in pi\u00f9</b> '
               'del normale, per il resto della spedizione. La Soluzione vi dir\u00e0 i dettagli specifici '
               '(chi si desta, dove compare).', 'box'))
    e.append(P('3. Turno dei nemici', 'h2'))
    e.append(LI('Ogni nemico si muove del suo Movimento verso l\u2019eroe pi\u00f9 vicino (a pari '
                'distanza vale la regola d\u2019oro: contro di s\u00e9).'))
    e.append(LI('Se adiacente a un eroe, attacca: 2d6 + Attacco del nemico \u2265 Difesa dell\u2019eroe '
                '\u2192 l\u2019eroe subisce il Danno indicato.'))
    e.append(P('Obiettivo e vittoria', 'h2'))
    e.append(P('La Soluzione fissa l’obiettivo dell’episodio, sempre in due tempi: <b>compiere '
               'qualcosa nella tessera finale</b> (liberare un prigioniero, prendere ciò che va '
               'portato via — si fa con <b>Interagire</b>, dove la Soluzione lo indica) e poi '
               '<b>tornare all’ingresso</b> con chi o cosa dovete portare in salvo. Solo allora '
               'l’episodio è vinto. Chi scortate si muove nel turno degli eroi (fino a 3 caselle) '
               'e non compie azioni.'))
    e.append(P('Ferite e sconfitta', 'h2'))
    e.append(P("A 0 Salute un eroe cade <b>a terra</b>: non agisce finch\u00e9 non viene rianimato. "
               "Se tutti gli eroi sono a terra, l\u2019episodio \u00e8 fallito: potete rigiocarlo, ma il "
               "nemico avr\u00e0 fatto progressi (l\u2019episodio dir\u00e0 come)."))

    e.append(P('ESEMPIO DI ROUND (3 giocatori, in T2 \u2014 Sala delle Casse)', 'h2'))
    e.append(P('<b>1. Turno degli eroi.</b> Elena spende un\u2019azione per <b>Cercare</b>: tira 2d6+ACUME '
               '(3) = 9, raggiunge la Media (9) e trova ci\u00f2 che T2 nasconde \u2014 prende la carta <b>Un '
               'Piede di Porco</b>: <i>\u201c+1 alle prove per forzare e scassinare\u201d</i>. Da questo momento '
               'ce l\u2019ha in mano e quel bonus si applica automaticamente, senza spendere azioni per '
               '\u201cusarlo\u201d. Con la '
               'seconda azione si <b>Muove</b> verso l\u2019uscita nord. Nino <b>Muove</b> fino alla '
               'grata e la apre con <b>Interagire</b>. Ottone si <b>Muove</b> adiacente a un Adepto '
               'gi\u00e0 in gioco e <b>Attacca</b>: 2d6+VIGORE (3) = 9 \u2265 Difesa 7 dell\u2019Adepto \u2192 1 ferita, '
               'l\u2019Adepto (1 Ferita) cade.', 'body'))
    e.append(P('<b>2. Fase Minaccia.</b> Siete in 3: pescate <b>1 carta</b> (vedi la tabella sopra) \u2014 '
               '<b>\u201cAdepto in Agguato\u201d</b>: <i>\u201cPiazzate 1 Adepto sull\u2019uscita pi\u00f9 '
               'vicina agli eroi della tessera in cui si trova l\u2019eroe attivo\u201d</i> \u2014 l\u2019eroe attivo '
               '\u00e8 l\u2019ultimo che ha agito (Ottone, in T2): il nuovo Adepto compare sull\u2019uscita pi\u00f9 '
               'vicina a lui, quella da cui la squadra \u00e8 appena entrata o verso cui sta uscendo.', 'body'))
    e.append(P('<b>3. Turno dei nemici.</b> Il nuovo Adepto si muove (Movimento 4) verso l\u2019eroe pi\u00f9 '
               'vicino. Se resta adiacente, attacca: 2d6+Attacco (1) contro la Difesa dell\u2019eroe '
               '(es. Nino, Difesa 9) \u2014 tira 6, non basta: nessun danno. Il round finisce, si '
               'ricomincia dal turno degli eroi.', 'body'))
    e.append(P('<b>Oggetti, in pratica:</b> il piede di porco (sopra) \u00e8 un bonus passivo, sempre '
               'attivo una volta trovato. Altri oggetti servono con un\u2019azione mirata: la <b>chiave '
               'della cella</b> (T4) apre la cella in T6 con <b>Interagire</b>, senza prove; il '
               '<b>diapason d\u2019argento</b> si usa con <b>Usare un oggetto</b> stando adiacenti al '
               'Custode della Cera.', 'box'))

    e.append(P('PRECISAZIONI (per i dubbi al tavolo)', 'h1'))
    e.append(LI('<b>Il PNG che scortate</b> \u2014 non \u00e8 un eroe: i nemici lo <b>ignorano</b> (i motivi sono '
                'nella Soluzione dell\u2019episodio). Si muove nel turno degli eroi, fino a 3 caselle, e non '
                'compie azioni.'))
    e.append(LI('<b>Eroi a terra</b> \u2014 i nemici li ignorano: puntano sempre l\u2019eroe in piedi pi\u00f9 vicino.'))
    e.append(LI('<b>Mazzo Minaccia esaurito</b> \u2014 rimescolate gli scarti e continuate. I segnalini '
                'Canto gi\u00e0 in gioco restano.'))
    e.append(LI('<b>Segnalini nemico esauriti</b> \u2014 se una carta vi dice di piazzare un nemico ma '
                'non restano pi\u00f9 segnalini di quel tipo, l\u2019effetto di piazzamento non ha luogo (i '
                'rinforzi del culto sono finiti): applicate comunque il resto della carta, se ne ha.'))
    e.append(LI('<b>Esca preziosa (Carbone)</b> \u2014 vince solo sul <b>movimento</b>: un nemico gi\u00e0 '
                'adiacente a un eroe attacca comunque, non si allontana per raccoglierla. L\u2019esca '
                'svanisce dopo l\u2019attivazione dei nemici che ha attirato.'))
    e.append(LI('<b>Vi conosco, Malacarne (Brera)</b> \u2014 bersaglia un <b>nemico di truppa</b>: '
                'Malavita, Adepto o Cane. Non funziona su boss n\u00e9 sul PNG scortato.'))
    e.append(LI('<b>Stola consunta (Marani)</b> \u2014 copre qualunque prova NERVI imposta da una '
                'trappola: carte Minaccia di tipo insidia, l\u2019ingresso in una tessera pericolosa, o '
                'la scelta di prendere un oggetto rischioso. Non copre le prove NERVI di gruppo n\u00e9 '
                'le sconfitte in combattimento.'))
    e.append(LI('<b>Oggetti</b> \u2014 ci\u00f2 che trovate nell\u2019Indagine \u00e8 del gruppo: all\u2019inizio della '
                'Spedizione decidete chi porta cosa (annotatelo). In Spedizione, passare un oggetto a '
                'un eroe adiacente \u00e8 gratuito, una volta per turno; un eroe a terra pu\u00f2 essere '
                'alleggerito da chi gli \u00e8 adiacente.'))
    e.append(LI('<b>Oggetto rischioso</b> \u2014 se la carta Oggetto lo segnala, prenderlo \u00e8 sempre una '
                'scelta del gruppo, mai un obbligo: potete lasciarlo dov\u2019\u00e8 senza conseguenze, e '
                'tornare a prenderlo pi\u00f9 tardi con una semplice azione (nessuna nuova prova di '
                'Cercare: la tessera \u00e8 gi\u00e0 esaurita). La scelta si risolve subito, non costa '
                'un\u2019azione aggiuntiva. Quando decidete di prenderlo, l\u2019eroe che lo raccoglie tira la '
                'prova indicata sulla carta: fallirla costa quanto scritto, mai la perdita '
                'dell\u2019oggetto, che resta comunque in mano a chi l\u2019ha preso.'))
    e.append(LI('<b>Cercare fallito</b> \u2014 si pu\u00f2 ritentare spendendo altre azioni, anche con eroi '
                'diversi. Una volta trovato ci\u00f2 che la tessera nasconde, la tessera \u00e8 esaurita.'))
    e.append(LI('<b>Leggere la scena</b> — regola completa in Fase 1. In breve: gli indizi core '
                '(parola chiave/oggetto/reperto) non stanno MAI dietro il tiro, solo l’eventuale '
                'Approfondimento; tornando al luogo la prova non si ripete.'))
    e.append(LI('<b>\u201cEroe pi\u00f9 avanzato\u201d</b> \u2014 quello pi\u00f9 lontano dall\u2019ingresso, contando le '
                'caselle. A pari merito: regola d\u2019oro.'))
    e.append(LI('<b>Movimento</b> \u2014 gli alleati (e il PNG scortato) si possono attraversare, ma non ci '
                'si pu\u00f2 fermare sulla loro casella.'))
    e.append(LI('<b>Tra un episodio e l\u2019altro</b> \u2014 tutti gli eroi tornano a Salute piena e '
                'recuperano gli usi delle abilit\u00e0. Le cicatrici invece restano.'))

    e.append(P('GIOCARE IN POCHI O IN TANTI', 'h1'))
    e.append(P("Ovunque il gioco parli di taglie — tabella Minaccia, bonus, Bestiario — conta il "
               "numero di <b>eroi in tavola</b>, non di giocatori: un tavolo da 2 giocatori con 4 "
               "eroi è, per le regole, un tavolo da 4. Regole per taglia:", 'body'))
    e.append(LI('<b>2 eroi</b> — la configurazione più dura del gioco, dichiaratamente: anche col '
                'boss alleggerito (sotto) vince circa una spedizione su due. Se siete in 2 '
                'giocatori e preferite una sfida più morbida, guidate <b>2 eroi a testa</b>: '
                'valgono le regole del tavolo da 4, con più scelte tattiche per ciascuno (come le '
                'partite “multi-handed” di Gloomhaven o Arkham Horror).'))
    e.append(LI('<b>4 eroi</b> — <b>+1 Salute massima a testa</b> (oltre a quella eventuale da '
                'Slancio/Preparati). È la taglia dove la tensione risultava più piatta nei test: '
                'un margine in più fa arrivare qualche colpo senza far crollare le vittorie.'))
    e.append(LI('<b>Il boss dell’episodio scala con la taglia</b> — <b>−1 Ferita ai tavoli da 2 e '
                'da 4</b> (le taglie che pescano più carte Minaccia di quanti corpi abbiano per '
                'assorbirle), <b>+1 Ferita a 6 e a 9–10</b>. A 3, 5, 7 e 8 nessuna modifica: '
                'testato, la pressione di quelle taglie basta già. Mai bonus ai nemici di truppa '
                '(un bonus generale li raddoppierebbe, molti hanno 1 sola Ferita). Si fissa '
                'all’inizio della spedizione e non cambia più, anche se qualcuno cade a terra. '
                '<b>Niente calcoli al tavolo:</b> il <b>Bestiario</b> riporta le Ferite già '
                'tabellate per numero di eroi — leggete la colonna del vostro tavolo e basta.'))
    e.append(LI('<b>7–10 eroi</b> — Fase Minaccia: 2 carte, più una terza SOLO nei round pari '
                '(2°, 4°, 6°...) — vedi la tabella in Fase 2. Nei test, 3 carte fisse ogni round '
                'schiacciavano il tavolo: la terza a metà ritmo lo tiene in sfida.'))
    e.append(P('Consigli per i gruppi numerosi (giocatori)', 'h2'))
    e.append(P("Nell’Indagine, fate girare il fascicolo <b>Luoghi</b>: a ogni visita lo legge ad "
               "alta voce un giocatore diverso, e ognuno prende appunti per sé — la deduzione "
               "diventa un racconto corale, il modo più divertente di giocare in gruppo. Con più "
               "persone al tavolo contate un po’ più di tempo a episodio, per la discussione e le "
               "azioni da coordinare, non perché il mazzo peschi di più."))
    e.append(P("In 4 o 5 giocatori potete anche <b>dividervi</b>, una sola volta a episodio: due "
               "sottogruppi visitano due luoghi diversi nella stessa ora (costa comunque solo 1 ora "
               "sul Taccuino, non 2), poi restate uniti per il resto dell’indagine. Ogni sottogruppo "
               "sblocca gli Approfondimenti solo per gli eroi davvero presenti al suo luogo — se "
               "l’eroe giusto è nell’altro sottogruppo, quell’Approfondimento resta perso. Dividersi "
               "copre più terreno nelle poche ore che avete, ma a un prezzo reale — usatelo dove conta "
               "di più, non è ripetibile. <b>Non</b> estendetelo oltre i 5 eroi: da 6 in su l’Indagine "
               "resta un unico momento corale."))
    e.append(P("Con un tavolo da 7–10 eroi, contate spedizioni più lunghe (13–15 round invece di "
               "11–12: più eroi in una stanza piccola vuol dire più traffico, non solo più "
               "minacce). Consigliato: nominate un <b>custode del mazzo Minaccia</b> fisso per tutta "
               "la serata, così a un tavolo affollato nessuno pesca due volte per errore.", 'body'))

    e.append(P('LA CAMPAGNA', 'h1'))
    e.append(LI('<b>Frammenti</b> — al termine di ogni episodio riuscito ottenete un Frammento di '
                'Campagna: conservateli, comporranno il mistero finale.'))
    e.append(LI('<b>Crescita</b> — dopo ogni episodio riuscito, ogni eroe sceglie <b>una</b> '
                'miglioria dall’elenco nella Soluzione e la annota sulla scheda.'))
    e.append(LI('<b>Cicatrici</b> — un eroe finito a terra durante l’episodio annota una '
                'cicatrice (descrivetela!): alla terza, −1 permanente a una caratteristica a scelta.'))

    e.append(P('COME STAMPARE', 'h1'))
    e.append(LI('<b>Regolamento</b> (questo fascicolo) e <b>Soluzione</b> (in <i>Episodio 1/</i>): '
                'fronte/retro normale. Sigillate la Soluzione in una busta!'))
    e.append(LI('<b>Eroi</b> (cartella <b>cards/Eroi/</b>): 11 carte su cartoncino, da stendere sul '
                'tavolo per la scelta a inizio serata.'))
    e.append(LI('<b>Schede</b>: una per giocatore, meglio su cartoncino.'))
    e.append(LI('<b>Mappa</b> (in <i>Episodio 1/</i>): un foglio fronte/retro sul tavolo, visibile a '
                'tutti — la mappa della città e lo stradario delle destinazioni dichiarabili. Cresce '
                'a ogni episodio (contiene anche i luoghi degli episodi precedenti): stampate quella '
                'dell’episodio che giocate.'))
    e.append(LI('<b>Indagine</b> (in <i>Episodio 1/</i>): carte Luogo su cartoncino, ritagliate lungo i '
                'bordi. Il Taccuino su carta normale.'))
    e.append(LI('<b>Approfondimenti</b> (Indizi Nascosti, Testimoni, Referti) su cartoncino, dorso '
                'anonimo (solo il tipo) sul retro: tenete le carte in un unico mazzo coperto.'))
    e.append(LI('<b>Oggetti</b>: carte su cartoncino, tenute in un mazzetto a parte. Quando trovate '
                'un oggetto (in Indagine o Cercando in Spedizione) prendete la carta corrispondente: '
                'da quel momento è fisicamente nelle mani di chi lo porta.'))
    e.append(LI('<b>Reperti</b> (cartella `reperti/Episodio 1/`): 2–3 documenti su carta normale, a colori se '
                'potete. Teneteli da parte, coperti, e consegnateli quando il gruppo trova l’indizio '
                'corrispondente (vedi sopra).'))
    e.append(LI('<b>Spedizione</b> (in <i>Episodio 1/</i>): carte Minaccia e miniature su cartoncino; '
                'ritagliate tutto. Le tessere (cartella <b>board/Episodio 1/</b>) sono immagini singole, '
                'nessun PDF le forza a una dimensione: stampatele a <b>200×200mm</b> (caselle da 5cm, '
                'la taglia minima comoda per muovere le miniature).'))
    e.append(LI('<b>Bestiario</b> (in <i>Episodio 1/</i>): una pagina per nemico — bio, statistiche e '
                'Ferite già tabellate per numero di eroi in tavola. Fronte/retro normale, tenetelo '
                'aperto accanto al Registro delle Ferite: le carte Creatura mostrano solo ritratto e '
                'indole, le statistiche vivono qui.'))
    e.append(LI('<b>Luoghi</b> (in <i>Episodio 1/</i>): non si stampa per i giocatori — è per chi tiene '
                'il mazzo coperto degli Approfondimenti, da consultare al bisogno durante l’Indagine. '
                'Non contiene le risposte alle 4 Domande, solo quale carta prendere per quale luogo. '
                '<b>Stampate fronte/retro:</b> il retro di ogni luogo mostra sempre gli Approfondimenti, '
                'anche quando non ce ne sono — così, sfogliando, non si capisce mai a colpo d’occhio se '
                'un luogo ne nasconde uno oppure no.'))
    e.append(Spacer(1, 8))
    e.append(P('Episodio 1: <b>Il caso del campanaro scomparso</b>. Quando siete pronti, leggete la '
               'Lettera d\u2019incarico nel fascicolo Indagine. Buona fortuna \u2014 e non fidatevi della '
               'cera nera.', 'box'))
    doc.build(e, onFirstPage=bg_cover, onLaterPages=bg)
    pad_to_even_pages(doc.filename)


# ------------------------------------------------------------------ SOLUZIONE
def soluzione():
    doc = SimpleDocTemplate(os.path.join(EP1_DIR, 'Soluzione (non aprire).pdf'),
                            pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                            topMargin=20*mm, bottomMargin=20*mm,
                            title='Ombre su Roccamora - Soluzione Episodio 1')
    e = []
    e.append(Spacer(1, 200))
    e.append(P('\u26a0 ALT \u26a0', 'warn'))
    e.append(P('SOLUZIONE DELL\u2019EPISODIO 1', 'title'))
    e.append(P('Stampate questo fascicolo senza leggerlo, sigillatelo in una busta.<br/>'
               'Apritelo solo dopo aver risposto per iscritto alle 4 Domande.', 'subtitle'))
    e.append(PageBreak())

    e.append(P('LA VERIT\u00c0', 'h1'))
    e.append(P(dropcap("Il liutaio <b>Bastiano Ferri</b> ha riportato in vita la confraternita del "
               "<b>Coro Sommerso</b>, bandita nel 1741. Riparando l\u2019organo della cattedrale ha "
               "ottenuto la seconda chiave della cripta e ha scoperto i condotti che scendono verso "
               "il Canale Basso, \u201cdove l\u2019acqua canta\u201d. Ogni notte alle 3 il culto fa suonare le "
               "campane con un meccanismo a contrappesi: le vibrazioni del bronzo attraversano la "
               "pietra e <b>svegliano qualcosa che dorme sotto Roccamora</b>. Il campanaro Ruggero "
               "Alvise se n\u2019\u00e8 accorto, ha visto Ferri in cripta, ed \u00e8 stato rapito. \u00c8 tenuto "
               "prigioniero nel vecchio <b>Magazzino delle Cere \u201cDellacqua\u201d</b> sul Canale Basso, "
               "dove il culto fonde le candele nere e prepara il rituale.")))

    e.append(P('LE 4 DOMANDE \u2014 RISPOSTE E VANTAGGI', 'h1'))
    e.append(P('<b>Nota per chi arbitra:</b> ogni carta Approfondimento (Indizio Nascosto, Testimone '
               'o Referto \u2014 qualunque, non importa quale) porta gi\u00e0 scritto dentro il proprio testo, '
               'nella voce di chi la racconta, il nome esatto del nascondiglio (Domanda 1, oggi '
               'ammorbidito nell\u2019indizio core del Luogo 6): su questo basta una qualsiasi delle 14 '
               'carte. Che Ferri <i>guidi</i> il culto, non solo vi sia coinvolto (Domanda 2), lo '
               'confermano invece esplicitamente solo tre carte: la Testimonianza di Ugo (Luogo 3), il '
               'Referto \u201cLa denuncia dei furti\u201d (Luogo 8) e l\u2019Osservazione dell\u2019Archivio (Luogo 7) \u2014 le '
               'altre lasciano Ferri presente e temuto, ma non dichiarano apertamente che comandi. Se '
               'il gruppo non ha mai letto una di quelle tre, giudicate con elasticit\u00e0 una risposta '
               '\u201cvicina\u201d (es. \u201c\u00e8 coinvolto, forse capo\u201d) invece di considerarla sbagliata: la Domanda 2 '
               'sbagliata non ha comunque penalit\u00e0 (vedi tabella).', 'box'))
    rows = [
        ['#', 'Risposta esatta', 'Se avete risposto bene', 'Se avete sbagliato'],
        ['1', 'Ruggero \u00e8 tenuto nel Magazzino delle\nCere \u201cDellacqua\u201d, al Canale Basso.',
         'Conoscete l\u2019ingresso sul retro:\nnel 1\u00b0 round non si pesca\nnessuna carta Minaccia.',
         'Arrivate allo scoperto:\npescate 1 Minaccia extra\nnel 1\u00b0 round.'],
        ['2', 'Il capo del Coro Sommerso \u00e8\nBastiano Ferri, il liutaio.',
         'Vantaggio \u201cSmascherato\u201d:\nuna volta, quando piazzereste\nAdepti, gridate il suo nome:\nnon vengono piazzati.',
         'Nessun effetto.'],
        ['3', 'La combinazione del lucchetto\n\u00e8 3 \u2013 1 \u2013 5.',
         'Aprite la porta della Banchina\nsenza prove.',
         'Va forzata: prova di ACUME\nDifficile; ogni fallimento =\npescate 1 carta Minaccia.'],
        ['4', 'L\u2019oggetto da portare \u00e8 il\ndiapason d\u2019argento (Bottega Ferri).',
         'Lo avete con voi: vedi\n\u201cIl Custode della Cera\u201d.',
         'Non lo avete. Il Custode\nconserva Difesa 9.'],
    ]
    t = Table(rows, colWidths=[8*mm, 52*mm, 55*mm, 45*mm])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), F['b']),
        ('FONTNAME', (0, 1), (-1, -1), F['r']),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f6efdb'), PAPER_DK]),
        ('GRID', (0, 0), (-1, -1), 0.6, TEAL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    e.append(t)
    e.append(P('ORE AVANZATE — O LUOGHI VISITATI', 'h2'))
    e.append(P('Contate le ore ancora libere sul Taccuino <b>oppure</b> quanti luoghi avete visitato '
               '(anche tutti e 8, spendendo ogni ora per farlo) nel momento in cui rispondete alle 4 '
               'Domande (non quando aprite questa busta). Sono <b>due strade alternative</b>, non '
               'cumulative: prendete il vantaggio migliore fra i due. Chi si ferma presto senza aver '
               'visitato molto rischia comunque di rispondere con meno indizi in mano — ricompensate '
               'sia il rischio corso (fermarsi presto) sia la fatica (visitare tutto): la visita '
               'gratuita di Carla (Fonti riservate) non conta come ora avanzata né come luogo in più, '
               'non è un rischio né una fatica corsi da lei.', 'box'))
    rt = [
        ['Ore avanzate', 'O luoghi visitati', 'Vantaggio'],
        ['3 o più', '6 o più', 'Slancio: nel 1° round della Spedizione, ogni eroe ha 3 azioni invece '
                               'di 2, e inizia con +1 Salute massima.'],
        ['1–2', '5', 'Preparati: ogni eroe inizia la Spedizione con +1 Salute massima, solo per questa '
                     'partita.'],
        ['0', '4 o meno', 'Nessun vantaggio extra (le 4 Domande restano comunque valide per la tabella '
                          'sopra).'],
    ]
    rtb = Table(rt, colWidths=[22*mm, 24*mm, 114*mm])
    rtb.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), F['b']),
        ('FONTNAME', (0, 1), (-1, -1), F['r']),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f6efdb'), PAPER_DK]),
        ('GRID', (0, 0), (-1, -1), 0.6, TEAL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    e.append(rtb)
    e.append(P('<b>Dossier completo</b> — se al momento delle risposte <b>non vi avanza nessuna ora</b> '
               '(le avete spese tutte esplorando), oltre al vantaggio qui sopra prendete <b>1 gettone '
               'Intuizione</b>: una volta in Spedizione potete <b>ripetere un vostro tiro di dado appena '
               'fallito</b> (una prova o un attacco), tenendo il secondo risultato. È un premio piccolo a '
               'chi va fino in fondo — la via veloce, che tiene ore in banca, non lo ottiene. La visita '
               'gratuita di Carla (Fonti riservate) non conta: il gettone è per le ore <i>vostre</i> '
               'spese sul campo.', 'box'))
    e.append(P('Come sono deducibili: 1) registro consegne della Bottega + testimonianze di barcaiolo '
               'e guardiano indicano il Canale Basso, molo terzo \u2014 ma quale magazzino esattamente lo '
               'dice solo un Approfondimento (vedi nota sopra: qualunque, tutti e 14 lo confermano); '
               '2) pagamento firmato \u201cB.F.\u201d, fascicolo d\u2019archivio consultato da Ferri, la seconda '
               'chiave della cripta in mano sua, il diapason con l\u2019onda lo implicano \u2014 che ne sia il '
               'capo e non solo un adepto (o un\u2019altra vittima) lo conferma solo una delle tre carte '
               'sopra (Luogo 3, 7 o 8), non una qualsiasi; 3) il diario di Ruggero (\u201ctre rintocchi, poi '
               'uno, poi cinque\u201d) confermato dall\u2019inno n. 315; 4) lo spartito \u201cper campane\u201d e il '
               'sigillo a onda legano il diapason al culto. Il \u201cC.B.\u201d del registro \u00e8 il Canale Basso: '
               'da solo non basta, va incrociato col guardiano o con la mappa d\u2019archivio \u2014 occhio al '
               'secondo barcaiolo del Luogo 3, che giura sia invece il vecchio mulino a monte: '
               'contraddetto da Ugo e da ogni Approfondimento, ma nessuno lo corregge sul posto, quindi '
               'un gruppo frettoloso pu\u00f2 davvero rispondere male alla Domanda 1. Don Callisto, Tonio, '
               'Bice (sospettata per la pensione del fratello) e Learco il ramaio sono tutte false '
               'piste; l\u2019acqua benedetta di don Callisto \u00e8 un\u2019esca: sul Custode non ha alcun effetto.'))

    e.append(P('PREPARAZIONE DELLA SPEDIZIONE', 'h1'))
    e.append(P('Disponete le tessere cos\u00ec (coperte, tranne T1). Le uscite sono stampate sui bordi:', 'body'))
    e.append(P('<font face="Courier" size="9">'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T6 Cripta della Cera]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T5 Scala Interrata]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| (grata)<br/>'
               '[T4 Ufficio] \u2014 [T2 Sala delle Casse] \u2014 [T3 Corridoio]<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>'
               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[T1 Banchina \u2014 INGRESSO]</font>', 'box'))
    e.append(LI('Eroi sulla porta di T1. Mischiate il mazzo Minaccia. Tenete a portata i segnalini '
                'Adepto, Cane, Fonditore, Sgherro e Sicario (la malavita a libro paga del culto), '
                'il Custode, Ruggero e i 3 segnalini Canto.'))
    e.append(LI('<b>Obiettivo:</b> aprire la cella in T6, liberare Ruggero e riportarlo sulla '
                'Banchina (T1). Ruggero si muove con voi (Movimento 3, non agisce).'))
    e.append(LI('<b>Il Custode della Cera</b> appare (con 2 Adepti) quando rivelate T6, oppure al '
                'terzo segnalino Canto: in quel caso piazzatelo sulla tessera pi\u00f9 lontana dagli '
                'eroi. Se avete il <b>diapason</b>: con un\u2019azione adiacente al Custode lo fate '
                'vibrare: la sua Difesa scende a 5 per il resto della partita e il Custode salta la '
                'sua prossima attivazione.'))
    e.append(LI('<b>Il Canto avanza da solo:</b> alla fine di ogni quarto round (4\u00b0, 8\u00b0...), '
                'aggiungete 1 segnalino Canto anche senza pescare la carta.'))
    e.append(LI('<b>Terzo segnalino Canto:</b> il rituale \u00e8 quasi compiuto. Da ora ogni fase '
                'Minaccia pescate 1 carta in pi\u00f9 \u2014 <b>anche se il Custode \u00e8 gi\u00e0 stato '
                'abbattuto</b>: il Canto non riguarda solo lui, \u00e8 il culto intero che sente '
                'il rituale avvicinarsi.'))
    e.append(LI('<b>Se fallite</b> e rigiocate l\u2019episodio: iniziate con 1 segnalino Canto gi\u00e0 in gioco.'))

    e.append(P('EPILOGO \u2014 da leggere ad alta voce a vittoria ottenuta', 'h1'))
    e.append(P('\u00abRuggero trema mentre la chiatta vi riporta a casa. \u201cCantavano all\u2019acqua\u201d, '
               'dice. \u201cE l\u2019acqua rispondeva. Ferri diceva che le campane servono a svegliare '
               'qualcosa che dorme sotto Roccamora dal 1741. Diceva che ormai... ha aperto gli '
               'occhi.\u201d Del liutaio, al magazzino, nessuna traccia: solo uno spartito incompiuto '
               'e una riga in margine: \u201cSecondo movimento: le voci del pozzo\u201d.\u00bb', 'box'))
    e.append(P('IL BIVIO \u2014 decidete insieme, poi sigillate', 'h1'))
    e.append(P('Sul leggio dell\u2019altare trovate lo <b>spartito completo del rituale</b>: '
               '\u00abDal Profondo \u2014 primo movimento\u00bb, annotato dalla mano di Ferri. '
               'Prima di lasciare il magazzino dovete scegliere, e la scelta non si torna indietro:', 'body'))
    e.append(LI('<b>Bruciarlo.</b> Il fuoco vi scalda le mani come un\u2019assoluzione. Il culto '
                'dovr\u00e0 ricominciare da capo \u2014 ma anche voi perdete l\u2019unica '
                'trascrizione del suo canto.'))
    e.append(LI('<b>Conservarlo.</b> Ripiegate quei fogli che sembrano pulsare. Sapere \u00e8 '
                'potere \u2014 ma ora il Coro sa che il primo movimento ce l\u2019avete voi.'))
    e.append(P('Scrivete la scelta sul retro del Frammento n. 1 e non parlatene pi\u00f9 fino '
               'all\u2019Episodio 2: l\u00ec ne risponderete, nel bene e nel male.', 'box'))
    e.append(P('FRAMMENTO DI CAMPAGNA N. 1', 'h2'))
    e.append(P('<i>Il Coro Sommerso non evoca: <b>accorda</b>. Ogni episodio il culto \u201caccorda\u201d '
               'un luogo della citt\u00e0. Segnate sulla mappa mentale di Roccamora: la Cattedrale \u00e8 '
               'gi\u00e0 accordata.</i> Conservate questo frammento per il finale di campagna.'))
    e.append(P('MIGLIORIE (una a testa dopo la vittoria)', 'h2'))
    e.append(LI('<b>Tempra</b> \u2014 +1 permanente a una caratteristica a scelta (massimo 4).'))
    e.append(LI('<b>Fibra</b> \u2014 +1 Salute massima.'))
    e.append(LI('<b>Revolver</b> \u2014 una volta per round, attacco a distanza (fino a 3 caselle): 2d6+2.'))
    e.append(LI('<b>Lanterna schermata</b> \u2014 le trappole delle tessere non si attivano sull\u2019eroe che la porta.'))
    e.append(LI('<b>Borsa di garze</b> \u2014 2 usi per spedizione: azione, cura 2 Salute a un eroe adiacente.'))
    e.append(P('Prossimo episodio: <b>Le voci del pozzo</b>. (Quando lo vorrete, tornate da chi vi '
               'ha costruito questo gioco e chiedete l\u2019Episodio 2.)'))
    doc.build(e, onFirstPage=bg_cover, onLaterPages=bg)
    pad_to_even_pages(doc.filename)


# ------------------------------------------------------------ AIUTO GIOCATORE
def aiuto():
    doc = SimpleDocTemplate(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-06-Aiuto-Giocatore.pdf'),
                            pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                            topMargin=16*mm, bottomMargin=14*mm,
                            title='Ombre su Roccamora - Aiuto di gioco')
    ref = ParagraphStyle('ref', parent=S['body'], fontSize=9.5, leading=12.5, spaceAfter=2)
    li = ParagraphStyle('refli', parent=ref, leftIndent=12, bulletIndent=3, spaceAfter=1.5)

    def RP(t):
        return Paragraph(t, ref)

    def RL(t):
        return Paragraph(t, li, bulletText='•')

    e = []
    e.append(P('AIUTO DI GIOCO', 'title'))
    e.append(P('Riepilogo da tavolo — una pagina. Le regole complete sono nel fascicolo 01.', 'subtitle'))
    e.append(hr())

    e.append(P('PROVE', 'h2'))
    e.append(RP('<b>2d6 + caratteristica</b> (ACUME / VIGORE / NERVI) ≥ difficoltà.'))
    e.append(RP('<b>Facile 7 • Media 9 • Difficile 11.</b> Ogni eroe: 1 solo ritento a episodio (Secondo Fiato).'))

    e.append(P('INDAGINE — 6 ore, ogni visita costa 1 ora (anche tornare)', 'h2'))
    e.append(RL('<b>Destinazione</b> — indicate una carta scoperta o dichiarate una voce dello '
                'stradario (Mappa): se non è nell’episodio, pista fredda — <b>nessuna ora spesa</b>; '
                'se c’è, la visita parte e l’ora si spende.'))
    e.append(RL('<b>Porta chiusa</b> — dichiarate <b>UNA parola o UN oggetto per visita</b> a chi '
                'tiene il fascicolo Luoghi: giusta si entra subito, sbagliata l’ora è persa comunque.'))
    e.append(RL('<b>Prima visita</b> — un eroe prova ACUME Media (“leggere la scena”): indizi, parola '
                'chiave e oggetto si leggono comunque; se fallisce, l’Approfondimento aspetta una '
                'seconda visita (senza ripetere la prova).'))
    e.append(RL('<b>Chiusura</b> — 4 Domande per iscritto, poi la busta Soluzione. Vantaggio extra: '
                'ore avanzate <b>O</b> molti luoghi visitati. Con <b>0 ore avanzate</b>: gettone '
                '<b>Intuizione</b> — una volta in Spedizione ripetete un tiro appena fallito.'))

    e.append(P('TURNO DEGLI EROI — 2 azioni ciascuno, sempre di tipo diverso', 'h2'))
    e.append(RL('<b>Muovere</b> — fino a 3 caselle (Nino 4). Niente diagonali; non si attraversano nemici o mobili.'))
    e.append(RL('<b>Attaccare</b> — nemico adiacente: <b>2d6 + VIGORE (+1 se armati) ≥ Difesa nemico</b> → 1 ferita (segnala sul Registro).'))
    e.append(RL('<b>Cercare</b> — ACUME Media: trovi ciò che la tessera nasconde (1 volta a tessera; ritentabile).'))
    e.append(RL('<b>Interagire</b> — porte, grate, leve, liberare il PNG scortato. <b>Usare un oggetto</b> — come indicato.'))
    e.append(RL('<b>Rianimare</b> — un eroe a terra adiacente torna a 2 Salute.'))
    e.append(RP('Uscendo verso una tessera coperta, <b>rivelatela</b> e leggetene subito il testo.'))

    e.append(P('FASE MINACCIA — carte da pescare, in base a quanti eroi in tavola', 'h2'))
    minaccia_t = Table([
        ['Eroi in tavola', '2–3', '4–6', '7–10'],
        ['Carte da pescare', '1', '2', '2 (+1 nei round pari)'],
    ], colWidths=[36*mm, 44*mm, 44*mm, 50*mm])
    minaccia_t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), F['b']),
        ('FONTNAME', (1, 0), (-1, -1), F['r']),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f6efdb')]),
        ('GRID', (0, 0), (-1, -1), 0.6, TEAL),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    e.append(minaccia_t)
    e.append(RP('Leggete la carta ad alta voce ed eseguite. Mazzo esaurito: rimescolate gli scarti. '
                'A 7–10 eroi la terza carta si pesca solo nei round pari (2°, 4°, 6°...) — non è un '
                'errore di stampa, vedi Regolamento.'))

    e.append(P('TURNO DEI NEMICI', 'h2'))
    e.append(RP('Ognuno si muove verso l’<b>eroe in piedi</b> più vicino (ignorano gli eroi a terra e il '
                'PNG scortato). Se adiacente attacca: <b>2d6 + Attacco ≥ Difesa eroe</b> → subisci il '
                'Danno indicato.'))

    e.append(P('TAGLIE DEL TAVOLO (contano gli EROI in tavola, non i giocatori)', 'h2'))
    e.append(RL('<b>4 eroi</b> — +1 Salute massima a testa (oltre a Slancio/Preparati).'))
    e.append(RL('<b>Boss</b> — −1 Ferita a 2 e 4 eroi; +1 a 6 e 9–10 (a 3, 5, 7, 8 nessuna modifica). '
                'Fissato a inizio spedizione; Ferite già tabellate per taglia nel <b>Bestiario</b>.'))
    e.append(RL('<b>7–10 eroi</b> — la terza carta Minaccia si pesca solo nei round pari (tabella sopra).'))

    e.append(P('REGOLA D’ORO', 'h2'))
    e.append(RP('In ogni ambiguità (uscite/eroi equidistanti, più bersagli) sceglie il gruppo, '
                'prendendo sempre <b>l’opzione peggiore per sé</b>. Vale per tutta la spedizione.'))

    e.append(P('OBIETTIVO E CANTO', 'h2'))
    e.append(RL('<b>Vittoria:</b> completare l’obiettivo dell’episodio nella tessera finale (T6, '
                'vedi Soluzione) e tornare all’ingresso (T1) con chi/cosa dovete portare in salvo. '
                'Chi scortate si muove con voi (Mov. 3, non agisce).'))
    e.append(RL('<b>Canto:</b> al <b>3° segnalino</b> si desta il boss dell’episodio e da lì ogni fase '
                'Minaccia pescate 1 carta in più. Ogni 4° round (4°, 8°...): +1 Canto automatico.'))
    e.append(RL('<b>A 0 Salute</b> un eroe cade a terra (non agisce finché non rianimato). '
                'Tutti a terra = episodio fallito.'))

    doc.build(e, onFirstPage=bg, onLaterPages=bg)
    pad_to_even_pages(doc.filename)


regolamento()
soluzione()
aiuto()
print('OK docs')
