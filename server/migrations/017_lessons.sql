-- Özel ders ve ilişkiye dayalı öğrenme (packages/shared/src/lessons.ts).
-- Oyuncu öğretmenin saatlik ders ücreti (NULL: ders vermiyor).
ALTER TABLE characters ADD COLUMN lesson_price INTEGER CHECK (lesson_price IS NULL OR (lesson_price >= 1 AND lesson_price <= 1000));

-- Verilen dersler: kontenjan, bekleme süresi ve kazanç tavanları buradan hesaplanır.
CREATE TABLE lesson_log (
  id           BIGSERIAL PRIMARY KEY,
  student_id   BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  teacher_id   BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('professor', 'teacher', 'friend', 'invite')),
  professor_id TEXT,
  skill        TEXT NOT NULL,
  hours        REAL NOT NULL DEFAULT 0,
  fee          INTEGER NOT NULL DEFAULT 0 CHECK (fee >= 0),
  teacher_earned INTEGER NOT NULL DEFAULT 0 CHECK (teacher_earned >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX lesson_log_student_idx ON lesson_log(student_id, created_at DESC);
CREATE INDEX lesson_log_teacher_idx ON lesson_log(teacher_id, created_at DESC);
