const fs = require('fs');

module.exports = client => {
  let eventCount = 0;

  fs.readdirSync("./Events").filter(file => file.endsWith(".js")).forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`../Events/${file}`);

    client.on(eventName, event.bind(null, client));
    console.log(`Loaded Event ${eventName}`);
    eventCount++
  });

  console.log(`Loaded ${eventCount} Events\n`)
}