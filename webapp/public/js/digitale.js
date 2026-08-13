// Vista Spedizione (modalita' DIGITALE, «tutto a schermo»): l'INTERO dungeon
// vive sullo schermo. Le tessere rivelate sono disposte in tavola secondo il
// grafo delle uscite; ogni eroe/nemico ha una posizione globale (tessera +
// casella) e si muove a caselle attraversando le porte a piedi — niente
// «avanzata di gruppo». Pathfinding multi-tessera; IA nemici portata dal
// simulatore (bersaglio casuale, si avvicina col BFS, colpisce se adiacente).
//
// NB: la modalita' TAVOLO (spedizione.js) resta invariata: questo file e' un
// ramo separato, scelto in vistaPartita (main.js) su partita.modo.
import { salva, dati } from './store.js';
import { rendi, norm, costruisciMazzo, carteDaPescare, pesca, fineRound,
         cantoDaCarta, cerca, urlCarta, urlArt, cartaOggetto, tettoCanto,
         sogliaCanto } from './engine.js';
import { tiraProva } from './dadi.js';
import { abilitaSchede } from './scheda-eroe.js';
import { controBusta } from './engine.js';
import { conferma } from './chiedi.js';
import { apriCanale } from './canale.js';
import * as griglia from '../motore/griglia.js';
import * as stat from '../motore/stat.js';
import * as obiettivi from '../motore/obiettivi.js';
import * as vittoria from '../motore/vittoria.js';
import * as minaccia from '../motore/minaccia.js';
import * as nemici from '../motore/nemici.js';
import * as azioni from '../motore/azioni.js';
import { applica } from '../motore/comandi.js';
import * as abilita from '../motore/abilita.js';
import * as interazioni from '../motore/interazioni.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ctx = null;   // { app, partita, ep, comune, carte, vaiA, layout }
const P = () => ctx.partita;
const SP = () => ctx.partita.spedizione;
const salvaP = () => salva(ctx.partita);

// LA PLANCIA A SCHERMO AL TAVOLO. Questa vista nasce per la modalita' digitale
// (tutto a schermo, l'app tira i dadi), ma serve anche a chi gioca AL TAVOLO
// senza aver stampato tessere e miniature: la plancia vive qui, tutto il resto
// resta del tavolo. Da qui due differenze, e solo queste:
//   - i dadi sono FISICI (`dadi.js` chiede il totale dei 2d6 e tiene comunque
//     il ripiego «niente dadi? tira l'app» per chi non li ha sottomano);
//   - il TESTO delle tessere non si stampa a schermo: lo legge ad alta voce chi
//     arbitra, dal fascicolo Spedizione. Se lo mostrasse l'app, i giocatori lo
//     leggerebbero prima che finisca la frase.
const alTavolo = () => P().modo === 'tavolo';
// IL POSTO. Chi arbitra muove chiunque — e' lui che tiene in mano gli eroi non
// reclamati. Chi gioca muove il suo, e i comandi del tavolo (la notte, la
// pesca, la chiusura) non li ha.
const mioPosto = () => (ctx && ctx.posto) || { ruolo: 'arbitro' };
const arbitro = () => mioPosto().ruolo === 'arbitro';
const mioEroe = () => mioPosto().eroe || null;
const posso = (nm) => arbitro() || nm === mioEroe();
const modoDadi = () => (alTavolo() ? 'tavolo' : 'digitale');
// I tiri dei NEMICI si possono delegare all'app anche stando al tavolo: con il
// campo affollato, tirare a mano per ogni sgherro e' la contabilita' che la
// modalita' tavolo voleva togliere. L'interruttore vale per la partita, si
// accende dall'overlay del tiro (ripiegoSempre) e si spegne dalla plancia.
// I DADI DEI NEMICI LI TIRA CHI ARBITRA. Al tavolo i dadi sono di legno e li
// tira il tavolo, ma la richiesta va fatta a UNO schermo solo: chiederla anche
// ai telefoni farebbe comparire l'overlay dei dadi a tutti, e ognuno tirerebbe
// per lo stesso nemico. Sul telefono il tiro non si chiede — arriva gia' fatto
// col resto dello stato.
const tavoloTiraNemici = () => alTavolo() && !P().nemiciApp && arbitro();
const RIPIEGO_NEMICI = { label: 'da qui i nemici li tira l’app' };
function accendiNemiciApp() { P().nemiciApp = true; salvaP(); }

// Un tiro d'attacco del nemico: lo chiede al tavolo, oppure lo tira l'app se
// l'interruttore e' acceso. Ritorna { tot, ok } comunque, cosi' chi chiama
// applica il danno allo stesso modo. L'interruttore puo' accendersi PROPRIO
// QUI (ripiegoSempre) e vale dal tiro successivo in poi.
async function tiroNemico(titolo, soglia, att) {
  if (!tavoloTiraNemici()) { const tot = r1() + r1() + att; return { tot, ok: tot >= soglia }; }
  const r = await tiraProva({ titolo, diffLabel: 'Difesa', soglia,
    bonus: [{ label: 'ATTACCO', val: att }], modo: 'tavolo', ripiegoSempre: RIPIEGO_NEMICI });
  if (r && r.sempre) accendiNemiciApp();
  return { tot: r ? r.tot : 0, ok: !!(r && r.ok) };
}

// board PNG: export-assets.py copia le tessere stampate in webapp/assets con il
// nome normalizzato «<TileId>.png» (a monte i file sono «T1 - Nome Tessera.png»,
// e il nome non coincide con quello del JSON — maiuscoletto, apostrofi diversi).
const urlBoard = (tileId) => `/assets/${encodeURI(ctx.ep.cartella)}/board/${tileId}.png`;

// ---------------------------------------------------------- motore a griglia
// La geometria e' uscita di qui: sta in motore/griglia.js, pura e isomorfa,
// perche' la stessa deve girare nel browser dell'arbitro, sul telefono di un
// giocatore e domani in un Durable Object che di DOM non ne ha
// (DESIGN-VISTA-EROE.md). Qui restano solo gli adattatori che le passano il
// contesto: `g` esplicito al posto del `ctx` globale di modulo.
//
// `_layout` e' un getter/setter su ctx.layout, cosi' la memoizzazione resta
// dov'era e si azzera insieme al resto quando si cambia partita.
const G = () => ({
  ep: ctx.ep, comune: ctx.comune, sp: SP(), partita: P(),
  get _layout() { return ctx.layout; },
  set _layout(v) { ctx.layout = v; },
});
const { dentro, chiave, dirExit, vicini, portaCella, nk } = griglia;
const arrediSet = (tile) => griglia.arrediSet(G(), tile);
const tileDi = (id) => griglia.tileDi(G(), id);
const layout = () => griglia.layout(G());
const grataChiusa = (tileId, dir, raw) => griglia.grataChiusa(G(), tileId, dir, raw);
const viciniGlob = (n, allowReveal) => griglia.viciniGlob(G(), n, allowReveal);
const esploraMosse = (start, budget, blocco) => griglia.esploraMosse(G(), start, budget, blocco);
const camminoGlob = (start, goal, blocco) => griglia.camminoGlob(G(), start, goal, blocco);
const adiacGlob = (a, b) => griglia.adiacGlob(G(), a, b);

// ------------------------------------------------------------- dati di gioco
// Anche queste sono uscite di qui: stanno in motore/stat.js. Non sono dati ma
// calcoli — la stessa carta Eroe vale 6 di Salute in due e 8 in dieci, e la
// stessa carta Nemico e' piu' morbida in un episodio tarato — quindi vanno
// dove vanno le regole.
const eroe = (nm) => stat.eroe(G(), nm);
const nemStat = (nome) => stat.nemStat(G(), nome);
const movimento = (nm) => stat.movimento(G(), nm);
const fascia = (taglia) => stat.fascia(G(), taglia);
const saluteMax = (e) => stat.saluteMax(G(), e);
const specScortati = () => stat.specScortati(G());
const specScort = (i) => stat.specScort(G(), i);
const statoScortati = () => stat.statoScortati(G());
const scortAttivo = () => stat.scortAttivo(G());

// nodi occupati (eroi + nemici + PNG scortati), tranne exclKey. `soloNemici`:
// escludi gli eroi (cammino eroi: gli alleati si attraversano). `senzaScortati`:
// escludi i PNG scortati — nei set di CAMMINO (eroi e nemici li attraversano: si
// passa attraverso, non ci si ferma sopra → l'arrivo usa senzaScortati=false).
const occupati = (exclKey, soloNemici, senzaScortati) =>
  griglia.occupati(G(), exclKey, soloNemici, senzaScortati);

// ---------------------------------------------------------------- ingresso
// `posto` — chi sta guardando. Assente o `{ruolo:'arbitro'}`: e' la plancia di
// chi conduce, come sempre. `{ruolo:'giocatore', eroe}`: e' il telefono di chi
// gioca QUEL personaggio.
//
// La plancia e' LA STESSA. Non si duplica in una vista-eroe: sarebbe ricreare
// la divergenza fra due copie della stessa cosa, che e' il guaio da cui questa
// fase e' partita. Cambia CHI PUO' TOCCARE COSA — e il motore lo rifiuta
// comunque, se qualcuno prova.
export async function vistaDigitale(app, partita, vaiA, posto) {
  const [ep, comune, carte] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  ctx = { app, partita, ep, comune, carte, vaiA, layout: null, posto: posto || null,
          canale: null, tavoloVivo: false, rifMiei: new Set() };
  await mettiSulTavolo();
  collegaAlTavolo();
  abilitaSchede((nm) => comune.eroi.find((x) => x.nome === nm));
  // al tavolo la plancia si guarda in tanti, da lontano e di sbieco: il glide
  // del token rallenta (vedi `.al-tavolo .tok-slot` in app.css) perche' la
  // notte si deve poter SEGUIRE, non indovinare a cose fatte
  app.classList.toggle('al-tavolo', alTavolo());
  // la preferenza «immersivo» sopravvive a un reload (il tablet che si
  // riaddormenta): si riapplica il LAYOUT, non il fullscreen — quello i browser
  // lo concedono solo su un gesto, e chiederlo qui verrebbe rifiutato
  // Il layout immersivo lo accende `render()`, cioe' solo dove c'e' una PLANCIA:
  // non scorre (height:100% e overflow:hidden), e sulla schermata d'ingresso o
  // sull'epilogo — che sono testo — taglierebbe le righe di sotto senza modo di
  // raggiungerle. Qui si spegne, che e' lo stato giusto per l'ingresso.
  app.classList.remove('immersivo');
  if (!partita.spedizione || !partita.spedizione.digitale) return setup();
  migraScortati(partita.spedizione);
  render();
}

// METTERE LA PARTITA SUL TAVOLO. Lo fa CHI ARBITRA, aprendo la Spedizione: da
// quel momento la partita viva sta nel Durable Object e i telefoni possono
// vederla. Senza questo passo il tavolo resta vuoto — i giocatori si collegano
// a un oggetto che non ha nessuna partita, e sui loro schermi non arriva
// niente: e' un silenzio, non un errore, ed e' il modo peggiore di rompersi.
//
// Non sovrascrive una partita piu' avanti: al DO si manda quel che si ha, e se
// lui ne ha una piu' recente (`aggiornato`) tiene la sua e risponde `ripresa`.
// E' il caso di chi riapre la pagina a meta' serata.
async function mettiSulTavolo() {
  const p = ctx.posto;
  if (!p || !p.tavolo || p.ruolo !== 'arbitro') return;
  try {
    const r = await fetch(`/api/tavolo/${encodeURIComponent(p.tavolo)}/apri`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: p.tavolo, stato: ctx.partita }),
    });
    if (r.ok) ctx.tavoloVivo = true;
  } catch {
    // nessun tavolo raggiungibile: si gioca da soli, com'era. La partita non
    // si perde — resta il salvataggio di sempre.
  }
}

// IL FILO COL TAVOLO, se c'e' un tavolo.
//
// `tavoloVivo` si alza solo quando il tavolo ha davvero mandato una partita.
// Finche' non l'ha fatto — nessun server, tavolo mai aperto, filo caduto — il
// motore resta qui e non cambia niente: e' la stessa app di prima. E' una
// degradazione voluta, non una svista: meglio una partita da soli che una
// plancia che non risponde ai tocchi.
function collegaAlTavolo() {
  if (!ctx.posto || !ctx.posto.tavolo || typeof WebSocket === 'undefined') return;
  ctx.canale = apriCanale({
    tavolo: ctx.posto.tavolo,
    onVista: async (stato, datiVisti, rif, eventi) => {
      // la propria mossa torna anche come spinta: gli eventi li si e' gia'
      // messi in scena rispondendo, e rifarlo tirerebbe i dadi due volte
      if (rif && ctx.rifMiei.has(rif)) { ctx.rifMiei.delete(rif); return; }
      ctx.tavoloVivo = true;
      // i dati arrivano POTATI PER IL POSTO: chi gioca un eroe non ha mai
      // avuto la soluzione, e non deve prendersela da `/data/epN.json`
      if (datiVisti) {
        if (datiVisti.ep) ctx.ep = datiVisti.ep;
        if (datiVisti.comune) ctx.comune = datiVisti.comune;
        if (datiVisti.carte) ctx.carte = datiVisti.carte;
      }
      if (await incassa(stato, eventi)) return;   // la partita e' finita: epilogo
      render();
    },
    onRifiuto: (r) => flash(r.motivo || 'Il tavolo ha rifiutato la mossa.'),
    onStato: (collegato) => { if (!collegato) ctx.tavoloVivo = false; },
  });
}

