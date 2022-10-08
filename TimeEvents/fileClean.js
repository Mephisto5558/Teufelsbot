const { readdirSync, statSync, unlinkSync } = require('fs');

function deleteOld(path) {
  const time = new Date(Date.now() - 60000 * 60 * 24 * 14).getTime();
  for (const file of readdirSync(path, { withFileTypes: true })) {
    if (file.isDirectory()) deleteOld(`${path}/${file.name}`);
    else if (time > statSync(`${path}/${file.name}`).mtimeMs) unlinkSync(`${path}/${file.name}`);
  }
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: true,

  onTick: async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (this.db.get('botSettings').lastFileClear == now) return this.log('Already ran file deletion today');
    this.log('started file deletion');

    deleteOld('./VoiceRecords');
    deleteOld('./Logs');

    this.db.set('botSettings', this.db.get('botSettings').fMerge({ lastFileClear: now }));
    this.log('Finished file deletion');
  }
};