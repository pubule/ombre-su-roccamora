Copia locale statica di Card Conjurer (https://cardconjurer.app/), usata per
generare le carte del gioco senza dipendere dal sito restando online.

Perche': Card Conjurer e' un progetto open source (originariamente di
shopglobal, github.com/shopglobal/cardconjurer, licenza GNU GPLv3). Il sito
storico cardconjurer.com e' gia' stato chiuso una volta (novembre 2022, dopo
una diffida) prima di essere rimesso online altrove: dipendere in eterno da
un sito di terzi per generare le carte del gioco e' un rischio concreto, gia'
verificatosi.

Come e' stata creata: mirror byte-per-byte degli asset (HTML/CSS/JS/img/font)
serviti da cardconjurer.app durante il nostro identico flusso di generazione
(selezione frame Tokens > Marker Card, upload arte, testo), scaricati via
Playwright — non e' un fork scaricato da GitHub: i fork attivi su GitHub
pesano diversi GB (includono centinaia di frame per ogni set Magic storico)
mentre qui ci sono solo i ~5 MB di asset che il nostro flusso usa davvero.

Uso: node scripts/cardconjurer/serve.js avvia un server statico su
localhost:4242; generate-card.js / generate-batch.js / generate-test.js lo
avviano gia' da soli, non serve lanciarlo a mano.

Se un giorno serve aggiornare/estendere (nuovi frame, font), il sito vero
resta https://cardconjurer.app/ come riferimento, oppure i sorgenti completi
su GitHub (cercare "cardconjurer" — piu' fork attivi, licenza GPLv3).
