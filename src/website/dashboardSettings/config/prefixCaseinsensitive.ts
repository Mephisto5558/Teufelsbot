import type { DashboardSetting } from '#types/locals';

export default {
  id: 'prefixCaseinsensitive',
  name: 'Case insensitive',
  description: 'Make the prefix work for uppercase and lowercase letters',
  type: 'switch',
  position: 3
} satisfies DashboardSetting;