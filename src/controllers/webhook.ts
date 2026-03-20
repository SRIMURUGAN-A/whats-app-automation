import { Request, Response } from 'express';
import { LeadService } from '../services/lead.js';
import { KnowledgeService } from '../services/knowledge.js';
import { AIService } from '../services/ai.js';
import { WhatsAppService } from '../services/whatsapp.js';

export class WebhookController {
    /**
     * Handle incoming WhatsApp messages from Twilio
     */
    static async handleWhatsAppMessage(req: Request, res: Response) {
        try {
            const body = req.body;
            const from = body.From.replace('whatsapp:', '');
            const userMessage = body.Body;

            console.log(`Received message from ${from}: ${userMessage}`);

            // 1. Get or Create Lead
            const lead = await LeadService.getOrCreateLead(from);
            await LeadService.recordMessage(lead.id, 'user', userMessage);

            // 2. Query Understanding (Optional: use for more logic)
            const queryDetails = await AIService.understandQuery(userMessage);
            console.log(`Query Analysis:`, queryDetails);

            // 3. RAG: Retrieve context from vector DB
            const context = await KnowledgeService.retrieveRelevantChunks(userMessage);

            // 4. Conversation History
            const history = await LeadService.getHistory(lead.id, 5);

            // 5. Generate AI Response
            const aiResponse = await AIService.generateResponse(userMessage, context, history);

            // 6. Send WhatsApp Response
            await WhatsAppService.sendMessage(from, aiResponse);
            await LeadService.recordMessage(lead.id, 'ai', aiResponse);

            // 7. Lead Scoring
            await LeadService.updateLeadScore(lead.id, userMessage);

            // 8. Human Handoff Notification (already handled in LeadService)
            if (lead.status === 'HOT') {
                console.log(`Lead ${from} is HOT! Notifying human...`);
                // You can add logic here to notify you via email or Slack
            }

            return res.status(200).send('OK');
        } catch (error: any) {
            console.error('Webhook Error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
}