// salvataggi precedenti al dato per episodio: il singolo `sp.ruggero` diventa
// la lista `sp.scortati` (una voce per PNG dichiarato in ep.scortato)
function migraScortati(sp) {
  if (sp.scortati) return;
  const vecchio = sp.ruggero;
  sp.scortati = specScortati().map((_, i) => (i === 0 && vecchio
    ? { liberato: !!vecchio.liberato, pos: vecchio.pos || null, mosso: !!vecchio.mosso }
    : { liberato: false, pos: null, mosso: false }));
  sp.scortAttivo = null;
  delete sp.ruggero; delete sp.ruggeroAttivo;
  salvaP();
}

function setup() {
  const { app, ep } = ctx;
  // niente fascia del turno qui: la Spedizione non e' ancora cominciata, e
  // annunciare un turno prima che ci sia un turno confonde e basta
  app.innerHTML = `
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">${esc(ep.titolo)}</div><span></span></div>
    <div class="pannello"><h2>tutto a schermo</h2>
      <p>Tutto il sotterraneo è qui: muovete gli eroi a caselle, attraversate le
      porte a piedi per esplorare le stanze, attaccate i nemici adiacenti. I dadi
      si tirano sullo schermo.</p>
      <p class="mt"><b>Obiettivo:</b> ${esc(ep.obiettivo || '')}</p></div>
    <div class="btn-riga"><button class="btn pieno" id="via">si scende →</button></div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  // «si scende» e' un gesto vero: qui lo schermo intero si puo' chiedere subito,
  // e la plancia nasce gia' a tabellone invece di aspettare il primo tocco.
  app.querySelector('#via').onclick = () => {
    if (immersivo()) chiediSchermoIntero(true);
    iniziaPartita();
  };
}

function iniziaPartita() {
  const { ep, partita } = ctx;
  const t0 = ep.tessere[0];
  const entrata = portaCella(t0, t0.start || 'S');
  const occ = new Set(); const celle = celleLibereTile(t0, entrata, partita.party.length, occ);
  const eroiPos = {};
  partita.party.forEach((nm, i) => { eroiPos[nm] = { t: t0.id, x: (celle[i] || entrata)[0], y: (celle[i] || entrata)[1] }; });
  partita.spedizione = {
    // Il Canto non riparte sempre da zero: tre Bivi di campagna (11, 18, 19)
    // promettono un finale che «parte col Dormiente piu' vicino a svegliarsi»,
    // e la Domanda 1 sbagliata dell'Ep.20 lo fa partire da 1. Qui si legge il
    // valore gia' nello stato invece di azzerarlo. Partita nuova = 0 (store.js),
    // e `#via` e' l'unico chiamante, quindi nessuna ripresa puo' ereditarlo.
    digitale: true, round: 1, fase: 'eroi', canto: partita.spedizione?.canto || 0,
    cantoBonus: false, esito: null,
    rivelate: [t0.id], eroiPos, nemici: [],
    // `parte_libero`: certi PNG non vanno liberati, partono col gruppo — il teste
    // dell'Ep.9 esce dalla sacrestia con voi e va portato al Molo. `salute`: e'
    // l'unico che i nemici possono colpire, ed e' li' che sta la tensione.
    scortati: specScortati().map((sc, k) => ({ liberato: !!sc.parte_libero, mosso: false,
      vite: sc.salute || null,
      // chi parte libero e' gia' sul tabellone, accanto al gruppo
      pos: sc.parte_libero ? (() => { const c = celleLibereTile(t0, entrata, partita.party.length + k + 1, new Set())
        .slice(-1)[0] || entrata; return { t: t0.id, x: c[0], y: c[1] }; })() : null })),
    scortAttivo: null, grate: [], uscita: null, uscitaTentati: [],
    vite: Object.fromEntries(partita.party.map((nm) => { const e = eroe(nm); return [nm, e ? saluteMax(e) : 6]; })),
    eroiFatti: [], eroiAttivo: null, azioni: {}, cercate: {}, insidie: {},
    abilita: {}, diversivoPronto: false, storditi: {},
    mazzo: costruisciMazzo(ctx.carte, ep, partita.episodio),
    log: ['Gli eroi sbarcano alla banchina.'],
  };
  salvaP(); render();
}
// n celle libere piu' vicine a start dentro una singola tessera (spawn/ingresso)
const celleLibereTile = (tile, start, n, occ) => griglia.celleLibereTile(G(), tile, start, n, occ);

// --------------------------------------------------------------- rendering
// LA FASCIA DEL TURNO, per chi gioca da un telefono. Su uno schermo tenuto in
// mano fra una chiacchiera e l'altra, «tocca a me?» e' la domanda da risolvere
// in mezzo secondo: per questo e' una fascia larga e colorata e non una scritta
// in un angolo. Chi arbitra non la vede: ha il tabellone davanti e li' muove
// tutti, quindi gli direbbe una cosa che sa gia'.
function fasciaTurno() {
  if (arbitro()) return '';
  const mio = mioEroe(); const attivo = eroiAttivoNome();
  if (SP().fase === 'nemici') return '<div class="fascia-turno notte">agisce la notte</div>';
  if (attivo && attivo === mio) {
    const fatte = (SP().azioni[mio] || []).length;
    const restano = Math.max(0, azioniMax(mio) - fatte);
    return `<div class="fascia-turno mio">tocca a te — ${restano} ${restano === 1 ? 'azione' : 'azioni'}</div>`;
  }
  return `<div class="fascia-turno attesa">${attivo
    ? `sta giocando ${esc(primo(attivo))}…` : 'il tavolo sta giocando…'}</div>`;
}

function render() {
  const sp = SP();
  // la plancia c'e': si gioca a tabellone, salvo che il ⤢ non l'abbia spento
  ctx.app.classList.toggle('immersivo', immersivo());
  // IL LAYOUT DA TELEFONO e' lo stesso HTML, riordinato dal CSS: la plancia
  // sopra, le azioni dove arriva il pollice, il resto sotto. Duplicare i
  // pannelli in una vista a parte li avrebbe fatti divergere alla prima
  // modifica — ed e' esattamente la divergenza che questo lavoro ha appena
  // finito di togliere fra tavolo e schermo.
  ctx.app.classList.toggle('vista-eroe', !arbitro());
  if (sp.esito) return epilogo();
  // LA CARTA APERTA sta nello stato, quindi la vede chiunque guardi — anche chi
  // ricarica la pagina a meta' lettura. Prima la carta viveva solo nella catena
  // di animazione di chi arbitra: sul telefono ne arrivava una sola, e un
  // refresh saltava direttamente a notte inoltrata.
  if (sp.carta) return schermataCarta(sp.carta);
  // LA NOTTE LA FA AGIRE CHI ARBITRA, e nessun altro. `render()` la faceva
  // partire a chiunque disegnasse con la fase a «nemici»: bastava ricaricare la
  // pagina sul telefono per far muovere i nemici — in LOCALE, perche' al
  // risveglio il filo col tavolo non e' ancora aperto e il motore gira qui.
  // L'arbitro non vedeva niente, e le due partite divergevano in silenzio.
  // LA NOTTE LA FA AGIRE CHI ARBITRA. Chi guarda NON esce dalla plancia: resta
  // quella di sempre — stesso markup, stesso layout, stessi token — e la fascia
  // in cima dice che sta agendo la notte. Una schermata a parte l'avevo scritta,
  // e disegnava la plancia fuori da tutto il resto: si vedeva una mappa gigante
  // che usciva dallo schermo con la salute sopra. Il layout non si duplica.
  if (sp.fase === 'nemici' && arbitro()) return faseNemiciAI();
  const { app, ep } = ctx;
  const attivo = eroiAttivoNome();
  const tpk = P().party.every((nm) => (sp.vite[nm] ?? 0) <= 0);
  app.innerHTML = `
    ${fasciaTurno()}
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">tutto a schermo</div>
      <span class="sc" style="color:var(--oro-chiaro)">round ${sp.round} · canto ${sp.canto}</span></div>
    <div class="pannello secondario"><p><b>Obiettivo:</b> ${esc(ep.obiettivo || '')}
      ${statoScortati().map((g, i) => (g.liberato && SP().esito == null
        ? ` <span class="ok-txt">— ${esc(specScort(i).nome)} vi segue: riportatelo in ${esc(specScort(i).meta || '')}.</span>` : '')).join('')}</p>
      ${tpk ? '<p class="ko-txt">Tutti gli eroi sono a terra: la notte vince.</p>' : ''}</div>
    <div class="mt"></div>
    <div class="board-area">
      <div class="board-wrap" id="board-wrap">${boardHtml()}</div>
      <div class="zoom-ctrl">
        <button class="zoom-btn" data-zoom="-">−</button>
        <button class="zoom-btn" data-zoom="0">⤢</button>
        <button class="zoom-btn" data-zoom="+">+</button>
      </div>
    </div>
    <p class="nota secondario" style="text-align:center">Trascina per spostare la mappa · +/− o Ctrl+rotella per lo zoom</p>
    <div class="mt"></div>
    <div class="lato">
      <div class="pannello giro" id="p-giro"><h2>il giro degli eroi</h2>${giroEroiHtml()}</div>
      <div class="mt"></div>
      <div class="pannello" id="p-azioni"><h2>azioni di ${scortAttivo() != null ? esc((specScort(scortAttivo()).nome || '').toLowerCase()) : (attivo ? esc(primo(attivo)) : '—')}</h2>${azioniHtml()}</div>
      <div class="mt"></div>
      <div class="pannello" id="p-salute"><h2>la salute degli eroi</h2>${saluteHtml()}</div>
    </div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>le abilità degli eroi</h2>${abilitaHtml()}
      <p class="nota mt">«usa» spende una carica (vale come un’azione dell’eroe attivo).</p></div>
    ${sp.nemici.length ? `<div class="mt"></div><div class="pannello secondario"><h2>nemici in campo</h2>${nemiciHtml()}</div>` : ''}
    <div class="mt"></div>
    <div class="pannello secondario"><h2>oggetti del gruppo</h2>${oggettiHtml()}</div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>diario</h2>${logHtml()}</div>
    ${arbitro() ? '<div class="btn-riga secondario"><button class="btn" id="sconfitta">gli eroi cadono</button></div>' : ''}`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  const btnSconfitta = app.querySelector('#sconfitta');
  if (btnSconfitta) btnSconfitta.onclick = () => finePartita('sconfitta');
  aggancia();
}

// celle di arrivo raggiungibili dall'eroe (alleati attraversabili, ci si ferma
// solo su celle libere; le porte verso stanze coperte sono bersagli reveal).
// {} se ha gia' mosso o non e' la fase eroi.
const raggEroe = (nm) => stat.raggEroe(G(), nm);

// ESCA PREZIOSA di Carbone: le caselle dove il monile puo' arrivare — entro 3,
// libere, in stanze gia' rivelate. Stessa esplorazione del movimento, budget 3:
// un monile lanciato non passa i muri piu' di quanto ci passi un uomo.
const celleEsca = (nm) => stat.celleEsca(G(), nm);

