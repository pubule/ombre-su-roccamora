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
import * as interazioni from './interazioni.js';
import * as nemici from './nemici.js';
import * as minaccia from './minaccia.js';
import * as obiettivi from './obiettivi.js';
import { chiudiFaseNemici } from './vittoria.js';
import * as vittoria from './vittoria.js';
import { carteDaPescare, pesca, cantoDaCarta, tettoCanto } from './regole.js';
import { GESTORI_INDAGINE } from './indagine.js';

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
  interagisci: (g, c, caso) => interazioni.interagisci(g, caso, c.eroe),
  oggetto: (g, c) => interazioni.usaOggetto(g, c.eroe, c.quale),
  rispondi: (g, c, caso) => azioni.rispondi(g, caso, c.scelta),
  // IL PNG LIBERATO. Il suo movimento e' un turno a se', che si aggiunge a
  // quello degli eroi: non e' l'eroe di nessuno, e lo conduce chi arbitra (il
  // Durable Object lo impone in `COMANDI_DI_ARBITRO`). Passava solo dal client
  // di chi arbitrava, quindi il tavolo non lo vedeva muoversi — lo stesso
  // difetto che aveva la notte.
  'muovi-scortato': (g, c) => {
    const png = (g.sp.scortati || [])[c.png];
    if (!png || !png.liberato) return { rifiuto: 'Quel PNG non è ancora libero.' };
    const out = vittoria.esitoScorta(g, c.png, c.nodo);
    (out.righe || []).forEach((r) => g.sp.log.push(r));
    if (out.esito) {
      g.sp.esito = out.esito;
      return { eventi: [{ tipo: 'fine', esito: out.esito, riga: (out.righe || []).slice(-1)[0] || '' }] };
    }
    return { eventi: [] };
  },
  // LA PESCA DELLA MINACCIA, tutta in un comando.
  //
  // Stava in `digitale.js` e si fermava a ogni carta ad aspettare che qualcuno
  // premesse «continua» (`await messaggioCarta`). Cosi' com'era, la pesca non
  // poteva passare da un tavolo: le carte uscivano dal browser di chi arbitra e
  // sugli altri schermi non arrivava niente. Qui le carte diventano EVENTI —
  // una per carta, in ordine — e la vista le mette in scena a chi guarda.
  //
  // Chi puo' mandarlo e' scritto altrove: `COMANDI_DI_ARBITRO` nel Durable
  // Object. La pesca resta un gesto di chi conduce.
  // UNA CARTA PER VOLTA, e lo stato dice quale e' aperta (`sp.carta`).
  //
  // Prima la pesca si risolveva TUTTA in un comando: il server arrivava in
  // fondo, il client dell'arbitro metteva in scena le carte una per una, e gli
  // altri schermi ricevevano tutto insieme. Tre conseguenze, tutte viste al
  // tavolo: sul telefono compariva solo la prima carta; ricaricando la pagina
  // ci si ritrovava a notte gia' inoltrata mentre l'arbitro leggeva ancora; e
  // non c'era modo di sapere, guardando lo stato, che una carta fosse aperta.
  //
  // Ora ogni carta e' un passo: si pesca, si applica, e si LASCIA APERTA. Chi
  // conduce manda `carta-vista` per passare alla prossima. Cosi' lo stato e'
  // sempre la verita' — chi ricarica ritrova la carta, e chi guarda la vede.
  'fase-minaccia': (g) => {
    const sp = g.sp; const eventi = [];
    // un lancio d'esca lasciato a meta' non deve sopravvivere al turno: la
    // plancia resterebbe accesa sulle caselle sbagliate nel round dopo
    sp.escaModo = null;
    if (sp.fase === 'eroi') { sp.fase = 'nemici'; sp.eroiFatti = []; sp.eroiAttivo = null; sp.azioni = {}; }

    // OBIETTIVO COMPLETATO: non si pesca piu'. La pressione del mazzo (spawn,
    // insidie, crescendo) si ferma appena l'obiettivo e' fatto: resta solo
    // scappare da chi c'e' gia'. Toglie il ritorno sotto pressione infinita.
    if (obiettivi.obiettivoFatto(g)) {
      // LO SI DICE. Il mazzo che smette di pescare e' una regola — la pressione
      // cala dopo il climax — ma a schermo si vedeva solo la notte partire
      // subito dopo il bottone, e sembrava che la pesca fosse saltata per
      // sbaglio. Una riga sola, e la regola si vede invece di essere subita.
      const riga = 'Obiettivo compiuto: il mazzo Minaccia non pesca più. Restano quelli già in campo.';
      if (sp.log[sp.log.length - 1] !== riga) sp.log.push(riga);
      return { eventi: [{ tipo: 'annuncio', testo: riga }] };
    }

    let n = carteDaPescare(g.comune, g.partita.party.length, sp.round, sp.cantoBonus, g.partita.episodio);
    if (sp.diversivoPronto) {
      n = Math.max(0, n - 1); sp.diversivoPronto = false;
      sp.log.push('Diversivo di Fanti: 1 carta Minaccia in meno.');
    }

    sp.minacceDaPescare = n;
    sp.minacceTotali = n;      // per dire «1 di 2» anche alla seconda
    return pescaUna(g);
  },

  // La carta successiva: la manda chi conduce dopo aver letto quella aperta.
  'carta-vista': (g) => {
    g.sp.carta = null;
    return pescaUna(g);
  },

  // La notte, tutta in un comando: piano, risoluzione, coda di fine round e
  // chiusura. Gli eventi sono il copione che la vista anima — e senza vista
  // funziona lo stesso, che e' il punto di questa fase.
  'fase-nemici': (g, c, caso) => {
    const piano = nemici.pianoNemici(g, caso, !!c.differito);
    nemici.fineRoundNemici(g, piano);
    if (!c.differito) {
      const fine = chiudiFaseNemici(g);
      if (fine) {
        g.sp.esito = fine.esito;
        if (fine.riga) g.sp.log.push(fine.riga);
      }
    }
    // `[...piano]` e' un ARRAY: le proprieta' appese al piano (`vite0`,
    // `differito`) non ci salirebbero, e chi anima si ritroverebbe le vite di
    // partenza vuote — cioe' tutti gia' a terra all'inizio dell'animazione.
    return { eventi: [{ tipo: 'turno-nemici', piano: [...piano],
                        vite0: piano.vite0, differito: !!piano.differito,
                        annunci: piano.annunci }] };
  },
};

