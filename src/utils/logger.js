const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack 
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.DEBUG_MODE === 'true' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File output for all logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'bot.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Separate file for errors
    new winston.transports.File({ 
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

module.exports = logger;
