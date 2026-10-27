-- Tek gecelik macera (karşılıklı onay) ve aile: çocukların haftalık bakım gideri.
CREATE TABLE fling_offers (
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (from_id, to_id)
);
CREATE INDEX fling_offers_to_idx ON fling_offers(to_id);

-- Gerçekleşen maceralar: ikili bekleme süresi, günlük tavan ve "Çapkın" ünvanı buradan (a_id < b_id)
CREATE TABLE flings (
  id          BIGSERIAL PRIMARY KEY,
  a_id        BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  b_id        BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  location_id TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX flings_a_idx ON flings(a_id, created_at DESC);
CREATE INDEX flings_b_idx ON flings(b_id, created_at DESC);

-- Çocukların bakım gideri haftalık kesilir; ebeveyn hesabı silinse de çocuk kaydı korunur (ON DELETE SET NULL, 006)
ALTER TABLE children ADD COLUMN upkeep_due TIMESTAMPTZ;
