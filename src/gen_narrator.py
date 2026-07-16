# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Episodio 1 - Luoghi (riferimenti narratore).

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

from deluxe_style import (register_fonts, torn_portrait, rule_border, pad_to_even_pages, parchment_art,
                          F, INK, RED, TEAL, SEPIA)
from gen_cards import LUOGHI, TILES, OGGETTI
import story
story.apply(LUOGHI, TILES, [], [], [])

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pdf', 'Episodio 1')
os.makedirs(OUT_DIR, exist_ok=True)
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
# Override per-luogo di overscan/top_margin (default in torn_portrait: overscan
# 0.75, top_margin 0) quando il ritaglio standard non valorizza il soggetto -
# la finestra e' un rettangolo verticale, le arte sono quasi tutte panoramiche
# 2688x1792: con l'overscan di default il ritaglio mostra solo il 57% in alto
# dell'immagine, quindi un soggetto centrato in verticale (es. la campana
# grande del Luogo 1) resta fuori. Solo le voci sotto si scostano dal default.
LUOGHI_CROP = {
    1: dict(overscan=0.05),                     # la campana e' centrata in verticale, non in alto
    2: dict(overscan=0.15, center_x=0.85),       # Bice e' spostata a destra nell'arte
    3: dict(overscan=0.15, top_margin=12*mm),   # le facce dei barcaioli sono piu' in basso
    7: dict(overscan=0.1),   # l'archivista e' quasi fuori dal ritaglio di default
}
TILE_ART = {
    'T2': 'T2.png',
    'T3': 'T3.png',
    'T4': 'T4.png',
}
TIPO_LABEL = {'Osservazione': 'Indizio Nascosto', 'Presagio': 'Indizio Nascosto',
              'Testimonianza': 'Testimone', 'Referto': 'Referto'}
# Chi sblocca ogni tipo (da gen_cards.py, abilita' eroi - il jolly di Sibilla
# copre qualunque tipo): stampato nel fascicolo accanto a ogni carta da
# prendere, cosi' chi arbitra sa subito se al tavolo c'e' l'eroe giusto.
TIPO_EROI = {'Osservazione': 'Elena', 'Presagio': 'Serra',
             'Testimonianza': 'Ottone o Carla', 'Referto': 'Attilio o Brera'}

