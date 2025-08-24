const events = {
  debug: require('./debug'),
  error: require('./error'),
  guildCreate: require('./guildCreate'),
  guildDelete: require('./guildDelete'),
  interactionCreate: require('./interactionCreate'),
  messageCreate: require('./messageCreate'),
  messageDelete: require('./messageDelete'),
  messageDeleteBulk: require('./messageDeleteBulk'),
  messageUpdate: require('./messageUpdate'),
  clientReady: require('./clientReady'),
  threadCreate: require('./threadCreate'),
  voiceStateUpdate: require('./voiceStateUpdate')
};

module.exports = events;