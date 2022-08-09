const { formTypes } = require('discord-dashboard');
const { ChannelType } = require('discord.js');

module.exports = {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  position: 1,

  type: formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildNews])
}