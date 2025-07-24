const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    // Get credentials from environment
    const CHATBASE_API_KEY = process.env.CHATBASE_API;
    const CHATBOT_ID = process.env.CHATBOT_ID;
    
    if (!CHATBASE_API_KEY || !CHATBOT_ID) {
      return res.status(500).json({
        error: 'Missing configuration. Please set environment variables.'
      });
    }
    
    // Get message from request
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request. Expected messages array.'
      });
    }
    
    // Get the user's message
    const userMessage = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');
    
    // Call Chatbase API
    const response = await axios.post(
      'https://www.chatbase.co/api/v1/chat',
      {
        messages: [{ role: 'user', content: userMessage }],
        chatbotId: CHATBOT_ID,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${CHATBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send response
    const botResponse = response.data.text || response.data.answer || 'No response';
    
    return res.status(200).json({ response: botResponse });
    
  } catch (error) {
    console.error('Error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to get response',
      details: error.message
    });
  }
};
