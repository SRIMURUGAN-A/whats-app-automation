import { supabase } from '../lib/supabase.js';

export class LeadService {
    /**
     * Get or Create a lead by phone number
     */
    static async getOrCreateLead(phoneNumber: string) {
        // Strip non-numeric characters and get the base 10 digits
        const clean = phoneNumber.replace(/\D/g, '');
        const base = clean.length > 10 ? clean.slice(-10) : clean;
        const normalized = `+${clean.startsWith('91') && clean.length > 10 ? clean : '91' + base}`;
        
        // Search for any form of the number to avoid duplicate leads
        const variants = [phoneNumber, clean, base, normalized, `+${clean}`];

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .in('phone_number', variants)
            .maybeSingle();

        // If not found, create it as the normalized version
        if (!data) {
            const { data: lead, error: insertError } = await supabase
                .from('leads')
                .insert([{ phone_number: normalized }])
                .select()
                .maybeSingle();

            if (insertError) {
                // If it still fails due to a race condition or existing number, try one last lookup
                const { data: retryLead } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('phone_number', normalized)
                    .maybeSingle();
                
                if (retryLead) return retryLead;
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
    /**
     * Get recent conversation history globally
     */
    static async getAllConversations(limit = 10) {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                leads (
                    id,
                    name,
                    phone_number
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching global history:', error);
            throw error;
        }

        return data;
    }
}
