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

// Copertine home: dove esiste una copertina/arte di LUOGO dedicata all'episodio
// (gia' su disco, Fase D non necessaria) la usiamo; altrove un'atmosfera coerente.
const COPERTINE = {
  preludio: '/assets/artworks/Palazzo del Lume.png',        // preludio «La Prova del Lume»: la sede della Società del Lume
  ep1: '/assets/artworks/copertina spedizione.png',
  ep2: '/assets/artworks/copertina episodio 2.png',         // copertina dedicata Ep.2
  // finché manca l'arte dedicata dell'Ep. 3 (Fase D): un'atmosfera d'acqua
  ep3: '/assets/artworks/derelict warehouses over black still water.png',
  ep4: '/assets/artworks/Il buio di quinta.png',            // Ep.4 il teatro: il buio di quinta
  ep5: '/assets/artworks/nervous priest in a candlelit sacristy.png',
  // finché manca l'arte dedicata dell'Ep. 6 (Fase D): la bottega di Ferri
  ep6: '/assets/artworks/abandoned luthier workshop.png',
  // finché manca l'arte dedicata dell'Ep. 7 (Fase D): l'archivio
  ep7: '/assets/artworks/dusty municipal archive.png',
  ep8: '/assets/artworks/Banco dei Pegni.png',              // Ep.8 l'oro vecchio: il Monte/banco dei pegni
  // finché manca l'arte dedicata dell'Ep. 9 (Fase D): l'ufficio notturno
  ep9: '/assets/artworks/cluttered 19th century police office.png',
  ep10: '/assets/artworks/Corte della Faenza.png',          // Ep.10 la casa che ricorda: Corte della Faenza
  ep11: '/assets/artworks/Cella campanaria.png',            // Ep.11 censimento campane: la cella campanaria
  ep12: '/assets/artworks/Palazzo del Lume.png',            // Ep.12: sede della Società (Palazzo del Lume)
  // finché manca l'arte dedicata dell'Ep. 13 (Fase D): il molino sulle rogge
  ep13: '/assets/artworks/derelict warehouses over black still water.png',
  // finché manca l'arte dedicata dell'Ep. 14 (Fase D): i tetti nella notte
  ep14: '/assets/artworks/bell tower.png',
  // finché manca l'arte dedicata dell'Ep. 15 (Fase D): la villa nella notte
  ep15: '/assets/artworks/cluttered 19th century police office.png',
  // finché manca l'arte dedicata dell'Ep. 16 (Fase D): la villa sul lago
  ep16: '/assets/artworks/humble candlelit canal-side room.png',
  // finché manca l'arte dedicata dell'Ep. 17 (Fase D): la villa-prigione
  ep17: '/assets/artworks/derelict warehouses over black still water.png',
  ep18: '/assets/artworks/Palazzo del Lume.png',            // Ep.18 il Palazzo del Lume che si spegne
  // finché manca l'arte dedicata dell'Ep. 19 (Fase D): l'Archivio sequestrato
  ep19: '/assets/artworks/dusty municipal archive.png',
  // finché manca l'arte dedicata dell'Ep. 20 (Fase D): la gola sotto la Cattedrale
  ep20: '/assets/artworks/derelict warehouses over black still water.png',
};

const RIGA_C = `<p class="copyright">© 2026 Fabio Stocco — «Ombre su Roccamora» ·
  uso non commerciale (PolyForm NC 1.0.0)</p>`;

// Arte non ancora generata (Fase D di un episodio nuovo): un'immagine rotta
// sparisce invece di mostrare l'icona rotta del browser — i testi di gioco
// ci sono comunque, la carta è solo l'illustrazione.
window.addEventListener('error', (e) => {
  if (e.target && e.target.tagName === 'IMG') e.target.style.display = 'none';
}, true);

