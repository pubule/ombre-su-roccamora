// LE ABILITA' A CARICHE DEGLI EROI.
//
// Otto abilita' che chiedono qualcosa — curare chi, accecare quale nemico,
// dove lanciare l'esca — e in digitale.js lo chiedevano con `await scegli()` in
// mezzo alla regola. Ma i candidati si calcolano tutti dallo stato: chi e'
// adiacente e ferito, quali nemici sono entro due caselle, quali carte stanno
// in cima al mazzo. Quindi la domanda si puo' fare PRIMA, e il comando arriva
// gia' completo.
//
//   candidati(g, nm) -> { eff, titolo, opzioni } | null      ← il client chiede
//   usa(g, nm, scelta, cella)                                ← il motore esegue
//
// Nessuna pendenza: nessuna di queste scelte ha bisogno di vedere un esito
// prima di essere presa.
//
// L'ESCA fa eccezione a modo suo. Prima era a due tempi: «usa» accendeva le
// caselle e la carica si spendeva quando se ne toccava una, con `sp.escaModo` a
// tenere il mezzo-turno. Col comando completo il giocatore sceglie la casella
// prima, e quello stato intermedio sparisce — insieme al rischio che una
// partita venga salvata a meta' gesto.
import { adiacGlob, distGlob } from './griglia.js';
import { eroe, nemStat, primo, saluteMax, azioniRestano } from './stat.js';
import { celleEsca } from './stat.js';

const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };
const rifiuta = (motivo) => ({ rifiuto: motivo });

// La tabella delle cariche. Le abilita' sono scritte in prosa sulle carte
// (`src/gen_cards.py`), quindi il numero di usi non si puo' dedurre: questa
// tabella E' la regola, ed e' l'unico posto dove sta.
export const CARICHE_SPED = [
  { key: 'ATTILIO', ab: 'Pronto Soccorso', usi: 3, eff: 'cura', nota: 'Cura 2 Salute a sé o a un eroe adiacente.' },
  { key: 'SIBILLA', ab: 'Sesto Senso', usi: 3, eff: 'scruta', nota: 'Guarda le prossime 2 carte Minaccia e mettine una in fondo al mazzo.' },
  { key: 'SERRA', ab: 'Voce ferma', usi: 3, eff: 'voce', nota: 'Fino al tuo prossimo turno gli eroi adiacenti tirano NERVI con +2.' },
  { key: 'CARLA', ab: 'Flash!', usi: 2, eff: 'flash', nota: 'Un nemico entro 2 caselle salta la sua prossima attivazione.' },
  { key: 'CARBONE', ab: 'Esca preziosa', usi: 2, eff: 'esca', nota: 'I nemici entro 2 caselle dall’esca vanno verso di essa nel loro turno.' },
  { key: 'FANTI', ab: 'Diversivo', usi: 2, eff: 'diversivo', nota: 'La prossima Fase Minaccia pesca 1 carta in meno.' },
  { key: 'MARANI', ab: 'Litania', usi: 1, eff: 'litania', nota: 'Rimuove 1 segnalino Canto.' },
  { key: 'BRERA', ab: 'Vi conosco, Malacarne', usi: 1, eff: 'malacarne', nota: 'Rimuove un nemico di truppa (Malavita/Adepto/Cane) in campo.' },
  { key: 'OTTONE', ab: 'Colpo da macello', usi: null, nota: '1 per turno: se abbatte un nemico in mischia, attacca subito un altro adiacente.' },
];

export const caricaDi = (nome) => CARICHE_SPED.find((c) => nome.includes(c.key));

