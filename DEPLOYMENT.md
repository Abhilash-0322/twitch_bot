# Deployment Options for 24/7 Bot Operation

## Option 1: Local Machine (Development/Testing)

### Pros
- Free
- Easy to set up
- Full control

### Cons
- Requires computer to stay on
- May disconnect if computer sleeps

### Setup
```bash
npm start
```

Keep the terminal window open while streaming.

---

## Option 2: VPS/Cloud Server (Recommended for Production)

### Digital Ocean Droplet ($6/month)

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - Basic plan ($6/month)
   - Choose nearest datacenter

2. **SSH into server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Upload bot files**
   ```bash
   # On your local machine
   scp -r /path/to/twitch-bot root@your-server-ip:/root/
   ```

5. **Install dependencies and setup**
   ```bash
   cd /root/twitch-bot
   npm install
   nano .env  # Edit with your credentials
   ```

6. **Run with PM2 (keeps running 24/7)**
   ```bash
   npm install -g pm2
   pm2 start src/bot.js --name twitch-bot
   pm2 save
   pm2 startup
   ```

7. **Useful PM2 commands**
   ```bash
   pm2 status          # Check status
   pm2 logs twitch-bot # View logs
   pm2 restart twitch-bot # Restart bot
   pm2 stop twitch-bot # Stop bot
   ```

### AWS EC2 Free Tier (12 months free)

Similar setup to Digital Ocean, but free for first year:
- t2.micro instance
- Ubuntu 22.04 LTS
- Follow same steps as Digital Ocean

### Heroku (Free tier discontinued, $7/month)

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Create Heroku app**
   ```bash
   cd /path/to/twitch-bot
   heroku create your-bot-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set TWITCH_BOT_USERNAME=your_bot
   heroku config:set TWITCH_OAUTH_TOKEN=oauth:your_token
   heroku config:set TWITCH_CHANNEL=your_channel
   ```

4. **Create Procfile**
   ```bash
   echo "worker: node src/bot.js" > Procfile
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   heroku ps:scale worker=1
   ```

---

## Option 3: Raspberry Pi (One-time cost ~$35)

### Pros
- Low power consumption
- One-time cost
- Always on

### Setup
1. Install Raspberry Pi OS
2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Copy bot files to Pi
4. Use PM2 for process management (see VPS section)

---

## Option 4: Replit (Easy but Limited)

### Pros
- Very easy setup
- Web-based IDE
- Free tier available

### Cons
- May sleep after inactivity on free tier
- Less control

### Setup
1. Create account at replit.com
2. Import from GitHub or upload files
3. Add secrets (environment variables) in Replit
4. Click "Run"
5. Consider Replit paid plan ($7/month) for always-on

---

## Recommended Setup for Your Client

### For Small/Medium Streamers
**Digital Ocean Droplet with PM2** ($6/month)
- Reliable 24/7 operation
- Easy to manage
- Good performance
- Simple monitoring with PM2

### For Budget-Conscious
**Local Machine During Streams**
- Free
- Run bot only when streaming
- `npm start` before stream
- Stop after stream ends

### For Tech-Savvy
**AWS EC2 Free Tier + PM2**
- Free for 12 months
- Professional setup
- Scalable if needs grow

---

## Monitoring & Maintenance

### Check Bot Status
```bash
# If using PM2
pm2 status

# Check logs
pm2 logs twitch-bot --lines 100
```

### Update Bot
```bash
# SSH into server
cd /root/twitch-bot

# Pull updates (if using git)
git pull

# Or upload new files via SCP
# On local machine:
scp config/guidelines.json root@server-ip:/root/twitch-bot/config/

# Restart bot
pm2 restart twitch-bot
```

### Auto-restart on Crashes
PM2 automatically restarts the bot if it crashes. Check logs:
```bash
pm2 logs twitch-bot
```

---

## Security Best Practices

1. **Use SSH keys** instead of passwords for VPS access
2. **Enable firewall**
   ```bash
   sudo ufw allow ssh
   sudo ufw enable
   ```
3. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Never share OAuth token**
5. **Regular backups** of config files

---

## Cost Comparison

| Option | Monthly Cost | Setup Difficulty | Reliability |
|--------|--------------|------------------|-------------|
| Local Machine | $0 | Easy | Low (requires PC on) |
| Digital Ocean | $6 | Medium | High |
| AWS EC2 | $0 (1yr) / $8 | Medium | High |
| Raspberry Pi | $0 (after purchase) | Medium | High |
| Replit | $0/$7 | Easy | Medium |
| Heroku | $7 | Easy | High |

---

## Quick Start for Production

1. **Create Digital Ocean account**
2. **Create $6/month droplet**
3. **SSH and install Node.js**
4. **Upload bot files**
5. **Configure .env**
6. **Install and start with PM2**
7. **Done! Bot runs 24/7**

Total setup time: ~30 minutes
