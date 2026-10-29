-- Ek hesap önlemleri (denge raporu §7, takas rotasyonu):
-- 1) Eşyanın el değiştirme geçmişi. Bekleme süresi içinde eşya, o sürede sahibi olmuş hiç kimseye geri dönemez
--    (yalnız bir önceki sahibe bakmak A → B → C → A zinciriyle aşılıyordu).
-- 2) Oyuncular arası para akışı (takas parası, pazar alışı, VIP para gönderme): ikili başına kayan haftalık net tavan.
-- Yalnızca ekleme; eski prev_owner / handed_at sütunları yerinde kalır ve kural onları da okur.

CREATE TABLE item_handoffs (
  id            BIGSERIAL PRIMARY KEY,
  inventory_id  BIGINT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  from_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id         BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX item_handoffs_item_idx ON item_handoffs(inventory_id, created_at DESC);

CREATE TABLE player_money_flows (
  id          BIGSERIAL PRIMARY KEY,
  from_id     BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_id       BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  kind        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX player_money_flows_pair_idx ON player_money_flows(from_id, to_id, created_at DESC);

-- Geçiş: son haftanın el değiştirmeleri ve para akışları yeni tablolara taşınır, böylece kural canlıda hemen işler.
INSERT INTO item_handoffs(inventory_id, from_id, to_id, kind, created_at)
SELECT i.id, i.prev_owner, i.character_id, 'legacy', i.handed_at
  FROM inventory i JOIN characters p ON p.id = i.prev_owner
 WHERE i.prev_owner IS NOT NULL AND i.handed_at > now() - interval '8 days';

INSERT INTO player_money_flows(from_id, to_id, amount, kind, created_at)
SELECT from_id, to_id, amount, 'vip', created_at FROM money_transfers WHERE created_at > now() - interval '8 days';

INSERT INTO player_money_flows(from_id, to_id, amount, kind, created_at)
SELECT CASE WHEN give_money > 0 THEN from_id ELSE to_id END,
       CASE WHEN give_money > 0 THEN to_id ELSE from_id END,
       give_money + want_money, 'trade', closed_at
  FROM trades
 WHERE status = 'accepted' AND give_money + want_money > 0 AND closed_at > now() - interval '8 days';

INSERT INTO player_money_flows(from_id, to_id, amount, kind, created_at)
SELECT l.buyer_id, l.seller_id, l.price, 'market', l.closed_at
  FROM listings l JOIN characters s ON s.id = l.seller_id
 WHERE l.status = 'sold' AND l.buyer_id IS NOT NULL AND NOT s.npc AND l.price > 0 AND l.closed_at > now() - interval '8 days';
