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
  ctx = { app, partita: vistoDa.stato, ep, comune, carte, vaiA, posto: posto || null,
          canale: null, tavoloVivo: false };
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
    mettiSulTavolo(posto, partita).then((vivo) => { ctx.tavoloVivo = vivo; })
      .catch(() => { /* si gioca lo stesso */ });
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
  ${orologio()}`;
}

// L'OROLOGIO NON STA MAI DIETRO UN TOCCO: e' la risorsa che tiene in ansia, e
// nasconderla la spegne. Accanto, il tasto del menu — dove sta tutto quel che
// non si guarda di continuo — col pallino quando nella notte c'e' una riga che
// non avete ancora letto.
function orologio() {
  const o = 24 - IND().ora;
  return `<div class="riga-capo">
    <div class="riga-registro">${registroOre()}
      <span class="sc resta">${o ? `${o} ${o === 1 ? 'ora' : 'ore'} a mezzanotte` : 'mezzanotte'}</span>
      ${suoni.bottoneHtml()}
    </div>
    <button class="btn btn-menu" id="apri-menu">menu${
      nuoveNelRegistro() ? '<span class="segno"></span>' : ''}</button>
  </div>`;
}

// quante righe sono arrivate da quando questo dispositivo ha guardato il
// registro. Vive nella pagina e non nello stato: e' quel che ha letto CHI
// GUARDA questo schermo, e metterlo nella partita farebbe leggere per tutti
const nuoveNelRegistro = () => Math.max(0, (IND().notte || []).length - (ctx.notteLette || 0));

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
  ctx.app.querySelector('#apri-menu')?.addEventListener('click', menu);
  suoni.agganciaBottone(ctx.app, statoSuoni);
  suoni.aggiorna(statoSuoni());
}

// ═══════════════════════════════════ IL MENU ═══════════════════════════════
//
// Il precedente e' il piu' imparato di tutti: ogni GDR da quarant'anni ha un
// tasto solo che apre inventario, squadra, diario e mappa, e fuori resta la
// scena. Qui le voci sono raggruppate per MESTIERE — il gruppo, chi conduce —
// e ognuna porta il suo conto: e' quello che toglie al menu il difetto di
// nascondere, perche' si legge senza aprirlo.
//
// LO STRADARIO NON E' QUI: e' l'unica cosa che si guarda a ogni giro, e sta
// sempre aperta di fianco. La regola dell'altra meta': la barra tiene le
// AZIONI, il menu le COSE DA GUARDARE, e nessuna voce sta in tutt'e due i
// posti.
function menu() {
  ctx.schermata = menu;
  const { app, ep } = ctx;
  const ind = IND();
  const mio = mioEroe();
  const nuove = nuoveNelRegistro();
  const inMano = (ind.oggetti || []).length + (ind.approfondimentiLetti || []).length
                 + (ind.reperti || []).length;
  const scritte = (ind.risposte || []).filter((r) => String(r || '').trim()).length;
  const domande = domandeBusta(ep).length;
  const visitati = (ind.visitati || []).length;

  const voce = (id, titolo, sotto, conto, segnata) => `
    <button class="menu-voce${segnata ? ' segnata' : ''}" id="${id}">
      <span class="tit">${titolo}${sotto ? `<i>${sotto}</i>` : ''}</span>
      ${conto ? `<span class="conto">${conto}</span>` : ''}
    </button>`;

  app.innerHTML = `
    ${barra('menu')}
    <div class="menu-titolo">il gruppo</div>
    ${voce('m-notte', 'la notte', 'quel che è successo, dall’inizio',
           nuove ? `<b>${nuove} nuove</b>` : `${(ind.notte || []).length} righe`, nuove > 0)}
    ${voce('m-squadra', 'la squadra', 'cariche, doni, chi è al telefono',
           `<b>${P().party.length}</b> eroi`)}
    ${voce('m-mano', 'quel che avete in mano', contaInMano(ind), `<b>${inMano}</b> pezzi`)}
    ${arbitro() ? '' : voce('m-luoghi', 'dove siete stati', 'si riaprono le carte',
                            `<b>${visitati}</b> luoghi`)}
    <div class="menu-titolo">${arbitro() ? 'di chi conduce' : 'il vostro'}</div>
    ${voce('m-taccuino', 'taccuino e domande',
           arbitro() ? 'le risposte, e gli appunti di tutti' : 'i vostri appunti, e quelli degli altri',
           `<b>${scritte}</b> di ${domande}`)}
    ${!arbitro() && mio ? voce('m-scheda', esc(mio.toLowerCase()), 'la vostra scheda') : ''}
    ${ep.lettera ? voce('m-lettera', 'la lettera d’incarico') : ''}
    ${arbitro() ? voce('m-busta', 'la busta', 'si apre una volta sola, e per tutti',
                       ind.chiusa ? 'aperta' : 'sigillata') : ''}
    ${arbitro() ? '<p class="nota mt">Lo stradario non è qui: è di fianco, sempre.</p>' : ''}
    <div class="btn-riga">
      <button class="btn pieno" id="m-chiudi">tornate ${arbitro() ? 'alla serata' : 'alla scena'}</button>
    </div>`;
  dopoBarra();
  const indietro = () => (arbitro() ? scenaArbitro() : vistaDiChiGioca());
  app.querySelector('#m-chiudi').onclick = indietro;
  app.querySelector('#m-notte').onclick = () => registroNotte(menu);
  app.querySelector('#m-squadra').onclick = () => squadra(menu);
  app.querySelector('#m-mano').onclick = () => {
    ctx.schermata = () => elencoInMano(menu, codaCarbone());
    elencoInMano(menu, codaCarbone());
    agganciaCarbone(() => { ctx.schermata(); });
  };
  app.querySelector('#m-luoghi')?.addEventListener('click', () => doveSieteStati(menu));
  app.querySelector('#m-taccuino').onclick = () => (arbitro() ? taccuino() : taccuinoDiChiGioca());
  app.querySelector('#m-scheda')?.addEventListener('click', () => schedaEroe(
    eroeCresciuto({ partita: P() }, mio, ctx.comune.eroi.find((x) => x.nome === mio)), {}));
  app.querySelector('#m-lettera')?.addEventListener('click',
    () => (arbitro() ? lettera() : letteraDiChiGioca()));
  app.querySelector('#m-busta')?.addEventListener('click', () => taccuino());
}

// IL REGISTRO, a tutta pagina. Aprendolo si segna quel che si e' letto: il
// pallino sul tasto e' per chi non l'ha guardato, non per tutti.
function registroNotte(dietro) {
  ctx.notteLette = (IND().notte || []).length;
  ctx.schermata = () => registroNotte(dietro);
  const { app } = ctx;
  app.innerHTML = `
    ${barra('la notte')}
    <div class="pannello">${notteHtml()}</div>
    <div class="btn-riga"><button class="btn pieno" id="notte-indietro">tornate indietro</button></div>`;
  dopoBarra();
  app.querySelector('#notte-indietro').onclick = dietro;
}

// LA SQUADRA: le cariche di tutti — «chi può leggere un Referto?» si guarda
// invece di chiederlo — e i doni, che da qui li spende chi li ha.
function squadra(dietro) {
  ctx.schermata = () => squadra(dietro);
  const { app } = ctx;
  const mio = mioEroe();
  app.innerHTML = `
    ${barra('la squadra')}
    <div class="pannello">
      <div class="giro-strip stampe">${P().party.map((nm) => {
        const e = ctx.comune.eroi.find((x) => x.nome === nm);
        const car = caricheEroe(nm);
        const pips = car.map((c) => `<span class="pip-carica" title="${esc(c.et)}: ${c.rest} di ${c.tot}">${
          Array.from({ length: c.tot }, (_, k) =>
            `<i class="${k < c.rest ? 'piena' : ''}"></i>`).join('')}</span>`).join('');
        const finito = car.length > 0 && car.every((c) => c.rest <= 0);
        return `<button class="chip-turno ritratto${finito ? ' fatto' : ''}" data-scheda="${esc(nm)}"
          title="scheda di ${esc(nm.toLowerCase())}"><span class="rit"><img src="${
            e && e.art ? urlArt(e.art) : ''}" alt="" loading="lazy"></span>
          <span class="et">${breve(nm)}${nm === mio ? ' · voi' : ''}</span>
          ${car.length ? `<span class="cariche">${pips}</span>` : ''}</button>`;
      }).join('')}</div>
      ${P().party.map((nm) => {
        const car = caricheEroe(nm);
        if (!car.length) return '';
        const dove = nm === mio ? ' · siete voi'
          : (ctx.collegati || []).includes(nm) ? ' · al telefono'
          : (arbitro() ? ' · lo tenete voi' : ' · lo tiene chi arbitra');
        return `<p class="nota mt"><b>${esc(breve(nm))}</b> — ${car.map((c) =>
          `${esc(c.et)}: <b>${c.rest}</b> di ${c.tot}`).join(' · ')}${dove}</p>`;
      }).join('')}
    </div>
    <div class="btn-riga"><button class="btn pieno" id="sq-indietro">tornate indietro</button></div>`;
  dopoBarra();
  app.querySelectorAll('[data-scheda]').forEach((el) => el.addEventListener('click', () =>
    schedaEroe(eroeCresciuto({ partita: P() }, el.dataset.scheda,
      ctx.comune.eroi.find((x) => x.nome === el.dataset.scheda)), {})));
  app.querySelector('#sq-indietro').onclick = dietro;
}

// I DONI, una volta per serata. Stanno nella SCENA e non nella squadra: sono
// azioni, e la squadra e' una cosa da guardare — la stessa regola che sul
// telefono separa la barra dal menu. Chi arbitra li vede tutti (tiene in mano
// gli eroi che nessuno ha preso), chi gioca vede il suo e basta.
const alTelefono = (nome) => (ctx.collegati || []).includes(nome) && nome !== mioEroe();

function doniHtml() {
  const miei = UNA_TANTUM.filter((u) => u.dove === 'home' && P().party.includes(u.eroe)
    && (arbitro() || u.eroe === mioEroe()));
  if (!miei.length) return '';
  return `<div class="mt"></div><div class="pannello">
    <h2>i doni, una volta per serata</h2>
    <div class="btn-riga">
      ${miei.map((u) => {
        const attiva = u.flag === 'fontiRiservateUsate' && IND().fontiRiservateAttive;
        // UN DONO, UN INTERRUTTORE. Se quell'eroe è al telefono di qualcuno, il
        // dono lo spende lui: il motore rifiuta comunque il secondo colpo, ma
        // due bottoni per la stessa cosa al tavolo sono una corsa, e la
        // sensazione è che il gioco ti tolga la tua cosa di mano.
        const suo = alTelefono(u.eroe);
        const giu = speso(u) || attiva || suo;
        const coda = suo ? ` — è di ${breve(u.eroe)}, dal suo telefono`
          : attiva ? ' — pronta, alla prossima visita'
          : (speso(u) ? ' — usata' : ' (1 volta)');
        return `<button class="btn${speso(u) && !attiva ? ' spesa' : ''}" id="${u.id}"${
          giu ? ' disabled' : ''}>${esc(u.label)}${coda}</button>`;
      }).join('')}
    </div>
  </div>`;
}

function agganciaDoni() {
  const { app } = ctx;
  app.querySelector('#discernimento')?.addEventListener('click', discernimento);
  app.querySelector('#fonti-riservate')?.addEventListener('click', fontiRiservate);
  app.querySelector('#ombra')?.addEventListener('click', ombraFiuta);
}

// L'esame di Carbone sta dentro l'elenco delle cose: e' il solo dono che ha
// bisogno di un pezzo da guardare, e il pezzo si sceglie dov'e' l'elenco.
const codaCarbone = () => (P().party.includes('FULGENZIO CARBONE') && !P().carboneUsato
  && (arbitro() || mioEroe() === 'FULGENZIO CARBONE')
  && ((IND().oggetti || []).length || (IND().reperti || []).length)
  ? '<div class="btn-riga"><button class="btn" id="esame-carbone">esame di Carbone (1 volta)</button></div>'
  : '');
const agganciaCarbone = (dopo) => ctx.app.querySelector('#esame-carbone')
  ?.addEventListener('click', () => esameCarbone(dopo));

// DOVE SIETE STATI, per chi gioca: i luoghi visitati arrivano interi dalla
// proiezione, quindi la loro carta si puo' riaprire — a meta' serata nessuno
// ricorda cosa c'era al Molo, e la risposta ce l'ha in tasca.
function doveSieteStati(dietro) {
  ctx.schermata = () => doveSieteStati(dietro);
  const { app, ep } = ctx;
  const visitati = (ep.luoghi || []).filter((l) => (IND().visitati || []).includes(l.n));
  app.innerHTML = `
    ${barra('dove siete stati')}
    <div class="pannello">
      ${visitati.length ? `<div class="in-mano">${visitati.map((l) => `
        <button class="voce" data-luogo="${l.n}"><span class="riga-pezzo">
          <span class="tit"><b>${esc(l.nome.toLowerCase())}</b>${(() => {
            const colti = (IND().approfondimentiLetti || []).filter((x) => x.n === l.n);
            return colti.length ? `<i class="nota">${colti.map((x) =>
              esc(x.soggetto)).join(' · ')}</i>` : '';
          })()}</span><span class="freccia">›</span></span></button>`).join('')}</div>`
        : '<p class="nota">Ancora nessuna porta. La notte è giovane.</p>'}
    </div>
    <div class="btn-riga"><button class="btn pieno" id="dv-indietro">tornate indietro</button></div>`;
  dopoBarra();
  app.querySelector('#dv-indietro').onclick = dietro;
  app.querySelectorAll('[data-luogo]').forEach((b) => b.addEventListener('click', () => {
    const l = luogoN(Number(b.dataset.luogo));
    const c = cartaLuogo(ctx.carte, P().episodio, l.n);
    pannelloMsg(l.nome.toLowerCase(),
      `${bannerLuogo(l)}
       ${l.testo ? `<p><i>${rendi(l.testo)}</i></p>` : ''}
       ${c ? `<div class="carta-grande mt"><img src="${urlCartaSafe(c.file)}" alt=""></div>` : ''}`,
      () => doveSieteStati(dietro));
  }));
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
// ═══════════════════════ LA SERATA, PER CHI ARBITRA ════════════════════════
//
// La schermata dice sempre una cosa sola: DOVE SIETE. Dentro un luogo la scena
// prende la pagina e lo stradario sta di fianco — guardare la mappa non e' una
// mossa, e prima bisognava lasciare il luogo per rivederlo, cioe' pagare
// un'altra ora per un ripensamento. Fuori non c'e' scena da guardare, e lo
// stradario diventa la pagina.
function scenaArbitro() {
  const dentro = IND().luogoAperto != null && luogoN(IND().luogoAperto);
  return dentro ? schedaLuogo(dentro) : home();
}

function home() {
  ctx.schermata = home;
  const { app, ep } = ctx;
  app.innerHTML = `
    ${barra(ep.titolo)}
    ${ultimoFattoHtml()}
    <div class="pannello">
      <h2>siete per le strade</h2>
      <p class="nota">Dichiarare è impegnarsi: se la pista è fredda non costa nulla,
      ma se lì c’è qualcosa… l’ora si spende.</p>
    </div>
    ${doniHtml()}
    <div class="mt"></div>
    ${stradarioHtml()}`;
  dopoBarra();
  agganciaStradario();
  agganciaDoni();
}

// LO STRADARIO. Un pezzo solo, in due posti: a tutta pagina quando non c'e' una
// scena, nella colonna quando c'e'. Due schermate diverse divergerebbero al
// primo ritocco.
function stradarioHtml() {
  const { ep, comune } = ctx;
  const ind = IND();
  const visitati = new Set(ind.visitati);
  const luoghiPerVoce = {};
  (ep.luoghi || []).forEach((l) => { luoghiPerVoce[norm(l.voce_mappa)] = l; });
  const voci = vociMappa(ep, comune);
  // le vie gia' battute in fondo e smorzate: il gruppo sa di esserci stato, e
  // lasciarle in mezzo allunga la scansione di quel che resta
  const ordinate = [...voci].sort((a, b) => {
    const va = visitati.has((luoghiPerVoce[norm(a.nome)] || {}).n) ? 1 : 0;
    const vb = visitati.has((luoghiPerVoce[norm(b.nome)] || {}).n) ? 1 : 0;
    return va - vb;
  });
  return `<div class="pannello">
    <h2>dove andate?</h2>
    <input class="cerca" id="cerca-via" placeholder="cerca una via…" autocomplete="off">
    <div class="stradario mt" id="lo-stradario">
      ${ordinate.map((v) => {
        const l = luoghiPerVoce[norm(v.nome)];
        // SOLO «gia' battuto»: qualunque altra etichetta di stato direbbe dove
        // andare, e l'app e' l'arbitro che custodisce proprio quello.
        const battuto = l && visitati.has(l.n);
        return `<button class="voce${battuto ? ' battuta' : ''}" data-voce="${esc(v.nome)}"
          data-cerca="${esc(norm(v.nome + ' ' + (v.indirizzo || '')))}">
          <b>${esc(v.nome)}</b> <i>${esc(v.indirizzo)}</i>${
            battuto ? '<span class="visitato">già battuto</span>' : ''}</button>`;
      }).join('')}
    </div>
  </div>`;
}

// Ventidue voci sono piu' di quante se ne scandiscano mentre il tavolo aspetta:
// si filtra sul posto, senza ridisegnare (ridisegnare svuoterebbe il campo).
function agganciaStradario() {
  const { app } = ctx;
  app.querySelectorAll('.voce[data-voce]').forEach((el) =>
    el.addEventListener('click', () => dichiara(el.dataset.voce)));
  const campo = app.querySelector('#cerca-via');
  if (!campo) return;
  campo.addEventListener('input', () => {
    const q = norm(campo.value.trim());
    app.querySelectorAll('.voce[data-cerca]').forEach((el) => {
      el.style.display = !q || el.dataset.cerca.includes(q) ? '' : 'none';
    });
  });
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
      // IL FILO E' VIVO, e da qui i comandi vanno al TAVOLO invece che al
      // motore di questa pagina. Senza questa riga `esegui()` restava sempre
      // sul ramo locale, e chi gioca leggeva «mi sto ricollegando al tavolo»
      // premendo bottoni che non facevano niente.
      ctx.tavoloVivo = true;
      // c'e' qualcuno che conduce, dall'altra parte? Serve a dirlo a chi gioca
      // invece di lasciarlo davanti a un bottone che sembra rotto
      if (messaggio && messaggio.arbitroCollegato !== undefined) {
        ctx.arbitroCollegato = messaggio.arbitroCollegato;
      }
      // CHI C'E' AL TAVOLO. Il tavolo lo dice a ogni spinta: chi arbitra lo usa
      // per non offrire un secondo interruttore su un dono che ha gia' una
      // mano, e la squadra per dire chi è al telefono.
      if (messaggio && Array.isArray(messaggio.collegati)) ctx.collegati = messaggio.collegati;
      // CHI ARBITRA ASCOLTA UNA COSA SOLA: il tiro che aspetta dall'altra parte.
      // Non ridisegna su quel che arriva — la sua schermata la guida lui, e
      // ridisegnarla sotto le dita gli farebbe sparire quel che stava facendo.
      // La spinta che riceve e' anche la propria, quindi si guarda solo
      // l'ESITO, che lo scrive il telefono e nessun altro.
      // CHI ARBITRA NON RIDISEGNA su quel che arriva: la sua schermata la guida
      // lui, e ridisegnarla sotto le dita gli farebbe sparire quel che stava
      // facendo. Gli basta tenere lo stato aggiornato — le mosse degli altri le
      // ha gia' applicate il tavolo.
      if (arbitro()) {
        incassa(stato);
        // UNA ECCEZIONE, ed e' quella che teneva fermo il tavolo: la SCHERMATA
        // DA LEGGERE INSIEME. La alza anche un telefono — quando quell'eroe usa
        // la sua abilita' — e la chiude chi conduce. Se il suo schermo non la
        // mostrasse, non ci sarebbe nessuno a chiuderla: il telefono resterebbe
        // fermo su «si va avanti quando chi arbitra chiude» per sempre, e da
        // fuori si vede come «ho fatto l'azione e poi non posso fare piu'
        // niente». Si ridisegna solo se non la sta gia' mostrando lui, o
        // rifarebbe la pagina sotto le dita a ogni spinta.
        const c = (stato.indagine || {}).carta;
        if (c && ctx.cartaInScena !== c.titolo) mostraCartaCondivisa(c);
        else if (!c && ctx.cartaInScena) { ctx.cartaInScena = null; home(); }
        return;
      }
      // LA SERATA E' PASSATA ALLA SPEDIZIONE mentre guardavamo: non si ridisegna
      // l'Indagine di una partita che non e' piu' li'. Si chiude il filo e si
      // passa la mano, o resterebbero due canali aperti sullo stesso tavolo.
      // LA BUSTA APERTA NON E' LA FINE: e' la pagina che si legge insieme, e
      // finche' c'e' quella schermata condivisa si resta qui. Uscire su
      // `chiusa` buttava i telefoni nell'allestimento della Spedizione proprio
      // nel momento più alto della serata.
      const busta = (stato.indagine || {}).chiusa && (stato.indagine || {}).carta;
      if (!busta && (stato.fase !== 'indagine' || (stato.indagine || {}).chiusa)) {
        if (ctx.canale) { ctx.canale.chiudi(); ctx.canale = null; }
        salva(stato, { timbra: false });
        return ctx.vaiA('spedizione');
      }
      // usciti di lì: si azzera l'arrivo, o tornando NELLO STESSO luogo (un'altra
      // ora spesa) la facciata non si riaprirebbe e si rientrerebbe in silenzio
      if ((stato.indagine || {}).luogoAperto == null) ctx.entrato = null;
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
    // il filo e' caduto: il motore torna a essere questa pagina, e chi gioca
    // se lo sente dire invece di premere bottoni che non fanno niente
    onStato: (collegato) => { if (!collegato) ctx.tavoloVivo = false; },
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
  // L'ARRIVO. Chi arbitra dichiara la destinazione ed entra dritto — l'ora è del
  // gruppo e la spende lui. Sui telefoni, invece, entrare non era un momento:
  // cambiava il contenuto della pagina in silenzio, e chi guardava il proprio
  // schermo si ritrovava dentro senza essersene accorto.
  //
  // Ora la facciata si apre a tutto schermo e si entra col dito. E' l'arrivo di
  // QUESTA persona: non manda niente al tavolo, non aspetta nessuno e non
  // vincola gli altri — chi legge con calma resta sulla facciata mentre gli
  // altri sono già dentro. Per questo `entrato` vive nella pagina e non nello
  // stato: metterlo nella partita farebbe di un gesto personale una mossa del
  // gruppo, e il tavolo a schermo unico dovrebbe farla per finta.
  if (aperto && ctx.entrato !== aperto.n) return arrivoAlLuogo(aperto);
  // LA SCENA, E LA BARRA. Sul telefono non c'e' colonna: dichiarare e' di chi
  // arbitra e lo spazio non c'e'. Restano tre cose — cos'e' appena successo,
  // cosa sta succedendo, cosa potete fare — e il resto sta nel menu.
  //
  // La regola dura: LA BARRA TIENE LE AZIONI, IL MENU LE COSE DA GUARDARE.
  // Nessuna voce sta in tutt'e due i posti, e non c'e' mai da chiedersi dov'e'
  // una cosa.
  app.innerHTML = `
    ${barra(aperto ? aperto.nome.toLowerCase() : 'per le strade')}
    ${ultimoFattoHtml()}
    ${aperto ? bannerLuogo(aperto) : ''}
    ${aperto ? scenaLuogoHtml(aperto) : `<div class="pannello">
      <h2>siete per le strade</h2>
      <p class="nota">Si decide insieme dove andare; a dichiararlo e a bussare e’ chi
      arbitra. Appena entrate, qui compare quel che potete fare voi.</p>
    </div>`}
    ${barraAzioniHtml(aperto)}`;
  dopoBarra();
  agganciaAzioni(aperto);
}

// LA BARRA DELLE AZIONI: quel che si puo' fare ADESSO, dove arriva il pollice.
// Dentro un luogo sono l'abilita' propria e l'aiuto profano; fuori, il proprio
// dono. Quando non c'e' niente da fare la barra non c'e' — un bottone che non
// serve e' peggio di nessun bottone.
function barraAzioniHtml(aperto) {
  const mio = mioEroe();
  const dono = mio ? UNA_TANTUM.find((u) => u.eroe === mio && u.dove === 'home') : null;
  const azioni = [];
  if (aperto) {
    // chi puo' cogliere cosa e' `idoneiPerTipo`, la stessa regola del motore
    // guardata dal proprio posto: qui si chiede a lei, non si riscrive
    const l = aperto;
    const ind = IND();
    const tipiQui = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
    const letto = (t) => ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === t);
    const aperti = tipiQui.filter((t) => !letto(t));
    const miei = mio ? aperti.filter((t) =>
      idoneiPerTipo(ctx.comune, P(), t).some((x) => x.nome === mio)) : [];
    for (const t of miei) {
      azioni.push(`<button class="btn pieno" data-appr="approfondisci" data-luogo="${l.n}"
        data-tipo="${esc(t)}">${esc(t.toLowerCase())}</button>`);
    }
    if (aperti.length && !(ind.profano || {})[l.n]) {
      azioni.push(`<button class="btn" data-appr="profano" data-luogo="${l.n}"
        data-tipo="${esc(aperti[0])}">aiuto profano</button>`);
    }
  } else if (dono && !speso(dono)) {
    azioni.push(`<button class="btn pieno" id="dono-eroe">${esc(dono.label.toLowerCase())}</button>`);
  }
  if (!azioni.length) return '';
  return `<div class="barra-azioni">${azioni.join('')}</div>`;
}

function agganciaAzioni(aperto) {
  const { app } = ctx;
  app.querySelector('#dono-eroe')?.addEventListener('click', () => {
    const mio = mioEroe();
    const dono = UNA_TANTUM.find((u) => u.eroe === mio && u.dove === 'home');
    if (!dono || speso(dono)) return;
    if (dono.id === 'ombra') return ombraFiuta();
    if (dono.id === 'discernimento') return discernimento();
    return fontiRiservate();
  });
  // LA STESSA FUNZIONE CHE USA CHI ARBITRA. Non una richiesta, non un giro per
  // il tavolo: e' la sua abilita' e la spende lui, e la regola sta nel motore —
  // quindi il codice e' uno solo, e non ci sono due strade da tenere allineate.
  app.querySelectorAll('[data-appr]').forEach((el) => el.addEventListener('click', () => {
    const l = luogoN(Number(el.dataset.luogo)) || aperto;
    if (!l) return;
    const tipiQui = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
    if (el.dataset.appr === 'profano') return aiutoProfano(l, el.dataset.tipo, mioEroe());
    return approfondisci(l, el.dataset.tipo, tipiQui, mioEroe());
  }));
}

// LA FACCIATA, prima di entrare. Arte, nome e indirizzo: quel che si vede dalla
// strada. Il testo del luogo no — quello si legge ad alta voce DOPO, ed è il
// momento di chi arbitra.
function arrivoAlLuogo(l) {
  const { app } = ctx;
  const voce = vociMappa(ctx.ep, ctx.comune).find((v) => norm(v.nome) === norm(l.voce_mappa));
  app.innerHTML = `
    ${barra('ci siete')}
    <div class="arrivo">
      ${bannerLuogo(l)}
      <div class="pannello">
        <h2>${esc(l.nome.toLowerCase())}</h2>
        ${voce && voce.indirizzo ? `<p class="nota"><i>${esc(voce.indirizzo)}</i></p>` : ''}
        <p class="mt">Il gruppo è arrivato. Entrate quando siete pronti: gli altri
        non vi aspettano, e voi non aspettate loro.</p>
      </div>
      <div class="btn-riga"><button class="btn pieno" id="entrate">entrate</button></div>
    </div>`;
  dopoBarra();
  app.querySelector('#entrate').onclick = () => { ctx.entrato = l.n; vistaDiChiGioca(); };
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
// LA SCENA, sul telefono: dove siete e cosa c'e' da cogliere. I BOTTONI NON
// SONO QUI — stanno nella barra in fondo, dove arriva il pollice — perche' la
// regola e' che le azioni stiano in un posto solo. Prima erano a meta' pagina,
// e su uno schermo di telefono «a meta' pagina» vuol dire sotto il bordo.
function scenaLuogoHtml(l) {
  const ind = IND();
  const mio = mioEroe();
  const tipiQui = [...new Set((l.approfondimenti || []).map((a) => a.tipo))];
  const letto = (tipo) => ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  const aperti = tipiQui.filter((t) => !letto(t));
  const puo = (tipo) => idoneiPerTipo(ctx.comune, P(), tipo).some((x) => x.nome === mio);
  const miei = mio ? aperti.filter(puo) : [];
  const profanoFatto = !!(ind.profano || {})[l.n];

  const coda = () => {
    if (ind.scenaChiusa) {
      return `<p class="nota">Qui avete già guardato meglio, e non è venuto fuori niente:
        per questa visita gli Approfondimenti restano nascosti.</p>`;
    }
    if (!tipiQui.length) return '<p class="nota">Qui non c’è niente da cogliere.</p>';
    if (!aperti.length) return '<p class="nota">Qui avete già colto tutto quel che c’era.</p>';
    if (miei.length) return '<p class="nota">Quel che cogliete lo legge tutto il tavolo.</p>';
    return `<p class="nota">Qui non c’è niente che parli il vostro linguaggio${
      profanoFatto ? '' : ': resta l’occhio del dilettante'}.</p>`;
  };
  // «siete il campanile di san teodoro» non e' italiano, e i nomi dei luoghi
  // cominciano tutti con un articolo: il titolo e' il nome, e «siete dentro» sta
  // sopra come etichetta.
  return `<div class="pannello">
    <p class="nota">siete dentro</p>
    <h2>${esc(l.nome.toLowerCase())}</h2>
    ${coda()}
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
      <p class="nota mt">Nessuna ora spesa.</p>`, scenaArbitro);
  }
  if (ev('mezzanotte')) {
    return pannelloMsg('è mezzanotte', '<p>Il tempo è finito: chiudete l’indagine.</p>', scenaArbitro);
  }
  const lontano = ev('troppo-lontano');
  if (lontano) {
    const l = luogoN(lontano.luogo);
    return pannelloMsg('troppo lontano', `<p><i>${esc(l.nome.toLowerCase())} è
      fuori città: la trasferta vuole ${lontano.costo} ore, e non le avete.</i></p>
      <p class="nota mt">Nessuna ora spesa: con un'ora sola non si dichiara.</p>`, scenaArbitro);
  }
  const chiuso = ev('gia-chiuso');
  if (chiuso) {
    const l = luogoN(chiuso.luogo);
    return pannelloMsg(l.nome.toLowerCase(), `<p><i>${chiuso.chiude != null
      ? `Troppo tardi: qui hanno chiuso alle ${chiuso.chiude}:00. Il portone resta muto.`
      : `Qui non aprono prima delle ${chiuso.apre}:00: la strada è ancora deserta.`}</i></p>
      <p class="nota mt">Nessuna ora spesa: lo sapevate arrivando.</p>`, scenaArbitro);
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
  ctx.schermata = () => schedaLuogo(l);
  const { app } = ctx;
  const ind = IND();
  const tipiQui = [...new Set(l.approfondimenti.map((a) => a.tipo))];
  const letti = ind.approfondimentiLetti.filter((x) => x.n === l.n);
  // I TIPI CHE QUI NON CI SONO NON SI MOSTRANO. Erano quattro bottoni sempre
  // uguali, anche per un Presagio che in questo luogo non esiste e per un
  // Referto che nessuno in squadra sa leggere: il tavolo tirava a indovinare, e
  // ogni tentativo a vuoto costava una scena. Quel che c'e' e' gia' scritto
  // negli indizi che si leggono ad alta voce — dirlo qui non regala niente.
  const chiPuo = (t) => idoneiPerTipo(ctx.comune, P(), t);
  app.innerHTML = `
    ${barra(l.nome.toLowerCase())}
    ${ultimoFattoHtml()}
    <div class="due-colonne">
      <div>
        ${bannerLuogo(l)}
        <div class="pannello">
          <h2>${esc(l.nome.toLowerCase())}</h2>
          ${l.testo ? `<p><i>${rendi(l.testo)}</i></p><hr class="divisore">` : ''}
          <p class="nota">indizi — leggeteli ad alta voce</p>
          ${l.indizi.map((i) => `<p class="mt">◆ ${rendi(i)}</p>`).join('')}
          <hr class="divisore">
          ${ind.scenaChiusa ? `<p class="nota">Qui avete già guardato meglio, e non
            è venuto fuori niente: per questa visita gli Approfondimenti restano
            nascosti. Lasciate il luogo e tornateci (1 ora) per ritentare.</p>` : `
          <p class="nota">${tipiQui.length
            ? `qui c’è ${tipiQui.map((t) => esc(t.toLowerCase())).join(' e ')}`
            : 'qui non c’è niente da cogliere'}</p>
          <div class="btn-riga">
            ${tipiQui.map((t) => {
              const idonei = chiPuo(t);
              const chi = idonei.length
                ? idonei.map((x) => breve(x.nome)).join(', ')
                : 'nessuno in squadra';
              return `<button class="btn${idonei.length ? ' pieno' : ''}" data-tipo="${esc(t)}"${
                idonei.length ? '' : ' disabled'}>${esc(t.toLowerCase())} — ${esc(chi)}</button>`;
            }).join('')}
          </div>
          ${letti.length ? `<p class="nota mt">Già colti qui: ${letti.map((x) => esc(x.soggetto)).join(' · ')}</p>` : ''}`}
          ${(l.oggetti || []).length || (l.reperti || []).length ? `
            <hr class="divisore">
            <p class="nota">da prendere, qui</p>
            <div class="btn-riga">
              ${(l.oggetti || []).map((o) => ind.oggetti.includes(o)
                ? `<button class="btn disabilitato">${esc(o)} ✓</button>`
                : `<button class="btn" data-oggetto="${esc(o)}">prendete “${esc(o)}”</button>`).join('')}
              ${(l.reperti || []).map((r) => (ind.reperti || []).includes(r)
                ? `<button class="btn disabilitato">${esc(nomeReperto(r))} ✓</button>`
                : `<button class="btn" data-reperto="${esc(r)}">consegnate “${esc(nomeReperto(r))}”</button>`).join('')}
            </div>` : ''}
        </div>
        <div class="btn-riga">
          <button class="btn pieno" id="fine-visita">lasciate il luogo</button>
        </div>
      </div>
      <div class="fianco">${stradarioHtml()}</div>
    </div>`;
  dopoBarra();
  agganciaStradario();
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

// IL PENDOLO DI SIBILLA. La regola sta nel motore; qui si racconta.
async function pendolo(l, chi) {
  const out = await esegui({ tipo: 'pendolo', luogo: l.n, eroe: chi });
  if (!out) return schedaLuogo(l);
  const ev = (t) => out.eventi.find((e) => e.tipo === t);
  const colto = ev('colto');
  if (colto) {
    const a = (l.approfondimenti || []).find((x) => x.soggetto === colto.soggetto);
    return consegnaApprofondimento(l, a, colto.tipoApp,
      `<p><i>Il pendolo di Sibilla oscilla appena — e si ferma. Qui c’è qualcosa,
       anche se non dove stavate guardando.</i></p>`);
  }
  if (ev('pendolo-fermo')) {
    return pannelloMsg('sesto senso', `<p><i>Il pendolo resta immobile, il filo dritto
      come un fuso: in città non è rimasto nulla da cogliere. Il dono, stavolta,
      non si spende.</i></p>`, () => schedaLuogo(l), { atutti: true });
  }
  const dove = ev('pendolo-indica');
  if (dove) {
    return pannelloMsg('sesto senso', `<p><i>Il pendolo ruota lento sopra la mappa, poi il filo
      si tende, deciso: <b>${esc(dove.voce)}</b>. Là qualcosa aspetta ancora
      l’occhio giusto — il pendolo non dice quale.</i></p>
      <p class="nota mt">Il jolly di Sibilla è speso: l’informazione è questa.</p>`,
      () => schedaLuogo(l), { atutti: true });
  }
  schedaLuogo(l);
}

// Discernimento di Padre Marani: indica un luogo, la risposta e' solo
// si'/no ("li' si nasconde ancora qualcosa?"). Se si', quella visita non
// costa l'ora — il tiro per cogliere l'Approfondimento resta comunque da fare
// sul posto, come ovunque.
async function discernimento() {
  const voci = vociMappa(ctx.ep, ctx.comune);
  const scelta = await scegliDaLista('Marani indica un luogo…',
    voci.map((v) => ({ id: v.nome, label: v.nome })));
  if (!scelta) return scenaArbitro();
  const out = await esegui({ tipo: 'discernimento', voce: scelta });
  if (!out) return scenaArbitro();
  const ev = out.eventi.find((e) => e.tipo === 'discernimento');
  // IL LUOGO SI DICE PER NOME. Questa schermata si apre su OGNI schermo, e chi
  // non ha premuto il bottone non sa di che strada si parla: «lì si nasconde
  // ancora qualcosa» è una risposta senza la domanda. Il nome è la domanda.
  pannelloMsg('discernimento', ev && ev.ancora
    ? `<p><i>Marani chiude gli occhi un istante, poi annuisce: <b>sì</b> — a
       <b>${esc(String(scelta).toLowerCase())}</b> si nasconde ancora qualcosa.</i></p>
       <p class="nota mt">La prossima visita a quel luogo non costa l’ora. Per cogliere
       quel che nasconde, lì, si tira come ovunque.</p>`
    : `<p><i>Marani scuote il capo, piano: <b>no</b>. Qualunque cosa ci fosse da vedere a
       <b>${esc(String(scelta).toLowerCase())}</b>, o l’avete già colta, o non c’è mai
       stata.</i></p>`, scenaArbitro, { atutti: true });
}

// Fonti riservate di Carla: la PROSSIMA visita non costa l'ora (e non
// conta come ora avanzata a fine indagine)
async function fontiRiservate() {
  if (!await esegui({ tipo: 'fonti-riservate' })) return scenaArbitro();
  pannelloMsg('fonti riservate', `<p><i>Carla conosce la porta giusta e chi la apre
    senza domande: la <b>prossima visita</b> non costerà l’ora.</i></p>
    <p class="nota mt">Non conta come ora avanzata a fine indagine: il vantaggio
    premia le ore spese davvero.</p>`, scenaArbitro, { atutti: true });
}

// Ombra fiuta (Mora): il furetto in avanscoperta su un luogo — torna col
// NUMERO di Approfondimenti che ancora nasconde, mai il tipo
async function ombraFiuta() {
  const voci = vociMappa(ctx.ep, ctx.comune);
  const scelta = await scegliDaLista('dove mandate Ombra?',
    voci.map((v) => ({ id: v.nome, label: v.nome })));
  if (!scelta) return scenaArbitro();
  const out = await esegui({ tipo: 'ombra', voce: scelta });
  if (!out) return scenaArbitro();
  const quanti = (out.eventi.find((e) => e.tipo === 'ombra') || {}).quanti || 0;
  const dove = `<b>${esc(String(scelta).toLowerCase())}</b>`;
  // come sopra: la strada la deve leggere il tavolo, non solo chi ha premuto
  pannelloMsg('ombra fiuta', `<p><i>Il furetto sguscia via sui tetti verso ${dove}. Torna
    prima che la candela cali di un dito, e Mora gli legge in faccia il conto:
    <b>${quanti === 0 ? 'niente' : quanti === 1 ? 'una cosa' : `${quanti} cose`}</b> da
    cogliere ${quanti ? `ancora, a ${dove}` : `— a ${dove} non c’è più nulla, o non c’è mai stato`}.</i></p>
    <p class="nota mt">Il numero, mai il tipo: Ombra fiuta, non legge.</p>`, scenaArbitro, { atutti: true });
}

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
  // Tre comandi invece di tre scritture: gli appunti di ciascuno restano
  // separati perche' su un telefono li scrive il suo eroe, e sovrascriverli
  // tutti a ogni salvataggio cancellerebbe quel che gli altri stanno battendo.
  const leggi = async () => {
    await esegui({ tipo: 'risposte',
      risposte: [...app.querySelectorAll('[data-risposta]')].map((el) => el.value) });
    await esegui({ tipo: 'nota', testo: app.querySelector('#note-taccuino').value });
    // chi arbitra tiene in mano gli eroi che nessuno ha reclamato: puo' scrivere
    // gli appunti di chiunque, ed e' lo stesso patto della plancia
    for (const el of app.querySelectorAll('[data-nota-eroe]')) {
      if (el.value !== noteDi(el.dataset.notaEroe)) {
        await esegui({ tipo: 'nota-eroe', eroe: el.dataset.notaEroe, testo: el.value });
      }
    }
  };
  app.querySelector('#salva-risposte').onclick = async () => { await leggi(); home(); };
  app.querySelector('#apri-busta').onclick = async () => {
    await leggi();
    if (!await conferma('Rompete il sigillo?', {
      dettaglio: 'La busta si apre una volta sola: l’indagine si chiude per sempre.',
      si: 'rompete il sigillo', no: 'non ancora', sigillo: 'L',
    })) return;
    busta();
  };
}

