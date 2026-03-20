-- Table for tracking outreach campaigns and proactive leads
CREATE TABLE IF NOT EXISTS outreach_leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT,
    phone_number TEXT NOT NULL, -- Format: +1234567890
    business_details TEXT, -- Custom info provided by user for personalization
    personalized_hook TEXT, -- The AI generated message
    status TEXT DEFAULT 'pending', -- 'pending', 'personalized', 'sent', 'replied', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for phone number to speed up lookups when they reply
CREATE INDEX IF NOT EXISTS idx_outreach_phone ON outreach_leads(phone_number);
