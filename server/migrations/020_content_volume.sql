-- İçerik hacmi: tüketim eşyaları ve atölye efektlerinin konsere taşınan bonusu.

-- Kullanılan tüketim eşyaları (ortak bekleme süresi ve istatistik için)
CREATE TABLE item_uses (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX item_uses_character_idx ON item_uses(character_id, created_at DESC);

-- Konserde kullanılacak sahne efektlerinin bonusu (effects ile aynı sırada). Atölyede yapılmış efektin bonusu
-- her üründe farklı olduğundan eşya tanımından okunamaz. Eski konserlerde NULL: eşyanın bonusu kullanılır.
ALTER TABLE gigs ADD COLUMN effect_bonuses INTEGER[];
