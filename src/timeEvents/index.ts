import type { CronJobParams } from 'cron';

export { default as birthday } from './birthday.ts';
export { default as dbCleanup } from './dbCleanup.ts';
export { default as fileCleanup } from './fileCleanup.ts';
export { default as syncEmojis } from './syncEmojis.ts';
export { default as votingReminder } from './votingReminder.ts';

export type CronJob = {
  time: Exclude<CronJobParams['cronTime'], string>
    | `${number | '*'} ${number | '*'} ${number | '*'} ${number | '*'} ${number | '*'} ${number | '*'}`;
  onTick(this: Client): Promise<void>;
  startNow: CronJobParams['start'];
};