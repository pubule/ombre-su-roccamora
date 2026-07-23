// Misura un episodio giocandolo davvero in modalità digitale (Playwright).
//
// Non è un test: è lo strumento con cui si misurano le domande di bilanciamento
// sul gioco vero, invece che sul simulatore — che astrae il movimento ed è
// quindi cieco su tutto ciò che riguarda distanze, porte e ingombri.
//
// COLLAUDA SE STESSO. Ogni azione è verificata sullo stato e la corsa si
// dichiara NON VALIDA se qualcosa non torna, invece di produrre percentuali che
// sembrano dati sul gioco e sono dati sul pilota. Errori già trovati così:
//   - senza attendere la fine dell'animazione nemici si legge `vistaNemici`,
//     che non ha la striscia degli eroi: ogni misura risultava «non misurata»;
//   - il click di Playwright su una cella fuori viewport fallisce e sembrava
//     «nessuna mossa utile»: si clicca dal DOM;
//   - un'abilità che il gioco rifiuta (Brera senza truppa, Carla senza nemici a
//     portata) non è un click perso: va distinta da un'azione andata a vuoto.
//
// Il pilota NON bara: dell'uscita segreta conosce la stanza (come i giocatori),
// non l'arredo giusto — prova quelli non ancora tentati leggendo `uscitaTentati`.
//
// Uso: node webapp/server.js ; node webapp/misura-episodio.mjs [epN] [partite]
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8017';
const EPID = (process.argv[2] || 'ep1').replace(/[^a-z0-9]/gi, '');
const N = Number(process.argv[3]) || 10;
const EP = JSON.parse(fs.readFileSync(`webapp/data/${EPID}.json`, 'utf8'));
const CHIAVE_SALVATAGGIO = `osr.partita.${EPID}`;
// esito d'Indagine da simulare: 'slancio' (ottimo), 'preparati' (medio),
// 'nessuno' (indagine fallita). Cambia la Salute massima e il 1o round.
const TIER = process.env.INDAGINE || 'preparati';
// la tessera dove cercare l'oggetto che apre la cella, se l'episodio ne ha uno
const TILE_CHIAVE = (SC0 => (SC0 && SC0.chiave ? 'T4' : null))((EP.scortato || [])[0]);

