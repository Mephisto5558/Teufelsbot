import type { DashboardSetting } from '#types/locals';

export default {
  id: 'dmEnable',
  name: 'Enable dm messages',
  description: 'DM the member on their birthday with a custom message',
  type: 'switch',
  position: 4
} satisfies DashboardSetting;