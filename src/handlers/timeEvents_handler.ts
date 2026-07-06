import { CronJob } from 'cron';
import * as jobs from '../timeEvents/index.ts';

export default async function timeEventsHandler(this: Client): Promise<void> {
  if (this.botType == 'dev') return void log('Disabled timed events due to dev version.');

  await this.awaitReady();

  for (const [name, job] of Object.entries(jobs)) {
    void new CronJob(job.time, job.onTick.bind(this), undefined, true, undefined, this, job.startNow);
    log(`Loaded Cron Job ${name}`);
  }

  log(`Loaded ${jobs.__count__} cronjobs\n`);
}