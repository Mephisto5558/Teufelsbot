import type { CronJob } from './index.ts';

export default {
  time: '',
  startNow: false,
  timeZone: undefined,

  async onTick(this: Client): Promise<void> {

  },

  async onComplete(this: Client): Promise<void> {

  }
} satisfies CronJob;