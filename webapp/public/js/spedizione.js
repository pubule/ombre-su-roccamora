// Vista Spedizione (modalita' Tavolo): il tavolo gioca coi componenti FISICI
// (tessere, miniature, dadi veri) e l'app fa da arbitro — pesca le Minacce
// per taglia, tiene la traccia del Canto col tick automatico, legge gli
// esiti di Cercare dal "retro" delle tessere, tiene il Registro delle
// Ferite coi massimali giusti per taglia. Stato in partita.spedizione.
import { salva, dati } from './store.js';
import { rendi, norm, costruisciMazzo, carteDaPescare, pesca, fineRound,
         cantoDaCarta, cerca, urlCarta, cartaOggetto } from './engine.js';
import { tiraProva } from './dadi.js';

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

// quando arriva il prossimo segnalino automatico dell'orologio
function prossimoTick() {
  const sp = SP();
  const ogni = ctx.ep.marea ? ctx.ep.marea.ogni : ctx.comune.regole.tick_canto_ogni;
  const soglia = ctx.ep.marea ? ctx.ep.marea.soglia : ctx.comune.regole.soglia_canto;
  const mancano = ogni - (sp.round % ogni || ogni) + 1;
  return `Il ${orologio()} sale da solo a fine del ${sp.round + mancano - 1}° round` +
         ` (e con le carte Crescendo); al ${soglia}° segnalino cambia tutto.`;
}

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

function saluteMax(eroe) {
  const bonusTaglia = ctx.comune.regole.salute_bonus_per_taglia[String(P().party.length)] || 0;
  const tier = (P().vantaggi || {}).tier;
  const bonusTier = (tier === 'slancio' || tier === 'preparati') ? 1 : 0;
  return eroe.salute + bonusTaglia + bonusTier;
}

// piazza una copia: numero piu' basso libero (riusa quelli dei caduti),
// rispettando i segnalini fisici del pool ("se non ne restano, il
// piazzamento non ha luogo" - Regolamento)
function spawnNemico(nome) {
  const sp = SP();
  const nemico = ctx.comune.nemici.find((x) => x.nome === nome);
  if (!nemico) return null;
  const boss = nome === ctx.ep.soluzione.boss;
  const copie = sp.nemici.filter((x) => x.nome === nome);
  const disponibili = boss ? 1 : (ctx.ep.pool || {})[nome] || 0;
  if (copie.length >= disponibili) return { esaurito: true, nome };
  let num = 1;
  while (copie.some((x) => x.num === num)) num += 1;
  sp.nemici.push({ nome, num, ferite: 0, max: feriteMax(nemico) });
  salvaP();
  return { nome, num, tanti: copie.length + 1 > 1 };
}

// legge un testo di gioco (carta Minaccia o QUANDO RIVELATE) e piazza da
// solo i nemici che nomina; ritorna gli annunci per il tavolo
const SPAWN_REGEX = [
  ['LO SGHERRO', /(\d+)?\s*sgherr[oi]/i],
  ['IL SICARIO', /(\d+)?\s*sicari[oi]/i],
  ['ADEPTO INCAPPUCCIATO', /(\d+)?\s*adept[oi]/i],
  ['IL CROGIOLANTE', /(\d+)?\s*crogiolant[ei]/i],
  ['CANE DEI MOLI', /(\d+)?\s*can[ei] dei moli/i],
  ['IL FONDITORE', /(\d+)?\s*fonditor[ei]/i],
  ['IL CUSTODE DELLA CERA', /custode della cera/i],
  ['LO SCORIATORE', /scoriatore/i],
];
// al 3° segnalino il boss si desta (sulla tessera piu' lontana dagli eroi):
// se non e' gia' in campo, entra nel registro da solo
function destaBossSeSoglia() {
  const sp = SP();
  const boss = ctx.ep.soluzione.boss;
  const soglia = ctx.comune.regole.soglia_canto;
  if (!boss || ctx.ep.marea || sp.canto < soglia) return [];
  if (sp.nemici.some((x) => x.nome === boss) || sp.bossDestato) return [];
  sp.bossDestato = true;
  spawnNemico(boss);
  return [`${boss} entra nel registro: piazzatelo sulla tessera rivelata più lontana dagli eroi.`];
}

