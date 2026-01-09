const
  { Constants } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter;

module.exports = new Command({
  types: ['slash', 'prefix'],
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: msInSecond },
  options: [
    { name: 'channel', type: 'Channel', channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: 'String' }
  ],

  run: require('#Utils/combinedCommands').lock_unlock
});