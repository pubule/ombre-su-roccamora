/* LE REGOLE DELLA SPEDIZIONE, in piccolo, per 5-spedizione.html.
   Si mette SOPRA il mondo (mondo.js) senza cambiarlo per gli altri mockup: i
   numeri sono quelli veri di /data/comune.json (salute, Vigore, Acume,
   Difesa, arma, abilita' in spedizione; Att/Dif/Dan/Mov/ferite dei nemici) e
   dell'episodio (obiettivo, Ruggero nella cella, oggetti, cosa si trova
   cercando in ogni stanza). Non e' il motore: e' abbastanza per vedere se la
   schermata regge una partita vera.

   Due azioni a turno (muovere e' un'azione, una volta per turno); attaccare
   2d6 + Vigore + arma contro la Difesa del nemico; cercare 2d6 + Acume contro
   9 (Media); la notte muove i nemici verso l'eroe piu' vicino e colpisce con
   2d6 + Att contro la Difesa dell'eroe; il canto sale di uno a notte. */
(function () {
  const M = MONDO;
  const AZ = 2, MEDIA = 9;
  const d6 = () => 1 + Math.floor(Math.random() * 6);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  const pulisci = (h) => String(h || '').replace(/<[^>]+>/g, '');
  M.fase = 'eroi'; M.canto = 1; M.cantoMax = 8; M.soglia = 3; M.mazzo = 12;
  M.diario = []; M.tiro = null; M.agisce = null; M.colpito = null;
  const scriviDiario = (testo, tono) => { M.diario.unshift({ testo, tono: tono || '', round: M.round }); M.diario = M.diario.slice(0, 40); };

  M.regole = Promise.all([M.pronto, fetch('/data/comune.json').then((r) => r.json()), fetch('/data/ep1.json').then((r) => r.json())])
    .then(([, com, ep]) => {
      M.comune = com; M.ep = ep;
      for (const t of ep.tessere) Object.assign(M.stanze[t.id], { cerca: t.cerca, cercaVuoto: t.cerca_vuoto, cercata: false });
      M.obiettivo = ep.obiettivo;
      M.scortato = ep.scortato && ep.scortato[0];
      M.oggetti = (ep.oggetti || []).slice(0, 2).map((o) => ({ nome: o.nome, effetto: o.effetto }));
      for (const e of M.eroi) {
        const c = com.eroi.find((x) => x.nome.toUpperCase().includes(e.nome.toUpperCase()));
        const abil = pulisci(c.abil); const i = abil.search(/In spedizione/i);
        // l'abilita' in spedizione: la parte dopo «In spedizione»; se il testo non
        // distingue indagine e spedizione (Nino), vale tutta
        const sped = i >= 0 ? abil.slice(i).replace(/^In spedizione[:,]?\s*/i, '')
          : /In indagine/i.test(abil) ? '' : abil.replace(/^[^—]+—\s*/, '');
        const spedSolo = sped.split(/\s*In indagine/i)[0].trim();   // solo la parte che vale qui
        const volte = /\b(tre|due|una) volt/i.exec(spedSolo);
        const n = volte ? { tre: 3, due: 2, una: 1 }[volte[1].toLowerCase()] : 0;
        Object.assign(e, {
          nomeIntero: c.nome, ruolo: c.ruolo, max: c.salute, hp: c.salute,
          acume: c.acume, vigore: c.vigore, nervi: c.nervi, difesa: c.difesa,
          arma: +((/arma, \+(\d)/.exec(c.equip) || [])[1] || 0), armaNome: (c.equip.split('(')[0] || '').trim(),
          abilNome: (/^([^—]+)—/.exec(abil) || [, ''])[1].trim(), abilTesto: spedSolo || 'Nessun effetto in spedizione.',
          car: n, carMax: n, passiva: !n,
          fatte: 0, mosso: false, attaccato: false, cercato: false, finito: false,
        });
      }
      scriviDiario('La spedizione comincia dalla banchina. Il canto, sotto, non smette.');
      M.agg();
    });

  // i nemici prendono i numeri veri al primo sguardo
  function numeri(n) {
    if (n.max != null || !M.comune) return n;
    const c = M.comune.nemici.find((x) => x.art === n.file) || M.comune.nemici[0];
    return Object.assign(n, { max: c.fer, hp: c.fer, att: c.att, dif: c.dif, dan: c.dan, mov: c.mov, tipo: c.tipo, boss: c.boss });
  }
  const vivi = () => M.nemici.filter((n) => numeri(n).hp > 0);
  M.restano = (e) => AZ - (e.fatte || 0);
  const adiac = (a, b) => M.vicini(a.c, a.r).some(([c, r]) => c === b.c && r === b.r);

  // -------------------------------------------------------------- gli eroi
  const raggOrig = M.raggiungibili;
  M.raggiungibili = (e = M.att()) => (M.fase !== 'eroi' || !e || e.hp <= 0 || e.finito || M.restano(e) <= 0 ? {} : raggOrig(e));
  const muoviOrig = M.muovi;
  M.muovi = (c, r) => {
    const i = M.attivo, e = M.att(); const prima = M.rivelate().length;
    muoviOrig(c, r);
    if (e.c !== c || e.r !== r) return;
    e.fatte++; M.attivo = i;
    if (M.rivelate().length > prima) { const s = M.stanzaDi(c, r); vivi(); scriviDiario(`${e.nome} apre ${s.nome.toLowerCase()}.${M.nemici.some((n) => M.stanzaDi(n.c, n.r) === s) ? ' Non e’ vuota.' : ''}`, 'male'); }
    else scriviDiario(`${e.nome} si sposta.`);
    M.agg();
  };
  M.bersagli = (e = M.att()) => (M.fase !== 'eroi' || !e || e.hp <= 0 || e.attaccato || M.restano(e) <= 0 ? [] : vivi().filter((n) => adiac(e, n)));
  M.puoCercare = (e = M.att()) => M.fase === 'eroi' && e && e.hp > 0 && !e.cercato && M.restano(e) > 0;
  M.puoAbilita = (e = M.att()) => M.fase === 'eroi' && e && e.hp > 0 && !e.passiva && e.car > 0 && M.restano(e) > 0;

  M.attacca = (id) => {
    const e = M.att(); const n = M.bersagli(e).find((x) => x.id === id); if (!n) return;
    const dadi = [d6(), d6()], tot = dadi[0] + dadi[1] + e.vigore + e.arma, colpo = tot >= n.dif;
    e.attaccato = true; e.fatte++;
    if (colpo) { n.hp -= 1; M.colpito = n.id; }
    M.tiro = { cosa: `${e.nome} attacca ${n.nome.toLowerCase()}`, dadi, bonus: [['Vigore', e.vigore], [e.armaNome.toLowerCase() || 'arma', e.arma]],
      tot, soglia: n.dif, nomeSoglia: 'Difesa', esito: colpo ? (n.hp <= 0 ? 'abbattuto' : 'colpito') : 'mancato', buono: colpo };
    scriviDiario(`${e.nome} attacca ${n.nome.toLowerCase()}: ${tot} contro ${n.dif} — ${M.tiro.esito}.`, colpo ? 'bene' : '');
    M.agg(); setTimeout(() => { M.colpito = null; M.agg(); }, 550);
  };
  M.cerca = () => {
    const e = M.att(); if (!M.puoCercare(e)) return;
    const s = M.stanzaDi(e.c, e.r);
    const extra = /cercare/i.test(e.abilTesto) ? +((/\+(\d)/.exec(e.abilTesto) || [])[1] || 0) : 0;
    const dadi = [d6(), d6()], tot = dadi[0] + dadi[1] + e.acume + extra, ok = tot >= MEDIA;
    e.cercato = true; e.fatte++;
    const trovato = s.cercata ? 'Qui avete gia’ cercato: niente di nuovo.' : ok ? (s.cerca || s.cercaVuoto || 'Niente.') : 'Niente, per ora.';
    if (ok && s.cerca && !s.cercata) M.oggetti.push({ nome: s.cerca.split(':')[0], effetto: s.cerca });
    if (ok) s.cercata = true;
    M.tiro = { cosa: `${e.nome} cerca in ${s.nome.toLowerCase()}`, dadi, bonus: [['Acume', e.acume], ...(extra ? [[e.abilNome, extra]] : [])],
      tot, soglia: MEDIA, nomeSoglia: 'prova Media', esito: ok ? 'trovato' : 'niente', buono: ok, testo: trovato };
    scriviDiario(`${e.nome} cerca: ${trovato}`, ok ? 'bene' : '');
    M.agg();
  };
  M.abilita = () => {
    const e = M.att(); if (!M.puoAbilita(e)) return;
    e.car--; e.fatte++;
    if (/cura/i.test(e.abilTesto)) {
      const f = M.eroi.filter((x) => x.hp > 0 && x.hp < x.max && (x === e || adiac(x, e))).sort((a, b) => a.hp - b.hp)[0];
      if (f) { f.hp = Math.min(f.max, f.hp + 2); scriviDiario(`${e.nome}: ${e.abilNome.toLowerCase()} a ${f.nome}, +2 salute.`, 'bene'); }
      else scriviDiario(`${e.nome}: nessuno ferito qui vicino. La carica e’ spesa.`);
    } else scriviDiario(`${e.nome} usa ${e.abilNome.toLowerCase()}: guarda le prime due carte del mazzo, una va in fondo.`);
    M.tiro = null; M.agg();
  };
  M.fine = async () => {
    if (M.fase !== 'eroi') return;
    const e = M.att(); e.finito = true; M.tiro = null;
    const p = M.eroi.findIndex((x) => !x.finito && x.hp > 0);
    if (p >= 0) { M.attivo = p; scriviDiario(`Tocca a ${M.eroi[p].nome}.`); M.agg(); return; }
    await notte();
  };
  const selOrig = M.seleziona;
  M.seleziona = (id) => { const e = M.eroi.find((x) => x.id === id); if (M.fase === 'eroi' && e && !e.finito && e.hp > 0) { selOrig(id); } };

  // ---------------------------------------------------------------- la notte
  // il cammino piu' corto verso una casella accanto all'eroe, dalle porte
  function percorso(n, t) {
    const k = (c, r) => c + ',' + r; const start = k(n.c, n.r);
    if (adiac(n, t)) return [];
    const prev = { [start]: null }; const coda = [[n.c, n.r]];
    const occ = (c, r) => M.eroi.some((e) => e.c === c && e.r === r) || vivi().some((x) => x !== n && x.c === c && x.r === r);
    while (coda.length) {
      const [c, r] = coda.shift();
      for (const [nc, nr, s] of M.vicini(c, r)) {
        const kk = k(nc, nr);
        if (kk in prev || !s.rivelata || s.arredi[kk] || occ(nc, nr)) continue;
        prev[kk] = k(c, r);
        if (adiac({ c: nc, r: nr }, t)) { const p = []; let x = kk; while (x !== start) { p.unshift(x.split(',').map(Number)); x = prev[x]; } return p; }
        coda.push([nc, nr]);
      }
    }
    return null;
  }
  M.intento = (n) => {
    let best = null;
    for (const e of M.eroi.filter((x) => x.hp > 0)) { const p = percorso(n, e); if (p && (!best || p.length < best.p.length)) best = { e, p }; }
    if (!best) return null;
    return { bersaglio: best.e, passi: best.p.slice(0, n.mov), arriva: best.p.length <= n.mov };
  };
  async function notte() {
    M.fase = 'nemici'; M.canto = Math.min(M.cantoMax, M.canto + 1); M.mazzo = Math.max(0, M.mazzo - 1);
    scriviDiario(`La notte reagisce. Il canto sale a ${M.canto}${M.canto === M.soglia ? ': il coro si sveglia' : ''}.`, 'male');
    M.agg(); await pausa(800);
    for (const n of vivi()) {
      const it = M.intento(n); M.agisce = n.id; M.agg(); await pausa(350);
      if (!it) continue;
      for (const [c, r] of it.passi) { n.c = c; n.r = r; M.agg(); await pausa(200); }
      if (it.arriva && adiac(n, it.bersaglio)) {
        const t = it.bersaglio, dadi = [d6(), d6()], tot = dadi[0] + dadi[1] + n.att, colpo = tot >= t.difesa;
        if (colpo) { t.hp = Math.max(0, t.hp - n.dan); M.colpito = t.id; }
        scriviDiario(`${n.nome} ${colpo ? `colpisce ${t.nome}: −${n.dan}.${t.hp === 0 ? ` ${t.nome} e’ a terra.` : ''}` : `manca ${t.nome} (${tot} contro ${t.difesa}).`}`, colpo ? 'male' : '');
        M.agg(); await pausa(700); M.colpito = null;
      }
    }
    M.agisce = null; M.round++; M.fase = 'eroi';
    M.eroi.forEach((e) => Object.assign(e, { fatte: 0, mosso: false, attaccato: false, cercato: false, finito: e.hp <= 0 }));
    M.attivo = Math.max(0, M.eroi.findIndex((e) => !e.finito));
    scriviDiario(`Round ${M.round}. Tocca a ${M.att().nome}.`);
    M.agg();
  }
})();
