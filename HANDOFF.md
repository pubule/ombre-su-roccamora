# Handoff — dove siamo

> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Qui c'è **dove siamo**, cosa
> gira e il prossimo comando; il *cosa fare* di un lavoro in corso sta nel suo
> piano.

**Aggiornato:** 11/08/2026 · ramo `main` · in produzione la versione `dcb58b9e`
su <https://roccamora.smartcores.org>

## Cos'è successo, in ordine

Tre lavori chiusi uno dopo l'altro, tutti online.

**1. Account, tavoli e salvataggi** (spec `DESIGN-ACCOUNT-E-SALVATAGGI.md`).
Il sito è chiuso da Cloudflare Access: si entra con un **codice via email**
(One-time PIN, non Google — la barriera è la lista di indirizzi, e Google
avrebbe richiesto un client OAuth). I salvataggi stanno su D1 per **tavolo**,
si gioca anche senza rete e una coda sincronizza quando torna la linea; se la
stessa partita è andata avanti in due posti l'app non sceglie, mostra le due e
decide chi gioca. Si può creare ed eliminare un tavolo dall'elenco.

**2. Il fascicolo** — lo stile (mockup in `webapp/public/mockups/stile/`, otto
schermate, sono la specifica). Tutto ardesia scura tranne ciò che nella
finzione è carta: lettera d'incarico sulla texture del manuale e scritta a
mano, reperti, carte, stampe dei ritratti, i campi dove scrive il gruppo, le
facce dei dadi. Home come schedario, ore come registro barrato, sigillo di
ceralacca sulla busta della soluzione. **La mappa della plancia è l'eccezione
dichiarata**: turchese «puoi andare», oro «rivela», rosso «nemico» restano
segnali imparati al tavolo.

**3. Si installa come un'applicazione** (piano in
`~/.claude/plans/andiamo-con-il-fascicolo-cheeky-fern.md`). Icona col sigillo,
dodici immagini di avvio, nessuna barra del browser, comportamenti al tocco da
app. **Niente service worker**: serve la rete per aprirla. Lo zoom a pizzico
resta, e lo scorrimento pure — c'è un test che lo misura.

## Come si riprende

```bash
node webapp/server.js                 # l'app in locale, porta 8017
python webapp/export-data.py && node webapp/export-data.js   # dopo modifiche ai dati
python webapp/export-assets.py        # dopo carte/tessere/arte nuove; fa anche le icone
./webapp/deploy.sh                    # pubblica (da Git Bash)
```

Per gli endpoint dei salvataggi servono due `wrangler dev` (l'isolamento fra
account non si prova con un utente solo):

```bash
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
```

**I controlli**, tutti verdi tranne dove detto:

| | cosa guarda |
|---|---|
| `test-stile` | il tema vecchio non sopravvive (ori, pergamena fuori posto, angoli tondi) e ogni testo sta sopra 4.5:1 — 7 schermate, 232 testi |
| `test-nativa` | ogni icona dichiarata **esiste ed è della misura promessa**, e le pagine lunghe **scorrono** |
| `test-conferma` | le domande irreversibili si chiedono dentro il gioco: è l'unico che NON sostituisce `window.confirm` |
| `test-api`, `test-sync`, `test-access`, `test-account-ui` | salvataggi, coda, JWT, tavoli |
| `test-ui`, `test-digitale*`, `test-engine` | il gioco (i banchi di misura del bilanciamento) |

## Quello che resta

1. **Durata sessione Access a 1 month**, sull'applicazione **e sul criterio**
   (quella del criterio prevale). È ancora a 24 ore: ogni browser richiede il
   codice ogni giorno. È l'unica cosa che pesa davvero, e si fa in un minuto.
2. **`test-engine`: 536 controlli falliti**, e non è una regressione — sono
   **buchi di contenuto** che erano nascosti. Il test salta un episodio quando
   la sua cartella esportata non esiste: creandola, l'export ha smesso di
   saltare. Mancano ~52 arti di luogo e le carte che le usano.
3. **Tessere di Spedizione**: ci sono per Ep. 1, 2 e 10-15. Mancano a
   **Preludio, Ep. 3-9 ed Ep. 16-20** — sulla plancia a schermo quelle caselle
   restano vuote.
4. Da provare quando capita: una **serata vera**, e la partita **ripresa da un
   altro dispositivo**.

## Cose sapute che il codice non dice

- **`test-engine` misura l'EXPORT, non il repo**, ma scrive «jpg mancante».
  Sono due cose diverse — «non è stata fatta» contro «non è stata copiata nel
  web» — e la confusione mi ha fatto proporre un lavoro già fatto: di 16 carte
  «mancanti» solo 4 lo erano davvero, le altre 12 volevano solo l'export.
- **Le icone dell'app sono derivate e gitignorate**: chi pubblica senza aver
  lanciato `export-assets.py` manda online un manifest che punta a file
  inesistenti. `test-nativa` lo prende.
- **`OSR_DEV_EMAIL` non deve mai entrare in `wrangler.jsonc`**: salta la
  verifica del token. Esiste solo come `--var` di `wrangler dev`, e c'è un test
  che controlla che non sia finito in configurazione.
- **`chiedi.js` obbedisce a un `window.confirm` sostituito.** Serve ai banchi
  headless, che altrimenti resterebbero appesi a un bottone che non sanno di
  dover premere — ed è il motivo per cui `test-conferma` esiste: senza, la
  finestra del gioco potrebbe non comparire a nessuno e i banchi resterebbero
  tutti verdi.
- **`compatibility_date` sta a `2026-08-08`**: il workerd di wrangler 4.120.0
  non conosce date più recenti e `wrangler dev` non parte.
- **Il ricaricamento a caldo di `wrangler dev` non è istantaneo**: provando un
  guasto deliberato, il test parte contro il codice vecchio e sembra vacuo un
  test buono. Aspettare che il comportamento cambi, non che il server risponda.
- **Il deploy può fallire con `ECONNRESET` a metà upload** senza che nulla sia
  rotto: è la rete (sospetto la VPN). Si rilancia e basta. Con molti file nuovi
  l'upload arriva a dieci minuti.
- Database D1: `ombre-salvataggi`, id `b0a85d9c-e7a6-4c3b-8940-1a50ad87fee2`.
  Access: team `smartcores`, destinazioni Worker + nome host pubblico.
