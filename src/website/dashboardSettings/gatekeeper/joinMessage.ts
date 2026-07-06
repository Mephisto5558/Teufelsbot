import type { DashboardSetting } from '#types/locals';

export default {
  id: 'joinMessage',
  name: 'Welcome Message',
  description: 'Set your own welcome message or embed!',
  type: 'embedBuilder',
  position: 2
} satisfies DashboardSetting;