import { KnowledgeService } from '../services/knowledge.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Example knowledge blocks for digital services (Website / Automation)
 */
const knowledgeBase = [
    {
        content: "Basic Website pricing starts from ₹10,000 for a single page landing page. Features include mobile responsiveness, SEO optimization, and call-to-action buttons.",
        metadata: { type: "pricing", service: "website" }
    },
    {
        content: "Professional Website pricing (₹25,000 - ₹50,000) includes multi-page sites, custom designs, dynamic content, and basic e-commerce functionality.",
        metadata: { type: "pricing", service: "website" }
    },
    {
        content: "Our Automation Services include WhatsApp chatbots, CRM integrations, and data scraping. Prices start from ₹15,000 depending on complexity.",
        metadata: { type: "service", service: "automation" }
    },
    {
        content: "For e-commerce sites, we provide payment gateway integration (Razorpay/Stripe), inventory management, and a customer dashboard.",
        metadata: { type: "feature", service: "ecommerce" }
    },
    {
        content: "Case Study: We helped a local retail shop increase sales by 40% using a custom WhatsApp bot and a mobile-friendly inventory site.",
        metadata: { type: "case_study" }
    }
];

async function runIngestion() {
    console.log("🚀 Starting Knowledge Ingestion...");
    try {
        for (const item of knowledgeBase) {
            console.log(`Ingesting chunk: ${item.content.substring(0, 50)}...`);
            await KnowledgeService.insertKnowledgeChunk(item.content, item.metadata);
        }
        console.log("✅ Ingestion complete!");
    } catch (error) {
        console.error("❌ Error during ingestion:", error);
    }
}

runIngestion();
