'use strict';

var _ = require('lodash');
var packageJson = require('../package.json')

var NAME = packageJson.name;
var VERSION = NAME + ' v' + packageJson.version;
var BOT_NAME = 'status';

var HELPERS = {
  isIrcChannel: function isIrcChannel(context, ircChannelName) {
    return ircChannelName.match(/^&|#|\+|!/);
  },
  getSlackChannelName: function getSlackChannelName(context, ircChannelName) {
    // TODO: Store channel mapping?
    var slackChannel = _.find(context.slack.client.data.channels, function(slackChannel) {
      // TODO: Better config reading
      if (_.get(slackChannel, 'purpose.value', '').indexOf(ircChannelName) > -1) {
        return true;
      }
    });

    if (slackChannel) {
      return slackChannel.name;
    } else {
      // Remove leading channel chars (https://tools.ietf.org/html/rfc2812#section-1.3)
      ircChannelName = ircChannelName.replace(/^&|#|\+|!/, '');
      return ircChannelName.toLowerCase().replace('#', '');
    }
  },
  sendTarget: function sendTarget(context, target, targetName, from, text, targetType) {
    var targetId = _.get(target, 'id', targetName);
    var opts = {
      username: from,
      as_user: false
    };

    context.slack.client.web.chat.postMessage(targetId, text, opts, function(err, data) {
      if (err) {
        context.logger.error('Slack: Could not send to ' + targetType.name, err);
      } else if (!data.ok) {
        if (data.error === 'channel_not_found') {
          targetType.client.create(targetName, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not create ' + targetType.name, err || data);
            } else {
              HELPERS.sendTarget(context, target, targetName, from, text, targetType);
            }
          });
        } else if (data.error === 'not_in_channel') {
          targetType.client.join(targetId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not join ' + targetType.name, err || data);
            } else {
              HELPERS.sendTarget(context, target, targetName, from, text, targetType);
            }
          });
        } else if (data.error === 'is_archived') {
          targetType.client.unarchive(targetId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not unarchive ' + targetType.name, err || data);
            } else {
              HELPERS.sendTarget(context, target, targetName, from, text, targetType);
            }
          });
        } else {
          context.logger.error('Slack: could not handle error', data.error);
        }
      } else {
        context.logger.silly('Slack: Successfully sent to ' + targetType.name, data);
      }
    });
  },
  sendChannel: function sendChannel(context, channelName, from, text) {
    channelName = HELPERS.getSlackChannelName(context, channelName);
    var channel = context.slack.client.data.getChannelByName(channelName);
    return HELPERS.sendTarget(context, channel, channelName, from, text, {
      name: 'channel',
      client: context.slack.client.web.channels
    });
  },

  sendGroup: function sendGroup(context, groupName, from, text) {
    groupName = groupName.toLowerCase();
    var group = context.slack.client.data.getGroupByName(groupName);
    return HELPERS.sendTarget(context, group, groupName, from, text, {
      name: 'group',
      client: context.slack.client.web.groups
    });
  },

  setTopic: function(context, channelName, topic) {
    channelName = HELPERS.getSlackChannelName(context, channelName);
    var channelId = _.get(context.slack.client.data.getChannelByName(channelName), 'id', channelName);
    context.slack.client.web.channels.setTopic(channelId, topic, function(err, data) {
      if (err) {
        context.logger.error('Slack: Could not update topic', err);
      } else {
        context.logger.silly('Slack: Successfully set topic', data);
      }
    });
  },

  sendUser: function(context, text) {
    var user = context.slack.client.data.getUserById(context.slack.client.rtm.activeUserId);
    var to = '@' + user.name;
    var opts = {
      username: BOT_NAME,
      as_user: false
    };
    context.slack.client.web.chat.postMessage(to, text, opts, function(err, data) {
      if (err) {
        context.logger.error('Failed to send bot message to user. ', err);
      } else {
        context.logger.silly('Successfully sent bot message to user', data);
      }
    });
  }
};

