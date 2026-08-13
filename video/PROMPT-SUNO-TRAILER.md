# PROMPT SUNO — la traccia del trailer

Trenta secondi sotto il trailer (`video/PROMPT-SEEDANCE.md`). Stessa mano dei
dieci ambienti in `suoni/PROMPT-SUNO.md`, con **una regola rovesciata**: là
l'arco era vietato perché le tracce sono loop e un crescendo si sente
ricominciare; qui la traccia parte e finisce, quindi un arco ci sta — purché
sia un arco di **mistero**, non da trailer di cinema.

**Il tono, dichiarato dall'autore: dark mystery, come l'ambientazione.** Non
horror, non azione. La bibbia fissa «gotico ottocentesco, mai splatter;
l'orrore è **acustico** e suggerito» — e questo trailer chiude su un emblema
che respira, non su un colpo.

---

## Come si genera

1. **Modalità Custom**, campo lyrics **vuoto**, casella **Instrumental**
   attiva. Se lasci le lyrics abilitate Suno ci mette una voce anche quando
   negli stili scrivi «no vocals».
2. Incolla **Styles** e **Exclude styles** qui sotto, così come sono.
3. Suno produce due-quattro minuti: **si tengono i trenta secondi migliori**,
   scegliendo il punto dove entra la campana. Non serve che il pezzo finisca —
   `monta-trailer.sh` sfuma da solo a 28 s.
4. **Normalizza a -23 LUFS**, come tutto il resto del progetto: se il trailer
   parte più forte degli ambienti di gioco si sente lo scalino.
5. Il file va in `video/musica.mp3`.

## L'arco, in trenta secondi

| s | cosa succede sotto |
|--:|---|
| 0-4 | acqua e pietra, una nota di violoncello tenuta bassa, niente altro |
| 4-22 | sotto gli undici volti: un ostinato lento di archi gravi, un battito sordo che tiene il tempo senza essere un tamburo, un armonium che non si risolve mai |
| 22-27 | tutto si assottiglia: resta l'aria, e una campana lontana che decade |
| 27-30 | un colpo grave solo, e il silenzio che se lo mangia |

L'ostinato è il pezzo che conta: undici volti in diciotto secondi hanno
bisogno di qualcosa che li **cucia**, o diventano una sfilata. Non deve
crescere — deve insistere.

---

## Il prompt

Titolo: `Ombre — Trailer`

**Styles**
```
dark mystery, slow string ostinato in low register, muted double bass pulse like a heartbeat, sustained harmonium that never resolves, distant single church bell decaying, black canal water and wet stone ambience, gaslight era gothic, patient dread, unresolved minor tension, sparse, low-mid focused, no bright transients, analog tape warmth
```

**Exclude styles**
```
vocals, choir, lyrics, gregorian chant, drums, drum kit, percussion loop, beat, trap, braams, orchestral hit, epic cinematic trailer, hollywood trailer, riser, whoosh, sub drop, action, heroic, triumphant, major key, uplifting, fast tempo, synthwave, modern production, bright cymbals, jump scare sting
```

**Perché ogni esclusione c'è:** `braams`, `riser`, `whoosh`, `sub drop` e
`epic cinematic trailer` sono il linguaggio dei trailer moderni, ed è
esattamente ciò che farebbe sembrare questo gioco un'altra cosa. `heroic`,
`triumphant`, `major key` perché la Società del Lume non vince: indaga.
`jump scare sting` perché l'Adepto gira la testa e basta — il colpo lo mette
lo spettatore da sé.

---

## Se non convince

Due leve, in quest'ordine:

1. **Togliere il battito** (`muted double bass pulse like a heartbeat`): se la
   traccia risulta troppo «in marcia», è quello. Resta l'ostinato, e il
   trailer si fa più freddo.
2. **Aggiungere `celesta` o `music box`** — una sola nota acuta ogni tanto
   sopra i gravi. Alza il mistero e non tocca il peso. È il suono del
   carillon in una casa vuota, e in questo gioco significa qualcosa.