const USCITE = {};
for (const t of EP.tessere) {
  USCITE[t.id] = Object.fromEntries(Object.entries(t.exits || {}).map(([d, r]) => [d, String(r).split(/\s/)[0]]));
}
function dirVerso(da, a) {
  if (da === a) return null;
  const pr = { [da]: null }; const q = [da];
  while (q.length) {
    const c = q.shift();
    for (const [d, dest] of Object.entries(USCITE[c] || {})) {
      if (dest in pr) continue;
      pr[dest] = { c, d };
      if (dest === a) { let n = dest; while (pr[n] && pr[n].c !== da) n = pr[n].c; return pr[n].d; }
      q.push(dest);
    }
  }
  return null;
}
const dist = (a, b) => { let n = 0, c = a; while (c !== b && n < 12) { const d = dirVerso(c, b); if (!d) return 99; c = USCITE[c][d]; n++; } return n; };
const verso = (d, x, y) => ({ N: 3 - y, S: y, E: 3 - x, O: x }[d] ?? 0);
// cella-porta verso una direzione (prima libera da arredi) — replica di
// portaCella in digitale.js. Serve come varco di fallback quando la direzione
// dritta e' bloccata dagli arredi interni.
function portaCellaP(tileId, dir) {
  const t = EP.tessere.find((x) => x.id === tileId);
  const occ = new Set((t?.arredi || []).map(([gx, gy]) => `${gx},${3 - gy}`));
  const pref = [1, 2, 0, 3]; let idx = 1;
  for (const i of pref) {
    const key = (dir === 'N' || dir === 'S') ? `${i},${dir === 'N' ? 0 : 3}` : `${dir === 'O' ? 0 : 3},${i}`;
    if (!occ.has(key)) { idx = i; break; }
  }
  if (dir === 'N') return [idx, 3];
  if (dir === 'S') return [idx, 0];
  if (dir === 'E') return [3, 3 - idx];
  return [0, 3 - idx];
}
const SC = (EP.scortato || [])[0];
const COMPITI = EP.compiti || [];
const cellaObj = (mt) => {
  if (!SC || SC.tile !== mt || !SC.cella) return null;
  const t = EP.tessere.find((x) => x.id === mt);
  const a = (t?.arredi || []).find((v) => String(v[2]).toUpperCase() === SC.cella.toUpperCase());
  return a ? [a[0], a[1]] : null;
};
// cella da raggiungere dentro la tessera-meta: l'arredo del compito aperto, se
// il dato lo nomina — altrimenti l'eroe girava per la stanza senza mai essere
// adiacente alla cosa da fare
function cellaCompito(mt) {
  const c = COMPITI.find((x) => x.tile === mt && x.cella);
  if (!c) return null;
  const t = EP.tessere.find((x) => x.id === mt);
  const a = (t?.arredi || []).find((v) => String(v[2]).toUpperCase() === String(c.cella).toUpperCase());
  return a ? [a[0], a[1]] : null;
}
function score(c, mt) {
  const d = dist(c.t, mt) * 100; const o = cellaObj(mt) || cellaCompito(mt);
  if (c.t === mt) return d + (o ? Math.abs(o[0] - c.x) + Math.abs(o[1] - c.y) : 0);
  const dir = dirVerso(c.t, mt);
  return d + (dir ? verso(dir, c.x, c.y) : 0);
}
const breve = (n) => n.split(' ')[0].replace(/["“”.]/g, '');
// l'ultima tessera della spina: dove compare il boss
const TILE_BOSS = EP.tessere[EP.tessere.length - 1].id;

// la stanza dell'uscita NON e' sempre quella della prigionia: nell'Ep.1
// coincidono, nell'Ep.2 il PNG e' in T5 ma il condotto e' in T6 (oltre il
// boss). Puntare la stanza sbagliata faceva sembrare 0 vittorie un dato di
// gioco, mentre era il pilota che non ci andava mai.
// Episodi SENZA PNG da scortare (Ep.10, 12, 20...): la meta e' semplicemente
// il fondo della spina. Prima il pilota dava per scontato `EP.scortato[0]` e
// si rompeva prima di cominciare, e per questo quegli episodi risultavano
// «non misurabili sulla plancia» — non lo erano: mancava il caso nel pilota.
const USCITA_TILE = SC ? ((SC.uscita && SC.uscita.tile) || (SC.parte_libero ? SC.meta : SC.tile))
  : TILE_BOSS;   // chi parte libero (Ep.9) va PORTATO avanti, non riportato indietro
const _tu = EP.tessere.find((t) => t.id === USCITA_TILE) || {};
const ARREDI_USCITA = (_tu.arredi || []).filter((a) => String(a[2]).toUpperCase() !== 'CELLA');
function scoreArredi(c, tentati) {
  const cand = ARREDI_USCITA.filter((a) => !tentati.includes(`${a[0]},${a[1]}`));
  if (!cand.length) return dist(c.t, USCITA_TILE) * 100;
  // la distanza in TESSERE deve pesare: con un piatto 100 per tutte, una casella
  // ben allineata di una tessera piu' lontana batteva una casella mal allineata
  // di quella giusta, e l'eroe indietreggiava (visto nell'Ep.2: da T5 tornava a T4)
  if (c.t !== USCITA_TILE) { const d = dirVerso(c.t, USCITA_TILE); return dist(c.t, USCITA_TILE) * 100 + (d ? verso(d, c.x, c.y) : 0); }
  return Math.min(...cand.map((a) => Math.abs(a[0] - c.x) + Math.abs(a[1] - c.y)));
}

const comune = await (await fetch(BASE + '/data/comune.json')).json();
const statNem = (nome) => comune.nemici.find((x) => x.nome === nome) || {};
const SOGLIA_CANTO = comune.regole.soglia_canto;
// le abilità a cariche, con la sola informazione che serve al pilota per
// giudicare quando valgono (specchio di CARICHE_SPED in digitale.js)
const CARICHE = [
  { key: 'ATTILIO', eff: 'cura' }, { key: 'SIBILLA', eff: 'scruta' }, { key: 'SERRA', eff: 'presenza' },
  { key: 'CARLA', eff: 'flash' }, { key: 'CARBONE', eff: 'presenza' }, { key: 'FANTI', eff: 'diversivo' },
  { key: 'MARANI', eff: 'litania' }, { key: 'BRERA', eff: 'malacarne' },
];
const vicino = (a, b, d = 1) => !!a && !!b && a.t === b.t && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= d;

// Chi colpire fra gli adiacenti. Finire un nemico a una ferita dalla morte
// toglie un attaccante dal round dopo: è la scelta che un tavolo fa sempre.
// nomi dei nemici che un compito chiede di PRENDERE, non di abbattere: il
// Corriere, il Primo Gatto, il Caposquadra, il Notaio, Vidal. Ucciderli e' il
// modo piu' rapido di perdere l'episodio, e il pilota lo faceva.
const daCatturare = (s) => new Set(COMPITI
  .filter((c) => c.nemico && ((s.compiti || {})[c.id] || 0) < c.quante)
  .map((c) => c.nemico));

function bersaglio(s, pos) {
  const salva = daCatturare(s);
  const adj = s.nemici.map((n, i) => ({ n, i }))
    .filter(({ n }) => vicino(n.pos, pos) && !salva.has(n.nome));
  if (!adj.length) return -1;
  const peso = ({ n }) => { const st = statNem(n.nome); return (n.ferite >= n.max - 1 ? -100 : 0) + (st.boss ? -10 : 0) - (st.dan || 0); };
  return adj.slice().sort((a, z) => peso(a) - peso(z))[0].i;
}

// Un'abilità vale la pena solo al suo momento: il pilota la giudica invece di
// bruciarla appena il bottone compare.
function abilitaUtile(nm, s) {
  const c = CARICHE.find((k) => nm.includes(k.key)); if (!c) return false;
  const pos = s.eroiPos[nm];
  const entro2 = s.nemici.filter((n) => vicino(n.pos, pos, 2));
  if (c.eff === 'litania') return s.canto >= SOGLIA_CANTO - 1;
  if (c.eff === 'cura') {
    if ((s.vite[nm] ?? 0) > 0 && (s.vite[nm] ?? 0) <= 2) return true;
    return Object.entries(s.vite).some(([x, v]) => x !== nm && v > 0 && v <= 2 && vicino(s.eroiPos[x], pos));
  }
  if (c.eff === 'flash') return entro2.some((n) => statNem(n.nome).boss || (statNem(n.nome).dan || 0) >= 2);
  if (c.eff === 'malacarne') return s.nemici.some((n) => n.pos && /malavita|cultista|cane/i.test(statNem(n.nome).tipo || ''));
  if (c.eff === 'diversivo') return s.round >= 3;
  if (c.eff === 'scruta') return true;
  return entro2.length > 0;                      // Voce ferma / Esca: solo col nemico addosso
}

const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: 1400, height: 1000 } });
await pg.addInitScript(() => {
  window.confirm = () => true; window.alert = () => {};
  // ZERO ATTESE. Il costo vero non erano i miei sleep: e' la fase nemici, che
  // anima — `await pausa(650)` per ogni nemico che si muove, 1050 quando
  // colpisce, 1100 se e' accecato. Con dieci nemici sono dieci secondi a round
  // di sola animazione. Qui i timer della pagina scattano subito: il gioco fa
  // esattamente le stesse cose, nello stesso ordine (i timeout a pari ritardo
  // restano FIFO), solo senza aspettare. Il motore non viene toccato.
  const vero = window.setTimeout;
  window.setTimeout = (fn, _ms, ...a) => vero(fn, 0, ...a);
  // e le animazioni vere e proprie: transizioni CSS e frame. Senza queste il
  // token "scivola" ancora da una casella all'altra e il pilota legge stati
  // intermedi.
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = (fn) => raf(() => fn(performance.now()));
  const stile = () => {
    if (!document.head || document.getElementById('senza-animazioni')) return;
    const st = document.createElement('style'); st.id = 'senza-animazioni';
    st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
    document.head.appendChild(st);
  };
  document.addEventListener('DOMContentLoaded', stile); stile();
});
const errsJS = []; pg.on('pageerror', (e) => errsJS.push(e.message));

