// LA CRESCITA NELL'EPILOGO: quel che la serata lascia agli eroi.
//
// Sta accanto al Bivio e si comporta come lui — si decide insieme, la segna chi
// arbitra, dai telefoni si legge — perche' e' la stessa specie di cosa: uno
// stato di campagna che cambia le serate successive. Al tavolo e' la casella
// che si spunta sulla scheda.
//
// LA DIFFERENZA COL VECCHIO ELENCO. Le caselle hanno un prezzo, e i punti si
// possono mettere da parte: portare una caratteristica a 4 costa dieci punti,
// cioe' mezza campagna. Senza prezzo, 17 caselle contro 21 serate facevano una
// tabella di marcia — dalla quattordicesima serata non restava piu' niente da
// scegliere, che e' esattamente il guasto che l'elenco a dodici voci doveva
// risolvere e invece rimandava.
import { crescitaCampagna, registraCrescita, puntiCrescita } from './store.js';
import { MIGLIORIE, specDi, spezza, CARATTERISTICHE, STAT_MIN, STAT_MAX } from '../motore/migliorie.js';
import { conferma } from './chiedi.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const vociDi = (nm) => ((crescitaCampagna()[nm] || {}).voci) || [];
const cicatriciDi = (nm) => ((crescitaCampagna()[nm] || {}).cicatrici) || [];

// Quanto ha speso UN EROE: la somma dei prezzi delle sue caselle. Il prezzo di
// una casella dipende da quante ce n'erano gia' di quella voce (e, per la
// Tempra, su quella caratteristica), quindi si ricontano in ordine.
//
// PER EROE E NON PER GRUPPO. Il Regolamento dice «una casella **a testa** dopo
// ogni episodio riuscito»: il punto lo guadagna ciascuno, non la compagnia. Un
// salvadanaio comune darebbe a quattro eroi il budget di uno, e dal telefono
// due giocatori che spendono insieme si mangerebbero i punti a vicenda.
export function speso(nm) {
  let tot = 0;
  const conto = {};
  for (const v of vociDi(nm)) {
    const { id, stat } = spezza(v);
    const spec = specDi(id); if (!spec) continue;
    const k = spec.perStat ? `${id}:${stat}` : id;
    const n = conto[k] || 0; conto[k] = n + 1;
    tot += spec.costo[Math.min(n, spec.costo.length - 1)];
  }
  return tot;
}

/** I punti che restano a quell'eroe: guadagnati dalla campagna, meno i suoi. */
export const restanoA = (nm) => puntiCrescita() - speso(nm);

// Le caselle che questo eroe puo' ancora prendere, col prezzo della prossima.
// «Voce che regge» sparisce dall'elenco se ce l'ha gia' qualcun altro: e' una
// sola per l'intero gruppo, e offrirla due volte sarebbe offrire un doppione.
function offerte(nm, party, carta) {
  const mie = vociDi(nm);
  const cic = cicatriciDi(nm);
  const conta = (id, stat) => mie.filter((v) => {
    const s = spezza(v); return s.id === id && (!stat || s.stat === stat);
  }).length;
  const out = [];
  for (const spec of MIGLIORIE) {
    // «una sola casella per l'intero gruppo»: se ce l'ha gia' qualcuno, sparisce
    if (spec.gruppo && (party || []).some((x) => vociDi(x).some((v) => spezza(v).id === spec.id))) continue;
    if (!spec.perStat) {
      const n = conta(spec.id);
      if (n < spec.costo.length) out.push({ voce: spec.id, spec, costo: spec.costo[n] });
      continue;
    }
    // TEMPRA: il prezzo sale sulla STESSA caratteristica, e non si offre quel
    // che il tetto rende inutile — una casella che non alza niente e' un punto
    // buttato, e chi la spunta lo scopre solo giocando.
    for (const s of CARATTERISTICHE) {
      const n = conta(spec.id, s);
      if (n >= spec.costo.length) continue;
      const ora = carta ? Math.max(STAT_MIN, Math.min(STAT_MAX,
        (carta[s] || 0) + n - cic.filter((c) => c === s).length)) : 0;
      if (carta && ora >= STAT_MAX) continue;
      out.push({ voce: `${spec.id}:${s}`, spec, stat: s, costo: spec.costo[n] });
    }
  }
  return out;
}

