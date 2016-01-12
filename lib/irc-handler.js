'use strict';

var _ = require('lodash');

var slacker = require('./util/slacker');

var IRC_EVENTS = {
  registered: function registered(context, message) {
    console.log('Successfully connected to IRC');
    console.log(message);
  },
  topic: function topic(context, channel, topic, nick, message) {
    console.log('Saw topic change on IRC');
  },
  message: function message(context, nick, to, text, message) {
    console.log('Saw new message on IRC', nick, to, text, message);
    if (_.startsWith(to, '#')) {
      slacker.channels.send({
         token: context.slack.token,
         channel: to,
         text: text,
         username: nick,
         as_user: false
      }, console.log.bind(null, 'channels.send'));
    } else {
      slacker.groups.send({
        token: context.slack.token,
         channel: nick,
         text: text,
         username: nick,
         as_user: false
      }, console.log.bind(null, 'groups.send'));
      listen.slack.listen({token: TOKEN});
    }
  },
  action: function action(context, from, to, text, message) {
    console.log('Saw new action on IRC');
  },
  notice: function notice(nick, to, text, message) {
    console.log('Saw new notice on IRC');
  },
  'ctcp-version': function ctcpVersion(from, to, message) {

  },
  error: function error(context, message) {
    console.error('IRC connection error', message);
  }
};

function IrcHandler() {
};

IrcHandler.prototype.handle = function handle(context) {
  _.forEach(IRC_EVENTS, function(handler, eventName) {
    var boundHandler = handler.bind(this, context);
    context.irc.events.removeAllListeners(eventName);
    context.irc.events.addListener(eventName, function() {
      try {
        boundHandler.apply(this, arguments);
      } catch (error) {
        console.error('Failed to handle IRC event ' + eventName + ': ' + error.message);
      }
    }.bind(this));
  }.bind(this));
};

module.exports = IrcHandler;
