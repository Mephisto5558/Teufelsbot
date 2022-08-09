const { readdirSync } = require('fs');
let eventCount = 0;

module.exports = client => {
  //InteractionCreate gets loaded when all slash commands are registred
  for (const file of readdirSync('./Events').filter(e => e.endsWith('.js') && e != 'interactionCreate.js')) {
    const eventName = file.split('.')[0];
    const event = require(`../Events/${file}`);

    client.on(eventName, event.bind(null, client));
    client.log(`Loaded Event ${eventName}`);
    eventCount++
  }

  client.log(`Loaded ${eventCount} Events\n`);
}