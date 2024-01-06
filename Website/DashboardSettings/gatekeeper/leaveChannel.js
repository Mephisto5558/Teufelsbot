const { ChannelType } = require('discord.js');

module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  /**@this WebServer*/
  type: function () { return this.formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]); },
  position: 3
};