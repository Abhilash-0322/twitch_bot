# Twitch Auto-Reply Bot

A professional Twitch chat bot that automatically responds to users based on customizable guidelines and commands. Built with **tmi.js** for reliable Twitch integration.

## 🌟 Features

### Core Features
- **Custom Bot Display Name**: Personalize your bot's appearance in chat without creating new Twitch account!
- **Automatic Responses**: Reply to chat messages based on keywords, patterns, and user behavior
- **Custom Commands**: Create custom chat commands with cooldowns
- **Flexible Triggers**: Support for multiple trigger types (contains, starts with, ends with, exact, regex)
- **Smart Cooldowns**: Per-user and per-rule cooldown management
- **Probability Controls**: Randomize response frequency
- **Rate Limiting**: Built-in message rate limiting to prevent spam

### AI-Powered Features (Optional)
- **AI Welcome Messages**: Groq-powered personalized welcomes (differentiates new vs returning users)
- **Context-Aware Chat**: Bot understands conversation context and responds naturally
- **Conversation Memory**: Maintains chat history for relevant responses
- **Random Engaging Messages**: Sends periodic welcome messages with variety

### Technical Features
- **Comprehensive Logging**: Winston-based logging system with file rotation
- **Easy Configuration**: JSON-based configuration files
- **Hot Reload**: Modify guidelines without restarting the bot

## 📋 Prerequisites

- Node.js 16.x or higher
- A Twitch account for the bot
- OAuth token for Twitch authentication

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Get Your Twitch OAuth Token

⚠️ **UPDATE**: The old twitchapps.com/tmi service has been discontinued.

**Recommended method** - Use Twitch Token Generator:
Visit **https://twitchtokengenerator.com/** and follow these steps:

1. Scroll to "Custom Scope Token"
2. Select scopes: `chat:read` and `chat:edit`
3. Click "Generate Token"
4. Log in with your **bot account**
5. Copy the token (it will start with `oauth:`)

**Alternative** - For production/professional setup, see `OAUTH_GUIDE.md` for creating your own OAuth application.

⚠️ **Important**: Keep this token secret! Never share it or commit it to version control.

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Fill in your details:
```env
TWITCH_BOT_USERNAME=your_bot_username
TWITCH_OAUTH_TOKEN=oauth:your_oauth_token_here
TWITCH_CHANNEL=your_channel_name
BOT_DISPLAY_NAME=🤖 YourBotName
BOT_ENABLED=true
RESPONSE_COOLDOWN=30
DEBUG_MODE=false
COMMAND_PREFIX=!
```

**🎨 New: Custom Bot Display Name!**
- `BOT_DISPLAY_NAME` lets you customize how your bot appears in messages
- Change it anytime without creating a new Twitch account!
- Use emojis and creative names: `🎮 GameBot`, `✨ StreamHelper`, etc.
- See `docs/CUSTOM_BOT_NAME.md` for complete guide

### 4. Customize Response Guidelines

Edit `config/guidelines.json` to customize your bot's behavior:

- **Rules**: Define automatic response triggers and messages
- **Commands**: Create custom chat commands
- **Cooldowns**: Control how often responses are sent
- **Probability**: Set chance of responding (0.0 to 1.0)

### 5. Test Configuration

```bash
npm test
```

This will verify your environment variables and configuration.

### 6. Run the Bot

```bash
# Start the bot
npm start

# Or use development mode with auto-restart
npm run dev
```

## 📖 Configuration Guide

### Bot Configuration (`config/bot-config.json`)

```json
{
  "responseCooldown": 30,           // Global cooldown in seconds
  "maxMessagesPerMinute": 20,       // Rate limit for bot messages
  "autoModeration": {
    "enabled": true,
    "banSpam": false,
    "timeoutDuration": 600
  },
  "responseSettings": {
    "useMentions": true,            // Mention users in responses (@username)
    "randomizeResponses": true,     // Randomly select from multiple responses
    "minMessageLength": 3           // Minimum message length to process
  },
  "ignoredUsers": [                 // Users to ignore
    "nightbot",
    "streamelements",
    "streamlabs"
  ]
}
```

### Response Guidelines (`config/guidelines.json`)

#### Rule Structure

```json
{
  "id": "unique_rule_id",           // Unique identifier
  "enabled": true,                  // Enable/disable rule
  "triggers": ["hello", "hi"],      // Keywords to trigger response
  "triggerType": "contains",        // How to match triggers
  "responses": [                    // List of possible responses
    "Hello! Welcome! 👋",
    "Hi there! 😊"
  ],
  "cooldown": 60,                   // Seconds before user can trigger again
  "probability": 1.0,               // Chance to respond (0.0 - 1.0)
  "description": "Greets users"     // Rule description
}
```

#### Trigger Types

