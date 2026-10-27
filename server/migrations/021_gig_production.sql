-- Büyük sahnede prodüksiyon gideri (denge raporu §2): konser ayarlanırken lider peşin öder, iptalde yarısı geri verilir.
-- Yalnızca ekleme; eski konserlerin gideri 0.
ALTER TABLE gigs ADD COLUMN production_cost INTEGER NOT NULL DEFAULT 0;
