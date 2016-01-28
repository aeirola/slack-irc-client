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
  return require('./package.json').version;
})
.help('h')
.alias('h', 'help').argv;

var domain = require('domain');
var logger = require('../lib/logger.js');

var IrcListener = require('../lib/irc-listener.js');
var IrcHandler = require('../lib/irc-handler.js');

var SlackListener = require('../lib/slack-listener.js');
var SlackHandler = require('../lib/slack-handler.js');

var TerminalListener = require('../lib/terminal-listener.js');
var TerminalHandler = require('../lib/terminal-handler.js');

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
      listener: new IrcListener(),
      handler: new IrcHandler(),
      client: null,
      events: null
    },
    slack: {
      token: argv.token,
      listener: new SlackListener(),
      handler: new SlackHandler(),
      client: null,
      events: null
    },
    terminal: {
      listener: new TerminalListener(),
      handler: new TerminalHandler(),
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
  context.slack.listener.listen(context);
  context.terminal.listener.listen(context);
}

start();
