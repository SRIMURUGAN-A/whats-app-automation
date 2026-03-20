import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function testGeminiOpenAI() {
    console.log("🔍 Testing Gemini via OpenAI Bridge...");
    try {
        const response = await client.chat.completions.create({
            model: "gemini-1.5-flash",
            messages: [{ role: "user", content: "Say hello!" }],
        });
        console.log("✅ Success: " + response.choices[0].message.content);
    } catch (e: any) {
        console.error("❌ Failed: ", e.message);
    }
}

testGeminiOpenAI();