async function busta() {
  const { app, ep } = ctx;
  const ind = IND();
  if (!ind.chiusa && !await esegui({ tipo: 'apri-busta' })) return home();
  // Il conto lo ha gia' fatto il motore aprendo la busta: qui si legge e si
  // racconta. `correzioni` dice quali giudizi ha ribaltato il gruppo.
  const corr = ind.correzioni || {};
  const esiti = verificaRisposte(ep, ind.risposte).map((e, i) => ({
    ...e, i, corretto: i in corr, ok: (i in corr) ? corr[i] : e.ok,
  }));
  const inBusta = esiti.filter((e) => !e.dopo_spedizione);
  const t = tierIndagine(ep, ind, inBusta.map((e) => e.ok));
  const cantoIniziale = (P().spedizione || {}).canto || 0;
  // LA BUSTA SI LEGGE INSIEME. È la resa dei conti della serata, e fino a oggi
  // i telefoni ne uscivano: appena `chiusa` diventava vera il filo li portava
  // alla Spedizione, dove trovavano l'ALLESTIMENTO di chi arbitra — «si scende
  // →» — e a uno bastava un tocco per costruirsi una spedizione parallela,
  // mazzo mescolato compreso.
  //
  // Ora la pagina si manda come schermata condivisa, senza i bottoni di
  // correzione (l'ultima parola resta del gruppo, ma la mano è di chi conduce),
  // e i telefoni passano alla Spedizione quando chi arbitra CHIUDE — cioè
  // quando la notte è finita davvero.
  const pagina = (conCorrezioni) => `
    <div class="pannello">
      <h2>le risposte</h2>
      ${inBusta.map((e, i) => `
        <div class="mt">
          <p><b>${i + 1}. ${esc(e.q)}</b> — ${e.ok ? '<span class="ok-txt">esatta</span>' : '<span class="ko-txt">sbagliata</span>'}${
            e.corretto ? ' <span class="nota">(deciso da voi)</span>' : ''}</p>
          <p class="nota">La verità: ${esc(e.risposta)}</p>
          <p>${esc(e.ok ? e.esatta : e.sbagliata)}</p>
          ${conCorrezioni ? `<button class="btn correggi" data-correggi="${e.i}">${e.ok
            ? 'no, l’avevamo sbagliata' : 'l’avevamo indovinata'}</button>` : ''}
        </div>`).join('')}
      ${conCorrezioni ? `<p class="nota mt">Confrontate quello che avete scritto con la verità: se il
        giudizio dell’app non vi convince, correggetelo — decide il gruppo.</p>` : ''}
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
      ${conCorrezioni ? `<div class="btn-riga">
        <button class="btn pieno" id="alla-spedizione">alla spedizione</button>
      </div>` : ''}
    </div>`;

  // la stessa pagina su ogni schermo, senza le mani di chi conduce
  esegui({ tipo: 'carta', titolo: 'la busta è aperta', corpo: pagina(false) });
  app.innerHTML = `${barra('la busta è aperta')}${pagina(true)}`;
  dopoBarra();
  app.querySelectorAll('[data-correggi]').forEach((b) => {
    b.onclick = async () => {
      if (await esegui({ tipo: 'correggi', i: Number(b.dataset.correggi) })) busta();
    };
  });
  app.querySelector('#alla-spedizione').onclick = async () => {
    // chiudendo la carta i telefoni escono dalla lettura, e il cambio di fase
    // li porta di là: la notte finisce quando la chiude chi conduce
    if (IND().carta) await esegui({ tipo: 'carta-vista' });
    P().fase = 'spedizione';
    salvaP();
    ctx.vaiA('spedizione');
  };
}

