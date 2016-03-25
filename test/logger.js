'use strict';

var expect = require('chai').expect;
var logger = require('../lib/logger');

describe('logger', function() {
  it('should provide logging functions', function() {
    expect(logger).to.respondTo('silly');
    expect(logger).to.respondTo('debug');
    expect(logger).to.respondTo('verbose');
    expect(logger).to.respondTo('info');
    expect(logger).to.respondTo('warn');
    expect(logger).to.respondTo('error');
  });
});
