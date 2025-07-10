const
  { readdir, stat, unlink, access, mkdir } = require('node:fs/promises'),
  { secsInWeek, msInSecond } = require('#Utils').timeFormatter;

/** @param {string} path */
async function deleteOld(path) {
  try { await access(path); }
  catch { return mkdir(path); }

  const time = new Date(Date.now() - secsInWeek * msInSecond * 2).getTime();
  for (const file of await readdir(path, { withFileTypes: true })) {
    const pathStr = `${path}/${file.name}`;

    if (file.isDirectory()) void deleteOld(pathStr);
    else if (time > (await stat(pathStr)).mtimeMs) {
      log.debug(`deleting ${pathStr}`);
      void unlink(pathStr);
    }
  }
}

module.exports = {
  time: '00 00 00 01 * *',
  startNow: false,

  /** @this {Client} */
  async onTick() {
    const now = new Date();

    if (this.settings.timeEvents.lastFileClear?.toDateString() == now.toDateString()) return void log('Already ran file deletion today');
    log('Started file deletion');

    void deleteOld('./VoiceRecords');
    void deleteOld('./Logs');

    await this.db.update('botSettings', 'timeEvents.lastFileClear', now);
    log('Finished file deletion');
  }
};