const P = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k)), CHIAVE_SALVATAGGIO);
const sp = async () => (await P()).spedizione;
const cnt = (s) => pg.locator(s).count();
const vis = async (s) => (await cnt(s)) > 0 && await pg.locator(s).first().isVisible().catch(() => false);
const clicDom = (s) => pg.evaluate((sel) => {
  const e = document.querySelectorAll(sel); if (!e.length) return false;
  e[0].click(); return true;
}, s);

// Attesa condizionata invece che a tempo: il pilota dormiva 4.8 secondi a giro
// su 16 `waitForTimeout` fissi, tarati sul caso peggiore dell'animazione. Qui
// si guarda venticinque volte al secondo se la cosa e' successa, e si prosegue
// appena lo e'. Il tetto resta, come rete.
async function finoA(cond, max = 1200) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    try { if (await cond()) return true; } catch { /* render in corso */ }
    // nessuna pausa: il round-trip di Playwright e' gia' la nostra granularita'
  }
  return false;
}
const cambiato = async (letto, prima) => finoA(async () => JSON.stringify(await letto()) !== prima);
// clicca APPENA l'elemento compare: i gestori del gioco sono async, quindi fra
// un click e il successivo il DOM deve essersi ridisegnato — ma aspettare a
// tempo e' sprecato: si guarda finche' c'e', poi si clicca.
const clicQuando = async (sel, max = 4000) =>
  (await finoA(() => vis(sel), max)) ? clicDom(sel) : false;

let roundNonMisurati = 0;
const KO = {};
const ko = (m) => { KO[m] = (KO[m] || 0) + 1; };
const azioniKOtot = () => Object.values(KO).reduce((a, b) => a + b, 0);

