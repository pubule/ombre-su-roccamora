# Ombre su Roccamora

Gioco da tavolo investigativo **cooperativo a puntate** per 2–5 giocatori, ambientato
in una città immaginaria di canali e campanili nel 1889. Unisce indagine alla
*Sherlock/Cluedo* e spedizioni alla *HeroQuest*, senza master e senza uno-contro-tutti.

## Contenuto

- `pdf/` — materiale pronto da stampare:
  - `01-Regolamento` — regole complete
  - `02-Schede-Personaggio` — i 5 eroi della Società del Lume
  - `03-Episodio1-Indagine` — lettera d'incarico, 8 carte Luogo con dorsi, taccuino
  - `04-Episodio1-Spedizione` — mazzo Minaccia con dorsi, nemici, 6 tessere mappa, segnalini
  - `05-SOLUZIONE-non-aprire` — da stampare senza leggere e sigillare in busta!
- `PROMPT-ESPANSIONE.md` — "bibbia" narrativa/meccanica/visiva per generare nuovi
  episodi coerenti con un assistente AI
- `src/` — sorgenti Python (reportlab) che generano tutti i PDF
- `fetch_fonts.sh` — scarica i font liberi (Old Standard TT, IM Fell English SC)

## Rigenerare i PDF

```bash
pip install reportlab
./fetch_fonts.sh
cd src
# i sorgenti cercano i font in /home/claude/fonts: adegua i percorsi in
# deluxe_style.py e poi:
python gen_docs.py     # regolamento + soluzione
python gen_deluxe.py   # schede, indagine, spedizione (versione grafica deluxe)
```

## Come si gioca (in breve)

Ogni episodio è una serata: prima l'**Indagine** (10 ore di tempo, luoghi da sbloccare
con parole chiave, 4 Domande finali da dedurre insieme), poi la **Spedizione** su
tessere con mazzo Minaccia automatico. Le risposte esatte danno vantaggi concreti
nella spedizione. Campagna con migliorie, cicatrici e Frammenti di mistero.

*Episodio 1: Il caso del campanaro scomparso.*
