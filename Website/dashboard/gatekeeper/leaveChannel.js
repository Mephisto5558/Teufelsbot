const
  { formTypes } = require('discord-dashboard'),
  { ChannelType } = require('discord.js');

module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  position: 3,

  type: formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement])
}