async function scegliEroe() {
  const v = (await sp()).vite;
  const b = await pg.$$eval('.scelta-overlay .scelta-btn', (e) => e.map((x, i) => ({ i, t: x.textContent.trim().toLowerCase() })));
  const u = b.filter((x) => x.t !== 'annulla');
  if (!u.length) return clicDom('.scelta-overlay .scelta-btn');
  const tit = await pg.$eval('.scelta-overlay h3', (e) => e.textContent.toLowerCase()).catch(() => '');
  // la cura va al più malmesso, non al primo della lista: le etichette portano
  // la Salute fra parentesi («attilio (2)»)
  const sal = /curare/.test(tit)
    ? (x) => -(Number((x.t.match(/\((\d+)\)/) || [])[1] ?? 99))
    : (x) => { const e = Object.entries(v).find(([k]) => breve(k).toLowerCase() === x.t); return e ? e[1] : 0; };
  const scelto = u.slice().sort((a, z) => sal(z) - sal(a))[0];
  await pg.evaluate((i) => document.querySelectorAll('.scelta-overlay .scelta-btn')[i].click(), scelto.i);
  
}
const sciogli = async () => {
  // UN SOLO round-trip per giro. Prima erano dieci: `vis()` costa due chiamate
  // (conteggio + visibilita') e i bottoni da controllare sono cinque. Qui la
  // scelta e il click li fa la pagina, e torna solo che cosa ha premuto.
  for (let k = 0; k < 60; k++) {
    if (await vis('.scelta-overlay')) { await scegliEroe(); continue; }
    const premuto = await pg.evaluate(() => {
      const visibile = (e) => e && e.offsetParent !== null;
      for (const sel of ['#dadi-lancia', '#dadi-chiudi', '#ins-risolvi:not([disabled])', '#ok-msg']) {
        const e = document.querySelector(sel);
        if (visibile(e)) { e.click(); return sel; }
      }
      return document.querySelector('.dadi-overlay') ? 'attesa' : null;
    });
    if (premuto === null) return;
    if (premuto === 'attesa' && !(await finoA(async () => !(await vis('.dadi-overlay')), 800))) return;
  }
};
// la fase nemici è animata e la sua schermata non ha la striscia eroi
async function attendiFaseEroi(maxMs = 60000) {
  const t0 = Date.now();
  let statoEroiDa = 0;
  while (Date.now() - t0 < maxMs) {
    await sciogli();
    const s = await sp();
    if (s.esito) return true;
    if (s.fase === 'eroi' && (await cnt('[data-turno]')) > 0) return true;
    // se la fase nemici e' finita ma la vista non ha ancora la striscia eroi,
    // un pungolo (skip nemici / fase minaccia) la fa avanzare; con molti nemici
    // in cella l'animazione e' la piu' lunga e il tetto scadeva
    if (await cnt('#salta-nemici')) await clicDom('#salta-nemici');
    if (await vis('#fase-minaccia')) await clicDom('#fase-minaccia');
    // lo STATO e' gia' 'eroi' ma il DOM non ha la striscia: il render si e'
    // perso. Ricarico la pagina, che rimonta la vista dallo stato salvato —
    // era l'ultimo residuo di «fase eroi mai arrivata» sotto carico.
    if (s.fase === 'eroi') {
      if (!statoEroiDa) statoEroiDa = Date.now();
      else if (Date.now() - statoEroiDa > 1500) {
        await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
        await finoA(async () => (await cnt('[data-turno]')) > 0 || (await sp()).esito, 5000);
        statoEroiDa = 0;
      }
    } else statoEroiDa = 0;
    await finoA(async () => { const x = await sp(); return x.esito || (x.fase === 'eroi'); }, 400);
  }
  return false;
}
async function meta() {
  const p = await P(); const s = p.spedizione;
  // PNG liberato: dove portarlo? Se c'e' un'uscita segreta, li'. Altrimenti la
  // META DI RITORNO dichiarata (SC.meta, di norma T1) — NON USCITA_TILE, che per
  // il ritorno classico vale la tessera-prigione (l'Ep.7 mandava tutti a T6,
  // dov'era la cella, e Fava non tornava mai a casa: tutti vivi, 0 vittorie).
  if ((s.scortati || [])[0]?.liberato) return SC.uscita ? USCITA_TILE : (SC.meta || USCITA_TILE);
  // OBIETTIVI D'EPISODIO (ep.compiti): prima la tessera dove si lavora, poi il
  // rientro dichiarato da ep.vittoria. Senza questo il pilota andava in fondo
  // alla spina e ci restava, perche' non sapeva che si torna indietro.
  if (COMPITI.length) {
    const fatti = s.compiti || {};
    const aperti = COMPITI.filter((c) => (fatti[c.id] || 0) < c.quante
      && !(c.dopo && (fatti[c.dopo] || 0) < (COMPITI.find((x) => x.id === c.dopo) || {}).quante));
    // compito su una MINIATURA (agganciare il Corriere, catturare il Gatto): la
    // meta e' dove sta quel nemico adesso, non una stanza fissa
    const suNemico = aperti.find((c) => c.nemico);
    if (suNemico) {
      const n = (s.nemici || []).find((x) => x.pos && x.nome === suNemico.nemico);
      if (n) return n.pos.t;
    }
    const aperto = aperti.find((c) => c.tile);
    if (aperto) return aperto.tile;
    if (EP.vittoria && EP.vittoria.tessera) return EP.vittoria.tessera;
  }
  if (!SC) return TILE_BOSS;                           // nessun PNG: dritti in fondo alla spina
  if (!TILE_CHIAVE) return SC.tile;                    // nessuna chiave: dritti dal prigioniero
  const k = (p.indagine.oggetti || []).some((o) => new RegExp(SC.chiave, 'i').test(o));
  return (!k && !s.cercate?.[TILE_CHIAVE]) ? TILE_CHIAVE : SC.tile;
}
const celle = () => pg.$$eval('.cella-mossa', (e) => e.map((x) => ({ t: x.dataset.t, x: +x.dataset.x, y: +x.dataset.y })));
const clicCella = (b) => pg.evaluate(({ t, x, y }) => {
  const el = document.querySelector(`.cella-mossa[data-t="${t}"][data-x="${x}"][data-y="${y}"]`);
  if (!el) return false; el.click(); return true;
}, b);
async function muoviCon(punteggio, chiPos, leggiPos) {
  const c = await celle(); if (!c.length) return 'nessuna-cella';
  const b = c.slice().sort((a, z) => punteggio(a) - punteggio(z))[0];
  if (punteggio(b) >= punteggio(chiPos)) return 'nessun-progresso';
  if (!(await clicCella(b))) { ko('click sulla cella non riuscito'); return 'click-ko'; }
   await sciogli();
  const dopo = await leggiPos();
  if (!dopo || (dopo.t === chiPos.t && dopo.x === chiPos.x && dopo.y === chiPos.y)) { ko('cella cliccata ma pedina ferma'); return 'non-mosso'; }
  return 'mosso';
}

