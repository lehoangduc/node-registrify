"use strict";

const logger = require('../../logger');
const redis = require('redis');

var RedisPlugin = function (server, options, next) {
  options = options || {};

  var host = options.host;
  var port = options.port;
  var db   = options.db;

  var redisClient = redis.createClient(port, host);
  redisClient.select(db);

  var initialErrorHandler = function(error) {
    logger.error(error.message);

    next(error);
    redisClient.end(true);
  };

  var defaultErrorHandler = function(error) {
    logger.error(error.message);

    next(error);
  };

  redisClient.on('error', initialErrorHandler);

  redisClient.on('ready', function() {
    logger.info('Redis connection created');

    // change the error handler to simply log errors
    redisClient.removeListener('error', initialErrorHandler);
    redisClient.on('error', defaultErrorHandler);

    next();
  });

  server.expose('client', redisClient);
};

RedisPlugin.attributes = {
  name: 'Redis',
  version: '1.0.0',
  multiple: false
};

exports.register = RedisPlugin;
