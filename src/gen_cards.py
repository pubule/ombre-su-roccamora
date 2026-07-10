# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Schede, Indagine, Spedizione (PDF via canvas+frames)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.styles import ParagraphStyle

W, H = A4
INK = colors.HexColor("#2b2b33")
RED = colors.HexColor("#7a1f2b")
TEAL = colors.HexColor("#1f5f6b")
PAPER = colors.HexColor("#f7f2e7")
GOLD = colors.HexColor("#b08d3e")

def st(name, **kw):
    base = dict(fontName='Times-Roman', fontSize=9.5, leading=12.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

BODY = st('body', alignment=4)
CLUE = st('clue', leftIndent=10, spaceAfter=2.5)
HIDN = st('hidn', leftIndent=10, textColor=TEAL, fontName='Times-Italic', spaceAfter=2)
TTL  = st('ttl', fontName='Times-Bold', fontSize=13.5, textColor=RED, leading=15)
SUB  = st('sub', fontName='Times-Italic', fontSize=9, textColor=TEAL)
SMB  = st('smb', fontName='Helvetica-Bold', fontSize=8, textColor=TEAL, spaceBefore=4, spaceAfter=2)
CARD = st('card', fontName='Times-Roman', fontSize=8.6, leading=10.6)
CTTL = st('cttl', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.white, leading=11)

def wave(c, x, y, w, col=TEAL, lw=1.4):
    """small wave sigil"""
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(lw)
    seg = w / 4.0
    p = c.beginPath(); p.moveTo(x, y)
    for i in range(4):
        x0 = x + i * seg
        p.curveTo(x0 + seg*0.25, y + 4, x0 + seg*0.75, y - 4, x0 + seg, y)
    c.drawPath(p); c.restoreState()

def frame_flow(c, x, y, w, h, flow):
    Frame(x, y, w, h, leftPadding=0, rightPadding=0, topPadding=0,
          bottomPadding=0, showBoundary=0).addFromList(flow, c)

def card_frame(c, x, y, w, h, corner=True):
    c.saveState()
    c.setFillColor(colors.white); c.setStrokeColor(INK); c.setLineWidth(1.1)
    c.rect(x, y, w, h, stroke=1, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(0.6)
    c.rect(x + 2.2*mm, y + 2.2*mm, w - 4.4*mm, h - 4.4*mm)
    c.restoreState()

# ================================================================= SCHEDE
HEROES = [
    dict(nome='ELENA FOSCO', ruolo='L\u2019Investigatrice', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Occhio Clinico</b> \u2014 In indagine: quando Elena visita un luogo con una '
               'carta <b>Indizio Nascosto</b> abbinata, consultatela subito. In spedizione: +2 alle '
               'prove di Cercare.'),
         equip='Bastone animato (arma, +1), lente d\u2019ingrandimento, taccuino rilegato.'),
    dict(nome='DOTT. ATTILIO MARN', ruolo='Il Medico', acume=2, vigore=2, nervi=2,
         salute=7, difesa=8,
         abil=('<b>Pronto Soccorso</b> \u2014 Tre volte per spedizione, con un\u2019azione cura '
               '2 Salute a un eroe adiacente o a s\u00e9 stesso. Rianimare gli riesce sempre '
               'riportando l\u2019eroe a 3 Salute invece che a 2.'),
         equip='Bisturi lungo (arma, +1), borsa medica, sali aromatici.'),
    dict(nome='SIBILLA REVE', ruolo='L\u2019Occultista', acume=2, vigore=1, nervi=3,
         salute=6, difesa=8,
         abil=('<b>Sesto Senso</b> \u2014 Una volta per round, prima della fase Minaccia, guarda '
               'le prime 2 carte del mazzo e rimettile sopra nell\u2019ordine che preferisce.'),
         equip='Pugnale rituale (arma, +1), pendolo d\u2019ossidiana, gessetti.'),
    dict(nome='NINO \u201cGRIMALDELLO\u201d CAUTO', ruolo='Il Ladro', acume=2, vigore=2, nervi=1,
         salute=7, difesa=9,
         abil=('<b>Grimaldello</b> \u2014 Serrature e lucchetti: per Nino ogni prova per '
               'scassinare cala di un grado (Difficile\u2192Media, Media\u2192Facile). '
               'Inoltre si muove di 5 caselle invece di 4.'),
         equip='Sfollagente (arma, +1), grimaldelli, corda con rampino.'),
    dict(nome='OTTONE \u201cMEZZENA\u201d MASSARI', ruolo='Il Macellaio', acume=1, vigore=3, nervi=2,
         salute=8, difesa=8,
         abil=('<b>Un bicchiere con tutti</b> \u2014 In indagine: una volta per episodio, '
               'offrendo da bere e da mangiare fa ripetere una testimonianza: se il luogo ha '
               'una carta <b>Indizio Nascosto</b> abbinata, consultatela. In spedizione, '
               '<b>Colpo da macello</b>: una volta per turno, se abbatte un nemico in mischia '
               'attacca immediatamente un altro nemico adiacente.'),
         equip='Mannaia del banco (arma, +1), grembiule di cuoio, fiasco di vino robusto '
               '(2 usi: un sorso, anche su un eroe adiacente, annulla un effetto di paura o dei fumi).'),
    dict(nome='CARLA DOSTI', ruolo='La Giornalista', acume=3, vigore=1, nervi=2,
         salute=6, difesa=8,
         abil=('<b>Fonti riservate</b> \u2014 In indagine: una volta per episodio, una visita non '
               'costa nessuna ora. In spedizione: <b>Flash!</b> (2 usi) \u2014 azione: un nemico '
               'entro 2 caselle salta la sua prossima attivazione.'),
         equip='Ombrello ferrato (arma, +1), macchina fotografica, blocco note.'),
]

def stat_box(c, x, y, w, label, value):
    c.saveState()
    c.setStrokeColor(TEAL); c.setLineWidth(1); c.setFillColor(PAPER)
    c.rect(x, y, w, 18*mm, fill=1)
    c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 8)
    c.drawCentredString(x + w/2, y + 13.5*mm, label)
    c.setFillColor(INK); c.setFont('Times-Bold', 20)
    c.drawCentredString(x + w/2, y + 4*mm, str(value))
    c.restoreState()

