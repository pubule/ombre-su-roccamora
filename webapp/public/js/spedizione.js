// Vista Spedizione (modalita' Tavolo): il tavolo gioca coi componenti FISICI
// (tessere, miniature, dadi veri) e l'app fa da arbitro — pesca le Minacce
// per taglia, tiene la traccia del Canto col tick automatico, legge gli
// esiti di Cercare dal "retro" delle tessere, tiene il Registro delle
// Ferite coi massimali giusti per taglia. Stato in partita.spedizione.
import { salva, dati } from './store.js';
import { rendi, costruisciMazzo, carteDaPescare, pesca, fineRound,
         cantoDaCarta, cerca, urlCarta } from './engine.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ctx = null;   // { app, partita, ep, comune, carte, vaiA }

export async function vistaSpedizione(app, partita, vaiA) {
  const [ep, comune, carte] = await Promise.all([
    dati(partita.episodio), dati('comune'), dati('carte')]);
  ctx = { app, partita, ep, comune, carte, vaiA };
  // lo store crea un segnaposto con mazzo null: il setup vero e' qui
  if (!partita.spedizione || !partita.spedizione.mazzo) return setup();
  plancia();
}

const P = () => ctx.partita;
const SP = () => ctx.partita.spedizione;
const salvaP = () => salva(ctx.partita);
const orologio = () => ctx.ep.marea ? 'Marea' : 'Canto';

function fascia(taglia) {
  if (taglia === 2 || taglia === 4) return 0;
  if (taglia === 3 || taglia === 5) return 1;
  if (taglia === 6) return 2;
  if (taglia <= 8) return 3;
  return 4;
}

// nemici schierabili in questo episodio: pool tessere/carte + boss
function nemiciEpisodio() {
  const nomi = Object.keys(ctx.ep.pool || {});
  const boss = ctx.ep.soluzione.boss;
  if (boss && !nomi.includes(boss)) nomi.push(boss);
  return nomi.map((n) => ctx.comune.nemici.find((x) => x.nome === n)).filter(Boolean);
}

function feriteMax(nemico) {
  return nemico.ferite_per_fascia[fascia(P().party.length)];
}

function barra(titolo) {
  const sp = SP();
  return `
  <div class="barra">
    <button class="btn" id="nav-esci">← menu</button>
    <div class="titolo">${esc(titolo)}</div>
    <span class="sc" style="color:var(--oro-chiaro)">round ${sp ? sp.round : 1} ·
      ${orologio().toLowerCase()} ${sp ? sp.canto : 0}</span>
  </div>`;
}

