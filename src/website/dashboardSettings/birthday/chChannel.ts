import { Constants } from 'discord.js';

import type { DashboardSetting } from '#types/locals';

export default {
  id: 'chChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  type() { return this.formTypes.channelsSelect(false, Constants.GuildTextBasedChannelTypes); },
  position: 2
} satisfies DashboardSetting;