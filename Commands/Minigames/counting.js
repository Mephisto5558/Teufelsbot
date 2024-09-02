const
  { Constants } = require('discord.js'),
  { setupMinigameChannel } = require('#Utils/combinedCommands');

module.exports = new MixedCommand({
  permissions: { user: ['ManageChannels'] },
  cooldowns: { channel: 1000 },
  options: [new CommandOption({
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  })],

  run: setupMinigameChannel
});