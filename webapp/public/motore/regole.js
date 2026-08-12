// LE REGOLE COMUNI: l'oracolo del Bussare, l'orologio d'Indagine, le cariche
// degli Approfondimenti, il vantaggio di fine Indagine, il mazzo Minaccia, il
// Canto, l'oracolo del Cercare, la verifica delle risposte.
//
// Viene da webapp/public/js/engine.js, che era gia' puro. Due sole differenze,
// ed entrambe hanno una ragione:
//
// 1. I DADI ARRIVANO DA FUORI. costruisciMazzo e pesca prendono `rng` come
//    primo argomento invece di chiamare Math.random. Senza, il mazzo di una
//    serata non si puo' rigiocare, e una misura di bilanciamento non si puo'
//    ripetere.
// 2. NIENTE PROSA. dichiaraVoce diceva quale frase di pista fredda mostrare;
//    ora dice solo che la pista e' fredda, e la frase la sceglie la vista. Le
//    frasi sono cinque righe di narrativa: non sono una regola, e in un
//    Durable Object non servirebbero a nessuno.
//
// Restano nella vista (engine.js): `rendi` (html-lite), PISTE_FREDDE, e le
// funzioni che compongono gli URL degli asset.
//
// Fonti: regole di produzione esportate in comune.json (tick Canto, soglia,
// pesca per taglia), chiavi/segreti nei JSON episodio.
import { mescola } from './rng.js';

// --- util -------------------------------------------------------------
export const norm = (s) => String(s || '').trim().toUpperCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')   // via gli accenti
  .replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// --- oracolo Bussare ---------------------------------------------------
// Il gruppo dichiara UNA parola o UN oggetto: l'ora si spende comunque
// (regola 1-sexies), l'oracolo risponde solo si'/no.
// Articoli e preposizioni articolate: al tavolo la parola si dice, non si
// digita, e nessuno la dice nuda. La chiave e' DOGANA e il gruppo scrive «la
// dogana»: era un errore, e un errore falso e' peggio di nessun controllo —
// insegna che l'app non e' affidabile proprio nel momento in cui la deduzione
// era giusta.
const ARTICOLO = /^(?:il|lo|la|i|gli|le|l|un|uno|una|del|dello|della|dei|degli|delle|dal|dalla|nel|nella|sul|sulla|al|allo|alla|ai|agli|alle|di|a|da|in|su|con|per|d)\s+/i;
export const nocciolo = (s) => {
  let x = norm(s); let prima;
  do { prima = x; x = x.replace(ARTICOLO, ''); } while (x !== prima);
  return x;
};

export function bussa(luogo, dichiarazione) {
  if (!luogo.chiave) return { entra: true, motivo: 'aperto' };
  const [tipo, valore] = luogo.chiave;
  const detto = nocciolo(dichiarazione);
  const atteso = nocciolo(valore);
  // Vale in tutt'e due i versi: chi dice MENO della chiave («il nastro» per
  // «il nastro verde») ha comunque capito, e chi dice DI PIU' pure. Prima
  // passava solo il primo verso, quindi bastava un articolo per essere
  // respinti con la risposta giusta in bocca.
  const ok = !!detto && (detto === atteso
    || (detto.length >= 4 && atteso.includes(detto))
    || (atteso.length >= 4 && detto.includes(atteso)));
  return { entra: ok, tipo };
}

// --- stradario ----------------------------------------------------------
// dichiarare una voce della mappa: in episodio -> visita; fuori -> pista
// fredda. QUALE frase di colore mostrare lo decide la vista: qui si dice solo
// che la pista e' fredda.
export function dichiaraVoce(ep, comune, nomeVoce) {
  const luogo = ep.luoghi.find((l) => norm(l.voce_mappa) === norm(nomeVoce));
  if (luogo) return { tipo: 'visita', luogo };
  return { tipo: 'fredda' };
}

