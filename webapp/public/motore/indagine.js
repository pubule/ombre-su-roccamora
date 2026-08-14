// LE REGOLE DELL'INDAGINE, pure.
//
// Fino al 14/08/2026 stavano dentro la vista: `js/indagine.js` mutava lo stato
// e lo salvava, e il Durable Object faceva da postino. Il conto e' arrivato
// tutto insieme — quattro difetti in una notte, tutti con lo stesso sintomo
// («premo e non accade niente») e la stessa radice: **il motore era una
// finestra aperta su un PC**, e il gioco dipendeva da dove guardava una
// persona.
//
// Qui e' come per la Spedizione: un comando entra, uno stato nuovo e un copione
// di eventi escono. Chi lo applica — il browser di chi arbitra quando si gioca
// da soli, il Durable Object quando c'e' un tavolo — non cambia le regole.
//
// LA STESSA FORMA DI `azioni.js`: un gestore riceve `(g, caso, comando)` e
// restituisce `{ eventi?, rifiuto? }`. `g` porta i dati dell'episodio e lo
// stato; `caso` porta i dadi, seminati o dichiarati dal tavolo.
//
// COSA NON STA QUI: la prosa. Le frasi che il tavolo legge le compone la vista,
// dai fatti che gli eventi dichiarano — la stessa divisione di `regole.js`
// («dichiaraVoce dice che la pista e' fredda, la frase la sceglie la vista»).
// Un motore che decide le parole non serve a un Durable Object, e in un test si
// deve poter leggere il fatto senza inciampare in una descrizione.
import { bussa, dichiaraVoce, luogoVisitabile, idoneiPerTipo, usaCarica, norm,
         verificaRisposte, tierIndagine } from './regole.js';
import { eroeCresciuto, ha } from './migliorie.js';

const rifiuta = (motivo) => ({ rifiuto: motivo });

// il luogo dell'episodio, per numero
const luogoDi = (g, n) => (g.ep.luoghi || []).find((l) => l.n === n) || null;

// Quante ore costa entrare: fuori citta' ne costa due, e la differenza e' del
// dato, non del codice.
const costoOre = (l) => l.ore || 1;

// Una porta e' aperta se lo era gia', o se la chiave e' stata detta una volta:
// `scoperti` e' la carta girata (anche dopo una bussata sbagliata) e NON basta
// a entrare; `sbloccati` e' la parola detta giusta, e vale per tutta la notte.
const apertoPerNoi = (ind, l) => !!l.aperto || (ind.sbloccati || []).includes(l.n);

// ------------------------------------------------------------- i gestori

// DICHIARARE UNA DESTINAZIONE. E' l'atto che impegna: se la pista e' fredda non
// costa niente, se li' c'e' qualcosa l'ora si spende comunque — anche sbagliando
// la parola alla porta. E' la regola che rende l'orologio una risorsa e non un
// contatore.
function dichiara(g, caso, c) {
  const ind = g.ind;
  const esito = dichiaraVoce(g.ep, g.comune, c.voce);
  if (esito.tipo === 'fredda') return { eventi: [{ tipo: 'pista-fredda', voce: c.voce }] };

  const l = esito.luogo;
  const costo = costoOre(l);
  // NON SONO RIFIUTI: sono SCENE, e il tavolo le legge. Dichiarare era una mossa
  // legale — la risposta e' «non se ne fa niente, e l'ora resta». E' la stessa
  // forma della pista fredda, ed e' la differenza fra un gioco che racconta e
  // un'app che dice di no. (Trasformarle in rifiuti ha fatto cadere quattro
  // giocate del banco: la scena non arrivava piu' a schermo.)
  if (ind.ora >= 24) return { eventi: [{ tipo: 'mezzanotte' }] };
  if (ind.ora + costo > 24) {
    return { eventi: [{ tipo: 'troppo-lontano', luogo: l.n, costo }] };
  }
  if (!luogoVisitabile(l, ind.ora)) {
    return { eventi: [{ tipo: 'gia-chiuso', luogo: l.n,
                        chiude: l.chiude ?? null, apre: l.apre ?? null }] };
  }
  // la porta chiusa non e' un rifiuto: e' l'altra meta' del gioco. Si annuncia,
  // e il comando che segue e' `bussa`.
  if (!apertoPerNoi(ind, l)) return { eventi: [{ tipo: 'porta-chiusa', luogo: l.n }] };
  return entra(g, l, { paga: true });
}