// `senzaMosse`: la plancia disegnata mentre agisce la notte non accende le
// caselle dell'eroe. NON si puo' dedurre da `SP().fase`, e il test lo ha
// dimostrato: la fase nemici COMMITTA lo stato prima di animare, quindi
// mentre i token dei nemici scorrono la partita risulta gia' tornata agli
// eroi. Lo sa solo chi sta disegnando, e infatti glielo si chiede.
function boardHtml(senzaMosse) {
  const sp = SP(); const lay = layout(); const rev = sp.rivelate;
  // tessere di frontiera (coperte, vicine a una rivelata): si disegnano come
  // segnaposto scuro cosi' la porta e la sua cella-reveal cadono DENTRO il
  // board (altrimenti finirebbero fuori dai bounds, clippate e non cliccabili).
  const frontiera = new Set();
  for (const id of rev) { const tile = tileDi(id); for (const raw of Object.values(tile.exits || {})) { const d = dirExit(raw); if (!rev.includes(d) && lay[d]) frontiera.add(d); } }
  const mostrate = [...rev, ...frontiera];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const id of mostrate) { const [x, y] = lay[id]; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const cols = (maxX - minX + 1) * 4, rows = (maxY - minY + 1) * 4;
  const cell = 104;  // tessere grandi (come la board singola); si naviga con pan + zoom
  // `minX/maxY/cell` per centrare la finestra sulla tessera piu' affollata;
  // `w/h` sono l'ingombro del piano in pixel a zoom 1, e servono a `fitZoom()`
  // per calcolare quanto ingrandire perche' la plancia entri nello spazio.
  ctx._geo = { minX, maxY, cell, w: cols * cell, h: rows * cell };
  const scr = (n) => { const [TX, TY] = lay[n.t]; return { l: ((TX - minX) * 4 + n.x) * cell, t: ((maxY - TY) * 4 + (3 - n.y)) * cell }; };
  const attivo = eroiAttivoNome();

  // Mentre agisce la notte NON si accende niente: le caselle turchesi
  // dell'eroe attivo restavano accese durante il turno dei nemici, e sembrava
  // di poter giocare mentre invece si aspetta.
  // Le caselle si accendono solo per chi le puo' davvero toccare: sul telefono
  // di chi gioca Elena non ha senso illuminare il cammino di Ottone.
  const ragg = senzaMosse ? {}
    : sp.escaModo ? (posso(sp.escaModo) ? celleEsca(sp.escaModo) : {})
    : attivo ? (posso(attivo) ? raggEroe(attivo) : {})
    : (scortAttivo() != null && arbitro() ? raggScortato(scortAttivo()) : {});

  // blocchi tessera: rivelate (sfondo + griglia) e frontiera (coperte, scure)
  const tiles = mostrate.map((id) => {
    const [TX, TY] = lay[id]; const left = (TX - minX) * 4 * cell, top = (maxY - TY) * 4 * cell, size = 4 * cell;
    if (!rev.includes(id)) {
      return `<div class="tessera-b coperta" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px">
        <div class="tess-tag">${id} · ?</div></div>`;
    }
    const tile = tileDi(id); const arr = arrediSet(tile);
    let cells = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const gx = c, gy = 3 - r; const a = arr.has(chiave([gx, gy]));
      cells += `<div class="cella-b${a ? ' arredo' : ''}" style="left:${c * cell}px;top:${r * cell}px;width:${cell}px;height:${cell}px"></div>`;
    }
    const bg = urlBoard(id);
    return `<div class="tessera-b" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px;${bg ? `background-image:url('${bg}')` : ''}">
      ${cells}<div class="tess-tag">${id}</div></div>`;
  }).join('');

  // etichette DOM leggibili su porte e ingresso (il testo stampato nel PNG e'
  // troppo piccolo a schermo; queste scalano con la tessera). pointer-events:none.
  const fs = Math.round(cell * 0.16);
  const etichette = rev.map((id) => {
    const tile = tileDi(id); const out = [];
    for (const [dir, raw] of Object.entries(tile.exits || {})) {
      const dc = portaCella(tile, dir); const p = scr({ t: id, x: dc[0], y: dc[1] });
      const grata = /grata/i.test(raw);
      out.push(`<div class="porta-lbl" style="left:${p.l + cell / 2}px;top:${p.t + cell / 2}px;font-size:${fs}px">verso ${dirExit(raw)}${grata ? ' ⛓' : ''}</div>`);
    }
    if (tile.start) { const dc = portaCella(tile, tile.start); const p = scr({ t: id, x: dc[0], y: dc[1] }); out.push(`<div class="porta-lbl ingresso" style="left:${p.l + cell / 2}px;top:${p.t + cell / 2}px;font-size:${fs}px">ingresso</div>`); }
    return out.join('');
  }).join('');

  // celle raggiungibili (cliccabili) sopra le tessere
  const raggHtml = Object.values(ragg).map((v) => {
    const p = scr(v.node);
    return `<div class="cella-mossa${v.reveal ? ' reveal' : ''}" style="left:${p.l}px;top:${p.t}px;width:${cell}px;height:${cell}px"
      data-t="${v.node.t}" data-x="${v.node.x}" data-y="${v.node.y}"${v.reveal ? ` data-reveal="${v.reveal}"` : ''}></div>`;
  }).join('');

  // token — `data-tok` sul .tok-slot per indirizzarlo nell'animazione (N:i / E:nome / R)
  const toks = [];
  const tok = (n, inner, dataTok) => { const p = scr(n); toks.push(`<div class="tok-slot" data-tok="${dataTok}" style="left:${p.l}px;top:${p.t}px;width:${cell}px;height:${cell}px">${inner}</div>`); };
  for (const [nm, p] of Object.entries(sp.eroiPos)) {
    const e = eroe(nm); const giu = (viteVista(nm) ?? 0) <= 0;
    tok(p, `<span class="tok-board eroe${nm === attivo ? ' attivo' : ''}${giu ? ' giu' : ''}" data-eroe="${esc(nm)}" title="${esc(nm)}">
      ${e && e.art ? `<img src="${urlArt(e.art)}" alt="" loading="lazy">` : ''}</span>`, `E:${esc(nm)}`);
  }
  sp.nemici.forEach((n, i) => {
    if (!n.pos) return; const st = nemStat(n.nome); const boss = st && st.boss ? ' boss' : '';
    tok(n.pos, `<span class="tok-board nemico${boss}" data-nemico="${i}" title="${esc(n.nome)} ${n.ferite}/${n.max}">
      ${st && st.art ? `<img src="${urlArt(st.art)}" alt="" loading="lazy">` : ''}</span>`, `N:${i}`);
  });
  statoScortati().forEach((g, i) => {
    if (!g.liberato || !g.pos) return; const s = specScort(i);
    tok(g.pos, `<span class="tok-board scortato${scortAttivo() === i ? ' attivo' : ''}" data-scortato="${i}" title="${esc(s.nome || '')}">
      ${s.art ? `<img src="${urlArt(s.art)}" alt="">` : ''}</span>`, `S:${i}`);
  });
  if (sp.esca) tok(sp.esca, '<span class="tok-board esca" title="l’esca di Carbone">◆</span>', 'ESCA');

  return `<div class="board-digitale" style="width:${cols * cell}px;height:${rows * cell}px;zoom:${SP().zoom || 1}">
    ${tiles}${etichette}${raggHtml}${toks.join('')}</div>`;
}

function logHtml() {
  const sp = SP();
  return `<div class="diario">${sp.log.slice(-6).map((l) => `<p class="nota">${esc(l)}</p>`).join('')}</div>`;
}
// Salute MOSTRATA. Nella fase nemici lo stato e' gia' committato prima
// dell'animazione (cosi' un reload trova una fase eroi coerente): senza questo
// filtro il board disegnerebbe subito a terra chi cade a meta' animazione, e si
// vedrebbero i nemici accanirsi su un corpo. `ctx.viteVista` e' la fotografia a
// inizio fase, aggiornata colpo per colpo mentre l'animazione scorre.
const viteVista = (nm) => (ctx.viteVista ? ctx.viteVista[nm] : SP().vite[nm]);
function saluteHtml() {
  return P().party.map((nm) => {
    const e = eroe(nm); const max = saluteMax(e); const v = viteVista(nm) ?? max;
    // `mia` marca la riga di chi guarda: sul telefono la propria salute non e'
    // una riga come le altre, e' la prima cosa che si cerca
    return `<div class="nemico-riga${nm === mioEroe() ? ' mia' : ''}" data-eroe="${esc(nm)}"><span class="nemico-nome"><button class="lnk-eroe" data-scheda="${esc(nm)}"
      title="scheda di ${esc(nm.toLowerCase())}">${esc(primo(nm))}</button>${v <= 0 ? ' <b>a terra</b>' : ''}</span>
      <span class="nemico-pips">${Array.from({ length: max }, (_, k) => `<span class="pip-vita ${k < v ? 'piena' : ''}"></span>`).join('')}</span></div>`;
  }).join('');
}
function nemiciHtml() {
  const sp = SP();
  return sp.nemici.map((n) => {
    const st = nemStat(n.nome);
    return `<div class="nemico-riga"><span class="nemico-nome">${esc(n.nome.toLowerCase())}${n.num > 1 ? ' ' + n.num : ''}
      <span class="nota">${esc(n.pos ? n.pos.t : '?')} · Att +${st.att} · Dif ${st.dif} · Dan ${st.dan}</span></span>
      <span class="nemico-pips">${Array.from({ length: n.max }, (_, k) => `<span class="pip-ferita ${k < n.ferite ? 'piena' : ''}"></span>`).join('')}</span></div>`;
  }).join('');
}
const primo = stat.primo;
const eroiAttivoNome = () => stat.eroiAttivoNome(G());
function giroEroiHtml() {
  const sp = SP(); const fatti = sp.eroiFatti || []; const attivo = eroiAttivoNome();
  const chips = P().party.map((nm) => {
    const e = eroe(nm); const done = fatti.includes(nm); const giu = (sp.vite[nm] ?? 0) <= 0;
    // `eroe`: la striscia dei turni la usano anche i nemici, con le stesse
    // classi — senza questo il CSS non puo' dare all'eroe di turno un colore
    // diverso da quello del nemico di turno (vedi `.chip-turno.ritratto.eroe`)
    return `<button class="chip-turno ritratto eroe${nm === attivo ? ' attivo' : ''}${done || giu ? ' fatto' : ''}" data-turno="${esc(nm)}">
      <span class="rit"><img src="${e && e.art ? urlArt(e.art) : ''}" alt=""></span><span class="et">${done ? '✓ ' : ''}${esc(primo(nm))}</span></button>`;
  });
  // chip dei PNG scortati: unità mosse dal giocatore (Mov 3, non agiscono)
  statoScortati().forEach((g, i) => {
    if (!g.liberato) return; const s = specScort(i);
    chips.push(`<button class="chip-turno ritratto scortato${scortAttivo() === i ? ' attivo' : ''}${g.mosso ? ' fatto' : ''}" data-scortato-chip="${i}">
      <span class="rit"><img src="${s.art ? urlArt(s.art) : ''}" alt=""></span><span class="et">${g.mosso ? '✓ ' : ''}${esc((s.nome || '').toLowerCase())}</span></button>`);
  });
  return `<div class="giro-strip">${chips.join('')}</div>`;
}
// celle raggiungibili da un PNG scortato (Mov 3): passa per eroi/porte, blocca
// sui nemici, non rivela tessere, non si ferma su celle occupate
const raggScortato = (i) => stat.raggScortato(G(), i);

// ------------------------------------------------------------------ azioni
const tipiAzione = { muovere: 'Muovere', attaccare: 'Attaccare', cercare: 'Cercare', interagire: 'Interagire', rianimare: 'Rianimare', abilita: 'Abilità', oggetto: 'Oggetto' };
const azioniOf = (nm) => stat.azioniOf(G(), nm);
const azioneSpesa = (nm, tipo) => stat.azioneSpesa(G(), nm, tipo);
const stordito = (nm) => stat.stordito(G(), nm);
const azioniMax = (nm) => stat.azioniMax(G(), nm);
const azioniRestano = (nm) => stat.azioniRestano(G(), nm);

function azioniHtml() {
  const sp = SP();
  const iS = scortAttivo();
  if (iS != null) {
    const s = specScort(iS); const mov = s.mov || 3; const nome = s.nome || 'il PNG';
    const n = Object.keys(raggScortato(iS)).length;
    return `<p class="nota">Tocca a <b>${esc(nome)}</b> — si muove con voi (Mov ${mov}), <b>non compie azioni</b>.</p>
      <p class="nota mt">${n ? `▸ Tocca una <b class="verde">casella verde</b> per muovere ${esc(nome)} (fino a ${mov} caselle). Portalo in <b>${esc(s.meta || '')}</b> per vincere.` : `▸ ${esc(nome)} non ha caselle libere raggiungibili (nemici o arredi intorno).`}</p>
      <div class="btn-riga mt"><button class="btn pieno" id="rug-fine">${esc(nome)} ha finito →</button></div>`;
  }
  const attivo = eroiAttivoNome();
  if (!attivo) {
    // PNG scortati liberati e non ancora mossi: il loro turno va OFFERTO qui,
    // altrimenti non arriva mai (si muovono nel turno degli eroi, che e' finito)
    const daMuovere = statoScortati()
      .map((g, i) => ({ g, i })).filter(({ g }) => g.liberato && g.pos && !g.mosso);
    return `<p class="nota">Tutti gli eroi hanno agito.${daMuovere.length
      ? ` Prima che la notte reagisca, ${daMuovere.map(({ i }) => `<b>${esc(specScort(i).nome)}</b>`).join(' e ')} può ancora seguirvi.`
      : ' La notte reagisce.'}</p>
      <div class="btn-riga">
        ${daMuovere.map(({ i }) => `<button class="btn" data-scortato-chip="${i}">muovi ${esc((specScort(i).nome || '').toLowerCase())} →</button>`).join('')}
        ${arbitro() ? `<button class="btn${daMuovere.length ? '' : ' pieno'}" id="fase-minaccia">fase minaccia →</button>`
          // la notte la chiama chi conduce: il Durable Object rifiuta il comando
          // a chiunque altro, e offrire un bottone che verra' rifiutato e' peggio
          // che non offrirlo
          : '<span class="nota">quando tutti hanno finito, la notte la chiama chi arbitra.</span>'}
      </div>`;
  }
  const fatte = azioniOf(attivo);
  const inter = interazioneDisponibile(attivo);
  const pos = sp.eroiPos[attivo];
  const giuVicino = P().party.some((nm) => nm !== attivo && (sp.vite[nm] ?? 1) <= 0 && adiacGlob(pos, sp.eroiPos[nm]));
  // riga movimento contestuale: gia' mosso / bloccato / caselle disponibili
  const mosseSpese = azioneSpesa(attivo, 'muovere');
  const nMosse = mosseSpese ? 0 : Object.keys(raggEroe(attivo)).length;
  const rigaMossa = mosseSpese
    ? `▸ <b>${esc(primo(attivo))}</b> ha già usato il movimento (1 per turno): ora può attaccare, cercare o passare.`
    : nMosse
      ? `▸ Tocca una <b class="verde">casella verde</b> per muovere ${esc(primo(attivo))} (fino a ${movimento(attivo)} caselle; le porte si attraversano a piedi, le caselle <b class="oro">dorate</b> rivelano una stanza nuova).`
      : `▸ Nessuna casella raggiungibile: ${esc(primo(attivo))} è <b>bloccato</b> (nemici o arredi tutt'intorno). Può attaccare un nemico adiacente, cercare o passare.`;
  return `
    <p class="nota">Tocca a <b>${esc(primo(attivo))}</b> — ${fatte.length}/${azioniMax(attivo)} azioni${fatte.length ? ' (' + fatte.map((t) => tipiAzione[t]).join(', ') + ')' : ''}${stordito(attivo) ? ' <b class="ko-txt">· stordito (1 azione)</b>' : ''}.</p>
    <p class="nota mt">${rigaMossa}<br>
    ▸ Tocca un <b>nemico adiacente</b> per attaccarlo.<br>
    ▸ Tocca un'altra <b>pedina</b> sul board per farla agire.</p>
    <div class="btn-riga mt">
      ${inter && azioniRestano(attivo) && !azioneSpesa(attivo, 'interagire') ? `<button class="btn" id="az-interagire">${esc(etichettaInterazione(inter))}</button>` : ''}
      ${giuVicino && azioniRestano(attivo) && !azioneSpesa(attivo, 'rianimare') ? '<button class="btn" id="az-rianimare">Rianimare</button>' : ''}
      ${azioniRestano(attivo) && !azioneSpesa(attivo, 'cercare') ? '<button class="btn" id="az-cercare">Cercare</button>' : ''}
      ${azioniRestano(attivo) && (P().indagine.oggetti || []).length ? '<button class="btn" id="az-oggetto">Usa oggetto</button>' : ''}
      ${posso(attivo) ? `<button class="btn pieno" id="az-fine">«${esc(primo(attivo))}» ha finito →</button>`
        : `<p class="nota">Tocca a ${esc(primo(attivo))}. Aspetta il suo turno.</p>`}
    </div>`;
}

