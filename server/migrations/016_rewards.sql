-- Para dışı ödüller ve karakterli zincirler.
-- chain_claims.choice: seçimli zincir adımında seçilen seçenek (hikâyenin dalı buna göre gelir).
-- characters.title_id: oyuncunun seçtiği ünvan (kazanılmış ünvanlar başarım ve zincir kayıtlarından hesaplanır).
ALTER TABLE chain_claims ADD COLUMN choice TEXT;
ALTER TABLE characters ADD COLUMN title_id TEXT;