function dopoBarra() {
  ctx.app.querySelector('#nav-esci').onclick = () => ctx.vaiA('menu');
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

// ------------------------------------------------------------------ setup
function setup() {
  const { app, ep, partita } = ctx;
  const v = partita.vantaggi || { tier: 'nessuno', dossier: false, risposte: [] };
  const dom = ep.soluzione.domande;
  const salute = ctx.comune.regole.salute_bonus_per_taglia[String(partita.party.length)] || 0;
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello">
      <h2>preparate il tavolo</h2>
      <p>Disponete le <b>${ep.tessere.length} tessere</b> come indica il fascicolo
      Spedizione (coperte, tranne la prima), le miniature degli eroi sulla tessera
      d’ingresso, e tenete a portata i segnalini nemici. I dadi restano vostri:
      l’app chiederà i totali.</p>
      <hr class="divisore">
      <p><b>Dall’indagine portate:</b></p>
      ${dom.map((d, i) => `<p class="mt">${v.risposte[i]
        ? `<span class="ok-txt">✓</span> ${esc(d.esatta)}`
        : `<span class="ko-txt">✗</span> ${esc(d.sbagliata)}`}</p>`).join('')}
      <p class="mt"><b>Vantaggio:</b> ${v.tier === 'slancio'
        ? '<span class="ok-txt">SLANCIO</span> — 3 azioni a testa nel 1° round, e +1 Salute massima a testa.'
        : v.tier === 'preparati' ? '<span class="ok-txt">PREPARATI</span> — +1 Salute massima a testa.'
        : 'nessuno: siete arrivati col fiato corto.'}</p>
      ${v.dossier ? '<p><b>Gettone Intuizione</b> — un solo ri-tiro, una volta, quando vorrete.</p>' : ''}
      ${salute ? `<p><b>Taglia del tavolo (${partita.party.length} eroi):</b> +1 Salute massima a testa.</p>` : ''}
      ${partita.party.length <= 3 && ep.soluzione.boss
        ? `<p><b>Regola delle taglie:</b> a 2–3 eroi il boss <b>non recupera mai ferite</b>, qualunque cosa dicano le carte.</p>` : ''}
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="inizia-spedizione">mescolate il mazzo minaccia — si scende</button>
    </div>`;
  dopoBarra();
  app.querySelector('#inizia-spedizione').onclick = () => {
    partita.spedizione = {
      round: 1, canto: 0, cantoBonus: false, esito: null,
      mazzo: costruisciMazzo(ctx.carte, ep, partita.episodio),
      rivelate: [ep.tessere[0].id],
      nemici: [], prossimoNum: {},
    };
    salvaP();
    plancia();
  };
}

// ---------------------------------------------------------------- plancia
function plancia() {
  const { app, ep } = ctx;
  const sp = SP();
  if (sp.esito) return epilogo();
  const restanti = sp.mazzo.ordine.length - sp.mazzo.indice;
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello">
      <h2>le tessere</h2>
      <p class="nota">Toccate una tessera coperta quando il gruppo la rivela (l’app legge il
      fronte); una rivelata per l’oracolo di <b>Cercare</b>.</p>
      <div class="btn-riga">
        ${ep.tessere.map((t) => sp.rivelate.includes(t.id)
          ? `<button class="btn" data-tessera="${t.id}">${t.id} · ${esc(t.nome.toLowerCase())}</button>`
          : `<button class="btn coperta" data-tessera="${t.id}">${t.id} · coperta</button>`).join('')}
      </div>
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>registro delle ferite</h2>
      ${registroHtml()}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>fine del turno degli eroi</h2>
      <p class="nota">Quando tutti hanno agito: la Minaccia pesca
      ${carteDaPescare(ctx.comune, P().party.length, sp.round, sp.cantoBonus, P().episodio)}
      carta/e (${restanti} nel mazzo), poi l’orologio del ${orologio()} avanza da solo.</p>
      <div class="btn-riga">
        <button class="btn pieno" id="fase-minaccia">fase minaccia →</button>
      </div>
    </div>
    <div class="btn-riga">
      <button class="btn" id="vittoria">vittoria</button>
      <button class="btn" id="sconfitta">gli eroi cadono</button>
    </div>`;
  dopoBarra();
  app.querySelectorAll('[data-tessera]').forEach((b) => b.onclick = () => tessera(b.dataset.tessera));
  app.querySelector('#fase-minaccia').onclick = faseMinaccia;
  app.querySelector('#vittoria').onclick = () => fine('vittoria');
  app.querySelector('#sconfitta').onclick = () => fine('sconfitta');
  agganciaRegistro();
}

// ------------------------------------------------------------- tessere
function tessera(tid) {
  const { ep } = ctx;
  const sp = SP();
  const t = ep.tessere.find((x) => x.id === tid);
  if (!sp.rivelate.includes(tid)) {
    sp.rivelate.push(tid);
    salvaP();
    return pannelloMsg(`${t.id} — rivelata`, `
      <p class="nota">— leggete ad alta voce —</p>
      <p class="mt"><i>${rendi(t.testo)}</i></p>`, plancia);
  }
  // oracolo del retro: esito di Cercare + note per chi arbitra
  const r = cerca(ep, P(), tid);
  pannelloMsg(`${t.id} — ${t.nome.toLowerCase()}`, `
    <p><b>Cercare (ACUME, Media, 1 volta a tessera):</b></p>
    <p class="mt"><i>${rendi(r.esito)}</i></p>
    ${r.hook ? `<hr class="divisore"><p class="nota">solo per chi arbitra</p>
      <p><i>${rendi(r.hook)}</i></p>` : ''}
    ${r.arbitro ? `${r.hook ? '' : '<hr class="divisore"><p class="nota">solo per chi arbitra</p>'}
      <p><i>${rendi(r.arbitro)}</i></p>` : ''}`, plancia);
}

// -------------------------------------------------------- registro ferite
function registroHtml() {
  const sp = SP();
  const righe = sp.nemici.map((n, i) => `
    <div class="nemico-riga">
      <span class="nemico-nome">${esc(n.nome.toLowerCase())}${n.num ? ` <b>${n.num}</b>` : ''}</span>
      <span class="nemico-pips" data-idx="${i}">
        ${Array.from({ length: n.max }, (_, k) =>
          `<span class="pip-ferita ${k < n.ferite ? 'piena' : ''}"></span>`).join('')}
      </span>
    </div>`).join('');
  return `
    ${righe || '<p class="nota">Nessun nemico in campo. Durerà poco.</p>'}
    <div class="btn-riga">
      ${nemiciEpisodio().map((n) => `<button class="btn" data-spawn="${esc(n.nome)}">
        + ${esc(n.nome.toLowerCase())}</button>`).join('')}
    </div>`;
}

function agganciaRegistro() {
  const { app } = ctx;
  const sp = SP();
  app.querySelectorAll('[data-spawn]').forEach((b) => b.onclick = () => {
    const nome = b.dataset.spawn;
    const nemico = ctx.comune.nemici.find((x) => x.nome === nome);
    sp.prossimoNum[nome] = (sp.prossimoNum[nome] || 0) + 1;
    const copie = sp.nemici.filter((x) => x.nome === nome).length;
    sp.nemici.push({ nome, num: (copie || sp.prossimoNum[nome] > 1) ? sp.prossimoNum[nome] : null,
                     ferite: 0, max: feriteMax(nemico) });
    salvaP();
    plancia();
  });
  app.querySelectorAll('.nemico-pips').forEach((el) => el.onclick = () => {
    const n = sp.nemici[Number(el.dataset.idx)];
    n.ferite += 1;
    if (n.ferite >= n.max) {
      sp.nemici.splice(Number(el.dataset.idx), 1);   // abbattuto: la miniatura torna nel pool
    }
    salvaP();
    plancia();
  });
}

// --------------------------------------------------------- fase minaccia
async function faseMinaccia() {
  const sp = SP();
  const n = carteDaPescare(ctx.comune, P().party.length, sp.round, sp.cantoBonus, P().episodio);
  for (let i = 0; i < n; i++) {
    const carta = pesca(sp.mazzo, ctx.carte, P().episodio, ctx.ep);
    salvaP();
    const crescendo = carta.title.startsWith('Crescendo');
    let annunci = [];
    if (crescendo && !ctx.ep.marea) {
      annunci = cantoDaCarta(ctx.comune, ctx.ep, sp);
      if (P().party.length <= 3 && ctx.ep.soluzione.boss) {
        annunci.push('A 2–3 eroi il boss NON recupera ferite: ignorate quella riga della carta.');
      }
      salvaP();
    }
    await new Promise((fatto) => {
      pannelloMsg(`minaccia ${i + 1} di ${n}`, `
        <div class="carta-grande"><img src="${urlCarta(carta.file)}" alt=""></div>
        <p class="mt">${rendi(carta.rules)}</p>
        ${annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join('')}
        <p class="nota mt">Se la carta piazza nemici, aggiungeteli al registro appena posate le miniature.</p>`,
        fatto);
    });
  }
  const annunciRound = fineRound(ctx.comune, ctx.ep, sp);
  salvaP();
  if (annunciRound.length) {
    return pannelloMsg(`${orologio().toLowerCase()} — fine round ${sp.round}`,
      annunciRound.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join(''), plancia);
  }
  plancia();
}

// ------------------------------------------------------------------ fine
function fine(esito) {
  const sp = SP();
  if (!confirm(esito === 'vittoria'
    ? 'La spedizione è compiuta? Si chiude qui.'
    : 'Tutti gli eroi sono a terra? La notte vince.')) return;
  sp.esito = esito;
  salvaP();
  epilogo();
}

function epilogo() {
  const { app, ep } = ctx;
  const sp = SP();
  app.innerHTML = `
    ${barra(ep.titolo)}
    <div class="pannello centrato">
      <h2>${sp.esito === 'vittoria' ? 'l’alba vi trova in piedi' : 'la notte ha vinto'}</h2>
      <p class="mt">${sp.esito === 'vittoria'
        ? `${sp.round} round, ${orologio()} a ${sp.canto}. Leggete l’<b>epilogo</b> nel fascicolo
           Soluzione — e il <b>Bivio</b>, se l’episodio ne ha uno: la scelta conta per il prossimo.`
        : 'Rialzatevi: la Soluzione dice cosa resta di questa notte. Roccamora non dimentica — e nemmeno voi.'}</p>
      <div class="btn-riga" style="justify-content:center">
        <button class="btn pieno" id="al-menu">alla taverna</button>
      </div>
    </div>`;
  dopoBarra();
  app.querySelector('#al-menu').onclick = () => ctx.vaiA('menu');
}
