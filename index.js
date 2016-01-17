#!/usr/bin/env node
'use strict';

var argv = require('yargs').argv;

var IrcListener = require('./lib/irc-listener.js');
var IrcHandler = require('./lib/irc-handler.js');

var SlackListener = require('./lib/slack-listener.js');
var SlackHandler = require('./lib/slack-handler.js');

var TerminalListener = require('./lib/terminal-listener.js');
var TerminalHandler = require('./lib/terminal-handler.js');

function start() {
  var token = argv.token || argv.t;
  if (!token) {
    console.error('No Slack token specified!');
    console.error('Please specify a token with -t or --token');
    return 1;
  }

  console.log('Starting slack-irc-client');

  var context = {
    irc: {
      listener: new IrcListener(),
      handler: new IrcHandler(),
      client: null,
      events: null
    },
    slack: {
      token: token,
      listener: new SlackListener(),
      handler: new SlackHandler(),
      client: null,
      events: null
    },
    terminal: {
      listener: new TerminalListener(),
      handler: new TerminalHandler(),
      events: null
    }
  };

  // Initialize listeners, IRC listener will be initialized from slack handler
  context.slack.listener.listen(context);
  context.terminal.listener.listen(context);
}

start();
