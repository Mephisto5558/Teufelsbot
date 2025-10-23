/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */
const
  { allQuery, categoryQuery, commandQuery, getCommandCategories, getCommands } = require('./help_utils'),
  { recordControls, startRecording } = require('./record_manage'),
  { createProxy, hasPerm } = require('./serverbackup_utils');

module.exports = {
  advice: require('./advice'),
  chatgpt: require('./chatgpt'),
  chatgpt_fetchAPI: require('./chatgpt_fetchAPI'),
  fact: require('./fact'),
  help_commandQuery: commandQuery,
  help_categoryQuery: categoryQuery,
  help_getCommands: getCommands,
  help_getCommandCategories: getCommandCategories,
  help_allQuery: allQuery,
  help: require('./help'),
  infoCMDs: require('./infoCMDs'),
  joke: require('./joke'),
  mgStats_formatTop: require('./mgStats_formatTop'),
  mgstats: require('./mgStats'),
  record_startRecording: startRecording,
  record_recordControls: recordControls,
  record: require('./record'),
  reddit: require('./reddit'),
  rps_sendChallenge: require('./rps_sendChallenge'),
  rps: require('./rps'),
  serverbackup_hasPerm: hasPerm,
  serverbackup_createProxy: createProxy,
  serverbackup: require('./serverbackup'),
  topic: require('./topic'),
  votingReminder: require('./votingReminder')
};