// ------------------------------------------- abilità di spedizione (cariche)
// La tabella sta in motore/abilita.js e da li' viene: tenerne una copia qui
// vorrebbe dire due elenchi di cariche che divergono al primo ritocco — che e'
// esattamente il guaio da cui questa fase e' partita.
const { CARICHE_SPED, caricaDi } = abilita;

function abilitaHtml() {
  const sp = SP(); const attivo = eroiAttivoNome();
  const righe = P().party.map((nm) => {
    const c = caricaDi(nm); if (!c) return '';
    const breve = primo(nm);
    if (c.usi === null) {
      return `<div class="nemico-riga"><span class="nemico-nome">${esc(breve)} · ${esc(c.ab.toLowerCase())}<br><span class="nota">${esc(c.nota)}</span></span>
        <span class="nota">automatica</span></div>`;
    }
    const usate = (sp.abilita && sp.abilita[nm]) || 0; const rest = c.usi - usate;
    const pips = Array.from({ length: c.usi }, (_, k) => `<span class="pip-vita ${k < rest ? 'piena' : ''}"></span>`).join('');
    const puo = nm === attivo && rest > 0 && azioniRestano(nm) && sp.fase === 'eroi';
    return `<div class="nemico-riga">
      <span class="nemico-nome">${esc(breve)} · ${esc(c.ab.toLowerCase())}<br><span class="nota">${esc(c.nota)}</span></span>
      <span class="nemico-comandi"><span class="nemico-pips">${pips}</span>
        ${puo ? `<button class="btn attacca" data-abil="${esc(nm)}">usa</button>` : ''}</span></div>`;
  }).join('');
  return righe || '<p class="nota">Nessun eroe con abilità a cariche in questo party.</p>';
}

// selezione bersaglio (overlay) — riusa lo stile .scelta-overlay del tavolo
function scegli(titolo, opzioni) {
  return new Promise((ris) => {
    const ov = document.createElement('div'); ov.className = 'scelta-overlay';
    ov.innerHTML = `<div class="scelta-box"><h3 class="sc">${esc(titolo)}</h3>
      ${opzioni.map((o) => `<button class="btn scelta-btn" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      <button class="btn scelta-btn annulla" data-id="">annulla</button></div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('button').forEach((b) => b.onclick = () => { ov.remove(); ris(b.dataset.id || null); });
  });
}

// distanza (in caselle-cammino) tra due nodi, ignorando i blocchi (per gittate/raggi)
const distGlob = (a, b) => griglia.distGlob(G(), a, b);

// Le abilita' a cariche sono passate in motore/abilita.js. Qui resta il ponte:
// si chiede al motore COSA serve (`candidati`, che i candidati li calcola dallo
// stato), lo si domanda al giocatore, e si manda un comando gia' completo.
// Niente piu' `await scegli()` in mezzo a una regola.
async function usaAbilita(nm) {
  const chiede = abilita.candidati(G(), nm);
  if (chiede && chiede.vuoto) { flash(chiede.vuoto); return; }

  // L'ESCA si posa toccando la plancia, non scegliendo da una lista: si accende
  // il modo di mira e il comando parte dal click sulla casella (piu' sotto).
  // `escaModo` da qui in poi e' stato di VISTA, non piu' un mezzo turno salvato.
  if (chiede && chiede.celle) {
    SP().escaModo = nm; salvaP(); render();
    flash(chiede.tocca);
    return;
  }

  let scelta = null;
  if (chiede && chiede.opzioni) {
    scelta = await scegli(chiede.titolo, chiede.opzioni);
    if (scelta == null) return;                 // chi annulla non spende niente
  }
  await esegui({ tipo: 'abilita', eroe: nm, scelta });
}

// VOCE FERMA di Serra: +2 alle prove NERVI degli eroi a lui adiacenti. Vale
// «fino al suo prossimo turno» — cioe' per tutto il round in cui la usa, e nel
// round dopo finche' Serra non ha ancora speso un'azione. L'adiacenza si
// guarda al momento del tiro, non a quello dell'abilita': e' la sua voce che
// arriva, e se ti allontani non ti arriva piu'.
const bonusVoce = (nm, quale) => stat.bonusVoce(G(), nm, quale);

// una prova richiesta da un testo (oggetto/tessera/carta): "... NERVI (Media) ..."
function provaRichiesta(text) {
  const m = String(text || '').match(/(NERVI|ACUME|VIGORE)\s*\((Facile|Media|Difficile)\)/i);
  if (!m) return null;
  return { stat: m[1].toLowerCase(), diff: m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() };
}
// applica la conseguenza di una prova fallita in base al testo (danno e/o
// stordimento); ritorna le righe da mostrare. Il salvataggio lo fa il chiamante.
function applicaConseguenza(nm, testo) {
  const sp = SP(); const e = eroe(nm); const out = [];
  if (/danno/i.test(testo)) { sp.vite[nm] = Math.max(0, (sp.vite[nm] ?? saluteMax(e)) - 1); out.push(`${primo(nm)} subisce 1 danno.`); }
  if (/(1 sola azione|perdete 1 azione|perde 1 azione|azione al prossimo turno)/i.test(testo)) {
    sp.storditi = sp.storditi || {}; sp.storditi[nm] = sp.round + 1; out.push(`${primo(nm)} è stordito: 1 sola azione al prossimo turno.`);
  }
  if (!out.length) out.push(`${primo(nm)}: applica la conseguenza descritta.`);
  return out;
}
// eroe piu' avanzato = sulla tessera rivelata piu' lontana da T1 (origine layout)
const eroePiuAvanzato = (vivi) => vittoria.eroePiuAvanzato(G(), vivi);
// chi subisce l'insidia di una carta Minaccia, dal testo
async function bersagliInsidia(rules) {
  const vivi = P().party.filter((nm) => (SP().vite[nm] ?? 0) > 0);
  if (!vivi.length) return [];
  if (/ogni eroe/i.test(rules)) return vivi;
  if (/pi(ù|u') avanzat/i.test(rules)) return [eroePiuAvanzato(vivi)];
  const chi = await scegli('Quale eroe affronta l’insidia?', vivi.map((nm) => ({ id: nm, label: primo(nm) })));
  return chi ? [chi] : [];
}
// La notte sta agendo altrove: qui si guarda. Non e' una schermata vuota per
// pigrizia — e' l'unica cosa onesta da mostrare a chi non ha nulla da toccare.


// LA CARTA APERTA, disegnata dallo stato. Chi conduce la chiude e passa alla
// prossima; chi gioca la guarda e basta — la pesca non e' sua, e un «continua»
// che non fa continuare niente sarebbe una bugia.
function schermataCarta(aperta) {
  const { app } = ctx;
  app.classList.remove('immersivo');
  app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(aperta.titolo || 'minaccia')}</div><span></span></div>
    <div class="pannello">
      <div class="carta-grande"><img src="${urlCarta(aperta.carta.file)}" alt=""></div>
      <p class="mt">${rendi(aperta.carta.rules)}</p>
      ${(aperta.annunci || []).map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join('')}
    </div>
    ${arbitro()
      ? '<div class="btn-riga"><button class="btn pieno" id="ok-msg">continua</button></div>'
      : '<p class="nota mt center">la sta leggendo chi arbitra…</p>'}`;
  const b = app.querySelector('#ok-msg');
  if (b) b.onclick = async () => {
    b.disabled = true;
    await esegui({ tipo: 'carta-vista' });
  };
}

// carta Minaccia con eventuale prova d'insidia (nessun eroe attivo in questa fase)
function messaggioCarta(titolo, carta, annunci) {
  return new Promise((ok) => {
    const { app } = ctx; const req = provaRichiesta(carta.rules);
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">
        <div class="carta-grande"><img src="${urlCarta(carta.file)}" alt=""></div>
        <p class="mt">${rendi(carta.rules)}</p>
        ${annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join('')}
        <div id="ins-esito"></div>
      </div>
      ${req && arbitro() ? '<p class="nota mt"><b class="ko-txt">Insidia:</b> risolvete la prova prima di continuare.</p>' : ''}
      ${arbitro() ? `<div class="btn-riga">
        ${req ? '<button class="btn pieno" id="ins-risolvi">🎲 risolvi la prova richiesta</button>' : ''}
        <button class="btn pieno" id="ok-msg"${req ? ' style="display:none"' : ''}>continua</button>
      </div>`
      // SUL TELEFONO DI CHI GIOCA nessun bottone: la pesca e' di chi arbitra, e
      // un «continua» che non fa continuare niente sarebbe una bugia. La carta
      // resta finche' il tavolo non va avanti — deciso il 13/08/2026: il
      // telefono si ferma insieme al tavolo, e la pesca resta un momento di
      // scena invece di una notifica.
      : '<p class="nota mt center">la sta leggendo chi arbitra…</p>'}`;
    // Niente da agganciare — ma la promessa va tenuta, non abbandonata: se
    // restasse appesa, la catena di `riproduci()` non finirebbe mai e ogni
    // carta successiva ne lascerebbe un'altra dietro. Si scioglie quando il
    // tavolo manda lo stato dopo (vedi `incassa()`).
    if (!arbitro()) { ctx.chiudiCarta = ok; return; }
    app.querySelector('#ok-msg').onclick = ok;
    const rb = app.querySelector('#ins-risolvi');
    if (rb) rb.onclick = async () => {
      rb.disabled = true;
      const targets = await bersagliInsidia(carta.rules);
      if (!targets.length) { rb.disabled = false; return; }
      const esiti = [];
      for (const t of targets) {
        const e = eroe(t);
        const r = await tiraProva({ titolo: `${req.stat.toUpperCase()} — ${primo(t)}`, diffLabel: req.diff,
          soglia: ctx.comune.regole.diff[req.diff],
          bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }, ...bonusVoce(t, req.stat)], modo: modoDadi() });
        if (r == null) { rb.disabled = false; return; }
        if (r.ok) esiti.push(`${primo(t)}: prova superata.`);
        else esiti.push(...applicaConseguenza(t, carta.rules));
      }
      salvaP();
      app.querySelector('#ins-esito').innerHTML = esiti.map((x) => `<p class="nota mt">${esc(x)}</p>`).join('');
      rb.style.display = 'none';
      app.querySelector('#ok-msg').style.display = '';   // sblocca «continua» solo dopo la prova
    };
  });
}