const nomeVoce = (v) => {
  const { id, stat } = spezza(v); const spec = specDi(id);
  return spec ? `${spec.nome}${stat ? ` (${stat.toUpperCase()})` : ''}` : v;
};

/**
 * @param puo   `(nome) => bool`: chi puo' spuntare le caselle DI QUELL'EROE.
 *              Chi arbitra tutti, chi gioca il proprio — e' `posso()` della
 *              vista, la stessa che decide chi muove quale pedina. Un booleano
 *              solo non basterebbe: la schermata elenca tutta la compagnia, e
 *              su un telefono una riga sola e' toccabile.
 * @param eroi  `comune.eroi` — serve solo a non offrire Tempre gia' al tetto.
 */
export function crescitaHtml(party, puo = () => true, eroi = null) {
  const guadagnati = puntiCrescita();
  const carta = (nm) => (eroi || []).find((e) => e.nome === nm) || null;
  const miei = (party || []).filter((nm) => puo(nm));
  const tutti = miei.length === (party || []).length;
  // IL PROPRIO EROE PER PRIMO. Su un telefono la compagnia e' una colonna
  // lunga, e la riga su cui si agisce non deve andarsela a cercare in fondo.
  // Per chi arbitra non cambia niente: li puo' spuntare tutti, quindi l'ordine
  // resta quello del party.
  const ordine = tutti ? (party || [])
    : [...miei, ...(party || []).filter((nm) => !puo(nm))];
  return `
    <hr class="divisore">
    <div style="text-align:left" id="riq-crescita">
      <p class="nota">— la crescita: un punto a testa per ogni serata riuscita, si mettono da parte —</p>
      ${tutti ? '' : `<p class="nota">Spuntate le vostre; le altre le vedete e basta.</p>`}
      ${ordine.map((nm) => {
        const mie = vociDi(nm); const cic = cicatriciDi(nm);
        const restano = restanoA(nm);
        const suo = puo(nm);
        const off = suo ? offerte(nm, party, carta(nm)).filter((o) => o.costo <= restano) : [];
        return `
        <div class="pannello mt${suo && !tutti ? ' scelto' : ''}">
          <p><b>${esc(nm)}</b> <span class="nota">— ${restano}
             ${restano === 1 ? 'punto' : 'punti'} da spendere (${guadagnati} guadagnati)</span></p>
          <p class="nota">${mie.length ? mie.map((v) => esc(nomeVoce(v))).join(' · ')
            : 'nessuna casella spuntata'}${cic.length
            ? ` — cicatrici: ${cic.map((c) => esc(c.toUpperCase())).join(', ')}` : ''}</p>
          ${suo ? (off.length ? `<div class="btn-riga">${off.map((o) => `
            <button class="btn" data-cresce="${esc(nm)}" data-voce="${esc(o.voce)}"
                    title="${esc(o.spec.nota)}">${esc(nomeVoce(o.voce))} · ${o.costo}</button>`).join('')}</div>`
            : `<p class="nota">${restano > 0 ? 'Niente che si possa pagare adesso.'
                                             : 'Nessun punto da spendere.'}</p>`) : ''}
        </div>`;
      }).join('')}
    </div>`;
}

/** Aggancia i bottoni. `ridisegna` ridisegna l'epilogo: spuntata si deve vedere. */
export function collegaCrescita(app, party, ridisegna) {
  app.querySelectorAll('[data-cresce]').forEach((el) => {
    el.onclick = async () => {
      const nm = el.dataset.cresce; const voce = el.dataset.voce;
      const spec = specDi(spezza(voce).id);
      if (!await conferma(`${nomeVoce(voce)} a ${nm}?`, {
        dettaglio: `${spec.nota} La casella resta spuntata per tutta la campagna.`,
        si: 'sì, si spunta', no: 'ancora no',
      })) return;
      await registraCrescita(nm, [...vociDi(nm), voce], cicatriciDi(nm));
      ridisegna();
    };
  });
}
