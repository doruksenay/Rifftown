-- Turne ekibi ve moral, araç ve sahne ekipmanı yıpranması, turne planı, müzik klibi, radyo, plak şirketi, prodüktör.

-- ---------- Turne ekibi ----------
CREATE TABLE band_crew (
  band_id   BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  role      TEXT NOT NULL,
  hired_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (band_id, role)
);
ALTER TABLE bands
  ADD COLUMN crew_morale REAL NOT NULL DEFAULT 70 CHECK (crew_morale >= 0 AND crew_morale <= 100),
  ADD COLUMN crew_morale_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ---------- Yıpranma (enstrüman ve araç) ----------
ALTER TABLE inventory ADD COLUMN wear REAL NOT NULL DEFAULT 0 CHECK (wear >= 0 AND wear <= 100);

-- ---------- Turne planı ----------
CREATE TABLE tours (
  id          BIGSERIAL PRIMARY KEY,
  band_id     BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  city_ids    TEXT[] NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at     TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'failed', 'cancelled')),
  result      JSONB
);
CREATE UNIQUE INDEX tours_active_idx ON tours(band_id) WHERE status = 'active';
CREATE INDEX tours_due_idx ON tours(ends_at) WHERE status = 'active';

-- ---------- Müzik klibi ----------
CREATE TABLE music_videos (
  id           BIGSERIAL PRIMARY KEY,
  band_id      BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  song_id      BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  quality      INTEGER NOT NULL,
  director     TEXT NOT NULL,
  directed_by  BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  weeks        INTEGER NOT NULL DEFAULT 0,
  total_views  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX music_videos_band_idx ON music_videos(band_id, created_at DESC);
CREATE TABLE video_chart (
  week_id   BIGINT NOT NULL REFERENCES chart_weeks(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL,
  video_id  BIGINT NOT NULL REFERENCES music_videos(id) ON DELETE CASCADE,
  views     INTEGER NOT NULL,
  PRIMARY KEY (week_id, position)
);

-- ---------- Radyo ----------
CREATE TABLE radio_plays (
  release_id  BIGINT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  week_id     BIGINT NOT NULL REFERENCES chart_weeks(id) ON DELETE CASCADE,
  city_id     TEXT NOT NULL,
  plays       INTEGER NOT NULL,
  PRIMARY KEY (release_id, week_id, city_id)
);

-- ---------- Plak şirketi ----------
CREATE TABLE labels (
  id          BIGSERIAL PRIMARY KEY,
  owner_id    BIGINT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  city_id     TEXT NOT NULL,
  till        INTEGER NOT NULL DEFAULT 0 CHECK (till >= 0),
  total_revenue INTEGER NOT NULL DEFAULT 0,
  upkeep_due  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX labels_name_idx ON labels(lower(name));

CREATE TABLE label_contracts (
  id          BIGSERIAL PRIMARY KEY,
  label_id    BIGINT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  band_id     BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  band_share  REAL NOT NULL CHECK (band_share >= 0.3 AND band_share <= 0.6),
  advance     INTEGER NOT NULL DEFAULT 0 CHECK (advance >= 0),
  recouped    INTEGER NOT NULL DEFAULT 0 CHECK (recouped >= 0),
  weeks       INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'countered', 'active', 'declined', 'ended', 'cancelled')),
  -- Pazarlık: son teklifi kim yaptı
  last_by     TEXT NOT NULL DEFAULT 'label' CHECK (last_by IN ('label', 'band')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX label_contracts_active_band_idx ON label_contracts(band_id) WHERE status = 'active';
CREATE INDEX label_contracts_label_idx ON label_contracts(label_id, status);

ALTER TABLE releases ADD COLUMN contract_id BIGINT REFERENCES label_contracts(id) ON DELETE SET NULL;
ALTER TABLE releases ADD COLUMN radio_plays INTEGER NOT NULL DEFAULT 0;

-- Kayıtta kim prodüktörlük yaptı (dışarıdan tutulduysa seviyesi)
ALTER TABLE recordings ADD COLUMN producer TEXT;