// --------------------------------------------------------------- utility UI
// ------------------------------------------- QUEL CHE AVETE IN MANO, a righe
//
// Con le anteprime in pagina l'inventario diventava la parte piu' lunga di
// tutto: due oggetti e un reperto riempivano uno schermo di telefono, e
// l'orologio — la cosa che tiene in ansia — finiva fuori dallo scorrimento.
// Ora e' una riga sola che dice QUANTO contiene; si tocca e si apre l'elenco;
// si tocca un nome e si apre la carta grande, col pizzico per ingrandire.
//
// La riga riusa `.voce`, che e' gia' la riga-registro dello stradario: stesso
// fondo, stesso bordo, stessa altezza del tocco. Un componente che il tavolo ha
// gia' imparato vale piu' di uno nuovo che gli somiglia.

// una riga-bottone: titolo, riga piccola sotto, e il chevron
const rigaVoce = (attr, titolo, sotto = '') => `<button class="voce" ${attr}>
  <span class="riga-pezzo"><span class="tit"><b>${titolo}</b>${
    sotto ? `<i class="nota">${sotto}</i>` : ''}</span>
  <span class="freccia">›</span></span></button>`;

// Il conto per la riga chiusa: «3 oggetti · 1 approfondimento · 3 reperti».
// Le voci a zero non si scrivono — una riga che elenca zeri e' rumore.
function contaInMano(ind) {
  const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;
  const pezzi = [];
  if ((ind.oggetti || []).length) pezzi.push(plurale(ind.oggetti.length, 'oggetto', 'oggetti'));
  if ((ind.approfondimentiLetti || []).length) {
    pezzi.push(plurale(ind.approfondimentiLetti.length, 'approfondimento', 'approfondimenti'));
  }
  if ((ind.reperti || []).length) pezzi.push(plurale(ind.reperti.length, 'reperto', 'reperti'));
  return pezzi.join(' · ');
}

