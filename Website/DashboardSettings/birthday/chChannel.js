const { ChannelType } = require('discord.js');

/** @type {import('@mephisto5558/bot-website').dashboardSetting}*/
module.exports = {
  id: 'chChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  type: function () { return this.formTypes.channelsSelect(false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]); },
  position: 2
};