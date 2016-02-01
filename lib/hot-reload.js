'use strict';

function hotReload(context) {
  try {
    context.logger.verbose('Reloader: Reloading self');
    var reload = require('require-reload')(require);
    // Reload self first
    reload('./hot-reload')._internalReload(context);
  } catch (e) {
    context.logger.error('Failed to reload code', e);
  }
}

hotReload._internalReload = function(context) {
  context.logger.verbose('Reloader: Reloading other modules');
  var reload = require('require-reload')(require);
  reload.emptyCache();

  // Reload listener code
  reload('./slack-listener').reload(context);
  reload('./irc-listener').reload(context);
  reload('./terminal-listener').reload(context);

  // Reload handler code
  reload('./slack-handler').reload(context);
  reload('./irc-handler').reload(context);
  reload('./terminal-handler').reload(context);
};

module.exports = hotReload;
