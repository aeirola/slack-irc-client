#!/usr/bin/env node
const express = require('express');
const uuid = require('node-uuid');
const app = express();

// Say hello
console.log('Starting token server');

// Check settings
if (!(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.SLACK_SCOPES)) {
  console.error('SLACK_CLIENT_ID, SLACK_CLIENT_SECRET and SLACK_SCOPES needs to be defined');
  process.exit(1);
}

// Store settings
const PORT = process.env.PORT || 3000;
const SLACK_SCOPES = process.env.SLACK_SCOPES;

// Set the client credentials and the OAuth2 server
const credentials = {
  clientID: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  site: 'https://slack.com/',
  authorizationPath: 'oauth/authorize',
  tokenPath: 'api/oauth.access'
};

// Initialize the OAuth2 Library
const oauth2 = require('simple-oauth2')(credentials);

// Store for active states
const states = {};

// Define authentication endpoint
app.get('/auth', function (req, res) {
  console.log('New authentication request');

  if (!req.query.callback) {
    console.error('No callback defined');
    res.status(400).end();
    return;
  }

  // Generate new state
  const stateUuid = uuid.v4();
  states[stateUuid] = {
    callbackUri: req.query.callback
  };

  const authorizationUri = oauth2.authCode.authorizeURL({
    redirect_uri: `${req.protocol}://${req.headers.host}/callback`,
    scope: SLACK_SCOPES,
    state: stateUuid
  });

  res.redirect(authorizationUri);
});

// Define callback endpoint
app.get('/callback', function(req, res) {
  console.log('Authentication code generated');

  // Get response
  const code = req.query.code;
  const stateUuid = req.query.state;

  // Check state
  const stateData = states[stateUuid];
  if (stateData) {
    delete states[stateUuid];
  } else {
    console.error('Invalid state returned');
    res.status(401).end();
    return;
  }
  const callbackUri = stateData.callbackUri;

  // Get the access token object
  const tokenConfig = {
    code: code,
    redirect_uri: `${req.protocol}://${req.headers.host}/callback`,
  };

  // Get the access token
  oauth2.authCode.getToken(tokenConfig, function saveToken(error, result) {
    // Check callback error
    if (error) {
      console.error('Access Token Error:', error.message);
      res.redirect(`callbackUri?error=${error.message}`);
      return;
    }

    // Check response data
    if (!result.ok) {
      console.error('Access Token Error:', result.error);
      res.redirect(`callbackUri?error=${result.error}`);
      return;
    }

    console.log('Access token fetched');

    // Send response
    const token = oauth2.accessToken.create(result);
    res.redirect(`callbackUri?token=${token.token.access_token}`);
  });
});

app.listen(PORT, function () {
  console.log(`Token server listening on port ${PORT}!`);
});
