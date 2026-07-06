import { LogLevel } from '#utils/prototypeRegisterer/Log.ts';
import type { DiscordEvent } from './index.ts';

/** 'this' is always an object, never a primitive.  */
export default (function debug(client) {
  if (this.includes('Sending a heartbeat.') || this.includes('Heartbeat acknowledged')) return;

  log.logToAll({ level: LogLevel.debug, type: 'API' }, this.toString());
  if (this.includes('Hit a 429')) {
    if (client.isReady()) return void log.error('Hit a 429 while trying to execute a request');

    log.error('Hit a 429 while trying to login. Exiting.');
    process.kill(1);
  }
}) as DiscordEvent<'debug'>;