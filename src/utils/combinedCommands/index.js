/* eslint-disable @eslint-community/eslint-comments/no-use -- This casing is used to better display the commandName. */
/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */
export default {
  ban_kick_mute: require('./ban_kick_mute'),
  lock_unlock: require('./lock_unlock'),
  setupMinigameChannel: require('./setupMinigameChannel')
};