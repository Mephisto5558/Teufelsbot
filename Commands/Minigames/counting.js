const
  { Constants } = require('discord.js'),
  { setupMinigameChannel } = require('#Utils/combinedCommands');

/** @type {command<'both'>}*/
module.exports = {
  permissions: { user: ['ManageChannels'] },
  cooldowns: { channel: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
};