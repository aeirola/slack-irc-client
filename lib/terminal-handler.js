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
  context.logger.verbose('Starting terminal handler');

  _.forEach(TERMINAL_EVENTS, function(handler, eventName) {
    var boundHandler = handler.bind(this, context);
    context.terminal.events.removeAllListeners(eventName);
    context.terminal.events.addListener(eventName, function() {
      try {
        boundHandler.apply(this, arguments);
      } catch(error) {
        context.logger.error('Failed to handle terminal event %s', eventName, error);
      }
    }.bind(this));
  }.bind(this));
};

module.exports = TerminalHandler;
