/* IL MONDO DELL'EPISODIO 1, per i mockup delle tessere.
   Le sei stanze vere (uscite, arredi, testi, arte) da /data/ep1.json, messe
   dove stanno nel gioco. Regole minime per provare la plancia col dito:
   si tocca un eroe, si tocca una casella; tra una stanza e l'altra si passa
   solo dalle porte, e una porta verso il buio rivela la stanza. «Nuovo round»
   ridà il movimento e fa salire il canto. Niente combattimento: qui si
   guarda la mappa. */
(function () {
  const A = (p) => '/assets/' + encodeURI(p);
  const art = (f) => A('artworks/' + f);
  const urlTessera = (id) => A('Episodio 1/board/' + id + '.png');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const key = (c, r) => c + ',' + r;
  const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const POS = { T6: [1, 0], T5: [1, 1], T4: [0, 2], T2: [1, 2], T3: [2, 2], T1: [1, 3] };
  const PORTA = { N: [1, 0], S: [1, 3], E: [3, 1], O: [0, 1] };
  const COLS = 12, ROWS = 16;

  const M = {
    COLS, ROWS, art, urlTessera, esc, key,
    stanze: {}, eroi: [], nemici: [], attivo: 0, round: 1, canto: 2, cantoMax: 12,
    traccia: [], eventi: [], ultimo: null,
  };
  const ascolta = [];
  M.on = (f) => ascolta.push(f);
  M.agg = () => ascolta.forEach((f) => f(M));

  function costruisci(d) {
    for (const t of d.tessere) {
      const [X, Y] = POS[t.id];
      const s = { id: t.id, nome: t.nome.charAt(0) + t.nome.slice(1).toLowerCase(), testo: t.testo, arte: art(t.arte),
        tessera: urlTessera(t.id), X, Y, rivelata: t.id === 'T1', arredi: {}, porte: {} };
      for (const [x, y, nome] of t.arredi || []) s.arredi[key(X * 4 + x, Y * 4 + (3 - y))] = nome;
      for (const [dir, raw] of Object.entries(t.exits || {})) {
        const verso = (raw.match(/T\d+/) || [])[0]; const [lx, ly] = PORTA[dir];
        s.porte[key(X * 4 + lx, Y * 4 + ly)] = { verso, dir, grata: /grata/i.test(raw) };
      }
      M.stanze[t.id] = s;
    }
    const e = (id, nome, file, c, r) => ({ id, nome, art: art(file), c, r, mov: 4, mosso: false, eroe: true });
    M.eroi = [e('elena', 'Elena', 'Elena.png', 5, 14), e('attilio', 'Attilio', 'Attilio.png', 6, 14),
      e('sibilla', 'Sibilla', 'Sibilla.png', 5, 15), e('nino', 'Nino', 'Nino.png', 6, 15)];
    // come al tavolo: si parte dalla banchina, tutto il resto e' coperto, e un
    // nemico non esiste finche' non si svela la sua stanza
    M.nemici = [];
    M.traccia = M.eroi.map((x) => [[x.c, x.r]]);
    dillo('T1', 'Banchina d’ingresso', d.tessere[0].testo);
    return M;
  }
  // chi compare quando una stanza si apre
  const ASPETTANO = {
    T2: [{ id: 'adepto', nome: 'Adepto incappucciato', file: 'Adepto Incappucciato.png', c: 7, r: 8 },
      { id: 'cane', nome: 'Cane dei moli', file: 'Cani dei Moli.png', c: 4, r: 8 }],
    T3: [{ id: 'adepto2', nome: 'Adepto delle candele', file: 'Adepto Incappucciato.png', c: 10, r: 10 }],
    T6: [{ id: 'custode', nome: 'Il Custode della cera', file: 'Il Custode della Cera (boss).png', c: 5, r: 2, boss: true }],
  };

  const stanzaDi = (c, r) => Object.values(M.stanze).find((s) => c >= s.X * 4 && c < s.X * 4 + 4 && r >= s.Y * 4 && r < s.Y * 4 + 4);
  M.stanzaDi = stanzaDi;
  M.rivelate = () => Object.values(M.stanze).filter((s) => s.rivelata);
  // le stanze coperte che hanno una porta verso una rivelata: si disegnano
  // come buio che aspetta, le altre non esistono ancora
  M.frontiera = () => Object.values(M.stanze).filter((s) => !s.rivelata &&
    M.rivelate().some((r) => Object.values(r.porte).some((p) => p.verso === s.id)));
  const chi = (c, r) => M.eroi.find((e) => e.c === c && e.r === r) || M.nemici.find((n) => n.c === c && n.r === r);
  M.chi = chi;
  M.att = () => M.eroi[M.attivo];

  // si passa da una stanza all'altra solo porta-contro-porta
  function vicini(c, r) {
    const out = []; const s = stanzaDi(c, r);
    for (const [dc, dr] of DIR) {
      const nc = c + dc, nr = r + dr; const t = stanzaDi(nc, nr);
      if (!t) continue;
      if (t === s) { out.push([nc, nr, t]); continue; }
      const p = s.porte[key(c, r)], q = t.porte[key(nc, nr)];
      if (p && q && p.verso === t.id && q.verso === s.id) out.push([nc, nr, t]);
    }
    return out;
  }
  M.vicini = vicini;     // regole.js: l'adiacenza del combattimento passa dalle porte come il passo
  M.raggiungibili = (e = M.att()) => {
    const out = {}; if (!e || e.mosso) return out;
    const q = [[e.c, e.r, 0]]; const seen = new Set([key(e.c, e.r)]);
    while (q.length) {
      const [c, r, d] = q.shift();
      if (d >= e.mov) continue;
      for (const [nc, nr, t] of vicini(c, r)) {
        const k = key(nc, nr); if (seen.has(k)) continue; seen.add(k);
        if (!t.rivelata) { out[k] = { c: nc, r: nr, rivela: t.id }; continue; }
        if (t.arredi[k]) continue;
        const o = chi(nc, nr); if (o && !o.eroe) continue;
        if (!o) out[k] = { c: nc, r: nr, passi: d + 1 };
        q.push([nc, nr, d + 1]);
      }
    }
    return out;
  };
  // il cammino fino a una casella, per chi vuole animarlo o disegnarlo
  M.cammino = (e, c, r) => {
    const prev = { [key(e.c, e.r)]: null }; const q = [[e.c, e.r]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === c && y === r) break;
      for (const [nc, nr, t] of vicini(x, y)) {
        const k = key(nc, nr); if (k in prev) continue;
        if (t.rivelata && t.arredi[k]) continue;
        if (!t.rivelata && !(nc === c && nr === r)) continue;
        const o = chi(nc, nr); if (o && !o.eroe) continue;
        prev[k] = key(x, y); q.push([nc, nr]);
      }
    }
    const p = []; let k = key(c, r);
    while (k && prev[k] !== undefined) { p.unshift(k.split(',').map(Number)); k = prev[k]; }
    p.shift();   // la casella di partenza
    return p;
  };

  function dillo(stanza, titolo, testo, tono) {
    M.ultimo = { stanza, titolo, testo, tono: tono || '', t: Date.now() };
  }
  M.seleziona = (id) => { const i = M.eroi.findIndex((e) => e.id === id); if (i >= 0) { M.attivo = i; M.agg(); } };
  M.muovi = (c, r) => {
    const e = M.att(); const v = M.raggiungibili(e)[key(c, r)]; if (!v) return;
    const passi = M.cammino(e, c, r);
    e.c = c; e.r = r; e.mosso = true;
    M.traccia[M.attivo].push(...passi);
    if (v.rivela) {
      const s = M.stanze[v.rivela]; s.rivelata = true;
      for (const n of ASPETTANO[s.id] || []) M.nemici.push({ ...n, art: art(n.file) });
      M.eventi.push({ tipo: 'rivela', stanza: s.id, t: Date.now() });
      dillo(s.id, s.nome, s.testo, ASPETTANO[s.id] ? 'male' : '');
    } else {
      dillo(null, `${e.nome} si sposta`, `${passi.length} ${passi.length === 1 ? 'passo' : 'passi'}.`);
    }
    const prossimo = M.eroi.findIndex((x) => !x.mosso);
    if (prossimo >= 0) M.attivo = prossimo;
    M.agg();
  };
  M.nuovoRound = () => {
    M.round++; M.canto = Math.min(M.cantoMax, M.canto + 1);
    M.eroi.forEach((e) => (e.mosso = false)); M.attivo = 0;
    dillo(null, `Round ${M.round}`, `Il canto sale a ${M.canto}.`, 'male');
    M.agg();
  };

  // --------------------------------------------------------- il minimo di HUD
  // la stessa striscia in fondo a tutti e quattro: chi muove, cosa e' successo,
  // il round. La plancia e' la protagonista, il resto sta zitto.
  M.hud = (el) => {
    el.classList.add('hud');
    const disegna = () => {
      const u = M.ultimo;
      el.innerHTML = `<div class="hud-eroi">${M.eroi.map((e, i) => `<button class="hud-r${i === M.attivo ? ' on' : ''}${e.mosso ? ' mosso' : ''}" data-eroe="${e.id}" title="${esc(e.nome)}">
          <img src="${e.art}" alt=""></button>`).join('')}</div>
        <div class="hud-testo">${u ? `<b class="${u.tono === 'male' ? 'male' : ''}">${esc(u.titolo)}</b> <span>${esc(u.testo)}</span>` : ''}</div>
        <div class="hud-canto"><span>canto <b>${M.canto}</b>/${M.cantoMax}</span><button class="hud-btn" data-nuovo>nuovo round →</button></div>`;
    };
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-eroe]'); if (b) return M.seleziona(b.dataset.eroe);
      if (ev.target.closest('[data-nuovo]')) M.nuovoRound();
    });
    M.on(disegna); disegna();
  };

  // sul telefono si inquadra solo quel che e' aperto: il buio intorno si
  // intuisce dal bordo, e la mappa resta grande abbastanza da toccarla
  M.stretto = () => matchMedia('(max-width: 720px)').matches;

  M.pronto = fetch('/data/ep1.json').then((r) => r.json()).then(costruisci);
  window.MONDO = M;
})();
