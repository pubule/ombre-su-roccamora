-- 14/08/2026 — la crescita degli eroi, per tavolo.
--
-- Stessa ragione dei Bivi: una casella spuntata dopo l'Ep.3 pesa fino
-- all'Ep.20, e il blob della partita è per episodio. Il Regolamento la promette
-- da sempre («dopo ogni episodio riuscito, ogni eroe spunta una casella») e
-- fino a oggi non aveva nessun posto dove stare.
--
-- UNA RIGA PER EROE, non una per casella. Le liste stanno in un campo di testo
-- perché è così che le tiene chi le legge — il motore vuole un array — e perché
-- una voce si ripete: Tempra ha quattro caselle, Fibra tre. Con una riga per
-- casella servirebbe un ordinale che non significa niente e che nessuno legge.
--
-- I PUNTI NON SI SCRIVONO. Quanti se ne sono guadagnati lo dicono i
-- salvataggi (un episodio riuscito = un punto, l'Ep.6 due); quanti se ne sono
-- spesi lo dice la somma dei prezzi delle caselle qui sotto. Tenerne un
-- contatore vorrebbe dire due conti della stessa cosa, e due conti divergono —
-- è la stessa scelta fatta per i Frammenti (store.frammentiConservati).
CREATE TABLE IF NOT EXISTS migliorie_campagna (
  tavolo      TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  eroe        TEXT NOT NULL,        -- il nome come sta su comune.json
  voci        TEXT NOT NULL DEFAULT '',   -- 'tempra:vigore,tempra:vigore,fibra'
  cicatrici   TEXT NOT NULL DEFAULT '',   -- 'acume,nervi' — restano, e non si spendono
  quando      INTEGER NOT NULL,
  PRIMARY KEY (tavolo, eroe)
);
