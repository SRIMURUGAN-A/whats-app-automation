import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.js';
import outreachRoutes from './outreach.js';

const router = Router();

// Twilio Webhook URL
// POST /api/webhook/whatsapp
router.post('/webhook/whatsapp', WebhookController.handleWhatsAppMessage);

// Outreach / Campaign Routes
router.use('/outreach', outreachRoutes);

export default router;
