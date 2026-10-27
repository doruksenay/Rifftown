-- Basın ve medya: grubun şehir bazlı basın desteği, basın etkinlikleri (toplantı, röportaj) ve gazetecilerin haberleri.

CREATE TABLE band_press (
  band_id    BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  city_id    TEXT NOT NULL,
  value      REAL NOT NULL DEFAULT 20 CHECK (value >= 0 AND value <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (band_id, city_id)
);

CREATE TABLE press_events (
  id            BIGSERIAL PRIMARY KEY,
  band_id       BIGINT REFERENCES bands(id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  city_id       TEXT NOT NULL,
  mode          TEXT NOT NULL CHECK (mode IN ('conference', 'interview')),
  success       BOOLEAN NOT NULL,
  delta         REAL NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX press_events_band_idx ON press_events(band_id, city_id, created_at DESC);
CREATE INDEX press_events_char_idx ON press_events(character_id, created_at DESC);

-- Haberler: gazeteciler (oyuncu ya da oyunun kendi muhabirleri) yazar; şehir gazetesinde yayınlanır.
-- Topluluk katmanındaki yazılar da (blog, pano) aynı tabloda tutulur; kind sütunu ayırır.
CREATE TABLE articles (
  id           BIGSERIAL PRIMARY KEY,
  author_id    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  city_id      TEXT NOT NULL,
  band_id      BIGINT REFERENCES bands(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL DEFAULT 'news' CHECK (kind IN ('news', 'blog', 'board')),
  tone         TEXT NOT NULL DEFAULT 'neutral' CHECK (tone IN ('positive', 'neutral', 'negative')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  impact       REAL NOT NULL DEFAULT 0,
  npc          BOOLEAN NOT NULL DEFAULT FALSE,
  removed      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX articles_city_idx ON articles(city_id, created_at DESC) WHERE NOT removed;
CREATE INDEX articles_band_idx ON articles(band_id, city_id, created_at DESC);
CREATE INDEX articles_author_idx ON articles(author_id, created_at DESC);

-- Şikâyet edilebilir içerik türleri: haber ve yazılar
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_kind_check;
ALTER TABLE reports ADD CONSTRAINT reports_kind_check CHECK (kind IN ('message', 'guestbook', 'profile', 'article'));