# Descrizione allargata SOLO per questo fascicolo (il narratore, non i giocatori):
# più sensoriale e atmosferica del testo terso stampato sulla carta Luogo/Tessera,
# utile per improvvisare la scena a voce. Non tocca le carte/tessere stampate -
# stessi fatti, stesse battute di dialogo, stesse regole (dove presenti, es. prove
# NERVI/danno delle Tessere, mai riscritte), solo più respiro attorno. La colonna
# ha altezza fissa: header() riduce il font finche' non entra, quindi qui si puo'
# scrivere in liberta' senza contare le righe a mano.
LUOGHI_DESC = {
    1: 'La scala a chiocciola sale nel buio, ottanta gradini consumati al centro dai '
       'passi di generazioni di campanari, che Ruggero conosceva a memoria e che ora '
       'scricchiolano sotto piedi estranei. L’aria si fa più fredda a ogni giro, come se '
       'qualcosa, più in alto, respirasse lentamente; la vostra lanterna proietta ombre '
       'che sembrano muoversi un istante prima di voi, mai dopo. In cima, la cella '
       'campanaria è un disordine congelato: lo sgabello rovesciato, la lanterna ancora '
       'appesa al gancio, la cena intatta sotto un panno ormai freddo, le briciole di '
       'pane secco che nessun topo ha toccato. Le tre grandi campane pendono immobili '
       'come bestie addormentate, enormi da vicino quanto non sembrano dalla piazza, e '
       'sulle travi, tra ragnatele e polvere di piccione, si intravedono colate di cera '
       'che nessuno ha mai acceso quassù — impossibile dire da quanto tempo colano, o '
       'come abbiano raggiunto un’altezza che nessuna candela da chiesa potrebbe '
       'giustificare. Fa più freddo di quanto dovrebbe, un freddo che sale dalle pietre '
       'più che scendere dall’aria, e il vento che entra dalle feritoie porta, a tratti, '
       'qualcosa che assomiglia a un canto, troppo regolare per essere solo vento.',
    2: 'Il vicolo dei Fonditori sa di carbone e minestra bollita, di panni stesi tra '
       'finestre che quasi si toccano e di fumo di comignoli troppo vicini al suolo. '
       'Bice vi apre con gli occhi rossi e le mani che non stanno ferme, stringendo lo '
       'scialle come se potesse tenere insieme anche lei; dietro di lei, l’ingresso è '
       'buio nonostante sia pieno pomeriggio, le persiane accostate come per un lutto '
       'mai dichiarato. La casa è linda, povera, ordinata con la cura ostinata di chi '
       'non ha altro modo per sentirsi ancora al sicuro — ed è piena, in ogni angolo, '
       'dell’assenza di suo fratello: il suo cappotto ancora al chiodo, il suo posto a '
       'tavola apparecchiato per abitudine più che per speranza. «Negli ultimi tempi '
       'diceva di sentire musica sotto il pavimento della cripta», mormora, senza '
       'guardarvi negli occhi, torcendo l’orlo dello scialle tra le dita. «E aveva paura '
       'del suo stesso campanile — lui, che ci ha passato la vita.» Sul tavolo, tra le '
       'tazze rigovernate e le briciole di un pasto mai finito, qualcosa che non '
       'dovrebbe essere lì aspetta di essere notato.',
    3: 'Fumo denso che pizzica gli occhi, vino cattivo servito in bicchieri scheggiati, '
       'il tanfo dolciastro del canale che entra a ogni porta che sbatte contro lo '
       'stipite. I barcaioli giocano a carte sotto una lampada a olio che ondeggia col '
       'vento dalle finestre sconnesse, proiettando ombre lunghe sulle facce segnate dal '
       'sole e dall’acqua; vi squadrano appena, valutandovi come si valuta un carico '
       'prima di scaricarlo, poi tornano alle carte con un’indifferenza troppo studiata '
       'per essere vera. Qui le lingue si sciolgono con poco, purché il poco finisca nel '
       'bicchiere giusto e nessuno faccia troppe domande a voce alta — meglio bisbigliare, '
       'meglio pagare, meglio non guardare troppo a lungo verso il canale fuori dalla '
       'finestra. Sotto il tavolo più vicino alla porta, qualcuno ha inciso una piccola '
       'onda nel legno, tanto tempo fa, con un coltello o forse con un’unghia; nessuno '
       'dei presenti sembra ricordare chi, o perché, eppure più di uno, senza accorgersene, '
       'vi passa sopra il pollice mentre parla.',
    4: 'Odore d’incenso stantio e di chiuso, cera vecchia colata su decenni di funzioni '
       'e legno umido che nessuna stufa riesce davvero a scaldare. Don Callisto vi '
       'riceve tra i paramenti appesi come sudari lungo le pareti della sagrestia, '
       'nervoso, nascondendo dietro la schiena mani sporche di cera che si affretta a '
       'strofinare sulla tonaca non appena se ne accorge. Alle sue spalle, la porta '
       'della cripta è sbarrata con assi nuove inchiodate su pietra antica, il legno '
       'ancora chiaro contro il grigio consumato degli stipiti: «Chiusa per lavori», '
       'taglia corto, e la voce gli si incrina sull’ultima sillaba come una corda '
       'troppo tesa, mentre le sue dita cercano involontariamente un crocifisso al '
       'collo. Da qualche parte, sotto i vostri piedi, il pavimento sembra vibrare '
       'appena — un tremito più sentito che udito — o forse è solo l’organo, in '
       'restauro, che qualcuno continua a provare anche senza un organista, note isolate '
       'che risalgono le canne come se cercassero una strada verso l’alto.',
    5: 'La bottega è chiusa da giorni, la polvere ha già preso possesso delle vetrine '
       'come muschio su una lapide, e le insegne dipinte a mano iniziano a scrostarsi '
       'sotto la pioggia; la porta sul retro cede a una spallata con un cigolio che '
       'sembra un lamento, come se l’edificio stesso protestasse per l’intrusione. '
       'Dentro, violini appesi come selvaggina in una macelleria, decine di sagome scure '
       'contro la luce polverosa delle finestre alte, e un silenzio sbagliato, '
       'innaturale, per un luogo nato per fare musica — nemmeno l’eco dei vostri passi '
       'sembra propagarsi come dovrebbe. Il banco da lavoro è in ordine perfetto — '
       'troppo perfetto: gli attrezzi allineati per misura, la polvere di legno spazzata '
       'in un angolo, come se chi è partito sapesse di partire e avesse avuto tutto il '
       'tempo per sistemare ogni cosa al suo posto prima di sparire per sempre. Sul '
       'pavimento, un filo sottile di cera nera conduce dal camino spento fino alla '
       'soglia, e si perde nel buio della strada, come una traccia lasciata apposta — o '
       'dimenticata da chi non pensava che qualcuno l’avrebbe seguita.',
    6: 'L’acqua qui non scorre: sta. Nera, ferma, densa come olio, lambisce magazzini '
       'ciechi dai portoni murati e riflette a stento la luna, come se non volesse '
       'restituire nemmeno quella; ogni tanto qualcosa la increspa da sotto, senza mai '
       'affiorare abbastanza da farsi vedere. Il guardiano notturno esce dal casotto con '
       'la lanterna alzata, il fiato che si condensa nell’aria fredda, e per qualche '
       'moneta la diffidenza si scioglie in fretta: da settimane muore dalla voglia di '
       'raccontare a qualcuno quello che sente la notte, ma abbassa comunque la voce, '
       'come se l’acqua stessa potesse origliare, e ogni tanto lancia un’occhiata ai '
       'magazzini alle sue spalle come per assicurarsi che restino zitti. Ogni tanto, '
       'tra un magazzino e l’altro, una corrente più fredda delle altre risale dai '
       'condotti e vi si infila sotto i vestiti, portando con sé un odore di cera '
       'bruciata e di qualcosa di più antico, di pietra bagnata da secoli.',
    7: 'Scaffali fino al soffitto, cartelle legate con lo spago ingiallito che si sfalda '
       'al tocco, la luce verde delle lampade a schermo che disegna ombre lunghe e '
       'innaturali sul pavimento di pietra consumato al centro dai passi di secoli di '
       'impiegati. L’archivista, minuscolo dietro occhiali spessi che gli ingrandiscono '
       'gli occhi in modo quasi comico, si irrigidisce quando pronunciate la parola '
       'giusta, come se l’aveste evocato più che interpellato, e per un istante smette '
       'persino di respirare: poi, senza fiatare, senza fare altre domande, vi guida '
       'lungo corridoi di scaffali che si perdono nel buio verso il fondo, fino a uno '
       'scaffale che nessuno tocca da decenni. La polvere è spessa un dito ovunque — '
       'grigia, uniforme, indisturbata — tranne che su un solo fascicolo, pulito e '
       'consultato di recente più volte di quante l’archivista sia disposto ad '
       'ammettere, le sue impronte ancora visibili sul dorso della cartella.',
    8: 'Pile di pratiche che minacciano di franare a ogni corrente d’aria, una stufa che '
       'fuma più di quanto scaldi riempiendo la stanza di un odore acre di carbone '
       'bagnato, il brigadiere che vi riceve senza alzarsi dalla sedia scricchiolante, '
       'una penna che gira tra le dita senza mai toccare la carta. «Il campanaro? Sarà '
       'scappato con qualche vedova», dice, con la noia di chi ha già archiviato il caso '
       'nella propria testa molto prima di archiviarlo sulla carta. Ma mentre lo dice '
       'non vi guarda negli occhi, fissa un punto sulla scrivania appena a sinistra del '
       'vostro sguardo, e la sua mano tamburella senza sosta su un fascicolo di denunce '
       'che continua a spostare da un lato all’altro della scrivania, come se sperasse '
       'che, ignorandolo abbastanza a lungo e abbastanza visibilmente, quel fascicolo '
       'finisse per sparire da solo — o per farsi notare da chi sa fare le domande '
       'giuste.',
}