// messaggio con eventuale prova CONTESTUALE: se provaText richiede una prova,
// compare il tiro; l'esito applica 1 danno se il testo lo prevede in caso di fallimento.
function messaggioProva(titolo, corpo, provaText, nm) {
  return new Promise((ok) => {
    const req = provaRichiesta(provaText); const { app } = ctx;
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">${corpo}<div id="prova-esito"></div></div>
      <div class="btn-riga">
        ${req && nm ? `<button class="btn" id="msg-prova">🎲 tira la prova (${req.stat.toUpperCase()} ${req.diff})</button>` : ''}
        <button class="btn pieno" id="ok-msg">continua</button>
      </div>`;
    app.querySelector('#ok-msg').onclick = ok;
    const pb = app.querySelector('#msg-prova');
    if (pb) pb.onclick = async () => {
      pb.disabled = true; const e = eroe(nm); const sp = SP();
      const r = await tiraProva({ titolo: `${req.stat.toUpperCase()} — ${primo(nm)}`, diffLabel: req.diff,
        soglia: ctx.comune.regole.diff[req.diff],
        bonus: [{ label: req.stat.toUpperCase(), val: e[req.stat] }, ...bonusVoce(nm, req.stat)], modo: modoDadi() });
      if (r == null) { pb.disabled = false; return; }
      let out = r.ok ? '<p class="ok-txt mt">Prova superata.</p>' : '<p class="ko-txt mt">Prova fallita.</p>';
      if (!r.ok) { out += applicaConseguenza(nm, provaText).map((x) => `<p class="nota">${esc(x)}</p>`).join(''); salvaP(); }
      app.querySelector('#prova-esito').innerHTML = out;
    };
  });
}

// Interagire e usare-oggetto sono passate in motore/interazioni.js. Qui resta
// LA DIDASCALIA, che e' l'unica parte davvero di questa vista: prima la regola
// restituiva anche la `label` del bottone, cioe' sapeva come si scrive in
// italiano quel che permette.
const interazioneDisponibile = (nm) => interazioni.interazioneDisponibile(G(), nm);
const specUscita = () => interazioni.specUscita(G());
const nomeScortato = () => interazioni.nomeScortato(G());

function etichettaInterazione(d) {
  if (!d) return '';
  if (d.tipo === 'grata') return `Apri la grata → ${d.verso}`;
  if (d.tipo === 'scortato') return specScort(d.i).etichetta || `Libera ${specScort(d.i).nome} (Interagire)`;
  if (d.tipo === 'uscita') return `Sposta ${String(d.arredo[2]).toLowerCase()} — l'uscita che indica ${nomeScortato()} (Interagire)`;
  if (d.tipo === 'compito') {
    const c = d.c;
    if (d.bloccato === 'fuori-posto') return `${c.etichetta} — non qui: si fa in ${c.fuoriPosto}`;
    if (d.bloccato === 'in-forze') return `${c.etichetta} — prima a ${c.soglia} Ferite (${c.bloccato.ferite}/${c.bloccato.max})`;
    return `${c.etichetta} (${d.fatte}/${c.quante})`;
  }
  return 'Interagire';
}

// Il ponte per «usa oggetto»: la lista la sa l'inventario, il resto il motore.
async function usaOggetto(nm) {
  const inv = P().indagine.oggetti || [];
  if (!inv.length) { flash('Inventario del gruppo vuoto.'); return; }
  const scelto = await scegli('usa quale oggetto?', inv.map((o) => ({ id: o, label: o.toLowerCase() })));
  if (!scelto) return;
  await esegui({ tipo: 'oggetto', eroe: nm, quale: scelto });
}

function aggancia() {
  const { app } = ctx; const sp = SP(); const attivo = eroiAttivoNome();
  app.querySelectorAll('.cella-mossa').forEach((c) => c.onclick = async () => {
    if (scivolando) return;                     // gia' in cammino
    const node = { t: c.dataset.t, x: +c.dataset.x, y: +c.dataset.y };
    // l'esca si posa e basta: nessuno scivola, e la carica si spende ORA —
    // fino a qui il giocatore poteva ancora cambiare idea
    if (sp.escaModo) {
      const nm = sp.escaModo; sp.escaModo = null;
      await esegui({ tipo: 'abilita', eroe: nm, cella: node });
      return;
    }
    const scort = scortAttivo();
    if (scort == null && !attivo) return;
    scivolando = true;
    try {
      // prima il passo, poi lo stato: il comando finisce con un ridisegno, e
      // se arrivasse per primo il token sarebbe gia' a destinazione. Anche la
      // prova d'ingresso di una tessera insidiosa deve partire a passo finito,
      // o il dado comparirebbe col token ancora per strada.
      await scivolaEroe(scort != null ? `S:${scort}` : `E:${attivo}`, node);
      if (scort != null) muoviScortato(scort, node);
      else await esegui({ tipo: 'muovi', eroe: attivo, nodo: node, rivela: c.dataset.reveal || null });
    } finally { scivolando = false; }
  });
  app.querySelectorAll('[data-nemico]').forEach((el) => el.onclick = () => { if (attivo) esegui({ tipo: 'attacca', eroe: attivo, bersaglio: Number(el.dataset.nemico) }); });
  app.querySelectorAll('[data-eroe]').forEach((el) => el.onclick = () => {
    const nm = el.dataset.eroe; if ((sp.vite[nm] ?? 0) <= 0) return;
    sp.scortAttivo = null;
    sp.escaModo = null;              // via d'uscita: chi ci ripensa tocca un eroe
    const i = sp.eroiFatti.indexOf(nm); if (i >= 0) sp.eroiFatti.splice(i, 1);
    sp.eroiAttivo = nm; salvaP(); render();
  });
  // selezione di un PNG scortato (pedina sul board o chip nel giro)
  const selScort = (el, attr) => el.onclick = () => {
    const i = Number(el.dataset[attr]);
    if (!(statoScortati()[i] || {}).liberato) return;
    sp.scortAttivo = i; salvaP(); render();
  };
  app.querySelectorAll('[data-scortato]').forEach((el) => selScort(el, 'scortato'));
  app.querySelectorAll('[data-scortato-chip]').forEach((el) => selScort(el, 'scortatoChip'));
  app.querySelector('#rug-fine') && (app.querySelector('#rug-fine').onclick = () => { sp.scortAttivo = null; salvaP(); render(); });
  app.querySelectorAll('[data-turno]').forEach((b) => b.onclick = () => {
    const nm = b.dataset.turno; if ((sp.vite[nm] ?? 0) <= 0) return;
    const i = sp.eroiFatti.indexOf(nm); if (i >= 0) sp.eroiFatti.splice(i, 1);
    sp.eroiAttivo = nm; salvaP(); render();
  });
  app.querySelectorAll('[data-obj]').forEach((b) => b.onclick = () => {
    const nm = (P().indagine.oggetti || [])[Number(b.dataset.obj)];
    const o = (ctx.ep.oggetti || []).find((x) => norm(x.nome) === norm(nm));
    const c = cartaOggetto(ctx.carte, P().episodio, nm);
    messaggio(nm.toLowerCase(), `${c ? `<div class="carta-grande"><img src="${urlCarta(c.file)}" alt=""></div>` : ''}
      ${o && o.effetto ? `<p class="mt">${rendi(o.effetto)}</p>` : ''}${o && o.flavor ? `<p class="nota mt"><i>${rendi(o.flavor)}</i></p>` : ''}`).then(render);
  });
  app.querySelectorAll('[data-abil]').forEach((btn) => btn.onclick = () => usaAbilita(btn.dataset.abil));
  // (usaAbilita e' un ponte: chiede i candidati al motore, poi manda `abilita`)
  app.querySelector('#az-cercare') && (app.querySelector('#az-cercare').onclick = () => esegui({ tipo: 'cerca', eroe: attivo }));
  app.querySelector('#az-oggetto') && (app.querySelector('#az-oggetto').onclick = () => usaOggetto(attivo));
  app.querySelector('#az-interagire') && (app.querySelector('#az-interagire').onclick = () => esegui({ tipo: 'interagisci', eroe: attivo }));
  app.querySelector('#az-rianimare') && (app.querySelector('#az-rianimare').onclick = () => esegui({ tipo: 'rianima', eroe: attivo }));
  app.querySelector('#az-fine') && (app.querySelector('#az-fine').onclick = () => esegui({ tipo: 'finisci-eroe', eroe: attivo }));
  app.querySelector('#fase-minaccia') && (app.querySelector('#fase-minaccia').onclick = faseMinaccia);
  agganciaMappa();
  centraSuAttivo();
  annunciaTurno();
}

// transizione di passaggio turno: un banner «tocca a <nome>» col ritratto, che
// compare e sfuma da solo quando l'eroe attivo cambia (non bloccante)
// banner riusabile di passaggio turno (ritratto/token + testo), compare e sfuma
function bannerTurno(imgUrl, testoHtml, variante) {
  document.querySelectorAll('.turno-banner').forEach((n) => n.remove());
  const el = document.createElement('div'); el.className = 'turno-banner' + (variante ? ' ' + variante : '');
  el.innerHTML = `<span class="rit"><img src="${imgUrl || ''}" alt=""></span><span class="tb-txt">${testoHtml}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 1600);
}
function annunciaTurno() {
  const attivo = eroiAttivoNome();
  if (ctx.ultimoAttivo === (attivo || null)) return;
  ctx.ultimoAttivo = attivo || null;
  if (!attivo || SP().fase !== 'eroi') return;
  const e = eroe(attivo);
  bannerTurno(e && e.art ? urlArt(e.art) : '', `tocca a<br><b>${esc(primo(attivo))}</b>`);
}

// centra la finestra su un nodo (casella) con scroll animato. `forza` ignora la
// cache (per ricentrare a ogni nemico anche se la chiave non cambia).
function centraSuNodo(node, key, forza) {
  const g = ctx._geo; const wrap = ctx.app.querySelector('#board-wrap'); if (!g || !wrap) return;
  if (!forza && ctx.ultimaCentrata === key) return;
  const z = SP().zoom || 1; const [TX, TY] = layout()[node.t] || [g.minX, g.maxY];
  const cx = ((TX - g.minX) * 4 + node.x + 0.5) * g.cell * z;
  const cy = ((g.maxY - TY) * 4 + (3 - node.y) + 0.5) * g.cell * z;
  wrap.scrollTo({ left: Math.max(0, cx - wrap.clientWidth / 2), top: Math.max(0, cy - wrap.clientHeight / 2), behavior: 'smooth' });
  ctx.ultimaCentrata = key;
}
// centra sull'eroe attivo (o sulla tessera piu' affollata in fase nemici).
// `forza`: ogni render() ricostruisce il board e azzera lo scroll, quindi va
// ricentrato SEMPRE (altrimenti dopo un attacco/ricerca — stessa posizione —
// il board resterebbe in alto a sinistra). Il pan manuale tra due azioni resta
// comunque: senza render lo scroll non si azzera.
function centraSuAttivo() {
  const sp = SP(); const attivo = eroiAttivoNome(); const iS = scortAttivo();
  // SUL TELEFONO SI PARTE DA SE'. Con nessun eroe attivo — fra un turno e
  // l'altro, o mentre agisce la notte — la vista si centrava sulla tessera piu'
  // affollata: su uno schermo piccolo voleva dire aprirsi su un angolo di mappa
  // coperta, con la propria pedina fuori campo. Chi guarda un telefono cerca
  // prima di tutto dov'e' il suo eroe.
  const mio = mioEroe();
  if (!arbitro() && mio && sp.eroiPos[mio] && (!attivo || attivo === mio) && iS == null) {
    const p = sp.eroiPos[mio];
    return centraSuNodo(p, `${mio}@${nk(p)}`, true);
  }
  if (iS != null && (statoScortati()[iS] || {}).pos) { const p = sp.scortati[iS].pos; centraSuNodo(p, `S${iS}@${nk(p)}`, true); }
  else if (attivo) { const p = sp.eroiPos[attivo]; centraSuNodo(p, `${attivo}@${nk(p)}`, true); }
  else { const t = tileAffollata(); centraSuNodo({ t, x: 1.5, y: 1.5 }, `_@${t}`, true); }
}

// zoom (pulsanti + Ctrl+rotella) e pan (trascinamento mouse/touch)
const clampZoom = (z) => Math.max(0.5, Math.min(2.6, z));
// Tetto separato per l'ADATTAMENTO automatico: `clampZoom` arriva a 2.6, ma con
// una sola tessera rivelata il fit ci arriverebbe davvero — bello sulla TV,
// esagerato su un portatile. E' la manopola da girare guardando lo schermo vero.
const MAX_FIT = 1.8;

// Lo zoom che fa entrare tutta la plancia nella finestra. Serve `ctx._geo.w/h`
// (l'ingombro del piano a zoom 1) e l'altezza VERA del contenitore: per questo
// `.board-wrap` ha `height` e non `max-height` — con `max-height` l'altezza del
// wrap e' quella del contenuto gia' zoomato, e il fit non ingrandirebbe mai.
function fitZoom() {
  const g = ctx._geo; const wrap = ctx.app.querySelector('#board-wrap');
  // guardia: senza misure meglio lo zoom corrente che un NaN, che JSON.stringify
  // salverebbe come null e riaprirebbe la partita senza zoom
  if (!g || !wrap || !g.w || !g.h || !wrap.clientWidth || !wrap.clientHeight) return SP().zoom || 1;
  return Math.min(MAX_FIT, clampZoom(Math.min((wrap.clientWidth - 4) / g.w, (wrap.clientHeight - 4) / g.h)));
}

// Applica lo zoom SENZA passare da render(). Non e' un'ottimizzazione: durante
// la fase nemici `render()` rilancia `faseNemiciAI()` (vedi :350), che non e'
// idempotente — ricostruisce il piano, rimuove le pedine e riapplica i danni.
// Prima di questo, toccare +/− mentre la notte si muoveva faceva giocare ai
// nemici un secondo turno. Qui si scrive solo lo stile, e il pan resta dov'era.
function applicaZoom(z) {
  const sp = SP(); const app = ctx.app;
  const wrap = app.querySelector('#board-wrap'); const board = app.querySelector('.board-digitale');
  const r = z / (sp.zoom || 1);
  sp.zoom = z; salvaP();
  if (board) board.style.zoom = z;
  // lo scroll si riscala attorno al centro visibile: lo zoom a bottoni resta
  // ancorato a quello che si sta guardando, non al vertice alto-sinistra
  if (wrap && isFinite(r) && r > 0) {
    wrap.scrollLeft = (wrap.scrollLeft + wrap.clientWidth / 2) * r - wrap.clientWidth / 2;
    wrap.scrollTop = (wrap.scrollTop + wrap.clientHeight / 2) * r - wrap.clientHeight / 2;
  }
}

// ------------------------------------------------------------ modo immersivo
// La plancia diventa il tabellone: schermo intero (dove il browser lo concede)
// e a schermo solo cio' che serve nel turno. Nasce per chi gioca su tablet con
// la TV che replica: da lontano le cornici e i pannelli di riferimento sono
// spazio rubato alla mappa.
//
// La preferenza sta in localStorage e NON dentro `partita`: e' una proprieta'
// dello schermo, non della partita — e soprattutto i piloti seminano
// `osr.partita.epN` da fixture, quindi un flag li' dentro renderebbe invisibili
// abilita', oggetti e resa, falsando in silenzio le misure di bilanciamento.
// Acceso di default: la Spedizione E' il tabellone, e chi entra qui vuole la
// mappa, non le cornici. Si spegne dal ⤢, e allora la scelta resta scritta —
// per questo il confronto e' con '0' e non con '1': l'assenza vale «acceso».
const CHIAVE_IMMERSIVO = 'osr.immersivo';
const immersivo = () => { try { return localStorage.getItem(CHIAVE_IMMERSIVO) !== '0'; } catch { return true; } };

// IL FULLSCREEN VA CHIESTO SU `document.documentElement`, MAI SU `#app`:
// `.turno-banner` e `.dadi-overlay` sono appesi a `document.body`, e con un
// sotto-elemento a schermo intero sparirebbero — compreso il pannello dei dadi,
// che al tavolo e' l'unico modo di dichiarare un tiro.
function chiediSchermoIntero(on) {
  const de = document.documentElement;
  try {
    if (on) { const f = de.requestFullscreen || de.webkitRequestFullscreen; f?.call(de, { navigationUI: 'hide' })?.catch?.(() => {}); }
    else { const u = document.exitFullscreen || document.webkitExitFullscreen; u?.call(document)?.catch?.(() => {}); }
  } catch { /* browser che non lo concede (iPhone): resta il layout, che e' il grosso */ }
}
const inSchermoIntero = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function impostaImmersivo(on) {
  // prima il layout, poi il fullscreen: dove l'API non c'e' il guadagno resta
  try { localStorage.setItem(CHIAVE_IMMERSIVO, on ? '1' : '0'); } catch { /* modalita' privata */ }
  ctx.app.classList.toggle('immersivo', on);
  chiediSchermoIntero(on);
  applicaZoom(fitZoom()); centraSuAttivo();
}

// uscendo verso il menu si spegne il layout ma NON si tocca la preferenza,
// altrimenti la si perderebbe ogni volta che si passa dal menu. Serve davvero:
// `.immersivo` ha `height:100%` e `overflow:hidden`, sopra il menu lo romperebbe.
function spegniImmersivo() {
  ctx.app.classList.remove('immersivo');
  if (inSchermoIntero()) chiediSchermoIntero(false);
}

function agganciaMappa() {
  const { app } = ctx; const sp = SP(); const wrap = app.querySelector('#board-wrap'); if (!wrap) return;
  // primo ingresso senza uno zoom salvato: si parte adattati, non a 1
  if (sp.zoom == null) applicaZoom(fitZoom());
  // Lo schermo intero i browser lo concedono solo su un gesto, e entrando non
  // ce n'e' uno (vedi vistaDigitale: li' si applica solo il layout). Il primo
  // tocco sulla mappa e' il gesto piu' vicino, e nel primo turno arriva sempre.
  // Il wrap e' un nodo nuovo a ogni render, quindi `once` non si accumula.
  if (immersivo() && !inSchermoIntero()) {
    wrap.addEventListener('pointerdown', () => chiediSchermoIntero(true), { once: true });
  }
  app.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
    const d = b.dataset.zoom;
    if (d === '0') return impostaImmersivo(!immersivo());   // ⤢ = schermo intero
    applicaZoom(clampZoom((sp.zoom || 1) * (d === '+' ? 1.25 : 0.8)));
  });
  wrap.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; e.preventDefault();
    applicaZoom(clampZoom((sp.zoom || 1) * (e.deltaY < 0 ? 1.1 : 0.9)));
  }, { passive: false });
  // Uscita dallo schermo intero decisa dal SISTEMA (ESC, gesto del browser): il
  // toggle deve restare sincronizzato, altrimenti il bottone mente. Assegnazione
  // a proprieta' e non addEventListener: `agganciaMappa` gira a ogni render e
  // accumulerebbe un listener per turno.
  const suCambioSchermo = () => {
    if (!inSchermoIntero() && immersivo()) { impostaImmersivo(false); return; }
    if (immersivo()) { applicaZoom(fitZoom()); centraSuAttivo(); }
  };
  document.onfullscreenchange = suCambioSchermo;
  document.onwebkitfullscreenchange = suCambioSchermo;
  // pan: trascina con il tasto sinistro o col dito
  let giu = false, sx = 0, sy = 0, sl = 0, st = 0, mosso = false;
  wrap.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    giu = true; mosso = false; sx = e.clientX; sy = e.clientY; sl = wrap.scrollLeft; st = wrap.scrollTop;
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!giu) return; const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) mosso = true;
    wrap.scrollLeft = sl - dx; wrap.scrollTop = st - dy;
  });
  const fine = () => { giu = false; };
  wrap.addEventListener('pointerup', fine); wrap.addEventListener('pointercancel', fine); wrap.addEventListener('pointerleave', fine);
  // se stavo trascinando, sopprimo il click accidentale su casella/pedina
  wrap.addEventListener('click', (e) => { if (mosso) { e.stopPropagation(); e.preventDefault(); mosso = false; } }, true);
}