// IRC events documented at http://node-irc.readthedocs.org/en/latest/API.html#events
var IRC_EVENTS = {
  registered: function registered(context, message) {
    context.logger.info('Successfully connected to IRC');
  },
  motd: function motd(context, motd) {
    context.logger.verbose('IRC: MOTD', motd);
    HELPERS.sendUser(context, 'MOTD: ' + motd);
  },
  names: function names(context, channel, nicks) {
    var nickNames = Object.keys(nicks).join(', ');
    context.logger.verbose('IRC: Channel names for %s: %s', channel, nickNames);
    HELPERS.sendChannel(context, channel, BOT_NAME, 'members: ' + nickNames);
  },
  topic: function topic(context, channel, topic, nick, message) {
    if (nick === context.irc.client.nick) {
      // Don't set topic if originating from self
      return;
    }
    context.logger.verbose('IRC: Topic set for %s by %s to %s', channel, nick, topic);
    HELPERS.setTopic(context, channel, topic);
  },
  join: function join(context, channel, nick, message) {
    context.logger.verbose('IRC: %s joined %s', nick, channel);
    HELPERS.sendChannel(context, channel, BOT_NAME, nick + ' joined');
  },
  part: function part(context, channel, nick, reason, message) {
    context.logger.verbose('IRC: %s left %s: %s', nick, channel, reason);
    HELPERS.sendChannel(context, channel, BOT_NAME, nick + ' left: ' + reason);
  },
  quit: function quit(context, nick, reason, channels, message) {
    context.logger.verbose('IRC: %s quit: %s', nick, reason);
    _.forEach(channels, function(channel) {
      HELPERS.sendChannel(context, channel, BOT_NAME, nick + ' quit: ' + reason);
    });
  },
  kick: function kick(context, channel, nick, by, reason, message) {
    context.logger.verbose('IRC: %s was kicked from %s: %s', nick, channel, reason);
    HELPERS.sendChannel(context, channel, BOT_NAME, nick + ' kicked by ' + by + ': ' + reason);
  },
  kill: function kill(context, nick, reason, channels, message) {
    context.logger.verbose('IRC: %s was killed: %s', nick, reason);
    _.forEach(channels, function(channel) {
      HELPERS.sendChannel(context, channel, BOT_NAME, nick + ' killed: ' + reason);
    });
  },
  message: function message(context, nick, to, text, message) {
    context.logger.verbose('IRC: New message from %s to %s: %s', nick, to, text);
    if (HELPERS.isIrcChannel(context, to)) {
      HELPERS.sendChannel(context, to, nick, text);
    } else {
      HELPERS.sendGroup(context, nick, nick, text);
    }
  },
  notice: function notice(context, nick, to, text, message) {
    context.logger.verbose('IRC: New notice from %s: %s', nick, text);
    HELPERS.sendUser(context, 'Notice from ' + nick + ': ' + text);
  },
  'ctcp-notice': function ctcpVersion(context, from, to, text, message) {
    context.logger.verbose('IRC: Received CTCP notice from %s', from, text);
    HELPERS.sendUser(context, 'CTCP notice from ' + from + ': ' + text);
  },
  'ctcp-privmsg': function ctcpVersion(context, from, to, text, message) {
    context.logger.verbose('IRC: Received CTCP privmsg from %s', from, text);
    HELPERS.sendUser(context, 'CTCP notice from ' + from + ': ' + text);
  },
  'ctcp-version': function ctcpVersion(context, from, to, message) {
    context.logger.verbose('IRC: Received CTCP VERSION from %s', from);
    context.irc.client.ctcp(from, 'notice', 'VERSION ' + VERSION);
  },
  nick: function nick(context, oldnick, newnick, channels, message) {
    context.logger.verbose('IRC: %s changed nick to %s', oldnick, newnick);
    _.forEach(channels, function(channel) {
      HELPERS.sendChannel(context, channel, BOT_NAME, oldnick + ' changed nick to ' + newnick);
    });
  },
  invite: function invite(context, channel, from, message) {
    HELPERS.sendUser(context, 'Channel invite to ' + channel + ' from ' + from);
  },
  action: function action(context, from, to, text, message) {
    context.logger.verbose('IRC: New action from %s to %s: %s', from, to, text);
    text = '_' + text + '_';
    if (_.startsWith(to, '#')) {
      HELPERS.sendChannel(context, to, from, text);
    } else {
      HELPERS.sendGroup(context, from, from, text);
    }
  },
  raw: function raw(context, message) {
    context.logger.debug('IRC: Raw message: ', message);
  },
  error: function error(context, message) {
    context.logger.error('IRC: Connection error: ', message);
  }
};

module.exports = {
  init: function initIrcHandler(context) {
    context.logger.verbose('Binding IRC event handler');
    if (!context.irc.events) {
      context.logger.error('Cannot bind IRC event handler before IRC event listener');
      return;
    }

    _.forEach(IRC_EVENTS, function(handler, eventName) {
      var boundHandler = handler.bind(null, context);
      handler._boundListener = function() {
        try {
          boundHandler.apply(null, arguments);
        } catch(error) {
          context.logger.error('Failed to handle IRC event %s', eventName, error);
        }
      };
      context.irc.events.addListener(eventName, handler._boundListener);
    });
  },
  reload: function reloadIrcHandler(context) {
    context.logger.info('Reloading IRC event handler');

    context.irc.handler.close(context);
    context.irc.handler = module.exports;
    context.irc.handler.init(context);
  },
  close: function closeIrcHandler(context) {
    context.logger.verbose('Unbinding IRC event handler.');

    if (context.irc.events) {
      _.forEach(IRC_EVENTS, function(handler, eventName) {
        context.irc.events.removeListener(eventName, handler._boundListener);
      });
    }
  }
};
