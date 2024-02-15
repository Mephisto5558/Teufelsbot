const tokenRegex = /(?:Session |token: )(\w*)/gi;

/** @this {StringConstructor}*/
module.exports = function debug() {
  let debugStr = this.toString();

  if (debugStr.includes('Sending a heartbeat.') || debugStr.includes('Heartbeat acknowledged')) return;

  for (const match of tokenRegex.exec(debugStr)?.slice(1) ?? []) debugStr = debugStr.replace(match, '(CENSORED)');

  log.setType('API').debug(debugStr).setType();
  if (debugStr.includes('Hit a 429')) {
    if (this.isReady()) return void log.error('Hit a 429 while trying to execute a request');

    log.error('Hit a 429 while trying to login. Exiting.');
    process.kill(1);
  }
};