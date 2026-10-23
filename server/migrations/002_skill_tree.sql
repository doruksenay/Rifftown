-- Beceri ağacına geçiş: eski 7 beceri Popmundo tarzı kademeli becerilere dönüştürülür.
-- Eski sistemde herkes her enstrümanda 2 puanla başlıyordu; 2 ve altı "hiç öğrenilmemiş" sayılır.

CREATE OR REPLACE FUNCTION pg_temp.keep(v numeric) RETURNS numeric AS $$
  SELECT CASE WHEN v IS NOT NULL AND v > 2 THEN v ELSE NULL END
$$ LANGUAGE sql IMMUTABLE;

UPDATE characters SET skills = jsonb_strip_nulls(jsonb_build_object(
  'vocals',           pg_temp.keep((skills->>'vocals')::numeric),
  'basic_singing',    pg_temp.keep((skills->>'vocals')::numeric),
  'guitar',           pg_temp.keep((skills->>'guitar')::numeric),
  'bass',             pg_temp.keep((skills->>'bass')::numeric),
  'basic_strings',    pg_temp.keep(GREATEST((skills->>'guitar')::numeric, (skills->>'bass')::numeric)),
  'drums',            pg_temp.keep((skills->>'drums')::numeric),
  'basic_percussion', pg_temp.keep((skills->>'drums')::numeric),
  'keys',             pg_temp.keep((skills->>'keys')::numeric),
  'basic_keyboard',   pg_temp.keep((skills->>'keys')::numeric),
  'composing',        COALESCE((skills->>'songwriting')::numeric, 5),
  'lyrics',           COALESCE((skills->>'songwriting')::numeric, 5),
  'showmanship',      COALESCE((skills->>'stage')::numeric, 5)
))
WHERE skills ? 'songwriting';
