// GLI OROLOGI D'EPISODIO: tutto cio' che corre contro il gruppo mentre lavora.
//
// Sono sei meccaniche diverse, ciascuna nata da un episodio che senza di lei
// non funzionava, e tutte guidate dai dati invece che dal codice:
//
//   compiti        cosa c'e' da fare, e quando e' fatto
//   orologio       la traccia che il fascicolo fa segnare (sigillo, arresto,
//                  fuga, demolizione, risveglio) — con il freno e la seconda via
//   rogo           (Ep.13) un doom-clock a round, non agganciato al Canto
//   cancellazione  (Ep.15) il pool dei tell che si svuota da solo
//   ritmo          (Ep.20) il controcanto, che dipende dai Frammenti di venti serate
//   pressione      (Ep.20) cio' che corre contro il controcanto
//   filo perso     (Ep.11) il bersaglio da prendere vivo che invece cade
//
// Ognuna restituisce **gli annunci da mostrare**: non stampa niente e non
// salva niente — il salvataggio lo fa il chiamante, che sa quando la
// transazione e' chiusa. Nell'originale c'erano due `salvaP()` in mezzo alle
// regole, ed erano il motivo per cui non si potevano spedire altrove.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`.
import { adiacGlob, tileDi } from './griglia.js';
import { eroe, saluteMax, primo, specScortati, statoScortati } from './stat.js';
import { tettoCanto } from './regole.js';

// ------------------------------------------------------- compiti d'episodio
export const specCompiti = (g) => (g.ep.compiti || []);
export const statoCompiti = (g) => { g.sp.compiti = g.sp.compiti || {}; return g.sp.compiti; };
export const compitoFatte = (g, id) => statoCompiti(g)[id] || 0;
export const compitiFiniti = (g) => specCompiti(g).every((c) => compitoFatte(g, c.id) >= c.quante);

// OBIETTIVO COMPLETATO: non resta che raggiungere la meta. Da qui il mazzo
// Minaccia non si pesca piu' (crescendo-relief: la pressione cala dopo il
// climax, come in Left 4 Dead/Zombicide; e ogni obiettivo tolto toglie minaccia,
// come in Pandemic). Colpisce la causa misurata dell'Atto I-II: il ritorno sotto
// pressione infinita che decimava il gruppo sfaldato. I nemici GIA' in campo
// premono ancora, e il Canto automatico di fine round continua a salire.
//   scorta:        tutti i PNG liberati (+ uscita aperta, se c'e' un'uscita segreta)
//   compiti:       tutti finiti
// Un episodio senza ne' scorta ne' compiti (raro) non ha «relief»: torna false.
export function obiettivoFatto(g) {
  const sc = specScortati(g); const co = specCompiti(g);
  if (!sc.length && !co.length) return false;
  if (co.length && !compitiFiniti(g)) return false;
  // PNG liberato = obiettivo sostanziale: da qui e' solo estrazione (aprire
  // l'uscita segreta O tornare alla meta). NON si richiede l'uscita gia' aperta:
  // era un circolo vizioso — non aprivano l'uscita perche' sotto pressione, e la
  // pressione non si fermava perche' non aprivano l'uscita (Ep.1 bloccato cosi').
  //
  // Si CONTANO i liberati invece di chiedere `every`: su una lista vuota `every`
  // risponde di sì, e uno stato in cui `scortati` non è ancora stato
  // inizializzato dichiarerebbe l'obiettivo compiuto al primo round. Finché il
  // motore girava solo nel browser non capitava — `migraScortati()` popola la
  // lista all'apertura — ma nel Durable Object arrivano stati che quella
  // funzione non ha mai toccato, e il difetto sarebbe stato silenzioso: niente
  // errore, solo il mazzo Minaccia che non pesca più per tutta la partita.
  if (sc.length && statoScortati(g).filter((x) => x && x.liberato).length < sc.length) return false;
  return true;
}

