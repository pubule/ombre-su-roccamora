// LA SCELTA DELL'EPISODIO parla la lingua della scelta dell'eroe.
//
// Un episodio e' una stampa su carta come un eroe (`.eroe-tile`): stessa carta,
// stessa griglia, stesso sigillo di ceralacca per quel che e' vinto. E il gesto
// e' lo stesso: si tocca la stampa, si apre una SCHEDA (il foglio di
// `schedaEroe`), e solo da li' si comincia. Con ventun tessere quasi uguali, un
// tocco sbagliato non deve far partire niente.
//
// Mockup: webapp/public/mockups/episodi/c-scheda.html.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const NOME_ATTO = ['prima di cominciare', 'atto I', 'atto II', 'atto III', 'atto IV · il finale'];
// Gli atti come li dicono i sottotitoli: I = ep.1-6, II = 7-12, III = 13-18, IV = 19-20.
const numeroDi = (id) => (id === 'preludio' ? 0 : Number(String(id).slice(2)));
const attoDi = (n) => (n === 0 ? 0 : n <= 6 ? 1 : n <= 12 ? 2 : n <= 18 ? 3 : 4);

// com'e' andata una serata, dal salvataggio: '' (mai giocata), 'corso',
// 'vinta', 'parziale' (Frammento incrinato) o 'perduta'
export function statoDi(salvata) {
  if (!salvata) return '';
  const esito = (salvata.spedizione || {}).esito;
  return esito === 'vittoria' ? 'vinta' : esito === 'parziale' ? 'parziale' : esito ? 'perduta' : 'corso';
}
const PAROLA = { vinta: 'vinta', parziale: 'vinta a metà', perduta: 'perduta', corso: 'in corso' };
const COME = {
  vinta: 'Vinta: il Frammento è conservato nel taccuino di campagna.',
  parziale: 'Vinta a metà: il Frammento è incrinato — si conserva, ma non conta nel finale.',
  perduta: 'Perduta: nessun Frammento. Il caso si può rigiocare.',
  corso: 'Una serata è aperta: si riprende da dove eravate.',
  '': 'Non ancora giocato.',
};

// dal JSON dell'episodio e dal salvataggio a quel che serve alla stampa e alla scheda
export function infoCaso(ep, salvata, art) {
  const n = numeroDi(ep.id);
  return {
    id: ep.id, n, atto: attoDi(n), art, titolo: ep.titolo, stato: statoDi(salvata),
    // il sottotitolo porta «episodio N — » e a volte «Atto II: »: sono gia' detti altrove
    sotto: String(ep.sottotitolo)
      .replace(/^(episodio \d+|il preludio)\s*—\s*/i, '')
      .replace(/^[^:]*(atto|finale|apertura)[^:]*:\s*/i, ''),
  };
}
const numero = (c) => (c.n === 0 ? 'preludio' : `episodio ${c.n}`);

// LA STAMPA: il markup di `.eroe-tile` (mio-eroe.js) con in piu' il nastrino col
// numero. La serata vinta prende il sigillo (`.scelto`), le altre si dicono
// nella riga sotto il titolo.
export function stampaCaso(c) {
  const classe = c.stato === 'corso' ? ' class="corso"' : (c.stato === 'perduta' ? ' class="perduta"' : '');
  return `<div class="eroe-tile stampa-caso${c.stato === 'vinta' ? ' scelto' : ''}" data-ep="${esc(c.id)}">
    <span class="nastrino">${c.n === 0 ? 'prelud.' : `n. ${c.n}`}</span>
    <img loading="lazy" src="${encodeURI(c.art)}" alt="">
    <div class="eroe-velo"></div>
    <div class="eroe-nome"><b>${esc(c.titolo.toLowerCase())}</b>
      <i${classe}>${numero(c)}${c.stato ? ` · ${PAROLA[c.stato]}` : ''}</i></div>
    <div class="spunta">✓</div>
  </div>`;
}

// LA SCHEDA. Risolve 'apri' quando si preme il bottone, null se si chiude. Il
// bottone dice quel che fa: riprendere una serata aperta, rigiocare una
// conclusa, cominciare una nuova.
export function schedaCaso(c) {
  return new Promise((risolvi) => {
    const ov = document.createElement('div');
    ov.className = 'scelta-overlay';
    ov.innerHTML = `
      <div class="scelta-box eroe-dettaglio">
        <div class="eroe-testata">
          <img src="${encodeURI(c.art)}" alt="">
          <div>
            <h3>${esc(c.titolo.toLowerCase())}</h3>
            <p class="eroe-ruolo">${numero(c)} — ${NOME_ATTO[c.atto]}</p>
          </div>
        </div>
        <div class="eroe-sezione"><h4>il caso</h4>
          <p class="eroe-blocco"><i>${esc(c.sotto)}</i></p></div>
        <div class="eroe-sezione"><h4>com’è andata</h4>
          <p class="eroe-blocco">${COME[c.stato]}</p></div>
        <button class="btn pieno" id="apri-caso">${
          c.stato === 'corso' ? 'riprendete la serata'
          : c.stato ? 'rigiocate il caso' : 'si comincia'}</button>
        <button class="btn scelta-btn annulla" id="chiudi-caso">chiudete la scheda</button>
      </div>`;
    document.body.appendChild(ov);
    const chiudi = (esito) => { ov.remove(); document.removeEventListener('keydown', tasto); risolvi(esito); };
    const tasto = (e) => { if (e.key === 'Escape') chiudi(null); };
    document.addEventListener('keydown', tasto);
    ov.querySelector('#apri-caso').onclick = () => chiudi('apri');
    ov.querySelector('#chiudi-caso').onclick = () => chiudi(null);
    ov.addEventListener('click', (e) => { if (e.target === ov) chiudi(null); });
  });
}
