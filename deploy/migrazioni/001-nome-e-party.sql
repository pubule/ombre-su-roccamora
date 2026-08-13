-- 13/08/2026 — il nome del giocatore, e il party del tavolo.
--
-- `membri.nome`: al tavolo ci si chiama per nome, non per indirizzo email.
-- L'email serve ad Access per farti entrare; il nome serve a tutto il resto.
--
-- `tavoli.party`: gli eroi di QUESTA campagna, scelti una volta e sempre quelli.
-- Prima il party si sceglieva a ogni partita, e non c'era modo di sapere quali
-- eroi fossero assegnabili a un giocatore: si offrivano tutti e undici, e
-- assegnarne uno fuori squadra dava un telefono che non risponde — senza errore,
-- senza spiegazione. Lista JSON di nomi.
ALTER TABLE membri ADD COLUMN nome TEXT;
ALTER TABLE tavoli ADD COLUMN party TEXT;
