# -*- coding: utf-8 -*-
"""Unisce i PDF gia' generati (fascicoli + carte/tessere) in TRE PDF di
stampa, non uno solo: Comune (Regolamento, Schede Personaggio, Aiuto-
Giocatore, Tabellone, + le carte/tessere riusabili in ogni episodio),
Preludio completo, Episodio 1 completo. Chi ha gia' stampato il Comune non
lo ristampa per ogni nuovo episodio - vedi PROMPT-ESPANSIONE.md.

Non genera nulla da zero: si appoggia ai PDF gia' pronti in pdf/ (ognuno
gia' a pagine pari grazie a pad_to_even_pages in deluxe_style.py) e ai
fogli carte+tessere gia' prodotti da generate-print-sheets.js (che ora
produce a sua volta 3 file, uno per bucket, stesso criterio). Concatenare
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

# Un bucket = un PDF di stampa finale. `booklets` sono i fascicoli su carta
# normale A4 (gia' fronte/retro nativamente); `cards_sheet` e' il foglio
# carte+tessere su cartoncino prodotto da generate-print-sheets.js per lo
# stesso bucket (None se quel bucket non ne ha, es. episodi senza carte
# proprie - non capita oggi ma non deve rompere lo script se succede).
BUCKETS = [
    dict(
        out='Ombre-su-Roccamora-Comune-Completo.pdf',
        booklets=[
            'Ombre-su-Roccamora-01-Regolamento.pdf',
            'Ombre-su-Roccamora-02-Schede-Personaggio.pdf',
            'Ombre-su-Roccamora-06-Aiuto-Giocatore.pdf',
            'Ombre-su-Roccamora-07-Tabellone.pdf',
        ],
        cards_sheet=os.path.join('Comune', 'Carte.pdf'),
    ),
    dict(
        out='Ombre-su-Roccamora-Preludio-Completo.pdf',
        booklets=[
            os.path.join('Preludio', 'Copertina.pdf'),
            os.path.join('Preludio', 'Indagine.pdf'),
            os.path.join('Preludio', 'Luoghi.pdf'),
            os.path.join('Preludio', 'Spedizione.pdf'),
            os.path.join('Preludio', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Preludio', 'Carte.pdf'),
    ),
    dict(
        out='Ombre-su-Roccamora-Episodio-1-Completo.pdf',
        booklets=[
            os.path.join('Episodio 1', 'Copertina.pdf'),
            os.path.join('Episodio 1', 'Indagine.pdf'),
            os.path.join('Episodio 1', 'Luoghi.pdf'),
            os.path.join('Episodio 1', 'Spedizione.pdf'),
            os.path.join('Episodio 1', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 1', 'Carte-e-Tessere.pdf'),
    ),
]


def add(writer, rel_path):
    path = os.path.join(PDF_DIR, rel_path)
    if not os.path.exists(path):
        print(f'    salto (manca): {rel_path}')
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
    print(f'    + {rel_path} ({n} pagine)')


def build(bucket):
    print(f'{bucket["out"]}:')
    writer = PdfWriter()
    print('  Fascicoli:')
    for rel in bucket['booklets']:
        add(writer, rel)

    print('  Carte + tessere:')
    if bucket['cards_sheet']:
        add(writer, bucket['cards_sheet'])
    else:
        print('    (nessuna per questo bucket)')

    if not len(writer.pages):
        print('  (vuoto, nessun file scritto)')
        return

    out_path = os.path.join(PDF_DIR, bucket['out'])
    with open(out_path, 'wb') as f:
        writer.write(f)
    print(f'  Totale: {len(writer.pages)} pagine -> {out_path}\n')


def main():
    for bucket in BUCKETS:
        build(bucket)


if __name__ == '__main__':
    main()
