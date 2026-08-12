// LE AZIONI DELL'EROE, come regole invece che come gestori di click.
//
// La differenza con digitale.js non e' dove sta il codice, e' la FORMA. Prima
// una regola faceva tre cose che qui sono separate:
//
//   - rifiutava mostrando un `flash()` — cioe' la ragione del rifiuto era un
//     effetto collaterale sullo schermo, e chi non ha uno schermo non la vedeva.
//     Adesso e' un valore: `{ rifiuto: 'Nemico non adiacente…' }`.
//   - si fermava a meta' con `await tiraProva()` per chiedere un dado. Adesso
//     il dado lo tira il motore col `caso` che gli si passa, e il risultato
//     esce come EVENTO: la vista lo anima, non lo decide.
//   - si fermava a meta' con `await scegli()` per chiedere una scelta. Quelle
//     scelte il client puo' farle PRIMA — i candidati si calcolano dallo stato
//     — quindi arrivano dentro il comando gia' fatte.
//
// Resta un solo caso in cui il motore deve davvero aspettare: il COLPO DA
// MACELLO di Ottone, che si puo' scegliere solo dopo aver visto cadere il primo
// nemico. Quello diventa `stato.pendenza`, che sta NELLO STATO — quindi chi
// ricarica la pagina se la ritrova, mentre una promise interrotta perdeva il
// turno.
import { adiacGlob, tileDi } from './griglia.js';
import { eroe, nemStat, primo, azioneSpesa, azioniRestano, azioniMax,
         saluteMax, bonusVoce } from './stat.js';
import { cerca, norm } from './regole.js';
import { controllaVittoria } from './vittoria.js';
import { specCompiti, compitiFiniti } from './obiettivi.js';
import { spawnDaTesto } from './minaccia.js';
import { provaInterazione } from './interazioni.js';

const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };
const rifiuta = (motivo) => ({ rifiuto: motivo });

// una prova richiesta da un testo (oggetto/tessera/carta): "... NERVI (Media) ..."
export function provaRichiesta(text) {
  const m = String(text || '').match(/(NERVI|ACUME|VIGORE)\s*\((Facile|Media|Difficile)\)/i);
  if (!m) return null;
  return { stat: m[1].toLowerCase(), diff: m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() };
}

// applica la conseguenza di una prova fallita in base al testo (danno e/o
// stordimento); ritorna le righe da mostrare.
export function applicaConseguenza(g, nm, testo) {
  const sp = g.sp; const e = eroe(g, nm); const out = [];
  if (/danno/i.test(testo)) {
    sp.vite[nm] = Math.max(0, (sp.vite[nm] ?? saluteMax(g, e)) - 1);
    out.push(`${primo(nm)} subisce 1 danno.`);
  }
  if (/(1 sola azione|perdete 1 azione|perde 1 azione|azione al prossimo turno)/i.test(testo)) {
    sp.storditi = sp.storditi || {};
    sp.storditi[nm] = sp.round + 1;
    out.push(`${primo(nm)} è stordito: 1 sola azione al prossimo turno.`);
  }
  if (!out.length) out.push(`${primo(nm)}: applica la conseguenza descritta.`);
  return out;
}

