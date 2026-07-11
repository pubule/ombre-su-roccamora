# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Riferimenti Narratore (PDF 09).

L'UNICA cosa che lega una carta Approfondimento o Oggetto a un luogo/tessera
specifico. Le carte stesse non portano piu' questa informazione (dorso
Approfondimenti = solo tipo, carte Oggetto = solo nome): restano riusabili tra
episodi e i giocatori non possono dedurre dove cercare sfogliando i mazzi.

Una pagina per luogo (piu' le tessere che nascondono un oggetto da Cercare),
stile scheda personaggio: arte del luogo fusa nello strappo della pergamena
(stessa tecnica di deluxe_style.torn_portrait), ma con la variante di sfondo
CON STRAPPO IN ALTO (background scheda personaggio.png) per opporsi visivamente
alle schede eroe, che usano lo strappo in basso.

Non contiene le risposte alle 4 Domande: solo "quale carta prendere quando".
Non va sigillato come la Soluzione, ma tenuto a portata di mano dal narratore.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import register_fonts, torn_portrait, rule_border, F, INK, RED, TEAL, SEPIA
from gen_cards import LUOGHI, TILES, OGGETTI
import story
story.apply(LUOGHI, TILES, [], [], [])

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf')
register_fonts()
W, H = A4

LUOGHI_ART = {
    1: 'bell tower.png',
    2: 'humble candlelit canal-side room.png',
    3: 'smoky canal tavern.png',
    4: 'nervous priest in a candlelit sacristy.png',
    5: 'abandoned luthier workshop.png',
    6: 'derelict warehouses over black still water.png',
    7: 'dusty municipal archive (libro+persona).png',
    8: 'cluttered 19th century police office.png',
}
TILE_ART = {
    'T2': 'T2.png',
    'T3': 'T3.png',
    'T4': 'T4.png',
}
TIPO_LABEL = {'Osservazione': 'Indizio Nascosto', 'Presagio': 'Indizio Nascosto',
              'Testimonianza': 'Testimone', 'Referto': 'Referto'}

# Descrizione allargata SOLO per questo fascicolo (il narratore, non i giocatori):
# più sensoriale e atmosferica del testo terso stampato sulla carta Luogo, utile
# per improvvisare la scena a voce. Non tocca le carte/tessere stampate - stessi
# fatti, stesse battute di dialogo, solo più respiro. Le tessere invece riusano
# testo/gen_cards.py TILES['testo'] cosi' com'e' (contiene regole di gioco, es.
# prove NERVI/danno, che non vanno riscritte).
LUOGHI_DESC = {
    1: 'La scala a chiocciola sale nel buio, ottanta gradini che Ruggero conosceva a '
       'memoria e che ora scricchiolano sotto piedi estranei. L’aria si fa più fredda a '
       'ogni giro, come se qualcosa, più in alto, respirasse lentamente. In cima, la '
       'cella campanaria è un disordine congelato: lo sgabello rovesciato, la lanterna '
       'ancora appesa al gancio, la cena intatta sotto un panno ormai freddo. Le tre '
       'grandi campane pendono immobili come bestie addormentate, e sulle travi, tra '
       'ragnatele e polvere di piccione, si intravedono colate di cera che nessuno ha '
       'mai acceso quassù. Fa più freddo di quanto dovrebbe, e il vento che entra dalle '
       'feritoie porta, a tratti, qualcosa che assomiglia a un canto.',
    2: 'Il vicolo dei Fonditori sa di carbone e minestra bollita, di panni stesi tra '
       'finestre che quasi si toccano. Bice vi apre con gli occhi rossi e le mani che '
       'non stanno ferme, stringendo lo scialle come se potesse tenere insieme anche '
       'lei. La casa è linda, povera, ordinata con la cura di chi non ha altro modo per '
       'sentirsi ancora al sicuro — ed è piena, in ogni angolo, dell’assenza di suo '
       'fratello. «Negli ultimi tempi diceva di sentire musica sotto il pavimento della '
       'cripta», mormora, senza guardarvi negli occhi. «E aveva paura del suo stesso '
       'campanile.» Sul tavolo, tra le tazze rigovernate, qualcosa che non dovrebbe '
       'essere lì aspetta di essere notato.',
    3: 'Fumo denso, vino cattivo, il tanfo dolciastro del canale che entra a ogni porta '
       'che sbatte contro lo stipite. I barcaioli giocano a carte sotto una lampada a '
       'olio che ondeggia col vento dalle finestre sconnesse, e vi squadrano appena, '
       'valutandovi come si valuta un carico prima di scaricarlo. Qui le lingue si '
       'sciolgono con poco, purché il poco finisca nel bicchiere giusto e nessuno faccia '
       'troppe domande a voce alta. Sotto il tavolo più vicino alla porta, qualcuno ha '
       'inciso una piccola onda nel legno, tanto tempo fa; nessuno dei presenti sembra '
       'ricordare chi, o perché.',
    4: 'Odore d’incenso e di chiuso, cera vecchia e legno umido. Don Callisto vi riceve '
       'tra i paramenti appesi come sudari, nervoso, nascondendo dietro la schiena mani '
       'sporche di cera che si affretta a strofinare sulla tonaca. Alle sue spalle, la '
       'porta della cripta è sbarrata con assi nuove inchiodate su pietra antica: '
       '«Chiusa per lavori», taglia corto, e la voce gli si incrina sull’ultima sillaba '
       'come una corda troppo tesa. Da qualche parte, sotto i vostri piedi, il pavimento '
       'sembra vibrare appena — o forse è solo l’organo, in restauro, che qualcuno '
       'continua a provare anche senza un organista.',
    5: 'La bottega è chiusa da giorni, la polvere ha già preso possesso delle vetrine '
       'come muschio su una lapide; la porta sul retro cede a una spallata con un '
       'cigolio che sembra un lamento. Dentro, violini appesi come selvaggina in una '
       'macelleria e un silenzio sbagliato, innaturale, per un luogo nato per fare '
       'musica. Il banco da lavoro è in ordine perfetto — troppo perfetto: chi è '
       'partito, sapeva di partire, e ha avuto tempo di sistemare ogni attrezzo al suo '
       'posto prima di sparire. Sul pavimento, un filo sottile di cera nera conduce dal '
       'camino spento fino alla soglia, e si perde nel buio della strada.',
    6: 'L’acqua qui non scorre: sta. Nera, ferma, densa come olio, lambisce magazzini '
       'ciechi dai portoni murati e riflette a stento la luna, come se non volesse '
       'restituire nemmeno quella. Il guardiano notturno esce dal casotto con la '
       'lanterna alzata e, per qualche moneta, la diffidenza si scioglie in fretta: da '
       'settimane muore dalla voglia di raccontare a qualcuno quello che sente la notte, '
       'ma abbassa comunque la voce, come se l’acqua stessa potesse origliare. Ogni '
       'tanto, tra un magazzino e l’altro, una corrente più fredda delle altre risale '
       'dai condotti e vi si infila sotto i vestiti.',
    7: 'Scaffali fino al soffitto, cartelle legate con lo spago ingiallito, la luce '
       'verde delle lampade a schermo che disegna ombre lunghe sul pavimento di pietra. '
       'L’archivista, minuscolo dietro occhiali spessi, si irrigidisce quando '
       'pronunciate la parola giusta, come se l’aveste evocato più che interpellato: '
       'poi, senza fiatare, vi guida a uno scaffale che nessuno tocca da decenni. La '
       'polvere è spessa un dito ovunque, tranne che su un solo fascicolo, pulito e '
       'consultato di recente più volte di quante l’archivista sia disposto ad '
       'ammettere.',
    8: 'Pile di pratiche, una stufa che fuma più di quanto scaldi, il brigadiere che vi '
       'riceve senza alzarsi dalla sedia scricchiolante. «Il campanaro? Sarà scappato '
       'con qualche vedova», dice, con la noia di chi ha già archiviato il caso nella '
       'propria testa. Ma mentre lo dice non vi guarda negli occhi, e la sua mano '
       'tamburella senza sosta su un fascicolo di denunce che continua a spostare da un '
       'lato all’altro della scrivania, come se sperasse che, ignorandolo abbastanza a '
       'lungo, quel fascicolo finisse per sparire da solo.',
}

TORN_TOP = 'background scheda personaggio.png'
# Mirror del window delle schede eroe (strappo in basso, window=(0.50,0.0,1.03,0.51)):
# qui lo strappo e' in alto, stessa fascia orizzontale destra, specchiata in verticale.
WINDOW_TOP = (0.50, 0.49, 1.03, 1.03)
MX = 20*mm
ART_BOTTOM = WINDOW_TOP[1] * H  # bordo inferiore della finestra d'arte

def st(name, **kw):
    base = dict(fontName=F['r'], fontSize=10, leading=14, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

LABEL = st('label', fontName=F['sc'], fontSize=10, textColor=TEAL)
NOME = st('nome', fontName=F['sc'], fontSize=17, textColor=RED, leading=19)
DESC = st('desc', fontName=F['i'], fontSize=9.5, leading=13.5, alignment=4)
ROW = st('row', fontName=F['r'], fontSize=10.5, leading=15)
NONE_ROW = st('none_row', fontName=F['i'], fontSize=9.5, leading=14, textColor=SEPIA)

def oggetto_di(ref):
    return next((o for o in OGGETTI if o['ref'] == ref), None)

def righe(approfondimenti, ref):
    out = []
    for a in approfondimenti:
        tipo = TIPO_LABEL[a['tipo']]
        if 'soggetto' in a:
            out.append(f"<b>{tipo}</b> — carta “{a['soggetto']}”")
        else:
            out.append(f"<b>{tipo}</b> <i>({a['tipo']})</i>")
    ogg = oggetto_di(ref)
    if ogg:
        out.append(f"<b>Oggetto</b> — carta “{ogg['nome'].title()}”")
    return out

COL_W = WINDOW_TOP[0]*W - MX - 4*mm  # colonna libera a sinistra dell'arte (in alto)

def header(c, label_text, nome_text, desc_text):
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(MX, H - 20*mm, label_text.lower())
    c.setFillColor(RED); c.setFont(F['sc'], 18)
    # nomi lunghi: riduci il font finche' non entra nella colonna libera (bordo art escluso)
    size = 18
    while c.stringWidth(nome_text.lower(), F['sc'], size) > COL_W and size > 10:
        size -= 1
    c.setFont(F['sc'], size)
    c.drawString(MX, H - 30*mm, nome_text.lower())
    d = Paragraph(desc_text, DESC)
    dh = d.wrapOn(c, COL_W, H)[1]
    d.drawOn(c, MX, H - 37*mm - dh)
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, ART_BOTTOM - 4*mm, W - MX, ART_BOTTOM - 4*mm)

def body(c, rows):
    y = ART_BOTTOM - 12*mm
    if not rows:
        p = Paragraph('Nessun Approfondimento o Oggetto qui.', NONE_ROW)
        p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - 5*mm)
        return
    for r in rows:
        p = Paragraph(f'— {r}', ROW)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 4*mm

def narratore():
    c = canvas.Canvas(os.path.join(OUT_DIR, 'Ombre-su-Roccamora-09-Riferimenti-Narratore.pdf'), pagesize=A4)
    c.setTitle('Ombre su Roccamora - Riferimenti Narratore')

    for L in LUOGHI:
        torn_portrait(c, W, H, LUOGHI_ART[L['n']], TORN_TOP, window=WINDOW_TOP)
        rule_border(c, W, H)
        header(c, f"luogo {L['n']}", L['nome'], LUOGHI_DESC[L['n']])
        body(c, righe(L['approfondimenti'], f"L{L['n']}"))
        c.showPage()

    for t in TILES:
        if t['id'] not in TILE_ART:
            continue
        torn_portrait(c, W, H, TILE_ART[t['id']], TORN_TOP, window=WINDOW_TOP)
        rule_border(c, W, H)
        header(c, f"tessera {t['id']}", t['nome'], t['testo'])
        body(c, righe([], t['id']))
        c.showPage()

    c.save()

if __name__ == '__main__':
    narratore()
    print('OK narratore')