// voci visibili sulla mappa di questo episodio (incrementale)
export function vociMappa(ep, comune) {
  const mappe = comune.mappa.mappe.find((m) => m.cartella === ep.cartella);
  const tags = mappe ? mappe.tags : ['citta'];
  return comune.mappa.voci.filter((v) => tags.includes(v.tag))
    .slice().sort((a, b) => {
      const art = (s) => s.replace(/^(il|lo|la|i|gli|le|l)\s*'?\s*/i, '');
      return art(a.nome).localeCompare(art(b.nome), 'it');
    });
}

// --- orologio d'indagine -------------------------------------------------
export function luogoVisitabile(luogo, ora) {
  if (luogo.chiude != null && ora >= luogo.chiude) return false;
  // vincolo inverso (Ep.4, il Loggione): il luogo APRE a una certa ora
  if (luogo.apre != null && ora < luogo.apre) return false;
  return true;
}

// --- cariche Approfondimenti ---------------------------------------------
// chi puo' sbloccare un tipo, con le cariche residue della partita
export function idoneiPerTipo(comune, partita, tipo) {
  return partita.party.map((nome) => {
    const eroe = comune.eroi.find((e) => e.nome === nome);
    const cariche = eroe?.cariche || {};
    const usate = partita.indagine.caricheUsate[nome] || {};
    const proprie = (cariche[tipo] || 0) - (usate[tipo] || 0);
    const jolly = (cariche.jolly || 0) - (usate.jolly || 0);
    return { nome, proprie, jolly };
  }).filter((x) => x.proprie > 0 || x.jolly > 0);
}

export function usaCarica(partita, nome, tipo, conJolly) {
  const u = partita.indagine.caricheUsate;
  u[nome] = u[nome] || {};
  const k = conJolly ? 'jolly' : tipo;
  u[nome][k] = (u[nome][k] || 0) + 1;
}

// --- vantaggio di fine indagine -------------------------------------------
// `esatte`: array di boolean (una per Domanda). Lo Slancio è di chi SA dove
// andare: TUTTE le risposte esatte E le ore avanzate — chiudere l'indagine
// subito a caso non paga (Regolamento, "Il vantaggio d'Indagine").
export function tierIndagine(ep, ind, esatte) {
  // Le visite gratuite (Carla, Marani) non toccano l'orologio: le ore
  // avanzate sono semplicemente quelle non barrate sul Taccuino. La frase
  // del Regolamento "non conta come ora avanzata" dice solo che la visita
  // gratis non ne AGGIUNGE una - niente sconti punitivi qui.
  const oreAvanzate = 24 - ind.ora;
  const luoghi = ind.visitati.length;
  const v = ep.vantaggio || { slancio_ore: 3, preparati_ore: 1, preparati_luoghi: 99 };
  const tutte = Array.isArray(esatte) && esatte.length > 0 && esatte.every(Boolean);
  let tier = 'nessuno';
  if (tutte && oreAvanzate >= v.slancio_ore) tier = 'slancio';
  else if (oreAvanzate >= v.preparati_ore || luoghi >= v.preparati_luoghi) tier = 'preparati';
  return { tier, oreAvanzate, luoghi, dossier: oreAvanzate === 0 };
}

// --- mazzo Minaccia --------------------------------------------------------
export function costruisciMazzo(rng, carte, ep, epId) {
  let pool = carte.minacce[epId] || [];
  if (epId === 'preludio') {
    const nomi = new Set((ep.mazzo_da_ep1 || []).map(norm));
    pool = carte.minacce.ep1.filter((c) => nomi.has(norm(c.title.split('—').pop())));
  }
  // le carte Bivio (Segugi del Coro) restano fuori: entrano solo se il
  // Bivio dell'episodio precedente lo dice (W-D, campagna)
  pool = pool.filter((c) => !c.title.startsWith('Bivio'));
  const ordine = mescola(rng, pool.map((_, i) => i));
  return { pool: pool.map((c) => c.title), ordine, indice: 0, scarti: [] };
}

export function carteDaPescare(comune, taglia, round, cantoBonus, epId) {
  // Preludio (scuola): 1 carta ogni 2 eroi, arrotondando per eccesso.
  if (epId === 'preludio') return Math.max(1, Math.ceil(taglia / 2));
  const [base, alternata] = comune.regole.pesca[String(taglia)] || [1, false];
  let n = base + ((alternata && round % 2 === 0) ? 1 : 0);
  if (cantoBonus) n += 1;
  return n;
}

export function pesca(rng, mazzo, carte, epId, ep) {
  if (mazzo.indice >= mazzo.ordine.length) {
    mescola(rng, mazzo.ordine);          // rimescola gli scarti (regola vera)
    mazzo.indice = 0;
    mazzo.rimescolato = (mazzo.rimescolato || 0) + 1;
  }
  const titolo = mazzo.pool[mazzo.ordine[mazzo.indice]];
  mazzo.indice += 1;
  let lista = carte.minacce[epId] || [];
  if (epId === 'preludio') lista = carte.minacce.ep1;
  return lista.find((c) => c.title === titolo);
}

// --- Canto / Marea ----------------------------------------------------------
// Ogni quanti round sale da solo l'orologio. NON e' uguale per tutti: una
// clessidra sola non puo' servire un episodio da 7 round e uno da 34. Misurato
// a 4 eroi: passando da 4 a 6 round l'Ep.3 va dal 16% al 62% di vittorie,
// l'Ep.5 dal 9% al 30%, l'Ep.6 dal 18% al 51%, mentre l'Ep.8 (11 round) non se
// ne accorge nemmeno (90% -> 90%). Chi non dichiara nulla batte ogni 4.
export const cadenzaCanto = (comune, ep) =>
  ep.marea ? ep.marea.ogni : (ep.canto_ogni ?? comune.regole.tick_canto_ogni);

// da chiamare a fine round; ritorna gli annunci da mostrare
export function fineRound(comune, ep, sped) {
  // Il segnalino scatta DOPO l'N-esimo round giocato (round 4, 8, 12 con
  // tick=4), come nel simulatore tarato: si valuta il modulo sul round
  // appena concluso, POI si avanza al prossimo. (Prima: round += 1 prima
  // del check -> tick sfasato di 1 round in anticipo, tavolo piu' duro.)
  const annunci = [];
  const ogni = cadenzaCanto(comune, ep);
  const soglia = ep.marea ? ep.marea.soglia : sogliaCanto(comune, ep);
  const nome = ep.marea ? 'Marea' : 'Canto';
  // Tetto ai segnalini: sono un componente FISICO e finito — 8 in scatola, il
  // massimo che un episodio richieda (il risveglio del Dormiente, Ep.20). Il
  // contatore si ferma li' perche' non c'e' un nono pezzo. QUANDO scatta cosa
  // lo decide l'episodio (soglia del boss, registrazione dell'Ep.4, rogo,
  // sigillo), non questo tetto. Un episodio puo' dichiarare un `canto_max` suo.
  if (sped.round % ogni === 0 && sped.canto < tettoCanto(comune, ep)) {
    sped.canto += 1;
    annunci.push(`Fine del ${sped.round}° round: +1 segnalino ${nome} (${sped.canto}).`);
    // `>=` e non `===`: il Canto puo' PARTIRE gia' alla soglia o oltre (un
    // Bivio che regala segnalini iniziali, l'Ep.20 col Bivio 11), e con
    // l'uguaglianza secca il bonus non scattava mai piu'. `sogliaVista` tiene
    // l'annuncio una volta sola, che `cantoBonus` non copre il ramo marea.
    if (sped.canto >= soglia && !sped.sogliaVista) {
      sped.sogliaVista = true;
      if (ep.marea) annunci.push(ep.marea.effetto + ' Da ora in poi.');
      else {
        sped.cantoBonus = true;
        annunci.push(`Il ${nome} raggiunge ${soglia}: ${ep.soluzione.boss ? 'il boss si desta sulla tessera più lontana dagli eroi, e ' : ''}da ora ogni Fase Minaccia pesca 1 carta in più — per sempre.`);
      }
    }
  }
  sped.round += 1;
  return annunci;
}

// segnalino Canto da carta crescendo (il testo lo dice): stessa soglia
export const tettoCanto = (comune, ep) =>
  (ep && ep.canto_max != null ? ep.canto_max : (comune.regole.canto_max ?? Infinity));

// La soglia a cui il boss si desta NON e' una costante di gioco: il
// Regolamento dice «ogni episodio fissa una soglia», e due Bivi la spostano
// (Ep.2 -> Ep.3 «a 4 invece di 3», Ep.4 «sale di 1»). L'episodio la dichiara
// in `soglia_canto`; chi non la dichiara usa il 3 di `comune.regole`.
export const sogliaCanto = (comune, ep) =>
  (ep && ep.soglia_canto != null ? ep.soglia_canto : comune.regole.soglia_canto);

export function cantoDaCarta(comune, ep, sped) {
  const soglia = sogliaCanto(comune, ep);
  const tetto = tettoCanto(comune, ep);
  if (sped.canto >= tetto) {                                  // segnalini finiti
    return [`Il Canto è già al massimo (${tetto}).`];
  }
  sped.canto += 1;
  const annunci = [`Segnalino Canto: ${sped.canto}.`];
  if (sped.canto >= soglia && !sped.cantoBonus) {
    sped.cantoBonus = true;
    sped.sogliaVista = true;
    annunci.push(`Il Canto raggiunge ${soglia}: il boss si desta in anticipo, e da ora ogni Fase Minaccia pesca 1 carta in più.`);
  }
  return annunci;
}

// --- Cercare (l'oracolo del retro) ------------------------------------------
export function cerca(ep, partita, tileId) {
  const t = ep.tessere.find((x) => x.id === tileId);
  if (!t) return null;
  const out = { tessera: t.nome };
  if (t.cerca) out.esito = t.cerca;
  else out.esito = t.cerca_vuoto || 'Niente da trovare qui.';
  if (t.hook) out.hook = t.hook;
  if (t.arbitro) out.arbitro = t.arbitro;
  return out;
}

// La CONTRO-BUSTA (Ep.15): una Domanda che il fascicolo tiene sigillata a
// parte e apre solo DOPO la spedizione — la sua risposta e' la torsione
// dell'atto. Va tenuta fuori dal taccuino, dalla busta e dal calcolo del
// tier, e mostrata nell'epilogo.
export const controBusta = (ep) =>
  (ep.soluzione.domande || []).find((d) => d.dopo_spedizione) || null;
export const domandeBusta = (ep) =>
  (ep.soluzione.domande || []).filter((d) => !d.dopo_spedizione);

// --- verifica risposte (la busta) --------------------------------------------
export function verificaRisposte(ep, risposte) {
  return ep.soluzione.domande.map((d, i) => {
    const r = norm(risposte[i] || '');
    const attesa = norm(d.risposta);
    // match morbido: la risposta scritta contiene le parole significative;
    // risposte corte/numeriche (es. una combinazione) non hanno parole
    // lunghe: si confrontano i token cosi' come sono
    let chiavi = attesa.split(' ').filter((w) => w.length > 3);
    if (!chiavi.length) chiavi = attesa.split(' ').filter(Boolean);
    const prese = chiavi.filter((w) => r.includes(w)).length;
    const ok = r.length > 0 && prese >= Math.max(1, Math.ceil(chiavi.length * 0.4));
    return { ...d, data: risposte[i], ok };
  });
}
