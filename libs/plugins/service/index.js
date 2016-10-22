"use strict";

const Promise = require('bluebird');
const util = require('util');
const _ = require('underscore');
const logger = require('../../logger');

var ServicePlugin = function(server, options, next) {
  var Service = {
    /**
     * Get service key
     *
     * @param name
     * @param host
     */
    getServiceKey: function(name, host) {
      return util.format('service:%s:%s', name, host);
    },

    /**
     * Get all services
     *
     * @param request
     * @returns {*}
     */
    services: function(request) {
      var self = this;
      var storage = server.plugins.Redis.client;
      var params = request.params;

      if (params.host) {
        return new Promise(function (resolve, reject) {
          storage.smembers('host:' + params.host + ':services', function (error, result) {
            if (error) {
              logger.debug(error);

              return reject({
                error: {
                  message: 'Cannot get services'
                }
              });
            }

            resolve({ data: result });
          });
        });
      }

      // Get all services info
      return new Promise(function (resolve, reject) {
        storage.keys('service:*:hosts', function (error, result) {
          if (error) {
            logger.debug(error);

            return reject({
              error: {
                message: 'Cannot get services'
              }
            });
          }

          var services = [];

          if (result) {
            Promise.each(result, function(serviceKey) {
              var service = {};
              var matches;

              if (matches = serviceKey.match(/.*?:(.*?):.*?/)) {
                service.name = matches[1];

                return new Promise(function(resolve) {
                  storage.smembers('service:' + service.name + ':hosts', function (error, result) {
                    if (!error) {
                      service.hosts = result;
                      services.push(service);
                    }

                    resolve();
                  });
                });
              }
            }).then(function() {
              resolve({ data: services });
            });
          } else {
            resolve({ data: services });
          }
        });
      });
    },

    /**
     * Get all hosts
     *
     * @param request
     * @returns {*}
     */
    hosts: function(request) {
      var self = this;
      var storage = server.plugins.Redis.client;
      var params = request.params;

      // Get hosts of a service
      if (params.name) {
        return new Promise(function (resolve, reject) {
          storage.smembers('service:' + params.name + ':hosts', function (error, result) {
            if (error) {
              logger.debug(error);

              return reject({
                error: {
                  message: 'Cannot get hosts'
                }
              });
            }

            resolve({ data: result });
          });
        });
      }

      // Get all hosts info
      return new Promise(function(resolve, reject) {
        storage.keys('host:*:services', function(error, result) {
          if (error) {
            logger.debug(error);

            return reject({
              error: {
                message: 'Cannot get hosts'
              }
            });
          }

          var hosts = [];

          if (result) {
            Promise.each(result, function(hostKey) {
              var host = {};
              var matches;

              if (matches = hostKey.match(/.*?:(.*?):.*?/)) {
                host.name = matches[1];

                return new Promise(function(resolve) {
                  storage.smembers('host:' + host.name + ':services', function (error, result) {
                    if (!error) {
                      host.services = result;
                      hosts.push(host);
                    }

                    resolve();
                  });
                });
              }
            }).then(function() {
              resolve({ data: hosts });
            });
          } else {
            resolve({ data: hosts });
          }
        });
      });
    },

    /**
     * Get info of given service
     *
     * @param request
     */
    service: function(request) {
      var self = this;
      var params = request.params;

      if (!params.name) {
        return Promise.reject({
          error: {
            message: '"name","host" params are required'
          }
        });
      }

      var storage = server.plugins.Redis.client;

      if (params.host) {
        return new Promise(function(resolve, reject) {
          storage.hgetall(self.getServiceKey(params.name, params.host), function(error, result) {
            if (error || !result) {
              return reject({
                error: {
                  message: 'Cannot get service info'
                }
              });
            }

            resolve({ data: result });
          });
        });
      }

      // Get info in all hosts
      return new Promise(function (resolve, reject) {
        storage.smembers('service:' + params.name + ':hosts', function (error, result) {
          if (error) {
            logger.debug(error);

            return reject({
              error: {
                message: 'Cannot get service info'
              }
            });
          }

          resolve(result);
        });
      }).then(function (hosts) {
        return Promise.map(hosts, function (host) {
          return new Promise(function(resolve, reject) {
            storage.hgetall(self.getServiceKey(params.name, host), function(error, result) {
              if (error || !result) {
                return reject({
                  error: {
                    message: 'Cannot get service info'
                  }
                });
              }

              // Assign host property
              result.host = host;

              resolve(result);
            });
          });
        })
      }).then(function (result) {
        return { data: result };
      });
    },

    /**
     * Get logs of given service
     *
     * @param request
     */
    logs: function(request) {
      var self = this;
      var params = request.params;

      if (!params.name || !params.host) {
        return Promise.reject({
          error: {
            message: '"name","host" params are required'
          }
        });
      }

      var storage = server.plugins.Redis.client;

      return new Promise(function(resolve, reject) {
        storage.lrange(self.getServiceKey(params.name, params.host) + ':event:log', 0, options.log_max_entries - 1, function(error, result) {
          if (error) {
            return reject({
              error: {
                message: 'Cannot get logs'
              }
            });
          }

          resolve({ data: result });
        });
      });
    },

    /**
     * Register a service
     *
     * @param request
     * @returns Promise
     */
    register: function(request) {
      var self = this;
      var params = request.params;

      if (!params.name || !params.host || !Object.keys(request.payload).length) {
        return Promise.reject({
          error: {
            message: '"name","host" params and body are required'
          }
        });
      }

      var storage = server.plugins.Redis.client;

      // Add a service
      return new Promise(function(resolve, reject) {
        var multi = storage
          .multi()
          .sadd('service:' + params.name + ':hosts', params.host)
          .sadd('host:' + params.host + ':services', params.name);

        _.each(request.payload, function(value, field) {
          multi.hset(self.getServiceKey(params.name, params.host), field, value);
        });

        multi
        .exec(function (error, replies) {
          if (error) {
            logger.debug(error);

            return reject({
              error: {
                message: 'Cannot register service'
              }
            });
          }

          logger.debug('Registered new service');

          resolve({
            data: {
              message: 'success'
            }
          });
        });
      });
    },

    /**
     * Delete a service
     *
     * @param request
     * @returns Promise
     */
    delete: function(request) {
      var self = this;
      var params = request.params;

      if (!params.name || !params.host) {
        return Promise.reject({
          error: {
            message: '"name","host" params are required'
          }
        });
      }

      var storage = server.plugins.Redis.client;

      // Delete a service
      return new Promise(function(resolve, reject) {
        storage
          .multi()
          .srem('service:' + params.name + ':hosts', params.host)
          .srem('host:' + params.host + ':services', params.name)
          .del(self.getServiceKey(params.name, params.host))
          .del(self.getServiceKey(params.name, params.host) + ':event:log')
          .exec(function (error, replies) {
            if (error) {
              logger.debug(error);

              return reject({
                error: {
                  message: 'Cannot delete service'
                }
              });
            }

            resolve({
              data: {
                message: 'success'
              }
            });
          });
      });
    },

    /**
     * Send a log message
     *
     * @param request
     * @returns Promise
     */
    log: function(request) {
      var self = this;
      var params = request.params;

      if (!params.name || !params.host || !request.payload) {
        return Promise.reject({
          error: {
            message: '"name","host" params and body are required'
          }
        });
      }

      var storage = server.plugins.Redis.client;

      // Write log to a service
      return new Promise(function(resolve, reject) {
        storage.exists(self.getServiceKey(params.name, params.host), function(error, result) {
          if (error || !result) {
            return reject({
              error: {
                message: 'Service is not registered'
              }
            });
          }

          resolve();
        });
      }).then(function() {
        return new Promise(function(resolve, reject) {
          storage
            .multi()
            .lpush(self.getServiceKey(params.name, params.host) + ':event:log', request.payload)
            .ltrim(self.getServiceKey(params.name, params.host) + ':event:log', 0, options.log_max_entries - 1)
            .hset(self.getServiceKey(params.name, params.host), 'last_log_time', Math.floor(Date.now() / 1000))
            .exec(function (error, replies) {
              if (error) {
                logger.debug(error);

                return reject({
                  error: {
                    message: 'Cannot send Log event'
                  }
                });
              }

              // Emit log event
              server.plugins.EventEmitter
                .emitter
                .emit('event:log', {
                  service: self.getServiceKey(params.name, params.host),
                  message: request.payload
                });

              resolve({
                data: {
                  message: 'success'
                }
              });
            });
        });
      });
    }
  };

  /* Register routes */
  // Ping
  server.route({
    method: 'GET',
    path: '/ping',
    handler: function(request, reply) {
      reply({
        data: {
          message: 'pong'
        }
      });
    }
  });

  // List all services
  server.route({
    method: 'GET',
    path: '/services',
    handler: function(request, reply) {
      Service
        .services(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // List all hosts
  server.route({
    method: 'GET',
    path: '/services/hosts',
    handler: function(request, reply) {
      Service
        .hosts(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // List all services in given host
  server.route({
    method: 'GET',
    path: '/services/{host}/services',
    handler: function(request, reply) {
      Service
        .services(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // List all hosts in given service
  server.route({
    method: 'GET',
    path: '/services/{name}/hosts',
    handler: function(request, reply) {
      Service
        .hosts(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Get info of given service in a host
  server.route({
    method: 'GET',
    path: '/services/{name}/{host}',
    handler: function(request, reply) {
      Service
        .service(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Get info of given service
  server.route({
    method: 'GET',
    path: '/services/{name}',
    handler: function(request, reply) {
      Service
        .service(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Get all logs for given service
  server.route({
    method: 'GET',
    path: '/services/{name}/{host}/logs',
    handler: function(request, reply) {
      Service
        .logs(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Register a service
  server.route({
    method: 'PUT',
    path: '/services/{name}/{host}',
    handler: function(request, reply) {
      Service
        .register(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Delete a service
  server.route({
    method: 'DELETE',
    path: '/services/{name}/{host}',
    handler: function(request, reply) {
      Service
        .delete(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  // Send log of a service on a host
  server.route({
    method: 'POST',
    path: '/services/{name}/{host}/log',
    handler: function(request, reply) {
      Service
        .log(request)
        .then(function(result) {
          reply(result);
        })
        .catch(function(error) {
          reply(error);
        });
    }
  });

  next();
};

ServicePlugin.attributes = {
  name: 'Registry',
  version: '3.0.4',
  multiple: false
};

exports.register = ServicePlugin;