TESSERE_DESC = {
    'T2': 'Casse marchiate a fuoco con l’onda, accatastate fino a toccare il soffitto in '
          'corridoi che si restringono a ogni fila, tanto che in certi punti bisogna '
          'passare di lato per proseguire. L’aria sa di catrame e legno bagnato, e la '
          'luce della vostra lanterna fatica a raggiungere il fondo delle pile più alte, '
          'lasciando l’ultimo metro di ogni corridoio in un buio pieno di spigoli. '
          'Qualcosa, tra le pile, scricchiola nei momenti esatti in cui nessuno si '
          'muove — mai prima, mai dopo — come se il legno stesso trattenesse il fiato '
          'insieme a voi. Alcune casse sono aperte e vuote, coperchi gettati a terra con '
          'poca cura; altre, chiuse e inchiodate di recente, sembrano aspettare qualcuno '
          'che non è ancora arrivato.',
    'T3': 'Migliaia di candele nere trasformano il corridoio in una gola di luce '
          'tremolante che si arrampica lungo pareti troppo strette per essere naturali, '
          'incise di simboli che la fuliggine ha reso quasi illeggibili. Il caldo è '
          'innaturale, quasi umido, e la cera cola dalle mensole come pioggia lenta, '
          'accumulandosi in piccole stalattiti nere sul pavimento consumato. Ogni fiamma '
          'arde immobile, dritta, senza vacillare — nemmeno quando l’aria si muove al '
          'vostro passaggio, un dettaglio che il corpo nota prima della mente. Chi entra '
          'per la prima volta prova NERVI (Media): se fallisce, 1 danno (cera '
          'bollente). Da qualche parte oltre le fiamme più lontane, appena percettibile, '
          'qualcosa somiglia a un respiro collettivo, trattenuto e mai rilasciato del '
          'tutto.',
    'T4': 'Una scrivania sommersa di spartiti annotati con grafia febbrile, righe e '
          'correzioni che si accavallano fino a diventare illeggibili verso i bordi del '
          'foglio, come se la mano che scriveva avesse perso ogni pazienza con lo '
          'spazio a disposizione. Un pagliericcio disfatto puzza di sego e sudore '
          'antico, coperte ammucchiate più che piegate, e una tazza sul comodino è '
          'ancora tiepida al tatto, come se chi l’ha lasciata fosse appena uscito da '
          'quella porta — o l’avesse sentita aprirsi e si fosse nascosto in tempo. Il '
          'custode non è lontano: un rumore di passi, oltre la parete, si ferma non '
          'appena vi fermate anche voi, e riprende solo quando ricominciate a muovervi.',
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
ROW = st('row', fontName=F['r'], fontSize=10.5, leading=15)
NONE_ROW = st('none_row', fontName=F['i'], fontSize=9.5, leading=14, textColor=SEPIA)

def oggetto_di(ref):
    return next((o for o in OGGETTI if o['ref'] == ref), None)

def oggetto_riga(ref):
    """Carta Oggetto da consegnare per questo luogo/tessera, se c'e' -
    sotto-sezione 'carte da prendere' della sezione Indizi (vedi
    indizi_block): l'Oggetto e' gia' nominato nell'indizio letto ad alta
    voce, questa riga serve solo a chi arbitra per sapere quale carta
    fisica prendere dal mazzo."""
    ogg = oggetto_di(ref)
    if not ogg:
        return []
    tag = ' ⚠ rischioso' if ogg.get('rischio') else ''
    return [f"<b>Oggetto</b> — carta “{ogg['nome'].title()}”{tag}"]

def approfondimenti_righe(approfondimenti):
    """Carte Approfondimento del luogo - SOLO queste, mai l'Oggetto (vedi
    oggetto_riga): vanno nella sezione Approfondimenti, sempre sul retro
    della pagina del luogo (vedi pagina_retro_luogo). Ogni riga dice anche
    quale eroe puo' sbloccarla (TIPO_EROI + il jolly di Sibilla)."""
    out = []
    for a in approfondimenti:
        tipo = TIPO_LABEL[a['tipo']]
        sblocca = f"sblocca: {TIPO_EROI[a['tipo']]}, o Sibilla col jolly"
        if 'soggetto' in a:
            out.append(f"<b>{tipo}</b> — carta “{a['soggetto']}” <i>({sblocca})</i>")
        else:
            out.append(f"<b>{tipo}</b> <i>({a['tipo']} — {sblocca})</i>")
    return out

COL_W = WINDOW_TOP[0]*W - MX - 4*mm  # colonna libera a sinistra dell'arte (in alto)
DESC_TOP = H - 37*mm
DESC_MAX_H = DESC_TOP - (ART_BOTTOM - 4*mm) - 3*mm  # non scendere sotto la riga separatrice

def fit_desc(c, text, start=9.5, floor=7, desc_top=None):
    """Testo lungo quanto serve: prova la dimensione naturale, poi la riduce
    finche' non entra nella colonna senza toccare la riga sotto l'arte -
    cosi' si puo' scrivere in liberta' senza contare le righe a mano."""
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

def header(c, label_text, nome_text, desc_text, entrata=None):
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(MX, H - 20*mm, label_text.lower())
    c.setFillColor(RED); c.setFont(F['sc'], 18)
    # nomi lunghi: riduci il font finche' non entra nella colonna libera (bordo art escluso)
    size = 18
    while c.stringWidth(nome_text.lower(), F['sc'], size) > COL_W and size > 10:
        size -= 1
    c.setFont(F['sc'], size)
    c.drawString(MX, H - 30*mm, nome_text.lower())
    desc_top = DESC_TOP
    if entrata:
        # L'oracolo della regola Bussare, subito sotto il nome del luogo:
        # e' la prima cosa che chi arbitra deve trovare quando il gruppo
        # dichiara una chiave (richiesta esplicita: non in fondo, tra gli
        # indizi, ma in testa alla pagina).
        c.setFillColor(RED); c.setFont(F['sc'], 9)
        c.drawString(MX, H - 36*mm, entrata)
        desc_top = H - 43*mm
    d, dh = fit_desc(c, desc_text, desc_top=desc_top)
    d.drawOn(c, MX, desc_top - dh)
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, ART_BOTTOM - 4*mm, W - MX, ART_BOTTOM - 4*mm)

