# -*- coding: utf-8 -*-
"""Cosa copre davvero la libreria Forgotten Adventures, dei nostri bisogni.

Indicizza i 147k file una volta sola e per ogni chiave del gioco (i 14 arredi e
i 10 pavimenti) stampa i candidati migliori. Serve a rispondere a una domanda
sola: quali tessere si riescono a comporre, e quali no.

Uso: python webapp/_sonda-fa.py [chiave]
"""
import os
import sys

BASE = os.path.join('risorse-vtt', 'FA_Assets_Webp')

# chiave del gioco -> ricette in ordine di preferenza. Una ricetta e' un elenco
# di parole che devono comparire TUTTE nel percorso (minuscolo).
ARREDI = {
    'casse':     [['clutter', 'crate'], ['crate'], ['barrel']],
    'molo':      [['bollard'], ['mooring'], ['rope', 'coil'], ['fishing', 'net'], ['anchor']],
    'candele':   [['lightsources', 'candle'], ['candelabra'], ['candle']],
    'scrivania':  [['furniture', 'desk'], ['desk'], ['writing']],
    'branda':    [['bedding', 'bed'], ['bedroll'], ['cot'], ['bed']],
    'scala':     [['stairs'], ['staircase'], ['steps']],
    'altare':    [['altars'], ['altar'], ['shrine']],
    'cella':     [['law_enforcement'], ['prison'], ['jail'], ['cage'], ['bars']],
    'forma':     [['cauldron'], ['vat'], ['basin'], ['trough']],
    'scorie':    [['rubble'], ['debris'], ['slag'], ['coal']],
    'crogiolo':  [['forge'], ['furnace'], ['anvil'], ['smelt']],
    'stufa':     [['stove'], ['oven'], ['fireplace'], ['brazier']],
    'armadio':   [['cupboards_and_wardrobes'], ['wardrobe'], ['cupboard'], ['cabinet']],
    'toeletta':  [['vanity'], ['dressing'], ['mirror']],
}

PAVIMENTI = {
    'assi':       [['textures', 'wood', 'plank'], ['textures', 'wood'], ['plank']],
    'lastricato': [['textures', 'stone_floors', 'cobble'], ['textures', 'stone_floors'], ['cobble']],
    'pietra':     [['textures', 'stone_diagonal'], ['textures', 'stone'], ['flagstone']],
    'mattonelle': [['textures', 'marble'], ['textures', 'tile'], ['marble']],
    'mattoni':    [['textures', 'brick'], ['brick']],
    'terra':      [['textures', 'dirt'], ['textures', 'cultivated_soil'], ['dirt'], ['soil']],
    'acqua':      [['textures', 'water'], ['aquatic', 'water'], ['water']],
    'tetti':      [['textures', 'roof'], ['roof']],
    'navata':     [['textures', 'marble'], ['marble']],
    'roccia':     [['textures', 'rock'], ['cave', 'floor'], ['rock']],
}


def indice():
    fuori = []
    for radice, _, file in os.walk(BASE):
        for f in file:
            if f.lower().endswith('.webp'):
                fuori.append(os.path.join(radice, f).replace('\\', '/'))
    return fuori


def candidati(tutti, ricette, quanti=6):
    for parole in ricette:
        trovati = [p for p in tutti if all(w in p.lower() for w in parole)]
        if trovati:
            trovati.sort(key=len)
            return parole, trovati[:quanti], len(trovati)
    return None, [], 0


def main():
    tutti = indice()
    print(f'{len(tutti)} file indicizzati\n')
    solo = sys.argv[1] if len(sys.argv) > 1 else None
    for titolo, gruppo in (('ARREDI', ARREDI), ('PAVIMENTI', PAVIMENTI)):
        print(f'===== {titolo} =====')
        for chiave, ricette in gruppo.items():
            if solo and solo != chiave:
                continue
            parole, esempi, quanti = candidati(tutti, ricette)
            if not esempi:
                print(f'  {chiave:11s} NIENTE')
                continue
            print(f'  {chiave:11s} {quanti:5d} file  (ricetta {parole})')
            for e in esempi[:3]:
                print(f'      {e[len(BASE) + 1:]}')
        print()


if __name__ == '__main__':
    main()
