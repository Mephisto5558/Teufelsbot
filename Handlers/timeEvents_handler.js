const
  { CronJob } = require('cron'),
  { readdir } = require('fs/promises');

/**@this import('discord.js').Client*/
module.exports = async function timeEventsHandler() {
  if (this.botType == 'dev') return log('Disabled timed events due to dev version.');

  await this.awaitReady();

  for (const file of await readdir('./TimeEvents')) {
    if (!file.endsWith('.js')) continue;

    const job = require(`../TimeEvents/${file}`);

    void new CronJob(job.time, () => job.onTick.call(this), job.onComplete?.bind(this), true, job.timeZone, this, job.startNow, job.utcOffset);
    log(`Loaded Cron Job ${file}`);
  }
};