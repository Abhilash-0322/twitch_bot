const Groq = require('groq-sdk');
const logger = require('./logger');

class MemeGenerator {
  constructor() {
    this.groq = null;
    this.isEnabled = false;
    this.userHistory = new Map(); // Track user join history
    this.initialize();
  }

  initialize() {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      logger.warn('GROQ_API_KEY not configured. Meme generation disabled.');
      logger.info('Get your API key from: https://console.groq.com/keys');
      this.isEnabled = false;
      return;
    }

    try {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      this.isEnabled = true;
      logger.info('Groq AI meme generator initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Groq AI:', error);
      this.isEnabled = false;
    }
  }

  async generateMeme(username) {
    if (!this.isEnabled) {
      return this.getFallbackMeme(username);
    }

    // Check if user is new or returning
    const userInfo = this.userHistory.get(username) || { visits: 0, lastSeen: null };
    userInfo.visits++;
    userInfo.lastSeen = new Date();
    this.userHistory.set(username, userInfo);

    const isNewUser = userInfo.visits === 1;
    const isReturning = userInfo.visits > 1;

    try {
      let prompt;
      
      if (isNewUser) {
        prompt = `Generate a warm, welcoming message for a FIRST-TIME viewer named "${username}" joining a Twitch stream. 
        
Make it special since it's their first visit! 

Requirements:
- Keep it under 200 characters
- Make it extra welcoming for new viewers
- Humorous and friendly
- Reference that they're new/first time
- Gaming/streaming culture references welcome
- No offensive content
- Just return the welcome text, nothing else`;
      } else {
        prompt = `Generate a fun welcome-back message for "${username}" who is returning to the Twitch stream (visit #${userInfo.visits}). 
        
Show you remember them!

Requirements:
- Keep it under 200 characters  
- Reference that they're returning/came back
- Make it feel personal and engaging
- Humorous and friendly
- Can mention they're a regular or familiar face
- No offensive content
- Just return the welcome text, nothing else`;
      }

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 1.2,
        max_tokens: 100,
        top_p: 1,
        stream: false
      });

      const meme = completion.choices[0]?.message?.content?.trim();
      
      if (meme && meme.length > 0) {
        logger.info(`Generated ${isNewUser ? 'new user' : 'returning user'} welcome for ${username} (visit #${userInfo.visits}): ${meme}`);
        return meme;
      } else {
        logger.warn('Empty meme generated, using fallback');
        return this.getFallbackMeme(username, isReturning);
      }

    } catch (error) {
      logger.error('Error generating meme with Groq:', error);
      return this.getFallbackMeme(username, isReturning);
    }
  }

  getFallbackMeme(username, isReturning = false) {
    const newUserMemes = [
      `🎮 ${username} has entered the chat for the FIRST TIME! Welcome aboard! 🏆`,
      `⚡ ${username} just spawned in! Fresh player detected! 😅`,
      `🎪 Ladies and gentlemen, NEW VIEWER ${username} has arrived! *throws confetti* 🎉`,
      `🚀 ${username} joined the stream! First time's the charm! 🌟`,
      `👾 Wild ${username} appeared for the first time! Welcome! ✨`,
      `🎬 ${username} has entered the arena! New challenger approaching! 💪`,
      `🌈 ${username} is here! First timer! The stream just leveled up 😎`
    ];

    const returningUserMemes = [
      `� ${username} is BACK! Welcome home! 🏆`,
      `⚡ ${username} returned! They couldn't stay away! 😅`,
      `🎪 Look who's back! ${username} has returned! 🎉`,
      `🚀 ${username} is back for more! Welcome back! �`,
      `👾 ${username} appeared again! The legend returns! ✨`,
      `🎬 ${username} is back in the arena! Round 2! �`,
      `� ${username} returned! We missed you! 😎`,
      `🎯 ${username} came back! Once wasn't enough! 🔥`,
      `🎨 ${username} painted themselves back into chat! Welcome back! 🖌️`,
      `⚔️ ${username} rejoined the party! The gang's back together! �️`
    ];

    const memeList = isReturning ? returningUserMemes : newUserMemes;
    const randomMeme = memeList[Math.floor(Math.random() * memeList.length)];
    logger.debug(`Using fallback ${isReturning ? 'returning' : 'new'} user meme for ${username}`);
    return randomMeme;
  }

  // Check if meme generation is available
  isAvailable() {
    return this.isEnabled;
  }

  // Get status message
  getStatus() {
    if (this.isEnabled) {
      return '✅ Groq AI meme generator is active';
    } else if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return '⚠️  Groq API key not configured (using fallback memes)';
    } else {
      return '❌ Groq AI initialization failed (using fallback memes)';
    }
  }
}

module.exports = MemeGenerator;
