const
  { Constants } = require('discord.js'),
  { Command, CommandType, CooldownType, OptionType, PermissionType, Permission } = require('@mephisto5558/command'),
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  permissions: { [PermissionType.User]: [Permission.ManageChannels] },
  cooldowns: { [CooldownType.Channel]: '1s' },
  options: [{
    name: 'channel',
    type: OptionType.Channel,
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});