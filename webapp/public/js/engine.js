// LA VISTA DELLE REGOLE. Il motore vero e' passato in `motore/regole.js`, puro
// e isomorfo: nessuna prosa, nessun URL, i dadi passati da fuori. Qui resta
// cio' che appartiene allo SCHERMO e che in un Durable Object non servirebbe a
// nessuno — l'html-lite dei dati, le frasi delle piste fredde, i percorsi dei
// jpg — piu' un re-export di tutto il resto, cosi' `indagine.js`,
// `digitale.js` continua a importare da qui senza cambiare
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

// --- le piste fredde: le righe di colore per chi dichiara una voce che in
// questo episodio non c'e'. Il motore dice solo che la pista e' fredda; quale
// frase leggere e' una scelta di scena, e sta qui.
//
// UNA PORTA NON C'E' SEMPRE. Fino al 23/09/2026 le frasi erano cinque, tutte
// con un uscio a cui bussare: «il portone è sprangato», «nessuno risponde».
// Ma sulla mappa ci sono 127 voci, e un terzo non ha porte — il Cimitero
// Nuovo, il Molo in Disarmo, il Canale Basso, Calle del Marmo — piu' cinque
// piste dell'Ep.17/18 che non sono nemmeno posti (una carta, una matrice, il
// Membro Interno). Al tavolo si leggeva «bussate, vi apre una donna» davanti a
// un camposanto. Ogni tipo ha le sue.
const PISTE_FREDDE = {
  edificio: [
    'Bussate. Una finestra si illumina, qualcuno scosta una tenda — poi il buio di nuovo. Qui non c’è nulla per voi, stanotte.',
    'Il portone è sprangato da prima del tramonto. Un gatto vi fissa dal davanzale, senza fretta: lui lo sapeva già.',
    'Vi apre una donna con la candela in mano. Ascolta, scuote il capo: «Vi hanno mandato all’indirizzo sbagliato.» E richiude, gentile.',
    'Il custode notturno alza la lanterna: «A quest’ora? Provate domani.» Dietro di lui, solo corridoi spenti.',
    'Nessuno risponde. Dietro la porta il respiro lento di chi dorme davvero: qui, stanotte, non è successo niente.',
  ],
  sepolcro: [
    'Il cancello è accostato, la ghiaia intatta: dopo la pioggia non è passato nessuno. I vostri sono gli unici passi della notte.',
    'Lanterne spente in fondo ai viali. Leggete due lapidi, tanto per fare, e non vi dicono niente che non sappiate già.',
    'Dove pensavate che la terra fosse smossa, è compatta da mesi. Qui nessuno ha scavato, e nessuno ha seppellito.',
    'Un becchino vi guarda da lontano, appoggiato al badile, e non si avvicina nemmeno: sa riconoscere chi cerca la persona sbagliata.',
  ],
  acqua: [
    'L’acqua batte piano contro la pietra. Nessuna barca ormeggiata, nessuna voce: solo la corrente, che non ha niente da dirvi.',
    'Le bitte sono fredde e le cime asciutte da giorni: qui, stanotte, non ha attraccato nessuno.',
    'Un fanale ondeggia lontano sull’acqua e si allontana. Restate a guardarlo sparire senza aver saputo niente.',
    'Nella melma sotto la riva c’è di tutto, e niente che vi riguardi. Vi pulite le mani e tornate indietro.',
  ],
  strada: [
    'Fate il giro due volte. Finestre chiuse, nessuna insegna, e un ubriaco che dorme dove è caduto: non c’è altro.',
    'La pietra è bagnata e vuota. Uno passa in fondo e cambia strada appena vi vede — ma è prudenza, non un segreto.',
    'Il vostro passo torna indietro dai muri, e basta. Qui, stanotte, non vi aspetta nessuno.',
    'Cercate a terra sotto il lampione: cicche, un bottone, l’acqua che scende. Niente che valga un’ora.',
  ],
  // le piste che non sono un posto: una carta, una matrice, un nome
  altro: [
    'Ci ragionate sopra a lungo, e non porta da nessuna parte: stanotte non si passa di lì.',
    'Il filo che credevate di avere in mano si spezza subito. Vi restano quelli di prima.',
    'Ne parlate fra voi, e detta a voce alta l’idea non regge: è un sospetto, non una traccia.',
  ],
};

