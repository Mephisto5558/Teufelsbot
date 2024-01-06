const { ChannelType } = require('discord.js');

module.exports = {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  /**@this WebServer*/
  type: function () { return this.formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]); },
  position: 1
};