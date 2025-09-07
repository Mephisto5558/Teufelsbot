const
  { CronJob } = require('cron'),
  jobs = require('../TimeEvents');

/** @this {Client} */
module.exports = async function timeEventsHandler() {
  if (this.botType == 'dev') return void log('Disabled timed events due to dev version.');

  await this.awaitReady();

  for (const [name, job] of Object.entries(jobs)) {
    void new CronJob(job.time, job.onTick.bind(this), undefined, true, job.timeZone, this, job.startNow, job.utcOffset);
    log(`Loaded Cron Job ${name}`);
  }

  log(`Loaded ${jobs.__count__} Cron Jobs\n`);
};