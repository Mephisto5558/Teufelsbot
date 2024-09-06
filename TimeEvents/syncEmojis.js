const
  { Client } = require('discord.js'),
  config = require('../env.json'),

  /** @type {Record<string, Client | undefined>} */
  sessions = {};

/**
 * @param {string} env
 * @param {string} token
 * @returns {Promise<Client<true>>}*/
async function getClient(env, token) {
  const client = sessions[env] ?? new Client({ intents: [] });
  if (!sessions[env]) {
    sessions[env] = client;

    await client.login(token);
    await client.application.fetch();
    await client.application.emojis.fetch();

    log.debug(`Logged into "${client.application.name}" (${env})`);
  }

  return client;
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: false, // Getting ran even before logging into the client

  /** @this {Client | void}*/
  onTick: async function () {
    if (this instanceof Client && this.isReady() && !sessions[this.botType]) {
      sessions[this.botType] = this;

      if (!this.application.name) await this.application.fetch();
      if (!this.application.emojis.cache.size) await this.application.emojis.fetch();
    }

    log('Syncing emojis between clients...').debug('Syncing emojis between clients...');
    const clients = Object.entries(config).map(([k, v]) => [k, v.keys.token]).filter(([, v]) => v);

    for (const [env1, token1] of clients) {
      const client1 = await getClient(env1, token1);

      for (const [env2, token2] of clients) {
        if (env1 == env2) continue;

        const client2 = await getClient(env2, token2);

        for (const [, emoji] of client2.application.emojis.cache) {
          if (client1.application.emojis.cache.some(e => e.name == emoji.name)) continue;

          await client1.application.emojis.create({ name: emoji.name, attachment: emoji.imageURL({ extension: emoji.animated ? 'gif' : undefined }) });
          log.debug(`Created emoji "${emoji.name}" on client "${client1.application.name}" from "${client2.application.name}"`);
        }
      }
    }

    log('Done syncing emojis.').debug('Done syncing emojis.');
  }
};