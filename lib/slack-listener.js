'use strict';

var EventEmitter = require('events');
var slack = require('slack');
var _ = require('lodash');

function SlackListener() {
  this.bot = slack.rtm.client();
};

SlackListener.prototype.listen = function listen(context) {
  console.log('Connecting to Slack...');

  // Add handler
  context.slack.connection = this.bot;
  context.slack.handler.handle(context);

  // Emit for all events
  _.forEach(this.bot.handlers, function(_, eventName) {
    this.bot[eventName](function(payload) {
      try {
        context.slack.events.emit(eventName, payload);
      } catch(error) {
        console.error('Slack listener failed to emit event ' + eventName + ': ' + error);
      }
    });
  }.bind(this));

  // Listen for events
  this.bot.listen({
    token: context.slack.token
  });
};

module.exports = SlackListener;
