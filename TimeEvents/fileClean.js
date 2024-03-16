const { readdir, stat, unlink, access, mkdir } = require('node:fs/promises');

/** @param {string}path*/
async function deleteOld(path) {
  try { await access(path); }
  catch { return mkdir(path); }

  const time = new Date(Date.now() - 12_096e5 /* 2 Weeks*/).getTime();
  for (const file of await readdir(path, { withFileTypes: true })) {
    const pathStr = `${path}/${file.name}`;

    if (file.isDirectory()) deleteOld(pathStr);
    else if (time > (await stat(pathStr)).mtimeMs) {
      log.debug(`deleting ${pathStr}`);
      unlink(pathStr);
    }
  }
}

module.exports = {
  time: '00 00 00 01 * *',
  startNow: true,

  /** @this {Client}*/
  onTick: async function () {
    const now = new Date();

    if (this.settings.lastFileClear.toDateString() == now.toDateString()) return void log('Already ran file deletion today');
    log('Started file deletion');

    deleteOld('./VoiceRecords');
    deleteOld('./Logs');

    await this.db.update('botSettings', 'lastFileClear', now);
    log('Finished file deletion');
  }
};