async function turnoEroe(nm, mt, party) {
  await pg.evaluate((n) => document.querySelector(`[data-turno="${CSS.escape(n)}"]`)?.click(), nm);
  
  const tentate = new Set();
  for (let k = 0; k < 5; k++) {
    const s = await sp();
    if (s.esito || (s.vite[nm] ?? 0) <= 0 || (s.eroiFatti || []).includes(nm)) return;
    const fatte = s.azioni[nm] || []; const pos = s.eroiPos[nm];
    const lib = (t) => !fatte.includes(t) && !tentate.has(t);
    const prima = JSON.stringify(fatte);
    let tipo = null;
    if (lib('interagire') && await vis('#az-interagire')) { tipo = 'interagire'; await clicDom('#az-interagire'); await sciogli(); }
    else if (lib('cercare') && TILE_CHIAVE && pos.t === TILE_CHIAVE && !s.cercate?.[TILE_CHIAVE] && await vis('#az-cercare')) { tipo = 'cercare'; await clicDom('#az-cercare'); await sciogli(); }
    else if (lib('rianimare') && (s.vite[nm] ?? 0) >= 3 && await vis('#az-rianimare')) { tipo = 'rianimare'; await clicDom('#az-rianimare'); await sciogli(); }
    else if (lib('oggetto') && bersaglio(s, pos) >= 0 && await vis('#az-oggetto')) { tipo = 'oggetto'; await clicDom('#az-oggetto'); await sciogli(); }
    else if (lib('abilita') && abilitaUtile(nm, s) && await vis(`[data-abil="${nm}"]`)) { tipo = 'abilita'; await pg.evaluate((n) => document.querySelector(`[data-abil="${CSS.escape(n)}"]`)?.click(), nm); await sciogli(); }
    else if (lib('muovere')) {
      tipo = 'muovere';
      const versoArredi = (s.scortati || []).some((g) => g.liberato) && !(s.uscita && s.uscita.aperta);
      // niente ritirata dei feriti: provata e MISURATA PEGGIORE — 1/12 vittorie
      // con la regola (e 2 corse in stallo) contro 3/12 senza. Un eroe che
      // rifiuta ogni casella a contatto in una stanza affollata non arretra:
      // si pianta, e il gruppo non arriva mai in fondo alla spina.
      // compito su una miniatura: bisogna finirgli ACCANTO, non nella stanza.
      // Senza questo l'eroe entrava in T6, girava, e non agganciava mai nessuno.
      const preda = (() => {
        const c = COMPITI.find((x) => x.nemico && ((s.compiti || {})[x.id] || 0) < x.quante);
        return c ? (s.nemici || []).find((n) => n.pos && n.nome === c.nemico) : null;
      })();
      // IL GUARDIANO: se l'episodio ha un orologio che si ferma tenendo un
      // nemico a contatto (Ep.10, «inchiodare il Muratore mentre gli altri
      // fotografano»), UN eroe designato lo insegue e resta adiacente, cosi'
      // l'orologio si blocca e gli altri hanno il tempo di fare il compito.
      const frena = EP.orologio && EP.orologio.frena_adiacente;
      const guardia = frena && party[0] === nm;   // il primo del party fa il cane da guardia
      const boss = frena ? (s.nemici || []).find((n) => n.pos && n.nome === frena) : null;
      const punt = (guardia && boss)
        ? (c) => (c.t === boss.pos.t
            ? Math.abs(c.x - boss.pos.x) + Math.abs(c.y - boss.pos.y)
            : 100 + dist(c.t, boss.pos.t) * 100)
        : preda
        ? (c) => (c.t === preda.pos.t
            ? Math.abs(c.x - preda.pos.x) + Math.abs(c.y - preda.pos.y)
            : 100 + dist(c.t, preda.pos.t) * 100)
        : versoArredi ? (c) => scoreArredi(c, s.uscitaTentati || []) : (c) => score(c, mt);
      let r = await muoviCon(punt, pos, async () => (await sp()).eroiPos[nm]);
      // MINIMO LOCALE degli arredi: se l'euristica a direzione non trova
      // progresso e l'eroe non e' ancora sulla tessera-meta, punta la CELLA-PORTA
      // verso il prossimo passo — un varco che esiste di sicuro, aggirando gli
      // arredi interni (le scale di T5 nell'Ep.1) che bloccavano la direzione
      // dritta. Fallback mirato, non sostituzione: si attiva solo da bloccati.
      if (r !== 'mosso' && !versoArredi && !preda && !(guardia && boss) && pos.t !== mt) {
        const dir = dirVerso(pos.t, mt);
        if (dir) {
          const pc = portaCellaP(pos.t, dir);
          r = await muoviCon((c) => (c.t === pos.t ? Math.abs(c.x - pc[0]) + Math.abs(c.y - pc[1]) : 0),
            pos, async () => (await sp()).eroiPos[nm]);
        }
      }
      if (r !== 'mosso') {
        tentate.add('muovere');
        const i = bersaglio(s, pos);
        if (!fatte.includes('attaccare') && i >= 0) { await pg.evaluate((j) => document.querySelector(`[data-nemico="${j}"]`)?.click(), i); await sciogli(); }
        else continue;
      }
    } else if (lib('attaccare')) {
      const i = bersaglio(s, pos);
      if (i < 0) break;
      tipo = 'attaccare';
      await pg.evaluate((j) => document.querySelector(`[data-nemico="${j}"]`)?.click(), i);
      await sciogli();
    } else break;
    // dopo un'interazione con prova (Controcanto NERVI nell'Ep.20, i movimenti
    // dell'Ep.6) l'azione puo' non risultare ancora scritta: l'overlay del dado
    // e' asincrono. Si aspetta il fatto prima di dichiarare KO.
    if (tipo === 'interagire') await finoA(async () => JSON.stringify((await sp()).azioni[nm] || []) !== prima, 2500);
    const dopo = JSON.stringify((await sp()).azioni[nm] || []);
    if (dopo === prima) {
      tentate.add(tipo);
      // interagire fallita (prova non superata) e' un esito legittimo, non un
      // click perso: l'azione e' comunque spesa dal gioco, si prova altro
      if (['abilita', 'attaccare', 'muovere', 'oggetto', 'interagire'].includes(tipo)) continue;
      ko(`${tipo} non registrata per ${breve(nm)}`); break;
    }
  }
  await clicDom('#az-fine');
}