def schede():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-02-Schede-Personaggio.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Schede Personaggio')
    for hro in HEROES:
        mx, mt = 20*mm, 20*mm
        # header
        c.setFillColor(RED); c.setFont('Times-Bold', 24)
        c.drawString(mx, H - mt - 6*mm, hro['nome'])
        c.setFillColor(TEAL); c.setFont('Times-Italic', 13)
        c.drawString(mx, H - mt - 12.5*mm, hro['ruolo'] + '  \u2014  Societ\u00e0 del Lume, Roccamora')
        wave(c, W - mx - 30*mm, H - mt - 8*mm, 30*mm)
        c.setStrokeColor(INK); c.setLineWidth(1)
        c.line(mx, H - mt - 16*mm, W - mx, H - mt - 16*mm)
        # stats
        y0 = H - mt - 40*mm
        bw = (W - 2*mx - 4*10*mm) / 5.0
        labels = [('ACUME', hro['acume']), ('VIGORE', hro['vigore']), ('NERVI', hro['nervi']),
                  ('DIFESA', hro['difesa']), ('SALUTE', hro['salute'])]
        for i, (lb, v) in enumerate(labels):
            stat_box(c, mx + i*(bw + 10*mm), y0, bw, lb, v)
        # salute track
        y1 = y0 - 16*mm
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
        c.drawString(mx, y1 + 8*mm, 'SEGNAPUNTI SALUTE (coprite le caselle con monete o segnate a matita)')
        c.setStrokeColor(INK); c.setLineWidth(0.9)
        for i in range(hro['salute']):
            c.setFillColor(colors.white)
            c.rect(mx + i*11*mm, y1 - 2*mm, 9*mm, 9*mm, fill=1)
            c.setFillColor(INK); c.setFont('Helvetica', 7)
            c.drawCentredString(mx + i*11*mm + 4.5*mm, y1 + 1*mm, str(i+1))
        # secondo fiato
        c.setFillColor(colors.white); c.rect(W - mx - 9*mm, y1 - 2*mm, 9*mm, 9*mm, fill=1)
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 8)
        c.drawRightString(W - mx - 12*mm, y1 + 1*mm, 'SECONDO FIATO (1 ritento a episodio)')
        # ability + equip
        y2 = y1 - 14*mm
        frame_flow(c, mx, y2 - 42*mm, W - 2*mx, 42*mm, [
            Paragraph('ABILIT\u00c0 UNICA', SMB), Paragraph(hro['abil'], BODY),
            Spacer(1, 6),
            Paragraph('EQUIPAGGIAMENTO INIZIALE', SMB), Paragraph(hro['equip'], BODY),
            Spacer(1, 4),
            Paragraph('Le armi (+1) aggiungono +1 ai tiri di Attacco.', SUB),
        ])
        # campaign notes
        y3 = y2 - 52*mm
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
        c.drawString(mx, y3, 'MIGLIORIE E OGGETTI DI CAMPAGNA')
        c.setStrokeColor(colors.HexColor('#999999')); c.setLineWidth(0.5)
        for i in range(5):
            c.line(mx, y3 - 8*mm - i*8*mm, W - mx, y3 - 8*mm - i*8*mm)
        y4 = y3 - 56*mm
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
        c.drawString(mx, y4, 'CICATRICI (alla terza: \u22121 permanente a una caratteristica)')
        for i in range(3):
            c.line(mx, y4 - 8*mm - i*8*mm, W - mx, y4 - 8*mm - i*8*mm)
        c.showPage()
    c.save()

