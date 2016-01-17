'use strict';

var EventEmitter = require('events');
var _ = require('lodash');

var slack = require('slack-client');
var slackDataStore = require('slack-client/lib/data-store');

function SlackListener() {
};

SlackListener.prototype.listen = function listen(context) {
  console.log('Connecting to Slack...');

  // Setup clients
  var dataStore = new slackDataStore.MemoryDataStore();
  var rtmClient = new slack.RtmClient(context.slack.token, {
    logLevel: 'debug',
    dataStore: dataStore
  });
  var webClient = new slack.WebClient(context.slack.token);

  // XXX: Fix self user data handling
  var oldCacheRtmStart = dataStore.cacheRtmStart.bind(dataStore);
  dataStore.cacheRtmStart = function(data) {
    oldCacheRtmStart(data);
    var models = require('slack-client/lib/models');
    dataStore.setUser(new models.User(_.find(data.users, {id: data.self.id})));
    dataStore.upsertUser(data.self);
  };

  // Add clients
  context.slack.client = {
    data: dataStore,
    rtm: rtmClient,
    web: webClient
  };
  context.slack.events = rtmClient;
  context.slack.handler.handle(context);

  // Start connection
  rtmClient.start();
};

module.exports = SlackListener;