// TUTTI i PNG liberati, non solo il primo. L'Ep.4 ne ha due (Gaspare e Rocco) e
// la vittoria richiede che escano ENTRAMBI: muovendo solo `scortati[0]`, Rocco
// restava piantato nella fossa e l'episodio risultava allo 0% su 12 partite —
// con l'uscita segreta regolarmente aperta in 11 di quelle. Era il pilota.
async function turnoScortato() {
  const s0 = await sp();
  const liberi = (s0.scortati || []).map((g, i) => ({ g, i })).filter(({ g }) => g.liberato && g.pos);
  if (!liberi.length) return null;
  let ultimo = null;
  for (const { i } of liberi) {
    const st = await sp(); const g = st.scortati[i];
    if (!g || !g.pos || g.mosso) continue;
    if (!(await cnt(`[data-scortato-chip="${i}"]`))) { roundNonMisurati++; continue; }
    await clicDom(`[data-scortato-chip="${i}"]`);
    
    if ((await sp()).scortAttivo !== i) { roundNonMisurati++; continue; }
    const c = await celle();
    const u = st.uscita;
    const spec = (EP.scortato || [])[i] || {};
    // Verso la META quando non c'e' un'uscita segreta da cercare (il Preludio,
    // l'Ep.7, l'Ep.16) o quando il PNG parte gia' libero (Ep.9): prima il pilota
    // puntava alla stanza della prigionia, dove il PNG gia' si trovava — quindi
    // «nessun progresso», e Ansaldo restava nello stanzino per sempre.
    const versoMeta = (m) => (cc) => (cc.t === m ? 0
      : dist(cc.t, m) * 100 + (dirVerso(cc.t, m) ? verso(dirVerso(cc.t, m), cc.x, cc.y) : 0));
    const punteggio = (spec.parte_libero || !spec.uscita) ? versoMeta(spec.meta)
      : (u && u.aperta)
      ? (cc) => (cc.t === u.tile ? Math.abs(cc.x - u.cella[0]) + Math.abs(cc.y - u.cella[1]) : 100 + dist(cc.t, u.tile) * 100)
      : (cc) => scoreArredi(cc, st.uscitaTentati || []);
    // chi imbocca il condotto ESCE dal board (`pos = null`, digitale.js): per il
    // pilota era «pedina ferma», cioe' un'azione riuscita contata come fallita —
    // ed erano quelle a far dichiarare NON VALIDE le corse dell'Ep.4.
    const leggi = async () => {
      const x = (await sp()).scortati?.[i];
      return x?.uscito ? { t: '~uscito', x: -1, y: -1 } : x?.pos;
    };
    let esito = c.length ? await muoviCon(punteggio, g.pos, leggi) : 'bloccato';
    // FALLBACK del PNG verso l'uscita: se «nessun progresso» ma il PNG non e'
    // ancora sulla cella d'uscita, muovilo comunque alla cella-mossa piu' vicina
    // alla meta (anche senza miglioramento stretto): in una T6 affollata il PNG
    // lento resta indietro di una casella e muoiCon lo dichiarava fermo, cosi'
    // l'uscita restava aperta ma inutilizzata (Ep.1: liberato e aperto al round
    // 10, poi il PNG non ci entrava fino alla sconfitta al round 20).
    if (esito !== 'mosso' && u && u.aperta && !(g.pos.t === u.tile && g.pos.x === u.cella[0] && g.pos.y === u.cella[1])) {
      const cc = await celle();
      if (cc.length) {
        const b = cc.slice().sort((a, z) => punteggio(a) - punteggio(z))[0];
        if (await clicCella(b)) { await sciogli(); const d = await leggi(); if (d && !(d.t === g.pos.t && d.x === g.pos.x && d.y === g.pos.y)) esito = 'mosso'; }
      }
    }
    if (esito !== 'mosso') await clicDom('#rug-fine');
    ultimo = { esito };
    if ((await sp()).esito) break;
  }
  return ultimo;
}

