// LO STRADARIO SULLA MAPPA — «la lanterna nella nebbia».
// Porto di mockups/stradario/c-lanterna.html: la città è al buio, dove il gruppo è già passato resta
// una luce bassa (la nebbia lì si è aperta), la via scelta la illumina la lanterna che si sposta, e il
// resto è un reticolo di lumini spenti. Sotto la mappa la dichiarazione («andate qui»), a fianco
// l'elenco con la ricerca (a scomparsa sul telefono).
//
// Solo markup e gestori: la regola (quanto costa, se è chiuso) resta al motore, e «andate qui» chiama
// soltanto `onDichiara`. Le posizioni stanno in stradario-coord.js.
import { COORD } from './stradario-coord.js';
import { urlArt, norm } from './engine.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const MAPPA = 'Mappa di campagna di Roccamora.jpg';
const Y = 1.336;                    // da % d'altezza alle unità del viewBox (100 × 133.6, come l'artwork)
const PASSI_ZOOM = [100, 160, 230];

const coordDi = (nome) => COORD[nome] || null;

// voci: [{ nome, indirizzo, battuta }] già ordinate (le battute in fondo)
export function stradarioMappaHtml(voci) {
  const conPos = voci.filter((v) => coordDi(v.nome));
  const buchi = conPos.filter((v) => v.battuta).map((v) => {
    const [x, y] = coordDi(v.nome);
    return `<circle cx="${x}" cy="${y * Y}" r="11" fill="url(#str-buco)"/>`;
  }).join('');
  const lumini = conPos.map((v) => {
    const [x, y] = coordDi(v.nome);
    return `<button class="str-pin${v.battuta ? ' battuta' : ''}" data-voce="${esc(v.nome)}"
      style="left:${x}%;top:${y}%" aria-label="${esc(v.nome)}${v.battuta ? ' — già battuto' : ''}">
      <span class="testa"></span></button>`;
  }).join('');
  const elenco = voci.map((v) => `<button class="voce${v.battuta ? ' battuta' : ''}" data-voce="${esc(v.nome)}"
      data-cerca="${esc(norm(v.nome + ' ' + (v.indirizzo || '')))}">
      <span><span class="nome">${esc(v.nome)}</span>
        <span class="indirizzo">${esc(v.indirizzo || '')}</span></span>
      ${v.battuta ? '<span class="segno"><span class="timbro">già battuto</span></span>' : ''}
    </button>`).join('');
  return `<div class="str">
    <div class="str-intesta"><h2>dove andate?</h2><span class="nota">portate la lanterna su una via</span></div>
    <div class="str-colonne">
      <div>
        <div class="str-telaio">
          <div class="str-scorre">
            <div class="str-mappa" id="str-mappa" style="background-image:url('${urlArt(MAPPA)}')">
              <div class="str-arte"></div>
              <svg class="str-nebbia" viewBox="0 0 100 133.6" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <radialGradient id="str-buco"><stop offset="0" stop-color="#000"/>
                    <stop offset=".55" stop-color="#000" stop-opacity=".75"/>
                    <stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
                  <mask id="str-maschera"><rect width="100" height="133.6" fill="#fff"/>
                    <g>${buchi}</g>
                    <circle id="str-luce" cx="-50" cy="-50" r="22" fill="url(#str-buco)"/></mask>
                </defs>
                <rect class="buio" width="100" height="133.6" mask="url(#str-maschera)"/>
              </svg>
              <div class="str-luna" aria-hidden="true"><i class="alone"></i><i class="fascio"></i><i class="velo v1"></i><i class="velo v2"></i><i class="velo v3"></i></div>
              ${lumini}
              <div class="str-cartiglio" id="str-cartiglio" hidden></div>
            </div>
          </div>
          <div class="str-zoom">
            <button class="zoom-btn" id="str-piu" aria-label="avvicinate">+</button>
            <button class="zoom-btn" id="str-meno" aria-label="allontanate">−</button>
          </div>
        </div>
        <div class="str-legenda">
          <span><i class="sp"></i>una via</span>
          <span><i class="ac"></i>già battuto</span>
        </div>
        <button class="btn str-piega" id="str-piega"><svg class="ic" aria-hidden="true"><use href="#i-lente"></use></svg><span>l’elenco delle vie</span></button>
      </div>
      <div class="str-fianco chiuso">
        <input class="cerca" id="cerca-via" placeholder="cerca una via…" autocomplete="off">
        <div class="str-elenco" id="lo-stradario">${elenco}</div>
      </div>
    </div>
    <div class="str-dichiara"><div class="str-lastra" id="str-dichiara">
      <span class="vuoto">la città è al buio: toccate un lumino per farvi luce</span>
    </div></div>
  </div>`;
}

