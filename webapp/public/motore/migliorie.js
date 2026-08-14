// LE MIGLIORIE, applicate.
//
// La crescita permanente di un eroe lungo le venti serate. Il Regolamento la
// promette da sempre (`src/gen_docs.py`, sezione LE MIGLIORIE); il codice non
// l'ha mai avuta, e il Regolamento stesso lo dichiarava: «Nessun simulatore
// modella le Migliorie: le percentuali di vittoria misurate finora valgono per
// eroi al primo episodio».
//
// Stessa disciplina dei Bivi (`bivi.js`), e per le stesse ragioni:
//
//   quelle che l'app SA FARE — Tempra, Fibra, Revolver, Spalle coperte, Mano
//     ferma, Lanterna schermata, Borsa di garze, Passo felpato, Occhio
//     esercitato — si applicano da sole e nessuno deve ricordarsene;
//   quelle che l'app PUO' SOLO DIRE — Taccuino fitto (la RILETTURA non esiste
//     nel codice), Fiato lungo (il Secondo fiato non esiste in Spedizione) —
//     escono come righe da leggere, perche' fingere di applicarle sarebbe
//     peggio che dirle.
//
// Una voce sconosciuta NON viene ignorata in silenzio: finirebbe in una
// campagna che si comporta come se quell'eroe non fosse cresciuto.
//
// LA FORMA DEL DATO. Sulla partita, per eroe, la lista delle caselle spuntate —
// ripetute quando la voce ha piu' caselle, e con la caratteristica scritta
// dentro quando serve:
//
//   partita.migliorie = { 'ELENA FOSCO': ['tempra:vigore', 'tempra:vigore', 'fibra', 'revolver'] }
//   partita.cicatrici = { 'ELENA FOSCO': ['acume'] }
//
// Una lista e non un conteggio perche' l'ordine e' la storia della campagna, e
// perche' il prezzo della prossima Tempra dipende da quante ce n'e' gia' su
// QUELLA caratteristica.
//
// La funzione e' PURA e non tocca il DOM: gira nel browser di chi arbitra, nel
// Durable Object e nei banchi di prova senza saperlo.

export const CARATTERISTICHE = ['acume', 'vigore', 'nervi'];

// Il tetto di una caratteristica: il Regolamento dice «massimo 4», e vale
// **dopo** le cicatrici — il pavimento e' 1, che un eroe a zero non tira piu'.
export const STAT_MAX = 4;
export const STAT_MIN = 1;

