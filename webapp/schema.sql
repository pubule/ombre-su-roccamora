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
