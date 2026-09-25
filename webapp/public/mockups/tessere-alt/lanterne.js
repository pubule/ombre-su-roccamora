/* LA PLANCIA A LANTERNE, montabile in qualunque riquadro.
   Estratta da 1-lanterne.html perche' la usi anche la Spedizione completa
   (5-spedizione.html): stanze composte coi pezzi FA, buio e calore su canvas
   a un quarto, gettoni che scivolano. Legge e comanda il mondo (mondo.js).

   LANTERNE.monta(riquadro) -> { inquadra(), evidenzia(id|null) } */
(function () {
  const M = MONDO;
  const cell = 80;
  const FA = (n) => `fa/${n}.png`;
  const PAVIMENTO = { T1: 'pav-assi', T2: 'pav-tavolato', T3: 'pav-navata', T4: 'pav-mattonelle', T5: 'pav-pietra', T6: 'pav-pietra-2' };
  // FUORI dalla banchina c'e' l'acqua: la stessa regola del generatore (FUORI_DI)
  const ACQUA = [[0, 3], [2, 3]];
  // il minuto che racconta la stanza: [pezzo, x, y (centro, in caselle), lato, rotazione, luce]
  const DECORI = {
    T1: [['corda', .55, 1.35, .7, 20], ['barile', 3.45, 1.3, .75, 0], ['pozza', 2.4, 2.55, 1.1, 30], ['ragnatela', 3.62, 3.62, .8, 180],
      ['torcia', .22, 2.5, .8, 90, 'torcia'], ['torcia', 3.78, 2.5, .8, -90, 'torcia']],
    T2: [['sacco', .45, 3.5, .7, 10], ['barile', 3.5, 3.5, .75, 0], ['ragnatela', .38, .38, .9, 0], ['corda', 2.6, 3.4, .7, -30],
      ['sacco', 3.5, 2.6, .6, 60], ['torcia', 3.5, .22, .8, 180, 'torcia']],
    T3: [['candele-nere', 1.5, .45, .8, 0, 'cera'], ['candele-nere-2', 2.5, .5, .8, 90, 'cera'], ['candele-nere-3', 1.5, 3.5, .8, 180, 'cera'],
      ['candele-nere', 2.6, 3.5, .8, 270, 'cera'], ['candele-nere-2', 3.55, 1.6, .7, 45, 'cera'], ['sangue', 2.1, 2.2, .9, 0],
      ['teschio', 3.5, 2.5, .6, 0, 'cera']],
    T4: [['catene', 3.7, 1.5, .8, -90], ['ragnatela', .38, 3.62, .9, 90], ['sacco', .5, .5, .6, 0], ['teschio', 1.6, .45, .5, 0, 'cera']],
    T5: [['ragnatela', .38, .38, .9, 0], ['ragnatela', 3.62, .38, .9, -90], ['pozza', .6, 3.3, .9, 0]],
    T6: [['ossa', .95, 2.95, 1.4, 20], ['catene', 3.7, 2.5, .8, -90], ['sangue', 2, 2.9, .9, 40], ['teschio', .5, .5, .6, 0, 'cera'],
      ['candele-nere-3', 1.5, 2.4, .7, 0, 'cera'], ['candele-nere', 2.5, 2.4, .7, 0, 'cera'], ['ragnatela', 3.62, 3.62, .9, 180]],
  };
  const LATO_ROT = { S: 0, N: 180, O: 90, E: -90 };
  const px = (v) => v * cell;

  function stanzaHtml(s) {
    const X = s.X * 4, Y = s.Y * 4; let h = '';
    h += `<div class="pav" style="left:${px(X)}px;top:${px(Y)}px;width:${px(4)}px;height:${px(4)}px;background-image:url('${FA(PAVIMENTO[s.id])}')"></div>`;
    for (const [n, x, y, l, rot, luce] of DECORI[s.id] || [])
      h += `<div class="pezzo-fa ${luce ? 'fiamma' : 'decoro'}" style="left:${px(X + x - l / 2)}px;top:${px(Y + y - l / 2)}px;width:${px(l)}px;height:${px(l)}px;transform:rotate(${rot}deg);background-image:url('${FA(n)}')"></div>`;
    // gli arredi dei dati, dall'alto; due caselle affiancate uguali sono un pezzo solo
    const fatti = new Set();
    for (const [k, nome] of Object.entries(s.arredi)) {
      if (fatti.has(k)) continue;
      const [c, r] = k.split(',').map(Number);
      if (/scala/i.test(nome)) {      // la scalinata di pietra 2x2 del kit modulare
        const cs = Object.keys(s.arredi).filter((q) => /scala/i.test(s.arredi[q])).map((q) => q.split(',').map(Number));
        cs.forEach(([a, b]) => fatti.add(`${a},${b}`));
        const c0 = Math.min(...cs.map((q) => q[0])), r0 = Math.min(...cs.map((q) => q[1]));
        h += `<div class="pezzo-fa ombra" style="left:${px(c0)}px;top:${px(r0)}px;width:${px(2)}px;height:${px(2)}px;background-image:url('${FA('scale')}')"></div>`;
        continue;
      }
      const largo = s.arredi[`${c + 1},${r}`] === nome; fatti.add(k); if (largo) fatti.add(`${c + 1},${r}`);
      const chiave = ['casse', 'candele', 'molo', 'altare', 'cella', 'scrivania', 'branda'].find((x) => new RegExp(x, 'i').test(nome));
      if (!chiave) continue;
      const v = (c * 7 + r * 13) % 3;
      h += `<div class="pezzo-fa ${chiave === 'candele' ? 'fiamma' : 'ombra'}" style="left:${px(c + .06)}px;top:${px(r + .06)}px;width:${px((largo ? 2 : 1) - .12)}px;height:${px(.88)}px;background-image:url('${FA(chiave + (v ? '-' + (v + 1) : ''))}')"></div>`;
    }
    // i muri: un tratto per casella di bordo, centrato sul bordo e girato verso
    // la stanza; dove c'e' un'uscita, la porta (o la grata)
    const lati = { N: (i) => [X + i + .5, Y], S: (i) => [X + i + .5, Y + 4], O: (i) => [X, Y + i + .5], E: (i) => [X + 4, Y + i + .5] };
    const locale = { N: (i) => [X + i, Y], S: (i) => [X + i, Y + 3], O: (i) => [X, Y + i], E: (i) => [X + 3, Y + i] };
    for (const lato of ['N', 'S', 'O', 'E']) for (let i = 0; i < 4; i++) {
      const [cx, cy] = lati[lato](i); const [lc, lr] = locale[lato](i);
      const porta = s.porte[`${lc},${lr}`];
      const rot = LATO_ROT[lato];
      if (porta && porta.dir === lato) {
        const t = M.stanze[porta.verso];
        if (t && t.rivelata && t.id < s.id) continue;      // la porta fra due stanze aperte la disegna una sola
        const pezzo = porta.grata && !(t && t.rivelata) ? 'grata' : 'porta';
        const aperta = t && t.rivelata;
        h += `<div class="pezzo-fa ombra" style="left:${px(cx - .5)}px;top:${px(cy - .5)}px;width:${px(1)}px;height:${px(1)}px;
          transform:rotate(${rot + (aperta ? 80 : 0)}deg) ${aperta ? `translate(${px(.42)}px, 0)` : ''} scale(1.45);opacity:${aperta ? .8 : 1};filter:brightness(1.35) drop-shadow(0 0 3px #000);background-image:url('${FA(pezzo)}')"></div>`;
        continue;
      }
      h += `<div class="pezzo-fa" style="left:${px(cx - .5)}px;top:${px(cy - 1)}px;width:${px(1)}px;height:${px(2)}px;transform:rotate(${rot}deg);background-image:url('${FA(i % 2 ? 'muro-b' : 'muro-a')}')"></div>`;
    }
    for (const [ax, ay] of [[X, Y], [X + 4, Y], [X, Y + 4], [X + 4, Y + 4]])
      h += `<div class="pezzo-fa" style="left:${px(ax - .32)}px;top:${px(ay - .32)}px;width:${px(.64)}px;height:${px(.64)}px;background-image:url('${FA('pilastro')}')"></div>`;
    return h;
  }

  function monta(riquadro) {
    riquadro.classList.add('plancia-l');
    riquadro.insertAdjacentHTML('beforeend', '<div class="mondo"><div class="l-stanze"></div><canvas class="calore"></canvas><div class="l-tok"></div><canvas class="buio"></canvas><div class="l-sopra"></div><div class="l-celle"></div></div>');
    const mondo = riquadro.querySelector('.mondo'), q = (c) => mondo.querySelector(c);
    const toks = {}, luci = {};
    let visti = new Set(M.rivelate().map((s) => s.id)), indicato = null;

    function inquadra() {
      const W = riquadro.clientWidth, H = riquadro.clientHeight; if (!W || !H) return;
      // sul telefono si inquadrano le stanze aperte PIU' una casella per lato:
      // la casella dorata che apre la stanza accanto sta appena oltre la
      // porta, e senza questo margine resta fuori dallo schermo, intoccabile
      const stretto = M.stretto(), m = stretto ? 1 : 0;
      const rs = stretto ? M.rivelate() : [...M.rivelate(), ...M.frontiera()];
      const x0 = Math.min(...rs.map((s) => s.X)) * 4 - m, x1 = (Math.max(...rs.map((s) => s.X)) + 1) * 4 + m;
      const y0 = Math.min(...rs.map((s) => s.Y)) * 4 - m, y1 = (Math.max(...rs.map((s) => s.Y)) + 1) * 4 + m;
      const k = Math.min(W / ((x1 - x0) * cell), H / ((y1 - y0) * cell)) * .94;
      const ox = (W - (x1 - x0) * cell * k) / 2 - x0 * cell * k, oy = (H - (y1 - y0) * cell * k) / 2 - y0 * cell * k;
      mondo.style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
    }

    // il buio: tutto nero, le luci lo bucano (destination-out); il calore: le
    // stesse luci sommate (lighter) in arancio, a bassa opacita'
    const Q = 4, buio = q('canvas.buio'), calore = q('canvas.calore');
    const gB = buio.getContext('2d'), gC = calore.getContext('2d');
    const RAGGIO = { candela: 1.3, torcia: 1.9, cera: .95 };
    const TINTE = { lanterna: [255, 179, 92], torcia: [255, 170, 80], cera: [255, 207, 122], candela: [255, 207, 122] };
    const raggio = (L, base) => (RAGGIO[L.tipo] ? cell * RAGGIO[L.tipo] : base);
    function allineaLuci() {
      const W = M.COLS * cell, H = M.ROWS * cell;
      for (const c of [buio, calore]) { c.width = Math.ceil(W / Q); c.height = Math.ceil(H / Q); c.style.width = W + 'px'; c.style.height = H + 'px'; }
    }

    function disegna() {
      const W = M.COLS * cell, H = M.ROWS * cell;
      mondo.style.setProperty('--cell', cell + 'px');
      mondo.style.width = W + 'px'; mondo.style.height = H + 'px';
      const acqua = M.stanze.T1.rivelata ? ACQUA.map(([x, y]) => `<div class="pav acqua" style="left:${x * 4 * cell}px;top:${y * 4 * cell}px;width:${4 * cell}px;height:${4 * cell}px"><div class="onda" style="background-image:url('${FA('pav-acqua')}')"></div></div>`).join('') : '';
      q('.l-stanze').innerHTML = acqua + M.rivelate().map((s) => `<div class="stanza${visti.has(s.id) ? '' : ' lampo'}" data-s="${s.id}">${stanzaHtml(s)}</div>`).join('');
      visti = new Set(M.rivelate().map((s) => s.id));
      // la luce sotto le porte chiuse, e il nome delle stanze
      let sopra = '';
      for (const s of M.rivelate()) for (const [k, p] of Object.entries(s.porte)) {
        const t = M.stanze[p.verso]; if (!t || t.rivelata) continue;
        const [c, r] = k.split(',').map(Number);
        const dx = { E: 1, O: -1 }[p.dir] || 0, dy = { S: 1, N: -1 }[p.dir] || 0;
        const cx = (c + .5 + dx * .5) * cell, cy = (r + .5 + dy * .5) * cell;
        const w = dx ? cell * .5 : cell * 1.1, h = dx ? cell * 1.1 : cell * .5;
        sopra += `<div class="fessura${t.id === 'T3' ? ' forte' : ''}" style="left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px"></div>`;
      }
      for (const s of M.rivelate()) sopra += `<span class="nome-stanza" style="left:${s.X * 4 * cell + 8}px;top:${s.Y * 4 * cell + 6}px">${M.esc(s.nome)}</span>`;
      q('.l-sopra').innerHTML = sopra;
      // caselle: muovere (turchese), svelare (oro), colpire (rosso, sotto il nemico)
      const ragg = Object.values(M.raggiungibili());
      const colpi = M.bersagli ? M.bersagli() : [];
      q('.l-celle').innerHTML = ragg.map((v) => `<button class="cella${v.rivela ? ' rivela' : ''}" data-c="${v.c}" data-r="${v.r}"
        style="left:${v.c * cell}px;top:${v.r * cell}px;width:${cell}px;height:${cell}px" aria-label="muovi qui"></button>`).join('') +
        colpi.map((n) => `<button class="cella colpo" data-colpo="${n.id}" style="left:${n.c * cell}px;top:${n.r * cell}px;width:${cell}px;height:${cell}px" aria-label="attacca ${M.esc(n.nome)}"></button>`).join('');
      // gettoni: stessi nodi da un disegno all'altro, cosi' scivolano
      const vivi = new Set();
      for (const x of [...M.eroi, ...M.nemici]) {
        if (!x.eroe && x.hp != null && x.hp <= 0) continue;
        vivi.add(x.id);
        if (!toks[x.id]) {
          const t = document.createElement('button');
          t.innerHTML = `<img src="${x.art}" alt=""><b class="pv"></b>`; t.dataset.id = x.id; q('.l-tok').appendChild(t);
          toks[x.id] = { el: t, x: x.c, y: x.r };
        }
        const tk = toks[x.id]; tk.tx = x.c; tk.ty = x.r;
        tk.el.className = `tok${x.eroe ? '' : ' nemico'}${x.boss ? ' boss' : ''}${x === M.att() && M.fase !== 'nemici' ? ' on' : ''}${
          M.agisce === x.id ? ' agisce' : ''}${indicato === x.id ? ' indicato' : ''}${x.hp === 0 ? ' giu' : ''}${M.colpito === x.id ? ' colpito' : ''}`;
        const pv = tk.el.querySelector('.pv');
        // la salute sul gettone, se il mondo la conosce (nella pagina completa si)
        pv.style.display = x.hp == null ? 'none' : '';
        if (x.hp != null) { pv.textContent = x.hp; pv.className = `pv${x.hp > 0 && x.hp / x.max <= 1 / 3 ? ' grave' : ''}`; }
        if (x.eroe) luci[x.id] = Object.assign(luci[x.id] || { x: x.c, y: x.r, tipo: 'lanterna' }, { tx: x.c, ty: x.r });
      }
      for (const id of Object.keys(toks)) if (!vivi.has(id)) { toks[id].el.remove(); delete toks[id]; }
      for (const st of M.rivelate()) (DECORI[st.id] || []).forEach(([, x, y, , , luce], i) => {
        if (!luce) return; const id = `dec-${st.id}-${i}`;
        luci[id] = luci[id] || { x: st.X * 4 + x - .5, y: st.Y * 4 + y - .5, tx: st.X * 4 + x - .5, ty: st.Y * 4 + y - .5, tipo: luce };
      });
      for (const s of M.rivelate()) for (const [k, nome] of Object.entries(s.arredi)) if (/candele/i.test(nome)) {
        const [c, r] = k.split(',').map(Number);
        luci['cand' + k] = luci['cand' + k] || { x: c, y: r, tx: c, ty: r, tipo: 'candela' };
      }
      allineaLuci();
      inquadra();
    }

    let t0 = performance.now();
    function ciclo(now) {
      const dt = Math.min(50, now - t0) / 1000; t0 = now;
      const k = Math.min(1, dt * 7);
      for (const tk of Object.values(toks)) { tk.x += (tk.tx - tk.x) * k; tk.y += (tk.ty - tk.y) * k; }
      for (const L of Object.values(luci)) { L.x += (L.tx - L.x) * k; L.y += (L.ty - L.y) * k; }
      const base = cell * (2.8 - M.canto * .11);
      const fiamma = (id, qq) => 1 + Math.sin(now / 90 + id.length * 7 + qq) * .025 + Math.sin(now / 37 + qq * 3) * .02;
      const w = buio.width, h = buio.height;
      gB.globalCompositeOperation = 'source-over'; gB.fillStyle = 'rgba(2,3,4,.95)'; gB.fillRect(0, 0, w, h);
      gB.globalCompositeOperation = 'destination-out';
      gC.globalCompositeOperation = 'source-over'; gC.clearRect(0, 0, w, h); gC.globalCompositeOperation = 'lighter';
      for (const [id, L] of Object.entries(luci)) {
        const r = raggio(L, base) * fiamma(id, L.tx + L.ty) / Q;
        const cx = (L.x + .5) * cell / Q, cy = (L.y + .5) * cell / Q;
        const g = gB.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.4, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        gB.fillStyle = g; gB.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        const [R, G, B] = TINTE[L.tipo] || TINTE.cera;
        const c = gC.createRadialGradient(cx, cy, 0, cx, cy, r * .9);
        c.addColorStop(0, `rgba(${R},${G},${B},.9)`); c.addColorStop(1, `rgba(${R},${G - 60},${B - 60},0)`);
        gC.fillStyle = c; gC.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      }
      for (const tk of Object.values(toks)) {
        const fermo = Math.abs(tk.tx - tk.x) < .002 && Math.abs(tk.ty - tk.y) < .002;
        if (fermo && tk.posato) continue;
        const sz = cell * .84, o = (cell - sz) / 2;
        tk.el.style.transform = `translate(${tk.x * cell + o}px, ${tk.y * cell + o}px)`;
        tk.el.style.width = tk.el.style.height = sz + 'px';
        tk.posato = fermo;
      }
      requestAnimationFrame(ciclo);
    }

    mondo.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-colpo]'); if (b) return M.attacca(b.dataset.colpo);
      const c = ev.target.closest('.cella'); if (c) return M.muovi(+c.dataset.c, +c.dataset.r);
      const t = ev.target.closest('.tok'); if (!t) return;
      if (M.bersagli && M.bersagli().some((n) => n.id === t.dataset.id)) return M.attacca(t.dataset.id);
      M.seleziona(t.dataset.id);
    });
    M.on(disegna); new ResizeObserver(inquadra).observe(riquadro);
    disegna(); requestAnimationFrame(ciclo);
    return {
      inquadra,
      evidenzia(id) { indicato = id; for (const [k, tk] of Object.entries(toks)) tk.el.classList.toggle('indicato', k === id); },
    };
  }

  window.LANTERNE = { monta };
})();
