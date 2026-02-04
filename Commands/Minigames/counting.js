const
  { Constants } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  permissions: { user: [Permissions.ManageChannels] },
  cooldowns: { channel: '1s' },
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});