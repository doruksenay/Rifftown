-- Kayıp ve sonuç: aşinalık çürümesi, şöhret azalması, yaşlanma, bağımlılık, skandal, (isteğe bağlı) ölüm.

-- Aşinalık: son çalınma/prova anı ve son çürüme turu
ALTER TABLE familiarity
  ADD COLUMN touched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN decayed_at TIMESTAMPTZ;
CREATE INDEX familiarity_touched_idx ON familiarity(touched_at);

-- Şöhret: o şehirdeki son konser ve son çürüme turu
ALTER TABLE band_fame
  ADD COLUMN active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN decayed_at TIMESTAMPTZ;

-- Bağımlılık, hastane ve ölüm
ALTER TABLE characters
  ADD COLUMN indulgence REAL NOT NULL DEFAULT 0 CHECK (indulgence >= 0),
  ADD COLUMN indulgence_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN indulged_at TIMESTAMPTZ,
  ADD COLUMN addicted_since TIMESTAMPTZ,
  ADD COLUMN critical_since TIMESTAMPTZ,
  ADD COLUMN dead_at TIMESTAMPTZ,
  ADD COLUMN death_cause TEXT,
  ADD COLUMN former_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN inherited INTEGER NOT NULL DEFAULT 0;
-- Ölen karakter kullanıcıdan ayrılır (kullanıcı yeni karakter açabilsin), geçmişi korunur
ALTER TABLE characters DROP CONSTRAINT characters_npc_user;
ALTER TABLE characters ADD CONSTRAINT characters_npc_user CHECK (npc OR user_id IS NOT NULL OR dead_at IS NOT NULL);
CREATE INDEX characters_former_user_idx ON characters(former_user_id) WHERE former_user_id IS NOT NULL;

-- Skandallar (grup ya da kişi; şehir bazlı)
CREATE TABLE scandals (
  id            BIGSERIAL PRIMARY KEY,
  band_id       BIGINT REFERENCES bands(id) ON DELETE CASCADE,
  character_id  BIGINT REFERENCES characters(id) ON DELETE CASCADE,
  city_id       TEXT NOT NULL,
  kind          TEXT NOT NULL,
  severity      REAL NOT NULL,
  defused       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scandals_band_idx ON scandals(band_id, created_at DESC);
CREATE INDEX scandals_city_idx ON scandals(city_id, created_at DESC);

-- Üyenin gruba katılma zamanı zaten band_members.joined_at
-- Yaşlılıktan ölüm zarı en fazla oyun gününde bir atılır (yalnızca PERMADEATH açıkken)
ALTER TABLE characters ADD COLUMN life_checked_at TIMESTAMPTZ;
