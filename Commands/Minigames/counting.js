const
  { Constants } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter,
  { setupMinigameChannel } = require('#Utils/combinedCommands');

/** @type {command<'both'>} */
module.exports = {
  permissions: { user: ['ManageChannels'] },
  cooldowns: { channel: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: setupMinigameChannel
};