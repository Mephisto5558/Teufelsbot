const
  { CronJob } = require('cron'),
  { readdir } = require('node:fs/promises');

/** @this {Client}*/
module.exports = async function timeEventsLoader() {
  if (this.botType == 'dev') return void log('Disabled timed events due to dev version.');

  await this.awaitReady();

  for (const file of await readdir('./TimeEvents')) {
    if (!file.endsWith('.js')) continue;

    const job = require(`../TimeEvents/${file}`);

    void new CronJob(job.time, job.onTick.bind(this), job.onComplete?.bind(this), true, job.timeZone, this, job.startNow, job.utcOffset);
    log(`Loaded Cron Job ${file}`);
  }
};