/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */
module.exports = {
  ban_kick_mute: require('./ban_kick_mute.js'),
  lock_unlock: require('./lock_unlock.js'),
  setupMinigameChannel: require('./setupMinigameChannel.js')
};