import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function testAllModels() {
    const models = [
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-flash-lite-latest',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];

    console.log("🔍 Checking model availability via v1beta...");
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`✅ Model ${m} works!`);
        } catch (e: any) {
            console.log(`❌ Model ${m} fails: ${e.message}`);
        }
    }
}

testAllModels();
