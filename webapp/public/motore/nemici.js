// IL TURNO DELLA NOTTE: dove vanno i nemici e chi colpiscono.
//
// Qui si decide E si risolve, tutto in una volta, e ne esce un PIANO: la lista
// di cosa fa ciascun nemico, con le posizioni di partenza e d'arrivo e l'esito
// del colpo. L'animazione e' un'altra cosa e sta nella vista — riproduce il
// piano, non lo costruisce.
//
// E' la separazione che mancava. In digitale.js il danno era applicato in TRE
// posti diversi: nel piano quando l'app tira, dentro l'animazione quando tira
// il tavolo, e in una terza copia per chi salta l'animazione. Tre
// implementazioni della stessa regola, che divergono appena una si tocca. Qui
// ce n'e' una sola, e chi salta l'animazione salta l'animazione — non le regole.
//
// IL CASO ARRIVA DA FUORI, con `caso`:
//   caso.tira2d6() -> { d:[a,b], tot }   il tiro d'attacco
//   caso.scegli(n) -> intero in [0,n)    quale bersaglio, quale vittima
// Chi chiama decide se e' Math.random (come oggi) o il generatore seminato
// della partita (come sara'). Il motore non lo sa e non deve saperlo: e' cio'
// che rende una serata rigiocabile senza cambiare una riga di regole.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`.
import { adiacGlob, camminoGlob, celleAdiacLibere, occupati, nk } from './griglia.js';
import { eroe, nemStat, saluteMax, primo, statoScortati, specScort, difesaDi } from './stat.js';
import { fineRound } from './regole.js';
import { specOrologio, avanzaOrologio, avanzaRogo, avanzaCancellazione,
         avanzaRitmo, avanzaPressione, controllaFiloPerso,
         specCompiti, compitiFiniti } from './obiettivi.js';
import { destaBossSeSoglia } from './minaccia.js';
import { distGlob } from './griglia.js';

const log = (g, t) => { g.sp.log = g.sp.log || []; g.sp.log.push(t); };

// L'UNICA applicazione del danno a un eroe. Prima erano tre.
function colpisciEroe(g, nomeNemico, vitt, dan, tot, dif) {
  const sp = g.sp; const e = eroe(g, vitt);
  const colpito = tot >= dif;
  if (colpito) {
    sp.vite[vitt] = Math.max(0, (sp.vite[vitt] ?? saluteMax(g, e)) - dan);
    log(g, `${nomeNemico.toLowerCase()} colpisce ${primo(vitt)} (2d6+att ${tot} ≥ ${dif}, −${dan}).`);
    if (sp.vite[vitt] <= 0) log(g, `${primo(vitt)} va a terra!`);
  } else {
    log(g, `${nomeNemico.toLowerCase()} manca ${primo(vitt)} (${tot} < ${dif}).`);
  }
  return { vitt, colpito, dan, tot, dif };
}

// L'UNICA applicazione del danno al PNG scortato vulnerabile (Ep.9).
function colpisciPng(g, nomeNemico, iPng, dan, tot, dif) {
  const sp = g.sp; const sc = specScort(g, iPng); const png = statoScortati(g)[iPng];
  if (!png || png.vite <= 0) return;
  if (tot >= dif) {
    png.vite = Math.max(0, png.vite - dan);
    log(g, `${nomeNemico.toLowerCase()} colpisce ${sc.nome} (${tot}, −${dan}: ${png.vite}/${sc.salute}).`);
    if (png.vite <= 0) {
      sp.esito = 'sconfitta';
      sp.log.push(`${sc.nome} è caduto: la spedizione è fallita.`);
    }
  } else {
    log(g, `${nomeNemico.toLowerCase()} manca ${sc.nome} (${tot}).`);
  }
}

