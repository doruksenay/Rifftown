-- Kayıt ve listeler, suç ve adalet, başarımlar

-- ---------- Kayıt ve listeler ----------

-- Grubun bir şarkının en iyi kaydı
CREATE TABLE recordings (
  id           BIGSERIAL PRIMARY KEY,
  band_id      BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  song_id      BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  quality      INTEGER NOT NULL,
  recorded_by  BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (band_id, song_id)
);

CREATE TABLE releases (
  id             BIGSERIAL PRIMARY KEY,
  band_id        BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('single', 'album')),
  title          TEXT NOT NULL,
  song_ids       BIGINT[] NOT NULL,
  quality        INTEGER NOT NULL,
  released_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  weeks_on_sale  INTEGER NOT NULL DEFAULT 0,
  total_units    INTEGER NOT NULL DEFAULT 0,
  total_revenue  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX releases_band_idx ON releases(band_id, released_at DESC);

CREATE TABLE chart_weeks (
  id         BIGSERIAL PRIMARY KEY,
  starts_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at    TIMESTAMPTZ NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);
CREATE UNIQUE INDEX chart_weeks_open_idx ON chart_weeks((status)) WHERE status = 'open';

CREATE TABLE release_sales (
  release_id  BIGINT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  week_id     BIGINT NOT NULL REFERENCES chart_weeks(id) ON DELETE CASCADE,
  city_id     TEXT NOT NULL,
  units       INTEGER NOT NULL,
  PRIMARY KEY (release_id, week_id, city_id)
);

-- scope: şehir id ya da 'world'
CREATE TABLE chart_entries (
  week_id     BIGINT NOT NULL REFERENCES chart_weeks(id) ON DELETE CASCADE,
  scope       TEXT NOT NULL,
  kind        TEXT NOT NULL,
  position    INTEGER NOT NULL,
  release_id  BIGINT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  units       INTEGER NOT NULL,
  PRIMARY KEY (week_id, scope, kind, position)
);
CREATE INDEX chart_entries_release_idx ON chart_entries(release_id);

-- Konserde kimin sahnede olduğu (başarımlar ve geçmiş için)
CREATE TABLE gig_performers (
  gig_id        BIGINT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  present       BOOLEAN NOT NULL,
  PRIMARY KEY (gig_id, character_id)
);
CREATE INDEX gig_performers_char_idx ON gig_performers(character_id);

-- ---------- Suç ve adalet ----------

ALTER TABLE characters
  ADD COLUMN jailed_until TIMESTAMPTZ,
  ADD COLUMN convictions INTEGER NOT NULL DEFAULT 0;

CREATE TABLE crimes (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  city_id       TEXT NOT NULL,
  location_id   TEXT NOT NULL,
  kind          TEXT NOT NULL,
  success       BOOLEAN NOT NULL,
  loot          INTEGER NOT NULL DEFAULT 0,
  -- unsolved: faili meçhul · solved: polis faili buldu · caught: suç üstü yakalandı
  status        TEXT NOT NULL CHECK (status IN ('unsolved', 'solved', 'caught')),
  solved_by     BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX crimes_unsolved_idx ON crimes(city_id, created_at) WHERE status = 'unsolved';
CREATE INDEX crimes_char_idx ON crimes(character_id);

CREATE TABLE cases (
  id             BIGSERIAL PRIMARY KEY,
  crime_id       BIGINT NOT NULL REFERENCES crimes(id) ON DELETE CASCADE,
  suspect_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  city_id        TEXT NOT NULL,
  arrested_by    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'convicted', 'acquitted')),
  sentence_hours REAL,
  judge_id       BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at         TIMESTAMPTZ NOT NULL,
  decided_at     TIMESTAMPTZ
);
CREATE INDEX cases_due_idx ON cases(due_at) WHERE status = 'pending';
CREATE INDEX cases_city_idx ON cases(city_id, created_at DESC);
CREATE INDEX cases_suspect_idx ON cases(suspect_id);

-- ---------- Başarımlar ----------

CREATE TABLE character_achievements (
  character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, achievement_id)
);

-- ---------- Sorgular için indeksler ----------

-- Görevdeki polis sayısı (mekâna göre son eylemler)
CREATE INDEX actions_location_idx ON actions(location_id, ends_at);
-- Cezaevindekiler ve tahliye taraması
CREATE INDEX characters_jailed_idx ON characters(jailed_until) WHERE jailed_until IS NOT NULL;
-- Başarım istatistikleri
CREATE INDEX recordings_by_idx ON recordings(recorded_by);
CREATE INDEX crimes_solver_idx ON crimes(solved_by) WHERE solved_by IS NOT NULL;
CREATE INDEX cases_judge_idx ON cases(judge_id) WHERE judge_id IS NOT NULL;
CREATE INDEX election_votes_voter_idx ON election_votes(voter_id);
CREATE INDEX elections_winner_idx ON elections(winner_id) WHERE winner_id IS NOT NULL;
