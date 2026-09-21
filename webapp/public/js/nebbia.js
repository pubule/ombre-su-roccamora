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
//    nebbia si SPEGNE del tutto — dietro la plancia non si vede — e riparte
//    quando si torna a una schermata normale.
if (typeof VANTA !== 'undefined') {
  const accendi = () => VANTA.FOG({
    el: '#vanta-bg', mouseControls: false, touchControls: false, gyroControls: false,
    minHeight: 200, minWidth: 200, scale: 2, scaleMobile: 2,
    baseColor: 0x0c0e11, lowlightColor: 0x06191a, midtoneColor: 0x1a4a4d, highlightColor: 0x5c3421,
    blurFactor: 0.35, speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.8, zoom: 1,
  });
  const app = document.getElementById('app');
  const immersivo = () => !!app && app.classList.contains('immersivo');
  let fx = immersivo() ? null : accendi();
  if (app) {
    new MutationObserver(() => {
      if (immersivo() && fx) { fx.destroy(); fx = null; }
      else if (!immersivo() && !fx) fx = accendi();
    }).observe(app, { attributes: true, attributeFilter: ['class'] });
  }
}
