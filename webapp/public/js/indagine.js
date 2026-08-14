// Vista Indagine (modalita' Tavolo): l'app fa da arbitro — stradario con
// oracolo, indizi letti al momento giusto, Approfondimenti gated con
// cariche, orologio, chiusura con la "busta". Stato in partita.indagine
// (store.js), regole in engine.js, dadi in dadi.js.
import { salva, dati } from './store.js';
import { tiraProva } from './dadi.js';
import { rendi, norm, bussa, dichiaraVoce, vociMappa, luogoVisitabile,
         idoneiPerTipo, usaCarica, tierIndagine, verificaRisposte,
         controBusta, domandeBusta,
         urlArt, cartaLuogo, cartaApprofondimento, cartaOggetto,
         urlCarta as urlCartaSafe } from './engine.js';
import { episodioColBivio } from '../motore/bivi.js';
import { applica } from '../motore/comandi.js';
import { provaDiIndagine } from '../motore/indagine.js';
import { eroeCresciuto } from '../motore/migliorie.js';
import { vista, eArbitro } from '../motore/proiezione.js';
import { mettiSulTavolo } from './tavolo-vivo.js';
import { apriCanale } from './canale.js';
import { schedaEroe, abilitaSchede } from './scheda-eroe.js';
import { conferma } from './chiedi.js';
import * as suoni from './suoni.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// nome breve distintivo: salta il titolo (DOTT./PADRE), altrimenti Attilio e
// Serra sarebbero entrambi «dott.».
const breve = (nome) => {
  const t = String(nome).split(' ');
  return ((t[0] === 'DOTT.' || t[0] === 'PADRE') ? (t[1] || t[0]) : t[0]).replace(/["“”]/g, '').toLowerCase();
};

// Le abilita' d'indagine a uso singolo. Il numero di usi esiste SOLO come
// prosa italiana nel campo `abil` di gen_cards.HEROES, quindi non c'e' un
// dato da leggere: la tabella e' qui, ed e' la stessa che decide sia i
// bottoni sia i pallini del contatore (prima le due cose erano scritte due
// volte). `dove` dice in che schermata sta il bottone, `null` = altrove.
const UNA_TANTUM = [
  { eroe: 'PADRE CELSO MARANI', flag: 'discernimentoUsato', et: 'Discernimento',
    dove: 'home', id: 'discernimento', label: 'Discernimento di Marani' },
  { eroe: 'CARLA DOSTI', flag: 'fontiRiservateUsate', et: 'Fonti riservate',
    dove: 'home', id: 'fonti-riservate', label: 'Fonti riservate di Carla' },
  { eroe: 'MORA “SPILLA” FANTI', flag: 'ombraUsata', et: 'Ombra',
    dove: 'home', id: 'ombra', label: 'Ombra in avanscoperta' },
  { eroe: 'NINO “GRIMALDELLO” CAUTO', flag: 'grimaldelloUsato', et: 'Grimaldello', dove: null },
  { eroe: 'FULGENZIO CARBONE', flag: 'carboneUsato', et: 'Esame di Carbone',
    dove: null, inPartita: true },   // unico flag su `partita`, non su `indagine`
];

const speso = (u) => !!(u.inPartita ? P()[u.flag] : IND()[u.flag]);

// Cariche residue di un eroe: gli Approfondimenti (dato vero, comune.json)
// piu' le una-tantum qui sopra. Serve al contatore della home.
function caricheEroe(nm) {
  const e = ctx.comune.eroi.find((x) => x.nome === nm);
  const usate = IND().caricheUsate[nm] || {};
  const righe = Object.entries((e && e.cariche) || {}).map(([tipo, tot]) => ({
    et: tipo === 'jolly' ? 'jolly' : tipo, tot, rest: tot - (usate[tipo] || 0),
  }));
  UNA_TANTUM.filter((u) => u.eroe === nm)
    .forEach((u) => righe.push({ et: u.et, tot: 1, rest: speso(u) ? 0 : 1 }));
  return righe;
}

let ctx = null;   // { app, partita, ep, comune, carte, vaiA }

export async function vistaIndagine(app, partita, vaiA, posto) {
  const [ep0, comune0, carte0] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  // L'EPISODIO COME I BIVI L'HANNO LASCIATO: un testimone che ha smesso di
  // parlare, una porta che il brigadiere apre o chiude. `episodioColBivio` ne
  // restituisce una copia — i dati di `dati()` sono in cache e condivisi, e
  // quel che vale per questo tavolo non deve valere per la prossima partita.
  const epBivi = episodioColBivio(ep0, partita.bivi);

  // CHI GUARDA DA UN TELEFONO NON VEDE LA SCRIVANIA DI CHI ARBITRA.
  //
  // Fin qui questa vista era una sola per tutti, e chi entrava al tavolo dal
  // proprio telefono si trovava davanti le chiavi delle porte, gli indizi dei
  // luoghi mai visitati, il testo degli Approfondimenti non ancora letti e le
  // risposte della busta. Sono gli stessi segreti che in Spedizione la
  // proiezione toglie da mesi: qui non ne serviva una nuova, serviva USARE
  // quella — `datiPerPosto` pota gia' i luoghi per `visitati` e le carte per
  // cio' che il gruppo ha in mano o ha gia' sentito leggere.
  //
  // Senza posto (nessun server, il `server.js` locale, tutti i banchi di
  // misura) `eArbitro(null)` e' vero e non cambia NIENTE: e' la stessa
  // degradazione voluta della Spedizione.
  const vistoDa = eArbitro(posto)
    ? { stato: partita, dati: { ep: epBivi, comune: comune0, carte: carte0 } }
    : vista(partita, { ep: epBivi, comune: comune0, carte: carte0 }, posto);
  const { ep, comune, carte } = vistoDa.dati;
  if (ctx && ctx.canale) ctx.canale.chiudi();   // il filo di prima non resta appeso
  ctx = { app, partita: vistoDa.stato, ep, comune, carte, vaiA, posto: posto || null, canale: null };
  // come in Spedizione: la scheda e' quella di stanotte, Tempre e Cicatrici
  // comprese (la Tempra vale «sempre», e l'ACUME qui tira davvero)
  abilitaSchede((nm) => eroeCresciuto({ partita: P() }, nm,
    comune.eroi.find((x) => x.nome === nm)));
  collegaAlTavolo();
  // LA SERATA SI METTE SUL TAVOLO APPENA SI APRE, non alla prima mossa.
  //
  // La Spedizione lo fa da sempre (`vistaDigitale`); l'Indagine no, e la
  // conseguenza si vedeva al tavolo: chi arbitra ricominciava il Preludio ed
  // era fermo alla lettera — dove non si e' ancora salvato niente — mentre il
  // Durable Object aveva ancora la serata FINITA della volta prima. I telefoni
  // entravano li', e ci restavano finche' qualcuno non spendeva un'ora.
  //
  // Non si aspetta: se il tavolo non risponde si gioca lo stesso, e la spinta
  // riparte al primo `salvaP()`.
  if (arbitro() && posto && posto.tavolo) {
    mettiSulTavolo(posto, partita).catch(() => { /* si gioca lo stesso */ });
  }
  if (!arbitro()) return vistaDiChiGioca();
  // Chi gioca ha una schermata sua: non e' la stessa con meno bottoni, perche'
  // le due cose servono a due mestieri diversi. Chi conduce guida la notte;
  // chi gioca vuole sapere che ora e', dove siete stati e cosa avete in mano.

  if (!partita.indagine.lettaLettera && ep.lettera) return lettera();
  // visita interrotta dalla navigazione (menu e ritorno): l'ora e' gia'
  // stata spesa, si riprende dentro il luogo - non si ripaga
  const aperto = partita.indagine.luogoAperto;
  const l = aperto != null && ep.luoghi.find((x) => x.n === aperto);
  if (l) return schedaLuogo(l);
  home();
}

// La lettera d'incarico: apre l'episodio come al tavolo — si legge ad alta
// voce, e dice quali porte sono aperte dall'inizio. Poi la città.
// L'ultima riga in corsivo di ogni lettera («Luoghi disponibili dall'inizio…»)
// non e' la mano di M.: e' l'app che dice quali porte sono aperte. Va staccata
// e scritta col carattere del gioco — a mano sarebbe una bugia sul chi parla.
// Tutte e 21 le lettere hanno questa coda, e cinque usano il corsivo anche nel
// corpo: si taglia SOLO su quella finale, ancorata alla fine del testo.
const CODA_ARBITRO = /<br\s*\/?><br\s*\/?>\s*<i>([\s\S]*)<\/i>\s*$/;
function spezzaLettera(testo) {
  const m = CODA_ARBITRO.exec(String(testo || '').trim());
  return m ? { corpo: String(testo).trim().slice(0, m.index), coda: m[1] }
           : { corpo: testo, coda: '' };
}

function lettera() {
  const { app, ep } = ctx;
  const rilettura = IND().lettaLettera;
  const { corpo, coda } = spezzaLettera(ep.lettera);
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello lettera-panel">
      <p class="nota centrato">${rilettura ? '— la lettera d’incarico, dal Taccuino —'
                                           : '— da leggere ad alta voce —'}</p>
      <div class="lettera-testo">${rendi(corpo)}</div>
      ${coda ? `<p class="nota-arbitro">${rendi(coda)}</p>` : ''}
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="in-strada">${rilettura ? 'torna in strada →'
                                                : `in strada, alle ${IND().ora}:00 →`}</button>
    </div>`;
  dopoBarra();
  app.querySelector('#in-strada').onclick = async () => {
    if (!IND().lettaLettera) await esegui({ tipo: 'lettera-letta' });
    home();
  };
}

// Chi conduce la serata. Senza posto si arbitra da soli, ed e' il caso di
// sempre: nessun server, un solo schermo, i banchi di misura.
const arbitro = () => eArbitro(ctx.posto);
const mioEroe = () => (ctx.posto && ctx.posto.eroe) || null;

const P = () => ctx.partita;
const IND = () => ctx.partita.indagine;

// Salvare, e dirlo al tavolo.
//
// `salvaP()` era gia' il punto unico da cui passa ogni cambiamento
// dell'Indagine: e' li' che si aggancia la spinta ai telefoni, invece di
// ricordarsene in venti posti. `salva()` timbra `aggiornato`, che e' quel che
// il Durable Object guarda per non farsi sovrascrivere da uno stato vecchio.
//
// NON si aspetta la rete: al tavolo il gioco non puo' fermarsi per un router.
// Se la spinta fallisce si e' giocato lo stesso, e la coda di `sync.js` porta
// comunque il salvataggio a destinazione.
const salvaP = () => {
  salva(ctx.partita);
  if (arbitro() && ctx.posto && ctx.posto.tavolo) {
    mettiSulTavolo(ctx.posto, ctx.partita).catch(() => { /* si gioca lo stesso */ });
  }
};

// Le ore non stanno in un angolo della barra come un orologio: sono il
// REGISTRO delle sei ore della notte, e quelle spese si barrano. Si vede in
// colpo d'occhio quanta notte resta, che e' la cosa che tiene in ansia.
function registroOre() {
  const ora = IND().ora;
  return `<span class="registro" title="dalle 18 a mezzanotte">${
    Array.from({ length: 6 }, (_, i) => {
      const h = 18 + i;
      const cl = h < ora ? 'spesa' : h === ora ? 'ora' : '';
      return `<span class="ora-riga ${cl}">${h}</span>`;
    }).join('')}</span>`;
}

function barra(titolo, etichetta = 'indagine') {
  return `
  <div class="barra">
    <button class="btn" id="nav-esci">← menu</button>
    <div class="titolo">
      <span class="etichetta">${esc(ctx.ep.titolo)} · ${esc(etichetta)}</span>
      <span class="tit-testo">${esc(titolo)}</span>
    </div>
  </div>
  <div class="riga-registro">${registroOre()}
    <span class="sc resta">${(() => { const o = 24 - IND().ora;
      return o ? `${o} ${o === 1 ? 'ora' : 'ore'} a mezzanotte` : 'mezzanotte'; })()}</span>
    ${suoni.bottoneHtml()}
  </div>`;
}

// Lo stato che decide l'ambiente sonoro: il luogo in cui si sta (se si sta in
// un luogo) e l'ora. In strada non c'e' ambiente — e sta bene: fra una visita
// e l'altra il silenzio e' il posto dove si ragiona.
function statoSuoni() {
  const aperto = IND().luogoAperto;
  const l = aperto != null && ctx.ep.luoghi.find((x) => x.n === aperto);
  return { fase: 'indagine', ambiente: l ? l.ambiente : null, ora: IND().ora };
}

function dopoBarra() {
  ctx.app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
  suoni.agganciaBottone(ctx.app, statoSuoni);
  suoni.aggiorna(statoSuoni());
}

// banner con l'arte del luogo (dalle carte renderizzate o dal campo art)
function bannerLuogo(l) {
  const c = cartaLuogo(ctx.carte, P().episodio, l.n);
  const art = urlArt(l.art) || (c ? urlArt(c.art) : null);
  if (!art) return '';
  return `<div class="banner-luogo" style="background-image:url('${art}')">
    <div class="banner-velo"></div></div>`;
}

// ------------------------------------------------------------------ home
function home() {
  const { app, ep, comune } = ctx;
  const ind = IND();
  const voci = vociMappa(ep, comune);
  const visitati = new Set(ind.visitati);
  const luoghiPerVoce = {};
  ep.luoghi.forEach((l) => { luoghiPerVoce[norm(l.voce_mappa)] = l; });
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello">
      <h2>il gruppo sul caso</h2>
      <div class="giro-strip stampe">${P().party.map((nm) => {
        const e = ctx.comune.eroi.find((x) => x.nome === nm);
        // il contatore delle cariche: un pallino per uso, pieno = ancora
        // disponibile. Stessa lettura dei cerchietti del Taccuino stampato
        // (deluxe_style.contatori_indagine) e dei pips della Spedizione.
        const car = caricheEroe(nm);
        const pips = car.map((c) => `<span class="pip-carica" title="${esc(c.et)}: ${c.rest} di ${c.tot}">${
          Array.from({ length: c.tot }, (_, k) =>
            `<i class="${k < c.rest ? 'piena' : ''}"></i>`).join('')}</span>`).join('');
        const finito = car.length > 0 && car.every((c) => c.rest <= 0);
        // qui il ritratto e' libero (in spedizione lo stesso clic sceglie chi
        // agisce), quindi apre la scheda del personaggio
        return `<button class="chip-turno ritratto${finito ? ' fatto' : ''}" data-scheda="${esc(nm)}"
          title="scheda di ${esc(nm.toLowerCase())}"><span class="rit"><img src="${e && e.art ? urlArt(e.art) : ''}" alt="" loading="lazy"></span>
          <span class="et">${breve(nm)}</span>
          ${car.length ? `<span class="cariche">${pips}</span>` : ''}</button>`;
      }).join('')}</div>
      <p class="nota">Sotto ogni ritratto, le sue <b>cariche</b>: un pallino per uso,
      pieno se è ancora disponibile. Ogni eroe legge un tipo di Approfondimento
      (Elena le Osservazioni, Serra i Presagi…) — se è nel party, l'app ve lo propone
      al momento giusto.</p>
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>lo stradario di roccamora</h2>
      <p class="nota">Dichiarate una destinazione: se la pista è fredda non costa nulla,
      ma se lì c’è qualcosa… l’ora si spende. Dichiarare è impegnarsi.</p>
      <div class="stradario mt">
        ${voci.map((v) => {
          const l = luoghiPerVoce[norm(v.nome)];
          // SOLO «gia' battuto»: quello il gruppo lo sa gia'. Qualunque altra
          // etichetta di stato (pista calda, serve una parola) direbbe dove
          // andare, e l'app e' l'arbitro che custodisce proprio quello.
          const stato = l && visitati.has(l.n) ? '<span class="visitato">già battuto</span>' : '';
          return `<button class="voce" data-voce="${esc(v.nome)}">
            <b>${esc(v.nome)}</b> <i>${esc(v.indirizzo)}</i>${stato}</button>`;
        }).join('')}
      </div>
    </div>
    <div class="btn-riga">
      ${ep.lettera ? '<button class="btn" id="rileggi">la lettera</button>' : ''}
      ${/* Il bottone non sparisce piu' quando la carica e' spesa: resta
            disabilitato e barrato. Sparendo non si distingueva «gia' usata»
            da «l'eroe non e' nel party», e quello ERA il contatore mancante. */
        UNA_TANTUM.filter((u) => u.dove === 'home' && P().party.includes(u.eroe)).map((u) => {
          // «pronta» non e' «usata»: il bonus di Carla e' armato e scatta alla
          // prossima visita. Disabilitato si', barrato no — barrarlo direbbe
          // al tavolo che quella carica non c'e' piu'.
          const attiva = u.flag === 'fontiRiservateUsate' && ind.fontiRiservateAttive;
          const giu = speso(u) || attiva;
          const coda = attiva ? ' — pronta, alla prossima visita'
            : (speso(u) ? ' — usata' : ' (1 volta)');
          return `<button class="btn${speso(u) && !attiva ? ' spesa' : ''}" id="${u.id}"${
            giu ? ' disabled' : ''}>${esc(u.label)}${coda}</button>`;
        }).join('')}
      <button class="btn" id="taccuino">taccuino e domande</button>
      <button class="btn" id="inventario">oggetti e carte (${ind.oggetti.length + ind.approfondimentiLetti.length + (ind.reperti || []).length})</button>
      <button class="btn pieno" id="chiudi-indagine">chiudete l’indagine</button>
    </div>`;
  dopoBarra();
  app.querySelectorAll('.voce').forEach((el) => el.onclick = () => dichiara(el.dataset.voce));
  app.querySelector('#rileggi')?.addEventListener('click', lettera);
  app.querySelector('#discernimento')?.addEventListener('click', discernimento);
  app.querySelector('#fonti-riservate')?.addEventListener('click', fontiRiservate);
  app.querySelector('#ombra')?.addEventListener('click', ombraFiuta);
  app.querySelector('#taccuino').onclick = taccuino;
  app.querySelector('#inventario').onclick = inventario;
  app.querySelector('#chiudi-indagine').onclick = taccuino;
}

// IL FILO COL TAVOLO, durante l'Indagine.
//
// Chi arbitra e' l'autorita' — nell'Indagine agisce lui solo — e a ogni
// `salvaP()` spinge lo stato nuovo al Durable Object. Qui si sta dall'altra
// parte: si ascolta, si ridisegna, e non si tocca niente.
//
// Senza tavolo, senza WebSocket o senza posto non si collega niente e la vista
// resta quella di sempre: e' la stessa degradazione voluta della Spedizione, ed
// e' quel che tiene identici i banchi di misura.
function collegaAlTavolo() {
  if (!ctx.posto || !ctx.posto.tavolo || typeof WebSocket === 'undefined') return;
  const posto = ctx.posto;
  ctx.canale = apriCanale({
    tavolo: posto.tavolo,
    onVista: (stato, datiVisti, _rif, _eventi, messaggio) => {
      if (!stato) return;
      // c'e' qualcuno che conduce, dall'altra parte? Serve a dirlo a chi gioca
      // invece di lasciarlo davanti a un bottone che sembra rotto
      if (messaggio && messaggio.arbitroCollegato !== undefined) {
        ctx.arbitroCollegato = messaggio.arbitroCollegato;
      }
      // CHI ARBITRA ASCOLTA UNA COSA SOLA: il tiro che aspetta dall'altra parte.
      // Non ridisegna su quel che arriva — la sua schermata la guida lui, e
      // ridisegnarla sotto le dita gli farebbe sparire quel che stava facendo.
      // La spinta che riceve e' anche la propria, quindi si guarda solo
      // l'ESITO, che lo scrive il telefono e nessun altro.
      // CHI ARBITRA NON RIDISEGNA su quel che arriva: la sua schermata la guida
      // lui, e ridisegnarla sotto le dita gli farebbe sparire quel che stava
      // facendo. Gli basta tenere lo stato aggiornato — le mosse degli altri le
      // ha gia' applicate il tavolo.
      if (arbitro()) { incassa(stato); return; }
      // LA SERATA E' PASSATA ALLA SPEDIZIONE mentre guardavamo: non si ridisegna
      // l'Indagine di una partita che non e' piu' li'. Si chiude il filo e si
      // passa la mano, o resterebbero due canali aperti sullo stesso tavolo.
      if (stato.fase !== 'indagine' || (stato.indagine || {}).chiusa) {
        if (ctx.canale) { ctx.canale.chiudi(); ctx.canale = null; }
        salva(stato, { timbra: false });
        return ctx.vaiA('spedizione');
      }
      ctx.partita = stato;
      if (datiVisti) {
        if (datiVisti.ep) ctx.ep = datiVisti.ep;
        if (datiVisti.comune) ctx.comune = datiVisti.comune;
        if (datiVisti.carte) ctx.carte = datiVisti.carte;
      }
      // una copia, non una mossa: col timbro il telefono si riappunterebbe qui
      salva(stato, { timbra: false });
      // SI RIDISEGNA LA SCHERMATA DOVE SI E', non la principale.
      //
      // Prima ogni spinta dal tavolo riportava chi gioca alla home: aprivi il
      // taccuino o la lettera, arrivava un aggiornamento — e ti ritrovavi al
      // punto di partenza. Peggio: premevi un bottone, la spinta tornava, e la
      // pagina si ridisegnava come se non avessi premuto niente. Un bottone
      // che non fa niente, che invece aveva fatto tutto.
      (ctx.schermata || vistaDiChiGioca)();
    },
  });
}

// ------------------------------------------------ L'INDAGINE DI CHI GIOCA
//
// Non e' la schermata di chi arbitra con meno bottoni: sono due mestieri
// diversi. Chi conduce guida la notte — dichiara le destinazioni, bussa, apre
// gli Approfondimenti, tiene il Taccuino. Chi gioca da un telefono, fra una
// chiacchiera e l'altra, ha tre domande sole: CHE ORA E', DOVE SIAMO STATI,
// COSA ABBIAMO IN MANO. Sono quelle, e in quest'ordine.
//
// L'orologio sta in cima ed e' grande perche' e' la cosa che tiene in ansia:
// sei ore, e ogni porta bussata ne costa una. Al tavolo lo si legge sul
// Taccuino di chi conduce; qui lo si ha in tasca.
//
// Quel che NON c'e' non e' stato nascosto qui: non e' mai arrivato. La
// proiezione lo toglie nel Durable Object, quindi non c'e' niente da aggirare
// coi devtools — i luoghi non visitati sono nomi sulla mappa e basta.
function vistaDiChiGioca() {
  ctx.schermata = vistaDiChiGioca;
  const { app, ep, carte } = ctx;
  const ind = IND();
  // LA SCHERMATA CHE IL TAVOLO STA LEGGENDO. Quel che il gruppo ha colto — o
  // non colto — si legge insieme: compare su ogni schermo e la chiude chi
  // conduce, cosi' nessuno va avanti mentre gli altri leggono. Qui non c'e'
  // «continuate»: non e' una decisione di chi guarda.
  if (ind.carta) {
    app.innerHTML = `
      ${barra(ind.carta.titolo)}
      <div class="pannello">${ind.carta.corpo}</div>
      <p class="nota centrato mt">— si va avanti quando chi arbitra chiude —</p>`;
    return dopoBarra();
  }
  const epId = P().episodio;
  const mio = mioEroe();
  const visitati = (ep.luoghi || []).filter((l) => (ind.visitati || []).includes(l.n));
  const aperto = ind.luogoAperto != null && (ep.luoghi || []).find((x) => x.n === ind.luogoAperto);

  const galleria = (files) => (files.length
    ? `<div class="galleria-carte">${files.map((f) =>
        `<img loading="lazy" src="${urlCartaSafe(f)}" alt="">`).join('')}</div>` : '');
  const ogg = (ind.oggetti || []).map((n) => cartaOggetto(carte, epId, n)).filter(Boolean).map((c) => c.file);
  const app_ = (ind.approfondimentiLetti || []).map((x) =>
    cartaApprofondimento(carte, epId, x.soggetto)).filter(Boolean).map((c) => c.file);
  const rep = ind.reperti || [];

  app.innerHTML = `
    ${barra(aperto ? aperto.nome.toLowerCase() : 'per le strade')}
    ${aperto ? bannerLuogo(aperto) : ''}
    ${aperto ? approfondireHtml(aperto) : `<div class="pannello">
      <h2>siete per le strade</h2>
      <p class="nota">Si decide insieme dove andare; a dichiararlo e a bussare e’ chi
      arbitra. Appena entrate, qui compare quel che potete fare voi.</p>
    </div>`}
    ${mio ? `<div class="mt"></div>
    <div class="pannello">
      <h2>il vostro eroe</h2>
      <div class="giro-strip stampe">${(() => {
        const e = ctx.comune.eroi.find((x) => x.nome === mio);
        // LE CARICHE, con gli stessi pallini della schermata di chi arbitra e
        // del Taccuino stampato: un pallino per uso, pieno se e' ancora
        // disponibile. Sono la risorsa che chi gioca deve poter contare da se'
        // — «l'ho gia' usata la mia Testimonianza?» e' una domanda sua, e
        // chiederla ad alta voce a chi conduce e' chiederle di rispondere per
        // tutti. Il markup e' copiato da `home()` parola per parola: due
        // versioni degli stessi pallini divergono al primo ritocco.
        const car = caricheEroe(mio);
        const pips = car.map((c) => `<span class="pip-carica" title="${esc(c.et)}: ${c.rest} di ${c.tot}">${
          Array.from({ length: c.tot }, (_, k) =>
            `<i class="${k < c.rest ? 'piena' : ''}"></i>`).join('')}</span>`).join('');
        const finito = car.length > 0 && car.every((c) => c.rest <= 0);
        return `<button class="chip-turno ritratto${finito ? ' fatto' : ''}" data-scheda="${esc(mio)}"
          title="scheda di ${esc(mio.toLowerCase())}"><span class="rit"><img src="${
            e && e.art ? urlArt(e.art) : ''}" alt="" loading="lazy"></span>
          <span class="et">${breve(mio)}</span>
          ${car.length ? `<span class="cariche">${pips}</span>` : ''}</button>`;
      })()}</div>
      ${(() => {
        const car = caricheEroe(mio);
        if (!car.length) return '';
        return `<p class="nota">${car.map((c) =>
          `${esc(c.et)}: <b>${c.rest}</b> di ${c.tot}`).join(' · ')}</p>`;
      })()}
    </div>` : ''}
    <div class="mt"></div>
    <div class="pannello">
      <h2>dove siete stati (${visitati.length})</h2>
      ${visitati.length
        ? `<div class="stradario mt">${visitati.map((l) => `<div class="voce">
            <b>${esc(l.nome.toLowerCase())}</b></div>`).join('')}</div>`
        : '<p class="nota">Ancora nessuna porta. La notte è giovane.</p>'}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>quel che avete in mano</h2>
      ${ogg.length ? `<p><b>Oggetti</b></p>${galleria(ogg)}` : ''}
      ${app_.length ? `<p class="mt"><b>Approfondimenti</b></p>${galleria(app_)}` : ''}
      ${rep.length ? `<p class="mt"><b>Reperti</b></p>${rep.map((r) =>
        `<img class="reperto-img mt" src="${urlReperto(r)}" alt="">`).join('')}` : ''}
      ${!ogg.length && !app_.length && !rep.length
        ? '<p class="nota">Ancora niente.</p>' : ''}
    </div>

    <div class="btn-riga">
      <button class="btn pieno" id="taccuino-eroe">il taccuino</button>
      ${ep.lettera ? '<button class="btn" id="lettera-eroe">rileggete la lettera</button>' : ''}
    </div>`;
  dopoBarra();
  app.querySelectorAll('[data-scheda]').forEach((el) =>
    el.addEventListener('click', () => schedaEroe(eroeCresciuto({ partita: P() },
      el.dataset.scheda, ctx.comune.eroi.find((x) => x.nome === el.dataset.scheda)), {})));
  app.querySelector('#lettera-eroe')?.addEventListener('click', letteraDiChiGioca);
  app.querySelector('#taccuino-eroe').onclick = taccuinoDiChiGioca;
  // LA STESSA FUNZIONE CHE USA CHI ARBITRA. Non una richiesta, non un giro per
  // il tavolo: e' la sua abilita' e la spende lui, e la regola sta nel motore —
  // quindi il codice e' uno solo, e non ci sono due strade da tenere allineate.
  app.querySelectorAll('[data-appr]').forEach((el) => el.addEventListener('click', () => {
    const l = luogoN(Number(el.dataset.luogo));
    if (!l) return;
    const tipiQui = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
    if (el.dataset.appr === 'profano') return aiutoProfano(l, el.dataset.tipo, mioEroe());
    return approfondisci(l, el.dataset.tipo, tipiQui, mioEroe());
  }));
}

// GLI APPUNTI, UNO PER EROE.
//
// Il campo unico era del gruppo e lo scriveva chi conduce: al tavolo funziona,
// perche' il Taccuino e' uno e sta in mezzo. Con un telefono a testa no — quel
// che tieni a mente e' TUO, e la nota di un altro e' la cosa piu' utile che
// puoi leggere fra una porta e l'altra («il liutaio esce di notte» l'aveva
// scritto Mora due ore fa, e nessuno se lo ricordava).
//
// Ognuno scrive il proprio e legge quelli degli altri. Gli appunti del gruppo
// restano: sono la lavagna comune, e li tiene chi arbitra.
const noteDi = (nm) => ((IND().noteEroe || {})[nm] || '');

// Aggancia le caselle: si scrive solo il proprio, e si manda al tavolo quando
// si smette di scrivere — non a ogni tasto, che sarebbe una spinta per lettera.
function agganciaAppunti(quando) {
  ctx.app.querySelectorAll('[data-nota-eroe]').forEach((el) => {
    el.addEventListener('change', () => quando(el.dataset.notaEroe, el.value));
    el.addEventListener('blur', () => quando(el.dataset.notaEroe, el.value));
  });
}

// APPROFONDIRE E' DELL'EROE, non di chi arbitra.
//
// Il tiro era gia' suo; l'azione che lo innesca no, e la distanza fra le due
// cose si sentiva al tavolo — chi conduce premeva per te un bottone che porta
// il nome della TUA abilita'. Qui i bottoni stanno dove sta l'abilita'.
//
// Chi arbitra resta il motore: il telefono CHIEDE, e l'esito lo esegue e lo
// annuncia lui. Non e' un compromesso tecnico — nell'Indagine agisce una mano
// sola per scelta, e quella mano tiene anche il filo del racconto.
function approfondireHtml(l) {
  const ind = IND();
  const mio = mioEroe();
  if (!mio) return '';
  const tipiQui = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
  if (!tipiQui.length) return '';
  const letto = (tipo) => ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  // idoneo = ha una carica di quel tipo (o il jolly di Sibilla). E' la stessa
  // regola di `idoneiPerTipo`, guardata dal proprio posto invece che da quello
  // di chi conduce.
  const puo = (tipo) => idoneiPerTipo(ctx.comune, P(), tipo).some((x) => x.nome === mio);
  const aperti = tipiQui.filter((t) => !letto(t));
  // se non c'e' piu' niente da cogliere la sezione RESTA, e lo dice: adesso e'
  // la prima cosa sotto il banner, e un vuoto al suo posto sembrerebbe un guasto
  if (!aperti.length) {
    return `<div class="pannello">
      <h2>guardare meglio</h2>
      <p class="nota">Qui avete già colto tutto quel che c’era.</p>
    </div>`;
  }
  const miei = aperti.filter(puo);
  // l'aiuto profano e' l'occasione UNA di questo luogo, e la tenta chi vuole:
  // qui il bottone c'e' su tutti i telefoni presenti
  const profanoFatto = !!(ind.profano || {})[l.n];
  return `<div class="pannello">
      <h2>guardare meglio</h2>
      <p class="nota">Siete dentro. Quel che cogliete lo legge tutto il tavolo.</p>
      <div class="btn-riga">
        ${miei.map((t) => `<button class="btn pieno" data-appr="approfondisci"
          data-luogo="${l.n}" data-tipo="${esc(t)}">${esc(t.toLowerCase())}</button>`).join('')}
        ${profanoFatto ? '' : `<button class="btn" data-appr="profano"
          data-luogo="${l.n}" data-tipo="${esc(aperti[0])}">aiuto profano (1 volta qui)</button>`}
      </div>
      ${miei.length ? '' : '<p class="nota">Qui non c’è niente che parli il vostro linguaggio: resta l’occhio del dilettante.</p>'}
    </div>`;
}

function taccuinoDiChiGioca() {
  ctx.schermata = taccuinoDiChiGioca;
  const { app, ep } = ctx;
  const ind = IND();
  const mio = mioEroe();
  app.innerHTML = `
    ${barra('il taccuino')}
    <div class="pannello">
      <h2>le ${domandeBusta(ep).length} domande</h2>
      <p class="nota">Le risposte le scrive chi arbitra: la busta si apre una volta sola, e
      per tutti. Qui si leggono, per ragionarci sopra fra una porta e l’altra.</p>
      ${domandeBusta(ep).map((d, i) => `
        <p class="mt"><b>${i + 1}. ${esc(d.q)}</b></p>
        ${(ind.risposte[i] || '').trim()
          ? `<p><i>${esc(ind.risposte[i])}</i></p>`
          : '<p class="nota">— ancora nessuna risposta —</p>'}`).join('')}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>i vostri appunti</h2>
      ${mio ? `<textarea class="campo" data-nota-eroe="${esc(mio)}" rows="5"
          placeholder="quel che non volete dimenticare…">${esc(noteDi(mio))}</textarea>`
        : '<p class="nota">Non avete un eroe a questo tavolo.</p>'}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>quelli degli altri</h2>
      ${P().party.filter((nm) => nm !== mio).map((nm) => `
        <p class="mt"><b>${esc(breve(nm))}</b></p>
        ${noteDi(nm).trim() ? `<p>${esc(noteDi(nm))}</p>`
          : '<p class="nota">— non ha ancora scritto niente —</p>'}`).join('')}
      ${(ind.note || '').trim()
        ? `<hr class="divisore"><p class="nota">Del gruppo, dal Taccuino di chi arbitra</p>
           <p>${esc(ind.note)}</p>` : ''}
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="torna-strada">tornate in strada →</button>
    </div>`;
  dopoBarra();
  agganciaAppunti((nm, testo) => esegui({ tipo: 'nota-eroe', eroe: nm, testo }));
  app.querySelector('#torna-strada').onclick = vistaDiChiGioca;
}

// LA LETTERA D'INCARICO, dal telefono.
//
// E' la cosa che apre l'episodio e si legge ad alta voce: l'hanno sentita
// tutti, e a meta' serata «cosa ci aveva chiesto M.?» e' la domanda che torna
// piu' spesso. Averla in tasca vale piu' di rifarsela raccontare.
//
// SI LEGGE SOLO IL CORPO. La coda in corsivo («Luoghi disponibili
// dall'inizio…») non e' la mano di M.: e' l'app che parla a chi conduce, ed e'
// regia — sul telefono direbbe quali porte esistono prima che il gruppo le
// abbia trovate.
function letteraDiChiGioca() {
  ctx.schermata = letteraDiChiGioca;
  const { app, ep } = ctx;
  const { corpo } = spezzaLettera(ep.lettera);
  app.innerHTML = `
    ${barra('la lettera d’incarico')}
    <div class="pannello lettera-panel">
      <p class="nota centrato">— la lettera d’incarico, dal Taccuino —</p>
      <div class="lettera-testo">${rendi(corpo)}</div>
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="torna-strada">torna in strada →</button>
    </div>`;
  dopoBarra();
  app.querySelector('#torna-strada').onclick = vistaDiChiGioca;
}

// ------------------------------------------------------------ IL PUNTO UNICO
//
// Ogni mossa dell'Indagine passa di qui, e da qui si dirama: col tavolo vivo il
// comando ci va e lo stato torna di la'; senza tavolo il motore gira in questo
// browser e non cambia niente. E' la stessa forma di `digitale.js`, ed e' la
// ragione per cui l'Indagine e' entrata nel motore: cosi' la partita non dipende
// piu' da dove guarda una persona.
//
// Il ramo locale non e' un ripiego per i banchi di prova: e' come si gioca senza
// server, e va tenuto vivo.
async function esegui(comando) {
  const dati = { ep: ctx.ep, comune: ctx.comune, carte: ctx.carte };

  if (ctx.posto && ctx.posto.tavolo && ctx.tavoloVivo) {
    try {
      const r = await fetch(`/api/tavolo/${encodeURIComponent(ctx.posto.tavolo)}/comando`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comando),
      });
      const out = await r.json();
      if (!r.ok || out.rifiuto) { flash((out.rifiuto || {}).motivo || 'Il tavolo ha rifiutato la mossa.'); return null; }
      incassa(out.stato);
      return out;
    } catch {
      // il filo e' caduto a meta' mossa: non si applica niente qui, perche' uno
      // stato inventato in locale divergerebbe da quello del tavolo e non ci
      // sarebbe modo di accorgersene
      flash('Il tavolo non risponde. La mossa non è stata fatta.');
      return null;
    }
  }

  // CHI GIOCA NON APPLICA MAI IN LOCALE: la partita vera sta sul tavolo, e
  // applicare qui vorrebbe dire farsi una partita propria che nessun altro vede.
  if (ctx.posto && ctx.posto.tavolo && !arbitro()) {
    flash('Un momento: mi sto ricollegando al tavolo.');
    return null;
  }

  const out = applica(ctx.partita, comando, dati);
  if (out.rifiuto) { flash(out.rifiuto.motivo); return null; }
  incassa(out.stato);
  salva(ctx.partita);
  if (ctx.posto && ctx.posto.tavolo) {
    mettiSulTavolo(ctx.posto, ctx.partita).catch(() => { /* si gioca lo stesso */ });
  }
  return out;
}

