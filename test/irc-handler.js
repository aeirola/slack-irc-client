'use strict';

var expect = require('chai').expect;
var ircHandler = require('../lib/irc-handler');
var EventEmitter = require('events');
var logger = require('./utils/logger');

describe('irc-handler', function() {
  it('should bind to events on initialize', function() {
    var context = {
      irc: {
        events: new EventEmitter()
      },
      logger: logger
    };
    ircHandler.init(context);
    expect(context.irc.events.listeners('message').length).to.be.above(0);
  });
});
