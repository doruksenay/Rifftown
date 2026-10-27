-- Karakter nitelikleri ve XP harcama sistemi (kurallar: packages/shared/src/attributes.ts).

-- Nitelikler { charm, voice, creativity, intellect, constitution, dexterity } (0–100).
-- Boş nesne: niteliği yok (oyunun kendi müzisyenleri); hesaplarda 0 sayılır, eski davranış aynen sürer.
ALTER TABLE characters ADD COLUMN attributes JSONB NOT NULL DEFAULT '{}'::jsonb;
-- Harcanmamış XP ve ömür boyu kazanılan XP
ALTER TABLE characters ADD COLUMN xp REAL NOT NULL DEFAULT 0 CHECK (xp >= 0);
ALTER TABLE characters ADD COLUMN xp_total REAL NOT NULL DEFAULT 0 CHECK (xp_total >= 0);

-- Kazanılan XP kayıtları: günlük ve haftalık tavan buradan hesaplanır
CREATE TABLE xp_log (
  id            BIGSERIAL PRIMARY KEY,
  character_id  BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  amount        REAL NOT NULL CHECK (amount > 0),
  source        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX xp_log_character_idx ON xp_log(character_id, created_at DESC);

-- Mevcut oyuncular: yeni karakterle aynı başlangıç (10 taban, ana enstrüman payı +10, role göre varsayılan
-- 20 başlangıç puanı; attributes.ts startingAttributes ile birebir aynı, test denetler). Beceri, para ve
-- diğer ilerleme olduğu gibi kalır.
UPDATE characters SET attributes = CASE
    WHEN main_instrument = 'vocals' THEN
      '{"charm":20,"voice":20,"creativity":20,"intellect":10,"constitution":10,"dexterity":10}'::jsonb
    WHEN main_instrument IN ('drums', 'percussion') THEN
      '{"charm":20,"voice":10,"creativity":10,"intellect":10,"constitution":20,"dexterity":20}'::jsonb
    ELSE
      '{"charm":10,"voice":10,"creativity":20,"intellect":20,"constitution":10,"dexterity":20}'::jsonb
  END
 WHERE NOT npc;

-- Başlangıç XP'si: 20 + şimdiye kadarki her 4 eylem saati için 1 + sahneye çıkılan her konser için 1, en fazla 150.
-- Geriye dönük verildiği için günlük/haftalık tavana sayılmaz (xp_log'a yazılmaz). Eski oyuncu birkaç haftalık
-- avantajla başlar ama hiçbir niteliği tavana çıkaramaz (bir niteliği 10'dan 100'e çıkarmak 240 XP).
WITH hrs AS (
  SELECT character_id,
         sum((params->>'hours')::real * CASE WHEN status = 'done' THEN 1 ELSE COALESCE((result->>'fraction')::real, 0) END) AS h
    FROM actions
   WHERE status IN ('done', 'cancelled')
     AND kind IN ('study', 'lesson', 'work', 'write_song', 'rehearse', 'record', 'busk', 'workout', 'craft', 'press', 'write_article', 'video', 'investigate')
     AND params ? 'hours'
   GROUP BY character_id
), gp AS (
  SELECT character_id, count(*) AS n FROM gig_performers WHERE present GROUP BY character_id
)
UPDATE characters c
   SET xp = LEAST(150, 20 + floor(COALESCE(hrs.h, 0) / 4) + COALESCE(gp.n, 0)),
       xp_total = LEAST(150, 20 + floor(COALESCE(hrs.h, 0) / 4) + COALESCE(gp.n, 0))
  FROM characters c2
  LEFT JOIN hrs ON hrs.character_id = c2.id
  LEFT JOIN gp ON gp.character_id = c2.id
 WHERE c.id = c2.id AND NOT c.npc;
