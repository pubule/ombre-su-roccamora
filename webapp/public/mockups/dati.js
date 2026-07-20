/* Stato Ep.1 mock condiviso + helper immagine + builder componenti.
   Nessuna logica di gioco: serve solo a popolare i mockup con dati e immagini
   reali (Comune eroi + Episodio 1). Le 3 direzioni compongono questi pezzi in
   layout diversi. */
(function () {
  const A = (p) => '/assets/' + encodeURI(p);
  const urlArt = (art) => A('artworks/' + String(art).replace(/^artworks\//, ''));
  const urlCarta = (file) => {
    const m = /^Episodio (\d+)\//.exec(file);
    if (m) return A('Episodio ' + m[1] + '/cards/' + file.slice(m[0].length) + '.jpg');
    if (file.startsWith('Preludio/')) return A('Preludio/cards/' + file.slice('Preludio/'.length) + '.jpg');
    return A('Comune/cards/' + file + '.jpg');
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- eroi in party (4) ----
  const party = [
    { nome: 'ELENA FOSCO', breve: 'elena', ruolo: 'L’Investigatrice', art: 'Elena.png', carta: 'Eroi/Elena Fosco',
      ac: 3, vi: 1, ne: 2, di: 8, sal: 5, salMax: 6, ab: 'Occhio Clinico', car: 2, carMax: 2 },
    { nome: 'DOTT. ATTILIO MARN', breve: 'attilio', ruolo: 'Il Medico', art: 'Attilio.png', carta: 'Eroi/Dott. Attilio Marn',
      ac: 2, vi: 2, ne: 2, di: 8, sal: 7, salMax: 7, ab: 'Pronto Soccorso', car: 3, carMax: 3, attivo: true },
    { nome: 'NINO “GRIMALDELLO” CAUTO', breve: 'nino', ruolo: 'Il Ladro', art: 'Nino.png', carta: 'Eroi/Nino Grimaldello Cauto',
      ac: 2, vi: 2, ne: 1, di: 9, sal: 4, salMax: 7, ab: 'Grimaldello', car: 1, carMax: 1, fatto: true },
    { nome: 'OTTONE “MEZZENA” MASSARI', breve: 'ottone', ruolo: 'Il Macellaio', art: 'Ottone.png', carta: 'Eroi/Ottone Mezzena Massari',
      ac: 1, vi: 3, ne: 2, di: 8, sal: 8, salMax: 8, ab: 'Colpo da macello', car: null, carMax: null },
  ];

  // ---- nemici in campo (3) ----
  const nemici = [
    { nome: 'ADEPTO INCAPPUCCIATO', breve: 'adepto', art: 'Adepto Incappucciato.png', att: 1, dif: 7, fer: 0, max: 1, mov: 4, dan: 1, attivo: true },
    { nome: 'CANE DEI MOLI', breve: 'cane dei moli', art: 'Cani dei Moli.png', att: 2, dif: 6, fer: 0, max: 1, mov: 6, dan: 1 },
    { nome: 'IL CUSTODE DELLA CERA', breve: 'custode della cera', art: 'Il Custode della Cera (boss).png', att: 3, dif: 9, fer: 1, max: 3, mov: 3, dan: 2, boss: true },
  ];

  // ---- tessere ----
  const tessere = [
    { id: 'T1', nome: 'Banchina d’Ingresso', file: 'T1 - Banchina d’Ingresso.png', rivelata: true },
    { id: 'T2', nome: 'Sala delle Casse', file: 'T2 - Sala delle Casse.png', rivelata: true },
    { id: 'T3', nome: 'Corridoio delle Candele', file: 'T3 - Corridoio delle Candele.png', rivelata: true },
    { id: 'T4', nome: 'Ufficio del Custode', file: 'T4 - Ufficio del Custode.png', rivelata: false },
    { id: 'T5', nome: 'Scala al Piano Interrato', file: 'T5 - Scala al Piano Interrato.png', rivelata: false },
    { id: 'T6', nome: 'Cripta della Cera', file: 'T6 - Cripta della Cera.png', rivelata: false },
  ];
  const urlTessera = (t) => A('Episodio 1/board/' + t.file);

  // ---- luoghi (per l'Indagine) ----
  const luoghi = [
    { n: 1, nome: 'Il Campanile di San Teodoro', voce: 'Il Campanile di San Teodoro', file: 'Episodio 1/Luoghi/1 - Il Campanile di San Teodoro', stato: 'visitato' },
    { n: 2, nome: 'Casa di Ruggero', voce: 'Vicolo dei Fonditori', file: 'Episodio 1/Luoghi/2 - Casa di Ruggero — Vicolo dei Fonditori', stato: 'aperto' },
    { n: 3, nome: 'Taverna del Ponte Rotto', voce: 'Taverna del Ponte Rotto', file: 'Episodio 1/Luoghi/3 - Taverna del Ponte Rotto', stato: 'attivo' },
    { n: 8, nome: 'La Gendarmeria', voce: 'La Gendarmeria', file: 'Episodio 1/Luoghi/8 - La Gendarmeria', stato: 'aperto' },
    { n: 5, nome: 'Bottega del Liutaio Ferri', voce: 'Bottega del Liutaio Ferri', file: 'Episodio 1/Luoghi/5 - Bottega del Liutaio Ferri', stato: 'bloccato' },
    { n: 6, nome: 'Il Canale Basso', voce: 'Il Canale Basso', file: 'Episodio 1/Luoghi/6 - Il Canale Basso', stato: 'bloccato' },
  ];

  const episodi = [
    { id: 'ep1', titolo: 'Il Coro Sommerso', sotto: 'episodio 1 — il caso del campanaro scomparso', cover: 'copertina spedizione.png', stato: 'in corso' },
    { id: 'ep2', titolo: 'La Voce del Bronzo', sotto: 'episodio 2 — le campane di San Teodoro', cover: 'copertina episodio 2.png', stato: 'nuovo' },
  ];

  const S = {
    ep: { titolo: 'Il Coro Sommerso', sotto: 'episodio 1 — il caso del campanaro scomparso',
      obiettivo: 'Liberate Ruggero (Interagire, la cella in T6) e riportatelo in T1, alla banchina.' },
    round: 3, canto: 2, soglia: 3, ora: 21, party, nemici, tessere, luoghi, episodi, urlTessera, urlArt, urlCarta, esc, A,
  };

  // ---- builder componenti condivisi (HTML string) ----
  const pips = (on, max, cls) => '<span class="pips">' +
    Array.from({ length: max }, (_, i) => `<span class="pip ${cls || ''} ${i < on ? 'on' : ''}"></span>`).join('') + '</span>';
  const clock = () => '<span class="clock">' +
    Array.from({ length: S.soglia }, (_, i) => `<span class="gem ${i < S.canto ? 'on' : ''}"></span>`).join('') +
    ` <span class="sc">canto ${S.canto}/${S.soglia}</span></span>`;
  const tokEroe = (e, extra) => `<div class="tok eroe ${e.attivo ? 'attivo' : ''} ${e.sal === 0 ? 'giu' : ''} ${extra || ''}">
    <img src="${urlArt(e.art)}" alt="${esc(e.breve)}" loading="lazy">${e.sal === 0 ? '<span class="cad"></span>' : ''}</div>`;
  const tokNemico = (n, extra) => `<div class="tok nemico ${n.boss ? 'boss' : ''} ${n.attivo ? 'attivo' : ''} ${extra || ''}">
    <img src="${urlArt(n.art)}" alt="${esc(n.breve)}" loading="lazy"></div>`;
  const statMini = (n) => `<span class="statmini">att <b>+${n.att}</b> · dif <b>${n.dif}</b> · dan <b>${n.dan}</b> · mov <b>${n.mov}</b></span>`;

  window.MOCK = { S, pips, clock, tokEroe, tokNemico, statMini, urlArt, urlCarta, urlTessera: S.urlTessera, esc };
})();
