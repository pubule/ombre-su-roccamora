// Motore arbitro: le regole che l'app applica al posto di "chi tiene i
// fascicoli". Nessuna UI qui: funzioni pure su (dati episodio, partita).
// Fonti: regole di produzione esportate in comune.json (tick Canto, soglia,
// pesca per taglia), chiavi/segreti nei JSON episodio.

// --- util -------------------------------------------------------------
export const norm = (s) => String(s || '').trim().toUpperCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')   // via gli accenti
  .replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// html-lite dei dati (solo <b> <i> <br> sopravvivono, il resto e' escapato)
export function rendi(testo) {
  const escd = String(testo || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escd
    .replace(/&lt;(\/?)(b|i|br)\s*\/?&gt;/gi, '<$1$2>')
    .replace(/\{i\}/g, '<i>').replace(/\{\/i\}/g, '</i>')
    .replace(/\{divider\}/g, '<hr class="divisore">');
}

// --- oracolo Bussare ---------------------------------------------------
// Il gruppo dichiara UNA parola o UN oggetto: l'ora si spende comunque
// (regola 1-sexies), l'oracolo risponde solo si'/no.
export function bussa(luogo, dichiarazione) {
  if (!luogo.chiave) return { entra: true, motivo: 'aperto' };
  const [tipo, valore] = luogo.chiave;
  const ok = norm(dichiarazione) === norm(valore) ||
             norm(valore).includes(norm(dichiarazione)) && norm(dichiarazione).length >= 4;
  return { entra: ok, tipo };
}

// --- stradario ----------------------------------------------------------
// dichiarare una voce della mappa: in episodio -> visita; fuori -> pista
// fredda gratuita con frase di colore.
const PISTE_FREDDE = [
  'Bussate. Una finestra si illumina, qualcuno scosta una tenda — poi il buio di nuovo. Qui non c’è nulla per voi, stanotte.',
  'Il portone è sprangato da prima del tramonto. Un gatto vi fissa dal davanzale, senza fretta: lui lo sapeva già.',
  'Vi apre una donna con la candela in mano. Ascolta, scuote il capo: «Vi hanno mandato all’indirizzo sbagliato.» E richiude, gentile.',
  'Il custode notturno alza la lanterna: «A quest’ora? Provate domani.» Dietro di lui, solo corridoi spenti.',
  'Nessuno risponde. Dalla serratura, l’odore di una casa che dorme davvero — non di una che finge.',
];
export function dichiaraVoce(ep, comune, nomeVoce) {
  const luogo = ep.luoghi.find((l) => norm(l.voce_mappa) === norm(nomeVoce));
  if (luogo) return { tipo: 'visita', luogo };
  const idx = Math.floor(Math.random() * PISTE_FREDDE.length);
  return { tipo: 'fredda', frase: PISTE_FREDDE[idx] };
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
export function tierIndagine(ep, ind) {
  // Le visite gratuite (Carla, Marani) non toccano l'orologio: le ore
  // avanzate sono semplicemente quelle non barrate sul Taccuino. La frase
  // del Regolamento "non conta come ora avanzata" dice solo che la visita
  // gratis non ne AGGIUNGE una - niente sconti punitivi qui.
  const oreAvanzate = 24 - ind.ora;
  const luoghi = ind.visitati.length;
  const v = ep.vantaggio || { slancio_ore: 3, slancio_luoghi: 99, preparati_ore: 1, preparati_luoghi: 99 };
  let tier = 'nessuno';
  if (oreAvanzate >= v.slancio_ore || luoghi >= v.slancio_luoghi) tier = 'slancio';
  else if (oreAvanzate >= v.preparati_ore || luoghi >= v.preparati_luoghi) tier = 'preparati';
  return { tier, oreAvanzate, luoghi, dossier: oreAvanzate === 0 };
}

// --- mazzo Minaccia --------------------------------------------------------
export function costruisciMazzo(carte, ep, epId) {
  let pool = carte.minacce[epId] || [];
  if (epId === 'preludio') {
    const nomi = new Set((ep.mazzo_da_ep1 || []).map(norm));
    pool = carte.minacce.ep1.filter((c) => nomi.has(norm(c.title.split('—').pop())));
  }
  // le carte Bivio (Segugi del Coro) restano fuori: entrano solo se il
  // Bivio dell'episodio precedente lo dice (W-D, campagna)
  pool = pool.filter((c) => !c.title.startsWith('Bivio'));
  const ordine = pool.map((_, i) => i);
  for (let i = ordine.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  }
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

export function pesca(mazzo, carte, epId, ep) {
  if (mazzo.indice >= mazzo.ordine.length) {
    // rimescola gli scarti (regola vera)
    for (let i = mazzo.ordine.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazzo.ordine[i], mazzo.ordine[j]] = [mazzo.ordine[j], mazzo.ordine[i]];
    }
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
// da chiamare a fine round; ritorna gli annunci da mostrare
export function fineRound(comune, ep, sped) {
  sped.round += 1;
  const annunci = [];
  const ogni = ep.marea ? ep.marea.ogni : comune.regole.tick_canto_ogni;
  const soglia = ep.marea ? ep.marea.soglia : comune.regole.soglia_canto;
  const nome = ep.marea ? 'Marea' : 'Canto';
  if (sped.round % ogni === 0) {
    sped.canto += 1;
    annunci.push(`Fine del ${sped.round}° round: +1 segnalino ${nome} (${sped.canto}).`);
    if (sped.canto === soglia) {
      if (ep.marea) annunci.push(ep.marea.effetto + ' Da ora in poi.');
      else {
        sped.cantoBonus = true;
        annunci.push(`Il ${nome} raggiunge ${soglia}: ${ep.soluzione.boss ? 'il boss si desta sulla tessera più lontana dagli eroi, e ' : ''}da ora ogni Fase Minaccia pesca 1 carta in più — per sempre.`);
      }
    }
  }
  return annunci;
}

// segnalino Canto da carta crescendo (il testo lo dice): stessa soglia
export function cantoDaCarta(comune, ep, sped) {
  sped.canto += 1;
  const soglia = comune.regole.soglia_canto;
  const annunci = [`Segnalino Canto: ${sped.canto}.`];
  if (sped.canto === soglia && !sped.cantoBonus) {
    sped.cantoBonus = true;
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

// --- URL degli asset ----------------------------------------------------
// mirror di cardDiskPath (scripts/cardconjurer/lib.js): il campo `file`
// delle carte -> percorso jpg sotto /assets.
export function urlCarta(file) {
  const i = file.indexOf('/');
  const bucket = file.slice(0, i);
  const rest = file.slice(i + 1);
  let p;
  if (bucket.startsWith('Episodio')) p = `${bucket}/cards/${rest}`;
  else if (bucket === 'Preludio') p = `Preludio/cards/${rest}`;
  else p = `Comune/cards/${file}`;
  return encodeURI(`/assets/${p}.jpg`).replace(/["<>]/g, '');
}

// arte grezza (campo art: 'artworks/x.png' oppure solo 'x.png')
export function urlArt(art) {
  if (!art) return null;
  const nome = art.startsWith('artworks/') ? art.slice(9) : art;
  return encodeURI(`/assets/artworks/${nome}`);
}

// carta Luogo (jpg renderizzato) e arte del luogo per numero
export function cartaLuogo(carte, epId, n) {
  const lista = carte.luoghi_carte[epId] || [];
  return lista.find((c) => c.title.startsWith(`${n} ·`) || c.title.startsWith(`P${String(n).replace('P', '')} ·`)) || null;
}

export function cartaApprofondimento(carte, epId, soggetto) {
  const lista = carte.approfondimenti_carte[epId] || [];
  const s = norm(soggetto);
  return lista.find((c) => norm(c.title).includes(s)) || null;
}

export function cartaOggetto(carte, epId, nome) {
  const tutte = [...(carte.oggetti_carte[epId] || []), ...(carte.oggetti_carte.preludio || [])];
  const s = norm(nome);
  return tutte.find((c) => norm(c.title) === s || norm(c.title).includes(s)) || null;
}
