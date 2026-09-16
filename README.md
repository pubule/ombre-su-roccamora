# Ombre su Roccamora

Gioco da tavolo investigativo **cooperativo a puntate** per 2–10 giocatori, ambientato
in una città immaginaria di canali e campanili nel 1889. Unisce indagine alla
*Sherlock/Cluedo* e spedizioni alla *HeroQuest*, senza master e senza uno-contro-tutti.

La campagna è di **21 serate**: il Preludio tutorial «La Prova del Lume» e venti
episodi, dal *Caso del campanaro scomparso* al *Quarto Movimento*. Si gioca con il
materiale stampato di questo repo, con la web-app come arbitro al tavolo, o con
tutti e due insieme — è il modo per cui il gioco è scritto oggi.

- **Materiale da stampare:** `Comune/`, `Preludio/`, `Episodio 1/` … `Episodio 20/`
- **Web-app:** in locale con `node webapp/server.js`, online su
  <https://roccamora.smartcores.org> (accesso su invito)
- **Per generare nuovo materiale con un assistente AI:** `PROMPT-ESPANSIONE.md`

## Come si gioca (in breve)

Ogni episodio è una serata in due metà. Prima l'**Indagine**: sei ore di tempo in
gioco, luoghi che si sbloccano dicendo le parole chiave giuste, carte Approfondimento,
Testimoni, Referti e reperti da leggere, e quattro Domande finali da dedurre insieme.
Poi la **Spedizione** su tessere, con il mazzo Minaccia che fa da avversario
automatico. Le risposte esatte dell'Indagine diventano vantaggi concreti nella
Spedizione. Fra un episodio e l'altro restano migliorie, cicatrici, Bivi e Frammenti
di mistero: è una campagna, non una serie di partite slegate.

Le due metà sono indipendenti: si può giocare la sola Spedizione dichiarando a mano
l'esito che l'Indagine avrebbe prodotto.

## Com'è organizzato il repo

| cartella | cosa contiene |
| --- | --- |
| `Comune/` | quello che si stampa **una volta per tutta la campagna** |
| `Preludio/` | il mini-episodio tutorial (~60-90 min) |
| `Episodio 1/` … `Episodio 20/` | un episodio per cartella, tutti con la stessa forma |
| `artworks/` | arte sorgente (dipinti, ritratti, dorsi, tessere, mappa) |
| `src/` | generatori dei PDF (Python + reportlab) |
| `scripts/` | generatori di carte, tessere e reperti (Node + Playwright), audit, simulatori |
| `webapp/` | la web-app da iPad/telefono e il suo motore di regole |
| `deploy/` | pubblicazione su Cloudflare (Worker, schema D1, migrazioni) |
| `vendor/cardconjurer/` | copia locale statica di Card Conjurer |
| `fonts/` | font liberi, scaricati da `./fetch_fonts.sh` (non versionati) |

**La regola che governa tutto il materiale:** ciò che vale per ogni episodio sta in
`Comune/`, il resto nella cartella del proprio episodio — mai al livello comune, per
non lasciare dubbi su cosa appartenga a quale storia. Chi ha già stampato il Comune
non lo ristampa quando arriva un episodio nuovo.

### Cosa c'è in `Comune/`

- `pdf/Ombre-su-Roccamora-01-Regolamento.pdf` — regole complete, con l'Aiuto di gioco
  (il riepilogo da tavolo su una pagina) accodato nello stesso fascicolo
- `pdf/Ombre-su-Roccamora-02-Schede-Personaggio.pdf` — gli 11 eroi della Società del Lume
- `pdf/Ombre-su-Roccamora-07-Tabellone.pdf` — overlay scuro riusabile in ogni episodio:
  non contiene le tessere (si posano libere, la mappa cambia episodio per episodio),
  solo gli slot per la traccia del Canto e il mazzo Minaccia + scarti
- `pdf/Ombre-su-Roccamora-08-Taccuino-di-Campagna.pdf` — il registro che sopravvive alla
  serata (Frammenti e Bivi): si stampa una volta per tutta la campagna
- `cards/Eroi/` — per la scelta del personaggio a inizio serata (i dettagli stanno sulla Scheda)
- `cards/Nemici/`, `cards/Minacce/` — solo la Malavita (Sgherro, Sicario): nemici
  secolari dichiaratamente riusabili in ogni episodio

### Cosa c'è in un episodio

Preludio ed episodi hanno la stessa forma, così chi ha giocato una serata sa già dove
guardare nella successiva:

