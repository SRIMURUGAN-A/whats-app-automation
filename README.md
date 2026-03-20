# WhatsApp Sales AI Agent with RAG 🚀

Full-fledged, knowledge-driven sales assistant that uses Supabase (Vector DB), OpenAI (RAG Pipeline), and Twilio (WhatsApp API) to automate leads and outreach.

## 🛠 Features
- **Lead Input**: Store your phone numbers in Supabase.
- **Initial Outreach**: Send automated template messages.
- **AI RAG Pipeline**:
  - **Query Understanding**: AI extracts intent, business type, and urgency.
  - **Retrieval**: Searches the Knowledge Base using vector embeddings.
  - **Response Generation**: LLM (GPT-4o) replies based on retrieved facts and history.
- **Memory & Scoring**: Remembers last 5 messages and updates lead scores (Hot/Cool).
- **Human Handoff**: Notifies you when a lead becomes "HOT" (score > 20).

## 📁 Project Structure
- `src/index.ts`: Main server entry point.
- `src/controllers/webhook.ts`: Handles incoming WhatsApp messages from Twilio.
- `src/services/openai.ts`: LLM responses and embeddings logic.
- `src/services/knowledge.ts`: Vector search and ingestion.
- `src/services/lead.ts`: Lead tracking, scoring, and history management.
- `src/services/whatsapp.ts`: Twilio integration logic.
- `src/scripts/ingest.ts`: Script to seed your knowledge base.

## 🚀 Setup Guide

### 1. Database (Supabase)
- Create a new project in [Supabase](https://supabase.com).
- Open the **SQL Editor** and run the contents of [database_setup.sql](./database_setup.sql).
- This will enable `pgvector` and create the `knowledge_base`, `leads`, and `conversations` tables.

### 2. Environment Variables
- Copy `.env.example` to `.env`.
- Fill in your `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `TWILIO` credentials.

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Data (RAG Ingestion)
- Edit `src/scripts/ingest.ts` with your specific pricing, services, and FAQs.
- Run the ingestion script:
```bash
npx nodemon --exec ts-node src/scripts/ingest.ts
```

### 5. Start the Server
```bash
npm run dev
```

### 6. Twilio Webhook Setup
- Use **ngrok** to expose your local port `3000` (e.g., `ngrok http 3000`).
- Copy the public URL (e.g., `https://xxxx-xxxx.ngrok-free.app/api/webhook/whatsapp`).
- Go to your **Twilio Console** > **WhatsApp Sandbox Settings**.
- Paste the URL into the **"When a message comes in"** webhook field.

## 🔥 Strategy for Success
1. **Upload Leads**: Add your target numbers into the `leads` table.
2. **Initial Trigger**: Use `WhatsAppService.sendOutreach()` to ping them first.
3. **Automated Sales**: Let the bot handle the context-aware replies.
4. **Close the Deal**: When a lead status hits `HOT`, jump in to close!

---

💡 **Built with Antigravity AI**
