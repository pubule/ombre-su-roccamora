// Vista Indagine (modalita' Tavolo): l'app fa da arbitro — stradario con
// oracolo, indizi letti al momento giusto, Approfondimenti gated con
// cariche, orologio, chiusura con la "busta". Stato in partita.indagine
// (store.js), regole in engine.js, dadi in dadi.js.
import { salva, dati } from './store.js';
import { tiraProva } from './dadi.js';
import { rendi, norm, bussa, dichiaraVoce, vociMappa, luogoVisitabile,
         idoneiPerTipo, usaCarica, tierIndagine, verificaRisposte } from './engine.js';

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
  const sbloccato = ind.scoperti.includes(l.n);
  if (!l.aperto && !sbloccato) return bussare(l);
  visita(l);
}

// ---------------------------------------------------------------- bussare
function bussare(l) {
  const { app } = ctx;
  app.innerHTML = `
    ${barra('la porta è chiusa')}
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
    ${l.testo ? `<div class="pannello"><p><i>${rendi(l.testo)}</i></p></div><div class="mt"></div>` : ''}
    <div class="pannello">
      <h2>indizi — leggeteli ad alta voce</h2>
      ${l.indizi.map((i) => `<p class="mt">◆ ${rendi(i)}</p>`).join('')}
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
  if (scena !== false) {
    app.querySelectorAll('[data-tipo]').forEach((b) =>
      b.onclick = () => approfondisci(l, b.dataset.tipo, tipiQui));
  }
}

async function approfondisci(l, tipo, tipiQui) {
  const ind = IND();
  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === tipo);
  const c = idoneiPerTipo(ctx.comune, P(), tipo);
  if (!c.length) {
    return pannelloMsg(tipo.toLowerCase(), `<p class="nota">Nessun eroe del party può più
      sbloccare una ${esc(tipo)} (cariche esaurite o abilità assente).</p>`, () => schedaLuogo(l));
  }
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
  pannelloMsg(`${tipo.toLowerCase()} — ${a.soggetto.toLowerCase()}`,
    `<p><i>${rendi(a.testo)}</i></p>
     <p class="nota mt">Prendete la carta “${esc(a.soggetto)}” dal mazzo Approfondimenti.</p>`,
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
  pannelloMsg('quel che avete in mano',
    `${ind.oggetti.length ? `<p><b>Oggetti:</b> ${ind.oggetti.map(esc).join(' · ')}</p>` : ''}
     ${ind.approfondimentiLetti.length ? `<p class="mt"><b>Approfondimenti:</b> ${
       ind.approfondimentiLetti.map((x) => esc(x.soggetto)).join(' · ')}</p>` : ''}
     ${!ind.oggetti.length && !ind.approfondimentiLetti.length ? '<p class="nota">Ancora niente. La notte è giovane.</p>' : ''}`,
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
