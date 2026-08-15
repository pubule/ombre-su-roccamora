-- 15/08/2026 — un dispositivo, più eroi.
--
-- Due amici con un iPad solo vogliono giocarci i loro due eroi. Finora non si
-- poteva, e la regola non stava nel codice ma qui: `membri` ha la chiave
-- primaria (tavolo, email) e una colonna `eroe` sola. Era una regola giusta per
-- metà — «un eroe non può essere di due posti» deve restare, «un posto non può
-- avere due eroi» no.
--
-- Il posto resta il posto (chi siede, con che ruolo, invitato quando). Gli eroi
-- diventano una relazione a parte, e la metà da tenere ci sta dentro come
-- CHIAVE: (tavolo, eroe) unica vuol dire che quell'eroe ha un posto solo. È la
-- stessa scelta dell'indice unico che sostituisce — le regole che si possono
-- mettere nel database ci vanno messe, perché lì non le dimentica nessuno.
CREATE TABLE IF NOT EXISTS eroi_posto (
  tavolo TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  email  TEXT NOT NULL,
  eroe   TEXT NOT NULL,
  PRIMARY KEY (tavolo, eroe)
);
-- «quali eroi ha questo posto?» si chiede a ogni richiesta del tavolo
CREATE INDEX IF NOT EXISTS idx_eroi_posto ON eroi_posto(tavolo, email);

-- i posti che un eroe ce l'hanno già lo tengono: la serata di stasera non deve
-- accorgersi di niente
INSERT OR IGNORE INTO eroi_posto (tavolo, email, eroe)
  SELECT tavolo, email, eroe FROM membri WHERE eroe IS NOT NULL;

-- `membri.eroe` da qui in poi NON SI LEGGE PIÙ. Resta nella tabella perché
-- toglierla in SQLite è più rischioso che lasciarla, ma il codice guarda solo
-- `eroi_posto`: due conti della stessa cosa divergono, ed è la ragione già
-- scritta in 003-migliorie.sql per i punti delle Migliorie.
