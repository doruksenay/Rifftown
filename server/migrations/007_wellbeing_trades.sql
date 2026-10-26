-- Enerji, ilham, moodlet'ler, EFSANEVİ konser/enstrüman ve oyuncular arası takas.

-- ---------- Enerji ve ilham ----------
-- Saklanan değer + saklandığı an; şimdiki hâl zamanla hesaplanır (enerji dolar, ilham söner).
ALTER TABLE characters
  ADD COLUMN energy REAL NOT NULL DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
  ADD COLUMN energy_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN inspiration REAL NOT NULL DEFAULT 30 CHECK (inspiration >= 0 AND inspiration <= 100),
  ADD COLUMN inspiration_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ---------- Moodlet'ler ----------
-- Aynı türden ikinci olay süreyi yeniler (karakter başına tür başına tek satır).
CREATE TABLE moodlets (
  character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,
  value        REAL NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, kind)
);
CREATE INDEX moodlets_expiry_idx ON moodlets(expires_at);

-- ---------- EFSANEVİ ----------
ALTER TABLE gigs ADD COLUMN legendary BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE inventory
  ADD COLUMN legendary_at TIMESTAMPTZ,
  ADD COLUMN legendary_gig BIGINT,
  ADD COLUMN legendary_band TEXT;

-- ---------- Takas ----------
CREATE TABLE trades (
  id          BIGSERIAL PRIMARY KEY,
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  give_money  INTEGER NOT NULL DEFAULT 0 CHECK (give_money >= 0),
  want_money  INTEGER NOT NULL DEFAULT 0 CHECK (want_money >= 0),
  note        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined', 'cancelled', 'failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ,
  CHECK (from_id <> to_id)
);
CREATE INDEX trades_to_idx ON trades(to_id) WHERE status = 'open';
CREATE INDEX trades_from_idx ON trades(from_id) WHERE status = 'open';

-- Takastaki eşyalar. Eşya el değiştirse ya da silinse de kayıt kalır (geçmiş için tanım ve görünüş saklanır).
CREATE TABLE trade_items (
  trade_id     BIGINT NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  side         TEXT NOT NULL CHECK (side IN ('give', 'want')),
  inventory_id BIGINT NOT NULL,
  item_id      TEXT NOT NULL,
  color        TEXT,
  nickname     TEXT,
  bonus        INTEGER,
  legendary    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (trade_id, inventory_id)
);
