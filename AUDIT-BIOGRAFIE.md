# Audit delle biografie degli eroi

> **STATO: applicato l'11/08/2026.** Sei biografie riscritte (Marn, Sibilla,
> Nino, Carbone, Brera, Mora); cinque lasciate intatte perché avevano già
> tutte e sei le colonne piene. Testi approvati dall'autore prima della
> scrittura. Schede Personaggio rigenerate e guardate al render.

**11/08/2026.** Le undici biografie estese (`BIO_SCHEDA` in `src/story.py`,
128-175 parole), quelle che l'app stampa nel riquadro **«chi sei»** e che il
fascicolo Deluxe mette sulla scheda personaggio.

Griglia richiesta: **chi**, **cosa**, **perché**, **come**, **quando** — più la
colonna che conta davvero, **cosa porta al tavolo**: il motivo per cui una
società di indagine avrebbe voluto proprio quella persona. Quel motivo deve
essere *visibile* senza che nessuno lo dichiari, e senza nominare chi recluta.

---

## 1. La griglia

`•` presente e chiaro · `~` accennato · `✗` assente

| eroe | chi | cosa | perché | come | quando | cosa porta |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Elena Fosco | • | • | • | • | • | • |
| Attilio Marn | • | • | ~ | • | **✗** | ~ |
| Sibilla Reve | • | • | • | • | **~** | ~ |
| Nino Cauto | • | • | • | • | **~** | • |
| Ottone Massari | • | • | • | • | • | • |
| Carla Dosti | • | • | • | • | • | • |
| Lazzaro Serra | • | • | ~ | • | • | • |
| Padre Celso | • | • | • | • | • | • |
| Fulgenzio Carbone | • | • | ~ | • | **✗** | ~ |
| Ottavio Brera | • | • | • | • | • | • |
| Mora Fanti | • | • | • | • | **~** | • |

**Chi**, **cosa** e **come** sono solidi in tutte e undici: sono ritratti
scritti bene, con un mestiere e un modo di guardare. Il buco è altrove.

---

## 2. I tre difetti

### 2.1 Manca il **quando** — 2 assenti, 3 vaghi

La domanda a cui la biografia non risponde è: *perché adesso?* Una persona ha
un mestiere da vent'anni; cosa è successo nell'ultimo mese che l'ha portata a
sedersi a quel tavolo?

- **Attilio Marn** e **Fulgenzio Carbone** non hanno nessun innesco: sono
  descritti in stato stazionario. Marn «ha smesso di raccontarle e ha
  cominciato ad annotarle» — ma da quando? Carbone «sa di collezionare esche» —
  ma cosa gli è arrivato in bottega ultimamente?
- **Sibilla Reve** ha un innesco potente, ma è d'infanzia: il pozzo da bambina.
  Spiega chi è, non perché stanotte.
- **Nino Cauto** («delle porte che ha aperto negli ultimi tempi, alcune
  avrebbe preferito lasciarle chiuse») e **Mora Fanti** («le sue rotte, di
  colpo, non sono più sicure») accennano al fatto recente senza dirlo.

Chi ce l'ha, ce l'ha nitido — e sono le biografie migliori: la mano sulla
spalla di Elena, il garzone di Ottone alla festa di San Teodoro, i tre
internati di Serra che cantano la stessa melodia, il primo avvertimento di
Carla, il verbale di Ca' Landi di Padre Celso, i tre anni d'insonnia di Brera.

### 2.2 Il **perché sono utili** si deve indovinare — 3 casi

Per otto eroi la competenza è ovvia: Elena ha il metodo, Carla può stampare,
Nino apre, Mora conosce i canali, Brera ricorda ogni volto del tribunale,
Serra ha trenta quaderni, Celso ha le carte della Curia, Ottone sta dietro il
banco dove passa mezza città.

Per tre no:

- **Marn** — il testo dice che *vede* cose strane. Non dice la cosa che lo
  rende prezioso: è l'unico che guarda i corpi di questa città **prima** che
  diventino un verbale, e i suoi appunti sono l'unico registro di ciò che la
  Gendarmeria archivia come delirio.
- **Sibilla** — «a lei parlano tutti» c'è, ma resta colore. La competenza vera
  è più tagliente: raccoglie le paure della città senza fare domande, quindi
  sa cosa la città teme prima che qualcuno lo denunci.
- **Carbone** — il retrobottega è descritto come una collezione. È invece un
  imbuto: tutto ciò che le famiglie di Roccamora vogliono far sparire passa
  di lì, e lui lo cataloga.

### 2.3 Due biografie sanno troppo — spoiler

**Brera** («Sa che il culto compra i bravacci a giornata») e **Mora** («Non le
importa cosa il culto nasconda sotto Roccamora») nominano **il culto**. Le
altre nove no — ed è giusto: che sotto la città ci sia una confraternita si
scopre nell'Episodio 1, all'Archivio Civico, ed è una delle rivelazioni della
prima serata. Chi sceglie Brera o Mora la legge sulla propria scheda prima di
cominciare.

Va tolto. Il fatto che li muove resta identico — i bravacci pagati, le rotte
che si chiudono — solo che non ha ancora un nome.

---

## 3. Cosa **non** va toccato

- **Il triangolo del pozzo.** Elena (il caso archiviato), Brera (la firma su
  quell'archiviazione) e Sibilla (la voce dall'acqua, da bambina) convergono
  sullo stesso fatto senza saperlo. È il seme della campagna, ed è già lì.
- **La voce di ciascuno.** Marn che si porta un bisturi che non ha mai usato,
  Nino che parla troppo, Ottone che legge la città a tavola, Mora che ha
  salvato un furetto da un tavolo di dissezione: sono le righe che li rendono
  persone e non ruoli. Nessuna va sacrificata per far posto alla griglia.
- **Le bio brevi delle carte** (11 carte Eroe, ~60 parole): sono compressioni
  fedeli, e vanno lasciate — a patto di allineare le due che citano il culto.

---

## 4. Cosa propongo

Riscrivere le undici `BIO_SCHEDA` tenendo intatti mestiere, voce e dettagli
personali, e aggiungendo dove manca:

1. **un innesco recente e concreto** per Marn, Carbone, Sibilla, Nino e Mora —
   un fatto delle ultime settimane, coerente con la lore già scritta (la cera
   nera, il canto alle tre, le chiatte senza lanterne, i pozzi murati);
2. **una riga che rende visibile la competenza** per Marn, Sibilla e Carbone —
   non «è utile perché», ma un fatto da cui si vede;
3. **via «il culto»** da Brera e Mora, sostituito con ciò che vedono davvero.

Nessuna biografia nomina chi recluta, e nessuna dice «per questo mi hanno
chiamato»: il motivo si deve leggere da sé, come si legge il movente di un
sospettato dalle sue abitudini.
