'use strict';

const Hapi = require('hapi');
const logger = require('./libs/logger');

function NodeRegistrify() {
  this.server = new Hapi.Server();
}

NodeRegistrify.prototype.init = function (options) {
  this.options = {
    api_host:        options.api_host || 'localhost',
    api_port:        options.api_port || '8000',
    redis_host:      options.redis_host || 'localhost',
    redis_port:      options.redis_port || '6379',
    redis_db:        options.redis_db || 0,
    log_level:       options.log_level || 'info',
    log_max_entries: options.log_max_entries || 10
  };

  process.env.LOG_LEVEL = this.options.log_level;

  this.server.connection({
    labels: ['service'],
    host: this.options.api_host,
    port: this.options.api_port,
    routes: { cors: true }
  });
};


NodeRegistrify.prototype.run = function () {
  var self = this;

  // Load plugins
  self.server.register([
    {
      register: require('./libs/plugins/eventEmitter/index')
    },
    {
      register: require('./libs/plugins/redis/index'),
      options: {
        host: self.options.redis_host,
        port: self.options.redis_port,
        db  : self.options.redis_db
      }
    },
    {
      register: require('./libs/plugins/service/index'),
      options: {
        log_max_entries: self.options.log_max_entries
      }
    }
  ], function (error) {
    if (error) {
      logger.error('Failed to load a plugin:', error);
    } else {
      // Start server
      self.server.start((err) => {
        if (err) {
          throw err;
        }

        logger.info('Server is running at http://%s:%s/', self.options.api_host, self.options.api_port);
      });
    }
  });
};

module.exports = new NodeRegistrify();