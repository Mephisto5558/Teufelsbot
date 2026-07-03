/** @import { DashboardSetting } from '#types/locals' */

const { Constants } = require('discord.js');

/** @type {DashboardSetting} */
module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 3
};