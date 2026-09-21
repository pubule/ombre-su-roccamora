// Nebbia di sfondo: Vanta.FOG su three.js (vendorizzati in js/vendor/, mai
// da CDN — vedi fetch_vendor.sh). Caricati come script classici PRIMA di
// questo file (index.html): se mancano (dev locale senza build, o un
// mirror caduto) VANTA resta undefined e qui non si fa niente — un effetto
// decorativo non deve mai impedire all'app di partire.
//
// PALETTE: vedi webapp/public/mockups/nebbia.html per i due tentativi
// scartati (un blu preso a caso, poi i token --osso-fioco che inondavano
// tutto di luce). Qui: toni scurissimi vicini a --tavolo/--ardesia con un
// filo di verde-oliva e ambra spenti — il gas delle lanterne filtrato dalla
// nebbia. Niente --nastro: resta "il lume, solo dove si agisce".
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
    baseColor: 0x0c0e11, lowlightColor: 0x0c0e11, midtoneColor: 0x142220, highlightColor: 0x4a3a24,
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
