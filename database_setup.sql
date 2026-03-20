-- Enable pgvector extension for AI and vector storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store knowledge chunks for RAG
CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536) -- For OpenAI text-embedding-ada-002 or text-embedding-3-small
);

-- Table for tracking leads
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  interest_level TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Table for conversation history
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id),
  sender TEXT NOT NULL, -- 'user' or 'ai'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector Search Function for RAG
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
