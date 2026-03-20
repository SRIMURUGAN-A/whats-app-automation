import axios from 'axios';
import dotenv from 'dotenv';
import { supabase } from '../lib/supabase.js';

dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
let twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Normalize twilioPhoneNumber to E.164
if (twilioPhoneNumber && !twilioPhoneNumber.startsWith('+')) {
    twilioPhoneNumber = `+${twilioPhoneNumber}`;
}

const authHeader = `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`;

export class WhatsAppService {
    /**
     * Send a WhatsApp message via Twilio API
     */
    static async sendMessage(to: string, message: string) {
        // WhatsApp API (Twilio) requires E.164 format (e.g. +917904003470)
        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) {
            // Assume +91 if 10 digits and no prefix, or just prefix with +
            if (formattedTo.length === 10) {
                formattedTo = `+91${formattedTo}`;
                console.log(`Auto-formatted 10-digit number to: ${formattedTo}`);
            } else {
                formattedTo = `+${formattedTo}`;
            }
        }

        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

        const data = new URLSearchParams();
        data.append('To', `whatsapp:${formattedTo}`);
        data.append('From', `whatsapp:${twilioPhoneNumber}`);
        data.append('Body', message);

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log(`✅ Message SENT via Twilio (SID: ${response.data.sid}) to ${formattedTo}`);
            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error(`❌ Twilio ERROR [${error.response?.status}]: ${errorMsg}`);
            throw new Error(`WhatsApp Send Failure: ${errorMsg}`);
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
