'use strict';

var irc = require('irc');

module.exports = {
  init: function initIrcListener(context) {
    if (context.irc.events || context.irc.client) {
      context.logger.info('IRC listener already initialized, skipping.');
      return;
    }

    context.logger.info('Connecting to IRC...');

    var ircOptions = context.irc.options || {};
    context.irc.client = new irc.Client(ircOptions.server, ircOptions.nick, ircOptions);

    // TODO: add ping timeout handling, or wait for client support

    context.irc.events = context.irc.client;
    context.domain.add(context.irc.events);

    context.irc.handler.init(context);
  },
  reload: function reloadIrcListener(context) {
    // Noop
  },
  close: function closeIrcListener(context) {
    context.logger.info('Disconnecting form IRC');
    if (!context.irc.client) {
      context.logger.warn('Cannot close IRC listener before starting it');
      return;
    }

    context.irc.client.disconnect();
    context.irc.client = null;

    context.irc.handler.close(context);
    context.domain.remove(context.irc.events);
    context.irc.events.removeAllListeners();
    context.irc.events = null;
  }
};