// L'ELENCO. `dopo` e' la strada di ritorno: la stessa schermata la aprono chi
// arbitra (dalla sua home) e chi gioca (dal suo telefono), e tornano in due
// posti diversi.
function elencoInMano(dopo, coda = '') {
  const { app } = ctx;
  const ind = IND();
  const epId = P().episodio;
  const sezione = (titolo, righe) => (righe.length
    ? `<p class="nota mt">${titolo}</p><div class="in-mano mt">${righe.join('')}</div>` : '');

  // i nomi degli Oggetti nei dati sono in maiuscolo di stampa; qui vanno in
  // minuscolo come ogni altro titolo dell'app, o la riga urla
  const oggetti = (ind.oggetti || []).map((nm, i) =>
    rigaVoce(`data-pezzo="oggetto" data-i="${i}"`, esc(String(nm).toLowerCase())));
  const appr = (ind.approfondimentiLetti || []).map((x, i) =>
    rigaVoce(`data-pezzo="appr" data-i="${i}"`, esc(String(x.soggetto)), esc(String(x.tipo))));
  const reperti = (ind.reperti || []).map((r, i) => {
    // «Reperto A - Diario di Ruggero»: la lettera va nella riga piccola, che il
    // nome e' quel che si cerca con l'occhio
    const m = String(r).match(/^(Reperto [A-Z])\s*[-—]\s*(.+)$/);
    return rigaVoce(`data-pezzo="reperto" data-i="${i}"`,
                    esc(m ? m[2] : String(r)), m ? esc(m[1]) : '');
  });

  app.innerHTML = `
    ${barra('quel che avete in mano')}
    <div class="pannello">
      ${oggetti.length || appr.length || reperti.length
        ? `${sezione('Oggetti', oggetti)}${sezione('Approfondimenti', appr)}${sezione('Reperti', reperti)}`
        : '<p class="nota">Ancora niente. La notte è giovane.</p>'}
      ${coda}
    </div>
    <div class="btn-riga"><button class="btn pieno" id="mano-indietro">tornate indietro</button></div>`;
  dopoBarra();
  app.querySelector('#mano-indietro').onclick = dopo;
  app.querySelectorAll('[data-pezzo]').forEach((el) => el.addEventListener('click', () =>
    pezzoInMano(el.dataset.pezzo, Number(el.dataset.i), () => elencoInMano(dopo, coda), epId)));
  return app;
}

