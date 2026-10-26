-- Kayıt sınırı: aynı adresten kısa sürede çok hesap açılmasın (ek hesap önlemi)
ALTER TABLE users ADD COLUMN register_ip TEXT;
CREATE INDEX users_register_ip_idx ON users(register_ip, created_at) WHERE register_ip IS NOT NULL;

-- Bir eşya kısa süre içinde önceki sahibine geri dönemez (ek hesaplar arasında aynı eşyayla para döngüsü kurulmasın)
ALTER TABLE inventory ADD COLUMN prev_owner BIGINT, ADD COLUMN handed_at TIMESTAMPTZ;
-- Bu değişiklikten önce açılmış, tavanın üstündeki ilanlar alınamaz (sunucu alışta tavanı kontrol eder)
