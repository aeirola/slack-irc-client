'use strict';

var expect = require('chai').expect;
var terminalHandler = require('../lib/terminal-handler');
var EventEmitter = require('events');
var logger = require('./utils/logger');

describe('terminal-handler', function() {
  it('should bind to events on initialize', function() {
    var context = {
      terminal: {
        events: new EventEmitter()
      },
      logger: logger
    };
    terminalHandler.init(context);
    expect(context.terminal.events.listeners('help').length).to.be.above(0);
  });
});