# ================================================================= INDAGINE
LETTERA = ("Alla Societ\u00e0 del Lume, riservata.<br/><br/>"
           "\u00abTre notti fa le campane di San Teodoro hanno suonato da sole, alle 3 in punto. "
           "La stessa notte \u00e8 scomparso <b>Ruggero Alvise</b>, il campanaro: quarant\u2019anni di "
           "servizio, n\u00e9 debiti n\u00e9 nemici. La gendarmeria parla di fuga volontaria. Sua sorella "
           "Bice ha bussato alla nostra porta in lacrime.<br/><br/>"
           "Trovatelo. Avete <b>10 ore</b>, dalle 18:00 alle 4:00: dopo, temo, sar\u00e0 tardi. "
           "Segnate ogni ora sul Taccuino e annotate tutto: nomi, orari, e ogni parola scritta "
           "in MAIUSCOLO.<br/>\u2014 M., presidente della Societ\u00e0\u00bb<br/><br/>"
           "<i>Luoghi disponibili dall\u2019inizio: 1, 2, 3, 4, 8. Gli altri vanno sbloccati.</i>")

LUOGHI = [
    dict(n=1, nome='IL CAMPANILE DI SAN TEODORO', req='Disponibile dall\u2019inizio',
         testo='La scala a chiocciola sale nel buio. In cima, la cella campanaria \u00e8 in disordine: '
               'lo sgabello di Ruggero \u00e8 rovesciato, la sua lanterna ancora appesa.',
         indizi=['Colate di <b>cera nera</b> sui gradini \u2014 troppo in alto perch\u00e9 vengano dalle candele della chiesa.',
                 'Il diario di Ruggero, con l\u2019ultima pagina strappata. Ricalcando i solchi della penna leggete: '
                 '\u00ab...alle 3 in punto, ogni notte. <b>Tre rintocchi, poi uno, poi cinque.</b> Non sono io a suonare.\u00bb',
                 'Graffiata sul legno della balaustra, una parola: <b>SOMMERSO</b>.'],
         nascosto='Indizio nascosto: tra le assi, un frammento di spartito scritto a mano. '
                  'Le note non sono per organo: sono per <b>campane</b>.'),
    dict(n=2, nome='CASA DI RUGGERO \u2014 VICOLO DEI FONDITORI', req='Disponibile dall\u2019inizio',
         testo='Bice, la sorella, vi apre con gli occhi rossi: \u00abNegli ultimi tempi diceva di sentire '
               'musica sotto il pavimento della cripta. E aveva paura del suo stesso campanile.\u00bb',
         indizi=['Sul tavolo, una <b>CORDA DI VIOLINO d\u2019argento</b>: \u00abL\u2019ha trovata in cripta\u00bb, dice Bice. '
                 '<i>(Oggetto: sblocca il Luogo 5.)</i>',
                 'Una ricevuta: Ruggero aveva chiesto all\u2019Archivio Civico i documenti antichi della cattedrale.',
                 'Bice: \u00abL\u2019ultima sera ripeteva una parola, come una preghiera al contrario: sommerso, sommerso.\u00bb'],
         nascosto=None),
    dict(n=3, nome='TAVERNA DEL PONTE ROTTO', req='Disponibile dall\u2019inizio',
         testo='Fumo, vino cattivo e barcaioli. Qui le lingue si sciolgono con poco.',
         indizi=['Ugo il barcaiolo: \u00abTre notti fa una <b>CHIATTA</b> senza lanterne ha scaricato casse al '
                 'Canale Basso. Alle 3, proprio mentre le campane suonavano da sole.\u00bb '
                 '<i>(Parola chiave: sblocca il Luogo 6.)</i>',
                 'Un avventore ubriaco: \u00abVicino ai vecchi magazzini c\u2019\u00e8 puzza di cera bruciata da settimane.\u00bb',
                 'L\u2019oste conferma: <b>Tonio il sagrestano</b> era qui a giocare a carte fino all\u2019alba, '
                 'la notte della scomparsa.'],
         nascosto=None),
    dict(n=4, nome='LA SAGRESTIA DELLA CATTEDRALE', req='Disponibile dall\u2019inizio',
         testo='Don Callisto vi riceve nervoso, le mani sporche di cera. Dietro di lui, la porta della '
               'cripta \u00e8 sbarrata: \u00abChiusa per lavori\u00bb, taglia corto.',
         indizi=['La tabella degli inni segna il numero <b>315</b>, \u00abDal Profondo\u00bb. Tonio giura di non averlo '
                 'mai impostato: \u00abQuell\u2019inno non si canta da cent\u2019anni. \u00c8 roba dell\u2019antico coro.\u00bb',
                 'Don Callisto ammette: la <b>seconda chiave della cripta</b> ce l\u2019ha il liutaio <b>Ferri</b>, '
                 'che sta restaurando l\u2019organo.',
                 'Prima che usciate, vi mette in mano un\u2019<b>ampolla di acqua benedetta</b>: \u00abSe l\u00e0 '
                 'sotto c\u2019\u00e8 il demonio, portate questa.\u00bb'],
         nascosto='Indizio nascosto: la cera sulle mani di don Callisto \u00e8 bianca, comune: '
                  'vende candele di nascosto per pagare i debiti della parrocchia. Con la cera nera non c\u2019entra.'),
    dict(n=5, nome='BOTTEGA DEL LIUTAIO FERRI', req='Serve: la CORDA DI VIOLINO (Luogo 2)',
         testo='Bottega chiusa da giorni; la porta sul retro cede a una spallata. Dentro, polvere e '
               'violini appesi come selvaggina.',
         indizi=['Bastiano Ferri \u00e8 sparito da tre giorni. Sul banco, un <b>diapason d\u2019argento</b> inciso '
                 'con un\u2019onda.',
                 'Il registro consegne, ultima riga: \u00ab40 candele di cera nera \u2014 consegna al <b>C.B.</b>, '
                 'molo terzo, il vecchio deposito \u2014 pagato B.F.\u00bb',
                 'Uno spartito: \u00abDal Profondo\u00bb, riscritto <b>per campane</b>. In margine: \u00abil bronzo canta, '
                 'la pietra risponde, l\u2019acqua ricorda\u00bb.'],
         nascosto=None),
    dict(n=6, nome='IL CANALE BASSO', req='Serve: la parola chiave CHIATTA (Luogo 3)',
         testo='Acqua nera e ferma, magazzini ciechi. Il guardiano notturno accetta di parlare per '
               'qualche moneta.',
         indizi=['\u00abLe casse erano marchiate a fuoco con un\u2019<b>onda</b>. Le hanno portate al vecchio '
                 '<b>Magazzino delle Cere</b>, quello chiuso da vent\u2019anni.\u00bb',
                 '\u00abAlle 3 di notte, da l\u00e0 dentro, viene un canto sommesso. Di molte voci. Una volta... '
                 'ho sentito un urlo.\u00bb',
                 'Sul molo: gocce di cera nera e un lucchetto nuovo di zecca sulla porta della banchina, '
                 'di quelli <b>a tre cifre</b>.'],
         nascosto=None),
    dict(n=7, nome='L\u2019ARCHIVIO CIVICO', req='Serve: la parola chiave SOMMERSO (Luogo 1)',
         testo='L\u2019archivista, sentendo la parola giusta, vi guida a uno scaffale che nessuno tocca '
               'da decenni.',
         indizi=['Fascicolo del 1741: la confraternita del <b>Coro Sommerso</b>, bandita per \u00abpratiche '
                 'contrarie a Dio e alla quiete delle acque\u00bb. Si riuniva in cavit\u00e0 sotto la cattedrale, '
                 '\u00abdove l\u2019acqua canta\u00bb. Il suo sigillo: un\u2019onda.',
                 'Una mappa antica: dalla cripta, condotti scendono verso il <b>Canale Basso</b>.',
                 'Registro consultazioni, due mesi fa: \u00ab<b>B. Ferri, liutaio</b>\u00bb ha richiesto questo '
                 'stesso fascicolo.'],
         nascosto=None),
    dict(n=8, nome='LA GENDARMERIA', req='Disponibile dall\u2019inizio',
         testo='Il brigadiere vi riceve tra pile di pratiche: \u00abIl campanaro? Sar\u00e0 scappato con '
               'qualche vedova.\u00bb',
         indizi=['Nessuna richiesta di riscatto. Il sospettato ufficiale \u00e8 <b>Tonio il sagrestano</b>, '
                 'l\u2019ultimo ad aver visto Ruggero.',
                 'Denunce recenti: furti di <b>cera e canapa</b> da tre chiese. E un fonditore giura d\u2019aver '
                 'venduto un quintale di bronzo a un compratore incappucciato.',
                 '\u00abSe trovate qualcosa di concreto, tornate. Non perquisiamo mezza citt\u00e0 per un campanaro '
                 'con la testa fra le nuvole.\u00bb'],
         nascosto=None),
]

