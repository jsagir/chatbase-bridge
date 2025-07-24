# Chatbase Bridge

A simple bridge between Chatbase and Proto Persona.

## Setup

1. Deploy to Vercel
2. Add environment variables:
   - `CHATBASE_API_KEY`
   - `CHATBOT_ID`
3. Use the endpoint: `https://your-app.vercel.app/api/chat`

## API Usage

POST to `/api/chat`:
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ]
}
```

Response:
```json
{
  "response": "Chatbot response here"
}
```