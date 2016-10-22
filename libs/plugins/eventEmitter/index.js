"use strict";

const events = require('events');
const logger = require('../../logger');

var EventEmitterPlugin = function(server, options, next) {
  var eventEmitter = function() {
    // Listen events
    this.on('event:log', function(data) {
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