// IL PEZZO, grande. La carta si apre come si aprirebbe sul tavolo — e il
// pizzico per ingrandire c'e' gia' (`zoom.js` guarda `.carta-grande img`).
function pezzoInMano(genere, i, dietro, epId) {
  const { app } = ctx;
  const ind = IND();
  const grande = (file) => `<div class="carta-grande mt"><img src="${urlCartaSafe(file)}" alt=""></div>`;
  let titolo = '';
  let corpo = '<p class="nota">Di questo pezzo non c’è una carta stampata.</p>';

  if (genere === 'oggetto') {
    const nm = (ind.oggetti || [])[i];
    titolo = String(nm || '').toLowerCase();
    const c = cartaOggetto(ctx.carte, epId, nm);
    corpo = `<p class="nota">Oggetto · in mano al gruppo</p>${c ? grande(c.file) : ''}`;
  } else if (genere === 'appr') {
    const x = (ind.approfondimentiLetti || [])[i] || {};
    titolo = String(x.soggetto || '').toLowerCase();
    const c = cartaApprofondimento(ctx.carte, epId, x.soggetto);
    corpo = `<p class="nota">${esc(String(x.tipo || ''))} · già letto</p>${c ? grande(c.file) : ''}`;
  } else {
    const r = (ind.reperti || [])[i];
    const m = String(r).match(/^(Reperto [A-Z])\s*[-—]\s*(.+)$/);
    titolo = String(m ? m[2] : r || '').toLowerCase();
    corpo = `<p class="nota">${esc(m ? m[1] : 'Reperto')} · si legge, si passa di mano</p>
             <img class="reperto-img mt" src="${urlReperto(r)}" alt="">`;
  }

  app.innerHTML = `
    ${barra(titolo)}
    <div class="pannello">${corpo}</div>
    <div class="btn-riga"><button class="btn pieno" id="pezzo-indietro">tornate all’elenco</button></div>`;
  dopoBarra();
  app.querySelector('#pezzo-indietro').onclick = dietro;
}