// il compito a portata dell'eroe: giusta tessera, quante ne restano, e — se il
// dato nomina un arredo — esserne adiacenti
export function compitoDisponibile(g, pos) {
  const sp = g.sp;
  for (const c of specCompiti(g)) {
    // `quante` e' quanti ne SERVONO; `massimo` quanti ne ESISTONO. Coincidono
    // ovunque tranne dove qualcosa li cancella (i tell dell'Ep.15: cinque alla
    // villa, quattro bastano). Senza il margine, una clessidra da 1/round e' un
    // muro: misurato 0/6 con pool 4, 50% senza clessidra.
    if (compitoFatte(g, c.id) >= (c.massimo || c.quante)) continue;
    if (c.ritmo) continue;   // avanza da solo a fine round, non e' un'azione
    if (c.per_round_max && sp.compitiRound && sp.compitiRound.round === sp.round
        && (sp.compitiRound[c.id] || 0) >= c.per_round_max) continue;
    // dipendenza: la Formula si legge solo a movimenti spenti (Ep.6)
    if (c.dopo && compitoFatte(g, c.dopo) < (specCompiti(g).find((x) => x.id === c.dopo) || {}).quante) continue;
    // compito su un NEMICO: agganciare il corriere, prendere vivo il Caposquadra,
    // catturare il Notaio — adiacenza a quella miniatura, non una stanza
    if (c.nemico) {
      const n = sp.nemici.find((x) => x.pos && x.nome === c.nemico && adiacGlob(g, pos, x.pos));
      if (!n) continue;
      // …e dove il fascicolo dice IN QUALE STANZA, quella conta. L'Ep.14 lo
      // scrive due volte: a T4 «il Primo Gatto appare (NON ANCORA
      // INGAGGIABILE)», a T6 «all'Attico, agganciate il Primo Gatto». Senza
      // questo il ramo `nemico` usciva prima del controllo su `tile` piu' sotto,
      // e il Gatto si agganciava dove capitava: 12 vittorie su 20 SENZA MAI
      // salire all'Attico, cioe' saltando la caccia sui tetti che e' l'episodio.
      // L'Ep.12 non porta `tile` apposta: li' il Corriere si intercetta dove
      // lo si trova, e se arriva a T6 e' una sconfitta.
      if (c.tile && c.tile !== pos.t) return { ...c, fuoriPosto: c.tile };
      // «va preso VIVO»: dove il fascicolo lo chiede (Ep.11 «ridotto a 1
      // Ferita», Ep.14 «ridotto all'ultima Ferita TRATTA», Ep.15
      // «ridotto/abbattuto», Ep.19 «si ferma all'ultima Ferita, poi
      // persuasione») il negoziato non si apre finche' il nemico e' in forze.
      // Senza questa guardia bastava un Interagire a salute piena. L'Ep.12
      // NON la vuole: li' il fascicolo dice «agganciarlo prima (adiacenza +
      // Interagire)», ed e' una corsa, non uno scontro.
      // …ma un oggetto puo' anticipare il momento in cui tratta: la Parola dei
      // Tetti dell'Ep.14 fa sedere il Primo Gatto gia' a 2 Ferite («mostrandogli
      // il segno dei Gatti tratta gia' a 2 Ferite e non tenta la fuga finale»),
      // stesso schema di `per_azione.oggetto` per la Macchina Fotografica.
      let soglia = n.max - 1;
      if (c.ridotto_oggetto && (g.partita.indagine.oggetti || [])
          .some((o) => new RegExp(c.ridotto_oggetto, 'i').test(o))) {
        soglia = Math.min(soglia, c.ridotto_con_oggetto || soglia);
      }
      if (c.ridotto && !n.abbattuto && n.ferite < soglia) return { ...c, bloccato: n, soglia };
      return c;
    }
    if (c.tile !== pos.t) continue;
    if (c.cella) {
      const t = tileDi(g, pos.t);
      const a = (t.arredi || []).find((v) => String(v[2]).toUpperCase() === String(c.cella).toUpperCase());
      if (a && !adiacGlob(g, pos, { t: pos.t, x: a[0], y: a[1] }) && !(pos.x === a[0] && pos.y === a[1])) continue;
    }
    return c;
  }
  return null;
}

