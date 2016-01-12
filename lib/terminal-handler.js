'use strict';

var _ = require('lodash');

var TERMINAL_EVENTS = {
  reload: function started(context) {
    var hotReload = require('./hot-reload');
    hotReload(context);
  }
};

function TerminalHandler() {
};

TerminalHandler.prototype.handle = function handle(context) {
  _.forEach(TERMINAL_EVENTS, function(handler, eventName) {
    var boundHandler = handler.bind(this, context);
    context.terminal.events.removeAllListeners(eventName);
    context.terminal.events.addListener(eventName, function() {
      try {
        boundHandler.apply(this, arguments);
      } catch(error) {
        console.error('Failed to handle terminal event ' + eventName + ': ' + error.message);
      }
    }.bind(this));
  }.bind(this));
};

module.exports = TerminalHandler;
