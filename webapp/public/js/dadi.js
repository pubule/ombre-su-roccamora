// Tiro di dadi "da palcoscenico" (richiesta esplicita: stile Baldur's Gate 3):
// overlay a schermo intero, 2d6 tridimensionali che rotolano AL TOCCO del
// giocatore (mai un tiro automatico - regola del piano), bonus che si
// sommano uno a uno, verdetto drammatico contro la soglia.
//
// API:  const esito = await tiraProva({
//         titolo: 'prova di nervi', diffLabel: 'Media', soglia: 9,
//         bonus: [{ label: 'NERVI di Elena', val: 2 }, ...] });
//       esito = { d1, d2, somma, tot, ok }   (null se annullata)

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

// `modo: 'tavolo'` — al tavolo i dadi sono FISICI: l'app chiede il totale
// dei 2d6 e applica bonus e soglia (con un ripiego "tira l'app" per chi
// non ha dadi a portata). Senza modo (o 'digitale'): tiro animato al tocco.
export function tiraProva({ titolo, diffLabel = '', soglia, bonus = [], modo }) {
  return new Promise((risolvi) => {
    const tavolo = modo === 'tavolo';
    const overlay = document.createElement('div');
    overlay.className = 'dadi-overlay';
    overlay.innerHTML = `
      <div class="dadi-testata">
        <div class="dadi-titolo sc">${esc(titolo)}</div>
        ${soglia != null ? `<div class="dadi-soglia sc">${esc(diffLabel)} · ${soglia}</div>` : ''}
      </div>
      <div class="dadi-coppia">${dadoHtml('dado-a')}${dadoHtml('dado-b')}</div>
      <div class="dadi-conto" id="dadi-conto"></div>
      <div class="dadi-verdetto sc" id="dadi-verdetto"></div>
      <div class="dadi-tavolo" id="dadi-tavolo" ${tavolo ? '' : 'style="display:none"'}>
        <p class="dadi-istruzione sc">tirate i 2d6 veri — quanto fanno, senza bonus?</p>
        <div class="dadi-grid">
          ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) =>
            `<button class="btn" data-tot="${n}">${n}</button>`).join('')}
        </div>
        <button class="btn dadi-ripiego" id="dadi-app">niente dadi? tira l’app</button>
      </div>
      <button class="btn pieno dadi-lancia" id="dadi-lancia"
              ${tavolo ? 'style="display:none"' : ''}>tocca per tirare</button>
      <button class="btn dadi-chiudi" id="dadi-chiudi" style="display:none">continua</button>
      <button class="dadi-annulla" id="dadi-annulla">×</button>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('aperto'));

    const chiudi = (esito) => {
      overlay.classList.remove('aperto');
      setTimeout(() => overlay.remove(), 350);
      risolvi(esito);
    };
    overlay.querySelector('#dadi-annulla').onclick = () => chiudi(null);

    // conto alla BG3 + verdetto: condiviso tra tiro animato e totale inserito
    async function esito(d1, d2) {
      overlay.querySelector('#dadi-annulla').style.display = 'none';
      const conto = overlay.querySelector('#dadi-conto');
      const somma = d1 + d2;
      let tot = somma;
      const pezzi = [`<span class="pezzo">2d6 = <b>${somma}</b></span>`];
      conto.innerHTML = pezzi.join('');
      for (const b of bonus) {
        await attesa(420);
        tot += b.val;
        pezzi.push(`<span class="pezzo">${b.val >= 0 ? '+' : '−'}${Math.abs(b.val)} <i>${esc(b.label)}</i></span>`);
        conto.innerHTML = pezzi.join('<span class="op"></span>') +
          `<span class="pezzo tot">= <b>${tot}</b></span>`;
      }
      if (!bonus.length) conto.innerHTML += `<span class="pezzo tot">= <b>${tot}</b></span>`;

      await attesa(500);
      const verdetto = overlay.querySelector('#dadi-verdetto');
      let ok = null;
      if (soglia != null) {
        ok = tot >= soglia;
        verdetto.textContent = ok ? 'successo' : 'fallita';
        verdetto.classList.add(ok ? 'ok' : 'ko');
        overlay.classList.add(ok ? 'esito-ok' : 'esito-ko');
      } else {
        verdetto.textContent = `totale ${tot}`;
        verdetto.classList.add('ok');
      }
      const btn = overlay.querySelector('#dadi-chiudi');
      btn.style.display = '';
      btn.onclick = () => chiudi({ d1, d2, somma, tot, ok });
    }

    // totale dai dadi veri: i cubi si orientano sul risultato, senza rotolo
    overlay.querySelectorAll('[data-tot]').forEach((b) => b.onclick = async () => {
      const t = Number(b.dataset.tot);
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
    overlay.querySelector('#dadi-app').onclick = () => {
      overlay.querySelector('#dadi-tavolo').style.display = 'none';
      overlay.querySelector('#dadi-lancia').style.display = '';
    };

    overlay.querySelector('#dadi-lancia').onclick = async (ev) => {
      ev.target.style.display = 'none';
      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
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