def indagine():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-03-Episodio1-Indagine.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Indagine')
    # --- lettera d'incarico (page 1)
    mx = 25*mm
    c.setFillColor(RED); c.setFont('Times-Bold', 22)
    c.drawCentredString(W/2, H - 35*mm, 'EPISODIO 1')
    c.setFont('Times-Bold', 17)
    c.drawCentredString(W/2, H - 44*mm, 'Il caso del campanaro scomparso')
    wave(c, W/2 - 20*mm, H - 50*mm, 40*mm)
    frame_flow(c, mx, H - 165*mm, W - 2*mx, 105*mm,
               [Paragraph('LETTERA D\u2019INCARICO \u2014 leggere ad alta voce', SMB),
                Paragraph(LETTERA, st('let', fontSize=11, leading=16, alignment=4))])
    c.setFont('Times-Italic', 9); c.setFillColor(TEAL)
    c.drawCentredString(W/2, 20*mm, 'Ritagliate le carte Luogo delle pagine seguenti e disponetele coperte, numero in vista.')
    c.showPage()
    # --- location cards, 2 per page
    ch = (H - 30*mm) / 2.0
    cw = W - 24*mm
    for i, L in enumerate(LUOGHI):
        pos = i % 2
        x = 12*mm
        y = H - 12*mm - ch - pos * (ch + 6*mm)
        card_frame(c, x, y, cw, ch)
        # header band
        c.saveState()
        c.setFillColor(RED)
        c.rect(x + 2.2*mm, y + ch - 12*mm, cw - 4.4*mm, 9.8*mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Times-Bold', 13)
        c.drawString(x + 7*mm, y + ch - 9.4*mm, 'LUOGO %d \u2014 %s' % (L['n'], L['nome']))
        c.restoreState()
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 8)
        c.drawString(x + 7*mm, y + ch - 16.2*mm, L['req'])
        flow = [Paragraph(L['testo'], BODY), Spacer(1, 4), Paragraph('INDIZI', SMB)]
        for cl in L['indizi']:
            flow.append(Paragraph('\u25c6 ' + cl, CLUE))
        if L['nascosto']:
            flow.append(Spacer(1, 3))
            flow.append(Paragraph('\u2739 ' + L['nascosto'], HIDN))
        frame_flow(c, x + 7*mm, y + 5*mm, cw - 14*mm, ch - 24*mm, flow)
        if pos == 1 or i == len(LUOGHI) - 1:
            c.showPage()
    # --- taccuino
    c.setFillColor(RED); c.setFont('Times-Bold', 18)
    c.drawString(15*mm, H - 20*mm, 'TACCUINO DELLA SOCIET\u00c0 \u2014 Episodio 1')
    wave(c, W - 55*mm, H - 18*mm, 40*mm)
    c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
    c.drawString(15*mm, H - 30*mm, 'OROLOGIO \u2014 barrate un\u2019ora per ogni visita:')
    hrs = ['18', '19', '20', '21', '22', '23', '24', '1', '2', '3']
    for i, hh in enumerate(hrs):
        xx = 15*mm + i * 17*mm
        c.setStrokeColor(INK); c.setFillColor(colors.white); c.setLineWidth(1)
        c.circle(xx + 5*mm, H - 40*mm, 5*mm, fill=1)
        c.setFillColor(INK); c.setFont('Helvetica', 8)
        c.drawCentredString(xx + 5*mm, H - 41*mm, hh)
    def sect(ytop, label, nlines):
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
        c.drawString(15*mm, ytop, label)
        c.setStrokeColor(colors.HexColor('#aaaaaa')); c.setLineWidth(0.5)
        for i in range(nlines):
            c.line(15*mm, ytop - 7*mm - i*7*mm, W - 15*mm, ytop - 7*mm - i*7*mm)
        return ytop - 7*mm - (nlines-1)*7*mm - 12*mm
    yy = sect(H - 55*mm, 'PERSONE E SOSPETTI', 4)
    yy = sect(yy, 'INDIZI E PAROLE CHIAVE', 5)
    c.setFillColor(RED); c.setFont('Helvetica-Bold', 10)
    c.drawString(15*mm, yy, 'LE 4 DOMANDE \u2014 rispondete per iscritto, poi aprite la busta della Soluzione')
    doms = ['1. DOVE \u00e8 tenuto prigioniero Ruggero?',
            '2. CHI guida il Coro Sommerso?',
            '3. QUAL \u00c8 la combinazione a tre cifre del lucchetto?',
            '4. QUALE oggetto \u00e8 indispensabile portare con voi?']
    for i, d in enumerate(doms):
        yd = yy - 10*mm - i*16*mm
        c.setFillColor(INK); c.setFont('Times-Bold', 10.5)
        c.drawString(15*mm, yd, d)
        c.setStrokeColor(colors.HexColor('#aaaaaa'))
        c.line(15*mm, yd - 7*mm, W - 15*mm, yd - 7*mm)
    c.showPage()
    c.save()

