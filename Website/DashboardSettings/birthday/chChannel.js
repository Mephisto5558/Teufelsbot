const { ChannelType } = require('discord.js');

module.exports = {
  id: 'chChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  /**@this WebServer*/
  type: function () { return this.formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]); },
  position: 2
};