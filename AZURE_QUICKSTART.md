# Azure Quick Deploy - Twitch Bot

## Option 1: Automated Script (Easiest)

```bash
./deploy-azure.sh
```

This interactive script will:
1. Login to Azure
2. Create all necessary resources
3. Configure environment variables
4. Deploy your bot

## Option 2: Manual Commands

### Install Azure CLI

```bash
# For Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify
az --version
```

### Deploy

```bash
# Login
az login

# Create resources
az group create --name twitch-bot-rg --location eastus

az appservice plan create \
  --name twitch-bot-plan \
  --resource-group twitch-bot-rg \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group twitch-bot-rg \
  --plan twitch-bot-plan \
  --name YOUR-UNIQUE-NAME \
  --runtime "NODE:20-lts"

# Configure environment
az webapp config appsettings set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-NAME \
  --settings \
    TWITCH_BOT_USERNAME="beast" \
    TWITCH_OAUTH_TOKEN="your_token" \
    TWITCH_CHANNEL="ashwinmaurya" \
    GROQ_API_KEY="your_key" \
    BOT_DISPLAY_NAME="🤖 StreamBot"

# Enable always-on
az webapp config set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-NAME \
  --always-on true \
  --startup-file "node src/bot.js"

# Deploy via git
az webapp deployment source config-local-git \
  --name YOUR-UNIQUE-NAME \
  --resource-group twitch-bot-rg

# Push code
git remote add azure https://YOUR-UNIQUE-NAME.scm.azurewebsites.net:443/YOUR-UNIQUE-NAME.git
git push azure main:master
```

### View Logs

```bash
az webapp log tail --resource-group twitch-bot-rg --name YOUR-UNIQUE-NAME
```

## Cost

- **B1 Tier**: ~$13/month
- **B2 Tier**: ~$26/month (more memory if needed)

## See Full Documentation

Check `AZURE_DEPLOYMENT.md` for complete details and troubleshooting.
