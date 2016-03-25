'use strict';

var expect = require('chai').expect;
var path = require('path');
var execFile = require('child_process').execFile;

var execPath = path.join(__dirname, '..', 'bin', 'server.js');

describe('server', function() {
  it('should provide help', function(done) {
    var child = execFile(execPath, ['--help'], function(error, stdout, stderr) {
      if (error) {
        throw error;
      }
      expect(child.exitCode).to.equal(0);
      expect(stdout).to.match(/Usage/);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should provide version', function(done) {
    var child = execFile(execPath, ['--version'], function(error, stdout, stderr) {
      if (error) {
        throw error;
      }
      expect(child.exitCode).to.equal(0);
      expect(stdout).to.match(/^[0-9]+\.[0-9]+\.[0-9]+\n$/);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should require token', function(done) {
    var child = execFile(execPath, [], function(error, stdout, stderr) {
      expect(error.code).to.equal(1);
      expect(child.exitCode).to.equal(1);
      expect(stdout).to.equal('');
      expect(stderr).to.match(/Missing required argument/);
      done();
    });
  });
});