// BUSSARE. Una parola o un oggetto, uno solo, e l'ora si spende comunque:
// giusta si entra, sbagliata si e' visto il volto del luogo e basta.
function bussare(g, caso, c) {
  const ind = g.ind;
  const l = luogoDi(g, c.luogo);
  if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
  if (apertoPerNoi(ind, l)) return rifiuta('Quella porta è già aperta.');
  if (!norm(c.dichiarazione)) return rifiuta('Serve una parola, o il nome di un oggetto.');
  if (ind.ora + costoOre(l) > 24) return rifiuta('Non avete più le ore per arrivarci.');

  ind.ora += costoOre(l);
  if (!ind.scoperti.includes(l.n)) ind.scoperti.push(l.n);   // la carta si gira comunque
  const r = bussa(l, c.dichiarazione);
  if (!r.entra) {
    return { eventi: [{ tipo: 'bussato', luogo: l.n, detto: c.dichiarazione, entra: false }] };
  }
  ind.sbloccati = ind.sbloccati || [];
  if (!ind.sbloccati.includes(l.n)) ind.sbloccati.push(l.n);
  const dentro = entra(g, l, { paga: false });
  return { eventi: [{ tipo: 'bussato', luogo: l.n, detto: c.dichiarazione, entra: true },
                    ...(dentro.eventi || [])] };
}

// IL GRIMALDELLO DI NINO. Apre QUESTA visita e nient'altro: la parola giusta
// resta da scoprire, e il luogo resta chiuso la volta dopo.
function grimaldello(g, caso, c) {
  const ind = g.ind;
  const l = luogoDi(g, c.luogo);
  if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
  if (!g.partita.party.includes('NINO “GRIMALDELLO” CAUTO')) {
    return rifiuta('Nino non è in questa squadra.');
  }
  if (ind.grimaldelloUsato) return rifiuta('Il grimaldello di Nino è già stato usato.');
  if (apertoPerNoi(ind, l)) return rifiuta('Quella porta è già aperta.');
  if (ind.ora + costoOre(l) > 24) return rifiuta('Non avete più le ore per arrivarci.');

  ind.grimaldelloUsato = true;
  ind.ora += costoOre(l);
  if (!ind.scoperti.includes(l.n)) ind.scoperti.push(l.n);
  const dentro = entra(g, l, { paga: false });
  return { eventi: [{ tipo: 'grimaldello', luogo: l.n }, ...(dentro.eventi || [])] };
}

// ENTRARE. Non e' un comando: e' la coda di `dichiara`, `bussa` e `grimaldello`
// — l'ora l'hanno gia' pagata loro, o non si paga affatto.
//
// Entrando NON si tira niente (regola cambiata l'11/08/2026): il dado si tirava
// prima ancora di sapere se al gruppo interessasse frugare. Ora si tira quando
// qualcuno chiede un Approfondimento.
function entra(g, l, { paga }) {
  const ind = g.ind;
  // visita senza ora: il Discernimento di Marani (su QUEL luogo) o le Fonti
  // riservate di Carla (sulla prossima, qualunque). Non conta come ora avanzata.
  const gratis = ind.visitaGratis === l.n || !!ind.fontiRiservateAttive;
  if (ind.visitaGratis === l.n) delete ind.visitaGratis;
  if (ind.fontiRiservateAttive) delete ind.fontiRiservateAttive;
  if (paga && !gratis) ind.ora += costoOre(l);

  const prima = !ind.visitati.includes(l.n);
  if (prima) ind.visitati.push(l.n);
  ind.luogoAperto = l.n;
  // entrare azzera il chiavistello: un fallimento vale per la visita, e uscire
  // e rientrare (un'altra ora) fa ritentare
  delete ind.scenaChiusa;
  return { eventi: [{ tipo: 'entrati', luogo: l.n, prima, gratis }] };
}

function lasciaLuogo(g) {
  const ind = g.ind;
  if (ind.luogoAperto == null) return rifiuta('Non siete dentro nessun luogo.');
  const n = ind.luogoAperto;
  delete ind.luogoAperto;
  delete ind.scenaChiusa;
  return { eventi: [{ tipo: 'usciti', luogo: n }] };
}

// GLI OGGETTI E I REPERTI si raccolgono dentro un luogo: sono del gruppo, e chi
// li registra e' chi conduce.
function prendi(g, caso, c) {
  const ind = g.ind;
  const dove = c.tipo === 'prendi-reperto' ? (ind.reperti = ind.reperti || []) : ind.oggetti;
  if (!c.nome) return rifiuta('Che cosa avete preso?');
  if (dove.includes(c.nome)) return rifiuta(`«${c.nome}» è già fra le vostre cose.`);
  dove.push(c.nome);
  return { eventi: [{ tipo: 'preso', cosa: c.nome, reperto: c.tipo === 'prendi-reperto' }] };
}

