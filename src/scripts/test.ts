import { supabase } from '../lib/supabase.js';
import { AIService } from '../services/ai.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnectivity() {
    console.log("🔍 Checking Connectivity...");

    try {
        // Test Supabase
        const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log("✅ Supabase: Connected!");
    } catch (e: any) {
        console.error("❌ Supabase: Connection failed (Ensure you ran database_setup.sql!)", e.message);
    }

    try {
        // Test OpenAI
        const result = await AIService.generateEmbedding("test");
        console.log("✅ OpenAI: Embedding generated successfully (Length: " + result.length + ")");
    } catch (e: any) {
        console.error("❌ OpenAI: Failed to connect", e.message);
    }
}

testConnectivity();
