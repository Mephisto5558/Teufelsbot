const
  { CronJob } = require('cron'),
  { readdir } = require('fs/promises');

module.exports = async function timeEventsHandler() {
  if (this.botType == 'dev') return this.log('Disabled timed events due to dev version.');

  await this.awaitReady();

  for (const file of await readdir('./TimeEvents')) {
    if (!file.endsWith('.js')) continue;
    
    const job = require(`../TimeEvents/${file}`);

    new CronJob(job.time, () => job.onTick.call(this), job.onComplete?.bind(this), true, job.timeZone, this, job.startNow, job.utcOffset);
    this.log(`Loaded Cron Job ${file}`);
  }
};