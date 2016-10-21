'use strict';

require('dotenv').load();

const ROOT_PATH = require('app-root-path');
const Hapi = require('hapi');
const logger = require(ROOT_PATH + '/libs/logger');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  labels: ['service'],
  host: process.env.API_HOST,
  port: process.env.API_PORT,
  routes: { cors: true }
});

// Load multiple plugins
server.register([
  {
    register: require(ROOT_PATH + '/libs/plugins/eventEmitter/index')
  },
  {
    register: require(ROOT_PATH + '/libs/plugins/redis/index'),
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db  : process.env.REDIS_DB
    }
  },
  {
    register: require(ROOT_PATH + '/libs/plugins/service/index')
  }
], function (error) {
  if (error) {
    logger.error('Failed to load a plugin:', error);
  } else {
    // Start the server
    server.start((err) => {
      if (err) {
        throw err;
      }

      logger.info('Server is running at http://%s:%s/', process.env.API_HOST, process.env.API_PORT);
    });
  }
});
