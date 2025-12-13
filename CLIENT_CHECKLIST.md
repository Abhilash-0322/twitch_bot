# Client Setup Checklist

## ✅ Pre-Stream Setup (One-Time)

### 1. Bot Account Creation
- [ ] Create new Twitch account for the bot (e.g., `YourChannelBot`)
- [ ] Verify email for bot account
- [ ] Make bot account a moderator in your channel
  - In your channel chat: `/mod YourChannelBot`

### 2. Get OAuth Token
- [ ] Login to bot account
- [ ] Visit: https://twitchtokengenerator.com/
- [ ] Select "Custom Scope Token"
- [ ] Choose scopes: `chat:read` and `chat:edit`
- [ ] Click "Generate Token" and authorize
- [ ] Copy the OAuth token (keep it secret!)

**Alternative**: See `OAUTH_GUIDE.md` for professional OAuth app setup.

### 3. Install Bot
- [ ] Ensure Node.js is installed (download from nodejs.org)
- [ ] Open terminal/command prompt
- [ ] Navigate to bot folder
- [ ] Run: `npm install`

### 4. Configure Bot
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Add bot username
- [ ] Add OAuth token
- [ ] Add your channel name
- [ ] Save the file

### 5. Customize Responses
- [ ] Open `config/guidelines.json`
- [ ] Add your Discord invite link
- [ ] Add your Twitter/Instagram handles
- [ ] Add your stream schedule
- [ ] Customize greeting messages
- [ ] Review and adjust all response rules
- [ ] Save the file

### 6. Test Configuration
- [ ] Run: `npm test`
- [ ] Verify all green checkmarks
- [ ] Fix any errors shown

---

## 🚀 Before Each Stream

### Quick Start
- [ ] Open terminal/command prompt
- [ ] Navigate to bot folder
- [ ] Run: `npm start`
- [ ] Wait for "Bot is now running!" message
- [ ] Verify bot appears in your viewer list
- [ ] Test a command (type `!help` in chat)

### Optional Checks
- [ ] Review recent logs if needed
- [ ] Adjust any rules that were too frequent/rare last stream
- [ ] Enable/disable seasonal rules

---

## 🎮 During Stream

### Monitoring
- [ ] Keep terminal window open
- [ ] Occasionally check if bot is responding
- [ ] Watch for any error messages

### Quick Adjustments
To disable bot temporarily:
- Mods can use: `!bot off` (if you add mod commands)
- Or set `BOT_ENABLED=false` in `.env` and restart

To reload guidelines without restarting:
- Add reload command (see SETUP_GUIDE.md)

---

## 🛑 After Stream

- [ ] Press Ctrl+C in terminal to stop bot
- [ ] Review logs if needed: `logs/bot.log`
- [ ] Note any adjustments needed for next stream

---

## 🔄 Weekly Maintenance

- [ ] Review `logs/bot.log` for most common triggers
- [ ] Adjust cooldowns if needed
- [ ] Add new response rules based on common questions
- [ ] Remove rules that aren't being used
- [ ] Check for bot updates (if using git)

---

## 📝 Customization Ideas

### Essential (Do First)
- [ ] Add real Discord link
- [ ] Add real social media handles
- [ ] Add real stream schedule
- [ ] Update game/content-specific responses

### Nice to Have
- [ ] Add sub/follow thank you responses
- [ ] Add FAQ responses for your stream
- [ ] Add inside jokes/community memes
- [ ] Add seasonal greetings

### Advanced
- [ ] Set up on VPS for 24/7 operation
- [ ] Add mod commands for control
- [ ] Integrate with point systems
- [ ] Add viewer milestones

---

## ⚠️ Troubleshooting

### Bot won't connect
1. [ ] Check OAuth token is correct
2. [ ] Verify bot account isn't banned
3. [ ] Confirm channel name is correct (no # symbol)
4. [ ] Check internet connection

### Bot doesn't respond
1. [ ] Check `BOT_ENABLED=true` in `.env`
2. [ ] Verify rules are enabled in `guidelines.json`
3. [ ] Check if user is on cooldown
4. [ ] Review logs: `logs/bot.log`

### Bot responds too much
1. [ ] Increase cooldown times
2. [ ] Lower probability values (0.3-0.5)
3. [ ] Disable some rules
4. [ ] Increase `minMessageLength`

### Bot responds too little
1. [ ] Decrease cooldown times
2. [ ] Increase probability values
3. [ ] Add more trigger keywords
4. [ ] Enable more rules

---

## 📞 Getting Help

1. **Check Documentation**
   - README.md - Complete guide
   - SETUP_GUIDE.md - Quick setup
   - EXAMPLES.md - Response examples
   - DEPLOYMENT.md - 24/7 hosting

2. **Check Logs**
   - `logs/bot.log` - All activity
   - `logs/errors.log` - Errors only

3. **Enable Debug Mode**
   - Set `DEBUG_MODE=true` in `.env`
   - Restart bot
   - Review detailed logs

---

## 🎯 Success Metrics

After a few streams, evaluate:
- [ ] Bot responses are helpful
- [ ] Not too chatty or too quiet
- [ ] Chat engagement increased
- [ ] Fewer repeated questions
- [ ] Viewers like the bot

Adjust based on feedback!

---

## 🔒 Security Reminders

- [ ] ⚠️ Never share your OAuth token
- [ ] ⚠️ Don't commit `.env` to git
- [ ] ✅ Rotate OAuth token monthly
- [ ] ✅ Use bot account, not main account
- [ ] ✅ Keep Node.js updated

---

## 📊 Recommended Settings by Stream Size

### Small (0-50 viewers)
- Cooldowns: 60-120 seconds
- Probability: 0.3-0.5
- maxMessagesPerMinute: 10

### Medium (50-200 viewers)
- Cooldowns: 120-180 seconds
- Probability: 0.2-0.4
- maxMessagesPerMinute: 15

### Large (200+ viewers)
- Cooldowns: 180-300 seconds
- Probability: 0.1-0.3
- maxMessagesPerMinute: 20

Adjust based on chat speed!

---

**Happy Streaming! The bot is ready to help grow your community! 🚀**
