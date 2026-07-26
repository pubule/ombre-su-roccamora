# PROMPT SUNO — Ombre su Roccamora

Ambienti sonori in loop, uno per **tipologia di luogo**. Stessa logica dei
prompt Midjourney (`PROMPT-MIDJOURNEY.md`): qui stanno i prompt, i file
generati vanno accanto in `suoni/`.

**Perché l'audio conta in questo gioco e non è decorazione:** la bibbia fissa
il tono in «gotico ottocentesco, mai splatter; l'orrore è **acustico** e
suggerito» (`PROMPT-ESPANSIONE.md:1042`), e un intero arco della campagna è a
tema sonoro — Le voci del pozzo, Il teatro dell'eco, la fonderia del bronzo,
il Canto. L'ambiente sonoro è il vettore dell'orrore, non lo sfondo.

---

## Come si generano

1. **Modalità Custom**, campo testo **vuoto**, casella **Instrumental**
   attiva. Se lasci il campo lyrics abilitato Suno ci mette una voce anche
   quando nello stile scrivi «no vocals».
2. Incolla il blocco **Styles** e il blocco **Exclude styles** di ogni traccia
   (sono già completi, uno per uno: non c'è niente da comporre).
3. **Suno non produce loop senza cuciture.** Ogni traccia ha un attacco e
   quasi sempre una chiusa. Il loop lo fai in post: tagli i primi ~8 secondi e
   la coda, poi incroci in dissolvenza di 3-5 s. Un `<audio loop>` semplice
   lascia un buco udibile.
4. **Il nemico del loop è la struttura**: batteria con fill, cadenze, riser,
   «epic», «cinematic build». Stanno tutti negli Exclude.
5. Normalizza **tutte** le tracce allo stesso livello (~ **-23 LUFS**), o
   passando da un luogo all'altro si sentono gli scalini.
6. `low-mid focused, no bright transients` è in ogni prompt di proposito:
   l'ambiente deve stare **sotto** la voce di chi arbitra, non litigarci.

---

## Le dieci tipologie

Ricavate classificando i **183 luoghi** della campagna (Preludio + Ep. 1-20),
non inventate. Il conteggio dice quanto rende ogni traccia.

### 1 · Archivi e uffici — 31 luoghi
Archivi, catasti, tribunale, studi notarili, fermo-posta, depositi sigilli.
Titolo: `Ombre — Archivi`

**Styles**
```
dark ambient drone, dusty paper room tone, distant ticking clock, faint pen scratching on paper, low cello sustain, 19th century archive at night, cold still air, static texture, no development, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending
```

### 2 · Case e interni privati — 30 luoghi
Case, pensioni, locande, camerini, stanze, ville, rifugi.
Titolo: `Ombre — Interni`

**Styles**
```
quiet domestic room tone, ticking mantel clock, wood settling, muffled street through closed shutters, one sustained harmonium note, warm low drone, 1889 poor interior, unchanging, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending
```

### 3 · Taverne e luoghi pubblici — 23 luoghi
Osterie, caffè, mercato, gazzetta, banchi dei pegni, stazione, fioraio.
Titolo: `Ombre — Taverna`

**Styles**
```
crowded tavern room tone heard through a wall, muffled voices with no words, glass and wood, distant out-of-tune hurdy-gurdy, smoky low drone, continuous, no musical structure, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending, clear speech
```

### 4 · Chiese, cripte, campanili — 17 luoghi
Cattedrale, sagrato, sacrestie, cripte, curia, ossari, campanili, organo.
**È la traccia più importante della campagna.**
Titolo: `Ombre — Cripta`

**Styles**
```
vast stone reverb, low pipe organ pedal note held forever, distant single bell decaying, cold air movement, subsonic hum beneath the floor, sacred dread, static drone, no melody, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending, gregorian chant
```

### 5 · Acqua e canali — 17 luoghi
Moli, chiatte, banchine, dogana, lavatoio, roggia, lago, imbarcaderi.
Titolo: `Ombre — Canale`

**Styles**
```
still black canal water lapping stone, wet rope creak, distant boat knock, fog, hollow low drone under the surface, night harbour room tone, continuous texture, no rhythm, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending, seagulls
```

### 6 · Botteghe e officine — 13 luoghi
Fonderie, molino, crogiolo, laboratori, marmista, cordaio, lattoniere, liutaio.
Titolo: `Ombre — Officina`

**Styles**
```
idle workshop room tone, cooling metal ticking, slow leather bellows, distant waterwheel rumble, faint iron resonance ringing, sustained industrial drone, steady, no beat, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending, hammering rhythm
```

### 7 · Depositi e magazzini — ~10 luoghi
Depositi daziari, magazzini della calce, risme, deposito reperti.
Titolo: `Ombre — Deposito`

**Styles**
```
huge empty warehouse tone, suspended dust, far-off drip, sacks and timber settling, very low room resonance, cold storage at night, unchanging drone, no melody, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending
```

### 8 · Legge, prigioni, cimiteri — 10 luoghi
Gendarmeria, corpo di guardia, celle, villa-prigione, cimiteri, becchino.
Titolo: `Ombre — Gendarmeria`

**Styles**
```
cold institutional corridor tone, distant iron door closing, measured footsteps far away, gas lamp hiss, oppressive low drone, restrained, static, no percussion, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending
```

### 9 · Quota: tetti, ponteggi, guglie — 5 luoghi
Tetti, gronde, comignoli, abbaini, lucernari, guglie, torre, ponteggi.
Titolo: `Ombre — Tetti`

**Styles**
```
high wind over rooftops, loose tiles and scaffolding creaking, city murmur far below, thin airy drone, exposed height, vertigo, continuous, no melody, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending, whistling wind melody
```

### 10 · Sotterranei e le tre acque — 4 luoghi + il finale
Cisterne, gallerie, pozzi, cunicoli, intercapedini, la camera del Dormiente.
Titolo: `Ombre — Sottosuolo`

**Styles**
```
deep underground cistern, dripping into still water, immense echo, a breathing resonance that is not yours, very slow subsonic pulse, cave dread, static, no instruments, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, melody, chord progression, crescendo, riser, build-up, cinematic trailer, orchestral hit, fade out ending
```

---

## Le due tracce di STATO

Non sono luoghi: sono la clessidra e lo scontro. Valgono più di cinque
ambienti sui KPI **ansia** e **immersione** (vedi la memoria dei KPI core).

### 11 · Il Canto che sale
Titolo: `Ombre — Il Canto`

**Styles**
```
slowly rising subsonic drone, a distant crowd humming one note through stone, detuned bronze bells resonating apart, dread accumulating, no release, no resolution, static harmony, unbearable patience, low-mid focused
```
**Exclude styles**
```
vocals, lyrics, drums, percussion, beat, melody, chord progression, cinematic trailer, orchestral hit, climax, resolution, fade out ending
```

Generane **tre** versioni collo stesso prompt: `canto-1.mp3`, `canto-2.mp3`,
`canto-3.mp3`. Si sale di livello man mano che il Canto avanza. Una traccia
sola che cresce da sé non è mettibile in loop: la scala si fa cambiando file.

### 12 · Spedizione
Titolo: `Ombre — Spedizione`

**Styles**
```
tense sustained low strings, cold room tone, irregular distant knocks, held dissonant interval, alert and static, no motion, waiting for something to move, no rhythm, low-mid focused, no bright transients
```
**Exclude styles**
```
vocals, choir, lyrics, drums, percussion, beat, action music, melody, chord progression, crescendo, riser, cinematic trailer, orchestral hit, fade out ending
```

---

## Nomi dei file

```
suoni/
  archivio-uffici.mp3     casa-interni.mp3      taverna-pubblico.mp3
  chiesa-cripta.mp3       acqua-canali.mp3      bottega-officina.mp3
  deposito-magazzino.mp3  legge-prigione.mp3    quota-tetti.mp3
  sotterraneo.mp3         canto-1/2/3.mp3       spedizione.mp3
  PROMPT-SUNO.md
```

## Da fare, se un giorno si aggancia alla webapp

`indagine.js:schedaLuogo()` sa già quale luogo si sta aprendo, quindi serve
una mappa `luogo → tipologia` e un elemento audio con crossfade. La mappa non
esiste ancora: oggi la tipologia si ricava dal nome del luogo per parole
chiave (canale/molo/chiatta → acqua; cattedrale/cripta/campanile → chiesa…).
Meglio renderla un dato esplicito — un campo `ambiente=` sul dict del luogo —
che continuare a indovinarla da una regex.

**Un episodio nuovo** aggiunge i suoi luoghi a una delle dieci tipologie; una
tipologia nuova si aggiunge qui con lo stesso schema Styles/Exclude.