// LA LETTERA si legge una volta: da li' in poi si rilegge dal Taccuino.
function letteraLetta(g) {
  g.ind.lettaLettera = true;
  return { eventi: [] };
}

// GLI APPUNTI. Del gruppo (`nota`) o del proprio eroe (`nota-eroe`): il primo lo
// tiene chi conduce, il secondo e' di chi lo scrive — ed e' la cosa piu' utile
// che gli altri leggono fra una porta e l'altra.
function nota(g, caso, c) {
  g.ind.note = String(c.testo || '');
  return { eventi: [] };
}

function notaEroe(g, caso, c) {
  if (!c.eroe) return rifiuta('Di chi sono questi appunti?');
  g.ind.noteEroe = { ...(g.ind.noteEroe || {}), [c.eroe]: String(c.testo || '') };
  return { eventi: [] };
}

// LE RISPOSTE si scrivono e si riscrivono finche' la busta e' chiusa.
function risposte(g, caso, c) {
  if (!Array.isArray(c.risposte)) return rifiuta('Le risposte sono una lista.');
  g.ind.risposte = c.risposte.map((x) => String(x || ''));
  return { eventi: [] };
}

// LA SCHERMATA COMPOSTA DALLA VISTA. Il motore sa COSA il tavolo deve leggere
// (`daLeggere`), non come si scrive: la prosa e le carte sono mestiere della
// vista, e chi ha eseguito il comando le manda qui perche' finiscano su ogni
// schermo. Lo puo' mandare anche un telefono — e' lui che ha appena giocato.
function carta(g, caso, c) {
  g.ind.carta = { titolo: String(c.titolo || ''), corpo: String(c.corpo || '') };
  return { eventi: [] };
}

// LA SCHERMATA CHE IL TAVOLO STA LEGGENDO si chiude, e la chiude chi conduce:
// cosi' nessuno va avanti mentre gli altri leggono.
function cartaVista(g) {
  g.ind.carta = null;
  return { eventi: [] };
}

// ---------------------------------------------------- guardare meglio
//
// IL TIRO VIAGGIA DENTRO IL COMANDO, e questa e' la differenza col giro che
// c'era prima. Fino al 14/08/2026 il telefono CHIEDEVA, chi arbitra eseguiva, la
// prova si sospendeva nello stato, il telefono tirava, l'esito tornava: cinque
// passaggi e tre pezzi di stato, e ognuno un posto dove la serata poteva
// impiantarsi in silenzio. Adesso chi tira e' chi manda, il dado si chiede prima
// di mandare, e il motore riceve il comando gia' completo — come in Spedizione.

// La prova che serve a un comando, perche' la vista possa chiedere il dado PRIMA
// di diramare. E' la stessa regola che il motore applica: si legge da un posto
// solo, e al tavolo un dado tirato non si rimette nel bicchiere.
export function provaDiIndagine(g, comando) {
  // L'ACUME e' quello di STANOTTE, non quello stampato: la Tempra vale «sempre»,
  // e «leggere la scena» e' una prova di ACUME. Letto dritto da `comune.eroi`,
  // un eroe cresciuto tirava in Indagine coi numeri del primo episodio — e
  // nessuno se ne sarebbe accorto, perche' il tiro riesce lo stesso, solo meno
  // spesso.
  const acume = (nm) => (eroeCresciuto(g, nm,
    g.comune.eroi.find((e) => e.nome === nm)) || {}).acume ?? 0;
  const primo = (nm) => String(nm).split(' ')[0].toLowerCase();
  if (comando.tipo === 'approfondisci') {
    return { titolo: `guardare meglio — ${primo(comando.eroe)}`, diffLabel: 'Media',
             soglia: g.comune.regole.diff.Media,
             bonus: [{ label: 'ACUME', val: acume(comando.eroe) }] };
  }
  if (comando.tipo === 'aiuto-profano') {
    return { titolo: `aiuto profano — ${primo(comando.eroe)}`, diffLabel: 'Difficile',
             soglia: g.comune.regole.diff.Difficile,
             bonus: [{ label: 'ACUME', val: acume(comando.eroe) }] };
  }
  return null;
}

