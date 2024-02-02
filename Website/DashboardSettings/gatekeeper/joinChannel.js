const { ChannelType } = require('discord.js');

/**@type {import('@mephisto5558/bot-website').dashboardSetting}*/
module.exports = {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  type: function () { return this.formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]); },
  position: 1
};