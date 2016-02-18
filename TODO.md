TODO
====

Features
--------

  - File upload
    - Create public link and send that on IRC
  - Client control
    - Controlled via messages to Slackbot
    - !reload: reload application code
    - !logs: send logs
    - !status: send app status
  - Resilient network connections
    - Event queue with smart retry


Bugs
----

  - Channel configuration not read on channel creation, only when joining existing channel
    - This makes it awkward to join special channels
    - This is due to Slack setting the channel purpose after joining the channel
    - Possible solution would be to wait for the channel purpose before joining the IRC channel


Tasks
-----

  - Write tests
    - Take inspiration form `ekmartin/slack-irc`
  - Write documentation
    - Installation
    - Usage
    - Etc
