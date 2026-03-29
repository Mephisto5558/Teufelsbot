const
  { Constants } = require('discord.js'),
  { Command, CommandType, CooldownType, OptionType, Permissions } = require('@mephisto5558/command'),
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new Command({
  types: [CommandType.slash, CommandType.prefix],
  permissions: { user: [Permissions.ManageChannels] },
  cooldowns: { [CooldownType.channel]: '1s' },
  options: [{
    name: 'channel',
    type: OptionType.Channel,
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});