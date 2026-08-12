// INTERAGIRE, e usare un oggetto.
//
// «Interagire» e' un'azione sola che fa cinque cose diverse a seconda di dove
// sei: aprire una grata, liberare un prigioniero, frugare sotto un arredo per
// l'uscita segreta, portare avanti il compito d'episodio, prendere un nemico
// gia' a terra. In digitale.js erano 97 righe con tre `await tiraProva` e tre
// `flash` dentro.
//
// Due cambiamenti di forma, oltre allo spostamento:
//
// 1. LEGALITA' E DIDASCALIA SI SEPARANO. `interazioneDisponibile` restituiva
//    anche la `label` del bottone — cioe' la regola sapeva come si scrive in
//    italiano quel che permette. Qui torna solo il fatto (`{tipo, ...}`), e la
//    frase la compone la vista.
// 2. IL RIFIUTO DICE PERCHE'. I `flash` diventano `{ rifiuto }` con lo stesso
//    testo: un bottone che sparisce senza spiegazioni e' il modo migliore per
//    far credere che il gioco sia rotto proprio quando sta applicando la regola
//    stampata.
import { adiacGlob, tileDi, portaCella, dirExit, grataChiusa, chiave,
         celleLibereTile, occupati } from './griglia.js';
import { eroe, primo, specScort, specScortati, statoScortati, azioniRestano } from './stat.js';
import { norm } from './regole.js';
import { specCompiti, compitoDisponibile, compitoFatte, statoCompiti,
         specRogo, rogoBrucia, haProtezioneRogo } from './obiettivi.js';

const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };
const rifiuta = (motivo) => ({ rifiuto: motivo });

export const specUscita = (g) => (specScortati(g)[0] || {}).uscita || null;
export const nomeScortato = (g) => (specScortati(g)[0] || {}).nome || 'il prigioniero';

// arredo adiacente sotto cui si puo' cercare l'uscita: serve il PNG gia' libero,
// l'uscita non ancora aperta, e non aver gia' provato sotto quell'arredo
export function arredoUscita(g, pos) {
  const sp = g.sp; const u = specUscita(g);
  if (!u || u.tile !== pos.t) return null;
  if (!statoScortati(g).some((x) => x.liberato)) return null;
  if (sp.uscita && sp.uscita.aperta) return null;
  const tile = tileDi(g, pos.t);
  return (tile.arredi || []).find((a) => String(a[2]).toUpperCase() !== 'CELLA'
    && !(sp.uscitaTentati || []).includes(chiave([a[0], a[1]]))
    && (adiacGlob(g, pos, { t: pos.t, x: a[0], y: a[1] }) || (pos.x === a[0] && pos.y === a[1]))) || null;
}

// indice del PNG scortato liberabile dalla posizione `pos`: dev'essere la sua
// tessera-prigione e, se l'episodio nomina un arredo (`cella`), esserne adiacenti
export function scortLiberabile(g, pos) {
  const st = statoScortati(g);
  for (let i = 0; i < st.length; i++) {
    const s = specScort(g, i); if (st[i].liberato || pos.t !== s.tile) continue;
    if (!s.cella) return i;
    const c = (tileDi(g, pos.t).arredi || []).find((a) => String(a[2]).toUpperCase() === String(s.cella).toUpperCase());
    if (!c) return i;                       // arredo non stampato: basta la tessera
    if (adiacGlob(g, pos, { t: pos.t, x: c[0], y: c[1] }) || (pos.x === c[0] && pos.y === c[1])) return i;
  }
  return null;
}

// COSA si puo' fare da qui. Solo il fatto: la frase la scrive la vista.
export function interazioneDisponibile(g, nm) {
  const sp = g.sp; const pos = sp.eroiPos[nm]; const tile = tileDi(g, pos.t);
  // grata: l'eroe e' sulla cella-porta con grata chiusa
  for (const [dir, raw] of Object.entries(tile.exits || {})) {
    if (grataChiusa(g, pos.t, dir, raw)) {
      const dc = portaCella(tile, dir);
      if (dc[0] === pos.x && dc[1] === pos.y) return { tipo: 'grata', dir, verso: dirExit(raw) };
    }
  }
  const i = scortLiberabile(g, pos);
  if (i != null) return { tipo: 'scortato', i };
  // uscita segreta: il PNG liberato la indica, ma dice solo la STANZA. Quale
  // arredo la nasconda lo sa solo chi tiene il fascicolo: frugare sotto quello
  // sbagliato costa comunque l'azione.
  const a = arredoUscita(g, pos);
  if (a) return { tipo: 'uscita', arredo: a };
  // compito d'episodio: le canne da sfregiare, i movimenti da spegnere, le
  // casse da sequestrare — l'obiettivo vero di quindici episodi su ventuno
  const c = compitoDisponibile(g, pos);
  // il compito bloccato si MOSTRA lo stesso, con la ragione: un bottone che
  // sparisce senza spiegazioni e' il modo migliore per far credere che il
  // gioco sia rotto proprio quando invece sta applicando la regola stampata
  if (c && c.fuoriPosto) return { tipo: 'compito', c, bloccato: 'fuori-posto' };
  if (c && c.bloccato) return { tipo: 'compito', c, bloccato: 'in-forze' };
  if (c) return { tipo: 'compito', c, fatte: compitoFatte(g, c.id) };
  return null;
}

