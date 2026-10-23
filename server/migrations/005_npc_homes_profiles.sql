-- Oyunun kendi grupları, ev ve kira, rehber görevler, profil fotoğrafı ve başlık

-- ---------- Oyunun kendi müzisyenleri ----------
-- Yapay karakterlerin bir hesabı yoktur
ALTER TABLE characters ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE characters
  ADD COLUMN npc BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN headline TEXT NOT NULL DEFAULT '',
  -- 0 ya da eksi: fotoğraf yok. Her yüklemede mutlak değeri artar ve hiç geri dönmez (adrese eklenir)
  ADD COLUMN avatar_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD CONSTRAINT characters_npc_user CHECK (npc OR user_id IS NOT NULL);

ALTER TABLE bands ADD COLUMN npc_key TEXT UNIQUE;

-- ---------- Profil fotoğrafları ----------
CREATE TABLE avatars (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  mime          TEXT NOT NULL,
  data          BYTEA NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Ev ve kira ----------
CREATE TABLE homes (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  city_id       TEXT NOT NULL,
  home_id       TEXT NOT NULL,
  paid_until    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX homes_due_idx ON homes(paid_until);

-- ---------- Rehber görevler ----------
CREATE TABLE tutorial_claims (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  step_id       TEXT NOT NULL,
  reward        INTEGER NOT NULL,
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, step_id)
);
