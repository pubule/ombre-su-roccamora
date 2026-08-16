/* LA PLANCIA A STANZE, per i mockup della Spedizione.
   Sei stanze dell'Episodio 1 con le loro tessere vere: tre rivelate (una è
   quella dove si combatte), una porta da aprire, due ancora nella nebbia. I
   gettoni sono gli eroi e i nemici del party finto, con le ferite che hanno. */
(function () {
  const { S, esc, urlArt } = MOCK;
  const T = (id) => `/assets/${encodeURI('Episodio 1/board/' + id + '.png')}`;

  // eroe/nemico dentro una casella: il ritratto tondo, il segno attorno, e il
  // sangue che sale col danno — la stessa lettura dei token al tavolo
  const gettone = (x, tipo) => {
    const q = tipo === 'eroe' ? (x.sal / x.salMax) : ((x.max - x.fer) / x.max);
    const ferita = Math.round((1 - q) * 100);
    return `<span class="tok ${tipo} ${x.attivo ? 'tocca' : ''} ${x.boss ? 'boss' : ''} ${
      tipo === 'eroe' && x.sal === 0 ? 'giu' : ''}">
      <img src="${urlArt(x.art)}" alt="${esc(x.breve)}" loading="lazy">
      ${ferita ? `<span class="sangue" style="height:${ferita}%"></span>` : ''}
    </span>`;
  };

  // una stanza: pavimento (la tessera), reticolo, gettoni, e il nome in basso
  const stanza = (o) => {
    const celle = Array.from({ length: o.c * o.r }, (_, i) => {
      const d = (o.dentro || {})[i] || {};
      const chi = d.eroe != null ? gettone(S.party[d.eroe], 'eroe')
        : d.nemico != null ? gettone(S.nemici[d.nemico], 'nemico') : '';
      return `<span class="cel ${d.mossa ? 'mossa' : ''} ${d.rivela ? 'rivela' : ''}">${chi}</span>`;
    }).join('');
    return `<div class="stanza ${o.nebbia ? 'nebbia' : ''} ${o.porta ? 'porta' : ''}">
      <span class="pavimento" style="background-image:url('${T(o.id)}')"></span>
      <div class="celle" style="grid-template-columns:repeat(${o.c},1fr)">${celle}</div>
      ${o.nebbia ? `<span class="velo-nebbia">
        <svg class="ic grande" aria-hidden="true"><use href="#i-lanterna"></use></svg>
        <span class="sc">${o.porta ? 'una porta: si apre entrando' : 'non ancora rivelata'}</span>
      </span>` : `<span class="nome">${esc(o.nome)}</span>`}
    </div>`;
  };

  const STANZE = [
    { id: 'T2', nome: 'sala delle casse', c: 4, r: 3,
      dentro: { 1: { eroe: 0 }, 2: { mossa: 1 }, 6: { mossa: 1 }, 9: { eroe: 3 } } },
    { id: 'T3', nome: 'corridoio delle candele', c: 4, r: 3,
      dentro: { 0: { mossa: 1 }, 5: { eroe: 1 }, 6: { nemico: 0 }, 10: { rivela: 1 } } },
    { id: 'T6', nome: 'cripta della cera', c: 4, r: 3,
      dentro: { 2: { nemico: 2 }, 5: { eroe: 2 }, 9: { rivela: 1 } } },
    { id: 'T5', nome: 'scala al piano interrato', c: 4, r: 3, nebbia: true, porta: true },
    { id: 'T4', nome: 'ufficio del custode', c: 4, r: 3, nebbia: true },
    { id: 'T1', nome: 'banchina d’ingresso', c: 4, r: 3, nebbia: true },
  ];

  window.PLANCIA = { stanza, STANZE, gettone, tessera: T };
})();