def body(c, rows, y_start=None, none_text='Nessun Approfondimento qui.'):
    y = ART_BOTTOM - 12*mm if y_start is None else y_start
    if not rows:
        p = Paragraph(none_text, NONE_ROW)
        p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - 5*mm)
        return y - 5*mm
    for r in rows:
        p = Paragraph(f'— {r}', ROW)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 4*mm
    return y

INDIZIO_ROW = st('indizio_row', fontName=F['i'], fontSize=10, leading=14)

def indizi_block(c, indizi, oggetto_rows, y_top):
    """Indizi core del luogo: da leggere ad alta voce a tutti, in cima al
    blocco sotto l'arte. Se il luogo sblocca un Oggetto, sotto agli indizi
    (ben separata da una riga) una sotto-sezione 'carte da prendere' -
    solo per chi arbitra, dice quale carta fisica consegnare (l'Oggetto e'
    gia' nominato nell'indizio stesso). Se non c'e' un Oggetto, la
    sotto-sezione non compare affatto: qui l'opacita' non serve, e' la
    parte letta a voce alta, gia' sotto gli occhi di tutti."""
    c.setFillColor(TEAL); c.setFont(F['sc'], 9)
    c.drawString(MX, y_top, 'indizi — leggeteli ad alta voce')
    y = y_top - 5*mm
    for ind in indizi:
        p = Paragraph(f'• {ind}', INDIZIO_ROW)
        pw, ph = p.wrapOn(c, W - 2*MX, 60*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 3*mm
    if oggetto_rows:
        y -= 2*mm
        c.setStrokeColor(SEPIA); c.setLineWidth(0.3)
        c.line(MX, y, W - MX, y)
        y -= 6*mm
        c.setFillColor(TEAL); c.setFont(F['sc'], 8)
        c.drawString(MX, y, 'carte da prendere — solo per chi arbitra')
        y -= 5*mm
        for r in oggetto_rows:
            p = Paragraph(f'— {r}', ROW)
            pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
            p.drawOn(c, MX, y - ph)
            y -= ph + 4*mm
    return y

def nome_fit(c, text, max_w, start=17):
    size = start
    while c.stringWidth(text.lower(), F['sc'], size) > max_w and size > 10:
        size -= 1
    return size

def pagina_retro_luogo(c, L):
    """Retro fisico della pagina del luogo (stampa fronte/retro): SEMPRE
    presente, anche quando il luogo non ha nessun Approfondimento - stessa
    struttura visiva in entrambi i casi (vedi body(), fallback
    'Nessun Approfondimento qui.'), cosi' chi arbitra non puo' capire a
    colpo d'occhio, sfogliando, se un luogo ne nasconde uno oppure no.
    Sfondo pergamena semplice (niente arte strappata: e' solo la scheda
    di consultazione, non serve)."""
    parchment_art(c, W, H)
    rule_border(c, W, H)
    max_w = W - 2*MX
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(MX, H - 20*mm, f"luogo {L['n']}".lower())
    size = nome_fit(c, L['nome'], max_w)
    c.setFillColor(RED); c.setFont(F['sc'], size)
    c.drawString(MX, H - 30*mm, L['nome'].lower())
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, H - 36*mm, W - MX, H - 36*mm)
    c.setFillColor(TEAL); c.setFont(F['sc'], 10)
    c.drawString(MX, H - 44*mm, 'approfondimenti')
    c.setFillColor(TEAL); c.setFont(F['sc'], 8.5)
    c.drawString(MX, H - 50*mm, 'carte da prendere — solo per chi arbitra')
    body(c, approfondimenti_righe(L['approfondimenti']), H - 55*mm)

