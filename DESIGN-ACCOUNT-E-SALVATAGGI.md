# Account, tavoli e salvataggi sul server

> Spec approvata il 09/08/2026. Sta qui e non in `docs/`, come gli altri
> documenti di progetto del repo (`DESIGN-EPISODIO-*.md`, `AUDIT-*.md`).

## Il problema

Oggi la partita vive in `localStorage`, con chiave `osr.partita.<episodio>`
(vedi `webapp/public/js/store.js`). Da lì discendono quattro guai, tutti reali
e tutti dichiarati dall'autore come da risolvere insieme:

1. **La partita non segue chi gioca.** Cominci sull'iPad, non la ritrovi sul
   telefono.
2. **Due gruppi si sovrascrivono.** La chiave è l'episodio e basta: il Gruppo
   del sabato cancella la serata del Gruppo del giovedì.
3. **Una campagna può sparire.** Venti serate, migliorie e cicatrici stanno in
   un `localStorage` che se ne va svuotando i dati del browser.
4. **Il sito è pubblico.** In `/data` ci sono soluzioni, chiavi e Domande di
   tutti e venti gli episodi: chiunque conosca l'URL li scarica.

## La forma della soluzione

Login Google tramite **Cloudflare Access** (lista di email decisa a mano),
salvataggi su **D1**, e l'app che resta **locale prima di tutto**: si gioca
anche senza rete, il server è la copia che si allinea quando la linea torna.

Il modello di gioco a cui obbedisce: **un dispositivo alla volta**, l'app come
arbitro in mezzo al tavolo, come adesso. Il multi-dispositivo in tempo reale
non è in questa spec, ma il formato dei salvataggi è scelto perché domani non
vada rifatto.

## Architettura

```
Google  ──▶  Cloudflare Access  ──▶  roccamora.smartcores.org
                (lista email)              │
                                           ▼
                                     Worker  ── /api/*  ──▶  D1
                                        │
                                        └── tutto il resto: asset statici
```

**Il Worker** oggi è di soli asset (`wrangler.jsonc`, nessun `main`). Prende un
`main` e serve `/api/*`. Le richieste che corrispondono a un file statico
continuano a non toccare il codice: `/api/` è l'unico percorso senza file
sotto, quindi non serve `run_worker_first`.

**L'hostname si sposta** su `roccamora.smartcores.org` (zona `smartcores.org`,
attiva, piano Free — verificata sull'account il 09/08/2026) e
`ombre-su-roccamora.fabio-stocco85.workers.dev` **si spegne**
(`workers_dev: false`). Non è cosmetica: Access protegge un hostname, e finché
l'indirizzo `workers.dev` risponde, la lista di invitati non protegge niente —
si entra dalla porta di servizio.

**L'identità non si prende per buona.** Il Worker verifica la firma del JWT di
Access (header `Cf-Access-Jwt-Assertion`) contro le chiavi pubbliche del team
(`https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`, dove `<team>` è il
nome scelto per Zero Trust al primo accesso, e va messo in configurazione
insieme all'`aud` dell'applicazione), con Web Crypto e le chiavi in cache. È il confine di fiducia dell'intera faccenda: se lì passa
un'email inventata, uno legge e sovrascrive le partite di un altro.

## Dati

```sql
CREATE TABLE tavoli (
  id            TEXT PRIMARY KEY,   -- crypto.randomUUID() dal client
  proprietario  TEXT NOT NULL,      -- email verificata da Access
  nome          TEXT NOT NULL,      -- "Gruppo del giovedì"
  creato        INTEGER NOT NULL
);
CREATE INDEX idx_tavoli_proprietario ON tavoli(proprietario);

CREATE TABLE salvataggi (
  tavolo        TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  episodio      TEXT NOT NULL,      -- 'preludio', 'ep1' … 'ep20'
  aggiornato    INTEGER NOT NULL,   -- ms, orologio del client che ha salvato
  dati          TEXT NOT NULL,      -- il JSON della partita, identico a oggi
  PRIMARY KEY (tavolo, episodio)
);
```

