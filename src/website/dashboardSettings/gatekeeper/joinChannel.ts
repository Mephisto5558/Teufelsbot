import { Constants } from 'discord.js';

import type { DashboardSetting } from '#types/locals';

export default {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 1
} satisfies DashboardSetting;