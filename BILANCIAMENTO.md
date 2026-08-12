# Bilanciamento della campagna — il tabellone

Stato del lavoro di taratura, episodio per episodio. Questo file è la memoria
del ciclo: le conversazioni si perdono, il tabellone no. Si rilegge prima di
decidere cosa toccare e si riscrive dopo ogni misura.

## Lo strumento (deciso il 22-23/07/2026)

Si misura con **Playwright** — `node webapp/misura-episodio.mjs epN <partite>`,
in parallelo — che pilota la **modalità digitale vera**: movimento, porte,
ingombri, Canto, obiettivi. I simulatori Python restano solo come prefiltro
veloce: davano 99% dove la plancia dà 8% (Ep.1), perché regalano una tessera a
round e non vedono lo spazio.

Il pilota è pulito su 21/21 (0 stalli, 0 corse NON VALIDE). Un audit intero —
21 episodi × 16 partite — costa pochi minuti in parallelo.

| KPI | strumento | bersaglio |
|-----|-----------|-----------|
| giocabilità | vittoria totale (piena + parziale) | **70-80%** a 4 eroi |
| finale vero | % vittoria **piena** (episodi a due finali) | **40-60%** |
| ansia | picco di eroi a terra | **≥ 1.0** (tranne i non letali) |

`*` = episodio a **tensione non letale**: la posta è un arresto, una fuga, un
teste da non perdere, non la morte degli eroi. Lì il picco non si applica —
misurarli col sangue porterebbe a insanguinarli. Per loro l'ansia è
l'incertezza dell'esito (la fascia della piena).

