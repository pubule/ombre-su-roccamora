// Ombre su Roccamora - export lato JS per la webapp: le carte (Minacce con
// flavor+effetto+arte, Luoghi/Approfondimenti/Oggetti come immagini gia'
// renderizzate) vivono in scripts/cardconjurer/cards-data.js - qui si
// serializzano in webapp/data/carte.json. Gemello di export-data.py (che
// esporta i dati py). Uso: node webapp/export-data.js
const fs = require('fs');
const path = require('path');
const d = require('../scripts/cardconjurer/cards-data.js');

const OUT = path.join(__dirname, 'data');
fs.mkdirSync(OUT, { recursive: true });

// il campo `rules` delle carte usa {i}..{/i} e {divider}: la webapp li rende.
const carta = (c) => ({ title: c.title, file: c.file, art: c.art, rules: c.rules });

const out = {
  minacce: {
    ep1: d.MINACCE.map(carta),
    ep2: d.EP2_MINACCE.map(carta),
    ep3: d.EP3_MINACCE.map(carta),
    ep4: d.EP4_MINACCE.map(carta),
    ep5: d.EP5_MINACCE.map(carta),
    ep6: d.EP6_MINACCE.map(carta),
    ep7: d.EP7_MINACCE.map(carta),
    ep8: d.EP8_MINACCE.map(carta),
  },
  luoghi_carte: {
    ep1: d.LUOGHI.map(carta),
    ep2: d.LUOGHI2.map(carta),
    ep3: d.LUOGHI3.map(carta),
    ep4: d.LUOGHI4.map(carta),
    ep5: d.LUOGHI5.map(carta),
    ep6: d.LUOGHI6.map(carta),
    ep7: d.LUOGHI7.map(carta),
    ep8: d.LUOGHI8.map(carta),
    preludio: d.PRELUDIO_LUOGHI.map(carta),
  },
  approfondimenti_carte: {
    ep1: [...d.INDIZI, ...d.TESTIMONI, ...d.REFERTI].map(carta),
    ep2: [...d.EP2_INDIZI, ...d.EP2_TESTIMONI, ...d.EP2_REFERTI].map(carta),
    ep3: [...d.EP3_INDIZI, ...d.EP3_TESTIMONI, ...d.EP3_REFERTI].map(carta),
    ep4: [...d.EP4_INDIZI, ...d.EP4_TESTIMONI, ...d.EP4_REFERTI].map(carta),
    ep5: [...d.EP5_INDIZI, ...d.EP5_TESTIMONI, ...d.EP5_REFERTI].map(carta),
    ep6: [...d.EP6_INDIZI, ...d.EP6_TESTIMONI, ...d.EP6_REFERTI].map(carta),
    ep7: [...d.EP7_INDIZI, ...d.EP7_TESTIMONI, ...d.EP7_REFERTI].map(carta),
    ep8: [...d.EP8_INDIZI, ...d.EP8_TESTIMONI, ...d.EP8_REFERTI].map(carta),
    preludio: d.PRELUDIO_APPROFONDIMENTI.map(carta),
  },
  oggetti_carte: {
    ep1: d.OGGETTI.map(carta),
    ep2: d.EP2_OGGETTI.map(carta),
    ep3: d.EP3_OGGETTI.map(carta),
    ep4: d.EP4_OGGETTI.map(carta),
    ep5: d.EP5_OGGETTI.map(carta),
    ep6: d.EP6_OGGETTI.map(carta),
    ep7: d.EP7_OGGETTI.map(carta),
    ep8: d.EP8_OGGETTI.map(carta),
    preludio: d.PRELUDIO_OGGETTI.map(carta),
  },
  eroi_carte: d.HEROES.map(carta),
  nemici_carte: [...d.NEMICI, ...d.EP2_NEMICI, ...d.EP3_NEMICI, ...d.EP4_NEMICI, ...d.EP5_NEMICI, ...d.EP6_NEMICI, ...d.EP7_NEMICI, ...d.EP8_NEMICI].map(carta),
};

const p = path.join(OUT, 'carte.json');
fs.writeFileSync(p, JSON.stringify(out, null, 1), 'utf-8');
console.log('ok ->', p);
