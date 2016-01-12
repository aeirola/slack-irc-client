'use strict';
/*
  Extends the slack library with higher level functions for ease of use:

   - slack.channels.send: Send to channel. Join / create / unarchive if needed
   - slack.groups.send: Send to group. Join / create / unarchive if needed

  TODO:
   - Add rate limit and retry
*/

var slack = require('slack');

// Fix broken slack lib stuff
slack.channels.create = require('slack/methods/channels.create');
slack.channels.join = require('slack/methods/channels.join');
slack.channels.list = require('slack/methods/channels.list');
slack.channels.unarchive = require('slack/methods/channels.unarchive');

slack.channels.send = function channelssend(params, callback) {
  callback = callback || function() {};
  slack.chat.postMessage(params, function(err, data) {
    if (err) {
      if (err.message === 'channel_not_found') {
        slack.channels.create({
          token: params.token,
          name: params.channel
        }, function(err) {
          if (err) {
            callback(new Error('channel_not_found:'+ err.message));
            return;
          } else {
            slack.channels.send(params);
          }
        });
      } else if (err.message === 'not_in_channel') {
        slack.channels.join({
          token: params.token,
          name: params.channel
        }, function(err) {
          if (err) {
            callback(new Error('not_in_channel:'+ err.message));
            return;
          } else {
            slack.channels.send(params);
          }
        });
      } else if (err.message === 'is_archived') {
        slack.channels.list({token: params.token}, function(err, data) {
          if (err) {
            callback(new Error('is_archived:'+ err.message));
            return;
          } else {
            var channel = data.channels.find(function(channel) {
              return channel.name === params.channel.replace('#', '');
            });

            if (!channel) {
              callback(new Error('is_archived:channel_not_found'));
              return;
            }

            slack.channels.unarchive({
              token: params.token,
              channel: channel.id
            }, function(err) {
              if (err) {
                callback(new Error('is_archived:'+ err.message));
                return;
              } else {
                slack.channels.send(params);
              }
            });
          }
        });
      } else {
        callback(err);
        return;
      }
    } else {
      callback(null, data);
      return;
    }
  });
};

slack.groups.send = function groupssend(params, callback) {
  callback = callback || function() {};
  slack.chat.postMessage(params, function(err, data) {
    if (err) {
      if (err.message === 'channel_not_found') {
        slack.groups.create({
          token: params.token,
          name: params.channel
        }, function(err) {
          if (err) {
            callback(new Error('channel_not_found:' + err.message));
            return;
          } else {
            slack.groups.send(params);
          }
        });
      } else if (err.message === 'not_in_channel') {
        slack.groups.join({
          token: params.token,
          name: params.channel
        }, function(err) {
          if (err) {
            callback(new Error('not_in_channel:' + err.message));
            return;
          } else {
            slack.groups.send(params);
          }
        });
      } else if (err.message === 'is_archived') {
        slack.groups.list({token: params.token}, function(err, data) {
          if (err) {
            callback(new Error('is_archived:' + err.message));
            return;
          } else {
            var group = data.groups.find(function(group) {
              return group.name === params.channel;
            });

            if (!group) {
              callback(new Error('is_archived:channel_not_found'));
              return;
            }

            slack.groups.unarchive({
              token: params.token,
              channel: group.id
            }, function(err) {
              if (err) {
                callback(new Error('is_archived:' + err.message));
                return;
              } else {
                slack.groups.send(params);
              }
            });
          }
        });
      } else {
        callback(err);
        return;
      }
    } else {
      callback(null, data);
      return;
    }
  });
};

module.exports = slack;
