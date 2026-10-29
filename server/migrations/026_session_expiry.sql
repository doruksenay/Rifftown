-- Oturum süresi (playtest Y-6): oturumlar artık mutlak (SESSION_MAX_DAYS, varsayılan 90 gün) ve boşta
-- (SESSION_IDLE_DAYS, varsayılan 30 gün) süreyle biter. valid_from sürenin başladığı an: yeni oturumda oluşturulduğu an.
-- Mevcut oturumlar bir anda düşmesin diye bu migration'ın çalıştığı andan başlar (varsayılan now(); veri dönüşümü yok).
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ NOT NULL DEFAULT now();