// ------------------------------------------------------- l'orologio d'episodio
// La traccia che il fascicolo fa segnare all'arbitro — sigillo, arresto, FUGA,
// DEMOLIZIONE, risveglio. Sale di `ogni` a fine round e di `da_carta` per ogni
// carta crescendo; alla soglia l'episodio finisce come dice `esito` ('sconfitta'
// o 'parziale'). Senza questo quei sette episodi non avevano un tempo: si poteva
// girare per sempre.
export const specOrologio = (g) => g.ep.orologio || null;

export function avanzaOrologio(g, quanto, motivo) {
  const o = specOrologio(g); const sp = g.sp; if (!o || sp.esito) return [];
  // IL FRENO. Le Soluzioni non fanno salire queste tracce sempre: «alla fine di
  // ogni round in cui NESSUN eroe e' adiacente al Corriere, +1» (Ep.12), «ogni
  // turno del Muratore in cui NESSUN eroe gli e' adiacente vale +2; inchiodato,
  // attacca voi e non demolisce» (Ep.10). Tenere il nemico a contatto FERMA
  // l'orologio: e' lo scopo di quegli episodi, e senza il freno la traccia si
  // riempiva in sei round e la partita era persa per aritmetica.
  if (o.frena_adiacente) {
    const vicino = sp.nemici.some((n) => n.pos && n.nome === o.frena_adiacente
      && g.partita.party.some((nm) => (sp.vite[nm] ?? 0) > 0 && adiacGlob(g, sp.eroiPos[nm], n.pos)));
    if (vicino) return [`${o.nome}: fermo — ${o.frena_adiacente.toLowerCase()} è inchiodato.`];
  }
  // LA SECONDA VIA. Inchiodare il nemico ferma l'orologio finche' lo tieni a
  // contatto; ABBATTERLO lo ferma per sempre — «abbattere il Muratore ferma del
  // tutto la demolizione: e' la seconda via» (Ep.10). Il digitale conosceva
  // solo il freno, e senza la seconda via l'Ep. 10 era matematicamente perso:
  // si entra nella camera al round 9 e la Demolizione chiude al 12, tre round
  // per un obiettivo da quattordici (N-114, misurato 0 vittorie su 20).
  // «Non c'e' in campo» e' vero anche PRIMA che compaia — il Muratore sta in
  // T6 — e fermerebbe l'orologio dal primo round. Ferma solo chi c'era ed e'
  // stato abbattuto, quindi si segna che e' comparso.
  if (o.ferma_se_abbattuto) {
    const inCampo = sp.nemici.some((n) => n.pos && n.nome === o.ferma_se_abbattuto);
    if (inCampo) sp.orologioVistoBersaglio = true;
    else if (sp.orologioVistoBersaglio) {
      return [`${o.nome}: ferma — ${o.ferma_se_abbattuto.toLowerCase()} è a terra.`];
    }
  }
  // «Ogni turno del MURATORE in cui nessun eroe gli e' adiacente, +2» — e il
  // Muratore sta in T6. La traccia partiva invece dal round 1 e correva per
  // nove round prima che il personaggio esistesse: la stanza si raggiungeva
  // al 9,5 e il muro cadeva al 12. Un orologio legato a qualcuno non gira
  // finche' quel qualcuno non e' in scena (N-114).
  if (o.da_tessera && !sp.rivelate.includes(o.da_tessera)) return [];
  sp.traccia = (sp.traccia || 0) + quanto;
  const ann = [`${o.nome}: ${Math.min(sp.traccia, o.max)}/${o.max}${motivo ? ' — ' + motivo : ''}.`];
  if (sp.traccia >= o.max) {
    sp.esito = o.esito === 'parziale' ? 'parziale' : 'sconfitta';
    ann.push(o.testo || `${o.nome} al massimo: la spedizione è persa.`);
    sp.log.push(ann[ann.length - 1]);
  }
  return ann;
}

