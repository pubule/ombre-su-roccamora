# -*- coding: utf-8 -*-
"""Porta dentro gli arredi e i pavimenti DIPINTI dei pacchetti 2-Minute Tabletop.

I pacchetti li scarica una persona (il sito li dà dal carrello, prezzo libero) e
li lascia scompattati in `risorse-vtt/2M/`; questo script sceglie i pezzi che
servono ai quattordici arredi e ai dieci ambienti del gioco, li normalizza e li
mette in `webapp/vtt-2m/`, dove il generatore delle tessere li trova.

PERCHE' UNA CARTELLA A PARTE. `webapp/vtt/` tiene la libreria Forgotten
Adventures, che è CC BY-NC-**SA**: il ShareAlike si attacca alle tessere che ne
derivano. Le due librerie devono stare in piedi insieme per poterle confrontare
tessera per tessera, e la scelta si prende guardando. `pittura-vtt.js` legge la
cartella da `OSR_VTT`.

COME SCEGLIE. Non per nome esatto — i pacchetti cambiano i nomi a ogni
revisione — ma per PAROLE nel percorso, in ordine di preferenza: la prima
ricetta che risponde vince. Quel che non trova lo dice, e per quell'arredo il
generatore continua a disegnare la sagoma che ha (`pittura-vtt.js`): meglio una
sagoma che una casella vuota, che è l'inganno del Preludio.

TRE VARIANTI PER CHIAVE. Le casse compaiono in 104 tessere su 127: con un
disegno solo si ripetono come carta da parati. Il generatore ne sceglie una in
modo stabile dalla posizione della casella.

QUEL CHE 2MT NON HA. Cinque arredi (altare, cella, crogiolo, stufa, toeletta) e
cinque pavimenti (mattonelle, mattoni, terra, navata, roccia) non stanno in
questi sei pacchetti. Non è un guasto: i pavimenti ricadono sulle texture Poly
Haven CC0 di `webapp/texture/`, gli arredi sulle sagome CSS. Tre pacchetti 2MT
ancora da scaricare coprirebbero gli arredi — vedi il LEGGIMI.

LA LICENZA VIAGGIA COI FILE. Gli asset gratuiti di 2-Minute Tabletop sono
CC BY-NC 4.0: attribuzione obbligatoria, nessun uso commerciale, e vale anche
per le tessere che ne derivano. Lo scrive `webapp/vtt-2m/LICENZE.txt`, e sta in
NOTICE.md. I pacchetti non entrano in git: ridistribuirli non è permesso.

Uso:  python scripts/importa-vtt.py [--elenca CHIAVE] [--contatti]
      --elenca:   non importa, stampa i primi 20 candidati per quella chiave
      --contatti: monta i pezzi importati in un unico PNG da GUARDARE
                  (`scatti/contatti-2m.png`) — i nomi mentono, i pixel no
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DENTRO = os.path.join(ROOT, 'risorse-vtt', '2M')
FUORI = os.path.join(ROOT, 'webapp', 'vtt-2m')
VARIANTI = 3
LATO = 1024          # un arredo puo' occupare piu' caselle: 1024 basta a 616px

# LE COPIE A BASSA RISOLUZIONE NON SERVONO. Ogni pacchetto porta lo stesso
# oggetto piu' volte — 300 DPI per la stampa, 70/72 per Roll20, 60 per Fantasy
# Grounds — e indicizzandole tutte la ricetta pesca a caso fra le copie.
# (Mercantile fa eccezione: ha SOLO la cartella Roll20, ed e' quella.)
SCARTA = ['70 dpi', 'roll20 (72', 'fantasy grounds', '(60 dpi', '_example', 'demo']

IMMAGINI = ('.png', '.jpg', '.jpeg', '.webp')

# ---------------------------------------------------------------- che cercare
#
# Ogni voce: chiave del gioco -> liste di parole. Un file vale se il suo
# percorso contiene TUTTE le parole di una lista; le liste si provano in ordine,
# e la prima che risponde vince. Le parole sono in inglese perche' i pacchetti
# lo sono, e minuscole perche' il confronto e' fatto in minuscolo.
ARREDI = {
    'casse':     [['mercantile', 'crate,'], ['mercantile', 'box'], ['mercantile', 'barrel,'],
                  ['cargo, crate']],
    'scorie':    [['rubble - stone pile'], ['rubble - mixed'], ['rubble - wood'], ['rubble']],
    'scala':     [['stairs - stone - down'], ['stairs - stone'], ['dungeonroombuilder', 'stairs'],
                  ['interior stairs']],
    'scrivania': [['mercantile', 'table, square'], ['mercantile', 'table, rickety'],
                  ['mercantile', 'table.'], ['mercantile', 'table,']],
    # -- CANDELE: 2MT ce le ha (`Candle, 1`) e restano fuori apposta. Viste
    # dall'alto sono un puntino di 40px che nella casella da 616px diventa una
    # macchia; la sagoma CSS e' piu' leggibile, e per giunta accende la pozza di
    # luce (FUOCHI in pittura-vtt.js). Visto sul montaggio, non sul nome.
    # il molo sono le BITTE: i pali del fiume fanno lo stesso mestiere
    'molo':      [['river', 'wooden pillar'], ['river', 'stone pillar'], ['mast (']],
    # la forma da cera: un bacile. I paioli aperti di Mercantile sono la cosa
    # piu' vicina che questi sei pacchetti abbiano.
    'forma':     [['mercantile', 'pot, open'], ['mercantile', 'produce trough'],
                  ['mercantile', 'pot,']],
    # la branda: qui e' una stuoia arrotolata, non un letto. Zoppa, e va detto.
    'branda':    [['mercantile', 'mat, long'], ['mercantile', 'mat, large'], ['mercantile', 'mat.']],  # noqa: E501
    # l'armadio: c'e' solo la cassapanca. Zoppa anche questa.
    'armadio':   [['mercantile', 'chest'], ['mercantile', 'box, large'], ['mercantile', 'stand,']],
    # -- senza risposta nei sei pacchetti: altare, cella, crogiolo, stufa, toeletta
}

# I PAVIMENTI SONO TEXTURE PIASTRELLABILI, e qui la parola «Tiling» nel nome e'
# l'unica garanzia: `Tile - 1 (3x3)` del DungeonRoomBuilder sembra un pavimento
# ma e' un QUADRATO di pietra con le fughe disegnate a mano ai bordi — ripetuto
# mostra la griglia. Visto guardandolo, non leggendolo. Per `mattonelle` resta
# quindi la texture Poly Haven CC0, che almeno e' senza cucitura.
PAVIMENTI = {
    'assi':       [['floor - floorboards - tiling']],
    'lastricato': [['floor - flagstone - tiling']],
    'pietra':     [['texture - classic stone floor']],
    'acqua':      [['water tile 1'], ['water tile']],
    # il tetto 2MT NON e' una texture piastrellabile: e' un pezzo di tetto con i
    # bordi disegnati a mano. Si tiene solo il CUORE (vedi RITAGLIA_CENTRO), che
    # e' ardesia regolare e si ripete senza mostrare la cucitura.
    'tetti':      [['roof - tiled - 6x4.png'], ['roof - tiled']],
    # -- senza risposta: mattonelle, mattoni, terra, navata, roccia
}

# I MURI. Il DungeonRoomBuilder li disegna come strisce: corso scuro in cima (la
# cima del muro), due corsi chiari sotto (la faccia e il gradino), e l'ombra che
# cade DENTRO la stanza. La striscia da cinque caselle e' l'unica che arriva
# fino ai bordi della sua tela — le altre lasciano mezza casella vuota agli
# estremi, e accostandole si vedeva il taglio.
#
# IL RITAGLIO VA MISURATO SULL'ALFA, e con una soglia: sotto la pietra c'e'
# un'ombra sfumata che arriva fino al bordo della tela, e `getbbox()` (alfa > 0)
# non taglia niente. Con la soglia a 96 restano i 1207x324 della pietra vera.
MURI = {
    'dritto': [['dungeonroombuilder', 'wall - straight (5x2)'],
               ['dungeonroombuilder', 'wall - straight']],
}
SOGLIA_MURO = 96

# i pavimenti che vanno tagliati al cuore perche' hanno un bordo disegnato
RITAGLIA_CENTRO = {'tetti': 0.62}

# I COLORI SQUILLANTI RESTANO FUORI. Mercantile vende lo stesso oggetto in
# quattro tinte (`Mat, long, blue`), e ordinati alfabeticamente vince il blu:
# in una cripta notturna una stuoia azzurra e' una macchia al neon.
VIETATE = [', blue', ', green', ', red', ', orange', ', cabbages']

SCOPERTI_ARREDI = ['altare', 'candele', 'cella', 'crogiolo', 'stufa', 'toeletta']
SCOPERTI_PAVIMENTI = ['mattonelle', 'mattoni', 'terra', 'navata', 'roccia']


def indice():
    """Tutte le immagini dei pacchetti, a piena risoluzione."""
    if not os.path.isdir(DENTRO):
        sys.exit('manca ' + os.path.relpath(DENTRO, ROOT) + ' — vedi risorse-vtt/LEGGIMI.md')
    fuori = []
    for radice, _, file in os.walk(DENTRO):
        for f in file:
            p = os.path.join(radice, f).replace(chr(92), '/')
            if not p.lower().endswith(IMMAGINI):
                continue
            if any(s in p.lower() for s in SCARTA):
                continue
            fuori.append(p)
    return sorted(fuori)


def scegli(tutti, ricette, quante=VARIANTI):
    """I primi `quante` file della prima ricetta che risponde."""
    for parole in ricette:
        trovati = [p for p in tutti if all(w in p.lower() for w in parole)
                   and not any(v in os.path.basename(p).lower() for v in VIETATE)]
        if trovati:
            return parole, trovati[:quante]
    return None, []


def porta(p, dove, ritaglia=True, cuore=None, soglia=None):
    """Ritaglia il trasparente attorno, normalizza, salva PNG con alpha.

    IL RITAGLIO E' LA META' DEL LAVORO: questi asset arrivano centrati in una
    tela grande (un muro largo 755px dentro un riquadro di 1200), e senza
    togliere il vuoto attorno un oggetto si ritrova grande la meta' della
    casella che dovrebbe riempire.

    Un PAVIMENTO invece non si ritaglia: e' una piastrella intera, e il ritaglio
    la sposterebbe di qualche pixel rompendo la ripetizione.
    """
    img = Image.open(p).convert('RGBA')
    if ritaglia:
        alfa = img.getchannel('A')
        scatola = (alfa.point(lambda v: 255 if v > soglia else 0).getbbox() if soglia
                   else img.getbbox())
        if scatola:
            img = img.crop(scatola)
    if cuore:
        w, h = img.size
        lato = int(min(w, h) * cuore)
        img = img.crop(((w - lato) // 2, (h - lato) // 2,
                        (w + lato) // 2, (h + lato) // 2))
    img.thumbnail((LATO, LATO), Image.LANCZOS)
    img.save(dove, optimize=True)
    return img.size


def contatti():
    """I pezzi importati, montati in un PNG su fondo magenta — il trasparente si
    vede subito. Da GUARDARE prima di generare una sola tessera: i nomi dei
    pacchetti mentono (un «Table» puo' essere un tavolo da osteria)."""
    from PIL import ImageDraw
    pezzi = []
    for tipo in ('arredi', 'pavimenti', 'muri'):
        d = os.path.join(FUORI, tipo)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            im = Image.open(os.path.join(d, f)).convert('RGBA')
            im.thumbnail((190, 190), Image.LANCZOS)
            pezzi.append((tipo[:3] + '/' + f[:-4], im))
    if not pezzi:
        sys.exit('niente da montare: lancia prima l' + chr(39) + 'importazione')
    col, cel = 6, 210
    righe = (len(pezzi) + col - 1) // col
    tela = Image.new('RGB', (col * cel, righe * (cel + 16)), (190, 40, 150))
    dis = ImageDraw.Draw(tela)
    for i, (nome, im) in enumerate(pezzi):
        x, y = (i % col) * cel, (i // col) * (cel + 16)
        dis.text((x + 4, y + 2), nome, fill=(255, 255, 255))
        tela.paste(im, (x + (cel - im.width) // 2, y + 16), im)
    os.makedirs(os.path.join(ROOT, 'scatti'), exist_ok=True)
    dove = os.path.join(ROOT, 'scatti', 'contatti-2m.png')
    tela.save(dove)
    print(str(len(pezzi)) + ' pezzi -> ' + os.path.relpath(dove, ROOT) + ' — GUARDALO')


def main():
    if '--contatti' in sys.argv:
        return contatti()

    tutti = indice()
    print(str(len(tutti)) + ' immagini nei pacchetti 2M\n')

    if '--elenca' in sys.argv:
        chiave = sys.argv[sys.argv.index('--elenca') + 1]
        ricette = ARREDI.get(chiave) or PAVIMENTI.get(chiave)
        if not ricette:
            sys.exit('chiave sconosciuta: ' + chiave)
        parole, scelti = scegli(tutti, ricette, 20)
        print(chiave + ': ricetta ' + str(parole))
        for p in scelti:
            print('   ', os.path.relpath(p, ROOT).replace(chr(92), '/'))
        return

    os.makedirs(os.path.join(FUORI, 'arredi'), exist_ok=True)
    os.makedirs(os.path.join(FUORI, 'pavimenti'), exist_ok=True)
    os.makedirs(os.path.join(FUORI, 'muri'), exist_ok=True)
    righe, mancanti = [], []

    for chiave, ricette in ARREDI.items():
        _, scelti = scegli(tutti, ricette)
        if not scelti:
            mancanti.append(chiave)
            print('  ' + chiave.ljust(11) + ' NIENTE')
            continue
        for i, p in enumerate(scelti):
            nome = chiave if i == 0 else chiave + '-' + str(i + 1)
            porta(p, os.path.join(FUORI, 'arredi', nome + '.png'))
            righe.append('arredi/' + nome + '.png  <-  '
                         + os.path.relpath(p, ROOT).replace(chr(92), '/'))
        print('  ' + chiave.ljust(11) + ' ' + str(len(scelti)) + ' varianti · '
              + os.path.basename(scelti[0]))

    for chiave, ricette in PAVIMENTI.items():
        _, scelti = scegli(tutti, ricette, 1)
        if not scelti:
            mancanti.append('pavimento ' + chiave)
            continue
        p = scelti[0]
        w, h = porta(p, os.path.join(FUORI, 'pavimenti', chiave + '.png'),
                     ritaglia=False, cuore=RITAGLIA_CENTRO.get(chiave))
        righe.append('pavimenti/' + chiave + '.png  <-  '
                     + os.path.relpath(p, ROOT).replace(chr(92), '/'))
        print('  pavimento ' + chiave.ljust(11) + ' ' + str(w) + 'x' + str(h) + ' · '
              + os.path.basename(p))

    for chiave, ricette in MURI.items():
        _, scelti = scegli(tutti, ricette, 1)
        if not scelti:
            mancanti.append('muro ' + chiave)
            continue
        p = scelti[0]
        w, h = porta(p, os.path.join(FUORI, 'muri', chiave + '.png'), soglia=SOGLIA_MURO)
        righe.append('muri/' + chiave + '.png  <-  '
                     + os.path.relpath(p, ROOT).replace(chr(92), '/'))
        print('  muro ' + chiave.ljust(16) + str(w) + 'x' + str(h) + ' · '
              + os.path.basename(p))

    with open(os.path.join(FUORI, 'LICENZE.txt'), 'w', encoding='utf-8') as f:
        f.write('Arredi e pavimenti delle tessere di Spedizione.\n')
        f.write('Fonte: 2-Minute Tabletop — https://2minutetabletop.com\n')
        f.write('Licenza: CC BY-NC 4.0 — attribuzione obbligatoria, NESSUN uso commerciale.\n')
        f.write('Il vincolo vale anche per le tessere che ne derivano.\n')
        f.write('Credito da mostrare: «Mappe realizzate con asset di 2-Minute Tabletop».\n\n')
        f.write('\n'.join(righe) + '\n')

    print('\nOK ' + str(len(righe)) + ' pezzi in ' + os.path.relpath(FUORI, ROOT))
    scoperti = sorted(set(SCOPERTI_ARREDI + [k for k in ARREDI if k in mancanti]))
    print('arredi senza arte 2MT (restano le sagome CSS): ' + ', '.join(scoperti))
    print('pavimenti senza texture 2MT (restano Poly Haven CC0): '
          + ', '.join(SCOPERTI_PAVIMENTI))
    print('lancia ora:  python scripts/importa-vtt.py --contatti   e GUARDA il montaggio')


if __name__ == '__main__':
    main()
