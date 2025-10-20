const timeEvents = {
  birthday: require('./birthday'),
  dbCleanup: require('./dbCleanup'),
  fileCleanup: require('./fileCleanup'),
  syncEmojis: require('./syncEmojis'),
  votingReminder: require('./votingReminder')
};

module.exports = timeEvents;