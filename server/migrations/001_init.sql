-- Rifftown: ilk veritabanı şeması

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  lang          TEXT NOT NULL DEFAULT 'tr' CHECK (lang IN ('tr', 'en')),
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  banned        BOOLEAN NOT NULL DEFAULT FALSE,
  push_token    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

CREATE TABLE characters (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  avatar_color    TEXT NOT NULL,
  main_instrument TEXT NOT NULL,
  money           INTEGER NOT NULL CHECK (money >= 0),
  mood            REAL NOT NULL CHECK (mood >= 0 AND mood <= 100),
  health          REAL NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  city_id         TEXT,            -- seyahatteyken NULL
  location_id     TEXT,
  skills          JSONB NOT NULL,
  bio             TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX characters_name_lower_idx ON characters (lower(name));
CREATE INDEX characters_city_idx ON characters(city_id);

-- Süreli eylemler: çalışma, iş, dinlenme, şarkı yazma, prova, seyahat
CREATE TABLE actions (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  params        JSONB NOT NULL DEFAULT '{}',
  location_id   TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at       TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'cancelled')),
  result        JSONB
);
-- Bir karakterin aynı anda tek aktif eylemi olabilir
CREATE UNIQUE INDEX actions_one_active_idx ON actions(character_id) WHERE status = 'active';
CREATE INDEX actions_due_idx ON actions(ends_at) WHERE status = 'active';
CREATE INDEX actions_char_idx ON actions(character_id, id DESC);

CREATE TABLE songs (
  id          BIGSERIAL PRIMARY KEY,
  author_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  genre       TEXT NOT NULL,
  quality     INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX songs_author_idx ON songs(author_id);

CREATE TABLE familiarity (
  character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  song_id      BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  value        REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, song_id)
);

CREATE TABLE bands (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  genre       TEXT NOT NULL,
  leader_id   BIGINT NOT NULL REFERENCES characters(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX bands_name_lower_idx ON bands (lower(name));

CREATE TABLE band_members (
  band_id       BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE, -- bir kişi tek grupta
  role          TEXT NOT NULL,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (band_id, character_id)
);

CREATE TABLE band_invites (
  id            BIGSERIAL PRIMARY KEY,
  band_id       BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX band_invites_pending_idx ON band_invites(band_id, character_id) WHERE status = 'pending';

CREATE TABLE band_songs (
  band_id  BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  song_id  BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (band_id, song_id)
);

CREATE TABLE band_fame (
  band_id  BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  city_id  TEXT NOT NULL,
  fame     REAL NOT NULL DEFAULT 0 CHECK (fame >= 0 AND fame <= 100),
  PRIMARY KEY (band_id, city_id)
);

CREATE TABLE gigs (
  id           BIGSERIAL PRIMARY KEY,
  band_id      BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  city_id      TEXT NOT NULL,
  location_id  TEXT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'done', 'cancelled')),
  setlist      BIGINT[] NOT NULL,
  session_roles TEXT[] NOT NULL DEFAULT '{}',   -- kiralık müzisyen rolleri
  result       JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX gigs_due_idx ON gigs(starts_at) WHERE status = 'scheduled';
CREATE INDEX gigs_band_idx ON gigs(band_id, starts_at DESC);
CREATE INDEX gigs_city_idx ON gigs(city_id, starts_at);

-- Oyuncuların dükkânlardan aldığı eşyalar
CREATE TABLE inventory (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id       TEXT NOT NULL,
  slot          TEXT NOT NULL,
  equipped      BOOLEAN NOT NULL DEFAULT FALSE,
  acquired_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX inventory_char_idx ON inventory(character_id);
-- Her yuvada (gitar, kıyafet...) en fazla bir kuşanılmış eşya
CREATE UNIQUE INDEX inventory_equipped_idx ON inventory(character_id, slot) WHERE equipped AND slot <> 'art';

CREATE TABLE chat_messages (
  id            BIGSERIAL PRIMARY KEY,
  channel       TEXT NOT NULL,          -- 'city:istanbul' veya 'band:12'
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  deleted       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_channel_idx ON chat_messages(channel, id DESC);

CREATE TABLE notifications (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}',
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  pushed        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_char_idx ON notifications(character_id, id DESC);
CREATE INDEX notifications_push_idx ON notifications(id) WHERE pushed = FALSE;
