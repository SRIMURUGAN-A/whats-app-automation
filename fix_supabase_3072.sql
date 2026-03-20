-- 1. Drop the search function to avoid signature conflicts
DROP FUNCTION IF EXISTS match_knowledge(VECTOR, FLOAT, INT);

-- 2. IMPORTANT: Clear existing embeddings first! 
-- You cannot change vector size if the column has data with the wrong dimension.
UPDATE knowledge_base SET embedding = NULL;

-- 3. Update knowledge_base table for Gemini Embedding 001 (3072 dimensions)
ALTER TABLE IF EXISTS knowledge_base 
ALTER COLUMN embedding TYPE VECTOR(3072);

-- 4. RE-CREATE Vector Search Function for RAG (Corrected dimensions: 3072)
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(3072),
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
