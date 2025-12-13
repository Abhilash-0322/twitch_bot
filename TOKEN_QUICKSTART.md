# 🔐 Quick OAuth Token Setup

## The Old Way (DISCONTINUED ❌)
~~https://twitchapps.com/tmi/~~ - Service shut down in 2024

## The New Way (RECOMMENDED ✅)

### Option 1: Quick & Easy (5 minutes)
**🔗 https://twitchtokengenerator.com/**

1. Visit the website
2. Scroll to "Custom Scope Token"
3. Select: `chat:read` + `chat:edit`
4. Click "Generate Token"
5. Log in with your **bot account**
6. Authorize
7. Copy token (starts with `oauth:`)
8. Paste into `.env` file

**That's it! You're done.** ✨

---

### Option 2: Professional (15 minutes)
**For production use - Create your own OAuth app**

See detailed guide: `OAUTH_GUIDE.md`

1. Register app at: https://dev.twitch.tv/console/apps
2. Get Client ID and Secret
3. Use included script: `npm run generate-token`
4. Or manually authorize
5. Token auto-saves to `.env`

**Benefits:**
- Full control over authentication
- No third-party dependency
- Better for commercial use
- More secure long-term

---

### Option 3: Command Line (10 minutes)
**Using Twitch CLI**

```bash
# Install Twitch CLI
brew install twitch-cli  # macOS
# OR download from: https://github.com/twitchdev/twitch-cli/releases

# Generate token
twitch token -u -s "chat:read chat:edit"

# Copy token to .env (add oauth: prefix)
```

---

## Token Format

Your token should look like:
```
oauth:abc123xyz789example
```

**Must start with `oauth:`** ⚠️

---

## Where to Put Token

In your `.env` file:
```env
TWITCH_OAUTH_TOKEN=oauth:your_token_here
```

---

## Security Reminders

✅ DO:
- Keep token secret
- Use bot account (not main)
- Store in `.env` only
- Never commit to git
- Rotate every 30-60 days

❌ DON'T:
- Share token publicly
- Hardcode in source
- Use personal account
- Commit to repository
- Use unnecessary scopes

---

## Troubleshooting

**"Invalid token"**
→ Regenerate token using one of the methods above

**"Token expired"**
→ Tokens last ~60 days, generate new one

**"Login failed"**
→ Make sure username matches token's account

**"Missing scopes"**
→ Need at least: `chat:read` + `chat:edit`

---

## Need More Help?

📖 **Full OAuth Guide**: See `OAUTH_GUIDE.md`
📖 **Setup Guide**: See `SETUP_GUIDE.md`
📖 **Checklist**: See `CLIENT_CHECKLIST.md`

---

**Last Updated**: December 2024
**Status**: ✅ Current & Working
