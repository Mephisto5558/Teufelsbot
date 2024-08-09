const { Constants } = require('discord.js');

/** @type {command<'both'>}*/
module.exports = {
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'channel', type: 'Channel', channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: 'String' }
  ],

  run: require('#Utils/combinedCommands').lock_unlock
};