// ═══════════════════════════ IL REGISTRO DELLA NOTTE, raccontato
//
// Il motore tiene i FATTI con l'ora (`indagine.notte`); la frase la compone
// qui, che e' il patto di sempre. Due voci per la stessa riga — chi conduce
// legge «Elena ha colto la cera nera», chi gioca la stessa cosa: il registro e'
// del gruppo, e quel che il telefono non deve sapere non e' mai finito
// nell'evento.
//
// Una riga che non si sa raccontare NON si stampa: meglio un buco che «evento
// colto» in mezzo alla prosa.

const nomeLuogo = (n) => { const l = luogoN(n); return l ? l.nome.toLowerCase() : 'quel luogo'; };

function rigaNotte(e) {
  const chi = e.chi ? esc(String(e.chi).split(' ')[0]) : '';
  switch (e.tipo) {
    case 'pista-fredda':
      return `<b>${esc(e.voce || '')}</b> — pista fredda. <i>Nessun’ora spesa.</i>`;
    case 'entrati':
      return `Siete entrati: <b>${esc(nomeLuogo(e.luogo))}</b>.${
        e.gratis ? ' <i>Senza spendere l’ora.</i>' : ''}`;
    case 'usciti':
      return `Avete lasciato <b>${esc(nomeLuogo(e.luogo))}</b>.`;
    case 'porta-chiusa':
      return `<b>${esc(nomeLuogo(e.luogo))}</b> — la porta è chiusa.`;
    case 'bussato':
      return `Avete bussato a <b>${esc(nomeLuogo(e.luogo))}</b>: «${esc(e.detto || '')}» — ${
        e.entra ? 'la porta si apre.' : '<i>e non è la parola giusta.</i>'}`;
    case 'grimaldello':
      return `Il grimaldello di Nino apre <b>${esc(nomeLuogo(e.luogo))}</b>. <i>Per stavolta.</i>`;
    case 'gia-chiuso':
      return `<b>${esc(nomeLuogo(e.luogo))}</b> — ${e.chiude != null
        ? `hanno chiuso alle ${e.chiude}:00` : `non aprono prima delle ${e.apre}:00`}.
        <i>Nessun’ora spesa.</i>`;
    case 'troppo-lontano':
      return `<b>${esc(nomeLuogo(e.luogo))}</b> è troppo lontano: ${e.costo} ore, e non le avete.`;
    case 'mezzanotte':
      return 'È mezzanotte: il tempo è finito.';
    case 'colto':
      return `<b>${chi}</b> ha colto ${esc(String(e.tipoApp || '').toLowerCase())} — «${
        esc(e.soggetto || '')}»${e.pendolo ? ' <i>col pendolo di Sibilla.</i>' : '.'}`;
    case 'niente-per-te':
      return `<b>${chi}</b> ha guardato meglio: ${e.gia
        ? '<i>qui era già stato colto tutto.</i>' : '<i>niente che parli il suo linguaggio.</i>'}`;
    case 'scena-chiusa':
      return `<b>${chi}</b> cerca e non trova la presa. <i>Qui non si tenta più: si esce e si torna.</i>`;
    case 'occhio-esercitato':
      return `<b>${chi}</b> ha fallito, ma l’<b>Occhio esercitato</b> tiene aperta la scena.`;
    case 'profano-fallito':
      return `<b>${chi}</b> ha frugato senza metodo. <i>L’occasione del luogo è spesa.</i>`;
    case 'profano-gia-speso':
      return 'L’occhio del dilettante, qui, ha già avuto la sua occasione.';
    case 'preso':
      return `Avete preso <b>${esc(String(e.cosa || '').toLowerCase())}</b>${
        e.reperto ? ' <i>(reperto)</i>' : ''}.`;
    case 'discernimento':
      return `<b>Marani</b> su ${esc(nomeLuogo(e.luogo))}: <b>${e.ancora ? 'sì' : 'no'}</b>${
        e.ancora ? ' — lì si nasconde ancora qualcosa.' : '.'}`;
    case 'fonti-riservate':
      return '<b>Carla</b> arma le fonti riservate: la prossima visita non costa l’ora.';
    case 'ombra':
      return `<b>Ombra</b> torna da ${esc(nomeLuogo(e.luogo))}: ${e.quanti === 0 ? 'niente'
        : e.quanti === 1 ? 'una cosa' : `${e.quanti} cose`} da cogliere.`;
    case 'esame':
      return `<b>Carbone</b> ha esaminato ${esc(String(e.pezzo || '').toLowerCase())}.`;
    case 'esame-muto':
      return `<b>Carbone</b> rigira ${esc(String(e.pezzo || '').toLowerCase())}: <i>nessun segreto.</i>
        L’occasione non si spende.`;
    case 'pendolo-indica':
      return `Il <b>pendolo di Sibilla</b> indica <b>${esc(e.voce || '')}</b>.`;
    case 'pendolo-fermo':
      return 'Il <b>pendolo di Sibilla</b> resta immobile: in città non è rimasto nulla da cogliere.';
    case 'busta-aperta':
      return `<b>La busta è aperta.</b> Vantaggio: ${esc(e.tier || '')}${
        e.canto ? ` — si parte con ${e.canto} Canto in più.` : '.'}`;
    case 'corretta':
      return `Il gruppo ha ribaltato il giudizio sulla Domanda ${Number(e.i) + 1}: ${
        e.ok ? 'esatta' : 'sbagliata'}.`;
    default:
      return '';
  }
}

