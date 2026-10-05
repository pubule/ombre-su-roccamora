# Final fix report

1. Anteprima notte: CASO_ANTEPRIMA fisso in intenzioni(); nemici.js aggiunge attacco.candidati (additivo); nemiciHtml dice "colpira' uno di voi" con >1 candidato, nome con 1. Commento aggiornato. Test in test-hud-spedizione.mjs (20 render, 2 candidati: identico e "uno di voi"; 1 candidato: nome). Sabotaggio (CASO casuale + UI che nomina sempre) -> 2 FAIL, ripristinato. Nota: il solo ripristino di Math.random NON fa fallire il test, perche' la UI neutra non nomina piu' nessuno (e' il punto).
2. export-data.py: scena filtrata a decori/arredi (gli unici letti: ambiente-fa.js:64, stanza.js:34). test-scenografia.mjs legge perche dal sorgente e ora asserisce che nei dati esportati non c'e'.
3. digitale.js: tetti = sp.rivelate.some(alAperto(tileDi)). test-plancia-fa parte4(false/true). Nota: il test esistente passava solo grazie al bug (Ep.11 T1 non e' aperta). Sabotaggio -> FAIL, ripristinato.

Verifiche: export-data, test-scenografia, test-stanza, test-ambiente OK; hud-spedizione, plancia-fa, luce, posto-eroe OK (server 8017); telefono-azioni OK (wrangler dev 8787 dopo build-dist). Server fermati.
Concern: con caso fisso e PNG vulnerabile adiacente + eroe adiacente, l'anteprima segue sempre il ramo PNG (prima 50/50); ramo gia' non gestito dalla UI (attaccoPng).
