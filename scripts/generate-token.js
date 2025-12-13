#!/usr/bin/env node

/**
 * OAuth Token Generator Helper
 * 
 * This script helps generate OAuth tokens for your Twitch bot
 * by starting a local server and handling the OAuth flow.
 * 
 * Requirements:
 * - Client ID and Client Secret from https://dev.twitch.tv/console/apps
 * - Bot account to authorize
 */

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║         Twitch Bot OAuth Token Generator                  ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
let clientId = '';

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  clientId = process.env.TWITCH_CLIENT_ID || '';
}

if (!clientId) {
  console.log(`${colors.yellow}⚠️  No Client ID found in .env file${colors.reset}\n`);
  console.log('To use this automatic token generator, you need to:');
  console.log('1. Create a Twitch application at: https://dev.twitch.tv/console/apps');
  console.log('2. Add TWITCH_CLIENT_ID to your .env file\n');
  console.log(`${colors.bright}For a quicker alternative:${colors.reset}`);
  console.log(`${colors.cyan}Visit: https://twitchtokengenerator.com/${colors.reset}\n`);
  console.log('This web service will generate a token for you in seconds!\n');
  process.exit(1);
}

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPES = 'chat:read chat:edit';

// Build authorization URL
const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'token');
authUrl.searchParams.set('scope', SCOPES);

console.log(`${colors.green}✓${colors.reset} Starting local server on port ${PORT}...\n`);

// Create HTTP server to receive the callback
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Serve the callback page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Twitch OAuth Token Generator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #0e0e10;
            color: #efeff1;
          }
          .container {
            background: #18181b;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
          }
          .success { color: #00ff00; }
          .error { color: #ff0000; }
          code {
            background: #0e0e10;
            padding: 10px;
            border-radius: 4px;
            display: block;
            margin: 20px 0;
            word-break: break-all;
          }
          button {
            background: #9147ff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
          }
          button:hover { background: #7d3ac1; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Twitch Bot OAuth Token Generator</h1>
          <p id="status">Processing authorization...</p>
          <div id="result"></div>
        </div>
        <script>
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const token = params.get('access_token');
          
          if (token) {
            document.getElementById('status').innerHTML = 
              '<span class="success">✓ Token Generated Successfully!</span>';
            
            document.getElementById('result').innerHTML = 
              '<h3>Your OAuth Token:</h3>' +
              '<code>oauth:' + token + '</code>' +
              '<p>Copy this token and paste it into your .env file</p>' +
              '<button onclick="copyToken()">Copy Token</button>' +
              '<button onclick="saveToFile()">Save to .env</button>' +
              '<p style="font-size: 12px; color: #adadb8;">You can close this window after copying the token.</p>';
            
            window.copyToken = function() {
              navigator.clipboard.writeText('oauth:' + token);
              alert('Token copied to clipboard!');
            };
            
            window.saveToFile = function() {
              fetch('/save-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: 'oauth:' + token })
              })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  alert('Token saved to .env file!');
                  setTimeout(() => window.close(), 1000);
                } else {
                  alert('Error saving token: ' + data.error);
                }
              });
            };
          } else {
            document.getElementById('status').innerHTML = 
              '<span class="error">✗ Authorization Failed</span>';
            document.getElementById('result').innerHTML = 
              '<p>No token received. Please try again.</p>';
          }
        </script>
      </body>
      </html>
    `);
  } else if (req.url === '/save-token' && req.method === 'POST') {
    // Handle token save
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { token } = JSON.parse(body);
        
        // Read current .env
        let envContent = fs.existsSync(envPath) 
          ? fs.readFileSync(envPath, 'utf8') 
          : '';
        
        // Update or add TWITCH_OAUTH_TOKEN
        if (envContent.includes('TWITCH_OAUTH_TOKEN=')) {
          envContent = envContent.replace(
            /TWITCH_OAUTH_TOKEN=.*/,
            `TWITCH_OAUTH_TOKEN=${token}`
          );
        } else {
          envContent += `\nTWITCH_OAUTH_TOKEN=${token}\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        
        console.log(`\n${colors.green}✓ Token saved to .env file${colors.reset}`);
        console.log('\nYou can now run: npm start\n');
        
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 2000);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`${colors.bright}Next steps:${colors.reset}\n`);
  console.log('1. A browser window will open automatically');
  console.log('2. Log in with your BOT account (not your main account)');
  console.log('3. Click "Authorize" to grant permissions');
  console.log('4. The token will be automatically saved to your .env file\n');
  console.log(`${colors.yellow}If browser doesn't open, visit:${colors.reset}`);
  console.log(`${colors.cyan}${authUrl.toString()}${colors.reset}\n`);
  
  // Try to open browser automatically
  const open = require('child_process').exec;
  const command = process.platform === 'darwin' 
    ? 'open' 
    : process.platform === 'win32' 
    ? 'start' 
    : 'xdg-open';
  
  open(`${command} "${authUrl.toString()}"`);
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`${colors.red}Error: Port ${PORT} is already in use${colors.reset}`);
    console.error('Please close any application using port 3000 and try again\n');
  } else {
    console.error(`${colors.red}Error:${colors.reset}`, err.message);
  }
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Token generation cancelled${colors.reset}\n`);
  server.close();
  process.exit(0);
});
