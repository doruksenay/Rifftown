-- /me ucunun sayaçları için dizinler (playtest O-10: 250 eşzamanlı oyuncuda p50 2,6 sn).
-- Okunmamış bildirim sayısı eskiden oyuncunun bütün bildirimlerini tarıyordu; bekleyen grup daveti oyuncuya göre
-- aranamıyordu (dizin band_id ile başlıyor). Yalnızca ekleme.
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(character_id) WHERE NOT read;
CREATE INDEX IF NOT EXISTS band_invites_char_pending_idx ON band_invites(character_id) WHERE status = 'pending';
