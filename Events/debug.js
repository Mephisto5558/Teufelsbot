/**@this {String}*/
module.exports = async function debug() {
  let debug = this.toString();

  if (debug.includes('Sending a heartbeat.') || debug.includes('Heartbeat acknowledged')) return;

  for (const match of /(?:Session |token: )(\w*)/gi.exec(debug)?.slice(1) || []) debug = debug.replace(match, '(CENSORED)');

  log.setType('API').debug(debug).setType();
  if (debug.includes('Hit a 429')) {
    if (!this.isReady()) {
      log.error('Hit a 429 while trying to login. Restarting shell.');
      process.kill(1);
    }
    else log.error('Hit a 429 while trying to execute a request');
  }
};