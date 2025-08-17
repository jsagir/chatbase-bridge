const axios = require('axios');
const crypto = require('crypto');

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
    const CHATBASE_SECRET_KEY = process.env.CHATBASE_SECRET_KEY;
    
    console.log('Environment check:', { 
      hasApi: !!process.env.CHATBASE_API, 
      hasBot: !!process.env.CHATBOT_ID, 
      hasSecret: !!process.env.CHATBASE_SECRET_KEY,
      secretLength: process.env.CHATBASE_SECRET_KEY?.length
    });
    
    if (!CHATBASE_API_KEY || !CHATBOT_ID || !CHATBASE_SECRET_KEY) {
      return res.status(500).json({
        error: 'Missing configuration. Please set all environment variables.',
        missing: {
          api: !CHATBASE_API_KEY,
          chatbot: !CHATBOT_ID,
          secret: !CHATBASE_SECRET_KEY
        }
      });
    }
    
    const { conversation, userId = 'default-user' } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({
        error: 'Invalid request. Expected conversation array.'
      });
    }
    
    // Generate HMAC for user authentication
    const userHash = crypto.createHmac('sha256', CHATBASE_SECRET_KEY)
      .update(userId)
      .digest('hex');
    
    console.log('HMAC generated:', { userId, hashLength: userHash.length });
    
    const response = await axios.post(
      'https://www.chatbase.co/api/v1/chat',
      {
        messages: conversation,
        chatbotId: CHATBOT_ID,
        user_id: userId,        // Changed from userId
        user_hash: userHash,    // Changed from userAuth
        stream: false
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
      status: error.response?.status
    });
  }
};
