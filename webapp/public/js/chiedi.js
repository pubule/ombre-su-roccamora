// Le domande irreversibili, chieste dentro il gioco invece che dal browser.
//
// Il popup di sistema spezza l'immersione proprio nei momenti che contano —
// rompere il sigillo della soluzione, cancellare una partita, dichiarare la
// fine di una spedizione. Qui la domanda ha la faccia del fascicolo, e quando
// c'e' un sigillo di mezzo lo mostra.
//
// UNA NOTA SUI BANCHI DI PROVA: misura-*.mjs, test-monkey e le regressioni
// sostituiscono `window.confirm` con «sì» e vanno avanti da soli. Se qui si
// aprisse sempre un pannello nostro, resterebbero appesi a un bottone che non
// sanno di dover premere. Quindi: se `window.confirm` NON e' piu' quello
// nativo, vuol dire che qualcuno l'ha sostituito apposta, e gli si obbedisce.
// Per chi gioca davvero il confirm e' sempre nativo, e vede il pannello.
const nativa = () => {
  try { return /\[native code\]/.test(String(window.confirm)); } catch { return true; }
};

export function conferma(domanda, opzioni = {}) {
  const { si = 'sì', no = 'non ancora', dettaglio = '', sigillo = '' } = opzioni;

  if (!nativa()) return Promise.resolve(!!window.confirm(domanda));

  return new Promise((risolvi) => {
    const ov = document.createElement('div');
    ov.className = 'scelta-overlay';
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    ov.innerHTML = `<div class="scelta-box chiesta${sigillo ? ' sigillata' : ''}">
      ${sigillo ? `<div class="sigillo" aria-hidden="true">${esc(sigillo)}</div>` : ''}
      <h3 class="sc">${esc(domanda)}</h3>
      ${dettaglio ? `<p class="nota centrato">${esc(dettaglio)}</p>` : ''}
      <button class="btn pieno scelta-btn" data-si="1">${esc(si)}</button>
      <button class="btn scelta-btn annulla">${esc(no)}</button>
    </div>`;
    document.body.appendChild(ov);

    const chiudi = (esito) => { ov.remove(); document.removeEventListener('keydown', tasto); risolvi(esito); };
    const tasto = (e) => { if (e.key === 'Escape') chiudi(false); };
    document.addEventListener('keydown', tasto);
    ov.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => chiudi(!!b.dataset.si)));
    // il click fuori annulla: e' la risposta prudente, e queste domande non si
    // annullano per sbaglio premendo invio
    ov.addEventListener('click', (e) => { if (e.target === ov) chiudi(false); });
    ov.querySelector('.btn.pieno').focus();
  });
}