// La prova che l'interazione richiedera', se ne richiede una. Come `provaDi`
// per le altre azioni: serve al tavolo, dove il dado arriva prima del comando.
export function provaInterazione(g, nm) {
  const disp = interazioneDisponibile(g, nm);
  if (!disp || disp.bloccato) return null;
  const e = eroe(g, nm);
  const inv = g.partita.indagine.oggetti || [];

  if (disp.tipo === 'compito' && disp.c.prova) {
    const pr = disp.c.prova;
    return { titolo: `${pr.attr.toUpperCase()} — ${primo(nm)}`, stat: pr.attr, diff: pr.diff,
             diffLabel: pr.diff, chi: nm, soglia: g.comune.regole.diff[pr.diff],
             bonus: [{ label: pr.attr.toUpperCase(), val: e[pr.attr] || 0 }] };
  }
  if (disp.tipo === 'uscita') {
    const u = specUscita(g); const a = disp.arredo; const diff = u.diff || 'Media';
    return { titolo: `spostare ${String(a[2]).toLowerCase()} — ${primo(nm)}`,
             stat: 'vigore', diff, diffLabel: diff, chi: nm,
             soglia: g.comune.regole.diff[diff],
             bonus: [{ label: 'VIGORE', val: e.vigore }] };
  }
  if (disp.tipo === 'scortato') {
    const s = specScort(g, disp.i);
    // la chiave dell'episodio apre senza prova
    if (s.chiave && inv.some((o) => new RegExp(s.chiave, 'i').test(o))) return null;
    if (!s.prova) return null;
    const attr = s.prova.attr || 'acume';
    const bonus = [{ label: attr.toUpperCase(), val: e[attr] || 0 }];
    for (const b of s.prova.bonus || []) {
      if (inv.some((o) => new RegExp(b, 'i').test(o))) bonus.push({ label: b, val: 1 });
    }
    return { titolo: `${s.prova.titolo || 'liberare ' + s.nome} — ${primo(nm)}`,
             stat: attr, diff: s.prova.diff, diffLabel: s.prova.diff, chi: nm,
             soglia: g.comune.regole.diff[s.prova.diff], bonus };
  }
  return null;
}

function tiraLa(caso, p) {
  const t = caso.tira2d6();
  const somma = t.tot + p.bonus.reduce((a, b) => a + b.val, 0);
  return { d: t.d, somma, soglia: p.soglia, bonus: p.bonus, titolo: p.titolo,
           ok: somma >= p.soglia, stat: p.stat, diff: p.diff, chi: p.chi };
}

// Un'azione libera TUTTI i prigionieri tenuti nello stesso punto: e' quanto
// dice il testo d'arbitro dell'Ep.4 («un'azione per entrambi»), dove Gaspare
// e Rocco sono legati insieme nella stessa fossa.
export function liberaScortato(g, nm, i) {
  const sp = g.sp; const pos = sp.eroiPos[nm]; const tile = tileDi(g, pos.t); const s = specScort(g, i);
  const insieme = specScortati(g)
    .map((x, k) => ({ x, k }))
    .filter(({ x, k }) => !sp.scortati[k].liberato && x.tile === s.tile && x.cella === s.cella);
  const occ = new Set();
  occupati(g, null, false).forEach((k) => { const [t, x, y] = k.split(','); if (t === pos.t) occ.add(`${x},${y}`); });
  const libere = celleLibereTile(g, tile, [pos.x, pos.y], insieme.length, occ);
  const eventi = [];
  insieme.forEach(({ x, k }, n) => {
    sp.scortati[k].liberato = true;
    const cella = libere[n] || [pos.x, pos.y];
    sp.scortati[k].pos = { t: pos.t, x: cella[0], y: cella[1] };
    log(g, `${x.nome} è libero! Riportatelo in ${x.meta}.`);
    eventi.push({ tipo: 'liberato', nome: x.nome, meta: x.meta });
  });
  return eventi;
}

