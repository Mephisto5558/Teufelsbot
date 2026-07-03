/** @import { DashboardSetting } from '../../../types/locals' */

const { Constants } = require('discord.js');

/** @type {DashboardSetting} */
module.exports = {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 1
};