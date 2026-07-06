import { Constants } from 'discord.js';

import type { DashboardSetting } from '#types/locals';

export default {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 3
} satisfies DashboardSetting;