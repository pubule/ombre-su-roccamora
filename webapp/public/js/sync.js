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

  // STESSO ISTANTE = STESSO STATO, non un conflitto. Da quando la partita vive
  // sul tavolo, lo stato torna dal Durable Object e si salva in locale COL SUO
  // `aggiornato`: le due copie sono la stessa cosa, ma `sincronizzato` e'
  // rimasto indietro e le faceva risultare entrambe «cambiate». Si finiva
  // davanti a «due versioni di questa partita» con due righe identiche, stessa
  // data e stesso secondo, e una delle due da buttare per forza.
  if (localeCambiato && remotoCambiato && locale.aggiornato === remoto.aggiornato) {
    return { azione: 'niente' };
  }
  if (localeCambiato && remotoCambiato) return { azione: 'chiedi', locale, remoto };
  if (remotoCambiato) return { azione: 'scarica' };
  if (localeCambiato) return { azione: 'manda' };
  return { azione: 'niente' };
}

// --- la coda ---------------------------------------------------------------
// Vive in localStorage: se l'app si chiude a meta' serata, alla riapertura
// riparte da dove era. La chiave e' `tavolo/episodio`, quindi accodare due
// volte la stessa partita SOSTITUISCE invece di accumulare — al server
// interessa solo l'ultimo stato, non la storia delle mosse.
const CHIAVE_CODA = 'osr.dasincronizzare';

const leggi = () => {
  try { return JSON.parse(localStorage.getItem(CHIAVE_CODA)) || []; } catch { return []; }
};
const scrivi = (v) => localStorage.setItem(CHIAVE_CODA, JSON.stringify(v));

function accoda(chiave, corpo) {
  const v = leggi().filter((x) => x.chiave !== chiave);
  v.push({ chiave, corpo });
  scrivi(v);
}
function togli(chiave) { scrivi(leggi().filter((x) => x.chiave !== chiave)); }

export const _coda = { leggi, accoda, togli };

let ultimoStato = 'allineato';
export const stato = () => ultimoStato;

// Spedisce quello che c'e'. Non lancia MAI: senza rete la coda resta e si
// riprova dopo — la serata non si ferma per un router.
export async function svuota() {
  for (const { chiave, corpo } of leggi()) {
    try {
      const r = await fetch('/api/salvataggio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      // Access scaduto risponde con un redirect al login: la richiesta finisce
      // altrove e non e' piu' la nostra. La coda NON si tocca: nessuna
      // scrittura si perde, si ricarica e riparte.
      if (r.status === 403 || r.redirected) { ultimoStato = 'sessione scaduta'; return; }
      if (!r.ok) { ultimoStato = 'da mandare'; return; }
      togli(chiave);
    } catch { ultimoStato = 'da mandare'; return; }
  }
  ultimoStato = leggi().length ? 'da mandare' : 'allineato';
}

export function avviaCoda() {
  setInterval(svuota, 3000);
  // L'app che va in secondo piano (o l'iPad che si blocca) manda l'ultimo
  // stato mentre la pagina muore: sendBeacon sa fare solo POST, ed e' il
  // motivo per cui l'endpoint e' POST e non PUT.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    for (const { corpo } of leggi()) {
      navigator.sendBeacon('/api/salvataggio',
        new Blob([JSON.stringify(corpo)], { type: 'application/json' }));
    }
  });
}
