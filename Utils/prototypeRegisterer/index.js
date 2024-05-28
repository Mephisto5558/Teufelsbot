const { runMessages, removeAfkStatus } = require('./message_runMessages.js');

module.exports = {
  Log: require('./Log.js'),
  _patch: require('./message__patch.js'),
  customReply: require('./message_customReply.js'),
  runMessages,
  playAgain: require('./TicTacToe_playAgain.js'),
  utils: { removeAfkStatus }
};