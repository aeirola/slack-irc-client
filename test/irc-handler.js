'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var ircHandler = require('../lib/irc-handler');

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
    context.irc.client.chans['!PAJKLsecrecy'].users['ircer__'] = context.irc.client.chans['!PAJKLsecrecy']['ircer'];
    delete context.irc.client.chans['!PAJKLsecrecy'].users['ircer'];
    context.irc.events.emit('nick', 'ircer', 'ircer__', ['#activity', '!PAJKLsecrecy', '#emptyness'], {});

    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'activity',
      'ircer changed nick to ircer__'
    );
    expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
      'secrecy',
      'ircer changed nick to ircer__'
    );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });

  it('should notify of nick quit to nick channels', function() {
    delete context.irc.client.chans['#activity'].users['ircer'];
    delete context.irc.client.chans['!PAJKLsecrecy'].users['ircer'];
    context.irc.events.emit('quit', 'ircer', 'leaving', ['#activity', '!PAJKLsecrecy', '#emptyness'], {});

    // node-irc returns all channels, also the ones the user is not in
    // but only after removing the user from the channel
    // see https://github.com/martynsmith/node-irc/pull/376
    // expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
    //   'activity',
    //   'ircer quit: leaving'
    // );
    // expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
    //   'secrecy',
    //   'ircer quit: leaving'
    // );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });

  it('should notify of nick kill to nick channels', function() {
    delete context.irc.client.chans['#activity'].users['ircer'];
    context.irc.events.emit('kill', 'ircer', 'glined', ['#activity', '#emptyness'], {});

    // node-irc returns all channels, also the ones the user is not in
    // but only after removing the user from the channel
    // see https://github.com/martynsmith/node-irc/pull/376
    // expect(context.slack.client.web.chat.postMessage).to.have.been.calledWith(
    //   'activity',
    //   'ircer killed: glined'
    // );
    expect(context.slack.client.web.chat.postMessage).not.to.have.been.calledWith(
      'emptyness'
    );
  });
});
