# Riepilogo batch multi-seed (10 seed a combinazione) — round 3

Generato: 2026-07-14T16:00:34

| Batch | Eroi | Formula | Scala nemici | Pool extra | % Custode anticipo | Pool esauriti (media/picco) | Round medi | Eroi a terra medi | % Vittoria |
|---|---|---|---|---|---|---|---|---|---|
| batch-08_formula-standard | 8 | standard | nessuna | no | 50% | 0.1 / 1 | 8.4 | 0.1 | 100% |
| batch-10_formula-standard | 10 | standard | nessuna | no | 0% | 0.7 / 2 | 8.7 | 0.2 | 100% |
| batch-08_formula-tetto4 | 8 | tetto4 | nessuna | no | 10% | 0.0 / 0 | 8.8 | 0.0 | 100% |
| batch-10_formula-tetto4 | 10 | tetto4 | nessuna | no | 0% | 0.0 / 0 | 8.5 | 0.0 | 100% |
| batch-08_formula-tetto3 | 8 | tetto3 | nessuna | no | 10% | 0.1 / 1 | 8.5 | 0.0 | 100% |
| batch-10_formula-tetto3 | 10 | tetto3 | nessuna | no | 0% | 0.0 / 0 | 8.4 | 0.0 | 100% |
| batch-02_tetto4_nessuna | 2 | tetto4 | nessuna | no | 0% | 0.0 / 0 | 11.5 | 0.6 | 70% |
| batch-02_tetto4_lieve | 2 | tetto4 | lieve | no | 0% | 0.0 / 0 | 11.8 | 0.5 | 80% |
| batch-02_tetto4_marcata | 2 | tetto4 | marcata | no | 0% | 0.0 / 0 | 11.5 | 0.4 | 80% |
| batch-04_tetto4_nessuna | 4 | tetto4 | nessuna | no | 0% | 0.0 / 0 | 9.6 | 0.1 | 100% |
| batch-04_tetto4_lieve | 4 | tetto4 | lieve | no | 0% | 0.0 / 0 | 9.7 | 0.0 | 100% |
| batch-04_tetto4_marcata | 4 | tetto4 | marcata | no | 10% | 0.0 / 0 | 9.8 | 0.2 | 100% |
| batch-06_tetto4_nessuna | 6 | tetto4 | nessuna | no | 10% | 0.1 / 1 | 9.2 | 0.0 | 100% |
| batch-06_tetto4_lieve | 6 | tetto4 | lieve | no | 10% | 0.1 / 1 | 9.5 | 0.1 | 100% |
| batch-06_tetto4_marcata | 6 | tetto4 | marcata | no | 10% | 0.2 / 1 | 8.6 | 0.0 | 100% |
| batch-08_tetto4_nessuna | 8 | tetto4 | nessuna | no | 40% | 0.2 / 1 | 8.9 | 0.1 | 100% |
| batch-08_tetto4_lieve | 8 | tetto4 | lieve | no | 50% | 0.5 / 2 | 10.7 | 1.6 | 90% |
| batch-08_tetto4_marcata | 8 | tetto4 | marcata | no | 40% | 0.8 / 3 | 11.9 | 2.7 | 80% |
| batch-10_tetto4_nessuna | 10 | tetto4 | nessuna | no | 0% | 0.0 / 0 | 8.5 | 0.0 | 100% |
| batch-10_tetto4_lieve | 10 | tetto4 | lieve | no | 0% | 0.5 / 1 | 9.3 | 0.2 | 100% |
| batch-10_tetto4_marcata | 10 | tetto4 | marcata | no | 0% | 0.5 / 2 | 10.6 | 5.1 | 60% |

Ogni riga = 10 simulazioni con lo stesso party/formula/scalatura, seed diversi, aggregate (media, percentuale, picco). Solo il primo seed di ogni batch scrive log dettagliati su disco (`<batch>_seed0/`), gli altri 9 solo contribuiscono ai numeri qui.
Le formule di scalatura (`NEMICO_SCALE_FORMULE`) danno bonus 0 fino a 5 eroi per costruzione: le righe a 2/4 eroi sono il controllo "nessun cambiamento atteso" (nessuna/lieve/marcata devono coincidere), 6 e' il limite della soglia (ancora 0 in entrambe le formule attuali), 8/10 sono dove le formule iniziano davvero a differire.
