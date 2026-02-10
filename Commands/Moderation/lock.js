const
  { Constants } = require('discord.js'),
  { Command, OptionType, Permissions, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  permissions: { client: [Permissions.ManageRoles], user: [Permissions.ManageRoles] },
  cooldowns: { user: '1s' },
  options: [
    { name: 'channel', type: OptionType.Channel, channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: OptionType.String }
  ],

  run: require('#Utils/combinedCommands').lock_unlock
});