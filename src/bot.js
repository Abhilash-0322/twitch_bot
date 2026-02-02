const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const tmi = require('tmi.js');
const fs = require('fs');
const Groq = require('groq-sdk');
const logger = require('./utils/logger');
const ResponseManager = require('./utils/responseManager');
const MemeGenerator = require('./utils/memeGenerator');
const ContextualChatManager = require('./utils/contextualChatManager');

class TwitchBot {
  constructor() {
    this.config = this.loadConfig();
    this.botDisplayName = process.env.BOT_DISPLAY_NAME || '🤖 Bot';
    this.responseManager = new ResponseManager(
      path.join(__dirname, '../config/guidelines.json')
    );
    this.memeGenerator = new MemeGenerator();
    this.contextualChat = new ContextualChatManager();
    
    // Initialize Groq for the bot's own AI messages
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } else {
      this.groq = null;
    }
    
    this.client = null;
    this.messageCount = 0;
    this.messageResetInterval = null;
    this.periodicMessageInterval = null;
    this.contextCleanupInterval = null;
    this.joinedUsers = new Set(); // Track users who have joined
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/bot-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    } catch (error) {
      logger.error('Failed to load bot config:', error);
      return {
        responseCooldown: 30,
        maxMessagesPerMinute: 20,
        responseSettings: {
          useMentions: true,
          randomizeResponses: true,
          minMessageLength: 3
        },
        ignoredUsers: ['nightbot', 'streamelements', 'streamlabs']
      };
    }
  }

  validateEnvironment() {
    const required = ['TWITCH_BOT_USERNAME', 'TWITCH_OAUTH_TOKEN', 'TWITCH_CHANNEL'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      logger.error(`Missing required environment variables: ${missing.join(', ')}`);
      logger.error('Please create a .env file based on .env.example');
      return false;
    }

    if (!process.env.TWITCH_OAUTH_TOKEN.startsWith('oauth:')) {
      logger.error('TWITCH_OAUTH_TOKEN must start with "oauth:"');
      return false;
    }

    return true;
  }

  initializeClient() {
    const opts = {
      identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
      },
      channels: [process.env.TWITCH_CHANNEL],
      options: {
        debug: process.env.DEBUG_MODE === 'true'
      },
      connection: {
        reconnect: true,
        secure: true
      }
    };

    this.client = new tmi.client(opts);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Connection events
    this.client.on('connected', (address, port) => {
      logger.info(`Connected to ${address}:${port}`);
      logger.info(`Monitoring channel: #${process.env.TWITCH_CHANNEL}`);
    });

    this.client.on('disconnected', (reason) => {
      logger.warn(`Disconnected: ${reason}`);
    });

    this.client.on('reconnect', () => {
      logger.info('Attempting to reconnect...');
    });

    // Message handling
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignore messages from the bot itself
      this.handleMessage(channel, tags, message);
    });

    // Error handling
    this.client.on('error', (error) => {
      logger.error('Client error:', error);
    });

    // Join/Part events
    this.client.on('join', (channel, username, self) => {
      if (self) {
        logger.info(`Bot successfully joined ${channel}`);
      } else {
        // New user joined - welcome them with a meme
        this.handleUserJoin(channel, username);
      }
    });
  }

  async handleUserJoin(channel, username) {
    try {
      const streamerName = process.env.TWITCH_CHANNEL.toLowerCase();
      
      // Skip if user is the streamer themselves
      if (username.toLowerCase() === streamerName) {
        logger.debug(`Skipping welcome for streamer: ${username}`);
        return;
      }
      
      // Skip if user already welcomed or is ignored
      if (this.joinedUsers.has(username) || this.shouldIgnoreUser(username)) {
        return;
      }

      // Mark user as joined
      this.joinedUsers.add(username);

      // Generate meme welcome message
      logger.info(`New user joined: ${username}`);
      const meme = await this.memeGenerator.generateMeme(username);

      // Send welcome message
      await this.client.say(channel, meme);
      logger.info(`Sent join meme to ${username}: ${meme}`);

    } catch (error) {
      logger.error(`Error handling user join for ${username}:`, error);
    }
  }

  shouldIgnoreUser(username) {
    const ignoredUsers = this.config.ignoredUsers || [];
    return ignoredUsers.includes(username.toLowerCase());
  }

  shouldIgnoreMessage(message) {
    const minLength = this.config.responseSettings?.minMessageLength || 3;
    return message.trim().length < minLength;
  }

  canSendMessage() {
    const maxMessages = this.config.maxMessagesPerMinute || 20;
    return this.messageCount < maxMessages;
  }

  async handleMessage(channel, tags, message) {
    try {
      const username = tags.username;
      const userId = tags['user-id'];
      const isMod = tags.mod || tags['user-type'] === 'mod';
      const isSubscriber = tags.subscriber;

      logger.debug(`[${username}]: ${message}`);

      // Add message to context history for AI
      this.contextualChat.addMessage(username, message);

      // Ignore certain users
      if (this.shouldIgnoreUser(username)) {
        return;
      }

      // Ignore very short messages
      if (this.shouldIgnoreMessage(message)) {
        return;
      }

      // Check if bot is enabled
      if (process.env.BOT_ENABLED === 'false') {
        return;
      }

      // Check message rate limit
      if (!this.canSendMessage()) {
        logger.warn('Message rate limit reached');
        return;
      }

      // First, check for commands
      const commandResponse = this.responseManager.handleCommand(message, username);
      if (commandResponse) {
        await this.sendResponse(channel, commandResponse, username);
        return;
      }

      // Then, check for guideline-based responses
      const matchedRule = this.responseManager.findMatchingRule(message, username);
      if (matchedRule) {
        const response = this.responseManager.getResponse(matchedRule, username);
        if (response) {
          logger.info(`Rule triggered: ${matchedRule.id} for user ${username}`);
          await this.sendResponse(channel, response, username);
          return;
        }
      }

      // Finally, check if contextual AI should respond
      const botUsername = process.env.TWITCH_BOT_USERNAME;
      if (this.contextualChat.shouldRespond(message, botUsername)) {
        const aiResponse = await this.contextualChat.generateResponse(username, message, botUsername);
        if (aiResponse) {
          await this.sendResponse(channel, aiResponse, username);
          return;
        }
      }

    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  async sendResponse(channel, message, username) {
    try {
      const useMentions = this.config.responseSettings?.useMentions !== false;
      const finalMessage = useMentions ? `@${username} ${message}` : message;

      await this.client.say(channel, finalMessage);
      this.messageCount++;
      logger.info(`Sent: ${finalMessage}`);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  }

  startMessageCounterReset() {
    // Reset message counter every minute
    this.messageResetInterval = setInterval(() => {
      this.messageCount = 0;
      logger.debug('Message counter reset');
    }, 60000);
  }

  startContextCleanup() {
    // Clean old context every 30 minutes
    this.contextCleanupInterval = setInterval(() => {
      this.contextualChat.clearOldContext();
      logger.debug('Chat context cleaned');
    }, 30 * 60 * 1000); // 30 minutes
  }

  async getRandomWelcomeMessage() {
    // Check if Groq is available
    if (!this.groq) {
      const fallbacks = [
        'Welcome to the stream! 🎮',
        'Hey everyone! Let\'s vibe! ✨',
        'We\'re live! 🔥',
        'What\'s up, legends? 🌟',
        'Welcome in! 💜'
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    try {
      const prompt = `You are a Twitch streamer greeting your chat. Generate a super creative, fun, and unique welcome message.

Requirements:
- Must be SHORT (1-2 sentences max, under 200 characters)
- Should be welcoming and energetic
- Can include 1-2 emojis
- Should feel spontaneous and different each time
- Can be funny, epic, wholesome, or hype
- Vary the style: sometimes casual, sometimes epic, sometimes quirky
- Don't repeat common phrases
- Write as if YOU (the streamer) are talking to YOUR community
- Address "chat", "everyone", "legends", "fam", "viewers" etc.
- Use FIRST PERSON perspective (I, we, my, our)

Examples of variety:
- "Yo! Stream's cooking! 🔥"
- "Love having you all here! Let's make it epic 🌟"
- "The vibe is immaculate today! Welcome in! ✨"
- "We're live! Let's gooo 🚀"
- "Chat is buzzing! Love to see it 💜"
- "Welcome to the chaos, legends! 🎪"
- "Happy everyone's here! Time to vibe 😊"

Generate ONE unique welcome message NOW (just the message, nothing else):`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 1.5, // High temperature for maximum randomness
        max_tokens: 100,
      });

      let message = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove quotes if AI wrapped it
      message = message.replace(/^["']|["']$/g, '');
      
      // Ensure it's not too long
      if (message.length > 250) {
        message = message.substring(0, 247) + '...';
      }
      
      // Return message as if from the streamer (no bot prefix)
      return message;
      
    } catch (error) {
      // Log error in single line for Azure visibility
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      const errorStatus = error?.status || error?.response?.status || 'N/A';
      logger.error(`Groq API Error: ${errorMsg} | Status: ${errorStatus}`);
      
      // Fallback to simple random messages (streamer perspective)
      const fallbacks = [
        'Welcome to the stream! 🎮',
        'Hey everyone! Let\'s vibe! ✨',
        'We\'re live! 🔥',
        'What\'s up, legends? 🌟',
        'Welcome in! 💜'
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  startPeriodicMessages() {
    // Send AI-generated random welcome messages every 10 seconds
    this.periodicMessageInterval = setInterval(async () => {
      try {
        const channel = `#${process.env.TWITCH_CHANNEL}`;
        const message = await this.getRandomWelcomeMessage(); // Now async
        await this.client.say(channel, message);
        logger.info(`Sent AI-generated periodic message: ${message}`);
      } catch (error) {
        logger.error('Error sending periodic message:', error);
      }
    }, 100000); // 10 seconds
  }

  async start() {
    try {
      logger.info('='.repeat(50));
      logger.info('Starting Twitch Auto-Reply Bot');
      logger.info('='.repeat(50));

      // Validate environment variables
      if (!this.validateEnvironment()) {
        process.exit(1);
      }

      // Initialize client
      this.initializeClient();

      // Connect to Twitch
      await this.client.connect();

      // Start message counter reset interval
      this.startMessageCounterReset();

      // Start periodic messages (hello every 10 seconds)
      this.startPeriodicMessages();

      // Start context cleanup
      this.startContextCleanup();

      logger.info('Bot is now running!');
      logger.info(`Twitch Account: ${process.env.TWITCH_BOT_USERNAME}`);
      logger.info(`Bot Display Name: ${this.botDisplayName}`);
      logger.info(`Channel: #${process.env.TWITCH_CHANNEL}`);
      logger.info('Sending random engaging welcome messages every 10 seconds');
      logger.info(this.memeGenerator.getStatus());
      logger.info(this.contextualChat.getStatus());
      logger.info('🎯 Features Active:');
      logger.info('  - Custom bot display name in messages');
      logger.info('  - AI-generated welcome messages (super random & unique)');
      logger.info('  - AI-powered user welcomes (new vs returning users)');
      logger.info('  - Context-aware chat engagement');
      logger.info('  - Conversation memory (keeps last 50 messages)');
      logger.info('💡 Tip: Change BOT_DISPLAY_NAME in .env to customize bot branding');
      logger.info('🤖 AI generates completely unique welcome messages every 10 seconds!');
      logger.info('Press Ctrl+C to stop the bot');

    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async stop() {
    logger.info('Stopping bot...');
    
    if (this.messageResetInterval) {
      clearInterval(this.messageResetInterval);
    }

    if (this.periodicMessageInterval) {
      clearInterval(this.periodicMessageInterval);
    }

    if (this.contextCleanupInterval) {
      clearInterval(this.contextCleanupInterval);
    }

    if (this.client) {
      await this.client.disconnect();
    }

    logger.info('Bot stopped');
  }
}

// Handle graceful shutdown
const bot = new TwitchBot();

process.on('SIGINT', async () => {
  logger.info('\nReceived SIGINT, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\nReceived SIGTERM, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

const http = require('http');
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Twitch bot is running\n');
}).listen(PORT, () => {
  logger.info(`Health server listening on port ${PORT}`);
});

// Start the bot
bot.start();