// il registro, dal piu' recente: a fine serata l'ultima riga e' quella che
// serve, e scorrere venti righe per arrivarci e' il modo di non leggerlo mai
function notteHtml(quante = 0) {
  const righe = [...(IND().notte || [])].reverse()
    .map((e) => ({ e, testo: rigaNotte(e) })).filter((x) => x.testo);
  const viste = quante ? righe.slice(0, quante) : righe;
  if (!viste.length) return '<p class="nota">La notte è appena cominciata.</p>';
  return `<div class="notte">${viste.map((x, i) => `
    <div class="voce-notte${i === 0 ? ' ultima' : ''}">
      <span class="quando">${x.e.ora != null ? `${x.e.ora}:00` : ''}</span>
      <div class="cosa">${x.testo}</div>
    </div>`).join('')}</div>`;
}

// L'ULTIMO FATTO, in una riga. Col registro chiuso dentro una voce di menu,
// «cos'e' appena successo» si perderebbe — ed e' il difetto che si e' pagato
// caro: premo, e non capisco se e' successo.
function ultimoFattoHtml() {
  const righe = [...(IND().notte || [])].reverse()
    .map((e) => ({ e, testo: rigaNotte(e) })).filter((x) => x.testo);
  if (!righe.length) return '';
  const { e, testo } = righe[0];
  return `<div class="ultimo-fatto">
    <span class="quando">${e.ora != null ? `${e.ora}:00` : ''}</span>
    <span class="cosa">${testo}</span>
  </div>`;
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
  const condivisa = atutti && ctx.posto && ctx.posto.tavolo;
  if (condivisa) esegui({ tipo: 'carta', titolo, corpo: corpoHtml });
  // «continuate» e' di chi conduce: la schermata condivisa la chiude lui, e
  // metterlo anche sul telefono darebbe a chi gioca un bottone che il tavolo
  // rifiuta. Chi gioca legge la riga d'attesa, che dice a chi tocca.
  const mio = !condivisa || arbitro();
  ctx.cartaInScena = condivisa ? titolo : null;
  app.innerHTML = `
    ${barra(titolo)}
    <div class="pannello">${corpoHtml}</div>
    ${mio
      ? '<div class="btn-riga"><button class="btn pieno" id="ok-msg">continuate</button></div>'
      : '<p class="nota centrato mt">— si va avanti quando chi arbitra chiude —</p>'}`;
  dopoBarra();
  app.querySelector('#ok-msg')?.addEventListener('click', () => {
    ctx.cartaInScena = null;
    if (IND().carta) esegui({ tipo: 'carta-vista' });
    if (dopo) dopo();
  });
}