// ------------------------------------------------------------------- HOME
async function vistaHome() {
  const episodi = ['preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9', 'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17', 'ep18', 'ep19', 'ep20'];
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
          <p>Siete intorno a un tavolo, coi <b>dadi veri</b>. L’app fa da <b>arbitro</b>:
          custodisce i segreti, tira gli orologi, pesca le Minacce, verifica le chiavi —
          e nessuno al tavolo sa niente in anticipo.</p>
        </div>
        <div class="modo" data-modo="digitale">
          <h3>tutto a schermo</h3>
          <p>Niente componenti fisici: il board, i token e i dadi vivono qui.
          Muovete gli eroi a caselle, la notte reagisce da sola.</p>
        </div>
      </div>
      <div id="scelta-plancia" style="display:none">
        <h2 class="mt">e la plancia della spedizione?</h2>
        <div class="modi mt">
          <div class="plancia attivo" data-plancia="fisica">
            <h3>tessere e miniature vere</h3>
            <p>Le avete stampate: la mappa sta sul tavolo, l’app tiene i conti.</p>
          </div>
          <div class="plancia" data-plancia="schermo">
            <h3>plancia a schermo</h3>
            <p>Non le avete stampate: la mappa e le pedine vivono qui, un dispositivo
            al centro del tavolo. I <b>dadi restano vostri</b> e il testo delle tessere
            lo legge chi arbitra dal fascicolo.</p>
          </div>
        </div>
      </div>
      <h2 class="mt">da dove cominciate?</h2>
      <div class="modi mt">
        <div class="fase attivo" data-fase="indagine">
          <h3>l’episodio intero</h3>
          <p>Prima l’indagine per le strade, poi la spedizione: com’è scritto.</p>
        </div>
        <div class="fase" data-fase="spedizione">
          <h3>solo la spedizione</h3>
          <p>L’indagine l’avete già fatta un’altra sera (o non la rifate): si scende
          e basta. Vi chiederemo solo <b>com’era finita</b> — è l’unica cosa che
          l’indagine passa alla spedizione.</p>
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
  let fase = 'indagine';
  let plancia = 'fisica';
  app.querySelectorAll('.modo').forEach((el) => el.addEventListener('click', () => {
    app.querySelectorAll('.modo').forEach((m) => m.classList.remove('attivo'));
    el.classList.add('attivo'); modo = el.dataset.modo;
    // la scelta della plancia ha senso solo al tavolo: a schermo e' implicita
    document.getElementById('scelta-plancia').style.display = modo === 'tavolo' ? '' : 'none';
    document.getElementById('avanti').classList.remove('disabilitato');
  }));
  app.querySelectorAll('.plancia').forEach((el) => el.addEventListener('click', () => {
    app.querySelectorAll('.plancia').forEach((m) => m.classList.remove('attivo'));
    el.classList.add('attivo'); plancia = el.dataset.plancia;
  }));
  app.querySelectorAll('.fase').forEach((el) => el.addEventListener('click', () => {
    app.querySelectorAll('.fase').forEach((m) => m.classList.remove('attivo'));
    el.classList.add('attivo'); fase = el.dataset.fase;
  }));
  document.getElementById('avanti').onclick = () => modo && vistaParty(epId, modo, fase, plancia);
}