const tiraLa = (caso, p) => {
  const t = caso.tira2d6();
  const somma = t.tot + p.bonus.reduce((a, b) => a + b.val, 0);
  return { d: t.d, somma, soglia: p.soglia, bonus: p.bonus, ok: somma >= p.soglia };
};

// La carta che il tavolo legge insieme. La scrive il MOTORE, non la vista: cosi'
// arriva a tutti gli schermi dal filo, sopravvive a un refresh, e si chiude
// quando la chiude chi conduce — nessuno va avanti mentre gli altri leggono.
const daLeggere = (g, titolo, dati) => { g.ind.carta = { titolo, ...dati }; };

function approfondisci(g, caso, c) {
  const ind = g.ind;
  const l = luogoDi(g, c.luogo);
  if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
  if (ind.luogoAperto !== l.n) return rifiuta('Non siete dentro quel luogo.');
  // IL SECONDO FIATO E' UNA REGOLA, non un giro dell'interfaccia. Chi ha appena
  // fallito puo' ritentare UNA volta a episodio, e ritentare vuol dire proprio
  // rifare quel tiro: il chiavistello appena scattato si rialza. Senza questo,
  // il comando del fiato arrivava su uno stato dove `scenaChiusa` era gia' vera
  // e il motore lo rifiutava — la prova migliore che una regola tenuta nella
  // vista, prima o poi, litiga col motore.
  if (c.fiato) {
    g.partita.fiatoUsato = g.partita.fiatoUsato || {};
    if (g.partita.fiatoUsato[c.eroe]) return rifiuta(`${c.eroe} ha già ripreso fiato stanotte.`);
    g.partita.fiatoUsato[c.eroe] = true;
    delete ind.scenaChiusa;
  }
  if (ind.scenaChiusa) {
    return rifiuta('Qui avete già guardato meglio: uscite e tornate, e costa un’ora.');
  }
  if (!c.eroe) return rifiuta('Chi prova a guardare meglio?');
  const idonei = idoneiPerTipo(g.comune, g.partita, c.tipoApp);
  const suo = idonei.find((x) => x.nome === c.eroe);
  if (!suo) return rifiuta(`${c.eroe} non può leggere una ${c.tipoApp}.`);
  const conJolly = suo.proprie <= 0;

  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === c.tipoApp);
  const a = (l.approfondimenti || []).find((x) => x.tipo === c.tipoApp);
  // NIENTE DA COGLIERE: la carica non si spende. L'app e' gentile come un
  // arbitro vero — «non c'e' nulla per te» — e il costo vero era l'ora.
  if (!a || gia) {
    if (conJolly) return { eventi: [{ tipo: 'pendolo', luogo: l.n, chi: c.eroe }] };
    return { eventi: [{ tipo: 'niente-per-te', luogo: l.n, chi: c.eroe, tipoApp: c.tipoApp, gia }] };
  }

  const p = provaDiIndagine(g, c);
  const t = tiraLa(caso, p);
  const eventi = [{ tipo: 'tiro', causa: 'approfondisci', chi: c.eroe, titolo: p.titolo, ...t }];
  if (!t.ok) {
    // la carica NON si spende: si paga l'ora, non la risorsa. Ma qui e' finita
    // per questa visita — si esce e si rientra per ritentare.
    //
    // OCCHIO ESERCITATO, una volta per Indagine: la scena NON si chiude. E' il
    // vero prezzo di un fallimento — la carica gia' non si spendeva, quindi
    // «ripetete la prova» comprava un ritiro di qualcosa che non costava
    // niente. Quel che si perde davvero e' l'ora per uscire e rientrare, ed e'
    // quella che questa miglioria fa risparmiare.
    ind.occhioUsato = ind.occhioUsato || {};
    if (ha(g, c.eroe, 'occhio') && !ind.occhioUsato[c.eroe]) {
      ind.occhioUsato[c.eroe] = true;
      daLeggere(g, 'niente, per ora', { esito: 'fallita', chi: c.eroe, luogo: l.n });
      return { eventi: [...eventi,
        { tipo: 'occhio-esercitato', luogo: l.n, chi: c.eroe }] };
    }
    ind.scenaChiusa = true;
    daLeggere(g, 'niente, per ora', { esito: 'fallita', chi: c.eroe, luogo: l.n });
    return { eventi: [...eventi, { tipo: 'scena-chiusa', luogo: l.n, chi: c.eroe }] };
  }
  usaCarica(g.partita, c.eroe, c.tipoApp, conJolly);
  ind.approfondimentiLetti.push({ n: l.n, tipo: c.tipoApp, soggetto: a.soggetto });
  daLeggere(g, `${String(c.tipoApp).toLowerCase()} — ${String(a.soggetto).toLowerCase()}`,
            { esito: 'colto', chi: c.eroe, luogo: l.n, tipoApp: c.tipoApp, soggetto: a.soggetto });
  return { eventi: [...eventi, { tipo: 'colto', luogo: l.n, chi: c.eroe,
                                 tipoApp: c.tipoApp, soggetto: a.soggetto }] };
}

