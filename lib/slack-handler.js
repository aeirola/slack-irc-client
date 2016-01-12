'use strict';

var _ = require('lodash');

var SLACK_EVENTS = {
  started: function started(context, payload) {
    console.log('Successfully connected to Slack');
    // Cache data
    context.slack.channels = _.indexBy(payload.channels, 'id');
    context.slack.groups = _.indexBy(payload.groups, 'id');

    // Prepare IRC connection
    var selfUser = _.find(payload.users, {name: payload.self.name});
    var selfUserConfig = JSON.parse(selfUser.profile.title.replace(/[\u201C-\u201D]/g, '"'));

    var channels = _.chain(payload.channels)
                    .filter('is_member')
                    .map(function(channel) {
                      return '#' + channel.name;
                    }).valueOf();

    context.irc.options = {
      server: selfUserConfig.server,
      port: selfUserConfig.port || 6667,
      nick: payload.self.name,
      realName: selfUser.real_name,
      channels: channels
    };

    context.irc.options = _.assign(context.irc.options, selfUserConfig);
    context.irc.listener.listen(context);
  },
  message: function message(context, payload) {
    console.log('Saw new message on slack');

    if (payload.subtype === 'bot_message') {
      // Don't send bot messages
      return;
    }


    var channel = context.slack.channels[payload.channel];
    if (channel) {
      context.irc.connection.say('#' + channel.name, payload.text);
      return;
    }
    var group = context.slack.groups[payload.channel];
    if (group) {
      context.irc.connection.say(group.name, payload.text);
      return;
    }

    console.log('Target not found for ' + payload.channel);
  }
};

function SlackHandler() {
};

SlackHandler.prototype.handle = function handle(context) {
  _.forEach(SLACK_EVENTS, function(handler, eventName) {
    var boundHandler = handler.bind(this, context);
    context.slack.events.removeAllListeners(eventName);
    context.slack.events.addListener(eventName, function() {
      try {
        boundHandler.apply(this, arguments);
      } catch(error) {
        console.error('Failed to handle Slack event ' + eventName + ': ' + error.message);
      }
    }.bind(this));
  }.bind(this));
};

module.exports = SlackHandler;
