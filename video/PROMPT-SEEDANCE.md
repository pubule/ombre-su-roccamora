# PROMPT SEEDANCE — il trailer di trenta secondi

> **SUPERATO dal 13/08/2026.** L'impianto qui sotto (quattordici clip corte,
> gli eroi a 1,6 s, i riferimenti-volto) è stato provato sul campo e bocciato:
> una ripresa unica da 30 s **saltava troppo in fretta** da una cosa all'altra,
> e nove riferimenti attaccati insieme **venivano ignorati quasi del tutto**.
> I prompt buoni stanno ora in **`video/prompt-trailer-30s.txt`**: sette clip
> da 4 secondi, una per personaggio, **senza riferimenti** — l'artwork
> dell'eroe si mette come **Start Image**, e lì il volto è quello giusto per
> costruzione invece che per persuasione.
>
> Questo file resta per due cose che valgono ancora: la sezione «Cosa offre
> davvero lo strumento» (durate, risoluzioni, campo file condiviso, prezzo) e
> il ragionamento sul formato 16:9.

Le quattordici clip del trailer, una per blocco: immagine di partenza, prompt
da incollare, negative, durata. Stessa logica di `suoni/PROMPT-SUNO.md` — qui
stanno i prompt, i file generati vanno accanto in `video/clip/`.

**Cosa racconta.** La Società del Lume si presenta: la città sull'acqua, poi
gli undici eroi ognuno intento al proprio mestiere, poi la minaccia, poi il
sigillo. Non è un giro d'atmosfera: undici volti in diciotto secondi sono la
scelta, e il resto del trailer ci gira intorno.

---

## Cosa offre davvero lo strumento (guardato il 13/08/2026)

Non a memoria: aperta la pagina e letta l'interfaccia.

- **Durate da 4 a 30 secondi**, un secondo alla volta. La clip da 1,6 s non
  esiste: si genera il minimo e si taglia.
- **Risoluzione 480p o 720p soltanto.** Niente 1080p — il trailer nasce a
  1280×720, e il montaggio locale (che parte dagli artwork a 1904×2544) resta
  l'unica strada per il Full HD.
- **Start Image e End Image**: si può dare il primo *e* l'ultimo fotogramma.
- **Add References: immagine, volto, indumento.** Il riferimento-volto è ciò
  che tiene l'identità di un eroe dentro una scena generata da zero — senza,
  si è incatenati allo sfondo dipinto dietro il suo ritratto.
- L'audio si genera; per noi va **spento** (la traccia è quella di Suno).
- **Un solo campo file, condiviso**: caricando una volta si riempiono Start
  *e* End insieme, e la seconda va svuotata a mano (la × compare passandoci
  sopra).
- **Non è gratis.** Generate apre «Unlock all models with Pro»: 1,99 $ per
  sette giorni, poi 29,99 $ al mese.

Il prompt del tentativo lungo — undici eroi in una ripresa sola, ognuno legato
al proprio riferimento — sta in `video/prompt-trailer-30s.txt`, e le art
numerate nell'ordine in cui il prompt le cita stanno in `video/sorgenti/`
(`R01-Elena.png` … `R11-Mora.png`): selezionandole tutte salgono già in ordine.

## Come si generano

1. **Seedance 2.5** su <https://davinci.ai/app/video?tab=templates&model=seedance-2-5>,
   modalità **image-to-video**: l'immagine di partenza non è un suggerimento,
   è il fotogramma zero. Senza, i volti non sono i nostri.
2. **Formato 16:9**, uscita 1920×1080.
3. **Ogni clip si genera a 5 secondi anche se ne servono 1,6.** Seedance non
   tiene l'identità del volto a lungo: verso la fine la faccia deriva. Si
   genera lungo, si tiene il pezzo buono, si butta la coda. Il montaggio taglia
   da solo (`scripts/video/monta-trailer.sh`).
4. **Le figure eroe si caricano INTERE, senza ritagliare.** L'arte è 3:4 con
   la figura in piedi: in una banda 16:9 non entrano insieme il viso (in alto)
   e le mani che lavorano (a metà). È il **carrello che sale** a mostrare
   prima il gesto e poi gli occhi — per questo il ritaglio lo farebbe a
   sproposito. Le due immagini che invece vanno preparate le fa
   `video/prepara-sorgenti.py`.
5. **Prima si genera Elena e si guarda.** Se la salita dalle mani agli occhi
   arriva in tempo e la faccia regge, il prompt è tarato per tutte le altre
   dieci. Un credito invece di undici.
6. Se la salita è troppo veloce: non chiedere «più lento», **allungare la
   generazione**. Il movimento di Seedance riempie la durata che gli dai.

---

## La scaletta e i tempi

| # | s | durata visibile | clip |
|--:|--:|--:|---|
| 1 | 0,00 | 4,55 | `01-citta` |
| 2 | 4,55 | 17,60 | gli undici eroi, 1,6 s l'uno, dissolvenze da 0,3 s |
| 3 | 22,15 | 4,85 | `13-adepto` |
| 4 | 27,00 | 3,00 | `14-sigillo` |