# ================================================================ SPEDIZIONE
MINACCE = (
    # famiglia ADEPTO (4): stessa sostanza, apparizioni diverse
    [('ADEPTO IN AGGUATO', 'Piazzate 1 Adepto sull\u2019uscita pi\u00f9 lontana dagli eroi della tessera in cui si trova l\u2019eroe attivo.'),
     ('VOLTI TRA LE CASSE', 'Piazzate 1 Adepto sulla tessera rivelata pi\u00f9 lontana dagli eroi.'),
     ('IL FALCETTO NEL BUIO', 'Piazzate 1 Adepto sull\u2019ingresso della tessera corrente, alle spalle degli eroi.'),
     ('LA VEDETTA', 'Piazzate 1 Adepto adiacente all\u2019eroe pi\u00f9 isolato (quello pi\u00f9 lontano dagli altri; a pari merito, l\u2019eroe attivo).')] +
    # famiglia CANI (2)
    [('CANI DEI MOLI', 'Piazzate 1 Cane dei Moli sull\u2019uscita pi\u00f9 vicina agli eroi della tessera corrente: si attiva subito.'),
     ('UNGHIE SULLA PIETRA', 'Piazzate 1 Cane dei Moli sull\u2019ingresso della tessera corrente: si attiva subito.')] +
    # famiglia FONDITORE (2)
    [('IL FONDITORE', 'Piazzate 1 Fonditore sull\u2019ingresso della Banchina (T1). Se \u00e8 gi\u00e0 in gioco un Fonditore, recupera 1 ferita.'),
     ('LA MAREA DI CERA', 'Piazzate 1 Fonditore sull\u2019ingresso della Banchina (T1): tutti i Fonditori in gioco si attivano subito.')] +
    [('RONDA', 'Piazzate 2 Adepti sull\u2019ingresso della Banchina (T1).')] +
    # famiglia TRAPPOLE (2)
    [('TRAPPOLA DI CERA', 'L\u2019eroe pi\u00f9 avanzato prova NERVI (Media): se fallisce, cera bollente: 1 danno e perde 1 azione al prossimo turno.'),
     ('CERA SOTTO I PIEDI', 'L\u2019eroe attivo prova NERVI (Media): se fallisce, 1 danno e perde 1 azione al prossimo turno.')] +
    [('FUMI SOPORIFERI', 'Ogni eroe prova NERVI (Facile): chi fallisce ha 1 sola azione al prossimo turno.')] +
    # famiglia CANTO (3): crescendo, effetto identico
    [('IL CANTO SALE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se \u00e8 gi\u00e0 in gioco: recupera 1 ferita e si attiva subito.'),
     ('IL CORO RISPONDE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se \u00e8 gi\u00e0 in gioco: recupera 1 ferita e si attiva subito.'),
     ('IL CANTO CRESCE', 'Aggiungete 1 segnalino Canto. Al terzo: il Custode della Cera si desta (vedi Soluzione). Se \u00e8 gi\u00e0 in gioco: recupera 1 ferita e si attiva subito.')] +
    [('PRESAGIO', 'Un brivido corre lungo la schiena. Non accade nulla... per ora.')] +
    [('ECO AMICA', 'Tre colpi sordi, in lontananza: Ruggero \u00e8 vivo. Rivelate una tessera coperta adiacente a una rivelata.')] +
    [('CERA CHE COLA', 'Fino a fine round, sulla tessera dell\u2019eroe attivo muoversi costa il doppio.')] +
    [('RINFORZI DAL CANALE', 'Piazzate 1 Adepto sull\u2019ingresso della Banchina (T1).')] +
    [('SUSSURRI', 'L\u2019eroe con meno NERVI (a pari merito: sceglie il gruppo) prova NERVI (Media): se fallisce subisce 1 danno dal terrore.')]
)

