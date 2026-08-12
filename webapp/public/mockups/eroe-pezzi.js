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
  // Due tessere affiancate, la griglia sopra, i segnalini alle loro celle.
  // Le caselle raggiungibili si accendono SOLO quando tocca a me: illuminare
  // il cammino di un altro confonde e basta.
  const TOK = [
    { cls: 'io', art: IO.art, t: 0, x: 1, y: 2 },
    { cls: '', art: ALTRO.art, t: 0, x: 2, y: 3 },
    { cls: '', art: 'Ottone.png', t: 1, x: 1, y: 1 },
    { cls: 'nem', art: 'Adepto Incappucciato.png', t: 1, x: 3, y: 2 },
    { cls: 'nem boss', art: 'Il Custode della Cera (boss).png', t: 1, x: 2, y: 4 },
  ];
  const MOSSE = ['1,1', '0,2', '2,2', '1,3', '1,0'];   // celle raggiungibili da Elena, tessera 0

  const plancia = (extra) => {
    const tess = [S.tessere[2], S.tessere[3]];          // T3 rivelata, T4 ancora coperta
    const celle = (i) => Array.from({ length: 25 }, (_, k) => {
      const x = k % 5; const y = (k / 5) | 0;
      const acc = i === 0 && MOSSE.includes(`${x},${y}`);
      return `<div class="cel ${acc ? 'mossa' : ''}"></div>`;
    }).join('');
    return `
<div class="plancia">
  <div class="campo">
  <div class="tessere">
    ${tess.map((t, i) => `
    <div class="tess ${t.rivelata ? '' : 'coperta'}">
      <img src="${urlTessera(t)}" alt="">
      <div class="griglia" style="grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(5,1fr)">${celle(i)}</div>
      <span class="et">${t.id} · ${t.rivelata ? esc(t.nome.toLowerCase()) : 'coperta'}</span>
    </div>`).join('')}
  </div>
  ${TOK.map((k) => {
    // le tessere sono impilate: la seconda comincia a meta' del campo
    const l = k.x * 20 + 2.4;
    const t = k.t * 50 + k.y * 10 + 1.2;
    const w = k.cls.includes('boss') ? 17 : 15;
    return `<span class="tk ${k.cls}" style="left:${l}%;top:${t}%;width:${w}%;aspect-ratio:1">
      <img src="${urlArt(k.art)}" alt=""></span>`;
  }).join('')}
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

  window.EROE = { IO, ALTRO, pips, testa, turno, plancia, ioCard, azioni, altri, obiettivo, leve };
})();
