// Sincronizzazione dei salvataggi col server: la regola dei conflitti e la
// coda di spedizione. L'app resta LOCALE PRIMA DI TUTTO — si gioca anche senza
// rete, il server e' la copia che si allinea quando la linea torna.

// Cosa fare all'apertura di un episodio, confrontando il salvataggio sul
// dispositivo con quello che dice il server.
//
// `sincronizzato` e' l'istante dell'ultimo allineamento riuscito, e serve a una
// cosa sola: sapere CHI ha giocato da allora. Se e' stato uno solo, vince lui
// in silenzio (e' il caso normale: hai cambiato dispositivo). Se hanno giocato
// entrambi, non si sceglie — decide chi ha giocato. Sovrascrivere di nascosto
// una serata e' l'unico esito che questo file rende impossibile.
export function decidi(locale, remoto) {
  if (!locale && !remoto) return { azione: 'niente' };
  if (!locale) return { azione: 'scarica' };
  if (!remoto) return { azione: 'manda' };

  const base = locale.sincronizzato ?? 0;
  const localeCambiato = locale.aggiornato > base;
  const remotoCambiato = remoto.aggiornato > base;

  if (localeCambiato && remotoCambiato) return { azione: 'chiedi', locale, remoto };
  if (remotoCambiato) return { azione: 'scarica' };
  if (localeCambiato) return { azione: 'manda' };
  return { azione: 'niente' };
}