// ---------------------------------------------------- il ponte col contratto
// Da qui in giu' la vista non applica piu' regole: manda un comando al motore,
// prende lo stato nuovo e METTE IN SCENA gli eventi che le tornano. Il dado lo
// tira il motore col generatore seminato della partita; qui lo si anima e basta.
//
// AL TAVOLO il dado e' di legno, quindi il giro e' rovesciato: prima si chiede
// il tiro (l'overlay mostra soglia e bonus, che `provaDi` dichiara senza
// tirare), poi si manda il comando con `tiri`. Se il motore ne vuole un altro
// — il secondo colpo di Ottone, che si sa solo dopo aver visto cadere il primo
// nemico — rifiuta con «i tiri dichiarati non bastano» e se ne chiede uno.
async function chiediTiro(prova) {
  const r = await tiraProva({
    titolo: prova ? prova.titolo : 'tira 2d6',
    diffLabel: prova ? (prova.diffLabel || '') : '',
    soglia: prova ? prova.soglia : null,
    bonus: prova ? prova.bonus : [],
    modo: 'tavolo',
  });
  return r ? [r.d1, r.d2] : null;
}

// INCASSARE UNO STATO NUOVO, da qualunque parte arrivi: dal motore qui dentro
// o dal tavolo. E' un punto solo perche' la cosa delicata e' una sola, ed e'
// bene che stia scritta una volta.
//
// SI TRAVASA, non si sostituisce. `applica()` lavora su una copia e restituisce
// uno stato nuovo — ma la vista tiene riferimenti a questi oggetti:
// `aggancia()` cattura `const sp = SP()` e li usa nei suoi gestori.
// Sostituendoli, quei gestori scriverebbero su un oggetto scartato, e il click
// andrebbe perso senza un errore.
async function incassa(stato, eventi) {
  // il tavolo e' andato avanti: la carta ferma sullo schermo di chi guarda ha
  // finito il suo compito
  if (ctx.chiudiCarta) { const chiudi = ctx.chiudiCarta; ctx.chiudiCarta = null; chiudi(); }
  const sped = SP();
  Object.assign(sped, stato.spedizione);
  Object.assign(ctx.partita, stato, { spedizione: sped });
  salvaP();
  await riproduci(eventi || []);
  if (SP().esito) { epilogo(); return true; }
  return false;
}

// La partita e' viva sul tavolo, non qui: si manda il comando e si aspetta.
// Il `rif` torna indietro con la spinta, cosi' la si riconosce come propria e
// non si riproducono gli eventi due volte.
let contatoreRif = 0;
async function eseguiSulTavolo(comando) {
  const rif = `${ctx.posto.ruolo}-${contatoreRif += 1}`;
  ctx.rifMiei.add(rif);
  try {
    const r = await fetch(`/api/tavolo/${encodeURIComponent(ctx.posto.tavolo)}/comando`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...comando, rif }),
    });
    const out = await r.json();
    if (!r.ok || out.rifiuto) { flash((out.rifiuto || {}).motivo || 'Il tavolo ha rifiutato la mossa.'); return false; }
    if (await incassa(out.stato, out.eventi)) return true;
    if (out.stato.pendenza) { await sciogliPendenza(out.stato.pendenza); return true; }
    render();
    return true;
  } catch {
    // il filo e' caduto a meta' mossa: non si applica niente in locale, perche'
    // uno stato inventato qui divergerebbe da quello del tavolo e non ci
    // sarebbe modo di accorgersene
    flash('Il tavolo non risponde. La mossa non è stata fatta.');
    return false;
  }
}

async function esegui(comando) {
  // I DADI SI CHIEDONO PRIMA DI DIRAMARE. Al tavolo i dadi sono di legno e il
  // numero lo dichiara chi gioca: la richiesta vale sia quando il motore gira
  // qui sia quando gira sul tavolo. Stava dentro il solo ramo locale, e con la
  // partita sul Durable Object il tiro non veniva piu' chiesto a nessuno — il
  // motore tirava da se', in silenzio, e a schermo si vedeva solo il danno
  // arrivare dal nulla.
  const alTav = alTavolo() && arbitro();
  const tiri = alTav ? [] : null;
  if (alTav) {
    const p = azioni.provaDi(G(), comando);
    if (p) { const d = await chiediTiro(p); if (!d) return false; tiri.push(d); }
  }
  if (ctx.posto && ctx.posto.tavolo && ctx.tavoloVivo) {
    return eseguiSulTavolo(tiri ? { ...comando, tiri } : comando);
  }

  // CHI GIOCA NON APPLICA MAI IN LOCALE. Il motore qui dentro c'e' per chi
  // arbitra da solo; per chi siede a un tavolo la partita vera sta sul tavolo,
  // e applicare qui vorrebbe dire farsi una partita propria che nessun altro
  // vede — due stati che divergono senza un errore. Se il filo non e' ancora
  // aperto (succede subito dopo un refresh) si aspetta, non si gioca.
  if (ctx.posto && ctx.posto.tavolo && ctx.posto.ruolo !== 'arbitro') {
    flash('Un momento: mi sto ricollegando al tavolo.');
    return false;
  }
  const dati = { ep: ctx.ep, comune: ctx.comune, carte: ctx.carte };
  // il tetto e' una rete, non una regola: nessuna azione chiede piu' di due o
  // tre dadi, e un ciclo senza fondo davanti a un giocatore e' peggio di un no
  for (let giro = 0; giro < 5; giro++) {
    const out = applica(ctx.partita, tiri ? { ...comando, tiri } : comando, dati);
    if (out.rifiuto) {
      if (tiri && /non bastano/i.test(out.rifiuto.motivo)) {
        const d = await chiediTiro(azioni.provaDi(G(), comando));
        if (!d) return false;
        tiri.push(d);
        continue;
      }
      flash(out.rifiuto.motivo);
      return false;
    }
    if (await incassa(out.stato, out.eventi)) return true;
    if (out.pendenza) { await sciogliPendenza(out.pendenza); return true; }
    render();
    return true;
  }
  flash('Troppi tiri richiesti: qualcosa non torna.');
  return false;
}

// Mettere in scena cio' che il motore ha gia' deciso. Nessun evento cambia lo
// stato: se qualcosa qui non venisse riprodotto, la partita sarebbe comunque
// giusta — solo muta.
async function riproduci(eventi) {
  for (const ev of eventi) {
    if (ev.tipo === 'tiro') {
      // a schermo il dado ha gia' un risultato: l'overlay lo mette in scena
      if (!alTavolo()) {
        await tiraProva({ titolo: ev.titolo || '', diffLabel: ev.diff || ev.diffLabel || '',
                          soglia: ev.soglia, bonus: ev.bonus, facce: ev.d });
      }
    } else if (ev.tipo === 'cercato') {
      const extra = ev.trovato
        ? `<hr class="divisore"><p class="mt"><b>Trovato:</b> ${esc(ev.trovato.nome.toLowerCase())} — nell'inventario del gruppo.</p>
           ${ev.trovato.effetto ? `<p class="nota mt">${rendi(ev.trovato.effetto)}</p>` : ''}`
        : '';
      await messaggio(`${ev.tessera} — cercare`, `<p><i>${rendi(ev.esito)}</i></p>${extra}`);
    } else if (ev.tipo === 'conseguenza') {
      await messaggio('la prova è fallita', ev.righe.map((r) => `<p>${esc(r)}</p>`).join(''));
    } else if (ev.tipo === 'abbattuto' || ev.tipo === 'a-terra') {
      flash(ev.tipo === 'abbattuto' ? `${ev.nome.toLowerCase()} è abbattuto!` : 'a terra: ora si può prendere.');
    } else if (ev.tipo === 'rivelata') {
      ctx.layout = null;                       // la mappa cresce: si ridisegna
    } else if (ev.tipo === 'turno-nemici') {
      // IL COPIONE DELLA NOTTE, gia' risolto dal motore: qui si mette solo in
      // scena. Vale per chi arbitra e per chi guarda dal telefono — e' lo
      // stesso piano, quindi nessuno dei due puo' vedere una notte diversa.
      const piano = ev.piano.slice();
      piano.vite0 = ev.vite0; piano.differito = ev.differito; piano.annunci = ev.annunci;
      await animaNotte(piano);
      // CHI GUARDA RIDISEGNA SUBITO. L'animazione lascia a schermo la plancia
      // della notte, e la fascia in cima resta quella di allora: si leggeva
      // «agisce la notte» col pannello sotto che diceva gia' «azioni di
      // lazzaro». Lo stato era giusto — era la vista vecchia di un istante.
      // Chi arbitra no: ha la sua coda (vistaNemici -> animazione -> chiusura)
      // e un render in mezzo la scavalcherebbe.
      if (!arbitro()) render();
    } else if (ev.tipo === 'carta') {
      // NIENTE: la carta aperta la disegna `render()` leggendola dallo stato
      // (`sp.carta`). Metterla in scena anche qui la mostrerebbe due volte, e
      // soprattutto la legherebbe di nuovo alla catena di animazione di chi
      // arbitra — che e' esattamente il motivo per cui sugli altri schermi ne
      // arrivava una sola.
    }
  }
}

// La pendenza a schermo: la domanda che il motore ha lasciato nello stato.
async function sciogliPendenza(pend) {
  const scelta = await scegli(pend.testo || 'scegli',
    pend.opzioni.map((o) => ({ id: String(o.id), label: o.label })));
  await esegui({ tipo: 'rispondi', scelta: scelta == null ? null : Number(scelta), a: pend.a });
}

function segnaAzione(nm, tipo) {
  const sp = SP(); if (!sp.azioni[nm]) sp.azioni[nm] = [];
  // Chi ha iniziato il turno lo TIENE finche' non dichiara di aver finito.
  // Senza questa riga l'eroe attivo resta quello scelto dal fallback di
  // eroiAttivoNome() (l'ordine del party), ricalcolato a ogni render: rianimare
  // un compagno lo rimette fra i vivi e, se sta prima nell'ordine, si prende il
  // turno rubando al rianimatore la seconda azione.
  sp.eroiAttivo = nm;
  sp.azioni[nm].push(tipo);
  if (controllaVittoria()) return;
  if (sp.azioni[nm].length >= azioniMax(nm)) finisciEroe(nm); else { salvaP(); render(); }
}

