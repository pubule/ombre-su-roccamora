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

## Da qui: prima lo strumento, poi la taratura

1. **il pathfinding del pilota intorno agli arredi interni** (blocca l'Atto I-II
   — Ep.1 e simili). Senza, gli 0% non sono affidabili;
2. limare l'Atto III dall'alto (11-18 tutti ≥93%): rendere pericolosa la
   cattura senza allungarla — leva delicata, tocca immersione;
3. Ep.16 da 91% verso la fascia; Ep.5/7 (spina lunga senza uscita segreta).

Ogni passo: misura Playwright (campione ≥60, il rumore a 16 è ±15) → diagnosi →
proposta etichettata → conferma → applica → rimisura.
