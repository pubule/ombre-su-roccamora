-- 13/08/2026 — le scelte dei Bivi, per tavolo.
--
-- Un Bivio si decide a fine episodio e cambia le regole di uno o più episodi
-- successivi: la scelta appartiene alla CAMPAGNA, non alla serata in cui è
-- stata presa, e sopravvive a tutti i salvataggi. Per questo non sta nel blob
-- della partita — quello è per episodio, e una scelta dell'Ep.8 deve poter
-- pesare sull'Ep.20.
--
-- Chiave (tavolo, bivio): si può cambiare idea finché l'episodio bersaglio non
-- è cominciato, e riscrivere sostituisce invece di accumulare. Al tavolo si
-- sigilla sul retro del Frammento, e anche lì la gomma esiste.
CREATE TABLE IF NOT EXISTS scelte_campagna (
  tavolo   TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  bivio    TEXT NOT NULL,        -- 'preludio', 'ep1', … : l'episodio che ha posto la domanda
  opzione  TEXT NOT NULL,        -- l'id dell'opzione scelta
  quando   INTEGER NOT NULL,
  PRIMARY KEY (tavolo, bivio)
);
