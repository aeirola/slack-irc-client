'use strict';

var EventEmitter = require('events');

module.exports = {
  init: function initTerminaListener(context) {
    if (context.terminal.events) {
      context.logger.info('Terminal listener already initialized, skipping.');
      return;
    }

    context.logger.verbose('Starting terminal listener');

    // Add event emitter
    context.terminal.events = new EventEmitter();
    context.domain.add(context.terminal.events);

    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();
      if (chunk) {
        var command = chunk.toString('ascii').replace('\n', '');
        var handled = context.terminal.events.emit(command);
        if (!handled) {
          context.logger.warn('Unknown command: \'%s\'', command);
        }
      }
    }.bind(this));

    // Add handler
    context.terminal.handler.init(context);
  },
  reload: function reloadTerminaListener(context) {
    context.logger.info('Reloading terminal listener');

    context.terminal.listener.close(context);
    context.terminal.listener = module.exports;
    context.terminal.listener.init(context);
  },
  close: function closeTerminaListener(context) {
    context.logger.verbose('Stopping terminal listener');

    process.stdin.removeAllListeners();

    context.terminal.handler.close(context);
    context.domain.remove(context.terminal.events);
    context.terminal.events.removeAllListeners();
    context.terminal.events = null;
  }
};
