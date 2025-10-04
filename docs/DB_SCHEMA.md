Proposed DB Schema (Postgres)

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- sentences
CREATE TABLE IF NOT EXISTS sentences (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  text TEXT NOT NULL,
  hash TEXT NOT NULL,
  UNIQUE (doc_id, idx)
);

-- lookups (dictionary cache)
CREATE TABLE IF NOT EXISTS lookups (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  lang TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (term, lang)
);

-- audio_cache
CREATE TABLE IF NOT EXISTS audio_cache (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  sentence_id TEXT NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  voice TEXT NOT NULL,
  blob_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (sentence_id, voice)
);