// L'AIUTO PROFANO: l'occasione UNA di questo luogo, e la tenta chi vuole. Non e'
// un'abilita' di nessuno — e' l'occhio del dilettante, e per questo il bottone
// sta su tutti i telefoni presenti.
function aiutoProfano(g, caso, c) {
  const ind = g.ind;
  const l = luogoDi(g, c.luogo);
  if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
  if (ind.luogoAperto !== l.n) return rifiuta('Non siete dentro quel luogo.');
  ind.profano = ind.profano || {};
  // stessa cosa per l'occhio del dilettante: il Secondo Fiato rifa' il tiro,
  // non consuma una seconda volta l'occasione del luogo
  if (c.fiato) {
    g.partita.fiatoUsato = g.partita.fiatoUsato || {};
    if (g.partita.fiatoUsato[c.eroe]) return rifiuta(`${c.eroe} ha già ripreso fiato stanotte.`);
    g.partita.fiatoUsato[c.eroe] = true;
    delete ind.profano[l.n];
  }
  // NON un rifiuto: una SCENA, come «hanno chiuso» e «e' mezzanotte». Tentare
  // era legale — la risposta e' che qui l'occasione e' gia' passata. (E' la
  // seconda volta stanotte che trasformo una scena in un errore rosso: al
  // tavolo la differenza e' fra un gioco che racconta e un'app che dice di no.)
  if (ind.profano[l.n]) {
    return { eventi: [{ tipo: 'profano-gia-speso', luogo: l.n, tipoApp: c.tipoApp }] };
  }
  if (!c.eroe) return rifiuta('Chi tenta?');
  // IL TIPO LO SCEGLIE IL MOTORE, se non arriva. L'occhio del dilettante non
  // sa cosa cerca — e la vista non deve saperlo per lui: chiedere alla
  // schermata di dire «tenta l'Osservazione» significava dirle prima che qui
  // un'Osservazione c'e'. Si prende il primo tipo non ancora colto in questo
  // luogo; se non ne resta nessuno, il tiro si fa lo stesso e la risposta e'
  // «niente», che e' la scena giusta.
  if (!c.tipoApp) {
    const resta = (l.approfondimenti || []).find((x) =>
      !ind.approfondimentiLetti.some((y) => y.n === l.n && y.tipo === x.tipo));
    c = { ...c, tipoApp: resta ? resta.tipo : 'Osservazione' };
  }

  const p = provaDiIndagine(g, c);
  const t = tiraLa(caso, p);
  ind.profano[l.n] = true;
  const eventi = [{ tipo: 'tiro', causa: 'aiuto-profano', chi: c.eroe, titolo: p.titolo, ...t }];
  if (!t.ok) {
    daLeggere(g, 'aiuto profano', { esito: 'fallita', chi: c.eroe, luogo: l.n, profano: true });
    return { eventi: [...eventi, { tipo: 'profano-fallito', luogo: l.n, chi: c.eroe }] };
  }
  const gia = ind.approfondimentiLetti.some((x) => x.n === l.n && x.tipo === c.tipoApp);
  const a = (l.approfondimenti || []).find((x) => x.tipo === c.tipoApp);
  if (!a || gia) {
    daLeggere(g, 'aiuto profano', { esito: 'niente', chi: c.eroe, luogo: l.n, profano: true, gia });
    return { eventi: [...eventi, { tipo: 'niente-per-te', luogo: l.n, chi: c.eroe,
                                   tipoApp: c.tipoApp, gia, profano: true }] };
  }
  ind.approfondimentiLetti.push({ n: l.n, tipo: c.tipoApp, soggetto: a.soggetto });
  daLeggere(g, `${String(c.tipoApp).toLowerCase()} — ${String(a.soggetto).toLowerCase()}`,
            { esito: 'colto', chi: c.eroe, luogo: l.n, tipoApp: c.tipoApp,
              soggetto: a.soggetto, profano: true });
  return { eventi: [...eventi, { tipo: 'colto', luogo: l.n, chi: c.eroe,
                                 tipoApp: c.tipoApp, soggetto: a.soggetto, profano: true }] };
}

