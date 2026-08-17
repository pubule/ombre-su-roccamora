// Tiro di dadi "da palcoscenico", nella pelle «notte e nebbia» e alla maniera
// di Baldur's Gate 3: overlay a schermo intero, 2d6 d'osso con le fiammelle che
// rotolano AL TOCCO del giocatore (mai un tiro automatico - regola del piano).
//
// Cosa si e' preso da BG3, e perche' (i mockup stanno in
// public/mockups/stile2/nebbia2-tiro.html):
//
//   1. CHI TIRA HA UNA FACCIA. Il ritratto accanto alla prova: al tavolo la
//      domanda piu' frequente e' «tocca a me?», e il ritratto la chiude prima
//      che venga fatta.
//   2. IL CONTO E' UN REGISTRO, NON UNA RIGA. Un modificatore per riga, ognuno
//      col SUO nome, il totale a destra. La catena di pastiglie si leggeva come
//      una formula; un registro si legge come un conto.
//   3. LA SOGLIA STA A SCHERMO PRIMA, DURANTE E DOPO, e alla fine c'e' scritto
//      il confronto («7 < 9»): prima restava «fallita» senza il perche'.
//   4. LA SECONDA OCCASIONE ARRIVA DOPO IL FALLIMENTO — l'Ispirazione di BG3.
//      Il Secondo Fiato era una schermata a parte, che si apriva quando la
//      finestra del tiro era gia' chiusa: si sceglieva di ritentare senza piu'
//      avere sotto gli occhi quel che era andato storto.
//   5. IL VERDETTO SI IMPRIME SUI DADI, che sotto si spengono: l'occhio e' gia'
//      li'.
//
// API:  const esito = await tiraProva({
//         titolo: 'guardare meglio — elena', diffLabel: 'Media', soglia: 9,
//         bonus: [{ label: 'ACUME', val: 2 }],
//         eroe: { nome: 'ELENA FOSCO', ritratto: '/artworks/Elena.png' },
//         secondaOccasione: { label: 'Secondo Fiato di Elena', nota: '...' } });
//       esito = { d1, d2, somma, tot, ok, sempre, seconda }   (null se annullata)

const FACCE = {
  1: [[50, 50]],
  2: [[26, 26], [74, 74]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[26, 26], [74, 26], [26, 74], [74, 74]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[26, 26], [74, 26], [26, 50], [74, 50], [26, 74], [74, 74]],
};

// orientamento del cubo perche' la faccia N guardi lo schermo
const ROT = {
  1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180],
};

function facciaHtml(n, classe) {
  return `<div class="dado-faccia ${classe}">
    ${FACCE[n].map(([x, y]) => `<span class="pip" style="left:${x}%;top:${y}%"></span>`).join('')}
  </div>`;
}

function dadoHtml(id) {
  return `
  <div class="dado-scena"><div class="dado" id="${id}">
    ${facciaHtml(1, 'f1')}${facciaHtml(6, 'f6')}${facciaHtml(2, 'f2')}
    ${facciaHtml(5, 'f5')}${facciaHtml(3, 'f3')}${facciaHtml(4, 'f4')}
  </div></div>`;
}

const attesa = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const primo = (nm) => String(nm || '').split(' ')[0].toLowerCase();

// il titolo delle prove porta gia' dentro il nome di chi tira («guardare
// meglio — elena»): col ritratto accanto sarebbe scritto due volte, e la riga
// andrebbe a capo proprio dove si legge in fretta
function soloLaProva(titolo, eroe) {
  const t = String(titolo || '');
  if (!eroe || !eroe.nome) return t;
  const coda = t.split(/\s+[—–-]\s+/).pop();
  return primo(coda) === primo(eroe.nome) ? t.slice(0, t.length - coda.length).replace(/\s*[—–-]\s*$/, '') : t;
}