// Il piano del turno. `differito` = al tavolo i dadi li tira il tavolo durante
// l'animazione, quindi il piano porta solo l'INTENZIONE e i colpi restano da
// risolvere (ci pensa `risolviResto`).
export function pianoNemici(g, caso, differito) {
  const sp = g.sp;
  const vivi = () => g.partita.party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  const piano = []; piano.annunci = []; piano.vite0 = { ...sp.vite };
  piano.differito = !!differito;

  for (let i = 0; i < sp.nemici.length; i++) {
    const n = sp.nemici[i]; const st = nemStat(g, n.nome);
    if (!n.pos || n.abbattuto) continue;
    const pos0 = n.pos;

    if (n.flash) {
      n.flash = false;
      log(g, `${n.nome.toLowerCase()} è accecato: salta il turno.`);
      piano.push({ i, nome: n.nome, pos0, pos1: pos0, flash: true, attacco: null });
      continue;
    }

    const bersagli = vivi(); if (!bersagli.length) break;

    // ESCA PREZIOSA: chi e' entro 2 caselle dal monile ci va, e per questa
    // attivazione non attacca nessuno. Vale una volta sola — l'esca si
    // consuma a fine fase, come dice la carta («la loro prossima attivazione»).
    if (sp.esca && distGlob(g, n.pos, sp.esca) <= 2) {
      const cam = camminoGlob(g, n.pos, sp.esca, occupati(g, `N:${i}`, false, true));
      if (cam.length) {
        const bloccoArrivo = occupati(g, `N:${i}`, false);
        let k = Math.min(st.mov, cam.length) - 1;
        while (k >= 0 && bloccoArrivo.has(nk(cam[k]))) k -= 1;
        if (k >= 0) n.pos = cam[k];
      }
      log(g, `${n.nome.toLowerCase()} segue il luccichio del monile.`);
      piano.push({ i, nome: n.nome, pos0, pos1: n.pos, flash: false, attacco: null });
      continue;
    }

    const scelto = bersagli[caso.scegli(bersagli.length)];
    if (!bersagli.some((nm) => adiacGlob(g, n.pos, sp.eroiPos[nm]))) {
      // Due insiemi diversi, come per gli eroi: il PNG scortato si ATTRAVERSA
      // ma non ci si FERMA sopra (regolamento: gli alleati e il PNG si passano,
      // non si sostano). Usare il solo set di cammino anche per l'arrivo faceva
      // fermare i nemici sulla sua casella, sovrapposti alla pedina.
      const blocco = occupati(g, `N:${i}`, false, true);     // cammino: il PNG si attraversa
      const bloccoArrivo = occupati(g, `N:${i}`, false);     // arrivo: sul PNG non ci si ferma
      let best = null, bestLen = Infinity;
      for (const nm of bersagli) for (const cel of celleAdiacLibere(g, sp.eroiPos[nm], bloccoArrivo)) {
        const p = camminoGlob(g, n.pos, cel, blocco);
        if (p.length && p.length < bestLen) { bestLen = p.length; best = p; }
      }
      if (best) {
        let k = Math.min(st.mov, best.length) - 1;
        while (k >= 0 && bloccoArrivo.has(nk(best[k]))) k -= 1;   // arretra fino a una casella libera
        if (k >= 0) n.pos = best[k];                              // muta live: blocco del prossimo lo vede
      }
    }

    const pos1 = n.pos;
    let attacco = null;

    // il PNG vulnerabile e' un bersaglio come gli eroi (Ep.9: 3 Salute, non
    // combatte). Gli altri PNG scortati restano invisibili ai nemici, come dice
    // il Regolamento.
    const iPng = statoScortati(g).findIndex((png, k) => png.liberato && png.pos && png.vite > 0
      && specScort(g, k).salute && adiacGlob(g, n.pos, png.pos));
    const adiacenti = bersagli.filter((nm) => adiacGlob(g, n.pos, sp.eroiPos[nm]));

    if (iPng >= 0 && (!adiacenti.length || caso.scegli(2) === 0)) {
      const sc = specScort(g, iPng);
      const dif = sc.difesa || 7;
      if (differito) {
        // al tavolo il piano porta solo l'intenzione: i dadi li tira il tavolo
        piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco: null,
                     attaccoPng: { png: iPng, dif, dan: st.dan, att: st.att } });
        continue;
      }
      const t = caso.tira2d6();
      colpisciPng(g, n.nome, iPng, st.dan, t.tot + st.att, dif);
      piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco: null });
      continue;
    }

    if (adiacenti.length) {
      const vitt = adiacenti.includes(scelto) ? scelto : adiacenti[caso.scegli(adiacenti.length)];
      // La Difesa si CHIEDE, non si legge dalla carta: Spalle coperte la alza a
      // chi ha un compagno accanto. Si calcola qui, al momento del colpo, ed e'
      // il numero che finisce nel piano — cosi' il tavolo che tira dopo usa la
      // stessa soglia che l'app ha mostrato.
      const dif = difesaDi(g, vitt);
      if (differito) {
        // intenzione senza tiro: `tot`/`colpito` mancano apposta ed e'
        // l'animazione a chiederli al tavolo, dado alla mano
        piano.push({ i, nome: n.nome, pos0, pos1, flash: false,
                     attacco: { vitt, dan: st.dan, att: st.att, dif } });
        continue;
      }
      const t = caso.tira2d6();
      attacco = colpisciEroe(g, n.nome, vitt, st.dan, t.tot + st.att, dif);
    }
    piano.push({ i, nome: n.nome, pos0, pos1, flash: false, attacco });
  }
  return piano;
}

