import type { DashboardSetting } from '#types/locals';

export default {
  id: 'dmMsg',
  name: 'DM Message',
  description: 'The message the member will get, if enabled',
  type: 'embedBuilder',
  position: 5
} satisfies DashboardSetting;