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
  },
  luoghi_carte: {
    ep1: d.LUOGHI.map(carta),
    ep2: d.LUOGHI2.map(carta),
    preludio: d.PRELUDIO_LUOGHI.map(carta),
  },
  approfondimenti_carte: {
    ep1: [...d.INDIZI, ...d.TESTIMONI, ...d.REFERTI].map(carta),
    ep2: [...d.EP2_INDIZI, ...d.EP2_TESTIMONI, ...d.EP2_REFERTI].map(carta),
    preludio: d.PRELUDIO_APPROFONDIMENTI.map(carta),
  },
  oggetti_carte: {
    ep1: d.OGGETTI.map(carta),
    ep2: d.EP2_OGGETTI.map(carta),
    preludio: d.PRELUDIO_OGGETTI.map(carta),
  },
  eroi_carte: d.HEROES.map(carta),
  nemici_carte: [...d.NEMICI, ...d.EP2_NEMICI].map(carta),
};

const p = path.join(OUT, 'carte.json');
fs.writeFileSync(p, JSON.stringify(out, null, 1), 'utf-8');
console.log('ok ->', p);
