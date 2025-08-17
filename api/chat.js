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
    
    if (!CHATBASE_API_KEY || !CHATBOT_ID) {
      return res.status(500).json({
        error: 'Missing configuration',
        missing: {
          api: !CHATBASE_API_KEY,
          chatbot: !CHATBOT_ID
        }
      });
    }
    
    const { conversation, userId = 'default-user' } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({
        error: 'Invalid request. Expected conversation array.'
      });
    }
    
    // Build request payload
    let payload = {
      messages: conversation,
      chatbotId: CHATBOT_ID,
      stream: false
    };
    
    // Add HMAC if secret key exists
    if (CHATBASE_SECRET_KEY) {
      const userHash = crypto.createHmac('sha256', CHATBASE_SECRET_KEY)
        .update(userId)
        .digest('hex');
      
      payload.user_id = userId;
      payload.user_hash = userHash;
      
      console.log('Using HMAC authentication:', {
        userId,
        hashLength: userHash.length,
        secretLength: CHATBASE_SECRET_KEY.length
      });
    } else {
      console.log('No HMAC - secret key not provided');
    }
    
    console.log('Chatbase request:', {
      url: 'https://www.chatbase.co/api/v1/chat',
      chatbotId: CHATBOT_ID,
      messageCount: conversation.length,
      hasAuth: !!CHATBASE_API_KEY,
      authLength: CHATBASE_API_KEY?.length,
      hasHMAC: !!payload.user_hash
    });
    
    const response = await axios.post(
      'https://www.chatbase.co/api/v1/chat',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${CHATBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Chatbase success:', {
      status: response.status,
      hasResponse: !!response.data
    });
    
    const botResponse = response.data.text || response.data.answer || response.data.message || 'No response';
    return res.status(200).json({ response: botResponse });
    
  } catch (error) {
    console.error('Chatbase API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Return detailed error info
    return res.status(500).json({
      error: 'Failed to get response',
      details: error.message,
      status: error.response?.status,
      chatbaseError: error.response?.data || 'No response data',
      requestInfo: {
        chatbotId: process.env.CHATBOT_ID,
        hasApiKey: !!process.env.CHATBASE_API,
        hasSecret: !!process.env.CHATBASE_SECRET_KEY
      }
    });
  }
};
