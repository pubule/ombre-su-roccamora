// METTERE LA PARTITA SUL TAVOLO.
//
// Lo fa CHI ARBITRA: da quel momento la partita viva sta nel Durable Object e i
// telefoni possono vederla. Senza questo passo il tavolo resta vuoto — i
// giocatori si collegano a un oggetto che non ha nessuna partita, e sui loro
// schermi non arriva niente: e' un silenzio, non un errore, ed e' il modo
// peggiore di rompersi.
//
// Sta qui e non dentro una delle due viste perche' ora serve a TUTT'E DUE le
// meta' della serata. Fin qui viveva in `digitale.js`, e la conseguenza era che
// durante l'Indagine il tavolo non era mai vivo: ogni dispositivo mutava il
// proprio salvataggio e vinceva chi scriveva per ultimo.
//
// Il filo (`canale.js`) invece resta da ciascuna parte: le due viste hanno due
// mestieri diversi da fare con quel che arriva, e parametrizzare un modulo per
// farglieli fare tutt'e due sarebbe piu' codice, non meno.

/**
 * @param posto   { tavolo, ruolo, eroe } — `null` = si arbitra da soli
 * @param stato   la partita da mettere sul tavolo
 * @returns true se il tavolo l'ha presa; false = si gioca da soli, com'era
 */
export async function mettiSulTavolo(posto, stato) {
  if (!posto || !posto.tavolo || posto.ruolo !== 'arbitro') return false;
  try {
    const r = await fetch(`/api/tavolo/${encodeURIComponent(posto.tavolo)}/apri`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: posto.tavolo, stato }),
    });
    return r.ok;
  } catch {
    // nessun tavolo raggiungibile: si gioca da soli, com'era. La partita non
    // si perde — resta il salvataggio di sempre.
    return false;
  }
}