// IL TRAVASO. Si travasa DENTRO l'oggetto che c'e', non si sostituisce: i
// gestori agganciati a schermo tengono un riferimento a `ctx.partita`, e
// scambiarlo sotto li farebbe scrivere su un oggetto che nessuno guarda piu'.
// E' la stessa trappola per cui in `digitale.js` esiste `incassa()`.
function incassa(stato) {
  if (!stato) return;
  Object.assign(ctx.partita.indagine, stato.indagine);
  Object.assign(ctx.partita, stato, { indagine: ctx.partita.indagine });
}

// Un messaggio che passa: un rifiuto va detto, non ingoiato.
function flash(testo) {
  if (!testo) return;
  const vecchio = ctx.app.querySelector('.flash-indagine');
  if (vecchio) vecchio.remove();
  const el = document.createElement('div');
  el.className = 'flash-indagine';
  el.textContent = testo;
  ctx.app.prepend(el);
  setTimeout(() => el.remove(), 4000);
}

// -------------------------------------------------------------- dichiara
// DICHIARARE UNA DESTINAZIONE. La regola sta nel motore — quanto costa, se e'
// troppo tardi, se la porta e' chiusa: qui si manda il comando e si legge cosa
// e' successo dagli EVENTI. La prosa resta di qua, che e' il suo posto.
async function dichiara(nomeVoce) {
  const out = await esegui({ tipo: 'dichiara', voce: nomeVoce });
  if (!out) return;                       // rifiutato: il motivo l'ha gia' detto `flash`
  const ev = (t) => out.eventi.find((e) => e.tipo === t);

  if (ev('pista-fredda')) {
    // la frase di colore la sceglie la vista: il motore dice solo che e' fredda
    const esito = dichiaraVoce(ctx.ep, ctx.comune, nomeVoce);
    return pannelloMsg('pista fredda', `<p><i>${esc(esito.frase || '')}</i></p>
      <p class="nota mt">Nessuna ora spesa.</p>`, home);
  }
  if (ev('mezzanotte')) {
    return pannelloMsg('è mezzanotte', '<p>Il tempo è finito: chiudete l’indagine.</p>', home);
  }
  const lontano = ev('troppo-lontano');
  if (lontano) {
    const l = luogoN(lontano.luogo);
    return pannelloMsg('troppo lontano', `<p><i>${esc(l.nome.toLowerCase())} è
      fuori città: la trasferta vuole ${lontano.costo} ore, e non le avete.</i></p>
      <p class="nota mt">Nessuna ora spesa: con un'ora sola non si dichiara.</p>`, home);
  }
  const chiuso = ev('gia-chiuso');
  if (chiuso) {
    const l = luogoN(chiuso.luogo);
    return pannelloMsg(l.nome.toLowerCase(), `<p><i>${chiuso.chiude != null
      ? `Troppo tardi: qui hanno chiuso alle ${chiuso.chiude}:00. Il portone resta muto.`
      : `Qui non aprono prima delle ${chiuso.apre}:00: la strada è ancora deserta.`}</i></p>
      <p class="nota mt">Nessuna ora spesa: lo sapevate arrivando.</p>`, home);
  }
  const chiusa = ev('porta-chiusa');
  if (chiusa) return bussare(luogoN(chiusa.luogo));
  const dentro = ev('entrati');
  if (dentro) return schedaLuogo(luogoN(dentro.luogo));
  home();
}

