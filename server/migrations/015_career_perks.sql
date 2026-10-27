-- Kariyer becerilerinin etkileri (packages/shared/src/perks.ts).
-- Sözleşme hukuku: grup liderinin becerisiyle grubun payı %60'tan en fazla %65'e çıkabilir.
-- Yalnızca üst sınır genişler; eski sözleşmeler (0,3–0,6) geçerliliğini korur.
ALTER TABLE label_contracts DROP CONSTRAINT IF EXISTS label_contracts_band_share_check;
ALTER TABLE label_contracts ADD CONSTRAINT label_contracts_band_share_check CHECK (band_share >= 0.3 AND band_share <= 0.65);
