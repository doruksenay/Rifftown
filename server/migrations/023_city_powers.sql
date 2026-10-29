-- Makam yetkileri (packages/shared/src/civic-powers.ts): her makamın şehirde dar ve tavanlı tek bir kararı.
-- Karar yalnızca onu veren makam sahibi görevdeyken geçerlidir (holder_id); makam el değiştirince varsayılana (0) döner.

CREATE TABLE city_policies (
  city_id     TEXT NOT NULL,
  office      TEXT NOT NULL,
  level       SMALLINT NOT NULL DEFAULT 0 CHECK (level BETWEEN -2 AND 5),
  holder_id   BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  set_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (city_id, office)
);

-- Her karar ve sıfırlama kayıtlıdır: kim, ne zaman, eski ve yeni değer; şehir haberine bağlantı
CREATE TABLE policy_log (
  id            BIGSERIAL PRIMARY KEY,
  city_id       TEXT NOT NULL,
  office        TEXT NOT NULL,
  policy        TEXT NOT NULL,
  character_id  BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  old_level     SMALLINT NOT NULL,
  new_level     SMALLINT NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN ('set', 'reset')),
  article_id    BIGINT REFERENCES articles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX policy_log_city_idx ON policy_log(city_id, created_at DESC);
CREATE INDEX policy_log_holder_idx ON policy_log(character_id, city_id, office, created_at DESC);

-- Mevcut şehirler: hiçbir karar yok, hepsi varsayılanda (eski davranışın aynısı).
