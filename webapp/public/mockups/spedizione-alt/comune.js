/* LA SPEDIZIONE FINTA, condivisa dai tre mockup.
   Non e' il motore: e' una partita giocattolo con le regole in piccolo (muovi,
   attacca, cerca, abilita', fine turno, la notte che reagisce) perche' i tre
   layout si possano provare col dito invece che guardare. Arte e tessere sono
   quelle vere dell'Episodio 1. */
(function () {
  const A = (p) => '/assets/' + encodeURI(p);
  const art = (f) => A('artworks/' + f);
  const tessera = (id) => A('Episodio 1/board/' + id + '.png');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const key = (c, r) => c + ',' + r;
  const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  const d6 = () => 1 + Math.floor(Math.random() * 6);

  const S = {
    round: 1, canto: 3, cantoMax: 12, soglie: [4, 8, 12], fase: 'eroi', mazzo: 9,
    obiettivo: 'Scendete nella cripta, liberate Ruggero e riportatelo alla banchina.',
    rooms: [
      { id: 'T2', nome: 'Sala delle casse', x: 0, y: 0 },
      { id: 'T1', nome: 'Banchina d’ingresso', x: 0, y: 1 },
      { id: 'T3', nome: 'Corridoio delle candele', x: 1, y: 0, fog: true },
    ],
    eroi: [
      { id: 'elena', nome: 'Elena', ruolo: 'L’Investigatrice', art: 'Elena.png', hp: 5, max: 6, att: 1, dif: 8, mov: 3, ab: 'Occhio clinico', car: 2, carMax: 2, c: 1, r: 6 },
      { id: 'attilio', nome: 'Attilio', ruolo: 'Il Medico', art: 'Attilio.png', hp: 7, max: 7, att: 2, dif: 8, mov: 3, ab: 'Pronto soccorso', car: 3, carMax: 3, c: 0, r: 7 },
      { id: 'sibilla', nome: 'Sibilla', ruolo: 'La Sensitiva', art: 'Sibilla.png', hp: 2, max: 5, att: 1, dif: 7, mov: 3, ab: 'Il pendolo', car: 1, carMax: 1, c: 2, r: 7 },
      { id: 'nino', nome: 'Nino', ruolo: 'Il Ladro', art: 'Nino.png', hp: 4, max: 6, att: 2, dif: 9, mov: 4, ab: 'Grimaldello', car: 1, carMax: 1, c: 1, r: 7 },
    ],
    nemici: [
      { id: 'adepto', nome: 'Adepto incappucciato', art: 'Adepto Incappucciato.png', hp: 1, max: 1, att: 1, dif: 7, dan: 1, mov: 3, c: 2, r: 1 },
      { id: 'cane', nome: 'Cane dei moli', art: 'Cani dei Moli.png', hp: 1, max: 1, att: 2, dif: 6, dan: 1, mov: 5, c: 0, r: 1 },
    ],
    boss: { id: 'custode', nome: 'Il Custode della cera', art: 'Il Custode della Cera (boss).png', hp: 3, max: 3, att: 3, dif: 9, dan: 2, mov: 2, c: 6, r: 1, boss: true },
    attivo: 0, modo: null, diario: [], ultimo: null, colpito: null, agisce: null, dado: null,
  };
  S.eroi.forEach((e) => Object.assign(e, { eroe: true, fatte: 0, mosso: false, attaccato: false, cercato: false, finito: false }));
  S.nemici.forEach((n) => (n.nemico = true)); S.boss.nemico = true;

  const blocchi = new Set(['3,4', '3,5', '0,0', '3,3', '7,3']);
  const PORTA = { c: 4, r: 1 };
  const stanzaDi = (c, r) => S.rooms.find((s) => c >= s.x * 4 && c < s.x * 4 + 4 && r >= s.y * 4 && r < s.y * 4 + 4);
  const calpestabile = (c, r) => { const s = stanzaDi(c, r); return !!s && !s.fog && !blocchi.has(key(c, r)); };
  const nemiciVivi = () => S.nemici.filter((n) => n.hp > 0);
  const chi = (c, r) => S.eroi.find((e) => e.c === c && e.r === r) || nemiciVivi().find((n) => n.c === c && n.r === r);
  const att = () => S.eroi[S.attivo];
  const AZ = 2;
  const restano = (e) => (e ? AZ - e.fatte : 0);
  const adiac = (a, b) => Math.abs(a.c - b.c) + Math.abs(a.r - b.r) === 1;

  function raggiungibili(e) {
    const out = {};
    if (!e || S.fase !== 'eroi' || e.mosso || restano(e) <= 0 || e.hp <= 0) return out;
    const q = [[e.c, e.r, 0]]; const seen = new Set([key(e.c, e.r)]);
    while (q.length) {
      const [c, r, d] = q.shift();
      for (const [dc, dr] of DIR) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (seen.has(k) || d + 1 > e.mov) continue; seen.add(k);
        const st = stanzaDi(nc, nr);
        if (st && st.fog) { if (nc === PORTA.c && nr === PORTA.r) out[k] = { c: nc, r: nr, rivela: true }; continue; }
        if (!calpestabile(nc, nr)) continue;
        const o = chi(nc, nr); if (o && o.nemico) continue;
        if (!o) out[k] = { c: nc, r: nr };
        q.push([nc, nr, d + 1]);
      }
    }
    return out;
  }
  const bersagli = (e) => (!e || S.fase !== 'eroi' || e.attaccato || restano(e) <= 0 || e.hp <= 0 ? []
    : nemiciVivi().filter((n) => adiac(e, n)));

  function percorso(n, t) {
    const start = key(n.c, n.r); if (adiac(n, t)) return [];
    const prev = { [start]: null }; const q = [[n.c, n.r]];
    while (q.length) {
      const [c, r] = q.shift();
      for (const [dc, dr] of DIR) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (k in prev || !calpestabile(nc, nr) || chi(nc, nr)) continue;
        prev[k] = key(c, r);
        if (adiac({ c: nc, r: nr }, t)) {
          const p = []; let x = k;
          while (x !== start) { p.unshift(x.split(',').map(Number)); x = prev[x]; }
          return p;
        }
        q.push([nc, nr]);
      }
    }
    return null;
  }
  // L'INTENTO della notte: chi puntera' ogni nemico, e se ci arriva. E' quel
  // che il motore farebbe comunque al suo turno, solo detto prima.
  function intento(n) {
    let best = null;
    for (const e of S.eroi.filter((x) => x.hp > 0)) {
      const p = percorso(n, e);
      if (p && (!best || p.length < best.p.length)) best = { e, p };
    }
    if (!best) return null;
    return { bersaglio: best.e, passi: best.p.slice(0, n.mov), arriva: best.p.length <= n.mov, dan: n.dan };
  }

  const ascolta = [];
  const agg = () => ascolta.forEach((f) => f(S));
  function dillo(testo, tono) {
    S.ultimo = { testo, tono: tono || '', t: Date.now() };
    S.diario.unshift({ testo, round: S.round });
    S.diario = S.diario.slice(0, 30);
  }

  function seleziona(id) {
    if (S.fase !== 'eroi') return;
    const i = S.eroi.findIndex((e) => e.id === id);
    if (i < 0 || S.eroi[i].finito) return;
    S.attivo = i; S.modo = null; agg();
  }
  function muovi(c, r) {
    const e = att(); const v = raggiungibili(e)[key(c, r)]; if (!v) return;
    e.c = c; e.r = r; e.mosso = true; e.fatte++; S.modo = null;
    if (v.rivela) {
      S.rooms.find((s) => s.id === 'T3').fog = false;
      S.nemici.push(S.boss);
      dillo('Il corridoio delle candele si apre. Il Custode della cera vi aspettava.', 'male');
    } else dillo(`${e.nome} si sposta.`);
    agg();
  }
  function attacca(id) {
    const e = att(); const n = bersagli(e).find((x) => x.id === id); if (!n) return;
    const a = d6(), b = d6(), tot = a + b + e.att; const colpo = tot >= n.dif;
    e.attaccato = true; e.fatte++; S.modo = null;
    S.dado = { a, b, bonus: e.att, tot, soglia: n.dif, colpo, chi: e.nome, contro: n.nome };
    if (colpo) { n.hp -= 1; S.colpito = n.id; }
    dillo(`${e.nome} attacca ${n.nome.toLowerCase()}: ${a}+${b}+${e.att} = ${tot} contro Dif ${n.dif} — ${colpo ? (n.hp <= 0 ? 'abbattuto.' : 'colpito.') : 'mancato.'}`, colpo ? 'bene' : '');
    agg(); setTimeout(() => { S.colpito = null; agg(); }, 600);
  }
  const TROVATI = ['Niente, solo cera fredda.', 'Una fiala di sali: +1 salute a chi la beve.', 'Una candela nera, ancora tiepida.', 'Niente. Ma qualcosa, sotto, ha smesso di cantare.'];
  function cerca() {
    const e = att(); if (restano(e) <= 0 || e.cercato) return;
    e.cercato = true; e.fatte++;
    dillo(`${e.nome} cerca: ${TROVATI[Math.floor(Math.random() * TROVATI.length)]}`); agg();
  }
  function abilita() {
    const e = att(); if (restano(e) <= 0 || !e.car) return;
    e.car--; e.fatte++;
    if (e.id === 'attilio') {
      const f = S.eroi.filter((x) => x.hp > 0 && x.hp < x.max && (x === e || adiac(x, e))).sort((x, y) => x.hp - y.hp)[0];
      if (f) { f.hp++; dillo(`Attilio: pronto soccorso a ${f.nome}, +1 salute.`, 'bene'); } else dillo('Attilio: nessuno da medicare qui vicino.');
    } else dillo(`${e.nome} usa ${e.ab.toLowerCase()}.`);
    agg();
  }
  async function fine() {
    if (S.fase !== 'eroi') return;
    const e = att(); e.finito = true; S.modo = null;
    const prossimo = S.eroi.findIndex((x) => !x.finito && x.hp > 0);
    if (prossimo >= 0) { S.attivo = prossimo; dillo(`Tocca a ${S.eroi[prossimo].nome}.`); agg(); return; }
    await notte();
  }
  const MINACCE = ['Le candele si spengono tutte insieme.', 'Dal pozzo sale un canto a più voci.', 'La cera cola dai muri, calda.', 'Una campana suona da sola.'];
  async function notte() {
    S.fase = 'nemici'; S.mazzo = Math.max(0, S.mazzo - 1);
    S.canto = Math.min(S.cantoMax, S.canto + 1);
    dillo(`La notte reagisce. ${MINACCE[S.round % MINACCE.length]} Il canto sale a ${S.canto}.`, 'male');
    agg(); await pausa(900);
    for (const n of nemiciVivi()) {
      const it = intento(n); S.agisce = n.id; agg(); await pausa(350);
      if (!it) continue;
      for (const [c, r] of it.passi) { n.c = c; n.r = r; agg(); await pausa(230); }
      if (it.arriva && adiac(n, it.bersaglio)) {
        const t = it.bersaglio; const a = d6(), b = d6(), tot = a + b + n.att; const colpo = tot >= t.dif;
        if (colpo) { t.hp = Math.max(0, t.hp - n.dan); S.colpito = t.id; }
        dillo(`${n.nome} ${colpo ? `colpisce ${t.nome}: −${n.dan}.${t.hp === 0 ? ` ${t.nome} è a terra.` : ''}` : `manca ${t.nome}.`}`, colpo ? 'male' : '');
        agg(); await pausa(750); S.colpito = null;
      }
    }
    S.agisce = null; S.round++; S.fase = 'eroi';
    S.eroi.forEach((e) => Object.assign(e, { fatte: 0, mosso: false, attaccato: false, cercato: false, finito: e.hp <= 0 }));
    S.attivo = Math.max(0, S.eroi.findIndex((e) => !e.finito));
    dillo(`Round ${S.round}. Tocca a ${att().nome}.`); agg();
  }

  // ---------------------------------------------------------------- plancia
  // `intenti`: disegna sulla mappa dove andra' ogni nemico al turno della notte.
  function plancia(el, opz = {}) {
    el.classList.add('plancia');
    el.innerHTML = '<div class="mondo"><div class="strato-stanze"></div><svg class="strato-intenti"></svg><div class="strato-tok"></div><div class="strato-celle"></div></div>';
    const mondo = el.querySelector('.mondo'), stS = el.querySelector('.strato-stanze'),
      stI = el.querySelector('.strato-intenti'), stT = el.querySelector('.strato-tok'), stC = el.querySelector('.strato-celle');
    const toks = {};
    let cell = 60;
    const COLS = 8, ROWS = 8;
    function misura() {
      const w = el.clientWidth - (opz.margine || 16), h = el.clientHeight - (opz.margine || 16);
      cell = Math.max(24, Math.floor(Math.min(w / COLS, h / ROWS)));
      mondo.style.width = COLS * cell + 'px'; mondo.style.height = ROWS * cell + 'px';
      el.style.setProperty('--cell', cell + 'px');
    }
    const pos = (c, r) => `translate(${c * cell}px, ${r * cell}px)`;
    function disegna() {
      misura();
      stS.innerHTML = S.rooms.map((s) => `<div class="stanza${s.fog ? ' nebbia' : ''}" style="left:${s.x * 4 * cell}px;top:${s.y * 4 * cell}px;width:${4 * cell}px;height:${4 * cell}px;${s.fog ? '' : `background-image:url('${tessera(s.id)}')`}">
        ${s.fog ? '<span class="velo"><span class="sc">nella nebbia</span></span>' : `<span class="nome-stanza sc">${esc(s.nome)}</span>`}</div>`).join('');
      const e = att();
      const mostraMosse = S.fase === 'eroi' && (opz.mosseSempre || S.modo === 'muovi');
      const ragg = mostraMosse ? raggiungibili(e) : {};
      const bers = S.fase === 'eroi' && (opz.mosseSempre || S.modo === 'attacca') ? bersagli(e).map((n) => n.id) : [];
      stC.innerHTML = Object.values(ragg).map((v) => `<button class="cella mossa${v.rivela ? ' rivela' : ''}" data-c="${v.c}" data-r="${v.r}"
        style="transform:${pos(v.c, v.r)};width:${cell}px;height:${cell}px" aria-label="muovi qui"></button>`).join('');
      // gettoni: stessi nodi da un disegno all'altro, cosi' scivolano
      const vivi = new Set();
      for (const x of [...S.eroi, ...S.nemici]) {
        if (x.nemico && x.hp <= 0) continue;
        vivi.add(x.id);
        let t = toks[x.id];
        if (!t) {
          t = document.createElement('button');
          t.innerHTML = `<img src="${art(x.art)}" alt=""><i class="sangue"></i><b class="pv"></b>`;
          t.dataset.id = x.id; stT.appendChild(t); toks[x.id] = t;
          t.style.transform = pos(x.c, x.r);
        }
        const f = 1 - x.hp / x.max;
        t.className = `tok ${x.eroe ? 'eroe' : 'nemico'}${x.boss ? ' boss' : ''}${x.eroe && x === e && S.fase === 'eroi' ? ' attivo' : ''}${
          x.eroe && x.finito && x.hp > 0 ? ' fatto' : ''}${x.hp <= 0 ? ' giu' : ''}${x.hp > 0 && x.hp / x.max <= 1 / 3 ? ' grave' : ''}${
          bers.includes(x.id) ? ' bersaglio' : ''}${S.colpito === x.id ? ' colpito' : ''}${S.agisce === x.id ? ' agisce' : ''}`;
        t.style.width = t.style.height = cell + 'px';
        t.style.setProperty('--f', f.toFixed(2));
        t.style.transform = pos(x.c, x.r);
        t.querySelector('.pv').textContent = x.hp;
        t.title = `${x.nome} — ${x.hp}/${x.max}`;
      }
      for (const id of Object.keys(toks)) if (!vivi.has(id)) { toks[id].remove(); delete toks[id]; }
      // intenti
      stI.setAttribute('width', COLS * cell); stI.setAttribute('height', ROWS * cell);
      if (opz.intenti && S.fase === 'eroi') {
        const m = (c) => c * cell + cell / 2;
        stI.innerHTML = `<defs><marker id="punta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e0505f"/></marker></defs>` +
          nemiciVivi().map((n) => {
            const it = intento(n); if (!it) return '';
            const pts = [[n.c, n.r], ...it.passi];
            const d = pts.map(([c, r], i) => `${i ? 'L' : 'M'}${m(c)} ${m(r)}`).join(' ');
            const t = it.bersaglio;
            return `<path d="${d}" class="freccia${it.arriva ? '' : ' corta'}" marker-end="url(#punta)"/>` +
              (it.arriva ? `<g class="minaccia" transform="translate(${t.c * cell + cell - 4} ${t.r * cell + 4})"><circle r="${cell * 0.2}"/><text dy="0.35em">−${it.dan}</text></g>` : '');
          }).join('');
      } else stI.innerHTML = '';
    }
    el.addEventListener('click', (ev) => {
      const c = ev.target.closest('.cella'); if (c) return muovi(+c.dataset.c, +c.dataset.r);
      const t = ev.target.closest('.tok'); if (!t) return;
      const x = [...S.eroi, ...S.nemici].find((y) => y.id === t.dataset.id);
      if (x.eroe) seleziona(x.id); else attacca(x.id);
    });
    new ResizeObserver(disegna).observe(el);
    ascolta.push(disegna);
    disegna();
  }

  // ---------------------------------------------------------------- pezzi
  const pips = (n, max, cls) => Array.from({ length: max }, (_, i) => `<i class="pip p-${cls}${i < n ? ' pieno' : ''}"></i>`).join('');
  const campane = () => Array.from({ length: S.cantoMax }, (_, i) => `<i class="campana${i < S.canto ? ' suona' : ''}${S.soglie.includes(i + 1) ? ' soglia' : ''}"></i>`).join('');
  // icone disegnate a mano: poche linee, leggibili a 20px
  const IC = {
    muovi: '<path d="M8 20l3-8-3-3 2-5h4l3 5-3 3 1 8" /><circle cx="12" cy="3" r="1.5"/>',
    attacca: '<path d="M4 20l8-8M14 4l6 0 0 6-9 9-6-6z"/>',
    cerca: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>',
    abilita: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
    oggetto: '<path d="M9 3h6v4l3 3v10H6V10l3-3z"/><path d="M9 7h6"/>',
    fine: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu: '<path d="M9 3h6M8 6h8l-1 3H9zM7 9h10v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M12 13v4"/>',
    campana: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
    suoni: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
    cuore: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  };
  const icona = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

  // lo stato delle azioni dell'eroe attivo, per chi disegna una barra
  function azioni() {
    const e = att(); const eroi = S.fase === 'eroi';
    const mosse = Object.keys(raggiungibili(e)).length;
    return [
      { id: 'muovi', nome: 'Muovi', ok: eroi && mosse > 0, fatto: e.mosso, nota: e.mosso ? 'già mosso' : mosse ? `fino a ${e.mov}` : 'bloccato' },
      { id: 'attacca', nome: 'Attacca', ok: eroi && bersagli(e).length > 0, fatto: e.attaccato, nota: bersagli(e).length ? `${bersagli(e).length} a tiro` : 'nessuno vicino' },
      { id: 'cerca', nome: 'Cerca', ok: eroi && restano(e) > 0 && !e.cercato, fatto: e.cercato, nota: 'la stanza' },
      { id: 'abilita', nome: e.ab, ok: eroi && restano(e) > 0 && e.car > 0, fatto: false, nota: `${e.car}/${e.carMax} cariche` },
      { id: 'oggetto', nome: 'Oggetto', ok: false, fatto: false, nota: 'nessuno' },
    ];
  }
  function premi(id) {
    if (id === 'muovi' || id === 'attacca') { S.modo = S.modo === id ? null : id; agg(); return; }
    if (id === 'cerca') return cerca();
    if (id === 'abilita') return abilita();
    if (id === 'fine') return fine();
  }
  // una frase sola che dice cosa si puo' fare adesso — al posto del muro di
  // istruzioni: il suggerimento cambia con quel che e' selezionato
  function suggerimento() {
    if (S.fase === 'nemici') return 'Agisce la notte…';
    const e = att();
    if (S.modo === 'muovi') return 'Tocca una casella turchese. Quella dorata apre una stanza.';
    if (S.modo === 'attacca') return 'Tocca un nemico cerchiato di rosso.';
    if (restano(e) <= 0) return `${e.nome} ha finito le azioni.`;
    return `Tocca a ${e.nome}: ${restano(e)} ${restano(e) === 1 ? 'azione' : 'azioni'}.`;
  }

  window.SPED = { S, art, tessera, esc, plancia, ascolta, agg, seleziona, muovi, attacca, cerca, abilita, fine, premi,
    azioni, suggerimento, intento, nemiciVivi, restano, raggiungibili, bersagli, pips, campane, icona, att };
})();
