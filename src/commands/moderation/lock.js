const
  { Constants } = require('discord.js'),
  { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  permissions: { [PermissionType.Client]: [Permission.ManageRoles], [PermissionType.User]: [Permission.ManageRoles] },
  cooldowns: { [CooldownType.User]: '1s' },
  options: [
    { name: 'channel', type: OptionType.Channel, channelTypes: Constants.GuildTextBasedChannelTypes },
    { name: 'reason', type: OptionType.String }
  ],

  run: require('#utils/combinedCommands').lock_unlock
});