'use strict';

var _ = require('lodash');
var packageJson = require('../package.json')

var NAME = packageJson.name;
var VERSION = NAME + ' v' + packageJson.version;

var HELPERS = {
  sendChannel: function sendChannel(context, channel, text, opts, callback) {
    callback = callback || function() {};
    var channelId = _.get(context.slack.client.data.getChannelByName(channel.replace('#', '')), 'id', channel);
    context.slack.client.web.chat.postMessage(channelId, text, opts, function(err, data) {
      if (err) {
        callback(err, data);
        return;
      }
      if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.channels.create(channel, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('channel_not_found:'+ err || data.error));
              return;
            } else {
              HELPERS.sendChannel(context, channel, text, opts, callback);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.channels.join(channelId, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('not_in_channel:'+ err || data.error));
              return;
            } else {
              HELPERS.sendChannel(context, channelId, text, opts, callback);
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.channels.unarchive(channelId, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('is_archived:'+ err || data.error));
              return;
            } else {
              HELPERS.sendChannel(context, channelId, text, opts, callback);
            }
          });
        } else {
          callback(err, data);
          return;
        }
      } else {
        callback(err, data);
        return;
      }
    });
  },

  sendGroup: function sendGroup(context, group, text, opts, callback) {
    group = group.toLowerCase();
    callback = callback || function() {};
    var groupId = _.get(context.slack.client.data.getGroupByName(group), 'id', group);
    context.slack.client.web.chat.postMessage(groupId, text, opts, function(err, data) {
      if (err) {
        callback(err, data);
        return;
      }
      if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.groups.create(group, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('channel_not_found:' + err || data.error));
              return;
            } else {
              return;
              HELPERS.sendGroup(context, group, text, opts, callback);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.groups.join(groupId, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('not_in_channel:' + err || data.error));
              return;
            } else {
              HELPERS.sendGroup(context, groupId, text, opts, callback);
              return;
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.groups.unarchive(groupId, function(err, data) {
            if (err || !data.ok) {
              callback(new Error('is_archived:' + err || data.error));
              return;
            } else {
              HELPERS.sendGroup(context, groupId, text, opts, callback);
              return;
            }
          });
        } else {
          callback(err, data);
          return;
        }
      } else {
        callback(err, data);
        return;
      }
    });
  },

  sendUser: function(context, text) {
    var user = context.slack.client.data.getUserById(context.slack.client.rtm.activeUserId);
    var to = '@' + user.name;
    var opts = {
      username: NAME,
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
    context.logger.info('Successfully connected to IRC', message);
  },
  motd: function motd(context, motd) {
    // TODO: Show message of the day in console and send to slack user
    context.logger.verbose('IRC: MOTD', motd);
    HELPERS.sendUser(context, 'MOTD: ' + motd);
  },
  names: function names(context, channel, nicks) {
    // TODO: Send nicks to slack channel
  },
  topic: function topic(context, channel, topic, nick, message) {
    // TODO: Change topic in slack
    context.logger.verbose('Saw topic change on IRC');
  },
  join: function join(context, channel, nick, message) {
    // TODO: Show join messages in slack channel
  },
  part: function part(context, channel, nick, reason, message) {
    // TODO: Show part messages in slack channel
  },
  quit: function quit(context, nick, reason, channels, message) {
    // TODO: Show quit messages in slack channels
  },
  kick: function kick(context, channel, nick, by, reason, message) {
    // TODO: Show kick messages in slack channels
  },
  kill: function kill(context, nick, reason, channels, message) {
    // TODO: Show kill messages in slack channels
  },
  message: function message(context, nick, to, text, message) {
    context.logger.verbose('Saw new message on IRC', nick, to, text, message);
    if (_.startsWith(to, '#')) {
      HELPERS.sendChannel(context, to, text, {
        username: nick,
        as_user: false
      }, context.logger.info.bind(null, 'channels.send'));
    } else {
      HELPERS.sendGroup(context, nick, text, {
        username: nick,
        as_user: false
      }, context.logger.info.bind(null, 'groups.send'));
    }
  },
  notice: function notice(context, nick, to, text, message) {
    // TODO: Send notice to slack user
    context.logger.verbose('IRC: Saw new notice on IRC');
  },
  ctcp: function ctcp(context, from, to, message) {
    // TODO: Show CTCP data to slack user
    HELPERS.sendUser(context, 'CTCP message from ' + from);
  },
  'ctcp-version': function ctcpVersion(context, from, to, message) {
    context.logger.verbose('IRC: Received CTCP VERSION from %s', from);
    context.irc.client.ctcp(from, 'notice', 'VERSION ' + VERSION);
  },
  nick: function nick(context, oldnick, newnick, channels, message) {
    // TODO: Send nick change to slack channels
  },
  invite: function invite(context, channel, from, message) {
    HELPERS.sendUser(context, 'Channel invite to ' + channel + ' from ' + from);
    // TODO: Follow invite
  },
  action: function action(context, from, to, text, message) {
    // TODO: Send action to slack channel
    context.logger.verbose('IRC: Saw new action on IRC');
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
