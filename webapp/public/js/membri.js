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
import { dati, dimenticaTavolo } from './store.js';
import { conferma, avvisa } from './chiedi.js';
import { schedaEroe } from './scheda-eroe.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const primo = (nome) => String(nome).split(' ')[0].toLowerCase();

// `avanti`, se c'e', mette in fondo il bottone per proseguire: serve a chi ha
// appena creato il tavolo e arriva qui prima ancora di vedere gli episodi —
// comporre la compagnia e invitare e' quel che si fa subito dopo aver creato un
// tavolo, e mandarlo prima agli episodi era un giro a vuoto.
export async function vistaMembri(app, tavolo, nome, torna, avanti) {
  const comune = await dati('comune');

  // LA COMPAGNIA DI QUESTO TAVOLO: gli eroi della campagna, scelti una volta e
  // poi sempre quelli. Prima il party si sceglieva a ogni partita e non c'era
  // modo di sapere quali eroi fossero assegnabili: si offrivano tutti e undici.
  async function party() {
    try {
      const r = await fetch('/api/stato');
      if (!r.ok) return null;
      const t = ((await r.json()).tavoli || []).find((x) => x.id === tavolo);
      return t && t.party ? JSON.parse(t.party) : [];
    } catch { return null; }
  }

  async function carica() {
    try {
      const r = await fetch(`/api/membri?tavolo=${encodeURIComponent(tavolo)}`);
      if (!r.ok) return null;
      const j = await r.json();
      return { membri: j.membri || [], proprietario: j.proprietario || null,
               eroiProprietario: j.eroiProprietario || [] };
    } catch { return null; }
  }

  // LA RUBRICA: le persone con cui giochi, scritte una volta sola. Qui il tavolo
  // ci pesca dentro invece di far riscrivere nome ed email a ognuno, a ogni
  // campagna nuova.
  async function rubrica() {
    try {
      const r = await fetch('/api/rubrica');
      if (!r.ok) return { persone: [] };
      return await r.json();
    } catch { return { persone: [] }; }
  }

  async function rendi(avviso) {
    const [letti, squadra, rub] = await Promise.all([
      carica(), party().then((x) => x || []), rubrica(),
    ]);
    if (letti === null) {
      app.innerHTML = `<div class="barra"><button class="btn" id="indietro">← tavoli</button>
          <div class="titolo">${esc(nome)}</div><span></span></div>
        <div class="pannello"><p class="nota">Non riesco a leggere chi siede al tavolo:
          manca la rete. Riprova.</p></div>`;
      document.getElementById('indietro').onclick = torna;
      return;
    }

    const { membri, proprietario, eroiProprietario } = letti;
    // chi ha creato il tavolo e' sempre l'arbitro e non e' fra i `membri`: sta
    // sopra, fisso, senza «togli» — non si toglie nessuno da un tavolo suo
    const altri = membri.filter((m) => m.email !== proprietario);

    // chi è in rubrica e non siede già a questo tavolo: offrire chi c'è già
    // sarebbe un bottone che il server rifiuta
    const seduti = new Set([...membri.map((m) => m.email), proprietario]
      .filter(Boolean).map((x) => String(x).toLowerCase()));
    const liberi = (rub.persone || []).filter((x) => !seduti.has(String(x.email).toLowerCase()));

    // un posto puo' tenerne piu' d'uno (un iPad, due amici)
    const eroiDi = (m) => m.eroi || (m.eroe ? [m.eroe] : []);

    app.innerHTML = `
      <div class="barra"><button class="btn" id="indietro">← tavoli</button>
        <div class="titolo">${esc(nome)}</div><span></span></div>

      <div class="pannello">
        <h2>la compagnia</h2>
        <p class="nota">Gli eroi di questa campagna: si scelgono una volta e restano
          questi. Tocca un ritratto per aggiungerlo o toglierlo — si salva da sé.${
            squadra.length ? '' : ' Da 2 a 10.'}</p>
        <div class="griglia-arruolo mt">
          ${comune.eroi.map((e) => `
            <div class="eroe-tile${squadra.includes(e.nome) ? ' scelto' : ''}" data-nome="${esc(e.nome)}">
              <img loading="lazy" src="${encodeURI('/assets/artworks/' + e.art)}" alt="">
              <div class="eroe-velo"></div>
              <div class="eroe-nome"><b>${esc(e.nome.toLowerCase())}</b><i>${esc(e.ruolo)}</i></div>
              <div class="spunta">✓</div>
            </div>`).join('')}
        </div>
        <p class="nota mt" id="conta-party"></p>
      </div>

      <div class="mt"></div>
      <div class="pannello" id="p-membri">
        <h2>chi gioca a questo tavolo</h2>
        ${proprietario ? `<div class="nemico-riga">
          <span class="nemico-nome">${esc(proprietario)}
            <span class="nota">${eroiProprietario.length
              ? esc(eroiProprietario.map(primo).join(' e ')) : 'nessun eroe'} · arbitra ·
              ha creato il tavolo</span></span>
        </div>` : ''}
        ${altri.length ? altri.map((m) => `
          <div class="nemico-riga">
            <span class="nemico-nome">${esc(m.nome || m.email)}
              <span class="nota">${eroiDi(m).length
                ? esc(eroiDi(m).map(primo).join(' e ')) : 'nessun eroe'}${
                m.ruolo === 'arbitro' ? ' · arbitra' : ''}${
                m.nome ? ` · ${esc(m.email)}` : ''}</span></span>
            <button class="btn piccolo togli-membro" data-email="${esc(m.email)}"
                    data-nome="${esc(m.nome || '')}">togli</button>
          </div>`).join('')
          : '<p class="nota">Ancora nessun invitato: il tavolo si salva con almeno una persona.</p>'}
        ${avviso ? `<p class="nota mt ko-txt">${esc(avviso)}</p>` : ''}
        ${altri.length ? `<div class="mt"><p class="nota">Da mandare a chi hai aggiunto —
          nessuno lo fa al posto tuo:</p>
          <input class="campo" id="link-tavolo" readonly value="${esc(location.origin)}">
          <div class="btn-riga mt"><button class="btn" id="copia-link">copia il link</button></div>
        </div>` : ''}
      </div>

      <div class="mt"></div>
      <div class="pannello">
        <h2>dai un posto a…</h2>
        <p class="nota"><b>Non parte nessuna email da qui.</b> Il posto al tavolo resta pronto:
          si entra da soli aprendo l’app con quell’email — il link glielo mandi tu.
          L’eroe se lo sceglie ognuno per conto suo, quando entra.</p>
        ${liberi.length ? liberi.map((x) => `
          <div class="nemico-riga">
            <span class="nemico-nome">${esc(x.nome || x.email)}
              <span class="nota">${esc(x.email)}${
                x.porta === 'fuori' ? ' · la porta è chiusa' : ''}</span></span>
            <button class="btn piccolo dai-posto" data-email="${esc(x.email)}"
                    data-nome="${esc(x.nome || '')}">dagli un posto</button>
          </div>`).join('')
        : `<p class="nota">${rub.persone.length
          ? 'Tutte le persone della tua rubrica siedono già a questo tavolo.'
          : 'La tua rubrica è vuota: le persone si scrivono una volta sola, dalla <b>rubrica</b> nella schermata dei tavoli — oppure qui sotto.'}</p>`}
      </div>

      <div class="mt"></div>
      <div class="pannello">
        <h2>una persona nuova</h2>
        <p class="nota">Il <b>nome</b> è come la chiami giocando; l’<b>email</b> è quella con cui
          entrerà nell’app. Resta in rubrica: al prossimo tavolo basta toccarlo.</p>
        <input id="nome-invito" class="campo mt" type="text" maxlength="40"
               placeholder="come la chiami al tavolo — «Giulia»" autocomplete="off">
        <input id="email-invito" class="campo mt" type="email" inputmode="email"
               placeholder="l’email con cui entrerà — amico@esempio.it" autocomplete="off">
        <div class="btn-riga mt"><button class="btn pieno" id="invita">in rubrica, e al tavolo</button></div>
      </div>
      ${avanti ? `<div class="mt"></div>
        <div class="btn-riga"><button class="btn pieno" id="avanti" aria-disabled="true">salva il tavolo</button></div>`
      : ''}`;

    const btnAvanti = document.getElementById('avanti');
    // UN TAVOLO SI SALVA COMPLETO: la compagnia (da 2 a 10 eroi, e SALVATA sul
    // server, non solo toccata) e almeno una persona invitata. Senza, il bottone
    // sembra spento ma si puo' premere, e un avviso dice cosa manca: una riga di
    // nota in fondo alla pagina non la vedeva nessuno, e il tavolo restava li'.
    let partySalvato = squadra.length >= 2;
    const cosaManca = () => {
      const manca = [];
      if (!partySalvato) manca.push('la compagnia, da 2 a 10 eroi');
      if (!altri.length) manca.push('almeno una persona invitata');
      return manca;
    };
    const aggiornaAvanti = () => {
      if (!btnAvanti) return;
      const spento = cosaManca().length > 0;
      btnAvanti.setAttribute('aria-disabled', String(spento));
      btnAvanti.style.opacity = spento ? '.45' : '';
    };
    aggiornaAvanti();
    if (btnAvanti) btnAvanti.onclick = () => {
      const manca = cosaManca();
      if (!manca.length) return avanti();
      avvisa('Il tavolo non è ancora completo', {
        dettaglio: `Per salvarlo servono ${manca.join(' e ')}.` });
    };

    // USCIRE DA UN TAVOLO NON SALVATO LO SCARTA. Il tavolo esiste sul server dal
    // momento in cui si crea — inviti e compagnia hanno bisogno di un id — quindi
    // uscire senza salvarlo lo lasciava nell'elenco a meta'. Un tavolo completo
    // invece resta: e' salvabile, e l'unica cosa che manca e' il bottone.
    document.getElementById('indietro').onclick = async () => {
      if (!avanti || !cosaManca().length) return torna();
      if (!await conferma('Uscire senza salvare?', {
        dettaglio: 'Il tavolo non è completo: se esci, viene scartato.',
        si: 'scarta il tavolo', no: 'continua a completarlo',
      })) return;
      try {
        const r = await fetch(`/api/tavolo?id=${encodeURIComponent(tavolo)}`, { method: 'DELETE' });
        if (!r.ok) throw new Error(r.status);
      } catch { return rendi('Non riesco a scartare il tavolo: manca la rete. Riprova.'); }
      dimenticaTavolo(tavolo);
      torna();
    };

    // La compagnia si compone toccando i ritratti, e si salva a parte: toccare
    // un eroe non deve far partire una scrittura per ogni tocco.
    const scelti = new Set(squadra);
    const conta = document.getElementById('conta-party');
    // SI SALVA DA SE'. Un bottone «salva la compagnia» accanto a «dagli un
    // posto» e a «si comincia» faceva tre bottoni sulla stessa schermata, e non
    // era chiaro quale premere ne' in che ordine. Il tocco sul ritratto e' gia'
    // la decisione: qui si esegue e si dice com'e' andata.
    //
    // Sotto i due eroi non si scrive: le regole scalano da 2 a 10, e il server
    // rifiuterebbe. Non e' un errore, e' una compagnia non ancora finita.
    const dillo = (t, male) => {
      conta.textContent = t;
      conta.classList.toggle('ko-txt', !!male);
    };
    const salva = async () => {
      // la compagnia conta come salvata solo a salvataggio riuscito: tra un tocco
      // e la risposta (o se la risposta e' un errore) «salva il tavolo» e' spento
      partySalvato = false;
      aggiornaAvanti();
      if (scelti.size < 2) return dillo(`${scelti.size} scelto: servono almeno due eroi.`);
      try {
        const r = await fetch('/api/party', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo, party: [...scelti] }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          return dillo(d.errore || 'Non riesco a salvare la compagnia.', true);
        }
      } catch { return dillo('Non riesco a salvare: manca la rete.', true); }
      dillo(`${scelti.size} eroi — la compagnia è salvata.`);
      partySalvato = true;
      aggiornaAvanti();
    };

    // IL RITRATTO APRE LA SCHEDA, non arruola di colpo. Chi compone la
    // compagnia sceglie GUARDANDO chi e' — statistiche, abilita', bio — come
    // nella selezione del party a schermo unico: e' la stessa decisione, e va
    // presa con gli stessi dati davanti. Il tocco cieco arruolava un nome.
    app.querySelectorAll('.eroe-tile').forEach((el) => el.onclick = async () => {
      const n = el.dataset.nome;
      const e = comune.eroi.find((x) => x.nome === n);
      if (!e) return;
      if (await schedaEroe(e, { giaScelto: scelti.has(n) }) !== 'toggle') return;
      if (scelti.has(n)) scelti.delete(n); else scelti.add(n);
      el.classList.toggle('scelto', scelti.has(n));
      salva();
    });
    dillo(squadra.length ? `${squadra.length} eroi in compagnia.` : '');


    const copia = document.getElementById('copia-link');
    if (copia) copia.onclick = async () => {
      const campo = document.getElementById('link-tavolo');
      campo.select();
      try { await navigator.clipboard.writeText(campo.value); copia.textContent = 'copiato'; }
      catch { copia.textContent = 'copialo a mano'; }   // senza permesso resta selezionato
    };

    // DARE IL POSTO: una chiamata sola, con nome ed email presi dalla rubrica.
    // La porta l'ha già aperta la rubrica; il Worker la riapre comunque, per
    // chi arriva da una pagina rimasta aperta da ieri.
    const posto = async (chi, come) => {
      try {
        const r = await fetch('/api/membri', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo, email: chi, nome: come }),
        });
        const d = await r.json().catch(() => ({}));
        // il rifiuto del server si mostra com'è: dice già la cosa giusta
        // («quell'eroe è già di qualcun altro», «email non valida»)
        if (!r.ok) return rendi(d.errore || 'Non riesco a dare il posto. Riprova.');
        return rendi(d.porta === 'errore'
          ? `${come || chi} ha un posto, ma la porta no: senza, il codice d’accesso non le arriverà.`
          : undefined);
      } catch { return rendi('Non riesco a dare il posto: manca la rete. Riprova.'); }
    };

    app.querySelectorAll('.dai-posto').forEach((b) => b.onclick = () =>
      posto(b.dataset.email, b.dataset.nome));

    document.getElementById('invita').onclick = async () => {
      const chi = document.getElementById('email-invito').value.trim();
      const come = document.getElementById('nome-invito').value.trim();
      if (!chi) return rendi('Serve l’email con cui entrerà nell’app.');
      // PRIMA IN RUBRICA (che apre la porta), POI AL TAVOLO: così una persona
      // scritta di fretta resta scritta, e al tavolo dopo basta toccarla
      try {
        await fetch('/api/rubrica', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: chi, nome: come }),
        });
      } catch { /* la rubrica e' una comodità: il posto si dà lo stesso */ }
      return posto(chi, come);
    };

    app.querySelectorAll('.togli-membro').forEach((b) => b.onclick = async () => {
      const chi = b.dataset.email;
      const come = b.dataset.nome || chi;
      if (!await conferma(`Togliere ${come} dal tavolo?`, {
        dettaglio: 'Non vedrà più questa campagna. Il suo eroe torna a chi arbitra.',
        si: 'togli dal tavolo', no: 'lascia stare',
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
