const
  { Constants } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter,
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  permissions: { user: [Permissions.ManageChannels] },
  cooldowns: { channel: msInSecond },
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});