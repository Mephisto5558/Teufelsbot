const
  fs = require('fs'),
  date = new Date().toLocaleDateString('en').replace(/\//g, '-'),
  startCount = parseInt(fs.readFileSync('./Logs/startCount.log') || 0) + 1,
  writeLogFile = (type, data) => {
    const time = new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false });
    fs.appendFileSync(`./Logs/${date}_${type}.log`, `[${time}] ${data}\n`);
  }

fs.writeFileSync('./Logs/startCount.log', startCount.toString());

module.exports = async client => {
  client.log = (...data) => {
    const time = new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false });
    console.info(`[${time}] ${data}`);
    writeLogFile('log', data);
  }

  client
    .on('debug', debug => {
      if (debug.includes('Sending a heartbeat.') || debug.includes('Heartbeat acknowledged')) return;

      writeLogFile('debug', debug);

      if (debug.includes('Hit a 429')) {
        if (!client.isReady()) {
          console.error(errorColor, 'Hit a 429 while trying to login. Restarting shell.');
          process.kill(1);
        }
        else console.error(errorColor, 'Hit a 429 while trying to execute a request');
      }
    })
    .on('warn', warn => writeLogFile('warn', warn))
    .on('error', error => writeLogFile('error', error));
}