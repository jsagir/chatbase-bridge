# Chatbase Bridge
A simple bridge between Chatbase and Proto Persona.

## Setup
1. Deploy to Vercel
2. Add environment variables:
   - `CHATBASE_API` (your Chatbase API key)
   - `CHATBOT_ID` (your Chatbase chatbot ID)
3. Use the endpoint: `https://your-app.vercel.app/api/chat`

## API Usage
POST to `/api/chat`:
```json
{
  "conversation": [
    { "role": "user", "content": "What's your name?" },
    { "role": "assistant", "content": "I'm Nolan. Who are you?" },
    { "role": "user", "content": "My name is Bob. Great to meet you." }
  ],
  "base64Image": "data:image/png;base64, xxx..." 
}
