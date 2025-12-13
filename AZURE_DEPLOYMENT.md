# Azure Deployment Guide for Twitch Bot

This guide covers deploying your Twitch bot to Microsoft Azure.

## Prerequisites

1. **Azure Account**: Sign up at https://azure.microsoft.com/free/
2. **Azure CLI**: Install from https://docs.microsoft.com/cli/azure/install-azure-cli
3. **Docker** (optional, for Container Instances): https://docker.com

## Deployment Options

### Option 1: Azure App Service (Recommended)

Azure App Service is perfect for Node.js applications that need to run continuously.

#### Step 1: Install Azure CLI

```bash
# For Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# For macOS
brew install azure-cli

# Verify installation
az --version
```

#### Step 2: Login to Azure

```bash
az login
```

This will open a browser for authentication.

#### Step 3: Create Resource Group

```bash
# Set your preferred region (eastus, westus2, etc.)
az group create --name twitch-bot-rg --location eastus
```

#### Step 4: Create App Service Plan

```bash
# Create a Linux-based App Service plan (B1 tier - $13.14/month)
az appservice plan create \
  --name twitch-bot-plan \
  --resource-group twitch-bot-rg \
  --sku B1 \
  --is-linux
```

#### Step 5: Create Web App

```bash
# Create the web app with Node.js runtime
az webapp create \
  --resource-group twitch-bot-rg \
  --plan twitch-bot-plan \
  --name YOUR-UNIQUE-BOT-NAME \
  --runtime "NODE:20-lts"
```

**Note**: Replace `YOUR-UNIQUE-BOT-NAME` with a unique name (must be globally unique across Azure).

#### Step 6: Configure Environment Variables

```bash
# Set your bot credentials
az webapp config appsettings set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME \
  --settings \
    TWITCH_BOT_USERNAME="beast" \
    TWITCH_OAUTH_TOKEN="your_oauth_token" \
    TWITCH_CHANNEL="ashwinmaurya" \
    GROQ_API_KEY="your_groq_key" \
    BOT_DISPLAY_NAME="🤖 StreamBot" \
    BOT_ENABLED="true" \
    RESPONSE_COOLDOWN="30" \
    DEBUG_MODE="false" \
    COMMAND_PREFIX="!"
```

#### Step 7: Configure Startup Command

```bash
az webapp config set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME \
  --startup-file "node src/bot.js"
```

#### Step 8: Deploy Your Code

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Azure deployment"

# Get deployment credentials
az webapp deployment source config-local-git \
  --name YOUR-UNIQUE-BOT-NAME \
  --resource-group twitch-bot-rg

# Get the git URL (output from above command)
# Add Azure as a git remote
az webapp deployment list-publishing-credentials \
  --name YOUR-UNIQUE-BOT-NAME \
  --resource-group twitch-bot-rg \
  --query "{Username:publishingUserName, Password:publishingPassword}" \
  --output json

# Configure git remote
git remote add azure https://YOUR-UNIQUE-BOT-NAME.scm.azurewebsites.net:443/YOUR-UNIQUE-BOT-NAME.git

# Deploy
git push azure main
```

#### Step 9: Enable Always On

```bash
# Keeps your bot running 24/7
az webapp config set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME \
  --always-on true
```

#### Step 10: View Logs

```bash
# Stream logs
az webapp log tail \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME
```

---

### Option 2: Azure Container Instances

Perfect for running Docker containers without managing servers.

#### Step 1: Build Docker Image

```bash
# Build the image
docker build -t twitch-bot:latest .

# Test locally (optional)
docker run --env-file .env twitch-bot:latest
```

#### Step 2: Create Azure Container Registry (ACR)

```bash
# Create registry
az acr create \
  --resource-group twitch-bot-rg \
  --name YOUR_UNIQUE_REGISTRY_NAME \
  --sku Basic

# Login to registry
az acr login --name YOUR_UNIQUE_REGISTRY_NAME

# Tag your image
docker tag twitch-bot:latest YOUR_UNIQUE_REGISTRY_NAME.azurecr.io/twitch-bot:latest

# Push to ACR
docker push YOUR_UNIQUE_REGISTRY_NAME.azurecr.io/twitch-bot:latest
```

#### Step 3: Create Container Instance

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name YOUR_UNIQUE_REGISTRY_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name YOUR_UNIQUE_REGISTRY_NAME --query passwords[0].value --output tsv)

# Create container instance
az container create \
  --resource-group twitch-bot-rg \
  --name twitch-bot-container \
  --image YOUR_UNIQUE_REGISTRY_NAME.azurecr.io/twitch-bot:latest \
  --registry-login-server YOUR_UNIQUE_REGISTRY_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --environment-variables \
    TWITCH_BOT_USERNAME="beast" \
    TWITCH_CHANNEL="ashwinmaurya" \
    BOT_DISPLAY_NAME="🤖 StreamBot" \
    BOT_ENABLED="true" \
    RESPONSE_COOLDOWN="30" \
    DEBUG_MODE="false" \
    COMMAND_PREFIX="!" \
  --secure-environment-variables \
    TWITCH_OAUTH_TOKEN="your_oauth_token" \
    GROQ_API_KEY="your_groq_key" \
  --cpu 1 \
  --memory 1 \
  --restart-policy Always
```

