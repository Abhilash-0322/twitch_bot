require('dotenv').config();
const logger = require('./utils/logger');

async function testConnection() {
  logger.info('Testing Twitch bot configuration...\n');

  // Check environment variables
  const vars = {
    'TWITCH_BOT_USERNAME': process.env.TWITCH_BOT_USERNAME,
    'TWITCH_OAUTH_TOKEN': process.env.TWITCH_OAUTH_TOKEN ? '***' + process.env.TWITCH_OAUTH_TOKEN.slice(-5) : undefined,
    'TWITCH_CHANNEL': process.env.TWITCH_CHANNEL,
    'BOT_ENABLED': process.env.BOT_ENABLED,
    'COMMAND_PREFIX': process.env.COMMAND_PREFIX
  };

  let allGood = true;

  for (const [key, value] of Object.entries(vars)) {
    if (!value || value === 'undefined') {
      logger.error(`❌ ${key} is not set`);
      allGood = false;
    } else {
      logger.info(`✓ ${key}: ${value}`);
    }
  }

  if (!allGood) {
    logger.error('\n⚠️  Please set all required environment variables in .env file');
    process.exit(1);
  }

  // Check OAuth token format
  if (process.env.TWITCH_OAUTH_TOKEN && !process.env.TWITCH_OAUTH_TOKEN.startsWith('oauth:')) {
    logger.error('❌ TWITCH_OAUTH_TOKEN must start with "oauth:"');
    allGood = false;
  }

  if (allGood) {
    logger.info('\n✓ All configuration checks passed!');
    logger.info('You can now run: npm start');
  }
}

testConnection();
