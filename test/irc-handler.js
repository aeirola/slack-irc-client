'use strict';

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var ircHandler = require('../lib/irc-handler');
var EventEmitter = require('events');

describe('irc-handler', function() {
  var context;

  beforeEach(function() {
    context = require('./utils/context')();
    ircHandler.init(context);
  });

  it('should bind to events on initialize', function() {
    expect(context.irc.events.listeners('message').length).to.be.above(0);
  });

  it('should include icon in Slack messages', function() {
    context.irc.events.emit('message', 'ircer', '#activity', 'hello', {});

    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'activity',
      'hello',
      sinon.match({
        'icon_url': sinon.match.string
      })
    );
  });

  it('should notify of nick change to nick channels', function() {
    context.irc.client.chans['#activity'].users['ircer__'] = context.irc.client.chans['#activity']['ircer'];
    delete context.irc.client.chans['#activity'].users['ircer'];
    context.irc.events.emit('nick', 'ircer', 'ircer__', ['#activity', '#emptyness'], {});

    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'activity',
      'ircer changed nick to ircer__'
    );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });

  it('should notify of nick quit to nick channels', function() {
    context.irc.events.emit('quit', 'ircer', 'leaving', ['#activity', '#emptyness'], {});

    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'activity',
      'ircer quit: leaving'
    );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });

  it('should notify of nick kill to nick channels', function() {
    context.irc.events.emit('kill', 'ircer', 'glined', ['#activity', '#emptyness'], {});

    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'activity',
      'ircer killed: glined'
    );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });
});
