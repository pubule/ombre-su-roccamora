// PRENDITI IL TUO EROE.
//
// Chi arbitra dice a quale tavolo siedi; quale eroe giochi lo decidi tu. È la
// cosa che lo schema prevedeva fin dall'inizio (`eroe` NULL finché non sceglie)
// e che mancava: senza, l'arbitro sceglieva per tutti, uno per uno, prima di
// ogni serata — e chi arrivava dopo restava con un posto muto finché qualcuno
// non tornava sul PC ad assegnarglielo.
//
// Si vede solo quello che serve a scegliere: i ritratti della compagnia, chi è
// già preso e da chi. Il resto (invitare, comporre la compagnia, togliere) è di
// chi arbitra e non compare.
import { dati } from './store.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const primo = (s) => String(s).split(' ')[0];

export async function vistaMioEroe(app, tavolo, nomeTavolo, quandoPreso) {
  const comune = await dati('comune');

  async function stato() {
    try {
      const [s, m] = await Promise.all([
        fetch('/api/stato').then((r) => r.ok ? r.json() : null),
        fetch(`/api/membri?tavolo=${encodeURIComponent(tavolo)}`).then((r) => r.ok ? r.json() : null),
      ]);
      if (!s || !m) return null;
      const t = (s.tavoli || []).find((x) => x.id === tavolo);
      return {
        io: s.email,
        party: t && t.party ? JSON.parse(t.party) : [],
        membri: m.membri || [],
      };
    } catch { return null; }
  }

  async function rendi(avviso) {
    const d = await stato();
    if (!d) {
      app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
        <div class="pannello"><p class="nota">Non riesco a leggere il tavolo: manca la rete.</p>
        <div class="btn-riga mt"><button class="btn" id="riprova">riprova</button></div></div>`;
      document.getElementById('riprova').onclick = () => rendi();
      return;
    }

    const mio = d.membri.find((m) => m.email === d.io) || {};
    // chi ha preso cosa: serve a dire «di Giulia» invece di un generico
    // «occupato» — al tavolo si gioca con delle persone, non con degli slot
    const di = {};
    for (const m of d.membri) if (m.eroe) di[m.eroe] = m.nome || m.email;

    if (!d.party.length) {
      app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
        <div class="pannello"><h2>ancora niente da scegliere</h2>
          <p>Chi arbitra non ha ancora composto la compagnia. Appena l’avrà fatto,
             qui troverai gli eroi liberi.</p>
          <div class="btn-riga mt"><button class="btn" id="riprova">guarda di nuovo</button></div>
        </div>`;
      document.getElementById('riprova').onclick = () => rendi();
      return;
    }

    app.innerHTML = `
      <div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
      <div class="pannello">
        <h2>${mio.eroe ? 'il tuo eroe' : 'prenditi un eroe'}</h2>
        <p class="nota">${mio.eroe
          ? `Giochi <b>${esc(primo(mio.eroe).toLowerCase())}</b>. Puoi cambiarlo finché la serata non comincia.`
          : 'Tocca il ritratto di chi vuoi giocare. Quelli già presi non si possono prendere.'}</p>
        <div class="griglia-arruolo mt">
          ${d.party.map((n) => {
    const e = comune.eroi.find((x) => x.nome === n) || { nome: n, art: '', ruolo: '' };
    const suo = mio.eroe === n;
    const altrui = di[n] && !suo;
    return `<div class="eroe-tile${suo ? ' scelto' : ''}${altrui ? ' preso' : ''}"
                 data-nome="${esc(n)}"${altrui ? ' data-altrui="1"' : ''}>
        <img loading="lazy" src="${encodeURI('/assets/artworks/' + e.art)}" alt="">
        <div class="eroe-velo"></div>
        <div class="eroe-nome"><b>${esc(n.toLowerCase())}</b>
          <i>${altrui ? `di ${esc(primo(di[n]))}` : esc(e.ruolo || '')}</i></div>
        <div class="spunta">✓</div>
      </div>`;
  }).join('')}
        </div>
        ${avviso ? `<p class="nota mt ko-txt">${esc(avviso)}</p>` : ''}
        ${mio.eroe ? `<div class="btn-riga mt">
          <button class="btn pieno" id="entra">si comincia</button></div>` : ''}
      </div>`;

    app.querySelectorAll('.eroe-tile').forEach((el) => el.onclick = async () => {
      if (el.dataset.altrui) return rendi('Quell’eroe l’ha già preso qualcun altro.');
      const scelto = el.dataset.nome === mio.eroe ? null : el.dataset.nome;
      try {
        const r = await fetch('/api/mio-eroe', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo, eroe: scelto }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          return rendi(j.errore || 'Non riesco a prendere quell’eroe.');
        }
      } catch { return rendi('Non riesco a prendere quell’eroe: manca la rete.'); }
      rendi();
    });

    const entra = document.getElementById('entra');
    if (entra) entra.onclick = () => quandoPreso();
  }

  await rendi();
}