// Quel che l'abilita' chiede prima di partire. `null` = non chiede niente.
// Restituisce anche `vuoto` quando l'abilita' non ha bersagli: e' un rifiuto
// che il client puo' mostrare senza mandare il comando.
export function candidati(g, nm) {
  const sp = g.sp; const c = caricaDi(nm);
  if (!c || c.usi === null) return null;

  if (c.eff === 'cura') {
    const cand = [nm, ...g.partita.party.filter((x) => x !== nm && (sp.vite[x] ?? 0) > 0
      && adiacGlob(g, sp.eroiPos[nm], sp.eroiPos[x]))];
    return { eff: c.eff, titolo: 'curare chi? (+2 Salute)',
             opzioni: cand.map((x) => ({ id: x, label: `${primo(x)} (${sp.vite[x]})` })) };
  }
  if (c.eff === 'flash') {
    const cand = sp.nemici.map((n, i) => ({ n, i })).filter(({ n }) => n.pos
      && distGlob(g, sp.eroiPos[nm], n.pos) <= 2 && distGlob(g, sp.eroiPos[nm], n.pos) > 0);
    if (!cand.length) return { eff: c.eff, vuoto: 'Nessun nemico entro 2 caselle.' };
    return { eff: c.eff, titolo: 'Flash! su quale nemico?',
             opzioni: cand.map(({ n, i }) => ({ id: String(i), label: `${n.nome.toLowerCase()} (${n.pos.t})` })) };
  }
  if (c.eff === 'malacarne') {
    const truppa = sp.nemici.map((n, i) => ({ n, i }))
      .filter(({ n }) => /malavita|cultista|cane/i.test(nemStat(g, n.nome).tipo || ''));
    if (!truppa.length) return { eff: c.eff, vuoto: 'Nessun nemico di truppa in campo.' };
    return { eff: c.eff, titolo: 'Malacarne: chi allontani?',
             opzioni: truppa.map(({ n, i }) => ({ id: String(i), label: `${n.nome.toLowerCase()} (${n.pos ? n.pos.t : '?'})` })) };
  }
  if (c.eff === 'scruta') {
    const m = sp.mazzo; const rem = m ? m.ordine.length - m.indice : 0;
    if (rem <= 0) return { eff: c.eff, vuoto: 'Mazzo Minaccia esaurito.' };
    const t0 = m.pool[m.ordine[m.indice]];
    const t1 = rem >= 2 ? m.pool[m.ordine[m.indice + 1]] : null;
    const opzioni = [{ id: '0', label: `↓ in fondo: ${t0}` }];
    if (t1) opzioni.push({ id: '1', label: `↓ in fondo: ${t1}` });
    opzioni.push({ id: 'skip', label: 'lascia l’ordine com’è' });
    return { eff: c.eff, titolo: 'Sesto Senso — quale mandi in fondo?', opzioni };
  }
  if (c.eff === 'esca') {
    const celle = celleEsca(g, nm);
    if (!Object.keys(celle).length) return { eff: c.eff, vuoto: 'Nessuna casella libera entro 3.' };
    // le caselle non si scelgono da una lista ma toccando la plancia: il client
    // le accende, e manda `cella`
    return { eff: c.eff, celle, tocca: 'Tocca la casella dove lanciare l’esca (entro 3).' };
  }
  return null;      // litania, diversivo, voce: partono senza chiedere niente
}

