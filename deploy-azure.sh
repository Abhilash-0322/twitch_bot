#!/bin/bash

# Azure Twitch Bot Deployment Script
# This script automates the deployment of your Twitch bot to Azure App Service

set -e  # Exit on any error

echo "=================================================="
echo "Azure Twitch Bot Deployment"
echo "=================================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed."
    echo "Install it from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

echo "✅ Azure CLI found"
echo ""

# Configuration
read -p "Enter your Azure Resource Group name (default: twitch-bot-rg): " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-twitch-bot-rg}

read -p "Enter Azure region (default: eastus): " LOCATION
LOCATION=${LOCATION:-eastus}

read -p "Enter unique App Service name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App Service name is required"
    exit 1
fi

read -p "Enter App Service Plan SKU (B1/B2/S1, default: B1): " SKU
SKU=${SKU:-B1}

echo ""
echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  App Name: $APP_NAME"
echo "  SKU: $SKU"
echo ""
read -p "Continue with deployment? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🔐 Logging into Azure..."
az login

echo ""
echo "📦 Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo ""
echo "🚀 Creating App Service Plan..."
az appservice plan create \
  --name ${APP_NAME}-plan \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux

echo ""
echo "🌐 Creating Web App..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan ${APP_NAME}-plan \
  --name $APP_NAME \
  --runtime "NODE:20-lts"

echo ""
echo "⚙️  Configuring startup command..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "node src/bot.js"

echo ""
echo "🔄 Enabling Always On..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --always-on true

echo ""
echo "🔧 Setting environment variables..."
echo "Please provide your bot credentials:"

read -p "TWITCH_BOT_USERNAME: " BOT_USERNAME
read -p "TWITCH_OAUTH_TOKEN: " OAUTH_TOKEN
read -p "TWITCH_CHANNEL: " CHANNEL
read -p "GROQ_API_KEY: " GROQ_KEY
read -p "BOT_DISPLAY_NAME (default: 🤖 StreamBot): " DISPLAY_NAME
DISPLAY_NAME=${DISPLAY_NAME:-"🤖 StreamBot"}

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    TWITCH_BOT_USERNAME="$BOT_USERNAME" \
    TWITCH_OAUTH_TOKEN="$OAUTH_TOKEN" \
    TWITCH_CHANNEL="$CHANNEL" \
    GROQ_API_KEY="$GROQ_KEY" \
    BOT_DISPLAY_NAME="$DISPLAY_NAME" \
    BOT_ENABLED="true" \
    RESPONSE_COOLDOWN="30" \
    DEBUG_MODE="false" \
    COMMAND_PREFIX="!"

echo ""
echo "📤 Configuring Git deployment..."

# Initialize git if not already done
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit for Azure deployment"
fi

# Configure deployment
az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Get deployment URL
DEPLOY_URL=$(az webapp deployment source show --name $APP_NAME --resource-group $RESOURCE_GROUP --query repoUrl --output tsv)

echo ""
echo "Adding Azure as git remote..."
git remote remove azure 2>/dev/null || true
git remote add azure $DEPLOY_URL

echo ""
echo "🚀 Deploying to Azure..."
echo "Note: You may be prompted for deployment credentials"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

git push azure $BRANCH:master

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "Your bot is now running on Azure!"
echo ""
echo "App URL: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "Useful commands:"
echo "  View logs:    az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "  Restart bot:  az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "  Stop bot:     az webapp stop --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo ""
echo "To update your bot in the future, just run:"
echo "  git add ."
echo "  git commit -m 'Update bot'"
echo "  git push azure $BRANCH:master"
echo ""
