TODO
====

  - File upload
    - Create public link and send that on IRC
  - Client control
    - Controlled via messages to Slackbot
    - !reload: reload application code
    - !logs: send logs
    - !status: send app status
  - Resilient network connections
    - IRC ping timeout
      - Wait for [martynsmith/node-irc#418](https://github.com/martynsmith/node-irc/pull/418) to be merged
    - Event queue with smart retry
