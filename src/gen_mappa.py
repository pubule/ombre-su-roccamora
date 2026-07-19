# -*- coding: utf-8 -*-
"""Ombre su Roccamora - Mappa di Roccamora (per episodio, incrementale).

Il componente con cui i giocatori DICHIARANO una destinazione (vedi
Regolamento, regola Bussare): una pagina di mappa illustrata della citta'
+ una pagina di legenda in stile stradario d'epoca (nome + indirizzo per
esteso, MAI righe evocative ne' numeri di carta: il ponte voce->carta
vive solo nel fascicolo Luoghi, per chi arbitra).

PER EPISODIO e INCREMENTALE: ogni episodio stampa la SUA mappa, che
contiene tutte le voci delle mappe degli episodi precedenti piu' le sue
nuove - la citta' si allarga a ogni caso. Le voci non si rinominano MAI
tra episodi (i giocatori le ritrovano); un episodio nuovo AGGIUNGE le sue
con un tag nuovo in VOCI_MAPPA e una riga in MAPPE (vedi in fondo).

Le voci fuori episodio sono piste fredde: dichiararle non costa nulla
("bussate, nessuno apre"), ma dichiarare una voce vera impegna la visita
(1 ora) - vedi PROMPT-ESPANSIONE.md, 1-sexies.
"""
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from deluxe_style import (register_fonts, parchment_art, rule_border, art, _cover_image,
                          scrim_gradient, ARTWORKS_DIR, F, INK, RED, TEAL, SEPIA)

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
register_fonts()
W, H = A4
MX = 20*mm

# Stesso font-titolo della copertina episodio (gen_cover): Beleren, il font
# dei titoli carte, con fallback IMFellSC se il vendor non c'e'.
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TITLE = F['sc']
try:
    pdfmetrics.registerFont(TTFont('Beleren', os.path.join(ROOT, 'vendor/cardconjurer/fonts/beleren-bsc.ttf')))
    TITLE = 'Beleren'
except Exception:
    pass

MAPPA_ART = 'Mappa della città di Roccamora.png'

