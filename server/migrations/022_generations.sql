-- Nesiller: yetişkin çocuğun mirasçı olarak oynanabilir karakter olması (packages/shared/src/generations.ts).
-- Mirasçı kullanıcının kendi hesabında yeni karakterdir; çocuk ayrı bir hesap değildir. Ebeveyn karakter ya ölmüştür
-- (PERMADEATH) ya da isteyerek devreder ve emekliye ayrılır (arşivlenir; kayıtları korunur).

-- Emekli (devretmiş) karakter: ölü gibi kullanıcıdan koparılır, aramalarda ve sosyal hedeflerde görünmez
ALTER TABLE characters
  ADD COLUMN retired_at TIMESTAMPTZ,
  -- Soy: aile adı (boşsa adın son kelimesi), kuşak, hangi çocuk kaydından doğduğu ve kimden devraldığı
  ADD COLUMN family_name TEXT,
  ADD COLUMN generation INTEGER NOT NULL DEFAULT 1 CHECK (generation >= 1),
  ADD COLUMN child_id BIGINT REFERENCES children(id) ON DELETE SET NULL,
  ADD COLUMN predecessor_id BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  -- Yaş başlangıcı: karakterin 18 yaşında olduğu an (boşsa created_at; mirasçıda çocuğun gerçek yaşı korunur)
  ADD COLUMN adult_at TIMESTAMPTZ,
  -- Ölen/emekli karakterin eşyalarından yadigâr seçildi mi (bir kez)
  ADD COLUMN estate_claimed BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX characters_child_idx ON characters(child_id) WHERE child_id IS NOT NULL;

ALTER TABLE characters DROP CONSTRAINT characters_npc_user;
ALTER TABLE characters ADD CONSTRAINT characters_npc_user
  CHECK (npc OR user_id IS NOT NULL OR dead_at IS NOT NULL OR retired_at IS NOT NULL);

-- Çocuk kaydı: mirasçı olduysa hangi karakter; diğer ebeveynin onayı (ayrı hesaptaysa gerekir)
ALTER TABLE children
  ADD COLUMN heir_id BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  ADD COLUMN heir_request_by BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  ADD COLUMN heir_request_at TIMESTAMPTZ,
  ADD COLUMN heir_consent_for BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  ADD COLUMN heir_consent_at TIMESTAMPTZ;
CREATE UNIQUE INDEX children_heir_idx ON children(heir_id) WHERE heir_id IS NOT NULL;

-- Devir kayıtları: bekleme süresi, yönetim paneli ve denetim için
CREATE TABLE successions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
  from_id       BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  to_id         BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  child_id      BIGINT REFERENCES children(id) ON DELETE SET NULL,
  cause         TEXT NOT NULL CHECK (cause IN ('retire', 'death')),
  money         INTEGER NOT NULL DEFAULT 0 CHECK (money >= 0),
  items         INTEGER NOT NULL DEFAULT 0 CHECK (items >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX successions_user_idx ON successions(user_id, created_at DESC);
CREATE UNIQUE INDEX successions_from_idx ON successions(from_id) WHERE from_id IS NOT NULL;

-- Mevcut aileler: hiçbir şey değişmez. Bütün karakterler 1. kuşaktır, aile adı adlarından türetilir;
-- mevcut çocuklar (doğmuş ya da evlat edinilmiş) 18 yaşına gelince mirasçı olabilir.