Coinvolgimento e immersione **non hanno numero**. Ogni modifica passa da una
domanda, e ogni leva è etichettata *taratura* (numeri) o *struttura* (cos'è
l'episodio). Il precedente che lo impone: il 22/07 l'uscita segreta portò l'Ep.4
dal 4% al 97% cancellando l'inseguimento del Suggeritore — il KPI diceva
«risolto», il gioco era peggiorato.

## La prima fotografia vera (23/07/2026)

4 eroi, indagine media (`preparati`), 16 partite per episodio, sul motore
digitale completo. **Questa è la riga di partenza: tutti i numeri di prima di
oggi erano su un gioco incompleto** — 15 episodi senza condizione di vittoria,
10 boss inesistenti, il Preludio non montabile, tutto costruito il 22-23/07.

| ep | vittoria | piena | picco | round |
|----|---------:|------:|------:|------:|
| preludio | 37% | — | 1.7 | 12 |
| EP1 | 23% | — | 2.4 | 19 |
| EP2 | 66% | — | 1.5 | 12 |
| EP3 | 68% | — | 1.7 | 14 |
| EP4 | 35% | — | 1.7 | 18 |
| EP5 | 6% | — | 2.4 | 21 |
| EP6 | 50% | — | 1.6 | 18 |
| EP7 | 0% | — | 2.8 | 16 |
| EP8 | 7% | — | 2.4 | 16 |
| EP9* | 12% | — | 1.8 | 12 |
| EP10 | 0% | — | 0.2 | 11 |
| EP11 | 87% | — | 0.2 | 11 |
| EP12 | 81% | — | 0.0 | 7 |
| EP13 | 100% | — | 0.2 | 9 |
| EP14* | 100% | 62% | 0.1 | 9 |
| EP15* | 100% | 75% | 0.3 | 9 |
| EP16 | 14% | — | 2.3 | 21 |
| EP17 | 100% | 0% | 0.5 | 11 |
| EP18* | 100% | 0% | 0.5 | 12 |
| EP19* | 68% | 68% | 0.8 | 14 |
| EP20 | 0% | — | 0.7 | 14 |

**Nessun episodio è esattamente in fascia.** I più vicini: Ep.2 (66%) ed Ep.3
(68%), a un soffio dal 70%.

## Il pattern, e cosa ne so distinguere

Gli episodi si spaccano in due blocchi che seguono la **struttura**, non la
taratura:

- **Atto I-II — spina lunga, boss da combattere: tutti troppo duri.**
  Round 12-21, picco 1.5-2.8. Ep.5 al 6%, Ep.7/10/20 allo 0%. Qui c'è vera
  tensione (il picco è alto) ma si perde troppo: la spina è più lunga del tempo
  e della salute disponibili.

- **Atto III — cattura di una miniatura: tutti troppo facili E piatti.**
  Round 7-11, picco **0.0-0.5**: non cade quasi mai nessuno. Ep.11 87%, Ep.13
  e 14 e 15 e 17 e 18 al 100%.

**Il picco 0.0-0.5 dell'Atto III è in parte design-legittimo**, verificato:
l'Ep.12 vince in 6 round perché «il Corriere fugge, non combatte» (obiettivo),
e l'Ep.13 vince prendendo i registri senza affrontare il Sorvegliante perché
l'obiettivo dice «superate O abbattete». Non sono bug del pilota. Ma se un
intero atto si vince senza che nessuno rischi niente, l'ansia — uno dei quattro
KPI — è a zero per un terzo della campagna.

## Note sui singoli

- **Ep.7 e Ep.20 allo 0% con picco alto**: si muore, non si arriva. Duri per
  davvero, non per un difetto.
- **Ep.10 allo 0% con picco 0.2**: NON si muore — la traccia Demolizione scade
  prima. È l'orologio, non il combattimento.
- **Ep.14/17/18 al 100% totale ma piena bassa** (62%, 0%, 0%): la vittoria vera
  non si raggiunge, solo quella amara. Ep.17 e 18 a 0% di piena — il secondo
  obiettivo (Notaio, arresto) non si chiude in tempo. Le soglie alzate il 22/07
  vanno rimisurate ORA sulla plancia, non sul simulatore.
- **Ep.19 a 68%/68%**: l'unico dell'Atto III con un picco decente (0.8) e la
  piena in fascia. Il più vicino a «sano» del suo blocco.

## La diagnosi dell'Atto I-II duro (23/07/2026, sera)

Misura stabile dopo i fix del ritorno: Atto I-II tutto duro (25-62%, picco
1.4-2.9), Atto III tutto facile (93-100%, picco 0.0-0.5). Ma scavando gli 0%:

**Ridurre la letalità NON porta in fascia.** Provato dan-1/dan-2 su Ep.1, 5, 7,
10: il picco va a 0.0-0.2 (nessuno muore) e le vittorie restano 20-29%. La
letalità **non è mai la causa della sconfitta**. Confermato su quattro episodi.

**La causa vera è che il gruppo non completa in tempo.** Tutti perdono al round
~18-20. Con nemici innocui, gli eroi sopravvivono ma:
- **Ep.1**: si impantana a T5 e non passa a T6. T5 ha `exits {N:T6}` ma QUATTRO
  arredi «scala» nel centro (1,1)(1,2)(2,1)(2,2): il pilota si ammassa a T5(1,0)
  sotto le scale e non trova la colonna libera per salire alla porta N. **È il
  pathfinding del pilota che non aggira gli arredi interni** — al tavolo un
  umano sale dal lato. Difetto dello strumento, non del gioco.
- **Ep.7**: il ritorno di 8 tessere non si compie (spina troppo lunga, e niente
  uscita segreta perché la via del ritorno È l'episodio).

**Quindi il prossimo blocco è STRUMENTO, non taratura**: il pilota deve
navigare intorno agli arredi che spezzano una tessera. Finché non lo fa, gli
0% dell'Atto I-II non sono numeri di gioco affidabili — sono il pilota che si
incastra.

## Progressi applicati (23/07)

- **Ep.16**: uscita segreta, 20% → 91% (ora troppo facile, da limare).
- **fix del ritorno**: il PNG liberato torna alla META, non alla prigione —
  impatta tutti gli episodi con scorta a ritorno classico.
- **Ep.10**: PROVA corretta 7→14 + Macchina + guardiano (resta 0%, limite
  strutturale: spina di 6 tessere incompatibile con la traccia 14).

## SVOLTA: la regola stop-pesca trasforma l'Atto I-II (23/07 notte, aggiornamento)

La proposta del committente — **obiettivo completato → non si pesca più
Minaccia** (feat 699d7e6a) + il fix del trigger (PNG liberato, non uscita
aperta, feat 6d9bd211) — ha fatto ciò che sei leve mie non erano riuscite.
Consolidamento a 18 partite/episodio:

| ep | pre-regola | dopo | Δ |
|----|-----------:|-----:|---:|
| preludio | 37% | 55% | +18 |
| ep1 | 12% | 44% | +32 |
| ep4 | 8% | 55% | +47 |
| **ep5** | 16% | **72%** | in fascia |
| ep6 | 41% | 66% | +25 |
| ep7 | 0% | 0% | +0 |
| ep8 | 25% | 66% | +41 |
| ep9 | 25% | 44% | +19 |
| ep16 | 100% | 100% | (facile) |

Media da ~24% a ~55%, **Ep.5 in fascia**, e — cosa che nessuna leva mia aveva
ottenuto — **nessuno più allo 0% tranne l'Ep.7**. Cinque episodi a 44-66%, a un
passo (il rumore a 18 partite è ±15).

**Perché funziona dove le mie leve fallivano:** loro curavano sintomi (salute,
coesione, navigazione); questa colpisce il MECCANISMO — la pressione illimitata
nel tempo. Completato l'obiettivo, il mazzo tace e il gruppo ha la finestra per
estrarsi. Precedente: Pandemic (obiettivo tolto = minaccia tolta) + crescendo-
relief di L4D/Zombicide.

## CORREZIONE (23/07): la consolidazione era in parte misura di bug del pilota

Attaccando l'Ep.7 (0%) ho trovato DUE bug del pilota negli episodi col PNG da
RIPORTARE indietro e nessuna uscita segreta (fix 2af063a9):
1. `versoArredi` (caccia all'arredo dell'uscita segreta) scattava anche dove
   l'uscita non esiste: gli eroi puntavano la cella-prigione invece di scortare
   verso la meta;
2. il PNG scortato non aveva il fallback porta-cella degli eroi: `versoMeta` lo
   spingeva in un angolo da cui la porta e' oltre gli arredi, e restava piantato
   mentre gli eroi tornavano sani alla meta.

Rimisura appaiata degli episodi impattati (PNG liberato + nessuna uscita
segreta), 60 partite/episodio, tutte VALIDE:

| ep | consolidazione (buggy) | CORRETTO | perche' |
|----|-----------------------:|---------:|---------|
| preludio | 55% | **33%** | il 55% era in parte gli eroi che cacciavano arredi inesistenti |
| ep4 | 55% | 55% | invariato (Gaspare con uscita domina; fix di Rocco marginale) |
| ep7 | 0% | **20%** | i due bug lo schiacciavano a 0; ora numero genuino |
| ep9 | 44% | **32%** | non letale; anche qui il buggy era gonfiato |

Gli episodi con PNG dotato di uscita segreta (ep1/2/3/16) NON sono toccati:
`versoArredi` resta valido (SC.uscita vero) e il fallback e' gated da
`!spec.uscita`. Il quadro ONESTO dell'Atto I-II e' piu' basso di stanotte:
preludio ed ep9 erano gonfiati dai bug. Da qui in poi si tara sul corretto.

**I due residui, cause DIVERSE dal ritorno:**
- **ep7 (0%)**: la spina di **8 tessere** (la più lunga) — Fava liberato solo al
  round 12, quando il gruppo e' gia' decimato (2 eroi, salute 3). La regola
  scatta troppo tardi perche' la LIBERAZIONE arriva tardi. Collo = lunghezza
  della marcia, non ritorno. E l'Ep.7 non puo' avere l'uscita segreta (la via
  del ritorno scelta in T2 e' il suo design). Serve una leva sulla marcia.
- **ep16 (100%)**: l'uscita segreta lo ha reso una passeggiata. Da limare
  dall'alto.

**Nota metodo:** «obiettivo completato» va STAMPATO nel Regolamento (regola
comune, il motore la applica gia' a tavolo e digitale). ~~TODO~~ **FATTO
(25/07)**: due box nuovi nel Regolamento — «Obiettivo compiuto: il mazzo
Minaccia tace» e «Al culmine del Canto non arrivano piu' rinforzi» — piu' una
riga di sintesi nell'Aiuto-Giocatore. Verificato sul PDF renderizzato.

## [storico] Conclusione superata: «difetto strutturale non tarabile» (23/07 sera)

Applicata **una** leva utile — lo **stop-spawn al Canto massimo** (feat 05b6cc58):
quando il rituale è al culmine il mazzo non schiera più rinforzi, che nel finale
prolungato entravano all'infinito dietro il gruppo (18 nemici dopo il round 14
sull'Ep.1). Aiuta diffusamente, misurato su 24 partite: Preludio +21, Ep.4 +25,
Ep.5 +13, Ep.8 +8, Ep.16 → 100%. Ma **nessun episodio arriva in fascia**: restano
tutti duri (Ep.1 ~12%, Preludio ~37%, Ep.4/5/8 ~30%, Ep.7 0%).

**Cinque altre leve provate e REVOCATE** (tutte bocciate dalla misura):
salute_extra (+2/+4: sistema la marcia, T6 mai 12→5, ma non l'apertura), uscita
a un arredo (arredo_noto: nessun effetto), coesione rozza (chi è avanti aspetta:
3%), coesione del PNG nel ritorno (2%: aspetta chi è a terra, non chi è lento),
soglia di rianimazione abbassata (nessun effetto).

**La causa vera, vista col logging (non dedotta):** nel finale/ritorno il gruppo
si sfalda — 2-3 eroi a terra sparpagliati su tessere diverse, uno o due
superstiti che non bastano a scortare il PNG E rianimare. NON è navigazione né
coesione del pilota: **gli eroi che restano indietro sono MORTI, non lenti.**
Aspettarli non serve. E rianimarli non basta (un superstite non copre e rianima
insieme sotto pressione).

**Conclusione onesta:** l'Atto I-II ha una difficoltà STRUTTURALE — spina lunga
+ ritorno + finale sotto pressione crescente — che nessuna singola leva risolve.
Le decisioni che restano non sono tarature di un numero ma **scelte di design**
(accorciare le spine? uscite segrete ovunque, come Ep.1-4-16? cambiare la
struttura andata-ritorno?), da prendere col committente. Il loop autonomo ha
raggiunto il suo limite su questo atto: continuare a provare leve puntuali è
inefficace.

## Diario del muro (dettaglio, 23/07 sera)

Imbuto dell'Ep.1 misurato su 32 partite: **12 muoiono in marcia** (picco 3,
quasi-wipe), e degli altri **~metà non apre l'uscita segreta**. Tracciando: al
finale **un solo eroe arriva in T6**, gli altri restano sparpagliati fra T4/T5 e
muoiono isolati. **Il gruppo si divide.**

Due colli distinti, entrambi diagnosticati:
- **marcia decima** → `salute_extra` +2 la risolve (T6 mai 12→5), leva pronta
  ma non applicata;
- **apertura uscita fallisce** → NON è letalità né navigazione: è il pilota che
  sparpaglia, un solo eroe in T6 non basta a liberare + cercare l'arredo +
  aprire sotto il fuoco.

**Tre euristiche di coordinamento provate e REVOCATE** (tutte bocciate dalla
misura): puntare sempre la porta, BFS reale sostitutiva, coesione (chi è avanti
aspetta → 3%, il gruppo non arriva). Un pilota greedy per-eroe non produce gioco
di squadra, e l'Atto I-II lo richiede.

**Conseguenza per la taratura**: finché il pilota gioca a pezzi, i numeri
dell'Atto I-II **sottostimano** la difficoltà — un tavolo umano coordinato fa
meglio. Tarare al rialzo su questi numeri renderebbe il gioco troppo facile per
gli umani. **Serve un pilota che coordini la squadra** prima di poter tarare
l'Atto I-II al punto percentuale.

## Applicato oggi (23/07)

- **Ep.16**: uscita segreta 20%→91% (da limare dall'alto);
- **Ep.1**: canto_ogni 6 (boss non desto in anticipo) + PNG entra nell'uscita,
  8%→20%; il campo `salute_extra` e la leva marcia restano pronti ma inapplicati
  finché il pilota non coordina;
- fix del ritorno (PNG alla meta); fallback sul varco (naviga intorno agli
  arredi).

## Da qui

1. **il pilota deve coordinare la squadra** (tenere il gruppo compatto SENZA
   fermare la marcia — le tre euristiche semplici hanno fallito, serve qualcosa
   di più fine). È il blocco dell'Atto I-II;
2. limare l'Atto III dall'alto (11-18 tutti ≥93%): dove il pilota gioca bene
   (episodi corti, meno coordinamento) i numeri sono affidabili — si può tarare;
3. Ep.16 da 91% verso la fascia.

Nota: l'Atto III (episodi corti) è tarabile ORA — il pilota lì gioca bene. Forse
conviene invertire: chiudere l'Atto III facile prima dell'Atto I-II, che è
bloccato dallo strumento.

Ogni passo: misura Playwright (campione ≥32, il rumore a 16 è ±15) → diagnosi →
proposta etichettata → conferma → applica → rimisura.

---

# 09/08/2026 — la mappa rifatta, e la decisione sul metodo

Rimisurata **tutta** la campagna con `webapp/mappa-pilota.mjs` (nuovo: rifà i 21
episodi in ~30 min, a gruppi di 4 in parallelo — non si contendono niente,
ognuno ha la sua chiave di salvataggio). Prima si ritoccava a pezzi e si leggeva
come se fosse coerente.

## La decisione (09/08)

**La banda resta il riferimento, ma non è più il giudice.** Il pilota filtra: dice
dove guardare, e lo dice bene. Non dice se l'episodio è bello, se l'ansia c'è, se
il tavolo ha capito la scena — e questa campagna ha quattro KPI, di cui uno solo
ha un numero. **Le decisioni di taratura si prendono su partite vere.**

Motivo pratico, non di principio: su **tre** episodi aperti sospettando uno
sbilanciamento — Ep. 10, Ep. 11, Ep. 20 — **tre volte** il motore stava giocando
qualcosa di diverso da quello stampato. Nessuno dei tre era un problema di
numeri. Se il pilota avesse avuto l'ultima parola, avrei tarato tre episodi sani
per compensare tre bug.

**Regola operativa, prima di toccare qualunque numero:** verificare che il motore
stia giocando l'episodio del fascicolo. Le tre infedeltà trovate erano tutte
della stessa specie — una regola stampata che il digitale non applicava, o una
che applicava a modo suo.

## Cosa ha spostato la mappa, e non è il gioco

La correzione `=== soglia` → `>= soglia` fa scattare il boss anche quando il
Canto la supera con un salto. **Prima, in quei casi, il boss non si destava mai.**
Gli episodi non sono diventati più duri: hanno smesso di essere più facili di
quanto dichiaravano. Metà campagna è scesa per questo, e i numeri di prima erano
gonfiati.

| ep | 09/08 | 24/07 | | ep | 09/08 | 24/07 |
|---|---|---|---|---|---|---|
| preludio | 33% | — | | 11 | **35%** | 95% |
| 1 | 45% | 65% | | 12 | 58% | — |
| 2 | 83% | 75% | | 13 | 83% | 87% |
| 3 | 83% | 75% | | 14 | 100% | 100% |
| 4 | 20% | 60% | | 15 | 15% | 60% |
| 5 | 42% | 55% | | 16 | 100% | — |
| 6 | 50% | 60% | | 17 | 92% | 100% |
| 7 | 25% | 30% (voluto) | | 18 | 100% | 100% |
| 8 | 67% | 60% | | 19 | 65% | 95% |
| 9 | 10% | — | | 20 | 25% | riscritto |
| 10 | **25%** | — | | | | |

I tre riparati oggi (10, 11, 20) sono in grassetto o riscritti: nessuno per
taratura, tutti per fedeltà al fascicolo.

## Le partite vere: cosa devono rispondere

Il pilota **non gioca l'Indagine**, la simula come esito. Quindi tutta la metà
investigativa della serata — le sei ore, le serrature, gli Approfondimenti, le
quattro Domande — non è mai stata misurata da nessuno. È lì che va guardato per
primo.

Ordine consigliato, per quanto è incerto ciò che si scoprirebbe:

1. **Ep. 13 → 15, alla cieca** (già [[N-02]] nel registro). L'Ep. 15 è un falso
   finale: il gruppo deve arrivare a incolpare un innocente e crederci. È
   l'unica cosa che nessuno strumento può misurare — o il tavolo ci casca, o il
   depistaggio non esiste. Il depistaggio è stato rimontato il 09/08 e non l'ha
   mai provato nessuno.
2. **Ep. 20**, il finale. Sta a 25% e la domanda non è la percentuale: è se la
   corsa fra controcanto e risveglio si *senta*, e se spezzare il coro venga in
   mente al tavolo prima che sia tardi.
3. **Un episodio dell'Atto I** (Ep. 4 o Ep. 5, ora al 20-42%): lì il pilota gioca
   peggio — non sa coordinare la squadra — quindi i suoi numeri bassi possono
   essere un limite dello strumento e non del gioco.

Per ogni sessione, riportare qui: quante ore restavano a fine Indagine, quante
Domande esatte, dove il tavolo si è fermato a discutere, dove si è annoiato, e
se qualcuno ha detto ad alta voce la cosa che l'episodio voleva far dire.

---

# 12/08/2026 — il bilanciamento fra le CLASSI (referto: AUDIT-CLASSI.md)

Domanda nuova, che la mappa per episodio non poteva porre: **con quali quattro
eroi si può giocare?** Undici eroi, squadre da quattro: 330 combinazioni.

Due strumenti nuovi, perché non ce n'erano:

- `webapp/misura-classi.mjs` — il pilota con `PARTY=` fisso, 5 squadre estreme
  × 12 episodi × 20 partite. **1200 partite.**
- `webapp/misura-indagine-classi.py` — l'Indagine, che il pilota non gioca:
  il conto esatto delle regole di `indagine.js` con dadi veri, su tutte e 330
  le squadre × 21 episodi. Non è un pilota ed è dichiarato tale.

## Il difetto dello strumento trovato prima del risultato

La prima tornata dava sull'Ep. 9 uno 0% contro 90%, riproducibile. Non era la
squadra: erano **gli stessi quattro eroi in ordine diverso** (60% contro 10%).
`iniziaPartita()` piazza gli eroi sulla tessera d'ingresso nell'ordine del
party (`digitale.js:328`); per un tavolo umano è irrilevante, per un pilota
che punta la meta e va decide chi tira il gruppo. Ora `misura-episodio.mjs`
**rimescola l'ordine a ogni partita** anche con `PARTY=` fisso.

Misurato di conseguenza il **rumore reale**: quattro corse identiche della
stessa squadra sullo stesso episodio danno 20-25-30-40%. **A 20 partite la
singola casella non significa niente**; conta la media su dodici episodi.

## Il risultato

| squadra | VIGORE | Salute | NERVI | vittorie (240 partite) |
|---|--:|--:|--:|--:|
| ferro (ottone, mora, nino, marn) | 10 | 29 | 6 | **54%** |
| misto (elena, ottone, marn, sibilla) | 7 | 27 | 9 | 45% |
| muti (nino, marani, carbone, mora) | 7 | 26 | 8 | 44% |
| occulto (sibilla, marani, carbone, serra) | 4 | 24 | 11 | 38% |
| vetro (elena, carla, serra, brera) | 4 | 24 | 8 | **33%** |

**Monotòna nel VIGORE, senza inversioni.** 21 punti fra gli estremi, con
incertezza ~3: sei volte il rumore. Il NERVI **non compensa** — «occulto» ha
il NERVI massimo della campagna ed è la seconda peggiore — benché il gioco
chieda 92 prove di NERVI contro 29 di VIGORE. Il contrappeso è progettato e
non funziona: +21% di colpi a segno si applica due volte per round per eroe,
la penalità NERVI solo quando esce la carta, e la Salute sta dalla stessa
parte del VIGORE invece che dall'altra.

**Quattro episodi si chiudono a chi non picchia**: Ep. 9, 11, 15, 19 — vetro
fra 0% e 20%, ferro fra 35% e 65%. Chiedono tutti la stessa cosa (fermare
qualcuno in fretta) e nessuno offre una strada che non sia la mischia.

## Perché NON si tara adesso

In modalità digitale **tre abilità di Spedizione** (Voce ferma di Serra, Esca
preziosa di Carbone, Colpo da macello di Ottone) e **nove oggetti personali**
sono stampati sulla carta dell'eroe e il motore non li applica. Serra e
Carbone spendono carica e azione per niente. Cinque dei nove oggetti sono
difensivi e stanno in mano agli eroi fragili. Il 33% della squadra di vetro è
quindi la misura del gioco **incompleto**: prima si accende, poi si rimisura,
e solo dopo si decide se c'è un numero da toccare.
