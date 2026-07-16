# Ombre su Roccamora

Gioco da tavolo investigativo **cooperativo a puntate** per 2–10 giocatori, ambientato
in una città immaginaria di canali e campanili nel 1889. Unisce indagine alla
*Sherlock/Cluedo* e spedizioni alla *HeroQuest*, senza master e senza uno-contro-tutti.

## Contenuto

- `pdf/` — materiale pronto da stampare, comune a tutta la campagna:
  - `01-Regolamento` — regole complete
  - `02-Schede-Personaggio` — gli 11 eroi della Società del Lume
  - `06-Aiuto-Giocatore` — riepilogo regole da tavolo su una pagina
  - `07-Tabellone` — overlay scuro riusabile in ogni episodio per la Spedizione:
    non contiene le tessere (si posano libere, la mappa cambia episodio per
    episodio), solo gli slot per la traccia del Canto e il mazzo Minaccia +
    scarti
  - `Preludio/` — mini-episodio tutorial "La Prova del Lume" (~60-90 min): come gli
    undici eroi si incontrano ed entrano nella Società del Lume, imparando le regole
    giocando (box "Scuola del Lume" nei fascicoli). 4 luoghi, 2 Domande, mini
    spedizione su 3 tessere riusate dall'Episodio 1. Stessi fascicoli di un
    episodio pieno: `Copertina`, `Indagine`, `Spedizione`, `Luoghi`, `Soluzione
    (non aprire)`.
  - `Episodio 1/` — materiale specifico di questo episodio:
    - `Copertina` — poster dell'episodio (mappa della città, titolo e nome del gioco)
    - `Indagine` — lettera d'incarico, taccuino (le 8 carte Luogo e le carte
      Indizio Nascosto sono immagini a parte, vedi `cards/`)
    - `Spedizione` — note per tessera, miniature quadrate ritagliabili (ritratto
      di eroe/nemico, taglia di una casella tessera — al posto di gettoni tondi
      astratti), Registro delle Ferite (foglio riusabile per tracciare i colpi
      incassati dai nemici attivi, tenuto da chi pesca il mazzo Minaccia — le
      carte Minacce/Nemici e le tessere T1-T6 sono file immagine a parte, vedi
      `cards/` e `board/`)
    - `Luoghi` — per chi arbitra: una pagina per luogo/tessera con descrizione
      estesa e sensoriale della scena (da leggere o improvvisare a voce) e quale
      carta Approfondimento/Oggetto prendere (le carte stesse non lo dicono, per
      non far barare i giocatori e restare riusabili tra episodi)
    - `Soluzione (non aprire)` — da stampare senza leggere e sigillare in busta!
