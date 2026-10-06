// Nebbia di sfondo: Vanta.FOG su three.js (vendorizzati in js/vendor/, mai
// da CDN — vedi fetch_vendor.sh). Caricati come script classici PRIMA di
// questo file (index.html): se mancano (dev locale senza build, o un
// mirror caduto) VANTA resta undefined e qui non si fa niente — un effetto
// decorativo non deve mai impedire all'app di partire.
//
// PALETTE «teal e brace» (scelta il 21/09/2026 fra sei, vedi
// webapp/public/mockups/nebbia-colori.html): i colori piu' presenti nelle
// copertine — teal scuro dell'acqua nelle valli, un filo di brace ruggine
// sulle creste — sopra il fondo --tavolo. Prima c'erano un verde-oliva e un
// ambra che sul fondo scuro facevano un marroncino fangoso. Niente --nastro:
// resta "il lume, solo dove si agisce".
//
// COSTO. Si gioca per ore su un iPad, e la nebbia e' un fragment shader a
// schermo intero che gira a ogni fotogramma: due cose la tengono leggera.
//  - `scale: 2` — Vanta disegna a devicePixelRatio/scale: su un display retina
//    e' un quarto dei pixel, e una nebbia sfocata non ha dettaglio da perdere.
//  - nel modo immersivo (la plancia a schermo intero, `#app.immersivo`) la
//    nebbia si NASCONDE (`display:none`) — dietro la plancia non si vede.
//
// UNA SOLA ISTANZA, mai distrutta. `#app.immersivo` si toglie e rimette molte
// volte per round (ogni carta pescata, ogni tessera rivelata: schermataCarta()
// in digitale.js), non solo quando si apre il menu. Fino al 22/09/2026 qui si
// chiamava `fx.destroy()` e poi `VANTA.FOG()` da capo ad ogni cambio: un
// contesto WebGL nuovo, shader ricompilati — misurato 36ms bloccanti a colpo
// (GPU discreta), fino a 230ms su GPU debole, e il driver perdeva/ripristinava
// il contesto (`CONTEXT_LOST_WEBGL` in console). `isOnScreen()` (dentro
// vanta.fog.min.js) gia' salta update/render quando l'elemento non si vede:
// nascondere costa zero disegno, senza pagare la ricostruzione.
//
// MA NASCONDERE NON BASTA: il suo `animationLoop()` richiama SEMPRE
// `requestAnimationFrame`, anche a schermo spento — `isOnScreen()` salta solo
// il render, non la richiamata. `destroy()` (di prima) faceva anche
// `cancelAnimationFrame`: nascondendo e basta, quel loop restava vivo per
// tutta la sessione, anche dentro la Spedizione dove la nebbia non torna mai
// visibile — un fotogramma in piu' per tutta la partita, a contendere il
// thread principale con le animazioni vere (dadi, token, carte). Qui si
// ferma/riparte quel loop a mano, senza pagare ne' l'uno ne' l'altro difetto.
if (typeof VANTA !== 'undefined') {
  const opzioni = {
    el: '#vanta-bg', mouseControls: false, touchControls: false, gyroControls: false,
    minHeight: 200, minWidth: 200, scale: 2, scaleMobile: 2,
    baseColor: 0x0c0e11, lowlightColor: 0x06191a, midtoneColor: 0x1a4a4d, highlightColor: 0x5c3421,
    // `speed` moltiplica il tempo (Vanta legge `speed || 1`, quindi 0 NON ferma: vale 1). A 0.8 la
    // nebbia scorreva cosi' piano che sul telefono sembrava ferma; con «riduci movimento» resta lenta.
    blurFactor: 0.35, speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.6 : 2.4, zoom: 1,
  };
  let fx = VANTA.FOG(opzioni);
  window.nebbiaFx = () => fx;      // per i banchi di prova: velocita' e tempo della nebbia viva
  const app = document.getElementById('app');
  const bg = document.getElementById('vanta-bg');
  const immersivo = () => !!app && app.classList.contains('immersivo');
  let vivo = true;
  const aggiorna = () => {
    if (bg) bg.style.display = immersivo() ? 'none' : '';
    if (immersivo() && vivo) { vivo = false; cancelAnimationFrame(fx.req); }
    else if (!immersivo() && !vivo) { vivo = true; if (typeof fx.animationLoop === 'function') fx.animationLoop(); }
    // Vanta misura il div solo all'avvio e a `resize`: se la finestra cambia mentre e'
    // display:none (ruota il telefono, si ritira la barra di Safari) lo trova alto 0 e
    // si ferma al minimo, 200x200 — al ritorno la nebbia copre solo la cima della pagina.
    if (!immersivo() && typeof fx.resize === 'function') fx.resize();
  };
  aggiorna();
  // LO SFONDO SI RIMISURA DA SOLO. Vanta misura il div all'avvio e a `resize`, e se in quel
  // momento e' nascosto (o la finestra cambia sotto una barra di Safari che si ritira) trova 0 e si
  // ferma al minimo, 200px: la nebbia copre solo la cima della pagina. Osservare il div stesso copre
  // tutti i casi — ruotare il telefono, tornare da un'altra app, uscire dal layout immersivo.
  // Se iOS ha tolto il contesto WebGL (app in secondo piano) la nebbia resta ferma: se ne rifa' una.
  const rimisura = () => {
    if (!bg || immersivo()) return;
    const gl = fx.renderer && fx.renderer.getContext && fx.renderer.getContext();
    if (gl && gl.isContextLost && gl.isContextLost()) {
      try { fx.destroy(); } catch { /* gia' andato */ }
      fx = VANTA.FOG(opzioni); vivo = true;
      return;
    }
    if (typeof fx.resize === 'function') fx.resize();
  };
  if (bg && typeof ResizeObserver !== 'undefined') new ResizeObserver(rimisura).observe(bg);
  addEventListener('pageshow', rimisura);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) rimisura(); });
  if (app) {
    new MutationObserver(aggiorna).observe(app, { attributes: true, attributeFilter: ['class'] });
  }
}

