'use strict';

function hotReload(context) {
  try {
    context.logger.info('Reloading event handlers');
    var reload = require('require-reload')(require);
    reload.emptyCache();

    // Reload handler code
    var SlackHandler = reload('./slack-handler');
    var IrcHandler = reload('./irc-handler');
    var TerminalHandler = reload('./terminal-handler');

    var slackHandler = new SlackHandler();
    var ircHandler = new IrcHandler();
    var terminalHandler = new TerminalHandler();

    // Assign handlers
    slackHandler.handle(context);
    context.slack.handler = slackHandler;

    ircHandler.handle(context);
    context.irc.handler = ircHandler;

    terminalHandler.handle(context);
    context.terminal.handler = terminalHandler;
  } catch (e) {
    context.logger.error('Failed to reload code: %s', e);
  }
}

module.exports = hotReload;