function spawnDaTesto(testo) {
  const annunci = [];
  const attivo = /piazzate|appare|appaiono|si desta|arriva/i.test(testo);
  if (!attivo) return annunci;
  // sbarco silenzioso (Ep.2): col Contrassegno l'apparizione non ha luogo
  if (/se non mostrate il contrassegno/i.test(testo) &&
      (P().indagine.oggetti || []).some((o) => norm(o).includes('CONTRASSEGNO'))) {
    annunci.push('Avete il Contrassegno di Piombo: lo sbarco è silenzioso, nessuno appare.');
    return annunci;
  }
  for (const [nome, re] of SPAWN_REGEX) {
    const m = testo.match(re);
    if (!m) continue;
    const quanti = m[1] ? Number(m[1]) : 1;
    for (let k = 0; k < quanti; k++) {
      const r = spawnNemico(nome);
      if (!r) continue;
      if (r.esaurito) {
        annunci.push(`Segnalini ${nome.toLowerCase()} esauriti: quel piazzamento non ha luogo.`);
        break;
      }
      annunci.push(`Al registro: ${nome.toLowerCase()}${r.tanti || r.num > 1 ? ' ' + r.num : ''} — piazzate la miniatura.`);
    }
  }
  return annunci;
}

function barra(titolo) {
  const sp = SP();
  const fase = sp && sp.fase === 'nemici' ? 'nemici' : 'eroi';
  return `
  <div class="barra">
    <button class="btn" id="nav-esci">← menu</button>
    <div class="titolo">${esc(titolo)}</div>
    <span class="sc" style="color:var(--oro-chiaro)">round ${sp ? sp.round : 1} · ${fase} ·
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
      round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
      mazzo: costruisciMazzo(ctx.carte, ep, partita.episodio),
      rivelate: [ep.tessere[0].id],
      nemici: [],
      vite: Object.fromEntries(partita.party.map((nm) => {
        const e = ctx.comune.eroi.find((x) => x.nome === nm);
        return [nm, e ? saluteMax(e) : 6];
      })),
    };
    salvaP();
    // la prima tessera parte rivelata: se il suo QUANDO RIVELATE piazza
    // qualcuno (o il Contrassegno lo evita), va detto subito
    const t0 = ep.tessere[0];
    const annunci = /quando rivelate/i.test(t0.testo || '') ? spawnDaTesto(t0.testo) : [];
    if (annunci.length) {
      return pannelloMsg(`${t0.id} — l’arrivo`, fronteTessera(t0) +
        annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join(''), plancia);
    }
    plancia();
  };
}

// ---------------------------------------------------------------- plancia
function plancia() {
  const { app, ep } = ctx;
  const sp = SP();
  if (sp.esito) return epilogo();
  if (sp.fase === 'nemici') return faseNemici();
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
      <h2>la salute degli eroi</h2>
      ${eroiHtml()}
      <p class="nota mt">A 0 l’eroe è a terra: un compagno adiacente lo Rianima a 2 (usate il +).</p>
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>gli oggetti del gruppo</h2>
      ${oggettiHtml()}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>registro delle ferite — nemici</h2>
      ${registroHtml()}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <details class="azioni-promemoria">
        <summary><h2>il turno degli eroi — 2 azioni a testa, di tipo diverso</h2></summary>
        <p class="nota">Si gioca sul tavolo: miniature sulle tessere stampate, dadi veri.
        L’app non muove nulla — arbitra e basta.</p>
        <p class="mt">◆ <b>Muovere</b> — fino a 3 caselle (Nino 4); niente diagonali, non si
        attraversano nemici o mobili.</p>
        <p class="mt">◆ <b>Attaccare</b> — nemico adiacente: 2d6 + VIGORE (+1 se armati)
        ≥ Difesa → 1 ferita (segnatela qui sotto).</p>
        <p class="mt">◆ <b>Cercare</b> — ACUME Media, 1 volta a tessera, ritentabile:
        l’esito ve lo legge l’app (toccate la tessera qui sopra).</p>
        <p class="mt">◆ <b>Interagire</b> — porte, grate, leve, liberare chi va scortato.</p>
        <p class="mt">◆ <b>Usare un oggetto</b> — come dice la sua carta.</p>
        <p class="mt">◆ <b>Rianimare</b> — un eroe a terra adiacente torna a 2 Salute.</p>
        <p class="nota mt">Uscendo verso una tessera coperta: rivelatela (toccatela qui
        sopra) e leggetene subito il fronte.</p>
      </details>
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>fine del turno degli eroi</h2>
      <p class="nota">Quando tutti hanno agito: la Minaccia pesca
      ${carteDaPescare(ctx.comune, P().party.length, sp.round, sp.cantoBonus, P().episodio)}
      carta/e (${restanti} nel mazzo). ${prossimoTick()}</p>
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
  agganciaOggetti();
  agganciaEroi();
}

// ------------------------------------------------------------- tessere
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

function fronteTessera(t) {
  return `
    <p class="nota">— leggete ad alta voce —</p>
    <p class="mt"><i>${rendi(t.testo)}</i></p>
    ${t.hook ? `<hr class="divisore"><p class="nota">solo per chi arbitra</p>
      <p><i>${rendi(t.hook)}</i></p>` : ''}`;
}

async function tessera(tid) {
  const { ep } = ctx;
  const sp = SP();
  const t = ep.tessere.find((x) => x.id === tid);
  if (!sp.rivelate.includes(tid)) {
    sp.rivelate.push(tid);
    salvaP();
    const annunci = /quando rivelate/i.test(t.testo) ? spawnDaTesto(t.testo) : [];
    return pannelloMsg(`${t.id} — rivelata`, fronteTessera(t) +
      annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join(''), plancia);
  }
  // tessera rivelata: cosa chiedete all'arbitro?
  const azione = await scegliDaLista(`${t.id} · ${t.nome.toLowerCase()}`, [
    { id: 'fronte', label: 'rileggete il fronte' },
    { id: 'cercare', label: 'Cercare — l’oracolo risponde' },
    { id: 'interagire', label: 'Interagire / aprire — chiedete al fascicolo' },
  ]);
  if (!azione) return;
  if (azione === 'fronte') {
    return pannelloMsg(`${t.id} — ${t.nome.toLowerCase()}`, fronteTessera(t), plancia);
  }
  if (azione === 'cercare') {
    const r = cerca(ep, P(), tid);
    return pannelloMsg(`${t.id} — cercare`, `
      <p><b>Cercare (ACUME, Media, 1 volta a tessera):</b></p>
      <p class="mt"><i>${rendi(r.esito)}</i></p>
      ${r.hook ? `<hr class="divisore"><p class="nota">solo per chi arbitra</p>
        <p><i>${rendi(r.hook)}</i></p>` : ''}`, plancia);
  }
  // interagire/aprire: le note che al tavolo vivono sul retro del foglio
  pannelloMsg(`${t.id} — interagire`, t.arbitro
    ? `<p class="nota">solo per chi arbitra</p><p class="mt"><i>${rendi(t.arbitro)}</i></p>`
    : `<p><i>Qui niente serrature né segreti: porte e leve fanno quel che sembrano.
       Procedete col buon senso — e con la Regola d’Oro.</i></p>`, plancia);
}

// ------------------------------------------------------------ salute eroi
function eroiHtml() {
  const sp = SP();
  return P().party.map((nm) => {
    const e = ctx.comune.eroi.find((x) => x.nome === nm);
    if (!e) return '';
    const max = saluteMax(e);
    const vita = sp.vite[nm] ?? max;
    return `
    <div class="nemico-riga">
      <span class="nemico-nome">${esc(nm.toLowerCase())}${vita === 0 ? ' <b>a terra</b>' : ''}</span>
      <span class="nemico-comandi">
        <button class="btn attacca" data-vita="${esc(nm)}" data-delta="-1">−</button>
        <span class="nemico-pips">
          ${Array.from({ length: max }, (_, k) =>
            `<span class="pip-vita ${k < vita ? 'piena' : ''}"></span>`).join('')}
        </span>
        <button class="btn attacca" data-vita="${esc(nm)}" data-delta="1">+</button>
      </span>
    </div>`;
  }).join('');
}

function agganciaEroi() {
  const sp = SP();
  ctx.app.querySelectorAll('[data-vita]').forEach((b) => b.onclick = () => {
    const nm = b.dataset.vita;
    const e = ctx.comune.eroi.find((x) => x.nome === nm);
    const max = saluteMax(e);
    sp.vite[nm] = Math.max(0, Math.min(max, (sp.vite[nm] ?? max) + Number(b.dataset.delta)));
    salvaP();
    plancia();
  });
}

// ------------------------------------------------------ oggetti del gruppo
// L'inventario segue il gruppo dall'indagine; qui si consultano le carte
// ("Usare un oggetto" e' un'azione: la carta dice come) e si registrano
// gli oggetti TROVATI in spedizione col Cercare.
function oggettiHtml() {
  const ind = P().indagine;
  const presi = (ind.oggetti || []).map((n) => ({ nome: n, carta: cartaOggetto(ctx.carte, P().episodio, n) }));
  return `
    ${presi.length ? `<div class="galleria-carte">${presi.map((o, i) =>
        o.carta ? `<img loading="lazy" data-oggetto-idx="${i}" src="${urlCarta(o.carta.file)}" alt="">` : '').join('')}
      </div>
      <p class="nota mt">Toccate una carta per leggerla in grande: dice lei come si usa.</p>`
      : '<p class="nota">Il gruppo è a mani vuote. Cercare aiuta.</p>'}
    <div class="btn-riga">
      <button class="btn" id="aggiungi-oggetto">+ oggetto trovato cercando</button>
    </div>`;
}

function agganciaOggetti() {
  const { app } = ctx;
  const ind = P().indagine;
  app.querySelectorAll('[data-oggetto-idx]').forEach((el) => el.onclick = () => {
    const nome = ind.oggetti[Number(el.dataset.oggettoIdx)];
    const c = cartaOggetto(ctx.carte, P().episodio, nome);
    pannelloMsg(nome.toLowerCase(),
      `<div class="carta-grande"><img src="${urlCarta(c.file)}" alt=""></div>`, plancia);
  });
  app.querySelector('#aggiungi-oggetto').onclick = async () => {
    const tutte = [...(ctx.carte.oggetti_carte[P().episodio] || []),
                   ...(ctx.carte.oggetti_carte.preludio || [])];
    const restanti = tutte.filter((c) =>
      !(ind.oggetti || []).some((n) => norm(c.title) === norm(n) || norm(c.title).includes(norm(n))));
    if (!restanti.length) return;
    const scelto = await scegliDaLista('cosa avete trovato?',
      restanti.map((c) => ({ id: c.title, label: c.title })));
    if (!scelto) return plancia();
    ind.oggetti.push(scelto);
    salvaP();
    plancia();
  };
}

// -------------------------------------------------------- registro ferite
function registroHtml() {
  const sp = SP();
  const righe = sp.nemici.map((n, i) => {
    const copie = sp.nemici.filter((x) => x.nome === n.nome).length;
    const mostraNum = copie > 1 || n.num > 1;
    return `
    <div class="nemico-riga">
      <span class="nemico-nome">${esc(n.nome.toLowerCase())}${mostraNum ? ` <b>${n.num}</b>` : ''}</span>
      <span class="nemico-comandi">
        <button class="btn attacca" data-attacca="${i}">⚔ attacca</button>
        <span class="nemico-pips" data-idx="${i}" title="+1 ferita a mano">
          ${Array.from({ length: n.max }, (_, k) =>
            `<span class="pip-ferita ${k < n.ferite ? 'piena' : ''}"></span>`).join('')}
        </span>
      </span>
    </div>`;
  }).join('');
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
    const r = spawnNemico(b.dataset.spawn);
    if (r && r.esaurito) {
      return pannelloMsg('segnalini finiti', `<p><i>Le copie di
        ${esc(r.nome.toLowerCase())} sono tutte in campo: il piazzamento non ha
        luogo (regola dei segnalini).</i></p>`, plancia);
    }
    plancia();
  });
  app.querySelectorAll('.nemico-pips[data-idx]').forEach((el) => el.onclick = () => {
    ferisci(Number(el.dataset.idx), true);
  });
  app.querySelectorAll('[data-attacca]').forEach((b) => b.onclick = () =>
    attacca(Number(b.dataset.attacca)));
}

// una ferita al nemico i; ritorna true se abbattuto
function ferisci(i, ridisegna) {
  const sp = SP();
  const n = sp.nemici[i];
  n.ferite += 1;
  const abbattuto = n.ferite >= n.max;
  if (abbattuto) sp.nemici.splice(i, 1);   // la miniatura torna nel pool
  salvaP();
  if (ridisegna) plancia();
  return abbattuto;
}

// l'azione Attaccare, guidata: eroe, arma, dadi veri, ferita segnata da sola
async function attacca(i) {
  const sp = SP();
  const bersaglio = sp.nemici[i];
  const nemico = ctx.comune.nemici.find((x) => x.nome === bersaglio.nome);
  const eroi = P().party.map((nm) => ctx.comune.eroi.find((e) => e.nome === nm)).filter(Boolean);
  const chi = await scegliDaLista('chi attacca?', eroi.map((e) => ({
    id: e.nome, label: `${e.nome} (VIGORE ${e.vigore})` })));
  if (!chi) return plancia();
  const eroe = eroi.find((e) => e.nome === chi);
  const armato = await scegliDaLista(`${eroe.nome.split(' ')[0]} è armato?`, [
    { id: 'si', label: 'sì — arma in mano (+1)' },
    { id: 'no', label: 'no — a mani nude' }]);
  if (armato == null) return plancia();
  const bonus = [{ label: 'VIGORE', val: eroe.vigore }];
  if (armato === 'si') bonus.push({ label: 'arma', val: 1 });
  const r = await tiraProva({
    titolo: `attacco — ${eroe.nome.split(' ')[0]} → ${bersaglio.nome.toLowerCase()}`,
    diffLabel: 'Difesa', soglia: nemico.dif, bonus, modo: P().modo,
  });
  if (!r) return plancia();
  if (!r.ok) {
    return pannelloMsg('mancato', `<p><i>Il colpo passa a vuoto: ${esc(bersaglio.nome.toLowerCase())}
      è ancora in piedi, e adesso lo sa.</i></p>`, plancia);
  }
  const abbattuto = ferisci(i, false);
  pannelloMsg(abbattuto ? 'abbattuto!' : 'colpito', abbattuto
    ? `<p><i>${esc(bersaglio.nome.toLowerCase())} crolla: togliete la miniatura dal tavolo —
       il segnalino torna disponibile.</i></p>`
    : `<p><i>Colpito: segnata 1 ferita a ${esc(bersaglio.nome.toLowerCase())}
       (${sp.nemici[i].ferite}/${sp.nemici[i].max}).</i></p>`, plancia);
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
      annunci.push(...destaBossSeSoglia());
      // il crescendo cura il boss in gioco - ma non ai tavoli da 2-3 eroi
      const boss = sp.nemici.find((x) => x.nome === ctx.ep.soluzione.boss);
      if (boss && /cancellate 1 sua ferita/i.test(carta.rules)) {
        if (P().party.length >= 4) {
          if (boss.ferite > 0) {
            boss.ferite -= 1;
            annunci.push(`Il boss recupera 1 ferita (${boss.ferite}/${boss.max}) e si attiva subito.`);
          }
        } else {
          annunci.push('A 2–3 eroi il boss NON recupera ferite: si attiva soltanto.');
        }
      }
      salvaP();
    }
    // piazzamenti scritti sulla carta (solo la parte effetto, non il flavor)
    const effetto = carta.rules.split('{divider}').pop();
    annunci.push(...spawnDaTesto(effetto));
    await new Promise((fatto) => {
      pannelloMsg(`minaccia ${i + 1} di ${n}`, `
        <div class="carta-grande"><img src="${urlCarta(carta.file)}" alt=""></div>
        <p class="mt">${rendi(carta.rules)}</p>
        ${annunci.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join('')}`,
        fatto);
    });
  }
  sp.fase = 'nemici';
  salvaP();
  faseNemici();
}

// ----------------------------------------------------------- fase nemici
function faseNemici() {
  const { app } = ctx;
  const sp = SP();
  const tipiInCampo = [...new Set(sp.nemici.map((x) => x.nome))]
    .map((nome) => ctx.comune.nemici.find((x) => x.nome === nome)).filter(Boolean);
  app.innerHTML = `
    ${barra(ctx.ep.titolo)}
    <div class="pannello">
      <h2>fase nemici — si attivano tutti</h2>
      <p class="nota">Ogni nemico in campo si muove verso l’eroe più vicino e attacca se
      adiacente (2d6 + Attacco ≥ Difesa dell’eroe → subisce il Danno). Ambiguità?
      Regola d’Oro: sceglie il gruppo, sempre l’opzione peggiore per sé.</p>
      ${tipiInCampo.length ? tipiInCampo.map((n) => `
        <div class="mt">
          <p><b>${esc(n.nome.toLowerCase())}</b> — Mov ${n.mov} · Attacco +${n.att} ·
             Danno ${n.dan}${n.gittata ? ` · gittata ${n.gittata}` : ''}</p>
          ${n.note ? `<p class="nota">${rendi(n.note)}</p>` : ''}
        </div>`).join('')
      : '<p class="mt"><i>Nessun nemico in campo: la fonderia trattiene il fiato.</i></p>'}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>la salute degli eroi</h2>
      ${eroiHtml()}
    </div>
    <div class="mt"></div>
    <div class="pannello">
      <h2>registro delle ferite — nemici</h2>
      ${registroHtml()}
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="fine-round">fine round →</button>
      <button class="btn" id="sconfitta">gli eroi cadono</button>
    </div>`;
  dopoBarra();
  agganciaRegistro();
  agganciaEroi();
  app.querySelector('#sconfitta').onclick = () => fine('sconfitta');
  app.querySelector('#fine-round').onclick = () => {
    const annunciRound = fineRound(ctx.comune, ctx.ep, sp);   // round += 1 e tick
    annunciRound.push(...destaBossSeSoglia());
    sp.fase = 'eroi';
    salvaP();
    if (annunciRound.length) {
      return pannelloMsg(`${orologio().toLowerCase()} — fine round ${sp.round - 1}`,
        annunciRound.map((a) => `<p class="mt"><b>${esc(a)}</b></p>`).join(''), plancia);
    }
    plancia();
  };
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
