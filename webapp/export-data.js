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
    ep9: d.EP9_MINACCE.map(carta),
    ep10: d.EP10_MINACCE.map(carta),
    ep11: d.EP11_MINACCE.map(carta),
    ep12: d.EP12_MINACCE.map(carta),
    ep13: d.EP13_MINACCE.map(carta),
    ep14: d.EP14_MINACCE.map(carta),
    ep15: d.EP15_MINACCE.map(carta),
    ep16: d.EP16_MINACCE.map(carta),
    ep17: d.EP17_MINACCE.map(carta),
    ep18: d.EP18_MINACCE.map(carta),
    ep19: d.EP19_MINACCE.map(carta),
    ep20: d.EP20_MINACCE.map(carta),
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
    ep9: d.LUOGHI9.map(carta),
    ep10: d.LUOGHI10.map(carta),
    ep11: d.LUOGHI11.map(carta),
    ep12: d.LUOGHI12.map(carta),
    ep13: d.LUOGHI13.map(carta),
    ep14: d.LUOGHI14.map(carta),
    ep15: d.LUOGHI15.map(carta),
    ep16: d.LUOGHI16.map(carta),
    ep17: d.LUOGHI17.map(carta),
    ep18: d.LUOGHI18.map(carta),
    ep19: d.LUOGHI19.map(carta),
    ep20: d.LUOGHI20.map(carta),
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
    ep9: [...d.EP9_INDIZI, ...d.EP9_TESTIMONI, ...d.EP9_REFERTI].map(carta),
    ep10: [...d.EP10_INDIZI, ...d.EP10_TESTIMONI, ...d.EP10_REFERTI].map(carta),
    ep11: [...d.EP11_INDIZI, ...d.EP11_TESTIMONI, ...d.EP11_REFERTI].map(carta),
    ep12: [...d.EP12_INDIZI, ...d.EP12_TESTIMONI, ...d.EP12_REFERTI].map(carta),
    ep13: [...d.EP13_INDIZI, ...d.EP13_TESTIMONI, ...d.EP13_REFERTI].map(carta),
    ep14: [...d.EP14_INDIZI, ...d.EP14_TESTIMONI, ...d.EP14_REFERTI].map(carta),
    ep15: [...d.EP15_INDIZI, ...d.EP15_TESTIMONI, ...d.EP15_REFERTI].map(carta),
    ep16: [...d.EP16_INDIZI, ...d.EP16_TESTIMONI, ...d.EP16_REFERTI].map(carta),
    ep17: [...d.EP17_INDIZI, ...d.EP17_TESTIMONI, ...d.EP17_REFERTI].map(carta),
    ep18: [...d.EP18_INDIZI, ...d.EP18_TESTIMONI, ...d.EP18_REFERTI].map(carta),
    ep19: [...d.EP19_INDIZI, ...d.EP19_TESTIMONI, ...d.EP19_REFERTI].map(carta),
    ep20: [...d.EP20_INDIZI, ...d.EP20_TESTIMONI, ...d.EP20_REFERTI].map(carta),
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
    ep9: d.EP9_OGGETTI.map(carta),
    ep10: d.EP10_OGGETTI.map(carta),
    ep11: d.EP11_OGGETTI.map(carta),
    ep12: d.EP12_OGGETTI.map(carta),
    ep13: d.EP13_OGGETTI.map(carta),
    ep14: d.EP14_OGGETTI.map(carta),
    ep15: d.EP15_OGGETTI.map(carta),
    ep16: d.EP16_OGGETTI.map(carta),
    ep17: d.EP17_OGGETTI.map(carta),
    ep18: d.EP18_OGGETTI.map(carta),
    ep19: d.EP19_OGGETTI.map(carta),
    ep20: d.EP20_OGGETTI.map(carta),
    preludio: d.PRELUDIO_OGGETTI.map(carta),
  },
  eroi_carte: d.HEROES.map(carta),
  nemici_carte: [...d.NEMICI, ...d.EP2_NEMICI, ...d.EP3_NEMICI, ...d.EP4_NEMICI, ...d.EP5_NEMICI, ...d.EP6_NEMICI, ...d.EP7_NEMICI, ...d.EP8_NEMICI, ...d.EP9_NEMICI, ...d.EP10_NEMICI, ...d.EP11_NEMICI, ...d.EP12_NEMICI, ...d.EP13_NEMICI, ...d.EP14_NEMICI, ...d.EP15_NEMICI, ...d.EP16_NEMICI, ...d.EP17_NEMICI, ...d.EP18_NEMICI, ...d.EP19_NEMICI, ...d.EP20_NEMICI].map(carta),
};

const p = path.join(OUT, 'carte.json');
fs.writeFileSync(p, JSON.stringify(out, null, 1), 'utf-8');
console.log('ok ->', p);