// ------------------------------------------------------------------ PARTY
async function vistaParty(epId, modo, fase = 'indagine', plancia = 'fisica') {
  const comune = await dati('comune');
  const scelti = new Set();
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← indietro</button>
      <div class="titolo">chi scende in strada?</div>
      <span></span>
    </div>
    <div class="pannello">
      <p class="nota">Da 2 a 10 investigatori: le regole scalano da sole sulla taglia
      del party. Toccate un ritratto per leggere chi è — e decidere se arruolarlo.</p>
      <div class="contatore-party" id="contatore">0 scelti</div>
      <div class="griglia-arruolo">
        ${comune.eroi.map((e) => `
          <div class="eroe-tile" data-nome="${esc(e.nome)}">
            <img loading="lazy" src="${encodeURI('/assets/artworks/' + e.art)}" alt="">
            <div class="eroe-velo"></div>
            <div class="eroe-nome"><b>${esc(e.nome.toLowerCase())}</b>
              <i>${esc(e.ruolo)}</i></div>
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
  const aggiornaBtn = () => {
    document.getElementById('contatore').textContent =
      `${scelti.size} ${scelti.size === 1 ? 'scelto' : 'scelti'}`;
    document.getElementById('inizia').classList.toggle('disabilitato',
      scelti.size < 2 || scelti.size > 10);
  };
  app.querySelectorAll('.eroe-tile').forEach((el) => el.addEventListener('click', () => {
    const nome = el.dataset.nome;
    const eroe = comune.eroi.find((e) => e.nome === nome);
    dettaglioEroe(eroe, scelti.has(nome)).then((azione) => {
      if (azione !== 'toggle') return;
      if (scelti.has(nome)) { scelti.delete(nome); el.classList.remove('scelto'); }
      else { scelti.add(nome); el.classList.add('scelto'); }
      aggiornaBtn();
    });
  }));
  document.getElementById('inizia').onclick = () => {
    const partita = nuovaPartita(epId, modo, [...scelti], fase);
    partita.plancia = plancia;   // 'fisica' | 'schermo' (solo al tavolo)
    salva(partita);
    // partendo dalla sola spedizione manca l'unica cosa che l'indagine le
    // passa: com'era finita. La si dichiara, invece di darla per persa.
    if (fase === 'spedizione') return vistaEsitoIndagine(partita);
    vistaPartita(partita);
  };
}

// la scheda dell'eroe: art, statistiche, abilità, equipaggiamento e bio —
// gli stessi dati della Scheda Personaggio stampata
function dettaglioEroe(e, giaScelto) {
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
        <button class="btn pieno" id="arruola">${giaScelto ? 'congeda eroe' : 'arruola eroe'}</button>
        <button class="btn scelta-btn annulla" id="chiudi-eroe">chiudete la scheda</button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#arruola').onclick = () => { ov.remove(); risolvi('toggle'); };
    ov.querySelector('#chiudi-eroe').onclick = () => { ov.remove(); risolvi(null); };
  });
}

// ------------------------------------------------- ESITO D'INDAGINE (a mano)
// Giocando la sola spedizione, l'indagine non c'e' stata: qui si dichiara cosa
// avrebbe prodotto. Sono esattamente i tre campi che l'indagine scrive in
// `partita.vantaggi` (vedi indagine.js, chiusura della busta): il TIER, quali
// delle 4 Domande erano esatte, e il gettone Intuizione. Niente di piu': tutto
// il resto dell'indagine (ore, luoghi, approfondimenti) muore con la serata.
async function vistaEsitoIndagine(partita) {
  const ep = await dati(partita.episodio);
  const dom = (ep.soluzione && ep.soluzione.domande) || [];
  let tier = 'preparati';
  const giuste = dom.map(() => false);
  let dossier = false;
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← indietro</button>
      <div class="titolo">com’era finita l’indagine?</div>
      <span></span>
    </div>
    <div class="pannello">
      <p class="nota">Giocate la sola spedizione: dite all’app come si era chiusa la
      notte d’indagine. Se non ve lo ricordate o non l’avete mai giocata, lasciate
      <b>preparati</b> e nessuna risposta esatta: è l’esito medio.</p>
      <h2 class="mt">il vantaggio</h2>
      <div class="modi mt">
        <div class="tier" data-tier="slancio"><h3>slancio</h3>
          <p>Indagine ottima: 3 azioni a testa nel 1° round, e +1 Salute massima.</p></div>
        <div class="tier attivo" data-tier="preparati"><h3>preparati</h3>
          <p>Indagine discreta: +1 Salute massima a testa.</p></div>
        <div class="tier" data-tier="nessuno"><h3>nessuno</h3>
          <p>Arrivate col fiato corto: nessun vantaggio.</p></div>
      </div>
      <h2 class="mt">le 4 domande — quali avevate azzeccato?</h2>
      <p class="nota">Ognuna cambia qualcosa in spedizione: la Soluzione dice cosa.</p>
      ${dom.map((d, i) => `
        <div class="btn-riga mt">
          <button class="btn dom-tog" data-i="${i}">✗</button>
          <span class="dom-testo">${esc(d.q || ('domanda ' + (i + 1)))}</span>
        </div>`).join('')}
      <div class="btn-riga mt">
        <button class="btn dom-tog" id="tog-dossier">✗</button>
        <span class="dom-testo">Gettone Intuizione (aveste speso tutte e sei le ore)</span>
      </div>
      <div class="btn-riga mt">
        <button class="btn pieno" id="vai">si scende →</button>
      </div>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('indietro').onclick = () => vistaEpisodio(partita.episodio);
  app.querySelectorAll('.tier').forEach((el) => el.addEventListener('click', () => {
    app.querySelectorAll('.tier').forEach((m) => m.classList.remove('attivo'));
    el.classList.add('attivo'); tier = el.dataset.tier;
  }));
  app.querySelectorAll('.dom-tog[data-i]').forEach((el) => el.addEventListener('click', () => {
    const i = Number(el.dataset.i);
    giuste[i] = !giuste[i];
    el.textContent = giuste[i] ? '✓' : '✗';
    el.classList.toggle('attiva', giuste[i]);
  }));
  document.getElementById('tog-dossier').onclick = (e) => {
    dossier = !dossier;
    e.target.textContent = dossier ? '✓' : '✗';
    e.target.classList.toggle('attiva', dossier);
  };
  document.getElementById('vai').onclick = () => {
    partita.vantaggi = { tier, dossier, risposte: giuste };
    salva(partita);
    vistaPartita(partita);
  };
}

// ---------------------------------------------------------------- PARTITA
import { vistaIndagine } from './indagine.js';
import { vistaSpedizione } from './spedizione.js';
import { vistaDigitale } from './digitale.js';

async function vistaPartita(partita) {
  // Ramo spedizione. La plancia a schermo (digitale.js) serve DUE casi: la
  // modalita' digitale, e il tavolo di chi non ha stampato tessere e miniature
  // — li' pero' i dadi restano fisici e il testo delle tessere lo legge chi
  // arbitra (vedi `alTavolo()` in digitale.js). Il tavolo con la plancia vera
  // resta su spedizione.js, invariato.
  const aSchermo = partita.modo === 'digitale' || partita.plancia === 'schermo';
  const sped = aSchermo ? vistaDigitale : vistaSpedizione;
  const vaiA = (dove) => {
    if (dove === 'menu') return vistaHome();
    if (dove === 'spedizione') return sped(app, partita, vaiA);
    vistaPartita(partita);
  };
  if (partita.fase === 'indagine' && !partita.indagine.chiusa) {
    return vistaIndagine(app, partita, vaiA);
  }
  return sped(app, partita, vaiA);
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
