TODO
====
 - Relay messages from Slack
  - Channel join: Join IRC channel
  - Channel leave: Part IRC channel
    - Same for archive and delete
  - Channel send: Send message to IRC channel
    - Map emoticons to ASCII smileys
  - Channel topic change: Change IRC topic
    - Revert if unsuccessful?
  - Private group send: Send query message to channel name user
  - Nick change: Change irc nick
    - Revert if unsuccessful
 - Relay messages from IRC
  - Channel message: Send message to Slack channel
  - Channel topic: update slack topic
  - Query message: Create private group if needed, and send message there
 - Bot control
  - Controlled via messages to Slackbot
  - !reload: reload application code
  - !logs: send logs
  - !status: send app status
 - Resilient network connections
  - IRC ping timeout
  - Slack reconnect
  - Event queue with smart retry


Done
----
 - Authentication with user token
 - Irc settings from Slack team
  - Nick from token owner username
  - Real name from token owner real name
  - IRC server settings from slack team somewhere?
