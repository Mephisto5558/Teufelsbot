const
  { formTypes } = require('discord-dashboard'),
  { ChannelType } = require('discord.js');

module.exports = {
  id: 'chChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  position: 2,

  type: formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement])
}