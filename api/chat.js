const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    const CHATBASE_API_KEY = process.env.CHATBASE_API;
    const CHATBOT_ID = process.env.CHATBOT_ID;
    
    if (!CHATBASE_API_KEY || !CHATBOT_ID) {
      return res.status(500).json({
        error: 'Missing configuration. Please set environment variables.'
      });
    }
    
    const { conversation } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({
        error: 'Invalid request. Expected conversation array.'
      });
    }
    
    console.log('Calling Chatbase without HMAC...');
    
    const response = await axios.post(
      'https://www.chatbase.co/api/v1/chat',
      {
        messages: conversation,
        chatbotId: CHATBOT_ID,
        stream: false
        // NO user_id or user_hash
      },
      {
        headers: {
          'Authorization': `Bearer ${CHATBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const botResponse = response.data.text || response.data.answer || 'No response';
    return res.status(200).json({ response: botResponse });
    
  } catch (error) {
    console.error('Chatbase API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return res.status(500).json({
      error: 'Failed to get response',
      details: error.message,
      status: error.response?.status,
      apiResponse: error.response?.data
    });
  }
};