Il `ON DELETE CASCADE` vale solo con `PRAGMA foreign_keys = ON`, che va
eseguito nella migrazione: senza, cancellare un tavolo lascia i salvataggi
orfani in silenzio. Da verificare con un test, non dando per buono il valore
di default.

`dati` è il blob che `nuovaPartita()` già produce, opaco per il server: le
regole del gioco non entrano nel database. Cambiare la forma della partita non
richiede una migrazione.

Lo **stato di campagna** (Frammenti, Bivi) resta dov'è oggi, dichiarato sulla
partita. Il tavolo sarà la sua casa quando lo si vorrà tracciare davvero: non
in questa spec.

## API

Tutte richiedono un JWT di Access valido; l'email ne esce verificata e non è
mai un parametro. Ogni query filtra per `proprietario = email`: un tavolo di un
altro account non è raggiungibile nemmeno conoscendone l'id.

| Metodo | Percorso | Risposta / effetto |
|---|---|---|
| `GET` | `/api/stato` | `{email, tavoli:[{id,nome,creato}], salvataggi:[{tavolo,episodio,aggiornato}]}` — senza blob: serve a decidere cosa scaricare |
| `GET` | `/api/salvataggio?tavolo=&episodio=` | il JSON della partita |
| `POST` | `/api/salvataggio` | upsert di `{tavolo, episodio, aggiornato, dati}` |
| `POST` | `/api/tavolo` | crea `{id, nome}` |
| `DELETE` | `/api/salvataggio?tavolo=&episodio=` | cancella (l'"abbandona partita" che `main.js` già fa con `cancella()`) |

L'upsert non si fida dell'ordine di arrivo:

```sql
INSERT INTO salvataggi (tavolo, episodio, aggiornato, dati)
VALUES (?, ?, ?, ?)
ON CONFLICT(tavolo, episodio) DO UPDATE
  SET aggiornato = excluded.aggiornato, dati = excluded.dati
  WHERE excluded.aggiornato > salvataggi.aggiornato;
```

Un pacchetto vecchio che arriva in ritardo non può sovrascrivere uno nuovo.

`POST` e non `PUT` per una ragione pratica: quando l'app va in secondo piano o
l'iPad si blocca, `navigator.sendBeacon` spedisce l'ultimo salvataggio mentre
la pagina muore, e sa fare solo POST.

## Sincronizzazione

`salva()` non cambia comportamento: scrive in `localStorage` e ritorna subito.
Nessuna attesa, nessuna rotella, nessuna schermata mentre il tavolo aspetta —
la giocabilità viene prima della sincronia.

- **Coda**, anch'essa in `localStorage` (`osr.dasincronizzare`), così
  sopravvive alla chiusura dell'app. Si svuota ogni ~3 secondi e subito su
  `visibilitychange`/`pagehide`.
- **Chiave locale**: da `osr.partita.<episodio>` a
  `osr.partita.<tavolo>.<episodio>`. È la riga che risolve il guaio n. 2.
- **Ogni salvataggio ricorda l'istante dell'ultima sincronizzazione riuscita**
  (`sincronizzato`). Serve solo a distinguere i due casi qui sotto.

**La regola dei conflitti**, all'apertura di un episodio:

| Situazione | Cosa fa |
|---|---|
| Cambiata solo una parte dall'ultima sincronizzazione | Vince quella, in silenzio. È il caso normale: hai cambiato dispositivo |
| Cambiate entrambe | **Non decide**: mostra le due partite (episodio, ora dell'indagine, round della spedizione, quando) e sceglie l'autore |
| Nessuna delle due | Niente |

Sovrascrivere di nascosto una serata giocata è l'unico esito che il disegno
rende impossibile.

## Schermo

- Prima della home degli episodi: **elenco dei tavoli** (nome, ultima serata) e
  "nuovo tavolo". Dentro un tavolo, tutto come adesso.
- In un angolo: email e **spia dello stato** — allineato / da mandare /
  sessione scaduta.
- **Nessuna schermata di login da costruire**: Access chiede Google prima che
  l'app venga caricata. L'app legge l'email da `/api/stato`.
- **Le partite già sul dispositivo non si migrano** (deciso dall'autore il
  09/08/2026): sono partite di collaudo, non serate vere. Le vecchie chiavi
  `osr.partita.<episodio>` restano dove sono, inerti — il nuovo formato ha un
  tavolo nella chiave e non le incrocia mai. Chi vuole ripartire pulito svuota
  i dati del sito.
- **La modalità tavolo non cambia di una virgola.** La sincronizzazione sta
  sotto `store.js`, dove le due modalità sono già identiche, e nessuna regola di
  gioco la attraversa.

## Quando si rompe

| Guasto | Comportamento |
|---|---|
| Rete assente, o D1 irraggiungibile | Si gioca. Spia gialla, la coda cresce, riparte da sola |
| Sessione Access scaduta a metà serata | Le chiamate tornano con un redirect al login: l'app lo riconosce, dice "sessione scaduta, ricarica" e **tiene la coda**. Nessuna scrittura persa |
| Blob corrotto in arrivo dal server | `JSON.parse` fallisce → si tiene il locale e si segnala, come già fa `carica()` |
| Due tavoli con lo stesso nome | Ammesso: l'identità è l'id, il nome è un'etichetta |

Durata della sessione Access: **un mese**, non le 24 ore di default. Nessuno
deve rifare il login a metà partita.

## Verifica

- **Regola dei conflitti**: logica pura, test con `assert`, provato **non
  vacuo** rompendola nei due versi (vince sempre il locale; vince sempre il
  server). Vedi la disciplina già in uso in `webapp/test-digitale.mjs`.
- **Con Playwright contro `wrangler dev`** (D1 locale vero, `.wrangler/state`,
  produzione mai toccata):
  1. crea tavolo, gioca, ricarica in un contesto browser pulito, ritrova la
     partita;
  2. `setOffline(true)`, gioca mezzo episodio, torna online, il server ha lo
     stato giusto;
  3. due contesti divergenti: compare la scelta, **non** una sovrascrittura;
  4. due tavoli sullo stesso episodio non si toccano (il guaio n. 2, in forma
     di test).
- **Autorizzazione**: chiamata `/api/*` senza JWT valido → 403, e un tavolo di
  un'altra email non è leggibile nemmeno con l'id giusto.

## Rischi

**Il login Google in modalità schermata Home (iOS).** L'app si usa aggiunta
alla Home dell'iPad. In quella modalità iOS può aprire i redirect verso domini
esterni in Safari, e il login Access passa da `accounts.google.com`: se
succede, il cookie di Access finisce in Safari e la webapp a tutto schermo
resta fuori. **Va provato sull'iPad vero prima di dipenderci.** Se il difetto
si presenta, la via d'uscita è fare il primo login in Safari e riaggiungere
l'app alla Home dopo, con sessione di un mese perché non si ripeta.

**Limiti D1, piano gratuito** (verificati il 09/08/2026): 5 GB, 5 milioni di
righe lette al giorno, 100.000 scritte. Una partita è decine di kilobyte: tre
ordini di grandezza di margine. Il debounce di 3 secondi serve comunque, perché
l'app oggi chiama `salva()` a ogni azione.

**D1 sta in un data center solo** (è un Durable Object con dentro SQLite): il
Worker gira vicino a chi gioca, il database no. Irrilevante qui, visto che la
sincronizzazione non è mai sul percorso critico della serata.

## Fuori scopo

Niente più dispositivi sulla stessa partita in tempo reale; niente tavoli
condivisi fra account diversi; niente tabella dello stato di campagna; niente
registrazione (chi entra si decide aggiungendo un'email in Access); niente
migrazione delle partite già in `localStorage`.

> **Superato il 12/08/2026 sui primi due punti.** `DESIGN-VISTA-EROE.md` porta
> più dispositivi sulla stessa partita in tempo reale (Durable Object come
> motore) e i giocatori dentro il tavolo di un altro (tabella `membri`). Quel
> che resta di questa spec — Access, D1, il formato dei salvataggi, `sync.js` —
> non si tocca: `salvataggi` diventa il backup ai checkpoint invece che la
> verità viva.
