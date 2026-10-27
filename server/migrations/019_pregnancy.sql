-- Aile planlaması ve hamilelik (packages/shared/src/relations.ts). Varsayılan kapalı: hamilelik ancak iki taraf da açıksa.
ALTER TABLE characters ADD COLUMN family_open BOOLEAN NOT NULL DEFAULT FALSE;

-- Tek gecelik teklifte teklif edenin koruma tercihi (varsayılan korunmalı)
ALTER TABLE fling_offers ADD COLUMN protected BOOLEAN NOT NULL DEFAULT TRUE;

-- "Çocuk sahibi olmayı dene" teklifleri (sevgili/evli çift; taşıyan ebeveyn teklifte seçilir, kabulle onaylanır)
CREATE TABLE family_try_offers (
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  carrier_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (from_id, to_id)
);
-- Denemeler (çift başına bekleme süresi için; a_id < b_id)
CREATE TABLE family_tries (
  id          BIGSERIAL PRIMARY KEY,
  a_id        BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  b_id        BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX family_tries_pair_idx ON family_tries(a_id, b_id, created_at DESC);

CREATE TABLE pregnancies (
  id          BIGSERIAL PRIMARY KEY,
  carrier_id  BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  other_id    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  source      TEXT NOT NULL CHECK (source IN ('try', 'fling')),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at      TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'born')),
  born_at     TIMESTAMPTZ,
  child_id    BIGINT REFERENCES children(id) ON DELETE SET NULL
);
-- Aynı anda tek hamilelik
CREATE UNIQUE INDEX pregnancies_active_idx ON pregnancies(carrier_id) WHERE status = 'active';
CREATE INDEX pregnancies_due_idx ON pregnancies(due_at) WHERE status = 'active';