NEMICI = [
    dict(nome='ADEPTO INCAPPUCCIATO', att=1, dif=7, fer=1, mov=4, dan=1,
         note='Palandrana grigia, maschera di cera. Combatte con falcetti da fonditore.'),
    dict(nome='CANE DEI MOLI', att=2, dif=6, fer=1, mov=6, dan=1,
         note='Bestie da guardia dei magazzini, il muso incrostato di cera nera: il culto li '
              'nutre e li accorda come strumenti. Arrivano prima del loro ringhio. Fragili, '
              'ma il colpo va messo a segno mentre saltano.'),
    dict(nome='IL FONDITORE', att=1, dif=8, fer=2, mov=2, dan=2,
         note='Gli artigiani del culto: grembiule di cuoio, mestolo colmo di cera fusa, la '
              'pazienza di chi ha versato mille candele. Non corrono mai: non ne hanno bisogno. '
              'Chi viene ferito dal Fonditore si muove di 1 casella in meno nel suo prossimo '
              'turno (la cera si addensa addosso).'),
    dict(nome='IL CUSTODE DELLA CERA', att=3, dif=9, fer=4, mov=3, dan=2,
         note='Un gigante ricoperto di cera colata, il volto un moncone liscio. Se il diapason '
              'd\u2019argento viene fatto vibrare a lui adiacente (azione): Difesa 5 per il resto '
              'della partita e salta la sua prossima attivazione.'),
]

