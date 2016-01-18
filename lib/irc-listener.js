'use strict';

var irc = require('irc');

function IrcListener() {
};

IrcListener.prototype.listen = function listen(context) {
  console.log('Connecting to IRC...');

  var ircOptions = context.irc.options || {};
  this.irc = new irc.Client(ircOptions.server, ircOptions.nick, ircOptions);

  // TODO: add ping timeout handling

  context.irc.client = this.irc;
  context.irc.events = this.irc;
  context.domain.add(context.irc.events);

  context.irc.handler.handle(context);
};

module.exports = IrcListener;
