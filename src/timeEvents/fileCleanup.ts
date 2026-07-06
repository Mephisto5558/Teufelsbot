const { access, mkdir, readdir, stat, unlink } = require('node:fs/promises');

/** @param {string} path */
async function deleteOld(path) {
  try { await access(path); }
  catch { return mkdir(path); }

  const thresholdMs = Temporal.Now.instant().subtract({ weeks: 2 }).epochMilliseconds;
  for (const file of await readdir(path, { withFileTypes: true })) {
    const pathStr = `${path}/${file.name}`;

    if (file.isDirectory()) void deleteOld(pathStr);
    else if (thresholdMs > (await stat(pathStr)).mtimeMs) {
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
    const now = Temporal.Now.plainDateISO();

    if (this.settings.timeEvents.lastFileClear?.equals(now)) return void log('Already ran file deletion today');
    log('Started file deletion');

    void deleteOld('./VoiceRecords');
    void deleteOld('./Logs');

    await this.db.update('botSettings', 'timeEvents.lastFileClear', now);
    log('Finished file deletion');
  }
};