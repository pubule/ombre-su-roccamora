---
description: Simula partite di Ombre su Roccamora con dadi veri, mirate a stressare coinvolgimento/ansia/immersività/giocabilità
argument-hint: [fuoco opzionale, es. "Brera turn-order" o "party senza healer" o "2 giocatori"]
---

Esegui una sessione di playtest simulato di Ombre su Roccamora usando
`scripts/simulate_playtest.py` (dadi veri, dati reali da `src/gen_cards.py`,
non narrativa inventata). Obiettivo: non solo verificare che il gioco
funzioni, ma capire se è **coinvolgente, se mette ansia, se immerge, se è
giocabile** — e trovare i punti dove non lo è.

Fuoco richiesto per questa sessione (se vuoto, scegli tu): $ARGUMENTS

## 1. Orientati

- Leggi l'intestazione di `scripts/simulate_playtest.py` per i limiti
  dichiarati (movimento astratto, euristica Indagine, abilità modellate).
- Guarda `logs/playtest/` per le sessioni precedenti: NON ripetere le
  stesse composizioni di party già testate — varia ogni volta.

## 2. Progetta le run per stressare, non per confermare

Scegli 3-5 party pensati apposta per far vedere il punto di rottura, non
la run "media" già fatta. Categorie da cui pescare (cambiale ad ogni
invocazione, e usa il fuoco richiesto sopra se presente):

- **Nessun healer** in party (Attilio assente): quanto fa male, il gruppo
  regge fino in fondo?
- **Party al minimo** (2 eroi, uno controlla 2 personaggi) e **al
  massimo** (5 eroi): l'azione economica cambia troppo?
- **Ordine di turno avverso**: eroi ad alto danno (Ottone, Elena) prima di
  chi ha un'abilità "one-shot" su un bersaglio raro (Brera/Malacarne,
  Carbone/Esca) — l'abilità trova mai un bersaglio o gli viene sempre
  rubato?
- **Party "cervelli" senza tank**: alto Acume/Nervi, basso Vigore/Difesa —
  quanto è vicino al party wipe?
- **Combo dei 5 eroi nuovi non ancora provata insieme** (Serra, Marani,
  Carbone, Brera, Fanti): si sovrappongono mai le nicchie o resta
  ognuno la propria cosa?
- **Timing del Custode**: canto a 3 prima di raggiungere T6, o diapason
  mai trovato in Indagine (party senza chi va alla Bottega del Liutaio).

Per ognuna, scrivi in una riga PRIMA di lanciare la run: quale dinamica
stai cercando di rompere e perché ti aspetti che lì il gioco scricchioli.

## 3. Esegui

Modifica la lista `runs` in `scripts/simulate_playtest.py` con le
composizioni scelte (nomi run che dicano la dinamica stressata, es.
`run-senza-healer`, `run-turnorder-brera`), poi:

```
python scripts/simulate_playtest.py <etichetta-sessione-che-descrive-il-fuoco>
```

## 4. Leggi i log per intero

Non fermarti al `riepilogo.md`: apri `indagine.log` e `spedizione.log` di
ogni run. Cerca in particolare:

- **Coinvolgimento**: ci sono scelte vere (luogo da saltare, bersaglio da
  scegliere, ora da spendere) o il gruppo segue un solo binario obbligato?
- **Ansia**: quanto scendono le Salute nei momenti peggiori? Ci sono round
  dove un solo tiro sbagliato avrebbe ribaltato l'esito? Il Canto/l'orologio
  mette davvero pressione o è ignorabile?
- **Immersività**: i tiri di dado, letti in fila, raccontano una scena
  (un colpo mancato all'ultimo secondo, un'abilità che salva il gruppo) o
  sono solo numeri?
- **Giocabilità**: qualche abilità resta inutilizzata per tutta la
  partita? Qualche eroe passa turni interi con "nessun bersaglio, avanza"?
  Il mazzo Minaccia o i segnalini nemico si esauriscono?

## 5. Scrivi l'analisi

Crea `logs/playtest/<sessione>/analisi.md`: quattro sezioni (Coinvolgimento,
Ansia, Immersività, Giocabilità), ogni punto supportato da una citazione
concreta dal log (round, tiro, riga), non da impressioni generiche. Se
trovi un problema di design, prima cerca un precedente di genere (come
risolvono HeroQuest/Gloomhaven/Arkham Horror/D&D lo stesso problema) prima
di proporre una soluzione nuova.

## 6. Riporta

Rispondi all'utente con un riepilogo conciso (non il log intero): cosa hai
stressato, cosa ha retto, cosa no, e — solo se hai trovato un problema
concreto — una proposta di fix. Non applicare modifiche al gioco senza
che l'utente le approvi esplicitamente.