// DIAGNOSI DELLA NEBBIA (solo con ?diag nell'indirizzo): una riga fissa in basso che dice se la nebbia
// di sfondo avanza, a che dimensione, se il contesto WebGL e' vivo, e se le animazioni CSS della mappa
// girano. Serve a capire da uno screenshot perche' su un dispositivo la nebbia sembra ferma.
if (/[?&]diag\b/.test(location.search)) {
  const riga = document.createElement('pre');
  riga.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;margin:0;padding:6px 8px;'
    + 'background:rgba(0,0,0,.85);color:#9f9;font:11px/1.35 monospace;white-space:pre-wrap;pointer-events:none';
  document.body.appendChild(riga);
  let ultimo = null; let frame = 0; let prima = performance.now(); let fps = 0;
  const conta = () => { frame += 1; requestAnimationFrame(conta); };
  requestAnimationFrame(conta);
  setInterval(() => {
    const ora = performance.now(); fps = Math.round((frame * 1000) / (ora - prima)); frame = 0; prima = ora;
    const f = typeof window.nebbiaFx === 'function' ? window.nebbiaFx() : null;
    const gl = f && f.renderer && f.renderer.getContext && f.renderer.getContext();
    const c = document.querySelector('#vanta-bg canvas');
    const anim = document.getAnimations ? document.getAnimations() : [];
    const luna = anim.find((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.str-luna'));
    const t = f ? Math.round(f.t) : null;
    const avanza = ultimo === null ? '?' : (t !== ultimo ? 'SI' : 'NO');
    ultimo = t;
    riga.textContent = `vanta:${f ? 'ok' : 'assente'} t=${t} avanza=${avanza} speed=${f && f.options.speed}\n`
      + `canvas:${c ? c.width + 'x' + c.height : '-'} css:${c ? Math.round(c.getBoundingClientRect().height) : '-'} vp:${innerWidth}x${innerHeight} dpr:${devicePixelRatio}\n`
      + `gl perso:${gl && gl.isContextLost ? gl.isContextLost() : '?'} fps:${fps} ridotto:${matchMedia('(prefers-reduced-motion: reduce)').matches}\n`
      + `anim css:${anim.length} luna:${luna ? luna.playState + ' @' + Math.round(luna.currentTime) + 'ms' : 'nessuna'}`;
  }, 700);
}