// PESCA UNA CARTA e la lascia aperta in `sp.carta`, se ne restano da pescare.
// Quando non ne restano piu', `sp.carta` resta nullo e la fase puo' proseguire.
function pescaUna(g) {
  const sp = g.sp; const eventi = [];
  const restano = sp.minacceDaPescare || 0;
  if (restano <= 0) { sp.minacceDaPescare = 0; return { eventi }; }
  const totale = sp.minacceTotali || restano;
  {
      const i = totale - restano;
      const n = totale;
      const carta = pesca(g.partita.rng, sp.mazzo, g.carte, g.partita.episodio, g.ep);
      if (!carta) { sp.minacceDaPescare = 0; return { eventi }; }
      const crescendo = carta.title.startsWith('Crescendo');
      const annunci = [];
      if (crescendo) {
        annunci.push(...cantoDaCarta(g.comune, g.ep, sp));
        annunci.push(...minaccia.destaBossSeSoglia(g));
        // la stessa carta che alza il Canto spinge anche l'orologio dell'episodio
        const oro = obiettivi.specOrologio(g);
        if (annunci.length && oro && oro.da_carta) {
          annunci.push(...obiettivi.avanzaOrologio(g, oro.da_carta, 'carta crescendo'));
        }
        // Crescendo: se il boss e' gia' in gioco recupera 1 ferita — ma NON a 2-3 eroi
        const boss = sp.nemici.find((x) => x.nome === g.ep.soluzione.boss);
        if (boss && /cancellate 1 sua ferita/i.test(carta.rules)) {
          if (g.partita.party.length >= 4) {
            if (boss.ferite > 0) { boss.ferite -= 1; annunci.push(`Il boss recupera 1 ferita (${boss.ferite}/${boss.max}).`); }
          } else annunci.push('A 2–3 eroi il boss non recupera ferite.');
        }
      } else {
        // AL CANTO MASSIMO NON ARRIVANO PIU' RINFORZI: il rituale e' al culmine,
        // il pericolo e' gia' tutto in campo. Senza questo il mazzo schierava
        // truppa dietro il gruppo all'infinito nel finale prolungato — 18 nemici
        // dopo il round 14, misurato sull'Ep.1 — e il finale diventava ingiocabile.
        const cantoMax = sp.canto >= tettoCanto(g.comune, g.ep);
        const eff = carta.rules.split('{divider}').pop();
        const prima = sp.nemici.length;
        if (!cantoMax) {
          minaccia.spawnDaTesto(g, eff, minaccia.tileAffollata(g));
          if (sp.nemici.length > prima) annunci.push('Rinforzi sul campo.');
        } else annunci.push('Il Canto è al culmine: nessun nuovo rinforzo, ma quelli in campo premono.');
      }
      // La carta viaggia INTERA: il telefono di chi gioca non ha i dati
      // dell'episodio (la proiezione glieli pota), quindi non potrebbe
      // ricostruirsela da un titolo.
      // LA CARTA RESTA APERTA NELLO STATO: e' quel che la rende visibile a tutti
      // gli schermi e ritrovabile da chi ricarica. Viaggia INTERA perche' il
      // telefono ha i dati potati dalla proiezione e da un titolo non potrebbe
      // ricostruirsela.
      const aperta = { titolo: `minaccia ${i + 1} di ${n}`, carta, annunci };
      sp.carta = aperta;
      sp.minacceDaPescare = restano - 1;
      eventi.push({ tipo: 'carta', ...aperta });
  }
  return { eventi };
}

