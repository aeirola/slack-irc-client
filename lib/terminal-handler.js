'use strict';

var _ = require('lodash');

var TERMINAL_EVENTS = {
  reload: function reload(context) {
    context.logger.info('Reloading modules');
    var hotReload = require('./hot-reload');
    hotReload(context);
  },
  'loglevel silly': function logLevelSilly(context) {
    context.logger.info('Setting log level to: silly');
    context.logger.level = 'silly';
  },
  'loglevel debug': function logLevelDebug(context) {
    context.logger.info('Setting log level to: debug');
    context.logger.level = 'debug';
  },
  'loglevel verbose': function logLevelVerbose(context) {
    context.logger.info('Setting log level to: verbose');
    context.logger.level = 'verbose';
  },
  'loglevel info': function logLevelInfo(context) {
    context.logger.info('Setting log level to: info');
    context.logger.level = 'info';
  },
  help: function help(context) {
    context.logger.info(
      'Terminal commands:\n' +
      ' - reload: reload modules\n' +
      ' - loglevel [debug|verbose|info]: reload modules\n' +
      ' - help: show terminal help\n' +
      ''
    );
  }
};

module.exports = {
  init: function initTerminalHandler(context) {
    context.logger.verbose('Binding terminal event handler');
    if (!context.terminal.events) {
      context.logger.error('Cannot bind terminal event handler before terminal event listener');
      return;
    }

    _.forEach(TERMINAL_EVENTS, function(handler, eventName) {
      var boundHandler = handler.bind(null, context);
      handler._boundListener = function() {
        try {
          boundHandler.apply(null, arguments);
        } catch(error) {
          context.logger.error('Failed to handle terminal event %s', eventName, error);
        }
      };
      context.terminal.events.addListener(eventName, handler._boundListener);
    });
  },
  reload: function reloadTerminalHandler(context) {
    context.logger.info('Reloading terminal event handler');

    context.terminal.handler.close(context);
    context.terminal.handler = module.exports;
    context.terminal.handler.init(context);
  },
  close: function closeTerminalHandler(context) {
    context.logger.verbose('Unbinding terminal event handler');

    if (context.terminal.events) {
      _.forEach(TERMINAL_EVENTS, function(handler, eventName) {
        context.terminal.events.removeListener(eventName, handler._boundListener);
      });
    }
  }
};
