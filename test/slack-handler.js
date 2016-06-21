'use strict';

var expect = require('chai').use(require('sinon-chai')).expect;
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

  it('should warn on invalid server configurations', function() {
    var SERVER_CONFIGURATION = '{"server: "example.com"}';
    context.slack.client.data.users[context.slack.client.rtm.activeUserId].profile.title = SERVER_CONFIGURATION;

    slackHandler.init(context);
    context.slack.events.emit('open');

    expect(context.logger.warn).to.have.been.calledWith('Failed to parse user config: %s');
  });

  it('should warn on invalid channel configurations', function() {
    var CHANNEL_CONFIGURATION = '{"name": !invalid-channel"}';
    context.slack.client.data.channels['0000000001'].purpose = {
      value: CHANNEL_CONFIGURATION
    };

    slackHandler.init(context);
    context.slack.events.emit('open');

    expect(context.logger.warn).to.have.been.calledWith('Failed to parse channel config: %s');
  });

  it('should ignore default channel configurations, without logging warnings', function() {
    var CHANNEL_CONFIGURATION = 'This channel is for team-wide communication and announcements. ' +
                                'All team members are in this channel. edit';
    context.slack.client.data.channels['0000000001'].purpose = {
      value: CHANNEL_CONFIGURATION
    };

    slackHandler.init(context);
    context.slack.events.emit('open');

    expect(context.logger.warn).to.have.callCount(0);
  });
});
