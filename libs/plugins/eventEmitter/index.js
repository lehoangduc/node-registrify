"use strict";

const ROOT_PATH = require('app-root-path');
const events = require('events');
const logger = require(ROOT_PATH + '/libs/logger');

var EventEmitterPlugin = function(server, options, next) {
  var eventEmitter = function() {
    var self = this;

    // Listen events
    self.on('event:log', function(data) {
      logger.debug('Event log data: ', data);
    });
  };

  eventEmitter.prototype.__proto__ = events.EventEmitter.prototype;

  server.expose('emitter', new eventEmitter());

  next();
};

EventEmitterPlugin.attributes = {
  name: 'EventEmitter',
  version: '1.0.0',
  multiple: false
};

exports.register = EventEmitterPlugin;
