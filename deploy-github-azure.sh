#!/bin/bash

# Azure Deployment from GitHub
# Simplified deployment using GitHub repository

set -e

echo "=================================================="
echo "Azure Twitch Bot Deployment (GitHub)"
echo "=================================================="
echo ""

# Configuration
RESOURCE_GROUP="twitch-bot-rg"
LOCATION="eastus"
APP_NAME="streamhelper971"
GITHUB_REPO="https://github.com/Abhilash-0322/twitch_bot"
BRANCH="main"

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Name: $APP_NAME"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  Branch: $BRANCH"
echo ""

# Check if already logged in
if ! az account show &> /dev/null; then
    echo "🔐 Logging into Azure..."
    az login
else
    echo "✅ Already logged into Azure"
fi

echo ""
echo "📦 Creating/Updating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

echo ""
echo "🚀 Creating/Updating App Service Plan..."
if az appservice plan show --name ${APP_NAME}-plan --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "  App Service Plan already exists"
else
    az appservice plan create \
      --name ${APP_NAME}-plan \
      --resource-group $RESOURCE_GROUP \
      --sku B1 \
      --is-linux \
      --output none
fi

echo ""
echo "🌐 Creating/Updating Web App..."
if az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "  Web App already exists"
else
    az webapp create \
      --resource-group $RESOURCE_GROUP \
      --plan ${APP_NAME}-plan \
      --name $APP_NAME \
      --runtime "NODE:20-lts" \
      --output none
fi

echo ""
echo "⚙️  Configuring startup command..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "node src/bot.js" \
  --output none

echo ""
echo "🔄 Enabling Always On..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --always-on true \
  --output none

echo ""
echo "🔧 Setting environment variables..."
echo "Enter your credentials (or press Enter to skip if already set):"
echo ""

read -p "TWITCH_BOT_USERNAME [beast]: " BOT_USERNAME
BOT_USERNAME=${BOT_USERNAME:-beast}

read -p "TWITCH_OAUTH_TOKEN: " OAUTH_TOKEN
read -p "TWITCH_CHANNEL [ashwinmaurya]: " CHANNEL
CHANNEL=${CHANNEL:-ashwinmaurya}

read -p "GROQ_API_KEY: " GROQ_KEY
read -p "BOT_DISPLAY_NAME [🤖 StreamBot]: " DISPLAY_NAME
DISPLAY_NAME=${DISPLAY_NAME:-"🤖 StreamBot"}

echo ""
echo "Setting environment variables..."
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
    COMMAND_PREFIX="!" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
  --output none

echo ""
echo "📤 Configuring GitHub deployment..."
az webapp deployment source config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --repo-url $GITHUB_REPO \
  --branch $BRANCH \
  --manual-integration

echo ""
echo "🚀 Triggering deployment..."
az webapp deployment source sync \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

echo ""
echo "=================================================="
echo "✅ Deployment Started!"
echo "=================================================="
echo ""
echo "Your bot is deploying from GitHub!"
echo ""
echo "Monitor deployment:"
echo "  az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo ""
echo "Check deployment status:"
echo "  az webapp deployment source show --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "To update bot in future:"
echo "  1. Push changes to GitHub"
echo "  2. Run: az webapp deployment source sync --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "Or enable continuous deployment with GitHub Actions!"
echo ""