- `cards/`, `board/`, `reperti/` — stesso schema di `pdf/`: quello riusabile in
  ogni episodio sta al livello comune, il resto in una sottocartella per
  episodio (mai al livello comune, per evitare confusione su cosa vale per
  quale storia):
  - `Comune/cards/Eroi/` — per la scelta del personaggio a inizio serata (dettagli
    sulla Scheda), comune
  - `cards/Nemici/` — solo la Malavita (Sgherro, Sicario): nemici secolari
    dichiaratamente riusabili in ogni episodio, comune
  - `Episodio 1/cards/` — Nemici del culto, Minacce, Luoghi, Indizi Nascosti,
    Testimoni, Referti, Oggetti di questo episodio
  - `Preludio/cards/` — le 9 carte del tutorial (poche, restano piatte senza
    sottocartelle per tipo)
  - `Episodio 1/board/` — le 6 tessere T1-T6 della Spedizione,
    griglia+arredi+porte pronte (il Preludio riusa T1/T2/T4 da qui)
  - `reperti/Episodio 1/`, `reperti/Preludio/` — documenti-reperto (diario,
    registro, atti d'archivio) da consegnare durante l'indagine, composti su
    un'unica foto di pergamena
- `artworks/` — arte sorgente (dipinti, ritratti, tessere, mappa)
- `webapp/` — web-app da iPad/telefono, server sul PC (vedi la sezione
  «Web-app» sotto)
- `PROMPT-MIDJOURNEY.md` — prompt arte comune (eroi, cornici, dorsi, tessere, mappe); i soggetti per episodio stanno in `PROMPT-MIDJOURNEY-Preludio.md` e `PROMPT-MIDJOURNEY-Episodio-1.md`
- `PROMPT-ESPANSIONE.md` — "bibbia" narrativa/meccanica/visiva per generare nuovi
  episodi coerenti con un assistente AI
- `src/` — sorgenti Python (reportlab) che generano tutti i PDF
- `scripts/` — script Node/Playwright che generano carte, tessere e reperti
- `vendor/cardconjurer/` — copia locale statica di Card Conjurer (vedi sotto)
- `fetch_fonts.sh` — scarica i font liberi (Old Standard TT, IM Fell English SC)

## Rigenerare tutto in un colpo

```bash
./build-all.sh   # tessere, carte, fogli fronte/retro, reperti, tutti i PDF, poi la stampa completa unita
```

Le sezioni sotto restano per rigenerare solo una parte (es. dopo aver aggiornato
un solo testo) senza rilanciare tutto il resto.

## Rigenerare i PDF

```bash
pip install reportlab pypdf
./fetch_fonts.sh
cd src
# i sorgenti cercano i font in /home/claude/fonts: adegua i percorsi in
# deluxe_style.py e poi:
python gen_docs.py     # regolamento + aiuto-giocatore + soluzione (Episodio 1)
python gen_deluxe.py   # schede personaggio
python gen_bestiario.py # bestiario nemici per episodio (bio + Ferite tabellate per numero di eroi)
python gen_mappa.py    # mappa di Roccamora per episodio (stradario incrementale delle destinazioni)
python gen_gothic.py   # indagine + spedizione (Episodio 1)
python gen_narrator.py # luoghi/tessere per chi arbitra (Episodio 1)
python gen_cover.py    # copertine (Preludio + episodi)
python gen_preludio.py # Preludio completo (indagine, spedizione, soluzione, luoghi)
python gen_ep2.py      # Episodio 2 «La voce del bronzo» (indagine, spedizione, soluzione, bestiario)
python gen_board.py    # tabellone riusabile (traccia Canto, mazzo Minaccia + scarti)
```

## Rigenerare le carte

Da lanciare dalla **radice del repo** (non da dentro `scripts/cardconjurer`:
`card.art`, es. `'artworks/Elena.png'`, e' risolto relativo alla cwd):

```bash
node scripts/cardconjurer/generate-batch.js            # tutte (eroi, nemici, minacce, luoghi, indizi, testimoni, referti, oggetti, preludio)
node scripts/cardconjurer/generate-batch.js luoghi     # solo un gruppo (heroes|nemici|minacce|luoghi|indizi|testimoni|referti|oggetti|preludio)
node scripts/cardconjurer/generate-test.js "Elena Fosco" "Il Fonditore"   # solo carte specifiche, per titolo
node scripts/cardconjurer/generate-print-sheets.js     # fronte/retro pronto da stampare, DIVISO PER BUCKET (non committati):
                                                        #   Comune/pdf/Carte.pdf (Eroi + Nemici/Minacce Malavita)
                                                        #   Preludio/pdf/Carte.pdf (solo le carte del Preludio)
                                                        #   Episodio 1/Carte-e-Tessere.pdf (carte dell'episodio + le 6 tessere)
```

Le tessere stanno nel bucket Episodio 1, non in Comune: sono sue
(`Episodio 1/board/`); il Preludio ne riusa 3 (T1/T2/T4) solo perche' cosi'
e' stato scritto, non perche' siano un prop condiviso tra episodi — per
giocare il Preludio serve quindi anche `Episodio 1/Carte-e-Tessere.pdf`,
non solo Comune + Preludio. Il bucket di ogni carta si legge dal suo campo
`file` in `cards-data.js` (`Episodio 1/...`, `Preludio/...`, o nessuno dei
due = Comune) — vedi il commento in testa a `generate-print-sheets.js`. Un
episodio futuro eredita Eroi/Malavita gratis: basta dare alle sue carte
nuove un `file` che inizia per `Episodio N/`, nessun'altra modifica allo
script.

## Stampa completa (un PDF per Comune + uno per Preludio + uno per episodio, sempre fronte/retro)

```bash
python scripts/merge-print-all.py
```

Unisce i fascicoli gia' generati in `pdf/` con i fogli carte/tessere di
`generate-print-sheets.js`, **per bucket**: chi ha gia' stampato il Comune
(Regolamento, Schede, Aiuto-Giocatore, Tabellone, Eroi, Malavita) non lo
ristampa quando arriva un nuovo episodio. Tre file, sempre a pagine
pari ciascuno (aggiunge da solo una pergamena di chiusura dove serve, anche
ai poster/schede singole che da soli restano a una pagina) cosi' la stampa
fronte/retro resta allineata dall'inizio alla fine di ognuno:
- `pdf/Ombre-su-Roccamora-Comune-Completo.pdf`
- `pdf/Ombre-su-Roccamora-Preludio-Completo.pdf`
- `pdf/Ombre-su-Roccamora-Episodio-1-Completo.pdf` (un episodio futuro aggiunge
  solo una nuova voce a `BUCKETS` in `scripts/merge-print-all.py`)

Non genera nulla da zero: rilancia prima i passi sopra per aggiornare il
contenuto. File pesanti (fino a 40+MB l'uno, immagini a piena risoluzione):
normale per PDF di stampa, non un errore. Non committati — vanno
rigenerati in locale.

## Rigenerare tessere e reperti

```bash
node scripts/tiles/generate-tiles.js     # le 6 tessere T1-T6 (Episodio 1/board/)
node scripts/reperti/generate-reperti.js # diario, registro, fascicolo + retro pergamena (reperti/)
```

Gira contro `vendor/cardconjurer/`, una copia locale statica di
[Card Conjurer](https://cardconjurer.app/) (open source, GPLv3): niente
dipendenza da un sito di terzi per generare le carte — il sito originale
(cardconjurer.com) è già stato chiuso una volta dopo una diffida, vedi
`vendor/cardconjurer/README.txt` per i dettagli.

## Web-app (iPad/telefono, server sul PC)

L'app fa da **arbitro al tavolo**: custodisce chiavi e segreti, tira gli
orologi, pesca le Minacce e legge gli esiti di Cercare — nessuno al tavolo
sa più niente in anticipo. Due modalità alla partenza: **al tavolo**
(companion: si gioca col materiale fisico stampato) e **tutto a schermo**
(in costruzione). Nessuna dipendenza da installare oltre a Node e Pillow
(già usati dal resto del repo).

```bash
# 1. esporta dati e immagini (da rilanciare solo dopo modifiche a carte/PDF)
python webapp/export-data.py     # luoghi, tessere, nemici, soluzioni -> webapp/data/*.json
node   webapp/export-data.js     # carte (testi + percorsi immagine)  -> webapp/data/carte.json
python webapp/export-assets.py   # copie web ridotte di carte/tessere/arte -> webapp/assets/

# 2. avvia il server (resta acceso finché si gioca)
node webapp/server.js            # porta 8017; oppure: node webapp/server.js 8080
```

All'avvio stampa l'URL di rete locale (es. `http://192.168.1.x:8017`):
aprilo dal browser dell'iPad/telefono **sulla stessa rete Wi-Fi** e usa
"Aggiungi alla schermata Home" per averla a tutto schermo. Lo schermo non
si spegne da solo durante la partita (wake-lock). I salvataggi sono sul
dispositivo (una partita in corso per episodio, si riprende da dove si era
rimasti); il server serve solo file statici, niente accessi esterni.

## Come si gioca (in breve)

Ogni episodio è una serata: prima l'**Indagine** (10 ore di tempo, luoghi da sbloccare
con parole chiave, 4 Domande finali da dedurre insieme), poi la **Spedizione** su
tessere con mazzo Minaccia automatico. Le risposte esatte danno vantaggi concreti
nella spedizione. Campagna con migliorie, cicatrici e Frammenti di mistero.

*Episodio 1: Il caso del campanaro scomparso.*

## Licenza

[PolyForm Noncommercial License 1.0.0](LICENSE.md): uso personale/non
commerciale libero e gratuito. Uso commerciale (vendita, crowdfunding,
prodotti derivati a pagamento...) richiede una licenza a pagamento
dell'autore: vedi [NOTICE.md](NOTICE.md) per i contatti e altri chiarimenti.
