-- Ombre su Roccamora — salvataggi sul server (vedi DESIGN-ACCOUNT-E-SALVATAGGI.md).
-- In SQLite liscio i vincoli di chiave esterna sono spenti di default, e
-- `PRAGMA foreign_keys = ON` qui non servirebbe a niente: vale per la singola
-- connessione, non per il database. D1 pero' li applica di suo — verificato il
-- 09/08/2026 cancellando un tavolo senza alcun PRAGMA nel lotto e ritrovando
-- zero salvataggi orfani. Se un giorno la cascata smettesse di scattare, e' li'
-- che va guardato, non in una riga di rito in cima al file.

CREATE TABLE IF NOT EXISTS tavoli (
  id            TEXT PRIMARY KEY,
  proprietario  TEXT NOT NULL,
  nome          TEXT NOT NULL,
  creato        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tavoli_proprietario ON tavoli(proprietario);

CREATE TABLE IF NOT EXISTS salvataggi (
  tavolo        TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  episodio      TEXT NOT NULL,
  aggiornato    INTEGER NOT NULL,
  dati          TEXT NOT NULL,
  PRIMARY KEY (tavolo, episodio)
);

-- CHI SIEDE AL TAVOLO (vedi DESIGN-VISTA-EROE.md).
--
-- Finora un tavolo aveva un solo `proprietario`, e l'autorizzazione era quella
-- riga: chi non era lui non esisteva. Qui ci sono gli altri — i giocatori che
-- entrano col proprio dispositivo e prendono in mano un eroe.
--
-- L'autorizzazione VERA sta qui e non in Cloudflare Access. Access dice solo
-- «questa email e' davvero di chi la usa» (OTP verificato); a decidere chi puo'
-- vedere un tavolo e' questa tabella. Cosi' invitare un giocatore non richiede
-- di aprire la dashboard di Cloudflare a ogni serata, e togliere qualcuno e'
-- una DELETE invece di una modifica alla policy.
--
-- `eroe` e' NULL finche' il giocatore non sceglie: gli eroi non reclamati
-- restano all'arbitro. `ruolo` distingue chi arbitra da chi gioca — l'arbitro
-- vede tutto, il giocatore vede la sua proiezione.
CREATE TABLE IF NOT EXISTS membri (
  tavolo        TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  eroe          TEXT,
  ruolo         TEXT NOT NULL DEFAULT 'giocatore',
  invitato      INTEGER NOT NULL,
  PRIMARY KEY (tavolo, email)
);
-- «quali tavoli posso vedere?» e' la domanda che si fa a ogni apertura
CREATE INDEX IF NOT EXISTS idx_membri_email ON membri(email);
-- `membri.eroe` NON SI LEGGE PIU' dal 15/08/2026: gli eroi di un posto stanno in
-- `eroi_posto` qui sotto, che ne regge piu' d'uno (un iPad, due amici). La
-- colonna resta per i dati vecchi — toglierla in SQLite e' piu' rischioso che
-- lasciarla — e con lei l'indice, che non fa male a nessuno.
CREATE UNIQUE INDEX IF NOT EXISTS idx_membri_eroe
  ON membri(tavolo, eroe) WHERE eroe IS NOT NULL;

-- GLI EROI DI UN POSTO. Un dispositivo puo' giocarne piu' d'uno — due amici con
-- un iPad solo — ma un eroe ha UN POSTO SOLO, ed e' la meta' della regola che
-- regge la proiezione: se due posti tenessero lo stesso eroe, «chi puo' vedere
-- cosa» smetterebbe di avere una risposta. Sta nella chiave primaria, dove non
-- la dimentica nessuno.
CREATE TABLE IF NOT EXISTS eroi_posto (
  tavolo TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  email  TEXT NOT NULL,
  eroe   TEXT NOT NULL,
  PRIMARY KEY (tavolo, eroe)
);
-- «quali eroi ha questo posto?» si chiede a ogni richiesta del tavolo
CREATE INDEX IF NOT EXISTS idx_eroi_posto ON eroi_posto(tavolo, email);

-- LE SCELTE DEI BIVI, per tavolo. Un Bivio si decide a fine episodio e cambia
-- le regole di uno o piu' episodi successivi: la scelta appartiene alla
-- CAMPAGNA, non alla serata in cui e' stata presa. Per questo non sta nel blob
-- della partita — quello e' per episodio, e una scelta dell'Ep.8 deve poter
-- pesare fino all'Ep.20.
CREATE TABLE IF NOT EXISTS scelte_campagna (
  tavolo   TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  bivio    TEXT NOT NULL,
  opzione  TEXT NOT NULL,
  quando   INTEGER NOT NULL,
  PRIMARY KEY (tavolo, bivio)
);

-- LA CRESCITA DEGLI EROI, per tavolo. Stessa ragione dei Bivi: una casella
-- spuntata dopo l'Ep.3 pesa fino all'Ep.20, e il blob della partita e' per
-- episodio. Una riga per EROE e non per casella: le voci si ripetono (Tempra
-- ha quattro caselle) e chi le legge le vuole come lista.
--
-- I punti guadagnati e spesi non si scrivono: i primi li dicono i salvataggi,
-- i secondi la somma dei prezzi delle caselle. Due conti della stessa cosa
-- divergono — vale qui come per i Frammenti.
CREATE TABLE IF NOT EXISTS migliorie_campagna (
  tavolo      TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  eroe        TEXT NOT NULL,
  voci        TEXT NOT NULL DEFAULT '',
  cicatrici   TEXT NOT NULL DEFAULT '',
  quando      INTEGER NOT NULL,
  PRIMARY KEY (tavolo, eroe)
);