// ------------------------------------------------- le abilita' una-tantum
//
// Quattro doni, uno per eroe, uno per serata. Sono SUE, e da quando i comandi
// arrivano dal telefono di chi gioca e' lui a spenderli — non piu' chi arbitra
// per conto suo. La scelta che chiedono (quale luogo, quale pezzo) viaggia
// DENTRO il comando: una regola che si ferma a meta' per domandare qualcosa non
// si puo' spedire su una rete ne' rigiocare.

// Quel che un luogo nasconde ancora. Serve a tre abilita' su quattro, e sta
// scritto una volta.
const restaDaCogliere = (ind, l) => (l.approfondimenti || []).filter((a) =>
  !ind.approfondimentiLetti.some((y) => y.n === l.n && y.tipo === a.tipo && y.soggetto === a.soggetto));

const perVoce = (g, voce) => (g.ep.luoghi || []).find((l) => norm(l.voce_mappa) === norm(voce));

// Una-tantum: chi la porta, e dove sta scritto che l'ha spesa. Il flag di
// Carbone sta sulla PARTITA e non sull'indagine — e' l'unico, ed e' un dato
// storto che si porta dietro da quando l'esame valeva anche in spedizione.
const UNA_TANTUM = {
  discernimento: { eroe: 'PADRE CELSO MARANI', flag: 'discernimentoUsato' },
  'fonti-riservate': { eroe: 'CARLA DOSTI', flag: 'fontiRiservateUsate' },
  ombra: { eroe: 'MORA “SPILLA” FANTI', flag: 'ombraUsata' },
  'esame-carbone': { eroe: 'FULGENZIO CARBONE', flag: 'carboneUsato', suPartita: true },
};

// Il controllo comune: c'e' quell'eroe, non l'ha gia' speso, e chi manda il
// comando e' lui. Chi arbitra manda senza `eroe` e passa: e' la sua scrivania.
function puoUsare(g, tipo, c = {}) {
  const u = UNA_TANTUM[tipo];
  if (!g.partita.party.includes(u.eroe)) return `${u.eroe} non è in questa squadra.`;
  if (c.eroe && c.eroe !== u.eroe) return `Quel dono è di ${u.eroe}.`;
  const dove = u.suPartita ? g.partita : g.ind;
  if (dove[u.flag]) return 'Quel dono è già stato speso stanotte.';
  return null;
}
const segnaSpesa = (g, tipo) => {
  const u = UNA_TANTUM[tipo];
  if (u.suPartita) g.partita[u.flag] = true; else g.ind[u.flag] = true;
};

// DISCERNIMENTO DI MARANI: indica un luogo, e la risposta e' solo si'/no. Se
// si', quella visita non costa l'ora — cogliere quel che nasconde si tira come
// ovunque.
function discernimento(g, caso, c) {
  const no = puoUsare(g, 'discernimento', c); if (no) return rifiuta(no);
  const l = perVoce(g, c.voce);
  if (!l) return rifiuta('Quel luogo non è sulla mappa.');
  segnaSpesa(g, 'discernimento');
  const ancora = restaDaCogliere(g.ind, l).length > 0;
  if (ancora) g.ind.visitaGratis = l.n;
  return { eventi: [{ tipo: 'discernimento', luogo: l.n, ancora }] };
}

// FONTI RISERVATE DI CARLA: la PROSSIMA visita non costa l'ora — e non conta
// come ora avanzata, che il vantaggio premia le ore spese davvero.
function fontiRiservate(g, caso, c) {
  const no = puoUsare(g, 'fonti-riservate', c); if (no) return rifiuta(no);
  segnaSpesa(g, 'fonti-riservate');
  g.ind.fontiRiservateAttive = true;
  return { eventi: [{ tipo: 'fonti-riservate' }] };
}

// OMBRA DI MORA: il furetto in avanscoperta torna col NUMERO di cose che quel
// luogo nasconde ancora, mai col tipo. Ombra fiuta, non legge.
function ombra(g, caso, c) {
  const no = puoUsare(g, 'ombra', c); if (no) return rifiuta(no);
  const l = perVoce(g, c.voce);
  if (!l) return rifiuta('Quel luogo non è sulla mappa.');
  segnaSpesa(g, 'ombra');
  return { eventi: [{ tipo: 'ombra', luogo: l.n, quanti: restaDaCogliere(g.ind, l).length }] };
}

