const { readdir, stat, unlink, access, mkdir } = require('fs/promises');

/**@param {string}path*/
async function deleteOld(path) {
  try { await access(path); } catch { return mkdir(path); }

  const time = new Date(Date.now() - 12096e5 /*2 Weeks*/).getTime();
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

  /**@this Client*/
  onTick: async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (this.settings.lastFileClear == now) return void log('Already ran file deletion today');
    log('started file deletion');

    deleteOld('./VoiceRecords');
    deleteOld('./Logs');

    await this.db.update('botSettings', 'lastFileClear', now);
    log('Finished file deletion');
  }
};