// ------------------------------------------------------------- il rogo (Ep.13)
// Un doom-clock a ROUND, non agganciato al Canto — un incendio non si zittisce,
// quindi la Litania (che toglie Canto) non lo ritarda. Il Notaio dà fuoco al
// Molino a cadenza fissa: le tessere si incendiano ai round dichiarati in
// `ep.rogo.scala` ([tessera, round]). Chi vi termina il round subisce `danno`
// (il fuoco che morde). I registri presi mentre il TORCHIO (la tessera-obiettivo)
// brucia escono anneriti = vittoria PARZIALE — a meno che il gruppo porti dall'
// indagine l'oggetto `protetto` (la Cassetta Stagna), che li salva: PIENA comunque.
// È la posta che rende viva la corsa e fa CONTARE l'indagine sull'apertura d'Atto.
export const specRogo = (g) => g.ep.rogo || null;

export const rogoBrucia = (g, tileId) => {
  const r = specRogo(g); if (!r) return false;
  return (r.scala || []).some(([t, quando]) => t === tileId && g.sp.round >= quando);
};

export const haProtezioneRogo = (g) => {
  const r = specRogo(g); if (!r || !r.protetto) return false;
  return (g.partita.indagine.oggetti || []).some((o) => new RegExp(r.protetto, 'i').test(o));
};

export function avanzaRogo(g) {
  const r = specRogo(g); const sp = g.sp; if (!r || sp.esito) return [];
  const ann = []; sp.rogoAcceso = sp.rogoAcceso || {};
  for (const [t, quando] of (r.scala || [])) {
    if (sp.round >= quando && !sp.rogoAcceso[t]) {
      sp.rogoAcceso[t] = true;
      ann.push((r.testo_scatta || 'Il Rogo divampa in {tile}.').replace('{tile}', t));
    }
  }
  if (r.danno) for (const nm of g.partita.party) {
    if ((sp.vite[nm] ?? 0) <= 0) continue;
    const pos = sp.eroiPos[nm];
    if (pos && rogoBrucia(g, pos.t)) {
      const e = eroe(g, nm);
      sp.vite[nm] = Math.max(0, (sp.vite[nm] ?? saluteMax(g, e)) - r.danno);
      ann.push(`${primo(nm)} è tra le fiamme: −${r.danno} (${sp.vite[nm]}).`);
      if (sp.vite[nm] <= 0) ann.push(`${primo(nm)} crolla nel fumo!`);
    }
  }
  return ann;
}

// --------------------------------------------------- la cancellazione (Ep.15)
// La meccanica che da' il nome all'episodio non esisteva in digitale: i tell
// erano quattro Interagire e non spariva niente, quindi la serata era una gara
// col Canto invece che con la squadra che cancella. Il pool si svuota — «da T4
// gli Apparecchiatori cancellano un tell per round finche' il Capo e' in
// piedi» — e questo e' il generico che lo esegue, guidato dai dati.
//   cancellazione: { compito, da_tessera, per_round, finche_compito, testo }
export const specCancellazione = (g) => g.ep.cancellazione || null;

export function avanzaCancellazione(g) {
  const k = specCancellazione(g); const sp = g.sp;
  if (!k || sp.esito) return [];
  if (k.da_tessera && !sp.rivelate.includes(k.da_tessera)) return [];
  // finche' il Capo e' in piedi: il compito che lo prende non e' ancora chiuso
  if (k.finche_compito) {
    const c = specCompiti(g).find((x) => x.id === k.finche_compito);
    if (c && compitoFatte(g, c.id) >= c.quante) return [];
  }
  const st = statoCompiti(g); const avuti = st[k.compito] || 0;
  if (avuti <= 0) return k.esaurito ? [k.esaurito] : [];
  const quanti = Math.min(k.per_round || 1, avuti);
  st[k.compito] = avuti - quanti;
  const spec = specCompiti(g).find((x) => x.id === k.compito);
  return [`${k.testo} (${st[k.compito]}/${spec ? spec.quante : '?'})`];
}