```
Episodio 1/
├── pdf/
│   ├── Copertina.pdf              poster dell'episodio (mappa della città, titolo)
│   ├── Indagine.pdf               lettera d'incarico e taccuino
│   ├── Mappa.pdf                  stradario incrementale delle destinazioni
│   ├── Luoghi.pdf                 per chi arbitra: una pagina per luogo/tessera
│   ├── Spedizione.pdf             note per tessera, miniature quadrate, Registro delle Ferite
│   ├── Bestiario.pdf              bio dei nemici + Ferite tabellate per numero di eroi
│   └── Soluzione (non aprire).pdf da stampare SENZA LEGGERE e sigillare in busta
├── cards/                         Luoghi, Indizi Nascosti, Testimoni, Referti, Oggetti,
│                                  Nemici del culto e Minacce di questo episodio
├── board/                         le tessere della Spedizione (T1-T6), griglia + arredi + porte
└── reperti/                       diario, registro, atti d'archivio: documenti da consegnare
                                   durante l'indagine, composti su un'unica foto di pergamena
```

Due cose che non si leggono dalla struttura:

- **`Luoghi.pdf` è il fascicolo di chi arbitra**: descrizione estesa e sensoriale della
  scena (da leggere o improvvisare a voce) e quale carta Approfondimento/Oggetto dare.
  Le carte non lo dicono da sole, per non far barare i giocatori e per restare riusabili.
- **I fascicoli ci sono per tutti e 21 i buckets; carte e tessere arrivano man mano che
  l'arte viene generata.** I generatori saltano con un avviso ciò che non ha ancora il
  suo artwork in `artworks/`, e non producono carte vuote.

Il Preludio riusa tre tessere dell'Episodio 1 (T1/T2/T4) solo perché è stato scritto
così, non perché siano un prop condiviso: per giocarlo serve quindi anche il foglio
carte/tessere dell'Episodio 1, non il solo Comune + Preludio.

I prompt dell'arte comune (eroi, cornici, dorsi, tessere, mappe) stanno in
`PROMPT-MIDJOURNEY.md`; i soggetti di ogni serata in
`<bucket>/PROMPT-MIDJOURNEY-<bucket>.md`.

## Rigenerare il materiale

Una volta sola, come preparazione:

```bash
pip install reportlab pypdf
npm install          # playwright
./fetch_fonts.sh     # Old Standard TT, IM Fell English SC, La Belle Aurore -> fonts/
```

Poi, per rifare tutto nell'ordine corretto:

```bash
./build-all.sh                    # tessere, carte, fogli fronte/retro, reperti, tutti i PDF,
                                  # e infine la stampa completa unita
./build-all.sh --solo-mancanti    # rigenera solo gli artefatti che ancora non esistono
```

Le sezioni che seguono servono a rigenerare **solo una parte** — per esempio dopo aver
corretto un testo — senza rilanciare tutto il resto.

### Solo i PDF

I sorgenti Python stanno in `src/` e vanno lanciati da lì. Sono di quattro famiglie:

```bash
cd src
python gen_docs.py             # Regolamento (+ Aiuto di gioco) e Soluzione dell'Episodio 1
python gen_deluxe.py           # Schede Personaggio
python gen_board.py            # Tabellone riusabile
python gen_taccuino_campagna.py # Taccuino di Campagna
```

```bash
python gen_preludio.py         # il Preludio completo
python gen_ep2.py              # un episodio: indagine, spedizione, soluzione, bestiario
                               # (gen_ep2.py … gen_ep20.py, uno per episodio)
```

```bash
python gen_gothic.py           # indagine + spedizione dell'Episodio 1
python gen_narrator.py         # il fascicolo Luoghi dell'Episodio 1
```

```bash
python gen_cover.py            # le copertine di tutti i buckets
python gen_bestiario.py        # i bestiari di tutti i buckets
python gen_mappa.py            # le mappe di tutti i buckets
```

### Solo le carte

Da lanciare dalla **radice del repo**, mai da dentro `scripts/cardconjurer/`: il campo
`card.art` (es. `'artworks/Elena.png'`) è risolto relativo alla cwd.

```bash
node scripts/cardconjurer/generate-batch.js            # tutte
node scripts/cardconjurer/generate-batch.js luoghi     # un gruppo solo
        # heroes|nemici|minacce|luoghi|indizi|testimoni|referti|oggetti|preludio|ep2|all
node scripts/cardconjurer/generate-test.js "Elena Fosco" "Il Fonditore"   # per titolo
node scripts/cardconjurer/generate-print-sheets.js     # i fogli fronte/retro da stampare
```

