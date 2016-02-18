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