const luogoN = (n) => (ctx.ep.luoghi || []).find((x) => x.n === n);

// Il `requisito` e' prosa d'arbitro, e in 36 serrature su 90 contiene la
// parola d'ordine alla lettera («…apre solo a chi ha notato la crepa: IL
// NASTRO VERDE che il presidente sapeva prima di tutti»). Al tavolo l'arbitro
// la legge e non la dice; qui il pannello la serviva a chi bussa, e quelle
// serrature erano aperte dal minuto zero.
function requisitoSenzaChiave(l) {
  const chiave = l.chiave && l.chiave[0] === 'parola' ? l.chiave[1] : null;
  if (!chiave || !l.requisito) return l.requisito;
  const rx = new RegExp(chiave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return l.requisito.replace(rx, '…')
    // l'articolo rimasto orfano davanti al buco («la faccenda del….») lo
    // riempie mezzo: se la parola comincia per articolo, se ne va con lei.
    // Le preposizioni articolate lo lasciano fuso («delle misure» - «le
    // misure» = «del»), quindi il moncone va tolto a parte.
    .replace(/\b(?:de|ne|su|da|co|a)l…/gi, '…')
    .replace(/\s+\b(?:il|lo|la|i|gli|le|l’|un|uno|una|del|dello|della|dei|degli|delle)\s+…/gi, ' …')
    .replace(/…\s*\./g, '…');
}

// ---------------------------------------------------------------- bussare
function bussare(l) {
  const { app } = ctx;
  app.innerHTML = `
    ${barra('la porta è chiusa')}
    ${bannerLuogo(l)}
    <div class="pannello">
      <h2>${esc(l.nome.toLowerCase())}</h2>
      <p class="mt"><i>${rendi(requisitoSenzaChiave(l))}</i></p>
      <p class="nota mt">Potete dichiarare UNA parola d’ordine o UN oggetto per questa
      visita. Giusta: si entra subito. Sbagliata: l’ora è comunque spesa.</p>
      <input class="campo mt" id="dichiarazione" placeholder="una parola, o il nome di un oggetto…"
             autocomplete="off" autocapitalize="characters">
      <div class="btn-riga">
        <button class="btn pieno" id="prova">bussate</button>
        ${P().party.includes('NINO “GRIMALDELLO” CAUTO') && !IND().grimaldelloUsato
          ? '<button class="btn" id="grimaldello">Grimaldello di Nino — dentro senza chiave (1 volta)</button>' : ''}
        <button class="btn" id="rinuncia">tornate sui vostri passi</button>
      </div>
    </div>`;
  dopoBarra();
  app.querySelector('#rinuncia').onclick = home;
  app.querySelector('#grimaldello')?.addEventListener('click', async () => {
    const out = await esegui({ tipo: 'grimaldello', luogo: l.n });
    if (!out) return;
    // bypassa SOLO l'ingresso di questa visita: la chiave resta da scoprire
    pannelloMsg('la serratura cede', `<p><i>Nino ci mette meno di un respiro: la porta
      si apre senza che nessuno abbia detto niente. La parola giusta, però, ancora
      non la sapete.</i></p>`, () => schedaLuogo(l));
  });
  app.querySelector('#prova').onclick = async () => {
    const d = app.querySelector('#dichiarazione').value;
    if (!norm(d)) return;
    const out = await esegui({ tipo: 'bussa', luogo: l.n, dichiarazione: d });
    if (!out) return;
    const r = out.eventi.find((e) => e.tipo === 'bussato');
    if (r && r.entra) {
      pannelloMsg('la porta si apre', `<p><i>«${esc(d)}»… era la cosa giusta da dire — o da mostrare.</i></p>`,
        () => schedaLuogo(l));
    } else {
      pannelloMsg('niente da fare', `<p><i>Un silenzio lungo. Poi passi che si allontanano
        dall’altra parte. Qualunque cosa serva qui, non è «${esc(d)}».</i></p>
        <p class="nota mt">L’ora è spesa. La carta del luogo resta scoperta: ora ne
        conoscete il volto.</p>`, home);
    }
  };
}

// ----------------------------------------------------------------- visita
// RIENTRARE in un luogo gia' aperto: l'ora si paga di nuovo — e' il viaggio,
// non la porta. Entrare la prima volta lo fanno `dichiara` e `bussa`, che l'ora
// l'hanno gia' pagata.
async function visita(l) {
  const out = await esegui({ tipo: 'visita', luogo: l.n });
  if (out) schedaLuogo(l);
}

function schedaLuogo(l) {
  const { app, ep } = ctx;
  const ind = IND();
  const tipiQui = [...new Set(l.approfondimenti.map((a) => a.tipo))];
  const letti = ind.approfondimentiLetti.filter((x) => x.n === l.n);
  app.innerHTML = `
    ${barra(l.nome.toLowerCase())}
    ${bannerLuogo(l)}
    ${l.testo ? `<div class="pannello"><p><i>${rendi(l.testo)}</i></p></div><div class="mt"></div>` : ''}
    <div class="pannello">
      <h2>indizi — leggeteli ad alta voce</h2>
      ${l.indizi.map((i) => `<p class="mt">◆ ${rendi(i)}</p>`).join('')}
      ${(l.oggetti || []).length || (l.reperti || []).length ? `
        <hr class="divisore">
        <p class="nota">carte e reperti da prendere</p>
        <div class="btn-riga">
          ${(l.oggetti || []).map((o) => ind.oggetti.includes(o)
            ? `<button class="btn disabilitato">${esc(o)} ✓</button>`
            : `<button class="btn" data-oggetto="${esc(o)}">prendete “${esc(o)}”</button>`).join('')}
          ${(l.reperti || []).map((r) => (ind.reperti || []).includes(r)
            ? `<button class="btn disabilitato">${esc(nomeReperto(r))} ✓</button>`
            : `<button class="btn" data-reperto="${esc(r)}">consegnate “${esc(nomeReperto(r))}”</button>`).join('')}
        </div>` : ''}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>approfondire</h2>
      ${ind.scenaChiusa ? `<p class="nota">Qui avete già guardato meglio, e non
        è venuto fuori niente: per questa visita gli Approfondimenti restano
        nascosti. Lasciate il luogo e tornateci (1 ora) per ritentare.</p>` : `
      <p class="nota">Ogni tipo lo sblocca l’eroe con l’abilità giusta (Elena le
      Osservazioni, Attilio o Brera i Referti…). Scegliete il tipo, poi <b>chi prova a
      guardare meglio</b>: tira ACUME, e solo se riesce spende la sua carica.
      Fallendo non si spende nulla, ma qui non si tenta più: si esce e si torna.</p>
      <div class="btn-riga">
        ${['Osservazione', 'Testimonianza', 'Referto', 'Presagio'].map((t) =>
          `<button class="btn" data-tipo="${t}">${t}</button>`).join('')}
      </div>
      ${letti.length ? `<p class="nota mt">Già colti qui: ${letti.map((x) => esc(x.soggetto)).join(' · ')}</p>` : ''}`}
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="fine-visita">lasciate il luogo</button>
    </div>`;
  dopoBarra();
  app.querySelector('#fine-visita').onclick = async () => {
    await esegui({ tipo: 'lascia-luogo' });
    home();
  };
  app.querySelectorAll('[data-oggetto]').forEach((b) => b.onclick = async () => {
    const nome = b.dataset.oggetto;
    if (!await esegui({ tipo: 'prendi-oggetto', nome })) return;
    const cardO = cartaOggetto(ctx.carte, P().episodio, nome);
    pannelloMsg(nome.toLowerCase(),
      `${cardO ? `<div class="carta-grande"><img src="${urlCartaSafe(cardO.file)}" alt=""></div>` : ''}
       <p class="nota mt">Prendete la carta “${esc(nome)}” dal mazzo Oggetti: da ora è vostra.</p>`,
      () => schedaLuogo(l));
  });
  app.querySelectorAll('[data-reperto]').forEach((b) => b.onclick = async () => {
    const nome = b.dataset.reperto;
    if (!await esegui({ tipo: 'prendi-reperto', nome })) return;
    pannelloMsg(nomeReperto(nome).toLowerCase(),
      `<img class="reperto-img" src="${urlReperto(nome)}" alt="">
       <p class="nota mt">Consegnate ai giocatori il reperto stampato “${esc(nomeReperto(nome))}”
       — o leggetelo da qui, facendolo girare.</p>`,
      () => schedaLuogo(l));
  });
  if (!ind.scenaChiusa) {
    app.querySelectorAll('[data-tipo]').forEach((b) =>
      b.onclick = () => approfondisci(l, b.dataset.tipo, tipiQui));
  }
}

// 'Reperto A - Diario di Ruggero' -> 'Diario di Ruggero' (per i bottoni)
const nomeReperto = (file) => file.replace(/^Reperto [A-Z] - /, '');
const urlReperto = (file) =>
  encodeURI(`/assets/${ctx.ep.cartella}/reperti/${file}.png`);

// `giaScelto` — l'eroe l'ha chiesto lui, dal suo telefono, e non c'e' niente da
// domandare: e' la sua abilita' e ha gia' deciso di spenderla. Senza, si chiede
// come sempre — al tavolo con un solo schermo quella scelta e' del gruppo.
// GUARDARE MEGLIO. La regola sta nel motore: qui si sceglie CHI, si chiede il
// dado, e si manda un comando completo. Il dado si chiede PRIMA di mandare
// perche' al tavolo un dado tirato non si rimette nel bicchiere.
async function approfondisci(l, tipo, tipiQui, giaScelto) {
  const c = idoneiPerTipo(ctx.comune, P(), tipo);
  if (!c.length) return aiutoProfano(l, tipo, giaScelto);

  const acume = (nm) => (ctx.comune.eroi.find((e) => e.nome === nm) || {}).acume ?? 0;
  // La scelta pesa su DUE cose — la carica e l'ACUME di chi tira — quindi
  // l'etichetta le mostra entrambe.
  const chi = (giaScelto && c.some((x) => x.nome === giaScelto)) ? giaScelto
    : await scegliDaLista('chi prova a guardare meglio?', c.map((x) => ({
      id: x.nome,
      label: (x.proprie > 0
        ? `${x.nome} — ${x.proprie} ${x.proprie === 1 ? 'carica' : 'cariche'}`
        : `${x.nome} (jolly di Sibilla: ${x.jolly})`) + ` · ACUME ${acume(x.nome)}`,
    })));
  if (!chi) return schedaLuogo(l);
  return mandaProva({ tipo: 'approfondisci', tipoApp: tipo, luogo: l.n, eroe: chi }, l);
}

// L'AIUTO PROFANO: l'occasione UNA di questo luogo, e la tenta chi vuole.
async function aiutoProfano(l, tipo, giaScelto) {
  const eroe = (giaScelto && P().party.includes(giaScelto))
    ? giaScelto
    : (await scegliEroe('aiuto profano — chi tenta? (ACUME, Difficile)', 'acume') || {}).nome;
  if (!eroe) return schedaLuogo(l);
  return mandaProva({ tipo: 'aiuto-profano', tipoApp: tipo, luogo: l.n, eroe }, l);
}

// IL TIRO, CHIESTO PRIMA DI MANDARE — e col Secondo Fiato, che non e' un
// comando: e' un tiro in piu' sullo stesso comando, e il motore lo accetta
// perche' `creaCaso` consuma i tiri dichiarati in ordine.
async function mandaProva(comando, l) {
  const p = provaDiIndagine({ comune: ctx.comune }, comando);
  const d = await chiediDado(p);
  if (!d) return schedaLuogo(l);
  let out = await esegui({ ...comando, tiri: [d] });
  if (!out) return schedaLuogo(l);

  // fallita, e chi ha tirato ha ancora il Secondo Fiato: si puo' ritentare
  const tiro = out.eventi.find((e) => e.tipo === 'tiro');
  P().fiatoUsato = P().fiatoUsato || {};
  if (tiro && !tiro.ok && !P().fiatoUsato[comando.eroe]) {
    const scelta = await scegliDaLista('prova fallita — ritentate?', [
      { id: 'fiato', label: `Secondo Fiato di ${comando.eroe.split(' ')[0]} (una volta a episodio)` },
      { id: 'accetta', label: 'accettate il fallimento' },
    ]);
    if (scelta === 'fiato') {
      const d2 = await chiediDado(p);
      // `fiato: true` lo dice al MOTORE, che sa cosa significa: rifare quel
      // tiro, e rialzare il chiavistello appena scattato
      if (d2) out = (await esegui({ ...comando, tiri: [d2], fiato: true })) || out;
    }
  }
  mostraEsito(out, l);
}

// Il dado: si tira all'app o si dichiarano due dadi veri, a ogni tiro.
const chiediDado = async (p) => {
  const r = await tiraProva({ ...p, sceltaOgniVolta: true });
  return r ? [r.d1, r.d2] : null;
};

// La prosa dell'esito: il motore dice il FATTO, la vista lo racconta.
function mostraEsito(out, l) {
  const ev = (t) => out.eventi.find((e) => e.tipo === t);
  const chiudi = () => schedaLuogo(l);

  const colto = ev('colto');
  if (colto) {
    const a = (l.approfondimenti || []).find((x) => x.soggetto === colto.soggetto);
    return consegnaApprofondimento(l, a, colto.tipoApp, colto.profano
      ? '<p class="nota">Colto da profano, ma colto.</p>' : '');
  }
  const niente = ev('niente-per-te');
  if (niente) {
    return pannelloMsg(String(niente.tipoApp || 'aiuto profano').toLowerCase(),
      `<p><i>${esc(String(niente.chi).split(' ')[0])} osserva, ascolta, fruga. ${niente.gia
        ? 'Quello che c’era da cogliere qui, l’avete già colto.'
        : 'Ma qui non c’è nulla che parli il suo linguaggio.'}</i></p>`, chiudi, { atutti: true });
  }
  if (ev('scena-chiusa')) {
    return pannelloMsg('niente, per ora', `<p><i>${esc(String(ev('scena-chiusa').chi).split(' ')[0])}
      cerca, e non trova la presa. Quello che c’è qui non si lascia prendere adesso.</i></p>
      <p class="nota mt">La carica resta. Per ritentare bisogna lasciare il luogo e
      tornarci: un’altra ora.</p>`, chiudi, { atutti: true });
  }
  if (ev('profano-gia-speso')) {
    return pannelloMsg('aiuto profano', `<p class="nota">Nessun eroe può più sbloccare
      una ${esc(String(ev('profano-gia-speso').tipoApp || '').toLowerCase())} — e l’occhio del
      dilettante, qui, ha già avuto la sua occasione stanotte.</p>`, chiudi, { atutti: true });
  }
  if (ev('profano-fallito')) {
    return pannelloMsg('aiuto profano', `<p><i>${esc(String(ev('profano-fallito').chi).split(' ')[0])}
      fruga senza metodo, e il luogo se ne accorge. Qualunque cosa ci fosse da cogliere qui,
      resta sigillata — servirebbe l’occhio giusto.</i></p>`, chiudi, { atutti: true });
  }
  if (ev('pendolo')) return pendolo(l, ev('pendolo').chi);
  chiudi();
}

// QUEL CHE SI E' COLTO, letto insieme. La carta la scrive il motore
// (`indagine.carta`), quindi arriva a ogni schermo; qui si compone la pagina,
// che e' il mestiere della vista.
function consegnaApprofondimento(l, a, tipo, prefisso = '') {
  const cardA = a && cartaApprofondimento(ctx.carte, P().episodio, a.soggetto);
  pannelloMsg(`${String(tipo).toLowerCase()} — ${String(a ? a.soggetto : '').toLowerCase()}`,
    `${prefisso}
     ${cardA ? `<div class="carta-grande"><img src="${urlCartaSafe(cardA.file)}" alt=""></div>` : ''}
     <p class="mt"><i>${rendi(a ? a.testo : '')}</i></p>
     <p class="nota mt">Prendete la carta “${esc(a ? a.soggetto : '')}” dal mazzo Approfondimenti.</p>`,
    () => schedaLuogo(l), { atutti: true });
}

function pendolo(l, chi) {
  const ind = IND();
  const letto = (n, x) => ind.approfondimentiLetti.some((y) =>
    y.n === n && y.tipo === x.tipo && y.soggetto === x.soggetto);
  const quiChiusi = (l.approfondimenti || []).filter((x) => !letto(l.n, x));
  if (quiChiusi.length) {
    const a = quiChiusi[0];
    usaCarica(P(), chi, a.tipo, true);
    ind.approfondimentiLetti.push({ n: l.n, tipo: a.tipo, soggetto: a.soggetto });
    salvaP();
    return consegnaApprofondimento(l, a, a.tipo,
      `<p><i>Il pendolo di Sibilla oscilla appena — e si ferma. Qui c’è qualcosa,
       anche se non dove stavate guardando.</i></p>`);
  }
  const altrove = ctx.ep.luoghi.filter((x) => x.n !== l.n &&
    (x.approfondimenti || []).some((a2) => !letto(x.n, a2)));
  if (!altrove.length) {
    return pannelloMsg('sesto senso', `<p><i>Il pendolo resta immobile, il filo dritto
      come un fuso: in città non è rimasto nulla da cogliere. Il dono, stavolta,
      non si spende.</i></p>`, () => schedaLuogo(l));
  }
  const scelta = altrove[Math.floor(Math.random() * altrove.length)];
  usaCarica(P(), chi, 'jolly', true);
  salvaP();
  pannelloMsg('sesto senso', `<p><i>Il pendolo ruota lento sopra la mappa, poi il filo
    si tende, deciso: <b>${esc(scelta.voce_mappa)}</b>. Là qualcosa aspetta ancora
    l’occhio giusto — il pendolo non dice quale.</i></p>
    <p class="nota mt">Il jolly di Sibilla è speso: l’informazione è questa.</p>`,
    () => schedaLuogo(l));
}


// Discernimento di Padre Marani: indica un luogo, la risposta e' solo
// si'/no ("li' si nasconde ancora qualcosa?"). Se si', quella visita non
// costa l'ora — il tiro per cogliere l'Approfondimento resta comunque da fare
// sul posto, come ovunque.
async function discernimento() {
  const { ep, comune } = ctx;
  const ind = IND();
  const voci = vociMappa(ep, comune);
  const scelta = await scegliDaLista('Marani indica un luogo…',
    voci.map((v) => ({ id: v.nome, label: v.nome })));
  if (!scelta) return home();
  ind.discernimentoUsato = true;
  const luogo = ep.luoghi.find((l) => norm(l.voce_mappa) === norm(scelta));
  const ancora = luogo && (luogo.approfondimenti || []).some((a) =>
    !ind.approfondimentiLetti.some((y) => y.n === luogo.n && y.tipo === a.tipo && y.soggetto === a.soggetto));
  if (ancora) ind.visitaGratis = luogo.n;
  salvaP();
  pannelloMsg('discernimento', ancora
    ? `<p><i>Marani chiude gli occhi un istante, poi annuisce: <b>sì</b> — lì si nasconde
       ancora qualcosa.</i></p><p class="nota mt">La prossima visita a quel luogo non
       costa l’ora. Per cogliere quel che nasconde, lì, si tira come ovunque.</p>`
    : `<p><i>Marani scuote il capo, piano: <b>no</b>. Qualunque cosa ci fosse da vedere lì,
       o l’avete già colta, o non c’è mai stata.</i></p>`, home);
}

// Fonti riservate di Carla: la PROSSIMA visita non costa l'ora (e non
// conta come ora avanzata a fine indagine)
function fontiRiservate() {
  const ind = IND();
  ind.fontiRiservateUsate = true;
  ind.fontiRiservateAttive = true;
  salvaP();
  pannelloMsg('fonti riservate', `<p><i>Carla conosce la porta giusta e chi la apre
    senza domande: la <b>prossima visita</b> non costerà l’ora.</i></p>
    <p class="nota mt">Non conta come ora avanzata a fine indagine: il vantaggio
    premia le ore spese davvero.</p>`, home);
}

// Ombra fiuta (Mora): il furetto in avanscoperta su un luogo — torna col
// NUMERO di Approfondimenti che ancora nasconde, mai il tipo
async function ombraFiuta() {
  const { ep, comune } = ctx;
  const ind = IND();
  const voci = vociMappa(ep, comune);
  const scelta = await scegliDaLista('dove mandate Ombra?',
    voci.map((v) => ({ id: v.nome, label: v.nome })));
  if (!scelta) return home();
  ind.ombraUsata = true;
  salvaP();
  const luogo = ep.luoghi.find((l) => norm(l.voce_mappa) === norm(scelta));
  const quanti = luogo ? (luogo.approfondimenti || []).filter((a) =>
    !ind.approfondimentiLetti.some((y) => y.n === luogo.n && y.tipo === a.tipo && y.soggetto === a.soggetto)).length : 0;
  pannelloMsg('ombra fiuta', `<p><i>Il furetto sguscia via sui tetti. Torna prima che
    la candela cali di un dito, e Mora gli legge in faccia il conto:
    <b>${quanti === 0 ? 'niente' : quanti === 1 ? 'una cosa' : quanti + ' cose'}</b> da
    cogliere ${quanti ? 'ancora, là' : '— là non c’è più nulla, o non c’è mai stato'}.</i></p>
    <p class="nota mt">Il numero, mai il tipo: Ombra fiuta, non legge.</p>`, home);
}

// ------------------------------------------------------------- taccuino
function taccuino() {
  const { app, ep } = ctx;
  const ind = IND();
  app.innerHTML = `
    ${barra('il taccuino della società')}
    <div class="pannello">
      <h2>le ${domandeBusta(ep).length} domande</h2>
      <p class="nota">Rispondete per iscritto, poi aprite la busta. Non si torna indietro.</p>
      ${domandeBusta(ep).map((d, i) => `
        <p class="mt"><b>${i + 1}. ${esc(d.q)}</b></p>
        <input class="campo" data-risposta="${i}" value="${esc(ind.risposte[i] || '')}"
               placeholder="la vostra risposta…">`).join('')}
      <p class="mt"><b>Appunti del gruppo</b> — nomi, orari, parole che tornano:</p>
      <textarea class="campo" id="note-taccuino" rows="5"
        placeholder="quel che la notte non deve farvi dimenticare…">${esc(ind.note || '')}</textarea>
      <hr class="divisore">
      <p><b>E quelli di ciascuno</b></p>
      ${P().party.map((nm) => `<p class="mt"><b>${esc(breve(nm))}</b></p>
        <textarea class="campo" data-nota-eroe="${esc(nm)}" rows="3"
          placeholder="— non ha ancora scritto niente —">${esc(noteDi(nm))}</textarea>`).join('')}
      <div class="btn-riga">
        <button class="btn" id="salva-risposte">salvate e tornate in strada</button>
      </div>
    </div>
    <div class="mt"></div>
    <div class="pannello sigillata">
      <div class="sigillo" aria-hidden="true">L</div>
      <span class="che">la soluzione · sigillata fino alla fine</span>
      <p class="nota mt">Rompere il sigillo chiude l’indagine per sempre.</p>
      <div class="btn-riga" style="justify-content:center">
        <button class="btn pieno" id="apri-busta">rompete il sigillo</button>
      </div>
    </div>`;
  dopoBarra();
  const leggi = () => {
    app.querySelectorAll('[data-risposta]').forEach((el) => {
      ind.risposte[Number(el.dataset.risposta)] = el.value;
    });
    ind.note = app.querySelector('#note-taccuino').value;
    // chi arbitra tiene in mano gli eroi che nessuno ha reclamato: puo' scrivere
    // gli appunti di chiunque, ed e' lo stesso patto della plancia
    ind.noteEroe = ind.noteEroe || {};
    app.querySelectorAll('[data-nota-eroe]').forEach((el) => {
      ind.noteEroe[el.dataset.notaEroe] = el.value;
    });
    salvaP();
  };
  app.querySelector('#salva-risposte').onclick = () => { leggi(); home(); };
  app.querySelector('#apri-busta').onclick = async () => {
    leggi();
    if (!await conferma('Rompete il sigillo?', {
      dettaglio: 'La busta si apre una volta sola: l’indagine si chiude per sempre.',
      si: 'rompete il sigillo', no: 'non ancora', sigillo: 'L',
    })) return;
    busta();
  };
}

function busta() {
  const { app, ep } = ctx;
  const ind = IND();
  ind.chiusa = true;
  // Il giudizio automatico confronta parole, e su risposte scritte a mano
  // sbaglia sempre nello stesso verso: boccia chi ha indovinato ma e' stato
  // sintetico (16 domande su 81 danno «sbagliata» a una risposta corretta —
  // «Il professor Cesare Braga» contro una verita' lunga tre righe). Al tavolo
  // l'ultima parola ce l'ha chi arbitra; qui ce l'ha il gruppo, che la verita'
  // ce l'ha gia' sotto gli occhi due righe piu' sotto.
  const corr = ind.correzioni || (ind.correzioni = {});
  const esiti = verificaRisposte(ep, ind.risposte).map((e, i) => ({
    ...e, i, corretto: i in corr, ok: (i in corr) ? corr[i] : e.ok,
  }));
  // la CONTRO-BUSTA resta sigillata: non si mostra qui e non pesa sul tier,
  // o lo Slancio sarebbe irraggiungibile (chiede TUTTE le risposte esatte, e
  // quella non e' ancora conoscibile). Si apre nell'epilogo di spedizione.
  const inBusta = esiti.filter((e) => !e.dopo_spedizione);
  const t = tierIndagine(ep, ind, inBusta.map((e) => e.ok));
  P().vantaggi = { tier: t.tier, dossier: t.dossier, risposte: esiti.map((e) => e.ok) };
  // Le penalita' da Domanda sbagliata erano SOLO stampate: `sbagliata` compare
  // in due punti dell'app, entrambi di sola lettura. Al tavolo le applica chi
  // arbitra; in digitale l'arbitro e' l'app, e non le applicava nessuno — meta'
  // della posta dell'Indagine spariva. Qui si applica la piu' comune, «la
  // spedizione parte con 1 segnalino Canto in piu'» (undici Domande su venti
  // episodi), che ora ha un campo suo invece di vivere solo nella prosa.
  // Le altre penalita' restano al testo: sono una diversa per episodio.
  const cantoIniziale = esiti.reduce((n, e) => n + (e.ok ? 0 : ((e.penalita || {}).canto || 0)), 0);
  P().spedizione = { ...(P().spedizione || {}), canto: cantoIniziale };
  salvaP();
  app.innerHTML = `
    ${barra('la busta è aperta')}
    <div class="pannello">
      <h2>le risposte</h2>
      ${inBusta.map((e, i) => `
        <div class="mt">
          <p><b>${i + 1}. ${esc(e.q)}</b> — ${e.ok ? '<span class="ok-txt">esatta</span>' : '<span class="ko-txt">sbagliata</span>'}${
            e.corretto ? ' <span class="nota">(deciso da voi)</span>' : ''}</p>
          <p class="nota">La verità: ${esc(e.risposta)}</p>
          <p>${esc(e.ok ? e.esatta : e.sbagliata)}</p>
          <button class="btn correggi" data-correggi="${e.i}">${e.ok
            ? 'no, l’avevamo sbagliata' : 'l’avevamo indovinata'}</button>
        </div>`).join('')}
      <p class="nota mt">Confrontate quello che avete scritto con la verità: se il
        giudizio dell’app non vi convince, correggetelo — decide il gruppo.</p>
      <hr class="divisore">
      <p class="mt"><b>Vantaggio d’indagine:</b> ${t.tier === 'slancio'
        ? 'SLANCIO — 3 azioni a testa nel 1° round di spedizione, e +1 Salute massima a testa.'
        : t.tier === 'preparati' ? 'PREPARATI — +1 Salute massima a testa.'
        : 'nessuno: siete arrivati col fiato corto.'}
        (${t.oreAvanzate} ore avanzate, ${t.luoghi} luoghi visitati)</p>
      ${t.dossier ? '<p><b>Dossier completo:</b> 1 gettone Intuizione — un solo ri-tiro, una volta, in spedizione.</p>' : ''}
      ${cantoIniziale ? `<p class="mt"><b class="ko-txt">Partite in ritardo:</b> la spedizione comincia
        con <b>${cantoIniziale} segnalino${cantoIniziale > 1 ? 'i' : ''} Canto</b> già sulla traccia.</p>` : ''}
      ${controBusta(ep) ? `<hr class="divisore">
        <p class="nota"><b>Resta una busta sigillata.</b> ${esc(controBusta(ep).q.replace(/^CONTRO-BUSTA — /, ''))}
        Non si apre stanotte: si apre quando tornate dalla villa.</p>` : ''}
      <div class="btn-riga">
        <button class="btn pieno" id="alla-spedizione">alla spedizione</button>
      </div>
    </div>`;
  dopoBarra();
  app.querySelectorAll('[data-correggi]').forEach((b) => {
    b.onclick = () => {
      const k = Number(b.dataset.correggi);
      corr[k] = !esiti.find((e) => e.i === k).ok;
      salvaP();
      busta();                       // ricalcola tier e vantaggi col nuovo esito
    };
  });
  app.querySelector('#alla-spedizione').onclick = () => {
    P().fase = 'spedizione';
    salvaP();
    ctx.vaiA('spedizione');
  };
}

// --------------------------------------------------------------- utility UI
function inventario() {
  const ind = IND();
  const epId = P().episodio;
  const galleria = (files) => files.length
    ? `<div class="galleria-carte">${files.map((f) =>
        `<img loading="lazy" src="${urlCartaSafe(f)}" alt="">`).join('')}</div>` : '';
  const ogg = ind.oggetti.map((n) => cartaOggetto(ctx.carte, epId, n)).filter(Boolean).map((c) => c.file);
  const app_ = ind.approfondimentiLetti.map((x) =>
    cartaApprofondimento(ctx.carte, epId, x.soggetto)).filter(Boolean).map((c) => c.file);
  const rep = ind.reperti || [];
  const carbone = P().party.includes('FULGENZIO CARBONE') && !P().carboneUsato &&
                  (ind.oggetti.length || rep.length);
  pannelloMsg('quel che avete in mano',
    `${ogg.length ? `<p><b>Oggetti</b></p>${galleria(ogg)}` : ''}
     ${app_.length ? `<p class="mt"><b>Approfondimenti</b></p>${galleria(app_)}` : ''}
     ${rep.length ? `<p class="mt"><b>Reperti</b></p>${rep.map((r) =>
       `<img class="reperto-img mt" src="${urlReperto(r)}" alt="">`).join('')}` : ''}
     ${!ogg.length && !app_.length && !rep.length ? '<p class="nota">Ancora niente. La notte è giovane.</p>' : ''}
     ${carbone ? `<div class="btn-riga"><button class="btn" id="esame-carbone">esame di Carbone (1 volta)</button></div>` : ''}`,
    home);
  ctx.app.querySelector('#esame-carbone')?.addEventListener('click', () => esameCarbone(inventario));
}

// "E' passato dalla mia bottega": Fulgenzio esamina un Oggetto o un Reperto.
// Se il pezzo ha una voce d'esame la si legge e l'uso si consuma; se non ce
// l'ha, "non ha segreti per lui" e l'occasione resta (patto gentile).
async function esameCarbone(dopo) {
  const ind = IND();
  const pezzi = [...ind.oggetti, ...(ind.reperti || []).map((r) => r.replace(/^Reperto [A-Z] - /, ''))];
  const scelto = await scegliDaLista('cosa porta al banco di Carbone?',
    pezzi.map((n) => ({ id: n, label: n })));
  if (!scelto) return dopo();
  const esami = ctx.ep.esami_carbone || {};
  const chiave = Object.keys(esami).find((k) =>
    norm(scelto).includes(norm(k)) || norm(k).includes(norm(scelto)));
  if (!chiave) {
    return pannelloMsg('esame di carbone', `<p><i>Carbone lo rigira due volte, poi lo
      rende con un mezzo inchino: «Buon pezzo. Ma non ha segreti per me.»</i></p>
      <p class="nota mt">L’occasione non si spende: portategli qualcos’altro.</p>`, dopo);
  }
  P().carboneUsato = true;
  salvaP();
  pannelloMsg(`esame di carbone — ${scelto.toLowerCase()}`,
    `<p><i>${rendi(esami[chiave])}</i></p>`, dopo);
}


// `atutti: true` — LA SCHERMATA SI APRE SU OGNI SCHERMO.
//
// E' il meccanismo delle schermate da leggere insieme della Spedizione, portato
// qui: l'esito di un Approfondimento — sia quel che si e' colto, sia il «niente,
// per ora» — e' del GRUPPO, non di chi ha premuto. Va nello stato
// (`indagine.carta`), quindi arriva a tutti dal filo, sopravvive a un refresh, e
// si chiude quando la chiude chi conduce: cosi' nessuno va avanti mentre gli
// altri stanno ancora leggendo.
//
// Non tutte le schermate ci vanno: l'inventario e il Taccuino sono scrivania di
// chi arbitra, e spingerli sui telefoni sarebbe rumore. Si marca quel che il
// tavolo deve vedere, invece di spedire tutto.
function pannelloMsg(titolo, corpoHtml, dopo, { atutti = false } = {}) {
  const { app } = ctx;
  if (atutti && ctx.posto && ctx.posto.tavolo) {
    IND().carta = { titolo, corpo: corpoHtml };
    salvaP();
  }
  app.innerHTML = `
    ${barra(titolo)}
    <div class="pannello">${corpoHtml}</div>
    <div class="btn-riga"><button class="btn pieno" id="ok-msg">continuate</button></div>`;
  dopoBarra();
  app.querySelector('#ok-msg').onclick = () => {
    if (IND().carta) { IND().carta = null; salvaP(); }
    if (dopo) dopo();
  };
}

function scegliEroe(titolo, statKey) {
  const eroi = P().party.map((n) => ctx.comune.eroi.find((e) => e.nome === n)).filter(Boolean);
  return new Promise((risolvi) => {
    const ov = document.createElement('div');
    ov.className = 'scelta-overlay';
    ov.innerHTML = `<div class="scelta-box">
      <h3 class="sc">${esc(titolo)}</h3>
      <div class="eroe-picker">
        ${eroi.map((e) => `<button class="eroe-pick" data-id="${esc(e.nome)}">
          <span class="rit"><img src="${e.art ? urlArt(e.art) : ''}" alt="" loading="lazy"></span>
          <span class="np">${breve(e.nome)}</span>
          <span class="sv">${statKey.toUpperCase()} ${e[statKey]}</span></button>`).join('')}
      </div>
      <button class="btn scelta-btn annulla" data-id="">annulla</button>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('button').forEach((b) => b.onclick = () => {
      ov.remove(); risolvi(eroi.find((e) => e.nome === b.dataset.id) || null);
    });
  });
}

function scegliDaLista(titolo, opzioni) {
  return new Promise((risolvi) => {
    const ov = document.createElement('div');
    ov.className = 'scelta-overlay';
    ov.innerHTML = `<div class="scelta-box">
      <h3 class="sc">${esc(titolo)}</h3>
      ${opzioni.map((o) => `<button class="btn scelta-btn" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      <button class="btn scelta-btn annulla" data-id="">annulla</button>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('button').forEach((b) => b.onclick = () => {
      ov.remove(); risolvi(b.dataset.id || null);
    });
  });
}
