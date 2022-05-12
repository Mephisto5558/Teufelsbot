const fs = require('fs');

module.exports = async client => {

  fs.rm('./Logs/debug.log', { force: true }, err => {
    if(err) console.error(err)
  })

  fs.readFile('./Logs/startCount.log', (err, data) => {
    if(err) return console.error(err);
    let fileContent = parseInt(data)
    fileContent++
    fs.writeFile('./Logs/startCount.log', fileContent.toString(), err => {
      if(err) console.error(err)
    })
  });

  client.on('debug', debug => {
    if(
      debug.includes('Sending a heartbeat.') ||
      debug.includes('Heartbeat acknowledged')
    ) return;

    let date = new Date();
    let timestamp = `[${
      ('0' + date.getHours()).slice(-2) }:${
      ('0' + date.getMinutes()).slice(-2) }:${
      ('0' + date.getSeconds()).slice(-2)
    }] `;

    fs.appendFileSync('./Logs/debug.log', timestamp + debug + `\n`);
    if(debug.includes('Hit a 429')) {
      console.error('Hit a 429 while executing a request');
      process.kill(1);
    }
  })

}