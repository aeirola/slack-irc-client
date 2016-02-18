'use strict';

var expect = require('chai').expect;
var slackHandler = require('../lib/slack-handler');

describe('slack-handler', function() {
  var context;

  beforeEach(function() {
    context = require('./utils/context')();
  });

  it('should bind to events on initialize', function() {
    slackHandler.init(context);
    expect(context.slack.events.listeners('message').length).to.be.above(0);
  });
});
