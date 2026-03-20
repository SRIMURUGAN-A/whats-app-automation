import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.js';

const router = Router();

// Twilio Webhook URL
// POST /api/webhook/whatsapp
router.post('/webhook/whatsapp', WebhookController.handleWhatsAppMessage);

export default router;
