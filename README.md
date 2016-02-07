Slack IRC client
================

Work in progress. Proceed with caution.



Features
--------

  * IRC channels mapped to public channels
    * Join channel in Slack to join it in IRC
    * Leave it to part
  * IRC queries mapped to private groups
    * Groups automatically created/joined/unarchived on new messages
  * IRC topic changes updated in Slack
  * Status messages sent to Slackbot windows
  * `/me` action messages
  * Configuration from Slack user
    * Nickname from username
    * Real name from real name
    * Configuration from "What I do" field
  * Zero downtime upgrades with code hot reload


Installation
------------

  1. Create new Slack team only for yourself
  2. Get API token from https://api.slack.com/web
  3. Install `slack-irc-client` from npm
  4. Start it with `slack-irc-client -t ${SLACK_API_TOKEN}`
  5. Chat from your Slack
