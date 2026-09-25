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
import { schedaEroe } from './scheda-eroe.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const primo = (s) => String(s).split(' ')[0];

export async function vistaMioEroe(app, tavolo, nomeTavolo, quandoPreso, cambiaTavolo) {
  const comune = await dati('comune');
  // «cambia tavolo» sempre a portata: da qui non si va oltre senza un eroe, e
  // se il tavolo non e' pronto (o non e' quello giusto) non si resta chiusi dentro
  const altroTavolo = cambiaTavolo ? '<button class="btn" id="altro-tavolo">cambia tavolo</button>' : '';
  const leghiAltro = () => {
    const b = document.getElementById('altro-tavolo');
    if (b) b.onclick = cambiaTavolo;
  };

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
        arbitra: m.proprietario || null,
        eroiArbitra: m.eroiProprietario || [],
        // i miei eroi li dice lo stato, che vale per tutti — anche per chi ha
        // creato il tavolo e non ha una riga fra i membri
        miei: (t && t.eroi) || [],
      };
    } catch { return null; }
  }

  async function rendi(avviso) {
    const d = await stato();
    if (!d) {
      app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
        <div class="pannello"><p class="nota">Non riesco a leggere il tavolo: manca la rete.</p>
        <div class="btn-riga mt"><button class="btn" id="riprova">riprova</button>${altroTavolo}</div></div>`;
      document.getElementById('riprova').onclick = () => rendi();
      leghiAltro();
      return;
    }

    // PIU' D'UNO SI PUO'. Due amici con un iPad solo giocano i loro due eroi da
    // qui: si toccano due ritratti invece di uno, e sullo schermo di gioco si
    // passa dall'uno all'altro. La regola che resta e' l'altra meta': un eroe
    // ha un posto solo, e a dirlo e' il database.
    const miei = d.miei;
    // chi ha preso cosa: serve a dire «di Giulia» invece di un generico
    // «occupato» — al tavolo si gioca con delle persone, non con degli slot
    const di = {};
    for (const m of d.membri) {
      for (const e of (m.eroi || (m.eroe ? [m.eroe] : []))) di[e] = m.nome || m.email;
    }
    for (const e of d.eroiArbitra) di[e] = d.arbitra;

    if (!d.party.length) {
      app.innerHTML = `<div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
        <div class="pannello"><h2>ancora niente da scegliere</h2>
          <p>${d.arbitra ? `<b>${esc(d.arbitra)}</b>, che arbitra,` : 'Chi arbitra'} non ha ancora composto la compagnia. Appena l’avrà fatto,
             qui troverete gli eroi liberi.</p>
          <div class="btn-riga mt"><button class="btn" id="riprova">guardate di nuovo</button>${altroTavolo}</div>
        </div>`;
      document.getElementById('riprova').onclick = () => rendi();
      leghiAltro();
      return;
    }

    app.innerHTML = `
      <div class="barra"><span></span><div class="titolo">${esc(nomeTavolo)}</div><span></span></div>
      <div class="pannello">
        <h2>${miei.length ? (miei.length > 1 ? 'i tuoi eroi' : 'il tuo eroe') : 'prenditi un eroe'}</h2>
        <p class="nota">${d.arbitra ? `Tavolo di <b>${esc(d.arbitra)}</b>, che arbitra. ` : ''}${miei.length
          ? `Giochi <b>${miei.map((n) => esc(primo(n).toLowerCase())).join('</b> e <b>')}</b>.
             Tocca un altro ritratto per aggiungerlo, o il tuo per lasciarlo — finché la
             serata non comincia.`
          : `Tocca il ritratto di chi vuoi giocare. Quelli già presi non si possono prendere,
             e se siete in due su questo schermo potete prenderne due.`}</p>
        <div class="griglia-arruolo mt">
          ${d.party.map((n) => {
    const e = comune.eroi.find((x) => x.nome === n) || { nome: n, art: '', ruolo: '' };
    const suo = miei.includes(n);
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
        <div class="btn-riga mt">
          ${miei.length ? '<button class="btn pieno" id="entra">si comincia</button>' : ''}${altroTavolo}</div>
      </div>`;

    app.querySelectorAll('.eroe-tile').forEach((el) => el.onclick = async () => {
      const n = el.dataset.nome;
      const e = comune.eroi.find((x) => x.nome === n) || { nome: n, art: '', ruolo: '' };
      // IL RITRATTO APRE LA SCHEDA. Un tocco prendeva l'eroe senza dire chi
      // fosse: si sceglie il proprio personaggio per una campagna intera, e
      // sceglierlo dalla faccia e' poco. Quello di un altro si legge lo stesso
      // — la scheda non e' un segreto — ma senza il bottone, perche' e' suo.
      if (el.dataset.altrui) {
        await schedaEroe(e);
        return;
      }
      // toccare uno dei propri lo lascia, toccarne un altro lo aggiunge: si
      // manda sempre la lista intera, cosi' il posto e' quel che si vede
      if (await schedaEroe(e, { giaScelto: miei.includes(n) }) !== 'toggle') return;
      const voluti = miei.includes(n) ? miei.filter((x) => x !== n) : [...miei, n];
      try {
        const r = await fetch('/api/mio-eroe', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo, eroi: voluti }),
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
    leghiAltro();
  }

  await rendi();
}
