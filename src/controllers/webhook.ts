import { Request, Response } from 'express';
import { LeadService } from '../services/lead.js';
import { KnowledgeService } from '../services/knowledge.js';
import { AIService } from '../services/ai.js';
import { WhatsAppService } from '../services/whatsapp.js';
import { supabase } from '../lib/supabase.js';

export class WebhookController {
    /**
     * Handle incoming WhatsApp messages from Twilio
     */
    static async handleWhatsAppMessage(req: Request, res: Response) {
        try {
            const body = req.body;
            const fromFull = body.From.replace('whatsapp:', '');
            const cleanFrom = fromFull.replace(/\D/g, '');
            const fromBase = cleanFrom.length > 10 ? cleanFrom.slice(-10) : cleanFrom;
            const userMessage = body.Body;

            console.log(`[LifeCycle] 📨 Webhook hit for ${fromFull}: ${userMessage}`);

            // 1. Get or Create Lead
            const lead = await LeadService.getOrCreateLead(fromFull);
            console.log(`[LifeCycle] 🧬 Identified lead ID: ${lead.id} [Status: ${lead.status}]`);
            await LeadService.recordMessage(lead.id, 'user', userMessage);

            // Transition from 'sent' outreach to 'replied' if this is their first message after outreach
            if (lead.status === 'outreach_sent') {
                console.log(`[LifeCycle] 🎯 Converting outreach lead to replied...`);
                await supabase.from('leads').update({ status: 'new' }).eq('id', lead.id);
                // Search for ANY form of the phone number in the outreach_leads table
                await supabase.from('outreach_leads')
                    .update({ status: 'replied' })
                    .or(`phone_number.eq.${fromFull},phone_number.eq.${cleanFrom},phone_number.eq.${fromBase}`);
                console.log(`Outreach lead ${fromFull} has REPLIED! Converting to regular lead.`);
            }

            // 2. Query Understanding (Optional: use for more logic)
            console.log(`[LifeCycle] 🧠 Analyzing query...`);
            const queryDetails = await AIService.understandQuery(userMessage);

            // 3. RAG: Retrieve context from vector DB
            console.log(`[LifeCycle] 📖 Searching knowledge base...`);
            const context = await KnowledgeService.retrieveRelevantChunks(userMessage);

            // 4. Conversation History
            const history = await LeadService.getHistory(lead.id, 5);

            // 5. Generate AI Response
            console.log(`[LifeCycle] 🤖 Generating AI reply...`);
            const aiResponse = await AIService.generateResponse(userMessage, context, history);

            // 6. Send WhatsApp Response
            console.log(`[LifeCycle] 📲 Sending WhatsApp reply via Twilio (to: ${fromFull})...`);
            await WhatsAppService.sendMessage(fromFull, aiResponse);
            await LeadService.recordMessage(lead.id, 'ai', aiResponse);

            // 7. Lead Scoring
            await LeadService.updateLeadScore(lead.id, userMessage);

            // 8. Human Handoff Notification (already handled in LeadService)
            if (lead.status === 'HOT') {
                console.log(`Lead ${fromFull} is HOT! Notifying human...`);
                // You can add logic here to notify you via email or Slack
            }

            return res.status(200).send('OK');
        } catch (error: any) {
            console.error('Webhook Error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
}
