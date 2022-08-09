const
  { CronJob } = require('cron'),
  { readdirSync } = require('fs');

module.exports = async client => {
  if (client.botType == 'dev') return client.log('Disabled timed events due to dev version.');

  await client.functions.ready(client);

  for (const file of readdirSync('./TimeEvents').filter(e => e.endsWith('.js'))) {
    const job = require(`../TimeEvents/${file}`);

    new CronJob(job.time, job.onTick(client), job.onComplete, true, job.timeZone, job.context, job.startNow, job.utcOffset);
    client.log(`Loaded Cron Job ${file}`);
  }
}