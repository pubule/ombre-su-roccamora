// Shell della webapp: home -> episodio -> modalita' -> party -> partita.
// W-A: navigazione e stato; le viste Indagine/Spedizione arrivano in W-B
// (motore arbitro) e qui hanno un segnaposto onesto.
import { dati, nuovaPartita, salva, carica, cancella, tavoloCorrente, nomeTavoloCorrente,
         sincronizzaScelte, scelteCampagna } from './store.js';
import { biviDi, applicaAllaPartita } from '../motore/bivi.js';
import { rendi } from './engine.js';   // i Frammenti sono prosa con <i>/<b>
import { schedaEroe } from './scheda-eroe.js';
import { vistaTavoli } from './tavoli.js';
import { decidi, avviaCoda, stato as statoSync } from './sync.js';
import { conferma } from './chiedi.js';
import './zoom.js';   // un tocco sulla carta la apre a tutto schermo

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
      <span class="etichetta">società del lume · archivio dei casi</span>
      <h1>ombre su roccamora</h1>
      <div class="sotto">roccamora, 1889 — ventun casi, uno per sera</div>
      <div class="filetto"></div>
      ${tavoloCorrente() ? `<div class="riga-tavolo">
        <span class="spia">${esc(nomeTavoloCorrente() || 'tavolo senza nome')} ·
          <span id="spia">${esc(statoSync())}</span></span>
        <button class="btn piccolo" id="cambia-tavolo">cambia tavolo</button>
      </div>` : ''}
      <div class="riga-tavolo"><span></span>
        <button class="btn piccolo" id="taccuino">taccuino di campagna</button></div>
    </header>
    <div class="griglia-episodi">
      ${info.map((ep) => {
        const salvata = carica(ep.id);
        return `
        <div class="tessera-episodio" data-ep="${ep.id}">
          <div class="arte" style="background-image:url('${COPERTINE[ep.id]}')"></div>
          <div class="velo"></div>
          <div class="testi">
            <h2>${esc(ep.titolo)}</h2>
            <div class="sotto">${esc(ep.sottotitolo)}</div>
            ${salvata ? `<div class="stato${(salvata.spedizione || {}).esito ? ' finita' : ''}">${
              // una serata conclusa resta salvata — serve alla campagna — ma non
              // e' «in corso»: si torna alla taverna e la si ritrova li', come se
              // non fosse finita niente
              (salvata.spedizione || {}).esito === 'vittoria' ? 'serata vinta'
              : (salvata.spedizione || {}).esito ? 'serata perduta'
              : 'partita in corso'}</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    ${RIGA_C}
  `);
  app.querySelectorAll('.tessera-episodio').forEach((el) =>
    el.addEventListener('click', () => vistaEpisodio(el.dataset.ep)));
  document.getElementById('cambia-tavolo')?.addEventListener('click',
    () => vistaTavoli(app, (id) => entraNelTavolo(id)));
  document.getElementById('taccuino')?.addEventListener('click', () => vistaTaccuino(info));
}

// ------------------------------------------------- IL TACCUINO DI CAMPAGNA
// «Si stampa una volta sola e vi accompagna per tutte e venti le serate»: i
// Frammenti conservati e il Bivio scelto ogni volta. Quanti Frammenti INTATTI
// avete decide come si vince l'ultimo episodio, e il Regolamento e' esplicito —
// «non fidatevi della memoria».
//
// Niente da salvare: un Frammento non e' un dato in piu', e' come e' finita la
// serata. Contarlo da una tabella sua vorrebbe dire tenerne due, e due conti
// della stessa cosa divergono. Qui si legge dai salvataggi, che sono la verita'.
//
//   vittoria  -> Frammento
//   parziale  -> Frammento INCRINATO (si conserva, ma non conta nel finale)
//   sconfitta -> niente
const FRAMMENTO = { vittoria: 'frammento', parziale: 'frammento incrinato' };

function vistaTaccuino(info) {
  const scelte = scelteCampagna();
  const righe = info.map((ep) => {
    const s = carica(ep.id);
    const esito = (s && s.spedizione && s.spedizione.esito) || null;
    const scelta = scelte[ep.id];
    const opz = scelta && ep.bivio
      && (ep.bivio.opzioni || []).find((o) => o.id === scelta);
    return { ep, esito, opz };
  });
  const interi = righe.filter((r) => r.esito === 'vittoria').length;
  const incrinati = righe.filter((r) => r.esito === 'parziale').length;
  h(`
    <div class="barra"><button class="btn" id="taccuino-indietro">← menu</button>
      <div class="titolo">taccuino di campagna</div><span></span></div>
    <div class="pannello">
      <h2>${interi} ${interi === 1 ? 'frammento' : 'frammenti'}${
        incrinati ? ` · ${incrinati} ${incrinati === 1 ? 'incrinato' : 'incrinati'}` : ''}</h2>
      <p class="nota">Quanti Frammenti interi avete decide come si vince l’ultimo
        episodio. Gli incrinati si conservano e si leggono, ma non contano.</p>
    </div>
    <div class="pannello mt">
      ${righe.map(({ ep, esito, opz }) => `
        <div class="nemico-riga">
          <span class="nemico-nome">${esc(ep.titolo)}
            ${opz ? `<br><span class="nota">bivio: ${esc(opz.titolo)}</span>`
                  : (esito && ep.bivio ? '<br><span class="nota">bivio non ancora sigillato</span>' : '')}
            ${FRAMMENTO[esito] && ep.frammento
              ? `<div class="frammento-testo">${rendi(ep.frammento)}</div>` : ''}</span>
          <span class="nota">${FRAMMENTO[esito] || (esito ? '—' : '')}</span>
        </div>`).join('')}
    </div>
    ${RIGA_C}
  `);
  document.getElementById('taccuino-indietro').onclick = () => vistaHome();
}

// -------------------------------------------------------------- EPISODIO
async function vistaEpisodio(epId) {
  // CHI GIOCA NON PASSA DI QUI. Come si gioca stasera, con che plancia, da dove
  // si comincia e se ricominciare da capo sono decisioni di chi conduce: dal
  // telefono si torna dentro la serata, che e' l'unico posto dove chi gioca ha
  // qualcosa da fare. Ci si arrivava premendo «menu» e rientrando.
  if (await sonoGiocatore()) return entraNelTavolo(tavoloCorrente());
  const ep = await dati(epId);
  const salvata = carica(epId);
  // il bottone deve dire quel che fa: con la compagnia gia' sul tavolo la
  // schermata d'arruolamento non si apre, e prometterla e' una bugia piccola
  // che si scopre subito
  let compagniaPronta = false;
  if (tavoloCorrente()) {
    try {
      const r = await fetch('/api/stato');
      if (r.ok) {
        const t = ((await r.json()).tavoli || []).find((x) => x.id === tavoloCorrente());
        compagniaPronta = !!(t && t.party && JSON.parse(t.party).length);
      }
    } catch { /* senza rete si arruola a mano, com'era */ }
  }
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← taverna</button>
      <div class="titolo">${esc(ep.titolo)}</div>
      <span></span>
    </div>
    ${salvata ? `
      <div class="pannello">
        <h2>${(salvata.spedizione || {}).esito ? 'serata conclusa' : 'partita in corso'}</h2>
        <p>Party: ${salvata.party.map((n) => esc(n.split(' ')[0])).join(', ')} ·
           fase: ${salvata.fase} · modalità: ${salvata.modo}</p>
        <div class="btn-riga">
          <button class="btn pieno" id="continua">${
            (salvata.spedizione || {}).esito ? 'rivedi l’epilogo' : 'continua'}</button>
          <button class="btn" id="ricomincia">${
            (salvata.spedizione || {}).esito ? 'rigiocate l’episodio' : 'ricomincia da capo'}</button>
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
        <button class="btn pieno disabilitato" id="avanti">${
          compagniaPronta ? 'si comincia →' : 'scegli gli investigatori →'}</button>
      </div>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('indietro').onclick = vistaHome;
  document.getElementById('continua')?.addEventListener('click', () => continua(epId));
  document.getElementById('ricomincia')?.addEventListener('click', async () => {
    if (await conferma('Ricominciare da capo?', {
      dettaglio: 'La partita in corso di questo episodio si cancella. Non si torna indietro.',
      si: 'cancellate la partita', no: 'lasciate stare',
    })) { cancella(epId); vistaEpisodio(epId); }
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

// ------------------------------------------- CONTINUARE UNA PARTITA IN CORSO
// Prima di riprendere si guarda anche il server: la stessa partita puo' essere
// andata avanti su un altro dispositivo.
async function continua(epId) {
  const locale = carica(epId);
  let remoto = null;
  if (tavoloCorrente()) {
    try {
      const r = await fetch(`/api/salvataggio?tavolo=${tavoloCorrente()}&episodio=${epId}`);
      if (r.ok) remoto = await r.json();
    } catch { /* senza rete si gioca il locale, come sempre */ }
  }

  const d = decidi(locale, remoto);
  if (d.azione === 'scarica') {
    const p = JSON.parse(remoto.dati);
    p.sincronizzato = remoto.aggiornato;
    salva(p);
    return vistaPartita(p);
  }
  if (d.azione !== 'chiedi') return vistaPartita(locale);

  // Due versioni divergenti: qui NON si sceglie. Si mostrano, e decide chi ha
  // giocato — sovrascrivere di nascosto una serata e' l'unica cosa vietata.
  const r = JSON.parse(remoto.dati);
  const quando = (ms) => new Date(ms).toLocaleString('it-IT');
  const riga = (p, q) => `Indagine alle ${p.indagine?.ora ?? '—'},
    round ${p.spedizione?.round ?? 0}. Salvata il ${esc(quando(q))}.`;
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← indietro</button>
      <div class="titolo">due versioni di questa partita</div>
      <span></span>
    </div>
    <div class="pannello">
      <p class="nota">Questa partita è andata avanti in due posti diversi.
      Quale tenete? L’altra si perde.</p>
      <div class="modi mt">
        <div class="modo" id="tieni-locale"><h3>questo dispositivo</h3>
          <p>${riga(locale, locale.aggiornato)}</p></div>
        <div class="modo" id="tieni-remoto"><h3>l’altro dispositivo</h3>
          <p>${riga(r, remoto.aggiornato)}</p></div>
      </div>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('indietro').onclick = () => vistaEpisodio(epId);
  const tieni = (p) => { p.sincronizzato = 0; salva(p); vistaPartita(p); };
  document.getElementById('tieni-locale').onclick = () => tieni(locale);
  document.getElementById('tieni-remoto').onclick = () => tieni(r);
}

// ------------------------------------------------------------------ PARTY
async function vistaParty(epId, modo, fase = 'indagine', plancia = 'fisica') {
  const comune = await dati('comune');
  const scelti = new Set();

  // LA COMPAGNIA DEL TAVOLO, se c'e'. Gli eroi di una campagna si scelgono una
  // volta e restano quelli: qui non si rifa' la scelta a ogni episodio, la si
  // mostra gia' fatta. Si cambia da «chi gioca», che e' dove si decide chi
  // siede al tavolo — ed e' anche l'unico posto in cui cambiarla libera i posti
  // di chi teneva un eroe che non c'e' piu'.
  //
  // Senza tavolo (partita locale, o senza rete) non cambia niente: si sceglie
  // come si e' sempre fatto.
  let dalTavolo = null;
  if (tavoloCorrente()) {
    try {
      const r = await fetch('/api/stato');
      if (r.ok) {
        const t = ((await r.json()).tavoli || []).find((x) => x.id === tavoloCorrente());
        if (t && t.party) { const p = JSON.parse(t.party); if (p.length) dalTavolo = p; }
      }
    } catch { /* nessuna rete: si sceglie a mano, com'era */ }
  }
  // LA COMPAGNIA DEL TAVOLO SI SCEGLIE UNA VOLTA: se c'e', non si passa nemmeno
  // di qui. Mostrare la stessa scelta a ogni episodio — gia' fatta, da
  // riconfermare — e' una domanda a cui si e' gia' risposto, e la seconda volta
  // sembra che la prima non sia servita.
  if (dalTavolo) return comincia(dalTavolo, epId, modo, fase, plancia);
  h(`
    <div class="barra">
      <button class="btn" id="indietro">← indietro</button>
      <div class="titolo">chi scende in strada?</div>
      <span></span>
    </div>
    <div class="pannello">
      <p class="nota">${dalTavolo
        ? 'La compagnia di questo tavolo, decisa una volta per tutta la campagna. Si cambia da «chi gioca», nella schermata dei tavoli.'
        : 'Da 2 a 10 investigatori: le regole scalano da sole sulla taglia del party. Toccate un ritratto per leggere chi è — e decidere se arruolarlo.'}</p>
      <div class="contatore-party" id="contatore">0 scelti</div>
      <div class="griglia-arruolo">
        ${comune.eroi.map((e) => `
          <div class="eroe-tile${scelti.has(e.nome) ? ' scelto' : ''}" data-nome="${esc(e.nome)}">
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
  document.getElementById('inizia').onclick = () => comincia([...scelti], epId, modo, fase, plancia);
}

// Comincia la partita. Sta a parte perche' ci si arriva da DUE strade: la
// schermata di arruolamento, e — quando il tavolo ha gia' la sua compagnia —
// senza passarci affatto.
async function comincia(party, epId, modo, fase, plancia) {
  const partita = nuovaPartita(epId, modo, party, fase);
  partita.plancia = plancia;     // 'fisica' | 'schermo' (solo al tavolo)
  // I BIVI DELLE SERATE PASSATE, applicati QUI e una volta sola: sono le regole
  // di partenza di questo episodio per QUESTO tavolo, e devono stare nello
  // stato prima che chiunque lo guardi. Riapplicarli a ogni render vorrebbe
  // dire un Canto che cresce da solo a ogni refresh.
  const scelte = await sincronizzaScelte();
  const b = biviDi(await dati(epId), scelte);
  applicaAllaPartita(partita, b, await dati(epId));
  salva(partita);
  const dopo = () => {
    // partendo dalla sola spedizione manca l'unica cosa che l'indagine le passa:
    // com'era finita. La si dichiara, invece di darla per persa.
    if (fase === 'spedizione') return vistaEsitoIndagine(partita);
    vistaPartita(partita);
  };
  if (b.righe.length) return schermataBivi(b, dopo);
  dopo();
}

// QUEL CHE LE SERATE PASSATE HANNO CAMBIATO, detto prima di cominciare.
//
// Una regola che cambia in silenzio e' indistinguibile da un guasto: il tavolo
// tirerebbe un dado in piu' senza sapere perche', o si troverebbe una porta
// chiusa e penserebbe a un baco. E ce n'e' una parte che l'app NON puo'
// applicare — un testimone che non parla piu', un incrocio in piu' alla
// deduzione d'atto: quella si legge e la si tiene a mente, come al tavolo.
function schermataBivi(b, dopo) {
  h(`
    <div class="pannello lettera-panel">
      <p class="nota centrato">— quel che avete deciso, da leggere ad alta voce —</p>
      <div class="lettera-testo">
        <p>Le serate passate hanno cambiato le regole di questa.</p>
        <ul>${b.righe.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="btn-riga">
      <button class="btn pieno" id="via-bivi">cominciamo →</button>
    </div>
    ${RIGA_C}
  `);
  document.getElementById('via-bivi').onclick = dopo;
}

// la scheda dell'eroe sta in scheda-eroe.js: la aprono anche l'indagine e la
// spedizione, che non possono importare main.js (sarebbe circolare)
const dettaglioEroe = (e, giaScelto) => schedaEroe(e, { giaScelto });

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

// ------------------------------------------- ENTRARE IN UN TAVOLO DA GIOCATORE
//
// CHI GIOCA NON SCEGLIE LA SERATA. Quale episodio, al tavolo o a schermo, con
// le tessere vere o sullo schermo, dall'indagine o dalla sola spedizione: sono
// decisioni di chi arbitra, e mostrarle su un telefono e' peggio che inutile —
// ognuno ne sceglierebbe una diversa, e nessuna delle loro conterebbe.
//
// Quindi si va DOVE E' L'ARBITRO: si cerca la serata aperta sul tavolo e ci si
// entra dentro. Se non ce n'e' ancora una, lo si dice e si aspetta — che e'
// esattamente quel che si fa a un tavolo vero mentre chi conduce prepara.
// Sto giocando un eroe a questo tavolo? Serve in piu' punti, e la risposta e'
// sempre la stessa per tutta la sessione: si tiene, invece di chiederla a ogni
// schermata. `false` anche senza server e senza tavolo — cioe' ovunque si
// arbitri, che e' il caso di sempre.
let _giocatore = null;
async function sonoGiocatore() {
  if (_giocatore !== null) return _giocatore;
  const id = tavoloCorrente();
  if (!id) { _giocatore = false; return false; }
  try {
    const r = await fetch('/api/stato');
    if (!r.ok) { _giocatore = false; return false; }
    const t = ((await r.json()).tavoli || []).find((x) => x.id === id);
    _giocatore = !!(t && t.ruolo !== 'arbitro');
  } catch { _giocatore = false; }
  return _giocatore;
}

async function entraNelTavolo(id) {
  let stato = null;
  try {
    const r = await fetch('/api/stato');
    if (r.ok) stato = await r.json();
  } catch { /* senza rete non si puo' sapere: si finisce sugli episodi, com'era */ }
  const t = stato && (stato.tavoli || []).find((x) => x.id === id);
  if (!t || t.ruolo === 'arbitro') return vistaHome();      // chi arbitra sceglie, come sempre

  // la serata aperta e' il salvataggio piu' recente del tavolo
  const suoi = (stato.salvataggi || []).filter((x) => x.tavolo === id);
  if (!suoi.length) return vistaAttesaArbitro(id, t.nome);
  const ultimo = suoi.sort((a, b) => b.aggiornato - a.aggiornato)[0];

  let partita = carica(ultimo.episodio);
  if (!partita || (partita.aggiornato || 0) < ultimo.aggiornato) {
    try {
      const r = await fetch(`/api/salvataggio?tavolo=${encodeURIComponent(id)}&episodio=${encodeURIComponent(ultimo.episodio)}`);
      if (r.ok) { const d = await r.json(); if (d && d.dati) { partita = JSON.parse(d.dati); salva(partita); } }
    } catch { /* si tiene quel che c'e' in locale */ }
  }
  if (!partita) return vistaAttesaArbitro(id, t.nome);
  return vistaPartita(partita);
}

// Il tavolo c'e' ma la serata non e' cominciata. Non e' un errore: e' l'attesa
// che a un tavolo vero si passa guardando chi arbitra sistemare le carte.
function vistaAttesaArbitro(id, nome) {
  h(`<div class="barra"><span></span><div class="titolo">${esc(nome || 'il tavolo')}</div><span></span></div>
     <div class="pannello">
       <h2>la serata non è ancora cominciata</h2>
       <p>Chi arbitra deve ancora aprire l’episodio. Appena l’avrà fatto, da qui
          entrerai direttamente nella partita — non devi scegliere niente.</p>
       <div class="btn-riga mt">
         <button class="btn pieno" id="riguarda">guarda di nuovo</button>
         <button class="btn" id="altro-tavolo">cambia tavolo</button>
       </div>
     </div>
     ${RIGA_C}`);
  document.getElementById('riguarda').onclick = () => entraNelTavolo(id);
  document.getElementById('altro-tavolo').onclick = () => vistaTavoli(app, (x) => entraNelTavolo(x));
}

// ---------------------------------------------------------------- PARTITA
import { vistaIndagine } from './indagine.js';
import { vistaSpedizione } from './spedizione.js';
import { vistaDigitale } from './digitale.js';

// IL POSTO A CUI SI SIEDE. Lo dice /api/stato insieme ai tavoli: chi ha creato
// il tavolo arbitra, chi e' stato invitato gioca il suo eroe.
//
// `null` = si arbitra, ed e' il caso di sempre: senza server (il `server.js`
// locale, tutti i banchi di misura) e senza tavolo scelto non c'e' nessun
// posto da rispettare, e la plancia e' quella di chi conduce.
async function postoDiQuestoTavolo() {
  const id = tavoloCorrente();
  if (!id) return null;
  try {
    const r = await fetch('/api/stato');
    if (!r.ok) return null;
    const s = await r.json();
    const t = (s.tavoli || []).find((x) => x.id === id);
    if (!t) return null;
    // si ricorda il ruolo: se la prossima volta /api/stato non risponde, un
    // telefono NON deve ritrovarsi arbitro per un errore di rete
    try { localStorage.setItem(`osr.ruolo.${id}`, t.ruolo || 'giocatore'); } catch { /* niente */ }
    // Anche chi arbitra ha un posto, e serve: e' collegandosi che vede
    // comparire le mosse fatte dai telefoni. Senza, resterebbe l'unico al
    // tavolo a non sapere cos'e' successo.
    return { tavolo: id, ruolo: t.ruolo === 'arbitro' ? 'arbitro' : 'giocatore', eroe: t.eroe || null };
  } catch {
    // SENZA RISPOSTA si usa l'ultimo ruolo conosciuto. Il ripiego «nessun
    // posto» vuol dire «si arbitra», ed e' giusto sul PC di chi gioca da solo:
    // su un telefono voleva dire ritrovarsi i poteri di chi conduce — il
    // «continua» delle schermate da leggere, i turni del PNG — per un errore di
    // rete di un istante.
    try {
      const r = localStorage.getItem(`osr.ruolo.${id}`);
      if (r && r !== 'arbitro') return { tavolo: id, ruolo: 'giocatore', eroe: null };
    } catch { /* niente */ }
    return null;                       // nessun server: si arbitra da soli, com'era
  }
}

async function vistaPartita(partita) {
  // Ramo spedizione. La plancia a schermo (digitale.js) serve DUE casi: la
  // modalita' digitale, e il tavolo di chi non ha stampato tessere e miniature
  // — li' pero' i dadi restano fisici e il testo delle tessere lo legge chi
  // arbitra (vedi `alTavolo()` in digitale.js). Il tavolo con la plancia vera
  // resta su spedizione.js, invariato.
  const aSchermo = partita.modo === 'digitale' || partita.plancia === 'schermo';
  const sped = aSchermo ? vistaDigitale : vistaSpedizione;
  const posto = await postoDiQuestoTavolo();
  const vaiA = (dove) => {
    if (dove === 'menu') return vistaHome();
    if (dove === 'spedizione') return sped(app, partita, vaiA, posto);
    vistaPartita(partita);
  };
  if (partita.fase === 'indagine' && !partita.indagine.chiusa) {
    return vistaIndagine(app, partita, vaiA);
  }
  return sped(app, partita, vaiA, posto);
}

// ------------------------------------------------------------------ avvio
tieniSveglio();
avviaCoda();

const errore = (e) => h(`
  <div class="pannello centrato" style="margin-top:20vh">
    <h2>manca qualcosa</h2>
    <p>${esc(e.message)}</p>
    <p class="nota mt">Sul PC: <code>python webapp/export-data.py</code>,
    <code>node webapp/export-data.js</code>, <code>python webapp/export-assets.py</code>
    e ricarica.</p>
  </div>`);

// La scelta del tavolo compare solo dove i tavoli esistono, cioe' dove
// risponde /api/stato. Sul PC (webapp/server.js serve solo file) e in tutti i
// banchi di prova headless quell'endpoint non c'e', e si entra come sempre:
// nessuno dei banchi va toccato, e nessuno di essi puo' inciampare in una
// schermata che non sa cos'e'.
async function avvio() {
  // COL TAVOLO GIA' SCELTO non si va sempre a casa: chi arbitra sceglie la
  // serata come sempre, chi gioca va DOVE E' L'ARBITRO. Decide `entraNelTavolo`,
  // che senza server (i banchi di prova, il `server.js` locale) non trova nulla
  // e finisce comunque su `vistaHome()` — nessun banco si accorge di niente.
  if (tavoloCorrente()) return entraNelTavolo(tavoloCorrente());
  let conAccount = false;
  try { conAccount = (await fetch('/api/stato')).ok; } catch { /* nessun server */ }
  return conAccount
    ? vistaTavoli(app, (id) => entraNelTavolo(id).catch(errore))
    : vistaHome();
}
avvio().catch(errore);