const righe = [];
for (let g = 0; g < N; g++) {
  // PARTY=nome1,nome2,... forza una squadra fissa (per isolare la varianza del
  // party da quella dei dadi); senza, quattro eroi a caso come al tavolo
  const party = process.env.PARTY
    ? process.env.PARTY.split(',').map((x) => comune.eroi.find((e) => e.nome.toUpperCase().includes(x.toUpperCase()))?.nome).filter(Boolean)
    : comune.eroi.map((e) => e.nome).sort(() => Math.random() - 0.5).slice(0, 4);
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
  await pg.evaluate(({ p, k, id, TIER, OGG }) => {
    localStorage.clear();
    localStorage.setItem(k, JSON.stringify({
      v: 1, episodio: id, modo: 'digitale', party: p, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
        oggetti: OGG, reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
        note: '', risposte: ['', '', '', ''], chiusa: true },
      // IL VANTAGGIO D'INDAGINE. Senza, il pilota misura sempre il gruppo che
      // dall'Indagine non porta NIENTE: niente +1 Salute, niente slancio,
      // niente oggetti — cioe' il pavimento, non l'episodio. Si sceglie con
      // INDAGINE=slancio|preparati|nessuno (default: preparati, l'esito medio).
      vantaggi: { tier: TIER, dossier: TIER === 'slancio', risposte: [false, false, false, false] },
      spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null },
    }));
  }, { p: party, k: CHIAVE_SALVATAGGIO, id: EPID, TIER, OGG: EP.oggetti_indagine || [] });
  // AVVIO VERIFICATO. La catena titolo->continua->via e' tre schermate che si
  // susseguono: se un click parte prima che la successiva sia montata, l'avvio
  // muore in silenzio e la partita resta a round 0 — erano 28 «stalli» su 168
  // che non erano gioco, ma setup fallito. Qui si riprova finche' la spedizione
  // e' davvero cominciata (fase eroi con pedine sul tabellone).
  let avviata = false;
  for (let tent = 0; tent < 8 && !avviata; tent++) {
    if (tent) await pg.evaluate(({ p, k, id, TIER, OGG }) => {
      localStorage.setItem(k, JSON.stringify({ v: 1, episodio: id, modo: 'digitale', party: p,
        creata: Date.now(), fase: 'spedizione',
        indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
          oggetti: OGG, reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
          note: '', risposte: ['', '', '', ''], chiusa: true },
        vantaggi: { tier: TIER, dossier: TIER === 'slancio', risposte: [false, false, false, false] },
        spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } }));
    }, { p: party, k: CHIAVE_SALVATAGGIO, id: EPID, TIER, OGG: EP.oggetti_indagine || [] });
    await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
    await finoA(async () => (await pg.getByText(EP.titolo).count()) > 0, 8000);
    await pg.getByText(EP.titolo).first().click().catch(() => {});
    await clicQuando('#continua');
    await clicQuando('#via');
    await sciogli();
    avviata = await finoA(async () => { const x = await sp(); return x && (x.round >= 1 || x.esito); }, 8000);
  }
  if (!avviata) { ko('avvio della spedizione non riuscito'); righe.push({ esito: 'stallo', round: 0, tappe: {}, allIngresso: null, liberatoAl: null, apertaAl: null, vittoriaAl: null, compiti: '' }); continue; }

  let vittoriaAl = null, liberatoAl = null, apertaAl = null, piccoTerra = 0;
  let ultimoProgresso = 0, firmaProg = '';
  const tappe = {}; let allIngresso = null;   // fotografia all'ingresso in T6
  for (let r = 0; r < 80; r++) {
    if (!(await attendiFaseEroi())) { ko('fase eroi mai arrivata (timeout)'); break; }
    const s = await sp(); if (s.esito) break;
    const inPiedi = Object.values(s.vite).filter((v) => v > 0).length;
    piccoTerra = Math.max(piccoTerra, party.length - inPiedi);   // proxy ansia: eroi a terra nel momento peggiore
    for (const t of s.rivelate || []) if (!tappe[t]) tappe[t] = { round: s.round, vivi: inPiedi };
    // LA STANZA DEL BOSS: com'è messo il gruppo quando ci mette piede
    if (!allIngresso && (s.rivelate || []).includes(TILE_BOSS)) {
      allIngresso = {
        round: s.round, vivi: inPiedi, canto: s.canto, cantoBonus: !!s.cantoBonus,
        salute: Object.values(s.vite).reduce((a, b) => a + Math.max(0, b), 0),
        nemici: (s.nemici || []).filter((n) => n.pos).length,
        inT6: (s.nemici || []).filter((n) => n.pos && n.pos.t === TILE_BOSS).length,
        tipi: [...new Set((s.nemici || []).filter((n) => n.pos).map((n) => breve(n.nome)))].join(','),
      };
    }
    // progresso = tessere rivelate + compiti fatti. Se non cambia per 12 round
    // il gruppo e' impantanato (di norma decimato in un episodio non letale, dove
    // la sconfitta per party-wipe non scatta): si chiude come sconfitta invece di
    // girare fino al round 80.
    // il progresso include anche il RIENTRO: a obiettivo fatto, il gruppo che
    // riporta il PNG/se stesso alla meta avanza eccome, ma tessere e compiti non
    // cambiano piu' — senza la distanza dalla meta l'anti-stallo dichiarava
    // «fermo» un ritorno perfettamente in corso (Ep.7: sconfitta a round 19 con
    // Fava libero e tutti vivi). Si aggiunge quanti eroi/PNG sono gia' alla meta.
    const allaMeta = Object.values(s.eroiPos || {}).filter((p) => p && p.t === (EP.vittoria?.tessera || SC?.meta)).length
      + (s.scortati || []).filter((g) => g.pos && g.pos.t === (SC?.meta)).length;
    const firma = `${(s.rivelate || []).length}|${Object.values(s.compiti || {}).reduce((a, b) => a + b, 0)}|${allaMeta}`;
    if (firma !== firmaProg) { firmaProg = firma; ultimoProgresso = r; }
    else if (r - ultimoProgresso >= 12) { if (await vis('#sconfitta')) await clicDom('#sconfitta'); break; }
    const mt = await meta();
    if (process.env.DIAG) {
      const pos = Object.entries(s.eroiPos).map(([k, v]) => `${breve(k)}@${v.t}(${v.x},${v.y})/${s.vite[k]}`).join(' ');
      const nem = (s.nemici || []).filter((n) => n.pos).map((n) => breve(n.nome) + '@' + n.pos.t).join(' ');
      console.log(`      nemici: ${nem || '-'}`);
      console.log(`   r${s.round} meta=${mt} rivelate=${(s.rivelate || []).join(',')} | ${pos}` +
        ` | PNG ${(s.scortati || [])[0]?.liberato ? 'libero@' + (s.scortati[0].pos || {}).t : 'no'}`);
    }
    if (!liberatoAl && (s.scortati || [])[0]?.liberato) liberatoAl = s.round;
    if (!apertaAl && s.uscita?.aperta) apertaAl = s.round;
    await turnoScortato();
    const s2 = await sp();
    if (!vittoriaAl && s2.esito === 'vittoria') vittoriaAl = s2.round;
    if (s2.esito) break;
    // chi apre la strada va per primo, il curatore per ultimo: così la cura
    // arriva dopo i danni del round invece che prima
    const ordine = party.slice().sort((a, z) =>
      (a.includes('ATTILIO') ? 1 : 0) - (z.includes('ATTILIO') ? 1 : 0) || (s.vite[z] ?? 0) - (s.vite[a] ?? 0));
    for (const nm of ordine) {
      const st = await sp(); if (st.esito) break;
      if ((st.vite[nm] ?? 0) <= 0 || (st.eroiFatti || []).includes(nm)) continue;
      await turnoEroe(nm, mt, party);
    }
    const s3 = await sp();
    if (!vittoriaAl && s3.esito === 'vittoria') vittoriaAl = s3.round;
    if (s3.esito) break;
    // PARTY-WIPE che il motore mostra ma non chiude da solo: a tavolo l'arbitro
    // preme «gli eroi cadono», il pilota no. Se tutti sono a terra, la partita
    // e' persa — negli episodi non letali (Ep.19) il gruppo restava a terra per
    // 80 round senza che la sconfitta scattasse, e contava come stallo.
    if (await vis('#fase-minaccia')) { await clicDom('#fase-minaccia'); await finoA(async () => !(await vis('#fase-minaccia')), 2000); }
    await sciogli();
    if (await cnt('#salta-nemici')) await clicDom('#salta-nemici');
    // la fase nemici la aspetta gia' attendiFaseEroi a inizio giro: qui basta
    // lasciare che il click parta
    await finoA(async () => !(await cnt('#salta-nemici')), 2000);
  }
  const f = await sp();
  const compiti = COMPITI.length
    ? ' compiti ' + [...new Set(COMPITI.map((c) => c.id))]
        .map((id) => `${id} ${(f.compiti || {})[id] || 0}/${(COMPITI.find((c) => c.id === id) || {}).quante}`).join(' ')
    : '';
  righe.push({ esito: f.esito || 'stallo', round: f.round, tappe, allIngresso, liberatoAl, apertaAl, vittoriaAl, compiti });
  console.log(`${String(g + 1).padStart(2)}/${N}  ${String(f.esito || 'stallo').padEnd(10)} round ${String(f.round).padStart(2)}` +
    `  ${TILE_BOSS} ${allIngresso ? `r${allIngresso.round} eroi ${allIngresso.vivi} salute ${allIngresso.salute} nemici ${allIngresso.nemici}(${allIngresso.inT6} in T6) canto ${allIngresso.canto}` : 'mai'}` +
    `  liberato ${liberatoAl ?? '-'} aperta ${apertaAl ?? '-'} VITTORIA ${vittoriaAl ? 'r' + vittoriaAl : 'no'} picco ${piccoTerra}${compiti}`);
}

