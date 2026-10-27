-- Karar derinliği: şarkıda alt tür ve tempo, konserde performans planı (sahne olayları ve bis).

ALTER TABLE songs
  ADD COLUMN subgenre TEXT,
  ADD COLUMN tempo TEXT NOT NULL DEFAULT 'mid' CHECK (tempo IN ('slow', 'mid', 'fast'));

-- {"events": ["banter", ...], "encore": "none" | "safe" | "bold"}
ALTER TABLE gigs ADD COLUMN plan JSONB NOT NULL DEFAULT '{}';
