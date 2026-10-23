-- VIP üyelik, meslekler, siyasi makamlar ve seçimler, para transferleri

ALTER TABLE users ADD COLUMN vip_until TIMESTAMPTZ;

ALTER TABLE characters
  ADD COLUMN profession TEXT,
  ADD COLUMN career_hours REAL NOT NULL DEFAULT 0,
  ADD COLUMN career_rank INTEGER NOT NULL DEFAULT 0;

-- VIP süresinin nereden geldiği (mağaza satın alımı ya da yönetici)
CREATE TABLE vip_grants (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,          -- 'admin', 'revenuecat'
  product_id  TEXT,
  days        INTEGER,
  until       TIMESTAMPTZ NOT NULL,
  event_id    TEXT UNIQUE,            -- mağaza olaylarının iki kez işlenmesini önler
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE elections (
  id          BIGSERIAL PRIMARY KEY,
  city_id     TEXT NOT NULL,
  office      TEXT NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at     TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  winner_id   BIGINT REFERENCES characters(id) ON DELETE SET NULL
);
-- Her şehirde her makam için aynı anda tek açık seçim
CREATE UNIQUE INDEX elections_open_idx ON elections(city_id, office) WHERE status = 'open';
CREATE INDEX elections_due_idx ON elections(ends_at) WHERE status = 'open';

CREATE TABLE election_candidates (
  election_id  BIGINT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (election_id, character_id)
);

CREATE TABLE election_votes (
  election_id  BIGINT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  voter_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  candidate_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (election_id, voter_id)
);

CREATE TABLE office_holders (
  city_id       TEXT NOT NULL,
  office        TEXT NOT NULL,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  since         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_paid_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  announcement  TEXT,
  PRIMARY KEY (city_id, office)
);
CREATE INDEX office_holders_char_idx ON office_holders(character_id);

CREATE TABLE money_transfers (
  id          BIGSERIAL PRIMARY KEY,
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX money_transfers_from_idx ON money_transfers(from_id, created_at DESC);