console.log('\n--- validità della corsa ---');
const problemi = [];
if (azioniKOtot()) problemi.push(`${azioniKOtot()} azioni fallite -> ` + JSON.stringify(KO));
if (roundNonMisurati) problemi.push(`${roundNonMisurati} round non misurati sul PNG`);
if (errsJS.length) problemi.push(`${errsJS.length} errori JS: ${[...new Set(errsJS)].slice(0, 2).join(' | ')}`);
const stalli = righe.filter((r) => r.esito === 'stallo').length;
if (stalli) problemi.push(`${stalli} partite in stallo`);
console.log(problemi.length ? 'NON VALIDA — ' + problemi.join('; ') : 'VALIDA: nessuna azione fallita, nessun round perso, nessun errore JS');

const v = righe.filter((r) => r.vittoriaAl);
console.log(`\n===== Ep.1, 4 eroi, ${N} partite =====`);
console.log(`VITTORIE ${v.length}/${N} = ${(100 * v.length / N).toFixed(0)}%` + (v.length ? `, round medi ${(v.reduce((a, r) => a + r.vittoriaAl, 0) / v.length).toFixed(1)}` : ''));
console.log(`PNG liberato ${righe.filter((r) => r.liberatoAl).length}/${N}, uscita aperta ${righe.filter((r) => r.apertaAl).length}/${N}`);
for (const t of EP.tessere.map((x) => x.id).filter((x) => x !== 'T1')) {
  const c = righe.filter((r) => r.tappe[t]);
  console.log(`${t}: ${c.length}/${N} partite` + (c.length ? `, round ${(c.reduce((a, r) => a + r.tappe[t].round, 0) / c.length).toFixed(1)}, eroi ${(c.reduce((a, r) => a + r.tappe[t].vivi, 0) / c.length).toFixed(1)}/4` : ''));
}
const ing = righe.filter((r) => r.allIngresso).map((r) => r.allIngresso);
if (ing.length) {
  const m = (f) => (ing.reduce((a, x) => a + f(x), 0) / ing.length).toFixed(1);
  console.log(`\n--- all'ingresso in ${TILE_BOSS} (la stanza del boss), ${ing.length} partite ---`);
  console.log(`round ${m((x) => x.round)}  eroi in piedi ${m((x) => x.vivi)}/4  salute totale ${m((x) => x.salute)}`);
  console.log(`nemici in campo ${m((x) => x.nemici)} (di cui in T6 ${m((x) => x.inT6)})  canto ${m((x) => x.canto)}` +
    `  con bonus Canto attivo in ${ing.filter((x) => x.cantoBonus).length}/${ing.length}`);
  console.log(`tipi presenti: ${[...new Set(ing.flatMap((x) => x.tipi.split(',')))].join(', ')}`);
}
await br.close();
