# 🎭 Groq AI Meme Generator Setup

Your bot now welcomes new users with AI-generated memes! Here's how to set it up:

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Groq API Key

1. Visit: **https://console.groq.com/**
2. Sign up or log in (free account available)
3. Go to **API Keys** section
4. Click **"Create API Key"**
5. Give it a name (e.g., "Twitch Bot")
6. Copy the API key (starts with `gsk_...`)

### Step 2: Add to Your .env File

Open `.env` and add your API key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### Step 3: Restart the Bot

```bash
npm start
```

That's it! 🎉

---

## ✨ How It Works

### When a New User Joins Your Stream:

1. **Bot detects** the user joining
2. **Groq AI generates** a unique, funny welcome meme
3. **Bot sends** the personalized message to chat

Example outputs:
```
🎮 JohnDoe has entered the chat! Achievement unlocked: "Actually showed up" 🏆
⚡ JaneGamer just spawned in! Nobody panic, they're friendly... probably 😅
🚀 NewViewer joined the stream! Houston, we have a viewer! 🌟
```

### AI-Generated Memes:
The bot uses Groq's **llama-3.3-70b-versatile** model to create:
- **Unique** messages for each user
- **Funny** and welcoming tone
- **Gaming/streaming** culture references
- **Under 200 characters** (perfect for chat)

---

## 🎯 Features

### ✅ What's Included:

- **AI-Generated Memes** - Unique message for each user via Groq
- **Fallback Memes** - 15 pre-written memes if API unavailable
- **Smart Tracking** - Welcomes each user only once per session
- **Error Handling** - Graceful fallback if API fails
- **Free Tier** - Groq offers generous free usage

### ⚙️ Configuration:

The bot is already configured with optimal settings:
- **Model**: llama-3.3-70b-versatile (fast & creative)
- **Temperature**: 1.2 (high creativity)
- **Max tokens**: 100 (perfect length)
- **Response time**: Usually < 2 seconds

---

## 💰 Pricing (Groq)

### Free Tier:
- ✅ **Generous free requests** per day
- ✅ Fast inference (< 2 seconds)
- ✅ Multiple models available
- ✅ No credit card required to start

Perfect for most streamers! Upgrade only if you have very high traffic.

---

## 🔧 Testing

### Test the Meme Generator:

1. Start the bot: `npm start`
2. Have someone join your stream
3. Watch the AI-generated welcome!

### Check Status:

When bot starts, you'll see:
```
✅ Groq AI meme generator is active
```

Or if no API key:
```
⚠️  Groq API key not configured (using fallback memes)
```

---

## 🐛 Troubleshooting

### Issue: Bot uses fallback memes instead of AI

**Check:**
1. API key is set in `.env`
2. API key starts with `gsk_`
3. No spaces before/after the key
4. Bot was restarted after adding key

### Issue: "Invalid API key" error

**Solution:**
1. Regenerate key at https://console.groq.com/keys
2. Copy the new key
3. Update `.env`
4. Restart bot

### Issue: Slow response

- Groq is usually very fast (< 2 seconds)
- If slow, check your internet connection
- Fallback memes are instant if API fails

---

## 🎨 Customization

### Want Different Style Memes?

Edit `src/utils/memeGenerator.js`:

```javascript
const prompt = `Generate a short, funny, and creative meme-style welcome message...`;
```

Change the prompt to:
- More formal/professional
- Specific game references
- Your stream's inside jokes
- Different tone/style

### Want More/Fewer Fallback Memes?

Edit the `fallbackMemes` array in `src/utils/memeGenerator.js`

---

## 📊 What Gets Logged

Bot logs every welcome:
```
New user joined: Username
Generated meme for Username: [meme text]
Sent join meme to Username
```

Check `logs/bot.log` to see all welcomes!

---

## 🔒 Security

- ✅ API key stored in `.env` (not committed to git)
- ✅ Keys never logged or exposed
- ✅ Safe to rotate keys anytime
- ✅ No personal data sent to Groq (only usernames)

---

## 🚀 Advanced Options

### Use Different Model:

In `src/utils/memeGenerator.js`, change:
```javascript
model: 'llama-3.3-70b-versatile'
```

To:
- `mixtral-8x7b-32768` - More creative
- `llama-3.1-8b-instant` - Faster, simpler
- `gemma2-9b-it` - Alternative style

### Adjust Creativity:

Change temperature (0.1 = conservative, 2.0 = very creative):
```javascript
temperature: 1.2
```

### Change Length:

Adjust max_tokens (50 = short, 150 = longer):
```javascript
max_tokens: 100
```

---

## ❓ FAQ

**Q: Do I need to pay for Groq?**
A: No, free tier is generous for most streamers.

**Q: What happens if API is down?**
A: Bot automatically uses pre-written fallback memes.

**Q: Can I disable AI memes?**
A: Yes, just don't set GROQ_API_KEY. Bot uses fallbacks.

**Q: How many requests per day?**
A: Check Groq console, but free tier is very generous.

**Q: Is this safe?**
A: Yes! Only usernames are sent, no personal data.

**Q: Can I customize the memes?**
A: Yes! Edit the prompt in `memeGenerator.js`.

---

## 📚 Resources

- **Groq Console**: https://console.groq.com/
- **Groq Docs**: https://console.groq.com/docs
- **API Keys**: https://console.groq.com/keys
- **Models**: https://console.groq.com/docs/models

---

## ✅ Quick Checklist

Setup complete when you see:
- [x] Groq API key obtained
- [x] API key added to `.env`
- [x] Bot restarted
- [x] Status shows: "✅ Groq AI meme generator is active"
- [x] Test user joins and gets welcomed

---

**Now your stream has AI-powered welcome messages!** 🎉

Every new user gets a unique, funny greeting powered by Groq AI!