// QUALE PROVA SERVIRA', senza tirarla.
//
// Esiste per la modalita' TAVOLO, dove i dadi sono di legno: li' il tiro deve
// arrivare PRIMA del comando, ma l'overlay che lo chiede vuole mostrare soglia
// e bonus — che finora li sapeva solo il motore, e solo mentre eseguiva. Uovo e
// gallina: il client ha bisogno prima di una cosa che il motore decide durante.
//
// La chiave perche' questo non diventi una seconda copia delle regole: **la
// usano anche i risolutori**. `cercare` e `attacca` non ricalcolano soglia e
// bonus, li chiedono qui. Chi dichiara e chi risolve leggono la stessa riga,
// quindi non possono divergere.
//
// Restituisce null quando non c'e' niente da tirare. Restituisce la PRIMA prova
// del comando: se poi il motore ne chiede un'altra (il secondo colpo di Ottone,
// che si sa solo dopo aver visto cadere il primo nemico) rifiuta con «i tiri
// dichiarati non bastano», e il client ne chiede un altro.
export function provaDi(g, comando) {
  const nm = comando.eroe;
  if (comando.tipo === 'cerca') {
    const extra = nm === 'ELENA FOSCO' ? [{ label: 'Occhio Clinico', val: 2 }] : [];
    return prova(g, nm, 'acume', 'Media', extra, `cercare — ${primo(nm)}`);
  }
  if (comando.tipo === 'attacca' || comando.tipo === 'rispondi') {
    const i = comando.tipo === 'attacca' ? comando.bersaglio : Number(comando.scelta);
    const chi = comando.tipo === 'attacca' ? nm : (g.sp.pendenza || {}).a;
    const n = g.sp.nemici[i]; if (!n || !chi) return null;
    const e = eroe(g, chi); const st = nemStat(g, n.nome);
    return {
      titolo: `${primo(chi)} → ${n.nome.toLowerCase()}`,
      diffLabel: 'Difesa', diff: null, stat: null, chi,
      soglia: n.difMod ?? st.dif,
      bonus: [{ label: 'VIGORE', val: e.vigore }, { label: 'arma', val: 1 }],
    };
  }
  if (comando.tipo === 'interagisci') {
    // la delega a interazioni.js: quale prova serva dipende da COSA c'e' da
    // fare qui, e quello lo sa lei
    return provaInterazione(g, nm);
  }
  if (comando.tipo === 'muovi') {
    // l'insidia d'ingresso: solo la PRIMA volta che si entra in quella tessera
    const t = tileDi(g, comando.nodo.t);
    const req = provaRichiesta(t && t.testo);
    if (!req || (g.sp.insidie && g.sp.insidie[comando.nodo.t])) return null;
    return prova(g, nm, req.stat, req.diff, [],
                 `${comando.nodo.t} — ${(t.nome || '').toLowerCase()}`);
  }
  return null;
}

function prova(g, nm, stat, diff, bonusExtra, titolo) {
  const e = eroe(g, nm);
  return {
    titolo, stat, diff, diffLabel: diff, chi: nm,
    soglia: g.comune.regole.diff[diff],
    bonus: [{ label: String(stat).toUpperCase(), val: e[stat] || 0 },
            ...bonusVoce(g, nm, stat), ...bonusExtra],
  };
}

// Il tiro di una prova gia' dichiarata. `comando.tiri` — i dadi di legno del
// tavolo — ha la precedenza sul caso: e' cosi' che la stessa regola serve le
// due modalita' senza saperlo.
function tiraLa(caso, p) {
  const t = caso.tira2d6();
  const somma = t.tot + p.bonus.reduce((a, b) => a + b.val, 0);
  return { d: t.d, somma, soglia: p.soglia, bonus: p.bonus,
           ok: somma >= p.soglia, stat: p.stat, diff: p.diff, chi: p.chi };
}

// Segnare l'azione e' anche il momento in cui la partita puo' chiudersi: se
// l'ultimo eroe raggiunge la meta a obiettivo fatto, si vince li'.
export function segnaAzione(g, nm, tipo) {
  const sp = g.sp;
  if (!sp.azioni[nm]) sp.azioni[nm] = [];
  // Chi ha iniziato il turno lo TIENE finche' non dichiara di aver finito.
  // Senza questa riga l'eroe attivo resta quello scelto dal fallback di
  // eroiAttivoNome() (l'ordine del party), ricalcolato a ogni render: rianimare
  // un compagno lo rimette fra i vivi e, se sta prima nell'ordine, si prende il
  // turno rubando al rianimatore la seconda azione.
  sp.eroiAttivo = nm;
  sp.azioni[nm].push(tipo);
  const vinta = controllaVittoria(g);
  if (vinta) return { vinta };
  if (sp.azioni[nm].length >= azioniMax(g, nm)) { finisciEroe(g, nm); return { finito: true }; }
  return {};
}

export function finisciEroe(g, nm) {
  const sp = g.sp;
  if (nm && !sp.eroiFatti.includes(nm)) sp.eroiFatti.push(nm);
  sp.eroiAttivo = null;
}

// ------------------------------------------------------------------ muovere
export function muovi(g, caso, nm, node, revealId) {
  const sp = g.sp;
  const eventi = [];
  sp.eroiPos[nm] = node;
  if (revealId && !sp.rivelate.includes(revealId)) {
    sp.rivelate.push(revealId);
    const dest = tileDi(g, revealId);
    log(g, `${primo(nm)} apre la via verso ${revealId}: ${dest.nome.toLowerCase()}.`);
    eventi.push({ tipo: 'rivelata', tessera: revealId });
    if (/quando rivelate/i.test(dest.testo || '')) spawnDaTesto(g, dest.testo, revealId);
  } else {
    log(g, `${primo(nm)} si sposta in ${node.t}.`);
  }
  // insidia d'ingresso: la PRIMA volta che si entra in una tessera il cui testo
  // richiede una prova (es. T3 NERVI Media, T5 NERVI Facile), il tiro scatta qui
  const tnow = tileDi(g, node.t);
  const p = provaDi(g, { tipo: 'muovi', eroe: nm, nodo: node });
  if (p) {
    sp.insidie = sp.insidie || {};
    sp.insidie[node.t] = true;
    const t = tiraLa(caso, p);
    eventi.push({ tipo: 'tiro', causa: 'insidia-ingresso', tessera: node.t,
                  testo: tnow.testo, titolo: p.titolo, ...t });
    if (!t.ok) {
      const righe = applicaConseguenza(g, nm, tnow.testo);
      righe.forEach((r) => log(g, r));
      eventi.push({ tipo: 'conseguenza', righe });
    }
  }
  return { eventi, azione: 'muovere' };
}

