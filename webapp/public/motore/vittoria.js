// COME FINISCE UNA SERATA: chi vince, chi perde, chi arriva secondo.
//
// Sono poche righe e decidono tutto, quindi la differenza rispetto a
// digitale.js e' netta: qui si DICE come e' finita, non si disegna l'epilogo.
// Prima `controllaVittoria` chiudeva con `salvaP(); epilogo(); return true` e
// `muoviScortato` con `return epilogo()` — cioe' la regola sapeva che esiste
// uno schermo. Ora restituiscono `{ esito, righe }` e chi ha lo schermo decide
// cosa farne; chi non ce l'ha (un Durable Object) puo' usarle lo stesso.
//
// Contesto esplicito `g = { ep, comune, sp, partita }`.
import { specCompiti, compitiFiniti, specRogo } from './obiettivi.js';
import { specScort, primo } from './stat.js';
import { layout } from './griglia.js';

// «QUI L'USCITA NON BASTA» (Ep.4, T5): dove l'episodio ha ANCHE dei compiti, la
// scorta portata in salvo non chiude da sola. Il fascicolo lo dice due volte —
// «la spedizione e' VINTA solo se i TRE pannelli della Conchiglia sono gia'
// disaccordati. Se non lo sono, chi imbocca il vano si mette al sicuro (esce
// dal tabellone e non puo' piu' essere colpito) MA LA PARTITA CONTINUA». Prima
// il gruppo scappava e l'app dichiarava vittoria: meta' dell'obiettivo stampato
// non esisteva nei dati. Inerte negli altri episodi-scorta, che di compiti non
// ne hanno.
export function scortaPuoVincere(g) {
  return !specCompiti(g).length || compitiFiniti(g);
}

// L'obiettivo d'episodio e' compiuto? Restituisce { esito, riga } oppure null.
// NON tocca sp.esito: chi chiama decide se e quando chiudere la partita.
export function controllaVittoria(g) {
  const sp = g.sp; const v = g.ep.vittoria;
  if (sp.esito || !v || !specCompiti(g).length || !compitiFiniti(g)) return null;
  const vivi = g.partita.party.filter((nm) => (sp.vite[nm] ?? 0) > 0);
  if (v.tessera && !vivi.every((nm) => sp.eroiPos[nm] && sp.eroiPos[nm].t === v.tessera)) return null;
  // un boss gia' a terra in attesa d'essere preso non sbarra piu' la vittoria
  if (v.boss && sp.nemici.some((n) => n.nome === g.ep.soluzione.boss && n.pos && !n.abbattuto)) return null;
  // due modi di arrivare secondi: il ROGO (snapshot all'atto della presa) e
  // l'orologio dell'episodio superato (soglia-decano, soglia-arresto, sigillo)
  const declassa = !!sp.registriAnneriti || !!sp.declassato;
  const riga = sp.registriAnneriti
    ? ((specRogo(g) || {}).testo_parziale || 'I registri escono anneriti dal rogo: vittoria parziale.')
    : declassa
      ? `${sp.declassato} L’obiettivo è compiuto lo stesso: vittoria parziale.`
      : (v.testo || 'L’obiettivo è compiuto: siete salvi.');
  return { esito: declassa ? 'parziale' : 'vittoria', riga };
}

// PNG scortato mosso dal giocatore (Mov 3, non agisce): sulla tessera-meta e'
// vittoria — ma solo quando TUTTI i PNG dell'episodio ci sono arrivati (Ep.4
// ne ha due, Gaspare e Rocco: vanno portati fuori entrambi).
//
// Restituisce { esito?, righe[] }: `esito` c'e' solo se la partita si chiude
// qui. Muove il PNG — quello e' stato, non presentazione.
export function esitoScorta(g, i, node) {
  const sp = g.sp; const png = sp.scortati[i]; const s = specScort(g, i);
  const righe = [];
  png.pos = node; png.mosso = true; sp.scortAttivo = null;
  righe.push(`${s.nome} avanza in ${node.t}.`);

  // vittoria alternativa: l'uscita segreta aperta nella tessera della prigionia
  const u = sp.uscita;
  if (u && u.aperta && node.t === u.tile && node.x === u.cella[0] && node.y === u.cella[1]) {
    png.uscito = true; png.pos = null;         // sparisce dal board: libera il chiusino per l'altro
    // anche dal condotto devono passare TUTTI: con due prigionieri (Ep.4) il
    // primo che ci mette il piede non chiude la partita da solo
    if (sp.scortati.every((x) => x.uscito) && scortaPuoVincere(g)) {
      return { esito: sp.declassato ? 'parziale' : 'vittoria',
               righe: [...righe, s.vittoria || `${s.nome} è fuori: siete salvi.`] };
    }
    righe.push(sp.scortati.every((x) => x.uscito)
      ? `${s.nome} e' al sicuro, ma il lavoro non e' finito: ${specCompiti(g)[0].etichetta.toLowerCase()}.`
      : `${s.nome} sparisce nel passaggio: manca ancora qualcuno.`);
    return { righe };
  }

  // chi e' gia' passato dal condotto conta come arrivato: i due dell'Ep.4
  // possono uscire uno per la via segreta e uno dalla porta d'ingresso
  const arrivati = sp.scortati.every((x, k) => x.uscito || (x.liberato && x.pos && x.pos.t === specScort(g, k).meta));
  if (node.t === s.meta && arrivati && scortaPuoVincere(g)) {
    return { esito: sp.declassato ? 'parziale' : 'vittoria',
             righe: [...righe, s.vittoria || `${s.nome} è al sicuro: siete salvi.`] };
  }
  return { righe };
}

// Chiusura della fase nemici: party-wipe e vittoria. Vive a parte perche' scatta
// in due momenti diversi — a schermo appena il piano e' pronto (i tiri li ha gia'
// fatti l'app), al tavolo solo dopo che il tavolo ha tirato per ogni nemico.
// La vittoria si valuta anche a FINE ROUND, non solo dopo un'azione: se l'ultimo
// eroe vivo raggiunge la tessera-meta e poi nessuno agisce piu', `segnaAzione`
// non la ricontrollerebbe mai e la partita resterebbe aperta a obiettivo fatto.
export function chiudiFaseNemici(g) {
  const sp = g.sp;
  if (sp.esito) return null;
  if (g.partita.party.every((nm) => (sp.vite[nm] ?? 0) <= 0)) {
    return { esito: 'sconfitta', riga: null };
  }
  return controllaVittoria(g);
}

// eroe piu' avanzato = sulla tessera rivelata piu' lontana da T1 (origine layout)
export function eroePiuAvanzato(g, vivi) {
  const lay = layout(g); let best = vivi[0], bd = -1;
  for (const nm of vivi) {
    const [x, y] = lay[g.sp.eroiPos[nm].t] || [0, 0];
    const d = Math.abs(x) + Math.abs(y);
    if (d > bd) { bd = d; best = nm; }
  }
  return best;
}
