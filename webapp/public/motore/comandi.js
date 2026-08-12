// LA PORTA D'INGRESSO DEL MOTORE. Un comando entra, uno stato nuovo e un
// copione di eventi escono. Nient'altro tocca lo stato di spedizione.
//
// Perche' i comandi sono COMPLETI: le regole di digitale.js si fermavano a
// meta' per chiedere («curare chi?», «tira il dado»), e una regola che si
// sospende non si puo' spedire su una rete ne' rigiocare. Qui il client chiede
// PRIMA — i candidati si calcolano dallo stato — e manda un comando che il
// motore esegue fino in fondo.
//
// Le sole scelte che restano davvero in mezzo — quelle che pretendono di vedere
// l'esito prima di scegliere, oggi il solo Colpo da macello di Ottone — passano
// da `stato.pendenza`, che e' UNA e sta scritta nello stato. Chi ricarica la
// pagina se la ritrova; una promise interrotta, no.
//
// TRE GARANZIE, e sono provate in test-motore-comandi.mjs:
//   1. `applica` non muta lo stato che riceve: lavora su una copia.
//   2. un comando illegale e' un `rifiuto` con la ragione in chiaro, non
//      un'eccezione e non un silenzio.
//   3. gli eventi sono serializzabili: passeranno da un WebSocket.
import { creaRng, tira2d6 as tiraSeme, interoFino } from './rng.js';
import * as azioni from './azioni.js';
import * as abilita from './abilita.js';

const clona = (x) => JSON.parse(JSON.stringify(x));

// Il caso della partita. Col seme quando si gioca a schermo; coi numeri
// dichiarati dal tavolo quando i dadi sono di legno. Chi risolve non sa quale
// dei due sta usando, ed e' il punto: la stessa regola serve le due modalita'.
function creaCaso(rng, tiri) {
  let i = 0;
  return {
    tira2d6() {
      if (tiri && i < tiri.length) { const d = tiri[i++]; return { d, tot: d[0] + d[1] }; }
      if (tiri) throw new Error('I tiri dichiarati non bastano per questa azione.');
      return tiraSeme(rng);
    },
    scegli: (n) => interoFino(rng, n),
    usati: () => i,
  };
}

// Un gestore riceve (g, comando, caso) e restituisce
//   { eventi?, azione?, pendenza?, rifiuto? }
// `azione` e' il tipo da segnare sul turno dell'eroe: il gestore dice COSA ha
// fatto, e la contabilita' del turno la fa `applica` una volta sola.
const GESTORI = {
  muovi: (g, c, caso) => azioni.muovi(g, caso, c.eroe, c.nodo, c.rivela),
  cerca: (g, c, caso) => azioni.cercare(g, caso, c.eroe),
  rianima: (g, c) => azioni.rianima(g, c.eroe),
  attacca: (g, c, caso) => azioni.attacca(g, caso, c.eroe, c.bersaglio, false),
  'finisci-eroe': (g, c) => { azioni.finisciEroe(g, c.eroe); return { eventi: [] }; },
  abilita: (g, c) => abilita.usa(g, c.eroe, c.scelta, c.cella),
  rispondi: (g, c, caso) => azioni.rispondi(g, caso, c.scelta),
};

export function applica(statoIn, comando, dati) {
  const stato = clona(statoIn);
  const g = {
    ep: dati.ep, comune: dati.comune, carte: dati.carte,
    sp: stato.spedizione, partita: stato, _layout: null,
  };
  const fallito = (motivo) => ({ stato: statoIn, eventi: [], pendenza: statoIn.spedizione.pendenza || null, rifiuto: { motivo } });

  if (stato.spedizione.esito) return fallito('La spedizione è già chiusa.');

  // La pendenza blocca tutto tranne la risposta di chi deve darla. E' l'unico
  // meccanismo di sospensione del motore, e sostituisce diciannove `await`
  // nascosti nelle catene di promise.
  const pend = stato.spedizione.pendenza;
  if (pend && comando.tipo !== 'rispondi') {
    return fallito(`C'è una scelta in sospeso: ${pend.testo || pend.tipo}.`);
  }
  if (pend && comando.a && comando.a !== pend.a) {
    return fallito(`La scelta in sospeso è di ${pend.a}.`);
  }
  if (comando.eroe && !stato.party.includes(comando.eroe)) {
    return fallito(`${comando.eroe} non è in questa squadra.`);
  }
  const gestore = GESTORI[comando.tipo];
  if (!gestore) return fallito(`Comando sconosciuto: ${comando.tipo}.`);

  if (!stato.rng) stato.rng = creaRng(comando.seme ?? 1);
  const caso = creaCaso(stato.rng, comando.tiri);

  let out;
  try { out = gestore(g, comando, caso); }
  catch (e) { return fallito(e.message); }
  if (!out || out.rifiuto) return fallito((out && out.rifiuto) || 'Azione non consentita.');

  // La contabilita' del turno in un posto solo: prima si applica la regola,
  // poi si segna l'azione — e quello e' anche il momento in cui la partita
  // puo' chiudersi, se l'ultimo eroe arriva alla meta a obiettivo fatto.
  const eventi = out.eventi || [];
  if (out.azione) {
    const fine = azioni.segnaAzione(g, comando.eroe, out.azione);
    if (fine.vinta) {
      stato.spedizione.esito = fine.vinta.esito;
      stato.spedizione.log.push(fine.vinta.riga);
      eventi.push({ tipo: 'fine', esito: fine.vinta.esito, riga: fine.vinta.riga });
    } else if (fine.finito) {
      eventi.push({ tipo: 'eroe-finito', chi: comando.eroe });
    }
  }

  stato.spedizione.pendenza = out.pendenza || null;
  if (out.pendenza) eventi.push({ tipo: 'pendenza', ...out.pendenza });

  return { stato, eventi, pendenza: stato.spedizione.pendenza, rifiuto: null };
}
