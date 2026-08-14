// La scheda dell'eroe: arte, statistiche, abilita', equipaggiamento e bio —
// gli stessi dati della Scheda Personaggio stampata.
//
// Vive qui e non in main.js perche' la aprono in tre punti diversi: la
// selezione del party (dove c'e' anche il bottone «arruola»), la home
// d'indagine e i pannelli salute della spedizione (dove il party e' gia'
// deciso e il bottone non deve esserci). Prima stava solo in main.js, e
// indagine.js/digitale.js non potevano importarla senza una dipendenza
// circolare — main.js importa loro.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Apertura per delega: qualunque elemento con `data-scheda="NOME EROE"` apre
// la scheda, ovunque sia. Un solo listener per tutta l'app, e non serve
// riagganciarlo dopo ogni render — la vista digitale rifa' il pannello salute
// a meta' dell'animazione dei nemici (digitale.js:1788, :1820), e i listener
// attaccati a mano su quei nodi sparirebbero. In capture, cosi' il clic non
// arriva a un eventuale gestore del contenitore.
let cercaEroe = null;
let agganciato = false;

/** @param trova  (nome) => eroe, tipicamente su ctx.comune.eroi della vista */
export function abilitaSchede(trova) {
  cercaEroe = trova;
  if (agganciato) return;
  agganciato = true;
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('[data-scheda]');
    if (!b || !cercaEroe) return;
    const e = cercaEroe(b.dataset.scheda);
    if (!e) return;
    ev.preventDefault();
    ev.stopPropagation();
    schedaEroe(e);
  }, true);
}

/** @param arruolo  null in partita; {giaScelto} in selezione, e allora la
 *                  Promise risolve 'toggle' quando si arruola/congeda. */
export function schedaEroe(e, arruolo = null) {
  return new Promise((risolvi) => {
    const ov = document.createElement('div');
    ov.className = 'scelta-overlay';
    ov.innerHTML = `
      <div class="scelta-box eroe-dettaglio">
        <div class="eroe-testata">
          <img src="${encodeURI('/assets/artworks/' + e.art)}" alt="">
          <div>
            <h3>${esc(e.nome.toLowerCase())}</h3>
            <p class="eroe-ruolo">${esc(e.ruolo)} — Società del Lume</p>
          </div>
        </div>
        <div class="eroe-stats">
          ${[['acume', e.acume], ['vigore', e.vigore], ['nervi', e.nervi],
             ['difesa', e.difesa], ['salute', e.salute]].map(([l, v]) =>
            `<div class="stat"><span>${l}</span><b>${v}</b></div>`).join('')}
        </div>
        ${e.bio ? `<div class="eroe-sezione"><h4>chi sei</h4>
          <p class="eroe-blocco eroe-bio"><i>${esc(e.bio)}</i></p></div>` : ''}
        <div class="eroe-sezione"><h4>abilità</h4>
          <p class="eroe-blocco">${e.abil}</p></div>
        ${e.equip ? `<div class="eroe-sezione"><h4>in tasca</h4>
          <p class="eroe-blocco">${esc(e.equip)}</p></div>` : ''}
        ${arruolo ? `<button class="btn pieno" id="arruola">${
          arruolo.giaScelto ? 'congeda eroe' : 'arruola eroe'}</button>` : ''}
        <button class="btn scelta-btn annulla" id="chiudi-eroe">chiudete la scheda</button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#arruola')?.addEventListener('click',
      () => { ov.remove(); risolvi('toggle'); });
    ov.querySelector('#chiudi-eroe').onclick = () => { ov.remove(); risolvi(null); };
  });
}
