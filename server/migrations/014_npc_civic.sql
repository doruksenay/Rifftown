-- Soğuk başlangıç: sosyal ve ekonomik NPC'ler (yargıç, aday, muhabir, ikinci el tüccarı).
ALTER TABLE characters ADD COLUMN npc_role TEXT, ADD COLUMN npc_key TEXT;
CREATE UNIQUE INDEX characters_npc_key_idx ON characters(npc_key) WHERE npc_key IS NOT NULL;

-- NPC'ye satılan eşyaların kaydı (günlük sınır için)
CREATE TABLE npc_sales (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id       TEXT NOT NULL,
  price         INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX npc_sales_char_idx ON npc_sales(character_id, created_at DESC);

-- Oyunun muhabirlerinin haberleri iki dilde (oyuncu yazıları tek dilde, yazıldığı gibi)
ALTER TABLE articles ADD COLUMN title_en TEXT, ADD COLUMN body_en TEXT;