// I VELI DI NEBBIA CHIARA scorrono da JavaScript (un fotogramma alla volta, solo transform) e non da
// animazioni CSS: sul telefono le animazioni dentro uno strato con mix-blend-mode risultavano «in
// corso» ma non si ridisegnavano, e la nebbia sembrava ferma.
function animaVeli(mappa) {
  const veli = [...mappa.querySelectorAll('.str-luna .velo')];
  if (!veli.length) return;
  const lento = matchMedia('(prefers-reduced-motion: reduce)').matches ? 4 : 1;
  const periodi = [20000, 28000, 15000].map((p) => p * lento);
  const t0 = performance.now();
  const passo = (ora) => {
    if (!mappa.isConnected) return;
    veli.forEach((v, i) => {
      const f = (((ora - t0) / periodi[i]) + i * 0.37) % 1;
      const x = (i % 2 ? 1 - f : f) * 100 - 20;
      v.style.transform = `translate3d(${x}%,0,0)`;
    });
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export function agganciaStradarioMappa(radice, voci, { onDichiara }) {
  const q = (s) => radice.querySelector(s);
  const mappa = q('#str-mappa'); if (!mappa) return;
  animaVeli(mappa);
  const cart = q('#str-cartiglio'); const luce = q('#str-luce');
  const perNome = new Map(voci.map((v) => [v.nome, v]));
  let scelta = null; let z = 0;

  function scegli(nome, scorri) {
    const v = perNome.get(nome);
    // lo zoom rilancia la scelta dopo un attimo: nel frattempo la schermata puo' essere cambiata
    if (!v || !mappa.isConnected) return;
    scelta = nome;
    radice.querySelectorAll('[data-voce]').forEach((el) =>
      el.classList.toggle(el.classList.contains('str-pin') ? 'scelto' : 'scelta', el.dataset.voce === nome));
    const p = coordDi(nome);
    if (p) {
      cart.hidden = false; cart.textContent = v.nome;
      // il cartiglio sta sopra il lumino ma non deve uscire dalla mappa: lo si tiene dentro ai bordi,
      // e sotto il lumino se in alto non c'e' posto
      const W = mappa.offsetWidth; const w = cart.offsetWidth; const h = cart.offsetHeight;
      const x = Math.min(Math.max((p[0] / 100) * W, w / 2 + 6), W - w / 2 - 6);
      const sotto = (p[1] / 100) * mappa.offsetHeight < h + 34;
      cart.style.left = x + 'px'; cart.style.top = p[1] + '%';
      cart.classList.toggle('sotto', sotto);
      luce.setAttribute('cx', p[0]); luce.setAttribute('cy', p[1] * Y);
    } else { cart.hidden = true; luce.setAttribute('cx', -50); luce.setAttribute('cy', -50); }
    q('#str-dichiara').innerHTML = `
      <div><div class="dove">${esc(v.nome)}</div>
        <div class="indirizzo">${esc(v.indirizzo || '')}</div>
        ${v.battuta ? '<div class="battuto-tag">già battuto — tornarci costa un’altra ora</div>' : ''}</div>
      <button class="btn pieno" id="str-andate"><svg class="ic" aria-hidden="true"><use href="#i-orma"></use></svg>andate qui</button>`;
    q('#str-andate').onclick = () => onDichiara(nome);
    if (scorri && p) {
      const pin = mappa.querySelector(`.str-pin[data-voce="${CSS.escape(nome)}"]`);
      if (pin && pin.scrollIntoView) pin.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    }
  }

  radice.addEventListener('click', (e) => {
    const el = e.target.closest('[data-voce]');
    if (el && radice.contains(el)) scegli(el.dataset.voce, !el.classList.contains('str-pin'));
  });

  // cerca: filtra l'elenco E spegne i lumini che non c'entrano
  q('#cerca-via').addEventListener('input', (e) => {
    const t = norm(e.target.value.trim());
    radice.querySelectorAll('.voce[data-cerca]').forEach((el) => {
      el.style.display = !t || el.dataset.cerca.includes(t) ? '' : 'none';
    });
    mappa.querySelectorAll('.str-pin').forEach((el) => {
      const v = perNome.get(el.dataset.voce);
      el.classList.toggle('spento', !!t && !norm(v.nome + ' ' + (v.indirizzo || '')).includes(t));
    });
  });

  // zoom: la mappa si allarga dentro il telaio, e si scorre col dito
  const zoom = (d) => {
    z = Math.max(0, Math.min(PASSI_ZOOM.length - 1, z + d));
    mappa.style.width = PASSI_ZOOM[z] + '%';
    if (scelta != null) setTimeout(() => scegli(scelta, true), 260);
  };
  q('#str-piu').onclick = () => zoom(1);
  q('#str-meno').onclick = () => zoom(-1);

  const piega = q('#str-piega');
  piega.onclick = () => {
    const f = q('.str-fianco');
    f.classList.toggle('chiuso');
    piega.lastChild.textContent = f.classList.contains('chiuso') ? 'l’elenco delle vie' : 'chiudete l’elenco';
  };
}