// L'INDAGINE HA IL SUO GUSCIO, accanto a questo e non dentro: non ha turni da
// contare ne' un esito che chiude la serata, e infilarla qui avrebbe voluto dire
// due `if` in ogni riga. Condivide quel che conta — la copia, i dadi seminati o
// dichiarati, la forma del rifiuto — perche' quelle tre cose devono comportarsi
// uguali nelle due meta' della serata.
export function applicaIndagine(statoIn, comando, dati) {
  const stato = clona(statoIn);
  const ind = stato.indagine;
  const g = { ep: dati.ep, comune: dati.comune, carte: dati.carte, ind, partita: stato };
  const fallito = (motivo) => ({ stato: statoIn, eventi: [], rifiuto: { motivo } });

  if (ind.chiusa) return fallito('L’indagine è già chiusa.');
  if (comando.eroe && !stato.party.includes(comando.eroe)) {
    return fallito(`${comando.eroe} non è in questa squadra.`);
  }
  const gestore = GESTORI_INDAGINE[comando.tipo];
  if (!gestore) return fallito(`Comando sconosciuto: ${comando.tipo}.`);

  if (!stato.rng) stato.rng = creaRng(comando.seme ?? 1);
  const caso = creaCaso(stato.rng, comando.tiri);

  let out;
  try { out = gestore(g, caso, comando); }
  catch (e) { return fallito(e.message); }
  if (!out || out.rifiuto) return fallito((out && out.rifiuto) || 'Azione non consentita.');

  return { stato, eventi: out.eventi || [], rifiuto: null };
}

export function applica(statoIn, comando, dati) {
  // la serata ha due meta', e ognuna ha il suo vocabolario: si smista qui, una
  // volta, invece di chiederlo a ogni chiamante
  if (statoIn.fase === 'indagine' && !(statoIn.indagine || {}).chiusa) {
    return applicaIndagine(statoIn, comando, dati);
  }
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