// L'ESAME DI CARBONE: Fulgenzio guarda un pezzo che avete in mano. Se quel
// pezzo ha una voce d'esame la si legge e l'uso si consuma; se non ce l'ha,
// «non ha segreti per lui» e l'occasione resta — patto gentile, e sta nei dati.
function esameCarbone(g, caso, c) {
  const no = puoUsare(g, 'esame-carbone', c); if (no) return rifiuta(no);
  const inMano = [...(g.ind.oggetti || []),
                  ...(g.ind.reperti || []).map((r) => String(r).replace(/^Reperto [A-Z] [-—] /, ''))];
  if (!c.pezzo || !inMano.some((x) => norm(x) === norm(c.pezzo))) {
    return rifiuta('Quel pezzo non è fra le vostre cose.');
  }
  // `esami_carbone` e' una MAPPA nome->testo, e le chiavi non combaciano parola
  // per parola coi nomi delle carte («CORDA DI VIOLINO» vs «Corda di Violino
  // d'Argento»): si accoppia per contenimento, come faceva la vista.
  const esami = g.ep.esami_carbone || {};
  const chiave = Object.keys(esami).find((k) =>
    norm(c.pezzo).includes(norm(k)) || norm(k).includes(norm(c.pezzo)));
  if (!chiave) return { eventi: [{ tipo: 'esame-muto', pezzo: c.pezzo }] };
  segnaSpesa(g, 'esame-carbone');
  return { eventi: [{ tipo: 'esame', pezzo: c.pezzo, testo: esami[chiave] }] };
}

// IL PENDOLO DI SIBILLA (il jolly): se il luogo non ha piu' niente, il dono non
// si spreca su un buco — legge un Approfondimento QUALSIASI ancora chiuso qui,
// oppure indica un luogo della citta' che ne nasconde uno, senza dire di che
// tipo. La scelta di QUALE luogo indicare e' un dado: passa dal `caso`, cosi'
// la stessa serata si rigioca identica.
function pendolo(g, caso, c) {
  const ind = g.ind;
  const l = luogoDi(g, c.luogo);
  if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
  if (!c.eroe) return rifiuta('Di chi è il pendolo?');
  const qui = restaDaCogliere(ind, l);
  if (qui.length) {
    const a = qui[0];
    usaCarica(g.partita, c.eroe, a.tipo, true);
    ind.approfondimentiLetti.push({ n: l.n, tipo: a.tipo, soggetto: a.soggetto });
    daLeggere(g, `${String(a.tipo).toLowerCase()} — ${String(a.soggetto).toLowerCase()}`,
              { esito: 'colto', chi: c.eroe, luogo: l.n, tipoApp: a.tipo,
                soggetto: a.soggetto, pendolo: true });
    return { eventi: [{ tipo: 'colto', luogo: l.n, chi: c.eroe, tipoApp: a.tipo,
                        soggetto: a.soggetto, pendolo: true }] };
  }
  const altrove = (g.ep.luoghi || []).filter((x) => x.n !== l.n && restaDaCogliere(ind, x).length);
  if (!altrove.length) return { eventi: [{ tipo: 'pendolo-fermo', luogo: l.n }] };
  const scelto = altrove[caso.scegli(altrove.length)];
  usaCarica(g.partita, c.eroe, 'jolly', true);
  return { eventi: [{ tipo: 'pendolo-indica', da: l.n, luogo: scelto.n,
                      voce: scelto.voce_mappa }] };
}

// ------------------------------------------------------------- LA BUSTA
//
// Si apre una volta sola e chiude la notte. Da qui in poi l'Indagine e' storia:
// quel che ne resta e' il VANTAGGIO con cui si entra nella villa, ed e' l'unica
// cosa che l'Indagine consegna alla Spedizione. Per questo il conto lo fa il
// motore e non la vista: un vantaggio calcolato sul browser di chi arbitra
// sarebbe diverso da quello che i telefoni vedono scritto.

