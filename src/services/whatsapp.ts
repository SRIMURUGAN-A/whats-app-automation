import axios from 'axios';
import dotenv from 'dotenv';
import { supabase } from '../lib/supabase.js';

dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const authHeader = `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`;

export class WhatsAppService {
    /**
     * Send a WhatsApp message via Twilio API
     */
    static async sendMessage(to: string, message: string) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

        const data = new URLSearchParams();
        data.append('To', `whatsapp:${to}`);
        data.append('From', `whatsapp:${twilioPhoneNumber}`);
        data.append('Body', message);

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log(`Message sent to ${to}: ${message}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error sending message: ${error.response?.data || error.message}`);
            throw error;
        }
    }

    /**
     * Send an initial outreach template (example)
     */
    static async sendOutreach(to: string, name: string) {
        const message = `Hi ${name} 👋, we help businesses grow with websites & automation. Are you interested in improving your business digitally?`;
        return this.sendMessage(to, message);
    }
}
