// I BIVI DI CAMPAGNA: che la traduzione dai fascicoli non resti a metà.
//
// A fine episodio il gruppo decide, e quella scelta cambia le regole di uno o
// più episodi successivi. La traduzione sta in `src/bivi.py` e finisce nei JSON
// come due cose diverse: `bivio` (il proprio, da proporre a fine serata) e
// `bivi_qui` (gli effetti che cadono su quell'episodio, da qualunque Bivio
// arrivino).
//
// QUEL CHE C'È DA PROVARE QUI NON È IL MOTORE, È LA COPERTURA. Il rischio di
// questo lavoro non è applicare male un effetto — quello si vede giocando — è
// dimenticarne uno: venti Bivi, ventisei tipi, e conseguenze che scavalcano
// otto episodi. Un Bivio tradotto a metà non dà nessun errore: dà una campagna
// che si comporta come se quella scelta non fosse stata presa.
//
// node webapp/test-bivi.mjs
import { readFileSync, existsSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const EPISODI = ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)];
const dati = {};
for (const k of EPISODI) {
  const p = `webapp/data/${k}.json`;
  if (existsSync(p)) dati[k] = JSON.parse(readFileSync(p, 'utf8'));
}

// i tipi che il motore sa applicare: un tipo scritto male è un effetto che non
// verrà mai eseguito, e nessuno se ne accorgerebbe
const TIPI = new Set([
  'canto-iniziale', 'canto-iniziale-piu', 'soglia-canto', 'mazzo-aggiungi', 'mazzo-togli',
  'pool-nemici', 'carica', 'boss-vicino', 'round-meno', 'ritirata-sicura', 'niente-rialzo',
  'ore', 'incrocio', 'conferma', 'approfondimento-togli', 'testimone-muto', 'testimone-in-piu',
  'luogo-aperto', 'luogo-chiuso', 'luogo-rivelato', 'esame-negato', 'fonte-segreta',
  'sospetto', 'alleato-meno', 'forma', 'nota',
]);

// --- OGNI EPISODIO HA IL SUO BIVIO (tranne l'Ep.20, che è il finale)
{
  const senza = EPISODI.filter((k) => dati[k] && k !== 'ep20' && !dati[k].bivio);
  ok(senza.length === 0, `ogni episodio ha il suo Bivio (mancano: ${senza.join(', ') || '—'})`);
  ok(dati.ep20 && !dati.ep20.bivio, 'l’Ep.20 è il finale e non ne ha uno proprio');
}

// --- OGNI BIVIO È COMPLETO
// Due opzioni, entrambe con conseguenze: un Bivio con un ramo vuoto è una
// scelta finta — una delle due strade non costerebbe niente.
for (const [k, ep] of Object.entries(dati)) {
  if (!ep.bivio) continue;
  const b = ep.bivio;
  ok(b.domanda && b.domanda.length > 20, `${k}: il Bivio ha una domanda`);
  ok(b.opzioni && b.opzioni.length === 2, `${k}: due opzioni (viste ${(b.opzioni || []).length})`);
  for (const o of b.opzioni || []) {
    ok(o.id && o.titolo, `${k}: l’opzione ha id e titolo`);
    ok((o.effetti || []).length > 0,
       `${k}/${o.id}: ha almeno una conseguenza — un ramo senza prezzo è una scelta finta`);
    for (const e of o.effetti || []) {
      ok(TIPI.has(e.tipo), `${k}/${o.id}: tipo noto (visto «${e.tipo}»)`);
      ok(e.nota || e.testo, `${k}/${o.id}/${e.tipo}: ha una riga da dire a chi arbitra`);
    }
  }
}

// --- GLI EFFETTI ATTERRANO DOVE DEVONO
// `bivi_qui` è l'indice inverso: si costruisce all'export, una volta, invece di
// farlo cercare al motore fra venti episodi a ogni avvio.
{
  const collocati = Object.values(dati).reduce((n, e) => n + (e.bivi_qui || []).length, 0);
  ok(collocati > 90, `gli effetti sono collocati negli episodi bersaglio (visti ${collocati})`);

  // ogni effetto dichiarato in un Bivio deve comparire nell'episodio che colpisce
  let persi = 0;
  for (const [k, ep] of Object.entries(dati)) {
    for (const o of (ep.bivio || {}).opzioni || []) {
      for (const e of o.effetti || []) {
        const dove = typeof e.ep === 'string' ? [e.ep] : e.ep;
        for (const d of dove) {
          if (!dati[d]) continue;
          const c = (dati[d].bivi_qui || []).some(
            (x) => x.da === k && x.opzione === o.id && x.tipo === e.tipo);
          if (!c) { persi += 1; console.error(`  perso: ${k}/${o.id} ${e.tipo} -> ${d}`); }
        }
      }
    }
  }
  ok(persi === 0, `nessun effetto perso per strada (persi ${persi})`);
}