// CHE COS'E' QUESTA VOCE? Il nome basta a dirlo, e nessun dato nuovo da tenere
// allineato su 127 righe di mappa. L'ORDINE CONTA: l'edificio per primo, o
// «Taverna del Ponte Rotto» finirebbe fra i ponti e «La Casa della Corte» fra
// i cortili — hanno una porta tutt'e due.
const TIPI_VOCE = [
  ['edificio', /casa|villa|palazzo|bottega|archivio|studio|ufficio|taverna|osteria|locanda|pensione|caffe|teatro|chiesa|cattedrale|parrocchia|curia|campanile|torre|tribunale|prefettura|cancelleria|gendarmeria|banco|monte di|deposito|magazzino|fornitura|mulino|molino|fonderie|lavatoio|stazione|ospedale|mercato|dogana|laboratorio|ridotto|aula|scriptorium|loggia|corpo di guardia|camera|ingresso|rifugio|covo|attico|stanza|vano|catasto|gazzetta|carbonaia|cantiere|fioraio|ricettatore|registro|fermo.posta|contabilita/],
  ['sepolcro', /cimitero|ossario|tomba|camposanto/],
  ['acqua', /molo|moli\b|canale|chiusa|porta d.acqua|porto|banchina|darsena|barche/],
  ['strada', /vicolo|calle|corte\b|contrada|ponte|gola|sagrato|scala|piazza|cortile|pozzo/],
];

export function tipoVoce(nome) {
  // `norm` toglie accenti e punteggiatura ma ALZA le maiuscole: qui si cerca
  // per parole, quindi si riabbassa
  const n = norm(nome).toLowerCase();
  // «Il Cimitero delle Barche» e' un cimitero di BARCHE: si affaccia sull'acqua
  if (/cimitero delle barche/.test(n)) return 'acqua';
  for (const [tipo, re] of TIPI_VOCE) if (re.test(n)) return tipo;
  return 'altro';
}

// Ponte verso la RNG seminata: finche' la partita non porta il proprio
// generatore, se ne tiene uno per sessione. Non e' riproducibile — e' il
// motivo per cui deve sparire — ma almeno il caso passa tutto da un posto solo.
const rngPonte = creaRng((Date.now() ^ 0x5f3759df) >>> 0);

export function dichiaraVoce(ep, comune, nomeVoce) {
  const out = _dichiaraVoce(ep, comune, nomeVoce);
  if (out.tipo !== 'fredda') return out;
  const mazzo = PISTE_FREDDE[tipoVoce(nomeVoce)] || PISTE_FREDDE.altro;
  return { ...out, frase: mazzo[interoFino(rngPonte, mazzo.length)] };
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

// LA CARTA GRANDE. La cartella del `file` dice il tipo, il tipo dice il dorso
// (`dorso-<tipo>` in app.css): con quello la carta si rivela girandosi nell'aria
// (carta3d.js). Senza una cartella-tipo riconosciuta esce piatta, come prima.
// Niente `style=` qui dentro: schermataCarta confronta l'html generato con
// `app.innerHTML`, e il browser riscrive gli attributi style. Le classi no.
const DORSO = { Luoghi: 'luogo', Oggetti: 'oggetto', Minacce: 'minaccia', Nemici: 'nemico',
  Indizi: 'indizio', Referti: 'referto', Testimoni: 'testimone', Eroi: 'eroe' };
export function cartaGrande(file, extra = '') {
  const d = DORSO[file.split('/').slice(-2, -1)[0]];
  const img = `<img src="${urlCarta(file)}" alt="">`;
  const cls = extra ? ` ${extra}` : '';
  if (!d) return `<div class="carta-grande${cls}">${img}</div>`;
  // l'ombra PRIMA del c3d nel markup: sono entrambi positioned con z-index
  // auto, e a parita' di z-index vince l'ordine nel DOM — dopo, l'ombra nera
  // sfocata (opacity .55) dipingeva SOPRA la carta invece che dietro,
  // scurendola tutta (visto per la prima volta il 19/09/2026, sul Preludio).
  return `<div class="carta-grande carta3d${cls}"><div class="c3d-ombra"></div><div class="c3d">${'<span class="c3d-fetta"></span>'.repeat(6)}${img}<div class="c3d-retro dorso-${d}"></div></div></div>`;
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