TILES = [
    dict(id='T1', nome='BANCHINA D\u2019INGRESSO', exits={'N': 'T2'},
         testo='Acqua nera che lambisce le pietre, odore di sego. La porta sul retro ha un lucchetto '
               'a tre cifre (vedi Soluzione). Qui dovete riportare Ruggero per vincere.',
         arredi=[(0, 3, 'molo'), (3, 3, 'casse')]),
    dict(id='T2', nome='SALA DELLE CASSE', exits={'S': 'T1', 'E': 'T3', 'O': 'T4', 'N': 'T5 (grata: azione Interagire per aprirla)'},
         testo='Casse marchiate con l\u2019onda, accatastate fino al soffitto.',
         cerca='Un piede di porco: +1 alle prove per forzare e scassinare.',
         arredi=[(1, 1, 'casse'), (2, 2, 'casse')]),
    dict(id='T3', nome='CORRIDOIO DELLE CANDELE', exits={'O': 'T2'},
         testo='Migliaia di candele nere accese. Chi entra in questa tessera per la prima volta prova '
               'NERVI (Media): se fallisce, 1 danno (cera bollente).',
         cerca='Un talismano a forma d\u2019onda: chi lo porta ha +1 NERVI.',
         arredi=[(0, 0, 'candele'), (3, 0, 'candele'), (0, 3, 'candele'), (3, 3, 'candele')]),
    dict(id='T4', nome='UFFICIO DEL CUSTODE', exits={'E': 'T2'},
         testo='Una scrivania sommersa di spartiti, un pagliericcio che puzza di sego.',
         cerca='La CHIAVE DELLA CELLA e un registro: \u00abIl dormiente gradisce il canto. '
               'Manca solo la voce del bronzo.\u00bb',
         arredi=[(1, 3, 'scrivania'), (3, 0, 'branda')]),
    dict(id='T5', nome='SCALA AL PIANO INTERRATO', exits={'S': 'T2', 'N': 'T6'},
         testo='Gradini viscidi che scendono nel canto. Chi scende prova NERVI (Facile): se fallisce, '
               'ha 1 sola azione al prossimo turno.',
         arredi=[(1, 1, 'scala'), (2, 1, 'scala'), (1, 2, 'scala'), (2, 2, 'scala')]),
    dict(id='T6', nome='CRIPTA DELLA CERA', exits={'S': 'T5'},
         testo='Un altare circondato da candele nere; dietro, una cella con Ruggero. QUANDO RIVELATE '
               'QUESTA TESSERA: appare il Custode della Cera con 2 Adepti. La cella si apre con la '
               'chiave (T4) o scassinando: ACUME Difficile.',
         arredi=[(1, 2, 'altare'), (2, 2, 'altare'), (3, 3, 'CELLA')]),
]

