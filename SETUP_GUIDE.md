# Quick Setup Guide

## For Your Client

### Step 1: Create a Bot Account
1. Create a new Twitch account for the bot (e.g., `YourChannelBot`)
2. Log in with this bot account

### Step 2: Get OAuth Token
1. Visit: https://twitchtokengenerator.com/
2. Scroll to "Custom Scope Token"
3. Select scopes: `chat:read` and `chat:edit`
4. Click "Generate Token" and authorize
5. Copy the OAuth token (starts with `oauth:`)

**Note**: The old twitchapps.com/tmi service has been discontinued. See `OAUTH_GUIDE.md` for more options.

### Step 3: Configure the Bot
1. Open the `.env` file
2. Fill in these values:
   ```
   TWITCH_BOT_USERNAME=YourChannelBot
   TWITCH_OAUTH_TOKEN=oauth:your_token_here
   TWITCH_CHANNEL=YourChannelName
   BOT_ENABLED=true
   ```

### Step 4: Customize Responses
Edit `config/guidelines.json`:
- Add your Discord link
- Add your social media handles
- Customize responses to match your stream style
- Add/remove rules as needed

### Step 5: Run the Bot
```bash
npm install
npm test      # Verify configuration
npm start     # Start the bot
```

## Common Customizations

### Add Your Discord Link
In `config/guidelines.json`, find the `discord` command:
```json
{
  "name": "discord",
  "response": "Join our Discord community: https://discord.gg/your-invite"
}
```

### Add Your Schedule
```json
{
  "name": "schedule",
  "response": "Stream schedule: Mon/Wed/Fri at 7 PM EST"
}
```

### Add Your Social Media
```json
{
  "name": "socials",
  "response": "Follow us: Twitter @YourHandle | Instagram @YourHandle"
}
```

## Mod Commands (Optional)

You can add these to `src/bot.js` in the `handleMessage` method:

```javascript
// Reload guidelines (mods only)
if (isMod && message === '!reload') {
  this.responseManager.reloadGuidelines();
  await this.sendResponse(channel, 'Guidelines reloaded!', username);
  return;
}

// Enable/disable bot (mods only)
if (isMod && message === '!bot off') {
  process.env.BOT_ENABLED = 'false';
  await this.sendResponse(channel, 'Bot disabled', username);
  return;
}

if (isMod && message === '!bot on') {
  process.env.BOT_ENABLED = 'true';
  await this.sendResponse(channel, 'Bot enabled', username);
  return;
}
```

## Tips for Natural Responses

1. **Use probability**: Set to 0.3-0.5 for less intrusive responses
2. **Longer cooldowns**: Use 120-300 seconds for common triggers
3. **Multiple responses**: Add 3-5 variations per rule
4. **Don't overdo it**: Less is more - quality over quantity

## Need Help?

- Check `logs/bot.log` for activity
- Check `logs/errors.log` for problems
- Run `npm test` to verify configuration
- Enable `DEBUG_MODE=true` in `.env` for detailed logs