`generate-print-sheets.js` produce **un foglio per bucket**, non uno solo:
`Comune/pdf/Carte.pdf` (Eroi + Malavita), `Preludio/pdf/Carte.pdf`,
`Episodio 1/pdf/Carte-e-Tessere.pdf` (carte dell'episodio + le sue tessere), e così via.
Il bucket di ogni carta si legge dal suo campo `file` in `cards-data.js`
(`Episodio 1/…`, `Preludio/…`, o nessuno dei due = Comune). Un episodio nuovo eredita
Eroi e Malavita gratis: basta che le sue carte abbiano un `file` che inizia per
`Episodio N/`, nessuna modifica allo script.

### Solo tessere e reperti

```bash
node scripts/tiles/generate-tiles.js ep1        # le tessere di un episodio -> Episodio N/board/
node scripts/reperti/generate-reperti.js        # i reperti di tutti i buckets -> <bucket>/reperti/
```

Le carte e le tessere si generano contro `vendor/cardconjurer/`, una copia locale statica
di [Card Conjurer](https://cardconjurer.app/) (open source, GPLv3): niente dipendenza da
un sito di terzi — l'originale (cardconjurer.com) è già stato chiuso una volta dopo una
diffida, vedi `vendor/cardconjurer/README.txt`.

### La stampa completa, un PDF per bucket

```bash
python scripts/merge-print-all.py
```

Unisce i fascicoli già in `<bucket>/pdf/` con i fogli carte/tessere, **per bucket**, in
`<bucket>/Ombre-su-Roccamora-<bucket>-Completo.pdf`. Ogni file esce a pagine pari
(aggiunge da solo una pergamena di chiusura dove serve, anche ai poster e alle schede
singole) così la stampa fronte/retro resta allineata dall'inizio alla fine.

Non genera nulla da zero: prima si rilanciano i passi qui sopra. I file sono pesanti
(40+MB l'uno, immagini a piena risoluzione): è normale per PDF di stampa, non un errore.
Non sono committati, vanno rigenerati in locale. Un episodio nuovo aggiunge solo una
voce a `BUCKETS` in `scripts/merge-print-all.py`.

## La web-app

L'app fa da **arbitro al tavolo**: custodisce chiavi e segreti, tira gli orologi, pesca
le Minacce, legge gli esiti di Cercare e tiene la plancia della Spedizione a schermo —
nessuno al tavolo sa più niente in anticipo. Si gioca con il materiale fisico stampato
davanti; l'unica scelta all'avvio è se giocare l'episodio intero o la sola Spedizione.
Nessuna dipendenza oltre a Node e Pillow, già usati dal resto del repo.

### In locale

```bash
# 1. esporta dati e immagini (solo dopo modifiche a carte o PDF)
python webapp/export-data.py     # luoghi, tessere, nemici, soluzioni -> webapp/data/*.json
node   webapp/export-data.js     # carte (testi + percorsi immagine)  -> webapp/data/carte.json
python webapp/export-assets.py   # copie web ridotte di carte/tessere/arte -> webapp/assets/

# 2. avvia il server (resta acceso finché si gioca)
node webapp/server.js            # porta 8017; oppure: node webapp/server.js 8080
```

All'avvio stampa l'URL di rete locale (es. `http://192.168.1.x:8017`): si apre dal
browser dell'iPad o del telefono **sulla stessa rete Wi-Fi**. Lo schermo non si spegne
durante la partita (wake-lock). Qui i salvataggi sono sul dispositivo (una partita in
corso per episodio, si riprende da dove si era rimasti) e il server serve solo file
statici, senza accessi esterni.

**Si installa come un'applicazione**, su iPad («Condividi → Aggiungi alla schermata
Home») e su PC (menu di Chrome → «Installa»): icona col sigillo della Società, avvio
senza lampo bianco, nessuna barra del browser. Icone e immagini di avvio le genera
`webapp/export-assets.py` dal Sigillo in `artworks/` — sono derivate come il resto di
`webapp/assets/`, quindi chi pubblica senza aver lanciato l'export si ritrova un
manifest che punta a file inesistenti. `node webapp/test-nativa.mjs` lo verifica, e
verifica anche che le pagine lunghe continuino a scorrere.

### Online (Cloudflare)

La stessa app sta anche su Cloudflare, così il PC non deve restare acceso:
<https://roccamora.smartcores.org>. Siccome `webapp/data/`, `webapp/assets/` e `fonts/`
sono derivati (in `.gitignore`), la pubblicazione parte sempre dal punto 1 qui sopra:
si rigenera, poi

```bash
./deploy/deploy.sh
```

che fa tre cose **in quest'ordine**, e l'ordine è la sostanza: assembla `webapp/dist`,
porta il database di produzione allo schema, pubblica il Worker. Lo schema prima del
codice, perché `wrangler deploy` non tocca il database e una tabella mancante manda
l'app in 500 a deploy «riuscito». Dettagli in `deploy/README.md`; la configurazione del
Worker sta in `wrangler.jsonc` alla radice, perché `wrangler` la cerca lì.

### Account e salvataggi

**Il sito è chiuso**: si entra con un codice via email (Cloudflare Access, lista di
indirizzi decisa a mano in Zero Trust → Access → Applications). Vale per tutto, `/data`
con le soluzioni degli episodi incluso.

Dentro, i salvataggi sono per **tavolo** — un gruppo che gioca la sua campagna — e
stanno su D1 oltre che sul dispositivo. Si gioca anche senza rete: la partita va in
`localStorage` e una coda la manda al server quando la linea torna. Se la stessa partita
è andata avanti in due posti, l'app non sceglie: mostra le due e decide chi gioca.

La schermata dei tavoli compare solo dove risponde `/api/stato`: in locale
`webapp/server.js` serve soli file, quindi lì — e in tutti i banchi di prova — si entra
dalla home come sempre.

Per lavorarci con un D1 vero e senza toccare la produzione:

```bash
./deploy/build-dist.sh
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788   # per test-api
node webapp/test-access.mjs        # verifica del JWT (nessun server)
node webapp/test-sync.mjs          # regola dei conflitti e coda (nessun server)
node webapp/test-api.mjs           # gli endpoint (servono TUTTI E DUE i server)
node webapp/test-account-ui.mjs    # tavoli, offline, divergenza (basta il primo)
```

`OSR_DEV_EMAIL` salta la verifica del token e vale solo lì: non va **mai** in
`wrangler.jsonc`, e c'è un test che lo controlla.

### Banchi di prova

Ogni regola del gioco ha il suo banco in `webapp/test-*.mjs`, da lanciare con
`node webapp/test-<nome>.mjs`. I banchi `test-motore-*.mjs` girano sul motore puro
(`webapp/public/motore/`), senza browser e senza DOM; gli altri vogliono il server
locale o un `wrangler dev`, e lo dicono in testa al file.

## Controlli sulla campagna

```bash
python scripts/audit.py            # regole, artefatti, ponti fra episodi, lessico
python scripts/audit.py --json     # lo stesso, per farci sopra uno script
python scripts/simulate_ep5.py     # partite simulate con dadi veri (uno per episodio)
python scripts/misura_kpi.py       # un metro solo per tutti e venti gli episodi
```

`audit.py` esce 0 quando non trova nulla ed è la condizione d'arresto del loop di
revisione (`LOOP-REVISIONE.md`). Fa solo controlli che o passano o no: i giudizi
narrativi restano a una lettura umana e finiscono in `AUDIT-NARRATIVA-APERTA.md`.

## Documenti di progetto

Tutti alla radice, in Markdown. In ordine di quanto servono a chi arriva adesso:

| file | cosa c'è dentro |
| --- | --- |
| `HANDOFF.md` | **dove siamo**: lo stato del lavoro in corso, aggiornato di continuo |
| `PROMPT-ESPANSIONE.md` | la "bibbia" narrativa, meccanica e visiva: si copia in una conversazione nuova per generare materiale coerente con un assistente AI |
| `CAMPAGNA-EPISODI.md` | le bozze approvate dei venti episodi, punto di partenza di ogni serata nuova |
| `DESIGN-EPISODIO-*.md` | la spec di dettaglio di un singolo episodio |
| `BILANCIAMENTO.md` | la taratura, episodio per episodio: la memoria del ciclo di misura |
| `LOOP-REVISIONE.md` | come gira un giro di revisione: audit → correzione → ri-audit |
| `AUDIT-*.md` | i referti delle revisioni (testi, classi, biografie, letture integrali) |
| `AUDIT-NARRATIVA-APERTA.md` | il registro delle anomalie che solo un giudizio d'autore può chiudere |
| `DESIGN-*.md`, `PIANO-*.md` | le spec e i piani d'esecuzione della web-app (account e salvataggi, motore puro, vista eroe) |
| `PROMPT-MIDJOURNEY.md` | i prompt dell'arte comune |

## Licenza

[PolyForm Noncommercial License 1.0.0](LICENSE.md): uso personale/non commerciale libero
e gratuito. Uso commerciale (vendita, crowdfunding, prodotti derivati a pagamento…)
richiede una licenza a pagamento dell'autore: vedi [NOTICE.md](NOTICE.md) per i contatti
e altri chiarimenti.
