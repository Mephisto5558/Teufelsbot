const { filterCommands, commandQuery, categoryQuery, allQuery } = require('./help_utils.js');

module.exports = {
  fact: require('./fact.js'),
  help_filterCommands: filterCommands,
  help_commandQuery: commandQuery,
  help_categoryQuery: categoryQuery,
  help_allQuery: allQuery,
  help: require('./help.js'),
  infoCMDs: require('./infoCMDs.js'),
  joke: require('./joke.js'),
  mgStats_formatTopTen: require('./mgStats_formatTopTen.js'),
  mgstats: require('./mgStats.js'),
  reddit: require('./reddit.js'),
  rps_sendChallenge: require('./rps_sendChallenge.js'),
  rps: require('./rps.js'),
  selfrole: require('./selfrole.js'),
  topic: require('./topic.js')
};