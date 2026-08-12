/* I PEZZI DELLA VISTA EROE, condivisi dalle tre direzioni.
   Nessuna logica di gioco: sono gli stessi dati veri di `dati.js` (Comune +
   Episodio 1) messi in HTML. Le tre direzioni li compongono in ordini diversi,
   ed e' quello che c'e' da giudicare. */
(function () {
  const { S, esc, urlArt, urlTessera } = MOCK;

  // Chi sono io su questo telefono. Elena e' il caso normale: un giocatore, un
  // eroe. Gli altri li muove chi ha il loro telefono (o l'arbitro).
  const IO = S.party.find((e) => e.nome === 'ELENA FOSCO');
  const ALTRO = S.party.find((e) => e.breve === 'attilio');

  const pips = (on, max, cls) => `<span class="pips ${cls || ''}">${
    Array.from({ length: max }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>`;

  // ---- la testa: episodio, round, Canto ----
  const testa = () => `
<div class="testa">
  <div class="ep">${esc(S.ep.titolo.toLowerCase())}
    <small>round ${S.round} · ore ${S.ora}:00</small></div>
  <div class="canto"><span class="lab">canto</span>
    ${Array.from({ length: S.soglia }, (_, i) => `<i class="${i < S.canto ? 'on' : ''}"></i>`).join('')}</div>
</div>`;

  // ---- LA FASCIA DEL TURNO ----
  // Su un telefono tenuto in mano fra una chiacchiera e l'altra, «tocca a me?»
  // e' la domanda da risolvere in mezzo secondo: per questo e' una fascia
  // larga e colorata, non una scritta in un angolo.
  const turno = () => `
<div class="turno">
  <span class="solo-mio">tocca a te — 2 azioni</span>
  <span class="solo-attesa">sta giocando ${esc(ALTRO.breve)}…</span>
</div>`;

  // ---- la plancia ----
  // COME QUELLA DELL'ARBITRO, non un disegno somigliante. Tre cose sono prese
  // dal motore vero, perche' sbagliarle rende il mockup inutile per decidere:
  //
  //   - la tessera e' 4x4 (`griglia.dentro`), non 5x5;
  //   - `y` cresce verso l'ALTO nel modello e verso il basso a schermo, quindi
  //     a video la riga e' `3 - y` — la stessa formula di `scr()` in digitale.js;
  //   - le tessere stanno una accanto all'altra secondo `griglia.layout()`: per
  //     l'Ep.1 T2 e' a OVEST di T3, non sotto.
  //
  // Le celle accese sono quelle VERE, calcolate con `stat.raggEroe()` per Elena
  // ferma in T3(1,1) — sono 11, dieci dentro T3 e una in T2 oltre la porta O.
  // Erano inventate, e si vedeva: caselle gialle sparse attorno all'eroe che non
  // corrispondevano a nessun cammino. Per rigenerarle:
  //   node -e "import('./webapp/public/motore/stat.js')…raggEroe(g, ELENA)"
  const TESS = ['T2', 'T3'];                       // ordine da layout(): T2 [0,1], T3 [1,1]
  const COL = TESS.length * 4;                     // 8 colonne di celle
  const RIG = 4;
  const cel = (t, x, y) => ({ c: TESS.indexOf(t) * 4 + x, r: 3 - y });   // come scr()

  const IO_POS = { t: 'T3', x: 1, y: 1 };
  const TOK = [
    { cls: 'io', art: IO.art, ...IO_POS },
    { cls: '', art: ALTRO.art, t: 'T3', x: 2, y: 0 },
    { cls: '', art: 'Ottone.png', t: 'T2', x: 1, y: 2 },
    { cls: 'nem', art: 'Adepto Incappucciato.png', t: 'T3', x: 3, y: 1 },
    { cls: 'nem boss', art: 'Il Custode della Cera (boss).png', t: 'T2', x: 0, y: 3 },
  ];
  const MOSSE = [
    { t: 'T3', x: 2, y: 1 }, { t: 'T3', x: 0, y: 1 }, { t: 'T3', x: 1, y: 2 },
    { t: 'T3', x: 1, y: 0 }, { t: 'T3', x: 3, y: 1 }, { t: 'T3', x: 2, y: 2 },
    { t: 'T3', x: 0, y: 2 }, { t: 'T3', x: 1, y: 3 }, { t: 'T3', x: 3, y: 2 },
    { t: 'T3', x: 2, y: 3 }, { t: 'T2', x: 3, y: 2 },
  ];

  const plancia = (extra) => {
    const perc = (v, tot) => (v * 100 / tot);
    const tessere = TESS.map((id) => {
      const t = S.tessere.find((x) => x.id === id) || { id, nome: id, rivelata: true };
      return `<div class="tess ${t.rivelata ? '' : 'coperta'}">
        <img src="${urlTessera(t)}" alt="">
        <span class="et">${t.id} · ${t.rivelata ? esc((t.nome || '').toLowerCase()) : 'coperta'}</span>
      </div>`;
    }).join('');

    // la griglia sta SOPRA le tessere ed e' unica: le celle non si fermano al
    // bordo di una tessera, e nemmeno il movimento
    const celle = Array.from({ length: COL * RIG }, (_, k) => {
      const c = k % COL; const r = (k / COL) | 0;
      const acc = MOSSE.some((m) => { const p = cel(m.t, m.x, m.y); return p.c === c && p.r === r; });
      return `<div class="cel ${acc ? 'mossa' : ''}"></div>`;
    }).join('');

    const token = TOK.map((k) => {
      const p = cel(k.t, k.x, k.y);
      const w = k.cls.includes('boss') ? 13 : 11;
      const l = perc(p.c, COL) + (100 / COL - w) / 2;
      const t = perc(p.r, RIG) + (100 / RIG - w * COL / RIG) / 2;
      return `<span class="tk ${k.cls}" style="left:${l}%;top:${t}%;width:${w}%;aspect-ratio:1">
        <img src="${urlArt(k.art)}" alt=""></span>`;
    }).join('');

    return `
<div class="plancia">
  <div class="campo">
    <div class="tessere">${tessere}</div>
    <div class="griglia" style="grid-template-columns:repeat(${COL},1fr);grid-template-rows:repeat(${RIG},1fr)">${celle}</div>
    ${token}
  </div>
  ${extra || ''}
</div>`;
  };

  // ---- la mia scheda, compatta ----
  const ioCard = () => `
<div class="io-card">
  <div class="rit"><img src="${urlArt(IO.art)}" alt=""></div>
  <div style="flex:1">
    <div class="nm">${esc(IO.breve)}</div>
    <div class="righe">
      <div class="lin"><span class="lab">salute</span>${pips(IO.sal, IO.salMax)}</div>
      <div class="lin"><span class="lab">${esc(IO.ab.toLowerCase())}</span>${pips(IO.car, IO.carMax, 'car')}</div>
    </div>
  </div>
</div>`;

  // ---- le azioni ----
  // Spente quando non tocca a me: un bottone che il tavolo rifiuterebbe non va
  // offerto — il rifiuto arriverebbe mezzo secondo dopo, e sembrerebbe un guasto.
  const AZ = [
    { n: 'muoviti', co: 'fin dove arrivi' },
    { n: 'attacca', co: 'l’adepto, a 2 caselle' },
    { n: 'cerca', co: 'in questa casella' },
    { n: 'occhio clinico', co: '2 cariche' },
  ];
  const azioni = () => `
<div class="azioni">
  ${AZ.map((a) => `<button class="btn ${a.n === 'muoviti' ? 'pieno' : ''}">
    <span>${a.n}<span class="co"><br>${a.co}</span></span></button>`).join('')}
</div>
<div class="restano solo-mio">restano 2 azioni · poi tocca a ${esc(ALTRO.breve)}</div>
<div class="restano solo-attesa">niente da fare: guarda il tavolo</div>`;

  // ---- gli altri al tavolo ----
  const altri = () => `
<div class="altri">
  <h3>al tavolo</h3>
  <div class="riga-altri">
    ${S.party.map((e) => {
    const io = e.nome === IO.nome;
    const ora = e.breve === ALTRO.breve;
    return `<div class="mini ${e.fatto ? 'fatto' : ''} ${ora ? 'ora' : ''}">
      <div class="rit"><img src="${urlArt(e.art)}" alt=""></div>
      <div class="n">${io ? 'tu' : esc(e.breve)}</div>
      <div class="s">${e.fatto ? 'ha finito' : `${e.sal}/${e.salMax}`}</div>
    </div>`;
  }).join('')}
  </div>
</div>`;

  const obiettivo = () => `<div class="obiett"><b>obiettivo · </b>${esc(S.ep.obiettivo)}</div>`;

  // Le due leve per confrontare i due stati. Non fanno parte del disegno: sono
  // il modo di guardare la stessa schermata quando tocca a te e quando no,
  // che e' la meta' del tempo che un giocatore passa davanti a questo schermo.
  const leve = () => {
    document.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-stato]');
      if (!b) return;
      const t = document.querySelector('.telefono');
      t.classList.toggle('mio', b.dataset.stato === 'mio');
      t.classList.toggle('attesa', b.dataset.stato !== 'mio');
      document.querySelectorAll('[data-stato]').forEach((x) => x.classList.toggle('sel', x === b));
    });
    return `<div class="leve">
      <button class="btn sel" data-stato="mio">tocca a me</button>
      <button class="btn" data-stato="attesa">gioca un altro</button>
      <a class="btn" href="../index.html">← mockup</a></div>`;
  };

  // La plancia si apre CENTRATA SU DI ME. Aperta in un angolo, la prima cosa da
  // fare sarebbe scorrere per trovarsi — e su un telefono, in mezzo a una
  // partita, quello e' esattamente il gesto che fa perdere il filo.
  const centra = () => {
    for (const pl of document.querySelectorAll('.plancia')) {
      const io = pl.querySelector('.tk.io'); if (!io) continue;
      pl.scrollLeft = io.offsetLeft - pl.clientWidth / 2 + io.clientWidth / 2;
      pl.scrollTop = io.offsetTop - pl.clientHeight / 2 + io.clientHeight / 2;
    }
  };

  window.EROE = { IO, ALTRO, pips, testa, turno, plancia, ioCard, azioni, altri, obiettivo, leve, centra };
})();