def pagina_indice_citta(c, luoghi, etichetta_ep):
    """Prima pagina del fascicolo: l'indice voce di Mappa -> carta Luogo,
    solo per chi arbitra - e' il ponte che NON sta mai sulla Mappa ne'
    sulle carte (vedi bibbia 1-sexies). Ogni altra voce dello stradario
    e' una pista fredda: risposta di colore, nessuna ora spesa."""
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(MX, H - 22*mm, 'la città in questo episodio — solo per chi arbitra')
    c.setFillColor(INK); c.setFont(F['i'], 9.5)
    c.drawString(MX, H - 29*mm, 'Quando il gruppo dichiara una destinazione dalla Mappa, cercatela qui:')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, H - 33*mm, W - MX, H - 33*mm)
    y = H - 42*mm
    for L in luoghi:
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
    # Retro di servizio: mantiene la parita' fronte/retro delle coppie
    # luogo/retro che seguono (istruzioni d'uso, nessun segreto).
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(TEAL); c.setFont(F['sc'], 12)
    c.drawString(MX, H - 22*mm, 'come si usa questo fascicolo')
    for i, riga in enumerate([
            'Ogni luogo occupa un foglio: sul fronte la scena e gli indizi da leggere ad alta voce',
            '(e, se il luogo è bloccato, la riga rossa con cui verificare la chiave dichiarata);',
            'sul retro gli Approfondimenti — sempre presenti, anche quando non c’è nulla, così',
            'sfogliando non si capisce mai dove si nasconde qualcosa.',
            f'Le tessere della Spedizione ({etichetta_ep}) chiudono il fascicolo.']):
        c.setFillColor(INK); c.setFont(F['i'], 10)
        c.drawString(MX, H - 32*mm - i*6*mm, riga)
    c.showPage()


