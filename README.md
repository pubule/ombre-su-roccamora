# Ombre su Roccamora

Gioco da tavolo investigativo **cooperativo a puntate** per 2–5 giocatori, ambientato
in una città immaginaria di canali e campanili nel 1889. Unisce indagine alla
*Sherlock/Cluedo* e spedizioni alla *HeroQuest*, senza master e senza uno-contro-tutti.

## Contenuto

- `pdf/` — materiale pronto da stampare:
  - `01-Regolamento` — regole complete
  - `02-Schede-Personaggio` — i 6 eroi della Società del Lume
  - `03-Episodio1-Indagine` — lettera d'incarico, taccuino (le 8 carte Luogo e le
    carte Indizio Nascosto sono immagini a parte, vedi `cards/`)
  - `04-Episodio1-Spedizione` — note per tessera, segnalini (le carte Minacce/Nemici e
    le tessere T1-T6 sono file immagine a parte, vedi `cards/` e `board/`)
  - `05-SOLUZIONE-non-aprire` — da stampare senza leggere e sigillare in busta!
  - `06-Aiuto-Giocatore` — riepilogo regole da tavolo su una pagina
  - `07-Approfondimenti` — fronte/retro (duplex) di Indizi Nascosti, Testimoni e
    Referti: i dorsi mostrano il numero del luogo e il tipo
- `cards/` — carte gioco pronte (Eroi, Nemici, Minacce, Luoghi, Indizi Nascosti,
  Testimoni, Referti, Oggetti)
- `board/` — le 6 tessere T1-T6 della Spedizione, griglia+arredi+porte pronte
- `reperti/` — documenti-reperto (diario, registro, atti d'archivio) da consegnare
  durante l'indagine, composti su un'unica foto di pergamena
- `artworks/` — arte sorgente (dipinti, ritratti, tessere, mappa)
- `PROMPT-MIDJOURNEY.md` — prompt per generare nuova arte con lo stesso stile
- `PROMPT-ESPANSIONE.md` — "bibbia" narrativa/meccanica/visiva per generare nuovi
  episodi coerenti con un assistente AI
- `src/` — sorgenti Python (reportlab) che generano tutti i PDF
- `scripts/` — script Node/Playwright che generano carte, tessere e reperti
- `vendor/cardconjurer/` — copia locale statica di Card Conjurer (vedi sotto)
- `fetch_fonts.sh` — scarica i font liberi (Old Standard TT, IM Fell English SC)

## Rigenerare i PDF

```bash
pip install reportlab
./fetch_fonts.sh
cd src
# i sorgenti cercano i font in /home/claude/fonts: adegua i percorsi in
# deluxe_style.py e poi:
python gen_docs.py     # regolamento + soluzione
python gen_deluxe.py   # schede personaggio
python gen_gothic.py   # indagine + spedizione (versione grafica gotica finale)
```

## Rigenerare le carte

```bash
cd scripts/cardconjurer
node generate-batch.js            # tutte (eroi, nemici, minacce, luoghi, indizi, testimoni, referti, oggetti)
node generate-batch.js luoghi     # solo un gruppo (heroes|nemici|minacce|luoghi|indizi|testimoni|referti|oggetti)
node generate-test.js "Elena Fosco" "Il Fonditore"   # solo carte specifiche, per titolo
node generate-backs.js            # PDF 07 fronte/retro coi dorsi numerati degli Approfondimenti
```

Gira contro `vendor/cardconjurer/`, una copia locale statica di
[Card Conjurer](https://cardconjurer.app/) (open source, GPLv3): niente
dipendenza da un sito di terzi per generare le carte — il sito originale
(cardconjurer.com) è già stato chiuso una volta dopo una diffida, vedi
`vendor/cardconjurer/README.txt` per i dettagli.

## Come si gioca (in breve)

Ogni episodio è una serata: prima l'**Indagine** (10 ore di tempo, luoghi da sbloccare
con parole chiave, 4 Domande finali da dedurre insieme), poi la **Spedizione** su
tessere con mazzo Minaccia automatico. Le risposte esatte danno vantaggi concreti
nella spedizione. Campagna con migliorie, cicatrici e Frammenti di mistero.

*Episodio 1: Il caso del campanaro scomparso.*