// ------------------------------------------------------- obiettivi d'episodio
// Fino al 22/07/2026 la modalita' digitale si poteva vincere SOLO muovendo un
// PNG scortato: le due condizioni stavano dentro `muoviScortato`, e quindici
// episodi su ventuno non avevano alcun modo di finire bene — l'obiettivo era
// una stringa mostrata a schermo e nient'altro. Qui c'e' il meccanismo
// generico, guidato dai dati (`ep.compiti` e `ep.vittoria` in webapp/data).
//
//   compiti:  [{ id, tile, quante, etichetta, prova?, cella? }]
//             N azioni Interagire sulla stessa tessera (le canne da sfregiare,
//             i movimenti da spegnere, le casse da sequestrare, i tell da
//             documentare). `prova` le rende incerte, `cella` le lega a un arredo.
//   vittoria: { tessera?, boss?, testo }
//             a compiti finiti serve, se dichiarato, che gli eroi vivi siano
//             tutti su `tessera` (il rientro) e/o che il boss sia a terra.
// Gli orologi d'episodio sono usciti di qui: stanno in motore/obiettivi.js.
// Sei meccaniche — compiti, orologio, rogo, cancellazione, ritmo, pressione,
// filo perso — che restituiscono gli annunci e non salvano piu' da sole: il
// salvataggio lo fa chi sa quando la transazione e' chiusa. I due `salvaP()`
// che stavano in mezzo alle regole sono qui sotto, nella stessa condizione di
// prima (solo quando l'esito scatta).
const specCompiti = () => obiettivi.specCompiti(G());
const statoCompiti = () => obiettivi.statoCompiti(G());
const compitoFatte = (id) => obiettivi.compitoFatte(G(), id);
const compitiFiniti = () => obiettivi.compitiFiniti(G());
const obiettivoFatto = () => obiettivi.obiettivoFatto(G());
const compitoDisponibile = (pos) => obiettivi.compitoDisponibile(G(), pos);
const specOrologio = () => obiettivi.specOrologio(G());
const specRogo = () => obiettivi.specRogo(G());
const rogoBrucia = (tileId) => obiettivi.rogoBrucia(G(), tileId);
const haProtezioneRogo = () => obiettivi.haProtezioneRogo(G());
const avanzaRogo = () => obiettivi.avanzaRogo(G());
const avanzaCancellazione = () => obiettivi.avanzaCancellazione(G());
const avanzaRitmo = () => obiettivi.avanzaRitmo(G());
const avanzaPressione = () => obiettivi.avanzaPressione(G());

function avanzaOrologio(quanto, motivo) {
  const ann = obiettivi.avanzaOrologio(G(), quanto, motivo);
  if (SP().esito) salvaP();          // com'era: si salva quando la traccia chiude la partita
  return ann;
}
function controllaFiloPerso() {
  const ann = obiettivi.controllaFiloPerso(G());
  if (ann.length) salvaP();          // com'era: si salva quando il filo si perde
  return ann;
}

// Le condizioni di chiusura sono uscite di qui: stanno in motore/vittoria.js.
// Dicono COM'E' finita e non disegnano piu' l'epilogo, cosi' le stesse righe
// valgono anche dove uno schermo non c'e'. Qui resta la coda — scrivere
// l'esito, salvare, mostrare — che e' l'unica parte che riguarda questa vista.
function chiudiPartita(out) {
  const sp = SP(); sp.esito = out.esito;
  if (out.riga) sp.log.push(out.riga);
  salvaP(); epilogo(); return true;
}
function controllaVittoria() {
  const out = vittoria.controllaVittoria(G());
  return out ? chiudiPartita(out) : false;
}
function finisciEroe(nm) {
  const sp = SP(); if (nm && !sp.eroiFatti.includes(nm)) sp.eroiFatti.push(nm);
  sp.eroiAttivo = null; salvaP(); render();
}

// PNG scortato mosso dal giocatore (Mov 3, non agisce): sulla tessera-meta e'
// vittoria — ma solo quando TUTTI i PNG dell'episodio ci sono arrivati (Ep.4
// ne ha due, Gaspare e Rocco: vanno portati fuori entrambi).
function muoviScortato(i, node) {
  const out = vittoria.esitoScorta(G(), i, node);
  out.righe.forEach(log);
  if (out.esito) return chiudiPartita(out);
  salvaP(); render();
}

// «QUI L'USCITA NON BASTA» (Ep.4, T5): dove l'episodio ha ANCHE dei compiti, la
// scorta portata in salvo non chiude da sola. Il fascicolo lo dice due volte —
// «la spedizione e' VINTA solo se i TRE pannelli della Conchiglia sono gia'
// disaccordati. Se non lo sono, chi imbocca il vano si mette al sicuro (esce
// dal tabellone e non puo' piu' essere colpito) MA LA PARTITA CONTINUA». Prima
// il gruppo scappava e l'app dichiarava vittoria: meta' dell'obiettivo stampato
// non esisteva nei dati. Inerte negli altri episodi-scorta, che di compiti non
// ne hanno.
const scortaPuoVincere = () => vittoria.scortaPuoVincere(G());

// attaccare, cercare e rianimare sono passate in motore/azioni.js: la vista
// le chiede col comando e mette in scena gli eventi che tornano.

// pannello «oggetti del gruppo»: nomi tappabili per leggere carta ed effetto
function oggettiHtml() {
  const list = P().indagine.oggetti || [];
  if (!list.length) return '<p class="nota">Ancora niente. Cercate nelle stanze.</p>';
  return `<div class="btn-riga">${list.map((nm, i) =>
    `<button class="btn" data-obj="${i}">${esc(nm.toLowerCase())}</button>`).join('')}</div>`;
}

// --------------------------------------------------------- spawn nemici
// I nemici evocati dai testi si ricavano dall'episodio (`pool` + boss), non da
// una lista cablata: ogni episodio nuovo funziona senza toccare il codice.
// Truppa: prima parola piena, senza la vocale finale («LO SGHERRO» → /sgherr/).
// Boss: nome intero, cosi' una citazione parziale non lo desta per sbaglio.
// Lo spawn e' uscito di qui: sta in motore/minaccia.js. Guidato dai dati
// (`ep.pool` + `soluzione.boss_tile`), cosi' un episodio nuovo funziona senza
// toccare il codice — ed e' la differenza con spedizione.js, che ha ancora
// otto nomi scritti a mano e per questo e' rimasto indietro.
const destaBossSeSoglia = () => minaccia.destaBossSeSoglia(G());
const spawnDaTesto = (testo, tileId) => minaccia.spawnDaTesto(G(), testo, tileId);
const tileAffollata = () => minaccia.tileAffollata(G());

// --------------------------------------------------------- fase minaccia
// LA PESCA, ora un comando solo.
//
// Il corpo di questa funzione — carte da pescare, crescendo, spawn, Canto,
// orologio, risveglio del boss — sta nel motore (`fase-minaccia` in
// comandi.js). Qui resta la messa in scena: `esegui()` manda il comando e
// `riproduci()` mostra le carte che tornano indietro come eventi.
//
// Perche' e' stato spostato: fermandosi a ogni carta ad aspettare un click,
// la pesca non poteva passare da un tavolo. Le carte uscivano dal browser di
// chi arbitra e sugli altri schermi non arrivava niente.
async function faseMinaccia() {
  // NON si chiama `faseNemiciAI()` qui. Il comando porta la fase a «nemici», e
  // `esegui()` finisce con `render()`, che con quella fase la notte la fa
  // partire da solo (vedi la prima riga di `render()`). Chiamandola anche qui,
  // i nemici agivano DUE VOLTE per round: il test delle regressioni l'ha visto
  // come un eroe gia' a terra all'inizio dell'animazione, che e' il modo in cui
  // un doppio turno si manifesta a schermo.
  await esegui({ tipo: 'fase-minaccia' });
}

// --------------------------------------------------------- fase nemici (IA)
const r1 = () => 1 + Math.floor(Math.random() * 6);
// IL CASO che il motore consuma. Oggi e' Math.random, cioe' esattamente com'era:
// il seme della partita arrivera' col contratto `applica()` (Task 9 del
// PIANO-MOTORE-PURO.md), e da quel giorno bastera' passare un CASO diverso
// perche' una serata si rigiochi identica. Il motore non sa quale dei due sta
// usando, ed e' il punto.
const CASO = {
  scegli: (n) => Math.floor(Math.random() * n),
  tira2d6: () => { const a = r1(), b = r1(); return { d: [a, b], tot: a + b }; },
};
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const nemArt = (nome) => { const st = nemStat(nome); return st && st.art ? urlArt(st.art) : ''; };
const nemBreve = (nome) => esc(nome.toLowerCase());   // i nemici mostrano il nome intero (primo() darebbe l'articolo)
// coordinate (px, non zoomate) di un nodo sul board — come lo scr di boardHtml
function scrGeo(node) {
  const g = ctx._geo; const [TX, TY] = layout()[node.t] || [g.minX, g.maxY];
  return { l: ((TX - g.minX) * 4 + node.x) * g.cell, t: ((g.maxY - TY) * 4 + (3 - node.y)) * g.cell };
}
function setTokenPos(dataTok, node, istantaneo) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`); if (!el) return;
  const p = scrGeo(node);
  if (istantaneo) { el.style.transition = 'none'; el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; void el.offsetWidth; el.style.transition = ''; }
  else { el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; }
}
// Il RITMO della notte. Al tavolo tutto quello che riguarda i nemici va piu'
// lento: il glide del token dura 1s invece di .6s (app.css) e le attese qui si
// allungano in proporzione — se restassero corte, l'attesa scadrebbe a token
// ancora in movimento e il passo successivo lo taglierebbe a meta'.
const LENTO = 1.6;
const ritmo = (ms) => pausa(alTavolo() ? Math.round(ms * LENTO) : ms);
const muoviToken = async (dataTok, node) => { setTokenPos(dataTok, node); await ritmo(650); };

// Il passo di CHI GIOCA. I nemici scivolano lenti apposta — al tavolo serve
// vedere da dove arrivano — mentre la mossa dell'eroe l'ha appena decisa chi
// guarda: aspettare mezzo secondo il proprio token e' tempo morto. Qui il
// token si sposta con la sua transizione breve e si aspetta solo quella.
// Il chiavistello serve al doppio tocco: due clic durante lo scivolamento
// spenderebbero una azione sola per due spostamenti.
const PASSO_EROE = 340;
let scivolando = false;
async function scivolaEroe(dataTok, node) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`);
  const fermo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || fermo) return;
  el.classList.add('passo');
  setTokenPos(dataTok, node);
  await pausa(PASSO_EROE);
}

// striscia del giro dei nemici (read-only, come giroEroiHtml ma per i nemici)
function giroNemiciHtml(attivoIdx) {
  return `<div class="giro-strip">${SP().nemici.map((n, i) => {
    const boss = (nemStat(n.nome) || {}).boss ? ' boss' : '';
    return `<span class="chip-turno ritratto${boss}${i === attivoIdx ? ' attivo' : ''}">
      <span class="rit"><img src="${nemArt(n.nome)}" alt=""></span><span class="et">${nemBreve(n.nome)}${n.num > 1 ? ' ×' + n.num : ''}</span></span>`;
  }).join('')}</div>`;
}

