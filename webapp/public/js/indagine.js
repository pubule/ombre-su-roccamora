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
  home();
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
      <button class="btn" id="taccuino">taccuino e domande</button>
      <button class="btn" id="inventario">oggetti e carte (${ind.oggetti.length + ind.approfondimentiLetti.length})</button>
      <button class="btn pieno" id="chiudi-indagine">chiudete l’indagine</button>
    </div>`;
  dopoBarra();
  app.querySelectorAll('.voce').forEach((el) => el.onclick = () => dichiara(el.dataset.voce));
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
        <button class="btn" id="rinuncia">tornate sui vostri passi</button>
      </div>
    </div>`;
  dopoBarra();
  app.querySelector('#rinuncia').onclick = home;
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
  if (!oraGiaSpesa) ind.ora += 1;
  if (prima) ind.visitati.push(l.n);
  salvaP();

  // leggere la scena: solo alla prima visita, un eroe a scelta
  let scena = ind['scena_' + l.n];
  if (prima && scena == null) {
    const eroe = await scegliEroe('chi legge la scena?', 'acume');
    if (eroe) {
      const r = await tiraProva({
        titolo: `leggere la scena — ${eroe.nome.split(' ')[0]}`,
        diffLabel: 'Media', soglia: ctx.comune.regole.diff.Media,
        bonus: [{ label: 'ACUME', val: eroe.acume }],
      });
      scena = r ? r.ok : false;
    } else scena = false;
    ind['scena_' + l.n] = scena;
    salvaP();
  }
  schedaLuogo(l);
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
      ${(l.oggetti || []).length ? `
        <hr class="divisore">
        <p class="nota">carte da prendere</p>
        <div class="btn-riga">
          ${l.oggetti.map((o) => ind.oggetti.includes(o)
            ? `<button class="btn disabilitato">${esc(o)} ✓</button>`
            : `<button class="btn" data-oggetto="${esc(o)}">prendete “${esc(o)}”</button>`).join('')}
        </div>` : ''}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>approfondire</h2>
      ${scena === false ? `<p class="nota">“Leggere la scena” è fallita qui: gli
        Approfondimenti restano nascosti per questa visita — tornate più tardi
        (1 ora), senza ripetere la prova.</p>` : `
      <p class="nota">Ogni eroe ha il suo modo di vedere. Chi prova, qui?</p>
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
  app.querySelector('#fine-visita').onclick = home;
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
  if (scena !== false) {
    app.querySelectorAll('[data-tipo]').forEach((b) =>
      b.onclick = () => approfondisci(l, b.dataset.tipo, tipiQui));
  }
}

async function approfondisci(l, tipo, tipiQui) {
  const ind = IND();
  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  const c = idoneiPerTipo(ctx.comune, P(), tipo);
  if (!c.length) return aiutoProfano(l, tipo);
  // scelta di chi spende la carica (jolly incluso)
  const chi = await scegliDaLista('chi prova a vedere?', c.map((x) => ({
    id: x.nome, label: `${x.nome}${x.proprie > 0 ? '' : ' (jolly di Sibilla)'}`,
  })));
  if (!chi) return schedaLuogo(l);
  const scelto = c.find((x) => x.nome === chi);
  const conJolly = scelto.proprie <= 0;

  const a = l.approfondimenti.find((x) => x.tipo === tipo);
  if (!a || gia) {
    // la carica si spende comunque? NO: qui l'app e' gentile come un arbitro
    // vero - dichiara "non c'e' nulla per te" senza consumare (il costo vero
    // e' l'ora della visita, gia' pagata).
    return pannelloMsg(tipo.toLowerCase(), `<p><i>${esc(chi.split(' ')[0])} osserva, ascolta,
      fruga. ${gia ? 'Quello che c’era da cogliere qui, l’avete già colto.' :
      'Ma qui non c’è nulla che parli il suo linguaggio.'}</i></p>`, () => schedaLuogo(l));
  }
  usaCarica(P(), chi, tipo, conJolly);
  ind.approfondimentiLetti.push({ n: l.n, tipo, soggetto: a.soggetto });
  salvaP();
  const cardA = cartaApprofondimento(ctx.carte, P().episodio, a.soggetto);
  pannelloMsg(`${tipo.toLowerCase()} — ${a.soggetto.toLowerCase()}`,
    `${cardA ? `<div class="carta-grande"><img src="${urlCartaSafe(cardA.file)}" alt=""></div>` : ''}
     <p class="mt"><i>${rendi(a.testo)}</i></p>
     <p class="nota mt">Prendete la carta “${esc(a.soggetto)}” dal mazzo Approfondimenti.</p>`,
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
  const r = await tiraProva({
    titolo: `aiuto profano — ${eroe.nome.split(' ')[0]}`,
    diffLabel: 'Difficile', soglia: ctx.comune.regole.diff.Difficile,
    bonus: [{ label: 'ACUME', val: eroe.acume }],
  });
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
  const t = tierIndagine(ep, ind);
  const esiti = verificaRisposte(ep, ind.risposte);
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
  pannelloMsg('quel che avete in mano',
    `${ogg.length ? `<p><b>Oggetti</b></p>${galleria(ogg)}` : ''}
     ${app_.length ? `<p class="mt"><b>Approfondimenti</b></p>${galleria(app_)}` : ''}
     ${!ogg.length && !app_.length ? '<p class="nota">Ancora niente. La notte è giovane.</p>' : ''}`,
    home);
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
