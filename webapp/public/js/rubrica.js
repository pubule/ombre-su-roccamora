// LA RUBRICA: le persone con cui giochi, in un posto solo.
//
// Prima le persone non esistevano: esistevano gli invitati di un tavolo, e per
// ogni tavolo nuovo si riscrivevano nome ed email a mano. Peggio: restava fuori
// un passaggio che l'app non faceva — aggiungere quell'indirizzo al criterio di
// Cloudflare Access — e senza quello l'invitato apre il sito, digita la sua
// email e non riceve nessun codice. Nessun errore, nessuna spiegazione: la
// porta lo ferma prima dell'app.
//
// Qui una persona si crea UNA VOLTA, con la porta aperta nello stesso gesto. Da
// lì in poi comporre un tavolo è toccare dei nomi.
import { conferma } from './chiedi.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function vistaRubrica(app, torna) {
  async function leggi() {
    try {
      const r = await fetch('/api/rubrica');
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }

  async function rendi(avviso, male) {
    const d = await leggi();
    if (!d) {
      app.innerHTML = `<div class="barra"><button class="btn" id="indietro">← tavoli</button>
          <div class="titolo">rubrica</div><span></span></div>
        <div class="pannello"><p class="nota">Non riesco a leggere la rubrica: manca la rete.</p>
        <div class="btn-riga mt"><button class="btn" id="riprova">riprova</button></div></div>`;
      document.getElementById('indietro').onclick = torna;
      document.getElementById('riprova').onclick = () => rendi();
      return;
    }

    // TUTTE le chiuse, proprie e altrui: il bottone «a chi manca» deve valere
    // per chiunque stia aspettando, o resterebbe fuori proprio la gente per cui
    // il portiere vede le rubriche degli altri
    const altrui = d.altrui || [];
    const fuori = [...d.persone, ...altrui.flatMap((g) => g.persone)]
      .filter((x) => x.porta === 'fuori');
    // il semaforo si accende solo se c'è qualcosa da dire: a chi non tiene le
    // chiavi, o senza token configurato, un pallino spento confonde e basta
    const segno = (x) => (x.porta === 'dentro' ? '<span class="ok-txt">✓ può entrare</span>'
      : x.porta === 'fuori' ? '<span class="ko-txt">✗ la porta è chiusa</span>' : '');
    const dove = (n) => (n ? `siede a ${n} ${n === 1 ? 'tavolo' : 'tavoli'}` : 'a nessun tavolo');

    app.innerHTML = `
      <div class="barra"><button class="btn" id="indietro">← tavoli</button>
        <div class="titolo">rubrica</div><span></span></div>

      <div class="pannello">
        <h2>le persone con cui giochi</h2>
        <p class="nota">Si scrivono una volta: poi ai tavoli si danno i posti toccando i nomi.
          ${d.portiere ? 'Creando una persona le si apre anche la porta — l’indirizzo entra nel criterio d’accesso, o il codice non le arriverebbe mai.' : ''}</p>
        ${d.portiere ? '' : `<p class="nota" id="non-portiere"><b>La porta non la apri tu.</b>
          Le persone che scrivi qui restano tue e si danno ai tavoli, ma per entrare
          nel sito il loro indirizzo dev’essere ammesso da chi ha configurato l’app:
          finché non lo è, aprono la pagina, chiedono il codice e non ricevono niente.
          Chiedilo a chi tiene le chiavi.</p>`}
        ${d.persone.length ? d.persone.map((x) => `
          <div class="nemico-riga">
            <span class="nemico-nome">${esc(x.nome || x.email)}
              <span class="nota">${esc(x.email)} · ${dove(x.tavoli)}</span></span>
            <span class="nota">${segno(x)}</span>
            ${x.porta === 'fuori' ? `<button class="btn piccolo apri-porta"
              data-email="${esc(x.email)}">apri la porta</button>` : ''}
            <button class="btn piccolo togli-persona" data-email="${esc(x.email)}"
                    data-nome="${esc(x.nome || x.email)}"
                    data-tavoli="${x.tavoli}">togli</button>
          </div>`).join('')
        : '<p class="nota">Ancora nessuno. La prima persona che aggiungi resta qui per tutti i tavoli.</p>'}
        ${avviso ? `<p class="nota mt${male ? ' ko-txt' : ''}">${avviso}</p>` : ''}
        ${fuori.length > 1 ? `<div class="btn-riga mt">
          <button class="btn" id="apri-tutte">apri la porta a chi manca (${fuori.length})</button>
        </div>` : ''}
      </div>

      <div class="mt"></div>
      <div class="pannello">
        <h2>aggiungi una persona</h2>
        <p class="nota">Il <b>nome</b> è come la chiami giocando; l’<b>email</b> è quella con cui
          entrerà nell’app.${d.portiere && d.configurata
            ? ' L’indirizzo entra subito nel criterio d’accesso: da qui in poi le basta aprire il sito.'
            : ''}</p>
        <input id="nome-persona" class="campo mt" type="text" maxlength="40"
               placeholder="come la chiami al tavolo — «Giulia»" autocomplete="off">
        <input id="email-persona" class="campo mt" type="email" inputmode="email"
               placeholder="l’email con cui entrerà — amica@esempio.it" autocomplete="off">
        <div class="btn-riga mt"><button class="btn pieno" id="aggiungi">aggiungi</button></div>
      </div>

      ${altrui.length ? `<div class="mt"></div>
        <div class="pannello" id="rubriche-altrui">
          <h2>le persone degli altri</h2>
          <p class="nota">Chi arbitra un tavolo suo tiene la propria rubrica: qui le vedi per
            poter aprire loro la porta. La rubrica resta sua — tu apri porte, non riordini
            elenchi.</p>
          ${altrui.map((g) => `
            <p class="nota mt"><b>rubrica di ${esc(g.proprietario)}</b></p>
            ${g.persone.map((x) => `
              <div class="nemico-riga">
                <span class="nemico-nome">${esc(x.nome || x.email)}
                  <span class="nota">${esc(x.email)} · ${dove(x.tavoli)}</span></span>
                <span class="nota">${segno(x)}</span>
                ${x.porta === 'fuori' ? `<button class="btn piccolo apri-porta"
                  data-email="${esc(x.email)}">apri la porta</button>` : ''}
              </div>`).join('')}`).join('')}
        </div>` : ''}

      ${d.portiere && !d.configurata ? `<div class="mt"></div>
        <div class="pannello"><h2>la porta non è collegata</h2>
          <p class="nota">L’app può scrivere nel criterio d’accesso solo con un token di
            Cloudflare: <code>npx wrangler secret put CF_API_TOKEN</code>, con il permesso
            <i>Access: Apps and Policies · Edit</i>. Finché manca, gli indirizzi vanno aggiunti
            a mano dalla dashboard — ed è il passaggio che si dimentica.</p>
          ${d.errore ? `<p class="nota ko-txt">Cloudflare ha risposto: ${esc(d.errore)}</p>` : ''}
        </div>` : ''}

      ${(d.estranei || []).length ? `<div class="mt"></div>
        <div class="pannello"><h2>nel criterio, ma non in rubrica</h2>
          <p class="nota">Indirizzi che possono entrare nel sito e non stanno in nessuna rubrica.
            La porta si apre da qui, ma si chiude solo dalla dashboard — così un tocco
            sbagliato non lascia fuori nessuno a metà campagna.</p>
          ${d.estranei.map((x) => `<p class="nota">${esc(x)}</p>`).join('')}
        </div>` : ''}`;

    document.getElementById('indietro').onclick = torna;

    document.getElementById('aggiungi').onclick = async () => {
      const nome = document.getElementById('nome-persona').value.trim();
      const chi = document.getElementById('email-persona').value.trim();
      if (!chi) return rendi('Manca l’email: è quella che le fa aprire la porta.', true);
      let out;
      try {
        const r = await fetch('/api/rubrica', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: chi, nome }),
        });
        out = await r.json().catch(() => ({}));
        if (!r.ok) return rendi(esc(out.errore || 'Non riesco ad aggiungerla.'), true);
      } catch { return rendi('Non riesco ad aggiungerla: manca la rete.', true); }
      const come = nome || chi;
      // l'esito della porta si dice in chiaro: è la differenza fra «entrerà» e
      // «riceverà un muro e non capirà perché»
      if (out.porta === 'aperta') return rendi(`<b>${esc(come)}</b> è in rubrica, e la porta è aperta al suo indirizzo.`);
      if (out.porta === 'gia') return rendi(`<b>${esc(come)}</b> è in rubrica; la porta le era già aperta.`);
      if (out.porta === 'errore') return rendi(`<b>${esc(come)}</b> è in rubrica, <b>ma la porta no</b>: senza, il codice d’accesso non le arriverà. Riprova con «apri la porta».`, true);
      // «spenta» da qui vuol dire due cose diverse — non tieni le chiavi, o non
      // sono configurate — e in tutt'e due i casi la persona NON entrerà finché
      // qualcuno non la ammette. Dirlo solo a metà è come non dirlo.
      if (out.porta === 'spenta') {
        return rendi(`<b>${esc(come)}</b> è in rubrica, ma la porta le resta chiusa: ${
          d.portiere ? 'manca il collegamento a Cloudflare' : 'l’indirizzo va ammesso da chi ha configurato l’app'}.`, true);
      }
      return rendi(`<b>${esc(come)}</b> è in rubrica.`);
    };

    const apri = async (chi) => {
      try {
        const r = await fetch('/api/porta', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: chi }),
        });
        const out = await r.json().catch(() => ({}));
        return r.ok && out.porta !== 'errore';
      } catch { return false; }
    };

    app.querySelectorAll('.apri-porta').forEach((el) => el.onclick = async () => {
      const chi = el.dataset.email;
      return rendi(await apri(chi)
        ? `La porta è aperta a ${esc(chi)}.`
        : `Non riesco ad aprire la porta a ${esc(chi)}.`, false);
    });

    const tutte = document.getElementById('apri-tutte');
    if (tutte) tutte.onclick = async () => {
      let fatte = 0;
      for (const x of fuori) if (await apri(x.email)) fatte += 1;
      return rendi(fatte === fuori.length
        ? `Porta aperta a ${fatte} ${fatte === 1 ? 'persona' : 'persone'}.`
        : `Aperta a ${fatte} di ${fuori.length}: le altre riprovale.`, fatte !== fuori.length);
    };

    app.querySelectorAll('.togli-persona').forEach((el) => el.onclick = async () => {
      const { email: chi, nome: come, tavoli } = el.dataset;
      const n = Number(tavoli);
      // togliere dalla rubrica non toglie il posto e non chiude la porta: la
      // domanda lo dice, invece di lasciarlo scoprire
      if (!await conferma(`Togliere ${come} dalla rubrica?`, {
        dettaglio: `${n ? `Resta seduta a ${n} ${n === 1 ? 'tavolo' : 'tavoli'}, e la` : 'La'
          } porta le resta aperta: si chiude dalla dashboard di Cloudflare.`,
        si: 'toglietela', no: 'lasciate stare',
      })) return;
      try {
        await fetch(`/api/rubrica?email=${encodeURIComponent(chi)}`, { method: 'DELETE' });
      } catch { return rendi('Non riesco a toglierla: manca la rete.', true); }
      return rendi(`${esc(come)} non è più in rubrica.`);
    });
  }

  await rendi();
}
