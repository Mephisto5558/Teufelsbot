import type { DashboardSetting } from '#types/locals';

export default {
  id: 'leaveMessage',
  name: 'Leave Message',
  description: 'Set your own leave message or embed!',
  type: 'embedBuilder',
  position: 4
} satisfies DashboardSetting;