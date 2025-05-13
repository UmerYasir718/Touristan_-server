const express = require('express');
const router = express.Router();
const axios = require('axios');
const Package = require('../models/Package');
const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/chat/message
// @desc    Send a message to Groq API
// @access  Public
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }
    
    // Generate system prompt with tour information
    const systemPrompt = await generateSystemPrompt();
    
    // Prepare the messages array with system prompt
    const fullMessages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...messages
    ];
    
    // Send to Groq API using axios
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      messages: fullMessages,
      model: "llama-3.3-70b-versatile"
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return res.json({
      success: true,
      response: response.data.choices[0]?.message?.content || "Sorry, I couldn't generate a response."
    });
  } catch (error) {
    console.error('Error sending message to Groq:', error);
    return res.status(500).json({
      success: false,
      error: "Server error processing your request"
    });
  }
});

// Function to generate a system prompt with tour information
const generateSystemPrompt = async () => {
  try {
    // Fetch tours from database
    const packages = await Package.find({ isActive: true })
      .select('title desc price duration startPoint destination');
    
    // Create a formatted string with tour information
    const toursInfo = packages.map(tour => {
      return `
Tour ID: ${tour._id}
Name: ${tour.title}
Description: ${tour.desc}
Price: ${tour.price}
Duration: ${tour.duration}
Start Point: ${tour.startPoint}
Destination: ${tour.destination}
`;
    }).join('\n');
    
    return `You are a helpful travel assistant for Touristaan. You help users find the perfect tour packages and answer their questions about travel.
Here are the current available tours:

${toursInfo}

When users ask about tours, provide them with relevant information from the above list. If they ask about a specific tour, give them details about that tour.
If they ask about something not related to the available tours, you can still help them with general travel advice.
Always be friendly, professional, and helpful. If you don't know something, it's okay to say so.`;
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return 'You are a helpful travel assistant for Touristaan. You help users find the perfect tour packages and answer their questions about travel.';
  }
};

module.exports = router;
