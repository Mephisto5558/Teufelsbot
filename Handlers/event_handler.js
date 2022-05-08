const fs = require('fs');
let eventCount = 0;

module.exports = client => {
  //InteractionCreate gets loaded when all slash commands are registred
  fs.readdirSync("./Events")
    .filter(file => file.endsWith(".js") && file != 'interactionCreate.js')
    .forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`../Events/${file}`);

    client.on(eventName, event.bind(null, client));
    client.log(`Loaded Event ${eventName}`);
    eventCount++
  });

  client.log(`Loaded ${eventCount} Events\n`)
}