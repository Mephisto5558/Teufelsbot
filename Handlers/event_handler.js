const { readdir } = require('fs/promises');

module.exports = async function eventHandler() {
  let eventCount = 0;
  for (const file of await readdir('./Events')) {
    if (!file.endsWith('js') || file == 'interactionCreate.js') continue; //InteractionCreate gets loaded when all slash commands are registred

    const eventName = file.split('.')[0];
    this.on(eventName, args => require(`../Events/${file}`).call(...[].concat(args ?? this)));
    this.log(`Loaded Event ${eventName}`);
    eventCount++;
  }

  this.log(`Loaded ${eventCount} Events\n`);
};