**Nessuna clip chiede più di 5 secondi**, ed è un vincolo, non un caso: una
dissolvenza sovrappone, quindi il montaggio prende `visibile + dissolvenza`
(4,55 + 0,15 = 4,70 per la città; 4,85 + 0,15 = 5,00 per l'Adepto). Se una
clip arriva più corta di così, ffmpeg **non dà errore**: salta l'incrocio, e
il file resta lungo 30 s perché è l'audio a tenerlo su mentre il video dentro
ne dura 26,6. Succede davvero — è successo il 13/08/2026 — e da allora
`monta-trailer.sh` misura i **fotogrammi**, non la durata dichiarata.

Cartelli a schermo, `IMFellEnglishSC`, in dissolvenza:

- **0,5-3,5 s** — «Roccamora, 1885. Sotto la città, qualcosa canta.»
- **20,0-22,0 s** — «Sei ore per capire dove. Poi si scende.»
- **27,5-30,0 s** — **OMBRE SU ROCCAMORA**

L'ordine degli eroi non è alfabetico: apre Elena (è il metodo), chiude Mora
(è l'acqua, e porta al canale dell'Adepto).

---

## Gli undici eroi

Prompt identico per tutti, cambia solo l'azione in `<AZIONE>`:

```
Start framed on the hands: <AZIONE>. The camera tilts slowly up to the face;
as it arrives, they raise their eyes to the lens and hold. One continuous
move, no cuts, no shake. Only the character and the flame move; the
background stays still. Candlelit, teal and amber, 19th century, film grain,
cinematic.
```

Negative, identico per tutti:

```
camera shake, fast motion, smiling, modern objects, text, watermark, extra
people entering frame, background changing, cuts, cartoon, plastic skin
```

| # | clip | immagine | `<AZIONE>` |
|--:|---|---|---|
| 02 | `02-elena` | `artworks/Elena.png` | `bent over something on the ground, lifting a magnifying lens, a candle in the other hand` |
| 03 | `03-attilio` | `artworks/Attilio.png` | `stitching a wound by candlelight, needle and thread in steady fingers` |
| 04 | `04-sibilla` | `artworks/Sibilla.png` | `an obsidian pendulum swinging over a city map, slowing, stopping dead` |
| 05 | `05-nino` | `artworks/Nino.png` | `ear pressed against a lock, picks in hand, one eye already on the door behind` |
| 06 | `06-ottone` | `artworks/Ottone.png` | `a butcher's cleaver coming down on the block, once, and staying there` |
| 07 | `07-carla` | `artworks/Carla.png` | `a camera flash bursting, lighting the face hard from below for an instant` |
| 08 | `08-lazzaro` | `artworks/Lazzaro.png` | `writing fast in a notebook while listening to someone off-frame, then the pen stops` |
| 09 | `09-celso` | `artworks/Celso.png` | `a worn priest's stole held in both hands in front of a closed door` |
| 10 | `10-fulgenzio` | `artworks/Fulgenzio.png` | `a jeweller's loupe lowered from the eye after examining a small trinket` |
| 11 | `11-ottavio` | `artworks/Ottavio.png` | `opening an old case file and finding his own signature at the bottom of the page` |
| 12 | `12-mora` | `artworks/Mora.png` | `pushing a punt forward with an oar, a ferret stirring awake in her coat pocket` |

Ognuno fa la cosa della propria biografia (`src/story.py`, `BIO_SCHEDA`): il
metodo di Elena, il bisturi di Marn, il pendolo di Sibilla, le serrature di
Nino, il banco di Ottone, il flash di Carla, i colloqui di Serra, la stola di
Marani, la lente di Carbone, i fascicoli riaperti di Brera, i canali di Mora.

---

## Le tre d'atmosfera

### 01 · la città — `video/sorgenti/01-citta.png`

Sorgente: `artworks/copertina spedizione.png` (2688×1792, già orizzontale).

```
Slow forward dolly over black canal water at night. Thin fog drifts right to
left. Lantern reflections tremble on the surface. A few distant windows
flicker. Nothing else moves. Cinematic, 19th century, muted teal and amber,
film grain.
```

Negative: `people walking, boats moving, camera shake, modern objects, text, watermark, fast motion`

### 13 · l'Adepto — `video/sorgenti/13-adepto.png`

Sorgente: `artworks/Adepto Incappucciato.png` (3:4, ritagliata da
`prepara-sorgenti.py` ancorando il cappuccio, non il centro).

```
The hooded figure is perfectly still for three seconds, then turns the head a
few degrees toward the lens and stops. Candle flame trembling. Very slow push
in. Dread, patient, no jump scare.
```

Negative: `sudden movement, jump scare, face fully revealed, gore, text, watermark, camera shake`

### 14 · l'emblema — `video/sorgenti/14-sigillo.png`

Sorgente: `artworks/Dorso Eroe.png` — che **non è un sigillo di ceralacca**
(così era scritto nel piano, sbagliando): è il dorso della carta Eroe, un
medaglione d'oro inciso con un vortice rosso al centro. È l'emblema della
Società del Lume, ed è meglio: il trailer chiude sulla cosa che i giocatori
avranno in mano tutta la sera.

```
Macro on an ornate gold medallion. The red vortex at its centre turns slowly,
like something breathing under glass. Gold filigree catches a low moving
light. Then the light drains and everything fades to black. Camera perfectly
still.
```

Negative: `hands, text, watermark, camera shake, fast rotation, sparks, bright light`

---

## Il montaggio

`scripts/video/monta-trailer.sh` — taglia ogni clip alla durata di tabella,
mette le dissolvenze, sovrappone i cartelli coi font del progetto, aggiunge
`video/musica.mp3` ed esce in `video/ombre-su-roccamora-30s.mp4`.

Vuole **ffmpeg installato** (`choco install ffmpeg` o `scoop install ffmpeg`):
lo script lo verifica e si ferma dicendolo.

La musica si genera su Suno col prompt in `video/PROMPT-SUNO-TRAILER.md`.