export function interagisci(g, caso, nm) {
  const sp = g.sp;
  const disp = interazioneDisponibile(g, nm);
  if (!disp) return rifiuta('Qui non c\'è niente con cui interagire.');
  if (!azioniRestano(g, nm)) return rifiuta('Nessuna azione rimasta.');
  const eventi = [];

  if (disp.tipo === 'grata') {
    sp.grate.push(`${sp.eroiPos[nm].t}-${disp.dir}`);
    log(g, 'La grata è aperta.');
    return { eventi: [{ tipo: 'grata-aperta', verso: disp.verso }], azione: 'interagire' };
  }

  if (disp.tipo === 'compito') {
    const c = disp.c;
    // i due blocchi NON spendono l'azione: e' una regola, non un errore
    if (disp.bloccato === 'fuori-posto') {
      return rifiuta(`${c.nemico.toLowerCase()} non si lascia agganciare qui: vi aspetta in ${c.fuoriPosto}.`);
    }
    if (disp.bloccato === 'in-forze') {
      return rifiuta(`${c.nemico.toLowerCase()} non tratta finché è in forze: portatelo a ${c.soglia} Ferite (ora ${c.bloccato.ferite}/${c.bloccato.max}), poi Interagite.`);
    }
    if (c.prova) {
      const t = tiraLa(caso, provaInterazione(g, nm));
      eventi.push({ tipo: 'tiro', causa: 'compito', ...t });
      if (!t.ok) {
        log(g, `${primo(nm)}: ${c.fallita || 'non ci riesce'}.`);
        return { eventi, azione: 'interagire' };
      }
    }
    // un'azione puo' valere PIU' di un punto: la documentazione dell'Ep.10 vale
    // +1, o +2 con la Macchina Fotografica in inventario (`c.per_azione` col
    // moltiplicatore condizionato a un oggetto).
    let passo = 1;
    if (c.per_azione) {
      passo = c.per_azione.base || 1;
      if (c.per_azione.oggetto && (g.partita.indagine.oggetti || [])
          .some((o) => new RegExp(c.per_azione.oggetto, 'i').test(o))) passo = c.per_azione.con_oggetto || passo;
      if (c.per_azione.per_tier) passo = c.per_azione.per_tier[(g.partita.vantaggi || {}).tier || 'nessuno'] || passo;
    }
    // «Fino a DUE eroi all'intercapedine possono Interagire per documentare»:
    // il fascicolo mette un tetto per round. Il conto si azzera al cambio round.
    const st = statoCompiti(g);
    if (c.per_round_max) {
      sp.compitiRound = (sp.compitiRound && sp.compitiRound.round === sp.round)
        ? sp.compitiRound : { round: sp.round };
      sp.compitiRound[c.id] = (sp.compitiRound[c.id] || 0) + 1;
    }
    st[c.id] = (st[c.id] || 0) + passo;
    // ROGO (Ep.13) — snapshot piena/parziale ALL'ATTO DELLA PRESA: se il torchio
    // brucia adesso e manca la Cassetta, i registri escono anneriti. Deciso qui e
    // non a fine fuga, altrimenti al ritorno in T1 tutto sarebbe gia' bruciato.
    if (specRogo(g) && st[c.id] >= c.quante && sp.registriAnneriti == null) {
      sp.registriAnneriti = rogoBrucia(g, c.tile) && !haProtezioneRogo(g);
      if (sp.registriAnneriti) log(g, 'Il torchio è in fiamme: i registri si anneriscono mentre li strappate.');
      // Il Molino è ora un inferno: sgherri e guardie NON restano a battersi tra
      // le fiamme, fuggono. La fuga è una corsa contro il FUOCO, non un grind
      // contro la truppa.
      const fuggiti = sp.nemici.filter((n) => n.pos).length;
      if (fuggiti) {
        sp.nemici = sp.nemici.filter((n) => !n.pos);
        log(g, `Il Molino è in fiamme: ${fuggiti} tra sgherri e guardie fuggono. Ora siete voi contro il rogo.`);
        eventi.push({ tipo: 'fuggiti', quanti: fuggiti });
      }
    }
    if (c.nemico) {                       // catturato: esce dal tavolo, non e' un morto
      const j = sp.nemici.findIndex((n) => n.pos && n.nome === c.nemico && adiacGlob(g, sp.eroiPos[nm], n.pos));
      if (j >= 0) { sp.nemici.splice(j, 1); eventi.push({ tipo: 'catturato', nome: c.nemico }); }
    }
    log(g, `${primo(nm)}: ${c.etichetta.toLowerCase()} (${st[c.id]}/${c.quante}).`);
    if (st[c.id] >= c.quante && c.fatto) log(g, c.fatto);
    eventi.push({ tipo: 'compito-avanzato', id: c.id, fatte: st[c.id], quante: c.quante });
    return { eventi, azione: 'interagire' };
  }

  if (disp.tipo === 'uscita') {
    const u = specUscita(g); const a = disp.arredo;
    const giusto = a[0] === u.arredo[0] && a[1] === u.arredo[1];
    const t = tiraLa(caso, provaInterazione(g, nm));
    eventi.push({ tipo: 'tiro', causa: 'uscita', ...t });
    if (!t.ok) {
      log(g, `${primo(nm)} non riesce a smuovere ${String(a[2]).toLowerCase()}.`);
      return { eventi, azione: 'interagire' };
    }
    if (!giusto) {
      // arredo sbagliato: l'azione e' spesa, e quell'arredo non si ritenta piu'
      sp.uscitaTentati = (sp.uscitaTentati || []).concat(chiave([a[0], a[1]]));
      log(g, `Sotto ${String(a[2].toLowerCase())} non c'è nulla: solo pietra.`);
      return { eventi, azione: 'interagire' };
    }
    sp.uscita = { aperta: true, tile: u.tile, cella: [u.arredo[0], u.arredo[1]] };
    log(g, `${u.testo || 'Sotto l’arredo si apre un passaggio.'} Portateci ${nomeScortato(g)}.`);
    eventi.push({ tipo: 'uscita-aperta', tile: u.tile, cella: sp.uscita.cella });
    return { eventi, azione: 'interagire' };
  }

  if (disp.tipo === 'scortato') {
    const i = disp.i; const s = specScort(g, i);
    const inv = g.partita.indagine.oggetti || [];
    // la chiave dell'episodio apre senza prova; senza prova dichiarata basta Interagire
    if ((s.chiave && inv.some((o) => new RegExp(s.chiave, 'i').test(o))) || !s.prova) {
      return { eventi: liberaScortato(g, nm, i), azione: 'interagire' };
    }
    const t = tiraLa(caso, provaInterazione(g, nm));
    eventi.push({ tipo: 'tiro', causa: 'liberare', ...t });
    if (!t.ok) {
      log(g, `${primo(nm)} ${s.prova.fallita || 'non riesce a liberare ' + s.nome}.`);
      return { eventi, azione: 'interagire' };
    }
    return { eventi: [...eventi, ...liberaScortato(g, nm, i)], azione: 'interagire' };
  }
  return rifiuta('Qui non c\'è niente con cui interagire.');
}

