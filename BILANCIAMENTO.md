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

## Conclusione sull'Atto I-II: difetto strutturale, non tarabile a leve (23/07 notte)

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
