// Shell della webapp: home -> episodio -> modalita' -> party -> partita.
// W-A: navigazione e stato; le viste Indagine/Spedizione arrivano in W-B
// (motore arbitro) e qui hanno un segnaposto onesto.
import { dati, nuovaPartita, salva, carica, cancella } from './store.js';

const app = document.getElementById('app');
const h = (html) => { app.innerHTML = html; window.scrollTo(0, 0); };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// wake lock: al tavolo lo schermo non deve spegnersi
let wakeLock = null;
async function tieniSveglio() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* opzionale */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tieniSveglio();
});

const COPERTINE = {
  preludio: '/assets/artworks/humble candlelit canal-side room.png',
  ep1: '/assets/artworks/copertina spedizione.png',
  ep2: '/assets/artworks/Il Fonditore.png',
};

const RIGA_C = `<p class="copyright">© 2026 Fabio Stocco — «Ombre su Roccamora» ·
  uso non commerciale (PolyForm NC 1.0.0)</p>`;

// ------------------------------------------------------------------- HOME
async function vistaHome() {
  const episodi = ['preludio', 'ep1', 'ep2'];
  const info = await Promise.all(episodi.map((e) => dati(e)));
  h(`
    <header class="home-testata">
      <h1>ombre su roccamora</h1>
      <div class="sotto">società del lume · roccamora, 1889</div>
      <div class="filetto"></div>
    </header>
    <div class="griglia-episodi">
      ${info.map((ep) => {
        const salvata = carica(ep.id);
        return `
        <div class="tessera-episodio" data-ep="${ep.id}">
          <div class="arte" style="background-image:url('${COPERTINE[ep.id]}')"></div>
          <div class="velo"></div>
          ${salvata ? `<div class="stato">partita in corso</div>` : ''}
          <div class="testi">
            <h2>${esc(ep.titolo)}</h2>
            <div class="sotto">${esc(ep.sottotitolo)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${RIGA_C}
  `);
  app.querySelectorAll('.tessera-episodio').forEach((el) =>
    el.addEventListener('click', () => vistaEpisodio(el.dataset.ep)));
}

// -------------------------------------------------------------- EPISODIO
async function vistaEpisodio(epId) {
  const ep = await dati(epId);
  const salvata = carica(epId);
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← taverna</button>
      <div class="titolo">${esc(ep.titolo)}</div>
      <span></span>
    </div>
    ${salvata ? `
      <div class="pannello">
        <h2>partita in corso</h2>
        <p>Party: ${salvata.party.map((n) => esc(n.split(' ')[0])).join(', ')} ·
           fase: ${salvata.fase} · modalità: ${salvata.modo}</p>
        <div class="btn-riga">
          <button class="btn pieno" id="continua">continua</button>
          <button class="btn" id="ricomincia">ricomincia da capo</button>
        </div>
      </div><div class="mt"></div>` : ''}
    <div class="pannello">
      <h2>come giocate stasera?</h2>
      <div class="modi mt">
        <div class="modo" data-modo="tavolo">
          <h3>al tavolo</h3>
          <p>Carte, tessere e miniature vere. L’app fa da <b>arbitro</b>: custodisce i
          segreti, tira gli orologi, pesca le Minacce, verifica le chiavi — e nessuno
          al tavolo sa niente in anticipo.</p>
        </div>
        <div class="modo" data-modo="digitale">
          <h3>tutto a schermo</h3>
          <p>Niente componenti fisici: board, carte e dadi vivono qui.
          <i>(in costruzione: per ora apre la modalità arbitro)</i></p>
        </div>
      </div>
      <div class="btn-riga">
        <button class="btn pieno disabilitato" id="avanti">scegli gli investigatori →</button>
      </div>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('indietro').onclick = vistaHome;
  document.getElementById('continua')?.addEventListener('click', () => vistaPartita(carica(epId)));
  document.getElementById('ricomincia')?.addEventListener('click', () => {
    if (confirm('Cancellare la partita in corso di questo episodio?')) {
      cancella(epId); vistaEpisodio(epId);
    }
  });
  let modo = null;
  app.querySelectorAll('.modo').forEach((el) => el.addEventListener('click', () => {
    app.querySelectorAll('.modo').forEach((m) => m.classList.remove('attivo'));
    el.classList.add('attivo'); modo = el.dataset.modo;
    document.getElementById('avanti').classList.remove('disabilitato');
  }));
  document.getElementById('avanti').onclick = () => modo && vistaParty(epId, modo);
}

// ------------------------------------------------------------------ PARTY
async function vistaParty(epId, modo) {
  const [comune, carte] = await Promise.all([dati('comune'), dati('carte')]);
  const scelti = new Set();
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← indietro</button>
      <div class="titolo">chi scende in strada?</div>
      <span></span>
    </div>
    <div class="pannello">
      <p class="nota">Da 2 a 10 investigatori: le regole scalano da sole sulla taglia
      del party. Chi resta a casa lascia chiuse le sue porte.</p>
      <div class="contatore-party" id="contatore">0 scelti</div>
      <div class="griglia-eroi">
        ${carte.eroi_carte.map((c) => `
          <div class="carta-eroe" data-nome="${esc(c.title)}">
            <img loading="lazy" src="${encodeURI(`/assets/Comune/cards/${c.file}.jpg`)}"
                 alt="${esc(c.title)}">
            <div class="spunta">✓</div>
          </div>`).join('')}
      </div>
      <div class="btn-riga">
        <button class="btn pieno disabilitato" id="inizia">si comincia</button>
      </div>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('indietro').onclick = () => vistaEpisodio(epId);
  const perTitolo = {};
  comune.eroi.forEach((e) => { perTitolo[e.nome.toLowerCase()] = e.nome; });
  const aggiornaBtn = () => {
    document.getElementById('contatore').textContent =
      `${scelti.size} ${scelti.size === 1 ? 'scelto' : 'scelti'}`;
    document.getElementById('inizia').classList.toggle('disabilitato',
      scelti.size < 2 || scelti.size > 10);
  };
  app.querySelectorAll('.carta-eroe').forEach((el) => el.addEventListener('click', () => {
    const nome = el.dataset.nome;
    if (scelti.has(nome)) { scelti.delete(nome); el.classList.remove('scelto'); }
    else { scelti.add(nome); el.classList.add('scelto'); }
    aggiornaBtn();
  }));
  document.getElementById('inizia').onclick = () => {
    // il titolo carta ("Elena Fosco") va mappato sul nome dati ("ELENA FOSCO")
    const nomi = [...scelti].map((t) => {
      const k = t.toLowerCase();
      return comune.eroi.find((e) => e.nome.toLowerCase().includes(k) ||
                                     k.includes(e.nome.toLowerCase().split(' ')[0].toLowerCase()))?.nome || t;
    });
    const partita = nuovaPartita(epId, modo, nomi);
    salva(partita);
    vistaPartita(partita);
  };
}

// ---------------------------------------------------------------- PARTITA
import { vistaIndagine } from './indagine.js';

async function vistaPartita(partita) {
  const vaiA = (dove) => {
    if (dove === 'menu') return vistaHome();
    if (dove === 'spedizione') return vistaSpedizioneStub(partita);
    vistaPartita(partita);
  };
  if (partita.fase === 'indagine' && !partita.indagine.chiusa) {
    return vistaIndagine(app, partita, vaiA);
  }
  return vistaSpedizioneStub(partita);
}

async function vistaSpedizioneStub(partita) {
  const ep = await dati(partita.episodio);
  h(`
    <div class="barra">
      <button class="btn" id="esci">← esci</button>
      <div class="titolo">${esc(ep.titolo)} · ${partita.modo}</div>
      <span class="sc" style="color:var(--oro-chiaro)">h ${partita.indagine.ora}:00</span>
    </div>
    <div class="pannello centrato">
      <h2>la spedizione</h2>
      <p class="mt">Party: <b>${partita.party.map((n) => esc(n)).join(' · ')}</b></p>
      <p class="nota mt">La Spedizione assistita (pesca Minaccia, Canto, registro Ferite,
      esiti di Cercare) arriva col prossimo blocco di sviluppo. L’Indagine è già
      giocabile dall’inizio alla busta.</p>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('esci').onclick = vistaHome;
}

// ------------------------------------------------------------------ avvio
tieniSveglio();
vistaHome().catch((e) => h(`
  <div class="pannello centrato" style="margin-top:20vh">
    <h2>manca qualcosa</h2>
    <p>${esc(e.message)}</p>
    <p class="nota mt">Sul PC: <code>python webapp/export-data.py</code>,
    <code>node webapp/export-data.js</code>, <code>python webapp/export-assets.py</code>
    e ricarica.</p>
  </div>`));
