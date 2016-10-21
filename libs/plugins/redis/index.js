"use strict";

const ROOT_PATH = require('app-root-path');
const logger = require(ROOT_PATH + '/libs/logger');
const redis = require('redis');

var RedisPlugin = function (server, options, next) {
  options = options || {};

  var host = options.host || 'localhost';
  var port = options.port || 6379;
  var db   = options.db   || 0;

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
