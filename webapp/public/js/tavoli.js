// Prima schermata: si sceglie il tavolo, poi si entra negli episodi.
// Un tavolo e' un gruppo di persone che gioca la sua campagna: le partite di
// due gruppi non si incrociano mai, nemmeno sullo stesso episodio.
import { impostaTavolo, tavoloCorrente } from './store.js';

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

  const ultima = (id) => {
    const suoi = stato.salvataggi.filter((s) => s.tavolo === id);
    if (!suoi.length) return 'nessuna serata giocata';
    return `ultima serata: ${new Date(Math.max(...suoi.map((s) => s.aggiornato))).toLocaleDateString('it-IT')}`;
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
        <div class="modo tavolo-voce" data-id="${esc(t.id)}">
          <h3>${esc(t.nome)}</h3>
          <p>${ultima(t.id)}</p>
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
    impostaTavolo(el.dataset.id);
    quandoScelto(el.dataset.id);
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
    impostaTavolo(id);
    quandoScelto(id);
  };
}
