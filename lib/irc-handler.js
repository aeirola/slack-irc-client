'use strict';

var _ = require('lodash');

var HELPERS = {
  sendChannel: function sendChannel(context, channel, text, opts, callback) {
    channel = _.lowerCase(channel);
    callback = callback || function() {};
    var channelId = _.get(context.slack.client.data.getChannelByName(channel), 'id', channel);
    context.slack.client.web.chat.postMessage(channelId, text, opts, function(err, data) {
      if (err) {
        callback(err, data);
        return;
      }
      if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.channels.create(channel, function(err) {
            if (err) {
              callback(new Error('channel_not_found:'+ data.error));
              return;
            } else {
              HELPERS.sendChannel(context, channel, text, opts, callback);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.channels.join(channelId, function(err) {
            if (err) {
              callback(new Error('not_in_channel:'+ data.error));
              return;
            } else {
              HELPERS.sendChannel(context, channelId, text, opts, callback);
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.channels.unarchive(channelId, function(err) {
            if (err) {
              callback(new Error('is_archived:'+ data.error));
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
    group = _.lowerCase(group);
    callback = callback || function() {};
    var groupId = _.get(context.slack.client.data.getGroupByName(group), 'id', group);
    context.slack.client.web.chat.postMessage(groupId, text, opts, function(err, data) {
      if (err) {
        callback(err, data);
        return;
      }
      if (!data.ok) {
        if (data.error === 'channel_not_found') {
          context.slack.client.web.groups.create(group, function(err) {
            if (err) {
              callback(new Error('channel_not_found:' + data.error));
              return;
            } else {
              return;
              HELPERS.sendGroup(context, group, text, opts, callback);
            }
          });
        } else if (data.error === 'not_in_channel') {
          context.slack.client.web.groups.join(groupId, function(err) {
            if (err) {
              callback(new Error('not_in_channel:' + data.error));
              return;
            } else {
              HELPERS.sendGroup(context, groupId, text, opts, callback);
              return;
            }
          });
        } else if (data.error === 'is_archived') {
          context.slack.client.web.groups.unarchive(groupId, function(err) {
            if (err) {
              callback(new Error('is_archived:' + data.error));
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
  }
};

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
      HELPERS.sendChannel(context, to, text, {
        username: nick,
        as_user: false
      }, console.log.bind(null, 'channels.send'));
    } else {
      HELPERS.sendGroup(context, nick, text, {
        username: nick,
        as_user: false
      }, console.log.bind(null, 'groups.send'));
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
