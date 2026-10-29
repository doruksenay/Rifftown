-- Konseri ayarlayan (playtest O-4): iptalde kiralık müzisyen ücreti, prodüksiyon payı ve sahne efektleri ödeyen kişiye
-- döner (eskiden iptal eden lidere gidiyordu; liderlik değişince para ve eşya başkasına geçiyordu).
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS booked_by BIGINT REFERENCES characters(id) ON DELETE SET NULL;
-- Bekleyen eski konserler için en olası ödeyen: grubun şu anki lideri (yalnızca boş alanı doldurur, başka veri değişmez)
UPDATE gigs g SET booked_by = b.leader_id FROM bands b
 WHERE g.band_id = b.id AND g.status = 'scheduled' AND g.booked_by IS NULL AND g.festival_id IS NULL;
