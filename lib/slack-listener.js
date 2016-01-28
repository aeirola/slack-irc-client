'use strict';

var EventEmitter = require('events');
var _ = require('lodash');

var slack = require('slack-client');
var slackDataStore = require('slack-client/lib/data-store');

function SlackListener() {
};

SlackListener.prototype.listen = function listen(context) {
  context.logger.verbose('Starting Slack listener');

  // Setup clients
  var dataStore = new slackDataStore.MemoryDataStore();
  var rtmClient = new slack.RtmClient(context.slack.token, {
    logger: context.logger,
    dataStore: dataStore
  });
  var webClient = new slack.WebClient(context.slack.token);

  // Add clients
  context.slack.client = {
    data: dataStore,
    rtm: rtmClient,
    web: webClient
  };
  context.slack.events = rtmClient;
  context.domain.add(context.slack.events);

  context.slack.handler.handle(context);

  // Start connection
  context.logger.info('Connecting to Slack...');
  rtmClient.start();
};

module.exports = SlackListener;
