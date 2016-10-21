const logger = require('bunyan').createLogger({
  name: 'service'
});

// Set log level
logger.level(process.env.LOG_LEVEL || 'info');

module.exports = logger;
