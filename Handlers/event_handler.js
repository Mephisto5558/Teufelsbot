const { readdir } = require('fs/promises');

/**@this Client*/
module.exports = async function eventHandler() {
  let eventCount = 0;
  for (const file of await readdir('./Events')) {
    if (!file.endsWith('js') || file == 'interactionCreate.js') continue; //InteractionCreate gets loaded after all slash commands are registred

    const eventName = file.split('.')[0];
    this.on(eventName, (...args) => args.length == 1 && args[0] instanceof this.constructor ? require(`../Events/${file}`).call(this) : require(`../Events/${file}`).call(...args, this));
    log(`Loaded Event ${eventName}`);
    eventCount++;
  }

  log(`Loaded ${eventCount} Events\n`);
};