// board della fase nemici (niente pannelli d'azione eroe) — la sequenza animata
// gira sopra questo DOM
function vistaNemici(piano) {
  const { app, ep } = ctx; const sp = SP();
  app.innerHTML = `
    ${fasciaTurno()}
    <div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">la notte reagisce</div>
      <span class="sc" style="color:var(--oro-chiaro)">round ${sp.round} · canto ${sp.canto}</span></div>
    <div class="pannello secondario"><p><b>Turno dei nemici.</b> ${esc(ep.obiettivo ? '' : '')}Ogni nemico si avvicina all’eroe più vicino e colpisce se adiacente.</p></div>
    <div class="mt"></div>
    <div class="board-area">
      <div class="board-wrap" id="board-wrap">${boardHtml(true)}</div>
      <div class="zoom-ctrl"><button class="zoom-btn" data-zoom="-">−</button><button class="zoom-btn" data-zoom="0">⤢</button><button class="zoom-btn" data-zoom="+">+</button></div>
    </div>
    <div class="lato">
      <div class="btn-riga"><button class="btn" id="salta-nemici">salta l’azione della notte →</button>${
        alTavolo() ? `<button class="btn" id="tog-nemici-app">dadi dei nemici: <b>${P().nemiciApp ? 'l’app' : 'vostri'}</b></button>` : ''}</div>
      <div class="mt"></div>
      <div class="pannello giro"><h2>il giro dei nemici</h2><div id="giro-nem">${giroNemiciHtml(-1)}</div></div>
      <div class="mt"></div>
      <div class="pannello"><h2>la salute degli eroi</h2><div id="salute-nem">${saluteHtml()}</div></div>
    </div>
    <div class="mt"></div>
    <div class="pannello secondario"><h2>diario</h2>${logHtml()}</div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  app.querySelector('#salta-nemici').onclick = () => { ctx.saltaNemici = true; };
  // si spegne (e si riaccende) anche a partita in corso: vale dal tiro dopo
  app.querySelector('#tog-nemici-app')?.addEventListener('click', (ev) => {
    P().nemiciApp = !P().nemiciApp; salvaP();
    ev.currentTarget.innerHTML = `dadi dei nemici: <b>${P().nemiciApp ? 'l’app' : 'vostri'}</b>`;
  });
  agganciaMappa();
  // porta subito (prima del paint) i token che si muovono alla posizione di PARTENZA:
  // lo stato e' gia' finale (pos1), ma l'animazione parte da pos0
  for (const s of piano) { if (s.pos0 && s.pos1 && nk(s.pos0) !== nk(s.pos1)) setTokenPos(`N:${s.i}`, s.pos0, true); }
}

// numero fluttuante «−N» sopra un token
function dmgPop(dataTok, testo) {
  const el = ctx.app.querySelector(`.tok-slot[data-tok="${dataTok}"]`); if (!el) return;
  const d = document.createElement('div'); d.className = 'dmg-pop'; d.textContent = testo;
  el.appendChild(d); requestAnimationFrame(() => d.classList.add('on'));
  setTimeout(() => d.remove(), 1100);
}
function evidenziaColpito(vitt) {
  // `.tok-board[data-eroe]` e non `[data-eroe]` e basta: da quando la riga
  // della salute porta lo stesso attributo, il selettore generico prendeva il
  // primo dei due nell'ordine del DOM. Funzionava per combinazione — la plancia
  // viene prima del pannello — ed e' il genere di cosa che smette di funzionare
  // il giorno in cui si sposta un blocco.
  const el = ctx.app.querySelector(`.tok-board[data-eroe="${vitt}"]`);
  if (el) { el.classList.add('colpito'); setTimeout(() => el.classList.remove('colpito'), 600); }

  // IL COLPO CHE ARRIVA A TE. Su un tabellone grande il colpo lo vedono tutti,
  // perche' tutti stanno guardando li'. Su un telefono tenuto in mano si guarda
  // altrove — e senza un segnale che fermi lo schermo si scopre di essere a
  // terra due turni dopo, che e' il modo peggiore di scoprirlo.
  if (vitt && vitt === mioEroe()) {
    ctx.app.classList.add('colpo-mio');
    setTimeout(() => ctx.app.classList.remove('colpo-mio'), 1500);
  }
}

// sequenza animata: centra su ogni nemico, ne mostra spostamento e azione
// chiusura della fase nemici: party-wipe e vittoria. Vive a parte perche' scatta
// in due momenti diversi — a schermo appena il piano e' pronto (i tiri li ha gia'
// fatti l'app), al tavolo solo dopo che il tavolo ha tirato per ogni nemico.
// La vittoria si valuta anche a FINE ROUND, non solo dopo un'azione: se l'ultimo
// eroe vivo raggiunge la tessera-meta e poi nessuno agisce piu', `segnaAzione`
// non la ricontrollerebbe mai e la partita resterebbe aperta a obiettivo fatto.
function chiudiFaseNemici() {
  const out = vittoria.chiudiFaseNemici(G());
  if (!out) return;
  // NON si chiama `epilogo()` da qui, ed e' voluto: questa chiusura scatta in
  // mezzo alla fase nemici, che sta ancora animando. L'esito si scrive e basta;
  // a mostrarlo ci pensa il `render()` di fine fase, che lo vede e va
  // all'epilogo da se'. Chiamarlo qui significa disegnare sopra un'animazione
  // in corso.
  const sp = SP(); sp.esito = out.esito;
  if (out.riga) sp.log.push(out.riga);
  salvaP();
}

// I nemici che restano quando si salta l'animazione al tavolo: li tira l'app,
// stesse regole, senza chiedere un dado per uno. `da` e' il primo non risolto.
const risolviRestoNemici = (piano, da) => nemici.risolviResto(G(), CASO, piano, da);

async function eseguiTurnoNemici(piano) {
  const sp = SP();
  for (const s of piano) {
    // «salta i nemici» interrompe l'ANIMAZIONE. A schermo i colpi erano gia'
    // risolti nel piano, quindi non si perde nulla; AL TAVOLO invece i tiri
    // mancano ancora, e saltarli vorrebbe dire che i nemici non attaccano
    // affatto. Li' saltare significa «tira tu il resto»: li risolve l'app.
    if (ctx.saltaNemici) { if (piano.differito) risolviRestoNemici(piano, s); break; }
    const tokel = ctx.app.querySelector(`.tok-slot[data-tok="N:${s.i}"] .tok-board`);
    centraSuNodo(s.pos0, `nem-${s.i}-a`, true);
    await ritmo(650);
    if (s.flash) { bannerTurno(nemArt(s.nome), `<b>${nemBreve(s.nome)}</b><br>accecato: salta`, 'nemico'); await ritmo(1100); continue; }
    bannerTurno(nemArt(s.nome), `agisce<br><b>${nemBreve(s.nome)}</b>`, 'nemico');
    if (tokel) tokel.classList.add('attivo-nem');
    if (nk(s.pos0) !== nk(s.pos1)) { await muoviToken(`N:${s.i}`, s.pos1); centraSuNodo(s.pos1, `nem-${s.i}-b`, true); await ritmo(300); }
    // AL TAVOLO i dadi del nemico li tira il tavolo, adesso: contro il PNG
    // scortato (che e' un bersaglio come gli eroi) e contro l'eroe.
    // AL TAVOLO i dadi del nemico li tira il tavolo, adesso: contro il PNG
    // scortato (che e' un bersaglio come gli eroi) e contro l'eroe. Il tiro si
    // chiede qui perche' e' un gesto della serata; ad APPLICARLO e' il motore,
    // con la stessa funzione che usa quando tira l'app. Prima erano due copie
    // della stessa regola, piu' una terza per chi salta l'animazione.
    if (s.attaccoPng) {
      const png = statoScortati()[s.attaccoPng.png]; const sc = specScort(s.attaccoPng.png);
      if (png && png.vite > 0) {
        const r = await tiroNemico(`${nemBreve(s.nome)} → ${sc.nome.toLowerCase()}`,
          s.attaccoPng.dif, s.attaccoPng.att);
        nemici.risolviColpo(G(), s, r.tot);
        const sn0 = ctx.app.querySelector('#salute-nem'); if (sn0) sn0.innerHTML = saluteHtml();
      }
    }
    if (s.attacco && s.attacco.tot === undefined) {
      const a = s.attacco;
      const r = await tiroNemico(`${nemBreve(s.nome)} → ${primo(a.vitt)}`, a.dif, a.att);
      nemici.risolviColpo(G(), s, r.tot);
    }
    if (s.attacco) {
      const a = s.attacco;
      if (tokel) { tokel.classList.add('attacca'); setTimeout(() => tokel && tokel.classList.remove('attacca'), 400); }
      await ritmo(450);
      if (a.colpito) {
        // il danno entra nella vista ADESSO: prima di questo istante l'eroe e'
        // ancora in piedi sul board, anche se lo stato salvato lo sa gia' a terra
        if (ctx.viteVista) ctx.viteVista[a.vitt] = Math.max(0, (ctx.viteVista[a.vitt] ?? 0) - a.dan);
        evidenziaColpito(a.vitt); dmgPop(`E:${a.vitt}`, `−${a.dan}`);
        if ((ctx.viteVista ? ctx.viteVista[a.vitt] : 1) <= 0) {
          const t = ctx.app.querySelector(`[data-eroe="${a.vitt}"]`); if (t) t.classList.add('giu');
        }
      }
      // tiro VISIBILE: 2d6 + Attacco vs Difesa dell'eroe (i nemici tirano i dadi, non colpiscono al 100%)
      const tiro = `<span class="tb-roll">🎲 ${a.tot} ${a.colpito ? '≥' : '<'} Dif ${a.dif}</span>`;
      bannerTurno(nemArt(s.nome), a.colpito
        ? `<b>${nemBreve(s.nome)}</b> colpisce ${esc(primo(a.vitt))} ${tiro} <b class="ko-txt">−${a.dan}</b>`
        : `<b>${nemBreve(s.nome)}</b> manca ${esc(primo(a.vitt))} ${tiro}`, 'nemico');
      const sn = ctx.app.querySelector('#salute-nem'); if (sn) sn.innerHTML = saluteHtml();
      await ritmo(1050);
    } else { await ritmo(650); }
    if (tokel) tokel.classList.remove('attivo-nem');
  }
  if (ctx.saltaNemici) { for (const s of piano) setTokenPos(`N:${s.i}`, s.pos1, true); }
  piano.annunci.forEach((a) => log(a));
  ctx.viteVista = null;          // da qui in poi si mostra lo stato reale
  ctx.saltaNemici = false; ctx.ultimaCentrata = null;
  if (piano.differito) chiudiFaseNemici();   // ora i colpi sono risolti davvero
  salvaP();
  if (sp.esito) return epilogo();
  render();
}

// entry: pianifica (logica IA invariata), applica lo stato, poi anima
// LA NOTTE PASSA DAL MOTORE, come tutto il resto.
//
// Applicava il piano QUI, in locale: il tavolo non ne sapeva niente, i telefoni
// restavano fermi su «agisce la notte» per sempre, e lo stato di chi arbitra
// divergeva da quello del tavolo senza che nessuno se ne accorgesse. Il comando
// `fase-nemici` esisteva nel motore dal primo giorno e non lo usava nessuno.
//
// Ora si manda il comando e si ANIMA quel che torna: il piano viaggia negli
// eventi, quindi lo stesso copione arriva a ogni schermo. Chi guarda vede la
// notte muoversi come chi conduce, senza che il suo motore tocchi nulla.
async function faseNemiciAI() {
  return esegui({ tipo: 'fase-nemici', differito: tavoloTiraNemici() });
}

// L'animazione della notte, dal piano che il motore ha gia' risolto.
function animaNotte(piano) {
  ctx.saltaNemici = false; ctx.ultimaCentrata = null;
  ctx.viteVista = { ...piano.vite0 };          // board come a inizio fase: nessuno ancora a terra
  vistaNemici(piano);                          // board a posizioni di partenza
  return eseguiTurnoNemici(piano);             // animazione (async)
}

function faseNemiciLocale() {
  const sp = SP();
  const piano = nemici.pianoNemici(G(), CASO, tavoloTiraNemici());
  nemici.fineRoundNemici(G(), piano);
  // AL TAVOLO questi due controlli NON possono stare qui: i nemici non hanno
  // ancora tirato (lo fanno i giocatori durante l'animazione), quindi `sp.vite`
  // e' ancora lo stato di inizio fase. Li rifa' eseguiTurnoNemici a colpi
  // risolti — vedi `chiudiFaseNemici`.
  if (!piano.differito) chiudiFaseNemici();
  salvaP();                                    // stato gia' finale: reload -> fase eroi coerente
  return animaNotte(piano);
}

// --------------------------------------------------------------- utilita'
function log(t) { const sp = SP(); sp.log = sp.log || []; sp.log.push(t); }
function flash(t) {
  const d = document.createElement('div'); d.className = 'flash-msg'; d.textContent = t;
  document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('on'));
  setTimeout(() => { d.classList.remove('on'); setTimeout(() => d.remove(), 300); }, 1600);
}
function messaggio(titolo, corpo) {
  return new Promise((ok) => {
    const { app } = ctx;
    app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(titolo)}</div><span></span></div>
      <div class="pannello">${corpo}</div>
      <div class="btn-riga"><button class="btn pieno" id="ok-msg">continua</button></div>`;
    app.querySelector('#ok-msg').onclick = ok;
  });
}
async function finePartita(esito) {
  if (!await conferma(esito === 'vittoria' ? 'Vittoria?' : 'Tutti gli eroi a terra?', {
    dettaglio: esito === 'vittoria' ? 'Si chiude qui.' : 'La notte vince.',
    si: 'sì, si chiude', no: 'non ancora',
  })) return;
  SP().esito = esito; salvaP(); epilogo();
}
function epilogo() {
  const { app, ep } = ctx; const sp = SP();
  app.classList.remove('immersivo');   // e' testo, e va letto tutto: deve scorrere
  app.innerHTML = `<div class="barra"><button class="btn" id="nav-esci">← menu</button>
      <div class="titolo">${esc(ep.titolo)}</div><span></span></div>
    <div class="pannello centrato">
      <h2>${sp.esito === 'vittoria' ? 'l’alba vi trova in piedi' : 'la notte ha vinto'}</h2>
      <p class="mt">${sp.esito === 'vittoria'
        ? `${specScortati().map((s) => s.nome).join(' e ') || 'Il gruppo'} è al sicuro. ${sp.round} round, canto ${sp.canto}. Leggete l’epilogo nel fascicolo Soluzione.`
        : 'Rialzatevi: la Soluzione dice cosa resta di questa notte.'}</p>
      ${(() => { const cb = controBusta(ep); return cb ? `
        <hr class="divisore">
        <div style="text-align:left">
          <p class="nota">— si apre ora, al ritorno —</p>
          <p><b>${esc(cb.q.replace(/^CONTRO-BUSTA — /, ''))}</b></p>
          <p class="nota">La verità: ${esc(cb.risposta)}</p>
          <p>${esc(cb.esatta)}</p>
        </div>` : ''; })()}
      <div class="btn-riga" style="justify-content:center"><button class="btn pieno" id="al-menu">alla taverna</button></div></div>`;
  app.querySelector('#nav-esci').onclick = () => { spegniImmersivo(); ctx.vaiA('menu'); };
  app.querySelector('#al-menu').onclick = () => ctx.vaiA('menu');
}

// export del motore per i test (node): _setup inietta un ctx finto (ep + sp)
export const _motore = {
  esploraMosse, camminoGlob, adiacGlob, viciniGlob, portaCella, arrediSet, layout, nk, tileDi,
  messaggioCarta,                 // per provare la carta senza tirarsi dietro una pesca vera
  evidenziaColpito,               // per provare il colpo senza aspettare che un nemico colpisca
  avanzaCancellazione, avanzaRitmo, avanzaPressione, controllaFiloPerso, avanzaOrologio,
  bonusVoce, celleEsca,
  _setup: (ep, sp, extra) => {
    const { comune, ...resto } = extra || {};
    ctx = { ep, comune: comune || { regole: {} },
            partita: { spedizione: sp, party: [], ...resto }, layout: null };
  },
};