// I nemici che restano quando si salta l'animazione al tavolo: li tira chi
// chiama, stesse regole, senza chiedere un dado per uno. `da` e' il primo non
// risolto. Passa dalle STESSE due funzioni di sopra: e' il punto di tutto
// questo file.
export function risolviResto(g, caso, piano, da) {
  for (const s of piano.slice(piano.indexOf(da))) {
    if (s.attaccoPng) {
      const t = caso.tira2d6();
      colpisciPng(g, s.nome, s.attaccoPng.png, s.attaccoPng.dan,
                  t.tot + s.attaccoPng.att, s.attaccoPng.dif);
    }
    const a = s.attacco;
    if (a && a.tot === undefined) {
      const t = caso.tira2d6();
      const esito = colpisciEroe(g, s.nome, a.vitt, a.dan, t.tot + a.att, a.dif);
      a.tot = esito.tot; a.colpito = esito.colpito;
    }
  }
}

// LA CODA DI FINE ROUND: tutto quello che scatta quando la notte ha finito di
// muoversi. Sta qui e non nella vista perche' sono regole — il tick del Canto,
// gli orologi d'episodio, e soprattutto le SOGLIE SUL CANTO, che decidono se
// una serata e' persa o solo declassata.
//
// Restituisce gli annunci; non tocca ne' schermo ne' salvataggio.
export function fineRoundNemici(g, piano) {
  const sp = g.sp;
  const ann = [];
  ann.push(...fineRound(g.comune, g.ep, sp));
  const oc = specOrologio(g);
  if (oc && oc.ogni) ann.push(...avanzaOrologio(g, oc.ogni, 'fine round'));
  ann.push(...avanzaRogo(g));              // il doom-clock del Rogo (Ep.13)
  ann.push(...avanzaCancellazione(g));     // la clessidra dell'Ep.15
  ann.push(...avanzaRitmo(g));             // il ritmo del controcanto (Ep.20)
  ann.push(...avanzaPressione(g));         // ...e cio' che gli corre contro
  ann.push(...controllaFiloPerso(g));      // il bersaglio da prendere vivo e' caduto?

  // Cinque episodi non hanno una traccia propria: la loro soglia E' IL CANTO —
  // «prima che il Canto raggiunga la soglia-FUGA» (Ep.14), soglia-sigillo,
  // soglia-decano, soglia-arresto, risveglio. Sono i numeri che le Soluzioni
  // dichiarano episodio per episodio.
  //
  // …e un OGGETTO puo' alzare quella soglia, dove il fascicolo lo dice: la
  // Parola dei Tetti «porta la soglia-fuga da 5 a 6» (Ep.14), il Salvacondotto
  // la soglia-decano «da 6 a 7» (Ep.17), l'Uscita di Servizio la soglia-arresto
  // «da 7 a 8» (Ep.18). Erano tre regole SOLO STAMPATE: l'orologio non aveva
  // alcun campo per leggerle, quindi chi si guadagnava l'oggetto non ne
  // ricavava nulla. Stesso schema di `compito.ridotto_oggetto`.
  const sogliaOrologio = oc && oc.su_canto != null
    ? (oc.su_canto_oggetto && (g.partita.indagine.oggetti || [])
        .some((o) => new RegExp(oc.su_canto_oggetto, 'i').test(o))
        ? (oc.su_canto_con_oggetto || oc.su_canto) : oc.su_canto)
    : null;
  // …e NON declassa un lavoro gia' finito. Le Soluzioni legano la scadenza
  // all'OBIETTIVO, non alla fine della partita: «i tre pannelli disaccordati
  // PRIMA del 4o segnalino» (Ep.4), «prima del sigillo» (Ep.15), «il decano
  // lucido PRIMA della soglia» (Ep.17). Un Gatto gia' agganciato non scavalca
  // piu' la cresta. Senza questa condizione l'Ep.4 sabotava la Conchiglia al
  // round 8 e veniva declassato al 10 mentre riportava i prigionieri a casa:
  // 0 vittorie piene su 15, tutte per un lavoro fatto in tempo.
  const lavoroFatto = specCompiti(g).length > 0 && compitiFiniti(g);
  if (oc && sogliaOrologio && !sp.esito && !lavoroFatto && sp.canto >= sogliaOrologio) {
    const testo = oc.testo || `${oc.nome}: troppo tardi.`;
    if (oc.esito === 'parziale') {
      // DECLASSA, NON CHIUDE. I fascicoli dicono «peggiora e si continua»
      // (Ep.17: «il decano lo recuperate comunque, ma ferito»; Ep.18: «un
      // eroe per round rischia la cattura»), e il gruppo deve poter finire
      // il lavoro. Chiudendo qui la vittoria PIENA diventava irraggiungibile:
      // BILANCIAMENTO registrava Ep.17 e Ep.18 al 100% vinti e 0% piena.
      // Il flag lo legge controllaVittoria, come gia' fa per il ROGO.
      if (!sp.declassato) { sp.declassato = testo; sp.log.push(testo); ann.push(testo); }
    } else {
      sp.esito = 'sconfitta'; sp.log.push(testo); ann.push(testo);
    }
  }
  ann.push(...destaBossSeSoglia(g));

  sp.esca = null;                  // il monile ha fatto il suo giro: si raccoglie
  sp.fase = 'eroi'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {};
  statoScortati(g).forEach((png) => { png.mosso = false; });   // possono muoversi nel nuovo turno eroi
  sp.scortAttivo = null;
  if (piano) piano.annunci.push(...ann);
  return ann;
}

// Un singolo colpo differito, risolto durante l'animazione col tiro che arriva
// dal tavolo (o dall'app, se l'interruttore e' acceso). `tot` e' gia' comprensivo
// dell'Attacco: lo compone chi ha chiesto il dado.
export function risolviColpo(g, s, tot) {
  if (s.attaccoPng) {
    colpisciPng(g, s.nome, s.attaccoPng.png, s.attaccoPng.dan, tot, s.attaccoPng.dif);
    return null;
  }
  const a = s.attacco; if (!a) return null;
  const esito = colpisciEroe(g, s.nome, a.vitt, a.dan, tot, a.dif);
  a.tot = esito.tot; a.colpito = esito.colpito;
  return esito;
}
