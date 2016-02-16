'use strict';

var expect = require('chai').expect;
var slackHandler = require('../lib/slack-handler');
var EventEmitter = require('events');
var logger = require('./utils/logger');

describe('slack-handler', function() {
  it('should bind to events on initialize', function() {
    var context = {
      slack: {
        events: new EventEmitter()
      },
      logger: logger
    };
    slackHandler.init(context);
    expect(context.slack.events.listeners('message').length).to.be.above(0);
  });
});