# (nome, indirizzo, tag). Tag 'citta' = fondo comune, in ogni mappa fin dal
# Preludio (piste fredde riusabili, alcune gia' citate negli indizi: il
# Vecchio Mercato di Learco, il Vecchio Mulino del barcaiolo ubriaco).
# Ordine qui = ordine di introduzione; la legenda stampa in alfabetico.
VOCI_MAPPA = [
    # fondo comune della citta'
    ('Il Vecchio Mercato', 'piazza delle Erbe', 'citta'),
    ('Il Vecchio Mulino', 'a monte, oltre la chiusa', 'citta'),
    ('I Moli di Levante', 'riva orientale, oltre la dogana nuova', 'citta'),
    ('Le Fonderie', 'vicolo dei Fonditori, capannoni sul retro', 'citta'),
    ('Il Cimitero delle Barche', 'ansa morta del canale grande', 'citta'),
    ('L’Ospedale della Carità', 'largo San Rocco 2', 'citta'),
    ('Il Ponte delle Catene', 'tra il corso e i moli', 'citta'),
    ('La Stazione delle Carrozze', 'porta di terraferma', 'citta'),
    ('Il Teatro Comunale', 'corso della Prefettura 9', 'citta'),
    ('Il Lavatoio Grande', 'canale di mezzo', 'citta'),
    # Preludio
    ('Il Palazzo del Lume', 'riva del Ponte dei Lumi 1', 'preludio'),
    ('La Taverna della Chiatta', 'riva del Ponte dei Lumi 4, oltre il ponte', 'preludio'),
    ('Il Banco dei Pegni di Fossa', 'calle della Fossa 12', 'preludio'),
    ('La Dogana Vecchia', 'canale di ponente, molo estremo', 'preludio'),
    # Episodio 1
    ('Il Campanile di San Teodoro', 'piazza di San Teodoro', 'ep1'),
    ('Vicolo dei Fonditori', 'al civico 7, dietro le fonderie', 'ep1'),
    ('Taverna del Ponte Rotto', 'sotto il Ponte Rotto, riva dei barcaioli', 'ep1'),
    ('La Cattedrale', 'piazza della Cattedrale, sagrestia sul fianco nord', 'ep1'),
    ('Bottega del Liutaio Ferri', 'via degli Archetti 11, quartiere della Cattedrale', 'ep1'),
    ('Il Canale Basso', 'banchina di Dellacqua, moli di ponente', 'ep1'),
    ('L’Archivio Civico', 'palazzo del Comune, scalone secondo', 'ep1'),
    ('La Gendarmeria', 'corso della Prefettura 3', 'ep1'),
    # Episodio 2 — «La voce del bronzo» (vedi DESIGN-EPISODIO-2.md). Gli
    # altri 5 luoghi dell'episodio riusano voci gia' esistenti: Le Fonderie,
    # I Moli di Levante e Il Cimitero delle Barche (fondo 'citta' — le piste
    # fredde di ieri si accendono), Il Campanile di San Teodoro ('ep1'),
    # Il Banco dei Pegni di Fossa ('preludio').
    ('L’Osteria della Bilancia', 'calle della Stadera 3, al dazio', 'ep2'),
    ('Il Deposito Daziario', 'dogana di ponente, corpo dei magazzini', 'ep2'),
    ('Corte della Faenza', 'al civico 6, dietro il dazio', 'ep2'),
    ('La Camera dei Pesi e delle Misure', 'palazzo del Dazio, primo piano', 'ep2'),
    # Episodio 3 — «Le voci del pozzo» (vedi DESIGN-EPISODIO-3.md). Gli
    # altri 2 luoghi dell'episodio riusano voci gia' esistenti: Il Lavatoio
    # Grande e L'Ospedale della Carita' (fondo 'citta' — la pista fredda
    # degli episodi passati stavolta risponde).
    ('Vicolo del Sapone', 'al civico 2, Borgo delle Cisterne', 'ep3'),
    ('La Gazzetta di Roccamora', 'corso della Prefettura 14, sopra la tipografia', 'ep3'),
    ('Corte dei Pozzaioli', 'al civico 5, Borgo delle Cisterne', 'ep3'),
    ('Il Catasto delle Acque', 'palazzo del Comune, mezzanino', 'ep3'),
    ('Calle degli Stagnini', 'al civico 9, dietro il mercato coperto', 'ep3'),
    ('La Parrocchia del Borgo', 'sagrato di Santa Brigida, Borgo delle Cisterne', 'ep3'),
    ('Il Pozzo del Cieco', 'corte dei pozzi murati, Borgo delle Cisterne', 'ep3'),
    # Episodio 4 — «Il teatro dell'eco» (vedi DESIGN-EPISODIO-4.md). Riuso:
    # Il Teatro Comunale (fondo 'citta').
    ('L’Ingresso degli Artisti', 'retro del Teatro Comunale, vicolo delle Quinte', 'ep4'),
    ('La Scala del Loggione', 'fianco del Teatro Comunale, ingresso popolare', 'ep4'),
    ('Il Caffè dei Cantanti', 'corso della Prefettura 11, di fronte al Teatro', 'ep4'),
    ('La Porta di Servizio del Teatro', 'vicolo delle Quinte, al carico scene', 'ep4'),
    ('Vicolo dell’Armonia', 'al civico 3, quartiere della Cattedrale', 'ep4'),
    ('L’Archivio del Teatro', 'palazzina attigua al Comunale, primo piano', 'ep4'),
    ('Il Ridotto del Teatro', 'Teatro Comunale, ingresso di gala', 'ep4'),
    ('Il Laboratorio degli Scenografi', 'capannone dietro la Stazione delle Carrozze', 'ep4'),
    # Episodio 5 — «L'organo di ossa» (vedi DESIGN-EPISODIO-5.md). Riuso:
    # La Parrocchia del Borgo ('ep3').
    ('La Chiesa dei Battuti', 'campo dei Battuti 1, oltre il mercato coperto', 'ep5'),
    ('L’Ossario Comunale', 'cimitero vecchio, corpo di fondo', 'ep5'),
    ('Il Cimitero Nuovo', 'fuori porta di terraferma, viale dei cipressi', 'ep5'),
    ('Vicolo delle Croci', 'al civico 4, dietro il cimitero vecchio', 'ep5'),
    ('Corte del Ragioniere', 'al civico 2, quartiere del Comune', 'ep5'),
    ('La Curia', 'piazza della Cattedrale, palazzo vescovile', 'ep5'),
    ('Calle del Marmo', 'al civico 7, verso porta di terraferma', 'ep5'),
    ('Il Sagrato dei Battuti', 'campo dei Battuti, porticina sul retro', 'ep5'),
    # Episodio 6 — «Il Terzo Movimento» (vedi DESIGN-EPISODIO-6.md). Riusi:
    # La Cattedrale, Il Canale Basso, Bottega del Liutaio Ferri ('ep1'),
    # Il Catasto delle Acque ('ep3'), Il Palazzo del Lume ('preludio'),
    # Corte del Ragioniere ('ep5').
    ('La Chiusa Grande', 'a monte del canale grande, alla paratia', 'ep6'),
    ('L’Archivio Capitolare', 'chiostro della Cattedrale, torre d’angolo', 'ep6'),
    ('La Porta d’Acqua', 'fianco nord della Cattedrale, a pelo di canale', 'ep6'),
    # Episodio 7 — Sant'Orsola e il cantiere. Riusi: Le Fonderie ('citta'),
    # Il Banco dei Pegni di Fossa ('preludio').
    ('La Contrada di Sant’Orsola', 'contrada di Sant’Orsola, al pozzo', 'ep7'),
    ('Bottega dell’Accordatore', 'contrada di Sant’Orsola, al civico 11', 'ep7'),
    ('L’Ufficio Brevetti', 'palazzo del Comune, ala nuova, piano terra', 'ep7'),
    ('Il Cantiere di Sant’Orsola', 'contrada di Sant’Orsola, dietro la cinta', 'ep7'),
    ('Palazzo dell’Impresa Voltan', 'corso della Stazione, al civico 3', 'ep7'),
    ('Magazzino della Calce', 'fuori cinta, tra gli orti di Sant’Orsola', 'ep7'),
    ('Il Palazzone di Sant’Orsola', 'contrada di Sant’Orsola, il cantiere grande', 'ep7'),
    # Episodio 8 — l'oro vecchio. Riusi: Osteria della Bilancia, Il Banco
    # dei Pegni di Fossa, Taverna della Chiatta ('citta'/'preludio').
    ('Il Monte di Pietà', 'via del Monte 1, dietro il Duomo vecchio', 'ep8'),
    ('La Carbonaia del Porto', 'banchina di levante, al piazzale nero', 'ep8'),
    ('Casa dell’Esattore', 'salita dei Cappuccini, al civico 9', 'ep8'),
    ('L’Archivio Demaniale', 'palazzo delle Finanze, ala storica', 'ep8'),
    ('Villa della Vedova Bruna', 'sulla curva del fiume, oltre il ponte di ferro', 'ep8'),
    ('Il Molo in Disarmo', 'ansa morta, oltre la banchina di levante', 'ep8'),
    # Episodio 9 — il processo. Riusi: La Gazzetta di Roccamora ('ep3'),
    # La Gendarmeria ('ep1').
    ('Il Tribunale', 'piazza del Foro, palazzo di Giustizia', 'ep9'),
    ('Pensione Serena', 'vicolo del Salice 3, dietro il Foro', 'ep9'),
    ('Studio Grassi', 'corso Vittorio 11, primo piano (provvisorio)', 'ep9'),
    ('Il Tribunale, retro', 'piazza del Foro, sacrestia dell’aula', 'ep9'),
    ('Casa di Anselmo Riva', 'campo della Cattedrale 2, casa del sacrestano', 'ep9'),
    ('Locanda del Forestiero', 'riva degli Schiavoni 8, camere', 'ep9'),
    ('Il Molo del Lume', 'darsena vecchia, approdo della Società', 'ep9'),
    # Episodio 10 — la casa che ricorda. Riusi: La Corte della Faenza (ep2),
    # L'Archivio Civico ('citta'), La Gendarmeria ('citta').
    ('La Casa della Corte', 'Corte della Faenza 7, casa d’affitto ristrutturata', 'ep10'),
    ('Deposito del Muratore', 'calle dei Muri 4, deposito di Bortolo Sassi', 'ep10'),
    ('Il vano murato', 'Corte della Faenza 7, camera al primo piano', 'ep10'),
    ('Casa Malfanti', 'Corte della Faenza 11, casa del vedovo', 'ep10'),
    ('Fornitura del Borgo', 'Borgo delle Cisterne, magazzino dei materiali', 'ep10'),
    ('Bottega del Fotografo', 'contrada del Collodio 2, studio fotografico', 'ep10'),
    # Episodio 11 — il censimento delle campane. Riusi: L'Archivio Civico
    # ('ep1'), La Camera dei Pesi e delle Misure ('ep2'), Il Campanile di San
    # Teodoro ('ep1').
    ('La Torre Civica', 'piazza Maggiore, torre dell’orologio e delle campane', 'ep11'),
    ('La Pensione dei Topografi', 'calle dei Forestieri 3, alloggio della squadra', 'ep11'),
    ('Lo Studio Corrispondente', 'contrada dei Notai 9, recapito della ditta di Milano', 'ep11'),
    ('Il Sagrato della Cattedrale', 'piazza del Duomo, davanti alla navata', 'ep11'),
    ('La Bottega del Cordaio', 'riva delle Funi 5, cordaio e armatore di campane', 'ep11'),
    ('Il Ponteggio del Restauro', 'piazza Maggiore, ponteggio del fianco della Torre', 'ep11'),
    # Episodio 12 — la seconda copia. Riusi: Il Palazzo del Lume ('preludio',
    # la sede: ora luogo d'indagine), Il Banco dei Pegni di Fossa ('preludio'),
    # Il Cimitero delle Barche ('citta').
    ('La Casa dell’Archivista', 'calle degli Amanuensi 2, casa di Anselmo Godi', 'ep12'),
    ('L’Ufficio del Fermo-Posta', 'contrada delle Poste 6, sportello del fermo-posta', 'ep12'),
    ('La Loggia dei Confratelli', 'campo del Lume, loggia riservata dei soci', 'ep12'),
    ('Lo Scriptorium', 'campo del Lume, sala dei copisti', 'ep12'),
    ('Il Deposito dei Sigilli', 'campo del Lume, deposito dei punzoni', 'ep12'),
    ('Il Corpo di Guardia', 'riva dei Gendarmi 1, corpo di guardia dei canali', 'ep12'),
    # Episodio 13 — carta di pregio (apertura Atto III). Riusi: La Stazione
    # delle Carrozze ('citta'), La Dogana Vecchia ('preludio'), L'Ufficio del
    # Fermo-Posta ('ep12').
    ('Lo Studio del Notaio', 'contrada dei Notai 4, studio Rasca', 'ep13'),
    ('La Casa del Capo-Catena', 'riva dei Traghetti 9, alloggio del capo-catena', 'ep13'),
    ('La Cancelleria Vescovile', 'palazzo vescovile, cancelleria', 'ep13'),
    ('La Prefettura', 'corso della Prefettura 1, archivio dei noli', 'ep13'),
    ('Il Deposito delle Risme', 'calle della Carta 6, deposito di smistamento', 'ep13'),
    ('Il Molino delle Carte', 'fuori porta di terraferma, due ore a monte del fiume', 'ep13'),
    # Episodio 14 — il rivale (Atto III). Riusi: La Gazzetta di Roccamora
    # ('ep3'), Il Banco dei Pegni di Fossa ('preludio'), La Gendarmeria ('ep1').
    ('La Villa-Museo di Braga', 'colle di San Michele, villa del professor Braga', 'ep14'),
    ('Il Ricettatore', 'sottoportico della Pescheria 3, retrobottega', 'ep14'),
    ('Lo Studio del Perito', 'via dell’Ateneo 7, studio del perito Coda', 'ep14'),
    ('L’Archivio della Gendarmeria', 'corso della Prefettura 3, archivio dei faldoni', 'ep14'),
    ('Il Covo dei Gatti', 'tetti del Corso, sottotetto senza numero', 'ep14'),
    ('L’Attico del Corso', 'tetti del Corso, l’attico alto', 'ep14'),
    # Episodio 15 — lo smascheramento (Atto III). Riusi: La Gendarmeria ('ep1'),
    # Il Tribunale ('ep9'), La Gazzetta di Roccamora ('ep3'), Lo Studio del
    # Perito ('ep14'), La Villa-Museo di Braga ('ep14').
    ('La Stanza del Testimone', 'vicolo dei Testimoni 2, alloggio sorvegliato', 'ep15'),
    ('L’Archivio dei Manuali', 'palazzo del Lume, sala dei dodici manuali', 'ep15'),
    ('Il Deposito Reperti', 'corso della Prefettura 3, deposito della scientifica', 'ep15'),
    ('La Bottega dell’Incisore', 'calle degli Incisori 5, retrobottega', 'ep15'),
    # Episodio 16 — un caso qualunque (Atto III, respiro). Riusi: La Gazzetta di
    # Roccamora ('ep3'), La Stazione delle Carrozze ('citta').
    ('La Casa del Lampionaio', 'riva dei Lumi 4, casa del lampionaio', 'ep16'),
    ('Il Caffè degli Annunci', 'piazza del Foro 9, caffè degli annunci', 'ep16'),
    ('La Casa dell’Ex Fidanzata', 'contrada delle Vedove 2, alloggio', 'ep16'),
    ('L’Archivio delle Lettere', 'palazzo del Lume, archivio delle corrispondenze', 'ep16'),
    ('Il Fioraio', 'calle dei Fiori 7, bottega', 'ep16'),
    ('Il Registro degli Affitti', 'corso della Prefettura 12, ufficio degli affitti', 'ep16'),
    ('La Villa sul Lago', 'sponda di ponente, villa dei Càrpine, fuori porta', 'ep16'),
    # Episodio 17 — lo scisma (Atto III, il picco). Riusi: Il Palazzo del Lume
    # (preludio), Il Tribunale ('ep9'), Lo Studio del Notaio ('ep13'), La Dogana
    # Vecchia ('preludio').
    ('Lo Studio del Decano', 'palazzo del Lume, studio del decano', 'ep17'),
    ('L’Aula del Cifrario', 'via dell’Ateneo 3, aula del cifrario', 'ep17'),
    ('Il Membro Interno', 'contrada dei Confratelli 6, alloggio', 'ep17'),
    ('Il Rifugio del Notaio', 'calle dei Notai 9, rifugio riservato', 'ep17'),
    ('La Villa-Prigione', 'sponda di levante, villa di custodia, fuori porta', 'ep17'),
    # Episodio 18 — la mano sola (Atto III, la rivelazione). Riuso: Il Palazzo
    # del Lume (preludio). Tutto orbita sulla sede della Società.
    ('L’Archivio delle Penne', 'palazzo del Lume, archivio delle penne', 'ep18'),
    ('La Contabilità', 'palazzo del Lume, ufficio della contabilità', 'ep18'),
    ('Il Fascicolo di Campagna', 'palazzo del Lume, sala del fascicolo', 'ep18'),
    ('Lo Studio Privato di M.', 'palazzo del Lume, studio del presidente', 'ep18'),
    ('La Carta di Pregio', 'palazzo del Lume, archivio della carta', 'ep18'),
    ('La Matrice del Decano', 'palazzo del Lume, sala del cifrario', 'ep18'),
    ('Il Vezzo delle Firme', 'palazzo del Lume, sala del confronto', 'ep18'),
    ('Il Palazzo del Lume (la fuga)', 'palazzo del Lume, la sede che si spegne', 'ep18'),
]

