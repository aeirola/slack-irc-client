'use strict';

var _ = require('lodash');

// Slack events documented at https://api.slack.com/rtm#events
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
    context.irc.listener.init(context);
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
  },
  channel_joined: function channelJoined(context, message) {
    // TODO: Join channel
  },
  channel_left: function channelLeft(context, message) {
    // TODO: Part channel
  },
  dnd_updated: function dndUpdated(context, message) {
    // TODO: Set IRC away status
  },
  pref_change: function prefChange(context, message) {
    // TODO: Update irc options
  }
};

module.exports = {
  init: function initSlackHandler(context) {
    context.logger.verbose('Binding Slack event handler');
    if (!context.slack.events) {
      context.logger.error('Cannot bind Slack event handler before Slack event listener');
      return;
    }

    _.forEach(SLACK_EVENTS, function(handler, eventName) {
      var boundHandler = handler.bind(null, context);
      handler._boundListener = function() {
        try {
          boundHandler.apply(null, arguments);
        } catch(error) {
          context.logger.error('Failed to handle Slack event %s.', eventName, error);
        }
      };
      context.slack.events.addListener(eventName, handler._boundListener);
    });
  },
  reload: function reloadSlackHandler(context) {
    context.logger.info('Reloading Slack event handler');

    context.slack.handler.close(context);
    context.slack.handler = module.exports;
    context.slack.handler.init(context);
  },
  close: function closeSlackHandler(context) {
    context.logger.verbose('Unbinding Slack event handler.');

    if (context.slack.events) {
      _.forEach(SLACK_EVENTS, function(handler, eventName) {
        context.slack.events.removeListener(eventName, handler._boundListener);
      });
    }
  }
};
