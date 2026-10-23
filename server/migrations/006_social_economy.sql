-- Sosyal (mesaj, arkadaşlık, defter, engelleme, şikâyet), ilişkiler ve aile, ikinci el pazarı,
-- eşya kişiselleştirme ve üretim, yaşam mekânları, oyuncu işletmeleri, festivaller, haftalık görevler

-- ---------- Hesap ----------
ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- ---------- Eşyalar ----------
ALTER TABLE inventory
  ADD COLUMN color TEXT,
  ADD COLUMN nickname TEXT,
  -- Atölyede üretilen eşyanın kendi bonusu (yoksa eşya tanımındaki bonus)
  ADD COLUMN bonus INTEGER,
  ADD COLUMN crafted_by BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  ADD COLUMN listed BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------- Özel mesajlar ----------
CREATE TABLE direct_messages (
  id          BIGSERIAL PRIMARY KEY,
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX dm_pair_idx ON direct_messages(LEAST(from_id, to_id), GREATEST(from_id, to_id), id DESC);
CREATE INDEX dm_unread_idx ON direct_messages(to_id) WHERE NOT read;

-- ---------- Arkadaşlık ve ilişkiler (a_id < b_id) ----------
CREATE TABLE relationships (
  a_id           BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  b_id           BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  friends        BOOLEAN NOT NULL DEFAULT FALSE,
  -- Bekleyen arkadaşlık isteğini kim gönderdi
  friend_request BIGINT REFERENCES characters(id) ON DELETE CASCADE,
  friendship     REAL NOT NULL DEFAULT 0,
  romance        REAL NOT NULL DEFAULT 0,
  flirted_a      BOOLEAN NOT NULL DEFAULT FALSE,
  flirted_b      BOOLEAN NOT NULL DEFAULT FALSE,
  stage          TEXT NOT NULL DEFAULT 'none' CHECK (stage IN ('none', 'dating', 'engaged', 'married')),
  -- Bekleyen evlilik teklifi ve evlat edinme isteği
  proposal_by    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  proposal_ring  BIGINT,
  adoption_by    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  adoption_name  TEXT,
  last_hangout   TIMESTAMPTZ,
  last_flirt     TIMESTAMPTZ,
  last_date      TIMESTAMPTZ,
  married_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (a_id, b_id),
  CHECK (a_id < b_id)
);
CREATE INDEX relationships_b_idx ON relationships(b_id);
-- Bir kişi aynı anda tek bir nişanlı ya da evli ilişkide olabilir
CREATE TABLE partners (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  partner_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE children (
  id          BIGSERIAL PRIMARY KEY,
  parent_a    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  parent_b    BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  born_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX children_a_idx ON children(parent_a);
CREATE INDEX children_b_idx ON children(parent_b);

CREATE TABLE blocks (
  blocker_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  blocked_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE guestbook (
  id          BIGSERIAL PRIMARY KEY,
  owner_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  author_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX guestbook_owner_idx ON guestbook(owner_id, id DESC);

-- Şikâyetler (mesaj, defter notu, profil) yönetim paneline düşer
CREATE TABLE reports (
  id           BIGSERIAL PRIMARY KEY,
  reporter_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('message', 'guestbook', 'profile')),
  target_id    BIGINT NOT NULL,
  text         TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sosyal etkileşim kaydı (haftalık görevler ve geçmiş için)
CREATE TABLE social_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  target_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX social_log_actor_idx ON social_log(actor_id, created_at);

-- ---------- İkinci el pazarı ----------
CREATE TABLE listings (
  id            BIGSERIAL PRIMARY KEY,
  seller_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  inventory_id  BIGINT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  item_id       TEXT NOT NULL,
  price         INTEGER NOT NULL CHECK (price > 0),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id      BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at     TIMESTAMPTZ
);
CREATE UNIQUE INDEX listings_active_item_idx ON listings(inventory_id) WHERE status = 'active';
CREATE INDEX listings_active_idx ON listings(item_id, price) WHERE status = 'active';

-- ---------- Yaşam ----------
ALTER TABLE characters
  ADD COLUMN bank INTEGER NOT NULL DEFAULT 0 CHECK (bank >= 0),
  ADD COLUMN bank_interest_at TIMESTAMPTZ,
  -- Faiz döneminde hesapta kalan en düşük bakiye: faiz buna işler (son dakika yatırıp çekmek işe yaramasın)
  ADD COLUMN bank_min INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_meal TIMESTAMPTZ;

CREATE TABLE hotel_stays (
  character_id  BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  city_id       TEXT NOT NULL,
  until         TIMESTAMPTZ NOT NULL
);

CREATE TABLE tattoos (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  tattoo_id     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tattoos_char_idx ON tattoos(character_id);

CREATE TABLE meals (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  location_id   TEXT NOT NULL,
  meal_id       TEXT NOT NULL,
  price         INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX meals_char_idx ON meals(character_id, created_at);

-- ---------- Oyuncu işletmeleri ----------
CREATE TABLE businesses (
  location_id   TEXT PRIMARY KEY,
  owner_id      BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  name          TEXT NOT NULL,
  till          INTEGER NOT NULL DEFAULT 0 CHECK (till >= 0),
  gig_share     REAL NOT NULL DEFAULT 0.1,
  menu_mult     REAL NOT NULL DEFAULT 1,
  upkeep_due    TIMESTAMPTZ NOT NULL,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX businesses_owner_idx ON businesses(owner_id);

CREATE TABLE business_staff (
  location_id   TEXT NOT NULL REFERENCES businesses(location_id) ON DELETE CASCADE,
  character_id  BIGINT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE, -- tek işyeri
  wage          INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'hired')),
  hired_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (location_id, character_id)
);

CREATE TABLE business_log (
  id            BIGSERIAL PRIMARY KEY,
  location_id   TEXT NOT NULL,
  kind          TEXT NOT NULL,
  amount        INTEGER NOT NULL,
  character_id  BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX business_log_loc_idx ON business_log(location_id, id DESC);

-- ---------- Konser efektleri ----------
ALTER TABLE gigs
  ADD COLUMN effects TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN festival_id BIGINT;

-- ---------- Festivaller ----------
CREATE TABLE festivals (
  id            BIGSERIAL PRIMARY KEY,
  country_code  TEXT NOT NULL,
  city_id       TEXT NOT NULL,
  apply_until   TIMESTAMPTZ NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'scheduled', 'done')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX festivals_open_idx ON festivals(country_code) WHERE status <> 'done';

CREATE TABLE festival_applications (
  festival_id   BIGINT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  band_id       BIGINT NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  selected      BOOLEAN NOT NULL DEFAULT FALSE,
  slot          INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (festival_id, band_id)
);

-- ---------- Haftalık görevler ----------
CREATE TABLE mission_claims (
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  week_id       BIGINT NOT NULL,
  mission_id    TEXT NOT NULL,
  reward        INTEGER NOT NULL,
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, week_id, mission_id)
);
