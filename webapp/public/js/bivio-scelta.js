// IL BIVIO NELL'EPILOGO: la domanda che chiude la serata e apre la prossima.
//
// Si decide INSIEME al tavolo — sono due strade con due prezzi, e nessuna e'
// quella giusta — ma a registrarla e' chi arbitra: e' la stessa mano che al
// tavolo scrive sul retro del Frammento, ed e' la ragione per cui i telefoni la
// vedono e non la toccano. Chi gioca deve poterla LEGGERE: e' la decisione
// della campagna, non una faccenda d'arbitro.
//
// Si puo' cambiare idea finche' l'episodio bersaglio non e' cominciato: il
// server riscrive invece di accumulare, e la gomma esiste anche sul Frammento.
//
// Sta qui e non dentro una delle due viste perche' l'epilogo e' due schermate —
// quella al tavolo (spedizione.js) e quella in digitale (digitale.js) — e una
// scelta di campagna scritta due volte diverge al primo ritocco.
import { scelteCampagna, registraScelta } from './store.js';
import { conferma } from './chiedi.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** @param puo  se chi guarda puo' sigillare (arbitro). Al tavolo: sempre. */
export function bivioHtml(ep, episodioId, puo = true) {
  const b = ep && ep.bivio;
  if (!b) return '';                     // l'Ep.20 e' il finale: non ne ha uno
  const scelto = scelteCampagna()[episodioId];
  return `
    <hr class="divisore">
    <div style="text-align:left" id="riq-bivio">
      <p class="nota">— il bivio: decidete insieme, poi sigillate —</p>
      <p><b>${esc(b.domanda)}</b></p>
      ${b.opzioni.map((o) => `
        <div class="pannello mt${scelto === o.id ? ' scelto' : ''}">
          <p><b>${esc(o.titolo)}</b></p>
          ${o.testo ? `<p class="nota">${esc(o.testo)}</p>` : ''}
          <ul class="nota">${(o.effetti || []).map((e) =>
            `<li>${esc(e.nota || e.testo || '')}</li>`).join('')}</ul>
          ${scelto === o.id ? '<p class="nota"><b>— sigillata —</b></p>'
            : (puo ? `<button class="btn" data-bivio="${esc(o.id)}">sigilla questa</button>` : '')}
        </div>`).join('')}
      ${puo || scelto ? '' : '<p class="nota">La sigilla chi arbitra.</p>'}
    </div>`;
}

/** Aggancia i bottoni. `ridisegna` ridisegna l'epilogo: sigillata si deve vedere. */
export function collegaBivio(app, ep, episodioId, ridisegna) {
  app.querySelectorAll('[data-bivio]').forEach((el) => {
    el.onclick = async () => {
      const o = ep.bivio.opzioni.find((x) => x.id === el.dataset.bivio);
      if (!await conferma(`«${o.titolo}»?`, {
        dettaglio: 'Cambia le regole degli episodi che verranno. Si può ancora cambiare idea, finché la prossima serata non comincia.',
        si: 'sì, si sigilla', no: 'ancora no',
      })) return;
      await registraScelta(episodioId, o.id);
      ridisegna();
    };
  });
}
