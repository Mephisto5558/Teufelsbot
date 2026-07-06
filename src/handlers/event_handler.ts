const
  { errorHandler } = require('#utils'),
  events = require('../events');

/** @this {Client} */
module.exports = function eventHandler() {
  for (const [name, event] of Object.entries(events)) {
    /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
    this.on(name, async (...args) => {
      const eventArgs = [...args, this].unique();

      try { await event.call(...eventArgs); }
      catch (err) { await errorHandler.call(this, err, eventArgs); }
    });

    log(`Loaded event ${name}`);
  }

  log(`Loaded ${events.__count__} events\n`);
};