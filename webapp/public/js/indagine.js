// Vista Indagine (modalita' Tavolo): l'app fa da arbitro — stradario con
// oracolo, indizi letti al momento giusto, Approfondimenti gated con
// cariche, orologio, chiusura con la "busta". Stato in partita.indagine
// (store.js), regole in engine.js, dadi in dadi.js.
import { salva, dati } from './store.js';
import { tiraProva } from './dadi.js';
import { rendi, norm, bussa, dichiaraVoce, vociMappa, luogoVisitabile,
         idoneiPerTipo, usaCarica, tierIndagine, verificaRisposte,
         urlArt, cartaLuogo, cartaApprofondimento, cartaOggetto,
         urlCarta as urlCartaSafe } from './engine.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ctx = null;   // { app, partita, ep, comune, carte, vaiA }

export async function vistaIndagine(app, partita, vaiA) {
  const [ep, comune, carte] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  ctx = { app, partita, ep, comune, carte, vaiA };
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
function lettera() {
  const { app, ep } = ctx;
  const rilettura = IND().lettaLettera;
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello lettera-panel">
      <p class="nota centrato">${rilettura ? '— la lettera d’incarico, dal Taccuino —'
                                           : '— da leggere ad alta voce —'}</p>
      <div class="lettera-testo">${rendi(ep.lettera)}</div>
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="in-strada">${rilettura ? 'torna in strada →'
                                                : `in strada, alle ${IND().ora}:00 →`}</button>
    </div>`;
  dopoBarra();
  app.querySelector('#in-strada').onclick = () => {
    IND().lettaLettera = true;
    salvaP();
    home();
  };
}

const P = () => ctx.partita;
const IND = () => ctx.partita.indagine;
const salvaP = () => salva(ctx.partita);

function barra(titolo) {
  const ore = 24 - IND().ora;
  return `
  <div class="barra">
    <button class="btn" id="nav-esci">← menu</button>
    <div class="titolo">${esc(titolo)}</div>
    <span class="sc" style="color:var(--oro-chiaro)">h ${IND().ora}:00 · ${ore} ${ore === 1 ? 'ora' : 'ore'}</span>
  </div>`;
}

function dopoBarra() {
  ctx.app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
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
      <h2>lo stradario di roccamora</h2>
      <p class="nota">Dichiarate una destinazione: se la pista è fredda non costa nulla,
      ma se lì c’è qualcosa… l’ora si spende. Dichiarare è impegnarsi.</p>
      <div class="stradario mt">
        ${voci.map((v) => {
          const l = luoghiPerVoce[norm(v.nome)];
          const stato = l && visitati.has(l.n) ? '<span class="visitato">✓</span>' : '';
          return `<button class="voce" data-voce="${esc(v.nome)}">
            <b>${esc(v.nome)}</b> <i>${esc(v.indirizzo)}</i>${stato}</button>`;
        }).join('')}
      </div>
    </div>
    <div class="btn-riga">
      ${ep.lettera ? '<button class="btn" id="rileggi">la lettera</button>' : ''}
      ${P().party.includes('PADRE CELSO MARANI') && !ind.discernimentoUsato
        ? '<button class="btn" id="discernimento">Discernimento di Marani (1 volta)</button>' : ''}
      ${P().party.includes('CARLA DOSTI') && !ind.fontiRiservateUsate && !ind.fontiRiservateAttive
        ? '<button class="btn" id="fonti-riservate">Fonti riservate di Carla (1 volta)</button>' : ''}
      ${P().party.includes('MORA “SPILLA” FANTI') && !ind.ombraUsata
        ? '<button class="btn" id="ombra">Ombra in avanscoperta (1 volta)</button>' : ''}
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

// -------------------------------------------------------------- dichiara
function dichiara(nomeVoce) {
  const { ep, comune } = ctx;
  const esito = dichiaraVoce(ep, comune, nomeVoce);
  if (esito.tipo === 'fredda') {
    return pannelloMsg('pista fredda', `<p><i>${esc(esito.frase)}</i></p>
      <p class="nota mt">Nessuna ora spesa.</p>`, home);
  }
  const l = esito.luogo;
  const ind = IND();
  if (IND().ora >= 24) return pannelloMsg('è mezzanotte', '<p>Il tempo è finito: chiudete l’indagine.</p>', home);
  if (!luogoVisitabile(l, ind.ora)) {
    return pannelloMsg(l.nome.toLowerCase(), `<p><i>Troppo tardi: qui hanno chiuso alle ${l.chiude}:00. Il portone resta muto.</i></p>
      <p class="nota mt">Nessuna ora spesa: lo sapevate arrivando.</p>`, home);
  }
  // scoperti = carta girata (anche dopo una bussata sbagliata): NON basta a
  // entrare. Si rientra senza ripetere la chiave solo se e' gia' stata detta.
  const sbloccato = (ind.sbloccati || []).includes(l.n);
  if (!l.aperto && !sbloccato) return bussare(l);
  visita(l);
}

// ---------------------------------------------------------------- bussare
function bussare(l) {
  const { app } = ctx;
  app.innerHTML = `
    ${barra('la porta è chiusa')}
    ${bannerLuogo(l)}
    <div class="pannello">
      <h2>${esc(l.nome.toLowerCase())}</h2>
      <p class="mt"><i>${rendi(l.requisito)}</i></p>
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
  app.querySelector('#grimaldello')?.addEventListener('click', () => {
    const ind = IND();
    ind.grimaldelloUsato = true;
    ind.ora += 1;                       // la visita costa l'ora, come sempre
    if (!ind.scoperti.includes(l.n)) ind.scoperti.push(l.n);
    salvaP();
    // bypassa SOLO l'ingresso di questa visita: la chiave resta da scoprire
    pannelloMsg('la serratura cede', `<p><i>Nino ci mette meno di un respiro: la porta
      si apre senza che nessuno abbia detto niente. La parola giusta, però, ancora
      non la sapete.</i></p>`, () => visita(l, true));
  });
  app.querySelector('#prova').onclick = () => {
    const d = app.querySelector('#dichiarazione').value;
    if (!norm(d)) return;
    const ind = IND();
    ind.ora += 1;                       // l'ora si spende comunque
    const r = bussa(l, d);
    if (!ind.scoperti.includes(l.n)) ind.scoperti.push(l.n);   // carta girata
    if (r.entra) {
      ind.sbloccati = ind.sbloccati || [];
      if (!ind.sbloccati.includes(l.n)) ind.sbloccati.push(l.n);
      salvaP();
      pannelloMsg('la porta si apre', `<p><i>«${esc(d)}»… era la cosa giusta da dire — o da mostrare.</i></p>`,
        () => visita(l, true));
    } else {
      salvaP();
      pannelloMsg('niente da fare', `<p><i>Un silenzio lungo. Poi passi che si allontanano
        dall’altra parte. Qualunque cosa serva qui, non è «${esc(d)}».</i></p>
        <p class="nota mt">L’ora è spesa. La carta del luogo resta scoperta: ora ne
        conoscete il volto.</p>`, home);
    }
  };
}

// ----------------------------------------------------------------- visita
async function visita(l, oraGiaSpesa = false) {
  const ind = IND();
  const prima = !ind.visitati.includes(l.n);
  // visita senza ora: Discernimento (su QUEL luogo) o Fonti riservate di
  // Carla (sulla prossima visita, qualunque). Non conta come ora avanzata.
  const gratis = ind.visitaGratis === l.n || ind.fontiRiservateAttive;
  if (ind.visitaGratis === l.n) delete ind.visitaGratis;
  if (ind.fontiRiservateAttive) delete ind.fontiRiservateAttive;
  if (!oraGiaSpesa && !gratis) ind.ora += 1;
  if (prima) ind.visitati.push(l.n);
  ind.luogoAperto = l.n;
  salvaP();

  // leggere la scena: solo alla prima visita, un eroe a scelta
  let scena = ind['scena_' + l.n];
  if (prima && scena == null) {
    const eroe = await scegliEroe('chi legge la scena?', 'acume');
    if (eroe) {
      const r = await provaConFiato({
        titolo: `leggere la scena — ${eroe.nome.split(' ')[0]}`,
        diffLabel: 'Media', soglia: ctx.comune.regole.diff.Media,
        bonus: [{ label: 'ACUME', val: eroe.acume }],
      }, eroe.nome);
      scena = r ? r.ok : false;
    } else scena = false;
    ind['scena_' + l.n] = scena;
    salvaP();
  } else if (!prima && scena === false) {
    // regola: tornare al luogo (1 ora) coglie l'Approfondimento SENZA
    // ripetere la prova - la porta si riapre da sola alla rivisita
    scena = true;
    ind['scena_' + l.n] = true;
    salvaP();
  }
  schedaLuogo(l);
}

// il tiro con la rete del Regolamento: Secondo Fiato, uno per eroe a
// episodio, condiviso tra Indagine e Spedizione (partita.fiatoUsato)
async function provaConFiato(prova, nomeEroe) {
  P().fiatoUsato = P().fiatoUsato || {};
  let r = await tiraProva({ ...prova, modo: P().modo });
  if (r && !r.ok && !P().fiatoUsato[nomeEroe]) {
    const scelta = await scegliDaLista('prova fallita — ritentate?', [
      { id: 'fiato', label: `Secondo Fiato di ${nomeEroe.split(' ')[0]} (una volta a episodio)` },
      { id: 'accetta', label: 'accettate il fallimento' },
    ]);
    if (scelta === 'fiato') {
      P().fiatoUsato[nomeEroe] = true;
      salvaP();
      r = await tiraProva({ ...prova, modo: P().modo });
    }
  }
  return r;
}

function schedaLuogo(l) {
  const { app, ep } = ctx;
  const ind = IND();
  const scena = ind['scena_' + l.n];
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
      ${scena === false ? `<p class="nota">“Leggere la scena” è fallita qui: gli
        Approfondimenti restano nascosti per questa visita — tornate più tardi
        (1 ora), senza ripetere la prova.</p>` : `
      <p class="nota">La scena è letta: nessun altro tiro. Qui si <b>spende una carica</b> —
      ogni tipo lo sblocca l’eroe con l’abilità giusta (Elena le Osservazioni, Attilio o
      Brera i Referti…). Scegliete il tipo, poi chi spende la sua.</p>
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
  app.querySelector('#fine-visita').onclick = () => {
    delete ind.luogoAperto;
    salvaP();
    home();
  };
  app.querySelectorAll('[data-oggetto]').forEach((b) => b.onclick = () => {
    const nome = b.dataset.oggetto;
    if (!ind.oggetti.includes(nome)) ind.oggetti.push(nome);
    salvaP();
    const cardO = cartaOggetto(ctx.carte, P().episodio, nome);
    pannelloMsg(nome.toLowerCase(),
      `${cardO ? `<div class="carta-grande"><img src="${urlCartaSafe(cardO.file)}" alt=""></div>` : ''}
       <p class="nota mt">Prendete la carta “${esc(nome)}” dal mazzo Oggetti: da ora è vostra.</p>`,
      () => schedaLuogo(l));
  });
  app.querySelectorAll('[data-reperto]').forEach((b) => b.onclick = () => {
    const nome = b.dataset.reperto;
    ind.reperti = ind.reperti || [];
    if (!ind.reperti.includes(nome)) ind.reperti.push(nome);
    salvaP();
    pannelloMsg(nomeReperto(nome).toLowerCase(),
      `<img class="reperto-img" src="${urlReperto(nome)}" alt="">
       <p class="nota mt">Consegnate ai giocatori il reperto stampato “${esc(nomeReperto(nome))}”
       — o leggetelo da qui, facendolo girare.</p>`,
      () => schedaLuogo(l));
  });
  if (scena !== false) {
    app.querySelectorAll('[data-tipo]').forEach((b) =>
      b.onclick = () => approfondisci(l, b.dataset.tipo, tipiQui));
  }
}

// 'Reperto A - Diario di Ruggero' -> 'Diario di Ruggero' (per i bottoni)
const nomeReperto = (file) => file.replace(/^Reperto [A-Z] - /, '');
const urlReperto = (file) =>
  encodeURI(`/assets/${ctx.ep.cartella}/reperti/${file}.png`);

async function approfondisci(l, tipo, tipiQui) {
  const ind = IND();
  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  const c = idoneiPerTipo(ctx.comune, P(), tipo);
  if (!c.length) return aiutoProfano(l, tipo);
  // scelta di chi spende la carica (jolly incluso)
  const chi = await scegliDaLista('chi spende la carica?', c.map((x) => ({
    id: x.nome, label: `${x.nome}${x.proprie > 0 ? '' : ' (jolly di Sibilla)'}`,
  })));
  if (!chi) return schedaLuogo(l);
  const scelto = c.find((x) => x.nome === chi);
  const conJolly = scelto.proprie <= 0;

  const a = l.approfondimenti.find((x) => x.tipo === tipo);
  if (!a || gia) {
    // Sesto Senso di Sibilla (jolly): «un Approfondimento QUALSIASI del
    // luogo; se non ne ha, il pendolo indica un luogo che ne nasconde uno»
    if (conJolly) return pendolo(l, chi);
    // per gli altri la carica NON si consuma: l'app e' gentile come un
    // arbitro vero - "non c'e' nulla per te", il costo vero e' l'ora.
    return pannelloMsg(tipo.toLowerCase(), `<p><i>${esc(chi.split(' ')[0])} osserva, ascolta,
      fruga. ${gia ? 'Quello che c’era da cogliere qui, l’avete già colto.' :
      'Ma qui non c’è nulla che parli il suo linguaggio.'}</i></p>`, () => schedaLuogo(l));
  }
  usaCarica(P(), chi, tipo, conJolly);
  ind.approfondimentiLetti.push({ n: l.n, tipo, soggetto: a.soggetto });
  salvaP();
  consegnaApprofondimento(l, a, tipo);
}

function consegnaApprofondimento(l, a, tipo, prefisso = '') {
  const cardA = cartaApprofondimento(ctx.carte, P().episodio, a.soggetto);
  pannelloMsg(`${tipo.toLowerCase()} — ${a.soggetto.toLowerCase()}`,
    `${prefisso}
     ${cardA ? `<div class="carta-grande"><img src="${urlCartaSafe(cardA.file)}" alt=""></div>` : ''}
     <p class="mt"><i>${rendi(a.testo)}</i></p>
     <p class="nota mt">Prendete la carta “${esc(a.soggetto)}” dal mazzo Approfondimenti.</p>`,
    () => schedaLuogo(l));
}

// Il pendolo di Sibilla, la parte che il tavolo dimentica: se il luogo non
// ha (piu') nulla da cogliere, il jolly non va sprecato su un buco - legge
// un Approfondimento QUALSIASI ancora chiuso qui, oppure indica un luogo
// della citta' che ne nasconde ancora uno (senza dire di che tipo).
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

// Aiuto profano: quando NESSUN eroe puo' piu' sbloccare quel tipo (abilita'
// assente o cariche/jolly esauriti), un eroe qualsiasi tenta da dilettante -
// ACUME (Difficile), una sola occasione per luogo. Riuscita: l'Approfondimento
// emerge come sbloccato. Fallita: in questo luogo resta sigillato.
// (Precedente D&D: prova senza competenza - possibile, ma in salita.)
async function aiutoProfano(l, tipo) {
  const ind = IND();
  ind.profano = ind.profano || {};
  if (ind.profano[l.n]) {
    return pannelloMsg('aiuto profano', `<p class="nota">Nessun eroe può più sbloccare
      una ${esc(tipo)} — e l’occhio del dilettante, qui, ha già avuto la sua
      occasione stanotte.</p>`, () => schedaLuogo(l));
  }
  const eroe = await scegliEroe(`aiuto profano — chi tenta? (ACUME, Difficile)`, 'acume');
  if (!eroe) return schedaLuogo(l);
  const r = await provaConFiato({
    titolo: `aiuto profano — ${eroe.nome.split(' ')[0]}`,
    diffLabel: 'Difficile', soglia: ctx.comune.regole.diff.Difficile,
    bonus: [{ label: 'ACUME', val: eroe.acume }],
  }, eroe.nome);
  if (!r) return schedaLuogo(l);          // tiro annullato: occasione non spesa
  ind.profano[l.n] = true;
  const a = l.approfondimenti.find((x) => x.tipo === tipo);
  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  if (!r.ok) {
    salvaP();
    return pannelloMsg('aiuto profano', `<p><i>${esc(eroe.nome.split(' ')[0])} fruga senza
      metodo, e il luogo se ne accorge. Qualunque cosa ci fosse da cogliere qui,
      resta sigillata — servirebbe l’occhio giusto.</i></p>`, () => schedaLuogo(l));
  }
  if (!a || gia) {
    salvaP();
    return pannelloMsg('aiuto profano', `<p><i>${esc(eroe.nome.split(' ')[0])} osserva, ascolta,
      fruga — e stavolta con fortuna. ${gia ? 'Ma quello che c’era da cogliere qui, l’avete già colto.'
      : 'Ma qui non c’è nulla che parli quel linguaggio.'}</i></p>`, () => schedaLuogo(l));
  }
  ind.approfondimentiLetti.push({ n: l.n, tipo, soggetto: a.soggetto });
  salvaP();
  const cardA = cartaApprofondimento(ctx.carte, P().episodio, a.soggetto);
  pannelloMsg(`${tipo.toLowerCase()} — ${a.soggetto.toLowerCase()}`,
    `${cardA ? `<div class="carta-grande"><img src="${urlCartaSafe(cardA.file)}" alt=""></div>` : ''}
     <p class="mt"><i>${rendi(a.testo)}</i></p>
     <p class="nota mt">Colto da profano, ma colto: prendete la carta “${esc(a.soggetto)}”
     dal mazzo Approfondimenti.</p>`,
    () => schedaLuogo(l));
}

// Discernimento di Padre Marani: indica un luogo, la risposta e' solo
// si'/no ("li' si nasconde ancora qualcosa?"). Se si', quella visita non
// costa l'ora - ma "leggere la scena" si tira come sempre.
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
       costa l’ora (ma «leggere la scena» si tira come sempre).</p>`
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
      <h2>le ${ep.soluzione.domande.length} domande</h2>
      <p class="nota">Rispondete per iscritto, poi aprite la busta. Non si torna indietro.</p>
      ${ep.soluzione.domande.map((d, i) => `
        <p class="mt"><b>${i + 1}. ${esc(d.q)}</b></p>
        <input class="campo" data-risposta="${i}" value="${esc(ind.risposte[i] || '')}"
               placeholder="la vostra risposta…">`).join('')}
      <p class="mt"><b>Appunti</b> — nomi, orari, parole che tornano:</p>
      <textarea class="campo" id="note-taccuino" rows="6"
        placeholder="quel che la notte non deve farvi dimenticare…">${esc(ind.note || '')}</textarea>
      <div class="btn-riga">
        <button class="btn" id="salva-risposte">salvate e tornate in strada</button>
        <button class="btn pieno" id="apri-busta">aprite la busta della soluzione</button>
      </div>
    </div>`;
  dopoBarra();
  const leggi = () => {
    app.querySelectorAll('[data-risposta]').forEach((el) => {
      ind.risposte[Number(el.dataset.risposta)] = el.value;
    });
    ind.note = app.querySelector('#note-taccuino').value;
    salvaP();
  };
  app.querySelector('#salva-risposte').onclick = () => { leggi(); home(); };
  app.querySelector('#apri-busta').onclick = () => {
    leggi();
    if (!confirm('Aprire la busta chiude l’indagine per sempre. Siete pronti?')) return;
    busta();
  };
}

function busta() {
  const { app, ep } = ctx;
  const ind = IND();
  ind.chiusa = true;
  const esiti = verificaRisposte(ep, ind.risposte);
  const t = tierIndagine(ep, ind, esiti.map((e) => e.ok));
  P().vantaggi = { tier: t.tier, dossier: t.dossier, risposte: esiti.map((e) => e.ok) };
  salvaP();
  app.innerHTML = `
    ${barra('la busta è aperta')}
    <div class="pannello">
      <h2>le risposte</h2>
      ${esiti.map((e, i) => `
        <div class="mt">
          <p><b>${i + 1}. ${esc(e.q)}</b> — ${e.ok ? '<span class="ok-txt">esatta</span>' : '<span class="ko-txt">sbagliata</span>'}</p>
          <p class="nota">La verità: ${esc(e.risposta)}</p>
          <p>${esc(e.ok ? e.esatta : e.sbagliata)}</p>
        </div>`).join('')}
      <hr class="divisore">
      <p class="mt"><b>Vantaggio d’indagine:</b> ${t.tier === 'slancio'
        ? 'SLANCIO — 3 azioni a testa nel 1° round di spedizione, e +1 Salute massima a testa.'
        : t.tier === 'preparati' ? 'PREPARATI — +1 Salute massima a testa.'
        : 'nessuno: siete arrivati col fiato corto.'}
        (${t.oreAvanzate} ore avanzate, ${t.luoghi} luoghi visitati)</p>
      ${t.dossier ? '<p><b>Dossier completo:</b> 1 gettone Intuizione — un solo ri-tiro, una volta, in spedizione.</p>' : ''}
      <div class="btn-riga">
        <button class="btn pieno" id="alla-spedizione">alla spedizione</button>
      </div>
    </div>`;
  dopoBarra();
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


function pannelloMsg(titolo, corpoHtml, dopo) {
  const { app } = ctx;
  app.innerHTML = `
    ${barra(titolo)}
    <div class="pannello">${corpoHtml}</div>
    <div class="btn-riga"><button class="btn pieno" id="ok-msg">continuate</button></div>`;
  dopoBarra();
  app.querySelector('#ok-msg').onclick = dopo;
}

function scegliEroe(titolo, statKey) {
  const eroi = P().party.map((n) => ctx.comune.eroi.find((e) => e.nome === n)).filter(Boolean);
  return scegliDaLista(titolo, eroi.map((e) => ({
    id: e.nome, label: `${e.nome} (${statKey.toUpperCase()} ${e[statKey]})`,
  }))).then((id) => eroi.find((e) => e.nome === id) || null);
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
