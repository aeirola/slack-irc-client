'use strict';

var expect = require('chai').expect;
var hotReload = require('../lib/hot-reload');

describe('hot-reload', function() {
  it('should provide module reloading', function() {
    expect(hotReload).to.be.a('function');
  });
});
