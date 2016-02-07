'use strict';

var _ = require('lodash');
var packageJson = require('../package.json')

var NAME = packageJson.name;
var VERSION = NAME + ' v' + packageJson.version;
var BOT_NAME = 'status';

var HELPERS = {
  sendChannel: function sendChannel(context, channel, from, text) {
    channel = channel.toLowerCase();
    var channelId = _.get(context.slack.client.data.getChannelByName(channel.replace('#', '')), 'id', channel);
    var opts = {
      username: from,
      as_user: false
    };
    // TODO: Check membership
    context.slack.client.web.chat.postMessage(channelId, text, opts, function(err, data) {
      if (err) {
        context.logger.error('Slack: Could not send to channel', err);
      } else if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.channels.create(channel, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not create channel', err || data);
            } else {
              HELPERS.sendChannel(context, channel, from, text);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.channels.join(channelId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not join channel', err || data);
            } else {
              HELPERS.sendChannel(context, channelId, from, text);
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.channels.unarchive(channelId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not unarchive channel', err || data);
            } else {
              HELPERS.sendChannel(context, channelId, from, text);
            }
          });
        } else {
          context.logger.error('Slack: could not handle error', data.error);
        }
      } else {
        context.logger.silly('Slack: Successfully sent to channel', data);
      }
    });
  },

  sendGroup: function sendGroup(context, group, from, text) {
    group = group.toLowerCase();
    var groupId = _.get(context.slack.client.data.getGroupByName(group), 'id', group);
    var opts = {
      username: from,
      as_user: false
    };
    // TODO: Check membership
    context.slack.client.web.chat.postMessage(groupId, text, opts, function(err, data) {
      if (err) {
        context.logger.error('Slack: Could not send to group', err);
      } else if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.groups.create(group, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not create group', err || data);
            } else {
              HELPERS.sendGroup(context, group, from, text);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.groups.join(groupId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not join group', err || data);
            } else {
              HELPERS.sendGroup(context, groupId, from, text);
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.groups.unarchive(groupId, function(err, data) {
            if (err || !data.ok) {
              context.logger.error('Slack: could not unarchive group', err || data);
            } else {
              HELPERS.sendGroup(context, groupId, from, text);
            }
          });
        } else {
          context.logger.error('Slack: could not handle error', data.error);
        }
      } else {
        context.logger.silly('Slack: Successfully sent to group', data);
      }
    });
  },

  setTopic: function(context, channel, topic) {
    var channelId = _.get(context.slack.client.data.getChannelByName(channel.replace('#', '')), 'id', channel);
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
    if (_.startsWith(to, '#')) {
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
