// For Backend (Node.js)
// Install required packages:
// npm install winston winston-daily-rotate-file

// logger.js
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, json } = format;

const myFormat = printf(({ level, message, timestamp, component, ...metadata }) => {
  return `${timestamp} [${level}] [${component}]: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json(),
    myFormat
  ),
  defaultMeta: { component: 'backend' },
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: 'logs/fitness-app-error.log', 
      level: 'error',
      maxSize: '10m',
      maxFiles: '7d'
    }),
    new transports.File({ 
      filename: 'logs/fitness-app.log',
      maxSize: '10m',
      maxFiles: '7d'
    })
  ],
});

module.exports = logger;

// Usage in your Express application
// app.js or server.js
const logger = require('./logger');

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Error logging middleware (put this after your routes)
app.use((err, req, res, next) => {
  logger.error(`Error processing request ${req.method} ${req.originalUrl}`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(500).json({ error: 'Internal server error' });
});

// For React Frontend
// Create a file for logging service
// src/services/logService.js

export const logLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export const logService = {
  sendLog(level, message, data = {}) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${level.toUpperCase()}]`, message, data);
      return;
    }
    
    // In production, send to backend
    const logData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component: 'frontend',
      ...data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to your backend logging endpoint
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData),
      // Use keepalive to ensure log is sent even during page transitions
      keepalive: true
    }).catch(err => {
      // If API log fails, fallback to console
      console.error('Failed to send log to API', err);
    });
  },
  
  error(message, data) {
    this.sendLog(logLevels.ERROR, message, data);
  },
  
  warn(message, data) {
    this.sendLog(logLevels.WARN, message, data);
  },
  
  info(message, data) {
    this.sendLog(logLevels.INFO, message, data);
  },
  
  debug(message, data) {
    this.sendLog(logLevels.DEBUG, message, data);
  }
};

// Add a backend endpoint to collect frontend logs
// In your Express backend:
app.post('/api/logs', (req, res) => {
  const logData = req.body;
  
  // Log using the backend logger
  logger.log(logData.level, logData.message, {
    component: 'frontend',
    ...logData
  });
  
  res.status(200).send({ success: true });
});