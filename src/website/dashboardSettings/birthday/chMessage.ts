import type { DashboardSetting } from '#types/locals';

export default {
  id: 'chMsg',
  name: 'Announcement Message',
  description: "The message to send on the user's birthday",
  type: 'embedBuilder',
  position: 3
} satisfies DashboardSetting;