- **contains**: Message contains the trigger word
- **startsWith**: Message starts with the trigger
- **endsWith**: Message ends with the trigger
- **exact**: Message exactly matches the trigger
- **regex**: Use regex pattern matching

#### Command Structure

```json
{
  "name": "discord",                // Command name (without prefix)
  "enabled": true,                  // Enable/disable command
  "response": "Join our Discord!",  // Response message
  "cooldown": 60,                   // Seconds between uses
  "modOnly": false                  // Restrict to moderators only
}
```

## 💡 Example Use Cases

### Welcome New Viewers

```json
{
  "id": "first_time_viewer",
  "enabled": true,
  "triggers": ["first time", "new here", "just found"],
  "triggerType": "contains",
  "responses": [
    "Welcome to the community! Feel free to ask questions anytime! 🌟"
  ],
  "cooldown": 300
}
```

### Answer Common Questions

```json
{
  "id": "game_question",
  "enabled": true,
  "triggers": ["what game", "which game"],
  "triggerType": "contains",
  "responses": [
    "Check the title for the game info! 🎮"
  ],
  "cooldown": 120
}
```

### Acknowledge Positive Vibes

```json
{
  "id": "positive_vibes",
  "enabled": true,
  "triggers": ["love this", "great stream", "awesome"],
  "triggerType": "contains",
  "responses": [
    "Thank you so much! 💜",
    "You're awesome! ✨"
  ],
  "cooldown": 90,
  "probability": 0.5
}
```

## 🔧 Advanced Usage

### Hot Reload Guidelines

The bot can reload guidelines without restarting. You can implement a command like:

```javascript
// Add to bot.js in handleMessage
if (isMod && message === '!reload') {
  this.responseManager.reloadGuidelines();
  await this.sendResponse(channel, 'Guidelines reloaded!', username);
}
```

### Using Placeholders

In responses, you can use:
- `{user}` - Replaced with the username
- `{USER}` - Replaced with uppercase username

Example:
```json
"responses": ["Thanks for the follow, {user}! 🎉"]
```

### Debug Mode

Enable debug mode in `.env` to see detailed logs:
```env
DEBUG_MODE=true
```

## 📁 Project Structure

```
twitch-bot/
├── config/
│   ├── bot-config.json       # Bot configuration
│   └── guidelines.json       # Response rules and commands
├── src/
│   ├── bot.js               # Main bot application
│   ├── test-connection.js   # Configuration tester
│   └── utils/
│       ├── logger.js        # Logging utility
│       └── responseManager.js # Response handling logic
├── logs/                    # Log files (auto-generated)
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Troubleshooting

### Bot doesn't connect

1. Verify your OAuth token is correct and starts with `oauth:`
2. Check that the bot account is not banned from the channel
3. Ensure the channel name is spelled correctly (without the # symbol)

### Bot doesn't respond

1. Check `BOT_ENABLED=true` in `.env`
2. Verify rules are `"enabled": true` in `guidelines.json`
3. Check cooldown settings - user might be on cooldown
4. Review logs in `logs/bot.log` for errors

### Rate limiting issues

Adjust `maxMessagesPerMinute` in `config/bot-config.json` if you're getting rate limited.

## 📝 Logs

Logs are stored in the `logs/` directory:
- `bot.log` - All bot activity
- `errors.log` - Error messages only

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Keep credentials secure
2. **Use a dedicated bot account** - Don't use your main account
3. **Rotate OAuth tokens regularly** - Generate new tokens periodically
4. **Limit bot permissions** - Only give necessary permissions
5. **Monitor bot activity** - Review logs regularly

## 🎯 Customization Tips

### For Gaming Streams
- Add game-specific responses
- Create commands for common game questions
- Set up death counter or score tracking

### For Creative Streams
- Respond to art/music requests
- Create commands for commission info
- Add social media links

### For Just Chatting
- Engage with questions more frequently
- Set lower probability for some responses to seem more natural
- Use more varied responses

## 📊 Performance

- **Memory Usage**: ~50-100 MB
- **CPU Usage**: Minimal (<1%)
- **Network**: Low bandwidth usage
- **Uptime**: Designed for 24/7 operation with auto-reconnect

## 🤝 Contributing

Feel free to customize this bot for your needs! Some ideas:
- Add database support for user tracking
- Implement points/currency system
- Add mini-games
- Integration with StreamElements/Nightbot
- Dashboard UI for configuration

## 📜 License

MIT License - Feel free to use and modify for your streams!

## 🆘 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review the configuration files
3. Run `npm test` to verify setup
4. Enable `DEBUG_MODE=true` for detailed logging

## 🎉 Credits

Built with:
- [tmi.js](https://github.com/tmijs/tmi.js) - Twitch chat client
- [winston](https://github.com/winstonjs/winston) - Logging library
- [dotenv](https://github.com/motdotla/dotenv) - Environment management

---

**Happy Streaming! 🎮📺✨**
