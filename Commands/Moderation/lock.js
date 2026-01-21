const
  { Constants } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter;

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  permissions: { client: [Permissions.ManageRoles], user: [Permissions.ManageRoles] },
  cooldowns: { user: msInSecond },
  options: [
    { name: 'channel', type: 'Channel', channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: 'String' }
  ],

  run: require('#Utils/combinedCommands').lock_unlock
});