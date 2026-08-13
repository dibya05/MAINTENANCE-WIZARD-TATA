const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/authMiddleware');

// 1. Initialize the Google Gemini API using the key from our .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Industrial maintenance system prompt
const SYSTEM_CONTEXT = `You are the Maintenance Wizard AI Assistant — a highly experienced industrial maintenance expert AI embedded in a professional equipment monitoring dashboard.

Your expertise covers:
- Predictive & preventive maintenance for industrial equipment (pumps, compressors, motors, turbines, heat exchangers, valves, fans)
- Vibration analysis, thermography, oil analysis, and ultrasonic testing interpretation
- CMMS (Computerized Maintenance Management Systems) best practices
- Health scoring and anomaly detection for plant assets
- OSHA / LOTO safety compliance
- Root Cause Analysis (RCA) using Fault Tree Analysis or Fishbone (Ishikawa) methods
- KPIs: MTBF, MTTR, OEE, Availability

Response guidelines:
- Be concise, structured, and professional — use bullet points, numbered lists, or headers when helpful
- Always highlight safety concerns first if relevant
- If asked about a specific equipment tag (e.g. P-102), provide specific, actionable guidance
- Use metric units (°C, mm/s, kPa, L/min) unless asked otherwise
- Suggest next steps clearly: inspect, isolate, test, escalate, etc.
- For critical anomalies, always recommend immediate escalation to a reliability engineer`;

// @route   POST /api/ai/chat
// @desc    Send a message to the Gemini AI Assistant
router.post('/chat', protect, async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt for the AI' });
    }

    // Select the Gemini 3.5 Flash model (fast, capable, cost-effective)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: SYSTEM_CONTEXT,
    });

    // Build conversation history if provided
    let chatContents = [];
    if (Array.isArray(history) && history.length > 0) {
      const rawHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      
      // Gemini strict requirements:
      // 1. First message MUST be 'user'
      // 2. Roles MUST alternate 'user' -> 'model' -> 'user'
      let expectedRole = 'user';
      for (const msg of rawHistory) {
        if (msg.role === expectedRole) {
          chatContents.push(msg);
          expectedRole = expectedRole === 'user' ? 'model' : 'user';
        }
      }
    }

    // Start a chat session with history context
    const chat = model.startChat({ history: chatContents });

    // Send the user's message
    const result = await chat.sendMessage(prompt);
    const aiResponse = result.response.text();

    res.json({ reply: aiResponse });

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      message: 'Failed to generate AI response',
      error: error.message,
    });
  }
});

module.exports = router;
