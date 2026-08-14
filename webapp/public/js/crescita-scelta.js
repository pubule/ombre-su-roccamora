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

// Quanto e' stato speso in tutto: la somma dei prezzi delle caselle spuntate.
// Il prezzo di una casella dipende da quante ce n'erano gia' di quella voce
// (e, per la Tempra, su quella caratteristica), quindi si ricontano in ordine.
export function speso(party) {
  let tot = 0;
  for (const nm of party || []) {
    const conto = {};
    for (const v of vociDi(nm)) {
      const { id, stat } = spezza(v);
      const spec = specDi(id); if (!spec) continue;
      const k = spec.perStat ? `${id}:${stat}` : id;
      const n = conto[k] || 0; conto[k] = n + 1;
      tot += spec.costo[Math.min(n, spec.costo.length - 1)];
    }
  }
  return tot;
}

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
 * @param puo   se chi guarda puo' spuntare (arbitro).
 * @param eroi  `comune.eroi` — serve solo a non offrire Tempre gia' al tetto.
 */
export function crescitaHtml(party, puo = true, eroi = null) {
  const guadagnati = puntiCrescita();
  const restano = guadagnati - speso(party);
  const carta = (nm) => (eroi || []).find((e) => e.nome === nm) || null;
  return `
    <hr class="divisore">
    <div style="text-align:left" id="riq-crescita">
      <p class="nota">— la crescita: un punto per ogni serata riuscita, si mettono da parte —</p>
      <p><b>${restano}</b> ${restano === 1 ? 'punto' : 'punti'} da spendere
         <span class="nota">(${guadagnati} guadagnati in campagna)</span></p>
      ${(party || []).map((nm) => {
        const mie = vociDi(nm); const cic = cicatriciDi(nm);
        const off = offerte(nm, party, carta(nm)).filter((o) => o.costo <= restano);
        return `
        <div class="pannello mt">
          <p><b>${esc(nm)}</b></p>
          <p class="nota">${mie.length ? mie.map((v) => esc(nomeVoce(v))).join(' · ')
            : 'nessuna casella spuntata'}${cic.length
            ? ` — cicatrici: ${cic.map((c) => esc(c.toUpperCase())).join(', ')}` : ''}</p>
          ${puo ? (off.length ? `<div class="btn-riga">${off.map((o) => `
            <button class="btn" data-cresce="${esc(nm)}" data-voce="${esc(o.voce)}"
                    title="${esc(o.spec.nota)}">${esc(nomeVoce(o.voce))} · ${o.costo}</button>`).join('')}</div>`
            : '<p class="nota">Niente che si possa pagare adesso.</p>') : ''}
        </div>`;
      }).join('')}
      ${puo ? '' : '<p class="nota">Le spunta chi arbitra.</p>'}
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
