const
  { Constants } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter;

/** @type {command<'both'>}*/
module.exports = {
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'channel', type: 'Channel', channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: 'String' }
  ],

  run: require('#Utils/combinedCommands').lock_unlock
};