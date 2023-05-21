const
  { appendFile } = require('fs/promises'),
  date = new Date().toLocaleDateString('en').replaceAll('/', '-'),
  errorColor = '\x1b[1;31m%s\x1b[0m',
  getTime = () => new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false }),
  writeLogFile = (type, ...data) => appendFile(`./Logs/${date}_${type}.log`, `[${getTime()}] ${data.join(' ')}\n`);

module.exports = async function logHandler() {
  this
    .on('debug', debug => {
      if (debug.includes('Sending a heartbeat.') || debug.includes('Heartbeat acknowledged')) return;

      for (const match of /(?:Session |token: )(\w*)/gi.exec(debug)?.slice(1) || []) debug = debug.replace(match, '(CENSORED)');

      writeLogFile('debug', debug);

      if (debug.includes('Hit a 429')) {
        if (!this.isReady()) {
          this.error(errorColor, 'Hit a 429 while trying to login. Restarting shell.');
          process.kill(1);
        }
        else this.error(errorColor, 'Hit a 429 while trying to execute a request');
      }
    })
    .on('warn', warn => writeLogFile('warn', warn));
};