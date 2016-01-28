'use strict';

var _ = require('lodash');

var SLACK_EVENTS = {
  open: function started(context) {
    context.logger.info('Connected to Slack');

    // Prepare IRC connection
    var user = context.slack.client.data.getUserById(context.slack.client.rtm.activeUserId);
    var userConfig = JSON.parse(user.profile.title.replace(/[\u201C-\u201D]/g, '"'));
    var userChannels = _.chain(context.slack.client.data.channels)
                    .filter('isMember')
                    .map(function(channel) {
                      return '#' + channel.name;
                    }).valueOf();

    context.irc.options = {
      server: userConfig.server,
      port: userConfig.port || 6667,
      nick: user.name,
      realName: user.realName,
      channels: userChannels
    };

    context.irc.options = _.assign(context.irc.options, userConfig);
    context.irc.listener.listen(context);
  },
  message: function message(context, message) {
    context.logger.verbose('Saw new message on slack');

    var channel = context.slack.client.data.getChannelById(message.channel);
    var group = context.slack.client.data.getGroupById(message.channel);

    if (!message.subtype) {
      if (channel) {
        context.irc.client.say('#' + channel.name, message.text);
        return;
      }
      if (group) {
        context.irc.client.say(group.name, message.text);
        return;
      }

      context.logger.error('Target not found for ' + message.channel);

      return;
    } else if (message.subtype === 'me_message') {

    } else if (message.subtype === 'channel_topic') {

    } else if (message.subtype === 'file_share') {

    } else {
      // Skip rest of message types
      return;
    }
  }
};

function SlackHandler() {
};

SlackHandler.prototype.handle = function handle(context) {
  context.logger.verbose('Starting Slack handler');

  _.forEach(SLACK_EVENTS, function(handler, eventName) {
    var boundHandler = handler.bind(this, context);
    context.slack.events.removeAllListeners(eventName);
    context.slack.events.addListener(eventName, function() {
      try {
        boundHandler.apply(this, arguments);
      } catch(error) {
        context.logger.error('Failed to handle Slack event %s.', eventName, error);
      }
    }.bind(this));
  }.bind(this));
};

module.exports = SlackHandler;
