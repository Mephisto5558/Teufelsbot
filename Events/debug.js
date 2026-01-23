/**
 * @this {string & StringConstructor}
 * @param {Client<boolean>} client
 * 'this' is always an object, never a primitive. * */
module.exports = function debug(client) {
  if (this.includes('Sending a heartbeat.') || this.includes('Heartbeat acknowledged')) return;

  log._log({ file: 'debug', type: 'API' }, this.toString());
  if (this.includes('Hit a 429')) {
    if (client.isReady()) return void log.error('Hit a 429 while trying to execute a request');

    log.error('Hit a 429 while trying to login. Exiting.');
    process.kill(1);
  }
};