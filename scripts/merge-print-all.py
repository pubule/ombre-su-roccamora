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

PDF_DIR = ROOT  # layout per-episodio: le cartelle episodio stanno alla radice

# Un bucket = un PDF di stampa finale. `booklets` sono i fascicoli su carta
# normale A4 (gia' fronte/retro nativamente); `cards_sheet` e' il foglio
# carte+tessere su cartoncino prodotto da generate-print-sheets.js per lo
# stesso bucket (None se quel bucket non ne ha, es. episodi senza carte
# proprie - non capita oggi ma non deve rompere lo script se succede).
BUCKETS = [
    dict(
        out=os.path.join('Comune', 'Ombre-su-Roccamora-Comune-Completo.pdf'),
        booklets=[
            os.path.join('Comune', 'pdf', 'Ombre-su-Roccamora-01-Regolamento.pdf'),
            os.path.join('Comune', 'pdf', 'Ombre-su-Roccamora-02-Schede-Personaggio.pdf'),
            os.path.join('Comune', 'pdf', 'Ombre-su-Roccamora-06-Aiuto-Giocatore.pdf'),
            os.path.join('Comune', 'pdf', 'Ombre-su-Roccamora-07-Tabellone.pdf'),
        ],
        cards_sheet=os.path.join('Comune', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Preludio', 'Ombre-su-Roccamora-Preludio-Completo.pdf'),
        booklets=[
            os.path.join('Preludio', 'pdf', 'Copertina.pdf'),
            os.path.join('Preludio', 'pdf', 'Indagine.pdf'),
            os.path.join('Preludio', 'pdf', 'Mappa.pdf'),
            os.path.join('Preludio', 'pdf', 'Luoghi.pdf'),
            os.path.join('Preludio', 'pdf', 'Spedizione.pdf'),
            os.path.join('Preludio', 'pdf', 'Bestiario.pdf'),
            os.path.join('Preludio', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Preludio', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 1', 'Ombre-su-Roccamora-Episodio-1-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 1', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 1', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 1', 'pdf', 'Carte-e-Tessere.pdf'),
    ),
    # Episodio 2 «La voce del bronzo»: i fascicoli arrivano con le fasi B-3/D
    # (add() salta i mancanti con un avviso, il bucket cresce da solo).
    dict(
        out=os.path.join('Episodio 2', 'Ombre-su-Roccamora-Episodio-2-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 2', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 2', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 2', 'pdf', 'Carte.pdf'),
    ),
    # Episodio 3 «Le voci del pozzo»: stesso schema (add() salta i mancanti).
    dict(
        out=os.path.join('Episodio 3', 'Ombre-su-Roccamora-Episodio-3-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 3', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 3', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 3', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 4', 'Ombre-su-Roccamora-Episodio-4-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 4', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 4', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 4', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 5', 'Ombre-su-Roccamora-Episodio-5-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 5', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 5', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 5', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 6', 'Ombre-su-Roccamora-Episodio-6-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 6', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 6', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 6', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 7', 'Ombre-su-Roccamora-Episodio-7-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 7', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 7', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 7', 'pdf', 'Carte.pdf'),
    ),
    dict(
        out=os.path.join('Episodio 8', 'Ombre-su-Roccamora-Episodio-8-Completo.pdf'),
        booklets=[
            os.path.join('Episodio 8', 'pdf', 'Copertina.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Indagine.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Mappa.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Luoghi.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Spedizione.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Bestiario.pdf'),
            os.path.join('Episodio 8', 'pdf', 'Soluzione (non aprire).pdf'),
        ],
        cards_sheet=os.path.join('Episodio 8', 'pdf', 'Carte.pdf'),
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

    # Colophon (licenza + paternita') in coda a OGNI Completo: chi stampa
    # lo vede per forza, anche col PDF staccato dal repo.
    print('  Colophon:')
    add(writer, os.path.join('Comune', 'pdf', 'Colophon.pdf'))

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