export function usa(g, nm, scelta, cella) {
  const sp = g.sp; const c = caricaDi(nm);
  if (!c || c.usi === null) return rifiuta(`${primo(nm)} non ha un'abilità a cariche.`);
  const usate = (sp.abilita && sp.abilita[nm]) || 0;
  if (usate >= c.usi) return rifiuta(`${primo(nm)} ha finito le cariche di ${c.ab.toLowerCase()}.`);
  if (!azioniRestano(g, nm)) return rifiuta('Nessuna azione rimasta.');

  const eventi = [];
  const chiede = candidati(g, nm);
  if (chiede && chiede.vuoto) return rifiuta(chiede.vuoto);

  if (c.eff === 'litania') {
    sp.canto = Math.max(0, sp.canto - 1);
    log(g, `${primo(nm)} intona la Litania: −1 Canto (${sp.canto}).`);
  } else if (c.eff === 'diversivo') {
    sp.diversivoPronto = true;
    log(g, `${primo(nm)}: la prossima Minaccia pesca 1 carta in meno.`);
  } else if (c.eff === 'voce') {
    // «fino al suo prossimo turno»: copre il resto di questo round (Minaccia e
    // notte comprese) e l'inizio del prossimo finche' Serra non agisce.
    sp.voceFerma = { da: nm, round: sp.round };
    log(g, `${primo(nm)} tiene la voce ferma: gli eroi adiacenti tirano NERVI con +2 fino al suo prossimo turno.`);
  } else if (c.eff === 'cura') {
    const chi = scelta;
    if (!chi || !chiede.opzioni.some((o) => o.id === chi)) return rifiuta('Quell\'eroe non è fra quelli curabili.');
    const e = eroe(g, chi);
    sp.vite[chi] = Math.min(saluteMax(g, e), (sp.vite[chi] ?? 0) + 2);
    log(g, `${primo(nm)} cura ${primo(chi)} (+2 → ${sp.vite[chi]}).`);
    eventi.push({ tipo: 'curato', chi, salute: sp.vite[chi] });
  } else if (c.eff === 'flash') {
    const i = Number(scelta);
    if (!chiede.opzioni.some((o) => Number(o.id) === i)) return rifiuta('Quel nemico non è entro 2 caselle.');
    sp.nemici[i].flash = true;
    log(g, `${primo(nm)} acceca ${sp.nemici[i].nome.toLowerCase()}: salta la prossima attivazione.`);
    eventi.push({ tipo: 'accecato', bersaglio: i });
  } else if (c.eff === 'malacarne') {
    const i = Number(scelta);
    if (!chiede.opzioni.some((o) => Number(o.id) === i)) return rifiuta('Quel nemico non è di truppa.');
    const via = sp.nemici.splice(i, 1)[0];
    log(g, `${primo(nm)} chiama per nome ${via.nome.toLowerCase()}: se ne va.`);
    eventi.push({ tipo: 'allontanato', nome: via.nome });
  } else if (c.eff === 'scruta') {
    const m = sp.mazzo;
    if (scelta === '0') {
      const t0 = m.pool[m.ordine[m.indice]];
      const [x] = m.ordine.splice(m.indice, 1); m.ordine.push(x);
      log(g, `Sibilla manda in fondo «${t0.toLowerCase()}».`);
    } else if (scelta === '1') {
      const t1 = m.pool[m.ordine[m.indice + 1]];
      const [x] = m.ordine.splice(m.indice + 1, 1); m.ordine.push(x);
      log(g, `Sibilla manda in fondo «${t1.toLowerCase()}».`);
    } else if (scelta === 'skip') {
      log(g, 'Sibilla scruta il mazzo e lascia l’ordine.');
    } else return rifiuta('Scelta non valida per il Sesto Senso.');
  } else if (c.eff === 'esca') {
    if (!cella) return rifiuta('Manca la casella dove lanciare l’esca.');
    if (!chiede.celle[`${cella.t},${cella.x},${cella.y}`]) {
      return rifiuta('Quella casella è fuori dalla gittata dell’esca.');
    }
    sp.esca = cella;
    log(g, `${primo(nm)} lancia il monile in ${cella.t}: i nemici entro 2 caselle andranno lì.`);
    eventi.push({ tipo: 'esca-lanciata', cella });
  } else {
    log(g, `${primo(nm)} usa ${c.ab.toLowerCase()} (${c.nota})`);
  }

  sp.abilita = sp.abilita || {};
  sp.abilita[nm] = usate + 1;
  eventi.push({ tipo: 'carica-spesa', chi: nm, ab: c.ab, restano: c.usi - usate - 1 });
  return { eventi, azione: 'abilita' };
}
