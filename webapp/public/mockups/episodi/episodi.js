// Aiuti dei mockup della scelta dell'episodio (dati.js dice quali sono).
// Mockup statici: gli stati sono d'esempio, e servono a vedere come si presenta
// un tavolo con qualche serata gia' giocata.
const STATI = { preludio: 'vinta', ep1: 'vinta', ep2: 'corso', ep3: 'perduta' };
const NOME_ATTO = ['prima di cominciare', 'atto I', 'atto II', 'atto III', 'atto IV · il finale'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const urlArte = (p) => encodeURI(p);
const numero = (e) => (e.n === 0 ? 'preludio' : 'episodio ' + e.n);
const parolaStato = { vinta: 'vinta', corso: 'in corso', perduta: 'perduta' };

// UNA STAMPA: e' il markup di `.eroe-tile` (mio-eroe.js) parola per parola. Una
// serata vinta prende il sigillo di ceralacca, come un eroe scelto; le altre si
// dicono nella riga sotto il titolo.
function stampa(e, { nastrino = false, larga = false, riprendi = false } = {}) {
  const st = STATI[e.id] || '';
  const sotto = numero(e) + (st ? ' · ' + parolaStato[st] : '');
  return `<div class="eroe-tile stampa-caso${st === 'vinta' ? ' scelto' : ''}${larga ? ' stampa-larga' : ''}"
       data-id="${e.id}">
    ${nastrino ? `<span class="nastrino">${e.n === 0 ? 'prelud.' : 'n. ' + e.n}</span>` : ''}
    <img loading="lazy" src="${urlArte(e.art)}" alt="">
    <div class="eroe-velo"></div>
    <div class="eroe-nome"><b>${esc(e.titolo.toLowerCase())}</b>
      <i${st === 'corso' ? ' class="corso"' : st === 'perduta' ? ' class="perduta"' : ''}>${sotto}</i></div>
    ${riprendi ? '<div class="riprendi"><button class="btn pieno piccolo">riprendete la serata</button></div>' : ''}
    <div class="spunta">✓</div>
  </div>`;
}

// la testata di ogni schermata: la stessa barra della scelta dell'eroe
const barra = (titolo = 'Il tavolo di prova') => `
  <div class="barra"><span></span><div class="titolo">${esc(titolo)}</div>
    <button class="btn piccolo">cambia tavolo</button></div>`;
