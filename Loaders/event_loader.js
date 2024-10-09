const
  { readdir } = require('node:fs/promises'),
  { errorHandler } = require('#Utils');

/** @this {Client}*/
module.exports = async function eventLoader() {
  let eventCount = 0;
  for (const file of await readdir('./Events')) {
    if (!file.endsWith('js') || file == 'interactionCreate.js') continue; // InteractionCreate gets loaded after all slash commands are registred

    const
      eventName = file.split('.')[0],

      /** @type {CallableFunction}*/
      event = require(`../Events/${file}`);

    this.on(eventName, async (...args) => {
      const eventArgs = [...args, this].unique();

      try { await event.call(...eventArgs); }
      catch (err) { await errorHandler.call(this, err, eventArgs); }
    });

    log(`Loaded Event ${eventName}`);
    eventCount++;
  }

  log(`Loaded ${eventCount} Events\n`);
};