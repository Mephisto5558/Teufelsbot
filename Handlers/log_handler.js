const
  fs = require('fs'),
  date = new Date().toLocaleDateString('en').replace(/\//g, '-'),
  startCount = parseInt(fs.readFileSync('./Logs/startCount.log') || 0) + 1,
  getTime = _ => new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false }),
  writeLogFile = (type, ...data) => fs.appendFileSync(`./Logs/${date}_${type}.log`, `[${getTime()}] ${data.join(' ')}\n`);

fs.writeFileSync('./Logs/startCount.log', startCount.toString());

module.exports = async client => {
  client.log = (...data) => {
    console.info(`[${getTime()}] ${data.join(' ')}`);
    writeLogFile('log', ...data);
  }

  client.error = (...data) => {
    console.error(errorColor, `[${getTime()}] ${data.join(' ')}`);
    writeLogFile('log', ...data);
    writeLogFile('error', ...data);
  }

  client
    .on('debug', debug => {
      if (debug.includes('Sending a heartbeat.') || debug.includes('Heartbeat acknowledged')) return;
      if (debug.includes('Provided token:')) debug = 'Provided token: (CENSORED)';

      writeLogFile('debug', debug);

      if (debug.includes('Hit a 429')) {
        if (!client.isReady()) {
          client.error(errorColor, 'Hit a 429 while trying to login. Restarting shell.');
          process.kill(1);
        }
        else client.error(errorColor, 'Hit a 429 while trying to execute a request');
      }
    })
    .on('warn', warn => writeLogFile('warn', warn))
    .on('error', error => writeLogFile('error', error));
}