# Bot Name Setup Guide

## Understanding Bot Names on Twitch

**Important:** The bot's display name in chat is determined by the Twitch account username you use.

### Current Setup
- Bot Account Username: `beast`
- Bot displays as: **beast** in chat
- Channel: `ashwinmaurya`

## How to Change Bot Name

### The Limitation
The bot name **cannot** be changed through code or configuration. It is directly tied to the Twitch account username.

### Solution: Create a Dedicated Bot Account

If you want a custom bot name (e.g., "MyCoolBot", "StreamHelper", etc.), you need to:

#### Step 1: Create a New Twitch Account
1. Go to https://www.twitch.tv/signup
2. Choose your desired bot username (this will be the bot's name in chat)
3. Complete the registration process
4. Verify your email

#### Step 2: Get OAuth Token for New Account
1. **Log into your NEW bot account**
2. Visit https://twitchtokengenerator.com/
3. Select "Custom Scope Token"
4. Enable these scopes:
   - `chat:read`
   - `chat:edit`
5. Click "Generate Token"
6. Copy the **OAuth token** (starts with `oauth:`)

#### Step 3: Update Your .env File
```env
# Update these with your new bot account credentials
TWITCH_BOT_USERNAME=YourNewBotName
TWITCH_OAUTH_TOKEN=oauth:your_new_token_here

# Channel stays the same
TWITCH_CHANNEL=ashwinmaurya

# Groq API Key (for AI features)
GROQ_API_KEY=your_groq_api_key_here
```

#### Step 4: Restart the Bot
```bash
npm start
```

Your bot will now appear with the new username in chat!

## Recommended Bot Names

### Good Bot Names:
- Keep it short and memorable
- Make it clearly a bot (e.g., ends with "Bot", "Helper", "AI")
- Related to your stream/brand

### Examples:
- `YourNameBot`
- `StreamHelper`
- `ChatGuardian`
- `MemeBot9000`
- `AshwinBot` (if streaming as ashwinmaurya)

### Avoid:
- Generic names that might be taken
- Names that look like regular users
- Very long names

## Important Notes

### Moderator Status
For full functionality, consider making your bot a moderator:
1. In your Twitch chat, type: `/mod YourBotName`
2. This helps avoid rate limits and gives the bot more reliability

### Account Requirements
- New Twitch accounts may need to verify email
- Some features require the account to be at least 2 weeks old
- Keep your bot account credentials secure

### Current vs Dedicated Account
**Using Current Account (beast):**
- ✅ Already set up and working
- ✅ No additional accounts needed
- ❌ Bot name is "beast" (not customizable)

**Creating Dedicated Bot Account:**
- ✅ Custom bot name of your choice
- ✅ Separates bot from personal account
- ✅ Professional appearance
- ❌ Requires creating new account
- ❌ Need to manage separate credentials

## Quick Start Checklist

If you want to change from "beast" to a custom name:

- [ ] Create new Twitch account with desired bot name
- [ ] Verify email on new account
- [ ] Generate OAuth token for new account
- [ ] Update `TWITCH_BOT_USERNAME` in .env
- [ ] Update `TWITCH_OAUTH_TOKEN` in .env
- [ ] Restart the bot
- [ ] (Optional) Make bot a moderator: `/mod YourBotName`

## Testing Your Bot

After changing the name:
1. Start the bot: `npm start`
2. Check logs for successful connection
3. Look for bot messages in your Twitch chat
4. Bot should appear with new username

## Troubleshooting

### Bot connects but has wrong name
- Check `TWITCH_BOT_USERNAME` in .env
- Ensure you're using the NEW account's username
- Restart the bot after changes

### OAuth errors
- Token must be from the bot account, not your personal account
- Token must start with `oauth:`
- Generate a new token if expired

### Can't create account with desired name
- Name might be taken
- Try variations: add numbers, "Bot" suffix, etc.
- Check Twitch's username requirements

## Support

For more help:
- Twitch Developer Docs: https://dev.twitch.tv/
- tmi.js Documentation: https://tmijs.com/
- Check `OAUTH_GUIDE.md` for token issues
