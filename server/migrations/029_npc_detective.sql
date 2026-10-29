-- Oyunun dedektifi (playtest Y-4): şehirde görevde polis oyuncu yokken faili meçhul suçlar hiç çözülmüyordu. Her faili
-- meçhul suça bir kez NPC soruşturması bakar; baktığı an burada yazılır (yalnızca ekleme, eski suçlar boş).
ALTER TABLE crimes ADD COLUMN IF NOT EXISTS npc_checked_at TIMESTAMPTZ;
