/* I CONTENUTI, uguali per le tre direzioni.
   Le pagine si distinguono per come impaginano, non per cosa dicono: qui stanno
   i dati veri (eroi del Comune, luoghi dell'Episodio 1, tessere della plancia) e
   i pezzi che tutte e tre riempiono. Il confronto va fatto sul testo che l'app
   avrà davvero — nomi lunghi come «DOTT. ATTILIO MARN», stradari da sei voci,
   tre righe di descrizione: uno stile che regge il lorem e non regge quelli non
   serve a niente. */
(function () {
  const { S, esc, urlArt } = MOCK;

  // le sei ore della notte: 18-24, spese da sinistra
  const ORA = 21;
  const ORE = Array.from({ length: 6 }, (_, i) => ({
    et: 18 + i, spesa: 18 + i < ORA, ora: 18 + i === ORA,
  }));

  // il testo che si legge AD ALTA VOCE: è il pezzo che decide se una direzione
  // funziona, perché sono le parole che il tavolo sente
  const DETTO = `La porta della taverna è aperta e nessuno la guarda. Dentro, il vociare si
    spegne di un poco quando entrate: non abbastanza da fermarsi, quanto basta perché ve ne
    accorgiate. Il vecchio che stava raccontando qualcosa si volta verso il banco e riprende
    con voce più bassa. Sul tavolo in fondo c'è una borsa da campanaro, e non c'è nessuno
    seduto lì.`;

  const stradario = (cls = 'voce') => S.luoghi.map((l) => `
    <button class="${cls} ${l.stato}">
      <span><span class="nome">${esc(l.nome)}</span>
        ${l.voce && l.voce !== l.nome ? `<span class="indirizzo">${esc(l.voce)}</span>` : ''}</span>
      <span class="segno">${l.stato === 'visitato' ? 'già battuto' : l.stato === 'attivo' ? 'ci siete' : ''}</span>
    </button>`).join('');

  const eroiChip = () => S.party.map((e) => `
    <div class="eroe">
      <img src="${urlArt(e.art)}" alt="" loading="lazy">
      <span class="n">${esc(e.breve)}</span>
      <span class="pips">${Array.from({ length: e.carMax || 0 },
    (_, i) => `<span class="pip ${i < (e.car || 0) ? 'on' : ''}"></span>`).join('')}</span>
    </div>`).join('');

  // LA PLANCIA: sei per sei, con gli eroi in campo, due nemici e i due segnali
  // che al tavolo si sono imparati — turchese «puoi andare», oro «qui si rivela».
  const CAMPO = {
    2: { eroe: 0 }, 3: { mossa: 1 }, 8: { mossa: 1 }, 9: { eroe: 1, attivo: true },
    10: { mossa: 1 }, 14: { nemico: 0 }, 15: { rivela: 1 }, 16: { eroe: 2 },
    21: { nemico: 2 }, 22: { eroe: 3 }, 27: { rivela: 1 },
  };
  const plancia = () => Array.from({ length: 36 }, (_, i) => {
    const c = CAMPO[i] || {};
    const cls = [c.mossa && 'mossa', c.rivela && 'rivela', c.nemico != null && 'nemico',
      c.attivo && 'attivo'].filter(Boolean).join(' ');
    const chi = c.eroe != null ? S.party[c.eroe] : c.nemico != null ? S.nemici[c.nemico] : null;
    return `<div class="cella ${cls}">${chi
      ? `<img src="${urlArt(chi.art)}" alt="${esc(chi.breve)}" loading="lazy">` : ''}</div>`;
  }).join('');

  window.PEZZI = { ORE, ORA, DETTO, stradario, eroiChip, plancia, S, esc, urlArt };
})();
