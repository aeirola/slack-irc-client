'use strict';

var EventEmitter = require('events');

function TerminalListener() {
};

TerminalListener.prototype.listen = function listen(context) {
  // Add handler
  context.terminal.handler.handle(context);

  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk) {
      var command = chunk.toString('ascii').replace('\n', '');
      try {
        var handled = context.terminal.events.emit(command);
        if (!handled) {
          console.log('Unknown command: \'' + command + '\'');
        }
      } catch(error) {
        console.error('Terminal listener failed to emit event ' + command + ': ' + error);
      }
    }
  }.bind(this));
};

module.exports = TerminalListener;