// ------------------------------------------------------------- usare un oggetto
// Diapason: Ep.1, Custode Difesa 5 + salta attivazione. La chiave che libera il
// PNG scortato viene dal dato (ep.scortato[].chiave). Passivi e oggetti-quest:
// si leggono soltanto, e NON spendono l'azione.
export function usaOggetto(g, nm, quale) {
  const sp = g.sp; const inv = g.partita.indagine.oggetti || [];
  if (!inv.length) return rifiuta('Inventario del gruppo vuoto.');
  if (!quale) return rifiuta('Nessun oggetto scelto.');
  if (!inv.includes(quale)) return rifiuta('Quell\'oggetto non è nell\'inventario del gruppo.');
  if (!azioniRestano(g, nm)) return rifiuta('Nessuna azione rimasta.');
  const pos = sp.eroiPos[nm];

  if (/diapason/i.test(quale)) {
    const boss = g.ep.soluzione.boss;
    const i = sp.nemici.findIndex((n) => n.nome === boss && n.pos && adiacGlob(g, pos, n.pos));
    if (i < 0) return rifiuta(`Devi essere adiacente al ${boss.toLowerCase()}.`);
    sp.nemici[i].difMod = 5; sp.nemici[i].flash = true;
    log(g, `${primo(nm)} fa vibrare il diapason: ${boss.toLowerCase()} Difesa 5 e salta la prossima attivazione.`);
    return { eventi: [{ tipo: 'oggetto-usato', quale, bersaglio: i, effetto: 'diapason' }],
             azione: 'oggetto' };
  }

  // chiave di liberazione dell'episodio (dato: ep.scortato[].chiave)
  const iChiave = specScortati(g).findIndex((s) => s.chiave && new RegExp(s.chiave, 'i').test(quale));
  if (iChiave >= 0) {
    const s = specScort(g, iChiave);
    if (scortLiberabile(g, pos) === iChiave) {
      return { eventi: liberaScortato(g, nm, iChiave), azione: 'interagire' };
    }
    return rifiuta(`${quale} apre la cella in ${s.tile} (vacci adiacente).`);
  }

  // passivo o narrativo: si legge e basta, nessuna azione spesa
  const o = (g.ep.oggetti || []).find((x) => norm(x.nome) === norm(quale));
  return { eventi: [{ tipo: 'oggetto-letto', quale, effetto: (o && o.effetto) || null }],
           azione: null };
}
