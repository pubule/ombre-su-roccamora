// IL FILO CON IL TAVOLO.
//
// Un WebSocket verso il Durable Object della partita. Si manda un comando, e
// arriva indietro lo stato POTATO PER IL PROPRIO POSTO piu' il copione degli
// eventi da mettere in scena — e arriva anche quando a muovere e' stato
// qualcun altro, che e' il punto di avere un filo invece di una richiesta.
//
// TRE COSE CHE UN FILO DEVE FARE, e che qui ci sono perche' al tavolo si
// perdono davvero:
//
//   - RICOLLEGARSI da solo. Un telefono che entra in tasca chiude il socket;
//     riaprirlo a mano non lo fa nessuno. Si riprova con attese crescenti, e
//     al ritorno si chiede lo stato: la partita e' andata avanti senza di noi.
//   - NON PERDERE I COMANDI. Quel che si manda mentre il filo e' giu' resta in
//     coda e parte al ritorno. Non e' teoria: la mossa la si e' gia' fatta a
//     voce, e il tavolo aspetta che compaia.
//   - DIRE COM'E' MESSO. `onStato(collegato)` serve a mostrarlo: un'app che
//     tace mentre e' scollegata fa credere che il gioco sia rotto.
export function apriCanale({ tavolo, onVista, onRifiuto, onStato }) {
  let ws = null;
  let chiuso = false;
  let tentativi = 0;
  const coda = [];

  const dillo = (collegato) => { try { onStato && onStato(collegato); } catch { /* la vista non ferma il filo */ } };

  function collega() {
    if (chiuso) return;
    const protocollo = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocollo}//${location.host}/api/tavolo/${encodeURIComponent(tavolo)}/ws`);

    ws.onopen = () => {
      tentativi = 0;
      dillo(true);
      // quel che era rimasto in mano mentre il filo era giu'
      while (coda.length) ws.send(JSON.stringify(coda.shift()));
    };

    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.rifiuto) { onRifiuto && onRifiuto(m.rifiuto); return; }
      // stato ed eventi arrivano INSIEME e vanno insieme: gli eventi sono il
      // copione di come si e' arrivati a quello stato, e metterli in scena dopo
      // averlo gia' incassato mostrerebbe la conseguenza prima della causa
      if (m.stato) onVista && onVista(m.stato, m.dati, m.rif, m.eventi || [], m);
    };

    ws.onclose = () => {
      dillo(false);
      if (chiuso) return;
      // attese crescenti, ma con un tetto: un tavolo lasciato aperto tutta la
      // notte non deve martellare, e chi torna dopo un minuto non deve
      // aspettarne dieci
      const attesa = Math.min(1000 * 2 ** tentativi, 15000);
      tentativi += 1;
      setTimeout(collega, attesa);
    };

    ws.onerror = () => { try { ws.close(); } catch { /* ci pensa onclose */ } };
  }

  collega();

  return {
    manda(comando) {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(comando));
      else coda.push(comando);        // parte da sola alla riapertura
    },
    inCoda: () => coda.length,
    collegato: () => !!ws && ws.readyState === WebSocket.OPEN,
    chiudi() { chiuso = true; try { ws && ws.close(); } catch { /* gia' chiusa */ } },
  };
}
