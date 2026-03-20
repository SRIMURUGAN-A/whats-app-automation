import { supabase } from '../lib/supabase.js';
import { AIService } from './ai.js';
import { WhatsAppService } from './whatsapp.js';

export class OutreachService {
    /**
     * Add a lead to the outreach queue
     */
    static async addLeads(leads: { name: string, company_name: string, phone_number: string, business_details?: string }[]) {
        const normalizedLeads = leads.map(l => {
            const clean = l.phone_number.replace(/\D/g, '');
            const base = clean.length > 10 ? clean.slice(-10) : clean;
            const normalized = `+${clean.startsWith('91') && clean.length > 10 ? clean : '91' + base}`;
            return { ...l, phone_number: normalized };
        });

        const { data, error } = await supabase
            .from('outreach_leads')
            .insert(normalizedLeads)
            .select();

        if (error) {
            console.error('Error adding outreach leads:', error);
            throw error;
        }

        return data;
    }

    /**
     * Generate personalized hooks for pending leads
     */
    static async personalizePendingLeads() {
        const { data: leads, error } = await supabase
            .from('outreach_leads')
            .select('*')
            .eq('status', 'pending');

        if (error) {
            console.error('Error fetching pending leads:', error);
            throw error;
        }

        const personalizedCount = 0;
        for (const lead of leads) {
            try {
                const prompt = `
Generate a highly personalized, friendly, and professional WhatsApp outreach hook for this potential client.
Keep it under 300 characters. Use emojis sparingly.
The goal is to offer them website development or automation services.

CLIENT DETAILS:
- Name: ${lead.name}
- Company: ${lead.company_name}
- Specific Interests/Details: ${lead.business_details || 'Generic website/automation services'}

INSTRUCTIONS:
- Address them by name.
- Mention their company.
- Include a specific observation or potential benefit.
- End with a low-pressure open-ended question.

Return ONLY the personalized message text.
`;
                // Reusing AIService with a direct chat generation for speed
                const result = await AIService.generateResponse(prompt, "You are a personalized sales outreach expert.", []);
                
                await supabase
                    .from('outreach_leads')
                    .update({ 
                        personalized_hook: result, 
                        status: 'personalized',
                        last_action_at: new Date()
                    })
                    .eq('id', lead.id);
                
                console.log(`Personalized hook for ${lead.name} (${lead.company_name})`);
            } catch (err) {
                console.error(`Failed to personalize for lead ${lead.id}:`, err);
            }
        }
        
        return { count: leads.length };
    }

    /**
     * Send personalized messages to leads
     */
    static async launchCampaign() {
        const { data: leads, error } = await supabase
            .from('outreach_leads')
            .select('*')
            .eq('status', 'personalized');

        if (error) {
            console.error('Error fetching personalized leads:', error);
            throw error;
        }

        let sentCount = 0;
        for (const lead of leads) {
            try {
                await WhatsAppService.sendMessage(lead.phone_number, lead.personalized_hook);
                
                // Track in outreach_leads
                await supabase
                    .from('outreach_leads')
                    .update({ 
                        status: 'sent',
                        last_action_at: new Date()
                    })
                    .eq('id', lead.id);
                
                // Also ensure a Lead entry exists in the main leads table so the webhook system handles replies
                const { data: mainLead } = await supabase
                    .from('leads')
                    .upsert({ 
                        phone_number: lead.phone_number, 
                        name: lead.name, 
                        business_type: lead.company_name,
                        status: 'outreach_sent',
                        metadata: { outreach_lead_id: lead.id }
                    })
                    .select()
                    .single();

                // Record the outreach message in conversation history
                if (mainLead) {
                    await supabase.from('conversations').insert({
                        lead_id: mainLead.id,
                        sender: 'ai',
                        message: lead.personalized_hook
                    });
                }

                sentCount++;
                console.log(`Campaign message sent to ${lead.phone_number}`);
                
                // Add a small delay for Twilio/WhatsApp limits
                await new Promise(res => setTimeout(res, 1000));
            } catch (err) {
                console.error(`Failed to send message to ${lead.phone_number}:`, err);
                await supabase
                    .from('outreach_leads')
                    .update({ status: 'failed' })
                    .eq('id', lead.id);
            }
        }

        return { sentCount };
    }

    /**
     * Basic stats for the dashboard
     */
    static async getStats() {
        const { data, error } = await supabase
            .from('outreach_leads')
            .select('status');
        
        if (error) return { total: 0 };

        const stats = {
            total: data.length,
            pending: data.filter(l => l.status === 'pending').length,
            personalized: data.filter(l => l.status === 'personalized').length,
            sent: data.filter(l => l.status === 'sent').length,
            replied: data.filter(l => l.status === 'replied').length,
            failed: data.filter(l => l.status === 'failed').length
        };
        
        return stats;
    }

    /**
     * Get all outreach leads for the CRM
     */
    static async getPool() {
        const { data, error } = await supabase
            .from('outreach_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching outreach pool:', error);
            throw error;
        }

        return data;
    }
}