// --- GLI ARCHI LUNGHI CI SONO ANCORA
// Sono la ragione per cui questo lavoro è più grande di «venti Bivi»: una
// scelta dell'Atto II si paga nel finale. Se un domani qualcuno «semplifica»
// l'export appiattendo tutto su N→N+1, questi tre controlli cadono.
{
  const da = (k) => [...new Set((dati[k].bivi_qui || []).map((x) => x.da))];
  ok(da('ep20').includes('ep11'),
     `il Bivio dell’Ep.11 arriva fino al finale (Ep.20 riceve da: ${da('ep20').join(', ')})`);
  ok(['ep13', 'ep14', 'ep16'].every((k) => da(k).includes('ep8')),
     'il Bivio dell’Ep.8 si applica in Ep.13, 14 e 16');
  ok(da('ep18').length >= 5,
     `l’Ep.18 raccoglie i conti di mezza campagna (da: ${da('ep18').join(', ')})`);
}

// --- IL PRELUDIO PORTA ALL'EP.1, ed è il caso che si gioca per primo
{
  const q = dati.ep1.bivi_qui || [];
  ok(q.some((x) => x.da === 'preludio' && x.tipo === 'ore' && x.val === 1),
     'tenendo la pagina in archivio, l’Ep.1 comincia con 1 ora in più');
  ok(q.some((x) => x.da === 'preludio' && x.tipo === 'luogo-aperto'),
     'consegnandola alla gendarmeria, il brigadiere vi riconosce');
}

// --- L'EPILOGO E IL FRAMMENTO CI SONO, per tutti
// Sono presi dai generatori dei fascicoli con `ast` (export-data.py): il giorno
// in cui qualcuno riscrive un epilogo con un'altra intestazione, l'estrazione
// smette di trovarlo e la serata si chiude su una schermata muta. Non e' un
// errore: e' un silenzio, e questo controllo e' l'unico che lo sente.
{
  const senza = Object.entries(dati).filter(([, e]) => !(e.epilogo || {}).vittoria).map(([k]) => k);
  ok(senza.length === 0, `ogni episodio ha il suo epilogo (mancano: ${senza.join(', ') || '—'})`);
  const corti = Object.entries(dati)
    .filter(([, e]) => ((e.epilogo || {}).vittoria || '').length < 200).map(([k]) => k);
  ok(corti.length === 0, `e l'epilogo e' il TESTO, non il titolo che lo precede (corti: ${corti.join(', ')})`);
  ok(((dati.ep20.epilogo || {}).sconfitta || '').length > 200,
     'l’Ep.20 ha anche l’epilogo della sconfitta: il Dormiente che si desta e’ un finale, non un silenzio');

  const senzaFr = Object.entries(dati).filter(([, e]) => !e.frammento).map(([k]) => k);
  ok(senzaFr.length === 0, `ogni episodio ha il suo Frammento (mancano: ${senzaFr.join(', ') || '—'})`);
  // Il Preludio scrive il n. 0 in coda al suo epilogo, e l'export lo stacca: sul
  // fascicolo e' la stessa cornice, a schermo no — il Frammento e' un oggetto
  // che si conserva per venti serate, e si legge in carattere da stampa, non
  // nella grafia con cui si legge una voce.
  ok(/Frammento di Campagna n\. 0/i.test(dati.preludio.frammento || ''),
     'il Frammento n. 0 e’ staccato dall’epilogo del Preludio');
  ok(!/Frammento di Campagna/i.test(dati.preludio.epilogo.vittoria),
     'e non e’ rimasto anche dentro l’epilogo, che lo scriverebbe due volte');
  const monchi = Object.entries(dati)
    .filter(([, e]) => /<[a-z/]*$/.test(((e.epilogo || {}).vittoria || '').trim())).map(([k]) => k);
  ok(monchi.length === 0, `nessun epilogo tagliato a meta’ di un tag (${monchi.join(', ')})`);
}

console.log(ko === 0
  ? `test-bivi: ${Object.values(dati).filter((e) => e.bivio).length} Bivi tradotti, nessun effetto perso`
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