# (sottocartella pdf/, sottotitolo, tag inclusi). Un episodio nuovo aggiunge
# una riga con i tag di TUTTI i precedenti + il suo.
MAPPE = [
    ('Preludio', 'preludio — la città che conoscete', ('citta', 'preludio')),
    ('Episodio 1', 'episodio 1 — la città che conoscete', ('citta', 'preludio', 'ep1')),
    ('Episodio 2', 'episodio 2 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2')),
    ('Episodio 3', 'episodio 3 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3')),
    ('Episodio 4', 'episodio 4 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4')),
    ('Episodio 5', 'episodio 5 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5')),
    ('Episodio 6', 'episodio 6 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6')),
    ('Episodio 7', 'episodio 7 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7')),
    ('Episodio 8', 'episodio 8 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8')),
    ('Episodio 9', 'episodio 9 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9')),
    ('Episodio 10', 'episodio 10 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10')),
    ('Episodio 11', 'episodio 11 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11')),
    ('Episodio 12', 'episodio 12 — la città che conoscete', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12')),
    ('Episodio 13', 'episodio 13 — la città e la strada fuori porta', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13')),
    ('Episodio 14', 'episodio 14 — la città e i tetti del Corso', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14')),
    ('Episodio 15', 'episodio 15 — la città e la villa di Braga', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15')),
    ('Episodio 16', 'episodio 16 — la città e la villa sul lago', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16')),
    ('Episodio 17', 'episodio 17 — la città spaccata e la villa-prigione', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17')),
    ('Episodio 18', 'episodio 18 — il Palazzo del Lume che si spegne', ('citta', 'preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17', 'ep18')),
]

# Tipografico (provata la grafia manoscritta La Belle Aurore su tutta la
# riga: resa uniforme, poco leggibile come elenco - scelta finale: nome in
# grassetto, indirizzo in corsivo NON grassetto).
VOCE_ST = ParagraphStyle('voce', fontName=F['r'], fontSize=10.5, leading=15, textColor=INK)


def pagina_mappa(c, sottotitolo):
    art_path = os.path.join(ARTWORKS_DIR, MAPPA_ART)
    if os.path.exists(art_path):
        _cover_image(c, art(MAPPA_ART), 0, 0, W, H)
        # L'arte e' notturna e scura: velo sfumato dal bordo alto (gradiente
        # immagine vero, vedi scrim_gradient - le fasce con setFillAlpha
        # lasciavano righe orizzontali) e titolo bianco/oro, o non si legge.
        scrim_gradient(c, 0, H - 42*mm, W, 42*mm, 0.6, knee=1.6, opaque_top=True)
        # Sottotitolo: stesso colore del titolo e in grassetto (richiesta esplicita).
        titolo_col, sotto_col = colors.HexColor('#f2e9d8'), colors.HexColor('#f2e9d8')
    else:
        parchment_art(c, W, H)
        c.setFillColor(SEPIA); c.setFont(F['i'], 10)
        c.drawCentredString(W/2, H/2, '(arte della mappa non ancora generata: vedi PROMPT-MIDJOURNEY.md)')
        titolo_col, sotto_col = RED, TEAL
    rule_border(c, W, H)
    titolo = 'Mappa di Roccamora' if TITLE == 'Beleren' else 'mappa di roccamora'
    c.setFillColor(titolo_col); c.setFont(TITLE, 24)
    c.drawString(MX, H - 24*mm, titolo)
    c.setFillColor(sotto_col); c.setFont(F['b'], 12)
    c.drawString(MX, H - 31*mm, sottotitolo)
    c.showPage()


def pagina_stradario(c, voci):
    parchment_art(c, W, H)
    rule_border(c, W, H)
    c.setFillColor(RED); c.setFont(F['sc'], 17)
    c.drawString(MX, H - 22*mm, 'stradario — dove chiedere in città')
    c.setFillColor(INK); c.setFont(F['i'], 9.5)
    c.drawString(MX, H - 29*mm, 'Dichiarate una destinazione: se la serata non ha nulla per voi lì, lo saprete')
    c.drawString(MX, H - 34*mm, 'senza spendere l’ora. Se invece qualcosa c’è, la visita parte — e l’ora si spende.')
    c.setStrokeColor(SEPIA); c.setLineWidth(0.5)
    c.line(MX, H - 38*mm, W - MX, H - 38*mm)
    y = H - 48*mm
    # Alfabetico ignorando l'articolo iniziale (come uno stradario vero:
    # "Il Lavatoio" sta sotto la L, non sotto la I).
    def chiave(v):
        return re.sub(r"^(il|lo|la|i|gli|le|l’|l')\s*", '', v[0], flags=re.IGNORECASE).lower()
    for nome, indirizzo in sorted(voci, key=chiave):
        p = Paragraph(f'<b>{nome}</b> — <i>{indirizzo}</i>', VOCE_ST)
        pw, ph = p.wrapOn(c, W - 2*MX, 20*mm)
        p.drawOn(c, MX, y - ph)
        y -= ph + 3.2*mm
    import gen_narrator as N
    N.chiusa_pagina(c)
    c.showPage()


def mappe():
    for sottocartella, sottotitolo, tags in MAPPE:
        out_dir = os.path.join(OUT_DIR, sottocartella, 'pdf')
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, 'Mappa.pdf')
        c = canvas.Canvas(out_path, pagesize=A4)
        c.setTitle(f'Ombre su Roccamora - Mappa di Roccamora ({sottocartella})')
        pagina_mappa(c, sottotitolo)
        voci = [(n, i) for n, i, t in VOCI_MAPPA if t in tags]
        pagina_stradario(c, voci)
        c.save()
        print(f'ok -> {out_path} ({len(voci)} voci)')


if __name__ == '__main__':
    mappe()
    print('OK mappa')