// Il peso della notte: tier, dossier, e il Canto con cui si parte. Si richiama
// identico a ogni correzione, e ricalcolarlo TUTTO ogni volta e' voluto — un
// conto incrementale qui e' esattamente il posto dove nascondere un errore.
function pesa(g) {
  const ind = g.ind;
  const corr = ind.correzioni || {};
  const esiti = verificaRisposte(g.ep, ind.risposte).map((e, i) => ({
    ...e, i, ok: (i in corr) ? corr[i] : e.ok,
  }));
  // la CONTRO-BUSTA resta sigillata: non pesa sul tier, o lo Slancio sarebbe
  // irraggiungibile — chiede tutte le risposte esatte, e quella non e' ancora
  // conoscibile. Si apre nell'epilogo di spedizione.
  const inBusta = esiti.filter((e) => !e.dopo_spedizione);
  const t = tierIndagine(g.ep, ind, inBusta.map((e) => e.ok));
  g.partita.vantaggi = { tier: t.tier, dossier: t.dossier, risposte: esiti.map((e) => e.ok) };
  // La penalita' piu' comune («si parte con 1 segnalino Canto in piu'», undici
  // Domande su venti episodi) ha un campo suo: al tavolo la applica chi arbitra,
  // qui non la applicherebbe nessuno e mezza posta dell'Indagine sparirebbe.
  const canto = esiti.reduce((n, e) => n + (e.ok ? 0 : ((e.penalita || {}).canto || 0)), 0);
  g.partita.spedizione = { ...(g.partita.spedizione || {}), canto };
  return canto;
}

function apriBusta(g) {
  if (g.ind.chiusa) return rifiuta('La busta è già aperta.');
  g.ind.chiusa = true;
  g.ind.correzioni = g.ind.correzioni || {};
  const canto = pesa(g);
  return { eventi: [{ tipo: 'busta-aperta', tier: g.partita.vantaggi.tier, canto }] };
}

// L'ULTIMA PAROLA E' DEL GRUPPO. Il giudizio automatico confronta parole, e su
// risposte scritte a mano sbaglia sempre nello stesso verso: boccia chi ha
// indovinato ma e' stato sintetico. Al tavolo corregge chi arbitra; qui
// corregge il gruppo, che la verita' ce l'ha sotto gli occhi.
function correggi(g, caso, c) {
  if (!g.ind.chiusa) return rifiuta('La busta non è ancora aperta.');
  const i = Number(c.i);
  const esiti = verificaRisposte(g.ep, g.ind.risposte);
  if (!Number.isInteger(i) || !esiti[i]) return rifiuta('Quella domanda non esiste.');
  const corr = g.ind.correzioni || (g.ind.correzioni = {});
  const ora = (i in corr) ? corr[i] : esiti[i].ok;
  corr[i] = !ora;
  pesa(g);
  return { eventi: [{ tipo: 'corretta', i, ok: corr[i] }] };
}

export const GESTORI_INDAGINE = {
  'lettera-letta': letteraLetta,
  dichiara,
  bussa: bussare,
  grimaldello,
  visita: (g, caso, c) => {
    // rientrare in un luogo gia' sbloccato: l'ora si paga di nuovo
    const l = luogoDi(g, c.luogo);
    if (!l) return rifiuta('Quel luogo non esiste in questo episodio.');
    if (!apertoPerNoi(g.ind, l)) return rifiuta('Quella porta è ancora chiusa.');
    if (g.ind.ora + costoOre(l) > 24) return rifiuta('Non avete più le ore per arrivarci.');
    return entra(g, l, { paga: true });
  },
  'lascia-luogo': lasciaLuogo,
  'prendi-oggetto': prendi,
  'prendi-reperto': prendi,
  nota,
  'nota-eroe': notaEroe,
  risposte,
  carta,
  'carta-vista': cartaVista,
  'apri-busta': apriBusta,
  correggi,
  approfondisci,
  'aiuto-profano': aiutoProfano,
  pendolo,
  discernimento,
  'fonti-riservate': fontiRiservate,
  ombra,
  'esame-carbone': esameCarbone,
};

// Chi puo' mandare cosa. Quel che tocca il GRUPPO — l'ora, le porte, le cose
// raccolte, le risposte, la busta — lo manda chi arbitra: l'orologio e' la
// risorsa comune, e quattro dita che la spendono senza parlarne e' il modo piu'
// rapido di rovinare l'ansia della notte. Quel che e' del PROPRIO EROE lo manda
// chi lo gioca, e sta nell'altra lista (vuota finche' non arrivano gli
// Approfondimenti e le una-tantum).
export const INDAGINE_DI_ARBITRO = new Set([
  'lettera-letta', 'dichiara', 'bussa', 'grimaldello', 'visita', 'lascia-luogo',
  'prendi-oggetto', 'prendi-reperto', 'nota', 'risposte', 'carta-vista',
  'apri-busta', 'correggi',
]);

// I candidati a un tipo di Approfondimento, esportati perche' la vista deve
// poter dire CHI puo' prima di mandare il comando. E' la stessa regola che il
// motore applica: si legge da un posto solo.
export { idoneiPerTipo, usaCarica };
