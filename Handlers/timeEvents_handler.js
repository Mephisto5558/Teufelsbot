const
  { CronJob } = require('cron'),
  { readdirSync } = require('fs');

module.exports = async function timeEventsHandler() {
  if (this.botType == 'dev') return this.log('Disabled timed events due to dev version.');

  await this.functions.ready();

  for (const file of readdirSync('./TimeEvents').filter(e => e.endsWith('.js'))) {
    const job = require(`../TimeEvents/${file}`);

    new CronJob(job.time, _ => job.onTick.call(this), job.onComplete?.bind(this), true, job.timeZone, this, job.startNow, job.utcOffset);
    this.log(`Loaded Cron Job ${file}`);
  }
}