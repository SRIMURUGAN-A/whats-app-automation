import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Based on your specific key's availability, we use the 2.0 series
// Adding 'models/' prefix ensures the SDK finds it correctly
const chatModel = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });
const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' });

export class AIService {
    /**
     * Generate embeddings for text chunks using Gemini (768 dimensions)
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        try {
            // Trying standard embedding with models/ prefix
            const result = await embeddingModel.embedContent(text);
            const embedding = result.embedding.values;
            
            if (!embedding || embedding.length === 0) {
                throw new Error('Empty embedding received');
            }
            return embedding;
        } catch (error: any) {
            console.error('Gemini Embedding Error:', error.message);
            // Fallback to zero vector if embedding fails (prevents RAG crash)
            return new Array(768).fill(0);
        }
    }

    /**
     * Generate a sales response based on context and user message
     */
    static async generateResponse(message: string, context: string, history: any[] = []): Promise<string> {
        const historyContext = history.map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.message}`).join('\n');
        
        const systemPrompt = `
You are a proactive and helpful AI Sales Assistant for our digital business.
Your goal is to inform, engage, and convert leads into customers for websites and automation services.

PERSONALITY:
- Professional, yet friendly and conversational.
- Grounded in facts provided in the context below.

KNOWLEDGE CONTEXT:
${context}

CONVERSATION HISTORY:
${historyContext}

USER MESSAGE:
${message}

INSTRUCTIONS:
- Use ONLY the knowledge provided above. 
- Short and clear responses (optimized for WhatsApp).
- Format with simple emojis to keep it engaging.
- Conclude with a relevant follow-up question.
`;

        try {
            const result = await chatModel.generateContent(systemPrompt);
            return result.response.text();
        } catch (error: any) {
            console.error('Gemini Chat Error:', error.message);
            return 'Sorry, I am having trouble processing that right now. Let me connect you with a real person 👨‍💻';
        }
    }

    /**
     * Extract intent and business details from a message
     */
    static async understandQuery(message: string) {
        const prompt = `
Analyze the following user message for a sales business.
Extract: 
1. Intent (website, automation, pricing, help, unknown)
2. Business Type (if mentioned)
3. Urgency (low, medium, high)

User: ${message}

Return ONLY a raw JSON object: { "intent": "string", "business": "string", "urgency": "string" }
`;
        try {
            const result = await chatModel.generateContent(prompt);
            const responseText = result.response.text();
            
            const cleanedJSON = responseText.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedJSON);
        } catch (e) {
            return { intent: "unknown" };
        }
    }
}
