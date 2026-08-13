// Prima schermata: si sceglie il tavolo, poi si entra negli episodi.
// Un tavolo e' un gruppo di persone che gioca la sua campagna: le partite di
// due gruppi non si incrociano mai, nemmeno sullo stesso episodio.
import { impostaTavolo, tavoloCorrente, dimenticaTavolo } from './store.js';
import { conferma } from './chiedi.js';
import { vistaMembri } from './membri.js';
import { vistaMioEroe } from './mio-eroe.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function vistaTavoli(app, quandoScelto) {
  let stato = { tavoli: [], salvataggi: [], email: '' };
  let offline = false;
  try {
    const r = await fetch('/api/stato');
    if (r.ok) stato = await r.json(); else offline = true;
  } catch {
    offline = true;   // senza rete si va avanti col tavolo gia' scelto: la
  }                   // serata non si ferma perche' l'elenco non si carica

  if (offline && tavoloCorrente()) return quandoScelto(tavoloCorrente());

  const quante = (id) => stato.salvataggi.filter((s) => s.tavolo === id).length;
  const ultima = (id) => {
    const suoi = stato.salvataggi.filter((s) => s.tavolo === id);
    if (!suoi.length) return 'nessuna serata giocata';
    const q = new Date(Math.max(...suoi.map((s) => s.aggiornato))).toLocaleDateString('it-IT');
    return `${suoi.length} ${suoi.length === 1 ? 'partita' : 'partite'} · ultima serata: ${q}`;
  };

  app.innerHTML = `
    <header class="home-testata">
      <h1>ombre su roccamora</h1>
      <div class="sotto">${esc(stato.email || 'senza rete')}</div>
      <div class="filetto"></div>
    </header>
    <div class="pannello">
      <h2>chi gioca stasera?</h2>
      ${stato.tavoli.map((t) => `
        <div class="modo tavolo-voce${t.id === tavoloCorrente() ? ' attivo' : ''}"
             data-id="${esc(t.id)}" data-nome="${esc(t.nome)}">
          <h3>${esc(t.nome)}</h3>
          <p>${ultima(t.id)}</p>
          ${t.ruolo === 'arbitro' ? `<button class="btn piccolo membri-tavolo" data-id="${esc(t.id)}"
                  data-nome="${esc(t.nome)}">chi gioca</button>` : ''}
          <button class="btn piccolo elimina-tavolo" data-id="${esc(t.id)}"
                  data-nome="${esc(t.nome)}" data-partite="${quante(t.id)}">elimina</button>
        </div>`).join('')
      || '<p class="nota mt">Nessun tavolo ancora. Un tavolo è un gruppo che gioca la sua campagna.</p>'}
      <div class="btn-riga mt">
        <button class="btn pieno" id="nuovo-tavolo">nuovo tavolo</button>
      </div>
      <div id="modulo-tavolo" style="display:none" class="mt">
        <input id="nome-tavolo" class="campo" placeholder="Gruppo del giovedì" maxlength="80">
        <div class="btn-riga mt"><button class="btn pieno" id="crea-tavolo">crea</button></div>
      </div>
    </div>`;

  app.querySelectorAll('.tavolo-voce').forEach((el) => el.addEventListener('click', () => {
    impostaTavolo(el.dataset.id, el.dataset.nome);
    // CHI GIOCA E NON HA ANCORA UN EROE se lo prende adesso: entrare in una
    // partita senza sapere chi si e' — o peggio, con una plancia che non
    // risponde a nessun tocco — e' il modo peggiore di cominciare.
    const t = stato.tavoli.find((x) => x.id === el.dataset.id);
    if (t && t.ruolo !== 'arbitro' && !t.eroe) {
      return vistaMioEroe(app, t.id, t.nome, () => quandoScelto(t.id));
    }
    quandoScelto(el.dataset.id);
  }));

  app.querySelectorAll('.elimina-tavolo').forEach((el) => el.addEventListener('click', async (e) => {
    e.stopPropagation();            // il click non deve anche ENTRARE nel tavolo
    const { id, nome, partite } = el.dataset;
    const quante = Number(partite);
    // Qui si butta via una campagna intera, non una partita: la domanda dice
    // quanto costa, con il numero davanti.
    const avviso = quante
      ? `Se ne vanno anche le sue ${quante} ${quante === 1 ? 'partita' : 'partite'}. Non si torna indietro.`
      : 'Non ha partite salvate.';
    if (!await conferma(`Eliminare «${nome}»?`, {
      dettaglio: avviso, si: 'eliminate il tavolo', no: 'lasciate stare',
    })) return;
    try {
      const r = await fetch(`/api/tavolo?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(r.status);
    } catch {
      const p = document.createElement('p');
      p.className = 'nota mt';
      p.textContent = 'Non riesco a eliminare il tavolo: manca la rete. Riprova.';
      el.closest('.pannello').append(p);
      return;
    }
    dimenticaTavolo(id);            // senza questo risorgerebbe alla prima sincronizzazione
    vistaTavoli(app, quandoScelto);
  }));
  // «chi gioca» sta solo sui tavoli che arbitro: invitare e' dell'arbitro, e il
  // Worker lo impone comunque — un bottone che verra' rifiutato e' peggio che
  // nessun bottone
  app.querySelectorAll('.membri-tavolo').forEach((el) => el.addEventListener('click', (e) => {
    e.stopPropagation();            // il click non deve anche ENTRARE nel tavolo
    vistaMembri(app, el.dataset.id, el.dataset.nome, () => vistaTavoli(app, quandoScelto));
  }));

  document.getElementById('nuovo-tavolo').onclick = () => {
    document.getElementById('modulo-tavolo').style.display = '';
    document.getElementById('nome-tavolo').focus();
  };
  document.getElementById('crea-tavolo').onclick = async () => {
    const nome = document.getElementById('nome-tavolo').value.trim() || 'Il mio tavolo';
    const id = crypto.randomUUID();
    try {
      const r = await fetch('/api/tavolo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nome }),
      });
      if (!r.ok) throw new Error(r.status);
    } catch {
      // un tavolo che il server non conosce non serve a niente: meglio dirlo
      // adesso che scoprirlo a serata cominciata
      const p = document.createElement('p');
      p.className = 'nota mt';
      p.textContent = 'Non riesco a creare il tavolo: manca la rete. Riprova.';
      document.getElementById('modulo-tavolo').append(p);
      return;
    }
    impostaTavolo(id, nome);
    quandoScelto(id);
  };
}