def spedizione():
    c = canvas.Canvas('/mnt/user-data/outputs/Ombre-su-Roccamora-04-Episodio1-Spedizione.pdf', pagesize=A4)
    c.setTitle('Ombre su Roccamora - Episodio 1 - Spedizione')
    # ---- threat cards 3x3
    cw, chh = 60*mm, 84*mm
    gx, gy = (W - 3*cw) / 2.0, (H - 3*chh) / 2.0
    for i, (t, txt) in enumerate(MINACCE):
        col, row = i % 3, (i // 3) % 3
        if i > 0 and i % 9 == 0:
            c.showPage()
        x = gx + col * cw
        y = H - gy - (row + 1) * chh
        card_frame(c, x + 1*mm, y + 1*mm, cw - 2*mm, chh - 2*mm)
        c.saveState()
        c.setFillColor(TEAL)
        c.rect(x + 3.2*mm, y + chh - 14*mm, cw - 6.4*mm, 10*mm, fill=1, stroke=0)
        c.restoreState()
        frame_flow(c, x + 5*mm, y + chh - 13.4*mm, cw - 10*mm, 9*mm, [Paragraph(t, CTTL)])
        wave(c, x + cw/2 - 8*mm, y + chh - 18*mm, 16*mm, lw=1)
        frame_flow(c, x + 5*mm, y + 5*mm, cw - 10*mm, chh - 26*mm, [Paragraph(txt, CARD)])
        c.setFillColor(colors.HexColor('#999999')); c.setFont('Helvetica', 6)
        c.drawRightString(x + cw - 4*mm, y + 3*mm, 'MINACCIA')
    c.showPage()
    # ---- enemy cards (big, 2 on one page)
    for j, N in enumerate(NEMICI):
        x, y, wdt, hgt = 20*mm, H - 25*mm - (j+1)*110*mm - j*10*mm, W - 40*mm, 110*mm
        card_frame(c, x, y, wdt, hgt)
        c.saveState(); c.setFillColor(RED)
        c.rect(x + 2.2*mm, y + hgt - 14*mm, wdt - 4.4*mm, 11.8*mm, fill=1, stroke=0)
        c.setFillColor(colors.white); c.setFont('Times-Bold', 15)
        c.drawString(x + 8*mm, y + hgt - 10.5*mm, N['nome'])
        c.restoreState()
        stats = [('ATTACCO', '+%d' % N['att']), ('DIFESA', N['dif']),
                 ('FERITE', N['fer']), ('MOVIMENTO', N['mov']), ('DANNO', N['dan'])]
        bw = (wdt - 16*mm - 4*6*mm) / 5.0
        for i, (lb, v) in enumerate(stats):
            stat_box(c, x + 8*mm + i*(bw + 6*mm), y + hgt - 40*mm, bw, lb, v)
        frame_flow(c, x + 8*mm, y + 8*mm, wdt - 16*mm, hgt - 52*mm,
                   [Paragraph(N['note'], BODY),
                    Spacer(1, 5),
                    Paragraph('Attacca: 2d6 + Attacco \u2265 Difesa dell\u2019eroe \u2192 infligge il Danno. '
                              'Viene colpito se: 2d6 + VIGORE (+1 se armati) \u2265 la sua Difesa.', SUB)])
    c.showPage()
    # ---- tiles: 2 per page, 4x4 grid, 130mm square
    ts = 130*mm
    cell = ts / 4.0
    for i, T in enumerate(TILES):
        pos = i % 2
        x = (W - ts) / 2.0
        y = H - 14*mm - ts - pos * (ts + 10*mm)
        # grid
        c.saveState()
        c.setFillColor(PAPER); c.setStrokeColor(INK); c.setLineWidth(1.4)
        c.rect(x, y, ts, ts, fill=1)
        c.setLineWidth(0.5); c.setStrokeColor(colors.HexColor('#b9b0a0'))
        for k in range(1, 4):
            c.line(x + k*cell, y, x + k*cell, y + ts)
            c.line(x, y + k*cell, x + ts, y + k*cell)
        # furniture
        for (gx2, gy2, lab) in T.get('arredi', []):
            fx, fy = x + gx2*cell, y + gy2*cell
            c.setFillColor(colors.HexColor('#d8cbb2')); c.setStrokeColor(INK); c.setLineWidth(0.8)
            c.rect(fx + 2*mm, fy + 2*mm, cell - 4*mm, cell - 4*mm, fill=1)
            c.setFillColor(INK); c.setFont('Helvetica', 6.5)
            c.drawCentredString(fx + cell/2, fy + cell/2 - 1*mm, lab)
        # exits
        c.setFillColor(RED); c.setFont('Helvetica-Bold', 7.5)
        ex = T.get('exits', {})
        if 'N' in ex: c.drawCentredString(x + ts/2, y + ts + 1.5*mm, '\u25b2 verso ' + ex['N'])
        if 'S' in ex: c.drawCentredString(x + ts/2, y - 4*mm, '\u25bc verso ' + ex['S'])
        if 'E' in ex:
            c.saveState(); c.translate(x + ts + 4*mm, y + ts/2); c.rotate(-90)
            c.drawCentredString(0, 0, '\u25b6 verso ' + ex['E']); c.restoreState()
        if 'O' in ex:
            c.saveState(); c.translate(x - 2*mm, y + ts/2); c.rotate(90)
            c.drawCentredString(0, 0, '\u25c0 verso ' + ex['O']); c.restoreState()
        # title + text box inside tile (top-left overlay)
        c.setFillColor(RED); c.setFont('Times-Bold', 13)
        c.drawString(x + 3*mm, y + ts - 7*mm, '%s \u2014 %s' % (T['id'], T['nome']))
        flow = [Paragraph(T['testo'], st('tile', fontSize=8.3, leading=10, alignment=4))]
        if T.get('cerca'):
            flow.append(Spacer(1, 2))
            flow.append(Paragraph('<b>Cercare (ACUME Media):</b> ' + T['cerca'],
                                  st('tc', fontSize=8.3, leading=10, textColor=TEAL)))
        frame_flow(c, x + 3*mm, y + ts - 36*mm, ts - 6*mm, 27*mm, flow)
        c.restoreState()
        if pos == 1 or i == len(TILES) - 1:
            c.showPage()
    # ---- tokens
    c.setFillColor(RED); c.setFont('Times-Bold', 16)
    c.drawString(15*mm, H - 18*mm, 'SEGNALINI \u2014 ritagliare')
    def token_row(y, label, items, r=8*mm, fill=colors.white, tcol=INK):
        c.setFillColor(TEAL); c.setFont('Helvetica-Bold', 9)
        c.drawString(15*mm, y + 11*mm, label)
        for i, it in enumerate(items):
            cx = 22*mm + i * 20*mm
            c.setStrokeColor(INK); c.setLineWidth(1.2); c.setFillColor(fill)
            c.circle(cx, y, r, fill=1)
            c.setFillColor(tcol); c.setFont('Helvetica-Bold', 9)
            c.drawCentredString(cx, y - 1.2*mm, it)
    token_row(H - 40*mm, 'EROI', ['EL', 'AT', 'SI', 'NI', 'CA'])
    token_row(H - 70*mm, 'ADEPTI (x10)', ['A'] * 10, fill=colors.HexColor('#d9d9de'))
    token_row(H - 100*mm, 'CUSTODE / RUGGERO / CANTO (x3)',
              ['CU', 'RU', '\u266a', '\u266a', '\u266a'], fill=PAPER)
    c.setFillColor(INK); c.setFont('Times-Italic', 9)
    c.drawString(15*mm, H - 125*mm, 'Consiglio: incollate il foglio su cartoncino prima di ritagliare. '
                                    'Le ferite dei nemici si segnano con monetine o a matita.')
    c.showPage()
    c.save()

if __name__ == '__main__':
    schede()
    indagine()
    spedizione()
    print('OK cards')
