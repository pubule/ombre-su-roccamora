// CHI SIEDE A QUESTO TAVOLO.
//
// Da quando la partita vive su un Durable Object, un giocatore può entrare dal
// proprio telefono e giocare il turno del suo eroe. Perché possa farlo, chi
// arbitra deve dire due cose: QUALE EMAIL e QUALE EROE. Finché questa schermata
// non c'è, quelle due cose si scrivono con `curl` — cioè non le scrive nessuno.
//
// Chi invita è solo chi arbitra: un giocatore seduto non può portarne altri,
// sarebbe un tavolo che si allarga da solo. Il Worker lo impone comunque
// (`arbitroDi` in api.js); qui il bottone non compare proprio, perché offrire
// un'azione che verrà rifiutata è peggio che non offrirla.
import { dati } from './store.js';
import { conferma } from './chiedi.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const primo = (nome) => String(nome).split(' ')[0].toLowerCase();

export async function vistaMembri(app, tavolo, nome, torna) {
  const comune = await dati('comune');
  const eroi = comune.eroi.map((e) => e.nome);

  async function carica() {
    try {
      const r = await fetch(`/api/membri?tavolo=${encodeURIComponent(tavolo)}`);
      if (!r.ok) return null;
      return (await r.json()).membri || [];
    } catch { return null; }
  }

  async function rendi(avviso) {
    const membri = await carica();
    if (membri === null) {
      app.innerHTML = `<div class="barra"><button class="btn" id="indietro">← tavoli</button>
          <div class="titolo">${esc(nome)}</div><span></span></div>
        <div class="pannello"><p class="nota">Non riesco a leggere chi siede al tavolo:
          manca la rete. Riprova.</p></div>`;
      document.getElementById('indietro').onclick = torna;
      return;
    }

    // gli eroi già presi non si possono dare due volte: è una regola, e il
    // database la impone con un indice unico. Qui si toglie solo dall'elenco,
    // così non si arriva nemmeno a chiederlo
    const presi = new Set(membri.map((m) => m.eroe).filter(Boolean));

    app.innerHTML = `
      <div class="barra"><button class="btn" id="indietro">← tavoli</button>
        <div class="titolo">${esc(nome)}</div><span></span></div>

      <div class="pannello">
        <h2>chi gioca a questo tavolo</h2>
        ${membri.length ? membri.map((m) => `
          <div class="nemico-riga">
            <span class="nemico-nome">${esc(m.nome || m.email)}
              <span class="nota">${m.eroe ? esc(primo(m.eroe)) : 'nessun eroe'}${
                m.ruolo === 'arbitro' ? ' · arbitra' : ''}${
                m.nome ? ` · ${esc(m.email)}` : ''}</span></span>
            <button class="btn piccolo togli-membro" data-email="${esc(m.email)}"
                    data-nome="${esc(m.nome || '')}">togli</button>
          </div>`).join('')
          : '<p class="nota">Ancora nessuno. Sei solo al tavolo: gli eroi li muovi tutti tu.</p>'}
        ${avviso ? `<p class="nota mt ko-txt">${esc(avviso)}</p>` : ''}
        ${membri.length ? `<div class="mt"><p class="nota">Da mandare a chi hai aggiunto —
          nessuno lo fa al posto tuo:</p>
          <input class="campo" id="link-tavolo" readonly value="${esc(location.origin)}">
          <div class="btn-riga mt"><button class="btn" id="copia-link">copia il link</button></div>
        </div>` : ''}
      </div>

      <div class="mt"></div>
      <div class="pannello">
        <h2>invita qualcuno</h2>
        <p class="nota"><b>Non parte nessuna email da qui.</b> Il posto al tavolo resta pronto:
          lui entra da solo aprendo l’app con quell’email — il link mandaglielo tu.
          Il <b>nome</b> è come lo chiami giocando; l’email serve solo alla porta.
          L’eroe si può lasciare in sospeso: quelli non presi da nessuno restano a te.</p>
        <input id="nome-invito" class="campo mt" type="text" maxlength="40"
               placeholder="come lo chiami al tavolo — «Giulia»" autocomplete="off">
        <input id="email-invito" class="campo mt" type="email" inputmode="email"
               placeholder="l’email con cui entrerà — amico@esempio.it" autocomplete="off">
        <select id="eroe-invito" class="campo mt">
          <option value="">— sceglie dopo —</option>
          ${eroi.map((n) => `<option value="${esc(n)}"${presi.has(n) ? ' disabled' : ''}>${
            esc(n.toLowerCase())}${presi.has(n) ? ' (già preso)' : ''}</option>`).join('')}
        </select>
        <div class="btn-riga mt"><button class="btn pieno" id="invita">dagli un posto</button></div>
      </div>`;

    document.getElementById('indietro').onclick = torna;

    const copia = document.getElementById('copia-link');
    if (copia) copia.onclick = async () => {
      const campo = document.getElementById('link-tavolo');
      campo.select();
      try { await navigator.clipboard.writeText(campo.value); copia.textContent = 'copiato'; }
      catch { copia.textContent = 'copialo a mano'; }   // senza permesso resta selezionato
    };

    document.getElementById('invita').onclick = async () => {
      const email = document.getElementById('email-invito').value.trim();
      const nome = document.getElementById('nome-invito').value.trim();
      const eroe = document.getElementById('eroe-invito').value || null;
      if (!email) return rendi('Serve l’email con cui entrerà nell’app.');
      try {
        const r = await fetch('/api/membri', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo, email, nome, eroe }),
        });
        if (!r.ok) {
          // il rifiuto del server si mostra com'è: dice già la cosa giusta
          // («quell'eroe è già di qualcun altro», «email non valida»)
          const d = await r.json().catch(() => ({}));
          return rendi(d.errore || 'Non riesco a invitare. Riprova.');
        }
      } catch { return rendi('Non riesco a invitare: manca la rete. Riprova.'); }
      rendi();
    };

    app.querySelectorAll('.togli-membro').forEach((b) => b.onclick = async () => {
      const chi = b.dataset.email;
      const come = b.dataset.nome || chi;
      if (!await conferma(`Togliere ${come} dal tavolo?`, {
        dettaglio: 'Non vedrà più questa campagna. Il suo eroe torna a chi arbitra.',
        si: 'toglietelo', no: 'lasciate stare',
      })) return;
      try {
        await fetch(`/api/membri?tavolo=${encodeURIComponent(tavolo)}&email=${encodeURIComponent(chi)}`,
                    { method: 'DELETE' });
      } catch { return rendi('Non riesco a togliere: manca la rete. Riprova.'); }
      rendi();
    });
  }

  await rendi();
}
