const { Constants } = require('discord.js');

/** @type {import('@mephisto5558/bot-website').dashboardSetting}*/
module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  type: function () { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 3
};