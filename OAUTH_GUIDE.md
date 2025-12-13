# OAuth Token Generation Guide

⚠️ **IMPORTANT**: The old Twitchapps TMI Token Generator has been discontinued as of 2024.

## Quick Option: Twitch Token Generator (Recommended for Quick Setup)

For easy setup, use **Twitch Token Generator** by swiftyspiffy:

🔗 **https://twitchtokengenerator.com/**

### Steps:
1. Visit https://twitchtokengenerator.com/
2. Scroll down to "Custom Scope Token"
3. Select the following scopes:
   - `chat:read` - Read chat messages
   - `chat:edit` - Send chat messages
4. Click "Generate Token"
5. Authorize with your bot account
6. Copy the OAuth token (it will start with `oauth:`)
7. Paste into your `.env` file

### Example:
```env
TWITCH_OAUTH_TOKEN=oauth:abc123xyz456...
```

---

## Professional Option: Create Your Own OAuth Application

For production use, it's recommended to create your own Twitch application:

### Step 1: Register Your Application

1. Go to https://dev.twitch.tv/console/apps
2. Log in with your bot account (or your main account)
3. Click "Register Your Application"
4. Fill in:
   - **Name**: Your Bot Name (e.g., "MyChannelBot")
   - **OAuth Redirect URLs**: `http://localhost:3000` (for local testing)
   - **Category**: Chat Bot
5. Click "Create"
6. Save your **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add to your `.env` file:
```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Generate Token via OAuth Flow

Use one of these methods:

#### Option A: Using Twitch CLI (Easiest)

```bash
# Install Twitch CLI
# macOS
brew install twitch-cli

# Windows
scoop install twitch-cli

# Linux
# Download from: https://github.com/twitchdev/twitch-cli/releases

# Generate token
twitch token -u -s "chat:read chat:edit"
```

#### Option B: Manual OAuth Flow

1. Build authorization URL:
```
https://id.twitch.tv/oauth2/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:3000
  &response_type=token
  &scope=chat:read+chat:edit
```

2. Visit URL in browser (logged in as bot account)
3. Authorize the application
4. Copy the access token from the redirect URL
5. Add `oauth:` prefix and save to `.env`

#### Option C: Use the OAuth Helper Script (Included)

We've included a helper script to automate this:

```bash
npm run generate-token
```

This will:
1. Start a local server
2. Open authorization URL
3. Capture the token
4. Save to `.env` automatically

---

## Security Best Practices

### DO ✅
- Store tokens in `.env` file (never commit to git)
- Use dedicated bot account
- Rotate tokens regularly (every 30-60 days)
- Use minimal required scopes
- Revoke old tokens when generating new ones

### DON'T ❌
- Share your OAuth token
- Commit `.env` to version control
- Use your personal account for the bot
- Give unnecessary permissions
- Hardcode tokens in source code

---

## Required Scopes for This Bot

Minimum scopes needed:
- `chat:read` - Read chat messages
- `chat:edit` - Send chat messages

Optional scopes (if you add features):
- `channel:moderate` - Moderate chat (timeout/ban)
- `whispers:read` - Read whispers
- `whispers:edit` - Send whispers
- `user:read:email` - Read user email (rarely needed)

---

## Token Validation

Check if your token is valid:

```bash
curl -H "Authorization: OAuth YOUR_TOKEN_HERE" \
  https://id.twitch.tv/oauth2/validate
```

Response should show:
```json
{
  "client_id": "your_client_id",
  "login": "your_bot_username",
  "scopes": ["chat:read", "chat:edit"],
  "user_id": "123456789",
  "expires_in": 5184000
}
```

---

## Token Refresh

Tokens expire after ~60 days. Options:

### Manual Refresh
Regenerate token using same method when it expires.

### Automatic Refresh (Advanced)
Use refresh token flow:
1. Request with `response_type=code` instead of `token`
2. Exchange code for access + refresh token
3. Use refresh token to get new access token when expired

See: https://dev.twitch.tv/docs/authentication/refresh-tokens

---

## Troubleshooting

### Error: "Invalid OAuth token"
- Regenerate token
- Ensure it starts with `oauth:`
- Check token hasn't expired
- Verify correct scopes

### Error: "Login authentication failed"
- Check username matches token's account
- Ensure bot account isn't banned
- Verify token is for correct account

### Token Expired
- Tokens last ~60 days
- Regenerate using same method
- Update `.env` with new token
- Restart bot

---

## Quick Reference

### Recommended for Beginners
🔗 https://twitchtokengenerator.com/
- Easy to use
- No coding required
- Gets you started quickly

### Recommended for Production
🔗 https://dev.twitch.tv/console/apps
- Create your own OAuth app
- More control
- Professional setup
- Better security

### Need Help?
- Twitch Developer Docs: https://dev.twitch.tv/docs/authentication
- Twitch Developer Discord: https://link.twitch.tv/devchat
- This bot's documentation: See README.md

---

## Migration from Old TMI Token Generator

If you were using the old twitchapps.com/tmi/:

1. ✅ Token still works if already generated (until it expires)
2. ❌ Can't generate new tokens from that service
3. ✅ Use https://twitchtokengenerator.com/ instead
4. ✅ Or create your own OAuth app (recommended)

Your existing token will work until it expires (~60 days), then use one of the new methods above.

---

**Updated**: December 2024
**Status**: Current and Working ✅
