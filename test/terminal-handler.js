'use strict';

var expect = require('chai').expect;
var terminalHandler = require('../lib/terminal-handler');

describe('terminal-handler', function() {
  var context;

  beforeEach(function() {
    context = require('./utils/context')();
  });

  it('should bind to events on initialize', function() {
    terminalHandler.init(context);
    expect(context.terminal.events.listeners('help').length).to.be.above(0);
  });
});