def narratore():
    out_path = os.path.join(OUT_DIR, 'Luoghi.pdf')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Luoghi (riferimenti narratore)')
    pagina_indice_citta(c, LUOGHI, 'Episodio 1')

    for L in LUOGHI:
        # Fronte: arte + (se bloccato) la riga "si entra con" + indizi (letti
        # ad alta voce) + eventuale Oggetto da consegnare. Retro: SEMPRE gli
        # Approfondimenti (vedi pagina_retro_luogo) - le due pagine restano
        # consecutive nel PDF cosi' una stampa fronte/retro normale le allinea
        # sullo stesso foglio.
        torn_portrait(c, W, H, LUOGHI_ART[L['n']], TORN_TOP, window=WINDOW_TOP,
                      **LUOGHI_CROP.get(L['n'], {}))
        rule_border(c, W, H)
        entrata = None
        if L.get('chiave'):
            # L'oracolo della regola Bussare (vedi Regolamento): quando il
            # gruppo dichiara UNA parola/UN oggetto per entrare, chi arbitra
            # verifica QUI - e' l'unico posto dove la chiave e' scritta.
            tipo_chiave, valore = L['chiave']
            chiave_txt = (f'la parola «{valore}»' if tipo_chiave == 'parola'
                          else f'l’oggetto “{valore}”')
            entrata = f'si entra con {chiave_txt} — solo per chi arbitra'
        header(c, f"luogo {L['n']}", L['nome'], LUOGHI_DESC[L['n']], entrata=entrata)
        indizi_block(c, L.get('indizi', []), oggetto_riga(f"L{L['n']}"), ART_BOTTOM - 10*mm)
        c.showPage()
        pagina_retro_luogo(c, L)
        c.showPage()

    for t in TILES:
        if t['id'] not in TILE_ART:
            continue
        torn_portrait(c, W, H, TILE_ART[t['id']], TORN_TOP, window=WINDOW_TOP)
        rule_border(c, W, H)
        header(c, f"tessera {t['id']}", t['nome'], TESSERE_DESC[t['id']])
        body(c, oggetto_riga(t['id']), none_text='Nessun oggetto da Cercare qui.')
        c.showPage()

    c.save()
    pad_to_even_pages(out_path)

if __name__ == '__main__':
    narratore()
    print('OK narratore')
