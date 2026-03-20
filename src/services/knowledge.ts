import { supabase } from '../lib/supabase.js';
import { AIService } from './ai.js';

export class KnowledgeService {
    /**
     * Search the vector database for relevant business knowledge
     */
    static async retrieveRelevantChunks(query: string, match_threshold = 0.5, match_count = 3): Promise<string> {
        // 1. Generate embedding for query
        const queryEmbedding = await AIService.generateEmbedding(query);

        // 2. Query Supabase vector database
        const { data, error } = await supabase.rpc('match_knowledge', {
            query_embedding: queryEmbedding,
            match_threshold: match_threshold,
            match_count: match_count,
        });

        if (error || !data) {
            console.error('Error searching knowledge base or no data returned:', error?.message);
            return '';
        }

        // 3. Return joined chunks as context
        return data.map((chunk: any) => chunk.content).join('\n---\n');
    }

    /**
     * Helper to add knowledge to the database
     */
    static async insertKnowledgeChunk(content: string, metadata: object = {}) {
        const embedding = await AIService.generateEmbedding(content);
        const { error } = await supabase.from('knowledge_base').insert([
            { content, metadata, embedding }
        ]);

        if (error) {
            console.error('Error inserting knowledge chunk:', error);
            throw error;
        }
    }
}
