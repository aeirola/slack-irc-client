'use strict';

var irc = require('irc');

function IrcListener() {
};

IrcListener.prototype.listen = function listen(context) {
  console.log('Connecting to IRC...');

  var ircOptions = context.irc.options || {};
  this.irc = new irc.Client(ircOptions.server, ircOptions.nick, ircOptions);

  context.irc.connection = this.irc;
  context.irc.events = this.irc;
  context.irc.handler.handle(context);
};

module.exports = IrcListener;
