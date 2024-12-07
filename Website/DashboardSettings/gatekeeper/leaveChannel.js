const { Constants } = require('discord.js');

/** @type {import('@mephisto5558/bot-website').dashboardSetting}*/
module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 3 /* eslint-disable-line @typescript-eslint/no-magic-numbers */
};