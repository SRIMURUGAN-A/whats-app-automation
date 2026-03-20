import { supabase } from '../lib/supabase.js';

export class LeadService {
    /**
     * Get or Create a lead by phone number
     */
    static async getOrCreateLead(phoneNumber: string) {
        // Normalize the phone number
        const clean = phoneNumber.replace(/\D/g, '');
        const base = clean.length > 10 ? clean.slice(-10) : clean;
        const normalized = `+${clean.startsWith('91') && clean.length > 10 ? clean : '91' + base}`;
        
        // Comprehensive search for any existing record with this number
        const variants = Array.from(new Set([
            normalized,
            phoneNumber,
            `+${clean}`,
            clean,
            base,
            `91${base}`
        ])).filter(v => v && v.length >= 10);

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .in('phone_number', variants)
            .limit(1)
            .maybeSingle();

        if (data) return data;

        // If not found, attempt to insert as normalized
        try {
            const { data: lead, error: insertError } = await supabase
                .from('leads')
                .insert([{ phone_number: normalized }])
                .select()
                .single();

            if (insertError) throw insertError;
            return lead;
        } catch (err: any) {
            // If it failed with a 23505 (unique violation), it means a lead was created between our select and insert.
            // Try one final retrieval.
            const { data: finalRetry } = await supabase
                .from('leads')
                .select('*')
                .in('phone_number', variants)
                .maybeSingle();
            
            if (finalRetry) return finalRetry;
            throw err;
        }
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
