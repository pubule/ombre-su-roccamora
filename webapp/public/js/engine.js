// LA VISTA DELLE REGOLE. Il motore vero e' passato in `motore/regole.js`, puro
// e isomorfo: nessuna prosa, nessun URL, i dadi passati da fuori. Qui resta
// cio' che appartiene allo SCHERMO e che in un Durable Object non servirebbe a
// nessuno — l'html-lite dei dati, le frasi delle piste fredde, i percorsi dei
// jpg — piu' un re-export di tutto il resto, cosi' `indagine.js`,
// `spedizione.js` e `digitale.js` continuano a importare da qui senza cambiare
// una riga.
//
// Le tre funzioni che tiravano a caso (dichiaraVoce, costruisciMazzo, pesca)
// tengono la firma di prima e ricevono un generatore di comodo: e' un ponte,
// e sparisce quando la partita avra' la sua RNG (Fase 1, Task 9 del
// PIANO-MOTORE-PURO.md). Da oggi pero' i dadi vengono da li' e non piu' da
// Math.random.
export * from '../motore/regole.js';

import { dichiaraVoce as _dichiaraVoce, costruisciMazzo as _costruisciMazzo,
         pesca as _pesca, norm } from '../motore/regole.js';
import { creaRng, interoFino } from '../motore/rng.js';

// --- html-lite dei dati (solo <b> <i> <br> sopravvivono, il resto e' escapato)
export function rendi(testo) {
  const escd = String(testo || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escd
    .replace(/&lt;(\/?)(b|i|br)\s*\/?&gt;/gi, '<$1$2>')
    .replace(/\{i\}/g, '<i>').replace(/\{\/i\}/g, '</i>')
    .replace(/\{divider\}/g, '<hr class="divisore">');
}

// --- le piste fredde: cinque righe di colore per chi dichiara una voce che in
// questo episodio non c'e'. Il motore dice solo che la pista e' fredda; quale
// frase leggere e' una scelta di scena, e sta qui.
const PISTE_FREDDE = [
  'Bussate. Una finestra si illumina, qualcuno scosta una tenda — poi il buio di nuovo. Qui non c’è nulla per voi, stanotte.',
  'Il portone è sprangato da prima del tramonto. Un gatto vi fissa dal davanzale, senza fretta: lui lo sapeva già.',
  'Vi apre una donna con la candela in mano. Ascolta, scuote il capo: «Vi hanno mandato all’indirizzo sbagliato.» E richiude, gentile.',
  'Il custode notturno alza la lanterna: «A quest’ora? Provate domani.» Dietro di lui, solo corridoi spenti.',
  'Nessuno risponde. Dalla serratura, l’odore di una casa che dorme davvero — non di una che finge.',
];

// Ponte verso la RNG seminata: finche' la partita non porta il proprio
// generatore, se ne tiene uno per sessione. Non e' riproducibile — e' il
// motivo per cui deve sparire — ma almeno il caso passa tutto da un posto solo.
const rngPonte = creaRng((Date.now() ^ 0x5f3759df) >>> 0);

export function dichiaraVoce(ep, comune, nomeVoce) {
  const out = _dichiaraVoce(ep, comune, nomeVoce);
  if (out.tipo !== 'fredda') return out;
  return { ...out, frase: PISTE_FREDDE[interoFino(rngPonte, PISTE_FREDDE.length)] };
}

export const costruisciMazzo = (carte, ep, epId, bivi) => _costruisciMazzo(rngPonte, carte, ep, epId, bivi);
export const pesca = (mazzo, carte, epId, ep) => _pesca(rngPonte, mazzo, carte, epId, ep);

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