// 1 · CHI TIRA, la prova, e la soglia che non se ne va mai (3)
function chiTiraHtml({ titolo, diffLabel, soglia, eroe }) {
  const prova = soloLaProva(titolo, eroe);
  return `
    <div class="chi-tira">
      ${eroe && eroe.ritratto ? `<img src="${esc(eroe.ritratto)}" alt="" loading="lazy">` : ''}
      <span class="nome">${esc(eroe && eroe.nome ? primo(eroe.nome) : prova)}
        <span class="prova">${esc(eroe && eroe.nome ? prova : diffLabel || '')}${
          eroe && eroe.nome && diffLabel ? ` · ${esc(String(diffLabel).toLowerCase())}` : ''}</span></span>
      ${soglia != null ? `<span class="soglia">da<b>${soglia}</b></span>` : ''}
    </div>`;
}

// `modo: 'tavolo'` — al tavolo i dadi sono FISICI: l'app chiede il totale
// dei 2d6 e applica bonus e soglia (con un ripiego "tira l'app" per chi
// non ha dadi a portata). Senza modo (o 'digitale'): tiro animato al tocco.
//
// `ripiegoSempre: { label }` — un SECONDO ripiego che non vale solo per questo
// tiro ma «da qui in poi»: serve ai tiri dei nemici, dove tirare a mano per
// ognuno diventa contabilita' quando il campo si affolla. Chi lo preme ottiene
// il tiro dell'app subito, e l'esito torna con `sempre: true` perche' il
// chiamante possa ricordarselo per il resto della partita.
//
// `facce: [d1, d2]` — IL TIRO E' GIA' DECISO e questo overlay lo mette in
// scena, non lo decide. Serve da quando le regole stanno nel motore: e' il
// motore a tirare, col generatore seminato della partita, e questa e' la
// differenza fra una serata che si puo' rigiocare e una che no. Senza `facce`
// l'overlay tira da se', com'era.
//
// `soloVista: true` — IL TIRO E' DI QUALCUN ALTRO, e questo schermo lo guarda.
// I dadi arrivano gia' fermi sul risultato, il conto e' scritto per intero e
// non c'e' niente da premere se non «continua»: e' come stare al tavolo mentre
// tira il tuo compagno.
export function tiraProva({ titolo, diffLabel = '', soglia, bonus = [], modo, ripiegoSempre,
                            facce, sceltaOgniVolta, eroe, soloVista, secondaOccasione }) {
  return new Promise((risolvi) => {
    // `sceltaOgniVolta` — TUTT'E DUE LE STRADE, e si sceglie a ogni tiro.
    // Serve alle prove d'Indagine, che le tira chi ha l'eroe dal suo telefono:
    // al tavolo si tirano dadi veri finche' li si ha in mano, e si passa all'app
    // quando sono rotolati sotto la sedia — deciderlo una volta per tutta la
    // serata con `modo` era una scelta presa nel momento sbagliato.
    // I due pezzi c'erano gia' entrambi: uno era `display:none`.
    const tavolo = !soloVista && (sceltaOgniVolta || modo === 'tavolo');
    const virtuale = !soloVista && (sceltaOgniVolta || modo !== 'tavolo');
    let sempre = false;
    const overlay = document.createElement('div');
    // `dadi-overlay` resta anche nella pelle nuova: e' l'appiglio di tutti i
    // banchi di misura, e il tiro e' la stessa cosa vestita diversamente
    overlay.className = 'dadi-overlay tiro';
    overlay.innerHTML = `
      ${chiTiraHtml({ titolo, diffLabel, soglia, eroe })}
      <div class="pozza" id="dadi-pozza">
        ${dadoHtml('dado-a')}${dadoHtml('dado-b')}
        <div class="stampa" id="dadi-verdetto"></div>
      </div>
      <div class="registro-tiro" id="dadi-conto"></div>
      <div class="dadi-tavolo" id="dadi-tavolo" ${tavolo ? '' : 'style="display:none"'}>
        <p class="dadi-istruzione">${sceltaOgniVolta
          ? 'avete tirato dadi veri? dite quanto fanno, senza bonus'
          : 'tirate i 2d6 veri — quanto fanno, senza bonus?'}</p>
        <div class="dadi-grid">
          ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) =>
            `<button class="btn" data-tot="${n}">${n}</button>`).join('')}
        </div>
        ${sceltaOgniVolta ? '' :
          '<button class="btn dadi-ripiego" id="dadi-app">niente dadi? tira l’app</button>'}
        ${ripiegoSempre ? `<button class="btn dadi-ripiego" id="dadi-sempre">${esc(ripiegoSempre.label)}</button>` : ''}
      </div>
      <div class="in-fondo">
        <div class="seconda" id="dadi-seconda" style="display:none"></div>
        <button class="btn pieno dadi-lancia" id="dadi-lancia"
                ${virtuale ? '' : 'style="display:none"'}>tocca per tirare</button>
        <button class="btn pieno dadi-chiudi" id="dadi-chiudi" style="display:none">continua</button>
        <button class="btn dadi-annulla" id="dadi-annulla"
                ${soloVista ? 'style="display:none"' : ''}>annullate</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('aperto'));

    const chiudi = (esito) => {
      overlay.classList.remove('aperto');
      setTimeout(() => overlay.remove(), 350);
      risolvi(esito);
    };
    overlay.querySelector('#dadi-annulla').onclick = () => chiudi(null);

    // 2 · IL REGISTRO: una riga per pezzo, il nome a sinistra e il valore a
    // destra, e le righe entrano UNA ALLA VOLTA — e' il tempo del tiro, ed e'
    // quel che rende un conto una scena.
    const riga = (da, sotto, val, cls = '') => `
      <div class="riga ${cls}"><span class="da">${esc(da)}${
        sotto ? `<i>${esc(sotto)}</i>` : ''}</span>
        <span class="val">${esc(val)}</span></div>`;

    async function esito(d1, d2, { subito = false } = {}) {
      overlay.querySelector('#dadi-annulla').style.display = 'none';
      const conto = overlay.querySelector('#dadi-conto');
      const somma = d1 + d2;
      let tot = somma;
      const righe = [riga('2d6', 'i dadi, nudi', somma)];
      conto.innerHTML = righe.join('');
      for (const b of bonus) {
        if (!subito) await attesa(420);
        tot += b.val;
        righe.push(riga(b.label, b.di || '', `${b.val >= 0 ? '+' : '−'}${Math.abs(b.val)}`));
        conto.innerHTML = righe.join('');
      }
      if (!subito) await attesa(320);
      righe.push(riga('in tutto', '', tot, 'tot'));
      conto.innerHTML = righe.join('');

      let ok = null;
      if (soglia != null) {
        ok = tot >= soglia;
        // 3 · il confronto scritto: perche' e' successo, non solo che e' successo
        if (!subito) await attesa(260);
        righe.push(riga('contro la soglia', '', `${tot} ${ok ? '≥' : '<'} ${soglia}`,
                        `confronto ${ok ? '' : 'ko'}`));
        conto.innerHTML = righe.join('');
      }

      if (!subito) await attesa(340);
      // 5 · il verdetto si imprime SUI dadi, che sotto si spengono
      const verdetto = overlay.querySelector('#dadi-verdetto');
      verdetto.textContent = ok == null ? `totale ${tot}` : (ok ? 'successo' : 'fallita');
      verdetto.classList.add(ok === false ? 'ko' : 'ok');
      overlay.querySelector('#dadi-pozza').classList.add('deciso');
      overlay.classList.add(ok === false ? 'esito-ko' : 'esito-ok');

      const fine = (extra) => chiudi({ d1, d2, somma, tot, ok, sempre, ...extra });

      // 4 · LA SECONDA OCCASIONE, e solo ora che e' andata male
      const box = overlay.querySelector('#dadi-seconda');
      if (secondaOccasione && ok === false) {
        box.innerHTML = `
          <span class="che">${esc(secondaOccasione.che || 'c’è ancora una carta da giocare')}</span>
          <button class="btn pieno" id="dadi-seconda-si">${esc(secondaOccasione.label)}</button>
          ${secondaOccasione.nota ? `<span class="quanto">${esc(secondaOccasione.nota)}</span>` : ''}`;
        box.style.display = '';
        box.querySelector('#dadi-seconda-si').onclick = () => fine({ seconda: true });
      }
      const btn = overlay.querySelector('#dadi-chiudi');
      btn.style.display = '';
      // quando c'e' una seconda occasione, «continua» vuol dire «accetto»: il
      // bottone acceso e' quello della carta da giocare, non quello che chiude
      if (secondaOccasione && ok === false) {
        btn.classList.remove('pieno');
        btn.textContent = 'accettate il fallimento';
      }
      btn.onclick = () => fine({});
    }

    // IL TIRO DI QUALCUN ALTRO, guardato da qui: i cubi sono gia' fermi e il
    // conto e' gia' scritto — non c'e' niente da aspettare, e' gia' successo.
    if (soloVista) {
      const [d1, d2] = facce || [1, 1];
      for (const [id, val] of [['dado-a', d1], ['dado-b', d2]]) {
        const [rx, ry] = ROT[val];
        overlay.querySelector('#' + id).style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      esito(d1, d2, { subito: true });
      return;
    }

    // totale dai dadi veri: i cubi si orientano sul risultato, senza rotolo
    overlay.querySelectorAll('[data-tot]').forEach((b) => b.onclick = async () => {
      const t = Number(b.dataset.tot);
      // dichiarato il totale, il bottone del tiro virtuale sparisce: due strade
      // ancora aperte a tiro gia' fatto sono due esiti per la stessa prova
      overlay.querySelector('#dadi-lancia').style.display = 'none';
      const d1 = Math.max(1, t - 6) + Math.floor(Math.random() *
        (Math.min(6, t - 1) - Math.max(1, t - 6) + 1));
      const d2 = t - d1;
      overlay.querySelector('#dadi-tavolo').style.display = 'none';
      for (const [id, val] of [['dado-a', d1], ['dado-b', d2]]) {
        const el = overlay.querySelector('#' + id);
        const [rx, ry] = ROT[val];
        el.style.transition = 'transform .5s ease';
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      await attesa(550);
      esito(d1, d2);
    });

    // ripiego al tavolo: nessun dado sottomano, tira l'app
    const passaAllApp = () => {
      overlay.querySelector('#dadi-tavolo').style.display = 'none';
      overlay.querySelector('#dadi-lancia').style.display = '';
    };
    const btnApp = overlay.querySelector('#dadi-app');
    if (btnApp) btnApp.onclick = passaAllApp;
    // ...e lo stesso, ma valido da qui in avanti (lo ricorda il chiamante)
    const btnSempre = overlay.querySelector('#dadi-sempre');
    if (btnSempre) btnSempre.onclick = () => { sempre = true; passaAllApp(); };

    overlay.querySelector('#dadi-lancia').onclick = async (ev) => {
      ev.target.style.display = 'none';
      overlay.querySelector('#dadi-tavolo').style.display = 'none';
      const d1 = facce ? facce[0] : 1 + Math.floor(Math.random() * 6);
      const d2 = facce ? facce[1] : 1 + Math.floor(Math.random() * 6);
      // rotolo: giri extra casuali + atterraggio sulla faccia giusta,
      // il secondo dado si ferma un attimo dopo (drammaturgia)
      for (const [id, val, dur] of [['dado-a', d1, 1.5], ['dado-b', d2, 2.0]]) {
        const el = overlay.querySelector('#' + id);
        const [rx, ry] = ROT[val];
        const giriX = 360 * (2 + Math.floor(Math.random() * 2));
        const giriY = 360 * (2 + Math.floor(Math.random() * 2));
        el.style.transition = `transform ${dur}s cubic-bezier(.18,.9,.32,1.04)`;
        el.style.transform = `rotateX(${giriX + rx}deg) rotateY(${giriY + ry}deg)`;
      }
      await attesa(2150);
      esito(d1, d2);
    };
  });
}
