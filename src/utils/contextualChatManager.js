const Groq = require('groq-sdk');
const logger = require('./logger');

class ContextualChatManager {
  constructor() {
    this.groq = null;
    this.isEnabled = false;
    this.chatHistory = []; // Store recent messages with context
    this.maxHistorySize = 50; // Keep last 50 messages for context
    this.conversationContext = new Map(); // Per-user conversation state
    this.initialize();
  }

  initialize() {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      logger.warn('GROQ_API_KEY not configured. Contextual chat disabled.');
      this.isEnabled = false;
      return;
    }

    try {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      this.isEnabled = true;
      logger.info('Groq AI contextual chat manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Groq AI chat manager:', error);
      this.isEnabled = false;
    }
  }

  // Add message to chat history
  addMessage(username, message) {
    const entry = {
      username,
      message,
      timestamp: new Date()
    };

    this.chatHistory.push(entry);

    // Keep only recent messages
    if (this.chatHistory.length > this.maxHistorySize) {
      this.chatHistory.shift();
    }

    logger.debug(`Added message to context: [${username}]: ${message}`);
  }

  // Build context string from chat history
  buildContextString() {
    if (this.chatHistory.length === 0) {
      return 'Chat just started, no previous messages.';
    }

    // Get last 20 messages for context
    const recentMessages = this.chatHistory.slice(-20);
    
    const contextLines = recentMessages.map(entry => 
      `${entry.username}: ${entry.message}`
    );

    return contextLines.join('\n');
  }

  // Check if message needs a response (questions, @mentions, keywords)
  shouldRespond(message, botUsername) {
    // Always respond to questions
    if (message.includes('?')) return true;

    // Respond to mentions
    if (message.toLowerCase().includes(botUsername.toLowerCase())) return true;

    // Respond to certain keywords (with probability)
    const keywords = ['bot', 'help', 'how', 'what', 'why', 'when', 'where'];
    const hasKeyword = keywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasKeyword) {
      // 50% chance to respond to keywords
      return Math.random() > 0.5;
    }

    // Random engagement (10% chance for other messages)
    return Math.random() > 0.9;
  }

  // Generate contextual response
  async generateResponse(username, message, botUsername) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const chatContext = this.buildContextString();
      const userConvo = this.conversationContext.get(username) || { messages: 0 };
      
      const systemPrompt = `You are a fun, engaging Twitch chat bot named "${botUsername}". 
Your job is to keep viewers engaged by responding naturally to chat messages.

Personality:
- Friendly, humorous, and supportive
- Use gaming/streaming references
- Keep responses short (1-2 sentences, under 200 chars)
- Use emojis occasionally
- Be conversational and natural
- Never be offensive or inappropriate

Current chat context (recent messages):
${chatContext}

Now ${username} said: "${message}"

Generate a natural, engaging response that fits the conversation. Be helpful if they asked a question, funny if appropriate, and always keep the vibe positive!

Just return your response, nothing else.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 1.0, // Balanced creativity
        max_tokens: 120,
        top_p: 1,
        stream: false
      });

      const response = completion.choices[0]?.message?.content?.trim();

      if (response && response.length > 0) {
        // Update user conversation state
        userConvo.messages++;
        userConvo.lastResponse = new Date();
        this.conversationContext.set(username, userConvo);

        logger.info(`Generated contextual response for ${username}: ${response}`);
        return response;
      }

      return null;

    } catch (error) {
      logger.error('Error generating contextual response:', error);
      return null;
    }
  }

  // Generate response to a specific topic/question
  async generateTopicResponse(topic, username) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const chatContext = this.buildContextString();

      const prompt = `You are a helpful Twitch chat bot. Based on the recent chat conversation:

${chatContext}

${username} wants to know about: "${topic}"

Provide a helpful, engaging response. Keep it under 200 characters and conversational.

Just return your response, nothing else.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 120,
        stream: false
      });

      const response = completion.choices[0]?.message?.content?.trim();
      return response || null;

    } catch (error) {
      logger.error('Error generating topic response:', error);
      return null;
    }
  }

  // Clear old context (call periodically)
  clearOldContext() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    this.chatHistory = this.chatHistory.filter(entry => 
      entry.timestamp > oneHourAgo
    );

    // Clear old user conversation states
    for (const [username, convo] of this.conversationContext.entries()) {
      if (convo.lastResponse && convo.lastResponse < oneHourAgo) {
        this.conversationContext.delete(username);
      }
    }

    logger.debug('Cleared old chat context');
  }

  // Get statistics
  getStats() {
    return {
      historySize: this.chatHistory.length,
      activeUsers: this.conversationContext.size,
      isEnabled: this.isEnabled
    };
  }

  // Get status message
  getStatus() {
    if (this.isEnabled) {
      return '✅ Groq AI contextual chat is active (keeping conversation context)';
    } else {
      return '⚠️  Contextual chat disabled (Groq API key not configured)';
    }
  }
}

module.exports = ContextualChatManager;
