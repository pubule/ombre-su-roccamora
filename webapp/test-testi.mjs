// Barriera sui TESTI che finiscono in mano ai giocatori (webapp/data/*.json:
// carte, luoghi, indizi, approfondimenti, lettere, biografie).
//
// Nasce dall'audit dell'11/08/2026, che trovò 67 accenti scritti con
// l'apostrofo in tutte le biografie degli eroi, «quale è» al posto di «qual
// è», una statistica inesistente su nove carte e la sigla d'arbitro «PNG»
// dentro la finzione. Ognuna di quelle famiglie ha qui la sua sonda.
//
// Cosa NON prende: una frase come «un freddo d'acqua nera risale i condotti»,
// dove manca il sostantivo. Quella si vede solo leggendo, e va letta.
//
// Uso:  node webapp/test-testi.mjs      (exit 1 se una sonda scatta)
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
let errori = 0;
const ko = (m) => { errori += 1; console.log('  KO', m); };
const ok = (cond, m) => { if (cond) console.log('  ok', m); else ko(m); };

// campi tecnici (percorsi, nomi d'arte) e testi che legge SOLO chi arbitra:
// lì «PNG» e le abbreviazioni sono al loro posto.
const TECNICI = new Set(['file', 'art', 'img', 'cartella', 'voce_mappa', 'id', 'src']);
const ARBITRO = new Set(['arbitro', 'soluzione', 'bivio', 'note_arbitro']);

function* testi() {
  for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    const pila = [[[], JSON.parse(readFileSync(path.join(DIR, f), 'utf8'))]];
    while (pila.length) {
      const [via, v] = pila.pop();
      const ultima = via[via.length - 1];
      if (typeof v === 'string') {
        if (v.length > 12 && v.includes(' ') && !TECNICI.has(ultima)) {
          yield { file: f, via: via.join('.'), testo: v, soloArbitro: via.some((k) => ARBITRO.has(k)) };
        }
      } else if (Array.isArray(v)) v.forEach((x, i) => pila.push([[...via, String(i)], x]));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) pila.push([[...via, k], x]);
    }
  }
}
const TUTTI = [...testi()];
console.log(`testi esaminati: ${TUTTI.length}\n`);

// una sonda: nome, espressione, e se vale anche sui testi d'arbitro
const SONDE = [
  // l'accento scritto con l'apostrofo: «citta'», «perche'», «e'»
  ['accento reso con apostrofo',
   /\b(piu|perche|poiche|purche|gia|citta|puo|liberta|verita|meta|sara|cosi|pero|percio|eta|pieta|se|ne|li|cio)['’](?![A-Za-zà-ù])/g, true],
  ['«quale è» al posto di «qual è»', /\bquale è\b/g, true],
  ['elisione mancata', /\b(la|una) ha\b/g, true],
  // s impura, z, gn, ps, x vogliono lo/gli/uno: «coi stivali» no
  ['articolo sbagliato davanti a s impura',
   /\b(i|coi|dei|nei|ai|dai|sui|il|un|del|al|dal|nel|sul|col|quel)\s+(?!PNG)(?:s[bcdfgklmnpqrtvz]|z|gn|ps|pn|x)[a-zà-ù]+/g, true],
  ['accento che non esiste (leggìo, scricchiolìo)', /\b\w+[ìí]o\b/g, true],
  ['virgolette dritte', /"/g, true],
  ['puntini di sospensione non uniti', /\.\.\./g, true],
  // «le misure che non tornano tornano eccome» (Ep.11) è un bisticcio voluto:
  // la sonda lo salta per nome, così resta viva per tutti gli altri casi.
  ['parola raddoppiata', /\b(?!tornano\b)(\w{4,})\s+\1\b/g, true],
  // sigla d'arbitro nella finzione (nei testi d'arbitro e' legittima)
  ['sigla d’arbitro nel testo dei giocatori', /\bPNG\b/g, false],
  // marcatura da PDF: rendi() in engine.js conosce solo b|i|br
  ['marcatura ReportLab', /<\s*(?!\/?(?:b|i|br)\b)[a-zA-Z/]/g, true],
];

for (const [nome, pat, ancheArbitro] of SONDE) {
  const casi = [];
  for (const t of TUTTI) {
    if (t.soloArbitro && !ancheArbitro) continue;
    for (const m of t.testo.matchAll(pat)) {
      casi.push(`${t.file} ${t.via}: «${t.testo.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).trim()}»`);
    }
  }
  ok(casi.length === 0, `${nome}${casi.length ? ` — ${casi.length}:\n      ` + casi.slice(0, 4).join('\n      ') : ''}`);
}

// --- le prove citano solo statistiche che esistono ------------------------
{
  const UFFICIALI = new Set(['NERVI', 'VIGORE', 'ACUME']);
  const fuori = new Set();
  for (const t of TUTTI) {
    for (const m of t.testo.matchAll(/\bprov[ae]\s+([A-ZÀ-Ú]{4,})/g)) {
      // «la prova FORTE» e' un aggettivo, non un tiro: la prova d'accusa
      if (!UFFICIALI.has(m[1]) && !['FORTE', 'DEBOLE', 'PIENA', 'PARZIALE'].includes(m[1])) fuori.add(m[1]);
    }
  }
  ok(fuori.size === 0, `le prove citano solo ACUME/NERVI/VIGORE${fuori.size ? ' — trovate: ' + [...fuori].join(', ') : ''}`);
}

// --- caporali e parentesi in pari ------------------------------------------
{
  const spaiati = [];
  for (const t of TUTTI) {
    for (const [ap, ch, come] of [['(', ')', 'parentesi'], ['«', '»', 'caporali'], ['“', '”', 'virgolette curve']]) {
      const a = t.testo.split(ap).length - 1, b = t.testo.split(ch).length - 1;
      if (a !== b) spaiati.push(`${t.file} ${t.via}: ${come} (${a} aperte, ${b} chiuse)`);
    }
  }
  ok(spaiati.length === 0, `caporali e parentesi in pari${spaiati.length ? ' — ' + spaiati.slice(0, 3).join(' | ') : ''}`);
}

// --- nessuna carta di prosa monca ------------------------------------------
{
  const carte = JSON.parse(readFileSync(path.join(DIR, 'carte.json'), 'utf8'));
  const monche = [];
  for (const gruppo of ['luoghi_carte', 'approfondimenti_carte']) {
    for (const [ep, lista] of Object.entries(carte[gruppo] || {})) {
      for (const c of lista) {
        const t = (c.rules || '').replace(/\{\/?\w+\}/g, '').trim();
        if (t.split(/\s+/).length < 12 || !/[.!?»"”)]$/.test(t)) monche.push(`${ep} · ${c.title}`);
      }
    }
  }
  ok(monche.length === 0, `nessuna carta-luogo o -approfondimento monca${monche.length ? ' — ' + monche.join(', ') : ''}`);
}

console.log(errori ? `\n${errori} SONDE SCATTATE` : '\ntest-testi: tutto a posto');
process.exit(errori ? 1 : 0);
