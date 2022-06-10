const fs = require('fs');
const errorColor = require('chalk').bold.red;

module.exports = async client => {

  fs.rm('./Logs/debug.log', { force: true }, err => {
    if (err) throw err;
  })

  fs.readFile('./Logs/startCount.log', (err, data) => {
    if (err) throw err;
    const startCount = parseInt(data) + 1

    fs.writeFile('./Logs/startCount.log', startCount.toString(), err => {
      if (err) throw err;
    })
  });

  client.on('debug', debug => {
    if (
      debug.includes('Sending a heartbeat.') ||
      debug.includes('Heartbeat acknowledged')
    ) return;

    const timestamp = new Date().toLocaleString('en', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    fs.appendFileSync('./Logs/debug.log', `[${timestamp}] ${debug}\n`);
    if (debug.includes('Hit a 429')) {
      if (!client.isReady()) {
        console.error(errorColor('Hit a 429 while trying to login. Restarting shell.'));
        process.kill(1);
      }
      else console.error(errorColor('Hit a 429 while trying to execute a request'));
    }
  });

}