// ------------------------------------------------ il ritmo del controcanto (Ep.20)
// Il finale era due giochi diversi: al tavolo il controcanto e' un ritmo per
// round che dipende dai Frammenti di venti serate e dal coro in campo, qui era
// un compito da 10 con una prova di NERVI per azione, dove i Frammenti non
// pesavano nulla. Ora e' il ritmo stampato:
//
//   righe = base + 1 ogni `per_frammenti` Frammenti conservati e non incrinati
//                + `con_oggetto` se il gruppo ha la Mappa Acustica
//                − 1 per ogni nemico sulla tessera della camera
//   e comunque mai sotto `minimo` (il pavimento: per quanti siano nel coro,
//   una riga la cantate sempre).
//
// Non costa azioni, come al tavolo: gli eroi le spendono a spezzare il coro,
// che e' il punto della scena.
export const specRitmo = (g) => specCompiti(g).find((c) => c.ritmo) || null;

// Quanti Frammenti porta il gruppo. La webapp gioca un episodio per volta e non
// ha lo stato di campagna: il valore si dichiara sulla partita (`frammenti`) e
// altrimenti vale il `default` dei dati. E' l'unico ingresso di campagna del
// finale, e va tenuto esplicito invece di essere dedotto dal tier d'Indagine —
// il tier dice com'e' andata stasera, non come sono andate venti serate.
export const frammentiPortati = (g) => {
  const r = specRitmo(g); const p = g.partita;
  return p.frammenti != null ? p.frammenti : ((r && r.ritmo.frammenti_default) || 0);
};

export function avanzaRitmo(g) {
  const c = specRitmo(g); const sp = g.sp;
  if (!c || sp.esito) return [];
  const r = c.ritmo;
  if (r.tile && !sp.rivelate.includes(r.tile)) return [];      // non si canta prima della camera
  if (compitoFatte(g, c.id) >= c.quante) return [];
  const coro = r.tile ? sp.nemici.filter((n) => n.pos && n.pos.t === r.tile).length : 0;
  const oggetto = r.oggetto
    && ((g.partita.indagine || {}).oggetti || []).some((o) => new RegExp(r.oggetto, 'i').test(o));
  const grezzo = (r.base || 1)
    + (r.per_frammenti ? Math.floor(frammentiPortati(g) / r.per_frammenti) : 0)
    + (oggetto ? (r.con_oggetto || 0) : 0)
    - coro;
  const righe = Math.max(r.minimo != null ? r.minimo : 1, grezzo);
  const st = statoCompiti(g);
  st[c.id] = Math.min(c.quante, (st[c.id] || 0) + righe);
  const ann = [`${r.testo || 'Cantate'} ${righe} ${righe === 1 ? 'riga' : 'righe'}`
    + `${coro ? ` (il coro ne toglie ${coro})` : ''}: ${st[c.id]}/${c.quante}.`];
  if (st[c.id] >= c.quante && c.fatto) ann.push(c.fatto);
  return ann;
}

