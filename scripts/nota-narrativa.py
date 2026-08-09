# -*- coding: utf-8 -*-
"""Aggiunge una voce ad AUDIT-NARRATIVA-APERTA.md, senza duplicarla.

Lo usa il loop di revisione: ogni volta che una lettura (umana o di un agente)
trova un'anomalia che nessun controllo automatico puo' decidere, la deposita
qui invece di provare a correggerla. Il loop continua; la voce resta.

    python scripts/nota-narrativa.py \
        --titolo "Il Frammento 7 promette un'acustica che nessun episodio usa" \
        --rif "gen_ep7.py:645" \
        --testo "Il Frammento dice che le scorie bevono il suono, ma nessuna
                 meccanica successiva ne tiene conto: o si aggancia, o si
                 riscrive come colore." \
        [--stato aperta|decisa]

Assegna da solo il prossimo id libero (N-nn). Se esiste gia' una voce con un
titolo molto simile, non scrive e lo dice: il registro si sporca in fretta se
ogni giro riscrive le stesse cose con parole diverse.

# ponytail: dedup per similarita' di titolo con difflib, niente indice a parte.
# Il file markdown E' il database: si legge a occhio, si edita a mano, e non
# c'e' un secondo stato che puo' divergere.
"""
import argparse
import difflib
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(ROOT, 'AUDIT-NARRATIVA-APERTA.md')
ANCORA = '\n---\n\n## Chiuse in questa tornata'


def voci(testo):
    """[(id, titolo)] delle voci gia' presenti."""
    return re.findall(r'^### (N-\d+) · (.+)$', testo, re.M)


def prossimo_id(testo):
    """Il prossimo id libero, contando TUTTO il file: le voci aperte hanno un
    titolo `### N-nn`, ma quelle chiuse vivono in una riga di tabella. Cercare
    solo i titoli faceva riassegnare gli id gia' chiusi - e un id non si riusa."""
    nums = [int(n) for n in re.findall(r'\bN-(\d+)\b', testo)]
    return 'N-%02d' % (max(nums) + 1 if nums else 1)


# 0.72 lasciava passare doppioni formulati con parole diverse (due voci
# sullo stesso difetto di Riva sono entrate entrambe): meglio qualche falso
# allarme in piu', che si supera con --forza, di un registro che si sdoppia.
def simile(titolo, esistenti, soglia=0.60):
    for i, t in esistenti:
        if difflib.SequenceMatcher(None, titolo.lower(), t.lower()).ratio() >= soglia:
            return i, t
    return None


def blocchi_da_file(path):
    """Legge i file d'appoggio degli sweep paralleli.

    Gli sweep girano in parallelo e non possono scrivere tutti sul registro
    (tre read-modify-write sullo stesso markdown si perdono voci a vicenda):
    ciascuno deposita un file con blocchi TITOLO/STATO/RIF/TESTO separati da
    una riga `---`, e questi si ingeriscono dopo, in fila.
    """
    fuori = []
    for grezzo in re.split(r'^\s*---\s*$', io.open(path, encoding='utf-8').read(), flags=re.M):
        if not grezzo.strip():
            continue
        campi = {}
        for chiave in ('TITOLO', 'STATO', 'RIF', 'TESTO'):
            m = re.search(r'^%s:\s*(.+?)(?=^\s*(?:TITOLO|STATO|RIF|TESTO):|\Z)'
                          % chiave, grezzo, re.M | re.S)
            if m:
                campi[chiave] = ' '.join(m.group(1).split())
        if campi.get('TITOLO') and campi.get('TESTO'):
            fuori.append(campi)
    return fuori


def aggiungi(testo, titolo, corpo, rif, stato):
    nid = prossimo_id(testo)
    blocco = ('\n### %s · %s\n**stato: %s**%s\n\n%s\n'
              % (nid, titolo.strip(), stato,
                 (' · riferimenti: %s' % rif) if rif else '', ' '.join(corpo.split())))
    if ANCORA in testo:
        testo = testo.replace(ANCORA, blocco + ANCORA, 1)
    else:                                   # registro senza sezione «Chiuse»
        testo = testo.rstrip() + '\n' + blocco
    return testo, nid


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--titolo')
    ap.add_argument('--testo')
    ap.add_argument('--rif', default='')
    ap.add_argument('--stato', default='aperta', choices=['aperta', 'decisa'])
    ap.add_argument('--da-file', dest='da_file',
                    help='ingerisce un file d\'appoggio di uno sweep (blocchi separati da ---)')
    ap.add_argument('--forza', action='store_true', help='scrivi anche se somiglia a una voce esistente')
    a = ap.parse_args()

    if not os.path.exists(LEDGER):
        print('manca %s' % LEDGER)
        return 2
    if not a.da_file and not (a.titolo and a.testo):
        ap.error('servono --titolo e --testo, oppure --da-file')

    testo = io.open(LEDGER, encoding='utf-8').read()
    da_scrivere = ([{'TITOLO': a.titolo, 'TESTO': a.testo, 'RIF': a.rif, 'STATO': a.stato}]
                   if not a.da_file else blocchi_da_file(a.da_file))

    scritte, saltate = [], []
    for v in da_scrivere:
        titolo = v['TITOLO']
        doppia = simile(titolo, voci(testo))
        if doppia and not a.forza:
            saltate.append((titolo, doppia))
            continue
        stato = (v.get('STATO') or 'aperta').split()[0].strip('.,')
        if stato not in ('aperta', 'decisa'):
            stato = 'aperta'
        testo, nid = aggiungi(testo, titolo, v['TESTO'], v.get('RIF', ''), stato)
        scritte.append((nid, titolo))

    if scritte:
        io.open(LEDGER, 'w', encoding='utf-8', newline='').write(testo)
    for nid, t in scritte:
        print('aggiunta %s · %s' % (nid, t))
    for t, (i, esist) in saltate:
        print('SALTATA (somiglia a %s «%s»): %s' % (i, esist, t))
    return 0 if scritte or not saltate else 1


if __name__ == '__main__':
    sys.exit(main())
