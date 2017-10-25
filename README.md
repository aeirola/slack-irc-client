Slack IRC client
================

[![Build Status](https://travis-ci.org/aeirola/slack-irc-client.svg?branch=master)](https://travis-ci.org/aeirola/slack-irc-client)
[![NPM Version](https://img.shields.io/npm/v/slack-irc-client.svg)](https://www.npmjs.com/package/slack-irc-client)

*Work in progress. Proceed with caution. Testers and contributions are welcome.*

Slack IRC client is a node.js application that acts as an IRC client as well as a Slack client, bridging communication between the two networks for a single user.

It differs from the splendid [ekmartin/slack-irc](https://github.com/ekmartin/slack-irc) gateway in that instead of syncing messages for all users on a single channel, slack-irc-client syncs all messages for a single user on all channels.




Features
--------

*  Chat on any IRC channel form your favorite Slack client
*  Send and receive IRC queries
*  Channel topics are synced both ways
*  Status messages delivered to Slackbot DM chat
*  Configured through Slack user and channel metadata




Instructions
------------

### Installation

1.  Create new Slack team at https://slack.com/create

    -  **Don't invite anyone else to the team**
    -  Adding multiple users *will* lead to duplicate messages being sent to IRC

2.  Remove the default channels, create and join the Slack channels you want to join in IRC
3.  Set configuration in your user profile "What I do field" at https://slack.com/account/profile

    -  JSON formatted string with the following fields
        -  `server`: IRC server to connect to
        -  `port`: Port to connect to (defaults to 6668)
    -  All fields will be passed to [`node-irc`](http://node-irc.readthedocs.org/en/latest/API.html#irc.Client)
    -  For example:

        ```json
        {
          "server": "open.ircnet.net",
          "port": 6668,
          "userName": "aeirola"
        }
        ```
    -   Optionally, a string field `nsPassword` will cause the bot to send 
          `/msg Nickserv IDENTIFY ${nsPassword}` after 5 seconds of being 
          connected which is the correct format for freenode's nickserv. 
          Other nickservs may not like this format, but it's a start.

4.  Generate a Test token for your newly created team at http://aeirola.github.io/slack-irc-client/
5.  Install `slack-irc-client` from npm

    ```bash
    npm install -g slack-irc-client
    ```

6.  Start the gateway with

    ```bash
    slack-irc-client -t ${SLACK_API_TOKEN}
    ```

7.  Chat from your Slack!



### Upgrade

1.  Update the npm package:

    ```bash
    npm update -g slack-irc-client
    ```

2.  Reload the code by entering the command `reload` in the terminal running the application



### Usage

Once everything is set up, normal usage of IRC through Slack should be pretty straightforward chatting. Messages are sent and received, topics are synced and so forth. Here are some special cases that might need additional instructions though.


#### Joining channels

Normal channels with names that adhere to Slacks channel naming convention (max 21 chars, alphanumerics underscore or dash) can be joined by just creating the channel in Slack. Leave out the preceding `#` in the name.

If you need to join other types of channels, you need to add a channel configuration in the channel "Purpose" field. The value of this field should be a JSON formatted string containing the following fields:

*  `channelName`: The IRC channel name to use

For example:

```json
{
  "channelName": "!CUCREslack-irc-client"
}
```

**Warning:** Due to an issue in how Slack updates the channel purpose only *after* channel creation, the plain channel name will be joined in IRC on first creation of the channel. You need to leave this channel in Slack and join it again to join the correct IRC channel.

This can also be used if you just want the channel name to show differently within Slack.



#### Sending direct messages

If an IRC users sends you a direct message, a new Slack group chat will be created for your 1-to-1 chat with the IRC user. No action is needed on your part.

If you want to initiate a 1-to-1 chat with an IRC user that has not yet sent you an message, you need to create a new Slack group chat with the nick of the IRC user you want to contact.

#### Additional IRC options

Since the `What I do` field is directly parsed into a JSON object, you can supply additional commands, listed at the [node-irc API documentation](http://node-irc.readthedocs.io/en/latest/API.html#client). For example, if you want to connect with SASL, which you might need to from an AWS server to Freenode, your configuration could look like the following,

```json
{
     "server": "irc.freenode.net", 
     "port": 6697, 
     "userName": "NICKNAME", 
     "nsPassword": "PASSWORD", 
     "sasl": true, 
     "nick": "NICKNAME",
     "password": "PASSWORD", 
     "realName": "MY REAL NAME", 
     "secure": true 
}
```

Which will set `sasl` to true, along with enabling SSL. Of course you need to replace the placeholders above with your own settings.


#### Terminal commands

##### `help`

Prints list of supported commands.

##### `reload`

Reloads event handler code for upgrading without breaking network connections.

##### `loglevel <loglevel>`

Set terminal output log level. Supported log levels are:

*  `silly`
*  `debug`
*  `verbose`
*  `info`
