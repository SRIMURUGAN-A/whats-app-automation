import { supabase } from '../lib/supabase.js';

export class LeadService {
    /**
     * Get or Create a lead by phone number
     */
    static async getOrCreateLead(phoneNumber: string) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();

        if (error || !data) {
            const { data: lead, error: insertError } = await supabase
                .from('leads')
                .insert([{ phone_number: phoneNumber }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating lead:', insertError);
                throw insertError;
            }
            return lead;
        }

        return data;
    }

    /**
     * Update lead score based on message content
     */
    static async updateLeadScore(leadId: string, message: string) {
        let scoreIncrement = 0;
        const lowerMessage = message.toLowerCase();

        // Lead scoring rules
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            scoreIncrement += 5;
        }
        if (lowerMessage.includes('interested') || lowerMessage.includes('want')) {
            scoreIncrement += 10;
        }
        if (lowerMessage.includes('website') || lowerMessage.includes('automation')) {
            scoreIncrement += 5;
        }

        if (scoreIncrement > 0) {
            const { data: lead } = await supabase
                .from('leads')
                .select('lead_score, status')
                .eq('id', leadId)
                .single();

            const newScore = (lead?.lead_score || 0) + scoreIncrement;
            const updates: any = { lead_score: newScore, last_contacted_at: new Date() };

            if (newScore >= 20 && lead?.status !== 'HOT') {
                updates.status = 'HOT';
                console.log(`Lead ${leadId} is now HOT! 🔥`);
                // TODO: Notify human (e.g., Slack or email)
            }

            await supabase.from('leads').update(updates).eq('id', leadId);
        }
    }

    /**
     * Get recent conversation history
     */
    static async getHistory(leadId: string, limit = 5) {
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return (data || []).reverse();
    }

    /**
     * Record a message
     */
    static async recordMessage(leadId: string, sender: 'user' | 'ai', message: string) {
        await supabase.from('conversations').insert([{ lead_id: leadId, sender, message }]);
    }
}
