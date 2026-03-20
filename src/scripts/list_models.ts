import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function listModels() {
    try {
        // Unfortunately the @google/generative-ai SDK doesn't have a direct listModels yet? 
        // No, it should be genAI.getGenerativeModel({ model: "model-name" })... 
        // Let's try a different one: "text-embedding-004" again but with different initialization.
        console.log("Listing models is not directly supported in this SDK version without a client. Let's try text-embedding-004 with v1");
    } catch (e) {
        console.error(e);
    }
}

listModels();