// LA TABELLA. E' la regola, e sta in un posto solo.
//
// `costo` e' un ARRAY quando la voce ha piu' caselle: il prezzo sale a ogni
// casella. E' la leva che chiude la saturazione — 17 caselle contro 21 serate
// facevano dell'elenco una tabella di marcia, non una scelta. Comprare tutto
// costa 28 punti contro i ~22 di una campagna perfetta: la scelta resta viva
// fino all'ultima serata senza scrivere una voce in piu'.
//
// `dove` dice quale meta' della serata la usa, e serve a chi la mostra.
// `dice` e' la riga da leggere per quelle che l'app non sa applicare.
export const MIGLIORIE = [
  { id: 'tempra', nome: 'Tempra', costo: [1, 2, 3, 4], perStat: true, dove: 'sempre',
    nota: '+1 permanente a una caratteristica a scelta (massimo 4).' },
  { id: 'fibra', nome: 'Fibra', costo: [1, 2, 3], dove: 'spedizione',
    nota: '+1 Salute massima.' },
  { id: 'revolver', nome: 'Revolver', costo: [2], dove: 'spedizione',
    nota: 'Attacco a distanza (fino a 3 caselle): 2d6+2. Spende un\'azione come ogni attacco.' },
  { id: 'spalle', nome: 'Spalle coperte', costo: [2], dove: 'spedizione',
    nota: 'Un eroe adiacente a voi ha +1 Difesa. Non cumulabile con sé stessa.' },
  { id: 'lanterna', nome: 'Lanterna schermata', costo: [1], dove: 'spedizione',
    nota: 'Le trappole delle tessere non si attivano sull\'eroe che la porta.' },
  { id: 'garze', nome: 'Borsa di garze', costo: [1], dove: 'spedizione', usi: 2,
    nota: '2 usi per spedizione: azione, cura 2 Salute a un eroe adiacente.' },
  { id: 'passo', nome: 'Passo felpato', costo: [1], dove: 'spedizione', usi: 1,
    nota: 'Una volta per spedizione, muovetevi di 3 caselle in più.' },
  { id: 'mano', nome: 'Mano ferma', costo: [1], dove: 'spedizione',
    nota: '+1 alle prove di NERVI imposte dalle trappole e dall\'ambiente (non ai combattimenti).' },
  { id: 'occhio', nome: 'Occhio esercitato', costo: [1], dove: 'indagine',
    nota: 'Una volta per Indagine, una prova fallita di «leggere la scena» non chiude la scena.' },
  { id: 'voce', nome: 'Voce che regge', costo: [1], dove: 'campagna', gruppo: true,
    nota: 'Nell\'ultimo episodio contate come un Frammento in più per il ritmo del controcanto.' },
  // Le due che l'app puo' solo dire. Non sono dimenticate: sono dichiarate.
  { id: 'taccuino', nome: 'Taccuino fitto', costo: [1], dove: 'campagna',
    dice: 'Taccuino fitto: una volta per campagna, rileggete una lettera d\'incarico già archiviata e bancate un incrocio in più (vale come una RILETTURA). L\'app non tiene il conto degli incroci: segnatelo sul Taccuino di Campagna.',
    nota: 'Una volta per campagna, un incrocio in più da una lettera archiviata.' },
  { id: 'fiato', nome: 'Fiato lungo', costo: [2], dove: 'spedizione',
    dice: 'Fiato lungo: il vostro «Secondo fiato» si ricarica una seconda volta, la prima volta che scendete a 2 Salute o meno. In Spedizione a schermo il Secondo fiato non è ancora offerto: tenetelo a mente al tavolo.',
    nota: 'Il «Secondo fiato» si ricarica una seconda volta nella stessa spedizione.' },
];

export const specDi = (id) => MIGLIORIE.find((m) => m.id === id) || null;

// ------------------------------------------------------------------ leggere
// Una casella spuntata e' `id` oppure `id:caratteristica` (la sola Tempra).
export const spezza = (voce) => {
  const [id, stat] = String(voce).split(':');
  return { id, stat: stat || null };
};

// Le caselle di un eroe. Sempre un array, anche quando non c'e' niente: chi la
// legge non deve difendersi da `undefined` a ogni riga.
export const vociDi = (g, nm) => ((g.partita || {}).migliorie || {})[nm] || [];
export const cicatriciDi = (g, nm) => ((g.partita || {}).cicatrici || {})[nm] || [];

// Quante caselle di quella voce ha l'eroe (per Tempra: su quella caratteristica
// se la si chiede, altrimenti in tutto).
export function quante(g, nm, id, stat) {
  return vociDi(g, nm).filter((v) => {
    const s = spezza(v);
    return s.id === id && (!stat || s.stat === stat);
  }).length;
}

export const ha = (g, nm, id) => quante(g, nm, id) > 0;

// LA VOCE DI GRUPPO. «Voce che regge» e' una sola casella per l'intero gruppo:
// si guarda su tutti, non sul singolo.
export const haIlGruppo = (g, id) =>
  (g.partita.party || []).some((nm) => ha(g, nm, id));

// ------------------------------------------------------------- il prezzario
// Quanto costa la PROSSIMA casella di quella voce. `null` quando sono finite —
// e «finite» e' un fatto della tabella, non una regola a parte: il numero di
// caselle E' la lunghezza di `costo`.
export function costoProssima(g, nm, id, stat) {
  const spec = specDi(id);
  if (!spec) return null;
  const gia = quante(g, nm, id, spec.perStat ? stat : null);
  if (gia >= spec.costo.length) return null;
  return spec.costo[gia];
}