// ------------------------------------------------------------------ cercare
export function cercare(g, caso, nm) {
  const sp = g.sp; const tile = tileDi(g, sp.eroiPos[nm].t);
  if (sp.cercate[tile.id]) return rifiuta('Qui avete già cercato.');
  const p = provaDi(g, { tipo: 'cerca', eroe: nm });
  const t = tiraLa(caso, p);
  const eventi = [{ tipo: 'tiro', causa: 'cercare', tessera: tile.id, titolo: p.titolo, ...t }];
  if (!t.ok) {
    log(g, `${primo(nm)} fruga invano.`);
    return { eventi, azione: 'cercare' };
  }
  sp.cercate[tile.id] = true;
  const esito = cerca(g.ep, g.partita, tile.id);
  const ev = { tipo: 'cercato', tessera: tile.id, esito: esito.esito };
  // registra l'oggetto della tessera (ep.oggetti con ref = id tessera)
  const obj = (g.ep.oggetti || []).find((o) => o.ref === tile.id);
  if (obj) {
    g.partita.indagine.oggetti = g.partita.indagine.oggetti || [];
    if (!g.partita.indagine.oggetti.some((x) => norm(x) === norm(obj.nome))) {
      g.partita.indagine.oggetti.push(obj.nome);
      ev.trovato = { nome: obj.nome, effetto: obj.effetto || null };
    }
  }
  eventi.push(ev);
  // se il testo dell'oggetto richiede una prova (es. presa rischiosa NERVI)
  const req = provaRichiesta(esito.esito);
  if (req) {
    const p2 = prova(g, nm, req.stat, req.diff, [], `${tile.id} — cercare`);
    const t2 = tiraLa(caso, p2);
    eventi.push({ tipo: 'tiro', causa: 'oggetto', testo: esito.esito, titolo: p2.titolo, ...t2 });
    if (!t2.ok) {
      const righe = applicaConseguenza(g, nm, esito.esito);
      righe.forEach((r) => log(g, r));
      eventi.push({ tipo: 'conseguenza', righe });
    }
  }
  return { eventi, azione: 'cercare' };
}

// ---------------------------------------------------------------- rianimare
export function rianima(g, nm) {
  const sp = g.sp; const pos = sp.eroiPos[nm];
  const giu = g.partita.party.find((x) => x !== nm && (sp.vite[x] ?? 1) <= 0
    && adiacGlob(g, pos, sp.eroiPos[x]));
  if (!giu) return rifiuta('Nessun compagno a terra qui accanto.');
  sp.vite[giu] = nm.includes('ATTILIO') ? 3 : 2;
  log(g, `${primo(nm)} rianima ${primo(giu)} (${sp.vite[giu]} salute).`);
  return { eventi: [{ tipo: 'rianimato', chi: giu, salute: sp.vite[giu] }], azione: 'rianimare' };
}

