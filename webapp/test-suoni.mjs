// La scelta della traccia: quale ambiente suona in quale situazione.
//
// E' l'unica parte dell'audio che si possa provare senza orecchie, ed e'
// quella che conta: la scala di priorita' E' il significato. «Obiettivo
// compiuto» deve battere «boss desto», perche' quando il mazzo Minaccia tace
// la minaccia ha smesso di contare — ed e' esattamente quello che il tavolo
// deve sentire (il crescendo-relief su cui e' tarata mezza campagna).
//
// Uso:  node webapp/test-suoni.mjs
import { readFileSync, readdirSync, existsSync } from 'fs';
import { traccia, tracciaSopra } from './public/js/suoni.js';

let errori = 0;
const ko = (m) => { errori += 1; console.log('  KO', m); };
const ok = (c, m) => { if (c) console.log('  ok', m); else ko(m); };
const eq = (a, b, m) => ok(a === b, `${m}${a === b ? '' : ` — atteso «${b}», ottenuto «${a}»`}`);

// --- Indagine ---------------------------------------------------------------
console.log('indagine');
eq(traccia({ fase: 'indagine', ambiente: 'chiesa-cripta', ora: 19 }), 'chiesa-cripta',
   'dentro un luogo suona il suo ambiente');
eq(traccia({ fase: 'indagine', ambiente: null, ora: 19 }), null,
   'in strada, fra una visita e l’altra, silenzio');
eq(tracciaSopra({ fase: 'indagine', ora: 22 }), null, 'alle 22 nessuna seconda voce');
eq(tracciaSopra({ fase: 'indagine', ora: 23 }), 'ultima-ora', 'alle 23 entra l’ultima ora');
eq(tracciaSopra({ fase: 'spedizione', ora: 23 }), null,
   'sotto terra l’orologio dell’Indagine non c’entra piu’');

// --- Spedizione: la scala di priorita' ---------------------------------------
console.log('spedizione — la scala');
const sped = (x) => traccia({ fase: 'spedizione', ...x });
eq(sped({}), 'spedizione', 'niente in campo: l’esplorazione');
eq(sped({ canto: 1 }), 'canto-1', 'col primo segnalino sale il Canto');
eq(sped({ canto: 4 }), 'canto-2', 'il Canto scala di livello, non cresce da solo');
eq(sped({ canto: 8 }), 'canto-3', 'e si ferma al terzo: i file sono tre');
eq(sped({ canto: 3, nemiciVicini: true }), 'contatto',
   'il contatto batte il Canto: quello che ti sta addosso viene prima');
eq(sped({ canto: 6, nemiciVicini: true, bossDesto: true }), 'dormiente',
   'il Dormiente desto batte il contatto');
eq(sped({ canto: 6, nemiciVicini: true, bossDesto: true, obiettivoFatto: true }), 'mazzo-tace',
   'ma OBIETTIVO COMPIUTO batte tutto: la pressione ha smesso, e si deve sentire');

// --- le due code -------------------------------------------------------------
console.log('le code');
eq(traccia({ fase: 'spedizione', esito: 'vittoria', obiettivoFatto: true }), 'si-esce',
   'vittoria: si esce');
eq(traccia({ fase: 'spedizione', esito: 'parziale' }), 'si-esce',
   'anche la vittoria amara e’ un’uscita');
eq(traccia({ fase: 'spedizione', esito: 'sconfitta', obiettivoFatto: true }), 'non-si-esce',
   'sconfitta: non si esce, e nemmeno l’obiettivo compiuto lo cambia');

// --- ogni traccia nominata ha il suo prompt ----------------------------------
// Un nome inventato qui e' un file che nessuno generera' mai, e una situazione
// che resta muta per sempre senza che nessuno se ne accorga.
console.log('i nomi combaciano coi prompt');
{
  const doc = readFileSync('suoni/PROMPT-SUNO.md', 'utf8');
  const nomi = new Set();
  const stati = [
    { fase: 'indagine', ambiente: 'chiesa-cripta' }, { fase: 'spedizione' },
    { fase: 'spedizione', canto: 1 }, { fase: 'spedizione', canto: 4 },
    { fase: 'spedizione', canto: 8 }, { fase: 'spedizione', nemiciVicini: true },
    { fase: 'spedizione', bossDesto: true }, { fase: 'spedizione', obiettivoFatto: true },
    { fase: 'spedizione', esito: 'vittoria' }, { fase: 'spedizione', esito: 'sconfitta' },
    { fase: 'indagine', ora: 23 },
  ];
  for (const st of stati) { const t = traccia(st); if (t) nomi.add(t); const u = tracciaSopra(st); if (u) nomi.add(u); }
  const senza = [...nomi].filter((n) => !doc.includes(`${n}.mp3`));
  ok(senza.length === 0, `ogni traccia scelta ha un prompt${senza.length ? ' — mancano: ' + senza.join(', ') : ''} (${nomi.size} controllate)`);
}

// --- e ogni ambiente assegnato ai luoghi esiste ------------------------------
console.log('gli ambienti dei luoghi');
{
  const doc = readFileSync('suoni/PROMPT-SUNO.md', 'utf8');
  const usati = new Set();
  for (const f of readdirSync('webapp/data').filter((x) => /^(ep\d+|preludio)\.json$/.test(x))) {
    for (const l of JSON.parse(readFileSync(`webapp/data/${f}`, 'utf8')).luoghi) {
      if (l.ambiente) usati.add(l.ambiente); else ko(`${f}: «${l.nome}» senza ambiente`);
    }
  }
  const orfani = [...usati].filter((a) => !doc.includes(`${a}.mp3`));
  ok(orfani.length === 0,
     `i ${usati.size} ambienti usati dai luoghi hanno tutti un prompt${orfani.length ? ' — orfani: ' + orfani.join(', ') : ''}`);
}

// --- i file: quanti ce ne sono davvero --------------------------------------
{
  const ci = existsSync('suoni') ? readdirSync('suoni').filter((f) => f.endsWith('.mp3')) : [];
  console.log(`\ntracce generate finora: ${ci.length}/20` +
    (ci.length ? '' : ' — nessuna: l’app resta muta, ed e’ il comportamento previsto'));
}

console.log(errori ? `\n${errori} KO` : '\ntest-suoni: tutto a posto');
process.exit(errori ? 1 : 0);