// ------------------------------------------------ la pressione della camera (Ep.20)
// L'altra meta' del finale stampato. Nella camera il Dormiente si desta a ogni
// round, e il rito accelera il risveglio finche' HA UNA VOCE: M. in piedi con
// la sua, oppure un impiegato del coro che canta al posto suo. Qui c'era solo
// il tick ogni 6 round: senza questa pressione il ritmo del controcanto corre
// senza avversario, e la corsa che regge tutto il finale non esiste.
// «Voce» = un nemico qualunque nella camera: e' cosi' che il digitale
// rappresenta il coro e M., che non ha una miniatura sua.
export function avanzaPressione(g) {
  const p = g.ep.pressione; const sp = g.sp;
  if (!p || sp.esito) return [];
  if (p.tile && !sp.rivelate.includes(p.tile)) return [];
  const tetto = tettoCanto(g.comune, g.ep);
  const ann = [];
  const sale = (quanto, perche) => {
    for (let i = 0; i < quanto && sp.canto < tetto; i += 1) sp.canto += 1;
    if (sp.canto < tetto || quanto) ann.push(`${perche} (Canto ${sp.canto}).`);
  };
  if (p.per_round) sale(p.per_round, p.testo || 'Il Dormiente si desta');
  if (p.rito) {
    // La voce del rito NON e' il coro comprato (N-112). Un impiegato faceva due
    // mestieri opposti sui due contatori — toglieva una riga al controcanto e
    // dava +1 Canto al rito — e siccome sette carte su ventuno lo rimettono
    // dentro, e il ritmo si controlla DOPO la fase Minaccia, la sua presenza
    // era di fatto permanente e valeva l'intera partita. Ora la voce e' M., o
    // la Candidata ancora nelle sue mani: la si toglie salvandola, non
    // abbattendo lui (che e' la tesi della scena, ed e' come N-73 resta chiusa).
    const salva = p.rito.finche_manca_oggetto;
    const voce = !salva
      || !((g.partita.indagine || {}).oggetti || []).some((o) => new RegExp(salva, 'i').test(o));
    if (voce) sale(p.rito.per_round || 1, p.rito.testo || 'Il rito ha una voce');
  }
  // «Le fasi ambientali della camera fanno danno inevitabile a soglie di Canto»
  // e' stampato sul fascicolo e non esisteva qui (N-113): la camera e' il boss
  // dell'episodio e in digitale non faceva un graffio. Inevitabile vuol dire
  // senza prova: non c'e' niente da colpire, e' la stanza.
  if (p.danno) {
    const soglie = Object.keys(p.danno).map(Number).filter((s) => sp.canto >= s);
    const dan = soglie.length ? Math.max(...soglie.map((s) => p.danno[s])) : 0;
    for (const nm of g.partita.party) {
      if (!dan || (sp.vite[nm] ?? 0) <= 0) continue;
      sp.vite[nm] = Math.max(0, sp.vite[nm] - dan);
      ann.push(`La camera respira: ${primo(nm)} −${dan} (${sp.vite[nm]}).`);
      if (sp.vite[nm] <= 0) ann.push(`${primo(nm)} va a terra.`);
    }
  }
  return ann;
}

// ------------------------------------------------------------ il filo perso (Ep.11)
// «Un colpo che lo porterebbe a 0 lo fa CADERE: filo perso — l'Atto III perde
// l'aggancio, la campagna prosegue depotenziata, non e' wipe.» E' stampato, e
// il digitale non lo applicava: se il Caposquadra moriva invece di essere preso
// vivo, il compito diventava impossibile e la partita non finiva piu'. Sul
// pilota, tre partite su venti arrivavano a round 20-23 e morivano in timeout,
// e l'Ep. 11 era l'unico episodio la cui percentuale non fosse credibile
// (N-115). Al tavolo la serata la chiude l'arbitro; qui non la chiudeva nessuno.
export function controllaFiloPerso(g) {
  const sp = g.sp;
  if (sp.esito) return [];
  for (const c of specCompiti(g)) {
    if (!c.perso_se_abbattuto || !c.nemico) continue;
    if (compitoFatte(g, c.id) >= c.quante) continue;        // gia' preso: nessun filo perso
    const inCampo = sp.nemici.some((n) => n.pos && n.nome === c.nemico);
    sp.bersagliVisti = sp.bersagliVisti || {};
    if (inCampo) { sp.bersagliVisti[c.id] = true; continue; }
    if (!sp.bersagliVisti[c.id]) continue;                  // non e' ancora comparso
    sp.esito = c.perso_se_abbattuto.esito || 'parziale';
    const t = c.perso_se_abbattuto.testo || 'Il filo è perso: la spedizione si chiude a metà.';
    sp.log.push(t);
    return [t];
  }
  return [];
}
