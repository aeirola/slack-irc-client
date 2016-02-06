'use strict';

var EventEmitter = require('events');
var _ = require('lodash');

var slack = require('slack-client');

module.exports = {
  init: function initSlackListener(context) {
    if (context.slack.events || context.slack.client) {
      context.logger.info('Slack listener already initialized, skipping.');
      return;
    }

    context.logger.verbose('Starting Slack listener');

    // Setup clients
    var dataStore = new slack.MemoryDataStore();
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

    context.slack.handler.init(context);

    // Start connection
    context.logger.info('Connecting to Slack...');
    rtmClient.start();
  },
  reload: function reloadSlackListener(context) {
    // Noop
  },
  close: function closeSlackListener(context) {
    context.logger.info('Disconnecting form Slack');
    if (!context.slack.client) {
      context.logger.warn('Cannot close Slack listener before starting it');
      return;
    }

    context.slack.client.rtm.disconnect();
    context.slack.client = null;

    context.slack.handler.close(context);
    context.domain.remove(context.slack.events);
    context.slack.events.removeAllListeners();
    context.slack.events = null;
  }
};