// ------------------------------------------------------------- applicare
// I DELTA ALLE CARATTERISTICHE. Tempra somma, le Cicatrici tolgono, e i due
// tetti si applicano alla fine: massimo 4, minimo 1.
//
// Tempra e Cicatrici sono sulla stessa unita' ma non si annullano da sole —
// sono entrambe «a scelta», quindi al tavolo il malus finisce sulla
// caratteristica che non si usa. Quale caratteristica colpisca la cicatrice e'
// una regola di chi la segna (il Regolamento dice: una su cui l'eroe ha gia'
// speso una Tempra, se ne ha); qui si applica quel che e' stato segnato.
export function delta(g, nm) {
  const out = { acume: 0, vigore: 0, nervi: 0, salute: 0 };
  for (const v of vociDi(g, nm)) {
    const { id, stat } = spezza(v);
    if (id === 'tempra' && CARATTERISTICHE.includes(stat)) out[stat] += 1;
    else if (id === 'fibra') out.salute += 1;
  }
  for (const c of cicatriciDi(g, nm)) {
    if (CARATTERISTICHE.includes(c)) out[c] -= 1;
  }
  return out;
}

// L'EROE CRESCIUTO. Restituisce una COPIA — `comune.eroi` e' in cache e
// condiviso fra le partite aperte nella stessa scheda, e sporcarlo farebbe
// cadere la crescita di un tavolo addosso alla partita successiva. E' la stessa
// trappola di `episodioColBivio` in bivi.js, ed e' gia' costata una volta.
//
// Torna l'oggetto ORIGINALE quando non c'e' niente da cambiare: la copia costa,
// e `eroe()` viene chiamata a ogni tiro di ogni nemico di ogni round.
export function eroeCresciuto(g, nm, base) {
  if (!base) return base;
  const d = delta(g, nm);
  if (!d.acume && !d.vigore && !d.nervi && !d.salute) return base;
  const out = { ...base };
  for (const s of CARATTERISTICHE) {
    if (d[s]) out[s] = Math.max(STAT_MIN, Math.min(STAT_MAX, (base[s] || 0) + d[s]));
  }
  // La Salute non ha il tetto delle caratteristiche: e' la voce che il vecchio
  // elenco a cinque voci lasciava correre fino a +13, e a fermarla adesso e'
  // il numero di caselle (tre) piu' il loro prezzo crescente.
  if (d.salute) out.salute = (base.salute || 0) + d.salute;
  return out;
}

// SPALLE COPERTE: +1 Difesa a un eroe adiacente a chi la porta. «Non cumulabile
// con sé stessa» — due eroi con la miglioria, adiacenti, si danno +1 ciascuno,
// non +2: quindi il bonus e' 1 o 0, mai la somma dei vicini.
//
// Prende l'adiacenza come funzione invece di importare griglia.js: cosi' questo
// modulo non dipende dalla geometria, e chi lo prova non deve costruire una
// plancia per misurare un +1.
export function bonusDifesa(g, nm, adiacenti) {
  if (!adiacenti || !adiacenti.length) return 0;
  return adiacenti.some((x) => x !== nm && ha(g, x, 'spalle')) ? 1 : 0;
}

// ------------------------------------------------------------------ le righe
// Quel che l'app non sa applicare si dice, in chiaro, una volta per serata. Le
// righe si dicono ANCHE per le voci applicate? No: quelle si vedono nei numeri.
// Qui escono solo le due che il motore non tocca, perche' una regola che il
// tavolo deve ricordarsi a mano va detta, o non esiste.
export function righeDi(g) {
  const out = [];
  for (const nm of (g.partita.party || [])) {
    for (const v of vociDi(g, nm)) {
      const spec = specDi(spezza(v).id);
      if (spec && spec.dice) out.push(`${nm}. ${spec.dice}`);
    }
  }
  return out;
}

// LE VOCI SCONOSCIUTE. Non si ignorano: chi ha scritto una casella che questa
// tabella non conosce sta giocando una campagna diversa da quella che l'app
// applica, e deve saperlo.
export function vociIgnote(g) {
  const out = [];
  for (const nm of (g.partita.party || [])) {
    for (const v of vociDi(g, nm)) {
      if (!specDi(spezza(v).id)) out.push(`${nm}: miglioria sconosciuta «${v}» — applicatela a mano.`);
    }
  }
  return out;
}
