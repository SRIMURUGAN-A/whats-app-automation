import { Router, Request, Response } from 'express';
import { OutreachService } from '../services/outreach.js';
import { LeadService } from '../services/lead.js';

const router = Router();

/**
 * Add individual or bulk leads
 */
router.post('/leads', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const leads = Array.isArray(body) ? body : [body];
        
        // Basic validation
        const validLeads = leads.filter(l => l.phone_number && l.name);
        
        if (validLeads.length === 0) {
            return res.status(400).json({ error: 'At least one valid lead with phone_number and name is required.' });
        }

        const data = await OutreachService.addLeads(validLeads);
        return res.status(201).json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Personalize all pending leads via AI
 */
router.post('/campaign/personalize', async (req: Request, res: Response) => {
    try {
        const result = await OutreachService.personalizePendingLeads();
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Send personalized outreach via WhatsApp
 */
router.post('/campaign/launch', async (req: Request, res: Response) => {
    try {
        const result = await OutreachService.launchCampaign();
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Get outreach stats
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await OutreachService.getStats();
        return res.json(stats);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Get entire outreach pool (Leads Table)
 */
router.get('/pool', async (req: Request, res: Response) => {
    try {
        const pool = await OutreachService.getPool();
        return res.json(pool);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Get global conversation history
 */
router.get('/history', async (req: Request, res: Response) => {
    try {
        const history = await LeadService.getAllConversations();
        return res.json(history);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Get system config (public view)
 */
router.get('/config', async (req: Request, res: Response) => {
    return res.json({
        whatsapp_provider: 'Twilio Chat API',
        ai_model: 'Gemini 1.5 Pro (Google Cloud)',
        connected: true,
        last_sync: new Date(),
        region: 'US-WEST-4'
    });
});

export default router;
