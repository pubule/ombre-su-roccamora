// LA REGOLA DEL VENTO (Ep.11): a inizio turno, ogni eroe su tessera ESPOSTA prova NERVI
// o perde lo scatto (e a 1 Ferita subisce 1 danno). Qui i soli modificatori, puri.
import { tileDi } from './griglia.js';
import { norm } from './regole.js';
import { effettiAttivi } from './domande.js';

const SCALA = ['Facile', 'Media', 'Difficile'];
const testoDi = (t) => `${t.testo || ''} ${t.arbitro || ''}`;

// ponytail: la regola e' dell'Ep.11, l'unico con tessere `esposta`; se ne arriva un altro, un campo dato.
export const ventoAttivo = (g) => (g.ep.tessere || []).some((t) => t.esposta) && g.sp.rivelate.includes(g.ep.tessere[0].id);

const esposta = (g, id) => !!(tileDi(g, id) || {}).esposta;

export function gradiniVento(g, id) {
  const t = tileDi(g, id) || {};
  const gradini = (g.sp.vento || 0) + (/FORTE/.test(testoDi(t)) ? 1 : 0) + (/vento al massimo/i.test(testoDi(t)) ? 1 : 0);
  return { gradini, diff: SCALA[Math.min(gradini, SCALA.length - 1)] };
}

const haOggetto = (g, nome) => ((g.partita.indagine || {}).oggetti || []).some((o) => norm(o).includes(norm(nome)));

export const buioMalus = (g, id) => (esposta(g, id) && !haOggetto(g, 'Lanterna da Guglia') ? -1 : 0);

export function bonusVento(g) {
  const out = [];
  if (haOggetto(g, 'Taccuino Ordinato')) out.push({ label: 'Il Taccuino Ordinato', val: 1 });
  if (effettiAttivi(g).bonus_vento) out.push({ label: 'Domanda 3 esatta', val: effettiAttivi(g).bonus_vento });
  return out;
}

export function eroiInProva(g) {
  if (!ventoAttivo(g)) return [];
  return g.partita.party.filter((nm) => {
    const v = (g.sp.vite || {})[nm];
    const pos = (g.sp.eroiPos || {})[nm];
    return (v === undefined || v > 0) && pos && esposta(g, pos.t);
  });
}
