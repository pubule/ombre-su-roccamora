# -*- coding: utf-8 -*-
"""Unisce TUTTI i PDF gia' generati (fascicoli + carte/tessere) in un unico
Ombre-su-Roccamora-09-Stampa-Completa.pdf, pronto per una stampa fronte/retro
sola dall'inizio alla fine.

Non genera nulla da zero: si appoggia ai PDF gia' pronti in pdf/ (ognuno gia'
a pagine pari grazie a pad_to_even_pages in deluxe_style.py) e al foglio
carte+tessere gia' prodotto da generate-print-sheets.js. Concatenare
documenti che hanno GIA' un numero pari di pagine ciascuno preserva
l'accoppiamento fronte/retro di ognuno anche dentro il file unito: ogni
fascicolo comincia sempre su una posizione dispari nella sequenza finale,
quindi i suoi fogli fisici restano allineati come nel PDF originale.

Uso: python scripts/merge-print-all.py
Va lanciato DOPO aver generato tutto il resto (build-all.sh lo fa gia' per
te, come ultimo passo).
"""
import os
import sys
from pypdf import PdfReader, PdfWriter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
from deluxe_style import pad_to_even_pages  # noqa: E402

PDF_DIR = os.path.join(ROOT, 'pdf')
OUT_PATH = os.path.join(PDF_DIR, 'Ombre-su-Roccamora-09-Stampa-Completa.pdf')

# Ordine di lettura/stampa: prima i fascicoli (carta normale), poi le carte
# e le tessere (cartoncino, taglia fissa) - due tipi di carta diversi, ma un
# solo file cosi' non manca nulla e resta tutto fronte/retro corretto.
BOOKLETS = [
    'Ombre-su-Roccamora-01-Regolamento.pdf',
    'Ombre-su-Roccamora-02-Schede-Personaggio.pdf',
    'Ombre-su-Roccamora-06-Aiuto-Giocatore.pdf',
    'Ombre-su-Roccamora-07-Tabellone.pdf',
    os.path.join('Preludio', 'Copertina.pdf'),
    os.path.join('Preludio', 'Indagine.pdf'),
    os.path.join('Preludio', 'Luoghi.pdf'),
    os.path.join('Preludio', 'Spedizione.pdf'),
    os.path.join('Preludio', 'Soluzione (non aprire).pdf'),
    os.path.join('Episodio 1', 'Copertina.pdf'),
    os.path.join('Episodio 1', 'Indagine.pdf'),
    os.path.join('Episodio 1', 'Luoghi.pdf'),
    os.path.join('Episodio 1', 'Spedizione.pdf'),
    os.path.join('Episodio 1', 'Soluzione (non aprire).pdf'),
]
# Il foglio carte+tessere lo produce generate-print-sheets.js: se non esiste
# ancora (mai generato) il merge procede lo stesso solo con i fascicoli. Nome
# distinto dall'output di QUESTO script apposta - vedi commento in
# generate-print-sheets.js sul perche' non possono coincidere.
CARDS_SHEET = 'Ombre-su-Roccamora-08-Carte-e-Tessere.pdf'


def add(writer, rel_path):
    path = os.path.join(PDF_DIR, rel_path)
    if not os.path.exists(path):
        print(f'  salto (manca): {rel_path}')
        return
    # Rete di sicurezza, non il meccanismo primario: ogni generatore (
    # gen_docs.py, gen_cover.py, gen_board.py...) ormai chiama gia'
    # pad_to_even_pages() da solo, quindi qui di norma e' un no-op (idempotente:
    # se il file e' gia' pari non tocca nulla). Resta comunque, cosi' un
    # fascicolo dispari - per errore o un generatore nuovo non ancora
    # aggiornato - non sfasa il fronte/retro di tutto quello che segue.
    pad_to_even_pages(path)
    reader = PdfReader(path)
    n = len(reader.pages)
    for page in reader.pages:
        writer.add_page(page)
    print(f'  + {rel_path} ({n} pagine)')


def main():
    # Il foglio carte+tessere e' gia' su disco col nome file finale: lo
    # leggiamo per primo (prima di sovrascriverlo) e lo accodiamo per
    # ultimo nell'unione.
    cards_path = os.path.join(PDF_DIR, CARDS_SHEET)
    cards_reader = PdfReader(cards_path) if os.path.exists(cards_path) else None

    writer = PdfWriter()
    print('Fascicoli:')
    for rel in BOOKLETS:
        add(writer, rel)

    print('Carte + tessere:')
    if cards_reader:
        for page in cards_reader.pages:
            writer.add_page(page)
        print(f'  + {CARDS_SHEET} ({len(cards_reader.pages)} pagine)')
    else:
        print(f'  salto (manca): {CARDS_SHEET} (genera prima con generate-print-sheets.js)')

    with open(OUT_PATH, 'wb') as f:
        writer.write(f)
    print(f'\nTotale: {len(writer.pages)} pagine -> {OUT_PATH}')


if __name__ == '__main__':
    main()