// LA SCHERMATA CHE IL TAVOLO STA LEGGENDO, sullo schermo di chi conduce. La
// scrive chi ha giocato — anche da un telefono — e qui si legge insieme; il
// «continuate» riporta chi arbitra alla sua scrivania, che e' il posto giusto:
// quel che si stava facendo l'ha fatto qualcun altro.
function mostraCartaCondivisa(carta) {
  ctx.cartaInScena = carta.titolo;
  ctx.app.innerHTML = `
    ${barra(carta.titolo)}
    <div class="pannello">${carta.corpo || ''}</div>
    <div class="btn-riga"><button class="btn pieno" id="ok-msg">continuate</button></div>`;
  dopoBarra();
  ctx.app.querySelector('#ok-msg').onclick = () => {
    ctx.cartaInScena = null;
    esegui({ tipo: 'carta-vista' });
    // SI TORNA DOVE IL GRUPPO E', non alla home. Chiudendo si finiva sullo
    // stradario anche col gruppo dentro un luogo: chi conduce doveva rientrare
    // a mano, e la porta per farlo non c'e' — l'unica strada era dichiarare di
    // nuovo quel luogo, cioe' pagare un'altra ora per un ripensamento.
    const dentro = IND().luogoAperto != null && luogoN(IND().luogoAperto);
    return dentro ? schedaLuogo(dentro) : home();
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
