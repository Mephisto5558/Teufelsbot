import { access, mkdir, readdir, stat, unlink } from 'node:fs/promises';
import type { CronJob } from './index.ts';

async function deleteOld(path: string): Promise<void> {
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

export default {
  time: '00 00 00 01 * *',
  startNow: false,

  async onTick(): Promise<void> {
    const now = Temporal.Now.plainDateISO();

    if (this.settings.timeEvents.lastFileClear?.equals(now)) return void log('Already ran file deletion today');
    log('Started file deletion');

    void deleteOld('./VoiceRecords');
    void deleteOld('./Logs');

    await this.db.update('botSettings', 'timeEvents.lastFileClear', now);
    log('Finished file deletion');
  }
} satisfies CronJob;