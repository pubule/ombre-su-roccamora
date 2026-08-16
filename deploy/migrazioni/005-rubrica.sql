-- 16/08/2026 — la rubrica: le persone in un posto solo.
--
-- Invitare qualcuno voleva dire riscrivere ogni volta nome ed email, e poi
-- ricordarsi di un passaggio che sta FUORI dall'app: aggiungere quell'indirizzo
-- al criterio di Cloudflare Access, o il codice d'accesso non gli arriva mai.
-- È successo lo stesso giorno con due amici: posto pronto al tavolo, porta
-- chiusa, e nessun segnale — né a loro né a chi arbitra. Il pezzo che vive
-- fuori dall'app è l'unico che si dimentica, quindi è quello che va portato
-- dentro.
--
-- Le persone stanno qui, una volta sola: da qui i tavoli pescano, e da qui si
-- apre la porta. La rubrica è di CHI ARBITRA (`proprietario`) e non globale —
-- una rubrica condivisa sarebbe un elenco di indirizzi altrui.
CREATE TABLE IF NOT EXISTS persone (
  proprietario TEXT NOT NULL,
  email        TEXT NOT NULL,
  nome         TEXT,
  creata       INTEGER NOT NULL,
  PRIMARY KEY (proprietario, email)
);

-- LA RUBRICA NASCE PIENA. Chi siede già ai tuoi tavoli è gente che hai già
-- invitato: chiedere di riscriverla per avere la rubrica sarebbe far pagare due
-- volte lo stesso lavoro. `INSERT OR IGNORE` la rende innocua a ogni rilancio —
-- e lo script delle migrazioni la rilancia a ogni deploy.
INSERT OR IGNORE INTO persone (proprietario, email, nome, creata)
  SELECT t.proprietario, m.email, m.nome, m.invitato
    FROM membri m JOIN tavoli t ON t.id = m.tavolo
   WHERE m.email <> t.proprietario;
