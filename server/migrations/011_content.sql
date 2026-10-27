-- İçerik hacmi: görev zincirleri (adım adım, ömür boyu istatistiklere bakan kısa hikâyeler)
CREATE TABLE chain_claims (
  character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  chain_id     TEXT NOT NULL,
  step         INTEGER NOT NULL CHECK (step >= 0),
  reward       INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, chain_id, step)
);
