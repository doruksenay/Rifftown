-- Haftalık görevler oyuncunun durumuna göre seçilir (playtest O-2). Seçim haftanın ilk bakışında saklanır ki hafta
-- içinde grup kurmak ya da arkadaş edinmek görevleri değiştirmesin. Yalnızca ekleme; eski haftalar için satır yok.
CREATE TABLE IF NOT EXISTS mission_weeks (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  week_id       BIGINT NOT NULL,
  mission_ids   TEXT[] NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, week_id)
);
