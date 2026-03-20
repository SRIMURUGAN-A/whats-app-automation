import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say hello!" }],
        });
        console.log("✅ OpenAI Works: " + response.choices[0].message.content);
    } catch (e: any) {
        console.error("❌ OpenAI Failed: ", e.message);
    }
}

testOpenAI();