#### View Container Logs

```bash
az container logs \
  --resource-group twitch-bot-rg \
  --name twitch-bot-container \
  --follow
```

---

### Option 3: Azure Virtual Machine

For full control, deploy on a VM.

#### Quick Setup

```bash
# Create VM
az vm create \
  --resource-group twitch-bot-rg \
  --name twitch-bot-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys

# SSH into VM
ssh azureuser@<VM-IP-ADDRESS>

# On the VM, install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clone your repo or upload files
# Install dependencies
npm install

# Install PM2 to keep bot running
sudo npm install -g pm2

# Start bot
pm2 start src/bot.js --name twitch-bot

# Save PM2 config
pm2 save

# Set PM2 to start on boot
pm2 startup
```

---

## Cost Estimates

### App Service (B1)
- **Cost**: ~$13.14/month
- **Specs**: 1 Core, 1.75 GB RAM
- **Best For**: Simple deployment

### Container Instances
- **Cost**: ~$10-15/month (1 vCPU, 1GB RAM, always running)
- **Best For**: Docker-based deployments

### VM (B1s)
- **Cost**: ~$7.59/month
- **Specs**: 1 vCPU, 1 GB RAM
- **Best For**: Full control

---

## Management Commands

### Update Environment Variables
```bash
az webapp config appsettings set \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME \
  --settings NEW_VAR="value"
```

### Restart Bot
```bash
# App Service
az webapp restart \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME

# Container Instance
az container restart \
  --resource-group twitch-bot-rg \
  --name twitch-bot-container
```

### View Logs
```bash
# App Service
az webapp log tail \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME

# Container Instance
az container logs \
  --resource-group twitch-bot-rg \
  --name twitch-bot-container
```

### Stop Bot
```bash
# App Service
az webapp stop \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME

# Container Instance
az container stop \
  --resource-group twitch-bot-rg \
  --name twitch-bot-container
```

### Delete Resources (to save costs)
```bash
# Delete entire resource group
az group delete --name twitch-bot-rg --yes
```

---

## Monitoring

### Enable Application Insights (Optional)
```bash
az monitor app-insights component create \
  --app twitch-bot-insights \
  --location eastus \
  --resource-group twitch-bot-rg

# Get instrumentation key
az monitor app-insights component show \
  --app twitch-bot-insights \
  --resource-group twitch-bot-rg \
  --query instrumentationKey
```

---

## Troubleshooting

### Bot Not Starting
```bash
# Check logs
az webapp log tail --resource-group twitch-bot-rg --name YOUR-UNIQUE-BOT-NAME

# Verify environment variables
az webapp config appsettings list \
  --resource-group twitch-bot-rg \
  --name YOUR-UNIQUE-BOT-NAME
```

### High Memory Usage
- Upgrade to B2 tier: `az appservice plan update --name twitch-bot-plan --resource-group twitch-bot-rg --sku B2`

### Connection Issues
- Check OAuth token is valid
- Verify TWITCH_CHANNEL name is correct
- Ensure Always On is enabled

---

## Recommended: App Service with Always On

For easiest deployment with good reliability:

```bash
# Quick deployment script
az login
az group create --name twitch-bot-rg --location eastus
az appservice plan create --name twitch-bot-plan --resource-group twitch-bot-rg --sku B1 --is-linux
az webapp create --resource-group twitch-bot-rg --plan twitch-bot-plan --name YOUR-BOT-NAME --runtime "NODE:20-lts"
az webapp config appsettings set --resource-group twitch-bot-rg --name YOUR-BOT-NAME --settings TWITCH_BOT_USERNAME="beast" TWITCH_OAUTH_TOKEN="your_token" TWITCH_CHANNEL="ashwinmaurya" GROQ_API_KEY="your_key" BOT_DISPLAY_NAME="🤖 StreamBot"
az webapp config set --resource-group twitch-bot-rg --name YOUR-BOT-NAME --always-on true --startup-file "node src/bot.js"
git remote add azure https://YOUR-BOT-NAME.scm.azurewebsites.net:443/YOUR-BOT-NAME.git
git push azure main
```

Replace `YOUR-BOT-NAME` and credential values as needed.
