const
  { Constants } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter,
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new Command({
  types: ['slash', 'prefix'],
  permissions: { user: ['ManageChannels'] },
  cooldowns: { channel: msInSecond },
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
});