// ---------------------------------------------------------------- attaccare
// L'unica azione che puo' lasciare una PENDENZA: il Colpo da macello di Ottone
// si sceglie dopo aver visto cadere il primo nemico, quindi non e'
// pre-dichiarabile come le altre.
export function attacca(g, caso, nm, i, gratis) {
  const sp = g.sp; const n = sp.nemici[i];
  if (!n) return rifiuta('Quel nemico non è più in campo.');
  if (!gratis && azioneSpesa(g, nm, 'attaccare')) {
    return rifiuta(`${primo(nm)} ha già attaccato: le 2 azioni sono di tipo diverso.`);
  }
  if (!gratis && !azioniRestano(g, nm)) return rifiuta(`${primo(nm)} non ha più azioni.`);
  if (!adiacGlob(g, sp.eroiPos[nm], n.pos)) return rifiuta('Nemico non adiacente: avvicinati prima.');
  if (n.abbattuto) return rifiuta(`${n.nome.toLowerCase()} è già a terra: ora va preso (Interagire).`);

  const p = provaDi(g, { tipo: 'attacca', eroe: nm, bersaglio: i });
  const t = tiraLa(caso, p);
  const dif = p.soglia; const somma = t.somma; const colpito = t.ok;
  const eventi = [{ tipo: 'tiro', causa: 'attacco', chi: nm, bersaglio: i,
                    titolo: p.titolo, ...t }];

  if (!colpito) {
    log(g, `${primo(nm)} manca ${n.nome.toLowerCase()} (${somma} < Dif ${dif}).`);
    return { eventi, azione: gratis ? null : 'attaccare' };
  }

  n.ferite += 1;
  log(g, `${primo(nm)} colpisce ${n.nome.toLowerCase()} (2d6+VIG ${somma} ≥ Dif ${dif} → ${n.ferite}/${n.max}).`);
  eventi.push({ tipo: 'ferito', bersaglio: i, ferite: n.ferite, max: n.max });

  if (n.ferite < n.max) return { eventi, azione: gratis ? null : 'attaccare' };

  // Il bersaglio di un compito non si toglie dal campo: il fascicolo dice
  // «va ridotto/abbattuto E POI preso» (gen_ep15.py:658), ma il compito
  // esige il nemico adiacente — toglierlo lo rendeva impossibile per
  // sempre, e la partita restava appesa senza spiegazione. Resta a terra
  // finche' non lo si prende; a quel punto Interagire lo rimuove.
  const obiettivo = specCompiti(g).some((c) => c.nemico === n.nome) && !compitiFiniti(g);
  if (obiettivo) {
    n.abbattuto = true;
    log(g, `${n.nome.toLowerCase()} è a terra: ora si può prendere (Interagire).`);
    eventi.push({ tipo: 'a-terra', bersaglio: i });
    return { eventi, azione: gratis ? null : 'attaccare' };
  }

  log(g, `${n.nome.toLowerCase()} è abbattuto!`);
  const caduto = n.nome;
  sp.nemici.splice(i, 1);
  eventi.push({ tipo: 'abbattuto', bersaglio: i, nome: caduto });

  // COLPO DA MACELLO di Ottone: abbattuto un nemico in mischia, il secondo
  // colpo parte subito e non costa l'azione. Una volta per suo turno —
  // `sp.macello` tiene il round in cui l'ha gia' fatto.
  if (nm.includes('OTTONE') && sp.macello !== sp.round) {
    const vicini = sp.nemici.map((x, j) => ({ x, j }))
      .filter(({ x }) => x.pos && !x.abbattuto && adiacGlob(g, sp.eroiPos[nm], x.pos));
    if (vicini.length === 1) {
      // un solo bersaglio: non c'e' niente da chiedere, il colpo parte
      sp.macello = sp.round;
      const dopo = attacca(g, caso, nm, vicini[0].j, true);
      return { eventi: [...eventi, ...(dopo.eventi || [])], azione: gratis ? null : 'attaccare' };
    }
    if (vicini.length > 1) {
      return {
        eventi, azione: gratis ? null : 'attaccare',
        pendenza: {
          a: nm, tipo: 'macello',
          testo: 'Colpo da macello: chi cade adesso?',
          opzioni: vicini.map(({ x, j }) => ({ id: j, label: `${x.nome.toLowerCase()} (${x.ferite}/${x.max})` })),
        },
      };
    }
  }
  return { eventi, azione: gratis ? null : 'attaccare' };
}

// La risposta a una pendenza. Oggi ce n'e' una sola, ma il meccanismo e' quello
// che servira' a tutte: la domanda sta nello stato, la risposta la scioglie.
export function rispondi(g, caso, scelta) {
  const sp = g.sp; const p = sp.pendenza;
  if (!p) return rifiuta('Non c\'è nessuna scelta in sospeso.');
  if (p.tipo === 'macello') {
    sp.pendenza = null;
    // il colpo si consuma solo se parte: chi rinuncia lo tiene
    if (scelta == null) return { eventi: [{ tipo: 'macello-rinunciato' }] };
    const j = Number(scelta);
    if (!p.opzioni.some((o) => o.id === j)) return rifiuta('Quel bersaglio non è fra quelli offerti.');
    sp.macello = sp.round;
    const out = attacca(g, caso, p.a, j, true);
    return { eventi: out.eventi || [], pendenza: out.pendenza || null };
  }
  sp.pendenza = null;
  return { eventi: [] };
}
