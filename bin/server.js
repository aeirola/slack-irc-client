#!/usr/bin/env node
'use strict';

var argv = require('yargs')
.usage('Usage: slack-irc-client -t <slack-user-token>')
.options({
  't': {
    alias: 'token',
    demand: true,
    requiresArg: true,
    describe: 'Slack user token',
    type: 'string'
  },
  'v': {
    alias: 'verbose',
    describe: 'Verbose output',
    type: 'count'
  }
})
.version(function() {
  return require('../package.json').version;
})
.help('h')
.alias('h', 'help').argv;

var domain = require('domain');
var logger = require('../lib/logger.js');

var ircListener = require('../lib/irc-listener.js');
var ircHandler = require('../lib/irc-handler.js');

var slackListener = require('../lib/slack-listener.js');
var slackHandler = require('../lib/slack-handler.js');

var terminalListener = require('../lib/terminal-listener.js');
var terminalHandler = require('../lib/terminal-handler.js');

function start() {
  // Set logging level
  if (argv.verbose >= 3) {
    logger.level = 'silly';
  } else if (argv.verbose >= 2){
    logger.level = 'debug';
  } else if (argv.verbose >= 1){
    logger.level = 'verbose';
  } else {
    logger.level = 'info';
  }
  logger.info('Starting slack-irc-client');

  var context = {
    irc: {
      listener: ircListener,
      handler: ircHandler,
      client: null,
      events: null
    },
    slack: {
      token: argv.token,
      listener: slackListener,
      handler: slackHandler,
      client: null,
      events: null
    },
    terminal: {
      listener: terminalListener,
      handler: terminalHandler,
      events: null
    },
    logger: logger,
    domain: domain.create()
  };

  // Handle errors thrown in event emitters
  context.domain.on('error', function(error) {
    context.logger.error('Event listener failed.', error);
  });

  // Initialize listeners, IRC listener will be initialized from slack handler
  context.slack.listener.init(context);
  context.terminal.listener.init(context);
}

start();
