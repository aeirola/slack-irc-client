'use strict';
var winston = require('winston');
var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');

module.exports = function() {
  var context = {
    irc: {
      listener: {
        init: sinon.stub()
      },
      handler: {},
      client: {
        chans: {
          '#activity': {
            users: {
              'ircer': {},
              'slacker': {},
            },
          },
          '!PAJKLsecrecy': {
            users: {
              'ircer': {},
              'slacker': {},
            },
          },
          '#emptyness': {
            users: {},
          },
        },
      },
      events: new EventEmitter(),
    },
    slack: {
      token: '',
      listener: {
        init: sinon.stub()
      },
      handler: {},
      client: {
        data: {
          channels: {
            '0000000001': {
              name: 'activity',
              is_member: true
            },
            '0000000002': {
              name: 'secrecy',
              purpose: {
                value: JSON.stringify({
                  channelName: '!PAJKLsecrecy'
                })
              },
              is_member: true
            },
            '0000000003': {
              name: 'emptyness',
            },
          },
          teams: {
            'T00000001': {
              name: 'Testing team'
            }
          },
          users: {
            'U00000001': {
              name: 'Testing user',
              profile: {
                title: ''
              }
            }
          },
          getGroupByName: sinon.stub(),
          getChannelByName: sinon.stub(),
          getTeamById: sinon.spy(function getTeamById(teamId) {
            return context.slack.client.data.teams[teamId];
          }),
          getUserById: sinon.spy(function getUserById(userId) {
            return context.slack.client.data.users[userId];
          })
        },
        rtm: {
          activeTeamId: 'T00000001',
          activeUserId: 'U00000001'
        },
        web: {
          chat: {
            postMessage: sinon.stub(),
          },
          channels: {
            create: sinon.stub(),
            join: sinon.stub(),
            unarchive: sinon.stub(),
          },
          groups: {
            create: sinon.stub(),
            join: sinon.stub(),
            unarchive: sinon.stub(),
          },
        }
      },
      events: new EventEmitter()
    },
    terminal: {
      listener: {},
      handler: {},
      events: new EventEmitter()
    },
    logger: new winston.Logger({
      level: 'error',
      transports: [
        new (winston.transports.Console)()
      ]
    })
  };

  sinon.spy(context.logger, 'debug');
  sinon.spy(context.logger, 'verbose');
  sinon.spy(context.logger, 'info');
  sinon.spy(context.logger, 'warn');
  sinon.spy(context.logger, 'error');

  return context;
};
