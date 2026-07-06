const { Events } = require('discord.js');

const events = {
  [Events.Debug]: require('./debug'),
  [Events.Error]: require('./error'),
  [Events.GuildCreate]: require('./guildCreate'),
  [Events.GuildDelete]: require('./guildDelete'),
  [Events.InteractionCreate]: require('./interactionCreate'),
  [Events.MessageCreate]: require('./messageCreate'),
  [Events.MessageDelete]: require('./messageDelete'),
  [Events.MessageBulkDelete]: require('./messageDeleteBulk'),
  [Events.MessageUpdate]: require('./messageUpdate'),
  [Events.ClientReady]: require('./clientReady'),
  [Events.ThreadCreate]: require('./threadCreate'),
  [Events.VoiceStateUpdate]: require('./voiceStateUpdate')
};

module.exports = events;