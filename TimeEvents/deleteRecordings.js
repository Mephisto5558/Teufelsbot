const
  { readdirSync, statSync, unlinkSync } = require('fs'),
  time = new Date(Date.now() - 60000 * 60 * 24 * 14).getTime();

async function delOld(path) {
  for (const file of readdirSync(path, { withFileTypes: true }).filter(e => {
    if (e.isFile()) return time > statSync(`${path}/${e.name}`).mtimeMs;
    delOld(`${path}/${e.name}`);
  })) unlinkSync(`${path}/${file[0]}`);
}

module.exports = {
  time: '0 0 * * *',
  startNow: true,

  onTick: async ({ log, db }) => {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (db.get('botSettings').lastRecDelete == now) return log('Already ran voiceRecord deletion today');
    log('started voiceRecord deletion');

    await delOld('./VoiceRecords');

    db.set('botSettings', db.get('botSettings').fMerge({ lastRecDelete: now }));
    log('Finished voiceRecord deletion');
  }
}
