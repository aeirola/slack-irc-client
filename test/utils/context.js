'use strict';
var winston = require('winston');
var EventEmitter = require('events');
var sinon = require('sinon');

module.exports = function() {
  return {
    irc: {
      listener: {},
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
      listener: {},
      handler: {},
      client: {
        data: {
          channels: {
            '0000000001': {
              name: 'activity',
            },
            '0000000002': {
              name: 'secrecy',
              purpose: {
                value: JSON.stringify({
                  channelName: '!PAJKLsecrecy'
                })
              }
            },
            '0000000003': {
              name: 'emptyness',
            },
          },
          getGroupByName: sinon.stub(),
          getChannelByName: sinon.stub(),
        },
        rtm: {},
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
};
